import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{t}from"./react-BZJXY1be.js";import{t as n}from"./jsx-runtime-DeHZSEgm.js";import{n as r,t as i}from"./Field-DZ-q02Vq.js";import{n as a,t as o}from"./TextInput-BwKW_f5i.js";import{n as s,t as c}from"./EnvelopeIcon-Cl5_Sctl.js";var l,u,d,f,p,m,h,g,_,v,y,b,x,S;function C(){return(C=e((()=>{l=t(),r(),a(),s(),u=n(),d=({id:e,describedBy:t,placeholder:n,value:r,onChange:i})=>(0,u.jsx)(`input`,{id:e,"aria-describedby":t,placeholder:n,value:r,onChange:e=>i(e.target.value),className:`xh8yej3 x9f619 x9ynric xif65rj xce4md1 xrrkdod xmkeg23 x1y0btm7 x14i3s5s xh6dtrn x10xzikg x1tgivj0 x1a2a7pz xnw553j`}),f={title:`Core/Field`,component:i,tags:[`autodocs`],argTypes:{label:{control:`text`},isLabelHidden:{control:`boolean`},description:{control:`text`},isOptional:{control:`boolean`},isRequired:{control:`boolean`},labelTooltip:{control:`text`}}},p={args:{label:`Email`},render:e=>{let[t,n]=(0,l.useState)(``);return(0,u.jsx)(i,{...e,inputID:`email-input`,children:(0,u.jsx)(d,{id:`email-input`,placeholder:`you@example.com`,value:t,onChange:n})})}},m={args:{label:`Email`,description:`We'll never share your email.`},render:e=>{let[t,n]=(0,l.useState)(``);return(0,u.jsx)(i,{...e,inputID:`email-desc-input`,descriptionID:`email-desc`,children:(0,u.jsx)(d,{id:`email-desc-input`,describedBy:`email-desc`,placeholder:`you@example.com`,value:t,onChange:n})})}},h={args:{label:`Search`,isLabelHidden:!0},render:e=>{let[t,n]=(0,l.useState)(``);return(0,u.jsx)(i,{...e,inputID:`search-input`,children:(0,u.jsx)(d,{id:`search-input`,placeholder:`Search...`,value:t,onChange:n})})}},g={args:{label:`Nickname`,isOptional:!0},render:e=>{let[t,n]=(0,l.useState)(``);return(0,u.jsx)(i,{...e,inputID:`nickname-input`,children:(0,u.jsx)(d,{id:`nickname-input`,placeholder:`Enter your nickname`,value:t,onChange:n})})}},_={args:{label:`Username`,isRequired:!0},render:e=>{let[t,n]=(0,l.useState)(``);return(0,u.jsx)(i,{...e,inputID:`username-input`,children:(0,u.jsx)(d,{id:`username-input`,placeholder:`Enter your username`,value:t,onChange:n})})}},v={args:{label:`API Key`,labelTooltip:`Your unique API key. Keep this secret!`},render:e=>{let[t,n]=(0,l.useState)(``);return(0,u.jsx)(i,{...e,inputID:`api-key-input`,children:(0,u.jsx)(d,{id:`api-key-input`,placeholder:`sk-...`,value:t,onChange:n})})}},y={args:{label:`Email`,labelIcon:c},render:e=>{let[t,n]=(0,l.useState)(``);return(0,u.jsx)(i,{...e,inputID:`email-icon-input`,children:(0,u.jsx)(d,{id:`email-icon-input`,placeholder:`you@example.com`,value:t,onChange:n})})}},b={render:()=>{let[e,t]=(0,l.useState)({a:``,b:``,c:``,d:``,e:``}),n=e=>n=>t(t=>({...t,[e]:n}));return(0,u.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:24,maxWidth:320},children:[(0,u.jsx)(i,{label:`Default`,inputID:`v-a`,children:(0,u.jsx)(d,{id:`v-a`,value:e.a,onChange:n(`a`)})}),(0,u.jsx)(i,{label:`With description`,description:`Some helpful info`,inputID:`v-b`,descriptionID:`v-b-desc`,children:(0,u.jsx)(d,{id:`v-b`,describedBy:`v-b-desc`,value:e.b,onChange:n(`b`)})}),(0,u.jsx)(i,{label:`Optional`,isOptional:!0,inputID:`v-c`,children:(0,u.jsx)(d,{id:`v-c`,value:e.c,onChange:n(`c`)})}),(0,u.jsx)(i,{label:`Required`,isRequired:!0,inputID:`v-d`,children:(0,u.jsx)(d,{id:`v-d`,value:e.d,onChange:n(`d`)})}),(0,u.jsx)(i,{label:`With tooltip`,labelTooltip:`Extra info here`,inputID:`v-e`,children:(0,u.jsx)(d,{id:`v-e`,value:e.e,onChange:n(`e`)})})]})}},x={render:()=>{let[e,t]=(0,l.useState)({error:`bad-email`,warning:`admin`,success:`valid-user`}),n=e=>n=>t(t=>({...t,[e]:n}));return(0,u.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:24,maxWidth:400},children:[(0,u.jsx)(o,{label:`Email`,description:`Enter your work email`,value:e.error,onChange:n(`error`),status:{type:`error`,message:`Please enter a valid email address`}}),(0,u.jsx)(o,{label:`Username`,description:`Choose a unique username`,value:e.warning,onChange:n(`warning`),status:{type:`warning`,message:`This username is reserved for administrators`}}),(0,u.jsx)(o,{label:`API Key`,description:`Paste your API key`,value:e.success,onChange:n(`success`),status:{type:`success`,message:`API key is valid and active`}})]})}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Email'
  },
  render: args => {
    const [value, setValue] = useState('');
    return <Field {...args} inputID="email-input">
        <NativeInput id="email-input" placeholder="you@example.com" value={value} onChange={setValue} />
      </Field>;
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Email',
    description: "We'll never share your email."
  },
  render: args => {
    const [value, setValue] = useState('');
    return <Field {...args} inputID="email-desc-input" descriptionID="email-desc">
        <NativeInput id="email-desc-input" describedBy="email-desc" placeholder="you@example.com" value={value} onChange={setValue} />
      </Field>;
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Search',
    isLabelHidden: true
  },
  render: args => {
    const [value, setValue] = useState('');
    return <Field {...args} inputID="search-input">
        <NativeInput id="search-input" placeholder="Search..." value={value} onChange={setValue} />
      </Field>;
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Nickname',
    isOptional: true
  },
  render: args => {
    const [value, setValue] = useState('');
    return <Field {...args} inputID="nickname-input">
        <NativeInput id="nickname-input" placeholder="Enter your nickname" value={value} onChange={setValue} />
      </Field>;
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Username',
    isRequired: true
  },
  render: args => {
    const [value, setValue] = useState('');
    return <Field {...args} inputID="username-input">
        <NativeInput id="username-input" placeholder="Enter your username" value={value} onChange={setValue} />
      </Field>;
  }
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'API Key',
    labelTooltip: 'Your unique API key. Keep this secret!'
  },
  render: args => {
    const [value, setValue] = useState('');
    return <Field {...args} inputID="api-key-input">
        <NativeInput id="api-key-input" placeholder="sk-..." value={value} onChange={setValue} />
      </Field>;
  }
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Email',
    labelIcon: EnvelopeIcon
  },
  render: args => {
    const [value, setValue] = useState('');
    return <Field {...args} inputID="email-icon-input">
        <NativeInput id="email-icon-input" placeholder="you@example.com" value={value} onChange={setValue} />
      </Field>;
  }
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [vals, setVals] = useState({
      a: '',
      b: '',
      c: '',
      d: '',
      e: ''
    });
    const set = (k: keyof typeof vals) => (v: string) => setVals(prev => ({
      ...prev,
      [k]: v
    }));
    return <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 24,
      maxWidth: 320
    }}>
        <Field label="Default" inputID="v-a">
          <NativeInput id="v-a" value={vals.a} onChange={set('a')} />
        </Field>
        <Field label="With description" description="Some helpful info" inputID="v-b" descriptionID="v-b-desc">
          <NativeInput id="v-b" describedBy="v-b-desc" value={vals.b} onChange={set('b')} />
        </Field>
        <Field label="Optional" isOptional inputID="v-c">
          <NativeInput id="v-c" value={vals.c} onChange={set('c')} />
        </Field>
        <Field label="Required" isRequired inputID="v-d">
          <NativeInput id="v-d" value={vals.d} onChange={set('d')} />
        </Field>
        <Field label="With tooltip" labelTooltip="Extra info here" inputID="v-e">
          <NativeInput id="v-e" value={vals.e} onChange={set('e')} />
        </Field>
      </div>;
  }
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [vals, setVals] = useState({
      error: 'bad-email',
      warning: 'admin',
      success: 'valid-user'
    });
    const set = (k: keyof typeof vals) => (v: string) => setVals(prev => ({
      ...prev,
      [k]: v
    }));
    return <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 24,
      maxWidth: 400
    }}>
        <TextInput label="Email" description="Enter your work email" value={vals.error} onChange={set('error')} status={{
        type: 'error',
        message: 'Please enter a valid email address'
      }} />
        <TextInput label="Username" description="Choose a unique username" value={vals.warning} onChange={set('warning')} status={{
        type: 'warning',
        message: 'This username is reserved for administrators'
      }} />
        <TextInput label="API Key" description="Paste your API key" value={vals.success} onChange={set('success')} status={{
        type: 'success',
        message: 'API key is valid and active'
      }} />
      </div>;
  }
}`,...x.parameters?.docs?.source}}},S=[`Default`,`WithDescription`,`WithHiddenLabel`,`OptionalField`,`RequiredField`,`WithTooltip`,`WithLabelIcon`,`AllVariations`,`StatusVariants`]})))()}C();export{b as AllVariations,p as Default,g as OptionalField,_ as RequiredField,x as StatusVariants,m as WithDescription,h as WithHiddenLabel,y as WithLabelIcon,v as WithTooltip,S as __namedExportsOrder,f as default};