"""
tryon_app/views.py

All API views for the Virtual Fashion Try-On backend.

Fixes applied (v2):
  - CUDA → CPU: call run_vitonhd_cpu.py wrapper instead of test.py directly
  - openpose-img/ folder now copied (datasets.py line 138 needs rendered PNG)
  - Correct agnostic folder name: image-parse-agnostic-v3.2  (not image-parse-agnostic)
  - dataset_list passed as RELATIVE filename (not absolute path) per datasets.py line 26
  - Cloth-mask auto-generated from cloth image using Pillow when dataset has none
  - torchgeometry checkpoint loading uses torch.load with weights_only=False
"""
import logging
import os
import shutil
import subprocess
import sys
import uuid
from pathlib import Path

import numpy as np
from PIL import Image

from django.conf import settings
from django.contrib.auth import authenticate
from django.utils import timezone
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .models import OTPRecord, User
from .otp_utils import generate_otp, hash_otp, send_otp_email
from .serializers import (
    LoginSerializer,
    OTPVerifySerializer,
    RegisterSerializer,
    UserSerializer,
)

logger = logging.getLogger(__name__)

ALLOWED_IMAGE_EXTENSIONS = {'.jpg', '.jpeg', '.png'}


# ═══════════════════════════════════════════════════════════════════════════════
# 1. REGISTER — POST /api/register/
# ═══════════════════════════════════════════════════════════════════════════════

class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data
        email = data['email']

        otp = generate_otp()
        otp_hashed = hash_otp(otp)

        from django.contrib.auth.hashers import make_password
        hashed_pw = make_password(data['password'])

        OTPRecord.objects.filter(email=email).delete()
        OTPRecord.objects.create(
            email=email,
            otp_hash=otp_hashed,
            full_name=data.get('full_name', ''),
            phone=data.get('phone', ''),
            hashed_password=hashed_pw,
        )

        try:
            send_otp_email(email, otp)
        except Exception as exc:
            logger.error('Failed to send OTP email to %s: %s', email, exc)
            return Response(
                {'error': 'Failed to send OTP email. Please try again.'},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        return Response(
            {'message': f'OTP sent to {email}. Please verify to complete registration.'},
            status=status.HTTP_200_OK,
        )


# ═══════════════════════════════════════════════════════════════════════════════
# 2. VERIFY OTP — POST /api/verify-otp/
# ═══════════════════════════════════════════════════════════════════════════════

class VerifyOTPView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = OTPVerifySerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data
        email = data['email']
        otp_input = data['otp']

        try:
            record = OTPRecord.objects.get(email=email)
        except OTPRecord.DoesNotExist:
            return Response(
                {'error': 'No pending OTP registration for this email. Please register first.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        expiry_seconds = getattr(settings, 'OTP_EXPIRY_SECONDS', 600)
        elapsed = (timezone.now() - record.created_at).total_seconds()
        if elapsed > expiry_seconds:
            record.delete()
            return Response(
                {'error': 'OTP has expired. Please register again to receive a new OTP.'},
                status=status.HTTP_410_GONE,
            )

        if hash_otp(otp_input) != record.otp_hash:
            return Response(
                {'error': 'Invalid OTP. Please check the code sent to your email.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = User(
            email=email,
            full_name=record.full_name,
            phone=record.phone,
            is_verified=True,
            is_active=True,
        )
        user.password = record.hashed_password
        user.save()
        record.delete()

        return Response(
            {'message': 'Account created successfully. You can now log in.'},
            status=status.HTTP_201_CREATED,
        )


# ═══════════════════════════════════════════════════════════════════════════════
# 3. LOGIN — POST /api/login/
# ═══════════════════════════════════════════════════════════════════════════════

class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        email = serializer.validated_data['email']
        password = serializer.validated_data['password']

        user = authenticate(request, username=email, password=password)
        if user is None:
            return Response(
                {'error': 'Invalid email or password.'},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        if not user.is_verified:
            return Response(
                {'error': 'Account email is not verified. Please complete OTP verification.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        refresh = RefreshToken.for_user(user)
        return Response(
            {
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'user': UserSerializer(user).data,
            },
            status=status.HTTP_200_OK,
        )


# ═══════════════════════════════════════════════════════════════════════════════
# 4. TRY-ON — POST /api/tryon/  (JWT protected)
# ═══════════════════════════════════════════════════════════════════════════════

def _validate_image_file(uploaded_file, field_name: str):
    ext = Path(uploaded_file.name).suffix.lower()
    if ext not in ALLOWED_IMAGE_EXTENSIONS:
        return f'{field_name} must be a JPG or PNG file. Received: {uploaded_file.name}'
    max_size = getattr(settings, 'MAX_UPLOAD_SIZE', 10 * 1024 * 1024)
    if uploaded_file.size > max_size:
        mb = max_size // (1024 * 1024)
        return f'{field_name} exceeds the maximum allowed size of {mb} MB.'
    return None


def _save_upload(uploaded_file, directory: Path) -> Path:
    directory.mkdir(parents=True, exist_ok=True)
    dest = directory / uploaded_file.name
    with open(dest, 'wb') as fh:
        for chunk in uploaded_file.chunks():
            fh.write(chunk)
    return dest


def _generate_cloth_mask(cloth_path: Path, mask_path: Path) -> None:
    """
    Auto-generate a binary cloth mask when the dataset does not provide one.
    Strategy: threshold the cloth on a white background — pixels that are NOT
    near-white are considered cloth (foreground → white in mask).
    Result is saved as a grayscale PNG.
    """
    img = Image.open(cloth_path).convert('RGB')
    arr = np.array(img, dtype=np.float32)

    # White background threshold: all channels > 240
    background = (arr[:, :, 0] > 240) & (arr[:, :, 1] > 240) & (arr[:, :, 2] > 240)
    mask_arr = np.where(background, 0, 255).astype(np.uint8)

    mask_img = Image.fromarray(mask_arr, mode='L')
    mask_img.save(str(mask_path))
    logger.debug('Auto-generated cloth mask: %s', mask_path)


def _build_temp_dataset(
    session_id: str,
    person_name: str,
    cloth_name: str,
    cloth_src_path: Path,
) -> Path:
    """
    Build a self-contained VITON-HD dataset folder under media/temp/<session_id>/.

    Exact folder layout required by datasets.py:
        <temp_root>/
            test/
                image/
                image-parse/
                image-parse-agnostic-v3.2/     ← correct folder name
                openpose-img/                   ← rendered pose PNG (NEW)
                openpose-json/
                cloth/
                cloth-mask/
                agnostic-v3.2/
            test_pairs.txt                      ← relative filename, at temp_root level

    IMPORTANT path fix: datasets.py line 26 does:
        open(osp.join(opt.dataset_dir, opt.dataset_list))
    So dataset_list must be just "test_pairs.txt" and dataset_dir must be temp_root.
    """
    vitonhd_dir: Path = settings.VITONHD_DIR
    dataset_dir: Path = settings.VITONHD_DATASET_DIR
    temp_root = Path(settings.MEDIA_ROOT) / 'temp' / session_id
    test_folder = temp_root / 'test'

    # Create all required subdirectories
    required_subdirs = [
        'image',
        'image-parse',
        'image-parse-agnostic-v3.2',   # FIX: correct dataset folder name
        'openpose-img',                  # FIX: datasets.py line 138 needs this
        'openpose-json',
        'cloth',
        'cloth-mask',
        'agnostic-v3.2',
    ]
    for sub in required_subdirs:
        (test_folder / sub).mkdir(parents=True, exist_ok=True)

    def copy_if_exists(src: Path, dst: Path) -> bool:
        if src.exists():
            shutil.copy2(src, dst)
            logger.debug('Copied %s → %s', src, dst)
            return True
        logger.warning('Dataset file not found (skipping): %s', src)
        return False

    # FIX: dataset lives at VITON-HD/datasets/test/, not VITON-HD/test/
    src_test = dataset_dir / 'datasets' / 'test'
    person_stem = Path(person_name).stem    # e.g. "00006_00"
    person_ext  = Path(person_name).suffix  # e.g. ".jpg"

    # ── image/ ───────────────────────────────────────────────────────────────
    copy_if_exists(
        src_test / 'image' / person_name,
        test_folder / 'image' / person_name,
    )

    # ── image-parse/ ─────────────────────────────────────────────────────────
    # datasets.py line 150: parse_name = img_name.replace('.jpg', '.png')
    parse_name = person_name.replace('.jpg', '.png').replace('.jpeg', '.png')
    copy_if_exists(
        src_test / 'image-parse' / parse_name,
        test_folder / 'image-parse' / parse_name,
    )

    # ── image-parse-agnostic-v3.2/ ────────────────────────────────────────────
    # FIX: correct folder name is "image-parse-agnostic-v3.2"
    for ag_ext in ['.png', person_ext]:
        src = src_test / 'image-parse-agnostic-v3.2' / f'{person_stem}{ag_ext}'
        if src.exists():
            shutil.copy2(src, test_folder / 'image-parse-agnostic-v3.2' / f'{person_stem}{ag_ext}')
            break

    # ── openpose-img/ ────────────────────────────────────────────────────────
    # FIX: datasets.py line 137-138:
    #   pose_name = img_name.replace('.jpg', '_rendered.png')
    #   Image.open(osp.join(self.data_path, 'openpose-img', pose_name))
    rendered_name = person_name.replace('.jpg', '_rendered.png').replace('.jpeg', '_rendered.png')
    copy_if_exists(
        src_test / 'openpose-img' / rendered_name,
        test_folder / 'openpose-img' / rendered_name,
    )

    # ── openpose-json/ ────────────────────────────────────────────────────────
    # datasets.py line 142: pose_name = img_name.replace('.jpg', '_keypoints.json')
    keypoints_name = person_name.replace('.jpg', '_keypoints.json').replace('.jpeg', '_keypoints.json')
    copy_if_exists(
        src_test / 'openpose-json' / keypoints_name,
        test_folder / 'openpose-json' / keypoints_name,
    )

    # ── cloth/ ───────────────────────────────────────────────────────────────
    shutil.copy2(cloth_src_path, test_folder / 'cloth' / cloth_name)

    # ── cloth-mask/ ───────────────────────────────────────────────────────────
    # Try to copy from dataset first; auto-generate if missing
    cloth_stem = Path(cloth_name).stem
    cloth_ext_ = Path(cloth_name).suffix
    mask_dst   = test_folder / 'cloth-mask' / cloth_name
    mask_copied = False
    for mask_ext in [cloth_ext_, '.png', '.jpg']:
        src = src_test / 'cloth-mask' / f'{cloth_stem}{mask_ext}'
        if src.exists():
            shutil.copy2(src, mask_dst)
            mask_copied = True
            break
    if not mask_copied:
        # Auto-generate binary mask from cloth image
        _generate_cloth_mask(test_folder / 'cloth' / cloth_name, mask_dst)

    # ── agnostic-v3.2/ ────────────────────────────────────────────────────────
    for ag_ext in ['.jpg', '.png']:
        src = src_test / 'agnostic-v3.2' / f'{person_stem}{ag_ext}'
        if src.exists():
            shutil.copy2(src, test_folder / 'agnostic-v3.2' / f'{person_stem}{ag_ext}')
            break

    # ── test_pairs.txt ────────────────────────────────────────────────────────
    # FIX: placed at temp_root (= dataset_dir arg), filename is the relative list arg.
    # datasets.py: open(osp.join(opt.dataset_dir, opt.dataset_list))
    # → osp.join(temp_root, "test_pairs.txt")  ✓
    pairs_file = temp_root / 'test_pairs.txt'
    pairs_file.write_text(f'{person_name} {cloth_name}\n', encoding='utf-8')
    logger.info('test_pairs.txt: %s %s', person_name, cloth_name)

    return temp_root


def _run_vitonhd(temp_root: Path, session_id: str) -> Path:
    """
    Execute VITON-HD via the CPU-compatible wrapper using subprocess.

    Key argument mapping matched against datasets.py:
      --dataset_dir  = temp_root           (datasets.py: data_path = join(dataset_dir, dataset_mode))
      --dataset_list = "test_pairs.txt"    (datasets.py: open(join(dataset_dir, dataset_list)))
      --dataset_mode = "test"              (→ temp_root/test/ subfolder)

    Uses run_vitonhd_cpu.py wrapper so .cuda() calls become no-ops on CPU.
    """
    vitonhd_dir: Path = settings.VITONHD_DIR
    results_dir = Path(settings.MEDIA_ROOT) / 'results' / session_id
    results_dir.mkdir(parents=True, exist_ok=True)

    # Use CPU wrapper if CUDA unavailable, else call test.py directly
    import torch
    use_gpu = torch.cuda.is_available()
    script = str(vitonhd_dir / ('test.py' if use_gpu else 'run_vitonhd_cpu.py'))

    cmd = [
        sys.executable,
        script,
        '--name',           session_id,
        '--dataset_dir',    str(temp_root),   # datasets.py: data_path = join(dataset_dir, dataset_mode)
        '--dataset_mode',   'test',
        '--dataset_list',   'test_pairs.txt',  # datasets.py: open(join(dataset_dir, dataset_list))
        '--checkpoint_dir', str(vitonhd_dir / 'checkpoints'),
        '--save_dir',       str(results_dir),
        '--batch_size',     '1',
        '--workers',        '0',   # 0 workers avoids Windows multiprocessing spawn issues
        '--load_height',    '1024',
        '--load_width',     '768',
    ]

    # Suppress the pin_memory warning on CPU-only machines
    env = os.environ.copy()
    env['PYTHONWARNINGS'] = 'ignore::UserWarning'

    logger.info('Running VITON-HD (%s): %s', 'GPU' if use_gpu else 'CPU', ' '.join(cmd))

    proc = subprocess.run(
        cmd,
        cwd=str(vitonhd_dir),
        capture_output=True,
        text=True,
        timeout=1800,   # 30-minute limit for CPU inference
        env=env,
    )

    if proc.returncode != 0:
        logger.error('VITON-HD STDOUT:\n%s', proc.stdout[-3000:])
        logger.error('VITON-HD STDERR:\n%s', proc.stderr[-3000:])
        raise RuntimeError(
            f'VITON-HD failed (exit {proc.returncode}).\n'
            f'STDERR: {proc.stderr[-2000:]}'
        )

    logger.info('VITON-HD completed. STDOUT:\n%s', proc.stdout)

    # Results saved to: results_dir/<session_id>/<name>.jpg
    output_subdir = results_dir / session_id
    image_files = (
        list(output_subdir.glob('*.jpg'))
        + list(output_subdir.glob('*.jpeg'))
        + list(output_subdir.glob('*.png'))
    )
    if not image_files:
        raise RuntimeError(
            f'VITON-HD completed but no output image found in {output_subdir}. '
            f'STDOUT: {proc.stdout[-500:]}'
        )

    return image_files[0]


class TryOnView(APIView):
    """
    POST /api/tryon/

    Multipart fields:
        person_image  — JPG/PNG  (filename MUST match a record in the dataset,
                                   e.g. "00006_00.jpg")
        cloth_image   — JPG/PNG

    Headers:
        Authorization: Bearer <access_token>

    Response 200:
        { "image_url": "http://localhost:8000/media/results/<id>/..." }
    """
    permission_classes = [IsAuthenticated]
    parser_classes     = [MultiPartParser, FormParser]

    def post(self, request):
        person_file = request.FILES.get('person_image')
        cloth_file  = request.FILES.get('cloth_image')

        if not person_file:
            return Response({'error': 'person_image is required.'}, status=status.HTTP_400_BAD_REQUEST)
        if not cloth_file:
            return Response({'error': 'cloth_image is required.'}, status=status.HTTP_400_BAD_REQUEST)

        err = _validate_image_file(person_file, 'person_image')
        if err:
            return Response({'error': err}, status=status.HTTP_400_BAD_REQUEST)

        err = _validate_image_file(cloth_file, 'cloth_image')
        if err:
            return Response({'error': err}, status=status.HTTP_400_BAD_REQUEST)

        session_id = str(uuid.uuid4())
        logger.info('Try-on session %s started for user %s', session_id, request.user.email)

        uploads_dir = Path(settings.MEDIA_ROOT) / 'uploads'
        cloth_path  = _save_upload(cloth_file, uploads_dir / session_id)
        cloth_name  = cloth_file.name
        person_name = person_file.name

        temp_root: Path = None

        try:
            temp_root = _build_temp_dataset(
                session_id=session_id,
                person_name=person_name,
                cloth_name=cloth_name,
                cloth_src_path=cloth_path,
            )

            output_image_path = _run_vitonhd(temp_root, session_id)

            relative_path = output_image_path.relative_to(Path(settings.MEDIA_ROOT))
            image_url = request.build_absolute_uri(
                settings.MEDIA_URL + str(relative_path).replace('\\', '/')
            )

            logger.info('Session %s done → %s', session_id, image_url)
            return Response({'image_url': image_url}, status=status.HTTP_200_OK)

        except FileNotFoundError as exc:
            logger.error('Missing dataset file for session %s: %s', session_id, exc)
            return Response(
                {
                    'error': (
                        'Required dataset file not found. '
                        'The person image filename must match an entry in the VITON-HD dataset '
                        '(e.g. "00006_00.jpg").'
                    ),
                    'detail': str(exc),
                },
                status=status.HTTP_422_UNPROCESSABLE_ENTITY,
            )

        except subprocess.TimeoutExpired:
            logger.error('VITON-HD timed out — session %s', session_id)
            return Response(
                {'error': 'Model inference timed out. CPU inference can take 10–20 minutes.'},
                status=status.HTTP_504_GATEWAY_TIMEOUT,
            )

        except RuntimeError as exc:
            logger.error('VITON-HD RuntimeError session %s: %s', session_id, exc)
            return Response(
                {'error': 'Model inference failed.', 'detail': str(exc)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        except Exception as exc:
            logger.exception('Unexpected error in session %s', session_id)
            return Response(
                {'error': 'An unexpected server error occurred.', 'detail': str(exc)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        finally:
            if temp_root is not None and temp_root.exists():
                try:
                    shutil.rmtree(temp_root)
                    logger.info('Cleaned up temp: %s', temp_root)
                except Exception as e:
                    logger.warning('Cleanup failed for %s: %s', temp_root, e)
