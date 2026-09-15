import{i as e,s as t}from"./preload-helper-CT_b8DTk.js";import{t as n}from"./react-B7Te67-h.js";import{D as r,E as i,F as a,M as o,N as ee,P as s,n as te,p as c,s as l}from"./ime-Dy4QRKoo.js";import{F as ne,_t as re,a as ie,c as ae,et as oe,ft as se,j as ce,jt as le,kt as ue,lt as de,o as fe,ot as u,rt as pe,t as me,vt as he,y as ge}from"./utils-CPeIlZn6.js";import{t as d}from"./jsx-runtime-DqZldVDK.js";import{n as _e}from"./useTooltip-Bulizout.js";import{n as ve,t as ye}from"./useMergedRefs-Ci_GFTRu.js";import{n as be,t as f}from"./Spinner-kJ_QUPGl.js";import{n as xe,t as p}from"./VisuallyHidden-DDrJpIxj.js";import{n as Se,r as Ce}from"./SizeContext-fcGnTOs5.js";import{t as we}from"./Button-BDniLuhD.js";import{n as Te,t as Ee}from"./interactionOverlay.stylex-C5f1Dywb.js";import{l as De,s as Oe,t as ke}from"./i18n-kKxerGb3.js";import{t as Ae}from"./Button-Co2OC00k.js";import{a as m,o as je}from"./useTheme-FMiVXHDm.js";import{t as Me}from"./Icon-CgG-b0IT.js";import{t as h}from"./Icon-eSRldnS4.js";import{a as Ne,i as g,t as _}from"./hooks-C3TzANEH.js";import{t as v}from"./Tooltip-DmPgQ55f.js";import{i as Pe,t as Fe}from"./BottomSheet-BeFOVWzk.js";import{n as y}from"./usePopover-3DQuRMBa.js";import{n as Ie,t as b}from"./IconButton-C3fS5XQR.js";import{t as x}from"./Popover-1we_IoCe.js";import{a as Le,c as Re,i as S,n as C,o as w,t as T}from"./Calendar-CI72qjed.js";import{t as ze}from"./Field-B8Mz5Syc.js";import{c as Be,l as Ve,n as He,o as Ue,s as We,t as E}from"./Field-wIXdcZhj.js";import{n as Ge,t as D}from"./useResolvedRequired-DwUGI7xP.js";import{a as O,i as Ke,n as qe,r as Je}from"./InputGroupContext-BonpDGzu.js";import{t as k}from"./InputGroup-CxZcX3vD.js";import{t as A}from"./SizeContext-i5ojWMEJ.js";import{a as j,c as Ye,d as M,f as N,l as Xe,n as P,o as F,s as I,t as L,u as Ze}from"./MonthYearWheels-CYi7kt3o.js";function R(e,t,n,r){return t.textContent=`[${z}]${n}{padding-inline-start:${et}px !important}`,e.getBoundingClientRect().width>r+et/2}function Qe(){if(B!==null)return B;if(typeof document>`u`||!document.body)return`unknown`;let e=document.createElement(`input`);e.setAttribute(`type`,`date`),e.setAttribute(z,``),e.style.cssText=`position:fixed;top:-9999px;left:0;width:auto;min-width:0;max-width:none;padding:0;border:0;font-size:16px;box-sizing:content-box;`;let t=document.createElement(`style`),n=`unknown`;try{document.body.appendChild(e),document.head.appendChild(t);let r=e.getBoundingClientRect().width;R(e,t,`::-webkit-datetime-edit`,r)?n=`segmented`:R(e,t,`::-webkit-date-and-time-value`,r)&&(n=`picker-only`)}catch{}finally{e.remove(),t.remove()}return B=n,n}function $e(e){let t=Qe();return t===`unknown`?!e:t===`segmented`}var z,et,B,V=e((()=>{z=`data-astryx-date-probe`,et=100,B=null}));function H({label:e,isLabelHidden:t=!1,description:n,isOptional:i=!1,isRequired:o=!1,isDisabled:s=!1,disabledMessage:te,value:c,onChange:l,isLoading:re=!1,min:ae,max:se,dateConstraints:ce,placeholder:le,size:fe,status:u,statusVariant:pe=`attached`,labelTooltip:me,hasClear:d=!1,numberOfMonths:ye,weekStartsOn:f,format:p=`date_long`,width:Se,xstyle:we,className:Te,style:Ee,ref:ke,...Ae}){let m=De(),h=Oe(),g=Ge({isRequired:o,isOptional:i}),_=le??m(`@astryx.dateInput.placeholder`),v=Ce(fe,`md`),Pe=je(`(pointer: coarse)`),Fe=(0,U.useId)(),y=(0,U.useId)(),Ie=(0,U.useId)(),b=(0,U.useId)(),x=(0,U.useRef)(null),Le=ve(ke,x),S=Je(),C=s||re,w=s&&!!te,T=_e({placement:`above`,focusTrigger:`always`,isEnabled:w}),{isDateDisabled:E}=Re({min:ae,max:se,dateConstraints:ce}),{statusIcon:D,describedBy:O}=Ne({status:u,statusVariant:pe,isInGroup:!!S}),{ariaLabelledBy:qe,ariaDescribedBy:k}=ge(y,[n?Ie:null,pe!==`tooltip`&&u?.message?b:null,O,w?T.describedBy:null],S),[A,j]=(0,U.useState)(null),[Ye,M]=(0,U.useState)(!1),[N,Xe]=(0,U.useState)(!1),P=(0,U.useRef)(null),F=(0,U.useRef)(c);c!==F.current&&(F.current=c,P.current=null,A!==null&&j(null));let I=c&&tt.test(c)?c:``,L=A===null,Ze=(0,U.useCallback)(e=>typeof p==`function`?p(e):de(he(e),p,h),[p,h]),R=I?Ze(I):_,Qe=!!R&&!(Ye&&N),z=(0,U.useCallback)(e=>{if(C||P.current===e)return;if(P.current=e,!e){j(null),c!==void 0&&l?.(void 0);return}let t=oe(e,h);if(!t)return;if(E(t)){j(e);return}j(null);let n=ue(t);n!==c&&l?.(n)},[c,l,E,C,h]),et=(0,U.useCallback)(e=>{z(e.target.value)},[z]),B=(0,U.useRef)(z);(0,U.useEffect)(()=>{B.current=z}),(0,U.useEffect)(()=>{let e=x.current;if(!e)return;let t=()=>B.current(e.value);return e.addEventListener(`input`,t),e.addEventListener(`change`,t),()=>{e.removeEventListener(`input`,t),e.removeEventListener(`change`,t)}},[]);let V=(0,U.useRef)(null);V.current===null&&(V.current=I),(0,U.useEffect)(()=>{if(Ye)return;let e=x.current;e&&e.value!==I&&(e.value=I)},[Ye,I]);let H=(0,U.useCallback)(()=>{Xe($e(Pe)),M(!0)},[Pe]),nt=(0,U.useCallback)(()=>{let e=x.current?.value;M(!1),j(null),e!==void 0&&e!==I&&z(e)},[z,I]),rt=(0,U.useCallback)(()=>{l?.(void 0)},[l]),q=(0,U.useCallback)(()=>{if(C)return;let e=x.current;if(e&&(e.focus(),typeof e.showPicker==`function`))try{e.showPicker()}catch{}},[C]),J=(0,W.jsxs)(`div`,{ref:e=>{T.ref(e)},...Ae,...ne(r(`date-input`,{size:v,status:u?.type??null,disabled:s?`disabled`:null}),a(Ve.base,K[v],G.wrapper,C&&Ve.disabled,u&&Ue[u.type],u&&!C&&Be[u.type],u&&We[u.type],S&&Ke.inGroup,we),Te,Ee),children:[S&&(0,W.jsx)(xe,{id:y,children:e}),(0,W.jsx)(`button`,{type:`button`,onClick:q,disabled:C,"aria-label":m(`@astryx.dateInput.openCalendar`),tabIndex:-1,...a(ie.focusVisible,G.iconButton,C&&G.iconButtonDisabled),children:(0,W.jsx)(Me,{icon:`calendar`,size:`sm`,color:`secondary`,...r(`date-input-toggle-icon`,{state:`collapsed`})})}),(0,W.jsxs)(`span`,{className:`astryx1n2onr6 astryx78zum5 astryx6s0dn4 astryx98rzlu astryxeuugli`,children:[(0,W.jsx)(`input`,{ref:Le,id:Fe,type:`date`,defaultValue:V.current??``,onChange:et,onFocus:H,onBlur:nt,min:ae,max:se,disabled:C&&!w,"aria-disabled":w?`true`:void 0,readOnly:w||void 0,"aria-labelledby":qe,"aria-describedby":k,"aria-required":g?`true`:void 0,"aria-invalid":u?.type===`error`||!L?`true`:void 0,"aria-busy":re||void 0,...{0:{className:`astryx1lliihq astryx98rzlu astryxeuugli astryxc342km astryxng3xce astryx1717udv astryx9ynric astryxjm74w1 astryx6pjikd astryxw6l6zx astryx1tgivj0 astryxjbqb8w astryx1a2a7pz astryx1oglpa6 astryx1lugfcp astryxjyslct astryxolhmmf astryx9rmy9g astryxpsyfx0 astryx1qqcexc astryx1x4c3m6 astryxkqr7wz astryx1f74mqm astryxec4aax astryxtbxizx astryxslb4at astryx15bqym3`},4:{className:`astryx1lliihq astryx98rzlu astryxeuugli astryxc342km astryxng3xce astryx1717udv astryx9ynric astryxjm74w1 astryx6pjikd astryxw6l6zx astryxjbqb8w astryx1a2a7pz astryx1oglpa6 astryx1lugfcp astryxjyslct astryxolhmmf astryx9rmy9g astryxpsyfx0 astryx1qqcexc astryx1x4c3m6 astryxkqr7wz astryx1f74mqm astryxec4aax astryxtbxizx astryxslb4at astryx15bqym3 astryx19co3pv astryxg7jpbn`},2:{className:`astryx1lliihq astryx98rzlu astryxeuugli astryxc342km astryxng3xce astryx1717udv astryx9ynric astryxjm74w1 astryx6pjikd astryxw6l6zx astryx1tgivj0 astryxjbqb8w astryx1a2a7pz astryx1oglpa6 astryx1lugfcp astryxjyslct astryxolhmmf astryx9rmy9g astryxpsyfx0 astryx1qqcexc astryx1x4c3m6 astryxkqr7wz astryx1f74mqm astryxec4aax astryxtbxizx astryxslb4at astryx15bqym3 astryxt0e3qv`},6:{className:`astryx1lliihq astryx98rzlu astryxeuugli astryxc342km astryxng3xce astryx1717udv astryx9ynric astryxjm74w1 astryx6pjikd astryxw6l6zx astryxjbqb8w astryx1a2a7pz astryx1oglpa6 astryx1lugfcp astryxjyslct astryxolhmmf astryx9rmy9g astryxpsyfx0 astryx1qqcexc astryx1x4c3m6 astryxkqr7wz astryx1f74mqm astryxec4aax astryxtbxizx astryxslb4at astryx15bqym3 astryx19co3pv astryxg7jpbn astryxt0e3qv`},1:{className:`astryx1lliihq astryx98rzlu astryxeuugli astryxc342km astryxng3xce astryx1717udv astryx9ynric astryxjm74w1 astryx6pjikd astryxw6l6zx astryxjbqb8w astryx1a2a7pz astryx1oglpa6 astryx1lugfcp astryxjyslct astryxolhmmf astryx9rmy9g astryxpsyfx0 astryx1qqcexc astryx1x4c3m6 astryxkqr7wz astryx1f74mqm astryxec4aax astryxtbxizx astryxslb4at astryx15bqym3 astryxv1l7n4`},5:{className:`astryx1lliihq astryx98rzlu astryxeuugli astryxc342km astryxng3xce astryx1717udv astryx9ynric astryxjm74w1 astryx6pjikd astryxw6l6zx astryxjbqb8w astryx1a2a7pz astryx1oglpa6 astryx1lugfcp astryxjyslct astryxolhmmf astryx9rmy9g astryxpsyfx0 astryx1qqcexc astryx1x4c3m6 astryxkqr7wz astryx1f74mqm astryxec4aax astryxtbxizx astryxslb4at astryx15bqym3 astryxg7jpbn astryxv1l7n4`},3:{className:`astryx1lliihq astryx98rzlu astryxeuugli astryxc342km astryxng3xce astryx1717udv astryx9ynric astryxjm74w1 astryx6pjikd astryxw6l6zx astryxjbqb8w astryx1a2a7pz astryx1oglpa6 astryx1lugfcp astryxjyslct astryxolhmmf astryx9rmy9g astryxpsyfx0 astryx1qqcexc astryx1x4c3m6 astryxkqr7wz astryx1f74mqm astryxec4aax astryxtbxizx astryxslb4at astryx15bqym3 astryxt0e3qv astryxv1l7n4`},7:{className:`astryx1lliihq astryx98rzlu astryxeuugli astryxc342km astryxng3xce astryx1717udv astryx9ynric astryxjm74w1 astryx6pjikd astryxw6l6zx astryxjbqb8w astryx1a2a7pz astryx1oglpa6 astryx1lugfcp astryxjyslct astryxolhmmf astryx9rmy9g astryxpsyfx0 astryx1qqcexc astryx1x4c3m6 astryxkqr7wz astryx1f74mqm astryxec4aax astryxtbxizx astryxslb4at astryx15bqym3 astryxg7jpbn astryxt0e3qv astryxv1l7n4`}}[!!Qe<<2|!!C<<1|!L<<0]}),Qe&&(0,W.jsx)(`span`,{"aria-hidden":`true`,...{0:{className:`astryx10l6tqk astryx1o0tod astryxtijo5x astryx10no89f astryx1lliihq astryxjm74w1 astryx6pjikd astryxw6l6zx astryx47corl astryxb3r6kr astryxuxw1ft astryxlyipyv astryxv1l7n4`},4:{className:`astryx10l6tqk astryx1o0tod astryxtijo5x astryx10no89f astryx1lliihq astryxjm74w1 astryx6pjikd astryxw6l6zx astryx47corl astryxb3r6kr astryxuxw1ft astryxlyipyv astryx1tgivj0`},2:{className:`astryx10l6tqk astryx1o0tod astryxtijo5x astryx10no89f astryx1lliihq astryxjm74w1 astryx6pjikd astryxw6l6zx astryx47corl astryxb3r6kr astryxuxw1ft astryxlyipyv astryxv1l7n4 astryxt0e3qv`},6:{className:`astryx10l6tqk astryx1o0tod astryxtijo5x astryx10no89f astryx1lliihq astryxjm74w1 astryx6pjikd astryxw6l6zx astryx47corl astryxb3r6kr astryxuxw1ft astryxlyipyv astryx1tgivj0 astryxt0e3qv`},1:{className:`astryx10l6tqk astryx1o0tod astryxtijo5x astryx10no89f astryx1lliihq astryxjm74w1 astryx6pjikd astryxw6l6zx astryx47corl astryxb3r6kr astryxuxw1ft astryxlyipyv astryxv1l7n4`},5:{className:`astryx10l6tqk astryx1o0tod astryxtijo5x astryx10no89f astryx1lliihq astryxjm74w1 astryx6pjikd astryxw6l6zx astryx47corl astryxb3r6kr astryxuxw1ft astryxlyipyv astryxv1l7n4`},3:{className:`astryx10l6tqk astryx1o0tod astryxtijo5x astryx10no89f astryx1lliihq astryxjm74w1 astryx6pjikd astryxw6l6zx astryx47corl astryxb3r6kr astryxuxw1ft astryxlyipyv astryxt0e3qv astryxv1l7n4`},7:{className:`astryx10l6tqk astryx1o0tod astryxtijo5x astryx10no89f astryx1lliihq astryxjm74w1 astryx6pjikd astryxw6l6zx astryx47corl astryxb3r6kr astryxuxw1ft astryxlyipyv astryxt0e3qv astryxv1l7n4`}}[!!I<<2|!!C<<1|!!(!L&&I)<<0],children:R})]}),(0,W.jsx)(xe,{as:`div`,role:`alert`,"aria-live":`assertive`,children:L?``:m(`@astryx.dateInput.invalidDate`)}),d&&c!==void 0&&!C&&(0,W.jsx)(He,{label:m(`@astryx.dateInput.clear`,{label:e}),onClick:rt,iconClassName:ee(`date-input-clear-icon`)}),re&&(0,W.jsx)(be,{size:`sm`}),D,w&&T.renderTooltip(te)]});return S?J:(0,W.jsx)(ze,{label:e,isLabelHidden:t,description:n,inputID:Fe,descriptionID:n?Ie:void 0,isOptional:i,isRequired:o,isDisabled:s,status:u?{type:u.type,message:u.message,messageID:u.message?b:void 0}:void 0,statusVariant:pe,labelTooltip:me,width:Se,children:J})}var U,W,G,K,tt,nt=e((()=>{U=t(n(),1),s(),T(),V(),E(),_(),m(),D(),h(),ke(),k(),O(),o(),A(),f(),v(),p(),me(),W=d(),G={wrapper:{kOIVth:`astryx167g77z`,khm7nJ:null,k1C7PZ:null,$$css:!0},iconButton:{k1xSpc:`astryx78zum5`,kGNEyG:`astryx6s0dn4`,kjj79g:`astryxl56j7k`,kmVPX3:`astryx1717udv`,kg3NbH:null,kuDDbn:null,kE3dHu:null,kP0aTx:null,kpe85a:null,k8WAf4:null,kLKAdn:null,kGO01o:null,kogj98:`astryx1ghz6dp`,kUOVxO:null,keTefX:null,koQZXg:null,k71WvV:null,km5ZXQ:null,kqGvvJ:null,keoZOQ:null,k1K539:null,kMzoRj:`astryxc342km`,kjGldf:null,k2ei4v:null,kZ1KPB:null,ke9TFa:null,kWqL5O:null,kLoX6v:null,kEafiO:null,kt9PQ7:null,ksu8eU:`astryxng3xce`,kJRH4f:null,kVhnKS:null,k4WBpm:null,k8ry5P:null,kSWEuD:null,kDUl1X:null,kPef9Z:null,kfdmCh:null,kWkggS:`astryxjbqb8w`,kkrTdU:`astryx1ypdohk astryx16khyan`,kaIpWk:`astryxh6dtrn`,krdFHd:null,kfmiAY:null,kVL7Gh:null,kT0f0o:null,kIxVMA:null,ksF3WI:null,kqGeR4:null,kYm2EN:null,$$css:!0},iconButtonDisabled:{kkrTdU:`astryxt0e3qv`,$$css:!0}},K={sm:{kZKoxP:`astryx6k0iem`,k7Eaqz:`astryxfb3i0g`,$$css:!0},md:{kZKoxP:`astryx1ueg155`,k7Eaqz:`astryxfb3i0g`,$$css:!0},lg:{kZKoxP:`astryxssyfek`,k7Eaqz:`astryxfb3i0g`,$$css:!0}},tt=/^\d{4}-\d{2}-\d{2}$/,H.displayName=`NativeDateField`,H.__docgenInfo={description:"The OS-picker surface. Takes `DateInput`'s props verbatim; see\n{@link DateInput} for when it is chosen over the other two.",methods:[],displayName:`NativeDateField`,props:{ref:{required:!1,tsType:{name:`ReactRef`,raw:`React.Ref<HTMLInputElement>`,elements:[{name:`HTMLInputElement`}]},description:`Ref forwarded to the root element`},label:{required:!0,tsType:{name:`string`},description:`Label text for the input (required for accessibility).`},isLabelHidden:{required:!1,tsType:{name:`boolean`},description:`Whether to visually hide the label (still accessible to screen readers).
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
\`\`\``}},composes:[`Omit`]}}));function rt({label:e,isLabelHidden:t=!1,description:n,isOptional:i=!1,isRequired:o=!1,isDisabled:s=!1,disabledMessage:c,value:l,onChange:oe,changeAction:se,isLoading:ce=!1,min:ue,max:fe,dateConstraints:me,placeholder:d,size:ye,status:f,statusVariant:p=`attached`,labelTooltip:Se,hasClear:Ee=!1,numberOfMonths:ke,weekStartsOn:Ae=0,format:m=`date_long`,width:je,xstyle:h,className:g,style:_,ref:v,...Fe}){let y=De(),b=Oe(),x=Ge({isRequired:o,isOptional:i}),S=d??y(`@astryx.dateInput.placeholder`),C=Ce(ye,`md`),w=Le(Ae),T=(0,q.useId)(),E=(0,q.useId)(),D=(0,q.useId)(),O=(0,q.useId)(),qe=(0,q.useRef)(null),k=ve(v,qe),A=Je(),[,M]=(0,q.useTransition)(),[N,Xe]=(0,q.useOptimistic)(l),P=ce||N!==l,F=s||P,R=s&&!!c,Qe=_e({placement:`above`,focusTrigger:`always`,isEnabled:R}),{isDateDisabled:$e}=Re({min:ue,max:fe,dateConstraints:me}),{statusIcon:z,describedBy:et}=Ne({status:f,statusVariant:p,isInGroup:!!A}),{ariaLabelledBy:B,ariaDescribedBy:V}=ge(E,[n?D:null,p!==`tooltip`&&f?.message?O:null,et,R?Qe.describedBy:null],A),[H,U]=(0,q.useState)(!1),[W,G]=(0,q.useState)(!1),K=(0,q.useRef)(null),tt=(0,q.useRef)(null);(0,q.useEffect)(()=>()=>{tt.current!=null&&clearTimeout(tt.current)},[]);let nt=(0,q.useMemo)(()=>le(),[]),rt=(0,q.useMemo)(()=>N!=null&&/^\d{4}-\d{2}-\d{2}$/.test(N)?he(N):null,[N]),[at]=(0,q.useState)(()=>Ze(l!=null&&/^\d{4}-\d{2}-\d{2}$/.test(l)?he(l):le())),X=ue==null?at-600:Ze(he(ue)),Z=fe==null?at+600:Ze(he(fe)),[Q,$]=(0,q.useState)(()=>I(at,X,Z)),{year:ot,month:st}=Ye(Q),ct=(0,q.useMemo)(()=>Array.from({length:7},(e,t)=>re({year:1970,month:1,day:4+(w+t)%7},u,b)),[b,w]),lt=re({year:ot,month:st,day:1},pe,b),ut=N!=null&&/^\d{4}-\d{2}-\d{2}$/.test(N)?typeof m==`function`?m(N):de(he(N),m,b):``,dt=(0,q.useCallback)(e=>{P||(oe?.(e),se&&M(async()=>{Xe(e),await se(e)}))},[P,oe,se,M,Xe]),ft=(0,q.useCallback)(()=>{F||(G(!1),U(!0))},[F]),pt=(0,q.useCallback)(()=>{dt(void 0);let e=qe.current;e!=null&&(tt.current=window.setTimeout(()=>{tt.current=null,e.focus({preventScroll:!0})},0))},[dt]),mt=(0,q.useCallback)(()=>{dt(void 0);let e=Ze(nt);e<X||e>Z||e!==Q&&($(e),K.current?.scrollToMonth(e,`smooth`))},[dt,nt,Q,X,Z]),ht=(0,q.useCallback)(e=>{dt(e)},[dt]),gt=Q>X,_t=Q<Z,vt=(0,q.useCallback)(e=>{let t=I(Q+e,X,Z);t!==Q&&($(t),K.current?.scrollToMonth(t,`smooth`))},[Q,X,Z]),yt=(0,q.useCallback)(e=>{$(e),K.current?.scrollToMonth(e,`auto`)},[]),bt=(0,q.useCallback)(e=>{W||$(e)},[W]),xt=(0,q.useRef)(Q);xt.current=Q,(0,q.useEffect)(()=>{W||K.current?.scrollToMonth(xt.current,`auto`)},[W]);let St=(0,q.useCallback)(e=>{te(e.nativeEvent)||(e.key===`ArrowDown`||e.key===`Enter`||e.key===` `||e.key===`Spacebar`)&&(e.preventDefault(),ft())},[ft]),Ct=(0,J.jsxs)(`div`,{className:`astryx78zum5 astryxdt5ytf astryxh8yej3`,children:[(0,J.jsxs)(`div`,{className:`astryx78zum5 astryx6s0dn4 astryx1qughib astryx1txdalj astryxssyfek`,children:[(0,J.jsxs)(`button`,{type:`button`,onClick:()=>G(e=>!e),"aria-expanded":W,"aria-label":y(`@astryx.dateInput.chooseMonthYear`,{monthYear:lt}),"data-title":`month-year`,...a(Y.title,Te.backgroundColor,ie.focusVisible),children:[(0,J.jsx)(`span`,{className:`astryxeuugli astryxb3r6kr astryxlyipyv`,children:lt}),(0,J.jsx)(Me,{icon:`chevronDown`,size:`sm`,color:`secondary`,xstyle:[Y.titleChevron,W&&Y.titleChevronOpen]})]}),(0,J.jsxs)(`span`,{"data-arrows":`months`,inert:W?!0:void 0,...{0:{className:`astryx78zum5 astryx6s0dn4 astryx1lsbc85 astryxvc5jky astryx1jl3cmp astryxuedmi6 astryxcj1dhv astryxzg1mie`},1:{className:`astryx78zum5 astryx6s0dn4 astryx1lsbc85 astryxvc5jky astryx1jl3cmp astryxuedmi6 astryxcj1dhv astryxzg1mie astryxlshs6z astryxg01cxk astryx47corl`}}[!!W<<0],children:[(0,J.jsx)(Ie,{variant:`ghost`,size:`sm`,xstyle:[Y.monthArrow,!gt&&Y.monthArrowUnavailable],isDisabled:!gt,onClick:()=>vt(-1),label:y(`@astryx.calendar.previousMonth`),icon:(0,J.jsx)(`span`,{...a(Y.monthArrowIcon,ae.mirror),children:(0,J.jsx)(Me,{icon:`chevronLeft`,size:`sm`,color:`inherit`})})}),(0,J.jsx)(Ie,{variant:`ghost`,size:`sm`,xstyle:[Y.monthArrow,!_t&&Y.monthArrowUnavailable],isDisabled:!_t,onClick:()=>vt(1),label:y(`@astryx.calendar.nextMonth`),icon:(0,J.jsx)(`span`,{...a(Y.monthArrowIcon,ae.mirror),children:(0,J.jsx)(Me,{icon:`chevronRight`,size:`sm`,color:`inherit`})})})]}),(0,J.jsx)(`span`,{"data-action":`reset`,inert:W?!0:void 0,...{0:{className:`astryx78zum5 astryx6s0dn4 astryx1jl3cmp astryxuedmi6 astryxcj1dhv astryxzg1mie`},1:{className:`astryx78zum5 astryx6s0dn4 astryx1jl3cmp astryxuedmi6 astryxcj1dhv astryxzg1mie astryxlshs6z astryxg01cxk astryx47corl`}}[!!W<<0],children:(0,J.jsx)(we,{variant:`ghost`,size:`sm`,xstyle:Y.resetButton,label:y(`@astryx.dateInput.resetPicking`),onClick:mt})})]}),(0,J.jsx)(`div`,{"aria-hidden":`true`,...{0:{className:`astryxrvj5dj astryx1mzazjb astryx6k0iem astryx6s0dn4 astryx1jl3cmp astryxuedmi6 astryxcj1dhv astryxzg1mie`},1:{className:`astryxrvj5dj astryx1mzazjb astryx6k0iem astryx6s0dn4 astryx1jl3cmp astryxuedmi6 astryxcj1dhv astryxzg1mie astryxlshs6z astryxg01cxk`}}[!!W<<0],children:ct.map(e=>(0,J.jsx)(`div`,{className:`astryx2b8uid astryx141an7d astryx1sodnla astryxv1l7n4`,children:e},e))}),(0,J.jsxs)(`div`,{className:`astryxrvj5dj astryx9hmfof astryx1n2onr6`,children:[(0,J.jsx)(`div`,{"data-panel":`calendar`,inert:W?!0:void 0,...{0:{className:`astryx15r89dc astryxeuugli astryx74b7sa astryxuedmi6 astryxzg1mie`},1:{className:`astryx15r89dc astryxeuugli astryx74b7sa astryxuedmi6 astryxzg1mie astryxlshs6z astryx47corl`}}[!!W<<0],children:(0,J.jsx)(j,{handleRef:K,minMonthIndex:X,maxMonthIndex:Z,initialMonthIndex:Q,onVisibleMonthChange:bt,selectedDate:rt,today:nt,isDateDisabled:$e,weekStartsOn:w,onSelect:ht},`${X}:${Z}`)}),(0,J.jsx)(`div`,{"data-panel":`wheels`,inert:W?void 0:!0,...{0:{className:`astryx15r89dc astryxeuugli astryx10xzikg astryxc8icb0 astryx1jl3cmp astryxuedmi6 astryxcj1dhv astryxzg1mie`},1:{className:`astryx15r89dc astryxeuugli astryx10xzikg astryxc8icb0 astryx1jl3cmp astryxuedmi6 astryxcj1dhv astryxzg1mie astryxlshs6z astryxg01cxk astryx47corl`}}[!W<<0],children:(0,J.jsx)(L,{monthIndex:Q,minMonthIndex:X,maxMonthIndex:Z,onChange:yt,monthLabel:y(`@astryx.dateInput.monthWheel`),yearLabel:y(`@astryx.dateInput.yearWheel`),isActive:W})})]}),(0,J.jsxs)(`div`,{className:`astryx1xye8es astryxrvj5dj astryx1y6fwsi`,children:[(0,J.jsx)(`div`,{inert:W?!0:void 0,...{0:{className:`astryx15r89dc astryx78zum5 astryx74b7sa astryxuedmi6 astryxzg1mie`},1:{className:`astryx15r89dc astryx78zum5 astryx74b7sa astryxuedmi6 astryxzg1mie astryxlshs6z astryx47corl`}}[!!W<<0],children:(0,J.jsx)(we,{variant:`primary`,size:`md`,width:`100%`,label:y(`@astryx.dateInput.savePicking`),onClick:()=>U(!1)})}),(0,J.jsx)(`div`,{inert:W?void 0:!0,...{0:{className:`astryx15r89dc astryx78zum5 astryx10xzikg astryxc8icb0 astryx1jl3cmp astryxuedmi6 astryxcj1dhv astryxzg1mie`},1:{className:`astryx15r89dc astryx78zum5 astryx10xzikg astryxc8icb0 astryx1jl3cmp astryxuedmi6 astryxcj1dhv astryxzg1mie astryxlshs6z astryxg01cxk astryx47corl`}}[!W<<0],children:(0,J.jsx)(we,{variant:`secondary`,size:`md`,width:`100%`,label:y(`@astryx.dateInput.doneChoosingMonth`),onClick:()=>G(!1)})})]})]}),wt=(0,J.jsxs)(`div`,{ref:e=>{Qe.ref(e)},...Fe,...ne(r(`date-input`,{size:C,status:f?.type??null,disabled:s?`disabled`:null}),a(Ve.base,it[C],Y.wrapper,F&&Ve.disabled,f&&Ue[f.type],f&&!F&&Be[f.type],f&&We[f.type],A&&Ke.inGroup,h),g,_),children:[A&&(0,J.jsx)(xe,{id:E,children:e}),(0,J.jsx)(`button`,{type:`button`,onClick:ft,disabled:F,"aria-label":y(`@astryx.dateInput.openCalendar`),tabIndex:-1,...a(ie.focusVisible,Y.iconButton,F&&Y.iconButtonDisabled),children:(0,J.jsx)(Me,{icon:`calendar`,size:`sm`,color:`secondary`,...r(`date-input-toggle-icon`,{state:H?`expanded`:`collapsed`})})}),(0,J.jsx)(`input`,{ref:k,id:T,type:`text`,role:`combobox`,value:ut,readOnly:!0,inputMode:`none`,onChange:()=>{},onClick:ft,onKeyDown:St,placeholder:S,disabled:F&&!R,"aria-disabled":R?`true`:void 0,"aria-labelledby":B,"aria-describedby":V,"aria-required":x?`true`:void 0,"aria-invalid":f?.type===`error`?`true`:void 0,"aria-busy":P||void 0,"aria-expanded":H,"aria-haspopup":`dialog`,"aria-autocomplete":`none`,autoComplete:`off`,...{0:{className:`astryx1lliihq astryx98rzlu astryxeuugli astryxc342km astryxng3xce astryx1717udv astryx9ynric astryxjm74w1 astryx6pjikd astryxw6l6zx astryx1tgivj0 astryxjbqb8w astryx1a2a7pz astryxbuiw85 astryx1ypdohk astryx16khyan astryx87ps6o astryxeyghm5`},1:{className:`astryx1lliihq astryx98rzlu astryxeuugli astryxc342km astryxng3xce astryx1717udv astryx9ynric astryxjm74w1 astryx6pjikd astryxw6l6zx astryx1tgivj0 astryxjbqb8w astryx1a2a7pz astryxbuiw85 astryx87ps6o astryxeyghm5 astryxt0e3qv`}}[!!F<<0]}),Ee&&l!==void 0&&!F&&(0,J.jsx)(He,{label:y(`@astryx.dateInput.clear`,{label:e}),onClick:pt,iconClassName:ee(`date-input-clear-icon`)}),P&&(0,J.jsx)(be,{size:`sm`}),z,(0,J.jsx)(Pe,{isOpen:H,onOpenChange:U,label:y(`@astryx.dateInput.dialogLabel`),height:`hug`,children:(0,J.jsx)(`div`,{className:`astryx1pzlopt astryx1adxfkp astryx1awphl8`,children:Ct})}),R&&Qe.renderTooltip(c)]});return A?wt:(0,J.jsx)(ze,{label:e,isLabelHidden:t,description:n,inputID:T,descriptionID:n?D:void 0,isOptional:i,isRequired:o,isDisabled:s,status:f?{type:f.type,message:f.message,messageID:f.message?O:void 0}:void 0,statusVariant:p,labelTooltip:Se,width:je,children:wt})}var q,J,it,Y,at=e((()=>{q=t(n(),1),s(),Fe(),Ae(),T(),E(),_(),D(),h(),b(),ke(),k(),O(),o(),A(),f(),c(),v(),p(),me(),Ee(),S(),F(),P(),Xe(),N(),J=d(),M.daySize,l[`--duration-fast`],it={sm:{kZKoxP:`astryx6k0iem`,k7Eaqz:`astryxfb3i0g`,$$css:!0},md:{kZKoxP:`astryx1ueg155`,k7Eaqz:`astryxfb3i0g`,$$css:!0},lg:{kZKoxP:`astryxssyfek`,k7Eaqz:`astryxfb3i0g`,$$css:!0}},Y={wrapper:{kOIVth:`astryx1txdalj`,khm7nJ:null,k1C7PZ:null,$$css:!0},iconButton:{k1xSpc:`astryx78zum5`,kGNEyG:`astryx6s0dn4`,kjj79g:`astryxl56j7k`,kmVPX3:`astryx1717udv`,kg3NbH:null,kuDDbn:null,kE3dHu:null,kP0aTx:null,kpe85a:null,k8WAf4:null,kLKAdn:null,kGO01o:null,kogj98:`astryx1ghz6dp`,kUOVxO:null,keTefX:null,koQZXg:null,k71WvV:null,km5ZXQ:null,kqGvvJ:null,keoZOQ:null,k1K539:null,kMzoRj:`astryxc342km`,kjGldf:null,k2ei4v:null,kZ1KPB:null,ke9TFa:null,kWqL5O:null,kLoX6v:null,kEafiO:null,kt9PQ7:null,ksu8eU:`astryxng3xce`,kJRH4f:null,kVhnKS:null,k4WBpm:null,k8ry5P:null,kSWEuD:null,kDUl1X:null,kPef9Z:null,kfdmCh:null,kWkggS:`astryxjbqb8w`,kkrTdU:`astryx1ypdohk astryx16khyan`,kaIpWk:`astryxh6dtrn`,krdFHd:null,kfmiAY:null,kVL7Gh:null,kT0f0o:null,kIxVMA:null,ksF3WI:null,kqGeR4:null,kYm2EN:null,$$css:!0},iconButtonDisabled:{kkrTdU:`astryxt0e3qv`,$$css:!0},monthArrowUnavailable:{k33iCy:`astryxlshs6z`,$$css:!0},monthArrow:{kAzted:`astryx3z0ggl`,k7Eaqz:`astryx1om6rbs`,$$css:!0},monthArrowIcon:{k1xSpc:`astryx3nfvp2`,$$css:!0},resetButton:{kAzted:`astryx3z0ggl`,$$css:!0},title:{k1xSpc:`astryx78zum5`,kGNEyG:`astryx6s0dn4`,kOIVth:`astryxzye2dw`,kZKoxP:`astryx5yr21d`,kg3NbH:`astryxf314gf`,keTefX:`astryx1s1akpx`,kMzoRj:`astryxc342km`,ksu8eU:`astryxng3xce`,kaIpWk:`astryxh6dtrn`,kWkggS:`astryxjbqb8w`,kMwMTN:`astryx1tgivj0`,kGuDYH:`astryx18juvz8`,k63SB2:`astryx2mo6ok`,kkrTdU:`astryx1ypdohk astryx16khyan`,khDVqt:`astryxuxw1ft`,k7Eaqz:`astryxeuugli`,kVQacm:`astryxb3r6kr`,$$css:!0},titleChevron:{k1xSpc:`astryx3nfvp2`,kmuXW:`astryx2lah0s`,k1ekBW:`astryx11xpdln`,kIyJzY:`astryxuedmi6`,kAMwcw:`astryxlr8y92`,k6CgDc:`astryxzg1mie`,$$css:!0},titleChevronOpen:{k3aq6I:`astryx19jd1h0`,$$css:!0}},rt.displayName=`TouchDateField`,rt.__docgenInfo={description:"The touch surface. Takes `DateInput`'s props verbatim; see\n{@link DateInput} for when it is chosen over the desktop control.",methods:[],displayName:`TouchDateField`,props:{ref:{required:!1,tsType:{name:`ReactRef`,raw:`React.Ref<HTMLInputElement>`,elements:[{name:`HTMLInputElement`}]},description:`Ref forwarded to the root element`},label:{required:!0,tsType:{name:`string`},description:`Label text for the input (required for accessibility).`},isLabelHidden:{required:!1,tsType:{name:`boolean`},description:`Whether to visually hide the label (still accessible to screen readers).
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
\`\`\``}},composes:[`Omit`]}}));function X({label:e,isLabelHidden:t=!1,description:n,isOptional:i=!1,isRequired:o=!1,isDisabled:s=!1,disabledMessage:c,value:l,onChange:re,changeAction:ae,isLoading:se=!1,min:le,max:fe,dateConstraints:u,placeholder:pe,size:me,status:d,statusVariant:ye=`attached`,labelTooltip:f,hasClear:p=!1,numberOfMonths:Se=1,weekStartsOn:we,format:Te=`date_long`,width:Ee,xstyle:ke,className:Ae,style:m,ref:je,...h}){let g=De(),_=Oe(),v=Ge({isRequired:o,isOptional:i}),Pe=pe??g(`@astryx.dateInput.placeholder`),Fe=Ce(me,`md`),Ie=(0,Q.useId)(),b=(0,Q.useId)(),x=(0,Q.useId)(),Le=(0,Q.useId)(),S=(0,Q.useRef)(null),w=(0,Q.useRef)(null),T=(0,Q.useRef)(void 0),E=Je(),[,D]=(0,Q.useTransition)(),[O,qe]=(0,Q.useOptimistic)(l),k=se||O!==l,A=s||k,j=s&&!!c,Ye=_e({placement:`above`,focusTrigger:`always`,isEnabled:j}),{isDateDisabled:M}=Re({min:le,max:fe,dateConstraints:u}),{statusIcon:N,describedBy:Xe}=Ne({status:d,statusVariant:ye,isInGroup:!!E}),{ariaLabelledBy:P,ariaDescribedBy:F}=ge(b,[n?x:null,ye!==`tooltip`&&d?.message?Le:null,Xe,j?Ye.describedBy:null],E),[I,L]=(0,Q.useState)(null),Ze=(0,Q.useRef)(l);l!==Ze.current&&(Ze.current=l,l!==T.current&&(T.current=void 0,I!==null&&L(null)));let R=(0,Q.useCallback)(e=>typeof Te==`function`?Te(e):de(he(e),Te,_),[Te,_]),Qe=I===null?O&&/^\d{4}-\d{2}-\d{2}$/.test(O)?R(O):``:I,$e=I===null||!I.trim()?!0:oe(I,_)!==null,z=y({dialogLabel:g(`@astryx.dateInput.dialogLabel`),closeButtonLabel:g(`@astryx.dateInput.closeCalendar`),onHide:()=>{ce()&&S.current?.focus()}}),et=(0,Q.useCallback)(()=>{A||(z.isOpen?z.hide():z.show())},[A,z]),B=(0,Q.useCallback)(()=>{!A&&!z.isOpen&&z.show({skipAutoFocus:!0})},[A,z]),V=(0,Q.useCallback)(e=>{k||(re?.(e),ae&&D(async()=>{qe(e),await ae(e)}))},[k,re,ae,D,qe]),H=(0,Q.useCallback)(()=>{V(void 0),S.current?.focus()},[V]),U=(0,Q.useCallback)(e=>{V(e),L(null),z.hide()},[V,z]),W=(0,Q.useCallback)(e=>{if(A)return;let t=e.target.value;L(t);let n=oe(t,_);if(n&&ue(n)!==l&&!M(n)){let e=ue(n);T.current=e,V(e),w.current?.navigateTo(e)}},[l,V,M,A,_]),G=(0,Q.useCallback)(()=>{if(I===null)return;if(!I.trim()){l!==void 0&&V(void 0),L(null);return}let e=oe(I,_);if(e&&!M(e)){let t=ue(e);t!==l&&V(t)}L(null)},[I,l,V,M,_]),K=(0,Q.useCallback)(()=>{G()},[G]),tt=(0,Q.useCallback)(e=>{te(e.nativeEvent)||(e.key===`Escape`&&z.isOpen?(e.preventDefault(),z.hide()):(e.key===`ArrowDown`||e.altKey&&e.key===`ArrowDown`)&&!z.isOpen?(e.preventDefault(),A||z.show({skipAutoFocus:!0})):e.key===`Enter`&&(e.preventDefault(),G()))},[z,G,A]),nt=(0,$.jsxs)(`div`,{ref:e=>{z.triggerRef(e),Ye.ref(e)},...h,...ne(r(`date-input`,{size:Fe,status:d?.type??null,disabled:s?`disabled`:null}),a(Ve.base,st[Fe],A&&Ve.disabled,d&&Ue[d.type],d&&!A&&Be[d.type],d&&We[d.type],E&&Ke.inGroup,ke),Ae,m),children:[E&&(0,$.jsx)(xe,{id:b,children:e}),(0,$.jsx)(`button`,{type:`button`,onClick:et,disabled:A,"aria-label":z.isOpen?g(`@astryx.dateInput.toggleCalendarClose`):g(`@astryx.dateInput.openCalendar`),...a(ie.focusVisible,ot.iconButton,A&&ot.iconButtonDisabled),children:(0,$.jsx)(Me,{icon:`calendar`,size:`sm`,color:`secondary`,...r(`date-input-toggle-icon`,{state:z.isOpen?`expanded`:`collapsed`})})}),(0,$.jsx)(`input`,{ref:ve(je,S),id:Ie,type:`text`,role:`combobox`,value:Qe,onChange:W,onBlur:K,onClick:B,onKeyDown:tt,placeholder:Pe,disabled:A&&!j,"aria-disabled":j?`true`:void 0,readOnly:j||void 0,"aria-labelledby":P,"aria-describedby":F,"aria-required":v?`true`:void 0,"aria-invalid":d?.type===`error`||!$e?`true`:void 0,"aria-busy":k||void 0,"aria-expanded":z.isOpen,"aria-haspopup":`dialog`,"aria-controls":z.isOpen?z.id:void 0,"aria-autocomplete":`none`,autoComplete:`off`,...{0:{className:`astryx1lliihq astryx98rzlu astryxeuugli astryxc342km astryxng3xce astryx1717udv astryx9ynric astryxjm74w1 astryx6pjikd astryxw6l6zx astryx1tgivj0 astryxjbqb8w astryx1a2a7pz astryxeyghm5`},2:{className:`astryx1lliihq astryx98rzlu astryxeuugli astryxc342km astryxng3xce astryx1717udv astryx9ynric astryxjm74w1 astryx6pjikd astryxw6l6zx astryx1tgivj0 astryxjbqb8w astryx1a2a7pz astryxeyghm5 astryxt0e3qv`},1:{className:`astryx1lliihq astryx98rzlu astryxeuugli astryxc342km astryxng3xce astryx1717udv astryx9ynric astryxjm74w1 astryx6pjikd astryxw6l6zx astryxjbqb8w astryx1a2a7pz astryxeyghm5 astryxv1l7n4`},3:{className:`astryx1lliihq astryx98rzlu astryxeuugli astryxc342km astryxng3xce astryx1717udv astryx9ynric astryxjm74w1 astryx6pjikd astryxw6l6zx astryxjbqb8w astryx1a2a7pz astryxeyghm5 astryxt0e3qv astryxv1l7n4`}}[!!A<<1|!$e<<0]}),(0,$.jsx)(xe,{as:`div`,role:`alert`,"aria-live":`assertive`,children:$e?``:g(`@astryx.dateInput.invalidDate`)}),p&&l!==void 0&&!A&&(0,$.jsx)(He,{label:g(`@astryx.dateInput.clear`,{label:e}),onClick:H,iconClassName:ee(`date-input-clear-icon`)}),k&&(0,$.jsx)(be,{size:`sm`}),N,z.render((0,$.jsx)(C,{handleRef:w,mode:`single`,value:O,onChange:U,min:le,max:fe,dateConstraints:u,numberOfMonths:Se,weekStartsOn:we}),{placement:`below`,alignment:`start`}),j&&Ye.renderTooltip(c)]});return E?nt:(0,$.jsx)(ze,{label:e,isLabelHidden:t,description:n,inputID:Ie,descriptionID:n?x:void 0,isOptional:i,isRequired:o,isDisabled:s,status:d?{type:d.type,message:d.message,messageID:d.message?Le:void 0}:void 0,statusVariant:ye,labelTooltip:f,width:Ee,children:nt})}function Z(e){let t=je(ct),n=e.nativePicker??`touch`;return n===`always`||n===`touch`&&t?(0,$.jsx)(H,{...e}):t?(0,$.jsx)(rt,{...e}):(0,$.jsx)(X,{...e})}var Q,$,ot,st,ct,lt=e((()=>{Q=t(n(),1),s(),E(),h(),p(),qe(),O(),Se(),f(),T(),w(),g(),m(),D(),x(),nt(),at(),v(),me(),se(),$=d(),i(),fe(),o(),ke(),ye(),ot={iconButton:{k1xSpc:`astryx78zum5`,kGNEyG:`astryx6s0dn4`,kjj79g:`astryxl56j7k`,kmVPX3:`astryx1717udv`,kg3NbH:null,kuDDbn:null,kE3dHu:null,kP0aTx:null,kpe85a:null,k8WAf4:null,kLKAdn:null,kGO01o:null,kogj98:`astryx1ghz6dp`,kUOVxO:null,keTefX:null,koQZXg:null,k71WvV:null,km5ZXQ:null,kqGvvJ:null,keoZOQ:null,k1K539:null,kMzoRj:`astryxc342km`,kjGldf:null,k2ei4v:null,kZ1KPB:null,ke9TFa:null,kWqL5O:null,kLoX6v:null,kEafiO:null,kt9PQ7:null,ksu8eU:`astryxng3xce`,kJRH4f:null,kVhnKS:null,k4WBpm:null,k8ry5P:null,kSWEuD:null,kDUl1X:null,kPef9Z:null,kfdmCh:null,kWkggS:`astryxjbqb8w`,kkrTdU:`astryx1ypdohk astryx16khyan`,kaIpWk:`astryxh6dtrn`,krdFHd:null,kfmiAY:null,kVL7Gh:null,kT0f0o:null,kIxVMA:null,ksF3WI:null,kqGeR4:null,kYm2EN:null,$$css:!0},iconButtonDisabled:{kkrTdU:`astryxt0e3qv`,$$css:!0}},st={sm:{kZKoxP:`astryx6k0iem`,k7Eaqz:`astryxfb3i0g`,$$css:!0},md:{kZKoxP:`astryx1ueg155`,k7Eaqz:`astryxfb3i0g`,$$css:!0},lg:{kZKoxP:`astryxssyfek`,k7Eaqz:`astryxfb3i0g`,$$css:!0}},ct=`(pointer: coarse)`,X.displayName=`PointerDateField`,Z.displayName=`DateInput`,Z.__docgenInfo={description:`A date picker that fits the pointer it is being used with.

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
\`\`\``}},composes:[`Omit`]}})),ut=e((()=>{lt()}));export{Z as n,lt as r,ut as t};