// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, expect, it} from 'vitest';
import {isTrustedPreviewMessage} from '../app/playground/previewChannel';

const ORIGIN = 'https://astryx.atmeta.com';

const parent = {} as MessageEventSource;
const other = {} as MessageEventSource;

function event(origin: string, source: MessageEventSource | null) {
  return {origin, source};
}

describe('isTrustedPreviewMessage', () => {
  it('accepts a message from the expected window on our own origin', () => {
    expect(isTrustedPreviewMessage(event(ORIGIN, parent), ORIGIN, parent)).toBe(
      true,
    );
  });

  it('rejects another origin, even from the expected window', () => {
    expect(
      isTrustedPreviewMessage(
        event('https://evil.example', parent),
        ORIGIN,
        parent,
      ),
    ).toBe(false);
  });

  it('rejects an opaque (sandboxed) origin', () => {
    expect(isTrustedPreviewMessage(event('null', parent), ORIGIN, parent)).toBe(
      false,
    );
  });

  it('rejects our own origin sent from a window that is not the counterpart', () => {
    expect(isTrustedPreviewMessage(event(ORIGIN, other), ORIGIN, parent)).toBe(
      false,
    );
  });

  it('rejects everything while the counterpart window does not exist', () => {
    expect(isTrustedPreviewMessage(event(ORIGIN, parent), ORIGIN, null)).toBe(
      false,
    );
    expect(
      isTrustedPreviewMessage(event(ORIGIN, parent), ORIGIN, undefined),
    ).toBe(false);
  });

  it('rejects a message with no source', () => {
    expect(isTrustedPreviewMessage(event(ORIGIN, null), ORIGIN, parent)).toBe(
      false,
    );
  });
});
