const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./TimestampHoverCard-RxkpfNy0.js","./rolldown-runtime-DkW27tQK.js","./react-BZJXY1be.js","./stylex-Dft6gtPK.js","./themeProps-CREkzZh6.js","./naming-DuIRtD9i.js","./jsx-runtime-DeHZSEgm.js","./useTranslator-BMnme3me.js","./devWarning-DiDrVodI.js","./Icon-C24cO4CC.js","./mergeProps-JRyAvMxc.js","./useTheme-CAaDofyu.js","./Theme-os0aoGDw.js","./useIsomorphicLayoutEffect-vnms8l8s.js","./color-B2pZ48oy.js","./tokens.stylex-C15xwlpu.js","./tokens-BV2W1Z2y.js","./useMediaQuery-CwCr2urF.js","./globalIconRegistry-C_KXaW8k.js","./defaultIcons-VuzmzO9M.js","./useAnnounce-DW4eqOGv.js","./IconButton-CAN7iEx1.js","./Button-BVMvoKVE.js","./mergeRefs-CPqjs56a.js","./useTooltip-Cm0gpSWG.js","./useLayer-EhGBKttH.js","./layerAnimations.stylex-18OH5AHk.js","./Spinner-CzifdOpC.js","./Text-BfjtEFtP.js","./preload-helper-wdlQj8DP.js","./VisuallyHidden-Z2NjNH-_.js","./SizeContext-Dp2usO2O.js","./useLinkComponent-DvgS1IvL.js","./HoverCard-J_-YySm1.js"])))=>i.map(i=>d[i]);
import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{n as t,t as n}from"./preload-helper-wdlQj8DP.js";import{t as r}from"./react-BZJXY1be.js";import{l as i,o as a,u as o}from"./plainDate-DXbeuWIy.js";import{n as s}from"./mergeProps-JRyAvMxc.js";import{n as c}from"./mergeRefs-CPqjs56a.js";import{n as l,t as u}from"./themeProps-CREkzZh6.js";import{n as d,t as f}from"./Text-BfjtEFtP.js";import{r as p}from"./devWarning-DiDrVodI.js";import{t as m}from"./jsx-runtime-DeHZSEgm.js";import{n as h,t as g}from"./useTranslator-BMnme3me.js";import{n as _,t as v}from"./useDevWarning-Cdyb6i-B.js";function y(e){return String(e).padStart(2,`0`)}function b(e,t){return t===void 0?{year:e.getFullYear(),month:e.getMonth()+1,day:e.getDate(),hour:e.getHours(),minute:e.getMinutes(),second:e.getSeconds()}:i(e.getTime(),t)}function x(e,t,{timeZone:n,isTimezoneShown:r=!1}={}){let i=n===void 0?{}:{timeZone:n},o=r?{timeZoneName:`short`}:{};switch(t){case`full`:return new Intl.DateTimeFormat(void 0,{...S,...i}).format(e);case`date`:return new Intl.DateTimeFormat(void 0,{...a.date,...i}).format(e);case`date_long`:return new Intl.DateTimeFormat(void 0,{...a.date_long,...i}).format(e);case`date_weekday`:return new Intl.DateTimeFormat(void 0,{...a.date_weekday,...i}).format(e);case`date_time`:return new Intl.DateTimeFormat(void 0,{...w,...o,...i}).format(e);case`time`:return new Intl.DateTimeFormat(void 0,{...C,...o,...i}).format(e);case`system_date`:{let t=b(e,n);return`${t.year}-${y(t.month)}-${y(t.day)}`}case`system_date_time`:{let t=b(e,n);return`${t.year}-${y(t.month)}-${y(t.day)} ${y(t.hour)}:${y(t.minute)}:${y(t.second)}`}case`system_time`:{let t=b(e,n);return`${y(t.hour)}:${y(t.minute)}:${y(t.second)}`}case`unix_seconds`:return String(Math.floor(e.getTime()/1e3))}}var S,C,w;function T(){return(T=e((()=>{o(),S={year:`numeric`,month:`long`,day:`numeric`,hour:`numeric`,minute:`2-digit`,second:`2-digit`,timeZoneName:`short`},C={hour:`numeric`,minute:`2-digit`},w={year:`numeric`,month:`short`,day:`numeric`,...C}})))()}function E(e){if(e!==void 0&&e.toLowerCase()!==A){try{new Intl.DateTimeFormat(void 0,{timeZone:e})}catch{j.has(e)||(j.add(e),`${JSON.stringify(e)}`);return}return e}}function D(e){return e===void 0?A:e.toLowerCase()}function O(e,t,n){return e===`full`?!0:e===`date_time`||e===`time`?t||n:!1}function k(e,t){let n=t.map(e=>E(e.timezoneID)),r=new Set(n.map(D)).size>1;return t.map((t,i)=>{let a=t.format??`full`,o=n[i];return{...t.label===void 0?{}:{label:t.label},isCopyable:t.isCopyable??!1,value:x(e,a,{timeZone:o,isTimezoneShown:O(a,r,o!==void 0)})}})}var A,j;function M(){return(M=e((()=>{p(),T(),A=`local`,j=new Set})))()}function N(e){return typeof e==`number`?new Date(e<0xe8d4a51000?e*1e3:e):new Date(e)}function P(e,t){let n=Math.round((t.getTime()-e.getTime())/1e3);if(Math.abs(n)<10)return`now`;if(n<0){let e=Math.abs(n);if(e<=Y)return`now`;if(e<U)return`in a few seconds`;if(e<W){let t=Math.floor(e/U);return`in ${t} ${t===1?`minute`:`minutes`}`}if(e<G){let t=Math.floor(e/W);return`in ${t} ${t===1?`hour`:`hours`}`}if(e<K){let t=Math.floor(e/G);return`in ${t} ${t===1?`day`:`days`}`}if(e<q){let t=Math.floor(e/K);return`in ${t} ${t===1?`month`:`months`}`}let t=Math.floor(e/q);return`in ${t} ${t===1?`year`:`years`}`}if(n<U)return`${n} seconds ago`;if(n<W){let e=Math.floor(n/U);return`${e} ${e===1?`minute`:`minutes`} ago`}if(n<G){let e=Math.floor(n/W);return`${e} ${e===1?`hour`:`hours`} ago`}if(n<2*G)return`yesterday`;if(n<K)return`${Math.floor(n/G)} days ago`;if(n<q){let e=Math.floor(n/K);return`${e} ${e===1?`month`:`months`} ago`}let r=Math.floor(n/q);return`${r} ${r===1?`year`:`years`} ago`}function F(e,t){let n=Math.round((t.getTime()-e.getTime())/1e3);if(Math.abs(n)<10)return`now`;if(n<0){let e=Math.abs(n);return e<=Y?`now`:e<U?`in ${e}s`:e<W?`in ${Math.floor(e/U)}m`:e<G?`in ${Math.floor(e/W)}h`:e<K?`in ${Math.floor(e/G)}d`:e<q?`in ${Math.floor(e/K)}mo`:`in ${Math.floor(e/q)}y`}return n<U?`${n}s ago`:n<W?`${Math.floor(n/U)}m ago`:n<G?`${Math.floor(n/W)}h ago`:n<K?`${Math.floor(n/G)}d ago`:n<q?`${Math.floor(n/K)}mo ago`:`${Math.floor(n/q)}y ago`}function I(e){let t=Math.abs(e);return t<U?1e3:t<W?3e4:t<G?6e4:3e5}function L(e){return e!==`relative`&&e!==`relative_short`&&e!==`auto`}function R(e){return e===`relative`||e===`relative_short`}function z({value:e,format:t=`auto`,autoThreshold:n=J,hasTooltip:r=!0,tooltipEntries:i,isTimezoneShown:a=!1,isLive:o=!1,type:u=`supporting`,size:d,color:p=`secondary`,weight:m,xstyle:g,className:v,style:y,ref:b,"data-testid":S}){let C=h(),w=(0,B.useRef)(null),[T,E]=(0,B.useState)(()=>new Date),D=N(e),O=!Number.isNaN(D.getTime()),A=O?D.toISOString():``,j=Math.round((T.getTime()-D.getTime())/1e3),M=t===`auto`?Math.abs(j)<=n?`relative`:`date_time`:t,z=O?M===`relative`?P(D,T):M===`relative_short`?F(D,T):L(M)?x(D,M,{isTimezoneShown:a}):``:``,U=O?x(D,`full`):``;if((0,B.useEffect)(()=>{if(!o||!O||!R(M))return;let e=I(j),t=setInterval(()=>{E(new Date)},e);return()=>clearInterval(t)},[o,O,M,j]),_(`Timestamp`,`could not parse value ${JSON.stringify(e)} as a date. Rendering nothing.`,!O),!O)return null;let W=i!==void 0&&i.length>0?i:void 0,G=r&&(R(M)||W!==void 0),K=W===void 0?[{value:U,isCopyable:!0}]:k(D,W),q=s(l(`timestamp`,{format:M}),{className:v,style:y}),Y=(0,V.jsx)(f,{type:u,size:d,color:p,weight:m,xstyle:g,...q,children:(0,V.jsx)(`time`,{ref:c(b,w),dateTime:A,"aria-label":R(M)?U:void 0,tabIndex:G?0:void 0,"data-testid":S,className:`astryxt0psk2 astryxjb2p0i astryx1j61x8r astryx1qlqyl8 astryx15bjb6t astryx1heor9g astryx1pd3egz`,children:z})});return G?(0,V.jsx)(B.Suspense,{fallback:Y,children:(0,V.jsx)(H,{lines:K,label:C(`@astryx.timestamp.detailsLabel`),children:Y})}):Y}var B,V,H,U,W,G,K,q,J,Y;function X(){return(X=e((()=>{B=r(),d(),v(),g(),u(),T(),M(),V=m(),t(),H=(0,B.lazy)(async()=>n(()=>import(`./TimestampHoverCard-RxkpfNy0.js`),__vite__mapDeps([0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33]),import.meta.url)),U=60,W=3600,G=86400,K=30*G,q=365*G,J=7*G,Y=30,z.displayName=`Timestamp`,z.__docgenInfo={description:`Displays a formatted timestamp as human-readable text.

Renders a semantic \`<time>\` element with an ISO 8601 \`datetime\` attribute,
styled via Text. Supports relative ("2 hours ago"), multiple absolute
formats, and auto formatting. Optionally shows a hover card with the full
absolute time (copyable) and can update live.

@example
\`\`\`
<Timestamp value="2026-02-19T17:00:00Z" />
<Timestamp value={1740000000} format="date" />
<Timestamp value={date} format="auto" isLive />
<Timestamp value={event.timestamp} format="system_date_time" />
\`\`\``,methods:[],displayName:`Timestamp`,props:{xstyle:{required:!1,tsType:{name:`StyleXStyles`},description:"StyleX styles created via `stylex.create()`. Merged with the component's\nbase styles inside a single `stylex.props()` call for optimal deduplication.\n\n@example\n```\nconst overrides = stylex.create({ root: { marginBottom: 8 } });\n<Component xstyle={overrides.root} />\n```"},ref:{required:!1,tsType:{name:`ReactRef`,raw:`React.Ref<HTMLTimeElement>`,elements:[{name:`HTMLTimeElement`}]},description:"Ref forwarded to the root `<time>` element."},value:{required:!0,tsType:{name:`union`,raw:`string | number`,elements:[{name:`string`},{name:`number`}]},description:`The date/time to display. Accepts Unix timestamps (seconds) or ISO 8601 strings.`},format:{required:!1,tsType:{name:`union`,raw:`| 'relative'
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
| 'unix_seconds'`,elements:[{name:`literal`,value:`'relative'`},{name:`literal`,value:`'relative_short'`},{name:`literal`,value:`'auto'`},{name:`literal`,value:`'date'`},{name:`literal`,value:`'date_long'`},{name:`literal`,value:`'date_weekday'`},{name:`literal`,value:`'date_time'`},{name:`literal`,value:`'time'`},{name:`literal`,value:`'system_date'`},{name:`literal`,value:`'system_date_time'`},{name:`literal`,value:`'system_time'`},{name:`literal`,value:`'unix_seconds'`}]},description:`Display format.
- \`'relative'\`: "2 hours ago", "yesterday", "now"
- \`'relative_short'\`: "2h ago", "1d ago", "now" — the same tiers as
  \`'relative'\` with abbreviated units (s/m/h/d/mo/y), for compact,
  space-constrained surfaces
- \`'auto'\`: Relative for recent times, \`date_time\` for older
- \`'date'\`: "Mar 21, 2025"
- \`'date_long'\`: "March 21, 2025"
- \`'date_weekday'\`: "Wed, Mar 21, 2025"
- \`'date_time'\`: "Mar 21, 2025, 2:51 PM"
- \`'time'\`: "2:51 PM"
- \`'system_date'\`: "2025-03-21"
- \`'system_date_time'\`: "2025-03-21 14:51:53"
- \`'system_time'\`: "14:51:53"
- \`'unix_seconds'\`: "1742565113" — Unix time in whole seconds since the
  epoch. Absolute (zone-independent), so it ignores any tooltip time zone.
@default 'auto'`,defaultValue:{value:`'auto'`,computed:!1}},autoThreshold:{required:!1,tsType:{name:`number`},description:`Threshold in seconds for 'auto' format to switch from relative to date_time.
@default 604800 (7 days)`,defaultValue:{value:`7 * DAY`,computed:!1}},hasTooltip:{required:!1,tsType:{name:`boolean`},description:`Whether to show a hover card with the full date/time on hover. The card
is copyable — its default single row carries the full absolute time — and
\`tooltipEntries\` customizes its rows.
@default true`,defaultValue:{value:`true`,computed:!1}},tooltipEntries:{required:!1,tsType:{name:`ReadonlyArray`,elements:[{name:`TimestampTooltipEntry`}],raw:`ReadonlyArray<TimestampTooltipEntry>`},description:`Lines to show on hover, so one instant can be read — and optionally
copied — in several time zones and/or formats at once. Each entry is one
line, rendered in the order given, with an optional label.

Rows are read-only unless they set \`isCopyable\` (default \`false\`). A
copyable row shows a copy button in a dedicated trailing action column so
the buttons align across rows; that column is only present when some row
is copyable. With no entries the card shows a single default row with the
full absolute time in the viewer's own zone, which is copyable.

Configuring entries also attaches the surface to absolute formats, which
otherwise have no hover card at all. \`hasTooltip={false}\` still suppresses
it, and an empty array is treated as no configuration.

@default undefined — a single default row with the full absolute time in
  the viewer's own time zone
@example
\`\`\`
<Timestamp
  value={savedAt}
  tooltipEntries={[
    {label: 'Your time'},
    {timezoneID: 'UTC', label: 'UTC'},
    {timezoneID: 'UTC', format: 'system_date_time', label: 'ISO', isCopyable: true},
  ]}
/>
\`\`\``},isTimezoneShown:{required:!1,tsType:{name:`boolean`},description:`Whether to append the timezone abbreviation after the timestamp text.
Applies to the date_time and time formats. The system_* formats stay
machine-readable and never carry a timezone abbreviation.

Affects the visible text only — use \`tooltipEntries\` to control the
tooltip's time zones.
@default false`,defaultValue:{value:`false`,computed:!1}},isLive:{required:!1,tsType:{name:`boolean`},description:`Whether the relative time should update live.
@default false`,defaultValue:{value:`false`,computed:!1}},type:{required:!1,tsType:{name:`union`,raw:`BuiltinTextType | (keyof CustomTextTypes & string)`,elements:[{name:`union`,raw:`| 'body'
| 'large'
| 'label'
| 'supporting'
| 'code'
| 'display-1'
| 'display-2'
| 'display-3'
| 'inherit'`,elements:[{name:`literal`,value:`'body'`},{name:`literal`,value:`'large'`},{name:`literal`,value:`'label'`},{name:`literal`,value:`'supporting'`},{name:`literal`,value:`'code'`},{name:`literal`,value:`'display-1'`},{name:`literal`,value:`'display-2'`},{name:`literal`,value:`'display-3'`},{name:`literal`,value:`'inherit'`}]},{name:`unknown`}]},description:`Semantic text type. Determines size, weight, and line-height from theme.
@default 'supporting'`,defaultValue:{value:`'supporting'`,computed:!1}},size:{required:!1,tsType:{name:`union`,raw:`| '4xs'
| '3xs'
| '2xs'
| 'xsm'
| 'sm'
| 'base'
| 'lg'
| 'xl'
| '2xl'
| '3xl'
| '4xl'`,elements:[{name:`literal`,value:`'4xs'`},{name:`literal`,value:`'3xs'`},{name:`literal`,value:`'2xs'`},{name:`literal`,value:`'xsm'`},{name:`literal`,value:`'sm'`},{name:`literal`,value:`'base'`},{name:`literal`,value:`'lg'`},{name:`literal`,value:`'xl'`},{name:`literal`,value:`'2xl'`},{name:`literal`,value:`'3xl'`},{name:`literal`,value:`'4xl'`}]},description:"Explicit font size override. Overrides the size from `type`."},color:{required:!1,tsType:{name:`TextColorMap`},description:`Text color.
@default 'secondary'`,defaultValue:{value:`'secondary'`,computed:!1}},weight:{required:!1,tsType:{name:`union`,raw:`'normal' | 'medium' | 'semibold' | 'bold'`,elements:[{name:`literal`,value:`'normal'`},{name:`literal`,value:`'medium'`},{name:`literal`,value:`'semibold'`},{name:`literal`,value:`'bold'`}]},description:`Font weight override.`},"data-testid":{required:!1,tsType:{name:`string`},description:`Test ID for testing frameworks.`}},composes:[`Omit`]}})))()}export{X as n,z as t};