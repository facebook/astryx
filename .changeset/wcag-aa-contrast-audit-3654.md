---
'@astryxdesign/core': patch
'@astryxdesign/cli': patch
'@astryxdesign/theme-butter': patch
'@astryxdesign/theme-chocolate': patch
'@astryxdesign/theme-gothic': patch
'@astryxdesign/theme-matcha': patch
'@astryxdesign/theme-neutral': patch
'@astryxdesign/theme-stone': patch
'@astryxdesign/theme-y2k': patch
---

[fix] WCAG 2.1 AA colour contrast across the design system: retune core default + all theme palettes to pass a new cross-theme contrast contract, fix components painting active content with disabled/low-contrast colours (ChatToolCalls, ChatComposer placeholder, dictation interim text, Calendar outside-day opacity collision, Lightbox media chrome, tinted Card text), and add a CI-enforced contrast audit in internal/theme-contrast (#3654)
@AKnassa
