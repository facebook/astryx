const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./iframe-FpdBIrKz.js","./preload-helper-Ct5FWWRu.js","./iframe-C0je06NJ.css"])))=>i.map(i=>d[i]);
import{_ as V}from"./preload-helper-Ct5FWWRu.js";import{ah as c,a6 as z,ay as H,a1 as u,T as P,a7 as U}from"./iframe-FpdBIrKz.js";const k=c.lazy(async()=>V(()=>import("./iframe-FpdBIrKz.js").then(e=>e.j),__vite__mapDeps([0,1,2]),import.meta.url).then(e=>({default:e.Tooltip}))),p=60,f=3600,o=86400,y=30*o,h=365*o,Y=7*o,W=30;function Z(e){return typeof e=="number"?new Date(e<1e12?e*1e3:e):new Date(e)}function C(e,s){const a=Math.round((s.getTime()-e.getTime())/1e3);if(Math.abs(a)<10)return"now";if(a<0){const t=Math.abs(a);if(t<=W)return"now";if(t<p)return"in a few seconds";if(t<f){const n=Math.round(t/p);return`in ${n} ${n===1?"minute":"minutes"}`}if(t<o){const n=Math.round(t/f);return`in ${n} ${n===1?"hour":"hours"}`}if(t<y){const n=Math.round(t/o);return`in ${n} ${n===1?"day":"days"}`}if(t<h){const n=Math.round(t/y);return`in ${n} ${n===1?"month":"months"}`}const r=Math.round(t/h);return`in ${r} ${r===1?"year":"years"}`}if(a<p)return`${a} seconds ago`;if(a<f){const t=Math.round(a/p);return`${t} ${t===1?"minute":"minutes"} ago`}if(a<o){const t=Math.round(a/f);return`${t} ${t===1?"hour":"hours"} ago`}if(a<2*o)return"yesterday";if(a<y)return`${Math.round(a/o)} days ago`;if(a<h){const t=Math.round(a/y);return`${t} ${t===1?"month":"months"} ago`}const i=Math.round(a/h);return`${i} ${i===1?"year":"years"} ago`}function l(e){return String(e).padStart(2,"0")}function X(e,s,a){switch(s){case"date":return new Intl.DateTimeFormat(void 0,{year:"numeric",month:"short",day:"numeric"}).format(e);case"date_time":return new Intl.DateTimeFormat(void 0,{year:"numeric",month:"short",day:"numeric",hour:"numeric",minute:"2-digit",...a?{timeZoneName:"short"}:{}}).format(e);case"time":return new Intl.DateTimeFormat(void 0,{hour:"numeric",minute:"2-digit",...a?{timeZoneName:"short"}:{}}).format(e);case"system_date":{const i=e.getFullYear(),t=l(e.getMonth()+1),r=l(e.getDate());return`${i}-${t}-${r}`}case"system_date_time":{const i=e.getFullYear(),t=l(e.getMonth()+1),r=l(e.getDate()),n=l(e.getHours()),v=l(e.getMinutes()),g=l(e.getSeconds());return`${i}-${t}-${r} ${n}:${v}:${g}`}case"system_time":{const i=l(e.getHours()),t=l(e.getMinutes()),r=l(e.getSeconds());return`${i}:${t}:${r}`}}}function B(e){return new Intl.DateTimeFormat(void 0,{year:"numeric",month:"long",day:"numeric",hour:"numeric",minute:"2-digit",second:"2-digit",timeZoneName:"short"}).format(e)}function K(e){const s=Math.abs(e);return s<p?1e3:s<f?3e4:s<o?6e4:3e5}function G(e){return e!=="relative"&&e!=="auto"}function $({value:e,format:s="auto",autoThreshold:a=Y,hasTooltip:i=!0,isTimezoneShown:t=!1,isLive:r=!1,type:n="supporting",size:v,color:g="secondary",weight:M,xstyle:S,className:D,style:R,ref:E,"data-testid":q}){const x=c.useRef(null),[_,I]=c.useState(()=>new Date),d=Z(e),F=d.toISOString(),T=Math.round((_.getTime()-d.getTime())/1e3),m=s==="auto"?Math.abs(T)<=a?"relative":"date_time":s,A=m==="relative"?C(d,_):G(m)?X(d,m,t):"",b=B(d);c.useEffect(()=>{if(!r||m!=="relative")return;const N=K(T),L=setInterval(()=>{I(new Date)},N);return()=>clearInterval(L)},[r,m,T]);const O=i&&m==="relative",j=z(H("timestamp",{format:m}),{className:D,style:R}),w=u.jsx(P,{type:n,size:v,color:g,weight:M,xstyle:S,...j,children:u.jsx("time",{ref:U(E,x),dateTime:F,"aria-label":m==="relative"?b:void 0,"data-testid":q,className:"astryxt0psk2 astryxjb2p0i astryx1j61x8r astryx1qlqyl8 astryx15bjb6t astryx1heor9g astryx1pd3egz",children:A})});return O?u.jsxs(u.Fragment,{children:[w,u.jsx(c.Suspense,{fallback:null,children:u.jsx(k,{anchorRef:x,content:b,placement:"above"})})]}):w}$.displayName="Timestamp";$.__docgenInfo={description:`Displays a formatted timestamp as human-readable text.

Renders a semantic \`<time>\` element with an ISO 8601 \`datetime\` attribute,
styled via Text. Supports relative ("2 hours ago"), multiple absolute
formats, and auto formatting. Optionally shows a tooltip with the full
absolute time and can update live.

@example
\`\`\`
<Timestamp value="2026-02-19T17:00:00Z" />
<Timestamp value={1740000000} format="date" />
<Timestamp value={date} format="auto" isLive />
<Timestamp value={event.timestamp} format="system_date_time" />
\`\`\``,methods:[],displayName:"Timestamp",props:{xstyle:{required:!1,tsType:{name:"StyleXStyles"},description:"StyleX styles created via `stylex.create()`. Merged with the component's\nbase styles inside a single `stylex.props()` call for optimal deduplication.\n\n@example\n```\nconst overrides = stylex.create({ root: { marginBottom: 8 } });\n<Component xstyle={overrides.root} />\n```"},ref:{required:!1,tsType:{name:"ReactRef",raw:"React.Ref<HTMLTimeElement>",elements:[{name:"HTMLTimeElement"}]},description:"Ref forwarded to the root `<time>` element."},value:{required:!0,tsType:{name:"union",raw:"string | number",elements:[{name:"string"},{name:"number"}]},description:"The date/time to display. Accepts Unix timestamps (seconds) or ISO 8601 strings."},format:{required:!1,tsType:{name:"union",raw:`| 'relative'
| 'auto'
| 'date'
| 'date_time'
| 'time'
| 'system_date'
| 'system_date_time'
| 'system_time'`,elements:[{name:"literal",value:"'relative'"},{name:"literal",value:"'auto'"},{name:"literal",value:"'date'"},{name:"literal",value:"'date_time'"},{name:"literal",value:"'time'"},{name:"literal",value:"'system_date'"},{name:"literal",value:"'system_date_time'"},{name:"literal",value:"'system_time'"}]},description:`Display format.
- \`'relative'\`: "2 hours ago", "yesterday", "now"
- \`'auto'\`: Relative for recent times, \`date_time\` for older
- \`'date'\`: "Mar 21, 2025"
- \`'date_time'\`: "Mar 21, 2025, 2:51 PM"
- \`'time'\`: "2:51 PM"
- \`'system_date'\`: "2025-03-21"
- \`'system_date_time'\`: "2025-03-21 14:51:53"
- \`'system_time'\`: "14:51:53"
@default 'auto'`,defaultValue:{value:"'auto'",computed:!1}},autoThreshold:{required:!1,tsType:{name:"number"},description:`Threshold in seconds for 'auto' format to switch from relative to date_time.
@default 604800 (7 days)`,defaultValue:{value:"7 * DAY",computed:!1}},hasTooltip:{required:!1,tsType:{name:"boolean"},description:`Whether to show a tooltip with the full date/time on hover.
@default true`,defaultValue:{value:"true",computed:!1}},isTimezoneShown:{required:!1,tsType:{name:"boolean"},description:`Whether to append the timezone abbreviation after the timestamp.
Applies to date_time, time, system_date_time, and system_time formats.
@default false`,defaultValue:{value:"false",computed:!1}},isLive:{required:!1,tsType:{name:"boolean"},description:`Whether the relative time should update live.
@default false`,defaultValue:{value:"false",computed:!1}},type:{required:!1,tsType:{name:"union",raw:"BuiltinTextType | (keyof CustomTextTypes & string)",elements:[{name:"union",raw:`| 'body'
| 'large'
| 'label'
| 'supporting'
| 'code'
| 'display-1'
| 'display-2'
| 'display-3'
| 'inherit'`,elements:[{name:"literal",value:"'body'"},{name:"literal",value:"'large'"},{name:"literal",value:"'label'"},{name:"literal",value:"'supporting'"},{name:"literal",value:"'code'"},{name:"literal",value:"'display-1'"},{name:"literal",value:"'display-2'"},{name:"literal",value:"'display-3'"},{name:"literal",value:"'inherit'"}]},{name:"unknown"}]},description:`Semantic text type. Determines size, weight, and line-height from theme.
@default 'supporting'`,defaultValue:{value:"'supporting'",computed:!1}},size:{required:!1,tsType:{name:"union",raw:`| '4xs'
| '3xs'
| '2xs'
| 'xsm'
| 'sm'
| 'base'
| 'lg'
| 'xl'
| '2xl'
| '3xl'
| '4xl'`,elements:[{name:"literal",value:"'4xs'"},{name:"literal",value:"'3xs'"},{name:"literal",value:"'2xs'"},{name:"literal",value:"'xsm'"},{name:"literal",value:"'sm'"},{name:"literal",value:"'base'"},{name:"literal",value:"'lg'"},{name:"literal",value:"'xl'"},{name:"literal",value:"'2xl'"},{name:"literal",value:"'3xl'"},{name:"literal",value:"'4xl'"}]},description:"Explicit font size override. Overrides the size from `type`."},color:{required:!1,tsType:{name:"union",raw:`| 'primary'
| 'secondary'
| 'disabled'
| 'placeholder'
| 'accent'
| 'inherit'`,elements:[{name:"literal",value:"'primary'"},{name:"literal",value:"'secondary'"},{name:"literal",value:"'disabled'"},{name:"literal",value:"'placeholder'"},{name:"literal",value:"'accent'"},{name:"literal",value:"'inherit'"}]},description:`Text color.
@default 'secondary'`,defaultValue:{value:"'secondary'",computed:!1}},weight:{required:!1,tsType:{name:"union",raw:"'normal' | 'medium' | 'semibold' | 'bold'",elements:[{name:"literal",value:"'normal'"},{name:"literal",value:"'medium'"},{name:"literal",value:"'semibold'"},{name:"literal",value:"'bold'"}]},description:"Font weight override."},"data-testid":{required:!1,tsType:{name:"string"},description:"Test ID for testing frameworks."}},composes:["Omit"]};export{$ as T};
