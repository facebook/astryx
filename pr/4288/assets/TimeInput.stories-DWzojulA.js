import{i as e,s as t}from"./preload-helper-CT_b8DTk.js";import{t as n}from"./react-B7Te67-h.js";import{t as r}from"./jsx-runtime-DqZldVDK.js";import{n as i,t as a}from"./TimeInput-BYY3AVE2.js";var o,s,c,l,u,d,f,p,m,h,g,_,v,y,b,x,S,C,w,T,E;e((()=>{o=t(n()),a(),s=r(),c={title:`Core/TimeInput`,component:i,tags:[`autodocs`],argTypes:{label:{control:`text`,description:`Label text (required)`},isLabelHidden:{control:`boolean`,description:`Visually hide the label (still accessible to screen readers)`},placeholder:{control:`text`,description:`Placeholder text`},description:{control:`text`,description:`Description text displayed between the label and input`},isOptional:{control:`boolean`,description:`Whether the field is optional (mutually exclusive with isRequired)`},isRequired:{control:`boolean`,description:`Whether the field is required (mutually exclusive with isOptional)`},isDisabled:{control:`boolean`,description:`Whether the input is disabled`},disabledMessage:{control:`text`,description:`Explains why the input is disabled. With isDisabled, shows a tooltip on hover/keyboard focus and keeps the field focusable via aria-disabled (activation stays blocked). Use this instead of wrapping a disabled TimeInput in Tooltip.`},size:{control:`radio`,options:[`sm`,`md`,`lg`],description:`Size of the input`},hourFormat:{control:`radio`,options:[`12h`,`24h`],description:`Hour format for display`},hasSeconds:{control:`boolean`,description:`Whether to include seconds in the time`},hasClear:{control:`boolean`,description:`Whether to show a clear button`},increment:{control:`number`,description:`Minutes to increment/decrement with arrow keys`}}},l={render:e=>{let[t,n]=(0,o.useState)(void 0);return(0,s.jsx)(i,{...e,value:t,onChange:n})},args:{label:`Time`,placeholder:`Select a time`}},u={render:e=>{let[t,n]=(0,o.useState)(`14:30`);return(0,s.jsx)(i,{...e,value:t,onChange:n})},args:{label:`Meeting time`}},d={render:e=>{let[t,n]=(0,o.useState)(`14:30`);return(0,s.jsx)(i,{...e,value:t,onChange:n})},args:{label:`Time (24h)`,hourFormat:`24h`}},f={render:e=>{let[t,n]=(0,o.useState)(`14:30:45`);return(0,s.jsx)(i,{...e,value:t,onChange:n})},args:{label:`Precise time`,hasSeconds:!0}},p={render:e=>{let[t,n]=(0,o.useState)(`09:00`);return(0,s.jsx)(i,{...e,value:t,onChange:n})},args:{label:`Start time`,hasClear:!0}},m={render:e=>{let[t,n]=(0,o.useState)(void 0);return(0,s.jsx)(i,{...e,value:t,onChange:n})},args:{label:`Alarm time`,description:`When should we wake you up?`,placeholder:`Set alarm time`}},h={render:e=>{let[t,n]=(0,o.useState)(void 0);return(0,s.jsx)(i,{...e,value:t,onChange:n})},args:{label:`Appointment time`,min:`09:00`,max:`17:00`,description:`Business hours: 9 AM - 5 PM`,placeholder:`Select appointment time`}},g={render:e=>{let[t,n]=(0,o.useState)(`09:00`);return(0,s.jsx)(i,{...e,value:t,onChange:n})},args:{label:`Time slot`,increment:15,description:`Use arrow keys to change by 15 minutes`}},_={render:e=>{let[t,n]=(0,o.useState)(void 0);return(0,s.jsx)(i,{...e,value:t,onChange:n})},args:{label:`Preferred time`,isOptional:!0,placeholder:`Select a time (optional)`}},v={render:e=>{let[t,n]=(0,o.useState)(void 0);return(0,s.jsx)(i,{...e,value:t,onChange:n})},args:{label:`Start time`,isRequired:!0,placeholder:`Select a start time`}},y={render:e=>{let[t,n]=(0,o.useState)(`10:00`);return(0,s.jsx)(i,{...e,value:t,onChange:n})},args:{label:`Locked time`,isDisabled:!0}},b={render:e=>{let[t,n]=(0,o.useState)(void 0);return(0,s.jsx)(i,{...e,value:t,onChange:n})},args:{label:`Start time`,isDisabled:!0,disabledMessage:`You need the Editor role to change this`}},x={render:e=>{let[t,n]=(0,o.useState)(void 0);return(0,s.jsx)(i,{...e,value:t,onChange:n})},args:{label:`Time`,size:`sm`,placeholder:`Select a time`}},S={render:e=>{let[t,n]=(0,o.useState)(`22:00`);return(0,s.jsx)(i,{...e,value:t,onChange:n})},args:{label:`Event time`,status:{type:`error`,message:`Time must be during business hours`}}},C={render:e=>{let[t,n]=(0,o.useState)(`07:00`);return(0,s.jsx)(i,{...e,value:t,onChange:n})},args:{label:`Meeting time`,status:{type:`warning`,message:`Early morning meeting - are you sure?`}}},w={render:e=>{let[t,n]=(0,o.useState)(`10:00`);return(0,s.jsx)(i,{...e,value:t,onChange:n})},args:{label:`Scheduled time`,status:{type:`success`,message:`Time slot is available`}}},T={render:()=>{let[e,t]=(0,o.useState)(void 0),[n,r]=(0,o.useState)(`14:30`),[a,c]=(0,o.useState)(`09:15:30`),[l,u]=(0,o.useState)(void 0),[d,f]=(0,o.useState)(void 0),[p,m]=(0,o.useState)(`10:00`),[h,g]=(0,o.useState)(`22:00`);return(0,s.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`16px`,maxWidth:`300px`},children:[(0,s.jsx)(i,{label:`Default (12h)`,value:e,onChange:t,placeholder:`Select a time`}),(0,s.jsx)(i,{label:`24-hour format`,value:n,onChange:r,hourFormat:`24h`}),(0,s.jsx)(i,{label:`With seconds`,value:a,onChange:c,hasSeconds:!0}),(0,s.jsx)(i,{label:`With clear button`,value:l,onChange:u,hasClear:!0,placeholder:`Select a time`}),(0,s.jsx)(i,{label:`With description`,description:`Pick your preferred time`,value:d,onChange:f,placeholder:`Select a time`}),(0,s.jsx)(i,{label:`Disabled`,isDisabled:!0,value:p,onChange:m}),(0,s.jsx)(i,{label:`With error`,value:h,onChange:g,status:{type:`error`,message:`Invalid time selection`}})]})}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<ISOTimeString | undefined>(undefined);
    return <TimeInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Time',
    placeholder: 'Select a time'
  }
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<ISOTimeString | undefined>('14:30' as ISOTimeString);
    return <TimeInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Meeting time'
  }
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<ISOTimeString | undefined>('14:30' as ISOTimeString);
    return <TimeInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Time (24h)',
    hourFormat: '24h'
  }
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<ISOTimeString | undefined>('14:30:45' as ISOTimeString);
    return <TimeInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Precise time',
    hasSeconds: true
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<ISOTimeString | undefined>('09:00' as ISOTimeString);
    return <TimeInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Start time',
    hasClear: true
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<ISOTimeString | undefined>(undefined);
    return <TimeInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Alarm time',
    description: 'When should we wake you up?',
    placeholder: 'Set alarm time'
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<ISOTimeString | undefined>(undefined);
    return <TimeInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Appointment time',
    min: '09:00' as ISOTimeString,
    max: '17:00' as ISOTimeString,
    description: 'Business hours: 9 AM - 5 PM',
    placeholder: 'Select appointment time'
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<ISOTimeString | undefined>('09:00' as ISOTimeString);
    return <TimeInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Time slot',
    increment: 15,
    description: 'Use arrow keys to change by 15 minutes'
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<ISOTimeString | undefined>(undefined);
    return <TimeInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Preferred time',
    isOptional: true,
    placeholder: 'Select a time (optional)'
  }
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<ISOTimeString | undefined>(undefined);
    return <TimeInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Start time',
    isRequired: true,
    placeholder: 'Select a start time'
  }
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<ISOTimeString | undefined>('10:00' as ISOTimeString);
    return <TimeInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Locked time',
    isDisabled: true
  }
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<ISOTimeString | undefined>(undefined);
    return <TimeInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Start time',
    isDisabled: true,
    disabledMessage: 'You need the Editor role to change this'
  }
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<ISOTimeString | undefined>(undefined);
    return <TimeInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Time',
    size: 'sm',
    placeholder: 'Select a time'
  }
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<ISOTimeString | undefined>('22:00' as ISOTimeString);
    return <TimeInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Event time',
    status: {
      type: 'error',
      message: 'Time must be during business hours'
    }
  }
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<ISOTimeString | undefined>('07:00' as ISOTimeString);
    return <TimeInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Meeting time',
    status: {
      type: 'warning',
      message: 'Early morning meeting - are you sure?'
    }
  }
}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<ISOTimeString | undefined>('10:00' as ISOTimeString);
    return <TimeInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Scheduled time',
    status: {
      type: 'success',
      message: 'Time slot is available'
    }
  }
}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [value1, setValue1] = useState<ISOTimeString | undefined>(undefined);
    const [value2, setValue2] = useState<ISOTimeString | undefined>('14:30' as ISOTimeString);
    const [value3, setValue3] = useState<ISOTimeString | undefined>('09:15:30' as ISOTimeString);
    const [value4, setValue4] = useState<ISOTimeString | undefined>(undefined);
    const [value5, setValue5] = useState<ISOTimeString | undefined>(undefined);
    const [value6, setValue6] = useState<ISOTimeString | undefined>('10:00' as ISOTimeString);
    const [value7, setValue7] = useState<ISOTimeString | undefined>('22:00' as ISOTimeString);
    return <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      maxWidth: '300px'
    }}>
        <TimeInput label="Default (12h)" value={value1} onChange={setValue1} placeholder="Select a time" />
        <TimeInput label="24-hour format" value={value2} onChange={setValue2} hourFormat="24h" />
        <TimeInput label="With seconds" value={value3} onChange={setValue3} hasSeconds />
        <TimeInput label="With clear button" value={value4} onChange={setValue4} hasClear placeholder="Select a time" />
        <TimeInput label="With description" description="Pick your preferred time" value={value5} onChange={setValue5} placeholder="Select a time" />
        <TimeInput label="Disabled" isDisabled value={value6} onChange={setValue6} />
        <TimeInput label="With error" value={value7} onChange={setValue7} status={{
        type: 'error',
        message: 'Invalid time selection'
      }} />
      </div>;
  }
}`,...T.parameters?.docs?.source}}},E=[`Default`,`WithValue`,`TwentyFourHourFormat`,`WithSeconds`,`WithClearButton`,`WithDescription`,`WithMinMax`,`WithIncrement`,`Optional`,`Required`,`Disabled`,`DisabledWithMessage`,`SmallSize`,`WithErrorStatus`,`WithWarningStatus`,`WithSuccessStatus`,`AllVariations`]}))();export{T as AllVariations,l as Default,y as Disabled,b as DisabledWithMessage,_ as Optional,v as Required,x as SmallSize,d as TwentyFourHourFormat,p as WithClearButton,m as WithDescription,S as WithErrorStatus,g as WithIncrement,h as WithMinMax,f as WithSeconds,w as WithSuccessStatus,u as WithValue,C as WithWarningStatus,E as __namedExportsOrder,c as default};