// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file When a pull request runs CI (spec:AST-030 FR17). A draft runs
 * nothing. A pull request runs CI when its branch lives in this repository
 * (pushing one needs write access) or a maintainer has labelled it `ci:run`.
 * Every other event (a push to main, a merge-group entry, a dispatch) passes.
 *
 * Jobs that report a required context are not gated: for a pull request CI
 * does not run (a draft, or a fork without the label), their first step fails
 * with the reason, because a skipped required check counts as passing and the
 * check would still read as passing after the draft is marked ready.
 */

const TRUSTED =
  '(github.event.pull_request.head.repo.full_name == github.repository || ' +
  "contains(github.event.pull_request.labels.*.name, 'ci:run'))";

/** Every job that can start on a pull request begins with this. */
export const PR_CI_GATE = `(github.event_name != 'pull_request' || !github.event.pull_request.draft && ${TRUSTED})`;

/** The condition of a required job's first step, which fails with the reason. */
export const PR_HELD = `github.event_name == 'pull_request' && (github.event.pull_request.draft || !${TRUSTED})`;

/** A job condition with a gate in front: `${{ GATE && (condition) }}`. */
export function gated(condition) {
  if (condition == null || condition === '') return PR_CI_GATE;
  const expression = condition.replace(/^\$\{\{\s*|\s*\}\}$/g, '');
  const wrapped = `${PR_CI_GATE} && (${expression})`;
  return condition.startsWith('${{') ? `\${{ ${wrapped} }}` : wrapped;
}

/** The job's own condition, without the gate in front. */
export function ungated(condition) {
  const expression = condition.replace(/^\$\{\{\s*|\s*\}\}$/g, '');
  const prefix = `${PR_CI_GATE} && (`;
  return expression.startsWith(prefix)
    ? expression.slice(prefix.length, -1)
    : expression;
}
