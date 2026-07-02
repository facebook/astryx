import{aK as S,a1 as e,a6 as b,af as T,ay as g,i as U,T as B,I as C}from"./iframe-Cm6U1NA5.js";import{c as F}from"./computeTargetAndRel-BlG0ENK0.js";import{u as P}from"./useInteractiveRole-DQXW-3r9.js";const n={base:{k1xSpc:"astryx3nfvp2",kGNEyG:"astryx6s0dn4",kOIVth:"astryx1lsbc85",kMv6JI:"astryxjb2p0i",kGuDYH:"astryx1qlqyl8",kLWn49:"astryx15bjb6t",k63SB2:"astryx1pd3egz",kybGjl:"astryx1hl2dhg astryx4ohgrr",kkrTdU:"astryx1ypdohk",k1ekBW:"astryx1mpt4pi",kIyJzY:"astryxuedmi6",kAMwcw:"astryxlr8y92",kI3sdo:"astryx17nn4n9",kInvED:"astryx1wfwxd8 astryx7s97pk",$$css:!0},buttonReset:{kWkggS:"astryxjbqb8w",ksu8eU:"astryxng3xce",kmVPX3:"astryx1717udv",kfzvcC:"astryx67bb7w",kVAEAm:"astryx1n2onr6",$$css:!0},hasUnderline:{kybGjl:"astryx1bvjpef",k1TLXF:null,kMnn75:null,kmVMDM:null,kNySMw:null,$$css:!0},disabled:{kkrTdU:"astryx1h6gzvc",kSiTet:"astryxbyyjgo",kfzvcC:"astryx47corl",$$css:!0},standalone:{kGuDYH:"astryxjm74w1",kLWn49:"astryxw6l6zx",$$css:!0}},w={primary:{kMwMTN:"astryx1tgivj0 astryx4z56r7",$$css:!0},secondary:{kMwMTN:"astryxv1l7n4 astryx7ruf5d",$$css:!0},disabled:{kMwMTN:"astryxnbbluu",$$css:!0},placeholder:{kMwMTN:"astryxv1l7n4",$$css:!0},accent:{kMwMTN:"astryxjse4m1 astryx17qfo7y",$$css:!0},inherit:{kMwMTN:"astryx1heor9g",$$css:!0}};function L({as:M,label:i,href:l,hasUnderline:o=!1,isDisabled:t=!1,isExternalLink:d=!1,newTabLabel:q="(opens in new tab)",target:E,onClick:s,tooltip:u,isStandalone:m=!1,type:j="body",size:R,weight:$,color:a="accent",display:H="inline",maxLines:A=0,children:z,rel:W,xstyle:p,className:c,style:y,ref:f,...x}){const I=S(M),h=P({href:l,onClick:s,isDisabled:t}),{target:V,rel:N}=F(d?"_blank":E,W),k=h==="button"||h==="inert"&&l==null,v=e.jsxs(e.Fragment,{children:[e.jsx(B,{type:j,size:R,weight:$,color:a,display:H,maxLines:A,children:z}),d&&!k&&e.jsxs(e.Fragment,{children:[e.jsx(C,{icon:"externalLink",size:"xsm",color:"inherit"}),e.jsx("span",{className:"astryx10l6tqk astryx1i1rx1s astryxjm9jq1 astryxkdpibf astryx1717udv astryxb3r6kr astryxzpqnlu astryxuxw1ft astryxng3xce",children:q})]})]});let r;return k?r=e.jsx("button",{ref:f,type:"button",onClick:s,"aria-label":i||void 0,"aria-disabled":t||void 0,tabIndex:t?-1:void 0,disabled:t,...b(g("link",{color:a}),T(n.base,n.buttonReset,w[a],o&&n.hasUnderline,m&&n.standalone,t&&n.disabled,p),c,y),...x,children:v}):r=e.jsx(I,{ref:f,href:l,target:V,rel:N,onClick:s,"aria-label":i||void 0,"aria-disabled":t||void 0,tabIndex:t?-1:void 0,...b(g("link",{color:a}),T(n.base,w[a],o&&n.hasUnderline,m&&n.standalone,t&&n.disabled,p),c,y),...x,children:v}),u?e.jsx(U,{content:u,placement:"above",children:r}):r}L.displayName="Link";L.__docgenInfo={description:`A styled anchor link component.

Uses Text internally for typography styling.
Wrap your app in <Theme> to apply a theme.

@example
\`\`\`
<Link href="/docs">Documentation</Link>
<Link href="https://github.com" isExternalLink>GitHub</Link>
<Link href="/settings" color="secondary">Settings</Link>
<Link href="/privacy" hasUnderline>Privacy Policy</Link>
<Link label="Close dialog" href="/home"><Icon icon="x" /></Link>

// Inline link inside text — inherits the surrounding type/size:
<Text type="large">
  Read our <Link href="/terms" type="inherit">terms</Link> first.
</Text>
\`\`\``,methods:[],displayName:"Link",props:{xstyle:{required:!1,tsType:{name:"StyleXStyles"},description:"StyleX styles created via `stylex.create()`. Merged with the component's\nbase styles inside a single `stylex.props()` call for optimal deduplication.\n\n@example\n```\nconst overrides = stylex.create({ root: { marginBottom: 8 } });\n<Component xstyle={overrides.root} />\n```"},ref:{required:!1,tsType:{name:"ReactRef",raw:"React.Ref<HTMLAnchorElement | HTMLButtonElement>",elements:[{name:"union",raw:"HTMLAnchorElement | HTMLButtonElement",elements:[{name:"HTMLAnchorElement"},{name:"HTMLButtonElement"}]}]},description:"Ref forwarded to the root element"},as:{required:!1,tsType:{name:"ElementType"},description:`Custom component to render instead of \`<a>\`.
Overrides the provider-level default set by LinkProvider.
Must accept href, className, style, and children props.
Only used when href is provided.`},label:{required:!1,tsType:{name:"string"},description:`Accessible label for the link.
Used as aria-label when content is not self-descriptive
(e.g. icon-only links). When children are text, this is
unnecessary — the link text itself serves as the label.`},href:{required:!1,tsType:{name:"string"},description:"Link destination URL.\nWhen undefined, renders as a `<button>` with link styling\nfor semantic correctness and accessibility."},hasUnderline:{required:!1,tsType:{name:"boolean"},description:`Whether the link should always display an underline.
When false, underline only appears on hover.
@default false`,defaultValue:{value:"false",computed:!1}},isDisabled:{required:!1,tsType:{name:"boolean"},description:`Whether the link is disabled.
@default false`,defaultValue:{value:"false",computed:!1}},isExternalLink:{required:!1,tsType:{name:"boolean"},description:`Whether the link opens in a new tab with an external link icon.
When true, sets target="_blank" and rel="noopener noreferrer".
@default false`,defaultValue:{value:"false",computed:!1}},newTabLabel:{required:!1,tsType:{name:"string"},description:`Screen-reader text appended to an external link to announce that it opens
in a new tab (the visual icon is decorative). Override for localization.
@default '(opens in new tab)'`,defaultValue:{value:"'(opens in new tab)'",computed:!1}},target:{required:!1,tsType:{name:"string"},description:`Where to open the linked document.
Overridden to "_blank" when isExternalLink is true.`},rel:{required:!1,tsType:{name:"string"},description:`Link relationship (e.g. "noopener noreferrer").
Automatically includes "noopener noreferrer" when isExternalLink is true.`},download:{required:!1,tsType:{name:"union",raw:"string | boolean",elements:[{name:"string"},{name:"boolean"}]},description:`Causes the browser to download the linked URL. A string value
specifies the suggested filename.`},referrerPolicy:{required:!1,tsType:{name:"ReactHTMLAttributeReferrerPolicy",raw:"React.HTMLAttributeReferrerPolicy"},description:"Referrer policy for the link."},onClick:{required:!1,tsType:{name:"ReactMouseEventHandler",raw:"React.MouseEventHandler<HTMLAnchorElement | HTMLButtonElement>",elements:[{name:"union",raw:"HTMLAnchorElement | HTMLButtonElement",elements:[{name:"HTMLAnchorElement"},{name:"HTMLButtonElement"}]}]},description:`Click handler. Fires before navigation (when href is set),
or as the primary action (when href is undefined).`},tooltip:{required:!1,tsType:{name:"string"},description:"Tooltip text to display on hover."},isStandalone:{required:!1,tsType:{name:"boolean"},description:`Whether the link is standalone (not inline within text).
Applies base font sizing when true.
@default false`,defaultValue:{value:"false",computed:!1}},type:{required:!1,tsType:{name:"union",raw:"BuiltinTextType | (keyof CustomTextTypes & string)",elements:[{name:"union",raw:`| 'body'
| 'large'
| 'label'
| 'supporting'
| 'code'
| 'display-1'
| 'display-2'
| 'display-3'
| 'inherit'`,elements:[{name:"literal",value:"'body'"},{name:"literal",value:"'large'"},{name:"literal",value:"'label'"},{name:"literal",value:"'supporting'"},{name:"literal",value:"'code'"},{name:"literal",value:"'display-1'"},{name:"literal",value:"'display-2'"},{name:"literal",value:"'display-3'"},{name:"literal",value:"'inherit'"}]},{name:"unknown"}]},description:`Semantic text type for Text. Determines base typography.

Use \`type="inherit"\` for inline links inside an existing \`Text\` element so
the link adopts the surrounding text's size and line-height instead of
imposing its own (e.g. a link within a \`large\` paragraph).
@default 'body'`,defaultValue:{value:"'body'",computed:!1}},size:{required:!1,tsType:{name:"union",raw:`| '4xs'
| '3xs'
| '2xs'
| 'xsm'
| 'sm'
| 'base'
| 'lg'
| 'xl'
| '2xl'
| '3xl'
| '4xl'`,elements:[{name:"literal",value:"'4xs'"},{name:"literal",value:"'3xs'"},{name:"literal",value:"'2xs'"},{name:"literal",value:"'xsm'"},{name:"literal",value:"'sm'"},{name:"literal",value:"'base'"},{name:"literal",value:"'lg'"},{name:"literal",value:"'xl'"},{name:"literal",value:"'2xl'"},{name:"literal",value:"'3xl'"},{name:"literal",value:"'4xl'"}]},description:"Explicit font size override. Forwarded to Text."},weight:{required:!1,tsType:{name:"union",raw:"'normal' | 'medium' | 'semibold' | 'bold'",elements:[{name:"literal",value:"'normal'"},{name:"literal",value:"'medium'"},{name:"literal",value:"'semibold'"},{name:"literal",value:"'bold'"}]},description:"Font weight override. Forwarded to Text."},color:{required:!1,tsType:{name:"union",raw:`| 'primary'
| 'secondary'
| 'disabled'
| 'placeholder'
| 'accent'
| 'inherit'`,elements:[{name:"literal",value:"'primary'"},{name:"literal",value:"'secondary'"},{name:"literal",value:"'disabled'"},{name:"literal",value:"'placeholder'"},{name:"literal",value:"'accent'"},{name:"literal",value:"'inherit'"}]},description:`Text color. Forwarded to Text.
@default 'accent'`,defaultValue:{value:"'accent'",computed:!1}},display:{required:!1,tsType:{name:"union",raw:"'inline' | 'block'",elements:[{name:"literal",value:"'inline'"},{name:"literal",value:"'block'"}]},description:`Display type for Text. Forwarded to Text.
@default 'inline'`,defaultValue:{value:"'inline'",computed:!1}},maxLines:{required:!1,tsType:{name:"number"},description:`Maximum lines before truncation. Forwarded to Text.
@default 0`,defaultValue:{value:"0",computed:!1}},children:{required:!0,tsType:{name:"ReactNode"},description:"Link content (required)."}},composes:["Omit"]};export{L};
