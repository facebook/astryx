// Copyright (c) Meta Platforms, Inc. and affiliates.

import {spec} from '../Screen.spec.mjs';

/** Convert a normalized layout node into the glasses runtime payload shape. */
export function renderPayload({props, children}) {
  return {
    type: spec.payloadType,
    role: spec.nativeRole,
    renderer: spec.renderer,
    theme: spec.theme,
    props,
    children,
  };
}
