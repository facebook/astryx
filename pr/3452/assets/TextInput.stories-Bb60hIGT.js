import{ah as n,a1 as r}from"./iframe-BzSUXdLu.js";import{T as s}from"./TextInput-Ctkn7lrG.js";import{F as z}from"./MagnifyingGlassIcon-D8df555Z.js";import{F as A}from"./EnvelopeIcon-D2lwJNRV.js";import{F as G}from"./UserIcon-rJN2Vkzb.js";import"./preload-helper-Ct5FWWRu.js";import"./Field-DvKAfOMj.js";import"./FieldStatus-CM_meSLQ.js";import"./inputStyles.stylex-Bpqcd25J.js";import"./groupStyles-q9VgLTeF.js";import"./useInputContainer-Cjh0XfIH.js";const te={title:"Core/TextInput",component:s,tags:["autodocs"],argTypes:{label:{control:"text",description:"Label text (required)"},isLabelHidden:{control:"boolean",description:"Visually hide the label (still accessible to screen readers)"},placeholder:{control:"text",description:"Placeholder text"},description:{control:"text",description:"Description text displayed between the label and input"},value:{control:"text",description:"Current input value (required)"},size:{control:"select",options:["sm","md","lg"],description:"Size variant"},isOptional:{control:"boolean",description:"Whether the field is optional (mutually exclusive with isRequired)"},isRequired:{control:"boolean",description:"Whether the field is required (mutually exclusive with isOptional)"},isDisabled:{control:"boolean",description:"Whether the input is disabled"},status:{control:"object",description:"Status indicator with type (warning/error/success) and optional message"},labelTooltip:{control:"text",description:"Tooltip text to display in an info icon at the end of the label"}}},i={render:e=>{const[a,t]=n.useState(e.value??"");return r.jsx(s,{...e,value:a,onChange:t})},args:{label:"Name",placeholder:"Enter your name"}},c={render:e=>{const[a,t]=n.useState(e.value??"");return r.jsx(s,{...e,value:a,onChange:t})},args:{label:"Email",description:"We'll never share your email with anyone.",placeholder:"Enter your email"}},d={render:e=>{const[a,t]=n.useState(e.value??"");return r.jsx(s,{...e,value:a,onChange:t})},args:{label:"Search",isLabelHidden:!0,placeholder:"Search..."}},p={render:e=>{const[a,t]=n.useState(e.value??"Hello, world!");return r.jsx(s,{...e,value:a,onChange:t})},args:{label:"Greeting",value:"Hello, world!"}},m={render:()=>{const[e,a]=n.useState(""),[t,l]=n.useState(""),[o,u]=n.useState("Pre-filled value"),[k,L]=n.useState(""),[R,U]=n.useState(""),[H,M]=n.useState(""),[q,P]=n.useState(""),[F,N]=n.useState("Disabled input");return r.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"16px",maxWidth:"300px"},children:[r.jsx(s,{label:"Visible label",value:e,onChange:a,placeholder:"Enter text..."}),r.jsx(s,{label:"With description",description:"Helpful description text",value:k,onChange:L,placeholder:"Enter text..."}),r.jsx(s,{label:"Hidden label",isLabelHidden:!0,value:t,onChange:l,placeholder:"Hidden label input"}),r.jsx(s,{label:"With value",value:o,onChange:u}),r.jsx(s,{label:"Optional field",isOptional:!0,value:R,onChange:U,placeholder:"Optional..."}),r.jsx(s,{label:"Required field",isRequired:!0,value:H,onChange:M,placeholder:"Required..."}),r.jsx(s,{label:"Description with optional",description:"Enter your nickname",isOptional:!0,value:q,onChange:P,placeholder:"Nickname..."}),r.jsx(s,{label:"Disabled field",isDisabled:!0,value:F,onChange:N})]})}},h={render:e=>{const[a,t]=n.useState(e.value??"");return r.jsx(s,{...e,value:a,onChange:t})},args:{label:"Nickname",isOptional:!0,placeholder:"Enter your nickname"}},g={render:e=>{const[a,t]=n.useState(e.value??"");return r.jsx(s,{...e,value:a,onChange:t})},args:{label:"Username",isRequired:!0,placeholder:"Enter your username"}},v={render:e=>{const[a,t]=n.useState(e.value??"");return r.jsx(s,{...e,value:a,onChange:t})},args:{label:"Bio",description:"Tell us about yourself",isOptional:!0,placeholder:"Your bio here..."}},S={render:e=>{const[a,t]=n.useState(e.value??"Cannot edit this");return r.jsx(s,{...e,value:a,onChange:t})},args:{label:"Locked Field",isDisabled:!0,value:"Cannot edit this"}},x={render:e=>{const[a,t]=n.useState(e.value??"");return r.jsx(s,{...e,value:a,onChange:t})},args:{label:"Search",placeholder:"Search...",startIcon:z}},b={render:e=>{const[a,t]=n.useState(e.value??"");return r.jsx(s,{...e,value:a,onChange:t})},args:{label:"Search",placeholder:"Search...",startIcon:z,size:"sm"}},V={render:()=>{const[e,a]=n.useState(""),[t,l]=n.useState(""),[o,u]=n.useState("");return r.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"16px",maxWidth:"300px"},children:[r.jsx(s,{label:"Small (28px)",value:e,onChange:a,placeholder:"Small size",size:"sm"}),r.jsx(s,{label:"Medium (32px)",value:t,onChange:l,placeholder:"Medium size (default)",size:"md"}),r.jsx(s,{label:"Large (36px)",value:o,onChange:u,placeholder:"Large size",size:"lg"})]})}},y={render:()=>{const[e,a]=n.useState(""),[t,l]=n.useState(""),[o,u]=n.useState("");return r.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"16px",maxWidth:"300px"},children:[r.jsx(s,{label:"Search",value:e,onChange:a,placeholder:"Search...",startIcon:z}),r.jsx(s,{label:"Email",value:t,onChange:l,placeholder:"Enter your email",startIcon:A}),r.jsx(s,{label:"Username",value:o,onChange:u,placeholder:"Enter your username",startIcon:G})]})}},C={render:e=>{const[a,t]=n.useState(e.value??"invalid@");return r.jsx(s,{...e,value:a,onChange:t})},args:{label:"Email",placeholder:"Enter your email",status:{type:"error",message:"Please enter a valid email address"}}},I={render:e=>{const[a,t]=n.useState(e.value??"user123");return r.jsx(s,{...e,value:a,onChange:t})},args:{label:"Username",placeholder:"Enter your username",status:{type:"warning",message:"This username is already taken"}}},T={render:e=>{const[a,t]=n.useState(e.value??"validuser");return r.jsx(s,{...e,value:a,onChange:t})},args:{label:"Username",placeholder:"Enter your username",status:{type:"success",message:"Username is available"}}},E={render:e=>{const[a,t]=n.useState(e.value??"test");return r.jsx(s,{...e,value:a,onChange:t})},args:{label:"Field",placeholder:"Enter value",status:{type:"error"}}},f={render:()=>{const[e,a]=n.useState("invalid@"),[t,l]=n.useState("user123"),[o,u]=n.useState("validuser"),[k,L]=n.useState("test");return r.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"16px",maxWidth:"300px"},children:[r.jsx(s,{label:"Error with message",value:e,onChange:a,status:{type:"error",message:"Please enter a valid email"}}),r.jsx(s,{label:"Warning with message",value:t,onChange:l,status:{type:"warning",message:"This username may be taken"}}),r.jsx(s,{label:"Success with message",value:o,onChange:u,status:{type:"success",message:"Username is available"}}),r.jsx(s,{label:"Error without message",value:k,onChange:L,status:{type:"error"}})]})}},w={render:e=>{const[a,t]=n.useState(e.value??"");return r.jsx(s,{...e,value:a,onChange:t})},args:{label:"API Key",placeholder:"Enter your API key",labelTooltip:"Your unique API key for authentication. Keep this secret!"}},W={render:e=>{const[a,t]=n.useState(e.value??"");return r.jsx(s,{...e,value:a,onChange:t})},args:{type:"password",label:"Password",placeholder:"Enter your password"}},j={render:e=>{const[a,t]=n.useState(e.value??"");return r.jsx(s,{...e,value:a,onChange:t})},args:{label:"Webhook URL",placeholder:"https://example.com/webhook",labelTooltip:"The URL where we will send event notifications.",isOptional:!0}},D={render:e=>{const[a,t]=n.useState(e.value??"Hello world");return r.jsx(s,{...e,value:a,onChange:t})},args:{label:"Search",placeholder:"Type to search...",hasClear:!0}},O={render:e=>{const[a,t]=n.useState(e.value??"invalid-email");return r.jsx(s,{...e,value:a,onChange:t})},args:{label:"Email",hasClear:!0,status:{type:"error",message:"Invalid email address"}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState(args.value ?? '');
    return <TextInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Name',
    placeholder: 'Enter your name'
  }
}`,...i.parameters?.docs?.source}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState(args.value ?? '');
    return <TextInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Email',
    description: "We'll never share your email with anyone.",
    placeholder: 'Enter your email'
  }
}`,...c.parameters?.docs?.source}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState(args.value ?? '');
    return <TextInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Search',
    isLabelHidden: true,
    placeholder: 'Search...'
  }
}`,...d.parameters?.docs?.source}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState(args.value ?? 'Hello, world!');
    return <TextInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Greeting',
    value: 'Hello, world!'
  }
}`,...p.parameters?.docs?.source}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [value1, setValue1] = useState('');
    const [value2, setValue2] = useState('');
    const [value3, setValue3] = useState('Pre-filled value');
    const [value4, setValue4] = useState('');
    const [value5, setValue5] = useState('');
    const [value6, setValue6] = useState('');
    const [value7, setValue7] = useState('');
    const [value8, setValue8] = useState('Disabled input');
    return <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      maxWidth: '300px'
    }}>
        <TextInput label="Visible label" value={value1} onChange={setValue1} placeholder="Enter text..." />
        <TextInput label="With description" description="Helpful description text" value={value4} onChange={setValue4} placeholder="Enter text..." />
        <TextInput label="Hidden label" isLabelHidden value={value2} onChange={setValue2} placeholder="Hidden label input" />
        <TextInput label="With value" value={value3} onChange={setValue3} />
        <TextInput label="Optional field" isOptional value={value5} onChange={setValue5} placeholder="Optional..." />
        <TextInput label="Required field" isRequired value={value6} onChange={setValue6} placeholder="Required..." />
        <TextInput label="Description with optional" description="Enter your nickname" isOptional value={value7} onChange={setValue7} placeholder="Nickname..." />
        <TextInput label="Disabled field" isDisabled value={value8} onChange={setValue8} />
      </div>;
  }
}`,...m.parameters?.docs?.source}}};h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState(args.value ?? '');
    return <TextInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Nickname',
    isOptional: true,
    placeholder: 'Enter your nickname'
  }
}`,...h.parameters?.docs?.source}}};g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState(args.value ?? '');
    return <TextInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Username',
    isRequired: true,
    placeholder: 'Enter your username'
  }
}`,...g.parameters?.docs?.source}}};v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState(args.value ?? '');
    return <TextInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Bio',
    description: 'Tell us about yourself',
    isOptional: true,
    placeholder: 'Your bio here...'
  }
}`,...v.parameters?.docs?.source}}};S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState(args.value ?? 'Cannot edit this');
    return <TextInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Locked Field',
    isDisabled: true,
    value: 'Cannot edit this'
  }
}`,...S.parameters?.docs?.source}}};x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState(args.value ?? '');
    return <TextInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Search',
    placeholder: 'Search...',
    startIcon: MagnifyingGlassIcon
  }
}`,...x.parameters?.docs?.source}}};b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState(args.value ?? '');
    return <TextInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Search',
    placeholder: 'Search...',
    startIcon: MagnifyingGlassIcon,
    size: 'sm'
  }
}`,...b.parameters?.docs?.source}}};V.parameters={...V.parameters,docs:{...V.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [sm, setSm] = useState('');
    const [md, setMd] = useState('');
    const [lg, setLg] = useState('');
    return <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      maxWidth: '300px'
    }}>
        <TextInput label="Small (28px)" value={sm} onChange={setSm} placeholder="Small size" size="sm" />
        <TextInput label="Medium (32px)" value={md} onChange={setMd} placeholder="Medium size (default)" size="md" />
        <TextInput label="Large (36px)" value={lg} onChange={setLg} placeholder="Large size" size="lg" />
      </div>;
  }
}`,...V.parameters?.docs?.source}}};y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [search, setSearch] = useState('');
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    return <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      maxWidth: '300px'
    }}>
        <TextInput label="Search" value={search} onChange={setSearch} placeholder="Search..." startIcon={MagnifyingGlassIcon} />
        <TextInput label="Email" value={email} onChange={setEmail} placeholder="Enter your email" startIcon={EnvelopeIcon} />
        <TextInput label="Username" value={username} onChange={setUsername} placeholder="Enter your username" startIcon={UserIcon} />
      </div>;
  }
}`,...y.parameters?.docs?.source}}};C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState(args.value ?? 'invalid@');
    return <TextInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Email',
    placeholder: 'Enter your email',
    status: {
      type: 'error',
      message: 'Please enter a valid email address'
    }
  }
}`,...C.parameters?.docs?.source}}};I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState(args.value ?? 'user123');
    return <TextInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Username',
    placeholder: 'Enter your username',
    status: {
      type: 'warning',
      message: 'This username is already taken'
    }
  }
}`,...I.parameters?.docs?.source}}};T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState(args.value ?? 'validuser');
    return <TextInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Username',
    placeholder: 'Enter your username',
    status: {
      type: 'success',
      message: 'Username is available'
    }
  }
}`,...T.parameters?.docs?.source}}};E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState(args.value ?? 'test');
    return <TextInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Field',
    placeholder: 'Enter value',
    status: {
      type: 'error'
    }
  }
}`,...E.parameters?.docs?.source}}};f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [error, setError] = useState('invalid@');
    const [warning, setWarning] = useState('user123');
    const [success, setSuccess] = useState('validuser');
    const [errorNoMsg, setErrorNoMsg] = useState('test');
    return <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      maxWidth: '300px'
    }}>
        <TextInput label="Error with message" value={error} onChange={setError} status={{
        type: 'error',
        message: 'Please enter a valid email'
      }} />
        <TextInput label="Warning with message" value={warning} onChange={setWarning} status={{
        type: 'warning',
        message: 'This username may be taken'
      }} />
        <TextInput label="Success with message" value={success} onChange={setSuccess} status={{
        type: 'success',
        message: 'Username is available'
      }} />
        <TextInput label="Error without message" value={errorNoMsg} onChange={setErrorNoMsg} status={{
        type: 'error'
      }} />
      </div>;
  }
}`,...f.parameters?.docs?.source}}};w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState(args.value ?? '');
    return <TextInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'API Key',
    placeholder: 'Enter your API key',
    labelTooltip: 'Your unique API key for authentication. Keep this secret!'
  }
}`,...w.parameters?.docs?.source}}};W.parameters={...W.parameters,docs:{...W.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState(args.value ?? '');
    return <TextInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    type: 'password',
    label: 'Password',
    placeholder: 'Enter your password'
  }
}`,...W.parameters?.docs?.source}}};j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState(args.value ?? '');
    return <TextInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Webhook URL',
    placeholder: 'https://example.com/webhook',
    labelTooltip: 'The URL where we will send event notifications.',
    isOptional: true
  }
}`,...j.parameters?.docs?.source}}};D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState(args.value ?? 'Hello world');
    return <TextInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Search',
    placeholder: 'Type to search...',
    hasClear: true
  }
}`,...D.parameters?.docs?.source}}};O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState(args.value ?? 'invalid-email');
    return <TextInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Email',
    hasClear: true,
    status: {
      type: 'error',
      message: 'Invalid email address'
    }
  }
}`,...O.parameters?.docs?.source}}};const re=["Default","WithDescription","WithHiddenLabel","WithValue","AllVariations","OptionalField","RequiredField","DescriptionWithOptional","Disabled","WithStartIcon","WithStartIconAndSmallSize","SizeVariants","StartIconVariations","ErrorStatus","WarningStatus","SuccessStatus","StatusWithoutMessage","StatusVariations","WithTooltip","Password","TooltipWithOptional","Clearable","ClearableWithStatus"];export{m as AllVariations,D as Clearable,O as ClearableWithStatus,i as Default,v as DescriptionWithOptional,S as Disabled,C as ErrorStatus,h as OptionalField,W as Password,g as RequiredField,V as SizeVariants,y as StartIconVariations,f as StatusVariations,E as StatusWithoutMessage,T as SuccessStatus,j as TooltipWithOptional,I as WarningStatus,c as WithDescription,d as WithHiddenLabel,x as WithStartIcon,b as WithStartIconAndSmallSize,w as WithTooltip,p as WithValue,re as __namedExportsOrder,te as default};
