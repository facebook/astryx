import{i as e,s as t}from"./preload-helper-CT_b8DTk.js";import{t as n}from"./react-B7Te67-h.js";import{E as r,F as i,I as a,O as o}from"./ime-B2gVvZm0.js";import{P as s,t as c}from"./utils-CuDRdYlB.js";import{t as l}from"./jsx-runtime-DqZldVDK.js";import{n as u,t as d}from"./Text-BXEuttRu.js";import{l as f,t as p}from"./i18n-Bz857U5W.js";function m(){if(!(typeof CSS>`u`||typeof CSS.registerProperty!=`function`))for(let e of S)try{CSS.registerProperty({name:e,syntax:`<length>`,inherits:!0,initialValue:`0px`})}catch{}}function h(){T=!1;let e=[];for(let t of w)e.push(...t.getAnimations());w.clear();for(let t of e)t.startTime=0}function g(e){if(e!=null&&typeof e.getAnimations==`function`)return w.add(e),T||(T=!0,requestAnimationFrame(h)),()=>{w.delete(e)}}function _({size:e=`md`,shade:t=`default`,label:n,xstyle:r,className:i,style:c,"aria-label":l,"data-testid":u,ref:p,...m}){let{border:h,diameter:_}=x[e],S=_+h*2,w=Math.PI*_,T=w*b,A=n!=null,j=(0,v.useId)(),M=f(),N=A&&typeof n==`string`&&l==null,P=l??(typeof n==`string`?n:void 0)??M(`@astryx.spinner.loading`),F=(0,y.jsx)(`span`,{ref:A?void 0:p,role:`status`,"aria-label":N?void 0:P,"aria-labelledby":N?j:void 0,"data-testid":A?void 0:u,...A?{}:m,...s(A?``:o(`spinner`,{size:e,shade:t}),a(E.spinner,!A&&D[e],!A&&O[t],!A&&r),A?void 0:i,{...A?{}:c,width:`var(${C}, ${S}px)`,height:`var(${C}, ${S}px)`}),children:(0,y.jsxs)(`svg`,{ref:g,width:S,height:S,"aria-hidden":`true`,className:`astryxlp1x4z astryx1lliihq astryx6v0vjy astryx7yyq19 astryx1so62im astryx1rea2x4 astryx14qxm4i astryxnh0sag astryxa4qsjk astryx48ohth astryx1esw782`,children:[(0,y.jsx)(`circle`,{cx:`50%`,cy:`50%`,r:_/2,strokeWidth:h,...a(E.circle,E.track,k[t])}),(0,y.jsx)(`circle`,{cx:`50%`,cy:`50%`,r:_/2,strokeWidth:h,strokeDasharray:`${T} ${w-T}`,className:`astryxbh8q5q astryx1764fhq astryx1g0ag68 astryx1owpc8m astryxio8zfp astryxgw3ha0 astryxtve3lm astryx9tu13d astryx1vy8frr`})]})});return A?(0,y.jsxs)(`div`,{ref:p,"data-testid":u,...m,...s(o(`spinner`,{size:e,shade:t}),a(E.wrapper,D[e],O[t],r),i,c),children:[F,typeof n==`string`?(0,y.jsx)(d,{id:j,type:`body`,weight:`bold`,children:n}):n]}):F}var v,y,b,x,S,C,w,T,E,D,O,k,A=e((()=>{v=t(n(),1),i(),u(),c(),r(),p(),y=l(),b=.375,x={sm:{diameter:10,border:2},md:{diameter:14,border:3},lg:{diameter:18,border:3},xl:{diameter:28,border:4}},S=[`--_spinner-ring-diameter`,`--_spinner-ring-stroke`],C=`--_spinner-box-size`,m(),w=new Set,T=!1,E={wrapper:{k1xSpc:`astryx3nfvp2`,kXwgrk:`astryxdt5ytf`,kGNEyG:`astryx6s0dn4`,kOIVth:`astryx1txdalj`,$$css:!0},spinner:{k1xSpc:`astryxwz0xwf`,kgQiWS:`astryx1ku5rj1`,kXLuUW:`astryxxymvpz`,"--_spinner-ring-diameter":`astryx2lq4xu`,"--_spinner-ring-stroke":`astryx10qssua`,"--_spinner-box-size":`astryx69vvuq`,kmuXW:`astryx2lah0s`,$$css:!0},circle:{kDwRjp:`astryxbh8q5q`,kR8GR0:`astryx1764fhq`,k3nNDw:`astryx1g0ag68`,kU5bRw:`astryx1owpc8m`,kPFa82:`astryxio8zfp`,kfJifR:`astryxgw3ha0`,$$css:!0},track:{kjVXCG:`astryxalkhop`,$$css:!0}},D={sm:{"--spinner-diameter":`astryx11wm0hx`,"--spinner-stroke-width":`astryxls98ul`,$$css:!0},md:{"--spinner-diameter":`astryx15pu9g6`,"--spinner-stroke-width":`astryxr0wkrm`,$$css:!0},lg:{"--spinner-diameter":`astryx1w424tr`,"--spinner-stroke-width":`astryxr0wkrm`,$$css:!0},xl:{"--spinner-diameter":`astryx1orj1z9`,"--spinner-stroke-width":`astryx7y2bof`,$$css:!0}},O={default:{"--spinner-color":`astryxt1b8mc`,"--spinner-track-color":`astryxspt9s2`,$$css:!0},subtle:{"--spinner-color":`astryx1jevo6s`,"--spinner-track-color":`astryxspt9s2`,$$css:!0},onMedia:{"--spinner-color":`astryx13u6jys`,"--spinner-track-color":`astryx1ufpcf6`,$$css:!0},inherit:{"--spinner-color":`astryx1uzk0gl`,"--spinner-track-color":`astryxbfzqbu`,$$css:!0}},k={default:{kDd8S0:`astryx1g350g8`,$$css:!0},subtle:{kDd8S0:`astryx1g350g8`,$$css:!0},onMedia:{kDd8S0:`astryx1smxkh6`,$$css:!0},inherit:{kDd8S0:`astryx7bo2k`,$$css:!0}},_.displayName=`Spinner`,_.__docgenInfo={description:`An animated loading indicator. Available in four sizes and four color shades.

@example
\`\`\`
<Spinner />
<Spinner size="sm" />
<Spinner size="lg" shade="onMedia" />
<Spinner label="Loading..." />
<Spinner aria-label="Loading data" />
\`\`\``,methods:[],displayName:`Spinner`,props:{xstyle:{required:!1,tsType:{name:`StyleXStyles`},description:"StyleX styles created via `stylex.create()`. Merged with the component's\nbase styles inside a single `stylex.props()` call for optimal deduplication.\n\n@example\n```\nconst overrides = stylex.create({ root: { marginBottom: 8 } });\n<Component xstyle={overrides.root} />\n```"},ref:{required:!1,tsType:{name:`ReactRef`,raw:`React.Ref<HTMLSpanElement>`,elements:[{name:`HTMLSpanElement`}]},description:`Ref forwarded to the root element`},size:{required:!1,tsType:{name:`union`,raw:`keyof typeof SIZES`,elements:[{name:`literal`,value:`sm`},{name:`literal`,value:`md`},{name:`literal`,value:`lg`},{name:`literal`,value:`xl`}]},description:`Spinner size. The diameter is the ring itself; the rendered box adds the
stroke width on each side (xl draws a 28px ring in a 36px box). A theme can
redefine what each named size resolves to — see \`--spinner-diameter\`.
- 'sm': 10px diameter
- 'md': 14px diameter
- 'lg': 18px diameter
- 'xl': 28px diameter
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
\`\`\``},"data-testid":{required:!1,tsType:{name:`string`},description:`Test ID for the root element.`}},composes:[`Omit`]}})),j=e((()=>{A()}));export{_ as n,A as r,j as t};