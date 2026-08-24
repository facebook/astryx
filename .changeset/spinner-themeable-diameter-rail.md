---
'@astryxdesign/core': patch
---

[feat] Spinner: the ring's geometry and its two colors are now themeable. The `size` and `shade` props keep their fixed enums; what each named value _resolves to_ is now a theme's to set, through four public custom properties on the `spinner` target — `--spinner-diameter` and `--spinner-rail-width` under a size variant, `--spinner-color` and `--spinner-track-color` under a shade variant (or on the base target for all of them at once):

```ts
spinner: {
  'size:xl': {'--spinner-diameter': '2.5rem', '--spinner-rail-width': '0.375rem'},
  'shade:subtle': {'--spinner-track-color': 'transparent'},
}
```

Any length and any color notation works — `rem`, `em` and `calc()` are resolved by the cascade into the radius and stroke the ring is drawn with, and colors accept `var()`, `color-mix()` and `currentColor`. A rail width of `0` is honoured rather than read as "unset". The drawn ring and the box around it come from the same values, so they stay in step, including when a media query or a root font-size change moves them after mount.

Output is unchanged for every size and shade unless a theme overrides something. One precedence change: the box is now sized in CSS rather than by an inline width/height, so a consumer's `style={{width}}` wins over it where the inline size used to win.

@freddymeta
