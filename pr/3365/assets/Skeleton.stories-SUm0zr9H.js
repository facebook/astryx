import{a1 as e}from"./iframe-CF49Wwf0.js";import{S as t}from"./Skeleton-BfZuHBKr.js";import{C as g}from"./Card-DOraMNb0.js";import{V as s}from"./VStack-Dl1-N47R.js";import{H as o}from"./HStack-CDWOB9gg.js";import"./preload-helper-Ct5FWWRu.js";import"./container.stylex-uilBL6DE.js";import"./padding.stylex-Dl2_Pyt1.js";import"./Stack-D8miSQVH.js";import"./stack.stylex-BlarxY2N.js";const f={title:"Core/Skeleton",component:t,tags:["autodocs"],argTypes:{width:{control:"text",description:"Width (number for px, string for any CSS value)"},height:{control:"text",description:"Height (number for px, string for any CSS value)"},radius:{control:"select",options:["none",0,1,2,3,4,"rounded"],description:"Border radius using design tokens"},index:{control:{type:"number",min:0,max:10,step:1},description:"Index for staggered animation timing"}}},i={args:{width:200,height:20,radius:3,index:0}},r={render:()=>e.jsxs(o,{gap:4,vAlign:"center",children:[e.jsx(t,{width:40,height:40,radius:"rounded"}),e.jsx(t,{width:100,height:20,radius:3}),e.jsx(t,{width:120,height:32,radius:2}),e.jsx(t,{width:80,height:80,radius:"none"})]})},d={render:()=>e.jsxs(s,{gap:2,children:[e.jsx(t,{width:300,height:16,index:0}),e.jsx(t,{width:280,height:16,index:1}),e.jsx(t,{width:320,height:16,index:2}),e.jsx(t,{width:260,height:16,index:3}),e.jsx(t,{width:290,height:16,index:4})]})},h={render:()=>e.jsx(g,{width:320,children:e.jsxs(s,{gap:3,children:[e.jsxs(o,{gap:3,vAlign:"center",children:[e.jsx(t,{width:40,height:40,radius:"rounded",index:0}),e.jsxs(s,{gap:1,children:[e.jsx(t,{width:120,height:14,index:1}),e.jsx(t,{width:80,height:12,index:2})]})]}),e.jsx(t,{width:"100%",height:14,index:3}),e.jsx(t,{width:"90%",height:14,index:4}),e.jsx(t,{width:"75%",height:14,index:5})]})})},a={render:()=>e.jsx(s,{gap:2,children:[0,1,2,3].map(n=>e.jsxs(o,{gap:4,vAlign:"center",children:[e.jsx(t,{width:50,height:16,index:n*4}),e.jsx(t,{width:180,height:16,index:n*4+1}),e.jsx(t,{width:100,height:16,index:n*4+2}),e.jsx(t,{width:80,height:16,index:n*4+3})]},n))})};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  args: {
    width: 200,
    height: 20,
    radius: 3,
    index: 0
  }
}`,...i.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  render: () => <HStack gap={4} vAlign="center">
      <Skeleton width={40} height={40} radius="rounded" />
      <Skeleton width={100} height={20} radius={3} />
      <Skeleton width={120} height={32} radius={2} />
      <Skeleton width={80} height={80} radius="none" />
    </HStack>
}`,...r.parameters?.docs?.source}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  render: () => <VStack gap={2}>
      <Skeleton width={300} height={16} index={0} />
      <Skeleton width={280} height={16} index={1} />
      <Skeleton width={320} height={16} index={2} />
      <Skeleton width={260} height={16} index={3} />
      <Skeleton width={290} height={16} index={4} />
    </VStack>
}`,...d.parameters?.docs?.source}}};h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  render: () => <Card width={320}>
      <VStack gap={3}>
        {/* Avatar and name row */}
        <HStack gap={3} vAlign="center">
          <Skeleton width={40} height={40} radius="rounded" index={0} />
          <VStack gap={1}>
            <Skeleton width={120} height={14} index={1} />
            <Skeleton width={80} height={12} index={2} />
          </VStack>
        </HStack>
        {/* Content lines */}
        <Skeleton width="100%" height={14} index={3} />
        <Skeleton width="90%" height={14} index={4} />
        <Skeleton width="75%" height={14} index={5} />
      </VStack>
    </Card>
}`,...h.parameters?.docs?.source}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  render: () => <VStack gap={2}>
      {[0, 1, 2, 3].map(rowIndex => <HStack key={rowIndex} gap={4} vAlign="center">
          <Skeleton width={50} height={16} index={rowIndex * 4} />
          <Skeleton width={180} height={16} index={rowIndex * 4 + 1} />
          <Skeleton width={100} height={16} index={rowIndex * 4 + 2} />
          <Skeleton width={80} height={16} index={rowIndex * 4 + 3} />
        </HStack>)}
    </VStack>
}`,...a.parameters?.docs?.source}}};const C=["Default","Shapes","StaggeredList","CardSkeleton","TableRowSkeleton"];export{h as CardSkeleton,i as Default,r as Shapes,d as StaggeredList,a as TableRowSkeleton,C as __namedExportsOrder,f as default};
