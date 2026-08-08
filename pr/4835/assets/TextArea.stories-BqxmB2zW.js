import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{t}from"./react-BZJXY1be.js";import{t as n}from"./jsx-runtime-DeHZSEgm.js";import{n as r,t as i}from"./TextInput-BwKW_f5i.js";import{n as a,t as o}from"./Selector-CXBa_P0j.js";import{n as s,t as c}from"./FormLayout-BpN46Ael.js";import{n as l,t as u}from"./TextArea-D_j0AEIi.js";import{i as d,n as f,r as p,t as m}from"./PencilSquareIcon-BKDZE26W.js";import{n as h,t as g}from"./DocumentTextIcon-dAtzgXPS.js";var _,v,y,b,x,S,C,w,T,E,D,O,k,A,j,M,N,P,F,I,L,R,z,B,V,H,U,W,G,K,q,J,Y,X;function Z(){return(Z=e((()=>{_=t(),l(),r(),a(),s(),h(),d(),f(),v=n(),y={title:`Core/TextArea`,component:u,tags:[`autodocs`],argTypes:{label:{control:`text`,description:`Label text (required)`},isLabelHidden:{control:`boolean`,description:`Visually hide the label (still accessible to screen readers)`},placeholder:{control:`text`,description:`Placeholder text`},description:{control:`text`,description:`Description text displayed between the label and textarea`},value:{control:`text`,description:`Current textarea value (required)`},isOptional:{control:`boolean`,description:`Whether the field is optional (mutually exclusive with isRequired)`},isRequired:{control:`boolean`,description:`Whether the field is required (mutually exclusive with isOptional)`},rows:{control:`number`,description:`Number of visible text rows (default: 3)`},isDisabled:{control:`boolean`,description:`Whether the textarea is disabled`},disabledMessage:{control:`text`,description:`Explains why the textarea is disabled. With isDisabled, shows a tooltip on hover/keyboard focus and keeps the textarea focusable via aria-disabled (the field becomes read-only). Use this instead of wrapping a disabled TextArea in Tooltip.`},status:{control:`object`,description:`Status indicator with type (warning/error/success) and optional message`},labelTooltip:{control:`text`,description:`Tooltip text to display in an info icon at the end of the label`},hasSpellCheck:{control:`boolean`,description:`Whether to enable browser spell checking (default: true)`},maxLength:{control:`number`,description:`Maximum number of characters allowed. Displays a counter when set.`},size:{control:`radio`,options:[`sm`,`md`,`lg`],description:`Textarea size (affects padding, not height)`}}},b={render:e=>{let[t,n]=(0,_.useState)(e.value??``);return(0,v.jsx)(u,{...e,value:t,onChange:n})},args:{label:`Description`,placeholder:`Enter a description...`}},x={render:e=>{let[t,n]=(0,_.useState)(e.value??``);return(0,v.jsx)(u,{...e,value:t,onChange:n})},args:{label:`Bio`,description:`Tell us about yourself in a few sentences.`,placeholder:`Write your bio here...`}},S={render:e=>{let[t,n]=(0,_.useState)(e.value??``);return(0,v.jsx)(u,{...e,value:t,onChange:n})},args:{label:`Comments`,isLabelHidden:!0,placeholder:`Add a comment...`}},C={render:e=>{let[t,n]=(0,_.useState)(e.value??`This is a pre-filled textarea with some content that demonstrates how the component handles existing text.`);return(0,v.jsx)(u,{...e,value:t,onChange:n})},args:{label:`Notes`,value:`This is a pre-filled textarea with some content that demonstrates how the component handles existing text.`}},w={render:e=>{let[t,n]=(0,_.useState)(e.value??``);return(0,v.jsx)(u,{...e,value:t,onChange:n})},args:{label:`Message`,rows:6,placeholder:`Write a longer message...`}},T={render:()=>{let[e,t]=(0,_.useState)(``),[n,r]=(0,_.useState)(``),[i,a]=(0,_.useState)(`Pre-filled content in the textarea.`),[o,s]=(0,_.useState)(``),[c,l]=(0,_.useState)(``),[d,f]=(0,_.useState)(``),[p,m]=(0,_.useState)(``),[h,g]=(0,_.useState)(``),[y,b]=(0,_.useState)(`This field is disabled`);return(0,v.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`16px`,maxWidth:`400px`},children:[(0,v.jsx)(u,{label:`Visible label`,value:e,onChange:t,placeholder:`Enter text...`}),(0,v.jsx)(u,{label:`With description`,description:`Helpful description text`,value:o,onChange:s,placeholder:`Enter text...`}),(0,v.jsx)(u,{label:`Hidden label`,isLabelHidden:!0,value:n,onChange:r,placeholder:`Hidden label textarea`}),(0,v.jsx)(u,{label:`With value`,value:i,onChange:a}),(0,v.jsx)(u,{label:`Optional field`,isOptional:!0,value:c,onChange:l,placeholder:`Optional...`}),(0,v.jsx)(u,{label:`Required field`,isRequired:!0,value:d,onChange:f,placeholder:`Required...`}),(0,v.jsx)(u,{label:`Description with optional`,description:`Additional notes`,isOptional:!0,value:p,onChange:m,placeholder:`Notes...`}),(0,v.jsx)(u,{label:`Custom rows (6)`,rows:6,value:h,onChange:g,placeholder:`Larger textarea...`}),(0,v.jsx)(u,{label:`Disabled field`,isDisabled:!0,value:y,onChange:b})]})}},E={render:e=>{let[t,n]=(0,_.useState)(e.value??``);return(0,v.jsx)(u,{...e,value:t,onChange:n})},args:{label:`Additional Notes`,isOptional:!0,placeholder:`Any additional notes...`}},D={render:e=>{let[t,n]=(0,_.useState)(e.value??``);return(0,v.jsx)(u,{...e,value:t,onChange:n})},args:{label:`Feedback`,isRequired:!0,placeholder:`Please provide your feedback...`}},O={render:e=>{let[t,n]=(0,_.useState)(e.value??``);return(0,v.jsx)(u,{...e,value:t,onChange:n})},args:{label:`Comments`,description:`Share any additional thoughts or comments`,isOptional:!0,placeholder:`Your comments here...`}},k={render:e=>{let[t,n]=(0,_.useState)(e.value??`This textarea is disabled and cannot be edited.`);return(0,v.jsx)(u,{...e,value:t,onChange:n})},args:{label:`Disabled Field`,isDisabled:!0,value:`This textarea is disabled and cannot be edited.`}},A={render:e=>{let[t,n]=(0,_.useState)(e.value??`These notes are locked after submission.`);return(0,v.jsx)(u,{...e,value:t,onChange:n})},args:{label:`Notes`,isDisabled:!0,disabledMessage:`Notes are locked after submission`,value:`These notes are locked after submission.`}},j={render:e=>{let[t,n]=(0,_.useState)(e.value??``);return(0,v.jsx)(u,{...e,value:t,onChange:n})},args:{label:`Notes`,placeholder:`Enter your notes...`,startIcon:g}},M={render:()=>{let[e,t]=(0,_.useState)(``),[n,r]=(0,_.useState)(``),[i,a]=(0,_.useState)(``);return(0,v.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`16px`,maxWidth:`400px`},children:[(0,v.jsx)(u,{label:`Notes`,value:e,onChange:t,placeholder:`Enter your notes...`,startIcon:g}),(0,v.jsx)(u,{label:`Message`,value:n,onChange:r,placeholder:`Type your message...`,startIcon:p}),(0,v.jsx)(u,{label:`Draft`,value:i,onChange:a,placeholder:`Write your draft...`,startIcon:m})]})}},N={render:e=>{let[t,n]=(0,_.useState)(e.value??`Too short`);return(0,v.jsx)(u,{...e,value:t,onChange:n})},args:{label:`Description`,placeholder:`Enter a description...`,status:{type:`error`,message:`Description must be at least 50 characters`}}},P={render:e=>{let[t,n]=(0,_.useState)(e.value??`This content may contain issues`);return(0,v.jsx)(u,{...e,value:t,onChange:n})},args:{label:`Content`,placeholder:`Enter content...`,status:{type:`warning`,message:`Content may need review before publishing`}}},F={render:e=>{let[t,n]=(0,_.useState)(e.value??`This is a valid description that meets all requirements.`);return(0,v.jsx)(u,{...e,value:t,onChange:n})},args:{label:`Description`,placeholder:`Enter a description...`,status:{type:`success`,message:`Description looks good!`}}},I={render:e=>{let[t,n]=(0,_.useState)(e.value??`Invalid content`);return(0,v.jsx)(u,{...e,value:t,onChange:n})},args:{label:`Field`,placeholder:`Enter value`,status:{type:`error`}}},L={render:()=>{let[e,t]=(0,_.useState)(`Too short`),[n,r]=(0,_.useState)(`This may need review`),[i,a]=(0,_.useState)(`This description meets all the requirements perfectly.`),[o,s]=(0,_.useState)(`Invalid`);return(0,v.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`16px`,maxWidth:`400px`},children:[(0,v.jsx)(u,{label:`Error with message`,value:e,onChange:t,status:{type:`error`,message:`Must be at least 50 characters`}}),(0,v.jsx)(u,{label:`Warning with message`,value:n,onChange:r,status:{type:`warning`,message:`Content may need review`}}),(0,v.jsx)(u,{label:`Success with message`,value:i,onChange:a,status:{type:`success`,message:`Description is valid`}}),(0,v.jsx)(u,{label:`Error without message`,value:o,onChange:s,status:{type:`error`}})]})}},R={render:e=>{let[t,n]=(0,_.useState)(e.value??``);return(0,v.jsx)(u,{...e,value:t,onChange:n})},args:{label:`API Documentation`,placeholder:`Describe your API endpoint...`,labelTooltip:`Provide a detailed description of what this API endpoint does, including expected inputs and outputs.`}},z={render:e=>{let[t,n]=(0,_.useState)(e.value??``);return(0,v.jsx)(u,{...e,value:t,onChange:n})},args:{label:`Additional Notes`,placeholder:`Any additional information...`,labelTooltip:`Include any extra details that might be helpful for reviewers.`,isOptional:!0}},B={render:e=>{let[t,n]=(0,_.useState)(e.value??`Saving your changes…`);return(0,v.jsx)(u,{...e,value:t,onChange:n})},args:{label:`Description`,placeholder:`Enter a description...`,isLoading:!0}},V={render:()=>{let[e,t]=(0,_.useState)(`Too short`),[n,r]=(0,_.useState)(!0);return(0,v.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:12,width:360},children:[(0,v.jsxs)(`label`,{style:{display:`flex`,alignItems:`center`,gap:8},children:[(0,v.jsx)(`input`,{type:`checkbox`,checked:n,onChange:e=>r(e.target.checked)}),`isLoading`]}),(0,v.jsx)(u,{label:`Description`,value:e,onChange:t,isLoading:n,status:{type:`error`,message:`Description must be at least 50 characters`}})]})}},H={render:()=>{let[e,t]=(0,_.useState)(``);return(0,v.jsx)(`div`,{style:{maxWidth:`400px`},children:(0,v.jsx)(u,{label:`Detailed Description`,description:`Provide a comprehensive description of your project`,value:e,onChange:t,placeholder:`Enter description...`,startIcon:g,labelTooltip:`This description will be visible to all team members`,isRequired:!0,status:e.length>0&&e.length<20?{type:`warning`,message:`Consider adding more detail`}:e.length>=20?{type:`success`,message:`Description looks good!`}:void 0})})}},U={render:()=>{let[e,t]=(0,_.useState)(``),[n,r]=(0,_.useState)(``),[a,o]=(0,_.useState)(``),[s,c]=(0,_.useState)(``),[l,d]=(0,_.useState)(``),[f,p]=(0,_.useState)(``);return(0,v.jsx)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`16px`},children:[`sm`,`md`,`lg`].map((m,h)=>{let g={sm:`Small (28px)`,md:`Medium (32px)`,lg:`Large (36px)`}[m],[_,y]=[[e,t],[n,r],[a,o]][h],[b,x]=[[s,c],[l,d],[f,p]][h];return(0,v.jsxs)(`div`,{style:{display:`flex`,gap:`16px`},children:[(0,v.jsx)(`div`,{style:{flex:1},children:(0,v.jsx)(u,{label:g,value:_,onChange:y,placeholder:`TextArea`,size:m})}),(0,v.jsx)(`div`,{style:{flex:1},children:(0,v.jsx)(i,{label:g,value:b,onChange:x,placeholder:`TextInput`,size:m})})]},m)})})}},W={render:e=>{let[t,n]=(0,_.useState)(e.value??``);return(0,v.jsx)(u,{...e,value:t,onChange:n})},args:{label:`Bio`,placeholder:`Tell us about yourself...`,maxLength:150}},G={render:e=>{let[t,n]=(0,_.useState)(e.value??`This is a pre-filled bio that demonstrates the character counter.`);return(0,v.jsx)(u,{...e,value:t,onChange:n})},args:{label:`Bio`,maxLength:100}},K={render:e=>{let[t,n]=(0,_.useState)(e.value??`This bio is intentionally longer than the limit to show the over-limit state.`);return(0,v.jsx)(u,{...e,value:t,onChange:n})},args:{label:`Bio`,maxLength:50}},q={render:()=>{let[e,t]=(0,_.useState)(``),[n,r]=(0,_.useState)(`Some text here`),[i,a]=(0,_.useState)(`This is a longer text that approaches the maximum length limit.`);return(0,v.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`16px`,maxWidth:`400px`},children:[(0,v.jsx)(u,{label:`Short limit`,value:e,onChange:t,placeholder:`Max 50 characters`,maxLength:50}),(0,v.jsx)(u,{label:`Medium limit`,value:n,onChange:r,placeholder:`Max 100 characters`,maxLength:100}),(0,v.jsx)(u,{label:`Long limit`,value:i,onChange:a,placeholder:`Max 200 characters`,maxLength:200})]})}},J={render:()=>{let[e,t]=(0,_.useState)(`Too short`),[n,r]=(0,_.useState)(`Too short`);return(0,v.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:24,width:320},children:[(0,v.jsx)(u,{label:`Attached (default)`,value:e,onChange:t,status:{type:`error`,message:`Must be at least 50 characters`}}),(0,v.jsx)(u,{label:`Detached`,value:n,onChange:r,status:{type:`error`,message:`Must be at least 50 characters`},statusVariant:`detached`})]})}},Y={name:`Vertical Form Alignment`,render:()=>{let[e,t]=(0,_.useState)(``),[n,r]=(0,_.useState)(`public`),[a,s]=(0,_.useState)(``),[l,d]=(0,_.useState)(`Design systems engineer.`);return(0,v.jsx)(`div`,{style:{width:360},children:(0,v.jsxs)(c,{children:[(0,v.jsx)(i,{label:`Display name`,value:e,onChange:t}),(0,v.jsx)(o,{label:`Visibility`,value:n,onChange:e=>r(e),options:[{label:`Public`,value:`public`},{label:`Followers only`,value:`followers`},{label:`Private`,value:`private`}]}),(0,v.jsx)(u,{label:`Summary`,value:a,onChange:s,placeholder:`A short one-liner`,maxLength:80}),(0,v.jsx)(u,{label:`Bio`,value:l,onChange:d,rows:4,description:`Tell people a bit about yourself.`,maxLength:200})]})})}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState(args.value ?? '');
    return <TextArea {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Description',
    placeholder: 'Enter a description...'
  }
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState(args.value ?? '');
    return <TextArea {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Bio',
    description: 'Tell us about yourself in a few sentences.',
    placeholder: 'Write your bio here...'
  }
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState(args.value ?? '');
    return <TextArea {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Comments',
    isLabelHidden: true,
    placeholder: 'Add a comment...'
  }
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState(args.value ?? 'This is a pre-filled textarea with some content that demonstrates how the component handles existing text.');
    return <TextArea {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Notes',
    value: 'This is a pre-filled textarea with some content that demonstrates how the component handles existing text.'
  }
}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState(args.value ?? '');
    return <TextArea {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Message',
    rows: 6,
    placeholder: 'Write a longer message...'
  }
}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [value1, setValue1] = useState('');
    const [value2, setValue2] = useState('');
    const [value3, setValue3] = useState('Pre-filled content in the textarea.');
    const [value4, setValue4] = useState('');
    const [value5, setValue5] = useState('');
    const [value6, setValue6] = useState('');
    const [value7, setValue7] = useState('');
    const [value8, setValue8] = useState('');
    const [value9, setValue9] = useState('This field is disabled');
    return <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      maxWidth: '400px'
    }}>
        <TextArea label="Visible label" value={value1} onChange={setValue1} placeholder="Enter text..." />
        <TextArea label="With description" description="Helpful description text" value={value4} onChange={setValue4} placeholder="Enter text..." />
        <TextArea label="Hidden label" isLabelHidden value={value2} onChange={setValue2} placeholder="Hidden label textarea" />
        <TextArea label="With value" value={value3} onChange={setValue3} />
        <TextArea label="Optional field" isOptional value={value5} onChange={setValue5} placeholder="Optional..." />
        <TextArea label="Required field" isRequired value={value6} onChange={setValue6} placeholder="Required..." />
        <TextArea label="Description with optional" description="Additional notes" isOptional value={value7} onChange={setValue7} placeholder="Notes..." />
        <TextArea label="Custom rows (6)" rows={6} value={value8} onChange={setValue8} placeholder="Larger textarea..." />
        <TextArea label="Disabled field" isDisabled value={value9} onChange={setValue9} />
      </div>;
  }
}`,...T.parameters?.docs?.source}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState(args.value ?? '');
    return <TextArea {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Additional Notes',
    isOptional: true,
    placeholder: 'Any additional notes...'
  }
}`,...E.parameters?.docs?.source}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState(args.value ?? '');
    return <TextArea {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Feedback',
    isRequired: true,
    placeholder: 'Please provide your feedback...'
  }
}`,...D.parameters?.docs?.source}}},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState(args.value ?? '');
    return <TextArea {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Comments',
    description: 'Share any additional thoughts or comments',
    isOptional: true,
    placeholder: 'Your comments here...'
  }
}`,...O.parameters?.docs?.source}}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState(args.value ?? 'This textarea is disabled and cannot be edited.');
    return <TextArea {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Disabled Field',
    isDisabled: true,
    value: 'This textarea is disabled and cannot be edited.'
  }
}`,...k.parameters?.docs?.source}}},A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState(args.value ?? 'These notes are locked after submission.');
    return <TextArea {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Notes',
    isDisabled: true,
    disabledMessage: 'Notes are locked after submission',
    value: 'These notes are locked after submission.'
  }
}`,...A.parameters?.docs?.source}}},j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState(args.value ?? '');
    return <TextArea {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Notes',
    placeholder: 'Enter your notes...',
    startIcon: DocumentTextIcon
  }
}`,...j.parameters?.docs?.source}}},M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [notes, setNotes] = useState('');
    const [message, setMessage] = useState('');
    const [draft, setDraft] = useState('');
    return <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      maxWidth: '400px'
    }}>
        <TextArea label="Notes" value={notes} onChange={setNotes} placeholder="Enter your notes..." startIcon={DocumentTextIcon} />
        <TextArea label="Message" value={message} onChange={setMessage} placeholder="Type your message..." startIcon={ChatBubbleLeftIcon} />
        <TextArea label="Draft" value={draft} onChange={setDraft} placeholder="Write your draft..." startIcon={PencilSquareIcon} />
      </div>;
  }
}`,...M.parameters?.docs?.source}}},N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState(args.value ?? 'Too short');
    return <TextArea {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Description',
    placeholder: 'Enter a description...',
    status: {
      type: 'error',
      message: 'Description must be at least 50 characters'
    }
  }
}`,...N.parameters?.docs?.source}}},P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState(args.value ?? 'This content may contain issues');
    return <TextArea {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Content',
    placeholder: 'Enter content...',
    status: {
      type: 'warning',
      message: 'Content may need review before publishing'
    }
  }
}`,...P.parameters?.docs?.source}}},F.parameters={...F.parameters,docs:{...F.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState(args.value ?? 'This is a valid description that meets all requirements.');
    return <TextArea {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Description',
    placeholder: 'Enter a description...',
    status: {
      type: 'success',
      message: 'Description looks good!'
    }
  }
}`,...F.parameters?.docs?.source}}},I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState(args.value ?? 'Invalid content');
    return <TextArea {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Field',
    placeholder: 'Enter value',
    status: {
      type: 'error'
    }
  }
}`,...I.parameters?.docs?.source}}},L.parameters={...L.parameters,docs:{...L.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [error, setError] = useState('Too short');
    const [warning, setWarning] = useState('This may need review');
    const [success, setSuccess] = useState('This description meets all the requirements perfectly.');
    const [errorNoMsg, setErrorNoMsg] = useState('Invalid');
    return <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      maxWidth: '400px'
    }}>
        <TextArea label="Error with message" value={error} onChange={setError} status={{
        type: 'error',
        message: 'Must be at least 50 characters'
      }} />
        <TextArea label="Warning with message" value={warning} onChange={setWarning} status={{
        type: 'warning',
        message: 'Content may need review'
      }} />
        <TextArea label="Success with message" value={success} onChange={setSuccess} status={{
        type: 'success',
        message: 'Description is valid'
      }} />
        <TextArea label="Error without message" value={errorNoMsg} onChange={setErrorNoMsg} status={{
        type: 'error'
      }} />
      </div>;
  }
}`,...L.parameters?.docs?.source}}},R.parameters={...R.parameters,docs:{...R.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState(args.value ?? '');
    return <TextArea {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'API Documentation',
    placeholder: 'Describe your API endpoint...',
    labelTooltip: 'Provide a detailed description of what this API endpoint does, including expected inputs and outputs.'
  }
}`,...R.parameters?.docs?.source}}},z.parameters={...z.parameters,docs:{...z.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState(args.value ?? '');
    return <TextArea {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Additional Notes',
    placeholder: 'Any additional information...',
    labelTooltip: 'Include any extra details that might be helpful for reviewers.',
    isOptional: true
  }
}`,...z.parameters?.docs?.source}}},B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState(args.value ?? 'Saving your changes…');
    return <TextArea {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Description',
    placeholder: 'Enter a description...',
    isLoading: true
  }
}`,...B.parameters?.docs?.source}}},V.parameters={...V.parameters,docs:{...V.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = useState('Too short');
    const [isLoading, setIsLoading] = useState(true);
    return <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
      width: 360
    }}>
        <label style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8
      }}>
          <input type="checkbox" checked={isLoading} onChange={e => setIsLoading(e.target.checked)} />
          isLoading
        </label>
        <TextArea label="Description" value={value} onChange={setValue} isLoading={isLoading} status={{
        type: 'error',
        message: 'Description must be at least 50 characters'
      }} />
      </div>;
  }
}`,...V.parameters?.docs?.source}}},H.parameters={...H.parameters,docs:{...H.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = useState('');
    return <div style={{
      maxWidth: '400px'
    }}>
        <TextArea label="Detailed Description" description="Provide a comprehensive description of your project" value={value} onChange={setValue} placeholder="Enter description..." startIcon={DocumentTextIcon} labelTooltip="This description will be visible to all team members" isRequired status={value.length > 0 && value.length < 20 ? {
        type: 'warning',
        message: 'Consider adding more detail'
      } : value.length >= 20 ? {
        type: 'success',
        message: 'Description looks good!'
      } : undefined} />
      </div>;
  }
}`,...H.parameters?.docs?.source}}},U.parameters={...U.parameters,docs:{...U.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [smArea, setSmArea] = useState('');
    const [mdArea, setMdArea] = useState('');
    const [lgArea, setLgArea] = useState('');
    const [smInput, setSmInput] = useState('');
    const [mdInput, setMdInput] = useState('');
    const [lgInput, setLgInput] = useState('');
    return <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '16px'
    }}>
        {(['sm', 'md', 'lg'] as const).map((sz, i) => {
        const label = {
          sm: 'Small (28px)',
          md: 'Medium (32px)',
          lg: 'Large (36px)'
        }[sz];
        const [area, setArea] = [[smArea, setSmArea], [mdArea, setMdArea], [lgArea, setLgArea]][i] as [string, (v: string) => void];
        const [input, setInput] = [[smInput, setSmInput], [mdInput, setMdInput], [lgInput, setLgInput]][i] as [string, (v: string) => void];
        return <div key={sz} style={{
          display: 'flex',
          gap: '16px'
        }}>
              <div style={{
            flex: 1
          }}>
                <TextArea label={label} value={area} onChange={setArea} placeholder="TextArea" size={sz} />
              </div>
              <div style={{
            flex: 1
          }}>
                <TextInput label={label} value={input} onChange={setInput} placeholder="TextInput" size={sz} />
              </div>
            </div>;
      })}
      </div>;
  }
}`,...U.parameters?.docs?.source}}},W.parameters={...W.parameters,docs:{...W.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState(args.value ?? '');
    return <TextArea {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Bio',
    placeholder: 'Tell us about yourself...',
    maxLength: 150
  }
}`,...W.parameters?.docs?.source}}},G.parameters={...G.parameters,docs:{...G.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState(args.value ?? 'This is a pre-filled bio that demonstrates the character counter.');
    return <TextArea {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Bio',
    maxLength: 100
  }
}`,...G.parameters?.docs?.source}}},K.parameters={...K.parameters,docs:{...K.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState(args.value ?? 'This bio is intentionally longer than the limit to show the over-limit state.');
    return <TextArea {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Bio',
    maxLength: 50
  }
}`,...K.parameters?.docs?.source}}},q.parameters={...q.parameters,docs:{...q.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [short, setShort] = useState('');
    const [medium, setMedium] = useState('Some text here');
    const [long, setLong] = useState('This is a longer text that approaches the maximum length limit.');
    return <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      maxWidth: '400px'
    }}>
        <TextArea label="Short limit" value={short} onChange={setShort} placeholder="Max 50 characters" maxLength={50} />
        <TextArea label="Medium limit" value={medium} onChange={setMedium} placeholder="Max 100 characters" maxLength={100} />
        <TextArea label="Long limit" value={long} onChange={setLong} placeholder="Max 200 characters" maxLength={200} />
      </div>;
  }
}`,...q.parameters?.docs?.source}}},J.parameters={...J.parameters,docs:{...J.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [a, setA] = useState('Too short');
    const [b, setB] = useState('Too short');
    return <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 24,
      width: 320
    }}>
        <TextArea label="Attached (default)" value={a} onChange={setA} status={{
        type: 'error',
        message: 'Must be at least 50 characters'
      }} />
        <TextArea label="Detached" value={b} onChange={setB} status={{
        type: 'error',
        message: 'Must be at least 50 characters'
      }} statusVariant="detached" />
      </div>;
  }
}`,...J.parameters?.docs?.source}}},Y.parameters={...Y.parameters,docs:{...Y.parameters?.docs,source:{originalSource:`{
  name: 'Vertical Form Alignment',
  render: () => {
    const [name, setName] = useState('');
    const [visibility, setVisibility] = useState('public');
    const [summary, setSummary] = useState('');
    const [bio, setBio] = useState('Design systems engineer.');
    return <div style={{
      width: 360
    }}>
        <FormLayout>
          <TextInput label="Display name" value={name} onChange={setName} />
          <Selector label="Visibility" value={visibility} onChange={v => setVisibility(v as string)} options={[{
          label: 'Public',
          value: 'public'
        }, {
          label: 'Followers only',
          value: 'followers'
        }, {
          label: 'Private',
          value: 'private'
        }]} />
          <TextArea label="Summary" value={summary} onChange={setSummary} placeholder="A short one-liner" maxLength={80} />
          <TextArea label="Bio" value={bio} onChange={setBio} rows={4} description="Tell people a bit about yourself." maxLength={200} />
        </FormLayout>
      </div>;
  }
}`,...Y.parameters?.docs?.source}}},X=`Default.WithDescription.WithHiddenLabel.WithValue.CustomRows.AllVariations.OptionalField.RequiredField.DescriptionWithOptional.Disabled.DisabledWithMessage.WithStartIcon.StartIconVariations.ErrorStatus.WarningStatus.SuccessStatus.StatusWithoutMessage.StatusVariations.WithTooltip.TooltipWithOptional.Loading.LoadingWithStatus.CombinedFeatures.SizeVariants.WithMaxLength.MaxLengthWithValue.MaxLengthOverLimit.MaxLengthVariations.StatusVariantComparison.VerticalFormAlignment`.split(`.`)})))()}Z();export{T as AllVariations,H as CombinedFeatures,w as CustomRows,b as Default,O as DescriptionWithOptional,k as Disabled,A as DisabledWithMessage,N as ErrorStatus,B as Loading,V as LoadingWithStatus,K as MaxLengthOverLimit,q as MaxLengthVariations,G as MaxLengthWithValue,E as OptionalField,D as RequiredField,U as SizeVariants,M as StartIconVariations,J as StatusVariantComparison,L as StatusVariations,I as StatusWithoutMessage,F as SuccessStatus,z as TooltipWithOptional,Y as VerticalFormAlignment,P as WarningStatus,x as WithDescription,S as WithHiddenLabel,W as WithMaxLength,j as WithStartIcon,R as WithTooltip,C as WithValue,X as __namedExportsOrder,y as default};