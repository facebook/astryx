import{a1 as e,B as g}from"./iframe-j1EZkcGb.js";import{S as t}from"./Section-DLuGvs6u.js";import{L as l,b as h}from"./LayoutContent-DU4hXhqk.js";import{L as x}from"./LayoutHeader-DdYoWy3N.js";import{L as y}from"./LayoutFooter-0W6t4wiI.js";import{L as m}from"./LayoutPanel-C37ggjMU.js";import{V as p}from"./VStack-Bq5RLdGQ.js";import{H as u}from"./HStack-C4ACR8-o.js";import"./preload-helper-Ct5FWWRu.js";import"./container.stylex-uilBL6DE.js";import"./padding.stylex-Dl2_Pyt1.js";import"./stack.stylex-BlarxY2N.js";import"./stackItem.stylex-CgqrJM4N.js";import"./Stack-DWPtcxDC.js";const T={title:"Core/Section",component:t,tags:["autodocs"],decorators:[c=>e.jsx("div",{className:"x10xzikg x1gt495",children:e.jsx(c,{})})],argTypes:{variant:{control:"select",options:["section","transparent","muted"],description:"Visual variant of the section"},width:{control:{type:"range",min:100,max:800,step:10},description:"Width in pixels"},height:{control:{type:"range",min:100,max:600,step:10},description:"Height in pixels"}}},n={args:{variant:"section",width:300},render:c=>e.jsx(t,{...c,children:e.jsx("p",{className:"x9ynric x1tgivj0 x1ghz6dp",children:"A section with default padding. Sections are used to define distinct areas within a page."})})},i={render:()=>e.jsxs("div",{className:"x78zum5 x1qh66ti x1a02dak",children:[e.jsxs("div",{children:[e.jsx("h4",{className:"xrcdmg7 x9ynric xif65rj xv1l7n4",children:"section (default)"}),e.jsx(t,{variant:"section",width:200,children:e.jsx("p",{className:"x9ynric x1tgivj0 x1ghz6dp",children:"Surface background"})})]}),e.jsxs("div",{children:[e.jsx("h4",{className:"xrcdmg7 x9ynric xif65rj xv1l7n4",children:"muted"}),e.jsx(t,{variant:"muted",width:200,children:e.jsx("p",{className:"x9ynric x1tgivj0 x1ghz6dp",children:"Wash background"})})]}),e.jsxs("div",{children:[e.jsx("h4",{className:"xrcdmg7 x9ynric xif65rj xv1l7n4",children:"transparent"}),e.jsx(t,{variant:"transparent",width:200,children:e.jsx("p",{className:"x9ynric x1tgivj0 x1ghz6dp",children:"Transparent background"})})]})]})},s={render:()=>e.jsx(t,{variant:"muted",width:320,children:e.jsxs(p,{gap:2,children:[e.jsx("h3",{className:"x9ynric x1tgivj0 x1ghz6dp",children:"Section Title"}),e.jsx("p",{className:"x9ynric x1ghz6dp xv1l7n4 xif65rj",children:"This section contains simple content without Layout. The container padding is applied automatically."})]})})},a={render:()=>e.jsx(t,{variant:"muted",width:350,height:250,children:e.jsx(l,{header:e.jsx(x,{hasDivider:!0,children:e.jsx("h3",{className:"x9ynric x1tgivj0 x1ghz6dp",children:"Section with Layout"})}),content:e.jsx(h,{children:e.jsx("p",{className:"x9ynric x1ghz6dp xv1l7n4 xif65rj",children:"When using Layout, the layout manages its own padding independently from the container padding."})}),footer:e.jsx(y,{hasDivider:!0,children:e.jsx(u,{gap:2,hAlign:"end",children:e.jsx(g,{label:"Action",variant:"primary",children:"Action"})})})})})},r={render:()=>e.jsx(t,{variant:"section",width:600,height:300,children:e.jsx(l,{header:e.jsx(x,{hasDivider:!0,children:e.jsxs(p,{gap:2,children:[e.jsx("h2",{className:"x9ynric x1tgivj0 x1ghz6dp",children:"Page Header"}),e.jsx("p",{className:"x9ynric x1ghz6dp xv1l7n4 xif65rj",children:"Welcome to the application"})]})}),start:e.jsx(m,{hasDivider:!0,width:150,children:e.jsx("h3",{className:"x9ynric x1tgivj0 x1ghz6dp",children:"Sidebar"})}),content:e.jsx(h,{children:e.jsxs(p,{gap:2,children:[e.jsx("h3",{className:"x9ynric x1tgivj0 x1ghz6dp",children:"Main Content"}),e.jsx("p",{className:"x9ynric x1ghz6dp xv1l7n4 xif65rj",children:"This demonstrates how Layout can be used to create page layouts with header, sidebar, and content areas."})]})})})})},d={render:()=>e.jsxs("div",{className:"x78zum5 x1qh66ti x1a02dak",children:[e.jsxs("div",{children:[e.jsx("h4",{className:"xrcdmg7 x9ynric xif65rj xv1l7n4",children:"Default (with padding)"}),e.jsx(t,{variant:"muted",width:250,children:e.jsx("div",{style:{backgroundColor:"rgba(0,100,200,0.2)",padding:8},children:e.jsx("p",{className:"x9ynric x1tgivj0 x1ghz6dp",children:"Content with section padding"})})})]}),e.jsxs("div",{children:[e.jsx("h4",{className:"xrcdmg7 x9ynric xif65rj xv1l7n4",children:"Full Bleed (no padding)"}),e.jsx(t,{variant:"muted",width:250,padding:0,children:e.jsx("div",{style:{backgroundColor:"rgba(0,100,200,0.2)",padding:8},children:e.jsx("p",{className:"x9ynric x1tgivj0 x1ghz6dp",children:"Content touches section edges"})})})]})]})},o={render:()=>e.jsxs("div",{className:"x78zum5 x1qh66ti x1a02dak",children:[e.jsxs("div",{children:[e.jsx("h4",{className:"xrcdmg7 x9ynric xif65rj xv1l7n4",children:"padding=6 → nested (inherits 6)"}),e.jsx(t,{variant:"section",width:350,padding:6,children:e.jsx(t,{variant:"muted",children:e.jsx("p",{className:"x9ynric x1tgivj0 x1ghz6dp",children:"Inner section inherits padding=6 from parent. Edge compensation and content inset should both use 24px."})})})]}),e.jsxs("div",{children:[e.jsx("h4",{className:"xrcdmg7 x9ynric xif65rj xv1l7n4",children:"padding=6 → nested padding=2"}),e.jsx(t,{variant:"section",width:350,padding:6,children:e.jsx(t,{variant:"muted",padding:2,children:e.jsx("p",{className:"x9ynric x1tgivj0 x1ghz6dp",children:"Inner section explicitly sets padding=2, overriding the parent's padding=6. Content inset is 8px."})})})]}),e.jsxs("div",{children:[e.jsx("h4",{className:"xrcdmg7 x9ynric xif65rj xv1l7n4",children:"padding=2 → nested (inherits 2)"}),e.jsx(t,{variant:"section",width:350,padding:2,children:e.jsx(t,{variant:"muted",children:e.jsx("p",{className:"x9ynric x1tgivj0 x1ghz6dp",children:"Inner section inherits padding=2 from parent. Both edge compensation and content inset use 8px."})})})]})]})};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  args: {
    variant: 'section',
    width: 300
  },
  render: args => <Section {...args}>
      <p {...stylex.props(styles.text)}>
        A section with default padding. Sections are used to define distinct
        areas within a page.
      </p>
    </Section>
}`,...n.parameters?.docs?.source}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  render: () => <div {...stylex.props(styles.storyWrapper)}>
      <div>
        <h4 {...stylex.props(styles.heading)}>section (default)</h4>
        <Section variant="section" width={200}>
          <p {...stylex.props(styles.text)}>Surface background</p>
        </Section>
      </div>
      <div>
        <h4 {...stylex.props(styles.heading)}>muted</h4>
        <Section variant="muted" width={200}>
          <p {...stylex.props(styles.text)}>Wash background</p>
        </Section>
      </div>
      <div>
        <h4 {...stylex.props(styles.heading)}>transparent</h4>
        <Section variant="transparent" width={200}>
          <p {...stylex.props(styles.text)}>Transparent background</p>
        </Section>
      </div>
    </div>
}`,...i.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  render: () => <Section variant="muted" width={320}>
      <VStack gap={2}>
        <h3 {...stylex.props(styles.text)}>Section Title</h3>
        <p {...stylex.props(styles.text, styles.textSecondary)}>
          This section contains simple content without Layout. The container
          padding is applied automatically.
        </p>
      </VStack>
    </Section>
}`,...s.parameters?.docs?.source}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  render: () => <Section variant="muted" width={350} height={250}>
      <Layout header={<LayoutHeader hasDivider>
            <h3 {...stylex.props(styles.text)}>Section with Layout</h3>
          </LayoutHeader>} content={<LayoutContent>
            <p {...stylex.props(styles.text, styles.textSecondary)}>
              When using Layout, the layout manages its own padding
              independently from the container padding.
            </p>
          </LayoutContent>} footer={<LayoutFooter hasDivider>
            <HStack gap={2} hAlign="end">
              <Button label="Action" variant="primary">
                Action
              </Button>
            </HStack>
          </LayoutFooter>} />
    </Section>
}`,...a.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  render: () => <Section variant="section" width={600} height={300}>
      <Layout header={<LayoutHeader hasDivider>
            <VStack gap={2}>
              <h2 {...stylex.props(styles.text)}>Page Header</h2>
              <p {...stylex.props(styles.text, styles.textSecondary)}>
                Welcome to the application
              </p>
            </VStack>
          </LayoutHeader>} start={<LayoutPanel hasDivider width={150}>
            <h3 {...stylex.props(styles.text)}>Sidebar</h3>
          </LayoutPanel>} content={<LayoutContent>
            <VStack gap={2}>
              <h3 {...stylex.props(styles.text)}>Main Content</h3>
              <p {...stylex.props(styles.text, styles.textSecondary)}>
                This demonstrates how Layout can be used to create page
                layouts with header, sidebar, and content areas.
              </p>
            </VStack>
          </LayoutContent>} />
    </Section>
}`,...r.parameters?.docs?.source}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  render: () => <div {...stylex.props(styles.storyWrapper)}>
      <div>
        <h4 {...stylex.props(styles.heading)}>Default (with padding)</h4>
        <Section variant="muted" width={250}>
          <div style={{
          backgroundColor: 'rgba(0,100,200,0.2)',
          padding: 8
        }}>
            <p {...stylex.props(styles.text)}>Content with section padding</p>
          </div>
        </Section>
      </div>
      <div>
        <h4 {...stylex.props(styles.heading)}>Full Bleed (no padding)</h4>
        <Section variant="muted" width={250} padding={0}>
          <div style={{
          backgroundColor: 'rgba(0,100,200,0.2)',
          padding: 8
        }}>
            <p {...stylex.props(styles.text)}>Content touches section edges</p>
          </div>
        </Section>
      </div>
    </div>
}`,...d.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  render: () => <div {...stylex.props(styles.storyWrapper)}>
      <div>
        <h4 {...stylex.props(styles.heading)}>
          padding=6 → nested (inherits 6)
        </h4>
        <Section variant="section" width={350} padding={6}>
          <Section variant="muted">
            <p {...stylex.props(styles.text)}>
              Inner section inherits padding=6 from parent. Edge compensation
              and content inset should both use 24px.
            </p>
          </Section>
        </Section>
      </div>
      <div>
        <h4 {...stylex.props(styles.heading)}>padding=6 → nested padding=2</h4>
        <Section variant="section" width={350} padding={6}>
          <Section variant="muted" padding={2}>
            <p {...stylex.props(styles.text)}>
              Inner section explicitly sets padding=2, overriding the parent's
              padding=6. Content inset is 8px.
            </p>
          </Section>
        </Section>
      </div>
      <div>
        <h4 {...stylex.props(styles.heading)}>
          padding=2 → nested (inherits 2)
        </h4>
        <Section variant="section" width={350} padding={2}>
          <Section variant="muted">
            <p {...stylex.props(styles.text)}>
              Inner section inherits padding=2 from parent. Both edge
              compensation and content inset use 8px.
            </p>
          </Section>
        </Section>
      </div>
    </div>
}`,...o.parameters?.docs?.source}}};const V=["Default","Variants","WithSimpleContent","WithInnerLayout","PageLayout","FullBleed","NestedPaddingInheritance"];export{n as Default,d as FullBleed,o as NestedPaddingInheritance,r as PageLayout,i as Variants,a as WithInnerLayout,s as WithSimpleContent,V as __namedExportsOrder,T as default};
