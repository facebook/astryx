// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Blockquote.test.tsx
 * @input Uses vitest, @testing-library/react, Blockquote component
 * @output Unit tests for Blockquote component behavior
 * @position Testing; validates Blockquote.tsx implementation
 *
 * SYNC: When Blockquote.tsx changes, update tests to match new behavior
 */

import {describe, it, expect, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import {renderToString} from 'react-dom/server';
import {Blockquote} from './Blockquote';

describe('Blockquote', () => {
  it('renders children in a blockquote element', () => {
    render(<Blockquote data-testid="bq">A quoted statement.</Blockquote>);
    const element = screen.getByTestId('bq');
    expect(element).toBeInTheDocument();
    expect(element.tagName).toBe('BLOCKQUOTE');
    expect(element).toHaveTextContent('A quoted statement.');
  });

  it('renders astryx-* class name for theme targeting', () => {
    render(<Blockquote data-testid="bq">Quote</Blockquote>);
    const element = screen.getByTestId('bq');
    expect(element.className).toContain('astryx-blockquote');
  });

  it('renders without cite by default', () => {
    render(<Blockquote data-testid="bq">Quote</Blockquote>);
    const element = screen.getByTestId('bq');
    expect(element.querySelector('cite')).toBeNull();
  });

  it('renders cite when provided', () => {
    render(
      <Blockquote cite="Steve Jobs" data-testid="bq">
        Design is not just what it looks like.
      </Blockquote>,
    );
    const element = screen.getByTestId('bq');
    const cite = element.querySelector('cite');
    expect(cite).toBeInTheDocument();
    expect(cite).toHaveTextContent('Steve Jobs');
  });

  it('never wraps the attribution in a landmark element', () => {
    render(
      <Blockquote cite="Steve Jobs" data-testid="bq">
        Quote
      </Blockquote>,
    );
    const element = screen.getByTestId('bq');
    expect(element.querySelector('footer')).toBeNull();
    expect(screen.queryByRole('contentinfo')).toBeNull();
  });

  it.each([
    ['false', false],
    ['an empty string', ''],
  ])('renders no cite element when cite is %s', (_label, cite) => {
    render(
      <Blockquote cite={cite} data-testid="bq">
        Quote
      </Blockquote>,
    );
    expect(screen.getByTestId('bq').querySelector('cite')).toBeNull();
  });

  it('renders cite as ReactNode', () => {
    render(
      <Blockquote
        cite={<span data-testid="custom-cite">Custom attribution</span>}
        data-testid="bq">
        Quote
      </Blockquote>,
    );
    expect(screen.getByTestId('custom-cite')).toBeInTheDocument();
    expect(screen.getByTestId('custom-cite')).toHaveTextContent(
      'Custom attribution',
    );
  });

  it('forwards ref correctly', () => {
    const ref = vi.fn();
    render(<Blockquote ref={ref}>Quote</Blockquote>);
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLElement));
  });

  it('passes through additional props', () => {
    render(
      <Blockquote data-testid="bq" aria-label="Important quote">
        Quote
      </Blockquote>,
    );
    const element = screen.getByTestId('bq');
    expect(element).toHaveAttribute('aria-label', 'Important quote');
  });

  it('renders ReactNode children', () => {
    render(
      <Blockquote data-testid="bq">
        <p data-testid="child-p">Paragraph inside blockquote</p>
      </Blockquote>,
    );
    expect(screen.getByTestId('child-p')).toBeInTheDocument();
  });

  it('renders on the server', () => {
    const html = renderToString(
      <Blockquote cite="Steve Jobs">Design is how it works.</Blockquote>,
    );
    expect(html).toContain('<blockquote');
    expect(html).toContain('astryx-blockquote');
    expect(html).toContain('<cite');
    expect(html).toContain('Steve Jobs');
  });
});
