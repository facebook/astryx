// Copyright (c) Meta Platforms, Inc. and affiliates.

import {useRef, useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {
  BookOpenIcon as BookOpenOutline,
  HomeIcon as HomeOutline,
  Squares2X2Icon as GridOutline,
  UserCircleIcon as UserOutline,
  BellIcon as BellOutline,
  Cog6ToothIcon as CogOutline,
  QuestionMarkCircleIcon as HelpOutline,
} from '@heroicons/react/24/outline';
import {
  BookOpenIcon as BookOpenSolid,
  HomeIcon as HomeSolid,
  Squares2X2Icon as GridSolid,
  UserCircleIcon as UserSolid,
  BellIcon as BellSolid,
  Cog6ToothIcon as CogSolid,
  QuestionMarkCircleIcon as HelpSolid,
} from '@heroicons/react/24/solid';
import {ForwardIcon, PauseIcon, PlayIcon} from '@heroicons/react/24/solid';
import {MagnifyingGlassIcon} from '@heroicons/react/24/outline';
import {
  TabBar,
  TabBarItem,
  TabBarMoreList,
  TabBarSearchTab,
  SearchField,
  type SearchFieldHandle,
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
  const fieldRef = useRef<SearchFieldHandle | null>(null);
  const [query, setQuery] = useState('');
  // Cancelling search returns to the tab it was chosen from.
  const lastTabRef = useRef(initial);
  if (value !== 'search') {
    lastTabRef.current = value;
  }
  // Cancelling search returns to the tab it was chosen from.
  const setSearchActive = (isActive: boolean) => {
    setIsSearchActive(isActive);
    if (!isActive) {
      setValue(lastTabRef.current);
    }
  };
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
            onActiveChange={setSearchActive}
            fieldRef={fieldRef}>
            <SearchField
              placement="tab"
              label="Search"
              placeholder="Search"
              value={query}
              onChange={setQuery}
              isActive={isSearchActive}
              onActiveChange={setSearchActive}
              handleRef={fieldRef}
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
 * A search tab: a circle at the trailing end, apart from the tabs, which
 * share a narrower capsule. Choosing it collapses the bar to a circle with
 * the tab it was chosen from and raises its field above the keyboard, the
 * search circle riding with it as the cancel button, which returns to that
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

/** Six sections: the four the bar holds, then two that overflow into More. */
const SIX: Section[] = [
  ...SECTIONS,
  {
    value: 'settings',
    label: 'Settings',
    icon: CogOutline,
    selectedIcon: CogSolid,
  },
  {value: 'help', label: 'Help', icon: HelpOutline, selectedIcon: HelpSolid},
];

function MoreDemo() {
  const [value, setValue] = useState('home');
  const [reselects, setReselects] = useState(0);
  const tabs = SIX.map(section => (
    <TabBarItem
      key={section.value}
      value={section.value}
      label={section.label}
      icon={<Icon icon={section.icon} size="lg" />}
      selectedIcon={<Icon icon={section.selectedIcon} size="lg" />}
    />
  ));
  const inMore = SIX.slice(4).find(section => section.value === value);
  return (
    <>
      {value === 'more' ? (
        <div style={{padding: '16px 16px 104px'}}>
          <h1 style={{margin: '8px 0 16px', fontSize: 28}}>More</h1>
          <TabBarMoreList value={value} onChoose={setValue}>
            {tabs}
          </TabBarMoreList>
        </div>
      ) : inMore != null ? (
        <div style={{padding: '16px 16px 104px'}}>
          <Button
            label="More"
            variant="ghost"
            onClick={() => setValue('more')}
          />
          <h1 style={{margin: '8px 0 16px', fontSize: 28}}>{inMore.label}</h1>
        </div>
      ) : (
        <Screen
          title={SIX.find(section => section.value === value)?.label ?? ''}
          reselects={reselects}
        />
      )}
      <TabBar
        value={value}
        onChange={setValue}
        onReselect={reselected => {
          // More again returns to its list, as iOS pops More's stack.
          if (reselected === 'more') {
            setValue('more');
          } else {
            setReselects(n => n + 1);
          }
        }}
        label="Sections"
        data-testid="tab-bar">
        {tabs}
      </TabBar>
    </>
  );
}

/**
 * Six tabs: the bar shows the first four and More, whose list holds the
 * rest. A section chosen there opens inside More, which stays selected;
 * More again returns to the list.
 */
export const MoreTab: Story = {
  render: () => <MoreDemo />,
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
