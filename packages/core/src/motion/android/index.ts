// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file index.ts
 * @input The domain files of the Android constants table
 * @output Re-exports `keyboard` and registerAndroidKeyboardTable
 * @position Entry of the Android constants table (motion/android). Internal
 *   to core: not exported from the package entry point
 *
 * Where a touch presentation follows something Android draws itself (the
 * software keyboard), its numbers come from here with their sources, as the
 * UIKit table's do for iOS.
 *
 * SYNC: When a domain file is added, re-export it here and list it in
 * /packages/core/src/motion/README.md.
 */

export {keyboard, registerAndroidKeyboardTable} from './keyboard';
