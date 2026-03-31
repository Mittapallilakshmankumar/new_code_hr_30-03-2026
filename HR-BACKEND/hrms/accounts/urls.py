from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .views import (
    AdminDashboardView,
    AppConfigView,
    CheckerOptionsView,
    LogoutView,
    MeView,
    RegisterView,
    UserDetailView,
    UserListView,
    UserPasswordResetView,
)

urlpatterns = [
    path("login/", TokenObtainPairView.as_view(), name="auth-login"),
    # path("refresh/", TokenRefreshView.as_view(), name="auth-refresh"),
    path("auth/refresh/", TokenRefreshView.as_view(), name="auth-refresh"),

    path("me/", MeView.as_view(), name="auth-me"),
    path("logout/", LogoutView.as_view(), name="auth-logout"),
    path("app-config/", AppConfigView.as_view(), name="auth-app-config"),
    path("register/", RegisterView.as_view(), name="auth-register"),
    path("users/", UserListView.as_view(), name="auth-users"),
    path("users/<int:user_id>/", UserDetailView.as_view(), name="auth-user-detail"),
    path(
        "users/<int:user_id>/reset-password/",
        UserPasswordResetView.as_view(),
        name="auth-user-reset-password",
    ),
    path("checker-options/", CheckerOptionsView.as_view(), name="auth-checker-options"),
    path("admin/dashboard/", AdminDashboardView.as_view(), name="auth-admin-dashboard"),
]