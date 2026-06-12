// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file codeExamples.ts
 * @input Raw source strings used by docsite code examples and playground links
 * @output Source strings with repository-only boilerplate removed for readers
 * @position Shared docsite utility consumed by code blocks and playground links
 */

const META_COPYRIGHT_HEADER_RE =
  /^(\uFEFF?(?:#![^\r\n]*(?:\r?\n))?)\/\/ Copyright \(c\) Meta Platforms, Inc\. and affiliates\.\r?\n(?:\r?\n)*/;

/**
 * Remove the repository copyright header from copied/rendered examples while
 * leaving the rest of the source untouched. The header is useful in repo files
 * but adds noise when people read or copy docs snippets.
 */
export function stripCodeExampleCopyrightHeader(code: string): string {
  return code.replace(META_COPYRIGHT_HEADER_RE, '$1');
}
