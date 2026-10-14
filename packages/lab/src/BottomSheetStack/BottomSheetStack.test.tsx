// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file BottomSheetStack.test.tsx
 * @input Uses vitest, Testing Library, react-dom client/server, BottomSheetStack, Core BottomSheet, BottomSheetSwitcher, Dialog, AlertDialog
 * @output Lab tests for sheets anywhere in the tree, tree-order stacking, concurrent React, first-frame correctness, nested stacks, Core layers above the stack, one-level dismissal, covered-level state, focus, and warnings
 * @position Lab tests; validates BottomSheetStack.tsx against requirements R1–R10 (see the describe blocks)
 */

import {act, fireEvent, render, screen} from '@testing-library/react';
import {
  Activity,
  Component,
  StrictMode,
  Suspense,
  createContext,
  createRef,
  memo,
  startTransition,
  use,
  useDeferredValue,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from 'react';
import {createPortal, flushSync} from 'react-dom';
import {createRoot, hydrateRoot} from 'react-dom/client';
import {renderToString} from 'react-dom/server';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {AlertDialog} from '@astryxdesign/core/AlertDialog';
import {BottomSheet, BottomSheetSwitcher} from '@astryxdesign/core/BottomSheet';
import {Dialog} from '@astryxdesign/core/Dialog';
import {Lightbox} from '@astryxdesign/core/Lightbox';
import {MobileNav} from '@astryxdesign/core/MobileNav';
import {Popover} from '@astryxdesign/core/Popover';
import {Selector} from '@astryxdesign/core/Selector';
import {BottomSheetStack} from './BottomSheetStack';

/** Every native showModal/show/close, in order, with the dialog's label and whether it was displayed. */
let nativeLog: Array<{
  call: 'showModal' | 'show' | 'close';
  label: string | null;
  displayed: boolean;
  stack: boolean;
}> = [];
function isDisplayed(dialog: HTMLDialogElement): boolean {
  // No stylesheet in jsdom: the StyleX class carries the display rule.
  return /dialogOpen/.test(dialog.className);
}

beforeEach(() => {
  nativeLog = [];
  HTMLDialogElement.prototype.showModal = vi.fn(function (
    this: HTMLDialogElement,
  ) {
    nativeLog.push({
      call: 'showModal',
      label: this.getAttribute('aria-label'),
      displayed: isDisplayed(this),
      stack: this.hasAttribute('data-bottom-sheet-stack'),
    });
    this.setAttribute('open', '');
  });
  HTMLDialogElement.prototype.show = vi.fn(function (this: HTMLDialogElement) {
    nativeLog.push({
      call: 'show',
      label: this.getAttribute('aria-label'),
      displayed: isDisplayed(this),
      stack: this.hasAttribute('data-bottom-sheet-stack'),
    });
    this.setAttribute('open', '');
  });
  HTMLDialogElement.prototype.close = vi.fn(function (this: HTMLDialogElement) {
    nativeLog.push({
      call: 'close',
      label: this.getAttribute('aria-label'),
      displayed: isDisplayed(this),
      stack: this.hasAttribute('data-bottom-sheet-stack'),
    });
    this.removeAttribute('open');
  });
  HTMLElement.prototype.showPopover = vi.fn();
  HTMLElement.prototype.hidePopover = vi.fn();
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
  vi.restoreAllMocks();
});

function getDialog(root: ParentNode = document): HTMLDialogElement {
  const dialog = root.querySelector<HTMLDialogElement>(
    '[data-bottom-sheet-stack]',
  );
  if (dialog == null) {
    throw new Error('stack dialog not found');
  }
  return dialog;
}

/**
 * The level boxes in slot (stack) order. Given a stack dialog, only that
 * stack's own slot (a stack inside a Dialog inside a level is nested in the
 * outer dialog's DOM).
 */
function getLevels(root: ParentNode = document): HTMLElement[] {
  const slot =
    root instanceof HTMLDialogElement
      ? root.querySelector(':scope > [data-bottom-sheet-stack-levels]')
      : root.querySelector('[data-bottom-sheet-stack-levels]');
  return Array.from(
    slot?.querySelectorAll<HTMLElement>(
      ':scope > [data-bottom-sheet-stack-level]',
    ) ?? [],
  );
}

function getLevel(index: number): HTMLElement {
  const level = document.querySelector<HTMLElement>(
    `[data-bottom-sheet-stack-level="${index}"]`,
  );
  if (level == null) {
    throw new Error(`level ${index} not found`);
  }
  return level;
}

function levelState(index: number): string | null {
  return getLevel(index).getAttribute('data-bottom-sheet-stack-level-state');
}

/** `testid:state:depth` per level, in stack order. */
function levelSummary(root: ParentNode = document): string[] {
  return getLevels(root).map(level => {
    const testId =
      level.querySelector('[data-testid]')?.getAttribute('data-testid') ??
      level.getAttribute('data-bottom-sheet-stack-level-kind');
    return `${testId}:${level.getAttribute(
      'data-bottom-sheet-stack-level-state',
    )}:${level.getAttribute('data-bottom-sheet-stack-level-depth')}`;
  });
}

function getPanel(testId: string): HTMLElement {
  return screen.getByTestId(testId);
}

function getPositioner(testId: string): HTMLElement {
  const positioner = getPanel(testId).parentElement;
  if (positioner == null) {
    throw new Error('positioner not found');
  }
  return positioner;
}

function positionerTransform(testId: string): string {
  const style = getPositioner(testId).getAttribute('style') ?? '';
  const match = /--x-transform:\s*([^;]+);/.exec(style);
  return match?.[1] ?? '';
}

const RECEDE_1 = 'translateY(calc(var(--spacing-2) * -1)) scale(0.96)';
const RECEDE_2 = 'translateY(calc(var(--spacing-2) * -2)) scale(0.92)';
const FLAT = 'translateY(0) scale(1)';

// The grab handle is the panel's first child (decorative, aria-hidden).
function getHandle(testId: string): HTMLElement {
  const handle = getPanel(testId).querySelector<HTMLElement>(
    '[aria-hidden="true"]',
  );
  if (handle == null) {
    throw new Error('grab handle not found');
  }
  return handle;
}

// jsdom PointerEvents don't carry clientY; dispatch plain events with the
// coords the gesture hook reads. No measured height in jsdom, so any
// downward release past the threshold dismisses.
function swipeDown(testId: string) {
  const handle = getHandle(testId);
  fireEvent.pointerDown(handle, {
    pointerId: 1,
    clientY: 0,
    button: 0,
    isPrimary: true,
  });
  fireEvent.pointerMove(handle, {pointerId: 1, clientY: 40});
  fireEvent.pointerMove(handle, {pointerId: 1, clientY: 120});
  fireEvent.pointerUp(handle, {pointerId: 1, clientY: 120});
}

function finishExit(testId: string) {
  fireEvent.transitionEnd(getPanel(testId), {propertyName: 'transform'});
}

function pressEscape(target: Element = getDialog()) {
  fireEvent.keyDown(target, {key: 'Escape'});
}

function clickScrim() {
  fireEvent.click(getDialog());
}

/** A sheet behind a wrapper whose props share nothing with BottomSheet's. */
function Wrapped({
  open,
  label,
  onClose,
  children,
}: {
  open: boolean;
  label: string;
  onClose?: () => void;
  children?: ReactNode;
}) {
  return (
    <BottomSheet
      isOpen={open}
      onOpenChange={() => onClose?.()}
      label={label}
      data-testid={label}>
      {children ?? label}
    </BottomSheet>
  );
}

class ErrorBoundary extends Component<{children: ReactNode}> {
  state = {hasError: false};
  static getDerivedStateFromError() {
    return {hasError: true};
  }
  render() {
    return this.state.hasError ? null : this.props.children;
  }
}

function deferred() {
  let resolve!: () => void;
  let settled = false;
  const promise = new Promise<void>(r => {
    resolve = () => {
      settled = true;
      r();
    };
  });
  return {promise, resolve, isSettled: () => settled};
}

interface TwoLevelProps {
  initialList?: boolean;
  initialDetail?: boolean;
  listPurpose?: 'info' | 'form' | 'required';
  detailPurpose?: 'info' | 'form' | 'required';
  onListChange?: (isOpen: boolean) => void;
  onDetailChange?: (isOpen: boolean) => void;
  listFinalFocusRef?: RefObject<HTMLElement | null>;
  detailFinalFocusRef?: RefObject<HTMLElement | null>;
  hasScrim?: boolean;
}

function TwoLevels({
  initialList = false,
  initialDetail = false,
  listPurpose,
  detailPurpose,
  onListChange,
  onDetailChange,
  listFinalFocusRef,
  detailFinalFocusRef,
  hasScrim,
}: TwoLevelProps) {
  const [isListOpen, setIsListOpen] = useState(initialList);
  const [isDetailOpen, setIsDetailOpen] = useState(initialDetail);
  return (
    <>
      <button type="button" onClick={() => setIsListOpen(true)}>
        Open list
      </button>
      <button
        type="button"
        onClick={() => {
          setIsListOpen(true);
          setIsDetailOpen(true);
        }}>
        Deep link
      </button>
      <button
        type="button"
        onClick={() => {
          setIsListOpen(false);
          setIsDetailOpen(false);
        }}>
        Close all
      </button>
      <BottomSheetStack hasScrim={hasScrim}>
        <BottomSheet
          isOpen={isListOpen}
          onOpenChange={next => {
            onListChange?.(next);
            setIsListOpen(next);
          }}
          label="List"
          purpose={listPurpose}
          finalFocusRef={listFinalFocusRef}
          data-testid="list">
          <input aria-label="Search" />
          <button type="button" onClick={() => setIsDetailOpen(true)}>
            Open detail
          </button>
        </BottomSheet>
        <BottomSheet
          isOpen={isDetailOpen}
          onOpenChange={next => {
            onDetailChange?.(next);
            setIsDetailOpen(next);
          }}
          label="Detail"
          purpose={detailPurpose}
          finalFocusRef={detailFinalFocusRef}
          data-testid="detail">
          <button type="button" onClick={() => setIsDetailOpen(false)}>
            Done
          </button>
        </BottomSheet>
      </BottomSheetStack>
    </>
  );
}

describe('BottomSheetStack', () => {
  describe('R1 sheets anywhere in the tree', () => {
    it('stacks sheets behind wrappers, DOM elements, Suspense, an ErrorBoundary, a provider, Activity, a multi-sheet component, and a mapped list, in tree order', () => {
      const closed: string[] = [];
      const Theme = createContext('light');
      function Two() {
        return (
          <>
            <Wrapped open label="TwoA" onClose={() => closed.push('TwoA')} />
            <Wrapped open label="TwoB" onClose={() => closed.push('TwoB')} />
          </>
        );
      }
      function Themed() {
        const theme = use(Theme);
        return (
          <Wrapped
            open
            label={`Themed-${theme}`}
            onClose={() => closed.push('Themed')}
          />
        );
      }
      render(
        <BottomSheetStack>
          <Wrapped open label="W" onClose={() => closed.push('W')} />
          <div style={{padding: 8}}>
            <Wrapped open label="Div" onClose={() => closed.push('Div')} />
          </div>
          <Suspense fallback={<span>loading</span>}>
            <Wrapped open label="Susp" onClose={() => closed.push('Susp')} />
          </Suspense>
          <ErrorBoundary>
            <Wrapped open label="Err" onClose={() => closed.push('Err')} />
          </ErrorBoundary>
          <Theme value="dark">
            <Themed />
          </Theme>
          <Activity mode="visible">
            <Wrapped open label="Act" onClose={() => closed.push('Act')} />
          </Activity>
          <Two />
          {['L1', 'L2'].map(name => (
            <Wrapped
              key={name}
              open={name === 'L2'}
              label={name}
              onClose={() => closed.push(name)}
            />
          ))}
        </BottomSheetStack>,
      );
      expect(levelSummary()).toEqual([
        'W:covered:8',
        'Div:covered:7',
        'Susp:covered:6',
        'Err:covered:5',
        'Themed-dark:covered:4',
        'Act:covered:3',
        'TwoA:covered:2',
        'TwoB:covered:1',
        'L1:closed:1',
        'L2:top:0',
      ]);
      expect(document.querySelectorAll('dialog')).toHaveLength(1);
      expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalledTimes(1);
      expect(getDialog()).toHaveAccessibleName('L2');
      expect(positionerTransform('TwoB')).toBe(RECEDE_1);
      expect(positionerTransform('TwoA')).toBe(RECEDE_2);
      expect(positionerTransform('W')).toBe(RECEDE_2);
      pressEscape();
      expect(closed).toEqual(['L2']);
    });

    it('keeps wrapper output off the scrim: the children region is hidden and the panels live in the slot', () => {
      render(
        <BottomSheetStack>
          <div data-testid="wrapper">
            <Wrapped open label="A" />
          </div>
        </BottomSheetStack>,
      );
      const region = document.querySelector(
        '[data-bottom-sheet-stack-children]',
      );
      expect(region).toHaveAttribute('hidden');
      expect(region).toContainElement(screen.getByTestId('wrapper'));
      expect(region).not.toContainElement(getPanel('A'));
      expect(
        document.querySelector('[data-bottom-sheet-stack-levels]'),
      ).toContainElement(getPanel('A'));
    });
  });

  describe('R2 no dependence on children props or shape', () => {
    it('follows the sheet, not a wrapper prop that happens to be named isOpen', () => {
      // The wrapper's `isOpen` means the opposite of its sheet's.
      function Inverted({isOpen}: {isOpen: boolean}) {
        return <Wrapped open={!isOpen} label="Inv" />;
      }
      render(
        <BottomSheetStack>
          <Inverted isOpen={false} />
          <Wrapped open={false} label="B" />
        </BottomSheetStack>,
      );
      expect(levelSummary()).toEqual(['Inv:top:0', 'B:closed:0']);
      expect(getDialog()).toHaveAttribute('open');
    });

    it('does not warn about children that are not sheets', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      render(
        <BottomSheetStack>
          <div>Not a level</div>
          <>
            <Wrapped open label="A" />
          </>
        </BottomSheetStack>,
      );
      expect(warn).not.toHaveBeenCalled();
      expect(levelSummary()).toEqual(['A:top:0']);
    });
  });

  describe('R3 concurrent React', () => {
    it('StrictMode leaves one level per sheet, one showModal, and keeps panel state', () => {
      render(
        <StrictMode>
          <BottomSheetStack>
            <Wrapped open label="A" />
            <BottomSheet
              isOpen
              onOpenChange={() => {}}
              label="B"
              data-testid="B">
              <input aria-label="bInput" defaultValue="" />
            </BottomSheet>
          </BottomSheetStack>
        </StrictMode>,
      );
      fireEvent.change(screen.getByLabelText('bInput'), {
        target: {value: 'typed'},
      });
      expect(levelSummary()).toEqual(['A:covered:1', 'B:top:0']);
      expect(
        document.querySelectorAll('[data-bottom-sheet-stack-level]'),
      ).toHaveLength(2);
      expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalledTimes(1);
      expect(screen.getByLabelText('bInput')).toHaveValue('typed');
    });

    it('a transition that suspends registers nothing until it commits', async () => {
      const gate = deferred();
      function Gate({children}: {children: ReactNode}) {
        if (!gate.isSettled()) {
          throw gate.promise;
        }
        return <>{children}</>;
      }
      let setShow!: (value: boolean) => void;
      function App() {
        const [show, set] = useState(false);
        setShow = set;
        return (
          <BottomSheetStack>
            <Wrapped open label="A" />
            <Suspense fallback={null}>
              {show ? (
                <Gate>
                  <Wrapped open label="B" />
                </Gate>
              ) : null}
            </Suspense>
          </BottomSheetStack>
        );
      }
      render(<App />);
      act(() => {
        startTransition(() => setShow(true));
      });
      expect(levelSummary()).toEqual(['A:top:0']);
      expect(getPanel('A')).toHaveFocus();
      await act(async () => {
        gate.resolve();
        await gate.promise;
      });
      expect(levelSummary()).toEqual(['A:covered:1', 'B:top:0']);
    });

    it('Suspense hide takes a level out and reveal puts it back in its tree position', async () => {
      const gate = deferred();
      function MaybeSuspend({suspend}: {suspend: boolean}) {
        if (suspend && !gate.isSettled()) {
          throw gate.promise;
        }
        return null;
      }
      let setSuspend!: (value: boolean) => void;
      function App() {
        const [suspend, set] = useState(false);
        setSuspend = set;
        return (
          <BottomSheetStack>
            <Wrapped open label="A" />
            <Suspense fallback={<span data-testid="fallback" />}>
              <Wrapped open label="B">
                <MaybeSuspend suspend={suspend} />
              </Wrapped>
            </Suspense>
            <Wrapped open label="C" />
          </BottomSheetStack>
        );
      }
      render(<App />);
      expect(levelSummary()).toEqual(['A:covered:2', 'B:covered:1', 'C:top:0']);
      act(() => setSuspend(true));
      expect(screen.getByTestId('fallback')).toBeInTheDocument();
      expect(levelSummary()).toEqual(['A:covered:1', 'C:top:0']);
      expect(positionerTransform('A')).toBe(RECEDE_1);
      await act(async () => {
        gate.resolve();
        await gate.promise;
      });
      expect(levelSummary()).toEqual(['A:covered:2', 'B:covered:1', 'C:top:0']);
      expect(positionerTransform('A')).toBe(RECEDE_2);
    });

    it('Activity hidden takes a level out and visible puts it back with its state', () => {
      let setHidden!: (value: boolean) => void;
      function App() {
        const [hidden, set] = useState(false);
        setHidden = set;
        return (
          <BottomSheetStack>
            <Wrapped open label="A" />
            <Activity mode={hidden ? 'hidden' : 'visible'}>
              <BottomSheet
                isOpen
                onOpenChange={() => {}}
                label="B"
                data-testid="B">
                <input aria-label="bInput" defaultValue="" />
              </BottomSheet>
            </Activity>
            <Wrapped open label="C" />
          </BottomSheetStack>
        );
      }
      render(<App />);
      fireEvent.change(screen.getByLabelText('bInput'), {
        target: {value: 'kept'},
      });
      act(() => setHidden(true));
      expect(levelSummary()).toEqual(['A:covered:1', 'C:top:0']);
      act(() => setHidden(false));
      expect(levelSummary()).toEqual(['A:covered:2', 'B:covered:1', 'C:top:0']);
      expect(screen.getByLabelText('bInput')).toHaveValue('kept');
    });

    it('useDeferredValue opens a level in the later commit', async () => {
      let setOpen!: (value: boolean) => void;
      function App() {
        const [open, set] = useState(false);
        setOpen = set;
        const deferredOpen = useDeferredValue(open);
        return (
          <BottomSheetStack>
            <Wrapped open label="A" />
            <Wrapped open={deferredOpen} label="B" />
          </BottomSheetStack>
        );
      }
      render(<App />);
      await act(async () => {
        setOpen(true);
      });
      expect(levelSummary()).toEqual(['A:covered:1', 'B:top:0']);
      expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalledTimes(1);
    });

    it('SSR and hydration markup match; a closed sheet registers as a closed level and opens on the client', async () => {
      const error = vi.spyOn(console, 'error').mockImplementation(() => {});
      let setOpen!: (value: boolean) => void;
      function App() {
        const [open, set] = useState(false);
        setOpen = set;
        return (
          <BottomSheetStack>
            <div>
              <Wrapped open={open} label="A" />
            </div>
          </BottomSheetStack>
        );
      }
      const html = renderToString(<App />);
      expect(html).toContain('data-bottom-sheet-stack-anchor');
      expect(html).not.toContain('data-testid="A"');
      const container = document.createElement('div');
      container.innerHTML = html;
      document.body.appendChild(container);
      let root!: ReturnType<typeof hydrateRoot>;
      await act(async () => {
        root = hydrateRoot(container, <App />);
      });
      expect(error).not.toHaveBeenCalled();
      expect(levelSummary(container)).toEqual(['A:closed:0']);
      expect(getDialog(container)).not.toHaveAttribute('open');
      act(() => setOpen(true));
      expect(levelSummary(container)).toEqual(['A:top:0']);
      expect(getDialog(container)).toHaveAttribute('open');
      act(() => root.unmount());
      container.remove();
    });
  });

  describe('R4 first visible frame', () => {
    function mountSync(element: ReactNode) {
      const container = document.createElement('div');
      document.body.appendChild(container);
      const root = createRoot(container);
      let microtaskRan = false;
      void Promise.resolve().then(() => {
        microtaskRan = true;
      });
      flushSync(() => {
        root.render(element);
      });
      return {
        container,
        root,
        microtaskRan: () => microtaskRan,
        unmount: () => {
          act(() => root.unmount());
          container.remove();
        },
      };
    }

    it('under flushSync the DOM is final before any microtask: dialog open, one showModal, order, depth, inert, transforms', () => {
      const mounted = mountSync(
        <BottomSheetStack>
          <Wrapped open label="A" />
          <div>
            <Wrapped open label="B" />
          </div>
          <Wrapped open={false} label="C" />
        </BottomSheetStack>,
      );
      expect(mounted.microtaskRan()).toBe(false);
      const levels = getLevels(mounted.container);
      expect(levelSummary(mounted.container)).toEqual([
        'A:covered:1',
        'B:top:0',
        'C:closed:0',
      ]);
      expect(levels[0]).toHaveAttribute('inert');
      expect(levels[0]).toHaveAttribute('aria-hidden', 'true');
      expect(levels[1]).not.toHaveAttribute('inert');
      expect(levels[2]).toHaveAttribute('inert');
      expect(positionerTransform('A')).toBe(RECEDE_1);
      expect(positionerTransform('B')).toBe(FLAT);
      expect(getDialog(mounted.container)).toHaveAttribute('open');
      expect(getDialog(mounted.container)).toHaveAttribute(
        'aria-modal',
        'true',
      );
      expect(getDialog(mounted.container)).toHaveAccessibleName('B');
      expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalledTimes(1);
      mounted.unmount();
    });

    it('under flushSync a deep link opens three levels and a one-update close animates them together before any microtask', () => {
      let setDepth!: (value: number) => void;
      function App() {
        const [depth, set] = useState(0);
        setDepth = set;
        return (
          <BottomSheetStack>
            <Wrapped open={depth > 0} label="One" />
            <Wrapped open={depth > 1} label="Two" />
            <Wrapped open={depth > 2} label="Three" />
          </BottomSheetStack>
        );
      }
      const mounted = mountSync(<App />);
      expect(getDialog(mounted.container)).not.toHaveAttribute('open');
      let microtaskRan = false;
      void Promise.resolve().then(() => {
        microtaskRan = true;
      });
      flushSync(() => setDepth(3));
      expect(microtaskRan).toBe(false);
      expect(levelSummary(mounted.container)).toEqual([
        'One:covered:2',
        'Two:covered:1',
        'Three:top:0',
      ]);
      expect(positionerTransform('One')).toBe(RECEDE_2);
      expect(positionerTransform('Two')).toBe(RECEDE_1);
      expect(positionerTransform('Three')).toBe(FLAT);
      expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalledTimes(1);

      flushSync(() => setDepth(0));
      expect(microtaskRan).toBe(false);
      expect(levelSummary(mounted.container)).toEqual([
        'One:exiting:0',
        'Two:exiting:0',
        'Three:exiting:0',
      ]);
      expect(positionerTransform('One')).toBe(FLAT);
      expect(getDialog(mounted.container)).toHaveAttribute('open');
      expect(HTMLDialogElement.prototype.close).not.toHaveBeenCalled();
      mounted.unmount();
    });

    it('a panel measuring itself in a mount layout effect sees a connected element', () => {
      const seen: boolean[] = [];
      function Measure() {
        const ref = useRef<HTMLDivElement | null>(null);
        useLayoutEffect(() => {
          seen.push(ref.current?.isConnected === true);
        }, []);
        return <div ref={ref} />;
      }
      render(
        <BottomSheetStack>
          <Wrapped open label="A" />
          <Wrapped open label="B">
            <Measure />
          </Wrapped>
        </BottomSheetStack>,
      );
      expect(seen).toEqual([true]);
      expect(levelSummary()).toEqual(['A:covered:1', 'B:top:0']);
    });
  });

  describe('R5 nested stacks', () => {
    it('merges an inner stack, direct or inside a level, into the outer one: one dialog, one scrim, one warning each, inner hasScrim ignored', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const closed: string[] = [];
      render(
        <BottomSheetStack>
          <BottomSheetStack hasScrim={false}>
            <Wrapped
              open
              label="Inner1"
              onClose={() => closed.push('Inner1')}
            />
          </BottomSheetStack>
          <Wrapped open label="Outer" onClose={() => closed.push('Outer')}>
            <BottomSheetStack hasScrim={false}>
              <Wrapped
                open
                label="InContent"
                onClose={() => closed.push('InContent')}
              />
            </BottomSheetStack>
          </Wrapped>
        </BottomSheetStack>,
      );
      expect(document.querySelectorAll('dialog')).toHaveLength(1);
      expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalledTimes(1);
      expect(HTMLDialogElement.prototype.show).not.toHaveBeenCalled();
      expect(getDialog()).toHaveAttribute('aria-modal', 'true');
      expect(levelSummary()).toEqual([
        'Inner1:covered:2',
        'Outer:covered:1',
        'InContent:top:0',
      ]);
      const nestedWarnings = warn.mock.calls.filter(call =>
        String(call[0]).includes('inside another BottomSheetStack'),
      );
      expect(nestedWarnings).toHaveLength(2);
      pressEscape();
      expect(closed).toEqual(['InContent']);
    });
  });

  describe('R6 no global stack', () => {
    it('a sheet outside the stack keeps its own dialog, and an empty stack opens nothing', () => {
      render(
        <>
          <BottomSheet
            isOpen
            onOpenChange={() => {}}
            label="Alone"
            data-testid="alone">
            Alone
          </BottomSheet>
          <BottomSheetStack>
            <div>no sheets here</div>
          </BottomSheetStack>
        </>,
      );
      expect(getDialog()).not.toHaveAttribute('open');
      expect(getLevels()).toHaveLength(0);
      const own = getPanel('alone').closest('dialog');
      expect(own).not.toBe(getDialog());
      expect(own).toHaveAttribute('open');
      expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalledTimes(1);
    });
  });

  describe('R7 tree order', () => {
    it('stacks open levels in tree order, not open order', () => {
      function OverlayFirst() {
        const [isListOpen, setIsListOpen] = useState(false);
        const [isHelpOpen, setIsHelpOpen] = useState(true);
        return (
          <>
            <button type="button" onClick={() => setIsListOpen(true)}>
              Open list
            </button>
            <BottomSheetStack>
              <BottomSheet
                isOpen={isListOpen}
                onOpenChange={setIsListOpen}
                label="List"
                data-testid="list">
                List
              </BottomSheet>
              <BottomSheet
                isOpen={isHelpOpen}
                onOpenChange={setIsHelpOpen}
                label="Help"
                data-testid="help">
                Help
              </BottomSheet>
            </BottomSheetStack>
          </>
        );
      }
      render(<OverlayFirst />);
      expect(levelState(0)).toBe('closed');
      expect(levelState(1)).toBe('top');
      expect(getDialog()).toHaveAccessibleName('Help');

      fireEvent.click(screen.getByRole('button', {name: 'Open list'}));
      // The list opened last but sits first in the tree, so it goes under Help.
      expect(levelState(0)).toBe('covered');
      expect(levelState(1)).toBe('top');
      expect(getDialog()).toHaveAccessibleName('Help');
      expect(positionerTransform('list')).toBe(RECEDE_1);
      expect(positionerTransform('help')).toBe(FLAT);
    });

    it('opens three levels in one update, ordered and receded by depth', () => {
      function DeepLink() {
        const [depth, setDepth] = useState(0);
        return (
          <>
            <button type="button" onClick={() => setDepth(3)}>
              Deep link
            </button>
            <BottomSheetStack>
              <BottomSheet
                isOpen={depth > 0}
                onOpenChange={() => setDepth(0)}
                label="One"
                data-testid="one">
                One
              </BottomSheet>
              <BottomSheet
                isOpen={depth > 1}
                onOpenChange={() => setDepth(1)}
                label="Two"
                data-testid="two">
                Two
              </BottomSheet>
              <BottomSheet
                isOpen={depth > 2}
                onOpenChange={() => setDepth(2)}
                label="Three"
                data-testid="three">
                Three
              </BottomSheet>
            </BottomSheetStack>
          </>
        );
      }
      render(<DeepLink />);
      expect(screen.queryByRole('dialog')).toBeNull();
      fireEvent.click(screen.getByRole('button', {name: 'Deep link'}));

      expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalledTimes(1);
      expect(levelSummary()).toEqual([
        'one:covered:2',
        'two:covered:1',
        'three:top:0',
      ]);
      expect(positionerTransform('one')).toBe(RECEDE_2);
      expect(positionerTransform('two')).toBe(RECEDE_1);
      expect(positionerTransform('three')).toBe(FLAT);
      expect(getDialog()).toHaveAccessibleName('Three');
      expect(getPanel('three')).toHaveFocus();
    });

    it('a sheet inside another sheet’s content stacks right above it, with its panel outside the parent’s inert box', () => {
      const closed: string[] = [];
      function App({b}: {b: boolean}) {
        return (
          <BottomSheetStack>
            <BottomSheet
              isOpen
              onOpenChange={() => closed.push('A')}
              label="A"
              data-testid="A">
              <button type="button">in A</button>
              <Wrapped open label="C" onClose={() => closed.push('C')} />
              <Wrapped open label="C2" onClose={() => closed.push('C2')} />
            </BottomSheet>
            <Wrapped open={b} label="B" onClose={() => closed.push('B')} />
          </BottomSheetStack>
        );
      }
      const {rerender} = render(<App b={false} />);
      expect(levelSummary()).toEqual([
        'A:covered:2',
        'C:covered:1',
        'C2:top:0',
        'B:closed:0',
      ]);
      // C's anchor is in A's panel (tree position); C's panel is in its own
      // box, so A's inert and recede transform never reach it.
      expect(getPanel('A')).toContainElement(
        getPanel('A').ownerDocument.querySelector(
          '[data-bottom-sheet-stack-anchor]',
        ),
      );
      expect(getLevel(0)).not.toContainElement(getPanel('C'));
      expect(getLevel(0)).toHaveAttribute('inert');
      expect(getLevel(2)).not.toHaveAttribute('inert');
      expect(positionerTransform('C2')).toBe(FLAT);
      expect(positionerTransform('C')).toBe(RECEDE_1);
      expect(positionerTransform('A')).toBe(RECEDE_2);
      expect(getDialog()).toHaveAccessibleName('C2');
      pressEscape();
      expect(closed).toEqual(['C2']);
      rerender(<App b />);
      expect(levelSummary()).toEqual([
        'A:covered:3',
        'C:covered:2',
        'C2:covered:1',
        'B:top:0',
      ]);
    });

    it('reordering open levels while open follows the tree and keeps their state', () => {
      let setFlip!: (value: boolean) => void;
      function App() {
        const [flip, set] = useState(false);
        setFlip = set;
        const a = (
          <BottomSheet
            key="a"
            isOpen
            onOpenChange={() => {}}
            label="A"
            data-testid="A">
            <input aria-label="aInput" defaultValue="" />
          </BottomSheet>
        );
        const b = <Wrapped key="b" open label="B" />;
        return <BottomSheetStack>{flip ? [b, a] : [a, b]}</BottomSheetStack>;
      }
      render(<App />);
      fireEvent.change(screen.getByLabelText('aInput'), {
        target: {value: 'kept'},
      });
      expect(levelSummary()).toEqual(['A:covered:1', 'B:top:0']);
      act(() => setFlip(true));
      expect(levelSummary()).toEqual(['B:covered:1', 'A:top:0']);
      expect(positionerTransform('A')).toBe(FLAT);
      expect(positionerTransform('B')).toBe(RECEDE_1);
      expect(getDialog()).toHaveAccessibleName('A');
      expect(screen.getByLabelText('aInput')).toHaveValue('kept');
    });

    it('a reorder of memoised subtrees that re-renders neither the stack nor the sheets is corrected at the microtask checkpoint', async () => {
      const MemoA = memo(function MemoA() {
        return <Wrapped open label="A" />;
      });
      const MemoB = memo(function MemoB() {
        return <Wrapped open label="B" />;
      });
      // The stack's children are a stable element, so the host never
      // re-renders; the memoised sheets never re-render either. Only the
      // wrapper between them re-renders, and all it changes is DOM order.
      let setFlip!: (value: boolean) => void;
      function Reorderable() {
        const [flip, set] = useState(false);
        setFlip = set;
        const a = <MemoA key="a" />;
        const b = <MemoB key="b" />;
        return <>{flip ? [b, a] : [a, b]}</>;
      }
      const stackChildren = <Reorderable />;
      function App() {
        return <BottomSheetStack>{stackChildren}</BottomSheetStack>;
      }
      render(<App />);
      expect(levelSummary()).toEqual(['A:covered:1', 'B:top:0']);
      let raf = false;
      requestAnimationFrame(() => {
        raf = true;
      });
      act(() => setFlip(true));
      // MutationObserver callbacks run as microtasks; nothing has yielded to
      // an animation frame yet.
      await Promise.resolve();
      expect(raf).toBe(false);
      expect(levelSummary()).toEqual(['B:covered:1', 'A:top:0']);
      expect(positionerTransform('A')).toBe(FLAT);
      expect(positionerTransform('B')).toBe(RECEDE_1);
      expect(getDialog()).toHaveAccessibleName('A');
    });

    it('a sheet rendered through an app-owned portal joins the stack where its portal content lands', () => {
      const closed: string[] = [];
      function Portaled({target}: {target: HTMLElement}) {
        return createPortal(
          <Wrapped open label="P" onClose={() => closed.push('P')} />,
          target,
        );
      }
      function App() {
        const [target, setTarget] = useState<HTMLElement | null>(null);
        return (
          <BottomSheetStack>
            <Wrapped open label="A" onClose={() => closed.push('A')} />
            <div ref={setTarget} />
            {target == null ? null : <Portaled target={target} />}
            <Wrapped open label="B" onClose={() => closed.push('B')} />
          </BottomSheetStack>
        );
      }
      render(<App />);
      expect(levelSummary()).toEqual(['A:covered:2', 'P:covered:1', 'B:top:0']);
      pressEscape();
      expect(closed).toEqual(['B']);
    });
  });

  describe('R8 Core layers above the stack', () => {
    function LevelWithDialog({
      Layer,
    }: {
      Layer: (props: {
        isOpen: boolean;
        onOpenChange: (open: boolean) => void;
        children: ReactNode;
      }) => ReactNode;
    }) {
      const [isDialogOpen, setIsDialogOpen] = useState(false);
      const [isInnerOpen, setIsInnerOpen] = useState(false);
      return (
        <BottomSheetStack>
          <Wrapped open label="Base" />
          <BottomSheet
            isOpen
            onOpenChange={() => {}}
            label="Top"
            data-testid="Top">
            <button type="button" onClick={() => setIsDialogOpen(true)}>
              Open dialog
            </button>
            <Layer isOpen={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <button type="button" onClick={() => setIsInnerOpen(true)}>
                Open inner sheet
              </button>
              <BottomSheet
                isOpen={isInnerOpen}
                onOpenChange={setIsInnerOpen}
                label="Inner"
                data-testid="Inner">
                Inner
              </BottomSheet>
            </Layer>
          </BottomSheet>
        </BottomSheetStack>
      );
    }

    it('a Core Dialog opened from a level paints above the stack, and a BottomSheet inside it is standalone above the Dialog', () => {
      render(
        <LevelWithDialog
          Layer={({isOpen, onOpenChange, children}) => (
            <Dialog
              isOpen={isOpen}
              onOpenChange={onOpenChange}
              aria-label="Confirm">
              {children}
            </Dialog>
          )}
        />,
      );
      expect(levelSummary()).toEqual(['Base:covered:1', 'Top:top:0']);
      fireEvent.click(screen.getByRole('button', {name: 'Open dialog'}));
      // The Dialog is its own top-layer dialog, shown after the stack's.
      const dialogs = Array.from(document.querySelectorAll('dialog[open]'));
      expect(dialogs).toHaveLength(2);
      expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalledTimes(2);
      expect(levelSummary()).toEqual(['Base:covered:1', 'Top:top:0']);

      fireEvent.click(screen.getByRole('button', {name: 'Open inner sheet'}));
      // The inner sheet is not a level: it owns its own dialog, the third
      // one shown, so it paints above the Dialog.
      expect(levelSummary()).toEqual(['Base:covered:1', 'Top:top:0']);
      const innerDialog = getPanel('Inner').closest('dialog');
      expect(innerDialog).not.toBe(getDialog());
      expect(innerDialog).toHaveAttribute('open');
      expect(innerDialog).toHaveAccessibleName('Inner');
      expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalledTimes(3);
      expect(Array.from(document.querySelectorAll('dialog[open]')).at(-1)).toBe(
        innerDialog,
      );
      expect(positionerTransform('Inner')).toBe('');
      // Escape reaches the inner sheet first, not the stack.
      pressEscape(innerDialog ?? undefined);
      expect(levelSummary()).toEqual(['Base:covered:1', 'Top:top:0']);
    });

    it('a level and a Dialog inside it opening in the same commit: the stack shell shows before the Dialog', () => {
      render(
        <BottomSheetStack>
          <BottomSheet
            isOpen
            onOpenChange={() => {}}
            label="Level"
            data-testid="Level">
            <Dialog isOpen onOpenChange={() => {}} aria-label="Confirm">
              Confirm
            </Dialog>
          </BottomSheet>
        </BottomSheetStack>,
      );
      expect(nativeLog.map(entry => `${entry.call}:${entry.label}`)).toEqual([
        'showModal:Level',
        'showModal:Confirm',
      ]);
      expect(levelSummary()).toEqual(['Level:top:0']);
    });

    it('a nested BottomSheetStack inside a Dialog opened from a level is its own host above the Dialog, not merged', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      render(
        <BottomSheetStack>
          <BottomSheet
            isOpen
            onOpenChange={() => {}}
            label="Level"
            data-testid="Level">
            <Dialog isOpen onOpenChange={() => {}} aria-label="Confirm">
              <BottomSheetStack data-testid="inner-stack">
                <Wrapped open label="InDialog" />
              </BottomSheetStack>
            </Dialog>
          </BottomSheet>
        </BottomSheetStack>,
      );
      const stacks = document.querySelectorAll('[data-bottom-sheet-stack]');
      expect(stacks).toHaveLength(2);
      expect(nativeLog.map(entry => `${entry.call}:${entry.label}`)).toEqual([
        'showModal:Level',
        'showModal:Confirm',
        'showModal:InDialog',
      ]);
      expect(
        warn.mock.calls.some(call =>
          String(call[0]).includes('inside another BottomSheetStack'),
        ),
      ).toBe(false);
      // The outer stack has one level; the inner stack has its own.
      expect(levelSummary(stacks[0])).toEqual(['Level:top:0']);
      expect(levelSummary(stacks[1])).toEqual(['InDialog:top:0']);
    });

    it.each([
      {
        name: 'Popover',
        Layer: ({children}: {children: ReactNode}) => (
          <Popover
            isOpen
            onOpenChange={() => {}}
            label="Options"
            content={children}>
            <button type="button">Options</button>
          </Popover>
        ),
      },
      {
        name: 'Lightbox',
        Layer: ({children}: {children: ReactNode}) => (
          <Lightbox
            isOpen
            onOpenChange={() => {}}
            media={{src: '/photo.jpg', alt: 'Photo', caption: children}}
          />
        ),
      },
      {
        name: 'MobileNav',
        Layer: ({children}: {children: ReactNode}) => (
          <MobileNav isOpen onOpenChange={() => {}}>
            {children}
          </MobileNav>
        ),
      },
    ])(
      'a BottomSheet inside a $name opened from a level is standalone above it, and the stack is unaffected',
      ({Layer}) => {
        render(
          <BottomSheetStack>
            <BottomSheet
              isOpen
              onOpenChange={() => {}}
              label="Level"
              data-testid="Level">
              <Layer>
                <BottomSheet
                  isOpen
                  onOpenChange={() => {}}
                  label="Inner"
                  data-testid="Inner">
                  Inner
                </BottomSheet>
              </Layer>
            </BottomSheet>
          </BottomSheetStack>,
        );
        expect(levelSummary()).toEqual(['Level:top:0']);
        const innerDialog = getPanel('Inner').closest('dialog');
        expect(innerDialog).not.toBeNull();
        expect(innerDialog).not.toBe(getDialog());
        expect(innerDialog).toHaveAccessibleName('Inner');
        expect(innerDialog).toHaveAttribute('open');
        expect(positionerTransform('Inner')).toBe('');
        // The inner sheet's own dialog was shown after the stack's shell and
        // after the layer it is in. (Which of the layer and the shell shows
        // first when both open in one commit is Core's existing ordering and
        // out of scope here.)
        const shown = nativeLog
          .filter(entry => entry.call !== 'close')
          .map(entry => entry.label);
        expect(shown.indexOf('Inner')).toBeGreaterThan(shown.indexOf('Level'));
        expect(shown.filter(label => label === 'Inner')).toHaveLength(1);
      },
    );

    it('a Selector with a bottom-sheet presentation inside a level stacks its picker sheet above that level', async () => {
      render(
        <BottomSheetStack>
          <BottomSheet
            isOpen
            onOpenChange={() => {}}
            label="Level"
            data-testid="Level">
            <Selector
              label="Fruit"
              options={['Apple', 'Banana']}
              onChange={() => {}}
              presentation="bottom-sheet"
            />
          </BottomSheet>
        </BottomSheetStack>,
      );
      fireEvent.click(screen.getByRole('combobox'));
      // The picker is a lazily loaded Core BottomSheet rendered in the
      // level's content, so it is a level right above its parent in the one
      // shared dialog.
      await screen.findByRole('option', {name: /Banana/});
      expect(document.querySelectorAll('dialog')).toHaveLength(1);
      const levels = getLevels();
      expect(levels).toHaveLength(2);
      expect(levels[0]).toHaveAttribute(
        'data-bottom-sheet-stack-level-state',
        'covered',
      );
      expect(levels[1]).toHaveAttribute(
        'data-bottom-sheet-stack-level-state',
        'top',
      );
      expect(getDialog()).toHaveAccessibleName('Fruit');
      expect(screen.getByRole('option', {name: /Banana/})).toBeInTheDocument();
    });

    it('an AlertDialog opened from a level is its own top-layer dialog and its content is outside the stack', () => {
      function App() {
        const [isAlertOpen, setIsAlertOpen] = useState(false);
        const [isInnerOpen, setIsInnerOpen] = useState(false);
        return (
          <BottomSheetStack>
            <BottomSheet
              isOpen
              onOpenChange={() => {}}
              label="Top"
              data-testid="Top">
              <button type="button" onClick={() => setIsAlertOpen(true)}>
                Delete
              </button>
              <AlertDialog
                isOpen={isAlertOpen}
                onOpenChange={setIsAlertOpen}
                title="Delete?"
                description="This cannot be undone."
                actionLabel="More options"
                onAction={() => setIsInnerOpen(true)}
              />
              <Wrapped open={isInnerOpen} label="Options" />
            </BottomSheet>
          </BottomSheetStack>
        );
      }
      render(<App />);
      fireEvent.click(screen.getByRole('button', {name: 'Delete'}));
      expect(document.querySelectorAll('dialog[open]')).toHaveLength(2);
      expect(screen.getByRole('alertdialog')).toHaveAccessibleName('Delete?');
      // A sheet rendered in the level's own content (not in the alert) is
      // still a level above its parent.
      fireEvent.click(screen.getByRole('button', {name: 'More options'}));
      expect(levelSummary()).toEqual(['Top:covered:1', 'Options:top:0']);
    });
  });

  describe('R9 known bugs', () => {
    it('P5: a component that renders no sheet opens no dialog and leaves no stuck backdrop', () => {
      const spy = vi.fn();
      function Gated(_props: {
        isOpen: boolean;
        onOpenChange: (open: boolean) => void;
      }) {
        return null;
      }
      render(
        <BottomSheetStack>
          <Gated isOpen onOpenChange={spy} />
        </BottomSheetStack>,
      );
      expect(getDialog()).not.toHaveAttribute('open');
      expect(getDialog()).not.toHaveAttribute('aria-modal');
      expect(HTMLDialogElement.prototype.showModal).not.toHaveBeenCalled();
      expect(getLevels()).toHaveLength(0);
      pressEscape();
      clickScrim();
      expect(spy).not.toHaveBeenCalled();
    });

    it('P6: a component that renders two sheets is two levels, each dismissible in turn', () => {
      const aSpy = vi.fn();
      const bSpy = vi.fn();
      function Two(props: {
        isOpen: boolean;
        onOpenChange: (open: boolean) => void;
      }) {
        const [b, setB] = useState(true);
        return (
          <>
            <BottomSheet
              isOpen={props.isOpen}
              onOpenChange={props.onOpenChange}
              label="TwoA"
              data-testid="TwoA">
              a
            </BottomSheet>
            <BottomSheet
              isOpen={b}
              onOpenChange={value => {
                bSpy(value);
                setB(value);
              }}
              label="TwoB"
              data-testid="TwoB">
              b
            </BottomSheet>
          </>
        );
      }
      function App() {
        const [open, setOpen] = useState(true);
        return (
          <BottomSheetStack>
            <Two
              isOpen={open}
              onOpenChange={value => {
                aSpy(value);
                setOpen(value);
              }}
            />
          </BottomSheetStack>
        );
      }
      render(<App />);
      expect(levelSummary()).toEqual(['TwoA:covered:1', 'TwoB:top:0']);
      expect(getDialog()).toHaveAccessibleName('TwoB');
      expect(positionerTransform('TwoA')).toBe(RECEDE_1);
      pressEscape();
      expect(bSpy).toHaveBeenCalledWith(false);
      expect(aSpy).not.toHaveBeenCalled();
      finishExit('TwoB');
      expect(levelSummary()).toEqual(['TwoA:top:0', 'TwoB:closed:0']);
      pressEscape();
      expect(aSpy).toHaveBeenCalledWith(false);
      finishExit('TwoA');
      expect(getDialog()).not.toHaveAttribute('open');
    });

    it('P11: a sheet inside a switcher step is a level above the switcher, and the switcher stays dismissible after it closes', () => {
      const switcherSpy = vi.fn();
      const nestedSpy = vi.fn();
      function App() {
        const [step, setStep] = useState<string | null>('a');
        const [nested, setNested] = useState(false);
        return (
          <BottomSheetStack>
            <BottomSheetSwitcher
              activeSheet={step}
              onActiveSheetChange={value => {
                switcherSpy(value);
                setStep(value);
              }}>
              <BottomSheet sheetId="a" label="StepA" data-testid="stepA">
                <button type="button" onClick={() => setNested(true)}>
                  open nested
                </button>
                <BottomSheet
                  isOpen={nested}
                  onOpenChange={value => {
                    nestedSpy(value);
                    setNested(value);
                  }}
                  label="NestedInStep"
                  data-testid="nestedInStep">
                  n
                </BottomSheet>
              </BottomSheet>
            </BottomSheetSwitcher>
          </BottomSheetStack>
        );
      }
      render(<App />);
      expect(levelSummary()).toEqual(['stepA:top:0', 'nestedInStep:closed:0']);
      expect(getDialog()).toHaveAccessibleName('StepA');
      fireEvent.click(screen.getByRole('button', {name: 'open nested'}));
      expect(document.querySelectorAll('dialog')).toHaveLength(1);
      expect(levelSummary()).toEqual(['stepA:covered:1', 'nestedInStep:top:0']);
      expect(getDialog()).toHaveAccessibleName('NestedInStep');
      expect(getPositioner('stepA')).toHaveAttribute('inert');
      expect(positionerTransform('stepA')).toBe(RECEDE_1);
      pressEscape();
      expect(nestedSpy).toHaveBeenCalledWith(false);
      expect(switcherSpy).not.toHaveBeenCalled();
      finishExit('nestedInStep');
      expect(levelSummary()).toEqual(['stepA:top:0', 'nestedInStep:closed:0']);
      expect(getDialog()).toHaveAccessibleName('StepA');
      expect(getPositioner('stepA')).not.toHaveAttribute('inert');
      pressEscape();
      expect(switcherSpy).toHaveBeenCalledWith(null);
      expect(nestedSpy).toHaveBeenCalledTimes(1);
    });

    it('P13: removing an open level from the tree closes the dialog when nothing else is presented', () => {
      function App() {
        const [show, setShow] = useState(true);
        return (
          <>
            <button type="button" onClick={() => setShow(false)}>
              remove
            </button>
            <BottomSheetStack>
              {show ? <Wrapped open label="Cond" /> : null}
            </BottomSheetStack>
          </>
        );
      }
      render(<App />);
      expect(getDialog()).toHaveAttribute('open');
      fireEvent.click(screen.getByRole('button', {name: 'remove'}));
      expect(getDialog()).not.toHaveAttribute('open');
      expect(getLevels()).toHaveLength(0);
    });

    it('P15: a keyless conditional sibling appearing keeps the other level’s identity and state', () => {
      function App() {
        const [showA, setShowA] = useState(false);
        return (
          <>
            <button type="button" onClick={() => setShowA(value => !value)}>
              toggleA
            </button>
            <BottomSheetStack>
              {showA ? <Wrapped open label="A" /> : null}
              <BottomSheet
                isOpen
                onOpenChange={() => {}}
                label="B"
                data-testid="B">
                <input aria-label="bInput" defaultValue="" />
              </BottomSheet>
            </BottomSheetStack>
          </>
        );
      }
      render(<App />);
      const input = screen.getByLabelText('bInput');
      fireEvent.change(input, {target: {value: 'typed'}});
      fireEvent.click(screen.getByRole('button', {name: 'toggleA'}));
      expect(screen.getByLabelText('bInput')).toBe(input);
      expect(input).toHaveValue('typed');
      expect(levelSummary()).toEqual(['A:covered:1', 'B:top:0']);
    });
  });

  describe('R10 levels', () => {
    it('keeps only the top level interactive', () => {
      render(<TwoLevels initialList initialDetail />);
      expect(getLevel(0)).toHaveAttribute('inert');
      expect(getLevel(0)).toHaveAttribute('aria-hidden', 'true');
      expect(getLevel(1)).not.toHaveAttribute('inert');
      expect(getLevel(1)).not.toHaveAttribute('aria-hidden');
      // The covered panel is retained: present, not hidden, pointer-inert.
      expect(getPositioner('list')).not.toHaveAttribute('hidden');
      expect(getPanel('detail')).toHaveFocus();
    });

    it('preserves a covered level and its state', () => {
      render(<TwoLevels initialList />);
      const input = screen.getByLabelText('Search');
      fireEvent.change(input, {target: {value: 'shoes'}});
      fireEvent.click(screen.getByRole('button', {name: 'Open detail'}));
      expect(levelState(0)).toBe('covered');
      expect(screen.getByLabelText('Search')).toBe(input);
      expect(input).toHaveValue('shoes');

      fireEvent.click(screen.getByRole('button', {name: 'Done'}));
      expect(levelState(0)).toBe('top');
      expect(levelState(1)).toBe('exiting');
      expect(screen.getByLabelText('Search')).toBe(input);
      expect(input).toHaveValue('shoes');
      finishExit('detail');
      expect(levelState(1)).toBe('closed');
      expect(getPositioner('detail')).toHaveAttribute('hidden');
      expect(getDialog()).toHaveAttribute('open');
    });

    it('treats a lone level like a normal sheet', () => {
      const onListChange = vi.fn();
      render(<TwoLevels initialList onListChange={onListChange} />);
      const dialog = screen.getByRole('dialog');
      expect(dialog).toBe(getDialog());
      expect(dialog).toHaveAttribute('aria-modal', 'true');
      expect(dialog).toHaveAccessibleName('List');
      expect(getLevel(0)).not.toHaveAttribute('inert');
      expect(levelState(1)).toBe('closed');
      expect(getPanel('list')).toHaveFocus();
      expect(positionerTransform('list')).toBe(FLAT);

      pressEscape();
      expect(onListChange).toHaveBeenCalledWith(false);
      finishExit('list');
      expect(HTMLDialogElement.prototype.close).toHaveBeenCalled();
      expect(dialog).not.toHaveAttribute('open');
    });

    it('stacks mapped children of variable depth', () => {
      function Browser() {
        const [path, setPath] = useState(['Home', 'Photos', 'Trips']);
        const [openDepth, setOpenDepth] = useState(3);
        return (
          <>
            <button type="button" onClick={() => setPath([...path, 'Alps'])}>
              Add
            </button>
            <button type="button" onClick={() => setOpenDepth(4)}>
              Open 4
            </button>
            <BottomSheetStack>
              {path.map((folder, index) => (
                <BottomSheet
                  key={folder}
                  isOpen={index < openDepth}
                  onOpenChange={open => {
                    if (!open) {
                      setOpenDepth(index);
                    }
                  }}
                  label={folder}
                  data-testid={`folder-${folder}`}>
                  {folder}
                </BottomSheet>
              ))}
            </BottomSheetStack>
          </>
        );
      }
      render(<Browser />);
      expect(levelState(0)).toBe('covered');
      expect(levelState(1)).toBe('covered');
      expect(levelState(2)).toBe('top');
      expect(getDialog()).toHaveAccessibleName('Trips');

      pressEscape();
      expect(levelState(2)).toBe('exiting');
      expect(levelState(1)).toBe('top');
      expect(getDialog()).toHaveAccessibleName('Photos');

      fireEvent.click(screen.getByRole('button', {name: 'Add'}));
      fireEvent.click(screen.getByRole('button', {name: 'Open 4'}));
      expect(levelState(2)).toBe('covered');
      expect(levelState(3)).toBe('top');
      expect(getDialog()).toHaveAccessibleName('Alps');
      expect(positionerTransform('folder-Home')).toBe(RECEDE_2);
      expect(positionerTransform('folder-Photos')).toBe(RECEDE_2);
      expect(positionerTransform('folder-Trips')).toBe(RECEDE_1);
    });
  });

  describe('R10 dismissal', () => {
    it('Escape closes only the top level through its own callback', () => {
      const onListChange = vi.fn();
      const onDetailChange = vi.fn();
      render(
        <TwoLevels
          initialList
          initialDetail
          onListChange={onListChange}
          onDetailChange={onDetailChange}
        />,
      );
      pressEscape();
      expect(onDetailChange).toHaveBeenCalledTimes(1);
      expect(onDetailChange).toHaveBeenCalledWith(false);
      expect(onListChange).not.toHaveBeenCalled();
      expect(levelState(0)).toBe('top');
      expect(levelState(1)).toBe('exiting');
      expect(getDialog()).toHaveAttribute('open');
    });

    it('a scrim tap closes only the top level through its own callback', () => {
      const onListChange = vi.fn();
      const onDetailChange = vi.fn();
      render(
        <TwoLevels
          initialList
          initialDetail
          onListChange={onListChange}
          onDetailChange={onDetailChange}
        />,
      );
      clickScrim();
      expect(onDetailChange).toHaveBeenCalledWith(false);
      expect(onListChange).not.toHaveBeenCalled();
    });

    it('a swipe closes only the top level through its own callback', () => {
      const onListChange = vi.fn();
      const onDetailChange = vi.fn();
      render(
        <TwoLevels
          initialList
          initialDetail
          onListChange={onListChange}
          onDetailChange={onDetailChange}
        />,
      );
      swipeDown('detail');
      expect(onDetailChange).toHaveBeenCalledWith(false);
      expect(onListChange).not.toHaveBeenCalled();
    });

    it('a platform close request pops one level', () => {
      const onListChange = vi.fn();
      const onDetailChange = vi.fn();
      render(
        <TwoLevels
          initialList
          initialDetail
          onListChange={onListChange}
          onDetailChange={onDetailChange}
        />,
      );
      const cancel = new Event('cancel', {bubbles: false, cancelable: true});
      fireEvent(getDialog(), cancel);
      expect(cancel.defaultPrevented).toBe(true);
      expect(onDetailChange).toHaveBeenCalledWith(false);
      expect(onListChange).not.toHaveBeenCalled();
    });

    it('respects a required top level and ignores the base purpose', () => {
      const onListChange = vi.fn();
      const onDetailChange = vi.fn();
      render(
        <TwoLevels
          initialList
          initialDetail
          detailPurpose="required"
          onListChange={onListChange}
          onDetailChange={onDetailChange}
        />,
      );
      expect(getDialog()).toHaveAttribute('role', 'alertdialog');
      pressEscape();
      clickScrim();
      swipeDown('detail');
      expect(onDetailChange).not.toHaveBeenCalled();
      expect(onListChange).not.toHaveBeenCalled();
    });

    it('respects a form top level: Escape closes, scrim and swipe do not', () => {
      const onDetailChange = vi.fn();
      render(
        <TwoLevels
          initialList
          initialDetail
          listPurpose="required"
          detailPurpose="form"
          onDetailChange={onDetailChange}
        />,
      );
      expect(getDialog()).not.toHaveAttribute('role', 'alertdialog');
      clickScrim();
      swipeDown('detail');
      expect(onDetailChange).not.toHaveBeenCalled();
      pressEscape();
      expect(onDetailChange).toHaveBeenCalledWith(false);
    });

    it('closes every level together in one update and then the dialog once', () => {
      render(<TwoLevels initialList initialDetail />);
      fireEvent.click(screen.getByRole('button', {name: 'Close all'}));
      expect(levelState(0)).toBe('exiting');
      expect(levelState(1)).toBe('exiting');
      expect(getDialog()).toHaveAttribute('open');
      // Nothing is covered any more: both slide out at full size.
      expect(positionerTransform('list')).toBe(FLAT);
      finishExit('detail');
      expect(getDialog()).toHaveAttribute('open');
      finishExit('list');
      expect(getDialog()).not.toHaveAttribute('open');
      expect(HTMLDialogElement.prototype.close).toHaveBeenCalledTimes(1);
    });
  });

  describe('R10 switcher levels', () => {
    function Filters({
      onStepChange,
      onHelpChange,
    }: {
      onStepChange?: (step: string | null) => void;
      onHelpChange?: (isOpen: boolean) => void;
    }) {
      const [step, setStep] = useState<string | null>('categories');
      const [isHelpOpen, setIsHelpOpen] = useState(false);
      return (
        <BottomSheetStack>
          <BottomSheetSwitcher
            activeSheet={step}
            onActiveSheetChange={next => {
              onStepChange?.(next);
              setStep(next);
            }}>
            <BottomSheet
              sheetId="categories"
              label="Categories"
              data-testid="categories">
              <button type="button" onClick={() => setStep('options')}>
                Next
              </button>
              <button type="button" onClick={() => setIsHelpOpen(true)}>
                Help
              </button>
            </BottomSheet>
            <BottomSheet
              sheetId="options"
              label="Options"
              data-testid="options">
              <button type="button" onClick={() => setIsHelpOpen(true)}>
                Help
              </button>
            </BottomSheet>
          </BottomSheetSwitcher>
          <BottomSheet
            isOpen={isHelpOpen}
            onOpenChange={next => {
              onHelpChange?.(next);
              setIsHelpOpen(next);
            }}
            label="Help"
            data-testid="help">
            Help
          </BottomSheet>
        </BottomSheetStack>
      );
    }

    it('uses a switcher as the base and an overlay on top', () => {
      const onStepChange = vi.fn();
      const onHelpChange = vi.fn();
      render(
        <Filters onStepChange={onStepChange} onHelpChange={onHelpChange} />,
      );
      expect(getLevel(0)).toHaveAttribute(
        'data-bottom-sheet-stack-level-kind',
        'switcher',
      );
      expect(levelState(0)).toBe('top');
      expect(getDialog()).toHaveAccessibleName('Categories');
      // The switcher renders no dialog of its own.
      expect(document.querySelectorAll('dialog')).toHaveLength(1);
      expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalledTimes(1);

      // Switching base steps while uncovered happens in place.
      fireEvent.click(screen.getByRole('button', {name: 'Next'}));
      expect(levelState(0)).toBe('top');
      expect(getDialog()).toHaveAccessibleName('Options');
      expect(getPositioner('options')).not.toHaveAttribute('aria-hidden');

      // The overlay sits over the second step and covers the whole level.
      fireEvent.click(screen.getByRole('button', {name: 'Help'}));
      expect(levelState(0)).toBe('covered');
      expect(levelState(1)).toBe('top');
      expect(getLevel(0)).toHaveAttribute('inert');
      expect(getPositioner('options')).toHaveAttribute('aria-hidden', 'true');
      expect(positionerTransform('options')).toBe(RECEDE_1);
      expect(getDialog()).toHaveAccessibleName('Help');

      // Escape pops the overlay through its own callback only.
      pressEscape();
      expect(onHelpChange).toHaveBeenCalledWith(false);
      expect(onStepChange).not.toHaveBeenCalled();
      expect(levelState(0)).toBe('top');
      expect(getPositioner('options')).not.toHaveAttribute('aria-hidden');
      expect(getDialog()).toHaveAccessibleName('Options');

      // The overlay works over the first step too, and then Escape closes the
      // switcher level through onActiveSheetChange(null).
      finishExit('help');
      fireEvent.click(screen.getByRole('button', {name: 'Help'}));
      expect(levelState(1)).toBe('top');
      pressEscape();
      pressEscape();
      expect(onStepChange).toHaveBeenCalledWith(null);
    });

    it('uses a switcher as the top level: edit → saved replaces, back returns to the base', () => {
      const onEditChange = vi.fn();
      const onContactsChange = vi.fn();
      function Contacts() {
        const [isContactsOpen, setIsContactsOpen] = useState(true);
        const [editStep, setEditStep] = useState<string | null>(null);
        return (
          <BottomSheetStack>
            <BottomSheet
              isOpen={isContactsOpen}
              onOpenChange={next => {
                onContactsChange(next);
                setIsContactsOpen(next);
              }}
              label="Contacts"
              data-testid="contacts">
              <button type="button" onClick={() => setEditStep('edit')}>
                Edit
              </button>
            </BottomSheet>
            <BottomSheetSwitcher
              activeSheet={editStep}
              onActiveSheetChange={next => {
                onEditChange(next);
                setEditStep(next);
              }}>
              <BottomSheet
                sheetId="edit"
                label="Edit contact"
                data-testid="edit">
                <button type="button" onClick={() => setEditStep('saved')}>
                  Save
                </button>
              </BottomSheet>
              <BottomSheet sheetId="saved" label="Saved" data-testid="saved">
                <button type="button" onClick={() => setEditStep(null)}>
                  Back
                </button>
              </BottomSheet>
            </BottomSheetSwitcher>
          </BottomSheetStack>
        );
      }
      render(<Contacts />);
      expect(levelState(0)).toBe('top');
      expect(levelState(1)).toBe('closed');

      const editButton = screen.getByRole('button', {name: 'Edit'});
      editButton.focus();
      fireEvent.click(editButton);
      expect(levelState(0)).toBe('covered');
      expect(levelState(1)).toBe('top');
      expect(getDialog()).toHaveAccessibleName('Edit contact');
      expect(getPanel('edit')).toHaveFocus();

      fireEvent.click(screen.getByRole('button', {name: 'Save'}));
      expect(levelState(1)).toBe('top');
      expect(getDialog()).toHaveAccessibleName('Saved');
      expect(getPositioner('saved')).not.toHaveAttribute('aria-hidden');
      expect(getLevel(0)).toHaveAttribute('inert');

      fireEvent.click(screen.getByRole('button', {name: 'Back'}));
      expect(levelState(1)).toBe('exiting');
      expect(levelState(0)).toBe('top');
      expect(getDialog()).toHaveAccessibleName('Contacts');
      expect(onContactsChange).not.toHaveBeenCalled();
      // Focus returns to the control that opened the closed level.
      expect(editButton).toHaveFocus();
    });
  });

  describe('R10 focus', () => {
    it('returns focus to the opener of the closed level when it remains', () => {
      render(<TwoLevels initialList />);
      const opener = screen.getByRole('button', {name: 'Open detail'});
      opener.focus();
      fireEvent.click(opener);
      expect(getPanel('detail')).toHaveFocus();
      fireEvent.click(screen.getByRole('button', {name: 'Done'}));
      expect(opener).toHaveFocus();
    });

    it('focuses into the new top level when the opener is gone', () => {
      function Replacing() {
        const [isListOpen, setIsListOpen] = useState(true);
        const [isDetailOpen, setIsDetailOpen] = useState(false);
        return (
          <BottomSheetStack>
            <BottomSheet
              isOpen={isListOpen}
              onOpenChange={setIsListOpen}
              label="List"
              data-testid="list">
              {isDetailOpen ? (
                <span>Loading</span>
              ) : (
                <button type="button" onClick={() => setIsDetailOpen(true)}>
                  Open detail
                </button>
              )}
            </BottomSheet>
            <BottomSheet
              isOpen={isDetailOpen}
              onOpenChange={setIsDetailOpen}
              label="Detail"
              data-testid="detail">
              <button type="button" onClick={() => setIsDetailOpen(false)}>
                Done
              </button>
            </BottomSheet>
          </BottomSheetStack>
        );
      }
      render(<Replacing />);
      const opener = screen.getByRole('button', {name: 'Open detail'});
      opener.focus();
      fireEvent.click(opener);
      expect(getPanel('detail')).toHaveFocus();
      fireEvent.click(screen.getByRole('button', {name: 'Done'}));
      expect(getPanel('list')).toHaveFocus();
    });

    it('applies a level’s own finalFocusRef when its close closes the stack', () => {
      const target = createRef<HTMLButtonElement>();
      function Harness() {
        return (
          <>
            <button type="button" ref={target}>
              Target
            </button>
            <TwoLevels initialList listFinalFocusRef={target} />
          </>
        );
      }
      render(<Harness />);
      pressEscape();
      finishExit('list');
      expect(target.current).toHaveFocus();
    });

    it('lets the bottom level’s finalFocusRef win when every level closes together', () => {
      const listTarget = createRef<HTMLButtonElement>();
      const detailTarget = createRef<HTMLButtonElement>();
      function Harness() {
        return (
          <>
            <button type="button" ref={listTarget}>
              List target
            </button>
            <button type="button" ref={detailTarget}>
              Detail target
            </button>
            <TwoLevels
              initialList
              initialDetail
              listFinalFocusRef={listTarget}
              detailFinalFocusRef={detailTarget}
            />
          </>
        );
      }
      render(<Harness />);
      fireEvent.click(screen.getByRole('button', {name: 'Close all'}));
      // Exit order does not matter: the bottom level's ref still wins.
      finishExit('list');
      finishExit('detail');
      expect(listTarget.current).toHaveFocus();
    });

    it('returns focus to the element that opened the first level without a ref', () => {
      render(<TwoLevels />);
      const opener = screen.getByRole('button', {name: 'Deep link'});
      opener.focus();
      fireEvent.click(opener);
      expect(getPanel('detail')).toHaveFocus();
      fireEvent.click(screen.getByRole('button', {name: 'Close all'}));
      finishExit('detail');
      finishExit('list');
      expect(opener).toHaveFocus();
    });

    it('ignores a switcher level for final focus and falls back to the opener', () => {
      function Harness() {
        const [step, setStep] = useState<string | null>(null);
        const openerRef = useRef<HTMLButtonElement>(null);
        return (
          <>
            <button
              type="button"
              ref={openerRef}
              onClick={() => setStep('edit')}>
              Start
            </button>
            <BottomSheetStack>
              <BottomSheetSwitcher
                activeSheet={step}
                onActiveSheetChange={setStep}>
                <BottomSheet sheetId="edit" label="Edit" data-testid="edit">
                  Edit
                </BottomSheet>
              </BottomSheetSwitcher>
            </BottomSheetStack>
          </>
        );
      }
      render(<Harness />);
      const opener = screen.getByRole('button', {name: 'Start'});
      opener.focus();
      fireEvent.click(opener);
      expect(getPanel('edit')).toHaveFocus();
      pressEscape();
      finishExit('edit');
      expect(getDialog()).not.toHaveAttribute('open');
      expect(opener).toHaveFocus();
    });

    it('asks the browser for no focus ring after a pointer close and leaves it to the browser after a keyboard close', () => {
      function openThenClose(closeWith: 'pointer' | 'keyboard') {
        render(<TwoLevels />);
        const opener = screen.getByRole('button', {name: 'Open list'});
        opener.focus();
        fireEvent.click(opener);
        const focus = vi.spyOn(opener, 'focus');
        if (closeWith === 'pointer') {
          fireEvent.pointerDown(getDialog());
          clickScrim();
        } else {
          pressEscape();
        }
        finishExit('list');
        return {opener, focus};
      }
      const pointer = openThenClose('pointer');
      expect(pointer.opener).toHaveFocus();
      expect(pointer.focus.mock.calls).toEqual([[{focusVisible: false}]]);
      document.body.innerHTML = '';
      const keyboard = openThenClose('keyboard');
      expect(keyboard.opener).toHaveFocus();
      expect(keyboard.focus.mock.calls).toEqual([[]]);
    });
  });

  describe('R10 host', () => {
    it('locks scroll and traps focus once, on the stack', () => {
      render(<TwoLevels initialList initialDetail />);
      expect(document.querySelectorAll('dialog')).toHaveLength(1);
      expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalledTimes(1);
      expect(getDialog()).toHaveAttribute('aria-modal', 'true');
    });

    it('opens non-modally without a scrim', () => {
      render(<TwoLevels initialList initialDetail hasScrim={false} />);
      expect(HTMLDialogElement.prototype.show).toHaveBeenCalledTimes(1);
      expect(HTMLDialogElement.prototype.showModal).not.toHaveBeenCalled();
      expect(getDialog()).not.toHaveAttribute('aria-modal');
    });

    it('warns about hasScrim on a level and ignores it', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      render(
        <BottomSheetStack>
          <BottomSheet
            isOpen
            onOpenChange={() => {}}
            label="List"
            hasScrim={false}
            data-testid="list">
            List
          </BottomSheet>
          <BottomSheetSwitcher
            activeSheet={null}
            onActiveSheetChange={() => {}}
            hasScrim={false}>
            <BottomSheet sheetId="a" label="A">
              A
            </BottomSheet>
          </BottomSheetSwitcher>
        </BottomSheetStack>,
      );
      const scrimWarnings = warn.mock.calls.filter(call =>
        String(call[0]).includes(
          '`hasScrim` on a BottomSheet or BottomSheetSwitcher inside a BottomSheetStack is ignored',
        ),
      );
      expect(scrimWarnings).toHaveLength(2);
      // The host is still modal: the levels' hasScrim={false} did nothing.
      expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalledTimes(1);
      expect(getDialog()).toHaveAttribute('aria-modal', 'true');
    });

    it('every native close() runs while the shell is still displayed, and showModal/close pair once per cycle', () => {
      render(<TwoLevels initialList initialDetail />);
      fireEvent.click(screen.getByRole('button', {name: 'Close all'}));
      finishExit('detail');
      finishExit('list');
      expect(getDialog()).not.toHaveAttribute('open');
      const stackCalls = nativeLog.filter(entry => entry.stack);
      expect(stackCalls.map(entry => entry.call)).toEqual([
        'showModal',
        'close',
      ]);
      expect(stackCalls.every(entry => entry.displayed)).toBe(true);
      // After the close the shell is no longer displayed.
      expect(isDisplayed(getDialog())).toBe(false);

      // Second cycle: one more pair.
      fireEvent.click(screen.getByRole('button', {name: 'Open list'}));
      pressEscape();
      finishExit('list');
      const again = nativeLog.filter(entry => entry.stack);
      expect(again.map(entry => entry.call)).toEqual([
        'showModal',
        'close',
        'showModal',
        'close',
      ]);
      expect(again.every(entry => entry.displayed)).toBe(true);
    });

    it('returns focus once, to the intended target, and the focus trap’s cleanup does not move it again', () => {
      render(<TwoLevels />);
      const opener = screen.getByRole('button', {name: 'Open list'});
      opener.focus();
      fireEvent.click(opener);
      const focusCalls: Array<{
        target: string;
        args: unknown[];
        afterClose: boolean;
      }> = [];
      const originalFocus = HTMLElement.prototype.focus;
      const focusSpy = vi
        .spyOn(HTMLElement.prototype, 'focus')
        .mockImplementation(function (this: HTMLElement, ...args: unknown[]) {
          focusCalls.push({
            target: this.textContent ?? this.tagName,
            args,
            afterClose: nativeLog.some(entry => entry.call === 'close'),
          });
          return originalFocus.apply(this, args as []);
        });
      fireEvent.pointerDown(getDialog());
      clickScrim();
      finishExit('list');
      focusSpy.mockRestore();
      expect(opener).toHaveFocus();
      const returns = focusCalls.filter(call => call.afterClose);
      expect(returns).toEqual([
        {target: 'Open list', args: [{focusVisible: false}], afterClose: true},
      ]);
    });

    it('a nested level’s gestures never arm its covered parent: parent handlers ignore events whose native target is outside the parent panel', () => {
      const parentSpy = vi.fn();
      const childSpy = vi.fn();
      render(
        <BottomSheetStack>
          <BottomSheet
            isOpen
            onOpenChange={parentSpy}
            label="Parent"
            data-testid="Parent">
            <BottomSheet
              isOpen
              onOpenChange={childSpy}
              label="Child"
              data-testid="Child">
              Child
            </BottomSheet>
          </BottomSheet>
        </BottomSheetStack>,
      );
      expect(levelSummary()).toEqual(['Parent:covered:1', 'Child:top:0']);
      const parentPanel = getPanel('Parent');
      const childPanel = getPanel('Child');
      // The child's panel is portaled out of the parent's DOM, but React
      // still bubbles its events to the parent's handlers.
      expect(parentPanel.contains(childPanel)).toBe(false);
      const parentBody = parentPanel.querySelector<HTMLElement>(
        '[aria-label="Parent"]',
      ) as HTMLElement;
      const childBody = childPanel.querySelector<HTMLElement>(
        '[aria-label="Child"]',
      ) as HTMLElement;
      // jsdom has no pointer capture; the gesture hook calls it when it arms.
      const parentCapture = vi.fn();
      const childCapture = vi.fn();
      (
        parentBody as HTMLElement & {setPointerCapture: unknown}
      ).setPointerCapture = parentCapture;
      (
        childBody as HTMLElement & {setPointerCapture: unknown}
      ).setPointerCapture = childCapture;
      // Body drag on the child: arms the child's body only.
      fireEvent.pointerDown(childBody, {
        pointerId: 7,
        clientY: 0,
        button: 0,
        isPrimary: true,
      });
      fireEvent.pointerMove(childBody, {pointerId: 7, clientY: 40});
      fireEvent.pointerMove(childBody, {pointerId: 7, clientY: 160});
      fireEvent.pointerUp(childBody, {pointerId: 7, clientY: 160});
      expect(parentCapture).not.toHaveBeenCalled();
      expect(childCapture).toHaveBeenCalled();
      expect(childSpy).toHaveBeenCalledWith(false);
      expect(parentSpy).not.toHaveBeenCalled();
      // Handle swipe on the child closes the child only.
      swipeDown('Child');
      expect(parentSpy).not.toHaveBeenCalled();
    });

    it('an app onClick around the stack still sees clicks inside a nested level', () => {
      const onClick = vi.fn();
      render(
        <div onClick={onClick}>
          <BottomSheetStack>
            <Wrapped open label="Parent">
              <Wrapped open label="Child">
                <button type="button">In child</button>
              </Wrapped>
            </Wrapped>
          </BottomSheetStack>
        </div>,
      );
      fireEvent.click(screen.getByRole('button', {name: 'In child'}));
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('forwards the ref, onCancel, and dialog attributes to the shared dialog', () => {
      const ref = createRef<HTMLDialogElement>();
      const onCancel = vi.fn();
      render(
        <BottomSheetStack ref={ref} onCancel={onCancel} data-testid="stack">
          <Wrapped open label="A" />
        </BottomSheetStack>,
      );
      expect(ref.current).toBe(getDialog());
      expect(getDialog()).toHaveAttribute('data-testid', 'stack');
      fireEvent(getDialog(), new Event('cancel', {cancelable: true}));
      expect(onCancel).toHaveBeenCalledTimes(1);
    });
  });
});
