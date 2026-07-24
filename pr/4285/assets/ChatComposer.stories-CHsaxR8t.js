import{i as e,s as t}from"./preload-helper-CT_b8DTk.js";import{t as n}from"./react-B7Te67-h.js";import{t as r}from"./jsx-runtime-DqZldVDK.js";import{t as i}from"./Text-Iat6xWeA.js";import{t as a}from"./Button-BBk5Kqd0.js";import{t as o}from"./Button-CRpvXAU4.js";import{n as s,t as c}from"./Badge-x089lqwb.js";import{t as l}from"./Text-BUJwo4gL.js";import{r as u,t as d}from"./ListItem-B04E78Mx.js";import{n as f,t as p}from"./Token-BXBfAklS.js";import{Jr as m,Kr as h,N as g,P as _,Qr as v,Tr as y,Xr as b,rr as x}from"./iframe-BPhJd9TG.js";var S,C,w,T,E,D,O,k,A,j,M,N,P,F,I,L,R,z,B,V,H,U,W;e((()=>{y(),p(),o(),g(),x(),l(),c(),S=t(n()),C=r(),w=(0,C.jsxs)(`svg`,{width:`1em`,height:`1em`,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:`1.5`,strokeLinecap:`round`,strokeLinejoin:`round`,children:[(0,C.jsx)(`circle`,{cx:`12`,cy:`12`,r:`4`}),(0,C.jsx)(`path`,{d:`M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8`})]}),T=(0,C.jsx)(`svg`,{width:`1em`,height:`1em`,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:`1.5`,strokeLinecap:`round`,strokeLinejoin:`round`,children:(0,C.jsx)(`path`,{d:`m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48`})}),E=(0,C.jsxs)(`svg`,{width:`1em`,height:`1em`,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:`1.5`,strokeLinecap:`round`,strokeLinejoin:`round`,children:[(0,C.jsx)(`path`,{d:`M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z`}),(0,C.jsx)(`path`,{d:`M19 10v2a7 7 0 0 1-14 0v-2`}),(0,C.jsx)(`line`,{x1:`12`,x2:`12`,y1:`19`,y2:`22`})]}),D={title:`Core/ChatComposer`,component:m,tags:[`autodocs`],parameters:{layout:`centered`},decorators:[e=>(0,C.jsx)(`div`,{style:{width:600,padding:40},children:(0,C.jsx)(e,{})})]},O={render:()=>(0,C.jsx)(m,{onSubmit:e=>{console.log(`Submit:`,e),alert(`Sent: ${e}`)}})},k={render:()=>{let e=typeof window<`u`&&window.matchMedia?.(`(pointer: coarse)`).matches;return(0,C.jsx)(m,{onSubmit:e=>console.log(`Submit:`,e),input:(0,C.jsx)(v,{placeholder:e?`Enter inserts a newline on touch — use Send`:`Enter sends; Shift+Enter for a newline`,onKeyDown:t=>{e&&t.key===`Enter`&&!t.shiftKey&&t.preventDefault()}})})}},A={render:()=>{let[e,t]=(0,S.useState)(!0);return(0,C.jsx)(m,{onSubmit:e=>{console.log(`Submit:`,e),t(!0)},isStopShown:e,onStop:()=>{console.log(`Stopped`),t(!1)}})}},j={render:()=>(0,C.jsx)(m,{onSubmit:e=>console.log(`Submit:`,e),footerActions:(0,C.jsx)(a,{label:`GPT-4`,variant:`ghost`,size:`md`}),sendActions:(0,C.jsx)(a,{label:`Microphone`,variant:`ghost`,size:`md`,icon:E,isIconOnly:!0})})},M={render:()=>(0,C.jsx)(m,{onSubmit:e=>console.log(`Submit:`,e),drawer:(0,C.jsxs)(h,{children:[(0,C.jsx)(f,{label:`report.pdf`,onRemove:()=>{}}),(0,C.jsx)(f,{label:`data.csv`,onRemove:()=>{}})]}),headerActions:(0,C.jsx)(a,{label:`Attach file`,variant:`ghost`,size:`sm`,icon:T,isIconOnly:!0}),headerContext:(0,C.jsx)(_,{label:`Context window`,value:3,isLabelHidden:!0})})},N={render:()=>{let[e,t]=(0,S.useState)(!1);return(0,C.jsx)(m,{onSubmit:e=>{console.log(`Submit:`,e),t(!0),setTimeout(()=>t(!1),3e3)},isStopShown:e,onStop:()=>t(!1),placeholder:`Ask me anything...`,drawer:(0,C.jsx)(h,{children:(0,C.jsx)(f,{label:`design-spec.pdf`,onRemove:()=>{}})}),headerActions:(0,C.jsxs)(C.Fragment,{children:[(0,C.jsx)(a,{label:`Mention`,variant:`ghost`,size:`sm`,icon:w,isIconOnly:!0}),(0,C.jsx)(a,{label:`Attach file`,variant:`ghost`,size:`sm`,icon:T,isIconOnly:!0})]}),headerContext:(0,C.jsx)(_,{label:`Context window`,value:3,isLabelHidden:!0}),footerActions:(0,C.jsxs)(C.Fragment,{children:[(0,C.jsx)(a,{label:`Auto`,variant:`ghost`,size:`md`}),(0,C.jsx)(a,{label:`Settings`,variant:`ghost`,size:`md`})]}),sendActions:(0,C.jsx)(a,{label:`Microphone`,variant:`ghost`,size:`md`,icon:E,isIconOnly:!0})})}},P={render:()=>(0,C.jsx)(m,{onSubmit:()=>{},isDisabled:!0,placeholder:`Composer is disabled`})},F={render:()=>(0,C.jsx)(m,{onSubmit:e=>console.log(`Submit:`,e),drawer:(0,C.jsxs)(h,{count:6,children:[(0,C.jsx)(f,{label:`new_feature_prd.docx`,onRemove:()=>{}}),(0,C.jsx)(f,{label:`2026_roadmap.docx`,onRemove:()=>{}}),(0,C.jsx)(f,{label:`user_flow.pdf`,onRemove:()=>{}}),(0,C.jsx)(f,{label:`launch_plan.docx`,onRemove:()=>{}}),(0,C.jsx)(f,{label:`user_feedback.csv`,onRemove:()=>{}}),(0,C.jsx)(f,{label:`kpis.csv`,onRemove:()=>{}})]})})},I={render:()=>(0,C.jsx)(m,{onSubmit:e=>console.log(`Submit:`,e),status:{type:`error`,message:`Failed to send message. Please try again.`}})},L={render:()=>(0,C.jsx)(m,{onSubmit:e=>console.log(`Submit:`,e),statusPosition:`top`,status:{type:`warning`,message:`Context window is 90% full.`}})},R={render:()=>(0,C.jsx)(m,{onSubmit:e=>console.log(`Submit:`,e),status:{type:`error`,message:`Failed to send message. Please try again.`}})},z={render:()=>(0,C.jsx)(m,{onSubmit:e=>{console.log(`Submit:`,e),alert(`Sent: ${e}`)},placeholder:`Type to enable the send button...`})},B={render:()=>(0,C.jsx)(m,{onSubmit:e=>console.log(`Submit:`,e),sendButton:(0,C.jsx)(b,{size:`sm`,onSend:()=>alert(`Custom send!`)})})},V={render:()=>{let[e,t]=(0,S.useState)(!1);return(0,C.jsx)(m,{onSubmit:e=>{console.log(`Submit:`,e),t(!0),setTimeout(()=>t(!1),5e3)},isStopShown:e,onStop:()=>{console.log(`Stopped`),t(!1)},placeholder:`Send a message to start streaming...`})}},H={render:()=>{let e=[{key:`A`,label:`Yes`},{key:`B`,label:"Yes, and don’t ask again for `git add` commands"},{key:`C`,label:`No, and tell me what to do differently`}],[t,n]=(0,S.useState)(null);return(0,C.jsx)(m,{onSubmit:e=>{console.log(`Submit:`,e,`| Answer:`,t),alert(`Sent: "${e}"\nAnswer: ${t}`)},drawer:(0,C.jsx)(h,{count:1,label:`User feedback requested`,children:(0,C.jsx)(`div`,{style:{width:`100%`},children:(0,C.jsxs)(u,{children:[(0,C.jsx)(d,{label:(0,C.jsx)(i,{weight:`bold`,children:`Do you want to proceed?`})}),e.map(e=>(0,C.jsx)(d,{label:e.label,startContent:(0,C.jsx)(s,{variant:t===e.key?`info`:`neutral`,label:e.key}),isSelected:t===e.key,onClick:()=>n(e.key)},e.key))]})})})})}},U={render:()=>(0,C.jsx)(m,{elevation:`none`,onSubmit:e=>{console.log(`Submit:`,e)}})},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
  render: () => <ChatComposer onSubmit={value => {
    console.log('Submit:', value);
    alert(\`Sent: \${value}\`);
  }} />
}`,...O.parameters?.docs?.source},description:{story:`Simplest usage — just onSubmit`,...O.parameters?.docs?.description}}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  render: () => {
    const isCoarsePointer = typeof window !== 'undefined' && window.matchMedia?.('(pointer: coarse)').matches;
    return <ChatComposer onSubmit={value => console.log('Submit:', value)} input={<ChatComposerInput placeholder={isCoarsePointer ? 'Enter inserts a newline on touch — use Send' : 'Enter sends; Shift+Enter for a newline'} onKeyDown={e => {
      if (isCoarsePointer && e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
      }
    }} />} />;
  }
}`,...k.parameters?.docs?.source},description:{story:"Platform-specific Enter behavior. Pass a custom `ChatComposerInput` in the\n`input` slot and handle keys through `onKeyDown` — the single seam for\nplatform quirks. Here, on a touch keyboard we `preventDefault()` Enter so a\nsoft-keyboard Return inserts a newline instead of sending (and never strands\na multi-line prompt); on a pointer device Enter sends as usual. The same\nseam covers shortcuts like Cmd/Ctrl+Enter — just call submit yourself.\nIME composition is always respected regardless.",...k.parameters?.docs?.description}}},A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
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
}`,...A.parameters?.docs?.source},description:{story:`With streaming state and stop button`,...A.parameters?.docs?.description}}},j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
  render: () => <ChatComposer onSubmit={value => console.log('Submit:', value)} footerActions={<Button label="GPT-4" variant="ghost" size="md" />} sendActions={<Button label="Microphone" variant="ghost" size="md" icon={MicIcon} isIconOnly />} />
}`,...j.parameters?.docs?.source},description:{story:`With footer actions (model selector) and mic button`,...j.parameters?.docs?.description}}},M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
  render: () => <ChatComposer onSubmit={value => console.log('Submit:', value)} drawer={<ChatComposerDrawer>
          <Token label="report.pdf" onRemove={() => {}} />
          <Token label="data.csv" onRemove={() => {}} />
        </ChatComposerDrawer>} headerActions={<Button label="Attach file" variant="ghost" size="sm" icon={PaperclipIcon} isIconOnly />} headerContext={<ProgressBar label="Context window" value={3} isLabelHidden />} />
}`,...M.parameters?.docs?.source},description:{story:`With attachment chips and a context toolbar`,...M.parameters?.docs?.description}}},N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
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
}`,...N.parameters?.docs?.source},description:{story:`Full featured — all slots populated`,...N.parameters?.docs?.description}}},P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
  render: () => <ChatComposer onSubmit={() => {}} isDisabled placeholder="Composer is disabled" />
}`,...P.parameters?.docs?.source},description:{story:`Disabled state`,...P.parameters?.docs?.description}}},F.parameters={...F.parameters,docs:{...F.parameters?.docs,source:{originalSource:`{
  render: () => <ChatComposer onSubmit={value => console.log('Submit:', value)} drawer={<ChatComposerDrawer count={6}>
          <Token label="new_feature_prd.docx" onRemove={() => {}} />
          <Token label="2026_roadmap.docx" onRemove={() => {}} />
          <Token label="user_flow.pdf" onRemove={() => {}} />
          <Token label="launch_plan.docx" onRemove={() => {}} />
          <Token label="user_feedback.csv" onRemove={() => {}} />
          <Token label="kpis.csv" onRemove={() => {}} />
        </ChatComposerDrawer>} />
}`,...F.parameters?.docs?.source},description:{story:`With many attachments and collapsible drawer`,...F.parameters?.docs?.description}}},I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{
  render: () => <ChatComposer onSubmit={value => console.log('Submit:', value)} status={{
    type: 'error',
    message: 'Failed to send message. Please try again.'
  }} />
}`,...I.parameters?.docs?.source},description:{story:`With error status`,...I.parameters?.docs?.description}}},L.parameters={...L.parameters,docs:{...L.parameters?.docs,source:{originalSource:`{
  render: () => <ChatComposer onSubmit={value => console.log('Submit:', value)} statusPosition="top" status={{
    type: 'warning',
    message: 'Context window is 90% full.'
  }} />
}`,...L.parameters?.docs?.source},description:{story:`With status on top`,...L.parameters?.docs?.description}}},R.parameters={...R.parameters,docs:{...R.parameters?.docs,source:{originalSource:`{
  render: () => <ChatComposer onSubmit={value => console.log('Submit:', value)} status={{
    type: 'error',
    message: 'Failed to send message. Please try again.'
  }} />
}`,...R.parameters?.docs?.source},description:{story:`With status on bottom`,...R.parameters?.docs?.description}}},z.parameters={...z.parameters,docs:{...z.parameters?.docs,source:{originalSource:`{
  render: () => <ChatComposer onSubmit={value => {
    console.log('Submit:', value);
    alert(\`Sent: \${value}\`);
  }} placeholder="Type to enable the send button..." />
}`,...z.parameters?.docs?.source},description:{story:`Default send button — reads from composer context automatically`,...z.parameters?.docs?.description}}},B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
  render: () => <ChatComposer onSubmit={value => console.log('Submit:', value)} sendButton={<ChatSendButton size="sm" onSend={() => alert('Custom send!')} />} />
}`,...B.parameters?.docs?.source},description:{story:`Custom send button via sendButton slot`,...B.parameters?.docs?.description}}},V.parameters={...V.parameters,docs:{...V.parameters?.docs,source:{originalSource:`{
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
}`,...V.parameters?.docs?.source},description:{story:`Send/stop toggle — type text and submit to start streaming, click stop to end`,...V.parameters?.docs?.description}}},H.parameters={...H.parameters,docs:{...H.parameters?.docs,source:{originalSource:`{
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
}`,...H.parameters?.docs?.source},description:{story:`Drawer with a feedback prompt, warning badge, and selectable options`,...H.parameters?.docs?.description}}},U.parameters={...U.parameters,docs:{...U.parameters?.docs,source:{originalSource:`{
  render: () => <ChatComposer elevation="none" onSubmit={value => {
    console.log('Submit:', value);
  }} />
}`,...U.parameters?.docs?.source},description:{story:'Flat composer — `elevation="none"` drops the resting shadow so depth comes\nfrom the border and focus ring instead. The default is `low` (raised).',...U.parameters?.docs?.description}}},W=[`Simplest`,`EnterBehavior`,`WithStreaming`,`WithFooterActions`,`WithAttachments`,`FullFeatured`,`Disabled`,`WithManyAttachments`,`WithError`,`WithStatusTop`,`WithStatusBottom`,`DefaultSendButton`,`CustomSendButton`,`SendStopToggle`,`Feedback`,`Flat`]}))();export{B as CustomSendButton,z as DefaultSendButton,P as Disabled,k as EnterBehavior,H as Feedback,U as Flat,N as FullFeatured,V as SendStopToggle,O as Simplest,M as WithAttachments,I as WithError,j as WithFooterActions,F as WithManyAttachments,R as WithStatusBottom,L as WithStatusTop,A as WithStreaming,W as __namedExportsOrder,D as default};