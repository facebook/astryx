import{i as e,s as t}from"./preload-helper-CT_b8DTk.js";import{t as n}from"./react-B7Te67-h.js";import{A as r,C as ee,O as i,S as a,j as te,k as ne}from"./tokens.stylex-Dlps2mzj.js";import{F as re,J as o,N as ie,a as ae,bt as s,it as c,j as oe,lt as se,o as l,t as u,tt as ce,y as le}from"./utils-CS5QvixW.js";import{t as d}from"./jsx-runtime-DqZldVDK.js";import{n as ue}from"./useTooltip-DNYp90_J.js";import{n as de,t as f}from"./Spinner-avkhzc8I.js";import{n as p,t as m}from"./VisuallyHidden-DDrJpIxj.js";import{n as h,r as fe}from"./SizeContext-fcGnTOs5.js";import{r as pe,t as g}from"./i18n-BtlbLfWH.js";import{t as me}from"./Icon-yadpUkvL.js";import{t as he}from"./Icon-CrT6Mhfu.js";import{n as ge}from"./usePopover-B0FwwRCt.js";import{t as _e}from"./Popover-C_1_35Hb.js";import{t as _}from"./Tooltip-nY-xZ42R.js";import{a as ve,i as v}from"./hooks-CYpYUT8_.js";import{i as ye,n as be,o as xe,t as y}from"./Calendar-BY2HDGGu.js";import{t as Se}from"./Field-CBYl2nqG.js";import{a as Ce,c as b,n as we,o as Te,s as Ee,t as x}from"./Field-OC8BQhKE.js";import{a as S,i as De,n as C,r as Oe}from"./InputGroupContext-DfUisVOG.js";function w({label:e,isLabelHidden:t=!1,description:n,isOptional:r=!1,isRequired:i=!1,isDisabled:a=!1,disabledMessage:c,value:l,onChange:u,changeAction:d,isLoading:f=!1,min:m,max:h,dateConstraints:g,placeholder:he,size:_e,status:_,statusVariant:v=`attached`,labelTooltip:ye,hasClear:y=!1,numberOfMonths:x=1,weekStartsOn:S,format:C=`date_long`,width:w,xstyle:k,className:A,style:ke,ref:Ae,...je}){let j=pe(),Me=he??j(`@astryx.dateInput.placeholder`),M=fe(_e,`md`),N=(0,T.useId)(),P=(0,T.useId)(),F=(0,T.useId)(),I=(0,T.useId)(),L=(0,T.useRef)(null),R=(0,T.useRef)(null),z=(0,T.useRef)(void 0),B=Oe(),[,Ne]=(0,T.useTransition)(),[V,Pe]=(0,T.useOptimistic)(l),H=f||V!==l,U=a||H,W=a&&!!c,G=ue({placement:`above`,focusTrigger:`always`,isEnabled:W}),{isDateDisabled:K}=xe({min:m,max:h,dateConstraints:g}),{statusIcon:Fe,describedBy:Ie}=ve({status:_,statusVariant:v,isInGroup:!!B}),{ariaLabelledBy:Le,ariaDescribedBy:Re}=le(P,[n?F:null,v!==`tooltip`&&_?.message?I:null,Ie,W?G.describedBy:null],B),[q,J]=(0,T.useState)(null),ze=(0,T.useRef)(l);l!==ze.current&&(ze.current=l,l!==z.current&&(z.current=void 0,q!==null&&J(null)));let Be=(0,T.useCallback)(e=>typeof C==`function`?C(e):ce(se(e),C),[C]),Ve=q===null?V&&/^\d{4}-\d{2}-\d{2}$/.test(V)?Be(V):``:q,Y=q===null||!q.trim()?!0:o(q)!==null,X=ge({dialogLabel:j(`@astryx.dateInput.dialogLabel`),closeButtonLabel:j(`@astryx.dateInput.closeCalendar`),onHide:()=>{oe()&&L.current?.focus()}}),He=(0,T.useCallback)(()=>{U||(X.isOpen?X.hide():X.show())},[U,X]),Ue=(0,T.useCallback)(()=>{!U&&!X.isOpen&&X.show({skipAutoFocus:!0})},[U,X]),Z=(0,T.useCallback)(e=>{H||(u?.(e),d&&Ne(async()=>{Pe(e),await d(e)}))},[H,u,d,Ne,Pe]),We=(0,T.useCallback)(()=>{Z(void 0),L.current?.focus()},[Z]),Ge=(0,T.useCallback)(e=>{Z(e),J(null),X.hide()},[Z,X]),Ke=(0,T.useCallback)(e=>{if(U)return;let t=e.target.value;J(t);let n=o(t);if(n&&s(n)!==l&&!K(n)){let e=s(n);z.current=e,Z(e),R.current?.navigateTo(e)}},[l,Z,K,U]),Q=(0,T.useCallback)(()=>{if(q===null)return;if(!q.trim()){l!==void 0&&Z(void 0),J(null);return}let e=o(q);if(e&&!K(e)){let t=s(e);t!==l&&Z(t)}J(null)},[q,l,Z,K]),qe=(0,T.useCallback)(()=>{Q()},[Q]),Je=(0,T.useCallback)(e=>{e.key===`Escape`&&X.isOpen?(e.preventDefault(),X.hide()):(e.key===`ArrowDown`||e.altKey&&e.key===`ArrowDown`)&&!X.isOpen?(e.preventDefault(),U||X.show({skipAutoFocus:!0})):e.key===`Enter`&&(e.preventDefault(),Q())},[X,Q,U]),$=(0,E.jsxs)(`div`,{ref:e=>{X.triggerRef(e),G.ref(e)},...je,...re(ee(`date-input`,{size:M,status:_?.type??null,disabled:a?`disabled`:null}),te(b.base,O[M],U&&b.disabled,_&&Ce[_.type],_&&!U&&Ee[_.type],_&&Te[_.type],B&&De.inGroup,k),A,ke),children:[B&&(0,E.jsx)(p,{id:P,children:e}),(0,E.jsx)(`button`,{type:`button`,onClick:He,disabled:U,"aria-label":X.isOpen?j(`@astryx.dateInput.toggleCalendarClose`):j(`@astryx.dateInput.openCalendar`),...te(ae.focusVisible,D.iconButton,U&&D.iconButtonDisabled),children:(0,E.jsx)(me,{icon:`calendar`,size:`sm`,color:`secondary`,...ee(`date-input-toggle-icon`,{state:X.isOpen?`expanded`:`collapsed`})})}),(0,E.jsx)(`input`,{ref:ie(Ae,L),id:N,type:`text`,role:`combobox`,value:Ve,onChange:Ke,onBlur:qe,onClick:Ue,onKeyDown:Je,placeholder:Me,disabled:U&&!W,"aria-disabled":W?`true`:void 0,readOnly:W||void 0,"aria-labelledby":Le,"aria-describedby":Re,"aria-required":i===!0?`true`:void 0,"aria-invalid":_?.type===`error`||!Y?`true`:void 0,"aria-busy":H||void 0,"aria-expanded":X.isOpen,"aria-haspopup":`dialog`,"aria-controls":X.isOpen?X.id:void 0,"aria-autocomplete":`none`,autoComplete:`off`,...{0:{className:`astryx1lliihq astryx98rzlu astryxeuugli astryxc342km astryxng3xce astryx1717udv astryx9ynric astryxjm74w1 astryx6pjikd astryxw6l6zx astryx1tgivj0 astryxjbqb8w astryx1a2a7pz astryxeyghm5`},2:{className:`astryx1lliihq astryx98rzlu astryxeuugli astryxc342km astryxng3xce astryx1717udv astryx9ynric astryxjm74w1 astryx6pjikd astryxw6l6zx astryx1tgivj0 astryxjbqb8w astryx1a2a7pz astryxeyghm5 astryx1h6gzvc`},1:{className:`astryx1lliihq astryx98rzlu astryxeuugli astryxc342km astryxng3xce astryx1717udv astryx9ynric astryxjm74w1 astryx6pjikd astryxw6l6zx astryxjbqb8w astryx1a2a7pz astryxeyghm5 astryxv1l7n4`},3:{className:`astryx1lliihq astryx98rzlu astryxeuugli astryxc342km astryxng3xce astryx1717udv astryx9ynric astryxjm74w1 astryx6pjikd astryxw6l6zx astryxjbqb8w astryx1a2a7pz astryxeyghm5 astryx1h6gzvc astryxv1l7n4`}}[!!U<<1|!Y<<0]}),(0,E.jsx)(p,{as:`div`,role:`alert`,"aria-live":`assertive`,children:Y?``:j(`@astryx.dateInput.invalidDate`)}),y&&l!==void 0&&!U&&(0,E.jsx)(we,{label:j(`@astryx.dateInput.clear`,{label:e}),onClick:We,iconClassName:ne(`date-input-clear-icon`)}),H&&(0,E.jsx)(de,{size:`sm`}),Fe,X.render((0,E.jsx)(be,{handleRef:R,mode:`single`,value:V,onChange:Ge,min:m,max:h,dateConstraints:g,numberOfMonths:x,weekStartsOn:S}),{placement:`below`,alignment:`start`}),W&&G.renderTooltip(c)]});return B?$:(0,E.jsx)(Se,{label:e,isLabelHidden:t,description:n,inputID:N,descriptionID:n?F:void 0,isOptional:r,isRequired:i,isDisabled:a,status:_?{type:_.type,message:_.message,messageID:_.message?I:void 0}:void 0,statusVariant:v,labelTooltip:ye,width:w,children:$})}var T,E,D,O,k=e((()=>{T=t(n(),1),r(),x(),he(),m(),C(),S(),h(),f(),y(),ye(),v(),_e(),_(),u(),c(),E=d(),a(),l(),i(),g(),D={iconButton:{k1xSpc:`astryx78zum5`,kGNEyG:`astryx6s0dn4`,kjj79g:`astryxl56j7k`,kmVPX3:`astryx1717udv`,kg3NbH:null,kuDDbn:null,kE3dHu:null,kP0aTx:null,kpe85a:null,k8WAf4:null,kLKAdn:null,kGO01o:null,kogj98:`astryx1ghz6dp`,kUOVxO:null,keTefX:null,koQZXg:null,k71WvV:null,km5ZXQ:null,kqGvvJ:null,keoZOQ:null,k1K539:null,kMzoRj:`astryxc342km`,kjGldf:null,k2ei4v:null,kZ1KPB:null,ke9TFa:null,kWqL5O:null,kLoX6v:null,kEafiO:null,kt9PQ7:null,ksu8eU:`astryxng3xce`,kJRH4f:null,kVhnKS:null,k4WBpm:null,k8ry5P:null,kSWEuD:null,kDUl1X:null,kPef9Z:null,kfdmCh:null,kWkggS:`astryxjbqb8w`,kkrTdU:`astryx1ypdohk`,kaIpWk:`astryxh6dtrn`,krdFHd:null,kfmiAY:null,kVL7Gh:null,kT0f0o:null,kIxVMA:null,ksF3WI:null,kqGeR4:null,kYm2EN:null,$$css:!0},iconButtonDisabled:{kkrTdU:`astryx1h6gzvc`,$$css:!0}},O={sm:{kZKoxP:`astryx6k0iem`,k7Eaqz:`astryxfb3i0g`,$$css:!0},md:{kZKoxP:`astryx1ueg155`,k7Eaqz:`astryxfb3i0g`,$$css:!0},lg:{kZKoxP:`astryxssyfek`,k7Eaqz:`astryxfb3i0g`,$$css:!0}},w.displayName=`DateInput`,w.__docgenInfo={description:`A date picker component combining a text input with a calendar popover.

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
\`\`\``,defaultValue:{value:`'date_long'`,computed:!1}}},composes:[`Omit`]}})),A=e((()=>{k()}));export{w as n,k as r,A as t};