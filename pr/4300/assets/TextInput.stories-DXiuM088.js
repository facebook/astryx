import{i as e,s as t}from"./preload-helper-CT_b8DTk.js";import{t as n}from"./react-B7Te67-h.js";import{t as r}from"./jsx-runtime-DqZldVDK.js";import{n as i,t as a}from"./TextInput-5_HcNm-n.js";import{St as o,W as s,o as c,t as l}from"./esm-DA7gAIBC.js";var u,d,f,p,m,h,g,_,v,y,b,x,S,C,w,T,E,D,O,k,A,j,M,N,P,F,I,L;e((()=>{u=t(n()),a(),l(),d=r(),f={title:`Core/TextInput`,component:i,tags:[`autodocs`],argTypes:{label:{control:`text`,description:`Label text (required)`},isLabelHidden:{control:`boolean`,description:`Visually hide the label (still accessible to screen readers)`},placeholder:{control:`text`,description:`Placeholder text`},description:{control:`text`,description:`Description text displayed between the label and input`},value:{control:`text`,description:`Current input value (required)`},size:{control:`select`,options:[`sm`,`md`,`lg`],description:`Size variant`},isOptional:{control:`boolean`,description:`Whether the field is optional (mutually exclusive with isRequired)`},isRequired:{control:`boolean`,description:`Whether the field is required (mutually exclusive with isOptional)`},isDisabled:{control:`boolean`,description:`Whether the input is disabled`},disabledMessage:{control:`text`,description:`Explains why the input is disabled. With isDisabled, shows a tooltip on hover/keyboard focus and keeps the input focusable via aria-disabled (the field becomes read-only). Use this instead of wrapping a disabled TextInput in Tooltip.`},status:{control:`object`,description:`Status indicator with type (warning/error/success) and optional message`},labelTooltip:{control:`text`,description:`Tooltip text to display in an info icon at the end of the label`}}},p={render:e=>{let[t,n]=(0,u.useState)(e.value??``);return(0,d.jsx)(i,{...e,value:t,onChange:n})},args:{label:`Name`,placeholder:`Enter your name`}},m={render:e=>{let[t,n]=(0,u.useState)(e.value??``);return(0,d.jsx)(i,{...e,value:t,onChange:n})},args:{label:`Email`,description:`We'll never share your email with anyone.`,placeholder:`Enter your email`}},h={render:e=>{let[t,n]=(0,u.useState)(e.value??``);return(0,d.jsx)(i,{...e,value:t,onChange:n})},args:{label:`Search`,isLabelHidden:!0,placeholder:`Search...`}},g={render:e=>{let[t,n]=(0,u.useState)(e.value??`Hello, world!`);return(0,d.jsx)(i,{...e,value:t,onChange:n})},args:{label:`Greeting`,value:`Hello, world!`}},_={render:()=>{let[e,t]=(0,u.useState)(``),[n,r]=(0,u.useState)(``),[a,o]=(0,u.useState)(`Pre-filled value`),[s,c]=(0,u.useState)(``),[l,f]=(0,u.useState)(``),[p,m]=(0,u.useState)(``),[h,g]=(0,u.useState)(``),[_,v]=(0,u.useState)(`Disabled input`);return(0,d.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`16px`,maxWidth:`300px`},children:[(0,d.jsx)(i,{label:`Visible label`,value:e,onChange:t,placeholder:`Enter text...`}),(0,d.jsx)(i,{label:`With description`,description:`Helpful description text`,value:s,onChange:c,placeholder:`Enter text...`}),(0,d.jsx)(i,{label:`Hidden label`,isLabelHidden:!0,value:n,onChange:r,placeholder:`Hidden label input`}),(0,d.jsx)(i,{label:`With value`,value:a,onChange:o}),(0,d.jsx)(i,{label:`Optional field`,isOptional:!0,value:l,onChange:f,placeholder:`Optional...`}),(0,d.jsx)(i,{label:`Required field`,isRequired:!0,value:p,onChange:m,placeholder:`Required...`}),(0,d.jsx)(i,{label:`Description with optional`,description:`Enter your nickname`,isOptional:!0,value:h,onChange:g,placeholder:`Nickname...`}),(0,d.jsx)(i,{label:`Disabled field`,isDisabled:!0,value:_,onChange:v})]})}},v={render:e=>{let[t,n]=(0,u.useState)(e.value??``);return(0,d.jsx)(i,{...e,value:t,onChange:n})},args:{label:`Nickname`,isOptional:!0,placeholder:`Enter your nickname`}},y={render:e=>{let[t,n]=(0,u.useState)(e.value??``);return(0,d.jsx)(i,{...e,value:t,onChange:n})},args:{label:`Username`,isRequired:!0,placeholder:`Enter your username`}},b={render:e=>{let[t,n]=(0,u.useState)(e.value??``);return(0,d.jsx)(i,{...e,value:t,onChange:n})},args:{label:`Bio`,description:`Tell us about yourself`,isOptional:!0,placeholder:`Your bio here...`}},x={render:e=>{let[t,n]=(0,u.useState)(e.value??`Cannot edit this`);return(0,d.jsx)(i,{...e,value:t,onChange:n})},args:{label:`Locked Field`,isDisabled:!0,value:`Cannot edit this`}},S={render:e=>{let[t,n]=(0,u.useState)(e.value??`alice@example.com`);return(0,d.jsx)(i,{...e,value:t,onChange:n})},args:{label:`Owner`,isDisabled:!0,disabledMessage:`You need the Editor role to change this`,value:`alice@example.com`}},C={render:e=>{let[t,n]=(0,u.useState)(e.value??``);return(0,d.jsx)(i,{...e,value:t,onChange:n})},args:{label:`Search`,placeholder:`Search...`,startIcon:s}},w={render:e=>{let[t,n]=(0,u.useState)(e.value??``);return(0,d.jsx)(i,{...e,value:t,onChange:n})},args:{label:`Search`,placeholder:`Search...`,startIcon:s,size:`sm`}},T={render:()=>{let[e,t]=(0,u.useState)(``),[n,r]=(0,u.useState)(``),[a,o]=(0,u.useState)(``);return(0,d.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`16px`,maxWidth:`300px`},children:[(0,d.jsx)(i,{label:`Small (28px)`,value:e,onChange:t,placeholder:`Small size`,size:`sm`}),(0,d.jsx)(i,{label:`Medium (32px)`,value:n,onChange:r,placeholder:`Medium size (default)`,size:`md`}),(0,d.jsx)(i,{label:`Large (36px)`,value:a,onChange:o,placeholder:`Large size`,size:`lg`})]})}},E={render:()=>{let[e,t]=(0,u.useState)(``),[n,r]=(0,u.useState)(``),[a,l]=(0,u.useState)(``);return(0,d.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`16px`,maxWidth:`300px`},children:[(0,d.jsx)(i,{label:`Search`,value:e,onChange:t,placeholder:`Search...`,startIcon:s}),(0,d.jsx)(i,{label:`Email`,value:n,onChange:r,placeholder:`Enter your email`,startIcon:o}),(0,d.jsx)(i,{label:`Username`,value:a,onChange:l,placeholder:`Enter your username`,startIcon:c})]})}},D={render:e=>{let[t,n]=(0,u.useState)(e.value??`invalid@`);return(0,d.jsx)(i,{...e,value:t,onChange:n})},args:{label:`Email`,placeholder:`Enter your email`,status:{type:`error`,message:`Please enter a valid email address`}}},O={render:e=>{let[t,n]=(0,u.useState)(e.value??`user123`);return(0,d.jsx)(i,{...e,value:t,onChange:n})},args:{label:`Username`,placeholder:`Enter your username`,status:{type:`warning`,message:`This username is already taken`}}},k={render:e=>{let[t,n]=(0,u.useState)(e.value??`validuser`);return(0,d.jsx)(i,{...e,value:t,onChange:n})},args:{label:`Username`,placeholder:`Enter your username`,status:{type:`success`,message:`Username is available`}}},A={render:e=>{let[t,n]=(0,u.useState)(e.value??`test`);return(0,d.jsx)(i,{...e,value:t,onChange:n})},args:{label:`Field`,placeholder:`Enter value`,status:{type:`error`}}},j={render:()=>{let[e,t]=(0,u.useState)(`invalid@`),[n,r]=(0,u.useState)(`user123`),[a,o]=(0,u.useState)(`validuser`),[s,c]=(0,u.useState)(`test`);return(0,d.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`16px`,maxWidth:`300px`},children:[(0,d.jsx)(i,{label:`Error with message`,value:e,onChange:t,status:{type:`error`,message:`Please enter a valid email`}}),(0,d.jsx)(i,{label:`Warning with message`,value:n,onChange:r,status:{type:`warning`,message:`This username may be taken`}}),(0,d.jsx)(i,{label:`Success with message`,value:a,onChange:o,status:{type:`success`,message:`Username is available`}}),(0,d.jsx)(i,{label:`Error without message`,value:s,onChange:c,status:{type:`error`}})]})}},M={render:e=>{let[t,n]=(0,u.useState)(e.value??``);return(0,d.jsx)(i,{...e,value:t,onChange:n})},args:{label:`API Key`,placeholder:`Enter your API key`,labelTooltip:`Your unique API key for authentication. Keep this secret!`}},N={render:e=>{let[t,n]=(0,u.useState)(e.value??``);return(0,d.jsx)(i,{...e,value:t,onChange:n})},args:{type:`password`,label:`Password`,placeholder:`Enter your password`}},P={render:e=>{let[t,n]=(0,u.useState)(e.value??``);return(0,d.jsx)(i,{...e,value:t,onChange:n})},args:{label:`Webhook URL`,placeholder:`https://example.com/webhook`,labelTooltip:`The URL where we will send event notifications.`,isOptional:!0}},F={render:e=>{let[t,n]=(0,u.useState)(e.value??`Hello world`);return(0,d.jsx)(i,{...e,value:t,onChange:n})},args:{label:`Search`,placeholder:`Type to search...`,hasClear:!0}},I={render:e=>{let[t,n]=(0,u.useState)(e.value??`invalid-email`);return(0,d.jsx)(i,{...e,value:t,onChange:n})},args:{label:`Email`,hasClear:!0,status:{type:`error`,message:`Invalid email address`}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState(args.value ?? '');
    return <TextInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Name',
    placeholder: 'Enter your name'
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState(args.value ?? '');
    return <TextInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Email',
    description: "We'll never share your email with anyone.",
    placeholder: 'Enter your email'
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState(args.value ?? '');
    return <TextInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Search',
    isLabelHidden: true,
    placeholder: 'Search...'
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState(args.value ?? 'Hello, world!');
    return <TextInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Greeting',
    value: 'Hello, world!'
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
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
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState(args.value ?? '');
    return <TextInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Nickname',
    isOptional: true,
    placeholder: 'Enter your nickname'
  }
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState(args.value ?? '');
    return <TextInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Username',
    isRequired: true,
    placeholder: 'Enter your username'
  }
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
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
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState(args.value ?? 'Cannot edit this');
    return <TextInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Locked Field',
    isDisabled: true,
    value: 'Cannot edit this'
  }
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState(args.value ?? 'alice@example.com');
    return <TextInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Owner',
    isDisabled: true,
    disabledMessage: 'You need the Editor role to change this',
    value: 'alice@example.com'
  }
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState(args.value ?? '');
    return <TextInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Search',
    placeholder: 'Search...',
    startIcon: MagnifyingGlassIcon
  }
}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
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
}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
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
}`,...T.parameters?.docs?.source}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
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
}`,...E.parameters?.docs?.source}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
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
}`,...D.parameters?.docs?.source}}},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
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
}`,...O.parameters?.docs?.source}}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
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
}`,...k.parameters?.docs?.source}}},A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
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
}`,...A.parameters?.docs?.source}}},j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
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
}`,...j.parameters?.docs?.source}}},M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState(args.value ?? '');
    return <TextInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'API Key',
    placeholder: 'Enter your API key',
    labelTooltip: 'Your unique API key for authentication. Keep this secret!'
  }
}`,...M.parameters?.docs?.source}}},N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState(args.value ?? '');
    return <TextInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    type: 'password',
    label: 'Password',
    placeholder: 'Enter your password'
  }
}`,...N.parameters?.docs?.source}}},P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
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
}`,...P.parameters?.docs?.source}}},F.parameters={...F.parameters,docs:{...F.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState(args.value ?? 'Hello world');
    return <TextInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Search',
    placeholder: 'Type to search...',
    hasClear: true
  }
}`,...F.parameters?.docs?.source}}},I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{
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
}`,...I.parameters?.docs?.source}}},L=[`Default`,`WithDescription`,`WithHiddenLabel`,`WithValue`,`AllVariations`,`OptionalField`,`RequiredField`,`DescriptionWithOptional`,`Disabled`,`DisabledWithMessage`,`WithStartIcon`,`WithStartIconAndSmallSize`,`SizeVariants`,`StartIconVariations`,`ErrorStatus`,`WarningStatus`,`SuccessStatus`,`StatusWithoutMessage`,`StatusVariations`,`WithTooltip`,`Password`,`TooltipWithOptional`,`Clearable`,`ClearableWithStatus`]}))();export{_ as AllVariations,F as Clearable,I as ClearableWithStatus,p as Default,b as DescriptionWithOptional,x as Disabled,S as DisabledWithMessage,D as ErrorStatus,v as OptionalField,N as Password,y as RequiredField,T as SizeVariants,E as StartIconVariations,j as StatusVariations,A as StatusWithoutMessage,k as SuccessStatus,P as TooltipWithOptional,O as WarningStatus,m as WithDescription,h as WithHiddenLabel,C as WithStartIcon,w as WithStartIconAndSmallSize,M as WithTooltip,g as WithValue,L as __namedExportsOrder,f as default};