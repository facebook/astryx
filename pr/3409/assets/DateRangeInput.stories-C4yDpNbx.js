import{aM as fe,ah as r,a1 as s,I as L,e as Se,a6 as De,af as Re,ay as Ce}from"./iframe-Z8EfSKmM.js";import{k as G,y as we,i as Q,b as Ve,c as je}from"./plainDate-C-ANv9VG.js";import{F as Ie}from"./Field-BUd1jCAy.js";import{a as ze,b as ke,i as qe,c as U}from"./inputStyles.stylex-Bpqcd25J.js";import{C as Oe}from"./Calendar-DtIZrfqJ.js";import{u as Te}from"./usePopover-ay_XHQXA.js";import"./preload-helper-Ct5FWWRu.js";import"./FieldStatus-B_cgkwjT.js";const We={sm:{kZKoxP:"astryx6k0iem",k7Eaqz:"astryxfb3i0g",$$css:!0},md:{kZKoxP:"astryx1ueg155",k7Eaqz:"astryxfb3i0g",$$css:!0},lg:{kZKoxP:"astryxssyfek",k7Eaqz:"astryxfb3i0g",$$css:!0}};function Me(e){if(!e)return"";const a=G(e.start),t=G(e.end),g=we().year,d=a.year===t.year&&a.year===g?Ve:je;return`${Q(a,d)} – ${Q(t,d)}`}function $e(e,a){return e===a?!0:!e||!a?!1:e.start===a.start&&e.end===a.end}function n({label:e,isLabelHidden:a=!1,description:t,isOptional:g=!1,isRequired:p=!1,isDisabled:d=!1,value:c,onChange:v,changeAction:h,isLoading:M=!1,min:X,max:ee,dateConstraints:ae,presets:$,hasClear:te=!0,placeholder:E="Select date range",size:se,status:l,labelTooltip:re,numberOfMonths:ne=2,width:le,xstyle:oe,className:ue,style:ie,ref:de,...ce}){const F=fe(se,"md"),_=r.useId(),B=r.useId(),H=r.useId(),[,Y]=r.useTransition(),[P,K]=r.useOptimistic(c),b=M||P!==c,i=d||b,ge={warning:"warning",error:"error",success:"success"},pe={warning:"warning",error:"error",success:"success"},ye=[t?B:null,l?.message?H:null].filter(Boolean).join(" ")||void 0,A=r.useMemo(()=>Me(P),[P]),o=Te({dialogLabel:"Choose date range",closeButtonLabel:"Close calendar"}),m=r.useCallback(u=>{b||(v(u),h&&Y(async()=>{K(u),await h(u)}))},[b,v,h,Y,K]),Z=r.useCallback(()=>{i||(o.isOpen?o.hide():o.show())},[i,o]),me=r.useCallback(u=>{m(u),o.hide()},[m,o]),xe=r.useCallback(u=>{m(u.getRange()),o.hide()},[m,o]),he=r.useCallback(u=>{u.stopPropagation(),m(null)},[m]),be=c?`${e}: ${A}`:`${e}: ${E}`;return s.jsxs(Ie,{label:e,isLabelHidden:a,description:t,inputID:_,descriptionID:t?B:void 0,isOptional:g,isRequired:p,isDisabled:i,status:l?{type:l.type,message:l.message,messageID:l.message?H:void 0}:void 0,labelTooltip:re,width:le,children:[s.jsxs("div",{ref:o.triggerRef,...ce,...De(Ce("date-range-input",{size:F,status:l?.type??null}),Re(U.base,We[F],i&&U.disabled,l&&qe[l.type],l&&ke[l.type],l&&ze[l.type],oe),ue,ie),children:[s.jsx("button",{type:"button",onClick:Z,disabled:i,"aria-label":o.isOpen?"Close calendar":"Open calendar",tabIndex:-1,...{0:{className:"astryx78zum5 astryx6s0dn4 astryxl56j7k astryx1717udv astryx1ghz6dp astryxc342km astryxng3xce astryxjbqb8w astryx1ypdohk astryxh6dtrn astryx1a2a7pz astryx1p25gnr astryx1y3gkto"},1:{className:"astryx78zum5 astryx6s0dn4 astryxl56j7k astryx1717udv astryx1ghz6dp astryxc342km astryxng3xce astryxjbqb8w astryxh6dtrn astryx1a2a7pz astryx1p25gnr astryx1y3gkto astryx1h6gzvc"}}[!!i<<0],children:s.jsx(L,{icon:"calendar",size:"sm",color:"secondary"})}),s.jsx("button",{ref:de,id:_,type:"button",onClick:Z,disabled:i,"aria-label":be,"aria-describedby":ye,"aria-required":p===!0?"true":void 0,"aria-invalid":l?.type==="error"?"true":void 0,"aria-busy":b||void 0,"aria-expanded":o.isOpen,"aria-haspopup":"dialog","aria-controls":o.isOpen?o.id:void 0,...{0:{className:"astryx1lliihq astryx98rzlu astryxeuugli astryxc342km astryxng3xce astryx1717udv astryx9ynric astryxjm74w1 astryx6pjikd astryxw6l6zx astryx1tgivj0 astryxjbqb8w astryx1a2a7pz astryx1ypdohk astryx1yc453h astryxuxw1ft astryxb3r6kr astryxlyipyv"},2:{className:"astryx1lliihq astryx98rzlu astryxeuugli astryxc342km astryxng3xce astryx1717udv astryx9ynric astryxjm74w1 astryx6pjikd astryxw6l6zx astryxjbqb8w astryx1a2a7pz astryx1ypdohk astryx1yc453h astryxuxw1ft astryxb3r6kr astryxlyipyv astryxv1l7n4"},1:{className:"astryx1lliihq astryx98rzlu astryxeuugli astryxc342km astryxng3xce astryx1717udv astryx9ynric astryxjm74w1 astryx6pjikd astryxw6l6zx astryx1tgivj0 astryxjbqb8w astryx1a2a7pz astryx1yc453h astryxuxw1ft astryxb3r6kr astryxlyipyv astryx1h6gzvc"},3:{className:"astryx1lliihq astryx98rzlu astryxeuugli astryxc342km astryxng3xce astryx1717udv astryx9ynric astryxjm74w1 astryx6pjikd astryxw6l6zx astryxjbqb8w astryx1a2a7pz astryx1yc453h astryxuxw1ft astryxb3r6kr astryxlyipyv astryxv1l7n4 astryx1h6gzvc"}}[!A<<1|!!i<<0],children:A||E}),te&&c!==null&&!i&&s.jsx("button",{type:"button",onClick:he,"aria-label":`Clear ${e}`,className:"astryx78zum5 astryx6s0dn4 astryxl56j7k astryx1717udv astryx1ghz6dp astryxc342km astryxng3xce astryxjbqb8w astryx1ypdohk astryxh6dtrn astryx1a2a7pz astryx1p25gnr astryx1y3gkto",children:s.jsx(L,{icon:"close",size:"sm",color:"secondary"})}),b&&s.jsx(Se,{size:"sm"}),l&&s.jsx(L,{icon:ge[l.type],size:"md",color:pe[l.type]})]}),o.render(s.jsxs("div",{className:"astryx78zum5",children:[$&&$.length>0&&s.jsx("div",{role:"group","aria-label":"Preset date ranges",className:"astryx78zum5 astryxdt5ytf astryxzye2dw astryx1b2ylru astryx1pcaw5z astryx32b0ac astryxdz7fjg astryx1d77m7x",children:$.map(u=>{const ve=u.getRange(),J=$e(c,ve);return s.jsx("button",{type:"button","aria-current":J?"true":void 0,onClick:()=>xe(u),...{0:{className:"astryx1lliihq astryxh8yej3 astryxtozwh astryx1ghz6dp astryxc342km astryxng3xce astryxh6dtrn astryxjbqb8w astryxe9uy6x astryx9ynric astryxjm74w1 astryxw6l6zx astryx1tgivj0 astryx1ypdohk astryx1yc453h astryx1a2a7pz astryx1p25gnr"},1:{className:"astryx1lliihq astryxh8yej3 astryxtozwh astryx1ghz6dp astryxc342km astryxng3xce astryxh6dtrn astryx9ynric astryxjm74w1 astryxw6l6zx astryx1ypdohk astryx1yc453h astryx1a2a7pz astryx1p25gnr astryxgcxg3y astryxqwr325"}}[!!J<<0],children:u.label},u.label)})}),s.jsx(Oe,{mode:"range",value:c??void 0,onChange:me,min:X,max:ee,dateConstraints:ae,numberOfMonths:ne})]}),{placement:"below",alignment:"start"})]})}n.displayName="DateRangeInput";n.__docgenInfo={description:`A date range picker with a button trigger that opens a popover
containing a dual-month calendar and optional preset ranges.

@example
\`\`\`
<DateRangeInput
  label="Date range"
  value={range}
  onChange={setRange}
  presets={[
    { label: "Last 7 days", getRange: () => ({start: "...", end: "..."}) },
  ]}
/>
\`\`\``,methods:[],displayName:"DateRangeInput",props:{ref:{required:!1,tsType:{name:"ReactRef",raw:"React.Ref<HTMLButtonElement>",elements:[{name:"HTMLButtonElement"}]},description:"Ref forwarded to the trigger button"},label:{required:!0,tsType:{name:"string"},description:"Label text for the input (required for accessibility)."},isLabelHidden:{required:!1,tsType:{name:"boolean"},description:`Whether to visually hide the label (still accessible to screen readers).
@default false`,defaultValue:{value:"false",computed:!1}},description:{required:!1,tsType:{name:"string"},description:"Description text displayed between the label and input."},isOptional:{required:!1,tsType:{name:"boolean"},description:`Whether the field is optional. Mutually exclusive with isRequired.
@default false`,defaultValue:{value:"false",computed:!1}},isRequired:{required:!1,tsType:{name:"boolean"},description:`Whether the field is required. Mutually exclusive with isOptional.
@default false`,defaultValue:{value:"false",computed:!1}},isDisabled:{required:!1,tsType:{name:"boolean"},description:`Whether the input is disabled.
@default false`,defaultValue:{value:"false",computed:!1}},value:{required:!0,tsType:{name:"union",raw:"DateRange | null",elements:[{name:"DateRange"},{name:"null"}]},description:"The selected date range, or null if no range is selected."},onChange:{required:!0,tsType:{name:"signature",type:"function",raw:"(value: DateRange | null) => void",signature:{arguments:[{type:{name:"union",raw:"DateRange | null",elements:[{name:"DateRange"},{name:"null"}]},name:"value"}],return:{name:"void"}}},description:`Callback fired when the date range changes.
Called with null when the range is cleared.`},changeAction:{required:!1,tsType:{name:"signature",type:"function",raw:"(value: DateRange | null) => void | Promise<void>",signature:{arguments:[{type:{name:"union",raw:"DateRange | null",elements:[{name:"DateRange"},{name:"null"}]},name:"value"}],return:{name:"union",raw:"void | Promise<void>",elements:[{name:"void"},{name:"Promise",elements:[{name:"void"}],raw:"Promise<void>"}]}}},description:"Async action on change. Fires after onChange."},isLoading:{required:!1,tsType:{name:"boolean"},description:`Whether the input is in a loading state.
@default false`,defaultValue:{value:"false",computed:!1}},min:{required:!1,tsType:{name:"literal",value:"`${number}${number}${number}${number}-${number}${number}-${number}${number}`"},description:"Minimum selectable date in ISO format."},max:{required:!1,tsType:{name:"literal",value:"`${number}${number}${number}${number}-${number}${number}-${number}${number}`"},description:"Maximum selectable date in ISO format."},dateConstraints:{required:!1,tsType:{name:"ReadonlyArray",elements:[{name:"signature",type:"function",raw:"(date: Date) => boolean",signature:{arguments:[{type:{name:"Date"},name:"date"}],return:{name:"boolean"}}}],raw:"ReadonlyArray<(date: Date) => boolean>"},description:`Custom date constraint functions.
A date is disabled if ANY function returns false.`},presets:{required:!1,tsType:{name:"ReadonlyArray",elements:[{name:"DateRangePreset"}],raw:"ReadonlyArray<DateRangePreset>"},description:"Preset date ranges shown as quick-select options beside the calendar."},hasClear:{required:!1,tsType:{name:"boolean"},description:`Whether to show a clear button when a range is selected.
@default true`,defaultValue:{value:"true",computed:!1}},placeholder:{required:!1,tsType:{name:"string"},description:`Placeholder text shown when no range is selected.
@default "Select date range"`,defaultValue:{value:"'Select date range'",computed:!1}},size:{required:!1,tsType:{name:"union",raw:"'sm' | 'md' | 'lg'",elements:[{name:"literal",value:"'sm'"},{name:"literal",value:"'md'"},{name:"literal",value:"'lg'"}]},description:`The size of the trigger.
@default 'md'`},status:{required:!1,tsType:{name:"InputStatus"},description:"Status indicator for the input."},width:{required:!1,tsType:{name:"union",raw:"number | string",elements:[{name:"number"},{name:"string"}]},description:"Width of the field. Numbers are treated as pixels, strings are used as-is\n(e.g. `'100%'`). Sizes the whole field (label, control, and status) so they\nstay aligned, unlike setting width via `xstyle`/`className`/`style`."},labelTooltip:{required:!1,tsType:{name:"string"},description:"Tooltip text to display in an info icon at the end of the label."},numberOfMonths:{required:!1,tsType:{name:"union",raw:"1 | 2",elements:[{name:"literal",value:"1"},{name:"literal",value:"2"}]},description:`Number of months to display in the calendar.
@default 2`,defaultValue:{value:"2",computed:!1}}},composes:["Omit"]};function x(e){const a=new Date;return a.setDate(a.getDate()-e),a.toISOString().slice(0,10)}function y(){return new Date().toISOString().slice(0,10)}function Pe(){const e=new Date;return e.setDate(1),e.toISOString().slice(0,10)}const N=[{label:"Last 1 day",getRange:()=>({start:x(1),end:y()})},{label:"Last 3 days",getRange:()=>({start:x(3),end:y()})},{label:"Last 7 days",getRange:()=>({start:x(7),end:y()})},{label:"Last 14 days",getRange:()=>({start:x(14),end:y()})},{label:"Last 30 days",getRange:()=>({start:x(30),end:y()})},{label:"This month",getRange:()=>({start:Pe(),end:y()})}],Ye={title:"Core/DateRangeInput",component:n,tags:["autodocs"],argTypes:{label:{control:"text",description:"Label text (required)"},isLabelHidden:{control:"boolean",description:"Visually hide the label"},placeholder:{control:"text",description:"Placeholder text"},description:{control:"text",description:"Description text"},isOptional:{control:"boolean",description:"Show optional indicator"},isRequired:{control:"boolean",description:"Mark as required"},isDisabled:{control:"boolean",description:"Disable the picker"},size:{control:"radio",options:["sm","md","lg"]},hasClear:{control:"boolean",description:"Show clear button"},numberOfMonths:{control:"radio",options:[1,2],description:"Calendar months"}}},f={render:e=>{const[a,t]=r.useState(null);return s.jsx(n,{...e,value:a,onChange:t})},args:{label:"Date range"}},S={render:e=>{const[a,t]=r.useState({start:"2026-03-10",end:"2026-03-20"});return s.jsx(n,{...e,value:a,onChange:t})},args:{label:"Report period"}},D={render:e=>{const[a,t]=r.useState(null);return s.jsx(n,{...e,value:a,onChange:t})},args:{label:"Date range",presets:N}},R={render:e=>{const[a,t]=r.useState({start:x(7),end:y()});return s.jsx(n,{...e,value:a,onChange:t})},args:{label:"Analytics period",presets:N}},C={render:e=>{const[a,t]=r.useState(null);return s.jsx(n,{...e,value:a,onChange:t})},args:{label:"Coverage period",description:"Select the start and end dates for the report"}},w={render:e=>{const[a,t]=r.useState(null);return s.jsx(n,{...e,value:a,onChange:t})},args:{label:"Booking dates",min:"2026-03-01",max:"2026-06-30",description:"Available: Mar 1 – Jun 30, 2026"}},V={render:e=>{const[a,t]=r.useState(null);return s.jsx(n,{...e,value:a,onChange:t})},args:{label:"Filter by date",isOptional:!0}},j={render:e=>{const[a,t]=r.useState(null);return s.jsx(n,{...e,value:a,onChange:t})},args:{label:"Coverage period",isRequired:!0}},I={render:e=>{const[a,t]=r.useState({start:"2026-03-10",end:"2026-03-20"});return s.jsx(n,{...e,value:a,onChange:t})},args:{label:"Locked range",isDisabled:!0}},z={render:()=>{const[e,a]=r.useState(null),[t,g]=r.useState(null),[p,d]=r.useState(null);return s.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"16px",maxWidth:"340px"},children:[s.jsx(n,{label:"Small (28px)",value:e,onChange:a,size:"sm"}),s.jsx(n,{label:"Medium (32px)",value:t,onChange:g,size:"md"}),s.jsx(n,{label:"Large (36px)",value:p,onChange:d,size:"lg"})]})}},k={render:e=>{const[a,t]=r.useState(null);return s.jsx(n,{...e,value:a,onChange:t})},args:{label:"Date range",numberOfMonths:1}},q={render:e=>{const[a,t]=r.useState(null);return s.jsx(n,{...e,value:a,onChange:t})},args:{label:"Date range",status:{type:"error",message:"Please select a date range"}}},O={render:e=>{const[a,t]=r.useState({start:"2026-03-01",end:"2026-06-30"});return s.jsx(n,{...e,value:a,onChange:t})},args:{label:"Date range",status:{type:"warning",message:"Range exceeds 90 days"}}},T={render:e=>{const[a,t]=r.useState({start:"2026-03-10",end:"2026-03-20"});return s.jsx(n,{...e,value:a,onChange:t})},args:{label:"Required range",hasClear:!1}},W={render:()=>{const[e,a]=r.useState(null),[t,g]=r.useState({start:"2026-03-10",end:"2026-03-20"}),[p,d]=r.useState(null),[c,v]=r.useState({start:"2026-03-10",end:"2026-03-20"}),[h,M]=r.useState(null);return s.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"16px",maxWidth:"340px"},children:[s.jsx(n,{label:"Default",value:e,onChange:a}),s.jsx(n,{label:"With value",value:t,onChange:g}),s.jsx(n,{label:"With presets",value:p,onChange:d,presets:N}),s.jsx(n,{label:"Disabled",isDisabled:!0,value:c,onChange:v}),s.jsx(n,{label:"With error",value:h,onChange:M,status:{type:"error",message:"Date range is required"}})]})}};f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<DateRange | null>(null);
    return <DateRangeInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Date range'
  }
}`,...f.parameters?.docs?.source}}};S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
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
}`,...S.parameters?.docs?.source}}};D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<DateRange | null>(null);
    return <DateRangeInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Date range',
    presets: defaultPresets
  }
}`,...D.parameters?.docs?.source}}};R.parameters={...R.parameters,docs:{...R.parameters?.docs,source:{originalSource:`{
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
}`,...R.parameters?.docs?.source}}};C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<DateRange | null>(null);
    return <DateRangeInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Coverage period',
    description: 'Select the start and end dates for the report'
  }
}`,...C.parameters?.docs?.source}}};w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
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
}`,...w.parameters?.docs?.source}}};V.parameters={...V.parameters,docs:{...V.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<DateRange | null>(null);
    return <DateRangeInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Filter by date',
    isOptional: true
  }
}`,...V.parameters?.docs?.source}}};j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<DateRange | null>(null);
    return <DateRangeInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Coverage period',
    isRequired: true
  }
}`,...j.parameters?.docs?.source}}};I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{
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
}`,...I.parameters?.docs?.source}}};z.parameters={...z.parameters,docs:{...z.parameters?.docs,source:{originalSource:`{
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
}`,...z.parameters?.docs?.source}}};k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<DateRange | null>(null);
    return <DateRangeInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Date range',
    numberOfMonths: 1
  }
}`,...k.parameters?.docs?.source}}};q.parameters={...q.parameters,docs:{...q.parameters?.docs,source:{originalSource:`{
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
}`,...q.parameters?.docs?.source}}};O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
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
}`,...O.parameters?.docs?.source}}};T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
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
}`,...T.parameters?.docs?.source}}};W.parameters={...W.parameters,docs:{...W.parameters?.docs,source:{originalSource:`{
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
}`,...W.parameters?.docs?.source}}};const Ke=["Default","WithValue","WithPresets","WithPresetsAndValue","WithDescription","WithMinMax","Optional","Required","Disabled","SizeVariants","SingleMonth","WithErrorStatus","WithWarningStatus","NoClear","AllVariations"];export{W as AllVariations,f as Default,I as Disabled,T as NoClear,V as Optional,j as Required,k as SingleMonth,z as SizeVariants,C as WithDescription,q as WithErrorStatus,w as WithMinMax,D as WithPresets,R as WithPresetsAndValue,S as WithValue,O as WithWarningStatus,Ke as __namedExportsOrder,Ye as default};
