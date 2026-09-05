import{i as e,s as t}from"./preload-helper-CT_b8DTk.js";import{t as n}from"./react-B7Te67-h.js";import{D as r,E as i,F as a,P as o}from"./ime-Dy4QRKoo.js";import{P as s,t as c}from"./utils-eYNPhPe_.js";import{t as l}from"./jsx-runtime-DqZldVDK.js";import{n as u,t as d}from"./Text-ydqoaB2w.js";function f(){if(!(typeof CSS>`u`||typeof CSS.registerProperty!=`function`))for(let e of b)try{CSS.registerProperty({name:e,syntax:`<length>`,inherits:!0,initialValue:`0px`})}catch{}}function p(){C=!1;let e=[];for(let t of S)e.push(...t.getAnimations());S.clear();for(let t of e)t.startTime=0}function m(e){if(e!=null&&typeof e.getAnimations==`function`)return S.add(e),C||(C=!0,requestAnimationFrame(p)),()=>{S.delete(e)}}function h({size:e=`md`,shade:t=`default`,label:n,xstyle:i,className:o,style:c,"aria-label":l,"data-testid":u,ref:f,...p}){let{border:h,diameter:b}=y[e],S=b+h*2,C=Math.PI*b,O=C*v,k=n!=null,A=(0,g.useId)(),j=k&&typeof n==`string`&&l==null,M=(0,_.jsx)(`span`,{ref:k?void 0:f,role:`status`,"aria-label":j?void 0:l??(typeof n==`string`?n:void 0)??`Loading`,"aria-labelledby":j?A:void 0,"data-testid":k?void 0:u,...k?{}:p,...s(k?``:r(`spinner`,{size:e,shade:t}),a(w.spinner,!k&&T[e],!k&&E[t],!k&&i),k?void 0:o,{...k?{}:c,width:`var(${x}, ${S}px)`,height:`var(${x}, ${S}px)`}),children:(0,_.jsxs)(`svg`,{ref:m,width:S,height:S,"aria-hidden":`true`,className:`astryxlp1x4z astryx1lliihq astryx6v0vjy astryx7yyq19 astryx1so62im astryx1rea2x4 astryx14qxm4i astryxnh0sag astryxa4qsjk astryx48ohth astryx1esw782`,children:[(0,_.jsx)(`circle`,{cx:`50%`,cy:`50%`,r:b/2,strokeWidth:h,...a(w.circle,w.track,D[t])}),(0,_.jsx)(`circle`,{cx:`50%`,cy:`50%`,r:b/2,strokeWidth:h,strokeDasharray:`${O} ${C-O}`,className:`astryxbh8q5q astryx1764fhq astryx1g0ag68 astryx1owpc8m astryxio8zfp astryxgw3ha0 astryxtve3lm astryx9tu13d astryx1vy8frr`})]})});return k?(0,_.jsxs)(`div`,{ref:f,"data-testid":u,...p,...s(r(`spinner`,{size:e,shade:t}),a(w.wrapper,T[e],E[t],i),o,c),children:[M,typeof n==`string`?(0,_.jsx)(d,{id:A,type:`body`,weight:`bold`,children:n}):n]}):M}var g,_,v,y,b,x,S,C,w,T,E,D,O=e((()=>{g=t(n(),1),o(),u(),c(),i(),_=l(),v=.375,y={sm:{diameter:10,border:2},md:{diameter:14,border:3},lg:{diameter:18,border:3},xl:{diameter:28,border:4}},b=[`--_spinner-ring-diameter`,`--_spinner-ring-stroke`],x=`--_spinner-box-size`,f(),S=new Set,C=!1,w={wrapper:{k1xSpc:`astryx3nfvp2`,kXwgrk:`astryxdt5ytf`,kGNEyG:`astryx6s0dn4`,kOIVth:`astryx1txdalj`,$$css:!0},spinner:{k1xSpc:`astryxwz0xwf`,kgQiWS:`astryx1ku5rj1`,kXLuUW:`astryxxymvpz`,"--_spinner-ring-diameter":`astryx2lq4xu`,"--_spinner-ring-stroke":`astryx10qssua`,"--_spinner-box-size":`astryx69vvuq`,kmuXW:`astryx2lah0s`,$$css:!0},circle:{kDwRjp:`astryxbh8q5q`,kR8GR0:`astryx1764fhq`,k3nNDw:`astryx1g0ag68`,kU5bRw:`astryx1owpc8m`,kPFa82:`astryxio8zfp`,kfJifR:`astryxgw3ha0`,$$css:!0},track:{kjVXCG:`astryxalkhop`,$$css:!0}},T={sm:{"--spinner-diameter":`astryx11wm0hx`,"--spinner-stroke-width":`astryxls98ul`,$$css:!0},md:{"--spinner-diameter":`astryx15pu9g6`,"--spinner-stroke-width":`astryxr0wkrm`,$$css:!0},lg:{"--spinner-diameter":`astryx1w424tr`,"--spinner-stroke-width":`astryxr0wkrm`,$$css:!0},xl:{"--spinner-diameter":`astryx1orj1z9`,"--spinner-stroke-width":`astryx7y2bof`,$$css:!0}},E={default:{"--spinner-color":`astryxt1b8mc`,"--spinner-track-color":`astryxspt9s2`,$$css:!0},subtle:{"--spinner-color":`astryx1jevo6s`,"--spinner-track-color":`astryxspt9s2`,$$css:!0},onMedia:{"--spinner-color":`astryx13u6jys`,"--spinner-track-color":`astryx1ufpcf6`,$$css:!0},inherit:{"--spinner-color":`astryx1uzk0gl`,"--spinner-track-color":`astryxbfzqbu`,$$css:!0}},D={default:{kDd8S0:`astryx1g350g8`,$$css:!0},subtle:{kDd8S0:`astryx1g350g8`,$$css:!0},onMedia:{kDd8S0:`astryx1smxkh6`,$$css:!0},inherit:{kDd8S0:`astryx7bo2k`,$$css:!0}},h.displayName=`Spinner`,h.__docgenInfo={description:`An animated loading indicator. Available in four sizes and four color shades.

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
\`\`\``},"data-testid":{required:!1,tsType:{name:`string`},description:`Test ID for the root element.`}},composes:[`Omit`]}})),k=e((()=>{O()}));export{h as n,O as r,k as t};