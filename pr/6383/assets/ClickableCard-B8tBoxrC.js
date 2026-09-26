import{i as e,s as t}from"./preload-helper-CT_b8DTk.js";import{t as n}from"./react-B7Te67-h.js";import{E as r,O as i,a,p as o}from"./ime-B2gVvZm0.js";import{B as s,f as c,i as l,n as u,r as d,t as f,u as p}from"./utils-SyZNzL9F.js";import{t as m}from"./jsx-runtime-DqZldVDK.js";import{n as h,t as g}from"./useMergedRefs-DQqXZ77v.js";import{n as _,t as v}from"./useLinkComponent-BzuBKLYd.js";import{n as y,t as b}from"./usePressFeedback-Tecq1Zyj.js";import{n as x,r as S}from"./useClickableContainer-DM3vWABO.js";import{n as C,t as w}from"./Card-lMdmSYPC.js";function T({label:e,onClick:t,onMouseUp:n,href:r,target:a,isDisabled:o=!1,children:c,padding:l,variant:u=`default`,elevation:f=`none`,width:m,height:g,maxWidth:v,ref:b,xstyle:x,className:C,style:T,...k}){let A=y(),j=(0,E.useRef)(null),M=(0,E.useRef)(null),N=_(),{onClick:P,onMouseUp:F}=S({containerRef:j,interactiveRef:M,onClick:t,href:r,target:a,disabled:o}),I=n?e=>{F(e),n(e)}:F,L=r!=null,R=u==="default";return(0,D.jsxs)(w,{ref:h(b,j),...o?void 0:A,width:m,height:g,maxWidth:v,padding:l,variant:u,elevation:f,...s(i(`clickable-card`,{variant:u}),p.focusWithin(),C,T),xstyle:[O.interactive,R?O.bordered:O.borderless,!o&&O.overlay,!o&&d.pressedAlpha,!o&&R&&O.borderedHoverOnPointer,o&&O.disabled,x],onClick:o?void 0:P,onMouseUp:o?void 0:I,...k,children:[L?(0,D.jsx)(N,{ref:M,href:r,target:a,"aria-label":e,"aria-disabled":o||void 0,tabIndex:o?-1:0,className:`astryx10l6tqk astryx1i1rx1s astryxjm9jq1 astryx1717udv astryxkdpibf astryxb3r6kr astryxzpqnlu astryxuxw1ft astryxc342km`}):(0,D.jsx)(`button`,{ref:M,type:`button`,"aria-label":e,disabled:o,onClick:t,className:`astryx10l6tqk astryx1i1rx1s astryxjm9jq1 astryx1717udv astryxkdpibf astryxb3r6kr astryxzpqnlu astryxuxw1ft astryxc342km`}),c]})}var E,D,O,k=e((()=>{E=t(n(),1),o(),f(),C(),x(),v(),r(),c(),u(),b(),g(),D=m(),`${a[`--color-overlay-pressed`]}${l[`--astryx-press-alpha`]}`,O={interactive:{kVAEAm:`astryx1n2onr6`,kkrTdU:`astryx1ypdohk astryx16khyan`,kybGjl:`astryx1hl2dhg`,k1TLXF:null,kMnn75:null,kmVMDM:null,kNySMw:null,kMwMTN:`astryx1heor9g`,$$css:!0},overlay:{"--_press-overlay":`astryx1s9pv7w astryxb8awce astryx1a5qima astryx1f4ybvx astryx1yhmp25 astryxmfmiv1 astryx1hn5ov8`,"--_press-overlay-transition":`astryx1wkyqe6 astryx13zelnn astryxkfsmh7`,k5JduY:`astryx1s928wv`,kwXMNM:`astryx1j6awrg`,kv0HGH:`astryxarstr8`,kcktkL:null,kc1e00:null,kH8aOt:null,kH8cDV:null,kLxBhq:null,kSy8m5:null,k3foIR:null,k8Iv0R:null,kloYau:`astryx2q1x1w`,kRicXK:`astryx1ywzrc5`,kPNhGg:`astryx18w5vxb`,kA8PQs:`astryx1dlmc9c`,ks3ayO:`astryx1l0fnur`,$$css:!0},borderless:{kMzoRj:`astryxc342km`,kjGldf:null,k2ei4v:null,kZ1KPB:null,ke9TFa:null,kWqL5O:null,kLoX6v:null,kEafiO:null,kt9PQ7:null,$$css:!0},bordered:{kVAM5u:`astryx14i3s5s`,kzOINU:null,kGJrpR:null,kaZRDh:null,kBCPoo:null,k26BEO:null,k5QoK5:null,kLZC3w:null,kL6WhQ:null,kZCmMZ:`astryxs19ii7`,kwRFfy:`astryx12frdag`,kE3dHu:null,kpe85a:null,kLKAdn:`astryx1nex4ik`,kGO01o:`astryxbv1mwh`,k1ekBW:`astryxshfolx`,kIyJzY:`astryxuedmi6`,kAMwcw:`astryxlr8y92`,$$css:!0},borderedHoverOnPointer:{kpsWHe:`astryx1xwh4np`,knI2L8:null,k5e8XW:null,kRmBty:null,k2eSRm:null,kHQjef:null,kGSl04:null,kNb4fV:null,kiTKoU:null,$$css:!0},disabled:{kkrTdU:`astryxt0e3qv`,kSiTet:`astryxbyyjgo`,$$css:!0}},T.displayName=`ClickableCard`,T.__docgenInfo={description:`An interactive card that acts as a single navigation or action target.

Composes Card for visual styling and adds an interactive layer
with useClickableContainer. Nested interactive elements (buttons,
links, inputs) work independently — clicking them does NOT trigger
the card's onClick or navigation.

A visually-hidden <button> or <a> inside the card provides the
accessible role and label. The card surface is a plain <div> —
no role or tabIndex on the container.

@compositionHint Use for cards that navigate to a detail page or trigger an action.
For toggle selection cards, use SelectableCard instead.
Nest Button or other interactive elements freely inside — they won't conflict.

@example
\`\`\`
<ClickableCard label="Settings" href="/settings">
  <Text type="body" weight="bold">Settings</Text>
  <Text type="supporting" color="secondary">Manage your preferences</Text>
</ClickableCard>
\`\`\`

@example
\`\`\`
<ClickableCard label="Open modal" onClick={() => setShowModal(true)}>
  <Text type="body">Click anywhere to open</Text>
  <Button label="Other action" onClick={handleOther} />
</ClickableCard>
\`\`\``,methods:[],displayName:`ClickableCard`,props:{xstyle:{required:!1,tsType:{name:`StyleXStyles`},description:"StyleX styles created via `stylex.create()`. Merged with the component's\nbase styles inside a single `stylex.props()` call for optimal deduplication.\n\n@example\n```\nconst overrides = stylex.create({ root: { marginBottom: 8 } });\n<Component xstyle={overrides.root} />\n```"},ref:{required:!1,tsType:{name:`Ref`,elements:[{name:`HTMLDivElement`}],raw:`Ref<HTMLDivElement>`},description:`Ref forwarded to the root element.`},label:{required:!0,tsType:{name:`string`},description:`Accessibility label for the card.
Used as \`aria-label\` — provides the accessible name for screen readers.
When the card has visible text that serves as its label, prefer
passing that text here so the screen reader announcement matches.`},onClick:{required:!1,tsType:{name:`signature`,type:`function`,raw:`(event: MouseEvent<HTMLElement>) => void`,signature:{arguments:[{type:{name:`MouseEvent`,elements:[{name:`HTMLElement`}],raw:`MouseEvent<HTMLElement>`},name:`event`}],return:{name:`void`}}},description:`Click handler. Fires when the card surface is clicked
(not when nested interactive elements are clicked).`},href:{required:!1,tsType:{name:`string`},description:`Navigation URL. When provided, clicking the card navigates to this URL.
Ctrl/Cmd+click opens in a new tab.`},target:{required:!1,tsType:{name:`string`},description:`Link target for href navigation.
@default '_self'`},isDisabled:{required:!1,tsType:{name:`boolean`},description:`Set to true to disable the card.
Disabled cards remain focusable (tabIndex 0) with aria-disabled
so screen reader users can discover them.`,defaultValue:{value:`false`,computed:!1}},children:{required:!1,tsType:{name:`ReactNode`},description:`Content to render inside the card.
Can include nested interactive elements (buttons, links) — they will
work independently from the card's click/navigation behavior.`},padding:{required:!1,tsType:{name:`union`,raw:`0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10`,elements:[{name:`literal`,value:`0`},{name:`literal`,value:`0.5`},{name:`literal`,value:`1`},{name:`literal`,value:`1.5`},{name:`literal`,value:`2`},{name:`literal`,value:`3`},{name:`literal`,value:`4`},{name:`literal`,value:`5`},{name:`literal`,value:`6`},{name:`literal`,value:`8`},{name:`literal`,value:`10`}]},description:`Internal padding of the card using the spacing scale.
@default 4 (16px)`},variant:{required:!1,tsType:{name:`CardVariantMap`},description:`Background color variant.
@default 'default'`,defaultValue:{value:`'default'`,computed:!1}},elevation:{required:!1,tsType:{name:`union`,raw:`'none' | 'low' | 'med' | 'high'`,elements:[{name:`literal`,value:`'none'`},{name:`literal`,value:`'low'`},{name:`literal`,value:`'med'`},{name:`literal`,value:`'high'`}]},description:`Resting elevation — the shadow depth the card sits at. Often raised to
signal that the whole card is clickable.
@default 'none'`,defaultValue:{value:`'none'`,computed:!1}},width:{required:!1,tsType:{name:`union`,raw:`number | string`,elements:[{name:`number`},{name:`string`}]},description:`Width of the card.`},height:{required:!1,tsType:{name:`union`,raw:`number | string`,elements:[{name:`number`},{name:`string`}]},description:`Height of the card.`},maxWidth:{required:!1,tsType:{name:`union`,raw:`number | string`,elements:[{name:`number`},{name:`string`}]},description:`Maximum width of the card.`}},composes:[`Omit`]}}));export{k as n,T as t};