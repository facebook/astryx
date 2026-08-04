// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {ComponentDoc, HookDoc, ReferenceDoc, TemplateDoc} from './types';
export function parseDoc(input: unknown, label?: string): ComponentDoc | HookDoc | ReferenceDoc | TemplateDoc;
