// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file components/index.ts
 * @input None
 * @output Every component the native package adds to, by core component name
 * @position The generator walks this list; each entry pairs with core's
 *   `<Name>/<Name>.doc.mjs`
 */

import type {NativeAdditions} from '../contract/fromComponentDoc.js';
import {button} from './Button.js';
import {divider} from './Divider.js';
import {heading} from './Heading.js';
import {progressBar} from './ProgressBar.js';
import {selector} from './Selector.js';
import {switchControl} from './Switch.js';
import {text} from './Text.js';
import {textInput} from './TextInput.js';

export const NATIVE_COMPONENTS: readonly NativeAdditions[] = [
  button,
  divider,
  heading,
  progressBar,
  selector,
  switchControl,
  text,
  textInput,
];
