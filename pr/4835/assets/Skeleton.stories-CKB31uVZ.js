import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{t}from"./jsx-runtime-DeHZSEgm.js";import{n,t as r}from"./Card-270yxekz.js";import{n as i,t as a}from"./HStack-DtZv8gmp.js";import{n as o,t as s}from"./VStack-C2SBQ4Fm.js";import{n as c,t as l}from"./Skeleton-d5c7P1bX.js";var u,d,f,p,m,h,g,_;function v(){return(v=e((()=>{c(),n(),i(),o(),u=t(),d={title:`Core/Skeleton`,component:l,tags:[`autodocs`],argTypes:{width:{control:`text`,description:`Width (number for px, string for any CSS value)`},height:{control:`text`,description:`Height (number for px, string for any CSS value)`},radius:{control:`select`,options:[`none`,0,1,2,3,4,`rounded`],description:`Border radius using design tokens`},index:{control:{type:`number`,min:0,max:10,step:1},description:`Index for staggered animation timing`}}},f={args:{width:200,height:20,radius:3,index:0}},p={render:()=>(0,u.jsxs)(a,{gap:4,vAlign:`center`,children:[(0,u.jsx)(l,{width:40,height:40,radius:`rounded`}),(0,u.jsx)(l,{width:100,height:20,radius:3}),(0,u.jsx)(l,{width:120,height:32,radius:2}),(0,u.jsx)(l,{width:80,height:80,radius:`none`})]})},m={render:()=>(0,u.jsxs)(s,{gap:2,children:[(0,u.jsx)(l,{width:300,height:16,index:0}),(0,u.jsx)(l,{width:280,height:16,index:1}),(0,u.jsx)(l,{width:320,height:16,index:2}),(0,u.jsx)(l,{width:260,height:16,index:3}),(0,u.jsx)(l,{width:290,height:16,index:4})]})},h={render:()=>(0,u.jsx)(r,{width:320,children:(0,u.jsxs)(s,{gap:3,children:[(0,u.jsxs)(a,{gap:3,vAlign:`center`,children:[(0,u.jsx)(l,{width:40,height:40,radius:`rounded`,index:0}),(0,u.jsxs)(s,{gap:1,children:[(0,u.jsx)(l,{width:120,height:14,index:1}),(0,u.jsx)(l,{width:80,height:12,index:2})]})]}),(0,u.jsx)(l,{width:`100%`,height:14,index:3}),(0,u.jsx)(l,{width:`90%`,height:14,index:4}),(0,u.jsx)(l,{width:`75%`,height:14,index:5})]})})},g={render:()=>(0,u.jsx)(s,{gap:2,children:[0,1,2,3].map(e=>(0,u.jsxs)(a,{gap:4,vAlign:`center`,children:[(0,u.jsx)(l,{width:50,height:16,index:e*4}),(0,u.jsx)(l,{width:180,height:16,index:e*4+1}),(0,u.jsx)(l,{width:100,height:16,index:e*4+2}),(0,u.jsx)(l,{width:80,height:16,index:e*4+3})]},e))})},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    width: 200,
    height: 20,
    radius: 3,
    index: 0
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  render: () => <HStack gap={4} vAlign="center">
      <Skeleton width={40} height={40} radius="rounded" />
      <Skeleton width={100} height={20} radius={3} />
      <Skeleton width={120} height={32} radius={2} />
      <Skeleton width={80} height={80} radius="none" />
    </HStack>
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  render: () => <VStack gap={2}>
      <Skeleton width={300} height={16} index={0} />
      <Skeleton width={280} height={16} index={1} />
      <Skeleton width={320} height={16} index={2} />
      <Skeleton width={260} height={16} index={3} />
      <Skeleton width={290} height={16} index={4} />
    </VStack>
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
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
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  render: () => <VStack gap={2}>
      {[0, 1, 2, 3].map(rowIndex => <HStack key={rowIndex} gap={4} vAlign="center">
          <Skeleton width={50} height={16} index={rowIndex * 4} />
          <Skeleton width={180} height={16} index={rowIndex * 4 + 1} />
          <Skeleton width={100} height={16} index={rowIndex * 4 + 2} />
          <Skeleton width={80} height={16} index={rowIndex * 4 + 3} />
        </HStack>)}
    </VStack>
}`,...g.parameters?.docs?.source}}},_=[`Default`,`Shapes`,`StaggeredList`,`CardSkeleton`,`TableRowSkeleton`]})))()}v();export{h as CardSkeleton,f as Default,p as Shapes,m as StaggeredList,g as TableRowSkeleton,_ as __namedExportsOrder,d as default};