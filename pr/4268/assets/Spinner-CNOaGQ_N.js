import{i as e,s as t}from"./preload-helper-CT_b8DTk.js";import{t as n}from"./react-B7Te67-h.js";import{l as r,n as i,t as a,u as o}from"./themeProps-_oSbOSxB.js";import{S as s,t as c}from"./utils-CD2ovDaz.js";import{t as l}from"./jsx-runtime-DqZldVDK.js";import{n as u,r as d}from"./useTheme-Ci2Hmk2P.js";import{n as f,t as p}from"./Text-Bt7jq58k.js";function m({size:e=`md`,shade:t=`default`,label:n,xstyle:r,className:a,style:c,"aria-label":l,"data-testid":u,ref:f,...m}){let b=(0,h.useRef)(null),{tokens:x}=d();(0,h.useEffect)(()=>{let n=b.current;if(n==null)return;let r=n.getContext(`2d`);if(!r)return;let{border:i,diameter:a}=v[e],o=window.devicePixelRatio||1,s=t===`inherit`?getComputedStyle(n).color:null,c=t===`inherit`?s:t===`onMedia`?x[`--color-on-dark`]:t===`subtle`?x[`--color-text-secondary`]:x[`--color-accent`],l=t===`inherit`?s:t===`onMedia`?`${x[`--color-on-dark`]}4D`:x[`--color-track`],u=a+i*2,d=Math.round(u*o),f=d+d%2,p=f/u,m=a/2*p,h=i*p;n.height=n.width=f,n.style.width=n.style.height=u+`px`,r.lineCap=`round`,r.lineWidth=h;let g=f/2;r.beginPath(),r.arc(g,g,m,0,2*Math.PI),r.strokeStyle=l,t===`inherit`&&(r.globalAlpha=.3),r.stroke(),r.globalAlpha=1,r.beginPath(),r.arc(g,g,m,_*Math.PI,2.25%2*Math.PI),r.strokeStyle=c,r.stroke()},[t,e,x]);let{border:S,diameter:C}=v[e],w=C+S*2,T=n!=null,E=(0,g.jsx)(`span`,{ref:T?void 0:f,role:`status`,"aria-label":l??(typeof n==`string`?n:void 0)??`Loading`,"data-testid":T?void 0:u,...T?{}:m,...s(T?``:i(`spinner`,{size:e,shade:t}),o(y.spinner,!T&&r),T?void 0:a,{...T?{}:c,width:w,height:w}),children:(0,g.jsx)(`canvas`,{ref:b,className:`astryxlp1x4z astryx1lliihq astryx1so62im astryx14qxm4i astryxnh0sag astryxa4qsjk astryx48ohth astryx1esw782`})});return T?(0,g.jsxs)(`div`,{ref:f,"data-testid":u,...m,...s(i(`spinner`,{size:e,shade:t}),o(y.wrapper,r),a,c),children:[E,typeof n==`string`?(0,g.jsx)(p,{type:`body`,weight:`bold`,children:n}):n]}):E}var h,g,_,v,y,b=e((()=>{h=t(n(),1),r(),u(),f(),c(),a(),g=l(),_=1.5,v={sm:{diameter:10,border:2},md:{diameter:14,border:3},lg:{diameter:18,border:3},xl:{diameter:28,border:4}},y={wrapper:{k1xSpc:`astryx3nfvp2`,kXwgrk:`astryxdt5ytf`,kGNEyG:`astryx6s0dn4`,kOIVth:`astryx1txdalj`,$$css:!0},spinner:{k1xSpc:`astryxwz0xwf`,kgQiWS:`astryx1ku5rj1`,kVQacm:`astryxb3r6kr`,kXLuUW:`astryxxymvpz`,$$css:!0}},m.displayName=`Spinner`,m.__docgenInfo={description:`An animated loading indicator. Available in three sizes and two color shades.

@example
\`\`\`
<Spinner />
<Spinner size="sm" />
<Spinner size="lg" shade="onMedia" />
<Spinner label="Loading..." />
<Spinner aria-label="Loading data" />
\`\`\``,methods:[],displayName:`Spinner`,props:{xstyle:{required:!1,tsType:{name:`StyleXStyles`},description:"StyleX styles created via `stylex.create()`. Merged with the component's\nbase styles inside a single `stylex.props()` call for optimal deduplication.\n\n@example\n```\nconst overrides = stylex.create({ root: { marginBottom: 8 } });\n<Component xstyle={overrides.root} />\n```"},ref:{required:!1,tsType:{name:`ReactRef`,raw:`React.Ref<HTMLSpanElement>`,elements:[{name:`HTMLSpanElement`}]},description:`Ref forwarded to the root element`},size:{required:!1,tsType:{name:`union`,raw:`keyof typeof SIZES`,elements:[{name:`literal`,value:`sm`},{name:`literal`,value:`md`},{name:`literal`,value:`lg`},{name:`literal`,value:`xl`}]},description:`Spinner size.
- 'sm': 10px diameter
- 'md': 14px diameter
- 'lg': 18px diameter
- 'xl': 36px diameter
@default 'md'`,defaultValue:{value:`'md'`,computed:!1}},shade:{required:!1,tsType:{name:`union`,raw:`'default' | 'onMedia' | 'subtle' | 'inherit'`,elements:[{name:`literal`,value:`'default'`},{name:`literal`,value:`'onMedia'`},{name:`literal`,value:`'subtle'`},{name:`literal`,value:`'inherit'`}]},description:`Color shade.
- 'default': accent color on light backgrounds
- 'onMedia': white on dark/accent backgrounds
- 'subtle': secondary text color, less prominent — for inline use in lists
- 'inherit': inherits the parent's \`currentColor\` (with a translucent
  track) — use inside colored elements like buttons so the ring matches
  the resolved foreground regardless of theme/variant
@default 'default'`,defaultValue:{value:`'default'`,computed:!1}},label:{required:!1,tsType:{name:`ReactNode`},description:`Visible content displayed below the spinner.
Accepts a string or ReactNode for rich content.

When \`label\` is a string, it is also used as the accessible name
(aria-label) unless \`aria-label\` is explicitly set.

@example
\`\`\`
<Spinner label="Loading..." />
<Spinner label={<><strong>Fetching data</strong><br/>This may take a moment</>} aria-label="Fetching data" />
\`\`\``},"data-testid":{required:!1,tsType:{name:`string`},description:`Test ID for the root element.`}},composes:[`Omit`]}})),x=e((()=>{b()}));export{m as n,b as r,x as t};