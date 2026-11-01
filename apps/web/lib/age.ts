// The age-gate answer and the visitor's country. Country comes from the browser's language
// region (never IP lookup); the api holds the ages and help lines.
export type AgeAnswer = { answer: "ok" | "zero"; country: string };

export const AGE_COOKIE = "age";
const COUNTRY = /^[A-Z]{2}$/;

/** Languages that name one country when the browser sends no region ("de" → DE). */
const LANGUAGE_COUNTRY: Record<string, string> = {
  de: "DE",
  fr: "FR",
  it: "IT",
  es: "ES",
  nl: "NL",
  pl: "PL",
  ja: "JP",
  ko: "KR",
};

export function countryFromAcceptLanguage(header: string | null): string | undefined {
  const first = header?.split(",")[0]?.split(";")[0]?.trim();
  if (!first) return undefined;
  const [language, region] = first.split("-");
  const country = region?.toUpperCase();
  if (country && COUNTRY.test(country)) return country;
  return LANGUAGE_COUNTRY[language?.toLowerCase() ?? ""];
}

export function parseAgeCookie(value: string | undefined): AgeAnswer | null {
  const [answer, country] = (value ?? "").split("|");
  if (
    (answer !== "ok" && answer !== "zero") ||
    !country ||
    !(COUNTRY.test(country) || country === "ZZ")
  )
    return null;
  return { answer, country };
}

export const validCountry = (value: unknown): string | undefined =>
  typeof value === "string" && (COUNTRY.test(value) || value === "ZZ") ? value : undefined;
