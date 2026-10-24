# Astryx for Apple platforms

> **Experimental. Canary only.** Part of `@astryxdesign/native`. APIs change
> without notice.

One Swift package with two products:

- **`Astryx`**: SwiftUI views painted with the theme's tokens, the theme
  environment, and core's localized messages. It is arm A of the AST-082
  experiment (pure native: platform views painted with Astryx's tokens).
- **`AstryxNative`**: contract types generated from core's component
  documentation, the wire a TypeScript logic core sends, and the logic host
  that runs one (arm C).

Page templates built from the views are a separate package with no products,
because templates are clone-only and never published.

## Layout

```text
apple/
├── Package.swift          # products Astryx and AstryxNative
├── Sources/
│   ├── Astryx/            # SwiftUI views (module Astryx)
│   │   ├── Theme/         # tokens, the theme environment, Dynamic Type
│   │   │   └── Generated/ # core's default theme, generated; do not edit
│   │   ├── Resources/     # core's messages per locale, generated; do not edit
│   │   ├── Localization/
│   │   ├── Text/          # AstryxText
│   │   ├── Heading/       # AstryxHeading
│   │   ├── Button/        # AstryxButton
│   │   ├── TextInput/     # AstryxTextInput
│   │   ├── Card/          # AstryxCard
│   │   └── Banner/        # AstryxBanner
│   └── AstryxNative/      # contracts, wire, logic host (module AstryxNative)
│       └── Generated/     # generated; do not edit
├── Tests/
│   ├── AstryxTests/
│   └── AstryxNativeTests/
└── Templates/             # page templates to copy; its own package, never published
    ├── Package.swift      # no products; compiles and tests the templates
    ├── Login/             # LoginTemplate, from `astryx template login`
    └── Tests/
```

- **`Sources/Astryx/<Name>/`** holds one folder per component, named as in
  `packages/core/src/<Name>/`. A component's parameters use core's prop names
  and values (`variant: .primary`, `size: .lg`, `isLoading`), so code reads
  the same across web and native, with six exceptions, the interim shape
  AST-093 FR5 exempts until the components move onto the generated contracts:
  - `AstryxButton` takes `action` where core has `onClick`.
  - `AstryxButton` takes `fillsWidth` where core has `width="100%"`.
  - `AstryxButton` takes `icon` as a shared icon name (`"search"`), which the
    generated `ButtonProps` does not carry yet.
  - `AstryxTextInput` takes a `Binding` where core has `value` and `onChange`.
  - `AstryxHeading`'s `level` is optional where core requires it.
  - `AstryxCard` takes `padding` as a whole spacing step, so it cannot spell
    core's `0.5` and `1.5` steps.
- **`Templates/`** holds one folder per page template, named after the
  `astryx template` id. Templates are clone-only, as on the web: you copy a
  template's folder into your app and own it from then on. They are a
  separate package with no products, so nothing imports them, and
  `@astryxdesign/native` leaves them out of its npm package. A template is
  built only from `Astryx` views and SwiftUI layout, and matches the web
  template's content and states. Rules a template needs, such as validation,
  live in a plain value type beside the view so tests can check them without a
  screen.

## Use it

Depend on the `Astryx` product. To start from a template, copy its folder,
such as `Templates/Login/`, into your app's sources; it then belongs to your
app.

```swift
import Astryx
import SwiftUI

@main
struct DemoApp: App {
  var body: some Scene {
    WindowGroup {
      LoginTemplate().astryxTheme() // copied from Templates/Login/
    }
  }
}
```

`astryxTheme(_:)` paints a subtree with a theme; without it, components use
core's default theme. Either way they follow Dark Mode and the person's text
size.

## Theme tokens

Components read every color, size, and font from the `astryx` environment
value, never from a constant of their own. Token names are core's, without
the leading `--` (`color-accent`, `spacing-4`, `size-element-md`). Text sizes
grow with Dynamic Type.

Font families come from the theme's `font-family-*` stacks: the first family
the device has wins, and a system family such as `-apple-system` or
`sans-serif` is the system font. Icons use core's shared icon names
(`success`, `warning`, …), drawn as an SF Symbol by default; a theme replaces
one with `AstryxTheme(…, icons: ["success": "checkmark.seal.fill"])`.

`Sources/Astryx/Theme/Generated/DefaultTheme.swift` is core's default theme
run through core's own resolver, light and dark. Regenerate it after a core
token change:

```sh
pnpm -F @astryxdesign/native generate:swift-ios
```

The same command writes
`Sources/Astryx/Resources/<locale>.lproj/Localizable.strings` from core's
locale catalogs, so words the components speak to assistive technology, such
as a loading button's "Loading", follow the person's language. Tests in
`@astryxdesign/native` fail when either committed output drifts from core.

## Working on it

On a Mac with Xcode or the Swift command-line tools:

```sh
cd packages/native/apple
swift test                 # both products
cd Templates && swift test # templates, against the Astryx product
```

Both packages also declare macOS 14 so they build and test on a Mac without a
simulator; iOS 17 is the target. Open `Templates/Package.swift` in Xcode to
run `LoginTemplate` in an iOS simulator through its preview.

To add a component, create `Sources/Astryx/<Name>/Astryx<Name>.swift` with
core's prop names, read its tokens from `astryx`, and add tests under
`Tests/AstryxTests/`. To add a template, create
`Templates/<Name>/<Name>Template.swift` from the output of
`astryx template <id>`, with tests under `Templates/Tests/`.

## Not here yet

- The views do not use the generated contract types in `AstryxNative` yet.
  Moving them onto those types is how a core prop change reaches Swift.
- Pixel and behavior parity with the web components has not been measured.
- Only the default theme is generated; named themes, Increase Contrast, and
  platform theme entries (`defineNativeTheme`) are not wired in.
