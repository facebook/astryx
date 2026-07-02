import{a1 as e,T as t}from"./iframe-VDTgZ3S9.js";import{D as r}from"./Divider-DBwfFTKM.js";import{C as n}from"./Card-rxGhBGMB.js";import{S as a}from"./Section-DfXRsD85.js";import{V as s}from"./VStack-DObtVm3i.js";import{H as u}from"./HStack-4wu9cx4o.js";import"./preload-helper-Ct5FWWRu.js";import"./container.stylex-uilBL6DE.js";import"./padding.stylex-Dl2_Pyt1.js";import"./Stack-YX98LP5s.js";import"./stack.stylex-BlarxY2N.js";const g={fullHeight:{kZKoxP:"x5yr21d",$$css:!0}},w={title:"Core/Divider",component:r,tags:["autodocs"],argTypes:{orientation:{control:"select",options:["horizontal","vertical"],description:"Orientation of the divider"},variant:{control:"select",options:["subtle","strong"],description:"Visual weight of the divider line"},isFullBleed:{control:"boolean",description:"Escape parent container padding"},label:{control:"text",description:"Optional label text (rendered small and secondary)"}}},d={args:{},render:i=>e.jsx(a,{variant:"muted",children:e.jsx(n,{children:e.jsxs(s,{gap:3,children:[e.jsx(t,{type:"body",children:"Content above"}),e.jsx(r,{...i}),e.jsx(t,{type:"body",children:"Content below"})]})})})},o={args:{label:"or"},render:i=>e.jsx(a,{variant:"muted",children:e.jsx(n,{children:e.jsxs(s,{gap:3,children:[e.jsx(t,{type:"body",children:"Content above"}),e.jsx(r,{...i}),e.jsx(t,{type:"body",children:"Content below"})]})})})},l={render:()=>e.jsx(a,{variant:"muted",children:e.jsxs("div",{className:"x78zum5 xdt5ytf x1qh66ti",children:[e.jsx(n,{children:e.jsxs(s,{gap:3,children:[e.jsx(t,{type:"supporting",children:"Subtle (default)"}),e.jsx(r,{variant:"subtle"})]})}),e.jsx(n,{children:e.jsxs(s,{gap:3,children:[e.jsx(t,{type:"supporting",children:"Strong"}),e.jsx(r,{variant:"strong"})]})})]})})},c={render:()=>e.jsx(a,{variant:"muted",children:e.jsxs("div",{className:"x78zum5 xdt5ytf x1qh66ti",children:[e.jsx(n,{children:e.jsxs(s,{gap:3,children:[e.jsx(t,{type:"label",children:"Normal divider"}),e.jsx(t,{type:"body",children:"The divider respects container padding."}),e.jsx(r,{}),e.jsx(t,{type:"body",children:"Content below the divider."})]})}),e.jsx(n,{children:e.jsxs(s,{gap:3,children:[e.jsx(t,{type:"label",children:"Full bleed divider"}),e.jsx(t,{type:"body",children:"The divider extends to container edges."}),e.jsx(r,{isFullBleed:!0}),e.jsx(t,{type:"body",children:"Content below the divider."})]})})]})})},p={args:{orientation:"vertical"},render:i=>e.jsx(a,{variant:"muted",children:e.jsx(n,{height:200,children:e.jsxs(u,{gap:4,xstyle:g.fullHeight,children:[e.jsx(t,{type:"body",children:"Left content"}),e.jsx(r,{...i}),e.jsx(t,{type:"body",children:"Right content"})]})})})},x={args:{orientation:"vertical",label:"OR"},render:i=>e.jsx(a,{variant:"muted",children:e.jsx(n,{height:200,children:e.jsxs(u,{gap:4,xstyle:g.fullHeight,children:[e.jsx(t,{type:"body",children:"Option A"}),e.jsx(r,{...i}),e.jsx(t,{type:"body",children:"Option B"})]})})})},h={render:()=>e.jsx(a,{variant:"muted",children:e.jsx(n,{children:e.jsxs(s,{gap:3,children:[e.jsx(t,{type:"label",children:"Card Title"}),e.jsx(r,{}),e.jsx(t,{type:"body",children:"This demonstrates how a divider can be used to separate content sections within a card or panel."}),e.jsx(r,{label:"More Info"}),e.jsx(t,{type:"supporting",children:"Additional details can appear below a labeled divider."})]})})})},y={render:()=>e.jsx(a,{variant:"muted",children:e.jsx(n,{height:200,children:e.jsxs(u,{gap:4,xstyle:g.fullHeight,children:[e.jsx(t,{type:"body",children:"Left content"}),e.jsx(r,{orientation:"vertical",isFullBleed:!0}),e.jsx(t,{type:"body",children:"Right content"})]})})})};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
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
}`,...d.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
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
}`,...o.parameters?.docs?.source}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
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
}`,...l.parameters?.docs?.source}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
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
}`,...c.parameters?.docs?.source}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
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
}`,...p.parameters?.docs?.source}}};x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
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
}`,...x.parameters?.docs?.source}}};h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
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
}`,...h.parameters?.docs?.source}}};y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  render: () => <Section variant="muted">
      <Card height={200}>
        <HStack gap={4} xstyle={styles.fullHeight}>
          <Text type="body">Left content</Text>
          <Divider orientation="vertical" isFullBleed />
          <Text type="body">Right content</Text>
        </HStack>
      </Card>
    </Section>
}`,...y.parameters?.docs?.source}}};const H=["Default","WithLabel","Variants","FullBleed","Vertical","VerticalWithLabel","InCard","FullBleedVertical"];export{d as Default,c as FullBleed,y as FullBleedVertical,h as InCard,l as Variants,p as Vertical,x as VerticalWithLabel,o as WithLabel,H as __namedExportsOrder,w as default};
