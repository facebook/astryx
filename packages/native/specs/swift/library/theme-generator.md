# Theme generator (Swift)

- Status: draft
- Relation: extends AST-082 FR10, FR16, FR18 and AST-093 FR4. It is the one
  path by which a theme reaches Swift.

## Summary

An iOS app built with Astryx shows its own brand, not only core's default: any
Astryx theme, from a published theme package such as neutral or from the
product itself, becomes a Swift `AstryxTheme` that `.astryxTheme(.neutral)`
applies, with the same light and dark values and typeface the web uses. The
generator runs core's own resolver, so Swift never re-implements theme logic.

## Requirements

- **G1 — Input is a portable theme; core resolves it.** The generator is one
  function, `renderSwiftTheme(theme, options)`. Its input is a `PortableTheme`
  (name, tokens, theme-local tokens; AST-082 FR18). A `DefinedTheme` from
  `defineTheme` passes unchanged, since it is a `PortableTheme` plus a web
  part the generator ignores. Until core ships `PortableTheme`, the input type
  is `DefinedTheme`. Values come only from core's
  `resolveThemeTokens(theme, {mode})`, called once with `mode: 'light'` and
  once with `mode: 'dark'`. The generator never reads `theme.tokens` directly
  and never evaluates a color or reference itself.
- **G2 — Core is read only at build time, through the portable entry.** The
  generator runs at build time; generated Swift carries nothing from core at
  run time (AST-082 FR16). Once core's portable entry ships, the generator
  imports core only through it. Until then it imports
  `@astryxdesign/core/theme` and `@astryxdesign/core/theme/tokens`, an interim
  exception to FR16 that this spec names and that ends when the portable entry
  ships.
- **G3 — Output is one Swift file per theme.** Each theme becomes
  `swift-ios-1/core/Theme/Generated/<SwiftName>Theme.swift`, which declares
  exactly one member:

  ```swift
  extension AstryxTheme {
    public static let <swiftName> = AstryxTheme(
      light: AstryxTokens(colors: [...], sizes: [...], fonts: [...]),
      dark: AstryxTokens(colors: [...], sizes: [...], fonts: [...])
    )
  }
  ```

  `<swiftName>` is the theme's `name` with a leading `astryx-` removed, in
  lower camel case (`astryx-neutral` → `neutral`, `astryx-y2k` → `y2k`, a
  product's `acme-brand` → `acmeBrand`). Core's default theme (`astryx`) is
  `default`. A name that is not a valid Swift identifier, is a Swift keyword
  other than `default`, or repeats another generated theme's name fails the
  run. The file starts with a header naming the source package, its version,
  and the theme name, says "Do not edit", and names the regenerate command.

- **G4 — Output is deterministic.** The same theme and the same core produce
  byte-identical files: keys sorted, numbers in their shortest exact form, no
  dates, paths, or machine details.
- **G5 — The token set is a contract.** The generator keeps these groups of
  core's resolved token names: `color-*`, `spacing-*`, `radius-*`,
  `size-element-*`, `border-width`, `font-size-*`, `font-weight-*`,
  `font-family-*`, and `text-<style>-*` for `heading-1` to `heading-6`,
  `body`, `large`, `label`, and `supporting`. Theme-local tokens
  (`astryx-theme-<theme>-<rest>`) are kept under their full name when `<rest>`
  is in one of those groups. Core fills every shared token a theme leaves out,
  so every theme's file holds the same shared keys. Adding a group changes this
  spec, the generator, and the Swift reader in one pull request, together with
  the first component that reads it.
- **G6 — Conversion is exact or the run fails.**
  - Colors become `#RRGGBBAA` in sRGB from `#RGB`, `#RGBA`, `#RRGGBB`,
    `#RRGGBBAA`, `rgb()`/`rgba()` (comma or space separated, alpha as a number
    or a percentage), and the keywords `black`, `white`, and `transparent`.
  - Lengths become points: `rem` × 16, `px` × 1. Unitless numbers (weights,
    line-height ratios) stay numbers.
  - Font families become an ordered list of family names, quotes removed, in
    the CSS stack's order.
  - Any other value in a kept group, such as `oklch()`, `color-mix()`,
    `calc()`, an unresolved `var()`, or `light-dark()`, fails the run with the
    theme, mode, token, and value. A token present in one mode and missing in
    the other fails the same way. Nothing is dropped or guessed.
- **G7 — Font names map to SwiftUI fonts, with a system fallback.** A
  component asks the theme for a font by token. The reader walks the family
  list in order and uses the first family the app has available
  (`UIFont(name:size:)` is not nil) as `Font.custom(_:size:relativeTo:)`, so it
  still scales with Dynamic Type. A generic or system name ends the walk with
  the system font: `-apple-system`, `system-ui`, `BlinkMacSystemFont`, and
  `sans-serif` → `.default` design; `ui-monospace`, `SF Mono`, `monospace` →
  `.monospaced`; `ui-serif`, `serif` → `.serif`; `ui-rounded` → `.rounded`.
  A list with no available family draws the system font. The library never
  bundles or downloads a font; an app that wants its brand typeface bundles
  and registers the font file itself.
- **G8 — Every published theme is generated, and a product's own theme can be.**
  Core's default theme and every theme package under `packages/themes/` whose
  `package.json` is not `private` has a generated file. A product generates its
  own theme by passing its theme to `renderSwiftTheme`, or through the
  package's command (`generate:swift-ios --theme <module>#<export>`).
- **G9 — Every generated theme has a drift check.** A test regenerates every
  committed theme file and fails when any file differs, when a published theme
  has no file, or when a file has no published theme. The failure names the
  regenerate command.
- **G10 — Generated files stay committed for now.** Swift Package Manager
  installs from a git commit and cannot run the Node generator, so generated
  files are committed beside the Swift sources until CI publishes generated
  Swift to a Swift-only branch or tag, as the package README notes.

## Acceptance checks

| Requirement | Check                                                                                                                                                                                                                                           |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| G1          | A test passes a theme whose resolved token differs from its raw `theme.tokens` entry (a reference) and finds the resolved value in Swift. A `DefinedTheme` with web component overrides generates the same file as the same theme without them. |
| G2          | A source check finds no import of core in `scripts/` outside the two named theme entries (or, later, outside the portable entry). Generated Swift imports only SwiftUI.                                                                         |
| G3          | For every generated file: one `extension AstryxTheme` with one `public static let`, named as G3 says; `swiftc -typecheck` compiles all generated files together; two themes with the same name fail the run.                                    |
| G4          | Generating twice, and on two CI machines, gives byte-identical output.                                                                                                                                                                          |
| G5          | Every generated file has the same shared key set, equal to core's resolved names filtered by the G5 groups; a theme-local `color-` token appears under its full name.                                                                           |
| G6          | Unit tests convert every listed form; `oklch(0 0 0 / 5%)` in a kept group fails with theme, mode, token, and value in the message; `"Figtree", -apple-system, sans-serif` becomes `["Figtree", "-apple-system", "sans-serif"]`.                 |
| G7          | A Swift test with no bundled Figtree resolves `font-family-body` to the system font; with a registered test font it resolves to that font; both scale between Large and AX5.                                                                    |
| G8          | A test reads `packages/themes/*/package.json` and finds one generated file per non-private package plus `default`. A test renders a fixture product theme through `renderSwiftTheme`.                                                           |
| G9          | Editing one generated value by hand fails the drift test with the regenerate command in the message.                                                                                                                                            |
| G10         | The README's generated-Swift note lists the theme files.                                                                                                                                                                                        |

## Current state

- `scripts/swift-ios-theme.mjs` generates core's default theme
  only, as `AstryxTokens.defaultLight` and `.defaultDark`, with every G5 group
  except `font-family-*` and theme-local tokens, and with the G6 color and
  length conversions; `AstryxTheme.default` is written by hand.
- `src/theme/swiftIOSTheme.test.ts` checks the default theme only.
- Published theme packages: butter, chocolate, gothic, matcha, neutral, stone,
  y2k (probe is private). Their raw values use `oklch()` and `color-mix()` only
  outside the G5 groups (shadows, component styles).

## Open questions

- **OQ1 — The package-boundary check does not see the generator.**
  `scripts/check-package-boundaries.js` scans `packages/native/src` only, so an
  import from core in `packages/native/scripts/` is never checked against
  FR16. Fixing it changes a root script outside `packages/native/`.
  Recommendation: extend the check to `packages/native/scripts/` with the G2
  exception listed, as its own change with owner review, since it is outside
  `packages/native/`.
- **OQ2 — Typed tokens.** Library spec 02 asks for typed members
  (`theme.color.textPrimary`) instead of string-keyed dictionaries.
  Recommendation: this spec keeps `AstryxTokens` dictionaries; when 02 is
  approved, the same generator emits the typed form.
- **OQ3 — A slot for native intent.** Native visual intent (durable
  `material`, platform entries, icons; AST-082 FR10, FR17) is not generated
  yet. Wherever a theme authors that intent, the generator reads it from the
  resolved theme it is given, never from a separate source. Recommendation:
  reserve `AstryxTheme.native` now as a documented, empty member, and fill it,
  already resolved per OS version range, when the first component reads
  `material`.
- **OQ4 — Increased contrast.** Core themes have light and dark modes only, so
  nothing is generated for Increase Contrast. Recommendation: leave it out of
  this spec; a contrast mode in core changes files outside `packages/native/`
  and is decided on its own.
