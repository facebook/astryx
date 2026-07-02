const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./iframe-BzSUXdLu.js","./preload-helper-Ct5FWWRu.js","./iframe-KMH8zvoi.css"])))=>i.map(i=>d[i]);
import{_ as M}from"./preload-helper-Ct5FWWRu.js";import{aP as V,ah as s,a1 as n,a6 as E,af as v,ay as W,a7 as z,C as B,v as D,a2 as C,ax as A,aQ as N,aA as f,J as F,F as U,an as I,am as O,x as $,aB as J}from"./iframe-BzSUXdLu.js";const Q=s.lazy(async()=>M(()=>import("./iframe-BzSUXdLu.js").then(a=>a.j),__vite__mapDeps([0,1,2]),import.meta.url).then(a=>({default:a.Tooltip}))),X={1:"h1",2:"h2",3:"h3",4:"h4",5:"h5",6:"h6"};function y({level:a,type:l,accessibilityLevel:i,color:o="primary",display:h="block",maxLines:e=0,hasTruncateTooltip:r=!0,wordBreak:g,textWrap:d,justify:u="start",hasCapsize:m=!1,hasStrikethrough:b=!1,xstyle:H,className:T,style:w,children:k,ref:S,...x}){const R=X[a],q=i&&i!==a?{"aria-level":i}:{},L=g??(e===1?"break-all":"break-word"),P=e>0||m?"block":h,t=V({maxLines:e}),_=typeof r=="string"?r:"above",c=e>0&&r!==!1&&t.isTruncated,p=s.useRef(null),j=e>1?{WebkitLineClamp:e}:void 0;return n.jsxs(n.Fragment,{children:[n.jsx(R,{ref:z(S,t.ref,p),...E(W("heading",{level:a,color:o,...l&&{type:l}}),v($[o],l?I[l]:O[a],l&&U[l],e===1?f.singleLine:e>1?f.multiLine:F[P],e>0&&N[L],d&&A[d],u!=="start"&&C[u],m&&D.enabled,b&&B.strikethrough,H),T,{...w,...j}),title:c?t.fullText:void 0,...q,...x,children:k}),c&&n.jsx(s.Suspense,{fallback:null,children:n.jsx(Q,{anchorRef:p,content:n.jsx("span",{...v(J.content),children:t.fullText}),placement:_})})]})}y.displayName="Heading";y.__docgenInfo={description:`Heading - Semantic heading component

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
\`\`\``,methods:[],displayName:"Heading",props:{ref:{required:!1,tsType:{name:"ReactRef",raw:"React.Ref<HTMLHeadingElement>",elements:[{name:"HTMLHeadingElement"}]},description:"Ref forwarded to the root element"},level:{required:!0,tsType:{name:"union",raw:"1 | 2 | 3 | 4 | 5 | 6",elements:[{name:"literal",value:"1"},{name:"literal",value:"2"},{name:"literal",value:"3"},{name:"literal",value:"4"},{name:"literal",value:"5"},{name:"literal",value:"6"}]},description:"Heading level (1-6). Determines the semantic HTML element (h1–h6).\nAlso determines visual styling unless `type` is set."},type:{required:!1,tsType:{name:"union",raw:"'display-1' | 'display-2' | 'display-3'",elements:[{name:"literal",value:"'display-1'"},{name:"literal",value:"'display-2'"},{name:"literal",value:"'display-3'"}]},description:`Display type variant. When set, overrides the visual styling from \`level\`
with display-scale sizing (larger, lighter weight, tighter line-height).
The \`level\` still determines the HTML element for accessibility.

Use for hero banners, marketing headlines, and data callouts that need
heading semantics.

@example
\`\`\`
<Heading level={1} type="display-1">Hero Title</Heading>
<Heading level={2} type="display-2">$1.2M Revenue</Heading>
\`\`\``},accessibilityLevel:{required:!1,tsType:{name:"union",raw:"1 | 2 | 3 | 4 | 5 | 6",elements:[{name:"literal",value:"1"},{name:"literal",value:"2"},{name:"literal",value:"3"},{name:"literal",value:"4"},{name:"literal",value:"5"},{name:"literal",value:"6"}]},description:"Accessibility level override. When set, the `aria-level` will differ\nfrom the visual `level`. Use this when the visual hierarchy doesn't\nmatch the document outline (e.g., sidebar headings, reused components).\n\n@default Same as `level`\n\n@example\n```\n<Heading level={2} accessibilityLevel={3}>Sidebar Section</Heading>\n```"},color:{required:!1,tsType:{name:"union",raw:`| 'primary'
| 'secondary'
| 'disabled'
| 'placeholder'
| 'accent'
| 'inherit'`,elements:[{name:"literal",value:"'primary'"},{name:"literal",value:"'secondary'"},{name:"literal",value:"'disabled'"},{name:"literal",value:"'placeholder'"},{name:"literal",value:"'accent'"},{name:"literal",value:"'inherit'"}]},description:`Text color.
@default 'primary'`,defaultValue:{value:"'primary'",computed:!1}},display:{required:!1,tsType:{name:"union",raw:"'inline' | 'block'",elements:[{name:"literal",value:"'inline'"},{name:"literal",value:"'block'"}]},description:`Display type. Headings default to block.
Note: Silently overridden to 'block' when maxLines > 0 or hasCapsize is true.
@default 'block'`,defaultValue:{value:"'block'",computed:!1}},maxLines:{required:!1,tsType:{name:"number"},description:`Maximum lines before truncation. 0 = no truncation.
When set, shows tooltip on hover if content is truncated.
@default 0`,defaultValue:{value:"0",computed:!1}},hasTruncateTooltip:{required:!1,tsType:{name:"union",raw:"boolean | LayerPlacement",elements:[{name:"boolean"},{name:"union",raw:"'above' | 'below' | 'start' | 'end'",elements:[{name:"literal",value:"'above'"},{name:"literal",value:"'below'"},{name:"literal",value:"'start'"},{name:"literal",value:"'end'"}]}]},description:"Control tooltip behavior for truncated text.\n- `true` (default when maxLines > 0): show tooltip at default position\n- `false`: disable tooltip\n- Position value: show tooltip at specific position\n@default true",defaultValue:{value:"true",computed:!1}},wordBreak:{required:!1,tsType:{name:"union",raw:"'break-word' | 'break-all'",elements:[{name:"literal",value:"'break-word'"},{name:"literal",value:"'break-all'"}]},description:`Word break behavior for truncated text.
@default 'break-all' for maxLines=1, 'break-word' otherwise`},textWrap:{required:!1,tsType:{name:"union",raw:"'wrap' | 'nowrap' | 'balance' | 'pretty'",elements:[{name:"literal",value:"'wrap'"},{name:"literal",value:"'nowrap'"},{name:"literal",value:"'balance'"},{name:"literal",value:"'pretty'"}]},description:"Text wrapping behavior."},justify:{required:!1,tsType:{name:"union",raw:"'start' | 'center' | 'end'",elements:[{name:"literal",value:"'start'"},{name:"literal",value:"'center'"},{name:"literal",value:"'end'"}]},description:`Text alignment (justification). Uses logical values (start/end)
for i18n/RTL compatibility.
@default 'start'`,defaultValue:{value:"'start'",computed:!1}},hasCapsize:{required:!1,tsType:{name:"boolean"},description:`Enable optical alignment (text-box-trim).
Forces block display.
@default false`,defaultValue:{value:"false",computed:!1}},hasStrikethrough:{required:!1,tsType:{name:"boolean"},description:`Strikethrough decoration.
@default false`,defaultValue:{value:"false",computed:!1}},children:{required:!0,tsType:{name:"ReactNode"},description:"Heading content"}},composes:["Omit"]};export{y as H};
