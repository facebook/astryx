import{i as e,s as t}from"./preload-helper-CT_b8DTk.js";import{t as n}from"./react-B7Te67-h.js";import{t as r}from"./jsx-runtime-DqZldVDK.js";import{Mn as i,Nn as a}from"./iframe-1XPcLcD3.js";function o(e){let t=new Date;return t.setDate(t.getDate()-e),t.toISOString().slice(0,10)}function s(){return new Date().toISOString().slice(0,10)}function c(){let e=new Date;return e.setDate(1),e.toISOString().slice(0,10)}var l,u,d,f,p,m,h,g,_,v,y,b,x,S,C,w,T,E,D,O,k;e((()=>{l=t(n()),i(),u=r(),d=[{label:`Last 1 day`,getRange:()=>({start:o(1),end:s()})},{label:`Last 3 days`,getRange:()=>({start:o(3),end:s()})},{label:`Last 7 days`,getRange:()=>({start:o(7),end:s()})},{label:`Last 14 days`,getRange:()=>({start:o(14),end:s()})},{label:`Last 30 days`,getRange:()=>({start:o(30),end:s()})},{label:`This month`,getRange:()=>({start:c(),end:s()})}],f={title:`Core/DateRangeInput`,component:a,tags:[`autodocs`],argTypes:{label:{control:`text`,description:`Label text (required)`},isLabelHidden:{control:`boolean`,description:`Visually hide the label`},placeholder:{control:`text`,description:`Placeholder text`},description:{control:`text`,description:`Description text`},isOptional:{control:`boolean`,description:`Show optional indicator`},isRequired:{control:`boolean`,description:`Mark as required`},isDisabled:{control:`boolean`,description:`Disable the picker`},disabledMessage:{control:`text`,description:`Explains why the input is disabled. With isDisabled, shows a tooltip on hover/keyboard focus and keeps the field focusable via aria-disabled (activation stays blocked). Use this instead of wrapping a disabled DateRangeInput in Tooltip.`},size:{control:`radio`,options:[`sm`,`md`,`lg`]},hasClear:{control:`boolean`,description:`Show clear button`},numberOfMonths:{control:`radio`,options:[1,2],description:`Calendar months`}}},p={render:e=>{let[t,n]=(0,l.useState)(null);return(0,u.jsx)(a,{...e,value:t,onChange:n})},args:{label:`Date range`}},m={render:e=>{let[t,n]=(0,l.useState)({start:`2026-03-10`,end:`2026-03-20`});return(0,u.jsx)(a,{...e,value:t,onChange:n})},args:{label:`Report period`}},h={render:e=>{let[t,n]=(0,l.useState)(null);return(0,u.jsx)(a,{...e,value:t,onChange:n})},args:{label:`Date range`,presets:d}},g={render:e=>{let[t,n]=(0,l.useState)({start:o(7),end:s()});return(0,u.jsx)(a,{...e,value:t,onChange:n})},args:{label:`Analytics period`,presets:d}},_={render:e=>{let[t,n]=(0,l.useState)(null);return(0,u.jsx)(a,{...e,value:t,onChange:n})},args:{label:`Coverage period`,description:`Select the start and end dates for the report`}},v={render:e=>{let[t,n]=(0,l.useState)(null);return(0,u.jsx)(a,{...e,value:t,onChange:n})},args:{label:`Booking dates`,min:`2026-03-01`,max:`2026-06-30`,description:`Available: Mar 1 – Jun 30, 2026`}},y={render:e=>{let[t,n]=(0,l.useState)(null);return(0,u.jsx)(a,{...e,value:t,onChange:n})},args:{label:`Filter by date`,isOptional:!0}},b={render:e=>{let[t,n]=(0,l.useState)(null);return(0,u.jsx)(a,{...e,value:t,onChange:n})},args:{label:`Coverage period`,isRequired:!0}},x={render:e=>{let[t,n]=(0,l.useState)({start:`2026-03-10`,end:`2026-03-20`});return(0,u.jsx)(a,{...e,value:t,onChange:n})},args:{label:`Locked range`,isDisabled:!0}},S={render:e=>{let[t,n]=(0,l.useState)(null);return(0,u.jsx)(a,{...e,value:t,onChange:n})},args:{label:`Reporting period`,isDisabled:!0,disabledMessage:`You need the Editor role to change this`}},C={render:()=>{let[e,t]=(0,l.useState)(null),[n,r]=(0,l.useState)(null),[i,o]=(0,l.useState)(null);return(0,u.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`16px`,maxWidth:`340px`},children:[(0,u.jsx)(a,{label:`Small (28px)`,value:e,onChange:t,size:`sm`}),(0,u.jsx)(a,{label:`Medium (32px)`,value:n,onChange:r,size:`md`}),(0,u.jsx)(a,{label:`Large (36px)`,value:i,onChange:o,size:`lg`})]})}},w={render:e=>{let[t,n]=(0,l.useState)(null);return(0,u.jsx)(a,{...e,value:t,onChange:n})},args:{label:`Date range`,numberOfMonths:1}},T={render:e=>{let[t,n]=(0,l.useState)(null);return(0,u.jsx)(a,{...e,value:t,onChange:n})},args:{label:`Date range`,status:{type:`error`,message:`Please select a date range`}}},E={render:e=>{let[t,n]=(0,l.useState)({start:`2026-03-01`,end:`2026-06-30`});return(0,u.jsx)(a,{...e,value:t,onChange:n})},args:{label:`Date range`,status:{type:`warning`,message:`Range exceeds 90 days`}}},D={render:e=>{let[t,n]=(0,l.useState)({start:`2026-03-10`,end:`2026-03-20`});return(0,u.jsx)(a,{...e,value:t,onChange:n})},args:{label:`Required range`,hasClear:!1}},O={render:()=>{let[e,t]=(0,l.useState)(null),[n,r]=(0,l.useState)({start:`2026-03-10`,end:`2026-03-20`}),[i,o]=(0,l.useState)(null),[s,c]=(0,l.useState)({start:`2026-03-10`,end:`2026-03-20`}),[f,p]=(0,l.useState)(null);return(0,u.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`16px`,maxWidth:`340px`},children:[(0,u.jsx)(a,{label:`Default`,value:e,onChange:t}),(0,u.jsx)(a,{label:`With value`,value:n,onChange:r}),(0,u.jsx)(a,{label:`With presets`,value:i,onChange:o,presets:d}),(0,u.jsx)(a,{label:`Disabled`,isDisabled:!0,value:s,onChange:c}),(0,u.jsx)(a,{label:`With error`,value:f,onChange:p,status:{type:`error`,message:`Date range is required`}})]})}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<DateRange | null>(null);
    return <DateRangeInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Date range'
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<DateRange | null>({
      start: '2026-03-10' as ISODateString,
      end: '2026-03-20' as ISODateString
    });
    return <DateRangeInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Report period'
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<DateRange | null>(null);
    return <DateRangeInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Date range',
    presets: defaultPresets
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<DateRange | null>({
      start: daysAgo(7),
      end: today()
    });
    return <DateRangeInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Analytics period',
    presets: defaultPresets
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<DateRange | null>(null);
    return <DateRangeInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Coverage period',
    description: 'Select the start and end dates for the report'
  }
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<DateRange | null>(null);
    return <DateRangeInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Booking dates',
    min: '2026-03-01' as ISODateString,
    max: '2026-06-30' as ISODateString,
    description: 'Available: Mar 1 – Jun 30, 2026'
  }
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<DateRange | null>(null);
    return <DateRangeInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Filter by date',
    isOptional: true
  }
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<DateRange | null>(null);
    return <DateRangeInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Coverage period',
    isRequired: true
  }
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<DateRange | null>({
      start: '2026-03-10' as ISODateString,
      end: '2026-03-20' as ISODateString
    });
    return <DateRangeInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Locked range',
    isDisabled: true
  }
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<DateRange | null>(null);
    return <DateRangeInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Reporting period',
    isDisabled: true,
    disabledMessage: 'You need the Editor role to change this'
  }
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [sm, setSm] = useState<DateRange | null>(null);
    const [md, setMd] = useState<DateRange | null>(null);
    const [lg, setLg] = useState<DateRange | null>(null);
    return <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      maxWidth: '340px'
    }}>
        <DateRangeInput label="Small (28px)" value={sm} onChange={setSm} size="sm" />
        <DateRangeInput label="Medium (32px)" value={md} onChange={setMd} size="md" />
        <DateRangeInput label="Large (36px)" value={lg} onChange={setLg} size="lg" />
      </div>;
  }
}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<DateRange | null>(null);
    return <DateRangeInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Date range',
    numberOfMonths: 1
  }
}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<DateRange | null>(null);
    return <DateRangeInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Date range',
    status: {
      type: 'error',
      message: 'Please select a date range'
    }
  }
}`,...T.parameters?.docs?.source}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<DateRange | null>({
      start: '2026-03-01' as ISODateString,
      end: '2026-06-30' as ISODateString
    });
    return <DateRangeInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Date range',
    status: {
      type: 'warning',
      message: 'Range exceeds 90 days'
    }
  }
}`,...E.parameters?.docs?.source}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<DateRange | null>({
      start: '2026-03-10' as ISODateString,
      end: '2026-03-20' as ISODateString
    });
    return <DateRangeInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Required range',
    hasClear: false
  }
}`,...D.parameters?.docs?.source}}},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [v1, setV1] = useState<DateRange | null>(null);
    const [v2, setV2] = useState<DateRange | null>({
      start: '2026-03-10' as ISODateString,
      end: '2026-03-20' as ISODateString
    });
    const [v3, setV3] = useState<DateRange | null>(null);
    const [v4, setV4] = useState<DateRange | null>({
      start: '2026-03-10' as ISODateString,
      end: '2026-03-20' as ISODateString
    });
    const [v5, setV5] = useState<DateRange | null>(null);
    return <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      maxWidth: '340px'
    }}>
        <DateRangeInput label="Default" value={v1} onChange={setV1} />
        <DateRangeInput label="With value" value={v2} onChange={setV2} />
        <DateRangeInput label="With presets" value={v3} onChange={setV3} presets={defaultPresets} />
        <DateRangeInput label="Disabled" isDisabled value={v4} onChange={setV4} />
        <DateRangeInput label="With error" value={v5} onChange={setV5} status={{
        type: 'error',
        message: 'Date range is required'
      }} />
      </div>;
  }
}`,...O.parameters?.docs?.source}}},k=[`Default`,`WithValue`,`WithPresets`,`WithPresetsAndValue`,`WithDescription`,`WithMinMax`,`Optional`,`Required`,`Disabled`,`DisabledWithMessage`,`SizeVariants`,`SingleMonth`,`WithErrorStatus`,`WithWarningStatus`,`NoClear`,`AllVariations`]}))();export{O as AllVariations,p as Default,x as Disabled,S as DisabledWithMessage,D as NoClear,y as Optional,b as Required,w as SingleMonth,C as SizeVariants,_ as WithDescription,T as WithErrorStatus,v as WithMinMax,h as WithPresets,g as WithPresetsAndValue,m as WithValue,E as WithWarningStatus,k as __namedExportsOrder,f as default};