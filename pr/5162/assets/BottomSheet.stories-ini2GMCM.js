import{i as e,s as t}from"./preload-helper-CT_b8DTk.js";import{t as n}from"./react-B7Te67-h.js";import{t as r}from"./jsx-runtime-DqZldVDK.js";import{t as i}from"./Text-BGODV0Ha.js";import{t as a}from"./Button-CYrM_CoV.js";import{t as o}from"./Button-LeK2qSTv.js";import{t as s}from"./Divider-DlX8ua7y.js";import{t as c}from"./Divider-iVyxiz2F.js";import{t as l}from"./Heading-XSc1FRnK.js";import{i as u,t as d}from"./Stack-hK_OIu5j.js";import{t as f}from"./Section-Dwqkm0Sr.js";import{t as p}from"./Section-CaRxuKAa.js";import{n as m,t as h}from"./Text-CYOhIBXt.js";import{t as g}from"./CheckboxInput-YaiZ96Rz.js";import{t as _}from"./CheckboxInput-CcpJ-LNi.js";import{n as v,t as y}from"./TextInput-BdfcNU8j.js";import{$t as b,Ai as x,Ni as S,en as C}from"./iframe-CTUm6Tl2.js";function w({onPost:e}){let[t,n]=(0,T.useState)({title:``,author:``,email:``,team:``,project:``,relatedTask:``,summary:``,context:``,changes:``,followUp:``,comment:``}),r=e=>t=>n(n=>({...n,[e]:t}));return(0,E.jsxs)(u,{gap:4,children:[(0,E.jsx)(l,{level:3,children:`Add a comment`}),(0,E.jsx)(i,{type:`supporting`,color:`secondary`,children:`Keep the Tall sheet fully expanded, then focus fields near the beginning, middle, and end. The outer sheet remains stationary while its body scrolls each control above the mobile keyboard. Keyboard accommodation is not provided at shorter snap points.`}),(0,E.jsx)(i,{type:`supporting`,color:`secondary`,children:`Move the sheet with its handle or close it with Post comment to verify that sheet travel and closing dismiss the keyboard.`}),(0,E.jsx)(s,{}),(0,E.jsx)(v,{label:`Title`,value:t.title,onChange:r(`title`)}),(0,E.jsx)(v,{label:`Author`,value:t.author,onChange:r(`author`)}),(0,E.jsx)(v,{label:`Email`,type:`email`,value:t.email,onChange:r(`email`)}),(0,E.jsx)(v,{label:`Team`,value:t.team,onChange:r(`team`)}),(0,E.jsx)(v,{label:`Project`,value:t.project,onChange:r(`project`)}),(0,E.jsx)(v,{label:`Related task`,value:t.relatedTask,onChange:r(`relatedTask`)}),(0,E.jsx)(C,{label:`Summary`,rows:4,value:t.summary,onChange:r(`summary`)}),(0,E.jsx)(C,{label:`Context`,rows:6,value:t.context,onChange:r(`context`)}),(0,E.jsx)(C,{label:`What changed?`,rows:4,value:t.changes,onChange:r(`changes`)}),(0,E.jsx)(C,{label:`Suggested follow-up`,rows:4,value:t.followUp,onChange:r(`followUp`)}),(0,E.jsx)(C,{label:`Comment`,rows:8,value:t.comment,onChange:r(`comment`)}),(0,E.jsx)(a,{label:`Post comment`,onClick:e})]})}var T,E,D,O,k,A,j,M,N,P,F,I;e((()=>{T=t(n()),x(),o(),c(),m(),p(),d(),h(),y(),b(),_(),E=r(),D={title:`Core/BottomSheet`,component:S,tags:[`autodocs`],parameters:{layout:`fullscreen`,docs:{story:{inline:!1,height:`560px`}}},decorators:[e=>(0,E.jsx)(`div`,{style:{minHeight:480,padding:32},children:(0,E.jsx)(e,{})})]},O={render:()=>{let[e,t]=(0,T.useState)(!1);return(0,E.jsxs)(E.Fragment,{children:[(0,E.jsx)(a,{label:`Open sheet`,onClick:()=>t(!0)}),(0,E.jsx)(S,{isOpen:e,onOpenChange:t,label:`Filters`,children:(0,E.jsx)(f,{padding:4,children:(0,E.jsxs)(u,{gap:4,children:[(0,E.jsx)(l,{level:3,children:`Filters`}),(0,E.jsx)(s,{}),(0,E.jsxs)(u,{gap:2,children:[(0,E.jsx)(g,{label:`In stock`,value:!1}),(0,E.jsx)(g,{label:`On sale`,value:!1}),(0,E.jsx)(g,{label:`Free shipping`,value:!1})]}),(0,E.jsx)(a,{label:`Apply`,onClick:()=>t(!1)})]})})})]})}},k={name:`Form purpose`,render:()=>{let[e,t]=(0,T.useState)(!1);return(0,E.jsxs)(E.Fragment,{children:[(0,E.jsx)(a,{label:`Edit profile`,onClick:()=>t(!0)}),(0,E.jsx)(S,{isOpen:e,onOpenChange:t,purpose:`form`,label:`Edit profile`,height:`hug`,children:(0,E.jsx)(f,{padding:4,children:(0,E.jsxs)(u,{gap:4,children:[(0,E.jsx)(l,{level:3,children:`Edit profile`}),(0,E.jsx)(i,{type:`supporting`,color:`secondary`,children:`Swiping down or clicking the scrim keeps this form open. Escape and the explicit actions can still close it.`}),(0,E.jsx)(a,{label:`Save changes`,onClick:()=>t(!1)})]})})})]})}},A={render:()=>{let[e,t]=(0,T.useState)(!1);return(0,E.jsxs)(E.Fragment,{children:[(0,E.jsx)(a,{label:`Open nearby places`,onClick:()=>t(!0)}),(0,E.jsx)(S,{isOpen:e,onOpenChange:t,label:`Nearby places`,height:`tall`,children:(0,E.jsx)(f,{padding:4,children:(0,E.jsxs)(u,{gap:3,children:[(0,E.jsx)(i,{type:`supporting`,color:`secondary`,children:`Drag the handle to resize between snap points; flick down to dismiss or up to expand. Escape also dismisses.`}),(0,E.jsx)(s,{}),Array.from({length:12},(e,t)=>(0,E.jsxs)(u,{gap:1,children:[(0,E.jsxs)(i,{type:`label`,children:[`Place `,t+1]}),(0,E.jsxs)(i,{type:`supporting`,color:`secondary`,children:[(.2+t*.3).toFixed(1),` mi away`]})]},t))]})})})]})}},j={render:()=>{let[e,t]=(0,T.useState)(!1),[n,r]=(0,T.useState)(0);return(0,E.jsxs)(E.Fragment,{children:[(0,E.jsxs)(u,{gap:3,children:[(0,E.jsx)(l,{level:3,children:`Live page behind the overlay`}),(0,E.jsx)(i,{type:`supporting`,color:`secondary`,children:`A scrim is the semi-transparent overlay that covers and blocks the background. This example has no scrim, so the page stays visible and interactive. Open the sheet, then tap the counter below.`}),(0,E.jsx)(a,{label:`Open sheet`,onClick:()=>t(!0)}),(0,E.jsx)(a,{label:`Background clicks: ${n}`,onClick:()=>r(e=>e+1)})]}),(0,E.jsx)(S,{isOpen:e,onOpenChange:t,label:`Nearby places`,hasScrim:!1,height:`capped`,children:(0,E.jsx)(f,{padding:4,children:(0,E.jsxs)(u,{gap:3,children:[(0,E.jsx)(l,{level:3,children:`No scrim`}),(0,E.jsx)(i,{type:`supporting`,color:`secondary`,children:`This is still an overlay, not inline content. The page behind stays live. Drag the handle to resize, flick down to dismiss, or press Escape while focus is here.`}),(0,E.jsx)(s,{}),Array.from({length:8},(e,t)=>(0,E.jsxs)(u,{gap:1,children:[(0,E.jsxs)(i,{type:`label`,children:[`Place `,t+1]}),(0,E.jsxs)(i,{type:`supporting`,color:`secondary`,children:[(.2+t*.3).toFixed(1),` mi away`]})]},t))]})})})]})}},M={render:()=>{let[e,t]=(0,T.useState)(!1);return(0,E.jsxs)(E.Fragment,{children:[(0,E.jsx)(a,{label:`Share page`,onClick:()=>t(!0)}),(0,E.jsx)(S,{isOpen:e,onOpenChange:t,label:`Share page`,height:`hug`,children:(0,E.jsx)(f,{padding:4,children:(0,E.jsxs)(u,{gap:4,children:[(0,E.jsx)(l,{level:3,children:`Share page`}),(0,E.jsx)(i,{type:`supporting`,color:`secondary`,children:`The sheet fits its content, up to 92% of the viewport.`}),(0,E.jsx)(s,{}),(0,E.jsx)(a,{label:`Copy link`}),(0,E.jsx)(a,{label:`Send in Messenger`}),(0,E.jsx)(a,{label:`Save for later`}),(0,E.jsx)(a,{label:`Done`,onClick:()=>t(!1)})]})})})]})}},N={name:`Hug height — Long content`,render:()=>{let[e,t]=(0,T.useState)(!1);return(0,E.jsxs)(E.Fragment,{children:[(0,E.jsx)(a,{label:`View release notes`,onClick:()=>t(!0)}),(0,E.jsx)(S,{isOpen:e,onOpenChange:t,label:`Release notes`,height:`hug`,children:(0,E.jsx)(f,{padding:4,children:(0,E.jsxs)(u,{gap:4,children:[(0,E.jsx)(l,{level:3,children:`Release notes`}),(0,E.jsx)(i,{type:`supporting`,color:`secondary`,children:`The sheet hugs its content until it reaches 92% of the viewport, then the content scrolls within the sheet. Drag it to a snap point and the scrolling area resizes to the height you can actually see — except at the shortest peek, which slides below the viewport at full height rather than reflowing to a sliver.`}),(0,E.jsx)(s,{}),Array.from({length:12},(e,t)=>(0,E.jsxs)(u,{gap:1,children:[(0,E.jsxs)(i,{type:`label`,children:[`Update `,t+1]}),(0,E.jsx)(i,{type:`supporting`,color:`secondary`,children:`A summary of the improvements, fixes, and other changes in this update.`})]},t)),(0,E.jsx)(a,{label:`Done`,onClick:()=>t(!1)})]})})})]})}},P={name:`Capped height — Long content`,render:()=>{let[e,t]=(0,T.useState)(!1);return(0,E.jsxs)(E.Fragment,{children:[(0,E.jsx)(a,{label:`View saved places`,onClick:()=>t(!0)}),(0,E.jsx)(S,{isOpen:e,onOpenChange:t,label:`Saved places`,height:`capped`,children:(0,E.jsx)(f,{padding:4,children:(0,E.jsxs)(u,{gap:4,children:[(0,E.jsx)(l,{level:3,children:`Saved places`}),(0,E.jsx)(i,{type:`supporting`,color:`secondary`,children:`The sheet opens at a capped height while the long list scrolls within it.`}),(0,E.jsx)(s,{}),Array.from({length:12},(e,t)=>(0,E.jsxs)(u,{gap:1,children:[(0,E.jsxs)(i,{type:`label`,children:[`Saved place `,t+1]}),(0,E.jsx)(i,{type:`supporting`,color:`secondary`,children:`Notes and details about this saved place.`})]},t)),(0,E.jsx)(a,{label:`Done`,onClick:()=>t(!1)})]})})})]})}},F={name:`Mobile keyboard`,render:()=>{let[e,t]=(0,T.useState)(!1);return(0,E.jsxs)(E.Fragment,{children:[(0,E.jsx)(a,{label:`Add a comment`,onClick:()=>t(!0)}),(0,E.jsx)(S,{isOpen:e,onOpenChange:t,label:`Add a comment`,height:`tall`,children:(0,E.jsx)(f,{padding:4,children:(0,E.jsx)(w,{onPost:()=>t(!1)})})})]})}},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
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
}`,...O.parameters?.docs?.source}}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  name: 'Form purpose',
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    return <>
        <Button label="Edit profile" onClick={() => setIsOpen(true)} />
        <BottomSheet isOpen={isOpen} onOpenChange={setIsOpen} purpose="form" label="Edit profile" height="hug">
          <Section padding={4}>
            <VStack gap={4}>
              <Heading level={3}>Edit profile</Heading>
              <Text type="supporting" color="secondary">
                Swiping down or clicking the scrim keeps this form open. Escape
                and the explicit actions can still close it.
              </Text>
              <Button label="Save changes" onClick={() => setIsOpen(false)} />
            </VStack>
          </Section>
        </BottomSheet>
      </>;
  }
}`,...k.parameters?.docs?.source}}},A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
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
}`,...A.parameters?.docs?.source}}},j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
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
}`,...j.parameters?.docs?.source}}},M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    return <>
        <Button label="Share page" onClick={() => setIsOpen(true)} />
        <BottomSheet isOpen={isOpen} onOpenChange={setIsOpen} label="Share page" height="hug">
          <Section padding={4}>
            <VStack gap={4}>
              <Heading level={3}>Share page</Heading>
              <Text type="supporting" color="secondary">
                The sheet fits its content, up to 92% of the viewport.
              </Text>
              <Divider />
              <Button label="Copy link" />
              <Button label="Send in Messenger" />
              <Button label="Save for later" />
              <Button label="Done" onClick={() => setIsOpen(false)} />
            </VStack>
          </Section>
        </BottomSheet>
      </>;
  }
}`,...M.parameters?.docs?.source}}},N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
  name: 'Hug height — Long content',
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    return <>
        <Button label="View release notes" onClick={() => setIsOpen(true)} />
        <BottomSheet isOpen={isOpen} onOpenChange={setIsOpen} label="Release notes" height="hug">
          <Section padding={4}>
            <VStack gap={4}>
              <Heading level={3}>Release notes</Heading>
              <Text type="supporting" color="secondary">
                The sheet hugs its content until it reaches 92% of the viewport,
                then the content scrolls within the sheet. Drag it to a snap
                point and the scrolling area resizes to the height you can
                actually see — except at the shortest peek, which slides below
                the viewport at full height rather than reflowing to a sliver.
              </Text>
              <Divider />
              {Array.from({
              length: 12
            }, (_, i) => <VStack key={i} gap={1}>
                  <Text type="label">Update {i + 1}</Text>
                  <Text type="supporting" color="secondary">
                    A summary of the improvements, fixes, and other changes in
                    this update.
                  </Text>
                </VStack>)}
              <Button label="Done" onClick={() => setIsOpen(false)} />
            </VStack>
          </Section>
        </BottomSheet>
      </>;
  }
}`,...N.parameters?.docs?.source}}},P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
  name: 'Capped height — Long content',
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    return <>
        <Button label="View saved places" onClick={() => setIsOpen(true)} />
        <BottomSheet isOpen={isOpen} onOpenChange={setIsOpen} label="Saved places" height="capped">
          <Section padding={4}>
            <VStack gap={4}>
              <Heading level={3}>Saved places</Heading>
              <Text type="supporting" color="secondary">
                The sheet opens at a capped height while the long list scrolls
                within it.
              </Text>
              <Divider />
              {Array.from({
              length: 12
            }, (_, i) => <VStack key={i} gap={1}>
                  <Text type="label">Saved place {i + 1}</Text>
                  <Text type="supporting" color="secondary">
                    Notes and details about this saved place.
                  </Text>
                </VStack>)}
              <Button label="Done" onClick={() => setIsOpen(false)} />
            </VStack>
          </Section>
        </BottomSheet>
      </>;
  }
}`,...P.parameters?.docs?.source}}},F.parameters={...F.parameters,docs:{...F.parameters?.docs,source:{originalSource:`{
  name: 'Mobile keyboard',
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    return <>
        <Button label="Add a comment" onClick={() => setIsOpen(true)} />
        <BottomSheet isOpen={isOpen} onOpenChange={setIsOpen} label="Add a comment" height="tall">
          <Section padding={4}>
            <MobileKeyboardCommentForm onPost={() => setIsOpen(false)} />
          </Section>
        </BottomSheet>
      </>;
  }
}`,...F.parameters?.docs?.source}}},I=[`Showcase`,`FormPurpose`,`TallSheet`,`NoScrim`,`HugHeight`,`HugHeightWithLongContent`,`CappedHeightWithLongContent`,`MobileKeyboard`]}))();export{P as CappedHeightWithLongContent,k as FormPurpose,M as HugHeight,N as HugHeightWithLongContent,F as MobileKeyboard,j as NoScrim,O as Showcase,A as TallSheet,I as __namedExportsOrder,D as default};