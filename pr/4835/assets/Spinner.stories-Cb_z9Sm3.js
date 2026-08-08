import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{n as t,t as n}from"./Text-BfjtEFtP.js";import{t as r}from"./jsx-runtime-DeHZSEgm.js";import{n as i,t as a}from"./Spinner-CzifdOpC.js";import{n as o,t as s}from"./HStack-DtZv8gmp.js";import{n as c,t as l}from"./VStack-C2SBQ4Fm.js";var u,d,f,p,m,h,g;function _(){return(_=e((()=>{i(),t(),o(),c(),u=r(),d={title:`Core/Spinner`,component:a,tags:[`autodocs`],argTypes:{size:{control:`select`,options:[`sm`,`md`,`lg`,`xl`],description:`Spinner size`},shade:{control:`select`,options:[`default`,`onMedia`],description:`Color shade`}}},f={args:{size:`md`,shade:`default`}},p={render:()=>(0,u.jsxs)(s,{gap:4,vAlign:`center`,children:[(0,u.jsx)(a,{size:`sm`}),(0,u.jsx)(a,{size:`md`}),(0,u.jsx)(a,{size:`lg`}),(0,u.jsx)(a,{size:`xl`})]})},m={render:()=>(0,u.jsxs)(s,{gap:4,vAlign:`center`,children:[(0,u.jsx)(a,{shade:`default`}),(0,u.jsx)(`div`,{style:{backgroundColor:`#1a1a2e`,padding:16,borderRadius:8},children:(0,u.jsx)(a,{shade:`onMedia`})})]})},h={render:()=>(0,u.jsxs)(s,{gap:8,vAlign:`start`,children:[(0,u.jsx)(a,{size:`lg`,label:`Loading...`}),(0,u.jsx)(a,{size:`lg`,label:(0,u.jsxs)(l,{gap:0,hAlign:`center`,children:[(0,u.jsx)(n,{type:`body`,weight:`bold`,children:`Fetching data`}),(0,u.jsx)(n,{type:`supporting`,color:`secondary`,children:`This may take a moment`})]}),"aria-label":`Fetching data`})]})},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    size: 'md',
    shade: 'default'
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  render: () => <HStack gap={4} vAlign="center">
      <Spinner size="sm" />
      <Spinner size="md" />
      <Spinner size="lg" />
      <Spinner size="xl" />
    </HStack>
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
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
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
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
}`,...h.parameters?.docs?.source}}},g=[`Default`,`Sizes`,`Shades`,`WithLabel`]})))()}_();export{f as Default,m as Shades,p as Sizes,h as WithLabel,g as __namedExportsOrder,d as default};