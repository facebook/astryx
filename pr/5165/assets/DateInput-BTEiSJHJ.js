import{i as e,s as t}from"./preload-helper-CT_b8DTk.js";import{t as n}from"./react-B7Te67-h.js";import{A as ee,C as r,M as te,j as i,k as a,w as o}from"./tokens.stylex-jQdTQOgY.js";import{F as ne,N as re,Q as s,a as ie,at as ae,ct as c,j as oe,o as l,pt as se,t as u,wt as d,y as ce}from"./utils-DX_YZCyL.js";import{t as f}from"./jsx-runtime-DqZldVDK.js";import{n as le}from"./useTooltip-Dz3niEle.js";import{n as ue,t as p}from"./Spinner-s9-d8DDX.js";import{n as de,t as m}from"./VisuallyHidden-DDrJpIxj.js";import{n as h,r as fe}from"./SizeContext-fcGnTOs5.js";import{r as pe,t as g}from"./i18n-GYpu5Dns.js";import{t as me}from"./Icon-Br0735UK.js";import{t as he}from"./Icon-CdeczwtP.js";import{a as ge,i as _e}from"./hooks-CxL1fQxn.js";import{t as _}from"./Tooltip-ChpUtbet.js";import{n as ve}from"./usePopover-DVrT_YrT.js";import{t as v}from"./Popover-CEHfw_Np.js";import{i as ye,n as be,o as xe,t as y}from"./Calendar-D-sEx-Ah.js";import{t as Se}from"./Field-CeafvwxF.js";import{a as Ce,c as b,n as we,o as Te,s as Ee,t as x}from"./Field-CByF1qM6.js";import{a as S,i as De,n as C,r as Oe}from"./InputGroupContext-BonpDGzu.js";function w({label:e,isLabelHidden:t=!1,description:n,isOptional:r=!1,isRequired:i=!1,isDisabled:a=!1,disabledMessage:c,value:l,onChange:u,changeAction:f,isLoading:p=!1,min:m,max:h,dateConstraints:g,placeholder:he,size:_e,status:_,statusVariant:v=`attached`,labelTooltip:ye,hasClear:y=!1,numberOfMonths:x=1,weekStartsOn:S,format:C=`date_long`,width:w,xstyle:k,className:A,style:ke,ref:Ae,...je}){let j=pe(),Me=he??j(`@astryx.dateInput.placeholder`),M=fe(_e,`md`),N=(0,T.useId)(),P=(0,T.useId)(),F=(0,T.useId)(),I=(0,T.useId)(),L=(0,T.useRef)(null),Ne=(0,T.useRef)(null),R=(0,T.useRef)(void 0),z=Oe(),[,Pe]=(0,T.useTransition)(),[B,Fe]=(0,T.useOptimistic)(l),V=p||B!==l,H=a||V,U=a&&!!c,W=le({placement:`above`,focusTrigger:`always`,isEnabled:U}),{isDateDisabled:G}=xe({min:m,max:h,dateConstraints:g}),{statusIcon:Ie,describedBy:Le}=ge({status:_,statusVariant:v,isInGroup:!!z}),{ariaLabelledBy:Re,ariaDescribedBy:ze}=ce(P,[n?F:null,v!==`tooltip`&&_?.message?I:null,Le,U?W.describedBy:null],z),[K,q]=(0,T.useState)(null),J=(0,T.useRef)(l);l!==J.current&&(J.current=l,l!==R.current&&(R.current=void 0,K!==null&&q(null)));let Be=(0,T.useCallback)(e=>typeof C==`function`?C(e):ae(se(e),C),[C]),Ve=K===null?B&&/^\d{4}-\d{2}-\d{2}$/.test(B)?Be(B):``:K,Y=K===null||!K.trim()?!0:s(K)!==null,X=ve({dialogLabel:j(`@astryx.dateInput.dialogLabel`),closeButtonLabel:j(`@astryx.dateInput.closeCalendar`),onHide:()=>{oe()&&L.current?.focus()}}),He=(0,T.useCallback)(()=>{H||(X.isOpen?X.hide():X.show())},[H,X]),Ue=(0,T.useCallback)(()=>{!H&&!X.isOpen&&X.show({skipAutoFocus:!0})},[H,X]),Z=(0,T.useCallback)(e=>{V||(u?.(e),f&&Pe(async()=>{Fe(e),await f(e)}))},[V,u,f,Pe,Fe]),We=(0,T.useCallback)(()=>{Z(void 0),L.current?.focus()},[Z]),Ge=(0,T.useCallback)(e=>{Z(e),q(null),X.hide()},[Z,X]),Ke=(0,T.useCallback)(e=>{if(H)return;let t=e.target.value;q(t);let n=s(t);if(n&&d(n)!==l&&!G(n)){let e=d(n);R.current=e,Z(e),Ne.current?.navigateTo(e)}},[l,Z,G,H]),Q=(0,T.useCallback)(()=>{if(K===null)return;if(!K.trim()){l!==void 0&&Z(void 0),q(null);return}let e=s(K);if(e&&!G(e)){let t=d(e);t!==l&&Z(t)}q(null)},[K,l,Z,G]),qe=(0,T.useCallback)(()=>{Q()},[Q]),Je=(0,T.useCallback)(e=>{e.key===`Escape`&&X.isOpen?(e.preventDefault(),X.hide()):(e.key===`ArrowDown`||e.altKey&&e.key===`ArrowDown`)&&!X.isOpen?(e.preventDefault(),H||X.show({skipAutoFocus:!0})):e.key===`Enter`&&(e.preventDefault(),Q())},[X,Q,H]),$=(0,E.jsxs)(`div`,{ref:e=>{X.triggerRef(e),W.ref(e)},...je,...ne(o(`date-input`,{size:M,status:_?.type??null,disabled:a?`disabled`:null}),te(b.base,O[M],H&&b.disabled,_&&Ce[_.type],_&&!H&&Ee[_.type],_&&Te[_.type],z&&De.inGroup,k),A,ke),children:[z&&(0,E.jsx)(de,{id:P,children:e}),(0,E.jsx)(`button`,{type:`button`,onClick:He,disabled:H,"aria-label":X.isOpen?j(`@astryx.dateInput.toggleCalendarClose`):j(`@astryx.dateInput.openCalendar`),...te(ie.focusVisible,D.iconButton,H&&D.iconButtonDisabled),children:(0,E.jsx)(me,{icon:`calendar`,size:`sm`,color:`secondary`,...o(`date-input-toggle-icon`,{state:X.isOpen?`expanded`:`collapsed`})})}),(0,E.jsx)(`input`,{ref:re(Ae,L),id:N,type:`text`,role:`combobox`,value:Ve,onChange:Ke,onBlur:qe,onClick:Ue,onKeyDown:Je,placeholder:Me,disabled:H&&!U,"aria-disabled":U?`true`:void 0,readOnly:U||void 0,"aria-labelledby":Re,"aria-describedby":ze,"aria-required":i===!0?`true`:void 0,"aria-invalid":_?.type===`error`||!Y?`true`:void 0,"aria-busy":V||void 0,"aria-expanded":X.isOpen,"aria-haspopup":`dialog`,"aria-controls":X.isOpen?X.id:void 0,"aria-autocomplete":`none`,autoComplete:`off`,...{0:{className:`astryx1lliihq astryx98rzlu astryxeuugli astryxc342km astryxng3xce astryx1717udv astryx9ynric astryxjm74w1 astryx6pjikd astryxw6l6zx astryx1tgivj0 astryxjbqb8w astryx1a2a7pz astryxeyghm5`},2:{className:`astryx1lliihq astryx98rzlu astryxeuugli astryxc342km astryxng3xce astryx1717udv astryx9ynric astryxjm74w1 astryx6pjikd astryxw6l6zx astryx1tgivj0 astryxjbqb8w astryx1a2a7pz astryxeyghm5 astryx1h6gzvc`},1:{className:`astryx1lliihq astryx98rzlu astryxeuugli astryxc342km astryxng3xce astryx1717udv astryx9ynric astryxjm74w1 astryx6pjikd astryxw6l6zx astryxjbqb8w astryx1a2a7pz astryxeyghm5 astryxv1l7n4`},3:{className:`astryx1lliihq astryx98rzlu astryxeuugli astryxc342km astryxng3xce astryx1717udv astryx9ynric astryxjm74w1 astryx6pjikd astryxw6l6zx astryxjbqb8w astryx1a2a7pz astryxeyghm5 astryx1h6gzvc astryxv1l7n4`}}[!!H<<1|!Y<<0]}),(0,E.jsx)(de,{as:`div`,role:`alert`,"aria-live":`assertive`,children:Y?``:j(`@astryx.dateInput.invalidDate`)}),y&&l!==void 0&&!H&&(0,E.jsx)(we,{label:j(`@astryx.dateInput.clear`,{label:e}),onClick:We,iconClassName:ee(`date-input-clear-icon`)}),V&&(0,E.jsx)(ue,{size:`sm`}),Ie,X.render((0,E.jsx)(be,{handleRef:Ne,mode:`single`,value:B,onChange:Ge,min:m,max:h,dateConstraints:g,numberOfMonths:x,weekStartsOn:S}),{placement:`below`,alignment:`start`}),U&&W.renderTooltip(c)]});return z?$:(0,E.jsx)(Se,{label:e,isLabelHidden:t,description:n,inputID:N,descriptionID:n?F:void 0,isOptional:r,isRequired:i,isDisabled:a,status:_?{type:_.type,message:_.message,messageID:_.message?I:void 0}:void 0,statusVariant:v,labelTooltip:ye,width:w,children:$})}var T,E,D,O,k=e((()=>{T=t(n(),1),i(),x(),he(),m(),C(),S(),h(),p(),y(),ye(),_e(),v(),_(),u(),c(),E=f(),r(),l(),a(),g(),D={iconButton:{k1xSpc:`astryx78zum5`,kGNEyG:`astryx6s0dn4`,kjj79g:`astryxl56j7k`,kmVPX3:`astryx1717udv`,kg3NbH:null,kuDDbn:null,kE3dHu:null,kP0aTx:null,kpe85a:null,k8WAf4:null,kLKAdn:null,kGO01o:null,kogj98:`astryx1ghz6dp`,kUOVxO:null,keTefX:null,koQZXg:null,k71WvV:null,km5ZXQ:null,kqGvvJ:null,keoZOQ:null,k1K539:null,kMzoRj:`astryxc342km`,kjGldf:null,k2ei4v:null,kZ1KPB:null,ke9TFa:null,kWqL5O:null,kLoX6v:null,kEafiO:null,kt9PQ7:null,ksu8eU:`astryxng3xce`,kJRH4f:null,kVhnKS:null,k4WBpm:null,k8ry5P:null,kSWEuD:null,kDUl1X:null,kPef9Z:null,kfdmCh:null,kWkggS:`astryxjbqb8w`,kkrTdU:`astryx1ypdohk`,kaIpWk:`astryxh6dtrn`,krdFHd:null,kfmiAY:null,kVL7Gh:null,kT0f0o:null,kIxVMA:null,ksF3WI:null,kqGeR4:null,kYm2EN:null,$$css:!0},iconButtonDisabled:{kkrTdU:`astryx1h6gzvc`,$$css:!0}},O={sm:{kZKoxP:`astryx6k0iem`,k7Eaqz:`astryxfb3i0g`,$$css:!0},md:{kZKoxP:`astryx1ueg155`,k7Eaqz:`astryxfb3i0g`,$$css:!0},lg:{kZKoxP:`astryxssyfek`,k7Eaqz:`astryxfb3i0g`,$$css:!0}},w.displayName=`DateInput`,w.__docgenInfo={description:`A date picker component combining a text input with a calendar popover.

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