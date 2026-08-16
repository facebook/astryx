// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file BottomSheetSwitcher.test.tsx
 * @input Uses vitest, Testing Library, BottomSheet, BottomSheetSwitcher
 * @output Tests mutually exclusive sheet selection, dismissal, and focus handoff
 * @position Core tests for BottomSheetSwitcher
 *
 * SYNC: When BottomSheetSwitcher.tsx or its BottomSheet integration changes,
 * update these tests to match the public behavior.
 */

import {fireEvent, render, screen} from '@testing-library/react';
import {createRef, useState} from 'react';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {useFocusTrap} from '../hooks';
import {BottomSheet} from './BottomSheet';
import {BottomSheetSwitcher} from './BottomSheetSwitcher';

beforeEach(() => {
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
});

afterEach(() => {
  vi.unstubAllGlobals();
});

function Flow() {
  const [activeSheet, setActiveSheet] = useState<string | null>(null);
  return (
    <>
      <button type="button" onClick={() => setActiveSheet('details')}>
        Start flow
      </button>
      <BottomSheetSwitcher
        activeSheet={activeSheet}
        onActiveSheetChange={setActiveSheet}>
        <BottomSheet
          sheetId="details"
          label="Details"
          data-testid="details-sheet">
          <button type="button" onClick={() => setActiveSheet('confirm')}>
            Continue
          </button>
        </BottomSheet>
        <BottomSheet
          sheetId="confirm"
          label="Confirm"
          data-testid="confirm-sheet">
          <button type="button" onClick={() => setActiveSheet('details')}>
            Back
          </button>
        </BottomSheet>
      </BottomSheetSwitcher>
    </>
  );
}

function ConditionalFlow() {
  const [activeSheet, setActiveSheet] = useState<string | null>(null);
  return (
    <>
      <button type="button" onClick={() => setActiveSheet('details')}>
        Start conditional flow
      </button>
      <BottomSheetSwitcher
        activeSheet={activeSheet}
        onActiveSheetChange={setActiveSheet}>
        {activeSheet != null && (
          <BottomSheet sheetId={activeSheet} label="Conditional details">
            Content
          </BottomSheet>
        )}
      </BottomSheetSwitcher>
    </>
  );
}

function NestedStandaloneSheetFlow() {
  const [isNestedOpen, setIsNestedOpen] = useState(false);
  return (
    <BottomSheetSwitcher activeSheet="details" onActiveSheetChange={() => {}}>
      <BottomSheet sheetId="details" label="Details">
        <button type="button" onClick={() => setIsNestedOpen(true)}>
          Open nested sheet
        </button>
        <BottomSheet
          isOpen={isNestedOpen}
          onOpenChange={setIsNestedOpen}
          label="Nested standalone sheet">
          Nested content
        </BottomSheet>
      </BottomSheet>
    </BottomSheetSwitcher>
  );
}

function NestedEscapeTrap({onEscape}: {onEscape: () => void}) {
  const {containerRef} = useFocusTrap<HTMLDivElement>({
    isActive: true,
    onEscape,
  });
  return (
    <div ref={containerRef} data-testid="nested-escape-trap">
      Nested layer
    </div>
  );
}

const panelRefA = (_element: HTMLDivElement | null) => {};
const panelRefB = (_element: HTMLDivElement | null) => {};

function CallbackRefFlow() {
  const [activeSheet, setActiveSheet] = useState<string | null>('details');
  const [useAlternateRef, setUseAlternateRef] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setUseAlternateRef(current => !current)}>
        Rerender parent
      </button>
      <BottomSheetSwitcher
        activeSheet={activeSheet}
        onActiveSheetChange={setActiveSheet}>
        <BottomSheet
          ref={useAlternateRef ? panelRefB : panelRefA}
          sheetId="details"
          label="Details"
          data-testid="callback-details-sheet">
          <button type="button" onClick={() => setActiveSheet('confirm')}>
            Continue with callback ref
          </button>
        </BottomSheet>
        <BottomSheet
          sheetId="confirm"
          label="Confirm"
          data-testid="callback-confirm-sheet">
          Confirmation
        </BottomSheet>
      </BottomSheetSwitcher>
    </>
  );
}

function ModeSwitchFlow() {
  const [activeSheet, setActiveSheet] = useState<string | null>(null);
  const [hasScrim, setHasScrim] = useState(true);
  return (
    <>
      <button type="button" onClick={() => setActiveSheet('details')}>
        Open first modal
      </button>
      <button
        type="button"
        onClick={() => {
          setHasScrim(true);
          setActiveSheet('details');
        }}>
        Open second modal
      </button>
      <BottomSheetSwitcher
        activeSheet={activeSheet}
        onActiveSheetChange={setActiveSheet}
        hasScrim={hasScrim}>
        <BottomSheet
          sheetId="details"
          label="Details"
          data-testid="mode-details-sheet">
          <button type="button" onClick={() => setHasScrim(false)}>
            Make non-modal
          </button>
          <button type="button" onClick={() => setActiveSheet(null)}>
            Close flow
          </button>
        </BottomSheet>
      </BottomSheetSwitcher>
    </>
  );
}

function getSharedDialog(): HTMLDialogElement {
  return screen.getByRole<HTMLDialogElement>('dialog');
}

function finishSheetTransition(
  element: HTMLElement,
  propertyName: 'transform' | 'opacity',
) {
  const sheet = getSheetPanel(element);
  fireEvent.transitionEnd(sheet, {propertyName});
}

function getSheetPanel(element: HTMLElement): HTMLElement {
  if (element.classList.contains('astryx-bottom-sheet')) {
    return element;
  }
  const sheet = element.querySelector<HTMLElement>('.astryx-bottom-sheet');
  if (!sheet) {
    throw new Error('sheet panel not found');
  }
  return sheet;
}

function getSheetLayer(testId: string): HTMLElement {
  const panel = screen.getByTestId(testId);
  const layer = panel.parentElement;
  if (layer == null) {
    throw new Error('sheet layer not found');
  }
  return layer;
}

function mockSheetTop(sheet: HTMLElement, top: number) {
  const rect = {
    x: 0,
    y: top,
    top,
    right: 640,
    bottom: 800,
    left: 0,
    width: 640,
    height: 800 - top,
    toJSON: () => {},
  };
  vi.spyOn(sheet, 'getBoundingClientRect').mockReturnValue(rect);
  if (sheet.parentElement) {
    vi.spyOn(sheet.parentElement, 'getBoundingClientRect').mockReturnValue(
      rect,
    );
  }
}

describe('BottomSheetSwitcher', () => {
  it('opens only the sheet selected by activeSheet', () => {
    render(<Flow />);

    fireEvent.click(screen.getByRole('button', {name: 'Start flow'}));

    expect(getSheetLayer('details-sheet')).not.toHaveAttribute('hidden');
    expect(getSheetLayer('confirm-sheet')).toHaveAttribute('hidden');
    expect(getSheetLayer('confirm-sheet')).toHaveStyle({display: 'none'});
    expect(document.querySelectorAll('dialog[open]')).toHaveLength(1);
    expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalledTimes(1);
    expect(HTMLDialogElement.prototype.show).not.toHaveBeenCalled();
    expect(getSharedDialog()).toHaveAttribute('aria-modal', 'true');
    expect(getSharedDialog()).toHaveAccessibleName('Details');
  });

  it('forwards sheet DOM props and refs to its panel in the shared dialog', () => {
    const panelRef = createRef<HTMLDivElement>();

    render(
      <BottomSheetSwitcher activeSheet="details" onActiveSheetChange={() => {}}>
        <BottomSheet
          ref={panelRef}
          sheetId="details"
          label="Details"
          data-testid="details-layer"
          data-sheet-owner="settings">
          Content
        </BottomSheet>
      </BottomSheetSwitcher>,
    );

    const panel = screen.getByTestId('details-layer');
    expect(panelRef.current).toBe(panel);
    expect(panel).toHaveClass('astryx-bottom-sheet');
    expect(panel).toHaveAttribute('data-sheet-owner', 'settings');
    expect(getSharedDialog()).toContainElement(panel);
  });

  it('forwards switcher DOM props, events, styles, and refs to the shared dialog', () => {
    const dialogRef = createRef<HTMLDialogElement>();
    const onClick = vi.fn();
    const onActiveSheetChange = vi.fn();

    render(
      <BottomSheetSwitcher
        ref={dialogRef}
        activeSheet="details"
        onActiveSheetChange={onActiveSheetChange}
        aria-label="Notification setup"
        data-flow-owner="settings"
        className="consumer-switcher"
        style={{insetInlineStart: 12}}
        onClick={onClick}>
        <BottomSheet sheetId="details" label="Details">
          Content
        </BottomSheet>
      </BottomSheetSwitcher>,
    );

    const dialog = getSharedDialog();
    expect(dialogRef.current).toBe(dialog);
    expect(dialog).toHaveAccessibleName('Notification setup');
    expect(dialog).toHaveAttribute('data-flow-owner', 'settings');
    expect(dialog).toHaveClass('consumer-switcher');
    expect(dialog).toHaveStyle({insetInlineStart: '12px'});

    fireEvent.click(dialog);
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onActiveSheetChange).toHaveBeenCalledWith(null);
  });

  it('resets switcher context for a sheet nested inside item content', () => {
    render(<NestedStandaloneSheetFlow />);
    const opener = screen.getByRole('button', {name: 'Open nested sheet'});
    opener.focus();
    fireEvent.click(opener);

    const nestedDialog = screen.getByRole('dialog', {
      name: 'Nested standalone sheet',
    });
    expect(nestedDialog).toHaveAttribute('open');
    expect(getSheetPanel(nestedDialog)).toHaveFocus();
    expect(document.querySelectorAll('dialog[open]')).toHaveLength(2);
    expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalledTimes(2);

    fireEvent.keyDown(nestedDialog, {key: 'Escape'});
    finishSheetTransition(nestedDialog, 'transform');

    expect(nestedDialog).not.toHaveAttribute('open');
    expect(getSharedDialog()).toHaveAttribute('open');
    expect(opener).toHaveFocus();
  });

  it('keeps the previous sheet stationary until the new entrance finishes, then fades it', () => {
    render(<Flow />);
    fireEvent.click(screen.getByRole('button', {name: 'Start flow'}));
    const sharedDialog = getSharedDialog();
    const detailsSheet = getSheetLayer('details-sheet');
    const confirmSheet = getSheetLayer('confirm-sheet');

    fireEvent.click(screen.getByRole('button', {name: 'Continue'}));

    expect(detailsSheet).not.toHaveAttribute('hidden');
    expect(detailsSheet).toHaveAttribute('inert');
    expect(detailsSheet).toHaveAttribute('aria-hidden', 'true');
    expect(confirmSheet).not.toHaveAttribute('hidden');
    expect(confirmSheet).not.toHaveAttribute('inert');
    expect(document.querySelectorAll('dialog[open]')).toHaveLength(1);
    expect(getSharedDialog()).toBe(sharedDialog);
    expect(sharedDialog).toHaveAccessibleName('Confirm');

    // The previous sheet is covered, not exiting: neither transform nor
    // opacity completion may release it before the new entrance completes.
    finishSheetTransition(detailsSheet, 'transform');
    finishSheetTransition(detailsSheet, 'opacity');
    expect(detailsSheet).not.toHaveAttribute('hidden');

    finishSheetTransition(confirmSheet, 'transform');
    expect(detailsSheet).not.toHaveAttribute('hidden');

    finishSheetTransition(detailsSheet, 'opacity');

    expect(detailsSheet).toHaveAttribute('hidden');
    expect(confirmSheet).not.toHaveAttribute('hidden');
    expect(document.querySelectorAll('dialog[open]')).toHaveLength(1);
    expect(getSharedDialog()).toBe(sharedDialog);

    fireEvent.click(screen.getByRole('button', {name: 'Back'}));

    expect(detailsSheet).not.toHaveAttribute('hidden');
    expect(confirmSheet).not.toHaveAttribute('hidden');
    expect(confirmSheet).toHaveAttribute('inert');
    finishSheetTransition(detailsSheet, 'transform');
    expect(confirmSheet).not.toHaveAttribute('hidden');
    finishSheetTransition(confirmSheet, 'opacity');

    expect(detailsSheet).not.toHaveAttribute('hidden');
    expect(confirmSheet).toHaveAttribute('hidden');
    expect(document.querySelectorAll('dialog[open]')).toHaveLength(1);
    expect(getSharedDialog()).toBe(sharedDialog);
  });

  it('moves a taller previous sheet down while the shorter new sheet enters, then waits for both', () => {
    render(<Flow />);
    fireEvent.click(screen.getByRole('button', {name: 'Start flow'}));
    const detailsSheet = getSheetLayer('details-sheet');
    const confirmSheet = getSheetLayer('confirm-sheet');
    const detailsPanel = getSheetPanel(detailsSheet);
    const confirmPanel = getSheetPanel(confirmSheet);
    mockSheetTop(detailsPanel, 100);
    mockSheetTop(confirmPanel, 300);

    fireEvent.click(screen.getByRole('button', {name: 'Continue'}));

    expect(detailsSheet).not.toHaveAttribute('hidden');
    expect(detailsPanel).toHaveStyle({transform: 'translateY(200px)'});

    // The incoming entrance may finish first, but opacity cannot hide the
    // retained sheet until its concurrent alignment also completes.
    finishSheetTransition(confirmSheet, 'transform');
    finishSheetTransition(detailsSheet, 'opacity');
    expect(detailsSheet).not.toHaveAttribute('hidden');
    finishSheetTransition(detailsSheet, 'transform');
    expect(detailsSheet).not.toHaveAttribute('hidden');
    expect(detailsPanel).toHaveStyle({transform: 'translateY(200px)'});
    finishSheetTransition(detailsSheet, 'opacity');

    expect(detailsSheet).toHaveAttribute('hidden');
    expect(confirmSheet).not.toHaveAttribute('hidden');
  });

  it('waits for the incoming entrance when top-edge alignment finishes first', () => {
    render(<Flow />);
    fireEvent.click(screen.getByRole('button', {name: 'Start flow'}));
    const detailsSheet = getSheetLayer('details-sheet');
    const confirmSheet = getSheetLayer('confirm-sheet');
    const detailsPanel = getSheetPanel(detailsSheet);
    mockSheetTop(detailsPanel, 100);
    mockSheetTop(getSheetPanel(confirmSheet), 300);

    fireEvent.click(screen.getByRole('button', {name: 'Continue'}));
    expect(detailsPanel).toHaveStyle({transform: 'translateY(200px)'});

    finishSheetTransition(detailsSheet, 'transform');
    finishSheetTransition(detailsSheet, 'opacity');
    expect(detailsSheet).not.toHaveAttribute('hidden');
    finishSheetTransition(confirmSheet, 'transform');
    finishSheetTransition(detailsSheet, 'opacity');

    expect(detailsSheet).toHaveAttribute('hidden');
    expect(confirmSheet).not.toHaveAttribute('hidden');
  });

  it('replaces an unfinished outgoing sheet during rapid navigation', () => {
    render(<Flow />);
    fireEvent.click(screen.getByRole('button', {name: 'Start flow'}));
    const detailsSheet = getSheetLayer('details-sheet');
    const confirmSheet = getSheetLayer('confirm-sheet');

    fireEvent.click(screen.getByRole('button', {name: 'Continue'}));
    fireEvent.click(screen.getByRole('button', {name: 'Back'}));

    expect(detailsSheet).not.toHaveAttribute('hidden');
    expect(detailsSheet).not.toHaveAttribute('inert');
    expect(confirmSheet).not.toHaveAttribute('hidden');
    expect(confirmSheet).toHaveAttribute('inert');
    expect(document.querySelectorAll('dialog[open]')).toHaveLength(1);

    finishSheetTransition(confirmSheet, 'opacity');
    expect(detailsSheet).not.toHaveAttribute('hidden');
    expect(confirmSheet).toHaveAttribute('hidden');
  });

  it('ignores late scrim updates from an outgoing sheet gesture', () => {
    render(<Flow />);
    fireEvent.click(screen.getByRole('button', {name: 'Start flow'}));

    const detailsPanel = getSheetPanel(getSheetLayer('details-sheet'));
    mockSheetTop(detailsPanel, 100);
    const handle = detailsPanel.firstElementChild;
    if (!(handle instanceof HTMLElement)) {
      throw new Error('sheet handle not found');
    }

    fireEvent.pointerDown(handle, {
      pointerId: 1,
      clientY: 100,
      timeStamp: 0,
      button: 0,
      isPrimary: true,
    });
    fireEvent.pointerMove(handle, {
      pointerId: 1,
      clientY: 600,
      timeStamp: 16,
    });
    expect(
      getSharedDialog().style.getPropertyValue('--_sheet-scrim-opacity'),
    ).not.toBe('1');

    fireEvent.click(screen.getByRole('button', {name: 'Continue'}));
    expect(getSharedDialog()).toHaveStyle({'--_sheet-scrim-opacity': '1'});

    fireEvent.pointerMove(handle, {
      pointerId: 1,
      clientY: 680,
      timeStamp: 32,
    });
    expect(getSharedDialog()).toHaveStyle({'--_sheet-scrim-opacity': '1'});
  });

  it('keeps an active handoff when a consumer callback ref changes', () => {
    render(<CallbackRefFlow />);
    const detailsSheet = getSheetLayer('callback-details-sheet');
    const confirmSheet = getSheetLayer('callback-confirm-sheet');

    fireEvent.click(
      screen.getByRole('button', {name: 'Continue with callback ref'}),
    );
    expect(detailsSheet).not.toHaveAttribute('hidden');
    expect(detailsSheet).toHaveAttribute('inert');
    expect(confirmSheet).not.toHaveAttribute('hidden');

    fireEvent.click(screen.getByRole('button', {name: 'Rerender parent'}));

    expect(detailsSheet).not.toHaveAttribute('hidden');
    expect(detailsSheet).toHaveAttribute('inert');
    expect(confirmSheet).not.toHaveAttribute('hidden');
  });

  it('dismisses the flow from the one shared scrim', () => {
    render(<Flow />);
    fireEvent.click(screen.getByRole('button', {name: 'Start flow'}));
    const sharedDialog = getSharedDialog();

    fireEvent.click(sharedDialog);

    const outgoingSheet = getSheetLayer('details-sheet');
    expect(outgoingSheet).not.toHaveAttribute('hidden');
    expect(outgoingSheet).toHaveAttribute('inert');
    expect(sharedDialog).toHaveStyle({'--_sheet-scrim-opacity': '0'});
    expect(document.body.style.position).toBe('fixed');

    finishSheetTransition(outgoingSheet, 'transform');

    expect(sharedDialog).not.toHaveAttribute('open');
    expect(document.body.style.position).not.toBe('fixed');
  });

  it('releases the shared modal layer when the closing sheet unmounts immediately', () => {
    render(<ConditionalFlow />);
    fireEvent.click(
      screen.getByRole('button', {name: 'Start conditional flow'}),
    );
    const sharedDialog = screen.getByRole('dialog', {
      name: 'Conditional details',
    });

    fireEvent.keyDown(sharedDialog, {key: 'Escape'});

    expect(sharedDialog).not.toHaveAttribute('open');
    expect(document.body.style.position).not.toBe('fixed');
  });

  it('keeps the shared dialog inline and opens it modally', () => {
    render(
      <div
        data-testid="clipping-ancestor"
        style={{overflow: 'hidden', transform: 'translateY(100px)'}}>
        <BottomSheetSwitcher
          activeSheet="details"
          onActiveSheetChange={() => {}}>
          <BottomSheet sheetId="details" label="Inline modal details">
            Content
          </BottomSheet>
        </BottomSheetSwitcher>
      </div>,
    );

    const clippingAncestor = screen.getByTestId('clipping-ancestor');
    const dialog = screen.getByRole('dialog', {name: 'Inline modal details'});
    expect(clippingAncestor).toContainElement(dialog);
    expect(dialog).toHaveAttribute('open');
    expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalledTimes(1);
  });

  it('keeps focus in a modal sheet that has no tabbable controls', () => {
    render(
      <>
        <button type="button">Background action</button>
        <BottomSheetSwitcher
          activeSheet="details"
          onActiveSheetChange={() => {}}>
          <BottomSheet sheetId="details" label="Read-only details">
            Read-only content
          </BottomSheet>
        </BottomSheetSwitcher>
      </>,
    );

    const dialog = screen.getByRole('dialog', {name: 'Read-only details'});
    const panel = getSheetPanel(dialog);
    expect(panel).toHaveFocus();
    expect(fireEvent.keyDown(panel, {key: 'Tab'})).toBe(false);
    expect(panel).toHaveFocus();
    expect(
      screen.getByRole('button', {name: 'Background action'}),
    ).not.toHaveFocus();
  });

  it('can coordinate a non-modal flow without rendering a scrim', () => {
    render(
      <BottomSheetSwitcher
        activeSheet="details"
        onActiveSheetChange={() => {}}
        hasScrim={false}>
        <BottomSheet sheetId="details" label="Details">
          Content
        </BottomSheet>
      </BottomSheetSwitcher>,
    );

    const dialog = getSharedDialog();
    expect(dialog).not.toHaveAttribute('aria-modal');
    expect(dialog).toHaveAttribute('open');
    expect(HTMLDialogElement.prototype.show).toHaveBeenCalledTimes(1);
    expect(HTMLDialogElement.prototype.showModal).not.toHaveBeenCalled();
    expect(document.body.style.position).not.toBe('fixed');
  });

  it('requests activeSheet=null when the active sheet dismisses', () => {
    const onActiveSheetChange = vi.fn();
    render(
      <BottomSheetSwitcher
        activeSheet="details"
        onActiveSheetChange={onActiveSheetChange}>
        <BottomSheet sheetId="details" label="Details">
          Content
        </BottomSheet>
        <BottomSheet sheetId="confirm" label="Confirm">
          Content
        </BottomSheet>
      </BottomSheetSwitcher>,
    );

    fireEvent.keyDown(screen.getByRole('dialog', {name: 'Details'}), {
      key: 'Escape',
    });

    expect(onActiveSheetChange).toHaveBeenCalledWith(null);
  });

  it('honors purpose=form for a switcher-managed sheet', () => {
    const onActiveSheetChange = vi.fn();
    render(
      <BottomSheetSwitcher
        activeSheet="details"
        onActiveSheetChange={onActiveSheetChange}>
        <BottomSheet sheetId="details" label="Edit details" purpose="form">
          Content
        </BottomSheet>
      </BottomSheetSwitcher>,
    );
    const dialog = getSharedDialog();
    const panel = getSheetPanel(dialog);
    const handle = panel.firstElementChild;
    if (!(handle instanceof HTMLElement)) {
      throw new Error('sheet handle not found');
    }

    fireEvent.click(dialog);
    fireEvent.pointerDown(handle, {
      pointerId: 1,
      clientY: 0,
      button: 0,
      isPrimary: true,
    });
    fireEvent.pointerMove(handle, {pointerId: 1, clientY: 120});
    fireEvent.pointerUp(handle, {pointerId: 1, clientY: 120});

    expect(onActiveSheetChange).not.toHaveBeenCalled();
    expect(dialog).toHaveStyle({'--_sheet-scrim-opacity': '1'});

    fireEvent.keyDown(dialog, {key: 'Escape'});
    fireEvent(dialog, new Event('cancel', {cancelable: true}));

    expect(onActiveSheetChange).toHaveBeenCalledTimes(2);
    expect(onActiveSheetChange).toHaveBeenNthCalledWith(1, null);
    expect(onActiveSheetChange).toHaveBeenNthCalledWith(2, null);
  });

  it('honors purpose=required for a switcher-managed sheet', () => {
    const onActiveSheetChange = vi.fn();
    render(
      <BottomSheetSwitcher
        activeSheet="details"
        onActiveSheetChange={onActiveSheetChange}>
        <BottomSheet
          sheetId="details"
          label="Required details"
          purpose="required">
          Content
        </BottomSheet>
      </BottomSheetSwitcher>,
    );
    const dialog = screen.getByRole('alertdialog');
    const panel = getSheetPanel(dialog);
    const handle = panel.firstElementChild;
    if (!(handle instanceof HTMLElement)) {
      throw new Error('sheet handle not found');
    }

    fireEvent.click(dialog);
    fireEvent.keyDown(dialog, {key: 'Escape'});
    fireEvent(dialog, new Event('cancel', {cancelable: true}));
    fireEvent.pointerDown(handle, {
      pointerId: 1,
      clientY: 0,
      button: 0,
      isPrimary: true,
    });
    fireEvent.pointerMove(handle, {pointerId: 1, clientY: 120});
    fireEvent.pointerUp(handle, {pointerId: 1, clientY: 120});

    expect(onActiveSheetChange).not.toHaveBeenCalled();
    expect(dialog).toHaveStyle({'--_sheet-scrim-opacity': '1'});
  });

  it('restores the active sheet when a context menu interrupts its drag', () => {
    const onActiveSheetChange = vi.fn();
    render(
      <BottomSheetSwitcher
        activeSheet="details"
        onActiveSheetChange={onActiveSheetChange}>
        <BottomSheet sheetId="details" label="Details">
          Content
        </BottomSheet>
      </BottomSheetSwitcher>,
    );
    const dialog = getSharedDialog();
    const panel = getSheetPanel(dialog);
    const handle = panel.firstElementChild;
    if (!(handle instanceof HTMLElement)) {
      throw new Error('sheet handle not found');
    }

    fireEvent.pointerDown(handle, {
      pointerId: 1,
      clientY: 0,
      button: 0,
      isPrimary: true,
    });
    fireEvent.pointerMove(handle, {pointerId: 1, clientY: 300});
    expect(panel.style.transform).toBe('translateY(300px)');

    expect(fireEvent.contextMenu(handle)).toBe(false);

    expect(panel.style.transform).toBe('');
    expect(dialog).toHaveStyle({'--_sheet-scrim-opacity': '1'});
    expect(onActiveSheetChange).not.toHaveBeenCalled();
  });

  it('ignores Escape while an IME composition is active', () => {
    const onActiveSheetChange = vi.fn();
    render(
      <BottomSheetSwitcher
        activeSheet="details"
        onActiveSheetChange={onActiveSheetChange}>
        <BottomSheet sheetId="details" label="Details">
          Content
        </BottomSheet>
      </BottomSheetSwitcher>,
    );

    const dialog = screen.getByRole('dialog', {name: 'Details'});
    fireEvent.keyDown(dialog, {key: 'Escape', isComposing: true});
    fireEvent.keyDown(dialog, {key: 'Escape', keyCode: 229});

    expect(onActiveSheetChange).not.toHaveBeenCalled();
  });

  it('lets a nested focus trap handle Escape before the switcher', () => {
    const onActiveSheetChange = vi.fn();
    const onNestedEscape = vi.fn();
    render(
      <BottomSheetSwitcher
        activeSheet="details"
        onActiveSheetChange={onActiveSheetChange}>
        <BottomSheet sheetId="details" label="Details">
          <NestedEscapeTrap onEscape={onNestedEscape} />
        </BottomSheet>
      </BottomSheetSwitcher>,
    );

    fireEvent.keyDown(screen.getByTestId('nested-escape-trap'), {
      key: 'Escape',
    });

    expect(onNestedEscape).toHaveBeenCalledTimes(1);
    expect(onActiveSheetChange).not.toHaveBeenCalled();
  });

  it('returns focus to the original opener after a multi-sheet flow ends', () => {
    render(<Flow />);
    const opener = screen.getByRole('button', {name: 'Start flow'});
    opener.focus();
    fireEvent.click(opener);
    fireEvent.click(screen.getByRole('button', {name: 'Continue'}));

    fireEvent.keyDown(screen.getByRole('dialog', {name: 'Confirm'}), {
      key: 'Escape',
    });
    expect(document.activeElement).not.toBe(opener);
    finishSheetTransition(getSheetLayer('confirm-sheet'), 'transform');

    expect(document.activeElement).toBe(opener);
  });

  it('captures a new focus trigger after switching through non-modal mode', () => {
    render(<ModeSwitchFlow />);
    const firstOpener = screen.getByRole('button', {name: 'Open first modal'});
    const secondOpener = screen.getByRole('button', {
      name: 'Open second modal',
    });

    firstOpener.focus();
    fireEvent.click(firstOpener);
    fireEvent.click(screen.getByRole('button', {name: 'Make non-modal'}));
    fireEvent.click(screen.getByRole('button', {name: 'Close flow'}));
    finishSheetTransition(getSheetLayer('mode-details-sheet'), 'transform');

    secondOpener.focus();
    fireEvent.click(secondOpener);
    fireEvent.click(screen.getByRole('button', {name: 'Close flow'}));
    finishSheetTransition(getSheetLayer('mode-details-sheet'), 'transform');

    expect(document.activeElement).toBe(secondOpener);
  });

  it('does not refocus the panel when an incoming transition completes', () => {
    render(<Flow />);
    fireEvent.click(screen.getByRole('button', {name: 'Start flow'}));
    fireEvent.click(screen.getByRole('button', {name: 'Continue'}));

    const confirmSheet = getSheetLayer('confirm-sheet');
    const backButton = screen.getByRole('button', {name: 'Back'});
    backButton.focus();
    finishSheetTransition(confirmSheet, 'transform');

    expect(backButton).toHaveFocus();
  });
});
