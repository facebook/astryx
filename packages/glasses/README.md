# @xds/glasses

Prototype component target for smart-glasses HUD layout experiments.

This package mirrors a small subset of core component names (`Card`, `Text`,
`Heading`, `Button`, `List`, etc.) so the `xds layout` grammar can validate the
same XLE/XLO syntax against a glasses-specific component registry:

```bash
xds layout check --target glasses 'Scr > C[p4] > V[g2] > B.primary"Open"'
xds layout expand --target glasses 'Scr > C[p4] > V[g2] > B.primary"Open"'
```

The package is intentionally small. Components and docs describe a 600×600
additive-light HUD surface, not a desktop or mobile screen. Desktop layouts
should continue to target `@xds/core`.
