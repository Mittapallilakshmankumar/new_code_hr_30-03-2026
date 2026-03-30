import logging

from django.conf import settings
from django.core.exceptions import ValidationError as DjangoValidationError
from django.core.mail import send_mail
from django.core.validators import validate_email


logger = logging.getLogger("finance.email")
_MAIL_CONFIG_LOGGED = False


def get_mail_configuration_snapshot():
    return {
        "backend": settings.EMAIL_BACKEND,
        "host": settings.EMAIL_HOST or "<empty>",
        "port": settings.EMAIL_PORT,
        "use_tls": settings.EMAIL_USE_TLS,
        "use_ssl": getattr(settings, "EMAIL_USE_SSL", False),
        "user": settings.EMAIL_HOST_USER or "<empty>",
        "default_from": settings.DEFAULT_FROM_EMAIL or "<empty>",
        "timeout": getattr(settings, "EMAIL_TIMEOUT", "<unset>"),
    }


def _log_mail_configuration_once():
    global _MAIL_CONFIG_LOGGED
    if _MAIL_CONFIG_LOGGED:
        return

    config = get_mail_configuration_snapshot()
    logger.info(
        "Mail configuration loaded backend=%s host=%s port=%s user=%s use_tls=%s use_ssl=%s default_from=%s timeout=%s",
        config["backend"],
        config["host"],
        config["port"],
        config["user"],
        config["use_tls"],
        config["use_ssl"],
        config["default_from"],
        config["timeout"],
    )
    _MAIL_CONFIG_LOGGED = True


def _expense_value(expense, field_name, default="-"):
    value = getattr(expense, field_name, None)
    return value if value not in (None, "") else default


def _expense_url(expense):
    base_url = getattr(settings, "FRONTEND_BASE_URL", "").rstrip("/")
    path = f"/expenses/{expense.id}"
    return f"{base_url}{path}" if base_url else path


def _user_display_name(user):
    return user.full_name or user.username


def _validated_recipient(user, *, expense, event_type, raise_errors=False):
    email = (getattr(user, "email", "") or "").strip()
    if not email:
        message = (
            f"Cannot send workflow email: event={event_type} expense_id={expense.id} "
            f"user_id={user.id} username={user.username} reason=missing_email"
        )
        logger.warning(message)
        if raise_errors:
            raise ValueError(message)
        return None

    try:
        validate_email(email)
    except DjangoValidationError as exc:
        message = (
            f"Cannot send workflow email: event={event_type} expense_id={expense.id} "
            f"user_id={user.id} username={user.username} reason=invalid_email recipient={email}"
        )
        logger.error(message)
        if raise_errors:
            raise ValueError(message) from exc
        return None

    return email


def _send_workflow_email(
    *,
    expense,
    event_type,
    recipient_user,
    subject,
    body,
    old_status=None,
    new_status=None,
    raise_errors=False,
):
    _log_mail_configuration_once()
    recipient = _validated_recipient(
        recipient_user,
        expense=expense,
        event_type=event_type,
        raise_errors=raise_errors,
    )
    if not recipient:
        return 0

    from_email = settings.DEFAULT_FROM_EMAIL or settings.EMAIL_HOST_USER or "no-reply@pettycash.local"
    logger.info(
        "Attempting workflow email event=%s expense_id=%s old_status=%s new_status=%s recipient=%s from_email=%s",
        event_type,
        expense.id,
        old_status or "<unknown>",
        new_status or _expense_value(expense, "status", "<unknown>"),
        recipient,
        from_email,
    )

    try:
        sent_count = send_mail(
            subject=subject,
            message=body,
            from_email=from_email,
            recipient_list=[recipient],
            fail_silently=False,
        )
        logger.info(
            "Workflow email result event=%s expense_id=%s old_status=%s new_status=%s recipient=%s result=success sent_count=%s",
            event_type,
            expense.id,
            old_status or "<unknown>",
            new_status or _expense_value(expense, "status", "<unknown>"),
            recipient,
            sent_count,
        )
        return sent_count
    except Exception:
        logger.exception(
            "Workflow email failed event=%s expense_id=%s old_status=%s new_status=%s recipient=%s result=failure",
            event_type,
            expense.id,
            old_status or "<unknown>",
            new_status or _expense_value(expense, "status", "<unknown>"),
            recipient,
        )
        if raise_errors:
            raise
        return 0


def send_expense_submitted_to_reviewer(expense, *, old_status=None, new_status=None):
    subject = f"Expense {expense.reference} submitted for review"
    body = (
        f"Hello {_user_display_name(expense.reviewed_by)},\n\n"
        f"Expense {expense.reference} has been submitted for your review.\n"
        f"Expense ID: {expense.id}\n"
        f"Maker: {_user_display_name(expense.maker)}\n"
        f"Amount: INR {expense.amount}\n"
        f"Expense Date: {_expense_value(expense, 'expense_date')}\n"
        f"Category: {expense.category}\n"
        f"Purpose: {expense.purpose}\n"
        f"Current Action: maker submitted expense\n"
        f"Status: {new_status or expense.status}\n"
        f"Action URL: {_expense_url(expense)}\n\n"
        "Please review the expense and either approve it for the next stage or reject it.\n"
    )
    return _send_workflow_email(
        expense=expense,
        event_type="expense_submitted_to_reviewer",
        recipient_user=expense.reviewed_by,
        subject=subject,
        body=body,
        old_status=old_status,
        new_status=new_status,
        raise_errors=False,
    )


def send_expense_forwarded_to_approver(expense, *, old_status=None, new_status=None):
    subject = f"Expense {expense.reference} is ready for final approval"
    body = (
        f"Hello {_user_display_name(expense.approved_by)},\n\n"
        f"Expense {expense.reference} has cleared the review stage and is ready for your approval.\n"
        f"Expense ID: {expense.id}\n"
        f"Maker: {_user_display_name(expense.maker)}\n"
        f"Amount: INR {expense.amount}\n"
        f"Expense Date: {_expense_value(expense, 'expense_date')}\n"
        f"Category: {expense.category}\n"
        f"Purpose: {expense.purpose}\n"
        f"Current Action: reviewer forwarded expense to approver\n"
        f"Status: {new_status or expense.status}\n"
        f"Action URL: {_expense_url(expense)}\n\n"
        "Please approve or reject the expense from the final approval stage.\n"
    )
    return _send_workflow_email(
        expense=expense,
        event_type="expense_forwarded_to_approver",
        recipient_user=expense.approved_by,
        subject=subject,
        body=body,
        old_status=old_status,
        new_status=new_status,
        raise_errors=False,
    )


def send_reviewer_rejection_email(expense, rejection_message, *, old_status=None, new_status=None):
    subject = f"Expense {expense.reference} was rejected during review"
    body = (
        f"Hello {_user_display_name(expense.maker)},\n\n"
        f"Expense {expense.reference} was rejected by reviewer {_user_display_name(expense.reviewed_by)}.\n"
        f"Expense ID: {expense.id}\n"
        f"Amount: INR {expense.amount}\n"
        f"Expense Date: {_expense_value(expense, 'expense_date')}\n"
        f"Category: {expense.category}\n"
        f"Purpose: {expense.purpose}\n"
        f"Current Action: reviewer rejected expense\n"
        f"Status: {new_status or expense.status}\n"
        f"Rejection Reason: {rejection_message}\n"
        f"Action URL: {_expense_url(expense)}\n\n"
        "Please review the rejection reason and update or recreate the expense if needed.\n"
    )
    return _send_workflow_email(
        expense=expense,
        event_type="reviewer_rejection",
        recipient_user=expense.maker,
        subject=subject,
        body=body,
        old_status=old_status,
        new_status=new_status,
        raise_errors=False,
    )


def send_approver_rejection_email(expense, rejection_message, *, old_status=None, new_status=None):
    subject = f"Expense {expense.reference} was rejected during final approval"
    body = (
        f"Hello {_user_display_name(expense.maker)},\n\n"
        f"Expense {expense.reference} was rejected by approver {_user_display_name(expense.approved_by)}.\n"
        f"Expense ID: {expense.id}\n"
        f"Amount: INR {expense.amount}\n"
        f"Expense Date: {_expense_value(expense, 'expense_date')}\n"
        f"Category: {expense.category}\n"
        f"Purpose: {expense.purpose}\n"
        f"Current Action: approver rejected expense\n"
        f"Status: {new_status or expense.status}\n"
        f"Rejection Reason: {rejection_message}\n"
        f"Action URL: {_expense_url(expense)}\n\n"
        "Please review the rejection reason and update or recreate the expense if needed.\n"
    )
    return _send_workflow_email(
        expense=expense,
        event_type="approver_rejection",
        recipient_user=expense.maker,
        subject=subject,
        body=body,
        old_status=old_status,
        new_status=new_status,
        raise_errors=False,
    )


def send_final_approval_email_to_maker(expense, *, old_status=None, new_status=None):
    subject = f"Expense {expense.reference} approved"
    body = (
        f"Hello {_user_display_name(expense.maker)},\n\n"
        f"Expense {expense.reference} has been fully approved.\n"
        f"Expense ID: {expense.id}\n"
        f"Amount: INR {expense.amount}\n"
        f"Expense Date: {_expense_value(expense, 'expense_date')}\n"
        f"Category: {expense.category}\n"
        f"Purpose: {expense.purpose}\n"
        f"Current Action: approver approved expense\n"
        f"Status: {new_status or expense.status}\n"
        f"Action URL: {_expense_url(expense)}\n\n"
        "You can now upload the supporting bill for final verification.\n"
    )
    return _send_workflow_email(
        expense=expense,
        event_type="final_approval_to_maker",
        recipient_user=expense.maker,
        subject=subject,
        body=body,
        old_status=old_status,
        new_status=new_status,
        raise_errors=False,
    )


def send_bill_submitted_email_to_reviewer(expense, *, old_status=None, new_status=None):
    subject = f"Bill submitted for expense {expense.reference}"
    body = (
        f"Hello {_user_display_name(expense.reviewed_by)},\n\n"
        f"The maker has uploaded the supporting bill for expense {expense.reference}.\n"
        f"Expense ID: {expense.id}\n"
        f"Maker: {_user_display_name(expense.maker)}\n"
        f"Amount: INR {expense.amount}\n"
        f"Expense Date: {_expense_value(expense, 'expense_date')}\n"
        f"Category: {expense.category}\n"
        f"Purpose: {expense.purpose}\n"
        f"Current Action: maker submitted bill\n"
        f"Status: {new_status or expense.status}\n"
        f"Action URL: {_expense_url(expense)}\n\n"
        "Please verify the bill and close the expense if everything is correct.\n"
    )
    return _send_workflow_email(
        expense=expense,
        event_type="bill_submitted_to_reviewer",
        recipient_user=expense.reviewed_by,
        subject=subject,
        body=body,
        old_status=old_status,
        new_status=new_status,
        raise_errors=False,
    )


def send_closed_email_to_maker(expense, *, old_status=None, new_status=None):
    subject = f"Expense {expense.reference} closed after bill verification"
    body = (
        f"Hello {_user_display_name(expense.maker)},\n\n"
        f"Expense {expense.reference} has been closed after bill verification.\n"
        f"Expense ID: {expense.id}\n"
        f"Amount: INR {expense.amount}\n"
        f"Expense Date: {_expense_value(expense, 'expense_date')}\n"
        f"Category: {expense.category}\n"
        f"Purpose: {expense.purpose}\n"
        f"Current Action: reviewer closed the expense\n"
        f"Status: {new_status or expense.status}\n"
        f"Action URL: {_expense_url(expense)}\n\n"
        "The petty cash workflow for this expense is now complete.\n"
    )
    return _send_workflow_email(
        expense=expense,
        event_type="expense_closed_to_maker",
        recipient_user=expense.maker,
        subject=subject,
        body=body,
        old_status=old_status,
        new_status=new_status,
        raise_errors=False,
    )
