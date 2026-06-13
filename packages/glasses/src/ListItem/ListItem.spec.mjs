// Copyright (c) Meta Platforms, Inc. and affiliates.

/** Machine-readable component contract for glasses payload/native renderers. */
export const spec = {
  name: 'ListItem',
  target: 'glasses-hud',
  payloadType: 'ListItem',
  nativeRole: 'listitem',
  renderer: {android: 'ListItemRenderer'},
  theme: {component: 'listItem', mode: 'ambient-adaptive'},
};
