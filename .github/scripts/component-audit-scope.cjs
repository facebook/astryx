#!/usr/bin/env node
// Copyright (c) Meta Platforms, Inc. and affiliates.

'use strict';
/* global module, require */

/**
 * @file Trusted component-audit scope classifier.
 * @input Git name-status rows on stdin and --registry <trusted-base registry>.
 * @output GitHub job outputs for component, RTL, and fail-closed full-audit scope;
 *   empty or unmatched input always selects the full audits.
 * @position Loaded with its registry from the pull request's trusted base ref.
 */

const fs = require('node:fs');
const path = require('node:path');

function changedPathsFromNameStatus(input) {
  return input
    .split('\n')
    .filter(Boolean)
    .flatMap(line => line.split('\t').slice(1))
    .filter(Boolean);
}

function classifyComponentAuditScope(paths, componentPackages) {
  const sourceRoots = componentPackages.map(pkg => `${pkg.src}/`);
  const isComponentSource = file =>
    sourceRoots.some(root => file.startsWith(root));
  const isStory = file => file.startsWith('apps/storybook/stories/');
  const isAccessibilitySurface = file =>
    file.startsWith('internal/a11y-spec/') ||
    /(^|\/)src\/.*\.a11y\./.test(file) ||
    file === 'playwright.config.ts';
  const isRtlHarness = file =>
    file.startsWith('apps/storybook/rtl-audit/') ||
    file === '.github/scripts/rtl-audit-coverage.test.mjs' ||
    file === '.github/scripts/weekly-rtl-summary.test.mjs' ||
    file === '.github/workflows/rtl-weekly.yml';
  const isSharedRoutingPolicy = file =>
    file === 'apps/storybook/rtl-audit/rtl-audit-coverage.mjs' ||
    file === 'apps/storybook/rtl-audit/targets.json' ||
    file === '.github/scripts/rtl-audit-coverage.test.mjs' ||
    file === 'scripts/component-packages.cjs';

  const componentSourceChanged = paths.some(isComponentSource);
  const storyChanged = paths.some(isStory);
  const accessibilityChanged = paths.some(isAccessibilitySurface);
  const rtlHarnessChanged = paths.some(isRtlHarness);
  const forceFullComponentAudits =
    paths.length === 0 ||
    paths.some(
      file =>
        isSharedRoutingPolicy(file) ||
        (!isComponentSource(file) &&
          !isStory(file) &&
          !isAccessibilitySurface(file) &&
          !isRtlHarness(file)),
    );

  return {
    has_components:
      componentSourceChanged ||
      storyChanged ||
      accessibilityChanged ||
      forceFullComponentAudits,
    has_rtl_components:
      componentSourceChanged || storyChanged || forceFullComponentAudits,
    has_rtl_harness: rtlHarnessChanged || forceFullComponentAudits,
    force_full_component_audits: forceFullComponentAudits,
  };
}

function parseArgs(argv) {
  const index = argv.indexOf('--registry');
  return {
    registry: index >= 0 ? argv[index + 1] : null,
    githubOutput: argv.includes('--github-output'),
  };
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.registry) {
    throw new Error('--registry is required');
  }
  const registry = require(path.resolve(args.registry));
  if (!Array.isArray(registry.COMPONENT_PACKAGES)) {
    throw new Error('trusted component registry is missing COMPONENT_PACKAGES');
  }
  const input = fs.readFileSync(0, 'utf8');
  const result = classifyComponentAuditScope(
    changedPathsFromNameStatus(input),
    registry.COMPONENT_PACKAGES,
  );
  const lines = Object.entries(result).map(
    ([key, value]) => `${key}=${String(value)}`,
  );
  if (args.githubOutput) {
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `${lines.join('\n')}\n`);
  } else {
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  changedPathsFromNameStatus,
  classifyComponentAuditScope,
};
