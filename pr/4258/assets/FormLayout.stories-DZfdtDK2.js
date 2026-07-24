import{i as e,s as t}from"./preload-helper-CT_b8DTk.js";import{t as n}from"./react-B7Te67-h.js";import{t as r}from"./jsx-runtime-DqZldVDK.js";import{t as i}from"./Text-Bt7jq58k.js";import{t as a}from"./Field-CRkzZr3O.js";import{t as o}from"./Text-BYms8e3u.js";import{t as s}from"./Field-CVpkFa60.js";import{n as c,t as l}from"./Selector-DaPj4CCl.js";import{n as u,t as d}from"./TextInput-rq2cL9Hy.js";import{Tn as f,wn as p}from"./iframe-4XAMyx57.js";function m({direction:e}){let[t,n]=(0,h.useState)(``),[r,i]=(0,h.useState)(``),[a,o]=(0,h.useState)(``);return(0,g.jsxs)(f,{direction:e,children:[(0,g.jsx)(u,{label:`Name`,value:t,onChange:n}),(0,g.jsx)(u,{label:`Email`,value:r,onChange:i}),(0,g.jsx)(u,{label:`Bio`,value:a,onChange:o})]})}var h,g,_,v,y,b,x,S,C,w;e((()=>{h=t(n()),p(),d(),l(),s(),o(),g=r(),_={title:`Core/FormLayout`,component:f,tags:[`autodocs`],args:{direction:`vertical`},argTypes:{direction:{control:`select`,options:[`vertical`,`horizontal`,`horizontal-labels`],description:`Direction of field arrangement`}}},v={name:`Vertical (Default)`,render:e=>(0,g.jsx)(m,{direction:e.direction})},y={name:`Horizontal`,args:{direction:`horizontal`},render:e=>{let[t,n]=(0,h.useState)(``),[r,i]=(0,h.useState)(``);return(0,g.jsxs)(f,{direction:e.direction,children:[(0,g.jsx)(u,{label:`First Name`,value:t,onChange:n}),(0,g.jsx)(u,{label:`Last Name`,value:r,onChange:i})]})}},b={name:`Horizontal Labels (Settings)`,args:{direction:`horizontal-labels`},render:e=>{let[t,n]=(0,h.useState)(`Jane Doe`),[r,i]=(0,h.useState)(`jane@example.com`),[a,o]=(0,h.useState)(`America/Los_Angeles`);return(0,g.jsxs)(f,{direction:e.direction,children:[(0,g.jsx)(u,{label:`Display Name`,value:t,onChange:n}),(0,g.jsx)(u,{label:`Email`,value:r,onChange:i}),(0,g.jsx)(c,{label:`Timezone`,value:a,onChange:e=>o(e),options:[{label:`Pacific Time`,value:`America/Los_Angeles`},{label:`Eastern Time`,value:`America/New_York`},{label:`UTC`,value:`UTC`}]})]})}},x={name:`Mixed Controls`,render:()=>{let[e,t]=(0,h.useState)(``),[n,r]=(0,h.useState)(`viewer`);return(0,g.jsxs)(f,{children:[(0,g.jsx)(u,{label:`Name`,value:e,onChange:t}),(0,g.jsx)(c,{label:`Role`,value:n,onChange:e=>r(e),options:[{label:`Viewer`,value:`viewer`},{label:`Editor`,value:`editor`},{label:`Admin`,value:`admin`}]}),(0,g.jsx)(a,{label:`Notifications`,inputID:`notif-group`,children:(0,g.jsxs)(`div`,{className:`x78zum5 xdt5ytf x1jnr06f`,id:`notif-group`,children:[(0,g.jsxs)(`label`,{className:`x78zum5 x6s0dn4 x167g77z`,children:[(0,g.jsx)(`input`,{type:`checkbox`,defaultChecked:!0}),` Email`]}),(0,g.jsxs)(`label`,{className:`x78zum5 x6s0dn4 x167g77z`,children:[(0,g.jsx)(`input`,{type:`checkbox`}),` SMS`]}),(0,g.jsxs)(`label`,{className:`x78zum5 x6s0dn4 x167g77z`,children:[(0,g.jsx)(`input`,{type:`checkbox`,defaultChecked:!0}),` Push`]})]})})]})}},S={name:`Nested Layouts`,render:()=>{let[e,t]=(0,h.useState)(``),[n,r]=(0,h.useState)(``),[i,a]=(0,h.useState)(``),[o,s]=(0,h.useState)(``),[c,l]=(0,h.useState)(``),[d,p]=(0,h.useState)(``);return(0,g.jsxs)(f,{children:[(0,g.jsxs)(f,{direction:`horizontal`,children:[(0,g.jsx)(u,{label:`First Name`,value:e,onChange:t}),(0,g.jsx)(u,{label:`Last Name`,value:n,onChange:r})]}),(0,g.jsx)(u,{label:`Email`,value:i,onChange:a}),(0,g.jsxs)(f,{direction:`horizontal`,children:[(0,g.jsx)(u,{label:`City`,value:o,onChange:s}),(0,g.jsx)(u,{label:`State`,value:c,onChange:l}),(0,g.jsx)(u,{label:`ZIP`,value:d,onChange:p})]})]})}},C={name:`In a Dialog`,render:()=>{let[e,t]=(0,h.useState)(`Jane Doe`),[n,r]=(0,h.useState)(`jane@example.com`);return(0,g.jsxs)(`div`,{className:`xtfardp xur7f20 x17fpy1y xb3r6kr`,children:[(0,g.jsx)(`div`,{className:`x1tamke2 x915a4u`,children:(0,g.jsx)(i,{type:`label`,children:`Edit Profile`})}),(0,g.jsx)(`div`,{className:`x1tamke2`,children:(0,g.jsx)(`form`,{id:`edit-profile`,onSubmit:t=>{t.preventDefault(),alert(`Saved: ${e}, ${n}`)},children:(0,g.jsxs)(f,{children:[(0,g.jsx)(u,{label:`Name`,value:e,onChange:t}),(0,g.jsx)(u,{label:`Email`,value:n,onChange:r})]})})}),(0,g.jsxs)(`div`,{className:`x78zum5 x13a6bvl x167g77z x1tamke2 xz14g06`,children:[(0,g.jsx)(`button`,{className:`x1ff1495 x1kogg8i x1gs6z28 x1ypdohk xif65rj x1dr8pv1 xka2uk4`,type:`button`,children:`Cancel`}),(0,g.jsx)(`button`,{className:`x1ff1495 x1kogg8i x1gs6z28 x1ypdohk xif65rj xtzjzor xfungia`,type:`submit`,form:`edit-profile`,children:`Save`})]})]})}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  name: 'Vertical (Default)',
  render: args => <FormLayoutDemo direction={args.direction} />
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  name: 'Horizontal',
  args: {
    direction: 'horizontal'
  },
  render: args => {
    const [first, setFirst] = useState('');
    const [last, setLast] = useState('');
    return <FormLayout direction={args.direction}>
        <TextInput label="First Name" value={first} onChange={setFirst} />
        <TextInput label="Last Name" value={last} onChange={setLast} />
      </FormLayout>;
  }
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  name: 'Horizontal Labels (Settings)',
  args: {
    direction: 'horizontal-labels'
  },
  render: args => {
    const [displayName, setDisplayName] = useState('Jane Doe');
    const [email, setEmail] = useState('jane@example.com');
    const [timezone, setTimezone] = useState('America/Los_Angeles');
    return <FormLayout direction={args.direction}>
        <TextInput label="Display Name" value={displayName} onChange={setDisplayName} />
        <TextInput label="Email" value={email} onChange={setEmail} />
        <Selector label="Timezone" value={timezone} onChange={v => setTimezone(v as string)} options={[{
        label: 'Pacific Time',
        value: 'America/Los_Angeles'
      }, {
        label: 'Eastern Time',
        value: 'America/New_York'
      }, {
        label: 'UTC',
        value: 'UTC'
      }]} />
      </FormLayout>;
  }
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  name: 'Mixed Controls',
  render: () => {
    const [name, setName] = useState('');
    const [role, setRole] = useState('viewer');
    return <FormLayout>
        <TextInput label="Name" value={name} onChange={setName} />
        <Selector label="Role" value={role} onChange={v => setRole(v as string)} options={[{
        label: 'Viewer',
        value: 'viewer'
      }, {
        label: 'Editor',
        value: 'editor'
      }, {
        label: 'Admin',
        value: 'admin'
      }]} />
        <Field label="Notifications" inputID="notif-group">
          <div {...stylex.props(checkboxStyles.group)} id="notif-group">
            <label {...stylex.props(checkboxStyles.label)}>
              <input type="checkbox" defaultChecked /> Email
            </label>
            <label {...stylex.props(checkboxStyles.label)}>
              <input type="checkbox" /> SMS
            </label>
            <label {...stylex.props(checkboxStyles.label)}>
              <input type="checkbox" defaultChecked /> Push
            </label>
          </div>
        </Field>
      </FormLayout>;
  }
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  name: 'Nested Layouts',
  render: () => {
    const [first, setFirst] = useState('');
    const [last, setLast] = useState('');
    const [email, setEmail] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [zip, setZip] = useState('');
    return <FormLayout>
        <FormLayout direction="horizontal">
          <TextInput label="First Name" value={first} onChange={setFirst} />
          <TextInput label="Last Name" value={last} onChange={setLast} />
        </FormLayout>
        <TextInput label="Email" value={email} onChange={setEmail} />
        <FormLayout direction="horizontal">
          <TextInput label="City" value={city} onChange={setCity} />
          <TextInput label="State" value={state} onChange={setState} />
          <TextInput label="ZIP" value={zip} onChange={setZip} />
        </FormLayout>
      </FormLayout>;
  }
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  name: 'In a Dialog',
  render: () => {
    const [name, setName] = useState('Jane Doe');
    const [email, setEmail] = useState('jane@example.com');
    return <div {...stylex.props(dialogStyles.container)}>
        <div {...stylex.props(dialogStyles.header)}>
          <Text type="label">Edit Profile</Text>
        </div>
        <div {...stylex.props(dialogStyles.body)}>
          <form id="edit-profile" onSubmit={e => {
          e.preventDefault();
          alert(\`Saved: \${name}, \${email}\`);
        }}>
            <FormLayout>
              <TextInput label="Name" value={name} onChange={setName} />
              <TextInput label="Email" value={email} onChange={setEmail} />
            </FormLayout>
          </form>
        </div>
        <div {...stylex.props(dialogStyles.footer)}>
          <button {...stylex.props(dialogStyles.button, dialogStyles.secondary)} type="button">
            Cancel
          </button>
          <button {...stylex.props(dialogStyles.button, dialogStyles.primary)} type="submit" form="edit-profile">
            Save
          </button>
        </div>
      </div>;
  }
}`,...C.parameters?.docs?.source}}},w=[`Vertical`,`Horizontal`,`HorizontalLabels`,`MixedControls`,`Nested`,`InDialog`]}))();export{y as Horizontal,b as HorizontalLabels,C as InDialog,x as MixedControls,S as Nested,v as Vertical,w as __namedExportsOrder,_ as default};