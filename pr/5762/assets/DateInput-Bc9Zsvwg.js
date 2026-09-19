import{i as e,s as t}from"./preload-helper-CT_b8DTk.js";import{t as n}from"./react-B7Te67-h.js";import{D as ee,E as te,F as r,M as i,N as ne,P as a,n as re,p as o,s}from"./ime-Dy4QRKoo.js";import{$ as ie,A as c,At as ae,Ot as oe,P as se,_t as ce,a as le,at as ue,c as de,ct as fe,dt as pe,gt as me,nt as l,o as u,t as he,y as ge}from"./utils-eYNPhPe_.js";import{t as d}from"./jsx-runtime-DqZldVDK.js";import{n as _e}from"./useTooltip-B06VSoGn.js";import{n as ve,t as ye}from"./useMergedRefs-BMVAJ2uJ.js";import{n as be,t as f}from"./Spinner-BZP2AEJJ.js";import{n as xe,t as p}from"./VisuallyHidden-DDrJpIxj.js";import{n as Se,r as Ce}from"./SizeContext-fcGnTOs5.js";import{t as we}from"./Button-jZQbvkAS.js";import{n as Te,t as Ee}from"./interactionOverlay.stylex-C5f1Dywb.js";import{l as De,s as Oe,t as ke}from"./i18n-CbA7usjw.js";import{t as Ae}from"./Button-Drb32upm.js";import{a as m,o as je}from"./useTheme-BjGFIaE4.js";import{t as Me}from"./Icon-CzOM-LKW.js";import{t as h}from"./Icon-DPxLsWR4.js";import{a as Ne,i as g,t as _}from"./hooks-CXn4x-6m.js";import{t as Pe}from"./Tooltip-ClW5NtN7.js";import{t as Fe}from"./BottomSheet-BE9f-_4T.js";import{t as Ie}from"./BottomSheet-DvmYmxYt.js";import{n as v}from"./usePopover-C8OM8s-Z.js";import{n as Le,t as y}from"./IconButton-CEbDZYdj.js";import{t as b}from"./Popover-CHfjYBLU.js";import{a as Re,c as ze,i as x,n as S,o as C,t as w}from"./Calendar-DbTKF9cg.js";import{t as Be}from"./Field-Gh3YZ0p5.js";import{c as Ve,l as He,n as Ue,o as We,s as Ge,t as T}from"./Field-n-TKUTjF.js";import{n as Ke,t as E}from"./useResolvedRequired-BMZRMgEt.js";import{a as D,i as qe,n as Je,r as Ye}from"./InputGroupContext-BonpDGzu.js";import{n as O,t as k}from"./nativeDateSegments-DGMrrvQy.js";import{t as A}from"./InputGroup-BO19M7Z8.js";import{t as j}from"./SizeContext-i5ojWMEJ.js";import{a as M,c as Xe,d as Ze,f as N,l as P,n as F,o as I,s as L,t as Qe,u as $e}from"./MonthYearWheels-CehFzihu.js";function R({label:e,isLabelHidden:t=!1,description:n,isOptional:te=!1,isRequired:i=!1,isDisabled:a=!1,disabledMessage:re,value:o,onChange:s,isLoading:c=!1,min:ae,max:ue,dateConstraints:de,placeholder:pe,size:me,status:l,statusVariant:u=`attached`,labelTooltip:he,hasClear:d=!1,numberOfMonths:ye,weekStartsOn:f,format:p=`date_long`,width:Se,xstyle:we,className:Te,style:Ee,ref:ke,...Ae}){let m=De(),h=Oe(),g=Ke({isRequired:i,isOptional:te}),_=pe??m(`@astryx.dateInput.placeholder`),Pe=Ce(me,`md`),Fe=je(`(pointer: coarse)`),Ie=(0,z.useId)(),v=(0,z.useId)(),Le=(0,z.useId)(),y=(0,z.useId)(),b=(0,z.useRef)(null),Re=ve(ke,b),x=Ye(),S=a||c,C=a&&!!re,w=_e({placement:`above`,focusTrigger:`always`,isEnabled:C}),{isDateDisabled:T}=ze({min:ae,max:ue,dateConstraints:de}),{statusIcon:E,describedBy:D}=Ne({status:l,statusVariant:u,isInGroup:!!x}),{ariaLabelledBy:Je,ariaDescribedBy:O}=ge(v,[n?Le:null,u!==`tooltip`&&l?.message?y:null,D,C?w.describedBy:null],x),[A,j]=(0,z.useState)(null),[M,Xe]=(0,z.useState)(!1),[Ze,N]=(0,z.useState)(!1),P=(0,z.useRef)(null),F=(0,z.useRef)(o);o!==F.current&&(F.current=o,P.current=null,A!==null&&j(null));let I=o&&tt.test(o)?o:``,L=A===null,Qe=(0,z.useCallback)(e=>typeof p==`function`?p(e):fe(ce(e),p,h),[p,h]),$e=I?Qe(I):_,R=!!$e&&!(M&&Ze),H=(0,z.useCallback)(e=>{if(S||P.current===e)return;if(P.current=e,!e){j(null),o!==void 0&&s?.(void 0);return}let t=ie(e,h);if(!t)return;if(T(t)){j(e);return}j(null);let n=oe(t);n!==o&&s?.(n)},[o,s,T,S,h]),U=(0,z.useCallback)(e=>{H(e.target.value)},[H]),W=(0,z.useRef)(H);(0,z.useEffect)(()=>{W.current=H}),(0,z.useEffect)(()=>{let e=b.current;if(!e)return;let t=()=>W.current(e.value);return e.addEventListener(`input`,t),e.addEventListener(`change`,t),()=>{e.removeEventListener(`input`,t),e.removeEventListener(`change`,t)}},[]);let G=(0,z.useRef)(null);G.current===null&&(G.current=I),(0,z.useEffect)(()=>{if(M)return;let e=b.current;e&&e.value!==I&&(e.value=I)},[M,I]);let nt=(0,z.useCallback)(()=>{N(k(Fe)),Xe(!0)},[Fe]),K=(0,z.useCallback)(()=>{let e=b.current?.value;Xe(!1),j(null),e!==void 0&&e!==I&&H(e)},[H,I]),rt=(0,z.useCallback)(()=>{s?.(void 0)},[s]),q=(0,z.useCallback)(()=>{if(S)return;let e=b.current;if(e&&(e.focus(),typeof e.showPicker==`function`))try{e.showPicker()}catch{}},[S]),J=(0,B.jsxs)(`div`,{ref:e=>{w.ref(e)},...Ae,...se(ee(`date-input`,{size:Pe,status:l?.type??null,disabled:a?`disabled`:null}),r(He.base,V[Pe],et.wrapper,S&&He.disabled,l&&We[l.type],l&&!S&&Ve[l.type],l&&Ge[l.type],x&&qe.inGroup,we),Te,Ee),children:[x&&(0,B.jsx)(xe,{id:v,children:e}),(0,B.jsx)(`button`,{type:`button`,onClick:q,disabled:S,"aria-label":m(`@astryx.dateInput.openCalendar`),tabIndex:-1,...r(le.focusVisible,et.iconButton,S&&et.iconButtonDisabled),children:(0,B.jsx)(Me,{icon:`calendar`,size:`sm`,color:`secondary`,...ee(`date-input-toggle-icon`,{state:`collapsed`})})}),(0,B.jsxs)(`span`,{className:`astryx1n2onr6 astryx78zum5 astryx6s0dn4 astryx98rzlu astryxeuugli`,children:[(0,B.jsx)(`input`,{ref:Re,id:Ie,type:`date`,defaultValue:G.current??``,onChange:U,onFocus:nt,onBlur:K,min:ae,max:ue,disabled:S&&!C,"aria-disabled":C?`true`:void 0,readOnly:C||void 0,"aria-labelledby":Je,"aria-describedby":O,"aria-required":g?`true`:void 0,"aria-invalid":l?.type===`error`||!L?`true`:void 0,"aria-busy":c||void 0,...{0:{className:`astryx1lliihq astryx98rzlu astryxeuugli astryxc342km astryxng3xce astryx1717udv astryx9ynric astryxjm74w1 astryx6pjikd astryxw6l6zx astryx1tgivj0 astryxjbqb8w astryx1a2a7pz astryx1oglpa6 astryx1lugfcp astryxjyslct astryxolhmmf astryx9rmy9g astryxpsyfx0 astryx1qqcexc astryx1x4c3m6 astryxkqr7wz astryx1f74mqm astryxec4aax astryxtbxizx astryxslb4at astryx15bqym3`},4:{className:`astryx1lliihq astryx98rzlu astryxeuugli astryxc342km astryxng3xce astryx1717udv astryx9ynric astryxjm74w1 astryx6pjikd astryxw6l6zx astryxjbqb8w astryx1a2a7pz astryx1oglpa6 astryx1lugfcp astryxjyslct astryxolhmmf astryx9rmy9g astryxpsyfx0 astryx1qqcexc astryx1x4c3m6 astryxkqr7wz astryx1f74mqm astryxec4aax astryxtbxizx astryxslb4at astryx15bqym3 astryx19co3pv astryxg7jpbn`},2:{className:`astryx1lliihq astryx98rzlu astryxeuugli astryxc342km astryxng3xce astryx1717udv astryx9ynric astryxjm74w1 astryx6pjikd astryxw6l6zx astryx1tgivj0 astryxjbqb8w astryx1a2a7pz astryx1oglpa6 astryx1lugfcp astryxjyslct astryxolhmmf astryx9rmy9g astryxpsyfx0 astryx1qqcexc astryx1x4c3m6 astryxkqr7wz astryx1f74mqm astryxec4aax astryxtbxizx astryxslb4at astryx15bqym3 astryxt0e3qv`},6:{className:`astryx1lliihq astryx98rzlu astryxeuugli astryxc342km astryxng3xce astryx1717udv astryx9ynric astryxjm74w1 astryx6pjikd astryxw6l6zx astryxjbqb8w astryx1a2a7pz astryx1oglpa6 astryx1lugfcp astryxjyslct astryxolhmmf astryx9rmy9g astryxpsyfx0 astryx1qqcexc astryx1x4c3m6 astryxkqr7wz astryx1f74mqm astryxec4aax astryxtbxizx astryxslb4at astryx15bqym3 astryx19co3pv astryxg7jpbn astryxt0e3qv`},1:{className:`astryx1lliihq astryx98rzlu astryxeuugli astryxc342km astryxng3xce astryx1717udv astryx9ynric astryxjm74w1 astryx6pjikd astryxw6l6zx astryxjbqb8w astryx1a2a7pz astryx1oglpa6 astryx1lugfcp astryxjyslct astryxolhmmf astryx9rmy9g astryxpsyfx0 astryx1qqcexc astryx1x4c3m6 astryxkqr7wz astryx1f74mqm astryxec4aax astryxtbxizx astryxslb4at astryx15bqym3 astryxv1l7n4`},5:{className:`astryx1lliihq astryx98rzlu astryxeuugli astryxc342km astryxng3xce astryx1717udv astryx9ynric astryxjm74w1 astryx6pjikd astryxw6l6zx astryxjbqb8w astryx1a2a7pz astryx1oglpa6 astryx1lugfcp astryxjyslct astryxolhmmf astryx9rmy9g astryxpsyfx0 astryx1qqcexc astryx1x4c3m6 astryxkqr7wz astryx1f74mqm astryxec4aax astryxtbxizx astryxslb4at astryx15bqym3 astryxg7jpbn astryxv1l7n4`},3:{className:`astryx1lliihq astryx98rzlu astryxeuugli astryxc342km astryxng3xce astryx1717udv astryx9ynric astryxjm74w1 astryx6pjikd astryxw6l6zx astryxjbqb8w astryx1a2a7pz astryx1oglpa6 astryx1lugfcp astryxjyslct astryxolhmmf astryx9rmy9g astryxpsyfx0 astryx1qqcexc astryx1x4c3m6 astryxkqr7wz astryx1f74mqm astryxec4aax astryxtbxizx astryxslb4at astryx15bqym3 astryxt0e3qv astryxv1l7n4`},7:{className:`astryx1lliihq astryx98rzlu astryxeuugli astryxc342km astryxng3xce astryx1717udv astryx9ynric astryxjm74w1 astryx6pjikd astryxw6l6zx astryxjbqb8w astryx1a2a7pz astryx1oglpa6 astryx1lugfcp astryxjyslct astryxolhmmf astryx9rmy9g astryxpsyfx0 astryx1qqcexc astryx1x4c3m6 astryxkqr7wz astryx1f74mqm astryxec4aax astryxtbxizx astryxslb4at astryx15bqym3 astryxg7jpbn astryxt0e3qv astryxv1l7n4`}}[!!R<<2|!!S<<1|!L<<0]}),R&&(0,B.jsx)(`span`,{"aria-hidden":`true`,...{0:{className:`astryx10l6tqk astryx1o0tod astryxtijo5x astryx10no89f astryx1lliihq astryxjm74w1 astryx6pjikd astryxw6l6zx astryx47corl astryxb3r6kr astryxuxw1ft astryxlyipyv astryxv1l7n4`},4:{className:`astryx10l6tqk astryx1o0tod astryxtijo5x astryx10no89f astryx1lliihq astryxjm74w1 astryx6pjikd astryxw6l6zx astryx47corl astryxb3r6kr astryxuxw1ft astryxlyipyv astryx1tgivj0`},2:{className:`astryx10l6tqk astryx1o0tod astryxtijo5x astryx10no89f astryx1lliihq astryxjm74w1 astryx6pjikd astryxw6l6zx astryx47corl astryxb3r6kr astryxuxw1ft astryxlyipyv astryxv1l7n4 astryxt0e3qv`},6:{className:`astryx10l6tqk astryx1o0tod astryxtijo5x astryx10no89f astryx1lliihq astryxjm74w1 astryx6pjikd astryxw6l6zx astryx47corl astryxb3r6kr astryxuxw1ft astryxlyipyv astryx1tgivj0 astryxt0e3qv`},1:{className:`astryx10l6tqk astryx1o0tod astryxtijo5x astryx10no89f astryx1lliihq astryxjm74w1 astryx6pjikd astryxw6l6zx astryx47corl astryxb3r6kr astryxuxw1ft astryxlyipyv astryxv1l7n4`},5:{className:`astryx10l6tqk astryx1o0tod astryxtijo5x astryx10no89f astryx1lliihq astryxjm74w1 astryx6pjikd astryxw6l6zx astryx47corl astryxb3r6kr astryxuxw1ft astryxlyipyv astryxv1l7n4`},3:{className:`astryx10l6tqk astryx1o0tod astryxtijo5x astryx10no89f astryx1lliihq astryxjm74w1 astryx6pjikd astryxw6l6zx astryx47corl astryxb3r6kr astryxuxw1ft astryxlyipyv astryxt0e3qv astryxv1l7n4`},7:{className:`astryx10l6tqk astryx1o0tod astryxtijo5x astryx10no89f astryx1lliihq astryxjm74w1 astryx6pjikd astryxw6l6zx astryx47corl astryxb3r6kr astryxuxw1ft astryxlyipyv astryxt0e3qv astryxv1l7n4`}}[!!I<<2|!!S<<1|!!(!L&&I)<<0],children:$e})]}),(0,B.jsx)(xe,{as:`div`,role:`alert`,"aria-live":`assertive`,children:L?``:m(`@astryx.dateInput.invalidDate`)}),d&&o!==void 0&&!S&&(0,B.jsx)(Ue,{label:m(`@astryx.dateInput.clear`,{label:e}),onClick:rt,iconClassName:ne(`date-input-clear-icon`)}),c&&(0,B.jsx)(be,{size:`sm`}),E,C&&w.renderTooltip(re)]});return x?J:(0,B.jsx)(Be,{label:e,isLabelHidden:t,description:n,inputID:Ie,descriptionID:n?Le:void 0,isOptional:te,isRequired:i,isDisabled:a,status:l?{type:l.type,message:l.message,messageID:l.message?y:void 0}:void 0,statusVariant:u,labelTooltip:he,width:Se,children:J})}var z,B,et,V,tt,H=e((()=>{z=t(n(),1),a(),w(),O(),T(),_(),m(),E(),h(),ke(),A(),D(),i(),j(),f(),Pe(),p(),he(),B=d(),et={wrapper:{kOIVth:`astryx167g77z`,khm7nJ:null,k1C7PZ:null,$$css:!0},iconButton:{k1xSpc:`astryx78zum5`,kGNEyG:`astryx6s0dn4`,kjj79g:`astryxl56j7k`,kmVPX3:`astryx1717udv`,kg3NbH:null,kuDDbn:null,kE3dHu:null,kP0aTx:null,kpe85a:null,k8WAf4:null,kLKAdn:null,kGO01o:null,kogj98:`astryx1ghz6dp`,kUOVxO:null,keTefX:null,koQZXg:null,k71WvV:null,km5ZXQ:null,kqGvvJ:null,keoZOQ:null,k1K539:null,kMzoRj:`astryxc342km`,kjGldf:null,k2ei4v:null,kZ1KPB:null,ke9TFa:null,kWqL5O:null,kLoX6v:null,kEafiO:null,kt9PQ7:null,ksu8eU:`astryxng3xce`,kJRH4f:null,kVhnKS:null,k4WBpm:null,k8ry5P:null,kSWEuD:null,kDUl1X:null,kPef9Z:null,kfdmCh:null,kWkggS:`astryxjbqb8w`,kkrTdU:`astryx1ypdohk astryx16khyan`,kaIpWk:`astryxh6dtrn`,krdFHd:null,kfmiAY:null,kVL7Gh:null,kT0f0o:null,kIxVMA:null,ksF3WI:null,kqGeR4:null,kYm2EN:null,$$css:!0},iconButtonDisabled:{kkrTdU:`astryxt0e3qv`,$$css:!0}},V={sm:{kZKoxP:`astryx6k0iem`,k7Eaqz:`astryxfb3i0g`,$$css:!0},md:{kZKoxP:`astryx1ueg155`,k7Eaqz:`astryxfb3i0g`,$$css:!0},lg:{kZKoxP:`astryxssyfek`,k7Eaqz:`astryxfb3i0g`,$$css:!0}},tt=/^\d{4}-\d{2}-\d{2}$/,R.displayName=`NativeDateField`,R.__docgenInfo={description:"The OS-picker surface. Takes `DateInput`'s props verbatim; see\n{@link DateInput} for when it is chosen over the other two.",methods:[],displayName:`NativeDateField`,props:{ref:{required:!1,tsType:{name:`ReactRef`,raw:`React.Ref<HTMLInputElement>`,elements:[{name:`HTMLInputElement`}]},description:`Ref forwarded to the root element`},label:{required:!0,tsType:{name:`string`},description:`Label text for the input (required for accessibility).`},isLabelHidden:{required:!1,tsType:{name:`boolean`},description:`Whether to visually hide the label (still accessible to screen readers).
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
@default 1`},weekStartsOn:{required:!1,tsType:{name:`union`,raw:`DayOfWeek | DayOfWeekName`,elements:[{name:`union`,raw:`0 | 1 | 2 | 3 | 4 | 5 | 6`,elements:[{name:`literal`,value:`0`},{name:`literal`,value:`1`},{name:`literal`,value:`2`},{name:`literal`,value:`3`},{name:`literal`,value:`4`},{name:`literal`,value:`5`},{name:`literal`,value:`6`}]},{name:`union`,raw:`| 'sun'
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
\`\`\``,defaultValue:{value:`'date_long'`,computed:!1}},nativePicker:{required:!1,tsType:{name:`union`,raw:`'touch' | 'always' | 'never'`,elements:[{name:`literal`,value:`'touch'`},{name:`literal`,value:`'always'`},{name:`literal`,value:`'never'`}]},description:`When date picking is handed to the browser/OS instead of Astryx's own
surfaces: the field becomes an \`<input type="date">\` and the platform
draws the picker — the iOS wheel, the Android calendar dialog — with the
OS's own hit areas, momentum scrolling, locale and accessibility
settings.

- \`'touch'\` (default): native on touch devices (coarse pointer), the text
  field and calendar popover on mouse-driven ones
- \`'always'\`: native wherever the browser supports \`<input type="date">\`
- \`'never'\`: Astryx's own pickers everywhere — the touch picker on a
  finger, the calendar popover on a mouse

\`format\` and \`placeholder\` still apply in native mode: DateInput paints
the closed field's text itself, over the control. \`numberOfMonths\` and
\`weekStartsOn\` do not — they describe a calendar grid the native picker
does not have — so a field that needs either should pass \`'never'\`.

\`min\` and \`max\` are forwarded, but note that a native picker may not
*show* them: on iOS they are constraint-validation flags rather than
clamps, so an out-of-range date can be selected and is refused on commit
(announced to assistive technology) rather than being greyed out in the
picker. \`dateConstraints\` is enforced the same way, on commit, and is
reason enough to prefer \`'never'\` on a field that uses it.

@default 'touch'
@example
\`\`\`
// Astryx's own touch picker instead of the platform's
<DateInput label="Event date" value={date} onChange={setDate} nativePicker="never" />
\`\`\``}},composes:[`Omit`]}}));function U({label:e,isLabelHidden:t=!1,description:n,isOptional:te=!1,isRequired:i=!1,isDisabled:a=!1,disabledMessage:o,value:s,onChange:ie,changeAction:c,isLoading:oe=!1,min:pe,max:u,dateConstraints:he,placeholder:d,size:ye,status:f,statusVariant:p=`attached`,labelTooltip:Se,hasClear:Ee=!1,numberOfMonths:ke,weekStartsOn:Ae=0,format:m=`date_long`,width:je,xstyle:h,className:g,style:_,ref:Pe,...Ie}){let v=De(),y=Oe(),b=Ke({isRequired:i,isOptional:te}),x=d??v(`@astryx.dateInput.placeholder`),S=Ce(ye,`md`),C=Re(Ae),w=(0,W.useId)(),T=(0,W.useId)(),E=(0,W.useId)(),D=(0,W.useId)(),Je=(0,W.useRef)(null),O=ve(Pe,Je),k=Ye(),[,A]=(0,W.useTransition)(),[j,Ze]=(0,W.useOptimistic)(s),N=oe||j!==s,P=a||N,F=a&&!!o,I=_e({placement:`above`,focusTrigger:`always`,isEnabled:F}),{isDateDisabled:R}=ze({min:pe,max:u,dateConstraints:he}),{statusIcon:z,describedBy:B}=Ne({status:f,statusVariant:p,isInGroup:!!k}),{ariaLabelledBy:et,ariaDescribedBy:V}=ge(T,[n?E:null,p!==`tooltip`&&f?.message?D:null,B,F?I.describedBy:null],k),[tt,H]=(0,W.useState)(!1),[U,rt]=(0,W.useState)(!1),q=(0,W.useRef)(null),J=(0,W.useRef)(null);(0,W.useEffect)(()=>()=>{J.current!=null&&clearTimeout(J.current)},[]);let Y=(0,W.useMemo)(()=>ae(),[]),X=(0,W.useMemo)(()=>j!=null&&/^\d{4}-\d{2}-\d{2}$/.test(j)?ce(j):null,[j]),[it]=(0,W.useState)(()=>$e(s!=null&&/^\d{4}-\d{2}-\d{2}$/.test(s)?ce(s):ae())),Z=pe==null?it-600:$e(ce(pe)),Q=u==null?it+600:$e(ce(u)),[$,at]=(0,W.useState)(()=>L(it,Z,Q)),{year:ot,month:st}=Xe($),ct=(0,W.useMemo)(()=>Array.from({length:7},(e,t)=>me({year:1970,month:1,day:4+(C+t)%7},ue,y)),[y,C]),lt=me({year:ot,month:st,day:1},l,y),ut=j!=null&&/^\d{4}-\d{2}-\d{2}$/.test(j)?typeof m==`function`?m(j):fe(ce(j),m,y):``,dt=(0,W.useCallback)(e=>{N||(ie?.(e),c&&A(async()=>{Ze(e),await c(e)}))},[N,ie,c,A,Ze]),ft=(0,W.useCallback)(()=>{P||(rt(!1),H(!0))},[P]),pt=(0,W.useCallback)(()=>{dt(void 0);let e=Je.current;e!=null&&(J.current=window.setTimeout(()=>{J.current=null,e.focus({preventScroll:!0})},0))},[dt]),mt=(0,W.useCallback)(()=>{dt(void 0);let e=$e(Y);e<Z||e>Q||e!==$&&(at(e),q.current?.scrollToMonth(e,`smooth`))},[dt,Y,$,Z,Q]),ht=(0,W.useCallback)(e=>{dt(e)},[dt]),gt=$>Z,_t=$<Q,vt=(0,W.useCallback)(e=>{let t=L($+e,Z,Q);t!==$&&(at(t),q.current?.scrollToMonth(t,`smooth`))},[$,Z,Q]),yt=(0,W.useCallback)(e=>{at(e),q.current?.scrollToMonth(e,`auto`)},[]),bt=(0,W.useCallback)(e=>{U||at(e)},[U]),xt=(0,W.useRef)($);xt.current=$,(0,W.useEffect)(()=>{U||q.current?.scrollToMonth(xt.current,`auto`)},[U]);let St=(0,W.useCallback)(e=>{re(e.nativeEvent)||(e.key===`ArrowDown`||e.key===`Enter`||e.key===` `||e.key===`Spacebar`)&&(e.preventDefault(),ft())},[ft]),Ct=(0,G.jsxs)(`div`,{className:`astryx78zum5 astryxdt5ytf astryxh8yej3`,children:[(0,G.jsxs)(`div`,{className:`astryx78zum5 astryx6s0dn4 astryx1qughib astryx1txdalj astryxssyfek`,children:[(0,G.jsxs)(`button`,{type:`button`,onClick:()=>rt(e=>!e),"aria-expanded":U,"aria-label":v(`@astryx.dateInput.chooseMonthYear`,{monthYear:lt}),"data-title":`month-year`,...r(K.title,Te.backgroundColor,le.focusVisible),children:[(0,G.jsx)(`span`,{className:`astryxeuugli astryxb3r6kr astryxlyipyv`,children:lt}),(0,G.jsx)(Me,{icon:`chevronDown`,size:`sm`,color:`secondary`,xstyle:[K.titleChevron,U&&K.titleChevronOpen]})]}),(0,G.jsxs)(`span`,{"data-arrows":`months`,inert:U?!0:void 0,...{0:{className:`astryx78zum5 astryx6s0dn4 astryx1lsbc85 astryxvc5jky astryx1jl3cmp astryxuedmi6 astryxcj1dhv astryxzg1mie`},1:{className:`astryx78zum5 astryx6s0dn4 astryx1lsbc85 astryxvc5jky astryx1jl3cmp astryxuedmi6 astryxcj1dhv astryxzg1mie astryxlshs6z astryxg01cxk astryx47corl`}}[!!U<<0],children:[(0,G.jsx)(Le,{variant:`ghost`,size:`sm`,xstyle:[K.monthArrow,!gt&&K.monthArrowUnavailable],isDisabled:!gt,onClick:()=>vt(-1),label:v(`@astryx.calendar.previousMonth`),icon:(0,G.jsx)(`span`,{...r(K.monthArrowIcon,de.mirror),children:(0,G.jsx)(Me,{icon:`chevronLeft`,size:`sm`,color:`inherit`})})}),(0,G.jsx)(Le,{variant:`ghost`,size:`sm`,xstyle:[K.monthArrow,!_t&&K.monthArrowUnavailable],isDisabled:!_t,onClick:()=>vt(1),label:v(`@astryx.calendar.nextMonth`),icon:(0,G.jsx)(`span`,{...r(K.monthArrowIcon,de.mirror),children:(0,G.jsx)(Me,{icon:`chevronRight`,size:`sm`,color:`inherit`})})})]}),(0,G.jsx)(`span`,{"data-action":`reset`,inert:U?!0:void 0,...{0:{className:`astryx78zum5 astryx6s0dn4 astryx1jl3cmp astryxuedmi6 astryxcj1dhv astryxzg1mie`},1:{className:`astryx78zum5 astryx6s0dn4 astryx1jl3cmp astryxuedmi6 astryxcj1dhv astryxzg1mie astryxlshs6z astryxg01cxk astryx47corl`}}[!!U<<0],children:(0,G.jsx)(we,{variant:`ghost`,size:`sm`,xstyle:K.resetButton,label:v(`@astryx.dateInput.resetPicking`),onClick:mt})})]}),(0,G.jsx)(`div`,{"aria-hidden":`true`,...{0:{className:`astryxrvj5dj astryx1mzazjb astryx6k0iem astryx6s0dn4 astryx1jl3cmp astryxuedmi6 astryxcj1dhv astryxzg1mie`},1:{className:`astryxrvj5dj astryx1mzazjb astryx6k0iem astryx6s0dn4 astryx1jl3cmp astryxuedmi6 astryxcj1dhv astryxzg1mie astryxlshs6z astryxg01cxk`}}[!!U<<0],children:ct.map(e=>(0,G.jsx)(`div`,{className:`astryx2b8uid astryx141an7d astryx1sodnla astryxv1l7n4`,children:e},e))}),(0,G.jsxs)(`div`,{className:`astryxrvj5dj astryx9hmfof astryx1n2onr6`,children:[(0,G.jsx)(`div`,{"data-panel":`calendar`,inert:U?!0:void 0,...{0:{className:`astryx15r89dc astryxeuugli astryx74b7sa astryxuedmi6 astryxzg1mie`},1:{className:`astryx15r89dc astryxeuugli astryx74b7sa astryxuedmi6 astryxzg1mie astryxlshs6z astryx47corl`}}[!!U<<0],children:(0,G.jsx)(M,{handleRef:q,minMonthIndex:Z,maxMonthIndex:Q,initialMonthIndex:$,onVisibleMonthChange:bt,selectedDate:X,today:Y,isDateDisabled:R,weekStartsOn:C,onSelect:ht},`${Z}:${Q}`)}),(0,G.jsx)(`div`,{"data-panel":`wheels`,inert:U?void 0:!0,...{0:{className:`astryx15r89dc astryxeuugli astryx10xzikg astryxc8icb0 astryx1jl3cmp astryxuedmi6 astryxcj1dhv astryxzg1mie`},1:{className:`astryx15r89dc astryxeuugli astryx10xzikg astryxc8icb0 astryx1jl3cmp astryxuedmi6 astryxcj1dhv astryxzg1mie astryxlshs6z astryxg01cxk astryx47corl`}}[!U<<0],children:(0,G.jsx)(Qe,{monthIndex:$,minMonthIndex:Z,maxMonthIndex:Q,onChange:yt,monthLabel:v(`@astryx.dateInput.monthWheel`),yearLabel:v(`@astryx.dateInput.yearWheel`),isActive:U})})]}),(0,G.jsxs)(`div`,{className:`astryx1xye8es astryxrvj5dj astryx1y6fwsi`,children:[(0,G.jsx)(`div`,{inert:U?!0:void 0,...{0:{className:`astryx15r89dc astryx78zum5 astryx74b7sa astryxuedmi6 astryxzg1mie`},1:{className:`astryx15r89dc astryx78zum5 astryx74b7sa astryxuedmi6 astryxzg1mie astryxlshs6z astryx47corl`}}[!!U<<0],children:(0,G.jsx)(we,{variant:`primary`,size:`md`,width:`100%`,label:v(`@astryx.dateInput.savePicking`),onClick:()=>H(!1)})}),(0,G.jsx)(`div`,{inert:U?void 0:!0,...{0:{className:`astryx15r89dc astryx78zum5 astryx10xzikg astryxc8icb0 astryx1jl3cmp astryxuedmi6 astryxcj1dhv astryxzg1mie`},1:{className:`astryx15r89dc astryx78zum5 astryx10xzikg astryxc8icb0 astryx1jl3cmp astryxuedmi6 astryxcj1dhv astryxzg1mie astryxlshs6z astryxg01cxk astryx47corl`}}[!U<<0],children:(0,G.jsx)(we,{variant:`secondary`,size:`md`,width:`100%`,label:v(`@astryx.dateInput.doneChoosingMonth`),onClick:()=>rt(!1)})})]})]}),wt=(0,G.jsxs)(`div`,{ref:e=>{I.ref(e)},...Ie,...se(ee(`date-input`,{size:S,status:f?.type??null,disabled:a?`disabled`:null}),r(He.base,nt[S],K.wrapper,P&&He.disabled,f&&We[f.type],f&&!P&&Ve[f.type],f&&Ge[f.type],k&&qe.inGroup,h),g,_),children:[k&&(0,G.jsx)(xe,{id:T,children:e}),(0,G.jsx)(`button`,{type:`button`,onClick:ft,disabled:P,"aria-label":v(`@astryx.dateInput.openCalendar`),tabIndex:-1,...r(le.focusVisible,K.iconButton,P&&K.iconButtonDisabled),children:(0,G.jsx)(Me,{icon:`calendar`,size:`sm`,color:`secondary`,...ee(`date-input-toggle-icon`,{state:tt?`expanded`:`collapsed`})})}),(0,G.jsx)(`input`,{ref:O,id:w,type:`text`,role:`combobox`,value:ut,readOnly:!0,inputMode:`none`,onChange:()=>{},onClick:ft,onKeyDown:St,placeholder:x,disabled:P&&!F,"aria-disabled":F?`true`:void 0,"aria-labelledby":et,"aria-describedby":V,"aria-required":b?`true`:void 0,"aria-invalid":f?.type===`error`?`true`:void 0,"aria-busy":N||void 0,"aria-expanded":tt,"aria-haspopup":`dialog`,"aria-autocomplete":`none`,autoComplete:`off`,...{0:{className:`astryx1lliihq astryx98rzlu astryxeuugli astryxc342km astryxng3xce astryx1717udv astryx9ynric astryxjm74w1 astryx6pjikd astryxw6l6zx astryx1tgivj0 astryxjbqb8w astryx1a2a7pz astryxbuiw85 astryx1ypdohk astryx16khyan astryx87ps6o astryxeyghm5`},1:{className:`astryx1lliihq astryx98rzlu astryxeuugli astryxc342km astryxng3xce astryx1717udv astryx9ynric astryxjm74w1 astryx6pjikd astryxw6l6zx astryx1tgivj0 astryxjbqb8w astryx1a2a7pz astryxbuiw85 astryx87ps6o astryxeyghm5 astryxt0e3qv`}}[!!P<<0]}),Ee&&s!==void 0&&!P&&(0,G.jsx)(Ue,{label:v(`@astryx.dateInput.clear`,{label:e}),onClick:pt,iconClassName:ne(`date-input-clear-icon`)}),N&&(0,G.jsx)(be,{size:`sm`}),z,(0,G.jsx)(Fe,{isOpen:tt,onOpenChange:H,label:v(`@astryx.dateInput.dialogLabel`),height:`hug`,children:(0,G.jsx)(`div`,{className:`astryx1pzlopt astryx1adxfkp astryx1awphl8`,children:Ct})}),F&&I.renderTooltip(o)]});return k?wt:(0,G.jsx)(Be,{label:e,isLabelHidden:t,description:n,inputID:w,descriptionID:n?E:void 0,isOptional:te,isRequired:i,isDisabled:a,status:f?{type:f.type,message:f.message,messageID:f.message?D:void 0}:void 0,statusVariant:p,labelTooltip:Se,width:je,children:wt})}var W,G,nt,K,rt=e((()=>{W=t(n(),1),a(),Ie(),Ae(),w(),T(),_(),E(),h(),y(),ke(),A(),D(),i(),j(),f(),o(),Pe(),p(),he(),Ee(),x(),I(),F(),P(),N(),G=d(),Ze.daySize,s[`--duration-fast`],nt={sm:{kZKoxP:`astryx6k0iem`,k7Eaqz:`astryxfb3i0g`,$$css:!0},md:{kZKoxP:`astryx1ueg155`,k7Eaqz:`astryxfb3i0g`,$$css:!0},lg:{kZKoxP:`astryxssyfek`,k7Eaqz:`astryxfb3i0g`,$$css:!0}},K={wrapper:{kOIVth:`astryx1txdalj`,khm7nJ:null,k1C7PZ:null,$$css:!0},iconButton:{k1xSpc:`astryx78zum5`,kGNEyG:`astryx6s0dn4`,kjj79g:`astryxl56j7k`,kmVPX3:`astryx1717udv`,kg3NbH:null,kuDDbn:null,kE3dHu:null,kP0aTx:null,kpe85a:null,k8WAf4:null,kLKAdn:null,kGO01o:null,kogj98:`astryx1ghz6dp`,kUOVxO:null,keTefX:null,koQZXg:null,k71WvV:null,km5ZXQ:null,kqGvvJ:null,keoZOQ:null,k1K539:null,kMzoRj:`astryxc342km`,kjGldf:null,k2ei4v:null,kZ1KPB:null,ke9TFa:null,kWqL5O:null,kLoX6v:null,kEafiO:null,kt9PQ7:null,ksu8eU:`astryxng3xce`,kJRH4f:null,kVhnKS:null,k4WBpm:null,k8ry5P:null,kSWEuD:null,kDUl1X:null,kPef9Z:null,kfdmCh:null,kWkggS:`astryxjbqb8w`,kkrTdU:`astryx1ypdohk astryx16khyan`,kaIpWk:`astryxh6dtrn`,krdFHd:null,kfmiAY:null,kVL7Gh:null,kT0f0o:null,kIxVMA:null,ksF3WI:null,kqGeR4:null,kYm2EN:null,$$css:!0},iconButtonDisabled:{kkrTdU:`astryxt0e3qv`,$$css:!0},monthArrowUnavailable:{k33iCy:`astryxlshs6z`,$$css:!0},monthArrow:{kAzted:`astryx3z0ggl`,k7Eaqz:`astryx1om6rbs`,$$css:!0},monthArrowIcon:{k1xSpc:`astryx3nfvp2`,$$css:!0},resetButton:{kAzted:`astryx3z0ggl`,$$css:!0},title:{k1xSpc:`astryx78zum5`,kGNEyG:`astryx6s0dn4`,kOIVth:`astryxzye2dw`,kZKoxP:`astryx5yr21d`,kg3NbH:`astryxf314gf`,keTefX:`astryx1s1akpx`,kMzoRj:`astryxc342km`,ksu8eU:`astryxng3xce`,kaIpWk:`astryxh6dtrn`,kWkggS:`astryxjbqb8w`,kMwMTN:`astryx1tgivj0`,kGuDYH:`astryx18juvz8`,k63SB2:`astryx2mo6ok`,kkrTdU:`astryx1ypdohk astryx16khyan`,khDVqt:`astryxuxw1ft`,k7Eaqz:`astryxeuugli`,kVQacm:`astryxb3r6kr`,$$css:!0},titleChevron:{k1xSpc:`astryx3nfvp2`,kmuXW:`astryx2lah0s`,k1ekBW:`astryx11xpdln`,kIyJzY:`astryxuedmi6`,kAMwcw:`astryxlr8y92`,k6CgDc:`astryxzg1mie`,$$css:!0},titleChevronOpen:{k3aq6I:`astryx19jd1h0`,$$css:!0}},U.displayName=`TouchDateField`,U.__docgenInfo={description:"The touch surface. Takes `DateInput`'s props verbatim; see\n{@link DateInput} for when it is chosen over the desktop control.",methods:[],displayName:`TouchDateField`,props:{ref:{required:!1,tsType:{name:`ReactRef`,raw:`React.Ref<HTMLInputElement>`,elements:[{name:`HTMLInputElement`}]},description:`Ref forwarded to the root element`},label:{required:!0,tsType:{name:`string`},description:`Label text for the input (required for accessibility).`},isLabelHidden:{required:!1,tsType:{name:`boolean`},description:`Whether to visually hide the label (still accessible to screen readers).
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
@default 1`},weekStartsOn:{required:!1,tsType:{name:`union`,raw:`DayOfWeek | DayOfWeekName`,elements:[{name:`union`,raw:`0 | 1 | 2 | 3 | 4 | 5 | 6`,elements:[{name:`literal`,value:`0`},{name:`literal`,value:`1`},{name:`literal`,value:`2`},{name:`literal`,value:`3`},{name:`literal`,value:`4`},{name:`literal`,value:`5`},{name:`literal`,value:`6`}]},{name:`union`,raw:`| 'sun'
| 'mon'
| 'tue'
| 'wed'
| 'thu'
| 'fri'
| 'sat'`,elements:[{name:`literal`,value:`'sun'`},{name:`literal`,value:`'mon'`},{name:`literal`,value:`'tue'`},{name:`literal`,value:`'wed'`},{name:`literal`,value:`'thu'`},{name:`literal`,value:`'fri'`},{name:`literal`,value:`'sat'`}]}]},description:`First day of week in the calendar popover. Accepts a number
(0 = Sunday … 6 = Saturday) or a three-letter day name ('sun'–'sat',
case-insensitive).
@default 0`,defaultValue:{value:`0`,computed:!1}},format:{required:!1,tsType:{name:`union`,raw:`DateInputFormat | ((value: ISODateString) => string)`,elements:[{name:`Extract`,elements:[{name:`union`,raw:`| 'relative'
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
\`\`\``,defaultValue:{value:`'date_long'`,computed:!1}},nativePicker:{required:!1,tsType:{name:`union`,raw:`'touch' | 'always' | 'never'`,elements:[{name:`literal`,value:`'touch'`},{name:`literal`,value:`'always'`},{name:`literal`,value:`'never'`}]},description:`When date picking is handed to the browser/OS instead of Astryx's own
surfaces: the field becomes an \`<input type="date">\` and the platform
draws the picker — the iOS wheel, the Android calendar dialog — with the
OS's own hit areas, momentum scrolling, locale and accessibility
settings.

- \`'touch'\` (default): native on touch devices (coarse pointer), the text
  field and calendar popover on mouse-driven ones
- \`'always'\`: native wherever the browser supports \`<input type="date">\`
- \`'never'\`: Astryx's own pickers everywhere — the touch picker on a
  finger, the calendar popover on a mouse

\`format\` and \`placeholder\` still apply in native mode: DateInput paints
the closed field's text itself, over the control. \`numberOfMonths\` and
\`weekStartsOn\` do not — they describe a calendar grid the native picker
does not have — so a field that needs either should pass \`'never'\`.

\`min\` and \`max\` are forwarded, but note that a native picker may not
*show* them: on iOS they are constraint-validation flags rather than
clamps, so an out-of-range date can be selected and is refused on commit
(announced to assistive technology) rather than being greyed out in the
picker. \`dateConstraints\` is enforced the same way, on commit, and is
reason enough to prefer \`'never'\` on a field that uses it.

@default 'touch'
@example
\`\`\`
// Astryx's own touch picker instead of the platform's
<DateInput label="Event date" value={date} onChange={setDate} nativePicker="never" />
\`\`\``}},composes:[`Omit`]}}));function q({label:e,isLabelHidden:t=!1,description:n,isOptional:te=!1,isRequired:i=!1,isDisabled:a=!1,disabledMessage:o,value:s,onChange:ae,changeAction:ue,isLoading:de=!1,min:pe,max:me,dateConstraints:l,placeholder:u,size:he,status:d,statusVariant:ye=`attached`,labelTooltip:f,hasClear:p=!1,numberOfMonths:Se=1,weekStartsOn:we,format:Te=`date_long`,width:Ee,xstyle:ke,className:Ae,style:m,ref:je,...h}){let g=De(),_=Oe(),Pe=Ke({isRequired:i,isOptional:te}),Fe=u??g(`@astryx.dateInput.placeholder`),Ie=Ce(he,`md`),Le=(0,Y.useId)(),y=(0,Y.useId)(),b=(0,Y.useId)(),Re=(0,Y.useId)(),x=(0,Y.useRef)(null),C=(0,Y.useRef)(null),w=(0,Y.useRef)(void 0),T=Ye(),[,E]=(0,Y.useTransition)(),[D,Je]=(0,Y.useOptimistic)(s),O=de||D!==s,k=a||O,A=a&&!!o,j=_e({placement:`above`,focusTrigger:`always`,isEnabled:A}),{isDateDisabled:M}=ze({min:pe,max:me,dateConstraints:l}),{statusIcon:Xe,describedBy:Ze}=Ne({status:d,statusVariant:ye,isInGroup:!!T}),{ariaLabelledBy:N,ariaDescribedBy:P}=ge(y,[n?b:null,ye!==`tooltip`&&d?.message?Re:null,Ze,A?j.describedBy:null],T),[F,I]=(0,Y.useState)(null),L=(0,Y.useRef)(s);s!==L.current&&(L.current=s,s!==w.current&&(w.current=void 0,F!==null&&I(null)));let Qe=(0,Y.useCallback)(e=>typeof Te==`function`?Te(e):fe(ce(e),Te,_),[Te,_]),$e=F===null?D&&/^\d{4}-\d{2}-\d{2}$/.test(D)?Qe(D):``:F,R=F===null||!F.trim()?!0:ie(F,_)!==null,z=v({dialogLabel:g(`@astryx.dateInput.dialogLabel`),closeButtonLabel:g(`@astryx.dateInput.closeCalendar`),onHide:()=>{c()&&x.current?.focus()}}),B=(0,Y.useCallback)(()=>{k||(z.isOpen?z.hide():z.show())},[k,z]),et=(0,Y.useCallback)(()=>{!k&&!z.isOpen&&z.show({skipAutoFocus:!0})},[k,z]),V=(0,Y.useCallback)(e=>{O||(ae?.(e),ue&&E(async()=>{Je(e),await ue(e)}))},[O,ae,ue,E,Je]),tt=(0,Y.useCallback)(()=>{V(void 0),x.current?.focus()},[V]),H=(0,Y.useCallback)(e=>{V(e),I(null),z.hide()},[V,z]),U=(0,Y.useCallback)(e=>{if(k)return;let t=e.target.value;I(t);let n=ie(t,_);if(n&&oe(n)!==s&&!M(n)){let e=oe(n);w.current=e,V(e),C.current?.navigateTo(e)}},[s,V,M,k,_]),W=(0,Y.useCallback)(()=>{if(F===null)return;if(!F.trim()){s!==void 0&&V(void 0),I(null);return}let e=ie(F,_);if(e&&!M(e)){let t=oe(e);t!==s&&V(t)}I(null)},[F,s,V,M,_]),G=(0,Y.useCallback)(()=>{W()},[W]),nt=(0,Y.useCallback)(e=>{re(e.nativeEvent)||(e.key===`Escape`&&z.isOpen?(e.preventDefault(),z.hide()):(e.key===`ArrowDown`||e.altKey&&e.key===`ArrowDown`)&&!z.isOpen?(e.preventDefault(),k||z.show({skipAutoFocus:!0})):e.key===`Enter`&&(e.preventDefault(),W()))},[z,W,k]),K=(0,X.jsxs)(`div`,{ref:e=>{z.triggerRef(e),j.ref(e)},...h,...se(ee(`date-input`,{size:Ie,status:d?.type??null,disabled:a?`disabled`:null}),r(He.base,Z[Ie],k&&He.disabled,d&&We[d.type],d&&!k&&Ve[d.type],d&&Ge[d.type],T&&qe.inGroup,ke),Ae,m),children:[T&&(0,X.jsx)(xe,{id:y,children:e}),(0,X.jsx)(`button`,{type:`button`,onClick:B,disabled:k,"aria-label":z.isOpen?g(`@astryx.dateInput.toggleCalendarClose`):g(`@astryx.dateInput.openCalendar`),...r(le.focusVisible,it.iconButton,k&&it.iconButtonDisabled),children:(0,X.jsx)(Me,{icon:`calendar`,size:`sm`,color:`secondary`,...ee(`date-input-toggle-icon`,{state:z.isOpen?`expanded`:`collapsed`})})}),(0,X.jsx)(`input`,{ref:ve(je,x),id:Le,type:`text`,role:`combobox`,value:$e,onChange:U,onBlur:G,onClick:et,onKeyDown:nt,placeholder:Fe,disabled:k&&!A,"aria-disabled":A?`true`:void 0,readOnly:A||void 0,"aria-labelledby":N,"aria-describedby":P,"aria-required":Pe?`true`:void 0,"aria-invalid":d?.type===`error`||!R?`true`:void 0,"aria-busy":O||void 0,"aria-expanded":z.isOpen,"aria-haspopup":`dialog`,"aria-controls":z.isOpen?z.id:void 0,"aria-autocomplete":`none`,autoComplete:`off`,...{0:{className:`astryx1lliihq astryx98rzlu astryxeuugli astryxc342km astryxng3xce astryx1717udv astryx9ynric astryxjm74w1 astryx6pjikd astryxw6l6zx astryx1tgivj0 astryxjbqb8w astryx1a2a7pz astryxeyghm5`},2:{className:`astryx1lliihq astryx98rzlu astryxeuugli astryxc342km astryxng3xce astryx1717udv astryx9ynric astryxjm74w1 astryx6pjikd astryxw6l6zx astryx1tgivj0 astryxjbqb8w astryx1a2a7pz astryxeyghm5 astryxt0e3qv`},1:{className:`astryx1lliihq astryx98rzlu astryxeuugli astryxc342km astryxng3xce astryx1717udv astryx9ynric astryxjm74w1 astryx6pjikd astryxw6l6zx astryxjbqb8w astryx1a2a7pz astryxeyghm5 astryxv1l7n4`},3:{className:`astryx1lliihq astryx98rzlu astryxeuugli astryxc342km astryxng3xce astryx1717udv astryx9ynric astryxjm74w1 astryx6pjikd astryxw6l6zx astryxjbqb8w astryx1a2a7pz astryxeyghm5 astryxt0e3qv astryxv1l7n4`}}[!!k<<1|!R<<0]}),(0,X.jsx)(xe,{as:`div`,role:`alert`,"aria-live":`assertive`,children:R?``:g(`@astryx.dateInput.invalidDate`)}),p&&s!==void 0&&!k&&(0,X.jsx)(Ue,{label:g(`@astryx.dateInput.clear`,{label:e}),onClick:tt,iconClassName:ne(`date-input-clear-icon`)}),O&&(0,X.jsx)(be,{size:`sm`}),Xe,z.render((0,X.jsx)(S,{handleRef:C,mode:`single`,value:D,onChange:H,min:pe,max:me,dateConstraints:l,numberOfMonths:Se,weekStartsOn:we}),{placement:`below`,alignment:`start`}),A&&j.renderTooltip(o)]});return T?K:(0,X.jsx)(Be,{label:e,isLabelHidden:t,description:n,inputID:Le,descriptionID:n?b:void 0,isOptional:te,isRequired:i,isDisabled:a,status:d?{type:d.type,message:d.message,messageID:d.message?Re:void 0}:void 0,statusVariant:ye,labelTooltip:f,width:Ee,children:K})}function J(e){let t=je(Q),n=e.nativePicker??`touch`;return n===`always`||n===`touch`&&t?(0,X.jsx)(R,{...e}):t?(0,X.jsx)(U,{...e}):(0,X.jsx)(q,{...e})}var Y,X,it,Z,Q,$=e((()=>{Y=t(n(),1),a(),T(),h(),p(),Je(),D(),Se(),f(),w(),C(),g(),m(),E(),b(),H(),rt(),Pe(),he(),pe(),X=d(),te(),u(),i(),ke(),ye(),it={iconButton:{k1xSpc:`astryx78zum5`,kGNEyG:`astryx6s0dn4`,kjj79g:`astryxl56j7k`,kmVPX3:`astryx1717udv`,kg3NbH:null,kuDDbn:null,kE3dHu:null,kP0aTx:null,kpe85a:null,k8WAf4:null,kLKAdn:null,kGO01o:null,kogj98:`astryx1ghz6dp`,kUOVxO:null,keTefX:null,koQZXg:null,k71WvV:null,km5ZXQ:null,kqGvvJ:null,keoZOQ:null,k1K539:null,kMzoRj:`astryxc342km`,kjGldf:null,k2ei4v:null,kZ1KPB:null,ke9TFa:null,kWqL5O:null,kLoX6v:null,kEafiO:null,kt9PQ7:null,ksu8eU:`astryxng3xce`,kJRH4f:null,kVhnKS:null,k4WBpm:null,k8ry5P:null,kSWEuD:null,kDUl1X:null,kPef9Z:null,kfdmCh:null,kWkggS:`astryxjbqb8w`,kkrTdU:`astryx1ypdohk astryx16khyan`,kaIpWk:`astryxh6dtrn`,krdFHd:null,kfmiAY:null,kVL7Gh:null,kT0f0o:null,kIxVMA:null,ksF3WI:null,kqGeR4:null,kYm2EN:null,$$css:!0},iconButtonDisabled:{kkrTdU:`astryxt0e3qv`,$$css:!0}},Z={sm:{kZKoxP:`astryx6k0iem`,k7Eaqz:`astryxfb3i0g`,$$css:!0},md:{kZKoxP:`astryx1ueg155`,k7Eaqz:`astryxfb3i0g`,$$css:!0},lg:{kZKoxP:`astryxssyfek`,k7Eaqz:`astryxfb3i0g`,$$css:!0}},Q=`(pointer: coarse)`,q.displayName=`PointerDateField`,J.displayName=`DateInput`,J.__docgenInfo={description:`A date picker that fits the pointer it is being used with.

With a mouse or trackpad this is a text input you can type into, with a
calendar in a popover — unchanged, and still the surface every existing
consumer gets. With a finger it is a picker built for one: a bottom sheet
holding one month per screen, swiped sideways, with month and year wheels
behind the header title for the far jumps swiping is bad at.

The props are identical either way — this is one component with two
surfaces, not two components — so nothing at the call site changes, and a
date typed on a laptop and a date thumbed on a phone are the same value.

## Why a runtime switch and not CSS

The two surfaces are structurally different — a popover anchored to a text
field versus a full-width sheet holding a scroller — so "render both, hide
one" would double the DOM, double the tab stops, and mount two calendars.
The condition is not layout either: it is *which interaction is faster*,
and that depends on the pointer, which CSS cannot hand to JS.

They are two components rather than one with a branch inside because the
hook lists differ; keeping them separate is what lets each own its own.

## Hydration

\`useMediaQuery\` reports false during SSR, so server HTML is always the
pointer field and the swap happens after hydration. That is deliberately
unobservable: both surfaces render the SAME closed field — a bordered input
with a calendar icon and the formatted date — and differ only in what
opens. Nothing moves; the field just starts opening a sheet.

@example
\`\`\`
<DateInput
  label="Event date"
  value={date}
  onChange={setDate}
/>
\`\`\``,methods:[],displayName:`DateInput`,props:{ref:{required:!1,tsType:{name:`ReactRef`,raw:`React.Ref<HTMLInputElement>`,elements:[{name:`HTMLInputElement`}]},description:`Ref forwarded to the root element`},label:{required:!0,tsType:{name:`string`},description:`Label text for the input (required for accessibility).`},isLabelHidden:{required:!1,tsType:{name:`boolean`},description:`Whether to visually hide the label (still accessible to screen readers).
@default false`},description:{required:!1,tsType:{name:`string`},description:`Description text displayed between the label and input.`},isOptional:{required:!1,tsType:{name:`boolean`},description:`Whether the field is optional. Mutually exclusive with isRequired.
@default false`},isRequired:{required:!1,tsType:{name:`boolean`},description:`Whether the field is required. Mutually exclusive with isOptional.
@default false`},isDisabled:{required:!1,tsType:{name:`boolean`},description:`Whether the input is disabled.
@default false`},disabledMessage:{required:!1,tsType:{name:`string`},description:`Explains why the input is disabled. When set together with
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
@default false`},min:{required:!1,tsType:{name:`literal`,value:"`${number}${number}${number}${number}-${number}${number}-${number}${number}`"},description:`Minimum selectable date in ISO format.`},max:{required:!1,tsType:{name:`literal`,value:"`${number}${number}${number}${number}-${number}${number}-${number}${number}`"},description:`Maximum selectable date in ISO format.`},dateConstraints:{required:!1,tsType:{name:`ReadonlyArray`,elements:[{name:`signature`,type:`function`,raw:`(date: Date) => boolean`,signature:{arguments:[{type:{name:`Date`},name:`date`}],return:{name:`boolean`}}}],raw:`ReadonlyArray<(date: Date) => boolean>`},description:`Custom date constraint functions. Date is disabled if ANY function returns false.`},placeholder:{required:!1,tsType:{name:`string`},description:`Placeholder text shown when no date is selected.
@default "Select a date"`},size:{required:!1,tsType:{name:`unknown`},description:`The size of the input.
- 'sm': Compact size (18px height)
- 'md': Default size (26px height)
@default 'md'`},status:{required:!1,tsType:{name:`InputStatus`},description:`Status indicator for the input.
When set, displays a colored border and status icon.
If message is provided, displays below the input.`},statusVariant:{required:!1,tsType:{name:`FieldStatusVariantMap`},description:`How the status message is placed relative to the input.
- 'attached': message overlaps directly below the input (bordered treatment)
- 'detached': message floats below as a separate element with spacing
- 'tooltip': no message box; the status icon becomes a focusable info-tip button that reveals the message on hover, keyboard focus, or tap
@default 'attached'`},width:{required:!1,tsType:{name:`union`,raw:`number | string`,elements:[{name:`number`},{name:`string`}]},description:"Width of the field. Numbers are treated as pixels, strings are used as-is\n(e.g. `'100%'`). Sizes the whole field (label, control, and status) so they\nstay aligned, unlike setting width via `xstyle`/`className`/`style`."},labelTooltip:{required:!1,tsType:{name:`string`},description:`Tooltip text to display in an info icon at the end of the label.`},hasClear:{required:!1,tsType:{name:`boolean`},description:`Whether to show a clear button when a date is set.
When clicked, resets the value to undefined and returns focus to the input.
@default false`},numberOfMonths:{required:!1,tsType:{name:`union`,raw:`1 | 2`,elements:[{name:`literal`,value:`1`},{name:`literal`,value:`2`}]},description:`Number of months to display in the calendar popover.
@default 1`},weekStartsOn:{required:!1,tsType:{name:`union`,raw:`DayOfWeek | DayOfWeekName`,elements:[{name:`union`,raw:`0 | 1 | 2 | 3 | 4 | 5 | 6`,elements:[{name:`literal`,value:`0`},{name:`literal`,value:`1`},{name:`literal`,value:`2`},{name:`literal`,value:`3`},{name:`literal`,value:`4`},{name:`literal`,value:`5`},{name:`literal`,value:`6`}]},{name:`union`,raw:`| 'sun'
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
\`\`\``},nativePicker:{required:!1,tsType:{name:`union`,raw:`'touch' | 'always' | 'never'`,elements:[{name:`literal`,value:`'touch'`},{name:`literal`,value:`'always'`},{name:`literal`,value:`'never'`}]},description:`When date picking is handed to the browser/OS instead of Astryx's own
surfaces: the field becomes an \`<input type="date">\` and the platform
draws the picker — the iOS wheel, the Android calendar dialog — with the
OS's own hit areas, momentum scrolling, locale and accessibility
settings.

- \`'touch'\` (default): native on touch devices (coarse pointer), the text
  field and calendar popover on mouse-driven ones
- \`'always'\`: native wherever the browser supports \`<input type="date">\`
- \`'never'\`: Astryx's own pickers everywhere — the touch picker on a
  finger, the calendar popover on a mouse

\`format\` and \`placeholder\` still apply in native mode: DateInput paints
the closed field's text itself, over the control. \`numberOfMonths\` and
\`weekStartsOn\` do not — they describe a calendar grid the native picker
does not have — so a field that needs either should pass \`'never'\`.

\`min\` and \`max\` are forwarded, but note that a native picker may not
*show* them: on iOS they are constraint-validation flags rather than
clamps, so an out-of-range date can be selected and is refused on commit
(announced to assistive technology) rather than being greyed out in the
picker. \`dateConstraints\` is enforced the same way, on commit, and is
reason enough to prefer \`'never'\` on a field that uses it.

@default 'touch'
@example
\`\`\`
// Astryx's own touch picker instead of the platform's
<DateInput label="Event date" value={date} onChange={setDate} nativePicker="never" />
\`\`\``}},composes:[`Omit`]}})),at=e((()=>{$()}));export{J as n,$ as r,at as t};