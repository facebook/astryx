import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{t}from"./react-BZJXY1be.js";import{n,t as r}from"./Text-BfjtEFtP.js";import{t as i}from"./jsx-runtime-DeHZSEgm.js";import{n as a,t as o}from"./Field-DZ-q02Vq.js";import{n as s,t as c}from"./TextInput-BwKW_f5i.js";import{n as l,t as u}from"./Selector-CXBa_P0j.js";import{n as d,t as f}from"./FormLayout-BpN46Ael.js";function p({direction:e}){let[t,n]=(0,m.useState)(``),[r,i]=(0,m.useState)(``),[a,o]=(0,m.useState)(``);return(0,h.jsxs)(f,{direction:e,children:[(0,h.jsx)(c,{label:`Name`,value:t,onChange:n}),(0,h.jsx)(c,{label:`Email`,value:r,onChange:i}),(0,h.jsx)(c,{label:`Bio`,value:a,onChange:o})]})}var m,h,g,_,v,y,b,x,S,C;function w(){return(w=e((()=>{m=t(),d(),s(),l(),a(),n(),h=i(),g={title:`Core/FormLayout`,component:f,tags:[`autodocs`],args:{direction:`vertical`},argTypes:{direction:{control:`select`,options:[`vertical`,`horizontal`,`horizontal-labels`],description:`Direction of field arrangement`}}},_={name:`Vertical (Default)`,render:e=>(0,h.jsx)(p,{direction:e.direction})},v={name:`Horizontal`,args:{direction:`horizontal`},render:e=>{let[t,n]=(0,m.useState)(``),[r,i]=(0,m.useState)(``);return(0,h.jsxs)(f,{direction:e.direction,children:[(0,h.jsx)(c,{label:`First Name`,value:t,onChange:n}),(0,h.jsx)(c,{label:`Last Name`,value:r,onChange:i})]})}},y={name:`Horizontal Labels (Settings)`,args:{direction:`horizontal-labels`},render:e=>{let[t,n]=(0,m.useState)(`Jane Doe`),[r,i]=(0,m.useState)(`jane@example.com`),[a,o]=(0,m.useState)(`America/Los_Angeles`);return(0,h.jsxs)(f,{direction:e.direction,children:[(0,h.jsx)(c,{label:`Display Name`,value:t,onChange:n}),(0,h.jsx)(c,{label:`Email`,value:r,onChange:i}),(0,h.jsx)(u,{label:`Timezone`,value:a,onChange:e=>o(e),options:[{label:`Pacific Time`,value:`America/Los_Angeles`},{label:`Eastern Time`,value:`America/New_York`},{label:`UTC`,value:`UTC`}]})]})}},b={name:`Mixed Controls`,render:()=>{let[e,t]=(0,m.useState)(``),[n,r]=(0,m.useState)(`viewer`);return(0,h.jsxs)(f,{children:[(0,h.jsx)(c,{label:`Name`,value:e,onChange:t}),(0,h.jsx)(u,{label:`Role`,value:n,onChange:e=>r(e),options:[{label:`Viewer`,value:`viewer`},{label:`Editor`,value:`editor`},{label:`Admin`,value:`admin`}]}),(0,h.jsx)(o,{label:`Notifications`,inputID:`notif-group`,children:(0,h.jsxs)(`div`,{className:`x78zum5 xdt5ytf x1jnr06f`,id:`notif-group`,children:[(0,h.jsxs)(`label`,{className:`x78zum5 x6s0dn4 x167g77z`,children:[(0,h.jsx)(`input`,{type:`checkbox`,defaultChecked:!0}),` Email`]}),(0,h.jsxs)(`label`,{className:`x78zum5 x6s0dn4 x167g77z`,children:[(0,h.jsx)(`input`,{type:`checkbox`}),` SMS`]}),(0,h.jsxs)(`label`,{className:`x78zum5 x6s0dn4 x167g77z`,children:[(0,h.jsx)(`input`,{type:`checkbox`,defaultChecked:!0}),` Push`]})]})})]})}},x={name:`Nested Layouts`,render:()=>{let[e,t]=(0,m.useState)(``),[n,r]=(0,m.useState)(``),[i,a]=(0,m.useState)(``),[o,s]=(0,m.useState)(``),[l,u]=(0,m.useState)(``),[d,p]=(0,m.useState)(``);return(0,h.jsxs)(f,{children:[(0,h.jsxs)(f,{direction:`horizontal`,children:[(0,h.jsx)(c,{label:`First Name`,value:e,onChange:t}),(0,h.jsx)(c,{label:`Last Name`,value:n,onChange:r})]}),(0,h.jsx)(c,{label:`Email`,value:i,onChange:a}),(0,h.jsxs)(f,{direction:`horizontal`,children:[(0,h.jsx)(c,{label:`City`,value:o,onChange:s}),(0,h.jsx)(c,{label:`State`,value:l,onChange:u}),(0,h.jsx)(c,{label:`ZIP`,value:d,onChange:p})]})]})}},S={name:`In a Dialog`,render:()=>{let[e,t]=(0,m.useState)(`Jane Doe`),[n,i]=(0,m.useState)(`jane@example.com`);return(0,h.jsxs)(`div`,{className:`xtfardp xur7f20 x17fpy1y xb3r6kr`,children:[(0,h.jsx)(`div`,{className:`x1tamke2 x915a4u`,children:(0,h.jsx)(r,{type:`label`,children:`Edit Profile`})}),(0,h.jsx)(`div`,{className:`x1tamke2`,children:(0,h.jsx)(`form`,{id:`edit-profile`,onSubmit:t=>{t.preventDefault(),alert(`Saved: ${e}, ${n}`)},children:(0,h.jsxs)(f,{children:[(0,h.jsx)(c,{label:`Name`,value:e,onChange:t}),(0,h.jsx)(c,{label:`Email`,value:n,onChange:i})]})})}),(0,h.jsxs)(`div`,{className:`x78zum5 x13a6bvl x167g77z x1tamke2 xz14g06`,children:[(0,h.jsx)(`button`,{className:`x1ff1495 x1kogg8i x1gs6z28 x1ypdohk xif65rj x1dr8pv1 xka2uk4`,type:`button`,children:`Cancel`}),(0,h.jsx)(`button`,{className:`x1ff1495 x1kogg8i x1gs6z28 x1ypdohk xif65rj xtzjzor xfungia`,type:`submit`,form:`edit-profile`,children:`Save`})]})]})}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  name: 'Vertical (Default)',
  render: args => <FormLayoutDemo direction={args.direction} />
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
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
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
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
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
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
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
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
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
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
}`,...S.parameters?.docs?.source}}},C=[`Vertical`,`Horizontal`,`HorizontalLabels`,`MixedControls`,`Nested`,`InDialog`]})))()}w();export{v as Horizontal,y as HorizontalLabels,S as InDialog,b as MixedControls,x as Nested,_ as Vertical,C as __namedExportsOrder,g as default};