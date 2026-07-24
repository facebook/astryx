const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./Tooltip-DRS8Aw65.js","./preload-helper-CT_b8DTk.js","./react-B7Te67-h.js","./jsx-runtime-DqZldVDK.js","./useTooltip-BScYHAso.js","./themeProps-_oSbOSxB.js","./layerAnimations.stylex-BP6OmR9h.js","./tokens.stylex-yxVornwx.js","./useIsomorphicLayoutEffect-AEBSTB0m.js"])))=>i.map(i=>d[i]);
import{i as e,n as t,s as n,t as r}from"./preload-helper-CT_b8DTk.js";import{t as i}from"./react-B7Te67-h.js";import{l as a,n as o,t as s,u as c}from"./themeProps-_oSbOSxB.js";import{S as l,b as u,t as d}from"./utils-CD2ovDaz.js";import{t as f}from"./jsx-runtime-DqZldVDK.js";import{_ as p,a as m,c as h,d as g,f as _,g as v,h as y,i as b,l as x,m as S,o as C,p as w,r as T,s as E,u as D}from"./Text-Bt7jq58k.js";function O({level:e,type:t,accessibilityLevel:n,color:r=`primary`,display:i=`block`,maxLines:a=0,hasTruncateTooltip:s=!0,wordBreak:d,textWrap:f,justify:T=`start`,hasCapsize:D=!1,hasStrikethrough:O=!1,xstyle:N,className:P,style:F,children:I,ref:L,...R}){let z=M[e],B=n&&n!==e?{"aria-level":n}:{},V=d??(a===1?`break-all`:`break-word`),H=a>0||D?`block`:i,U=b({maxLines:a}),W=typeof s==`string`?s:`above`,G=a>0&&s!==!1&&U.isTruncated,K=(0,k.useRef)(null),q=a>1?{WebkitLineClamp:a}:void 0;return(0,A.jsxs)(A.Fragment,{children:[(0,A.jsx)(z,{ref:u(L,U.ref,K),...l(o(`heading`,{level:e,color:r,...t&&{type:t}}),c(C[r],t?w[t]:_[e],t&&h[t],a===1?y.singleLine:a>1?y.multiLine:x[H],a>0&&p[V],f&&S[f],T!==`start`&&g[T],D&&m.enabled,O&&E.strikethrough,N),P,{...F,...q}),title:G?U.fullText:void 0,...B,...R,children:I}),G&&(0,A.jsx)(k.Suspense,{fallback:null,children:(0,A.jsx)(j,{anchorRef:K,content:(0,A.jsx)(`span`,{...c(v.content),children:U.fullText}),placement:W})})]})}var k,A,j,M,N=e((()=>{k=n(i(),1),a(),D(),T(),d(),s(),A=f(),t(),j=(0,k.lazy)(async()=>r(()=>import(`./Tooltip-DRS8Aw65.js`).then(e=>(e.r(),e.n)).then(e=>({default:e.Tooltip})),__vite__mapDeps([0,1,2,3,4,5,6,7,8]),import.meta.url)),M={1:`h1`,2:`h2`,3:`h3`,4:`h4`,5:`h5`,6:`h6`},O.displayName=`Heading`,O.__docgenInfo={description:`Heading - Semantic heading component

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
\`\`\``},accessibilityLevel:{required:!1,tsType:{name:`union`,raw:`1 | 2 | 3 | 4 | 5 | 6`,elements:[{name:`literal`,value:`1`},{name:`literal`,value:`2`},{name:`literal`,value:`3`},{name:`literal`,value:`4`},{name:`literal`,value:`5`},{name:`literal`,value:`6`}]},description:"Accessibility level override. When set, the `aria-level` will differ\nfrom the visual `level`. Use this when the visual hierarchy doesn't\nmatch the document outline (e.g., sidebar headings, reused components).\n\n@default Same as `level`\n\n@example\n```\n<Heading level={2} accessibilityLevel={3}>Sidebar Section</Heading>\n```"},color:{required:!1,tsType:{name:`union`,raw:`| 'primary'
| 'secondary'
| 'disabled'
| 'placeholder'
| 'accent'
| 'inherit'`,elements:[{name:`literal`,value:`'primary'`},{name:`literal`,value:`'secondary'`},{name:`literal`,value:`'disabled'`},{name:`literal`,value:`'placeholder'`},{name:`literal`,value:`'accent'`},{name:`literal`,value:`'inherit'`}]},description:`Text color.
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
@default false`,defaultValue:{value:`false`,computed:!1}},children:{required:!0,tsType:{name:`ReactNode`},description:`Heading content`}},composes:[`Omit`]}}));export{N as n,O as t};