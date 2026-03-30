from django.core.management.base import BaseCommand

from accounts.models import User
from common.choices import ExpenseStatus, UserRole
from finance.models import Advance, AuditLog, Expense, LedgerEntry
from finance.services import (
    approve_expense,
    close_expense,
    create_advance,
    create_expense,
    reject_expense,
    review_expense,
    submit_expense,
    upload_bill,
)


class Command(BaseCommand):
    help = "Seed demo users, advances, expenses, and ledger entries for the petty cash system."

    def handle(self, *args, **options):
        AuditLog.objects.all().delete()
        LedgerEntry.objects.all().delete()
        Expense.objects.all().delete()
        Advance.objects.all().delete()
        User.objects.exclude(is_superuser=True).delete()

        maker1 = self._user("maker1", "maker1@example.com", "Maker One", UserRole.MAKER)
        maker2 = self._user("maker2", "maker2@example.com", "Maker Two", UserRole.MAKER)
        checker1 = self._user(
            "checker1", "checker1@example.com", "Checker One", UserRole.CHECKER
        )
        checker2 = self._user(
            "checker2", "checker2@example.com", "Checker Two", UserRole.CHECKER
        )

        active_advance = create_advance(
            maker=maker1,
            allocated_by=checker1,
            total_amount="20000",
            remarks="Admin and local travel float",
        )
        untouched_active_advance = create_advance(
            maker=maker2,
            allocated_by=checker2,
            total_amount="12000",
            remarks="Fresh active advance for local UAT.",
        )
        exhausted_advance = create_advance(
            maker=maker2,
            allocated_by=checker1,
            total_amount="15000",
            remarks="Branch maintenance allocation",
        )
        closed_advance = create_advance(
            maker=maker1,
            allocated_by=checker2,
            total_amount="5000",
            remarks="Courier and dispatch reserve",
        )

        draft_expense = create_expense(
            advance=active_advance,
            maker=maker1,
            reviewed_by=checker1,
            approved_by=checker2,
            payable_to="Office Stores",
            amount="1000",
            category="Stationery",
            purpose="Desk supplies",
            payment_mode="Cash",
            remarks="Still being prepared",
        )

        submitted_expense = create_expense(
            advance=active_advance,
            maker=maker1,
            reviewed_by=checker1,
            approved_by=checker2,
            payable_to="Metro Travel Desk",
            amount="1500",
            category="Travel",
            purpose="Local client visit travel",
            payment_mode="UPI",
            remarks="Submitted and waiting for review",
        )
        submit_expense(expense=submitted_expense, actor=maker1)

        reviewed_expense = create_expense(
            advance=active_advance,
            maker=maker1,
            reviewed_by=checker1,
            approved_by=checker2,
            payable_to="Repair Hub",
            amount="2500",
            category="Maintenance",
            purpose="Chair wheel replacements",
            payment_mode="Cash",
            remarks="Reviewed and pending approval",
        )
        submit_expense(expense=reviewed_expense, actor=maker1)
        review_expense(expense=reviewed_expense, actor=checker1)

        approved_expense = create_expense(
            advance=active_advance,
            maker=maker1,
            reviewed_by=checker1,
            approved_by=checker2,
            payable_to="Utility Partner",
            amount="3000",
            category="Utilities",
            purpose="Pantry water cans",
            payment_mode="Bank Transfer",
            remarks="Approved and awaiting bill",
        )
        submit_expense(expense=approved_expense, actor=maker1)
        review_expense(expense=approved_expense, actor=checker1)
        approve_expense(expense=approved_expense, actor=checker2)

        bill_submitted_expense = create_expense(
            advance=active_advance,
            maker=maker1,
            reviewed_by=checker1,
            approved_by=checker2,
            payable_to="Quick Printer",
            amount="4000",
            category="Office Supplies",
            purpose="Printer toner purchase",
            payment_mode="Card",
            remarks="Bill uploaded and waiting for closure",
        )
        submit_expense(expense=bill_submitted_expense, actor=maker1)
        review_expense(expense=bill_submitted_expense, actor=checker1)
        approve_expense(expense=bill_submitted_expense, actor=checker2)
        upload_bill(expense=bill_submitted_expense, actor=maker1, bill_file=self._demo_file("printer-bill.pdf"))

        closed_expense = create_expense(
            advance=closed_advance,
            maker=maker1,
            reviewed_by=checker2,
            approved_by=checker2,
            payable_to="Courier Partner",
            amount="5000",
            category="Administrative",
            purpose="Regional dispatch",
            payment_mode="Cash",
            remarks="Closed after bill verification",
        )
        submit_expense(expense=closed_expense, actor=maker1)
        review_expense(expense=closed_expense, actor=checker2)
        approve_expense(expense=closed_expense, actor=checker2)
        upload_bill(expense=closed_expense, actor=maker1, bill_file=self._demo_file("courier-bill.pdf"))
        close_expense(expense=closed_expense, actor=checker2)

        rejected_expense = create_expense(
            advance=exhausted_advance,
            maker=maker2,
            reviewed_by=checker1,
            approved_by=checker1,
            payable_to="Vendor Reject",
            amount="1000",
            category="Travel",
            purpose="Rejected claim",
            payment_mode="Cash",
            remarks="Rejected during review",
        )
        submit_expense(expense=rejected_expense, actor=maker2)
        reject_expense(
            expense=rejected_expense,
            actor=checker1,
            rejection_reason="Rejected demo expense during review stage.",
        )

        exhausted_closed_expense = create_expense(
            advance=exhausted_advance,
            maker=maker2,
            reviewed_by=checker1,
            approved_by=checker1,
            payable_to="Electrical Contractor",
            amount="15000",
            category="Maintenance",
            purpose="Full branch maintenance",
            payment_mode="Bank Transfer",
            remarks="Exhausted advance example",
        )
        submit_expense(expense=exhausted_closed_expense, actor=maker2)
        review_expense(expense=exhausted_closed_expense, actor=checker1)
        approve_expense(expense=exhausted_closed_expense, actor=checker1)

        draft_expense.status = ExpenseStatus.DRAFT
        draft_expense.save(update_fields=["status", "updated_at"])

        self.stdout.write(self.style.SUCCESS("Demo data seeded successfully."))
        self.stdout.write("Demo credentials:")
        self.stdout.write("  maker1 / password")
        self.stdout.write("  maker2 / password")
        self.stdout.write("  checker1 / password")
        self.stdout.write("  checker2 / password")
        self.stdout.write(
            f"UAT-ready advances: {active_advance.reference}, {untouched_active_advance.reference}, {exhausted_advance.reference}, {closed_advance.reference}"
        )

    def _user(self, username, email, full_name, role):
        user, _ = User.objects.get_or_create(
            username=username,
            defaults={
                "email": email,
                "full_name": full_name,
                "role": role,
                "is_active": True,
            },
        )
        user.set_password("password")
        user.email = email
        user.full_name = full_name
        user.role = role
        user.is_active = True
        user.save()
        return user

    def _demo_file(self, filename):
        from django.core.files.base import ContentFile

        return ContentFile(b"demo bill content", name=filename)
