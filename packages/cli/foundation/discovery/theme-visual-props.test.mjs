// Copyright (c) Meta Platforms, Inc. and affiliates.

import {afterEach, describe, expect, it} from 'vitest';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import {fileURLToPath} from 'node:url';
import {
  finiteVisualPropValues,
  indexThemeVisualPropsContract,
  loadThemeVisualPropsContract,
  parseThemeVisualPropsContract,
  ThemeVisualPropsContractError,
  visualPropAcceptsValue,
} from './theme-visual-props.mjs';

const ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../../..',
);
const tempDirs = [];

function tempCore() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'astryx-visual-props-'));
  tempDirs.push(dir);
  return dir;
}

afterEach(() => {
  for (const dir of tempDirs.splice(0)) {
    fs.rmSync(dir, {recursive: true, force: true});
  }
});

describe('theme visual-prop contract', () => {
  it('loads and indexes the generated Core contract', () => {
    const contract = loadThemeVisualPropsContract(
      path.join(ROOT, 'packages/core'),
    );
    expect(contract).not.toBeNull();
    const index = indexThemeVisualPropsContract(contract);

    const avatarSize = index.get('avatar-group')?.props.get('size');
    expect(finiteVisualPropValues(avatarSize)).toEqual([
      'lg',
      'md',
      'sm',
      'xl',
      'xsm',
      '16',
      '20',
      '24',
      '32',
      '36',
      '40',
      '48',
      '60',
      '64',
      '72',
      '96',
      '128',
      '144',
      '180',
    ]);
    expect(
      index.get('button')?.props.get('variant')?.augmentationInterfaces,
    ).toContainEqual({
      module: '@astryxdesign/core/Button',
      interface: 'ButtonVariantMap',
      currentKeys: ['destructive', 'ghost', 'primary', 'secondary'],
    });
  });

  it('preserves finite sentinels beside an open numeric domain', () => {
    const contract = loadThemeVisualPropsContract(
      path.join(ROOT, 'packages/core'),
    );
    const index = indexThemeVisualPropsContract(contract);
    const columns = index.get('metadata-list')?.props.get('columns');

    expect(columns).toMatchObject({
      role: 'visualProp',
      domain: {
        kind: 'open',
        primitives: ['number'],
        knownLiterals: {strings: ['multi', 'single'], numbers: []},
      },
    });
    expect(visualPropAcceptsValue(columns, 'multi')).toBe(true);
    expect(visualPropAcceptsValue(columns, '3')).toBe(true);
    expect(visualPropAcceptsValue(columns, '0.5')).toBe(true);
    expect(visualPropAcceptsValue(columns, '-1.5')).toBe(true);
    expect(visualPropAcceptsValue(columns, '03')).toBe(false);
    expect(visualPropAcceptsValue(columns, '+3')).toBe(false);
    expect(visualPropAcceptsValue(columns, '0x10')).toBe(false);
    expect(visualPropAcceptsValue(columns, 'arbitrary')).toBe(false);

    const language = index.get('code-block')?.props.get('language');
    expect(visualPropAcceptsValue(language, 'objective-c')).toBe(true);
    expect(visualPropAcceptsValue(language, 'objective.c')).toBe(true);
    expect(visualPropAcceptsValue(language, 'objective c')).toBe(false);
    expect(visualPropAcceptsValue(language, 'rust+go')).toBe(false);
  });

  it('returns null for a missing or unsupported contract', () => {
    expect(loadThemeVisualPropsContract(tempCore())).toBeNull();
    expect(
      parseThemeVisualPropsContract({schemaVersion: 99, targets: []}),
    ).toBeNull();
  });

  it('rejects malformed supported contracts', () => {
    expect(() =>
      parseThemeVisualPropsContract({
        schemaVersion: 1,
        packageName: '@astryxdesign/core',
        targets: [{key: 'button', className: 'astryx-button', components: []}],
      }),
    ).toThrow(ThemeVisualPropsContractError);
  });

  it('rejects malformed consumed metadata inside schema v1', () => {
    const base = {
      schemaVersion: 1,
      packageName: '@astryxdesign/core',
      targets: [
        {
          key: 'button',
          className: 'astryx-button',
          components: ['Button'],
          props: [
            {
              name: 'variant',
              role: 'visualProp',
              domain: {
                kind: 'open',
                primitives: ['number'],
                knownLiterals: {strings: [], numbers: ['not-a-number']},
              },
            },
          ],
        },
      ],
    };
    expect(() => parseThemeVisualPropsContract(base)).toThrow(
      'array of finite numbers',
    );

    base.targets[0].props[0] = {
      name: 'variant',
      role: 'visualProp',
      domain: {kind: 'finite', values: {strings: ['primary'], numbers: []}},
      augmentationInterfaces: [{}],
    };
    expect(() => parseThemeVisualPropsContract(base)).toThrow(
      'must be a non-empty string',
    );

    base.targets[0].props[0] = {
      name: 'variant',
      role: 'visualProp',
      domain: {kind: 'finite', values: {strings: ['rust+go'], numbers: []}},
    };
    expect(() => parseThemeVisualPropsContract(base)).toThrow(
      'unrepresentable selector value',
    );
  });

  it('rejects duplicate target and prop keys', () => {
    const target = {
      key: 'button',
      className: 'astryx-button',
      components: ['Button'],
      props: [],
    };
    expect(() =>
      parseThemeVisualPropsContract({
        schemaVersion: 1,
        packageName: '@astryxdesign/core',
        targets: [target, target],
      }),
    ).toThrow('Duplicate target key');

    expect(() =>
      parseThemeVisualPropsContract({
        schemaVersion: 1,
        packageName: '@astryxdesign/core',
        targets: [
          {
            ...target,
            props: [
              {name: 'size', role: 'state'},
              {name: 'size', role: 'state'},
            ],
          },
        ],
      }),
    ).toThrow('Duplicate prop');
  });
});
