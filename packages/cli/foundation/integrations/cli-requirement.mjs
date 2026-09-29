// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file The CLI an integration's namespace docs need (spec:AST-046 FR11).
 *
 * @input A package.json object.
 * @output Whether its `peerDependencies` range for `@astryxdesign/cli` admits
 *   only CLIs that read namespace docs, and the package.json that declares it.
 * @position foundation/integrations; read by `integration add doc --parent`,
 *   which declares the peer, and `integration pack --check`, which requires it.
 */

import {semverCompare} from '../env/semver.mjs';

export const CLI_PACKAGE = '@astryxdesign/cli';

/**
 * The first CLI release that reads an integration's docs tree (namespace docs
 * and placed guides). A release before it can hide every doc topic a package
 * with a namespace doc or a placed guide ships, with no warning.
 */
export const DOCS_TREE_CLI = '0.7.0';

/** First CLI release that activates integration template replacement selection. */
export const TEMPLATE_REPLACEMENT_CLI = '0.7.0';

const VERSION_RE =
  /^v?(\d+|[xX*])(?:\.(\d+|[xX*]))?(?:\.(\d+|[xX*]))?(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/;

/**
 * A version or partial version as MAJOR.MINOR.PATCH, a wildcard part as 0.
 * @param {string} text
 * @returns {string | null}
 */
function lowerVersion(text) {
  const m = VERSION_RE.exec(text.trim());
  if (!m) return null;
  return [m[1], m[2], m[3]]
    .map(part => (part == null || /^[xX*]$/.test(part) ? '0' : part))
    .join('.');
}

/**
 * The lowest version one space-joined comparator set admits, or null when it
 * has no lower bound this can read.
 * @param {string} set
 * @returns {string | null}
 */
function lowestOfSet(set) {
  if (set === '' || set === '*' || /^[xX]$/.test(set)) return null;
  const hyphen = /^(\S+)\s+-\s+\S+$/.exec(set);
  if (hyphen) return lowerVersion(hyphen[1]);
  /** @type {string | null} */
  let lowest = null;
  for (const comparator of set.split(/\s+/)) {
    const m = /^(>=|<=|>|<|=|\^|~)?(.+)$/.exec(comparator);
    if (!m) return null;
    if (m[1] === '<' || m[1] === '<=') continue;
    const version = lowerVersion(m[2]);
    if (version == null) return null;
    if (lowest == null || semverCompare(version, lowest) > 0) lowest = version;
  }
  return lowest;
}

/**
 * The lowest version a semver range admits: the least of its `||`
 * alternatives. Null when an alternative has no lower bound, or the range is
 * not one this can read, so the caller treats it as admitting every version.
 * @param {unknown} range
 * @returns {string | null}
 */
export function lowestAdmitted(range) {
  if (typeof range !== 'string') return null;
  /** @type {string | null} */
  let lowest = null;
  for (const alternative of range.split('||')) {
    const low = lowestOfSet(alternative.trim());
    if (low == null) return null;
    if (lowest == null || semverCompare(low, lowest) < 0) lowest = low;
  }
  return lowest;
}

/**
 * Why a package that uses a feature before its supported CLI minimum would
 * lose it, or null when its declared CLI range admits only supported CLIs.
 * @param {any} pkg package.json
 * @param {string} feature what the package does, e.g. "ships a namespace doc"
 * @param {string} loss what a CLI below the supported minimum does with it
 * @param {string} minimumCli first CLI release that supports the feature
 * @returns {string | null}
 */
function cliRangeProblem(pkg, feature, loss, minimumCli) {
  const range = pkg?.peerDependencies?.[CLI_PACKAGE];
  const fix = `"${CLI_PACKAGE}": ">=${minimumCli}" in peerDependencies (optional in peerDependenciesMeta, if the CLI is not required)`;
  if (typeof range !== 'string') {
    return `The package ${feature} but declares no ${CLI_PACKAGE} peer. A CLI older than ${minimumCli} ${loss}. Declare ${fix}.`;
  }
  const lowest = lowestAdmitted(range);
  if (lowest == null || semverCompare(lowest, minimumCli) < 0) {
    return `The package ${feature}, but its ${CLI_PACKAGE} peer range "${range}" admits a CLI older than ${minimumCli}, which ${loss}. Declare ${fix}.`;
  }
  return null;
}

/**
 * Why a package that ships a namespace doc or a placed guide would lose its
 * docs on an older CLI, or null when its declared CLI range admits only CLIs
 * that read the docs tree. Published 0.6.3 hides every topic of a package
 * with a namespace doc; builds of main before the docs tree also do so for a
 * placed guide.
 * @param {any} pkg package.json
 * @returns {string | null}
 */
export function docsTreeCliProblem(pkg) {
  return cliRangeProblem(
    pkg,
    'ships a namespace doc or a placed guide',
    'does not read the docs tree, and can hide every doc topic the package ships',
    DOCS_TREE_CLI,
  );
}

/**
 * Why a package with a template that sets `replaces` must require the CLI
 * release that activates replacement selection (spec:AST-035), or null when
 * its declared CLI range admits only supported CLIs.
 * @param {any} pkg package.json
 * @returns {string | null}
 */
export function replacesCliProblem(pkg) {
  return cliRangeProblem(
    pkg,
    'has a template that sets `replaces`',
    "does not activate replacement selection; versions without staged parser support also reject the field and withhold the package's templates and doc topics",
    TEMPLATE_REPLACEMENT_CLI,
  );
}

/**
 * The package.json with a CLI peer that reads namespace docs: optional, unless
 * the package already says otherwise.
 * @param {any} pkg package.json
 * @returns {any}
 */
export function withDocsTreeCli(pkg) {
  const meta = pkg.peerDependenciesMeta ?? {};
  return {
    ...pkg,
    peerDependencies: {
      ...(pkg.peerDependencies ?? {}),
      [CLI_PACKAGE]: `>=${DOCS_TREE_CLI}`,
    },
    peerDependenciesMeta: meta[CLI_PACKAGE]
      ? meta
      : {...meta, [CLI_PACKAGE]: {optional: true}},
  };
}
