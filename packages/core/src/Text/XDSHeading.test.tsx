/**
 * @file XDSHeading.test.tsx
 * Tests for XDSHeading component
 */

import {render, screen} from '@testing-library/react';
import {describe, it, expect} from 'vitest';
import {XDSHeading} from './XDSHeading';

describe('XDSHeading', () => {
  describe('rendering', () => {
    it('renders children correctly', () => {
      render(<XDSHeading level={1}>Page Title</XDSHeading>);
      expect(screen.getByText('Page Title')).toBeInTheDocument();
    });

    it('renders h1 for level 1', () => {
      render(<XDSHeading level={1}>H1</XDSHeading>);
      const element = screen.getByText('H1');
      expect(element.tagName).toBe('H1');
    });

    it('renders h2 for level 2', () => {
      render(<XDSHeading level={2}>H2</XDSHeading>);
      const element = screen.getByText('H2');
      expect(element.tagName).toBe('H2');
    });

    it('renders h3 for level 3', () => {
      render(<XDSHeading level={3}>H3</XDSHeading>);
      const element = screen.getByText('H3');
      expect(element.tagName).toBe('H3');
    });

    it('renders h4 for level 4', () => {
      render(<XDSHeading level={4}>H4</XDSHeading>);
      const element = screen.getByText('H4');
      expect(element.tagName).toBe('H4');
    });

    it('renders h5 for level 5', () => {
      render(<XDSHeading level={5}>H5</XDSHeading>);
      const element = screen.getByText('H5');
      expect(element.tagName).toBe('H5');
    });

    it('renders h6 for level 6', () => {
      render(<XDSHeading level={6}>H6</XDSHeading>);
      const element = screen.getByText('H6');
      expect(element.tagName).toBe('H6');
    });
  });

  describe('variants', () => {
    it('uses default variant by default', () => {
      render(<XDSHeading level={1}>Default Heading</XDSHeading>);
      expect(screen.getByText('Default Heading')).toBeInTheDocument();
    });

    it('supports editorial variant', () => {
      render(
        <XDSHeading level={1} variant="editorial">
          Editorial Heading
        </XDSHeading>,
      );
      expect(screen.getByText('Editorial Heading')).toBeInTheDocument();
    });
  });

  describe('props', () => {
    it('forwards additional props', () => {
      render(
        <XDSHeading level={1} data-testid="custom-heading">
          Title
        </XDSHeading>,
      );
      expect(screen.getByTestId('custom-heading')).toBeInTheDocument();
    });

    it('supports id', () => {
      render(
        <XDSHeading level={2} id="section-title">
          Section
        </XDSHeading>,
      );
      const element = screen.getByText('Section');
      expect(element).toHaveAttribute('id', 'section-title');
    });

    it('accepts color prop', () => {
      render(
        <XDSHeading level={1} color="secondary">
          Secondary heading
        </XDSHeading>,
      );
      expect(screen.getByText('Secondary heading')).toBeInTheDocument();
    });

    it('accepts display prop', () => {
      render(
        <XDSHeading level={1} display="inline">
          Inline heading
        </XDSHeading>,
      );
      expect(screen.getByText('Inline heading')).toBeInTheDocument();
    });

    it('accepts hasStrikethrough prop', () => {
      render(
        <XDSHeading level={1} hasStrikethrough>
          Strikethrough heading
        </XDSHeading>,
      );
      expect(screen.getByText('Strikethrough heading')).toBeInTheDocument();
    });

    it('accepts hasCapsize prop', () => {
      render(
        <XDSHeading level={1} hasCapsize>
          Capsize heading
        </XDSHeading>,
      );
      expect(screen.getByText('Capsize heading')).toBeInTheDocument();
    });

    it('accepts textWrap prop', () => {
      render(
        <XDSHeading level={1} textWrap="balance">
          Balanced heading
        </XDSHeading>,
      );
      expect(screen.getByText('Balanced heading')).toBeInTheDocument();
    });

    it('accepts maxLines prop', () => {
      render(
        <XDSHeading level={1} maxLines={1}>
          Very long heading that should be truncated
        </XDSHeading>,
      );
      expect(
        screen.getByText('Very long heading that should be truncated'),
      ).toBeInTheDocument();
    });

    it('accepts wordBreak prop', () => {
      render(
        <XDSHeading level={1} maxLines={1} wordBreak="break-word">
          Heading with word break
        </XDSHeading>,
      );
      expect(screen.getByText('Heading with word break')).toBeInTheDocument();
    });

    it('accepts hasTruncateTooltip=false to disable tooltip', () => {
      render(
        <XDSHeading level={1} maxLines={1} hasTruncateTooltip={false}>
          No tooltip
        </XDSHeading>,
      );
      expect(screen.getByText('No tooltip')).toBeInTheDocument();
    });

    it('accepts accessibilityLevel prop', () => {
      render(
        <XDSHeading level={2} accessibilityLevel={3}>
          Sidebar Section
        </XDSHeading>,
      );
      const element = screen.getByText('Sidebar Section');
      expect(element).toHaveAttribute('aria-level', '3');
      expect(element.tagName).toBe('H2');
    });
  });

  it('renders xds-* class names for theme targeting', () => {
    render(<XDSHeading level={2}>Themed Heading</XDSHeading>);
    const element = screen.getByText('Themed Heading');
    expect(element.className).toContain('xds-heading');
    expect(element.className).toContain('level-2');
  });
});
