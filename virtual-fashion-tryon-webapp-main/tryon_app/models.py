from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.db import models
from django.utils import timezone

from .managers import UserManager


class User(AbstractBaseUser, PermissionsMixin):
    """
    Custom user model using email as the unique identifier.
    Passwords are hashed via Django's set_password().
    """
    email = models.EmailField(unique=True, db_index=True)
    full_name = models.CharField(max_length=150, blank=True)
    phone = models.CharField(max_length=20, blank=True)

    is_verified = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    date_joined = models.DateTimeField(default=timezone.now)

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []          # email + password are enough for createsuperuser

    class Meta:
        db_table = 'users'
        verbose_name = 'User'
        verbose_name_plural = 'Users'

    def __str__(self):
        return self.email


class OTPRecord(models.Model):
    """
    Temporarily stores a hashed OTP for email verification.
    Deleted once the user is successfully created.
    """
    email = models.EmailField(unique=True, db_index=True)
    otp_hash = models.CharField(max_length=64)   # SHA-256 hex (64 chars)
    full_name = models.CharField(max_length=150, blank=True)
    phone = models.CharField(max_length=20, blank=True)
    hashed_password = models.CharField(max_length=255)   # already hashed by Django
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'otp_records'
        verbose_name = 'OTP Record'
        verbose_name_plural = 'OTP Records'

    def __str__(self):
        return f'OTP for {self.email}'
