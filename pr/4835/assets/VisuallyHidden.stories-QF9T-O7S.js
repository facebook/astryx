import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{t}from"./react-BZJXY1be.js";import{n,t as r}from"./Text-BfjtEFtP.js";import{t as i}from"./jsx-runtime-DeHZSEgm.js";import{n as a,t as o}from"./VisuallyHidden-Z2NjNH-_.js";import{n as s,t as c}from"./Button-BVMvoKVE.js";import{n as l,t as u}from"./Card-270yxekz.js";import{n as d,t as f}from"./VStack-C2SBQ4Fm.js";import{n as p,t as m}from"./Section-BQJsZyZZ.js";function h(){let[e,t]=(0,g.useState)(0);return(0,_.jsx)(m,{variant:`muted`,children:(0,_.jsx)(u,{children:(0,_.jsxs)(f,{gap:3,align:`start`,children:[(0,_.jsx)(r,{type:`body`,children:`Activating the button updates a polite live region that a screen reader announces.`}),(0,_.jsx)(c,{label:`Add item`,onClick:()=>t(e=>e+1)}),(0,_.jsxs)(r,{type:`body`,color:`secondary`,children:[`Items added: `,e]}),(0,_.jsx)(o,{as:`div`,role:`status`,"aria-live":`polite`,children:e>0?`${e} item${e===1?``:`s`} added`:``})]})})})}var g,_,v,y,b,x,S;function C(){return(C=e((()=>{g=t(),a(),s(),l(),p(),d(),n(),_=i(),v={title:`Core/VisuallyHidden`,component:o,tags:[`autodocs`],argTypes:{children:{control:`text`,description:`Content exposed to assistive technology while hidden`},as:{control:`text`,description:`HTML tag to render as (default 'span')`}}},y={args:{children:`This text is only announced to screen readers`},render:e=>(0,_.jsx)(m,{variant:`muted`,children:(0,_.jsx)(u,{children:(0,_.jsxs)(f,{gap:3,children:[(0,_.jsx)(r,{type:`body`,children:`There is visually-hidden text below this line. Inspect the DOM or use a screen reader to perceive it.`}),(0,_.jsx)(o,{...e}),(0,_.jsx)(r,{type:`body`,color:`secondary`,children:`(nothing visible renders between the two paragraphs)`})]})})})},b={render:()=>(0,_.jsx)(m,{variant:`muted`,children:(0,_.jsx)(u,{children:(0,_.jsxs)(f,{gap:2,align:`start`,children:[(0,_.jsxs)(r,{type:`body`,children:[`Read more`,` `,(0,_.jsxs)(`a`,{href:`https://example.com`,children:[`here`,(0,_.jsx)(o,{children:` about accessibility primitives`})]})]}),(0,_.jsx)(r,{type:`body`,color:`secondary`,children:`The link is announced as “here about accessibility primitives”, so it is not an ambiguous “here” out of context.`})]})})})},x={render:()=>(0,_.jsx)(h,{})},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
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
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
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
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  render: () => <LiveRegionDemo />
}`,...x.parameters?.docs?.source}}},S=[`Default`,`SupplementaryContext`,`LiveRegion`]})))()}C();export{y as Default,x as LiveRegion,b as SupplementaryContext,S as __namedExportsOrder,v as default};