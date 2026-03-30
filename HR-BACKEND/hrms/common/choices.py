from django.db import models


class UserRole(models.TextChoices):
    ADMIN = "ADMIN", "Admin"
    MAKER = "MAKER", "Maker"
    CHECKER = "CHECKER", "Checker"


class AdvanceStatus(models.TextChoices):
    ACTIVE = "ACTIVE", "Active"
    PARTIALLY_USED = "PARTIALLY_USED", "Partially Used"
    EXHAUSTED = "EXHAUSTED", "Exhausted"
    CLOSED = "CLOSED", "Closed"


class ExpenseStatus(models.TextChoices):
    DRAFT = "DRAFT", "Draft"
    SUBMITTED = "SUBMITTED", "Submitted"
    REVIEWED = "REVIEWED", "Reviewed"
    APPROVED = "APPROVED", "Approved"
    BILL_SUBMITTED = "BILL_SUBMITTED", "Bill Submitted"
    CLOSED = "CLOSED", "Closed"
    REJECTED = "REJECTED", "Rejected"


class LedgerEntryType(models.TextChoices):
    ADVANCE = "ADVANCE", "Advance"
    SPEND = "SPEND", "Spend"
    ADJUSTMENT = "ADJUSTMENT", "Adjustment"


class NotificationType(models.TextChoices):
    EXPENSE_SUBMITTED = "EXPENSE_SUBMITTED", "Expense Submitted"
    EXPENSE_REVIEWED = "EXPENSE_REVIEWED", "Expense Reviewed"
    EXPENSE_APPROVED = "EXPENSE_APPROVED", "Expense Approved"
    EXPENSE_REJECTED = "EXPENSE_REJECTED", "Expense Rejected"
    BILL_PENDING = "BILL_PENDING", "Bill Pending"
