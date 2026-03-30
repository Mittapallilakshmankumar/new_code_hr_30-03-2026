from django.conf import settings
from django.core.management.base import BaseCommand, CommandError

from finance.email_service import (
    _log_mail_configuration_once,
    _send_workflow_email,
    get_mail_configuration_snapshot,
)


class Command(BaseCommand):
    help = "Print the effective Django email configuration and send a test email."

    def add_arguments(self, parser):
        parser.add_argument(
            "--to",
            dest="recipient",
            help="Recipient email address. Defaults to DEFAULT_FROM_EMAIL or EMAIL_HOST_USER.",
        )
        parser.add_argument(
            "--subject",
            default="SMTP test email from Petty Cash Management System",
            help="Optional subject line for the sample email.",
        )

    def handle(self, *args, **options):
        recipient = options["recipient"] or settings.DEFAULT_FROM_EMAIL or settings.EMAIL_HOST_USER
        if not recipient:
            raise CommandError(
                "No recipient available. Pass --to or configure DEFAULT_FROM_EMAIL / EMAIL_HOST_USER."
            )

        config = get_mail_configuration_snapshot()
        self.stdout.write("Effective email configuration:")
        self.stdout.write(f"  ENV file: {getattr(settings, 'ENV_FILE_PATH', '<unknown>')}")
        self.stdout.write(f"  ENV loaded: {getattr(settings, 'ENV_FILE_LOADED', False)}")
        self.stdout.write(f"  EMAIL_BACKEND: {config['backend']}")
        self.stdout.write(f"  EMAIL_HOST: {config['host']}")
        self.stdout.write(f"  EMAIL_PORT: {config['port']}")
        self.stdout.write(f"  EMAIL_USE_TLS: {config['use_tls']}")
        self.stdout.write(f"  EMAIL_USE_SSL: {config['use_ssl']}")
        self.stdout.write(f"  EMAIL_HOST_USER: {config['user']}")
        self.stdout.write(f"  DEFAULT_FROM_EMAIL: {config['default_from']}")
        self.stdout.write(f"  Recipient: {recipient}")

        _log_mail_configuration_once()
        body = (
            "This is a manual SMTP verification email from the Petty Cash Management System.\n"
        )

        try:
            sent_count = _send_workflow_email(
                expense=type("EmailProbe", (), {"id": "manual-test"})(),
                event_type="manual_smtp_test",
                recipient_user=type(
                    "Recipient",
                    (),
                    {"id": "manual", "username": "manual-test", "email": recipient},
                )(),
                subject=options["subject"],
                body=body,
                raise_errors=True,
            )
        except Exception as exc:
            raise CommandError(f"Test email failed with {exc.__class__.__name__}: {exc}") from exc

        self.stdout.write(
            self.style.SUCCESS(
                f"Test email sent successfully to {recipient}. sent_count={sent_count}"
            )
        )
