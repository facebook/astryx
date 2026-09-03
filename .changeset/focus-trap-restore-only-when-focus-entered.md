---
'@astryxdesign/core': patch
---

[fix] useFocusTrap only restores focus when focus actually entered the trap while it was active. (#5651)

`useFocusTrap` captured `document.activeElement` on activation and restored
focus to it on deactivation whenever focus would otherwise be lost to `<body>`.
For popups that deliberately keep DOM focus on their trigger — a Typeahead or
PowerSearch listbox opened with `role: "none"` and `hasAutoFocus: false` — the
trap never receives focus, so the restore fired on outside-click dismissal and
re-focused the anchor input. Because the input was then already focused,
clicking it again fired no `focus` event and `hasEntriesOnFocus` could not
reopen the menu — the control was stuck until a second outside click.

The restore effect now tracks whether focus entered the trap container at any
point while it was active (via a `focusin` listener). If focus never entered,
the restore is skipped entirely. Popups that do take focus — Dialog,
DropdownMenu, a Typeahead option click — are unaffected.

@trakshan-mishra
