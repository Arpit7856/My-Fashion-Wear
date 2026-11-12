from django.contrib import admin
from .models import OTPRecord, User


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('email', 'full_name', 'phone', 'is_verified', 'is_active', 'date_joined')
    list_filter = ('is_verified', 'is_active', 'is_staff')
    search_fields = ('email', 'full_name', 'phone')
    ordering = ('-date_joined',)
    readonly_fields = ('date_joined', 'last_login')


@admin.register(OTPRecord)
class OTPRecordAdmin(admin.ModelAdmin):
    list_display = ('email', 'created_at')
    search_fields = ('email',)
    ordering = ('-created_at',)
