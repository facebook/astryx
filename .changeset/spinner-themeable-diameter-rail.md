---
'@astryxdesign/core': patch
---

[feat] Spinner: the ring's geometry and its two colors are now themeable. The `size` and `shade` props keep their fixed enums; what each named value _resolves to_ is now a theme's to set, through four public custom properties on the `spinner` target — `--spinner-diameter` and `--spinner-stroke-width` under a size variant, `--spinner-color` and `--spinner-track-color` under a shade variant (or on the base target for all of them at once):

```ts
spinner: {
  'size:xl': {'--spinner-diameter': '2.5rem', '--spinner-stroke-width': '0.375rem'},
  'shade:subtle': {'--spinner-track-color': 'transparent'},
}
```

Any length and any color notation works — `rem`, `em` and `calc()` are resolved by the cascade into the radius and stroke the ring is drawn with, and colors accept `var()`, `color-mix()` and `currentColor`. A stroke width of `0` is honoured as a zero-width stroke — it paints nothing, rather than being read as "unset" and silently drawing the default. The drawn ring and the box around it come from the same values, so they stay in step, including when a media query or a root font-size change moves them after mount.

The two private vars the ring resolves into are registered as `<length>` when the module is imported, not when a spinner first mounts. Registering an inherited property with an `initial-value` invalidates style for the whole document, and a spinner is the loading indicator — it arrives on a page that has already rendered, so paying that there is paying it on the full tree: 29 ms against 12 ms for the same mount on an 11k-element page. A build that never imports `Spinner` drops the module and the registration with it.

Output is unchanged for every size and shade unless a theme overrides something, and so is every precedence around the box: it is still sized by an inline `width`/`height` written after the caller's `style`, as it has always been, with the composed value in place of the number.

@freddymeta
