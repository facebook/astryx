import{i as e,s as t}from"./preload-helper-CT_b8DTk.js";import{t as n}from"./react-B7Te67-h.js";import{E as r,O as i}from"./ime-B2gVvZm0.js";import{B as a,f as o,n as s,r as c,t as l,u}from"./utils-SyZNzL9F.js";import{t as d}from"./jsx-runtime-DqZldVDK.js";import{t as f}from"./Text-DTzAYTJM.js";import{l as p,t as m}from"./i18n-Cv4NuHz3.js";import{n as h,t as g}from"./VisuallyHidden-DDrJpIxj.js";import{n as _,t as v}from"./useLinkComponent-BzuBKLYd.js";import{n as y,t as b}from"./usePressFeedback-Tecq1Zyj.js";import{t as x}from"./Icon-LMTcUKwK.js";import{t as S}from"./Icon-Dzf1rqTo.js";import{t as C}from"./Tooltip-qd8BDGNM.js";import{t as w}from"./Tooltip-fmzsZ8AL.js";import{n as T,t as E}from"./useInteractiveRole-B5MO4lBH.js";import{n as D,t as O}from"./computeTargetAndRel-BO1nqV90.js";import{t as k}from"./Text-CYSpiVrf.js";function A(e){e.preventDefault()}function j({as:e,label:t,href:n,hasUnderline:r=!1,isDisabled:o=!1,isExternalLink:s=!1,newTabLabel:l,target:d,onClick:m,tooltip:g,isStandalone:v=!1,type:b=`body`,size:S,weight:w,color:E=`accent`,display:D=`inline`,maxLines:k=0,children:j,rel:F,xstyle:I,className:L,style:R,ref:z,...B}){let V=y(),H=p(),U=l??H(`@astryx.link.newTab`),W=_(e),G=T({href:n,onClick:m,isDisabled:o}),{target:K,rel:q}=O(s?`_blank`:d,F),J=G===`button`||G===`inert`&&n==null,Y=(0,M.jsxs)(M.Fragment,{children:[(0,M.jsx)(f,{type:b,size:S,weight:w,color:E,display:D,maxLines:k,children:j}),s&&!J&&(0,M.jsxs)(M.Fragment,{children:[(0,M.jsx)(x,{icon:`externalLink`,size:`xsm`,color:`inherit`}),(0,M.jsx)(h,{children:U})]})]}),X;return X=J?(0,M.jsx)(`button`,{ref:z,type:`button`,onClick:m,...o?void 0:V,"aria-label":t||void 0,"aria-disabled":o||void 0,tabIndex:o?-1:void 0,disabled:o,...a(i(`link`,{color:E}),u.focusVisible(N.base,N.buttonReset,P[E],!o&&c.pressedBackgroundColor,r&&N.hasUnderline,v&&N.standalone,o&&N.disabled,I),L,R),...B,children:Y}):o?(0,M.jsx)(`a`,{ref:z,onClick:A,"aria-label":t||void 0,"aria-disabled":!0,tabIndex:-1,...a(i(`link`,{color:E}),u.focusVisible(N.base,P[E],r&&N.hasUnderline,v&&N.standalone,N.disabled,I),L,R),...B,children:Y}):(0,M.jsx)(W,{ref:z,href:n,target:K,rel:q,onClick:m,...o?void 0:V,"aria-label":t||void 0,"aria-disabled":o||void 0,tabIndex:o?-1:void 0,...a(i(`link`,{color:E}),u.focusVisible(N.base,P[E],!o&&c.pressedBackgroundColor,r&&N.hasUnderline,v&&N.standalone,o&&N.disabled,I),L,R),...B,children:Y}),g?(0,M.jsx)(C,{content:g,placement:`above`,children:X}):X}var M,N,P,F=e((()=>{S(),w(),k(),g(),v(),l(),D(),E(),r(),o(),s(),b(),m(),M=d(),N={base:{k1xSpc:`astryx3nfvp2`,kGNEyG:`astryx6s0dn4`,kOIVth:`astryx1lsbc85`,khm7nJ:null,k1C7PZ:null,kMv6JI:`astryxjb2p0i`,kGuDYH:`astryx1qlqyl8`,kLWn49:`astryx15bjb6t`,k63SB2:`astryx1pd3egz`,kybGjl:`astryx1hl2dhg astryx13nosk6`,k1TLXF:null,kMnn75:null,kmVMDM:null,kNySMw:null,kkrTdU:`astryx1ypdohk astryx16khyan`,k1ekBW:`astryx1mpt4pi`,kIyJzY:`astryxuedmi6`,kAMwcw:`astryxlr8y92`,$$css:!0},buttonReset:{kWkggS:`astryxjbqb8w`,ksu8eU:`astryxng3xce`,kJRH4f:null,kVhnKS:null,k4WBpm:null,k8ry5P:null,kSWEuD:null,kDUl1X:null,kPef9Z:null,kfdmCh:null,kmVPX3:`astryx1717udv`,kg3NbH:null,kuDDbn:null,kE3dHu:null,kP0aTx:null,kpe85a:null,k8WAf4:null,kLKAdn:null,kGO01o:null,kfzvcC:`astryx67bb7w`,kVAEAm:`astryx1n2onr6`,$$css:!0},hasUnderline:{kybGjl:`astryx1bvjpef`,k1TLXF:null,kMnn75:null,kmVMDM:null,kNySMw:null,$$css:!0},disabled:{kkrTdU:`astryxt0e3qv`,kSiTet:`astryxbyyjgo`,kfzvcC:`astryx47corl`,$$css:!0},standalone:{kGuDYH:`astryxjm74w1`,kLWn49:`astryxw6l6zx`,$$css:!0}},P={primary:{kMwMTN:`astryx1tgivj0 astryxcunlro`,$$css:!0},secondary:{kMwMTN:`astryxv1l7n4 astryx7jm8ul`,$$css:!0},disabled:{kMwMTN:`astryxnbbluu`,$$css:!0},placeholder:{kMwMTN:`astryxv1l7n4`,$$css:!0},accent:{kMwMTN:`astryxjse4m1 astryx1rfoswn`,$$css:!0},inherit:{kMwMTN:`astryx1heor9g`,$$css:!0}},j.displayName=`Link`,j.__docgenInfo={description:`A styled anchor link component.

Uses Text internally for typography styling.
Wrap your app in <Theme> to apply a theme.

@example
\`\`\`
<Link href="/docs">Documentation</Link>
<Link href="https://github.com" isExternalLink>GitHub</Link>
<Link href="/settings" color="secondary">Settings</Link>
<Link href="/privacy" hasUnderline>Privacy Policy</Link>
<Link label="Close dialog" href="/home"><Icon icon="x" /></Link>
<Text type="large">
  Read our <Link href="/terms" type="inherit">terms</Link> first.
</Text>
\`\`\``,methods:[],displayName:`Link`,props:{xstyle:{required:!1,tsType:{name:`StyleXStyles`},description:"StyleX styles created via `stylex.create()`. Merged with the component's\nbase styles inside a single `stylex.props()` call for optimal deduplication.\n\n@example\n```\nconst overrides = stylex.create({ root: { marginBottom: 8 } });\n<Component xstyle={overrides.root} />\n```"},ref:{required:!1,tsType:{name:`ReactRef`,raw:`React.Ref<HTMLAnchorElement | HTMLButtonElement>`,elements:[{name:`union`,raw:`HTMLAnchorElement | HTMLButtonElement`,elements:[{name:`HTMLAnchorElement`},{name:`HTMLButtonElement`}]}]},description:`Ref forwarded to the root element`},as:{required:!1,tsType:{name:`ElementType`},description:`Custom component to render instead of \`<a>\`.
Overrides the provider-level default set by LinkProvider.
Must accept href, className, style, and children props.
Only used when href is provided.`},label:{required:!1,tsType:{name:`string`},description:`Accessible label for the link.
Used as aria-label when content is not self-descriptive
(e.g. icon-only links). When children are text, this is
unnecessary — the link text itself serves as the label.`},href:{required:!1,tsType:{name:`string`},description:`Link destination URL.
When undefined, renders as a \`<button>\` with link styling
for semantic correctness and accessibility.`},hasUnderline:{required:!1,tsType:{name:`boolean`},description:`Whether the link should always display an underline.
When false, underline only appears on hover.
@default false`,defaultValue:{value:`false`,computed:!1}},isDisabled:{required:!1,tsType:{name:`boolean`},description:`Whether the link is disabled.
A disabled link renders as a plain anchor without an href (and without
target/rel/onClick), so it cannot be focused or activated — no
navigation and no onClick, even via programmatic focus or assistive
technology activation.
@default false`,defaultValue:{value:`false`,computed:!1}},isExternalLink:{required:!1,tsType:{name:`boolean`},description:`Whether the link opens in a new tab with an external link icon.
When true, sets target="_blank" and rel="noopener noreferrer".
@default false`,defaultValue:{value:`false`,computed:!1}},newTabLabel:{required:!1,tsType:{name:`string`},description:`Screen-reader text appended to an external link to announce that it opens
in a new tab (the visual icon is decorative). Override for localization.
@default '(opens in new tab)'`},target:{required:!1,tsType:{name:`string`},description:`Where to open the linked document.
Overridden to "_blank" when isExternalLink is true.`},rel:{required:!1,tsType:{name:`string`},description:`Link relationship (e.g. "noopener noreferrer").
Automatically includes "noopener noreferrer" when isExternalLink is true.`},download:{required:!1,tsType:{name:`union`,raw:`string | boolean`,elements:[{name:`string`},{name:`boolean`}]},description:`Causes the browser to download the linked URL. A string value
specifies the suggested filename.`},referrerPolicy:{required:!1,tsType:{name:`ReactHTMLAttributeReferrerPolicy`,raw:`React.HTMLAttributeReferrerPolicy`},description:`Referrer policy for the link.`},onClick:{required:!1,tsType:{name:`ReactMouseEventHandler`,raw:`React.MouseEventHandler<HTMLAnchorElement | HTMLButtonElement>`,elements:[{name:`union`,raw:`HTMLAnchorElement | HTMLButtonElement`,elements:[{name:`HTMLAnchorElement`},{name:`HTMLButtonElement`}]}]},description:`Click handler. Fires before navigation (when href is set),
or as the primary action (when href is undefined).`},tooltip:{required:!1,tsType:{name:`string`},description:`Tooltip text to display on hover.`},isStandalone:{required:!1,tsType:{name:`boolean`},description:`Whether the link is standalone (not inline within text).
Applies base font sizing when true.
@default false`,defaultValue:{value:`false`,computed:!1}},type:{required:!1,tsType:{name:`union`,raw:`BuiltinTextType | (keyof CustomTextTypes & string)`,elements:[{name:`union`,raw:`| 'body'
| 'large'
| 'label'
| 'supporting'
| 'code'
| 'display-1'
| 'display-2'
| 'display-3'
| 'inherit'`,elements:[{name:`literal`,value:`'body'`},{name:`literal`,value:`'large'`},{name:`literal`,value:`'label'`},{name:`literal`,value:`'supporting'`},{name:`literal`,value:`'code'`},{name:`literal`,value:`'display-1'`},{name:`literal`,value:`'display-2'`},{name:`literal`,value:`'display-3'`},{name:`literal`,value:`'inherit'`}]},{name:`unknown`}]},description:`Semantic text type for Text. Determines base typography.

Use \`type="inherit"\` for inline links inside an existing \`Text\` element so
the link adopts the surrounding text's size and line-height instead of
imposing its own (e.g. a link within a \`large\` paragraph).
@default 'body'`,defaultValue:{value:`'body'`,computed:!1}},size:{required:!1,tsType:{name:`union`,raw:`| '4xs'
| '3xs'
| '2xs'
| 'xsm'
| 'sm'
| 'base'
| 'lg'
| 'xl'
| '2xl'
| '3xl'
| '4xl'`,elements:[{name:`literal`,value:`'4xs'`},{name:`literal`,value:`'3xs'`},{name:`literal`,value:`'2xs'`},{name:`literal`,value:`'xsm'`},{name:`literal`,value:`'sm'`},{name:`literal`,value:`'base'`},{name:`literal`,value:`'lg'`},{name:`literal`,value:`'xl'`},{name:`literal`,value:`'2xl'`},{name:`literal`,value:`'3xl'`},{name:`literal`,value:`'4xl'`}]},description:`Explicit font size override. Forwarded to Text.`},weight:{required:!1,tsType:{name:`union`,raw:`'normal' | 'medium' | 'semibold' | 'bold'`,elements:[{name:`literal`,value:`'normal'`},{name:`literal`,value:`'medium'`},{name:`literal`,value:`'semibold'`},{name:`literal`,value:`'bold'`}]},description:`Font weight override. Forwarded to Text.`},color:{required:!1,tsType:{name:`TextColorMap`},description:`Text color. Forwarded to Text.
@default 'accent'`,defaultValue:{value:`'accent'`,computed:!1}},display:{required:!1,tsType:{name:`union`,raw:`'inline' | 'block'`,elements:[{name:`literal`,value:`'inline'`},{name:`literal`,value:`'block'`}]},description:`Display type for Text. Forwarded to Text.
@default 'inline'`,defaultValue:{value:`'inline'`,computed:!1}},maxLines:{required:!1,tsType:{name:`number`},description:`Maximum lines before truncation. Forwarded to Text.
@default 0`,defaultValue:{value:`0`,computed:!1}},children:{required:!0,tsType:{name:`ReactNode`},description:`Link content (required).`}},composes:[`Omit`]}}));function I(e,t){let n=[];for(let r of t){let t=new RegExp(r.pattern.source,r.pattern.flags),i;for(;(i=t.exec(e))!==null;)n.push({start:i.index,end:i.index+i[0].length,href:r.href(i),label:r.label?r.label(i):i[0],isExternal:r.isExternal??!1})}n.sort((e,t)=>e.start-t.start);let r=[],i=0;for(let e of n)e.start>=i&&(r.push(e),i=e.end);return r}function L(e,t){let{patterns:n,hasBuiltins:r=!0}=t??{},i=(0,R.useMemo)(()=>{let e=[];return n&&e.push(...n),r&&e.push(...B),e},[n,r]);return(0,R.useMemo)(()=>{if(i.length===0||e.length===0)return[e];let t=I(e,i);if(t.length===0)return[e];let n=[],r=0;for(let i=0;i<t.length;i++){let a=t[i];a.start>r&&n.push(e.slice(r,a.start)),n.push((0,z.jsx)(j,{href:a.href,isExternalLink:a.isExternal,children:a.label},`linkify-${i}`)),r=a.end}return r<e.length&&n.push(e.slice(r)),n},[e,i])}var R,z,B,V=e((()=>{R=t(n(),1),F(),z=d(),B=[{pattern:/https?:\/\/[^\s<>'")\]},]+/g,href:e=>e[0],isExternal:!0},{pattern:/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,href:e=>`mailto:${e[0]}`}]})),H=e((()=>{F(),V()}));export{F as a,j as i,V as n,L as r,H as t};