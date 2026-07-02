import{ah as i,a1 as e,a6 as E,ay as z,af as x}from"./iframe-FpdBIrKz.js";import{F}from"./Field-aJnAslJ5.js";import{I as U}from"./Item-BJJK0iYd.js";import"./preload-helper-Ct5FWWRu.js";import"./FieldStatus-DWE8xW4u.js";import"./computeTargetAndRel-BlG0ENK0.js";const N=i.createContext(null);N.displayName="RadioListContext";function o({ref:s,label:r,isLabelHidden:t=!1,description:n,value:d,onChange:l,orientation:g="vertical",isDisabled:v=!1,isRequired:c=!1,isOptional:y=!1,size:b="md",status:u,labelTooltip:h,width:p,xstyle:f,className:_,style:P,"data-testid":O,children:B}){const W=i.useId(),G=i.useId(),w=i.useId(),M=i.useId(),T=i.useId(),H=i.useMemo(()=>({name:W,value:d,onChange:l,isDisabled:v,isRequired:c,size:b,status:u}),[W,d,l,v,c,b,u]);return e.jsx(F,{ref:s,"data-testid":O,label:r,isLabelHidden:t,description:n,inputID:G,labelID:w,isGroupLabel:!0,descriptionID:n?M:void 0,isOptional:y,isRequired:c,isDisabled:v,status:u?{type:u.type,message:u.message,messageID:u.message?T:void 0}:void 0,labelTooltip:h,statusVariant:"detached",width:p,xstyle:f,className:_,style:P,children:e.jsx("div",{role:"radiogroup","aria-labelledby":w,"aria-describedby":[n?M:null,u?.message?T:null].filter(Boolean).join(" ")||void 0,"aria-invalid":u?.type==="error"?!0:void 0,"aria-required":c||void 0,...E(z("radio-list",{orientation:g,size:b}),{0:{className:"astryx78zum5 astryx1q0g3np astryx9mgr7n"},1:{className:"astryx78zum5 astryxdt5ytf astryx1txdalj"}}[(g==="vertical")<<0]),children:e.jsx(N,{value:H,children:B})})})}o.displayName="RadioList";o.__docgenInfo={description:`A radio group component for single-value selection.

@example
\`\`\`
<RadioList
  label="Notification preference"
  value={selected}
  onChange={setSelected}>
  <RadioListItem label="Email" value="email" />
  <RadioListItem label="SMS" value="sms" />
  <RadioListItem label="Push" value="push" />
</RadioList>
\`\`\``,methods:[],displayName:"RadioList",props:{ref:{required:!1,tsType:{name:"ReactRef",raw:"React.Ref<HTMLDivElement>",elements:[{name:"HTMLDivElement"}]},description:""},label:{required:!0,tsType:{name:"string"},description:"Label text for the radio group (always rendered for accessibility)."},isLabelHidden:{required:!1,tsType:{name:"boolean"},description:`Whether to visually hide the label (still accessible to screen readers).
@default false`,defaultValue:{value:"false",computed:!1}},description:{required:!1,tsType:{name:"string"},description:"Description text displayed below the label."},value:{required:!0,tsType:{name:"string"},description:"The currently selected value."},onChange:{required:!0,tsType:{name:"signature",type:"function",raw:"(value: string) => void",signature:{arguments:[{type:{name:"string"},name:"value"}],return:{name:"void"}}},description:"Callback fired when the selected value changes."},orientation:{required:!1,tsType:{name:"union",raw:"'vertical' | 'horizontal'",elements:[{name:"literal",value:"'vertical'"},{name:"literal",value:"'horizontal'"}]},description:`Layout direction of the radio items.
@default "vertical"`,defaultValue:{value:"'vertical'",computed:!1}},isDisabled:{required:!1,tsType:{name:"boolean"},description:`Whether all radio items are disabled.
@default false`,defaultValue:{value:"false",computed:!1}},isRequired:{required:!1,tsType:{name:"boolean"},description:`Whether the radio group is required.
@default false`,defaultValue:{value:"false",computed:!1}},isOptional:{required:!1,tsType:{name:"boolean"},description:`Whether the field is optional. Mutually exclusive with isRequired.
@default false`,defaultValue:{value:"false",computed:!1}},status:{required:!1,tsType:{name:"InputStatus"},description:`Status indicator for the radio group.
When set with a message, displays a colored message box below the group.`},size:{required:!1,tsType:{name:"union",raw:"'sm' | 'md'",elements:[{name:"literal",value:"'sm'"},{name:"literal",value:"'md'"}]},description:`The size of the radio controls.
- 'sm': Compact size (18px radio, 20px wrapper)
- 'md': Default size (22px radio, 24px wrapper)
@default 'md'`,defaultValue:{value:"'md'",computed:!1}},width:{required:!1,tsType:{name:"union",raw:"number | string",elements:[{name:"number"},{name:"string"}]},description:"Width of the field. Numbers are treated as pixels, strings are used as-is\n(e.g. `'100%'`). Sizes the whole field (label, control, and status) so they\nstay aligned, unlike setting width via `xstyle`/`className`/`style`."},labelTooltip:{required:!1,tsType:{name:"string"},description:"Tooltip text to display in an info icon at the end of the label."},"data-testid":{required:!1,tsType:{name:"string"},description:"Test ID for the outer container."},children:{required:!0,tsType:{name:"ReactNode"},description:"Radio list items to render."}},composes:["Omit"]};const X={astryxklqth5:"astryxklqth5",$$css:!0},m={container:{k1xSpc:"astryx78zum5",kGNEyG:"astryx6s0dn4",kOIVth:"astryx1txdalj",$$css:!0},radioWrapper:{kVAEAm:"astryx1n2onr6",k1xSpc:"astryx78zum5",kGNEyG:"astryx6s0dn4",kjj79g:"astryxl56j7k",kmuXW:"astryx2lah0s",kHBbk8:"astryxc8icb0",$$css:!0},input:{kVAEAm:"astryx10l6tqk",kogj98:"astryx1ghz6dp",kmVPX3:"astryx1717udv",kSiTet:"astryxg01cxk",kkrTdU:"astryx1ypdohk",kY2c9j:"astryx1vjfegm",$$css:!0},inputDisabled:{kkrTdU:"astryx1h6gzvc",$$css:!0},radio:{k1xSpc:"astryx78zum5",kGNEyG:"astryx6s0dn4",kjj79g:"astryxl56j7k",kMzoRj:"astryx1litavf",ksu8eU:"astryx1y0btm7",kaIpWk:"astryx16rqkct",k1ekBW:"astryxts7igz",kIyJzY:"astryxuedmi6",kAMwcw:"astryxlr8y92",kB7OPa:"astryx9f619",$$css:!0},radioUnchecked:{kVAM5u:"astryxvy26l8 astryx1qgvwc6",kzOINU:null,kGJrpR:null,kaZRDh:null,kBCPoo:null,k26BEO:null,k5QoK5:null,kLZC3w:null,kL6WhQ:null,kWkggS:"astryx10xzikg astryx49hlbq",$$css:!0},radioChecked:{kVAM5u:"astryxad5do astryx1k21oa1",kzOINU:null,kGJrpR:null,kaZRDh:null,kBCPoo:null,k26BEO:null,k5QoK5:null,kLZC3w:null,kL6WhQ:null,kWkggS:"astryx1ewilqj astryx1y6as5r",$$css:!0},radioWrapperFocus:{kI3sdo:"astryx1a2a7pz astryx1irc7jg",kjBf7l:null,k3XXqK:null,kMeerF:null,kInvED:"astryx1wfwxd8 astryxdjuwb3",kaIpWk:"astryx16rqkct",krdFHd:null,kfmiAY:null,kVL7Gh:null,kT0f0o:null,kIxVMA:null,ksF3WI:null,kqGeR4:null,kYm2EN:null,$$css:!0},radioDisabled:{kSiTet:"astryxbyyjgo",kVAM5u:"astryx14i3s5s",kzOINU:null,kGJrpR:null,kaZRDh:null,kBCPoo:null,k26BEO:null,k5QoK5:null,kLZC3w:null,kL6WhQ:null,$$css:!0},radioDisabledUnchecked:{kWkggS:"astryxwmxj5m",$$css:!0},innerDot:{kaIpWk:"astryx16rqkct",kWkggS:"astryx1azo05",$$css:!0}},$={sm:{kzqmXN:"astryxw4jnvo",kZKoxP:"astryx1qx5ct2",$$css:!0},md:{kzqmXN:"astryxvy4d1p",kZKoxP:"astryxxk0z11",$$css:!0}},Z={sm:{kzqmXN:"astryx1xp8n7a",kZKoxP:"astryxmix8c7",$$css:!0},md:{kzqmXN:"astryx17z2i9w",kZKoxP:"astryx17rw0jw",$$css:!0}},K={sm:{kzqmXN:"astryx1xc55vz",kZKoxP:"astryxdk7pt",$$css:!0},md:{kzqmXN:"astryx1fsd2vl",kZKoxP:"astryx170jfvy",$$css:!0}},Q={root:{k8WAf4:"astryxt970qd",kLKAdn:null,kGO01o:null,kg3NbH:"astryxnjsko4",kuDDbn:null,kE3dHu:null,kP0aTx:null,kpe85a:null,kaIpWk:"astryx2u8bby",krdFHd:null,kfmiAY:null,kVL7Gh:null,kT0f0o:null,kIxVMA:null,ksF3WI:null,kqGeR4:null,kYm2EN:null,kUk6DE:"astryx98rzlu",kzQI83:null,kmuXW:null,kCS8Yb:null,k7Eaqz:"astryxeuugli",$$css:!0}};function a({ref:s,label:r,value:t,description:n,isDisabled:d=!1,startContent:l,endContent:g,"data-testid":v}){const c=i.use(N);if(!c)throw new Error("RadioListItem must be used within an RadioList");const y=i.useId(),b=i.useId(),u=c.isDisabled||d,h=c.value===t,p=c.size,f=e.jsxs("div",{...x(m.radioWrapper,$[p],!u&&m.radioWrapperFocus),children:[e.jsx("input",{id:y,type:"radio",name:c.name,value:t,checked:h,disabled:u,required:c.isRequired,onChange:()=>c.onChange(t),"aria-describedby":n?b:void 0,...x(m.input,$[p],u&&m.inputDisabled)}),e.jsx("div",{"aria-hidden":"true",...E(z("radio",{size:p,checked:h?"checked":null,disabled:u?"disabled":null}),x(m.radio,Z[p],h?m.radioChecked:m.radioUnchecked,u&&m.radioDisabled,u&&!h&&m.radioDisabledUnchecked)),children:h&&e.jsx("div",{...E(z("radio-dot",{size:p}),x(m.innerDot,K[p]))})})]}),_=l!=null?e.jsxs(e.Fragment,{children:[f,l]}):f;return e.jsx("div",{ref:s,"data-testid":v,...E(z("radio-list-item"),x(m.container,!u&&X)),children:e.jsx(U,{startContent:_,label:e.jsx("label",{htmlFor:y,...{0:{},1:{className:"astryxnbbluu astryx1h6gzvc"}}[!!u<<0],children:r}),description:n!=null?e.jsx("span",{id:b,children:n}):void 0,endContent:g,xstyle:Q.root})})}a.displayName="RadioListItem";a.__docgenInfo={description:`An individual radio item within an RadioList.

@example
\`\`\`
<RadioListItem label="Email" value="email" />
<RadioListItem
  label="SMS"
  value="sms"
  description="Standard messaging rates apply"
/>
\`\`\``,methods:[],displayName:"RadioListItem",props:{xstyle:{required:!1,tsType:{name:"StyleXStyles"},description:"StyleX styles created via `stylex.create()`. Merged with the component's\nbase styles inside a single `stylex.props()` call for optimal deduplication.\n\n@example\n```\nconst overrides = stylex.create({ root: { marginBottom: 8 } });\n<Component xstyle={overrides.root} />\n```"},ref:{required:!1,tsType:{name:"ReactRef",raw:"React.Ref<HTMLDivElement>",elements:[{name:"HTMLDivElement"}]},description:""},label:{required:!0,tsType:{name:"string"},description:"Label text for the radio item."},value:{required:!0,tsType:{name:"string"},description:"Value of this radio item."},description:{required:!1,tsType:{name:"string"},description:"Description text displayed below the label."},isDisabled:{required:!1,tsType:{name:"boolean"},description:`Whether this individual radio item is disabled.
@default false`,defaultValue:{value:"false",computed:!1}},startContent:{required:!1,tsType:{name:"ReactNode"},description:"Content to render before the radio circle."},endContent:{required:!1,tsType:{name:"ReactNode"},description:"Content to render after the label."}},composes:["Omit"]};const le={title:"Core/RadioList",component:o,tags:["autodocs"],argTypes:{label:{control:"text",description:"Label text (required)"},isLabelHidden:{control:"boolean",description:"Visually hide the label (still accessible to screen readers)"},description:{control:"text",description:"Description text displayed below the label"},value:{control:"text",description:"The currently selected value"},orientation:{control:"select",options:["vertical","horizontal"],description:"Layout direction of the radio items"},isDisabled:{control:"boolean",description:"Whether all radio items are disabled"},isRequired:{control:"boolean",description:"Whether the radio group is required"},isOptional:{control:"boolean",description:"Whether the field is optional"}}},k={render:s=>{const[r,t]=i.useState(s.value??""),{value:n,onChange:d,...l}=s;return e.jsxs(o,{...l,value:r,onChange:t,children:[e.jsx(a,{label:"Email",value:"email"}),e.jsx(a,{label:"SMS",value:"sms"}),e.jsx(a,{label:"Push notification",value:"push"})]})},args:{label:"Notification preference"}},R={render:s=>{const[r,t]=i.useState(s.value??""),{value:n,onChange:d,...l}=s;return e.jsxs(o,{...l,value:r,onChange:t,children:[e.jsx(a,{label:"Email",value:"email",description:"Receive notifications via email"}),e.jsx(a,{label:"SMS",value:"sms",description:"Standard messaging rates apply"}),e.jsx(a,{label:"Push notification",value:"push",description:"Instant alerts on your device"})]})},args:{label:"Notification preference",description:"Choose how you would like to be notified"}},S={render:s=>{const[r,t]=i.useState(s.value??""),{value:n,onChange:d,...l}=s;return e.jsxs(o,{...l,value:r,onChange:t,children:[e.jsx(a,{label:"Small",value:"sm"}),e.jsx(a,{label:"Medium",value:"md"}),e.jsx(a,{label:"Large",value:"lg"})]})},args:{label:"Size",orientation:"horizontal"}},L={render:s=>{const[r,t]=i.useState(s.value??"email"),{value:n,onChange:d,...l}=s;return e.jsxs(o,{...l,value:r,onChange:t,children:[e.jsx(a,{label:"Email",value:"email"}),e.jsx(a,{label:"SMS",value:"sms"}),e.jsx(a,{label:"Push notification",value:"push"})]})},args:{label:"Notification preference",isDisabled:!0}},C={render:s=>{const[r,t]=i.useState(s.value??""),{value:n,onChange:d,...l}=s;return e.jsxs(o,{...l,value:r,onChange:t,children:[e.jsx(a,{label:"Email",value:"email"}),e.jsx(a,{label:"SMS",value:"sms",isDisabled:!0}),e.jsx(a,{label:"Push notification",value:"push"})]})},args:{label:"Notification preference"}},j={render:s=>{const[r,t]=i.useState(s.value??""),{value:n,onChange:d,...l}=s;return e.jsxs(o,{...l,value:r,onChange:t,children:[e.jsx(a,{label:"Email",value:"email"}),e.jsx(a,{label:"SMS",value:"sms"}),e.jsx(a,{label:"Push notification",value:"push"})]})},args:{label:"Notification preference",isRequired:!0}},I={render:s=>{const[r,t]=i.useState(s.value??""),{value:n,onChange:d,...l}=s;return e.jsxs(o,{...l,value:r,onChange:t,children:[e.jsx(a,{label:"Email",value:"email"}),e.jsx(a,{label:"SMS",value:"sms"}),e.jsx(a,{label:"Push notification",value:"push"})]})},args:{label:"Notification preference",isOptional:!0}},V={render:s=>{const[r,t]=i.useState(s.value??""),{value:n,onChange:d,...l}=s;return e.jsxs(o,{...l,value:r,onChange:t,children:[e.jsx(a,{label:"Email",value:"email"}),e.jsx(a,{label:"SMS",value:"sms"}),e.jsx(a,{label:"Push notification",value:"push"})]})},args:{label:"Notification preference",isRequired:!0,status:{type:"error",message:"Please select a notification method"}}},q={render:s=>{const[r,t]=i.useState(s.value??""),{value:n,onChange:d,...l}=s;return e.jsxs(o,{...l,value:r,onChange:t,children:[e.jsx(a,{label:"Email",value:"email",startContent:e.jsx("span",{children:"📧"})}),e.jsx(a,{label:"SMS",value:"sms",startContent:e.jsx("span",{children:"💬"})}),e.jsx(a,{label:"Push notification",value:"push",startContent:e.jsx("span",{children:"🔔"})})]})},args:{label:"Notification preference"}},D={render:s=>{const[r,t]=i.useState(s.value??""),{value:n,onChange:d,...l}=s;return e.jsxs(o,{...l,value:r,onChange:t,children:[e.jsx(a,{label:"Free",value:"free",endContent:e.jsx("span",{style:{color:"#0D8626"},children:"$0/mo"})}),e.jsx(a,{label:"Pro",value:"pro",endContent:e.jsx("span",{style:{color:"#0064E0"},children:"$9/mo"})}),e.jsx(a,{label:"Enterprise",value:"enterprise",endContent:e.jsx("span",{style:{color:"#5B08D8"},children:"Custom"})})]})},args:{label:"Plan"}},A={render:()=>{const[s,r]=i.useState(""),[t,n]=i.useState("email"),[d,l]=i.useState(""),[g,v]=i.useState("sm");return e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"24px",maxWidth:"400px"},children:[e.jsxs(o,{label:"Unselected",value:s,onChange:r,children:[e.jsx(a,{label:"Option A",value:"a"}),e.jsx(a,{label:"Option B",value:"b"})]}),e.jsxs(o,{label:"Pre-selected",value:t,onChange:n,children:[e.jsx(a,{label:"Email",value:"email"}),e.jsx(a,{label:"SMS",value:"sms"})]}),e.jsxs(o,{label:"Disabled group",value:"",onChange:()=>{},isDisabled:!0,children:[e.jsx(a,{label:"Option A",value:"a"}),e.jsx(a,{label:"Option B",value:"b"})]}),e.jsxs(o,{label:"With descriptions",value:d,onChange:l,children:[e.jsx(a,{label:"Email",value:"email",description:"Delivered to your inbox"}),e.jsx(a,{label:"SMS",value:"sms",description:"Standard rates apply"})]}),e.jsxs(o,{label:"Horizontal",value:g,onChange:v,orientation:"horizontal",children:[e.jsx(a,{label:"S",value:"sm"}),e.jsx(a,{label:"M",value:"md"}),e.jsx(a,{label:"L",value:"lg"})]}),e.jsxs(o,{label:"With error",value:"",onChange:()=>{},isRequired:!0,status:{type:"error",message:"Please select an option"},children:[e.jsx(a,{label:"Option A",value:"a"}),e.jsx(a,{label:"Option B",value:"b"})]})]})}};k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState(args.value ?? '');
    const {
      value: _value,
      onChange: _onChange,
      ...restArgs
    } = args;
    return <RadioList {...restArgs} value={value} onChange={setValue}>
        <RadioListItem label="Email" value="email" />
        <RadioListItem label="SMS" value="sms" />
        <RadioListItem label="Push notification" value="push" />
      </RadioList>;
  },
  args: {
    label: 'Notification preference'
  }
}`,...k.parameters?.docs?.source}}};R.parameters={...R.parameters,docs:{...R.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState(args.value ?? '');
    const {
      value: _value,
      onChange: _onChange,
      ...restArgs
    } = args;
    return <RadioList {...restArgs} value={value} onChange={setValue}>
        <RadioListItem label="Email" value="email" description="Receive notifications via email" />
        <RadioListItem label="SMS" value="sms" description="Standard messaging rates apply" />
        <RadioListItem label="Push notification" value="push" description="Instant alerts on your device" />
      </RadioList>;
  },
  args: {
    label: 'Notification preference',
    description: 'Choose how you would like to be notified'
  }
}`,...R.parameters?.docs?.source}}};S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState(args.value ?? '');
    const {
      value: _value,
      onChange: _onChange,
      ...restArgs
    } = args;
    return <RadioList {...restArgs} value={value} onChange={setValue}>
        <RadioListItem label="Small" value="sm" />
        <RadioListItem label="Medium" value="md" />
        <RadioListItem label="Large" value="lg" />
      </RadioList>;
  },
  args: {
    label: 'Size',
    orientation: 'horizontal'
  }
}`,...S.parameters?.docs?.source}}};L.parameters={...L.parameters,docs:{...L.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState(args.value ?? 'email');
    const {
      value: _value,
      onChange: _onChange,
      ...restArgs
    } = args;
    return <RadioList {...restArgs} value={value} onChange={setValue}>
        <RadioListItem label="Email" value="email" />
        <RadioListItem label="SMS" value="sms" />
        <RadioListItem label="Push notification" value="push" />
      </RadioList>;
  },
  args: {
    label: 'Notification preference',
    isDisabled: true
  }
}`,...L.parameters?.docs?.source}}};C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState(args.value ?? '');
    const {
      value: _value,
      onChange: _onChange,
      ...restArgs
    } = args;
    return <RadioList {...restArgs} value={value} onChange={setValue}>
        <RadioListItem label="Email" value="email" />
        <RadioListItem label="SMS" value="sms" isDisabled />
        <RadioListItem label="Push notification" value="push" />
      </RadioList>;
  },
  args: {
    label: 'Notification preference'
  }
}`,...C.parameters?.docs?.source}}};j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState(args.value ?? '');
    const {
      value: _value,
      onChange: _onChange,
      ...restArgs
    } = args;
    return <RadioList {...restArgs} value={value} onChange={setValue}>
        <RadioListItem label="Email" value="email" />
        <RadioListItem label="SMS" value="sms" />
        <RadioListItem label="Push notification" value="push" />
      </RadioList>;
  },
  args: {
    label: 'Notification preference',
    isRequired: true
  }
}`,...j.parameters?.docs?.source}}};I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState(args.value ?? '');
    const {
      value: _value,
      onChange: _onChange,
      ...restArgs
    } = args;
    return <RadioList {...restArgs} value={value} onChange={setValue}>
        <RadioListItem label="Email" value="email" />
        <RadioListItem label="SMS" value="sms" />
        <RadioListItem label="Push notification" value="push" />
      </RadioList>;
  },
  args: {
    label: 'Notification preference',
    isOptional: true
  }
}`,...I.parameters?.docs?.source}}};V.parameters={...V.parameters,docs:{...V.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState(args.value ?? '');
    const {
      value: _value,
      onChange: _onChange,
      ...restArgs
    } = args;
    return <RadioList {...restArgs} value={value} onChange={setValue}>
        <RadioListItem label="Email" value="email" />
        <RadioListItem label="SMS" value="sms" />
        <RadioListItem label="Push notification" value="push" />
      </RadioList>;
  },
  args: {
    label: 'Notification preference',
    isRequired: true,
    status: {
      type: 'error',
      message: 'Please select a notification method'
    }
  }
}`,...V.parameters?.docs?.source}}};q.parameters={...q.parameters,docs:{...q.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState(args.value ?? '');
    const {
      value: _value,
      onChange: _onChange,
      ...restArgs
    } = args;
    return <RadioList {...restArgs} value={value} onChange={setValue}>
        <RadioListItem label="Email" value="email" startContent={<span>📧</span>} />
        <RadioListItem label="SMS" value="sms" startContent={<span>💬</span>} />
        <RadioListItem label="Push notification" value="push" startContent={<span>🔔</span>} />
      </RadioList>;
  },
  args: {
    label: 'Notification preference'
  }
}`,...q.parameters?.docs?.source}}};D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState(args.value ?? '');
    const {
      value: _value,
      onChange: _onChange,
      ...restArgs
    } = args;
    return <RadioList {...restArgs} value={value} onChange={setValue}>
        <RadioListItem label="Free" value="free" endContent={<span style={{
        color: '#0D8626'
      }}>$0/mo</span>} />
        <RadioListItem label="Pro" value="pro" endContent={<span style={{
        color: '#0064E0'
      }}>$9/mo</span>} />
        <RadioListItem label="Enterprise" value="enterprise" endContent={<span style={{
        color: '#5B08D8'
      }}>Custom</span>} />
      </RadioList>;
  },
  args: {
    label: 'Plan'
  }
}`,...D.parameters?.docs?.source}}};A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [value1, setValue1] = useState('');
    const [value2, setValue2] = useState('email');
    const [value3, setValue3] = useState('');
    const [value4, setValue4] = useState('sm');
    return <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
      maxWidth: '400px'
    }}>
        <RadioList label="Unselected" value={value1} onChange={setValue1}>
          <RadioListItem label="Option A" value="a" />
          <RadioListItem label="Option B" value="b" />
        </RadioList>
        <RadioList label="Pre-selected" value={value2} onChange={setValue2}>
          <RadioListItem label="Email" value="email" />
          <RadioListItem label="SMS" value="sms" />
        </RadioList>
        <RadioList label="Disabled group" value="" onChange={() => {}} isDisabled>
          <RadioListItem label="Option A" value="a" />
          <RadioListItem label="Option B" value="b" />
        </RadioList>
        <RadioList label="With descriptions" value={value3} onChange={setValue3}>
          <RadioListItem label="Email" value="email" description="Delivered to your inbox" />
          <RadioListItem label="SMS" value="sms" description="Standard rates apply" />
        </RadioList>
        <RadioList label="Horizontal" value={value4} onChange={setValue4} orientation="horizontal">
          <RadioListItem label="S" value="sm" />
          <RadioListItem label="M" value="md" />
          <RadioListItem label="L" value="lg" />
        </RadioList>
        <RadioList label="With error" value="" onChange={() => {}} isRequired status={{
        type: 'error',
        message: 'Please select an option'
      }}>
          <RadioListItem label="Option A" value="a" />
          <RadioListItem label="Option B" value="b" />
        </RadioList>
      </div>;
  }
}`,...A.parameters?.docs?.source}}};const re=["Default","WithDescription","Horizontal","Disabled","DisabledItem","Required","Optional","WithErrorStatus","WithStartContent","WithEndContent","AllVariations"];export{A as AllVariations,k as Default,L as Disabled,C as DisabledItem,S as Horizontal,I as Optional,j as Required,R as WithDescription,D as WithEndContent,V as WithErrorStatus,q as WithStartContent,re as __namedExportsOrder,le as default};
