import{i as e,s as t}from"./preload-helper-CT_b8DTk.js";import{t as n}from"./react-B7Te67-h.js";import{t as r}from"./jsx-runtime-DqZldVDK.js";import{t as i}from"./Text-BQWwoR0k.js";import{t as a}from"./Button-BulbyWy_.js";import{t as o}from"./Button-BDxVRDnZ.js";import{i as s,t as c}from"./BottomSheet-E5iatB_h.js";import{t as l}from"./Divider-HLmwP2EW.js";import{t as u}from"./Divider-CDNW8iSX.js";import{t as d}from"./Heading-CLBX4sU-.js";import{i as f,t as p}from"./Stack-CWWb5z4e.js";import{t as m}from"./Section-COiwN-KT.js";import{t as h}from"./Section-BVEFTEmx.js";import{n as g,t as _}from"./Text-DmX1gEXb.js";import{t as v}from"./CheckboxInput-BouFmNSU.js";import{t as y}from"./CheckboxInput-LM5YkTfI.js";import{n as b,t as x}from"./TextInput-CA0Pc0on.js";import{$t as S,Qt as C}from"./iframe-C3UrVRtA.js";function w({onPost:e}){let[t,n]=(0,T.useState)({title:``,author:``,email:``,team:``,project:``,relatedTask:``,summary:``,context:``,changes:``,followUp:``,comment:``}),r=e=>t=>n(n=>({...n,[e]:t}));return(0,E.jsxs)(f,{gap:4,children:[(0,E.jsx)(d,{level:3,children:`Add a comment`}),(0,E.jsx)(i,{type:`supporting`,color:`secondary`,children:`Keep the Tall sheet fully expanded, then focus fields near the beginning, middle, and end. The outer sheet remains stationary while its body scrolls each control above the mobile keyboard. Drag it down to the half-height stop and the accommodation stops — only a fully expanded Tall sheet provides it — then drag back up and it resumes.`}),(0,E.jsx)(i,{type:`supporting`,color:`secondary`,children:`Move the sheet with its handle or close it with Post comment to verify that sheet travel and closing dismiss the keyboard.`}),(0,E.jsx)(l,{}),(0,E.jsx)(b,{label:`Title`,value:t.title,onChange:r(`title`)}),(0,E.jsx)(b,{label:`Author`,value:t.author,onChange:r(`author`)}),(0,E.jsx)(b,{label:`Email`,type:`email`,value:t.email,onChange:r(`email`)}),(0,E.jsx)(b,{label:`Team`,value:t.team,onChange:r(`team`)}),(0,E.jsx)(b,{label:`Project`,value:t.project,onChange:r(`project`)}),(0,E.jsx)(b,{label:`Related task`,value:t.relatedTask,onChange:r(`relatedTask`)}),(0,E.jsx)(S,{label:`Summary`,rows:4,value:t.summary,onChange:r(`summary`)}),(0,E.jsx)(S,{label:`Context`,rows:6,value:t.context,onChange:r(`context`)}),(0,E.jsx)(S,{label:`What changed?`,rows:4,value:t.changes,onChange:r(`changes`)}),(0,E.jsx)(S,{label:`Suggested follow-up`,rows:4,value:t.followUp,onChange:r(`followUp`)}),(0,E.jsx)(S,{label:`Comment`,rows:8,value:t.comment,onChange:r(`comment`)}),(0,E.jsx)(a,{label:`Post comment`,onClick:e})]})}var T,E,D,O,k,A,j,M,N,P,F,I,L,R;e((()=>{T=t(n()),c(),o(),u(),g(),h(),p(),_(),x(),C(),y(),E=r(),D={title:`Core/BottomSheet`,component:s,tags:[`autodocs`],parameters:{layout:`fullscreen`,docs:{story:{inline:!1,height:`560px`}}},decorators:[e=>(0,E.jsx)(`div`,{style:{minHeight:480,padding:32},children:(0,E.jsx)(e,{})})]},O={render:()=>{let[e,t]=(0,T.useState)(!1);return(0,E.jsxs)(E.Fragment,{children:[(0,E.jsx)(a,{label:`Open sheet`,onClick:()=>t(!0)}),(0,E.jsx)(s,{isOpen:e,onOpenChange:t,label:`Filters`,children:(0,E.jsx)(m,{padding:4,children:(0,E.jsxs)(f,{gap:4,children:[(0,E.jsx)(d,{level:3,children:`Filters`}),(0,E.jsx)(l,{}),(0,E.jsxs)(f,{gap:2,children:[(0,E.jsx)(v,{label:`In stock`,value:!1}),(0,E.jsx)(v,{label:`On sale`,value:!1}),(0,E.jsx)(v,{label:`Free shipping`,value:!1})]}),(0,E.jsx)(a,{label:`Apply`,onClick:()=>t(!1)})]})})})]})}},k={name:`Form purpose`,render:()=>{let[e,t]=(0,T.useState)(!1);return(0,E.jsxs)(E.Fragment,{children:[(0,E.jsx)(a,{label:`Edit profile`,onClick:()=>t(!0)}),(0,E.jsx)(s,{isOpen:e,onOpenChange:t,purpose:`form`,label:`Edit profile`,height:`hug`,children:(0,E.jsx)(m,{padding:4,children:(0,E.jsxs)(f,{gap:4,children:[(0,E.jsx)(d,{level:3,children:`Edit profile`}),(0,E.jsx)(i,{type:`supporting`,color:`secondary`,children:`Swiping down or clicking the scrim keeps this form open. Escape and the explicit actions can still close it.`}),(0,E.jsx)(a,{label:`Save changes`,onClick:()=>t(!1)})]})})})]})}},A={render:()=>{let[e,t]=(0,T.useState)(!1);return(0,E.jsxs)(E.Fragment,{children:[(0,E.jsx)(a,{label:`Open nearby places`,onClick:()=>t(!0)}),(0,E.jsx)(s,{isOpen:e,onOpenChange:t,label:`Nearby places`,height:`tall`,children:(0,E.jsx)(m,{padding:4,children:(0,E.jsxs)(f,{gap:3,children:[(0,E.jsx)(i,{type:`supporting`,color:`secondary`,children:`A Tall sheet fills most of the viewport and scrolls its content. It has no snap points, so a drag springs back; flick down to dismiss. Escape also dismisses.`}),(0,E.jsx)(l,{}),Array.from({length:12},(e,t)=>(0,E.jsxs)(f,{gap:1,children:[(0,E.jsxs)(i,{type:`label`,children:[`Place `,t+1]}),(0,E.jsxs)(i,{type:`supporting`,color:`secondary`,children:[(.2+t*.3).toFixed(1),` mi away`]})]},t))]})})})]})}},j={render:()=>{let[e,t]=(0,T.useState)(!1);return(0,E.jsxs)(E.Fragment,{children:[(0,E.jsx)(a,{label:`Open nearby places`,onClick:()=>t(!0)}),(0,E.jsx)(s,{isOpen:e,onOpenChange:t,label:`Nearby places`,height:`tall`,snapPoints:[.5],children:(0,E.jsx)(m,{padding:4,children:(0,E.jsxs)(f,{gap:3,children:[(0,E.jsx)(i,{type:`supporting`,color:`secondary`,children:`One extra stop, at half the viewport. Drag the handle down to collapse the sheet, then back up — the list keeps its scroll position. Flick down to dismiss.`}),(0,E.jsx)(l,{}),Array.from({length:12},(e,t)=>(0,E.jsxs)(f,{gap:1,children:[(0,E.jsxs)(i,{type:`label`,children:[`Place `,t+1]}),(0,E.jsxs)(i,{type:`supporting`,color:`secondary`,children:[(.2+t*.3).toFixed(1),` mi away`]})]},t))]})})})]})}},M={render:()=>{let[e,t]=(0,T.useState)(!1);return(0,E.jsxs)(E.Fragment,{children:[(0,E.jsx)(a,{label:`Open route`,onClick:()=>t(!0)}),(0,E.jsx)(s,{isOpen:e,onOpenChange:t,label:`Route`,height:`tall`,snapPoints:[`96px`,`50%`],children:(0,E.jsx)(m,{padding:4,children:(0,E.jsxs)(f,{gap:3,children:[(0,E.jsx)(d,{level:3,children:`To Ferry Building`}),(0,E.jsx)(i,{type:`supporting`,color:`secondary`,children:`Three stops: full, half the viewport, and a 96px peek. The half stop is a working surface — content laid out, scrim full. The peek is a glance: the sheet slides away rather than reflowing into a sliver, and the scrim thins.`}),(0,E.jsx)(l,{}),Array.from({length:10},(e,t)=>(0,E.jsxs)(f,{gap:1,children:[(0,E.jsxs)(i,{type:`label`,children:[`Step `,t+1]}),(0,E.jsxs)(i,{type:`supporting`,color:`secondary`,children:[`Continue for `,(.1+t*.4).toFixed(1),` mi`]})]},t))]})})})]})}},N={render:()=>{let[e,t]=(0,T.useState)(!1),[n,r]=(0,T.useState)(0);return(0,E.jsxs)(E.Fragment,{children:[(0,E.jsxs)(f,{gap:3,children:[(0,E.jsx)(d,{level:3,children:`Live page behind the overlay`}),(0,E.jsx)(i,{type:`supporting`,color:`secondary`,children:`A scrim is the semi-transparent overlay that covers and blocks the background. This example has no scrim, so the page stays visible and interactive. Open the sheet, then tap the counter below.`}),(0,E.jsx)(a,{label:`Open sheet`,onClick:()=>t(!0)}),(0,E.jsx)(a,{label:`Background clicks: ${n}`,onClick:()=>r(e=>e+1)})]}),(0,E.jsx)(s,{isOpen:e,onOpenChange:t,label:`Nearby places`,hasScrim:!1,height:`capped`,children:(0,E.jsx)(m,{padding:4,children:(0,E.jsxs)(f,{gap:3,children:[(0,E.jsx)(d,{level:3,children:`No scrim`}),(0,E.jsx)(i,{type:`supporting`,color:`secondary`,children:`This is still an overlay, not inline content. The page behind stays live. Drag the handle to resize, flick down to dismiss, or press Escape while focus is here.`}),(0,E.jsx)(l,{}),Array.from({length:8},(e,t)=>(0,E.jsxs)(f,{gap:1,children:[(0,E.jsxs)(i,{type:`label`,children:[`Place `,t+1]}),(0,E.jsxs)(i,{type:`supporting`,color:`secondary`,children:[(.2+t*.3).toFixed(1),` mi away`]})]},t))]})})})]})}},P={render:()=>{let[e,t]=(0,T.useState)(!1);return(0,E.jsxs)(E.Fragment,{children:[(0,E.jsx)(a,{label:`Share page`,onClick:()=>t(!0)}),(0,E.jsx)(s,{isOpen:e,onOpenChange:t,label:`Share page`,height:`hug`,children:(0,E.jsx)(m,{padding:4,children:(0,E.jsxs)(f,{gap:4,children:[(0,E.jsx)(d,{level:3,children:`Share page`}),(0,E.jsx)(i,{type:`supporting`,color:`secondary`,children:`The sheet fits its content, up to 92% of the viewport.`}),(0,E.jsx)(l,{}),(0,E.jsx)(a,{label:`Copy link`}),(0,E.jsx)(a,{label:`Send in Messenger`}),(0,E.jsx)(a,{label:`Save for later`}),(0,E.jsx)(a,{label:`Done`,onClick:()=>t(!1)})]})})})]})}},F={name:`Hug height — Long content`,render:()=>{let[e,t]=(0,T.useState)(!1);return(0,E.jsxs)(E.Fragment,{children:[(0,E.jsx)(a,{label:`View release notes`,onClick:()=>t(!0)}),(0,E.jsx)(s,{isOpen:e,onOpenChange:t,label:`Release notes`,height:`hug`,children:(0,E.jsx)(m,{padding:4,children:(0,E.jsxs)(f,{gap:4,children:[(0,E.jsx)(d,{level:3,children:`Release notes`}),(0,E.jsx)(i,{type:`supporting`,color:`secondary`,children:`The sheet hugs its content until it reaches 92% of the viewport, then the content scrolls within the sheet. Drag it to a snap point and the scrolling area resizes to the height you can actually see — except at the shortest peek, which slides below the viewport at full height rather than reflowing to a sliver.`}),(0,E.jsx)(l,{}),Array.from({length:12},(e,t)=>(0,E.jsxs)(f,{gap:1,children:[(0,E.jsxs)(i,{type:`label`,children:[`Update `,t+1]}),(0,E.jsx)(i,{type:`supporting`,color:`secondary`,children:`A summary of the improvements, fixes, and other changes in this update.`})]},t)),(0,E.jsx)(a,{label:`Done`,onClick:()=>t(!1)})]})})})]})}},I={name:`Capped height — Long content`,render:()=>{let[e,t]=(0,T.useState)(!1);return(0,E.jsxs)(E.Fragment,{children:[(0,E.jsx)(a,{label:`View saved places`,onClick:()=>t(!0)}),(0,E.jsx)(s,{isOpen:e,onOpenChange:t,label:`Saved places`,height:`capped`,children:(0,E.jsx)(m,{padding:4,children:(0,E.jsxs)(f,{gap:4,children:[(0,E.jsx)(d,{level:3,children:`Saved places`}),(0,E.jsx)(i,{type:`supporting`,color:`secondary`,children:`The sheet opens at a capped height while the long list scrolls within it.`}),(0,E.jsx)(l,{}),Array.from({length:12},(e,t)=>(0,E.jsxs)(f,{gap:1,children:[(0,E.jsxs)(i,{type:`label`,children:[`Saved place `,t+1]}),(0,E.jsx)(i,{type:`supporting`,color:`secondary`,children:`Notes and details about this saved place.`})]},t)),(0,E.jsx)(a,{label:`Done`,onClick:()=>t(!1)})]})})})]})}},L={name:`Mobile keyboard`,render:()=>{let[e,t]=(0,T.useState)(!1);return(0,E.jsxs)(E.Fragment,{children:[(0,E.jsx)(a,{label:`Add a comment`,onClick:()=>t(!0)}),(0,E.jsx)(s,{isOpen:e,onOpenChange:t,label:`Add a comment`,height:`tall`,snapPoints:[.5],children:(0,E.jsx)(m,{padding:4,children:(0,E.jsx)(w,{onPost:()=>t(!1)})})})]})}},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
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
                A Tall sheet fills most of the viewport and scrolls its content.
                It has no snap points, so a drag springs back; flick down to
                dismiss. Escape also dismisses.
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
    return <>
        <Button label="Open nearby places" onClick={() => setIsOpen(true)} />
        <BottomSheet isOpen={isOpen} onOpenChange={setIsOpen} label="Nearby places" height="tall" snapPoints={[0.5]}>
          <Section padding={4}>
            <VStack gap={3}>
              <Text type="supporting" color="secondary">
                One extra stop, at half the viewport. Drag the handle down to
                collapse the sheet, then back up — the list keeps its scroll
                position. Flick down to dismiss.
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
}`,...j.parameters?.docs?.source}}},M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    return <>
        <Button label="Open route" onClick={() => setIsOpen(true)} />
        <BottomSheet isOpen={isOpen} onOpenChange={setIsOpen} label="Route" height="tall" snapPoints={['96px', '50%']}>
          <Section padding={4}>
            <VStack gap={3}>
              <Heading level={3}>To Ferry Building</Heading>
              <Text type="supporting" color="secondary">
                Three stops: full, half the viewport, and a 96px peek. The half
                stop is a working surface — content laid out, scrim full. The
                peek is a glance: the sheet slides away rather than reflowing
                into a sliver, and the scrim thins.
              </Text>
              <Divider />
              {Array.from({
              length: 10
            }, (_, i) => <VStack key={i} gap={1}>
                  <Text type="label">Step {i + 1}</Text>
                  <Text type="supporting" color="secondary">
                    Continue for {(0.1 + i * 0.4).toFixed(1)} mi
                  </Text>
                </VStack>)}
            </VStack>
          </Section>
        </BottomSheet>
      </>;
  }
}`,...M.parameters?.docs?.source}}},N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
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
}`,...N.parameters?.docs?.source}}},P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
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
}`,...P.parameters?.docs?.source}}},F.parameters={...F.parameters,docs:{...F.parameters?.docs,source:{originalSource:`{
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
}`,...F.parameters?.docs?.source}}},I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{
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
}`,...I.parameters?.docs?.source}}},L.parameters={...L.parameters,docs:{...L.parameters?.docs,source:{originalSource:`{
  name: 'Mobile keyboard',
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    return <>
        <Button label="Add a comment" onClick={() => setIsOpen(true)} />
        <BottomSheet isOpen={isOpen} onOpenChange={setIsOpen} label="Add a comment" height="tall" snapPoints={[0.5]}>
          <Section padding={4}>
            <MobileKeyboardCommentForm onPost={() => setIsOpen(false)} />
          </Section>
        </BottomSheet>
      </>;
  }
}`,...L.parameters?.docs?.source}}},R=[`Showcase`,`FormPurpose`,`TallSheet`,`SnapPoints`,`SnapPointsWithPeek`,`NoScrim`,`HugHeight`,`HugHeightWithLongContent`,`CappedHeightWithLongContent`,`MobileKeyboard`]}))();export{I as CappedHeightWithLongContent,k as FormPurpose,P as HugHeight,F as HugHeightWithLongContent,L as MobileKeyboard,N as NoScrim,O as Showcase,j as SnapPoints,M as SnapPointsWithPeek,A as TallSheet,R as __namedExportsOrder,D as default};