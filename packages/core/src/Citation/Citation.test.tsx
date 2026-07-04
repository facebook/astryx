// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Citation.test.tsx
 * @input Uses React Testing Library, Citation, theme tokens
 * @output Tests for Citation component
 */

import {render, screen} from '@testing-library/react';
import {describe, it, expect} from 'vitest';
import * as stylex from '@stylexjs/stylex';
import {colorVars} from '../theme/tokens.stylex';
import {Citation} from './Citation';

// StyleX emits one deterministic atomic class per property/value pair, so an
// element carries a probe's class exactly when it has the same declaration.
// The dev-mode debug class (contains "__") varies by source location and is
// excluded from the comparison.
const probe = stylex.create({
  secondaryText: {color: colorVars['--color-text-secondary']},
  accentText: {color: colorVars['--color-text-accent']},
  badgeBackground: {backgroundColor: colorVars['--color-accent-muted']},
});

function atomicClasses(style: (typeof probe)[keyof typeof probe]): string[] {
  const {className = ''} = stylex.props(style);
  return className.split(' ').filter(c => c !== '' && !c.includes('__'));
}

describe('Citation', () => {
  const source = {title: 'Example Source', url: 'https://example.com'};

  it('renders the source title as a link in the label variant', () => {
    render(<Citation source={source} number={1} data-testid="citation" />);
    const el = screen.getByTestId('citation');
    expect(el.tagName).toBe('A');
    expect(el).toHaveAttribute('href', 'https://example.com');
    expect(el).toHaveTextContent('Example Source');
  });

  it('renders the index as a badge in the number variant', () => {
    render(
      <Citation
        source={source}
        number={3}
        variant="number"
        data-testid="citation"
      />,
    );
    const el = screen.getByTestId('citation');
    expect(el).toHaveTextContent('3');
    expect(el).toHaveAttribute('role', 'doc-noteref');
    expect(el).toHaveAttribute('aria-label', 'Citation 3: Example Source');
  });

  it('renders as a span when the source has no url', () => {
    render(
      <Citation
        source={{title: 'No link'}}
        number={1}
        data-testid="citation"
      />,
    );
    expect(screen.getByTestId('citation').tagName).toBe('SPAN');
  });

  it('renders astryx-* class names for theme targeting', () => {
    render(<Citation source={source} number={1} data-testid="citation" />);
    expect(screen.getByTestId('citation').className).toContain(
      'astryx-citation',
    );
  });

  it('uses the secondary text color in the label variant', () => {
    render(<Citation source={source} number={1} data-testid="citation" />);
    const el = screen.getByTestId('citation');
    for (const cls of atomicClasses(probe.secondaryText)) {
      expect(el.classList.contains(cls)).toBe(true);
    }
  });

  it('uses the secondary text color, not accent, in the number variant', () => {
    render(
      <Citation
        source={source}
        number={1}
        variant="number"
        data-testid="citation"
      />,
    );
    const el = screen.getByTestId('citation');
    for (const cls of atomicClasses(probe.secondaryText)) {
      expect(el.classList.contains(cls)).toBe(true);
    }
    for (const cls of atomicClasses(probe.accentText)) {
      expect(el.classList.contains(cls)).toBe(false);
    }
  });

  it('keeps the accent-muted badge background when the source has a url', () => {
    // `numberHover` must not clobber the base background: a hover-only
    // conditional without a default replaces the whole property on merge,
    // leaving linked badges with a transparent pill.
    render(
      <Citation
        source={source}
        number={1}
        variant="number"
        data-testid="citation"
      />,
    );
    const el = screen.getByTestId('citation');
    for (const cls of atomicClasses(probe.badgeBackground)) {
      expect(el.classList.contains(cls)).toBe(true);
    }
  });
});
