// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Grid.test.tsx
 * @input Uses vitest, @testing-library/react, Grid and GridSpan components
 * @output Unit tests for Grid and GridSpan component behavior
 * @position Testing; validates Grid.tsx and GridSpan.tsx implementation
 *
 * SYNC: When Grid.tsx or GridSpan.tsx changes, update tests to match new behavior
 */

import {describe, it, expect, vi} from 'vitest';
import {readFileSync} from 'node:fs';
import path from 'node:path';
import {transformSync} from '@babel/core';
import stylexBabelPlugin from '@stylexjs/babel-plugin';
import {render, screen} from '@testing-library/react';
import {renderToString} from 'react-dom/server';
import {Grid} from './Grid';
import {GridSpan} from './GridSpan';

/**
 * The track template is applied via a StyleX dynamic style: the element
 * carries an inline CSS variable while the `grid-template-columns`
 * declaration lives in a class (so consumer xstyle/@media overrides can
 * win). `--x-gridTemplateColumns` is the debug-mode variable name emitted
 * by the StyleX transform in tests.
 */
function templateColumns(el: HTMLElement): string {
  return el.style.getPropertyValue('--x-gridTemplateColumns');
}

describe('Grid', () => {
  it('treats numeric columns as "at most N" with a 12rem floor (GRID-1)', () => {
    render(
      <Grid columns={3} data-testid="grid">
        <div>Item 1</div>
        <div>Item 2</div>
        <div>Item 3</div>
      </Grid>,
    );
    const grid = screen.getByTestId('grid');
    expect(grid).toBeInTheDocument();
    // Never the literal repeat(3, 1fr): that squeezes three columns into a
    // 390px phone. Capped auto-fill keeps 3 columns while each can stay
    // >= 12rem and drops to fewer (one full-width column) when narrower.
    expect(templateColumns(grid)).toBe(
      'repeat(auto-fill, minmax(min(100%, max(12rem, calc(100% / 3))), 1fr))',
    );
  });

  it('includes the gap in the numeric column cap', () => {
    render(
      <Grid columns={2} gap={4} data-testid="grid">
        <div>Item 1</div>
      </Grid>,
    );
    expect(templateColumns(screen.getByTestId('grid'))).toBe(
      'repeat(auto-fill, minmax(min(100%, max(12rem, calc((100% - 1 * var(--spacing-4)) / 2))), 1fr))',
    );
  });

  it('keeps columns={1} as the released single track', () => {
    render(
      <Grid columns={1} data-testid="grid">
        <div>Item 1</div>
      </Grid>,
    );
    expect(templateColumns(screen.getByTestId('grid'))).toBe('repeat(1, 1fr)');
  });

  it('keeps the released fixed track list with {count, isFixed: true}', () => {
    render(
      <Grid columns={{count: 7, isFixed: true}} data-testid="grid">
        <div>Mon</div>
      </Grid>,
    );
    const grid = screen.getByTestId('grid');
    // Exactly what columns={7} produced before it meant "at most 7".
    expect(templateColumns(grid)).toBe('repeat(7, 1fr)');
    expect(grid).toHaveClass('astryx-grid');
    expect(grid).toHaveAttribute('data-columns', '7');
  });

  it('keeps a fixed grid exact with gap set (no floor, no cap)', () => {
    render(
      <Grid columns={{count: 2, isFixed: true}} gap={4} data-testid="grid">
        <div>A</div>
      </Grid>,
    );
    expect(templateColumns(screen.getByTestId('grid'))).toBe('repeat(2, 1fr)');
  });

  it('treats {count, isFixed: false} like the numeric form', () => {
    render(
      <Grid columns={{count: 4, isFixed: false}} data-testid="grid">
        <div>A</div>
      </Grid>,
    );
    expect(templateColumns(screen.getByTestId('grid'))).toBe(
      'repeat(auto-fill, minmax(min(100%, max(12rem, calc(100% / 4))), 1fr))',
    );
  });

  it('server-renders the final track list and span placement (no client measurement)', () => {
    // The column count is resolved by CSS from the container width, so the
    // server HTML already carries the phone-safe template: no hook, effect,
    // or media query decides it after hydration.
    const html = renderToString(
      <Grid columns={3} gap={4}>
        <GridSpan columns={2}>Wide</GridSpan>
        <div>Item</div>
      </Grid>,
    );
    expect(html).toContain(
      'repeat(auto-fill, minmax(min(100%, max(12rem, calc((100% - 2 * var(--spacing-4)) / 3))), 1fr))',
    );
    expect(html).toContain('span 2');
    expect(html).not.toContain('grid-column:span 2');
  });

  it('rejects mixing the fixed-count and minWidth shapes at the type level', () => {
    // Checked by `tsc` (tests are in the typecheck project); rendering proves
    // the valid shapes still compile and mount.
    const valid = [
      <Grid key="a" columns={{count: 3, isFixed: true}} />,
      <Grid key="b" columns={{count: 3}} />,
      <Grid key="c" columns={{minWidth: 200, max: 3}} />,
    ];
    // @ts-expect-error count and minWidth are separate column models
    const mixedCount = <Grid columns={{count: 3, minWidth: 200}} />;
    // @ts-expect-error isFixed only applies to the count shape
    const mixedMinWidth = <Grid columns={{minWidth: 200, isFixed: true}} />;
    render(<>{valid}</>);
    expect(mixedCount).toBeTruthy();
    expect(mixedMinWidth).toBeTruthy();
  });

  it('marks only numeric "at most N" grids as span fallback hosts', () => {
    const {rerender} = render(
      <Grid columns={3} data-testid="grid">
        <div>A</div>
      </Grid>,
    );
    const cappedClass = screen.getByTestId('grid').className;
    expect(cappedClass).toContain('baseStyles.capped');

    for (const columns of [
      {count: 3, isFixed: true} as const,
      {minWidth: 200, max: 3},
      1,
      undefined,
    ]) {
      rerender(
        <Grid columns={columns} data-testid="grid">
          <div>A</div>
        </Grid>,
      );
      expect(screen.getByTestId('grid').className).not.toContain(
        'baseStyles.capped',
      );
    }
  });

  it('treats {count} without isFixed like the numeric form', () => {
    render(
      <Grid columns={{count: 3}} data-testid="grid">
        <div>Item 1</div>
      </Grid>,
    );
    expect(templateColumns(screen.getByTestId('grid'))).toBe(
      'repeat(auto-fill, minmax(min(100%, max(12rem, calc(100% / 3))), 1fr))',
    );
  });

  it('falls back to 1fr when {count} is not positive', () => {
    render(
      <Grid columns={{count: 0, isFixed: true}} data-testid="grid">
        <div>Item 1</div>
      </Grid>,
    );
    expect(templateColumns(screen.getByTestId('grid'))).toBe('1fr');
  });

  it('does not write grid-template-columns as a raw inline style (regression: inline style defeats xstyle/@media overrides)', () => {
    render(
      <Grid columns={3} rowHeight={80} data-testid="grid">
        <div>Item 1</div>
      </Grid>,
    );
    const grid = screen.getByTestId('grid');
    // The declaration must live in a class (via CSS-var indirection), never
    // as a raw inline property — inline would beat any consumer override.
    expect(grid.style.gridTemplateColumns).toBe('');
    expect(grid.style.gridAutoRows).toBe('');
    expect(templateColumns(grid)).toContain('repeat(auto-fill');
    expect(grid.style.getPropertyValue('--x-gridAutoRows')).toBe('80px');
  });

  it('renders with columns object (auto-fill default)', () => {
    render(
      <Grid columns={{minWidth: 250}} data-testid="grid">
        <div>Item 1</div>
        <div>Item 2</div>
      </Grid>,
    );
    const grid = screen.getByTestId('grid');
    expect(templateColumns(grid)).toBe('repeat(auto-fill, minmax(250px, 1fr))');
  });

  it('renders with columns object max (count capped, tracks still fill)', () => {
    render(
      <Grid columns={{minWidth: 250, max: 3}} gap={4} data-testid="grid">
        <div>Item 1</div>
        <div>Item 2</div>
        <div>Item 3</div>
      </Grid>,
    );
    const grid = screen.getByTestId('grid');
    // Cap lives on the track MIN (min(100%, max(minWidth, perColumn))); the
    // track MAX stays 1fr so present columns fill the row (a lone column on
    // mobile stretches to 100% instead of leaving dead space).
    expect(templateColumns(grid)).toBe(
      'repeat(auto-fill, minmax(min(100%, max(250px, calc((100% - 2 * var(--spacing-4)) / 3))), 1fr))',
    );
    expect(grid.style.maxWidth).toBe('');
  });

  it('keeps track max at 1fr with a max cap so a lone column can fill (#3391)', () => {
    // Regression: previously the cap was applied to the track MAX
    // (minmax(minWidth, 100%/max)), so when fewer than `max` columns fit —
    // e.g. a single column on mobile — the lone column was pinned to ~100%/max
    // and left dead space on the right. The cap now lives on the track MIN and
    // the track MAX stays 1fr, so present columns always stretch to fill.
    render(
      <Grid columns={{minWidth: 360, max: 2}} gap={4} data-testid="grid">
        <div>Left</div>
        <div>Right</div>
      </Grid>,
    );
    const grid = screen.getByTestId('grid');
    const template = templateColumns(grid);
    // Track max must be 1fr (fills), not a fraction-of-container cap.
    expect(template).toMatch(/, 1fr\)\)$/);
    expect(template).not.toMatch(/, calc\([^)]*\/ 2\)\)\)$/);
    expect(template).toBe(
      'repeat(auto-fill, minmax(min(100%, max(360px, calc((100% - 1 * var(--spacing-4)) / 2))), 1fr))',
    );
  });

  it('renders with columns object max using columnGap', () => {
    render(
      <Grid columns={{minWidth: 200, max: 4}} columnGap={6} data-testid="grid">
        <div>Item 1</div>
        <div>Item 2</div>
      </Grid>,
    );
    const grid = screen.getByTestId('grid');
    // columnGap takes precedence in the perColumn floor calculation
    expect(templateColumns(grid)).toBe(
      'repeat(auto-fill, minmax(min(100%, max(200px, calc((100% - 3 * var(--spacing-6)) / 4))), 1fr))',
    );
    expect(grid.style.maxWidth).toBe('');
  });

  it('applies gap correctly', () => {
    render(
      <Grid columns={2} gap={4} data-testid="grid">
        <div>Item 1</div>
        <div>Item 2</div>
      </Grid>,
    );
    const grid = screen.getByTestId('grid');
    expect(grid).toBeInTheDocument();
    // Gap is applied via stylex class, just verify component renders
  });

  it('applies rowGap and columnGap separately', () => {
    render(
      <Grid columns={2} rowGap={2} columnGap={6} data-testid="grid">
        <div>Item 1</div>
        <div>Item 2</div>
      </Grid>,
    );
    const grid = screen.getByTestId('grid');
    expect(grid).toBeInTheDocument();
    // Gaps are applied via stylex classes
  });

  it('applies alignment props', () => {
    render(
      <Grid columns={2} align="center" justify="start" data-testid="grid">
        <div>Item 1</div>
        <div>Item 2</div>
      </Grid>,
    );
    const grid = screen.getByTestId('grid');
    expect(grid).toBeInTheDocument();
    // Alignment is applied via stylex classes
  });

  it('defaults to 1 column when nothing specified', () => {
    render(
      <Grid data-testid="grid">
        <div>Item 1</div>
      </Grid>,
    );
    const grid = screen.getByTestId('grid');
    expect(templateColumns(grid)).toBe('1fr');
  });

  // --- P1: columns={0} guard (hardening #719) ---

  it('falls back to 1fr when columns={0}', () => {
    render(
      <Grid columns={0} data-testid="grid">
        <div>Item</div>
      </Grid>,
    );
    const grid = screen.getByTestId('grid');
    // columns={0} must not produce repeat(0, 1fr) — should fall back to default
    expect(templateColumns(grid)).toBe('1fr');
  });

  it('falls back to 1fr when columns is negative', () => {
    render(
      <Grid columns={-1} data-testid="grid">
        <div>Item</div>
      </Grid>,
    );
    const grid = screen.getByTestId('grid');
    expect(templateColumns(grid)).toBe('1fr');
  });

  it('uses auto-fill with a plain 1fr track when no max specified', () => {
    render(
      <Grid columns={{minWidth: 200}} data-testid="grid">
        <div>Item</div>
      </Grid>,
    );
    const grid = screen.getByTestId('grid');
    expect(templateColumns(grid)).toBe('repeat(auto-fill, minmax(200px, 1fr))');
    expect(grid.style.maxWidth).toBe('');
  });

  // --- P2: width/height props (hardening #719) ---

  it('applies numeric width as pixels', () => {
    render(
      <Grid columns={2} width={600} data-testid="grid">
        <div>Item</div>
      </Grid>,
    );
    const grid = screen.getByTestId('grid');
    expect(grid.style.width).toBe('600px');
  });

  it('applies string width as-is', () => {
    render(
      <Grid columns={2} width="100%" data-testid="grid">
        <div>Item</div>
      </Grid>,
    );
    const grid = screen.getByTestId('grid');
    expect(grid.style.width).toBe('100%');
  });

  it('applies numeric height as pixels', () => {
    render(
      <Grid columns={2} height={400} data-testid="grid">
        <div>Item</div>
      </Grid>,
    );
    const grid = screen.getByTestId('grid');
    expect(grid.style.height).toBe('400px');
  });

  it('applies string height as-is', () => {
    render(
      <Grid columns={2} height="50vh" data-testid="grid">
        <div>Item</div>
      </Grid>,
    );
    const grid = screen.getByTestId('grid');
    expect(grid.style.height).toBe('50vh');
  });

  // --- P2: columns object + columnGap interaction (hardening #719) ---

  it('uses columnGap var in the count-cap floor when both columnGap and gap are set', () => {
    render(
      <Grid
        columns={{minWidth: 200, max: 3}}
        gap={2}
        columnGap={6}
        data-testid="grid">
        <div>Item</div>
      </Grid>,
    );
    const grid = screen.getByTestId('grid');
    // columnGap takes precedence over gap in the perColumn floor
    expect(templateColumns(grid)).toBe(
      'repeat(auto-fill, minmax(min(100%, max(200px, calc((100% - 2 * var(--spacing-6)) / 3))), 1fr))',
    );
    expect(grid.style.maxWidth).toBe('');
  });

  it('uses gap var in the count-cap floor when columnGap is not set', () => {
    render(
      <Grid columns={{minWidth: 150, max: 2}} gap={3} data-testid="grid">
        <div>Item</div>
      </Grid>,
    );
    const grid = screen.getByTestId('grid');
    expect(templateColumns(grid)).toBe(
      'repeat(auto-fill, minmax(min(100%, max(150px, calc((100% - 1 * var(--spacing-3)) / 2))), 1fr))',
    );
    expect(grid.style.maxWidth).toBe('');
  });

  it('uses simple fraction in the count-cap floor when no gap is set', () => {
    render(
      <Grid columns={{minWidth: 100, max: 3}} data-testid="grid">
        <div>Item</div>
      </Grid>,
    );
    const grid = screen.getByTestId('grid');
    expect(templateColumns(grid)).toBe(
      'repeat(auto-fill, minmax(min(100%, max(100px, calc(100% / 3))), 1fr))',
    );
    expect(grid.style.maxWidth).toBe('');
  });

  it('forwards ref correctly', () => {
    const ref = vi.fn();
    render(
      <Grid columns={2} ref={ref}>
        <div>Item</div>
      </Grid>,
    );
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLElement));
  });

  it('passes through additional props', () => {
    render(
      <Grid columns={2} data-testid="grid" aria-label="Product grid">
        <div>Item</div>
      </Grid>,
    );
    const grid = screen.getByTestId('grid');
    expect(grid).toHaveAttribute('aria-label', 'Product grid');
  });

  it('renders children correctly', () => {
    render(
      <Grid columns={3} data-testid="grid">
        <div>Item 1</div>
        <div>Item 2</div>
        <div>Item 3</div>
      </Grid>,
    );
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
    expect(screen.getByText('Item 3')).toBeInTheDocument();
  });

  // --- columns object API ---

  it('renders with columns={{minWidth}} using auto-fill', () => {
    render(
      <Grid columns={{minWidth: 280}} data-testid="grid">
        <div>Item 1</div>
        <div>Item 2</div>
      </Grid>,
    );
    const grid = screen.getByTestId('grid');
    expect(templateColumns(grid)).toBe('repeat(auto-fill, minmax(280px, 1fr))');
  });

  it('renders with columns={{minWidth, repeat: "fit"}} using auto-fit', () => {
    render(
      <Grid columns={{minWidth: 280, repeat: 'fit'}} data-testid="grid">
        <div>Item 1</div>
        <div>Item 2</div>
      </Grid>,
    );
    const grid = screen.getByTestId('grid');
    expect(templateColumns(grid)).toBe('repeat(auto-fit, minmax(280px, 1fr))');
  });

  it('renders with columns={{minWidth, repeat: "fill"}} using auto-fill', () => {
    render(
      <Grid columns={{minWidth: 280, repeat: 'fill'}} data-testid="grid">
        <div>Item 1</div>
        <div>Item 2</div>
      </Grid>,
    );
    const grid = screen.getByTestId('grid');
    expect(templateColumns(grid)).toBe('repeat(auto-fill, minmax(280px, 1fr))');
  });

  it('renders with columns={{minWidth, max}} capping the count while filling', () => {
    render(
      <Grid columns={{minWidth: 280, max: 3}} gap={4} data-testid="grid">
        <div>Item 1</div>
        <div>Item 2</div>
      </Grid>,
    );
    const grid = screen.getByTestId('grid');
    // Count is capped via the track MIN; track MAX stays 1fr so present
    // columns fill the row (grid stays full width).
    expect(templateColumns(grid)).toBe(
      'repeat(auto-fill, minmax(min(100%, max(280px, calc((100% - 2 * var(--spacing-4)) / 3))), 1fr))',
    );
    expect(grid.style.maxWidth).toBe('');
  });

  it('renders with columns={{minWidth, max, repeat: "fit"}} using auto-fit + count cap', () => {
    render(
      <Grid
        columns={{minWidth: 280, max: 3, repeat: 'fit'}}
        gap={4}
        data-testid="grid">
        <div>Item 1</div>
        <div>Item 2</div>
      </Grid>,
    );
    const grid = screen.getByTestId('grid');
    expect(templateColumns(grid)).toBe(
      'repeat(auto-fit, minmax(min(100%, max(280px, calc((100% - 2 * var(--spacing-4)) / 3))), 1fr))',
    );
    expect(grid.style.maxWidth).toBe('');
  });
});

describe('GridSpan', () => {
  // A numeric span is a per-element variable read by a class-level
  // grid-column declaration, so the declaration can change inside the
  // parent grid's container query.
  const spanVar = (el: HTMLElement) =>
    el.style.getPropertyValue('--x---_grid-span');

  it('spans correct number of columns', () => {
    render(
      <Grid columns={4}>
        <GridSpan columns={2} data-testid="span">
          Wide item
        </GridSpan>
      </Grid>,
    );
    const span = screen.getByTestId('span');
    expect(span.style.gridColumn).toBe('');
    expect(spanVar(span)).toBe('span 2');
    expect(span.className).toContain('narrowStyles.2');
  });

  it('spans full width with columns="full"', () => {
    render(
      <Grid columns={4}>
        <GridSpan columns="full" data-testid="span">
          Full width
        </GridSpan>
      </Grid>,
    );
    const span = screen.getByTestId('span');
    expect(span.style.gridColumn).toBe('1 / -1');
  });

  it('spans correct number of rows', () => {
    render(
      <Grid columns={3}>
        <GridSpan rows={2} data-testid="span">
          Tall item
        </GridSpan>
      </Grid>,
    );
    const span = screen.getByTestId('span');
    expect(span.style.gridRow).toBe('span 2');
  });

  it('spans both columns and rows', () => {
    render(
      <Grid columns={4}>
        <GridSpan columns={2} rows={2} data-testid="span">
          2x2 item
        </GridSpan>
      </Grid>,
    );
    const span = screen.getByTestId('span');
    expect(spanVar(span)).toBe('span 2');
    expect(span.style.gridRow).toBe('span 2');
  });

  it('uses the plain span class for spans outside 2..12', () => {
    render(
      <Grid columns={3}>
        <GridSpan columns={1} data-testid="one">
          One
        </GridSpan>
        <GridSpan columns={13} data-testid="thirteen">
          Thirteen
        </GridSpan>
      </Grid>,
    );
    expect(spanVar(screen.getByTestId('one'))).toBe('span 1');
    expect(screen.getByTestId('one').className).toContain('narrowStyles.1');
    expect(spanVar(screen.getByTestId('thirteen'))).toBe('span 13');
    expect(screen.getByTestId('thirteen').className).toContain(
      'narrowStyles.1',
    );
  });

  it('lets a caller style override the span (inline wins over the class)', () => {
    render(
      <Grid columns={3}>
        <GridSpan columns={2} style={{gridColumn: '2 / 4'}} data-testid="span">
          Placed
        </GridSpan>
      </Grid>,
    );
    expect(screen.getByTestId('span').style.gridColumn).toBe('2 / 4');
  });

  it('falls back to a full row only inside a numeric grid that is too narrow for the span', () => {
    const repoRoot = path.resolve(__dirname, '../../../..');
    const compile = (file: string) => {
      const src = path.resolve(__dirname, file);
      const result = transformSync(readFileSync(src, 'utf8'), {
        babelrc: false,
        configFile: false,
        filename: src,
        presets: [
          ['@babel/preset-typescript', {isTSX: true, allExtensions: true}],
          ['@babel/preset-react', {runtime: 'automatic'}],
        ],
        plugins: [
          [
            stylexBabelPlugin,
            {
              dev: false,
              runtimeInjection: false,
              unstable_moduleResolution: {type: 'commonJS', rootDir: repoRoot},
            },
          ],
        ],
      });
      return (
        (result?.metadata as {stylex?: [string, {ltr: string}, number][]})
          ?.stylex ?? []
      ).map(([, {ltr}]) => ltr);
    };

    const spanRules = compile('GridSpan.tsx');
    // span N needs N × 12rem + (N − 1) gaps at the largest step (2.5rem)
    for (const [span, width] of [
      [2, '26.5rem'],
      [3, '41rem'],
      [12, '171.5rem'],
    ] as const) {
      expect(spanRules, `span ${span}`).toContainEqual(
        expect.stringMatching(
          new RegExp(
            `^@container astryx-grid \\(width < ${width.replace('.', '\\.')}\\)\\{.*grid-column:var\\(--_grid-span-narrow,var\\(--_grid-span\\)\\)`,
          ),
        ),
      );
    }
    expect(spanRules).toContainEqual(
      expect.stringContaining('{grid-column:var(--_grid-span)}'),
    );

    const gridRules = compile('Grid.tsx');
    // Every grid clears the fallback; only an "at most N" grid sets it, and
    // only one with a GridSpan child becomes a size container.
    expect(gridRules).toContainEqual(
      expect.stringContaining('{--_grid-span-narrow:initial}'),
    );
    expect(gridRules).toContainEqual(
      expect.stringContaining('{--_grid-span-narrow:1 / -1}'),
    );
    expect(gridRules).toContainEqual(
      expect.stringMatching(
        /:has\(> \.astryx-grid-span\)\{container-type:inline-size\}/,
      ),
    );
    expect(gridRules).toContainEqual(
      expect.stringContaining('{container-name:astryx-grid}'),
    );
  });

  it('renders without span props', () => {
    render(
      <Grid columns={3}>
        <GridSpan data-testid="span">Normal item</GridSpan>
      </Grid>,
    );
    const span = screen.getByTestId('span');
    expect(span).toBeInTheDocument();
    expect(span.style.gridColumn).toBe('');
    expect(span.style.gridRow).toBe('');
  });

  it('forwards ref correctly', () => {
    const ref = vi.fn();
    render(
      <Grid columns={2}>
        <GridSpan ref={ref}>Item</GridSpan>
      </Grid>,
    );
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLElement));
  });

  it('passes through additional props', () => {
    render(
      <Grid columns={2}>
        <GridSpan columns={2} data-testid="span" aria-label="Featured item">
          Content
        </GridSpan>
      </Grid>,
    );
    const span = screen.getByTestId('span');
    expect(span).toHaveAttribute('aria-label', 'Featured item');
  });

  it('renders children correctly', () => {
    render(
      <Grid columns={3}>
        <GridSpan columns="full">
          <span data-testid="child">Child content</span>
        </GridSpan>
      </Grid>,
    );
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });
});
