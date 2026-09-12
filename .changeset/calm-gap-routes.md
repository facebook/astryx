---
'@astryxdesign/cli': patch
---

[feat] Replace executable gap-report writers with composable handlers. (#6200)

Gap reports now fan out to every configured handler — project config first,
then each loaded integration in config order — instead of selecting one
writer. Each handler gets its own report copy and an abort signal under a 30 s
budget. A failed handler cannot stop later handlers, and the aggregate receipt
shows every outcome.

Public types: `GapReportHandler` replaces `GapReportWriter`; the handler
receives a normalized `GapReport` event and returns a strict
`GapReportHandlerReceipt`. Project config gains a `gapReport` field; the
integration named export uses the same type.

@josephfarina
