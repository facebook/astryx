// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Ambient module declaration for `*.doc.mjs` imports.
 * @input None — a declaration file.
 * @output Types `*.doc.mjs` imports within this package.
 * @position Type support for packages/richtext; mirrors
 *   packages/core/src/doc-mjs.d.ts.
 *
 * `RichTextEditor.test.tsx` imports `RichTextEditor.doc.mjs` to assert the
 * theme target's declared `visualProps` match the `data-*` attributes the
 * component actually reflects. Without this declaration, TypeScript cannot
 * type a `.mjs` import and fails with TS7016 ("Could not find a declaration
 * file for module"). Core carries the same declaration for its own contract
 * tests; it is not visible across the package boundary.
 */

declare module '*.doc.mjs' {
  import type {
    ComponentDoc,
    ComponentTranslationDoc,
  } from '@astryxdesign/cli/authoring';

  export const docs: ComponentDoc;
  export const docsZh: ComponentDoc;
  export const docsDense: ComponentTranslationDoc;
}
