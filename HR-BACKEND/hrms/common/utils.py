import os
from datetime import timedelta
from decimal import Decimal
from urllib.parse import urlparse

from django.utils import timezone


def env_bool(name, default=False):
    value = os.getenv(name)
    if value is None:
        return default
    normalized = value.strip().strip('"').strip("'")
    if normalized == "":
        return default
    return normalized.lower() in {"1", "true", "yes", "on"}


def env_int(name, default=0):
    value = os.getenv(name)
    if value is None:
        return default
    normalized = value.strip().strip('"').strip("'")
    if normalized == "":
        return default
    return int(normalized)


def env_csv(name, default=None):
    value = os.getenv(name)
    if not value:
        return default or []
    return [item.strip() for item in value.split(",") if item.strip()]


def env_url_list(name, default=None):
    values = env_csv(name, default=default)
    return [value.rstrip("/") for value in values]


def env_hosts_list(name, default=None):
    values = env_csv(name, default=default)
    normalized = []

    for value in values:
        parsed = urlparse(value if "://" in value else f"//{value}")
        host = parsed.netloc or parsed.path
        host = host.split(":")[0].strip().strip("[]")
        if host:
            normalized.append(host)

    return normalized


def money(value):
    return Decimal(str(value or "0")).quantize(Decimal("0.01"))


def generate_reference(prefix, count):
    today = timezone.localdate().strftime("%Y%m%d")
    if isinstance(count, int):
        suffix = f"{count:04d}"
    else:
        suffix = str(count).strip()
    return f"{prefix}-{today}-{suffix}"


ONES = [
    "Zero",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
]

TENS = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
]


def get_allowed_expense_date_range():
    today = timezone.localdate()
    return today - timedelta(days=2), today + timedelta(days=7)


def _two_digit_words(number):
    if number < 20:
        return ONES[number]
    tens, remainder = divmod(number, 10)
    return TENS[tens] if remainder == 0 else f"{TENS[tens]} {ONES[remainder]}"


def _three_digit_words(number):
    hundreds, remainder = divmod(number, 100)
    parts = []
    if hundreds:
        parts.append(f"{ONES[hundreds]} Hundred")
    if remainder:
        parts.append(_two_digit_words(remainder))
    return " ".join(parts) if parts else ONES[0]


def integer_to_words(number):
    number = int(number)
    if number == 0:
        return ONES[0]

    segments = [
        (10000000, "Crore"),
        (100000, "Lakh"),
        (1000, "Thousand"),
        (1, ""),
    ]
    parts = []
    remainder = number

    for divisor, label in segments:
        chunk, remainder = divmod(remainder, divisor)
        if not chunk:
            continue
        chunk_words = _three_digit_words(chunk) if chunk < 1000 else integer_to_words(chunk)
        parts.append(chunk_words if not label else f"{chunk_words} {label}")

    return " ".join(parts)


def amount_to_words(value):
    normalized = money(value)
    whole = int(normalized)
    paise = int((normalized - Decimal(whole)) * 100)

    result = f"{integer_to_words(whole)} Rupees"
    if paise:
        result += f" and {integer_to_words(paise)} Paise"
    return f"{result} Only"
