import{i as e,s as t}from"./preload-helper-CT_b8DTk.js";import{t as n}from"./react-B7Te67-h.js";import{t as r}from"./jsx-runtime-DqZldVDK.js";import{Rn as i,zn as a}from"./iframe-B2M4pHB5.js";import{E as o,H as s,Wt as c,gn as l,t as u}from"./esm-DA7gAIBC.js";var d,f,p,m,h,g,_,v,y,b,x,S,C,w,T,E,D,O,k,A,j,M,N,P,F;e((()=>{d=t(n()),i(),u(),f=r(),p={title:`Core/Switch`,component:a,tags:[`autodocs`],argTypes:{label:{control:`text`,description:`Label text (required)`},isLabelHidden:{control:`boolean`,description:`Visually hide the label (still accessible to screen readers)`},description:{control:`text`,description:`Description text displayed below the label`},value:{control:`boolean`,description:`Whether the switch is on or off`},isDisabled:{control:`boolean`,description:`Whether the switch is disabled`},disabledMessage:{control:`text`,description:`Explains why the switch is disabled. With isDisabled, shows a tooltip on hover/keyboard focus and keeps the switch focusable via aria-disabled (toggling stays blocked). Use this instead of wrapping a disabled Switch in Tooltip.`},isOptional:{control:`boolean`,description:`Whether the field is optional`},isRequired:{control:`boolean`,description:`Whether the switch is required`},labelPosition:{control:`select`,options:[`start`,`end`],description:`Which side of the switch the label appears on`},labelSpacing:{control:`select`,options:[`hug`,`spread`],description:`Spacing behavior between label and switch`}}},m={render:e=>{let[t,n]=(0,d.useState)(e.value??!1),{value:r,onChange:i,...o}=e;return(0,f.jsx)(a,{...o,value:t,onChange:e=>n(e)})},args:{label:`Enable notifications`}},h={render:e=>{let[t,n]=(0,d.useState)(e.value??!0),{value:r,onChange:i,...o}=e;return(0,f.jsx)(a,{...o,value:t,onChange:e=>n(e)})},args:{label:`Notifications enabled`,value:!0}},g={render:e=>{let[t,n]=(0,d.useState)(e.value??!1),{value:r,onChange:i,...o}=e;return(0,f.jsx)(a,{...o,value:t,onChange:e=>n(e)})},args:{label:`Dark mode`,description:`Switch to a darker color scheme for reduced eye strain.`}},_={render:e=>{let[t,n]=(0,d.useState)(e.value??!1),{value:r,onChange:i,...o}=e;return(0,f.jsx)(a,{...o,value:t,onChange:e=>n(e)})},args:{label:`Toggle row`,isLabelHidden:!0}},v={render:e=>{let[t,n]=(0,d.useState)(e.value??!1),{value:r,onChange:i,...o}=e;return(0,f.jsx)(a,{...o,value:t,onChange:e=>n(e)})},args:{label:`Premium feature`,description:`Upgrade to enable this option`,isDisabled:!0}},y={render:e=>{let[t,n]=(0,d.useState)(e.value??!0),{value:r,onChange:i,...o}=e;return(0,f.jsx)(a,{...o,value:t,onChange:e=>n(e)})},args:{label:`Feature enabled`,value:!0,isDisabled:!0}},b={render:e=>{let[t,n]=(0,d.useState)(e.value??!1),{value:r,onChange:i,...o}=e;return(0,f.jsx)(a,{...o,value:t,onChange:e=>n(e)})},args:{label:`Accept terms and conditions`,isRequired:!0}},x={render:e=>{let[t,n]=(0,d.useState)(e.value??!1),{value:r,onChange:i,...o}=e;return(0,f.jsx)(a,{...o,value:t,onChange:e=>n(e)})},args:{label:`Subscribe to newsletter`,isOptional:!0}},S={render:e=>{let[t,n]=(0,d.useState)(e.value??!1),{value:r,onChange:i,...o}=e;return(0,f.jsx)(a,{...o,value:t,onChange:e=>n(e)})},args:{label:`Enable notifications`,description:`Receive alerts when important events occur`,labelIcon:l}},C={render:e=>{let[t,n]=(0,d.useState)(e.value??!1),{value:r,onChange:i,...o}=e;return(0,f.jsx)(a,{...o,value:t,onChange:e=>n(e)})},args:{label:`Auto-save`,labelTooltip:`Automatically save your changes as you work`,labelIcon:c}},w={render:e=>{let[t,n]=(0,d.useState)(e.value??!1),{value:r,onChange:i,...o}=e;return(0,f.jsx)(a,{...o,value:t,onChange:e=>n(e)})},args:{label:`Enable dark mode`,labelPosition:`start`,labelIcon:s}},T={render:e=>{let[t,n]=(0,d.useState)(e.value??!1),{value:r,onChange:i,...o}=e;return(0,f.jsx)(`div`,{style:{width:300,border:`1px solid #ccc`,padding:16},children:(0,f.jsx)(a,{...o,value:t,onChange:e=>n(e)})})},args:{label:`Enable notifications`,labelPosition:`start`,labelSpacing:`spread`}},E={render:()=>{let[e,t]=(0,d.useState)(!1),[n,r]=(0,d.useState)(!0),[i,o]=(0,d.useState)(!1),[s,c]=(0,d.useState)(!0),[l,u]=(0,d.useState)(!1);return(0,f.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`16px`,maxWidth:`400px`},children:[(0,f.jsx)(a,{label:`Off state`,value:e,onChange:t}),(0,f.jsx)(a,{label:`On state`,value:n,onChange:r}),(0,f.jsx)(a,{label:`Disabled off`,value:i,onChange:o,isDisabled:!0}),(0,f.jsx)(a,{label:`Disabled on`,value:s,onChange:c,isDisabled:!0}),(0,f.jsx)(a,{label:`With description`,description:`Additional context for this setting`,value:l,onChange:u})]})}},D={render:()=>{let[e,t]=(0,d.useState)(!1),[n,r]=(0,d.useState)(!0),[i,c]=(0,d.useState)(!1);return(0,f.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`16px`,maxWidth:`400px`},children:[(0,f.jsx)(a,{label:`Notifications`,description:`Receive push notifications`,value:e,onChange:t,labelIcon:l}),(0,f.jsx)(a,{label:`Dark mode`,description:`Use dark color scheme`,value:n,onChange:r,labelIcon:s}),(0,f.jsx)(a,{label:`Two-factor authentication`,description:`Add an extra layer of security`,value:i,onChange:c,labelIcon:o,isDisabled:!0})]})}},O={render:()=>{let[e,t]=(0,d.useState)(!1),[n,r]=(0,d.useState)(!1);return(0,f.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`16px`,maxWidth:`400px`},children:[(0,f.jsx)(a,{label:`Label at end (default)`,value:e,onChange:t,labelPosition:`end`}),(0,f.jsx)(a,{label:`Label at start`,value:n,onChange:r,labelPosition:`start`})]})}},k={render:()=>{let[e,t]=(0,d.useState)(!1),[n,r]=(0,d.useState)(!0),[i,o]=(0,d.useState)(!1);return(0,f.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`16px`,width:`350px`,border:`1px solid #e0e0e0`,borderRadius:`8px`,padding:`16px`},children:[(0,f.jsx)(a,{label:`Enable notifications`,value:e,onChange:t,labelPosition:`start`,labelSpacing:`spread`,labelIcon:l}),(0,f.jsx)(a,{label:`Dark mode`,value:n,onChange:r,labelPosition:`start`,labelSpacing:`spread`,labelIcon:s}),(0,f.jsx)(a,{label:`Auto-save`,value:i,onChange:o,labelPosition:`start`,labelSpacing:`spread`,labelIcon:c,labelTooltip:`Save changes automatically as you work`})]})}},A={render:e=>{let[t,n]=(0,d.useState)(e.value??!1),{value:r,onChange:i,...o}=e;return(0,f.jsx)(a,{...o,value:t,onChange:e=>n(e)})},args:{label:`Accept terms and conditions`,isRequired:!0,status:{type:`error`,message:`You must accept the terms to continue`}}},j={render:e=>{let[t,n]=(0,d.useState)(e.value??!0),{value:r,onChange:i,...o}=e;return(0,f.jsx)(a,{...o,value:t,onChange:e=>n(e)})},args:{label:`Share usage data`,description:`Help us improve by sharing anonymous usage statistics`,status:{type:`warning`,message:`This data may be shared with partners`}}},M={render:e=>{let[t,n]=(0,d.useState)(e.value??!0),{value:r,onChange:i,...o}=e;return(0,f.jsx)(a,{...o,value:t,onChange:e=>n(e)})},args:{label:`Two-factor authentication`,labelIcon:o,status:{type:`success`,message:`Your account is now more secure`}}},N={render:()=>{let[e,t]=(0,d.useState)(!1),[n,r]=(0,d.useState)(!0),[i,s]=(0,d.useState)(!0);return(0,f.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`24px`,maxWidth:`400px`},children:[(0,f.jsx)(a,{label:`Accept terms and conditions`,value:e,onChange:t,isRequired:!0,status:{type:`error`,message:`You must accept the terms to continue`}}),(0,f.jsx)(a,{label:`Share usage data`,description:`Help us improve by sharing anonymous usage statistics`,value:n,onChange:r,status:{type:`warning`,message:`This data may be shared with partners`}}),(0,f.jsx)(a,{label:`Two-factor authentication`,value:i,onChange:s,labelIcon:o,status:{type:`success`,message:`Your account is now more secure`}})]})}},P={render:e=>{let[t,n]=(0,d.useState)(e.value??!1),{value:r,onChange:i,...o}=e;return(0,f.jsx)(a,{...o,value:t,onChange:e=>n(e)})},args:{label:`Enable notifications`,isDisabled:!0,disabledMessage:`Notifications are turned off org-wide`}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
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
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
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
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
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
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
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
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
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
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
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
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
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
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
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
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
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
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
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
}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
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
}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
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
}`,...T.parameters?.docs?.source}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
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
}`,...E.parameters?.docs?.source}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
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
}`,...D.parameters?.docs?.source}}},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
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
}`,...O.parameters?.docs?.source}}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
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
}`,...k.parameters?.docs?.source}}},A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
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
}`,...A.parameters?.docs?.source}}},j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
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
}`,...j.parameters?.docs?.source}}},M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
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
}`,...M.parameters?.docs?.source}}},N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
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
}`,...N.parameters?.docs?.source}}},P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
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
    isDisabled: true,
    disabledMessage: 'Notifications are turned off org-wide'
  }
}`,...P.parameters?.docs?.source}}},F=[`Default`,`On`,`WithDescription`,`WithHiddenLabel`,`Disabled`,`DisabledOn`,`Required`,`Optional`,`WithLabelIcon`,`WithLabelTooltip`,`LabelPositionStart`,`LabelSpacingSpread`,`AllVariations`,`LabelIconVariations`,`LabelPositionComparison`,`SpreadSpacingExample`,`WithErrorStatus`,`WithWarningStatus`,`WithSuccessStatus`,`StatusVariations`,`DisabledWithMessage`]}))();export{E as AllVariations,m as Default,v as Disabled,y as DisabledOn,P as DisabledWithMessage,D as LabelIconVariations,O as LabelPositionComparison,w as LabelPositionStart,T as LabelSpacingSpread,h as On,x as Optional,b as Required,k as SpreadSpacingExample,N as StatusVariations,g as WithDescription,A as WithErrorStatus,_ as WithHiddenLabel,S as WithLabelIcon,C as WithLabelTooltip,M as WithSuccessStatus,j as WithWarningStatus,F as __namedExportsOrder,p as default};