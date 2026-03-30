/**
 * @file XDSCommandPalette.tsx
 * Sandbox prototype — built from XDSCommandPalette lab spec (issue #576).
 * NOT a published core component. Lives in apps/sandbox for prototype purposes.
 *
 * Keyboard-triggered search and action surface (⌘K / Ctrl+K).
 * Built from XDSDialog + XDSTextInput + XDSList primitives.
 */

'use client';

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  type ReactNode,
  type KeyboardEvent,
} from 'react';
import * as stylex from '@stylexjs/stylex';
import {XDSDialog} from '@xds/core/Dialog';
import {XDSList, XDSListItem} from '@xds/core/List';
import {XDSText} from '@xds/core/Text';
import {XDSSpinner} from '@xds/core/Spinner';
import {XDSDivider} from '@xds/core';
import {
  colorVars,
  spacingVars,
  typographyVars,
  textSizeVars,
  lineHeightVars,
} from '@xds/core/theme/tokens.stylex';
import type {ComponentType} from 'react';

// =============================================================================
// Types
// =============================================================================

export interface CommandPaletteItem {
  id: string;
  label: string;
  description?: string;
  icon?: ComponentType<{style?: React.CSSProperties}>;
  shortcut?: string;
  group?: string;
  onSelect: () => void;
}

export interface XDSCommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  items: CommandPaletteItem[];
  placeholder?: string;
  isLoading?: boolean;
}

// =============================================================================
// Styles
// =============================================================================

const styles = stylex.create({
  searchContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-3'],
    paddingInline: spacingVars['--spacing-4'],
    paddingBlock: spacingVars['--spacing-3'],
    borderBlockEnd: `1px solid ${colorVars['--color-border']}`,
    flexShrink: 0,
  },
  searchIcon: {
    color: colorVars['--color-icon-secondary'],
    flexShrink: 0,
  },
  input: {
    flex: 1,
    border: 'none',
    outline: 'none',
    backgroundColor: 'transparent',
    fontFamily: typographyVars['--font-body'],
    fontSize: textSizeVars['--text-size-body'],
    lineHeight: lineHeightVars['--line-height-body'],
    color: colorVars['--color-text-primary'],
  },
  results: {
    flex: 1,
    overflowY: 'auto',
    paddingBlock: spacingVars['--spacing-2'],
    minHeight: 0,
  },
  groupLabel: {
    paddingInline: spacingVars['--spacing-4'],
    paddingBlockStart: spacingVars['--spacing-3'],
    paddingBlockEnd: spacingVars['--spacing-1'],
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBlock: spacingVars['--spacing-10'],
    gap: spacingVars['--spacing-2'],
  },
  loadingState: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBlock: spacingVars['--spacing-8'],
  },
  footer: {
    display: 'flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-4'],
    paddingInline: spacingVars['--spacing-4'],
    paddingBlock: spacingVars['--spacing-2'],
    borderBlockStart: `1px solid ${colorVars['--color-border']}`,
    flexShrink: 0,
  },
  footerHint: {
    display: 'flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-1'],
  },
  itemWrapper: {
    paddingInline: spacingVars['--spacing-2'],
  },
  shortcutBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-1'],
  },
});

// =============================================================================
// Kbd chip
// =============================================================================

function PaletteKbd({children}: {children: ReactNode}) {
  return (
    <kbd
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 20,
        height: 20,
        padding: '0 4px',
        borderRadius: 4,
        border: '1px solid #CCD3DB',
        backgroundColor: '#F5F6F7',
        fontFamily: 'system-ui, sans-serif',
        fontSize: 11,
        fontWeight: 500,
        color: '#606770',
        lineHeight: '1',
      }}>
      {children}
    </kbd>
  );
}

// =============================================================================
// Fuzzy filter
// =============================================================================

function fuzzyMatch(text: string, query: string): boolean {
  if (!query) return true;
  const lower = text.toLowerCase();
  const q = query.toLowerCase();
  let qi = 0;
  for (let i = 0; i < lower.length && qi < q.length; i++) {
    if (lower[i] === q[qi]) qi++;
  }
  return qi === q.length;
}

// =============================================================================
// Component
// =============================================================================

export function XDSCommandPalette({
  isOpen,
  onClose,
  items,
  placeholder = 'Search actions, pages, and more\u2026',
  isLoading = false,
}: XDSCommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const filteredItems = items.filter(
    item =>
      fuzzyMatch(item.label, query) ||
      (item.description != null && fuzzyMatch(item.description, query)),
  );

  const groups = filteredItems.reduce<Map<string, CommandPaletteItem[]>>(
    (acc, item) => {
      const group = item.group ?? 'Results';
      if (!acc.has(group)) acc.set(group, []);
      acc.get(group)!.push(item);
      return acc;
    },
    new Map(),
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex(i => Math.min(i + 1, filteredItems.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex(i => Math.max(i - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredItems[activeIndex] != null) {
          filteredItems[activeIndex].onSelect();
          onClose();
        }
      } else if (e.key === 'Escape') {
        onClose();
      }
    },
    [filteredItems, activeIndex, onClose],
  );

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  useEffect(() => {
    const el = listRef.current?.querySelector('[data-palette-active="true"]');
    el?.scrollIntoView({block: 'nearest'});
  }, [activeIndex]);

  if (!isOpen) return null;

  let flatIdx = 0;

  return (
    <XDSDialog
      isOpen={isOpen}
      onClose={onClose}
      purpose="info"
      style={{
        width: 560,
        maxWidth: '90vw',
        maxHeight: 480,
        padding: 0,
        marginInline: 'auto',
        top: 80,
        bottom: 'auto',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}>
      {/* Search row */}
      <div {...stylex.props(styles.searchContainer)}>
        <svg
          {...stylex.props(styles.searchIcon)}
          width={18}
          height={18}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        <input
          ref={inputRef}
          {...stylex.props(styles.input)}
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          aria-label="Command palette search"
          autoComplete="off"
          spellCheck={false}
        />
        <PaletteKbd>Esc</PaletteKbd>
      </div>

      {/* Results */}
      <div ref={listRef} {...stylex.props(styles.results)}>
        {isLoading ? (
          <div {...stylex.props(styles.loadingState)}>
            <XDSSpinner size="md" />
          </div>
        ) : filteredItems.length === 0 ? (
          <div {...stylex.props(styles.emptyState)}>
            <XDSText type="body" color="secondary">
              No results for &ldquo;{query}&rdquo;
            </XDSText>
            <XDSText type="supporting" color="tertiary">
              Try a different search term
            </XDSText>
          </div>
        ) : (
          Array.from(groups.entries()).map(([groupLabel, groupItems], gi) => (
            <div key={groupLabel}>
              {gi > 0 && <XDSDivider />}
              <div {...stylex.props(styles.groupLabel)}>
                <XDSText type="supporting" color="secondary" weight="semibold">
                  {groupLabel}
                </XDSText>
              </div>
              <div {...stylex.props(styles.itemWrapper)}>
                <XDSList>
                  {groupItems.map(item => {
                    const idx = flatIdx++;
                    const isActive = idx === activeIndex;
                    return (
                      <XDSListItem
                        key={item.id}
                        label={item.label}
                        description={item.description}
                        isSelected={isActive}
                        startContent={
                          item.icon != null ? (
                            <item.icon style={{width: 16, height: 16}} />
                          ) : undefined
                        }
                        endContent={
                          item.shortcut != null ? (
                            <div {...stylex.props(styles.shortcutBadge)}>
                              {item.shortcut.split('+').map(k => (
                                <PaletteKbd key={k}>{k}</PaletteKbd>
                              ))}
                            </div>
                          ) : undefined
                        }
                        onClick={() => {
                          item.onSelect();
                          onClose();
                        }}
                        data-palette-active={isActive ? 'true' : undefined}
                      />
                    );
                  })}
                </XDSList>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div {...stylex.props(styles.footer)}>
        <div {...stylex.props(styles.footerHint)}>
          <PaletteKbd>↑</PaletteKbd>
          <PaletteKbd>↓</PaletteKbd>
          <XDSText type="caption" color="tertiary">
            navigate
          </XDSText>
        </div>
        <div {...stylex.props(styles.footerHint)}>
          <PaletteKbd>↵</PaletteKbd>
          <XDSText type="caption" color="tertiary">
            select
          </XDSText>
        </div>
        <div {...stylex.props(styles.footerHint)}>
          <PaletteKbd>Esc</PaletteKbd>
          <XDSText type="caption" color="tertiary">
            close
          </XDSText>
        </div>
      </div>
    </XDSDialog>
  );
}
