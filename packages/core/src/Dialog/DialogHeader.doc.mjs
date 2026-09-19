// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'DialogHeader',
  subComponentOf: 'Dialog',
  displayName: 'Dialog Header',
  isHiddenFromOverview: true,
  description: 'Header for dialogs with a title, optional subtitle, close button, and start/end content slots.',
  usage: {
    description: 'Use DialogHeader to give a dialog a labelled title area and optional close control.',
    anatomy: [
      {name: 'Header row', required: true, description: 'Arranges the title block, optional start/end content, and close control.'},
      {name: 'Title block', required: true, description: 'Groups the title and optional subtitle.'},
      {name: 'Close icon', required: false, description: 'Visual close glyph inside the close button.'},
    ],
  },
  props: [
    {
      name: 'title',
      type: 'string',
      description: 'Dialog title (receives focus on open and labels the dialog via aria-labelledby).',
    },
    {
      name: 'subtitle',
      type: 'string',
      description: 'Subtitle below the title.',
    },
    {
      name: 'onOpenChange',
      type: '(isOpen: boolean) => unknown',
      description: 'Close button callback (no button if omitted).',
    },
    {
      name: 'startContent',
      type: 'ReactNode',
      description: 'Content before the title (e.g., a back button).',
      slotElements: [
        {
          __element: 'Icon',
          props: {
            icon: 'check',
            size: 'sm',
          },
        },
      ],
    },
    {
      name: 'endContent',
      type: 'ReactNode',
      description: 'Content after the title, before close button.',
      slotElements: [
        {
          __element: 'Icon',
          props: {
            icon: 'chevronDown',
            size: 'sm',
          },
        },
        {
          __element: 'Badge',
          props: {
            label: '3',
          },
        },
      ],
    },
    {
      name: 'hasDivider',
      type: 'boolean',
      description: 'Adds border at the bottom edge.',
      default: 'true',
    },
  ],
  playground: {
    defaults: {
      title: 'Delete file?',
      subtitle: 'This action cannot be undone.',
      hasDivider: true,
    },
  },
  theming: {
    targets: [
      {className: 'astryx-dialog-header'},
      {className: 'astryx-dialog-header-title-block'},
      {className: 'astryx-dialog-header-close-icon'},
    ],
  },
  examples: [
    {
      label: 'Basic',
      code: `
import {DialogHeader} from '@astryxdesign/core/Dialog';

<DialogHeader title="Delete file?" subtitle="This action cannot be undone." />;
`,
    },
    {
      label: 'With close button',
      code: `
import {useState} from 'react';
import {DialogHeader} from '@astryxdesign/core/Dialog';

function Header() {
  const [, setIsOpen] = useState(true);

  // Passing onOpenChange renders a close button that calls it with false.
  return <DialogHeader title="Settings" onOpenChange={setIsOpen} />;
}
`,
    },
    {
      label: 'With start and end content',
      code: `
import {DialogHeader} from '@astryxdesign/core/Dialog';
import {Icon} from '@astryxdesign/core/Icon';
import {Badge} from '@astryxdesign/core/Badge';

<DialogHeader
  title="Notifications"
  startContent={<Icon icon="chevronLeft" size="sm" />}
  endContent={<Badge label="3" />}
/>;
`,
    },
  ],
};

export const docsZh = {
  name: 'DialogHeader',
  isHiddenFromOverview: true,
  displayName: 'Dialog Header',
  description: '对话框头部，包含标题、可选副标题、关闭按钮以及首尾内容插槽。',
  usage: {
    description: '使用 DialogHeader 为对话框提供带标签的标题区和可选的关闭控件。',
    anatomy: [
      {name: 'Header row', required: true, description: '排列标题区、可选的首尾内容和关闭控件。'},
      {name: 'Title block', required: true, description: '组合标题和可选副标题。'},
      {name: 'Close icon', required: false, description: '关闭按钮内的关闭图标。'},
    ],
  },
  props: [
    {
      name: 'title',
      type: 'string',
      description: '对话框标题（打开时获得焦点）。',
    },
    {
      name: 'subtitle',
      type: 'string',
      description: '标题下方的副标题。',
    },
    {
      name: 'onOpenChange',
      type: '(isOpen: boolean) => unknown',
      description: '关闭按钮的回调（省略时不显示按钮）。',
    },
    {
      name: 'startContent',
      type: 'ReactNode',
      description: '标题之前的内容（例如返回按钮）。',
    },
    {
      name: 'endContent',
      type: 'ReactNode',
      description: '标题之后、关闭按钮之前的内容。',
    },
    {
      name: 'hasDivider',
      type: 'boolean',
      description: '在底部边缘添加分隔线。',
      default: 'true',
    },
  ],
  theming: {
    targets: [
      {className: 'astryx-dialog-header'},
      {className: 'astryx-dialog-header-title-block'},
      {className: 'astryx-dialog-header-close-icon'},
    ],
  },
};

export const docsDense = {
  name: 'DialogHeader',
  isHiddenFromOverview: true,
  displayName: 'Dialog Header',
  description: 'dialog header w/ title, optional subtitle, close button, start/end content slots',
  usage: {
    description: 'labelled dialog title area + optional close control',
    anatomy: [
      {name: 'Header row', required: true, description: 'arranges title block, optional start/end content, close control'},
      {name: 'Title block', required: true, description: 'groups title + optional subtitle'},
      {name: 'Close icon', required: false, description: 'close glyph inside close button'},
    ],
  },
  propDescriptions: {
    title: 'dialog title (focused on open; labels dialog via aria-labelledby)',
    subtitle: 'subtitle below title',
    onOpenChange: 'close button callback (omit=no button)',
    startContent: 'content before title (e.g. back button)',
    endContent: 'content after title, before close button',
    hasDivider: 'bottom border',
  },
};
