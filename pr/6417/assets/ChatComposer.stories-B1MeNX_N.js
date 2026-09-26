import{i as e,s as t}from"./preload-helper-CT_b8DTk.js";import{t as n}from"./react-B7Te67-h.js";import{t as r}from"./jsx-runtime-DqZldVDK.js";import{t as i}from"./Text-BXEuttRu.js";import{t as a}from"./Button-BPD_GmpK.js";import{t as o}from"./Button-CIR94wUk.js";import{n as s,t as c}from"./Badge-CGsBkr0T.js";import{t as l}from"./Text-CRXEW_aT.js";import{i as u,n as d,t as f}from"./List-CO6n2F-F.js";import{n as p,t as m}from"./Token-BBphhCWB.js";import{M as h,N as g,Si as _,Zr as v,bi as y,vi as b,wi as x}from"./iframe-0BxdduGT.js";function S(){let[e,t]=(0,C.useState)(0);return(0,w.jsx)(`div`,{"data-testid":`disabled-streaming-fixture`,"data-stop-requests":e,children:(0,w.jsx)(y,{"data-testid":`disabled-streaming-composer`,onSubmit:()=>{},onStop:()=>t(e=>e+1),isDisabled:!0,isStopShown:!0,placeholder:``})})}var C,w,T,E,D,O,k,A,j,M,N,P,F,I,L,R,z,B,V,H,U,W,G,K,q,J,Y;e((()=>{v(),m(),o(),h(),f(),l(),c(),C=t(n()),w=r(),{expect:T,userEvent:E,within:D}=__STORYBOOK_MODULE_TEST__,O=(0,w.jsxs)(`svg`,{width:`1em`,height:`1em`,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:`1.5`,strokeLinecap:`round`,strokeLinejoin:`round`,children:[(0,w.jsx)(`circle`,{cx:`12`,cy:`12`,r:`4`}),(0,w.jsx)(`path`,{d:`M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8`})]}),k=(0,w.jsx)(`svg`,{width:`1em`,height:`1em`,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:`1.5`,strokeLinecap:`round`,strokeLinejoin:`round`,children:(0,w.jsx)(`path`,{d:`m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48`})}),A=(0,w.jsxs)(`svg`,{width:`1em`,height:`1em`,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:`1.5`,strokeLinecap:`round`,strokeLinejoin:`round`,children:[(0,w.jsx)(`path`,{d:`M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z`}),(0,w.jsx)(`path`,{d:`M19 10v2a7 7 0 0 1-14 0v-2`}),(0,w.jsx)(`line`,{x1:`12`,x2:`12`,y1:`19`,y2:`22`})]}),j={title:`Core/ChatComposer`,component:y,tags:[`autodocs`],parameters:{layout:`centered`},decorators:[e=>(0,w.jsx)(`div`,{style:{boxSizing:`border-box`,maxWidth:`100%`,padding:40,width:680},children:(0,w.jsx)(e,{})})]},M={render:()=>(0,w.jsx)(y,{onSubmit:e=>{console.log(`Submit:`,e),alert(`Sent: ${e}`)}})},N={render:()=>{let e=typeof window<`u`&&window.matchMedia?.(`(pointer: coarse)`).matches;return(0,w.jsx)(y,{onSubmit:e=>console.log(`Submit:`,e),input:(0,w.jsx)(x,{placeholder:e?`Enter inserts a newline on touch — use Send`:`Enter sends; Shift+Enter for a newline`,onKeyDown:t=>{e&&t.key===`Enter`&&!t.shiftKey&&t.preventDefault()}})})}},P={render:()=>{let[e,t]=(0,C.useState)(!0);return(0,w.jsx)(y,{onSubmit:e=>{console.log(`Submit:`,e),t(!0)},isStopShown:e,onStop:()=>{console.log(`Stopped`),t(!1)}})}},F={render:()=>(0,w.jsx)(y,{onSubmit:e=>console.log(`Submit:`,e),footerActions:(0,w.jsx)(a,{label:`GPT-4`,variant:`ghost`,size:`md`}),sendActions:(0,w.jsx)(a,{label:`Microphone`,variant:`ghost`,size:`md`,icon:A,isIconOnly:!0})})},I={render:()=>(0,w.jsx)(y,{onSubmit:e=>console.log(`Submit:`,e),drawer:(0,w.jsxs)(b,{children:[(0,w.jsx)(p,{label:`report.pdf`,onRemove:()=>{}}),(0,w.jsx)(p,{label:`data.csv`,onRemove:()=>{}})]}),headerActions:(0,w.jsx)(a,{label:`Attach file`,variant:`ghost`,size:`sm`,icon:k,isIconOnly:!0}),headerContext:(0,w.jsx)(g,{label:`Context window`,value:3,isLabelHidden:!0})})},L={render:()=>{let[e,t]=(0,C.useState)(!1);return(0,w.jsx)(y,{onSubmit:e=>{console.log(`Submit:`,e),t(!0),setTimeout(()=>t(!1),3e3)},isStopShown:e,onStop:()=>t(!1),placeholder:`Ask me anything...`,drawer:(0,w.jsx)(b,{children:(0,w.jsx)(p,{label:`design-spec.pdf`,onRemove:()=>{}})}),headerActions:(0,w.jsxs)(w.Fragment,{children:[(0,w.jsx)(a,{label:`Mention`,variant:`ghost`,size:`sm`,icon:O,isIconOnly:!0}),(0,w.jsx)(a,{label:`Attach file`,variant:`ghost`,size:`sm`,icon:k,isIconOnly:!0})]}),headerContext:(0,w.jsx)(g,{label:`Context window`,value:3,isLabelHidden:!0}),footerActions:(0,w.jsxs)(w.Fragment,{children:[(0,w.jsx)(a,{label:`Auto`,variant:`ghost`,size:`md`}),(0,w.jsx)(a,{label:`Settings`,variant:`ghost`,size:`md`})]}),sendActions:(0,w.jsx)(a,{label:`Microphone`,variant:`ghost`,size:`md`,icon:A,isIconOnly:!0})})}},R={render:()=>(0,w.jsx)(y,{onSubmit:()=>{},isDisabled:!0,placeholder:`Composer is disabled`})},z={render:()=>(0,w.jsx)(y,{onSubmit:e=>console.log(`Submit:`,e),drawer:(0,w.jsxs)(b,{count:6,children:[(0,w.jsx)(p,{label:`new_feature_prd.docx`,onRemove:()=>{}}),(0,w.jsx)(p,{label:`2026_roadmap.docx`,onRemove:()=>{}}),(0,w.jsx)(p,{label:`user_flow.pdf`,onRemove:()=>{}}),(0,w.jsx)(p,{label:`launch_plan.docx`,onRemove:()=>{}}),(0,w.jsx)(p,{label:`user_feedback.csv`,onRemove:()=>{}}),(0,w.jsx)(p,{label:`kpis.csv`,onRemove:()=>{}})]})})},B={render:()=>(0,w.jsx)(y,{onSubmit:e=>console.log(`Submit:`,e),status:{type:`error`,message:`Failed to send message. Please try again.`}})},V={render:()=>(0,w.jsx)(y,{onSubmit:e=>console.log(`Submit:`,e),statusPosition:`top`,status:{type:`warning`,message:`Context window is 90% full.`}})},H={render:()=>(0,w.jsx)(y,{onSubmit:e=>console.log(`Submit:`,e),status:{type:`error`,message:`Failed to send message. Please try again.`}})},U={render:()=>(0,w.jsx)(y,{onSubmit:e=>{console.log(`Submit:`,e),alert(`Sent: ${e}`)},placeholder:`Type to enable the send button...`})},W={render:()=>(0,w.jsx)(y,{onSubmit:e=>console.log(`Submit:`,e),sendButton:(0,w.jsx)(_,{size:`sm`,onSend:()=>alert(`Custom send!`)})})},G={render:()=>{let[e,t]=(0,C.useState)(!1);return(0,w.jsx)(y,{onSubmit:e=>{console.log(`Submit:`,e),t(!0),setTimeout(()=>t(!1),5e3)},isStopShown:e,onStop:()=>{console.log(`Stopped`),t(!1)},placeholder:`Send a message to start streaming...`})}},K={render:()=>{let e=[{key:`A`,label:`Yes`},{key:`B`,label:"Yes, and don’t ask again for `git add` commands"},{key:`C`,label:`No, and tell me what to do differently`}],[t,n]=(0,C.useState)(null);return(0,w.jsx)(y,{onSubmit:e=>{console.log(`Submit:`,e,`| Answer:`,t),alert(`Sent: "${e}"\nAnswer: ${t}`)},drawer:(0,w.jsx)(b,{count:1,label:`User feedback requested`,children:(0,w.jsx)(`div`,{style:{width:`100%`},children:(0,w.jsxs)(u,{children:[(0,w.jsx)(d,{label:(0,w.jsx)(i,{weight:`bold`,children:`Do you want to proceed?`})}),e.map(e=>(0,w.jsx)(d,{label:e.label,startContent:(0,w.jsx)(s,{variant:t===e.key?`info`:`neutral`,label:e.key}),isSelected:t===e.key,onClick:()=>n(e.key)},e.key))]})})})})}},q={render:()=>(0,w.jsx)(y,{elevation:`none`,onSubmit:e=>{console.log(`Submit:`,e)}})},J={name:`Readiness / disabled streaming on narrow viewport`,parameters:{layout:`fullscreen`,docs:{description:{story:`At a mobile viewport, editing is disabled while the explicit Stop action stays reachable. The play assertion clicks the real button and rejects horizontal overflow.`}}},globals:{viewport:{value:`mobile1`,isRotated:!1}},render:()=>(0,w.jsx)(S,{}),play:async({canvasElement:e})=>{let t=D(e),n=t.getByTestId(`disabled-streaming-composer`),r=n.getBoundingClientRect();T(r.left).toBeGreaterThanOrEqual(0),T(r.right).toBeLessThanOrEqual(window.innerWidth),T(n.scrollWidth).toBeLessThanOrEqual(n.clientWidth),await E.click(t.getByRole(`button`,{name:`Stop`})),T(t.getByTestId(`disabled-streaming-fixture`)).toHaveAttribute(`data-stop-requests`,`1`)}},M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
  render: () => <ChatComposer onSubmit={value => {
    console.log('Submit:', value);
    alert(\`Sent: \${value}\`);
  }} />
}`,...M.parameters?.docs?.source},description:{story:`Simplest usage — just onSubmit`,...M.parameters?.docs?.description}}},N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
  render: () => {
    const isCoarsePointer = typeof window !== 'undefined' && window.matchMedia?.('(pointer: coarse)').matches;
    return <ChatComposer onSubmit={value => console.log('Submit:', value)} input={<ChatComposerInput placeholder={isCoarsePointer ? 'Enter inserts a newline on touch — use Send' : 'Enter sends; Shift+Enter for a newline'} onKeyDown={e => {
      if (isCoarsePointer && e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
      }
    }} />} />;
  }
}`,...N.parameters?.docs?.source},description:{story:"Platform-specific Enter behavior. Pass a custom `ChatComposerInput` in the\n`input` slot and handle keys through `onKeyDown` — the single seam for\nplatform quirks. Here, on a touch keyboard we `preventDefault()` Enter so a\nsoft-keyboard Return inserts a newline instead of sending (and never strands\na multi-line prompt); on a pointer device Enter sends as usual. The same\nseam covers shortcuts like Cmd/Ctrl+Enter — just call submit yourself.\nIME composition is always respected regardless.",...N.parameters?.docs?.description}}},P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [isStreaming, setIsStreaming] = useState(true);
    return <ChatComposer onSubmit={value => {
      console.log('Submit:', value);
      setIsStreaming(true);
    }} isStopShown={isStreaming} onStop={() => {
      console.log('Stopped');
      setIsStreaming(false);
    }} />;
  }
}`,...P.parameters?.docs?.source},description:{story:`With streaming state and stop button`,...P.parameters?.docs?.description}}},F.parameters={...F.parameters,docs:{...F.parameters?.docs,source:{originalSource:`{
  render: () => <ChatComposer onSubmit={value => console.log('Submit:', value)} footerActions={<Button label="GPT-4" variant="ghost" size="md" />} sendActions={<Button label="Microphone" variant="ghost" size="md" icon={MicIcon} isIconOnly />} />
}`,...F.parameters?.docs?.source},description:{story:`With footer actions (model selector) and mic button`,...F.parameters?.docs?.description}}},I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{
  render: () => <ChatComposer onSubmit={value => console.log('Submit:', value)} drawer={<ChatComposerDrawer>
          <Token label="report.pdf" onRemove={() => {}} />
          <Token label="data.csv" onRemove={() => {}} />
        </ChatComposerDrawer>} headerActions={<Button label="Attach file" variant="ghost" size="sm" icon={PaperclipIcon} isIconOnly />} headerContext={<ProgressBar label="Context window" value={3} isLabelHidden />} />
}`,...I.parameters?.docs?.source},description:{story:`With attachment chips and a context toolbar`,...I.parameters?.docs?.description}}},L.parameters={...L.parameters,docs:{...L.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [isStreaming, setIsStreaming] = useState(false);
    return <ChatComposer onSubmit={value => {
      console.log('Submit:', value);
      setIsStreaming(true);
      setTimeout(() => setIsStreaming(false), 3000);
    }} isStopShown={isStreaming} onStop={() => setIsStreaming(false)} placeholder="Ask me anything..." drawer={<ChatComposerDrawer>
            <Token label="design-spec.pdf" onRemove={() => {}} />
          </ChatComposerDrawer>} headerActions={<>
            <Button label="Mention" variant="ghost" size="sm" icon={AtSignIcon} isIconOnly />
            <Button label="Attach file" variant="ghost" size="sm" icon={PaperclipIcon} isIconOnly />
          </>} headerContext={<ProgressBar label="Context window" value={3} isLabelHidden />} footerActions={<>
            <Button label="Auto" variant="ghost" size="md" />
            <Button label="Settings" variant="ghost" size="md" />
          </>} sendActions={<Button label="Microphone" variant="ghost" size="md" icon={MicIcon} isIconOnly />} />;
  }
}`,...L.parameters?.docs?.source},description:{story:`Full featured — all slots populated`,...L.parameters?.docs?.description}}},R.parameters={...R.parameters,docs:{...R.parameters?.docs,source:{originalSource:`{
  render: () => <ChatComposer onSubmit={() => {}} isDisabled placeholder="Composer is disabled" />
}`,...R.parameters?.docs?.source},description:{story:`Disabled state`,...R.parameters?.docs?.description}}},z.parameters={...z.parameters,docs:{...z.parameters?.docs,source:{originalSource:`{
  render: () => <ChatComposer onSubmit={value => console.log('Submit:', value)} drawer={<ChatComposerDrawer count={6}>
          <Token label="new_feature_prd.docx" onRemove={() => {}} />
          <Token label="2026_roadmap.docx" onRemove={() => {}} />
          <Token label="user_flow.pdf" onRemove={() => {}} />
          <Token label="launch_plan.docx" onRemove={() => {}} />
          <Token label="user_feedback.csv" onRemove={() => {}} />
          <Token label="kpis.csv" onRemove={() => {}} />
        </ChatComposerDrawer>} />
}`,...z.parameters?.docs?.source},description:{story:`With many attachments and collapsible drawer`,...z.parameters?.docs?.description}}},B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
  render: () => <ChatComposer onSubmit={value => console.log('Submit:', value)} status={{
    type: 'error',
    message: 'Failed to send message. Please try again.'
  }} />
}`,...B.parameters?.docs?.source},description:{story:`With error status`,...B.parameters?.docs?.description}}},V.parameters={...V.parameters,docs:{...V.parameters?.docs,source:{originalSource:`{
  render: () => <ChatComposer onSubmit={value => console.log('Submit:', value)} statusPosition="top" status={{
    type: 'warning',
    message: 'Context window is 90% full.'
  }} />
}`,...V.parameters?.docs?.source},description:{story:`With status on top`,...V.parameters?.docs?.description}}},H.parameters={...H.parameters,docs:{...H.parameters?.docs,source:{originalSource:`{
  render: () => <ChatComposer onSubmit={value => console.log('Submit:', value)} status={{
    type: 'error',
    message: 'Failed to send message. Please try again.'
  }} />
}`,...H.parameters?.docs?.source},description:{story:`With status on bottom`,...H.parameters?.docs?.description}}},U.parameters={...U.parameters,docs:{...U.parameters?.docs,source:{originalSource:`{
  render: () => <ChatComposer onSubmit={value => {
    console.log('Submit:', value);
    alert(\`Sent: \${value}\`);
  }} placeholder="Type to enable the send button..." />
}`,...U.parameters?.docs?.source},description:{story:`Default send button — reads from composer context automatically`,...U.parameters?.docs?.description}}},W.parameters={...W.parameters,docs:{...W.parameters?.docs,source:{originalSource:`{
  render: () => <ChatComposer onSubmit={value => console.log('Submit:', value)} sendButton={<ChatSendButton size="sm" onSend={() => alert('Custom send!')} />} />
}`,...W.parameters?.docs?.source},description:{story:`Custom send button via sendButton slot`,...W.parameters?.docs?.description}}},G.parameters={...G.parameters,docs:{...G.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [isStreaming, setIsStreaming] = useState(false);
    return <ChatComposer onSubmit={value => {
      console.log('Submit:', value);
      setIsStreaming(true);
      setTimeout(() => setIsStreaming(false), 5000);
    }} isStopShown={isStreaming} onStop={() => {
      console.log('Stopped');
      setIsStreaming(false);
    }} placeholder="Send a message to start streaming..." />;
  }
}`,...G.parameters?.docs?.source},description:{story:`Send/stop toggle — type text and submit to start streaming, click stop to end`,...G.parameters?.docs?.description}}},K.parameters={...K.parameters,docs:{...K.parameters?.docs,source:{originalSource:`{
  render: () => {
    const options = [{
      key: 'A',
      label: 'Yes'
    }, {
      key: 'B',
      label: 'Yes, and don\\u2019t ask again for \`git add\` commands'
    }, {
      key: 'C',
      label: 'No, and tell me what to do differently'
    }];
    const [selected, setSelected] = useState<string | null>(null);
    return <ChatComposer onSubmit={value => {
      console.log('Submit:', value, '| Answer:', selected);
      alert(\`Sent: "\${value}"\\nAnswer: \${selected}\`);
    }} drawer={<ChatComposerDrawer count={1} label="User feedback requested">
            <div style={{
        width: '100%'
      }}>
              <List>
                <ListItem label={<Text weight="bold">Do you want to proceed?</Text>} />
                {options.map(opt => <ListItem key={opt.key} label={opt.label} startContent={<Badge variant={selected === opt.key ? 'info' : 'neutral'} label={opt.key} />} isSelected={selected === opt.key} onClick={() => setSelected(opt.key)} />)}
              </List>
            </div>
          </ChatComposerDrawer>} />;
  }
}`,...K.parameters?.docs?.source},description:{story:`Drawer with a feedback prompt, warning badge, and selectable options`,...K.parameters?.docs?.description}}},q.parameters={...q.parameters,docs:{...q.parameters?.docs,source:{originalSource:`{
  render: () => <ChatComposer elevation="none" onSubmit={value => {
    console.log('Submit:', value);
  }} />
}`,...q.parameters?.docs?.source},description:{story:'Flat composer — `elevation="none"` drops the resting shadow so depth comes\nfrom the border and focus ring instead. The default is `low` (raised).',...q.parameters?.docs?.description}}},J.parameters={...J.parameters,docs:{...J.parameters?.docs,source:{originalSource:`{
  name: 'Readiness / disabled streaming on narrow viewport',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        story: 'At a mobile viewport, editing is disabled while the explicit Stop action stays reachable. The play assertion clicks the real button and rejects horizontal overflow.'
      }
    }
  },
  globals: {
    viewport: {
      value: 'mobile1',
      isRotated: false
    }
  },
  render: () => <DisabledStreamingFixture />,
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const composer = canvas.getByTestId('disabled-streaming-composer');
    const bounds = composer.getBoundingClientRect();
    expect(bounds.left).toBeGreaterThanOrEqual(0);
    expect(bounds.right).toBeLessThanOrEqual(window.innerWidth);
    expect(composer.scrollWidth).toBeLessThanOrEqual(composer.clientWidth);
    await userEvent.click(canvas.getByRole('button', {
      name: 'Stop'
    }));
    expect(canvas.getByTestId('disabled-streaming-fixture')).toHaveAttribute('data-stop-requests', '1');
  }
}`,...J.parameters?.docs?.source}}},Y=[`Simplest`,`EnterBehavior`,`WithStreaming`,`WithFooterActions`,`WithAttachments`,`FullFeatured`,`Disabled`,`WithManyAttachments`,`WithError`,`WithStatusTop`,`WithStatusBottom`,`DefaultSendButton`,`CustomSendButton`,`SendStopToggle`,`Feedback`,`Flat`,`DisabledStreamingNarrow`]}))();export{W as CustomSendButton,U as DefaultSendButton,R as Disabled,J as DisabledStreamingNarrow,N as EnterBehavior,K as Feedback,q as Flat,L as FullFeatured,G as SendStopToggle,M as Simplest,I as WithAttachments,B as WithError,F as WithFooterActions,z as WithManyAttachments,H as WithStatusBottom,V as WithStatusTop,P as WithStreaming,Y as __namedExportsOrder,j as default};