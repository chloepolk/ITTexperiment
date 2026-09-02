/**
 * @prosera/i18n core — framework-agnostic locale contract + LLM instructions.
 * Safe to import from API routes, scripts, and React.
 */

export const LOCALES = ["en", "fr", "de", "es"] as const
export type AppLocale = (typeof LOCALES)[number]

export const DEFAULT_LOCALE: AppLocale = "en"
export const LOCALE_STORAGE_KEY = "prosera-locale"

export const LOCALE_LABELS: Record<AppLocale, string> = {
  en: "EN",
  fr: "FR",
  de: "DE",
  es: "ES",
}

/** BCP 47 tags for date/number formatting */
export const LOCALE_BCP47: Record<AppLocale, string> = {
  en: "en-US",
  fr: "fr-FR",
  de: "de-DE",
  es: "es-ES",
}

export const LOCALE_META: Record<
  AppLocale,
  { language: string; region: string }
> = {
  en: { language: "English", region: "United States" },
  fr: { language: "French", region: "France" },
  de: { language: "German", region: "Germany" },
  es: { language: "Spanish", region: "Spain" },
}

/** Product / feature names that must stay in English across locales */
export const GLOSSARY_TERMS = [
  "Prosera",
  "Compass",
  "BluePilot",
  "Action Center",
  "Commercial Center",
  "Market Intelligence",
  "Operations Center",
  "Control Center",
  "What-If",
  "What-If Sandbox",
  "Operating Loop",
  "Customer Score",
  "CI-04",
  "NTE",
  "XYZ",
] as const

export type GlossaryTerm = (typeof GLOSSARY_TERMS)[number]

export function isAppLocale(value: unknown): value is AppLocale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value)
}

export type ChatLanguageOptions = {
  /** Extra product terms to keep in English (merged with defaults). */
  glossary?: readonly string[]
}

/**
 * Append to BluePilot / sandbox system prompts so model replies match the UI locale.
 */
export function chatLanguageInstruction(
  locale: AppLocale,
  options: ChatLanguageOptions = {},
): string {
  const glossary = [
    ...GLOSSARY_TERMS,
    ...(options.glossary ?? []).filter(Boolean),
  ]
  const unique = [...new Set(glossary)]
  const glossaryList = unique.join(", ")

  if (locale === "en") {
    return `The user has the interface set to English. Respond entirely in natural, conversational English. Do not mix in other languages except for these glossary terms that stay as written: ${glossaryList}.`
  }

  const { language, region } = LOCALE_META[locale]
  return `The user has the interface set to ${language} (${region}). Respond entirely in natural, conversational ${language} — write as a native speaker would, not as a translation of an English answer. Do not mix in English except for these glossary terms that stay in English: ${glossaryList}. Keep the same tone and level of detail you would use in English, adapted naturally to how this is normally phrased in ${language}.`
}

type JsonRecord = Record<string, unknown>

function isPlainObject(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

/** Deep-merge message catalogs (later objects win). Use to layer shell + app strings. */
export function mergeMessages<T extends JsonRecord>(
  ...layers: Array<T | JsonRecord | undefined | null>
): T {
  const out: JsonRecord = {}
  for (const layer of layers) {
    if (!layer) continue
    for (const [key, value] of Object.entries(layer)) {
      if (isPlainObject(value) && isPlainObject(out[key])) {
        out[key] = mergeMessages(out[key] as JsonRecord, value)
      } else {
        out[key] = value
      }
    }
  }
  return out as T
}

export type LocaleMessageMap<T = JsonRecord> = Record<AppLocale, T>
