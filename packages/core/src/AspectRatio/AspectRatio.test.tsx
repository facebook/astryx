// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file AspectRatio.test.tsx
 * @input Uses vitest, @testing-library/react, AspectRatio component
 * @output Unit tests for AspectRatio component behavior
 * @position Testing; validates AspectRatio.tsx implementation
 *
 * SYNC: When AspectRatio.tsx changes, update tests to match new behavior
 */

import {describe, it, expect, vi, beforeAll} from 'vitest';
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

  describe('fit', () => {
    it('marks the child\'s direct parent with data-astryx-aspect-ratio-override for fit="cover"', () => {
      render(
        <AspectRatio ratio={16 / 9} fit="cover">
          <img src="test.jpg" alt="Test" data-testid="image" />
        </AspectRatio>,
      );
      // The marker sits on the child's actual parent, so the reset.css
      // sizing rules are direct-child selectors with no dependence on
      // AspectRatio's internal structure.
      const wrapper = screen.getByTestId('image').parentElement;
      expect(wrapper).toHaveAttribute(
        'data-astryx-aspect-ratio-override',
        'cover',
      );
    });

    it('marks the child\'s direct parent with data-astryx-aspect-ratio-override for fit="contain"', () => {
      render(
        <AspectRatio ratio={16 / 9} fit="contain">
          <img src="test.jpg" alt="Test" data-testid="image" />
        </AspectRatio>,
      );
      const wrapper = screen.getByTestId('image').parentElement;
      expect(wrapper).toHaveAttribute(
        'data-astryx-aspect-ratio-override',
        'contain',
      );
    });

    it('does not expose fit on the theming surface', () => {
      render(
        <AspectRatio ratio={16 / 9} fit="cover" data-testid="aspect-ratio">
          <img src="test.jpg" alt="Test" />
        </AspectRatio>,
      );
      const element = screen.getByTestId('aspect-ratio');
      // fit is structural, not visual — no data-fit attribute or class
      // token on the themeable root (only shape is a theming target).
      expect(element).not.toHaveAttribute('data-fit');
      expect(element.className).not.toContain('cover');
    });

    it('emits no marker when fit is omitted (back-compat)', () => {
      render(
        <AspectRatio ratio={16 / 9} data-testid="aspect-ratio">
          <img src="test.jpg" alt="Test" data-testid="image" />
        </AspectRatio>,
      );
      const wrapper = screen.getByTestId('image').parentElement;
      expect(wrapper).not.toHaveAttribute('data-astryx-aspect-ratio-override');
      // Without the marker, none of the reset.css fit rules can match, so
      // existing self-styled children render exactly as before.
      expect(screen.getByTestId('image')).not.toHaveAttribute('class');
    });

    it('never touches the child element props', () => {
      render(
        <AspectRatio ratio={16 / 9} fit="cover">
          <img
            src="test.jpg"
            alt="Test"
            data-testid="image"
            className="consumer-class"
            style={{objectFit: 'contain'}}
          />
        </AspectRatio>,
      );
      const image = screen.getByTestId('image');
      // Fit styling is pure CSS (zero-specificity reset rules); the child's
      // own className/style pass through untouched and always win, so
      // children that already size themselves keep their behavior.
      expect(image.className).toBe('consumer-class');
      expect(image.style.objectFit).toBe('contain');
    });

    it('centers the child via the wrapper with fit="center"', () => {
      render(
        <AspectRatio ratio={16 / 9} fit="center">
          <img src="test.jpg" alt="Test" data-testid="image" />
        </AspectRatio>,
      );
      const image = screen.getByTestId('image');
      expect(image).not.toHaveAttribute('class');
      const wrapper = image.parentElement;
      expect(wrapper?.className).toContain('childCenter');
    });

    it('does not center the wrapper for other fit values', () => {
      render(
        <AspectRatio ratio={16 / 9} fit="cover">
          <img src="test.jpg" alt="Test" data-testid="image" />
        </AspectRatio>,
      );
      const wrapper = screen.getByTestId('image').parentElement;
      expect(wrapper?.className).not.toContain('childCenter');
    });
  });

  describe('reset.css fit baseline rules', () => {
    // The cover/contain child sizing ships as zero-specificity baseline
    // rules in reset.css keyed on the data-astryx-aspect-ratio-override
    // marker the component sets on the child's direct parent. These
    // assertions keep the stylesheet in sync with the component contract.
    let resetCSS: string;

    beforeAll(async () => {
      const fs = await import('fs');
      const path = await import('path');
      resetCSS = fs.readFileSync(
        path.resolve(__dirname, '../reset.css'),
        'utf-8',
      );
    });

    it('sizes the child to fill the box for cover and contain', () => {
      const fillMatch = resetCSS.match(
        /:where\(\[data-astryx-aspect-ratio-override="cover"\], \[data-astryx-aspect-ratio-override="contain"\]\)\s*>\s*:where\(\*\)\s*\{([^}]+)\}/,
      );
      expect(fillMatch).not.toBeNull();
      expect(fillMatch![1]).toContain('width: 100%');
      expect(fillMatch![1]).toContain('height: 100%');
    });

    it('crops media with object-fit: cover for fit="cover"', () => {
      const coverMatch = resetCSS.match(
        /:where\(\[data-astryx-aspect-ratio-override="cover"\]\)\s*>\s*:where\(img, video\)\s*\{([^}]+)\}/,
      );
      expect(coverMatch).not.toBeNull();
      expect(coverMatch![1]).toContain('object-fit: cover');
    });

    it('letterboxes media with object-fit: contain for fit="contain"', () => {
      const containMatch = resetCSS.match(
        /:where\(\[data-astryx-aspect-ratio-override="contain"\]\)\s*>\s*:where\(img, video\)\s*\{([^}]+)\}/,
      );
      expect(containMatch).not.toBeNull();
      expect(containMatch![1]).toContain('object-fit: contain');
    });
  });
});
