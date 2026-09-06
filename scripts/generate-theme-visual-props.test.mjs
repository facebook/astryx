// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Focused contract tests for scripts/generate-theme-visual-props.mjs.
 * @input The generated theme visual-props JSON and the generator output.
 * @output Vitest failures when the shipped contract loses public targets,
 *   augmentation metadata, composition-only axes, or its scrubbed shape.
 */

import {beforeAll, describe, expect, it} from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {renderThemeVisualProps} from './generate-theme-visual-props.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUTPUT = path.join(ROOT, 'packages/core/theme-visual-props.json');

let rendered;
let manifest;

beforeAll(async () => {
  rendered = await renderThemeVisualProps();
  manifest = JSON.parse(rendered);
}, 200_000);

function target(manifest, key) {
  return manifest.targets.find(t => t.key === key);
}

function prop(manifest, key, name) {
  return target(manifest, key)?.props.find(p => p.name === name);
}

describe('theme visual props generator', () => {
  it('matches the committed JSON exactly', () => {
    expect(rendered).toBe(fs.readFileSync(OUTPUT, 'utf8'));
  });

  it('ships a scrubbed public contract without source locations or commits', () => {
    expect(rendered).not.toMatch(
      /packages\/core\/src|\/home\/|"(?:line|location|commit|sourceSites|evidence)"\s*:/,
    );

    expect(manifest.schemaVersion).toBe(1);
    expect(manifest.summary.targetCount).toBeGreaterThan(250);
    expect(manifest.summary.targetPropCount).toBeGreaterThan(300);
  });

  it('keeps documented aliases, states, and open/finite domains', () => {
    expect(target(manifest, 'progressbar')?.deprecatedFor).toEqual([
      'progress-bar',
    ]);
    const state = prop(manifest, 'date-input-toggle-icon', 'state');
    expect(state).toMatchObject({role: 'state'});
    expect(state).not.toHaveProperty('domain');
    expect(prop(manifest, 'button', 'variant')).toMatchObject({
      role: 'visualProp',
      domain: {kind: 'finite'},
      augmentationInterfaces: [
        {module: '@astryxdesign/core/Button', interface: 'ButtonVariantMap'},
      ],
    });
  });

  it('has no unresolved current visual-prop domains in this snapshot', () => {
    const unresolved = manifest.targets.flatMap(target =>
      target.props
        .filter(
          prop =>
            prop.role === 'visualProp' && prop.domain?.kind === 'unresolved',
        )
        .map(prop => `${target.key}.${prop.name}`),
    );

    expect(unresolved).toEqual([]);
  });

  it('includes every public augmentation interface, including CustomTextTypes', () => {
    const interfaces = manifest.augmentationInterfaces.map(
      i => `${i.module}:${i.interface}`,
    );

    expect(interfaces).toContain('@astryxdesign/core/Button:ButtonVariantMap');
    expect(interfaces).toContain('@astryxdesign/core/Heading:HeadingTypeMap');
    expect(interfaces).toContain('@astryxdesign/core/theme:CustomTextTypes');
  });

  it('resolves composition-only documented axes through checked owner prop types', () => {
    // Timestamp documents Text-owned type/color axes while only reflecting format
    // itself at runtime. The generator must still discover the owner prop types.
    expect(prop(manifest, 'timestamp', 'type')).toMatchObject({
      role: 'visualProp',
      domain: {kind: 'finite'},
      augmentationInterfaces: [
        {module: '@astryxdesign/core/theme', interface: 'CustomTextTypes'},
      ],
    });
    expect(prop(manifest, 'timestamp', 'color')).toMatchObject({
      role: 'visualProp',
      domain: {kind: 'finite'},
      augmentationInterfaces: [
        {module: '@astryxdesign/core/Text', interface: 'TextColorMap'},
      ],
    });
  });
});
