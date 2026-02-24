/**
 * @file XDSCommandPalette.tsx
 * @input Uses React, StyleX, XDSIcon, XDSSpinner, types
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
import {XDSIcon} from '../Icon';
import {XDSSpinner} from '../Spinner';
import {
  colorVars,
  spacingVars,
  radiusVars,
  elevationVars,
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
  // Fixed overlay: covers viewport, flexbox centers the palette
  overlay: {
    position: 'fixed',
    inset: 0,
    zIndex: 9999,
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingTop: '15vh',
    backgroundColor: colorVars['--color-overlay'],
    backdropFilter: 'blur(2px)',
  },
  // The palette panel itself
  panel: {
    width: '560px',
    maxWidth: '90vw',
    maxHeight: '60vh',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: colorVars['--color-surface'],
    borderRadius: radiusVars['--radius-container'],
    boxShadow: elevationVars['--elevation-dialog'],
    overflow: 'hidden',
    // Open animation
    opacity: 1,
    transform: 'scale(1) translateY(0)',
    transition: `opacity ${transitionVars['--transition-normal']}, transform ${transitionVars['--transition-normal']}`,
  },
  inputWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-2'],
    padding: `${spacingVars['--spacing-3']} ${spacingVars['--spacing-4']}`,
    borderBottom: `1px solid ${colorVars['--color-divider']}`,
  },
  inputIcon: {
    flexShrink: 0,
    color: colorVars['--color-icon-secondary'],
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
  groupDivider: {
    height: '1px',
    backgroundColor: colorVars['--color-divider'],
    margin: `${spacingVars['--spacing-1']} ${spacingVars['--spacing-3']}`,
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
    padding: `${spacingVars['--spacing-1-5']} ${spacingVars['--spacing-3']}`,
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
  backButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    padding: spacingVars['--spacing-1'],
    borderRadius: radiusVars['--radius-content'],
    color: colorVars['--color-icon-secondary'],
    ':hover': {
      backgroundColor: colorVars['--color-hover-overlay'],
    },
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
    fontSize: textSizeVars['--text-2xs'],
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
    // Text before this match
    if (range.start > lastIndex) {
      parts.push(label.slice(lastIndex, range.start));
    }
    // Matched text
    parts.push(
      <mark key={i} {...stylex.props(styles.highlightMark)}>
        {label.slice(range.start, range.end)}
      </mark>,
    );
    lastIndex = range.end;
  }

  // Text after last match
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
 * Uses a fixed overlay with flexbox centering rather than the native
 * <dialog> element, for robust cross-browser positioning.
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
  const panelRef = useRef<HTMLDivElement>(null);

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
    // When searching, don't show groups — flat list
    grouped = [{group: null, items: scoredCommands}];
  } else {
    // Show "Recent" group first when no query
    const recentIds = new Set(historyEntries.map(h => h.id));
    const recent = scoredCommands.filter(sc => recentIds.has(sc.command.id));
    const rest = scoredCommands.filter(sc => !recentIds.has(sc.command.id));

    const groups: {group: string | null; items: ScoredCommand[]}[] = [];

    if (recent.length > 0) {
      groups.push({group: 'Recent', items: recent});
    }

    // Group remaining by their group property
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

  // Reset state when opening/closing
  useEffect(() => {
    if (isOpen) {
      setHighlightedIndex(0);
      setIsShowShortcuts(false);
      // Focus input on next frame
      requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
    }
  }, [isOpen]);

  // Lock body scroll when open
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
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
          e.preventDefault();
          if (isShowShortcuts) {
            setIsShowShortcuts(false);
          } else if (pageStack.length > 0) {
            goBack();
          } else {
            onClose();
          }
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
      onClose,
      isShowShortcuts,
    ],
  );

  // Click on overlay (outside panel) closes palette
  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    },
    [onClose],
  );

  if (!isOpen) return null;

  // Build flat index for mapping grouped items
  let flatIndex = 0;

  return (
    <div
      {...stylex.props(styles.overlay)}
      onClick={handleOverlayClick}
      data-testid={testId}
      role="presentation">
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        {...stylex.props(styles.panel, rootOverride, xstyle)}>
        {/* Page header with back button */}
        {currentPage && (
          <div {...stylex.props(styles.pageHeader)}>
            <button
              type="button"
              onClick={goBack}
              {...stylex.props(styles.backButton)}
              aria-label="Go back">
              <XDSIcon icon="chevronLeft" size="sm" color="inherit" />
            </button>
            {currentPage}
          </div>
        )}

        {/* Search input */}
        <div {...stylex.props(styles.inputWrapper)}>
          <span {...stylex.props(styles.inputIcon)}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </span>
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

        {/* Result list */}
        <div
          ref={listRef}
          id="command-palette-list"
          role={isShowShortcuts ? 'list' : 'listbox'}
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
              // Group by command group
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
                  {groupIdx++ > 0 && (
                    <div
                      {...stylex.props(styles.groupDivider)}
                      role="separator"
                    />
                  )}
                  {group && (
                    <div {...stylex.props(styles.groupLabel)}>{group}</div>
                  )}
                  {items.map(sc => (
                    <div
                      key={sc.command.id}
                      {...stylex.props(styles.shortcutRow)}
                      role="listitem">
                      <span>{sc.command.label}</span>
                      <span
                        {...stylex.props(styles.shortcut)}
                        aria-hidden="true">
                        {sc.command.shortcut!.split('+').map((key, i) => (
                          <kbd key={i} {...stylex.props(styles.kbd)}>
                            {formatShortcutKey(key)}
                          </kbd>
                        ))}
                      </span>
                    </div>
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
                  <div
                    key={cmd.id}
                    id={`command-palette-item-${idx}`}
                    role="option"
                    aria-selected={isHighlighted}
                    onClick={() => handleSelect(cmd)}
                    onMouseEnter={() => setHighlightedIndex(idx)}
                    {...stylex.props(
                      styles.item,
                      isHighlighted && styles.itemHighlighted,
                    )}>
                    {cmd.icon && (
                      <XDSIcon icon={cmd.icon} size="sm" color="secondary" />
                    )}
                    <span {...stylex.props(styles.itemLabel)}>
                      {renderHighlightedLabel(cmd.label, scored.matchRanges)}
                    </span>
                    {historyEntry && (
                      <span
                        {...stylex.props(styles.recentMeta)}
                        aria-label={`Used ${historyEntry.count} time${historyEntry.count !== 1 ? 's' : ''}`}>
                        {historyEntry.count > 1 && (
                          <>
                            <span>{historyEntry.count}×</span>
                            <span {...stylex.props(styles.recentMetaSeparator)}>
                              ·
                            </span>
                          </>
                        )}
                        <span>
                          {formatRelativeTime(historyEntry.timestamp)}
                        </span>
                        {cmd.group && (
                          <>
                            <span {...stylex.props(styles.recentMetaSeparator)}>
                              ·
                            </span>
                            <span>{cmd.group}</span>
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
                            clearHistoryEntry(cmd.id);
                          }}
                          aria-label={`Remove ${cmd.label} from recent`}
                          tabIndex={-1}>
                          ×
                        </button>
                      </span>
                    )}
                    {!historyEntry && cmd.page && (
                      <XDSIcon icon="chevronRight" size="sm" color="tertiary" />
                    )}
                  </div>
                );
              });

              return (
                <div key={section.group ?? `ungrouped-${sectionIdx}`}>
                  {sectionIdx > 0 && (
                    <div
                      {...stylex.props(styles.groupDivider)}
                      role="separator"
                    />
                  )}
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
    </div>
  );
}

XDSCommandPalette.displayName = 'XDSCommandPalette';
