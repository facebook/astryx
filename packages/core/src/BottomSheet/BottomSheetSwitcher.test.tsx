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
import {
  createRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {Dialog} from '../Dialog';
import {hasActiveFocusTrapEscape, useFocusTrap} from '../hooks';
import {useLayerDismissal} from '../Layer/useLayerDismissal';
import {BottomSheet} from './BottomSheet';
import {BottomSheetSwitcher} from './BottomSheetSwitcher';
import {SHEET_DIALOG_ATTRIBUTE} from './sheetScrollLock';

// jsdom implements no <dialog> presentation. The stubs record which open
// dialogs are modal, standing in for the `:modal` pseudo-class jsdom cannot
// match, so the CSS scroll lock's precondition can be read from the DOM.
const modalDialogs = new WeakSet<HTMLDialogElement>();
beforeEach(() => {
  HTMLDialogElement.prototype.showModal = vi.fn(function (
    this: HTMLDialogElement,
  ) {
    this.setAttribute('open', '');
    modalDialogs.add(this);
  });
  HTMLDialogElement.prototype.show = vi.fn(function (this: HTMLDialogElement) {
    this.setAttribute('open', '');
  });
  HTMLDialogElement.prototype.close = vi.fn(function (this: HTMLDialogElement) {
    this.removeAttribute('open');
    modalDialogs.delete(this);
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

function NestedDismissibleLayer({onDismiss}: {onDismiss: () => void}) {
  const [isOpen, setIsOpen] = useState(true);
  useLayerDismissal({
    isActive: isOpen,
    onDismiss: () => {
      setIsOpen(false);
      onDismiss();
    },
  });
  return (
    <button type="button">
      {isOpen ? 'Nested layer open' : 'Nested layer closed'}
    </button>
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

function RequiredConfirmFlow() {
  const [activeSheet, setActiveSheet] = useState<string | null>('details');
  return (
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
        purpose="required"
        data-testid="confirm-sheet">
        <button type="button" onClick={() => setActiveSheet(null)}>
          Done
        </button>
      </BottomSheet>
    </BottomSheetSwitcher>
  );
}

function DialogInStepFlow() {
  const [activeSheet, setActiveSheet] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
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
          <button type="button" onClick={() => setIsDialogOpen(true)}>
            Open dialog
          </button>
          <Dialog
            isOpen={isDialogOpen}
            onOpenChange={setIsDialogOpen}
            aria-label="Are you sure">
            <button type="button" onClick={() => setIsDialogOpen(false)}>
              Close dialog
            </button>
          </Dialog>
          <button type="button" onClick={() => setActiveSheet(null)}>
            Done
          </button>
        </BottomSheet>
      </BottomSheetSwitcher>
    </>
  );
}

/**
 * The dialog hosting the active sheet. A retained sheet's dialog is inert and
 * `aria-hidden`, so only the active sheet's dialog is exposed by role.
 */
function getActiveDialog(): HTMLDialogElement {
  return screen.getByRole<HTMLDialogElement>('dialog');
}

function getSheetDialog(testId: string): HTMLDialogElement {
  const dialog = screen.getByTestId(testId).closest('dialog');
  if (dialog == null) {
    throw new Error('sheet dialog not found');
  }
  return dialog;
}

function openDialogs(): HTMLDialogElement[] {
  return Array.from(
    document.querySelectorAll<HTMLDialogElement>('dialog[open]'),
  );
}

/**
 * Whether the CSS page-scroll lock is engaged: its selector,
 * `:root:has(dialog[data-sheet-dialog]:modal)`, matches exactly when an open
 * sheet dialog was presented with showModal(). The browser spec measures the
 * lock itself; this reads its precondition.
 */
function isScrollLockEngaged(): boolean {
  return Array.from(
    document.querySelectorAll<HTMLDialogElement>(
      `dialog[${SHEET_DIALOG_ATTRIBUTE}][open]`,
    ),
  ).some(dialog => modalDialogs.has(dialog));
}

/**
 * Records every native dialog call with the dialog's accessible label, and
 * returns focus the way a browser does: close() on a dialog presented with
 * showModal() focuses the element that was focused when it was presented.
 */
function recordDialogCalls(): string[] {
  const log: string[] = [];
  const focusedAtPresent = new WeakMap<HTMLDialogElement, Element | null>();
  const record = (name: string) =>
    vi.fn(function (this: HTMLDialogElement) {
      log.push(`${name}:${this.getAttribute('aria-label') ?? '?'}`);
      if (name === 'close') {
        this.removeAttribute('open');
        const wasModal = modalDialogs.delete(this);
        const previouslyFocused = focusedAtPresent.get(this);
        focusedAtPresent.delete(this);
        if (
          wasModal &&
          previouslyFocused instanceof HTMLElement &&
          previouslyFocused.isConnected &&
          previouslyFocused.closest('[inert]') == null
        ) {
          previouslyFocused.focus();
        }
      } else {
        if (name === 'showModal') {
          focusedAtPresent.set(this, document.activeElement);
          modalDialogs.add(this);
        }
        this.setAttribute('open', '');
      }
    });
  HTMLDialogElement.prototype.showModal = record('showModal');
  HTMLDialogElement.prototype.show = record('show');
  HTMLDialogElement.prototype.close = record('close');
  return log;
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
    expect(getActiveDialog()).toHaveAttribute('aria-modal', 'true');
    expect(getActiveDialog()).toHaveAccessibleName('Details');
  });

  it('forwards sheet DOM props and refs to its panel in its dialog', () => {
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
    expect(getActiveDialog()).toContainElement(panel);
  });

  it("forwards switcher DOM props, events, styles, and refs to the active sheet's dialog", () => {
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

    const dialog = getActiveDialog();
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
    expect(getActiveDialog()).toHaveAttribute('open');
    expect(opener).toHaveFocus();
  });

  it('keeps the previous sheet stationary until the new entrance finishes, then fades it', () => {
    render(<Flow />);
    fireEvent.click(screen.getByRole('button', {name: 'Start flow'}));
    const detailsDialog = getSheetDialog('details-sheet');
    const confirmDialog = getSheetDialog('confirm-sheet');
    expect(getActiveDialog()).toBe(detailsDialog);
    const detailsSheet = getSheetLayer('details-sheet');
    const confirmSheet = getSheetLayer('confirm-sheet');

    fireEvent.click(screen.getByRole('button', {name: 'Continue'}));

    expect(detailsSheet).not.toHaveAttribute('hidden');
    expect(detailsSheet).toHaveAttribute('inert');
    expect(detailsSheet).toHaveAttribute('aria-hidden', 'true');
    expect(confirmSheet).not.toHaveAttribute('hidden');
    expect(confirmSheet).not.toHaveAttribute('inert');
    // Both dialogs stay open through the handoff; the retained one is inert.
    expect(openDialogs()).toEqual([detailsDialog, confirmDialog]);
    expect(detailsDialog).toHaveAttribute('inert');
    expect(getActiveDialog()).toBe(confirmDialog);
    expect(confirmDialog).toHaveAccessibleName('Confirm');

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
    expect(openDialogs()).toEqual([confirmDialog]);
    expect(getActiveDialog()).toBe(confirmDialog);

    fireEvent.click(screen.getByRole('button', {name: 'Back'}));

    expect(detailsSheet).not.toHaveAttribute('hidden');
    expect(confirmSheet).not.toHaveAttribute('hidden');
    expect(confirmSheet).toHaveAttribute('inert');
    finishSheetTransition(detailsSheet, 'transform');
    expect(confirmSheet).not.toHaveAttribute('hidden');
    finishSheetTransition(confirmSheet, 'opacity');

    expect(detailsSheet).not.toHaveAttribute('hidden');
    expect(confirmSheet).toHaveAttribute('hidden');
    expect(openDialogs()).toEqual([detailsDialog]);
    expect(getActiveDialog()).toBe(detailsDialog);
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
    // The returning sheet re-presents above the one it replaces: a modal
    // dialog beneath another modal dialog is inert in the top layer.
    expect(openDialogs()).toHaveLength(2);
    expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalledTimes(3);
    expect(getActiveDialog()).toBe(getSheetDialog('details-sheet'));

    finishSheetTransition(confirmSheet, 'opacity');
    expect(detailsSheet).not.toHaveAttribute('hidden');
    expect(confirmSheet).toHaveAttribute('hidden');
    expect(openDialogs()).toEqual([getSheetDialog('details-sheet')]);
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
    const detailsDialog = getSheetDialog('details-sheet');
    expect(
      detailsDialog.style.getPropertyValue('--_sheet-scrim-opacity'),
    ).not.toBe('1');

    // The retained dialog owns the flow's scrim through the handoff; the
    // entering dialog's backdrop stays clear above it.
    fireEvent.click(screen.getByRole('button', {name: 'Continue'}));
    expect(detailsDialog).toHaveStyle({'--_sheet-scrim-opacity': '1'});
    expect(getActiveDialog()).toHaveStyle({'--_sheet-scrim-opacity': '0'});

    fireEvent.pointerMove(handle, {
      pointerId: 1,
      clientY: 680,
      timeStamp: 32,
    });
    expect(detailsDialog).toHaveStyle({'--_sheet-scrim-opacity': '1'});
    expect(getActiveDialog()).toHaveStyle({'--_sheet-scrim-opacity': '0'});
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

  it("dismisses the flow from the active sheet's scrim", () => {
    render(<Flow />);
    fireEvent.click(screen.getByRole('button', {name: 'Start flow'}));
    const activeDialog = getActiveDialog();

    fireEvent.click(activeDialog);

    const outgoingSheet = getSheetLayer('details-sheet');
    expect(outgoingSheet).not.toHaveAttribute('hidden');
    expect(outgoingSheet).toHaveAttribute('inert');
    expect(activeDialog).toHaveStyle({'--_sheet-scrim-opacity': '0'});
    // Scroll stays locked through the exit: the dialog is still modal.
    expect(isScrollLockEngaged()).toBe(true);

    finishSheetTransition(outgoingSheet, 'transform');

    expect(activeDialog).not.toHaveAttribute('open');
    expect(isScrollLockEngaged()).toBe(false);
  });

  it('releases the modal layer when the closing sheet unmounts immediately', () => {
    render(<ConditionalFlow />);
    fireEvent.click(
      screen.getByRole('button', {name: 'Start conditional flow'}),
    );
    const dialog = screen.getByRole('dialog', {
      name: 'Conditional details',
    });

    fireEvent.keyDown(dialog, {key: 'Escape'});

    expect(dialog).not.toHaveAttribute('open');
    expect(isScrollLockEngaged()).toBe(false);
  });

  it('keeps a sheet dialog inline and opens it modally', () => {
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

  it('focuses the panel of a modal sheet with no tabbable controls and leaves Tab to the native modal dialog', () => {
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

    const dialog = screen.getByRole<HTMLDialogElement>('dialog', {
      name: 'Read-only details',
    });
    const panel = getSheetPanel(dialog);
    expect(panel).toHaveFocus();
    // Containment is the browser's: the dialog was presented with showModal(),
    // which makes everything outside it inert, so no script intercepts Tab.
    // BottomSheetNativeModal.a11y.browser.spec.ts proves the key in engines.
    expect(modalDialogs.has(dialog)).toBe(true);
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(fireEvent.keyDown(panel, {key: 'Tab'})).toBe(true);
    expect(panel).toHaveFocus();
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

    const dialog = getActiveDialog();
    expect(dialog).not.toHaveAttribute('aria-modal');
    expect(dialog).toHaveAttribute('open');
    expect(HTMLDialogElement.prototype.show).toHaveBeenCalledTimes(1);
    expect(HTMLDialogElement.prototype.showModal).not.toHaveBeenCalled();
    expect(isScrollLockEngaged()).toBe(false);
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
    const dialog = getActiveDialog();
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
    const dialog = getActiveDialog();
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

  it('preserves the exported focus-trap Escape signal for a modal switcher', () => {
    expect(hasActiveFocusTrapEscape()).toBe(false);

    const {unmount} = render(
      <BottomSheetSwitcher activeSheet="details" onActiveSheetChange={() => {}}>
        <BottomSheet sheetId="details" label="Details">
          Content
        </BottomSheet>
      </BottomSheetSwitcher>,
    );

    expect(hasActiveFocusTrapEscape()).toBe(true);
    unmount();
    expect(hasActiveFocusTrapEscape()).toBe(false);
  });

  it('dismisses a non-modal flow when a consumer stops Escape propagation', () => {
    const onActiveSheetChange = vi.fn();
    const onKeyDown = vi.fn((event: ReactKeyboardEvent) => {
      event.stopPropagation();
    });
    render(
      <BottomSheetSwitcher
        activeSheet="details"
        onActiveSheetChange={onActiveSheetChange}
        hasScrim={false}
        onKeyDown={onKeyDown}>
        <BottomSheet sheetId="details" label="Details">
          Content
        </BottomSheet>
      </BottomSheetSwitcher>,
    );

    fireEvent.keyDown(getActiveDialog(), {key: 'Escape'});

    expect(onKeyDown).toHaveBeenCalledTimes(1);
    expect(onActiveSheetChange).toHaveBeenCalledWith(null);
  });

  it('honors a consumer that prevents the default Escape dismissal', () => {
    const onActiveSheetChange = vi.fn();
    const onKeyDown = vi.fn((event: ReactKeyboardEvent) => {
      event.preventDefault();
    });
    render(
      <BottomSheetSwitcher
        activeSheet="details"
        onActiveSheetChange={onActiveSheetChange}
        hasScrim={false}
        onKeyDown={onKeyDown}>
        <BottomSheet sheetId="details" label="Details">
          Content
        </BottomSheet>
      </BottomSheetSwitcher>,
    );

    fireEvent.keyDown(getActiveDialog(), {key: 'Escape'});

    expect(onKeyDown).toHaveBeenCalledTimes(1);
    expect(onActiveSheetChange).not.toHaveBeenCalled();
  });

  it('lets a nested registered layer handle Escape before a non-modal switcher', () => {
    const onActiveSheetChange = vi.fn();
    const onNestedDismiss = vi.fn();
    render(
      <BottomSheetSwitcher
        activeSheet="details"
        onActiveSheetChange={onActiveSheetChange}
        hasScrim={false}>
        <BottomSheet sheetId="details" label="Details">
          <NestedDismissibleLayer onDismiss={onNestedDismiss} />
        </BottomSheet>
      </BottomSheetSwitcher>,
    );

    const trigger = screen.getByRole('button', {name: 'Nested layer open'});
    trigger.focus();
    fireEvent.keyDown(trigger, {key: 'Escape'});

    expect(onNestedDismiss).toHaveBeenCalledTimes(1);
    expect(onActiveSheetChange).not.toHaveBeenCalled();

    fireEvent.keyDown(document, {key: 'Escape'});

    expect(onNestedDismiss).toHaveBeenCalledTimes(1);
    expect(onActiveSheetChange).toHaveBeenCalledWith(null);
  });

  it('keeps a non-modal switcher open when a platform close targets it under a nested layer', () => {
    const onActiveSheetChange = vi.fn();
    const onNestedDismiss = vi.fn();
    render(
      <BottomSheetSwitcher
        activeSheet="details"
        onActiveSheetChange={onActiveSheetChange}
        hasScrim={false}>
        <BottomSheet sheetId="details" label="Details">
          <NestedDismissibleLayer onDismiss={onNestedDismiss} />
        </BottomSheet>
      </BottomSheetSwitcher>,
    );

    const event = new Event('cancel', {cancelable: true});
    getActiveDialog().dispatchEvent(event);

    expect(event.defaultPrevented).toBe(true);
    expect(onNestedDismiss).not.toHaveBeenCalled();
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

  describe('one native dialog per sheet', () => {
    it('renders a closed dialog for every sheet and presents only the selected one', () => {
      render(<Flow />);
      const detailsDialog = getSheetDialog('details-sheet');
      const confirmDialog = getSheetDialog('confirm-sheet');
      expect(detailsDialog).not.toBe(confirmDialog);
      expect(detailsDialog).toHaveAttribute(SHEET_DIALOG_ATTRIBUTE, '');
      expect(confirmDialog).toHaveAttribute(SHEET_DIALOG_ATTRIBUTE, '');
      expect(openDialogs()).toEqual([]);

      fireEvent.click(screen.getByRole('button', {name: 'Start flow'}));

      expect(openDialogs()).toEqual([detailsDialog]);
      expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalledTimes(1);
      expect(confirmDialog).not.toHaveAttribute('open');
      expect(confirmDialog).not.toHaveAttribute('aria-modal');
      expect(detailsDialog).toHaveAttribute('aria-modal', 'true');
      expect(detailsDialog).toContainElement(
        screen.getByTestId('details-sheet'),
      );
      expect(confirmDialog).toContainElement(
        screen.getByTestId('confirm-sheet'),
      );
    });

    it('presents the entering dialog once and closes the retained dialog only after it fades', () => {
      const log = recordDialogCalls();
      render(<Flow />);
      fireEvent.click(screen.getByRole('button', {name: 'Start flow'}));
      expect(log).toEqual(['showModal:Details']);

      fireEvent.click(screen.getByRole('button', {name: 'Continue'}));
      expect(log).toEqual(['showModal:Details', 'showModal:Confirm']);

      finishSheetTransition(getSheetLayer('confirm-sheet'), 'transform');
      expect(log).toEqual(['showModal:Details', 'showModal:Confirm']);
      finishSheetTransition(getSheetLayer('details-sheet'), 'opacity');
      expect(log).toEqual([
        'showModal:Details',
        'showModal:Confirm',
        'close:Details',
      ]);

      fireEvent.keyDown(getActiveDialog(), {key: 'Escape'});
      expect(log).toHaveLength(3);
      finishSheetTransition(getSheetLayer('confirm-sheet'), 'transform');
      expect(log.at(-1)).toBe('close:Confirm');
      expect(openDialogs()).toEqual([]);
    });

    it('keeps the CSS scroll lock engaged across a handoff and releases it with the last modal dialog', () => {
      render(<Flow />);
      expect(isScrollLockEngaged()).toBe(false);

      fireEvent.click(screen.getByRole('button', {name: 'Start flow'}));
      expect(isScrollLockEngaged()).toBe(true);
      expect(document.body.style.position).toBe('');
      expect(document.body.style.overflow).toBe('');

      fireEvent.click(screen.getByRole('button', {name: 'Continue'}));
      // Two modal sheet dialogs are open: the rule keeps matching.
      expect(openDialogs()).toHaveLength(2);
      expect(isScrollLockEngaged()).toBe(true);

      finishSheetTransition(getSheetLayer('confirm-sheet'), 'transform');
      finishSheetTransition(getSheetLayer('details-sheet'), 'opacity');
      expect(openDialogs()).toHaveLength(1);
      expect(isScrollLockEngaged()).toBe(true);

      fireEvent.keyDown(getActiveDialog(), {key: 'Escape'});
      // The exiting dialog is still modal through its exit motion.
      expect(isScrollLockEngaged()).toBe(true);
      finishSheetTransition(getSheetLayer('confirm-sheet'), 'transform');
      expect(isScrollLockEngaged()).toBe(false);
      expect(document.body.style.position).toBe('');
    });

    it('keeps the lock engaged under a Core Dialog opened from a step, and the Dialog paints above the step', () => {
      render(<DialogInStepFlow />);
      fireEvent.click(screen.getByRole('button', {name: 'Start flow'}));
      fireEvent.click(screen.getByRole('button', {name: 'Continue'}));
      finishSheetTransition(getSheetLayer('confirm-sheet'), 'transform');
      finishSheetTransition(getSheetLayer('details-sheet'), 'opacity');
      const confirmDialog = getSheetDialog('confirm-sheet');

      fireEvent.click(screen.getByRole('button', {name: 'Open dialog'}));
      const dialog = screen.getByRole('dialog', {name: 'Are you sure'});
      expect(dialog).toHaveAttribute('open');
      expect(dialog).not.toHaveAttribute(SHEET_DIALOG_ATTRIBUTE);
      // The Dialog was presented after the step's dialog, so the top layer
      // paints it above; the step's modal dialog beneath keeps the lock.
      expect(HTMLDialogElement.prototype.showModal).toHaveBeenLastCalledWith();
      expect(
        vi.mocked(HTMLDialogElement.prototype.showModal).mock.contexts.at(-1),
      ).toBe(dialog);
      expect(confirmDialog).toHaveAttribute('open');
      expect(isScrollLockEngaged()).toBe(true);

      // Escape reaches the Dialog first, not the step beneath it.
      fireEvent.keyDown(dialog, {key: 'Escape'});
      expect(dialog).not.toHaveAttribute('open');
      expect(confirmDialog).toHaveAttribute('open');
      expect(isScrollLockEngaged()).toBe(true);

      fireEvent.click(screen.getByRole('button', {name: 'Done'}));
      finishSheetTransition(getSheetLayer('confirm-sheet'), 'transform');
      expect(isScrollLockEngaged()).toBe(false);
    });

    it("moves the switcher ref to the active sheet's dialog and clears it when the flow closes", () => {
      const dialogRef = createRef<HTMLDialogElement>();
      function RefFlow() {
        const [activeSheet, setActiveSheet] = useState<string | null>(null);
        return (
          <>
            <button type="button" onClick={() => setActiveSheet('details')}>
              Start flow
            </button>
            <BottomSheetSwitcher
              ref={dialogRef}
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
                <button type="button" onClick={() => setActiveSheet(null)}>
                  Done
                </button>
              </BottomSheet>
            </BottomSheetSwitcher>
          </>
        );
      }
      render(<RefFlow />);
      expect(dialogRef.current).toBeNull();

      fireEvent.click(screen.getByRole('button', {name: 'Start flow'}));
      expect(dialogRef.current).toBe(getSheetDialog('details-sheet'));

      fireEvent.click(screen.getByRole('button', {name: 'Continue'}));
      expect(dialogRef.current).toBe(getSheetDialog('confirm-sheet'));

      fireEvent.click(screen.getByRole('button', {name: 'Done'}));
      // The exiting sheet's dialog hosts the flow through its exit motion.
      expect(dialogRef.current).toBe(getSheetDialog('confirm-sheet'));
      finishSheetTransition(getSheetLayer('confirm-sheet'), 'transform');
      expect(dialogRef.current).toBeNull();
    });

    it('applies the switcher dialog props to each sheet dialog', () => {
      render(
        <BottomSheetSwitcher
          activeSheet="details"
          onActiveSheetChange={() => {}}
          className="consumer-switcher"
          data-flow-owner="settings">
          <BottomSheet sheetId="details" label="Details" data-testid="a">
            Content
          </BottomSheet>
          <BottomSheet sheetId="confirm" label="Confirm" data-testid="b">
            Content
          </BottomSheet>
        </BottomSheetSwitcher>,
      );
      for (const testId of ['a', 'b']) {
        const dialog = getSheetDialog(testId);
        expect(dialog).toHaveClass('consumer-switcher');
        expect(dialog).toHaveAttribute('data-flow-owner', 'settings');
      }
      expect(getSheetDialog('a')).toHaveAttribute('aria-label', 'Details');
      expect(getSheetDialog('b')).toHaveAttribute('aria-label', 'Confirm');
    });

    it('paints one scrim through a handoff and hands it over without a fade', () => {
      render(<Flow />);
      fireEvent.click(screen.getByRole('button', {name: 'Start flow'}));
      const detailsDialog = getSheetDialog('details-sheet');
      const confirmDialog = getSheetDialog('confirm-sheet');
      expect(detailsDialog).toHaveStyle({'--_sheet-scrim-opacity': '1'});

      fireEvent.click(screen.getByRole('button', {name: 'Continue'}));
      // The retained dialog's backdrop is the scrim; the entering dialog's
      // backdrop, painted above the retained panel, stays clear.
      expect(detailsDialog).toHaveStyle({'--_sheet-scrim-opacity': '1'});
      expect(confirmDialog).toHaveStyle({'--_sheet-scrim-opacity': '0'});

      finishSheetTransition(getSheetLayer('confirm-sheet'), 'transform');
      expect(detailsDialog).toHaveStyle({'--_sheet-scrim-opacity': '1'});
      expect(confirmDialog).toHaveStyle({'--_sheet-scrim-opacity': '0'});

      finishSheetTransition(getSheetLayer('details-sheet'), 'opacity');
      expect(detailsDialog).not.toHaveAttribute('open');
      expect(confirmDialog).toHaveStyle({'--_sheet-scrim-opacity': '1'});
      // The swap pins the backdrop transition for one style flush only.
      expect(
        confirmDialog.style.getPropertyValue('--_sheet-scrim-duration'),
      ).toBe('');

      fireEvent.keyDown(confirmDialog, {key: 'Escape'});
      expect(confirmDialog).toHaveStyle({'--_sheet-scrim-opacity': '0'});
    });

    it('moves focus into the entering sheet while the retained dialog is inert', () => {
      render(<Flow />);
      const opener = screen.getByRole('button', {name: 'Start flow'});
      opener.focus();
      fireEvent.click(opener);
      expect(getSheetPanel(getSheetDialog('details-sheet'))).toHaveFocus();

      fireEvent.click(screen.getByRole('button', {name: 'Continue'}));

      expect(getSheetPanel(getSheetDialog('confirm-sheet'))).toHaveFocus();
      expect(getSheetDialog('details-sheet')).toHaveAttribute('inert');
      expect(getSheetDialog('details-sheet')).toHaveAttribute(
        'aria-hidden',
        'true',
      );
      expect(getSheetDialog('confirm-sheet')).not.toHaveAttribute('inert');

      finishSheetTransition(getSheetLayer('confirm-sheet'), 'transform');
      finishSheetTransition(getSheetLayer('details-sheet'), 'opacity');
      fireEvent.keyDown(getSheetDialog('confirm-sheet'), {key: 'Escape'});
      finishSheetTransition(getSheetLayer('confirm-sheet'), 'transform');

      expect(opener).toHaveFocus();
    });

    it("keeps focus in the active sheet when a retained dialog's close returns focus natively", () => {
      // close() on a modal dialog focuses the element focused when it was
      // presented. Going Back presents Details from the Back button inside
      // Confirm, and Details is still active when Confirm closes after its
      // fade: the browser would move focus from the Details panel onto
      // whatever Details' present recorded. The flow keeps it on the panel.
      recordDialogCalls();
      render(<Flow />);
      const opener = screen.getByRole('button', {name: 'Start flow'});
      opener.focus();
      fireEvent.click(opener);
      const continueButton = screen.getByRole('button', {name: 'Continue'});
      continueButton.focus();
      fireEvent.click(continueButton);
      finishSheetTransition(getSheetLayer('confirm-sheet'), 'transform');
      finishSheetTransition(getSheetLayer('details-sheet'), 'opacity');
      const detailsPanel = getSheetPanel(getSheetDialog('details-sheet'));
      const confirmPanel = getSheetPanel(getSheetDialog('confirm-sheet'));
      expect(confirmPanel).toHaveFocus();

      const backButton = screen.getByRole('button', {name: 'Back'});
      backButton.focus();
      fireEvent.click(backButton);
      expect(detailsPanel).toHaveFocus();

      finishSheetTransition(getSheetLayer('details-sheet'), 'transform');
      finishSheetTransition(getSheetLayer('confirm-sheet'), 'opacity');
      expect(getSheetDialog('confirm-sheet')).not.toHaveAttribute('open');
      expect(detailsPanel).toHaveFocus();

      // Ending the flow lets the browser return focus, then the switcher
      // settles it on the flow's opener.
      fireEvent.keyDown(getSheetDialog('details-sheet'), {key: 'Escape'});
      finishSheetTransition(getSheetLayer('details-sheet'), 'transform');
      expect(opener).toHaveFocus();
    });

    it("answers a native cancel by the active sheet's purpose after a handoff", () => {
      const log = recordDialogCalls();
      render(<RequiredConfirmFlow />);
      expect(screen.queryByRole('alertdialog')).toBeNull();

      fireEvent.click(screen.getByRole('button', {name: 'Continue'}));
      finishSheetTransition(getSheetLayer('confirm-sheet'), 'transform');
      finishSheetTransition(getSheetLayer('details-sheet'), 'opacity');

      const confirmDialog = getSheetDialog('confirm-sheet');
      expect(confirmDialog).toHaveAttribute('role', 'alertdialog');
      expect(getSheetDialog('details-sheet')).not.toHaveAttribute('role');

      fireEvent.keyDown(confirmDialog, {key: 'Escape'});
      const cancel = new Event('cancel', {cancelable: true});
      confirmDialog.dispatchEvent(cancel);
      fireEvent.click(confirmDialog);

      // Always prevented: the browser never closes a controlled dialog.
      expect(cancel.defaultPrevented).toBe(true);
      expect(confirmDialog).toHaveAttribute('open');
      expect(log.filter(entry => entry.startsWith('close:'))).toEqual([
        'close:Details',
      ]);

      fireEvent.click(screen.getByRole('button', {name: 'Done'}));
      finishSheetTransition(getSheetLayer('confirm-sheet'), 'transform');
      expect(openDialogs()).toEqual([]);
    });

    it("dismisses an info flow from a cancel or a backdrop click on the active sheet's dialog only", () => {
      const onActiveSheetChange = vi.fn();
      render(
        <BottomSheetSwitcher
          activeSheet="confirm"
          onActiveSheetChange={onActiveSheetChange}>
          <BottomSheet sheetId="details" label="Details" data-testid="a">
            Content
          </BottomSheet>
          <BottomSheet sheetId="confirm" label="Confirm" data-testid="b">
            <button type="button">Inside</button>
          </BottomSheet>
        </BottomSheetSwitcher>,
      );
      const activeDialog = getSheetDialog('b');

      const cancel = new Event('cancel', {cancelable: true});
      activeDialog.dispatchEvent(cancel);
      expect(cancel.defaultPrevented).toBe(true);
      expect(onActiveSheetChange).toHaveBeenNthCalledWith(1, null);

      // A `::backdrop` click targets the dialog element itself.
      fireEvent.click(activeDialog);
      expect(onActiveSheetChange).toHaveBeenNthCalledWith(2, null);

      fireEvent.click(screen.getByRole('button', {name: 'Inside'}));
      fireEvent.click(getSheetDialog('a'));
      expect(onActiveSheetChange).toHaveBeenCalledTimes(2);
    });

    it('presents a non-modal flow with show() on each sheet dialog', () => {
      const log = recordDialogCalls();
      function NonModalFlow() {
        const [activeSheet, setActiveSheet] = useState<string | null>(
          'details',
        );
        return (
          <BottomSheetSwitcher
            activeSheet={activeSheet}
            onActiveSheetChange={setActiveSheet}
            hasScrim={false}>
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
              Content
            </BottomSheet>
          </BottomSheetSwitcher>
        );
      }
      render(<NonModalFlow />);
      expect(log).toEqual(['show:Details']);

      fireEvent.click(screen.getByRole('button', {name: 'Continue'}));

      expect(log).toEqual(['show:Details', 'show:Confirm']);
      expect(openDialogs()).toHaveLength(2);
      expect(getSheetDialog('confirm-sheet')).not.toHaveAttribute('aria-modal');
      expect(isScrollLockEngaged()).toBe(false);

      finishSheetTransition(getSheetLayer('confirm-sheet'), 'transform');
      finishSheetTransition(getSheetLayer('details-sheet'), 'opacity');
      expect(log).toEqual(['show:Details', 'show:Confirm', 'close:Details']);
    });

    it('re-presents a sheet that is still fading when the flow returns to it', () => {
      const log = recordDialogCalls();
      render(<Flow />);
      fireEvent.click(screen.getByRole('button', {name: 'Start flow'}));
      fireEvent.click(screen.getByRole('button', {name: 'Continue'}));
      fireEvent.click(screen.getByRole('button', {name: 'Back'}));

      // Details was still open beneath Confirm in the top layer; it closes and
      // presents again so the interactive sheet is the topmost modal layer.
      expect(log).toEqual([
        'showModal:Details',
        'showModal:Confirm',
        'close:Details',
        'showModal:Details',
      ]);
      expect(getActiveDialog()).toBe(getSheetDialog('details-sheet'));
      expect(getSheetDialog('confirm-sheet')).toHaveAttribute('inert');

      finishSheetTransition(getSheetLayer('confirm-sheet'), 'opacity');
      expect(log.at(-1)).toBe('close:Confirm');
      expect(openDialogs()).toEqual([getSheetDialog('details-sheet')]);
    });
  });
});
