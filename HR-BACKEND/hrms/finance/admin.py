from django.contrib import admin

from .models import Advance, AuditLog, Expense, LedgerEntry, Notification


@admin.register(Advance)
class AdvanceAdmin(admin.ModelAdmin):
    list_display = (
        "reference",
        "maker",
        "allocated_by",
        "total_amount",
        "spent_amount",
        "balance_amount",
        "status",
        "created_at",
    )
    list_filter = ("status",)
    search_fields = ("reference", "maker__username", "maker__full_name")


@admin.register(Expense)
class ExpenseAdmin(admin.ModelAdmin):
    list_display = (
        "reference",
        "advance",
        "maker",
        "amount",
        "status",
        "reviewed_by",
        "approved_by",
        "created_at",
    )
    list_filter = ("status", "category")
    search_fields = (
        "reference",
        "payable_to",
        "advance__reference",
        "maker__username",
        "maker__full_name",
    )


@admin.register(LedgerEntry)
class LedgerEntryAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "advance",
        "expense",
        "entry_type",
        "amount",
        "balance_after",
        "created_at",
    )
    list_filter = ("entry_type",)
    search_fields = ("advance__reference", "expense__reference", "note")


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = (
        "created_at",
        "action",
        "actor",
        "advance",
        "expense",
        "description",
    )
    list_filter = ("action",)
    search_fields = (
        "action",
        "description",
        "advance__reference",
        "expense__reference",
        "actor__username",
        "actor__full_name",
    )


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "user",
        "notification_type",
        "related_expense",
        "is_read",
        "created_at",
    )
    list_filter = ("notification_type", "is_read", "created_at")
    search_fields = (
        "title",
        "message",
        "user__username",
        "user__full_name",
        "related_expense__reference",
    )
