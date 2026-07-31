// Copyright (c) Meta Platforms, Inc. and affiliates.

/** A single documented return field (mirrors {@link HookReturnDoc}). */
export interface AstryxReturnInput {
  name: string;
  type: string;
  description: string;
  [key: string]: unknown;
}
