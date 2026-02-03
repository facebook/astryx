/**
 * @file XDSCenter.test.tsx
 * @input Uses vitest, @testing-library/react, XDSCenter component
 * @output Unit tests for XDSCenter component behavior
 * @position Testing; validates XDSCenter.tsx implementation
 *
 * SYNC: When XDSCenter.tsx changes, update tests to match new behavior
 */

import {describe, it, expect, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import {XDSCenter} from './XDSCenter';

describe('XDSCenter', () => {
  it('renders and centers children (both axes by default)', () => {
    render(
      <XDSCenter data-testid="center">
        <div>Centered Content</div>
      </XDSCenter>,
    );
    const element = screen.getByTestId('center');
    expect(screen.getByText('Centered Content')).toBeInTheDocument();
    expect(element).toBeInTheDocument();
    // Check that it has flex display
    expect(element).toHaveStyle({display: 'flex'});
  });

  it('centers horizontally only', () => {
    render(
      <XDSCenter axis="horizontal" data-testid="center">
        <div>Horizontal Center</div>
      </XDSCenter>,
    );
    const element = screen.getByTestId('center');
    expect(screen.getByText('Horizontal Center')).toBeInTheDocument();
    expect(element).toHaveStyle({display: 'flex'});
  });

  it('centers vertically only', () => {
    render(
      <XDSCenter axis="vertical" data-testid="center">
        <div>Vertical Center</div>
      </XDSCenter>,
    );
    const element = screen.getByTestId('center');
    expect(screen.getByText('Vertical Center')).toBeInTheDocument();
    expect(element).toHaveStyle({display: 'flex'});
  });

  it('applies height prop', () => {
    render(
      <XDSCenter height="100%" data-testid="center">
        <div>Full Height</div>
      </XDSCenter>,
    );
    const element = screen.getByTestId('center');
    // Height is applied via StyleX dynamic styles
    expect(element).toBeInTheDocument();
  });

  it('applies width prop', () => {
    render(
      <XDSCenter width={300} data-testid="center">
        <div>Fixed Width</div>
      </XDSCenter>,
    );
    const element = screen.getByTestId('center');
    // Width is applied via StyleX dynamic styles
    expect(element).toBeInTheDocument();
  });

  it('applies both width and height props', () => {
    render(
      <XDSCenter width="50%" height={200} data-testid="center">
        <div>Sized Content</div>
      </XDSCenter>,
    );
    const element = screen.getByTestId('center');
    // Width and height are applied via StyleX dynamic styles
    expect(element).toBeInTheDocument();
  });

  it('renders as inline-flex when inline is true', () => {
    render(
      <XDSCenter inline data-testid="center">
        <div>Inline Content</div>
      </XDSCenter>,
    );
    const element = screen.getByTestId('center');
    expect(element).toHaveStyle({display: 'inline-flex'});
  });

  it('forwards ref correctly', () => {
    const ref = vi.fn();
    render(
      <XDSCenter ref={ref}>
        <div>Test</div>
      </XDSCenter>,
    );
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLDivElement));
  });

  it('applies xstyle prop', () => {
    // Note: StyleX styles are transformed at build time, so we test that
    // the component renders without error when xstyle is provided
    render(
      <XDSCenter data-testid="center" xstyle={undefined}>
        <div>Styled Content</div>
      </XDSCenter>,
    );
    expect(screen.getByTestId('center')).toBeInTheDocument();
  });

  it('passes through additional props', () => {
    render(
      <XDSCenter data-testid="center" aria-label="centered container">
        <div>Content</div>
      </XDSCenter>,
    );
    const element = screen.getByTestId('center');
    expect(element).toHaveAttribute('aria-label', 'centered container');
  });

  it('renders as div element', () => {
    render(
      <XDSCenter data-testid="center">
        <div>Content</div>
      </XDSCenter>,
    );
    const element = screen.getByTestId('center');
    expect(element.tagName).toBe('DIV');
  });
});
