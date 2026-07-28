// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file editorTheme.ts
 * @input Uses StyleX + Astryx design tokens
 * @output Exports sharedEditorTheme(), which builds a Lexical EditorThemeClasses
 *   object mapping Lexical's theme slots to StyleX-generated class names.
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
    marginBlock: spacingVars['--spacing-1'],
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
  list: {
    marginBlock: spacingVars['--spacing-1'],
    paddingInlineStart: spacingVars['--spacing-6'],
  },
  listItem: {
    marginBlock: spacingVars['--spacing-0-5'],
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
  return {
    paragraph: stylex.props(editorTheme.paragraph).className,
    heading: {
      h1: stylex.props(editorTheme.h1).className,
      h2: stylex.props(editorTheme.h2).className,
      h3: stylex.props(editorTheme.h3).className,
    },
    quote: stylex.props(editorTheme.quote).className,
    list: {
      ul: stylex.props(editorTheme.list).className,
      ol: stylex.props(editorTheme.list).className,
      listitem: stylex.props(editorTheme.listItem).className,
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
