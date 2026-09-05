const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./Tooltip-Dn3usmFn.js","./preload-helper-CT_b8DTk.js","./react-B7Te67-h.js","./jsx-runtime-DqZldVDK.js","./useTooltip-DAlyoPtn.js","./ime-Dy4QRKoo.js","./padding.stylex-Hr1weLfK.js","./react-dom-Ctsxo5CR.js","./useIsomorphicLayoutEffect-AEBSTB0m.js"])))=>i.map(i=>d[i]);
import{i as e,n as t,s as n,t as r}from"./preload-helper-CT_b8DTk.js";import{t as i}from"./react-B7Te67-h.js";import{D as a,E as o,F as s,P as c}from"./ime-Dy4QRKoo.js";import{P as l,t as u}from"./utils-eYNPhPe_.js";import{t as d}from"./jsx-runtime-DqZldVDK.js";import{_ as f,a as p,c as m,d as h,f as g,g as _,h as v,i as y,l as b,m as x,n as S,o as C,p as w,r as T,s as E,u as D,v as O,y as k}from"./Text-ydqoaB2w.js";import{n as A,t as j}from"./useMergedRefs-BMVAJ2uJ.js";function M(e){return e===`display-1`||e===`display-2`||e===`display-3`}function N({level:e,type:t,weight:n,accessibilityLevel:r,color:i=`primary`,display:o=`block`,maxLines:c=0,hasTruncateTooltip:u=!0,wordBreak:d,textWrap:h,justify:y=`start`,hasCapsize:S=!1,hasStrikethrough:j=!1,xstyle:N,className:R,style:z,children:B,ref:V,...H}){let U=L[e],W=r&&r!==e?{"aria-level":r}:{},G=d??(c===1?`break-all`:`break-word`),K=c>0||S?`block`:o,q=t&&M(t)?t:void 0,J=p({maxLines:c}),Y=typeof u==`string`?u:`above`,X=c>0&&u!==!1&&J.isTruncated,Z=(0,P.useRef)(null),Q=A(V,J.ref,Z),$=c>1?{WebkitLineClamp:c}:void 0;return(0,F.jsxs)(F.Fragment,{children:[(0,F.jsx)(U,{ref:Q,...l(a(`heading`,{level:e,color:i,type:t,weight:n}),s(E[T(i)],q?x[q]:w[e],q&&b[q],n&&O[n],c===1?_.singleLine:c>1?_.multiLine:D[K],c>0&&k[G],h&&v[h],y!==`start`&&g[y],S&&C.enabled,j&&m.strikethrough,N),R,{...z,...$}),...W,...H,children:B}),X&&(0,F.jsx)(P.Suspense,{fallback:null,children:(0,F.jsx)(I,{anchorRef:Z,content:(0,F.jsx)(`span`,{...s(f.content),children:J.fullText}),placement:Y})})]})}var P,F,I,L,R=e((()=>{P=n(i(),1),c(),h(),y(),S(),u(),j(),o(),F=d(),t(),I=(0,P.lazy)(async()=>r(()=>import(`./Tooltip-Dn3usmFn.js`).then(e=>(e.r(),e.n)).then(e=>({default:e.Tooltip})),__vite__mapDeps([0,1,2,3,4,5,6,7,8]),import.meta.url)),L={1:`h1`,2:`h2`,3:`h3`,4:`h4`,5:`h5`,6:`h6`},N.displayName=`Heading`,N.__docgenInfo={description:`Heading - Semantic heading component

Renders headings with semantic HTML (h1-h6) and themed styling.

@example
\`\`\`
<Heading level={1}>Page Title</Heading>
<Heading level={2}>Section</Heading>
<Heading level={2} accessibilityLevel={3}>Sidebar Section</Heading>
<Heading level={1} type="display-1">Hero Title</Heading>
<Heading level={2} type="display-2">$1.2M Revenue</Heading>
<Heading level={2} maxLines={1}>Very Long Section Title...</Heading>
<Heading level={3} color="secondary">Muted Heading</Heading>
\`\`\``,methods:[],displayName:`Heading`,props:{ref:{required:!1,tsType:{name:`ReactRef`,raw:`React.Ref<HTMLHeadingElement>`,elements:[{name:`HTMLHeadingElement`}]},description:`Ref forwarded to the root element`},level:{required:!0,tsType:{name:`union`,raw:`1 | 2 | 3 | 4 | 5 | 6`,elements:[{name:`literal`,value:`1`},{name:`literal`,value:`2`},{name:`literal`,value:`3`},{name:`literal`,value:`4`},{name:`literal`,value:`5`},{name:`literal`,value:`6`}]},description:"Heading level (1-6). Determines the semantic HTML element (h1–h6).\nAlso determines visual styling unless `type` is set."},type:{required:!1,tsType:{name:`HeadingTypeMap`},description:`Display type variant. When set, overrides the visual styling from \`level\`
with display-scale sizing (larger, lighter weight, tighter line-height).
The \`level\` still determines the HTML element for accessibility.

Use for hero banners, marketing headlines, and data callouts that need
heading semantics.

@example
\`\`\`
<Heading level={1} type="display-1">Hero Title</Heading>
<Heading level={2} type="display-2">$1.2M Revenue</Heading>
\`\`\``},weight:{required:!1,tsType:{name:`union`,raw:`'normal' | 'medium' | 'semibold' | 'bold'`,elements:[{name:`literal`,value:`'normal'`},{name:`literal`,value:`'medium'`},{name:`literal`,value:`'semibold'`},{name:`literal`,value:`'bold'`}]},description:`Explicit font-weight override. The active theme controls the numeric value
behind each name. When omitted, the selected visual type or heading level
supplies the default.`},accessibilityLevel:{required:!1,tsType:{name:`union`,raw:`1 | 2 | 3 | 4 | 5 | 6`,elements:[{name:`literal`,value:`1`},{name:`literal`,value:`2`},{name:`literal`,value:`3`},{name:`literal`,value:`4`},{name:`literal`,value:`5`},{name:`literal`,value:`6`}]},description:"Accessibility level override. When set, the `aria-level` will differ\nfrom the visual `level`. Use this when the visual hierarchy doesn't\nmatch the document outline (e.g., sidebar headings, reused components).\n\n@default Same as `level`\n\n@example\n```\n<Heading level={2} accessibilityLevel={3}>Sidebar Section</Heading>\n```"},color:{required:!1,tsType:{name:`TextColorMap`},description:`Text color.
@default 'primary'`,defaultValue:{value:`'primary'`,computed:!1}},display:{required:!1,tsType:{name:`union`,raw:`'inline' | 'block'`,elements:[{name:`literal`,value:`'inline'`},{name:`literal`,value:`'block'`}]},description:`Display type. Headings default to block.
Note: Silently overridden to 'block' when maxLines > 0 or hasCapsize is true.
@default 'block'`,defaultValue:{value:`'block'`,computed:!1}},maxLines:{required:!1,tsType:{name:`number`},description:`Maximum lines before truncation. 0 = no truncation.
When set, shows tooltip on hover if content is truncated.
@default 0`,defaultValue:{value:`0`,computed:!1}},hasTruncateTooltip:{required:!1,tsType:{name:`union`,raw:`boolean | LayerPlacement`,elements:[{name:`boolean`},{name:`union`,raw:`'above' | 'below' | 'start' | 'end'`,elements:[{name:`literal`,value:`'above'`},{name:`literal`,value:`'below'`},{name:`literal`,value:`'start'`},{name:`literal`,value:`'end'`}]}]},description:`Control tooltip behavior for truncated text.
- \`true\` (default when maxLines > 0): show tooltip at default position
- \`false\`: disable tooltip
- Position value: show tooltip at specific position
@default true`,defaultValue:{value:`true`,computed:!1}},wordBreak:{required:!1,tsType:{name:`union`,raw:`'break-word' | 'break-all'`,elements:[{name:`literal`,value:`'break-word'`},{name:`literal`,value:`'break-all'`}]},description:`Word break behavior for truncated text.
@default 'break-all' for maxLines=1, 'break-word' otherwise`},textWrap:{required:!1,tsType:{name:`union`,raw:`'wrap' | 'nowrap' | 'balance' | 'pretty'`,elements:[{name:`literal`,value:`'wrap'`},{name:`literal`,value:`'nowrap'`},{name:`literal`,value:`'balance'`},{name:`literal`,value:`'pretty'`}]},description:`Text wrapping behavior.`},justify:{required:!1,tsType:{name:`union`,raw:`'start' | 'center' | 'end'`,elements:[{name:`literal`,value:`'start'`},{name:`literal`,value:`'center'`},{name:`literal`,value:`'end'`}]},description:`Text alignment (justification). Uses logical values (start/end)
for i18n/RTL compatibility.
@default 'start'`,defaultValue:{value:`'start'`,computed:!1}},hasCapsize:{required:!1,tsType:{name:`boolean`},description:`Enable optical alignment (text-box-trim).
Forces block display.
@default false`,defaultValue:{value:`false`,computed:!1}},hasStrikethrough:{required:!1,tsType:{name:`boolean`},description:`Strikethrough decoration.
@default false`,defaultValue:{value:`false`,computed:!1}},children:{required:!0,tsType:{name:`ReactNode`},description:`Heading content`}},composes:[`Omit`]}}));export{R as n,N as t};