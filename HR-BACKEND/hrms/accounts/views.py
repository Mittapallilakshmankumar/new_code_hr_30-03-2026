from django.conf import settings
from django.db.models import Q, Sum
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken, TokenError

from common.choices import UserRole

from .models import User
from .serializers import (
    AdminPasswordResetSerializer,
    AdminUserCreateSerializer,
    AdminUserUpdateSerializer,
    UserSerializer,
    UserSummarySerializer,
)


def is_admin(user):
    return bool(user and user.is_authenticated and user.role == UserRole.ADMIN)


def admin_forbidden_response():
    return Response(
        {"detail": "Only admin users can perform this action."},
        status=status.HTTP_403_FORBIDDEN,
    )


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        return Response(
            {"detail": "Public registration is disabled. Please contact an admin."},
            status=status.HTTP_403_FORBIDDEN,
        )


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        refresh_token = str(request.data.get("refresh", "") or "").strip()
        if not refresh_token:
            return Response(
                {"detail": "Refresh token is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        response_payload = {
            "detail": "Logout completed on the client.",
            "refresh_revoked": False,
        }

        if "rest_framework_simplejwt.token_blacklist" not in settings.INSTALLED_APPS:
            response_payload["detail"] = (
                "Logout completed on the client. Refresh-token revocation is not enabled."
            )
            return Response(response_payload, status=status.HTTP_200_OK)

        try:
            RefreshToken(refresh_token).blacklist()
            response_payload["detail"] = "Logout completed and refresh token revoked."
            response_payload["refresh_revoked"] = True
        except TokenError:
            return Response(
                {"detail": "Refresh token is invalid or expired."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(response_payload, status=status.HTTP_200_OK)


class AppConfigView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def get(self, request):
        return Response(
            {
                "frontend_base_url": settings.FRONTEND_BASE_URL,
                "max_bill_upload_size": settings.MAX_BILL_UPLOAD_SIZE,
                "max_bill_upload_size_mb": settings.MAX_BILL_UPLOAD_SIZE_MB,
                "refresh_revocation_enabled": (
                    "rest_framework_simplejwt.token_blacklist" in settings.INSTALLED_APPS
                ),
                "shared_db_safety": "unverified_until_hr_db_config_and_schema_are_reviewed",
            }
        )


class UserListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        search = request.query_params.get("search", "").strip()
        role = request.query_params.get("role")
        is_active = request.query_params.get("is_active")
        users = User.objects.all()

        if role in UserRole.values:
            users = users.filter(role=role)

        if is_active in {"true", "false"}:
            users = users.filter(is_active=is_active == "true")

        if search:
            users = users.filter(
                Q(full_name__icontains=search)
                | Q(username__icontains=search)
                | Q(email__icontains=search)
            )

        if request.user.role == UserRole.MAKER and role != UserRole.CHECKER:
            users = users.filter(id=request.user.id)
        elif request.user.role == UserRole.MAKER and role == UserRole.CHECKER:
            users = users.filter(is_active=True, role=UserRole.CHECKER)
        elif request.user.role == UserRole.CHECKER:
            users = users.filter(is_active=True, role__in=[UserRole.MAKER, UserRole.CHECKER])
        elif not is_admin(request.user):
            users = users.filter(id=request.user.id)

        users = users.order_by("full_name", "username")
        return Response(UserSummarySerializer(users, many=True).data)

    def post(self, request):
        if not is_admin(request.user):
            return admin_forbidden_response()

        serializer = AdminUserCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(
            {
                "message": "User created successfully.",
                "user": UserSerializer(user).data,
            },
            status=status.HTTP_201_CREATED,
        )


class UserDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, user_id):
        if not is_admin(request.user):
            return admin_forbidden_response()

        user = get_object_or_404(User, pk=user_id)
        serializer = AdminUserUpdateSerializer(user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(
            {
                "message": "User updated successfully.",
                "user": UserSerializer(user).data,
            }
        )


class UserPasswordResetView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, user_id):
        if not is_admin(request.user):
            return admin_forbidden_response()

        user = get_object_or_404(User, pk=user_id)
        serializer = AdminPasswordResetSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user.set_password(serializer.validated_data["new_password"])
        user.save(update_fields=["password"])
        return Response({"message": "Password reset successfully."})


class CheckerOptionsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        users = User.objects.filter(is_active=True, role=UserRole.CHECKER).order_by(
            "full_name", "username"
        )
        return Response(UserSummarySerializer(users, many=True).data)


class AdminDashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not is_admin(request.user):
            return admin_forbidden_response()

        from finance.models import Advance, Expense
        from common.choices import AdvanceStatus, ExpenseStatus
        from common.utils import money

        active_user_count = User.objects.filter(is_active=True).count()
        makers = User.objects.filter(role=UserRole.MAKER)
        checkers = User.objects.filter(role=UserRole.CHECKER)
        requests = Expense.objects.select_related(
            "maker", "reviewed_by", "approved_by", "advance"
        ).order_by("-created_at")

        expense_status_counts = {
            choice: requests.filter(status=choice).count() for choice in ExpenseStatus.values
        }
        recent_requests = [
            {
                "id": expense.id,
                "reference": expense.reference,
                "maker_name": expense.maker.full_name or expense.maker.username,
                "amount": str(expense.amount),
                "status": expense.status,
                "created_at": expense.created_at,
            }
            for expense in requests[:8]
        ]
        advances = Advance.objects.all()

        payload = {
            "summary": {
                "total_users": User.objects.count(),
                "active_users": active_user_count,
                "makers": makers.count(),
                "checkers": checkers.count(),
                "admins": User.objects.filter(role=UserRole.ADMIN).count(),
                "active_advances": advances.filter(
                    status__in=[AdvanceStatus.ACTIVE, AdvanceStatus.PARTIALLY_USED]
                ).count(),
                "open_requests": requests.filter(
                    status__in=[
                        ExpenseStatus.SUBMITTED,
                        ExpenseStatus.REVIEWED,
                        ExpenseStatus.BILL_SUBMITTED,
                    ]
                ).count(),
                "approved_requests": requests.filter(status=ExpenseStatus.APPROVED).count(),
                "closed_requests": requests.filter(status=ExpenseStatus.CLOSED).count(),
                "inactive_users": User.objects.filter(is_active=False).count(),
                "total_allocated": str(
                    money(advances.aggregate(total=Sum("total_amount"))["total"])
                ),
                "total_spent": str(
                    money(advances.aggregate(total=Sum("spent_amount"))["total"])
                ),
                "remaining_balance": str(
                    money(advances.aggregate(total=Sum("balance_amount"))["total"])
                ),
            },
            "charts": {
                "user_roles": {
                    "ADMIN": User.objects.filter(role=UserRole.ADMIN).count(),
                    "MAKER": makers.count(),
                    "CHECKER": checkers.count(),
                },
                "request_statuses": expense_status_counts,
                "user_statuses": {
                    "active": active_user_count,
                    "inactive": User.objects.filter(is_active=False).count(),
                },
            },
            "makers": UserSummarySerializer(
                makers.filter(is_active=True).order_by("full_name", "username"), many=True
            ).data,
            "checkers": UserSummarySerializer(
                checkers.filter(is_active=True).order_by("full_name", "username"), many=True
            ).data,
            "recent_requests": recent_requests,
        }
        return Response(payload)
