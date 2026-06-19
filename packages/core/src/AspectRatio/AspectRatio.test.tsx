// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file AspectRatio.test.tsx
 * @input Uses vitest, @testing-library/react, AspectRatio component
 * @output Unit tests for AspectRatio component behavior
 * @position Testing; validates AspectRatio.tsx implementation
 *
 * SYNC: When AspectRatio.tsx changes, update tests to match new behavior
 */

import {describe, it, expect, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import {AspectRatio} from './AspectRatio';

describe('AspectRatio', () => {
  it('renders with correct aspect ratio', () => {
    render(
      <AspectRatio ratio={16 / 9} data-testid="aspect-ratio">
        <div>Content</div>
      </AspectRatio>,
    );
    const element = screen.getByTestId('aspect-ratio');
    expect(element).toBeInTheDocument();
    expect(element.style.aspectRatio).toBe(String(16 / 9));
  });

  it('children fill the container', () => {
    render(
      <AspectRatio ratio={1} data-testid="aspect-ratio">
        <div data-testid="child">Content</div>
      </AspectRatio>,
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
      <AspectRatio ratio={ratio} data-testid="aspect-ratio">
        <div>16:9</div>
      </AspectRatio>,
    );
    const element = screen.getByTestId('aspect-ratio');
    expect(element.style.aspectRatio).toBe(String(ratio));
  });

  it('renders with 4:3 ratio', () => {
    const ratio = 4 / 3;
    render(
      <AspectRatio ratio={ratio} data-testid="aspect-ratio">
        <div>4:3</div>
      </AspectRatio>,
    );
    const element = screen.getByTestId('aspect-ratio');
    expect(element.style.aspectRatio).toBe(String(ratio));
  });

  it('renders with 1:1 square ratio', () => {
    render(
      <AspectRatio ratio={1} data-testid="aspect-ratio">
        <div>Square</div>
      </AspectRatio>,
    );
    const element = screen.getByTestId('aspect-ratio');
    expect(element.style.aspectRatio).toBe('1');
  });

  it('renders with 21:9 ultrawide ratio', () => {
    const ratio = 21 / 9;
    render(
      <AspectRatio ratio={ratio} data-testid="aspect-ratio">
        <div>Ultrawide</div>
      </AspectRatio>,
    );
    const element = screen.getByTestId('aspect-ratio');
    expect(element.style.aspectRatio).toBe(String(ratio));
  });

  it('renders an ellipse that respects the ratio (circle at 1:1)', () => {
    render(
      <AspectRatio ratio={1} shape="ellipse" data-testid="aspect-ratio">
        <div>Circle</div>
      </AspectRatio>,
    );
    const element = screen.getByTestId('aspect-ratio');
    expect(element.style.aspectRatio).toBe('1');
    expect(element.className).toContain('ellipse');
  });

  it('ellipse respects a non-square ratio (oval)', () => {
    render(
      <AspectRatio ratio={16 / 9} shape="ellipse" data-testid="aspect-ratio">
        <div>Oval</div>
      </AspectRatio>,
    );
    const element = screen.getByTestId('aspect-ratio');
    // Ratio is preserved — the ellipse does not force 1:1.
    expect(element.style.aspectRatio).toBe(String(16 / 9));
    expect(element.className).toContain('ellipse');
  });

  it('defaults to the rectangle shape', () => {
    render(
      <AspectRatio ratio={1} data-testid="aspect-ratio">
        <div>Rectangle by default</div>
      </AspectRatio>,
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
      <AspectRatio ratio={1} ref={ref}>
        <div>Content</div>
      </AspectRatio>,
    );
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLElement));
  });

  it('passes through additional props', () => {
    render(
      <AspectRatio
        ratio={1}
        data-testid="aspect-ratio"
        aria-label="Image container">
        <div>Content</div>
      </AspectRatio>,
    );
    const element = screen.getByTestId('aspect-ratio');
    expect(element).toHaveAttribute('aria-label', 'Image container');
  });

  it('renders with ReactNode children', () => {
    render(
      <AspectRatio ratio={16 / 9} data-testid="aspect-ratio">
        <img
          src="test.jpg"
          alt="Test"
          data-testid="image"
          style={{width: '100%', height: '100%', objectFit: 'cover'}}
        />
      </AspectRatio>,
    );
    const image = screen.getByTestId('image');
    expect(image).toBeInTheDocument();
  });

  it('renders with xstyle prop', () => {
    // Verify that xstyle is accepted and component renders without error
    render(
      <AspectRatio ratio={1} data-testid="aspect-ratio" xstyle={{}}>
        <div>Content</div>
      </AspectRatio>,
    );
    const element = screen.getByTestId('aspect-ratio');
    expect(element).toBeInTheDocument();
  });

  it('renders different content types', () => {
    render(
      <AspectRatio ratio={16 / 9} data-testid="aspect-ratio">
        <video data-testid="video" src="test.mp4" />
      </AspectRatio>,
    );
    const video = screen.getByTestId('video');
    expect(video).toBeInTheDocument();
  });
});
