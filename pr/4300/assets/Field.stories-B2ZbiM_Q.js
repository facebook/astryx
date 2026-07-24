import{i as e,s as t}from"./preload-helper-CT_b8DTk.js";import{t as n}from"./react-B7Te67-h.js";import{t as r}from"./jsx-runtime-DqZldVDK.js";import{t as i}from"./Field-F7ic11LC.js";import{t as a}from"./Field-_NYKg-t6.js";import{n as o,t as s}from"./TextInput-5_HcNm-n.js";import{St as c,t as l}from"./esm-DA7gAIBC.js";var u,d,f,p,m,h,g,_,v,y,b,x,S,C;e((()=>{u=t(n()),a(),s(),l(),d=r(),f=({id:e,describedBy:t,placeholder:n,value:r,onChange:i})=>(0,d.jsx)(`input`,{id:e,"aria-describedby":t,placeholder:n,value:r,onChange:e=>i(e.target.value),className:`xh8yej3 x9f619 x9ynric xif65rj xce4md1 xrrkdod xmkeg23 x1y0btm7 x14i3s5s xh6dtrn x10xzikg x1tgivj0 x1a2a7pz xnw553j`}),p={title:`Core/Field`,component:i,tags:[`autodocs`],argTypes:{label:{control:`text`},isLabelHidden:{control:`boolean`},description:{control:`text`},isOptional:{control:`boolean`},isRequired:{control:`boolean`},labelTooltip:{control:`text`}}},m={args:{label:`Email`},render:e=>{let[t,n]=(0,u.useState)(``);return(0,d.jsx)(i,{...e,inputID:`email-input`,children:(0,d.jsx)(f,{id:`email-input`,placeholder:`you@example.com`,value:t,onChange:n})})}},h={args:{label:`Email`,description:`We'll never share your email.`},render:e=>{let[t,n]=(0,u.useState)(``);return(0,d.jsx)(i,{...e,inputID:`email-desc-input`,descriptionID:`email-desc`,children:(0,d.jsx)(f,{id:`email-desc-input`,describedBy:`email-desc`,placeholder:`you@example.com`,value:t,onChange:n})})}},g={args:{label:`Search`,isLabelHidden:!0},render:e=>{let[t,n]=(0,u.useState)(``);return(0,d.jsx)(i,{...e,inputID:`search-input`,children:(0,d.jsx)(f,{id:`search-input`,placeholder:`Search...`,value:t,onChange:n})})}},_={args:{label:`Nickname`,isOptional:!0},render:e=>{let[t,n]=(0,u.useState)(``);return(0,d.jsx)(i,{...e,inputID:`nickname-input`,children:(0,d.jsx)(f,{id:`nickname-input`,placeholder:`Enter your nickname`,value:t,onChange:n})})}},v={args:{label:`Username`,isRequired:!0},render:e=>{let[t,n]=(0,u.useState)(``);return(0,d.jsx)(i,{...e,inputID:`username-input`,children:(0,d.jsx)(f,{id:`username-input`,placeholder:`Enter your username`,value:t,onChange:n})})}},y={args:{label:`API Key`,labelTooltip:`Your unique API key. Keep this secret!`},render:e=>{let[t,n]=(0,u.useState)(``);return(0,d.jsx)(i,{...e,inputID:`api-key-input`,children:(0,d.jsx)(f,{id:`api-key-input`,placeholder:`sk-...`,value:t,onChange:n})})}},b={args:{label:`Email`,labelIcon:c},render:e=>{let[t,n]=(0,u.useState)(``);return(0,d.jsx)(i,{...e,inputID:`email-icon-input`,children:(0,d.jsx)(f,{id:`email-icon-input`,placeholder:`you@example.com`,value:t,onChange:n})})}},x={render:()=>{let[e,t]=(0,u.useState)({a:``,b:``,c:``,d:``,e:``}),n=e=>n=>t(t=>({...t,[e]:n}));return(0,d.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:24,maxWidth:320},children:[(0,d.jsx)(i,{label:`Default`,inputID:`v-a`,children:(0,d.jsx)(f,{id:`v-a`,value:e.a,onChange:n(`a`)})}),(0,d.jsx)(i,{label:`With description`,description:`Some helpful info`,inputID:`v-b`,descriptionID:`v-b-desc`,children:(0,d.jsx)(f,{id:`v-b`,describedBy:`v-b-desc`,value:e.b,onChange:n(`b`)})}),(0,d.jsx)(i,{label:`Optional`,isOptional:!0,inputID:`v-c`,children:(0,d.jsx)(f,{id:`v-c`,value:e.c,onChange:n(`c`)})}),(0,d.jsx)(i,{label:`Required`,isRequired:!0,inputID:`v-d`,children:(0,d.jsx)(f,{id:`v-d`,value:e.d,onChange:n(`d`)})}),(0,d.jsx)(i,{label:`With tooltip`,labelTooltip:`Extra info here`,inputID:`v-e`,children:(0,d.jsx)(f,{id:`v-e`,value:e.e,onChange:n(`e`)})})]})}},S={render:()=>{let[e,t]=(0,u.useState)({error:`bad-email`,warning:`admin`,success:`valid-user`}),n=e=>n=>t(t=>({...t,[e]:n}));return(0,d.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:24,maxWidth:400},children:[(0,d.jsx)(o,{label:`Email`,description:`Enter your work email`,value:e.error,onChange:n(`error`),status:{type:`error`,message:`Please enter a valid email address`}}),(0,d.jsx)(o,{label:`Username`,description:`Choose a unique username`,value:e.warning,onChange:n(`warning`),status:{type:`warning`,message:`This username is reserved for administrators`}}),(0,d.jsx)(o,{label:`API Key`,description:`Paste your API key`,value:e.success,onChange:n(`success`),status:{type:`success`,message:`API key is valid and active`}})]})}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Email'
  },
  render: args => {
    const [value, setValue] = useState('');
    return <Field {...args} inputID="email-input">
        <NativeInput id="email-input" placeholder="you@example.com" value={value} onChange={setValue} />
      </Field>;
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
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
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
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
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
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
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
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
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
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
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
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
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
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
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
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
}`,...S.parameters?.docs?.source}}},C=[`Default`,`WithDescription`,`WithHiddenLabel`,`OptionalField`,`RequiredField`,`WithTooltip`,`WithLabelIcon`,`AllVariations`,`StatusVariants`]}))();export{x as AllVariations,m as Default,_ as OptionalField,v as RequiredField,S as StatusVariants,h as WithDescription,g as WithHiddenLabel,b as WithLabelIcon,y as WithTooltip,C as __namedExportsOrder,p as default};