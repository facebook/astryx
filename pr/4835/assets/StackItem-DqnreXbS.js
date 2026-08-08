import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{t}from"./react-BZJXY1be.js";import{n,t as r}from"./stylex-Dft6gtPK.js";import{n as i,t as a}from"./stackItem.stylex-j6rvxd1W.js";import{n as o}from"./mergeProps-JRyAvMxc.js";import{n as s,t as c}from"./themeProps-CREkzZh6.js";function l({crossAlignSelf:e,size:t,isScrollable:r,as:a=`div`,xstyle:c,className:l,style:f,children:p,ref:m,...h}){let g=n(...i({crossAlignSelf:e,size:t}),r&&d.scrollable,c);return(0,u.createElement)(a,{ref:m,...o(s(`stack-item`,{size:t}),g,l,f),...h},p)}var u,d;function f(){return(f=e((()=>{u=t(),r(),a(),c(),d={scrollable:{kVQacm:`astryxysyzu8`,kXHlph:null,kORKVm:null,$$css:!0}},l.displayName=`StackItem`,l.__docgenInfo={description:`Stack item component for controlling individual item behavior within a stack.

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
@default 'div'`,defaultValue:{value:`'div'`,computed:!1}},children:{required:!1,tsType:{name:`ReactNode`},description:`Content to render inside the stack item.`}},composes:[`Omit`]}})))()}export{f as n,l as t};