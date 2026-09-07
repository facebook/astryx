#!/usr/bin/env node
// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Validates the checked-in RTL applicability registries against a base.
 * @input --base <git revision> [--known-gaps <repo-relative JSON path>]
 *   [--verified-na <repo-relative JSON path>] [--github-output <path>]
 * @output Exit 0 for a valid removal-only debt transition and valid verified
 *   N/A declarations. Emits audit_components and removed_components for the
 *   blocking semantic audit. Exit 1 on invalid input or debt additions.
 * @position Required PR and merge-queue guard for RTL applicability metadata.
 */

import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {
  diffVerifiedNotApplicable,
  validateKnownCoverageGaps,
  validateKnownCoverageGapTransition,
  validateVerifiedNotApplicable,
} from '../../apps/storybook/rtl-audit/rtl-audit-coverage.mjs';

const BASELINE_BOOTSTRAP_SHA256 =
  '0816aeb3ed583b0ba934a470cb8b8661e8485ac42e42fabe133ef43709a44b5b';

const args = process.argv.slice(2);
const getArg = name => {
  const index = args.indexOf(`--${name}`);
  return index === -1 ? null : args[index + 1];
};

const base = getArg('base');
const githubOutput = getArg('github-output');
const knownGapsPath =
  getArg('known-gaps') || 'apps/storybook/rtl-audit/known-coverage-gaps.json';
const verifiedNaPath =
  getArg('verified-na') ||
  'apps/storybook/rtl-audit/verified-not-applicable.json';

if (!base) {
  console.error('Missing required --base <git revision>');
  process.exit(2);
}

function readBaseFile(file, {allowMissing = false} = {}) {
  try {
    return execFileSync('git', ['show', `${base}:${file}`], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
  } catch (error) {
    const message = String(error?.stderr || error?.message || error);
    const missing =
      message.includes(`path '${file}' does not exist`) ||
      message.includes(`path '${file}' exists on disk, but not in`);
    if (allowMissing && missing) {
      return null;
    }
    throw error;
  }
}

function uniqueComponents(components) {
  return [
    ...new Map(
      components.map(component => [component.toLowerCase(), component]),
    ).values(),
  ];
}

try {
  const currentKnownText = fs.readFileSync(knownGapsPath, 'utf8');
  const currentKnown = validateKnownCoverageGaps(JSON.parse(currentKnownText));
  const previousKnownText = readBaseFile(knownGapsPath, {allowMissing: true});

  let debtRemoved = [];
  let bootstrapped = false;
  if (previousKnownText == null) {
    const digest = createHash('sha256').update(currentKnownText).digest('hex');
    if (digest !== BASELINE_BOOTSTRAP_SHA256) {
      throw new Error(
        `RTL coverage-debt bootstrap must match ${BASELINE_BOOTSTRAP_SHA256}; got ${digest}`,
      );
    }
    bootstrapped = true;
    console.log(
      `Bootstrapping RTL coverage-debt baseline with ${currentKnown.length} entries.`,
    );
  } else {
    debtRemoved = validateKnownCoverageGapTransition(
      JSON.parse(previousKnownText),
      currentKnown,
    ).removed;
  }

  const currentVerified = validateVerifiedNotApplicable(
    JSON.parse(fs.readFileSync(verifiedNaPath, 'utf8')),
  );
  const previousVerified = JSON.parse(readBaseFile(verifiedNaPath));
  const verifiedTransition = diffVerifiedNotApplicable(
    previousVerified,
    currentVerified,
  );

  const auditComponents = uniqueComponents([
    ...debtRemoved,
    ...verifiedTransition.changed,
  ]);
  const removedComponents = uniqueComponents([
    ...debtRemoved,
    ...verifiedTransition.removed,
  ]);

  if (githubOutput) {
    fs.appendFileSync(
      githubOutput,
      `audit_components=${auditComponents.join(',')}\n` +
        `removed_components=${removedComponents.join(',')}\n`,
    );
  }

  if (!bootstrapped) {
    console.log(
      debtRemoved.length > 0
        ? `Removed ${debtRemoved.length} known RTL coverage gap(s): ${debtRemoved.join(', ')}`
        : `Known RTL coverage-debt baseline unchanged (${currentKnown.length} entries).`,
    );
  }
  console.log(
    verifiedTransition.changed.length > 0
      ? `Changed ${verifiedTransition.changed.length} verified-N/A declaration(s): ${verifiedTransition.changed.join(', ')}`
      : `Verified-N/A registry unchanged (${currentVerified.length} entries).`,
  );
} catch (error) {
  console.error(String(error?.message || error));
  process.exit(1);
}
