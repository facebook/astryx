---
'@astryxdesign/core': patch
---

[feat] Table: `astryx-table-cell` and `astryx-table-header-cell` now reflect the active row density as `data-density` (`compact`/`balanced`/`spacious`), so a theme can override cell padding per density via `defineTheme`. Previously the density split lived entirely in internal StyleX classes with no `density:*` hook on the cell target, so a `components: { 'table-cell': {...} }` entry could only set one padding for all densities — it could not, for example, hold the inline inset constant while varying only the block padding per density. The targets now carry the hook (`{className: 'astryx-table-cell', visualProps: ['density']}`), enabling `components: { 'table-cell': { 'density:balanced': { paddingBlock: '12px' } } }`. Purely additive — default padding is unchanged.

@freddymeta
