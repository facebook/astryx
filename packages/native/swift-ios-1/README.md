# Astryx for iOS in SwiftUI — generation 1

> **Experimental. Canary only.** Part of `@astryxdesign/native`. APIs change
> without notice.

This is a Swift package that draws Astryx components and page templates with
SwiftUI on iOS. It is arm A of the AST-082 experiment (pure native: platform
views painted with Astryx's tokens), and the starting point for comparing it
with the other arms.

The `1` in `swift-ios-1` is a generation, not an iOS version. A rethink of
the structure starts `swift-ios-2` beside this one, so both can be measured
on the same scorecard before one is retired.

## Layout

```text
swift-ios-1/
├── Package.swift        # products AstryxCore and AstryxTemplates
├── core/                # components (module AstryxCore)
│   ├── Theme/           # tokens, the theme environment, Dynamic Type
│   │   └── Generated/   # core's default theme, generated; do not edit
│   ├── Text/            # AstryxText, AstryxHeading
│   ├── Button/          # AstryxButton
│   ├── TextInput/       # AstryxTextInput
│   ├── Card/            # AstryxCard
│   └── Banner/          # AstryxBanner
├── templates/           # page templates (module AstryxTemplates)
│   └── Login/           # LoginTemplate, from `astryx template login`
└── tests/
    ├── core/
    └── templates/
```

- **`core/`** holds one folder per component, named as in
  `packages/core/src/<Name>/`. A component's parameters use core's prop names
  and values (`variant: .primary`, `size: .lg`, `isLoading`), so code reads
  the same across web and native.
- **`templates/`** holds one folder per page template, named after the
  `astryx template` id. A template is built only from `AstryxCore`
  components and SwiftUI layout, and matches the web template's content and
  states. Rules a template needs, such as validation, live in a plain value
  type beside the view so tests can check them without a screen.

## Use it

```swift
import AstryxCore
import AstryxTemplates
import SwiftUI

@main
struct DemoApp: App {
  var body: some Scene {
    WindowGroup {
      LoginTemplate().astryxTheme()
    }
  }
}
```

`astryxTheme()` paints a subtree with core's default theme in the current
color scheme and text size. Pass an `AstryxTheme` to use other tokens.
Without it, components paint with the default light tokens.

## Theme tokens

Components read every color, size, and font from the `astryx` environment
value, never from a constant of their own. Token names are core's, without
the leading `--` (`color-accent`, `spacing-4`, `size-element-md`). Text sizes
grow with Dynamic Type.

`core/Theme/Generated/DefaultTheme.swift` is core's default theme run through
core's own resolver, light and dark. Regenerate it after a core token change:

```sh
pnpm -F @astryxdesign/native generate:swift-ios
```

A test in `@astryxdesign/native` fails when the committed file drifts from
core's tokens.

## Working on it

On a Mac with Xcode or the Swift command-line tools:

```sh
cd packages/native/swift-ios-1
swift build
swift test
```

The package also declares macOS 14 so it builds and tests on a Mac without a
simulator; iOS 17 is the target. Open `Package.swift` in Xcode to run
`LoginTemplate` in an iOS simulator through its preview.

To add a component, create `core/<Name>/Astryx<Name>.swift` with core's prop
names, read its tokens from `astryx`, and add tests under `tests/core/`. To
add a template, create `templates/<Name>/<Name>Template.swift` from the
output of `astryx template <id>`.

## Not here yet

- The components do not use the generated contract types in `../apple/` yet.
  Moving them onto those types is how a core prop change reaches Swift.
- Pixel and behavior parity with the web components has not been measured.
- Only the default theme is generated; named themes, Increase Contrast, and
  platform theme entries (`defineNativeTheme`) are not wired in.
