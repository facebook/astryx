// Copyright (c) Meta Platforms, Inc. and affiliates.

/** Machine-readable component contract for glasses payload/native renderers. */
export const spec = {
  name: 'Button',
  target: 'glasses-hud',
  payloadType: 'Button',
  nativeRole: 'action',
  renderer: {android: 'ButtonRenderer'},
  theme: {component: 'button', mode: 'ambient-adaptive'},
};
