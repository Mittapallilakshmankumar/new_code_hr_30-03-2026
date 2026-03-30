const ONES = [
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
];

const TENS = [
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
];

function toTwoDigits(number) {
  if (number < 20) {
    return ONES[number];
  }

  const tens = Math.floor(number / 10);
  const remainder = number % 10;
  return remainder ? `${TENS[tens]} ${ONES[remainder]}` : TENS[tens];
}

function toThreeDigits(number) {
  const hundreds = Math.floor(number / 100);
  const remainder = number % 100;
  const parts = [];

  if (hundreds) {
    parts.push(`${ONES[hundreds]} Hundred`);
  }

  if (remainder) {
    parts.push(toTwoDigits(remainder));
  }

  return parts.join(" ") || ONES[0];
}

function integerToWords(number) {
  if (number === 0) {
    return ONES[0];
  }

  const segments = [
    [10000000, "Crore"],
    [100000, "Lakh"],
    [1000, "Thousand"],
    [1, ""],
  ];

  let remainder = number;
  const parts = [];

  segments.forEach(([divisor, label]) => {
    const chunk = Math.floor(remainder / divisor);
    remainder %= divisor;

    if (!chunk) {
      return;
    }

    const chunkWords = chunk < 1000 ? toThreeDigits(chunk) : integerToWords(chunk);
    parts.push(label ? `${chunkWords} ${label}` : chunkWords);
  });

  return parts.join(" ");
}

export function amountToWords(value) {
  const numericValue = Number(value || 0);

  if (!Number.isFinite(numericValue) || numericValue <= 0) {
    return "";
  }

  const normalized = numericValue.toFixed(2);
  const [wholePart, decimalPart] = normalized.split(".");
  const whole = Number(wholePart);
  const paise = Number(decimalPart);

  let words = `${integerToWords(whole)} Rupees`;

  if (paise) {
    words += ` and ${integerToWords(paise)} Paise`;
  }

  return `${words} Only`;
}
