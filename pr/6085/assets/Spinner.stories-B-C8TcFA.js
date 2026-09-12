import{i as e}from"./preload-helper-CT_b8DTk.js";import{t}from"./jsx-runtime-DqZldVDK.js";import{t as n}from"./Text-CUw_qAJO.js";import{n as r,t as i}from"./Spinner-BhW9O0CQ.js";import{s as a}from"./useTheme-BjGFIaE4.js";import{t as o,x as s}from"./theme-DnizdbAi.js";import{i as c,o as l}from"./Stack-Dntpv-r2.js";import{t as u}from"./Layout-DNDXKYig.js";import{t as d}from"./Text-vPnXGkhM.js";var f,p,m,h,g,_,v,y,b,x,S,C,w,T,E;e((()=>{i(),d(),u(),o(),f=t(),p={title:`Core/Spinner`,component:r,tags:[`autodocs`],argTypes:{size:{control:`select`,options:[`sm`,`md`,`lg`,`xl`],description:`Spinner size`},shade:{control:`select`,options:[`default`,`onMedia`,`subtle`,`inherit`],description:`Color shade`}}},m=e=>({display:`flex`,alignItems:`center`,gap:8,width:e,border:`1px dashed #b0b0b0`,padding:4}),h={args:{size:`md`,shade:`default`}},g={render:()=>(0,f.jsxs)(l,{gap:4,vAlign:`center`,children:[(0,f.jsx)(r,{size:`sm`}),(0,f.jsx)(r,{size:`md`}),(0,f.jsx)(r,{size:`lg`}),(0,f.jsx)(r,{size:`xl`})]})},_={render:()=>(0,f.jsxs)(l,{gap:4,vAlign:`center`,children:[(0,f.jsx)(r,{shade:`default`}),(0,f.jsx)(`div`,{style:{backgroundColor:`#1a1a2e`,padding:16,borderRadius:8},children:(0,f.jsx)(r,{shade:`onMedia`})})]})},v={render:()=>(0,f.jsxs)(l,{gap:8,vAlign:`start`,children:[(0,f.jsx)(r,{size:`lg`,label:`Loading...`}),(0,f.jsx)(r,{size:`lg`,label:(0,f.jsxs)(c,{gap:0,hAlign:`center`,children:[(0,f.jsx)(n,{type:`body`,weight:`bold`,children:`Fetching data`}),(0,f.jsx)(n,{type:`supporting`,color:`secondary`,children:`This may take a moment`})]}),"aria-label":`Fetching data`})]})},y=a({name:`spinner-themed-geometry`,components:{spinner:{"size:sm":{"--spinner-diameter":`1rem`,"--spinner-stroke-width":`0.125rem`},"size:md":{"--spinner-diameter":`1.5rem`,"--spinner-stroke-width":`0.25rem`},"size:lg":{"--spinner-diameter":`2rem`,"--spinner-stroke-width":`0.3125rem`},"size:xl":{"--spinner-diameter":`calc(2rem + 8px)`,"--spinner-stroke-width":`0.375rem`}}}}),b={name:`Themed Geometry (per size)`,render:()=>(0,f.jsxs)(c,{gap:2,children:[(0,f.jsx)(n,{type:`supporting`,color:`secondary`,children:`Themed — rem and calc() diameters; the box tracks the ring`}),(0,f.jsx)(s,{theme:y,mode:`light`,children:(0,f.jsxs)(l,{gap:4,vAlign:`center`,children:[(0,f.jsx)(r,{size:`sm`}),(0,f.jsx)(r,{size:`md`}),(0,f.jsx)(r,{size:`lg`}),(0,f.jsx)(r,{size:`xl`})]})})]})},x=a({name:`spinner-themed-hairline`,components:{spinner:{"size:xl":{"--spinner-stroke-width":`1px`},base:{"--spinner-track-color":`transparent`}}}}),S=a({name:`spinner-themed-color`,components:{spinner:{base:{"--spinner-color":`var(--color-text-blue)`,"--spinner-track-color":`var(--color-background-blue)`},"shade:subtle":{"--spinner-track-color":`transparent`}}}}),C={name:`Themed Color (per shade)`,render:()=>(0,f.jsxs)(c,{gap:2,children:[(0,f.jsx)(n,{type:`supporting`,color:`secondary`,children:"Themed — blue arc and wash; the subtle shade drops its track (the `Shades` story above is the untinted reference — see the note on `ThemedGeometry` for why it cannot sit in this story)"}),(0,f.jsx)(s,{theme:S,mode:`light`,children:(0,f.jsxs)(l,{gap:4,vAlign:`center`,children:[(0,f.jsx)(r,{size:`xl`}),(0,f.jsx)(r,{size:`xl`,shade:`subtle`})]})})]})},w={name:`Themed Hairline Stroke`,render:()=>(0,f.jsxs)(c,{gap:2,children:[(0,f.jsx)(n,{type:`supporting`,color:`secondary`,children:`Themed — a 1px hairline stroke over a transparent track`}),(0,f.jsx)(s,{theme:x,mode:`light`,children:(0,f.jsx)(r,{size:`xl`})})]})},T={render:()=>(0,f.jsxs)(c,{gap:4,hAlign:`start`,children:[(0,f.jsxs)(c,{gap:1,hAlign:`start`,children:[(0,f.jsx)(n,{type:`supporting`,color:`secondary`,children:`Label beside it, in a 140px row`}),(0,f.jsxs)(`div`,{style:m(140),children:[(0,f.jsx)(r,{size:`md`}),(0,f.jsx)(n,{type:`body`,children:`Uploading attachments…`})]})]}),(0,f.jsxs)(c,{gap:1,hAlign:`start`,children:[(0,f.jsx)(n,{type:`supporting`,color:`secondary`,children:`Beside a sibling that keeps its width (flex: 1 0 100px)`}),(0,f.jsxs)(`div`,{style:m(120),children:[(0,f.jsx)(r,{size:`lg`}),(0,f.jsx)(`div`,{style:{flex:`1 0 100px`,height:8,background:`#e0e0e0`}})]})]}),(0,f.jsxs)(c,{gap:1,hAlign:`start`,children:[(0,f.jsx)(n,{type:`supporting`,color:`secondary`,children:`Host narrower than the spinner outright (16px)`}),(0,f.jsx)(`div`,{style:m(16),children:(0,f.jsx)(r,{size:`xl`})})]})]})},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    size: 'md',
    shade: 'default'
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  render: () => <HStack gap={4} vAlign="center">
      <Spinner size="sm" />
      <Spinner size="md" />
      <Spinner size="lg" />
      <Spinner size="xl" />
    </HStack>
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
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
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
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
}`,...v.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
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
}`,...b.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
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
}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  name: 'Themed Hairline Stroke',
  render: () => <VStack gap={2}>
      <Text type="supporting" color="secondary">
        Themed — a 1px hairline stroke over a transparent track
      </Text>
      <Theme theme={themedHairline} mode="light">
        <Spinner size="xl" />
      </Theme>
    </VStack>
}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  render: () => <VStack gap={4} hAlign="start">
      <VStack gap={1} hAlign="start">
        <Text type="supporting" color="secondary">
          Label beside it, in a 140px row
        </Text>
        <div style={narrowHost(140)}>
          <Spinner size="md" />
          <Text type="body">Uploading attachments…</Text>
        </div>
      </VStack>

      <VStack gap={1} hAlign="start">
        <Text type="supporting" color="secondary">
          Beside a sibling that keeps its width (flex: 1 0 100px)
        </Text>
        <div style={narrowHost(120)}>
          <Spinner size="lg" />
          <div style={{
          flex: '1 0 100px',
          height: 8,
          background: '#e0e0e0'
        }} />
        </div>
      </VStack>

      <VStack gap={1} hAlign="start">
        <Text type="supporting" color="secondary">
          Host narrower than the spinner outright (16px)
        </Text>
        <div style={narrowHost(16)}>
          <Spinner size="xl" />
        </div>
      </VStack>
    </VStack>
}`,...T.parameters?.docs?.source},description:{story:`A flex host narrower than the spinner in it. The box keeps the ring's size
and overflows the host visibly; before the fix the host compressed the box
and the ring was cut off at its edge, silently — a sliced ring still spins,
so nothing reported a problem. The dashed rule is the host, drawn so the
overflow is legible.

All three are ordinary layouts rather than contrived ones: a label beside a
spinner in a narrow row, a spinner next to a sibling that will not give up
its width, and a host smaller than the spinner outright.`,...T.parameters?.docs?.description}}},E=[`Default`,`Sizes`,`Shades`,`WithLabel`,`ThemedGeometry`,`ThemedColor`,`ThemedHairlineStroke`,`NarrowFlexHost`]}))();export{h as Default,T as NarrowFlexHost,_ as Shades,g as Sizes,C as ThemedColor,b as ThemedGeometry,w as ThemedHairlineStroke,v as WithLabel,E as __namedExportsOrder,p as default};