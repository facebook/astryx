/**
 * @file XDSCommandPalette.tsx
 * @input Uses React, StyleX, XDSDialog, XDSButton, XDSIcon, XDSDivider, XDSSpinner, types
 * @output Exports XDSCommandPalette component
 * @position Modal UI; rendered by XDSCommandPaletteProvider
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/CommandPalette/README.md (features, accessibility)
 * - /packages/core/src/CommandPalette/XDSCommandPalette.test.tsx
 * - /apps/storybook/stories/CommandPalette.stories.tsx
 */

import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import * as stylex from '@stylexjs/stylex';
import {XDSDialog} from '../Dialog';
import {XDSButton} from '../Button';
import {XDSIcon} from '../Icon';
import {XDSDivider} from '../Divider';
import {XDSSpinner} from '../Spinner';
import {
  colorVars,
  spacingVars,
  radiusVars,
  transitionVars,
  textSizeVars,
  typographyVars,
  fontWeightVars,
  lineHeightVars,
} from '../theme/tokens.stylex';
import {ThemeContext} from '../theme/ThemeContext';
import type {StyleXStyles as ThemeStyleXStyles} from '../theme/types';
import type {
  XDSCommand,
  HistoryEntry,
  ScoredCommand,
  MatchRange,
} from './types';

// =============================================================================
// Module Augmentation
// =============================================================================

declare module '../theme/types' {
  interface ComponentStyles {
    commandPalette?: {
      root?: ThemeStyleXStyles;
    };
  }
}

// =============================================================================
// Styles
// =============================================================================

const styles = stylex.create({
  // The dialog content container
  dialogContent: {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    height: '100%',
  },
  inputWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-2'],
    padding: `${spacingVars['--spacing-3']} ${spacingVars['--spacing-4']}`,
    borderBottom: `1px solid ${colorVars['--color-divider']}`,
  },
  input: {
    flex: 1,
    border: 'none',
    outline: 'none',
    backgroundColor: 'transparent',
    fontFamily: typographyVars['--font-body'],
    fontSize: textSizeVars['--text-base'],
    color: colorVars['--color-text-primary'],
    lineHeight: lineHeightVars['--leading-normal'],
    '::placeholder': {
      color: colorVars['--color-text-placeholder'],
    },
  },
  resultList: {
    overflowY: 'auto',
    padding: spacingVars['--spacing-1'],
    flex: 1,
  },
  groupLabel: {
    padding: `${spacingVars['--spacing-2']} ${spacingVars['--spacing-3']} ${spacingVars['--spacing-1']}`,
    marginTop: spacingVars['--spacing-2'],
    fontFamily: typographyVars['--font-body'],
    fontSize: textSizeVars['--text-xsm'],
    color: colorVars['--color-text-secondary'],
    fontWeight: fontWeightVars['--font-weight-semibold'],
  },
  item: {
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-2'],
    width: '100%',
    padding: `${spacingVars['--spacing-2']} ${spacingVars['--spacing-3']}`,
    borderRadius: radiusVars['--radius-content'],
    fontFamily: typographyVars['--font-body'],
    fontSize: textSizeVars['--text-base'],
    color: colorVars['--color-text-primary'],
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    textAlign: 'left' as const,
    outline: 'none',
    transition: `background-color ${transitionVars['--transition-fast']}`,
  },
  itemHighlighted: {
    backgroundColor: colorVars['--color-hover-overlay'],
  },
  itemLabel: {
    flex: 1,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
  },
  highlightMark: {
    backgroundColor: 'transparent',
    color: colorVars['--color-text-primary'],
    fontWeight: fontWeightVars['--font-weight-semibold'],
  },
  shortcut: {
    display: 'flex',
    gap: spacingVars['--spacing-0-5'],
    flexShrink: 0,
  },
  kbd: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '20px',
    height: '20px',
    padding: `0 ${spacingVars['--spacing-1']}`,
    borderRadius: radiusVars['--radius-content'],
    backgroundColor: colorVars['--color-deemphasized'],
    fontFamily: typographyVars['--font-body'],
    fontSize: textSizeVars['--text-xsm'],
    color: colorVars['--color-text-secondary'],
    lineHeight: lineHeightVars['--leading-tight'],
  },
  empty: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacingVars['--spacing-8'],
    fontFamily: typographyVars['--font-body'],
    fontSize: textSizeVars['--text-sm'],
    color: colorVars['--color-text-secondary'],
  },
  loading: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacingVars['--spacing-4'],
  },
  footer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: `${spacingVars['--spacing-2']} ${spacingVars['--spacing-4']}`,
    borderTop: `1px solid ${colorVars['--color-divider']}`,
    fontFamily: typographyVars['--font-body'],
    fontSize: textSizeVars['--text-xsm'],
    color: colorVars['--color-text-secondary'],
  },
  footerButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-1'],
    border: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    padding: `${spacingVars['--spacing-0-5']} ${spacingVars['--spacing-1']}`,
    borderRadius: radiusVars['--radius-content'],
    fontFamily: typographyVars['--font-body'],
    fontSize: textSizeVars['--text-2xs'],
    color: colorVars['--color-text-placeholder'],
    ':hover': {
      color: colorVars['--color-text-secondary'],
    },
  },
  shortcutRow: {
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    padding: `${spacingVars['--spacing-1']} ${spacingVars['--spacing-3']}`,
    fontFamily: typographyVars['--font-body'],
    fontSize: textSizeVars['--text-sm'],
    color: colorVars['--color-text-primary'],
  },
  pageHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-2'],
    padding: `${spacingVars['--spacing-2']} ${spacingVars['--spacing-3']}`,
    borderBottom: `1px solid ${colorVars['--color-divider']}`,
    fontFamily: typographyVars['--font-body'],
    fontSize: textSizeVars['--text-sm'],
    color: colorVars['--color-text-secondary'],
    fontWeight: fontWeightVars['--font-weight-medium'],
  },
  recentMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-1'],
    flexShrink: 0,
    fontFamily: typographyVars['--font-body'],
    fontSize: textSizeVars['--text-2xs'],
    color: colorVars['--color-text-placeholder'],
    fontWeight: fontWeightVars['--font-weight-normal'],
    letterSpacing: '0.01em',
  },
  recentMetaSeparator: {
    opacity: 0.5,
  },
  clearButton: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    padding: `0 ${spacingVars['--spacing-0-5']}`,
    marginLeft: spacingVars['--spacing-0-5'],
    color: colorVars['--color-text-placeholder'],
    lineHeight: lineHeightVars['--leading-tight'],
    opacity: 0,
    transition: `opacity ${transitionVars['--transition-fast']}`,
    borderRadius: radiusVars['--radius-content'],
  },
  // Show clear button when hovering its parent item
  itemHoverClearVisible: {
    opacity: 1,
  },
});

// =============================================================================
// Shortcut display helpers
// =============================================================================

const MOD_SYMBOLS: Record<string, string> = {
  mod:
    typeof navigator !== 'undefined' &&
    /Mac|iPhone|iPad/.test(navigator.userAgent)
      ? '\u2318'
      : 'Ctrl',
  ctrl: 'Ctrl',
  meta: '\u2318',
  shift: '\u21E7',
  alt:
    typeof navigator !== 'undefined' &&
    /Mac|iPhone|iPad/.test(navigator.userAgent)
      ? '\u2325'
      : 'Alt',
};

function formatShortcutKey(key: string): string {
  return MOD_SYMBOLS[key.toLowerCase()] ?? key.toUpperCase();
}

// =============================================================================
// Highlight rendering
// =============================================================================

function renderHighlightedLabel(
  label: string,
  matchRanges: MatchRange[],
): ReactNode {
  if (matchRanges.length === 0) {
    return label;
  }

  const parts: ReactNode[] = [];
  let lastIndex = 0;

  for (let i = 0; i < matchRanges.length; i++) {
    const range = matchRanges[i];
    if (range.start > lastIndex) {
      parts.push(label.slice(lastIndex, range.start));
    }
    parts.push(
      <mark key={i} {...stylex.props(styles.highlightMark)}>
        {label.slice(range.start, range.end)}
      </mark>,
    );
    lastIndex = range.end;
  }

  if (lastIndex < label.length) {
    parts.push(label.slice(lastIndex));
  }

  return parts;
}

// =============================================================================
// Relative time formatting
// =============================================================================

function formatRelativeTime(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

// =============================================================================
// Sub-components
// =============================================================================

/**
 * Renders a single shortcut display row within the shortcuts panel.
 */
function CommandPaletteShortcutRow({command}: {command: XDSCommand}) {
  return (
    <div
      {...stylex.props(styles.shortcutRow)}
      role="option"
      aria-selected={false}>
      <span>{command.label}</span>
      <span {...stylex.props(styles.shortcut)} aria-hidden="true">
        {command.shortcut!.split('+').map((key, i) => (
          <kbd key={i} {...stylex.props(styles.kbd)}>
            {formatShortcutKey(key)}
          </kbd>
        ))}
      </span>
    </div>
  );
}

CommandPaletteShortcutRow.displayName = 'CommandPaletteShortcutRow';

/**
 * Renders the history metadata (count, relative time, group, clear button)
 * shown on recently-used command items.
 */
function CommandPaletteRecentMeta({
  command,
  historyEntry,
  isHighlighted,
  onClear,
}: {
  command: XDSCommand;
  historyEntry: HistoryEntry;
  isHighlighted: boolean;
  onClear: (id: string) => void;
}) {
  return (
    <span
      {...stylex.props(styles.recentMeta)}
      aria-label={`Used ${historyEntry.count} time${historyEntry.count !== 1 ? 's' : ''}`}>
      {historyEntry.count > 1 && (
        <>
          <span>{historyEntry.count}×</span>
          <span {...stylex.props(styles.recentMetaSeparator)}>·</span>
        </>
      )}
      <span>{formatRelativeTime(historyEntry.timestamp)}</span>
      {command.group && (
        <>
          <span {...stylex.props(styles.recentMetaSeparator)}>·</span>
          <span>{command.group}</span>
        </>
      )}
      <button
        type="button"
        {...stylex.props(
          styles.clearButton,
          isHighlighted && styles.itemHoverClearVisible,
        )}
        onClick={e => {
          e.stopPropagation();
          onClear(command.id);
        }}
        aria-label={`Remove ${command.label} from recent`}
        tabIndex={-1}>
        <XDSIcon icon="close" size="xsm" color="inherit" />
      </button>
    </span>
  );
}

CommandPaletteRecentMeta.displayName = 'CommandPaletteRecentMeta';

/**
 * Renders a single command option row in the palette list.
 */
function CommandPaletteItem({
  command,
  scored,
  index,
  isHighlighted,
  historyEntry,
  onSelect,
  onHighlight,
  onClearHistory,
}: {
  command: XDSCommand;
  scored: ScoredCommand;
  index: number;
  isHighlighted: boolean;
  historyEntry?: HistoryEntry;
  onSelect: (command: XDSCommand) => void;
  onHighlight: (index: number) => void;
  onClearHistory: (id: string) => void;
}) {
  return (
    <div
      key={command.id}
      id={`command-palette-item-${index}`}
      role="option"
      aria-selected={isHighlighted}
      onClick={() => onSelect(command)}
      onMouseEnter={() => onHighlight(index)}
      {...stylex.props(styles.item, isHighlighted && styles.itemHighlighted)}>
      {command.icon && (
        <XDSIcon icon={command.icon} size="sm" color="secondary" />
      )}
      <span {...stylex.props(styles.itemLabel)}>
        {renderHighlightedLabel(command.label, scored.matchRanges)}
      </span>
      {historyEntry && (
        <CommandPaletteRecentMeta
          command={command}
          historyEntry={historyEntry}
          isHighlighted={isHighlighted}
          onClear={onClearHistory}
        />
      )}
      {!historyEntry && command.page && (
        <XDSIcon icon="chevronRight" size="sm" color="tertiary" />
      )}
    </div>
  );
}

CommandPaletteItem.displayName = 'CommandPaletteItem';

// =============================================================================
// Props
// =============================================================================

interface XDSCommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  scoredCommands: ScoredCommand[];
  isLoading: boolean;
  query: string;
  onQueryChange: (query: string) => void;
  getHistory: () => HistoryEntry[];
  recordHistory: (commandId: string) => void;
  clearHistoryEntry: (commandId: string) => void;
  pageStack: string[];
  onPageStackChange: (pages: string[]) => void;
  placeholder?: string;
  emptyContent?: ReactNode;
  footer?: ReactNode;
  xstyle?: stylex.StyleXStyles;
  'data-testid'?: string;
}

// =============================================================================
// Component
// =============================================================================

/**
 * The modal UI for the command palette.
 * Rendered internally by XDSCommandPaletteProvider.
 *
 * Uses XDSDialog (native <dialog> element) for overlay, scroll lock,
 * and backdrop click handling.
 */
export function XDSCommandPalette({
  isOpen,
  onClose,
  scoredCommands,
  isLoading,
  query,
  onQueryChange,
  getHistory,
  recordHistory,
  clearHistoryEntry,
  pageStack,
  onPageStackChange,
  placeholder = 'Search commands...',
  emptyContent,
  footer,
  xstyle,
  'data-testid': testId,
}: XDSCommandPaletteProps) {
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [isShowShortcuts, setIsShowShortcuts] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const themeContext = useContext(ThemeContext);
  const rootOverride = themeContext?.theme.components?.commandPalette?.root;

  const currentPage =
    pageStack.length > 0 ? pageStack[pageStack.length - 1] : null;

  const historyEntries = getHistory();
  const historyMap = useMemo(() => {
    const map = new Map<string, HistoryEntry>();
    for (const entry of historyEntries) {
      map.set(entry.id, entry);
    }
    return map;
  }, [historyEntries]);

  // Group commands for display
  let grouped: {group: string | null; items: ScoredCommand[]}[];

  if (query.length > 0) {
    grouped = [{group: null, items: scoredCommands}];
  } else {
    const recentIds = new Set(historyEntries.map(h => h.id));
    const recent = scoredCommands.filter(sc => recentIds.has(sc.command.id));
    const rest = scoredCommands.filter(sc => !recentIds.has(sc.command.id));

    const groups: {group: string | null; items: ScoredCommand[]}[] = [];

    if (recent.length > 0) {
      groups.push({group: 'Recent', items: recent});
    }

    const byGroup = new Map<string | null, ScoredCommand[]>();
    for (const sc of rest) {
      const key = sc.command.group ?? null;
      const list = byGroup.get(key);
      if (list) {
        list.push(sc);
      } else {
        byGroup.set(key, [sc]);
      }
    }

    for (const [group, items] of byGroup) {
      groups.push({group, items});
    }

    grouped = groups;
  }

  // Flat list for keyboard navigation
  const flatItems = grouped.flatMap(g => g.items);

  // Reset state when opening
  useEffect(() => {
    if (isOpen) {
      setHighlightedIndex(0);
      setIsShowShortcuts(false);
      requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
    }
  }, [isOpen]);

  // Reset highlighted index when results change
  useEffect(() => {
    setHighlightedIndex(0);
  }, [query]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (!listRef.current) return;
    const items = listRef.current.querySelectorAll('[role="option"]');
    const item = items[highlightedIndex] as HTMLElement | undefined;
    item?.scrollIntoView?.({block: 'nearest'});
  }, [highlightedIndex]);

  const handleSelect = useCallback(
    (command: XDSCommand) => {
      if (command.page) {
        onPageStackChange([...pageStack, command.page]);
        onQueryChange('');
        setHighlightedIndex(0);
        return;
      }

      recordHistory(command.id);
      onClose();
      command.onSelect();
    },
    [pageStack, onPageStackChange, onQueryChange, recordHistory, onClose],
  );

  const goBack = useCallback(() => {
    if (pageStack.length > 0) {
      onPageStackChange(pageStack.slice(0, -1));
      onQueryChange('');
      setHighlightedIndex(0);
    }
  }, [pageStack, onPageStackChange, onQueryChange]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setHighlightedIndex(prev =>
            prev < flatItems.length - 1 ? prev + 1 : prev,
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setHighlightedIndex(prev => (prev > 0 ? prev - 1 : prev));
          break;
        case 'Home':
          e.preventDefault();
          setHighlightedIndex(0);
          break;
        case 'End':
          e.preventDefault();
          setHighlightedIndex(Math.max(0, flatItems.length - 1));
          break;
        case 'Enter':
          e.preventDefault();
          if (highlightedIndex >= 0 && highlightedIndex < flatItems.length) {
            handleSelect(flatItems[highlightedIndex].command);
          }
          break;
        case 'Backspace':
          if (query === '' && pageStack.length > 0) {
            e.preventDefault();
            goBack();
          }
          break;
        case 'Escape':
          // Layered Escape: shortcuts panel → page stack → close (via XDSDialog)
          if (isShowShortcuts) {
            e.preventDefault();
            e.stopPropagation();
            e.nativeEvent.stopPropagation();
            setIsShowShortcuts(false);
          } else if (pageStack.length > 0) {
            e.preventDefault();
            e.stopPropagation();
            e.nativeEvent.stopPropagation();
            goBack();
          }
          // Otherwise let the event bubble to XDSDialog's Escape handler
          break;
      }
    },
    [
      flatItems,
      highlightedIndex,
      handleSelect,
      query,
      pageStack,
      goBack,
      isShowShortcuts,
    ],
  );

  // Build flat index for mapping grouped items
  let flatIndex = 0;

  return (
    <XDSDialog
      isShown={isOpen}
      onHide={onClose}
      width={560}
      maxHeight="60vh"
      position={{top: '15vh'}}
      purpose="info"
      aria-label="Command palette"
      data-testid={testId}>
      <div {...stylex.props(styles.dialogContent, rootOverride, xstyle)}>
        {/* Page header with back button */}
        {currentPage && (
          <div {...stylex.props(styles.pageHeader)}>
            <XDSButton
              label="Go back"
              variant="ghost"
              size="sm"
              icon={<XDSIcon icon="chevronLeft" size="sm" color="inherit" />}
              onClick={goBack}
            />
            {currentPage}
          </div>
        )}

        {/* Search input */}
        <div {...stylex.props(styles.inputWrapper)}>
          <XDSIcon icon="search" size="sm" color="secondary" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => onQueryChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            role="combobox"
            aria-expanded={flatItems.length > 0}
            aria-controls="command-palette-list"
            aria-activedescendant={
              highlightedIndex >= 0
                ? `command-palette-item-${highlightedIndex}`
                : undefined
            }
            aria-autocomplete="list"
            {...stylex.props(styles.input)}
          />
        </div>

        {/* Result list — always role="listbox" for combobox pattern */}
        <div
          ref={listRef}
          id="command-palette-list"
          role="listbox"
          aria-label={isShowShortcuts ? 'Keyboard shortcuts' : 'Commands'}
          {...stylex.props(styles.resultList)}>
          {isShowShortcuts ? (
            // Shortcuts panel
            (() => {
              const withShortcuts = scoredCommands
                .filter(sc => sc.command.shortcut)
                .sort((a, b) => a.command.label.localeCompare(b.command.label));
              if (withShortcuts.length === 0) {
                return (
                  <div {...stylex.props(styles.empty)}>
                    No keyboard shortcuts
                  </div>
                );
              }
              const groups = new Map<string, typeof withShortcuts>();
              for (const sc of withShortcuts) {
                const group = sc.command.group ?? '';
                const list = groups.get(group);
                if (list) {
                  list.push(sc);
                } else {
                  groups.set(group, [sc]);
                }
              }
              let groupIdx = 0;
              return Array.from(groups.entries()).map(([group, items]) => (
                <div key={group || 'ungrouped'}>
                  {groupIdx++ > 0 && <XDSDivider />}
                  {group && (
                    <div {...stylex.props(styles.groupLabel)}>{group}</div>
                  )}
                  {items.map(sc => (
                    <CommandPaletteShortcutRow
                      key={sc.command.id}
                      command={sc.command}
                    />
                  ))}
                </div>
              ));
            })()
          ) : flatItems.length === 0 && !isLoading ? (
            <div {...stylex.props(styles.empty)}>
              {emptyContent ?? 'No results found'}
            </div>
          ) : (
            grouped.map((section, sectionIdx) => {
              const isRecentSection = section.group === 'Recent';
              const sectionElements = section.items.map(scored => {
                const cmd = scored.command;
                const idx = flatIndex++;
                const isHighlighted = idx === highlightedIndex;
                const historyEntry = isRecentSection
                  ? historyMap.get(cmd.id)
                  : undefined;

                return (
                  <CommandPaletteItem
                    key={cmd.id}
                    command={cmd}
                    scored={scored}
                    index={idx}
                    isHighlighted={isHighlighted}
                    historyEntry={historyEntry}
                    onSelect={handleSelect}
                    onHighlight={setHighlightedIndex}
                    onClearHistory={clearHistoryEntry}
                  />
                );
              });

              return (
                <div key={section.group ?? `ungrouped-${sectionIdx}`}>
                  {sectionIdx > 0 && <XDSDivider />}
                  {section.group && (
                    <div {...stylex.props(styles.groupLabel)}>
                      {section.group}
                    </div>
                  )}
                  {sectionElements}
                </div>
              );
            })
          )}
          {isLoading && (
            <div
              {...stylex.props(styles.loading)}
              data-testid="command-palette-loading">
              <XDSSpinner size="sm" />
            </div>
          )}
        </div>

        {/* Footer */}
        <div {...stylex.props(styles.footer)}>
          <div>{footer}</div>
          <button
            type="button"
            {...stylex.props(styles.footerButton)}
            onClick={() => setIsShowShortcuts(prev => !prev)}
            tabIndex={-1}>
            {isShowShortcuts ? 'Back to commands' : 'Keyboard shortcuts'}
          </button>
        </div>
      </div>
    </XDSDialog>
  );
}

XDSCommandPalette.displayName = 'XDSCommandPalette';
