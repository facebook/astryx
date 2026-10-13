// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file useSyntaxTheme.diff.test.tsx
 * @input A SyntaxTheme provider with a preset that sets no diff slots
 * @output The hook hands a canvas consumer paintable colours for every slot
 * @position Diff slot resolution for the imperative (canvas) path
 */

import {render} from '@testing-library/react';
import {describe, expect, it} from 'vitest';
import {SyntaxTheme, useSyntaxTheme} from './SyntaxTheme';
import {dracula} from './presets';

function Probe({onTokens}: {onTokens: (t: Record<string, string>) => void}) {
  const syntax = useSyntaxTheme();
  if (syntax) onTokens(syntax.tokens);
  return null;
}

describe('useSyntaxTheme diff slots', () => {
  it("resolves unset marker slots to the theme's own punctuation colour", () => {
    let tokens: Record<string, string> = {};
    render(
      <SyntaxTheme theme={dracula}>
        <Probe onTokens={t => (tokens = t)} />
      </SyntaxTheme>,
    );
    expect(tokens.punctuation).toMatch(/^#|^rgb/);
    expect(tokens['added-marker']).toBe(tokens.punctuation);
    expect(tokens['removed-marker']).toBe(tokens.punctuation);
    // The row paints are read back from the page through a probe element;
    // jsdom cannot compute color-mix(), so only their presence is asserted
    // here (the browser evidence measures the painted rows).
    for (const key of ['added', 'removed', 'diff-header']) {
      expect(tokens[key]).toBeTruthy();
    }
  });
});
