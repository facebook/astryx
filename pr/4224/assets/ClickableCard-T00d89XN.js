import{a as e,n as t}from"./rolldown-runtime-DaJ6WEGw.js";import{t as n}from"./react-DvlgmmzG.js";import{n as r,t as i}from"./themeProps-DlHa58hS.js";import{_ as a,t as o,y as s}from"./utils-SBEvDdeo.js";import{t as c}from"./jsx-runtime-cM__dR4X.js";import{n as l,t as u}from"./useLinkComponent-Dl8JzLt2.js";import{n as d,t as f}from"./Card-CpjcShRF.js";import{n as p,r as m}from"./useClickableContainer-K6GXlCml.js";function h({label:e,onClick:t,onMouseUp:n,href:i,target:o,isDisabled:c=!1,children:u,padding:d,variant:p=`default`,elevation:h=`none`,width:y,height:b,maxWidth:x,ref:S,xstyle:C,className:w,style:T,...E}){let D=(0,g.useRef)(null),O=(0,g.useRef)(null),k=l(),{onClick:A,onMouseUp:j}=m({containerRef:D,interactiveRef:O,onClick:t,href:i,target:o,disabled:c}),M=n?e=>{j(e),n(e)}:j,N=i!=null,P=p==="default";return(0,_.jsxs)(f,{ref:a(S,D),width:y,height:b,maxWidth:x,padding:d,variant:p,elevation:h,...s(r(`clickable-card`,{variant:p}),{className:w,style:T}),xstyle:[v.interactive,v.focusWithin,P?v.bordered:v.borderless,!c&&v.overlay,!c&&v.hoverOnPointer,!c&&P&&v.borderedHoverOnPointer,c&&v.disabled,C],onClick:c?void 0:A,onMouseUp:c?void 0:M,...E,children:[N?(0,_.jsx)(k,{ref:O,href:i,target:o,"aria-label":e,"aria-disabled":c||void 0,tabIndex:c?-1:0,className:`astryx10l6tqk astryx1i1rx1s astryxjm9jq1 astryx1717udv astryxkdpibf astryxb3r6kr astryxzpqnlu astryxuxw1ft astryxc342km`}):(0,_.jsx)(`button`,{ref:O,type:`button`,"aria-label":e,disabled:c,onClick:t,className:`astryx10l6tqk astryx1i1rx1s astryxjm9jq1 astryx1717udv astryxkdpibf astryxb3r6kr astryxzpqnlu astryxuxw1ft astryxc342km`}),u]})}var g,_,v,y=t((()=>{g=e(n(),1),o(),d(),p(),u(),i(),_=c(),v={interactive:{kVAEAm:`astryx1n2onr6`,kkrTdU:`astryx1ypdohk`,kybGjl:`astryx1hl2dhg`,k1TLXF:null,kMnn75:null,kmVMDM:null,kNySMw:null,kMwMTN:`astryx1heor9g`,kInvED:`astryx1hl8ikr`,$$css:!0},focusWithin:{kRYL1X:`astryx1irc7jg`,kry4t4:null,kf5QHk:null,kuo1qL:null,koJ47v:`astryxdjuwb3`,$$css:!0},overlay:{k5JduY:`astryx1s928wv`,kwXMNM:`astryx1j6awrg`,kv0HGH:`astryxarstr8`,kcktkL:null,kc1e00:null,kH8aOt:null,kH8cDV:null,kLxBhq:null,kSy8m5:null,k3foIR:null,k8Iv0R:null,kloYau:`astryx2q1x1w`,kRicXK:`astryx1ywzrc5`,kPNhGg:`astryx97pup0`,kA8PQs:`astryx1dlmc9c`,ks3ayO:`astryxyhc2n1`,kAcZsS:`astryxotisz4`,$$css:!0},hoverOnPointer:{kJs8I2:`astryx1vwwndy`,$$css:!0},borderless:{kMzoRj:`astryxc342km`,kjGldf:null,k2ei4v:null,kZ1KPB:null,ke9TFa:null,kWqL5O:null,kLoX6v:null,kEafiO:null,kt9PQ7:null,$$css:!0},bordered:{kVAM5u:`astryx14i3s5s`,kzOINU:null,kGJrpR:null,kaZRDh:null,kBCPoo:null,k26BEO:null,k5QoK5:null,kLZC3w:null,kL6WhQ:null,kZCmMZ:`astryxs19ii7`,kwRFfy:`astryx12frdag`,kE3dHu:null,kpe85a:null,kLKAdn:`astryx1nex4ik`,kGO01o:`astryxbv1mwh`,k1ekBW:`astryxshfolx`,kIyJzY:`astryxuedmi6`,kAMwcw:`astryxlr8y92`,$$css:!0},borderedHoverOnPointer:{kbt25U:`astryx1ww4t2b`,k9SbgR:null,kLpMmY:null,kxkfIg:null,k41OOK:null,k6cbTu:null,kllfP8:null,kaqb0e:null,kYsjTm:null,$$css:!0},disabled:{kkrTdU:`astryx1h6gzvc`,kSiTet:`astryxbyyjgo`,$$css:!0}},h.displayName=`ClickableCard`,h.__docgenInfo={description:`An interactive card that acts as a single navigation or action target.

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
@default 4 (16px)`},variant:{required:!1,tsType:{name:`union`,raw:`| 'default'
| 'transparent'
| 'muted'
| 'blue'
| 'cyan'
| 'gray'
| 'green'
| 'orange'
| 'pink'
| 'purple'
| 'red'
| 'teal'
| 'yellow'`,elements:[{name:`literal`,value:`'default'`},{name:`literal`,value:`'transparent'`},{name:`literal`,value:`'muted'`},{name:`literal`,value:`'blue'`},{name:`literal`,value:`'cyan'`},{name:`literal`,value:`'gray'`},{name:`literal`,value:`'green'`},{name:`literal`,value:`'orange'`},{name:`literal`,value:`'pink'`},{name:`literal`,value:`'purple'`},{name:`literal`,value:`'red'`},{name:`literal`,value:`'teal'`},{name:`literal`,value:`'yellow'`}]},description:`Background color variant.
@default 'default'`,defaultValue:{value:`'default'`,computed:!1}},elevation:{required:!1,tsType:{name:`union`,raw:`'none' | 'low' | 'med' | 'high'`,elements:[{name:`literal`,value:`'none'`},{name:`literal`,value:`'low'`},{name:`literal`,value:`'med'`},{name:`literal`,value:`'high'`}]},description:`Resting elevation — the shadow depth the card sits at. Often raised to
signal that the whole card is clickable.
@default 'none'`,defaultValue:{value:`'none'`,computed:!1}},width:{required:!1,tsType:{name:`union`,raw:`number | string`,elements:[{name:`number`},{name:`string`}]},description:`Width of the card.`},height:{required:!1,tsType:{name:`union`,raw:`number | string`,elements:[{name:`number`},{name:`string`}]},description:`Height of the card.`},maxWidth:{required:!1,tsType:{name:`union`,raw:`number | string`,elements:[{name:`number`},{name:`string`}]},description:`Maximum width of the card.`}},composes:[`Omit`]}})),b=t((()=>{y()}));export{h as n,y as r,b as t};