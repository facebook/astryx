# @astryxdesign/native

> **Experimental. Canary only.** This package is published only under the
> `@canary` dist-tag and is never released as a stable version. Its APIs change
> without notice. Nothing here is supported for production apps.

`@astryxdesign/native` is where Astryx experiments with native platforms
(iOS, Android, macOS, Windows) under AST-082 (Native-first surfaces). The
experiment compares ways of building Astryx components on each platform and
measures them against the same scorecard, so the decision for each platform
rests on evidence.

## What is here today

| Part           | Path                              | What it does                                                                                                                                                                                                                                 |
| -------------- | --------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Contracts      | `src/contract/`                   | Reads a core component's documentation and splits its props into a portable **core contract** and a **web-only** part, with a reason for each web-only prop. Checks prop names against Swift and Kotlin keywords and platform toolkit names. |
| Platform types | `@astryxdesign/native/components` | TypeScript props per platform, chosen by type-resolution condition: `ios`, `android`, `macos`, `windows`, or `shared` for the core contract only.                                                                                            |
| Swift binding  | `apple/`                          | A Swift package with props generated from the same contracts. iOS and macOS props sit behind `#if os(...)`.                                                                                                                                  |
| Native theme   | `defineNativeTheme`               | Durable theme intent (`material: 'opaque' \| 'translucent'`) plus platform entries scoped by OS version, such as Liquid Glass from iOS 26. Never sets tokens.                                                                                |
| Icons          | `NATIVE_ICON_DEFAULTS`            | Astryx's built-in icon names mapped to SF Symbols on Apple platforms and Material Symbols on Android.                                                                                                                                        |

Only `Selector` has native additions so far. React Native and Android bindings
are not built yet; see [the experiment matrix](#experiment-matrix).

```ts
// tsconfig.json for an iOS app: "customConditions": ["ios"]
import type {SelectorProps} from '@astryxdesign/native/components';

const props: SelectorProps = {
  label: 'Shipping',
  options: [{value: 'standard', label: 'Standard'}],
  menuStyle: 'pullDown', // iOS-only prop; an Android build rejects it
};
```

## Working on it

```sh
pnpm -F @astryxdesign/native build            # dist/, including platform types
pnpm -F @astryxdesign/native generate:apple   # regenerate apple/Sources/.../Generated
pnpm vitest run --project node packages/native
```

Generated Swift is committed so a Swift package can pin a commit. A test fails
when it drifts from the contracts.

Boundaries, checked by `pnpm check:package-boundaries`:

- `@astryxdesign/core` never imports this package.
- This package's source never imports core. It reads core's documentation
  files as data at build time.

## Experiment matrix

Every arm runs the same subjects on the same devices and is scored against a
**reference**: the same screens hand-built with the platform toolkit (SwiftUI,
Jetpack Compose, WinUI).

| Arm                  | How components are built                                                                 | iOS | Android | macOS | Windows |
| -------------------- | ---------------------------------------------------------------------------------------- | --- | ------- | ----- | ------- |
| A. Pure native       | Platform views (SwiftUI, Compose, WinUI) on generated contracts                          | ✓   | ✓       | ✓     | ✓       |
| B. React Native      | React Native components; desktop through `react-native-macos` and `react-native-windows` | ✓   | ✓       | ✓     | ✓       |
| C. Shared logic core | Component logic in TypeScript running in Hermes, driving platform views                  | ✓   | ✓       | ✓     | —       |
| D. Web on native     | Web React components through a native renderer, such as Expo's experimental fork         | ✓   | ✓       | —     | —       |

Arm D is measured but cannot become a required runtime while it depends on a
third-party fork (AST-082 FR13).

### Test subjects

Templates come first because their web version is a known reference for
content and states.

1. **Wave 1:** `checkout-wizard` (forms, stepper, pickers, validation, keyboard),
   `table-inbox` (long list, row actions, search, compose sheet), `dashboard`
   (charts, tables, scrolling).
2. **Wave 2:** `settings`, `kanban-board`, `ai-chat`, `product-detail`.
3. **Component flows:** Selector, text entry, dialog and sheet, list with row
   actions.

Each subject has one scripted interaction that every arm replays.

Visual scores come from real screens. Every scripted step is captured as a
screenshot on the device, every behavior (sheet open and dismiss, navigation
transitions, gestures, scrolling, press feedback, keyboard) as a short video or
GIF, and every scenario as a recording, for each arm, the
reference, and the web version, in light and dark and at the largest text size.
Reviewers compare captures side by side with arm names hidden, and pixel checks
read colors and sizes from the captures, never from source.

### Metrics

| Area            | Measure                        | How                                                                                                                                                                                                           | Unit                  |
| --------------- | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- |
| Gate            | Required runtimes              | Dependency manifest against FR13                                                                                                                                                                              | pass/fail             |
| Gate            | Screen-reader parity           | VoiceOver, TalkBack, Narrator task script                                                                                                                                                                     | pass/fail             |
| Gate            | Completeness                   | Every subject renders every state                                                                                                                                                                             | pass/fail             |
| Experience      | Platform feel                  | Blind reviewer rating of captured screens and recordings against the reference, plus a platform-conventions checklist                                                                                         | score, % of checklist |
| Experience      | Behavior and motion            | Blind reviewer rating of behavior videos against the reference: timing, easing, gesture response, interruptibility                                                                                            | score per behavior    |
| Experience      | Time to adopt a new OS feature | Days from OS release to shipping it in the arm (for example, Liquid Glass)                                                                                                                                    | days                  |
| Performance     | Startup to first content       | Release build, cold start, median of runs                                                                                                                                                                     | ms                    |
| Performance     | Smoothness                     | Dropped frames during the scripted interaction                                                                                                                                                                | % frames              |
| Performance     | Input latency                  | Touch or key to visible response                                                                                                                                                                              | ms                    |
| Performance     | Memory and size                | Peak memory during the script; app download size                                                                                                                                                              | MB                    |
| Maintenance     | Change cost                    | Time to ship one real Astryx change on the arm (a new prop, a new token)                                                                                                                                      | hours                 |
| Developer speed | Iteration                      | Edit to visible on device                                                                                                                                                                                     | seconds               |
| Developer speed | Sharing                        | Share of app code reused across platforms                                                                                                                                                                     | % lines               |
| Design          | Brand preservation             | Blind designer review of whether the brand is recognizable from the web version while the screen still feels native, plus pixel checks on the captures for the theme's color, type, shape, spacing, and icons | score, % token checks |
| Fidelity        | Match to web                   | Content and states matching the web template                                                                                                                                                                  | % checks              |

### Judging

1. An arm that fails a gate is out for that platform.
2. The remaining arms are compared per platform, each measure relative to the
   reference on the same device.
3. Whether the measures are weighted into one score or ranked side by side is
   not decided yet.
