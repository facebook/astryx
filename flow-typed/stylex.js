// Copyright (c) Meta Platforms, Inc. and affiliates.
//
// Minimal libdef for @stylexjs/stylex. @types are invisible to Flow, so the
// module surface is stubbed here. Functions are declared with
// `declare export function` so named specifiers bind as values; widen to
// precise types over time.
//
// NOTE: Astryx imports stylex as `import * as stylex from '@stylexjs/stylex'`.
// When Flow checks a .ts/.tsx file, a namespace import (`import * as X`) binds
// as a TYPE, so `stylex.create(...)` still reports [type-as-value]. That is an
// inherent Flow/TS interop limitation (see docs/flow.md), not a gap in this
// libdef — resolving it requires a codemod to named imports.

declare module '@stylexjs/stylex' {
  declare export type StyleXStyles = { readonly [string]: unknown };
  declare export type StaticStyles = { readonly [string]: unknown };
  declare export type Theme<T> = T;
  declare export type VarGroup<T> = T;

  declare export function create<T extends { readonly [string]: unknown }>(
    styles: T,
  ): T;
  declare export function props(
    ...styles: Array<unknown>
  ): { className?: string, style?: { readonly [string]: string | number } };
  declare export function defineVars<T extends { readonly [string]: unknown }>(
    vars: T,
  ): T;
  declare export function defineConsts<T extends { readonly [string]: unknown }>(
    vars: T,
  ): T;
  declare export function createTheme(vars: unknown, overrides: unknown): unknown;
  declare export function keyframes(frames: unknown): string;
  declare export function positionTry(fallback: unknown): string;
  declare export function firstThatWorks<T>(...values: Array<T>): T;
}
