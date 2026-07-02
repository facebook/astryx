import{ah as o,a1 as n}from"./iframe-BzSUXdLu.js";import{C as r}from"./CheckboxInput-BiNL1EtH.js";import{F as A}from"./BellIcon-7a4Jl1jA.js";import{F as W}from"./EnvelopeIcon-D2lwJNRV.js";import{F as w}from"./ShieldCheckIcon-Dt0mY4O8.js";import"./preload-helper-Ct5FWWRu.js";import"./FieldStatus-CM_meSLQ.js";const L={title:"Core/CheckboxInput",component:r,tags:["autodocs"],argTypes:{label:{control:"text",description:"Label text (required)"},isLabelHidden:{control:"boolean",description:"Visually hide the label (still accessible to screen readers)"},description:{control:"text",description:"Description text displayed below the label"},value:{control:"select",options:[!0,!1,"indeterminate"],description:"Whether the checkbox is checked, unchecked, or indeterminate"},isDisabled:{control:"boolean",description:"Whether the checkbox is disabled"},isRequired:{control:"boolean",description:"Whether the checkbox is required"},size:{control:"select",options:["sm","md"],description:"Size of the checkbox"}}},i={render:e=>{const[a,t]=o.useState(e.value??!1),{value:u,onChange:c,...s}=e;return n.jsx(r,{...s,value:a,onChange:l=>t(l)})},args:{label:"Accept terms and conditions"}},d={render:e=>{const[a,t]=o.useState(e.value??!0),{value:u,onChange:c,...s}=e;return n.jsx(r,{...s,value:a,onChange:l=>t(l)})},args:{label:"I agree to the terms",value:!0}},h={render:e=>{const[a,t]=o.useState(e.value??!1),{value:u,onChange:c,...s}=e;return n.jsx(r,{...s,value:a,onChange:l=>t(l)})},args:{label:"Subscribe to newsletter",description:"Receive weekly updates about new features and announcements."}},m={render:e=>{const[a,t]=o.useState(e.value??!1),{value:u,onChange:c,...s}=e;return n.jsx(r,{...s,value:a,onChange:l=>t(l)})},args:{label:"Select row",isLabelHidden:!0}},g={render:e=>{const[a,t]=o.useState(e.value??"indeterminate"),{value:u,onChange:c,...s}=e;return n.jsx(r,{...s,value:a,onChange:l=>t(l)})},args:{label:"Select all items",description:"Some items are selected",value:"indeterminate"}},p={render:e=>{const[a,t]=o.useState(e.value??!1),{value:u,onChange:c,...s}=e;return n.jsx(r,{...s,value:a,onChange:l=>t(l)})},args:{label:"Premium feature",description:"Upgrade to enable this option",isDisabled:!0}},v={render:e=>{const[a,t]=o.useState(e.value??!0),{value:u,onChange:c,...s}=e;return n.jsx(r,{...s,value:a,onChange:l=>t(l)})},args:{label:"Feature enabled",value:!0,isDisabled:!0}},b={render:()=>{const[e,a]=o.useState(!1),[t,u]=o.useState(!0),[c,s]=o.useState("indeterminate"),[l,I]=o.useState(!1),[j,D]=o.useState(!0);return n.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"16px",maxWidth:"400px"},children:[n.jsx(r,{label:"Unchecked",value:e,onChange:a}),n.jsx(r,{label:"Checked",value:t,onChange:u}),n.jsx(r,{label:"Indeterminate",description:"Some items are selected",value:c,onChange:s}),n.jsx(r,{label:"Disabled unchecked",value:l,onChange:I,isDisabled:!0}),n.jsx(r,{label:"Disabled checked",value:j,onChange:D,isDisabled:!0})]})}},C={render:e=>{const[a,t]=o.useState(e.value??!1),{value:u,onChange:c,...s}=e;return n.jsx(r,{...s,value:a,onChange:l=>t(l)})},args:{label:"Compact checkbox",size:"sm"}},x={render:()=>{const[e,a]=o.useState(!1),[t,u]=o.useState(!1),[c,s]=o.useState(!0),[l,I]=o.useState(!0);return n.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"16px",maxWidth:"400px"},children:[n.jsx(r,{label:"Medium size (default)",value:e,onChange:a,size:"md"}),n.jsx(r,{label:"Small size",value:t,onChange:u,size:"sm"}),n.jsx(r,{label:"Medium size checked",value:c,onChange:s,size:"md"}),n.jsx(r,{label:"Small size checked",value:l,onChange:I,size:"sm"})]})}},S={render:e=>{const[a,t]=o.useState(e.value??!1),{value:u,onChange:c,...s}=e;return n.jsx(r,{...s,value:a,onChange:l=>t(l)})},args:{label:"Enable notifications",description:"Receive alerts when important events occur",labelIcon:A}},V={render:()=>{const[e,a]=o.useState(!1),[t,u]=o.useState(!0),[c,s]=o.useState(!1);return n.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"16px",maxWidth:"400px"},children:[n.jsx(r,{label:"Email notifications",description:"Receive updates via email",value:e,onChange:a,labelIcon:W}),n.jsx(r,{label:"Push notifications",description:"Get instant alerts on your device",value:t,onChange:u,labelIcon:A}),n.jsx(r,{label:"Two-factor authentication",description:"Add an extra layer of security",value:c,onChange:s,labelIcon:w,isDisabled:!0})]})}},f={render:e=>{const[a,t]=o.useState(e.value??!1),{value:u,onChange:c,...s}=e;return n.jsx(r,{...s,value:a,onChange:l=>t(l)})},args:{label:"Accept terms and conditions",status:{type:"error",message:"You must accept the terms to continue"}}},k={render:e=>{const[a,t]=o.useState(e.value??!0),{value:u,onChange:c,...s}=e;return n.jsx(r,{...s,value:a,onChange:l=>t(l)})},args:{label:"Share usage data",description:"Help us improve by sharing anonymous usage statistics",status:{type:"warning",message:"This data may be shared with partners"}}},_={render:e=>{const[a,t]=o.useState(e.value??!0),{value:u,onChange:c,...s}=e;return n.jsx(r,{...s,value:a,onChange:l=>t(l)})},args:{label:"Email verified",status:{type:"success",message:"Your email has been verified"}}},y={render:()=>{const[e,a]=o.useState(!1),[t,u]=o.useState(!0),[c,s]=o.useState(!0);return n.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"24px",maxWidth:"400px"},children:[n.jsx(r,{label:"Accept terms and conditions",value:e,onChange:a,status:{type:"error",message:"You must accept the terms to continue"}}),n.jsx(r,{label:"Share usage data",description:"Help us improve by sharing anonymous usage statistics",value:t,onChange:u,status:{type:"warning",message:"This data may be shared with partners"}}),n.jsx(r,{label:"Email verified",value:c,onChange:s,status:{type:"success",message:"Your email has been verified"}})]})}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<boolean | 'indeterminate'>(args.value ?? false);
    const {
      value: _,
      onChange: __,
      ...restArgs
    } = args;
    return <CheckboxInput {...restArgs} value={value} onChange={checked => setValue(checked)} />;
  },
  args: {
    label: 'Accept terms and conditions'
  }
}`,...i.parameters?.docs?.source}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<boolean | 'indeterminate'>(args.value ?? true);
    const {
      value: _,
      onChange: __,
      ...restArgs
    } = args;
    return <CheckboxInput {...restArgs} value={value} onChange={checked => setValue(checked)} />;
  },
  args: {
    label: 'I agree to the terms',
    value: true
  }
}`,...d.parameters?.docs?.source}}};h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<boolean | 'indeterminate'>(args.value ?? false);
    const {
      value: _,
      onChange: __,
      ...restArgs
    } = args;
    return <CheckboxInput {...restArgs} value={value} onChange={checked => setValue(checked)} />;
  },
  args: {
    label: 'Subscribe to newsletter',
    description: 'Receive weekly updates about new features and announcements.'
  }
}`,...h.parameters?.docs?.source}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<boolean | 'indeterminate'>(args.value ?? false);
    const {
      value: _,
      onChange: __,
      ...restArgs
    } = args;
    return <CheckboxInput {...restArgs} value={value} onChange={checked => setValue(checked)} />;
  },
  args: {
    label: 'Select row',
    isLabelHidden: true
  }
}`,...m.parameters?.docs?.source}}};g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<boolean | 'indeterminate'>(args.value ?? 'indeterminate');
    const {
      value: _,
      onChange: __,
      ...restArgs
    } = args;
    return <CheckboxInput {...restArgs} value={value} onChange={checked => setValue(checked)} />;
  },
  args: {
    label: 'Select all items',
    description: 'Some items are selected',
    value: 'indeterminate'
  }
}`,...g.parameters?.docs?.source}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<boolean | 'indeterminate'>(args.value ?? false);
    const {
      value: _,
      onChange: __,
      ...restArgs
    } = args;
    return <CheckboxInput {...restArgs} value={value} onChange={checked => setValue(checked)} />;
  },
  args: {
    label: 'Premium feature',
    description: 'Upgrade to enable this option',
    isDisabled: true
  }
}`,...p.parameters?.docs?.source}}};v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<boolean | 'indeterminate'>(args.value ?? true);
    const {
      value: _,
      onChange: __,
      ...restArgs
    } = args;
    return <CheckboxInput {...restArgs} value={value} onChange={checked => setValue(checked)} />;
  },
  args: {
    label: 'Feature enabled',
    value: true,
    isDisabled: true
  }
}`,...v.parameters?.docs?.source}}};b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [value1, setValue1] = useState<boolean | 'indeterminate'>(false);
    const [value2, setValue2] = useState<boolean | 'indeterminate'>(true);
    const [value3, setValue3] = useState<boolean | 'indeterminate'>('indeterminate');
    const [value4, setValue4] = useState<boolean | 'indeterminate'>(false);
    const [value5, setValue5] = useState<boolean | 'indeterminate'>(true);
    return <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      maxWidth: '400px'
    }}>
        <CheckboxInput label="Unchecked" value={value1} onChange={setValue1} />
        <CheckboxInput label="Checked" value={value2} onChange={setValue2} />
        <CheckboxInput label="Indeterminate" description="Some items are selected" value={value3} onChange={setValue3} />
        <CheckboxInput label="Disabled unchecked" value={value4} onChange={setValue4} isDisabled />
        <CheckboxInput label="Disabled checked" value={value5} onChange={setValue5} isDisabled />
      </div>;
  }
}`,...b.parameters?.docs?.source}}};C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<boolean | 'indeterminate'>(args.value ?? false);
    const {
      value: _,
      onChange: __,
      ...restArgs
    } = args;
    return <CheckboxInput {...restArgs} value={value} onChange={checked => setValue(checked)} />;
  },
  args: {
    label: 'Compact checkbox',
    size: 'sm'
  }
}`,...C.parameters?.docs?.source}}};x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [value1, setValue1] = useState<boolean | 'indeterminate'>(false);
    const [value2, setValue2] = useState<boolean | 'indeterminate'>(false);
    const [value3, setValue3] = useState<boolean | 'indeterminate'>(true);
    const [value4, setValue4] = useState<boolean | 'indeterminate'>(true);
    return <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      maxWidth: '400px'
    }}>
        <CheckboxInput label="Medium size (default)" value={value1} onChange={setValue1} size="md" />
        <CheckboxInput label="Small size" value={value2} onChange={setValue2} size="sm" />
        <CheckboxInput label="Medium size checked" value={value3} onChange={setValue3} size="md" />
        <CheckboxInput label="Small size checked" value={value4} onChange={setValue4} size="sm" />
      </div>;
  }
}`,...x.parameters?.docs?.source}}};S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<boolean | 'indeterminate'>(args.value ?? false);
    const {
      value: _,
      onChange: __,
      ...restArgs
    } = args;
    return <CheckboxInput {...restArgs} value={value} onChange={checked => setValue(checked)} />;
  },
  args: {
    label: 'Enable notifications',
    description: 'Receive alerts when important events occur',
    labelIcon: BellIcon
  }
}`,...S.parameters?.docs?.source}}};V.parameters={...V.parameters,docs:{...V.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [value1, setValue1] = useState<boolean | 'indeterminate'>(false);
    const [value2, setValue2] = useState<boolean | 'indeterminate'>(true);
    const [value3, setValue3] = useState<boolean | 'indeterminate'>(false);
    return <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      maxWidth: '400px'
    }}>
        <CheckboxInput label="Email notifications" description="Receive updates via email" value={value1} onChange={setValue1} labelIcon={EnvelopeIcon} />
        <CheckboxInput label="Push notifications" description="Get instant alerts on your device" value={value2} onChange={setValue2} labelIcon={BellIcon} />
        <CheckboxInput label="Two-factor authentication" description="Add an extra layer of security" value={value3} onChange={setValue3} labelIcon={ShieldCheckIcon} isDisabled />
      </div>;
  }
}`,...V.parameters?.docs?.source}}};f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<boolean | 'indeterminate'>(args.value ?? false);
    const {
      value: _,
      onChange: __,
      ...restArgs
    } = args;
    return <CheckboxInput {...restArgs} value={value} onChange={checked => setValue(checked)} />;
  },
  args: {
    label: 'Accept terms and conditions',
    status: {
      type: 'error',
      message: 'You must accept the terms to continue'
    }
  }
}`,...f.parameters?.docs?.source}}};k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<boolean | 'indeterminate'>(args.value ?? true);
    const {
      value: _,
      onChange: __,
      ...restArgs
    } = args;
    return <CheckboxInput {...restArgs} value={value} onChange={checked => setValue(checked)} />;
  },
  args: {
    label: 'Share usage data',
    description: 'Help us improve by sharing anonymous usage statistics',
    status: {
      type: 'warning',
      message: 'This data may be shared with partners'
    }
  }
}`,...k.parameters?.docs?.source}}};_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<boolean | 'indeterminate'>(args.value ?? true);
    const {
      value: _,
      onChange: __,
      ...restArgs
    } = args;
    return <CheckboxInput {...restArgs} value={value} onChange={checked => setValue(checked)} />;
  },
  args: {
    label: 'Email verified',
    status: {
      type: 'success',
      message: 'Your email has been verified'
    }
  }
}`,..._.parameters?.docs?.source}}};y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [value1, setValue1] = useState<boolean | 'indeterminate'>(false);
    const [value2, setValue2] = useState<boolean | 'indeterminate'>(true);
    const [value3, setValue3] = useState<boolean | 'indeterminate'>(true);
    return <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
      maxWidth: '400px'
    }}>
        <CheckboxInput label="Accept terms and conditions" value={value1} onChange={setValue1} status={{
        type: 'error',
        message: 'You must accept the terms to continue'
      }} />
        <CheckboxInput label="Share usage data" description="Help us improve by sharing anonymous usage statistics" value={value2} onChange={setValue2} status={{
        type: 'warning',
        message: 'This data may be shared with partners'
      }} />
        <CheckboxInput label="Email verified" value={value3} onChange={setValue3} status={{
        type: 'success',
        message: 'Your email has been verified'
      }} />
      </div>;
  }
}`,...y.parameters?.docs?.source}}};const M=["Default","Checked","WithDescription","WithHiddenLabel","Indeterminate","Disabled","DisabledChecked","AllVariations","SmallSize","SizeComparison","WithStartIcon","StartIconVariations","WithErrorStatus","WithWarningStatus","WithSuccessStatus","StatusVariations"];export{b as AllVariations,d as Checked,i as Default,p as Disabled,v as DisabledChecked,g as Indeterminate,x as SizeComparison,C as SmallSize,V as StartIconVariations,y as StatusVariations,h as WithDescription,f as WithErrorStatus,m as WithHiddenLabel,S as WithStartIcon,_ as WithSuccessStatus,k as WithWarningStatus,M as __namedExportsOrder,L as default};
