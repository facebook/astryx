const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./Tooltip-Ypc-fkfG.js","./rolldown-runtime-DkW27tQK.js","./react-BZJXY1be.js","./jsx-runtime-DeHZSEgm.js","./useTooltip-Cm0gpSWG.js","./themeProps-CREkzZh6.js","./naming-DuIRtD9i.js","./useLayer-EhGBKttH.js","./stylex-Dft6gtPK.js","./layerAnimations.stylex-18OH5AHk.js","./tokens.stylex-C15xwlpu.js","./useIsomorphicLayoutEffect-vnms8l8s.js"])))=>i.map(i=>d[i]);
import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{n as t,t as n}from"./preload-helper-wdlQj8DP.js";import{t as r}from"./react-BZJXY1be.js";import{n as i,t as a}from"./stylex-Dft6gtPK.js";import{n as o}from"./mergeProps-JRyAvMxc.js";import{n as s}from"./mergeRefs-CPqjs56a.js";import{n as c,t as l}from"./themeProps-CREkzZh6.js";import{_ as u,a as d,c as f,d as p,f as m,g as h,h as g,i as _,l as v,m as y,n as b,o as x,p as S,r as C,s as w,u as T,v as E}from"./Text-BfjtEFtP.js";import{t as D}from"./jsx-runtime-DeHZSEgm.js";function O({level:e,type:t,accessibilityLevel:n,color:r=`primary`,display:a=`block`,maxLines:l=0,hasTruncateTooltip:p=!0,wordBreak:_,textWrap:b,justify:D=`start`,hasCapsize:O=!1,hasStrikethrough:N=!1,xstyle:P,className:F,style:I,children:L,ref:R,...z}){let B=M[e],V=n&&n!==e?{"aria-level":n}:{},H=_??(l===1?`break-all`:`break-word`),U=l>0||O?`block`:a,W=d({maxLines:l}),G=typeof p==`string`?p:`above`,K=l>0&&p!==!1&&W.isTruncated,q=(0,k.useRef)(null),J=l>1?{WebkitLineClamp:l}:void 0;return(0,A.jsxs)(A.Fragment,{children:[(0,A.jsx)(B,{ref:s(R,W.ref,q),...o(c(`heading`,{level:e,color:r,...t&&{type:t}}),i(w[C(r)],t?y[t]:S[e],t&&v[t],l===1?h.singleLine:l>1?h.multiLine:T[U],l>0&&E[H],b&&g[b],D!==`start`&&m[D],O&&x.enabled,N&&f.strikethrough,P),F,{...I,...J}),title:K?W.fullText:void 0,...V,...z,children:L}),K&&(0,A.jsx)(k.Suspense,{fallback:null,children:(0,A.jsx)(j,{anchorRef:q,content:(0,A.jsx)(`span`,{...i(u.content),children:W.fullText}),placement:G})})]})}var k,A,j,M;function N(){return(N=e((()=>{k=r(),a(),p(),_(),b(),l(),A=D(),t(),j=(0,k.lazy)(async()=>n(()=>import(`./Tooltip-Ypc-fkfG.js`).then(e=>(e.r(),e.n)).then(e=>({default:e.Tooltip})),__vite__mapDeps([0,1,2,3,4,5,6,7,8,9,10,11]),import.meta.url)),M={1:`h1`,2:`h2`,3:`h3`,4:`h4`,5:`h5`,6:`h6`},O.displayName=`Heading`,O.__docgenInfo={description:`Heading - Semantic heading component

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
@default false`,defaultValue:{value:`false`,computed:!1}},children:{required:!0,tsType:{name:`ReactNode`},description:`Heading content`}},composes:[`Omit`]}})))()}export{N as n,O as t};