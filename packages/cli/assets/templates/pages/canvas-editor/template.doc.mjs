// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').TemplateDoc} */
export const doc = {
  type: 'page',
  name: 'Canvas Editor',
  displayName: 'Canvas Editor',
  description:
    'Layered artboard workspace: document tabs over a layer rail, a fixed-size frame you zoom on a muted backdrop, and an inspector of position, type, and filter fields that retargets to the selected layer. Objects hold a coordinate rather than reflowing, so moving one never moves another.',
  keywords: [
    'design tool',
    'artboard',
    'poster',
    'graphic',
    'image',
    'slide editor',
  ],
  isReady: true,
  category: 'Tools - Canvas Editor',
  icons: {
    Download: 'download',
    File: 'file',
    Grip: 'drag',
    Image: 'image',
    Italic: 'italic',
    Lock: 'lock',
    LockOpen: 'unlock',
    Menu: 'menu',
    Minus: 'remove',
    Plus: 'add',
    Redo2: 'redo',
    Strikethrough: 'strikethrough',
    Underline: 'underline',
    Undo2: 'undo',
    X: 'close',
  },
};
