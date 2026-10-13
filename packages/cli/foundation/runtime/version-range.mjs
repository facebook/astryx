// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Strict version-range matching for hosted package sets.
 *
 * The general CLI semver helper fails open because it diagnoses peer ranges:
 * unfamiliar input must not create a false warning there. Package-set selection
 * has the opposite trust boundary. A malformed version or range must fail
 * closed, and prereleases must follow npm's opt-in rule.
 *
 * @position foundation/runtime — package-set compatibility only.
 */

/**
 * @typedef {object} Version
 * @property {number} major
 * @property {number} minor
 * @property {number} patch
 * @property {Array<number|string>} prerelease
 */

/**
 * @typedef {object} RangeVersion
 * @property {Version} version
 * @property {number} count
 * @property {number|null} wildcardIndex
 */

/**
 * @typedef {object} Comparator
 * @property {'='|'>'|'>='|'<'|'<='|'^'|'~'} op
 * @property {RangeVersion} target
 */

/** @param {string | undefined} raw @returns {Array<number|string>|null} */
function parsePrerelease(raw) {
  if (raw === undefined) return [];
  const parts = raw.split('.');
  if (parts.length === 0 || parts.some(part => !/^[0-9A-Za-z-]+$/.test(part))) {
    return null;
  }
  /** @type {Array<number|string>} */
  const parsed = [];
  for (const part of parts) {
    if (/^\d+$/.test(part)) {
      if (part.length > 1 && part.startsWith('0')) return null;
      const number = Number(part);
      if (!Number.isSafeInteger(number)) return null;
      parsed.push(number);
    } else {
      parsed.push(part);
    }
  }
  return parsed;
}

/** @param {string | undefined} raw */
function validBuild(raw) {
  return (
    raw === undefined ||
    raw.split('.').every(part => /^[0-9A-Za-z-]+$/.test(part))
  );
}

/** @param {unknown} value @returns {Version|null} */
function parseVersion(value) {
  if (typeof value !== 'string') return null;
  const match =
    /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-([0-9A-Za-z.-]+))?(?:\+([0-9A-Za-z.-]+))?$/.exec(
      value,
    );
  if (!match) return null;
  const prerelease = parsePrerelease(match[4]);
  const numbers = [Number(match[1]), Number(match[2]), Number(match[3])];
  if (
    prerelease == null ||
    !validBuild(match[5]) ||
    numbers.some(number => !Number.isSafeInteger(number))
  ) {
    return null;
  }
  return {
    major: numbers[0],
    minor: numbers[1],
    patch: numbers[2],
    prerelease,
  };
}

/** @param {string} value @returns {RangeVersion|null} */
function parseRangeVersion(value) {
  const match =
    /^v?((?:\d+|[xX*])(?:\.(?:\d+|[xX*])){0,2})(?:-([0-9A-Za-z.-]+))?(?:\+([0-9A-Za-z.-]+))?$/.exec(
      value,
    );
  if (!match || !validBuild(match[3])) return null;
  const rawParts = match[1].split('.');
  const wildcardIndex = rawParts.findIndex(part => /^[xX*]$/.test(part));
  if (
    wildcardIndex >= 0 &&
    rawParts.slice(wildcardIndex).some(part => !/^[xX*]$/.test(part))
  ) {
    return null;
  }
  if (match[2] !== undefined && (rawParts.length !== 3 || wildcardIndex >= 0)) {
    return null;
  }
  const prerelease = parsePrerelease(match[2]);
  if (prerelease == null) return null;
  const numbers = rawParts.map(part => {
    if (/^[xX*]$/.test(part)) return 0;
    if (part.length > 1 && part.startsWith('0')) return NaN;
    return Number(part);
  });
  if (numbers.some(number => !Number.isSafeInteger(number))) return null;
  return {
    version: {
      major: numbers[0] ?? 0,
      minor: numbers[1] ?? 0,
      patch: numbers[2] ?? 0,
      prerelease,
    },
    count: rawParts.length,
    wildcardIndex: wildcardIndex < 0 ? null : wildcardIndex,
  };
}

/** @param {Version} a @param {Version} b */
function compare(a, b) {
  for (const key of /** @type {const} */ (['major', 'minor', 'patch'])) {
    if (a[key] !== b[key]) return a[key] - b[key];
  }
  if (a.prerelease.length === 0) return b.prerelease.length === 0 ? 0 : 1;
  if (b.prerelease.length === 0) return -1;
  const length = Math.max(a.prerelease.length, b.prerelease.length);
  for (let index = 0; index < length; index++) {
    const left = a.prerelease[index];
    const right = b.prerelease[index];
    if (left === undefined) return -1;
    if (right === undefined) return 1;
    if (left === right) continue;
    if (typeof left === 'number' && typeof right === 'number')
      return left - right;
    if (typeof left === 'number') return -1;
    if (typeof right === 'number') return 1;
    return left < right ? -1 : 1;
  }
  return 0;
}

/** @param {RangeVersion} target @returns {Version} */
function upperForPartial(target) {
  const {version, count, wildcardIndex} = target;
  const significant = wildcardIndex ?? count;
  if (significant <= 1) {
    return {major: version.major + 1, minor: 0, patch: 0, prerelease: []};
  }
  return {
    major: version.major,
    minor: version.minor + 1,
    patch: 0,
    prerelease: [],
  };
}

/** @param {string} token @returns {Comparator|null} */
function parseComparator(token) {
  const match = /^(\^|~|>=|<=|>|<|=)?(.*)$/.exec(token.trim());
  if (!match || match[2] === '') return null;
  const target = parseRangeVersion(match[2]);
  if (!target) return null;
  const op = /** @type {Comparator['op']} */ (match[1] || '=');
  if (target.wildcardIndex === 0 && op !== '=') return null;
  return {op, target};
}

/** @param {Version} version @param {Comparator} comparator */
function satisfiesComparator(version, comparator) {
  const {op, target} = comparator;
  if (op === '=' && target.wildcardIndex === 0) return true;
  const lower = target.version;
  const partial = target.count < 3 || target.wildcardIndex != null;
  const cmp = compare(version, lower);
  if (op === '=') {
    return partial
      ? cmp >= 0 && compare(version, upperForPartial(target)) < 0
      : cmp === 0;
  }
  if (op === '^') {
    const fixed = target.wildcardIndex ?? target.count;
    let upper;
    if (fixed <= 1 || lower.major > 0) {
      upper = {major: lower.major + 1, minor: 0, patch: 0, prerelease: []};
    } else if (fixed === 2 || lower.minor > 0) {
      upper = {major: 0, minor: lower.minor + 1, patch: 0, prerelease: []};
    } else {
      upper = {major: 0, minor: 0, patch: lower.patch + 1, prerelease: []};
    }
    return cmp >= 0 && compare(version, upper) < 0;
  }
  if (op === '~') {
    const fixed = target.wildcardIndex ?? target.count;
    const upper =
      fixed >= 2
        ? {major: lower.major, minor: lower.minor + 1, patch: 0, prerelease: []}
        : {major: lower.major + 1, minor: 0, patch: 0, prerelease: []};
    return cmp >= 0 && compare(version, upper) < 0;
  }
  if (op === '>=') return cmp >= 0;
  if (op === '<') return cmp < 0;
  if (op === '>') {
    return partial ? compare(version, upperForPartial(target)) >= 0 : cmp > 0;
  }
  if (op === '<=') {
    return partial ? compare(version, upperForPartial(target)) < 0 : cmp <= 0;
  }
  return false;
}

/** @param {Version} candidate @param {RangeVersion[]} targets */
function prereleaseAdmitted(candidate, targets) {
  if (candidate.prerelease.length === 0) return true;
  return targets.some(
    ({version}) =>
      version.prerelease.length > 0 &&
      version.major === candidate.major &&
      version.minor === candidate.minor &&
      version.patch === candidate.patch,
  );
}

/**
 * Parse and, when `candidate` is present, evaluate one `||` branch.
 * @param {string} union
 * @param {Version|null} candidate
 * @returns {boolean|null} null means the range is malformed
 */
function evaluateUnion(union, candidate) {
  const value = union.trim();
  if (value === '') return null;
  if (value === '*' || value.toLowerCase() === 'x') {
    return candidate ? candidate.prerelease.length === 0 : true;
  }

  const hyphen = /^(\S+)\s+-\s+(\S+)$/.exec(value);
  if (hyphen) {
    const lower = parseRangeVersion(hyphen[1]);
    const upper = parseRangeVersion(hyphen[2]);
    if (!lower || !upper) return null;
    if (!candidate) return true;
    const upperMatches =
      upper.count < 3 || upper.wildcardIndex != null
        ? compare(candidate, upperForPartial(upper)) < 0
        : compare(candidate, upper.version) <= 0;
    return (
      prereleaseAdmitted(candidate, [lower, upper]) &&
      compare(candidate, lower.version) >= 0 &&
      upperMatches
    );
  }

  const tokens = value.split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return null;
  const comparators = tokens.map(parseComparator);
  if (comparators.some(comparator => comparator == null)) return null;
  const parsed = /** @type {Comparator[]} */ (comparators);
  if (!candidate) return true;
  return (
    prereleaseAdmitted(
      candidate,
      parsed.map(comparator => comparator.target),
    ) && parsed.every(comparator => satisfiesComparator(candidate, comparator))
  );
}

/**
 * Does `range` name only published semver versions this planner can match?
 * Empty, file, workspace, alias, URL, git, and tag specs fail closed.
 * @param {unknown} range
 */
export function isMatchableRange(range) {
  if (typeof range !== 'string' || range.trim() === '') return false;
  return range.split('||').every(union => evaluateUnion(union, null) === true);
}

/**
 * Strictly match a package's published `version` against `range`.
 * Invalid versions/ranges and unrequested prereleases return false.
 * @param {unknown} version
 * @param {unknown} range
 */
export function satisfiesPublishedRange(version, range) {
  const candidate = parseVersion(version);
  if (!candidate || typeof range !== 'string' || range.trim() === '')
    return false;
  let matched = false;
  for (const union of range.split('||')) {
    const result = evaluateUnion(union, candidate);
    if (result == null) return false;
    matched ||= result;
  }
  return matched;
}
