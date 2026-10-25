// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file components/Switch.ts
 * @input None
 * @output What @astryxdesign/native adds to the core Switch contract
 * @position Native additions read by fromComponentDoc together with core's
 *   Switch documentation
 */

import type {NativeAdditions} from '../contract/fromComponentDoc.js';

export const switchControl: NativeAdditions = {
  name: 'Switch',
  // The web Switch forwards base props to its root wrapper.
  baseTarget: 'root',
  webOnly: {
    labelPosition:
      'an Apple switch row follows the system toggle layout, label leading (component API A2)',
    labelSpacing:
      "an Apple switch row uses the system's spacing between label and switch (component API A2)",
  },
};
