---
'@astryxdesign/cli': patch
---

[feat] Docs can mark an experimental surface: every doc type except `ThemeDoc` and `IconSetDoc`, and every schema field and enum value, accepts `stability: 'experimental'`. A marked command shows `[experimental]` in help, a marked schema field or enum value is left out of its stable table so its feature's own docs describe it, and `astryx search` leaves out a marked doc, which is read on its own route. For the package being authored, `doctor integration validate` (and so `integration check`) adds `olderCliNotes`, each `{file, kind, field, message}`: a template or namespace doc that sets `stability`, or a template that declares `icons`, while the package's CLI peer range admits a release before 0.7.4, which drops that descriptor. A note is never an error or a warning and never fails a check, under `--strict` or `--next`; text output prints "Notes for older CLIs". Docs and findings that use none of these read exactly as before. (#7759)

@josephfarina
