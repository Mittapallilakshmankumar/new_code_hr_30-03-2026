from rest_framework.permissions import BasePermission

from common.choices import UserRole


class IsChecker(BasePermission):
    message = "Only checker users can perform this action."

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role == UserRole.CHECKER
        )


class IsMaker(BasePermission):
    message = "Only maker users can perform this action."

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role == UserRole.MAKER
        )
