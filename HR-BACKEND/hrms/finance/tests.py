from datetime import timedelta
from unittest.mock import patch

from django.core import mail
from django.utils import timezone
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import override_settings
from rest_framework import status
from rest_framework.test import APIClient, APITestCase

from accounts.models import User
from common.choices import ExpenseStatus, UserRole
from finance.models import Advance, AuditLog, Expense, LedgerEntry, Notification


@override_settings(
    EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend",
    DEFAULT_FROM_EMAIL="no-reply@test.local",
    FRONTEND_BASE_URL="http://127.0.0.1:5173",
    EMAIL_RAISE_DELIVERY_ERRORS=True,
)
class FinanceFlowTests(APITestCase):
    def setUp(self):
        self.client = APIClient()
        mail.outbox = []
        self.maker1 = self._user("maker1", UserRole.MAKER, password="password")
        self.maker2 = self._user("maker2", UserRole.MAKER, password="password")
        self.checker1 = self._user("checker1", UserRole.CHECKER, password="password")
        self.checker2 = self._user("checker2", UserRole.CHECKER, password="password")
        self.checker3 = self._user("checker3", UserRole.CHECKER, password="password")

        self.advance = Advance.objects.create(
            reference="ADV-TEST-0001",
            maker=self.maker1,
            allocated_by=self.checker1,
            total_amount="10000.00",
            spent_amount="0.00",
            remarks="Test advance",
        )
        LedgerEntry.objects.create(
            advance=self.advance,
            entry_type="ADVANCE",
            amount="10000.00",
            balance_after="10000.00",
            note="Initial allocation",
        )

    def _user(self, username, role, password="password"):
        return User.objects.create_user(
            username=username,
            password=password,
            email=f"{username}@example.com",
            full_name=username.title(),
            role=role,
        )

    def _draft_expense(self, amount="1000.00"):
        return Expense.objects.create(
            reference=f"EXP-TEST-{Expense.objects.count() + 1:04d}",
            advance=self.advance,
            maker=self.maker1,
            payable_to="Vendor",
            expense_date=timezone.localdate(),
            amount=amount,
            category="Stationery",
            purpose="Testing",
            payment_mode="Cash",
            remarks="",
            reviewed_by=self.checker1,
            approved_by=self.checker2,
        )

    def test_login_returns_tokens(self):
        response = self.client.post(
            "/api/auth/login/",
            {"username": "checker1", "password": "password"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)

    def test_checker_can_allocate_advance(self):
        self.client.force_authenticate(self.checker1)
        response = self.client.post(
            "/api/advances/",
            {"maker": self.maker1.id, "total_amount": "2500.00", "remarks": "New"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        advance = Advance.objects.get(reference=response.data["reference"])
        self.assertEqual(str(advance.balance_amount), "2500.00")
        self.assertEqual(advance.ledger_entries.filter(entry_type="ADVANCE").count(), 1)
        self.assertTrue(
            AuditLog.objects.filter(advance=advance, action="ADVANCE_ALLOCATED").exists()
        )

    def test_maker_cannot_allocate_advance(self):
        self.client.force_authenticate(self.maker1)
        response = self.client.post(
            "/api/advances/",
            {"maker": self.maker1.id, "total_amount": "2500.00"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_maker_can_create_expense_on_own_advance(self):
        self.client.force_authenticate(self.maker1)
        response = self.client.post(
            "/api/expenses/",
            {
                "advance": self.advance.id,
                "payable_to": "Stationery Shop",
                "expense_date": timezone.localdate().isoformat(),
                "amount": "1200.00",
                "category": "Stationery",
                "purpose": "Office supplies",
                "payment_mode": "Cash",
                "remarks": "Needed urgently",
                "reviewed_by": self.checker1.id,
                "approved_by": self.checker2.id,
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        expense = Expense.objects.get(id=response.data["id"])
        self.assertEqual(expense.maker_id, self.maker1.id)
        self.assertEqual(expense.amount_in_words, "One Thousand Two Hundred Rupees Only")
        self.assertTrue(
            AuditLog.objects.filter(expense=expense, action="EXPENSE_CREATED").exists()
        )

    def test_maker_cannot_create_expense_on_another_maker_advance(self):
        self.client.force_authenticate(self.maker2)
        response = self.client.post(
            "/api/expenses/",
            {
                "advance": self.advance.id,
                "payable_to": "Stationery Shop",
                "expense_date": timezone.localdate().isoformat(),
                "amount": "1200.00",
                "category": "Stationery",
                "purpose": "Office supplies",
                "payment_mode": "Cash",
                "reviewed_by": self.checker1.id,
                "approved_by": self.checker2.id,
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_submit_flow_only_from_draft(self):
        expense = self._draft_expense()
        self.client.force_authenticate(self.maker1)
        response = self.client.post(f"/api/expenses/{expense.id}/submit/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        expense.refresh_from_db()
        self.assertEqual(expense.status, ExpenseStatus.SUBMITTED)
        self.assertTrue(
            AuditLog.objects.filter(expense=expense, action="EXPENSE_SUBMITTED").exists()
        )
        notification = Notification.objects.get(user=self.checker1, related_expense=expense)
        self.assertIn("submitted for review", notification.title.lower())
        self.assertEqual(len(mail.outbox), 1)
        self.assertEqual(mail.outbox[0].to, [self.checker1.email])
        self.assertIn("submitted for review", mail.outbox[0].subject.lower())

        response = self.client.post(f"/api/expenses/{expense.id}/submit/")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(len(mail.outbox), 1)

    def test_review_flow_only_from_submitted(self):
        expense = self._draft_expense()
        self.client.force_authenticate(self.checker1)
        response = self.client.post(f"/api/expenses/{expense.id}/review/")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        expense.status = ExpenseStatus.SUBMITTED
        expense.save(update_fields=["status", "updated_at"])
        response = self.client.post(f"/api/expenses/{expense.id}/review/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        expense.refresh_from_db()
        self.assertEqual(expense.status, ExpenseStatus.REVIEWED)
        approver_notification = Notification.objects.get(user=self.checker2, related_expense=expense)
        self.assertIn("final approval", approver_notification.title.lower())
        maker_notification = Notification.objects.get(user=self.maker1, related_expense=expense)
        self.assertIn("final approval", maker_notification.title.lower())
        self.assertEqual(len(mail.outbox), 1)
        self.assertEqual(mail.outbox[0].to, [self.checker2.email])
        self.assertIn("final approval", mail.outbox[0].subject.lower())

    def test_submitted_expense_is_visible_only_to_assigned_reviewer(self):
        expense = self._draft_expense()
        expense.status = ExpenseStatus.SUBMITTED
        expense.save(update_fields=["status", "updated_at"])

        self.client.force_authenticate(self.checker1)
        response = self.client.get("/api/expenses/", {"status": ExpenseStatus.SUBMITTED})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data["results"]
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]["id"], expense.id)

        self.client.force_authenticate(self.checker2)
        response = self.client.get("/api/expenses/", {"status": ExpenseStatus.SUBMITTED})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["results"], [])

    def test_reviewed_expense_is_visible_only_to_assigned_approver(self):
        expense = self._draft_expense()
        expense.status = ExpenseStatus.REVIEWED
        expense.save(update_fields=["status", "updated_at"])

        self.client.force_authenticate(self.checker2)
        response = self.client.get("/api/expenses/", {"status": ExpenseStatus.REVIEWED})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data["results"]
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]["id"], expense.id)

        self.client.force_authenticate(self.checker1)
        response = self.client.get("/api/expenses/", {"status": ExpenseStatus.REVIEWED})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["results"], [])

    def test_approve_flow_updates_advance_and_creates_ledger_entry(self):
        expense = self._draft_expense(amount="2000.00")
        expense.status = ExpenseStatus.REVIEWED
        expense.save(update_fields=["status", "updated_at"])

        self.client.force_authenticate(self.checker2)
        response = self.client.post(f"/api/expenses/{expense.id}/approve/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.advance.refresh_from_db()
        expense.refresh_from_db()
        self.assertEqual(expense.status, ExpenseStatus.APPROVED)
        self.assertEqual(str(self.advance.spent_amount), "2000.00")
        self.assertEqual(str(self.advance.balance_amount), "8000.00")
        ledger = LedgerEntry.objects.get(expense=expense, entry_type="SPEND")
        self.assertEqual(str(ledger.balance_after), "8000.00")
        self.assertTrue(
            AuditLog.objects.filter(expense=expense, action="EXPENSE_APPROVED").exists()
        )
        notification = Notification.objects.get(user=self.maker1, related_expense=expense)
        self.assertIn("approved", notification.title.lower())
        self.assertEqual(len(mail.outbox), 1)
        self.assertEqual(mail.outbox[0].to, [self.maker1.email])
        self.assertIn("approved", mail.outbox[0].subject.lower())

    def test_expense_amount_cannot_exceed_remaining_balance(self):
        self.client.force_authenticate(self.maker1)
        response = self.client.post(
            "/api/expenses/",
            {
                "advance": self.advance.id,
                "payable_to": "Big Vendor",
                "expense_date": timezone.localdate().isoformat(),
                "amount": "20000.00",
                "category": "Maintenance",
                "purpose": "Too large",
                "payment_mode": "Cash",
                "reviewed_by": self.checker1.id,
                "approved_by": self.checker2.id,
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_upload_bill_only_from_approved(self):
        expense = self._draft_expense()
        self.client.force_authenticate(self.maker1)
        response = self.client.post(f"/api/expenses/{expense.id}/upload-bill/")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        expense.status = ExpenseStatus.APPROVED
        expense.save(update_fields=["status", "updated_at"])

        response = self.client.post(
            f"/api/expenses/{expense.id}/upload-bill/",
            {"bill_file": SimpleUploadedFile("bill.pdf", b"%PDF-1.4 demo bill")},
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        expense.refresh_from_db()
        self.assertEqual(expense.status, ExpenseStatus.BILL_SUBMITTED)
        self.assertTrue(
            AuditLog.objects.filter(expense=expense, action="BILL_UPLOADED").exists()
        )
        notification = Notification.objects.get(user=self.checker1, related_expense=expense)
        self.assertIn("bill submitted", notification.title.lower())
        self.assertEqual(len(mail.outbox), 1)
        self.assertEqual(mail.outbox[0].to, [self.checker1.email])
        self.assertIn("bill submitted", mail.outbox[0].subject.lower())

    def test_close_only_from_bill_submitted(self):
        expense = self._draft_expense()
        self.client.force_authenticate(self.checker1)
        response = self.client.post(f"/api/expenses/{expense.id}/close/")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        expense.status = ExpenseStatus.BILL_SUBMITTED
        expense.save(update_fields=["status", "updated_at"])
        response = self.client.post(f"/api/expenses/{expense.id}/close/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        expense.refresh_from_db()
        self.assertEqual(expense.status, ExpenseStatus.CLOSED)
        self.assertTrue(
            AuditLog.objects.filter(expense=expense, action="EXPENSE_CLOSED").exists()
        )
        notification = Notification.objects.get(user=self.maker1, related_expense=expense)
        self.assertIn("closed", notification.title.lower())
        self.assertEqual(len(mail.outbox), 1)
        self.assertEqual(mail.outbox[0].to, [self.maker1.email])
        self.assertIn("closed", mail.outbox[0].subject.lower())

    def test_only_assigned_reviewer_can_close_bill_submitted_expense(self):
        expense = self._draft_expense()
        expense.status = ExpenseStatus.BILL_SUBMITTED
        expense.save(update_fields=["status", "updated_at"])

        self.client.force_authenticate(self.checker2)
        response = self.client.post(f"/api/expenses/{expense.id}/close/")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_maker_balances_endpoint_returns_correct_totals(self):
        another_advance = Advance.objects.create(
            reference="ADV-TEST-0002",
            maker=self.maker1,
            allocated_by=self.checker1,
            total_amount="5000.00",
            spent_amount="1000.00",
            remarks="Second advance",
        )
        LedgerEntry.objects.create(
            advance=another_advance,
            entry_type="ADVANCE",
            amount="5000.00",
            balance_after="5000.00",
            note="Second allocation",
        )

        self.client.force_authenticate(self.checker1)
        response = self.client.get("/api/advances/maker-balances/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        maker_row = next(item for item in response.data if item["maker_id"] == self.maker1.id)
        self.assertEqual(maker_row["total_advance"], "15000.00")
        self.assertEqual(maker_row["total_spent"], "1000.00")
        self.assertEqual(maker_row["remaining_balance"], "14000.00")
        self.assertEqual(maker_row["active_advances"], 2)

    def test_checker_options_returns_active_checkers(self):
        self.client.force_authenticate(self.maker1)
        response = self.client.get("/api/auth/checker-options/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        usernames = [item["username"] for item in response.data]
        self.assertEqual(usernames, ["checker1", "checker2", "checker3"])

    def test_expense_date_must_be_within_allowed_range(self):
        self.client.force_authenticate(self.maker1)
        response = self.client.post(
            "/api/expenses/",
            {
                "advance": self.advance.id,
                "payable_to": "Late Entry",
                "expense_date": (timezone.localdate() - timedelta(days=3)).isoformat(),
                "amount": "100.00",
                "category": "Stationery",
                "purpose": "Too old",
                "payment_mode": "Cash",
                "reviewed_by": self.checker1.id,
                "approved_by": self.checker2.id,
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("expense_date", response.data)

    def test_upi_requires_transaction_reference(self):
        self.client.force_authenticate(self.maker1)
        response = self.client.post(
            "/api/expenses/",
            {
                "advance": self.advance.id,
                "payable_to": "UPI Vendor",
                "expense_date": timezone.localdate().isoformat(),
                "amount": "100.00",
                "category": "Stationery",
                "purpose": "UPI expense",
                "payment_mode": "UPI",
                "reviewed_by": self.checker1.id,
                "approved_by": self.checker2.id,
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("transaction_reference", response.data)

    def test_reject_requires_reason_and_stores_it(self):
        expense = self._draft_expense()
        expense.status = ExpenseStatus.SUBMITTED
        expense.save(update_fields=["status", "updated_at"])

        self.client.force_authenticate(self.checker1)
        response = self.client.post(f"/api/expenses/{expense.id}/reject/", {}, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("rejection_reason", response.data)
        self.assertEqual(len(mail.outbox), 0)

        response = self.client.post(
            f"/api/expenses/{expense.id}/reject/",
            {"rejection_reason": "Please attach correct supporting details."},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        expense.refresh_from_db()
        self.assertEqual(expense.status, ExpenseStatus.REJECTED)
        self.assertEqual(expense.rejection_reason, "Please attach correct supporting details.")
        notification = Notification.objects.get(user=self.maker1, related_expense=expense)
        self.assertTrue(notification.message.startswith("Your expense was rejected"))
        self.assertEqual(len(mail.outbox), 1)
        self.assertEqual(mail.outbox[0].to, [self.maker1.email])
        self.assertIn("rejected", mail.outbox[0].subject.lower())
        self.assertIn("Please attach correct supporting details.", mail.outbox[0].body)

    def test_approver_reject_sends_email_to_maker(self):
        expense = self._draft_expense()
        expense.status = ExpenseStatus.REVIEWED
        expense.save(update_fields=["status", "updated_at"])

        self.client.force_authenticate(self.checker2)
        response = self.client.post(
            f"/api/expenses/{expense.id}/reject/",
            {"rejection_reason": "Final approval failed due to policy mismatch."},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        expense.refresh_from_db()
        self.assertEqual(expense.status, ExpenseStatus.REJECTED)
        self.assertEqual(
            expense.rejection_reason,
            "Final approval failed due to policy mismatch.",
        )
        notification = Notification.objects.get(user=self.maker1, related_expense=expense)
        self.assertIn("rejected", notification.title.lower())
        self.assertEqual(len(mail.outbox), 1)
        self.assertEqual(mail.outbox[0].to, [self.maker1.email])
        self.assertIn("rejected", mail.outbox[0].subject.lower())
        self.assertIn("Final approval failed due to policy mismatch.", mail.outbox[0].body)

    @patch("finance.email_service.send_mail", side_effect=RuntimeError("SMTP auth failed"))
    def test_review_flow_does_not_500_when_email_sending_fails(self, mocked_send_mail):
        expense = self._draft_expense()
        expense.status = ExpenseStatus.SUBMITTED
        expense.save(update_fields=["status", "updated_at"])

        self.client.force_authenticate(self.checker1)
        response = self.client.post(f"/api/expenses/{expense.id}/review/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        expense.refresh_from_db()
        self.assertEqual(expense.status, ExpenseStatus.REVIEWED)
        self.assertTrue(mocked_send_mail.called)
        approver_notification = Notification.objects.get(user=self.checker2, related_expense=expense)
        self.assertIn("final approval", approver_notification.title.lower())

    def test_only_assigned_checker_can_reject_for_the_current_stage(self):
        expense = self._draft_expense()
        expense.status = ExpenseStatus.SUBMITTED
        expense.save(update_fields=["status", "updated_at"])

        self.client.force_authenticate(self.checker2)
        response = self.client.post(
            f"/api/expenses/{expense.id}/reject/",
            {"rejection_reason": "Not allowed"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        expense.status = ExpenseStatus.REVIEWED
        expense.save(update_fields=["status", "updated_at"])

        self.client.force_authenticate(self.checker1)
        response = self.client.post(
            f"/api/expenses/{expense.id}/reject/",
            {"rejection_reason": "Still not allowed"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_notifications_endpoints_are_scoped_to_current_user(self):
        expense = self._draft_expense()
        Notification.objects.create(
            user=self.maker1,
            title="Test notification",
            message="Body",
            notification_type="EXPENSE_APPROVED",
            related_expense=expense,
            action_url=f"/expenses/{expense.id}",
        )

        self.client.force_authenticate(self.maker1)
        response = self.client.get("/api/notifications/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["results"]), 1)

        notification_id = response.data["results"][0]["id"]
        response = self.client.patch(f"/api/notifications/{notification_id}/read/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data["notification"]["is_read"])
        self.assertEqual(response.data["unread_count"], 0)

        Notification.objects.create(
            user=self.maker1,
            title="Another notification",
            message="Body",
            notification_type="EXPENSE_REJECTED",
        )
        response = self.client.get("/api/notifications/unread-count/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["unread_count"], 1)

        response = self.client.patch("/api/notifications/mark-all-read/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["updated"], 1)
        self.assertEqual(response.data["unread_count"], 0)

        self.client.force_authenticate(self.maker2)
        response = self.client.get("/api/notifications/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["results"], [])

    def test_dashboard_includes_recent_notifications_and_unread_count(self):
        expense = self._draft_expense()
        Notification.objects.create(
            user=self.maker1,
            title="Expense approved",
            message="Upload bill next.",
            notification_type="EXPENSE_APPROVED",
            related_expense=expense,
            action_url=f"/expenses/{expense.id}",
        )

        self.client.force_authenticate(self.maker1)
        response = self.client.get("/api/dashboard/maker/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["unread_notifications_count"], 1)
        self.assertEqual(len(response.data["recent_notifications"]), 1)

    def test_checker_dashboard_counts_only_assigned_review_and_approval_work(self):
        review_item = self._draft_expense()
        review_item.status = ExpenseStatus.SUBMITTED
        review_item.save(update_fields=["status", "updated_at"])

        approval_item = Expense.objects.create(
            reference=f"EXP-TEST-{Expense.objects.count() + 1:04d}",
            advance=self.advance,
            maker=self.maker1,
            payable_to="Approver Vendor",
            expense_date=timezone.localdate(),
            amount="500.00",
            category="Stationery",
            purpose="Approval queue",
            payment_mode="Cash",
            remarks="",
            reviewed_by=self.checker2,
            approved_by=self.checker1,
            status=ExpenseStatus.REVIEWED,
        )

        self.client.force_authenticate(self.checker1)
        response = self.client.get("/api/dashboard/checker/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["pending_reviews"], 1)
        self.assertEqual(response.data["pending_approvals"], 1)

        self.client.force_authenticate(self.checker2)
        response = self.client.get("/api/dashboard/checker/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["pending_reviews"], 0)
        self.assertEqual(response.data["pending_approvals"], 0)

    def test_checker_dashboard_counts_only_assigned_bill_verifications(self):
        reviewer_bill = self._draft_expense()
        reviewer_bill.status = ExpenseStatus.BILL_SUBMITTED
        reviewer_bill.save(update_fields=["status", "updated_at"])

        Expense.objects.create(
            reference=f"EXP-TEST-{Expense.objects.count() + 1:04d}",
            advance=self.advance,
            maker=self.maker1,
            payable_to="Other Bill Vendor",
            expense_date=timezone.localdate(),
            amount="400.00",
            category="Stationery",
            purpose="Other bill queue",
            payment_mode="Cash",
            remarks="",
            reviewed_by=self.checker2,
            approved_by=self.checker1,
            status=ExpenseStatus.BILL_SUBMITTED,
        )

        self.client.force_authenticate(self.checker1)
        response = self.client.get("/api/dashboard/checker/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["pending_bill_verifications"], 1)

        self.client.force_authenticate(self.checker2)
        response = self.client.get("/api/dashboard/checker/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["pending_bill_verifications"], 1)

    def test_bill_submitted_expenses_visible_only_to_assigned_reviewer(self):
        expense = self._draft_expense()
        expense.status = ExpenseStatus.BILL_SUBMITTED
        expense.save(update_fields=["status", "updated_at"])

        self.client.force_authenticate(self.checker1)
        response = self.client.get("/api/expenses/", {"status": ExpenseStatus.BILL_SUBMITTED})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["results"]), 1)
        self.assertEqual(response.data["results"][0]["id"], expense.id)

        self.client.force_authenticate(self.checker2)
        response = self.client.get("/api/expenses/", {"status": ExpenseStatus.BILL_SUBMITTED})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["results"], [])

    def test_checker_cannot_retrieve_unassigned_expense_by_id(self):
        expense = self._draft_expense()
        expense.status = ExpenseStatus.SUBMITTED
        expense.save(update_fields=["status", "updated_at"])

        self.client.force_authenticate(self.checker3)
        response = self.client.get(f"/api/expenses/{expense.id}/")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_checker_cannot_view_history_for_unassigned_expense(self):
        expense = self._draft_expense()
        expense.status = ExpenseStatus.REVIEWED
        expense.save(update_fields=["status", "updated_at"])

        self.client.force_authenticate(self.checker3)
        response = self.client.get(f"/api/expenses/{expense.id}/history/")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_health_endpoint_returns_ok(self):
        response = self.client.get("/health/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["status"], "ok")

    def test_bill_upload_rejects_unsafe_file_types(self):
        expense = self._draft_expense()
        expense.status = ExpenseStatus.APPROVED
        expense.save(update_fields=["status", "updated_at"])

        self.client.force_authenticate(self.maker1)
        response = self.client.post(
            f"/api/expenses/{expense.id}/upload-bill/",
            {"bill_file": SimpleUploadedFile("invoice.exe", b"unsafe")},
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("bill_file", response.data)
