// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Public Astryx homepage route.
 * @input Shared control homepage implementation
 * @output The production homepage at `/`
 * @position Stable entry point; hidden experiment routes render the same implementation with isolated variants
 */

import {HomePage} from './_landing/HomePage';

export default function Page() {
  return <HomePage variant="control" />;
}
