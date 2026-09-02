"use client"

export {
  LocaleProvider,
  useAppLocale,
  type LocaleProviderProps,
} from "./locale-provider"

export {
  LanguageSelector,
  type LanguageSelectorProps,
} from "./language-selector"

// Re-export core from /react for convenience in client components
export {
  LOCALES,
  DEFAULT_LOCALE,
  LOCALE_LABELS,
  LOCALE_BCP47,
  LOCALE_META,
  LOCALE_STORAGE_KEY,
  GLOSSARY_TERMS,
  isAppLocale,
  chatLanguageInstruction,
  mergeMessages,
  type AppLocale,
  type LocaleMessageMap,
  type ChatLanguageOptions,
} from "../core/index"
