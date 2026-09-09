// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Dialog.a11y.states.ts
 * @input Uses ModalDialogStateFacts from @astryxdesign/a11y-spec
 * @output DIALOG_MODAL_BINDING_STATES — the Dialog states that can change the
 *   shared modal-dialog outcome
 * @position Data-only inventory shared by the jsdom and Chromium bindings.
 *
 * `purpose="required"` is excluded because it exposes `alertdialog`, a distinct
 * pattern. `isInline` is excluded because it deliberately has no modal behavior.
 * Nested-surface ordering remains owned by family:overlay-dismissal and the
 * existing Dialog component tests.
 *
 * SYNC: Every storyId and label must match the dedicated stories in
 * /apps/storybook/stories/Dialog.stories.tsx.
 */

import type {ModalDialogStateFacts} from '@astryxdesign/a11y-spec';

export const DIALOG_CONTRACT_OPEN_LABEL = 'Open contract dialog';
export const DIALOG_CONTRACT_BACKGROUND_LABEL = 'Background action';
export const DIALOG_CONTRACT_FIRST_LABEL = 'Previous';
export const DIALOG_CONTRACT_LAST_LABEL = 'Continue';

export type DialogInitialTarget =
  {readonly kind: 'dialog'} | {readonly kind: 'heading'; readonly name: string};

export interface DialogModalBindingState {
  readonly id: string;
  readonly summary: string;
  readonly storyId: string;
  readonly facts: ModalDialogStateFacts;
  readonly initialTarget: DialogInitialTarget;
  readonly visibleTitle: string | null;
  readonly render:
    'labelled-described' | 'explicit-focus' | 'conditional' | 'no-focusable';
}

const MODAL_FACTS = {
  labelledBy: true,
  described: false,
  hasDeclaredInitialTarget: true,
  usesNativeFocusFallback: false,
  containsTabFocus: false,
  dismissesOnEscape: true,
  restoresFocus: true,
  makesBackgroundInert: true,
} as const satisfies ModalDialogStateFacts;

export const DIALOG_MODAL_BINDING_STATES: ReadonlyArray<DialogModalBindingState> =
  [
    {
      id: 'labelled-described-default-title',
      summary:
        'an informational dialog labelled by DialogHeader, described by supporting text, and containing a two-control tab sequence',
      storyId: 'core-dialog--accessibility-contract-labelled-described',
      render: 'labelled-described',
      initialTarget: {kind: 'heading', name: 'Review changes'},
      visibleTitle: 'Review changes',
      facts: {
        ...MODAL_FACTS,
        described: true,
        containsTabFocus: true,
      },
    },
    {
      id: 'explicit-descendant-focus',
      summary:
        'a form dialog whose programmatically focusable heading explicitly requests initial focus',
      storyId: 'core-dialog--accessibility-contract-explicit-initial-focus',
      render: 'explicit-focus',
      initialTarget: {kind: 'heading', name: 'Edit profile'},
      visibleTitle: 'Edit profile',
      facts: MODAL_FACTS,
    },
    {
      id: 'conditional-content-focus-restoration',
      summary:
        'a dialog whose focus-requesting content mounts only on the opening transition and unmounts on close',
      storyId: 'core-dialog--accessibility-contract-conditional-content',
      render: 'conditional',
      initialTarget: {kind: 'heading', name: 'Sensitive review'},
      visibleTitle: 'Sensitive review',
      facts: {...MODAL_FACTS, labelledBy: false},
    },
    {
      id: 'no-focusable-content',
      summary:
        'a named informational dialog with no eligible descendant focus request or tabbable content',
      storyId: 'core-dialog--accessibility-contract-no-focusable-content',
      render: 'no-focusable',
      initialTarget: {kind: 'dialog'},
      visibleTitle: null,
      facts: {
        ...MODAL_FACTS,
        labelledBy: false,
        hasDeclaredInitialTarget: false,
        usesNativeFocusFallback: true,
      },
    },
  ];
