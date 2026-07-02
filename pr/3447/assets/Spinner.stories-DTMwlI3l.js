import{e as a,a1 as e,T as o}from"./iframe-j1EZkcGb.js";import{H as i}from"./HStack-C4ACR8-o.js";import{V as d}from"./VStack-Bq5RLdGQ.js";import"./preload-helper-Ct5FWWRu.js";import"./Stack-DWPtcxDC.js";import"./stack.stylex-BlarxY2N.js";import"./padding.stylex-Dl2_Pyt1.js";const u={title:"Core/Spinner",component:a,tags:["autodocs"],argTypes:{size:{control:"select",options:["sm","md","lg","xl"],description:"Spinner size"},shade:{control:"select",options:["default","onMedia"],description:"Color shade"}}},r={args:{size:"md",shade:"default"}},s={render:()=>e.jsxs(i,{gap:4,vAlign:"center",children:[e.jsx(a,{size:"sm"}),e.jsx(a,{size:"md"}),e.jsx(a,{size:"lg"}),e.jsx(a,{size:"xl"})]})},n={render:()=>e.jsxs(i,{gap:4,vAlign:"center",children:[e.jsx(a,{shade:"default"}),e.jsx("div",{style:{backgroundColor:"#1a1a2e",padding:16,borderRadius:8},children:e.jsx(a,{shade:"onMedia"})})]})},t={render:()=>e.jsxs(i,{gap:8,vAlign:"start",children:[e.jsx(a,{size:"lg",label:"Loading..."}),e.jsx(a,{size:"lg",label:e.jsxs(d,{gap:0,hAlign:"center",children:[e.jsx(o,{type:"body",weight:"bold",children:"Fetching data"}),e.jsx(o,{type:"supporting",color:"secondary",children:"This may take a moment"})]}),"aria-label":"Fetching data"})]})};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    size: 'md',
    shade: 'default'
  }
}`,...r.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  render: () => <HStack gap={4} vAlign="center">
      <Spinner size="sm" />
      <Spinner size="md" />
      <Spinner size="lg" />
      <Spinner size="xl" />
    </HStack>
}`,...s.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  render: () => <HStack gap={4} vAlign="center">
      <Spinner shade="default" />
      <div style={{
      backgroundColor: '#1a1a2e',
      padding: 16,
      borderRadius: 8
    }}>
        <Spinner shade="onMedia" />
      </div>
    </HStack>
}`,...n.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  render: () => <HStack gap={8} vAlign="start">
      <Spinner size="lg" label="Loading..." />
      <Spinner size="lg" label={<VStack gap={0} hAlign="center">
            <Text type="body" weight="bold">
              Fetching data
            </Text>
            <Text type="supporting" color="secondary">
              This may take a moment
            </Text>
          </VStack>} aria-label="Fetching data" />
    </HStack>
}`,...t.parameters?.docs?.source}}};const x=["Default","Sizes","Shades","WithLabel"];export{r as Default,n as Shades,s as Sizes,t as WithLabel,x as __namedExportsOrder,u as default};
