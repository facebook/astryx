// Copyright (c) Meta Platforms, Inc. and affiliates.

/** Machine-readable component contract for glasses payload/native renderers. */
export const spec = {
  name: 'Screen',
  target: 'glasses-hud',
  payloadType: 'Screen',
  nativeRole: 'surface',
  renderer: {android: 'ScreenRenderer'},
  theme: {component: 'screen', mode: 'ambient-adaptive'},
};
