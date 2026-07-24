import{i as e}from"./preload-helper-CT_b8DTk.js";import{t}from"./react-B7Te67-h.js";import{l as n,n as r,t as i,u as a}from"./themeProps-_oSbOSxB.js";import{S as o,t as s}from"./utils-CD2ovDaz.js";import{t as c}from"./jsx-runtime-DqZldVDK.js";import{n as l,t as u}from"./globalIconRegistry-CnZOikiJ.js";function d(e){return e!=null&&e!==``?{role:`img`,"aria-label":e}:{"aria-hidden":`true`}}function f({icon:e,color:t=`inherit`,size:n=`md`,label:i,ref:s,...c}){let l=d(i);return typeof e==`string`?(0,h.jsx)(p,{name:e,color:t,size:n,a11yProps:l,spanProps:c}):(0,h.jsx)(e,{ref:s,...l,...o(r(`icon`,{size:n,color:t}),a(g.root,_[t],v[n])),...c})}function p({name:e,color:t,size:n,a11yProps:i,spanProps:s}){let c=u(e);return c==null?null:(0,h.jsx)(`span`,{...i,...s,...o(r(`icon`,{size:n,color:t}),a(g.span,_[t],y[n])),children:c})}function m(e,t){return typeof e==`string`||typeof e==`function`||typeof e==`object`&&e&&`render`in e?(0,h.jsx)(f,{icon:e,...t}):e}var h,g,_,v,y,b=e((()=>{t(),n(),l(),s(),i(),h=c(),g={root:{kmuXW:`astryx2lah0s`,$$css:!0},span:{k1xSpc:`astryx3nfvp2`,kGNEyG:`astryx6s0dn4`,kjj79g:`astryxl56j7k`,kmuXW:`astryx2lah0s`,$$css:!0}},_={primary:{kMwMTN:`astryxtbr613`,$$css:!0},secondary:{kMwMTN:`astryxv9yike`,$$css:!0},tertiary:{kMwMTN:`astryxv9yike`,$$css:!0},disabled:{kMwMTN:`astryxqa6c3m`,$$css:!0},accent:{kMwMTN:`astryxqwr325`,$$css:!0},success:{kMwMTN:`astryxtjic6`,$$css:!0},error:{kMwMTN:`astryxjt36v0`,$$css:!0},warning:{kMwMTN:`astryxs3pv69`,$$css:!0},inherit:{kMwMTN:`astryx1heor9g`,$$css:!0},blue:{kMwMTN:`astryx1fns2mt`,$$css:!0},red:{kMwMTN:`astryxeffzf7`,$$css:!0},green:{kMwMTN:`astryxmxeech`,$$css:!0},gray:{kMwMTN:`astryx1eyinzz`,$$css:!0},cyan:{kMwMTN:`astryx157w0xa`,$$css:!0},teal:{kMwMTN:`astryx1f3zxcb`,$$css:!0},yellow:{kMwMTN:`astryx1g6zdft`,$$css:!0},orange:{kMwMTN:`astryxxu74a4`,$$css:!0},pink:{kMwMTN:`astryx1kxxfg5`,$$css:!0},purple:{kMwMTN:`astryxzdw94u`,$$css:!0}},v={xsm:{kzqmXN:`astryx1jw3ynk`,kZKoxP:`astryxvle69y`,$$css:!0},sm:{kzqmXN:`astryxcdlrvm`,kZKoxP:`astryx1l36t39`,$$css:!0},md:{kzqmXN:`astryxwqq7k2`,kZKoxP:`astryxmll18r`,$$css:!0},lg:{kzqmXN:`astryxp8d6y2`,kZKoxP:`astryxam5rvr`,$$css:!0}},y={xsm:{kzqmXN:`astryx1jw3ynk`,kZKoxP:`astryxvle69y`,kGuDYH:`astryxboafo0`,$$css:!0},sm:{kzqmXN:`astryxcdlrvm`,kZKoxP:`astryx1l36t39`,kGuDYH:`astryx1jchvi3`,$$css:!0},md:{kzqmXN:`astryxwqq7k2`,kZKoxP:`astryxmll18r`,kGuDYH:`astryx1603h9y`,$$css:!0},lg:{kzqmXN:`astryxp8d6y2`,kZKoxP:`astryxam5rvr`,kGuDYH:`astryxngnso2`,$$css:!0}},f.displayName=`Icon`,f.__docgenInfo={description:'Renders an icon from the icon registry or a custom SVG component.\n\n@example\n```\n<Icon icon="close" size="md" color="primary" />\n```',methods:[],displayName:`Icon`,props:{ref:{required:!1,tsType:{name:`ReactRef`,raw:`React.Ref<SVGSVGElement>`,elements:[{name:`SVGSVGElement`}]},description:`Ref forwarded to the root element`},icon:{required:!0,tsType:{name:`union`,raw:`IconType | IconName`,elements:[{name:`ComponentType`,elements:[{name:`SVGProps`,elements:[{name:`SVGSVGElement`}],raw:`SVGProps<SVGSVGElement>`}],raw:`ComponentType<SVGProps<SVGSVGElement>>`},{name:`union`,raw:`| 'close'
| 'chevronDown'
| 'chevronLeft'
| 'chevronRight'
| 'check'
| 'success'
| 'error'
| 'warning'
| 'info'
| 'calendar'
| 'clock'
| 'externalLink'
| 'menu'
| 'moreHorizontal'
| 'search'
| 'arrowUp'
| 'arrowDown'
| 'arrowsUpDown'
| 'funnel'
| 'eyeSlash'
| 'viewColumns'
| 'copy'
| 'checkDouble'
| 'wrench'
| 'stop'
| 'microphone'`,elements:[{name:`literal`,value:`'close'`},{name:`literal`,value:`'chevronDown'`},{name:`literal`,value:`'chevronLeft'`},{name:`literal`,value:`'chevronRight'`},{name:`literal`,value:`'check'`},{name:`literal`,value:`'success'`},{name:`literal`,value:`'error'`},{name:`literal`,value:`'warning'`},{name:`literal`,value:`'info'`},{name:`literal`,value:`'calendar'`},{name:`literal`,value:`'clock'`},{name:`literal`,value:`'externalLink'`},{name:`literal`,value:`'menu'`},{name:`literal`,value:`'moreHorizontal'`},{name:`literal`,value:`'search'`},{name:`literal`,value:`'arrowUp'`},{name:`literal`,value:`'arrowDown'`},{name:`literal`,value:`'arrowsUpDown'`},{name:`literal`,value:`'funnel'`},{name:`literal`,value:`'eyeSlash'`},{name:`literal`,value:`'viewColumns'`},{name:`literal`,value:`'copy'`},{name:`literal`,value:`'checkDouble'`},{name:`literal`,value:`'wrench'`},{name:`literal`,value:`'stop'`},{name:`literal`,value:`'microphone'`}]}]},description:`Icon to render. Can be:
- A semantic name string (e.g. 'close', 'chevronDown') — resolved from theme or built-in fallback
- An SVG icon component (e.g. from @heroicons/react) — rendered directly`},color:{required:!1,tsType:{name:`unknown`},description:`The color variant of the icon.
@default 'inherit'`,defaultValue:{value:`'inherit'`,computed:!1}},size:{required:!1,tsType:{name:`unknown`},description:`The size of the icon.
- 'xsm': 0.75rem (12px at a 16px root)
- 'sm': 1rem (16px at a 16px root)
- 'md': 1.25rem (20px at a 16px root)
- 'lg': 1.5rem (24px at a 16px root)
@default 'md'`,defaultValue:{value:`'md'`,computed:!1}},label:{required:!1,tsType:{name:`string`},description:`Accessible name for the icon. Set this only when the icon is MEANINGFUL on
its own — a standalone status glyph or an icon-only indicator with no
adjacent text conveying the same information. Providing it exposes the icon
to assistive tech as \`role="img"\` with this string as the accessible name
(via \`aria-label\`) and drops the default \`aria-hidden="true"\`.

Omit it (the default) for decorative icons — the common case, e.g. an icon
beside a text label — and the icon stays hidden from assistive tech
(\`aria-hidden="true"\`). An empty string (\`''\`) is treated the same as
omitting it (decorative), since an empty accessible name is meaningless.

Don't set \`label\` when an interactive parent (Button, IconButton, link)
already names the control — that produces a duplicate announcement.

@example
\`\`\`
// Meaningful, standalone icon
<Icon icon="success" label="Completed" />

// Decorative icon (default) — omit label
<Icon icon="search" />
\`\`\``}},composes:[`Omit`]},m.__docgenInfo={description:`Renders an icon slot value. Handles semantic names, ReactNode values, and
component types:
- If the value is a semantic icon name string, wraps it in Icon.
- If the value is a component (function or forwardRef object), wraps it in Icon.
- Otherwise, renders the ReactNode directly.`,methods:[],displayName:`renderIconSlot`}})),x=e((()=>{b()}));export{m as i,f as n,b as r,x as t};