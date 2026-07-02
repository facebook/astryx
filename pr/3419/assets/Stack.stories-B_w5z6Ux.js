import{af as b,ah as q,a6 as w,ay as N,a1 as e}from"./iframe-JfpySt6L.js";import{S as r}from"./Stack-CFTIC-Fa.js";import{s as P}from"./stackItem.stylex-CgqrJM4N.js";import"./preload-helper-Ct5FWWRu.js";import"./stack.stylex-BlarxY2N.js";function i({crossAlignSelf:s,size:c,as:j="div",xstyle:u,className:v,style:f,children:A,ref:z,...I}){const C=b(...P({crossAlignSelf:s,size:c}),u);return q.createElement(j,{ref:z,...w(N("stack-item",{size:c}),C,v,f),...I},A)}i.displayName="StackItem";i.__docgenInfo={description:`Stack item component for controlling individual item behavior within a stack.

Supports polymorphic rendering via the \`as\` prop.

@example
\`\`\`
<HStack gap={2}>
  <StackItem size="static">Logo</StackItem>
  <StackItem size="fill">Content</StackItem>
  <StackItem size="static">Actions</StackItem>
</HStack>
\`\`\``,methods:[],displayName:"StackItem",props:{xstyle:{required:!1,tsType:{name:"StyleXStyles"},description:"StyleX styles created via `stylex.create()`. Merged with the component's\nbase styles inside a single `stylex.props()` call for optimal deduplication.\n\n@example\n```\nconst overrides = stylex.create({ root: { marginBottom: 8 } });\n<Component xstyle={overrides.root} />\n```"},ref:{required:!1,tsType:{name:"ReactRef",raw:"React.Ref<HTMLElement>",elements:[{name:"HTMLElement"}]},description:"Ref forwarded to the root element"},crossAlignSelf:{required:!1,tsType:{name:"unknown"},description:`Overrides the default cross-alignment for this item.
(hAlign for VStack, vAlign for HStack)`},size:{required:!1,tsType:{name:"unknown"},description:`Size behavior of the item within the stack.
- \`static\`: Uses intrinsic size, won't grow or shrink (default)
- \`fill\`: Grows to fill remaining space

@default "static"`},as:{required:!1,tsType:{name:"ElementType"},description:`The element type to render.
@default 'div'`,defaultValue:{value:"'div'",computed:!1}},className:{required:!1,tsType:{name:"string"},description:"CSS class name(s) appended to the root element.\nIf you're using StyleX, prefer `xstyle` for optimal style deduplication."},style:{required:!1,tsType:{name:"ReactCSSProperties",raw:"React.CSSProperties"},description:`Inline styles to apply to the root element. Spread after StyleX
inline styles, so these values take priority.`},children:{required:!1,tsType:{name:"ReactNode"},description:"Content to render inside the stack item."}},composes:["Omit"]};const t={container:{kWkggS:"x1eiddq6",$$css:!0},containerWidth:{kzqmXN:"xdzyupr",$$css:!0},containerWidthMedium:{kzqmXN:"xvue9z",$$css:!0},containerWidthLarge:{kzqmXN:"x14rvwrp",$$css:!0},containerWidthSmall:{kzqmXN:"xrostsh",$$css:!0},containerHeightSmall:{kZKoxP:"xwzfr38",$$css:!0},containerHeightMedium:{kZKoxP:"x18dl8mb",$$css:!0},containerHeightLarge:{kZKoxP:"x1m3v4wt",$$css:!0},containerPadding:{kmVPX3:"xlsj2fj",kg3NbH:null,kuDDbn:null,kE3dHu:null,kP0aTx:null,kpe85a:null,k8WAf4:null,kLKAdn:null,kGO01o:null,$$css:!0},sidebarWidth:{kzqmXN:"xrostsh",$$css:!0}},n=({children:s,alt:c=!1,green:j=!1,purple:u=!1,orange:v=!1})=>e.jsx("div",{...{0:{className:"x1o0wnni x1vvqiwl xmkeg23 x1y0btm7 xlee4gx x1na6nto xm7rs69 xh6dtrn xk50ysn x5yr21d x9f619"},8:{className:"xmkeg23 x1y0btm7 x1na6nto xm7rs69 xh6dtrn xk50ysn x5yr21d x9f619 xspzpui xru1t7f x1w9ec3u"},4:{className:"xmkeg23 x1y0btm7 x1na6nto xm7rs69 xh6dtrn xk50ysn x5yr21d x9f619 x1sqjeoo xltfdvo xy90a9n"},12:{className:"xmkeg23 x1y0btm7 x1na6nto xm7rs69 xh6dtrn xk50ysn x5yr21d x9f619 x1sqjeoo xltfdvo xy90a9n"},2:{className:"xmkeg23 x1y0btm7 x1na6nto xm7rs69 xh6dtrn xk50ysn x5yr21d x9f619 x16i6n6f x1m9wyeb xq98wne"},10:{className:"xmkeg23 x1y0btm7 x1na6nto xm7rs69 xh6dtrn xk50ysn x5yr21d x9f619 x16i6n6f x1m9wyeb xq98wne"},6:{className:"xmkeg23 x1y0btm7 x1na6nto xm7rs69 xh6dtrn xk50ysn x5yr21d x9f619 x16i6n6f x1m9wyeb xq98wne"},14:{className:"xmkeg23 x1y0btm7 x1na6nto xm7rs69 xh6dtrn xk50ysn x5yr21d x9f619 x16i6n6f x1m9wyeb xq98wne"},1:{className:"xmkeg23 x1y0btm7 x1na6nto xm7rs69 xh6dtrn xk50ysn x5yr21d x9f619 x1e9xt6e xm47u9q xloqurj"},9:{className:"xmkeg23 x1y0btm7 x1na6nto xm7rs69 xh6dtrn xk50ysn x5yr21d x9f619 x1e9xt6e xm47u9q xloqurj"},5:{className:"xmkeg23 x1y0btm7 x1na6nto xm7rs69 xh6dtrn xk50ysn x5yr21d x9f619 x1e9xt6e xm47u9q xloqurj"},13:{className:"xmkeg23 x1y0btm7 x1na6nto xm7rs69 xh6dtrn xk50ysn x5yr21d x9f619 x1e9xt6e xm47u9q xloqurj"},3:{className:"xmkeg23 x1y0btm7 x1na6nto xm7rs69 xh6dtrn xk50ysn x5yr21d x9f619 x1e9xt6e xm47u9q xloqurj"},11:{className:"xmkeg23 x1y0btm7 x1na6nto xm7rs69 xh6dtrn xk50ysn x5yr21d x9f619 x1e9xt6e xm47u9q xloqurj"},7:{className:"xmkeg23 x1y0btm7 x1na6nto xm7rs69 xh6dtrn xk50ysn x5yr21d x9f619 x1e9xt6e xm47u9q xloqurj"},15:{className:"xmkeg23 x1y0btm7 x1na6nto xm7rs69 xh6dtrn xk50ysn x5yr21d x9f619 x1e9xt6e xm47u9q xloqurj"}}[!!c<<3|!!j<<2|!!u<<1|!!v<<0],children:s}),T={title:"Core/Stack",component:r,tags:["autodocs"],argTypes:{direction:{control:"select",options:["horizontal","vertical"],description:"Direction of the stack layout"},gap:{control:"select",options:[0,.5,1,1.5,2,3,4,5,6,8,10],description:"Spacing step for gap between items"},hAlign:{control:"select",options:["start","center","end","stretch","between","around","evenly"],description:"Horizontal alignment. Main-axis when horizontal, cross-axis when vertical."},vAlign:{control:"select",options:["start","center","end","stretch","between","around","evenly"],description:"Vertical alignment. Cross-axis when horizontal, main-axis when vertical."},wrap:{control:"select",options:["nowrap","wrap","wrap-reverse"],description:"Flex wrap behavior"}}},l={args:{gap:2,children:null},render:s=>e.jsxs(r,{...s,children:[e.jsx(n,{children:"Item 1"}),e.jsx(n,{children:"Item 2"}),e.jsx(n,{children:"Item 3"})]})},x={args:{direction:"horizontal",gap:2},render:s=>e.jsxs(r,{...s,children:[e.jsx(n,{children:"Item 1"}),e.jsx(n,{children:"Item 2"}),e.jsx(n,{children:"Item 3"})]})},d={args:{direction:"vertical",gap:4},render:s=>e.jsxs(r,{...s,children:[e.jsx(n,{children:"Item 1"}),e.jsx(n,{children:"Item 2"}),e.jsx(n,{children:"Item 3"})]})},a={render:()=>e.jsxs("div",{className:"x78zum5 xdt5ytf x1qh66ti",children:[e.jsxs("div",{children:[e.jsx("h4",{className:"xrcdmg7 x9ynric",children:"hAlign: start (default)"}),e.jsxs(r,{direction:"horizontal",gap:2,hAlign:"start",xstyle:[t.container,t.containerWidthLarge,t.containerPadding],children:[e.jsx(n,{children:"A"}),e.jsx(n,{children:"B"}),e.jsx(n,{children:"C"})]})]}),e.jsxs("div",{children:[e.jsx("h4",{className:"xrcdmg7 x9ynric",children:"hAlign: center"}),e.jsxs(r,{direction:"horizontal",gap:2,hAlign:"center",xstyle:[t.container,t.containerWidthLarge,t.containerPadding],children:[e.jsx(n,{children:"A"}),e.jsx(n,{children:"B"}),e.jsx(n,{children:"C"})]})]}),e.jsxs("div",{children:[e.jsx("h4",{className:"xrcdmg7 x9ynric",children:"hAlign: end"}),e.jsxs(r,{direction:"horizontal",gap:2,hAlign:"end",xstyle:[t.container,t.containerWidthLarge,t.containerPadding],children:[e.jsx(n,{children:"A"}),e.jsx(n,{children:"B"}),e.jsx(n,{children:"C"})]})]}),e.jsxs("div",{children:[e.jsx("h4",{className:"xrcdmg7 x9ynric",children:"hAlign: between"}),e.jsxs(r,{direction:"horizontal",gap:2,hAlign:"between",xstyle:[t.container,t.containerWidthLarge,t.containerPadding],children:[e.jsx(n,{children:"A"}),e.jsx(n,{children:"B"}),e.jsx(n,{children:"C"})]})]}),e.jsxs("div",{children:[e.jsx("h4",{className:"xrcdmg7 x9ynric",children:"hAlign: evenly"}),e.jsxs(r,{direction:"horizontal",gap:2,hAlign:"evenly",xstyle:[t.container,t.containerWidthLarge,t.containerPadding],children:[e.jsx(n,{children:"A"}),e.jsx(n,{children:"B"}),e.jsx(n,{children:"C"})]})]})]})},o={render:()=>e.jsxs("div",{className:"x78zum5 xdt5ytf x1qh66ti",children:[e.jsxs("div",{children:[e.jsx("h4",{className:"xrcdmg7 x9ynric",children:"vAlign: start"}),e.jsxs(r,{direction:"horizontal",gap:2,vAlign:"start",xstyle:[t.container,t.containerHeightSmall],children:[e.jsx(n,{children:"A"}),e.jsxs(n,{children:["B",e.jsx("br",{}),"B"]}),e.jsx(n,{children:"C"})]})]}),e.jsxs("div",{children:[e.jsx("h4",{className:"xrcdmg7 x9ynric",children:"vAlign: center"}),e.jsxs(r,{direction:"horizontal",gap:2,vAlign:"center",xstyle:[t.container,t.containerHeightSmall],children:[e.jsx(n,{children:"A"}),e.jsxs(n,{children:["B",e.jsx("br",{}),"B"]}),e.jsx(n,{children:"C"})]})]}),e.jsxs("div",{children:[e.jsx("h4",{className:"xrcdmg7 x9ynric",children:"vAlign: end"}),e.jsxs(r,{direction:"horizontal",gap:2,vAlign:"end",xstyle:[t.container,t.containerHeightSmall],children:[e.jsx(n,{children:"A"}),e.jsxs(n,{children:["B",e.jsx("br",{}),"B"]}),e.jsx(n,{children:"C"})]})]}),e.jsxs("div",{children:[e.jsx("h4",{className:"xrcdmg7 x9ynric",children:"vAlign: stretch (default)"}),e.jsxs(r,{direction:"horizontal",gap:2,vAlign:"stretch",xstyle:[t.container,t.containerHeightSmall],children:[e.jsx(n,{children:"A"}),e.jsxs(n,{children:["B",e.jsx("br",{}),"B"]}),e.jsx(n,{children:"C"})]})]})]})},h={render:()=>e.jsxs("div",{className:"x78zum5 x1qh66ti",children:[e.jsxs("div",{children:[e.jsx("h4",{className:"xrcdmg7 x9ynric",children:'direction="vertical", hAlign: start'}),e.jsxs(r,{direction:"vertical",gap:2,hAlign:"start",xstyle:[t.container,t.containerWidthSmall,t.containerPadding],children:[e.jsx(n,{children:"A"}),e.jsx(n,{children:"BB"}),e.jsx(n,{children:"CCC"})]})]}),e.jsxs("div",{children:[e.jsx("h4",{className:"xrcdmg7 x9ynric",children:'direction="vertical", hAlign: center'}),e.jsxs(r,{direction:"vertical",gap:2,hAlign:"center",xstyle:[t.container,t.containerWidthSmall,t.containerPadding],children:[e.jsx(n,{children:"A"}),e.jsx(n,{children:"BB"}),e.jsx(n,{children:"CCC"})]})]}),e.jsxs("div",{children:[e.jsx("h4",{className:"xrcdmg7 x9ynric",children:'direction="vertical", hAlign: end'}),e.jsxs(r,{direction:"vertical",gap:2,hAlign:"end",xstyle:[t.container,t.containerWidthSmall,t.containerPadding],children:[e.jsx(n,{children:"A"}),e.jsx(n,{children:"BB"}),e.jsx(n,{children:"CCC"})]})]}),e.jsxs("div",{children:[e.jsx("h4",{className:"xrcdmg7 x9ynric",children:'direction="vertical", hAlign: stretch'}),e.jsxs(r,{direction:"vertical",gap:2,hAlign:"stretch",xstyle:[t.container,t.containerWidthSmall,t.containerPadding],children:[e.jsx(n,{children:"A"}),e.jsx(n,{children:"BB"}),e.jsx(n,{children:"CCC"})]})]})]})},m={args:{direction:"horizontal",gap:2,wrap:"wrap"},render:s=>e.jsxs(r,{...s,xstyle:[t.container,t.containerWidth,t.containerPadding],children:[e.jsx(n,{children:"Item 1"}),e.jsx(n,{children:"Item 2"}),e.jsx(n,{children:"Item 3"}),e.jsx(n,{children:"Item 4"}),e.jsx(n,{children:"Item 5"})]})},g={render:()=>e.jsxs(r,{direction:"horizontal",gap:2,xstyle:[t.container,t.containerWidthMedium,t.containerPadding],children:[e.jsx(i,{size:"static",children:e.jsx(n,{alt:!0,children:"Static"})}),e.jsx(i,{size:"fill",children:e.jsx(n,{children:"Fill (grows to fill remaining space)"})}),e.jsx(i,{size:"static",children:e.jsx(n,{alt:!0,children:"Static"})})]})},y={render:()=>e.jsxs("div",{children:[e.jsx("h4",{className:"xrcdmg7 x9ynric",children:"Equal Fill (1:1:1)"}),e.jsxs(r,{direction:"horizontal",gap:2,xstyle:[t.container,t.containerWidthMedium,t.containerPadding],children:[e.jsx(i,{size:"fill",children:e.jsx(n,{children:"fill"})}),e.jsx(i,{size:"fill",children:e.jsx(n,{green:!0,children:"fill"})}),e.jsx(i,{size:"fill",children:e.jsx(n,{purple:!0,children:"fill"})})]})]})},p={render:()=>e.jsxs(r,{direction:"horizontal",gap:2,xstyle:[t.container,t.containerHeightMedium,t.containerPadding],children:[e.jsx(i,{crossAlignSelf:"start",children:e.jsx(n,{children:"start"})}),e.jsx(i,{crossAlignSelf:"center",children:e.jsx(n,{green:!0,children:"center"})}),e.jsx(i,{crossAlignSelf:"end",children:e.jsx(n,{purple:!0,children:"end"})}),e.jsx(i,{crossAlignSelf:"stretch",children:e.jsx(n,{orange:!0,children:"stretch"})})]})},B={render:()=>e.jsxs(r,{direction:"horizontal",gap:2,xstyle:[t.container,t.containerWidthLarge,t.containerPadding],children:[e.jsx(i,{size:"static",children:e.jsx(n,{alt:!0,children:"Logo"})}),e.jsx(i,{size:"fill",children:e.jsx(n,{children:"Navigation"})}),e.jsx(i,{size:"static",children:e.jsx(n,{alt:!0,children:"Actions"})})]})},S={render:()=>e.jsxs(r,{direction:"horizontal",gap:2,xstyle:[t.container,t.containerWidthLarge,t.containerHeightLarge,t.containerPadding],children:[e.jsx(i,{size:"static",xstyle:t.sidebarWidth,children:e.jsx(n,{alt:!0,children:"Sidebar"})}),e.jsx(i,{size:"fill",children:e.jsx(n,{children:"Main Content"})})]})},k={render:()=>e.jsxs(r,{direction:"vertical",gap:2,xstyle:t.containerWidthLarge,children:[e.jsxs(r,{direction:"horizontal",gap:2,xstyle:[t.container,t.containerPadding],children:[e.jsx(i,{size:"static",children:e.jsx(n,{alt:!0,children:"Logo"})}),e.jsx(i,{size:"fill",children:e.jsx(n,{children:"Navigation"})}),e.jsx(i,{size:"static",children:e.jsx(n,{alt:!0,children:"Actions"})})]}),e.jsxs(r,{direction:"horizontal",gap:2,xstyle:[t.container,t.containerHeightLarge,t.containerPadding],children:[e.jsx(i,{size:"static",xstyle:t.sidebarWidth,children:e.jsx(n,{alt:!0,children:"Sidebar"})}),e.jsx(i,{size:"fill",children:e.jsx(n,{children:"Main Content"})})]})]})};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    gap: 2,
    children: null
  },
  render: args => <Stack {...args}>
      <Box>Item 1</Box>
      <Box>Item 2</Box>
      <Box>Item 3</Box>
    </Stack>
}`,...l.parameters?.docs?.source}}};x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  args: {
    direction: 'horizontal',
    gap: 2
  },
  render: args => <Stack {...args}>
      <Box>Item 1</Box>
      <Box>Item 2</Box>
      <Box>Item 3</Box>
    </Stack>
}`,...x.parameters?.docs?.source}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    direction: 'vertical',
    gap: 4
  },
  render: args => <Stack {...args}>
      <Box>Item 1</Box>
      <Box>Item 2</Box>
      <Box>Item 3</Box>
    </Stack>
}`,...d.parameters?.docs?.source}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  render: () => <div {...stylex.props(styles.storyWrapper)}>
      <div>
        <h4 {...stylex.props(styles.heading)}>hAlign: start (default)</h4>
        <Stack direction="horizontal" gap={2} hAlign="start" xstyle={[styles.container, styles.containerWidthLarge, styles.containerPadding]}>
          <Box>A</Box>
          <Box>B</Box>
          <Box>C</Box>
        </Stack>
      </div>
      <div>
        <h4 {...stylex.props(styles.heading)}>hAlign: center</h4>
        <Stack direction="horizontal" gap={2} hAlign="center" xstyle={[styles.container, styles.containerWidthLarge, styles.containerPadding]}>
          <Box>A</Box>
          <Box>B</Box>
          <Box>C</Box>
        </Stack>
      </div>
      <div>
        <h4 {...stylex.props(styles.heading)}>hAlign: end</h4>
        <Stack direction="horizontal" gap={2} hAlign="end" xstyle={[styles.container, styles.containerWidthLarge, styles.containerPadding]}>
          <Box>A</Box>
          <Box>B</Box>
          <Box>C</Box>
        </Stack>
      </div>
      <div>
        <h4 {...stylex.props(styles.heading)}>hAlign: between</h4>
        <Stack direction="horizontal" gap={2} hAlign="between" xstyle={[styles.container, styles.containerWidthLarge, styles.containerPadding]}>
          <Box>A</Box>
          <Box>B</Box>
          <Box>C</Box>
        </Stack>
      </div>
      <div>
        <h4 {...stylex.props(styles.heading)}>hAlign: evenly</h4>
        <Stack direction="horizontal" gap={2} hAlign="evenly" xstyle={[styles.container, styles.containerWidthLarge, styles.containerPadding]}>
          <Box>A</Box>
          <Box>B</Box>
          <Box>C</Box>
        </Stack>
      </div>
    </div>
}`,...a.parameters?.docs?.source},description:{story:`Main-axis alignment for horizontal stacks (hAlign → justify-content).
Uses a wide container so the spacing differences are clearly visible.`,...a.parameters?.docs?.description}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  render: () => <div {...stylex.props(styles.storyWrapper)}>
      <div>
        <h4 {...stylex.props(styles.heading)}>vAlign: start</h4>
        <Stack direction="horizontal" gap={2} vAlign="start" xstyle={[styles.container, styles.containerHeightSmall]}>
          <Box>A</Box>
          <Box>
            B<br />B
          </Box>
          <Box>C</Box>
        </Stack>
      </div>
      <div>
        <h4 {...stylex.props(styles.heading)}>vAlign: center</h4>
        <Stack direction="horizontal" gap={2} vAlign="center" xstyle={[styles.container, styles.containerHeightSmall]}>
          <Box>A</Box>
          <Box>
            B<br />B
          </Box>
          <Box>C</Box>
        </Stack>
      </div>
      <div>
        <h4 {...stylex.props(styles.heading)}>vAlign: end</h4>
        <Stack direction="horizontal" gap={2} vAlign="end" xstyle={[styles.container, styles.containerHeightSmall]}>
          <Box>A</Box>
          <Box>
            B<br />B
          </Box>
          <Box>C</Box>
        </Stack>
      </div>
      <div>
        <h4 {...stylex.props(styles.heading)}>vAlign: stretch (default)</h4>
        <Stack direction="horizontal" gap={2} vAlign="stretch" xstyle={[styles.container, styles.containerHeightSmall]}>
          <Box>A</Box>
          <Box>
            B<br />B
          </Box>
          <Box>C</Box>
        </Stack>
      </div>
    </div>
}`,...o.parameters?.docs?.source},description:{story:`Cross-axis alignment for horizontal stacks (vAlign → align-items).
Uses items with different heights so alignment differences are visible.`,...o.parameters?.docs?.description}}};h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  render: () => <div {...stylex.props(styles.storyWrapperRow)}>
      <div>
        <h4 {...stylex.props(styles.heading)}>
          direction=&quot;vertical&quot;, hAlign: start
        </h4>
        <Stack direction="vertical" gap={2} hAlign="start" xstyle={[styles.container, styles.containerWidthSmall, styles.containerPadding]}>
          <Box>A</Box>
          <Box>BB</Box>
          <Box>CCC</Box>
        </Stack>
      </div>
      <div>
        <h4 {...stylex.props(styles.heading)}>
          direction=&quot;vertical&quot;, hAlign: center
        </h4>
        <Stack direction="vertical" gap={2} hAlign="center" xstyle={[styles.container, styles.containerWidthSmall, styles.containerPadding]}>
          <Box>A</Box>
          <Box>BB</Box>
          <Box>CCC</Box>
        </Stack>
      </div>
      <div>
        <h4 {...stylex.props(styles.heading)}>
          direction=&quot;vertical&quot;, hAlign: end
        </h4>
        <Stack direction="vertical" gap={2} hAlign="end" xstyle={[styles.container, styles.containerWidthSmall, styles.containerPadding]}>
          <Box>A</Box>
          <Box>BB</Box>
          <Box>CCC</Box>
        </Stack>
      </div>
      <div>
        <h4 {...stylex.props(styles.heading)}>
          direction=&quot;vertical&quot;, hAlign: stretch
        </h4>
        <Stack direction="vertical" gap={2} hAlign="stretch" xstyle={[styles.container, styles.containerWidthSmall, styles.containerPadding]}>
          <Box>A</Box>
          <Box>BB</Box>
          <Box>CCC</Box>
        </Stack>
      </div>
    </div>
}`,...h.parameters?.docs?.source}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    direction: 'horizontal',
    gap: 2,
    wrap: 'wrap'
  },
  render: args => <Stack {...args} xstyle={[styles.container, styles.containerWidth, styles.containerPadding]}>
      <Box>Item 1</Box>
      <Box>Item 2</Box>
      <Box>Item 3</Box>
      <Box>Item 4</Box>
      <Box>Item 5</Box>
    </Stack>
}`,...m.parameters?.docs?.source}}};g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  render: () => <Stack direction="horizontal" gap={2} xstyle={[styles.container, styles.containerWidthMedium, styles.containerPadding]}>
      <StackItem size="static">
        <Box alt>Static</Box>
      </StackItem>
      <StackItem size="fill">
        <Box>Fill (grows to fill remaining space)</Box>
      </StackItem>
      <StackItem size="static">
        <Box alt>Static</Box>
      </StackItem>
    </Stack>
}`,...g.parameters?.docs?.source}}};y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  render: () => <div>
      <h4 {...stylex.props(styles.heading)}>Equal Fill (1:1:1)</h4>
      <Stack direction="horizontal" gap={2} xstyle={[styles.container, styles.containerWidthMedium, styles.containerPadding]}>
        <StackItem size="fill">
          <Box>fill</Box>
        </StackItem>
        <StackItem size="fill">
          <Box green>fill</Box>
        </StackItem>
        <StackItem size="fill">
          <Box purple>fill</Box>
        </StackItem>
      </Stack>
    </div>
}`,...y.parameters?.docs?.source}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  render: () => <Stack direction="horizontal" gap={2} xstyle={[styles.container, styles.containerHeightMedium, styles.containerPadding]}>
      <StackItem crossAlignSelf="start">
        <Box>start</Box>
      </StackItem>
      <StackItem crossAlignSelf="center">
        <Box green>center</Box>
      </StackItem>
      <StackItem crossAlignSelf="end">
        <Box purple>end</Box>
      </StackItem>
      <StackItem crossAlignSelf="stretch">
        <Box orange>stretch</Box>
      </StackItem>
    </Stack>
}`,...p.parameters?.docs?.source}}};B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
  render: () => <Stack direction="horizontal" gap={2} xstyle={[styles.container, styles.containerWidthLarge, styles.containerPadding]}>
      <StackItem size="static">
        <Box alt>Logo</Box>
      </StackItem>
      <StackItem size="fill">
        <Box>Navigation</Box>
      </StackItem>
      <StackItem size="static">
        <Box alt>Actions</Box>
      </StackItem>
    </Stack>
}`,...B.parameters?.docs?.source}}};S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  render: () => <Stack direction="horizontal" gap={2} xstyle={[styles.container, styles.containerWidthLarge, styles.containerHeightLarge, styles.containerPadding]}>
      <StackItem size="static" xstyle={styles.sidebarWidth}>
        <Box alt>Sidebar</Box>
      </StackItem>
      <StackItem size="fill">
        <Box>Main Content</Box>
      </StackItem>
    </Stack>
}`,...S.parameters?.docs?.source}}};k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  render: () => <Stack direction="vertical" gap={2} xstyle={styles.containerWidthLarge}>
      <Stack direction="horizontal" gap={2} xstyle={[styles.container, styles.containerPadding]}>
        <StackItem size="static">
          <Box alt>Logo</Box>
        </StackItem>
        <StackItem size="fill">
          <Box>Navigation</Box>
        </StackItem>
        <StackItem size="static">
          <Box alt>Actions</Box>
        </StackItem>
      </Stack>
      <Stack direction="horizontal" gap={2} xstyle={[styles.container, styles.containerHeightLarge, styles.containerPadding]}>
        <StackItem size="static" xstyle={styles.sidebarWidth}>
          <Box alt>Sidebar</Box>
        </StackItem>
        <StackItem size="fill">
          <Box>Main Content</Box>
        </StackItem>
      </Stack>
    </Stack>
}`,...k.parameters?.docs?.source}}};const E=["Default","Horizontal","Vertical","HorizontalAlignments","HorizontalCrossAxisAlignment","VerticalAlignments","Wrapping","StackItemFillSize","StackItemEqualFill","StackItemCrossAlignSelf","HeaderLayout","SidebarLayout","PageLayout"];export{l as Default,B as HeaderLayout,x as Horizontal,a as HorizontalAlignments,o as HorizontalCrossAxisAlignment,k as PageLayout,S as SidebarLayout,p as StackItemCrossAlignSelf,y as StackItemEqualFill,g as StackItemFillSize,d as Vertical,h as VerticalAlignments,m as Wrapping,E as __namedExportsOrder,T as default};
