// Copyright (c) Meta Platforms, Inc. and affiliates.

/** Machine-readable component contract for glasses payload/native renderers. */
export const spec = {
  name: 'HStack',
  target: 'glasses-hud',
  payloadType: 'HStack',
  nativeRole: 'layout',
  renderer: {android: 'StackRenderer'},
  theme: {component: 'stack', mode: 'ambient-adaptive'},
};
