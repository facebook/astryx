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
 * The first CLI release that reads an integration's namespace docs. An older
 * CLI fails to load a namespace doc and hides every doc topic the package
 * ships, with no warning.
 */
export const NAMESPACE_DOCS_CLI = '0.7.0';

const VERSION_RE = /^v?(\d+|[xX*])(?:\.(\d+|[xX*]))?(?:\.(\d+|[xX*]))?(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/;

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
 * Why a package that ships a namespace doc would lose its docs on an older
 * CLI, or null when its declared CLI range admits only CLIs that read them.
 * @param {any} pkg package.json
 * @returns {string | null}
 */
export function namespaceDocsCliProblem(pkg) {
  const range = pkg?.peerDependencies?.[CLI_PACKAGE];
  const fix = `"${CLI_PACKAGE}": ">=${NAMESPACE_DOCS_CLI}" in peerDependencies (optional in peerDependenciesMeta, if the CLI is not required)`;
  if (typeof range !== 'string') {
    return `The package ships a namespace doc but declares no ${CLI_PACKAGE} peer. A CLI older than ${NAMESPACE_DOCS_CLI} cannot read a namespace doc, and hides every doc topic the package ships. Declare ${fix}.`;
  }
  const lowest = lowestAdmitted(range);
  if (lowest == null || semverCompare(lowest, NAMESPACE_DOCS_CLI) < 0) {
    return `The package ships a namespace doc, but its ${CLI_PACKAGE} peer range "${range}" admits a CLI older than ${NAMESPACE_DOCS_CLI}, which cannot read a namespace doc and hides every doc topic the package ships. Declare ${fix}.`;
  }
  return null;
}

/**
 * The package.json with a CLI peer that reads namespace docs: optional, unless
 * the package already says otherwise.
 * @param {any} pkg package.json
 * @returns {any}
 */
export function withNamespaceDocsCli(pkg) {
  const meta = pkg.peerDependenciesMeta ?? {};
  return {
    ...pkg,
    peerDependencies: {
      ...(pkg.peerDependencies ?? {}),
      [CLI_PACKAGE]: `>=${NAMESPACE_DOCS_CLI}`,
    },
    peerDependenciesMeta: meta[CLI_PACKAGE]
      ? meta
      : {...meta, [CLI_PACKAGE]: {optional: true}},
  };
}
