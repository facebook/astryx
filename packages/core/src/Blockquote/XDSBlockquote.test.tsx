// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file XDSBlockquote.test.tsx
 * @input Uses vitest, @testing-library/react, XDSBlockquote component
 * @output Unit tests for XDSBlockquote component behavior
 * @position Testing; validates XDSBlockquote.tsx implementation
 *
 * SYNC: When XDSBlockquote.tsx changes, update tests to match new behavior
 */

import {describe, it, expect, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import {XDSBlockquote} from './XDSBlockquote';

describe('XDSBlockquote', () => {
  it('renders children in a blockquote element', () => {
    render(<XDSBlockquote data-testid="bq">A quoted statement.</XDSBlockquote>);
    const element = screen.getByTestId('bq');
    expect(element).toBeInTheDocument();
    expect(element.tagName).toBe('BLOCKQUOTE');
    expect(element).toHaveTextContent('A quoted statement.');
  });

  it('renders xds-* class name for theme targeting', () => {
    render(<XDSBlockquote data-testid="bq">Quote</XDSBlockquote>);
    const element = screen.getByTestId('bq');
    expect(element.className).toContain('xds-blockquote');
  });

  it('renders without cite by default', () => {
    render(<XDSBlockquote data-testid="bq">Quote</XDSBlockquote>);
    const element = screen.getByTestId('bq');
    expect(element.querySelector('footer')).toBeNull();
    expect(element.querySelector('cite')).toBeNull();
  });

  it('renders cite when provided', () => {
    render(
      <XDSBlockquote cite="Steve Jobs" data-testid="bq">
        Design is not just what it looks like.
      </XDSBlockquote>,
    );
    const element = screen.getByTestId('bq');
    const footer = element.querySelector('footer');
    expect(footer).toBeInTheDocument();
    const cite = element.querySelector('cite');
    expect(cite).toBeInTheDocument();
    expect(cite).toHaveTextContent('Steve Jobs');
  });

  it('renders cite as ReactNode', () => {
    render(
      <XDSBlockquote
        cite={<span data-testid="custom-cite">Custom attribution</span>}
        data-testid="bq">
        Quote
      </XDSBlockquote>,
    );
    expect(screen.getByTestId('custom-cite')).toBeInTheDocument();
    expect(screen.getByTestId('custom-cite')).toHaveTextContent(
      'Custom attribution',
    );
  });

  it('forwards ref correctly', () => {
    const ref = vi.fn();
    render(<XDSBlockquote ref={ref}>Quote</XDSBlockquote>);
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLElement));
  });

  it('passes through additional props', () => {
    render(
      <XDSBlockquote data-testid="bq" aria-label="Important quote">
        Quote
      </XDSBlockquote>,
    );
    const element = screen.getByTestId('bq');
    expect(element).toHaveAttribute('aria-label', 'Important quote');
  });

  it('renders ReactNode children', () => {
    render(
      <XDSBlockquote data-testid="bq">
        <p data-testid="child-p">Paragraph inside blockquote</p>
      </XDSBlockquote>,
    );
    expect(screen.getByTestId('child-p')).toBeInTheDocument();
  });
});
