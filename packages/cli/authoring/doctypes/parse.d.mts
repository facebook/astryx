// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {
  ComponentDoc,
  HookDoc,
  FunctionDoc,
  ReferenceDoc,
  TemplateDoc,
  SchemaDoc,
  CommandDoc,
  EnumDoc,
} from './types';

// Must stay in step with the @returns of parseDoc in ./parse.mjs — one entry per
// doc kind it dispatches to. This declaration shadows the implementation for
// published consumers, so a missing member silently makes that kind unnarrowable.
// check:cli-structure enforces the coverage.
export function parseDoc(
  input: unknown,
  label?: string,
): ComponentDoc | HookDoc | FunctionDoc | ReferenceDoc | TemplateDoc | SchemaDoc | CommandDoc | EnumDoc;
