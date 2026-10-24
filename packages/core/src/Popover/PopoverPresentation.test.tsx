// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file PopoverPresentation.test.tsx
 * @input vitest (jsdom), Testing Library, Popover, a stand-in matchMedia and
 *   jsdom stubs for <dialog>
 * @output Checks Popover's `presentation`: the default stays anchored on a
 *   phone; `adaptive` presents a BottomSheet on a compact touch screen and the
 *   popover elsewhere; `bottom-sheet` always presents the sheet; the trigger's
 *   expanded state and controlled element follow the sheet; closing the sheet
 *   reports it; controlled visibility drives the sheet; dismissal maps to the
 *   sheet's purpose
 * @position Testing for Popover.tsx (presentation)
 */

import {act, fireEvent, render, screen} from '@testing-library/react';
import React, {useState} from 'react';
import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import {Button} from '../Button';
import {COMPACT_TOUCH_PRESENTATION_QUERY} from '../hooks/useAdaptivePresentation';
import {Popover, type PopoverPresentation} from './Popover';

let isCompactTouch = false;

beforeAll(async () => {
  // The sheet loads on demand; load it once so the first open in a test does
  // not wait on the import.
  await import('../BottomSheet/BottomSheet');
});

beforeEach(() => {
  isCompactTouch = false;
  // jsdom implements no <dialog> open/close or pointer capture.
  HTMLDialogElement.prototype.showModal = vi.fn(function (
    this: HTMLDialogElement,
  ) {
    this.setAttribute('open', '');
  });
  HTMLDialogElement.prototype.show = vi.fn(function (this: HTMLDialogElement) {
    this.setAttribute('open', '');
  });
  HTMLDialogElement.prototype.close = vi.fn(function (this: HTMLDialogElement) {
    this.removeAttribute('open');
  });
  if (!Element.prototype.setPointerCapture) {
    Element.prototype.setPointerCapture = vi.fn();
    Element.prototype.releasePointerCapture = vi.fn();
  }
  vi.stubGlobal(
    'matchMedia',
    vi.fn((query: string) => ({
      matches:
        query === COMPACT_TOUCH_PRESENTATION_QUERY ? isCompactTouch : false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  );
  window.scrollTo = vi.fn();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

function Filters({
  presentation,
  onOpenChange,
  hasLightDismiss,
  hasEscapeDismiss,
}: {
  presentation?: PopoverPresentation;
  onOpenChange?: (isOpen: boolean) => void;
  hasLightDismiss?: boolean;
  hasEscapeDismiss?: boolean;
}) {
  return (
    <Popover
      label="Filters"
      presentation={presentation}
      onOpenChange={onOpenChange}
      hasLightDismiss={hasLightDismiss}
      hasEscapeDismiss={hasEscapeDismiss}
      content={<button type="button">Apply</button>}>
      <Button label="Filter">Filter</Button>
    </Popover>
  );
}

const trigger = () => screen.getByRole('button', {name: 'Filter'});
const sheetDialog = () =>
  document.querySelector<HTMLDialogElement>('dialog[aria-label="Filters"]');
const openLayer = () =>
  document.querySelector(
    '[popover]:has([role="dialog"][aria-label="Filters"])',
  );

async function tapTrigger() {
  await act(async () => {
    fireEvent.click(trigger());
    await Promise.resolve();
  });
}

describe('Popover presentation', () => {
  it('stays anchored on a phone by default', async () => {
    isCompactTouch = true;
    render(<Filters />);
    await tapTrigger();
    expect(trigger()).toHaveAttribute('aria-expanded', 'true');
    expect(sheetDialog()).toBeNull();
    expect(openLayer()).not.toBeNull();
  });

  it('adaptive: a phone gets a BottomSheet holding the content, labeled by the popover', async () => {
    isCompactTouch = true;
    const onOpenChange = vi.fn();
    render(<Filters presentation="adaptive" onOpenChange={onOpenChange} />);
    await tapTrigger();
    const dialog = await vi.waitFor(() => {
      const element = sheetDialog();
      expect(element).toHaveAttribute('open');
      return element!;
    });
    expect(dialog.querySelector('button')).toHaveTextContent('Apply');
    expect(onOpenChange).toHaveBeenLastCalledWith(true);
    expect(trigger()).toHaveAttribute('aria-expanded', 'true');
    // The trigger controls the sheet's panel, not the hidden layer.
    const controlled = document.getElementById(
      trigger().getAttribute('aria-controls') ?? '',
    );
    expect(controlled).not.toBeNull();
    expect(dialog.contains(controlled)).toBe(true);
    expect(document.querySelector('[popover]:popover-open')).toBeNull();
  });

  it('adaptive: a desktop keeps the anchored popover', async () => {
    render(<Filters presentation="adaptive" />);
    await tapTrigger();
    expect(trigger()).toHaveAttribute('aria-expanded', 'true');
    expect(sheetDialog()).toBeNull();
    expect(openLayer()).not.toBeNull();
  });

  it('bottom-sheet: the sheet on any screen', async () => {
    render(<Filters presentation="bottom-sheet" />);
    await tapTrigger();
    await vi.waitFor(() => {
      expect(sheetDialog()).toHaveAttribute('open');
    });
  });

  it('closing the sheet reports it and collapses the trigger', async () => {
    isCompactTouch = true;
    const onOpenChange = vi.fn();
    render(<Filters presentation="adaptive" onOpenChange={onOpenChange} />);
    await tapTrigger();
    const dialog = await vi.waitFor(() => {
      const element = sheetDialog();
      expect(element).toHaveAttribute('open');
      return element!;
    });
    act(() => {
      fireEvent.keyDown(dialog, {key: 'Escape'});
    });
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
    expect(trigger()).toHaveAttribute('aria-expanded', 'false');
  });

  it('controlled: isOpen drives the sheet, and the trigger asks to close it', async () => {
    isCompactTouch = true;
    const changes: boolean[] = [];
    function Controlled() {
      const [isOpen, setIsOpen] = useState(false);
      return (
        <>
          <button type="button" onClick={() => setIsOpen(true)}>
            Open from outside
          </button>
          <Popover
            label="Filters"
            presentation="adaptive"
            isOpen={isOpen}
            onOpenChange={next => {
              changes.push(next);
              setIsOpen(next);
            }}
            content={<button type="button">Apply</button>}>
            <Button label="Filter">Filter</Button>
          </Popover>
        </>
      );
    }
    render(<Controlled />);
    await act(async () => {
      fireEvent.click(screen.getByRole('button', {name: 'Open from outside'}));
      await Promise.resolve();
    });
    await vi.waitFor(() => {
      expect(sheetDialog()).toHaveAttribute('open');
    });
    expect(trigger()).toHaveAttribute('aria-expanded', 'true');
    await tapTrigger();
    expect(changes).toEqual([false]);
    expect(trigger()).toHaveAttribute('aria-expanded', 'false');
  });

  it('maps dismissal to the sheet: no light dismiss keeps Escape, neither makes it required', async () => {
    isCompactTouch = true;
    const {unmount} = render(
      <Filters presentation="adaptive" hasLightDismiss={false} />,
    );
    await tapTrigger();
    await vi.waitFor(() => {
      expect(sheetDialog()).toHaveAttribute('open');
    });
    expect(sheetDialog()).not.toHaveAttribute('role', 'alertdialog');
    unmount();
    render(
      <Filters
        presentation="adaptive"
        hasLightDismiss={false}
        hasEscapeDismiss={false}
      />,
    );
    await tapTrigger();
    await vi.waitFor(() => {
      expect(sheetDialog()).toHaveAttribute('role', 'alertdialog');
    });
  });

  it('a render-prop trigger gets the sheet state', async () => {
    isCompactTouch = true;
    render(
      <Popover
        label="Filters"
        presentation="adaptive"
        content={<button type="button">Apply</button>}>
        {props => (
          <button type="button" {...props}>
            Filter
          </button>
        )}
      </Popover>,
    );
    await tapTrigger();
    await vi.waitFor(() => {
      expect(sheetDialog()).toHaveAttribute('open');
    });
    expect(trigger()).toHaveAttribute('aria-expanded', 'true');
    expect(
      sheetDialog()!.contains(
        document.getElementById(trigger().getAttribute('aria-controls') ?? ''),
      ),
    ).toBe(true);
  });
});

// Keeps React in scope for the JSX runtime in this file.
void React;
