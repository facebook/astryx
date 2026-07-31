// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Documents a hook's return value field.
 */
export interface HookReturnDoc {
  /** Field name on the returned object, or 'value' for primitive returns. */
  name: string;
  /** TypeScript type. */
  type: string;
  /** What this return value provides. */
  description: string;
}
