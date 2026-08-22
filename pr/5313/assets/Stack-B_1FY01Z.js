import{i as e,s as t}from"./preload-helper-CT_b8DTk.js";import{t as n}from"./react-B7Te67-h.js";import{E as r,N as i,P as a,T as o}from"./ime-cU6wEDvZ.js";import{n as s,t as c}from"./stackItem.stylex-BU2WzkqY.js";import{F as l,t as u}from"./utils-C-fHTXVk.js";import{c as d,i as f,t as p}from"./VStack-D2hkegyx.js";function m({crossAlignSelf:e,size:t,isScrollable:n,as:i=`div`,xstyle:o,className:c,style:u,children:d,ref:f,...p}){let m=a(...s({crossAlignSelf:e,size:t}),n&&g.scrollable,o);return(0,h.createElement)(i,{ref:f,...l(r(`stack-item`,{size:t}),m,c,u),...p},d)}var h,g,_=e((()=>{h=t(n(),1),i(),c(),u(),o(),g={scrollable:{kVQacm:`astryxysyzu8`,kXHlph:null,kORKVm:null,$$css:!0}},m.displayName=`StackItem`,m.__docgenInfo={description:`Stack item component for controlling individual item behavior within a stack.

Supports polymorphic rendering via the \`as\` prop.

@example
\`\`\`
<HStack gap={2}>
  <StackItem size="static">Logo</StackItem>
  <StackItem size="fill">Content</StackItem>
  <StackItem size="static">Actions</StackItem>
</HStack>
\`\`\``,methods:[],displayName:`StackItem`,props:{xstyle:{required:!1,tsType:{name:`StyleXStyles`},description:"StyleX styles created via `stylex.create()`. Merged with the component's\nbase styles inside a single `stylex.props()` call for optimal deduplication.\n\n@example\n```\nconst overrides = stylex.create({ root: { marginBottom: 8 } });\n<Component xstyle={overrides.root} />\n```"},ref:{required:!1,tsType:{name:`ReactRef`,raw:`React.Ref<HTMLElement>`,elements:[{name:`HTMLElement`}]},description:`Ref forwarded to the root element`},crossAlignSelf:{required:!1,tsType:{name:`unknown`},description:`Overrides the default cross-alignment for this item.
(hAlign for VStack, vAlign for HStack)`},size:{required:!1,tsType:{name:`unknown`},description:`Size behavior of the item within the stack.
- \`static\`: Uses intrinsic size, won't grow or shrink (default)
- \`fill\`: Grows to fill remaining space

@default "static"`},isScrollable:{required:!1,tsType:{name:`boolean`},description:'Enables scrollable overflow (`overflow: auto`) for the item.\n\nStackItem already applies the flex `min-height: 0` / `min-width: 0`\nreset, so `<StackItem size="fill" isScrollable>` is a complete scroll\nregion — it grows to fill the stack and scrolls its own overflow with\nno extra style plumbing. Matches `isScrollable` on `LayoutContent`\nand `LayoutPanel`.\n@default false'},as:{required:!1,tsType:{name:`ElementType`},description:`The element type to render.
@default 'div'`,defaultValue:{value:`'div'`,computed:!1}},children:{required:!1,tsType:{name:`ReactNode`},description:`Content to render inside the stack item.`}},composes:[`Omit`]}})),v=e((()=>{d(),f(),p(),_()}));export{m as n,_ as r,v as t};