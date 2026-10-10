// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'ChatMessage',
  subComponentOf: 'Chat',
  displayName: 'Chat Message',
  description:
    'Sender context wrapper: handles avatar, name, metadata, and alignment based on sender role.',
  playground: {
    defaults: {
      sender: 'assistant',
      children: {
        __element: 'ChatMessageBubble',
        children: 'Here is the summary you asked for.',
      },
      avatar: {__element: 'Avatar', props: {name: 'Astra', size: 'sm'}},
    },
    wrapper: {component: 'Stack', props: {width: 480}},
  },
  props: [
    {
      name: 'sender',
      type: "'user' | 'assistant' | 'system'",
      description: 'Who sent this message: controls alignment and layout.',
      required: true,
    },
    {
      name: 'children',
      type: 'ReactNode',
      description:
        'Free-form content: bubbles, asset lists, tool calls, images. Custom (non-bubble) children render flush with the message edge; wrap them in a ghost ChatMessageBubble to align them with the bubble text column.',
      required: true,
      slotElements: [
        {
          __element: 'ChatMessageBubble',
          children: 'Message text',
        },
      ],
    },
    {
      name: 'avatar',
      type: 'ReactNode',
      description:
        'Avatar element rendered beside the message. Typically Avatar. Booleans, empty strings, and arrays, Fragments, or synchronous iterables with no renderable descendants do not create a slot. Non-Fragment elements are treated as content; component output is not inspected. Cyclic composite content is rejected.',
      slotElements: [
        {
          __element: 'Avatar',
          props: {
            name: 'User',
            size: 'sm',
          },
        },
      ],
    },
    {
      name: 'name',
      type: 'ReactNode',
      description:
        "Sender name rendered above the message body. Booleans, empty strings, and arrays, Fragments, or synchronous iterables with no renderable descendants use the translated sender fallback label. Non-Fragment elements are treated as content; component output is not inspected. Cyclic composite content is rejected. Use when the first child is raw content (not a bubble). If the first child is a bubble, put the name on the bubble's `name` prop instead.",
    },
    {
      name: 'metadata',
      type: 'ReactNode',
      description:
        "Metadata rendered below the message body. Booleans, empty strings, and arrays, Fragments, or synchronous iterables with no renderable descendants do not create a slot. Non-Fragment elements are treated as content; component output is not inspected. Cyclic composite content is rejected. Use when the last child is raw content (not a bubble). If the last child is a bubble, put metadata on the bubble's `metadata` prop instead.",
      slotElements: [
        {
          __element: 'Text',
          props: {
            type: 'body',
          },
          children: 'Metadata',
        },
      ],
    },
    {
      name: 'density',
      type: "'compact' | 'balanced' | 'spacious'",
      description: 'Visual density. Inherited from list context if not set.',
      default: "'balanced'",
    },
  ],
};

export const docsZh = {
  name: 'ChatMessage',
  displayName: 'Chat Message',
  description:
    '发送者上下文包装器，根据发送者角色处理头像、名称、元数据和对齐方式。',
  propDescriptions: {
    sender: '消息发送者，控制对齐和布局。',
    children:
      '自由内容：气泡、资源列表、工具调用、图片。非气泡的自定义子内容默认与消息边缘齐平，可用 ghost 变体的 ChatMessageBubble 包裹使其与气泡文本列对齐。',
    avatar:
      '消息旁边渲染的头像元素。通常是 Avatar。布尔值、空字符串以及不含可渲染后代的数组、Fragment 或同步 iterable 不会创建槽位；非 Fragment 元素会被视为内容，组件输出不会被预先检查；循环复合内容会被拒绝。',
    name: '消息正文上方渲染的发送者名称。布尔值、空字符串以及不含可渲染后代的数组、Fragment 或同步 iterable 会改用本地化发送者标签；非 Fragment 元素会被视为内容，组件输出不会被预先检查；循环复合内容会被拒绝。当第一个子元素不是气泡时使用。',
    metadata:
      '消息正文下方渲染的元数据。布尔值、空字符串以及不含可渲染后代的数组、Fragment 或同步 iterable 不会创建槽位；非 Fragment 元素会被视为内容，组件输出不会被预先检查；循环复合内容会被拒绝。当最后一个子元素不是气泡时使用。',
    density: '视觉密度。未设置时从列表上下文继承。',
  },
};

export const docsDense = {
  name: 'ChatMessage',
  displayName: 'Chat Message',
  description:
    'sender context wrapper; handles avatar+name+metadata+alignment by sender role',
  propDescriptions: {
    sender: 'who sent; controls alignment+layout',
    children:
      'free-form: bubbles, assets, tool calls, images; wrap non-bubble content in a ghost bubble to align with bubble text column',
    avatar:
      'avatar beside msg; inspectably empty scalars/arrays/Fragments/iterables omit slot; non-Fragment elements count as content; cycles rejected',
    name: 'sender name above body; inspectably empty scalars/arrays/Fragments/iterables use fallback label; non-Fragment elements count as content; cycles rejected; use when first child is raw',
    displayName:
      'sender name above body; use when first child is raw (not bubble)',
    metadata:
      'metadata below body; inspectably empty scalars/arrays/Fragments/iterables omit slot; non-Fragment elements count as content; cycles rejected; use when last child is raw',
    density: 'visual density; inherited from list context if unset',
  },
};
