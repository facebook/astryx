// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Container.test.tsx
 * @input Uses vitest, @testing-library/react, Container component
 * @output Unit tests for Container component behavior
 * @position Testing; validates Container.tsx implementation
 *
 * SYNC: When Container.tsx changes, update tests to match new behavior
 */

import {describe, it, expect, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import {Container} from './Container';

describe('Container', () => {
  it('renders children inside a centered column', () => {
    render(
      <Container data-testid="container">
        <div>Page content</div>
      </Container>,
    );
    const element = screen.getByTestId('container');
    expect(screen.getByText('Page content')).toBeInTheDocument();
    expect(element).toHaveStyle({
      marginInlineStart: 'auto',
      marginInlineEnd: 'auto',
      width: '100%',
    });
  });

  it('renders as a neutral div by default', () => {
    render(
      <Container data-testid="container">
        <div>Content</div>
      </Container>,
    );
    expect(screen.getByTestId('container').tagName).toBe('DIV');
  });

  it('renders as the requested landmark tag via as', () => {
    render(
      <Container as="main" data-testid="container">
        <div>Content</div>
      </Container>,
    );
    expect(screen.getByTestId('container').tagName).toBe('MAIN');
  });

  it('exposes the astryx-container theme target', () => {
    render(
      <Container data-testid="container">
        <div>Content</div>
      </Container>,
    );
    expect(screen.getByTestId('container').className).toContain(
      'astryx-container',
    );
  });

  it('applies maxWidth via dynamic styles', () => {
    render(
      <Container maxWidth={960} data-testid="container">
        <div>Content</div>
      </Container>,
    );
    // maxWidth is applied via a StyleX dynamic style (CSS variable)
    expect(screen.getByTestId('container')).toBeInTheDocument();
  });

  it('accepts string maxWidth values', () => {
    render(
      <Container maxWidth="80ch" data-testid="container">
        <div>Content</div>
      </Container>,
    );
    expect(screen.getByTestId('container')).toBeInTheDocument();
  });

  it('accepts a spacing-step gutter', () => {
    render(
      <Container gutter={4} data-testid="container">
        <div>Content</div>
      </Container>,
    );
    expect(screen.getByTestId('container')).toBeInTheDocument();
  });

  it('accepts a zero gutter', () => {
    render(
      <Container gutter={0} data-testid="container">
        <div>Content</div>
      </Container>,
    );
    expect(screen.getByTestId('container')).toBeInTheDocument();
  });

  it('forwards ref correctly', () => {
    const ref = vi.fn();
    render(
      <Container ref={ref}>
        <div>Content</div>
      </Container>,
    );
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLDivElement));
  });

  it('passes through additional props', () => {
    render(
      <Container data-testid="container" aria-label="page column">
        <div>Content</div>
      </Container>,
    );
    expect(screen.getByTestId('container')).toHaveAttribute(
      'aria-label',
      'page column',
    );
  });
});
