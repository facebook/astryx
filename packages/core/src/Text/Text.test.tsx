// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Text.test.tsx
 * Tests for Text component
 */

import {render, screen} from '@testing-library/react';
import {describe, it, expect} from 'vitest';
import {Text} from './Text';
import type {TextType} from './Text';

describe('Text', () => {
  describe('rendering', () => {
    it('renders without type prop (defaults to body)', () => {
      render(<Text>Default body text</Text>);
      expect(screen.getByText('Default body text')).toBeInTheDocument();
    });

    it('renders children correctly', () => {
      render(<Text type="body">Hello World</Text>);
      expect(screen.getByText('Hello World')).toBeInTheDocument();
    });

    it('renders as span by default', () => {
      render(<Text type="body">Text</Text>);
      const element = screen.getByText('Text');
      expect(element.tagName).toBe('SPAN');
    });

    it('renders as paragraph when as="p"', () => {
      render(
        <Text type="body" as="p">
          Paragraph
        </Text>,
      );
      const element = screen.getByText('Paragraph');
      expect(element.tagName).toBe('P');
    });

    it('renders as div when as="div"', () => {
      render(
        <Text type="body" as="div">
          Div
        </Text>,
      );
      const element = screen.getByText('Div');
      expect(element.tagName).toBe('DIV');
    });

    it('renders as label when as="label"', () => {
      render(
        <Text type="body" as="label">
          Label
        </Text>,
      );
      const element = screen.getByText('Label');
      expect(element.tagName).toBe('LABEL');
    });
  });

  describe('types', () => {
    it('renders body type', () => {
      render(<Text type="body">Body text</Text>);
      expect(screen.getByText('Body text')).toBeInTheDocument();
    });

    it('renders large type', () => {
      render(<Text type="large">Large text</Text>);
      expect(screen.getByText('Large text')).toBeInTheDocument();
    });

    it('renders supporting type', () => {
      render(<Text type="supporting">Supporting text</Text>);
      expect(screen.getByText('Supporting text')).toBeInTheDocument();
    });

    it('renders code type', () => {
      render(<Text type="code">const x = 1;</Text>);
      expect(screen.getByText('const x = 1;')).toBeInTheDocument();
    });

    it('renders label type', () => {
      render(<Text type="label">Label text</Text>);
      expect(screen.getByText('Label text')).toBeInTheDocument();
    });
  });

  describe('props', () => {
    it('forwards additional props', () => {
      render(
        <Text type="body" data-testid="custom-text">
          Text
        </Text>,
      );
      expect(screen.getByTestId('custom-text')).toBeInTheDocument();
    });

    it('accepts color prop', () => {
      render(
        <Text type="body" color="secondary">
          Secondary text
        </Text>,
      );
      expect(screen.getByText('Secondary text')).toBeInTheDocument();
    });

    it('accepts weight prop', () => {
      render(
        <Text type="body" weight="bold">
          Bold text
        </Text>,
      );
      expect(screen.getByText('Bold text')).toBeInTheDocument();
    });

    it('reflects explicit size overrides for styling and theming', () => {
      render(
        <Text type="code" size="2xs">
          Tiny code
        </Text>,
      );
      const element = screen.getByText('Tiny code');
      expect(element).toHaveAttribute('data-size', '2xs');
      expect(element.className).toContain('size-2xs');
    });

    it('accepts display prop', () => {
      render(
        <Text type="body" display="block">
          Block text
        </Text>,
      );
      expect(screen.getByText('Block text')).toBeInTheDocument();
    });

    it('accepts hasStrikethrough prop', () => {
      render(
        <Text type="body" hasStrikethrough>
          Strikethrough text
        </Text>,
      );
      expect(screen.getByText('Strikethrough text')).toBeInTheDocument();
    });

    it('accepts hasTabularNumbers prop', () => {
      render(
        <Text type="body" hasTabularNumbers>
          12345
        </Text>,
      );
      expect(screen.getByText('12345')).toBeInTheDocument();
    });

    it('accepts hasCapsize prop', () => {
      render(
        <Text type="body" hasCapsize>
          Capsize text
        </Text>,
      );
      expect(screen.getByText('Capsize text')).toBeInTheDocument();
    });

    it('accepts textWrap prop', () => {
      render(
        <Text type="body" textWrap="balance">
          Balanced text wrap
        </Text>,
      );
      expect(screen.getByText('Balanced text wrap')).toBeInTheDocument();
    });

    it('accepts maxLines prop', () => {
      render(
        <Text type="body" maxLines={2}>
          This is a long text that should be truncated to two lines
        </Text>,
      );
      expect(
        screen.getByText(
          'This is a long text that should be truncated to two lines',
        ),
      ).toBeInTheDocument();
    });

    it('accepts wordBreak prop', () => {
      render(
        <Text type="body" maxLines={1} wordBreak="break-word">
          Text with word break
        </Text>,
      );
      expect(screen.getByText('Text with word break')).toBeInTheDocument();
    });

    it('accepts hasTruncateTooltip=false to disable tooltip', () => {
      render(
        <Text type="body" maxLines={1} hasTruncateTooltip={false}>
          No tooltip
        </Text>,
      );
      expect(screen.getByText('No tooltip')).toBeInTheDocument();
    });
  });

  it('renders astryx-* class names for theme targeting', () => {
    render(<Text type="body">Themed Text</Text>);
    const element = screen.getByText('Themed Text');
    expect(element.className).toContain('astryx-text');
    expect(element.className).toContain('body');
  });
});

describe('Text custom types', () => {
  it('renders custom text types with body fallback styles', () => {
    render(<Text type={'hero' as TextType}>Custom</Text>);
    const el = screen.getByText('Custom');
    expect(el).toBeInTheDocument();
    expect(el.className).toContain('astryx-text');
    expect(el.className).toContain('hero');
  });

  it('applies primary color to custom types by default', () => {
    render(<Text type={'caption' as TextType}>Caption</Text>);
    expect(screen.getByText('Caption').className).toContain('primary');
  });

  it('allows color override on custom types', () => {
    render(
      <Text type={'hero' as TextType} color="secondary">
        Muted
      </Text>,
    );
    expect(screen.getByText('Muted').className).toContain('secondary');
  });
});
