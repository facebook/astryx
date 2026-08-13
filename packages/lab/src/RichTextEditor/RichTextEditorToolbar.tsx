// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file RichTextEditorToolbar.tsx
 * @input Uses React, @lexical/react (composer context), @lexical/rich-text,
 *   @lexical/selection, @lexical/list, @lexical/utils, and the lexical core
 *   command constants, plus Astryx Toolbar / ToggleButton / Divider primitives.
 * @output Exports RichTextEditorToolbar (a composable formatting toolbar) and
 *   RichTextEditorToolbarProps.
 * @position Experimental (lab). Drop into RichTextEditor's `plugins` slot to add
 *   a formatting toolbar. Themed via Astryx Toolbar/ToggleButton, so it inherits
 *   the active theme with no extra styling.
 *
 * SYNC: When modified, update:
 * - /packages/lab/src/RichTextEditor/index.ts (exports)
 * - /packages/lab/src/index.ts (barrel re-export)
 * - /packages/lab/src/RichTextEditor/RichTextEditor.doc.mjs (usage notes)
 * - /packages/lab/src/RichTextEditor/RichTextEditor.test.tsx (tests)
 * - /apps/storybook/stories/RichTextEditor.stories.tsx (WithToolbar story)
 *
 * NOTE: Experimental `@astryxdesign/lab` component (canary). `lexical` and
 * `@lexical/*` are OPTIONAL peer dependencies — install them to use this.
 * Behavior mirrors the Lexical playground toolbar (selection sync + format
 * commands); the UI is built from Astryx primitives so it matches the theme.
 *
 * ICONS: Each control resolves its glyph through the core icon registry under a
 * stable `richtext:*` key (see {@link RICHTEXT_ICON_KEYS}), falling back to the
 * bundled inline SVGs below. A theme can restyle any glyph by registering its
 * own icon for that key — no need to fork the toolbar:
 *   import {registerIcons} from '@astryxdesign/core/Icon';
 *   registerIcons({'richtext:bold': <MyBoldIcon />});
 */

import {useCallback, useEffect, useState, type ReactNode} from 'react';
import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';
import {$setBlocksType} from '@lexical/selection';
import {
  $createHeadingNode,
  $createQuoteNode,
  $isHeadingNode,
  $isQuoteNode,
  type HeadingTagType,
} from '@lexical/rich-text';
import {
  $isListNode,
  ListNode,
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  REMOVE_LIST_COMMAND,
} from '@lexical/list';
import {$getNearestNodeOfType, mergeRegister} from '@lexical/utils';
import {TOGGLE_LINK_COMMAND, $isLinkNode, $createLinkNode} from '@lexical/link';
import {Toolbar} from '@astryxdesign/core/Toolbar';
import {ToggleButton} from '@astryxdesign/core/ToggleButton';
import {Divider} from '@astryxdesign/core/Divider';
import {getExtendedIcon} from '@astryxdesign/core/Icon';
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
  $createParagraphNode,
  $createTextNode,
} from 'lexical';
import {sanitizeUrl} from './linkUtils';

/** Block types the toolbar can toggle. */
type BlockType =
  'paragraph' | 'h1' | 'h2' | 'h3' | 'quote' | 'bullet' | 'number';

const HEADING_LABELS: Record<'h1' | 'h2' | 'h3', string> = {
  h1: 'Heading 1',
  h2: 'Heading 2',
  h3: 'Heading 3',
};

/**
 * The platform-primary modifier for shortcuts: Cmd on Apple, Ctrl elsewhere.
 * Mirrors the Lexical playground's `CONTROL_OR_META`
 * (packages/lexical-playground/src/plugins/ShortcutsPlugin/shortcuts.ts).
 */
const CONTROL_OR_META = {ctrlKey: !IS_APPLE, metaKey: IS_APPLE};

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
 * of these via `registerIcons({'richtext:bold': <MyIcon />})` from
 * `@astryxdesign/core/Icon`. Keys are namespaced (`richtext:*`) to avoid
 * collisions with the core semantic icon set.
 */
export const RICHTEXT_ICON_KEYS = {
  bold: 'richtext:bold',
  italic: 'richtext:italic',
  underline: 'richtext:underline',
  strikethrough: 'richtext:strikethrough',
  code: 'richtext:code',
  link: 'richtext:link',
  h1: 'richtext:h1',
  h2: 'richtext:h2',
  h3: 'richtext:h3',
  quote: 'richtext:quote',
  bullet: 'richtext:bullet',
  number: 'richtext:number',
  undo: 'richtext:undo',
  redo: 'richtext:redo',
} as const;

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

/** Renders a short text label as a toolbar glyph (for heading buttons). */
function TextGlyph({label}: {label: string}) {
  return (
    <span
      aria-hidden="true"
      style={{
        fontSize: '0.75rem',
        fontWeight: 700,
        fontVariantNumeric: 'tabular-nums',
      }}>
      {label}
    </span>
  );
}

/**
 * Resolve a toolbar glyph: prefer a theme-registered icon for the stable
 * `richtext:*` key, otherwise fall back to the bundled inline default.
 */
function resolveIcon(name: keyof typeof RICHTEXT_ICON_KEYS): ReactNode {
  return getExtendedIcon(RICHTEXT_ICON_KEYS[name], defaultToolbarIcons[name]);
}

export interface RichTextEditorToolbarProps {
  /**
   * Accessible label for the toolbar element.
   * @default 'Text formatting'
   */
  label?: string;
  /**
   * Which heading levels to expose as block-type buttons, in order.
   * @default ['h1', 'h2', 'h3']
   */
  headingLevels?: ReadonlyArray<'h1' | 'h2' | 'h3'>;
  /** Toolbar size, forwarded to the Astryx Toolbar. @default 'sm' */
  size?: 'sm' | 'md' | 'lg';
  /**
   * Whether to show the insert/edit-link button. When enabled, pressing it on a
   * collapsed or non-link selection prompts for a URL (via `promptForUrl`,
   * `window.prompt` by default) and wraps the selection in a link; pressing it
   * while a link is selected removes the link.
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
   * Receives the currently selected text as a hint. Defaults to
   * `window.prompt`. Override to plug in a custom (e.g. Astryx Dialog) prompt.
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
  linkOpensInNewTab?: boolean;
  /**
   * Extra items rendered at the end of the toolbar (after a divider). Use this
   * to compose product-specific controls (e.g. mentions, AI) alongside the
   * default formatting buttons.
   */
  endContent?: ReactNode;
}

/**
 * A composable formatting toolbar for {@link RichTextEditor}, built from Astryx
 * `Toolbar` / `ToggleButton` primitives so it matches the active theme. Reads
 * the current selection to keep the active states in sync and dispatches the
 * standard Lexical formatting commands.
 *
 * Render it inside the editor's `plugins` slot — it uses
 * `useLexicalComposerContext()` to reach the editor, so it must live within the
 * `LexicalComposer` the editor sets up.
 *
 * @example
 * ```
 * import {RichTextEditor, RichTextEditorToolbar} from '@astryxdesign/lab';
 *
 * <RichTextEditor
 *   label="Notes"
 *   plugins={<RichTextEditorToolbar />}
 * />
 * ```
 */
export function RichTextEditorToolbar({
  label = 'Text formatting',
  headingLevels = ['h1', 'h2', 'h3'],
  size = 'sm',
  hasLink = true,
  promptForUrl,
  linkOpensInNewTab = true,
  endContent,
}: RichTextEditorToolbarProps) {
  const [editor] = useLexicalComposerContext();
  const [activeFormats, setActiveFormats] = useState<Set<string>>(new Set());
  const [blockType, setBlockType] = useState<BlockType>('paragraph');
  const [isLink, setIsLink] = useState(false);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [isEditable, setIsEditable] = useState(() => editor.isEditable());

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
    setIsLink($isLinkNode(node.getParent()) || $isLinkNode(node));

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

  /**
   * Toggle a link on the current selection.
   *
   * - On an existing (non-auto) link: removes it (`TOGGLE_LINK_COMMAND` with
   *   `null`).
   * - Otherwise: reads the currently selected text, asks `promptForUrl`
   *   (default `window.prompt`) for a URL, sanitizes it, then either wraps the
   *   selection in a link or — for a collapsed caret with no selected text —
   *   inserts a new link whose text and href are both the URL.
   *
   * Semantics deliberately mirror EPS eps-lexical's `LinkPopoverPlugin.
   * handleSubmit`: both dispatch the OSS `TOGGLE_LINK_COMMAND` and fall back to
   * `$createLinkNode` for a collapsed selection. astryx keeps the *command +
   * node contract* identical so EPS can later replace astryx's default prompt
   * with its own floating popover without changing behaviour.
   */
  const toggleLink = useCallback(() => {
    if (!editor.isEditable()) {
      return;
    }

    // Removing an existing (manually-created) link doesn't need a URL.
    if (isLink) {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
      return;
    }

    // Read the selected text (as a prompt hint) inside a read context.
    let selectedText = '';
    editor.getEditorState().read(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        selectedText = selection.getTextContent();
      }
    });

    const ask =
      promptForUrl ??
      ((hint: string) =>
        typeof window !== 'undefined'
          ? window.prompt(
              'Enter a URL',
              hint.startsWith('http') ? hint : 'https://',
            )
          : null);
    const entered = ask(selectedText);
    if (entered == null || entered.trim() === '') {
      return;
    }
    const url = sanitizeUrl(entered);
    if (url === 'about:blank') {
      // Sanitizer rejected the input (empty / unsafe scheme) — do nothing
      // rather than write a dead link.
      return;
    }

    // New-tab attributes are baked into the LINK NODE DATA (not patched onto
    // the DOM): TOGGLE_LINK_COMMAND accepts `{url, target, rel}` and stores
    // them on the node, so they serialize and round-trip. rel="noopener
    // noreferrer" is required whenever target="_blank" (reverse-tabnabbing).
    const linkAttributes = linkOpensInNewTab
      ? {target: '_blank', rel: 'noopener noreferrer'}
      : {};

    // Dispatch TOGGLE_LINK_COMMAND so any DecoratorNode handlers can intercept
    // first (parity with eps-lexical). If nothing consumes it, the built-in
    // @lexical/link handler wraps the selection. `dispatchCommand` returns
    // whether a handler ran; on a collapsed caret the built-in handler is a
    // no-op, so we insert an explicit link node as a fallback.
    const handled = editor.dispatchCommand(TOGGLE_LINK_COMMAND, {
      url,
      ...linkAttributes,
    });
    if (!handled) {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection) && selection.isCollapsed()) {
          const linkNode = $createLinkNode(url, linkAttributes);
          linkNode.append($createTextNode(entered.trim()));
          selection.insertNodes([linkNode]);
        }
      });
    }
  }, [editor, isLink, promptForUrl, linkOpensInNewTab]);

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

  const toggleInlineFormat = (format: string) => {
    // FORMAT_TEXT_COMMAND payload is a TextFormatType; the values we pass are
    // all valid members.
    editor.dispatchCommand(
      FORMAT_TEXT_COMMAND,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      format as any,
    );
  };

  const setBlock = (next: BlockType) => {
    if (next === 'bullet') {
      editor.dispatchCommand(
        blockType === 'bullet'
          ? REMOVE_LIST_COMMAND
          : INSERT_UNORDERED_LIST_COMMAND,
        undefined,
      );
      return;
    }
    if (next === 'number') {
      editor.dispatchCommand(
        blockType === 'number'
          ? REMOVE_LIST_COMMAND
          : INSERT_ORDERED_LIST_COMMAND,
        undefined,
      );
      return;
    }
    // Heading / quote / paragraph — toggle back to paragraph when already set.
    const target = blockType === next ? 'paragraph' : next;
    editor.update(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) {
        return;
      }
      $setBlocksType(selection, () => {
        if (target === 'quote') {
          return $createQuoteNode();
        }
        if (target === 'h1' || target === 'h2' || target === 'h3') {
          return $createHeadingNode(target as HeadingTagType);
        }
        return $createParagraphNode();
      });
    });
  };

  return (
    <Toolbar
      label={label}
      size={size}
      startContent={
        <>
          <ToggleButton
            label="Undo"
            icon={resolveIcon('undo')}
            isIconOnly
            isPressed={false}
            isDisabled={!isEditable || !canUndo}
            onPressedChange={() =>
              editor.dispatchCommand(UNDO_COMMAND, undefined)
            }
          />
          <ToggleButton
            label="Redo"
            icon={resolveIcon('redo')}
            isIconOnly
            isPressed={false}
            isDisabled={!isEditable || !canRedo}
            onPressedChange={() =>
              editor.dispatchCommand(REDO_COMMAND, undefined)
            }
          />
          <Divider orientation="vertical" />
          <ToggleButton
            label="Bold"
            icon={resolveIcon('bold')}
            isIconOnly
            isPressed={activeFormats.has('bold')}
            isDisabled={!isEditable}
            onPressedChange={() => toggleInlineFormat('bold')}
          />
          <ToggleButton
            label="Italic"
            icon={resolveIcon('italic')}
            isIconOnly
            isPressed={activeFormats.has('italic')}
            isDisabled={!isEditable}
            onPressedChange={() => toggleInlineFormat('italic')}
          />
          <ToggleButton
            label="Underline"
            icon={resolveIcon('underline')}
            isIconOnly
            isPressed={activeFormats.has('underline')}
            isDisabled={!isEditable}
            onPressedChange={() => toggleInlineFormat('underline')}
          />
          <ToggleButton
            label="Strikethrough"
            icon={resolveIcon('strikethrough')}
            isIconOnly
            isPressed={activeFormats.has('strikethrough')}
            isDisabled={!isEditable}
            onPressedChange={() => toggleInlineFormat('strikethrough')}
          />
          <ToggleButton
            label="Inline code"
            icon={resolveIcon('code')}
            isIconOnly
            isPressed={activeFormats.has('code')}
            isDisabled={!isEditable}
            onPressedChange={() => toggleInlineFormat('code')}
          />
          {hasLink && (
            <ToggleButton
              label="Link"
              icon={resolveIcon('link')}
              isIconOnly
              isPressed={isLink}
              isDisabled={!isEditable}
              onPressedChange={toggleLink}
            />
          )}
          <Divider orientation="vertical" />
          {headingLevels.map(level => (
            <ToggleButton
              key={level}
              label={HEADING_LABELS[level]}
              icon={resolveIcon(level)}
              isIconOnly
              isPressed={blockType === level}
              isDisabled={!isEditable}
              onPressedChange={() => setBlock(level)}
            />
          ))}
          <ToggleButton
            label="Quote"
            icon={resolveIcon('quote')}
            isIconOnly
            isPressed={blockType === 'quote'}
            isDisabled={!isEditable}
            onPressedChange={() => setBlock('quote')}
          />
          <Divider orientation="vertical" />
          <ToggleButton
            label="Bulleted list"
            icon={resolveIcon('bullet')}
            isIconOnly
            isPressed={blockType === 'bullet'}
            isDisabled={!isEditable}
            onPressedChange={() => setBlock('bullet')}
          />
          <ToggleButton
            label="Numbered list"
            icon={resolveIcon('number')}
            isIconOnly
            isPressed={blockType === 'number'}
            isDisabled={!isEditable}
            onPressedChange={() => setBlock('number')}
          />
          {endContent != null && (
            <>
              <Divider orientation="vertical" />
              {endContent}
            </>
          )}
        </>
      }
    />
  );
}

RichTextEditorToolbar.displayName = 'RichTextEditorToolbar';
