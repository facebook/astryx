import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{t}from"./react-BZJXY1be.js";import{n,t as r}from"./stylex-Dft6gtPK.js";import{n as i}from"./mergeProps-JRyAvMxc.js";import{n as a,t as o}from"./themeProps-CREkzZh6.js";import{n as s,t as c}from"./Text-BfjtEFtP.js";import{t as l}from"./jsx-runtime-DeHZSEgm.js";import{n as u,r as d}from"./useTheme-CAaDofyu.js";function f({size:e=`md`,shade:t=`default`,label:r,xstyle:o,className:s,style:l,"aria-label":u,"data-testid":f,ref:v,...y}){let b=(0,p.useRef)(null),{tokens:x}=d();(0,p.useEffect)(()=>{let n=b.current;if(n==null)return;let r=n.getContext(`2d`);if(!r)return;let{border:i,diameter:a}=g[e],o=window.devicePixelRatio||1,s=t===`inherit`?getComputedStyle(n).color:null,c=t===`inherit`?s:t===`onMedia`?x[`--color-on-dark`]:t===`subtle`?x[`--color-text-secondary`]:x[`--color-accent`],l=t===`inherit`?s:t===`onMedia`?`${x[`--color-on-dark`]}4D`:x[`--color-track`],u=a+i*2,d=Math.round(u*o),f=d+d%2,p=f/u,m=a/2*p,_=i*p;n.height=n.width=f,n.style.width=n.style.height=u+`px`,r.lineCap=`round`,r.lineWidth=_;let v=f/2;r.beginPath(),r.arc(v,v,m,0,2*Math.PI),r.strokeStyle=l,t===`inherit`&&(r.globalAlpha=.3),r.stroke(),r.globalAlpha=1,r.beginPath(),r.arc(v,v,m,h*Math.PI,2.25%2*Math.PI),r.strokeStyle=c,r.stroke()},[t,e,x]);let{border:S,diameter:C}=g[e],w=C+S*2,T=r!=null,E=(0,p.useId)(),D=T&&typeof r==`string`&&u==null,O=(0,m.jsx)(`span`,{ref:T?void 0:v,role:`status`,"aria-label":D?void 0:u??(typeof r==`string`?r:void 0)??`Loading`,"aria-labelledby":D?E:void 0,"data-testid":T?void 0:f,...T?{}:y,...i(T?``:a(`spinner`,{size:e,shade:t}),n(_.spinner,!T&&o),T?void 0:s,{...T?{}:l,width:w,height:w}),children:(0,m.jsx)(`canvas`,{ref:b,className:`astryxlp1x4z astryx1lliihq astryx1so62im astryx14qxm4i astryxnh0sag astryxa4qsjk astryx48ohth astryx1esw782`})});return T?(0,m.jsxs)(`div`,{ref:v,"data-testid":f,...y,...i(a(`spinner`,{size:e,shade:t}),n(_.wrapper,o),s,l),children:[O,typeof r==`string`?(0,m.jsx)(c,{id:E,type:`body`,weight:`bold`,children:r}):r]}):O}var p,m,h,g,_;function v(){return(v=e((()=>{p=t(),r(),u(),s(),o(),m=l(),h=1.5,g={sm:{diameter:10,border:2},md:{diameter:14,border:3},lg:{diameter:18,border:3},xl:{diameter:28,border:4}},_={wrapper:{k1xSpc:`astryx3nfvp2`,kXwgrk:`astryxdt5ytf`,kGNEyG:`astryx6s0dn4`,kOIVth:`astryx1txdalj`,$$css:!0},spinner:{k1xSpc:`astryxwz0xwf`,kgQiWS:`astryx1ku5rj1`,kVQacm:`astryxb3r6kr`,kXLuUW:`astryxxymvpz`,$$css:!0}},f.displayName=`Spinner`,f.__docgenInfo={description:`An animated loading indicator. Available in three sizes and two color shades.

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

When \`label\` is a string, the visible text also provides the accessible
name of the status element (via aria-labelledby, avoiding a duplicate
announcement) unless \`aria-label\` is explicitly set.

@example
\`\`\`
<Spinner label="Loading..." />
<Spinner label={<><strong>Fetching data</strong><br/>This may take a moment</>} aria-label="Fetching data" />
\`\`\``},"data-testid":{required:!1,tsType:{name:`string`},description:`Test ID for the root element.`}},composes:[`Omit`]}})))()}export{v as n,f as t};