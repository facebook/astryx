// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file no-raw-console-cli.js
 * @description Ban bare `console.log` in CLI runtime files so it can never
 * corrupt the `--json` stdout contract (#2467).
 *
 * The CLI's machine-readable JSON output owns stdout in `--json` mode. A stray
 * `console.log` writes to that same stream and breaks JSON consumers. The
 * sanctioned escape hatch is `humanLog()` (lib/json.mjs), which is a no-op in
 * JSON mode. This rule pushes authors toward it:
 *
 *   Banned:   console.log(...)            (writes raw stdout)
 *   Allowed:  console.error(...)          (stderr — never corrupts JSON)
 *             console.warn(...)           (stderr)
 *             humanLog(...)               (json-aware stdout)
 *
 * Autofix rewrites `console.log(` → `humanLog(`. The author is responsible for
 * ensuring `humanLog` is imported from `../lib/json.mjs`; the fix only renames
 * the call so the wrong primitive isn't silently kept.
 *
 * A handful of files legitimately write raw stdout — the JSON envelope writers
 * and the banner — and are exempt:
 *   - packages/cli/src/lib/json.mjs   (defines humanLog / jsonOut)
 *   - packages/cli/src/index.mjs      (wiring / banner)
 *   - packages/cli/bin/xds.mjs        (entrypoint / error boundary)
 */

const EXEMPT_SUFFIXES = [
  'packages/cli/src/lib/json.mjs',
  'packages/cli/src/index.mjs',
  'packages/cli/bin/xds.mjs',
];

function isExempt(filename) {
  // Normalize Windows separators so suffix matching is path-agnostic.
  const normalized = filename.replace(/\\/g, '/');
  return EXEMPT_SUFFIXES.some(suffix => normalized.endsWith(suffix));
}

const rule = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Ban bare console.log in CLI runtime files; use humanLog so --json stdout stays clean',
      category: 'XDS Conventions',
      recommended: true,
    },
    fixable: 'code',
    messages: {
      noRawConsoleLog:
        'Do not use console.log in CLI runtime code — it writes raw stdout and ' +
        'can corrupt --json output. Use humanLog() (from lib/json.mjs), or ' +
        'console.error/console.warn for stderr.',
    },
    schema: [],
  },
  create(context) {
    const filename = context.filename ?? context.getFilename();
    if (isExempt(filename)) {
      return {};
    }

    return {
      CallExpression(node) {
        const callee = node.callee;
        if (
          callee.type === 'MemberExpression' &&
          !callee.computed &&
          callee.object.type === 'Identifier' &&
          callee.object.name === 'console' &&
          callee.property.type === 'Identifier' &&
          callee.property.name === 'log'
        ) {
          context.report({
            node: callee,
            messageId: 'noRawConsoleLog',
            fix(fixer) {
              // console.log -> humanLog (rename the call; import is the
              // author's responsibility).
              return fixer.replaceText(callee, 'humanLog');
            },
          });
        }
      },
    };
  },
};

export default rule;
