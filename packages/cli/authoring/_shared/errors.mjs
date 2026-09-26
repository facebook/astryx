// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Shared error formatting for authoring parsers.
 *
 * Every authoring parser seals its zod schema and, on failure, throws a single
 * readable line built here — so the message convention (path: message;
 * path: message) stays identical across config, integration, codemod, and doc
 * parsing. Zod is an implementation detail: the `ZodError` never escapes a
 * parser, only the formatted string does.
 */

/**
 * Format a zod error into a single readable line: `<label> is invalid: <path>:
 * <message>; <path>: <message>`.
 *
 * @param {string} label
 * @param {import('zod').ZodError} error
 * @returns {string}
 */
export function formatZodError(label, error) {
  const issues = error.issues
    .map(issue => {
      const path = issue.path.length ? issue.path.join('.') : '(root)';
      return `${path}: ${issue.message}`;
    })
    .join('; ');
  return `${label} is invalid: ${issues}`;
}
