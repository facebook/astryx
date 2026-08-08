import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{t}from"./react-BZJXY1be.js";import{n,t as r}from"./stylex-Dft6gtPK.js";import{O as i,_ as ee,s as te,u as a}from"./plainDate-DXbeuWIy.js";import{n as o,t as s}from"./dateParser-B8OjqkAV.js";import{n as ne}from"./mergeProps-JRyAvMxc.js";import{n as re}from"./mergeRefs-CPqjs56a.js";import{n as c,t as l}from"./themeProps-CREkzZh6.js";import{a as u,i as ie,n as d,o as ae,r as oe}from"./InputGroupContext-CDHZwJED.js";import{t as f}from"./jsx-runtime-DeHZSEgm.js";import{n as se,t as p}from"./useTooltip-Cm0gpSWG.js";import{n as m,t as ce}from"./Spinner-CzifdOpC.js";import{n as h,t as le}from"./VisuallyHidden-Z2NjNH-_.js";import{n as g,r as ue}from"./SizeContext-Dp2usO2O.js";import{n as de,t as _}from"./useTranslator-BMnme3me.js";import{n as v,t as y}from"./Icon-C24cO4CC.js";import{n as fe,t as b}from"./usePopover-DPO-mU50.js";import{n as pe,t as x}from"./useInputStatusIcon-B91OOy9G.js";import{i as me,n as S,r as C,t as he}from"./Calendar-C12CvkH4.js";import{n as w,t as ge}from"./Field-DZ-q02Vq.js";import{a as T,i as _e,n as ve,r as ye,t as E}from"./inputStyles.stylex-Crlb5thk.js";function D({label:e,isLabelHidden:t=!1,description:r,isOptional:a=!1,isRequired:s=!1,isDisabled:l=!1,disabledMessage:u,value:d,onChange:f,changeAction:p,isLoading:m=!1,min:h,max:g,dateConstraints:_,placeholder:v,size:b,status:x,statusVariant:S=`attached`,labelTooltip:C,hasClear:w=!1,numberOfMonths:E=1,weekStartsOn:D,format:j=`date_long`,width:be,xstyle:xe,className:Se,style:Ce,ref:we,...Te}){let M=de(),Ee=v??M(`@astryx.dateInput.placeholder`),N=ue(b,`md`),P=(0,O.useId)(),De=(0,O.useId)(),Oe=(0,O.useId)(),ke=(0,O.useId)(),F=(0,O.useRef)(null),I=(0,O.useRef)(null),L=(0,O.useRef)(void 0),R=oe(),[,z]=(0,O.useTransition)(),[B,V]=(0,O.useOptimistic)(d),H=m||B!==d,U=l||H,W=l&&!!u,G=se({placement:`above`,focusTrigger:`always`,isEnabled:W}),{isDateDisabled:K}=me({min:h,max:g,dateConstraints:_}),{statusIcon:Ae,describedBy:je}=pe({status:x,statusVariant:S,isInGroup:!!R}),{ariaLabelledBy:Me,ariaDescribedBy:Ne}=ae(De,[r?Oe:null,S!==`tooltip`&&x?.message?ke:null,je,W?G.describedBy:null],R),[q,J]=(0,O.useState)(null),Y=(0,O.useRef)(d);d!==Y.current&&(Y.current=d,d!==L.current&&(L.current=void 0,q!==null&&J(null)));let Pe=(0,O.useCallback)(e=>typeof j==`function`?j(e):te(ee(e),j),[j]),Fe=q===null?B&&/^\d{4}-\d{2}-\d{2}$/.test(B)?Pe(B):``:q,X=q===null||!q.trim()||o(q)!==null,Z=fe({dialogLabel:M(`@astryx.dateInput.dialogLabel`),closeButtonLabel:M(`@astryx.dateInput.closeCalendar`),onHide:()=>F.current?.focus()}),Ie=(0,O.useCallback)(()=>{U||(Z.isOpen?Z.hide():Z.show())},[U,Z]),Le=(0,O.useCallback)(()=>{!U&&!Z.isOpen&&Z.show({skipAutoFocus:!0})},[U,Z]),Q=(0,O.useCallback)(e=>{H||(f?.(e),p&&z(async()=>{V(e),await p(e)}))},[H,f,p,z,V]),Re=(0,O.useCallback)(()=>{Q(void 0),F.current?.focus()},[Q]),ze=(0,O.useCallback)(e=>{Q(e),J(null),Z.hide()},[Q,Z]),Be=(0,O.useCallback)(e=>{if(U)return;let t=e.target.value;J(t);let n=o(t);if(n&&i(n)!==d&&!K(n)){let e=i(n);L.current=e,Q(e),I.current?.navigateTo(e)}},[d,Q,K,U]),$=(0,O.useCallback)(()=>{if(q===null)return;if(!q.trim()){d!==void 0&&Q(void 0),J(null);return}let e=o(q);if(e&&!K(e)){let t=i(e);t!==d&&Q(t)}J(null)},[q,d,Q,K]),Ve=(0,O.useCallback)(()=>{$()},[$]),He=(0,O.useCallback)(e=>{e.key===`Escape`&&Z.isOpen?(e.preventDefault(),Z.hide()):(e.key===`ArrowDown`||e.altKey&&e.key===`ArrowDown`)&&!Z.isOpen?(e.preventDefault(),U||Z.show({skipAutoFocus:!0})):e.key===`Enter`&&(e.preventDefault(),$())},[Z,$,U]),Ue=(0,k.jsxs)(`div`,{ref:e=>{Z.triggerRef(e),G.ref(e)},...Te,...ne(c(`date-input`,{size:N,status:x?.type??null,disabled:l?`disabled`:null}),n(T.base,A[N],U&&T.disabled,x&&ve[x.type],x&&!U&&_e[x.type],x&&ye[x.type],R&&ie.inGroup,xe),Se,Ce),children:[R&&(0,k.jsx)(le,{id:De,children:e}),(0,k.jsx)(`button`,{type:`button`,onClick:Ie,disabled:U,"aria-label":Z.isOpen?M(`@astryx.dateInput.toggleCalendarClose`):M(`@astryx.dateInput.openCalendar`),...{0:{className:`astryx78zum5 astryx6s0dn4 astryxl56j7k astryx1717udv astryx1ghz6dp astryxc342km astryxng3xce astryxjbqb8w astryx1ypdohk astryxh6dtrn astryx1a2a7pz astryx1p25gnr astryx1y3gkto`},1:{className:`astryx78zum5 astryx6s0dn4 astryxl56j7k astryx1717udv astryx1ghz6dp astryxc342km astryxng3xce astryxjbqb8w astryxh6dtrn astryx1a2a7pz astryx1p25gnr astryx1y3gkto astryx1h6gzvc`}}[!!U<<0],children:(0,k.jsx)(y,{icon:`calendar`,size:`sm`,color:`secondary`,...c(`date-input-toggle-icon`,{state:Z.isOpen?`expanded`:`collapsed`})})}),(0,k.jsx)(`input`,{ref:re(we,F),id:P,type:`text`,role:`combobox`,value:Fe,onChange:Be,onBlur:Ve,onClick:Le,onKeyDown:He,placeholder:Ee,disabled:U&&!W,"aria-disabled":W?`true`:void 0,readOnly:W||void 0,"aria-labelledby":Me,"aria-describedby":Ne,"aria-required":s===!0?`true`:void 0,"aria-invalid":x?.type===`error`||!X?`true`:void 0,"aria-busy":H||void 0,"aria-expanded":Z.isOpen,"aria-haspopup":`dialog`,"aria-controls":Z.isOpen?Z.id:void 0,"aria-autocomplete":`none`,autoComplete:`off`,...{0:{className:`astryx1lliihq astryx98rzlu astryxeuugli astryxc342km astryxng3xce astryx1717udv astryx9ynric astryxjm74w1 astryx6pjikd astryxw6l6zx astryx1tgivj0 astryxjbqb8w astryx1a2a7pz astryxeyghm5`},2:{className:`astryx1lliihq astryx98rzlu astryxeuugli astryxc342km astryxng3xce astryx1717udv astryx9ynric astryxjm74w1 astryx6pjikd astryxw6l6zx astryx1tgivj0 astryxjbqb8w astryx1a2a7pz astryxeyghm5 astryx1h6gzvc`},1:{className:`astryx1lliihq astryx98rzlu astryxeuugli astryxc342km astryxng3xce astryx1717udv astryx9ynric astryxjm74w1 astryx6pjikd astryxw6l6zx astryxjbqb8w astryx1a2a7pz astryxeyghm5 astryxv1l7n4`},3:{className:`astryx1lliihq astryx98rzlu astryxeuugli astryxc342km astryxng3xce astryx1717udv astryx9ynric astryxjm74w1 astryx6pjikd astryxw6l6zx astryxjbqb8w astryx1a2a7pz astryxeyghm5 astryx1h6gzvc astryxv1l7n4`}}[!!U<<1|!X<<0]}),(0,k.jsx)(le,{as:`div`,role:`alert`,"aria-live":`assertive`,children:X?``:`Invalid date`}),w&&d!==void 0&&!U&&(0,k.jsx)(`button`,{type:`button`,onClick:Re,"aria-label":M(`@astryx.dateInput.clear`,{label:e}),className:`astryx78zum5 astryx6s0dn4 astryxl56j7k astryx1717udv astryx1ghz6dp astryxc342km astryxng3xce astryxjbqb8w astryx1ypdohk astryxh6dtrn astryx1a2a7pz astryx1p25gnr astryx1y3gkto`,children:(0,k.jsx)(y,{icon:`close`,size:`sm`,color:`secondary`,...c(`date-input-clear-icon`)})}),H&&(0,k.jsx)(ce,{size:`sm`}),Ae,Z.render((0,k.jsx)(he,{handleRef:I,mode:`single`,value:B,onChange:ze,min:h,max:g,dateConstraints:_,numberOfMonths:E,weekStartsOn:D}),{placement:`below`,alignment:`start`}),W&&G.renderTooltip(u)]});return R?Ue:(0,k.jsx)(ge,{label:e,isLabelHidden:t,description:r,inputID:P,descriptionID:r?Oe:void 0,isOptional:a,isRequired:s,isDisabled:l,status:x?{type:x.type,message:x.message,messageID:x.message?ke:void 0}:void 0,statusVariant:S,labelTooltip:C,width:be,children:Ue})}var O,k,A;function j(){return(j=e((()=>{O=t(),r(),w(),E(),v(),h(),d(),u(),g(),m(),S(),C(),x(),b(),p(),s(),a(),k=f(),l(),_(),A={sm:{kZKoxP:`astryx6k0iem`,k7Eaqz:`astryxfb3i0g`,$$css:!0},md:{kZKoxP:`astryx1ueg155`,k7Eaqz:`astryxfb3i0g`,$$css:!0},lg:{kZKoxP:`astryxssyfek`,k7Eaqz:`astryxfb3i0g`,$$css:!0}},D.displayName=`DateInput`,D.__docgenInfo={description:`A date picker component combining a text input with a calendar popover.

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
\`\`\``,defaultValue:{value:`'date_long'`,computed:!1}}},composes:[`Omit`]}})))()}export{j as n,D as t};