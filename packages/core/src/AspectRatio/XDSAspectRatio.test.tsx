// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file XDSAspectRatio.test.tsx
 * @input Uses vitest, @testing-library/react, XDSAspectRatio component
 * @output Unit tests for XDSAspectRatio component behavior
 * @position Testing; validates XDSAspectRatio.tsx implementation
 *
 * SYNC: When XDSAspectRatio.tsx changes, update tests to match new behavior
 */

import {describe, it, expect, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import {XDSAspectRatio} from './XDSAspectRatio';

describe('XDSAspectRatio', () => {
  it('renders with correct aspect ratio', () => {
    render(
      <XDSAspectRatio ratio={16 / 9} data-testid="aspect-ratio">
        <div>Content</div>
      </XDSAspectRatio>,
    );
    const element = screen.getByTestId('aspect-ratio');
    expect(element).toBeInTheDocument();
    expect(element.style.aspectRatio).toBe(String(16 / 9));
  });

  it('children fill the container', () => {
    render(
      <XDSAspectRatio ratio={1} data-testid="aspect-ratio">
        <div data-testid="child">Content</div>
      </XDSAspectRatio>,
    );
    const container = screen.getByTestId('aspect-ratio');
    const child = screen.getByTestId('child');
    expect(container).toContainElement(child);
    // Child is wrapped in an absolute positioned div
    const childWrapper = child.parentElement;
    expect(childWrapper).not.toBeNull();
  });

  it('renders with 16:9 ratio', () => {
    const ratio = 16 / 9;
    render(
      <XDSAspectRatio ratio={ratio} data-testid="aspect-ratio">
        <div>16:9</div>
      </XDSAspectRatio>,
    );
    const element = screen.getByTestId('aspect-ratio');
    expect(element.style.aspectRatio).toBe(String(ratio));
  });

  it('renders with 4:3 ratio', () => {
    const ratio = 4 / 3;
    render(
      <XDSAspectRatio ratio={ratio} data-testid="aspect-ratio">
        <div>4:3</div>
      </XDSAspectRatio>,
    );
    const element = screen.getByTestId('aspect-ratio');
    expect(element.style.aspectRatio).toBe(String(ratio));
  });

  it('renders with 1:1 square ratio', () => {
    render(
      <XDSAspectRatio ratio={1} data-testid="aspect-ratio">
        <div>Square</div>
      </XDSAspectRatio>,
    );
    const element = screen.getByTestId('aspect-ratio');
    expect(element.style.aspectRatio).toBe('1');
  });

  it('renders with 21:9 ultrawide ratio', () => {
    const ratio = 21 / 9;
    render(
      <XDSAspectRatio ratio={ratio} data-testid="aspect-ratio">
        <div>Ultrawide</div>
      </XDSAspectRatio>,
    );
    const element = screen.getByTestId('aspect-ratio');
    expect(element.style.aspectRatio).toBe(String(ratio));
  });

  it('renders an ellipse that respects the ratio (circle at 1:1)', () => {
    render(
      <XDSAspectRatio ratio={1} shape="ellipse" data-testid="aspect-ratio">
        <div>Circle</div>
      </XDSAspectRatio>,
    );
    const element = screen.getByTestId('aspect-ratio');
    expect(element.style.aspectRatio).toBe('1');
    expect(element.className).toContain('ellipse');
  });

  it('ellipse respects a non-square ratio (oval)', () => {
    render(
      <XDSAspectRatio ratio={16 / 9} shape="ellipse" data-testid="aspect-ratio">
        <div>Oval</div>
      </XDSAspectRatio>,
    );
    const element = screen.getByTestId('aspect-ratio');
    // Ratio is preserved — the ellipse does not force 1:1.
    expect(element.style.aspectRatio).toBe(String(16 / 9));
    expect(element.className).toContain('ellipse');
  });

  it('defaults to the rectangle shape', () => {
    render(
      <XDSAspectRatio ratio={1} data-testid="aspect-ratio">
        <div>Rectangle by default</div>
      </XDSAspectRatio>,
    );
    const element = screen.getByTestId('aspect-ratio');
    expect(element.style.aspectRatio).toBe('1');
    expect(element.className).toContain('rectangle');
    // No ellipse border-radius when shape is the default rectangle
    expect(element.style.borderRadius).toBe('');
  });

  it('forwards ref correctly', () => {
    const ref = vi.fn();
    render(
      <XDSAspectRatio ratio={1} ref={ref}>
        <div>Content</div>
      </XDSAspectRatio>,
    );
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLElement));
  });

  it('passes through additional props', () => {
    render(
      <XDSAspectRatio
        ratio={1}
        data-testid="aspect-ratio"
        aria-label="Image container">
        <div>Content</div>
      </XDSAspectRatio>,
    );
    const element = screen.getByTestId('aspect-ratio');
    expect(element).toHaveAttribute('aria-label', 'Image container');
  });

  it('renders with ReactNode children', () => {
    render(
      <XDSAspectRatio ratio={16 / 9} data-testid="aspect-ratio">
        <img
          src="test.jpg"
          alt="Test"
          data-testid="image"
          style={{width: '100%', height: '100%', objectFit: 'cover'}}
        />
      </XDSAspectRatio>,
    );
    const image = screen.getByTestId('image');
    expect(image).toBeInTheDocument();
  });

  it('renders with xstyle prop', () => {
    // Verify that xstyle is accepted and component renders without error
    render(
      <XDSAspectRatio ratio={1} data-testid="aspect-ratio" xstyle={{}}>
        <div>Content</div>
      </XDSAspectRatio>,
    );
    const element = screen.getByTestId('aspect-ratio');
    expect(element).toBeInTheDocument();
  });

  it('renders different content types', () => {
    render(
      <XDSAspectRatio ratio={16 / 9} data-testid="aspect-ratio">
        <video data-testid="video" src="test.mp4" />
      </XDSAspectRatio>,
    );
    const video = screen.getByTestId('video');
    expect(video).toBeInTheDocument();
  });
});
