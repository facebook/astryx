---
'@astryxdesign/core': patch
---

[fix] A busy `DateInput` (`isLoading`, or a pending `changeAction`) no longer looks disabled. On the popover, native, and bottom-sheet surfaces the field keeps its ordinary paint and shows its Spinner while new commits are blocked; only `isDisabled` dims the field. The busy field still takes no hover ring and keeps its keyboard focus ring. Props, semantics, and announcements are unchanged. (#7968)

@cixzhang
