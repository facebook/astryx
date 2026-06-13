// Copyright (c) Meta Platforms, Inc. and affiliates.

/** Machine-readable component contract for glasses payload/native renderers. */
export const spec = {
  name: 'Heading',
  target: 'glasses-hud',
  payloadType: 'Heading',
  nativeRole: 'heading',
  renderer: {android: 'TextRenderer'},
  theme: {component: 'heading', mode: 'ambient-adaptive'},
};
