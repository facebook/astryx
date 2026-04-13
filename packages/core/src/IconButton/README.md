# IconButton

An icon-only button component. Thin composition wrapper around `XDSButton` with `isIconOnly` always true.

## Why

`<XDSButton isIconOnly>` is easy to miss at the callsite. `XDSIconButton` makes icon-only intent explicit, greppable, and codemod-safe. See [#1321](https://github.com/facebookexperimental/xds/issues/1321) for the full rationale.

## Files

<!-- SYNC: update when files change -->

| File                     | Purpose                                           |
| ------------------------ | ------------------------------------------------- |
| `XDSIconButton.tsx`      | Component implementation — delegates to XDSButton |
| `XDSIconButton.test.tsx` | Unit tests                                        |
| `IconButton.doc.mjs`     | Component documentation for CLI and autodocs      |
| `index.ts`               | Public exports                                    |
