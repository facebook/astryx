// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect} from 'vitest';
import {render} from '@testing-library/react';
import {ChatComposer} from './ChatComposer';

// The composer body — the elevated surface — is the div that wraps the input
// area (styles.body). A custom `input` slot renders inside the inputArea div,
// so the body is two ancestors up from the slot marker. Walking from a known
// marker keeps this independent of StyleX's generated class names.
function renderBodyClass(elevation?: 'none' | 'low'): string {
  const {container} = render(
    <ChatComposer
      onSubmit={() => {}}
      elevation={elevation}
      input={<div data-testid="composer-input-marker" />}
    />,
  );
  const marker = container.querySelector(
    '[data-testid="composer-input-marker"]',
  )!;
  const inputArea = marker.parentElement!;
  const body = inputArea.parentElement!;
  return body.className;
}

describe('ChatComposer elevation', () => {
  it('applies a distinct body class for each supported level', () => {
    expect(renderBodyClass('none')).not.toBe(renderBodyClass('low'));
  });

  it("defaults to 'low' (preserves the raised look)", () => {
    expect(renderBodyClass(undefined)).toBe(renderBodyClass('low'));
  });
});
