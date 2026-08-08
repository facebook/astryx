import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{n as t,t as n}from"./Text-BfjtEFtP.js";import{t as r}from"./jsx-runtime-DeHZSEgm.js";import{n as i,t as a}from"./Divider-D4km6nVj.js";import{n as o,t as s}from"./Card-270yxekz.js";import{n as c,t as l}from"./HStack-DtZv8gmp.js";import{n as u,t as d}from"./VStack-C2SBQ4Fm.js";import{n as f,t as p}from"./Section-BQJsZyZZ.js";var m,h,g,_,v,y,b,x,S,C,w,T;function E(){return(E=e((()=>{i(),o(),f(),u(),c(),t(),m=r(),h={fullHeight:{kZKoxP:`x5yr21d`,$$css:!0}},g={title:`Core/Divider`,component:a,tags:[`autodocs`],argTypes:{orientation:{control:`select`,options:[`horizontal`,`vertical`],description:`Orientation of the divider`},variant:{control:`select`,options:[`subtle`,`strong`],description:`Visual weight of the divider line`},isFullBleed:{control:`boolean`,description:`Escape parent container padding`},label:{control:`text`,description:`Optional label text (rendered small and secondary)`}}},_={args:{},render:e=>(0,m.jsx)(p,{variant:`muted`,children:(0,m.jsx)(s,{children:(0,m.jsxs)(d,{gap:3,children:[(0,m.jsx)(n,{type:`body`,children:`Content above`}),(0,m.jsx)(a,{...e}),(0,m.jsx)(n,{type:`body`,children:`Content below`})]})})})},v={args:{label:`or`},render:e=>(0,m.jsx)(p,{variant:`muted`,children:(0,m.jsx)(s,{children:(0,m.jsxs)(d,{gap:3,children:[(0,m.jsx)(n,{type:`body`,children:`Content above`}),(0,m.jsx)(a,{...e}),(0,m.jsx)(n,{type:`body`,children:`Content below`})]})})})},y={render:()=>(0,m.jsx)(p,{variant:`muted`,children:(0,m.jsxs)(`div`,{className:`x78zum5 xdt5ytf x1qh66ti`,children:[(0,m.jsx)(s,{children:(0,m.jsxs)(d,{gap:3,children:[(0,m.jsx)(n,{type:`supporting`,children:`Subtle (default)`}),(0,m.jsx)(a,{variant:`subtle`})]})}),(0,m.jsx)(s,{children:(0,m.jsxs)(d,{gap:3,children:[(0,m.jsx)(n,{type:`supporting`,children:`Strong`}),(0,m.jsx)(a,{variant:`strong`})]})})]})})},b={render:()=>(0,m.jsx)(p,{variant:`muted`,children:(0,m.jsxs)(`div`,{className:`x78zum5 xdt5ytf x1qh66ti`,children:[(0,m.jsx)(s,{children:(0,m.jsxs)(d,{gap:3,children:[(0,m.jsx)(n,{type:`label`,children:`Normal divider`}),(0,m.jsx)(n,{type:`body`,children:`The divider respects container padding.`}),(0,m.jsx)(a,{}),(0,m.jsx)(n,{type:`body`,children:`Content below the divider.`})]})}),(0,m.jsx)(s,{children:(0,m.jsxs)(d,{gap:3,children:[(0,m.jsx)(n,{type:`label`,children:`Full bleed divider`}),(0,m.jsx)(n,{type:`body`,children:`The divider extends to container edges.`}),(0,m.jsx)(a,{isFullBleed:!0}),(0,m.jsx)(n,{type:`body`,children:`Content below the divider.`})]})})]})})},x={args:{orientation:`vertical`},render:e=>(0,m.jsx)(p,{variant:`muted`,children:(0,m.jsx)(s,{height:200,children:(0,m.jsxs)(l,{gap:4,xstyle:h.fullHeight,children:[(0,m.jsx)(n,{type:`body`,children:`Left content`}),(0,m.jsx)(a,{...e}),(0,m.jsx)(n,{type:`body`,children:`Right content`})]})})})},S={args:{orientation:`vertical`,label:`OR`},render:e=>(0,m.jsx)(p,{variant:`muted`,children:(0,m.jsx)(s,{height:200,children:(0,m.jsxs)(l,{gap:4,xstyle:h.fullHeight,children:[(0,m.jsx)(n,{type:`body`,children:`Option A`}),(0,m.jsx)(a,{...e}),(0,m.jsx)(n,{type:`body`,children:`Option B`})]})})})},C={render:()=>(0,m.jsx)(p,{variant:`muted`,children:(0,m.jsx)(s,{children:(0,m.jsxs)(d,{gap:3,children:[(0,m.jsx)(n,{type:`label`,children:`Card Title`}),(0,m.jsx)(a,{}),(0,m.jsx)(n,{type:`body`,children:`This demonstrates how a divider can be used to separate content sections within a card or panel.`}),(0,m.jsx)(a,{label:`More Info`}),(0,m.jsx)(n,{type:`supporting`,children:`Additional details can appear below a labeled divider.`})]})})})},w={render:()=>(0,m.jsx)(p,{variant:`muted`,children:(0,m.jsx)(s,{height:200,children:(0,m.jsxs)(l,{gap:4,xstyle:h.fullHeight,children:[(0,m.jsx)(n,{type:`body`,children:`Left content`}),(0,m.jsx)(a,{orientation:`vertical`,isFullBleed:!0}),(0,m.jsx)(n,{type:`body`,children:`Right content`})]})})})},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
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
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
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
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
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
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
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
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
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
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
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
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
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
}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  render: () => <Section variant="muted">
      <Card height={200}>
        <HStack gap={4} xstyle={styles.fullHeight}>
          <Text type="body">Left content</Text>
          <Divider orientation="vertical" isFullBleed />
          <Text type="body">Right content</Text>
        </HStack>
      </Card>
    </Section>
}`,...w.parameters?.docs?.source}}},T=[`Default`,`WithLabel`,`Variants`,`FullBleed`,`Vertical`,`VerticalWithLabel`,`InCard`,`FullBleedVertical`]})))()}E();export{_ as Default,b as FullBleed,w as FullBleedVertical,C as InCard,y as Variants,x as Vertical,S as VerticalWithLabel,v as WithLabel,T as __namedExportsOrder,g as default};