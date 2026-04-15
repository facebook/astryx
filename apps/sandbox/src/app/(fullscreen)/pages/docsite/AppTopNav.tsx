'use client';

import React, {useState, useEffect} from 'react';
import {XDSTabList, XDSTab} from '@xds/core/TabList';
import {XDSText} from '@xds/core/Text';
import {XDSButton} from '@xds/core/Button';
import {XDSToken} from '@xds/core/Token';
import {XDSList, XDSListItem} from '@xds/core/List';
import {XDSTextInput} from '@xds/core/TextInput';
import {XDSDropdownMenu} from '@xds/core/DropdownMenu';
import {XDSCommandPalette} from '@xds/core/CommandPalette';
import {SearchIcon, ProfileIcon, FilterIcon, SortIcon} from './docsite-icons';
import {SEARCH_COMMANDS, FILTER_COLUMNS} from './constants';
import LogoNav from './LogoNav';

export function AppTopNav({
  activeView,
  setActiveView,
  scrollContainerRef,
  templateFilter,
  onTemplateFilterChange,
  templateAuthors,
  activeFilters,
  onToggleFilter,
  onClearFilters,
  sortOption,
  onSortChange,
  craftTitle,
}: {
  activeView: 'craft' | 'explore' | 'docs' | 'profile';
  setActiveView: (view: 'craft' | 'explore' | 'docs' | 'profile') => void;
  scrollContainerRef?: React.RefObject<HTMLDivElement | null>;
  templateFilter?: 'all' | 'official' | string;
  onTemplateFilterChange?: (filter: 'all' | 'official' | string) => void;
  templateAuthors?: string[];
  activeFilters?: Set<string>;
  onToggleFilter?: (filter: string) => void;
  onClearFilters?: () => void;
  sortOption?: string;
  onSortChange?: (option: string) => void;
  craftTitle?: string | null;
}) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [authorSearch, setAuthorSearch] = useState('');
  const hasActiveFilters = activeFilters && activeFilters.size > 0;

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = scrollContainerRef?.current
        ? scrollContainerRef.current.scrollTop
        : window.scrollY;
      setIsScrolled(scrollTop > 120);
    };
    const target = scrollContainerRef?.current ?? window;
    target.addEventListener('scroll', handleScroll, {passive: true});
    return () => target.removeEventListener('scroll', handleScroll);
  }, [scrollContainerRef]);

  return (
    <>
      {/* Top nav bar — becomes combined bar when scrolled */}
      <nav
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: 48,
          padding: '0 16px 0 24px',
          backgroundColor: 'var(--color-background-surface, white)',
          position: 'sticky',
          top: 0,
          zIndex: 11,
          transition:
            'box-shadow 300ms var(--ease-standard, cubic-bezier(0.24, 1, 0.4, 1))',
          boxShadow:
            isScrolled && !isFilterOpen
              ? '0 1px 3px rgba(0,0,0,0.08)'
              : 'none',
        }}>
        {/* Left: logo nav */}
        <div style={{display: 'flex', alignItems: 'center', gap: 8, flex: 1}}>
          <LogoNav activeView={activeView} setActiveView={setActiveView} />
        </div>

        {/* Center: tabs (slide in when scrolled) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: isScrolled ? 1 : 0,
            transform: isScrolled ? 'translateY(0)' : 'translateY(-8px)',
            transition:
              'opacity 300ms var(--ease-standard, cubic-bezier(0.24, 1, 0.4, 1)), transform 300ms var(--ease-standard, cubic-bezier(0.24, 1, 0.4, 1))',
            pointerEvents: isScrolled ? ('auto' as const) : ('none' as const),
          }}>
          <XDSTabList value={activeTab} onChange={setActiveTab} size="sm">
            <XDSTab value="all" label="All" />
            <XDSTab value="templates" label="Templates" />
            <XDSTab value="theme" label="Theme" />
            <XDSTab value="components" label="Components" />
          </XDSTabList>
        </div>

        {/* Right: search + profile */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            flex: 1,
            justifyContent: 'flex-end',
          }}>
          {isScrolled && (
            <>
              <XDSButton
                label="Filter"
                variant="ghost"
                size="sm"
                isIconOnly
                icon={<FilterIcon />}
                onClick={() => setIsFilterOpen(!isFilterOpen)}
              />
              <XDSDropdownMenu
                button={{label: sortOption === 'trending' ? 'Most popular' : sortOption === 'newest' ? 'Newest first' : 'Oldest first', variant: 'ghost', size: 'sm'}}
                items={[
                  {label: 'Most popular', onClick: () => onSortChange?.('trending')},
                  {label: 'Newest first', onClick: () => onSortChange?.('newest')},
                  {label: 'Oldest first', onClick: () => onSortChange?.('oldest')},
                ]}
              />
            </>
          )}
          <XDSButton
            label="Search"
            variant="ghost"
            size="sm"
            isIconOnly
            icon={<SearchIcon />}
            onClick={() => setIsSearchOpen(true)}
          />
          <XDSButton
            label="Profile"
            variant="ghost"
            size="sm"
            isIconOnly
            icon={<ProfileIcon />}
            onClick={() => setActiveView('profile')}
          />
        </div>
      </nav>

      {/* Hero section — collapses when scrolled or on results page */}
      {!craftTitle && (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '16px 16px 48px',
          maxHeight: isScrolled ? 0 : 200,
          overflow: 'hidden',
          opacity: isScrolled ? 0 : 1,
          transition:
            'max-height 300ms ease, opacity 200ms ease, padding 300ms ease',
          ...(isScrolled ? {padding: 0} : {}),
        }}>
        <div style={{textAlign: 'center'}}>
          <XDSText type="display-1">Craft what you imagine.</XDSText>
        </div>
      </div>
      )}

      {/* Tabs row — collapses when scrolled or on results page */}
      {!craftTitle && (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr',
          alignItems: 'center',
          padding: '0 16px 8px',
          position: 'sticky',
          top: 48,
          zIndex: 10,
          backgroundColor: 'var(--color-background-card, white)',
          maxHeight: isScrolled ? 0 : 60,
          overflow: 'hidden',
          opacity: isScrolled ? 0 : 1,
          transition:
            'max-height 300ms ease, opacity 200ms ease, padding 300ms ease',
          ...(isScrolled ? {padding: 0} : {}),
        }}>
        <div />
        <XDSTabList value={activeTab} onChange={setActiveTab} size="sm">
          <XDSTab value="all" label="All" />
          <XDSTab value="templates" label="Templates" />
          <XDSTab value="theme" label="Theme" />
          <XDSTab value="components" label="Components" />
        </XDSTabList>
        <div style={{justifySelf: 'end', display: 'flex', gap: 4}}>
          <XDSButton
            label="Filter"
            variant="ghost"
            size="sm"
            isIconOnly
            icon={<FilterIcon />}
            onClick={() => setIsFilterOpen(!isFilterOpen)}
          />
          <XDSDropdownMenu
            button={{label: sortOption === 'trending' ? 'Most popular' : sortOption === 'newest' ? 'Newest first' : 'Oldest first', variant: 'ghost', size: 'sm'}}
            items={[
              {label: 'Most popular', onClick: () => onSortChange?.('trending')},
              {label: 'Newest first', onClick: () => onSortChange?.('newest')},
              {label: 'Oldest first', onClick: () => onSortChange?.('oldest')},
            ]}
          />
        </div>
      </div>
      )}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isFilterOpen
            ? '1fr 1fr 1fr 1fr'
            : '1fr 1fr 1fr 1fr',
          gap: isFilterOpen ? 24 : 0,
          boxShadow:
            isFilterOpen && isScrolled
              ? '0 1px 3px rgba(0,0,0,0.08)'
              : 'none',
          padding: isFilterOpen ? '24px 40px' : '0 40px',
          maxHeight: isFilterOpen ? 400 : 0,
          overflow: 'hidden',
          opacity: isFilterOpen ? 1 : 0,
          transition:
            'max-height var(--duration-medium, 410ms) var(--ease-standard, cubic-bezier(0.24, 1, 0.4, 1)), opacity var(--duration-fast, 175ms) var(--ease-standard, cubic-bezier(0.24, 1, 0.4, 1)), padding var(--duration-medium, 410ms) var(--ease-standard, cubic-bezier(0.24, 1, 0.4, 1)), gap var(--duration-medium, 410ms) var(--ease-standard, cubic-bezier(0.24, 1, 0.4, 1))',
        }}>
        {/* Source filter */}
        <div>
          <XDSText
            type="supporting"
            color="secondary"
            style={{
              marginBottom: 12,
              display: 'block',
            }}>
            Source
          </XDSText>
          <div style={{marginLeft: -8, marginRight: -8}}>
            <XDSList density="compact">
              <XDSListItem
                label="All"
                isSelected={templateFilter === 'all'}
                onClick={() => {
                  onTemplateFilterChange?.('all');
                  setAuthorSearch('');
                }}
              />
              <XDSListItem
                label="XDS Official"
                isSelected={templateFilter === 'official'}
                onClick={() => {
                  onTemplateFilterChange?.('official');
                  setAuthorSearch('');
                }}
              />
            </XDSList>
          </div>
          <div style={{marginTop: 12}}>
            <XDSTextInput
              label="Author"
              isLabelHidden
              placeholder="Search by author..."
              value={authorSearch}
              onChange={v => {
                setAuthorSearch(v);
                if (v.trim()) {
                  onTemplateFilterChange?.(v.trim());
                } else {
                  onTemplateFilterChange?.('all');
                }
              }}
              size="sm"
            />
          </div>
        </div>
        {FILTER_COLUMNS.map(col => (
          <div key={col.heading}>
            <XDSText
              type="supporting"
              color="secondary"
              style={{
                marginBottom: 12,
                display: 'block',
              }}>
              {col.heading}
            </XDSText>
            <div style={{marginLeft: -8, marginRight: -8}}>
              <XDSList density="compact">
                {col.items.map(item => (
                  <XDSListItem
                    key={item}
                    label={item}
                    isSelected={activeFilters?.has(item)}
                    onClick={() => onToggleFilter?.(item)}
                  />
                ))}
              </XDSList>
            </div>
          </div>
        ))}
      </div>

      {/* Active filter chips — shown only when filters are active */}
      {hasActiveFilters && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 24px',
            flexWrap: 'wrap',
          }}>
          {Array.from(activeFilters).map(filter => (
            <XDSToken
              key={filter}
              label={filter}
              onRemove={() => onToggleFilter?.(filter)}
            />
          ))}
          <button
            onClick={onClearFilters}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              padding: '4px 8px', font: 'inherit',
            }}>
            <XDSText type="supporting" color="secondary">Clear all</XDSText>
          </button>
        </div>
      )}

      <XDSCommandPalette
        isOpen={isSearchOpen}
        onOpenChange={setIsSearchOpen}
        searchSource={SEARCH_COMMANDS}
        label="Search templates and components"
      />
    </>
  );
}
