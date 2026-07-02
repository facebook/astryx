import{ah as i,a1 as e,a6 as w,ay as _,af as y}from"./iframe-Z8EfSKmM.js";import{F as ae}from"./Field-BUd1jCAy.js";import{I as te}from"./Item-D097ecWJ.js";import"./preload-helper-Ct5FWWRu.js";import"./FieldStatus-B_cgkwjT.js";import"./computeTargetAndRel-BlG0ENK0.js";const T=i.createContext(null);T.displayName="RadioListContext";function o({ref:t,label:r,isLabelHidden:s=!1,description:n,value:u,onChange:l,orientation:g="vertical",isDisabled:v=!1,isRequired:c=!1,isOptional:f=!1,size:b="md",status:d,labelTooltip:h,width:p,xstyle:k,className:N,style:X,"data-testid":Z,children:K}){const M=i.useId(),Q=i.useId(),$=i.useId(),P=i.useId(),O=i.useRef(null),Y=i.useMemo(()=>({name:M,value:u,onChange:l,isDisabled:v,isRequired:c,size:b,status:d}),[M,u,l,v,c,b,d]),J=i.useCallback(W=>{if(u!=="")return;const R=O.current;if(!R)return;const B=W.relatedTarget;if(B){if(R.contains(B))return}else if(document.activeElement&&document.activeElement!==W.target&&R.contains(document.activeElement))return;const x=Array.from(R.querySelectorAll('input[type="radio"]:not([disabled])'));if(x.length===0)return;const F=W.target,H=x.findIndex(ee=>ee===F);if(H===-1)return;const G=H===x.length-1?x[x.length-1]:x[0];F!==G&&G.focus()},[u]);return e.jsx(ae,{ref:t,"data-testid":Z,label:r,isLabelHidden:s,description:n,inputID:Q,descriptionID:n?$:void 0,isOptional:f,isRequired:c,isDisabled:v,status:d?{type:d.type,message:d.message,messageID:d.message?P:void 0}:void 0,labelTooltip:h,statusVariant:"detached",width:p,xstyle:k,className:N,style:X,children:e.jsx("div",{ref:O,role:"radiogroup","aria-label":r,onFocus:J,"aria-describedby":[n?$:null,d?.message?P:null].filter(Boolean).join(" ")||void 0,"aria-invalid":d?.type==="error"?!0:void 0,"aria-required":c||void 0,...w(_("radio-list",{orientation:g,size:b}),{0:{className:"astryx78zum5 astryx1q0g3np astryx9mgr7n"},1:{className:"astryx78zum5 astryxdt5ytf astryx1txdalj"}}[(g==="vertical")<<0]),children:e.jsx(T,{value:Y,children:K})})})}o.displayName="RadioList";o.__docgenInfo={description:`A radio group component for single-value selection.

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
@default 'md'`,defaultValue:{value:"'md'",computed:!1}},width:{required:!1,tsType:{name:"union",raw:"number | string",elements:[{name:"number"},{name:"string"}]},description:"Width of the field. Numbers are treated as pixels, strings are used as-is\n(e.g. `'100%'`). Sizes the whole field (label, control, and status) so they\nstay aligned, unlike setting width via `xstyle`/`className`/`style`."},labelTooltip:{required:!1,tsType:{name:"string"},description:"Tooltip text to display in an info icon at the end of the label."},"data-testid":{required:!1,tsType:{name:"string"},description:"Test ID for the outer container."},children:{required:!0,tsType:{name:"ReactNode"},description:"Radio list items to render."}},composes:["Omit"]};const se={astryxklqth5:"astryxklqth5",$$css:!0},m={container:{k1xSpc:"astryx78zum5",kGNEyG:"astryx6s0dn4",kOIVth:"astryx1txdalj",$$css:!0},radioWrapper:{kVAEAm:"astryx1n2onr6",k1xSpc:"astryx78zum5",kGNEyG:"astryx6s0dn4",kjj79g:"astryxl56j7k",kmuXW:"astryx2lah0s",kHBbk8:"astryxc8icb0",$$css:!0},input:{kVAEAm:"astryx10l6tqk",kogj98:"astryx1ghz6dp",kmVPX3:"astryx1717udv",kSiTet:"astryxg01cxk",kkrTdU:"astryx1ypdohk",kY2c9j:"astryx1vjfegm",$$css:!0},inputDisabled:{kkrTdU:"astryx1h6gzvc",$$css:!0},radio:{k1xSpc:"astryx78zum5",kGNEyG:"astryx6s0dn4",kjj79g:"astryxl56j7k",kMzoRj:"astryx1litavf",ksu8eU:"astryx1y0btm7",kaIpWk:"astryx16rqkct",k1ekBW:"astryxts7igz",kIyJzY:"astryxuedmi6",kAMwcw:"astryxlr8y92",kB7OPa:"astryx9f619",$$css:!0},radioUnchecked:{kVAM5u:"astryxvy26l8 astryx1qgvwc6",kzOINU:null,kGJrpR:null,kaZRDh:null,kBCPoo:null,k26BEO:null,k5QoK5:null,kLZC3w:null,kL6WhQ:null,kWkggS:"astryx10xzikg astryx49hlbq",$$css:!0},radioChecked:{kVAM5u:"astryxad5do astryx1k21oa1",kzOINU:null,kGJrpR:null,kaZRDh:null,kBCPoo:null,k26BEO:null,k5QoK5:null,kLZC3w:null,kL6WhQ:null,kWkggS:"astryx1ewilqj astryx1y6as5r",$$css:!0},radioWrapperFocus:{kI3sdo:"astryx1a2a7pz astryx1irc7jg",kjBf7l:null,k3XXqK:null,kMeerF:null,kInvED:"astryx1wfwxd8 astryxdjuwb3",kaIpWk:"astryx16rqkct",krdFHd:null,kfmiAY:null,kVL7Gh:null,kT0f0o:null,kIxVMA:null,ksF3WI:null,kqGeR4:null,kYm2EN:null,$$css:!0},radioDisabled:{kSiTet:"astryxbyyjgo",kVAM5u:"astryx14i3s5s",kzOINU:null,kGJrpR:null,kaZRDh:null,kBCPoo:null,k26BEO:null,k5QoK5:null,kLZC3w:null,kL6WhQ:null,$$css:!0},radioDisabledUnchecked:{kWkggS:"astryxwmxj5m",$$css:!0},innerDot:{kaIpWk:"astryx16rqkct",kWkggS:"astryx1azo05",$$css:!0}},U={sm:{kzqmXN:"astryxw4jnvo",kZKoxP:"astryx1qx5ct2",$$css:!0},md:{kzqmXN:"astryxvy4d1p",kZKoxP:"astryxxk0z11",$$css:!0}},le={sm:{kzqmXN:"astryx1xp8n7a",kZKoxP:"astryxmix8c7",$$css:!0},md:{kzqmXN:"astryx17z2i9w",kZKoxP:"astryx17rw0jw",$$css:!0}},re={sm:{kzqmXN:"astryx1xc55vz",kZKoxP:"astryxdk7pt",$$css:!0},md:{kzqmXN:"astryx1fsd2vl",kZKoxP:"astryx170jfvy",$$css:!0}},ie={root:{k8WAf4:"astryxt970qd",kLKAdn:null,kGO01o:null,kg3NbH:"astryxnjsko4",kuDDbn:null,kE3dHu:null,kP0aTx:null,kpe85a:null,kaIpWk:"astryx2u8bby",krdFHd:null,kfmiAY:null,kVL7Gh:null,kT0f0o:null,kIxVMA:null,ksF3WI:null,kqGeR4:null,kYm2EN:null,kUk6DE:"astryx98rzlu",kzQI83:null,kmuXW:null,kCS8Yb:null,k7Eaqz:"astryxeuugli",$$css:!0}};function a({ref:t,label:r,value:s,description:n,isDisabled:u=!1,startContent:l,endContent:g,"data-testid":v}){const c=i.use(T);if(!c)throw new Error("RadioListItem must be used within an RadioList");const f=i.useId(),b=i.useId(),d=c.isDisabled||u,h=c.value===s,p=c.size,k=e.jsxs("div",{...y(m.radioWrapper,U[p],!d&&m.radioWrapperFocus),children:[e.jsx("input",{id:f,type:"radio",name:c.name,value:s,checked:h,disabled:d,required:c.isRequired,onChange:()=>c.onChange(s),"aria-describedby":n?b:void 0,...y(m.input,U[p],d&&m.inputDisabled)}),e.jsx("div",{"aria-hidden":"true",...w(_("radio",{size:p,checked:h?"checked":null,disabled:d?"disabled":null}),y(m.radio,le[p],h?m.radioChecked:m.radioUnchecked,d&&m.radioDisabled,d&&!h&&m.radioDisabledUnchecked)),children:h&&e.jsx("div",{...w(_("radio-dot",{size:p}),y(m.innerDot,re[p]))})})]}),N=l!=null?e.jsxs(e.Fragment,{children:[k,l]}):k;return e.jsx("div",{ref:t,"data-testid":v,...w(_("radio-list-item"),y(m.container,!d&&se)),children:e.jsx(te,{startContent:N,label:e.jsx("label",{htmlFor:f,...{0:{},1:{className:"astryxnbbluu astryx1h6gzvc"}}[!!d<<0],children:r}),description:n!=null?e.jsx("span",{id:b,children:n}):void 0,endContent:g,xstyle:ie.root})})}a.displayName="RadioListItem";a.__docgenInfo={description:`An individual radio item within an RadioList.

@example
\`\`\`
<RadioListItem label="Email" value="email" />
<RadioListItem
  label="SMS"
  value="sms"
  description="Standard messaging rates apply"
/>
\`\`\``,methods:[],displayName:"RadioListItem",props:{xstyle:{required:!1,tsType:{name:"StyleXStyles"},description:"StyleX styles created via `stylex.create()`. Merged with the component's\nbase styles inside a single `stylex.props()` call for optimal deduplication.\n\n@example\n```\nconst overrides = stylex.create({ root: { marginBottom: 8 } });\n<Component xstyle={overrides.root} />\n```"},ref:{required:!1,tsType:{name:"ReactRef",raw:"React.Ref<HTMLDivElement>",elements:[{name:"HTMLDivElement"}]},description:""},label:{required:!0,tsType:{name:"string"},description:"Label text for the radio item."},value:{required:!0,tsType:{name:"string"},description:"Value of this radio item."},description:{required:!1,tsType:{name:"string"},description:"Description text displayed below the label."},isDisabled:{required:!1,tsType:{name:"boolean"},description:`Whether this individual radio item is disabled.
@default false`,defaultValue:{value:"false",computed:!1}},startContent:{required:!1,tsType:{name:"ReactNode"},description:"Content to render before the radio circle."},endContent:{required:!1,tsType:{name:"ReactNode"},description:"Content to render after the label."}},composes:["Omit"]};const ve={title:"Core/RadioList",component:o,tags:["autodocs"],argTypes:{label:{control:"text",description:"Label text (required)"},isLabelHidden:{control:"boolean",description:"Visually hide the label (still accessible to screen readers)"},description:{control:"text",description:"Description text displayed below the label"},value:{control:"text",description:"The currently selected value"},orientation:{control:"select",options:["vertical","horizontal"],description:"Layout direction of the radio items"},isDisabled:{control:"boolean",description:"Whether all radio items are disabled"},isRequired:{control:"boolean",description:"Whether the radio group is required"},isOptional:{control:"boolean",description:"Whether the field is optional"}}},S={render:t=>{const[r,s]=i.useState(t.value??""),{value:n,onChange:u,...l}=t;return e.jsxs(o,{...l,value:r,onChange:s,children:[e.jsx(a,{label:"Email",value:"email"}),e.jsx(a,{label:"SMS",value:"sms"}),e.jsx(a,{label:"Push notification",value:"push"})]})},args:{label:"Notification preference"}},C={render:t=>{const[r,s]=i.useState(t.value??""),{value:n,onChange:u,...l}=t;return e.jsxs(o,{...l,value:r,onChange:s,children:[e.jsx(a,{label:"Email",value:"email",description:"Receive notifications via email"}),e.jsx(a,{label:"SMS",value:"sms",description:"Standard messaging rates apply"}),e.jsx(a,{label:"Push notification",value:"push",description:"Instant alerts on your device"})]})},args:{label:"Notification preference",description:"Choose how you would like to be notified"}},L={render:t=>{const[r,s]=i.useState(t.value??""),{value:n,onChange:u,...l}=t;return e.jsxs(o,{...l,value:r,onChange:s,children:[e.jsx(a,{label:"Small",value:"sm"}),e.jsx(a,{label:"Medium",value:"md"}),e.jsx(a,{label:"Large",value:"lg"})]})},args:{label:"Size",orientation:"horizontal"}},j={render:t=>{const[r,s]=i.useState(t.value??"email"),{value:n,onChange:u,...l}=t;return e.jsxs(o,{...l,value:r,onChange:s,children:[e.jsx(a,{label:"Email",value:"email"}),e.jsx(a,{label:"SMS",value:"sms"}),e.jsx(a,{label:"Push notification",value:"push"})]})},args:{label:"Notification preference",isDisabled:!0}},I={render:t=>{const[r,s]=i.useState(t.value??""),{value:n,onChange:u,...l}=t;return e.jsxs(o,{...l,value:r,onChange:s,children:[e.jsx(a,{label:"Email",value:"email"}),e.jsx(a,{label:"SMS",value:"sms",isDisabled:!0}),e.jsx(a,{label:"Push notification",value:"push"})]})},args:{label:"Notification preference"}},V={render:t=>{const[r,s]=i.useState(t.value??""),{value:n,onChange:u,...l}=t;return e.jsxs(o,{...l,value:r,onChange:s,children:[e.jsx(a,{label:"Email",value:"email"}),e.jsx(a,{label:"SMS",value:"sms"}),e.jsx(a,{label:"Push notification",value:"push"})]})},args:{label:"Notification preference",isRequired:!0}},q={render:t=>{const[r,s]=i.useState(t.value??""),{value:n,onChange:u,...l}=t;return e.jsxs(o,{...l,value:r,onChange:s,children:[e.jsx(a,{label:"Email",value:"email"}),e.jsx(a,{label:"SMS",value:"sms"}),e.jsx(a,{label:"Push notification",value:"push"})]})},args:{label:"Notification preference",isOptional:!0}},D={render:t=>{const[r,s]=i.useState(t.value??""),{value:n,onChange:u,...l}=t;return e.jsxs(o,{...l,value:r,onChange:s,children:[e.jsx(a,{label:"Email",value:"email"}),e.jsx(a,{label:"SMS",value:"sms"}),e.jsx(a,{label:"Push notification",value:"push"})]})},args:{label:"Notification preference",isRequired:!0,status:{type:"error",message:"Please select a notification method"}}},E={render:t=>{const[r,s]=i.useState(t.value??""),{value:n,onChange:u,...l}=t;return e.jsxs(o,{...l,value:r,onChange:s,children:[e.jsx(a,{label:"Email",value:"email",startContent:e.jsx("span",{children:"📧"})}),e.jsx(a,{label:"SMS",value:"sms",startContent:e.jsx("span",{children:"💬"})}),e.jsx(a,{label:"Push notification",value:"push",startContent:e.jsx("span",{children:"🔔"})})]})},args:{label:"Notification preference"}},A={render:t=>{const[r,s]=i.useState(t.value??""),{value:n,onChange:u,...l}=t;return e.jsxs(o,{...l,value:r,onChange:s,children:[e.jsx(a,{label:"Free",value:"free",endContent:e.jsx("span",{style:{color:"#0D8626"},children:"$0/mo"})}),e.jsx(a,{label:"Pro",value:"pro",endContent:e.jsx("span",{style:{color:"#0064E0"},children:"$9/mo"})}),e.jsx(a,{label:"Enterprise",value:"enterprise",endContent:e.jsx("span",{style:{color:"#5B08D8"},children:"Custom"})})]})},args:{label:"Plan"}},z={render:()=>{const[t,r]=i.useState(""),[s,n]=i.useState("email"),[u,l]=i.useState(""),[g,v]=i.useState("sm");return e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"24px",maxWidth:"400px"},children:[e.jsxs(o,{label:"Unselected",value:t,onChange:r,children:[e.jsx(a,{label:"Option A",value:"a"}),e.jsx(a,{label:"Option B",value:"b"})]}),e.jsxs(o,{label:"Pre-selected",value:s,onChange:n,children:[e.jsx(a,{label:"Email",value:"email"}),e.jsx(a,{label:"SMS",value:"sms"})]}),e.jsxs(o,{label:"Disabled group",value:"",onChange:()=>{},isDisabled:!0,children:[e.jsx(a,{label:"Option A",value:"a"}),e.jsx(a,{label:"Option B",value:"b"})]}),e.jsxs(o,{label:"With descriptions",value:u,onChange:l,children:[e.jsx(a,{label:"Email",value:"email",description:"Delivered to your inbox"}),e.jsx(a,{label:"SMS",value:"sms",description:"Standard rates apply"})]}),e.jsxs(o,{label:"Horizontal",value:g,onChange:v,orientation:"horizontal",children:[e.jsx(a,{label:"S",value:"sm"}),e.jsx(a,{label:"M",value:"md"}),e.jsx(a,{label:"L",value:"lg"})]}),e.jsxs(o,{label:"With error",value:"",onChange:()=>{},isRequired:!0,status:{type:"error",message:"Please select an option"},children:[e.jsx(a,{label:"Option A",value:"a"}),e.jsx(a,{label:"Option B",value:"b"})]})]})}};S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
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
}`,...S.parameters?.docs?.source}}};C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
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
}`,...C.parameters?.docs?.source}}};L.parameters={...L.parameters,docs:{...L.parameters?.docs,source:{originalSource:`{
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
}`,...L.parameters?.docs?.source}}};j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
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
        <RadioListItem label="SMS" value="sms" isDisabled />
        <RadioListItem label="Push notification" value="push" />
      </RadioList>;
  },
  args: {
    label: 'Notification preference'
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
    isRequired: true
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
        <RadioListItem label="Email" value="email" />
        <RadioListItem label="SMS" value="sms" />
        <RadioListItem label="Push notification" value="push" />
      </RadioList>;
  },
  args: {
    label: 'Notification preference',
    isOptional: true
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
}`,...D.parameters?.docs?.source}}};E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
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
}`,...E.parameters?.docs?.source}}};A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
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
}`,...A.parameters?.docs?.source}}};z.parameters={...z.parameters,docs:{...z.parameters?.docs,source:{originalSource:`{
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
}`,...z.parameters?.docs?.source}}};const he=["Default","WithDescription","Horizontal","Disabled","DisabledItem","Required","Optional","WithErrorStatus","WithStartContent","WithEndContent","AllVariations"];export{z as AllVariations,S as Default,j as Disabled,I as DisabledItem,L as Horizontal,q as Optional,V as Required,C as WithDescription,A as WithEndContent,D as WithErrorStatus,E as WithStartContent,he as __namedExportsOrder,ve as default};
