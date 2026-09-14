// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Optional integration proof for filesystems that reject hard links.
 * Set ASTRYX_HARDLINK_UNAVAILABLE_TEST_ROOT to a writable directory on such a
 * filesystem to exercise the real fallback end to end.
 */

import {describe, it, expect, beforeEach, afterEach} from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import {applyWrites} from '../../api/integration/add-helpers.mjs';

const testRoot = process.env.ASTRYX_HARDLINK_UNAVAILABLE_TEST_ROOT ?? null;

describe.skipIf(!testRoot)(
  'hard-link-unavailable filesystem integration proof',
  () => {
    let testDir;

    beforeEach(() => {
      testDir = fs.mkdtempSync(path.join(testRoot, '.astryx-publish-proof-'));
    });

    afterEach(() => {
      fs.rmSync(testDir, {recursive: true, force: true});
    });

    it('confirms the configured filesystem rejects hard links', () => {
      const source = path.join(testDir, '.tmp-source');
      const destination = path.join(testDir, '.tmp-destination');
      fs.writeFileSync(source, 'link-test');

      expect(() => fs.linkSync(source, destination)).toThrow(
        expect.objectContaining({code: expect.stringMatching(/^(EPERM|EXDEV)$/)}),
      );
    });

    it('applyWrites creates files through the fallback', () => {
      const plans = [
        {
          path: path.join(testDir, 'MyComponent.tsx'),
          contents: '// MyComponent\nexport default function MyComponent() {}\n',
          createOnly: true,
        },
        {
          path: path.join(testDir, 'MyComponent.test.tsx'),
          contents: '// test\nimport MyComponent from "./MyComponent";\n',
          createOnly: true,
        },
      ];

      const rollback = applyWrites(plans);
      expect(typeof rollback).toBe('function');
      expect(fs.readFileSync(plans[0].path, 'utf-8')).toContain('MyComponent');
      expect(fs.readFileSync(plans[1].path, 'utf-8')).toContain('test');
    });

    it('applyWrites preserves no-clobber behavior', () => {
      const target = path.join(testDir, 'existing.tsx');
      fs.writeFileSync(target, '// original\n');

      expect(() =>
        applyWrites([
          {
            path: target,
            contents: '// replacement\n',
            createOnly: true,
          },
        ]),
      ).toThrow(/overwrite|exists/i);
      expect(fs.readFileSync(target, 'utf-8')).toBe('// original\n');
    });

    it('applyWrites rolls back partial publication', () => {
      const good = path.join(testDir, 'good.tsx');
      const bad = path.join(testDir, 'bad.tsx');
      fs.writeFileSync(bad, '// preexisting\n');

      expect(() =>
        applyWrites([
          {path: good, contents: '// good file\n', createOnly: true},
          {path: bad, contents: '// replacement\n', createOnly: true},
        ]),
      ).toThrow();
      expect(fs.existsSync(good)).toBe(false);
      expect(fs.readFileSync(bad, 'utf-8')).toBe('// preexisting\n');
    });

    it('applyWrites keeps compare-and-swap replacement behavior', () => {
      const target = path.join(testDir, 'config.json');
      const original = '{"version": 1}\n';
      fs.writeFileSync(target, original);

      const rollback = applyWrites([
        {
          path: target,
          contents: '{"version": 2}\n',
          createOnly: false,
          expectedOriginal: Buffer.from(original),
        },
      ]);
      expect(typeof rollback).toBe('function');
      expect(fs.readFileSync(target, 'utf-8')).toBe('{"version": 2}\n');
    });
  },
);
