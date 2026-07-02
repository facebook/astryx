import{ah as t,a1 as r}from"./iframe-BzSUXdLu.js";import{S as l}from"./Switch-B50Dpp1S.js";import{F as I}from"./BellIcon-7a4Jl1jA.js";import{F as W}from"./ShieldCheckIcon-Dt0mY4O8.js";import"./preload-helper-Ct5FWWRu.js";import"./FieldStatus-CM_meSLQ.js";function O({title:e,titleId:a,...s},u){return t.createElement("svg",Object.assign({xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24",strokeWidth:1.5,stroke:"currentColor","aria-hidden":"true","data-slot":"icon",ref:u,"aria-labelledby":a},s),e?t.createElement("title",{id:a},e):null,t.createElement("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.233-2.33 3 3 0 0 1 3.758 3.848A3.752 3.752 0 0 1 18 19.5H6.75Z"}))}const E=t.forwardRef(O);function q({title:e,titleId:a,...s},u){return t.createElement("svg",Object.assign({xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24",strokeWidth:1.5,stroke:"currentColor","aria-hidden":"true","data-slot":"icon",ref:u,"aria-labelledby":a},s),e?t.createElement("title",{id:a},e):null,t.createElement("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z"}))}const L=t.forwardRef(q),N={title:"Core/Switch",component:l,tags:["autodocs"],argTypes:{label:{control:"text",description:"Label text (required)"},isLabelHidden:{control:"boolean",description:"Visually hide the label (still accessible to screen readers)"},description:{control:"text",description:"Description text displayed below the label"},value:{control:"boolean",description:"Whether the switch is on or off"},isDisabled:{control:"boolean",description:"Whether the switch is disabled"},isOptional:{control:"boolean",description:"Whether the field is optional"},isRequired:{control:"boolean",description:"Whether the switch is required"},labelPosition:{control:"select",options:["start","end"],description:"Which side of the switch the label appears on"},labelSpacing:{control:"select",options:["default","spread"],description:"Spacing behavior between label and switch"}}},i={render:e=>{const[a,s]=t.useState(e.value??!1),{value:u,onChange:c,...n}=e;return r.jsx(l,{...n,value:a,onChange:o=>s(o)})},args:{label:"Enable notifications"}},d={render:e=>{const[a,s]=t.useState(e.value??!0),{value:u,onChange:c,...n}=e;return r.jsx(l,{...n,value:a,onChange:o=>s(o)})},args:{label:"Notifications enabled",value:!0}},g={render:e=>{const[a,s]=t.useState(e.value??!1),{value:u,onChange:c,...n}=e;return r.jsx(l,{...n,value:a,onChange:o=>s(o)})},args:{label:"Dark mode",description:"Switch to a darker color scheme for reduced eye strain."}},h={render:e=>{const[a,s]=t.useState(e.value??!1),{value:u,onChange:c,...n}=e;return r.jsx(l,{...n,value:a,onChange:o=>s(o)})},args:{label:"Toggle row",isLabelHidden:!0}},v={render:e=>{const[a,s]=t.useState(e.value??!1),{value:u,onChange:c,...n}=e;return r.jsx(l,{...n,value:a,onChange:o=>s(o)})},args:{label:"Premium feature",description:"Upgrade to enable this option",isDisabled:!0}},p={render:e=>{const[a,s]=t.useState(e.value??!0),{value:u,onChange:c,...n}=e;return r.jsx(l,{...n,value:a,onChange:o=>s(o)})},args:{label:"Feature enabled",value:!0,isDisabled:!0}},b={render:e=>{const[a,s]=t.useState(e.value??!1),{value:u,onChange:c,...n}=e;return r.jsx(l,{...n,value:a,onChange:o=>s(o)})},args:{label:"Accept terms and conditions",isRequired:!0}},m={render:e=>{const[a,s]=t.useState(e.value??!1),{value:u,onChange:c,...n}=e;return r.jsx(l,{...n,value:a,onChange:o=>s(o)})},args:{label:"Subscribe to newsletter",isOptional:!0}},S={render:e=>{const[a,s]=t.useState(e.value??!1),{value:u,onChange:c,...n}=e;return r.jsx(l,{...n,value:a,onChange:o=>s(o)})},args:{label:"Enable notifications",description:"Receive alerts when important events occur",labelIcon:I}},C={render:e=>{const[a,s]=t.useState(e.value??!1),{value:u,onChange:c,...n}=e;return r.jsx(l,{...n,value:a,onChange:o=>s(o)})},args:{label:"Auto-save",labelTooltip:"Automatically save your changes as you work",labelIcon:E}},f={render:e=>{const[a,s]=t.useState(e.value??!1),{value:u,onChange:c,...n}=e;return r.jsx(l,{...n,value:a,onChange:o=>s(o)})},args:{label:"Enable dark mode",labelPosition:"start",labelIcon:L}},x={render:e=>{const[a,s]=t.useState(e.value??!1),{value:u,onChange:c,...n}=e;return r.jsx("div",{style:{width:300,border:"1px solid #ccc",padding:16},children:r.jsx(l,{...n,value:a,onChange:o=>s(o)})})},args:{label:"Enable notifications",labelPosition:"start",labelSpacing:"spread"}},V={render:()=>{const[e,a]=t.useState(!1),[s,u]=t.useState(!0),[c,n]=t.useState(!1),[o,R]=t.useState(!0),[P,T]=t.useState(!1);return r.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"16px",maxWidth:"400px"},children:[r.jsx(l,{label:"Off state",value:e,onChange:a}),r.jsx(l,{label:"On state",value:s,onChange:u}),r.jsx(l,{label:"Disabled off",value:c,onChange:n,isDisabled:!0}),r.jsx(l,{label:"Disabled on",value:o,onChange:R,isDisabled:!0}),r.jsx(l,{label:"With description",description:"Additional context for this setting",value:P,onChange:T})]})}},w={render:()=>{const[e,a]=t.useState(!1),[s,u]=t.useState(!0),[c,n]=t.useState(!1);return r.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"16px",maxWidth:"400px"},children:[r.jsx(l,{label:"Notifications",description:"Receive push notifications",value:e,onChange:a,labelIcon:I}),r.jsx(l,{label:"Dark mode",description:"Use dark color scheme",value:s,onChange:u,labelIcon:L}),r.jsx(l,{label:"Two-factor authentication",description:"Add an extra layer of security",value:c,onChange:n,labelIcon:W,isDisabled:!0})]})}},A={render:()=>{const[e,a]=t.useState(!1),[s,u]=t.useState(!1);return r.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"16px",maxWidth:"400px"},children:[r.jsx(l,{label:"Label at end (default)",value:e,onChange:a,labelPosition:"end"}),r.jsx(l,{label:"Label at start",value:s,onChange:u,labelPosition:"start"})]})}},y={render:()=>{const[e,a]=t.useState(!1),[s,u]=t.useState(!0),[c,n]=t.useState(!1);return r.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"16px",width:"350px",border:"1px solid #e0e0e0",borderRadius:"8px",padding:"16px"},children:[r.jsx(l,{label:"Enable notifications",value:e,onChange:a,labelPosition:"start",labelSpacing:"spread",labelIcon:I}),r.jsx(l,{label:"Dark mode",value:s,onChange:u,labelPosition:"start",labelSpacing:"spread",labelIcon:L}),r.jsx(l,{label:"Auto-save",value:c,onChange:n,labelPosition:"start",labelSpacing:"spread",labelIcon:E,labelTooltip:"Save changes automatically as you work"})]})}},_={render:e=>{const[a,s]=t.useState(e.value??!1),{value:u,onChange:c,...n}=e;return r.jsx(l,{...n,value:a,onChange:o=>s(o)})},args:{label:"Accept terms and conditions",isRequired:!0,status:{type:"error",message:"You must accept the terms to continue"}}},k={render:e=>{const[a,s]=t.useState(e.value??!0),{value:u,onChange:c,...n}=e;return r.jsx(l,{...n,value:a,onChange:o=>s(o)})},args:{label:"Share usage data",description:"Help us improve by sharing anonymous usage statistics",status:{type:"warning",message:"This data may be shared with partners"}}},j={render:e=>{const[a,s]=t.useState(e.value??!0),{value:u,onChange:c,...n}=e;return r.jsx(l,{...n,value:a,onChange:o=>s(o)})},args:{label:"Two-factor authentication",labelIcon:W,status:{type:"success",message:"Your account is now more secure"}}},D={render:()=>{const[e,a]=t.useState(!1),[s,u]=t.useState(!0),[c,n]=t.useState(!0);return r.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"24px",maxWidth:"400px"},children:[r.jsx(l,{label:"Accept terms and conditions",value:e,onChange:a,isRequired:!0,status:{type:"error",message:"You must accept the terms to continue"}}),r.jsx(l,{label:"Share usage data",description:"Help us improve by sharing anonymous usage statistics",value:s,onChange:u,status:{type:"warning",message:"This data may be shared with partners"}}),r.jsx(l,{label:"Two-factor authentication",value:c,onChange:n,labelIcon:W,status:{type:"success",message:"Your account is now more secure"}})]})}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState(args.value ?? false);
    const {
      value: _value,
      onChange: _onChange,
      ...restArgs
    } = args;
    return <Switch {...restArgs} value={value} onChange={checked => setValue(checked)} />;
  },
  args: {
    label: 'Enable notifications'
  }
}`,...i.parameters?.docs?.source}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState(args.value ?? true);
    const {
      value: _value,
      onChange: _onChange,
      ...restArgs
    } = args;
    return <Switch {...restArgs} value={value} onChange={checked => setValue(checked)} />;
  },
  args: {
    label: 'Notifications enabled',
    value: true
  }
}`,...d.parameters?.docs?.source}}};g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState(args.value ?? false);
    const {
      value: _value,
      onChange: _onChange,
      ...restArgs
    } = args;
    return <Switch {...restArgs} value={value} onChange={checked => setValue(checked)} />;
  },
  args: {
    label: 'Dark mode',
    description: 'Switch to a darker color scheme for reduced eye strain.'
  }
}`,...g.parameters?.docs?.source}}};h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState(args.value ?? false);
    const {
      value: _value,
      onChange: _onChange,
      ...restArgs
    } = args;
    return <Switch {...restArgs} value={value} onChange={checked => setValue(checked)} />;
  },
  args: {
    label: 'Toggle row',
    isLabelHidden: true
  }
}`,...h.parameters?.docs?.source}}};v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState(args.value ?? false);
    const {
      value: _value,
      onChange: _onChange,
      ...restArgs
    } = args;
    return <Switch {...restArgs} value={value} onChange={checked => setValue(checked)} />;
  },
  args: {
    label: 'Premium feature',
    description: 'Upgrade to enable this option',
    isDisabled: true
  }
}`,...v.parameters?.docs?.source}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState(args.value ?? true);
    const {
      value: _value,
      onChange: _onChange,
      ...restArgs
    } = args;
    return <Switch {...restArgs} value={value} onChange={checked => setValue(checked)} />;
  },
  args: {
    label: 'Feature enabled',
    value: true,
    isDisabled: true
  }
}`,...p.parameters?.docs?.source}}};b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState(args.value ?? false);
    const {
      value: _value,
      onChange: _onChange,
      ...restArgs
    } = args;
    return <Switch {...restArgs} value={value} onChange={checked => setValue(checked)} />;
  },
  args: {
    label: 'Accept terms and conditions',
    isRequired: true
  }
}`,...b.parameters?.docs?.source}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState(args.value ?? false);
    const {
      value: _value,
      onChange: _onChange,
      ...restArgs
    } = args;
    return <Switch {...restArgs} value={value} onChange={checked => setValue(checked)} />;
  },
  args: {
    label: 'Subscribe to newsletter',
    isOptional: true
  }
}`,...m.parameters?.docs?.source}}};S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState(args.value ?? false);
    const {
      value: _value,
      onChange: _onChange,
      ...restArgs
    } = args;
    return <Switch {...restArgs} value={value} onChange={checked => setValue(checked)} />;
  },
  args: {
    label: 'Enable notifications',
    description: 'Receive alerts when important events occur',
    labelIcon: BellIcon
  }
}`,...S.parameters?.docs?.source}}};C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState(args.value ?? false);
    const {
      value: _value,
      onChange: _onChange,
      ...restArgs
    } = args;
    return <Switch {...restArgs} value={value} onChange={checked => setValue(checked)} />;
  },
  args: {
    label: 'Auto-save',
    labelTooltip: 'Automatically save your changes as you work',
    labelIcon: CloudArrowUpIcon
  }
}`,...C.parameters?.docs?.source}}};f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState(args.value ?? false);
    const {
      value: _value,
      onChange: _onChange,
      ...restArgs
    } = args;
    return <Switch {...restArgs} value={value} onChange={checked => setValue(checked)} />;
  },
  args: {
    label: 'Enable dark mode',
    labelPosition: 'start',
    labelIcon: MoonIcon
  }
}`,...f.parameters?.docs?.source}}};x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState(args.value ?? false);
    const {
      value: _value,
      onChange: _onChange,
      ...restArgs
    } = args;
    return <div style={{
      width: 300,
      border: '1px solid #ccc',
      padding: 16
    }}>
        <Switch {...restArgs} value={value} onChange={checked => setValue(checked)} />
      </div>;
  },
  args: {
    label: 'Enable notifications',
    labelPosition: 'start',
    labelSpacing: 'spread'
  }
}`,...x.parameters?.docs?.source}}};V.parameters={...V.parameters,docs:{...V.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [value1, setValue1] = useState(false);
    const [value2, setValue2] = useState(true);
    const [value3, setValue3] = useState(false);
    const [value4, setValue4] = useState(true);
    const [value5, setValue5] = useState(false);
    return <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      maxWidth: '400px'
    }}>
        <Switch label="Off state" value={value1} onChange={setValue1} />
        <Switch label="On state" value={value2} onChange={setValue2} />
        <Switch label="Disabled off" value={value3} onChange={setValue3} isDisabled />
        <Switch label="Disabled on" value={value4} onChange={setValue4} isDisabled />
        <Switch label="With description" description="Additional context for this setting" value={value5} onChange={setValue5} />
      </div>;
  }
}`,...V.parameters?.docs?.source}}};w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [value1, setValue1] = useState(false);
    const [value2, setValue2] = useState(true);
    const [value3, setValue3] = useState(false);
    return <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      maxWidth: '400px'
    }}>
        <Switch label="Notifications" description="Receive push notifications" value={value1} onChange={setValue1} labelIcon={BellIcon} />
        <Switch label="Dark mode" description="Use dark color scheme" value={value2} onChange={setValue2} labelIcon={MoonIcon} />
        <Switch label="Two-factor authentication" description="Add an extra layer of security" value={value3} onChange={setValue3} labelIcon={ShieldCheckIcon} isDisabled />
      </div>;
  }
}`,...w.parameters?.docs?.source}}};A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [value1, setValue1] = useState(false);
    const [value2, setValue2] = useState(false);
    return <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      maxWidth: '400px'
    }}>
        <Switch label="Label at end (default)" value={value1} onChange={setValue1} labelPosition="end" />
        <Switch label="Label at start" value={value2} onChange={setValue2} labelPosition="start" />
      </div>;
  }
}`,...A.parameters?.docs?.source}}};y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [value1, setValue1] = useState(false);
    const [value2, setValue2] = useState(true);
    const [value3, setValue3] = useState(false);
    return <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      width: '350px',
      border: '1px solid #e0e0e0',
      borderRadius: '8px',
      padding: '16px'
    }}>
        <Switch label="Enable notifications" value={value1} onChange={setValue1} labelPosition="start" labelSpacing="spread" labelIcon={BellIcon} />
        <Switch label="Dark mode" value={value2} onChange={setValue2} labelPosition="start" labelSpacing="spread" labelIcon={MoonIcon} />
        <Switch label="Auto-save" value={value3} onChange={setValue3} labelPosition="start" labelSpacing="spread" labelIcon={CloudArrowUpIcon} labelTooltip="Save changes automatically as you work" />
      </div>;
  }
}`,...y.parameters?.docs?.source}}};_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState(args.value ?? false);
    const {
      value: _value,
      onChange: _onChange,
      ...restArgs
    } = args;
    return <Switch {...restArgs} value={value} onChange={checked => setValue(checked)} />;
  },
  args: {
    label: 'Accept terms and conditions',
    isRequired: true,
    status: {
      type: 'error',
      message: 'You must accept the terms to continue'
    }
  }
}`,..._.parameters?.docs?.source}}};k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState(args.value ?? true);
    const {
      value: _value,
      onChange: _onChange,
      ...restArgs
    } = args;
    return <Switch {...restArgs} value={value} onChange={checked => setValue(checked)} />;
  },
  args: {
    label: 'Share usage data',
    description: 'Help us improve by sharing anonymous usage statistics',
    status: {
      type: 'warning',
      message: 'This data may be shared with partners'
    }
  }
}`,...k.parameters?.docs?.source}}};j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState(args.value ?? true);
    const {
      value: _value,
      onChange: _onChange,
      ...restArgs
    } = args;
    return <Switch {...restArgs} value={value} onChange={checked => setValue(checked)} />;
  },
  args: {
    label: 'Two-factor authentication',
    labelIcon: ShieldCheckIcon,
    status: {
      type: 'success',
      message: 'Your account is now more secure'
    }
  }
}`,...j.parameters?.docs?.source}}};D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [value1, setValue1] = useState(false);
    const [value2, setValue2] = useState(true);
    const [value3, setValue3] = useState(true);
    return <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
      maxWidth: '400px'
    }}>
        <Switch label="Accept terms and conditions" value={value1} onChange={setValue1} isRequired status={{
        type: 'error',
        message: 'You must accept the terms to continue'
      }} />
        <Switch label="Share usage data" description="Help us improve by sharing anonymous usage statistics" value={value2} onChange={setValue2} status={{
        type: 'warning',
        message: 'This data may be shared with partners'
      }} />
        <Switch label="Two-factor authentication" value={value3} onChange={setValue3} labelIcon={ShieldCheckIcon} status={{
        type: 'success',
        message: 'Your account is now more secure'
      }} />
      </div>;
  }
}`,...D.parameters?.docs?.source}}};const $=["Default","On","WithDescription","WithHiddenLabel","Disabled","DisabledOn","Required","Optional","WithLabelIcon","WithLabelTooltip","LabelPositionStart","LabelSpacingSpread","AllVariations","LabelIconVariations","LabelPositionComparison","SpreadSpacingExample","WithErrorStatus","WithWarningStatus","WithSuccessStatus","StatusVariations"];export{V as AllVariations,i as Default,v as Disabled,p as DisabledOn,w as LabelIconVariations,A as LabelPositionComparison,f as LabelPositionStart,x as LabelSpacingSpread,d as On,m as Optional,b as Required,y as SpreadSpacingExample,D as StatusVariations,g as WithDescription,_ as WithErrorStatus,h as WithHiddenLabel,S as WithLabelIcon,C as WithLabelTooltip,j as WithSuccessStatus,k as WithWarningStatus,$ as __namedExportsOrder,N as default};
