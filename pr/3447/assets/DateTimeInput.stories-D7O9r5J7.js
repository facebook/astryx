import{aM as ha,ah as e,a1 as n,I as P,a7 as fa,e as va,af as ye,a6 as Sa,ay as ba}from"./iframe-j1EZkcGb.js";import{F as Ta}from"./Field-MJLQjcWT.js";import{a as Re,b as Pe,i as Le,c as L}from"./inputStyles.stylex-Bpqcd25J.js";import{u as Da,C as Ia}from"./Calendar-C9HGPNf-.js";import{u as wa}from"./usePopover-Db3MCAxh.js";import{u as Ca}from"./useInputContainer-NEfGrLOd.js";import{i as ka,k as Oa,w as ge,D as ja}from"./plainDate-C-ANv9VG.js";import{p as xe}from"./dateParser-XTIqkafj.js";import{f as Va,b as za,p as he,i as C,c as Ae,a as qa}from"./timeParser-CAi7zy_b.js";import"./preload-helper-Ct5FWWRu.js";import"./FieldStatus-BgagH4tV.js";const fe={row:{k1xSpc:"astryx78zum5",kOIVth:"astryx1txdalj",$$css:!0},dateWrapper:{kUk6DE:"astryx98rzlu",kzQI83:null,kmuXW:null,kCS8Yb:"astryx1r8uery",$$css:!0},timeWrapper:{kUk6DE:"astryx98rzlu",kzQI83:null,kmuXW:null,kCS8Yb:"astryx1r8uery",$$css:!0}},Ne={sm:{kZKoxP:"astryx6k0iem",$$css:!0},md:{kZKoxP:"astryx1ueg155",$$css:!0},lg:{kZKoxP:"astryxssyfek",$$css:!0}};function ve(a){if(!a)return{date:void 0,time:void 0};const t=a.indexOf("T");return t===-1?{date:a,time:void 0}:{date:a.slice(0,t),time:a.slice(t+1)}}function N(a,t){if(!(!a||!t))return`${a}T${t}`}function Ma(a){const t=new Date;return Ae({hour:t.getHours(),minute:t.getMinutes(),second:t.getSeconds()},a)}function l({label:a,isLabelHidden:t=!1,description:r,isOptional:k=!1,isRequired:D=!1,isDisabled:w=!1,value:I,onChange:q,changeAction:O,isLoading:ne=!1,min:M,max:W,dateConstraints:Se,hasSeconds:p=!1,hourFormat:re="12h",timeIncrement:se=1,hasClear:Fe=!1,placeholder:Ee="Select a date",timePlaceholder:be="Select a time",timeLabel:$e,size:He,status:o,labelTooltip:Be,numberOfMonths:Ye=1,width:Ue,xstyle:Ke,className:Xe,style:Ze,ref:Qe,...Ge}){const ie=ha(He,"md"),Te=e.useId(),Je=e.useId(),De=e.useId(),Ie=e.useId(),le=e.useRef(null),we=e.useRef(null),Ce=e.useRef(null),ke=e.useRef(null),oe=e.useRef(void 0),[,Oe]=e.useTransition(),[ue,je]=e.useOptimistic(I),j=ne||ue!==I,m=w||j,ea={warning:"warning",error:"error",success:"success"},aa={warning:"warning",error:"error",success:"success"},ta=[r?De:null,o?.message?Ie:null].filter(Boolean).join(" ")||void 0,y=e.useMemo(()=>ve(M),[M]),g=e.useMemo(()=>ve(W),[W]),s=e.useMemo(()=>ve(ue),[ue]),Ve=y.date,ze=g.date,{isDateDisabled:_}=Da({min:Ve,max:ze,dateConstraints:Se}),b=e.useMemo(()=>{if(!(!y.date||!y.time||!s.date))return s.date===y.date?y.time:void 0},[y.date,y.time,s.date]),T=e.useMemo(()=>{if(!(!g.date||!g.time||!s.date))return s.date===g.date?g.time:void 0},[g.date,g.time,s.date]),[v,V]=e.useState(null),qe=e.useRef(s.date);s.date!==qe.current&&(qe.current=s.date,s.date!==oe.current&&(oe.current=void 0,v!==null&&V(null)));const na=v!==null?v:s.date&&/^\d{4}-\d{2}-\d{2}$/.test(s.date)?ka(Oa(s.date),ja):"",de=v===null||!v.trim()?!0:xe(v)!==null,[f,ce]=e.useState(null),[Me,We]=e.useState(!1),_e=re==="12h"?Va:za,me=e.useMemo(()=>f!==null?f:s.time?_e(s.time,p):"",[f,s.time,_e,p]),pe=e.useMemo(()=>{if(f===null||!f.trim())return!0;const i=he(f,p);return i?C(i,b,T):!1},[f,p,b,T]),ra=e.useMemo(()=>Me&&!me?re==="12h"?"e.g., 2:30 PM":"e.g., 14:30":be,[Me,me,re,be]),x=e.useCallback(i=>{j||(q(i),O&&Oe(async()=>{je(i),await O(i)}))},[j,q,O,Oe,je]),u=wa({dialogLabel:"Choose date",closeButtonLabel:"Close calendar",onHide:()=>le.current?.focus()}),sa=e.useCallback(()=>{m||(u.isOpen?u.hide():u.show())},[m,u]),ia=e.useCallback(()=>{!m&&!u.isOpen&&u.show({skipAutoFocus:!0})},[m,u]),z=e.useCallback((i,d)=>{let c=s.time??Ma(p);y.date&&i===y.date&&y.time&&(C(c,y.time,void 0)||(c=y.time)),g.date&&i===g.date&&g.time&&(C(c,void 0,g.time)||(c=g.time));const S=N(i,c);S&&x(S),d==="calendar"&&(V(null),u.hide())},[s.time,p,y,g,x,u]),la=e.useCallback(i=>{const d=i.target.value;V(d);const h=xe(d);if(h&&ge(h)!==s.date&&!_(h)){const c=ge(h);oe.current=c,z(c,"input"),ke.current?.navigateTo(c)}},[s.date,_,z]),R=e.useCallback(()=>{if(v===null)return;if(!v.trim()){I!==void 0&&x(void 0),V(null);return}const i=xe(v);if(i&&!_(i)){const d=ge(i);d!==s.date&&z(d,"input")}V(null)},[v,I,s.date,x,_,z]),oa=e.useCallback(()=>{R()},[R]),ua=e.useCallback(i=>{i.key==="Escape"&&u.isOpen?(i.preventDefault(),u.hide()):i.key==="Enter"&&(i.preventDefault(),R())},[u,R]),da=e.useCallback(i=>{const d=i.target.value;ce(d);const h=he(d,p);if(h&&C(h,b,T)&&h!==s.time&&s.date){const c=N(s.date,h);c&&x(c)}},[p,b,T,s.time,s.date,x]),ca=e.useCallback(()=>We(!0),[]),ma=e.useCallback(()=>{if(We(!1),f===null)return;if(!f.trim()){ce(null);return}const i=he(f,p);if(i&&C(i,b,T)&&i!==s.time&&s.date){const d=N(s.date,i);d&&x(d)}ce(null)},[f,p,b,T,s,x]),pa=e.useCallback(i=>{if(i.key==="ArrowUp"||i.key==="ArrowDown"){i.preventDefault();let d=s.time;if(!d){const S=new Date;d=Ae({hour:S.getHours(),minute:S.getMinutes(),second:S.getSeconds()},p)}const h=i.key==="ArrowUp"?se:-se,c=qa(d,h,p);if(C(c,b,T)&&s.date){const S=N(s.date,c);S&&x(S)}}},[s,p,se,b,T,x]),ya=e.useCallback(()=>{x(void 0),le.current?.focus()},[x]),{onClick:ga,onMouseUp:xa}=Ca({containerRef:Ce,inputRef:we,disabled:m});return n.jsxs(Ta,{label:a,isLabelHidden:t,description:r,inputID:Te,descriptionID:r?De:void 0,isOptional:k,isRequired:D,isDisabled:w,status:o?{type:o.type,message:o.message,messageID:o.message?Ie:void 0}:void 0,labelTooltip:Be,statusVariant:"detached",width:Ue,children:[n.jsxs("div",{...Ge,...Sa(ba("date-time-input",{size:ie,status:o?.type??null}),ye(fe.row,Ke),Xe,Ze),children:[n.jsxs("div",{ref:u.triggerRef,...ye(L.base,Ne[ie],fe.dateWrapper,m&&L.disabled,o&&Le[o.type],o&&Pe[o.type],o&&Re[o.type]),children:[n.jsx("button",{type:"button",onClick:sa,disabled:m,"aria-label":u.isOpen?"Close calendar":"Open calendar",...{0:{className:"astryx78zum5 astryx6s0dn4 astryxl56j7k astryx1717udv astryx1ghz6dp astryxc342km astryxng3xce astryxjbqb8w astryx1ypdohk astryxh6dtrn astryx1a2a7pz astryx1p25gnr astryx1y3gkto"},1:{className:"astryx78zum5 astryx6s0dn4 astryxl56j7k astryx1717udv astryx1ghz6dp astryxc342km astryxng3xce astryxjbqb8w astryxh6dtrn astryx1a2a7pz astryx1p25gnr astryx1y3gkto astryx1h6gzvc"}}[!!m<<0],children:n.jsx(P,{icon:"calendar",size:"sm",color:"secondary"})}),n.jsx("input",{ref:fa(Qe,le),id:Te,type:"text",role:"combobox",value:na,onChange:la,onBlur:oa,onClick:ia,onKeyDown:ua,placeholder:Ee,disabled:m,"aria-describedby":ta,"aria-required":D===!0?"true":void 0,"aria-invalid":o?.type==="error"||!de?"true":void 0,"aria-busy":j||void 0,"aria-expanded":u.isOpen,"aria-haspopup":"dialog","aria-controls":u.isOpen?u.id:void 0,"aria-autocomplete":"none",autoComplete:"off",...{0:{className:"astryx1lliihq astryx98rzlu astryxeuugli astryxc342km astryxng3xce astryx1717udv astryx9ynric astryxjm74w1 astryx6pjikd astryxw6l6zx astryx1tgivj0 astryxjbqb8w astryx1a2a7pz astryxeyghm5"},2:{className:"astryx1lliihq astryx98rzlu astryxeuugli astryxc342km astryxng3xce astryx1717udv astryx9ynric astryxjm74w1 astryx6pjikd astryxw6l6zx astryx1tgivj0 astryxjbqb8w astryx1a2a7pz astryxeyghm5 astryx1h6gzvc"},1:{className:"astryx1lliihq astryx98rzlu astryxeuugli astryxc342km astryxng3xce astryx1717udv astryx9ynric astryxjm74w1 astryx6pjikd astryxw6l6zx astryxjbqb8w astryx1a2a7pz astryxeyghm5 astryxv1l7n4"},3:{className:"astryx1lliihq astryx98rzlu astryxeuugli astryxc342km astryxng3xce astryx1717udv astryx9ynric astryxjm74w1 astryx6pjikd astryxw6l6zx astryxjbqb8w astryx1a2a7pz astryxeyghm5 astryx1h6gzvc astryxv1l7n4"}}[!!m<<1|!de<<0]}),n.jsx("span",{role:"alert","aria-live":"assertive",className:"astryx10l6tqk astryx1i1rx1s astryxjm9jq1 astryx1717udv astryxkdpibf astryxb3r6kr astryxzpqnlu astryxuxw1ft astryxc342km",children:de?"":"Invalid date"}),Fe&&I!==void 0&&!m&&n.jsx("button",{type:"button",onClick:ya,"aria-label":`Clear ${a}`,className:"astryx78zum5 astryx6s0dn4 astryxl56j7k astryx1717udv astryx1ghz6dp astryxc342km astryxng3xce astryxjbqb8w astryx1ypdohk astryxh6dtrn astryx1a2a7pz astryx1p25gnr astryx1y3gkto",children:n.jsx(P,{icon:"close",size:"sm",color:"secondary"})}),j&&n.jsx(va,{size:"sm"}),o&&n.jsx(P,{icon:ea[o.type],size:"md",color:aa[o.type]})]}),n.jsxs("div",{ref:Ce,onClick:ga,onMouseUp:xa,...ye(L.base,Ne[ie],fe.timeWrapper,m&&L.disabled,o&&Le[o.type],o&&Pe[o.type],o&&Re[o.type]),children:[n.jsx("div",{className:"astryx78zum5 astryx6s0dn4 astryxl56j7k astryx2lah0s",children:n.jsx(P,{icon:"clock",size:"sm",color:"secondary"})}),n.jsx("input",{ref:we,id:Je,type:"text",value:me,onChange:da,onFocus:ca,onBlur:ma,onKeyDown:pa,placeholder:ra,disabled:m,"aria-label":$e??`${a} time`,"aria-required":D===!0?"true":void 0,"aria-invalid":o?.type==="error"||!pe?"true":void 0,...{0:{className:"astryx1lliihq astryx98rzlu astryxeuugli astryxc342km astryxng3xce astryx1717udv astryx9ynric astryxjm74w1 astryx6pjikd astryxw6l6zx astryx1tgivj0 astryxjbqb8w astryx1a2a7pz astryxeyghm5"},2:{className:"astryx1lliihq astryx98rzlu astryxeuugli astryxc342km astryxng3xce astryx1717udv astryx9ynric astryxjm74w1 astryx6pjikd astryxw6l6zx astryx1tgivj0 astryxjbqb8w astryx1a2a7pz astryxeyghm5 astryx1h6gzvc"},1:{className:"astryx1lliihq astryx98rzlu astryxeuugli astryxc342km astryxng3xce astryx1717udv astryx9ynric astryxjm74w1 astryx6pjikd astryxw6l6zx astryxjbqb8w astryx1a2a7pz astryxeyghm5 astryxv1l7n4"},3:{className:"astryx1lliihq astryx98rzlu astryxeuugli astryxc342km astryxng3xce astryx1717udv astryx9ynric astryxjm74w1 astryx6pjikd astryxw6l6zx astryxjbqb8w astryx1a2a7pz astryxeyghm5 astryx1h6gzvc astryxv1l7n4"}}[!!m<<1|!pe<<0]}),n.jsx("span",{role:"alert","aria-live":"assertive",className:"astryx10l6tqk astryx1i1rx1s astryxjm9jq1 astryx1717udv astryxkdpibf astryxb3r6kr astryxzpqnlu astryxuxw1ft astryxc342km",children:pe?"":"Invalid time"})]})]}),u.render(n.jsx(Ia,{handleRef:ke,mode:"single",value:s.date,onChange:i=>z(i,"calendar"),min:Ve,max:ze,dateConstraints:Se,numberOfMonths:Ye}),{placement:"below",alignment:"start"})]})}l.displayName="DateTimeInput";l.__docgenInfo={description:`A combined date and time picker with side-by-side date input and
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
@default 1`,defaultValue:{value:"1",computed:!1}},xstyle:{required:!1,tsType:{name:"StyleXStyles"},description:"Style overrides applied to the outer row container."}},composes:["Omit"]};const Ba={title:"Core/DateTimeInput",component:l,tags:["autodocs"],argTypes:{label:{control:"text",description:"Label text (required)"},isLabelHidden:{control:"boolean",description:"Visually hide the label (still accessible to screen readers)"},placeholder:{control:"text",description:"Placeholder text"},description:{control:"text",description:"Description text displayed between the label and input"},isOptional:{control:"boolean",description:"Whether the field is optional (mutually exclusive with isRequired)"},isRequired:{control:"boolean",description:"Whether the field is required (mutually exclusive with isOptional)"},isDisabled:{control:"boolean",description:"Whether the input is disabled"},size:{control:"radio",options:["sm","md","lg"]},hourFormat:{control:"radio",options:["12h","24h"],description:"Hour format for display"},hasSeconds:{control:"boolean",description:"Whether to include seconds in the time"},hasClear:{control:"boolean",description:"Whether to show a clear button"},numberOfMonths:{control:"radio",options:[1,2],description:"Number of months to display in calendar"},timeIncrement:{control:"number",description:"Minutes to increment/decrement with arrow keys"}}},A={render:a=>{const[t,r]=e.useState(void 0);return n.jsx(l,{...a,value:t,onChange:r})},args:{label:"Meeting time",placeholder:"Select a date"}},F={render:a=>{const[t,r]=e.useState("2026-03-15T14:30");return n.jsx(l,{...a,value:t,onChange:r})},args:{label:"Event time"}},E={render:a=>{const[t,r]=e.useState("2026-03-15T14:30");return n.jsx(l,{...a,value:t,onChange:r})},args:{label:"Appointment",hourFormat:"24h"}},$={render:a=>{const[t,r]=e.useState("2026-03-15T14:30:45");return n.jsx(l,{...a,value:t,onChange:r})},args:{label:"Log timestamp",hasSeconds:!0}},H={render:a=>{const[t,r]=e.useState(void 0);return n.jsx(l,{...a,value:t,onChange:r})},args:{label:"Deadline",description:"When is this task due?",placeholder:"Select deadline"}},B={render:a=>{const[t,r]=e.useState("2026-03-15T09:00");return n.jsx(l,{...a,value:t,onChange:r})},args:{label:"Start time",hasClear:!0}},Y={render:a=>{const[t,r]=e.useState(void 0);return n.jsx(l,{...a,value:t,onChange:r})},args:{label:"Appointment",min:"2026-03-15T09:00",max:"2026-03-15T17:00",description:"Available: Mar 15, 9 AM - 5 PM"}},U={render:a=>{const[t,r]=e.useState("2026-03-15T09:00");return n.jsx(l,{...a,value:t,onChange:r})},args:{label:"Time slot",timeIncrement:15,description:"Use arrow keys to change by 15 minutes"}},K={render:a=>{const[t,r]=e.useState(void 0);return n.jsx(l,{...a,value:t,onChange:r})},args:{label:"Preferred time",isOptional:!0,placeholder:"Select a date (optional)"}},X={render:a=>{const[t,r]=e.useState(void 0);return n.jsx(l,{...a,value:t,onChange:r})},args:{label:"Start time",isRequired:!0}},Z={render:a=>{const[t,r]=e.useState("2026-03-15T10:00");return n.jsx(l,{...a,value:t,onChange:r})},args:{label:"Locked time",isDisabled:!0}},Q={render:()=>{const[a,t]=e.useState(void 0),[r,k]=e.useState(void 0),[D,w]=e.useState(void 0);return n.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"16px",maxWidth:"460px"},children:[n.jsx(l,{label:"Small (28px)",value:a,onChange:t,placeholder:"Small size",size:"sm"}),n.jsx(l,{label:"Medium (32px)",value:r,onChange:k,placeholder:"Medium size (default)",size:"md"}),n.jsx(l,{label:"Large (36px)",value:D,onChange:w,placeholder:"Large size",size:"lg"})]})}},G={render:a=>{const[t,r]=e.useState(void 0);return n.jsx(l,{...a,value:t,onChange:r})},args:{label:"Travel departure",numberOfMonths:2}},J={render:a=>{const[t,r]=e.useState("2026-03-15T14:30");return n.jsx(l,{...a,value:t,onChange:r})},args:{label:"Event time",status:{type:"error",message:"This time slot is not available"}}},ee={render:a=>{const[t,r]=e.useState("2026-03-15T07:00");return n.jsx(l,{...a,value:t,onChange:r})},args:{label:"Meeting time",status:{type:"warning",message:"Early morning meeting - are you sure?"}}},ae={render:a=>{const[t,r]=e.useState("2026-03-15T10:00");return n.jsx(l,{...a,value:t,onChange:r})},args:{label:"Scheduled time",status:{type:"success",message:"Time slot is available"}}},te={render:()=>{const[a,t]=e.useState(void 0),[r,k]=e.useState("2026-03-15T14:30"),[D,w]=e.useState("2026-03-15T14:30"),[I,q]=e.useState(void 0),[O,ne]=e.useState("2026-03-15T10:00"),[M,W]=e.useState("2026-03-15T22:00");return n.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"16px",maxWidth:"460px"},children:[n.jsx(l,{label:"Default",value:a,onChange:t,placeholder:"Select a date"}),n.jsx(l,{label:"With value (12h)",value:r,onChange:k}),n.jsx(l,{label:"24-hour format",value:D,onChange:w,hourFormat:"24h"}),n.jsx(l,{label:"With description",description:"Pick your preferred datetime",value:I,onChange:q}),n.jsx(l,{label:"Disabled",isDisabled:!0,value:O,onChange:ne}),n.jsx(l,{label:"With error",value:M,onChange:W,status:{type:"error",message:"Invalid datetime selection"}})]})}};A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<ISODateTimeString | undefined>(undefined);
    return <DateTimeInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Meeting time',
    placeholder: 'Select a date'
  }
}`,...A.parameters?.docs?.source}}};F.parameters={...F.parameters,docs:{...F.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<ISODateTimeString | undefined>('2026-03-15T14:30' as ISODateTimeString);
    return <DateTimeInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Event time'
  }
}`,...F.parameters?.docs?.source}}};E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<ISODateTimeString | undefined>('2026-03-15T14:30' as ISODateTimeString);
    return <DateTimeInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Appointment',
    hourFormat: '24h'
  }
}`,...E.parameters?.docs?.source}}};$.parameters={...$.parameters,docs:{...$.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<ISODateTimeString | undefined>('2026-03-15T14:30:45' as ISODateTimeString);
    return <DateTimeInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Log timestamp',
    hasSeconds: true
  }
}`,...$.parameters?.docs?.source}}};H.parameters={...H.parameters,docs:{...H.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<ISODateTimeString | undefined>(undefined);
    return <DateTimeInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Deadline',
    description: 'When is this task due?',
    placeholder: 'Select deadline'
  }
}`,...H.parameters?.docs?.source}}};B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
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
}`,...te.parameters?.docs?.source}}};const Ya=["Default","WithValue","TwentyFourHourFormat","WithSeconds","WithDescription","WithClearButton","WithMinMax","WithTimeIncrement","Optional","Required","Disabled","SizeVariants","TwoMonthCalendar","WithErrorStatus","WithWarningStatus","WithSuccessStatus","AllVariations"];export{te as AllVariations,A as Default,Z as Disabled,K as Optional,X as Required,Q as SizeVariants,E as TwentyFourHourFormat,G as TwoMonthCalendar,B as WithClearButton,H as WithDescription,J as WithErrorStatus,Y as WithMinMax,$ as WithSeconds,ae as WithSuccessStatus,U as WithTimeIncrement,F as WithValue,ee as WithWarningStatus,Ya as __namedExportsOrder,Ba as default};
