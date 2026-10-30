// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file AlertDialog.test.tsx
 * @input Uses vitest, @testing-library/react, AlertDialog component
 * @output Unit tests for AlertDialog component behavior
 * @position Testing; validates AlertDialog.tsx implementation
 *
 * SYNC: When AlertDialog.tsx changes, update tests to match new behavior
 */

import {
  describe,
  it,
  expect,
  vi,
  beforeAll,
  beforeEach,
  afterEach,
} from 'vitest';
import {
  act,
  cleanup,
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {StrictMode} from 'react';
import {getGestureHost} from '../gestures/GestureHost';
import {alertController} from '../motion/uikit/alert';
import {PRESS_GROUP_ITEM_ATTRIBUTE} from '../utils/pressFeedback';
import {AlertDialog} from './AlertDialog';
import {useImperativeAlertDialog} from './useImperativeAlertDialog';

// The gesture host reads `(pointer: coarse)` once per document and keeps that
// query for the document's life: it gets this live one (see beforeAll), whose
// answer each test's media stub sets.
let isCoarsePrimaryPointer = false;
const hostCoarseQuery = {
  get matches() {
    return isCoarsePrimaryPointer;
  },
  media: '(pointer: coarse)',
  onchange: null,
  addEventListener: () => {},
  removeEventListener: () => {},
  addListener: () => {},
  removeListener: () => {},
  dispatchEvent: () => false,
};

/** Stubs the media queries AlertDialog reads. */
function stubAlertDialogMedia({
  smallScreen,
  coarsePointer,
  noHover,
  reduceMotion = false,
}: {
  smallScreen: boolean;
  coarsePointer: boolean;
  noHover: boolean;
  reduceMotion?: boolean;
}): void {
  isCoarsePrimaryPointer = coarsePointer;
  vi.stubGlobal(
    'matchMedia',
    vi.fn((query: string) => {
      let matches = false;
      if (
        query.includes('max-width: 640px') ||
        query.includes('width < 768px')
      ) {
        matches = smallScreen;
      } else if (query.includes('pointer: coarse')) {
        matches = coarsePointer;
      } else if (query.includes('pointer: fine')) {
        matches = !coarsePointer;
      } else if (query.includes('hover: none')) {
        matches = noHover;
      } else if (query.includes('hover: hover')) {
        matches = !noHover;
      } else if (query.includes('prefers-reduced-motion: reduce')) {
        matches = reduceMotion;
      } else if (query.includes('prefers-reduced-motion: no-preference')) {
        matches = !reduceMotion;
      } else if (query.includes('prefers-reduced-motion')) {
        matches = reduceMotion;
      }

      return {
        matches,
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
      };
    }),
  );
}

beforeAll(() => {
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => hostCoarseQuery),
  );
  getGestureHost(document);
  vi.unstubAllGlobals();
});

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

afterEach(() => {
  vi.unstubAllGlobals();
  isCoarsePrimaryPointer = false;
});

describe('AlertDialog', () => {
  const defaultProps = {
    isOpen: true,
    onOpenChange: vi.fn(),
    title: 'Delete item?',
    description: 'This action cannot be undone.',
    actionLabel: 'Delete',
    onAction: vi.fn(),
  };

  // The alertdialog role and the aria-describedby link are asserted by the
  // Alert Dialog accessibility contract binding (AlertDialog.a11y.test.tsx /
  // .chromium.spec.ts), not here.
  it('renders title and description', () => {
    render(<AlertDialog {...defaultProps} />);
    expect(screen.getByText('Delete item?')).toBeInTheDocument();
    expect(
      screen.getByText('This action cannot be undone.'),
    ).toBeInTheDocument();
  });

  it('links title via aria-labelledby', () => {
    render(<AlertDialog {...defaultProps} />);
    const dialog = screen.getByRole('alertdialog');
    const labelledBy = dialog.getAttribute('aria-labelledby');
    expect(labelledBy).toBeTruthy();
    const titleEl = document.getElementById(labelledBy!);
    expect(titleEl).toHaveTextContent('Delete item?');
  });

  it('renders cancel and action buttons', () => {
    render(<AlertDialog {...defaultProps} />);
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  it('uses custom cancel label', () => {
    render(<AlertDialog {...defaultProps} cancelLabel="Never mind" />);
    expect(screen.getByText('Never mind')).toBeInTheDocument();
  });

  it('calls onOpenChange(false) when cancel is clicked', () => {
    const onOpenChange = vi.fn();
    render(<AlertDialog {...defaultProps} onOpenChange={onOpenChange} />);
    fireEvent.click(screen.getByText('Cancel'));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('calls onAction when action is clicked', () => {
    const onAction = vi.fn();
    render(<AlertDialog {...defaultProps} onAction={onAction} />);
    fireEvent.click(screen.getByText('Delete'));
    expect(onAction).toHaveBeenCalled();
  });

  it('does not call onOpenChange when action is clicked', () => {
    const onOpenChange = vi.fn();
    render(<AlertDialog {...defaultProps} onOpenChange={onOpenChange} />);
    fireEvent.click(screen.getByText('Delete'));
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it('does not render when isOpen is false', () => {
    render(<AlertDialog {...defaultProps} isOpen={false} />);
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });

  it('accepts custom width', () => {
    render(<AlertDialog {...defaultProps} width={600} />);
    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
  });

  describe('responsive actions', () => {
    const longCancelLabel = 'Keep this workspace and all of its dashboards';
    const longActionLabel =
      'Permanently delete this workspace and all dashboards';

    it('preserves the preferred width and horizontal order above the small breakpoint', () => {
      stubAlertDialogMedia({
        smallScreen: false,
        coarsePointer: false,
        noHover: false,
      });
      render(<AlertDialog {...defaultProps} />);

      // The layout reads the width alone. The pointer query only picks the
      // motion (UIKit's under a finger), never the order or the stacking.
      expect(window.matchMedia).toHaveBeenCalledWith('(max-width: 640px)');
      expect(window.matchMedia).not.toHaveBeenCalledWith('(hover: none)');
      const dialog = screen.getByRole('alertdialog');
      const buttons = within(dialog).getAllByRole('button');
      const footerStack = buttons[0].parentElement!;
      expect(dialog.getAttribute('style')).toContain('--x-width: 400px');
      expect(dialog.getAttribute('style')).toContain(
        '--x-maxWidth: min(100%, calc(100dvw - var(--spacing-4) - var(--spacing-4)))',
      );
      expect(buttons.map(button => button.textContent)).toEqual([
        'Cancel',
        'Delete',
      ]);
      expect(getComputedStyle(footerStack).flexWrap).toBe('wrap');
    });

    it('keeps long action buttons within the wide horizontal footer without changing Button sizing', () => {
      stubAlertDialogMedia({
        smallScreen: false,
        coarsePointer: false,
        noHover: false,
      });
      render(
        <AlertDialog
          {...defaultProps}
          cancelLabel={longCancelLabel}
          actionLabel={longActionLabel}
        />,
      );

      const dialog = screen.getByRole('alertdialog');
      const buttons = within(dialog).getAllByRole('button');
      const footerStack = buttons[0].parentElement!;
      expect(buttons.map(button => button.textContent)).toEqual([
        longCancelLabel,
        longActionLabel,
      ]);
      expect(getComputedStyle(footerStack).flexWrap).toBe('wrap');
      for (const button of buttons) {
        const computed = getComputedStyle(button);
        expect(computed.whiteSpace).toBe('nowrap');
        expect(computed.height).toBe('var(--size-element-md)');
        expect(computed.maxWidth).toBe('100%');
      }
    });

    it('stacks long destructive action labels above cancel on a narrow fine-pointer screen', () => {
      stubAlertDialogMedia({
        smallScreen: true,
        coarsePointer: false,
        noHover: false,
      });
      render(
        <AlertDialog
          {...defaultProps}
          cancelLabel={longCancelLabel}
          actionLabel={longActionLabel}
        />,
      );

      // The layout reads the width alone. The pointer query only picks the
      // motion (UIKit's under a finger), never the order or the stacking.
      expect(window.matchMedia).toHaveBeenCalledWith('(max-width: 640px)');
      expect(window.matchMedia).not.toHaveBeenCalledWith('(hover: none)');
      const dialog = screen.getByRole('alertdialog');
      const buttons = within(dialog).getAllByRole('button');
      const footerStack = buttons[0].parentElement!;
      expect(dialog.getAttribute('style')).toContain('--x-width: 400px');
      expect(buttons.map(button => button.textContent)).toEqual([
        longActionLabel,
        longCancelLabel,
      ]);
      expect(getComputedStyle(footerStack).flexDirection).toBe('column');
      for (const button of buttons) {
        const computed = getComputedStyle(button);
        expect(computed.whiteSpace).toBe('nowrap');
        expect(computed.width).toBe('100%');
        expect(computed.maxWidth).toBe('100%');
      }
    });

    it('uses the same stacked layout on a mobile touch screen', () => {
      stubAlertDialogMedia({
        smallScreen: true,
        coarsePointer: true,
        noHover: true,
      });
      render(
        <AlertDialog
          {...defaultProps}
          cancelLabel="Keep this workspace"
          actionLabel="Permanently delete workspace"
        />,
      );

      // The layout reads the width alone. The pointer query only picks the
      // motion and the width (UIKit's under a finger), never the order or the
      // stacking.
      expect(window.matchMedia).toHaveBeenCalledWith('(max-width: 640px)');
      expect(window.matchMedia).not.toHaveBeenCalledWith('(hover: none)');
      const dialog = screen.getByRole('alertdialog');
      const buttons = within(dialog).getAllByRole('button');
      expect(dialog.getAttribute('style')).toContain('--x-width: 320px');
      expect(buttons.map(button => button.textContent)).toEqual([
        'Permanently delete workspace',
        'Keep this workspace',
      ]);
      expect(getComputedStyle(buttons[0]).whiteSpace).toBe('nowrap');
      expect(getComputedStyle(buttons[0]).width).toBe('100%');
      expect(getComputedStyle(buttons[1]).whiteSpace).toBe('nowrap');
      expect(getComputedStyle(buttons[1]).width).toBe('100%');
    });

    it('keeps narrow visual, DOM, and tab order aligned while autofocus stays on cancel', async () => {
      const user = userEvent.setup();
      stubAlertDialogMedia({
        smallScreen: true,
        coarsePointer: false,
        noHover: false,
      });
      render(
        <AlertDialog
          {...defaultProps}
          cancelLabel={longCancelLabel}
          actionLabel={longActionLabel}
        />,
      );

      const action = screen.getByRole('button', {name: longActionLabel});
      const cancel = screen.getByRole('button', {name: longCancelLabel});
      expect(
        action.compareDocumentPosition(cancel) &
          Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();
      expect(cancel).toHaveAttribute('data-autofocus');
      action.focus();
      await user.tab();
      expect(cancel).toHaveFocus();
    });
  });

  it('defaults cancel label to Cancel', () => {
    render(<AlertDialog {...defaultProps} />);
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  describe('keyboard', () => {
    it('calls onOpenChange(false) on Escape', async () => {
      const onOpenChange = vi.fn();
      render(<AlertDialog {...defaultProps} onOpenChange={onOpenChange} />);
      fireEvent.keyDown(screen.getByRole('alertdialog'), {key: 'Escape'});
      await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
    });

    it('does not call onAction on Escape', () => {
      const onAction = vi.fn();
      render(<AlertDialog {...defaultProps} onAction={onAction} />);
      fireEvent.keyDown(screen.getByRole('alertdialog'), {key: 'Escape'});
      expect(onAction).not.toHaveBeenCalled();
    });

    it('activates cancel with Enter', async () => {
      const user = userEvent.setup();
      const onOpenChange = vi.fn();
      render(<AlertDialog {...defaultProps} onOpenChange={onOpenChange} />);
      screen.getByRole('button', {name: 'Cancel'}).focus();
      await user.keyboard('{Enter}');
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    it('activates the action button with Space', async () => {
      const user = userEvent.setup();
      const onAction = vi.fn();
      render(<AlertDialog {...defaultProps} onAction={onAction} />);
      screen.getByRole('button', {name: 'Delete'}).focus();
      await user.keyboard(' ');
      expect(onAction).toHaveBeenCalled();
    });

    it('reaches both buttons by Tab, cancel first', async () => {
      const user = userEvent.setup();
      render(<AlertDialog {...defaultProps} />);
      const cancel = screen.getByRole('button', {name: 'Cancel'});
      const action = screen.getByRole('button', {name: 'Delete'});
      cancel.focus();
      expect(cancel).toHaveFocus();
      await user.tab();
      expect(action).toHaveFocus();
    });
  });

  describe('focus', () => {
    it('marks cancel as the initial focus target', () => {
      render(<AlertDialog {...defaultProps} />);
      // Dialog focuses [data-autofocus] itself after showModal(), so the
      // contract this component owns is which element carries the attribute.
      expect(screen.getByRole('button', {name: 'Cancel'})).toHaveAttribute(
        'data-autofocus',
      );
      expect(screen.getByRole('button', {name: 'Delete'})).not.toHaveAttribute(
        'data-autofocus',
      );
    });

    it('keeps the initial focus target on the least destructive action', () => {
      render(<AlertDialog {...defaultProps} cancelLabel="Never mind" />);
      expect(screen.getByRole('button', {name: 'Never mind'})).toHaveAttribute(
        'data-autofocus',
      );
    });

    it('returns focus to the trigger when it closes', async () => {
      const trigger = document.createElement('button');
      trigger.textContent = 'Open';
      document.body.appendChild(trigger);
      trigger.focus();

      const {rerender} = render(<AlertDialog {...defaultProps} />);
      rerender(<AlertDialog {...defaultProps} isOpen={false} />);

      await waitFor(() => expect(trigger).toHaveFocus());
      trigger.remove();
    });

    it('does not disable the cancel button while the action is loading', () => {
      render(<AlertDialog {...defaultProps} isActionLoading />);
      expect(screen.getByRole('button', {name: 'Cancel'})).toBeEnabled();
    });
  });

  describe('aria', () => {
    it('marks the action button busy while loading', () => {
      render(<AlertDialog {...defaultProps} isActionLoading />);
      expect(screen.getByRole('button', {name: /Delete/})).toHaveAttribute(
        'aria-busy',
        'true',
      );
    });

    it('is a modal alertdialog', () => {
      render(<AlertDialog {...defaultProps} />);
      expect(screen.getByRole('alertdialog')).toHaveAttribute(
        'aria-modal',
        'true',
      );
    });

    describe('the inline preview path', () => {
      it('does not claim the alertdialog role', () => {
        render(<AlertDialog {...defaultProps} isInline />);
        expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
      });

      it('exposes a named group instead, with no aria-modal', () => {
        render(<AlertDialog {...defaultProps} isInline />);
        const group = screen.getByRole('group', {name: 'Delete item?'});
        expect(group).not.toHaveAttribute('aria-modal');
        const describedBy = group.getAttribute('aria-describedby');
        expect(describedBy).toBeTruthy();
        expect(document.getElementById(describedBy!)).toHaveTextContent(
          'This action cannot be undone.',
        );
      });
    });
  });
});

/**
 * Touch tracking: a finger is tracked across both actions as one group, as
 * UIKit tracks an alert's actions (measured on iOS 26.2). The tracking hook's
 * own contract is covered in hooks/useActionGroupTracking.test.tsx; these
 * cover AlertDialog's wiring of it.
 */
describe('AlertDialog action tracking', () => {
  let touchClock = 10_000;
  let touchId = 500;

  function touch(
    type: 'touchstart' | 'touchmove' | 'touchend',
    target: Element,
    point: {x: number; y: number},
    id: number,
  ): void {
    touchClock += 16;
    const event = new Event(type, {bubbles: true, cancelable: true});
    const entry = {identifier: id, clientX: point.x, clientY: point.y, target};
    Object.defineProperty(event, 'changedTouches', {value: [entry]});
    Object.defineProperty(event, 'touches', {
      value: type === 'touchend' ? [] : [entry],
    });
    Object.defineProperty(event, 'timeStamp', {value: touchClock});
    target.dispatchEvent(event);
  }

  function place(element: Element, left: number, top: number): void {
    const rect = DOMRect.fromRect({x: left, y: top, width: 120, height: 32});
    element.getBoundingClientRect = () => rect;
  }

  /** A mouse's pointer event at (x, y), the primary button held until up. */
  function mouse(target: Element, type: string, y: number, x = 60): void {
    touchClock += 16;
    const event = new PointerEvent(type, {
      bubbles: true,
      cancelable: true,
      pointerId: 1,
      pointerType: 'mouse',
      isPrimary: true,
      button: 0,
      buttons: type === 'pointerup' ? 0 : 1,
      clientX: x,
      clientY: y,
    });
    Object.defineProperty(event, 'timeStamp', {value: touchClock});
    target.dispatchEvent(event);
  }

  /**
   * Renders the alert open under a finger by default, in any engine (UIKit's
   * motion runs, and touches wait for the presentation), or with a mouse with
   * `touch: false` (the theme's motion).
   */
  function renderOpen(
    props: {
      isInline?: boolean;
      touch?: boolean;
      smallScreen?: boolean;
      width?: number;
    } = {},
  ) {
    const isTouch = props.touch ?? true;
    stubAlertDialogMedia({
      smallScreen: props.smallScreen ?? true,
      coarsePointer: isTouch,
      noHover: isTouch,
    });
    const onOpenChange = vi.fn();
    const onAction = vi.fn();
    const element = (isOpen: boolean) => (
      <AlertDialog
        isOpen={isOpen}
        isInline={props.isInline}
        width={props.width}
        onOpenChange={onOpenChange}
        title="Delete item?"
        description="This cannot be undone."
        actionLabel="Delete"
        onAction={onAction}
      />
    );
    const view = render(element(true));
    const cancel = screen.getByRole('button', {name: 'Cancel'});
    const action = screen.getByRole('button', {name: 'Delete'});
    // Stacked on a narrow screen: the action above Cancel.
    place(action, 16, 100);
    place(cancel, 16, 140);
    const close = () => view.rerender(element(false));
    return {onOpenChange, onAction, cancel, action, close};
  }

  /**
   * Lets the presentation complete: UIKit drops touches until it does. The
   * input hold ends UIKit's touch window after the animator reports
   * its start.
   */
  async function completePresentation(): Promise<void> {
    await act(async () => {
      await new Promise(resolve =>
        setTimeout(resolve, alertController.present.ignoresTouchesForMs + 20),
      );
    });
  }

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('marks both actions as tracked group items from the first render, keeping their pressable marker', () => {
    const {cancel, action} = renderOpen();
    for (const button of [cancel, action]) {
      // The document press controller leaves a pointer's press on a marked
      // item to the group's tracker, its one painter; it still records the
      // touch for the scroll brake, through the pressable marker.
      expect(button).toHaveAttribute(PRESS_GROUP_ITEM_ATTRIBUTE, '');
      expect(button).toHaveAttribute('data-astryx-pressable');
    }
  });

  it('leaves the actions to the document press controller in the inline preview, which is not tracked', () => {
    const {cancel, action} = renderOpen({isInline: true});
    for (const button of [cancel, action]) {
      expect(button).not.toHaveAttribute(PRESS_GROUP_ITEM_ATTRIBUTE);
      expect(button).toHaveAttribute('data-astryx-pressable');
    }
  });

  it('cancels when a finger lands on the action and lifts on Cancel', async () => {
    const {onOpenChange, onAction, cancel, action} = renderOpen();
    await completePresentation();
    const id = touchId++;
    touch('touchstart', action, {x: 60, y: 116}, id);
    expect(action).toHaveAttribute('data-astryx-press', 'on');
    touch('touchmove', action, {x: 60, y: 156}, id);
    expect(action).not.toHaveAttribute('data-astryx-press');
    expect(cancel).toHaveAttribute('data-astryx-press', 'on');
    touch('touchend', action, {x: 60, y: 156}, id);
    expect(onOpenChange).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(onAction).not.toHaveBeenCalled();
  });

  it('runs the action when a finger slides from Cancel onto it', async () => {
    const {onOpenChange, onAction, cancel} = renderOpen();
    await completePresentation();
    const id = touchId++;
    touch('touchstart', cancel, {x: 60, y: 156}, id);
    touch('touchmove', cancel, {x: 60, y: 116}, id);
    touch('touchend', cancel, {x: 60, y: 116}, id);
    expect(onAction).toHaveBeenCalledTimes(1);
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it('drops a touch that lands while the alert is presenting, then tracks once it has', async () => {
    const {onOpenChange, onAction, cancel} = renderOpen();
    const early = touchId++;
    touch('touchstart', cancel, {x: 60, y: 156}, early);
    expect(cancel).not.toHaveAttribute('data-astryx-press');
    touch('touchend', cancel, {x: 60, y: 156}, early);
    expect(onOpenChange).not.toHaveBeenCalled();
    expect(onAction).not.toHaveBeenCalled();
    await completePresentation();
    const late = touchId++;
    touch('touchstart', cancel, {x: 60, y: 156}, late);
    expect(cancel).toHaveAttribute('data-astryx-press', 'on');
    touch('touchend', cancel, {x: 60, y: 156}, late);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('with a mouse keeps the theme motion: a click acts at once and a close is immediate', () => {
    const {onOpenChange, cancel, close} = renderOpen({touch: false});
    // A fine pointer, before anything is checked.
    expect(window.matchMedia('(pointer: coarse)').matches).toBe(false);
    const dialog = screen.getByRole('alertdialog');
    // No presentation to wait for: the click acts as it lands.
    fireEvent.click(cancel);
    expect(onOpenChange).toHaveBeenCalledWith(false);
    // No fade to wait for either: the dialog closes with the caller.
    close();
    expect(dialog).not.toHaveAttribute('open');
  });

  it("takes iOS's alert width on a phone, a caller's width there, and Dialog's 400 on a wider touch screen or with a mouse (FR9)", () => {
    const widthOf = () => screen.getByRole('alertdialog').getAttribute('style');
    // A phone: a compact window under a coarse primary pointer.
    renderOpen();
    expect(widthOf()).toContain('--x-width: 320px');
    cleanup();
    vi.unstubAllGlobals();
    // A caller's width still wins on a phone.
    renderOpen({width: 360});
    expect(window.matchMedia('(pointer: coarse)').matches).toBe(true);
    expect(widthOf()).toContain('--x-width: 360px');
    cleanup();
    vi.unstubAllGlobals();
    // A wider touch screen (a tablet): Dialog's 400.
    renderOpen({smallScreen: false});
    expect(window.matchMedia('(pointer: coarse)').matches).toBe(true);
    expect(widthOf()).toContain('--x-width: 400px');
    cleanup();
    vi.unstubAllGlobals();
    renderOpen({touch: false});
    // A fine pointer, before the mouse's width is checked.
    expect(window.matchMedia('(pointer: coarse)').matches).toBe(false);
    expect(widthOf()).toContain('--x-width: 400px');
  });

  it('under a finger stays open while it fades out after the caller closes it', async () => {
    const {close} = renderOpen();
    await completePresentation();
    const dialog = screen.getByRole('alertdialog');
    close();
    expect(dialog).toHaveAttribute('open');
  });

  it('under a finger, while the alert leaves, holds it inert and ignores Escape', async () => {
    const {onOpenChange, onAction, close} = renderOpen();
    await completePresentation();
    const dialog = screen.getByRole('alertdialog', {hidden: true});
    const content = () =>
      [...dialog.children].filter(child => !child.hasAttribute('popover'));
    expect(content().some(child => child.hasAttribute('inert'))).toBe(false);
    close();
    // Leaving: still open while it fades out, its content inert under the
    // input hold's shield, so no click, Enter or assistive-technology
    // activation reaches an action; the browser checks cover the taps.
    expect(dialog).toHaveAttribute('open');
    expect(content().length).toBeGreaterThan(0);
    expect(content().every(child => child.hasAttribute('inert'))).toBe(true);
    expect(dialog.querySelector(':scope > [popover]')).not.toBeNull();
    // The dialog's own Escape still reaches it: ignored while it leaves.
    fireEvent.keyDown(dialog, {key: 'Escape'});
    expect(onAction).not.toHaveBeenCalled();
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it('under StrictMode, an alert that mounts open presents and takes touches once the presentation completes', async () => {
    stubAlertDialogMedia({
      smallScreen: true,
      coarsePointer: true,
      noHover: true,
    });
    const onOpenChange = vi.fn();
    render(
      <StrictMode>
        <AlertDialog
          isOpen
          onOpenChange={onOpenChange}
          title="Delete item?"
          description="This cannot be undone."
          actionLabel="Delete"
          onAction={() => {}}
        />
      </StrictMode>,
    );
    const cancel = screen.getByRole('button', {name: 'Cancel'});
    place(cancel, 16, 140);
    await completePresentation();
    const id = touchId++;
    touch('touchstart', cancel, {x: 60, y: 156}, id);
    expect(cancel).toHaveAttribute('data-astryx-press', 'on');
    touch('touchend', cancel, {x: 60, y: 156}, id);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('tracks a mouse too (family:action-groups FR5): a press on the action slid to Cancel cancels, once', () => {
    const {onOpenChange, onAction, cancel, action} = renderOpen({
      touch: false,
    });
    // A fine primary pointer, before the mouse is checked.
    expect(window.matchMedia('(pointer: coarse)').matches).toBe(false);
    mouse(action, 'pointerdown', 116);
    expect(action).toHaveAttribute('data-astryx-press', 'on');
    mouse(action, 'pointermove', 156);
    expect(action).not.toHaveAttribute('data-astryx-press');
    expect(cancel).toHaveAttribute('data-astryx-press', 'on');
    mouse(cancel, 'pointerup', 156);
    expect(onOpenChange).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(onAction).not.toHaveBeenCalled();
  });

  it('runs nothing for a mouse press lifted outside the actions (family:action-groups FR3, FR5)', () => {
    const {onOpenChange, onAction, cancel, action} = renderOpen({
      touch: false,
    });
    // A fine primary pointer, before the mouse is checked.
    expect(window.matchMedia('(pointer: coarse)').matches).toBe(false);
    const dialog = screen.getByRole('alertdialog');
    mouse(action, 'pointerdown', 116);
    expect(action).toHaveAttribute('data-astryx-press', 'on');
    // Off both actions: nothing is highlighted while the button is held.
    mouse(action, 'pointermove', 116, 300);
    expect(action).not.toHaveAttribute('data-astryx-press');
    expect(cancel).not.toHaveAttribute('data-astryx-press');
    mouse(dialog, 'pointerup', 116, 300);
    expect(onAction).not.toHaveBeenCalled();
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it('keeps the keyboard on the buttons under every pointer: Enter runs the action and Space cancels (FR8)', async () => {
    for (const touch of [true, false]) {
      const user = userEvent.setup();
      const {onOpenChange, onAction, cancel, action} = renderOpen({touch});
      action.focus();
      await user.keyboard('{Enter}');
      expect(onAction).toHaveBeenCalledTimes(1);
      cancel.focus();
      await user.keyboard(' ');
      expect(onOpenChange).toHaveBeenCalledTimes(1);
      expect(onOpenChange).toHaveBeenCalledWith(false);
      expect(onAction).toHaveBeenCalledTimes(1);
      cleanup();
      vi.unstubAllGlobals();
    }
  });

  it('tracks only the actions: a press that lands on the title, the message or the backdrop and slides onto an action runs nothing', async () => {
    const {onOpenChange, onAction, cancel} = renderOpen();
    await completePresentation();
    const dialog = screen.getByRole('alertdialog');
    // A touch on ::backdrop targets the dialog element itself.
    for (const start of [
      screen.getByText('Delete item?'),
      screen.getByText('This cannot be undone.'),
      dialog,
    ]) {
      const id = touchId++;
      touch('touchstart', start, {x: 60, y: 40}, id);
      touch('touchmove', start, {x: 60, y: 156}, id);
      expect(cancel).not.toHaveAttribute('data-astryx-press');
      touch('touchend', start, {x: 60, y: 156}, id);
    }
    expect(onOpenChange).not.toHaveBeenCalled();
    expect(onAction).not.toHaveBeenCalled();
  });
});

describe('useImperativeAlertDialog', () => {
  const noop = () => {};

  function Harness({onAction = noop}: {onAction?: () => unknown}) {
    const alert = useImperativeAlertDialog();
    return (
      <>
        <button
          type="button"
          onClick={() =>
            alert.show({
              title: 'Delete item?',
              description: 'This action cannot be undone.',
              actionLabel: 'Delete',
              onAction,
            })
          }>
          Open
        </button>
        <button type="button" onClick={alert.hide}>
          Close it
        </button>
        <span data-testid="is-open">{String(alert.isOpen)}</span>
        {alert.element}
      </>
    );
  }

  it('renders nothing until show is called', () => {
    render(<Harness />);
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    expect(screen.getByTestId('is-open')).toHaveTextContent('false');
  });

  it('shows the dialog with the given options', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(screen.getByRole('button', {name: 'Open'}));
    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    expect(screen.getByText('Delete item?')).toBeInTheDocument();
    expect(
      screen.getByText('This action cannot be undone.'),
    ).toBeInTheDocument();
    expect(screen.getByTestId('is-open')).toHaveTextContent('true');
  });

  it('hides on hide()', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(screen.getByRole('button', {name: 'Open'}));
    await user.click(screen.getByRole('button', {name: 'Close it'}));
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    expect(screen.getByTestId('is-open')).toHaveTextContent('false');
  });

  it('closes when the dialog cancels', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(screen.getByRole('button', {name: 'Open'}));
    // An activation with no pointer: jsdom lays nothing out, so a pointer
    // press on the alert's action group would hit-test empty rects.
    fireEvent.click(screen.getByRole('button', {name: 'Cancel'}));
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    expect(screen.getByTestId('is-open')).toHaveTextContent('false');
  });

  it('forwards onAction and leaves closing to the caller', async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();
    render(<Harness onAction={onAction} />);
    await user.click(screen.getByRole('button', {name: 'Open'}));
    // An activation with no pointer (see "closes when the dialog cancels").
    fireEvent.click(screen.getByRole('button', {name: 'Delete'}));
    expect(onAction).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
  });

  it('can be shown again after being hidden', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(screen.getByRole('button', {name: 'Open'}));
    await user.click(screen.getByRole('button', {name: 'Close it'}));
    await user.click(screen.getByRole('button', {name: 'Open'}));
    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    expect(screen.getByTestId('is-open')).toHaveTextContent('true');
  });
});
