import{i as e,s as t}from"./preload-helper-CT_b8DTk.js";import{t as n}from"./react-B7Te67-h.js";import{E as ee,F as r,I as i,N as a,O as te,P as ne,n as re,p as o,s}from"./ime-B2gVvZm0.js";import{B as ie,Ct as ae,I as oe,It as se,Pt as ce,St as c,T as le,_t as ue,at as l,ct as de,d as fe,dt as pe,f as u,m as me,mt as he,n as ge,r as d,t as f}from"./utils-SyZNzL9F.js";import{t as _e}from"./jsx-runtime-DqZldVDK.js";import{n as ve}from"./useTooltip-yc2D-N9u.js";import{n as ye,t as p}from"./useMergedRefs-DQqXZ77v.js";import{l as be,s as xe,t as m}from"./i18n-Cv4NuHz3.js";import{n as Se,t as Ce}from"./Spinner-mWg6CE8Y.js";import{n as we,t as h}from"./VisuallyHidden-DDrJpIxj.js";import{n as Te,r as Ee}from"./SizeContext-fcGnTOs5.js";import{t as De}from"./Button-C7uYWPLx.js";import{n as Oe,t as g}from"./usePressFeedback-Tecq1Zyj.js";import{t as _}from"./Button-8X1GX2ZA.js";import{o as ke,s as v}from"./useTheme-DSFSoLLi.js";import{t as Ae}from"./Icon-LMTcUKwK.js";import{t as y}from"./Icon-Dzf1rqTo.js";import{a as je,i as Me,t as Ne}from"./hooks-2pKM88bj.js";import{t as b}from"./Tooltip-fmzsZ8AL.js";import{t as Pe}from"./BottomSheet-CzL_n2DI.js";import{t as Fe}from"./BottomSheet-glxughTG.js";import{n as x}from"./usePopover-B8bKPRfB.js";import{t as S}from"./IconButton-Bwd7MEGf.js";import{t as C}from"./IconButton-Bf5F3R9L.js";import{t as w}from"./Popover-vcrV5Ojc.js";import{a as T,c as Ie,i as E,n as Le,o as D,t as O}from"./Calendar-U6BR5-jH.js";import{t as Re}from"./Field-C72tbVsN.js";import{c as ze,l as Be,n as Ve,o as He,s as Ue,t as k}from"./Field-lIGuQu43.js";import{n as We,t as A}from"./useResolvedRequired-ByvTAkG0.js";import{a as j,i as Ge,n as M,r as Ke}from"./InputGroupContext-BonpDGzu.js";import{n as N,t as P}from"./nativeDateSegments-DGMrrvQy.js";import{t as F}from"./InputGroup-CgioYweY.js";import{t as I}from"./SizeContext-i5ojWMEJ.js";import{a as qe,c as Je,d as L,f as R,l as z,n as B,o as Ye,s as Xe,t as Ze,u as V}from"./MonthYearWheels-B-jBSmIW.js";function Qe({label:e,isLabelHidden:t=!1,description:n,isOptional:ee=!1,isRequired:r=!1,isDisabled:a=!1,disabledMessage:re,value:o,onChange:s,isLoading:oe=!1,min:se,max:c,dateConstraints:ue,placeholder:de,size:pe,status:u,statusVariant:me=`attached`,labelTooltip:ge,hasClear:d=!1,numberOfMonths:f,weekStartsOn:_e,format:p=`date_long`,width:m,xstyle:Ce,className:h,style:Te,ref:De,...Oe}){let g=be(),_=xe(),ke=We({isRequired:r,isOptional:ee}),y=de??g(`@astryx.dateInput.placeholder`),Me=Ee(pe,`md`),Ne=v(`(pointer: coarse)`),b=(0,H.useId)(),Pe=(0,H.useId)(),Fe=(0,H.useId)(),x=(0,H.useId)(),S=(0,H.useRef)(null),C=ye(De,S),w=Ke(),T=a||oe,E=a&&!!re,Le=ve({placement:`above`,focusTrigger:`always`,isEnabled:E}),{isDateDisabled:D}=Ie({min:se,max:c,dateConstraints:ue}),{statusIcon:O,describedBy:k}=je({status:u,statusVariant:me,isInGroup:!!w}),{ariaLabelledBy:A,ariaDescribedBy:j}=le(Pe,[n?Fe:null,me!==`tooltip`&&u?.message?x:null,k,E?Le.describedBy:null],w),[M,N]=(0,H.useState)(null),[F,I]=(0,H.useState)(!1),[qe,Je]=(0,H.useState)(!1),L=(0,H.useRef)(null),R=(0,H.useRef)(o);o!==R.current&&(R.current=o,L.current=null,M!==null&&N(null));let z=o&&tt.test(o)?o:``,B=M===null,Ye=(0,H.useCallback)(e=>typeof p==`function`?p(e):he(ae(e),p,_),[p,_]),Xe=z?Ye(z):y,Ze=!!Xe&&!(F&&qe),V=(0,H.useCallback)(e=>{if(T||L.current===e)return;if(L.current=e,!e){N(null),o!==void 0&&s?.(void 0);return}let t=l(e,_);if(!t)return;if(D(t)){N(e);return}N(null);let n=ce(t);n!==o&&s?.(n)},[o,s,D,T,_]),Qe=(0,H.useCallback)(e=>{V(e.target.value)},[V]),W=(0,H.useRef)(V);(0,H.useEffect)(()=>{W.current=V}),(0,H.useEffect)(()=>{let e=S.current;if(!e)return;let t=()=>W.current(e.value);return e.addEventListener(`input`,t),e.addEventListener(`change`,t),()=>{e.removeEventListener(`input`,t),e.removeEventListener(`change`,t)}},[]);let G=(0,H.useRef)(null);G.current===null&&(G.current=z),(0,H.useEffect)(()=>{if(F)return;let e=S.current;e&&e.value!==z&&(e.value=z)},[F,z]);let K=(0,H.useCallback)(()=>{Je(P(Ne)),I(!0)},[Ne]),q=(0,H.useCallback)(()=>{let e=S.current?.value;I(!1),N(null),e!==void 0&&e!==z&&V(e)},[V,z]),nt=(0,H.useCallback)(()=>{s?.(void 0)},[s]),J=(0,H.useCallback)(()=>{if(T)return;let e=S.current;if(e&&(e.focus(),typeof e.showPicker==`function`))try{e.showPicker()}catch{}},[T]),rt=(0,U.jsxs)(`div`,{ref:e=>{Le.ref(e)},...Oe,...ie(te(`date-input`,{size:Me,status:u?.type??null,disabled:a?`disabled`:null}),i(Be.base,et[Me],$e.wrapper,T&&Be.disabled,u&&He[u.type],u&&!T&&ze[u.type],u&&Ue[u.type],w&&Ge.inGroup,Ce),h,Te),children:[w&&(0,U.jsx)(we,{id:Pe,children:e}),(0,U.jsx)(`button`,{type:`button`,onClick:J,disabled:T,"aria-label":g(`@astryx.dateInput.openCalendar`),tabIndex:-1,...i(fe.focusVisible,$e.iconButton,T&&$e.iconButtonDisabled),children:(0,U.jsx)(Ae,{icon:`calendar`,size:`sm`,color:`secondary`,...te(`date-input-toggle-icon`,{state:`collapsed`})})}),(0,U.jsxs)(`span`,{className:`astryx1n2onr6 astryx78zum5 astryx6s0dn4 astryx98rzlu astryxeuugli`,children:[(0,U.jsx)(`input`,{ref:C,id:b,type:`date`,defaultValue:G.current??``,onChange:Qe,onFocus:K,onBlur:q,min:se,max:c,disabled:T&&!E,"aria-disabled":E?`true`:void 0,readOnly:E||void 0,"aria-labelledby":A,"aria-describedby":j,"aria-required":ke?`true`:void 0,"aria-invalid":u?.type===`error`||!B?`true`:void 0,"aria-busy":oe||void 0,...{0:{className:`astryx1lliihq astryx98rzlu astryxeuugli astryxc342km astryxng3xce astryx1717udv astryx9ynric astryxjm74w1 astryx6pjikd astryxw6l6zx astryx1tgivj0 astryxjbqb8w astryx1a2a7pz astryx1oglpa6 astryx1lugfcp astryxjyslct astryxolhmmf astryx9rmy9g astryxpsyfx0 astryx1qqcexc astryx1x4c3m6 astryxkqr7wz astryx1f74mqm astryxec4aax astryxtbxizx astryxslb4at astryx15bqym3`},4:{className:`astryx1lliihq astryx98rzlu astryxeuugli astryxc342km astryxng3xce astryx1717udv astryx9ynric astryxjm74w1 astryx6pjikd astryxw6l6zx astryxjbqb8w astryx1a2a7pz astryx1oglpa6 astryx1lugfcp astryxjyslct astryxolhmmf astryx9rmy9g astryxpsyfx0 astryx1qqcexc astryx1x4c3m6 astryxkqr7wz astryx1f74mqm astryxec4aax astryxtbxizx astryxslb4at astryx15bqym3 astryx19co3pv astryxg7jpbn`},2:{className:`astryx1lliihq astryx98rzlu astryxeuugli astryxc342km astryxng3xce astryx1717udv astryx9ynric astryxjm74w1 astryx6pjikd astryxw6l6zx astryx1tgivj0 astryxjbqb8w astryx1a2a7pz astryx1oglpa6 astryx1lugfcp astryxjyslct astryxolhmmf astryx9rmy9g astryxpsyfx0 astryx1qqcexc astryx1x4c3m6 astryxkqr7wz astryx1f74mqm astryxec4aax astryxtbxizx astryxslb4at astryx15bqym3 astryxt0e3qv`},6:{className:`astryx1lliihq astryx98rzlu astryxeuugli astryxc342km astryxng3xce astryx1717udv astryx9ynric astryxjm74w1 astryx6pjikd astryxw6l6zx astryxjbqb8w astryx1a2a7pz astryx1oglpa6 astryx1lugfcp astryxjyslct astryxolhmmf astryx9rmy9g astryxpsyfx0 astryx1qqcexc astryx1x4c3m6 astryxkqr7wz astryx1f74mqm astryxec4aax astryxtbxizx astryxslb4at astryx15bqym3 astryx19co3pv astryxg7jpbn astryxt0e3qv`},1:{className:`astryx1lliihq astryx98rzlu astryxeuugli astryxc342km astryxng3xce astryx1717udv astryx9ynric astryxjm74w1 astryx6pjikd astryxw6l6zx astryxjbqb8w astryx1a2a7pz astryx1oglpa6 astryx1lugfcp astryxjyslct astryxolhmmf astryx9rmy9g astryxpsyfx0 astryx1qqcexc astryx1x4c3m6 astryxkqr7wz astryx1f74mqm astryxec4aax astryxtbxizx astryxslb4at astryx15bqym3 astryxv1l7n4`},5:{className:`astryx1lliihq astryx98rzlu astryxeuugli astryxc342km astryxng3xce astryx1717udv astryx9ynric astryxjm74w1 astryx6pjikd astryxw6l6zx astryxjbqb8w astryx1a2a7pz astryx1oglpa6 astryx1lugfcp astryxjyslct astryxolhmmf astryx9rmy9g astryxpsyfx0 astryx1qqcexc astryx1x4c3m6 astryxkqr7wz astryx1f74mqm astryxec4aax astryxtbxizx astryxslb4at astryx15bqym3 astryxg7jpbn astryxv1l7n4`},3:{className:`astryx1lliihq astryx98rzlu astryxeuugli astryxc342km astryxng3xce astryx1717udv astryx9ynric astryxjm74w1 astryx6pjikd astryxw6l6zx astryxjbqb8w astryx1a2a7pz astryx1oglpa6 astryx1lugfcp astryxjyslct astryxolhmmf astryx9rmy9g astryxpsyfx0 astryx1qqcexc astryx1x4c3m6 astryxkqr7wz astryx1f74mqm astryxec4aax astryxtbxizx astryxslb4at astryx15bqym3 astryxt0e3qv astryxv1l7n4`},7:{className:`astryx1lliihq astryx98rzlu astryxeuugli astryxc342km astryxng3xce astryx1717udv astryx9ynric astryxjm74w1 astryx6pjikd astryxw6l6zx astryxjbqb8w astryx1a2a7pz astryx1oglpa6 astryx1lugfcp astryxjyslct astryxolhmmf astryx9rmy9g astryxpsyfx0 astryx1qqcexc astryx1x4c3m6 astryxkqr7wz astryx1f74mqm astryxec4aax astryxtbxizx astryxslb4at astryx15bqym3 astryxg7jpbn astryxt0e3qv astryxv1l7n4`}}[!!Ze<<2|!!T<<1|!B<<0]}),Ze&&(0,U.jsx)(`span`,{"aria-hidden":`true`,...{0:{className:`astryx10l6tqk astryx1o0tod astryxtijo5x astryx10no89f astryx1lliihq astryxjm74w1 astryx6pjikd astryxw6l6zx astryx47corl astryxb3r6kr astryxuxw1ft astryxlyipyv astryxv1l7n4`},4:{className:`astryx10l6tqk astryx1o0tod astryxtijo5x astryx10no89f astryx1lliihq astryxjm74w1 astryx6pjikd astryxw6l6zx astryx47corl astryxb3r6kr astryxuxw1ft astryxlyipyv astryx1tgivj0`},2:{className:`astryx10l6tqk astryx1o0tod astryxtijo5x astryx10no89f astryx1lliihq astryxjm74w1 astryx6pjikd astryxw6l6zx astryx47corl astryxb3r6kr astryxuxw1ft astryxlyipyv astryxv1l7n4 astryxt0e3qv`},6:{className:`astryx10l6tqk astryx1o0tod astryxtijo5x astryx10no89f astryx1lliihq astryxjm74w1 astryx6pjikd astryxw6l6zx astryx47corl astryxb3r6kr astryxuxw1ft astryxlyipyv astryx1tgivj0 astryxt0e3qv`},1:{className:`astryx10l6tqk astryx1o0tod astryxtijo5x astryx10no89f astryx1lliihq astryxjm74w1 astryx6pjikd astryxw6l6zx astryx47corl astryxb3r6kr astryxuxw1ft astryxlyipyv astryxv1l7n4`},5:{className:`astryx10l6tqk astryx1o0tod astryxtijo5x astryx10no89f astryx1lliihq astryxjm74w1 astryx6pjikd astryxw6l6zx astryx47corl astryxb3r6kr astryxuxw1ft astryxlyipyv astryxv1l7n4`},3:{className:`astryx10l6tqk astryx1o0tod astryxtijo5x astryx10no89f astryx1lliihq astryxjm74w1 astryx6pjikd astryxw6l6zx astryx47corl astryxb3r6kr astryxuxw1ft astryxlyipyv astryxt0e3qv astryxv1l7n4`},7:{className:`astryx10l6tqk astryx1o0tod astryxtijo5x astryx10no89f astryx1lliihq astryxjm74w1 astryx6pjikd astryxw6l6zx astryx47corl astryxb3r6kr astryxuxw1ft astryxlyipyv astryxt0e3qv astryxv1l7n4`}}[!!z<<2|!!T<<1|!!(!B&&z)<<0],children:Xe})]}),(0,U.jsx)(we,{as:`div`,role:`alert`,"aria-live":`assertive`,children:B?``:g(`@astryx.dateInput.invalidDate`)}),d&&o!==void 0&&!T&&(0,U.jsx)(Ve,{label:g(`@astryx.dateInput.clear`,{label:e}),onClick:nt,iconClassName:ne(`date-input-clear-icon`)}),oe&&(0,U.jsx)(Se,{size:`sm`}),O,E&&Le.renderTooltip(re)]});return w?rt:(0,U.jsx)(Re,{label:e,isLabelHidden:t,description:n,inputID:b,descriptionID:n?Fe:void 0,isOptional:ee,isRequired:r,isDisabled:a,status:u?{type:u.type,message:u.message,messageID:u.message?x:void 0}:void 0,statusVariant:me,labelTooltip:ge,width:m,children:rt})}var H,U,$e,et,tt,W=e((()=>{H=t(n(),1),r(),O(),N(),k(),Ne(),ke(),A(),y(),m(),F(),j(),a(),I(),Ce(),b(),h(),f(),U=_e(),$e={wrapper:{kOIVth:`astryx167g77z`,khm7nJ:null,k1C7PZ:null,$$css:!0},iconButton:{k1xSpc:`astryx78zum5`,kGNEyG:`astryx6s0dn4`,kjj79g:`astryxl56j7k`,kmVPX3:`astryx1717udv`,kg3NbH:null,kuDDbn:null,kE3dHu:null,kP0aTx:null,kpe85a:null,k8WAf4:null,kLKAdn:null,kGO01o:null,kogj98:`astryx1ghz6dp`,kUOVxO:null,keTefX:null,koQZXg:null,k71WvV:null,km5ZXQ:null,kqGvvJ:null,keoZOQ:null,k1K539:null,kMzoRj:`astryxc342km`,kjGldf:null,k2ei4v:null,kZ1KPB:null,ke9TFa:null,kWqL5O:null,kLoX6v:null,kEafiO:null,kt9PQ7:null,ksu8eU:`astryxng3xce`,kJRH4f:null,kVhnKS:null,k4WBpm:null,k8ry5P:null,kSWEuD:null,kDUl1X:null,kPef9Z:null,kfdmCh:null,kWkggS:`astryxjbqb8w`,kkrTdU:`astryx1ypdohk astryx16khyan`,kaIpWk:`astryxh6dtrn`,krdFHd:null,kfmiAY:null,kVL7Gh:null,kT0f0o:null,kIxVMA:null,ksF3WI:null,kqGeR4:null,kYm2EN:null,$$css:!0},iconButtonDisabled:{kkrTdU:`astryxt0e3qv`,$$css:!0}},et={sm:{kZKoxP:`astryx6k0iem`,k7Eaqz:`astryxfb3i0g`,$$css:!0},md:{kZKoxP:`astryx1ueg155`,k7Eaqz:`astryxfb3i0g`,$$css:!0},lg:{kZKoxP:`astryxssyfek`,k7Eaqz:`astryxfb3i0g`,$$css:!0}},tt=/^\d{4}-\d{2}-\d{2}$/,Qe.displayName=`NativeDateField`,Qe.__docgenInfo={description:"The OS-picker surface. Takes `DateInput`'s props verbatim; see\n{@link DateInput} for when it is chosen over the other two.",methods:[],displayName:`NativeDateField`,props:{ref:{required:!1,tsType:{name:`ReactRef`,raw:`React.Ref<HTMLInputElement>`,elements:[{name:`HTMLInputElement`}]},description:`Ref forwarded to the root element`},label:{required:!0,tsType:{name:`string`},description:`Label text for the input (required for accessibility).`},isLabelHidden:{required:!1,tsType:{name:`boolean`},description:`Whether to visually hide the label (still accessible to screen readers).
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
\`\`\``}},composes:[`Omit`]}}));function G({label:e,isLabelHidden:t=!1,description:n,isOptional:ee=!1,isRequired:r=!1,isDisabled:a=!1,disabledMessage:o,value:s,onChange:oe,changeAction:ce,isLoading:ue=!1,min:l,max:u,dateConstraints:ge,placeholder:f,size:_e,status:p,statusVariant:m=`attached`,labelTooltip:Ce,hasClear:h=!1,numberOfMonths:Te,weekStartsOn:g=0,format:_=`date_long`,width:ke,xstyle:v,className:y,style:Me,ref:Ne,...b}){let Fe=Oe(),x=be(),C=xe(),w=We({isRequired:r,isOptional:ee}),E=f??x(`@astryx.dateInput.placeholder`),Le=Ee(_e,`md`),D=T(g),O=(0,K.useId)(),k=(0,K.useId)(),A=(0,K.useId)(),j=(0,K.useId)(),M=(0,K.useRef)(null),N=ye(Ne,M),P=Ke(),[,F]=(0,K.useTransition)(),[I,L]=(0,K.useOptimistic)(s),R=ue||I!==s,z=a||R,B=a&&!!o,Ye=ve({placement:`above`,focusTrigger:`always`,isEnabled:B}),{isDateDisabled:Qe}=Ie({min:l,max:u,dateConstraints:ge}),{statusIcon:H,describedBy:U}=je({status:p,statusVariant:m,isInGroup:!!P}),{ariaLabelledBy:$e,ariaDescribedBy:et}=le(k,[n?A:null,m!==`tooltip`&&p?.message?j:null,U,B?Ye.describedBy:null],P),[tt,W]=(0,K.useState)(!1),[G,rt]=(0,K.useState)(!1),it=(0,K.useRef)(null),at=(0,K.useRef)(null);(0,K.useEffect)(()=>()=>{at.current!=null&&clearTimeout(at.current)},[]);let Y=(0,K.useMemo)(()=>se(),[]),X=(0,K.useMemo)(()=>I!=null&&/^\d{4}-\d{2}-\d{2}$/.test(I)?ae(I):null,[I]),[ot]=(0,K.useState)(()=>V(s!=null&&/^\d{4}-\d{2}-\d{2}$/.test(s)?ae(s):se())),Z=l==null?ot-600:V(ae(l)),Q=u==null?ot+600:V(ae(u)),[$,st]=(0,K.useState)(()=>Xe(ot,Z,Q)),{year:ct,month:lt}=Je($),ut=(0,K.useMemo)(()=>Array.from({length:7},(e,t)=>c({year:1970,month:1,day:4+(D+t)%7},pe,C)),[C,D]),dt=c({year:ct,month:lt,day:1},de,C),ft=I!=null&&/^\d{4}-\d{2}-\d{2}$/.test(I)?typeof _==`function`?_(I):he(ae(I),_,C):``,pt=(0,K.useCallback)(e=>{R||(oe?.(e),ce&&F(async()=>{L(e),await ce(e)}))},[R,oe,ce,F,L]),mt=(0,K.useCallback)(()=>{z||(rt(!1),W(!0))},[z]),ht=(0,K.useCallback)(()=>{pt(void 0);let e=M.current;e!=null&&(at.current=window.setTimeout(()=>{at.current=null,e.focus({preventScroll:!0})},0))},[pt]),gt=(0,K.useCallback)(()=>{pt(void 0);let e=V(Y);e<Z||e>Q||e!==$&&(st(e),it.current?.scrollToMonth(e,`smooth`))},[pt,Y,$,Z,Q]),_t=(0,K.useCallback)(e=>{pt(e)},[pt]),vt=$>Z,yt=$<Q,bt=(0,K.useCallback)(e=>{let t=Xe($+e,Z,Q);t!==$&&(st(t),it.current?.scrollToMonth(t,`smooth`))},[$,Z,Q]),xt=(0,K.useCallback)(e=>{st(e),it.current?.scrollToMonth(e,`auto`)},[]),St=(0,K.useCallback)(e=>{G||st(e)},[G]),Ct=(0,K.useRef)($);Ct.current=$,(0,K.useEffect)(()=>{G||it.current?.scrollToMonth(Ct.current,`auto`)},[G]);let wt=(0,K.useCallback)(e=>{re(e.nativeEvent)||(e.key===`ArrowDown`||e.key===`Enter`||e.key===` `||e.key===`Spacebar`)&&(e.preventDefault(),mt())},[mt]),Tt=(0,q.jsxs)(`div`,{className:`astryx78zum5 astryxdt5ytf astryxh8yej3`,children:[(0,q.jsxs)(`div`,{className:`astryx78zum5 astryx6s0dn4 astryx1qughib astryx1txdalj astryxssyfek`,children:[(0,q.jsxs)(`button`,{type:`button`,onClick:()=>rt(e=>!e),"aria-expanded":G,"aria-label":x(`@astryx.dateInput.chooseMonthYear`,{monthYear:dt}),"data-title":`month-year`,...Fe,...i(J.title,d.backgroundColor,fe.focusVisible),children:[(0,q.jsx)(`span`,{className:`astryxeuugli astryxb3r6kr astryxlyipyv`,children:dt}),(0,q.jsx)(Ae,{icon:`chevronDown`,size:`sm`,color:`secondary`,xstyle:[J.titleChevron,G&&J.titleChevronOpen]})]}),(0,q.jsxs)(`span`,{"data-arrows":`months`,inert:G?!0:void 0,...{0:{className:`astryx78zum5 astryx6s0dn4 astryx1lsbc85 astryxvc5jky astryx1jl3cmp astryxuedmi6 astryxcj1dhv astryxzg1mie`},1:{className:`astryx78zum5 astryx6s0dn4 astryx1lsbc85 astryxvc5jky astryx1jl3cmp astryxuedmi6 astryxcj1dhv astryxzg1mie astryxlshs6z astryxg01cxk astryx47corl`}}[!!G<<0],children:[(0,q.jsx)(S,{variant:`ghost`,size:`sm`,xstyle:[J.monthArrow,!vt&&J.monthArrowUnavailable],isDisabled:!vt,onClick:()=>bt(-1),label:x(`@astryx.calendar.previousMonth`),icon:(0,q.jsx)(`span`,{...i(J.monthArrowIcon,me.mirror),children:(0,q.jsx)(Ae,{icon:`chevronLeft`,size:`sm`,color:`inherit`})})}),(0,q.jsx)(S,{variant:`ghost`,size:`sm`,xstyle:[J.monthArrow,!yt&&J.monthArrowUnavailable],isDisabled:!yt,onClick:()=>bt(1),label:x(`@astryx.calendar.nextMonth`),icon:(0,q.jsx)(`span`,{...i(J.monthArrowIcon,me.mirror),children:(0,q.jsx)(Ae,{icon:`chevronRight`,size:`sm`,color:`inherit`})})})]}),(0,q.jsx)(`span`,{"data-action":`reset`,inert:G?!0:void 0,...{0:{className:`astryx78zum5 astryx6s0dn4 astryx1jl3cmp astryxuedmi6 astryxcj1dhv astryxzg1mie`},1:{className:`astryx78zum5 astryx6s0dn4 astryx1jl3cmp astryxuedmi6 astryxcj1dhv astryxzg1mie astryxlshs6z astryxg01cxk astryx47corl`}}[!!G<<0],children:(0,q.jsx)(De,{variant:`ghost`,size:`sm`,xstyle:J.resetButton,label:x(`@astryx.dateInput.resetPicking`),onClick:gt})})]}),(0,q.jsx)(`div`,{"aria-hidden":`true`,...{0:{className:`astryxrvj5dj astryx1mzazjb astryx6k0iem astryx6s0dn4 astryx1jl3cmp astryxuedmi6 astryxcj1dhv astryxzg1mie`},1:{className:`astryxrvj5dj astryx1mzazjb astryx6k0iem astryx6s0dn4 astryx1jl3cmp astryxuedmi6 astryxcj1dhv astryxzg1mie astryxlshs6z astryxg01cxk`}}[!!G<<0],children:ut.map(e=>(0,q.jsx)(`div`,{className:`astryx2b8uid astryx141an7d astryx1sodnla astryxv1l7n4`,children:e},e))}),(0,q.jsxs)(`div`,{className:`astryxrvj5dj astryx9hmfof astryx1n2onr6`,children:[(0,q.jsx)(`div`,{"data-panel":`calendar`,inert:G?!0:void 0,...{0:{className:`astryx15r89dc astryxeuugli astryx74b7sa astryxuedmi6 astryxzg1mie`},1:{className:`astryx15r89dc astryxeuugli astryx74b7sa astryxuedmi6 astryxzg1mie astryxlshs6z astryx47corl`}}[!!G<<0],children:(0,q.jsx)(qe,{handleRef:it,minMonthIndex:Z,maxMonthIndex:Q,initialMonthIndex:$,onVisibleMonthChange:St,selectedDate:X,today:Y,isDateDisabled:Qe,weekStartsOn:D,onSelect:_t},`${Z}:${Q}`)}),(0,q.jsx)(`div`,{"data-panel":`wheels`,inert:G?void 0:!0,...{0:{className:`astryx15r89dc astryxeuugli astryx10xzikg astryxc8icb0 astryx1jl3cmp astryxuedmi6 astryxcj1dhv astryxzg1mie`},1:{className:`astryx15r89dc astryxeuugli astryx10xzikg astryxc8icb0 astryx1jl3cmp astryxuedmi6 astryxcj1dhv astryxzg1mie astryxlshs6z astryxg01cxk astryx47corl`}}[!G<<0],children:(0,q.jsx)(Ze,{monthIndex:$,minMonthIndex:Z,maxMonthIndex:Q,onChange:xt,monthLabel:x(`@astryx.dateInput.monthWheel`),yearLabel:x(`@astryx.dateInput.yearWheel`),isActive:G})})]}),(0,q.jsxs)(`div`,{className:`astryx1xye8es astryxrvj5dj astryx1y6fwsi`,children:[(0,q.jsx)(`div`,{inert:G?!0:void 0,...{0:{className:`astryx15r89dc astryx78zum5 astryx74b7sa astryxuedmi6 astryxzg1mie`},1:{className:`astryx15r89dc astryx78zum5 astryx74b7sa astryxuedmi6 astryxzg1mie astryxlshs6z astryx47corl`}}[!!G<<0],children:(0,q.jsx)(De,{variant:`primary`,size:`md`,width:`100%`,label:x(`@astryx.dateInput.savePicking`),onClick:()=>W(!1)})}),(0,q.jsx)(`div`,{inert:G?void 0:!0,...{0:{className:`astryx15r89dc astryx78zum5 astryx10xzikg astryxc8icb0 astryx1jl3cmp astryxuedmi6 astryxcj1dhv astryxzg1mie`},1:{className:`astryx15r89dc astryx78zum5 astryx10xzikg astryxc8icb0 astryx1jl3cmp astryxuedmi6 astryxcj1dhv astryxzg1mie astryxlshs6z astryxg01cxk astryx47corl`}}[!G<<0],children:(0,q.jsx)(De,{variant:`secondary`,size:`md`,width:`100%`,label:x(`@astryx.dateInput.doneChoosingMonth`),onClick:()=>rt(!1)})})]})]}),Et=(0,q.jsxs)(`div`,{ref:e=>{Ye.ref(e)},...b,...ie(te(`date-input`,{size:Le,status:p?.type??null,disabled:a?`disabled`:null}),i(Be.base,nt[Le],J.wrapper,z&&Be.disabled,p&&He[p.type],p&&!z&&ze[p.type],p&&Ue[p.type],P&&Ge.inGroup,v),y,Me),children:[P&&(0,q.jsx)(we,{id:k,children:e}),(0,q.jsx)(`button`,{type:`button`,onClick:mt,disabled:z,"aria-label":x(`@astryx.dateInput.openCalendar`),tabIndex:-1,...i(fe.focusVisible,J.iconButton,z&&J.iconButtonDisabled),children:(0,q.jsx)(Ae,{icon:`calendar`,size:`sm`,color:`secondary`,...te(`date-input-toggle-icon`,{state:tt?`expanded`:`collapsed`})})}),(0,q.jsx)(`input`,{ref:N,id:O,type:`text`,role:`combobox`,value:ft,readOnly:!0,inputMode:`none`,onChange:()=>{},onClick:mt,onKeyDown:wt,placeholder:E,disabled:z&&!B,"aria-disabled":B?`true`:void 0,"aria-labelledby":$e,"aria-describedby":et,"aria-required":w?`true`:void 0,"aria-invalid":p?.type===`error`?`true`:void 0,"aria-busy":R||void 0,"aria-expanded":tt,"aria-haspopup":`dialog`,"aria-autocomplete":`none`,autoComplete:`off`,...{0:{className:`astryx1lliihq astryx98rzlu astryxeuugli astryxc342km astryxng3xce astryx1717udv astryx9ynric astryxjm74w1 astryx6pjikd astryxw6l6zx astryx1tgivj0 astryxjbqb8w astryx1a2a7pz astryxbuiw85 astryx1ypdohk astryx16khyan astryx87ps6o astryxeyghm5`},1:{className:`astryx1lliihq astryx98rzlu astryxeuugli astryxc342km astryxng3xce astryx1717udv astryx9ynric astryxjm74w1 astryx6pjikd astryxw6l6zx astryx1tgivj0 astryxjbqb8w astryx1a2a7pz astryxbuiw85 astryx87ps6o astryxeyghm5 astryxt0e3qv`}}[!!z<<0]}),h&&s!==void 0&&!z&&(0,q.jsx)(Ve,{label:x(`@astryx.dateInput.clear`,{label:e}),onClick:ht,iconClassName:ne(`date-input-clear-icon`)}),R&&(0,q.jsx)(Se,{size:`sm`}),H,(0,q.jsx)(Pe,{isOpen:tt,onOpenChange:W,label:x(`@astryx.dateInput.dialogLabel`),height:`hug`,children:(0,q.jsx)(`div`,{className:`astryx1pzlopt astryx1adxfkp astryx1awphl8`,children:Tt})}),B&&Ye.renderTooltip(o)]});return P?Et:(0,q.jsx)(Re,{label:e,isLabelHidden:t,description:n,inputID:O,descriptionID:n?A:void 0,isOptional:ee,isRequired:r,isDisabled:a,status:p?{type:p.type,message:p.message,messageID:p.message?j:void 0}:void 0,statusVariant:m,labelTooltip:Ce,width:ke,children:Et})}var K,q,nt,J,rt=e((()=>{K=t(n(),1),r(),Fe(),_(),O(),k(),Ne(),A(),y(),C(),m(),F(),j(),a(),I(),Ce(),o(),b(),h(),f(),ge(),g(),E(),Ye(),B(),z(),R(),q=_e(),L.daySize,s[`--duration-fast`],nt={sm:{kZKoxP:`astryx6k0iem`,k7Eaqz:`astryxfb3i0g`,$$css:!0},md:{kZKoxP:`astryx1ueg155`,k7Eaqz:`astryxfb3i0g`,$$css:!0},lg:{kZKoxP:`astryxssyfek`,k7Eaqz:`astryxfb3i0g`,$$css:!0}},J={wrapper:{kOIVth:`astryx1txdalj`,khm7nJ:null,k1C7PZ:null,$$css:!0},iconButton:{k1xSpc:`astryx78zum5`,kGNEyG:`astryx6s0dn4`,kjj79g:`astryxl56j7k`,kmVPX3:`astryx1717udv`,kg3NbH:null,kuDDbn:null,kE3dHu:null,kP0aTx:null,kpe85a:null,k8WAf4:null,kLKAdn:null,kGO01o:null,kogj98:`astryx1ghz6dp`,kUOVxO:null,keTefX:null,koQZXg:null,k71WvV:null,km5ZXQ:null,kqGvvJ:null,keoZOQ:null,k1K539:null,kMzoRj:`astryxc342km`,kjGldf:null,k2ei4v:null,kZ1KPB:null,ke9TFa:null,kWqL5O:null,kLoX6v:null,kEafiO:null,kt9PQ7:null,ksu8eU:`astryxng3xce`,kJRH4f:null,kVhnKS:null,k4WBpm:null,k8ry5P:null,kSWEuD:null,kDUl1X:null,kPef9Z:null,kfdmCh:null,kWkggS:`astryxjbqb8w`,kkrTdU:`astryx1ypdohk astryx16khyan`,kaIpWk:`astryxh6dtrn`,krdFHd:null,kfmiAY:null,kVL7Gh:null,kT0f0o:null,kIxVMA:null,ksF3WI:null,kqGeR4:null,kYm2EN:null,$$css:!0},iconButtonDisabled:{kkrTdU:`astryxt0e3qv`,$$css:!0},monthArrowUnavailable:{k33iCy:`astryxlshs6z`,$$css:!0},monthArrow:{kAzted:`astryx3z0ggl`,k7Eaqz:`astryx1om6rbs`,$$css:!0},monthArrowIcon:{k1xSpc:`astryx3nfvp2`,$$css:!0},resetButton:{kAzted:`astryx3z0ggl`,$$css:!0},title:{k1xSpc:`astryx78zum5`,kGNEyG:`astryx6s0dn4`,kOIVth:`astryxzye2dw`,kZKoxP:`astryx5yr21d`,kg3NbH:`astryxf314gf`,keTefX:`astryx1s1akpx`,kMzoRj:`astryxc342km`,ksu8eU:`astryxng3xce`,kaIpWk:`astryxh6dtrn`,kWkggS:`astryxjbqb8w`,kMwMTN:`astryx1tgivj0`,kGuDYH:`astryx18juvz8`,k63SB2:`astryx2mo6ok`,kkrTdU:`astryx1ypdohk astryx16khyan`,khDVqt:`astryxuxw1ft`,k7Eaqz:`astryxeuugli`,kVQacm:`astryxb3r6kr`,$$css:!0},titleChevron:{k1xSpc:`astryx3nfvp2`,kmuXW:`astryx2lah0s`,k1ekBW:`astryx11xpdln`,kIyJzY:`astryxuedmi6`,kAMwcw:`astryxlr8y92`,k6CgDc:`astryxzg1mie`,$$css:!0},titleChevronOpen:{k3aq6I:`astryx19jd1h0`,$$css:!0}},G.displayName=`TouchDateField`,G.__docgenInfo={description:"The touch surface. Takes `DateInput`'s props verbatim; see\n{@link DateInput} for when it is chosen over the desktop control.",methods:[],displayName:`TouchDateField`,props:{ref:{required:!1,tsType:{name:`ReactRef`,raw:`React.Ref<HTMLInputElement>`,elements:[{name:`HTMLInputElement`}]},description:`Ref forwarded to the root element`},label:{required:!0,tsType:{name:`string`},description:`Label text for the input (required for accessibility).`},isLabelHidden:{required:!1,tsType:{name:`boolean`},description:`Whether to visually hide the label (still accessible to screen readers).
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
\`\`\``}},composes:[`Omit`]}}));function it({label:e,isLabelHidden:t=!1,description:n,isOptional:ee=!1,isRequired:r=!1,isDisabled:a=!1,disabledMessage:o,value:s,onChange:se,changeAction:c,isLoading:ue=!1,min:de,max:pe,dateConstraints:u,placeholder:me,size:ge,status:d,statusVariant:f=`attached`,labelTooltip:_e,hasClear:p=!1,numberOfMonths:m=1,weekStartsOn:Ce,format:h=`date_long`,width:Te,xstyle:De,className:Oe,style:g,ref:_,...ke}){let v=be(),y=xe(),Me=We({isRequired:r,isOptional:ee}),Ne=me??v(`@astryx.dateInput.placeholder`),b=Ee(ge,`md`),Pe=(0,Y.useId)(),Fe=(0,Y.useId)(),S=(0,Y.useId)(),C=(0,Y.useId)(),w=(0,Y.useRef)(null),T=(0,Y.useRef)(null),E=(0,Y.useRef)(void 0),D=Ke(),[,O]=(0,Y.useTransition)(),[k,A]=(0,Y.useOptimistic)(s),j=ue||k!==s,M=a||j,N=a&&!!o,P=ve({placement:`above`,focusTrigger:`always`,isEnabled:N}),{isDateDisabled:F}=Ie({min:de,max:pe,dateConstraints:u}),{statusIcon:I,describedBy:qe}=je({status:d,statusVariant:f,isInGroup:!!D}),{ariaLabelledBy:Je,ariaDescribedBy:L}=le(Fe,[n?S:null,f!==`tooltip`&&d?.message?C:null,qe,N?P.describedBy:null],D),[R,z]=(0,Y.useState)(null),B=(0,Y.useRef)(s);s!==B.current&&(B.current=s,s!==E.current&&(E.current=void 0,R!==null&&z(null)));let Ye=(0,Y.useCallback)(e=>typeof h==`function`?h(e):he(ae(e),h,y),[h,y]),Xe=R===null?k&&/^\d{4}-\d{2}-\d{2}$/.test(k)?Ye(k):``:R,Ze=R===null||!R.trim()?!0:l(R,y)!==null,V=x({dialogLabel:v(`@astryx.dateInput.dialogLabel`),closeButtonLabel:v(`@astryx.dateInput.closeCalendar`),onHide:()=>{oe()&&w.current?.focus()}}),Qe=(0,Y.useCallback)(()=>{M||(V.isOpen?V.hide():V.show())},[M,V]),H=(0,Y.useCallback)(()=>{!M&&!V.isOpen&&V.show({skipAutoFocus:!0})},[M,V]),U=(0,Y.useCallback)(e=>{j||(se?.(e),c&&O(async()=>{A(e),await c(e)}))},[j,se,c,O,A]),$e=(0,Y.useCallback)(e=>{U(void 0),!e||e.detail===0?w.current?.focus():requestAnimationFrame(()=>{w.current?.focus({preventScroll:!0})})},[U]),et=(0,Y.useCallback)(e=>{U(e),z(null),V.hide()},[U,V]),tt=(0,Y.useCallback)(e=>{if(M)return;let t=e.target.value;z(t);let n=l(t,y);if(n&&ce(n)!==s&&!F(n)){let e=ce(n);E.current=e,U(e),T.current?.navigateTo(e)}},[s,U,F,M,y]),W=(0,Y.useCallback)(()=>{if(R===null)return;if(!R.trim()){s!==void 0&&U(void 0),z(null);return}let e=l(R,y);if(e&&!F(e)){let t=ce(e);t!==s&&U(t)}z(null)},[R,s,U,F,y]),G=(0,Y.useCallback)(()=>{W()},[W]),K=(0,Y.useCallback)(e=>{re(e.nativeEvent)||(e.key===`Escape`&&V.isOpen?(e.preventDefault(),V.hide()):(e.key===`ArrowDown`||e.altKey&&e.key===`ArrowDown`)&&!V.isOpen?(e.preventDefault(),M||V.show({skipAutoFocus:!0})):e.key===`Enter`&&(e.preventDefault(),W()))},[V,W,M]),q=(0,X.jsxs)(`div`,{ref:e=>{V.triggerRef(e),P.ref(e)},...ke,...ie(te(`date-input`,{size:b,status:d?.type??null,disabled:a?`disabled`:null}),i(Be.base,Z[b],M&&Be.disabled,d&&He[d.type],d&&!M&&ze[d.type],d&&Ue[d.type],D&&Ge.inGroup,De),Oe,g),children:[D&&(0,X.jsx)(we,{id:Fe,children:e}),(0,X.jsx)(`button`,{type:`button`,onClick:Qe,disabled:M,"aria-label":V.isOpen?v(`@astryx.dateInput.toggleCalendarClose`):v(`@astryx.dateInput.openCalendar`),...i(fe.focusVisible,ot.iconButton,M&&ot.iconButtonDisabled),children:(0,X.jsx)(Ae,{icon:`calendar`,size:`sm`,color:`secondary`,...te(`date-input-toggle-icon`,{state:V.isOpen?`expanded`:`collapsed`})})}),(0,X.jsx)(`input`,{ref:ye(_,w),id:Pe,type:`text`,role:`combobox`,value:Xe,onChange:tt,onBlur:G,onClick:H,onKeyDown:K,placeholder:Ne,disabled:M&&!N,"aria-disabled":N?`true`:void 0,readOnly:N||void 0,"aria-labelledby":Je,"aria-describedby":L,"aria-required":Me?`true`:void 0,"aria-invalid":d?.type===`error`||!Ze?`true`:void 0,"aria-busy":j||void 0,"aria-expanded":V.isOpen,"aria-haspopup":`dialog`,"aria-controls":V.isOpen?V.id:void 0,"aria-autocomplete":`none`,autoComplete:`off`,...{0:{className:`astryx1lliihq astryx98rzlu astryxeuugli astryxc342km astryxng3xce astryx1717udv astryx9ynric astryxjm74w1 astryx6pjikd astryxw6l6zx astryx1tgivj0 astryxjbqb8w astryx1a2a7pz astryxeyghm5`},2:{className:`astryx1lliihq astryx98rzlu astryxeuugli astryxc342km astryxng3xce astryx1717udv astryx9ynric astryxjm74w1 astryx6pjikd astryxw6l6zx astryx1tgivj0 astryxjbqb8w astryx1a2a7pz astryxeyghm5 astryxt0e3qv`},1:{className:`astryx1lliihq astryx98rzlu astryxeuugli astryxc342km astryxng3xce astryx1717udv astryx9ynric astryxjm74w1 astryx6pjikd astryxw6l6zx astryxjbqb8w astryx1a2a7pz astryxeyghm5 astryxv1l7n4`},3:{className:`astryx1lliihq astryx98rzlu astryxeuugli astryxc342km astryxng3xce astryx1717udv astryx9ynric astryxjm74w1 astryx6pjikd astryxw6l6zx astryxjbqb8w astryx1a2a7pz astryxeyghm5 astryxt0e3qv astryxv1l7n4`}}[!!M<<1|!Ze<<0]}),(0,X.jsx)(we,{as:`div`,role:`alert`,"aria-live":`assertive`,children:Ze?``:v(`@astryx.dateInput.invalidDate`)}),p&&s!==void 0&&!M&&(0,X.jsx)(Ve,{label:v(`@astryx.dateInput.clear`,{label:e}),onClick:$e,iconClassName:ne(`date-input-clear-icon`)}),j&&(0,X.jsx)(Se,{size:`sm`}),I,V.render((0,X.jsx)(Le,{handleRef:T,mode:`single`,value:k,onChange:et,min:de,max:pe,dateConstraints:u,numberOfMonths:m,weekStartsOn:Ce}),{placement:`below`,alignment:`start`}),N&&P.renderTooltip(o)]});return D?q:(0,X.jsx)(Re,{label:e,isLabelHidden:t,description:n,inputID:Pe,descriptionID:n?S:void 0,isOptional:ee,isRequired:r,isDisabled:a,status:d?{type:d.type,message:d.message,messageID:d.message?C:void 0}:void 0,statusVariant:f,labelTooltip:_e,width:Te,children:q})}function at(e){let t=v(Q),n=e.nativePicker??`touch`;return n===`always`||n===`touch`&&t?(0,X.jsx)(Qe,{...e}):t?(0,X.jsx)(G,{...e}):(0,X.jsx)(it,{...e})}var Y,X,ot,Z,Q,$=e((()=>{Y=t(n(),1),r(),k(),y(),h(),M(),j(),Te(),Ce(),O(),D(),Me(),ke(),A(),w(),W(),rt(),b(),f(),ue(),X=_e(),ee(),u(),a(),m(),p(),ot={iconButton:{k1xSpc:`astryx78zum5`,kGNEyG:`astryx6s0dn4`,kjj79g:`astryxl56j7k`,kmVPX3:`astryx1717udv`,kg3NbH:null,kuDDbn:null,kE3dHu:null,kP0aTx:null,kpe85a:null,k8WAf4:null,kLKAdn:null,kGO01o:null,kogj98:`astryx1ghz6dp`,kUOVxO:null,keTefX:null,koQZXg:null,k71WvV:null,km5ZXQ:null,kqGvvJ:null,keoZOQ:null,k1K539:null,kMzoRj:`astryxc342km`,kjGldf:null,k2ei4v:null,kZ1KPB:null,ke9TFa:null,kWqL5O:null,kLoX6v:null,kEafiO:null,kt9PQ7:null,ksu8eU:`astryxng3xce`,kJRH4f:null,kVhnKS:null,k4WBpm:null,k8ry5P:null,kSWEuD:null,kDUl1X:null,kPef9Z:null,kfdmCh:null,kWkggS:`astryxjbqb8w`,kkrTdU:`astryx1ypdohk astryx16khyan`,kaIpWk:`astryxh6dtrn`,krdFHd:null,kfmiAY:null,kVL7Gh:null,kT0f0o:null,kIxVMA:null,ksF3WI:null,kqGeR4:null,kYm2EN:null,$$css:!0},iconButtonDisabled:{kkrTdU:`astryxt0e3qv`,$$css:!0}},Z={sm:{kZKoxP:`astryx6k0iem`,k7Eaqz:`astryxfb3i0g`,$$css:!0},md:{kZKoxP:`astryx1ueg155`,k7Eaqz:`astryxfb3i0g`,$$css:!0},lg:{kZKoxP:`astryxssyfek`,k7Eaqz:`astryxfb3i0g`,$$css:!0}},Q=`(pointer: coarse)`,it.displayName=`PointerDateField`,at.displayName=`DateInput`,at.__docgenInfo={description:`A date picker that fits the pointer it is being used with.

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
\`\`\``}},composes:[`Omit`]}})),st=e((()=>{$()}));export{at as n,$ as r,st as t};