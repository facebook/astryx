import{i as e,s as t}from"./preload-helper-CT_b8DTk.js";import{t as n}from"./react-B7Te67-h.js";import{E as r,M as ee,N as i,P as te,T as a,j as o,n as ne}from"./ime-cU6wEDvZ.js";import{F as re,N as ie,Q as s,Tt as c,a as ae,at as oe,ct as l,j as se,mt as ce,o as u,t as d,y as le}from"./utils-CWsdskp6.js";import{t as f}from"./jsx-runtime-DqZldVDK.js";import{n as ue}from"./useTooltip-C3J-vQ1n.js";import{n as de,t as p}from"./Spinner-BlDJDj71.js";import{n as fe,t as m}from"./VisuallyHidden-DDrJpIxj.js";import{n as h,r as pe}from"./SizeContext-fcGnTOs5.js";import{r as me,t as g}from"./i18n-C4NW5nTa.js";import{t as he}from"./Icon-BoIDnXjJ.js";import{t as _}from"./Icon-Duz24UlN.js";import{a as ge,i as _e}from"./hooks-DVVJ653T.js";import{t as v}from"./Tooltip-CCcP6i3j.js";import{n as ve}from"./usePopover-CRz2Ja12.js";import{t as y}from"./Popover-Cfssa_LC.js";import{i as b,n as ye,o as be,t as x}from"./Calendar-B6_AOqai.js";import{t as xe}from"./Field-Cwz-WZfv.js";import{a as Se,c as Ce,n as we,o as Te,s as Ee,t as De}from"./Field-kCtmo2N0.js";import{n as Oe,t as ke}from"./useResolvedRequired-B2AkgCU7.js";import{a as S,i as Ae,n as je,r as Me}from"./InputGroupContext-BonpDGzu.js";function C({label:e,isLabelHidden:t=!1,description:n,isOptional:i=!1,isRequired:a=!1,isDisabled:o=!1,disabledMessage:l,value:u,onChange:d,changeAction:f,isLoading:p=!1,min:m,max:h,dateConstraints:g,placeholder:_,size:_e,status:v,statusVariant:y=`attached`,labelTooltip:b,hasClear:x=!1,numberOfMonths:De=1,weekStartsOn:ke,format:S=`date_long`,width:je,xstyle:C,className:O,style:k,ref:Ne,...Pe}){let A=me(),Fe=Oe({isRequired:a,isOptional:i}),Ie=_??A(`@astryx.dateInput.placeholder`),j=pe(_e,`md`),M=(0,w.useId)(),N=(0,w.useId)(),P=(0,w.useId)(),F=(0,w.useId)(),I=(0,w.useRef)(null),L=(0,w.useRef)(null),R=(0,w.useRef)(void 0),z=Me(),[,B]=(0,w.useTransition)(),[V,Le]=(0,w.useOptimistic)(u),H=p||V!==u,U=o||H,W=o&&!!l,G=ue({placement:`above`,focusTrigger:`always`,isEnabled:W}),{isDateDisabled:K}=be({min:m,max:h,dateConstraints:g}),{statusIcon:Re,describedBy:ze}=ge({status:v,statusVariant:y,isInGroup:!!z}),{ariaLabelledBy:Be,ariaDescribedBy:Ve}=le(N,[n?P:null,y!==`tooltip`&&v?.message?F:null,ze,W?G.describedBy:null],z),[q,J]=(0,w.useState)(null),He=(0,w.useRef)(u);u!==He.current&&(He.current=u,u!==R.current&&(R.current=void 0,q!==null&&J(null)));let Ue=(0,w.useCallback)(e=>typeof S==`function`?S(e):oe(ce(e),S),[S]),We=q===null?V&&/^\d{4}-\d{2}-\d{2}$/.test(V)?Ue(V):``:q,Y=q===null||!q.trim()?!0:s(q)!==null,X=ve({dialogLabel:A(`@astryx.dateInput.dialogLabel`),closeButtonLabel:A(`@astryx.dateInput.closeCalendar`),onHide:()=>{se()&&I.current?.focus()}}),Ge=(0,w.useCallback)(()=>{U||(X.isOpen?X.hide():X.show())},[U,X]),Ke=(0,w.useCallback)(()=>{!U&&!X.isOpen&&X.show({skipAutoFocus:!0})},[U,X]),Z=(0,w.useCallback)(e=>{H||(d?.(e),f&&B(async()=>{Le(e),await f(e)}))},[H,d,f,B,Le]),qe=(0,w.useCallback)(()=>{Z(void 0),I.current?.focus()},[Z]),Je=(0,w.useCallback)(e=>{Z(e),J(null),X.hide()},[Z,X]),Ye=(0,w.useCallback)(e=>{if(U)return;let t=e.target.value;J(t);let n=s(t);if(n&&c(n)!==u&&!K(n)){let e=c(n);R.current=e,Z(e),L.current?.navigateTo(e)}},[u,Z,K,U]),Q=(0,w.useCallback)(()=>{if(q===null)return;if(!q.trim()){u!==void 0&&Z(void 0),J(null);return}let e=s(q);if(e&&!K(e)){let t=c(e);t!==u&&Z(t)}J(null)},[q,u,Z,K]),Xe=(0,w.useCallback)(()=>{Q()},[Q]),Ze=(0,w.useCallback)(e=>{ne(e.nativeEvent)||(e.key===`Escape`&&X.isOpen?(e.preventDefault(),X.hide()):(e.key===`ArrowDown`||e.altKey&&e.key===`ArrowDown`)&&!X.isOpen?(e.preventDefault(),U||X.show({skipAutoFocus:!0})):e.key===`Enter`&&(e.preventDefault(),Q()))},[X,Q,U]),$=(0,T.jsxs)(`div`,{ref:e=>{X.triggerRef(e),G.ref(e)},...Pe,...re(r(`date-input`,{size:j,status:v?.type??null,disabled:o?`disabled`:null}),te(Ce.base,D[j],U&&Ce.disabled,v&&Se[v.type],v&&!U&&Ee[v.type],v&&Te[v.type],z&&Ae.inGroup,C),O,k),children:[z&&(0,T.jsx)(fe,{id:N,children:e}),(0,T.jsx)(`button`,{type:`button`,onClick:Ge,disabled:U,"aria-label":X.isOpen?A(`@astryx.dateInput.toggleCalendarClose`):A(`@astryx.dateInput.openCalendar`),...te(ae.focusVisible,E.iconButton,U&&E.iconButtonDisabled),children:(0,T.jsx)(he,{icon:`calendar`,size:`sm`,color:`secondary`,...r(`date-input-toggle-icon`,{state:X.isOpen?`expanded`:`collapsed`})})}),(0,T.jsx)(`input`,{ref:ie(Ne,I),id:M,type:`text`,role:`combobox`,value:We,onChange:Ye,onBlur:Xe,onClick:Ke,onKeyDown:Ze,placeholder:Ie,disabled:U&&!W,"aria-disabled":W?`true`:void 0,readOnly:W||void 0,"aria-labelledby":Be,"aria-describedby":Ve,"aria-required":Fe?`true`:void 0,"aria-invalid":v?.type===`error`||!Y?`true`:void 0,"aria-busy":H||void 0,"aria-expanded":X.isOpen,"aria-haspopup":`dialog`,"aria-controls":X.isOpen?X.id:void 0,"aria-autocomplete":`none`,autoComplete:`off`,...{0:{className:`astryx1lliihq astryx98rzlu astryxeuugli astryxc342km astryxng3xce astryx1717udv astryx9ynric astryxjm74w1 astryx6pjikd astryxw6l6zx astryx1tgivj0 astryxjbqb8w astryx1a2a7pz astryxeyghm5`},2:{className:`astryx1lliihq astryx98rzlu astryxeuugli astryxc342km astryxng3xce astryx1717udv astryx9ynric astryxjm74w1 astryx6pjikd astryxw6l6zx astryx1tgivj0 astryxjbqb8w astryx1a2a7pz astryxeyghm5 astryx1h6gzvc`},1:{className:`astryx1lliihq astryx98rzlu astryxeuugli astryxc342km astryxng3xce astryx1717udv astryx9ynric astryxjm74w1 astryx6pjikd astryxw6l6zx astryxjbqb8w astryx1a2a7pz astryxeyghm5 astryxv1l7n4`},3:{className:`astryx1lliihq astryx98rzlu astryxeuugli astryxc342km astryxng3xce astryx1717udv astryx9ynric astryxjm74w1 astryx6pjikd astryxw6l6zx astryxjbqb8w astryx1a2a7pz astryxeyghm5 astryx1h6gzvc astryxv1l7n4`}}[!!U<<1|!Y<<0]}),(0,T.jsx)(fe,{as:`div`,role:`alert`,"aria-live":`assertive`,children:Y?``:A(`@astryx.dateInput.invalidDate`)}),x&&u!==void 0&&!U&&(0,T.jsx)(we,{label:A(`@astryx.dateInput.clear`,{label:e}),onClick:qe,iconClassName:ee(`date-input-clear-icon`)}),H&&(0,T.jsx)(de,{size:`sm`}),Re,X.render((0,T.jsx)(ye,{handleRef:L,mode:`single`,value:V,onChange:Je,min:m,max:h,dateConstraints:g,numberOfMonths:De,weekStartsOn:ke}),{placement:`below`,alignment:`start`}),W&&G.renderTooltip(l)]});return z?$:(0,T.jsx)(xe,{label:e,isLabelHidden:t,description:n,inputID:M,descriptionID:n?P:void 0,isOptional:i,isRequired:a,isDisabled:o,status:v?{type:v.type,message:v.message,messageID:v.message?F:void 0}:void 0,statusVariant:y,labelTooltip:b,width:je,children:$})}var w,T,E,D,O=e((()=>{w=t(n(),1),i(),De(),_(),m(),je(),S(),h(),p(),x(),b(),_e(),ke(),y(),v(),d(),l(),T=f(),a(),u(),o(),g(),E={iconButton:{k1xSpc:`astryx78zum5`,kGNEyG:`astryx6s0dn4`,kjj79g:`astryxl56j7k`,kmVPX3:`astryx1717udv`,kg3NbH:null,kuDDbn:null,kE3dHu:null,kP0aTx:null,kpe85a:null,k8WAf4:null,kLKAdn:null,kGO01o:null,kogj98:`astryx1ghz6dp`,kUOVxO:null,keTefX:null,koQZXg:null,k71WvV:null,km5ZXQ:null,kqGvvJ:null,keoZOQ:null,k1K539:null,kMzoRj:`astryxc342km`,kjGldf:null,k2ei4v:null,kZ1KPB:null,ke9TFa:null,kWqL5O:null,kLoX6v:null,kEafiO:null,kt9PQ7:null,ksu8eU:`astryxng3xce`,kJRH4f:null,kVhnKS:null,k4WBpm:null,k8ry5P:null,kSWEuD:null,kDUl1X:null,kPef9Z:null,kfdmCh:null,kWkggS:`astryxjbqb8w`,kkrTdU:`astryx1ypdohk`,kaIpWk:`astryxh6dtrn`,krdFHd:null,kfmiAY:null,kVL7Gh:null,kT0f0o:null,kIxVMA:null,ksF3WI:null,kqGeR4:null,kYm2EN:null,$$css:!0},iconButtonDisabled:{kkrTdU:`astryx1h6gzvc`,$$css:!0}},D={sm:{kZKoxP:`astryx6k0iem`,k7Eaqz:`astryxfb3i0g`,$$css:!0},md:{kZKoxP:`astryx1ueg155`,k7Eaqz:`astryxfb3i0g`,$$css:!0},lg:{kZKoxP:`astryxssyfek`,k7Eaqz:`astryxfb3i0g`,$$css:!0}},C.displayName=`DateInput`,C.__docgenInfo={description:`A date picker component combining a text input with a calendar popover.

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
\`\`\``,defaultValue:{value:`'date_long'`,computed:!1}}},composes:[`Omit`]}})),k=e((()=>{O()}));export{C as n,O as r,k as t};