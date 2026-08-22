import{i as e,s as t}from"./preload-helper-CT_b8DTk.js";import{t as n}from"./react-B7Te67-h.js";import{c as ee,l as te,n as ne,s as r,t as i,u as re}from"./themeProps-BLML-F6E.js";import{$ as a,A as ie,E as ae,O as oe,U as o,X as se,ht as s,it as ce,m as le,t as c}from"./utils-BuW-ky-j.js";import{t as l}from"./jsx-runtime-DqZldVDK.js";import{n as ue}from"./useTooltip-BHvim3zP.js";import{n as de,t as u}from"./Spinner-Bk7TM9RN.js";import{n as fe,t as d}from"./VisuallyHidden-DDrJpIxj.js";import{n as f,r as pe}from"./SizeContext-fcGnTOs5.js";import{r as me,t as p}from"./i18n-lxFPcm64.js";import{t as he}from"./Icon-B0iRiI-K.js";import{t as m}from"./Icon-Dbw8drz4.js";import{n as ge}from"./usePopover-kHB5cxAq.js";import{t as h}from"./Popover-DU6zpYbO.js";import{t as _e}from"./Tooltip-D2ITaKL4.js";import{a as ve,i as g}from"./hooks-YDRZMFb7.js";import{i as _,n as ye,o as be,t as v}from"./Calendar-B3r4ZljS.js";import{t as xe}from"./Field-DfqJXc2c.js";import{a as Se,c as y,n as Ce,o as we,s as Te,t as b}from"./Field-CbCUoxNI.js";import{a as x,i as Ee,n as S,r as De}from"./InputGroupContext-DfUisVOG.js";function C({label:e,isLabelHidden:t=!1,description:n,isOptional:te=!1,isRequired:r=!1,isDisabled:i=!1,disabledMessage:a,value:c,onChange:l,changeAction:u,isLoading:d=!1,min:f,max:p,dateConstraints:m,placeholder:h,size:_e,status:g,statusVariant:_=`attached`,labelTooltip:v,hasClear:b=!1,numberOfMonths:x=1,weekStartsOn:S,format:C=`date_long`,width:D,xstyle:O,className:Oe,style:ke,ref:Ae,...je}){let k=me(),Me=h??k(`@astryx.dateInput.placeholder`),A=pe(_e,`md`),j=(0,w.useId)(),M=(0,w.useId)(),N=(0,w.useId)(),P=(0,w.useId)(),F=(0,w.useRef)(null),I=(0,w.useRef)(null),L=(0,w.useRef)(void 0),R=De(),[,z]=(0,w.useTransition)(),[B,V]=(0,w.useOptimistic)(c),H=d||B!==c,U=i||H,W=i&&!!a,G=ue({placement:`above`,focusTrigger:`always`,isEnabled:W}),{isDateDisabled:K}=be({min:f,max:p,dateConstraints:m}),{statusIcon:Ne,describedBy:Pe}=ve({status:g,statusVariant:_,isInGroup:!!R}),{ariaLabelledBy:Fe,ariaDescribedBy:Ie}=le(M,[n?N:null,_!==`tooltip`&&g?.message?P:null,Pe,W?G.describedBy:null],R),[q,J]=(0,w.useState)(null),Le=(0,w.useRef)(c);c!==Le.current&&(Le.current=c,c!==L.current&&(L.current=void 0,q!==null&&J(null)));let Re=(0,w.useCallback)(e=>typeof C==`function`?C(e):se(ce(e),C),[C]),ze=q===null?B&&/^\d{4}-\d{2}-\d{2}$/.test(B)?Re(B):``:q,Y=q===null||!q.trim()?!0:o(q)!==null,X=ge({dialogLabel:k(`@astryx.dateInput.dialogLabel`),closeButtonLabel:k(`@astryx.dateInput.closeCalendar`),onHide:()=>{ae()&&F.current?.focus()}}),Be=(0,w.useCallback)(()=>{U||(X.isOpen?X.hide():X.show())},[U,X]),Ve=(0,w.useCallback)(()=>{!U&&!X.isOpen&&X.show({skipAutoFocus:!0})},[U,X]),Z=(0,w.useCallback)(e=>{H||(l?.(e),u&&z(async()=>{V(e),await u(e)}))},[H,l,u,z,V]),He=(0,w.useCallback)(()=>{Z(void 0),F.current?.focus()},[Z]),Ue=(0,w.useCallback)(e=>{Z(e),J(null),X.hide()},[Z,X]),We=(0,w.useCallback)(e=>{if(U)return;let t=e.target.value;J(t);let n=o(t);if(n&&s(n)!==c&&!K(n)){let e=s(n);L.current=e,Z(e),I.current?.navigateTo(e)}},[c,Z,K,U]),Q=(0,w.useCallback)(()=>{if(q===null)return;if(!q.trim()){c!==void 0&&Z(void 0),J(null);return}let e=o(q);if(e&&!K(e)){let t=s(e);t!==c&&Z(t)}J(null)},[q,c,Z,K]),Ge=(0,w.useCallback)(()=>{Q()},[Q]),Ke=(0,w.useCallback)(e=>{e.key===`Escape`&&X.isOpen?(e.preventDefault(),X.hide()):(e.key===`ArrowDown`||e.altKey&&e.key===`ArrowDown`)&&!X.isOpen?(e.preventDefault(),U||X.show({skipAutoFocus:!0})):e.key===`Enter`&&(e.preventDefault(),Q())},[X,Q,U]),$=(0,T.jsxs)(`div`,{ref:e=>{X.triggerRef(e),G.ref(e)},...je,...ie(ne(`date-input`,{size:A,status:g?.type??null,disabled:i?`disabled`:null}),re(y.base,E[A],U&&y.disabled,g&&Se[g.type],g&&!U&&Te[g.type],g&&we[g.type],R&&Ee.inGroup,O),Oe,ke),children:[R&&(0,T.jsx)(fe,{id:M,children:e}),(0,T.jsx)(`button`,{type:`button`,onClick:Be,disabled:U,"aria-label":X.isOpen?k(`@astryx.dateInput.toggleCalendarClose`):k(`@astryx.dateInput.openCalendar`),...{0:{className:`astryx78zum5 astryx6s0dn4 astryxl56j7k astryx1717udv astryx1ghz6dp astryxc342km astryxng3xce astryxjbqb8w astryx1ypdohk astryxh6dtrn astryx1a2a7pz astryx1p25gnr astryx1y3gkto`},1:{className:`astryx78zum5 astryx6s0dn4 astryxl56j7k astryx1717udv astryx1ghz6dp astryxc342km astryxng3xce astryxjbqb8w astryxh6dtrn astryx1a2a7pz astryx1p25gnr astryx1y3gkto astryx1h6gzvc`}}[!!U<<0],children:(0,T.jsx)(he,{icon:`calendar`,size:`sm`,color:`secondary`,...ne(`date-input-toggle-icon`,{state:X.isOpen?`expanded`:`collapsed`})})}),(0,T.jsx)(`input`,{ref:oe(Ae,F),id:j,type:`text`,role:`combobox`,value:ze,onChange:We,onBlur:Ge,onClick:Ve,onKeyDown:Ke,placeholder:Me,disabled:U&&!W,"aria-disabled":W?`true`:void 0,readOnly:W||void 0,"aria-labelledby":Fe,"aria-describedby":Ie,"aria-required":r===!0?`true`:void 0,"aria-invalid":g?.type===`error`||!Y?`true`:void 0,"aria-busy":H||void 0,"aria-expanded":X.isOpen,"aria-haspopup":`dialog`,"aria-controls":X.isOpen?X.id:void 0,"aria-autocomplete":`none`,autoComplete:`off`,...{0:{className:`astryx1lliihq astryx98rzlu astryxeuugli astryxc342km astryxng3xce astryx1717udv astryx9ynric astryxjm74w1 astryx6pjikd astryxw6l6zx astryx1tgivj0 astryxjbqb8w astryx1a2a7pz astryxeyghm5`},2:{className:`astryx1lliihq astryx98rzlu astryxeuugli astryxc342km astryxng3xce astryx1717udv astryx9ynric astryxjm74w1 astryx6pjikd astryxw6l6zx astryx1tgivj0 astryxjbqb8w astryx1a2a7pz astryxeyghm5 astryx1h6gzvc`},1:{className:`astryx1lliihq astryx98rzlu astryxeuugli astryxc342km astryxng3xce astryx1717udv astryx9ynric astryxjm74w1 astryx6pjikd astryxw6l6zx astryxjbqb8w astryx1a2a7pz astryxeyghm5 astryxv1l7n4`},3:{className:`astryx1lliihq astryx98rzlu astryxeuugli astryxc342km astryxng3xce astryx1717udv astryx9ynric astryxjm74w1 astryx6pjikd astryxw6l6zx astryxjbqb8w astryx1a2a7pz astryxeyghm5 astryx1h6gzvc astryxv1l7n4`}}[!!U<<1|!Y<<0]}),(0,T.jsx)(fe,{as:`div`,role:`alert`,"aria-live":`assertive`,children:Y?``:`Invalid date`}),b&&c!==void 0&&!U&&(0,T.jsx)(Ce,{label:k(`@astryx.dateInput.clear`,{label:e}),onClick:He,iconClassName:ee(`date-input-clear-icon`)}),H&&(0,T.jsx)(de,{size:`sm`}),Ne,X.render((0,T.jsx)(ye,{handleRef:I,mode:`single`,value:B,onChange:Ue,min:f,max:p,dateConstraints:m,numberOfMonths:x,weekStartsOn:S}),{placement:`below`,alignment:`start`}),W&&G.renderTooltip(a)]});return R?$:(0,T.jsx)(xe,{label:e,isLabelHidden:t,description:n,inputID:j,descriptionID:n?N:void 0,isOptional:te,isRequired:r,isDisabled:i,status:g?{type:g.type,message:g.message,messageID:g.message?P:void 0}:void 0,statusVariant:_,labelTooltip:v,width:D,children:$})}var w,T,E,D=e((()=>{w=t(n(),1),te(),b(),m(),d(),S(),x(),f(),u(),v(),_(),g(),h(),_e(),c(),a(),T=l(),i(),r(),p(),E={sm:{kZKoxP:`astryx6k0iem`,k7Eaqz:`astryxfb3i0g`,$$css:!0},md:{kZKoxP:`astryx1ueg155`,k7Eaqz:`astryxfb3i0g`,$$css:!0},lg:{kZKoxP:`astryxssyfek`,k7Eaqz:`astryxfb3i0g`,$$css:!0}},C.displayName=`DateInput`,C.__docgenInfo={description:`A date picker component combining a text input with a calendar popover.

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
@default 1`,defaultValue:{value:`1`,computed:!1}},weekStartsOn:{required:!1,tsType:{name:`union`,raw:`DayOfWeek | DayOfWeekName`,elements:[{name:`union`,raw:`0 | 1 | 2 | 3 | 4 | 5 | 6`,elements:[{name:`literal`,value:`0`},{name:`literal`,value:`1`},{name:`literal`,value:`2`},{name:`literal`,value:`3`},{name:`literal`,value:`4`},{name:`literal`,value:`5`},{name:`literal`,value:`6`}]},{name:`union`,raw:`| 'sun'
| 'mon'
| 'tue'
| 'wed'
| 'thu'
| 'fri'
| 'sat'`,elements:[{name:`literal`,value:`'sun'`},{name:`literal`,value:`'mon'`},{name:`literal`,value:`'tue'`},{name:`literal`,value:`'wed'`},{name:`literal`,value:`'thu'`},{name:`literal`,value:`'fri'`},{name:`literal`,value:`'sat'`}]}]},description:`First day of week in the calendar popover. Accepts a number
(0 = Sunday … 6 = Saturday) or a three-letter day name ('sun'–'sat',
case-insensitive).
@default 0`},format:{required:!1,tsType:{name:`union`,raw:`DateInputFormat | ((value: ISODateString) => string)`,elements:[{name:`Extract`,elements:[{name:`union`,raw:`| 'relative'
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
\`\`\``,defaultValue:{value:`'date_long'`,computed:!1}}},composes:[`Omit`]}})),O=e((()=>{D()}));export{C as n,D as r,O as t};