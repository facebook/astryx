import{i as e,s as t}from"./preload-helper-CT_b8DTk.js";import{t as n}from"./react-B7Te67-h.js";import{r,t as i}from"./LayoutContent-G6MgZBaq.js";import{t as a}from"./jsx-runtime-DqZldVDK.js";import{t as o}from"./Layout-C9f9EBYx.js";import{n as s,t as c}from"./DateInput-DYwmoO5K.js";var l,u,d,f,p,m,h,g,_,v,y,b,x,S,C,w,T,E,D,O,k,A,j,M;e((()=>{l=t(n()),c(),o(),u=a(),d={title:`Core/DateInput`,component:s,tags:[`autodocs`],argTypes:{label:{control:`text`,description:`Label text (required)`},isLabelHidden:{control:`boolean`,description:`Visually hide the label (still accessible to screen readers)`},placeholder:{control:`text`,description:`Placeholder text`},description:{control:`text`,description:`Description text displayed between the label and input`},isOptional:{control:`boolean`,description:`Whether the field is optional (mutually exclusive with isRequired)`},isRequired:{control:`boolean`,description:`Whether the field is required (mutually exclusive with isOptional)`},isDisabled:{control:`boolean`,description:`Whether the input is disabled`},disabledMessage:{control:`text`,description:`Explains why the input is disabled. With isDisabled, shows a tooltip on hover/keyboard focus and keeps the field focusable via aria-disabled (activation stays blocked). Use this instead of wrapping a disabled DateInput in Tooltip.`},size:{control:`radio`,options:[`sm`,`md`,`lg`],description:`Size of the input`},numberOfMonths:{control:`radio`,options:[1,2],description:`Number of months to display in calendar`},format:{control:`select`,options:[`date_long`,`date`,`date_weekday`,`system_date`],description:`Display format for the committed value, reusing Timestamp's vocabulary. Defaults to 'date_long' (long-month date).`}}},f={render:e=>{let[t,n]=(0,l.useState)(void 0);return(0,u.jsx)(s,{...e,value:t,onChange:n})},args:{label:`Date`,placeholder:`Select a date`}},p={render:e=>{let[t,n]=(0,l.useState)(`2026-01-25`);return(0,u.jsx)(s,{...e,value:t,onChange:n})},args:{label:`Event date`}},m={render:()=>{let[e,t]=(0,l.useState)(`2026-03-21`);return(0,u.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:16},children:[(0,u.jsx)(s,{label:`Default (format='date_long')`,value:e,onChange:t}),(0,u.jsx)(s,{label:`format='date'`,value:e,onChange:t,format:`date`}),(0,u.jsx)(s,{label:`format='date_weekday'`,value:e,onChange:t,format:`date_weekday`}),(0,u.jsx)(s,{label:`format='system_date'`,value:e,onChange:t,format:`system_date`}),(0,u.jsx)(s,{label:`Custom function`,value:e,onChange:t,format:e=>new Intl.DateTimeFormat(`en-GB`,{dateStyle:`full`}).format(new Date(e+`T00:00`))})]})}},h={render:e=>{let[t,n]=(0,l.useState)(void 0);return(0,u.jsx)(s,{...e,value:t,onChange:n})},args:{label:`Birthday`,description:`Enter your date of birth`,placeholder:`Select your birthday`}},g={render:e=>{let[t,n]=(0,l.useState)(void 0);return(0,u.jsx)(s,{...e,value:t,onChange:n})},args:{label:`Date`,isLabelHidden:!0,placeholder:`Select a date`}},_={render:e=>{let[t,n]=(0,l.useState)(void 0);return(0,u.jsx)(s,{...e,value:t,onChange:n})},args:{label:`Preferred date`,isOptional:!0,placeholder:`Select a date (optional)`}},v={render:e=>{let[t,n]=(0,l.useState)(void 0);return(0,u.jsx)(s,{...e,value:t,onChange:n})},args:{label:`Start date`,isRequired:!0,placeholder:`Select a start date`}},y={render:e=>{let[t,n]=(0,l.useState)(`2026-01-25`);return(0,u.jsx)(s,{...e,value:t,onChange:n})},args:{label:`Locked date`,isDisabled:!0}},b={render:e=>{let[t,n]=(0,l.useState)(void 0);return(0,u.jsx)(s,{...e,value:t,onChange:n})},args:{label:`Event date`,isDisabled:!0,disabledMessage:`You need the Editor role to change this`}},x={render:e=>{let[t,n]=(0,l.useState)(void 0);return(0,u.jsx)(s,{...e,value:t,onChange:n})},args:{label:`Date`,size:`sm`,placeholder:`Select a date`}},S={render:e=>{let[t,n]=(0,l.useState)(void 0);return(0,u.jsx)(s,{...e,value:t,onChange:n})},args:{label:`Booking date`,min:`2026-01-15`,max:`2026-02-15`,description:`Available dates: Jan 15 - Feb 15, 2026`,placeholder:`Select a booking date`}},C={render:e=>{let[t,n]=(0,l.useState)(void 0);return(0,u.jsx)(r,{height:`auto`,content:(0,u.jsx)(i,{children:(0,u.jsx)(s,{...e,value:t,onChange:n})})})},args:{label:`End date`,max:new Date().toISOString().slice(0,10),description:`Max is today; open the calendar to verify the label does not turn grey when nav buttons are disabled`,placeholder:`Select an end date`}},w={render:e=>{let[t,n]=(0,l.useState)(void 0);return(0,u.jsx)(s,{...e,value:t,onChange:n})},args:{label:`Travel date`,numberOfMonths:2,placeholder:`Select a travel date`}},T={render:e=>{let[t,n]=(0,l.useState)(`2026-01-25`);return(0,u.jsx)(s,{...e,value:t,onChange:n})},args:{label:`Event date`,status:{type:`error`,message:`This date is not available`}}},E={render:e=>{let[t,n]=(0,l.useState)(`2026-01-01`);return(0,u.jsx)(s,{...e,value:t,onChange:n})},args:{label:`Meeting date`,status:{type:`warning`,message:`This is a holiday - are you sure?`}}},D={render:e=>{let[t,n]=(0,l.useState)(`2026-02-10`);return(0,u.jsx)(s,{...e,value:t,onChange:n})},args:{label:`Appointment date`,status:{type:`success`,message:`Date is available`}}},O={render:()=>{let[e,t]=(0,l.useState)(void 0),[n,r]=(0,l.useState)(`2026-01-25`),[i,a]=(0,l.useState)(void 0),[o,c]=(0,l.useState)(void 0),[d,f]=(0,l.useState)(void 0),[p,m]=(0,l.useState)(`2026-03-10`),[h,g]=(0,l.useState)(`2026-01-25`);return(0,u.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`16px`,maxWidth:`300px`},children:[(0,u.jsx)(s,{label:`Default`,value:e,onChange:t,placeholder:`Select a date`}),(0,u.jsx)(s,{label:`With value`,value:n,onChange:r}),(0,u.jsx)(s,{label:`With description`,description:`Pick your preferred date`,value:i,onChange:a,placeholder:`Select a date`}),(0,u.jsx)(s,{label:`Optional field`,isOptional:!0,value:o,onChange:c,placeholder:`Select a date (optional)`}),(0,u.jsx)(s,{label:`Required field`,isRequired:!0,value:d,onChange:f,placeholder:`Select a date`}),(0,u.jsx)(s,{label:`Disabled`,isDisabled:!0,value:p,onChange:m}),(0,u.jsx)(s,{label:`With error`,value:h,onChange:g,status:{type:`error`,message:`Invalid date selection`}})]})}},k={render:e=>{let[t,n]=(0,l.useState)(`2026-04-06`);return(0,u.jsx)(s,{...e,value:t,onChange:n,hasClear:!0})},args:{label:`Event date`,placeholder:`Select a date`}},A={render:e=>{let[t,n]=(0,l.useState)(`2026-04-06`);return(0,u.jsx)(s,{...e,value:t,onChange:n,hasClear:!0})},args:{label:`Deadline`,status:{type:`error`,message:`Date is in the past`}}},j={render:()=>{let[e,t]=(0,l.useState)(`2026-01-25`),[n,r]=(0,l.useState)(`2026-01-25`);return(0,u.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:24,width:280},children:[(0,u.jsx)(s,{label:`Attached (default)`,value:e,onChange:t,status:{type:`error`,message:`This date is not available`}}),(0,u.jsx)(s,{label:`Detached`,value:n,onChange:r,status:{type:`error`,message:`This date is not available`},statusVariant:`detached`})]})}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<ISODateString | undefined>(undefined);
    return <DateInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Date',
    placeholder: 'Select a date'
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<ISODateString | undefined>('2026-01-25' as ISODateString);
    return <DateInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Event date'
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = useState<ISODateString | undefined>('2026-03-21' as ISODateString);
    return <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 16
    }}>
        <DateInput label="Default (format='date_long')" value={value} onChange={setValue} />
        <DateInput label="format='date'" value={value} onChange={setValue} format="date" />
        <DateInput label="format='date_weekday'" value={value} onChange={setValue} format="date_weekday" />
        <DateInput label="format='system_date'" value={value} onChange={setValue} format="system_date" />
        <DateInput label="Custom function" value={value} onChange={setValue} format={iso => new Intl.DateTimeFormat('en-GB', {
        dateStyle: 'full'
      }).format(new Date(iso + 'T00:00'))} />
      </div>;
  }
}`,...m.parameters?.docs?.source},description:{story:"The committed date value can be rendered in different shapes via `format`,\nreusing `Timestamp`'s format vocabulary so the same literal renders the same\ndate shape in both components. It defaults to `'date_long'` (a long-month\ndate, \"March 21, 2026\"). While the user is typing, the raw text is shown\nverbatim — `format` applies only to the committed value.",...m.parameters?.docs?.description}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<ISODateString | undefined>(undefined);
    return <DateInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Birthday',
    description: 'Enter your date of birth',
    placeholder: 'Select your birthday'
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<ISODateString | undefined>(undefined);
    return <DateInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Date',
    isLabelHidden: true,
    placeholder: 'Select a date'
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<ISODateString | undefined>(undefined);
    return <DateInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Preferred date',
    isOptional: true,
    placeholder: 'Select a date (optional)'
  }
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<ISODateString | undefined>(undefined);
    return <DateInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Start date',
    isRequired: true,
    placeholder: 'Select a start date'
  }
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<ISODateString | undefined>('2026-01-25' as ISODateString);
    return <DateInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Locked date',
    isDisabled: true
  }
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<ISODateString | undefined>(undefined);
    return <DateInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Event date',
    isDisabled: true,
    disabledMessage: 'You need the Editor role to change this'
  }
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<ISODateString | undefined>(undefined);
    return <DateInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Date',
    size: 'sm',
    placeholder: 'Select a date'
  }
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<ISODateString | undefined>(undefined);
    return <DateInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Booking date',
    min: '2026-01-15' as ISODateString,
    max: '2026-02-15' as ISODateString,
    description: 'Available dates: Jan 15 - Feb 15, 2026',
    placeholder: 'Select a booking date'
  }
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<ISODateString | undefined>(undefined);
    return <Layout height="auto" content={<LayoutContent>
            <DateInput {...args} value={value} onChange={setValue} />
          </LayoutContent>} />;
  },
  args: {
    label: 'End date',
    max: new Date().toISOString().slice(0, 10) as ISODateString,
    description: 'Max is today; open the calendar to verify the label does not turn grey when nav buttons are disabled',
    placeholder: 'Select an end date'
  }
}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<ISODateString | undefined>(undefined);
    return <DateInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Travel date',
    numberOfMonths: 2,
    placeholder: 'Select a travel date'
  }
}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<ISODateString | undefined>('2026-01-25' as ISODateString);
    return <DateInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Event date',
    status: {
      type: 'error',
      message: 'This date is not available'
    }
  }
}`,...T.parameters?.docs?.source}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<ISODateString | undefined>('2026-01-01' as ISODateString);
    return <DateInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Meeting date',
    status: {
      type: 'warning',
      message: 'This is a holiday - are you sure?'
    }
  }
}`,...E.parameters?.docs?.source}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<ISODateString | undefined>('2026-02-10' as ISODateString);
    return <DateInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Appointment date',
    status: {
      type: 'success',
      message: 'Date is available'
    }
  }
}`,...D.parameters?.docs?.source}}},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [value1, setValue1] = useState<ISODateString | undefined>(undefined);
    const [value2, setValue2] = useState<ISODateString | undefined>('2026-01-25' as ISODateString);
    const [value3, setValue3] = useState<ISODateString | undefined>(undefined);
    const [value4, setValue4] = useState<ISODateString | undefined>(undefined);
    const [value5, setValue5] = useState<ISODateString | undefined>(undefined);
    const [value6, setValue6] = useState<ISODateString | undefined>('2026-03-10' as ISODateString);
    const [value7, setValue7] = useState<ISODateString | undefined>('2026-01-25' as ISODateString);
    return <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      maxWidth: '300px'
    }}>
        <DateInput label="Default" value={value1} onChange={setValue1} placeholder="Select a date" />
        <DateInput label="With value" value={value2} onChange={setValue2} />
        <DateInput label="With description" description="Pick your preferred date" value={value3} onChange={setValue3} placeholder="Select a date" />
        <DateInput label="Optional field" isOptional value={value4} onChange={setValue4} placeholder="Select a date (optional)" />
        <DateInput label="Required field" isRequired value={value5} onChange={setValue5} placeholder="Select a date" />
        <DateInput label="Disabled" isDisabled value={value6} onChange={setValue6} />
        <DateInput label="With error" value={value7} onChange={setValue7} status={{
        type: 'error',
        message: 'Invalid date selection'
      }} />
      </div>;
  }
}`,...O.parameters?.docs?.source}}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<ISODateString | undefined>('2026-04-06');
    return <DateInput {...args} value={value} onChange={setValue} hasClear />;
  },
  args: {
    label: 'Event date',
    placeholder: 'Select a date'
  }
}`,...k.parameters?.docs?.source}}},A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<ISODateString | undefined>('2026-04-06');
    return <DateInput {...args} value={value} onChange={setValue} hasClear />;
  },
  args: {
    label: 'Deadline',
    status: {
      type: 'error',
      message: 'Date is in the past'
    }
  }
}`,...A.parameters?.docs?.source}}},j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [a, setA] = useState<ISODateString | undefined>('2026-01-25' as ISODateString);
    const [b, setB] = useState<ISODateString | undefined>('2026-01-25' as ISODateString);
    return <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 24,
      width: 280
    }}>
        <DateInput label="Attached (default)" value={a} onChange={setA} status={{
        type: 'error',
        message: 'This date is not available'
      }} />
        <DateInput label="Detached" value={b} onChange={setB} status={{
        type: 'error',
        message: 'This date is not available'
      }} statusVariant="detached" />
      </div>;
  }
}`,...j.parameters?.docs?.source}}},M=[`Default`,`WithValue`,`Formats`,`WithDescription`,`WithHiddenLabel`,`Optional`,`Required`,`Disabled`,`DisabledWithMessage`,`SmallSize`,`WithMinMax`,`WithMaxDateInLayout`,`TwoMonthCalendar`,`WithErrorStatus`,`WithWarningStatus`,`WithSuccessStatus`,`AllVariations`,`Clearable`,`ClearableWithStatus`,`StatusVariantComparison`]}))();export{O as AllVariations,k as Clearable,A as ClearableWithStatus,f as Default,y as Disabled,b as DisabledWithMessage,m as Formats,_ as Optional,v as Required,x as SmallSize,j as StatusVariantComparison,w as TwoMonthCalendar,h as WithDescription,T as WithErrorStatus,g as WithHiddenLabel,C as WithMaxDateInLayout,S as WithMinMax,D as WithSuccessStatus,p as WithValue,E as WithWarningStatus,M as __namedExportsOrder,d as default};