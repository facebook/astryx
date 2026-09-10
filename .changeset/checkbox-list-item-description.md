---
'@astryxdesign/core': patch
---

[fix] CheckboxListItem: the visible `description` is now the checkbox's accessible description, so the browser computes a distinct description instead of none. Item ids the description element it already renders and publishes that id to the content it renders in a slot, which keeps a plain string description's automatic single-line truncation. CheckboxInput now merges a consumer-supplied `aria-describedby` with its own description, status, and disabled-reason ids rather than replacing it. No public API changes.

@Kyujenius
