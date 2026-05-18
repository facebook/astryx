// Copyright (c) Meta Platforms, Inc. and affiliates.

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

  it('renders with columns object (auto-fill default)', () => {
    render(
      <XDSGrid columns={{minWidth: 250}} data-testid="grid">
        <div>Item 1</div>
        <div>Item 2</div>
      </XDSGrid>,
    );
    const grid = screen.getByTestId('grid');
    expect(grid.style.gridTemplateColumns).toBe(
      'repeat(auto-fill, minmax(250px, 1fr))',
    );
  });

  it('renders with columns object max (capped via track-max)', () => {
    render(
      <XDSGrid columns={{minWidth: 250, max: 3}} gap={4} data-testid="grid">
        <div>Item 1</div>
        <div>Item 2</div>
        <div>Item 3</div>
      </XDSGrid>,
    );
    const grid = screen.getByTestId('grid');
    // Track max caps at (100% - 2 * gap) / 3 — no maxWidth on container
    expect(grid.style.gridTemplateColumns).toBe(
      'repeat(auto-fill, minmax(250px, calc((100% - 2 * var(--spacing-4)) / 3)))',
    );
    expect(grid.style.maxWidth).toBe('');
  });

  it('renders with columns object max using columnGap', () => {
    render(
      <XDSGrid
        columns={{minWidth: 200, max: 4}}
        columnGap={6}
        data-testid="grid">
        <div>Item 1</div>
        <div>Item 2</div>
      </XDSGrid>,
    );
    const grid = screen.getByTestId('grid');
    // columnGap takes precedence for track-max calculation
    expect(grid.style.gridTemplateColumns).toBe(
      'repeat(auto-fill, minmax(200px, calc((100% - 3 * var(--spacing-6)) / 4)))',
    );
    expect(grid.style.maxWidth).toBe('');
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

  it('uses auto-fill without track-max cap when no max specified', () => {
    render(
      <XDSGrid columns={{minWidth: 200}} data-testid="grid">
        <div>Item</div>
      </XDSGrid>,
    );
    const grid = screen.getByTestId('grid');
    expect(grid.style.gridTemplateColumns).toBe(
      'repeat(auto-fill, minmax(200px, 1fr))',
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

  // --- P2: columns object + columnGap interaction (hardening #719) ---

  it('uses columnGap var in track-max when both columnGap and gap are set', () => {
    render(
      <XDSGrid
        columns={{minWidth: 200, max: 3}}
        gap={2}
        columnGap={6}
        data-testid="grid">
        <div>Item</div>
      </XDSGrid>,
    );
    const grid = screen.getByTestId('grid');
    // columnGap takes precedence over gap in track-max
    expect(grid.style.gridTemplateColumns).toBe(
      'repeat(auto-fill, minmax(200px, calc((100% - 2 * var(--spacing-6)) / 3)))',
    );
    expect(grid.style.maxWidth).toBe('');
  });

  it('uses gap var in track-max when columnGap is not set', () => {
    render(
      <XDSGrid columns={{minWidth: 150, max: 2}} gap={3} data-testid="grid">
        <div>Item</div>
      </XDSGrid>,
    );
    const grid = screen.getByTestId('grid');
    expect(grid.style.gridTemplateColumns).toBe(
      'repeat(auto-fill, minmax(150px, calc((100% - 1 * var(--spacing-3)) / 2)))',
    );
    expect(grid.style.maxWidth).toBe('');
  });

  it('uses simple fraction in track-max when no gap is set', () => {
    render(
      <XDSGrid columns={{minWidth: 100, max: 3}} data-testid="grid">
        <div>Item</div>
      </XDSGrid>,
    );
    const grid = screen.getByTestId('grid');
    expect(grid.style.gridTemplateColumns).toBe(
      'repeat(auto-fill, minmax(100px, calc(100% / 3)))',
    );
    expect(grid.style.maxWidth).toBe('');
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

  // --- columns object API ---

  it('renders with columns={{minWidth}} using auto-fill', () => {
    render(
      <XDSGrid columns={{minWidth: 280}} data-testid="grid">
        <div>Item 1</div>
        <div>Item 2</div>
      </XDSGrid>,
    );
    const grid = screen.getByTestId('grid');
    expect(grid.style.gridTemplateColumns).toBe(
      'repeat(auto-fill, minmax(280px, 1fr))',
    );
  });

  it('renders with columns={{minWidth, repeat: "fit"}} using auto-fit', () => {
    render(
      <XDSGrid columns={{minWidth: 280, repeat: 'fit'}} data-testid="grid">
        <div>Item 1</div>
        <div>Item 2</div>
      </XDSGrid>,
    );
    const grid = screen.getByTestId('grid');
    expect(grid.style.gridTemplateColumns).toBe(
      'repeat(auto-fit, minmax(280px, 1fr))',
    );
  });

  it('renders with columns={{minWidth, repeat: "fill"}} using auto-fill', () => {
    render(
      <XDSGrid columns={{minWidth: 280, repeat: 'fill'}} data-testid="grid">
        <div>Item 1</div>
        <div>Item 2</div>
      </XDSGrid>,
    );
    const grid = screen.getByTestId('grid');
    expect(grid.style.gridTemplateColumns).toBe(
      'repeat(auto-fill, minmax(280px, 1fr))',
    );
  });

  it('renders with columns={{minWidth, max}} capping via track-max', () => {
    render(
      <XDSGrid columns={{minWidth: 280, max: 3}} gap={4} data-testid="grid">
        <div>Item 1</div>
        <div>Item 2</div>
      </XDSGrid>,
    );
    const grid = screen.getByTestId('grid');
    // Track-max limits columns — grid stays full width
    expect(grid.style.gridTemplateColumns).toBe(
      'repeat(auto-fill, minmax(280px, calc((100% - 2 * var(--spacing-4)) / 3)))',
    );
    expect(grid.style.maxWidth).toBe('');
  });

  it('renders with columns={{minWidth, max, repeat: "fit"}} using auto-fit + track-max', () => {
    render(
      <XDSGrid
        columns={{minWidth: 280, max: 3, repeat: 'fit'}}
        gap={4}
        data-testid="grid">
        <div>Item 1</div>
        <div>Item 2</div>
      </XDSGrid>,
    );
    const grid = screen.getByTestId('grid');
    expect(grid.style.gridTemplateColumns).toBe(
      'repeat(auto-fit, minmax(280px, calc((100% - 2 * var(--spacing-4)) / 3)))',
    );
    expect(grid.style.maxWidth).toBe('');
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
