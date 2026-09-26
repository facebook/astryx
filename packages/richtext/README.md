# @astryxdesign/richtext

Astryx rich text — a Lexical-based rich text editor and read-only viewer, styled
with Astryx design tokens.

```tsx
import {RichTextEditor, RichTextView} from '@astryxdesign/richtext';

<RichTextEditor label="Notes" onChange={setState} />;
<RichTextView label="Notes" value={serializedState} />;
```

The editor is deliberately minimal and extensible: pass `nodes` and `plugins` to
layer richer behaviour (toolbars, mentions, hover cards) on top without forking.
`RichTextEditorToolbar` is a composable formatting toolbar that drops into the
editor's `plugins` slot, and `markdownToEditorStateJSON` /
`editorStateJSONToMarkdown` convert Markdown to/from serialized editor state
headlessly (no mounted editor required). It consumes `@astryxdesign/core` theme
tokens directly (StyleX build mirrors `@astryxdesign/lab` / `@astryxdesign/charts`).

`lexical` and the `@lexical/*` packages are **optional** peer dependencies —
install them alongside richtext to use the editor. See the RFC:
[facebook/astryx#3899](https://github.com/facebook/astryx/issues/3899).

It ships to npm **only under the `@canary` dist-tag** — there is never a stable
(`latest`) release yet.

> Note: this package is the successor to the experimental `RichTextEditor` that
> used to live in `@astryxdesign/lab`; that code has moved here so it can be
> canaried independently (e.g. into EPS/Nest) without a fresh package rollout.

## Status

Under active development. The editor, view, composable toolbar, and Markdown
serializers are in place; API and visuals are still being refined. The goal is
graduation to `@astryxdesign/core` after the design/API stabilizes.

## Usage

Inside the monorepo (storybook/sandbox), imports resolve via pnpm workspaces:

```tsx
import {RichTextEditor, RichTextView} from '@astryxdesign/richtext';
import '@astryxdesign/core/astryx.css';
import '@astryxdesign/richtext/richtext.css';
```

Interactive examples live in the storybook app under **Lab/RichTextEditor**
(`apps/storybook/stories/RichTextEditor.stories.tsx`).

### Trying richtext in your own project (canary)

`@astryxdesign/richtext` is published **only** under the `@canary` dist-tag, so
you must request that tag explicitly. There is no `latest` version to install.

```bash
npm install @astryxdesign/richtext@canary @astryxdesign/core@canary
# plus the optional lexical peers you use:
npm install lexical @lexical/react @lexical/markdown @lexical/rich-text
```

> Canary builds track the latest commit on `main` (`0.x.y-canary.<sha>`). They
> can break between any two versions — pin an exact version if you need
> stability.

## Why no stable release?

`package.json` keeps `"private": true` plus an `"astryx": { "canaryOnly": true }`
marker. The release workflow's stable (`latest`) job skips both private and
`canaryOnly` packages, while the canary job strips `private` in its ephemeral CI
checkout only (never in git) to publish the `@canary` tag. The committed
`private: true` is npm's hard guarantee that no stable publish can ever happen —
**do not remove it.**

## Publishing publicly (when the editor/view are ready)

When maintainers are ready to promote richtext to a stable public release:

1. Remove `"private": true` **and** the `"astryx": { "canaryOnly": true }`
   marker from `package.json`.
2. Add a changeset (`pnpm changeset`) selecting `@astryxdesign/richtext` so the
   release workflow versions and publishes it to the `latest` dist-tag.
3. The stable (`latest`) release job (`.github/workflows/release.yml`) will then
   include richtext on the next release.
