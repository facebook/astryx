import{aM as fa,ah as e,a1 as n,I as P,a7 as va,e as Sa,af as ge,a6 as ba,ay as Ta}from"./iframe-Cw8JXX6x.js";import{F as Da}from"./Field-DzUQIr9Z.js";import{a as Re,b as Pe,i as Le,c as L}from"./inputStyles.stylex-Bpqcd25J.js";import{V as Ae}from"./VisuallyHidden-DBBtUghY.js";import{u as Ia,C as wa}from"./Calendar-CBZD9AfF.js";import{u as Ca}from"./usePopover-DBfyiMp1.js";import{u as Oa}from"./useInputContainer-CkOhfW92.js";import{i as ka,k as Va,w as ye,D as ja}from"./plainDate-C-ANv9VG.js";import{p as he}from"./dateParser-XTIqkafj.js";import{f as za,b as Ma,p as xe,i as C,c as Ee,a as qa}from"./timeParser-CAi7zy_b.js";import"./preload-helper-Ct5FWWRu.js";import"./FieldStatus-C1k4mIkj.js";import"./useFocusTrap-RYvdVaLT.js";const fe={row:{k1xSpc:"astryx78zum5",kOIVth:"astryx1txdalj",$$css:!0},dateWrapper:{kUk6DE:"astryx98rzlu",kzQI83:null,kmuXW:null,kCS8Yb:"astryx1r8uery",$$css:!0},timeWrapper:{kUk6DE:"astryx98rzlu",kzQI83:null,kmuXW:null,kCS8Yb:"astryx1r8uery",$$css:!0}},Fe={sm:{kZKoxP:"astryx6k0iem",$$css:!0},md:{kZKoxP:"astryx1ueg155",$$css:!0},lg:{kZKoxP:"astryxssyfek",$$css:!0}};function ve(a){if(!a)return{date:void 0,time:void 0};const t=a.indexOf("T");return t===-1?{date:a,time:void 0}:{date:a.slice(0,t),time:a.slice(t+1)}}function A(a,t){if(!(!a||!t))return`${a}T${t}`}function Wa(a){const t=new Date;return Ee({hour:t.getHours(),minute:t.getMinutes(),second:t.getSeconds()},a)}function l({label:a,isLabelHidden:t=!1,description:r,isOptional:O=!1,isRequired:D=!1,isDisabled:w=!1,value:I,onChange:M,changeAction:k,isLoading:ne=!1,min:q,max:W,dateConstraints:Se,hasSeconds:p=!1,hourFormat:re="12h",timeIncrement:se=1,hasClear:Ne=!1,placeholder:He="Select a date",timePlaceholder:be="Select a time",timeLabel:$e,size:Be,status:o,labelTooltip:Ye,numberOfMonths:Ue=1,width:Ke,xstyle:Xe,className:Ze,style:Qe,ref:Ge,...Je}){const ie=fa(Be,"md"),Te=e.useId(),ea=e.useId(),De=e.useId(),Ie=e.useId(),le=e.useRef(null),we=e.useRef(null),Ce=e.useRef(null),Oe=e.useRef(null),oe=e.useRef(void 0),[,ke]=e.useTransition(),[ue,Ve]=e.useOptimistic(I),V=ne||ue!==I,c=w||V,aa={warning:"warning",error:"error",success:"success"},ta={warning:"warning",error:"error",success:"success"},na=[r?De:null,o?.message?Ie:null].filter(Boolean).join(" ")||void 0,g=e.useMemo(()=>ve(q),[q]),y=e.useMemo(()=>ve(W),[W]),s=e.useMemo(()=>ve(ue),[ue]),je=g.date,ze=y.date,{isDateDisabled:_}=Ia({min:je,max:ze,dateConstraints:Se}),b=e.useMemo(()=>{if(!(!g.date||!g.time||!s.date))return s.date===g.date?g.time:void 0},[g.date,g.time,s.date]),T=e.useMemo(()=>{if(!(!y.date||!y.time||!s.date))return s.date===y.date?y.time:void 0},[y.date,y.time,s.date]),[v,j]=e.useState(null),Me=e.useRef(s.date);s.date!==Me.current&&(Me.current=s.date,s.date!==oe.current&&(oe.current=void 0,v!==null&&j(null)));const ra=v!==null?v:s.date&&/^\d{4}-\d{2}-\d{2}$/.test(s.date)?ka(Va(s.date),ja):"",de=v===null||!v.trim()?!0:he(v)!==null,[f,me]=e.useState(null),[qe,We]=e.useState(!1),_e=re==="12h"?za:Ma,ce=e.useMemo(()=>f!==null?f:s.time?_e(s.time,p):"",[f,s.time,_e,p]),pe=e.useMemo(()=>{if(f===null||!f.trim())return!0;const i=xe(f,p);return i?C(i,b,T):!1},[f,p,b,T]),sa=e.useMemo(()=>qe&&!ce?re==="12h"?"e.g., 2:30 PM":"e.g., 14:30":be,[qe,ce,re,be]),h=e.useCallback(i=>{V||(M(i),k&&ke(async()=>{Ve(i),await k(i)}))},[V,M,k,ke,Ve]),u=Ca({dialogLabel:"Choose date",closeButtonLabel:"Close calendar",onHide:()=>le.current?.focus()}),ia=e.useCallback(()=>{c||(u.isOpen?u.hide():u.show())},[c,u]),la=e.useCallback(()=>{!c&&!u.isOpen&&u.show({skipAutoFocus:!0})},[c,u]),z=e.useCallback((i,d)=>{let m=s.time??Wa(p);g.date&&i===g.date&&g.time&&(C(m,g.time,void 0)||(m=g.time)),y.date&&i===y.date&&y.time&&(C(m,void 0,y.time)||(m=y.time));const S=A(i,m);S&&h(S),d==="calendar"&&(j(null),u.hide())},[s.time,p,g,y,h,u]),oa=e.useCallback(i=>{const d=i.target.value;j(d);const x=he(d);if(x&&ye(x)!==s.date&&!_(x)){const m=ye(x);oe.current=m,z(m,"input"),Oe.current?.navigateTo(m)}},[s.date,_,z]),R=e.useCallback(()=>{if(v===null)return;if(!v.trim()){I!==void 0&&h(void 0),j(null);return}const i=he(v);if(i&&!_(i)){const d=ye(i);d!==s.date&&z(d,"input")}j(null)},[v,I,s.date,h,_,z]),ua=e.useCallback(()=>{R()},[R]),da=e.useCallback(i=>{i.key==="Escape"&&u.isOpen?(i.preventDefault(),u.hide()):i.key==="Enter"&&(i.preventDefault(),R())},[u,R]),ma=e.useCallback(i=>{const d=i.target.value;me(d);const x=xe(d,p);if(x&&C(x,b,T)&&x!==s.time&&s.date){const m=A(s.date,x);m&&h(m)}},[p,b,T,s.time,s.date,h]),ca=e.useCallback(()=>We(!0),[]),pa=e.useCallback(()=>{if(We(!1),f===null)return;if(!f.trim()){me(null);return}const i=xe(f,p);if(i&&C(i,b,T)&&i!==s.time&&s.date){const d=A(s.date,i);d&&h(d)}me(null)},[f,p,b,T,s,h]),ga=e.useCallback(i=>{if(i.key==="ArrowUp"||i.key==="ArrowDown"){i.preventDefault();let d=s.time;if(!d){const S=new Date;d=Ee({hour:S.getHours(),minute:S.getMinutes(),second:S.getSeconds()},p)}const x=i.key==="ArrowUp"?se:-se,m=qa(d,x,p);if(C(m,b,T)&&s.date){const S=A(s.date,m);S&&h(S)}}},[s,p,se,b,T,h]),ya=e.useCallback(()=>{h(void 0),le.current?.focus()},[h]),{onClick:ha,onMouseUp:xa}=Oa({containerRef:Ce,inputRef:we,disabled:c});return n.jsxs(Da,{label:a,isLabelHidden:t,description:r,inputID:Te,descriptionID:r?De:void 0,isOptional:O,isRequired:D,isDisabled:w,status:o?{type:o.type,message:o.message,messageID:o.message?Ie:void 0}:void 0,labelTooltip:Ye,statusVariant:"detached",width:Ke,children:[n.jsxs("div",{...Je,...ba(Ta("date-time-input",{size:ie,status:o?.type??null}),ge(fe.row,Xe),Ze,Qe),children:[n.jsxs("div",{ref:u.triggerRef,...ge(L.base,Fe[ie],fe.dateWrapper,c&&L.disabled,o&&Le[o.type],o&&Pe[o.type],o&&Re[o.type]),children:[n.jsx("button",{type:"button",onClick:ia,disabled:c,"aria-label":u.isOpen?"Close calendar":"Open calendar",...{0:{className:"astryx78zum5 astryx6s0dn4 astryxl56j7k astryx1717udv astryx1ghz6dp astryxc342km astryxng3xce astryxjbqb8w astryx1ypdohk astryxh6dtrn astryx1a2a7pz astryx1p25gnr astryx1y3gkto"},1:{className:"astryx78zum5 astryx6s0dn4 astryxl56j7k astryx1717udv astryx1ghz6dp astryxc342km astryxng3xce astryxjbqb8w astryxh6dtrn astryx1a2a7pz astryx1p25gnr astryx1y3gkto astryx1h6gzvc"}}[!!c<<0],children:n.jsx(P,{icon:"calendar",size:"sm",color:"secondary"})}),n.jsx("input",{ref:va(Ge,le),id:Te,type:"text",role:"combobox",value:ra,onChange:oa,onBlur:ua,onClick:la,onKeyDown:da,placeholder:He,disabled:c,"aria-describedby":na,"aria-required":D===!0?"true":void 0,"aria-invalid":o?.type==="error"||!de?"true":void 0,"aria-busy":V||void 0,"aria-expanded":u.isOpen,"aria-haspopup":"dialog","aria-controls":u.isOpen?u.id:void 0,"aria-autocomplete":"none",autoComplete:"off",...{0:{className:"astryx1lliihq astryx98rzlu astryxeuugli astryxc342km astryxng3xce astryx1717udv astryx9ynric astryxjm74w1 astryx6pjikd astryxw6l6zx astryx1tgivj0 astryxjbqb8w astryx1a2a7pz astryxeyghm5"},2:{className:"astryx1lliihq astryx98rzlu astryxeuugli astryxc342km astryxng3xce astryx1717udv astryx9ynric astryxjm74w1 astryx6pjikd astryxw6l6zx astryx1tgivj0 astryxjbqb8w astryx1a2a7pz astryxeyghm5 astryx1h6gzvc"},1:{className:"astryx1lliihq astryx98rzlu astryxeuugli astryxc342km astryxng3xce astryx1717udv astryx9ynric astryxjm74w1 astryx6pjikd astryxw6l6zx astryxjbqb8w astryx1a2a7pz astryxeyghm5 astryxv1l7n4"},3:{className:"astryx1lliihq astryx98rzlu astryxeuugli astryxc342km astryxng3xce astryx1717udv astryx9ynric astryxjm74w1 astryx6pjikd astryxw6l6zx astryxjbqb8w astryx1a2a7pz astryxeyghm5 astryx1h6gzvc astryxv1l7n4"}}[!!c<<1|!de<<0]}),n.jsx(Ae,{as:"div",role:"alert","aria-live":"assertive",children:de?"":"Invalid date"}),Ne&&I!==void 0&&!c&&n.jsx("button",{type:"button",onClick:ya,"aria-label":`Clear ${a}`,className:"astryx78zum5 astryx6s0dn4 astryxl56j7k astryx1717udv astryx1ghz6dp astryxc342km astryxng3xce astryxjbqb8w astryx1ypdohk astryxh6dtrn astryx1a2a7pz astryx1p25gnr astryx1y3gkto",children:n.jsx(P,{icon:"close",size:"sm",color:"secondary"})}),V&&n.jsx(Sa,{size:"sm"}),o&&n.jsx(P,{icon:aa[o.type],size:"md",color:ta[o.type]})]}),n.jsxs("div",{ref:Ce,onClick:ha,onMouseUp:xa,...ge(L.base,Fe[ie],fe.timeWrapper,c&&L.disabled,o&&Le[o.type],o&&Pe[o.type],o&&Re[o.type]),children:[n.jsx("div",{className:"astryx78zum5 astryx6s0dn4 astryxl56j7k astryx2lah0s",children:n.jsx(P,{icon:"clock",size:"sm",color:"secondary"})}),n.jsx("input",{ref:we,id:ea,type:"text",value:ce,onChange:ma,onFocus:ca,onBlur:pa,onKeyDown:ga,placeholder:sa,disabled:c,"aria-label":$e??`${a} time`,"aria-required":D===!0?"true":void 0,"aria-invalid":o?.type==="error"||!pe?"true":void 0,...{0:{className:"astryx1lliihq astryx98rzlu astryxeuugli astryxc342km astryxng3xce astryx1717udv astryx9ynric astryxjm74w1 astryx6pjikd astryxw6l6zx astryx1tgivj0 astryxjbqb8w astryx1a2a7pz astryxeyghm5"},2:{className:"astryx1lliihq astryx98rzlu astryxeuugli astryxc342km astryxng3xce astryx1717udv astryx9ynric astryxjm74w1 astryx6pjikd astryxw6l6zx astryx1tgivj0 astryxjbqb8w astryx1a2a7pz astryxeyghm5 astryx1h6gzvc"},1:{className:"astryx1lliihq astryx98rzlu astryxeuugli astryxc342km astryxng3xce astryx1717udv astryx9ynric astryxjm74w1 astryx6pjikd astryxw6l6zx astryxjbqb8w astryx1a2a7pz astryxeyghm5 astryxv1l7n4"},3:{className:"astryx1lliihq astryx98rzlu astryxeuugli astryxc342km astryxng3xce astryx1717udv astryx9ynric astryxjm74w1 astryx6pjikd astryxw6l6zx astryxjbqb8w astryx1a2a7pz astryxeyghm5 astryx1h6gzvc astryxv1l7n4"}}[!!c<<1|!pe<<0]}),n.jsx(Ae,{as:"div",role:"alert","aria-live":"assertive",children:pe?"":"Invalid time"})]})]}),u.render(n.jsx(wa,{handleRef:Oe,mode:"single",value:s.date,onChange:i=>z(i,"calendar"),min:je,max:ze,dateConstraints:Se,numberOfMonths:Ue}),{placement:"below",alignment:"start"})]})}l.displayName="DateTimeInput";l.__docgenInfo={description:`A combined date and time picker with side-by-side date input and
time input under a single label. The date input opens a calendar
popover; the time input supports typed entry and arrow-key adjustment.

@example
\`\`\`
<DateTimeInput
  label="Meeting time"
  value={dateTime}
  onChange={setDateTime}
/>
\`\`\``,methods:[],displayName:"DateTimeInput",props:{ref:{required:!1,tsType:{name:"ReactRef",raw:"React.Ref<HTMLInputElement>",elements:[{name:"HTMLInputElement"}]},description:"Ref forwarded to the date input element"},label:{required:!0,tsType:{name:"string"},description:"Label text for the input (required for accessibility)."},isLabelHidden:{required:!1,tsType:{name:"boolean"},description:`Whether to visually hide the label (still accessible to screen readers).
@default false`,defaultValue:{value:"false",computed:!1}},description:{required:!1,tsType:{name:"string"},description:"Description text displayed between the label and input."},isOptional:{required:!1,tsType:{name:"boolean"},description:`Whether the field is optional. Mutually exclusive with isRequired.
@default false`,defaultValue:{value:"false",computed:!1}},isRequired:{required:!1,tsType:{name:"boolean"},description:`Whether the field is required. Mutually exclusive with isOptional.
@default false`,defaultValue:{value:"false",computed:!1}},isDisabled:{required:!1,tsType:{name:"boolean"},description:`Whether the input is disabled.
@default false`,defaultValue:{value:"false",computed:!1}},value:{required:!1,tsType:{name:"intersection",raw:`string & {
  readonly __brand: 'ISODateTimeString';
}`,elements:[{name:"string"},{name:"signature",type:"object",raw:`{
  readonly __brand: 'ISODateTimeString';
}`,signature:{properties:[{key:"__brand",value:{name:"literal",value:"'ISODateTimeString'",required:!0}}]}}]},description:'The selected datetime in ISO 8601 format ("YYYY-MM-DDTHH:MM" or "YYYY-MM-DDTHH:MM:SS").'},onChange:{required:!0,tsType:{name:"signature",type:"function",raw:"(value: ISODateTimeString | undefined) => void",signature:{arguments:[{type:{name:"union",raw:"ISODateTimeString | undefined",elements:[{name:"intersection",raw:`string & {
  readonly __brand: 'ISODateTimeString';
}`,elements:[{name:"string"},{name:"signature",type:"object",raw:`{
  readonly __brand: 'ISODateTimeString';
}`,signature:{properties:[{key:"__brand",value:{name:"literal",value:"'ISODateTimeString'",required:!0}}]}}]},{name:"undefined"}]},name:"value"}],return:{name:"void"}}},description:`Callback fired when the datetime changes.
Called with undefined when input is cleared.`},changeAction:{required:!1,tsType:{name:"signature",type:"function",raw:"(value: ISODateTimeString | undefined) => void | Promise<void>",signature:{arguments:[{type:{name:"union",raw:"ISODateTimeString | undefined",elements:[{name:"intersection",raw:`string & {
  readonly __brand: 'ISODateTimeString';
}`,elements:[{name:"string"},{name:"signature",type:"object",raw:`{
  readonly __brand: 'ISODateTimeString';
}`,signature:{properties:[{key:"__brand",value:{name:"literal",value:"'ISODateTimeString'",required:!0}}]}}]},{name:"undefined"}]},name:"value"}],return:{name:"union",raw:"void | Promise<void>",elements:[{name:"void"},{name:"Promise",elements:[{name:"void"}],raw:"Promise<void>"}]}}},description:"Async action on change. Fires after onChange."},isLoading:{required:!1,tsType:{name:"boolean"},description:`Whether the input is in a loading state.
@default false`,defaultValue:{value:"false",computed:!1}},min:{required:!1,tsType:{name:"intersection",raw:`string & {
  readonly __brand: 'ISODateTimeString';
}`,elements:[{name:"string"},{name:"signature",type:"object",raw:`{
  readonly __brand: 'ISODateTimeString';
}`,signature:{properties:[{key:"__brand",value:{name:"literal",value:"'ISODateTimeString'",required:!0}}]}}]},description:`Minimum selectable datetime in ISO format.
Constrains both date and time selection.`},max:{required:!1,tsType:{name:"intersection",raw:`string & {
  readonly __brand: 'ISODateTimeString';
}`,elements:[{name:"string"},{name:"signature",type:"object",raw:`{
  readonly __brand: 'ISODateTimeString';
}`,signature:{properties:[{key:"__brand",value:{name:"literal",value:"'ISODateTimeString'",required:!0}}]}}]},description:`Maximum selectable datetime in ISO format.
Constrains both date and time selection.`},dateConstraints:{required:!1,tsType:{name:"ReadonlyArray",elements:[{name:"signature",type:"function",raw:"(date: Date) => boolean",signature:{arguments:[{type:{name:"Date"},name:"date"}],return:{name:"boolean"}}}],raw:"ReadonlyArray<(date: Date) => boolean>"},description:`Custom date constraint functions.
Date is disabled in the calendar if ANY function returns false.`},hasSeconds:{required:!1,tsType:{name:"boolean"},description:`Whether to include seconds in the time portion.
@default false`,defaultValue:{value:"false",computed:!1}},hourFormat:{required:!1,tsType:{name:"union",raw:"'12h' | '24h'",elements:[{name:"literal",value:"'12h'"},{name:"literal",value:"'24h'"}]},description:`Hour display format.
@default '12h'`,defaultValue:{value:"'12h'",computed:!1}},timeIncrement:{required:!1,tsType:{name:"number"},description:`Time increment in minutes when using arrow keys in the time input.
@default 1`,defaultValue:{value:"1",computed:!1}},hasClear:{required:!1,tsType:{name:"boolean"},description:`Whether to show a clear button when a value is set.
@default false`,defaultValue:{value:"false",computed:!1}},placeholder:{required:!1,tsType:{name:"string"},description:`Placeholder text shown in the date portion when no date is selected.
@default "Select a date"`,defaultValue:{value:"'Select a date'",computed:!1}},timePlaceholder:{required:!1,tsType:{name:"string"},description:`Placeholder text shown in the time portion when no time is selected.
@default "Select a time"`,defaultValue:{value:"'Select a time'",computed:!1}},timeLabel:{required:!1,tsType:{name:"string"},description:`Accessible label for the time portion of the field. Defaults to
\`"{label} time"\` so it is tied to the field's own label and localizable,
rather than a hardcoded English "Time".`},size:{required:!1,tsType:{name:"union",raw:"'sm' | 'md' | 'lg'",elements:[{name:"literal",value:"'sm'"},{name:"literal",value:"'md'"},{name:"literal",value:"'lg'"}]},description:`The size of the inputs.
@default 'md'`},status:{required:!1,tsType:{name:"InputStatus"},description:"Status indicator for the input."},width:{required:!1,tsType:{name:"union",raw:"number | string",elements:[{name:"number"},{name:"string"}]},description:"Width of the field. Numbers are treated as pixels, strings are used as-is\n(e.g. `'100%'`). Sizes the whole field (label, control, and status) so they\nstay aligned, unlike setting width via `xstyle`/`className`/`style`."},labelTooltip:{required:!1,tsType:{name:"string"},description:"Tooltip text to display in an info icon at the end of the label."},numberOfMonths:{required:!1,tsType:{name:"union",raw:"1 | 2",elements:[{name:"literal",value:"1"},{name:"literal",value:"2"}]},description:`Number of months to display in the calendar.
@default 1`,defaultValue:{value:"1",computed:!1}},xstyle:{required:!1,tsType:{name:"StyleXStyles"},description:"Style overrides applied to the outer row container."}},composes:["Omit"]};const Ka={title:"Core/DateTimeInput",component:l,tags:["autodocs"],argTypes:{label:{control:"text",description:"Label text (required)"},isLabelHidden:{control:"boolean",description:"Visually hide the label (still accessible to screen readers)"},placeholder:{control:"text",description:"Placeholder text"},description:{control:"text",description:"Description text displayed between the label and input"},isOptional:{control:"boolean",description:"Whether the field is optional (mutually exclusive with isRequired)"},isRequired:{control:"boolean",description:"Whether the field is required (mutually exclusive with isOptional)"},isDisabled:{control:"boolean",description:"Whether the input is disabled"},size:{control:"radio",options:["sm","md","lg"]},hourFormat:{control:"radio",options:["12h","24h"],description:"Hour format for display"},hasSeconds:{control:"boolean",description:"Whether to include seconds in the time"},hasClear:{control:"boolean",description:"Whether to show a clear button"},numberOfMonths:{control:"radio",options:[1,2],description:"Number of months to display in calendar"},timeIncrement:{control:"number",description:"Minutes to increment/decrement with arrow keys"}}},F={render:a=>{const[t,r]=e.useState(void 0);return n.jsx(l,{...a,value:t,onChange:r})},args:{label:"Meeting time",placeholder:"Select a date"}},E={render:a=>{const[t,r]=e.useState("2026-03-15T14:30");return n.jsx(l,{...a,value:t,onChange:r})},args:{label:"Event time"}},N={render:a=>{const[t,r]=e.useState("2026-03-15T14:30");return n.jsx(l,{...a,value:t,onChange:r})},args:{label:"Appointment",hourFormat:"24h"}},H={render:a=>{const[t,r]=e.useState("2026-03-15T14:30:45");return n.jsx(l,{...a,value:t,onChange:r})},args:{label:"Log timestamp",hasSeconds:!0}},$={render:a=>{const[t,r]=e.useState(void 0);return n.jsx(l,{...a,value:t,onChange:r})},args:{label:"Deadline",description:"When is this task due?",placeholder:"Select deadline"}},B={render:a=>{const[t,r]=e.useState("2026-03-15T09:00");return n.jsx(l,{...a,value:t,onChange:r})},args:{label:"Start time",hasClear:!0}},Y={render:a=>{const[t,r]=e.useState(void 0);return n.jsx(l,{...a,value:t,onChange:r})},args:{label:"Appointment",min:"2026-03-15T09:00",max:"2026-03-15T17:00",description:"Available: Mar 15, 9 AM - 5 PM"}},U={render:a=>{const[t,r]=e.useState("2026-03-15T09:00");return n.jsx(l,{...a,value:t,onChange:r})},args:{label:"Time slot",timeIncrement:15,description:"Use arrow keys to change by 15 minutes"}},K={render:a=>{const[t,r]=e.useState(void 0);return n.jsx(l,{...a,value:t,onChange:r})},args:{label:"Preferred time",isOptional:!0,placeholder:"Select a date (optional)"}},X={render:a=>{const[t,r]=e.useState(void 0);return n.jsx(l,{...a,value:t,onChange:r})},args:{label:"Start time",isRequired:!0}},Z={render:a=>{const[t,r]=e.useState("2026-03-15T10:00");return n.jsx(l,{...a,value:t,onChange:r})},args:{label:"Locked time",isDisabled:!0}},Q={render:()=>{const[a,t]=e.useState(void 0),[r,O]=e.useState(void 0),[D,w]=e.useState(void 0);return n.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"16px",maxWidth:"460px"},children:[n.jsx(l,{label:"Small (28px)",value:a,onChange:t,placeholder:"Small size",size:"sm"}),n.jsx(l,{label:"Medium (32px)",value:r,onChange:O,placeholder:"Medium size (default)",size:"md"}),n.jsx(l,{label:"Large (36px)",value:D,onChange:w,placeholder:"Large size",size:"lg"})]})}},G={render:a=>{const[t,r]=e.useState(void 0);return n.jsx(l,{...a,value:t,onChange:r})},args:{label:"Travel departure",numberOfMonths:2}},J={render:a=>{const[t,r]=e.useState("2026-03-15T14:30");return n.jsx(l,{...a,value:t,onChange:r})},args:{label:"Event time",status:{type:"error",message:"This time slot is not available"}}},ee={render:a=>{const[t,r]=e.useState("2026-03-15T07:00");return n.jsx(l,{...a,value:t,onChange:r})},args:{label:"Meeting time",status:{type:"warning",message:"Early morning meeting - are you sure?"}}},ae={render:a=>{const[t,r]=e.useState("2026-03-15T10:00");return n.jsx(l,{...a,value:t,onChange:r})},args:{label:"Scheduled time",status:{type:"success",message:"Time slot is available"}}},te={render:()=>{const[a,t]=e.useState(void 0),[r,O]=e.useState("2026-03-15T14:30"),[D,w]=e.useState("2026-03-15T14:30"),[I,M]=e.useState(void 0),[k,ne]=e.useState("2026-03-15T10:00"),[q,W]=e.useState("2026-03-15T22:00");return n.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"16px",maxWidth:"460px"},children:[n.jsx(l,{label:"Default",value:a,onChange:t,placeholder:"Select a date"}),n.jsx(l,{label:"With value (12h)",value:r,onChange:O}),n.jsx(l,{label:"24-hour format",value:D,onChange:w,hourFormat:"24h"}),n.jsx(l,{label:"With description",description:"Pick your preferred datetime",value:I,onChange:M}),n.jsx(l,{label:"Disabled",isDisabled:!0,value:k,onChange:ne}),n.jsx(l,{label:"With error",value:q,onChange:W,status:{type:"error",message:"Invalid datetime selection"}})]})}};F.parameters={...F.parameters,docs:{...F.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<ISODateTimeString | undefined>(undefined);
    return <DateTimeInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Meeting time',
    placeholder: 'Select a date'
  }
}`,...F.parameters?.docs?.source}}};E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<ISODateTimeString | undefined>('2026-03-15T14:30' as ISODateTimeString);
    return <DateTimeInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Event time'
  }
}`,...E.parameters?.docs?.source}}};N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<ISODateTimeString | undefined>('2026-03-15T14:30' as ISODateTimeString);
    return <DateTimeInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Appointment',
    hourFormat: '24h'
  }
}`,...N.parameters?.docs?.source}}};H.parameters={...H.parameters,docs:{...H.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<ISODateTimeString | undefined>('2026-03-15T14:30:45' as ISODateTimeString);
    return <DateTimeInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Log timestamp',
    hasSeconds: true
  }
}`,...H.parameters?.docs?.source}}};$.parameters={...$.parameters,docs:{...$.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<ISODateTimeString | undefined>(undefined);
    return <DateTimeInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Deadline',
    description: 'When is this task due?',
    placeholder: 'Select deadline'
  }
}`,...$.parameters?.docs?.source}}};B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<ISODateTimeString | undefined>('2026-03-15T09:00' as ISODateTimeString);
    return <DateTimeInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Start time',
    hasClear: true
  }
}`,...B.parameters?.docs?.source}}};Y.parameters={...Y.parameters,docs:{...Y.parameters?.docs,source:{originalSource:`{
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
}`,...Y.parameters?.docs?.source}}};U.parameters={...U.parameters,docs:{...U.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<ISODateTimeString | undefined>('2026-03-15T09:00' as ISODateTimeString);
    return <DateTimeInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Time slot',
    timeIncrement: 15,
    description: 'Use arrow keys to change by 15 minutes'
  }
}`,...U.parameters?.docs?.source}}};K.parameters={...K.parameters,docs:{...K.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<ISODateTimeString | undefined>(undefined);
    return <DateTimeInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Preferred time',
    isOptional: true,
    placeholder: 'Select a date (optional)'
  }
}`,...K.parameters?.docs?.source}}};X.parameters={...X.parameters,docs:{...X.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<ISODateTimeString | undefined>(undefined);
    return <DateTimeInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Start time',
    isRequired: true
  }
}`,...X.parameters?.docs?.source}}};Z.parameters={...Z.parameters,docs:{...Z.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<ISODateTimeString | undefined>('2026-03-15T10:00' as ISODateTimeString);
    return <DateTimeInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Locked time',
    isDisabled: true
  }
}`,...Z.parameters?.docs?.source}}};Q.parameters={...Q.parameters,docs:{...Q.parameters?.docs,source:{originalSource:`{
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
}`,...Q.parameters?.docs?.source}}};G.parameters={...G.parameters,docs:{...G.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<ISODateTimeString | undefined>(undefined);
    return <DateTimeInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Travel departure',
    numberOfMonths: 2
  }
}`,...G.parameters?.docs?.source}}};J.parameters={...J.parameters,docs:{...J.parameters?.docs,source:{originalSource:`{
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
}`,...J.parameters?.docs?.source}}};ee.parameters={...ee.parameters,docs:{...ee.parameters?.docs,source:{originalSource:`{
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
}`,...ee.parameters?.docs?.source}}};ae.parameters={...ae.parameters,docs:{...ae.parameters?.docs,source:{originalSource:`{
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
}`,...ae.parameters?.docs?.source}}};te.parameters={...te.parameters,docs:{...te.parameters?.docs,source:{originalSource:`{
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
}`,...te.parameters?.docs?.source}}};const Xa=["Default","WithValue","TwentyFourHourFormat","WithSeconds","WithDescription","WithClearButton","WithMinMax","WithTimeIncrement","Optional","Required","Disabled","SizeVariants","TwoMonthCalendar","WithErrorStatus","WithWarningStatus","WithSuccessStatus","AllVariations"];export{te as AllVariations,F as Default,Z as Disabled,K as Optional,X as Required,Q as SizeVariants,N as TwentyFourHourFormat,G as TwoMonthCalendar,B as WithClearButton,$ as WithDescription,J as WithErrorStatus,Y as WithMinMax,H as WithSeconds,ae as WithSuccessStatus,U as WithTimeIncrement,E as WithValue,ee as WithWarningStatus,Xa as __namedExportsOrder,Ka as default};
