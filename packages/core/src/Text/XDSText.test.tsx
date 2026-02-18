/**
 * @file XDSText.test.tsx
 * Tests for XDSText component
 */

import {render, screen} from '@testing-library/react';
import {describe, it, expect} from 'vitest';
import {XDSText} from './XDSText';
import {XDSTheme} from '../theme/XDSTheme';
import {defaultTheme} from '../theme/defaultTheme.stylex';

describe('XDSText', () => {
  describe('rendering', () => {
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
      render(
        <XDSTheme theme={defaultTheme}>
          <XDSText type="body">Body text</XDSText>
        </XDSTheme>,
      );
      expect(screen.getByText('Body text')).toBeInTheDocument();
    });

    it('renders large type', () => {
      render(
        <XDSTheme theme={defaultTheme}>
          <XDSText type="large">Large text</XDSText>
        </XDSTheme>,
      );
      expect(screen.getByText('Large text')).toBeInTheDocument();
    });

    it('renders supporting type', () => {
      render(
        <XDSTheme theme={defaultTheme}>
          <XDSText type="supporting">Supporting text</XDSText>
        </XDSTheme>,
      );
      expect(screen.getByText('Supporting text')).toBeInTheDocument();
    });

    it('renders code type', () => {
      render(
        <XDSTheme theme={defaultTheme}>
          <XDSText type="code">const x = 1;</XDSText>
        </XDSTheme>,
      );
      expect(screen.getByText('const x = 1;')).toBeInTheDocument();
    });

    it('renders label type', () => {
      render(
        <XDSTheme theme={defaultTheme}>
          <XDSText type="label">Label text</XDSText>
        </XDSTheme>,
      );
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
        <XDSTheme theme={defaultTheme}>
          <XDSText type="body" color="secondary">
            Secondary text
          </XDSText>
        </XDSTheme>,
      );
      expect(screen.getByText('Secondary text')).toBeInTheDocument();
    });

    it('accepts weight prop', () => {
      render(
        <XDSTheme theme={defaultTheme}>
          <XDSText type="body" weight="bold">
            Bold text
          </XDSText>
        </XDSTheme>,
      );
      expect(screen.getByText('Bold text')).toBeInTheDocument();
    });

    it('accepts display prop', () => {
      render(
        <XDSTheme theme={defaultTheme}>
          <XDSText type="body" display="block">
            Block text
          </XDSText>
        </XDSTheme>,
      );
      expect(screen.getByText('Block text')).toBeInTheDocument();
    });

    it('accepts hasStrikethrough prop', () => {
      render(
        <XDSTheme theme={defaultTheme}>
          <XDSText type="body" hasStrikethrough>
            Strikethrough text
          </XDSText>
        </XDSTheme>,
      );
      expect(screen.getByText('Strikethrough text')).toBeInTheDocument();
    });

    it('accepts hasTabularNumbers prop', () => {
      render(
        <XDSTheme theme={defaultTheme}>
          <XDSText type="body" hasTabularNumbers>
            12345
          </XDSText>
        </XDSTheme>,
      );
      expect(screen.getByText('12345')).toBeInTheDocument();
    });

    it('accepts hasCapsize prop', () => {
      render(
        <XDSTheme theme={defaultTheme}>
          <XDSText type="body" hasCapsize>
            Capsize text
          </XDSText>
        </XDSTheme>,
      );
      expect(screen.getByText('Capsize text')).toBeInTheDocument();
    });

    it('accepts textWrap prop', () => {
      render(
        <XDSTheme theme={defaultTheme}>
          <XDSText type="body" textWrap="balance">
            Balanced text wrap
          </XDSText>
        </XDSTheme>,
      );
      expect(screen.getByText('Balanced text wrap')).toBeInTheDocument();
    });

    it('accepts maxLines prop', () => {
      render(
        <XDSTheme theme={defaultTheme}>
          <XDSText type="body" maxLines={2}>
            This is a long text that should be truncated to two lines
          </XDSText>
        </XDSTheme>,
      );
      expect(
        screen.getByText(
          'This is a long text that should be truncated to two lines',
        ),
      ).toBeInTheDocument();
    });

    it('accepts wordBreak prop', () => {
      render(
        <XDSTheme theme={defaultTheme}>
          <XDSText type="body" maxLines={1} wordBreak="break-word">
            Text with word break
          </XDSText>
        </XDSTheme>,
      );
      expect(screen.getByText('Text with word break')).toBeInTheDocument();
    });

    it('accepts hasTruncateTooltip=false to disable tooltip', () => {
      render(
        <XDSTheme theme={defaultTheme}>
          <XDSText type="body" maxLines={1} hasTruncateTooltip={false}>
            No tooltip
          </XDSText>
        </XDSTheme>,
      );
      expect(screen.getByText('No tooltip')).toBeInTheDocument();
    });
  });
});
