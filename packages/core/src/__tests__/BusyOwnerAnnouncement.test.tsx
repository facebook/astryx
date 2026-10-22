// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file BusyOwnerAnnouncement.test.tsx
 * @input Uses vitest, @testing-library/react, and the busy controls under test
 * @output Pins spec:AST-086 FR8 and FR6 for controls that show a busy Spinner
 * @position Shared contract test: the composed Spinner is silent and the
 *   owning control announces each busy start once through the shared channel
 */

import {StrictMode, useEffect, useRef, type ReactElement} from 'react';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {act, render, screen} from '@testing-library/react';
import {TextInput} from '../TextInput';
import {TextArea} from '../TextArea';
import {Selector} from '../Selector';
import {MultiSelector} from '../MultiSelector';

const announce = vi.fn();
vi.mock('../hooks/useAnnounce', async importOriginal => ({
  ...(await importOriginal<Record<string, unknown>>()),
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

/** The hook picks its route a frame after the busy start; wait for it. */
async function nextFrame() {
  await act(
    async () =>
      void (await new Promise(resolve => requestAnimationFrame(resolve))),
  );
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

  it('announces its busy start once through the polite channel, even under StrictMode (FR6, FR8)', async () => {
    const {rerender} = render(strict(renderOwner(true)));
    await nextFrame();
    rerender(strict(renderOwner(true)));
    await nextFrame();
    expect(busyAnnouncements()).toEqual([['Loading', 'polite']]);
  });

  it('announces nothing while idle, and again for each new busy start (FR6)', async () => {
    const {rerender} = render(renderOwner(false));
    await nextFrame();
    expect(busyAnnouncements()).toEqual([]);
    rerender(renderOwner(true));
    await nextFrame();
    rerender(renderOwner(false));
    rerender(renderOwner(true));
    await nextFrame();
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
      await nextFrame();
      const region = dialog.querySelector('[data-astryx-modal-busy-region]');
      expect(region).not.toBeNull();
      expect(region).toHaveAttribute('role', 'status');
      expect(region).toHaveAttribute('aria-live', 'polite');
      // Inserted empty, then filled on the next frame (FR3).
      expect(region).toHaveTextContent('');
      await nextFrame();
      expect(region).toHaveTextContent('Loading');
      expect(busyAnnouncements()).toEqual([]);
    });

    it('announces inside the dialog when it is already busy as its dialog opens', async () => {
      // The dialog opens in its own Effect, after the field's Effect has run,
      // the way Dialog calls showModal().
      function OpeningDialog() {
        const ref = useRef<HTMLDialogElement>(null);
        useEffect(() => {
          ref.current?.setAttribute('open', '');
        }, []);
        return <dialog ref={ref}>{renderOwner(true)}</dialog>;
      }
      render(<OpeningDialog />);
      await nextFrame();
      await nextFrame();
      const dialog = document.querySelector('dialog') as HTMLDialogElement;
      expect(
        dialog.querySelector('[data-astryx-modal-busy-region]'),
      ).toHaveTextContent('Loading');
      expect(busyAnnouncements()).toEqual([]);
    });
  },
);
