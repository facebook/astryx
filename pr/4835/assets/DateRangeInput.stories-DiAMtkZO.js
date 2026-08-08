import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{t}from"./react-BZJXY1be.js";import{n,t as r}from"./stylex-Dft6gtPK.js";import{A as i,_ as a,h as o,i as s,r as c,u as l}from"./plainDate-DXbeuWIy.js";import{n as u,t as d}from"./Theme-os0aoGDw.js";import{n as ee}from"./mergeProps-JRyAvMxc.js";import{n as f,t as p}from"./themeProps-CREkzZh6.js";import{t as m}from"./jsx-runtime-DeHZSEgm.js";import{n as te,t as h}from"./useTooltip-Cm0gpSWG.js";import{a as g,o as _}from"./useTheme-CAaDofyu.js";import{n as v,t as ne}from"./Spinner-CzifdOpC.js";import{n as y,r as re}from"./SizeContext-Dp2usO2O.js";import{n as ie,t as b}from"./useTranslator-BMnme3me.js";import{n as x,t as ae}from"./Icon-C24cO4CC.js";import{n as oe,t as S}from"./usePopover-DPO-mU50.js";import{n as se,t as ce}from"./useInputStatusIcon-B91OOy9G.js";import{n as le,t as ue}from"./Calendar-C12CvkH4.js";import{n as de,t as fe}from"./Field-DZ-q02Vq.js";import{a as pe,i as me,n as he,r as ge,t as _e}from"./inputStyles.stylex-Crlb5thk.js";function ve(e){if(!e)return``;let t=a(e.start),n=a(e.end),r=i().year,l=t.year===n.year&&t.year===r?c:s;return`${o(t,l)} – ${o(n,l)}`}function ye(e,t){return e===t?!0:!e||!t?!1:e.start===t.start&&e.end===t.end}function C({label:e,isLabelHidden:t=!1,description:r,isOptional:i=!1,isRequired:a=!1,isDisabled:o=!1,disabledMessage:s,value:c,onChange:l,changeAction:u,isLoading:d=!1,min:p,max:m,dateConstraints:h,presets:g,hasClear:_=!0,placeholder:v,size:y,status:b,statusVariant:x=`attached`,labelTooltip:S,numberOfMonths:ce=2,weekStartsOn:le,width:de,xstyle:_e,className:C,style:D,ref:O,...k}){let A=ie(),j=v??A(`@astryx.dateRangeInput.placeholder`),M=re(y,`md`),N=(0,w.useId)(),P=(0,w.useId)(),F=(0,w.useId)(),[,I]=(0,w.useTransition)(),[L,R]=(0,w.useOptimistic)(c),z=d||L!==c,B=o||z,V=o&&!!s,H=te({placement:`above`,focusTrigger:`always`,isEnabled:V}),{statusIcon:U,describedBy:W}=se({status:b,statusVariant:x}),G=[r?P:null,x!==`tooltip`&&b?.message?F:null,W,V?H.describedBy:null].filter(Boolean).join(` `)||void 0,K=(0,w.useMemo)(()=>ve(L),[L]),q=oe({dialogLabel:A(`@astryx.dateRangeInput.dialogLabel`),closeButtonLabel:A(`@astryx.dateInput.closeCalendar`)}),J=(0,w.useCallback)(e=>{z||(l(e),u&&I(async()=>{R(e),await u(e)}))},[z,l,u,I,R]),Y=(0,w.useCallback)(()=>{B||(q.isOpen?q.hide():q.show())},[B,q]),X=(0,w.useCallback)(e=>{J(e),q.hide()},[J,q]),Z=(0,w.useCallback)(e=>{J(e.getRange()),q.hide()},[J,q]),Q=(0,w.useCallback)(e=>{e.stopPropagation(),J(null)},[J]),$=c?`${e}: ${K}`:`${e}: ${j}`;return(0,T.jsxs)(fe,{label:e,isLabelHidden:t,description:r,inputID:N,descriptionID:r?P:void 0,isOptional:i,isRequired:a,isDisabled:B,status:b?{type:b.type,message:b.message,messageID:b.message?F:void 0}:void 0,statusVariant:x,labelTooltip:S,width:de,children:[(0,T.jsxs)(`div`,{ref:e=>{q.triggerRef(e),H.ref(e)},...k,...ee(f(`date-range-input`,{size:M,status:b?.type??null,disabled:o?`disabled`:null}),n(pe.base,E[M],B&&pe.disabled,b&&he[b.type],b&&!B&&me[b.type],b&&ge[b.type],_e),C,D),children:[(0,T.jsx)(`button`,{type:`button`,onClick:Y,disabled:B,"aria-label":q.isOpen?A(`@astryx.dateInput.toggleCalendarClose`):A(`@astryx.dateInput.openCalendar`),tabIndex:-1,...{0:{className:`astryx78zum5 astryx6s0dn4 astryxl56j7k astryx1717udv astryx1ghz6dp astryxc342km astryxng3xce astryxjbqb8w astryx1ypdohk astryxh6dtrn astryx1a2a7pz astryx1p25gnr astryx1y3gkto`},1:{className:`astryx78zum5 astryx6s0dn4 astryxl56j7k astryx1717udv astryx1ghz6dp astryxc342km astryxng3xce astryxjbqb8w astryxh6dtrn astryx1a2a7pz astryx1p25gnr astryx1y3gkto astryx1h6gzvc`}}[!!B<<0],children:(0,T.jsx)(ae,{icon:`calendar`,size:`sm`,color:`secondary`,...f(`date-range-input-toggle-icon`,{state:q.isOpen?`expanded`:`collapsed`})})}),(0,T.jsx)(`button`,{ref:O,id:N,type:`button`,onClick:Y,disabled:B&&!V,"aria-disabled":V?`true`:void 0,"aria-label":$,"aria-describedby":G,"aria-required":a===!0?`true`:void 0,"aria-invalid":b?.type===`error`?`true`:void 0,"aria-busy":z||void 0,"aria-expanded":q.isOpen,"aria-haspopup":`dialog`,"aria-controls":q.isOpen?q.id:void 0,...{0:{className:`astryx1lliihq astryx98rzlu astryxeuugli astryxc342km astryxng3xce astryx1717udv astryx9ynric astryxjm74w1 astryx6pjikd astryxw6l6zx astryx1tgivj0 astryxjbqb8w astryx1a2a7pz astryx1ypdohk astryx1yc453h astryxuxw1ft astryxb3r6kr astryxlyipyv`},2:{className:`astryx1lliihq astryx98rzlu astryxeuugli astryxc342km astryxng3xce astryx1717udv astryx9ynric astryxjm74w1 astryx6pjikd astryxw6l6zx astryxjbqb8w astryx1a2a7pz astryx1ypdohk astryx1yc453h astryxuxw1ft astryxb3r6kr astryxlyipyv astryxv1l7n4`},1:{className:`astryx1lliihq astryx98rzlu astryxeuugli astryxc342km astryxng3xce astryx1717udv astryx9ynric astryxjm74w1 astryx6pjikd astryxw6l6zx astryx1tgivj0 astryxjbqb8w astryx1a2a7pz astryx1yc453h astryxuxw1ft astryxb3r6kr astryxlyipyv astryx1h6gzvc`},3:{className:`astryx1lliihq astryx98rzlu astryxeuugli astryxc342km astryxng3xce astryx1717udv astryx9ynric astryxjm74w1 astryx6pjikd astryxw6l6zx astryxjbqb8w astryx1a2a7pz astryx1yc453h astryxuxw1ft astryxb3r6kr astryxlyipyv astryxv1l7n4 astryx1h6gzvc`}}[!K<<1|!!B<<0],children:K||j}),_&&c!==null&&!B&&(0,T.jsx)(`button`,{type:`button`,onClick:Q,"aria-label":A(`@astryx.dateInput.clear`,{label:e}),className:`astryx78zum5 astryx6s0dn4 astryxl56j7k astryx1717udv astryx1ghz6dp astryxc342km astryxng3xce astryxjbqb8w astryx1ypdohk astryxh6dtrn astryx1a2a7pz astryx1p25gnr astryx1y3gkto`,children:(0,T.jsx)(ae,{icon:`close`,size:`sm`,color:`secondary`,...f(`date-range-input-clear-icon`)})}),z&&(0,T.jsx)(ne,{size:`sm`}),U]}),q.render((0,T.jsxs)(`div`,{className:`astryx78zum5`,children:[g&&g.length>0&&(0,T.jsx)(`div`,{role:`group`,"aria-label":A(`@astryx.dateRangeInput.presetDateRanges`),className:`astryx78zum5 astryxdt5ytf astryxzye2dw astryx1b2ylru astryxw8tdv1 astryx18b5jzi astryxl0t3rv astryx1d77m7x`,children:g.map(e=>{let t=ye(c,e.getRange());return(0,T.jsx)(`button`,{type:`button`,"aria-current":t?`true`:void 0,onClick:()=>Z(e),...{0:{className:`astryx1lliihq astryxh8yej3 astryxtozwh astryx1ghz6dp astryxc342km astryxng3xce astryxh6dtrn astryxjbqb8w astryxe9uy6x astryx9ynric astryxcr08ib astryx1kq96og astryx1tgivj0 astryx1ypdohk astryx1yc453h astryx1a2a7pz astryx1p25gnr`},1:{className:`astryx1lliihq astryxh8yej3 astryxtozwh astryx1ghz6dp astryxc342km astryxng3xce astryxh6dtrn astryx9ynric astryxcr08ib astryx1kq96og astryx1ypdohk astryx1yc453h astryx1a2a7pz astryx1p25gnr astryxgcxg3y astryxqwr325`}}[!!t<<0],children:e.label},e.label)})}),(0,T.jsx)(ue,{mode:`range`,value:c??void 0,onChange:X,min:p,max:m,dateConstraints:h,numberOfMonths:ce,weekStartsOn:le})]}),{placement:`below`,alignment:`start`}),V&&H.renderTooltip(s)]})}var w,T,E;function D(){return(D=e((()=>{w=t(),r(),l(),de(),_e(),x(),v(),le(),S(),h(),y(),ce(),p(),b(),T=m(),E={sm:{kZKoxP:`astryx6k0iem`,k7Eaqz:`astryxfb3i0g`,$$css:!0},md:{kZKoxP:`astryx1ueg155`,k7Eaqz:`astryxfb3i0g`,$$css:!0},lg:{kZKoxP:`astryxssyfek`,k7Eaqz:`astryxfb3i0g`,$$css:!0}},C.displayName=`DateRangeInput`,C.__docgenInfo={description:`A date range picker with a button trigger that opens a popover
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
\`\`\``,methods:[],displayName:`DateRangeInput`,props:{ref:{required:!1,tsType:{name:`ReactRef`,raw:`React.Ref<HTMLButtonElement>`,elements:[{name:`HTMLButtonElement`}]},description:`Ref forwarded to the trigger button`},label:{required:!0,tsType:{name:`string`},description:`Label text for the input (required for accessibility).`},isLabelHidden:{required:!1,tsType:{name:`boolean`},description:`Whether to visually hide the label (still accessible to screen readers).
@default false`,defaultValue:{value:`false`,computed:!1}},description:{required:!1,tsType:{name:`string`},description:`Description text displayed between the label and input.`},isOptional:{required:!1,tsType:{name:`boolean`},description:`Whether the field is optional. Mutually exclusive with isRequired.
@default false`,defaultValue:{value:`false`,computed:!1}},isRequired:{required:!1,tsType:{name:`boolean`},description:`Whether the field is required. Mutually exclusive with isOptional.
@default false`,defaultValue:{value:`false`,computed:!1}},isDisabled:{required:!1,tsType:{name:`boolean`},description:`Whether the input is disabled.
@default false`,defaultValue:{value:`false`,computed:!1}},disabledMessage:{required:!1,tsType:{name:`string`},description:`Explains why the input is disabled. When set together with
\`isDisabled\`, the input shows a tooltip with this text on hover and
keyboard focus, and the trigger stays focusable (via \`aria-disabled\`)
so the reason is discoverable by keyboard and assistive technology.
Activation stays blocked.

Use this instead of wrapping a disabled input in \`Tooltip\` — disabled
controls don't emit the pointer events an external tooltip needs.

@example
\`\`\`
<DateRangeInput
  label="Reporting period"
  value={range}
  onChange={setRange}
  isDisabled
  disabledMessage="You need the Editor role to change this"
/>
\`\`\``},value:{required:!0,tsType:{name:`union`,raw:`DateRange | null`,elements:[{name:`DateRange`},{name:`null`}]},description:`The selected date range, or null if no range is selected.`},onChange:{required:!0,tsType:{name:`signature`,type:`function`,raw:`(value: DateRange | null) => void`,signature:{arguments:[{type:{name:`union`,raw:`DateRange | null`,elements:[{name:`DateRange`},{name:`null`}]},name:`value`}],return:{name:`void`}}},description:`Callback fired when the date range changes.
Called with null when the range is cleared.`},changeAction:{required:!1,tsType:{name:`signature`,type:`function`,raw:`(value: DateRange | null) => void | Promise<void>`,signature:{arguments:[{type:{name:`union`,raw:`DateRange | null`,elements:[{name:`DateRange`},{name:`null`}]},name:`value`}],return:{name:`union`,raw:`void | Promise<void>`,elements:[{name:`void`},{name:`Promise`,elements:[{name:`void`}],raw:`Promise<void>`}]}}},description:`Async action on change. Fires after onChange.`},isLoading:{required:!1,tsType:{name:`boolean`},description:`Whether the input is in a loading state.
@default false`,defaultValue:{value:`false`,computed:!1}},min:{required:!1,tsType:{name:`literal`,value:"`${number}${number}${number}${number}-${number}${number}-${number}${number}`"},description:`Minimum selectable date in ISO format.`},max:{required:!1,tsType:{name:`literal`,value:"`${number}${number}${number}${number}-${number}${number}-${number}${number}`"},description:`Maximum selectable date in ISO format.`},dateConstraints:{required:!1,tsType:{name:`ReadonlyArray`,elements:[{name:`signature`,type:`function`,raw:`(date: Date) => boolean`,signature:{arguments:[{type:{name:`Date`},name:`date`}],return:{name:`boolean`}}}],raw:`ReadonlyArray<(date: Date) => boolean>`},description:`Custom date constraint functions.
A date is disabled if ANY function returns false.`},presets:{required:!1,tsType:{name:`ReadonlyArray`,elements:[{name:`DateRangePreset`}],raw:`ReadonlyArray<DateRangePreset>`},description:`Preset date ranges shown as quick-select options beside the calendar.`},hasClear:{required:!1,tsType:{name:`boolean`},description:`Whether to show a clear button when a range is selected.
@default true`,defaultValue:{value:`true`,computed:!1}},placeholder:{required:!1,tsType:{name:`string`},description:`Placeholder text shown when no range is selected.
@default "Select date range"`},size:{required:!1,tsType:{name:`union`,raw:`'sm' | 'md' | 'lg'`,elements:[{name:`literal`,value:`'sm'`},{name:`literal`,value:`'md'`},{name:`literal`,value:`'lg'`}]},description:`The size of the trigger.
@default 'md'`},status:{required:!1,tsType:{name:`InputStatus`},description:`Status indicator for the input.`},statusVariant:{required:!1,tsType:{name:`FieldStatusVariantMap`},description:`How the status message is placed relative to the input.
- 'attached': message overlaps directly below the input (bordered treatment)
- 'detached': message floats below as a separate element with spacing
- 'tooltip': no message box; the status icon becomes a focusable info-tip button that reveals the message on hover, keyboard focus, or tap
@default 'attached'`,defaultValue:{value:`'attached'`,computed:!1}},width:{required:!1,tsType:{name:`union`,raw:`number | string`,elements:[{name:`number`},{name:`string`}]},description:"Width of the field. Numbers are treated as pixels, strings are used as-is\n(e.g. `'100%'`). Sizes the whole field (label, control, and status) so they\nstay aligned, unlike setting width via `xstyle`/`className`/`style`."},labelTooltip:{required:!1,tsType:{name:`string`},description:`Tooltip text to display in an info icon at the end of the label.`},numberOfMonths:{required:!1,tsType:{name:`union`,raw:`1 | 2`,elements:[{name:`literal`,value:`1`},{name:`literal`,value:`2`}]},description:`Number of months to display in the calendar.
@default 2`,defaultValue:{value:`2`,computed:!1}},weekStartsOn:{required:!1,tsType:{name:`union`,raw:`DayOfWeek | DayOfWeekName`,elements:[{name:`union`,raw:`0 | 1 | 2 | 3 | 4 | 5 | 6`,elements:[{name:`literal`,value:`0`},{name:`literal`,value:`1`},{name:`literal`,value:`2`},{name:`literal`,value:`3`},{name:`literal`,value:`4`},{name:`literal`,value:`5`},{name:`literal`,value:`6`}]},{name:`union`,raw:`| 'sun'
| 'mon'
| 'tue'
| 'wed'
| 'thu'
| 'fri'
| 'sat'`,elements:[{name:`literal`,value:`'sun'`},{name:`literal`,value:`'mon'`},{name:`literal`,value:`'tue'`},{name:`literal`,value:`'wed'`},{name:`literal`,value:`'thu'`},{name:`literal`,value:`'fri'`},{name:`literal`,value:`'sat'`}]}]},description:`First day of week in the calendar. Accepts a number
(0 = Sunday … 6 = Saturday) or a three-letter day name ('sun'–'sat',
case-insensitive).
@default 0`}},composes:[`Omit`]}})))()}function O(e){let t=new Date;return t.setDate(t.getDate()-e),t.toISOString().slice(0,10)}function k(){return new Date().toISOString().slice(0,10)}function A(){let e=new Date;return e.setDate(1),e.toISOString().slice(0,10)}var j,M,N,P,F,I,L,R,z,B,V,H,U,W,G,K,q,J,Y,X,Z,Q,$,be;function xe(){return(xe=e((()=>{j=t(),D(),u(),_(),M=m(),N=[{label:`Last 1 day`,getRange:()=>({start:O(1),end:k()})},{label:`Last 3 days`,getRange:()=>({start:O(3),end:k()})},{label:`Last 7 days`,getRange:()=>({start:O(7),end:k()})},{label:`Last 14 days`,getRange:()=>({start:O(14),end:k()})},{label:`Last 30 days`,getRange:()=>({start:O(30),end:k()})},{label:`This month`,getRange:()=>({start:A(),end:k()})}],P={title:`Core/DateRangeInput`,component:C,tags:[`autodocs`],argTypes:{label:{control:`text`,description:`Label text (required)`},isLabelHidden:{control:`boolean`,description:`Visually hide the label`},placeholder:{control:`text`,description:`Placeholder text`},description:{control:`text`,description:`Description text`},isOptional:{control:`boolean`,description:`Show optional indicator`},isRequired:{control:`boolean`,description:`Mark as required`},isDisabled:{control:`boolean`,description:`Disable the picker`},disabledMessage:{control:`text`,description:`Explains why the input is disabled. With isDisabled, shows a tooltip on hover/keyboard focus and keeps the field focusable via aria-disabled (activation stays blocked). Use this instead of wrapping a disabled DateRangeInput in Tooltip.`},size:{control:`radio`,options:[`sm`,`md`,`lg`]},hasClear:{control:`boolean`,description:`Show clear button`},numberOfMonths:{control:`radio`,options:[1,2],description:`Calendar months`}}},F={render:e=>{let[t,n]=(0,j.useState)(null);return(0,M.jsx)(C,{...e,value:t,onChange:n})},args:{label:`Date range`}},I={render:e=>{let[t,n]=(0,j.useState)({start:`2026-03-10`,end:`2026-03-20`});return(0,M.jsx)(C,{...e,value:t,onChange:n})},args:{label:`Report period`}},L={render:e=>{let[t,n]=(0,j.useState)(null);return(0,M.jsx)(C,{...e,value:t,onChange:n})},args:{label:`Date range`,presets:N}},R={render:e=>{let[t,n]=(0,j.useState)({start:O(7),end:k()});return(0,M.jsx)(C,{...e,value:t,onChange:n})},args:{label:`Analytics period`,presets:N}},z={render:e=>{let[t,n]=(0,j.useState)(null);return(0,M.jsx)(C,{...e,value:t,onChange:n})},args:{label:`Coverage period`,description:`Select the start and end dates for the report`}},B={render:e=>{let[t,n]=(0,j.useState)(null);return(0,M.jsx)(C,{...e,value:t,onChange:n})},args:{label:`Booking dates`,min:`2026-03-01`,max:`2026-06-30`,description:`Available: Mar 1 – Jun 30, 2026`}},V={render:e=>{let[t,n]=(0,j.useState)(null);return(0,M.jsx)(C,{...e,value:t,onChange:n})},args:{label:`Filter by date`,isOptional:!0}},H={render:e=>{let[t,n]=(0,j.useState)(null);return(0,M.jsx)(C,{...e,value:t,onChange:n})},args:{label:`Coverage period`,isRequired:!0}},U={render:e=>{let[t,n]=(0,j.useState)({start:`2026-03-10`,end:`2026-03-20`});return(0,M.jsx)(C,{...e,value:t,onChange:n})},args:{label:`Locked range`,isDisabled:!0}},W={render:e=>{let[t,n]=(0,j.useState)(null);return(0,M.jsx)(C,{...e,value:t,onChange:n})},args:{label:`Reporting period`,isDisabled:!0,disabledMessage:`You need the Editor role to change this`}},G={render:()=>{let[e,t]=(0,j.useState)(null),[n,r]=(0,j.useState)(null),[i,a]=(0,j.useState)(null);return(0,M.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`16px`,maxWidth:`340px`},children:[(0,M.jsx)(C,{label:`Small (28px)`,value:e,onChange:t,size:`sm`}),(0,M.jsx)(C,{label:`Medium (32px)`,value:n,onChange:r,size:`md`}),(0,M.jsx)(C,{label:`Large (36px)`,value:i,onChange:a,size:`lg`})]})}},K={render:e=>{let[t,n]=(0,j.useState)(null);return(0,M.jsx)(C,{...e,value:t,onChange:n})},args:{label:`Date range`,numberOfMonths:1}},q={render:e=>{let[t,n]=(0,j.useState)(null);return(0,M.jsx)(C,{...e,value:t,onChange:n})},args:{label:`Date range`,status:{type:`error`,message:`Please select a date range`}}},J={render:e=>{let[t,n]=(0,j.useState)({start:`2026-03-01`,end:`2026-06-30`});return(0,M.jsx)(C,{...e,value:t,onChange:n})},args:{label:`Date range`,status:{type:`warning`,message:`Range exceeds 90 days`}}},Y={render:e=>{let[t,n]=(0,j.useState)({start:`2026-03-10`,end:`2026-03-20`});return(0,M.jsx)(C,{...e,value:t,onChange:n})},args:{label:`Required range`,hasClear:!1}},X={render:()=>{let[e,t]=(0,j.useState)(null),[n,r]=(0,j.useState)({start:`2026-03-10`,end:`2026-03-20`}),[i,a]=(0,j.useState)(null),[o,s]=(0,j.useState)({start:`2026-03-10`,end:`2026-03-20`}),[c,l]=(0,j.useState)(null);return(0,M.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`16px`,maxWidth:`340px`},children:[(0,M.jsx)(C,{label:`Default`,value:e,onChange:t}),(0,M.jsx)(C,{label:`With value`,value:n,onChange:r}),(0,M.jsx)(C,{label:`With presets`,value:i,onChange:a,presets:N}),(0,M.jsx)(C,{label:`Disabled`,isDisabled:!0,value:o,onChange:s}),(0,M.jsx)(C,{label:`With error`,value:c,onChange:l,status:{type:`error`,message:`Date range is required`}})]})}},Z={render:()=>{let[e,t]=(0,j.useState)(null),[n,r]=(0,j.useState)(null);return(0,M.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:24,width:320},children:[(0,M.jsx)(C,{label:`Attached (default)`,value:e,onChange:t,status:{type:`error`,message:`Please select a date range`}}),(0,M.jsx)(C,{label:`Detached`,value:n,onChange:r,status:{type:`error`,message:`Please select a date range`},statusVariant:`detached`})]})}},Q=g({name:`date-range-input-icon-demo`,components:{"date-range-input-clear-icon":{base:{width:`12px`,height:`12px`,fontSize:`12px`,color:`var(--color-icon-secondary)`,":hover":{color:`var(--color-accent)`}}},"date-range-input-toggle-icon":{base:{width:`14px`,height:`14px`,fontSize:`14px`,color:`var(--color-accent)`}}}}),$={render:()=>{let[e,t]=(0,j.useState)({start:O(7),end:k()});return(0,M.jsx)(d,{theme:Q,mode:`light`,children:(0,M.jsx)(`div`,{style:{width:320},children:(0,M.jsx)(C,{label:`Icons themed (12px clear w/ hover, 14px accent toggle)`,value:e,onChange:t,hasClear:!0})})})}},F.parameters={...F.parameters,docs:{...F.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<DateRange | null>(null);
    return <DateRangeInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Date range'
  }
}`,...F.parameters?.docs?.source}}},I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{
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
}`,...I.parameters?.docs?.source}}},L.parameters={...L.parameters,docs:{...L.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<DateRange | null>(null);
    return <DateRangeInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Date range',
    presets: defaultPresets
  }
}`,...L.parameters?.docs?.source}}},R.parameters={...R.parameters,docs:{...R.parameters?.docs,source:{originalSource:`{
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
}`,...R.parameters?.docs?.source}}},z.parameters={...z.parameters,docs:{...z.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<DateRange | null>(null);
    return <DateRangeInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Coverage period',
    description: 'Select the start and end dates for the report'
  }
}`,...z.parameters?.docs?.source}}},B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
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
}`,...B.parameters?.docs?.source}}},V.parameters={...V.parameters,docs:{...V.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<DateRange | null>(null);
    return <DateRangeInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Filter by date',
    isOptional: true
  }
}`,...V.parameters?.docs?.source}}},H.parameters={...H.parameters,docs:{...H.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<DateRange | null>(null);
    return <DateRangeInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Coverage period',
    isRequired: true
  }
}`,...H.parameters?.docs?.source}}},U.parameters={...U.parameters,docs:{...U.parameters?.docs,source:{originalSource:`{
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
}`,...U.parameters?.docs?.source}}},W.parameters={...W.parameters,docs:{...W.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<DateRange | null>(null);
    return <DateRangeInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Reporting period',
    isDisabled: true,
    disabledMessage: 'You need the Editor role to change this'
  }
}`,...W.parameters?.docs?.source}}},G.parameters={...G.parameters,docs:{...G.parameters?.docs,source:{originalSource:`{
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
}`,...G.parameters?.docs?.source}}},K.parameters={...K.parameters,docs:{...K.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<DateRange | null>(null);
    return <DateRangeInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Date range',
    numberOfMonths: 1
  }
}`,...K.parameters?.docs?.source}}},q.parameters={...q.parameters,docs:{...q.parameters?.docs,source:{originalSource:`{
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
}`,...q.parameters?.docs?.source}}},J.parameters={...J.parameters,docs:{...J.parameters?.docs,source:{originalSource:`{
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
}`,...J.parameters?.docs?.source}}},Y.parameters={...Y.parameters,docs:{...Y.parameters?.docs,source:{originalSource:`{
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
}`,...Y.parameters?.docs?.source}}},X.parameters={...X.parameters,docs:{...X.parameters?.docs,source:{originalSource:`{
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
}`,...X.parameters?.docs?.source}}},Z.parameters={...Z.parameters,docs:{...Z.parameters?.docs,source:{originalSource:`{
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
}`,...Z.parameters?.docs?.source}}},$.parameters={...$.parameters,docs:{...$.parameters?.docs,source:{originalSource:`{
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
}`,...$.parameters?.docs?.source}}},be=[`Default`,`WithValue`,`WithPresets`,`WithPresetsAndValue`,`WithDescription`,`WithMinMax`,`Optional`,`Required`,`Disabled`,`DisabledWithMessage`,`SizeVariants`,`SingleMonth`,`WithErrorStatus`,`WithWarningStatus`,`NoClear`,`AllVariations`,`StatusVariantComparison`,`ThemedIcons`]})))()}xe();export{X as AllVariations,F as Default,U as Disabled,W as DisabledWithMessage,Y as NoClear,V as Optional,H as Required,K as SingleMonth,G as SizeVariants,Z as StatusVariantComparison,$ as ThemedIcons,z as WithDescription,q as WithErrorStatus,B as WithMinMax,L as WithPresets,R as WithPresetsAndValue,I as WithValue,J as WithWarningStatus,be as __namedExportsOrder,P as default};