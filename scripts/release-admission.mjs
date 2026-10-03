// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Patch-versus-minor admission for Changesets.
 *
 * Implements `spec:AST-017` FR46-FR50. The publishable packages are a `fixed`
 * group, so one `[breaking]` Changeset moves every package to a new minor.
 * This gate makes that deliberate:
 *
 *   main targets a PATCH by default        -> incompatible work is refused
 *   an owner SCHEDULES a minor first       -> incompatible work may land
 *
 * The schedule is one small file, `.release/target.json`, carrying a version
 * and a day and nothing else. Pending Changesets never set the mode: the entry
 * being judged cannot be its own authorization.
 *
 * This answers patch-versus-minor and nothing else. Deprecation lifecycle,
 * cleanup ids, release planning, and ordinary review live where they already
 * live and are not enforced here.
 *
 * @input  fixed groups, package versions, parsed Changesets, optional target
 * @output {mode, problems} — problems empty means admissible
 * @position scripts/ — consumed by check-changesets.mjs
 */

/** Where an owner schedules the next minor, when one is scheduled. */
export const TARGET_FILE = '.release/target.json';

const STABLE_VERSION = /^(\d+)\.(\d+)\.(\d+)$/;
const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/;
const TARGET_KEYS = ['version', 'scheduledFor'];

/**
 * Is this Changeset incompatible?
 *
 * The `[breaking]` category is the authoring vocabulary (FR7); a declared
 * `minor` is the incompatible tier itself while packages are 0.x.
 * `check-changesets.mjs` already requires the two to agree, so reading either
 * alone as incompatible is the fail-closed direction.
 *
 * @param {{category: string|null, releases: Record<string,string>}} entry
 * @returns {boolean}
 */
export function isIncompatible(entry) {
  if (entry.category === 'breaking') return true;
  return Object.values(entry.releases || {}).some(bump => bump === 'minor');
}

/** The version a minor from `base` would carry. */
export function minorSuccessor(base) {
  const m = STABLE_VERSION.exec(base || '');
  return m ? `${Number(m[1])}.${Number(m[2]) + 1}.0` : null;
}

/** The version a patch from `base` would carry. */
export function patchSuccessor(base) {
  const m = STABLE_VERSION.exec(base || '');
  return m ? `${Number(m[1])}.${Number(m[2])}.${Number(m[3]) + 1}` : null;
}

/**
 * Is this a day that exists? `Date.parse` silently rolls an impossible date
 * forward — `2026-02-30` becomes March 2 — so compare the round trip instead
 * of trusting the parse to fail.
 *
 * @param {string} day  already matched against YYYY-MM-DD
 * @returns {boolean}
 */
function isRealDay(day) {
  const parsed = new Date(`${day}T00:00:00Z`);
  return (
    !Number.isNaN(parsed.getTime()) &&
    parsed.toISOString().slice(0, 10) === day
  );
}

/**
 * The version the published packages share. The fixed group publishes as one
 * version, so a group whose members disagree has no base, and a prerelease or
 * canary identifier is publication metadata rather than a base.
 *
 * @param {string[][]} fixedGroups
 * @param {Map<string,string>} versionByName
 * @returns {{base: string|null, problems: string[]}}
 */
export function deriveBase(fixedGroups, versionByName) {
  const problems = [];
  const seen = new Map();

  for (const group of fixedGroups || []) {
    for (const name of group || []) {
      const version = versionByName.get(name);
      if (version === undefined) continue;
      if (!STABLE_VERSION.test(version)) {
        problems.push(
          `${name}: version "${version}" is not MAJOR.MINOR.PATCH. A prerelease or canary identifier is never the published version this gate reads.`,
        );
        continue;
      }
      if (!seen.has(version)) seen.set(version, []);
      seen.get(version).push(name);
    }
  }

  if (seen.size > 1) {
    const spread = [...seen.entries()]
      .sort((a, b) => (a[0] < b[0] ? -1 : 1))
      .map(([version, names]) => `${version} (${names.join(', ')})`)
      .join('; ');
    problems.push(
      `the published packages do not share one version: ${spread}. They publish together, so there is nothing to check a scheduled minor against.`,
    );
  }

  if (problems.length) return {base: null, problems};
  return {base: seen.size === 1 ? [...seen.keys()][0] : null, problems};
}

/**
 * FR47/FR49 — read the owner's schedule.
 *
 * Returns `minor` only for a statement that can be read with certainty and
 * still applies. Anything else leaves main on its patch default and says why,
 * rather than inheriting a mode from an input nobody can trust.
 *
 * @param {object} input
 * @param {unknown} input.target  parsed .release/target.json, or null when absent
 * @param {string|null} input.base
 * @param {string} input.today  YYYY-MM-DD
 * @returns {{mode: 'patch'|'minor', scheduled: object|null, problems: string[]}}
 */
export function readSchedule({target, base, today}) {
  if (target === null || target === undefined) {
    return {mode: 'patch', scheduled: null, problems: []};
  }

  const problems = [];
  const deny = reason => {
    problems.push(`${TARGET_FILE}: ${reason}`);
    return {mode: 'patch', scheduled: null, problems};
  };

  if (typeof target !== 'object' || Array.isArray(target)) {
    return deny('must be a JSON object with exactly "version" and "scheduledFor".');
  }

  const keys = Object.keys(target).sort();
  if (keys.join(',') !== TARGET_KEYS.slice().sort().join(',')) {
    return deny(
      `must carry exactly "version" and "scheduledFor" — found ${keys.length ? keys.map(k => `"${k}"`).join(', ') : 'nothing'}. This file schedules a minor; it records nothing else.`,
    );
  }

  if (typeof target.version !== 'string' || !STABLE_VERSION.test(target.version)) {
    return deny(`"version" must be a MAJOR.MINOR.PATCH version.`);
  }
  if (
    typeof target.scheduledFor !== 'string' ||
    !ISO_DAY.test(target.scheduledFor) ||
    !isRealDay(target.scheduledFor)
  ) {
    return deny(`"scheduledFor" must be a real YYYY-MM-DD day.`);
  }

  if (!base) {
    return deny(
      `cannot be checked, because the published packages do not share one version.`,
    );
  }

  const expected = minorSuccessor(base);
  if (target.version !== expected) {
    return deny(
      `schedules ${target.version}, but the published packages are at ${base}, whose next minor is ${expected}. The schedule and the repository disagree.`,
    );
  }

  if (target.scheduledFor < today) {
    return deny(
      `was scheduled for ${target.scheduledFor}, which has passed. Cut the minor or remove this file; an expired schedule does not keep admitting breaking changes.`,
    );
  }

  return {mode: 'minor', scheduled: {...target}, problems};
}

/**
 * FR50 — the refusal. Names what main is targeting and both ways forward,
 * and names no particular version, surface, or contributor as a special case:
 * every value is read from the tree being checked.
 *
 * @param {string} file
 * @param {string|null} base
 * @returns {string}
 */
function refuse(file, base) {
  const patch = patchSuccessor(base);
  const minor = minorSuccessor(base);
  const heading = patch
    ? `${file}: this entry is incompatible, and main is targeting ${patch} — a patch.`
    : `${file}: this entry is incompatible, and main is targeting a patch.`;

  return (
    `${heading}\n` +
    `      The published packages release together, so admitting it would move all of\n` +
    `      them${minor ? ` to ${minor}` : ' to a new minor'}.\n` +
    `      Either keep the release patch-compatible: leave the released surface working\n` +
    `      and deprecate it instead (AST-017 FR28) — ship the replacement, keep old usage\n` +
    `      equivalent, and take the patch bump; the removal lands once a minor is\n` +
    `      scheduled.\n` +
    `      Or schedule that minor first (AST-017 FR47): a release owner adds\n` +
    `      ${TARGET_FILE} with the target version and the day it is scheduled for.`
  );
}

/**
 * FR46-FR50 — decide what this tree admits.
 *
 * @param {object} input
 * @param {string[][]} input.fixedGroups
 * @param {Map<string,string>} input.versionByName
 * @param {Array<{file: string, category: string|null, releases: Record<string,string>}>} input.entries
 * @param {unknown} [input.target]  parsed schedule, or null when absent
 * @param {string} input.today  YYYY-MM-DD
 * @returns {{base: string|null, mode: 'patch'|'minor', scheduled: object|null, problems: string[]}}
 */
export function checkAdmission({
  fixedGroups,
  versionByName,
  entries,
  target = null,
  today,
}) {
  const incompatible = (entries || []).filter(isIncompatible);
  const {base, problems: baseProblems} = deriveBase(fixedGroups, versionByName);

  // The base matters only when there is a schedule to check it against or
  // incompatible work to judge. Staying quiet otherwise keeps this gate to the
  // one question it answers.
  const problems =
    target !== null || incompatible.length > 0 ? [...baseProblems] : [];

  const schedule = readSchedule({target, base, today});
  problems.push(...schedule.problems);

  if (schedule.mode === 'patch') {
    for (const entry of incompatible) problems.push(refuse(entry.file, base));
  }

  return {base, mode: schedule.mode, scheduled: schedule.scheduled, problems};
}

/** Today in UTC, as the YYYY-MM-DD the schedule is compared against. */
export function utcToday(now = new Date()) {
  return now.toISOString().slice(0, 10);
}
