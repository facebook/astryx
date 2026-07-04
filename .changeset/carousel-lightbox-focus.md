---
'@astryxdesign/core': patch
---

[fix] Carousel, Lightbox: keyboard focus is no longer trapped on invisible or unmounted edge controls. Carousel's scroll left/right buttons, when at an exhausted edge (or when there is no overflow), were hidden with `opacity: 0`/`pointer-events: none` but stayed in the tab order, so keyboard users could focus invisible controls (WCAG 2.4.7); they are now `disabled` in that state (still mounted, removed from the tab order and a11y tree). Button-driven scrolling also now respects `prefers-reduced-motion` (uses `behavior: 'auto'` instead of hardcoded `'smooth'`). In Lightbox gallery mode, the Prev/Next buttons previously unmounted at the range ends, so advancing onto the first/last item removed the focused control and dropped focus to `<body>`, dead-ending keyboard navigation; they now stay mounted and become `disabled` at the boundaries so focus stays within the dialog and arrow-key navigation keeps working (#3343)
@cixzhang
