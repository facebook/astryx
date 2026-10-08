// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Integration-content target gating tests.
 *
 * The production (`latest`) docsite documents published stable releases only
 * (spec:AST-033 FR5). Canary-only integrations (@astryxdesign/lab et al.,
 * spec:AST-017) never reach it, and a stable-channel integration reaches it
 * only with its first stable release. generate-data.mjs and generate-scope.mjs
 * share one admission gate (src/lib/integrationTargets.mjs); this file
 * unit-tests that gate for every target, the released-stable rule the `latest`
 * snapshot applies, and the canary-side invariants that make the exclusion
 * provable from the generated artifacts.
 *
 * @input The shared integration target gate, docsite config, and the
 *   canary-generated registries
 * @output Regression coverage for production exclusion of integration content
 * @position Build-time docsite target verification
 * Run: pnpm -F @astryxdesign/docsite test
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {describe, expect, it} from 'vitest';
import docsiteConfig from '../../astryx.config.mjs';
import {integrationPackagesForTarget} from '../lib/integrationTargets.mjs';
import {isReleasedStable} from '../../scripts/resolve-content-root.mjs';
import {blocks} from '../generated/blockRegistry';
import {components} from '../generated/componentRegistry';
import {packages} from '../generated/packageRegistry';

const REPO_ROOT = path.resolve(__dirname, '../../../..');

/**
 * An npm lookup for isReleasedStable: dist-tags per package, and the versions
 * that exist.
 */
function npmWith(
  tags: Record<string, Record<string, string>>,
  versions: string[],
) {
  return (spec: string, field: string) => {
    if (field === 'dist-tags') return tags[spec] ?? null;
    return versions.includes(spec)
      ? spec.slice(spec.lastIndexOf('@') + 1)
      : null;
  };
}

describe('integration target gate', () => {
  it('returns the configured packages, in order, on canary', () => {
    expect(integrationPackagesForTarget('canary', docsiteConfig)).toEqual(
      docsiteConfig.integrations,
    );
  });

  it('admits no integration on latest until one is in the stable snapshot', () => {
    expect(integrationPackagesForTarget('latest', docsiteConfig)).toEqual([]);
    expect(
      integrationPackagesForTarget('latest', docsiteConfig, [
        '@astryxdesign/core',
      ]),
    ).toEqual([]);
  });

  it('admits a configured integration on latest once the snapshot holds it', () => {
    expect(
      integrationPackagesForTarget('latest', docsiteConfig, [
        '@astryxdesign/core',
        '@astryxdesign/charts',
      ]),
    ).toEqual(['@astryxdesign/charts']);
  });

  it('tolerates a config without an integrations list', () => {
    expect(integrationPackagesForTarget('canary', {})).toEqual([]);
    expect(integrationPackagesForTarget('canary', undefined)).toEqual([]);
  });
});

describe('production-exclusion invariants (asserted on canary artifacts)', () => {
  it('attributes every integration-sourced block to a configured package', () => {
    // Every block the canary build admits beyond Core's CLI assets must come
    // from a package named in astryx.config — those are exactly the entries
    // the latest build drops, so nothing integration-shaped can ride along
    // unattributed.
    const configured = new Set<string>(docsiteConfig.integrations);
    const sourced = blocks.filter(block => block.sourcePackage != null);
    expect(sourced.length).toBeGreaterThan(0);
    for (const block of sourced) {
      expect(configured.has(block.sourcePackage as string)).toBe(true);
    }
  });

  it('attributes every non-core component entry to a configured package', () => {
    const configured = new Set<string>(docsiteConfig.integrations);
    for (const packageName of Object.keys(components)) {
      if (packageName === '@astryxdesign/core') {
        continue;
      }
      expect(configured.has(packageName)).toBe(true);
    }
  });

  it('keeps every configured integration off the latest snapshot until it has released stable', () => {
    // resolve-content-root.mjs materializes the `latest` content root from the
    // packages that have released stable, excluding `private` and
    // `astryx.canaryOnly` manifests (mirroring release.yml) and any package
    // whose npm `latest` tag is missing or a prerelease. A canary-only
    // integration therefore never reaches production, and a stable-channel one
    // only with its first stable release.
    for (const name of docsiteConfig.integrations) {
      const registryEntry = packages.find(pkg => pkg.name === name);
      // Present on canary (documented at all) …
      expect(
        registryEntry,
        `${name} missing from canary packageRegistry`,
      ).toBeDefined();
      const manifest = JSON.parse(
        fs.readFileSync(
          path.join(REPO_ROOT, registryEntry!.packagePath, 'package.json'),
          'utf-8',
        ),
      );
      if (manifest.private === true || manifest.astryx?.canaryOnly === true) {
        continue;
      }
      // A stable-channel integration that has only its bootstrap placeholder
      // on npm stays off `latest`.
      const neverReleased = npmWith(
        {[name]: {latest: '0.0.0-bootstrap.0', canary: '0.6.5-canary.1'}},
        [],
      );
      expect(isReleasedStable(name, '0.6.5', neverReleased), name).toBe(false);
    }
  });

  it('admits a package with its stable release, and fails a release missing the pinned version', () => {
    const name = '@astryxdesign/charts';
    const released = npmWith({[name]: {latest: '0.6.5'}}, [`${name}@0.6.5`]);
    expect(isReleasedStable(name, '0.6.5', released)).toBe(true);
    const incomplete = npmWith({[name]: {latest: '0.6.4'}}, [`${name}@0.6.4`]);
    expect(() => isReleasedStable(name, '0.6.5', incomplete)).toThrow(
      /is not on npm/,
    );
    expect(isReleasedStable(name, '0.6.5', npmWith({}, []))).toBe(false);
  });

  it('documents @astryxdesign/lab on canary (presence proof for the exclusion tests)', () => {
    // The latest-target run proves absence; this proves the same pipeline
    // genuinely admits Lab components and blocks on canary, so the absence is
    // exclusion, not a silently empty catalog.
    expect(Object.keys(components)).toContain('@astryxdesign/lab');
    expect(
      blocks.some(block => block.sourcePackage === '@astryxdesign/lab'),
    ).toBe(true);
  });
});
