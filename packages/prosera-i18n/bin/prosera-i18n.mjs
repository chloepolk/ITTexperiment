#!/usr/bin/env node
/**
 * @prosera/i18n CLI
 *
 *   npx prosera-i18n check ./src/messages
 *   npx prosera-i18n init ./src/messages
 */
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const LOCALES = ["en", "fr", "de", "es"]
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PKG_ROOT = path.resolve(__dirname, "..")

function flatten(obj, prefix = "", out = {}) {
  if (obj === null || typeof obj !== "object" || Array.isArray(obj)) {
    out[prefix] = obj
    return out
  }
  for (const [key, value] of Object.entries(obj)) {
    const next = prefix ? `${prefix}.${key}` : key
    if (value !== null && typeof value === "object" && !Array.isArray(value)) {
      flatten(value, next, out)
    } else {
      out[next] = value
    }
  }
  return out
}

function loadMessages(dir) {
  const result = {}
  for (const locale of LOCALES) {
    const file = path.join(dir, `${locale}.json`)
    if (!fs.existsSync(file)) {
      throw new Error(`Missing message file: ${file}`)
    }
    result[locale] = JSON.parse(fs.readFileSync(file, "utf8"))
  }
  return result
}

function cmdCheck(dirArg) {
  const dir = path.resolve(process.cwd(), dirArg || "src/messages")
  const catalogs = loadMessages(dir)
  const flats = Object.fromEntries(
    LOCALES.map((l) => [l, flatten(catalogs[l])]),
  )
  const baseKeys = Object.keys(flats.en).sort()
  let failed = false

  console.log(`Checking message parity in ${dir}`)
  console.log(`EN keys: ${baseKeys.length}`)

  for (const locale of LOCALES.filter((l) => l !== "en")) {
    const keys = Object.keys(flats[locale])
    const missing = baseKeys.filter((k) => !(k in flats[locale]))
    const extra = keys.filter((k) => !(k in flats.en))
    if (missing.length || extra.length) {
      failed = true
      console.error(`\n${locale}: missing ${missing.length}, extra ${extra.length}`)
      missing.slice(0, 20).forEach((k) => console.error(`  - missing ${k}`))
      extra.slice(0, 20).forEach((k) => console.error(`  + extra ${k}`))
      if (missing.length > 20) console.error(`  … ${missing.length - 20} more missing`)
    } else {
      console.log(`${locale}: OK (${keys.length} keys)`)
    }
  }

  if (failed) {
    console.error("\nParity check failed.")
    process.exit(1)
  }
  console.log("\nAll locales match EN key set.")
}

function cmdInit(dirArg) {
  const dir = path.resolve(process.cwd(), dirArg || "src/messages")
  const starter = path.join(PKG_ROOT, "starter", "messages")
  fs.mkdirSync(dir, { recursive: true })
  for (const locale of LOCALES) {
    const src = path.join(starter, `${locale}.json`)
    const dest = path.join(dir, `${locale}.json`)
    if (fs.existsSync(dest)) {
      console.log(`skip (exists): ${dest}`)
      continue
    }
    fs.copyFileSync(src, dest)
    console.log(`wrote ${dest}`)
  }
  console.log("\nStarter catalogs ready. Expand keys per product UI, keep EN/FR/DE/ES in sync.")
  console.log("Run: npx prosera-i18n check " + path.relative(process.cwd(), dir))
}

function usage() {
  console.log(`Usage:
  prosera-i18n check [messagesDir]   Verify EN/FR/DE/ES key parity (default: src/messages)
  prosera-i18n init [messagesDir]    Copy starter message JSON into a folder
`)
}

const [cmd, arg] = process.argv.slice(2)
if (cmd === "check") cmdCheck(arg)
else if (cmd === "init") cmdInit(arg)
else {
  usage()
  process.exit(cmd ? 1 : 0)
}
