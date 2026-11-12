import os
import sys
import shutil
from pathlib import Path

# Setup Django environment
sys.path.append(os.getcwd())
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "virtual_tryon.settings")
import django
django.setup()

from tryon_app.views import _build_temp_dataset, _run_vitonhd

def test_inference_logic():
    print("Testing backend logic directly (bypassing HTTP HTTP)...")
    session_id = "test_local_session"
    person_name = "00013_00.jpg"
    
    # We will use the dataset's cloth image as the user-uploaded cloth
    base = Path('backend/model/Viton_project/VITON-HD')
    cloth_src = base / 'datasets' / 'test' / 'cloth' / '00006_00.jpg'
    cloth_name = 'user_cloth_test.jpg'
    
    print(f"Creating temp dataset for {person_name} + {cloth_name}...")
    temp_root = _build_temp_dataset(
        session_id=session_id,
        person_name=person_name,
        cloth_name=cloth_name,
        cloth_src_path=cloth_src
    )
    
    print(f"Temp Dataset built at: {temp_root}")
    
    print("Running VITON-HD Inference (this may take a bit on CPU)...")
    try:
        output_image_path = _run_vitonhd(temp_root, session_id)
        print("Success! Output image path:", output_image_path)
    except Exception as e:
        print("Model inference failed!")
        print(e)
    finally:
        # Cleanup
        if temp_root.exists():
            shutil.rmtree(temp_root)
            print("Cleaned up temp root.")
        
if __name__ == '__main__':
    test_inference_logic()
