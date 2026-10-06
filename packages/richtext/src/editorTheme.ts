// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file editorTheme.ts
 * @input Uses StyleX + Astryx design tokens
 * @output Exports sharedEditorTheme(), which builds a Lexical EditorThemeClasses
 *   object mapping Lexical's theme slots to StyleX-generated class names, with
 *   document blocks styled like core Markdown (spec:AST-061 FR2–FR4).
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
  borderVars,
  focusVars,
} from '@astryxdesign/core/theme/tokens.stylex';
import type {EditorThemeClasses} from 'lexical';

// Document blocks follow core Markdown's typography, spacing, and measure
// (spec:AST-061 FR2–FR4): type-scale tokens for text, one block spacing table
// with no margin before the first block or after the last, and prose capped
// at Markdown's default content width while code and tables span the editor.
const PROSE_MEASURE = '680px';

// Block margins wrap their spacing tokens in calc(). The value is unique to
// these rules, so its atomic class never matches a margin declared by other
// code; a stylesheet in a later cascade layer therefore cannot outrank the
// :first-child and :last-child rules that remove the outer margins.
const MAJOR_HEADING_BEFORE = `calc(${spacingVars['--spacing-6']})`;
const MAJOR_HEADING_AFTER = `calc(${spacingVars['--spacing-3']})`;
const MINOR_HEADING_BEFORE = `calc(${spacingVars['--spacing-4']})`;
const MINOR_HEADING_AFTER = `calc(${spacingVars['--spacing-2']})`;
const TEXT_BLOCK_SPACE = `calc(${spacingVars['--spacing-3']})`;
const WIDE_BLOCK_SPACE = `calc(${spacingVars['--spacing-4']})`;
const LIST_ITEM_SPACE = `calc(${spacingVars['--spacing-1']})`;
const LIST_ROW_GAP = `calc(${spacingVars['--spacing-0-5']})`;
const LIST_ROW_FLUSH = `calc(${spacingVars['--spacing-0']})`;
const NESTED_LIST_SPACE = `calc(${spacingVars['--spacing-2']})`;
const RULE_SPACE = `calc(${spacingVars['--spacing-6']})`;

const editorTheme = stylex.create({
  // Lexical marks every top-level block `dir="auto"`, which picks each
  // block's direction from its first strong character: a Hebrew paragraph in
  // an English document flips to the right, an English one in an Arabic
  // document to the left. Blocks take the direction of the surface around
  // them instead, as core Markdown's do, and bidi inside a block still
  // follows the Unicode algorithm (spec:AST-061 FR6).
  providerDirection: {
    direction: 'inherit',
  },
  paragraph: {
    // The first block's leading margin would stack with the input inset, so
    // the first line aligns with TextArea and the empty-editor placeholder.
    marginBlockStart: {
      default: TEXT_BLOCK_SPACE,
      ':first-child': spacingVars['--spacing-0'],
    },
    marginBlockEnd: {
      default: TEXT_BLOCK_SPACE,
      ':last-child': spacingVars['--spacing-0'],
    },
    maxWidth: PROSE_MEASURE,
    // The base reset gives every <p> body weight and primary color; a
    // paragraph inside a table header cell takes the cell's instead.
    fontWeight: 'inherit',
    color: 'inherit',
  },
  h1: {
    fontFamily: typographyVars['--font-family-heading'],
    fontSize: typeScaleVars['--text-heading-1-size'],
    fontWeight: typeScaleVars['--text-heading-1-weight'],
    lineHeight: typeScaleVars['--text-heading-1-leading'],
    marginBlockStart: {
      default: MAJOR_HEADING_BEFORE,
      ':first-child': spacingVars['--spacing-0'],
    },
    marginBlockEnd: {
      default: MAJOR_HEADING_AFTER,
      ':last-child': spacingVars['--spacing-0'],
    },
    maxWidth: PROSE_MEASURE,
  },
  h2: {
    fontFamily: typographyVars['--font-family-heading'],
    fontSize: typeScaleVars['--text-heading-2-size'],
    fontWeight: typeScaleVars['--text-heading-2-weight'],
    lineHeight: typeScaleVars['--text-heading-2-leading'],
    marginBlockStart: {
      default: MAJOR_HEADING_BEFORE,
      ':first-child': spacingVars['--spacing-0'],
    },
    marginBlockEnd: {
      default: MAJOR_HEADING_AFTER,
      ':last-child': spacingVars['--spacing-0'],
    },
    maxWidth: PROSE_MEASURE,
  },
  h3: {
    fontFamily: typographyVars['--font-family-heading'],
    fontSize: typeScaleVars['--text-heading-3-size'],
    fontWeight: typeScaleVars['--text-heading-3-weight'],
    lineHeight: typeScaleVars['--text-heading-3-leading'],
    marginBlockStart: {
      default: MAJOR_HEADING_BEFORE,
      ':first-child': spacingVars['--spacing-0'],
    },
    marginBlockEnd: {
      default: MAJOR_HEADING_AFTER,
      ':last-child': spacingVars['--spacing-0'],
    },
    maxWidth: PROSE_MEASURE,
  },
  h4: {
    fontFamily: typographyVars['--font-family-heading'],
    fontSize: typeScaleVars['--text-heading-4-size'],
    fontWeight: typeScaleVars['--text-heading-4-weight'],
    lineHeight: typeScaleVars['--text-heading-4-leading'],
    marginBlockStart: {
      default: MINOR_HEADING_BEFORE,
      ':first-child': spacingVars['--spacing-0'],
    },
    marginBlockEnd: {
      default: MINOR_HEADING_AFTER,
      ':last-child': spacingVars['--spacing-0'],
    },
    maxWidth: PROSE_MEASURE,
  },
  h5: {
    fontFamily: typographyVars['--font-family-heading'],
    fontSize: typeScaleVars['--text-heading-5-size'],
    fontWeight: typeScaleVars['--text-heading-5-weight'],
    lineHeight: typeScaleVars['--text-heading-5-leading'],
    marginBlockStart: {
      default: MINOR_HEADING_BEFORE,
      ':first-child': spacingVars['--spacing-0'],
    },
    marginBlockEnd: {
      default: MINOR_HEADING_AFTER,
      ':last-child': spacingVars['--spacing-0'],
    },
    maxWidth: PROSE_MEASURE,
  },
  h6: {
    fontFamily: typographyVars['--font-family-heading'],
    fontSize: typeScaleVars['--text-heading-6-size'],
    fontWeight: typeScaleVars['--text-heading-6-weight'],
    lineHeight: typeScaleVars['--text-heading-6-leading'],
    marginBlockStart: {
      default: MINOR_HEADING_BEFORE,
      ':first-child': spacingVars['--spacing-0'],
    },
    marginBlockEnd: {
      default: MINOR_HEADING_AFTER,
      ':last-child': spacingVars['--spacing-0'],
    },
    maxWidth: PROSE_MEASURE,
  },
  quote: {
    marginBlockStart: {
      default: WIDE_BLOCK_SPACE,
      ':first-child': spacingVars['--spacing-0'],
    },
    marginBlockEnd: {
      default: WIDE_BLOCK_SPACE,
      ':last-child': spacingVars['--spacing-0'],
    },
    marginInline: 0,
    maxWidth: PROSE_MEASURE,
    paddingInlineStart: spacingVars['--spacing-4'],
    borderInlineStartWidth: '2px',
    borderInlineStartStyle: 'solid',
    borderInlineStartColor: colorVars['--color-border-emphasized'],
    color: colorVars['--color-text-secondary'],
  },
  ul: {
    marginBlockStart: {
      default: TEXT_BLOCK_SPACE,
      ':first-child': spacingVars['--spacing-0'],
    },
    marginBlockEnd: {
      default: TEXT_BLOCK_SPACE,
      ':last-child': spacingVars['--spacing-0'],
    },
    maxWidth: PROSE_MEASURE,
    paddingInlineStart: spacingVars['--spacing-6'],
    listStyleType: 'disc',
    listStylePosition: 'outside',
  },
  ol: {
    marginBlockStart: {
      default: TEXT_BLOCK_SPACE,
      ':first-child': spacingVars['--spacing-0'],
    },
    marginBlockEnd: {
      default: TEXT_BLOCK_SPACE,
      ':last-child': spacingVars['--spacing-0'],
    },
    maxWidth: PROSE_MEASURE,
    paddingInlineStart: spacingVars['--spacing-6'],
    listStyleType: 'decimal',
    listStylePosition: 'outside',
  },
  // Nested lists: no extra vertical margin, and cycle marker styles per depth
  // to match native browser list nesting. Lexical indexes ulDepth/olDepth by
  // `depth % array.length`, so three entries give three distinct levels that
  // then repeat — matching the browser default disc → circle → square cycle.
  ulNested: {
    marginBlockStart: 0,
    marginBlockEnd: 0,
  },
  ulDepth2: {
    listStyleType: 'circle',
  },
  ulDepth3: {
    listStyleType: 'square',
  },
  olNested: {
    marginBlockStart: 0,
    marginBlockEnd: 0,
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
  // List items space like core Markdown's compact list rows: 4px padding and
  // a 2px gap between rows. Lexical puts a nested list in an item of its own
  // after its parent item; that wrapper adds no top padding and no marker,
  // and its 8px top margin plus the parent row's padding give the 12px
  // Markdown leaves between an item's text and its nested list.
  listItem: {
    paddingBlockStart: {
      default: LIST_ITEM_SPACE,
      ':has(ul)': spacingVars['--spacing-0'],
      ':has(ol)': spacingVars['--spacing-0'],
    },
    paddingBlockEnd: LIST_ITEM_SPACE,
    marginBlockStart: {
      default: LIST_ROW_FLUSH,
      ':has(ul)': NESTED_LIST_SPACE,
      ':has(ol)': NESTED_LIST_SPACE,
    },
    marginBlockEnd: {
      default: LIST_ROW_GAP,
      ':last-child': spacingVars['--spacing-0'],
    },
    // Ensure the marker is shown (some CSS resets set list-style: none on li).
    listStyleType: {
      default: 'inherit',
      ':has(ul)': 'none',
      ':has(ol)': 'none',
    },
  },
  link: {
    color: colorVars['--color-text-accent'],
    textDecoration: 'underline',
    cursor: 'pointer',
  },
  textBold: {fontWeight: fontWeightVars['--font-weight-semibold']},
  textItalic: {fontStyle: 'italic'},
  textUnderline: {textDecoration: 'underline'},
  textStrikethrough: {textDecoration: 'line-through'},
  textCode: {
    fontFamily: typographyVars['--font-family-code'],
    backgroundColor: colorVars['--color-background-muted'],
    paddingInline: spacingVars['--spacing-1'],
    borderRadius: radiusVars['--radius-inner'],
  },
  // GFM tables, styled like core Markdown's table: semibold secondary header
  // text, a divider under every row but the last, and a wide table that
  // scrolls inside its own wrapper instead of widening the editor.
  tableScrollableWrapper: {
    overflowX: 'auto',
    maxWidth: '100%',
    // One grid track that may shrink to nothing: the wrapper asks its host
    // for no minimum width, so a grid or flex host never grows to fit a wide
    // table and the wrapper scrolls instead, while a shrink-to-fit host still
    // sizes to the table's natural width.
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr)',
    marginBlockStart: {
      default: WIDE_BLOCK_SPACE,
      ':first-child': spacingVars['--spacing-0'],
    },
    marginBlockEnd: {
      default: WIDE_BLOCK_SPACE,
      ':last-child': spacingVars['--spacing-0'],
    },
  },
  table: {
    borderCollapse: 'collapse',
    width: '100%',
  },
  tableRow: {
    borderBottomWidth: '1px',
    borderBottomStyle: 'solid',
    borderBottomColor: {
      default: colorVars['--color-border'],
      ':last-child': 'transparent',
    },
  },
  tableCell: {
    paddingBlock: spacingVars['--spacing-2'],
    paddingInline: spacingVars['--spacing-2'],
    textAlign: 'start',
    verticalAlign: 'middle',
    overflowWrap: 'break-word',
  },
  tableCellHeader: {
    fontWeight: fontWeightVars['--font-weight-semibold'],
    color: colorVars['--color-text-secondary'],
  },
  // Thematic breaks, drawn like core Markdown's rule.
  hr: {
    borderWidth: 0,
    borderTopWidth: borderVars['--border-width'],
    borderTopStyle: 'solid',
    borderTopColor: colorVars['--color-border'],
    marginBlockStart: {
      default: RULE_SPACE,
      ':first-child': spacingVars['--spacing-0'],
    },
    marginBlockEnd: {
      default: RULE_SPACE,
      ':last-child': spacingVars['--spacing-0'],
    },
  },
  // A selected rule (click, or arrow onto it) shows the focus ring, so
  // keyboard users can see what Backspace will delete.
  hrSelected: {
    outlineWidth: focusVars['--focus-outline-width'],
    outlineStyle: focusVars['--focus-outline-style'],
    outlineColor: focusVars['--focus-outline-color'],
    outlineOffset: focusVars['--focus-outline-offset'],
  },
  code: {
    display: 'block',
    fontFamily: typographyVars['--font-family-code'],
    backgroundColor: colorVars['--color-background-muted'],
    padding: spacingVars['--spacing-3'],
    borderRadius: radiusVars['--radius-inner'],
    fontSize: typeScaleVars['--text-supporting-size'],
    marginBlockStart: {
      default: WIDE_BLOCK_SPACE,
      ':first-child': spacingVars['--spacing-0'],
    },
    marginBlockEnd: {
      default: WIDE_BLOCK_SPACE,
      ':last-child': spacingVars['--spacing-0'],
    },
    whiteSpace: 'pre-wrap',
  },
});

/**
 * Builds the Lexical EditorThemeClasses object. Lexical expects plain
 * class-name strings, which `stylex.props(...).className` yields.
 */
export function sharedEditorTheme(): EditorThemeClasses {
  // A class for a block Lexical may mark `dir="auto"`.
  const block = (...styles: Array<stylex.StyleXStyles>): string =>
    stylex.props(...styles, editorTheme.providerDirection).className ?? '';
  const ulClass = block(editorTheme.ul);
  const olClass = block(editorTheme.ol);
  const ulDepth2Class = block(
    editorTheme.ul,
    editorTheme.ulNested,
    editorTheme.ulDepth2,
  );
  const ulDepth3Class = block(
    editorTheme.ul,
    editorTheme.ulNested,
    editorTheme.ulDepth3,
  );
  const olDepth2Class = block(
    editorTheme.ol,
    editorTheme.olNested,
    editorTheme.olDepth2,
  );
  const olDepth3Class = block(
    editorTheme.ol,
    editorTheme.olNested,
    editorTheme.olDepth3,
  );
  return {
    paragraph: block(editorTheme.paragraph),
    heading: {
      h1: block(editorTheme.h1),
      h2: block(editorTheme.h2),
      h3: block(editorTheme.h3),
      h4: block(editorTheme.h4),
      h5: block(editorTheme.h5),
      h6: block(editorTheme.h6),
    },
    quote: block(editorTheme.quote),
    list: {
      ul: ulClass,
      ol: olClass,
      checklist: block(editorTheme.ul, editorTheme.checklist),
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
    code: block(editorTheme.code),
    hr: stylex.props(editorTheme.hr).className,
    hrSelected: stylex.props(editorTheme.hrSelected).className,
    table: block(editorTheme.table),
    // Lexical stamps rows and cells `dir="auto"` too, which would set a cell
    // of English text left-to-right inside a right-to-left document.
    tableRow: block(editorTheme.tableRow),
    tableCell: block(editorTheme.tableCell),
    tableCellHeader: block(editorTheme.tableCellHeader),
    tableScrollableWrapper: block(editorTheme.tableScrollableWrapper),
  };
}
