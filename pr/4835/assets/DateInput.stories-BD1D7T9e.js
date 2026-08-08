import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{t}from"./react-BZJXY1be.js";import{i as n,n as r,r as i,t as a}from"./LayoutContent-Bp6k5ngv.js";import{n as o,t as s}from"./Theme-os0aoGDw.js";import{t as c}from"./jsx-runtime-DeHZSEgm.js";import{a as l,o as u}from"./useTheme-CAaDofyu.js";import{n as d,t as f}from"./DateInput-BhvRwEmD.js";var p,m,h,g,_,v,y,b,x,S,C,w,T,E,D,O,k,A,j,M,N,P,F,I,L,R,z,B,V;function H(){return(H=e((()=>{p=t(),d(),n(),r(),o(),u(),m=c(),h={title:`Core/DateInput`,component:f,tags:[`autodocs`],argTypes:{label:{control:`text`,description:`Label text (required)`},isLabelHidden:{control:`boolean`,description:`Visually hide the label (still accessible to screen readers)`},placeholder:{control:`text`,description:`Placeholder text`},description:{control:`text`,description:`Description text displayed between the label and input`},isOptional:{control:`boolean`,description:`Whether the field is optional (mutually exclusive with isRequired)`},isRequired:{control:`boolean`,description:`Whether the field is required (mutually exclusive with isOptional)`},isDisabled:{control:`boolean`,description:`Whether the input is disabled`},disabledMessage:{control:`text`,description:`Explains why the input is disabled. With isDisabled, shows a tooltip on hover/keyboard focus and keeps the field focusable via aria-disabled (activation stays blocked). Use this instead of wrapping a disabled DateInput in Tooltip.`},size:{control:`radio`,options:[`sm`,`md`,`lg`],description:`Size of the input`},numberOfMonths:{control:`radio`,options:[1,2],description:`Number of months to display in calendar`},weekStartsOn:{control:`select`,options:[0,1,2,3,4,5,6,`sun`,`mon`,`tue`,`wed`,`thu`,`fri`,`sat`],description:`First day of week in the calendar popover (0 = Sunday, or a three-letter day name)`},format:{control:`select`,options:[`date_long`,`date`,`date_weekday`,`system_date`],description:`Display format for the committed value, reusing Timestamp's vocabulary. Defaults to 'date_long' (long-month date).`}}},g={render:e=>{let[t,n]=(0,p.useState)(void 0);return(0,m.jsx)(f,{...e,value:t,onChange:n})},args:{label:`Date`,placeholder:`Select a date`}},_={render:e=>{let[t,n]=(0,p.useState)(`2026-01-25`);return(0,m.jsx)(f,{...e,value:t,onChange:n})},args:{label:`Event date`}},v={name:`Week starts on Monday`,render:e=>{let[t,n]=(0,p.useState)(void 0);return(0,m.jsx)(f,{...e,value:t,onChange:n})},args:{label:`Date`,placeholder:`Select a date`,weekStartsOn:`mon`}},y={render:()=>{let[e,t]=(0,p.useState)(`2026-03-21`);return(0,m.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:16},children:[(0,m.jsx)(f,{label:`Default (format='date_long')`,value:e,onChange:t}),(0,m.jsx)(f,{label:`format='date'`,value:e,onChange:t,format:`date`}),(0,m.jsx)(f,{label:`format='date_weekday'`,value:e,onChange:t,format:`date_weekday`}),(0,m.jsx)(f,{label:`format='system_date'`,value:e,onChange:t,format:`system_date`}),(0,m.jsx)(f,{label:`Custom function`,value:e,onChange:t,format:e=>new Intl.DateTimeFormat(`en-GB`,{dateStyle:`full`}).format(new Date(e+`T00:00`))})]})}},b={render:e=>{let[t,n]=(0,p.useState)(void 0);return(0,m.jsx)(f,{...e,value:t,onChange:n})},args:{label:`Birthday`,description:`Enter your date of birth`,placeholder:`Select your birthday`}},x={render:e=>{let[t,n]=(0,p.useState)(void 0);return(0,m.jsx)(f,{...e,value:t,onChange:n})},args:{label:`Date`,isLabelHidden:!0,placeholder:`Select a date`}},S={render:e=>{let[t,n]=(0,p.useState)(void 0);return(0,m.jsx)(f,{...e,value:t,onChange:n})},args:{label:`Preferred date`,isOptional:!0,placeholder:`Select a date (optional)`}},C={render:e=>{let[t,n]=(0,p.useState)(void 0);return(0,m.jsx)(f,{...e,value:t,onChange:n})},args:{label:`Start date`,isRequired:!0,placeholder:`Select a start date`}},w={render:e=>{let[t,n]=(0,p.useState)(`2026-01-25`);return(0,m.jsx)(f,{...e,value:t,onChange:n})},args:{label:`Locked date`,isDisabled:!0}},T={render:e=>{let[t,n]=(0,p.useState)(void 0);return(0,m.jsx)(f,{...e,value:t,onChange:n})},args:{label:`Event date`,isDisabled:!0,disabledMessage:`You need the Editor role to change this`}},E={render:e=>{let[t,n]=(0,p.useState)(void 0);return(0,m.jsx)(f,{...e,value:t,onChange:n})},args:{label:`Date`,size:`sm`,placeholder:`Select a date`}},D={render:e=>{let[t,n]=(0,p.useState)(void 0);return(0,m.jsx)(f,{...e,value:t,onChange:n})},args:{label:`Booking date`,min:`2026-01-15`,max:`2026-02-15`,description:`Available dates: Jan 15 - Feb 15, 2026`,placeholder:`Select a booking date`}},O={render:e=>{let[t,n]=(0,p.useState)(void 0);return(0,m.jsx)(i,{height:`auto`,content:(0,m.jsx)(a,{children:(0,m.jsx)(f,{...e,value:t,onChange:n})})})},args:{label:`End date`,max:new Date().toISOString().slice(0,10),description:`Max is today; open the calendar to verify the label does not turn grey when nav buttons are disabled`,placeholder:`Select an end date`}},k={render:e=>{let[t,n]=(0,p.useState)(void 0);return(0,m.jsx)(f,{...e,value:t,onChange:n})},args:{label:`Travel date`,numberOfMonths:2,placeholder:`Select a travel date`}},A={render:e=>{let[t,n]=(0,p.useState)(`2026-01-25`);return(0,m.jsx)(f,{...e,value:t,onChange:n})},args:{label:`Event date`,status:{type:`error`,message:`This date is not available`}}},j={render:e=>{let[t,n]=(0,p.useState)(`2026-01-01`);return(0,m.jsx)(f,{...e,value:t,onChange:n})},args:{label:`Meeting date`,status:{type:`warning`,message:`This is a holiday - are you sure?`}}},M={render:e=>{let[t,n]=(0,p.useState)(`2026-02-10`);return(0,m.jsx)(f,{...e,value:t,onChange:n})},args:{label:`Appointment date`,status:{type:`success`,message:`Date is available`}}},N={render:()=>{let[e,t]=(0,p.useState)(void 0),[n,r]=(0,p.useState)(`2026-01-25`),[i,a]=(0,p.useState)(void 0),[o,s]=(0,p.useState)(void 0),[c,l]=(0,p.useState)(void 0),[u,d]=(0,p.useState)(`2026-03-10`),[h,g]=(0,p.useState)(`2026-01-25`);return(0,m.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`16px`,maxWidth:`300px`},children:[(0,m.jsx)(f,{label:`Default`,value:e,onChange:t,placeholder:`Select a date`}),(0,m.jsx)(f,{label:`With value`,value:n,onChange:r}),(0,m.jsx)(f,{label:`With description`,description:`Pick your preferred date`,value:i,onChange:a,placeholder:`Select a date`}),(0,m.jsx)(f,{label:`Optional field`,isOptional:!0,value:o,onChange:s,placeholder:`Select a date (optional)`}),(0,m.jsx)(f,{label:`Required field`,isRequired:!0,value:c,onChange:l,placeholder:`Select a date`}),(0,m.jsx)(f,{label:`Disabled`,isDisabled:!0,value:u,onChange:d}),(0,m.jsx)(f,{label:`With error`,value:h,onChange:g,status:{type:`error`,message:`Invalid date selection`}})]})}},P={render:e=>{let[t,n]=(0,p.useState)(`2026-04-06`);return(0,m.jsx)(f,{...e,value:t,onChange:n,hasClear:!0})},args:{label:`Event date`,placeholder:`Select a date`}},F={render:e=>{let[t,n]=(0,p.useState)(`2026-04-06`);return(0,m.jsx)(f,{...e,value:t,onChange:n,hasClear:!0})},args:{label:`Deadline`,status:{type:`error`,message:`Date is in the past`}}},I={render:()=>{let[e,t]=(0,p.useState)(`2026-01-25`),[n,r]=(0,p.useState)(`2026-01-25`);return(0,m.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:24,width:280},children:[(0,m.jsx)(f,{label:`Attached (default)`,value:e,onChange:t,status:{type:`error`,message:`This date is not available`}}),(0,m.jsx)(f,{label:`Detached`,value:n,onChange:r,status:{type:`error`,message:`This date is not available`},statusVariant:`detached`})]})}},L=l({name:`date-input-clear-icon-demo`,components:{"date-input-clear-icon":{base:{width:`12px`,height:`12px`,fontSize:`12px`,color:`var(--color-icon-secondary)`,":hover":{color:`var(--color-accent)`}}}}}),R={render:()=>{let[e,t]=(0,p.useState)(`2026-01-25`);return(0,m.jsx)(s,{theme:L,mode:`light`,children:(0,m.jsx)(f,{label:`Clear icon themed (12px, accent on hover)`,value:e,onChange:t,hasClear:!0})})}},z=l({name:`date-input-toggle-icon-demo`,components:{"date-input-toggle-icon":{base:{width:`14px`,height:`14px`,fontSize:`14px`,color:`var(--color-icon-secondary)`},"state:expanded":{color:`var(--color-accent)`}}}}),B={render:()=>{let[e,t]=(0,p.useState)(`2026-01-25`);return(0,m.jsx)(s,{theme:z,mode:`light`,children:(0,m.jsx)(f,{label:`Calendar toggle icon themed (14px, accent when open)`,value:e,onChange:t})})}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<ISODateString | undefined>(undefined);
    return <DateInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Date',
    placeholder: 'Select a date'
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<ISODateString | undefined>('2026-01-25' as ISODateString);
    return <DateInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Event date'
  }
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  name: 'Week starts on Monday',
  render: args => {
    const [value, setValue] = useState<ISODateString | undefined>(undefined);
    return <DateInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Date',
    placeholder: 'Select a date',
    weekStartsOn: 'mon'
  }
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
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
}`,...y.parameters?.docs?.source},description:{story:"The committed date value can be rendered in different shapes via `format`,\nreusing `Timestamp`'s format vocabulary so the same literal renders the same\ndate shape in both components. It defaults to `'date_long'` (a long-month\ndate, \"March 21, 2026\"). While the user is typing, the raw text is shown\nverbatim — `format` applies only to the committed value.",...y.parameters?.docs?.description}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<ISODateString | undefined>(undefined);
    return <DateInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Birthday',
    description: 'Enter your date of birth',
    placeholder: 'Select your birthday'
  }
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<ISODateString | undefined>(undefined);
    return <DateInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Date',
    isLabelHidden: true,
    placeholder: 'Select a date'
  }
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<ISODateString | undefined>(undefined);
    return <DateInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Preferred date',
    isOptional: true,
    placeholder: 'Select a date (optional)'
  }
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<ISODateString | undefined>(undefined);
    return <DateInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Start date',
    isRequired: true,
    placeholder: 'Select a start date'
  }
}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<ISODateString | undefined>('2026-01-25' as ISODateString);
    return <DateInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Locked date',
    isDisabled: true
  }
}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<ISODateString | undefined>(undefined);
    return <DateInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Event date',
    isDisabled: true,
    disabledMessage: 'You need the Editor role to change this'
  }
}`,...T.parameters?.docs?.source}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<ISODateString | undefined>(undefined);
    return <DateInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Date',
    size: 'sm',
    placeholder: 'Select a date'
  }
}`,...E.parameters?.docs?.source}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
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
}`,...D.parameters?.docs?.source}}},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
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
}`,...O.parameters?.docs?.source}}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<ISODateString | undefined>(undefined);
    return <DateInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Travel date',
    numberOfMonths: 2,
    placeholder: 'Select a travel date'
  }
}`,...k.parameters?.docs?.source}}},A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
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
}`,...A.parameters?.docs?.source}}},j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
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
}`,...j.parameters?.docs?.source}}},M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
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
}`,...M.parameters?.docs?.source}}},N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
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
}`,...N.parameters?.docs?.source}}},P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<ISODateString | undefined>('2026-04-06');
    return <DateInput {...args} value={value} onChange={setValue} hasClear />;
  },
  args: {
    label: 'Event date',
    placeholder: 'Select a date'
  }
}`,...P.parameters?.docs?.source}}},F.parameters={...F.parameters,docs:{...F.parameters?.docs,source:{originalSource:`{
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
}`,...F.parameters?.docs?.source}}},I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{
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
}`,...I.parameters?.docs?.source}}},R.parameters={...R.parameters,docs:{...R.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = useState<ISODateString | undefined>('2026-01-25' as ISODateString);
    return <Theme theme={clearIconTheme} mode="light">
        <DateInput label="Clear icon themed (12px, accent on hover)" value={value} onChange={setValue} hasClear />
      </Theme>;
  }
}`,...R.parameters?.docs?.source}}},B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = useState<ISODateString | undefined>('2026-01-25' as ISODateString);
    return <Theme theme={toggleIconTheme} mode="light">
        <DateInput label="Calendar toggle icon themed (14px, accent when open)" value={value} onChange={setValue} />
      </Theme>;
  }
}`,...B.parameters?.docs?.source}}},V=[`Default`,`WithValue`,`MondayFirstWeek`,`Formats`,`WithDescription`,`WithHiddenLabel`,`Optional`,`Required`,`Disabled`,`DisabledWithMessage`,`SmallSize`,`WithMinMax`,`WithMaxDateInLayout`,`TwoMonthCalendar`,`WithErrorStatus`,`WithWarningStatus`,`WithSuccessStatus`,`AllVariations`,`Clearable`,`ClearableWithStatus`,`StatusVariantComparison`,`ThemedClearIcon`,`ThemedCalendarToggleIcon`]})))()}H();export{N as AllVariations,P as Clearable,F as ClearableWithStatus,g as Default,w as Disabled,T as DisabledWithMessage,y as Formats,v as MondayFirstWeek,S as Optional,C as Required,E as SmallSize,I as StatusVariantComparison,B as ThemedCalendarToggleIcon,R as ThemedClearIcon,k as TwoMonthCalendar,b as WithDescription,A as WithErrorStatus,x as WithHiddenLabel,O as WithMaxDateInLayout,D as WithMinMax,M as WithSuccessStatus,_ as WithValue,j as WithWarningStatus,V as __namedExportsOrder,h as default};