---
'@astryxdesign/core': patch
---

[fix] DropdownMenu and ContextMenu keyboard navigation now reaches menuitemradio and menuitemcheckbox items (#3829)

Arrow-key navigation, first-character typeahead, and Enter/Space activation hard-matched `role="menuitem"`, so consumer-rendered `role="menuitemradio"` / `role="menuitemcheckbox"` items in compound-mode menus were unreachable by keyboard. All three menu item roles now participate, `aria-disabled` items are still skipped, and MoreMenu shares DropdownMenu's keyboard path via delegation. Lands the keyboard-role fix approved for independent landing in #3829 (Phase 9), carried over from the parked draft #3821.
@AKnassa @cixzhang
