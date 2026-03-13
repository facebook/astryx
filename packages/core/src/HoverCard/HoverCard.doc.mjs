/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'HoverCard',
  description:
    'A hover/focus triggered overlay for displaying rich, interactive content anchored to a trigger element.',
  features: [
    'CSS Anchor Positioning for automatic placement relative to trigger elements',
    'Popover API for top-layer rendering — no React portals needed',
    'Hover triggers with configurable show and hide delays',
    'Focus triggers with auto-detection for focusable elements',
    'Stay-open behavior when mouse/focus moves into the hover card',
    'display:contents wrapper preserves children refs',
    'Hover indication (dashed underline) for text-only triggers',
  ],
  notes: [
    'useXDSHoverCard returns a describedBy id — pass it as aria-describedby on the trigger for screen reader support.',
    'When composing multiple aria-describedby sources, merge them with a utility: ids.filter(Boolean).join(" ") || undefined.',
    'LayerPlacement values: above | below | start | end. LayerAlignment values: start | center | end.',
  ],
  accessibility: [
    'Links the hover card content to the trigger via aria-describedby.',
    'When composing multiple aria-describedby sources, merge them with a utility.',
    'Escape key dismisses the hover card and returns focus to the trigger.',
  ],
  keyboard:
    'Escape closes the hover card. Focus triggers show/hide based on the focusTrigger option.',
  examples: [
    {
      label: 'XDSHoverCard — basic',
      code: `<XDSHoverCard content={<ProfileCard user={user} />} placement="above">
  <XDSButton>Hover me</XDSButton>
</XDSHoverCard>`,
    },
    {
      label: 'useXDSHoverCard hook',
      code: `const hoverCard = useXDSHoverCard({placement: 'above'});

<XDSButton ref={hoverCard.ref} aria-describedby={hoverCard.describedBy}>
  Hover me
</XDSButton>
{hoverCard.renderHoverCard(<ProfileCard user={user} />)}`,
    },
  ],
  components: [
    {
      name: 'XDSHoverCard',
      description:
        'Component wrapper for hover card display — a richer, larger overlay triggered on hover or focus.',
      examples: [
        {
          label: 'Basic',
          code: `<XDSHoverCard content={<ProfileCard user={user} />} placement="above">
  <XDSButton>Hover me</XDSButton>
</XDSHoverCard>`,
        },
        {
          label: 'With delay',
          code: `<XDSHoverCard content={<ProfileCard user={user} />} delay={500} hideDelay={300}>
  <span>Hover me</span>
</XDSHoverCard>`,
        },
      ],
      props: [
        {
          name: 'children',
          type: 'ReactNode',
          description: 'Trigger element that must accept a ref.',
        },
        {
          name: 'content',
          type: 'ReactNode',
          description: 'Hover card content.',
          required: true,
        },
        {
          name: 'placement',
          type: 'LayerPlacement',
          description: 'Position relative to the anchor element.',
          default: "'above'",
        },
        {
          name: 'alignment',
          type: 'LayerAlignment',
          description: 'Alignment along the placement axis.',
          default: "'center'",
        },
        {
          name: 'delay',
          type: 'number',
          description: 'Show delay in milliseconds.',
          default: '300',
        },
        {
          name: 'hideDelay',
          type: 'number',
          description: 'Hide delay in milliseconds.',
          default: '200',
        },
        {
          name: 'focusTrigger',
          type: "'auto' | 'always' | 'never'",
          description: 'Controls when focus events trigger the hover card.',
          default: "'auto'",
        },
        {
          name: 'isEnabled',
          type: 'boolean',
          description: 'Enables or disables the hover and focus triggers.',
          default: 'true',
        },
        {
          name: 'hasHoverIndication',
          type: "'auto' | boolean",
          description: 'Shows a dashed underline on the trigger element.',
          default: "'auto'",
        },
      ],
    },
    {
      name: 'useXDSHoverCard',
      description:
        'Hook for hover card behavior with hover/focus triggers. Builds on useXDSLayer.',
      examples: [
        {
          label: 'Basic hook usage',
          code: `const hoverCard = useXDSHoverCard({placement: 'above'});

<XDSButton ref={hoverCard.ref} aria-describedby={hoverCard.describedBy}>
  Hover me
</XDSButton>
{hoverCard.renderHoverCard(<ProfileCard user={user} />)}`,
        },
      ],
      props: [
        {
          name: 'placement',
          type: 'LayerPlacement',
          description: 'Position relative to the anchor element.',
          default: "'above'",
        },
        {
          name: 'alignment',
          type: 'LayerAlignment',
          description: 'Alignment along the placement axis.',
          default: "'center'",
        },
        {
          name: 'delay',
          type: 'number',
          description: 'Show delay in milliseconds.',
          default: '300',
        },
        {
          name: 'hideDelay',
          type: 'number',
          description: 'Hide delay in milliseconds.',
          default: '200',
        },
        {
          name: 'focusTrigger',
          type: "'auto' | 'always' | 'never'",
          description: 'Controls when focus events trigger the layer.',
          default: "'auto'",
        },
        {
          name: 'isEnabled',
          type: 'boolean',
          description: 'Enables or disables all hover and focus triggers.',
          default: 'true',
        },
        {
          name: 'onShow',
          type: '() => void',
          description: 'Callback fired when the hover card becomes visible.',
        },
        {
          name: 'onHide',
          type: '() => void',
          description: 'Callback fired when the hover card is hidden.',
        },
      ],
    },
  ],
};

/** @type {import('../docs-types').ComponentDoc} */
export const docsZh = {
  name: 'HoverCard',
  description:
    '悬停/聚焦触发的浮层，用于显示锚定到触发元素的富交互内容。',
  features: [
    'CSS 锚点定位：相对于触发元素自动放置',
    'Popover API 实现顶层渲染，无需 React 传送门',
    '悬停触发：可配置显示和隐藏延迟',
    '聚焦触发：自动检测可聚焦元素',
    '鼠标/焦点移入悬浮卡片时保持打开',
    'display:contents 包装器保留子元素 ref',
    '悬停指示（虚线下划线）用于纯文本触发器',
  ],
  notes: [
    'useXDSHoverCard 返回一个 describedBy id，将其作为 aria-describedby 传递给触发器以支持屏幕阅读器。',
    '当组合多个 aria-describedby 来源时，使用工具函数合并：ids.filter(Boolean).join(" ") || undefined。',
    'LayerPlacement 值：above | below | start | end。LayerAlignment 值：start | center | end。',
  ],
  accessibility: [
    '通过 aria-describedby 将悬浮卡片内容关联到触发器。',
    '当组合多个 aria-describedby 来源时，使用工具函数合并。',
    '按 Escape 键关闭悬浮卡片并将焦点返回到触发器。',
  ],
  keyboard:
    'Escape 关闭悬浮卡片。焦点触发器根据 focusTrigger 选项控制显示/隐藏。',
  examples: [
    {
      label: 'XDSHoverCard 基本用法',
      code: `<XDSHoverCard content={<ProfileCard user={user} />} placement="above">
  <XDSButton>Hover me</XDSButton>
</XDSHoverCard>`,
    },
    {
      label: 'useXDSHoverCard Hook',
      code: `const hoverCard = useXDSHoverCard({placement: 'above'});

<XDSButton ref={hoverCard.ref} aria-describedby={hoverCard.describedBy}>
  Hover me
</XDSButton>
{hoverCard.renderHoverCard(<ProfileCard user={user} />)}`,
    },
  ],
  components: [
    {
      name: 'XDSHoverCard',
      description:
        '悬浮卡片显示的组件包装器，在悬停或聚焦时触发更丰富、更大的浮层。',
      examples: [
        {
          label: '基本用法',
          code: `<XDSHoverCard content={<ProfileCard user={user} />} placement="above">
  <XDSButton>Hover me</XDSButton>
</XDSHoverCard>`,
        },
        {
          label: '带延迟',
          code: `<XDSHoverCard content={<ProfileCard user={user} />} delay={500} hideDelay={300}>
  <span>Hover me</span>
</XDSHoverCard>`,
        },
      ],
      props: [
        {
          name: 'children',
          type: 'ReactNode',
          description: '必须接受 ref 的触发元素。',
        },
        {
          name: 'content',
          type: 'ReactNode',
          description: '悬浮卡片内容。',
          required: true,
        },
        {
          name: 'placement',
          type: 'LayerPlacement',
          description: '相对于锚点元素的位置。',
          default: "'above'",
        },
        {
          name: 'alignment',
          type: 'LayerAlignment',
          description: '沿放置轴的对齐方式。',
          default: "'center'",
        },
        {
          name: 'delay',
          type: 'number',
          description: '显示延迟（毫秒）。',
          default: '300',
        },
        {
          name: 'hideDelay',
          type: 'number',
          description: '隐藏延迟（毫秒）。',
          default: '200',
        },
        {
          name: 'focusTrigger',
          type: "'auto' | 'always' | 'never'",
          description: '控制焦点事件何时触发悬浮卡片。',
          default: "'auto'",
        },
        {
          name: 'isEnabled',
          type: 'boolean',
          description: '启用或禁用悬停和聚焦触发器。',
          default: 'true',
        },
        {
          name: 'hasHoverIndication',
          type: "'auto' | boolean",
          description: '在触发元素上显示虚线下划线。',
          default: "'auto'",
        },
      ],
    },
    {
      name: 'useXDSHoverCard',
      description:
        '具有悬停/聚焦触发行为的悬浮卡片 Hook，基于 useXDSLayer 构建。',
      examples: [
        {
          label: '基本 Hook 用法',
          code: `const hoverCard = useXDSHoverCard({placement: 'above'});

<XDSButton ref={hoverCard.ref} aria-describedby={hoverCard.describedBy}>
  Hover me
</XDSButton>
{hoverCard.renderHoverCard(<ProfileCard user={user} />)}`,
        },
      ],
      props: [
        {
          name: 'placement',
          type: 'LayerPlacement',
          description: '相对于锚点元素的位置。',
          default: "'above'",
        },
        {
          name: 'alignment',
          type: 'LayerAlignment',
          description: '沿放置轴的对齐方式。',
          default: "'center'",
        },
        {
          name: 'delay',
          type: 'number',
          description: '显示延迟（毫秒）。',
          default: '300',
        },
        {
          name: 'hideDelay',
          type: 'number',
          description: '隐藏延迟（毫秒）。',
          default: '200',
        },
        {
          name: 'focusTrigger',
          type: "'auto' | 'always' | 'never'",
          description: '控制焦点事件何时触发浮层。',
          default: "'auto'",
        },
        {
          name: 'isEnabled',
          type: 'boolean',
          description: '启用或禁用所有悬停和聚焦触发器。',
          default: 'true',
        },
        {
          name: 'onShow',
          type: '() => void',
          description: '悬浮卡片显示时触发的回调。',
        },
        {
          name: 'onHide',
          type: '() => void',
          description: '悬浮卡片隐藏时触发的回调。',
        },
      ],
    },
  ],
};

/** @type {string} */
export const docsDense = `import{XDSHoverCard}from'@xds/core/HoverCard' //hover/focus triggered rich overlay
C XDSHoverCard //component wrapper for hover card overlay
P children:ReactNode trigger element; must accept ref | content:ReactNode! hover card content | placement:LayerPlacement='above' position relative to anchor | alignment:LayerAlignment='center' alignment along placement axis | delay:number='300' show delay ms | hideDelay:number='200' hide delay ms | focusTrigger:'auto'|'always'|'never'='auto' controls focus event triggers | isEnabled:boolean='true' enable/disable hover+focus triggers | hasHoverIndication:'auto'|boolean='auto' dashed underline on trigger
X <XDSHoverCard content={<ProfileCard user={user} />} placement="above">\n  <XDSButton>Hover me</XDSButton>\n</XDSHoverCard>
X <XDSHoverCard content={<ProfileCard user={user} />} delay={500} hideDelay={300}>\n  <span>Hover me</span>\n</XDSHoverCard>
C useXDSHoverCard //hook for hover card w/ hover/focus triggers; builds on useXDSLayer
P placement:LayerPlacement='above' position relative to anchor | alignment:LayerAlignment='center' alignment along placement axis | delay:number='300' show delay ms | hideDelay:number='200' hide delay ms | focusTrigger:'auto'|'always'|'never'='auto' controls focus event triggers | isEnabled:boolean='true' enable/disable all triggers | onShow:()=>void callback when hover card visible | onHide:()=>void callback when hover card hidden
X const hoverCard = useXDSHoverCard({placement: 'above'});\n\n<XDSButton ref={hoverCard.ref} aria-describedby={hoverCard.describedBy}>\n  Hover me\n</XDSButton>\n{hoverCard.renderHoverCard(<ProfileCard user={user} />)}
A Links hover card content to trigger via aria-describedby|Merge multiple aria-describedby w/ ids.filter(Boolean).join(' ') or undefined|Escape dismisses hover card + returns focus to trigger
K Escape=close hover card;Focus=show/hide based on focusTrigger option
N useXDSHoverCard returns describedBy id; pass as aria-describedby on trigger|Merge multiple aria-describedby w/ ids.filter(Boolean).join(' ') or undefined|LayerPlacement: above/below/start/end; LayerAlignment: start/center/end|CSS Anchor Positioning for auto-placement|Popover API top-layer rendering; no React portals|Hover triggers w/ configurable show+hide delays|Focus triggers w/ auto-detection for focusable elements|Stay-open when mouse/focus moves into hover card|display:contents wrapper preserves children refs|Hover indication (dashed underline) for text-only triggers`;
