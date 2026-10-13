// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file ResizeHandle.a11y.states.ts
 * @input ResizeHandle's representative splitter states and the facts WINDOW_SPLITTER_PATTERN reads
 * @output RESIZE_HANDLE_BINDING_STATES and the explicit ownership exclusions for this binding
 * @position Binding inventory shared by the jsdom test, the Chromium spec, and the story (component:Resizable AR1)
 */

import type {WindowSplitterStateFacts} from '@astryxdesign/a11y-spec';

export interface ResizeHandleBindingState {
  readonly id: string;
  readonly summary: string;
  readonly storyId: string;
  /** Which composition renders the handle; SideNav's binding follows separately. */
  readonly component: 'ResizeHandle';
  /** The separator's accessible name. */
  readonly label: string;
  readonly facts: WindowSplitterStateFacts;
  /** Bare-handle configuration. */
  readonly direction?: 'horizontal' | 'vertical';
  readonly isReversed?: boolean;
  readonly rtl?: boolean;
  readonly maxSize?: number | null;
  readonly disabled?: boolean;
}

function facts(
  overrides: Partial<WindowSplitterStateFacts> = {},
): WindowSplitterStateFacts {
  return {
    valueNow: 200,
    valueMin: 100,
    valueMax: 400,
    orientation: 'vertical',
    increaseKey: 'ArrowRight',
    step: 10,
    operable: true,
    collapsible: false,
    ...overrides,
  };
}

const story = (id: string) => `a11y-windowsplitter--${id}`;

export const RESIZE_HANDLE_BINDING_STATES = [
  {
    id: 'bare-horizontal',
    summary: 'a bare ResizeHandle on the end side of a 200px pane (100–400)',
    storyId: story('bare-horizontal'),
    component: 'ResizeHandle',
    label: 'Resize details pane',
    facts: facts(),
  },
  {
    id: 'bare-vertical',
    summary: 'a bare ResizeHandle below a 200px pane: ArrowDown grows it',
    storyId: story('bare-vertical'),
    component: 'ResizeHandle',
    label: 'Resize log pane',
    facts: facts({orientation: 'horizontal', increaseKey: 'ArrowDown'}),
    direction: 'vertical',
  },
  {
    id: 'bare-reversed',
    summary:
      'a bare ResizeHandle on the start side of its pane: ArrowLeft grows it',
    storyId: story('bare-reversed'),
    component: 'ResizeHandle',
    label: 'Resize details pane',
    facts: facts({increaseKey: 'ArrowLeft'}),
    isReversed: true,
  },
  {
    id: 'bare-rtl',
    summary:
      'a bare ResizeHandle on a right-to-left page: the inline arrows follow the reading direction',
    storyId: story('bare-rtl'),
    component: 'ResizeHandle',
    label: 'Resize details pane',
    facts: facts({increaseKey: 'ArrowLeft'}),
    rtl: true,
  },
  {
    id: 'bare-collapsible',
    summary:
      'a bare ResizeHandle on a collapsible pane: Enter collapses and restores',
    storyId: story('bare-collapsible'),
    component: 'ResizeHandle',
    label: 'Resize details pane',
    facts: facts({collapsible: true}),
  },
  {
    id: 'bare-unbounded',
    summary: 'a bare ResizeHandle whose region sets no maximum',
    storyId: story('bare-unbounded'),
    component: 'ResizeHandle',
    label: 'Resize details pane',
    facts: facts({valueMax: null}),
    maxSize: null,
  },
  {
    id: 'bare-disabled',
    summary: 'a disabled ResizeHandle: out of the Tab order and unmoving',
    storyId: story('bare-disabled'),
    component: 'ResizeHandle',
    label: 'Resize details pane',
    facts: facts({operable: false}),
    disabled: true,
  },
] as const satisfies ReadonlyArray<ResizeHandleBindingState>;

export const RESIZE_HANDLE_EXCLUSIONS = [
  {
    id: 'sidenav-binding',
    owner:
      'SideNav.test.tsx until SideNav binds this contract in its own change',
    reason:
      "SideNav renders ResizeHandle in overlay position with its own collapse coupling and translated label. Its separator did not resolve within the real-browser run's budget in the first binding attempt, so SideNav is bound separately once that is understood; its known gaps (no aria-controls; Enter reopening at the minimum) stay recorded in component:Resizable AR1 and are fixed by their own patches.",
  },
  {
    id: 'pointer-drag-model',
    owner:
      'ResizeHandle.test.tsx pointer suites and the Chromium pointer evidence',
    reason:
      "Dragging, Escape cancelling an in-flight drag, double-click collapse, and the grab-zone geometry are pointer behavior outside the keyboard-and-semantics pattern; the component's own suites prove them.",
  },
  {
    id: 'pane-cycling',
    owner: 'component:Resizable AR1 (not adopted) and the composing page',
    reason:
      "F6 pane cycling is an optional part of the APG pattern that the record does not adopt; which panes exist and how focus cycles among them is the composing page's decision.",
  },
] as const;
