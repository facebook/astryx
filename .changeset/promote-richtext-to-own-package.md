---
'@astryxdesign/richtext': minor
'@astryxdesign/lab': minor
---

[feat] Promote the Lexical-based RichTextEditor out of `@astryxdesign/lab` into its own canary-only package, `@astryxdesign/richtext`, so it can be canaried independently (e.g. into EPS/Nest) without dragging the rest of lab along.

The full editor surface — `RichTextEditor`, `RichTextView`, `RichTextEditorToolbar`, `markdownToEditorStateJSON` / `editorStateJSONToMarkdown`, `sharedEditorTheme`, `RICHTEXT_ICON_KEYS`, and their types — now ships from `@astryxdesign/richtext` (canary-only, `private` + `canaryOnly`, same publishing model as `@astryxdesign/lab` / `@astryxdesign/charts`). The `@lexical/*` packages remain optional peer dependencies. StyleX CSS is emitted to `@astryxdesign/richtext/richtext.css`.

**Breaking (lab canary consumers):** these exports are removed from `@astryxdesign/lab`. Update imports:

```diff
-import {RichTextEditor, RichTextView} from '@astryxdesign/lab';
+import {RichTextEditor, RichTextView} from '@astryxdesign/richtext';
```

Storybook examples (Lab/RichTextEditor) now render against `@astryxdesign/richtext`.
@potatowagon
