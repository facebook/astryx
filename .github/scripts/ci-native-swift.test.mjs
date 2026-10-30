// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Routing contract for the native Swift coverage in the broad CI lane.
 *
 * The Swift packages of @astryxdesign/native build only on macOS. They join
 * the `test` owner (AST-030 FR11), but a macOS runner is requested only when
 * a Linux job finds a Swift change under packages/native, or a change to the
 * lane's own script, so no other pull request waits for one.
 */

import fs from 'node:fs';
import path from 'node:path';

import {describe, expect, it} from 'vitest';
import yaml from 'yaml';

const root = path.resolve(import.meta.dirname, '../..');
const ci = yaml.parse(
  fs.readFileSync(path.join(root, '.github/workflows/ci.yml'), 'utf8'),
);
const scope = ci.jobs['native-swift-scope'];
const swift = ci.jobs['test-native-swift'];
const step = (job, name) =>
  job.steps.find(candidate => candidate.name === name);

describe('native Swift routing', () => {
  it('is joined by test', () => {
    expect(ci.jobs.test.needs).toContain('test-native-swift');
    expect(
      step(ci.jobs.test, 'Require expected test-owner outcomes').env,
    ).toMatchObject({
      TEST_NATIVE_SWIFT_RESULT: '${{ needs.test-native-swift.result }}',
    });
  });

  it('decides scope on Linux and asks for macOS only when Swift changed', () => {
    expect(scope['runs-on']).toBe('ubuntu-slim');
    expect(swift.needs).toEqual(['check-scope', 'native-swift-scope']);
    expect(swift['runs-on']).toBe(
      "${{ needs.native-swift-scope.outputs.applies == 'true' && 'macos-15' || 'ubuntu-slim' }}",
    );
    for (const candidate of swift.steps) {
      if (candidate.uses || candidate.name?.startsWith('Build and test')) {
        expect(candidate.if, candidate.name ?? candidate.uses).toBe(
          "needs.native-swift-scope.outputs.applies == 'true'",
        );
      }
    }
  });

  it('fails closed when the scope cannot be decided', () => {
    expect(step(scope, 'Require successful scope classification').if).toBe(
      "needs.check-scope.result != 'success'",
    );
    expect(step(swift, 'Require a decided Swift scope').if).toBe(
      "needs.native-swift-scope.result != 'success'",
    );
    const decide = step(scope, 'Decide whether native Swift changed').run;
    expect(decide).toContain(
      'git show "$BASE_SHA:.github/scripts/pr-scope-touches.sh"',
    );
    // Only "out of scope" (exit 1) skips; unknown (2) runs the Swift work.
    expect(decide).toContain('if [ "$scope" = 1 ]; then');
  });

  it('keeps its own steps in scope, so changing them runs them', () => {
    expect(step(swift, 'Build and test each native Swift package').run).toBe(
      'bash .github/scripts/native-swift.sh',
    );
    const decide = step(scope, 'Decide whether native Swift changed').run;
    const pattern = new RegExp(
      decide.match(/bash "\$helper" "\$BASE_SHA" '([^']+)'/)[1],
    );
    for (const touched of [
      '.github/scripts/native-swift.sh',
      'packages/native/apple/Package.swift',
      'packages/native/swift-ios-1/core/Button/AstryxButton.swift',
    ]) {
      expect(pattern.test(touched), touched).toBe(true);
    }
    for (const untouched of [
      '.github/workflows/ci.yml',
      'packages/native/src/index.ts',
      'packages/core/src/Button/Button.tsx',
    ]) {
      expect(pattern.test(untouched), untouched).toBe(false);
    }
  });

  it('skips the Swift work on docsite-only and tooling-only changes', () => {
    const decide = step(scope, 'Decide whether native Swift changed');
    expect(decide.env).toMatchObject({
      DOCSITE_ONLY: '${{ needs.check-scope.outputs.docsite_only }}',
      TOOLING_ONLY: '${{ needs.check-scope.outputs.tooling_only }}',
    });
    expect(decide.run).toContain(
      'if [ "$DOCSITE_ONLY" = true ] || [ "$TOOLING_ONLY" = true ]; then',
    );
  });
});
