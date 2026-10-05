// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file release-admission.test.mjs
 * Patch-versus-minor admission (`spec:AST-017` FR46-FR50).
 *
 * Narrow on purpose: this gate answers one question, so the cases are the
 * states of that question. No version, package, or surface in these fixtures
 * is a real one — the rule must read the same for any release.
 */

import {describe, it, expect} from 'vitest';
import {
  checkAdmission,
  isIncompatible,
  minorSuccessor,
  readSchedule,
  utcToday,
  TARGET_FILE,
} from './release-admission.mjs';

const GROUP = ['@scope/a', '@scope/b', '@scope/c'];
const FIXED = [GROUP];
const TODAY = '2026-03-10';

const versions = (v, overrides = {}) =>
  new Map(GROUP.map(name => [name, overrides[name] ?? v]));

const entry = (file, category, releases) => ({file, category, releases});
const compatible = file => entry(file, 'fix', {'@scope/a': 'patch'});
const breaking = file => entry(file, 'breaking', {'@scope/a': 'minor'});

/** A valid schedule for the minor after 1.2.3. */
const schedule = (overrides = {}) => ({
  version: '1.3.0',
  scheduledFor: '2026-03-20',
  ...overrides,
});

const run = (input = {}) =>
  checkAdmission({
    fixedGroups: FIXED,
    versionByName: versions('1.2.3'),
    entries: [],
    target: null,
    today: TODAY,
    ...input,
  });

describe('FR46/FR48 — main targets a patch by default', () => {
  it('denies a breaking Changeset with no schedule', () => {
    const result = run({entries: [compatible('a.md'), breaking('b.md')]});
    expect(result.mode).toBe('patch');
    expect(result.problems).toHaveLength(1);
    expect(result.problems[0]).toMatch(/^b\.md: this entry is incompatible/);
  });

  it('allows compatible work with no schedule', () => {
    const result = run({entries: [compatible('a.md'), compatible('b.md')]});
    expect(result.problems).toEqual([]);
    expect(result.mode).toBe('patch');
  });

  it('needs no file to be on the default', () => {
    expect(run({entries: []})).toMatchObject({mode: 'patch', problems: []});
  });
});

describe('FR47 — an explicitly scheduled minor admits breaking work', () => {
  it('allows a breaking Changeset once the minor is scheduled', () => {
    const result = run({
      entries: [breaking('remove-thing.md'), compatible('a.md')],
      target: schedule(),
    });
    expect(result.problems).toEqual([]);
    expect(result.mode).toBe('minor');
    expect(result.scheduled).toEqual(schedule());
  });

  it('admits every breaking Changeset while scheduled, with no per-change record', () => {
    const result = run({
      entries: [breaking('one.md'), breaking('two.md')],
      target: schedule(),
    });
    expect(result.problems).toEqual([]);
  });

  it('never lets a pending Changeset set the mode by itself', () => {
    // The circularity this gate exists to avoid: the entry being judged is
    // not evidence for the mode that would admit it.
    expect(run({entries: [breaking('b.md')]}).mode).toBe('patch');
  });

  it('reads a declared minor as incompatible even without the category', () => {
    expect(isIncompatible(entry('x.md', 'fix', {'@scope/a': 'minor'}))).toBe(true);
    expect(isIncompatible(entry('x.md', 'fix', {'@scope/a': 'patch'}))).toBe(false);
    expect(run({entries: [entry('sneaky.md', 'fix', {'@scope/a': 'minor'})]})
      .problems).toHaveLength(1);
  });
});

describe('FR49 — the schedule fails closed', () => {
  const denied = target => {
    const result = run({entries: [breaking('b.md')], target});
    expect(result.mode).toBe('patch');
    return result.problems.join('\n');
  };

  it('denies a schedule carrying anything beyond the two fields', () => {
    expect(denied(schedule({approvedBy: 'someone'}))).toMatch(
      /must carry exactly "version" and "scheduledFor"/,
    );
  });

  it('denies a malformed version or day', () => {
    expect(denied(schedule({version: '1.3'}))).toMatch(/"version" must be a/);
    expect(denied(schedule({scheduledFor: 'soon'}))).toMatch(
      /"scheduledFor" must be a real/,
    );
    expect(denied(schedule({scheduledFor: '2026-02-30'}))).toMatch(
      /"scheduledFor" must be a real/,
    );
  });

  it('denies a schedule that is not the minor after the published version', () => {
    expect(denied(schedule({version: '1.2.4'}))).toMatch(
      /schedules 1\.2\.4, but the published packages are at 1\.2\.3, whose next minor is 1\.3\.0/,
    );
    expect(denied(schedule({version: '2.0.0'}))).toMatch(/whose next minor is 1\.3\.0/);
  });

  it('denies a schedule whose day has passed', () => {
    expect(denied(schedule({scheduledFor: '2026-03-09'}))).toMatch(
      /was scheduled for 2026-03-09, which has passed/,
    );
  });

  it('still admits on the scheduled day itself', () => {
    const result = run({
      entries: [breaking('b.md')],
      target: schedule({scheduledFor: TODAY}),
    });
    expect(result.problems).toEqual([]);
    expect(result.mode).toBe('minor');
  });

  it('denies when the published packages disagree', () => {
    const result = run({
      entries: [breaking('b.md')],
      versionByName: versions('1.2.3', {'@scope/c': '1.2.4'}),
      target: schedule(),
    });
    expect(result.mode).toBe('patch');
    expect(result.problems.join('\n')).toMatch(
      /do not share one version: 1\.2\.3 .*; 1\.2\.4/,
    );
  });

  it('denies a prerelease or canary identifier as the published version', () => {
    const result = run({
      entries: [breaking('b.md')],
      versionByName: versions('1.2.3', {'@scope/b': '1.2.3-canary.abc1234'}),
      target: schedule(),
    });
    expect(result.problems.join('\n')).toMatch(/is never the published version/);
  });

  it('stays quiet about the published version when nothing asks', () => {
    // No schedule and no incompatible work: the base is not this gate's
    // business, so a disagreement is not reported here.
    const result = run({
      entries: [compatible('a.md')],
      versionByName: versions('1.2.3', {'@scope/c': '1.2.4'}),
    });
    expect(result.problems).toEqual([]);
  });
});

describe('FR50 — switching back, and the refusal', () => {
  it('returns to the patch default when the schedule is removed', () => {
    const scheduled = run({entries: [breaking('b.md')], target: schedule()});
    expect(scheduled.problems).toEqual([]);

    const afterRemoval = run({entries: [breaking('b.md')], target: null});
    expect(afterRemoval.mode).toBe('patch');
    expect(afterRemoval.problems).toHaveLength(1);
  });

  it('names what main targets and both ways forward', () => {
    const refusal = run({entries: [breaking('remove-thing.md')]}).problems[0];
    expect(refusal).toMatch(/remove-thing\.md/);
    expect(refusal).toMatch(/main is targeting 1\.2\.4 — a patch/);
    expect(refusal).toMatch(/would move all of\s+them to 1\.3\.0/);
    expect(refusal).toMatch(/deprecate it instead \(AST-017 FR28\)/);
    expect(refusal).toMatch(/schedule that minor first \(AST-017 FR47\)/);
    expect(refusal).toContain(TARGET_FILE);
  });

  it('hard-codes no version, surface, package, or contributor', () => {
    const refusal = run({entries: [breaking('b.md')]}).problems[0];
    expect(refusal).not.toMatch(/layout|astryx|0\.6\.|0\.7\./i);
  });
});

describe('helpers', () => {
  it('computes the next minor', () => {
    expect(minorSuccessor('0.6.4')).toBe('0.7.0');
    expect(minorSuccessor('1.2.3')).toBe('1.3.0');
    expect(minorSuccessor('nope')).toBeNull();
  });

  it('treats an absent schedule as the default, not an error', () => {
    expect(readSchedule({target: null, base: '1.2.3', today: TODAY})).toEqual({
      mode: 'patch',
      scheduled: null,
      problems: [],
    });
  });

  it('formats today as a UTC calendar day', () => {
    expect(utcToday(new Date('2026-03-10T23:30:00Z'))).toBe('2026-03-10');
  });
});
