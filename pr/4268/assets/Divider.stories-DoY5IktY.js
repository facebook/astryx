import{i as e}from"./preload-helper-CT_b8DTk.js";import{t}from"./jsx-runtime-DqZldVDK.js";import{t as n}from"./Text-Bt7jq58k.js";import{n as r,t as i}from"./Card-BbIrXk4e.js";import{i as a,o}from"./Stack-C7dTtCDZ.js";import{t as s}from"./Section-uPZCRnkC.js";import{t as c}from"./Section-C4pDrmx1.js";import{t as l}from"./Layout-BvMyrLFX.js";import{t as u}from"./Text-BYms8e3u.js";import{t as d}from"./Divider-CyxlzlSx.js";import{t as f}from"./Divider-keWi-KmE.js";var p,m,h,g,_,v,y,b,x,S,C,w;e((()=>{f(),i(),c(),l(),u(),p=t(),m={fullHeight:{kZKoxP:`x5yr21d`,$$css:!0}},h={title:`Core/Divider`,component:d,tags:[`autodocs`],argTypes:{orientation:{control:`select`,options:[`horizontal`,`vertical`],description:`Orientation of the divider`},variant:{control:`select`,options:[`subtle`,`strong`],description:`Visual weight of the divider line`},isFullBleed:{control:`boolean`,description:`Escape parent container padding`},label:{control:`text`,description:`Optional label text (rendered small and secondary)`}}},g={args:{},render:e=>(0,p.jsx)(s,{variant:`muted`,children:(0,p.jsx)(r,{children:(0,p.jsxs)(a,{gap:3,children:[(0,p.jsx)(n,{type:`body`,children:`Content above`}),(0,p.jsx)(d,{...e}),(0,p.jsx)(n,{type:`body`,children:`Content below`})]})})})},_={args:{label:`or`},render:e=>(0,p.jsx)(s,{variant:`muted`,children:(0,p.jsx)(r,{children:(0,p.jsxs)(a,{gap:3,children:[(0,p.jsx)(n,{type:`body`,children:`Content above`}),(0,p.jsx)(d,{...e}),(0,p.jsx)(n,{type:`body`,children:`Content below`})]})})})},v={render:()=>(0,p.jsx)(s,{variant:`muted`,children:(0,p.jsxs)(`div`,{className:`x78zum5 xdt5ytf x1qh66ti`,children:[(0,p.jsx)(r,{children:(0,p.jsxs)(a,{gap:3,children:[(0,p.jsx)(n,{type:`supporting`,children:`Subtle (default)`}),(0,p.jsx)(d,{variant:`subtle`})]})}),(0,p.jsx)(r,{children:(0,p.jsxs)(a,{gap:3,children:[(0,p.jsx)(n,{type:`supporting`,children:`Strong`}),(0,p.jsx)(d,{variant:`strong`})]})})]})})},y={render:()=>(0,p.jsx)(s,{variant:`muted`,children:(0,p.jsxs)(`div`,{className:`x78zum5 xdt5ytf x1qh66ti`,children:[(0,p.jsx)(r,{children:(0,p.jsxs)(a,{gap:3,children:[(0,p.jsx)(n,{type:`label`,children:`Normal divider`}),(0,p.jsx)(n,{type:`body`,children:`The divider respects container padding.`}),(0,p.jsx)(d,{}),(0,p.jsx)(n,{type:`body`,children:`Content below the divider.`})]})}),(0,p.jsx)(r,{children:(0,p.jsxs)(a,{gap:3,children:[(0,p.jsx)(n,{type:`label`,children:`Full bleed divider`}),(0,p.jsx)(n,{type:`body`,children:`The divider extends to container edges.`}),(0,p.jsx)(d,{isFullBleed:!0}),(0,p.jsx)(n,{type:`body`,children:`Content below the divider.`})]})})]})})},b={args:{orientation:`vertical`},render:e=>(0,p.jsx)(s,{variant:`muted`,children:(0,p.jsx)(r,{height:200,children:(0,p.jsxs)(o,{gap:4,xstyle:m.fullHeight,children:[(0,p.jsx)(n,{type:`body`,children:`Left content`}),(0,p.jsx)(d,{...e}),(0,p.jsx)(n,{type:`body`,children:`Right content`})]})})})},x={args:{orientation:`vertical`,label:`OR`},render:e=>(0,p.jsx)(s,{variant:`muted`,children:(0,p.jsx)(r,{height:200,children:(0,p.jsxs)(o,{gap:4,xstyle:m.fullHeight,children:[(0,p.jsx)(n,{type:`body`,children:`Option A`}),(0,p.jsx)(d,{...e}),(0,p.jsx)(n,{type:`body`,children:`Option B`})]})})})},S={render:()=>(0,p.jsx)(s,{variant:`muted`,children:(0,p.jsx)(r,{children:(0,p.jsxs)(a,{gap:3,children:[(0,p.jsx)(n,{type:`label`,children:`Card Title`}),(0,p.jsx)(d,{}),(0,p.jsx)(n,{type:`body`,children:`This demonstrates how a divider can be used to separate content sections within a card or panel.`}),(0,p.jsx)(d,{label:`More Info`}),(0,p.jsx)(n,{type:`supporting`,children:`Additional details can appear below a labeled divider.`})]})})})},C={render:()=>(0,p.jsx)(s,{variant:`muted`,children:(0,p.jsx)(r,{height:200,children:(0,p.jsxs)(o,{gap:4,xstyle:m.fullHeight,children:[(0,p.jsx)(n,{type:`body`,children:`Left content`}),(0,p.jsx)(d,{orientation:`vertical`,isFullBleed:!0}),(0,p.jsx)(n,{type:`body`,children:`Right content`})]})})})},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {},
  render: args => <Section variant="muted">
      <Card>
        <VStack gap={3}>
          <Text type="body">Content above</Text>
          <Divider {...args} />
          <Text type="body">Content below</Text>
        </VStack>
      </Card>
    </Section>
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'or'
  },
  render: args => <Section variant="muted">
      <Card>
        <VStack gap={3}>
          <Text type="body">Content above</Text>
          <Divider {...args} />
          <Text type="body">Content below</Text>
        </VStack>
      </Card>
    </Section>
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  render: () => <Section variant="muted">
      <div {...stylex.props(styles.storyWrapper)}>
        <Card>
          <VStack gap={3}>
            <Text type="supporting">Subtle (default)</Text>
            <Divider variant="subtle" />
          </VStack>
        </Card>
        <Card>
          <VStack gap={3}>
            <Text type="supporting">Strong</Text>
            <Divider variant="strong" />
          </VStack>
        </Card>
      </div>
    </Section>
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  render: () => <Section variant="muted">
      <div {...stylex.props(styles.storyWrapper)}>
        <Card>
          <VStack gap={3}>
            <Text type="label">Normal divider</Text>
            <Text type="body">
              The divider respects container padding.
            </Text>
            <Divider />
            <Text type="body">Content below the divider.</Text>
          </VStack>
        </Card>
        <Card>
          <VStack gap={3}>
            <Text type="label">Full bleed divider</Text>
            <Text type="body">
              The divider extends to container edges.
            </Text>
            <Divider isFullBleed />
            <Text type="body">Content below the divider.</Text>
          </VStack>
        </Card>
      </div>
    </Section>
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  args: {
    orientation: 'vertical'
  },
  render: args => <Section variant="muted">
      <Card height={200}>
        <HStack gap={4} xstyle={styles.fullHeight}>
          <Text type="body">Left content</Text>
          <Divider {...args} />
          <Text type="body">Right content</Text>
        </HStack>
      </Card>
    </Section>
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  args: {
    orientation: 'vertical',
    label: 'OR'
  },
  render: args => <Section variant="muted">
      <Card height={200}>
        <HStack gap={4} xstyle={styles.fullHeight}>
          <Text type="body">Option A</Text>
          <Divider {...args} />
          <Text type="body">Option B</Text>
        </HStack>
      </Card>
    </Section>
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  render: () => <Section variant="muted">
      <Card>
        <VStack gap={3}>
          <Text type="label">Card Title</Text>
          <Divider />
          <Text type="body">
            This demonstrates how a divider can be used to separate content
            sections within a card or panel.
          </Text>
          <Divider label="More Info" />
          <Text type="supporting">
            Additional details can appear below a labeled divider.
          </Text>
        </VStack>
      </Card>
    </Section>
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  render: () => <Section variant="muted">
      <Card height={200}>
        <HStack gap={4} xstyle={styles.fullHeight}>
          <Text type="body">Left content</Text>
          <Divider orientation="vertical" isFullBleed />
          <Text type="body">Right content</Text>
        </HStack>
      </Card>
    </Section>
}`,...C.parameters?.docs?.source}}},w=[`Default`,`WithLabel`,`Variants`,`FullBleed`,`Vertical`,`VerticalWithLabel`,`InCard`,`FullBleedVertical`]}))();export{g as Default,y as FullBleed,C as FullBleedVertical,S as InCard,v as Variants,b as Vertical,x as VerticalWithLabel,_ as WithLabel,w as __namedExportsOrder,h as default};