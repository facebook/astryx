import{i as e,s as t}from"./preload-helper-CT_b8DTk.js";import{t as n}from"./react-B7Te67-h.js";import{E as ee,M as te,N as r,P as ne,T as i,j as a,n as re}from"./ime-cU6wEDvZ.js";import{F as ie,N as ae,Q as o,Tt as s,a as oe,at as se,ct as c,j as ce,mt as le,o as l,t as u,y as ue}from"./utils-C-fHTXVk.js";import{t as d}from"./jsx-runtime-DqZldVDK.js";import{n as de}from"./useTooltip-BNpQGEoT.js";import{n as fe,t as f}from"./Spinner-BgPtdoe_.js";import{n as pe,t as p}from"./VisuallyHidden-DDrJpIxj.js";import{n as m,r as me}from"./SizeContext-fcGnTOs5.js";import{s as he,t as h,u as ge}from"./i18n-DAWoAL6x.js";import{t as _e}from"./Icon-_i8LXpjO.js";import{t as ve}from"./Icon-_y7xipWs.js";import{a as ye,i as be}from"./hooks-oGR3Y7SS.js";import{t as g}from"./Tooltip-DXjC-yM9.js";import{n as xe}from"./usePopover-BX6aLSk4.js";import{t as _}from"./Popover-VzSUVBjK.js";import{i as Se,n as Ce,o as we,t as v}from"./Calendar-fbXsHcfL.js";import{t as Te}from"./Field-Bqk35kL9.js";import{a as Ee,c as y,n as De,o as Oe,s as ke,t as b}from"./Field-ClYD7yzY.js";import{n as Ae,t as x}from"./useResolvedRequired-BOUe3L_R.js";import{a as S,i as je,n as C,r as Me}from"./InputGroupContext-BonpDGzu.js";function w({label:e,isLabelHidden:t=!1,description:n,isOptional:r=!1,isRequired:i=!1,isDisabled:a=!1,disabledMessage:c,value:l,onChange:u,changeAction:d,isLoading:f=!1,min:p,max:m,dateConstraints:h,placeholder:ve,size:be,status:g,statusVariant:_=`attached`,labelTooltip:Se,hasClear:v=!1,numberOfMonths:b=1,weekStartsOn:x,format:S=`date_long`,width:C,xstyle:w,className:k,style:A,ref:Ne,...Pe}){let j=he(),Fe=Ae({isRequired:i,isOptional:r}),{locale:M}=(0,T.use)(ge),Ie=ve??j(`@astryx.dateInput.placeholder`),N=me(be,`md`),P=(0,T.useId)(),F=(0,T.useId)(),I=(0,T.useId)(),L=(0,T.useId)(),R=(0,T.useRef)(null),Le=(0,T.useRef)(null),z=(0,T.useRef)(void 0),B=Me(),[,Re]=(0,T.useTransition)(),[V,ze]=(0,T.useOptimistic)(l),H=f||V!==l,U=a||H,W=a&&!!c,G=de({placement:`above`,focusTrigger:`always`,isEnabled:W}),{isDateDisabled:K}=we({min:p,max:m,dateConstraints:h}),{statusIcon:Be,describedBy:Ve}=ye({status:g,statusVariant:_,isInGroup:!!B}),{ariaLabelledBy:He,ariaDescribedBy:Ue}=ue(F,[n?I:null,_!==`tooltip`&&g?.message?L:null,Ve,W?G.describedBy:null],B),[q,J]=(0,T.useState)(null),We=(0,T.useRef)(l);l!==We.current&&(We.current=l,l!==z.current&&(z.current=void 0,q!==null&&J(null)));let Ge=(0,T.useCallback)(e=>typeof S==`function`?S(e):se(le(e),S,M),[S,M]),Ke=q===null?V&&/^\d{4}-\d{2}-\d{2}$/.test(V)?Ge(V):``:q,Y=q===null||!q.trim()?!0:o(q,M)!==null,X=xe({dialogLabel:j(`@astryx.dateInput.dialogLabel`),closeButtonLabel:j(`@astryx.dateInput.closeCalendar`),onHide:()=>{ce()&&R.current?.focus()}}),qe=(0,T.useCallback)(()=>{U||(X.isOpen?X.hide():X.show())},[U,X]),Je=(0,T.useCallback)(()=>{!U&&!X.isOpen&&X.show({skipAutoFocus:!0})},[U,X]),Z=(0,T.useCallback)(e=>{H||(u?.(e),d&&Re(async()=>{ze(e),await d(e)}))},[H,u,d,Re,ze]),Ye=(0,T.useCallback)(()=>{Z(void 0),R.current?.focus()},[Z]),Xe=(0,T.useCallback)(e=>{Z(e),J(null),X.hide()},[Z,X]),Ze=(0,T.useCallback)(e=>{if(U)return;let t=e.target.value;J(t);let n=o(t,M);if(n&&s(n)!==l&&!K(n)){let e=s(n);z.current=e,Z(e),Le.current?.navigateTo(e)}},[l,Z,K,U,M]),Q=(0,T.useCallback)(()=>{if(q===null)return;if(!q.trim()){l!==void 0&&Z(void 0),J(null);return}let e=o(q,M);if(e&&!K(e)){let t=s(e);t!==l&&Z(t)}J(null)},[q,l,Z,K,M]),Qe=(0,T.useCallback)(()=>{Q()},[Q]),$e=(0,T.useCallback)(e=>{re(e.nativeEvent)||(e.key===`Escape`&&X.isOpen?(e.preventDefault(),X.hide()):(e.key===`ArrowDown`||e.altKey&&e.key===`ArrowDown`)&&!X.isOpen?(e.preventDefault(),U||X.show({skipAutoFocus:!0})):e.key===`Enter`&&(e.preventDefault(),Q()))},[X,Q,U]),$=(0,E.jsxs)(`div`,{ref:e=>{X.triggerRef(e),G.ref(e)},...Pe,...ie(ee(`date-input`,{size:N,status:g?.type??null,disabled:a?`disabled`:null}),ne(y.base,O[N],U&&y.disabled,g&&Ee[g.type],g&&!U&&ke[g.type],g&&Oe[g.type],B&&je.inGroup,w),k,A),children:[B&&(0,E.jsx)(pe,{id:F,children:e}),(0,E.jsx)(`button`,{type:`button`,onClick:qe,disabled:U,"aria-label":X.isOpen?j(`@astryx.dateInput.toggleCalendarClose`):j(`@astryx.dateInput.openCalendar`),...ne(oe.focusVisible,D.iconButton,U&&D.iconButtonDisabled),children:(0,E.jsx)(_e,{icon:`calendar`,size:`sm`,color:`secondary`,...ee(`date-input-toggle-icon`,{state:X.isOpen?`expanded`:`collapsed`})})}),(0,E.jsx)(`input`,{ref:ae(Ne,R),id:P,type:`text`,role:`combobox`,value:Ke,onChange:Ze,onBlur:Qe,onClick:Je,onKeyDown:$e,placeholder:Ie,disabled:U&&!W,"aria-disabled":W?`true`:void 0,readOnly:W||void 0,"aria-labelledby":He,"aria-describedby":Ue,"aria-required":Fe?`true`:void 0,"aria-invalid":g?.type===`error`||!Y?`true`:void 0,"aria-busy":H||void 0,"aria-expanded":X.isOpen,"aria-haspopup":`dialog`,"aria-controls":X.isOpen?X.id:void 0,"aria-autocomplete":`none`,autoComplete:`off`,...{0:{className:`astryx1lliihq astryx98rzlu astryxeuugli astryxc342km astryxng3xce astryx1717udv astryx9ynric astryxjm74w1 astryx6pjikd astryxw6l6zx astryx1tgivj0 astryxjbqb8w astryx1a2a7pz astryxeyghm5`},2:{className:`astryx1lliihq astryx98rzlu astryxeuugli astryxc342km astryxng3xce astryx1717udv astryx9ynric astryxjm74w1 astryx6pjikd astryxw6l6zx astryx1tgivj0 astryxjbqb8w astryx1a2a7pz astryxeyghm5 astryx1h6gzvc`},1:{className:`astryx1lliihq astryx98rzlu astryxeuugli astryxc342km astryxng3xce astryx1717udv astryx9ynric astryxjm74w1 astryx6pjikd astryxw6l6zx astryxjbqb8w astryx1a2a7pz astryxeyghm5 astryxv1l7n4`},3:{className:`astryx1lliihq astryx98rzlu astryxeuugli astryxc342km astryxng3xce astryx1717udv astryx9ynric astryxjm74w1 astryx6pjikd astryxw6l6zx astryxjbqb8w astryx1a2a7pz astryxeyghm5 astryx1h6gzvc astryxv1l7n4`}}[!!U<<1|!Y<<0]}),(0,E.jsx)(pe,{as:`div`,role:`alert`,"aria-live":`assertive`,children:Y?``:j(`@astryx.dateInput.invalidDate`)}),v&&l!==void 0&&!U&&(0,E.jsx)(De,{label:j(`@astryx.dateInput.clear`,{label:e}),onClick:Ye,iconClassName:te(`date-input-clear-icon`)}),H&&(0,E.jsx)(fe,{size:`sm`}),Be,X.render((0,E.jsx)(Ce,{handleRef:Le,mode:`single`,value:V,onChange:Xe,min:p,max:m,dateConstraints:h,numberOfMonths:b,weekStartsOn:x}),{placement:`below`,alignment:`start`}),W&&G.renderTooltip(c)]});return B?$:(0,E.jsx)(Te,{label:e,isLabelHidden:t,description:n,inputID:P,descriptionID:n?I:void 0,isOptional:r,isRequired:i,isDisabled:a,status:g?{type:g.type,message:g.message,messageID:g.message?L:void 0}:void 0,statusVariant:_,labelTooltip:Se,width:C,children:$})}var T,E,D,O,k=e((()=>{T=t(n(),1),r(),b(),ve(),p(),C(),S(),m(),f(),v(),Se(),be(),x(),_(),g(),u(),c(),E=d(),i(),l(),a(),h(),D={iconButton:{k1xSpc:`astryx78zum5`,kGNEyG:`astryx6s0dn4`,kjj79g:`astryxl56j7k`,kmVPX3:`astryx1717udv`,kg3NbH:null,kuDDbn:null,kE3dHu:null,kP0aTx:null,kpe85a:null,k8WAf4:null,kLKAdn:null,kGO01o:null,kogj98:`astryx1ghz6dp`,kUOVxO:null,keTefX:null,koQZXg:null,k71WvV:null,km5ZXQ:null,kqGvvJ:null,keoZOQ:null,k1K539:null,kMzoRj:`astryxc342km`,kjGldf:null,k2ei4v:null,kZ1KPB:null,ke9TFa:null,kWqL5O:null,kLoX6v:null,kEafiO:null,kt9PQ7:null,ksu8eU:`astryxng3xce`,kJRH4f:null,kVhnKS:null,k4WBpm:null,k8ry5P:null,kSWEuD:null,kDUl1X:null,kPef9Z:null,kfdmCh:null,kWkggS:`astryxjbqb8w`,kkrTdU:`astryx1ypdohk`,kaIpWk:`astryxh6dtrn`,krdFHd:null,kfmiAY:null,kVL7Gh:null,kT0f0o:null,kIxVMA:null,ksF3WI:null,kqGeR4:null,kYm2EN:null,$$css:!0},iconButtonDisabled:{kkrTdU:`astryx1h6gzvc`,$$css:!0}},O={sm:{kZKoxP:`astryx6k0iem`,k7Eaqz:`astryxfb3i0g`,$$css:!0},md:{kZKoxP:`astryx1ueg155`,k7Eaqz:`astryxfb3i0g`,$$css:!0},lg:{kZKoxP:`astryxssyfek`,k7Eaqz:`astryxfb3i0g`,$$css:!0}},w.displayName=`DateInput`,w.__docgenInfo={description:`A date picker component combining a text input with a calendar popover.

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