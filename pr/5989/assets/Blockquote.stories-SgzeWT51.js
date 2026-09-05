import{i as e}from"./preload-helper-CT_b8DTk.js";import{t}from"./jsx-runtime-DqZldVDK.js";import{t as n}from"./Text-DMtDzWEr.js";import{t as r}from"./Blockquote-Dj4fkifn.js";import{t as i}from"./Card-CfddYM2H.js";import{t as a}from"./Card-BFxYaBy-.js";import{i as o}from"./Stack-gYw3q0AJ.js";import{t as s}from"./Section-CLfQg8jA.js";import{t as c}from"./Section-By5vXnUO.js";import{t as l}from"./Layout-B-clvzmX.js";import{t as u}from"./Text-CCXWcsyF.js";import{Ai as d}from"./iframe-DgRPfpsc.js";var f,p,m,h,g,_,v,y,b,x,S,C;e((()=>{d(),a(),c(),l(),u(),f=t(),p={pullQuote:{kGuDYH:`x18juvz8`,kLWn49:`xf74fhv`,kqGvvJ:`xfo4z36`,keoZOQ:null,k1K539:null,$$css:!0},narrow:{ks0D6T:`x1jkqq1h`,$$css:!0}},m={title:`Core/Blockquote`,component:r,tags:[`autodocs`],argTypes:{cite:{control:`text`,description:`Optional attribution for the quote`}}},h={args:{children:`Design is not just what it looks like and feels like. Design is how it works.`},render:e=>(0,f.jsx)(s,{variant:`muted`,children:(0,f.jsx)(i,{children:(0,f.jsx)(r,{...e})})})},g={render:()=>(0,f.jsx)(s,{variant:`muted`,children:(0,f.jsx)(i,{children:(0,f.jsx)(r,{cite:`Steve Jobs`,children:`Design is not just what it looks like and feels like. Design is how it works.`})})})},_={render:()=>(0,f.jsx)(s,{variant:`muted`,children:(0,f.jsx)(i,{children:(0,f.jsxs)(o,{gap:3,children:[(0,f.jsx)(n,{type:`body`,children:`In a 2003 interview, the importance of design thinking was emphasized:`}),(0,f.jsx)(r,{cite:`Steve Jobs`,children:`Design is not just what it looks like and feels like. Design is how it works.`}),(0,f.jsx)(n,{type:`body`,children:`This philosophy has guided product development for decades.`})]})})})},v={render:()=>(0,f.jsx)(s,{variant:`muted`,children:(0,f.jsx)(i,{children:(0,f.jsxs)(r,{children:[(0,f.jsx)(n,{type:`body`,children:`The best way to predict the future is to invent it.`}),(0,f.jsx)(n,{type:`supporting`,children:`From a talk at PARC in 1971.`})]})})})},y={render:()=>(0,f.jsx)(s,{variant:`muted`,children:(0,f.jsx)(i,{children:(0,f.jsx)(r,{cite:`Alan Kay`,children:(0,f.jsxs)(o,{gap:2,children:[(0,f.jsx)(n,{type:`body`,children:`The best way to predict the future is to invent it.`}),(0,f.jsx)(n,{type:`body`,children:`People who are really serious about software should make their own hardware.`})]})})})})},b={render:()=>(0,f.jsx)(s,{variant:`muted`,children:(0,f.jsx)(i,{children:(0,f.jsxs)(o,{gap:3,children:[(0,f.jsx)(n,{type:`body`,children:`xstyle carries layout and type overrides onto the blockquote itself, with no wrapper element.`}),(0,f.jsx)(r,{cite:`Alan Kay`,xstyle:p.pullQuote,children:`The best way to predict the future is to invent it.`})]})})})},x={render:()=>(0,f.jsx)(s,{variant:`muted`,children:(0,f.jsx)(i,{children:(0,f.jsxs)(o,{gap:3,children:[(0,f.jsx)(r,{cite:`A source with a notably long attribution line that has to wrap`,children:`A long quotation that runs past a single line, so the rule on the inline-start edge and the wrapped text stay aligned all the way down. Long attributions wrap the same way underneath.`}),(0,f.jsx)(r,{children:`An unbroken token such as https://www.example.com/research/2026/design-systems/the-very-long-report-slug/appendix wraps instead of overflowing.`})]})})})},S={render:()=>(0,f.jsx)(s,{variant:`muted`,children:(0,f.jsx)(i,{xstyle:p.narrow,children:(0,f.jsx)(r,{cite:`Steve Jobs`,children:`Design is not just what it looks like and feels like. Design is how it works.`})})})},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    children: 'Design is not just what it looks like and feels like. Design is how it works.'
  },
  render: args => <Section variant="muted">
      <Card>
        <Blockquote {...args} />
      </Card>
    </Section>
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  render: () => <Section variant="muted">
      <Card>
        <Blockquote cite="Steve Jobs">
          Design is not just what it looks like and feels like. Design is how it
          works.
        </Blockquote>
      </Card>
    </Section>
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
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
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
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
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
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
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  render: () => <Section variant="muted">
      <Card>
        <VStack gap={3}>
          <Text type="body">
            xstyle carries layout and type overrides onto the blockquote itself,
            with no wrapper element.
          </Text>
          <Blockquote cite="Alan Kay" xstyle={styles.pullQuote}>
            The best way to predict the future is to invent it.
          </Blockquote>
        </VStack>
      </Card>
    </Section>
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  render: () => <Section variant="muted">
      <Card>
        <VStack gap={3}>
          <Blockquote cite="A source with a notably long attribution line that has to wrap">
            A long quotation that runs past a single line, so the rule on the
            inline-start edge and the wrapped text stay aligned all the way
            down. Long attributions wrap the same way underneath.
          </Blockquote>
          <Blockquote>
            An unbroken token such as
            https://www.example.com/research/2026/design-systems/the-very-long-report-slug/appendix
            wraps instead of overflowing.
          </Blockquote>
        </VStack>
      </Card>
    </Section>
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  render: () => <Section variant="muted">
      <Card xstyle={styles.narrow}>
        <Blockquote cite="Steve Jobs">
          Design is not just what it looks like and feels like. Design is how it
          works.
        </Blockquote>
      </Card>
    </Section>
}`,...S.parameters?.docs?.source}}},C=[`Default`,`WithCitation`,`InContent`,`NestedContent`,`MultipleParagraphs`,`PullQuoteWithXstyle`,`LongContent`,`NarrowContainer`]}))();export{h as Default,_ as InContent,x as LongContent,y as MultipleParagraphs,S as NarrowContainer,v as NestedContent,b as PullQuoteWithXstyle,g as WithCitation,C as __namedExportsOrder,m as default};