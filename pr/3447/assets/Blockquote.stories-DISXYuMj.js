import{a1 as e,T as t}from"./iframe-j1EZkcGb.js";import{B as r}from"./Blockquote-2lTCwDW7.js";import{C as n}from"./Card-BriUgwcN.js";import{S as o}from"./Section-DLuGvs6u.js";import{V as l}from"./VStack-Bq5RLdGQ.js";import"./preload-helper-Ct5FWWRu.js";import"./container.stylex-uilBL6DE.js";import"./padding.stylex-Dl2_Pyt1.js";import"./Stack-DWPtcxDC.js";import"./stack.stylex-BlarxY2N.js";const f={title:"Core/Blockquote",component:r,tags:["autodocs"],argTypes:{cite:{control:"text",description:"Optional attribution for the quote"}}},s={args:{children:"Design is not just what it looks like and feels like. Design is how it works."},render:p=>e.jsx(o,{variant:"muted",children:e.jsx(n,{children:e.jsx(r,{...p})})})},i={render:()=>e.jsx(o,{variant:"muted",children:e.jsx(n,{children:e.jsx(r,{cite:"Steve Jobs",children:"Design is not just what it looks like and feels like. Design is how it works."})})})},a={render:()=>e.jsx(o,{variant:"muted",children:e.jsx(n,{children:e.jsxs(l,{gap:3,children:[e.jsx(t,{type:"body",children:"In a 2003 interview, the importance of design thinking was emphasized:"}),e.jsx(r,{cite:"Steve Jobs",children:"Design is not just what it looks like and feels like. Design is how it works."}),e.jsx(t,{type:"body",children:"This philosophy has guided product development for decades."})]})})})},d={render:()=>e.jsx(o,{variant:"muted",children:e.jsx(n,{children:e.jsxs(r,{children:[e.jsx(t,{type:"body",children:"The best way to predict the future is to invent it."}),e.jsx(t,{type:"supporting",children:"From a talk at PARC in 1971."})]})})})},c={render:()=>e.jsx(o,{variant:"muted",children:e.jsx(n,{children:e.jsx(r,{cite:"Alan Kay",children:e.jsxs(l,{gap:2,children:[e.jsx(t,{type:"body",children:"The best way to predict the future is to invent it."}),e.jsx(t,{type:"body",children:"People who are really serious about software should make their own hardware."})]})})})})};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    children: 'Design is not just what it looks like and feels like. Design is how it works.'
  },
  render: args => <Section variant="muted">
      <Card>
        <Blockquote {...args} />
      </Card>
    </Section>
}`,...s.parameters?.docs?.source}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  render: () => <Section variant="muted">
      <Card>
        <Blockquote cite="Steve Jobs">
          Design is not just what it looks like and feels like. Design is how it
          works.
        </Blockquote>
      </Card>
    </Section>
}`,...i.parameters?.docs?.source}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  render: () => <Section variant="muted">
      <Card>
        <VStack gap={3}>
          <Text type="body">
            In a 2003 interview, the importance of design thinking was
            emphasized:
          </Text>
          <Blockquote cite="Steve Jobs">
            Design is not just what it looks like and feels like. Design is how
            it works.
          </Blockquote>
          <Text type="body">
            This philosophy has guided product development for decades.
          </Text>
        </VStack>
      </Card>
    </Section>
}`,...a.parameters?.docs?.source}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  render: () => <Section variant="muted">
      <Card>
        <Blockquote>
          <Text type="body">
            The best way to predict the future is to invent it.
          </Text>
          <Text type="supporting">From a talk at PARC in 1971.</Text>
        </Blockquote>
      </Card>
    </Section>
}`,...d.parameters?.docs?.source}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  render: () => <Section variant="muted">
      <Card>
        <Blockquote cite="Alan Kay">
          <VStack gap={2}>
            <Text type="body">
              The best way to predict the future is to invent it.
            </Text>
            <Text type="body">
              People who are really serious about software should make their own
              hardware.
            </Text>
          </VStack>
        </Blockquote>
      </Card>
    </Section>
}`,...c.parameters?.docs?.source}}};const v=["Default","WithCitation","InContent","NestedContent","MultipleParagraphs"];export{s as Default,a as InContent,c as MultipleParagraphs,d as NestedContent,i as WithCitation,v as __namedExportsOrder,f as default};
