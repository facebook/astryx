/**
 * @file XDSText.test.tsx
 * Tests for XDSText component
 */

import {render, screen} from '@testing-library/react';
import {describe, it, expect} from 'vitest';
import {XDSText} from './XDSText';
import type {XDSTextType} from './XDSText';

describe('XDSText', () => {
  describe('rendering', () => {
    it('renders without type prop (defaults to body)', () => {
      render(<XDSText>Default body text</XDSText>);
      expect(screen.getByText('Default body text')).toBeInTheDocument();
    });

    it('renders children correctly', () => {
      render(<XDSText type="body">Hello World</XDSText>);
      expect(screen.getByText('Hello World')).toBeInTheDocument();
    });

    it('renders as span by default', () => {
      render(<XDSText type="body">Text</XDSText>);
      const element = screen.getByText('Text');
      expect(element.tagName).toBe('SPAN');
    });

    it('renders as paragraph when as="p"', () => {
      render(
        <XDSText type="body" as="p">
          Paragraph
        </XDSText>,
      );
      const element = screen.getByText('Paragraph');
      expect(element.tagName).toBe('P');
    });

    it('renders as div when as="div"', () => {
      render(
        <XDSText type="body" as="div">
          Div
        </XDSText>,
      );
      const element = screen.getByText('Div');
      expect(element.tagName).toBe('DIV');
    });

    it('renders as label when as="label"', () => {
      render(
        <XDSText type="body" as="label">
          Label
        </XDSText>,
      );
      const element = screen.getByText('Label');
      expect(element.tagName).toBe('LABEL');
    });
  });

  describe('types', () => {
    it('renders body type', () => {
      render(<XDSText type="body">Body text</XDSText>);
      expect(screen.getByText('Body text')).toBeInTheDocument();
    });

    it('renders large type', () => {
      render(<XDSText type="large">Large text</XDSText>);
      expect(screen.getByText('Large text')).toBeInTheDocument();
    });

    it('renders supporting type', () => {
      render(<XDSText type="supporting">Supporting text</XDSText>);
      expect(screen.getByText('Supporting text')).toBeInTheDocument();
    });

    it('renders code type', () => {
      render(<XDSText type="code">const x = 1;</XDSText>);
      expect(screen.getByText('const x = 1;')).toBeInTheDocument();
    });

    it('renders label type', () => {
      render(<XDSText type="label">Label text</XDSText>);
      expect(screen.getByText('Label text')).toBeInTheDocument();
    });
  });

  describe('props', () => {
    it('forwards additional props', () => {
      render(
        <XDSText type="body" data-testid="custom-text">
          Text
        </XDSText>,
      );
      expect(screen.getByTestId('custom-text')).toBeInTheDocument();
    });

    it('accepts color prop', () => {
      render(
        <XDSText type="body" color="secondary">
          Secondary text
        </XDSText>,
      );
      expect(screen.getByText('Secondary text')).toBeInTheDocument();
    });

    it('accepts weight prop', () => {
      render(
        <XDSText type="body" weight="bold">
          Bold text
        </XDSText>,
      );
      expect(screen.getByText('Bold text')).toBeInTheDocument();
    });

    it('accepts display prop', () => {
      render(
        <XDSText type="body" display="block">
          Block text
        </XDSText>,
      );
      expect(screen.getByText('Block text')).toBeInTheDocument();
    });

    it('accepts hasStrikethrough prop', () => {
      render(
        <XDSText type="body" hasStrikethrough>
          Strikethrough text
        </XDSText>,
      );
      expect(screen.getByText('Strikethrough text')).toBeInTheDocument();
    });

    it('accepts hasTabularNumbers prop', () => {
      render(
        <XDSText type="body" hasTabularNumbers>
          12345
        </XDSText>,
      );
      expect(screen.getByText('12345')).toBeInTheDocument();
    });

    it('accepts hasCapsize prop', () => {
      render(
        <XDSText type="body" hasCapsize>
          Capsize text
        </XDSText>,
      );
      expect(screen.getByText('Capsize text')).toBeInTheDocument();
    });

    it('accepts textWrap prop', () => {
      render(
        <XDSText type="body" textWrap="balance">
          Balanced text wrap
        </XDSText>,
      );
      expect(screen.getByText('Balanced text wrap')).toBeInTheDocument();
    });

    it('accepts maxLines prop', () => {
      render(
        <XDSText type="body" maxLines={2}>
          This is a long text that should be truncated to two lines
        </XDSText>,
      );
      expect(
        screen.getByText(
          'This is a long text that should be truncated to two lines',
        ),
      ).toBeInTheDocument();
    });

    it('accepts wordBreak prop', () => {
      render(
        <XDSText type="body" maxLines={1} wordBreak="break-word">
          Text with word break
        </XDSText>,
      );
      expect(screen.getByText('Text with word break')).toBeInTheDocument();
    });

    it('accepts hasTruncateTooltip=false to disable tooltip', () => {
      render(
        <XDSText type="body" maxLines={1} hasTruncateTooltip={false}>
          No tooltip
        </XDSText>,
      );
      expect(screen.getByText('No tooltip')).toBeInTheDocument();
    });
  });

  it('renders xds-* class names for theme targeting', () => {
    render(<XDSText type="body">Themed Text</XDSText>);
    const element = screen.getByText('Themed Text');
    expect(element.className).toContain('xds-text');
    expect(element.className).toContain('body');
  });
});

describe('XDSText custom types', () => {
  it('renders custom text types with body fallback styles', () => {
    render(<XDSText type={'hero' as XDSTextType}>Custom</XDSText>);
    const el = screen.getByText('Custom');
    expect(el).toBeInTheDocument();
    expect(el.className).toContain('xds-text');
    expect(el.className).toContain('hero');
  });

  it('applies primary color to custom types by default', () => {
    render(<XDSText type={'caption' as XDSTextType}>Caption</XDSText>);
    expect(screen.getByText('Caption').className).toContain('primary');
  });

  it('allows color override on custom types', () => {
    render(
      <XDSText type={'hero' as XDSTextType} color="secondary">
        Muted
      </XDSText>,
    );
    expect(screen.getByText('Muted').className).toContain('secondary');
  });
});
