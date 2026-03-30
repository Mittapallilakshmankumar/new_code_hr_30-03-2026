from rest_framework import serializers

from accounts.serializers import UserSummarySerializer
from common.choices import UserRole
from common.utils import amount_to_words, get_allowed_expense_date_range, money

from .models import Advance, AuditLog, Expense, LedgerEntry, Notification


def is_checker_or_admin(user):
    return user.role in {UserRole.CHECKER, UserRole.ADMIN}


class LedgerEntrySerializer(serializers.ModelSerializer):
    advance_reference = serializers.CharField(source="advance.reference", read_only=True)
    expense_reference = serializers.CharField(source="expense.reference", read_only=True)

    class Meta:
        model = LedgerEntry
        fields = [
            "id",
            "advance",
            "advance_reference",
            "expense",
            "expense_reference",
            "entry_type",
            "amount",
            "balance_after",
            "note",
            "created_at",
        ]
        read_only_fields = fields


class AdvanceSerializer(serializers.ModelSerializer):
    maker_details = UserSummarySerializer(source="maker", read_only=True)
    allocated_by_details = UserSummarySerializer(source="allocated_by", read_only=True)

    class Meta:
        model = Advance
        fields = [
            "id",
            "reference",
            "maker",
            "maker_details",
            "allocated_by",
            "allocated_by_details",
            "total_amount",
            "spent_amount",
            "balance_amount",
            "status",
            "remarks",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "reference",
            "allocated_by",
            "allocated_by_details",
            "spent_amount",
            "balance_amount",
            "status",
            "created_at",
            "updated_at",
        ]

    def validate_maker(self, value):
        if value.role != UserRole.MAKER:
            raise serializers.ValidationError("Maker must be a maker user.")
        return value

    def validate_total_amount(self, value):
        if money(value) <= 0:
            raise serializers.ValidationError("Total amount must be greater than zero.")
        return value


class AdvanceBalanceSerializer(serializers.Serializer):
    maker_id = serializers.IntegerField()
    maker_name = serializers.CharField()
    maker_username = serializers.CharField()
    total_advance = serializers.DecimalField(max_digits=12, decimal_places=2)
    total_spent = serializers.DecimalField(max_digits=12, decimal_places=2)
    remaining_balance = serializers.DecimalField(max_digits=12, decimal_places=2)
    active_advances = serializers.IntegerField()


class ExpenseSerializer(serializers.ModelSerializer):
    maker_details = UserSummarySerializer(source="maker", read_only=True)
    reviewed_by_details = UserSummarySerializer(source="reviewed_by", read_only=True)
    approved_by_details = UserSummarySerializer(source="approved_by", read_only=True)
    advance_details = AdvanceSerializer(source="advance", read_only=True)
    bill_file_url = serializers.SerializerMethodField()
    bill_file_name = serializers.SerializerMethodField()
    bill_file_available = serializers.SerializerMethodField()
    current_advance_balance = serializers.DecimalField(
        source="advance.balance_amount",
        max_digits=12,
        decimal_places=2,
        read_only=True,
    )

    class Meta:
        model = Expense
        fields = [
            "id",
            "reference",
            "advance",
            "advance_details",
            "maker",
            "maker_details",
            "payable_to",
            "expense_date",
            "amount",
            "amount_in_words",
            "category",
            "purpose",
            "payment_mode",
            "transaction_reference",
            "remarks",
            "rejection_reason",
            "reviewed_by",
            "reviewed_by_details",
            "approved_by",
            "approved_by_details",
            "current_advance_balance",
            "status",
            "bill_file",
            "bill_file_url",
            "bill_file_name",
            "bill_file_available",
            "created_at",
            "updated_at",
            "submitted_at",
            "reviewed_at",
            "approved_at",
            "bill_submitted_at",
            "closed_at",
        ]
        read_only_fields = [
            "id",
            "reference",
            "maker",
            "maker_details",
            "status",
            "created_at",
            "updated_at",
            "submitted_at",
            "reviewed_at",
            "approved_at",
            "bill_submitted_at",
            "closed_at",
        ]

    def validate(self, attrs):
        advance = attrs.get("advance") or getattr(self.instance, "advance", None)
        reviewed_by = attrs.get("reviewed_by") or getattr(self.instance, "reviewed_by", None)
        approved_by = attrs.get("approved_by") or getattr(self.instance, "approved_by", None)
        amount = attrs.get("amount", getattr(self.instance, "amount", None))
        payment_mode = attrs.get("payment_mode", getattr(self.instance, "payment_mode", ""))
        expense_date = attrs.get("expense_date", getattr(self.instance, "expense_date", None))
        transaction_reference = attrs.get(
            "transaction_reference",
            getattr(self.instance, "transaction_reference", ""),
        )
        request = self.context.get("request")
        actor = getattr(request, "user", None)

        if advance and actor and actor.role == UserRole.MAKER and advance.maker_id != actor.id:
            raise serializers.ValidationError(
                {"advance": "You can only create an expense against your own advance."}
            )

        if reviewed_by and not is_checker_or_admin(reviewed_by):
            raise serializers.ValidationError(
                {"reviewed_by": "Reviewed by must be a checker or admin."}
            )

        if approved_by and not is_checker_or_admin(approved_by):
            raise serializers.ValidationError(
                {"approved_by": "Approved by must be a checker or admin."}
            )

        if advance and amount is not None:
            if money(amount) > money(advance.balance_amount):
                raise serializers.ValidationError(
                    {"amount": "Expense amount cannot exceed the available advance balance."}
                )

        min_date, max_date = get_allowed_expense_date_range()
        if expense_date and not (min_date <= expense_date <= max_date):
            raise serializers.ValidationError(
                {
                    "expense_date": (
                        f"Expense date must be between {min_date.isoformat()} and {max_date.isoformat()}."
                    )
                }
            )

        if payment_mode == "UPI" and not str(transaction_reference or "").strip():
            raise serializers.ValidationError(
                {"transaction_reference": "UTR ID / TR ID is required for UPI payments."}
            )

        return attrs

    def create(self, validated_data):
        if not validated_data.get("amount_in_words"):
            validated_data["amount_in_words"] = amount_to_words(validated_data["amount"])
        return super().create(validated_data)

    def update(self, instance, validated_data):
        if "amount" in validated_data and not validated_data.get("amount_in_words"):
            validated_data["amount_in_words"] = amount_to_words(validated_data["amount"])
        return super().update(instance, validated_data)

    def get_bill_file_name(self, obj):
        if not obj.bill_file:
            return ""
        return obj.bill_file.name.rsplit("/", 1)[-1]

    def get_bill_file_available(self, obj):
        if not obj.bill_file:
            return False
        try:
            return obj.bill_file.storage.exists(obj.bill_file.name)
        except OSError:
            return False

    def get_bill_file_url(self, obj):
        if not self.get_bill_file_available(obj):
            return ""

        try:
            relative_url = obj.bill_file.url
        except (ValueError, OSError):
            return ""

        request = self.context.get("request")
        if request is None:
            return relative_url
        return request.build_absolute_uri(relative_url)


class UploadBillSerializer(serializers.Serializer):
    bill_file = serializers.FileField()


class RejectExpenseSerializer(serializers.Serializer):
    rejection_reason = serializers.CharField()

    def validate_rejection_reason(self, value):
        reason = value.strip()
        if not reason:
            raise serializers.ValidationError("Rejection message is required.")
        return reason


class AuditLogSerializer(serializers.ModelSerializer):
    actor_details = UserSummarySerializer(source="actor", read_only=True)
    advance_reference = serializers.CharField(source="advance.reference", read_only=True)
    expense_reference = serializers.CharField(source="expense.reference", read_only=True)

    class Meta:
        model = AuditLog
        fields = [
            "id",
            "action",
            "description",
            "metadata",
            "actor",
            "actor_details",
            "advance",
            "advance_reference",
            "expense",
            "expense_reference",
            "created_at",
        ]
        read_only_fields = fields


class NotificationSerializer(serializers.ModelSerializer):
    related_expense_reference = serializers.CharField(
        source="related_expense.reference",
        read_only=True,
    )

    class Meta:
        model = Notification
        fields = [
            "id",
            "title",
            "message",
            "notification_type",
            "related_expense",
            "related_expense_reference",
            "action_url",
            "is_read",
            "created_at",
        ]
        read_only_fields = fields


class MakerDashboardSerializer(serializers.Serializer):
    total_advance = serializers.DecimalField(max_digits=12, decimal_places=2)
    total_spent = serializers.DecimalField(max_digits=12, decimal_places=2)
    remaining_balance = serializers.DecimalField(max_digits=12, decimal_places=2)
    pending_bills = serializers.IntegerField()
    recent_expenses_count = serializers.IntegerField()
    unread_notifications_count = serializers.IntegerField()
    recent_notifications = NotificationSerializer(many=True)


class CheckerDashboardSerializer(serializers.Serializer):
    total_allocated = serializers.DecimalField(max_digits=12, decimal_places=2)
    total_verified_spend = serializers.DecimalField(max_digits=12, decimal_places=2)
    pending_reviews = serializers.IntegerField()
    pending_approvals = serializers.IntegerField()
    pending_bill_verifications = serializers.IntegerField()
    active_advances = serializers.IntegerField()
    unread_notifications_count = serializers.IntegerField()
    recent_notifications = NotificationSerializer(many=True)


class ReportsSummarySerializer(serializers.Serializer):
    total_advances_allocated = serializers.DecimalField(max_digits=12, decimal_places=2)
    total_spent = serializers.DecimalField(max_digits=12, decimal_places=2)
    remaining_balances = serializers.DecimalField(max_digits=12, decimal_places=2)
    closed_expenses_count = serializers.IntegerField()
    expenses_by_status = serializers.DictField(child=serializers.IntegerField())
    balances_by_maker = AdvanceBalanceSerializer(many=True)
