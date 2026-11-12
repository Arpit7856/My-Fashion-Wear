import requests
import time
import os

BASE_URL = 'http://localhost:8000/api'
EMAIL = 'test_integration@example.com'
PASSWORD = 'StrongPassword123'
PERSON_IMAGE = '00013_00.jpg'
CLOTH_IMAGE = '00006_00.jpg' # We can just use a cloth image from the dataset for testing

def main():
    print("Testing Registration...")
    res = requests.post(f"{BASE_URL}/register/", json={
        "full_name": "Test User",
        "email": EMAIL,
        "password": PASSWORD,
        "confirm_password": PASSWORD
    })
    print("Register Response:", res.status_code, res.text)
    
    # Normally we need OTP. Let's fetch it straight from the DB to automate testing.
    import sqlite3
    import sys
    sys.path.append(os.getcwd())
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "virtual_tryon.settings")
    import django
    django.setup()
    
    from tryon_app.models import OTPRecord
    from tryon_app.otp_utils import hash_otp
    
    # We don't know the plain OTP easily since it's hashed, but actually we can't extract the plain OTP from hash.
    # Wait, in development, it's easier to just patch verify-otp or read the OTP from the mail outbox.
    from django.core import mail
    if mail.outbox:
        latest = mail.outbox[-1].body
        # extract OTP (6 digits)
        import re
        match = re.search(r'\b\d{6}\b', latest)
        if match:
            otp = match.group(0)
            print("Found OTP from outbox:", otp)
            
            print("Testing Verify OTP...")
            res = requests.post(f"{BASE_URL}/verify-otp/", json={
                "email": EMAIL,
                "otp": otp
            })
            print("Verify Response:", res.status_code, res.text)
        else:
            print("Could not find OTP in email body.")
            return
    else:
        print("No mail in outbox. Did it send via Gmail?")
        
    print("Wait, emails are sent via real SMTP, so mail.outbox won't work easily unless we use console backend.")
    
if __name__ == '__main__':
    # We will just print instructions first.
    print("Script started...")
