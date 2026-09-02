"use client"

import * as React from "react"
import { NextIntlClientProvider } from "next-intl"
import {
  DEFAULT_LOCALE,
  LOCALE_STORAGE_KEY,
  type AppLocale,
  type LocaleMessageMap,
  isAppLocale,
} from "../core/index"

type LocaleContextValue = {
  locale: AppLocale
  setLocale: (locale: AppLocale) => void
}

const LocaleContext = React.createContext<LocaleContextValue | null>(null)

export type LocaleProviderProps = {
  children: React.ReactNode
  /** Per-locale message catalogs from the consuming app (`en` / `fr` / `de` / `es`). */
  messages: LocaleMessageMap
  /** localStorage key. Override per product if multiple Prosera apps share a domain. */
  storageKey?: string
  /** Default locale before hydration / when nothing is stored. */
  defaultLocale?: AppLocale
  /** IANA time zone passed to next-intl. */
  timeZone?: string
}

function readStoredLocale(storageKey: string, fallback: AppLocale): AppLocale {
  if (typeof window === "undefined") return fallback
  try {
    const stored = window.localStorage.getItem(storageKey)
    if (isAppLocale(stored)) return stored
  } catch {
    /* ignore */
  }
  return fallback
}

export function LocaleProvider({
  children,
  messages,
  storageKey = LOCALE_STORAGE_KEY,
  defaultLocale = DEFAULT_LOCALE,
  timeZone = "America/New_York",
}: LocaleProviderProps) {
  const [locale, setLocaleState] = React.useState<AppLocale>(defaultLocale)
  const [ready, setReady] = React.useState(false)

  React.useEffect(() => {
    const stored = readStoredLocale(storageKey, defaultLocale)
    setLocaleState(stored)
    document.documentElement.lang = stored
    setReady(true)
  }, [storageKey, defaultLocale])

  const setLocale = React.useCallback(
    (next: AppLocale) => {
      setLocaleState(next)
      document.documentElement.lang = next
      try {
        window.localStorage.setItem(storageKey, next)
      } catch {
        /* ignore */
      }
    },
    [storageKey],
  )

  const value = React.useMemo(
    () => ({ locale, setLocale }),
    [locale, setLocale],
  )

  const activeLocale = ready ? locale : defaultLocale
  const activeMessages = messages[activeLocale] ?? messages[defaultLocale]

  return (
    <LocaleContext.Provider value={value}>
      <NextIntlClientProvider
        locale={activeLocale}
        messages={activeMessages}
        timeZone={timeZone}
      >
        {children}
      </NextIntlClientProvider>
    </LocaleContext.Provider>
  )
}

export function useAppLocale(): LocaleContextValue {
  const ctx = React.useContext(LocaleContext)
  if (!ctx) {
    throw new Error("useAppLocale must be used within LocaleProvider from @prosera/i18n/react")
  }
  return ctx
}
