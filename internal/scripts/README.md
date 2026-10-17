# /internal/scripts

Internal build-time scripts. Not shipped, not part of any package.

<!-- SYNC: When files in this directory change, update this document. -->

| File                             | Purpose                                                                                                                                                                                                                               |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `upload-crowdin-screenshots.mjs` | Build storybook, capture in-context screenshots for i18n catalog keys, upload to Crowdin, and POST tag positions so each screenshot pixel-links to the matching source string.                                                        |
| `lib/crowdin-strategies.mjs`     | Declarative measurement strategies (visibleText, textRun, option, placeholder, ariaLabel, chipOperator, filterInput, footerButton, srOnlyLabel, srOnlyReveal, liveRegionReveal) used by the upload script to resolve tag coordinates. |

The file-level context Crowdin shows beside every string in the catalog is a
field on the file record, not something `crowdin.yml` can declare; a step in
`.github/workflows/crowdin-upload.yml` sets it after the source upload.

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

### Strings sharing an element with other content

`visibleText` matches an element whose whole text is the string, so it cannot reach a CommandPalette footer hint — `<span><Kbd/>Navigate</span>` reads `↑↓Navigate`. `textRun` matches the bare text node and measures it with a `Range`, tagging the word without the key badge.

### Screen-reader-only labels

Some catalog strings are aria-labels on widgets that render no visible text (bare checkboxes, unlabelled comboboxes). Two strategies handle this:

- `srOnlyLabel` — tag rect lands on the visible ancestor widget. Best when the widget has some other identifying feature (icon, adjacent text).
- `srOnlyReveal` — injects a small yellow label bubble next to the widget during screenshot capture, then tags the bubble. Translators see the actual aria-label text pinned to the widget. Best when the widget has no visible cue at all.

Reveal bubbles only exist inside the screenshot pipeline — they are never rendered in production. A bubble beside a widget at the edge of the viewport slides along that edge until it fits.

### Live-region announcements

Strings announced through `useAnnounce()` land in a 1×1 clipped region on `<body>` and clear themselves seconds later, so they have no pixels and no useful position. `liveRegionReveal(text, anchorSelector, placement?)` checks that a region is announcing `text`, then reveals a bubble beside `anchorSelector` — the widget the announcement is about.

Timing matters: the pre-screenshot pass (every strategy in `MUTATING_STRATEGIES`) has to run while the text is still live, and the measurement pass then reads back the rect recorded at injection. A target's `interact` must therefore leave the page inside that window.

### A tag has to fit the screenshot

Crowdin rejects a tag rectangle that leaves the uploaded image, so every strategy requires the viewport to contain a candidate's rect. A match below the fold is reported unresolved rather than trimmed or scrolled into view — widen the target's `viewport` if a string you want tagged sits outside it.

### Deterministic tagging, not `--auto-tag`

Crowdin's built-in `--auto-tag` uses fuzzy text matching, which produces false positives (e.g. tagging the wrong "Close"). This script is fully deterministic — every declared tag either resolves to a specific DOM element or the run reports it as unresolved. Catalog keys are validated on every invocation.

### When to re-run

- After adding a new catalog key that has visual context worth showing translators.
- After a component redesign that changes the pixel position of tagged strings.
- After adding a new story that better exposes existing keys.

`--replace-tags` handles the "just update the pixel positions" case cleanly.
