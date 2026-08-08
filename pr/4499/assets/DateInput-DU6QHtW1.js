import{i as e,s as t}from"./preload-helper-CT_b8DTk.js";import{t as n}from"./react-B7Te67-h.js";import{C as ee,Ct as r,I as te,P as ne,Y as i,bt as a,it as o,lt as re,m as ie,nt as ae,t as s,w as c,wt as oe}from"./utils-MZubekC4.js";import{t as l}from"./jsx-runtime-DqZldVDK.js";import{n as se}from"./useTooltip-CuYgRONG.js";import{n as ce,t as u}from"./Spinner-BLnwKh1q.js";import{n as d,t as f}from"./VisuallyHidden-DDrJpIxj.js";import{n as p,r as le}from"./SizeContext-fcGnTOs5.js";import{n as m,t as h}from"./Icon-DU_v3HYa.js";import{a as ue,t as g}from"./i18n-4GW18Wq_.js";import{n as de}from"./usePopover-DVLjvac7.js";import{t as _}from"./Popover-nUpCmctk.js";import{t as fe}from"./Tooltip-BVuNYEJ9.js";import{n as pe,t as me}from"./useInputStatusIcon-CAhgLcw_.js";import{i as v,n as he,o as ge,t as y}from"./Calendar-CfVRrszt.js";import{t as _e}from"./Field-BpLMLSce.js";import{a as ve,c as b,o as ye,s as be,t as x}from"./Field-WOVNol_j.js";import{a as S,i as xe,n as C,r as Se}from"./InputGroupContext-DfUisVOG.js";function w({label:e,isLabelHidden:t=!1,description:n,isOptional:ee=!1,isRequired:r=!1,isDisabled:o=!1,disabledMessage:s,value:l,onChange:u,changeAction:f,isLoading:p=!1,min:h,max:g,dateConstraints:_,placeholder:fe,size:me,status:v,statusVariant:y=`attached`,labelTooltip:x,hasClear:S=!1,numberOfMonths:C=1,format:w=`date_long`,width:O,xstyle:k,className:Ce,style:we,ref:Te,...Ee}){let A=ue(),De=fe??A(`@astryx.dateInput.placeholder`),j=le(me,`md`),M=(0,T.useId)(),N=(0,T.useId)(),P=(0,T.useId)(),F=(0,T.useId)(),I=(0,T.useRef)(null),L=(0,T.useRef)(null),R=(0,T.useRef)(void 0),z=Se(),[,B]=(0,T.useTransition)(),[V,H]=(0,T.useOptimistic)(l),U=p||V!==l,W=o||U,G=o&&!!s,K=se({placement:`above`,focusTrigger:`always`,isEnabled:G}),{isDateDisabled:q}=ge({min:h,max:g,dateConstraints:_}),{statusIcon:Oe,describedBy:ke}=pe({status:v,statusVariant:y,isInGroup:!!z}),{ariaLabelledBy:Ae,ariaDescribedBy:je}=ie(N,[n?P:null,y!==`tooltip`&&v?.message?F:null,ke,G?K.describedBy:null],z),[J,Y]=(0,T.useState)(null),Me=(0,T.useRef)(l);l!==Me.current&&(Me.current=l,l!==R.current&&(R.current=void 0,J!==null&&Y(null)));let Ne=(0,T.useCallback)(e=>typeof w==`function`?w(e):ae(re(e),w),[w]),Pe=J===null?V&&/^\d{4}-\d{2}-\d{2}$/.test(V)?Ne(V):``:J,X=J===null||!J.trim()?!0:i(J)!==null,Z=de({dialogLabel:A(`@astryx.dateInput.dialogLabel`),closeButtonLabel:A(`@astryx.dateInput.closeCalendar`),onHide:()=>I.current?.focus()}),Fe=(0,T.useCallback)(()=>{W||(Z.isOpen?Z.hide():Z.show())},[W,Z]),Ie=(0,T.useCallback)(()=>{!W&&!Z.isOpen&&Z.show({skipAutoFocus:!0})},[W,Z]),Q=(0,T.useCallback)(e=>{U||(u?.(e),f&&B(async()=>{H(e),await f(e)}))},[U,u,f,B,H]),Le=(0,T.useCallback)(()=>{Q(void 0),I.current?.focus()},[Q]),Re=(0,T.useCallback)(e=>{Q(e),Y(null),Z.hide()},[Q,Z]),ze=(0,T.useCallback)(e=>{if(W)return;let t=e.target.value;Y(t);let n=i(t);if(n&&a(n)!==l&&!q(n)){let e=a(n);R.current=e,Q(e),L.current?.navigateTo(e)}},[l,Q,q,W]),$=(0,T.useCallback)(()=>{if(J===null)return;if(!J.trim()){l!==void 0&&Q(void 0),Y(null);return}let e=i(J);if(e&&!q(e)){let t=a(e);t!==l&&Q(t)}Y(null)},[J,l,Q,q]),Be=(0,T.useCallback)(()=>{$()},[$]),Ve=(0,T.useCallback)(e=>{e.key===`Escape`&&Z.isOpen?(e.preventDefault(),Z.hide()):(e.key===`ArrowDown`||e.altKey&&e.key===`ArrowDown`)&&!Z.isOpen?(e.preventDefault(),W||Z.show({skipAutoFocus:!0})):e.key===`Enter`&&(e.preventDefault(),$())},[Z,$,W]),He=(0,E.jsxs)(`div`,{ref:e=>{Z.triggerRef(e),K.ref(e)},...Ee,...te(c(`date-input`,{size:j,status:v?.type??null}),oe(b.base,D[j],W&&b.disabled,v&&ve[v.type],v&&!W&&be[v.type],v&&ye[v.type],z&&xe.inGroup,k),Ce,we),children:[z&&(0,E.jsx)(d,{id:N,children:e}),(0,E.jsx)(`button`,{type:`button`,onClick:Fe,disabled:W,"aria-label":Z.isOpen?A(`@astryx.dateInput.toggleCalendarClose`):A(`@astryx.dateInput.openCalendar`),...{0:{className:`astryx78zum5 astryx6s0dn4 astryxl56j7k astryx1717udv astryx1ghz6dp astryxc342km astryxng3xce astryxjbqb8w astryx1ypdohk astryxh6dtrn astryx1a2a7pz astryx1p25gnr astryx1y3gkto`},1:{className:`astryx78zum5 astryx6s0dn4 astryxl56j7k astryx1717udv astryx1ghz6dp astryxc342km astryxng3xce astryxjbqb8w astryxh6dtrn astryx1a2a7pz astryx1p25gnr astryx1y3gkto astryx1h6gzvc`}}[!!W<<0],children:(0,E.jsx)(m,{icon:`calendar`,size:`sm`,color:`secondary`,...c(`date-input-toggle-icon`,{state:Z.isOpen?`expanded`:`collapsed`})})}),(0,E.jsx)(`input`,{ref:ne(Te,I),id:M,type:`text`,role:`combobox`,value:Pe,onChange:ze,onBlur:Be,onClick:Ie,onKeyDown:Ve,placeholder:De,disabled:W&&!G,"aria-disabled":G?`true`:void 0,readOnly:G||void 0,"aria-labelledby":Ae,"aria-describedby":je,"aria-required":r===!0?`true`:void 0,"aria-invalid":v?.type===`error`||!X?`true`:void 0,"aria-busy":U||void 0,"aria-expanded":Z.isOpen,"aria-haspopup":`dialog`,"aria-controls":Z.isOpen?Z.id:void 0,"aria-autocomplete":`none`,autoComplete:`off`,...{0:{className:`astryx1lliihq astryx98rzlu astryxeuugli astryxc342km astryxng3xce astryx1717udv astryx9ynric astryxjm74w1 astryx6pjikd astryxw6l6zx astryx1tgivj0 astryxjbqb8w astryx1a2a7pz astryxeyghm5`},2:{className:`astryx1lliihq astryx98rzlu astryxeuugli astryxc342km astryxng3xce astryx1717udv astryx9ynric astryxjm74w1 astryx6pjikd astryxw6l6zx astryx1tgivj0 astryxjbqb8w astryx1a2a7pz astryxeyghm5 astryx1h6gzvc`},1:{className:`astryx1lliihq astryx98rzlu astryxeuugli astryxc342km astryxng3xce astryx1717udv astryx9ynric astryxjm74w1 astryx6pjikd astryxw6l6zx astryxjbqb8w astryx1a2a7pz astryxeyghm5 astryxv1l7n4`},3:{className:`astryx1lliihq astryx98rzlu astryxeuugli astryxc342km astryxng3xce astryx1717udv astryx9ynric astryxjm74w1 astryx6pjikd astryxw6l6zx astryxjbqb8w astryx1a2a7pz astryxeyghm5 astryx1h6gzvc astryxv1l7n4`}}[!!W<<1|!X<<0]}),(0,E.jsx)(d,{as:`div`,role:`alert`,"aria-live":`assertive`,children:X?``:`Invalid date`}),S&&l!==void 0&&!W&&(0,E.jsx)(`button`,{type:`button`,onClick:Le,"aria-label":A(`@astryx.dateInput.clear`,{label:e}),className:`astryx78zum5 astryx6s0dn4 astryxl56j7k astryx1717udv astryx1ghz6dp astryxc342km astryxng3xce astryxjbqb8w astryx1ypdohk astryxh6dtrn astryx1a2a7pz astryx1p25gnr astryx1y3gkto`,children:(0,E.jsx)(m,{icon:`close`,size:`sm`,color:`secondary`,...c(`date-input-clear-icon`)})}),U&&(0,E.jsx)(ce,{size:`sm`}),Oe,Z.render((0,E.jsx)(he,{handleRef:L,mode:`single`,value:V,onChange:Re,min:h,max:g,dateConstraints:_,numberOfMonths:C}),{placement:`below`,alignment:`start`}),G&&K.renderTooltip(s)]});return z?He:(0,E.jsx)(_e,{label:e,isLabelHidden:t,description:n,inputID:M,descriptionID:n?P:void 0,isOptional:ee,isRequired:r,isDisabled:o,status:v?{type:v.type,message:v.message,messageID:v.message?F:void 0}:void 0,statusVariant:y,labelTooltip:x,width:O,children:He})}var T,E,D,O=e((()=>{T=t(n(),1),r(),x(),h(),f(),C(),S(),p(),u(),y(),v(),me(),_(),fe(),s(),o(),E=l(),ee(),g(),D={sm:{kZKoxP:`astryx6k0iem`,k7Eaqz:`astryxfb3i0g`,$$css:!0},md:{kZKoxP:`astryx1ueg155`,k7Eaqz:`astryxfb3i0g`,$$css:!0},lg:{kZKoxP:`astryxssyfek`,k7Eaqz:`astryxfb3i0g`,$$css:!0}},w.displayName=`DateInput`,w.__docgenInfo={description:`A date picker component combining a text input with a calendar popover.

@example
\`\`\`
<DateInput
  label="Event date"
  value={date}
  onChange={setDate}
/>
\`\`\``,methods:[],displayName:`DateInput`,props:{ref:{required:!1,tsType:{name:`ReactRef`,raw:`React.Ref<HTMLInputElement>`,elements:[{name:`HTMLInputElement`}]},description:`Ref forwarded to the root element`},label:{required:!0,tsType:{name:`string`},description:`Label text for the input (required for accessibility).`},isLabelHidden:{required:!1,tsType:{name:`boolean`},description:`Whether to visually hide the label (still accessible to screen readers).
@default false`,defaultValue:{value:`false`,computed:!1}},description:{required:!1,tsType:{name:`string`},description:`Description text displayed between the label and input.`},isOptional:{required:!1,tsType:{name:`boolean`},description:`Whether the field is optional. Mutually exclusive with isRequired.
@default false`,defaultValue:{value:`false`,computed:!1}},isRequired:{required:!1,tsType:{name:`boolean`},description:`Whether the field is required. Mutually exclusive with isOptional.
@default false`,defaultValue:{value:`false`,computed:!1}},isDisabled:{required:!1,tsType:{name:`boolean`},description:`Whether the input is disabled.
@default false`,defaultValue:{value:`false`,computed:!1}},disabledMessage:{required:!1,tsType:{name:`string`},description:`Explains why the input is disabled. When set together with
\`isDisabled\`, the input shows a tooltip with this text on hover and
keyboard focus, and the field stays focusable (via \`aria-disabled\`)
so the reason is discoverable by keyboard and assistive technology.
Typing and calendar activation stay blocked.

Use this instead of wrapping a disabled input in \`Tooltip\` — disabled
controls don't emit the pointer events an external tooltip needs.

@example
\`\`\`
<DateInput
  label="Event date"
  value={date}
  onChange={setDate}
  isDisabled
  disabledMessage="You need the Editor role to change this"
/>
\`\`\``},value:{required:!1,tsType:{name:`literal`,value:"`${number}${number}${number}${number}-${number}${number}-${number}${number}`"},description:`The selected date in ISO format (YYYY-MM-DD).`},onChange:{required:!1,tsType:{name:`signature`,type:`function`,raw:`(value: ISODateString | undefined) => void`,signature:{arguments:[{type:{name:`union`,raw:`ISODateString | undefined`,elements:[{name:`literal`,value:"`${number}${number}${number}${number}-${number}${number}-${number}${number}`"},{name:`undefined`}]},name:`value`}],return:{name:`void`}}},description:`Callback fired when the date changes.
Called with undefined when input is cleared.`},changeAction:{required:!1,tsType:{name:`signature`,type:`function`,raw:`(value: ISODateString | undefined) => void | Promise<void>`,signature:{arguments:[{type:{name:`union`,raw:`ISODateString | undefined`,elements:[{name:`literal`,value:"`${number}${number}${number}${number}-${number}${number}-${number}${number}`"},{name:`undefined`}]},name:`value`}],return:{name:`union`,raw:`void | Promise<void>`,elements:[{name:`void`},{name:`Promise`,elements:[{name:`void`}],raw:`Promise<void>`}]}}},description:`Async action on change. Fires after onChange.`},isLoading:{required:!1,tsType:{name:`boolean`},description:`Whether the input is in a loading state.
@default false`,defaultValue:{value:`false`,computed:!1}},min:{required:!1,tsType:{name:`literal`,value:"`${number}${number}${number}${number}-${number}${number}-${number}${number}`"},description:`Minimum selectable date in ISO format.`},max:{required:!1,tsType:{name:`literal`,value:"`${number}${number}${number}${number}-${number}${number}-${number}${number}`"},description:`Maximum selectable date in ISO format.`},dateConstraints:{required:!1,tsType:{name:`ReadonlyArray`,elements:[{name:`signature`,type:`function`,raw:`(date: Date) => boolean`,signature:{arguments:[{type:{name:`Date`},name:`date`}],return:{name:`boolean`}}}],raw:`ReadonlyArray<(date: Date) => boolean>`},description:`Custom date constraint functions. Date is disabled if ANY function returns false.`},placeholder:{required:!1,tsType:{name:`string`},description:`Placeholder text shown when no date is selected.
@default "Select a date"`},size:{required:!1,tsType:{name:`unknown`},description:`The size of the input.
- 'sm': Compact size (18px height)
- 'md': Default size (26px height)
@default 'md'`},status:{required:!1,tsType:{name:`InputStatus`},description:`Status indicator for the input.
When set, displays a colored border and status icon.
If message is provided, displays below the input.`},statusVariant:{required:!1,tsType:{name:`FieldStatusVariantMap`},description:`How the status message is placed relative to the input.
- 'attached': message overlaps directly below the input (bordered treatment)
- 'detached': message floats below as a separate element with spacing
- 'tooltip': no message box; the status icon becomes a focusable info-tip button that reveals the message on hover, keyboard focus, or tap
@default 'attached'`,defaultValue:{value:`'attached'`,computed:!1}},width:{required:!1,tsType:{name:`union`,raw:`number | string`,elements:[{name:`number`},{name:`string`}]},description:"Width of the field. Numbers are treated as pixels, strings are used as-is\n(e.g. `'100%'`). Sizes the whole field (label, control, and status) so they\nstay aligned, unlike setting width via `xstyle`/`className`/`style`."},labelTooltip:{required:!1,tsType:{name:`string`},description:`Tooltip text to display in an info icon at the end of the label.`},hasClear:{required:!1,tsType:{name:`boolean`},description:`Whether to show a clear button when a date is set.
When clicked, resets the value to undefined and returns focus to the input.
@default false`,defaultValue:{value:`false`,computed:!1}},numberOfMonths:{required:!1,tsType:{name:`union`,raw:`1 | 2`,elements:[{name:`literal`,value:`1`},{name:`literal`,value:`2`}]},description:`Number of months to display in the calendar popover.
@default 1`,defaultValue:{value:`1`,computed:!1}},format:{required:!1,tsType:{name:`union`,raw:`DateInputFormat | ((value: ISODateString) => string)`,elements:[{name:`Extract`,elements:[{name:`union`,raw:`| 'relative'
| 'auto'
| 'date'
| 'date_long'
| 'date_weekday'
| 'date_time'
| 'time'
| 'system_date'
| 'system_date_time'
| 'system_time'`,elements:[{name:`literal`,value:`'relative'`},{name:`literal`,value:`'auto'`},{name:`literal`,value:`'date'`},{name:`literal`,value:`'date_long'`},{name:`literal`,value:`'date_weekday'`},{name:`literal`,value:`'date_time'`},{name:`literal`,value:`'time'`},{name:`literal`,value:`'system_date'`},{name:`literal`,value:`'system_date_time'`},{name:`literal`,value:`'system_time'`}]},{name:`union`,raw:`'date' | 'date_long' | 'date_weekday' | 'system_date'`,elements:[{name:`literal`,value:`'date'`},{name:`literal`,value:`'date_long'`},{name:`literal`,value:`'date_weekday'`},{name:`literal`,value:`'system_date'`}]}],raw:`Extract<
  TimestampFormat,
  'date' | 'date_long' | 'date_weekday' | 'system_date'
>`},{name:`unknown`}]},description:`How the committed date value is displayed in the text field. Accepts a
named format reused from \`Timestamp\`'s \`format\` vocabulary (so the same
literal renders the same date shape in both components) or a function that
maps the ISO value to a custom display string.

- \`'date_long'\` (default): long-month date, e.g. "March 21, 2026"
- \`'date'\`: short-month date, e.g. "Mar 21, 2026"
- \`'date_weekday'\`: short weekday + date, e.g. "Wed, Mar 21, 2026"
- \`'system_date'\`: ISO 8601 calendar date, e.g. "2026-03-21"
- \`(value: ISODateString) => string\`: fully custom display string

Formatting applies only to the committed value — never to text the user is
actively typing. A custom function's output that \`parseDateInput\` cannot
read back can't be re-committed after an edit; external \`value\` changes
always recompute the display from the ISO value.

@default 'date_long'
@example
\`\`\`
<DateInput label="Ship date" value={date} onChange={setDate} format="date" />
<DateInput
  label="Ship date"
  value={date}
  onChange={setDate}
  format={iso => new Date(iso + 'T00:00').toDateString()}
/>
\`\`\``,defaultValue:{value:`'date_long'`,computed:!1}}},composes:[`Omit`]}})),k=e((()=>{O()}));export{w as n,O as r,k as t};