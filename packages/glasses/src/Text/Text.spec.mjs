// Copyright (c) Meta Platforms, Inc. and affiliates.

/** Machine-readable component contract for glasses payload/native renderers. */
export const spec = {
  name: 'Text',
  target: 'glasses-hud',
  payloadType: 'Text',
  nativeRole: 'text',
  renderer: {android: 'TextRenderer'},
  theme: {component: 'text', mode: 'ambient-adaptive'},
};
