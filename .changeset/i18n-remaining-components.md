---
'@astryxdesign/core': patch
---

[feat] 27 more components are now translatable — including AlertDialog, AppShell, Calendar, Chat, CommandPalette, DateRangeInput, DateTimeInput, Dialog, DropdownMenu, Lightbox, Markdown, MobileNav, Popover, Selector, SideNav, Table (and its filter/selection/sort plugins), Toast, Tokenizer, TopNav, and Typeahead. Astryx's English wording is preserved for consumers without a provider.

[breaking type] `Markdown.renderBlock` now takes a `t: TranslatorFn` parameter, threaded from the top-level `Markdown` component. Direct consumers of `renderBlock` need to pass a translator.

[behavior] `TreeList`'s expand/collapse toggle button now identifies itself with `data-tree-toggle` in addition to its aria-label — useful because the aria-label is now locale-dependent. Consumers using `querySelector('[aria-label="Toggle children"]')` for DOM lookup should switch to `data-tree-toggle`.

@nynexman4464
