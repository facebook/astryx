---
'@astryxdesign/core': patch
---

[feat] Astryx components are now translatable. Wrap your app in `<InternationalizationProvider locale="...">` and pass one or more locale catalogs to render astryx UI in the language of your choice. Call `useTranslator()` inside your own components to translate your consumer strings against the active locale.

Astryx ships an English catalog and BCP 47 regional fallback (e.g. `pt-BR` → `pt` → `en`), so consumers who never render a provider see today's English strings unchanged.

Pagination is the first component wired up as part of this change. More components follow in subsequent releases.

@nynexman4464
