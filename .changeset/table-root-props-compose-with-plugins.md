---
'@astryxdesign/core': patch
---

[fix] Table: a handler passed to `Table` or `BaseTable` for an event a plugin also handles on the `<table>` (`onKeyDown`, `onFocus`, …) composes with the plugin's instead of replacing it. The caller's handler runs first, and `event.preventDefault()` skips the plugin's. An unset handler a wrapper forwards (`onKeyDown={props.onKeyDown}`) leaves the plugin's in place. A plugin's `role` on the `<table>` wins over a caller's, with a development warning, since the row semantics the plugin adds depend on it.
@AKnassa
