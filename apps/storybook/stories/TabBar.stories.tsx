// Copyright (c) Meta Platforms, Inc. and affiliates.

import {useRef, useState, type RefObject} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {
  BookOpenIcon as BookOpenOutline,
  HomeIcon as HomeOutline,
  Squares2X2Icon as GridOutline,
  UserCircleIcon as UserOutline,
  BellIcon as BellOutline,
} from '@heroicons/react/24/outline';
import {
  BookOpenIcon as BookOpenSolid,
  HomeIcon as HomeSolid,
  Squares2X2Icon as GridSolid,
  UserCircleIcon as UserSolid,
  BellIcon as BellSolid,
} from '@heroicons/react/24/solid';
import {ForwardIcon, PauseIcon, PlayIcon} from '@heroicons/react/24/solid';
import {MagnifyingGlassIcon, XMarkIcon} from '@heroicons/react/24/outline';
import {
  TabBar,
  TabBarItem,
  TabBarSearchTab,
  type TabBarAccessoryPlacement,
} from '@astryxdesign/lab';
import {Button} from '@astryxdesign/core/Button';
import {Icon, type IconType} from '@astryxdesign/core/Icon';

// =============================================================================
// Meta
// =============================================================================

const meta: Meta<typeof TabBar> = {
  title: 'Lab/TabBar',
  component: TabBar,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof TabBar>;

// =============================================================================
// The sections UIKit's own captures were taken with: four tabs over long
// scrolling screens
// =============================================================================

interface Section {
  value: string;
  label: string;
  icon: IconType;
  selectedIcon: IconType;
}

const SECTIONS: Section[] = [
  {value: 'home', label: 'Home', icon: HomeOutline, selectedIcon: HomeSolid},
  {
    value: 'library',
    label: 'Library',
    icon: BookOpenOutline,
    selectedIcon: BookOpenSolid,
  },
  {
    value: 'browse',
    label: 'Browse',
    icon: GridOutline,
    selectedIcon: GridSolid,
  },
  {
    value: 'profile',
    label: 'Profile',
    icon: UserOutline,
    selectedIcon: UserSolid,
  },
];

const INBOX: Section = {
  value: 'inbox',
  label: 'Inbox',
  icon: BellOutline,
  selectedIcon: BellSolid,
};

/** A screen long enough to scroll under the bar. */
function Screen({title, reselects}: {title: string; reselects: number}) {
  return (
    <div style={{padding: '16px 16px 104px'}}>
      <h1 style={{margin: '8px 0 16px', fontSize: 28}}>{title}</h1>
      <p data-testid="reselects">Reselected {reselects} times</p>
      {Array.from({length: 40}, (_, i) => (
        <p key={i} style={{margin: 0, padding: '12px 0'}}>
          {title} row {i + 1}
        </p>
      ))}
    </div>
  );
}

function Bar({
  sections = SECTIONS,
  initial = 'home',
  badges = {library: 3},
  minimizeBehavior,
  bottomAccessory,
  hasSearch = false,
  disabled = [],
}: {
  sections?: Section[];
  initial?: string;
  badges?: Record<string, string | number>;
  minimizeBehavior?: 'never' | 'onScrollDown';
  bottomAccessory?: (placement: TabBarAccessoryPlacement) => React.ReactNode;
  hasSearch?: boolean;
  disabled?: string[];
}) {
  const [value, setValue] = useState(initial);
  const [reselects, setReselects] = useState(0);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const fieldRef = useRef<HTMLInputElement | null>(null);
  // Cancelling search returns to the tab it was chosen from.
  const lastTabRef = useRef(initial);
  if (value !== 'search') {
    lastTabRef.current = value;
  }
  const title =
    sections.find(section => section.value === value)?.label ??
    (value === 'search' ? 'Search' : '');
  return (
    <>
      <Screen title={title} reselects={reselects} />
      <TabBar
        value={value}
        onChange={setValue}
        onReselect={() => setReselects(n => n + 1)}
        label="Sections"
        minimizeBehavior={minimizeBehavior}
        bottomAccessory={bottomAccessory}
        data-testid="tab-bar">
        {sections.map(section => (
          <TabBarItem
            key={section.value}
            value={section.value}
            label={section.label}
            icon={<Icon icon={section.icon} size="lg" />}
            selectedIcon={<Icon icon={section.selectedIcon} size="lg" />}
            badge={badges[section.value]}
            isDisabled={disabled.includes(section.value)}
          />
        ))}
        {hasSearch ? (
          <TabBarSearchTab
            value="search"
            label="Search"
            icon={<Icon icon={MagnifyingGlassIcon} size="lg" />}
            isActive={isSearchActive}
            onActiveChange={setIsSearchActive}
            fieldRef={fieldRef}>
            <SearchPlaceholder
              fieldRef={fieldRef}
              isActive={isSearchActive}
              onActivate={() => setIsSearchActive(true)}
              onCancel={() => {
                setIsSearchActive(false);
                setValue(lastTabRef.current);
              }}
            />
          </TabBarSearchTab>
        ) : null}
      </TabBar>
    </>
  );
}

/** Four tabs, a badge on Library. Choosing Home again counts a reselect. */
export const Default: Story = {
  render: () => <Bar />,
};

/**
 * Scroll the page down under a finger: the bar collapses into a circle with
 * the selected icon. Scroll back to the top, or tap the circle, to expand it.
 */
export const MinimizeOnScroll: Story = {
  render: () => <Bar initial="library" minimizeBehavior="onScrollDown" />,
};

/** A now-playing bar for the bottom accessory; inline, it drops "Next". */
function NowPlaying({placement}: {placement: TabBarAccessoryPlacement}) {
  const [isPlaying, setIsPlaying] = useState(false);
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        width: '100%',
        padding: '0 8px 0 6px',
        boxSizing: 'border-box',
      }}>
      <div
        aria-hidden
        style={{
          width: 36,
          height: 36,
          flexShrink: 0,
          borderRadius: 8,
          background: 'linear-gradient(135deg, #f97316, #db2777)',
        }}
      />
      <div
        style={{
          flex: 1,
          minWidth: 0,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          fontSize: 14,
        }}>
        Midnight City
      </div>
      <Button
        label={isPlaying ? 'Pause' : 'Play'}
        variant="ghost"
        isIconOnly
        icon={<Icon icon={isPlaying ? PauseIcon : PlayIcon} />}
        onClick={() => setIsPlaying(playing => !playing)}
      />
      {placement === 'expanded' ? (
        <Button
          label="Next"
          variant="ghost"
          isIconOnly
          icon={<Icon icon={ForwardIcon} />}
        />
      ) : null}
    </div>
  );
}

/**
 * A bottom accessory above the bar. Scroll the page down under a finger: it
 * moves down inline beside the circle, and back up at the top.
 */
export const BottomAccessory: Story = {
  render: () => (
    <Bar
      initial="library"
      minimizeBehavior="onScrollDown"
      bottomAccessory={placement => <NowPlaying placement={placement} />}
    />
  ),
};

/**
 * A stand-in for a search field: the tab bar holds it inline while the search
 * tab is selected and widens it while it is active.
 */
function SearchPlaceholder({
  fieldRef,
  isActive,
  onActivate,
  onCancel,
}: {
  fieldRef: RefObject<HTMLInputElement | null>;
  isActive: boolean;
  onActivate: () => void;
  onCancel: () => void;
}) {
  const [query, setQuery] = useState('');
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        width: '100%',
        padding: '0 6px 0 16px',
        boxSizing: 'border-box',
      }}>
      <Icon icon={MagnifyingGlassIcon} size="md" />
      <input
        ref={fieldRef}
        value={query}
        onChange={event => setQuery(event.target.value)}
        onFocus={onActivate}
        placeholder="Search"
        aria-label="Search"
        style={{
          flex: 1,
          minWidth: 0,
          border: 0,
          outline: 'none',
          background: 'transparent',
          font: 'inherit',
          fontSize: 17,
        }}
      />
      {isActive ? (
        <Button
          label="Cancel"
          variant="ghost"
          isIconOnly
          icon={<Icon icon={XMarkIcon} />}
          onClick={onCancel}
        />
      ) : null}
    </div>
  );
}

/**
 * A search tab: a circle at the trailing end, apart from the tabs, which
 * share a narrower capsule. Choosing it collapses the bar to a circle with
 * the tab it was chosen from and raises its field; cancel returns to that
 * tab. Scroll down under a finger: both circles stay.
 */
export const SearchTab: Story = {
  render: () => (
    <Bar
      hasSearch
      minimizeBehavior="onScrollDown"
      bottomAccessory={placement => <NowPlaying placement={placement} />}
    />
  ),
};

/** Badges appear, change and disappear at once, as UIKit's do. */
function BadgesDemo() {
  const [count, setCount] = useState(0);
  const badge = count === 0 ? undefined : count > 99 ? '99+' : count;
  return (
    <>
      <div style={{padding: 16, display: 'flex', gap: 8}}>
        <Button label="Add one" onClick={() => setCount(n => n + 1)} />
        <Button label="Add ten" onClick={() => setCount(n => n + 10)} />
        <Button label="Clear" variant="secondary" onClick={() => setCount(0)} />
      </div>
      <TabBarHost badges={{inbox: badge ?? '', browse: '!'}} />
    </>
  );
}

function TabBarHost({badges}: {badges: Record<string, string | number>}) {
  const [value, setValue] = useState('home');
  return (
    <TabBar
      value={value}
      onChange={setValue}
      label="Sections"
      data-testid="tab-bar">
      {[SECTIONS[0], INBOX, SECTIONS[2], SECTIONS[3]].map(section => (
        <TabBarItem
          key={section.value}
          value={section.value}
          label={section.label}
          icon={<Icon icon={section.icon} size="lg" />}
          selectedIcon={<Icon icon={section.selectedIcon} size="lg" />}
          badge={badges[section.value]}
          badgeLabel={
            section.value === 'inbox' && badges.inbox !== ''
              ? `${badges.inbox} unread`
              : undefined
          }
        />
      ))}
    </TabBar>
  );
}

export const Badges: Story = {
  render: () => <BadgesDemo />,
};

/** Browse is disabled: dimmed, and a tap, the keys or the lens leave it unchosen. */
export const DisabledTab: Story = {
  render: () => <Bar disabled={['browse']} />,
};

/** Five tabs: the items overlap more, as they do on iOS. */
export const FiveTabs: Story = {
  render: () => (
    <Bar sections={[...SECTIONS.slice(0, 2), INBOX, ...SECTIONS.slice(2)]} />
  ),
};

/** Three tabs: the capsule narrows to its natural width and centres. */
export const ThreeTabs: Story = {
  render: () => <Bar sections={SECTIONS.slice(0, 3)} />,
};

/** Right to left: the first tab sits on the right and the badge on the icon's top-left. */
export const RightToLeft: Story = {
  render: () => (
    <div dir="rtl">
      <Bar initial="library" />
    </div>
  ),
};
