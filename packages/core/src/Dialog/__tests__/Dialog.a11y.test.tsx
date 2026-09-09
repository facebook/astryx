// Copyright (c) Meta Platforms, Inc. and affiliates.
/** @vitest-environment jsdom */

/**
 * @file Dialog.a11y.test.tsx
 * @input Uses the shared modal-dialog contract, @testing-library/react, and the
 *   actual Dialog and DialogHeader components
 * @output Dialog's jsdom binding through expectAccessibilitySpec
 * @position Fast DOM-semantics lane. Browser-owned focus, top-layer, inertness,
 *   dismissal, and computed-tree outcomes run in Dialog.a11y.chromium.spec.ts.
 */

import {beforeEach, describe, expect, it, vi} from 'vitest';
import {cleanup, render, screen} from '@testing-library/react';
import {
  MODAL_DIALOG_PATTERN,
  checkAccessibilitySpec,
  createJsdomHarness,
  expectAccessibilitySpec,
  summarize,
  type BindingResult,
} from '@astryxdesign/a11y-spec';
import {Dialog} from '../Dialog';
import {DialogHeader} from '../DialogHeader';
import {DIALOG_MODAL_KNOWN_FAILURES} from './Dialog.a11y.known-failures';
import {
  DIALOG_CONTRACT_FIRST_LABEL,
  DIALOG_CONTRACT_LAST_LABEL,
  DIALOG_MODAL_BINDING_STATES,
  type DialogModalBindingState,
} from './Dialog.a11y.states';

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

function DialogState({state}: {state: DialogModalBindingState}) {
  switch (state.render) {
    case 'labelled-described':
      return (
        <Dialog
          isOpen
          onOpenChange={() => {}}
          aria-describedby="dialog-contract-description">
          <DialogHeader title="Review changes" />
          <p id="dialog-contract-description">
            Confirm the changes before continuing.
          </p>
          <button type="button">{DIALOG_CONTRACT_FIRST_LABEL}</button>
          <button type="button">{DIALOG_CONTRACT_LAST_LABEL}</button>
        </Dialog>
      );
    case 'explicit-focus':
      return (
        <Dialog
          isOpen
          onOpenChange={() => {}}
          purpose="form"
          aria-labelledby="dialog-contract-explicit-title">
          <h2
            id="dialog-contract-explicit-title"
            tabIndex={-1}
            data-autofocus
            autoFocus>
            Edit profile
          </h2>
          <p>Review the profile before saving.</p>
        </Dialog>
      );
    case 'conditional':
      return (
        <Dialog isOpen onOpenChange={() => {}} aria-label="Sensitive review">
          <DialogHeader title="Sensitive review" />
          <p>This content exists only while the task is open.</p>
        </Dialog>
      );
    case 'no-focusable':
      return (
        <Dialog isOpen onOpenChange={() => {}} aria-label="Read terms">
          <p>There are no controls in this task.</p>
        </Dialog>
      );
  }
}

function renderState(state: DialogModalBindingState): void {
  render(<DialogState state={state} />);
}

function dialogSubject(): HTMLElement {
  return screen.getByRole('dialog', {hidden: true});
}

async function expectState(state: DialogModalBindingState): Promise<void> {
  await expectAccessibilitySpec({
    spec: MODAL_DIALOG_PATTERN,
    binding: 'Dialog',
    state: state.id,
    facts: state.facts,
    knownFailures: DIALOG_MODAL_KNOWN_FAILURES,
    render: () => renderState(state),
    subject: dialogSubject,
    cleanup,
  });
}

async function checkState(
  state: DialogModalBindingState,
): Promise<BindingResult> {
  return checkAccessibilitySpec({
    spec: MODAL_DIALOG_PATTERN,
    binding: 'Dialog',
    state: state.id,
    facts: state.facts,
    knownFailures: DIALOG_MODAL_KNOWN_FAILURES,
    mount: async () => {
      renderState(state);
      return createJsdomHarness({subject: dialogSubject()});
    },
    unmount: cleanup,
  });
}

describe('Dialog — the shared modal-dialog pattern, jsdom lane', () => {
  it.each(
    DIALOG_MODAL_BINDING_STATES.map(
      state => [state.id, state.summary, state] as const,
    ),
  )('%s (%s)', async (_id, _summary, state) => {
    await expectState(state);
  });

  it('runs DOM semantics and reports browser-owned layers as unrun', async () => {
    const results: BindingResult[] = [];
    for (const state of DIALOG_MODAL_BINDING_STATES) {
      results.push(await checkState(state));
    }
    const report = summarize(MODAL_DIALOG_PATTERN, results);
    expect(report.counts.pass).toBeGreaterThan(0);
    expect(report.unrunLayers).toEqual(['accessibility-tree', 'real-browser']);
    expect(report.counts.unexpectedPass).toBe(0);
  });
});
