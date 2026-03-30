from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import User


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    model = User
    list_display = (
        "id",
        "username",
        "email",
        "full_name",
        "role",
        "is_active",
        "is_staff",
        "is_superuser",
    )
    list_filter = ("role", "is_active", "is_staff", "is_superuser")
    search_fields = ("username", "email", "full_name")
    ordering = ("id",)

    fieldsets = UserAdmin.fieldsets + (
        ("Petty Cash", {"fields": ("full_name", "role")}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        ("Petty Cash", {"fields": ("email", "full_name", "role")}),
    )
