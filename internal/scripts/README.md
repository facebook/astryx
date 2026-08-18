# /internal/scripts

Internal build-time scripts. Not shipped, not part of any package.

<!-- SYNC: When files in this directory change, update this document. -->

| File                             | Purpose                                                                                                                                                                                                    |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `upload-crowdin-screenshots.mjs` | Build storybook, capture in-context screenshots for i18n catalog keys, upload to Crowdin, and POST tag positions so each screenshot pixel-links to the matching source string.                             |
| `lib/crowdin-strategies.mjs`     | Declarative measurement strategies (visibleText, option, placeholder, ariaLabel, chipOperator, filterInput, footerButton, srOnlyLabel, srOnlyReveal) used by the upload script to resolve tag coordinates. |

## upload-crowdin-screenshots.mjs

Automates the "screenshot with in-context tags" flow for [Crowdin](https://crowdin.com/), the translation platform used by astryx.

Translators see each catalog key alongside a real screenshot of where it appears in the UI. Boxes on the screenshot mark exactly which pixels correspond to which key. This dramatically reduces "what does this string mean?" back-and-forth.

### Usage

```bash
CROWDIN_PERSONAL_TOKEN=xxx CROWDIN_PROJECT_ID=nnn \
  node internal/scripts/upload-crowdin-screenshots.mjs [flags]
```

Common flags:

| Flag             | Purpose                                                                                             |
| ---------------- | --------------------------------------------------------------------------------------------------- |
| `--dry-run`      | Capture screenshots + resolve tag coordinates, but skip Crowdin upload.                             |
| `--validate`     | Verify every declared tag key exists in `packages/core/locales/en.json`, then exit.                 |
| `--skip-build`   | Reuse existing `apps/storybook/dist/` build.                                                        |
| `--only=<name>`  | Comma-separated target names to run (e.g. `--only=dialog-close-button,banner-dismissable`).         |
| `--replace-tags` | For existing Crowdin screenshots, delete previously POSTed tags before uploading fresh coordinates. |
| `--delete-first` | Delete the entire screenshot record on Crowdin (id + tags) before re-uploading.                     |

Tokens: personal API token from https://crowdin.com/settings#api-key. Project ID is the numeric ID visible in the Crowdin URL.

### How targets are declared

Each screenshot is an entry in the `targets` array with:

```js
{
  name: 'dialog-close-button',
  storyId: 'core-dialog--default',
  viewport: {width: 900, height: 700},
  interact: async page => { /* optional Playwright interaction */ },
  selector: null,  // or CSS selector to crop to
  manualTags: [
    t('astryx.dialog.close', 'ariaLabel', 'Close'),
  ],
}
```

`t(key, strategyName, ...args)` declares one tag. The strategy is a small function that returns pixel coordinates given the rendered page — see `lib/crowdin-strategies.mjs` for the taxonomy. New strategies are added there when a new measurement pattern comes up.

### Screen-reader-only labels

Some catalog strings are aria-labels on widgets that render no visible text (bare checkboxes, unlabelled comboboxes). Two strategies handle this:

- `srOnlyLabel` — tag rect lands on the visible ancestor widget. Best when the widget has some other identifying feature (icon, adjacent text).
- `srOnlyReveal` — injects a small yellow label bubble next to the widget during screenshot capture, then tags the bubble. Translators see the actual aria-label text pinned to the widget. Best when the widget has no visible cue at all.

Reveal bubbles only exist inside the screenshot pipeline — they are never rendered in production.

### Deterministic tagging, not `--auto-tag`

Crowdin's built-in `--auto-tag` uses fuzzy text matching, which produces false positives (e.g. tagging the wrong "Close"). This script is fully deterministic — every declared tag either resolves to a specific DOM element or the run reports it as unresolved. Catalog keys are validated on every invocation.

### When to re-run

- After adding a new catalog key that has visual context worth showing translators.
- After a component redesign that changes the pixel position of tagged strings.
- After adding a new story that better exposes existing keys.

`--replace-tags` handles the "just update the pixel positions" case cleanly.
