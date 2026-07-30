// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file hook.detail leaf — the full authored doc for one hook.
 *
 * Projects the shared hook resolver (see ../_adapter.mjs) into the
 * `hook.detail` envelope. Byte-for-byte identical to the flat command's
 * single-hook branch.
 *
 * @input  hook name + { cwd, zh, lang }
 * @output HookDetailResponse ({ type: 'hook.detail', data: HookDoc })
 * @position api/hook/detail/detail.mjs — dispatched from ../hook.mjs
 */

import {resolveCoreDir, resolveHookDoc} from '../_adapter.mjs';

/**
 * @param {string} name
 * @param {{cwd?: string, zh?: boolean, lang?: string|null}} [options]
 * @returns {Promise<import('../../../types/hook').HookDetailResponse>}
 */
export async function detail(name, {cwd = process.cwd(), zh = false, lang = null} = {}) {
  const coreDir = resolveCoreDir(cwd);
  const docs = await resolveHookDoc(coreDir, name, {zh, lang});
  return {type: 'hook.detail', data: docs};
}
