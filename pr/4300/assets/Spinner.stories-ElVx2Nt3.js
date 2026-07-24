import{i as e}from"./preload-helper-CT_b8DTk.js";import{t}from"./jsx-runtime-DqZldVDK.js";import{t as n}from"./Text-Iat6xWeA.js";import{n as r,t as i}from"./Spinner-CAUCaiCC.js";import{i as a,o}from"./Stack-C7dTtCDZ.js";import{t as s}from"./Layout-BvMyrLFX.js";import{t as c}from"./Text-BUJwo4gL.js";var l,u,d,f,p,m,h;e((()=>{i(),c(),s(),l=t(),u={title:`Core/Spinner`,component:r,tags:[`autodocs`],argTypes:{size:{control:`select`,options:[`sm`,`md`,`lg`,`xl`],description:`Spinner size`},shade:{control:`select`,options:[`default`,`onMedia`],description:`Color shade`}}},d={args:{size:`md`,shade:`default`}},f={render:()=>(0,l.jsxs)(o,{gap:4,vAlign:`center`,children:[(0,l.jsx)(r,{size:`sm`}),(0,l.jsx)(r,{size:`md`}),(0,l.jsx)(r,{size:`lg`}),(0,l.jsx)(r,{size:`xl`})]})},p={render:()=>(0,l.jsxs)(o,{gap:4,vAlign:`center`,children:[(0,l.jsx)(r,{shade:`default`}),(0,l.jsx)(`div`,{style:{backgroundColor:`#1a1a2e`,padding:16,borderRadius:8},children:(0,l.jsx)(r,{shade:`onMedia`})})]})},m={render:()=>(0,l.jsxs)(o,{gap:8,vAlign:`start`,children:[(0,l.jsx)(r,{size:`lg`,label:`Loading...`}),(0,l.jsx)(r,{size:`lg`,label:(0,l.jsxs)(a,{gap:0,hAlign:`center`,children:[(0,l.jsx)(n,{type:`body`,weight:`bold`,children:`Fetching data`}),(0,l.jsx)(n,{type:`supporting`,color:`secondary`,children:`This may take a moment`})]}),"aria-label":`Fetching data`})]})},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    size: 'md',
    shade: 'default'
  }
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  render: () => <HStack gap={4} vAlign="center">
      <Spinner size="sm" />
      <Spinner size="md" />
      <Spinner size="lg" />
      <Spinner size="xl" />
    </HStack>
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
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
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
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
}`,...m.parameters?.docs?.source}}},h=[`Default`,`Sizes`,`Shades`,`WithLabel`]}))();export{d as Default,p as Shades,f as Sizes,m as WithLabel,h as __namedExportsOrder,u as default};