import{i as e,s as t}from"./preload-helper-CT_b8DTk.js";import{t as n}from"./react-B7Te67-h.js";import{t as r}from"./jsx-runtime-DqZldVDK.js";import{t as i}from"./Field-Bq4ZnWsH.js";import{l as a,t as o}from"./Field-C3bX2RJP.js";import{n as s,t as c}from"./TextInput-Cw_jlLAq.js";import{St as l,t as u}from"./esm-DA7gAIBC.js";var d,f,p,m,h,g,_,v,y,b,x,S,C,w,T,E;e((()=>{d=t(n()),o(),c(),u(),f=r(),p=({id:e,describedBy:t,placeholder:n,value:r,onChange:i})=>(0,f.jsx)(`input`,{id:e,"aria-describedby":t,placeholder:n,value:r,onChange:e=>i(e.target.value),className:`xh8yej3 x9f619 x9ynric xif65rj xce4md1 xrrkdod xmkeg23 x1y0btm7 x14i3s5s xh6dtrn x10xzikg x1tgivj0 x1a2a7pz xnw553j`}),m={title:`Core/Field`,component:i,tags:[`autodocs`],argTypes:{label:{control:`text`},isLabelHidden:{control:`boolean`},description:{control:`text`},isOptional:{control:`boolean`},isRequired:{control:`boolean`},requiredIndicator:{control:`select`,options:[`text`,`asterisk`,`none`]},optionalIndicator:{control:`select`,options:[`text`,`none`]},labelTooltip:{control:`text`}}},h={args:{label:`Email`},render:e=>{let[t,n]=(0,d.useState)(``);return(0,f.jsx)(i,{...e,inputID:`email-input`,children:(0,f.jsx)(p,{id:`email-input`,placeholder:`you@example.com`,value:t,onChange:n})})}},g={args:{label:`Email`,description:`We'll never share your email.`},render:e=>{let[t,n]=(0,d.useState)(``);return(0,f.jsx)(i,{...e,inputID:`email-desc-input`,descriptionID:`email-desc`,children:(0,f.jsx)(p,{id:`email-desc-input`,describedBy:`email-desc`,placeholder:`you@example.com`,value:t,onChange:n})})}},_={args:{label:`Search`,isLabelHidden:!0},render:e=>{let[t,n]=(0,d.useState)(``);return(0,f.jsx)(i,{...e,inputID:`search-input`,children:(0,f.jsx)(p,{id:`search-input`,placeholder:`Search...`,value:t,onChange:n})})}},v={args:{label:`Nickname`,isOptional:!0},render:e=>{let[t,n]=(0,d.useState)(``);return(0,f.jsx)(i,{...e,inputID:`nickname-input`,children:(0,f.jsx)(p,{id:`nickname-input`,placeholder:`Enter your nickname`,value:t,onChange:n})})}},y={args:{label:`Username`,isRequired:!0},render:e=>{let[t,n]=(0,d.useState)(``);return(0,f.jsx)(i,{...e,inputID:`username-input`,children:(0,f.jsx)(p,{id:`username-input`,placeholder:`Enter your username`,value:t,onChange:n})})}},b={name:`Required (asterisk)`,args:{label:`Username`,isRequired:!0,requiredIndicator:`asterisk`},render:e=>{let[t,n]=(0,d.useState)(``);return(0,f.jsx)(i,{...e,inputID:`username-asterisk-input`,children:(0,f.jsx)(p,{id:`username-asterisk-input`,placeholder:`Enter your username`,value:t,onChange:n})})}},x={name:`Provider: mark only optional`,render:()=>{let[e,t]=(0,d.useState)(``),[n,r]=(0,d.useState)(``);return(0,f.jsx)(a,{requiredIndicator:`none`,optionalIndicator:`text`,children:(0,f.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:16},children:[(0,f.jsx)(i,{label:`Username`,isRequired:!0,inputID:`mo-username`,children:(0,f.jsx)(p,{id:`mo-username`,placeholder:`Required — no indicator`,value:e,onChange:t})}),(0,f.jsx)(i,{label:`Nickname`,isOptional:!0,inputID:`mo-nickname`,children:(0,f.jsx)(p,{id:`mo-nickname`,placeholder:`Shows Optional`,value:n,onChange:r})})]})})}},S={args:{label:`API Key`,labelTooltip:`Your unique API key. Keep this secret!`},render:e=>{let[t,n]=(0,d.useState)(``);return(0,f.jsx)(i,{...e,inputID:`api-key-input`,children:(0,f.jsx)(p,{id:`api-key-input`,placeholder:`sk-...`,value:t,onChange:n})})}},C={args:{label:`Email`,labelIcon:l},render:e=>{let[t,n]=(0,d.useState)(``);return(0,f.jsx)(i,{...e,inputID:`email-icon-input`,children:(0,f.jsx)(p,{id:`email-icon-input`,placeholder:`you@example.com`,value:t,onChange:n})})}},w={render:()=>{let[e,t]=(0,d.useState)({a:``,b:``,c:``,d:``,e:``}),n=e=>n=>t(t=>({...t,[e]:n}));return(0,f.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:24,maxWidth:320},children:[(0,f.jsx)(i,{label:`Default`,inputID:`v-a`,children:(0,f.jsx)(p,{id:`v-a`,value:e.a,onChange:n(`a`)})}),(0,f.jsx)(i,{label:`With description`,description:`Some helpful info`,inputID:`v-b`,descriptionID:`v-b-desc`,children:(0,f.jsx)(p,{id:`v-b`,describedBy:`v-b-desc`,value:e.b,onChange:n(`b`)})}),(0,f.jsx)(i,{label:`Optional`,isOptional:!0,inputID:`v-c`,children:(0,f.jsx)(p,{id:`v-c`,value:e.c,onChange:n(`c`)})}),(0,f.jsx)(i,{label:`Required`,isRequired:!0,inputID:`v-d`,children:(0,f.jsx)(p,{id:`v-d`,value:e.d,onChange:n(`d`)})}),(0,f.jsx)(i,{label:`With tooltip`,labelTooltip:`Extra info here`,inputID:`v-e`,children:(0,f.jsx)(p,{id:`v-e`,value:e.e,onChange:n(`e`)})})]})}},T={render:()=>{let[e,t]=(0,d.useState)({error:`bad-email`,warning:`admin`,success:`valid-user`}),n=e=>n=>t(t=>({...t,[e]:n}));return(0,f.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:24,maxWidth:400},children:[(0,f.jsx)(s,{label:`Email`,description:`Enter your work email`,value:e.error,onChange:n(`error`),status:{type:`error`,message:`Please enter a valid email address`}}),(0,f.jsx)(s,{label:`Username`,description:`Choose a unique username`,value:e.warning,onChange:n(`warning`),status:{type:`warning`,message:`This username is reserved for administrators`}}),(0,f.jsx)(s,{label:`API Key`,description:`Paste your API key`,value:e.success,onChange:n(`success`),status:{type:`success`,message:`API key is valid and active`}})]})}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Email'
  },
  render: args => {
    const [value, setValue] = useState('');
    return <Field {...args} inputID="email-input">
        <NativeInput id="email-input" placeholder="you@example.com" value={value} onChange={setValue} />
      </Field>;
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
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
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
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
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
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
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
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
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  name: 'Required (asterisk)',
  args: {
    label: 'Username',
    isRequired: true,
    requiredIndicator: 'asterisk'
  },
  render: args => {
    const [value, setValue] = useState('');
    return <Field {...args} inputID="username-asterisk-input">
        <NativeInput id="username-asterisk-input" placeholder="Enter your username" value={value} onChange={setValue} />
      </Field>;
  }
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  name: 'Provider: mark only optional',
  render: () => {
    const [a, setA] = useState('');
    const [b, setB] = useState('');
    // Required fields show nothing; optional fields show "Optional".
    return <FieldProvider requiredIndicator="none" optionalIndicator="text">
        <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 16
      }}>
          <Field label="Username" isRequired inputID="mo-username">
            <NativeInput id="mo-username" placeholder="Required — no indicator" value={a} onChange={setA} />
          </Field>
          <Field label="Nickname" isOptional inputID="mo-nickname">
            <NativeInput id="mo-nickname" placeholder="Shows Optional" value={b} onChange={setB} />
          </Field>
        </div>
      </FieldProvider>;
  }
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
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
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
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
}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
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
}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
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
}`,...T.parameters?.docs?.source}}},E=[`Default`,`WithDescription`,`WithHiddenLabel`,`OptionalField`,`RequiredField`,`RequiredAsterisk`,`MarkOnlyOptional`,`WithTooltip`,`WithLabelIcon`,`AllVariations`,`StatusVariants`]}))();export{w as AllVariations,h as Default,x as MarkOnlyOptional,v as OptionalField,b as RequiredAsterisk,y as RequiredField,T as StatusVariants,g as WithDescription,_ as WithHiddenLabel,C as WithLabelIcon,S as WithTooltip,E as __namedExportsOrder,m as default};