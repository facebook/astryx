# StyleX Theme Resolution Prototype

## Problem

```
Desired:  reset > base > theme > product overrides
Actual:   reset > (base + overrides via StyleX) > theme (CSS, always wins)
```

## Solution

Generate StyleX-compatible `$$css` objects from theme configs. Components
merge via `stylex.props()` — last-arg-wins for overrides, `@scope` for nesting.

| Relationship       | Mechanism                                    |
|-------------------|----------------------------------------------|
| base < theme      | @scope proximity (scoped beats root-scoped)  |
| theme nesting     | @scope proximity (inner ancestor > outer)    |
| theme < override  | stylex.props merge (last arg strips earlier) |

### styleq multi-class handling

`$$css` with `"classA classB"` for same property — styleq treats as opaque
string. Override strips entire bundle. No override = all stay, @scope picks.
