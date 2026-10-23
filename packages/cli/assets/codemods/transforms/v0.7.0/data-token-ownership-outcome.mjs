// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Types the reports of `validate-data-token-ownership` as upgrade
 * outcomes instead of failures.
 *
 * The validator throws a plain Error for each finding. Two kinds are not
 * codemod failures: a stale generated theme stylesheet, which
 * `astryx theme build` rebuilds, and a raw data-token use a person migrates.
 * This wrapper retypes only a plain `Error` whose message starts with one of
 * the validator's exact report prefixes, as `RegenerationRequired` or
 * `ManualMigrationRequired`. Anything else, an Error subclass such as a parse
 * error included, stays a failure. The validator keeps sole ownership of what
 * it reports.
 *
 * @input A thrown value from validate-data-token-ownership
 * @output The same report typed as a codemod outcome, or the value unchanged
 * @position v0.7.0 manifest wiring for spec:AST-066 FR18–FR19 reports
 */

import {ManualMigrationRequired, RegenerationRequired} from '../../outcome.mjs';

const STALE_THEME =
  'This generated theme CSS still emits canonical data defaults at :root. ';
const TOKEN = String.raw`var\(--color-data-[a-z0-9-]+\)`;
const MANUAL = [
  new RegExp(
    String.raw`^Direct ${TOKEN}(?: at line (\d+))? needs manual migration: `,
    'u',
  ),
  new RegExp(
    String.raw`^Raw ${TOKEN} without a fallback at line (\d+) needs an availability check: `,
    'u',
  ),
];

/**
 * @param {unknown} err
 * @returns {unknown}
 */
export function dataTokenOwnershipOutcome(err) {
  if (!(err instanceof Error) || err.constructor !== Error) return err;
  if (err.message.startsWith(STALE_THEME)) {
    return new RegenerationRequired(err.message, {
      commands: ['astryx theme build'],
    });
  }
  for (const pattern of MANUAL) {
    const match = pattern.exec(err.message);
    if (match) {
      return new ManualMigrationRequired(err.message, {
        line: match[1] ? Number(match[1]) : undefined,
      });
    }
  }
  return err;
}

/**
 * @param {import('../../../../authoring/codemod/type').CodemodTransform} transform
 * @returns {import('../../../../authoring/codemod/type').CodemodTransform}
 */
export function withDataTokenOwnershipOutcomes(transform) {
  return (file, api) => {
    try {
      return transform(file, api);
    } catch (err) {
      throw dataTokenOwnershipOutcome(err);
    }
  };
}
