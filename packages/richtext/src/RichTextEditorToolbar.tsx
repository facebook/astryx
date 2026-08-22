// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file RichTextEditorToolbar.tsx
 * @input Uses React, @lexical/react (composer context), @lexical/rich-text,
 *   @lexical/selection, @lexical/list, @lexical/utils, and the lexical core
 *   command constants, plus Astryx Toolbar / IconButton / Selector /
 *   ToggleButton / Divider / Dialog / TextInput / Button / Layout primitives,
 *   BaseProps, useTranslator (i18n), useThemeName (theme-scoped icons),
 *   isRenderable/rtlStyles (utils), and typeScale/fontWeight tokens.
 * @output Exports RichTextEditorToolbar (a compact formatting toolbar with a
 *   horizontally scrollable action row) and RichTextEditorToolbarProps.
 * @position Experimental (richtext). Drop into RichTextEditor's `toolbar` slot to
 *   add a flush top formatting toolbar. Themed via Astryx Toolbar, Selector,
 *   IconButton, and ToggleButton, so it inherits the active theme.
 *
 * SYNC: When modified, update:
 * - /packages/richtext/src/index.ts (exports)
 * - /packages/richtext/src/RichTextEditor.doc.mjs (usage notes)
 * - /packages/richtext/src/RichTextEditorToolbar.test.tsx (toolbar tests)
 * - /packages/richtext/src/RichTextEditor.test.tsx (integration tests)
 * - /apps/storybook/stories/RichTextEditor.stories.tsx (WithToolbar story)
 *
 * NOTE: Experimental `@astryxdesign/richtext` component (canary). `lexical` and
 * `@lexical/*` are OPTIONAL peer dependencies — install them to use this.
 * Behavior mirrors the Lexical playground toolbar (selection sync + format
 * commands); the UI is built from Astryx primitives so it matches the theme.
 *
 * ICONS: Each control resolves its glyph through the core icon registry under a
 * stable `richtext:*` key (see {@link RICHTEXT_ICON_KEYS}), falling back to the
 * bundled inline SVGs below. A theme can restyle any glyph by declaring its
 * own icon for that key — no need to fork the toolbar:
 *   defineTheme({icons: {'richtext:bold': <MyBoldIcon />}});
 * (The global `registerIcons()` escape hatch also works but applies to every
 * theme and warns in dev.)
 */

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
  type Ref,
} from 'react';
import * as stylex from '@stylexjs/stylex';
import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';
import {$setBlocksType} from '@lexical/selection';
import {
  $createHeadingNode,
  $createQuoteNode,
  $isHeadingNode,
  $isQuoteNode,
} from '@lexical/rich-text';
import {
  $isListNode,
  ListNode,
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
} from '@lexical/list';
import {$getNearestNodeOfType, mergeRegister} from '@lexical/utils';
import {TOGGLE_LINK_COMMAND, $isLinkNode, $createLinkNode} from '@lexical/link';
import {Toolbar} from '@astryxdesign/core/Toolbar';
import {IconButton} from '@astryxdesign/core/IconButton';
import {Selector, type SelectorOptionType} from '@astryxdesign/core/Selector';
import {ToggleButton} from '@astryxdesign/core/ToggleButton';
import {Divider} from '@astryxdesign/core/Divider';
import {Dialog, DialogHeader} from '@astryxdesign/core/Dialog';
import {TextInput} from '@astryxdesign/core/TextInput';
import {Button} from '@astryxdesign/core/Button';
import {Stack} from '@astryxdesign/core/Stack';
import {
  HStack,
  Layout,
  LayoutContent,
  LayoutFooter,
} from '@astryxdesign/core/Layout';
import {getExtendedIcon} from '@astryxdesign/core/Icon';
import type {BaseProps} from '@astryxdesign/core';
import {useTranslator} from '@astryxdesign/core/i18n';
import {useThemeName} from '@astryxdesign/core/theme';
import {isRenderable, rtlStyles} from '@astryxdesign/core/utils';
import {
  typeScaleVars,
  fontWeightVars,
} from '@astryxdesign/core/theme/tokens.stylex';
import {
  FORMAT_TEXT_COMMAND,
  UNDO_COMMAND,
  REDO_COMMAND,
  CAN_UNDO_COMMAND,
  CAN_REDO_COMMAND,
  SELECTION_CHANGE_COMMAND,
  KEY_DOWN_COMMAND,
  COMMAND_PRIORITY_CRITICAL,
  COMMAND_PRIORITY_NORMAL,
  IS_APPLE,
  isExactShortcutMatch,
  $getSelection,
  $isRangeSelection,
  $setSelection,
  $createParagraphNode,
  $createTextNode,
  type RangeSelection,
} from 'lexical';
import {sanitizeUrl} from './linkUtils';

const DEFAULT_HEADING_LEVELS: ReadonlyArray<'h1' | 'h2' | 'h3'> = [
  'h1',
  'h2',
  'h3',
];

/** Block types exposed by the toolbar's format selector. */
type BlockType =
  'paragraph' | 'h1' | 'h2' | 'h3' | 'quote' | 'bullet' | 'number';

const HEADING_LABEL_KEYS: Record<'h1' | 'h2' | 'h3', string> = {
  h1: '@astryx.richTextEditor.heading1',
  h2: '@astryx.richTextEditor.heading2',
  h3: '@astryx.richTextEditor.heading3',
};

/**
 * The platform-primary modifier for shortcuts: Cmd on Apple, Ctrl elsewhere.
 * Mirrors the Lexical playground's `CONTROL_OR_META`
 * (packages/lexical-playground/src/plugins/ShortcutsPlugin/shortcuts.ts).
 */
const CONTROL_OR_META = {ctrlKey: !IS_APPLE, metaKey: IS_APPLE};

interface LinkContext {
  selectedText: string;
  url: string;
  isLink: boolean;
}

// A vertical Divider's default 100% height needs a definite parent height.
// Toolbar slots are sized by their controls instead, so let flexbox stretch
// these group separators across the slot's resolved height.
const toolbarDividerStyles = stylex.create({
  vertical: {
    alignSelf: 'stretch',
    height: 'auto',
  },
});

// The toolbar's controls sit at 28px (--size-element-sm) — above the
// WCAG 2.5.8 AA 24px minimum for fine pointers, but well under the ~44px
// platform touch target. Expand them on coarse pointers only, mirroring the
// Slider-thumb precedent in core.
const toolbarTouchStyles = stylex.create({
  control: {
    minBlockSize: {
      default: null,
      '@media (pointer: coarse)': '44px',
    },
    minInlineSize: {
      default: null,
      '@media (pointer: coarse)': '44px',
    },
  },
});

const toolbarScrollStyles = stylex.create({
  actions: {
    flex: '1 1 0%',
    width: 0,
    maxWidth: '100%',
    minWidth: 0,
    overflowX: 'auto',
    overflowY: 'hidden',
    overscrollBehaviorX: 'contain',
    scrollbarWidth: 'thin',
  },
});

/**
 * Whether `event` is the insert-link shortcut (Cmd/Ctrl+K). Uses Lexical's
 * `isExactShortcutMatch`, which — unlike a loose `metaKey || ctrlKey` check —
 * requires exactly the primary modifier and rejects the combo when other
 * modifiers (Shift/Alt) are also held. Matches the playground's `isInsertLink`.
 */
function isInsertLink(event: KeyboardEvent): boolean {
  return isExactShortcutMatch(event, 'k', CONTROL_OR_META);
}

/**
 * Stable icon-registry keys for the toolbar's controls. Themes can override any
 * of these via `defineTheme({icons: {'richtext:bold': <MyIcon />}})` (or the
 * global `registerIcons()` escape hatch). Keys are namespaced (`richtext:*`)
 * to avoid collisions with the core semantic icon set.
 */
export const RICHTEXT_ICON_KEYS = {
  bold: 'richtext:bold',
  italic: 'richtext:italic',
  underline: 'richtext:underline',
  strikethrough: 'richtext:strikethrough',
  code: 'richtext:code',
  link: 'richtext:link',
  paragraph: 'richtext:paragraph',
  h1: 'richtext:h1',
  h2: 'richtext:h2',
  h3: 'richtext:h3',
  quote: 'richtext:quote',
  bullet: 'richtext:bullet',
  number: 'richtext:number',
  undo: 'richtext:undo',
  redo: 'richtext:redo',
} as const;

const INLINE_FORMAT_ACTIONS = [
  {format: 'bold', labelKey: '@astryx.richTextEditor.bold', icon: 'bold'},
  {
    format: 'italic',
    labelKey: '@astryx.richTextEditor.italic',
    icon: 'italic',
  },
  {
    format: 'underline',
    labelKey: '@astryx.richTextEditor.underline',
    icon: 'underline',
  },
  {
    format: 'strikethrough',
    labelKey: '@astryx.richTextEditor.strikethrough',
    icon: 'strikethrough',
  },
  {
    format: 'code',
    labelKey: '@astryx.richTextEditor.inlineCode',
    icon: 'code',
  },
] as const;

type InlineFormat = (typeof INLINE_FORMAT_ACTIONS)[number]['format'];

/**
 * Bundled 16px inline default icons — no external icon dependency. These are
 * the fallbacks used when a theme hasn't registered an override for the
 * corresponding {@link RICHTEXT_ICON_KEYS} entry.
 */
const defaultToolbarIcons: Record<string, ReactNode> = {
  bold: (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true">
      <path
        d="M6 4h7a4 4 0 0 1 0 8H6zM6 12h8a4 4 0 0 1 0 8H6z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  ),
  italic: (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true">
      <path
        d="M10 4h6M8 20h6M14 4l-4 16"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  ),
  underline: (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true">
      <path
        d="M6 4v6a6 6 0 0 0 12 0V4M5 21h14"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  ),
  strikethrough: (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true">
      <path
        d="M4 12h16M8 6a4 3 0 0 1 8 0M8 16a4 3 0 0 0 8 0"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  ),
  code: (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true">
      <path
        d="M9 8l-4 4 4 4M15 8l4 4-4 4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  link: (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true">
      <path
        d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1.5 1.5M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1.5-1.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  paragraph: <TextGlyph label="¶" />,
  h1: <TextGlyph label="H1" />,
  h2: <TextGlyph label="H2" />,
  h3: <TextGlyph label="H3" />,
  quote: (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true">
      <path
        d="M6 17h3l2-4V7H5v6h3zM15 17h3l2-4V7h-6v6h3z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  ),
  bullet: (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true">
      <path
        d="M9 6h11M9 12h11M9 18h11"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="4.5" cy="6" r="1.5" fill="currentColor" />
      <circle cx="4.5" cy="12" r="1.5" fill="currentColor" />
      <circle cx="4.5" cy="18" r="1.5" fill="currentColor" />
    </svg>
  ),
  number: (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true">
      <path
        d="M10 6h10M10 12h10M10 18h10"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <text x="2" y="8" fontSize="6" fill="currentColor">
        1
      </text>
      <text x="2" y="14" fontSize="6" fill="currentColor">
        2
      </text>
      <text x="2" y="20" fontSize="6" fill="currentColor">
        3
      </text>
    </svg>
  ),
  undo: (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true">
      <path
        d="M9 7L4 12l5 5M4 12h11a5 5 0 0 1 0 10"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  redo: (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true">
      <path
        d="M15 7l5 5-5 5M20 12H9a5 5 0 0 0 0 10"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
};

const textGlyphStyles = stylex.create({
  glyph: {
    fontSize: typeScaleVars['--text-supporting-size'],
    fontWeight: fontWeightVars['--font-weight-bold'],
    fontVariantNumeric: 'tabular-nums',
  },
});

/** Renders a short text label as a toolbar glyph (for heading buttons). */
function TextGlyph({label}: {label: string}) {
  return (
    <span aria-hidden="true" {...stylex.props(textGlyphStyles.glyph)}>
      {label}
    </span>
  );
}

// Directional glyphs (undo/redo arrows) flip under RTL. Transforms don't
// apply to plain inline elements, so the mirroring wrapper is inline-flex.
const mirrorGlyphStyles = stylex.create({
  root: {
    display: 'inline-flex',
  },
});

export interface RichTextEditorToolbarProps extends BaseProps {
  /**
   * Accessible label for the toolbar element. Defaults to the localized
   * "Text formatting".
   */
  label?: string;
  /**
   * Which heading levels to expose in the block-format selector, in order.
   * @default ['h1', 'h2', 'h3']
   */
  headingLevels?: ReadonlyArray<'h1' | 'h2' | 'h3'>;
  /**
   * Toolbar size. Cascades to formatting controls and coordinates the
   * Toolbar's internal padding.
   * @default 'sm'
   */
  size?: 'sm' | 'md' | 'lg';
  /**
   * Whether to show the insert/edit-link button. By default, pressing it opens
   * an Astryx Dialog. The form can add, update, or remove a link without
   * losing the editor selection.
   *
   * Requires `LinkNode` to be registered (it is, by default) — no extra setup.
   * The entered URL is sanitized (see `sanitizeUrl`) so only
   * http/https/mailto/tel links are written.
   * @default true
   */
  hasLink?: boolean;
  /**
   * Called to obtain a URL when the link button is pressed on a non-link
   * selection. Return the URL string to link, or `null`/`''` to cancel.
   * Receives the currently selected text as a hint. When omitted, the built-in
   * Astryx Dialog is used. This synchronous override is retained
   * for consumers that already provide their own URL UI.
   */
  promptForUrl?: (selectedText: string) => string | null | undefined;
  /**
   * Whether links created via the toolbar open in a new tab. When `true`
   * (default), the created link carries `target="_blank"` and
   * `rel="noopener noreferrer"` — written into the link node's data (so it
   * serializes and round-trips), not patched onto the DOM. Set `false` to
   * create same-tab links.
   * @default true
   */
  hasNewTabLinks?: boolean;
  /**
   * Extra items rendered at the end of the toolbar (after a divider). Use this
   * to compose product-specific controls (e.g. mentions, AI) alongside the
   * default formatting buttons.
   */
  endContent?: ReactNode;
  /** Ref to the toolbar's root element. */
  ref?: Ref<HTMLDivElement>;
}

/**
 * A composable formatting toolbar for {@link RichTextEditor}, built from Astryx
 * `Toolbar` / `ToggleButton` primitives so it matches the active theme. Reads
 * the current selection to keep the active states in sync and dispatches the
 * standard Lexical formatting commands.
 *
 * Render it inside the editor's `toolbar` slot — it uses
 * `useLexicalComposerContext()` to reach the editor, so it must live within the
 * `LexicalComposer` the editor sets up.
 *
 * @example
 * ```
 * import {RichTextEditor, RichTextEditorToolbar} from '@astryxdesign/richtext';
 *
 * <RichTextEditor
 *   label="Notes"
 *   toolbar={<RichTextEditorToolbar />}
 * />
 * ```
 */
export function RichTextEditorToolbar({
  label,
  headingLevels = DEFAULT_HEADING_LEVELS,
  size = 'sm',
  hasLink = true,
  promptForUrl,
  hasNewTabLinks = true,
  endContent,
  ...rest
}: RichTextEditorToolbarProps) {
  const t = useTranslator();
  const toolbarLabel = label ?? t('@astryx.richTextEditor.toolbarLabel');
  const themeName = useThemeName();
  // Resolve a toolbar glyph: prefer an icon the active theme (or the global
  // registry) provides for the stable `richtext:*` key, otherwise fall back
  // to the bundled inline default. Theme-scoped overrides only apply when the
  // active theme name is passed as the source.
  const resolveIcon = (name: keyof typeof RICHTEXT_ICON_KEYS): ReactNode =>
    getExtendedIcon(
      RICHTEXT_ICON_KEYS[name],
      defaultToolbarIcons[name],
      themeName,
    );
  const [editor] = useLexicalComposerContext();
  const [activeFormats, setActiveFormats] = useState<Set<string>>(new Set());
  const [blockType, setBlockType] = useState<BlockType>('paragraph');
  const [isLink, setIsLink] = useState(false);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [isEditable, setIsEditable] = useState(() => editor.isEditable());
  const savedSelectionRef = useRef<RangeSelection | null>(null);
  const lastLinkContextRef = useRef<LinkContext>({
    selectedText: '',
    url: '',
    isLink: false,
  });
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [isEditingLink, setIsEditingLink] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  // A flag, not a message: the error text is translated at render time so
  // it follows locale changes while the dialog stays open.
  const [hasLinkError, setHasLinkError] = useState(false);

  const $syncToolbar = useCallback(() => {
    const selection = $getSelection();
    if (!$isRangeSelection(selection)) {
      return;
    }
    const formats = new Set<string>();
    for (const fmt of [
      'bold',
      'italic',
      'underline',
      'strikethrough',
      'code',
    ] as const) {
      if (selection.hasFormat(fmt)) {
        formats.add(fmt);
      }
    }
    setActiveFormats(formats);

    // Link active state — a link is "active" when the caret/selection anchor
    // sits inside a LinkNode (or its immediate parent is one). Mirrors the EPS
    // eps-lexical toolbar (`$isLinkNode(parent) || $isLinkNode(node)`), which is
    // the implementation astryx aims to be swappable with.
    const node = selection.anchor.getNode();
    const parent = node.getParent();
    const linkNode = $isLinkNode(node)
      ? node
      : $isLinkNode(parent)
        ? parent
        : null;
    const selectionIsLink = linkNode != null;
    setIsLink(selectionIsLink);
    savedSelectionRef.current = selection.clone();
    lastLinkContextRef.current = {
      selectedText: selection.getTextContent(),
      url: linkNode?.getURL() ?? '',
      isLink: selectionIsLink,
    };
    const anchorNode = selection.anchor.getNode();
    const element =
      anchorNode.getKey() === 'root'
        ? anchorNode
        : anchorNode.getTopLevelElementOrThrow();
    if ($isListNode(element)) {
      const parentList = $getNearestNodeOfType<ListNode>(anchorNode, ListNode);
      const type = parentList
        ? parentList.getListType()
        : element.getListType();
      setBlockType(type === 'number' ? 'number' : 'bullet');
    } else if ($isHeadingNode(element)) {
      setBlockType(element.getTag() as BlockType);
    } else if ($isQuoteNode(element)) {
      setBlockType('quote');
    } else {
      setBlockType('paragraph');
    }
  }, []);

  const readLinkContext = useCallback((): LinkContext => {
    let context = lastLinkContextRef.current;
    editor.getEditorState().read(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) {
        return;
      }
      const node = selection.anchor.getNode();
      const parent = node.getParent();
      const linkNode = $isLinkNode(node)
        ? node
        : $isLinkNode(parent)
          ? parent
          : null;
      savedSelectionRef.current = selection.clone();
      context = {
        selectedText: selection.getTextContent(),
        url: linkNode?.getURL() ?? '',
        isLink: linkNode != null,
      };
      lastLinkContextRef.current = context;
    });
    return context;
  }, [editor]);

  const restoreLinkSelection = useCallback(() => {
    const savedSelection = savedSelectionRef.current;
    if (!savedSelection) {
      return;
    }
    editor.update(() => {
      $setSelection(savedSelection.clone());
    });
  }, [editor]);

  const applyLinkValue = useCallback(
    (entered: string): boolean => {
      const trimmed = entered.trim();
      const url = sanitizeUrl(trimmed);
      if (url === 'about:blank') {
        return false;
      }

      restoreLinkSelection();
      const linkAttributes = hasNewTabLinks
        ? {target: '_blank', rel: 'noopener noreferrer'}
        : {};
      const handled = editor.dispatchCommand(TOGGLE_LINK_COMMAND, {
        url,
        ...linkAttributes,
      });
      if (!handled) {
        editor.update(() => {
          const selection = $getSelection();
          if ($isRangeSelection(selection) && selection.isCollapsed()) {
            const linkNode = $createLinkNode(url, linkAttributes);
            linkNode.append($createTextNode(trimmed));
            selection.insertNodes([linkNode]);
          }
        });
      }
      return true;
    },
    [editor, hasNewTabLinks, restoreLinkSelection],
  );

  const toggleLink = useCallback(() => {
    if (!editor.isEditable()) {
      return;
    }

    const context = readLinkContext();
    if (promptForUrl) {
      // Preserve the existing synchronous extension point for consumers that
      // already provide their own URL UI.
      if (context.isLink) {
        restoreLinkSelection();
        editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
        return;
      }
      const entered = promptForUrl(context.selectedText);
      if (entered != null && entered.trim() !== '') {
        applyLinkValue(entered);
      }
      return;
    }

    setLinkUrl(
      context.url ||
        (context.selectedText.startsWith('http')
          ? context.selectedText
          : 'https://'),
    );
    setIsEditingLink(context.isLink);
    setHasLinkError(false);
    setIsLinkDialogOpen(true);
  }, [
    applyLinkValue,
    editor,
    promptForUrl,
    readLinkContext,
    restoreLinkSelection,
  ]);

  const handleLinkDialogOpenChange = useCallback((open: boolean) => {
    setIsLinkDialogOpen(open);
    setHasLinkError(false);
  }, []);

  const closeLinkDialogToEditor = useCallback(() => {
    setIsLinkDialogOpen(false);
    setHasLinkError(false);
    requestAnimationFrame(() => editor.focus());
  }, [editor]);

  const handleLinkSubmit = useCallback(
    (event: FormEvent<HTMLElement>) => {
      event.preventDefault();
      if (!applyLinkValue(linkUrl)) {
        setHasLinkError(true);
        return;
      }
      closeLinkDialogToEditor();
    },
    [applyLinkValue, closeLinkDialogToEditor, linkUrl],
  );

  const removeLink = useCallback(() => {
    restoreLinkSelection();
    editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
    closeLinkDialogToEditor();
  }, [closeLinkDialogToEditor, editor, restoreLinkSelection]);

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({editorState}) => {
        editorState.read($syncToolbar);
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          $syncToolbar();
          return false;
        },
        COMMAND_PRIORITY_CRITICAL,
      ),
      editor.registerCommand(
        CAN_UNDO_COMMAND,
        payload => {
          setCanUndo(payload);
          return false;
        },
        COMMAND_PRIORITY_CRITICAL,
      ),
      editor.registerCommand(
        CAN_REDO_COMMAND,
        payload => {
          setCanRedo(payload);
          return false;
        },
        COMMAND_PRIORITY_CRITICAL,
      ),
      editor.registerEditableListener(editable => {
        setIsEditable(editable);
      }),
      // Cmd/Ctrl+K opens link insertion. Detection mirrors the Lexical
      // playground's ShortcutsPlugin (isInsertLink → isExactShortcutMatch with
      // CONTROL_OR_META), so it fires only on the exact primary-modifier combo
      // and ignores Cmd+Shift+K etc. Only registered when the link button is
      // enabled. Returns true to consume the event so the browser's own
      // shortcut doesn't also fire.
      hasLink
        ? editor.registerCommand(
            KEY_DOWN_COMMAND,
            (event: KeyboardEvent) => {
              if (isInsertLink(event)) {
                event.preventDefault();
                toggleLink();
                return true;
              }
              return false;
            },
            COMMAND_PRIORITY_NORMAL,
          )
        : () => {},
    );
  }, [editor, $syncToolbar, hasLink, toggleLink]);

  const toggleInlineFormat = (format: InlineFormat) => {
    // FORMAT_TEXT_COMMAND payload is a TextFormatType; the values we pass are
    // all valid members.
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, format);
  };

  const setBlock = (next: BlockType) => {
    // Selector choices are idempotent: choosing the active block format keeps
    // it active instead of toggling it back to paragraph.
    if (!isEditable || blockType === next) {
      return;
    }
    if (next === 'bullet') {
      editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
      return;
    }
    if (next === 'number') {
      editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
      return;
    }
    editor.update(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) {
        return;
      }
      $setBlocksType(selection, () => {
        if (next === 'quote') {
          return $createQuoteNode();
        }
        if (next === 'h1' || next === 'h2' || next === 'h3') {
          return $createHeadingNode(next);
        }
        return $createParagraphNode();
      });
    });
  };

  const blockOptions: SelectorOptionType[] = [
    {
      value: 'paragraph',
      label: t('@astryx.richTextEditor.paragraph'),
      icon: resolveIcon('paragraph'),
    },
    ...headingLevels.map(level => ({
      value: level,
      label: t(HEADING_LABEL_KEYS[level]),
      icon: resolveIcon(level),
    })),
    {
      value: 'bullet',
      label: t('@astryx.richTextEditor.bulletedList'),
      icon: resolveIcon('bullet'),
    },
    {
      value: 'number',
      label: t('@astryx.richTextEditor.numberedList'),
      icon: resolveIcon('number'),
    },
    {
      value: 'quote',
      label: t('@astryx.richTextEditor.blockQuote'),
      icon: resolveIcon('quote'),
    },
  ];

  // The Selector reports a selection only for a value it has an option for.
  // Painting the glyph for anything else makes the trigger contradict itself
  // — an "H1" mark beside a "Select…" label when the caret sits in a heading
  // level this toolbar was not configured to offer, or in an h4-h6 the block
  // list cannot express at all.
  const hasBlockOption = blockOptions.some(option =>
    typeof option === 'string'
      ? option === blockType
      : 'value' in option && option.value === blockType,
  );

  return (
    <>
      <Toolbar
        {...rest}
        label={toolbarLabel}
        size={size}
        startContent={
          <HStack
            gap={1}
            role="group"
            aria-label={t('@astryx.richTextEditor.formattingActions')}
            xstyle={toolbarScrollStyles.actions}>
            <IconButton
              label={t('@astryx.richTextEditor.undo')}
              icon={
                <span
                  {...stylex.props(mirrorGlyphStyles.root, rtlStyles.mirror)}>
                  {resolveIcon('undo')}
                </span>
              }
              variant="ghost"
              tooltip={t('@astryx.richTextEditor.undo')}
              isDisabled={!isEditable || !canUndo}
              xstyle={toolbarTouchStyles.control}
              onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}
            />
            <IconButton
              label={t('@astryx.richTextEditor.redo')}
              icon={
                <span
                  {...stylex.props(mirrorGlyphStyles.root, rtlStyles.mirror)}>
                  {resolveIcon('redo')}
                </span>
              }
              variant="ghost"
              tooltip={t('@astryx.richTextEditor.redo')}
              isDisabled={!isEditable || !canRedo}
              xstyle={toolbarTouchStyles.control}
              onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}
            />
            <Divider
              orientation="vertical"
              aria-label={t('@astryx.richTextEditor.historyAndBlockFormats')}
              xstyle={toolbarDividerStyles.vertical}
            />
            <Selector
              label={t('@astryx.richTextEditor.blockFormat')}
              isLabelHidden
              variant="ghost"
              size={size}
              value={blockType}
              options={blockOptions}
              startIcon={hasBlockOption ? resolveIcon(blockType) : undefined}
              isDisabled={!isEditable}
              xstyle={toolbarTouchStyles.control}
              onChange={value => setBlock(value as BlockType)}
            />
            <Divider
              orientation="vertical"
              aria-label={t('@astryx.richTextEditor.blockAndInlineFormats')}
              xstyle={toolbarDividerStyles.vertical}
            />
            {INLINE_FORMAT_ACTIONS.map(action => (
              <ToggleButton
                key={action.format}
                label={t(action.labelKey)}
                icon={resolveIcon(action.icon)}
                size={size}
                isIconOnly
                isPressed={activeFormats.has(action.format)}
                isDisabled={!isEditable}
                xstyle={toolbarTouchStyles.control}
                onPressedChange={() => toggleInlineFormat(action.format)}
              />
            ))}
            {hasLink && (
              <ToggleButton
                key="link"
                label={t('@astryx.richTextEditor.link')}
                icon={resolveIcon('link')}
                size={size}
                isIconOnly
                isPressed={isLink || isLinkDialogOpen}
                isDisabled={!isEditable}
                xstyle={toolbarTouchStyles.control}
                aria-haspopup="dialog"
                aria-expanded={isLinkDialogOpen}
                // Block body, not a concise one: the handler's return type is
                // then `void` outright. `onMouseDown` is typed through core's
                // BaseProps, so a concise body infers `any` wherever core's
                // declarations are not resolvable (CI lints before building
                // dists) — and `promise-function-async` runs with
                // `allowAny: false`.
                onMouseDown={event => {
                  event.preventDefault();
                }}
                onPressedChange={toggleLink}
              />
            )}
            {isRenderable(endContent) && (
              <>
                <Divider orientation="vertical" />
                {endContent}
              </>
            )}
          </HStack>
        }
      />
      {hasLink && (
        <Dialog
          isOpen={isLinkDialogOpen}
          onOpenChange={handleLinkDialogOpenChange}
          purpose="form"
          width={400}>
          <Stack as="form" onSubmit={handleLinkSubmit}>
            <Layout
              height="auto"
              header={
                <DialogHeader
                  title={
                    isEditingLink
                      ? t('@astryx.richTextEditor.editLink')
                      : t('@astryx.richTextEditor.insertLink')
                  }
                  onOpenChange={handleLinkDialogOpenChange}
                />
              }
              content={
                <LayoutContent>
                  <TextInput
                    label={t('@astryx.richTextEditor.url')}
                    value={linkUrl}
                    width="100%"
                    hasAutoFocus
                    status={
                      hasLinkError
                        ? {
                            type: 'error',
                            message: t('@astryx.richTextEditor.invalidUrl'),
                          }
                        : undefined
                    }
                    statusVariant="detached"
                    onChange={value => {
                      setLinkUrl(value);
                      setHasLinkError(false);
                    }}
                  />
                </LayoutContent>
              }
              footer={
                <LayoutFooter>
                  <HStack gap={2} hAlign="end">
                    {isEditingLink && (
                      <Button
                        label={t('@astryx.richTextEditor.removeLink')}
                        variant="destructive"
                        onClick={removeLink}
                      />
                    )}
                    <Button
                      label={t('@astryx.richTextEditor.cancel')}
                      variant="secondary"
                      onClick={() => handleLinkDialogOpenChange(false)}
                    />
                    <Button
                      label={
                        isEditingLink
                          ? t('@astryx.richTextEditor.updateLink')
                          : t('@astryx.richTextEditor.addLink')
                      }
                      variant="primary"
                      type="submit"
                    />
                  </HStack>
                </LayoutFooter>
              }
            />
          </Stack>
        </Dialog>
      )}
    </>
  );
}

RichTextEditorToolbar.displayName = 'RichTextEditorToolbar';
