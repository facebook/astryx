// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Unit contract for the guard's logical-side padding assertion.
 * @input Padding strings, CI YAML and the real built Storybook index.
 * @output Fail-closed padding and published-owner regression tests.
 * @position Collected by the node Vitest project.
 */

import {describe, expect, it} from 'vitest';
import fs from 'node:fs';
import {createRequire} from 'node:module';
import yaml from 'yaml';
const {assertPositivePadding} = createRequire(import.meta.url)(
  './foundation-smoke.js',
);
const sides = ['inlineStart', 'inlineEnd', 'blockStart', 'blockEnd'];
const positive = Object.fromEntries(sides.map(side => [side, '8px']));

describe('foundation padding guard', () => {
  it.skipIf(
    !fs.existsSync(
      new URL('../../apps/storybook/dist/index.json', import.meta.url),
    ),
  )(
    'records a published component owner in the real Storybook index',
    async () => {
      const index = JSON.parse(
        fs.readFileSync(
          new URL('../../apps/storybook/dist/index.json', import.meta.url),
          'utf8',
        ),
      );
      const story = index.entries['core-foundationsmoke--default'];
      expect(story).toBeDefined();
      const {packageFromComponentPath} =
        await import('./visual-gate/lib/plan.mjs');
      expect(packageFromComponentPath(story.componentPath)).toBe(
        '@astryxdesign/core',
      );
    },
  );

  it('runs failure controls after the prefixed Sandbox build and retains evidence', () => {
    const ci = yaml.parse(
      fs.readFileSync(new URL('../workflows/ci.yml', import.meta.url), 'utf8'),
    );
    const steps = ci.jobs['build-sandbox'].steps;
    const index = steps.findIndex(
      step =>
        step.name === 'Verify foundation smoke screen and failure controls',
    );
    expect(index).toBeGreaterThan(
      steps.findIndex(step => step.name === 'Build Sandbox'),
    );
    expect(steps[index].if).toBeUndefined();
    expect(steps[index].run).toContain(
      'playwright install --with-deps chromium',
    );
    expect(steps[index].run).toContain(
      '--base-path "${{ steps.urls.outputs.sandbox_base_path }}"',
    );
    expect(steps[index].run).toContain(
      '--self-test --output-dir test-results/foundation-smoke',
    );
    expect(
      steps.find(step => step.name === 'Upload foundation smoke evidence'),
    ).toMatchObject({
      if: 'always()',
      with: {
        path: 'test-results/foundation-smoke/',
        'if-no-files-found': 'error',
      },
    });
    const consumer = steps.findIndex(
      step => step.name === 'Verify packed adopter foundation workflow',
    );
    expect(consumer).toBeGreaterThan(index);
    expect(steps[consumer].run).toContain(
      'foundation-consumer.mjs --output-dir test-results/foundation-consumer',
    );
    expect(steps[consumer].if).toBeUndefined();
    expect(
      steps.find(
        step => step.name === 'Upload packed adopter foundation evidence',
      ),
    ).toMatchObject({
      if: 'always()',
      with: {
        path: 'test-results/foundation-consumer/',
        'if-no-files-found': 'error',
      },
    });
  });

  it('accepts positive computed pixels without pinning theme spacing', () => {
    expect(() =>
      assertPositivePadding({...positive, inlineStart: '0.5px'}),
    ).not.toThrow();
  });
  for (const side of sides) {
    for (const value of ['0px', '', 'auto', 'var(--spacing-2)', '-1px']) {
      it(`rejects ${side}=${JSON.stringify(value)}`, () => {
        expect(() =>
          assertPositivePadding({...positive, [side]: value}),
        ).toThrow();
      });
    }
  }
});
