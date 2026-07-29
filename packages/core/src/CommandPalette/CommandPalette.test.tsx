// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file CommandPalette.test.tsx
 * @input Uses vitest, @testing-library/react, CommandPalette
 * @output Unit tests for CommandPalette dialog shell
 * @position Testing; validates CommandPalette.tsx implementation
 */

import {describe, it, expect, vi, beforeEach} from 'vitest';
import {render, screen, waitFor, fireEvent} from '@testing-library/react';
import {CommandPalette} from './CommandPalette';
import {createStaticSource} from '@astryxdesign/core/Typeahead';
import type {SearchSource, SearchableItem} from '@astryxdesign/core/Typeahead';

const simpleSource = createStaticSource([
  {id: 'home', label: 'Home'},
  {id: 'settings', label: 'Settings'},
]);

const groupedSource = createStaticSource([
  {id: 'home', label: 'Home', auxiliaryData: {group: 'Navigation'}},
  {id: 'save', label: 'Save', auxiliaryData: {group: 'Actions'}},
]);

const emptySource = createStaticSource([]);

// Mock showModal and close since jsdom doesn't implement them
beforeEach(() => {
  HTMLDialogElement.prototype.showModal = vi.fn(function (
    this: HTMLDialogElement,
  ) {
    this.setAttribute('open', '');
  });
  HTMLDialogElement.prototype.close = vi.fn(function (this: HTMLDialogElement) {
    this.removeAttribute('open');
  });
});

describe('CommandPalette', () => {
  it('renders when isOpen is true', () => {
    render(
      <CommandPalette
        isOpen={true}
        onOpenChange={() => {}}
        searchSource={simpleSource}
      />,
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('does not show content when isOpen is false', () => {
    render(
      <CommandPalette
        isOpen={false}
        onOpenChange={() => {}}
        searchSource={simpleSource}
      />,
    );
    const dialog = screen.getByRole('dialog', {hidden: true});
    expect(dialog).not.toHaveAttribute('open');
  });

  it('has correct aria-label', () => {
    render(
      <CommandPalette
        isOpen={true}
        onOpenChange={() => {}}
        searchSource={simpleSource}
      />,
    );
    expect(screen.getByRole('dialog')).toHaveAttribute(
      'aria-label',
      'Command palette',
    );
  });

  it('supports custom label', () => {
    render(
      <CommandPalette
        isOpen={true}
        onOpenChange={() => {}}
        searchSource={simpleSource}
        label="Quick search"
      />,
    );
    expect(screen.getByRole('dialog')).toHaveAttribute(
      'aria-label',
      'Quick search',
    );
  });

  it('renders default input and footer when not provided', () => {
    render(
      <CommandPalette
        isOpen={true}
        onOpenChange={() => {}}
        searchSource={simpleSource}
      />,
    );
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getByText(/Navigate/)).toBeInTheDocument();
  });

  it('renders custom input and footer slots', () => {
    render(
      <CommandPalette
        isOpen={true}
        onOpenChange={() => {}}
        searchSource={simpleSource}
        input={<div data-testid="input-slot">Custom Input</div>}
        footer={<div data-testid="footer-slot">Custom Footer</div>}
      />,
    );
    expect(screen.getByTestId('input-slot')).toBeInTheDocument();
    expect(screen.getByTestId('footer-slot')).toBeInTheDocument();
  });

  it('default renders items from searchSource bootstrap', async () => {
    render(
      <CommandPalette
        isOpen={true}
        onOpenChange={() => {}}
        searchSource={simpleSource}
      />,
    );
    await waitFor(() => {
      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('Settings')).toBeInTheDocument();
    });
  });

  it('auto-groups items by auxiliaryData.group', async () => {
    render(
      <CommandPalette
        isOpen={true}
        onOpenChange={() => {}}
        searchSource={groupedSource}
      />,
    );
    await waitFor(() => {
      expect(screen.getByText('Navigation')).toBeInTheDocument();
      expect(screen.getByText('Actions')).toBeInTheDocument();
      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('Save')).toBeInTheDocument();
    });
  });

  it('uses renderItem for custom item content', async () => {
    render(
      <CommandPalette
        isOpen={true}
        onOpenChange={() => {}}
        searchSource={simpleSource}
        renderItem={item => <span>{item.label.toUpperCase()}</span>}
      />,
    );
    await waitFor(() => {
      expect(screen.getByText('HOME')).toBeInTheDocument();
      expect(screen.getByText('SETTINGS')).toBeInTheDocument();
    });
  });

  it('passes isSelected=true to renderItem for the selected value', async () => {
    render(
      <CommandPalette
        isOpen={true}
        onOpenChange={() => {}}
        searchSource={simpleSource}
        value="home"
        renderItem={(item, isSelected) => (
          <span>{isSelected ? `checked-${item.label}` : item.label}</span>
        )}
      />,
    );
    await waitFor(() => {
      expect(screen.getByText('checked-Home')).toBeInTheDocument();
      expect(screen.getByText('Settings')).toBeInTheDocument();
    });
  });

  it('shows emptyBootstrapText when bootstrap returns nothing', async () => {
    render(
      <CommandPalette
        isOpen={true}
        onOpenChange={() => {}}
        searchSource={emptySource}
        emptyBootstrapText="Nothing to show"
      />,
    );
    await waitFor(() => {
      expect(screen.getByText('Nothing to show')).toBeInTheDocument();
    });
  });

  it('shows default emptyBootstrapText when not provided', async () => {
    render(
      <CommandPalette
        isOpen={true}
        onOpenChange={() => {}}
        searchSource={emptySource}
      />,
    );
    await waitFor(() => {
      expect(screen.getByText('Type to search')).toBeInTheDocument();
    });
  });

  it('calls onOpenChange(false) when Escape is pressed', () => {
    const handleOpenChange = vi.fn();
    render(
      <CommandPalette
        isOpen={true}
        onOpenChange={handleOpenChange}
        searchSource={simpleSource}
      />,
    );
    const dialog = screen.getByRole('dialog');
    const escapeEvent = new KeyboardEvent('keydown', {
      key: 'Escape',
      bubbles: true,
      cancelable: true,
    });
    dialog.dispatchEvent(escapeEvent);
    expect(handleOpenChange).toHaveBeenCalledWith(false);
  });

  it('keeps the empty state mounted while a no-result search is pending', async () => {
    // A source whose searches resolve only when we release them, so we can
    // observe the render output while a search transition is in flight.
    const resolvers: ((items: SearchableItem[]) => void)[] = [];
    const source: SearchSource = {
      bootstrap: () => [],
      async search(): Promise<SearchableItem[]> {
        return new Promise<SearchableItem[]>(resolve => {
          resolvers.push(resolve);
        });
      },
    };

    render(
      <CommandPalette
        isOpen={true}
        onOpenChange={() => {}}
        searchSource={source}
        emptyBootstrapText="Type to search"
        emptySearchText="No results"
      />,
    );

    const input = screen.getByRole('combobox');

    // First search: commits an empty result for query "z".
    fireEvent.change(input, {target: {value: 'z'}});
    await waitFor(() => expect(resolvers).toHaveLength(1));
    resolvers[0]([]);
    await waitFor(() =>
      expect(screen.getByText('No results')).toBeInTheDocument(),
    );

    // Second keystroke while already empty: the empty state must remain in the
    // DOM for the whole pending window — no unmount/remount flash.
    fireEvent.change(input, {target: {value: 'zz'}});
    expect(screen.getByText('No results')).toBeInTheDocument();
    await waitFor(() => expect(resolvers).toHaveLength(2));
    expect(screen.getByText('No results')).toBeInTheDocument();
    resolvers[1]([]);
    await waitFor(() =>
      expect(screen.getByText('No results')).toBeInTheDocument(),
    );
  });

  it('does not move the highlight while typing in the search input', async () => {
    // The palette's input already filters; letting the shared combobox
    // typeahead also chase prefixes would drag the highlight — and Enter —
    // onto a command the user never picked.
    const gitSource = createStaticSource([
      {id: 'git-add', label: 'git add'},
      {id: 'git-commit', label: 'git commit'},
      {id: 'git-push', label: 'git push'},
    ]);
    render(
      <CommandPalette
        isOpen={true}
        onOpenChange={() => {}}
        searchSource={gitSource}
      />,
    );

    const input = screen.getByRole('combobox');
    await waitFor(() =>
      expect(screen.getByText('git add')).toBeInTheDocument(),
    );

    fireEvent.keyDown(input, {key: 'g'});
    fireEvent.keyDown(input, {key: 'i'});
    fireEvent.keyDown(input, {key: 't'});

    expect(input).not.toHaveAttribute('aria-activedescendant');
  });
});
