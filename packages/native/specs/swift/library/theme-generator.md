# Theme generator (Swift)

- Status: draft
- Relation: extends AST-082 FR10, FR16, FR18 and AST-093 FR4. It is the one
  path by which a theme reaches Swift.

## Summary

An iOS app built with Astryx shows its own brand, not only core's default: any
Astryx theme, from a published theme package such as neutral or from the
product itself, becomes a Swift `AstryxTheme` that `.astryxTheme(.neutral)`
applies, with the same light and dark values and typeface the web uses. Every
token is a typed Swift member, so a misspelled token fails to compile instead
of drawing nothing. The generator runs core's own resolver, so Swift never
re-implements theme logic.

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
- **G2 — Core is read only at build time.** The generator runs at build time;
  generated Swift imports only SwiftUI and carries nothing from core at run
  time (AST-082 FR16). Once core's portable entry ships, the generator imports
  core only through it. Until then it imports `@astryxdesign/core/theme` and
  `@astryxdesign/core/theme/tokens`, a named interim exception to FR16 (D1).
- **G3 — One shared token type, one file per theme.**
  - `swift-ios-1/core/Theme/Generated/AstryxTokens.swift` declares the typed
    token surface: `AstryxTokens` with one member per group (`color`, `space`,
    `radius`, `size`, `font`), each a struct with one typed member per token.
    It is generated from core's resolved token names, which are the same for
    every theme (G5), so it does not depend on any one theme.
  - Each theme becomes `swift-ios-1/core/Theme/Generated/<SwiftName>Theme.swift`,
    which declares `AstryxTheme.<swiftName>` with an `AstryxTokens` value for
    light and one for dark, plus its theme-local namespace (G8).
  - `<swiftName>` is the theme's `name` with a leading `astryx-` removed, in
    lower camel case (`astryx-neutral` → `neutral`, `astryx-y2k` → `y2k`, a
    product's `acme-brand` → `acmeBrand`). Core's default theme (`astryx`) is
    `default`. A name that is not a valid Swift identifier, is a Swift keyword
    other than `default`, or repeats another generated theme's name fails the
    run.
  - Each file starts with a header naming the source package, its version, and
    the theme name, says "Do not edit", and names the regenerate command.
- **G4 — Output is deterministic.** The same theme and the same core produce
  byte-identical files: members sorted, numbers in their shortest exact form,
  no dates, paths, or machine details.
- **G5 — The token set is a contract.** The generator keeps these groups of
  core's resolved token names: `color-*`, `spacing-*`, `radius-*`,
  `size-element-*`, `border-width`, `font-size-*`, `font-weight-*`,
  `font-family-*`, and `text-<style>-*` for `heading-1` to `heading-6`,
  `body`, `large`, `label`, and `supporting`. Core fills every shared token a
  theme leaves out, so every theme has the same shared members. Adding a group
  changes this spec, the generator, and the Swift reader in one pull request,
  together with the first component that reads it.
- **G6 — Token names map to Swift members by one rule.** A token's Swift member
  is its group and the rest of its name in lower camel case, with each `-`
  between two digits written `_`:

  | Token                                                          | Member                                                                                                                                |
  | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
  | `color-<rest>`                                                 | `color.<rest>`: `color-text-primary` → `color.textPrimary`, `color-data-blue-1` → `color.dataBlue1`                                   |
  | `spacing-<n>`                                                  | `space.s<n>`: `spacing-4` → `space.s4`, `spacing-0-5` → `space.s0_5`                                                                  |
  | `radius-<rest>`                                                | `radius.<rest>`: `radius-element` → `radius.element`                                                                                  |
  | `size-element-<rest>`, `border-width`                          | `size.element<Rest>`: `size-element-md` → `size.elementMd`; `size.borderWidth`                                                        |
  | `font-size-<rest>`, `font-weight-<rest>`, `font-family-<rest>` | `font.size<Rest>`, `font.weight<Rest>`, `font.family<Rest>`: `font-size-2xl` → `font.size2xl`, `font-family-body` → `font.familyBody` |
  | `text-<style>-<part>`                                          | `font.<style><Part>`: `text-body-size` → `font.bodySize`, `text-heading-1-weight` → `font.heading1Weight`                             |

  Two tokens that map to the same member, or a member that is a Swift keyword
  or does not start with a letter, fail the run with both token names.

- **G7 — Values are typed and exact, or the run fails.**
  - Colors are `Color` values in sRGB, from `#RGB`, `#RGBA`, `#RRGGBB`,
    `#RRGGBBAA`, `rgb()`/`rgba()` (comma or space separated, alpha as a number
    or a percentage), and the keywords `black`, `white`, and `transparent`.
  - Lengths are `CGFloat` points: `rem` × 16, `px` × 1. Unitless numbers
    (weights, line-height ratios) are `CGFloat`.
  - Font families are `[String]`, quotes removed, in the CSS stack's order.
  - Any other value in a kept group, such as `oklch()`, `color-mix()`,
    `calc()`, an unresolved `var()`, or `light-dark()`, fails the run with the
    theme, mode, token, and value. A token present in one mode and missing in
    the other fails the same way. Nothing is dropped or guessed.
- **G8 — Theme-local tokens are typed in the theme's own namespace.** A
  theme-local token (`astryx-theme-<theme>-<rest>`) whose `<rest>` is in a G5
  group becomes a typed member, by the G6 rule applied to `<rest>`, of a
  namespace generated only in that theme's file: `AstryxTheme.Neutral.local`,
  with light and dark values (`AstryxTheme.Neutral.local.dark.color.statusFillAccent`).
  Only code written for that theme reads them; shared components never do.
- **G9 — Components read typed members.** Components read tokens only through
  the typed members (`theme.color.textPrimary`). A lookup by token name may
  exist inside the package as a fallback for wire-driven code; it is not public
  and no component uses it.
- **G10 — Font names map to SwiftUI fonts, with a system fallback.** The reader
  walks a family list in order and uses the first family the app has
  available (`UIFont(name:size:)` is not nil) as
  `Font.custom(_:size:relativeTo:)`, so it still scales with Dynamic Type. A
  generic or system name ends the walk with the system font: `-apple-system`,
  `system-ui`, `BlinkMacSystemFont`, and `sans-serif` → `.default` design;
  `ui-monospace`, `SF Mono`, `monospace` → `.monospaced`; `ui-serif`, `serif`
  → `.serif`; `ui-rounded` → `.rounded`. A list with no available family draws
  the system font. The library never bundles or downloads a font; an app that
  wants its brand typeface bundles and registers the font file itself.
- **G11 — Native intent has a reserved slot.** `AstryxTheme.native` is a
  documented member that is empty until a component reads native intent (D3).
- **G12 — Every published theme is generated, and a product's own theme can be.**
  Core's default theme and every theme package under `packages/themes/` whose
  `package.json` is not `private` has a generated file. A product generates its
  own theme by passing its theme to `renderSwiftTheme`, or through the
  package's command (`generate:swift-ios --theme <module>#<export>`).
- **G13 — The drift check covers the typed surface.** A test regenerates
  `AstryxTokens.swift` and every committed theme file and fails when any file
  differs, when a published theme has no file, or when a file has no published
  theme. The failure names the regenerate command.
- **G14 — Generated files stay committed for now.** Swift Package Manager
  installs from a git commit and cannot run the Node generator, so generated
  files are committed beside the Swift sources until CI publishes generated
  Swift to a Swift-only branch or tag, as the package README notes.

## Acceptance checks

| Requirement | Check                                                                                                                                                                                                                           |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| G1          | A theme whose resolved token differs from its raw `theme.tokens` entry (a reference) shows the resolved value in Swift. A `DefinedTheme` with web component overrides generates the same file as the same theme without them.   |
| G2          | The package-boundary check passes with only the two named theme entries imported from `packages/native/scripts/`. Generated Swift imports only SwiftUI.                                                                         |
| G3          | `swiftc -typecheck` compiles `AstryxTokens.swift` and every theme file together; each theme file declares one `AstryxTheme` static named as G3 says; two themes with the same name fail the run.                                |
| G4          | Generating twice, and on two CI machines, gives byte-identical output.                                                                                                                                                          |
| G5          | Every theme's light and dark values fill every member of `AstryxTokens`, equal to core's resolved names filtered by the G5 groups.                                                                                              |
| G6          | Unit tests map every row of the G6 table; two tokens that collide fail with both names. A Swift fixture referencing `theme.color.textPrimray` fails to compile.                                                                 |
| G7          | Unit tests convert every listed form; `oklch(0 0 0 / 5%)` in a kept group fails with theme, mode, token, and value in the message; `"Figtree", -apple-system, sans-serif` becomes `["Figtree", "-apple-system", "sans-serif"]`. |
| G8          | A theme with a theme-local `color-` token has a typed member under its own namespace and none in `AstryxTokens`.                                                                                                                |
| G9          | A source check finds no token lookup by string in any component.                                                                                                                                                                |
| G10         | A Swift test with no bundled Figtree resolves `font.familyBody` to the system font; with a registered test font it resolves to that font; both scale between Large and AX5.                                                     |
| G11         | `AstryxTheme.native` exists, is documented, and holds no values.                                                                                                                                                                |
| G12         | A test reads `packages/themes/*/package.json` and finds one generated file per non-private package plus `default`. A fixture product theme renders through `renderSwiftTheme`.                                                  |
| G13         | Editing one generated value or member name by hand fails the drift test with the regenerate command in the message.                                                                                                             |
| G14         | The README's generated-Swift note lists the generated theme files.                                                                                                                                                              |

## Decisions

- **D1 — The boundary check covers all of `packages/native/`.** The
  package-boundary check scans every folder under `packages/native/`, so a core
  import anywhere in the package is checked against AST-082 FR16. The
  generator's build-time imports of `@astryxdesign/core/theme` and
  `@astryxdesign/core/theme/tokens` are its one listed exception, which ends
  when core's portable entry ships.
- **D2 — Tokens are typed from the start.** The generator emits typed members
  (G3, G6), not string-keyed dictionaries, so a wrong token name fails to
  compile and autocompletion lists every token. Rejected: string keys with a
  missing-token fallback, because a typo ships invisible text.
- **D3 — Native intent comes from `defineNativeTheme` into a reserved slot.**
  Native visual intent (durable `material`, platform entries, icons; AST-082
  FR10, FR17) comes from `defineNativeTheme`, a native theme that wraps the
  portable theme. When the first component reads `material`, the generator
  takes the native theme, reads the wrapped portable theme from it, and fills
  `AstryxTheme.native` already resolved per OS version range, so one call
  produces one file. Composing native intent inside `defineTheme` is outside
  this spec.

- **D4 — Increase Contrast is outside this spec.** Core themes have light and
  dark modes only, so the generator emits no increased-contrast values. A
  contrast mode in core is decided on its own, outside `packages/native/`;
  until it exists, components follow the Swift theme-environment rule of
  drawing borders and separators with the emphasized border token when
  Increase Contrast is on.

## Current state

- `scripts/swift-ios-theme.mjs` generates core's default theme only, as
  string-keyed `AstryxTokens.defaultLight` and `.defaultDark` dictionaries,
  with every G5 group except `font-family-*` and theme-local tokens, and with
  the G7 color and length conversions; `AstryxTheme.default` is written by
  hand.
- The Swift components and the Login template read tokens by string name
  (`astryx.color("color-text-primary")`); a missing name draws clear.
- `src/theme/swiftIOSTheme.test.ts` checks the default theme only.
- Published theme packages: butter, chocolate, gothic, matcha, neutral, stone,
  y2k (probe is private). Their raw values use `oklch()` and `color-mix()` only
  outside the G5 groups (shadows, component styles).

## Open questions

None.
