# `@prosera/i18n`

Reusable Prosera localization kit for **separate GitHub build repos**.

Carries the shared runtime (locales, glossary, provider, language selector, LLM language instruction) plus a CLI to keep EN/FR/DE/ES catalogs in parity. **Each build still owns its product copy** in `src/messages/{en,fr,de,es}.json`.

## Install into another build repo

### Option A — GitHub dependency (recommended for private multi-repo)

1. Push this package to its own repo (e.g. `Prosera/prosera-i18n`), or keep it as `packages/prosera-i18n` in a shared kit repo and point at that path.
2. In the consuming build:

```bash
npm install github:YOUR_ORG/prosera-i18n#v1.0.0
# or
npm install git+ssh://git@github.com/YOUR_ORG/prosera-i18n.git#v1.0.0
```

```json
{
  "dependencies": {
    "@prosera/i18n": "github:YOUR_ORG/prosera-i18n#v1.0.0",
    "next-intl": "^4.14.0"
  }
}
```

### Option B — Local path (this Compass template)

```json
{
  "dependencies": {
    "@prosera/i18n": "file:packages/prosera-i18n"
  }
}
```

### Next.js

```ts
// next.config.ts
import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  transpilePackages: ["@prosera/i18n"],
}

export default nextConfig
```

## Wire up (≈10 minutes per build)

### 1. Message catalogs

```bash
npx prosera-i18n init ./src/messages
# then expand keys for this product’s UI — keep FR/DE/ES in sync with EN
```

### 2. Root layout

```tsx
import { LocaleProvider } from "@prosera/i18n/react"
import en from "@/messages/en.json"
import fr from "@/messages/fr.json"
import de from "@/messages/de.json"
import es from "@/messages/es.json"

const messages = { en, fr, de, es }

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <LocaleProvider messages={messages}>{children}</LocaleProvider>
      </body>
    </html>
  )
}
```

### 3. Language selector (header / login)

```tsx
import { LanguageSelector } from "@prosera/i18n/react"

<LanguageSelector className="your-select-classes" />
```

Or build a custom control with `useAppLocale()` + `LOCALES` / `LOCALE_LABELS`.

### 4. UI strings

```tsx
"use client"
import { useTranslations } from "next-intl"

const t = useTranslations("pages.operating")
```

### 5. BluePilot / API locale

```ts
import {
  chatLanguageInstruction,
  isAppLocale,
  DEFAULT_LOCALE,
  type AppLocale,
} from "@prosera/i18n/core"

const locale: AppLocale = isAppLocale(body.locale) ? body.locale : DEFAULT_LOCALE
const system = `${BASE_PROMPT}\n\n${chatLanguageInstruction(locale)}`
```

Pass `locale` from the client (`useAppLocale().locale`) on chat / sandbox requests.

### 6. CI parity gate

```json
{
  "scripts": {
    "i18n:check": "prosera-i18n check ./src/messages"
  }
}
```

Fail the build if FR/DE/ES drift from EN keys.

## Package surface

| Import | Contents |
|--------|----------|
| `@prosera/i18n` / `@prosera/i18n/core` | `LOCALES`, `AppLocale`, glossary, `chatLanguageInstruction`, `mergeMessages`, storage key, BCP47 |
| `@prosera/i18n/react` | `LocaleProvider`, `useAppLocale`, `LanguageSelector` (+ core re-exports) |
| `prosera-i18n` CLI | `check`, `init` |

## What stays in each build repo

- Full `messages/*.json` for that product’s screens
- App-specific helpers (e.g. mission title mappers)
- Design-system wrappers around `LanguageSelector` if you need Radix/shadcn chrome

## Glossary (always English)

Prosera, Compass, BluePilot, Action Center, Commercial Center, Market Intelligence, Operations Center, Control Center, What-If, Operating Loop, Customer Score, CI-04, NTE, XYZ — extend via `chatLanguageInstruction(locale, { glossary: ["…"] })`.

## Split into its own GitHub repo

From this template:

```bash
# one-time: publish the kit
cd packages/prosera-i18n
git init
git add .
git commit -m "feat: @prosera/i18n locale kit"
gh repo create YOUR_ORG/prosera-i18n --private --source=. --remote=origin --push
git tag v1.0.0 && git push origin v1.0.0
```

Then in every customer build:

```bash
npm install github:YOUR_ORG/prosera-i18n#v1.0.0
```

Bump the tag when you improve glossary, provider, or CLI — builds opt in by bumping the pin.
