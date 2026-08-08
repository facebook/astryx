import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{t}from"./react-BZJXY1be.js";import{n,t as r}from"./stylex-Dft6gtPK.js";import{O as i,_ as ee,h as te,t as ne,u as re}from"./plainDate-DXbeuWIy.js";import{n as a,t as o}from"./dateParser-B8OjqkAV.js";import{i as ie,n as ae,o as s,r as oe,s as se,t as ce}from"./timeParser-ByoIw5o7.js";import{n as c,t as le}from"./Theme-os0aoGDw.js";import{n as ue}from"./mergeProps-JRyAvMxc.js";import{n as de}from"./mergeRefs-CPqjs56a.js";import{n as fe,t as l}from"./themeProps-CREkzZh6.js";import{t as pe}from"./jsx-runtime-DeHZSEgm.js";import{n as me,t as he}from"./useTooltip-Cm0gpSWG.js";import{a as ge,o as _e}from"./useTheme-CAaDofyu.js";import{n as ve,t as ye}from"./Spinner-CzifdOpC.js";import{n as be,t as xe}from"./VisuallyHidden-Z2NjNH-_.js";import{n as u,r as Se}from"./SizeContext-Dp2usO2O.js";import{n as Ce,t as d}from"./useTranslator-BMnme3me.js";import{n as f,t as we}from"./Icon-C24cO4CC.js";import{n as Te,t as Ee}from"./usePopover-DPO-mU50.js";import{a as De,o as Oe}from"./FieldStatus-BcKl5gyF.js";import{n as ke,t as Ae}from"./useInputStatusIcon-B91OOy9G.js";import{i as je,n as Me,r as Ne,t as Pe}from"./Calendar-C12CvkH4.js";import{n as p,t as Fe}from"./Field-DZ-q02Vq.js";import{a as m,i as Ie,n as Le,r as Re,t as ze}from"./inputStyles.stylex-Crlb5thk.js";function Be(e){if(!e)return{date:void 0,time:void 0};let t=e.indexOf(`T`);return t===-1?{date:e,time:void 0}:{date:e.slice(0,t),time:e.slice(t+1)}}function h(e,t){if(!(!e||!t))return`${e}T${t}`}function Ve(e){let t=new Date;return ie({hour:t.getHours(),minute:t.getMinutes(),second:t.getSeconds()},e)}function g({label:e,isLabelHidden:t=!1,description:r,isOptional:re=!1,isRequired:o=!1,isDisabled:c=!1,disabledMessage:le,value:l,onChange:pe,changeAction:he,isLoading:ge=!1,min:_e,max:ve,dateConstraints:be,hasSeconds:u=!1,hourFormat:d=`12h`,timeIncrement:f=1,hasClear:Ee=!1,placeholder:De,timePlaceholder:Ae,timeLabel:Me,size:Ne,status:p,labelTooltip:ze,numberOfMonths:g=1,weekStartsOn:We,width:y,xstyle:b,className:Ge,style:x,ref:S,...C}){let w=Ce(),T=De??w(`@astryx.dateTimeInput.placeholder`),E=Ae??w(`@astryx.dateTimeInput.timePlaceholder`),D=Se(Ne,`md`),O=(0,_.useId)(),k=(0,_.useId)(),A=(0,_.useId)(),j=(0,_.useId)(),M=(0,_.useRef)(null),N=(0,_.useRef)(null),P=(0,_.useRef)(null),F=(0,_.useRef)(null),I=(0,_.useRef)(void 0),[,L]=(0,_.useTransition)(),[R,z]=(0,_.useOptimistic)(l),B=ge||R!==l,V=c||B,H=c&&!!le,Ke=me({placement:`above`,focusTrigger:`always`,isEnabled:H}),{statusIcon:qe,describedBy:Je}=ke({status:p,statusVariant:`detached`}),Ye=[r?A:null,p?.message?j:null,Je,H?Ke.describedBy:null].filter(Boolean).join(` `)||void 0,U=(0,_.useMemo)(()=>Be(_e),[_e]),W=(0,_.useMemo)(()=>Be(ve),[ve]),G=(0,_.useMemo)(()=>Be(R),[R]),Xe=U.date,Ze=W.date,{isDateDisabled:Qe}=je({min:Xe,max:Ze,dateConstraints:be}),K=(0,_.useMemo)(()=>{if(!(!U.date||!U.time||!G.date))return G.date===U.date?U.time:void 0},[U.date,U.time,G.date]),q=(0,_.useMemo)(()=>{if(!(!W.date||!W.time||!G.date))return G.date===W.date?W.time:void 0},[W.date,W.time,G.date]),[J,Y]=(0,_.useState)(null),$e=(0,_.useRef)(G.date);G.date!==$e.current&&($e.current=G.date,G.date!==I.current&&(I.current=void 0,J!==null&&Y(null)));let et=J===null?G.date&&/^\d{4}-\d{2}-\d{2}$/.test(G.date)?te(ee(G.date),ne):``:J,tt=J===null||!J.trim()||a(J)!==null,[X,nt]=(0,_.useState)(null),[rt,it]=(0,_.useState)(!1),at=d===`12h`?ae:oe,ot=(0,_.useMemo)(()=>X===null?G.time?at(G.time,u):``:X,[X,G.time,at,u]),st=(0,_.useMemo)(()=>{if(X===null||!X.trim())return!0;let e=se(X,u);return e?s(e,K,q):!1},[X,u,K,q]),ct=(0,_.useMemo)(()=>rt&&!ot?d===`12h`?`e.g., 2:30 PM`:`e.g., 14:30`:E,[rt,ot,d,E]),Z=(0,_.useCallback)(e=>{B||(pe(e),he&&L(async()=>{z(e),await he(e)}))},[B,pe,he,L,z]),Q=Te({dialogLabel:w(`@astryx.dateTimeInput.dialogLabel`),closeButtonLabel:w(`@astryx.dateInput.closeCalendar`),onHide:()=>M.current?.focus()}),lt=(0,_.useCallback)(()=>{V||(Q.isOpen?Q.hide():Q.show())},[V,Q]),ut=(0,_.useCallback)(()=>{!V&&!Q.isOpen&&Q.show({skipAutoFocus:!0})},[V,Q]),$=(0,_.useCallback)((e,t)=>{let n=G.time??Ve(u);U.date&&e===U.date&&U.time&&(s(n,U.time,void 0)||(n=U.time)),W.date&&e===W.date&&W.time&&(s(n,void 0,W.time)||(n=W.time));let r=h(e,n);r&&Z(r),t===`calendar`&&(Y(null),Q.hide())},[G.time,u,U,W,Z,Q]),dt=(0,_.useCallback)(e=>{if(V)return;let t=e.target.value;Y(t);let n=a(t);if(n&&i(n)!==G.date&&!Qe(n)){let e=i(n);I.current=e,$(e,`input`),F.current?.navigateTo(e)}},[G.date,Qe,$,V]),ft=(0,_.useCallback)(()=>{if(J===null)return;if(!J.trim()){l!==void 0&&Z(void 0),Y(null);return}let e=a(J);if(e&&!Qe(e)){let t=i(e);t!==G.date&&$(t,`input`)}Y(null)},[J,l,G.date,Z,Qe,$]),pt=(0,_.useCallback)(()=>{ft()},[ft]),mt=(0,_.useCallback)(e=>{e.key===`Escape`&&Q.isOpen?(e.preventDefault(),Q.hide()):(e.key===`ArrowDown`||e.altKey&&e.key===`ArrowDown`)&&!Q.isOpen?(e.preventDefault(),V||Q.show({skipAutoFocus:!0})):e.key===`Enter`&&(e.preventDefault(),ft())},[Q,ft,V]),ht=(0,_.useCallback)(e=>{if(V)return;let t=e.target.value;nt(t);let n=se(t,u);if(n&&s(n,K,q)&&n!==G.time&&G.date){let e=h(G.date,n);e&&Z(e)}},[u,K,q,G.time,G.date,Z,V]),gt=(0,_.useCallback)(()=>{V||it(!0)},[V]),_t=(0,_.useCallback)(()=>{if(it(!1),X===null)return;if(!X.trim()){nt(null);return}let e=se(X,u);if(e&&s(e,K,q)&&e!==G.time&&G.date){let t=h(G.date,e);t&&Z(t)}nt(null)},[X,u,K,q,G,Z]),vt=(0,_.useCallback)(e=>{if(e.key===`ArrowUp`||e.key===`ArrowDown`){e.preventDefault();let t=G.time;if(!t){let e=new Date;t=ie({hour:e.getHours(),minute:e.getMinutes(),second:e.getSeconds()},u)}let n=e.key===`ArrowUp`?f:-f,r=ce(t,n,u);if(s(r,K,q)&&G.date){let e=h(G.date,r);e&&Z(e)}}},[G,u,f,K,q,Z]),yt=(0,_.useCallback)(()=>{Z(void 0),M.current?.focus()},[Z]),{onClick:bt,onMouseUp:xt}=Oe({containerRef:P,inputRef:N,disabled:V});return(0,v.jsxs)(Fe,{label:e,isLabelHidden:t,description:r,inputID:O,descriptionID:r?A:void 0,isOptional:re,isRequired:o,isDisabled:c,status:p?{type:p.type,message:p.message,messageID:p.message?j:void 0}:void 0,labelTooltip:ze,statusVariant:`detached`,width:y,children:[(0,v.jsxs)(`div`,{ref:Ke.ref,...C,...ue(fe(`date-time-input`,{size:D,status:p?.type??null,disabled:c?`disabled`:null}),n(He.row,b),Ge,x),children:[(0,v.jsxs)(`div`,{ref:Q.triggerRef,...ue(fe(`date-time-input-date-segment`,{size:D,status:p?.type??null}),n(m.base,Ue[D],He.dateWrapper,V&&m.disabled,p&&Le[p.type],p&&!V&&Ie[p.type],p&&Re[p.type])),children:[(0,v.jsx)(`button`,{type:`button`,onClick:lt,disabled:V,"aria-label":Q.isOpen?w(`@astryx.dateInput.toggleCalendarClose`):w(`@astryx.dateInput.openCalendar`),...{0:{className:`astryx78zum5 astryx6s0dn4 astryxl56j7k astryx1717udv astryx1ghz6dp astryxc342km astryxng3xce astryxjbqb8w astryx1ypdohk astryxh6dtrn astryx1a2a7pz astryx1p25gnr astryx1y3gkto`},1:{className:`astryx78zum5 astryx6s0dn4 astryxl56j7k astryx1717udv astryx1ghz6dp astryxc342km astryxng3xce astryxjbqb8w astryxh6dtrn astryx1a2a7pz astryx1p25gnr astryx1y3gkto astryx1h6gzvc`}}[!!V<<0],children:(0,v.jsx)(we,{icon:`calendar`,size:`sm`,color:`secondary`})}),(0,v.jsx)(`input`,{ref:de(S,M),id:O,type:`text`,role:`combobox`,value:et,onChange:dt,onBlur:pt,onClick:ut,onKeyDown:mt,placeholder:T,disabled:V&&!H,"aria-disabled":H?`true`:void 0,readOnly:H||void 0,"aria-describedby":Ye,"aria-required":o===!0?`true`:void 0,"aria-invalid":p?.type===`error`||!tt?`true`:void 0,"aria-busy":B||void 0,"aria-expanded":Q.isOpen,"aria-haspopup":`dialog`,"aria-controls":Q.isOpen?Q.id:void 0,"aria-autocomplete":`none`,autoComplete:`off`,...{0:{className:`astryx1lliihq astryx98rzlu astryxeuugli astryxc342km astryxng3xce astryx1717udv astryx9ynric astryxjm74w1 astryx6pjikd astryxw6l6zx astryx1tgivj0 astryxjbqb8w astryx1a2a7pz astryxeyghm5`},2:{className:`astryx1lliihq astryx98rzlu astryxeuugli astryxc342km astryxng3xce astryx1717udv astryx9ynric astryxjm74w1 astryx6pjikd astryxw6l6zx astryx1tgivj0 astryxjbqb8w astryx1a2a7pz astryxeyghm5 astryx1h6gzvc`},1:{className:`astryx1lliihq astryx98rzlu astryxeuugli astryxc342km astryxng3xce astryx1717udv astryx9ynric astryxjm74w1 astryx6pjikd astryxw6l6zx astryxjbqb8w astryx1a2a7pz astryxeyghm5 astryxv1l7n4`},3:{className:`astryx1lliihq astryx98rzlu astryxeuugli astryxc342km astryxng3xce astryx1717udv astryx9ynric astryxjm74w1 astryx6pjikd astryxw6l6zx astryxjbqb8w astryx1a2a7pz astryxeyghm5 astryx1h6gzvc astryxv1l7n4`}}[!!V<<1|!tt<<0]}),(0,v.jsx)(xe,{as:`div`,role:`alert`,"aria-live":`assertive`,children:tt?``:`Invalid date`}),Ee&&l!==void 0&&!V&&(0,v.jsx)(`button`,{type:`button`,onClick:yt,"aria-label":w(`@astryx.dateInput.clear`,{label:e}),className:`astryx78zum5 astryx6s0dn4 astryxl56j7k astryx1717udv astryx1ghz6dp astryxc342km astryxng3xce astryxjbqb8w astryx1ypdohk astryxh6dtrn astryx1a2a7pz astryx1p25gnr astryx1y3gkto`,children:(0,v.jsx)(we,{icon:`close`,size:`sm`,color:`secondary`})}),B&&(0,v.jsx)(ye,{size:`sm`}),qe]}),(0,v.jsxs)(`div`,{ref:P,onClick:bt,onMouseUp:xt,...ue(fe(`date-time-input-time-segment`,{size:D,status:p?.type??null}),n(m.base,Ue[D],He.timeWrapper,V&&m.disabled,p&&Le[p.type],p&&!V&&Ie[p.type],p&&Re[p.type])),children:[(0,v.jsx)(`div`,{className:`astryx78zum5 astryx6s0dn4 astryxl56j7k astryx2lah0s`,children:(0,v.jsx)(we,{icon:`clock`,size:`sm`,color:`secondary`})}),(0,v.jsx)(`input`,{ref:N,id:k,type:`text`,value:ot,onChange:ht,onFocus:gt,onBlur:_t,onKeyDown:vt,placeholder:ct,disabled:V&&!H,"aria-disabled":H?`true`:void 0,readOnly:H||void 0,"aria-label":Me??w(`@astryx.dateTimeInput.timeSuffix`,{label:e}),"aria-describedby":Ye,"aria-required":o===!0?`true`:void 0,"aria-invalid":p?.type===`error`||!st?`true`:void 0,"aria-busy":B||void 0,...{0:{className:`astryx1lliihq astryx98rzlu astryxeuugli astryxc342km astryxng3xce astryx1717udv astryx9ynric astryxjm74w1 astryx6pjikd astryxw6l6zx astryx1tgivj0 astryxjbqb8w astryx1a2a7pz astryxeyghm5`},2:{className:`astryx1lliihq astryx98rzlu astryxeuugli astryxc342km astryxng3xce astryx1717udv astryx9ynric astryxjm74w1 astryx6pjikd astryxw6l6zx astryx1tgivj0 astryxjbqb8w astryx1a2a7pz astryxeyghm5 astryx1h6gzvc`},1:{className:`astryx1lliihq astryx98rzlu astryxeuugli astryxc342km astryxng3xce astryx1717udv astryx9ynric astryxjm74w1 astryx6pjikd astryxw6l6zx astryxjbqb8w astryx1a2a7pz astryxeyghm5 astryxv1l7n4`},3:{className:`astryx1lliihq astryx98rzlu astryxeuugli astryxc342km astryxng3xce astryx1717udv astryx9ynric astryxjm74w1 astryx6pjikd astryxw6l6zx astryxjbqb8w astryx1a2a7pz astryxeyghm5 astryx1h6gzvc astryxv1l7n4`}}[!!V<<1|!st<<0]}),(0,v.jsx)(xe,{as:`div`,role:`alert`,"aria-live":`assertive`,children:st?``:`Invalid time`})]})]}),Q.render((0,v.jsx)(Pe,{handleRef:F,mode:`single`,value:G.date,onChange:e=>$(e,`calendar`),min:Xe,max:Ze,dateConstraints:be,numberOfMonths:g,weekStartsOn:We}),{placement:`below`,alignment:`start`}),H&&Ke.renderTooltip(le)]})}var _,v,He,Ue;function We(){return(We=e((()=>{_=t(),r(),p(),ze(),f(),be(),ve(),Me(),Ne(),Ee(),he(),De(),Ae(),o(),re(),u(),l(),d(),v=pe(),He={row:{k1xSpc:`astryx78zum5`,kOIVth:`astryx1txdalj`,$$css:!0},dateWrapper:{kUk6DE:`astryx98rzlu`,kzQI83:null,kmuXW:null,kCS8Yb:`astryx1r8uery`,$$css:!0},timeWrapper:{kUk6DE:`astryx98rzlu`,kzQI83:null,kmuXW:null,kCS8Yb:`astryx1r8uery`,$$css:!0}},Ue={sm:{kZKoxP:`astryx6k0iem`,$$css:!0},md:{kZKoxP:`astryx1ueg155`,$$css:!0},lg:{kZKoxP:`astryxssyfek`,$$css:!0}},g.displayName=`DateTimeInput`,g.__docgenInfo={description:`A combined date and time picker with side-by-side date input and
time input under a single label. The date input opens a calendar
popover; the time input supports typed entry and arrow-key adjustment.

@example
\`\`\`
<DateTimeInput
  label="Meeting time"
  value={dateTime}
  onChange={setDateTime}
/>
\`\`\``,methods:[],displayName:`DateTimeInput`,props:{ref:{required:!1,tsType:{name:`ReactRef`,raw:`React.Ref<HTMLInputElement>`,elements:[{name:`HTMLInputElement`}]},description:`Ref forwarded to the date input element`},label:{required:!0,tsType:{name:`string`},description:`Label text for the input (required for accessibility).`},isLabelHidden:{required:!1,tsType:{name:`boolean`},description:`Whether to visually hide the label (still accessible to screen readers).
@default false`,defaultValue:{value:`false`,computed:!1}},description:{required:!1,tsType:{name:`string`},description:`Description text displayed between the label and input.`},isOptional:{required:!1,tsType:{name:`boolean`},description:`Whether the field is optional. Mutually exclusive with isRequired.
@default false`,defaultValue:{value:`false`,computed:!1}},isRequired:{required:!1,tsType:{name:`boolean`},description:`Whether the field is required. Mutually exclusive with isOptional.
@default false`,defaultValue:{value:`false`,computed:!1}},isDisabled:{required:!1,tsType:{name:`boolean`},description:`Whether the input is disabled.
@default false`,defaultValue:{value:`false`,computed:!1}},disabledMessage:{required:!1,tsType:{name:`string`},description:`Explains why the input is disabled. When set together with
\`isDisabled\`, the input shows a tooltip with this text on hover and
keyboard focus, and the date and time fields stay focusable (via
\`aria-disabled\`) so the reason is discoverable by keyboard and assistive
technology. Typing and calendar activation stay blocked.

Use this instead of wrapping a disabled input in \`Tooltip\` — disabled
controls don't emit the pointer events an external tooltip needs.

@example
\`\`\`
<DateTimeInput
  label="Meeting time"
  value={dateTime}
  onChange={setDateTime}
  isDisabled
  disabledMessage="You need the Editor role to change this"
/>
\`\`\``},value:{required:!1,tsType:{name:`intersection`,raw:`string & {
  readonly __brand: 'ISODateTimeString';
}`,elements:[{name:`string`},{name:`signature`,type:`object`,raw:`{
  readonly __brand: 'ISODateTimeString';
}`,signature:{properties:[{key:`__brand`,value:{name:`literal`,value:`'ISODateTimeString'`,required:!0}}]}}]},description:`The selected datetime in ISO 8601 format ("YYYY-MM-DDTHH:MM" or "YYYY-MM-DDTHH:MM:SS").`},onChange:{required:!0,tsType:{name:`signature`,type:`function`,raw:`(value: ISODateTimeString | undefined) => void`,signature:{arguments:[{type:{name:`union`,raw:`ISODateTimeString | undefined`,elements:[{name:`intersection`,raw:`string & {
  readonly __brand: 'ISODateTimeString';
}`,elements:[{name:`string`},{name:`signature`,type:`object`,raw:`{
  readonly __brand: 'ISODateTimeString';
}`,signature:{properties:[{key:`__brand`,value:{name:`literal`,value:`'ISODateTimeString'`,required:!0}}]}}]},{name:`undefined`}]},name:`value`}],return:{name:`void`}}},description:`Callback fired when the datetime changes.
Called with undefined when input is cleared.`},changeAction:{required:!1,tsType:{name:`signature`,type:`function`,raw:`(value: ISODateTimeString | undefined) => void | Promise<void>`,signature:{arguments:[{type:{name:`union`,raw:`ISODateTimeString | undefined`,elements:[{name:`intersection`,raw:`string & {
  readonly __brand: 'ISODateTimeString';
}`,elements:[{name:`string`},{name:`signature`,type:`object`,raw:`{
  readonly __brand: 'ISODateTimeString';
}`,signature:{properties:[{key:`__brand`,value:{name:`literal`,value:`'ISODateTimeString'`,required:!0}}]}}]},{name:`undefined`}]},name:`value`}],return:{name:`union`,raw:`void | Promise<void>`,elements:[{name:`void`},{name:`Promise`,elements:[{name:`void`}],raw:`Promise<void>`}]}}},description:`Async action on change. Fires after onChange.`},isLoading:{required:!1,tsType:{name:`boolean`},description:`Whether the input is in a loading state.
@default false`,defaultValue:{value:`false`,computed:!1}},min:{required:!1,tsType:{name:`intersection`,raw:`string & {
  readonly __brand: 'ISODateTimeString';
}`,elements:[{name:`string`},{name:`signature`,type:`object`,raw:`{
  readonly __brand: 'ISODateTimeString';
}`,signature:{properties:[{key:`__brand`,value:{name:`literal`,value:`'ISODateTimeString'`,required:!0}}]}}]},description:`Minimum selectable datetime in ISO format.
Constrains both date and time selection.`},max:{required:!1,tsType:{name:`intersection`,raw:`string & {
  readonly __brand: 'ISODateTimeString';
}`,elements:[{name:`string`},{name:`signature`,type:`object`,raw:`{
  readonly __brand: 'ISODateTimeString';
}`,signature:{properties:[{key:`__brand`,value:{name:`literal`,value:`'ISODateTimeString'`,required:!0}}]}}]},description:`Maximum selectable datetime in ISO format.
Constrains both date and time selection.`},dateConstraints:{required:!1,tsType:{name:`ReadonlyArray`,elements:[{name:`signature`,type:`function`,raw:`(date: Date) => boolean`,signature:{arguments:[{type:{name:`Date`},name:`date`}],return:{name:`boolean`}}}],raw:`ReadonlyArray<(date: Date) => boolean>`},description:`Custom date constraint functions.
Date is disabled in the calendar if ANY function returns false.`},hasSeconds:{required:!1,tsType:{name:`boolean`},description:`Whether to include seconds in the time portion.
@default false`,defaultValue:{value:`false`,computed:!1}},hourFormat:{required:!1,tsType:{name:`union`,raw:`'12h' | '24h'`,elements:[{name:`literal`,value:`'12h'`},{name:`literal`,value:`'24h'`}]},description:`Hour display format.
@default '12h'`,defaultValue:{value:`'12h'`,computed:!1}},timeIncrement:{required:!1,tsType:{name:`union`,raw:`1 | 5 | 10 | 15 | 30`,elements:[{name:`literal`,value:`1`},{name:`literal`,value:`5`},{name:`literal`,value:`10`},{name:`literal`,value:`15`},{name:`literal`,value:`30`}]},description:`Minutes added or subtracted when stepping the time field with the arrow
keys. Constrained to a set of sensible increments.
@default 1`,defaultValue:{value:`1`,computed:!1}},hasClear:{required:!1,tsType:{name:`boolean`},description:`Whether to show a clear button when a value is set.
@default false`,defaultValue:{value:`false`,computed:!1}},placeholder:{required:!1,tsType:{name:`string`},description:`Placeholder text shown in the date portion when no date is selected.
@default "Select a date"`},timePlaceholder:{required:!1,tsType:{name:`string`},description:`Placeholder text shown in the time portion when no time is selected.
@default "Select a time"`},timeLabel:{required:!1,tsType:{name:`string`},description:`Accessible label for the time portion of the field. Defaults to
\`"{label} time"\` so it is tied to the field's own label and localizable,
rather than a hardcoded English "Time".`},size:{required:!1,tsType:{name:`union`,raw:`'sm' | 'md' | 'lg'`,elements:[{name:`literal`,value:`'sm'`},{name:`literal`,value:`'md'`},{name:`literal`,value:`'lg'`}]},description:`The size of the inputs.
@default 'md'`},status:{required:!1,tsType:{name:`InputStatus`},description:`Status indicator for the input.`},width:{required:!1,tsType:{name:`union`,raw:`number | string`,elements:[{name:`number`},{name:`string`}]},description:"Width of the field. Numbers are treated as pixels, strings are used as-is\n(e.g. `'100%'`). Sizes the whole field (label, control, and status) so they\nstay aligned, unlike setting width via `xstyle`/`className`/`style`."},labelTooltip:{required:!1,tsType:{name:`string`},description:`Tooltip text to display in an info icon at the end of the label.`},numberOfMonths:{required:!1,tsType:{name:`union`,raw:`1 | 2`,elements:[{name:`literal`,value:`1`},{name:`literal`,value:`2`}]},description:`Number of months to display in the calendar.
@default 1`,defaultValue:{value:`1`,computed:!1}},weekStartsOn:{required:!1,tsType:{name:`union`,raw:`DayOfWeek | DayOfWeekName`,elements:[{name:`union`,raw:`0 | 1 | 2 | 3 | 4 | 5 | 6`,elements:[{name:`literal`,value:`0`},{name:`literal`,value:`1`},{name:`literal`,value:`2`},{name:`literal`,value:`3`},{name:`literal`,value:`4`},{name:`literal`,value:`5`},{name:`literal`,value:`6`}]},{name:`union`,raw:`| 'sun'
| 'mon'
| 'tue'
| 'wed'
| 'thu'
| 'fri'
| 'sat'`,elements:[{name:`literal`,value:`'sun'`},{name:`literal`,value:`'mon'`},{name:`literal`,value:`'tue'`},{name:`literal`,value:`'wed'`},{name:`literal`,value:`'thu'`},{name:`literal`,value:`'fri'`},{name:`literal`,value:`'sat'`}]}]},description:`First day of week in the calendar. Accepts a number
(0 = Sunday … 6 = Saturday) or a three-letter day name ('sun'–'sat',
case-insensitive).
@default 0`}},composes:[`Omit`]}})))()}var y,b,Ge,x,S,C,w,T,E,D,O,k,A,j,M,N,P,F,I,L,R,z,B,V;function H(){return(H=e((()=>{y=t(),We(),c(),_e(),b=pe(),Ge={title:`Core/DateTimeInput`,component:g,tags:[`autodocs`],argTypes:{label:{control:`text`,description:`Label text (required)`},isLabelHidden:{control:`boolean`,description:`Visually hide the label (still accessible to screen readers)`},placeholder:{control:`text`,description:`Placeholder text`},description:{control:`text`,description:`Description text displayed between the label and input`},isOptional:{control:`boolean`,description:`Whether the field is optional (mutually exclusive with isRequired)`},isRequired:{control:`boolean`,description:`Whether the field is required (mutually exclusive with isOptional)`},isDisabled:{control:`boolean`,description:`Whether the input is disabled`},disabledMessage:{control:`text`,description:`Explains why the input is disabled. With isDisabled, shows a tooltip on hover/keyboard focus and keeps the field focusable via aria-disabled (activation stays blocked). Use this instead of wrapping a disabled DateTimeInput in Tooltip.`},size:{control:`radio`,options:[`sm`,`md`,`lg`]},hourFormat:{control:`radio`,options:[`12h`,`24h`],description:`Hour format for display`},hasSeconds:{control:`boolean`,description:`Whether to include seconds in the time`},hasClear:{control:`boolean`,description:`Whether to show a clear button`},numberOfMonths:{control:`radio`,options:[1,2],description:`Number of months to display in calendar`},timeIncrement:{control:`number`,description:`Minutes to increment/decrement with arrow keys`}}},x={render:e=>{let[t,n]=(0,y.useState)(void 0);return(0,b.jsx)(g,{...e,value:t,onChange:n})},args:{label:`Meeting time`,placeholder:`Select a date`}},S={render:e=>{let[t,n]=(0,y.useState)(`2026-03-15T14:30`);return(0,b.jsx)(g,{...e,value:t,onChange:n})},args:{label:`Event time`}},C={render:e=>{let[t,n]=(0,y.useState)(`2026-03-15T14:30`);return(0,b.jsx)(g,{...e,value:t,onChange:n})},args:{label:`Appointment`,hourFormat:`24h`}},w={render:e=>{let[t,n]=(0,y.useState)(`2026-03-15T14:30:45`);return(0,b.jsx)(g,{...e,value:t,onChange:n})},args:{label:`Log timestamp`,hasSeconds:!0}},T={render:e=>{let[t,n]=(0,y.useState)(void 0);return(0,b.jsx)(g,{...e,value:t,onChange:n})},args:{label:`Deadline`,description:`When is this task due?`,placeholder:`Select deadline`}},E={render:e=>{let[t,n]=(0,y.useState)(`2026-03-15T09:00`);return(0,b.jsx)(g,{...e,value:t,onChange:n})},args:{label:`Start time`,hasClear:!0}},D={render:e=>{let[t,n]=(0,y.useState)(void 0);return(0,b.jsx)(g,{...e,value:t,onChange:n})},args:{label:`Appointment`,min:`2026-03-15T09:00`,max:`2026-03-15T17:00`,description:`Available: Mar 15, 9 AM - 5 PM`}},O={render:e=>{let[t,n]=(0,y.useState)(`2026-03-15T09:00`);return(0,b.jsx)(g,{...e,value:t,onChange:n})},args:{label:`Time slot`,timeIncrement:15,description:`Use arrow keys to change by 15 minutes`}},k={render:e=>{let[t,n]=(0,y.useState)(void 0);return(0,b.jsx)(g,{...e,value:t,onChange:n})},args:{label:`Preferred time`,isOptional:!0,placeholder:`Select a date (optional)`}},A={render:e=>{let[t,n]=(0,y.useState)(void 0);return(0,b.jsx)(g,{...e,value:t,onChange:n})},args:{label:`Start time`,isRequired:!0}},j={render:e=>{let[t,n]=(0,y.useState)(`2026-03-15T10:00`);return(0,b.jsx)(g,{...e,value:t,onChange:n})},args:{label:`Locked time`,isDisabled:!0}},M={render:e=>{let[t,n]=(0,y.useState)(void 0);return(0,b.jsx)(g,{...e,value:t,onChange:n})},args:{label:`Meeting time`,isDisabled:!0,disabledMessage:`You need the Editor role to change this`}},N={render:()=>{let[e,t]=(0,y.useState)(void 0),[n,r]=(0,y.useState)(void 0),[i,ee]=(0,y.useState)(void 0);return(0,b.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`16px`,maxWidth:`460px`},children:[(0,b.jsx)(g,{label:`Small (28px)`,value:e,onChange:t,placeholder:`Small size`,size:`sm`}),(0,b.jsx)(g,{label:`Medium (32px)`,value:n,onChange:r,placeholder:`Medium size (default)`,size:`md`}),(0,b.jsx)(g,{label:`Large (36px)`,value:i,onChange:ee,placeholder:`Large size`,size:`lg`})]})}},P={render:e=>{let[t,n]=(0,y.useState)(void 0);return(0,b.jsx)(g,{...e,value:t,onChange:n})},args:{label:`Travel departure`,numberOfMonths:2}},F={render:e=>{let[t,n]=(0,y.useState)(`2026-03-15T14:30`);return(0,b.jsx)(g,{...e,value:t,onChange:n})},args:{label:`Event time`,status:{type:`error`,message:`This time slot is not available`}}},I={render:e=>{let[t,n]=(0,y.useState)(`2026-03-15T07:00`);return(0,b.jsx)(g,{...e,value:t,onChange:n})},args:{label:`Meeting time`,status:{type:`warning`,message:`Early morning meeting - are you sure?`}}},L={render:e=>{let[t,n]=(0,y.useState)(`2026-03-15T10:00`);return(0,b.jsx)(g,{...e,value:t,onChange:n})},args:{label:`Scheduled time`,status:{type:`success`,message:`Time slot is available`}}},R={render:()=>{let[e,t]=(0,y.useState)(void 0),[n,r]=(0,y.useState)(`2026-03-15T14:30`),[i,ee]=(0,y.useState)(`2026-03-15T14:30`),[te,ne]=(0,y.useState)(void 0),[re,a]=(0,y.useState)(`2026-03-15T10:00`),[o,ie]=(0,y.useState)(`2026-03-15T22:00`);return(0,b.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`16px`,maxWidth:`460px`},children:[(0,b.jsx)(g,{label:`Default`,value:e,onChange:t,placeholder:`Select a date`}),(0,b.jsx)(g,{label:`With value (12h)`,value:n,onChange:r}),(0,b.jsx)(g,{label:`24-hour format`,value:i,onChange:ee,hourFormat:`24h`}),(0,b.jsx)(g,{label:`With description`,description:`Pick your preferred datetime`,value:te,onChange:ne}),(0,b.jsx)(g,{label:`Disabled`,isDisabled:!0,value:re,onChange:a}),(0,b.jsx)(g,{label:`With error`,value:o,onChange:ie,status:{type:`error`,message:`Invalid datetime selection`}})]})}},z=ge({name:`date-time-input-segments-demo`,components:{"date-time-input-date-segment":{base:{borderColor:`var(--color-accent)`}},"date-time-input-time-segment":{base:{backgroundColor:`var(--color-background-muted)`}}}}),B={render:()=>{let[e,t]=(0,y.useState)();return(0,b.jsx)(le,{theme:z,mode:`light`,children:(0,b.jsx)(g,{label:`Themed segments`,description:`Date segment gets an accent border; time segment a muted fill.`,value:e,onChange:t})})}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<ISODateTimeString | undefined>(undefined);
    return <DateTimeInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Meeting time',
    placeholder: 'Select a date'
  }
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<ISODateTimeString | undefined>('2026-03-15T14:30' as ISODateTimeString);
    return <DateTimeInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Event time'
  }
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<ISODateTimeString | undefined>('2026-03-15T14:30' as ISODateTimeString);
    return <DateTimeInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Appointment',
    hourFormat: '24h'
  }
}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<ISODateTimeString | undefined>('2026-03-15T14:30:45' as ISODateTimeString);
    return <DateTimeInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Log timestamp',
    hasSeconds: true
  }
}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<ISODateTimeString | undefined>(undefined);
    return <DateTimeInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Deadline',
    description: 'When is this task due?',
    placeholder: 'Select deadline'
  }
}`,...T.parameters?.docs?.source}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<ISODateTimeString | undefined>('2026-03-15T09:00' as ISODateTimeString);
    return <DateTimeInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Start time',
    hasClear: true
  }
}`,...E.parameters?.docs?.source}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<ISODateTimeString | undefined>(undefined);
    return <DateTimeInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Appointment',
    min: '2026-03-15T09:00' as ISODateTimeString,
    max: '2026-03-15T17:00' as ISODateTimeString,
    description: 'Available: Mar 15, 9 AM - 5 PM'
  }
}`,...D.parameters?.docs?.source}}},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<ISODateTimeString | undefined>('2026-03-15T09:00' as ISODateTimeString);
    return <DateTimeInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Time slot',
    timeIncrement: 15,
    description: 'Use arrow keys to change by 15 minutes'
  }
}`,...O.parameters?.docs?.source}}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<ISODateTimeString | undefined>(undefined);
    return <DateTimeInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Preferred time',
    isOptional: true,
    placeholder: 'Select a date (optional)'
  }
}`,...k.parameters?.docs?.source}}},A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<ISODateTimeString | undefined>(undefined);
    return <DateTimeInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Start time',
    isRequired: true
  }
}`,...A.parameters?.docs?.source}}},j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<ISODateTimeString | undefined>('2026-03-15T10:00' as ISODateTimeString);
    return <DateTimeInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Locked time',
    isDisabled: true
  }
}`,...j.parameters?.docs?.source}}},M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<ISODateTimeString | undefined>(undefined);
    return <DateTimeInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Meeting time',
    isDisabled: true,
    disabledMessage: 'You need the Editor role to change this'
  }
}`,...M.parameters?.docs?.source}}},N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [sm, setSm] = useState<ISODateTimeString | undefined>(undefined);
    const [md, setMd] = useState<ISODateTimeString | undefined>(undefined);
    const [lg, setLg] = useState<ISODateTimeString | undefined>(undefined);
    return <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      maxWidth: '460px'
    }}>
        <DateTimeInput label="Small (28px)" value={sm} onChange={setSm} placeholder="Small size" size="sm" />
        <DateTimeInput label="Medium (32px)" value={md} onChange={setMd} placeholder="Medium size (default)" size="md" />
        <DateTimeInput label="Large (36px)" value={lg} onChange={setLg} placeholder="Large size" size="lg" />
      </div>;
  }
}`,...N.parameters?.docs?.source}}},P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<ISODateTimeString | undefined>(undefined);
    return <DateTimeInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Travel departure',
    numberOfMonths: 2
  }
}`,...P.parameters?.docs?.source}}},F.parameters={...F.parameters,docs:{...F.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<ISODateTimeString | undefined>('2026-03-15T14:30' as ISODateTimeString);
    return <DateTimeInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Event time',
    status: {
      type: 'error',
      message: 'This time slot is not available'
    }
  }
}`,...F.parameters?.docs?.source}}},I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<ISODateTimeString | undefined>('2026-03-15T07:00' as ISODateTimeString);
    return <DateTimeInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Meeting time',
    status: {
      type: 'warning',
      message: 'Early morning meeting - are you sure?'
    }
  }
}`,...I.parameters?.docs?.source}}},L.parameters={...L.parameters,docs:{...L.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<ISODateTimeString | undefined>('2026-03-15T10:00' as ISODateTimeString);
    return <DateTimeInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Scheduled time',
    status: {
      type: 'success',
      message: 'Time slot is available'
    }
  }
}`,...L.parameters?.docs?.source}}},R.parameters={...R.parameters,docs:{...R.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [value1, setValue1] = useState<ISODateTimeString | undefined>(undefined);
    const [value2, setValue2] = useState<ISODateTimeString | undefined>('2026-03-15T14:30' as ISODateTimeString);
    const [value3, setValue3] = useState<ISODateTimeString | undefined>('2026-03-15T14:30' as ISODateTimeString);
    const [value4, setValue4] = useState<ISODateTimeString | undefined>(undefined);
    const [value5, setValue5] = useState<ISODateTimeString | undefined>('2026-03-15T10:00' as ISODateTimeString);
    const [value6, setValue6] = useState<ISODateTimeString | undefined>('2026-03-15T22:00' as ISODateTimeString);
    return <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      maxWidth: '460px'
    }}>
        <DateTimeInput label="Default" value={value1} onChange={setValue1} placeholder="Select a date" />
        <DateTimeInput label="With value (12h)" value={value2} onChange={setValue2} />
        <DateTimeInput label="24-hour format" value={value3} onChange={setValue3} hourFormat="24h" />
        <DateTimeInput label="With description" description="Pick your preferred datetime" value={value4} onChange={setValue4} />
        <DateTimeInput label="Disabled" isDisabled value={value5} onChange={setValue5} />
        <DateTimeInput label="With error" value={value6} onChange={setValue6} status={{
        type: 'error',
        message: 'Invalid datetime selection'
      }} />
      </div>;
  }
}`,...R.parameters?.docs?.source}}},B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = useState<ISODateTimeString | undefined>();
    return <Theme theme={segmentTheme} mode="light">
        <DateTimeInput label="Themed segments" description="Date segment gets an accent border; time segment a muted fill." value={value} onChange={setValue} />
      </Theme>;
  }
}`,...B.parameters?.docs?.source}}},V=[`Default`,`WithValue`,`TwentyFourHourFormat`,`WithSeconds`,`WithDescription`,`WithClearButton`,`WithMinMax`,`WithTimeIncrement`,`Optional`,`Required`,`Disabled`,`DisabledWithMessage`,`SizeVariants`,`TwoMonthCalendar`,`WithErrorStatus`,`WithWarningStatus`,`WithSuccessStatus`,`AllVariations`,`ThemedSegments`]})))()}H();export{R as AllVariations,x as Default,j as Disabled,M as DisabledWithMessage,k as Optional,A as Required,N as SizeVariants,B as ThemedSegments,C as TwentyFourHourFormat,P as TwoMonthCalendar,E as WithClearButton,T as WithDescription,F as WithErrorStatus,D as WithMinMax,w as WithSeconds,L as WithSuccessStatus,O as WithTimeIncrement,S as WithValue,I as WithWarningStatus,V as __namedExportsOrder,Ge as default};