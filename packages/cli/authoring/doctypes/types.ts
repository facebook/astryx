// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Doc-type vocabulary barrel. Each kind's types live in one `type.ts`
 * under its folder (`base/` shared leaves, then `component/`, `hook/`,
 * `reference/`, `template/`); this re-exports them as the full doc vocabulary
 * behind `@astryxdesign/cli/authoring`.
 */

export type * from './base/type';
export type * from './component/type';
export type * from './hook/type';
export type * from './reference/type';
export type * from './template/type';
