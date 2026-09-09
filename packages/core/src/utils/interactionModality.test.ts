// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file interactionModality.test.ts
 * @input The interaction-modality utility loaded more than once
 * @output Verifies document-wide listener and modality state continuity
 * @position Unit coverage for interactionModality.ts
 */

import {afterEach, describe, expect, it, vi} from 'vitest';

const isolatedDocument = document.implementation.createHTMLDocument();

async function loadTracker() {
  vi.resetModules();
  return import('./interactionModality');
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('interactionModality', () => {
  it('does not touch the document when the module loads', async () => {
    vi.stubGlobal('document', isolatedDocument);
    const addEventListener = vi.spyOn(isolatedDocument, 'addEventListener');

    await loadTracker();

    expect(addEventListener).not.toHaveBeenCalled();
  });

  it('shares one listener pair and tracks input between consumers', async () => {
    vi.stubGlobal('document', isolatedDocument);
    const addEventListener = vi.spyOn(isolatedDocument, 'addEventListener');
    const removeEventListener = vi.spyOn(
      isolatedDocument,
      'removeEventListener',
    );
    const firstModule = await loadTracker();
    const secondModule = await loadTracker();

    const firstConsumer =
      firstModule.__startInteractionModalityTrackingForTest();
    const secondConsumer =
      secondModule.__startInteractionModalityTrackingForTest();

    expect(
      addEventListener.mock.calls.filter(([type]) => type === 'pointerdown'),
    ).toHaveLength(1);
    expect(
      addEventListener.mock.calls.filter(([type]) => type === 'keydown'),
    ).toHaveLength(1);

    isolatedDocument.dispatchEvent(new Event('pointerdown'));
    expect(secondModule.getInteractionModality()).toBe('pointer');

    firstConsumer();
    secondConsumer();
    isolatedDocument.dispatchEvent(new KeyboardEvent('keydown', {key: 'Tab'}));
    expect(firstModule.getInteractionModality()).toBe('keyboard');
    expect(removeEventListener).not.toHaveBeenCalled();

    secondModule.__startInteractionModalityTrackingForTest()();
    expect(
      addEventListener.mock.calls.filter(([type]) => type === 'pointerdown'),
    ).toHaveLength(1);
    expect(
      addEventListener.mock.calls.filter(([type]) => type === 'keydown'),
    ).toHaveLength(1);
  });

  it('uses the keyboard-safe default without a document', async () => {
    vi.stubGlobal('document', undefined);
    const serverModule = await loadTracker();

    expect(serverModule.getInteractionModality()).toBe('keyboard');
    expect(() =>
      serverModule.__startInteractionModalityTrackingForTest()(),
    ).not.toThrow();
  });
});
