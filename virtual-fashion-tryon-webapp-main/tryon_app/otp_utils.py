import hashlib
import secrets
from django.core.mail import send_mail
from django.conf import settings


def generate_otp() -> str:
    """Generate a cryptographically secure 6-digit OTP."""
    return str(secrets.randbelow(1000000)).zfill(6)


def hash_otp(otp: str) -> str:
    """Return SHA-256 hex digest of the OTP string."""
    return hashlib.sha256(otp.encode('utf-8')).hexdigest()


def send_otp_email(email: str, otp: str) -> None:
    """Send OTP to the given email address via configured SMTP backend."""
    subject = 'Your Virtual Try-On OTP Verification Code'
    message = (
        f'Hello,\n\n'
        f'Your one-time verification code for Virtual Fashion Try-On is:\n\n'
        f'  {otp}\n\n'
        f'This code is valid for 10 minutes. Do not share it with anyone.\n\n'
        f'— Virtual Fashion Try-On Team'
    )
    send_mail(
        subject=subject,
        message=message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[email],
        fail_silently=False,
    )
