from .test_email import Command as TestEmailCommand


class Command(TestEmailCommand):
    help = "Alias for test_email."
