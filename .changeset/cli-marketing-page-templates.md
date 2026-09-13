---
'@astryxdesign/cli': patch
---

[feat] Four marketing page templates, the prompt-class the official roster never answered: `marketing-landing` (hero, value pillars, testimonial, pricing teaser, closing CTA), `marketing-pricing` (billing-period toggle, three tiers, per-plan feature lists, billing FAQ), `marketing-feature-sections` (a split media row, a four-up icon grid, a metric band, and a bento grid, so the page teaches four shapes rather than repeating one), and `marketing-footer` (sitemap, newsletter, and minimal footers). `TemplateCategory` gains a `Marketing` group covering landing, pricing, feature sections, footer, testimonials, and FAQ; the last two are reserved for future templates, as the taxonomy intends.

[fix] `search` now indexes a template's authored name, not just its directory. A page authored as `Searchable Table` was only findable as `table-page`, and on `landing page` two templates tied on the keyword `Landing` so the alphabetical tiebreak answered with `ai-chat-landing`. The authored name runs the same name ladder as the directory and the stronger of the two wins.

@AKnassa
