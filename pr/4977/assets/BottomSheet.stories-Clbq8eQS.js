import{i as e,s as t}from"./preload-helper-CT_b8DTk.js";import{t as n}from"./react-B7Te67-h.js";import{t as r}from"./jsx-runtime-DqZldVDK.js";import{t as i}from"./Text-CXPHibdj.js";import{t as a}from"./Button-BEzcgIb8.js";import{t as o}from"./Button-C1Gx4n65.js";import{t as s}from"./Divider-BSXJe6kc.js";import{t as c}from"./Divider-Gtt93ZFj.js";import{t as l}from"./Heading-CzH7u9IC.js";import{i as u,t as d}from"./Stack-Ci-_UzCu.js";import{t as f}from"./Section-541gJRWL.js";import{t as p}from"./Section-DFB1ncjv.js";import{n as m,t as h}from"./Text-Bto3MvR5.js";import{t as g}from"./CheckboxInput-DtWncvrm.js";import{t as _}from"./CheckboxInput-JEEms5lo.js";import{n as v,t as y}from"./TextInput-OOxsdiSs.js";import{$t as b,en as x}from"./iframe-D-5FxxjK.js";import{Cn as S,t as C}from"./src-Cez9T91V.js";var w,T,E,D,O,k,A,j;e((()=>{w=t(n()),C(),o(),c(),m(),p(),d(),h(),y(),b(),_(),T=r(),E={title:`Lab/BottomSheet`,component:S,tags:[`autodocs`],parameters:{layout:`fullscreen`,docs:{story:{inline:!1,height:`560px`}}},decorators:[e=>(0,T.jsx)(`div`,{style:{minHeight:480,padding:32},children:(0,T.jsx)(e,{})})]},D={render:()=>{let[e,t]=(0,w.useState)(!1);return(0,T.jsxs)(T.Fragment,{children:[(0,T.jsx)(a,{label:`Open sheet`,onClick:()=>t(!0)}),(0,T.jsx)(S,{isOpen:e,onOpenChange:t,label:`Filters`,children:(0,T.jsx)(f,{padding:4,children:(0,T.jsxs)(u,{gap:4,children:[(0,T.jsx)(l,{level:3,children:`Filters`}),(0,T.jsx)(s,{}),(0,T.jsxs)(u,{gap:2,children:[(0,T.jsx)(g,{label:`In stock`,value:!1}),(0,T.jsx)(g,{label:`On sale`,value:!1}),(0,T.jsx)(g,{label:`Free shipping`,value:!1})]}),(0,T.jsx)(a,{label:`Apply`,onClick:()=>t(!1)})]})})})]})}},O={render:()=>{let[e,t]=(0,w.useState)(!1);return(0,T.jsxs)(T.Fragment,{children:[(0,T.jsx)(a,{label:`Open nearby places`,onClick:()=>t(!0)}),(0,T.jsx)(S,{isOpen:e,onOpenChange:t,label:`Nearby places`,height:`tall`,children:(0,T.jsx)(f,{padding:4,children:(0,T.jsxs)(u,{gap:3,children:[(0,T.jsx)(i,{type:`supporting`,color:`secondary`,children:`Drag the handle to resize between snap points; flick down to dismiss or up to expand. Escape also dismisses.`}),(0,T.jsx)(s,{}),Array.from({length:12},(e,t)=>(0,T.jsxs)(u,{gap:1,children:[(0,T.jsxs)(i,{type:`label`,children:[`Place `,t+1]}),(0,T.jsxs)(i,{type:`supporting`,color:`secondary`,children:[(.2+t*.3).toFixed(1),` mi away`]})]},t))]})})})]})}},k={render:()=>{let[e,t]=(0,w.useState)(!1),[n,r]=(0,w.useState)(0);return(0,T.jsxs)(T.Fragment,{children:[(0,T.jsxs)(u,{gap:3,children:[(0,T.jsx)(l,{level:3,children:`Live page behind the overlay`}),(0,T.jsx)(i,{type:`supporting`,color:`secondary`,children:`A scrim is the semi-transparent overlay that covers and blocks the background. This example has no scrim, so the page stays visible and interactive. Open the sheet, then tap the counter below.`}),(0,T.jsx)(a,{label:`Open sheet`,onClick:()=>t(!0)}),(0,T.jsx)(a,{label:`Background clicks: ${n}`,onClick:()=>r(e=>e+1)})]}),(0,T.jsx)(S,{isOpen:e,onOpenChange:t,label:`Nearby places`,hasScrim:!1,height:`capped`,children:(0,T.jsx)(f,{padding:4,children:(0,T.jsxs)(u,{gap:3,children:[(0,T.jsx)(l,{level:3,children:`No scrim`}),(0,T.jsx)(i,{type:`supporting`,color:`secondary`,children:`This is still an overlay, not inline content. The page behind stays live. Drag the handle to resize, flick down to dismiss, or press Escape while focus is here.`}),(0,T.jsx)(s,{}),Array.from({length:8},(e,t)=>(0,T.jsxs)(u,{gap:1,children:[(0,T.jsxs)(i,{type:`label`,children:[`Place `,t+1]}),(0,T.jsxs)(i,{type:`supporting`,color:`secondary`,children:[(.2+t*.3).toFixed(1),` mi away`]})]},t))]})})})]})}},A={render:()=>{let[e,t]=(0,w.useState)(!1);return(0,T.jsxs)(T.Fragment,{children:[(0,T.jsx)(a,{label:`Add a comment`,onClick:()=>t(!0)}),(0,T.jsx)(S,{isOpen:e,onOpenChange:t,label:`Add a comment`,height:`hug`,children:(0,T.jsx)(f,{padding:4,children:(0,T.jsxs)(u,{gap:4,children:[(0,T.jsx)(l,{level:3,children:`Add a comment`}),(0,T.jsx)(i,{type:`supporting`,color:`secondary`,children:`The sheet fits its content, up to 92% of the viewport.`}),(0,T.jsx)(s,{}),(0,T.jsx)(v,{label:`Title`,value:``}),(0,T.jsx)(x,{label:`Comment`,rows:4,value:``}),(0,T.jsx)(a,{label:`Post`,onClick:()=>t(!1)})]})})})]})}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
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
                Drag the handle to resize between snap points; flick down to
                dismiss or up to expand. Escape also dismisses.
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
    const [count, setCount] = useState(0);
    return <>
        {/* A scrim is the semi-transparent layer that covers and blocks the
            background. With hasScrim={false}, this page stays interactive. */}
        <VStack gap={3}>
          <Heading level={3}>Live page behind the overlay</Heading>
          <Text type="supporting" color="secondary">
            A scrim is the semi-transparent overlay that covers and blocks the
            background. This example has no scrim, so the page stays visible and
            interactive. Open the sheet, then tap the counter below.
          </Text>
          <Button label="Open sheet" onClick={() => setIsOpen(true)} />
          <Button label={\`Background clicks: \${count}\`} onClick={() => setCount(c => c + 1)} />
        </VStack>
        <BottomSheet isOpen={isOpen} onOpenChange={setIsOpen} label="Nearby places" hasScrim={false} height="capped">
          <Section padding={4}>
            <VStack gap={3}>
              <Heading level={3}>No scrim</Heading>
              <Text type="supporting" color="secondary">
                This is still an overlay, not inline content. The page behind
                stays live. Drag the handle to resize, flick down to dismiss, or
                press Escape while focus is here.
              </Text>
              <Divider />
              {Array.from({
              length: 8
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
}`,...k.parameters?.docs?.source}}},A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    return <>
        <Button label="Add a comment" onClick={() => setIsOpen(true)} />
        <BottomSheet isOpen={isOpen} onOpenChange={setIsOpen} label="Add a comment" height="hug">
          <Section padding={4}>
            <VStack gap={4}>
              <Heading level={3}>Add a comment</Heading>
              <Text type="supporting" color="secondary">
                The sheet fits its content, up to 92% of the viewport.
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
}`,...A.parameters?.docs?.source}}},j=[`Showcase`,`TallSheet`,`NoScrim`,`HugHeight`]}))();export{A as HugHeight,k as NoScrim,D as Showcase,O as TallSheet,j as __namedExportsOrder,E as default};