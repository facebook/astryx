// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Wiring tests for the component detail page.
 *
 * The `component-detail/` directory holds the internal building blocks of a
 * single page. Unlike `app/`, it contains no Next.js route entry points and no
 * script-consumed modules, so every module in it must be reachable from the
 * router — a renderer nothing on the page reaches is dead code, and the data it
 * was written to display silently never reaches the page.
 *
 * Run: pnpm -F @astryxdesign/docsite test
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {fileURLToPath} from 'node:url';
import {describe, it, expect} from 'vitest';
import {components} from '../generated/componentRegistry';

const SRC_DIR = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
);
const DETAIL_DIR = path.join(SRC_DIR, 'components/component-detail');
const APP_DIR = path.join(SRC_DIR, 'app');
const EXTENSIONS = ['.ts', '.tsx'];

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, out);
    } else if (EXTENSIONS.includes(path.extname(entry.name))) {
      out.push(full);
    }
  }
  return out;
}

/**
 * Resolve a relative import specifier the way the bundler does, so a match is
 * an actual module reference rather than a name that happens to appear in the
 * source. Package specifiers are skipped — `@astryxdesign/core/Section` must
 * not count as an import of a local `Section.tsx`.
 */
function resolveRelative(fromFile: string, specifier: string): string | null {
  if (!specifier.startsWith('.')) {
    return null;
  }
  const base = path.resolve(path.dirname(fromFile), specifier);
  const candidates = [
    base,
    ...EXTENSIONS.map(ext => base + ext),
    ...EXTENSIONS.map(ext => path.join(base, `index${ext}`)),
  ];
  for (const candidate of candidates) {
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
      return candidate;
    }
  }
  return null;
}

const SPECIFIER_RE = /(?:from\s*|import\(\s*|require\(\s*)['"]([^'"]+)['"]/g;

/**
 * Walk the relative-import graph out from `entries`, returning every file
 * reachable from one of them.
 *
 * Reachability, not "somebody imports it": a renderer imported only by its own
 * unit test — or only by another module the page never reaches — is still dark
 * on the page, and a guard that counted those importers would pass on it.
 */
function collectReachable(entries: string[]): Set<string> {
  const reachable = new Set<string>(entries);
  const queue = [...entries];
  while (queue.length > 0) {
    const file = queue.pop()!;
    const source = fs.readFileSync(file, 'utf8');
    for (const match of source.matchAll(SPECIFIER_RE)) {
      const resolved = resolveRelative(file, match[1]);
      if (resolved !== null && !reachable.has(resolved)) {
        reachable.add(resolved);
        queue.push(resolved);
      }
    }
  }
  return reachable;
}

describe('component detail wiring', () => {
  it('reaches every module in component-detail/ from a page', () => {
    const detailModules = walk(DETAIL_DIR).filter(
      file => !file.includes('.test.'),
    );
    // Guard against a vacuous pass if the directory is ever moved or renamed.
    expect(detailModules.length).toBeGreaterThan(5);

    // The Next.js router loads `app/`; everything else in `src/` is only code
    // that something under `app/` pulls in.
    const entries = walk(APP_DIR);
    expect(entries.length).toBeGreaterThan(5);

    const reachable = collectReachable(entries);
    const orphans = detailModules
      .filter(file => !reachable.has(file))
      .map(file => path.relative(SRC_DIR, file))
      .sort();

    expect(orphans).toEqual([]);
  });

  it('carries anatomy data for components that author it', () => {
    const withAnatomy = Object.values(components)
      .flat()
      .filter(entry => (entry.usage?.anatomy?.length ?? 0) > 0);

    // The renderer is only worth wiring if the generated registry actually
    // carries the data; this fails if generate-data.mjs ever drops `anatomy`
    // from the `usage` block it passes through.
    expect(withAnatomy.length).toBeGreaterThan(0);

    for (const entry of withAnatomy) {
      for (const element of entry.usage!.anatomy!) {
        expect(typeof element.name).toBe('string');
        expect(element.name.length).toBeGreaterThan(0);
        expect(typeof element.description).toBe('string');
      }
    }
  });
  it('carries component accessibility requirements into the registry', () => {
    const button = Object.values(components)
      .flat()
      .find(entry => entry.name === 'Button');

    expect(button?.usage?.accessibility?.length).toBeGreaterThan(0);
    expect(button?.usage?.accessibility?.[0]).toMatchObject({
      category: 'Color contrast',
      requirement: '4.5:1',
    });
    const neutralCoverage = button?.usage?.accessibilityThemeCoverage?.[0];
    expect(neutralCoverage?.theme).toBe('Neutral');
    expect(neutralCoverage?.tables).toHaveLength(1);
    expect(neutralCoverage?.tables[0]?.modes.map(mode => mode.mode)).toEqual([
      'Light',
      'Dark',
    ]);
    expect(neutralCoverage?.tables[0]?.modes[0]?.results[0]).toMatchObject({
      name: 'Primary',
      status: 'Pass',
    });
    expect(neutralCoverage?.tables[0]?.modes[1]?.results[0]).toMatchObject({
      name: 'Primary',
      status: 'Fail',
    });
    expect(
      neutralCoverage?.tables[0]?.modes[1]?.results[0]?.measurements,
    ).toContainEqual(
      expect.objectContaining({
        label: 'Badges',
        status: 'Fail',
      }),
    );
    const badgeBreakdown =
      neutralCoverage?.tables[0]?.modes[1]?.results[0]?.measurements.find(
        measurement => measurement.label === 'Badges',
      )?.breakdown;
    expect(badgeBreakdown).toHaveLength(14);
    expect(badgeBreakdown?.[0]).toMatchObject({
      label: 'Neutral',
      value: '1.08:1',
      detail: 'Rest state · Page background',
      status: 'Fail',
      colorPair: {
        foreground: '#e5e5e5',
        background: '#ededed',
      },
    });
    expect(button?.usage?.accessibility).toContainEqual(
      expect.objectContaining({
        name: 'Badge text',
        requirement: '4.5:1',
      }),
    );
    expect(
      neutralCoverage?.tables[0]?.modes[1]?.results[0]?.measurements,
    ).toContainEqual(
      expect.objectContaining({
        label: 'Badges',
        value: '4 of 14 badge colors pass',
      }),
    );
    const badgeSummary =
      neutralCoverage?.tables[0]?.modes[1]?.results[0]?.measurements.find(
        measurement => measurement.label === 'Badges',
      );
    expect(badgeSummary?.detail).toBeUndefined();
    expect(badgeSummary?.colorPair).toBeUndefined();
  });

  it('renders accessibility metadata in a dedicated tab', () => {
    const source = fs.readFileSync(
      path.join(DETAIL_DIR, 'ComponentDetailClient.tsx'),
      'utf8',
    );

    expect(source).toContain(
      '<Tab value="accessibility" label="Accessibility" />',
    );
    expect(source).toContain('themeCoverage={accessibilityThemeCoverage}');
    expect(source).toContain('componentName={comp.name}');

    const accessibilitySource = fs.readFileSync(
      path.join(DETAIL_DIR, 'Accessibility.tsx'),
      'utf8',
    );
    expect(accessibilitySource).toContain(
      '`${componentName} ${themeName} theme ${mode.mode} mode contrast results`',
    );
    expect(accessibilitySource).not.toContain(
      'Neutral Button contrast results',
    );
  });

  it('supports accessibility guidance across button-like components', () => {
    const entries = Object.values(components).flat();
    for (const name of [
      'IconButton',
      'ToggleButton',
      'ButtonGroup',
      'SegmentedControl',
    ]) {
      const component = entries.find(entry => entry.name === name);
      expect(component?.usage?.accessibility?.length).toBeGreaterThan(0);
      expect(component?.usage?.accessibility).toContainEqual(
        expect.objectContaining({category: 'Color contrast'}),
      );
    }
  });

  it('carries theme audit intent and supports measurement applicability', () => {
    const entries = Object.values(components).flat();
    const findMeasurement = (componentName: string, label: string) =>
      entries
        .find(entry => entry.name === componentName)
        ?.usage?.accessibilityThemeCoverage?.[0]?.tables[0]?.modes.flatMap(
          mode => mode.results.flatMap(result => result.measurements),
        )
        .find(measurement => measurement.label === label);

    expect(findMeasurement('ButtonGroup', 'Divider')).toBeUndefined();
    expect(
      entries.find(entry => entry.name === 'ButtonGroup')?.usage
        ?.accessibilityThemeCoverage?.[0]?.notMeasured,
    ).toContain('Divider — Decorative in Neutral.');
    expect(findMeasurement('ToggleButton', 'Selected surface')).toBeUndefined();
    expect(
      entries.find(entry => entry.name === 'ToggleButton')?.usage
        ?.accessibilityThemeCoverage?.[0]?.notMeasured,
    ).toContain(
      'Selected background — Supplemental because label weight and optional icon changes also show selection.',
    );
    expect(
      findMeasurement('SegmentedControl', 'Selected surface'),
    ).toBeUndefined();
    expect(
      entries.find(entry => entry.name === 'SegmentedControl')?.usage
        ?.accessibilityThemeCoverage?.[0]?.notMeasured,
    ).toContain(
      'Selected background — Supplemental because label color and weight also show selection.',
    );

    const source = fs.readFileSync(
      path.join(DETAIL_DIR, 'Accessibility.tsx'),
      'utf8',
    );
    expect(source).toContain('measurement.applicability');
    expect(source).toContain("join(' · ')");
    expect(source).toContain('under Not measured do not affect Pass or Fail.');
    expect(source).toContain('<Heading level={4}>Not measured</Heading>');
    expect(source).toContain('badge results');
  });

  it('uses clear pressable-control contrast terminology', () => {
    const entries = Object.values(components).flat();
    for (const name of ['Button', 'IconButton', 'ButtonGroup']) {
      const component = entries.find(entry => entry.name === name);
      const labels =
        component?.usage?.accessibilityThemeCoverage?.flatMap(coverage =>
          coverage.tables.flatMap(table =>
            table.modes.flatMap(mode =>
              mode.results.flatMap(result =>
                result.measurements.map(measurement => measurement.label),
              ),
            ),
          ),
        ) ?? [];
      expect(labels).toContain('Pointer down');
      expect(labels).not.toContain('Pressed');
    }

    for (const name of [
      'Button',
      'IconButton',
      'ToggleButton',
      'ButtonGroup',
    ]) {
      const component = entries.find(entry => entry.name === name);
      expect(component?.usage?.accessibility).toContainEqual(
        expect.objectContaining({name: 'Essential icon or spinner arc'}),
      );
    }

    const button = entries.find(entry => entry.name === 'Button');
    const breakdown =
      button?.usage?.accessibilityThemeCoverage?.[0]?.tables[0]?.modes[1]?.results[1]?.measurements.find(
        measurement => measurement.label === 'Badges',
      )?.breakdown;
    expect(breakdown).toContainEqual(
      expect.objectContaining({
        detail: 'Pointer down state · Surface background',
      }),
    );
    expect(
      button?.usage?.accessibilityThemeCoverage?.[0]?.tables[0]?.modes[1]?.results[0]?.measurements.find(
        measurement => measurement.label === 'Badges',
      )?.breakdown?.[0]?.detail,
    ).toBe('Rest state · Page background');
  });

  it('documents spinner arc coverage without measuring the decorative track', () => {
    const entries = Object.values(components).flat();
    const note = 'Spinner track — Decorative. The moving arc must meet 3:1.';

    for (const name of [
      'Button',
      'IconButton',
      'ToggleButton',
      'ButtonGroup',
    ]) {
      const coverage = entries.find(entry => entry.name === name)?.usage
        ?.accessibilityThemeCoverage?.[0];
      expect(coverage?.notMeasured).toContain(note);
      const labels =
        coverage?.tables.flatMap(table =>
          table.modes.flatMap(mode =>
            mode.results.flatMap(result =>
              result.measurements.map(measurement => measurement.label),
            ),
          ),
        ) ?? [];
      expect(labels).toContain('Spinner arc');
      expect(labels).not.toContain('Spinner');
    }

    expect(
      entries.find(entry => entry.name === 'SegmentedControl')?.usage
        ?.accessibilityThemeCoverage?.[0]?.notMeasured,
    ).not.toContain(note);
  });
});
