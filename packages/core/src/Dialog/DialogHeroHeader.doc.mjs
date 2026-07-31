// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'DialogHeroHeader',
  subComponentOf: 'Dialog',
  displayName: 'Dialog Hero Header',
  isHiddenFromOverview: true,
  description:
    'Prominent, hero-style header for dialogs — the high-emphasis sibling of DialogHeader. Adds an optional media/visual slot and eyebrow above a display-scale title, centered by default. Use for featured, marketing, or onboarding moments.',
  props: [
    {
      name: 'title',
      type: 'string',
      description:
        'Dialog title at hero (display) scale (receives focus on open and labels the dialog via aria-labelledby).',
    },
    {
      name: 'subtitle',
      type: 'string',
      description: 'Supporting text below the title, in secondary color.',
    },
    {
      name: 'eyebrow',
      type: 'string',
      description: 'Short overline above the title, in accent color.',
    },
    {
      name: 'media',
      type: 'ReactNode',
      description:
        'Visual slot above the title (illustration, image, or icon tile).',
      slotElements: [
        {
          __element: 'Icon',
          props: {
            icon: 'success',
            size: 'lg',
            color: 'accent',
          },
        },
      ],
    },
    {
      name: 'align',
      type: "'center' | 'start'",
      description: 'Horizontal alignment of the hero content.',
      default: "'center'",
    },
    {
      name: 'onOpenChange',
      type: '(isOpen: boolean) => unknown',
      description: 'Close button callback (no button if omitted).',
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
      eyebrow: 'Welcome',
      title: "You're all set up",
      subtitle: 'Your workspace is ready. Invite your team to get started.',
      align: 'center',
      hasDivider: false,
    },
  },
  examples: [
    {
      label: 'Basic',
      code: `
import {DialogHeroHeader} from '@astryxdesign/core/Dialog';

<DialogHeroHeader
  eyebrow="Welcome"
  title="You're all set up"
  subtitle="Your workspace is ready. Invite your team to get started."
/>;
`,
    },
    {
      label: 'With media and close button',
      code: `
import {useState} from 'react';
import {DialogHeroHeader} from '@astryxdesign/core/Dialog';
import {Icon} from '@astryxdesign/core/Icon';

function Header() {
  const [, setIsOpen] = useState(true);

  // Passing onOpenChange renders a close button that calls it with false.
  return (
    <DialogHeroHeader
      media={<Icon icon="success" size="lg" color="accent" />}
      title="Payment successful"
      subtitle="A receipt has been sent to your email."
      onOpenChange={setIsOpen}
    />
  );
}
`,
    },
    {
      label: 'Start-aligned',
      code: `
import {DialogHeroHeader} from '@astryxdesign/core/Dialog';

<DialogHeroHeader
  align="start"
  eyebrow="New feature"
  title="Introducing Insights"
  subtitle="Track how your team uses the workspace over time."
/>;
`,
    },
  ],
};

export const docsZh = {
  name: 'DialogHeroHeader',
  isHiddenFromOverview: true,
  displayName: 'Dialog Hero Header',
  description:
    '突出的英雄式对话框头部——DialogHeader 的高强调版本。在超大标题上方增加可选的媒体/视觉插槽和眉标，默认居中。适用于精选、营销或引导场景。',
  props: [
    {
      name: 'title',
      type: 'string',
      description: '英雄（展示）尺寸的对话框标题（打开时获得焦点）。',
    },
    {
      name: 'subtitle',
      type: 'string',
      description: '标题下方的支持性文字，使用次要颜色。',
    },
    {
      name: 'eyebrow',
      type: 'string',
      description: '标题上方的简短眉标，使用强调色。',
    },
    {
      name: 'media',
      type: 'ReactNode',
      description: '标题上方的视觉插槽（插画、图片或图标）。',
    },
    {
      name: 'align',
      type: "'center' | 'start'",
      description: '英雄内容的水平对齐方式。',
      default: "'center'",
    },
    {
      name: 'onOpenChange',
      type: '(isOpen: boolean) => unknown',
      description: '关闭按钮的回调（省略时不显示按钮）。',
    },
    {
      name: 'hasDivider',
      type: 'boolean',
      description: '在底部边缘添加分隔线。',
      default: 'true',
    },
  ],
};

export const docsDense = {
  name: 'DialogHeroHeader',
  isHiddenFromOverview: true,
  displayName: 'Dialog Hero Header',
  description:
    'prominent hero-style dialog header (sibling of DialogHeader) w/ media slot + eyebrow above display-scale title; centered by default',
  propDescriptions: {
    title:
      'hero-scale dialog title (focused on open; labels dialog via aria-labelledby)',
    subtitle: 'supporting text below title (secondary)',
    eyebrow: 'short overline above title (accent)',
    media: 'visual slot above title (illustration/image/icon)',
    align: "content alignment: 'center' (default) | 'start'",
    onOpenChange: 'close button callback (omit=no button)',
    hasDivider: 'bottom border',
  },
};
