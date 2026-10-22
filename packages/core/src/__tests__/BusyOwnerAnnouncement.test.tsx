// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file BusyOwnerAnnouncement.test.tsx
 * @input Uses vitest, @testing-library/react, and the busy controls under test
 * @output Pins spec:AST-086 FR8 and FR6 for controls that show a busy Spinner
 * @position Shared contract test: the composed Spinner is silent and the
 *   owning control announces each busy start once through the shared channel
 */

import {StrictMode, type ReactElement} from 'react';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {act, render, screen} from '@testing-library/react';
import {TextInput} from '../TextInput';
import {TextArea} from '../TextArea';
import {Selector} from '../Selector';
import {MultiSelector} from '../MultiSelector';

const announce = vi.fn();
vi.mock('../hooks/useAnnounce', async importOriginal => ({
  ...(await importOriginal<typeof import('../hooks/useAnnounce')>()),
  useAnnounce: () => announce,
}));

const OPTIONS = [
  {label: 'Apple', value: 'apple'},
  {label: 'Banana', value: 'banana'},
];

const OWNERS: ReadonlyArray<
  readonly [string, (isLoading: boolean) => ReactElement]
> = [
  [
    'TextInput',
    isLoading => (
      <TextInput
        label="Email"
        value=""
        onChange={() => {}}
        isLoading={isLoading}
      />
    ),
  ],
  [
    'TextArea',
    isLoading => (
      <TextArea
        label="Notes"
        value=""
        onChange={() => {}}
        isLoading={isLoading}
      />
    ),
  ],
  [
    'Selector',
    isLoading => (
      <Selector
        label="Fruit"
        options={OPTIONS}
        onChange={() => {}}
        isLoading={isLoading}
      />
    ),
  ],
  [
    'MultiSelector',
    isLoading => (
      <MultiSelector
        label="Fruits"
        options={OPTIONS}
        value={[]}
        onChange={() => {}}
        isLoading={isLoading}
      />
    ),
  ],
];

/** Calls that announced the busy start, ignoring each control's other messages. */
function busyAnnouncements() {
  return announce.mock.calls.filter(([message]) => message === 'Loading');
}

function strict(element: ReactElement) {
  return <StrictMode>{element}</StrictMode>;
}

beforeEach(() => {
  announce.mockClear();
});

describe.each(OWNERS)('%s busy state (spec:AST-086)', (_name, renderOwner) => {
  it('keeps its Spinner silent: hidden from assistive technology, no live role exposed (FR8)', () => {
    const {container} = render(renderOwner(true));
    const spinner = container.querySelector('.astryx-spinner');
    expect(spinner).not.toBeNull();
    expect(spinner).toHaveAttribute('aria-hidden', 'true');
    expect(screen.queryByRole('status', {name: 'Loading'})).toBeNull();
  });

  it('announces its busy start once through the polite channel, even under StrictMode (FR6, FR8)', () => {
    const {rerender} = render(strict(renderOwner(true)));
    rerender(strict(renderOwner(true)));
    expect(busyAnnouncements()).toEqual([['Loading', 'polite']]);
  });

  it('announces nothing while idle, and again for each new busy start (FR6)', () => {
    const {rerender} = render(renderOwner(false));
    expect(busyAnnouncements()).toEqual([]);
    rerender(renderOwner(true));
    rerender(renderOwner(false));
    rerender(renderOwner(true));
    expect(busyAnnouncements()).toEqual([
      ['Loading', 'polite'],
      ['Loading', 'polite'],
    ]);
  });
});

describe.each(OWNERS)(
  '%s busy inside an open native modal (spec:AST-086 Platform support)',
  (_name, renderOwner) => {
    // jsdom has no showModal(), so an open dialog never matches `:modal`;
    // stand in for a dialog opened modally.
    beforeEach(() => {
      const matches = Element.prototype.matches;
      vi.spyOn(Element.prototype, 'matches').mockImplementation(function (
        this: Element,
        selector: string,
      ) {
        return selector === ':modal'
          ? this instanceof HTMLDialogElement && this.open
          : matches.call(this, selector);
      });
    });
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('announces its busy start through a persistent region inside the dialog, not the body-level channel', async () => {
      const {rerender} = render(<dialog open>{renderOwner(false)}</dialog>);
      const dialog = document.querySelector('dialog') as HTMLDialogElement;
      rerender(<dialog open>{renderOwner(true)}</dialog>);
      const region = dialog.querySelector('[data-astryx-modal-busy-region]');
      expect(region).not.toBeNull();
      expect(region).toHaveAttribute('role', 'status');
      expect(region).toHaveAttribute('aria-live', 'polite');
      // Inserted empty, then filled on the next frame (FR3).
      expect(region).toHaveTextContent('');
      await act(
        async () =>
          void (await new Promise(resolve => requestAnimationFrame(resolve))),
      );
      expect(region).toHaveTextContent('Loading');
      expect(busyAnnouncements()).toEqual([]);
    });
  },
);
