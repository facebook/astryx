import{ah as n,a1 as e}from"./iframe-JfpySt6L.js";import{F as t}from"./Field-el4uhoSa.js";import{T as I}from"./TextInput-ArO3wuiH.js";import{F as y}from"./EnvelopeIcon-B7teYQW4.js";import"./preload-helper-Ct5FWWRu.js";import"./FieldStatus-DZfAoZoW.js";import"./inputStyles.stylex-Bpqcd25J.js";import"./groupStyles-BxNCaWAq.js";import"./useInputContainer-CXeMYSNT.js";import"./useClickableContainer-CtVp9nie.js";const i=({id:a,describedBy:r,placeholder:s,value:l,onChange:o})=>e.jsx("input",{id:a,"aria-describedby":r,placeholder:s,value:l,onChange:u=>o(u.target.value),className:"xh8yej3 x9f619 x9ynric xif65rj xce4md1 xrrkdod xmkeg23 x1y0btm7 x14i3s5s xh6dtrn x10xzikg x1tgivj0 x1a2a7pz xnw553j"}),N={title:"Core/Field",component:t,tags:["autodocs"],argTypes:{label:{control:"text"},isLabelHidden:{control:"boolean"},description:{control:"text"},isOptional:{control:"boolean"},isRequired:{control:"boolean"},labelTooltip:{control:"text"}}},d={args:{label:"Email"},render:a=>{const[r,s]=n.useState("");return e.jsx(t,{...a,inputID:"email-input",children:e.jsx(i,{id:"email-input",placeholder:"you@example.com",value:r,onChange:s})})}},c={args:{label:"Email",description:"We'll never share your email."},render:a=>{const[r,s]=n.useState("");return e.jsx(t,{...a,inputID:"email-desc-input",descriptionID:"email-desc",children:e.jsx(i,{id:"email-desc-input",describedBy:"email-desc",placeholder:"you@example.com",value:r,onChange:s})})}},p={args:{label:"Search",isLabelHidden:!0},render:a=>{const[r,s]=n.useState("");return e.jsx(t,{...a,inputID:"search-input",children:e.jsx(i,{id:"search-input",placeholder:"Search...",value:r,onChange:s})})}},m={args:{label:"Nickname",isOptional:!0},render:a=>{const[r,s]=n.useState("");return e.jsx(t,{...a,inputID:"nickname-input",children:e.jsx(i,{id:"nickname-input",placeholder:"Enter your nickname",value:r,onChange:s})})}},v={args:{label:"Username",isRequired:!0},render:a=>{const[r,s]=n.useState("");return e.jsx(t,{...a,inputID:"username-input",children:e.jsx(i,{id:"username-input",placeholder:"Enter your username",value:r,onChange:s})})}},h={args:{label:"API Key",labelTooltip:"Your unique API key. Keep this secret!"},render:a=>{const[r,s]=n.useState("");return e.jsx(t,{...a,inputID:"api-key-input",children:e.jsx(i,{id:"api-key-input",placeholder:"sk-...",value:r,onChange:s})})}},g={args:{label:"Email",labelIcon:y},render:a=>{const[r,s]=n.useState("");return e.jsx(t,{...a,inputID:"email-icon-input",children:e.jsx(i,{id:"email-icon-input",placeholder:"you@example.com",value:r,onChange:s})})}},x={render:()=>{const[a,r]=n.useState({a:"",b:"",c:"",d:"",e:""}),s=l=>o=>r(u=>({...u,[l]:o}));return e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:24,maxWidth:320},children:[e.jsx(t,{label:"Default",inputID:"v-a",children:e.jsx(i,{id:"v-a",value:a.a,onChange:s("a")})}),e.jsx(t,{label:"With description",description:"Some helpful info",inputID:"v-b",descriptionID:"v-b-desc",children:e.jsx(i,{id:"v-b",describedBy:"v-b-desc",value:a.b,onChange:s("b")})}),e.jsx(t,{label:"Optional",isOptional:!0,inputID:"v-c",children:e.jsx(i,{id:"v-c",value:a.c,onChange:s("c")})}),e.jsx(t,{label:"Required",isRequired:!0,inputID:"v-d",children:e.jsx(i,{id:"v-d",value:a.d,onChange:s("d")})}),e.jsx(t,{label:"With tooltip",labelTooltip:"Extra info here",inputID:"v-e",children:e.jsx(i,{id:"v-e",value:a.e,onChange:s("e")})})]})}},b={render:()=>{const[a,r]=n.useState({error:"bad-email",warning:"admin",success:"valid-user"}),s=l=>o=>r(u=>({...u,[l]:o}));return e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:24,maxWidth:400},children:[e.jsx(I,{label:"Email",description:"Enter your work email",value:a.error,onChange:s("error"),status:{type:"error",message:"Please enter a valid email address"}}),e.jsx(I,{label:"Username",description:"Choose a unique username",value:a.warning,onChange:s("warning"),status:{type:"warning",message:"This username is reserved for administrators"}}),e.jsx(I,{label:"API Key",description:"Paste your API key",value:a.success,onChange:s("success"),status:{type:"success",message:"API key is valid and active"}})]})}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Email'
  },
  render: args => {
    const [value, setValue] = useState('');
    return <Field {...args} inputID="email-input">
        <NativeInput id="email-input" placeholder="you@example.com" value={value} onChange={setValue} />
      </Field>;
  }
}`,...d.parameters?.docs?.source}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
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
}`,...c.parameters?.docs?.source}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
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
}`,...p.parameters?.docs?.source}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
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
}`,...m.parameters?.docs?.source}}};v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
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
}`,...v.parameters?.docs?.source}}};h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
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
}`,...h.parameters?.docs?.source}}};g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
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
}`,...g.parameters?.docs?.source}}};x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
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
}`,...x.parameters?.docs?.source}}};b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
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
}`,...b.parameters?.docs?.source}}};const T=["Default","WithDescription","WithHiddenLabel","OptionalField","RequiredField","WithTooltip","WithLabelIcon","AllVariations","StatusVariants"];export{x as AllVariations,d as Default,m as OptionalField,v as RequiredField,b as StatusVariants,c as WithDescription,p as WithHiddenLabel,g as WithLabelIcon,h as WithTooltip,T as __namedExportsOrder,N as default};
