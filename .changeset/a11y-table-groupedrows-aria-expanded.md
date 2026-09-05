---
'@astryxdesign/core': patch
---

[fix] Table groupedRows plugin: group header rows no longer carry `aria-expanded`. On a native table that attribute is invalid on a row (axe `aria-conditional-attr`: rows may only expand inside a treegrid), and a group header is a section separator of flat data, not a tree parent. The collapse state stays announced by the group's chevron button, which already carries `aria-expanded`. If a test queried `tr[aria-expanded]` on a grouped table, target the button instead.
@AKnassa
