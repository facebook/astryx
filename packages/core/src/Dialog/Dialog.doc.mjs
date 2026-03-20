/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'Dialog',
  description:
    'Modal dialog using the native <dialog> element with automatic focus trapping, backdrop, and purpose-based dismissal control.',
  features: [
    "Native <dialog>: Uses the browser's built-in modal behavior via showModal()",
    'Automatic focus trap: Focus is trapped within the dialog when open (browser-native)',
    'Backdrop: Native ::backdrop pseudo-element with blur effect',
    'Variants: standard (configurable dimensions) and fullscreen (full viewport)',
    'Purpose-based dismissal: required, form, and info control Escape key and backdrop-click behavior',
    'Custom positioning: Static position support via the position prop',
    'Accessible: Proper ARIA attributes and keyboard navigation',
  ],
  examples: [
    {
      label: 'Basic dialog with Layout',
      code: `import {XDSDialog} from '@xds/core/Dialog';
import {
  XDSLayout,
  XDSLayoutHeader,
  XDSLayoutContent,
  XDSLayoutFooter,
} from '@xds/core/Layout';
import {XDSButton} from '@xds/core/Button';
import {useState} from 'react';

function Example() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <XDSButton label="Open Dialog" onClick={() => setIsOpen(true)} />

      <XDSDialog isOpen={isOpen} onOpenChange={open => setIsOpen(open)}>
        <XDSLayout
          header={<XDSLayoutHeader hasDivider>Title</XDSLayoutHeader>}
          content={<XDSLayoutContent>Content goes here</XDSLayoutContent>}
          footer={
            <XDSLayoutFooter hasDivider>
              <XDSButton
                label="Cancel"
                variant="secondary"
                onClick={() => setIsOpen(false)}
              />
              <XDSButton
                label="Confirm"
                variant="primary"
                onClick={() => setIsOpen(false)}
              />
            </XDSLayoutFooter>
          }
        />
      </XDSDialog>
    </>
  );
}`,
    },
    {
      label: 'Static position',
      code: `<XDSDialog
  isOpen={isOpen}
  onOpenChange={open => setIsOpen(open)}
  position={{top: 100, right: 20}}>
  {/* content */}
</XDSDialog>`,
    },
    {
      label: 'Fullscreen variant',
      code: `<XDSDialog
  isOpen={isOpen}
  onOpenChange={open => setIsOpen(open)}
  variant="fullscreen">
  <XDSLayout
    header={<XDSLayoutHeader hasDivider>Full-screen title</XDSLayoutHeader>}
    content={<XDSLayoutContent>Content goes here</XDSLayoutContent>}
    footer={
      <XDSLayoutFooter hasDivider>
        <XDSButton label="Close" onClick={() => setIsOpen(false)} />
      </XDSLayoutFooter>
    }
  />
</XDSDialog>`,
    },
    {
      label: 'Required purpose (non-dismissible)',
      code: `<XDSDialog
  isOpen={isOpen}
  onOpenChange={open => setIsOpen(open)}
  purpose="required">
  {/* user must take an explicit action to close */}
</XDSDialog>`,
    },
    {
      label: 'XDSDialogHeader with close button',
      code: `<XDSDialogHeader
  title="Confirm Action"
  subtitle="This cannot be undone"
  onOpenChange={open => setIsOpen(open)}
/>`,
    },
  ],
  theming: {
    targets: [
      {className: 'xds-dialog', visualProps: ['variant']},
    ],
    vars: [
      {name: '--dialog-radius', description: 'Border radius of the dialog', default: 'var(--radius-3)'},
    ],
  },
  keyboard:
    'Escape closes the dialog (unless purpose="required"); focus is trapped inside the dialog while open.',
  accessibility: [
    'Uses the native <dialog> element with showModal() for correct ARIA modal semantics.',
    'Focus is automatically trapped by the browser when using showModal().',
    'XDSDialogHeader title receives focus when the dialog opens.',
  ],
  notes: [
    'Height is unset (grows with content) and constrained by the maxHeight prop.',
    'When variant="fullscreen", the width, maxHeight, and position props are ignored.',
    'For form purpose, backdrop click is only allowed before the user has interacted with the dialog.',
    'Purpose=required disables both Escape key and backdrop click; purpose=form disables backdrop click after interaction; purpose=info (default) allows both.',
    'XDSDialog is designed to be used with XDSLayout as its child.',
  ],
  components: [
    {
      name: 'XDSDialog',
      description: 'Modal dialog using the native <dialog> element.',
      props: [
        {
          name: 'isOpen',
          type: 'boolean',
          description: 'Whether the dialog is open (required).',
          required: true,
        },
        {
          name: 'onOpenChange',
          type: '(isOpen: boolean) => unknown',
          description: 'Callback when dialog visibility changes (required).',
          required: true,
        },
        {
          name: 'children',
          type: 'ReactNode',
          description: 'Dialog content.',
          required: true,
        },
        {
          name: 'width',
          type: 'number | string',
          description: 'Width of the dialog in pixels or any CSS value.',
          default: '400',
        },
        {
          name: 'maxHeight',
          type: 'number | string',
          description: 'Maximum height of the dialog.',
          default: "'75vh'",
        },
        {
          name: 'position',
          type: 'XDSDialogPosition',
          description:
            'Static position for the dialog; centered by default when omitted.',
        },
        {
          name: 'variant',
          type: "'standard' | 'fullscreen'",
          description:
            'Dialog variant — fullscreen expands to fill the entire viewport.',
          default: "'standard'",
        },
        {
          name: 'purpose',
          type: "'required' | 'form' | 'info'",
          description:
            'Controls dismissal behavior: required disables Escape and backdrop click; form disables backdrop click after interaction; info allows both.',
          default: "'info'",
        },
      ],
      examples: [
        {
          label: 'Basic',
          code: `<XDSDialog isOpen={isOpen} onOpenChange={open => setIsOpen(open)}>
  <XDSLayout
    header={<XDSLayoutHeader hasDivider>Title</XDSLayoutHeader>}
    content={<XDSLayoutContent>Content goes here</XDSLayoutContent>}
    footer={
      <XDSLayoutFooter hasDivider>
        <XDSButton label="Confirm" variant="primary" onClick={() => setIsOpen(false)} />
      </XDSLayoutFooter>
    }
  />
</XDSDialog>`,
        },
      ],
    },
    {
      name: 'XDSDialogHeader',
      description:
        'Header for dialogs with a title, optional subtitle, close button, and start/end content slots.',
      props: [
        {
          name: 'title',
          type: 'string',
          description: 'Dialog title (receives focus on open).',
        },
        {
          name: 'subtitle',
          type: 'string',
          description: 'Subtitle below the title.',
        },
        {
          name: 'onOpenChange',
          type: '(isOpen: boolean) => unknown',
          description:
            'Close button callback (no button if omitted).',
        },
        {
          name: 'startContent',
          type: 'ReactNode',
          description:
            'Content before the title (e.g., a back button).',
        },
        {
          name: 'endContent',
          type: 'ReactNode',
          description:
            'Content after the title, before close button.',
        },
        {
          name: 'hasDivider',
          type: 'boolean',
          description: 'Adds border at the bottom edge.',
          default: 'true',
        },
      ],
      examples: [
        {
          label: 'With title, subtitle, and close button',
          code: `<XDSDialogHeader
  title="Confirm Action"
  subtitle="This cannot be undone"
  onOpenChange={open => setIsOpen(open)}
/>`,
        },
        {
          label: 'With start content (back button)',
          code: `<XDSDialogHeader
  title="Step 2 of 3"
  startContent={<XDSButton label="Back" variant="secondary" onClick={goBack} />}
  onOpenChange={open => setIsOpen(open)}
/>`,
        },
      ],
    },
  ],
};

/** @type {import('../docs-types').ComponentDoc} */
export const docsZh = {
  name: 'Dialog',
  description:
    '使用原生 <dialog> 元素的模态对话框，支持自动焦点捕获、遮罩层和基于用途的关闭控制。',
  features: [
    '原生 <dialog>：通过 showModal() 使用浏览器内置的模态行为',
    '自动焦点捕获：对话框打开时焦点被限制在内部（浏览器原生支持）',
    '遮罩层：原生 ::backdrop 伪元素，带模糊效果',
    '变体：standard（可配置尺寸）和 fullscreen（全视口）',
    '基于用途的关闭控制：required、form 和 info 控制 Escape 键和遮罩层点击行为',
    '自定义定位：通过 position 属性支持静态定位',
    '无障碍：正确的 ARIA 属性和键盘导航',
  ],
  examples: [
    {
      label: '带布局的基础对话框',
      code: `import {XDSDialog} from '@xds/core/Dialog';
import {
  XDSLayout,
  XDSLayoutHeader,
  XDSLayoutContent,
  XDSLayoutFooter,
} from '@xds/core/Layout';
import {XDSButton} from '@xds/core/Button';
import {useState} from 'react';

function Example() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <XDSButton label="Open Dialog" onClick={() => setIsOpen(true)} />

      <XDSDialog isOpen={isOpen} onOpenChange={open => setIsOpen(open)}>
        <XDSLayout
          header={<XDSLayoutHeader hasDivider>Title</XDSLayoutHeader>}
          content={<XDSLayoutContent>Content goes here</XDSLayoutContent>}
          footer={
            <XDSLayoutFooter hasDivider>
              <XDSButton
                label="Cancel"
                variant="secondary"
                onClick={() => setIsOpen(false)}
              />
              <XDSButton
                label="Confirm"
                variant="primary"
                onClick={() => setIsOpen(false)}
              />
            </XDSLayoutFooter>
          }
        />
      </XDSDialog>
    </>
  );
}`,
    },
    {
      label: '静态定位',
      code: `<XDSDialog
  isOpen={isOpen}
  onOpenChange={open => setIsOpen(open)}
  position={{top: 100, right: 20}}>
  {/* content */}
</XDSDialog>`,
    },
    {
      label: '全屏变体',
      code: `<XDSDialog
  isOpen={isOpen}
  onOpenChange={open => setIsOpen(open)}
  variant="fullscreen">
  <XDSLayout
    header={<XDSLayoutHeader hasDivider>Full-screen title</XDSLayoutHeader>}
    content={<XDSLayoutContent>Content goes here</XDSLayoutContent>}
    footer={
      <XDSLayoutFooter hasDivider>
        <XDSButton label="Close" onClick={() => setIsOpen(false)} />
      </XDSLayoutFooter>
    }
  />
</XDSDialog>`,
    },
    {
      label: 'required 用途（不可关闭）',
      code: `<XDSDialog
  isOpen={isOpen}
  onOpenChange={open => setIsOpen(open)}
  purpose="required">
  {/* user must take an explicit action to close */}
</XDSDialog>`,
    },
    {
      label: '带关闭按钮的 XDSDialogHeader',
      code: `<XDSDialogHeader
  title="Confirm Action"
  subtitle="This cannot be undone"
  onOpenChange={open => setIsOpen(open)}
/>`,
    },
  ],
  theming: {
    targets: [
      {className: 'xds-dialog', visualProps: ['variant']},
    ],
    vars: [
      {name: '--dialog-radius', description: 'Border radius of the dialog', default: 'var(--radius-3)'},
    ],
  },
  keyboard:
    'Escape 关闭对话框（purpose="required" 时除外）；对话框打开时焦点被限制在内部。',
  accessibility: [
    '使用原生 <dialog> 元素配合 showModal() 以获得正确的 ARIA 模态语义。',
    '使用 showModal() 时，浏览器会自动捕获焦点。',
    '对话框打开时，XDSDialogHeader 的标题会获得焦点。',
  ],
  notes: [
    '高度未设置（随内容增长），受 maxHeight 属性约束。',
    '当 variant="fullscreen" 时，width、maxHeight 和 position 属性会被忽略。',
    '对于 form 用途，仅在用户与对话框交互之前允许点击遮罩层关闭。',
    'purpose=required 禁用 Escape 键和遮罩层点击；purpose=form 在交互后禁用遮罩层点击；purpose=info（默认）两者都允许。',
    'XDSDialog 设计为与 XDSLayout 配合使用作为其子组件。',
  ],
  components: [
    {
      name: 'XDSDialog',
      description: '使用原生 <dialog> 元素的模态对话框。',
      props: [
        {
          name: 'isOpen',
          type: 'boolean',
          description: '对话框是否打开（必填）。',
          required: true,
        },
        {
          name: 'onOpenChange',
          type: '(isOpen: boolean) => unknown',
          description: '对话框可见性变化时的回调（必填）。',
          required: true,
        },
        {
          name: 'children',
          type: 'ReactNode',
          description: '对话框内容。',
          required: true,
        },
        {
          name: 'width',
          type: 'number | string',
          description: '对话框的宽度，单位为像素或任意 CSS 值。',
          default: '400',
        },
        {
          name: 'maxHeight',
          type: 'number | string',
          description: '对话框的最大高度。',
          default: "'75vh'",
        },
        {
          name: 'position',
          type: 'XDSDialogPosition',
          description:
            '对话框的静态定位；省略时默认居中。',
        },
        {
          name: 'variant',
          type: "'standard' | 'fullscreen'",
          description:
            '对话框变体 - fullscreen 会扩展至填满整个视口。',
          default: "'standard'",
        },
        {
          name: 'purpose',
          type: "'required' | 'form' | 'info'",
          description:
            '控制关闭行为：required 禁用 Escape 和遮罩层点击；form 在交互后禁用遮罩层点击；info 两者都允许。',
          default: "'info'",
        },
      ],
      examples: [
        {
          label: '基础用法',
          code: `<XDSDialog isOpen={isOpen} onOpenChange={open => setIsOpen(open)}>
  <XDSLayout
    header={<XDSLayoutHeader hasDivider>Title</XDSLayoutHeader>}
    content={<XDSLayoutContent>Content goes here</XDSLayoutContent>}
    footer={
      <XDSLayoutFooter hasDivider>
        <XDSButton label="Confirm" variant="primary" onClick={() => setIsOpen(false)} />
      </XDSLayoutFooter>
    }
  />
</XDSDialog>`,
        },
      ],
    },
    {
      name: 'XDSDialogHeader',
      description:
        '对话框头部，包含标题、可选副标题、关闭按钮以及首尾内容插槽。',
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
          description:
            '关闭按钮的回调（省略时不显示按钮）。',
        },
        {
          name: 'startContent',
          type: 'ReactNode',
          description:
            '标题之前的内容（例如返回按钮）。',
        },
        {
          name: 'endContent',
          type: 'ReactNode',
          description:
            '标题之后、关闭按钮之前的内容。',
        },
        {
          name: 'hasDivider',
          type: 'boolean',
          description: '在底部边缘添加分隔线。',
          default: 'true',
        },
      ],
      examples: [
        {
          label: '带标题、副标题和关闭按钮',
          code: `<XDSDialogHeader
  title="Confirm Action"
  subtitle="This cannot be undone"
  onOpenChange={open => setIsOpen(open)}
/>`,
        },
        {
          label: '带起始内容（返回按钮）',
          code: `<XDSDialogHeader
  title="Step 2 of 3"
  startContent={<XDSButton label="Back" variant="secondary" onClick={goBack} />}
  onOpenChange={open => setIsOpen(open)}
/>`,
        },
      ],
    },
  ],
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description: 'modal dialog using native <dialog> w/ auto focus trapping, backdrop, purpose-based dismissal',
  features: [
    'native <dialog>: browser built-in modal via showModal()',
    'auto focus trap inside dialog (browser-native)',
    'native ::backdrop pseudo-element w/ blur',
    'variants: standard (configurable dims) + fullscreen (full viewport)',
    'purpose-based dismissal: required, form, info control Escape+backdrop-click',
    'static position via position prop',
    'proper ARIA attrs + keyboard nav',
  ],
  keyboard: 'Escape closes dialog (unless purpose="required"); focus trapped inside while open',
  accessibility: [
    'native <dialog> w/ showModal() for correct ARIA modal semantics',
    'focus auto-trapped by browser via showModal()',
    'XDSDialogHeader title receives focus on open',
  ],
  notes: [
    'height unset (grows w/ content), constrained by maxHeight',
    'variant="fullscreen" ignores width, maxHeight, position',
    'form purpose: backdrop click only allowed before user interaction',
    'required=no Escape+no backdrop click; form=no backdrop click after interaction; info=both allowed',
    'designed for use w/ XDSLayout as child',
  ],
  components: [
    {
      name: 'XDSDialog',
      description: 'modal dialog using native <dialog>',
      propDescriptions: {
        isOpen: 'dialog open state',
        onOpenChange: 'callback on visibility change',
        children: 'dialog content',
        width: 'dialog width (px or CSS)',
        maxHeight: 'max dialog height',
        position: 'static position; centered by default',
        variant: 'standard or fullscreen (fills viewport)',
        purpose: 'dismissal behavior: required=no dismiss; form=no backdrop after interaction; info=both allowed',
      },
    },
    {
      name: 'XDSDialogHeader',
      description: 'dialog header w/ title, optional subtitle, close button, start/end content slots',
      propDescriptions: {
        title: 'dialog title (receives focus on open)',
        subtitle: 'subtitle below title',
        onOpenChange: 'close button callback (omit=no button)',
        startContent: 'content before title (e.g. back button)',
        endContent: 'content after title, before close button',
        hasDivider: 'bottom border',
      },
    },
  ],
};
