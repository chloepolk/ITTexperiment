"use client"

import * as React from "react"
import { LOCALES, LOCALE_LABELS, type AppLocale } from "../core/index"
import { useAppLocale } from "./locale-provider"

export type LanguageSelectorProps = {
  className?: string
  /** Accessible name when no translated label is available yet. */
  "aria-label"?: string
  /** Optional id for the native select. */
  id?: string
}

/**
 * Drop-in language control. Uses a native `<select>` so consuming apps need no
 * design-system dependency. Style via `className` / CSS variables.
 */
export function LanguageSelector({
  className,
  "aria-label": ariaLabel = "Language",
  id,
}: LanguageSelectorProps) {
  const { locale, setLocale } = useAppLocale()

  return (
    <select
      id={id}
      aria-label={ariaLabel}
      className={className}
      value={locale}
      onChange={(event) => setLocale(event.target.value as AppLocale)}
    >
      {LOCALES.map((code) => (
        <option key={code} value={code}>
          {LOCALE_LABELS[code]}
        </option>
      ))}
    </select>
  )
}
