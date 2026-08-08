import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{t}from"./react-BZJXY1be.js";import{a as n,i as r,n as i,o as a,r as o,t as s}from"./ChatComposer-Dto0vwmR.js";import{n as c,t as l}from"./Text-BfjtEFtP.js";import{t as u}from"./jsx-runtime-DeHZSEgm.js";import{n as d,t as f}from"./Button-BVMvoKVE.js";import{n as p,t as m}from"./Badge-QS1Y3zur.js";import{n as h,t as g}from"./ChatComposerDrawer-iOQ_tx6C.js";import{n as _,t as v}from"./ListItem-BfUeYEoi.js";import{n as y,t as b}from"./List-Df8FmdyT.js";import{n as x,t as S}from"./Token-Y_2gT4Oy.js";import{n as C,t as w}from"./ProgressBar-piumk1uG.js";var T,E,D,O,k,A,j,M,N,P,F,I,L,R,z,B,V,H,U,W,G,K,q;function J(){return(J=e((()=>{i(),h(),a(),r(),x(),d(),C(),y(),_(),c(),p(),T=t(),E=u(),D=(0,E.jsxs)(`svg`,{width:`1em`,height:`1em`,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:`1.5`,strokeLinecap:`round`,strokeLinejoin:`round`,children:[(0,E.jsx)(`circle`,{cx:`12`,cy:`12`,r:`4`}),(0,E.jsx)(`path`,{d:`M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8`})]}),O=(0,E.jsx)(`svg`,{width:`1em`,height:`1em`,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:`1.5`,strokeLinecap:`round`,strokeLinejoin:`round`,children:(0,E.jsx)(`path`,{d:`m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48`})}),k=(0,E.jsxs)(`svg`,{width:`1em`,height:`1em`,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:`1.5`,strokeLinecap:`round`,strokeLinejoin:`round`,children:[(0,E.jsx)(`path`,{d:`M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z`}),(0,E.jsx)(`path`,{d:`M19 10v2a7 7 0 0 1-14 0v-2`}),(0,E.jsx)(`line`,{x1:`12`,x2:`12`,y1:`19`,y2:`22`})]}),A={title:`Core/ChatComposer`,component:s,tags:[`autodocs`],parameters:{layout:`centered`},decorators:[e=>(0,E.jsx)(`div`,{style:{width:600,padding:40},children:(0,E.jsx)(e,{})})]},j={render:()=>(0,E.jsx)(s,{onSubmit:e=>{console.log(`Submit:`,e),alert(`Sent: ${e}`)}})},M={render:()=>{let e=typeof window<`u`&&window.matchMedia?.(`(pointer: coarse)`).matches;return(0,E.jsx)(s,{onSubmit:e=>console.log(`Submit:`,e),input:(0,E.jsx)(n,{placeholder:e?`Enter inserts a newline on touch — use Send`:`Enter sends; Shift+Enter for a newline`,onKeyDown:t=>{e&&t.key===`Enter`&&!t.shiftKey&&t.preventDefault()}})})}},N={render:()=>{let[e,t]=(0,T.useState)(!0);return(0,E.jsx)(s,{onSubmit:e=>{console.log(`Submit:`,e),t(!0)},isStopShown:e,onStop:()=>{console.log(`Stopped`),t(!1)}})}},P={render:()=>(0,E.jsx)(s,{onSubmit:e=>console.log(`Submit:`,e),footerActions:(0,E.jsx)(f,{label:`GPT-4`,variant:`ghost`,size:`md`}),sendActions:(0,E.jsx)(f,{label:`Microphone`,variant:`ghost`,size:`md`,icon:k,isIconOnly:!0})})},F={render:()=>(0,E.jsx)(s,{onSubmit:e=>console.log(`Submit:`,e),drawer:(0,E.jsxs)(g,{children:[(0,E.jsx)(S,{label:`report.pdf`,onRemove:()=>{}}),(0,E.jsx)(S,{label:`data.csv`,onRemove:()=>{}})]}),headerActions:(0,E.jsx)(f,{label:`Attach file`,variant:`ghost`,size:`sm`,icon:O,isIconOnly:!0}),headerContext:(0,E.jsx)(w,{label:`Context window`,value:3,isLabelHidden:!0})})},I={render:()=>{let[e,t]=(0,T.useState)(!1);return(0,E.jsx)(s,{onSubmit:e=>{console.log(`Submit:`,e),t(!0),setTimeout(()=>t(!1),3e3)},isStopShown:e,onStop:()=>t(!1),placeholder:`Ask me anything...`,drawer:(0,E.jsx)(g,{children:(0,E.jsx)(S,{label:`design-spec.pdf`,onRemove:()=>{}})}),headerActions:(0,E.jsxs)(E.Fragment,{children:[(0,E.jsx)(f,{label:`Mention`,variant:`ghost`,size:`sm`,icon:D,isIconOnly:!0}),(0,E.jsx)(f,{label:`Attach file`,variant:`ghost`,size:`sm`,icon:O,isIconOnly:!0})]}),headerContext:(0,E.jsx)(w,{label:`Context window`,value:3,isLabelHidden:!0}),footerActions:(0,E.jsxs)(E.Fragment,{children:[(0,E.jsx)(f,{label:`Auto`,variant:`ghost`,size:`md`}),(0,E.jsx)(f,{label:`Settings`,variant:`ghost`,size:`md`})]}),sendActions:(0,E.jsx)(f,{label:`Microphone`,variant:`ghost`,size:`md`,icon:k,isIconOnly:!0})})}},L={render:()=>(0,E.jsx)(s,{onSubmit:()=>{},isDisabled:!0,placeholder:`Composer is disabled`})},R={render:()=>(0,E.jsx)(s,{onSubmit:e=>console.log(`Submit:`,e),drawer:(0,E.jsxs)(g,{count:6,children:[(0,E.jsx)(S,{label:`new_feature_prd.docx`,onRemove:()=>{}}),(0,E.jsx)(S,{label:`2026_roadmap.docx`,onRemove:()=>{}}),(0,E.jsx)(S,{label:`user_flow.pdf`,onRemove:()=>{}}),(0,E.jsx)(S,{label:`launch_plan.docx`,onRemove:()=>{}}),(0,E.jsx)(S,{label:`user_feedback.csv`,onRemove:()=>{}}),(0,E.jsx)(S,{label:`kpis.csv`,onRemove:()=>{}})]})})},z={render:()=>(0,E.jsx)(s,{onSubmit:e=>console.log(`Submit:`,e),status:{type:`error`,message:`Failed to send message. Please try again.`}})},B={render:()=>(0,E.jsx)(s,{onSubmit:e=>console.log(`Submit:`,e),statusPosition:`top`,status:{type:`warning`,message:`Context window is 90% full.`}})},V={render:()=>(0,E.jsx)(s,{onSubmit:e=>console.log(`Submit:`,e),status:{type:`error`,message:`Failed to send message. Please try again.`}})},H={render:()=>(0,E.jsx)(s,{onSubmit:e=>{console.log(`Submit:`,e),alert(`Sent: ${e}`)},placeholder:`Type to enable the send button...`})},U={render:()=>(0,E.jsx)(s,{onSubmit:e=>console.log(`Submit:`,e),sendButton:(0,E.jsx)(o,{size:`sm`,onSend:()=>alert(`Custom send!`)})})},W={render:()=>{let[e,t]=(0,T.useState)(!1);return(0,E.jsx)(s,{onSubmit:e=>{console.log(`Submit:`,e),t(!0),setTimeout(()=>t(!1),5e3)},isStopShown:e,onStop:()=>{console.log(`Stopped`),t(!1)},placeholder:`Send a message to start streaming...`})}},G={render:()=>{let e=[{key:`A`,label:`Yes`},{key:`B`,label:"Yes, and don’t ask again for `git add` commands"},{key:`C`,label:`No, and tell me what to do differently`}],[t,n]=(0,T.useState)(null);return(0,E.jsx)(s,{onSubmit:e=>{console.log(`Submit:`,e,`| Answer:`,t),alert(`Sent: "${e}"\nAnswer: ${t}`)},drawer:(0,E.jsx)(g,{count:1,label:`User feedback requested`,children:(0,E.jsx)(`div`,{style:{width:`100%`},children:(0,E.jsxs)(b,{children:[(0,E.jsx)(v,{label:(0,E.jsx)(l,{weight:`bold`,children:`Do you want to proceed?`})}),e.map(e=>(0,E.jsx)(v,{label:e.label,startContent:(0,E.jsx)(m,{variant:t===e.key?`info`:`neutral`,label:e.key}),isSelected:t===e.key,onClick:()=>n(e.key)},e.key))]})})})})}},K={render:()=>(0,E.jsx)(s,{elevation:`none`,onSubmit:e=>{console.log(`Submit:`,e)}})},j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
  render: () => <ChatComposer onSubmit={value => {
    console.log('Submit:', value);
    alert(\`Sent: \${value}\`);
  }} />
}`,...j.parameters?.docs?.source},description:{story:`Simplest usage — just onSubmit`,...j.parameters?.docs?.description}}},M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
  render: () => {
    const isCoarsePointer = typeof window !== 'undefined' && window.matchMedia?.('(pointer: coarse)').matches;
    return <ChatComposer onSubmit={value => console.log('Submit:', value)} input={<ChatComposerInput placeholder={isCoarsePointer ? 'Enter inserts a newline on touch — use Send' : 'Enter sends; Shift+Enter for a newline'} onKeyDown={e => {
      if (isCoarsePointer && e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
      }
    }} />} />;
  }
}`,...M.parameters?.docs?.source},description:{story:"Platform-specific Enter behavior. Pass a custom `ChatComposerInput` in the\n`input` slot and handle keys through `onKeyDown` — the single seam for\nplatform quirks. Here, on a touch keyboard we `preventDefault()` Enter so a\nsoft-keyboard Return inserts a newline instead of sending (and never strands\na multi-line prompt); on a pointer device Enter sends as usual. The same\nseam covers shortcuts like Cmd/Ctrl+Enter — just call submit yourself.\nIME composition is always respected regardless.",...M.parameters?.docs?.description}}},N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
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
}`,...N.parameters?.docs?.source},description:{story:`With streaming state and stop button`,...N.parameters?.docs?.description}}},P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
  render: () => <ChatComposer onSubmit={value => console.log('Submit:', value)} footerActions={<Button label="GPT-4" variant="ghost" size="md" />} sendActions={<Button label="Microphone" variant="ghost" size="md" icon={MicIcon} isIconOnly />} />
}`,...P.parameters?.docs?.source},description:{story:`With footer actions (model selector) and mic button`,...P.parameters?.docs?.description}}},F.parameters={...F.parameters,docs:{...F.parameters?.docs,source:{originalSource:`{
  render: () => <ChatComposer onSubmit={value => console.log('Submit:', value)} drawer={<ChatComposerDrawer>
          <Token label="report.pdf" onRemove={() => {}} />
          <Token label="data.csv" onRemove={() => {}} />
        </ChatComposerDrawer>} headerActions={<Button label="Attach file" variant="ghost" size="sm" icon={PaperclipIcon} isIconOnly />} headerContext={<ProgressBar label="Context window" value={3} isLabelHidden />} />
}`,...F.parameters?.docs?.source},description:{story:`With attachment chips and a context toolbar`,...F.parameters?.docs?.description}}},I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{
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
}`,...I.parameters?.docs?.source},description:{story:`Full featured — all slots populated`,...I.parameters?.docs?.description}}},L.parameters={...L.parameters,docs:{...L.parameters?.docs,source:{originalSource:`{
  render: () => <ChatComposer onSubmit={() => {}} isDisabled placeholder="Composer is disabled" />
}`,...L.parameters?.docs?.source},description:{story:`Disabled state`,...L.parameters?.docs?.description}}},R.parameters={...R.parameters,docs:{...R.parameters?.docs,source:{originalSource:`{
  render: () => <ChatComposer onSubmit={value => console.log('Submit:', value)} drawer={<ChatComposerDrawer count={6}>
          <Token label="new_feature_prd.docx" onRemove={() => {}} />
          <Token label="2026_roadmap.docx" onRemove={() => {}} />
          <Token label="user_flow.pdf" onRemove={() => {}} />
          <Token label="launch_plan.docx" onRemove={() => {}} />
          <Token label="user_feedback.csv" onRemove={() => {}} />
          <Token label="kpis.csv" onRemove={() => {}} />
        </ChatComposerDrawer>} />
}`,...R.parameters?.docs?.source},description:{story:`With many attachments and collapsible drawer`,...R.parameters?.docs?.description}}},z.parameters={...z.parameters,docs:{...z.parameters?.docs,source:{originalSource:`{
  render: () => <ChatComposer onSubmit={value => console.log('Submit:', value)} status={{
    type: 'error',
    message: 'Failed to send message. Please try again.'
  }} />
}`,...z.parameters?.docs?.source},description:{story:`With error status`,...z.parameters?.docs?.description}}},B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
  render: () => <ChatComposer onSubmit={value => console.log('Submit:', value)} statusPosition="top" status={{
    type: 'warning',
    message: 'Context window is 90% full.'
  }} />
}`,...B.parameters?.docs?.source},description:{story:`With status on top`,...B.parameters?.docs?.description}}},V.parameters={...V.parameters,docs:{...V.parameters?.docs,source:{originalSource:`{
  render: () => <ChatComposer onSubmit={value => console.log('Submit:', value)} status={{
    type: 'error',
    message: 'Failed to send message. Please try again.'
  }} />
}`,...V.parameters?.docs?.source},description:{story:`With status on bottom`,...V.parameters?.docs?.description}}},H.parameters={...H.parameters,docs:{...H.parameters?.docs,source:{originalSource:`{
  render: () => <ChatComposer onSubmit={value => {
    console.log('Submit:', value);
    alert(\`Sent: \${value}\`);
  }} placeholder="Type to enable the send button..." />
}`,...H.parameters?.docs?.source},description:{story:`Default send button — reads from composer context automatically`,...H.parameters?.docs?.description}}},U.parameters={...U.parameters,docs:{...U.parameters?.docs,source:{originalSource:`{
  render: () => <ChatComposer onSubmit={value => console.log('Submit:', value)} sendButton={<ChatSendButton size="sm" onSend={() => alert('Custom send!')} />} />
}`,...U.parameters?.docs?.source},description:{story:`Custom send button via sendButton slot`,...U.parameters?.docs?.description}}},W.parameters={...W.parameters,docs:{...W.parameters?.docs,source:{originalSource:`{
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
}`,...W.parameters?.docs?.source},description:{story:`Send/stop toggle — type text and submit to start streaming, click stop to end`,...W.parameters?.docs?.description}}},G.parameters={...G.parameters,docs:{...G.parameters?.docs,source:{originalSource:`{
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
}`,...G.parameters?.docs?.source},description:{story:`Drawer with a feedback prompt, warning badge, and selectable options`,...G.parameters?.docs?.description}}},K.parameters={...K.parameters,docs:{...K.parameters?.docs,source:{originalSource:`{
  render: () => <ChatComposer elevation="none" onSubmit={value => {
    console.log('Submit:', value);
  }} />
}`,...K.parameters?.docs?.source},description:{story:'Flat composer — `elevation="none"` drops the resting shadow so depth comes\nfrom the border and focus ring instead. The default is `low` (raised).',...K.parameters?.docs?.description}}},q=[`Simplest`,`EnterBehavior`,`WithStreaming`,`WithFooterActions`,`WithAttachments`,`FullFeatured`,`Disabled`,`WithManyAttachments`,`WithError`,`WithStatusTop`,`WithStatusBottom`,`DefaultSendButton`,`CustomSendButton`,`SendStopToggle`,`Feedback`,`Flat`]})))()}J();export{U as CustomSendButton,H as DefaultSendButton,L as Disabled,M as EnterBehavior,G as Feedback,K as Flat,I as FullFeatured,W as SendStopToggle,j as Simplest,F as WithAttachments,z as WithError,P as WithFooterActions,R as WithManyAttachments,V as WithStatusBottom,B as WithStatusTop,N as WithStreaming,q as __namedExportsOrder,A as default};