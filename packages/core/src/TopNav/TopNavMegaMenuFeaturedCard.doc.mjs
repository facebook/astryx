// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'TopNavMegaMenuFeaturedCard',
  subComponentOf: 'TopNav',
  displayName: 'Top Nav Mega Menu Featured Card',
  description: 'Standard featured card for the XDSTopNavMegaMenu featured slot. Provides a consistent card with optional image, title, description, and CTA link.',
  props: [
    {
      name: 'title',
      type: 'string',
      description: 'Card title.',
      required: true,
    },
    {
      name: 'description',
      type: 'string',
      description: 'Description text below the title.',
    },
    {
      name: 'image',
      type: 'string',
      description: 'Optional image URL displayed above the body.',
    },
    {
      name: 'imageAlt',
      type: 'string',
      description: 'Alt text for the image.',
    },
    {
      name: 'linkLabel',
      type: 'string',
      description: 'CTA link text.',
    },
    {
      name: 'linkHref',
      type: 'string',
      description: 'CTA link URL.',
    },
    {
      name: 'children',
      type: 'ReactNode',
      description: 'Custom content rendered below the standard body.',
    },
  ],
};

export const docsZh = {
  name: 'TopNavMegaMenuFeaturedCard',
  displayName: 'Top Nav Mega Menu Featured Card',
  description: '超级菜单 featured 插槽的标准特色卡片。提供带可选图片、标题、描述和 CTA 链接的一致卡片。',
  props: [
    {
      name: 'title',
      type: 'string',
      description: '卡片标题。',
      required: true,
    },
    {
      name: 'description',
      type: 'string',
      description: '标题下方的描述文本。',
    },
    {
      name: 'image',
      type: 'string',
      description: '正文上方显示的可选图片 URL。',
    },
    {
      name: 'imageAlt',
      type: 'string',
      description: '图片的替代文本。',
    },
    {
      name: 'linkLabel',
      type: 'string',
      description: 'CTA 链接文本。',
    },
    {
      name: 'linkHref',
      type: 'string',
      description: 'CTA 链接 URL。',
    },
    {
      name: 'children',
      type: 'ReactNode',
      description: '标准正文下方渲染的自定义内容。',
    },
  ],
};

export const docsDense = {
  name: 'TopNavMegaMenuFeaturedCard',
  displayName: 'Top Nav Mega Menu Featured Card',
  description: 'Standard featured card for mega menu featured slot. Optional image, title, description, CTA link.',
  propDescriptions: {
    title: 'Card title.',
    description: 'Description below title.',
    image: 'Image URL above body.',
    imageAlt: 'Image alt text.',
    linkLabel: 'CTA link text.',
    linkHref: 'CTA link URL.',
    children: 'Custom content below standard body.',
  },
};
