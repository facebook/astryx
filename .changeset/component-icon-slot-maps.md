---
'@astryxdesign/core': patch
'@astryxdesign/cli': patch
---

[feat] Let themes map component icon slots to shared icon names with `defineTheme({componentIcons})`
@rubyycheung

A component icon slot names one role inside a component. A theme maps it to a shared icon name, or to `null` to show no icon there, and `icons` still draws that name, so every other use of the icon stays the same. With `extends`, a child replaces only the slots it lists; a slot set to `undefined` keeps the base entry.

Packages declare their slots by augmenting `ComponentIconSlotMap` in `@astryxdesign/core/Icon`, and resolve them with `useComponentIcon(slot, fallback)` on the client or `getComponentIcon(slot, fallback, theme)` and `getComponentIconName(slot, fallback, theme)` with an explicit theme. Core components declare no slots, and existing themes and icon keys work unchanged.
