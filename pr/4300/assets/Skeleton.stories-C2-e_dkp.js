import{i as e}from"./preload-helper-CT_b8DTk.js";import{t}from"./jsx-runtime-DqZldVDK.js";import{n,t as r}from"./Card-B6hq5pd9.js";import{i,o as a}from"./Stack-C7dTtCDZ.js";import{t as o}from"./Layout-BvMyrLFX.js";import{n as s,t as c}from"./Skeleton-BYIPTaVi.js";var l,u,d,f,p,m,h,g;e((()=>{c(),r(),o(),l=t(),u={title:`Core/Skeleton`,component:s,tags:[`autodocs`],argTypes:{width:{control:`text`,description:`Width (number for px, string for any CSS value)`},height:{control:`text`,description:`Height (number for px, string for any CSS value)`},radius:{control:`select`,options:[`none`,0,1,2,3,4,`rounded`],description:`Border radius using design tokens`},index:{control:{type:`number`,min:0,max:10,step:1},description:`Index for staggered animation timing`}}},d={args:{width:200,height:20,radius:3,index:0}},f={render:()=>(0,l.jsxs)(a,{gap:4,vAlign:`center`,children:[(0,l.jsx)(s,{width:40,height:40,radius:`rounded`}),(0,l.jsx)(s,{width:100,height:20,radius:3}),(0,l.jsx)(s,{width:120,height:32,radius:2}),(0,l.jsx)(s,{width:80,height:80,radius:`none`})]})},p={render:()=>(0,l.jsxs)(i,{gap:2,children:[(0,l.jsx)(s,{width:300,height:16,index:0}),(0,l.jsx)(s,{width:280,height:16,index:1}),(0,l.jsx)(s,{width:320,height:16,index:2}),(0,l.jsx)(s,{width:260,height:16,index:3}),(0,l.jsx)(s,{width:290,height:16,index:4})]})},m={render:()=>(0,l.jsx)(n,{width:320,children:(0,l.jsxs)(i,{gap:3,children:[(0,l.jsxs)(a,{gap:3,vAlign:`center`,children:[(0,l.jsx)(s,{width:40,height:40,radius:`rounded`,index:0}),(0,l.jsxs)(i,{gap:1,children:[(0,l.jsx)(s,{width:120,height:14,index:1}),(0,l.jsx)(s,{width:80,height:12,index:2})]})]}),(0,l.jsx)(s,{width:`100%`,height:14,index:3}),(0,l.jsx)(s,{width:`90%`,height:14,index:4}),(0,l.jsx)(s,{width:`75%`,height:14,index:5})]})})},h={render:()=>(0,l.jsx)(i,{gap:2,children:[0,1,2,3].map(e=>(0,l.jsxs)(a,{gap:4,vAlign:`center`,children:[(0,l.jsx)(s,{width:50,height:16,index:e*4}),(0,l.jsx)(s,{width:180,height:16,index:e*4+1}),(0,l.jsx)(s,{width:100,height:16,index:e*4+2}),(0,l.jsx)(s,{width:80,height:16,index:e*4+3})]},e))})},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    width: 200,
    height: 20,
    radius: 3,
    index: 0
  }
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  render: () => <HStack gap={4} vAlign="center">
      <Skeleton width={40} height={40} radius="rounded" />
      <Skeleton width={100} height={20} radius={3} />
      <Skeleton width={120} height={32} radius={2} />
      <Skeleton width={80} height={80} radius="none" />
    </HStack>
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  render: () => <VStack gap={2}>
      <Skeleton width={300} height={16} index={0} />
      <Skeleton width={280} height={16} index={1} />
      <Skeleton width={320} height={16} index={2} />
      <Skeleton width={260} height={16} index={3} />
      <Skeleton width={290} height={16} index={4} />
    </VStack>
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
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
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  render: () => <VStack gap={2}>
      {[0, 1, 2, 3].map(rowIndex => <HStack key={rowIndex} gap={4} vAlign="center">
          <Skeleton width={50} height={16} index={rowIndex * 4} />
          <Skeleton width={180} height={16} index={rowIndex * 4 + 1} />
          <Skeleton width={100} height={16} index={rowIndex * 4 + 2} />
          <Skeleton width={80} height={16} index={rowIndex * 4 + 3} />
        </HStack>)}
    </VStack>
}`,...h.parameters?.docs?.source}}},g=[`Default`,`Shapes`,`StaggeredList`,`CardSkeleton`,`TableRowSkeleton`]}))();export{m as CardSkeleton,d as Default,f as Shapes,p as StaggeredList,h as TableRowSkeleton,g as __namedExportsOrder,u as default};