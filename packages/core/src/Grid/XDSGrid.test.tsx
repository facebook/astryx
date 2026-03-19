/**
 * @file XDSGrid.test.tsx
 * @input Uses vitest, @testing-library/react, XDSGrid and XDSGridSpan components
 * @output Unit tests for XDSGrid and XDSGridSpan component behavior
 * @position Testing; validates XDSGrid.tsx and XDSGridSpan.tsx implementation
 *
 * SYNC: When XDSGrid.tsx or XDSGridSpan.tsx changes, update tests to match new behavior
 */

import {describe, it, expect, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import {XDSGrid} from './XDSGrid';
import {XDSGridSpan} from './XDSGridSpan';

describe('XDSGrid', () => {
  it('renders with fixed columns', () => {
    render(
      <XDSGrid columns={3} data-testid="grid">
        <div>Item 1</div>
        <div>Item 2</div>
        <div>Item 3</div>
      </XDSGrid>,
    );
    const grid = screen.getByTestId('grid');
    expect(grid).toBeInTheDocument();
    expect(grid.style.gridTemplateColumns).toBe('repeat(3, 1fr)');
  });

  it('renders with minChildWidth (auto-fit)', () => {
    render(
      <XDSGrid minChildWidth={250} data-testid="grid">
        <div>Item 1</div>
        <div>Item 2</div>
      </XDSGrid>,
    );
    const grid = screen.getByTestId('grid');
    expect(grid.style.gridTemplateColumns).toBe(
      'repeat(auto-fit, minmax(250px, 1fr))',
    );
  });

  it('renders with both columns and minChildWidth (capped)', () => {
    render(
      <XDSGrid columns={3} minChildWidth={250} gap={4} data-testid="grid">
        <div>Item 1</div>
        <div>Item 2</div>
        <div>Item 3</div>
      </XDSGrid>,
    );
    const grid = screen.getByTestId('grid');
    expect(grid.style.gridTemplateColumns).toBe(
      'repeat(auto-fit, minmax(250px, 1fr))',
    );
    // maxWidth = 3 * 250 + 2 * 16 = 750 + 32 = 782px
    expect(grid.style.maxWidth).toBe('782px');
  });

  it('renders with columns and minChildWidth using columnGap', () => {
    render(
      <XDSGrid columns={4} minChildWidth={200} columnGap={6} data-testid="grid">
        <div>Item 1</div>
        <div>Item 2</div>
      </XDSGrid>,
    );
    const grid = screen.getByTestId('grid');
    // maxWidth = 4 * 200 + 3 * 24 = 800 + 72 = 872px
    expect(grid.style.maxWidth).toBe('872px');
  });

  it('applies gap correctly', () => {
    render(
      <XDSGrid columns={2} gap={4} data-testid="grid">
        <div>Item 1</div>
        <div>Item 2</div>
      </XDSGrid>,
    );
    const grid = screen.getByTestId('grid');
    expect(grid).toBeInTheDocument();
    // Gap is applied via stylex class, just verify component renders
  });

  it('applies rowGap and columnGap separately', () => {
    render(
      <XDSGrid columns={2} rowGap={2} columnGap={6} data-testid="grid">
        <div>Item 1</div>
        <div>Item 2</div>
      </XDSGrid>,
    );
    const grid = screen.getByTestId('grid');
    expect(grid).toBeInTheDocument();
    // Gaps are applied via stylex classes
  });

  it('applies alignment props', () => {
    render(
      <XDSGrid columns={2} align="center" justify="start" data-testid="grid">
        <div>Item 1</div>
        <div>Item 2</div>
      </XDSGrid>,
    );
    const grid = screen.getByTestId('grid');
    expect(grid).toBeInTheDocument();
    // Alignment is applied via stylex classes
  });

  it('defaults to 1 column when nothing specified', () => {
    render(
      <XDSGrid data-testid="grid">
        <div>Item 1</div>
      </XDSGrid>,
    );
    const grid = screen.getByTestId('grid');
    expect(grid.style.gridTemplateColumns).toBe('1fr');
  });

  // --- P1: columns={0} guard (hardening #719) ---

  it('falls back to 1fr when columns={0}', () => {
    render(
      <XDSGrid columns={0} data-testid="grid">
        <div>Item</div>
      </XDSGrid>,
    );
    const grid = screen.getByTestId('grid');
    // columns={0} must not produce repeat(0, 1fr) — should fall back to default
    expect(grid.style.gridTemplateColumns).toBe('1fr');
  });

  it('falls back to 1fr when columns is negative', () => {
    render(
      <XDSGrid columns={-1} data-testid="grid">
        <div>Item</div>
      </XDSGrid>,
    );
    const grid = screen.getByTestId('grid');
    expect(grid.style.gridTemplateColumns).toBe('1fr');
  });

  it('uses auto-fit without maxWidth cap when columns={0} with minChildWidth', () => {
    render(
      <XDSGrid columns={0} minChildWidth={200} data-testid="grid">
        <div>Item</div>
      </XDSGrid>,
    );
    const grid = screen.getByTestId('grid');
    // minChildWidth drives auto-fit; columns={0} should not set a maxWidth cap
    expect(grid.style.gridTemplateColumns).toBe(
      'repeat(auto-fit, minmax(200px, 1fr))',
    );
    expect(grid.style.maxWidth).toBe('');
  });

  // --- P2: width/height props (hardening #719) ---

  it('applies numeric width as pixels', () => {
    render(
      <XDSGrid columns={2} width={600} data-testid="grid">
        <div>Item</div>
      </XDSGrid>,
    );
    const grid = screen.getByTestId('grid');
    expect(grid.style.width).toBe('600px');
  });

  it('applies string width as-is', () => {
    render(
      <XDSGrid columns={2} width="100%" data-testid="grid">
        <div>Item</div>
      </XDSGrid>,
    );
    const grid = screen.getByTestId('grid');
    expect(grid.style.width).toBe('100%');
  });

  it('applies numeric height as pixels', () => {
    render(
      <XDSGrid columns={2} height={400} data-testid="grid">
        <div>Item</div>
      </XDSGrid>,
    );
    const grid = screen.getByTestId('grid');
    expect(grid.style.height).toBe('400px');
  });

  it('applies string height as-is', () => {
    render(
      <XDSGrid columns={2} height="50vh" data-testid="grid">
        <div>Item</div>
      </XDSGrid>,
    );
    const grid = screen.getByTestId('grid');
    expect(grid.style.height).toBe('50vh');
  });

  // --- P2: minChildWidth + columnGap interaction (hardening #719) ---

  it('calculates maxWidth using columnGap when both columnGap and gap are set', () => {
    render(
      <XDSGrid
        columns={3}
        minChildWidth={200}
        gap={2}
        columnGap={6}
        data-testid="grid">
        <div>Item</div>
      </XDSGrid>,
    );
    const grid = screen.getByTestId('grid');
    // columnGap should take precedence over gap for maxWidth calculation
    // maxWidth = 3 * 200 + 2 * 24 (space6=24px) = 600 + 48 = 648px
    expect(grid.style.maxWidth).toBe('648px');
  });

  it('calculates maxWidth using gap when columnGap is not set', () => {
    render(
      <XDSGrid columns={2} minChildWidth={150} gap={3} data-testid="grid">
        <div>Item</div>
      </XDSGrid>,
    );
    const grid = screen.getByTestId('grid');
    // maxWidth = 2 * 150 + 1 * 12 (space3=12px) = 300 + 12 = 312px
    expect(grid.style.maxWidth).toBe('312px');
  });

  it('calculates maxWidth with zero gap when neither gap nor columnGap is set', () => {
    render(
      <XDSGrid columns={3} minChildWidth={100} data-testid="grid">
        <div>Item</div>
      </XDSGrid>,
    );
    const grid = screen.getByTestId('grid');
    // maxWidth = 3 * 100 + 2 * 0 = 300px
    expect(grid.style.maxWidth).toBe('300px');
  });

  it('forwards ref correctly', () => {
    const ref = vi.fn();
    render(
      <XDSGrid columns={2} ref={ref}>
        <div>Item</div>
      </XDSGrid>,
    );
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLElement));
  });

  it('passes through additional props', () => {
    render(
      <XDSGrid columns={2} data-testid="grid" aria-label="Product grid">
        <div>Item</div>
      </XDSGrid>,
    );
    const grid = screen.getByTestId('grid');
    expect(grid).toHaveAttribute('aria-label', 'Product grid');
  });

  it('renders children correctly', () => {
    render(
      <XDSGrid columns={3} data-testid="grid">
        <div>Item 1</div>
        <div>Item 2</div>
        <div>Item 3</div>
      </XDSGrid>,
    );
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
    expect(screen.getByText('Item 3')).toBeInTheDocument();
  });
});

describe('XDSGridSpan', () => {
  it('spans correct number of columns', () => {
    render(
      <XDSGrid columns={4}>
        <XDSGridSpan columns={2} data-testid="span">
          Wide item
        </XDSGridSpan>
      </XDSGrid>,
    );
    const span = screen.getByTestId('span');
    expect(span.style.gridColumn).toBe('span 2');
  });

  it('spans full width with columns="full"', () => {
    render(
      <XDSGrid columns={4}>
        <XDSGridSpan columns="full" data-testid="span">
          Full width
        </XDSGridSpan>
      </XDSGrid>,
    );
    const span = screen.getByTestId('span');
    expect(span.style.gridColumn).toBe('1 / -1');
  });

  it('spans correct number of rows', () => {
    render(
      <XDSGrid columns={3}>
        <XDSGridSpan rows={2} data-testid="span">
          Tall item
        </XDSGridSpan>
      </XDSGrid>,
    );
    const span = screen.getByTestId('span');
    expect(span.style.gridRow).toBe('span 2');
  });

  it('spans both columns and rows', () => {
    render(
      <XDSGrid columns={4}>
        <XDSGridSpan columns={2} rows={2} data-testid="span">
          2x2 item
        </XDSGridSpan>
      </XDSGrid>,
    );
    const span = screen.getByTestId('span');
    expect(span.style.gridColumn).toBe('span 2');
    expect(span.style.gridRow).toBe('span 2');
  });

  it('renders without span props', () => {
    render(
      <XDSGrid columns={3}>
        <XDSGridSpan data-testid="span">Normal item</XDSGridSpan>
      </XDSGrid>,
    );
    const span = screen.getByTestId('span');
    expect(span).toBeInTheDocument();
    expect(span.style.gridColumn).toBe('');
    expect(span.style.gridRow).toBe('');
  });

  it('forwards ref correctly', () => {
    const ref = vi.fn();
    render(
      <XDSGrid columns={2}>
        <XDSGridSpan ref={ref}>Item</XDSGridSpan>
      </XDSGrid>,
    );
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLElement));
  });

  it('passes through additional props', () => {
    render(
      <XDSGrid columns={2}>
        <XDSGridSpan columns={2} data-testid="span" aria-label="Featured item">
          Content
        </XDSGridSpan>
      </XDSGrid>,
    );
    const span = screen.getByTestId('span');
    expect(span).toHaveAttribute('aria-label', 'Featured item');
  });

  it('renders children correctly', () => {
    render(
      <XDSGrid columns={3}>
        <XDSGridSpan columns="full">
          <span data-testid="child">Child content</span>
        </XDSGridSpan>
      </XDSGrid>,
    );
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });
});
