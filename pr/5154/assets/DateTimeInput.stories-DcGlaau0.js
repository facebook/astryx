import{i as e,s as t}from"./preload-helper-CT_b8DTk.js";import{t as n}from"./react-B7Te67-h.js";import{t as r}from"./jsx-runtime-DqZldVDK.js";import{s as i}from"./useTheme-DgOMM02L.js";import{t as a,x as o}from"./theme-CzI76tm0.js";import{Fn as s,Pn as c}from"./iframe-1DZCYtus.js";var l,u,d,f,p,m,h,g,_,v,y,b,x,S,C,w,T,E,D,O,k,A,j,M;e((()=>{l=t(n()),c(),a(),u=r(),d={title:`Core/DateTimeInput`,component:s,tags:[`autodocs`],argTypes:{label:{control:`text`,description:`Label text (required)`},isLabelHidden:{control:`boolean`,description:`Visually hide the label (still accessible to screen readers)`},placeholder:{control:`text`,description:`Placeholder text`},description:{control:`text`,description:`Description text displayed between the label and input`},isOptional:{control:`boolean`,description:`Whether the field is optional (mutually exclusive with isRequired)`},isRequired:{control:`boolean`,description:`Whether the field is required (mutually exclusive with isOptional)`},isDisabled:{control:`boolean`,description:`Whether the input is disabled`},disabledMessage:{control:`text`,description:`Explains why the input is disabled. With isDisabled, shows a tooltip on hover/keyboard focus and keeps the field focusable via aria-disabled (activation stays blocked). Use this instead of wrapping a disabled DateTimeInput in Tooltip.`},size:{control:`radio`,options:[`sm`,`md`,`lg`]},hourFormat:{control:`radio`,options:[`12h`,`24h`],description:`Hour format for display`},hasSeconds:{control:`boolean`,description:`Whether to include seconds in the time`},hasClear:{control:`boolean`,description:`Whether to show a clear button`},numberOfMonths:{control:`radio`,options:[1,2],description:`Number of months to display in calendar`},timeIncrement:{control:`number`,description:`Minutes to increment/decrement with arrow keys`}}},f={render:e=>{let[t,n]=(0,l.useState)(void 0);return(0,u.jsx)(s,{...e,value:t,onChange:n})},args:{label:`Meeting time`,placeholder:`Select a date`}},p={render:e=>{let[t,n]=(0,l.useState)(`2026-03-15T14:30`);return(0,u.jsx)(s,{...e,value:t,onChange:n})},args:{label:`Event time`}},m={render:e=>{let[t,n]=(0,l.useState)(`2026-03-15T14:30`);return(0,u.jsx)(s,{...e,value:t,onChange:n})},args:{label:`Appointment`,hourFormat:`24h`}},h={render:e=>{let[t,n]=(0,l.useState)(`2026-03-15T14:30:45`);return(0,u.jsx)(s,{...e,value:t,onChange:n})},args:{label:`Log timestamp`,hasSeconds:!0}},g={render:e=>{let[t,n]=(0,l.useState)(void 0);return(0,u.jsx)(s,{...e,value:t,onChange:n})},args:{label:`Deadline`,description:`When is this task due?`,placeholder:`Select deadline`}},_={render:e=>{let[t,n]=(0,l.useState)(`2026-03-15T09:00`);return(0,u.jsx)(s,{...e,value:t,onChange:n})},args:{label:`Start time`,hasClear:!0}},v={render:e=>{let[t,n]=(0,l.useState)(void 0);return(0,u.jsx)(s,{...e,value:t,onChange:n})},args:{label:`Appointment`,min:`2026-03-15T09:00`,max:`2026-03-15T17:00`,description:`Available: Mar 15, 9 AM - 5 PM`}},y={render:e=>{let[t,n]=(0,l.useState)(`2026-03-15T09:00`);return(0,u.jsx)(s,{...e,value:t,onChange:n})},args:{label:`Time slot`,timeIncrement:15,description:`Use arrow keys to change by 15 minutes`}},b={render:e=>{let[t,n]=(0,l.useState)(void 0);return(0,u.jsx)(s,{...e,value:t,onChange:n})},args:{label:`Preferred time`,isOptional:!0,placeholder:`Select a date (optional)`}},x={render:e=>{let[t,n]=(0,l.useState)(void 0);return(0,u.jsx)(s,{...e,value:t,onChange:n})},args:{label:`Start time`,isRequired:!0}},S={render:e=>{let[t,n]=(0,l.useState)(`2026-03-15T10:00`);return(0,u.jsx)(s,{...e,value:t,onChange:n})},args:{label:`Locked time`,isDisabled:!0}},C={render:e=>{let[t,n]=(0,l.useState)(void 0);return(0,u.jsx)(s,{...e,value:t,onChange:n})},args:{label:`Meeting time`,isDisabled:!0,disabledMessage:`You need the Editor role to change this`}},w={render:()=>{let[e,t]=(0,l.useState)(void 0),[n,r]=(0,l.useState)(void 0),[i,a]=(0,l.useState)(void 0);return(0,u.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`16px`,maxWidth:`460px`},children:[(0,u.jsx)(s,{label:`Small (28px)`,value:e,onChange:t,placeholder:`Small size`,size:`sm`}),(0,u.jsx)(s,{label:`Medium (32px)`,value:n,onChange:r,placeholder:`Medium size (default)`,size:`md`}),(0,u.jsx)(s,{label:`Large (36px)`,value:i,onChange:a,placeholder:`Large size`,size:`lg`})]})}},T={render:e=>{let[t,n]=(0,l.useState)(void 0);return(0,u.jsx)(s,{...e,value:t,onChange:n})},args:{label:`Travel departure`,numberOfMonths:2}},E={render:e=>{let[t,n]=(0,l.useState)(`2026-03-15T14:30`);return(0,u.jsx)(s,{...e,value:t,onChange:n})},args:{label:`Event time`,status:{type:`error`,message:`This time slot is not available`}}},D={render:e=>{let[t,n]=(0,l.useState)(`2026-03-15T07:00`);return(0,u.jsx)(s,{...e,value:t,onChange:n})},args:{label:`Meeting time`,status:{type:`warning`,message:`Early morning meeting - are you sure?`}}},O={render:e=>{let[t,n]=(0,l.useState)(`2026-03-15T10:00`);return(0,u.jsx)(s,{...e,value:t,onChange:n})},args:{label:`Scheduled time`,status:{type:`success`,message:`Time slot is available`}}},k={render:()=>{let[e,t]=(0,l.useState)(void 0),[n,r]=(0,l.useState)(`2026-03-15T14:30`),[i,a]=(0,l.useState)(`2026-03-15T14:30`),[o,c]=(0,l.useState)(void 0),[d,f]=(0,l.useState)(`2026-03-15T10:00`),[p,m]=(0,l.useState)(`2026-03-15T22:00`);return(0,u.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`16px`,maxWidth:`460px`},children:[(0,u.jsx)(s,{label:`Default`,value:e,onChange:t,placeholder:`Select a date`}),(0,u.jsx)(s,{label:`With value (12h)`,value:n,onChange:r}),(0,u.jsx)(s,{label:`24-hour format`,value:i,onChange:a,hourFormat:`24h`}),(0,u.jsx)(s,{label:`With description`,description:`Pick your preferred datetime`,value:o,onChange:c}),(0,u.jsx)(s,{label:`Disabled`,isDisabled:!0,value:d,onChange:f}),(0,u.jsx)(s,{label:`With error`,value:p,onChange:m,status:{type:`error`,message:`Invalid datetime selection`}})]})}},A=i({name:`date-time-input-segments-demo`,components:{"date-time-input-date-segment":{base:{borderColor:`var(--color-accent)`}},"date-time-input-time-segment":{base:{backgroundColor:`var(--color-background-muted)`}}}}),j={render:()=>{let[e,t]=(0,l.useState)();return(0,u.jsx)(o,{theme:A,mode:`light`,children:(0,u.jsx)(s,{label:`Themed segments`,description:`Date segment gets an accent border; time segment a muted fill.`,value:e,onChange:t})})}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<ISODateTimeString | undefined>(undefined);
    return <DateTimeInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Meeting time',
    placeholder: 'Select a date'
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<ISODateTimeString | undefined>('2026-03-15T14:30' as ISODateTimeString);
    return <DateTimeInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Event time'
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<ISODateTimeString | undefined>('2026-03-15T14:30' as ISODateTimeString);
    return <DateTimeInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Appointment',
    hourFormat: '24h'
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<ISODateTimeString | undefined>('2026-03-15T14:30:45' as ISODateTimeString);
    return <DateTimeInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Log timestamp',
    hasSeconds: true
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<ISODateTimeString | undefined>(undefined);
    return <DateTimeInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Deadline',
    description: 'When is this task due?',
    placeholder: 'Select deadline'
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<ISODateTimeString | undefined>('2026-03-15T09:00' as ISODateTimeString);
    return <DateTimeInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Start time',
    hasClear: true
  }
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<ISODateTimeString | undefined>(undefined);
    return <DateTimeInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Appointment',
    min: '2026-03-15T09:00' as ISODateTimeString,
    max: '2026-03-15T17:00' as ISODateTimeString,
    description: 'Available: Mar 15, 9 AM - 5 PM'
  }
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<ISODateTimeString | undefined>('2026-03-15T09:00' as ISODateTimeString);
    return <DateTimeInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Time slot',
    timeIncrement: 15,
    description: 'Use arrow keys to change by 15 minutes'
  }
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<ISODateTimeString | undefined>(undefined);
    return <DateTimeInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Preferred time',
    isOptional: true,
    placeholder: 'Select a date (optional)'
  }
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<ISODateTimeString | undefined>(undefined);
    return <DateTimeInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Start time',
    isRequired: true
  }
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<ISODateTimeString | undefined>('2026-03-15T10:00' as ISODateTimeString);
    return <DateTimeInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Locked time',
    isDisabled: true
  }
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<ISODateTimeString | undefined>(undefined);
    return <DateTimeInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Meeting time',
    isDisabled: true,
    disabledMessage: 'You need the Editor role to change this'
  }
}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [sm, setSm] = useState<ISODateTimeString | undefined>(undefined);
    const [md, setMd] = useState<ISODateTimeString | undefined>(undefined);
    const [lg, setLg] = useState<ISODateTimeString | undefined>(undefined);
    return <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      maxWidth: '460px'
    }}>
        <DateTimeInput label="Small (28px)" value={sm} onChange={setSm} placeholder="Small size" size="sm" />
        <DateTimeInput label="Medium (32px)" value={md} onChange={setMd} placeholder="Medium size (default)" size="md" />
        <DateTimeInput label="Large (36px)" value={lg} onChange={setLg} placeholder="Large size" size="lg" />
      </div>;
  }
}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<ISODateTimeString | undefined>(undefined);
    return <DateTimeInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Travel departure',
    numberOfMonths: 2
  }
}`,...T.parameters?.docs?.source}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<ISODateTimeString | undefined>('2026-03-15T14:30' as ISODateTimeString);
    return <DateTimeInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Event time',
    status: {
      type: 'error',
      message: 'This time slot is not available'
    }
  }
}`,...E.parameters?.docs?.source}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<ISODateTimeString | undefined>('2026-03-15T07:00' as ISODateTimeString);
    return <DateTimeInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Meeting time',
    status: {
      type: 'warning',
      message: 'Early morning meeting - are you sure?'
    }
  }
}`,...D.parameters?.docs?.source}}},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<ISODateTimeString | undefined>('2026-03-15T10:00' as ISODateTimeString);
    return <DateTimeInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Scheduled time',
    status: {
      type: 'success',
      message: 'Time slot is available'
    }
  }
}`,...O.parameters?.docs?.source}}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [value1, setValue1] = useState<ISODateTimeString | undefined>(undefined);
    const [value2, setValue2] = useState<ISODateTimeString | undefined>('2026-03-15T14:30' as ISODateTimeString);
    const [value3, setValue3] = useState<ISODateTimeString | undefined>('2026-03-15T14:30' as ISODateTimeString);
    const [value4, setValue4] = useState<ISODateTimeString | undefined>(undefined);
    const [value5, setValue5] = useState<ISODateTimeString | undefined>('2026-03-15T10:00' as ISODateTimeString);
    const [value6, setValue6] = useState<ISODateTimeString | undefined>('2026-03-15T22:00' as ISODateTimeString);
    return <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      maxWidth: '460px'
    }}>
        <DateTimeInput label="Default" value={value1} onChange={setValue1} placeholder="Select a date" />
        <DateTimeInput label="With value (12h)" value={value2} onChange={setValue2} />
        <DateTimeInput label="24-hour format" value={value3} onChange={setValue3} hourFormat="24h" />
        <DateTimeInput label="With description" description="Pick your preferred datetime" value={value4} onChange={setValue4} />
        <DateTimeInput label="Disabled" isDisabled value={value5} onChange={setValue5} />
        <DateTimeInput label="With error" value={value6} onChange={setValue6} status={{
        type: 'error',
        message: 'Invalid datetime selection'
      }} />
      </div>;
  }
}`,...k.parameters?.docs?.source}}},j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = useState<ISODateTimeString | undefined>();
    return <Theme theme={segmentTheme} mode="light">
        <DateTimeInput label="Themed segments" description="Date segment gets an accent border; time segment a muted fill." value={value} onChange={setValue} />
      </Theme>;
  }
}`,...j.parameters?.docs?.source}}},M=[`Default`,`WithValue`,`TwentyFourHourFormat`,`WithSeconds`,`WithDescription`,`WithClearButton`,`WithMinMax`,`WithTimeIncrement`,`Optional`,`Required`,`Disabled`,`DisabledWithMessage`,`SizeVariants`,`TwoMonthCalendar`,`WithErrorStatus`,`WithWarningStatus`,`WithSuccessStatus`,`AllVariations`,`ThemedSegments`]}))();export{k as AllVariations,f as Default,S as Disabled,C as DisabledWithMessage,b as Optional,x as Required,w as SizeVariants,j as ThemedSegments,m as TwentyFourHourFormat,T as TwoMonthCalendar,_ as WithClearButton,g as WithDescription,E as WithErrorStatus,v as WithMinMax,h as WithSeconds,O as WithSuccessStatus,y as WithTimeIncrement,p as WithValue,D as WithWarningStatus,M as __namedExportsOrder,d as default};