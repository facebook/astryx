// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Menu.a11y.known-failures.ts
 * @input Uses KnownFailure from @astryxdesign/a11y-spec
 * @output MENU_KNOWN_FAILURES — records both lanes reconcile against, so a fix shows up as an unexpected pass and any other failure stays a failure
 * @position Known-failure ledger for the DropdownMenu menu-surface binding
 */

import type {KnownFailure} from '@astryxdesign/a11y-spec';

export const MENU_KNOWN_FAILURES: ReadonlyArray<KnownFailure> = [];
