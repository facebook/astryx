---
'@astryxdesign/core': patch
---

[fix] useResizable: percentage configuration with an explicit basis (AST-010)

Implements the accepted [AST-010](../docs/specs/AST-010/spec.md) contract. Percentages **configure** a pixel size; they never create a second, responsive sizing mode.

- **`minSize` / `maxSize`** join `defaultSize` in one vocabulary: a non-negative finite number, an exact `Npx`, an exact `N%` from 0–100, Table's existing `pixel(value)`, or `percent(value, {min: pixel(value)})` / `percent(value, {max: pixel(value)})` for a percentage with exactly one pixel floor or ceiling. `percent()` requires its options; `'40%'` remains the only unbounded percentage spelling. `minSizePx`/`maxSizePx` remain deprecated aliases, each an exact mutually-exclusive TypeScript union with its replacement; if untyped code supplies both, the unified prop wins and development names the ignored alias.
- **`containerRef`** (caller-owned) changes only what a percentage is a share of: that element's **content-box** size on the active axis, `direction` selecting inline or block. Omitted, percentages keep the released one-time `window.innerWidth` resolution with its 1200px server fallback.
- **A percentage default resolves once** into a pixel selection, applying its optional structured floor or ceiling exactly once. Percentage **bounds** re-resolve with their basis, apply that one pixel bound, and clamp the selection — they never rescale it. A basis change is not a user interaction: it fires no `onSizeChange` and persists only resolved pixels.
- **Everything else stays pixels**, exactly as released: pointer, keyboard, snaps, collapse/expand, persistence, callbacks, and `resize(number)`. `resize('50%')` remains a type error, and `resize(NaN)`, `resize(Infinity)` or a negative now warn and keep the last legal size instead of poisoning state.
- **Invalid configuration** repairs deterministically — 250px for a default, 50px for a minimum, unbounded for a maximum — identically in development and production, warning only in development. Explicit `maxSize: Infinity` and `maxSizePx: Infinity` keep the released unbounded behavior. The deprecated aliases retain their released exact atomic-string behavior for untyped callers. An inverted pair warns and the maximum wins, preserving the released clamp order.

The structured API follows Table's existing shape rather than parsing CSS expressions: `Resizable/utils` is a server-safe subpath that re-exports the exact same `pixel()` binding and `PixelWidth` type as `Table/utils`, alongside Resizable's `percent()` and types. `pixel(value)` is the canonical structured static size; raw numbers and exact `Npx` remain compatible. `proportional()` remains Table-only because it describes sibling weight, not a literal percentage of one measured basis. CSS `min()` / `max()` strings are deliberately unsupported.

The defect this closes: a percentage ceiling could previously only be written in CSS, and CSS stops the paint but not the state. `ResizeHandle` publishes the hook's size as `aria-valuenow`, so the separator announced a width the panel did not have — measured at **899.5 against a 434px panel**. Bounds now clamp the state, so paint, persistence and ARIA describe one geometry.

`ResizeHandle` also warns in development when its `direction` disagrees with its region's, which previously failed silently.

The container basis follows the ref, not the element it first pointed at: replacing the element behind the same `containerRef` re-resolves against the replacement, and the element left behind is unobserved. A container that is not laid out yet — unmounted, `display:none`, detached — measures 0, which is not a measurement: percentages hold the documented temporary 1200px basis until it is real, and nothing is written to `autoSaveId` storage from it. Once the first real basis resolves, the default is committed as a pixel selection with its initial clamp included; a 321px default clamped to 200px therefore stays 200px when the container later grows instead of reviving the raw default.

A gesture that is cancelled rather than completed — `pointercancel`, a lost pointer capture, a handle unmounted mid-drag — releases the basis it froze through a new optional `_onResizeCancel` on `ResizableProps`. It is not a resize end (a cancelled drag deliberately signals none, per #5297), but it is the end of the gesture. `_onResizeCancel` and `_direction` are both optional: `ResizableProps` is exported, so an object literal that satisfied the released type still compiles.

Not in scope, per the spec: SideNav's simplified `defaultWidth`/`minWidth`/`maxWidth` stays pixel-only.

A pixel-only configuration keeps its single render pass. With no percentage anywhere there is no container to measure, so the pixel selection is made at mount rather than corrected on a second pass; only a supplied container defers, because its measurement does not exist until after commit.

@freddymeta
