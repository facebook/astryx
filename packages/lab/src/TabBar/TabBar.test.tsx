// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file TabBar.test.tsx
 * @input vitest, @testing-library/react, TabBar and TabBarItem
 * @output jsdom coverage of the tab bar's semantics and state: a named
 *   tablist of tabs with one selected, the roving tab stop and arrow keys,
 *   choosing a tab (onChange) and choosing the selected one again
 *   (onReselect), badges in the tab's name and drawn without animation, the
 *   lens over the selected tab only, and the stable theme classes
 * @position Testing; the motion is proven in real engines by
 *   __tests__/TabBar.interaction.browser.spec.ts
 */

import {describe, expect, it, vi} from 'vitest';
import {useState} from 'react';
import {fireEvent, render, screen} from '@testing-library/react';
import {TabBar, TabBarItem, type TabBarProps} from './TabBar';

function Glyph({name}: {name: string}) {
  return <svg data-testid={`icon-${name}`} />;
}

function Bar({
  initial = 'home',
  onReselect,
  onChange,
  badges = {},
  ...props
}: Partial<TabBarProps> & {
  initial?: string;
  badges?: Record<string, string | number | undefined>;
}) {
  const [value, setValue] = useState(initial);
  return (
    <TabBar
      value={value}
      onChange={next => {
        setValue(next);
        onChange?.(next);
      }}
      onReselect={onReselect}
      label="Sections"
      data-testid="bar"
      {...props}>
      <TabBarItem value="home" label="Home" icon={<Glyph name="home" />} />
      <TabBarItem
        value="library"
        label="Library"
        icon={<Glyph name="library" />}
        badge={badges.library}
      />
      <TabBarItem
        value="browse"
        label="Browse"
        icon={<Glyph name="browse" />}
        badge={badges.browse}
        badgeLabel="New items"
      />
      <TabBarItem
        value="profile"
        label="Profile"
        icon={<Glyph name="profile" />}
      />
    </TabBar>
  );
}

describe('TabBar', () => {
  it('is a named tablist of tabs with the selected one marked', () => {
    render(<Bar initial="library" />);
    const list = screen.getByRole('tablist', {name: 'Sections'});
    expect(list).toBeInTheDocument();
    const tabs = screen.getAllByRole('tab');
    expect(tabs.map(tab => tab.textContent)).toEqual([
      'Home',
      'Library',
      'Browse',
      'Profile',
    ]);
    expect(screen.getByRole('tab', {name: 'Library'})).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(screen.getByRole('tab', {name: 'Home'})).toHaveAttribute(
      'aria-selected',
      'false',
    );
  });

  it('chooses another tab with onChange and moves the selection', () => {
    const onChange = vi.fn();
    const onReselect = vi.fn();
    render(<Bar onChange={onChange} onReselect={onReselect} />);
    fireEvent.click(screen.getByRole('tab', {name: 'Browse'}));
    expect(onChange).toHaveBeenCalledWith('browse');
    expect(onReselect).not.toHaveBeenCalled();
    expect(screen.getByRole('tab', {name: 'Browse'})).toHaveAttribute(
      'aria-selected',
      'true',
    );
  });

  it('reports choosing the selected tab again as a reselect, not a change', () => {
    const onChange = vi.fn();
    const onReselect = vi.fn();
    render(<Bar onChange={onChange} onReselect={onReselect} />);
    fireEvent.click(screen.getByRole('tab', {name: 'Home'}));
    expect(onReselect).toHaveBeenCalledWith('home');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('has one tab stop, on the selected tab, and arrow keys move between tabs', () => {
    render(<Bar initial="library" />);
    const tabs = screen.getAllByRole('tab');
    expect(tabs.map(tab => tab.tabIndex)).toEqual([-1, 0, -1, -1]);
    tabs[1].focus();
    fireEvent.keyDown(tabs[1], {key: 'ArrowRight'});
    expect(document.activeElement).toBe(tabs[2]);
    fireEvent.keyDown(tabs[2], {key: 'End'});
    expect(document.activeElement).toBe(tabs[3]);
    fireEvent.keyDown(tabs[3], {key: 'Home'});
    expect(document.activeElement).toBe(tabs[0]);
    // Moving focus does not choose a tab: Enter or Space does.
    expect(tabs[1]).toHaveAttribute('aria-selected', 'true');
  });

  it('puts a badge in its tab’s name and draws it at once', () => {
    const {rerender} = render(<Bar badges={{library: 3}} />);
    expect(
      screen.getByRole('tab', {name: /^Library\s*, 3$/}),
    ).toBeInTheDocument();
    const badge = () =>
      document.querySelector('[data-tab-bar-badge="library"]');
    expect(badge()).toHaveTextContent('3');
    // Changing or clearing the badge updates it in the same render.
    rerender(<Bar badges={{library: '12'}} />);
    expect(badge()).toHaveTextContent('12');
    expect(
      screen.getByRole('tab', {name: /^Library\s*, 12$/}),
    ).toBeInTheDocument();
    rerender(<Bar badges={{library: ''}} />);
    expect(badge()).toBeNull();
    expect(screen.getByRole('tab', {name: 'Library'})).toBeInTheDocument();
  });

  it('reads a badge’s label instead of the badge when given one', () => {
    render(<Bar badges={{browse: '!'}} />);
    expect(
      screen.getByRole('tab', {name: /^Browse\s*, New items$/}),
    ).toBeInTheDocument();
  });

  it('keeps the badges, the lens and its copy of the items out of the accessibility tree', () => {
    render(<Bar badges={{library: 3}} />);
    const lens = document.querySelector('[data-tab-bar-lens]');
    expect(lens).toHaveAttribute('aria-hidden', 'true');
    const badge = document.querySelector('[data-tab-bar-badge="library"]');
    expect(badge?.closest('[aria-hidden="true"]')).not.toBeNull();
    // The selected look of every item lives inside the lens.
    expect(lens?.querySelectorAll('[data-testid^="icon-"]')).toHaveLength(4);
  });

  it('draws the lens only while a tab is selected', () => {
    const {rerender} = render(
      <TabBar value="none" onChange={() => {}}>
        <TabBarItem value="a" label="A" icon={null} />
        <TabBarItem value="b" label="B" icon={null} />
      </TabBar>,
    );
    expect(document.querySelector('[data-tab-bar-lens]')).toBeNull();
    // With nothing selected the first tab keeps the tab stop.
    expect(screen.getAllByRole('tab').map(tab => tab.tabIndex)).toEqual([
      0, -1,
    ]);
    rerender(
      <TabBar value="b" onChange={() => {}}>
        <TabBarItem value="a" label="A" icon={null} />
        <TabBarItem value="b" label="B" icon={null} />
      </TabBar>,
    );
    expect(document.querySelector('[data-tab-bar-lens]')).not.toBeNull();
  });

  it('shows the selected icon in the lens when one is given', () => {
    render(
      <TabBar value="a" onChange={() => {}}>
        <TabBarItem
          value="a"
          label="A"
          icon={<Glyph name="outline" />}
          selectedIcon={<Glyph name="filled" />}
        />
      </TabBar>,
    );
    const lens = document.querySelector('[data-tab-bar-lens]');
    expect(lens?.querySelector('[data-testid="icon-filled"]')).not.toBeNull();
    expect(lens?.querySelector('[data-testid="icon-outline"]')).toBeNull();
    // The plain copy keeps the outline icon.
    expect(
      screen
        .getByRole('tab', {name: 'A'})
        .querySelector('[data-testid="icon-outline"]'),
    ).not.toBeNull();
  });

  it('carries the stable theme classes and the selected state', () => {
    render(<Bar initial="browse" />);
    expect(screen.getByTestId('bar')).toHaveClass('astryx-tab-bar');
    const browse = screen.getByRole('tab', {name: 'Browse'});
    expect(browse).toHaveClass('astryx-tab-bar-item');
    expect(browse).toHaveAttribute('data-selected', 'selected');
    expect(screen.getByRole('tab', {name: 'Home'})).not.toHaveAttribute(
      'data-selected',
    );
  });

  it('ignores children that are not TabBarItem', () => {
    render(
      <TabBar value="a" onChange={() => {}}>
        <TabBarItem value="a" label="A" icon={null} />
        {null}
        <span>stray</span>
      </TabBar>,
    );
    expect(screen.getAllByRole('tab')).toHaveLength(1);
    expect(screen.queryByText('stray')).toBeNull();
  });
});
