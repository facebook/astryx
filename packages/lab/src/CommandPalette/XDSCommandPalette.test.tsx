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
        input={<div>Input</div>}
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
        input={<div>Input</div>}
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
        input={<div>Input</div>}
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
        input={<div>Input</div>}
      />,
    );
    expect(screen.getByRole('dialog')).toHaveAttribute(
      'aria-label',
      'Quick search',
    );
  });

  it('renders input and footer slots', () => {
    render(
      <XDSCommandPalette
        isOpen={true}
        onOpenChange={() => {}}
        searchSource={simpleSource}
        input={<div data-testid="input-slot">Input</div>}
        footer={<div data-testid="footer-slot">Footer</div>}
      />,
    );
    expect(screen.getByTestId('input-slot')).toBeInTheDocument();
    expect(screen.getByTestId('footer-slot')).toBeInTheDocument();
  });

  it('renders without footer slot', () => {
    render(
      <XDSCommandPalette
        isOpen={true}
        onOpenChange={() => {}}
        searchSource={simpleSource}
        input={<div>Input</div>}
      />,
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('default renders items from searchSource bootstrap', async () => {
    render(
      <XDSCommandPalette
        isOpen={true}
        onOpenChange={() => {}}
        searchSource={simpleSource}
        input={<div>Input</div>}
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
        input={<div>Input</div>}
      />,
    );
    await waitFor(() => {
      expect(screen.getByText('Navigation')).toBeInTheDocument();
      expect(screen.getByText('Actions')).toBeInTheDocument();
      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('Save')).toBeInTheDocument();
    });
  });

  it('uses render function children when provided', async () => {
    render(
      <XDSCommandPalette
        isOpen={true}
        onOpenChange={() => {}}
        searchSource={simpleSource}
        input={<div>Input</div>}>
        {(items) => (
          <div data-testid="custom-render">
            {items.map(item => (
              <span key={item.id}>{item.label.toUpperCase()}</span>
            ))}
          </div>
        )}
      </XDSCommandPalette>,
    );
    await waitFor(() => {
      expect(screen.getByTestId('custom-render')).toBeInTheDocument();
      expect(screen.getByText('HOME')).toBeInTheDocument();
      expect(screen.getByText('SETTINGS')).toBeInTheDocument();
    });
  });

  it('calls onOpenChange(false) when Escape is pressed', () => {
    const handleOpenChange = vi.fn();
    render(
      <XDSCommandPalette
        isOpen={true}
        onOpenChange={handleOpenChange}
        searchSource={simpleSource}
        input={<div>Input</div>}
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
