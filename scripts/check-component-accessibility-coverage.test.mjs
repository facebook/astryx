// Copyright (c) Meta Platforms, Inc. and affiliates.

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {describe, expect, it} from 'vitest';
import * as generatedCoverage from '../packages/core/src/accessibility/generatedThemeCoverage.mjs';
import {neutralTheme} from '../packages/themes/neutral/src/neutralTheme.ts';
import {
  compositeColor,
  createTokenResolver,
  resultStatus,
} from './accessibility/contrast-audit-engine.mjs';
import {
  buildPressableControlsAccessibilityThemeCoverage,
  getPressableControlsAuditContract,
  pressableControlsAuditModule,
  pressableControlsAuditProfiles,
  pressableControlsSource,
} from './accessibility/pressable-controls-audit-module.mjs';
import {
  buildRegisteredAccessibilityCoverage,
  componentAccessibilityAuditModules,
} from './accessibility/component-audit-registry.mjs';
import {
  renderGeneratedSource,
  runGenerator,
} from './generate-component-accessibility-coverage.mjs';

const docsByComponent = Object.fromEntries(
  await Promise.all(
    pressableControlsAuditModule.components.map(async component => [
      component.name,
      (await import(component.docsUrl.href)).docs,
    ]),
  ),
);

const generatedByComponent = Object.fromEntries(
  pressableControlsAuditModule.components.map(component => [
    component.name,
    generatedCoverage[component.exportName],
  ]),
);

function measurementsFor(coverage) {
  return coverage.flatMap(theme =>
    theme.tables.flatMap(table =>
      table.modes.flatMap(mode =>
        mode.results.flatMap(result => result.measurements),
      ),
    ),
  );
}

describe('contrast audit engine', () => {
  it('resolves semantic tokens, modes, local values, and fallbacks', () => {
    const resolve = createTokenResolver({
      tokens: {
        '--semantic': 'light-dark(var(--light), var(--dark))',
        '--light': '#fff',
        '--dark': 'rgba(0, 0, 0, 0.5)',
      },
    });
    expect(resolve('var(--semantic)', 0)).toBe('#fff');
    expect(resolve('var(--semantic)', 1)).toBe('rgba(0, 0, 0, 0.5)');
    expect(resolve('var(--local, #123456)', 0, {'--local': '#abcdef'})).toBe(
      '#abcdef',
    );
    expect(resolve('var(--missing, #123456)', 0)).toBe('#123456');
  });

  it('composites alpha colors in paint order', () => {
    expect(compositeColor('#fff8', '#000000')).toBe('#888888');
    expect(compositeColor('rgba(255, 255, 255, 0.5)', '#000000')).toBe(
      '#808080',
    );
    const surface = compositeColor('#ffffff1a', '#1b1b1b');
    expect(surface).toBe('#323232');
    expect(compositeColor('#0000001a', surface)).toBe('#2d2d2d');
  });
});

describe('registered component accessibility coverage', () => {
  it('matches every registered module and component document', async () => {
    const calculated = buildRegisteredAccessibilityCoverage();
    expect(Object.keys(generatedCoverage).sort()).toEqual(
      Object.keys(calculated).sort(),
    );

    for (const module of componentAccessibilityAuditModules) {
      const moduleCoverage = module.buildCoverage();
      for (const component of module.components) {
        expect(generatedCoverage[component.exportName]).toEqual(
          moduleCoverage[component.name],
        );
        const {docs} = await import(component.docsUrl.href);
        expect(docs.usage.accessibilityThemeCoverage).toBe(
          generatedCoverage[component.exportName],
        );
      }
    }
  });

  it('rejects duplicate modules and malformed generated exports', () => {
    const module = {
      id: 'example',
      components: [{name: 'Button', exportName: 'buttonCoverage'}],
      buildCoverage: () => ({Button: []}),
    };
    expect(() =>
      buildRegisteredAccessibilityCoverage([module, module]),
    ).toThrow('Duplicate accessibility audit module example');
    expect(() =>
      buildRegisteredAccessibilityCoverage([
        {
          ...module,
          components: [{name: 'Button', exportName: 'not-valid'}],
        },
      ]),
    ).toThrow('Invalid accessibility coverage export not-valid');
  });

  it('renders deterministically and checks generated files without import side effects', async () => {
    const directory = fs.mkdtempSync(
      path.join(os.tmpdir(), 'astryx-accessibility-coverage-'),
    );
    const output = path.join(directory, 'coverage.mjs');
    const coverage = {
      zebraCoverage: [{theme: 'Zebra', tables: []}],
      alphaCoverage: [{theme: 'Alpha', tables: []}],
    };
    const stdout = {write: () => {}};
    const stderr = {write: () => {}};
    try {
      const source = renderGeneratedSource(coverage);
      expect(source.indexOf('alphaCoverage')).toBeLessThan(
        source.indexOf('zebraCoverage'),
      );
      expect(source).toContain('// AUTO-GENERATED — do not edit manually.');
      expect(await runGenerator([], {coverage, output, stdout, stderr})).toBe(
        0,
      );
      expect(
        await runGenerator(['--check'], {coverage, output, stdout, stderr}),
      ).toBe(0);
      fs.writeFileSync(output, 'stale\n');
      expect(
        await runGenerator(['--check'], {coverage, output, stdout, stderr}),
      ).toBe(1);
      expect(await runGenerator(['--unknown'], {output, stdout, stderr})).toBe(
        2,
      );
    } finally {
      fs.rmSync(directory, {recursive: true, force: true});
    }
  });
});

describe('Pressable controls audit module', () => {
  const calculated = buildPressableControlsAccessibilityThemeCoverage();

  it('keeps representative rendered results stable', () => {
    const buttonLight = calculated.Button[0].tables[0].modes[0];
    const primary = buttonLight.results.find(
      result => result.name === 'Primary',
    );
    const destructive = buttonLight.results.find(
      result => result.name === 'Destructive',
    );
    expect(primary.measurements).toContainEqual(
      expect.objectContaining({label: 'Rest', value: '15.13:1'}),
    );
    expect(destructive.measurements).toContainEqual(
      expect.objectContaining({
        label: 'Pointer down',
        value: '5.36:1',
      }),
    );
    const secondaryBadges = buttonLight.results
      .find(result => result.name === 'Secondary')
      .measurements.find(measurement => measurement.label === 'Badges');
    expect(secondaryBadges.breakdown).toContainEqual(
      expect.objectContaining({
        label: 'Neutral',
        value: '11.68:1',
        colorPair: {foreground: '#262626', background: '#e2e2e2'},
      }),
    );
    const destructiveBadges = destructive.measurements.find(
      measurement => measurement.label === 'Badges',
    );
    expect(destructiveBadges.breakdown).toContainEqual(
      expect.objectContaining({
        label: 'Red',
        value: '6.65:1',
        colorPair: {foreground: '#8a0011', background: '#ffc4be'},
      }),
    );
    expect(destructiveBadges.breakdown).toContainEqual(
      expect.objectContaining({
        label: 'Orange',
        value: '6.43:1',
        colorPair: {foreground: '#733100', background: '#ffc7a1'},
      }),
    );

    const buttonDark = calculated.Button[0].tables[0].modes[1];
    for (const result of buttonDark.results) {
      expect(result.measurements).toContainEqual(
        expect.objectContaining({
          label: 'Badges',
          value: '14 of 14 badge colors pass',
        }),
      );
    }

    const segmentedDark = calculated.SegmentedControl[0].tables[0].modes[1];
    const unselected = segmentedDark.results.find(
      result => result.name === 'Unselected',
    );
    expect(unselected.measurements).toContainEqual(
      expect.objectContaining({label: 'Rest', value: '4.12:1', status: 'Fail'}),
    );
    expect(unselected.measurements).toContainEqual(
      expect.objectContaining({
        label: 'Hover',
        value: '3.52:1',
        status: 'Fail',
      }),
    );
  });

  it('covers every declared Button and Badge variant', () => {
    const contract = getPressableControlsAuditContract();
    expect(contract.buttonVariants).toEqual(contract.expectedButtonVariants);
    expect(contract.badgeVariants).toEqual(contract.expectedBadgeVariants);
    expect(contract.badgeVariants).toHaveLength(14);
    expect(contract.badgeCombinationCount).toBe(336);
  });

  it('keeps profiles tied to the rendered component contracts', () => {
    expect(pressableControlsSource.Button).toContain(
      'interactionOverlayStyles.backgroundImage',
    );
    expect(pressableControlsSource.Button).toContain(
      'visuallyDisabled && styles.disabled',
    );
    expect(pressableControlsSource.IconButton).toContain('<Button {...props}');
    expect(pressableControlsSource.IconButton).toContain('isIconOnly');
    expect(pressableControlsSource.ToggleButton).toContain('variant="ghost"');
    expect(pressableControlsSource.ToggleButton).toContain(
      "default: colorVars['--color-overlay-pressed']",
    );
    expect(pressableControlsSource.ToggleButton).toContain('isInterruptible');
    expect(pressableControlsSource.ButtonGroup).toContain(
      "borderInlineStartColor: colorVars['--color-border']",
    );
    expect(pressableControlsSource.SegmentedControl).toContain(
      "backgroundColor: colorVars['--color-neutral']",
    );
    expect(pressableControlsSource.SegmentedControlItem).toContain(
      "color: colorVars['--color-text-secondary']",
    );
    expect(pressableControlsSource.SegmentedControlItem).toContain(
      "'@media (hover: hover)': colorVars['--color-overlay-hover']",
    );
    expect(neutralTheme.components?.['button-group']).toBeUndefined();
    expect(
      Object.keys(neutralTheme.components?.['toggle-button'] ?? {}),
    ).toEqual([]);
    expect(
      Object.keys(neutralTheme.components?.['segmented-control'] ?? {}),
    ).toEqual(['base']);
    expect(
      Object.keys(neutralTheme.components?.['segmented-control-item'] ?? {}),
    ).toEqual(['size:sm', 'size:md', 'size:lg', 'selected']);
  });

  it('derives every row status from required measurements', () => {
    for (const coverage of Object.values(generatedByComponent)) {
      for (const theme of coverage) {
        for (const table of theme.tables) {
          for (const mode of table.modes) {
            for (const result of mode.results) {
              expect(result.status).toBe(resultStatus(result.measurements));
            }
          }
        }
      }
    }
    expect(
      resultStatus([
        {status: 'Fail', applicability: 'Conditional'},
        {status: 'Fail', applicability: 'Supplemental'},
        {status: 'Fail', applicability: 'Decorative'},
      ]),
    ).toBe('Pass');
  });

  it('keeps theme intent in profiles and out of measured columns', () => {
    expect(
      pressableControlsAuditProfiles.ButtonGroup.theme.notMeasured,
    ).toContain('Divider — Decorative in Neutral.');
    expect(
      measurementsFor(generatedByComponent.ButtonGroup).map(item => item.label),
    ).not.toContain('Divider');

    for (const component of ['ToggleButton', 'SegmentedControl']) {
      expect(
        pressableControlsAuditProfiles[component].theme.notMeasured,
      ).toContainEqual(
        expect.stringContaining('Selected background — Supplemental'),
      );
      expect(
        measurementsFor(generatedByComponent[component]).map(
          item => item.label,
        ),
      ).not.toContain('Selected surface');
    }

    for (const component of [
      'Button',
      'IconButton',
      'ToggleButton',
      'ButtonGroup',
    ]) {
      expect(
        pressableControlsAuditProfiles[component].theme.notMeasured,
      ).toContain('Spinner track — Decorative. The moving arc must meet 3:1.');
      const labels = measurementsFor(generatedByComponent[component]).map(
        item => item.label,
      );
      expect(labels).toContain('Spinner arc');
      expect(labels).not.toContain('Spinner');
    }
  });

  it('keeps published terms and Badge context clear', () => {
    for (const docs of Object.values(docsByComponent)) {
      const requirements = docs.usage.accessibility ?? [];
      expect(requirements).toContainEqual(
        expect.objectContaining({
          name: 'Disabled appearance',
          description:
            'Disabled controls do not need to meet these contrast ratios.',
        }),
      );
      expect(requirements.flatMap(item => item.states ?? [])).not.toContain(
        'Pressed',
      );
    }

    for (const component of [
      'Button',
      'IconButton',
      'ToggleButton',
      'ButtonGroup',
    ]) {
      expect(docsByComponent[component].usage.accessibility).toContainEqual(
        expect.objectContaining({name: 'Essential icon or spinner arc'}),
      );
    }

    const badgeBreakdowns = measurementsFor(
      generatedByComponent.Button,
    ).flatMap(measurement => measurement.breakdown ?? []);
    expect(badgeBreakdowns).toContainEqual(
      expect.objectContaining({detail: 'Rest state · Page background'}),
    );
    expect(badgeBreakdowns).not.toContainEqual(
      expect.objectContaining({detail: expect.stringContaining('Surface')}),
    );
    expect(badgeBreakdowns).not.toContainEqual(
      expect.objectContaining({detail: expect.stringContaining('Body')}),
    );
  });
});
