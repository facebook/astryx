import{i as e,s as t}from"./preload-helper-CT_b8DTk.js";import{t as n}from"./react-B7Te67-h.js";import{t as r}from"./jsx-runtime-DqZldVDK.js";import{n as i,t as a}from"./TextInput-B652e8dI.js";import{en as o,tn as s}from"./iframe-CER2Y08S.js";import{Ot as c,R as l,in as u,t as d}from"./esm-DA7gAIBC.js";var f,p,m,h,g,_,v,y,b,x,S,C,w,T,E,D,O,k,A,j,M,N,P,F,I,L,R,z,B;e((()=>{f=t(n()),o(),a(),d(),p=r(),m={title:`Core/TextArea`,component:s,tags:[`autodocs`],argTypes:{label:{control:`text`,description:`Label text (required)`},isLabelHidden:{control:`boolean`,description:`Visually hide the label (still accessible to screen readers)`},placeholder:{control:`text`,description:`Placeholder text`},description:{control:`text`,description:`Description text displayed between the label and textarea`},value:{control:`text`,description:`Current textarea value (required)`},isOptional:{control:`boolean`,description:`Whether the field is optional (mutually exclusive with isRequired)`},isRequired:{control:`boolean`,description:`Whether the field is required (mutually exclusive with isOptional)`},rows:{control:`number`,description:`Number of visible text rows (default: 3)`},isDisabled:{control:`boolean`,description:`Whether the textarea is disabled`},disabledMessage:{control:`text`,description:`Explains why the textarea is disabled. With isDisabled, shows a tooltip on hover/keyboard focus and keeps the textarea focusable via aria-disabled (the field becomes read-only). Use this instead of wrapping a disabled TextArea in Tooltip.`},status:{control:`object`,description:`Status indicator with type (warning/error/success) and optional message`},labelTooltip:{control:`text`,description:`Tooltip text to display in an info icon at the end of the label`},hasSpellCheck:{control:`boolean`,description:`Whether to enable browser spell checking (default: true)`},maxLength:{control:`number`,description:`Maximum number of characters allowed. Displays a counter when set.`},size:{control:`radio`,options:[`sm`,`md`,`lg`],description:`Textarea size (affects padding, not height)`}}},h={render:e=>{let[t,n]=(0,f.useState)(e.value??``);return(0,p.jsx)(s,{...e,value:t,onChange:n})},args:{label:`Description`,placeholder:`Enter a description...`}},g={render:e=>{let[t,n]=(0,f.useState)(e.value??``);return(0,p.jsx)(s,{...e,value:t,onChange:n})},args:{label:`Bio`,description:`Tell us about yourself in a few sentences.`,placeholder:`Write your bio here...`}},_={render:e=>{let[t,n]=(0,f.useState)(e.value??``);return(0,p.jsx)(s,{...e,value:t,onChange:n})},args:{label:`Comments`,isLabelHidden:!0,placeholder:`Add a comment...`}},v={render:e=>{let[t,n]=(0,f.useState)(e.value??`This is a pre-filled textarea with some content that demonstrates how the component handles existing text.`);return(0,p.jsx)(s,{...e,value:t,onChange:n})},args:{label:`Notes`,value:`This is a pre-filled textarea with some content that demonstrates how the component handles existing text.`}},y={render:e=>{let[t,n]=(0,f.useState)(e.value??``);return(0,p.jsx)(s,{...e,value:t,onChange:n})},args:{label:`Message`,rows:6,placeholder:`Write a longer message...`}},b={render:()=>{let[e,t]=(0,f.useState)(``),[n,r]=(0,f.useState)(``),[i,a]=(0,f.useState)(`Pre-filled content in the textarea.`),[o,c]=(0,f.useState)(``),[l,u]=(0,f.useState)(``),[d,m]=(0,f.useState)(``),[h,g]=(0,f.useState)(``),[_,v]=(0,f.useState)(``),[y,b]=(0,f.useState)(`This field is disabled`);return(0,p.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`16px`,maxWidth:`400px`},children:[(0,p.jsx)(s,{label:`Visible label`,value:e,onChange:t,placeholder:`Enter text...`}),(0,p.jsx)(s,{label:`With description`,description:`Helpful description text`,value:o,onChange:c,placeholder:`Enter text...`}),(0,p.jsx)(s,{label:`Hidden label`,isLabelHidden:!0,value:n,onChange:r,placeholder:`Hidden label textarea`}),(0,p.jsx)(s,{label:`With value`,value:i,onChange:a}),(0,p.jsx)(s,{label:`Optional field`,isOptional:!0,value:l,onChange:u,placeholder:`Optional...`}),(0,p.jsx)(s,{label:`Required field`,isRequired:!0,value:d,onChange:m,placeholder:`Required...`}),(0,p.jsx)(s,{label:`Description with optional`,description:`Additional notes`,isOptional:!0,value:h,onChange:g,placeholder:`Notes...`}),(0,p.jsx)(s,{label:`Custom rows (6)`,rows:6,value:_,onChange:v,placeholder:`Larger textarea...`}),(0,p.jsx)(s,{label:`Disabled field`,isDisabled:!0,value:y,onChange:b})]})}},x={render:e=>{let[t,n]=(0,f.useState)(e.value??``);return(0,p.jsx)(s,{...e,value:t,onChange:n})},args:{label:`Additional Notes`,isOptional:!0,placeholder:`Any additional notes...`}},S={render:e=>{let[t,n]=(0,f.useState)(e.value??``);return(0,p.jsx)(s,{...e,value:t,onChange:n})},args:{label:`Feedback`,isRequired:!0,placeholder:`Please provide your feedback...`}},C={render:e=>{let[t,n]=(0,f.useState)(e.value??``);return(0,p.jsx)(s,{...e,value:t,onChange:n})},args:{label:`Comments`,description:`Share any additional thoughts or comments`,isOptional:!0,placeholder:`Your comments here...`}},w={render:e=>{let[t,n]=(0,f.useState)(e.value??`This textarea is disabled and cannot be edited.`);return(0,p.jsx)(s,{...e,value:t,onChange:n})},args:{label:`Disabled Field`,isDisabled:!0,value:`This textarea is disabled and cannot be edited.`}},T={render:e=>{let[t,n]=(0,f.useState)(e.value??`These notes are locked after submission.`);return(0,p.jsx)(s,{...e,value:t,onChange:n})},args:{label:`Notes`,isDisabled:!0,disabledMessage:`Notes are locked after submission`,value:`These notes are locked after submission.`}},E={render:e=>{let[t,n]=(0,f.useState)(e.value??``);return(0,p.jsx)(s,{...e,value:t,onChange:n})},args:{label:`Notes`,placeholder:`Enter your notes...`,startIcon:c}},D={render:()=>{let[e,t]=(0,f.useState)(``),[n,r]=(0,f.useState)(``),[i,a]=(0,f.useState)(``);return(0,p.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`16px`,maxWidth:`400px`},children:[(0,p.jsx)(s,{label:`Notes`,value:e,onChange:t,placeholder:`Enter your notes...`,startIcon:c}),(0,p.jsx)(s,{label:`Message`,value:n,onChange:r,placeholder:`Type your message...`,startIcon:u}),(0,p.jsx)(s,{label:`Draft`,value:i,onChange:a,placeholder:`Write your draft...`,startIcon:l})]})}},O={render:e=>{let[t,n]=(0,f.useState)(e.value??`Too short`);return(0,p.jsx)(s,{...e,value:t,onChange:n})},args:{label:`Description`,placeholder:`Enter a description...`,status:{type:`error`,message:`Description must be at least 50 characters`}}},k={render:e=>{let[t,n]=(0,f.useState)(e.value??`This content may contain issues`);return(0,p.jsx)(s,{...e,value:t,onChange:n})},args:{label:`Content`,placeholder:`Enter content...`,status:{type:`warning`,message:`Content may need review before publishing`}}},A={render:e=>{let[t,n]=(0,f.useState)(e.value??`This is a valid description that meets all requirements.`);return(0,p.jsx)(s,{...e,value:t,onChange:n})},args:{label:`Description`,placeholder:`Enter a description...`,status:{type:`success`,message:`Description looks good!`}}},j={render:e=>{let[t,n]=(0,f.useState)(e.value??`Invalid content`);return(0,p.jsx)(s,{...e,value:t,onChange:n})},args:{label:`Field`,placeholder:`Enter value`,status:{type:`error`}}},M={render:()=>{let[e,t]=(0,f.useState)(`Too short`),[n,r]=(0,f.useState)(`This may need review`),[i,a]=(0,f.useState)(`This description meets all the requirements perfectly.`),[o,c]=(0,f.useState)(`Invalid`);return(0,p.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`16px`,maxWidth:`400px`},children:[(0,p.jsx)(s,{label:`Error with message`,value:e,onChange:t,status:{type:`error`,message:`Must be at least 50 characters`}}),(0,p.jsx)(s,{label:`Warning with message`,value:n,onChange:r,status:{type:`warning`,message:`Content may need review`}}),(0,p.jsx)(s,{label:`Success with message`,value:i,onChange:a,status:{type:`success`,message:`Description is valid`}}),(0,p.jsx)(s,{label:`Error without message`,value:o,onChange:c,status:{type:`error`}})]})}},N={render:e=>{let[t,n]=(0,f.useState)(e.value??``);return(0,p.jsx)(s,{...e,value:t,onChange:n})},args:{label:`API Documentation`,placeholder:`Describe your API endpoint...`,labelTooltip:`Provide a detailed description of what this API endpoint does, including expected inputs and outputs.`}},P={render:e=>{let[t,n]=(0,f.useState)(e.value??``);return(0,p.jsx)(s,{...e,value:t,onChange:n})},args:{label:`Additional Notes`,placeholder:`Any additional information...`,labelTooltip:`Include any extra details that might be helpful for reviewers.`,isOptional:!0}},F={render:()=>{let[e,t]=(0,f.useState)(``);return(0,p.jsx)(`div`,{style:{maxWidth:`400px`},children:(0,p.jsx)(s,{label:`Detailed Description`,description:`Provide a comprehensive description of your project`,value:e,onChange:t,placeholder:`Enter description...`,startIcon:c,labelTooltip:`This description will be visible to all team members`,isRequired:!0,status:e.length>0&&e.length<20?{type:`warning`,message:`Consider adding more detail`}:e.length>=20?{type:`success`,message:`Description looks good!`}:void 0})})}},I={render:()=>{let[e,t]=(0,f.useState)(``),[n,r]=(0,f.useState)(``),[a,o]=(0,f.useState)(``),[c,l]=(0,f.useState)(``),[u,d]=(0,f.useState)(``),[m,h]=(0,f.useState)(``);return(0,p.jsx)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`16px`},children:[`sm`,`md`,`lg`].map((f,g)=>{let _={sm:`Small (28px)`,md:`Medium (32px)`,lg:`Large (36px)`}[f],[v,y]=[[e,t],[n,r],[a,o]][g],[b,x]=[[c,l],[u,d],[m,h]][g];return(0,p.jsxs)(`div`,{style:{display:`flex`,gap:`16px`},children:[(0,p.jsx)(`div`,{style:{flex:1},children:(0,p.jsx)(s,{label:_,value:v,onChange:y,placeholder:`TextArea`,size:f})}),(0,p.jsx)(`div`,{style:{flex:1},children:(0,p.jsx)(i,{label:_,value:b,onChange:x,placeholder:`TextInput`,size:f})})]},f)})})}},L={render:e=>{let[t,n]=(0,f.useState)(e.value??``);return(0,p.jsx)(s,{...e,value:t,onChange:n})},args:{label:`Bio`,placeholder:`Tell us about yourself...`,maxLength:150}},R={render:e=>{let[t,n]=(0,f.useState)(e.value??`This is a pre-filled bio that demonstrates the character counter.`);return(0,p.jsx)(s,{...e,value:t,onChange:n})},args:{label:`Bio`,maxLength:100}},z={render:()=>{let[e,t]=(0,f.useState)(``),[n,r]=(0,f.useState)(`Some text here`),[i,a]=(0,f.useState)(`This is a longer text that approaches the maximum length limit.`);return(0,p.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`16px`,maxWidth:`400px`},children:[(0,p.jsx)(s,{label:`Short limit`,value:e,onChange:t,placeholder:`Max 50 characters`,maxLength:50}),(0,p.jsx)(s,{label:`Medium limit`,value:n,onChange:r,placeholder:`Max 100 characters`,maxLength:100}),(0,p.jsx)(s,{label:`Long limit`,value:i,onChange:a,placeholder:`Max 200 characters`,maxLength:200})]})}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState(args.value ?? '');
    return <TextArea {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Description',
    placeholder: 'Enter a description...'
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState(args.value ?? '');
    return <TextArea {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Bio',
    description: 'Tell us about yourself in a few sentences.',
    placeholder: 'Write your bio here...'
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState(args.value ?? '');
    return <TextArea {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Comments',
    isLabelHidden: true,
    placeholder: 'Add a comment...'
  }
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState(args.value ?? 'This is a pre-filled textarea with some content that demonstrates how the component handles existing text.');
    return <TextArea {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Notes',
    value: 'This is a pre-filled textarea with some content that demonstrates how the component handles existing text.'
  }
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState(args.value ?? '');
    return <TextArea {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Message',
    rows: 6,
    placeholder: 'Write a longer message...'
  }
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
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
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState(args.value ?? '');
    return <TextArea {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Additional Notes',
    isOptional: true,
    placeholder: 'Any additional notes...'
  }
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState(args.value ?? '');
    return <TextArea {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Feedback',
    isRequired: true,
    placeholder: 'Please provide your feedback...'
  }
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
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
}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState(args.value ?? 'This textarea is disabled and cannot be edited.');
    return <TextArea {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Disabled Field',
    isDisabled: true,
    value: 'This textarea is disabled and cannot be edited.'
  }
}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
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
}`,...T.parameters?.docs?.source}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState(args.value ?? '');
    return <TextArea {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Notes',
    placeholder: 'Enter your notes...',
    startIcon: DocumentTextIcon
  }
}`,...E.parameters?.docs?.source}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
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
}`,...D.parameters?.docs?.source}}},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
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
}`,...O.parameters?.docs?.source}}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
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
}`,...k.parameters?.docs?.source}}},A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
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
}`,...A.parameters?.docs?.source}}},j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
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
}`,...j.parameters?.docs?.source}}},M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
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
}`,...M.parameters?.docs?.source}}},N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState(args.value ?? '');
    return <TextArea {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'API Documentation',
    placeholder: 'Describe your API endpoint...',
    labelTooltip: 'Provide a detailed description of what this API endpoint does, including expected inputs and outputs.'
  }
}`,...N.parameters?.docs?.source}}},P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
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
}`,...P.parameters?.docs?.source}}},F.parameters={...F.parameters,docs:{...F.parameters?.docs,source:{originalSource:`{
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
}`,...F.parameters?.docs?.source}}},I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{
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
}`,...I.parameters?.docs?.source}}},L.parameters={...L.parameters,docs:{...L.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState(args.value ?? '');
    return <TextArea {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Bio',
    placeholder: 'Tell us about yourself...',
    maxLength: 150
  }
}`,...L.parameters?.docs?.source}}},R.parameters={...R.parameters,docs:{...R.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState(args.value ?? 'This is a pre-filled bio that demonstrates the character counter.');
    return <TextArea {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Bio',
    maxLength: 100
  }
}`,...R.parameters?.docs?.source}}},z.parameters={...z.parameters,docs:{...z.parameters?.docs,source:{originalSource:`{
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
}`,...z.parameters?.docs?.source}}},B=[`Default`,`WithDescription`,`WithHiddenLabel`,`WithValue`,`CustomRows`,`AllVariations`,`OptionalField`,`RequiredField`,`DescriptionWithOptional`,`Disabled`,`DisabledWithMessage`,`WithStartIcon`,`StartIconVariations`,`ErrorStatus`,`WarningStatus`,`SuccessStatus`,`StatusWithoutMessage`,`StatusVariations`,`WithTooltip`,`TooltipWithOptional`,`CombinedFeatures`,`SizeVariants`,`WithMaxLength`,`MaxLengthWithValue`,`MaxLengthVariations`]}))();export{b as AllVariations,F as CombinedFeatures,y as CustomRows,h as Default,C as DescriptionWithOptional,w as Disabled,T as DisabledWithMessage,O as ErrorStatus,z as MaxLengthVariations,R as MaxLengthWithValue,x as OptionalField,S as RequiredField,I as SizeVariants,D as StartIconVariations,M as StatusVariations,j as StatusWithoutMessage,A as SuccessStatus,P as TooltipWithOptional,k as WarningStatus,g as WithDescription,_ as WithHiddenLabel,L as WithMaxLength,E as WithStartIcon,N as WithTooltip,v as WithValue,B as __namedExportsOrder,m as default};