// Copyright (c) Meta Platforms, Inc. and affiliates.

/** A single documented param (mirrors {@link HookParamDoc}). */
export interface AstryxParamInput {
  name: string;
  type: string;
  description: string;
  default?: string;
  required?: boolean;
  [key: string]: unknown;
}
