import{ah as t,a1 as e,a6 as z,af as N,ay as L,T as F}from"./iframe-j1EZkcGb.js";import{a as k,F as T}from"./Field-MJLQjcWT.js";import{T as o}from"./TextInput-DnnvBOrd.js";import{S as v}from"./Selector-D493drRu.js";import"./preload-helper-Ct5FWWRu.js";import"./FieldStatus-BgagH4tV.js";import"./inputStyles.stylex-Bpqcd25J.js";import"./groupStyles-CeI8FlII.js";import"./useInputContainer-NEfGrLOd.js";import"./usePopover-Db3MCAxh.js";import"./Divider-D8-Tp5ON.js";import"./utils-_uNaBhDK.js";import"./hooks-Bff1Ak_F.js";import"./Item-DyLXzivy.js";import"./computeTargetAndRel-BlG0ENK0.js";const g={base:{k1xSpc:"astryx78zum5",kXwgrk:"astryxdt5ytf",kOIVth:"astryx18g69wz",$$css:!0},horizontal:{k1xSpc:"astryxrvj5dj",kprqdN:"astryx1mt1orb",klIVar:"astryxu6a5m6",$$css:!0},horizontalLabels:{k1xSpc:"astryxrvj5dj",kumcoG:"astryx1pmbctz",kOIVth:"astryxlaq8a2",kGNEyG:"astryx7a106z",k41HbU:"astryxedohl4",kUxVDj:"astryx1rpgqan",k3RL8M:"astryx1a1jff",$$css:!0}};function i({children:s,direction:a="vertical",xstyle:l,className:r,style:n,ref:m,...c}){const u=t.useMemo(()=>({direction:a}),[a]);return e.jsx(k,{value:u,children:e.jsx("div",{ref:m,...z(L("form-layout",{direction:a}),N(g.base,a==="horizontal"&&g.horizontal,a==="horizontal-labels"&&g.horizontalLabels,l),r,n),...c,children:s})})}i.displayName="FormLayout";i.__docgenInfo={description:`Spatial layout container for form fields.

Arranges form fields with consistent spacing and direction. Renders a \`<div>\`
(not a \`<form>\` — form submission is a separate concern). For label wrapping
of custom controls, use \`Field\` directly.

Provides direction context to children via \`FormLayoutContext\`.
Supports nesting — a horizontal layout inside a vertical layout works naturally.

@example
\`\`\`
<FormLayout>
  <TextInput label="Name" value={name} onChange={setName} />
  <TextInput label="Email" value={email} onChange={setEmail} />
</FormLayout>
\`\`\``,methods:[],displayName:"FormLayout",props:{xstyle:{required:!1,tsType:{name:"StyleXStyles"},description:"StyleX styles created via `stylex.create()`. Merged with the component's\nbase styles inside a single `stylex.props()` call for optimal deduplication.\n\n@example\n```\nconst overrides = stylex.create({ root: { marginBottom: 8 } });\n<Component xstyle={overrides.root} />\n```"},ref:{required:!1,tsType:{name:"ReactRef",raw:"React.Ref<HTMLDivElement>",elements:[{name:"HTMLDivElement"}]},description:"Ref forwarded to the root element"},children:{required:!1,tsType:{name:"ReactNode"},description:`Form fields to arrange. Accepts Astryx inputs (TextInput, Selector, etc.)
and Field-wrapped custom controls.`},direction:{required:!1,tsType:{name:"union",raw:`| 'vertical'
| 'horizontal'
| 'horizontal-labels'`,elements:[{name:"literal",value:"'vertical'"},{name:"literal",value:"'horizontal'"},{name:"literal",value:"'horizontal-labels'"}]},description:`Direction of field arrangement.

- \`'vertical'\` — Fields stack top-to-bottom (default). Most common.
- \`'horizontal'\` — Fields arrange left-to-right in equal-width columns
  using CSS Grid. Each child occupies one equal column.
- \`'horizontal-labels'\` — CSS Grid with labels to the left of inputs.
  Collapses to vertical when the container is narrow (≤480px).

@default 'vertical'`,defaultValue:{value:"'vertical'",computed:!1}}},composes:["Omit"]};const J={title:"Core/FormLayout",component:i,tags:["autodocs"],args:{direction:"vertical"},argTypes:{direction:{control:"select",options:["vertical","horizontal","horizontal-labels"],description:"Direction of field arrangement"}}};function E({direction:s}){const[a,l]=t.useState(""),[r,n]=t.useState(""),[m,c]=t.useState("");return e.jsxs(i,{direction:s,children:[e.jsx(o,{label:"Name",value:a,onChange:l}),e.jsx(o,{label:"Email",value:r,onChange:n}),e.jsx(o,{label:"Bio",value:m,onChange:c})]})}const d={name:"Vertical (Default)",render:s=>e.jsx(E,{direction:s.direction})},p={name:"Horizontal",args:{direction:"horizontal"},render:s=>{const[a,l]=t.useState(""),[r,n]=t.useState("");return e.jsxs(i,{direction:s.direction,children:[e.jsx(o,{label:"First Name",value:a,onChange:l}),e.jsx(o,{label:"Last Name",value:r,onChange:n})]})}},x={name:"Horizontal Labels (Settings)",args:{direction:"horizontal-labels"},render:s=>{const[a,l]=t.useState("Jane Doe"),[r,n]=t.useState("jane@example.com"),[m,c]=t.useState("America/Los_Angeles");return e.jsxs(i,{direction:s.direction,children:[e.jsx(o,{label:"Display Name",value:a,onChange:l}),e.jsx(o,{label:"Email",value:r,onChange:n}),e.jsx(v,{label:"Timezone",value:m,onChange:u=>c(u),options:[{label:"Pacific Time",value:"America/Los_Angeles"},{label:"Eastern Time",value:"America/New_York"},{label:"UTC",value:"UTC"}]})]})}},y={name:"Mixed Controls",render:()=>{const[s,a]=t.useState(""),[l,r]=t.useState("viewer");return e.jsxs(i,{children:[e.jsx(o,{label:"Name",value:s,onChange:a}),e.jsx(v,{label:"Role",value:l,onChange:n=>r(n),options:[{label:"Viewer",value:"viewer"},{label:"Editor",value:"editor"},{label:"Admin",value:"admin"}]}),e.jsx(T,{label:"Notifications",inputID:"notif-group",children:e.jsxs("div",{className:"x78zum5 xdt5ytf x1jnr06f",id:"notif-group",children:[e.jsxs("label",{className:"x78zum5 x6s0dn4 x167g77z",children:[e.jsx("input",{type:"checkbox",defaultChecked:!0})," Email"]}),e.jsxs("label",{className:"x78zum5 x6s0dn4 x167g77z",children:[e.jsx("input",{type:"checkbox"})," SMS"]}),e.jsxs("label",{className:"x78zum5 x6s0dn4 x167g77z",children:[e.jsx("input",{type:"checkbox",defaultChecked:!0})," Push"]})]})})]})}},h={name:"Nested Layouts",render:()=>{const[s,a]=t.useState(""),[l,r]=t.useState(""),[n,m]=t.useState(""),[c,u]=t.useState(""),[f,S]=t.useState(""),[C,j]=t.useState("");return e.jsxs(i,{children:[e.jsxs(i,{direction:"horizontal",children:[e.jsx(o,{label:"First Name",value:s,onChange:a}),e.jsx(o,{label:"Last Name",value:l,onChange:r})]}),e.jsx(o,{label:"Email",value:n,onChange:m}),e.jsxs(i,{direction:"horizontal",children:[e.jsx(o,{label:"City",value:c,onChange:u}),e.jsx(o,{label:"State",value:f,onChange:S}),e.jsx(o,{label:"ZIP",value:C,onChange:j})]})]})}},b={name:"In a Dialog",render:()=>{const[s,a]=t.useState("Jane Doe"),[l,r]=t.useState("jane@example.com");return e.jsxs("div",{className:"xtfardp xur7f20 x17fpy1y xb3r6kr",children:[e.jsx("div",{className:"x1tamke2 x915a4u",children:e.jsx(F,{type:"label",children:"Edit Profile"})}),e.jsx("div",{className:"x1tamke2",children:e.jsx("form",{id:"edit-profile",onSubmit:n=>{n.preventDefault(),alert(`Saved: ${s}, ${l}`)},children:e.jsxs(i,{children:[e.jsx(o,{label:"Name",value:s,onChange:a}),e.jsx(o,{label:"Email",value:l,onChange:r})]})})}),e.jsxs("div",{className:"x78zum5 x13a6bvl x167g77z x1tamke2 xz14g06",children:[e.jsx("button",{className:"x1ff1495 x1kogg8i x1gs6z28 x1ypdohk xif65rj x1dr8pv1 xka2uk4",type:"button",children:"Cancel"}),e.jsx("button",{className:"x1ff1495 x1kogg8i x1gs6z28 x1ypdohk xif65rj xtzjzor xfungia",type:"submit",form:"edit-profile",children:"Save"})]})]})}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  name: 'Vertical (Default)',
  render: args => <FormLayoutDemo direction={args.direction} />
}`,...d.parameters?.docs?.source}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
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
}`,...p.parameters?.docs?.source}}};x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
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
}`,...x.parameters?.docs?.source}}};y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
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
}`,...y.parameters?.docs?.source}}};h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
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
}`,...h.parameters?.docs?.source}}};b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
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
}`,...b.parameters?.docs?.source}}};const O=["Vertical","Horizontal","HorizontalLabels","MixedControls","Nested","InDialog"];export{p as Horizontal,x as HorizontalLabels,b as InDialog,y as MixedControls,h as Nested,d as Vertical,O as __namedExportsOrder,J as default};
