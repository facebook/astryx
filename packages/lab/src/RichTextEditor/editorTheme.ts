// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file editorTheme.ts
 * @input Uses StyleX + Astryx design tokens
 * @output Exports sharedEditorTheme(), which builds a Lexical EditorThemeClasses
 *   object mapping Lexical's theme slots to StyleX-generated class names and
 *   normalizes paragraph spacing for editor/view alignment.
 * @position Shared by RichTextEditor.tsx and RichTextView.tsx so editor and
 *   read-only view render identically.
 *
 * SYNC: When modified, keep RichTextEditor.tsx and RichTextView.tsx in sync.
 */

import * as stylex from '@stylexjs/stylex';
import {
  colorVars,
  spacingVars,
  radiusVars,
  typographyVars,
  typeScaleVars,
  fontWeightVars,
} from '@astryxdesign/core/theme/tokens.stylex';
import type {EditorThemeClasses} from 'lexical';

const editorTheme = stylex.create({
  paragraph: {
    // A leading margin collapses through Lexical's wrapper and stacks with the
    // input inset. Keep the same between-paragraph rhythm on the end edge so
    // the first line aligns with TextArea and the empty-editor placeholder.
    marginBlockStart: spacingVars['--spacing-0'],
    marginBlockEnd: spacingVars['--spacing-1'],
  },
  h1: {
    fontFamily: typographyVars['--font-family-heading'],
    fontSize: '1.5rem',
    fontWeight: fontWeightVars['--font-weight-semibold'],
    marginBlock: spacingVars['--spacing-2'],
  },
  h2: {
    fontFamily: typographyVars['--font-family-heading'],
    fontSize: '1.25rem',
    fontWeight: fontWeightVars['--font-weight-semibold'],
    marginBlock: spacingVars['--spacing-2'],
  },
  h3: {
    fontFamily: typographyVars['--font-family-heading'],
    fontSize: '1.125rem',
    fontWeight: fontWeightVars['--font-weight-semibold'],
    marginBlock: spacingVars['--spacing-1'],
  },
  quote: {
    marginBlock: spacingVars['--spacing-2'],
    marginInline: 0,
    paddingInlineStart: spacingVars['--spacing-3'],
    borderInlineStartWidth: '3px',
    borderInlineStartStyle: 'solid',
    borderInlineStartColor: colorVars['--color-border-emphasized'],
    color: colorVars['--color-text-secondary'],
  },
  ul: {
    marginBlock: spacingVars['--spacing-1'],
    paddingInlineStart: spacingVars['--spacing-6'],
    listStyleType: 'disc',
    listStylePosition: 'outside',
  },
  ol: {
    marginBlock: spacingVars['--spacing-1'],
    paddingInlineStart: spacingVars['--spacing-6'],
    listStyleType: 'decimal',
    listStylePosition: 'outside',
  },
  // Nested lists: no extra vertical margin, and cycle marker styles per depth
  // to match native browser list nesting. Lexical indexes ulDepth/olDepth by
  // `depth % array.length`, so three entries give three distinct levels that
  // then repeat — matching the browser default disc → circle → square cycle.
  ulNested: {
    marginBlock: 0,
  },
  ulDepth2: {
    listStyleType: 'circle',
  },
  ulDepth3: {
    listStyleType: 'square',
  },
  olNested: {
    marginBlock: 0,
  },
  olDepth2: {
    listStyleType: 'lower-alpha',
  },
  olDepth3: {
    listStyleType: 'lower-roman',
  },
  // Checklists render as a <ul listtype="check">; Lexical draws checkbox
  // affordances on the list items, so suppress the disc marker here.
  checklist: {
    listStyleType: 'none',
    paddingInlineStart: spacingVars['--spacing-2'],
  },
  listItem: {
    marginBlock: spacingVars['--spacing-0-5'],
    // Ensure the marker is shown (some CSS resets set list-style: none on li).
    listStyleType: 'inherit',
  },
  link: {
    color: colorVars['--color-text-accent'],
    textDecoration: 'underline',
    cursor: 'pointer',
  },
  textBold: {fontWeight: fontWeightVars['--font-weight-bold']},
  textItalic: {fontStyle: 'italic'},
  textUnderline: {textDecoration: 'underline'},
  textStrikethrough: {textDecoration: 'line-through'},
  textCode: {
    fontFamily: typographyVars['--font-family-code'],
    backgroundColor: colorVars['--color-background-muted'],
    paddingInline: spacingVars['--spacing-1'],
    paddingBlock: spacingVars['--spacing-0-5'],
    borderRadius: radiusVars['--radius-inner'],
    fontSize: '0.9em',
  },
  code: {
    display: 'block',
    fontFamily: typographyVars['--font-family-code'],
    backgroundColor: colorVars['--color-background-muted'],
    padding: spacingVars['--spacing-3'],
    borderRadius: radiusVars['--radius-inner'],
    fontSize: typeScaleVars['--text-supporting-size'],
    marginBlock: spacingVars['--spacing-2'],
    whiteSpace: 'pre-wrap',
  },
});

/**
 * Builds the Lexical EditorThemeClasses object. Lexical expects plain
 * class-name strings, which `stylex.props(...).className` yields.
 */
export function sharedEditorTheme(): EditorThemeClasses {
  const ulClass = stylex.props(editorTheme.ul).className ?? '';
  const olClass = stylex.props(editorTheme.ol).className ?? '';
  const ulDepth2Class =
    stylex.props(editorTheme.ul, editorTheme.ulNested, editorTheme.ulDepth2)
      .className ?? '';
  const ulDepth3Class =
    stylex.props(editorTheme.ul, editorTheme.ulNested, editorTheme.ulDepth3)
      .className ?? '';
  const olDepth2Class =
    stylex.props(editorTheme.ol, editorTheme.olNested, editorTheme.olDepth2)
      .className ?? '';
  const olDepth3Class =
    stylex.props(editorTheme.ol, editorTheme.olNested, editorTheme.olDepth3)
      .className ?? '';
  return {
    paragraph: stylex.props(editorTheme.paragraph).className,
    heading: {
      h1: stylex.props(editorTheme.h1).className,
      h2: stylex.props(editorTheme.h2).className,
      h3: stylex.props(editorTheme.h3).className,
    },
    quote: stylex.props(editorTheme.quote).className,
    list: {
      ul: ulClass,
      ol: olClass,
      checklist: stylex.props(editorTheme.ul, editorTheme.checklist).className,
      listitem: stylex.props(editorTheme.listItem).className,
      nested: {
        listitem: stylex.props(editorTheme.listItem).className,
      },
      // Depth arrays cycle via `depth % length`, so three entries give three
      // distinct nesting levels before repeating (disc→circle→square, etc.).
      ulDepth: [ulClass, ulDepth2Class, ulDepth3Class],
      olDepth: [olClass, olDepth2Class, olDepth3Class],
    },
    link: stylex.props(editorTheme.link).className,
    text: {
      bold: stylex.props(editorTheme.textBold).className,
      italic: stylex.props(editorTheme.textItalic).className,
      underline: stylex.props(editorTheme.textUnderline).className,
      strikethrough: stylex.props(editorTheme.textStrikethrough).className,
      code: stylex.props(editorTheme.textCode).className,
    },
    code: stylex.props(editorTheme.code).className,
  };
}
