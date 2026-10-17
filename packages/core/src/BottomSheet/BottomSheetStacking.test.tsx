// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file BottomSheetStacking.test.tsx
 * @input Uses vitest, @testing-library/react, react-dom/server, BottomSheet,
 *   BottomSheetSwitcher, Dialog, and the private bottom-sheet stack registry
 * @output Tests for stacked bottom sheets, one group per requirement: no new
 *   API, open order, same-commit opens, covered sheets, dismissal, one scrim,
 *   closing a covered sheet, focus, the native top layer, concurrent React,
 *   non-modal sheets, and unchanged standalone behaviour
 * @position Core testing; validates bottomSheetStack.ts and the stacking
 *   behaviour of BottomSheet.tsx and BottomSheetSwitcher.tsx
 *
 * SYNC: When bottomSheetStack.ts, BottomSheet.tsx or BottomSheetSwitcher.tsx
 * change their stacking behaviour, update these tests to match.
 */

import {act, fireEvent, render, screen} from '@testing-library/react';
import {
  Activity,
  StrictMode,
  Suspense,
  startTransition,
  useState,
  type ReactNode,
} from 'react';
import {flushSync} from 'react-dom';
import {createRoot, hydrateRoot} from 'react-dom/client';
import {renderToString} from 'react-dom/server';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {Dialog} from '../Dialog';
import * as BottomSheetModule from './index';
import {BottomSheet} from './BottomSheet';
import {BottomSheetSwitcher} from './BottomSheetSwitcher';
import {
  getBottomSheetStackForTests,
  resetBottomSheetStackForTests,
} from './bottomSheetStack';
import {__resetInteractionModalityForTest} from '../utils/interactionModality';

/**
 * Every native showModal/show/close, in order, with the dialog. The label is
 * read when a test asks, because a switcher labels its dialog from state its
 * items register in the same commit that shows it.
 */
let nativeLog: {call: 'showModal' | 'show' | 'close'; dialog: HTMLElement}[] =
  [];

beforeEach(() => {
  nativeLog = [];
  resetBottomSheetStackForTests();
  __resetInteractionModalityForTest();
  HTMLDialogElement.prototype.showModal = vi.fn(function (
    this: HTMLDialogElement,
  ) {
    nativeLog.push({call: 'showModal', dialog: this});
    this.setAttribute('open', '');
  });
  HTMLDialogElement.prototype.show = vi.fn(function (this: HTMLDialogElement) {
    nativeLog.push({call: 'show', dialog: this});
    this.setAttribute('open', '');
  });
  HTMLDialogElement.prototype.close = vi.fn(function (this: HTMLDialogElement) {
    nativeLog.push({call: 'close', dialog: this});
    this.removeAttribute('open');
  });
  if (!Element.prototype.setPointerCapture) {
    Element.prototype.setPointerCapture = vi.fn();
    Element.prototype.releasePointerCapture = vi.fn();
  }
  window.scrollTo = vi.fn();
  vi.stubGlobal(
    'matchMedia',
    vi.fn().mockReturnValue({
      matches: false,
      media: '',
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }),
  );
  vi.stubGlobal(
    'requestAnimationFrame',
    vi.fn((callback: FrameRequestCallback) => {
      callback(0);
      return 1;
    }),
  );
  vi.stubGlobal('cancelAnimationFrame', vi.fn());
});

afterEach(() => {
  vi.unstubAllGlobals();
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getDialog(
  label: string,
  root: ParentNode = document,
): HTMLDialogElement {
  const dialog = root.querySelector<HTMLDialogElement>(
    `dialog[aria-label="${label}"]`,
  );
  if (dialog == null) {
    throw new Error(`dialog "${label}" not found`);
  }
  return dialog;
}

function getPanel(dialog: HTMLElement): HTMLElement {
  const panels = Array.from(
    dialog.querySelectorAll<HTMLElement>('.astryx-bottom-sheet'),
  ).filter(panel => panel.closest('dialog') === dialog);
  const panel =
    panels.find(candidate => !candidate.parentElement?.hidden) ?? panels[0];
  if (panel == null) {
    throw new Error('sheet panel not found');
  }
  return panel;
}

function getPositioner(dialog: HTMLElement): HTMLElement {
  const positioner = getPanel(dialog).parentElement;
  if (positioner == null) {
    throw new Error('positioner not found');
  }
  return positioner;
}

function getHandle(dialog: HTMLElement): HTMLElement {
  const handle = getPanel(dialog).querySelector<HTMLElement>(
    '[aria-hidden="true"]',
  );
  if (handle == null) {
    throw new Error('grab handle not found');
  }
  return handle;
}

function scrim(dialog: HTMLElement): string {
  return dialog.style.getPropertyValue('--_sheet-scrim-opacity');
}

/** `label:state:depth` for every presented modal sheet, bottom to top. */
function stackSummary(): string[] {
  return getBottomSheetStackForTests().map(({element, isOpen, view}) => {
    const label = element?.getAttribute('aria-label') ?? '?';
    const state = !isOpen ? 'exiting' : view.isTop ? 'top' : 'covered';
    return `${label}:${state}:${view.depth}`;
  });
}

/** The final native top-layer order: the last showModal of each open dialog. */
function topLayerOrder(): string[] {
  const order: HTMLElement[] = [];
  for (const entry of nativeLog) {
    const index = order.indexOf(entry.dialog);
    if (index !== -1) {
      order.splice(index, 1);
    }
    if (entry.call === 'showModal') {
      order.push(entry.dialog);
    }
  }
  return order.map(dialog => dialog.getAttribute('aria-label') ?? '?');
}

function openDialogs(): string[] {
  return Array.from(document.querySelectorAll('dialog[open]')).map(
    dialog => dialog.getAttribute('aria-label') ?? '?',
  );
}

// The sheet keeps its dialog open through the exit animation; jsdom never
// runs it, so end it the way the panel's transition would.
function finishExit(dialog: HTMLElement) {
  for (const panel of Array.from(
    dialog.querySelectorAll<HTMLElement>('.astryx-bottom-sheet'),
  )) {
    if (panel.closest('dialog') === dialog) {
      fireEvent.transitionEnd(panel, {propertyName: 'transform'});
    }
  }
}

function pressEscape(): KeyboardEvent {
  const event = new KeyboardEvent('keydown', {
    key: 'Escape',
    bubbles: true,
    cancelable: true,
  });
  document.dispatchEvent(event);
  return event;
}

function fireCancel(dialog: Element): Event {
  const event = new Event('cancel', {bubbles: false, cancelable: true});
  dialog.dispatchEvent(event);
  return event;
}

// Drive a pointer drag on a grab handle. jsdom PointerEvents don't carry
// clientY, so dispatch plain events with the coords the handlers read.
function drag(handle: HTMLElement, points: {y: number}[]) {
  const [down, ...rest] = points;
  fireEvent.pointerDown(handle, {
    pointerId: 1,
    clientY: down.y,
    button: 0,
    isPrimary: true,
  });
  for (const point of rest) {
    fireEvent.pointerMove(handle, {pointerId: 1, clientY: point.y});
  }
  const last = points[points.length - 1];
  fireEvent.pointerUp(handle, {pointerId: 1, clientY: last.y});
}

function classes(element: Element): string {
  return element.className;
}

/**
 * Two sibling sheets, each with its own state, plus an opener for each. The
 * default writes A before B; `reversed` writes B before A so an open of A
 * then B is an open out of tree order.
 */
function Siblings({
  reversed = false,
  purposeB,
  initialA = false,
  initialB = false,
}: {
  reversed?: boolean;
  purposeB?: 'info' | 'form' | 'required';
  initialA?: boolean;
  initialB?: boolean;
}) {
  const [isAOpen, setIsAOpen] = useState(initialA);
  const [isBOpen, setIsBOpen] = useState(initialB);
  const a = (
    <BottomSheet key="A" isOpen={isAOpen} onOpenChange={setIsAOpen} label="A">
      <button type="button" onClick={() => setIsBOpen(true)}>
        Open B
      </button>
      <input aria-label="A field" defaultValue="" />
    </BottomSheet>
  );
  const b = (
    <BottomSheet
      key="B"
      isOpen={isBOpen}
      onOpenChange={setIsBOpen}
      label="B"
      purpose={purposeB}>
      <button type="button" onClick={() => setIsBOpen(false)}>
        Close B
      </button>
      <button type="button" onClick={() => setIsAOpen(false)}>
        Close A from B
      </button>
    </BottomSheet>
  );
  return (
    <>
      <button type="button" onClick={() => setIsAOpen(true)}>
        Open A
      </button>
      {reversed ? [b, a] : [a, b]}
    </>
  );
}

/** A → B → C, each rendered inside the previous sheet's content. */
function Nested({
  initial = false,
  closeAllFromC = false,
}: {
  initial?: boolean;
  closeAllFromC?: boolean;
}) {
  const [isAOpen, setIsAOpen] = useState(initial);
  const [isBOpen, setIsBOpen] = useState(initial);
  const [isCOpen, setIsCOpen] = useState(initial);
  return (
    <>
      <button type="button" onClick={() => setIsAOpen(true)}>
        Open A
      </button>
      <button type="button" onClick={() => setIsAOpen(false)}>
        Close A from page
      </button>
      <BottomSheet isOpen={isAOpen} onOpenChange={setIsAOpen} label="A">
        <button type="button" onClick={() => setIsBOpen(true)}>
          Open B
        </button>
        <BottomSheet isOpen={isBOpen} onOpenChange={setIsBOpen} label="B">
          <button type="button" onClick={() => setIsCOpen(true)}>
            Open C
          </button>
          <BottomSheet isOpen={isCOpen} onOpenChange={setIsCOpen} label="C">
            <button
              type="button"
              onClick={() => {
                if (closeAllFromC) {
                  setIsAOpen(false);
                  setIsBOpen(false);
                }
                setIsCOpen(false);
              }}>
              Close C
            </button>
          </BottomSheet>
        </BottomSheet>
      </BottomSheet>
    </>
  );
}

// ---------------------------------------------------------------------------
// Requirement 1 — no new public API; a lone sheet is unchanged
// ---------------------------------------------------------------------------

describe('R1 no new public API', () => {
  it('exports exactly BottomSheet and BottomSheetSwitcher', () => {
    expect(Object.keys(BottomSheetModule).sort()).toEqual([
      'BottomSheet',
      'BottomSheetSwitcher',
    ]);
  });

  it('a sheet on its own carries no stack state and behaves as before', () => {
    const onOpenChange = vi.fn();
    render(
      <BottomSheet isOpen onOpenChange={onOpenChange} label="Alone">
        Content
      </BottomSheet>,
    );
    const dialog = getDialog('Alone');
    expect(dialog).toHaveAttribute('open');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).not.toHaveAttribute('inert');
    expect(dialog).not.toHaveAttribute('data-sheet-stack');
    expect(dialog).not.toHaveAttribute('data-sheet-stack-depth');
    expect(scrim(dialog)).toBe('1');
    expect(getComputedStyle(getPositioner(dialog)).transform).toBe('');
    expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalledTimes(1);
    expect(getPanel(dialog)).toHaveFocus();

    act(() => {
      pressEscape();
    });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});

// ---------------------------------------------------------------------------
// Requirement 2 — order is open order
// ---------------------------------------------------------------------------

describe('R2 order is open order', () => {
  it('a sheet opened over another stacks on top; the covered one recedes', () => {
    render(<Siblings />);
    fireEvent.click(screen.getByRole('button', {name: 'Open A'}));
    expect(stackSummary()).toEqual(['A:top:0']);

    fireEvent.click(screen.getByRole('button', {name: 'Open B'}));
    expect(stackSummary()).toEqual(['A:covered:1', 'B:top:0']);
    expect(getDialog('A')).toHaveAttribute('data-sheet-stack', 'covered');
    expect(getDialog('A')).toHaveAttribute('data-sheet-stack-depth', '1');
    expect(getDialog('B')).toHaveAttribute('data-sheet-stack', 'top');
    expect(getDialog('B')).not.toHaveAttribute('data-sheet-stack-depth');
    expect(topLayerOrder()).toEqual(['A', 'B']);
  });

  it('a sheet that closes and reopens goes back on top', () => {
    function Three() {
      const [open, setOpen] = useState({A: true, B: true, C: true});
      const toggle = (id: 'A' | 'B' | 'C', value: boolean) =>
        setOpen(current => ({...current, [id]: value}));
      return (
        <>
          <button type="button" onClick={() => toggle('A', false)}>
            Close A
          </button>
          <button type="button" onClick={() => toggle('A', true)}>
            Reopen A
          </button>
          <BottomSheet
            isOpen={open.A}
            onOpenChange={v => toggle('A', v)}
            label="A">
            a
          </BottomSheet>
          <BottomSheet
            isOpen={open.B}
            onOpenChange={v => toggle('B', v)}
            label="B">
            b
          </BottomSheet>
          <BottomSheet
            isOpen={open.C}
            onOpenChange={v => toggle('C', v)}
            label="C">
            c
          </BottomSheet>
        </>
      );
    }
    render(<Three />);
    expect(stackSummary()).toEqual(['A:covered:2', 'B:covered:1', 'C:top:0']);

    fireEvent.click(screen.getByRole('button', {name: 'Close A'}));
    finishExit(getDialog('A'));
    expect(stackSummary()).toEqual(['B:covered:1', 'C:top:0']);

    fireEvent.click(screen.getByRole('button', {name: 'Reopen A'}));
    expect(stackSummary()).toEqual(['B:covered:2', 'C:covered:1', 'A:top:0']);
    expect(topLayerOrder()).toEqual(['B', 'C', 'A']);
  });

  it('a sheet reopened during its exit returns on top', () => {
    render(<Siblings initialA initialB />);
    expect(stackSummary()).toEqual(['A:covered:1', 'B:top:0']);
    fireEvent.click(screen.getByRole('button', {name: 'Close A from B'}));
    expect(stackSummary()).toEqual(['A:exiting:1', 'B:top:0']);
    // Reopen before the exit animation has finished.
    fireEvent.click(screen.getByRole('button', {name: 'Open A'}));
    expect(stackSummary()).toEqual(['B:covered:1', 'A:top:0']);
    expect(topLayerOrder()).toEqual(['B', 'A']);
    expect(scrim(getDialog('A'))).toBe('0');
    expect(scrim(getDialog('B'))).toBe('1');
  });

  it('sheets in separate components stack the same way', () => {
    function Owner({label, children}: {label: string; children?: ReactNode}) {
      const [isOpen, setIsOpen] = useState(false);
      return (
        <>
          <button type="button" onClick={() => setIsOpen(true)}>
            Open {label}
          </button>
          <BottomSheet isOpen={isOpen} onOpenChange={setIsOpen} label={label}>
            {children}
          </BottomSheet>
        </>
      );
    }
    render(
      <>
        <Owner label="First" />
        <Owner label="Second" />
      </>,
    );
    fireEvent.click(screen.getByRole('button', {name: 'Open Second'}));
    fireEvent.click(screen.getByRole('button', {name: 'Open First'}));
    expect(stackSummary()).toEqual(['Second:covered:1', 'First:top:0']);
  });

  it('a sheet inside another sheet’s content stacks above it', () => {
    render(<Nested />);
    fireEvent.click(screen.getByRole('button', {name: 'Open A'}));
    fireEvent.click(screen.getByRole('button', {name: 'Open B'}));
    fireEvent.click(screen.getByRole('button', {name: 'Open C'}));
    expect(stackSummary()).toEqual(['A:covered:2', 'B:covered:1', 'C:top:0']);
    expect(topLayerOrder()).toEqual(['A', 'B', 'C']);
  });

  it('a whole switcher is one level, and switching its step keeps its place', () => {
    function App() {
      const [isAOpen, setIsAOpen] = useState(false);
      const [step, setStep] = useState<string | null>(null);
      const [isCOpen, setIsCOpen] = useState(false);
      return (
        <>
          <button type="button" onClick={() => setIsAOpen(true)}>
            Open A
          </button>
          <button type="button" onClick={() => setStep('one')}>
            Open switcher
          </button>
          <button type="button" onClick={() => setStep('two')}>
            Step two
          </button>
          <button type="button" onClick={() => setIsCOpen(true)}>
            Open C
          </button>
          <BottomSheet isOpen={isAOpen} onOpenChange={setIsAOpen} label="A">
            a
          </BottomSheet>
          <BottomSheetSwitcher activeSheet={step} onActiveSheetChange={setStep}>
            <BottomSheet sheetId="one" label="One">
              one
            </BottomSheet>
            <BottomSheet sheetId="two" label="Two">
              two
            </BottomSheet>
          </BottomSheetSwitcher>
          <BottomSheet isOpen={isCOpen} onOpenChange={setIsCOpen} label="C">
            c
          </BottomSheet>
        </>
      );
    }
    render(<App />);
    fireEvent.click(screen.getByRole('button', {name: 'Open A'}));
    fireEvent.click(screen.getByRole('button', {name: 'Open switcher'}));
    expect(stackSummary()).toEqual(['A:covered:1', 'One:top:0']);
    expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalledTimes(2);

    fireEvent.click(screen.getByRole('button', {name: 'Step two'}));
    // The shared dialog is labelled by its active step; its place is unchanged.
    expect(stackSummary()).toEqual(['A:covered:1', 'Two:top:0']);
    expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalledTimes(2);

    fireEvent.click(screen.getByRole('button', {name: 'Open C'}));
    expect(stackSummary()).toEqual(['A:covered:2', 'Two:covered:1', 'C:top:0']);
    const switcherDialog = getDialog('Two');
    expect(switcherDialog).toHaveAttribute('data-sheet-stack', 'covered');
    expect(switcherDialog).toHaveAttribute('data-sheet-stack-depth', '1');
    // Every step's positioner recedes with the switcher.
    for (const positioner of Array.from(
      switcherDialog.querySelectorAll<HTMLElement>('.astryx-bottom-sheet'),
    ).map(panel => panel.parentElement!)) {
      expect(getComputedStyle(positioner).transform).toContain('scale(.96)');
    }
  });

  it('a standalone sheet inside a switcher step stacks above the switcher', () => {
    function App() {
      const [isNestedOpen, setIsNestedOpen] = useState(false);
      return (
        <BottomSheetSwitcher
          activeSheet="details"
          onActiveSheetChange={() => {}}>
          <BottomSheet sheetId="details" label="Details">
            <button type="button" onClick={() => setIsNestedOpen(true)}>
              Open nested
            </button>
            <BottomSheet
              isOpen={isNestedOpen}
              onOpenChange={setIsNestedOpen}
              label="Nested">
              nested
            </BottomSheet>
          </BottomSheet>
        </BottomSheetSwitcher>
      );
    }
    render(<App />);
    fireEvent.click(screen.getByRole('button', {name: 'Open nested'}));
    expect(stackSummary()).toEqual(['Details:covered:1', 'Nested:top:0']);
    expect(topLayerOrder()).toEqual(['Details', 'Nested']);
  });

  it('opening out of tree order puts the later-opened sheet on top', () => {
    render(<Siblings reversed />);
    fireEvent.click(screen.getByRole('button', {name: 'Open A'}));
    fireEvent.click(screen.getByRole('button', {name: 'Open B'}));
    // B is written before A in the DOM, but opened after it.
    const dialogs = Array.from(document.querySelectorAll('dialog')).map(d =>
      d.getAttribute('aria-label'),
    );
    expect(dialogs).toEqual(['B', 'A']);
    expect(stackSummary()).toEqual(['A:covered:1', 'B:top:0']);
    expect(topLayerOrder()).toEqual(['A', 'B']);
  });
});

// ---------------------------------------------------------------------------
// Requirement 3 — same-update opens break ties by tree order, first frame
// ---------------------------------------------------------------------------

describe('R3 same-update opens (deep link)', () => {
  function mountSync(element: ReactNode) {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);
    let microtaskRan = false;
    void Promise.resolve().then(() => {
      microtaskRan = true;
    });
    // eslint-disable-next-line @eslint-react/dom-no-flush-sync -- the test asserts the first synchronous frame
    flushSync(() => {
      root.render(element);
    });
    return {
      container,
      microtaskRan: () => microtaskRan,
      unmount: () => {
        act(() => root.unmount());
        container.remove();
      },
    };
  }

  it('a depth-3 deep link of nested sheets is right in the first painted frame', () => {
    const mounted = mountSync(<Nested initial />);
    expect(mounted.microtaskRan()).toBe(false);

    // Effects ran child first (C, B, A), yet the native top layer ends in
    // tree order and every sheet already carries its stack state.
    expect(topLayerOrder()).toEqual(['A', 'B', 'C']);
    expect(stackSummary()).toEqual(['A:covered:2', 'B:covered:1', 'C:top:0']);
    expect(getDialog('A')).toHaveAttribute('data-sheet-stack', 'covered');
    expect(getDialog('A')).toHaveAttribute('data-sheet-stack-depth', '2');
    expect(getDialog('B')).toHaveAttribute('data-sheet-stack-depth', '1');
    expect(getDialog('C')).toHaveAttribute('data-sheet-stack', 'top');
    expect(getComputedStyle(getPositioner(getDialog('A'))).transform).toContain(
      'scale(.92)',
    );
    expect(getComputedStyle(getPositioner(getDialog('B'))).transform).toContain(
      'scale(.96)',
    );
    expect(getComputedStyle(getPositioner(getDialog('C'))).transform).toBe('');
    expect(scrim(getDialog('A'))).toBe('1');
    expect(scrim(getDialog('B'))).toBe('0');
    expect(scrim(getDialog('C'))).toBe('0');
    expect(getPanel(getDialog('C'))).toHaveFocus();
    expect(mounted.microtaskRan()).toBe(false);
    mounted.unmount();
  });

  it('siblings opened in one commit stack in document order', () => {
    const mounted = mountSync(<Siblings reversed initialA initialB />);
    // B is written first, so with no open order between them B is below A.
    expect(stackSummary()).toEqual(['B:covered:1', 'A:top:0']);
    expect(topLayerOrder()).toEqual(['B', 'A']);
    mounted.unmount();
  });

  it('several sheets opened in one later update are ordered by tree, and a later open goes above them', () => {
    function App() {
      const [all, setAll] = useState(false);
      const [isDOpen, setIsDOpen] = useState(false);
      return (
        <>
          <button type="button" onClick={() => setAll(true)}>
            Deep link
          </button>
          <button type="button" onClick={() => setIsDOpen(true)}>
            Open D
          </button>
          <BottomSheet isOpen={all} onOpenChange={() => {}} label="A">
            <BottomSheet isOpen={all} onOpenChange={() => {}} label="B">
              b
            </BottomSheet>
          </BottomSheet>
          <BottomSheet isOpen={all} onOpenChange={() => {}} label="C">
            c
          </BottomSheet>
          <BottomSheet isOpen={isDOpen} onOpenChange={setIsDOpen} label="D">
            d
          </BottomSheet>
        </>
      );
    }
    render(<App />);
    fireEvent.click(screen.getByRole('button', {name: 'Deep link'}));
    expect(stackSummary()).toEqual(['A:covered:2', 'B:covered:1', 'C:top:0']);
    expect(topLayerOrder()).toEqual(['A', 'B', 'C']);
    fireEvent.click(screen.getByRole('button', {name: 'Open D'}));
    expect(stackSummary()).toEqual([
      'A:covered:3',
      'B:covered:2',
      'C:covered:1',
      'D:top:0',
    ]);
    expect(topLayerOrder()).toEqual(['A', 'B', 'C', 'D']);
  });
});

// ---------------------------------------------------------------------------
// Requirement 4 — covered sheets stay mounted, are blocked, and recede
// ---------------------------------------------------------------------------

describe('R4 covered sheets', () => {
  it('keeps a covered sheet mounted with its state and marks a sibling-covered one inert', () => {
    render(<Siblings />);
    fireEvent.click(screen.getByRole('button', {name: 'Open A'}));
    fireEvent.change(screen.getByLabelText('A field'), {
      target: {value: 'kept'},
    });
    fireEvent.click(screen.getByRole('button', {name: 'Open B'}));

    const a = getDialog('A');
    expect(a).toHaveAttribute('open');
    expect(a).toHaveAttribute('inert');
    expect(a).toHaveAttribute('aria-hidden', 'true');
    expect(getDialog('B')).not.toHaveAttribute('inert');
    expect(screen.getByLabelText('A field')).toHaveValue('kept');

    fireEvent.click(screen.getByRole('button', {name: 'Close B'}));
    expect(a).not.toHaveAttribute('inert');
    expect(a).not.toHaveAttribute('aria-hidden');
    expect(screen.getByLabelText('A field')).toHaveValue('kept');
  });

  it('leaves a covered sheet that contains the top sheet to the browser’s modal blocking', () => {
    render(<Nested initial />);
    // inert on A would reach C, which lives inside A's content.
    expect(getDialog('A')).not.toHaveAttribute('inert');
    expect(getDialog('B')).not.toHaveAttribute('inert');
    expect(getDialog('C')).not.toHaveAttribute('inert');
    expect(getDialog('A')).toHaveAttribute('data-sheet-stack', 'covered');
    expect(getDialog('C')).toHaveAttribute('data-sheet-stack', 'top');
    // The top sheet is the last modal dialog shown, so the browser blocks
    // everything outside it, A and B included.
    expect(topLayerOrder().at(-1)).toBe('C');
  });

  it('recedes by depth: 0.96 / −8px at depth 1, 0.92 / −16px from depth 2 on', () => {
    function Four() {
      return (
        <>
          <BottomSheet isOpen onOpenChange={() => {}} label="A">
            a
          </BottomSheet>
          <BottomSheet isOpen onOpenChange={() => {}} label="B">
            b
          </BottomSheet>
          <BottomSheet isOpen onOpenChange={() => {}} label="C">
            c
          </BottomSheet>
          <BottomSheet isOpen onOpenChange={() => {}} label="D">
            d
          </BottomSheet>
        </>
      );
    }
    render(<Four />);
    const transform = (label: string) =>
      getComputedStyle(getPositioner(getDialog(label))).transform;
    expect(getDialog('A')).toHaveAttribute('data-sheet-stack-depth', '3');
    expect(transform('A')).toBe(
      'translateY(calc(-2 * var(--spacing-2))) scale(.92)',
    );
    expect(transform('B')).toBe(
      'translateY(calc(-2 * var(--spacing-2))) scale(.92)',
    );
    expect(transform('C')).toBe(
      'translateY(calc(-1 * var(--spacing-2))) scale(.96)',
    );
    expect(transform('D')).toBe('');
    expect(
      getComputedStyle(getPositioner(getDialog('C'))).transformOrigin,
    ).toBe('50% 0');
  });

  it('only sheets count: a Dialog over a sheet does not make it recede', () => {
    function App() {
      const [isDialogOpen, setIsDialogOpen] = useState(false);
      return (
        <BottomSheet isOpen onOpenChange={() => {}} label="Sheet">
          <button type="button" onClick={() => setIsDialogOpen(true)}>
            Open dialog
          </button>
          <Dialog
            isOpen={isDialogOpen}
            onOpenChange={setIsDialogOpen}
            aria-label="Over">
            over
          </Dialog>
        </BottomSheet>
      );
    }
    render(<App />);
    fireEvent.click(screen.getByRole('button', {name: 'Open dialog'}));
    expect(getDialog('Over')).toHaveAttribute('open');
    expect(stackSummary()).toEqual(['Sheet:top:0']);
    expect(getDialog('Sheet')).not.toHaveAttribute('data-sheet-stack');
    expect(getComputedStyle(getPositioner(getDialog('Sheet'))).transform).toBe(
      '',
    );
  });
});

// ---------------------------------------------------------------------------
// Requirement 5 — dismissal reaches only the top sheet, via its own callback
// ---------------------------------------------------------------------------

describe('R5 dismissal', () => {
  function Pair({purposeB}: {purposeB?: 'info' | 'form' | 'required'}) {
    return <Siblings initialA initialB purposeB={purposeB} />;
  }

  it('Escape closes only the top sheet', () => {
    render(<Pair />);
    let event!: KeyboardEvent;
    act(() => {
      event = pressEscape();
    });
    expect(event.defaultPrevented).toBe(true);
    // The revealed sheet comes forward as the top sheet slides away.
    expect(stackSummary()).toEqual(['A:top:0', 'B:exiting:0']);
    expect(getDialog('B')).toHaveAttribute('open');
    finishExit(getDialog('B'));
    expect(stackSummary()).toEqual(['A:top:0']);
    expect(getDialog('A')).toHaveAttribute('open');
  });

  it('a scrim tap closes only the top sheet', () => {
    render(<Pair />);
    fireEvent.click(getDialog('B'));
    expect(stackSummary()).toEqual(['A:top:0', 'B:exiting:0']);
    // Only the exiting sheet went; A is still open, and B's own callback was
    // the one called (A's state is untouched).
    expect(getDialog('A')).toHaveAttribute('open');
  });

  it('a swipe closes only the top sheet', () => {
    render(<Pair />);
    drag(getHandle(getDialog('B')), [{y: 0}, {y: 40}, {y: 120}]);
    expect(stackSummary()).toEqual(['A:top:0', 'B:exiting:0']);
    finishExit(getDialog('B'));
    expect(stackSummary()).toEqual(['A:top:0']);
  });

  it('a platform close request pops the top sheet and is declined by a covered one', () => {
    render(<Pair />);
    const declined = fireCancel(getDialog('A'));
    expect(declined.defaultPrevented).toBe(true);
    expect(stackSummary()).toEqual(['A:covered:1', 'B:top:0']);

    let accepted!: Event;
    act(() => {
      accepted = fireCancel(getDialog('B'));
    });
    expect(accepted.defaultPrevented).toBe(true);
    expect(stackSummary()).toEqual(['A:top:0', 'B:exiting:0']);
  });

  it('honours the top sheet’s purpose: required blocks every path and shields the sheet below', () => {
    render(<Pair purposeB="required" />);
    let event!: KeyboardEvent;
    act(() => {
      event = pressEscape();
    });
    expect(event.defaultPrevented).toBe(true);
    fireEvent.click(getDialog('B'));
    drag(getHandle(getDialog('B')), [{y: 0}, {y: 40}, {y: 120}]);
    fireCancel(getDialog('B'));
    expect(stackSummary()).toEqual(['A:covered:1', 'B:top:0']);
  });

  it('honours a form top sheet: Escape closes, scrim and swipe do not', () => {
    render(<Pair purposeB="form" />);
    fireEvent.click(getDialog('B'));
    drag(getHandle(getDialog('B')), [{y: 0}, {y: 40}, {y: 120}]);
    expect(stackSummary()).toEqual(['A:covered:1', 'B:top:0']);
    act(() => {
      pressEscape();
    });
    expect(stackSummary()).toEqual(['A:top:0', 'B:exiting:0']);
  });
});

// ---------------------------------------------------------------------------
// Requirement 6 — one visible scrim per stack
// ---------------------------------------------------------------------------

describe('R6 one scrim', () => {
  it('only the bottom sheet’s backdrop is visible; upper backdrops are transparent', () => {
    render(<Nested initial />);
    expect(scrim(getDialog('A'))).toBe('1');
    expect(scrim(getDialog('B'))).toBe('0');
    expect(scrim(getDialog('C'))).toBe('0');
  });

  it('keeps the dim stable through a push and a pop', () => {
    render(<Siblings initialA />);
    const a = getDialog('A');
    expect(scrim(a)).toBe('1');
    fireEvent.click(screen.getByRole('button', {name: 'Open B'}));
    expect(scrim(a)).toBe('1');
    expect(scrim(getDialog('B'))).toBe('0');
    fireEvent.click(screen.getByRole('button', {name: 'Close B'}));
    // The popped sheet's backdrop stays transparent through its exit; the
    // bottom sheet's stays at full strength throughout.
    expect(scrim(getDialog('B'))).toBe('0');
    expect(scrim(a)).toBe('1');
    finishExit(getDialog('B'));
    expect(scrim(a)).toBe('1');
    expect(classes(a)).not.toContain('scrimInstant');
  });

  it('hands the scrim over at once when the visible-backdrop sheet closes under others', () => {
    render(<Siblings initialA initialB />);
    const a = getDialog('A');
    const b = getDialog('B');
    fireEvent.click(screen.getByRole('button', {name: 'Close A from B'}));
    // A fades its backdrop out through its exit; B's appears with no fade so
    // the page never lightens between the two.
    expect(scrim(a)).toBe('0');
    expect(classes(a)).toContain('scrimClosing');
    expect(scrim(b)).toBe('1');
    expect(classes(b)).toContain('scrimInstant');
    finishExit(a);
    expect(stackSummary()).toEqual(['B:top:0']);
    expect(scrim(b)).toBe('1');
    expect(classes(b)).not.toContain('scrimInstant');
  });

  it('a drag on an upper sheet never thins the visible scrim or reveals its own', () => {
    render(<Siblings initialA initialB />);
    // Partial drag that settles back: the gesture reports opacity changes.
    drag(getHandle(getDialog('B')), [{y: 0}, {y: 10}, {y: 0}]);
    expect(scrim(getDialog('A'))).toBe('1');
    expect(scrim(getDialog('B'))).toBe('0');
  });
});

// ---------------------------------------------------------------------------
// Requirement 7 — closing a covered sheet from code
// ---------------------------------------------------------------------------

describe('R7 closing a covered sheet', () => {
  it('closes the sheets rendered in its content with it, through their own callbacks', () => {
    const onBChange = vi.fn();
    const onCChange = vi.fn();
    function App() {
      const [isAOpen, setIsAOpen] = useState(true);
      const [isBOpen, setIsBOpen] = useState(true);
      const [isCOpen, setIsCOpen] = useState(true);
      return (
        <>
          <button type="button" onClick={() => setIsAOpen(false)}>
            Close A
          </button>
          <BottomSheet isOpen={isAOpen} onOpenChange={setIsAOpen} label="A">
            <BottomSheet
              isOpen={isBOpen}
              onOpenChange={value => {
                onBChange(value);
                setIsBOpen(value);
              }}
              label="B">
              <BottomSheet
                isOpen={isCOpen}
                onOpenChange={value => {
                  onCChange(value);
                  setIsCOpen(value);
                }}
                label="C">
                c
              </BottomSheet>
            </BottomSheet>
          </BottomSheet>
        </>
      );
    }
    render(<App />);
    expect(stackSummary()).toEqual(['A:covered:2', 'B:covered:1', 'C:top:0']);

    fireEvent.click(screen.getByRole('button', {name: 'Close A'}));
    expect(onBChange).toHaveBeenCalledWith(false);
    expect(onCChange).toHaveBeenCalledWith(false);
    // All three leave together.
    expect(stackSummary()).toEqual([
      'A:exiting:0',
      'B:exiting:0',
      'C:exiting:0',
    ]);
    finishExit(getDialog('C'));
    finishExit(getDialog('B'));
    finishExit(getDialog('A'));
    expect(stackSummary()).toEqual([]);
    expect(openDialogs()).toEqual([]);
  });

  it('a sheet in a closed sheet’s content is not presented until that sheet opens', () => {
    const onInnerChange = vi.fn();
    render(
      <BottomSheet isOpen={false} onOpenChange={() => {}} label="Outer">
        <BottomSheet isOpen onOpenChange={onInnerChange} label="Inner">
          inner
        </BottomSheet>
      </BottomSheet>,
    );
    expect(openDialogs()).toEqual([]);
    expect(onInnerChange).toHaveBeenCalledWith(false);
  });

  it('leaves sibling sheets above it open: it slides out from beneath them', () => {
    render(<Siblings initialA initialB />);
    fireEvent.click(screen.getByRole('button', {name: 'Close A from B'}));
    expect(stackSummary()).toEqual(['A:exiting:1', 'B:top:0']);
    expect(getDialog('B')).toHaveAttribute('open');
    expect(getDialog('B')).not.toHaveAttribute('inert');
    finishExit(getDialog('A'));
    expect(stackSummary()).toEqual(['B:top:0']);
    expect(getDialog('B')).not.toHaveAttribute('data-sheet-stack');
    expect(openDialogs()).toEqual(['B']);
    // Nothing is stuck: B still closes normally.
    fireEvent.click(screen.getByRole('button', {name: 'Close B'}));
    finishExit(getDialog('B'));
    expect(openDialogs()).toEqual([]);
  });

  it('a sheet in a switcher step closes when the step is left', () => {
    const onNestedChange = vi.fn();
    function App() {
      const [step, setStep] = useState<string | null>('one');
      const [isNestedOpen, setIsNestedOpen] = useState(true);
      return (
        <>
          <button type="button" onClick={() => setStep('two')}>
            Step two
          </button>
          <BottomSheetSwitcher activeSheet={step} onActiveSheetChange={setStep}>
            <BottomSheet sheetId="one" label="One">
              <BottomSheet
                isOpen={isNestedOpen}
                onOpenChange={value => {
                  onNestedChange(value);
                  setIsNestedOpen(value);
                }}
                label="Nested">
                nested
              </BottomSheet>
            </BottomSheet>
            <BottomSheet sheetId="two" label="Two">
              two
            </BottomSheet>
          </BottomSheetSwitcher>
        </>
      );
    }
    render(<App />);
    expect(stackSummary()).toEqual(['One:covered:1', 'Nested:top:0']);
    fireEvent.click(screen.getByRole('button', {name: 'Step two'}));
    expect(onNestedChange).toHaveBeenCalledWith(false);
    expect(stackSummary()).toEqual(['Two:top:0', 'Nested:exiting:0']);
    finishExit(getDialog('Nested'));
    expect(stackSummary()).toEqual(['Two:top:0']);
  });
});

// ---------------------------------------------------------------------------
// Requirement 8 — focus
// ---------------------------------------------------------------------------

describe('R8 focus', () => {
  it('moves focus into a sheet when it opens, and returns it to the opener in the revealed sheet', () => {
    render(<Siblings initialA />);
    const openB = screen.getByRole('button', {name: 'Open B'});
    openB.focus();
    fireEvent.click(openB);
    expect(getPanel(getDialog('B'))).toHaveFocus();

    fireEvent.click(screen.getByRole('button', {name: 'Close B'}));
    finishExit(getDialog('B'));
    expect(openB).toHaveFocus();
  });

  it('focuses the revealed sheet’s panel when the opener is gone', () => {
    function App() {
      const [isAOpen, setIsAOpen] = useState(true);
      const [isBOpen, setIsBOpen] = useState(false);
      return (
        <>
          <BottomSheet isOpen={isAOpen} onOpenChange={setIsAOpen} label="A">
            {!isBOpen && (
              <button type="button" onClick={() => setIsBOpen(true)}>
                Open B
              </button>
            )}
          </BottomSheet>
          <BottomSheet isOpen={isBOpen} onOpenChange={setIsBOpen} label="B">
            <button type="button" onClick={() => setIsBOpen(false)}>
              Close B
            </button>
          </BottomSheet>
        </>
      );
    }
    render(<App />);
    const openB = screen.getByRole('button', {name: 'Open B'});
    openB.focus();
    fireEvent.click(openB);
    expect(openB).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', {name: 'Close B'}));
    finishExit(getDialog('B'));
    expect(getPanel(getDialog('A'))).toHaveFocus();
  });

  it('a deep link returns focus into the revealed sheet, not to the page', () => {
    render(<Nested initial />);
    expect(getPanel(getDialog('C'))).toHaveFocus();
    fireEvent.click(screen.getByRole('button', {name: 'Close C'}));
    finishExit(getDialog('C'));
    expect(getPanel(getDialog('B'))).toHaveFocus();
  });

  it('applies the standalone rules when the last sheet closes: the opener, or finalFocusRef', () => {
    function App() {
      const [isAOpen, setIsAOpen] = useState(false);
      const [isBOpen, setIsBOpen] = useState(false);
      return (
        <>
          <button type="button" onClick={() => setIsAOpen(true)}>
            Open A
          </button>
          <BottomSheet isOpen={isAOpen} onOpenChange={setIsAOpen} label="A">
            <button type="button" onClick={() => setIsBOpen(true)}>
              Open B
            </button>
          </BottomSheet>
          <BottomSheet isOpen={isBOpen} onOpenChange={setIsBOpen} label="B">
            <button
              type="button"
              onClick={() => {
                setIsBOpen(false);
                setIsAOpen(false);
              }}>
              Close all
            </button>
          </BottomSheet>
        </>
      );
    }
    render(<App />);
    const openA = screen.getByRole('button', {name: 'Open A'});
    openA.focus();
    fireEvent.click(openA);
    fireEvent.click(screen.getByRole('button', {name: 'Open B'}));
    fireEvent.click(screen.getByRole('button', {name: 'Close all'}));
    finishExit(getDialog('B'));
    finishExit(getDialog('A'));
    expect(openA).toHaveFocus();
    expect(openDialogs()).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// Requirement 9 — the native top layer
// ---------------------------------------------------------------------------

describe('R9 top layer', () => {
  it('keeps each sheet’s own dialog where it is written; nothing moves', () => {
    const {container} = render(
      <div data-testid="where-written">
        <Siblings initialA initialB />
      </div>,
    );
    const region = container.querySelector('[data-testid="where-written"]')!;
    expect(getDialog('A').parentElement).toBe(region);
    expect(getDialog('B').parentElement).toBe(region);
    expect(getDialog('A')).toHaveAttribute('open');
    expect(getDialog('B')).toHaveAttribute('open');
    expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalledTimes(2);
  });

  it('a Dialog opened from a stacked sheet paints above it, and a sheet opened from that Dialog paints above the Dialog', () => {
    function App() {
      const [isDialogOpen, setIsDialogOpen] = useState(false);
      const [isCOpen, setIsCOpen] = useState(false);
      return (
        <>
          <BottomSheet isOpen onOpenChange={() => {}} label="A">
            a
          </BottomSheet>
          <BottomSheet isOpen onOpenChange={() => {}} label="B">
            <button type="button" onClick={() => setIsDialogOpen(true)}>
              Open dialog
            </button>
            <Dialog
              isOpen={isDialogOpen}
              onOpenChange={setIsDialogOpen}
              aria-label="Over">
              <button type="button" onClick={() => setIsCOpen(true)}>
                Open C
              </button>
              <BottomSheet isOpen={isCOpen} onOpenChange={setIsCOpen} label="C">
                c
              </BottomSheet>
            </Dialog>
          </BottomSheet>
        </>
      );
    }
    render(<App />);
    fireEvent.click(screen.getByRole('button', {name: 'Open dialog'}));
    expect(topLayerOrder()).toEqual(['A', 'B', 'Over']);
    fireEvent.click(screen.getByRole('button', {name: 'Open C'}));
    expect(topLayerOrder()).toEqual(['A', 'B', 'Over', 'C']);
    // The Dialog is not a sheet: C is the top sheet over B, and the Dialog
    // sits between them in the top layer without entering the stack.
    expect(stackSummary()).toEqual(['A:covered:2', 'B:covered:1', 'C:top:0']);
    // B contains the Dialog that contains C, so inert on B would reach C.
    expect(getDialog('B')).not.toHaveAttribute('inert');
    expect(getDialog('A')).toHaveAttribute('inert');
  });
});

// ---------------------------------------------------------------------------
// Requirement 10 — concurrent React
// ---------------------------------------------------------------------------

describe('R10 concurrent React', () => {
  it('StrictMode leaves exactly one entry per sheet and every dialog open', () => {
    render(
      <StrictMode>
        <Siblings initialA initialB />
      </StrictMode>,
    );
    expect(stackSummary()).toEqual(['A:covered:1', 'B:top:0']);
    expect(openDialogs()).toEqual(['A', 'B']);
    expect(topLayerOrder()).toEqual(['A', 'B']);
    expect(getPanel(getDialog('B'))).toHaveFocus();
  });

  it('StrictMode keeps an out-of-tree-order stack in open order', () => {
    render(
      <StrictMode>
        <Siblings reversed />
      </StrictMode>,
    );
    fireEvent.click(screen.getByRole('button', {name: 'Open A'}));
    fireEvent.click(screen.getByRole('button', {name: 'Open B'}));
    expect(stackSummary()).toEqual(['A:covered:1', 'B:top:0']);
  });

  it('a transition that never commits has no effect', () => {
    const never = new Promise<never>(() => {});
    function Gate({children}: {children: ReactNode}): ReactNode {
      if (children != null) {
        // eslint-disable-next-line @typescript-eslint/only-throw-error -- Suspense protocol: a thrown promise suspends the subtree
        throw never;
      }
      return children;
    }
    let setShow!: (value: boolean) => void;
    function App() {
      const [show, set] = useState(false);
      setShow = set;
      return (
        <>
          <BottomSheet isOpen onOpenChange={() => {}} label="A">
            a
          </BottomSheet>
          <Suspense fallback={null}>
            {show ? (
              <Gate>
                <BottomSheet isOpen onOpenChange={() => {}} label="B">
                  b
                </BottomSheet>
              </Gate>
            ) : null}
          </Suspense>
        </>
      );
    }
    render(<App />);
    act(() => {
      startTransition(() => setShow(true));
    });
    expect(stackSummary()).toEqual(['A:top:0']);
    expect(openDialogs()).toEqual(['A']);
    expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalledTimes(1);
  });

  it('Suspense hide takes a sheet out of the stack; reveal re-presents it on top', async () => {
    let resolveGate!: () => void;
    const gate = new Promise<void>(resolve => {
      resolveGate = resolve;
    });
    let isSettled = false;
    void gate.then(() => {
      isSettled = true;
    });
    function MaybeSuspend({suspend}: {suspend: boolean}) {
      if (suspend && !isSettled) {
        // eslint-disable-next-line @typescript-eslint/only-throw-error -- Suspense protocol: a thrown promise suspends the subtree
        throw gate;
      }
      return null;
    }
    let setSuspend!: (value: boolean) => void;
    function App() {
      const [suspend, set] = useState(false);
      setSuspend = set;
      return (
        <>
          <BottomSheet isOpen onOpenChange={() => {}} label="A">
            a
          </BottomSheet>
          <Suspense fallback={<span data-testid="fallback" />}>
            <BottomSheet isOpen onOpenChange={() => {}} label="B">
              <MaybeSuspend suspend={suspend} />
            </BottomSheet>
          </Suspense>
          <BottomSheet isOpen onOpenChange={() => {}} label="C">
            c
          </BottomSheet>
        </>
      );
    }
    render(<App />);
    expect(stackSummary()).toEqual(['A:covered:2', 'B:covered:1', 'C:top:0']);

    act(() => setSuspend(true));
    expect(screen.getByTestId('fallback')).toBeInTheDocument();
    // The hidden sheet left the stack and the top layer: a modal dialog with
    // no box would otherwise keep blocking the page.
    expect(stackSummary()).toEqual(['A:covered:1', 'C:top:0']);
    expect(openDialogs()).toEqual(['A', 'C']);

    await act(async () => {
      resolveGate();
      await gate;
    });
    // Revealed: presented again, as the most recent open — on top.
    expect(stackSummary()).toEqual(['A:covered:2', 'C:covered:1', 'B:top:0']);
    expect(topLayerOrder()).toEqual(['A', 'C', 'B']);
  });

  it('Activity hidden takes a sheet out; visible re-presents it on top with its state', () => {
    let setHidden!: (value: boolean) => void;
    function App() {
      const [hidden, set] = useState(false);
      setHidden = set;
      return (
        <>
          <BottomSheet isOpen onOpenChange={() => {}} label="A">
            a
          </BottomSheet>
          <Activity mode={hidden ? 'hidden' : 'visible'}>
            <BottomSheet isOpen onOpenChange={() => {}} label="B">
              <input aria-label="bInput" defaultValue="" />
            </BottomSheet>
          </Activity>
          <BottomSheet isOpen onOpenChange={() => {}} label="C">
            c
          </BottomSheet>
        </>
      );
    }
    render(<App />);
    fireEvent.change(screen.getByLabelText('bInput'), {
      target: {value: 'kept'},
    });
    act(() => setHidden(true));
    expect(stackSummary()).toEqual(['A:covered:1', 'C:top:0']);
    expect(openDialogs()).toEqual(['A', 'C']);
    act(() => setHidden(false));
    expect(stackSummary()).toEqual(['A:covered:2', 'C:covered:1', 'B:top:0']);
    expect(screen.getByLabelText('bInput')).toHaveValue('kept');
  });

  it('SSR and hydration markup match, and the stack forms on the client', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    function App() {
      return (
        <BottomSheet isOpen onOpenChange={() => {}} label="A">
          <BottomSheet isOpen onOpenChange={() => {}} label="B">
            b
          </BottomSheet>
        </BottomSheet>
      );
    }
    const html = renderToString(<App />);
    expect(html).not.toContain('data-sheet-stack');
    const container = document.createElement('div');
    container.innerHTML = html;
    document.body.appendChild(container);
    let root!: ReturnType<typeof hydrateRoot>;
    await act(async () => {
      root = hydrateRoot(container, <App />);
    });
    expect(error).not.toHaveBeenCalled();
    expect(stackSummary()).toEqual(['A:covered:1', 'B:top:0']);
    expect(topLayerOrder()).toEqual(['A', 'B']);
    act(() => root.unmount());
    container.remove();
    error.mockRestore();
  });
});

// ---------------------------------------------------------------------------
// Requirement 11 — non-modal sheets stay out of the stack
// ---------------------------------------------------------------------------

describe('R11 non-modal sheets', () => {
  it('a hasScrim={false} sheet neither joins the stack nor recedes a modal sheet', () => {
    function App() {
      const [isNonModalOpen, setIsNonModalOpen] = useState(false);
      return (
        <>
          <BottomSheet isOpen onOpenChange={() => {}} label="Modal">
            <button type="button" onClick={() => setIsNonModalOpen(true)}>
              Open non-modal
            </button>
          </BottomSheet>
          <BottomSheet
            isOpen={isNonModalOpen}
            onOpenChange={setIsNonModalOpen}
            hasScrim={false}
            label="NonModal">
            non-modal
          </BottomSheet>
        </>
      );
    }
    render(<App />);
    fireEvent.click(screen.getByRole('button', {name: 'Open non-modal'}));
    expect(getDialog('NonModal')).toHaveAttribute('open');
    expect(HTMLDialogElement.prototype.show).toHaveBeenCalledTimes(1);
    expect(stackSummary()).toEqual(['Modal:top:0']);
    expect(getDialog('Modal')).not.toHaveAttribute('data-sheet-stack');
    expect(getDialog('NonModal')).not.toHaveAttribute('data-sheet-stack');
    expect(getComputedStyle(getPositioner(getDialog('Modal'))).transform).toBe(
      '',
    );
  });

  it('a modal sheet opened over a non-modal sheet does not recede it', () => {
    function App() {
      const [isModalOpen, setIsModalOpen] = useState(false);
      return (
        <>
          <BottomSheet
            isOpen
            onOpenChange={() => {}}
            hasScrim={false}
            label="NonModal">
            <button type="button" onClick={() => setIsModalOpen(true)}>
              Open modal
            </button>
          </BottomSheet>
          <BottomSheet
            isOpen={isModalOpen}
            onOpenChange={setIsModalOpen}
            label="Modal">
            modal
          </BottomSheet>
        </>
      );
    }
    render(<App />);
    fireEvent.click(screen.getByRole('button', {name: 'Open modal'}));
    expect(stackSummary()).toEqual(['Modal:top:0']);
    expect(getDialog('NonModal')).not.toHaveAttribute('data-sheet-stack');
    expect(getDialog('NonModal')).not.toHaveAttribute('inert');
    expect(
      getComputedStyle(getPositioner(getDialog('NonModal'))).transform,
    ).toBe('');
  });
});

// ---------------------------------------------------------------------------
// Requirement 12 — existing behaviour: the standalone and switcher contracts
// ---------------------------------------------------------------------------

describe('R12 existing behaviour', () => {
  it('a standalone sheet presented alone keeps its full contract after a stack has come and gone', () => {
    render(<Siblings initialA />);
    const a = getDialog('A');
    fireEvent.click(screen.getByRole('button', {name: 'Open B'}));
    fireEvent.click(screen.getByRole('button', {name: 'Close B'}));
    finishExit(getDialog('B'));
    expect(stackSummary()).toEqual(['A:top:0']);
    expect(a).not.toHaveAttribute('data-sheet-stack');
    expect(a).not.toHaveAttribute('inert');
    expect(scrim(a)).toBe('1');
    expect(getComputedStyle(getPositioner(a)).transform).toBe('');
    expect(classes(getPositioner(a))).not.toContain('positionerStackMotion');
    act(() => {
      pressEscape();
    });
    expect(stackSummary()).toEqual(['A:exiting:0']);
    finishExit(a);
    expect(openDialogs()).toEqual([]);
  });

  it('a switcher on its own keeps one showModal across handoffs and no stack state', () => {
    function Flow() {
      const [step, setStep] = useState<string | null>('one');
      return (
        <BottomSheetSwitcher activeSheet={step} onActiveSheetChange={setStep}>
          <BottomSheet sheetId="one" label="One">
            <button type="button" onClick={() => setStep('two')}>
              Next
            </button>
          </BottomSheet>
          <BottomSheet sheetId="two" label="Two">
            two
          </BottomSheet>
        </BottomSheetSwitcher>
      );
    }
    render(<Flow />);
    fireEvent.click(screen.getByRole('button', {name: 'Next'}));
    expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalledTimes(1);
    const dialog = getDialog('Two');
    expect(dialog).not.toHaveAttribute('data-sheet-stack');
    expect(dialog).not.toHaveAttribute('inert');
    expect(scrim(dialog)).toBe('1');
  });
});
