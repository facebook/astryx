// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file DiffViewer.tsx
 * @input Uses React, StyleX, theme tokens, the shared CodeBlock tokenizer and
 *   syntax-theme slots (incl. the diff row slots), useScrollableArea,
 *   Token, Icon, VisuallyHidden, and the i18n translator
 * @output Exports DiffViewer component, DiffViewerProps, DiffViewerViewMode
 * @position Lab implementation; read-only, syntax-highlighted file diff for
 *   code review surfaces
 *
 * Renders one DiffViewerFile: a file header (path, status, +/- counts, a
 * caller slot, optional disclosure) over a table of hunks in unified or split
 * view. Rows take their tint, gutter, and header paint from the same
 * syntax-theme slots CodeBlock's diff layer uses, so a syntax theme styles
 * both. Callers can render annotation rows under any line (review comments)
 * and make the line numbers actionable.
 *
 * Known limit: rows are plain DOM — there is NO virtualization. Very large
 * files should be windowed or collapsed by the caller.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/lab/src/DiffViewer/DiffViewer.doc.mjs (props table, notes)
 * - /packages/lab/src/DiffViewer/DiffViewer.test.tsx (behavior tests)
 * - /packages/lab/src/DiffViewer/index.ts (exports if types change)
 * - /apps/storybook/stories/DiffViewer.stories.tsx (examples and visual coverage)
 */

'use client';

import {
  Fragment,
  useId,
  useInsertionEffect,
  useMemo,
  useState,
  type CSSProperties,
  type MouseEvent,
  type ReactNode,
  type Ref,
} from 'react';
import * as stylex from '@stylexjs/stylex';

import type {BaseProps} from '@astryxdesign/core';
import {
  ensureHighlightStyles,
  tokenize,
  type SyntaxToken,
  type TokenLine,
} from '@astryxdesign/core/CodeBlock';
import {useScrollableArea} from '@astryxdesign/core/hooks';
import {useTranslator} from '@astryxdesign/core/i18n';
import {Icon} from '@astryxdesign/core/Icon';
import {
  SyntaxTheme,
  type SyntaxThemeDefinition,
} from '@astryxdesign/core/theme/syntax';
import {
  borderVars,
  colorVars,
  durationVars,
  easeVars,
  fontWeightVars,
  radiusVars,
  spacingVars,
  typeScaleVars,
  typographyVars,
} from '@astryxdesign/core/theme/tokens.stylex';
import {
  focusOutlineProps,
  mergeProps,
  rtlStyles,
  themeProps,
} from '@astryxdesign/core/utils';
import {Token, type TokenColor} from '@astryxdesign/core/Token';
import {VisuallyHidden} from '@astryxdesign/core/VisuallyHidden';

import type {
  DiffViewerFile,
  DiffViewerFileStatus,
  DiffViewerLine,
  DiffViewerLineRef,
  DiffViewerSide,
} from './diffTypes';

/** How hunks are laid out: one column, or old and new side by side. */
export type DiffViewerViewMode = 'unified' | 'split';

export interface DiffViewerProps extends BaseProps<HTMLDivElement> {
  /** Ref forwarded to the root element. */
  ref?: Ref<HTMLDivElement>;
  /**
   * The file to render. Build one with `parseUnifiedDiff(patch)` (one per
   * file in the patch) or `createDiffFile({oldValue, newValue})`.
   */
  file: DiffViewerFile;
  /**
   * `unified` shows one column with removed lines above their replacements;
   * `split` shows the old file on the start side and the new file on the end
   * side, pairing each removed line with the added line that replaced it.
   * @default 'unified'
   */
  viewMode?: DiffViewerViewMode;
  /**
   * Syntax-highlighting language. Defaults to one inferred from the file's
   * extension; unknown extensions render as plain text.
   */
  language?: string;
  /**
   * Show the old and new line-number gutters.
   * @default true
   */
  hasLineNumbers?: boolean;
  /**
   * Wrap long lines instead of scrolling them horizontally.
   * @default false
   */
  isWrapped?: boolean;
  /**
   * Make the file header a disclosure that hides and shows the hunks. Needs a
   * file path to name the control.
   * @default true
   */
  isCollapsible?: boolean;
  /** Controlled collapsed state. Pair with `onCollapsedChange`. */
  isCollapsed?: boolean;
  /**
   * Initial collapsed state when uncontrolled.
   * @default false
   */
  defaultIsCollapsed?: boolean;
  /** Called with the next collapsed state when the header is toggled. */
  onCollapsedChange?: (isCollapsed: boolean) => void;
  /**
   * Content at the end of the file header, e.g. a "Viewed" checkbox or a menu
   * of file actions.
   */
  headerEnd?: ReactNode;
  /**
   * Render content in a full-width row under a line, e.g. review comments.
   * Return `null` for lines with nothing to show. Called once per line with
   * its {@link DiffViewerLineRef}; in split view the row sits under the
   * line's own side.
   */
  renderLineAnnotation?: (ref: DiffViewerLineRef) => ReactNode;
  /**
   * Makes each line's number a button (e.g. to start a comment on that line).
   * Receives the line's {@link DiffViewerLineRef}. Only the number on the
   * line's anchor side is a button, so an unchanged line's original number
   * stays plain text. Each button is its own Tab stop, like any other set of
   * independent buttons.
   */
  onLineNumberClick?: (
    ref: DiffViewerLineRef,
    event: MouseEvent<HTMLButtonElement>,
  ) => void;
  /** Maximum height of the hunk area before it scrolls. */
  maxHeight?: number | string;
  /**
   * Per-instance syntax theme, as on CodeBlock. Without it the nearest
   * `SyntaxTheme` or the theme's syntax colors apply.
   */
  syntaxTheme?: SyntaxThemeDefinition;
}

// ---------------------------------------------------------------------------
// Language inference
// ---------------------------------------------------------------------------

const EXTENSION_LANGUAGES: Record<string, string> = {
  ts: 'ts',
  mts: 'ts',
  cts: 'ts',
  tsx: 'tsx',
  js: 'js',
  mjs: 'js',
  cjs: 'js',
  jsx: 'jsx',
  json: 'json',
  html: 'html',
  htm: 'html',
  xml: 'xml',
  svg: 'svg',
  css: 'css',
  scss: 'scss',
  less: 'less',
  py: 'python',
  sh: 'bash',
  bash: 'bash',
  zsh: 'zsh',
  php: 'php',
  hack: 'hack',
  yaml: 'yaml',
  yml: 'yaml',
  md: 'markdown',
  markdown: 'markdown',
};

function inferLanguage(path: string | null): string {
  if (path == null) {
    return 'plaintext';
  }
  const base = path.slice(path.lastIndexOf('/') + 1);
  const dot = base.lastIndexOf('.');
  if (dot <= 0) {
    return 'plaintext';
  }
  return EXTENSION_LANGUAGES[base.slice(dot + 1).toLowerCase()] ?? 'plaintext';
}

// ---------------------------------------------------------------------------
// Row model
// ---------------------------------------------------------------------------

interface LineCell {
  line: DiffViewerLine;
  ref: DiffViewerLineRef;
  tokens: TokenLine;
}

type UnifiedRow =
  | {type: 'hunk'; key: string; header: string}
  | {type: 'line'; key: string; cell: LineCell};

type SplitRow =
  | {type: 'hunk'; key: string; header: string}
  | {type: 'pair'; key: string; old: LineCell | null; new: LineCell | null};

function lineRef(
  line: DiffViewerLine,
  hunkIndex: number,
): DiffViewerLineRef | null {
  if (line.kind === 'removed') {
    return line.oldLineNumber == null
      ? null
      : {side: 'old', lineNumber: line.oldLineNumber, line, hunkIndex};
  }
  return line.newLineNumber == null
    ? null
    : {side: 'new', lineNumber: line.newLineNumber, line, hunkIndex};
}

/**
 * Tokenize each hunk's old and new side as continuous text, so constructs
 * that span lines (block comments, template strings) keep their paint within
 * the hunk, then hand each line the tokens of the side it renders from.
 */
function buildCells(file: DiffViewerFile, language: string): LineCell[][] {
  return file.hunks.map((hunk, hunkIndex) => {
    const oldLines = hunk.lines.filter(line => line.kind !== 'added');
    const newLines = hunk.lines.filter(line => line.kind !== 'removed');
    const highlight = language !== 'plaintext';
    const oldTokens = highlight
      ? tokenize(oldLines.map(line => line.content).join('\n'), language)
      : [];
    const newTokens = highlight
      ? tokenize(newLines.map(line => line.content).join('\n'), language)
      : [];
    let oldIndex = 0;
    let newIndex = 0;
    const cells: LineCell[] = [];
    for (const line of hunk.lines) {
      let tokens: TokenLine;
      if (line.kind === 'removed') {
        tokens = oldTokens[oldIndex++] ?? [];
      } else if (line.kind === 'added') {
        tokens = newTokens[newIndex++] ?? [];
      } else {
        oldIndex++;
        tokens = newTokens[newIndex++] ?? [];
      }
      const ref = lineRef(line, hunkIndex);
      if (ref != null) {
        cells.push({line, ref, tokens});
      }
    }
    return cells;
  });
}

function buildUnifiedRows(
  file: DiffViewerFile,
  cells: LineCell[][],
): UnifiedRow[] {
  const rows: UnifiedRow[] = [];
  file.hunks.forEach((hunk, h) => {
    rows.push({type: 'hunk', key: `h${h}`, header: hunk.header});
    cells[h].forEach((cell, i) => {
      rows.push({type: 'line', key: `h${h}l${i}`, cell});
    });
  });
  return rows;
}

/**
 * Pair each run of removed lines with the run of added lines that follows it,
 * row by row; context lines appear on both sides of one row.
 */
function buildSplitRows(file: DiffViewerFile, cells: LineCell[][]): SplitRow[] {
  const rows: SplitRow[] = [];
  file.hunks.forEach((hunk, h) => {
    rows.push({type: 'hunk', key: `h${h}`, header: hunk.header});
    const hunkCells = cells[h];
    let i = 0;
    while (i < hunkCells.length) {
      const cell = hunkCells[i];
      if (cell.line.kind === 'context') {
        rows.push({type: 'pair', key: `h${h}l${i}`, old: cell, new: cell});
        i++;
        continue;
      }
      const removed: LineCell[] = [];
      const added: LineCell[] = [];
      while (i < hunkCells.length && hunkCells[i].line.kind === 'removed') {
        removed.push(hunkCells[i++]);
      }
      while (i < hunkCells.length && hunkCells[i].line.kind === 'added') {
        added.push(hunkCells[i++]);
      }
      const count = Math.max(removed.length, added.length);
      for (let r = 0; r < count; r++) {
        rows.push({
          type: 'pair',
          key: `h${h}l${i}r${r}`,
          old: removed[r] ?? null,
          new: added[r] ?? null,
        });
      }
    }
  });
  return rows;
}

function buildSpans(text: string, tokens: SyntaxToken[]): ReactNode {
  if (text === '') {
    return '\u200b';
  }
  if (tokens.length === 0) {
    return text;
  }
  const parts: ReactNode[] = [];
  let cursor = 0;
  for (const token of tokens) {
    if (token.start > cursor) {
      parts.push(text.slice(cursor, token.start));
    }
    const end = Math.min(token.end, text.length);
    if (end > token.start) {
      parts.push(
        <span
          key={`${token.start}-${token.type}`}
          className={`astryx-token-${token.type}`}>
          {text.slice(token.start, end)}
        </span>,
      );
    }
    cursor = Math.max(cursor, end);
  }
  if (cursor < text.length) {
    parts.push(text.slice(cursor));
  }
  return parts;
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = stylex.create({
  root: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
    overflow: 'hidden',
    borderRadius: radiusVars['--radius-element'],
    borderWidth: borderVars['--border-width'],
    borderStyle: 'solid',
    borderColor: colorVars['--color-border'],
    backgroundColor: 'var(--color-syntax-background)',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-2'],
    minWidth: 0,
    paddingBlock: spacingVars['--spacing-2'],
    paddingInline: spacingVars['--spacing-3'],
    backgroundColor: colorVars['--color-background-surface'],
    color: colorVars['--color-text-primary'],
    fontSize: typeScaleVars['--text-supporting-size'],
    lineHeight: typeScaleVars['--text-supporting-leading'],
  },
  headerDivider: {
    borderBottomWidth: borderVars['--border-width'],
    borderBottomStyle: 'solid',
    borderBottomColor: colorVars['--color-border'],
  },
  toggle: {
    display: 'flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-1'],
    minWidth: 0,
    padding: 0,
    borderWidth: 0,
    borderStyle: 'none',
    borderRadius: radiusVars['--radius-element'],
    backgroundColor: 'transparent',
    color: 'inherit',
    font: 'inherit',
    textAlign: 'start',
    cursor: {
      default: 'pointer',
      ':is(:disabled,[aria-disabled="true"])': 'default',
    },
  },
  chevron: {
    display: 'inline-flex',
    flexShrink: 0,
    color: colorVars['--color-icon-secondary'],
    transitionProperty: 'transform',
    transitionDuration: {
      default: durationVars['--duration-fast'],
      '@media (prefers-reduced-motion: reduce)': '0s',
    },
    transitionTimingFunction: easeVars['--ease-standard'],
  },
  chevronExpanded: {
    transform: 'rotate(90deg)',
  },
  path: {
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    fontFamily: typographyVars['--font-family-code'],
    fontWeight: fontWeightVars['--font-weight-medium'],
  },
  stats: {
    display: 'inline-flex',
    gap: spacingVars['--spacing-1'],
    flexShrink: 0,
    fontFamily: typographyVars['--font-family-code'],
  },
  statAdded: {
    color: colorVars['--color-text-green'],
  },
  statRemoved: {
    color: colorVars['--color-text-red'],
  },
  headerEnd: {
    display: 'flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-2'],
    marginInlineStart: 'auto',
    flexShrink: 0,
  },
  viewport: {
    minWidth: 0,
  },
  message: {
    paddingBlock: spacingVars['--spacing-3'],
    paddingInline: spacingVars['--spacing-4'],
    color: colorVars['--color-text-secondary'],
    fontSize: typeScaleVars['--text-supporting-size'],
  },
  table: {
    borderCollapse: 'collapse',
    borderSpacing: 0,
    fontFamily: typographyVars['--font-family-code'],
    fontSize: typeScaleVars['--text-code-size'],
    lineHeight: typeScaleVars['--text-code-leading'],
    color: 'var(--color-syntax-variable)',
    tabSize: 2,
  },
  tableScroll: {
    width: 'max-content',
    minWidth: '100%',
  },
  tableWrapped: {
    width: '100%',
    tableLayout: 'fixed',
  },
  gutter: {
    paddingBlock: 0,
    paddingInline: spacingVars['--spacing-2'],
    textAlign: 'end',
    verticalAlign: 'top',
    whiteSpace: 'nowrap',
    userSelect: 'none',
    color: 'var(--color-syntax-punctuation)',
  },
  gutterAdded: {
    color: 'var(--color-syntax-added-marker)',
  },
  gutterRemoved: {
    color: 'var(--color-syntax-removed-marker)',
  },
  gutterButton: {
    display: 'inline',
    padding: 0,
    margin: 0,
    borderWidth: 0,
    borderStyle: 'none',
    borderRadius: radiusVars['--radius-element'],
    backgroundColor: 'transparent',
    color: 'inherit',
    font: 'inherit',
    cursor: {
      default: 'pointer',
      ':is(:disabled,[aria-disabled="true"])': 'default',
    },
    textDecorationLine: {
      default: 'none',
      ':hover:where(:not(:disabled,[aria-disabled="true"]))': 'underline',
    },
  },
  marker: {
    paddingBlock: 0,
    paddingInlineStart: spacingVars['--spacing-1'],
    paddingInlineEnd: spacingVars['--spacing-2'],
    verticalAlign: 'top',
    whiteSpace: 'pre',
    userSelect: 'none',
    color: colorVars['--color-text-secondary'],
  },
  markerAdded: {
    color: 'var(--color-syntax-added-marker)',
  },
  markerRemoved: {
    color: 'var(--color-syntax-removed-marker)',
  },
  // Code, hunk headers, paths, and counts read left-to-right in every page
  // direction; only the table's column order (gutters) mirrors under RTL.
  ltr: {
    direction: 'ltr',
    unicodeBidi: 'isolate',
  },
  code: {
    textAlign: 'start',
    paddingBlock: 0,
    paddingInlineStart: 0,
    paddingInlineEnd: spacingVars['--spacing-4'],
    verticalAlign: 'top',
    whiteSpace: 'pre',
  },
  // Break at spaces first, and inside a token only when a word cannot fit.
  codeWrapped: {
    whiteSpace: 'pre-wrap',
    wordBreak: 'normal',
    overflowWrap: 'anywhere',
  },
  // Split view: the old side's code cell carries the divider between sides.
  codeOldSide: {
    borderInlineEndWidth: borderVars['--border-width'],
    borderInlineEndStyle: 'solid',
    borderInlineEndColor: colorVars['--color-border'],
  },
  added: {
    backgroundColor: 'var(--color-syntax-added)',
  },
  removed: {
    backgroundColor: 'var(--color-syntax-removed)',
  },
  // The empty half of a split row whose other side has no counterpart.
  filler: {
    backgroundColor: 'var(--color-syntax-diff-header)',
  },
  hunk: {
    paddingBlock: spacingVars['--spacing-1'],
    paddingInline: spacingVars['--spacing-3'],
    backgroundColor: 'var(--color-syntax-diff-header)',
    color: 'var(--color-syntax-punctuation)',
    whiteSpace: 'pre',
    borderBlockWidth: borderVars['--border-width'],
    borderBlockStyle: 'solid',
    borderBlockColor: colorVars['--color-border'],
  },
  // Column headers exist for assistive technology only: their text is
  // visually hidden, so the header row takes no height.
  columnHeader: {
    padding: 0,
    borderWidth: 0,
  },
  markerCol: {
    width: `calc(1ch + ${spacingVars['--spacing-1']} + ${spacingVars['--spacing-2']})`,
  },
  annotation: {
    paddingBlock: spacingVars['--spacing-2'],
    paddingInline: spacingVars['--spacing-3'],
    verticalAlign: 'top',
    whiteSpace: 'normal',
    fontFamily: typographyVars['--font-family-body'],
    fontSize: typeScaleVars['--text-body-size'],
    lineHeight: typeScaleVars['--text-body-leading'],
    color: colorVars['--color-text-primary'],
    backgroundColor: colorVars['--color-background-surface'],
    borderBlockWidth: borderVars['--border-width'],
    borderBlockStyle: 'solid',
    borderBlockColor: colorVars['--color-border'],
  },
});

const dynamicStyles = stylex.create({
  gutterWidth: (digits: number) => ({
    width: `calc(${digits}ch + 2 * ${spacingVars['--spacing-2']})`,
  }),
});

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

// File status is a category of change, not an alert, so it is a coloured
// Token rather than a status Badge.
const STATUS_COLORS: Partial<Record<DiffViewerFileStatus, TokenColor>> = {
  added: 'green',
  deleted: 'red',
  renamed: 'blue',
};

/**
 * Read-only, syntax-highlighted diff of one file, in unified or split view,
 * for code review surfaces. Supports review-comment annotation rows under any
 * line and actionable line numbers.
 *
 * @example
 * ```
 * const [file] = parseUnifiedDiff(patch);
 * <DiffViewer file={file} viewMode="split" />
 * ```
 */
export function DiffViewer({
  ref,
  file,
  viewMode = 'unified',
  language: languageProp,
  hasLineNumbers = true,
  isWrapped = false,
  isCollapsible = true,
  isCollapsed: isCollapsedProp,
  defaultIsCollapsed = false,
  onCollapsedChange,
  headerEnd,
  renderLineAnnotation,
  onLineNumberClick,
  maxHeight,
  syntaxTheme,
  xstyle,
  className,
  style,
  ...props
}: DiffViewerProps) {
  const t = useTranslator();
  const bodyId = useId();

  useInsertionEffect(() => {
    ensureHighlightStyles();
  }, []);

  const path = file.newPath ?? file.oldPath;
  const language = languageProp ?? inferLanguage(path);
  const displayPath =
    file.status === 'renamed' && file.oldPath != null && file.newPath != null
      ? t('@astryx.diffViewer.renamedPath', {
          oldPath: file.oldPath,
          newPath: file.newPath,
        })
      : path;

  const [uncontrolledCollapsed, setUncontrolledCollapsed] =
    useState(defaultIsCollapsed);
  const canCollapse = isCollapsible && displayPath != null;
  const isCollapsed = canCollapse && (isCollapsedProp ?? uncontrolledCollapsed);
  const toggleCollapsed = () => {
    const next = !isCollapsed;
    if (isCollapsedProp === undefined) {
      setUncontrolledCollapsed(next);
    }
    onCollapsedChange?.(next);
  };

  const cells = useMemo(() => buildCells(file, language), [file, language]);
  const unifiedRows = useMemo(
    () => (viewMode === 'unified' ? buildUnifiedRows(file, cells) : []),
    [viewMode, file, cells],
  );
  const splitRows = useMemo(
    () => (viewMode === 'split' ? buildSplitRows(file, cells) : []),
    [viewMode, file, cells],
  );

  let addedCount = 0;
  let removedCount = 0;
  let maxLineNumber = 1;
  for (const hunk of file.hunks) {
    for (const line of hunk.lines) {
      if (line.kind === 'added') {
        addedCount++;
      } else if (line.kind === 'removed') {
        removedCount++;
      }
      maxLineNumber = Math.max(
        maxLineNumber,
        line.oldLineNumber ?? 0,
        line.newLineNumber ?? 0,
      );
    }
  }
  const digits = String(maxLineNumber).length;

  const {getViewportProps, getContentProps} = useScrollableArea({
    axis: 'both',
    keyboardAccess: {
      owner: 'viewport',
      role: 'group',
      label: displayPath ?? t('@astryx.diffViewer.label'),
    },
  });
  const scrollStyle: CSSProperties | undefined =
    maxHeight != null
      ? {
          maxHeight:
            typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight,
        }
      : undefined;

  // --- cells ---------------------------------------------------------------

  const renderGutter = (
    cell: LineCell | null,
    side: DiffViewerSide,
    key: string,
  ) => {
    if (!hasLineNumbers) {
      return null;
    }
    const number =
      cell == null
        ? null
        : side === 'old'
          ? cell.line.oldLineNumber
          : cell.line.newLineNumber;
    const kind = cell?.line.kind;
    // Only the gutter of the line's own anchor side is a button: a context
    // line anchors to its new number, so its old number stays plain text
    // rather than a second button whose label names a line it does not report.
    const actionRef =
      number != null && cell != null && cell.ref.side === side
        ? cell.ref
        : null;
    return (
      <td
        key={key}
        {...stylex.props(
          styles.gutter,
          kind === 'added' && [styles.added, styles.gutterAdded],
          kind === 'removed' && [styles.removed, styles.gutterRemoved],
          cell == null && styles.filler,
        )}>
        {actionRef != null && onLineNumberClick != null ? (
          <button
            type="button"
            data-diff-line-button=""
            aria-label={t('@astryx.diffViewer.lineNumberButton', {
              side,
              line: number,
            })}
            onClick={event => onLineNumberClick(actionRef, event)}
            {...focusOutlineProps.focusVisible(styles.gutterButton)}>
            {number}
          </button>
        ) : (
          number
        )}
      </td>
    );
  };

  const renderMarker = (cell: LineCell | null, key: string) => {
    const kind = cell?.line.kind;
    return (
      <td
        key={key}
        {...stylex.props(
          styles.marker,
          kind === 'added' && [styles.added, styles.markerAdded],
          kind === 'removed' && [styles.removed, styles.markerRemoved],
          cell == null && styles.filler,
        )}>
        {kind === 'added' && (
          <>
            <span aria-hidden="true">+</span>
            <VisuallyHidden>{t('@astryx.diffViewer.added')}</VisuallyHidden>
          </>
        )}
        {kind === 'removed' && (
          <>
            <span aria-hidden="true">-</span>
            <VisuallyHidden>{t('@astryx.diffViewer.removed')}</VisuallyHidden>
          </>
        )}
      </td>
    );
  };

  const renderCode = (cell: LineCell | null, key: string, isOld = false) => {
    const kind = cell?.line.kind;
    return (
      <td
        key={key}
        data-diff={kind != null && kind !== 'context' ? kind : undefined}
        {...stylex.props(
          styles.code,
          styles.ltr,
          isWrapped && styles.codeWrapped,
          isOld && styles.codeOldSide,
          kind === 'added' && styles.added,
          kind === 'removed' && styles.removed,
          cell == null && styles.filler,
        )}>
        {cell != null && buildSpans(cell.line.content, cell.tokens)}
      </td>
    );
  };

  const annotationFor = (cell: LineCell | null): ReactNode =>
    cell == null || renderLineAnnotation == null
      ? null
      : renderLineAnnotation(cell.ref);

  // --- tables --------------------------------------------------------------

  const gutterCols = hasLineNumbers ? 2 : 0;
  const unifiedColumns = gutterCols + 2;
  const sideColumns = (hasLineNumbers ? 1 : 0) + 2;

  const gutterCol = (key: string) => (
    <col key={key} {...stylex.props(dynamicStyles.gutterWidth(digits))} />
  );
  const markerCol = (key: string) => (
    <col key={key} {...stylex.props(styles.markerCol)} />
  );
  // Name every column so a screen reader moving across a row hears which
  // number is which and which side of a split row it is on.
  const columnHeader = (key: string, label: string) => (
    <th key={key} scope="col" {...stylex.props(styles.columnHeader)}>
      <VisuallyHidden>{label}</VisuallyHidden>
    </th>
  );

  let table: ReactNode;
  if (viewMode === 'split') {
    table = (
      <table
        {...stylex.props(
          styles.table,
          isWrapped ? styles.tableWrapped : styles.tableScroll,
        )}>
        <colgroup>
          {hasLineNumbers && gutterCol('og')}
          {markerCol('om')}
          <col />
          {hasLineNumbers && gutterCol('ng')}
          {markerCol('nm')}
          <col />
        </colgroup>
        <thead>
          <tr>
            {hasLineNumbers &&
              columnHeader('og', t('@astryx.diffViewer.columnOldLine'))}
            {columnHeader('om', t('@astryx.diffViewer.columnChange'))}
            {columnHeader('oc', t('@astryx.diffViewer.columnOldCode'))}
            {hasLineNumbers &&
              columnHeader('ng', t('@astryx.diffViewer.columnNewLine'))}
            {columnHeader('nm', t('@astryx.diffViewer.columnChange'))}
            {columnHeader('nc', t('@astryx.diffViewer.columnNewCode'))}
          </tr>
        </thead>
        <tbody>
          {splitRows.map(row => {
            if (row.type === 'hunk') {
              return (
                <tr key={row.key}>
                  <td colSpan={sideColumns * 2} {...stylex.props(styles.hunk)}>
                    <span {...stylex.props(styles.ltr)}>{row.header}</span>
                  </td>
                </tr>
              );
            }
            const isContext = row.old?.line.kind === 'context';
            const oldNote = isContext ? null : annotationFor(row.old);
            const newNote = annotationFor(row.new);
            const hasNote = oldNote != null || newNote != null;
            return (
              <Fragment key={row.key}>
                <tr>
                  {renderGutter(row.old, 'old', 'og')}
                  {renderMarker(row.old, 'om')}
                  {renderCode(row.old, 'oc', true)}
                  {renderGutter(row.new, 'new', 'ng')}
                  {renderMarker(row.new, 'nm')}
                  {renderCode(row.new, 'nc')}
                </tr>
                {hasNote && (
                  <tr>
                    <td
                      colSpan={sideColumns}
                      {...stylex.props(styles.annotation, styles.codeOldSide)}>
                      {oldNote}
                    </td>
                    <td
                      colSpan={sideColumns}
                      {...stylex.props(styles.annotation)}>
                      {newNote}
                    </td>
                  </tr>
                )}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    );
  } else {
    table = (
      <table
        {...stylex.props(
          styles.table,
          isWrapped ? styles.tableWrapped : styles.tableScroll,
        )}>
        <colgroup>
          {hasLineNumbers && gutterCol('og')}
          {hasLineNumbers && gutterCol('ng')}
          {markerCol('m')}
          <col />
        </colgroup>
        <thead>
          <tr>
            {hasLineNumbers &&
              columnHeader('og', t('@astryx.diffViewer.columnOldLine'))}
            {hasLineNumbers &&
              columnHeader('ng', t('@astryx.diffViewer.columnNewLine'))}
            {columnHeader('m', t('@astryx.diffViewer.columnChange'))}
            {columnHeader('c', t('@astryx.diffViewer.columnCode'))}
          </tr>
        </thead>
        <tbody>
          {unifiedRows.map(row => {
            if (row.type === 'hunk') {
              return (
                <tr key={row.key}>
                  <td colSpan={unifiedColumns} {...stylex.props(styles.hunk)}>
                    <span {...stylex.props(styles.ltr)}>{row.header}</span>
                  </td>
                </tr>
              );
            }
            const note = annotationFor(row.cell);
            return (
              <Fragment key={row.key}>
                <tr>
                  {renderGutter(row.cell, 'old', 'og')}
                  {renderGutter(row.cell, 'new', 'ng')}
                  {renderMarker(row.cell, 'm')}
                  {renderCode(row.cell, 'c')}
                </tr>
                {note != null && (
                  <tr>
                    <td
                      colSpan={unifiedColumns}
                      {...stylex.props(styles.annotation)}>
                      {note}
                    </td>
                  </tr>
                )}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    );
  }

  let body: ReactNode;
  if (file.isBinary) {
    body = (
      <div {...stylex.props(styles.message)}>
        {t('@astryx.diffViewer.binary')}
      </div>
    );
  } else if (file.hunks.length === 0) {
    body = (
      <div {...stylex.props(styles.message)}>
        {t('@astryx.diffViewer.noChanges')}
      </div>
    );
  } else {
    body = (
      <div
        {...getViewportProps<HTMLDivElement>({
          ...stylex.props(styles.viewport),
          style: scrollStyle,
        })}>
        <div {...getContentProps<HTMLDivElement>({})}>{table}</div>
      </div>
    );
  }

  // --- header --------------------------------------------------------------

  const statusColor = STATUS_COLORS[file.status];
  const statusLabel =
    file.status === 'added'
      ? t('@astryx.diffViewer.statusAdded')
      : file.status === 'deleted'
        ? t('@astryx.diffViewer.statusDeleted')
        : file.status === 'renamed'
          ? t('@astryx.diffViewer.statusRenamed')
          : null;

  const pathEl = (
    <span
      {...mergeProps(
        themeProps('diff-viewer-path'),
        stylex.props(styles.path, styles.ltr),
      )}>
      {displayPath}
    </span>
  );

  const header =
    displayPath != null || headerEnd != null ? (
      <div
        {...mergeProps(
          themeProps('diff-viewer-header'),
          stylex.props(styles.header, !isCollapsed && styles.headerDivider),
        )}>
        {canCollapse ? (
          <button
            type="button"
            aria-expanded={!isCollapsed}
            aria-controls={bodyId}
            onClick={toggleCollapsed}
            {...focusOutlineProps.focusVisible(styles.toggle)}>
            <span
              {...stylex.props(
                styles.chevron,
                !isCollapsed && styles.chevronExpanded,
              )}>
              <span {...stylex.props(isCollapsed && rtlStyles.mirror)}>
                <Icon icon="chevronRight" size="xsm" color="inherit" />
              </span>
            </span>
            {pathEl}
          </button>
        ) : (
          pathEl
        )}
        {statusColor != null && statusLabel != null && (
          <Token size="sm" color={statusColor} label={statusLabel} />
        )}
        {(addedCount > 0 || removedCount > 0) && (
          <span {...stylex.props(styles.stats, styles.ltr)}>
            <span aria-hidden="true" {...stylex.props(styles.statAdded)}>
              {t('@astryx.diffViewer.addedCount', {count: addedCount})}
            </span>
            <span aria-hidden="true" {...stylex.props(styles.statRemoved)}>
              {t('@astryx.diffViewer.removedCount', {count: removedCount})}
            </span>
            <VisuallyHidden>
              {t('@astryx.diffViewer.stats', {
                added: addedCount,
                removed: removedCount,
              })}
            </VisuallyHidden>
          </span>
        )}
        {headerEnd != null && (
          <div {...stylex.props(styles.headerEnd)}>{headerEnd}</div>
        )}
      </div>
    ) : null;

  const root = (
    <div
      ref={ref}
      {...mergeProps(
        themeProps('diff-viewer', {viewMode}),
        stylex.props(styles.root, xstyle),
        className,
        style,
      )}
      {...props}>
      {header}
      <div id={bodyId} hidden={isCollapsed}>
        {isCollapsed ? null : body}
      </div>
    </div>
  );

  return syntaxTheme ? (
    <SyntaxTheme theme={syntaxTheme}>{root}</SyntaxTheme>
  ) : (
    root
  );
}

DiffViewer.displayName = 'DiffViewer';
