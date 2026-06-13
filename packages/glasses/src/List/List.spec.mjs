// Copyright (c) Meta Platforms, Inc. and affiliates.

/** Machine-readable component contract for glasses payload/native renderers. */
export const spec = {
  name: 'List',
  target: 'glasses-hud',
  payloadType: 'List',
  nativeRole: 'list',
  renderer: {android: 'ListRenderer'},
  theme: {component: 'list', mode: 'ambient-adaptive'},
};
