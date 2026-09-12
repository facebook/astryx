import{i as e}from"./preload-helper-CT_b8DTk.js";import{t}from"./jsx-runtime-DqZldVDK.js";import{t as n}from"./Text-z8muYPH2.js";import{n as r,t as i}from"./Spinner-DIaeKoBb.js";import{s as a}from"./useTheme-FMiVXHDm.js";import{t as o,x as s}from"./theme-DrOzLeXT.js";import{i as c,o as l}from"./Stack-B9pi7ZUb.js";import{t as u}from"./Layout-Dt4bRu5Z.js";import{t as d}from"./Text-Cy3vzSsU.js";var f,p,m,h,g,_,v,y,b,x,S,C,w;e((()=>{i(),d(),u(),o(),f=t(),p={title:`Core/Spinner`,component:r,tags:[`autodocs`],argTypes:{size:{control:`select`,options:[`sm`,`md`,`lg`,`xl`],description:`Spinner size`},shade:{control:`select`,options:[`default`,`onMedia`,`subtle`,`inherit`],description:`Color shade`}}},m={args:{size:`md`,shade:`default`}},h={render:()=>(0,f.jsxs)(l,{gap:4,vAlign:`center`,children:[(0,f.jsx)(r,{size:`sm`}),(0,f.jsx)(r,{size:`md`}),(0,f.jsx)(r,{size:`lg`}),(0,f.jsx)(r,{size:`xl`})]})},g={render:()=>(0,f.jsxs)(l,{gap:4,vAlign:`center`,children:[(0,f.jsx)(r,{shade:`default`}),(0,f.jsx)(`div`,{style:{backgroundColor:`#1a1a2e`,padding:16,borderRadius:8},children:(0,f.jsx)(r,{shade:`onMedia`})})]})},_={render:()=>(0,f.jsxs)(l,{gap:8,vAlign:`start`,children:[(0,f.jsx)(r,{size:`lg`,label:`Loading...`}),(0,f.jsx)(r,{size:`lg`,label:(0,f.jsxs)(c,{gap:0,hAlign:`center`,children:[(0,f.jsx)(n,{type:`body`,weight:`bold`,children:`Fetching data`}),(0,f.jsx)(n,{type:`supporting`,color:`secondary`,children:`This may take a moment`})]}),"aria-label":`Fetching data`})]})},v=a({name:`spinner-themed-geometry`,components:{spinner:{"size:sm":{"--spinner-diameter":`1rem`,"--spinner-stroke-width":`0.125rem`},"size:md":{"--spinner-diameter":`1.5rem`,"--spinner-stroke-width":`0.25rem`},"size:lg":{"--spinner-diameter":`2rem`,"--spinner-stroke-width":`0.3125rem`},"size:xl":{"--spinner-diameter":`calc(2rem + 8px)`,"--spinner-stroke-width":`0.375rem`}}}}),y={name:`Themed Geometry (per size)`,render:()=>(0,f.jsxs)(c,{gap:2,children:[(0,f.jsx)(n,{type:`supporting`,color:`secondary`,children:`Themed — rem and calc() diameters; the box tracks the ring`}),(0,f.jsx)(s,{theme:v,mode:`light`,children:(0,f.jsxs)(l,{gap:4,vAlign:`center`,children:[(0,f.jsx)(r,{size:`sm`}),(0,f.jsx)(r,{size:`md`}),(0,f.jsx)(r,{size:`lg`}),(0,f.jsx)(r,{size:`xl`})]})})]})},b=a({name:`spinner-themed-hairline`,components:{spinner:{"size:xl":{"--spinner-stroke-width":`1px`},base:{"--spinner-track-color":`transparent`}}}}),x=a({name:`spinner-themed-color`,components:{spinner:{base:{"--spinner-color":`var(--color-text-blue)`,"--spinner-track-color":`var(--color-background-blue)`},"shade:subtle":{"--spinner-track-color":`transparent`}}}}),S={name:`Themed Color (per shade)`,render:()=>(0,f.jsxs)(c,{gap:2,children:[(0,f.jsx)(n,{type:`supporting`,color:`secondary`,children:"Themed — blue arc and wash; the subtle shade drops its track (the `Shades` story above is the untinted reference — see the note on `ThemedGeometry` for why it cannot sit in this story)"}),(0,f.jsx)(s,{theme:x,mode:`light`,children:(0,f.jsxs)(l,{gap:4,vAlign:`center`,children:[(0,f.jsx)(r,{size:`xl`}),(0,f.jsx)(r,{size:`xl`,shade:`subtle`})]})})]})},C={name:`Themed Hairline Stroke`,render:()=>(0,f.jsxs)(c,{gap:2,children:[(0,f.jsx)(n,{type:`supporting`,color:`secondary`,children:`Themed — a 1px hairline stroke over a transparent track`}),(0,f.jsx)(s,{theme:b,mode:`light`,children:(0,f.jsx)(r,{size:`xl`})})]})},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    size: 'md',
    shade: 'default'
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  render: () => <HStack gap={4} vAlign="center">
      <Spinner size="sm" />
      <Spinner size="md" />
      <Spinner size="lg" />
      <Spinner size="xl" />
    </HStack>
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
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
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
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
}`,..._.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  name: 'Themed Geometry (per size)',
  render: () => <VStack gap={2}>
      <Text type="supporting" color="secondary">
        Themed — rem and calc() diameters; the box tracks the ring
      </Text>
      <Theme theme={themedGeometry} mode="light">
        <HStack gap={4} vAlign="center">
          <Spinner size="sm" />
          <Spinner size="md" />
          <Spinner size="lg" />
          <Spinner size="xl" />
        </HStack>
      </Theme>
    </VStack>
}`,...y.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  name: 'Themed Color (per shade)',
  render: () => <VStack gap={2}>
      <Text type="supporting" color="secondary">
        Themed — blue arc and wash; the subtle shade drops its track (the
        \`Shades\` story above is the untinted reference — see the note on
        \`ThemedGeometry\` for why it cannot sit in this story)
      </Text>
      <Theme theme={themedColor} mode="light">
        <HStack gap={4} vAlign="center">
          <Spinner size="xl" />
          <Spinner size="xl" shade="subtle" />
        </HStack>
      </Theme>
    </VStack>
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  name: 'Themed Hairline Stroke',
  render: () => <VStack gap={2}>
      <Text type="supporting" color="secondary">
        Themed — a 1px hairline stroke over a transparent track
      </Text>
      <Theme theme={themedHairline} mode="light">
        <Spinner size="xl" />
      </Theme>
    </VStack>
}`,...C.parameters?.docs?.source}}},w=[`Default`,`Sizes`,`Shades`,`WithLabel`,`ThemedGeometry`,`ThemedColor`,`ThemedHairlineStroke`]}))();export{m as Default,g as Shades,h as Sizes,S as ThemedColor,y as ThemedGeometry,C as ThemedHairlineStroke,_ as WithLabel,w as __namedExportsOrder,p as default};