import{af as N,ah as W,a6 as L,ay as H,a1 as e}from"./iframe-CF49Wwf0.js";import{S as r}from"./Stack-D8miSQVH.js";import{s as $}from"./stackItem.stylex-CgqrJM4N.js";import"./preload-helper-Ct5FWWRu.js";import"./stack.stylex-BlarxY2N.js";import"./padding.stylex-Dl2_Pyt1.js";const M={scrollable:{kVQacm:"astryxysyzu8",kXHlph:null,kORKVm:null,$$css:!0}};function s({crossAlignSelf:i,size:o,isScrollable:a,as:A="div",xstyle:I,className:z,style:b,children:w,ref:C,...P}){const q=N(...$({crossAlignSelf:i,size:o}),a&&M.scrollable,I);return W.createElement(A,{ref:C,...L(H("stack-item",{size:o}),q,z,b),...P},w)}s.displayName="StackItem";s.__docgenInfo={description:`Stack item component for controlling individual item behavior within a stack.

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

@default "static"`},isScrollable:{required:!1,tsType:{name:"boolean"},description:'Enables scrollable overflow (`overflow: auto`) for the item.\n\nStackItem already applies the flex `min-height: 0` / `min-width: 0`\nreset, so `<StackItem size="fill" isScrollable>` is a complete scroll\nregion — it grows to fill the stack and scrolls its own overflow with\nno extra style plumbing. Matches `isScrollable` on `LayoutContent`\nand `LayoutPanel`.\n@default false'},as:{required:!1,tsType:{name:"ElementType"},description:`The element type to render.
@default 'div'`,defaultValue:{value:"'div'",computed:!1}},className:{required:!1,tsType:{name:"string"},description:"CSS class name(s) appended to the root element.\nIf you're using StyleX, prefer `xstyle` for optimal style deduplication."},style:{required:!1,tsType:{name:"ReactCSSProperties",raw:"React.CSSProperties"},description:`Inline styles to apply to the root element. Spread after StyleX
inline styles, so these values take priority.`},children:{required:!1,tsType:{name:"ReactNode"},description:"Content to render inside the stack item."}},composes:["Omit"]};const t={container:{kWkggS:"x1eiddq6",$$css:!0},containerWidth:{kzqmXN:"xdzyupr",$$css:!0},containerWidthMedium:{kzqmXN:"xvue9z",$$css:!0},containerWidthLarge:{kzqmXN:"x14rvwrp",$$css:!0},containerWidthSmall:{kzqmXN:"xrostsh",$$css:!0},containerHeightSmall:{kZKoxP:"xwzfr38",$$css:!0},containerHeightMedium:{kZKoxP:"x18dl8mb",$$css:!0},containerHeightLarge:{kZKoxP:"x1m3v4wt",$$css:!0},containerPadding:{kmVPX3:"xlsj2fj",kg3NbH:null,kuDDbn:null,kE3dHu:null,kP0aTx:null,kpe85a:null,k8WAf4:null,kLKAdn:null,kGO01o:null,$$css:!0},sidebarWidth:{kzqmXN:"xrostsh",$$css:!0}},n=({children:i,alt:o=!1,green:a=!1,purple:A=!1,orange:I=!1})=>e.jsx("div",{...{0:{className:"x1o0wnni x1vvqiwl xmkeg23 x1y0btm7 xlee4gx x1na6nto xm7rs69 xh6dtrn xk50ysn x5yr21d x9f619"},8:{className:"xmkeg23 x1y0btm7 x1na6nto xm7rs69 xh6dtrn xk50ysn x5yr21d x9f619 xspzpui xru1t7f x1w9ec3u"},4:{className:"xmkeg23 x1y0btm7 x1na6nto xm7rs69 xh6dtrn xk50ysn x5yr21d x9f619 x1sqjeoo xltfdvo xy90a9n"},12:{className:"xmkeg23 x1y0btm7 x1na6nto xm7rs69 xh6dtrn xk50ysn x5yr21d x9f619 x1sqjeoo xltfdvo xy90a9n"},2:{className:"xmkeg23 x1y0btm7 x1na6nto xm7rs69 xh6dtrn xk50ysn x5yr21d x9f619 x16i6n6f x1m9wyeb xq98wne"},10:{className:"xmkeg23 x1y0btm7 x1na6nto xm7rs69 xh6dtrn xk50ysn x5yr21d x9f619 x16i6n6f x1m9wyeb xq98wne"},6:{className:"xmkeg23 x1y0btm7 x1na6nto xm7rs69 xh6dtrn xk50ysn x5yr21d x9f619 x16i6n6f x1m9wyeb xq98wne"},14:{className:"xmkeg23 x1y0btm7 x1na6nto xm7rs69 xh6dtrn xk50ysn x5yr21d x9f619 x16i6n6f x1m9wyeb xq98wne"},1:{className:"xmkeg23 x1y0btm7 x1na6nto xm7rs69 xh6dtrn xk50ysn x5yr21d x9f619 x1e9xt6e xm47u9q xloqurj"},9:{className:"xmkeg23 x1y0btm7 x1na6nto xm7rs69 xh6dtrn xk50ysn x5yr21d x9f619 x1e9xt6e xm47u9q xloqurj"},5:{className:"xmkeg23 x1y0btm7 x1na6nto xm7rs69 xh6dtrn xk50ysn x5yr21d x9f619 x1e9xt6e xm47u9q xloqurj"},13:{className:"xmkeg23 x1y0btm7 x1na6nto xm7rs69 xh6dtrn xk50ysn x5yr21d x9f619 x1e9xt6e xm47u9q xloqurj"},3:{className:"xmkeg23 x1y0btm7 x1na6nto xm7rs69 xh6dtrn xk50ysn x5yr21d x9f619 x1e9xt6e xm47u9q xloqurj"},11:{className:"xmkeg23 x1y0btm7 x1na6nto xm7rs69 xh6dtrn xk50ysn x5yr21d x9f619 x1e9xt6e xm47u9q xloqurj"},7:{className:"xmkeg23 x1y0btm7 x1na6nto xm7rs69 xh6dtrn xk50ysn x5yr21d x9f619 x1e9xt6e xm47u9q xloqurj"},15:{className:"xmkeg23 x1y0btm7 x1na6nto xm7rs69 xh6dtrn xk50ysn x5yr21d x9f619 x1e9xt6e xm47u9q xloqurj"}}[!!o<<3|!!a<<2|!!A<<1|!!I<<0],children:i}),_={title:"Core/Stack",component:r,tags:["autodocs"],argTypes:{direction:{control:"select",options:["horizontal","vertical"],description:"Direction of the stack layout"},gap:{control:"select",options:[0,.5,1,1.5,2,3,4,5,6,8,10],description:"Spacing step for gap between items"},padding:{control:"select",options:[0,.5,1,1.5,2,3,4,5,6,8,10],description:"Inner padding on all sides (spacing step)"},paddingInline:{control:"select",options:[0,.5,1,1.5,2,3,4,5,6,8,10],description:"Inline (horizontal) padding; overrides padding on that axis"},paddingBlock:{control:"select",options:[0,.5,1,1.5,2,3,4,5,6,8,10],description:"Block (vertical) padding; overrides padding on that axis"},isScrollable:{control:"boolean",description:"Enables scrollable overflow (overflow: auto)"},hAlign:{control:"select",options:["start","center","end","stretch","between","around","evenly"],description:"Horizontal alignment. Main-axis when horizontal, cross-axis when vertical."},vAlign:{control:"select",options:["start","center","end","stretch","between","around","evenly"],description:"Vertical alignment. Cross-axis when horizontal, main-axis when vertical."},wrap:{control:"select",options:["nowrap","wrap","wrap-reverse"],description:"Flex wrap behavior"}}},d={args:{gap:2,children:null},render:i=>e.jsxs(r,{...i,children:[e.jsx(n,{children:"Item 1"}),e.jsx(n,{children:"Item 2"}),e.jsx(n,{children:"Item 3"})]})},x={args:{direction:"horizontal",gap:2},render:i=>e.jsxs(r,{...i,children:[e.jsx(n,{children:"Item 1"}),e.jsx(n,{children:"Item 2"}),e.jsx(n,{children:"Item 3"})]})},h={args:{direction:"vertical",gap:4},render:i=>e.jsxs(r,{...i,children:[e.jsx(n,{children:"Item 1"}),e.jsx(n,{children:"Item 2"}),e.jsx(n,{children:"Item 3"})]})},l={render:()=>e.jsxs("div",{className:"x78zum5 xdt5ytf x1qh66ti",children:[e.jsxs("div",{children:[e.jsx("h4",{className:"xrcdmg7 x9ynric",children:"hAlign: start (default)"}),e.jsxs(r,{direction:"horizontal",gap:2,hAlign:"start",xstyle:[t.container,t.containerWidthLarge,t.containerPadding],children:[e.jsx(n,{children:"A"}),e.jsx(n,{children:"B"}),e.jsx(n,{children:"C"})]})]}),e.jsxs("div",{children:[e.jsx("h4",{className:"xrcdmg7 x9ynric",children:"hAlign: center"}),e.jsxs(r,{direction:"horizontal",gap:2,hAlign:"center",xstyle:[t.container,t.containerWidthLarge,t.containerPadding],children:[e.jsx(n,{children:"A"}),e.jsx(n,{children:"B"}),e.jsx(n,{children:"C"})]})]}),e.jsxs("div",{children:[e.jsx("h4",{className:"xrcdmg7 x9ynric",children:"hAlign: end"}),e.jsxs(r,{direction:"horizontal",gap:2,hAlign:"end",xstyle:[t.container,t.containerWidthLarge,t.containerPadding],children:[e.jsx(n,{children:"A"}),e.jsx(n,{children:"B"}),e.jsx(n,{children:"C"})]})]}),e.jsxs("div",{children:[e.jsx("h4",{className:"xrcdmg7 x9ynric",children:"hAlign: between"}),e.jsxs(r,{direction:"horizontal",gap:2,hAlign:"between",xstyle:[t.container,t.containerWidthLarge,t.containerPadding],children:[e.jsx(n,{children:"A"}),e.jsx(n,{children:"B"}),e.jsx(n,{children:"C"})]})]}),e.jsxs("div",{children:[e.jsx("h4",{className:"xrcdmg7 x9ynric",children:"hAlign: evenly"}),e.jsxs(r,{direction:"horizontal",gap:2,hAlign:"evenly",xstyle:[t.container,t.containerWidthLarge,t.containerPadding],children:[e.jsx(n,{children:"A"}),e.jsx(n,{children:"B"}),e.jsx(n,{children:"C"})]})]})]})},c={render:()=>e.jsxs("div",{className:"x78zum5 xdt5ytf x1qh66ti",children:[e.jsxs("div",{children:[e.jsx("h4",{className:"xrcdmg7 x9ynric",children:"vAlign: start"}),e.jsxs(r,{direction:"horizontal",gap:2,vAlign:"start",xstyle:[t.container,t.containerHeightSmall],children:[e.jsx(n,{children:"A"}),e.jsxs(n,{children:["B",e.jsx("br",{}),"B"]}),e.jsx(n,{children:"C"})]})]}),e.jsxs("div",{children:[e.jsx("h4",{className:"xrcdmg7 x9ynric",children:"vAlign: center"}),e.jsxs(r,{direction:"horizontal",gap:2,vAlign:"center",xstyle:[t.container,t.containerHeightSmall],children:[e.jsx(n,{children:"A"}),e.jsxs(n,{children:["B",e.jsx("br",{}),"B"]}),e.jsx(n,{children:"C"})]})]}),e.jsxs("div",{children:[e.jsx("h4",{className:"xrcdmg7 x9ynric",children:"vAlign: end"}),e.jsxs(r,{direction:"horizontal",gap:2,vAlign:"end",xstyle:[t.container,t.containerHeightSmall],children:[e.jsx(n,{children:"A"}),e.jsxs(n,{children:["B",e.jsx("br",{}),"B"]}),e.jsx(n,{children:"C"})]})]}),e.jsxs("div",{children:[e.jsx("h4",{className:"xrcdmg7 x9ynric",children:"vAlign: stretch (default)"}),e.jsxs(r,{direction:"horizontal",gap:2,vAlign:"stretch",xstyle:[t.container,t.containerHeightSmall],children:[e.jsx(n,{children:"A"}),e.jsxs(n,{children:["B",e.jsx("br",{}),"B"]}),e.jsx(n,{children:"C"})]})]})]})},m={render:()=>e.jsxs("div",{className:"x78zum5 x1qh66ti",children:[e.jsxs("div",{children:[e.jsx("h4",{className:"xrcdmg7 x9ynric",children:'direction="vertical", hAlign: start'}),e.jsxs(r,{direction:"vertical",gap:2,hAlign:"start",xstyle:[t.container,t.containerWidthSmall,t.containerPadding],children:[e.jsx(n,{children:"A"}),e.jsx(n,{children:"BB"}),e.jsx(n,{children:"CCC"})]})]}),e.jsxs("div",{children:[e.jsx("h4",{className:"xrcdmg7 x9ynric",children:'direction="vertical", hAlign: center'}),e.jsxs(r,{direction:"vertical",gap:2,hAlign:"center",xstyle:[t.container,t.containerWidthSmall,t.containerPadding],children:[e.jsx(n,{children:"A"}),e.jsx(n,{children:"BB"}),e.jsx(n,{children:"CCC"})]})]}),e.jsxs("div",{children:[e.jsx("h4",{className:"xrcdmg7 x9ynric",children:'direction="vertical", hAlign: end'}),e.jsxs(r,{direction:"vertical",gap:2,hAlign:"end",xstyle:[t.container,t.containerWidthSmall,t.containerPadding],children:[e.jsx(n,{children:"A"}),e.jsx(n,{children:"BB"}),e.jsx(n,{children:"CCC"})]})]}),e.jsxs("div",{children:[e.jsx("h4",{className:"xrcdmg7 x9ynric",children:'direction="vertical", hAlign: stretch'}),e.jsxs(r,{direction:"vertical",gap:2,hAlign:"stretch",xstyle:[t.container,t.containerWidthSmall,t.containerPadding],children:[e.jsx(n,{children:"A"}),e.jsx(n,{children:"BB"}),e.jsx(n,{children:"CCC"})]})]})]})},g={args:{direction:"horizontal",gap:2,wrap:"wrap"},render:i=>e.jsxs(r,{...i,xstyle:[t.container,t.containerWidth,t.containerPadding],children:[e.jsx(n,{children:"Item 1"}),e.jsx(n,{children:"Item 2"}),e.jsx(n,{children:"Item 3"}),e.jsx(n,{children:"Item 4"}),e.jsx(n,{children:"Item 5"})]})},p={render:()=>e.jsxs(r,{direction:"horizontal",gap:2,xstyle:[t.container,t.containerWidthMedium,t.containerPadding],children:[e.jsx(s,{size:"static",children:e.jsx(n,{alt:!0,children:"Static"})}),e.jsx(s,{size:"fill",children:e.jsx(n,{children:"Fill (grows to fill remaining space)"})}),e.jsx(s,{size:"static",children:e.jsx(n,{alt:!0,children:"Static"})})]})},y={render:()=>e.jsxs("div",{children:[e.jsx("h4",{className:"xrcdmg7 x9ynric",children:"Equal Fill (1:1:1)"}),e.jsxs(r,{direction:"horizontal",gap:2,xstyle:[t.container,t.containerWidthMedium,t.containerPadding],children:[e.jsx(s,{size:"fill",children:e.jsx(n,{children:"fill"})}),e.jsx(s,{size:"fill",children:e.jsx(n,{green:!0,children:"fill"})}),e.jsx(s,{size:"fill",children:e.jsx(n,{purple:!0,children:"fill"})})]})]})},B={render:()=>e.jsxs(r,{direction:"horizontal",gap:2,xstyle:[t.container,t.containerHeightMedium,t.containerPadding],children:[e.jsx(s,{crossAlignSelf:"start",children:e.jsx(n,{children:"start"})}),e.jsx(s,{crossAlignSelf:"center",children:e.jsx(n,{green:!0,children:"center"})}),e.jsx(s,{crossAlignSelf:"end",children:e.jsx(n,{purple:!0,children:"end"})}),e.jsx(s,{crossAlignSelf:"stretch",children:e.jsx(n,{orange:!0,children:"stretch"})})]})},S={render:()=>e.jsxs(r,{direction:"horizontal",gap:2,xstyle:[t.container,t.containerWidthLarge,t.containerPadding],children:[e.jsx(s,{size:"static",children:e.jsx(n,{alt:!0,children:"Logo"})}),e.jsx(s,{size:"fill",children:e.jsx(n,{children:"Navigation"})}),e.jsx(s,{size:"static",children:e.jsx(n,{alt:!0,children:"Actions"})})]})},k={render:()=>e.jsxs(r,{direction:"horizontal",gap:2,xstyle:[t.container,t.containerWidthLarge,t.containerHeightLarge,t.containerPadding],children:[e.jsx(s,{size:"static",xstyle:t.sidebarWidth,children:e.jsx(n,{alt:!0,children:"Sidebar"})}),e.jsx(s,{size:"fill",children:e.jsx(n,{children:"Main Content"})})]})},u={render:()=>e.jsxs(r,{direction:"vertical",gap:2,xstyle:t.containerWidthLarge,children:[e.jsxs(r,{direction:"horizontal",gap:2,xstyle:[t.container,t.containerPadding],children:[e.jsx(s,{size:"static",children:e.jsx(n,{alt:!0,children:"Logo"})}),e.jsx(s,{size:"fill",children:e.jsx(n,{children:"Navigation"})}),e.jsx(s,{size:"static",children:e.jsx(n,{alt:!0,children:"Actions"})})]}),e.jsxs(r,{direction:"horizontal",gap:2,xstyle:[t.container,t.containerHeightLarge,t.containerPadding],children:[e.jsx(s,{size:"static",xstyle:t.sidebarWidth,children:e.jsx(n,{alt:!0,children:"Sidebar"})}),e.jsx(s,{size:"fill",children:e.jsx(n,{children:"Main Content"})})]})]})},j={args:{gap:2,padding:4},render:i=>e.jsxs(r,{...i,xstyle:t.container,children:[e.jsx(n,{children:"Item 1"}),e.jsx(n,{children:"Item 2"}),e.jsx(n,{children:"Item 3"})]})},f={args:{gap:2,paddingInline:6,paddingBlock:2},render:i=>e.jsxs(r,{...i,xstyle:t.container,children:[e.jsx(n,{children:"Item 1"}),e.jsx(n,{children:"Item 2"}),e.jsx(n,{children:"Item 3"})]})},v={args:{gap:2,padding:2,isScrollable:!0,height:160},render:i=>e.jsx(r,{...i,xstyle:t.container,children:Array.from({length:12},(o,a)=>e.jsxs(n,{children:["Item ",a+1]},a))})};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    gap: 2,
    children: null
  },
  render: args => <Stack {...args}>
      <Box>Item 1</Box>
      <Box>Item 2</Box>
      <Box>Item 3</Box>
    </Stack>
}`,...d.parameters?.docs?.source}}};x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  args: {
    direction: 'horizontal',
    gap: 2
  },
  render: args => <Stack {...args}>
      <Box>Item 1</Box>
      <Box>Item 2</Box>
      <Box>Item 3</Box>
    </Stack>
}`,...x.parameters?.docs?.source}}};h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    direction: 'vertical',
    gap: 4
  },
  render: args => <Stack {...args}>
      <Box>Item 1</Box>
      <Box>Item 2</Box>
      <Box>Item 3</Box>
    </Stack>
}`,...h.parameters?.docs?.source}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
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
}`,...l.parameters?.docs?.source},description:{story:`Main-axis alignment for horizontal stacks (hAlign → justify-content).
Uses a wide container so the spacing differences are clearly visible.`,...l.parameters?.docs?.description}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
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
}`,...c.parameters?.docs?.source},description:{story:`Cross-axis alignment for horizontal stacks (vAlign → align-items).
Uses items with different heights so alignment differences are visible.`,...c.parameters?.docs?.description}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
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
}`,...m.parameters?.docs?.source}}};g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
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
}`,...g.parameters?.docs?.source}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
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
}`,...p.parameters?.docs?.source}}};y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
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
}`,...y.parameters?.docs?.source}}};B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
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
}`,...B.parameters?.docs?.source}}};S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
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
}`,...S.parameters?.docs?.source}}};k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  render: () => <Stack direction="horizontal" gap={2} xstyle={[styles.container, styles.containerWidthLarge, styles.containerHeightLarge, styles.containerPadding]}>
      <StackItem size="static" xstyle={styles.sidebarWidth}>
        <Box alt>Sidebar</Box>
      </StackItem>
      <StackItem size="fill">
        <Box>Main Content</Box>
      </StackItem>
    </Stack>
}`,...k.parameters?.docs?.source}}};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
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
}`,...u.parameters?.docs?.source}}};j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
  args: {
    gap: 2,
    padding: 4
  },
  render: args => <Stack {...args} xstyle={styles.container}>
      <Box>Item 1</Box>
      <Box>Item 2</Box>
      <Box>Item 3</Box>
    </Stack>
}`,...j.parameters?.docs?.source}}};f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    gap: 2,
    paddingInline: 6,
    paddingBlock: 2
  },
  render: args => <Stack {...args} xstyle={styles.container}>
      <Box>Item 1</Box>
      <Box>Item 2</Box>
      <Box>Item 3</Box>
    </Stack>
}`,...f.parameters?.docs?.source}}};v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    gap: 2,
    padding: 2,
    isScrollable: true,
    height: 160
  },
  render: args => <Stack {...args} xstyle={styles.container}>
      {Array.from({
      length: 12
    }, (_, i) => <Box key={i}>Item {i + 1}</Box>)}
    </Stack>
}`,...v.parameters?.docs?.source}}};const D=["Default","Horizontal","Vertical","HorizontalAlignments","HorizontalCrossAxisAlignment","VerticalAlignments","Wrapping","StackItemFillSize","StackItemEqualFill","StackItemCrossAlignSelf","HeaderLayout","SidebarLayout","PageLayout","Padding","PaddingPerAxis","Scrollable"];export{d as Default,S as HeaderLayout,x as Horizontal,l as HorizontalAlignments,c as HorizontalCrossAxisAlignment,j as Padding,f as PaddingPerAxis,u as PageLayout,v as Scrollable,k as SidebarLayout,B as StackItemCrossAlignSelf,y as StackItemEqualFill,p as StackItemFillSize,h as Vertical,m as VerticalAlignments,g as Wrapping,D as __namedExportsOrder,_ as default};
