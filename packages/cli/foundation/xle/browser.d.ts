// Copyright (c) Meta Platforms, Inc. and affiliates.

/** Type surface for `@astryxdesign/cli/xle` — the browser-safe layout language. */

export interface XLEIssue {
  message: string;
  line?: number;
  col?: number;
  formatted: string;
  suggestions?: string[];
  kind?: string;
}

export interface SerializedRegistry {
  components: Array<{
    name: string;
    exportName: string;
    dirName: string;
    importPath: string;
    undocumented?: boolean;
    props: Array<Record<string, unknown>>;
  }>;
  aliases: Array<[string, string]>;
  componentNames: string[];
}

export interface XLEBlock {
  dirName: string;
  description?: string;
  category?: string;
}

export interface CheckOptions {
  blocks?: XLEBlock[];
  form?: 'auto' | 'compact' | 'outline';
  loose?: boolean;
}

export interface CheckResult {
  ok: boolean;
  valid?: boolean;
  form?: 'compact' | 'outline';
  errors: XLEIssue[];
  warnings: string[];
  compact?: string;
  outline?: string;
  parseError?: {message: string; line?: number; col?: number};
}

export interface ExpandOptions extends CheckOptions {
  name?: string;
}

export type ExpandResult =
  | {ok: false; errors: XLEIssue[]}
  | {
      ok: true;
      form: 'compact' | 'outline';
      code: string;
      componentsUsed: string[];
      states: number;
      todos: string[];
      warnings: string[];
    };

export function checkExpression(
  expression: string,
  registry: SerializedRegistry | object,
  opts?: CheckOptions,
): CheckResult;

export function expandExpression(
  expression: string,
  registry: SerializedRegistry | object,
  opts?: ExpandOptions,
): ExpandResult;

export function hydrateRegistry(json: SerializedRegistry): object;
export function serializeRegistry(registry: object): SerializedRegistry;
export function parse(source: string, opts?: {form?: string}): unknown;
export function detectForm(source: string): 'compact' | 'outline';
export function validate(
  doc: unknown,
  registry: object,
  blocks?: XLEBlock[],
  opts?: {loose?: boolean},
): {errors: XLEIssue[]; warnings: XLEIssue[]};
export function expand(
  doc: unknown,
  registry: object,
  opts?: {componentName?: string},
): {code: string; componentsUsed: string[]; states: number; todos: string[]};
export function toCompact(doc: unknown): string;
export function toOutline(doc: unknown): string;
export const ALIAS_TABLE: Record<string, string>;
export const SPACING_STEPS: number[];
export class XLEParseError extends Error {
  line: number;
  col: number;
}
