import{a as e,n as t}from"./rolldown-runtime-DaJ6WEGw.js";import{t as n}from"./react-DvlgmmzG.js";import{t as r}from"./Text-Bs-khaxO.js";import{t as i}from"./jsx-runtime-cM__dR4X.js";import{n as a,t as o}from"./VisuallyHidden-DFaEC76O.js";import{t as s}from"./Button-Cx-mMzJ7.js";import{t as c}from"./Button-D1MmXezA.js";import{t as l}from"./Card-CpjcShRF.js";import{t as u}from"./Card-BP3xkOim.js";import{i as d}from"./Stack-mterni5z.js";import{t as f}from"./Section-CtTobO2J.js";import{t as p}from"./Section-C4_UWnoF.js";import{t as m}from"./Layout-BbT8IvUw.js";import{t as h}from"./Text-DRSNMNB3.js";function g(){let[e,t]=(0,_.useState)(0);return(0,v.jsx)(f,{variant:`muted`,children:(0,v.jsx)(l,{children:(0,v.jsxs)(d,{gap:3,align:`start`,children:[(0,v.jsx)(r,{type:`body`,children:`Activating the button updates a polite live region that a screen reader announces.`}),(0,v.jsx)(s,{label:`Add item`,onClick:()=>t(e=>e+1)}),(0,v.jsxs)(r,{type:`body`,color:`secondary`,children:[`Items added: `,e]}),(0,v.jsx)(a,{as:`div`,role:`status`,"aria-live":`polite`,children:e>0?`${e} item${e===1?``:`s`} added`:``})]})})})}var _,v,y,b,x,S,C;t((()=>{_=e(n()),o(),c(),u(),p(),m(),h(),v=i(),y={title:`Core/VisuallyHidden`,component:a,tags:[`autodocs`],argTypes:{children:{control:`text`,description:`Content exposed to assistive technology while hidden`},as:{control:`text`,description:`HTML tag to render as (default 'span')`}}},b={args:{children:`This text is only announced to screen readers`},render:e=>(0,v.jsx)(f,{variant:`muted`,children:(0,v.jsx)(l,{children:(0,v.jsxs)(d,{gap:3,children:[(0,v.jsx)(r,{type:`body`,children:`There is visually-hidden text below this line. Inspect the DOM or use a screen reader to perceive it.`}),(0,v.jsx)(a,{...e}),(0,v.jsx)(r,{type:`body`,color:`secondary`,children:`(nothing visible renders between the two paragraphs)`})]})})})},x={render:()=>(0,v.jsx)(f,{variant:`muted`,children:(0,v.jsx)(l,{children:(0,v.jsxs)(d,{gap:2,align:`start`,children:[(0,v.jsxs)(r,{type:`body`,children:[`Read more`,` `,(0,v.jsxs)(`a`,{href:`https://example.com`,children:[`here`,(0,v.jsx)(a,{children:` about accessibility primitives`})]})]}),(0,v.jsx)(r,{type:`body`,color:`secondary`,children:`The link is announced as “here about accessibility primitives”, so it is not an ambiguous “here” out of context.`})]})})})},S={render:()=>(0,v.jsx)(g,{})},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  args: {
    children: 'This text is only announced to screen readers'
  },
  render: args => <Section variant="muted">
      <Card>
        <VStack gap={3}>
          <Text type="body">
            There is visually-hidden text below this line. Inspect the DOM or
            use a screen reader to perceive it.
          </Text>
          <VisuallyHidden {...args} />
          <Text type="body" color="secondary">
            (nothing visible renders between the two paragraphs)
          </Text>
        </VStack>
      </Card>
    </Section>
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  render: () => <Section variant="muted">
      <Card>
        <VStack gap={2} align="start">
          <Text type="body">
            Read more{' '}
            <a href="https://example.com">
              here
              <VisuallyHidden> about accessibility primitives</VisuallyHidden>
            </a>
          </Text>
          <Text type="body" color="secondary">
            The link is announced as “here about accessibility primitives”, so
            it is not an ambiguous “here” out of context.
          </Text>
        </VStack>
      </Card>
    </Section>
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  render: () => <LiveRegionDemo />
}`,...S.parameters?.docs?.source}}},C=[`Default`,`SupplementaryContext`,`LiveRegion`]}))();export{b as Default,S as LiveRegion,x as SupplementaryContext,C as __namedExportsOrder,y as default};