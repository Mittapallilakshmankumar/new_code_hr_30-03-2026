from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

from common.choices import UserRole

from .models import User


def apply_role_flags(user, role):
    if role == UserRole.ADMIN:
        user.is_staff = True
    elif not user.is_superuser:
        user.is_staff = False


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "full_name",
            "role",
            "is_active",
            "is_staff",
            "is_superuser",
        ]
        read_only_fields = fields


class UserSummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email", "full_name", "role", "is_active"]
        read_only_fields = fields


class BaseUserWriteSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = [
            "full_name",
            "username",
            "email",
            "role",
            "password",
            "confirm_password",
        ]

    def validate_full_name(self, value):
        full_name = value.strip()
        if len(full_name) < 3:
            raise serializers.ValidationError("Full name must be at least 3 characters.")
        return full_name

    def validate_email(self, value):
        email = value.lower().strip()
        queryset = User.objects.filter(email__iexact=email)
        if self.instance:
            queryset = queryset.exclude(pk=self.instance.pk)
        if queryset.exists():
            raise serializers.ValidationError("An account with this email already exists.")
        return email

    def validate_username(self, value):
        username = value.strip()
        if len(username) < 3:
            raise serializers.ValidationError("Username must be at least 3 characters.")
        queryset = User.objects.filter(username__iexact=username)
        if self.instance:
            queryset = queryset.exclude(pk=self.instance.pk)
        if queryset.exists():
            raise serializers.ValidationError("This username is already taken.")
        return username

    def validate_role(self, value):
        if value not in UserRole.values:
            raise serializers.ValidationError("Select a valid role.")
        return value

    def validate(self, attrs):
        password = attrs.get("password")
        confirm_password = attrs.get("confirm_password")

        if password != confirm_password:
            raise serializers.ValidationError(
                {"confirm_password": "Password confirmation does not match."}
            )

        validate_password(password)
        return attrs


class AdminUserCreateSerializer(BaseUserWriteSerializer):
    def create(self, validated_data):
        validated_data.pop("confirm_password")
        password = validated_data.pop("password")
        user = User.objects.create_user(password=password, **validated_data)
        apply_role_flags(user, user.role)
        user.save(update_fields=["is_staff"])
        return user


class AdminUserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["full_name", "username", "email", "role", "is_active"]

    def validate_email(self, value):
        email = value.lower().strip()
        queryset = User.objects.filter(email__iexact=email).exclude(pk=self.instance.pk)
        if queryset.exists():
            raise serializers.ValidationError("An account with this email already exists.")
        return email

    def validate_username(self, value):
        username = value.strip()
        if len(username) < 3:
            raise serializers.ValidationError("Username must be at least 3 characters.")
        queryset = User.objects.filter(username__iexact=username).exclude(pk=self.instance.pk)
        if queryset.exists():
            raise serializers.ValidationError("This username is already taken.")
        return username

    def validate_full_name(self, value):
        full_name = value.strip()
        if len(full_name) < 3:
            raise serializers.ValidationError("Full name must be at least 3 characters.")
        return full_name

    def validate_role(self, value):
        if value not in UserRole.values:
            raise serializers.ValidationError("Select a valid role.")
        return value

    def update(self, instance, validated_data):
        role = validated_data.get("role", instance.role)
        for field, value in validated_data.items():
            setattr(instance, field, value)
        apply_role_flags(instance, role)
        instance.save()
        return instance


class AdminPasswordResetSerializer(serializers.Serializer):
    new_password = serializers.CharField(write_only=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        if attrs["new_password"] != attrs["confirm_password"]:
            raise serializers.ValidationError(
                {"confirm_password": "Password confirmation does not match."}
            )
        validate_password(attrs["new_password"])
        return attrs
