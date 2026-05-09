/**
 * @file XDSCommonCommandPaletteProvider.test.tsx
 * @input Uses vitest, @testing-library/react, XDSCommonCommandPaletteProvider
 * @output Unit tests for common command palette provider async source support
 * @position Testing; validates XDSCommonCommandPaletteProvider.tsx implementation
 */

import {describe, it, expect, vi, beforeEach} from 'vitest';
import {render, screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  XDSCommonCommandPaletteProvider,
  useXDSCommonCommandPalette,
  type XDSCommonCommandPaletteAction,
} from './XDSCommonCommandPaletteProvider';
import type {XDSSearchSource} from '../Typeahead';

function OpenPaletteButton() {
  const {open} = useXDSCommonCommandPalette();
  return <button onClick={open}>Open palette</button>;
}

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

describe('XDSCommonCommandPaletteProvider', () => {
  it('opens static actions and runs the selected action', async () => {
    const onSelect = vi.fn();
    const user = userEvent.setup();

    render(
      <XDSCommonCommandPaletteProvider
        actions={[
          {
            id: 'report',
            label: 'Run report',
            group: 'Actions',
            onSelect,
          },
        ]}>
        <OpenPaletteButton />
      </XDSCommonCommandPaletteProvider>,
    );

    await user.click(screen.getByRole('button', {name: 'Open palette'}));

    await waitFor(() => {
      expect(screen.getByText('Actions')).toBeInTheDocument();
      expect(screen.getByText('Run report')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('option', {name: 'Run report'}));

    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it('passes the typed query to an async search source', async () => {
    const user = userEvent.setup();
    const search = vi.fn(async (query: string) => [
      {
        id: 'gap',
        label: `Server result for ${query}`,
      },
    ]);
    const source: XDSSearchSource<XDSCommonCommandPaletteAction> = {
      search,
      bootstrap: () => [],
    };

    render(
      <XDSCommonCommandPaletteProvider searchSource={source}>
        <OpenPaletteButton />
      </XDSCommonCommandPaletteProvider>,
    );

    await user.click(screen.getByRole('button', {name: 'Open palette'}));
    await user.type(screen.getByRole('combobox'), 'gap');

    await waitFor(() => {
      expect(search).toHaveBeenLastCalledWith('gap');
      expect(screen.getByText('Server result for gap')).toBeInTheDocument();
    });
  });
});
