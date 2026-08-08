import{i as e,s as t}from"./preload-helper-CT_b8DTk.js";import{t as n}from"./react-B7Te67-h.js";import{l as r,n as i,t as a,u as ee}from"./themeProps-_oSbOSxB.js";import{E as te,J as ne,O as re,V as o,Z as s,m as ie,nt as ae,pt as c,t as l}from"./utils-HhVKRT_p.js";import{t as u}from"./jsx-runtime-DqZldVDK.js";import{n as oe}from"./useTooltip-B6Z1QLoY.js";import{n as se,t as d}from"./Spinner-DTPP7jJK.js";import{n as f,t as p}from"./VisuallyHidden-DDrJpIxj.js";import{n as m,r as ce}from"./SizeContext-fcGnTOs5.js";import{r as le,t as h}from"./i18n-Cwra07hP.js";import{i as ue,t as g}from"./Icon-hgxDpd-5.js";import{n as de}from"./usePopover-DwQwLrjA.js";import{t as _}from"./Tooltip-CWcS2EBq.js";import{a as fe,i as pe}from"./hooks-CgzVdeyr.js";import{t as me}from"./Popover-Ddtoat9R.js";import{i as v,n as he,o as ge,t as y}from"./Calendar-Vj1u7Www.js";import{t as _e}from"./Field-BdPTwYic.js";import{a as ve,c as ye,l as b,s as be,t as x}from"./Field-DT3mMFI3.js";import{a as S,i as xe,n as C,r as Se}from"./InputGroupContext-DfUisVOG.js";function w({label:e,isLabelHidden:t=!1,description:n,isOptional:r=!1,isRequired:a=!1,isDisabled:s=!1,disabledMessage:l,value:u,onChange:d,changeAction:p,isLoading:m=!1,min:h,max:g,dateConstraints:_,placeholder:pe,size:me,status:v,statusVariant:y=`attached`,labelTooltip:x,hasClear:S=!1,numberOfMonths:C=1,format:w=`date_long`,width:O,xstyle:k,className:Ce,style:we,ref:Te,...Ee}){let A=le(),De=pe??A(`@astryx.dateInput.placeholder`),j=ce(me,`md`),M=(0,T.useId)(),N=(0,T.useId)(),P=(0,T.useId)(),F=(0,T.useId)(),I=(0,T.useRef)(null),L=(0,T.useRef)(null),R=(0,T.useRef)(void 0),z=Se(),[,B]=(0,T.useTransition)(),[V,Oe]=(0,T.useOptimistic)(u),H=m||V!==u,U=s||H,W=s&&!!l,G=oe({placement:`above`,focusTrigger:`always`,isEnabled:W}),{isDateDisabled:K}=ge({min:h,max:g,dateConstraints:_}),{statusIcon:ke,describedBy:Ae}=fe({status:v,statusVariant:y,isInGroup:!!z}),{ariaLabelledBy:je,ariaDescribedBy:Me}=ie(N,[n?P:null,y!==`tooltip`&&v?.message?F:null,Ae,W?G.describedBy:null],z),[q,J]=(0,T.useState)(null),Ne=(0,T.useRef)(u);u!==Ne.current&&(Ne.current=u,u!==R.current&&(R.current=void 0,q!==null&&J(null)));let Pe=(0,T.useCallback)(e=>typeof w==`function`?w(e):ne(ae(e),w),[w]),Fe=q===null?V&&/^\d{4}-\d{2}-\d{2}$/.test(V)?Pe(V):``:q,Y=q===null||!q.trim()?!0:o(q)!==null,X=de({dialogLabel:A(`@astryx.dateInput.dialogLabel`),closeButtonLabel:A(`@astryx.dateInput.closeCalendar`),onHide:()=>I.current?.focus()}),Ie=(0,T.useCallback)(()=>{U||(X.isOpen?X.hide():X.show())},[U,X]),Le=(0,T.useCallback)(()=>{!U&&!X.isOpen&&X.show({skipAutoFocus:!0})},[U,X]),Z=(0,T.useCallback)(e=>{H||(d?.(e),p&&B(async()=>{Oe(e),await p(e)}))},[H,d,p,B,Oe]),Re=(0,T.useCallback)(()=>{Z(void 0),I.current?.focus()},[Z]),ze=(0,T.useCallback)(e=>{Z(e),J(null),X.hide()},[Z,X]),Be=(0,T.useCallback)(e=>{if(U)return;let t=e.target.value;J(t);let n=o(t);if(n&&c(n)!==u&&!K(n)){let e=c(n);R.current=e,Z(e),L.current?.navigateTo(e)}},[u,Z,K,U]),Q=(0,T.useCallback)(()=>{if(q===null)return;if(!q.trim()){u!==void 0&&Z(void 0),J(null);return}let e=o(q);if(e&&!K(e)){let t=c(e);t!==u&&Z(t)}J(null)},[q,u,Z,K]),Ve=(0,T.useCallback)(()=>{Q()},[Q]),He=(0,T.useCallback)(e=>{e.key===`Escape`&&X.isOpen?(e.preventDefault(),X.hide()):(e.key===`ArrowDown`||e.altKey&&e.key===`ArrowDown`)&&!X.isOpen?(e.preventDefault(),U||X.show({skipAutoFocus:!0})):e.key===`Enter`&&(e.preventDefault(),Q())},[X,Q,U]),$=(0,E.jsxs)(`div`,{ref:e=>{X.triggerRef(e),G.ref(e)},...Ee,...re(i(`date-input`,{size:j,status:v?.type??null}),ee(b.base,D[j],U&&b.disabled,v&&ve[v.type],v&&!U&&ye[v.type],v&&be[v.type],z&&xe.inGroup,k),Ce,we),children:[z&&(0,E.jsx)(f,{id:N,children:e}),(0,E.jsx)(`button`,{type:`button`,onClick:Ie,disabled:U,"aria-label":X.isOpen?A(`@astryx.dateInput.toggleCalendarClose`):A(`@astryx.dateInput.openCalendar`),...{0:{className:`astryx78zum5 astryx6s0dn4 astryxl56j7k astryx1717udv astryx1ghz6dp astryxc342km astryxng3xce astryxjbqb8w astryx1ypdohk astryxh6dtrn astryx1a2a7pz astryx1p25gnr astryx1y3gkto`},1:{className:`astryx78zum5 astryx6s0dn4 astryxl56j7k astryx1717udv astryx1ghz6dp astryxc342km astryxng3xce astryxjbqb8w astryxh6dtrn astryx1a2a7pz astryx1p25gnr astryx1y3gkto astryx1h6gzvc`}}[!!U<<0],children:(0,E.jsx)(ue,{icon:`calendar`,size:`sm`,color:`secondary`,...i(`date-input-toggle-icon`,{state:X.isOpen?`expanded`:`collapsed`})})}),(0,E.jsx)(`input`,{ref:te(Te,I),id:M,type:`text`,role:`combobox`,value:Fe,onChange:Be,onBlur:Ve,onClick:Le,onKeyDown:He,placeholder:De,disabled:U&&!W,"aria-disabled":W?`true`:void 0,readOnly:W||void 0,"aria-labelledby":je,"aria-describedby":Me,"aria-required":a===!0?`true`:void 0,"aria-invalid":v?.type===`error`||!Y?`true`:void 0,"aria-busy":H||void 0,"aria-expanded":X.isOpen,"aria-haspopup":`dialog`,"aria-controls":X.isOpen?X.id:void 0,"aria-autocomplete":`none`,autoComplete:`off`,...{0:{className:`astryx1lliihq astryx98rzlu astryxeuugli astryxc342km astryxng3xce astryx1717udv astryx9ynric astryxjm74w1 astryx6pjikd astryxw6l6zx astryx1tgivj0 astryxjbqb8w astryx1a2a7pz astryxeyghm5`},2:{className:`astryx1lliihq astryx98rzlu astryxeuugli astryxc342km astryxng3xce astryx1717udv astryx9ynric astryxjm74w1 astryx6pjikd astryxw6l6zx astryx1tgivj0 astryxjbqb8w astryx1a2a7pz astryxeyghm5 astryx1h6gzvc`},1:{className:`astryx1lliihq astryx98rzlu astryxeuugli astryxc342km astryxng3xce astryx1717udv astryx9ynric astryxjm74w1 astryx6pjikd astryxw6l6zx astryxjbqb8w astryx1a2a7pz astryxeyghm5 astryxv1l7n4`},3:{className:`astryx1lliihq astryx98rzlu astryxeuugli astryxc342km astryxng3xce astryx1717udv astryx9ynric astryxjm74w1 astryx6pjikd astryxw6l6zx astryxjbqb8w astryx1a2a7pz astryxeyghm5 astryx1h6gzvc astryxv1l7n4`}}[!!U<<1|!Y<<0]}),(0,E.jsx)(f,{as:`div`,role:`alert`,"aria-live":`assertive`,children:Y?``:`Invalid date`}),S&&u!==void 0&&!U&&(0,E.jsx)(`button`,{type:`button`,onClick:Re,"aria-label":A(`@astryx.dateInput.clear`,{label:e}),className:`astryx78zum5 astryx6s0dn4 astryxl56j7k astryx1717udv astryx1ghz6dp astryxc342km astryxng3xce astryxjbqb8w astryx1ypdohk astryxh6dtrn astryx1a2a7pz astryx1p25gnr astryx1y3gkto`,children:(0,E.jsx)(ue,{icon:`close`,size:`sm`,color:`secondary`,...i(`date-input-clear-icon`)})}),H&&(0,E.jsx)(se,{size:`sm`}),ke,X.render((0,E.jsx)(he,{handleRef:L,mode:`single`,value:V,onChange:ze,min:h,max:g,dateConstraints:_,numberOfMonths:C}),{placement:`below`,alignment:`start`}),W&&G.renderTooltip(l)]});return z?$:(0,E.jsx)(_e,{label:e,isLabelHidden:t,description:n,inputID:M,descriptionID:n?P:void 0,isOptional:r,isRequired:a,isDisabled:s,status:v?{type:v.type,message:v.message,messageID:v.message?F:void 0}:void 0,statusVariant:y,labelTooltip:x,width:O,children:$})}var T,E,D,O=e((()=>{T=t(n(),1),r(),x(),g(),p(),C(),S(),m(),d(),y(),v(),pe(),me(),_(),l(),s(),E=u(),a(),h(),D={sm:{kZKoxP:`astryx6k0iem`,k7Eaqz:`astryxfb3i0g`,$$css:!0},md:{kZKoxP:`astryx1ueg155`,k7Eaqz:`astryxfb3i0g`,$$css:!0},lg:{kZKoxP:`astryxssyfek`,k7Eaqz:`astryxfb3i0g`,$$css:!0}},w.displayName=`DateInput`,w.__docgenInfo={description:`A date picker component combining a text input with a calendar popover.

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
| 'relative_short'
| 'auto'
| 'date'
| 'date_long'
| 'date_weekday'
| 'date_time'
| 'time'
| 'system_date'
| 'system_date_time'
| 'system_time'
| 'unix_seconds'`,elements:[{name:`literal`,value:`'relative'`},{name:`literal`,value:`'relative_short'`},{name:`literal`,value:`'auto'`},{name:`literal`,value:`'date'`},{name:`literal`,value:`'date_long'`},{name:`literal`,value:`'date_weekday'`},{name:`literal`,value:`'date_time'`},{name:`literal`,value:`'time'`},{name:`literal`,value:`'system_date'`},{name:`literal`,value:`'system_date_time'`},{name:`literal`,value:`'system_time'`},{name:`literal`,value:`'unix_seconds'`}]},{name:`union`,raw:`'date' | 'date_long' | 'date_weekday' | 'system_date'`,elements:[{name:`literal`,value:`'date'`},{name:`literal`,value:`'date_long'`},{name:`literal`,value:`'date_weekday'`},{name:`literal`,value:`'system_date'`}]}],raw:`Extract<
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