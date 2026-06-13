// Copyright (c) Meta Platforms, Inc. and affiliates.

/** Machine-readable component contract for glasses payload/native renderers. */
export const spec = {
  name: 'Card',
  target: 'glasses-hud',
  payloadType: 'Card',
  nativeRole: 'container',
  renderer: {android: 'CardRenderer'},
  theme: {component: 'card', mode: 'ambient-adaptive'},
};
