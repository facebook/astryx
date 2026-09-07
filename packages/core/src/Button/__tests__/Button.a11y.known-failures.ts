// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Button.a11y.known-failures.ts
 * @input Uses KnownFailure from @astryxdesign/a11y-spec
 * @output BUTTON_KNOWN_FAILURES — the exact outcomes a component that adopts the
 *   button pattern does not deliver yet, each scoped to one expectation, one
 *   binding, one state, and one public issue.
 * @position Recorded debt, not permission. `docs/specs/AST-020/spec.md` FR12: a
 *   known failure runs, still fails, and stays exactly as narrow as it is. When
 *   the component is fixed the record stops matching and the run reports
 *   `unexpected-pass`, which gates — so a fix cannot land while leaving a stale
 *   record behind.
 *
 * A record is never a way to make a run green. It is a way to say, in public and
 * in one place, precisely what is broken and where the fix is being tracked.
 */

import type {KnownFailure} from '@astryxdesign/a11y-spec';

export const BUTTON_KNOWN_FAILURES: ReadonlyArray<KnownFailure> = [];
