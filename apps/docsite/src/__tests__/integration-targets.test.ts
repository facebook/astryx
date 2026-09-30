// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Integration-content target gating tests.
 *
 * The production (`latest`) docsite must contain ZERO integration content:
 * the configured integration packages (@astryxdesign/lab et al.) are
 * canary-only (spec:AST-017). generate-data.mjs and generate-scope.mjs share
 * one admission gate (src/lib/integrationTargets.mjs); this file unit-tests
 * that gate for every target and pins the canary-side invariants that make
 * the exclusion provable from the generated artifacts.
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
import {
  integrationContentEnabled,
  integrationPackagesForTarget,
} from '../lib/integrationTargets.mjs';
import {blocks} from '../generated/blockRegistry';
import {components} from '../generated/componentRegistry';
import {packages} from '../generated/packageRegistry';

const REPO_ROOT = path.resolve(__dirname, '../../../..');

describe('integration target gate', () => {
  it('admits integration content only on canary', () => {
    expect(integrationContentEnabled('canary')).toBe(true);
    expect(integrationContentEnabled('latest')).toBe(false);
  });

  it('returns the configured packages, in order, on canary', () => {
    expect(integrationPackagesForTarget('canary', docsiteConfig)).toEqual(
      docsiteConfig.integrations,
    );
  });

  it('returns no packages on latest regardless of configuration', () => {
    expect(integrationPackagesForTarget('latest', docsiteConfig)).toEqual([]);
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
      if (packageName === '@astryxdesign/core') {continue;}
      expect(configured.has(packageName)).toBe(true);
    }
  });

  it('marks every configured integration canary-only or private, so the latest content snapshot can never materialize it', () => {
    // resolve-content-root.mjs materializes the `latest` content root from the
    // packages published to the stable npm tag, excluding `private` and
    // `astryx.canaryOnly` manifests (mirroring release.yml). As long as every
    // configured integration carries one of those flags, the production data
    // pipeline cannot even see its sources. Revisit this invariant before ever
    // configuring a stable package as a docsite integration.
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
      const excludedFromStable =
        manifest.private === true || manifest.astryx?.canaryOnly === true;
      expect(
        excludedFromStable,
        `${name} is neither private nor astryx.canaryOnly — it would be eligible for the latest content snapshot`,
      ).toBe(true);
    }
  });

  it('documents @astryxdesign/lab on canary (presence proof for the exclusion tests)', () => {
    // The latest-target run proves absence; this proves the same pipeline
    // genuinely admits Lab on canary, so the absence is exclusion, not a
    // silently empty catalog.
    expect(Object.keys(components)).toContain('@astryxdesign/lab');
    expect(
      blocks.some(block => block.sourcePackage === '@astryxdesign/lab'),
    ).toBe(true);
  });
});
