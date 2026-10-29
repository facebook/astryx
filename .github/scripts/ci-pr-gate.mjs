// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file The condition every job of a pull-request workflow starts with
 * (spec:AST-030 FR17). A draft runs no CI. An outside contributor's pull
 * request runs CI only once a maintainer labels it `ci:run`. A `labeled`
 * event runs CI only for that label. Every other event (a push to main, a
 * merge-group entry, a dispatch) passes.
 */

export const PR_CI_GATE =
  "(github.event_name != 'pull_request' || !github.event.pull_request.draft && " +
  "(github.event.action != 'labeled' || github.event.label.name == 'ci:run') && " +
  '(contains(fromJSON(\'["OWNER","MEMBER","COLLABORATOR"]\'), github.event.pull_request.author_association) || ' +
  "contains(github.event.pull_request.labels.*.name, 'ci:run')))";

/** A job condition with the gate in front: `${{ GATE && (condition) }}`. */
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
