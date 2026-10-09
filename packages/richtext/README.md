# @astryxdesign/richtext

Astryx rich text — a Lexical-based rich text editor and read-only viewer, styled
with Astryx design tokens.

```tsx
import {RichTextEditor, RichTextView} from '@astryxdesign/richtext';

<RichTextEditor label="Notes" onChange={setState} />;
<RichTextView value={serializedState} />;
```

The editor is deliberately minimal and extensible: pass `nodes` and `plugins` to
layer richer behaviour (toolbars, mentions, hover cards) on top without forking.
`RichTextEditorToolbar` is a composable formatting toolbar for the editor's
`toolbar` slot, and `markdownToEditorStateJSON` / `editorStateJSONToMarkdown`
convert Markdown to and from serialized editor state headlessly (no mounted
editor required). The server-safe serializers are also available from
`@astryxdesign/richtext/markdown`.

`RichTextView` and core `Markdown` render the same document the same way, and
Markdown imported into the editor exports back byte for byte when nothing was
edited.

## Install

```bash
npm install @astryxdesign/richtext @astryxdesign/core
# plus the Lexical packages the editor uses:
npm install lexical @lexical/react @lexical/markdown @lexical/rich-text \
  @lexical/list @lexical/link @lexical/code @lexical/table @lexical/html \
  @lexical/headless @lexical/selection @lexical/extension @lexical/utils
```

`@astryxdesign/richtext` is released together with `@astryxdesign/core` at the
same version; install matching versions. `lexical` and the `@lexical/*` packages
are optional peer dependencies, so a project that only uses the headless
Markdown serializers installs just those.

```tsx
import '@astryxdesign/core/astryx.css';
import '@astryxdesign/richtext/richtext.css';
```

## Examples

Interactive examples live in Storybook under **RichText/RichTextEditor**
(`apps/storybook/stories/RichTextEditor.stories.tsx`).
