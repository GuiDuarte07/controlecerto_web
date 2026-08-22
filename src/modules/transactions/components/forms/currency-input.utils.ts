export const MAX_CENTS = 99999999; // R$ 999.999,99

export function countDigits(value: string): number {
  let count = 0;

  for (let i = 0; i < value.length; i++) {
    const ch = value[i];
    if (ch >= "0" && ch <= "9") count++;
  }

  return count;
}

export function centsToDigits(cents: number): string {
  const safe = Number.isFinite(cents) && cents > 0 ? Math.floor(cents) : 0;
  const integerPart = Math.floor(safe / 100);
  const centsPart = safe % 100;

  return `${integerPart}${String(centsPart).padStart(2, "0")}`;
}

export function digitsToCents(digits: string): number {
  const parsed = Number.parseInt(digits.replace(/^0+(?=\d)/, ""), 10);

  return Number.isFinite(parsed) ? parsed : 0;
}

export function parsePastedCurrencyToCents(
  value: string,
  maxCents = MAX_CENTS,
): number | undefined {
  const normalized = value.replace(/[^\d.,]/g, "");
  const digitCount = countDigits(normalized);

  if (digitCount === 0) return undefined;

  const separators = normalized.match(/[.,]/g) ?? [];
  if (separators.length > 1) return undefined;

  let cents: number;

  if (separators.length === 0) {
    cents = Number.parseInt(normalized, 10) * 100;
  } else {
    const separator = separators[0];
    if (!separator) return undefined;

    const [integerRaw, decimalRaw = ""] = normalized.split(separator);
    const integerDigits = integerRaw || "0";
    const decimalDigits = decimalRaw.padEnd(2, "0").slice(0, 2);

    cents =
      Number.parseInt(integerDigits, 10) * 100 +
      Number.parseInt(decimalDigits || "0", 10);
  }

  if (!Number.isFinite(cents) || cents > maxCents) return undefined;

  return cents;
}
