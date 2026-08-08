import{i as e,s as t}from"./preload-helper-CT_b8DTk.js";import{t as n}from"./react-B7Te67-h.js";import{t as r}from"./jsx-runtime-DqZldVDK.js";import{t as i}from"./Text-kN0lxIEM.js";import{t as a}from"./Button-BekOMzSx.js";import{t as o}from"./Button-Coss17RP.js";import{t as s}from"./Divider-CysgmTtH.js";import{t as c}from"./Divider-BkavF9WX.js";import{t as l}from"./Heading-CRBm-1Kj.js";import{i as u,t as d}from"./Stack-DGkPE1yj.js";import{t as f}from"./Section-DaD-LT27.js";import{t as p}from"./Section-B3u5SF2o.js";import{n as m,t as h}from"./Text-CJp0wfC_.js";import{t as g}from"./CheckboxInput-q2UZmhYO.js";import{t as _}from"./CheckboxInput-BYECMJom.js";import{n as v,t as y}from"./TextInput-BLzGrUAq.js";import{en as b,tn as x}from"./iframe-BIO9-OK6.js";import{Cn as S,t as C}from"./src-2SVhrlJ9.js";var w,T,E,D,O,k,A;e((()=>{w=t(n()),C(),o(),c(),m(),p(),d(),h(),y(),b(),_(),T=r(),E={title:`Lab/BottomSheet`,component:S,tags:[`autodocs`],parameters:{layout:`fullscreen`},decorators:[e=>(0,T.jsx)(`div`,{style:{minHeight:480,padding:32},children:(0,T.jsx)(e,{})})]},D={render:()=>{let[e,t]=(0,w.useState)(!1);return(0,T.jsxs)(T.Fragment,{children:[(0,T.jsx)(a,{label:`Open sheet`,onClick:()=>t(!0)}),(0,T.jsx)(S,{isOpen:e,onOpenChange:t,label:`Filters`,children:(0,T.jsx)(f,{padding:4,children:(0,T.jsxs)(u,{gap:4,children:[(0,T.jsx)(l,{level:3,children:`Filters`}),(0,T.jsx)(s,{}),(0,T.jsxs)(u,{gap:2,children:[(0,T.jsx)(g,{label:`In stock`,value:!1}),(0,T.jsx)(g,{label:`On sale`,value:!1}),(0,T.jsx)(g,{label:`Free shipping`,value:!1})]}),(0,T.jsx)(a,{label:`Apply`,onClick:()=>t(!1)})]})})})]})}},O={render:()=>{let[e,t]=(0,w.useState)(!1);return(0,T.jsxs)(T.Fragment,{children:[(0,T.jsx)(a,{label:`Open nearby places`,onClick:()=>t(!0)}),(0,T.jsx)(S,{isOpen:e,onOpenChange:t,label:`Nearby places`,height:`tall`,children:(0,T.jsx)(f,{padding:4,children:(0,T.jsxs)(u,{gap:3,children:[(0,T.jsx)(i,{type:`supporting`,color:`secondary`,children:`Drag the handle down or press Escape to dismiss.`}),(0,T.jsx)(s,{}),Array.from({length:12},(e,t)=>(0,T.jsxs)(u,{gap:1,children:[(0,T.jsxs)(i,{type:`label`,children:[`Place `,t+1]}),(0,T.jsxs)(i,{type:`supporting`,color:`secondary`,children:[(.2+t*.3).toFixed(1),` mi away`]})]},t))]})})})]})}},k={render:()=>{let[e,t]=(0,w.useState)(!1);return(0,T.jsxs)(T.Fragment,{children:[(0,T.jsx)(a,{label:`Add a comment`,onClick:()=>t(!0)}),(0,T.jsx)(S,{isOpen:e,onOpenChange:t,label:`Add a comment`,height:`auto`,children:(0,T.jsx)(f,{padding:4,children:(0,T.jsxs)(u,{gap:4,children:[(0,T.jsx)(l,{level:3,children:`Add a comment`}),(0,T.jsx)(i,{type:`supporting`,color:`secondary`,children:`The sheet fits its content up to the tall budget.`}),(0,T.jsx)(s,{}),(0,T.jsx)(v,{label:`Title`,value:``}),(0,T.jsx)(x,{label:`Comment`,rows:4,value:``}),(0,T.jsx)(a,{label:`Post`,onClick:()=>t(!1)})]})})})]})}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    return <>
        <Button label="Open sheet" onClick={() => setIsOpen(true)} />
        <BottomSheet isOpen={isOpen} onOpenChange={setIsOpen} label="Filters">
          <Section padding={4}>
            <VStack gap={4}>
              <Heading level={3}>Filters</Heading>
              <Divider />
              <VStack gap={2}>
                <CheckboxInput label="In stock" value={false} />
                <CheckboxInput label="On sale" value={false} />
                <CheckboxInput label="Free shipping" value={false} />
              </VStack>
              <Button label="Apply" onClick={() => setIsOpen(false)} />
            </VStack>
          </Section>
        </BottomSheet>
      </>;
  }
}`,...D.parameters?.docs?.source}}},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    return <>
        <Button label="Open nearby places" onClick={() => setIsOpen(true)} />
        <BottomSheet isOpen={isOpen} onOpenChange={setIsOpen} label="Nearby places" height="tall">
          <Section padding={4}>
            <VStack gap={3}>
              <Text type="supporting" color="secondary">
                Drag the handle down or press Escape to dismiss.
              </Text>
              <Divider />
              {Array.from({
              length: 12
            }, (_, i) => <VStack key={i} gap={1}>
                  <Text type="label">Place {i + 1}</Text>
                  <Text type="supporting" color="secondary">
                    {(0.2 + i * 0.3).toFixed(1)} mi away
                  </Text>
                </VStack>)}
            </VStack>
          </Section>
        </BottomSheet>
      </>;
  }
}`,...O.parameters?.docs?.source}}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    return <>
        <Button label="Add a comment" onClick={() => setIsOpen(true)} />
        <BottomSheet isOpen={isOpen} onOpenChange={setIsOpen} label="Add a comment" height="auto">
          <Section padding={4}>
            <VStack gap={4}>
              <Heading level={3}>Add a comment</Heading>
              <Text type="supporting" color="secondary">
                The sheet fits its content up to the tall budget.
              </Text>
              <Divider />
              <TextInput label="Title" value="" />
              <TextArea label="Comment" rows={4} value="" />
              <Button label="Post" onClick={() => setIsOpen(false)} />
            </VStack>
          </Section>
        </BottomSheet>
      </>;
  }
}`,...k.parameters?.docs?.source}}},A=[`Showcase`,`TallSheet`,`AutoHeight`]}))();export{k as AutoHeight,D as Showcase,O as TallSheet,A as __namedExportsOrder,E as default};