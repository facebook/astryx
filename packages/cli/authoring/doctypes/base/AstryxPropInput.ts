// Copyright (c) Meta Platforms, Inc. and affiliates.

/** A single documented prop (mirrors {@link PropDoc}). */
export interface AstryxPropInput {
  name: string;
  type: string;
  description: string;
  default?: string;
  required?: boolean;
  [key: string]: unknown;
}
