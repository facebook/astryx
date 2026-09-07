// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Button.a11y.states.ts
 * @input Uses ButtonStateFacts from @astryxdesign/a11y-spec
 * @output BUTTON_BINDING_STATES — every state of every component that adopts the
 *   button pattern that can change what the pattern promises — and
 *   BUTTON_PATTERN_EXCLUSIONS, the parts deliberately left to another pattern.
 * @position The binding inventory required before any assertion moves
 *   (`docs/specs/AST-021/spec.md` FR2, FR4). Shared by the jsdom and Chromium
 *   bindings so both cover the same states and cannot drift apart.
 *
 * A state earns a row when it can change what the button pattern promises: a
 * different name source, a different operability, a different exposure of
 * unavailability, a different attached description. States that change only
 * appearance — variant, size, elevation, width, end content, theme — cannot, so
 * they stay in each component's own suite where that component owns them.
 *
 * SYNC: Every row's `storyId` must exist in
 * - /apps/storybook/stories/ButtonA11y.stories.tsx
 */

import type {ButtonStateFacts} from '@astryxdesign/a11y-spec';

/** The five components the queue binds to this pattern. */
export type ButtonBinding =
  | 'Button'
  | 'IconButton'
  | 'ClickableCard'
  | 'SideNavCollapseButton'
  | 'ChatSendButton';

export interface ButtonBindingState {
  /** Stable id, unique across bindings. Named by known-failure records. */
  readonly id: string;
  /** Which component this state belongs to. */
  readonly binding: ButtonBinding;
  /** What this state is, for the report and the test name. */
  readonly summary: string;
  /**
   * What the state declares itself to be. These select which expectations apply
   * — declaring a state unavailable, busy, or described turns those
   * expectations on. They do not assert the negative when false.
   */
  readonly facts: ButtonStateFacts;
  /**
   * The label this state is expected to render where a person can read it, or
   * null when it renders none (an icon-only button).
   *
   * INVENTORY, not contract input. The shared 2.5.3 expectation reads the
   * rendered label itself and never consults this — otherwise a binding could
   * switch a criterion off by describing itself. This exists so the inventory
   * AST-021 FR2 asks for is checked against the page rather than trusted, and a
   * typo here is reported as a stale inventory, not as a standards failure.
   */
  readonly visibleLabel: string | null;
  /** The checked-in Storybook story the Chromium lane drives. */
  readonly storyId: string;
}

const OPERABLE: ButtonStateFacts = {
  operable: true,
  focusable: true,
  unavailable: false,
  busy: false,
  described: false,
};

function facts(overrides: Partial<ButtonStateFacts> = {}): ButtonStateFacts {
  return {...OPERABLE, ...overrides};
}

export const BUTTON_BINDING_STATES: ReadonlyArray<ButtonBindingState> = [
  // ---- Button -------------------------------------------------------------
  {
    id: 'button-text',
    binding: 'Button',
    summary: 'the default: a button named by the text a person can read',
    facts: facts(),
    visibleLabel: 'Save changes',
    storyId: 'a11y-button-pattern--button-text',
  },
  {
    id: 'button-icon-only',
    binding: 'Button',
    summary:
      'an icon-only button, where the label is the accessible name and nothing else',
    facts: facts(),
    visibleLabel: null,
    storyId: 'a11y-button-pattern--button-icon-only',
  },
  {
    id: 'button-composed-label',
    binding: 'Button',
    summary:
      'children rendered as the visible content with a separate label as the accessible name — the composed case where the two can drift apart',
    facts: facts(),
    visibleLabel: 'Save changes',
    storyId: 'a11y-button-pattern--button-composed-label',
  },
  {
    id: 'button-disabled',
    binding: 'Button',
    summary: 'a hard-disabled button: unavailable, and out of the tab sequence',
    facts: facts({operable: false, focusable: false, unavailable: true}),
    visibleLabel: 'Save changes',
    storyId: 'a11y-button-pattern--button-disabled',
  },
  {
    id: 'button-disabled-with-tooltip',
    binding: 'Button',
    summary:
      'a disabled button kept focusable by its tooltip, so the reason it is unavailable stays reachable',
    facts: facts({operable: false, unavailable: true, described: true}),
    visibleLabel: 'Save changes',
    storyId: 'a11y-button-pattern--button-disabled-with-tooltip',
  },
  {
    id: 'button-loading',
    binding: 'Button',
    summary: 'a button waiting on the action it started',
    facts: facts({operable: false, busy: true}),
    visibleLabel: null,
    storyId: 'a11y-button-pattern--button-loading',
  },

  // ---- IconButton ---------------------------------------------------------
  {
    id: 'icon-button',
    binding: 'IconButton',
    summary: 'an icon-only button named by its label alone',
    facts: facts(),
    visibleLabel: null,
    storyId: 'a11y-button-pattern--icon-button-default',
  },
  {
    id: 'icon-button-disabled',
    binding: 'IconButton',
    summary: 'a disabled icon button',
    facts: facts({operable: false, focusable: false, unavailable: true}),
    visibleLabel: null,
    storyId: 'a11y-button-pattern--icon-button-disabled',
  },
  {
    id: 'icon-button-loading',
    binding: 'IconButton',
    summary: 'an icon button waiting on the action it started',
    facts: facts({operable: false, busy: true}),
    visibleLabel: null,
    storyId: 'a11y-button-pattern--icon-button-loading',
  },

  // ---- ClickableCard ------------------------------------------------------
  {
    id: 'clickable-card',
    binding: 'ClickableCard',
    summary:
      "a card whose whole surface performs an action, through the hidden button that carries the card's role and name",
    facts: facts(),
    visibleLabel: null,
    storyId: 'a11y-button-pattern--clickable-card-default',
  },
  {
    id: 'clickable-card-disabled',
    binding: 'ClickableCard',
    summary: 'a disabled action card',
    facts: facts({operable: false, focusable: false, unavailable: true}),
    visibleLabel: null,
    storyId: 'a11y-button-pattern--clickable-card-disabled',
  },

  // ---- SideNavCollapseButton ----------------------------------------------
  {
    id: 'sidenav-collapse-icon',
    binding: 'SideNavCollapseButton',
    summary:
      'the default collapse control: icon-only, named by the direction it will move the sidebar',
    facts: facts(),
    visibleLabel: null,
    storyId: 'a11y-button-pattern--sidenav-collapse-icon',
  },
  {
    id: 'sidenav-collapse-labelled',
    binding: 'SideNavCollapseButton',
    summary: 'the collapse control given a visible label of its own',
    facts: facts(),
    visibleLabel: 'Collapse sidebar',
    storyId: 'a11y-button-pattern--sidenav-collapse-labelled',
  },

  // ---- ChatSendButton -----------------------------------------------------
  {
    id: 'chat-send',
    binding: 'ChatSendButton',
    summary: 'the composer send control, enabled and ready to send',
    facts: facts(),
    visibleLabel: null,
    storyId: 'a11y-button-pattern--chat-send',
  },
  {
    id: 'chat-send-disabled',
    binding: 'ChatSendButton',
    summary: 'the send control with nothing to send',
    facts: facts({operable: false, focusable: false, unavailable: true}),
    visibleLabel: null,
    storyId: 'a11y-button-pattern--chat-send-disabled',
  },
  {
    id: 'chat-send-stop',
    binding: 'ChatSendButton',
    summary:
      'the same control turned into Stop while a response streams — a different action under a different name, and it must stay operable',
    facts: facts(),
    visibleLabel: null,
    storyId: 'a11y-button-pattern--chat-send-stop',
  },
];

/**
 * Parts that look like they belong to this pattern and deliberately do not,
 * with the reason and the pattern that owns each (AST-021 FR2 asks for the
 * inventory; an exclusion is part of the inventory, not an omission from it).
 *
 * The binding suites assert that each of these really does present the
 * semantics claimed here, so an exclusion cannot quietly become wrong.
 */
export const BUTTON_PATTERN_EXCLUSIONS: ReadonlyArray<{
  readonly id: string;
  readonly reason: string;
  readonly storyId: string;
  /** The role this part presents instead, checked by the binding suite. */
  readonly presentsRole: string;
}> = [
  {
    id: 'button-as-link',
    reason:
      'A Button given `href` renders an anchor and navigates. The APG is explicit that the two functions are distinctly different, so the link pattern owns it — including its own name and purpose requirements.',
    storyId: 'a11y-button-pattern--button-as-link',
    presentsRole: 'link',
  },
  {
    id: 'clickable-card-as-link',
    reason:
      'A ClickableCard given `href` renders an anchor for the same reason.',
    storyId: 'a11y-button-pattern--clickable-card-as-link',
    presentsRole: 'link',
  },
];
