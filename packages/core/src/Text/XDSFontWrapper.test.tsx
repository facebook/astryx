/**
 * @file XDSFontWrapper.test.tsx
 * @input Uses Vitest, React Testing Library
 * @output Tests for XDSFontWrapper component
 */

import {describe, it, expect} from 'vitest';
import {render, screen} from '@testing-library/react';
import {XDSFontWrapper} from './XDSFontWrapper';
import {Theme} from '../theme/Theme';
import {defaultTheme} from '../theme/defaultTheme.stylex';

// Helper to wrap with theme
function renderWithTheme(ui: React.ReactElement) {
  return render(<Theme theme={defaultTheme}>{ui}</Theme>);
}

describe('XDSFontWrapper', () => {
  it('renders children', () => {
    renderWithTheme(
      <XDSFontWrapper>
        <h1>Test Heading</h1>
        <p>Test paragraph</p>
      </XDSFontWrapper>,
    );

    expect(screen.getByText('Test Heading')).toBeInTheDocument();
    expect(screen.getByText('Test paragraph')).toBeInTheDocument();
  });

  it('applies default variant classes', () => {
    renderWithTheme(
      <XDSFontWrapper data-testid="wrapper">
        <p>Content</p>
      </XDSFontWrapper>,
    );

    const wrapper = screen.getByTestId('wrapper');
    expect(wrapper).toBeInTheDocument();
    expect(wrapper).toHaveClass('xds-typography');
    expect(wrapper).toHaveClass('xds-typography--default');
  });

  it('applies editorial variant classes', () => {
    renderWithTheme(
      <XDSFontWrapper variant="editorial" data-testid="wrapper">
        <p>Content</p>
      </XDSFontWrapper>,
    );

    const wrapper = screen.getByTestId('wrapper');
    expect(wrapper).toBeInTheDocument();
    expect(wrapper).toHaveClass('xds-typography');
    expect(wrapper).toHaveClass('xds-typography--editorial');
  });

  it('renders all prose elements', () => {
    renderWithTheme(
      <XDSFontWrapper>
        <h1>Heading 1</h1>
        <h2>Heading 2</h2>
        <h3>Heading 3</h3>
        <h4>Heading 4</h4>
        <h5>Heading 5</h5>
        <h6>Heading 6</h6>
        <p>Paragraph</p>
        <ul>
          <li>List item</li>
        </ul>
        <ol>
          <li>Ordered item</li>
        </ol>
        <blockquote>Quote</blockquote>
        <pre>
          <code>code block</code>
        </pre>
        <hr />
      </XDSFontWrapper>,
    );

    expect(screen.getByRole('heading', {level: 1})).toBeInTheDocument();
    expect(screen.getByRole('heading', {level: 2})).toBeInTheDocument();
    expect(screen.getByRole('heading', {level: 3})).toBeInTheDocument();
    expect(screen.getByRole('heading', {level: 4})).toBeInTheDocument();
    expect(screen.getByRole('heading', {level: 5})).toBeInTheDocument();
    expect(screen.getByRole('heading', {level: 6})).toBeInTheDocument();
    expect(screen.getByText('Paragraph')).toBeInTheDocument();
    expect(screen.getByText('List item')).toBeInTheDocument();
    expect(screen.getByText('Ordered item')).toBeInTheDocument();
    expect(screen.getByText('Quote')).toBeInTheDocument();
    expect(screen.getByText('code block')).toBeInTheDocument();
    expect(screen.getByRole('separator')).toBeInTheDocument();
  });
});
