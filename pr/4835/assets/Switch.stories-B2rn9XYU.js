import{a as e,n as t}from"./rolldown-runtime-DkW27tQK.js";import{t as n}from"./react-BZJXY1be.js";import{t as r}from"./jsx-runtime-DeHZSEgm.js";import{n as i,t as a}from"./Switch-Bd0bzgyN.js";import{n as o,t as s}from"./BellIcon-Bd5nOtNP.js";import{n as c,t as l}from"./ShieldCheckIcon-CbhrdRm2.js";function u({title:e,titleId:t,...n},r){return d.createElement(`svg`,Object.assign({xmlns:`http://www.w3.org/2000/svg`,fill:`none`,viewBox:`0 0 24 24`,strokeWidth:1.5,stroke:`currentColor`,"aria-hidden":`true`,"data-slot":`icon`,ref:r,"aria-labelledby":t},n),e?d.createElement(`title`,{id:t},e):null,d.createElement(`path`,{strokeLinecap:`round`,strokeLinejoin:`round`,d:`M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.233-2.33 3 3 0 0 1 3.758 3.848A3.752 3.752 0 0 1 18 19.5H6.75Z`}))}var d,f;function p(){return(p=t((()=>{d=e(n()),f=d.forwardRef(u)})))()}function m({title:e,titleId:t,...n},r){return h.createElement(`svg`,Object.assign({xmlns:`http://www.w3.org/2000/svg`,fill:`none`,viewBox:`0 0 24 24`,strokeWidth:1.5,stroke:`currentColor`,"aria-hidden":`true`,"data-slot":`icon`,ref:r,"aria-labelledby":t},n),e?h.createElement(`title`,{id:t},e):null,h.createElement(`path`,{strokeLinecap:`round`,strokeLinejoin:`round`,d:`M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z`}))}var h,g;function _(){return(_=t((()=>{h=e(n()),g=h.forwardRef(m)})))()}var v,y,b,x,S,C,w,T,E,D,O,k,A,j,M,N,P,F,I,L,R,z,B,V,H;function U(){return(U=t((()=>{v=n(),i(),o(),_(),c(),p(),y=r(),b={title:`Core/Switch`,component:a,tags:[`autodocs`],argTypes:{label:{control:`text`,description:`Label text (required)`},isLabelHidden:{control:`boolean`,description:`Visually hide the label (still accessible to screen readers)`},description:{control:`text`,description:`Description text displayed below the label`},value:{control:`boolean`,description:`Whether the switch is on or off`},isDisabled:{control:`boolean`,description:`Whether the switch is disabled`},disabledMessage:{control:`text`,description:`Explains why the switch is disabled. With isDisabled, shows a tooltip on hover/keyboard focus and keeps the switch focusable via aria-disabled (toggling stays blocked). Use this instead of wrapping a disabled Switch in Tooltip.`},isOptional:{control:`boolean`,description:`Whether the field is optional`},isRequired:{control:`boolean`,description:`Whether the switch is required`},labelPosition:{control:`select`,options:[`start`,`end`],description:`Which side of the switch the label appears on`},labelSpacing:{control:`select`,options:[`hug`,`spread`],description:`Spacing behavior between label and switch`}}},x={render:e=>{let[t,n]=(0,v.useState)(e.value??!1),{value:r,onChange:i,...o}=e;return(0,y.jsx)(a,{...o,value:t,onChange:e=>n(e)})},args:{label:`Enable notifications`}},S={render:e=>{let[t,n]=(0,v.useState)(e.value??!0),{value:r,onChange:i,...o}=e;return(0,y.jsx)(a,{...o,value:t,onChange:e=>n(e)})},args:{label:`Notifications enabled`,value:!0}},C={render:e=>{let[t,n]=(0,v.useState)(e.value??!1),{value:r,onChange:i,...o}=e;return(0,y.jsx)(a,{...o,value:t,onChange:e=>n(e)})},args:{label:`Dark mode`,description:`Switch to a darker color scheme for reduced eye strain.`}},w={render:e=>{let[t,n]=(0,v.useState)(e.value??!1),{value:r,onChange:i,...o}=e;return(0,y.jsx)(a,{...o,value:t,onChange:e=>n(e)})},args:{label:`Toggle row`,isLabelHidden:!0}},T={render:e=>{let[t,n]=(0,v.useState)(e.value??!1),{value:r,onChange:i,...o}=e;return(0,y.jsx)(a,{...o,value:t,onChange:e=>n(e)})},args:{label:`Premium feature`,description:`Upgrade to enable this option`,isDisabled:!0}},E={render:e=>{let[t,n]=(0,v.useState)(e.value??!0),{value:r,onChange:i,...o}=e;return(0,y.jsx)(a,{...o,value:t,onChange:e=>n(e)})},args:{label:`Feature enabled`,value:!0,isDisabled:!0}},D={render:e=>{let[t,n]=(0,v.useState)(e.value??!1),{value:r,onChange:i,...o}=e;return(0,y.jsx)(a,{...o,value:t,onChange:e=>n(e)})},args:{label:`Accept terms and conditions`,isRequired:!0}},O={render:e=>{let[t,n]=(0,v.useState)(e.value??!1),{value:r,onChange:i,...o}=e;return(0,y.jsx)(a,{...o,value:t,onChange:e=>n(e)})},args:{label:`Subscribe to newsletter`,isOptional:!0}},k={render:e=>{let[t,n]=(0,v.useState)(e.value??!1),{value:r,onChange:i,...o}=e;return(0,y.jsx)(a,{...o,value:t,onChange:e=>n(e)})},args:{label:`Enable notifications`,description:`Receive alerts when important events occur`,labelIcon:s}},A={render:e=>{let[t,n]=(0,v.useState)(e.value??!1),{value:r,onChange:i,...o}=e;return(0,y.jsx)(a,{...o,value:t,onChange:e=>n(e)})},args:{label:`Auto-save`,labelTooltip:`Automatically save your changes as you work`,labelIcon:f}},j={render:e=>{let[t,n]=(0,v.useState)(e.value??!1),{value:r,onChange:i,...o}=e;return(0,y.jsx)(a,{...o,value:t,onChange:e=>n(e)})},args:{label:`Enable dark mode`,labelPosition:`start`,labelIcon:g}},M={render:e=>{let[t,n]=(0,v.useState)(e.value??!1),{value:r,onChange:i,...o}=e;return(0,y.jsx)(`div`,{style:{width:300,border:`1px solid #ccc`,padding:16},children:(0,y.jsx)(a,{...o,value:t,onChange:e=>n(e)})})},args:{label:`Enable notifications`,labelPosition:`start`,labelSpacing:`spread`}},N={render:()=>{let[e,t]=(0,v.useState)(!1),[n,r]=(0,v.useState)(!0),[i,o]=(0,v.useState)(!1),[s,c]=(0,v.useState)(!0),[l,u]=(0,v.useState)(!1);return(0,y.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`16px`,maxWidth:`400px`},children:[(0,y.jsx)(a,{label:`Off state`,value:e,onChange:t}),(0,y.jsx)(a,{label:`On state`,value:n,onChange:r}),(0,y.jsx)(a,{label:`Disabled off`,value:i,onChange:o,isDisabled:!0}),(0,y.jsx)(a,{label:`Disabled on`,value:s,onChange:c,isDisabled:!0}),(0,y.jsx)(a,{label:`With description`,description:`Additional context for this setting`,value:l,onChange:u})]})}},P={render:()=>{let[e,t]=(0,v.useState)(!1),[n,r]=(0,v.useState)(!0),[i,o]=(0,v.useState)(!1);return(0,y.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`16px`,maxWidth:`400px`},children:[(0,y.jsx)(a,{label:`Notifications`,description:`Receive push notifications`,value:e,onChange:t,labelIcon:s}),(0,y.jsx)(a,{label:`Dark mode`,description:`Use dark color scheme`,value:n,onChange:r,labelIcon:g}),(0,y.jsx)(a,{label:`Two-factor authentication`,description:`Add an extra layer of security`,value:i,onChange:o,labelIcon:l,isDisabled:!0})]})}},F={render:()=>{let[e,t]=(0,v.useState)(!1),[n,r]=(0,v.useState)(!1);return(0,y.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`16px`,maxWidth:`400px`},children:[(0,y.jsx)(a,{label:`Label at end (default)`,value:e,onChange:t,labelPosition:`end`}),(0,y.jsx)(a,{label:`Label at start`,value:n,onChange:r,labelPosition:`start`})]})}},I={render:()=>{let[e,t]=(0,v.useState)(!1),[n,r]=(0,v.useState)(!0),[i,o]=(0,v.useState)(!1);return(0,y.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`16px`,width:`350px`,border:`1px solid #e0e0e0`,borderRadius:`8px`,padding:`16px`},children:[(0,y.jsx)(a,{label:`Enable notifications`,value:e,onChange:t,labelPosition:`start`,labelSpacing:`spread`,labelIcon:s}),(0,y.jsx)(a,{label:`Dark mode`,value:n,onChange:r,labelPosition:`start`,labelSpacing:`spread`,labelIcon:g}),(0,y.jsx)(a,{label:`Auto-save`,value:i,onChange:o,labelPosition:`start`,labelSpacing:`spread`,labelIcon:f,labelTooltip:`Save changes automatically as you work`})]})}},L={render:e=>{let[t,n]=(0,v.useState)(e.value??!1),{value:r,onChange:i,...o}=e;return(0,y.jsx)(a,{...o,value:t,onChange:e=>n(e)})},args:{label:`Accept terms and conditions`,isRequired:!0,status:{type:`error`,message:`You must accept the terms to continue`}}},R={render:e=>{let[t,n]=(0,v.useState)(e.value??!0),{value:r,onChange:i,...o}=e;return(0,y.jsx)(a,{...o,value:t,onChange:e=>n(e)})},args:{label:`Share usage data`,description:`Help us improve by sharing anonymous usage statistics`,status:{type:`warning`,message:`This data may be shared with partners`}}},z={render:e=>{let[t,n]=(0,v.useState)(e.value??!0),{value:r,onChange:i,...o}=e;return(0,y.jsx)(a,{...o,value:t,onChange:e=>n(e)})},args:{label:`Two-factor authentication`,labelIcon:l,status:{type:`success`,message:`Your account is now more secure`}}},B={render:()=>{let[e,t]=(0,v.useState)(!1),[n,r]=(0,v.useState)(!0),[i,o]=(0,v.useState)(!0);return(0,y.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`24px`,maxWidth:`400px`},children:[(0,y.jsx)(a,{label:`Accept terms and conditions`,value:e,onChange:t,isRequired:!0,status:{type:`error`,message:`You must accept the terms to continue`}}),(0,y.jsx)(a,{label:`Share usage data`,description:`Help us improve by sharing anonymous usage statistics`,value:n,onChange:r,status:{type:`warning`,message:`This data may be shared with partners`}}),(0,y.jsx)(a,{label:`Two-factor authentication`,value:i,onChange:o,labelIcon:l,status:{type:`success`,message:`Your account is now more secure`}})]})}},V={render:e=>{let[t,n]=(0,v.useState)(e.value??!1),{value:r,onChange:i,...o}=e;return(0,y.jsx)(a,{...o,value:t,onChange:e=>n(e)})},args:{label:`Enable notifications`,isDisabled:!0,disabledMessage:`Notifications are turned off org-wide`}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
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
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
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
    label: 'Dark mode',
    description: 'Switch to a darker color scheme for reduced eye strain.'
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
    label: 'Toggle row',
    isLabelHidden: true
  }
}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
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
}`,...T.parameters?.docs?.source}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
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
}`,...E.parameters?.docs?.source}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
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
}`,...D.parameters?.docs?.source}}},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
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
}`,...O.parameters?.docs?.source}}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
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
    label: 'Auto-save',
    labelTooltip: 'Automatically save your changes as you work',
    labelIcon: CloudArrowUpIcon
  }
}`,...A.parameters?.docs?.source}}},j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
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
}`,...j.parameters?.docs?.source}}},M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
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
}`,...M.parameters?.docs?.source}}},N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
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
}`,...N.parameters?.docs?.source}}},P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
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
}`,...P.parameters?.docs?.source}}},F.parameters={...F.parameters,docs:{...F.parameters?.docs,source:{originalSource:`{
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
}`,...F.parameters?.docs?.source}}},I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{
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
}`,...I.parameters?.docs?.source}}},L.parameters={...L.parameters,docs:{...L.parameters?.docs,source:{originalSource:`{
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
}`,...L.parameters?.docs?.source}}},R.parameters={...R.parameters,docs:{...R.parameters?.docs,source:{originalSource:`{
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
}`,...R.parameters?.docs?.source}}},z.parameters={...z.parameters,docs:{...z.parameters?.docs,source:{originalSource:`{
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
}`,...z.parameters?.docs?.source}}},B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
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
}`,...B.parameters?.docs?.source}}},V.parameters={...V.parameters,docs:{...V.parameters?.docs,source:{originalSource:`{
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
}`,...V.parameters?.docs?.source}}},H=[`Default`,`On`,`WithDescription`,`WithHiddenLabel`,`Disabled`,`DisabledOn`,`Required`,`Optional`,`WithLabelIcon`,`WithLabelTooltip`,`LabelPositionStart`,`LabelSpacingSpread`,`AllVariations`,`LabelIconVariations`,`LabelPositionComparison`,`SpreadSpacingExample`,`WithErrorStatus`,`WithWarningStatus`,`WithSuccessStatus`,`StatusVariations`,`DisabledWithMessage`]})))()}U();export{N as AllVariations,x as Default,T as Disabled,E as DisabledOn,V as DisabledWithMessage,P as LabelIconVariations,F as LabelPositionComparison,j as LabelPositionStart,M as LabelSpacingSpread,S as On,O as Optional,D as Required,I as SpreadSpacingExample,B as StatusVariations,C as WithDescription,L as WithErrorStatus,w as WithHiddenLabel,k as WithLabelIcon,A as WithLabelTooltip,z as WithSuccessStatus,R as WithWarningStatus,H as __namedExportsOrder,b as default};