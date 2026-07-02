import{a1 as e,ah as f,T as B,B as n}from"./iframe-BzSUXdLu.js";import{C as s,b as T}from"./ChatComposer-D2_NHYyc.js";import{C as w}from"./ChatComposerDrawer-DlRY1CAa.js";import{T as a}from"./Token-C_5OZD9I.js";import{P as k}from"./ProgressBar-BO4klkFd.js";import{L as W}from"./List-C9SG2VGH.js";import{a as j}from"./ListItem-BUBKye_1.js";import{B as D}from"./Badge-BZ7TBgsR.js";import"./preload-helper-Ct5FWWRu.js";import"./index-Bpoftj0g.js";import"./index-B-NS6A_P.js";import"./usePopover-D1DHzVD0.js";import"./useFocusTrap-BLybHx1Z.js";import"./HoverCard-CNPZO9Km.js";import"./ChatContext-Dphi1SNI.js";import"./useInteractiveRole-DrhPSvmS.js";import"./Item-CeA2fTPg.js";import"./computeTargetAndRel-BlG0ENK0.js";const R=e.jsxs("svg",{width:"1em",height:"1em",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("circle",{cx:"12",cy:"12",r:"4"}),e.jsx("path",{d:"M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8"})]}),A=e.jsx("svg",{width:"1em",height:"1em",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round",children:e.jsx("path",{d:"m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"})}),I=e.jsxs("svg",{width:"1em",height:"1em",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("path",{d:"M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"}),e.jsx("path",{d:"M19 10v2a7 7 0 0 1-14 0v-2"}),e.jsx("line",{x1:"12",x2:"12",y1:"19",y2:"22"})]}),K={title:"Core/ChatComposer",component:s,tags:["autodocs"],parameters:{layout:"centered"},decorators:[t=>e.jsx("div",{style:{width:600,padding:40},children:e.jsx(t,{})})]},l={render:()=>e.jsx(s,{onSubmit:t=>{console.log("Submit:",t),alert(`Sent: ${t}`)}})},c={render:()=>{const[t,o]=f.useState(!0);return e.jsx(s,{onSubmit:i=>{console.log("Submit:",i),o(!0)},isStopShown:t,onStop:()=>{console.log("Stopped"),o(!1)}})}},d={render:()=>e.jsx(s,{onSubmit:t=>console.log("Submit:",t),footerActions:e.jsx(n,{label:"GPT-4",variant:"ghost",size:"md"}),sendActions:e.jsx(n,{label:"Microphone",variant:"ghost",size:"md",icon:I,isIconOnly:!0})})},m={render:()=>e.jsx(s,{onSubmit:t=>console.log("Submit:",t),drawer:e.jsxs(w,{children:[e.jsx(a,{label:"report.pdf",onRemove:()=>{}}),e.jsx(a,{label:"data.csv",onRemove:()=>{}})]}),headerActions:e.jsx(n,{label:"Attach file",variant:"ghost",size:"sm",icon:A,isIconOnly:!0}),headerContext:e.jsx(k,{label:"Context window",value:3,isLabelHidden:!0})})},u={render:()=>{const[t,o]=f.useState(!1);return e.jsx(s,{onSubmit:i=>{console.log("Submit:",i),o(!0),setTimeout(()=>o(!1),3e3)},isStopShown:t,onStop:()=>o(!1),placeholder:"Ask me anything...",drawer:e.jsx(w,{children:e.jsx(a,{label:"design-spec.pdf",onRemove:()=>{}})}),headerActions:e.jsxs(e.Fragment,{children:[e.jsx(n,{label:"Mention",variant:"ghost",size:"sm",icon:R,isIconOnly:!0}),e.jsx(n,{label:"Attach file",variant:"ghost",size:"sm",icon:A,isIconOnly:!0})]}),headerContext:e.jsx(k,{label:"Context window",value:3,isLabelHidden:!0}),footerActions:e.jsxs(e.Fragment,{children:[e.jsx(n,{label:"Auto",variant:"ghost",size:"md"}),e.jsx(n,{label:"Settings",variant:"ghost",size:"md"})]}),sendActions:e.jsx(n,{label:"Microphone",variant:"ghost",size:"md",icon:I,isIconOnly:!0})})}},p={render:()=>e.jsx(s,{onSubmit:()=>{},isDisabled:!0,placeholder:"Composer is disabled"})},S={render:()=>e.jsx(s,{onSubmit:t=>console.log("Submit:",t),drawer:e.jsxs(w,{count:6,children:[e.jsx(a,{label:"new_feature_prd.docx",onRemove:()=>{}}),e.jsx(a,{label:"2026_roadmap.docx",onRemove:()=>{}}),e.jsx(a,{label:"user_flow.pdf",onRemove:()=>{}}),e.jsx(a,{label:"launch_plan.docx",onRemove:()=>{}}),e.jsx(a,{label:"user_feedback.csv",onRemove:()=>{}}),e.jsx(a,{label:"kpis.csv",onRemove:()=>{}})]})})},g={render:()=>e.jsx(s,{onSubmit:t=>console.log("Submit:",t),status:{type:"error",message:"Failed to send message. Please try again."}})},h={render:()=>e.jsx(s,{onSubmit:t=>console.log("Submit:",t),statusPosition:"top",status:{type:"warning",message:"Context window is 90% full."}})},b={render:()=>e.jsx(s,{onSubmit:t=>console.log("Submit:",t),status:{type:"error",message:"Failed to send message. Please try again."}})},x={render:()=>e.jsx(s,{onSubmit:t=>{console.log("Submit:",t),alert(`Sent: ${t}`)},placeholder:"Type to enable the send button..."})},v={render:()=>e.jsx(s,{onSubmit:t=>console.log("Submit:",t),sendButton:e.jsx(T,{size:"sm",onSend:()=>alert("Custom send!")})})},C={render:()=>{const[t,o]=f.useState(!1);return e.jsx(s,{onSubmit:i=>{console.log("Submit:",i),o(!0),setTimeout(()=>o(!1),5e3)},isStopShown:t,onStop:()=>{console.log("Stopped"),o(!1)},placeholder:"Send a message to start streaming..."})}},y={render:()=>{const t=[{key:"A",label:"Yes"},{key:"B",label:"Yes, and don’t ask again for `git add` commands"},{key:"C",label:"No, and tell me what to do differently"}],[o,i]=f.useState(null);return e.jsx(s,{onSubmit:r=>{console.log("Submit:",r,"| Answer:",o),alert(`Sent: "${r}"
Answer: ${o}`)},drawer:e.jsx(w,{count:1,label:"User feedback requested",children:e.jsx("div",{style:{width:"100%"},children:e.jsxs(W,{children:[e.jsx(j,{label:e.jsx(B,{weight:"bold",children:"Do you want to proceed?"})}),t.map(r=>e.jsx(j,{label:r.label,startContent:e.jsx(D,{variant:o===r.key?"info":"neutral",label:r.key}),isSelected:o===r.key,onClick:()=>i(r.key)},r.key))]})})})})}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  render: () => <ChatComposer onSubmit={value => {
    console.log('Submit:', value);
    alert(\`Sent: \${value}\`);
  }} />
}`,...l.parameters?.docs?.source},description:{story:"Simplest usage — just onSubmit",...l.parameters?.docs?.description}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
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
}`,...c.parameters?.docs?.source},description:{story:"With streaming state and stop button",...c.parameters?.docs?.description}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  render: () => <ChatComposer onSubmit={value => console.log('Submit:', value)} footerActions={<Button label="GPT-4" variant="ghost" size="md" />} sendActions={<Button label="Microphone" variant="ghost" size="md" icon={MicIcon} isIconOnly />} />
}`,...d.parameters?.docs?.source},description:{story:"With footer actions (model selector) and mic button",...d.parameters?.docs?.description}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  render: () => <ChatComposer onSubmit={value => console.log('Submit:', value)} drawer={<ChatComposerDrawer>
          <Token label="report.pdf" onRemove={() => {}} />
          <Token label="data.csv" onRemove={() => {}} />
        </ChatComposerDrawer>} headerActions={<Button label="Attach file" variant="ghost" size="sm" icon={PaperclipIcon} isIconOnly />} headerContext={<ProgressBar label="Context window" value={3} isLabelHidden />} />
}`,...m.parameters?.docs?.source},description:{story:"With attachment chips and a context toolbar",...m.parameters?.docs?.description}}};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
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
}`,...u.parameters?.docs?.source},description:{story:"Full featured — all slots populated",...u.parameters?.docs?.description}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  render: () => <ChatComposer onSubmit={() => {}} isDisabled placeholder="Composer is disabled" />
}`,...p.parameters?.docs?.source},description:{story:"Disabled state",...p.parameters?.docs?.description}}};S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  render: () => <ChatComposer onSubmit={value => console.log('Submit:', value)} drawer={<ChatComposerDrawer count={6}>
          <Token label="new_feature_prd.docx" onRemove={() => {}} />
          <Token label="2026_roadmap.docx" onRemove={() => {}} />
          <Token label="user_flow.pdf" onRemove={() => {}} />
          <Token label="launch_plan.docx" onRemove={() => {}} />
          <Token label="user_feedback.csv" onRemove={() => {}} />
          <Token label="kpis.csv" onRemove={() => {}} />
        </ChatComposerDrawer>} />
}`,...S.parameters?.docs?.source},description:{story:"With many attachments and collapsible drawer",...S.parameters?.docs?.description}}};g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  render: () => <ChatComposer onSubmit={value => console.log('Submit:', value)} status={{
    type: 'error',
    message: 'Failed to send message. Please try again.'
  }} />
}`,...g.parameters?.docs?.source},description:{story:"With error status",...g.parameters?.docs?.description}}};h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  render: () => <ChatComposer onSubmit={value => console.log('Submit:', value)} statusPosition="top" status={{
    type: 'warning',
    message: 'Context window is 90% full.'
  }} />
}`,...h.parameters?.docs?.source},description:{story:"With status on top",...h.parameters?.docs?.description}}};b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  render: () => <ChatComposer onSubmit={value => console.log('Submit:', value)} status={{
    type: 'error',
    message: 'Failed to send message. Please try again.'
  }} />
}`,...b.parameters?.docs?.source},description:{story:"With status on bottom",...b.parameters?.docs?.description}}};x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  render: () => <ChatComposer onSubmit={value => {
    console.log('Submit:', value);
    alert(\`Sent: \${value}\`);
  }} placeholder="Type to enable the send button..." />
}`,...x.parameters?.docs?.source},description:{story:"Default send button — reads from composer context automatically",...x.parameters?.docs?.description}}};v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  render: () => <ChatComposer onSubmit={value => console.log('Submit:', value)} sendButton={<ChatSendButton size="sm" onSend={() => alert('Custom send!')} />} />
}`,...v.parameters?.docs?.source},description:{story:"Custom send button via sendButton slot",...v.parameters?.docs?.description}}};C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
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
}`,...C.parameters?.docs?.source},description:{story:"Send/stop toggle — type text and submit to start streaming, click stop to end",...C.parameters?.docs?.description}}};y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
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
}`,...y.parameters?.docs?.source},description:{story:"Drawer with a feedback prompt, warning badge, and selectable options",...y.parameters?.docs?.description}}};const Q=["Simplest","WithStreaming","WithFooterActions","WithAttachments","FullFeatured","Disabled","WithManyAttachments","WithError","WithStatusTop","WithStatusBottom","DefaultSendButton","CustomSendButton","SendStopToggle","Feedback"];export{v as CustomSendButton,x as DefaultSendButton,p as Disabled,y as Feedback,u as FullFeatured,C as SendStopToggle,l as Simplest,m as WithAttachments,g as WithError,d as WithFooterActions,S as WithManyAttachments,b as WithStatusBottom,h as WithStatusTop,c as WithStreaming,Q as __namedExportsOrder,K as default};
