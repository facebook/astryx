import{i as e,s as t}from"./preload-helper-CT_b8DTk.js";import{t as n}from"./react-B7Te67-h.js";import{t as r}from"./jsx-runtime-DqZldVDK.js";import{t as i}from"./Text-BXEuttRu.js";import{t as a}from"./Button-BPD_GmpK.js";import{t as o}from"./Button-CIR94wUk.js";import{t as s}from"./BottomSheet-Dy5UgMWq.js";import{t as c}from"./BottomSheet-BwLnJqy3.js";import{t as l}from"./Divider-W__m45kv.js";import{t as u}from"./Divider-9bMacvnO.js";import{t as d}from"./Heading-DaA_aCzh.js";import{i as f,t as p}from"./Stack-CfnjGhmq.js";import{t as m}from"./Section-5EZtoXey.js";import{t as h}from"./Section-Dd6bjWM6.js";import{t as g}from"./Heading-Bq0pOA6X.js";import{t as _}from"./Text-CRXEW_aT.js";import{t as v}from"./CheckboxInput-C4u4lSx4.js";import{t as y}from"./CheckboxInput-DlEch7rA.js";import{t as b}from"./TextInput-BiB-eN_R.js";import{t as x}from"./TextInput-DKUCxYsP.js";import{_r as S,fn as C,pn as w,vr as T}from"./iframe-xvThgxsA.js";function E({onPost:e}){let[t,n]=(0,D.useState)({title:``,author:``,email:``,team:``,project:``,relatedTask:``,summary:``,context:``,changes:``,followUp:``,comment:``}),r=e=>t=>n(n=>({...n,[e]:t}));return(0,O.jsxs)(f,{gap:4,children:[(0,O.jsx)(d,{level:3,children:`Add a comment`}),(0,O.jsx)(i,{type:`supporting`,color:`secondary`,children:`Keep the Tall sheet fully expanded, then focus fields near the beginning, middle, and end. The outer sheet remains stationary while its body scrolls each control above the mobile keyboard. Drag it down to the half-height stop and the accommodation stops — only a fully expanded Tall sheet provides it — then drag back up and it resumes.`}),(0,O.jsx)(i,{type:`supporting`,color:`secondary`,children:`Move the sheet with its handle or close it with Post comment to verify that sheet travel and closing dismiss the keyboard.`}),(0,O.jsx)(l,{}),(0,O.jsx)(b,{label:`Title`,value:t.title,onChange:r(`title`)}),(0,O.jsx)(b,{label:`Author`,value:t.author,onChange:r(`author`)}),(0,O.jsx)(b,{label:`Email`,type:`email`,value:t.email,onChange:r(`email`)}),(0,O.jsx)(b,{label:`Team`,value:t.team,onChange:r(`team`)}),(0,O.jsx)(b,{label:`Project`,value:t.project,onChange:r(`project`)}),(0,O.jsx)(b,{label:`Related task`,value:t.relatedTask,onChange:r(`relatedTask`)}),(0,O.jsx)(w,{label:`Summary`,rows:4,value:t.summary,onChange:r(`summary`)}),(0,O.jsx)(w,{label:`Context`,rows:6,value:t.context,onChange:r(`context`)}),(0,O.jsx)(w,{label:`What changed?`,rows:4,value:t.changes,onChange:r(`changes`)}),(0,O.jsx)(w,{label:`Suggested follow-up`,rows:4,value:t.followUp,onChange:r(`followUp`)}),(0,O.jsx)(w,{label:`Comment`,rows:8,value:t.comment,onChange:r(`comment`)}),(0,O.jsx)(a,{label:`Post comment`,onClick:e})]})}var D,O,k,A,j,M,N,P,F,I,L,R,z,B,V,H,U,W,G,K;e((()=>{D=t(n()),c(),S(),o(),u(),g(),h(),p(),_(),x(),C(),y(),O=r(),{expect:k,waitFor:A,within:j}=__STORYBOOK_MODULE_TEST__,M={title:`Core/BottomSheet`,component:s,tags:[`autodocs`],parameters:{layout:`fullscreen`,docs:{story:{inline:!1,height:`560px`}}},decorators:[e=>(0,O.jsx)(`div`,{style:{minHeight:480,padding:32},children:(0,O.jsx)(e,{})})]},N={args:{isOpen:!0,label:`Reading details`,height:`capped`,children:(0,O.jsx)(m,{children:(0,O.jsxs)(f,{gap:4,children:[(0,O.jsx)(d,{level:2,children:`Reading details`}),Array.from({length:16},(e,t)=>(0,O.jsxs)(i,{children:[`Paragraph `,t+1,`. This sheet contains plain text. Use Tab to reach the scrolling area, then Arrow Down or Page Down to read the remaining content. Escape closes the sheet.`]},t))]})})},render:e=>{let t=e,[n,r]=(0,D.useState)(!0);return(0,O.jsx)(s,{...t,isOpen:n,onOpenChange:r})},play:async({canvasElement:e})=>{let t=j(e).getByRole(`group`,{name:`Reading details`});await A(()=>{k(t).toHaveAttribute(`data-scrollable-block`,`true`),k(t).toHaveAttribute(`tabindex`,`0`)})}},P={...N,args:{...N.args,label:`Short details`,children:(0,O.jsx)(m,{children:(0,O.jsx)(i,{children:`This content fits without a separate keyboard scroll stop.`})})},play:async({canvasElement:e})=>{let t=j(e).getByRole(`group`,{name:`Short details`});await A(()=>{k(t).not.toHaveAttribute(`data-scrollable-block`),k(t).not.toHaveAttribute(`tabindex`)})}},F={render:()=>{let[e,t]=(0,D.useState)(!1);return(0,O.jsxs)(O.Fragment,{children:[(0,O.jsx)(a,{label:`Open sheet`,onClick:()=>t(!0)}),(0,O.jsx)(s,{isOpen:e,onOpenChange:t,label:`Filters`,children:(0,O.jsx)(m,{padding:4,children:(0,O.jsxs)(f,{gap:4,children:[(0,O.jsx)(d,{level:3,children:`Filters`}),(0,O.jsx)(l,{}),(0,O.jsxs)(f,{gap:2,children:[(0,O.jsx)(v,{label:`In stock`,value:!1}),(0,O.jsx)(v,{label:`On sale`,value:!1}),(0,O.jsx)(v,{label:`Free shipping`,value:!1})]}),(0,O.jsx)(a,{label:`Apply`,onClick:()=>t(!1)})]})})})]})}},I={name:`Form purpose`,render:()=>{let[e,t]=(0,D.useState)(!1);return(0,O.jsxs)(O.Fragment,{children:[(0,O.jsx)(a,{label:`Edit profile`,onClick:()=>t(!0)}),(0,O.jsx)(s,{isOpen:e,onOpenChange:t,purpose:`form`,label:`Edit profile`,height:`hug`,children:(0,O.jsx)(m,{padding:4,children:(0,O.jsxs)(f,{gap:4,children:[(0,O.jsx)(d,{level:3,children:`Edit profile`}),(0,O.jsx)(i,{type:`supporting`,color:`secondary`,children:`Swiping down or clicking the scrim keeps this form open. Escape and the explicit actions can still close it.`}),(0,O.jsx)(a,{label:`Save changes`,onClick:()=>t(!1)})]})})})]})}},L={render:()=>{let[e,t]=(0,D.useState)(!1);return(0,O.jsxs)(O.Fragment,{children:[(0,O.jsx)(a,{label:`Open nearby places`,onClick:()=>t(!0)}),(0,O.jsx)(s,{isOpen:e,onOpenChange:t,label:`Nearby places`,height:`tall`,children:(0,O.jsx)(m,{padding:4,children:(0,O.jsxs)(f,{gap:3,children:[(0,O.jsx)(i,{type:`supporting`,color:`secondary`,children:`A Tall sheet fills most of the viewport and scrolls its content. It has no snap points, so a drag springs back; flick down to dismiss. Escape also dismisses.`}),(0,O.jsx)(l,{}),Array.from({length:12},(e,t)=>(0,O.jsxs)(f,{gap:1,children:[(0,O.jsxs)(i,{type:`label`,children:[`Place `,t+1]}),(0,O.jsxs)(i,{type:`supporting`,color:`secondary`,children:[(.2+t*.3).toFixed(1),` mi away`]})]},t))]})})})]})}},R={render:()=>{let[e,t]=(0,D.useState)(!1);return(0,O.jsxs)(O.Fragment,{children:[(0,O.jsx)(a,{label:`Open nearby places`,onClick:()=>t(!0)}),(0,O.jsx)(s,{isOpen:e,onOpenChange:t,label:`Nearby places`,height:`tall`,snapPoints:[.5],children:(0,O.jsx)(m,{padding:4,children:(0,O.jsxs)(f,{gap:3,children:[(0,O.jsx)(i,{type:`supporting`,color:`secondary`,children:`One extra stop, at half the viewport. Drag the handle down to collapse the sheet, then back up — the list keeps its scroll position. Flick down to dismiss.`}),(0,O.jsx)(l,{}),Array.from({length:12},(e,t)=>(0,O.jsxs)(f,{gap:1,children:[(0,O.jsxs)(i,{type:`label`,children:[`Place `,t+1]}),(0,O.jsxs)(i,{type:`supporting`,color:`secondary`,children:[(.2+t*.3).toFixed(1),` mi away`]})]},t))]})})})]})}},z={render:()=>{let[e,t]=(0,D.useState)(!1);return(0,O.jsxs)(O.Fragment,{children:[(0,O.jsx)(a,{label:`Open route`,onClick:()=>t(!0)}),(0,O.jsx)(s,{isOpen:e,onOpenChange:t,label:`Route`,height:`tall`,snapPoints:[`96px`,`50%`],children:(0,O.jsx)(m,{padding:4,children:(0,O.jsxs)(f,{gap:3,children:[(0,O.jsx)(d,{level:3,children:`To Ferry Building`}),(0,O.jsx)(i,{type:`supporting`,color:`secondary`,children:`Three stops: full, half the viewport, and a 96px peek. The half stop is a working surface — content laid out, scrim full. The peek is a glance: the sheet slides away rather than reflowing into a sliver, and the scrim thins.`}),(0,O.jsx)(l,{}),Array.from({length:10},(e,t)=>(0,O.jsxs)(f,{gap:1,children:[(0,O.jsxs)(i,{type:`label`,children:[`Step `,t+1]}),(0,O.jsxs)(i,{type:`supporting`,color:`secondary`,children:[`Continue for `,(.1+t*.4).toFixed(1),` mi`]})]},t))]})})})]})}},B={render:()=>{let[e,t]=(0,D.useState)(!1),[n,r]=(0,D.useState)(0);return(0,O.jsxs)(O.Fragment,{children:[(0,O.jsxs)(f,{gap:3,children:[(0,O.jsx)(d,{level:3,children:`Live page behind the overlay`}),(0,O.jsx)(i,{type:`supporting`,color:`secondary`,children:`A scrim is the semi-transparent overlay that covers and blocks the background. This example has no scrim, so the page stays visible and interactive. Open the sheet, then tap the counter below.`}),(0,O.jsx)(a,{label:`Open sheet`,onClick:()=>t(!0)}),(0,O.jsx)(a,{label:`Background clicks: ${n}`,onClick:()=>r(e=>e+1)})]}),(0,O.jsx)(s,{isOpen:e,onOpenChange:t,label:`Nearby places`,hasScrim:!1,height:`capped`,children:(0,O.jsx)(m,{padding:4,children:(0,O.jsxs)(f,{gap:3,children:[(0,O.jsx)(d,{level:3,children:`No scrim`}),(0,O.jsx)(i,{type:`supporting`,color:`secondary`,children:`This is still an overlay, not inline content. The page behind stays live. Drag the handle to resize, flick down to dismiss, or press Escape while focus is here.`}),(0,O.jsx)(l,{}),Array.from({length:8},(e,t)=>(0,O.jsxs)(f,{gap:1,children:[(0,O.jsxs)(i,{type:`label`,children:[`Place `,t+1]}),(0,O.jsxs)(i,{type:`supporting`,color:`secondary`,children:[(.2+t*.3).toFixed(1),` mi away`]})]},t))]})})})]})}},V={render:()=>{let[e,t]=(0,D.useState)(!1);return(0,O.jsxs)(O.Fragment,{children:[(0,O.jsx)(a,{label:`Share page`,onClick:()=>t(!0)}),(0,O.jsx)(s,{isOpen:e,onOpenChange:t,label:`Share page`,height:`hug`,children:(0,O.jsx)(m,{padding:4,children:(0,O.jsxs)(f,{gap:4,children:[(0,O.jsx)(d,{level:3,children:`Share page`}),(0,O.jsx)(i,{type:`supporting`,color:`secondary`,children:`The sheet fits its content, up to 92% of the viewport.`}),(0,O.jsx)(l,{}),(0,O.jsx)(a,{label:`Copy link`}),(0,O.jsx)(a,{label:`Send in Messenger`}),(0,O.jsx)(a,{label:`Save for later`}),(0,O.jsx)(a,{label:`Done`,onClick:()=>t(!1)})]})})})]})}},H={name:`Hug height — Long content`,render:()=>{let[e,t]=(0,D.useState)(!1);return(0,O.jsxs)(O.Fragment,{children:[(0,O.jsx)(a,{label:`View release notes`,onClick:()=>t(!0)}),(0,O.jsx)(s,{isOpen:e,onOpenChange:t,label:`Release notes`,height:`hug`,children:(0,O.jsx)(m,{padding:4,children:(0,O.jsxs)(f,{gap:4,children:[(0,O.jsx)(d,{level:3,children:`Release notes`}),(0,O.jsx)(i,{type:`supporting`,color:`secondary`,children:`The sheet hugs its content until it reaches 92% of the viewport, then the content scrolls within the sheet. Drag it to a snap point and the scrolling area resizes to the height you can actually see — except at the shortest peek, which slides below the viewport at full height rather than reflowing to a sliver.`}),(0,O.jsx)(l,{}),Array.from({length:12},(e,t)=>(0,O.jsxs)(f,{gap:1,children:[(0,O.jsxs)(i,{type:`label`,children:[`Update `,t+1]}),(0,O.jsx)(i,{type:`supporting`,color:`secondary`,children:`A summary of the improvements, fixes, and other changes in this update.`})]},t)),(0,O.jsx)(a,{label:`Done`,onClick:()=>t(!1)})]})})})]})}},U={name:`Capped height — Long content`,render:()=>{let[e,t]=(0,D.useState)(!1);return(0,O.jsxs)(O.Fragment,{children:[(0,O.jsx)(a,{label:`View saved places`,onClick:()=>t(!0)}),(0,O.jsx)(s,{isOpen:e,onOpenChange:t,label:`Saved places`,height:`capped`,children:(0,O.jsx)(m,{padding:4,children:(0,O.jsxs)(f,{gap:4,children:[(0,O.jsx)(d,{level:3,children:`Saved places`}),(0,O.jsx)(i,{type:`supporting`,color:`secondary`,children:`The sheet opens at a capped height while the long list scrolls within it.`}),(0,O.jsx)(l,{}),Array.from({length:12},(e,t)=>(0,O.jsxs)(f,{gap:1,children:[(0,O.jsxs)(i,{type:`label`,children:[`Saved place `,t+1]}),(0,O.jsx)(i,{type:`supporting`,color:`secondary`,children:`Notes and details about this saved place.`})]},t)),(0,O.jsx)(a,{label:`Done`,onClick:()=>t(!1)})]})})})]})}},W={name:`Mobile keyboard`,render:()=>{let[e,t]=(0,D.useState)(!1);return(0,O.jsxs)(O.Fragment,{children:[(0,O.jsx)(a,{label:`Add a comment`,onClick:()=>t(!0)}),(0,O.jsx)(s,{isOpen:e,onOpenChange:t,label:`Add a comment`,height:`tall`,snapPoints:[.5],children:(0,O.jsx)(m,{padding:4,children:(0,O.jsx)(E,{onPost:()=>t(!1)})})})]})}},G={render:()=>{let[e,t]=(0,D.useState)(`button`),[n,r]=(0,D.useState)(!0),[o,c]=(0,D.useState)(!1),l=(0,O.jsx)(a,{label:`First action`,onClick:()=>{}}),u;switch(e){case`text`:u=(0,O.jsx)(i,{children:`Read the details below.`});break;case`link`:u=(0,O.jsx)(a,{label:`First link`,href:`#reading-end`});break;case`input`:u=(0,O.jsx)(b,{label:`First input`,value:``,onChange:()=>{}});break;case`nested`:u=(0,O.jsxs)(T,{label:`Nested reading`,height:100,children:[l,(0,O.jsx)(`div`,{className:`x1m3v4wt`,children:`Nested content`})]});break;case`native-scroll`:u=(0,O.jsxs)(`div`,{className:`xysyzu8 xpyat2d`,children:[l,(0,O.jsx)(`div`,{className:`x1m3v4wt`,children:`Nested content`})]});break;case`disabled`:u=(0,O.jsx)(a,{label:`First action`,isDisabled:!0});break;case`button`:u=l;break;default:u=(0,O.jsx)(`div`,{role:e,children:l})}return(0,O.jsxs)(O.Fragment,{children:[(0,O.jsxs)(`label`,{children:[`Content case`,(0,O.jsx)(`select`,{value:e,onChange:e=>t(e.target.value),children:[`button`,`link`,`text`,`input`,`disabled`,`nested`,`native-scroll`,`radiogroup`,`slider`,`combobox`,`listbox`,`menu`,`grid`,`tree`,`tablist`,`toolbar`].map(e=>(0,O.jsx)(`option`,{value:e,children:e},e))})]}),(0,O.jsx)(a,{label:`Before sheet`,onClick:()=>r(!0)}),(0,O.jsx)(a,{label:`Toggle modal`,onClick:()=>c(e=>!e)}),(0,O.jsx)(s,{label:`Keyboard reading`,isOpen:n,onOpenChange:r,hasScrim:o,height:`capped`,children:(0,O.jsx)(m,{children:(0,O.jsxs)(f,{gap:4,children:[(0,O.jsx)(d,{level:2,children:`Keyboard reading`}),u,Array.from({length:24},(e,t)=>(0,O.jsxs)(i,{children:[`Paragraph `,t+1,`. Use Arrow or Page keys to read the full content. The sheet keeps native scrolling after keyboard entry.`]},t)),e!==`text`&&e!==`disabled`&&(0,O.jsx)(a,{label:`Last action`,onClick:()=>{}}),(0,O.jsx)(i,{id:`reading-end`,children:`End of reading`})]})})},o?`modal`:`nonmodal`),(0,O.jsx)(a,{label:`After sheet`,onClick:()=>{}})]})}},N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
  args: {
    isOpen: true,
    label: 'Reading details',
    height: 'capped',
    children: <Section>
        <VStack gap={4}>
          <Heading level={2}>Reading details</Heading>
          {Array.from({
          length: 16
        }, (_, index) => <Text key={index}>
              Paragraph {index + 1}. This sheet contains plain text. Use Tab to
              reach the scrolling area, then Arrow Down or Page Down to read the
              remaining content. Escape closes the sheet.
            </Text>)}
        </VStack>
      </Section>
  },
  render: args => {
    const standaloneArgs = args as StandaloneBottomSheetStoryProps;
    const [isOpen, setIsOpen] = useState(true);
    return <BottomSheet {...standaloneArgs} isOpen={isOpen} onOpenChange={setIsOpen} />;
  },
  play: async ({
    canvasElement
  }) => {
    const body = within(canvasElement).getByRole('group', {
      name: 'Reading details'
    });
    await waitFor(() => {
      expect(body).toHaveAttribute('data-scrollable-block', 'true');
      expect(body).toHaveAttribute('tabindex', '0');
    });
  }
}`,...N.parameters?.docs?.source},description:{story:`Keep this sheet open so the accessibility audit inspects its scroll body.`,...N.parameters?.docs?.description}}},P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
  ...TextOnly,
  args: {
    ...TextOnly.args,
    label: 'Short details',
    children: <Section>
        <Text>This content fits without a separate keyboard scroll stop.</Text>
      </Section>
  },
  play: async ({
    canvasElement
  }) => {
    const body = within(canvasElement).getByRole('group', {
      name: 'Short details'
    });
    await waitFor(() => {
      expect(body).not.toHaveAttribute('data-scrollable-block');
      expect(body).not.toHaveAttribute('tabindex');
    });
  }
}`,...P.parameters?.docs?.source}}},F.parameters={...F.parameters,docs:{...F.parameters?.docs,source:{originalSource:`{
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
}`,...F.parameters?.docs?.source}}},I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{
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
}`,...I.parameters?.docs?.source}}},L.parameters={...L.parameters,docs:{...L.parameters?.docs,source:{originalSource:`{
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
}`,...L.parameters?.docs?.source}}},R.parameters={...R.parameters,docs:{...R.parameters?.docs,source:{originalSource:`{
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
}`,...R.parameters?.docs?.source}}},z.parameters={...z.parameters,docs:{...z.parameters?.docs,source:{originalSource:`{
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
}`,...z.parameters?.docs?.source}}},B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
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
}`,...B.parameters?.docs?.source}}},V.parameters={...V.parameters,docs:{...V.parameters?.docs,source:{originalSource:`{
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
}`,...V.parameters?.docs?.source}}},H.parameters={...H.parameters,docs:{...H.parameters?.docs,source:{originalSource:`{
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
}`,...H.parameters?.docs?.source}}},U.parameters={...U.parameters,docs:{...U.parameters?.docs,source:{originalSource:`{
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
}`,...U.parameters?.docs?.source}}},W.parameters={...W.parameters,docs:{...W.parameters?.docs,source:{originalSource:`{
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
}`,...W.parameters?.docs?.source}}},G.parameters={...G.parameters,docs:{...G.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [variant, setVariant] = useState('button');
    const [isOpen, setIsOpen] = useState(true);
    const [hasScrim, setHasScrim] = useState(false);
    const action = <Button label="First action" onClick={() => {}} />;
    let first;
    switch (variant) {
      case 'text':
        first = <Text>Read the details below.</Text>;
        break;
      case 'link':
        first = <Button label="First link" href="#reading-end" />;
        break;
      case 'input':
        first = <TextInput label="First input" value="" onChange={() => {}} />;
        break;
      case 'nested':
        first = <ScrollableArea label="Nested reading" height={100}>
            {action}
            <div {...stylex.props(keyboardFixtureStyles.nestedContent)}>
              Nested content
            </div>
          </ScrollableArea>;
        break;
      case 'native-scroll':
        first = <div {...stylex.props(keyboardFixtureStyles.nestedViewport)}>
            {action}
            <div {...stylex.props(keyboardFixtureStyles.nestedContent)}>
              Nested content
            </div>
          </div>;
        break;
      case 'disabled':
        first = <Button label="First action" isDisabled />;
        break;
      case 'button':
        first = action;
        break;
      default:
        first = <div role={variant}>{action}</div>;
    }
    return <>
        <label>
          Content case
          <select value={variant} onChange={event => setVariant(event.target.value)}>
            {['button', 'link', 'text', 'input', 'disabled', 'nested', 'native-scroll', 'radiogroup', 'slider', 'combobox', 'listbox', 'menu', 'grid', 'tree', 'tablist', 'toolbar'].map(value => <option key={value} value={value}>
                {value}
              </option>)}
          </select>
        </label>
        <Button label="Before sheet" onClick={() => setIsOpen(true)} />
        <Button label="Toggle modal" onClick={() => setHasScrim(value => !value)} />
        <BottomSheet key={hasScrim ? 'modal' : 'nonmodal'} label="Keyboard reading" isOpen={isOpen} onOpenChange={setIsOpen} hasScrim={hasScrim} height="capped">
          <Section>
            <VStack gap={4}>
              <Heading level={2}>Keyboard reading</Heading>
              {first}
              {Array.from({
              length: 24
            }, (_, index) => <Text key={index}>
                  Paragraph {index + 1}. Use Arrow or Page keys to read the full
                  content. The sheet keeps native scrolling after keyboard
                  entry.
                </Text>)}
              {variant !== 'text' && variant !== 'disabled' && <Button label="Last action" onClick={() => {}} />}
              <Text id="reading-end">End of reading</Text>
            </VStack>
          </Section>
        </BottomSheet>
        <Button label="After sheet" onClick={() => {}} />
      </>;
  }
}`,...G.parameters?.docs?.source},description:{story:`Native content variants deliberately exercise the hook's delegation boundary.`,...G.parameters?.docs?.description}}},K=[`TextOnly`,`TextOnlyFitting`,`Showcase`,`FormPurpose`,`TallSheet`,`SnapPoints`,`SnapPointsWithPeek`,`NoScrim`,`HugHeight`,`HugHeightWithLongContent`,`CappedHeightWithLongContent`,`MobileKeyboard`,`KeyboardDelegation`]}))();export{U as CappedHeightWithLongContent,I as FormPurpose,V as HugHeight,H as HugHeightWithLongContent,G as KeyboardDelegation,W as MobileKeyboard,B as NoScrim,F as Showcase,R as SnapPoints,z as SnapPointsWithPeek,L as TallSheet,N as TextOnly,P as TextOnlyFitting,K as __namedExportsOrder,M as default};