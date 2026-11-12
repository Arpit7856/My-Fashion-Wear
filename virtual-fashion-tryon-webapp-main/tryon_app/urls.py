from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import LoginView, RegisterView, TryOnView, VerifyOTPView

urlpatterns = [
    # Auth endpoints
    path('register/',    RegisterView.as_view(),   name='register'),
    path('verify-otp/',  VerifyOTPView.as_view(),  name='verify-otp'),
    path('login/',       LoginView.as_view(),       name='login'),

    # JWT token refresh
    path('token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),

    # Try-on (JWT protected)
    path('tryon/',       TryOnView.as_view(),       name='tryon'),
]
