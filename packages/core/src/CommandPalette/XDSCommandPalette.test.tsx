/**
 * @file XDSCommandPalette.test.tsx
 * @input Uses vitest, @testing-library/react, XDSCommandPalette
 * @output Unit tests for XDSCommandPalette dialog shell
 * @position Testing; validates XDSCommandPalette.tsx implementation
 */

import {describe, it, expect, vi, beforeEach} from 'vitest';
import {render, screen, waitFor} from '@testing-library/react';
import {XDSCommandPalette} from './XDSCommandPalette';
import {createStaticSource} from '@xds/core/Typeahead';

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

describe('XDSCommandPalette', () => {
  it('renders when isOpen is true', () => {
    render(
      <XDSCommandPalette
        isOpen={true}
        onOpenChange={() => {}}
        searchSource={simpleSource}
      />,
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('does not show content when isOpen is false', () => {
    render(
      <XDSCommandPalette
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
      <XDSCommandPalette
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
      <XDSCommandPalette
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
      <XDSCommandPalette
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
      <XDSCommandPalette
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
      <XDSCommandPalette
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
      <XDSCommandPalette
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
      <XDSCommandPalette
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
      <XDSCommandPalette
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
      <XDSCommandPalette
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
      <XDSCommandPalette
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
      <XDSCommandPalette
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
});
