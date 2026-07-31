// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Documents a hook parameter/option. Similar to PropDoc but for hook
 * arguments and options object fields.
 */
export interface HookParamDoc {
  /** Parameter or option field name. */
  name: string;
  /** TypeScript type signature as a string. */
  type: string;
  /** What this parameter does. 1-2 sentences. */
  description: string;
  /** Default value as a string, if optional with a default. */
  default?: string;
  /** True if required. Omit if optional. */
  required?: boolean;
}
