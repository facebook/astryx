// Copyright (c) Meta Platforms, Inc. and affiliates.

/** Machine-readable component contract for glasses payload/native renderers. */
export const spec = {
  name: 'Badge',
  target: 'glasses-hud',
  payloadType: 'Badge',
  nativeRole: 'status',
  renderer: {android: 'BadgeRenderer'},
  theme: {component: 'badge', mode: 'ambient-adaptive'},
};
