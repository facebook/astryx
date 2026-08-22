import{i as e,s as t}from"./preload-helper-CT_b8DTk.js";import{t as n}from"./react-B7Te67-h.js";import{t as r}from"./jsx-runtime-DqZldVDK.js";import{s as i}from"./useTheme-CwJEN0rX.js";import{t as a,x as o}from"./theme-BsMtEZq7.js";import{En as s,Tn as c}from"./iframe-DjHHx679.js";function l(e){let t=new Date;return t.setDate(t.getDate()-e),t.toISOString().slice(0,10)}function u(){return new Date().toISOString().slice(0,10)}function d(){let e=new Date;return e.setDate(1),e.toISOString().slice(0,10)}var f,p,m,h,g,_,v,y,b,x,S,C,w,T,E,D,O,k,A,j,M,N,P,F,I,L;e((()=>{f=t(n()),c(),a(),p=r(),m=[{label:`Last 1 day`,getRange:()=>({start:l(1),end:u()})},{label:`Last 3 days`,getRange:()=>({start:l(3),end:u()})},{label:`Last 7 days`,getRange:()=>({start:l(7),end:u()})},{label:`Last 14 days`,getRange:()=>({start:l(14),end:u()})},{label:`Last 30 days`,getRange:()=>({start:l(30),end:u()})},{label:`This month`,getRange:()=>({start:d(),end:u()})}],h={title:`Core/DateRangeInput`,component:s,tags:[`autodocs`],argTypes:{label:{control:`text`,description:`Label text (required)`},isLabelHidden:{control:`boolean`,description:`Visually hide the label`},placeholder:{control:`text`,description:`Placeholder text`},description:{control:`text`,description:`Description text`},isOptional:{control:`boolean`,description:`Show optional indicator`},isRequired:{control:`boolean`,description:`Mark as required`},isDisabled:{control:`boolean`,description:`Disable the picker`},disabledMessage:{control:`text`,description:`Explains why the input is disabled. With isDisabled, shows a tooltip on hover/keyboard focus and keeps the field focusable via aria-disabled (activation stays blocked). Use this instead of wrapping a disabled DateRangeInput in Tooltip.`},size:{control:`radio`,options:[`sm`,`md`,`lg`]},hasClear:{control:`boolean`,description:`Show clear button`},numberOfMonths:{control:`radio`,options:[1,2],description:`Calendar months`}}},g={render:e=>{let[t,n]=(0,f.useState)(null);return(0,p.jsx)(s,{...e,value:t,onChange:n})},args:{label:`Date range`}},_={render:e=>{let[t,n]=(0,f.useState)({start:`2026-03-10`,end:`2026-03-20`});return(0,p.jsx)(s,{...e,value:t,onChange:n})},args:{label:`Report period`}},v={render:e=>{let[t,n]=(0,f.useState)(null);return(0,p.jsx)(s,{...e,value:t,onChange:n})},args:{label:`Date range`,presets:m}},y={render:e=>{let[t,n]=(0,f.useState)({start:l(7),end:u()});return(0,p.jsx)(s,{...e,value:t,onChange:n})},args:{label:`Analytics period`,presets:m}},b={render:e=>{let[t,n]=(0,f.useState)(null);return(0,p.jsx)(s,{...e,value:t,onChange:n})},args:{label:`Coverage period`,description:`Select the start and end dates for the report`}},x={render:e=>{let[t,n]=(0,f.useState)(null);return(0,p.jsx)(s,{...e,value:t,onChange:n})},args:{label:`Booking dates`,min:`2026-03-01`,max:`2026-06-30`,description:`Available: Mar 1 – Jun 30, 2026`}},S={render:e=>{let[t,n]=(0,f.useState)(null);return(0,p.jsx)(s,{...e,value:t,onChange:n})},args:{label:`Reporting period`,maxRangeSpan:7,description:`Pick a start date, then any end within a 7-day window`}},C={render:e=>{let[t,n]=(0,f.useState)(null);return(0,p.jsx)(s,{...e,value:t,onChange:n})},args:{label:`Stay`,minRangeSpan:2,maxRangeSpan:30,description:`At least 2 and at most 30 days`}},w={render:e=>{let[t,n]=(0,f.useState)(null);return(0,p.jsx)(s,{...e,value:t,onChange:n})},args:{label:`Filter by date`,isOptional:!0}},T={render:e=>{let[t,n]=(0,f.useState)(null);return(0,p.jsx)(s,{...e,value:t,onChange:n})},args:{label:`Coverage period`,isRequired:!0}},E={render:e=>{let[t,n]=(0,f.useState)({start:`2026-03-10`,end:`2026-03-20`});return(0,p.jsx)(s,{...e,value:t,onChange:n})},args:{label:`Locked range`,isDisabled:!0}},D={render:e=>{let[t,n]=(0,f.useState)(null);return(0,p.jsx)(s,{...e,value:t,onChange:n})},args:{label:`Reporting period`,isDisabled:!0,disabledMessage:`You need the Editor role to change this`}},O={render:()=>{let[e,t]=(0,f.useState)(null),[n,r]=(0,f.useState)(null),[i,a]=(0,f.useState)(null);return(0,p.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`16px`,maxWidth:`340px`},children:[(0,p.jsx)(s,{label:`Small (28px)`,value:e,onChange:t,size:`sm`}),(0,p.jsx)(s,{label:`Medium (32px)`,value:n,onChange:r,size:`md`}),(0,p.jsx)(s,{label:`Large (36px)`,value:i,onChange:a,size:`lg`})]})}},k={render:e=>{let[t,n]=(0,f.useState)(null);return(0,p.jsx)(s,{...e,value:t,onChange:n})},args:{label:`Date range`,numberOfMonths:1}},A={render:e=>{let[t,n]=(0,f.useState)(null);return(0,p.jsx)(s,{...e,value:t,onChange:n})},args:{label:`Date range`,status:{type:`error`,message:`Please select a date range`}}},j={render:e=>{let[t,n]=(0,f.useState)({start:`2026-03-01`,end:`2026-06-30`});return(0,p.jsx)(s,{...e,value:t,onChange:n})},args:{label:`Date range`,status:{type:`warning`,message:`Range exceeds 90 days`}}},M={render:e=>{let[t,n]=(0,f.useState)({start:`2026-03-10`,end:`2026-03-20`});return(0,p.jsx)(s,{...e,value:t,onChange:n})},args:{label:`Required range`,hasClear:!1}},N={render:()=>{let[e,t]=(0,f.useState)(null),[n,r]=(0,f.useState)({start:`2026-03-10`,end:`2026-03-20`}),[i,a]=(0,f.useState)(null),[o,c]=(0,f.useState)({start:`2026-03-10`,end:`2026-03-20`}),[l,u]=(0,f.useState)(null);return(0,p.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`16px`,maxWidth:`340px`},children:[(0,p.jsx)(s,{label:`Default`,value:e,onChange:t}),(0,p.jsx)(s,{label:`With value`,value:n,onChange:r}),(0,p.jsx)(s,{label:`With presets`,value:i,onChange:a,presets:m}),(0,p.jsx)(s,{label:`Disabled`,isDisabled:!0,value:o,onChange:c}),(0,p.jsx)(s,{label:`With error`,value:l,onChange:u,status:{type:`error`,message:`Date range is required`}})]})}},P={render:()=>{let[e,t]=(0,f.useState)(null),[n,r]=(0,f.useState)(null);return(0,p.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:24,width:320},children:[(0,p.jsx)(s,{label:`Attached (default)`,value:e,onChange:t,status:{type:`error`,message:`Please select a date range`}}),(0,p.jsx)(s,{label:`Detached`,value:n,onChange:r,status:{type:`error`,message:`Please select a date range`},statusVariant:`detached`})]})}},F=i({name:`date-range-input-icon-demo`,components:{"date-range-input-clear-icon":{base:{width:`12px`,height:`12px`,fontSize:`12px`,color:`var(--color-icon-secondary)`,":hover":{color:`var(--color-accent)`}}},"date-range-input-toggle-icon":{base:{width:`14px`,height:`14px`,fontSize:`14px`,color:`var(--color-accent)`}}}}),I={render:()=>{let[e,t]=(0,f.useState)({start:l(7),end:u()});return(0,p.jsx)(o,{theme:F,mode:`light`,children:(0,p.jsx)(`div`,{style:{width:320},children:(0,p.jsx)(s,{label:`Icons themed (12px clear w/ hover, 14px accent toggle)`,value:e,onChange:t,hasClear:!0})})})}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<DateRange | null>(null);
    return <DateRangeInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Date range'
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
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
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<DateRange | null>(null);
    return <DateRangeInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Date range',
    presets: defaultPresets
  }
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
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
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<DateRange | null>(null);
    return <DateRangeInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Coverage period',
    description: 'Select the start and end dates for the report'
  }
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
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
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<DateRange | null>(null);
    return <DateRangeInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Reporting period',
    maxRangeSpan: 7,
    description: 'Pick a start date, then any end within a 7-day window'
  }
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<DateRange | null>(null);
    return <DateRangeInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Stay',
    minRangeSpan: 2,
    maxRangeSpan: 30,
    description: 'At least 2 and at most 30 days'
  }
}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<DateRange | null>(null);
    return <DateRangeInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Filter by date',
    isOptional: true
  }
}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<DateRange | null>(null);
    return <DateRangeInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Coverage period',
    isRequired: true
  }
}`,...T.parameters?.docs?.source}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
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
}`,...E.parameters?.docs?.source}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<DateRange | null>(null);
    return <DateRangeInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Reporting period',
    isDisabled: true,
    disabledMessage: 'You need the Editor role to change this'
  }
}`,...D.parameters?.docs?.source}}},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
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
}`,...O.parameters?.docs?.source}}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<DateRange | null>(null);
    return <DateRangeInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Date range',
    numberOfMonths: 1
  }
}`,...k.parameters?.docs?.source}}},A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
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
}`,...A.parameters?.docs?.source}}},j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
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
}`,...j.parameters?.docs?.source}}},M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
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
}`,...M.parameters?.docs?.source}}},N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
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
}`,...N.parameters?.docs?.source}}},P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [a, setA] = useState<DateRange | null>(null);
    const [b, setB] = useState<DateRange | null>(null);
    return <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 24,
      width: 320
    }}>
        <DateRangeInput label="Attached (default)" value={a} onChange={setA} status={{
        type: 'error',
        message: 'Please select a date range'
      }} />
        <DateRangeInput label="Detached" value={b} onChange={setB} status={{
        type: 'error',
        message: 'Please select a date range'
      }} statusVariant="detached" />
      </div>;
  }
}`,...P.parameters?.docs?.source}}},I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = useState<DateRange | null>({
      start: daysAgo(7),
      end: today()
    });
    return <Theme theme={iconTheme} mode="light">
        <div style={{
        width: 320
      }}>
          <DateRangeInput label="Icons themed (12px clear w/ hover, 14px accent toggle)" value={value} onChange={setValue} hasClear />
        </div>
      </Theme>;
  }
}`,...I.parameters?.docs?.source}}},L=[`Default`,`WithValue`,`WithPresets`,`WithPresetsAndValue`,`WithDescription`,`WithMinMax`,`MaxRangeSpan`,`RangeSpanBounds`,`Optional`,`Required`,`Disabled`,`DisabledWithMessage`,`SizeVariants`,`SingleMonth`,`WithErrorStatus`,`WithWarningStatus`,`NoClear`,`AllVariations`,`StatusVariantComparison`,`ThemedIcons`]}))();export{N as AllVariations,g as Default,E as Disabled,D as DisabledWithMessage,S as MaxRangeSpan,M as NoClear,w as Optional,C as RangeSpanBounds,T as Required,k as SingleMonth,O as SizeVariants,P as StatusVariantComparison,I as ThemedIcons,b as WithDescription,A as WithErrorStatus,x as WithMinMax,v as WithPresets,y as WithPresetsAndValue,_ as WithValue,j as WithWarningStatus,L as __namedExportsOrder,h as default};