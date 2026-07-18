---
'@astryxdesign/core': patch
---

[fix] Route the Table sortable plugin's header-button aria-labels ("Sort by …", "… sorted …", "… priority … of …") through `useTranslator()` with new `@astryx.table.sort.sortBy` / `sortedBy` / `sortedByWithPriority` / `direction.*` catalog keys, so they localize like the sort menu labels already do (#3618, tracker #3636). The direction word resolves through its own key rather than interpolating the raw enum value. English output is unchanged.

@AKnassa
