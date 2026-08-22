const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./Tooltip-DL8KITNv.js","./preload-helper-CT_b8DTk.js","./react-B7Te67-h.js","./jsx-runtime-DqZldVDK.js","./useTooltip-CJLCgfcI.js","./ime-Dy4QRKoo.js","./layerAnimations.stylex-CjZNIp54.js","./padding.stylex-Hr1weLfK.js","./react-dom-Ctsxo5CR.js","./useIsomorphicLayoutEffect-AEBSTB0m.js"])))=>i.map(i=>d[i]);
import{i as e,n as t,s as n,t as r}from"./preload-helper-CT_b8DTk.js";import{t as i}from"./react-B7Te67-h.js";import{D as a,E as o,F as s,P as c}from"./ime-Dy4QRKoo.js";import{F as l,N as u,t as d}from"./utils-B-CsSvIl.js";import{t as f}from"./jsx-runtime-DqZldVDK.js";import{_ as p,a as m,c as h,d as g,f as _,g as v,h as y,i as b,l as x,m as S,n as C,o as w,p as T,r as E,s as D,u as O,v as k}from"./Text-BQWwoR0k.js";function A({level:e,type:t,accessibilityLevel:n,color:r=`primary`,display:i=`block`,maxLines:o=0,hasTruncateTooltip:c=!0,wordBreak:d,textWrap:f,justify:g=`start`,hasCapsize:b=!1,hasStrikethrough:C=!1,xstyle:A,className:F,style:I,children:L,ref:R,...z}){let B=P[e],V=n&&n!==e?{"aria-level":n}:{},H=d??(o===1?`break-all`:`break-word`),U=o>0||b?`block`:i,W=m({maxLines:o}),G=typeof c==`string`?c:`above`,K=o>0&&c!==!1&&W.isTruncated,q=(0,j.useRef)(null),J=o>1?{WebkitLineClamp:o}:void 0;return(0,M.jsxs)(M.Fragment,{children:[(0,M.jsx)(B,{ref:u(R,W.ref,q),...l(a(`heading`,{level:e,color:r,...t&&{type:t}}),s(D[E(r)],t?S[t]:T[e],t&&x[t],o===1?v.singleLine:o>1?v.multiLine:O[U],o>0&&k[H],f&&y[f],g!==`start`&&_[g],b&&w.enabled,C&&h.strikethrough,A),F,{...I,...J}),title:K?W.fullText:void 0,...V,...z,children:L}),K&&(0,M.jsx)(j.Suspense,{fallback:null,children:(0,M.jsx)(N,{anchorRef:q,content:(0,M.jsx)(`span`,{...s(p.content),children:W.fullText}),placement:G})})]})}var j,M,N,P,F=e((()=>{j=n(i(),1),c(),g(),b(),C(),d(),o(),M=f(),t(),N=(0,j.lazy)(async()=>r(()=>import(`./Tooltip-DL8KITNv.js`).then(e=>(e.r(),e.n)).then(e=>({default:e.Tooltip})),__vite__mapDeps([0,1,2,3,4,5,6,7,8,9]),import.meta.url)),P={1:`h1`,2:`h2`,3:`h3`,4:`h4`,5:`h5`,6:`h6`},A.displayName=`Heading`,A.__docgenInfo={description:`Heading - Semantic heading component

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
\`\`\``,methods:[],displayName:`Heading`,props:{ref:{required:!1,tsType:{name:`ReactRef`,raw:`React.Ref<HTMLHeadingElement>`,elements:[{name:`HTMLHeadingElement`}]},description:`Ref forwarded to the root element`},level:{required:!0,tsType:{name:`union`,raw:`1 | 2 | 3 | 4 | 5 | 6`,elements:[{name:`literal`,value:`1`},{name:`literal`,value:`2`},{name:`literal`,value:`3`},{name:`literal`,value:`4`},{name:`literal`,value:`5`},{name:`literal`,value:`6`}]},description:"Heading level (1-6). Determines the semantic HTML element (h1–h6).\nAlso determines visual styling unless `type` is set."},type:{required:!1,tsType:{name:`union`,raw:`'display-1' | 'display-2' | 'display-3'`,elements:[{name:`literal`,value:`'display-1'`},{name:`literal`,value:`'display-2'`},{name:`literal`,value:`'display-3'`}]},description:`Display type variant. When set, overrides the visual styling from \`level\`
with display-scale sizing (larger, lighter weight, tighter line-height).
The \`level\` still determines the HTML element for accessibility.

Use for hero banners, marketing headlines, and data callouts that need
heading semantics.

@example
\`\`\`
<Heading level={1} type="display-1">Hero Title</Heading>
<Heading level={2} type="display-2">$1.2M Revenue</Heading>
\`\`\``},accessibilityLevel:{required:!1,tsType:{name:`union`,raw:`1 | 2 | 3 | 4 | 5 | 6`,elements:[{name:`literal`,value:`1`},{name:`literal`,value:`2`},{name:`literal`,value:`3`},{name:`literal`,value:`4`},{name:`literal`,value:`5`},{name:`literal`,value:`6`}]},description:"Accessibility level override. When set, the `aria-level` will differ\nfrom the visual `level`. Use this when the visual hierarchy doesn't\nmatch the document outline (e.g., sidebar headings, reused components).\n\n@default Same as `level`\n\n@example\n```\n<Heading level={2} accessibilityLevel={3}>Sidebar Section</Heading>\n```"},color:{required:!1,tsType:{name:`TextColorMap`},description:`Text color.
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
@default false`,defaultValue:{value:`false`,computed:!1}},children:{required:!0,tsType:{name:`ReactNode`},description:`Heading content`}},composes:[`Omit`]}}));export{F as n,A as t};