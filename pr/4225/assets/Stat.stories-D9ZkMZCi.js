import{i as e}from"./preload-helper-CT_b8DTk.js";import{t}from"./jsx-runtime-DqZldVDK.js";import{n,t as r}from"./Card-B6hq5pd9.js";import{i,o as a}from"./Stack-C7dTtCDZ.js";import{t as o}from"./Layout-BvMyrLFX.js";import{t as s}from"./Grid-D30rfaCh.js";import{Cn as c}from"./iframe-CER2Y08S.js";import{_n as l,t as u}from"./src-BT5LaKNd.js";var d,f,p,m,h,g;e((()=>{u(),r(),c(),o(),d=t(),f={title:`Lab/Stat`,component:l,tags:[`autodocs`],parameters:{layout:`centered`},decorators:[e=>(0,d.jsx)(`div`,{style:{width:760,maxWidth:`100%`},children:(0,d.jsx)(e,{})})]},p={render:()=>(0,d.jsxs)(s,{columns:{minWidth:160,repeat:`fit`},gap:6,children:[(0,d.jsx)(n,{children:(0,d.jsx)(l,{label:`Total revenue`,value:`$1.28M`,delta:{value:`+12.4%`,direction:`up`},description:`vs. previous 30 days`})}),(0,d.jsx)(n,{children:(0,d.jsx)(l,{label:`Error rate`,value:`0.42%`,delta:{value:`-0.08%`,direction:`down`,sentiment:`positive`},description:`vs. previous 30 days`})}),(0,d.jsx)(n,{children:(0,d.jsx)(l,{label:`Active users`,value:`18,204`,delta:{value:`0.0%`,direction:`flat`},description:`vs. previous 30 days`})})]})},m={render:()=>(0,d.jsxs)(a,{gap:8,vAlign:`end`,children:[(0,d.jsx)(l,{label:`Deploys`,value:`128`,size:`sm`,delta:{value:`+6`,direction:`up`}}),(0,d.jsx)(l,{label:`Deploys`,value:`128`,size:`md`,delta:{value:`+6`,direction:`up`}}),(0,d.jsx)(l,{label:`Deploys`,value:`128`,size:`lg`,delta:{value:`+6`,direction:`up`}})]})},h={render:()=>(0,d.jsx)(n,{children:(0,d.jsx)(i,{gap:4,children:(0,d.jsx)(l,{label:`Conversion`,value:`7.8%`,delta:{value:`+0.9%`,direction:`up`},description:`checkout completion`,media:(0,d.jsx)(`svg`,{viewBox:`0 0 160 36`,role:`img`,"aria-label":`Rising trend`,children:(0,d.jsx)(`polyline`,{points:`0,28 24,26 48,30 72,18 96,20 120,10 160,8`,fill:`none`,stroke:`var(--color-accent)`,strokeWidth:`3`,strokeLinecap:`round`,strokeLinejoin:`round`})})})})})},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  render: () => <Grid columns={{
    minWidth: 160,
    repeat: 'fit'
  }} gap={6}>
      <Card>
        <Stat label="Total revenue" value="$1.28M" delta={{
        value: '+12.4%',
        direction: 'up'
      }} description="vs. previous 30 days" />
      </Card>
      <Card>
        <Stat label="Error rate" value="0.42%" delta={{
        value: '-0.08%',
        direction: 'down',
        sentiment: 'positive'
      }} description="vs. previous 30 days" />
      </Card>
      <Card>
        <Stat label="Active users" value="18,204" delta={{
        value: '0.0%',
        direction: 'flat'
      }} description="vs. previous 30 days" />
      </Card>
    </Grid>
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  render: () => <HStack gap={8} vAlign="end">
      <Stat label="Deploys" value="128" size="sm" delta={{
      value: '+6',
      direction: 'up'
    }} />
      <Stat label="Deploys" value="128" size="md" delta={{
      value: '+6',
      direction: 'up'
    }} />
      <Stat label="Deploys" value="128" size="lg" delta={{
      value: '+6',
      direction: 'up'
    }} />
    </HStack>
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  render: () => <Card>
      <VStack gap={4}>
        <Stat label="Conversion" value="7.8%" delta={{
        value: '+0.9%',
        direction: 'up'
      }} description="checkout completion" media={<svg viewBox="0 0 160 36" role="img" aria-label="Rising trend">
              <polyline points="0,28 24,26 48,30 72,18 96,20 120,10 160,8" fill="none" stroke="var(--color-accent)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>} />
      </VStack>
    </Card>
}`,...h.parameters?.docs?.source}}},g=[`Showcase`,`Sizes`,`WithMedia`]}))();export{p as Showcase,m as Sizes,h as WithMedia,g as __namedExportsOrder,f as default};