import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{t}from"./react-BZJXY1be.js";import{n,t as r}from"./stylex-Dft6gtPK.js";import{n as i}from"./mergeProps-JRyAvMxc.js";import{n as a}from"./mergeRefs-CPqjs56a.js";import{n as o,t as s}from"./themeProps-CREkzZh6.js";import{n as c,t as l}from"./Text-BfjtEFtP.js";import{t as u}from"./jsx-runtime-DeHZSEgm.js";import{n as d,t as f}from"./useLinkComponent-DvgS1IvL.js";import{n as p,t as m}from"./useTranslator-BMnme3me.js";import{n as h,t as g}from"./useIsomorphicLayoutEffect-vnms8l8s.js";import{n as _,t as v}from"./useListFocus-C3PMl9Zf.js";import{n as y,t as b}from"./Badge-QS1Y3zur.js";import{n as x,t as S}from"./Heading-CaMVckJS.js";import{i as C,n as ee,r as te,t as w}from"./Markdown-DFqNxorh.js";function ne(e){let t=e?.parentElement??null;for(;t!=null;){let e=window.getComputedStyle(t).overflowY;if((e===`auto`||e===`scroll`||e===`overlay`)&&t.scrollHeight>t.clientHeight)return t;t=t.parentElement}return null}function re(e){return Number.parseFloat(window.getComputedStyle(e).scrollMarginTop)||0}function ie(e){return e==null?0:e.getBoundingClientRect().top}function T(e,t,n){return ie(t)+n+re(e)}function ae(e,t,n,r){if(r===0){e.scrollIntoView({behavior:`smooth`,block:`start`});return}let i=e.getBoundingClientRect().top-T(e,t,r);n.scrollBy({top:i,behavior:`smooth`})}function E(e,t,n){if(e.length===0)return;if(t==null?window.innerHeight+window.scrollY>=document.documentElement.scrollHeight-2:t.scrollTop+t.clientHeight>=t.scrollHeight-2)return e[e.length-1].id;let r=e[0].id;for(let i of e){let e=document.getElementById(i.id);if(e!=null)if(e.getBoundingClientRect().top<=T(e,t,n)+1)r=i.id;else break}return r}function oe({activeId:e,items:t,onActiveIdChange:n,rootRef:r,offset:i=0,scrollContainerRef:a,hasScrollOnClick:o=!0,onNavigateStart:s,onNavigateEnd:c}){let l=e!==void 0,[u,d]=(0,D.useState)(t[0]?.id),f=(0,D.useRef)(e),p=(0,D.useRef)(!1),m=(0,D.useRef)(null),h=(0,D.useRef)(null),g=(0,D.useRef)(t);g.current=t;let _=(0,D.useRef)(n);_.current=n;let v=t.map(e=>e.id).join(`
`);f.current=l?e:u;let y=(0,D.useCallback)(()=>a?.current??ne(r.current),[r,a]);(0,D.useEffect)(()=>{if(l||typeof window>`u`)return;let e=y(),t=e??window,n=0,r=()=>{if(n=0,p.current)return;let t=E(g.current,e,i);t!=null&&t!==f.current&&(f.current=t,d(t),_.current?.(t))},a=()=>{n===0&&(n=requestAnimationFrame(r))};return h.current=r,r(),t.addEventListener(`scroll`,a,{passive:!0}),window.addEventListener(`resize`,a,{passive:!0}),()=>{h.current=null,t.removeEventListener(`scroll`,a),window.removeEventListener(`resize`,a),n!==0&&cancelAnimationFrame(n)}},[l,v,i,y]),(0,D.useEffect)(()=>()=>{m.current?.teardown()},[]);let b=e=>{l||d(e),n?.(e)};return{activeId:l?e:u,setActiveId:b,scrollTo:e=>{let t=typeof document<`u`?document.getElementById(e):null;if(t==null)return!1;m.current?.supersede(),s?.(e),l?b(e):p.current=!0;let n=y(),r=n??window,a=0,u=!1,g=()=>{r.removeEventListener(`scrollend`,x),r.removeEventListener(`wheel`,S),r.removeEventListener(`touchmove`,S),window.removeEventListener(`keydown`,C),a!==0&&(clearTimeout(a),a=0),m.current=null},v=(t,n=!0)=>{u||(u=!0,g(),l||(p.current=!1,t?(d(e),f.current=e,_.current?.(e)):n&&h.current?.()),c?.(e))},x=()=>v(!0),S=()=>v(!1),C=e=>{!e.defaultPrevented&&k.has(e.key)&&v(!1)};return o?(r.addEventListener(`scrollend`,x,{once:!0}),r.addEventListener(`wheel`,S,{passive:!0}),r.addEventListener(`touchmove`,S,{passive:!0}),window.addEventListener(`keydown`,C),a=window.setTimeout(x,O),m.current={supersede:()=>v(!1,!1),teardown:g},ae(t,n,r,i)):v(!0),!0}}}var D,O,k;function A(){return(A=e((()=>{D=t(),O=1200,k=new Set([`ArrowUp`,`ArrowDown`,`PageUp`,`PageDown`,`Home`,`End`,` `,`Spacebar`])})))()}function se(e){switch(Math.max(1,Math.min(4,e-1||1))){case 1:return P.level1;case 2:return P.level2;case 3:return P.level3;default:return P.level4}}function j({items:e,activeId:t,onActiveIdChange:r,label:s,density:c=`default`,onNavigateStart:l,onNavigateEnd:u,offset:f=0,scrollContainerRef:m,hasScrollOnClick:g=!0,xstyle:v,className:y,style:b,ref:x,"data-testid":S,...C}){let ee=p(),te=s??ee(`@astryx.outline.label`),w=(0,ce.useRef)(null),ne=d(),{activeId:re,scrollTo:ie}=oe({activeId:t,items:e,onActiveIdChange:r,rootRef:w,offset:f,scrollContainerRef:m,hasScrollOnClick:g,onNavigateStart:l,onNavigateEnd:u}),{listRef:T,handleKeyDown:ae,handleFocus:E}=_({itemSelector:`a[href]`,orientation:`vertical`,hasRovingTabIndex:!0});h(()=>{let e=T.current;if(e==null||e.contains(document.activeElement))return;let t=Array.from(e.querySelectorAll(`a[href]`)),n=t.find(e=>e.getAttribute(`aria-current`)===`location`);if(n!=null)for(let e of t){let t=e===n?`0`:`-1`;e.getAttribute(`tabindex`)!==t&&e.setAttribute(`tabindex`,t)}});let D=e=>{ie(e)&&window.history.pushState(null,``,`#${e}`)},O=e=>e.metaKey||e.altKey||e.ctrlKey||e.shiftKey,k=e=>t=>{t.defaultPrevented||O(t)||document.getElementById(e)!=null&&(t.preventDefault(),D(e))},A=e=>t=>{(t.key===` `||t.key===`Spacebar`)&&(t.defaultPrevented||O(t)||(t.preventDefault(),D(e)))};return(0,M.jsxs)(`nav`,{...C,ref:a(w,x),"aria-label":te,"data-testid":S,...i(o(`outline`,{density:c}),n(N.root,v),y,b),children:[(0,M.jsx)(`ul`,{className:`astryx78zum5 astryxdt5ytf astryx1lsbc85 astryx1ghz6dp astryx1717udv astryxe8uvvx astryx98rzlu astryxeuugli`,ref:T,role:`list`,onKeyDown:ae,onFocus:E,children:e.map(e=>{let t=e.id===re;return(0,M.jsx)(`li`,{className:`astryx3ct3a4 astryx1ghz6dp astryx1717udv`,role:`listitem`,children:(0,M.jsx)(ne,{href:`#${e.id}`,"aria-current":t?`location`:void 0,onClick:k(e.id),onKeyDown:A(e.id),...i(o(`outline-item`,{active:t?`active`:null,level:e.level}),n(N.link,le[c],se(e.level),t&&N.activeLink,t&&N.activeAnchor)),children:(0,M.jsx)(`span`,{className:`astryxb3r6kr astryxlyipyv astryxuxw1ft`,children:e.label})})},e.id)})}),(0,M.jsx)(`div`,{className:`astryx1n2onr6 astryxfo62xy astryx2lah0s astryx1clqncf`,"aria-hidden":`true`,children:(0,M.jsx)(`span`,{className:`astryx10l6tqk astryx13vifvy astryx1ey2m1c astryx1o0tod astryxfo62xy astryx1m4xfpy astryxjspbzw astryx47corl`})}),(0,M.jsx)(`span`,{...i(o(`outline-indicator`),{className:`astryx10l6tqk astryx1o0tod astryxfo62xy astryxowkcby astryxjspbzw astryx47corl astryx1vjfegm astryx1tsffl5 astryx1ltwjim astryx1qjb5ga astryx1xuz8iz astryxkvfbh3 astryxlr8y92`}),"aria-hidden":`true`})]})}var ce,M,N,le,P;function ue(){return(ue=e((()=>{ce=t(),r(),f(),v(),g(),A(),s(),m(),M=u(),N={root:{k1xSpc:`astryx78zum5`,kXwgrk:`astryx1q0g3np`,kVAEAm:`astryx1n2onr6`,kOIVth:`astryx1lsbc85`,kzqmXN:`astryxh8yej3`,$$css:!0},activeAnchor:{k48fcG:`astryx7dpabl`,$$css:!0},link:{kGNEyG:`astryx6s0dn4`,kaIpWk:`astryxh6dtrn`,kB7OPa:`astryx9f619`,kMwMTN:`astryxv1l7n4`,kkrTdU:`astryx1ypdohk`,k1xSpc:`astryx78zum5`,k63SB2:`astryx1sodnla`,kI3sdo:`astryx1a2a7pz`,kVAEAm:`astryx1n2onr6`,k9WMMc:`astryx1yc453h`,kybGjl:`astryx1hl2dhg`,kIyJzY:`astryxuedmi6`,k1ekBW:`astryxs2xxs2`,kAMwcw:`astryxlr8y92`,kzqmXN:`astryxh8yej3`,kGuDYH:`astryxjm74w1`,kLWn49:`astryxw6l6zx`,kHE3J0:`astryxe9uy6x`,krNwJM:`astryx140uwzg`,kSReZ0:`astryxyxi2l3`,k3Woio:`astryx17nn4n9`,kiEn40:`astryx7s97pk`,$$css:!0},activeLink:{kMwMTN:`astryx1tgivj0`,k63SB2:`astryx2mo6ok`,$$css:!0}},le={compact:{k8WAf4:`astryxu0wf1k`,kLKAdn:null,kGO01o:null,kwRFfy:`astryx1djylfy`,kE3dHu:null,kpe85a:null,$$css:!0},default:{k8WAf4:`astryxce4md1`,kLKAdn:null,kGO01o:null,kwRFfy:`astryx1djylfy`,kE3dHu:null,kpe85a:null,$$css:!0}},P={level1:{kZCmMZ:`astryx126nfab`,kE3dHu:null,kpe85a:null,$$css:!0},level2:{kZCmMZ:`astryxchaq28`,kE3dHu:null,kpe85a:null,$$css:!0},level3:{kZCmMZ:`astryxc8afjc`,kE3dHu:null,kpe85a:null,$$css:!0},level4:{kZCmMZ:`astryx19b7t93`,kE3dHu:null,kpe85a:null,$$css:!0}},j.displayName=`Outline`,j.__docgenInfo={description:`A table-of-contents navigation component for document headings.

Outline accepts a flat \`items\` array and renders anchor links with
indentation based on each heading level. Features a sliding indicator
track that animates to the active item.

When \`activeId\` is omitted, it tracks scroll position and marks the last
heading whose top has passed its activation line — which is exactly where
navigating to that heading lands it: \`offset\` (a fixed header overlaying the
scroll root) plus the heading's own \`scroll-margin-top\`. It defaults to the
first item at the top and the last at the bottom.

Keyboard: the list is a single tab stop (roving tabindex), seated on the
active heading. Arrow keys move between headings, Home/End jump to the ends,
and Enter/Space activate — so a long table of contents costs one Tab press,
not one per heading.

@example
\`\`\`
<Outline
  items={[
    {id: 'intro', label: 'Introduction', level: 1},
    {id: 'features', label: 'Features', level: 2},
    {id: 'api', label: 'API Reference', level: 1},
  ]}
/>
\`\`\`

Scoped to a custom scroll container, under a fixed header:

@example
\`\`\`
const scrollContainerRef = useRef<HTMLDivElement>(null);
<div ref={scrollContainerRef} style={{overflowY: 'auto'}}>...</div>
<Outline
  items={items}
  scrollContainerRef={scrollContainerRef}
  offset={64}
  onNavigateEnd={id => flashHeading(id)}
/>
\`\`\``,methods:[],displayName:`Outline`,props:{xstyle:{required:!1,tsType:{name:`StyleXStyles`},description:"StyleX styles created via `stylex.create()`. Merged with the component's\nbase styles inside a single `stylex.props()` call for optimal deduplication.\n\n@example\n```\nconst overrides = stylex.create({ root: { marginBottom: 8 } });\n<Component xstyle={overrides.root} />\n```"},ref:{required:!1,tsType:{name:`ReactRef`,raw:`React.Ref<HTMLElement>`,elements:[{name:`HTMLElement`}]},description:`Ref forwarded to the root nav element.`},items:{required:!0,tsType:{name:`Array`,elements:[{name:`OutlineItem`}],raw:`OutlineItem[]`},description:`Ordered list of heading items to render.`},activeId:{required:!1,tsType:{name:`string`},description:`ID of the currently active item. When provided, disables built-in scroll-spy.`},onActiveIdChange:{required:!1,tsType:{name:`signature`,type:`function`,raw:`(id: string) => void`,signature:{arguments:[{type:{name:`string`},name:`id`}],return:{name:`void`}}},description:`Called when the active item changes from scroll-spy or click.`},label:{required:!1,tsType:{name:`string`},description:`Accessible label for the nav landmark. @default 'Table of contents'`},density:{required:!1,tsType:{name:`union`,raw:`'default' | 'compact'`,elements:[{name:`literal`,value:`'default'`},{name:`literal`,value:`'compact'`}]},description:`Density variant controlling item padding.
- 'default': Standard spacing (default)
- 'compact': Reduced spacing for dense UIs
@default 'default'`,defaultValue:{value:`'default'`,computed:!1}},onNavigateStart:{required:!1,tsType:{name:`signature`,type:`function`,raw:`(id: string) => void`,signature:{arguments:[{type:{name:`string`},name:`id`}],return:{name:`void`}}},description:"Called when navigation to an item begins, before the scroll starts.\nReceives the item `id`. Pair with `onNavigateEnd` to drive an arrival\neffect (flash, ring, pulse) on the target heading."},onNavigateEnd:{required:!1,tsType:{name:`signature`,type:`function`,raw:`(id: string) => void`,signature:{arguments:[{type:{name:`string`},name:`id`}],return:{name:`void`}}},description:`Called once when navigation to an item resolves — when the smooth scroll
settles, or immediately-ish when reduced motion turns it into a jump.

Fires exactly once for every \`onNavigateStart\`, including when the user
interrupts the scroll by scrolling manually, so a "navigating" state can
never leak. It does not fire if the Outline unmounts mid-scroll.`},offset:{required:!1,tsType:{name:`number`},description:`Height in px of a fixed header overlaying the top of the scroll root.

Shifts both the activation line *and* the scroll landing by the same
amount, so a heading activates exactly where navigating to it puts it —
below the header rather than hidden underneath it.

It composes with each heading's own \`scroll-margin-top\` (the header, then
the breathing room below it) rather than replacing it. When nothing
overlays the content, leave this at 0 and let \`scroll-margin-top\` do the
work — the browser already honors it.

@default 0`,defaultValue:{value:`0`,computed:!1}},scrollContainerRef:{required:!1,tsType:{name:`ReactRefObject`,raw:`React.RefObject<HTMLElement | null>`,elements:[{name:`union`,raw:`HTMLElement | null`,elements:[{name:`HTMLElement`},{name:`null`}]}]},description:`Scroll container to track, instead of auto-detecting the nearest scrollable
ancestor. Use this when the content scrolls inside a split pane, modal, or
dashboard panel rather than the viewport.`},hasScrollOnClick:{required:!1,tsType:{name:`boolean`},description:`Whether activating an item smooth-scrolls to it. Set to false to own the
scrolling yourself (virtualized content, a router) — the Outline still
updates the active item, the hash, and the navigate callbacks, but performs
no scroll and suppresses the anchor's default jump.
@default true`,defaultValue:{value:`true`,computed:!1}},"data-testid":{required:!1,tsType:{name:`string`},description:`Test ID for testing frameworks.`}},composes:[`Omit`]}})))()}function F(e){return e.map(e=>{switch(e.type){case`text`:case`code`:return e.content;case`bold`:case`italic`:case`strikethrough`:case`link`:return F(e.children);case`image`:return e.alt;case`citation`:case`break`:return``}}).join(``)}function de(e){return e.trim().toLowerCase().replace(/['"]/g,``).replace(/[^a-z0-9]+/g,`-`).replace(/^-+|-+$/g,``)}function fe(e,t){let n=e||`section`,r=t.get(n)??0;return t.set(n,r+1),r===0?n:`${n}-${r}`}function pe(e){let t=new Map;return C(e).filter(e=>e.type===`heading`).map(e=>{let n=F(e.children).trim();return{id:fe(de(n),t),label:n,level:e.level}})}function me(){return(me=e((()=>{te()})))()}function he(e){return(0,ge.useMemo)(()=>pe(e),[e])}var ge;function I(){return(I=e((()=>{ge=t(),me()})))()}function L(e){return e==null?[]:Array.from(e.querySelectorAll(`h1,h2,h3,h4,h5,h6`)).map(e=>{let t=Number(e.tagName.slice(1)),n=e.textContent?.trim()??``;return{id:e.id,label:n,level:t}}).filter(e=>e.id!==``&&e.label!==``)}function _e(e){let[t,n]=(0,R.useState)(()=>L(e.current));return(0,R.useEffect)(()=>{let t=e.current;if(n(L(t)),t==null||typeof MutationObserver>`u`)return;let r=new MutationObserver(()=>{n(L(t))});return r.observe(t,{childList:!0,subtree:!0,characterData:!0,attributes:!0,attributeFilter:[`id`]}),()=>{r.disconnect()}},[e]),t}var R;function ve(){return(ve=e((()=>{R=t()})))()}function ye(e){return typeof e==`string`||typeof e==`number`?String(e):Array.isArray(e)?e.map(ye).join(``):``}function be(e){return e.trim().toLowerCase().replace(/['\u201C\u201D"]/g,``).replace(/[^a-z0-9]+/g,`-`).replace(/^-+|-+$/g,``)||`section`}var z,B,xe,V,H,U,W,G,K,q,J,Y,X,Z,Q,$,Se;function Ce(){return(Ce=e((()=>{z=t(),ue(),ve(),I(),y(),ee(),x(),c(),B=u(),xe={title:`Core/Outline`,component:j,tags:[`autodocs`],argTypes:{label:{control:`text`,description:`Accessible label for the nav landmark`},activeId:{control:`text`,description:`Controlled active item id`},density:{control:`radio`,options:[`default`,`compact`],description:`Density variant`}}},V=[{id:`overview`,label:`Overview`,level:2},{id:`installation`,label:`Installation`,level:2},{id:`theming`,label:`Theming`,level:2},{id:`tokens`,label:`Tokens`,level:3},{id:`component-overrides`,label:`Component overrides`,level:3},{id:`accessibility`,label:`Accessibility`,level:2}],H=48,U=[`## Overview`,``,`Astryx gives teams a consistent foundation for internal product surfaces.`,``,`## Installation`,``,`Install the package and wrap the app in an Theme provider.`,``,`### Package setup`,``,`Import components from their component subpaths for clear ownership.`,``,`### Theme setup`,``,`Use a built theme in production so component overrides are present at first paint.`,``,`## Accessibility`,``,`Components include semantic roles, labels, and focus behavior where applicable.`].join(`
`),W={args:{items:V}},G={args:{items:V,activeId:`tokens`}},K={args:{items:V,activeId:`installation`,density:`compact`}},q={render:()=>(0,B.jsxs)(`div`,{style:{display:`grid`,gridTemplateColumns:`minmax(0, 1fr) 220px`,gap:32,maxWidth:960},children:[(0,B.jsxs)(`article`,{style:{display:`grid`,gap:24},children:[(0,B.jsxs)(`section`,{children:[(0,B.jsx)(`h2`,{id:`overview`,children:`Overview`}),(0,B.jsx)(`p`,{children:`Astryx components provide consistent interaction, styling, and theme behavior for internal tools.`})]}),(0,B.jsxs)(`section`,{children:[(0,B.jsx)(`h2`,{id:`installation`,children:`Installation`}),(0,B.jsx)(`p`,{children:`Install the package, wrap the app with Theme, and import components from their subpaths.`})]}),(0,B.jsxs)(`section`,{children:[(0,B.jsx)(`h2`,{id:`theming`,children:`Theming`}),(0,B.jsx)(`p`,{children:`Themes define semantic tokens and component overrides without changing app code.`}),(0,B.jsx)(`h3`,{id:`tokens`,children:`Tokens`}),(0,B.jsx)(`p`,{children:`Use semantic color, spacing, typography, radius, elevation, and motion tokens.`}),(0,B.jsx)(`h3`,{id:`component-overrides`,children:`Component overrides`}),(0,B.jsx)(`p`,{children:`Component overrides target the stable Astryx selector surface emitted by each component: astryx-* classes plus data-* prop reflections.`})]}),(0,B.jsxs)(`section`,{children:[(0,B.jsx)(`h2`,{id:`accessibility`,children:`Accessibility`}),(0,B.jsx)(`p`,{children:`Components include landmark, keyboard, focus, and ARIA behavior where applicable.`})]})]}),(0,B.jsx)(`aside`,{style:{position:`sticky`,top:24,alignSelf:`start`},children:(0,B.jsx)(j,{items:V})})]})},J={render:()=>{let e=he(U);return(0,B.jsxs)(`div`,{style:{display:`grid`,gridTemplateColumns:`minmax(0, 1fr) 220px`,gap:32,maxWidth:960},children:[(0,B.jsx)(w,{components:{heading:({level:e,children:t})=>{let n=`h${e}`;return(0,B.jsx)(n,{id:be(ye(t)),children:t})}},children:U}),(0,B.jsx)(`aside`,{style:{position:`sticky`,top:24,alignSelf:`start`},children:(0,B.jsx)(j,{items:e})})]})}},Y={render:()=>{let e=(0,z.useRef)(null),t=_e(e);return(0,B.jsxs)(`div`,{style:{display:`grid`,gridTemplateColumns:`minmax(0, 1fr) 220px`,gap:32,maxWidth:960},children:[(0,B.jsxs)(`article`,{ref:e,style:{display:`grid`,gap:24},children:[(0,B.jsxs)(`section`,{children:[(0,B.jsx)(S,{id:`account-settings`,level:2,children:`Account settings`}),(0,B.jsx)(l,{type:`body`,children:`Manage profile, authentication, and workspace preferences.`}),(0,B.jsxs)(`div`,{style:{display:`flex`,gap:8,marginTop:12},children:[(0,B.jsx)(b,{variant:`success`,label:`Active`}),(0,B.jsx)(b,{variant:`neutral`,label:`Workspace`})]})]}),(0,B.jsxs)(`section`,{children:[(0,B.jsx)(S,{id:`notifications`,level:2,children:`Notifications`}),(0,B.jsx)(l,{type:`body`,children:`Choose which product events should notify the team.`}),(0,B.jsx)(S,{id:`email-alerts`,level:3,children:`Email alerts`}),(0,B.jsx)(l,{type:`body`,children:`Use email for low-frequency summaries and approvals.`}),(0,B.jsx)(S,{id:`push-alerts`,level:3,children:`Push alerts`}),(0,B.jsx)(l,{type:`body`,children:`Use push for time-sensitive updates and incidents.`})]}),(0,B.jsxs)(`section`,{children:[(0,B.jsx)(S,{id:`billing`,level:2,children:`Billing`}),(0,B.jsx)(l,{type:`body`,children:`Review invoices, payment methods, and usage limits.`})]})]}),(0,B.jsx)(`aside`,{style:{position:`sticky`,top:24,alignSelf:`start`},children:(0,B.jsx)(j,{items:t})})]})}},X={render:()=>(0,B.jsx)(`div`,{style:{width:240},children:(0,B.jsx)(j,{items:[{id:`chapter-1`,label:`Chapter 1`,level:1},{id:`section-1-1`,label:`Section 1.1`,level:2},{id:`subsection-1-1-1`,label:`Subsection 1.1.1`,level:3},{id:`subsection-1-1-2`,label:`Subsection 1.1.2`,level:3},{id:`section-1-2`,label:`Section 1.2`,level:2},{id:`chapter-2`,label:`Chapter 2`,level:1},{id:`section-2-1`,label:`Section 2.1`,level:2}],activeId:`subsection-1-1-1`})})},Z={render:()=>{let e=(0,z.useRef)(null);return(0,B.jsxs)(`div`,{style:{display:`grid`,gridTemplateColumns:`minmax(0, 1fr) 220px`,gap:32,maxWidth:960},children:[(0,B.jsxs)(`div`,{ref:e,style:{overflowY:`auto`,height:360,border:`1px solid rgba(128,128,128,0.3)`,borderRadius:8,position:`relative`},children:[(0,B.jsx)(`div`,{style:{position:`sticky`,top:0,height:H,boxSizing:`border-box`,padding:`0 16px`,display:`flex`,alignItems:`center`,background:`var(--color-surface, #fff)`,borderBottom:`1px solid rgba(128,128,128,0.3)`,zIndex:1},children:(0,B.jsx)(b,{label:`Sticky header (${H}px)`})}),(0,B.jsx)(`div`,{style:{padding:`0 16px 16px`},children:V.map(e=>(0,B.jsxs)(`section`,{children:[(0,B.jsx)(S,{id:e.id,level:e.level===2?2:3,style:{scrollMarginTop:8},children:e.label}),(0,B.jsx)(l,{children:`Scroll the pane. The outline tracks the pane's scroll position, not the window's.`}),(0,B.jsx)(`div`,{style:{height:160}})]},e.id))})]}),(0,B.jsx)(`aside`,{style:{alignSelf:`start`},children:(0,B.jsx)(j,{items:V,scrollContainerRef:e,offset:H})})]})}},Q={render:()=>{let[e,t]=(0,z.useState)(`idle`),[n,r]=(0,z.useState)(null);return(0,B.jsxs)(`div`,{style:{display:`grid`,gridTemplateColumns:`minmax(0, 1fr) 220px`,gap:32,maxWidth:960},children:[(0,B.jsx)(`article`,{children:V.map(e=>(0,B.jsxs)(`section`,{children:[(0,B.jsx)(S,{id:e.id,level:e.level===2?2:3,style:{scrollMarginTop:16,transition:`background-color 600ms`,backgroundColor:n===e.id?`var(--color-overlay-hover, rgba(128,128,128,0.2))`:`transparent`},children:e.label}),(0,B.jsx)(`div`,{style:{height:320}})]},e.id))}),(0,B.jsxs)(`aside`,{style:{position:`sticky`,top:24,alignSelf:`start`},children:[(0,B.jsx)(b,{label:e}),(0,B.jsx)(j,{items:V,onNavigateStart:e=>{r(null),t(`scrolling to ${e}`)},onNavigateEnd:e=>{r(e),t(`arrived at ${e}`)}})]})]})}},$={render:()=>(0,B.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:16,width:240},children:[(0,B.jsx)(`button`,{type:`button`,children:`Focus me, then press Tab`}),(0,B.jsx)(j,{items:V}),(0,B.jsx)(`button`,{type:`button`,children:`Tab again lands here`})]})},W.parameters={...W.parameters,docs:{...W.parameters?.docs,source:{originalSource:`{
  args: {
    items: outlineItems
  }
}`,...W.parameters?.docs?.source}}},G.parameters={...G.parameters,docs:{...G.parameters?.docs,source:{originalSource:`{
  args: {
    items: outlineItems,
    activeId: 'tokens'
  }
}`,...G.parameters?.docs?.source}}},K.parameters={...K.parameters,docs:{...K.parameters?.docs,source:{originalSource:`{
  args: {
    items: outlineItems,
    activeId: 'installation',
    density: 'compact'
  }
}`,...K.parameters?.docs?.source},description:{story:`Compact density variant — reduced spacing for dense UIs`,...K.parameters?.docs?.description}}},q.parameters={...q.parameters,docs:{...q.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) 220px',
    gap: 32,
    maxWidth: 960
  }}>
      <article style={{
      display: 'grid',
      gap: 24
    }}>
        <section>
          <h2 id="overview">Overview</h2>
          <p>
            Astryx components provide consistent interaction, styling, and theme
            behavior for internal tools.
          </p>
        </section>
        <section>
          <h2 id="installation">Installation</h2>
          <p>
            Install the package, wrap the app with Theme, and import components
            from their subpaths.
          </p>
        </section>
        <section>
          <h2 id="theming">Theming</h2>
          <p>
            Themes define semantic tokens and component overrides without
            changing app code.
          </p>
          <h3 id="tokens">Tokens</h3>
          <p>
            Use semantic color, spacing, typography, radius, elevation, and
            motion tokens.
          </p>
          <h3 id="component-overrides">Component overrides</h3>
          <p>
            Component overrides target the stable Astryx selector surface
            emitted by each component: astryx-* classes plus data-* prop
            reflections.
          </p>
        </section>
        <section>
          <h2 id="accessibility">Accessibility</h2>
          <p>
            Components include landmark, keyboard, focus, and ARIA behavior
            where applicable.
          </p>
        </section>
      </article>
      <aside style={{
      position: 'sticky',
      top: 24,
      alignSelf: 'start'
    }}>
        <Outline items={outlineItems} />
      </aside>
    </div>
}`,...q.parameters?.docs?.source}}},J.parameters={...J.parameters,docs:{...J.parameters?.docs,source:{originalSource:`{
  render: () => {
    const items = useOutlineFromMarkdown(markdownContent);
    return <div style={{
      display: 'grid',
      gridTemplateColumns: 'minmax(0, 1fr) 220px',
      gap: 32,
      maxWidth: 960
    }}>
        <Markdown components={{
        heading: ({
          level,
          children
        }) => {
          const Tag = \`h\${level}\` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
          return <Tag id={storySlug(nodeText(children))}>{children}</Tag>;
        }
      }}>
          {markdownContent}
        </Markdown>
        <aside style={{
        position: 'sticky',
        top: 24,
        alignSelf: 'start'
      }}>
          <Outline items={items} />
        </aside>
      </div>;
  }
}`,...J.parameters?.docs?.source}}},Y.parameters={...Y.parameters,docs:{...Y.parameters?.docs,source:{originalSource:`{
  render: () => {
    const contentRef = useRef<HTMLElement | null>(null);
    const items = useOutlineFromDOM(contentRef);
    return <div style={{
      display: 'grid',
      gridTemplateColumns: 'minmax(0, 1fr) 220px',
      gap: 32,
      maxWidth: 960
    }}>
        <article ref={contentRef} style={{
        display: 'grid',
        gap: 24
      }}>
          <section>
            <Heading id="account-settings" level={2}>
              Account settings
            </Heading>
            <Text type="body">
              Manage profile, authentication, and workspace preferences.
            </Text>
            <div style={{
            display: 'flex',
            gap: 8,
            marginTop: 12
          }}>
              <Badge variant="success" label="Active" />
              <Badge variant="neutral" label="Workspace" />
            </div>
          </section>
          <section>
            <Heading id="notifications" level={2}>
              Notifications
            </Heading>
            <Text type="body">
              Choose which product events should notify the team.
            </Text>
            <Heading id="email-alerts" level={3}>
              Email alerts
            </Heading>
            <Text type="body">
              Use email for low-frequency summaries and approvals.
            </Text>
            <Heading id="push-alerts" level={3}>
              Push alerts
            </Heading>
            <Text type="body">
              Use push for time-sensitive updates and incidents.
            </Text>
          </section>
          <section>
            <Heading id="billing" level={2}>
              Billing
            </Heading>
            <Text type="body">
              Review invoices, payment methods, and usage limits.
            </Text>
          </section>
        </article>
        <aside style={{
        position: 'sticky',
        top: 24,
        alignSelf: 'start'
      }}>
          <Outline items={items} />
        </aside>
      </div>;
  }
}`,...Y.parameters?.docs?.source}}},X.parameters={...X.parameters,docs:{...X.parameters?.docs,source:{originalSource:`{
  render: () => {
    const items: OutlineItem[] = [{
      id: 'chapter-1',
      label: 'Chapter 1',
      level: 1
    }, {
      id: 'section-1-1',
      label: 'Section 1.1',
      level: 2
    }, {
      id: 'subsection-1-1-1',
      label: 'Subsection 1.1.1',
      level: 3
    }, {
      id: 'subsection-1-1-2',
      label: 'Subsection 1.1.2',
      level: 3
    }, {
      id: 'section-1-2',
      label: 'Section 1.2',
      level: 2
    }, {
      id: 'chapter-2',
      label: 'Chapter 2',
      level: 1
    }, {
      id: 'section-2-1',
      label: 'Section 2.1',
      level: 2
    }];
    return <div style={{
      width: 240
    }}>
        <Outline items={items} activeId="subsection-1-1-1" />
      </div>;
  }
}`,...X.parameters?.docs?.source},description:{story:`Deep nesting with multiple indent levels`,...X.parameters?.docs?.description}}},Z.parameters={...Z.parameters,docs:{...Z.parameters?.docs,source:{originalSource:`{
  render: () => {
    const scrollContainerRef = useRef<HTMLDivElement | null>(null);
    return <div style={{
      display: 'grid',
      gridTemplateColumns: 'minmax(0, 1fr) 220px',
      gap: 32,
      maxWidth: 960
    }}>
        <div ref={scrollContainerRef} style={{
        overflowY: 'auto',
        height: 360,
        border: '1px solid rgba(128,128,128,0.3)',
        borderRadius: 8,
        position: 'relative'
      }}>
          <div style={{
          position: 'sticky',
          top: 0,
          height: STICKY_HEADER_HEIGHT,
          boxSizing: 'border-box',
          padding: '0 16px',
          display: 'flex',
          alignItems: 'center',
          background: 'var(--color-surface, #fff)',
          borderBottom: '1px solid rgba(128,128,128,0.3)',
          zIndex: 1
        }}>
            <Badge label={\`Sticky header (\${STICKY_HEADER_HEIGHT}px)\`} />
          </div>
          <div style={{
          padding: '0 16px 16px'
        }}>
            {outlineItems.map(item => <section key={item.id}>
                {/* scroll-margin-top must sit on the element the outline
                    targets — the heading carries the id, so the browser reads
                    it from there, not from a wrapper. */}
                <Heading id={item.id} level={item.level === 2 ? 2 : 3} style={{
              scrollMarginTop: 8
            }}>
                  {item.label}
                </Heading>
                <Text>
                  Scroll the pane. The outline tracks the pane&apos;s scroll
                  position, not the window&apos;s.
                </Text>
                <div style={{
              height: 160
            }} />
              </section>)}
          </div>
        </div>
        <aside style={{
        alignSelf: 'start'
      }}>
          <Outline items={outlineItems} scrollContainerRef={scrollContainerRef} offset={STICKY_HEADER_HEIGHT} />
        </aside>
      </div>;
  }
}`,...Z.parameters?.docs?.source},description:{story:`Scroll-spy scoped to a custom scroll container, under a sticky header.

The content scrolls inside the pane, not the viewport — so the outline would
auto-detect the wrong scroll root and its highlight would never move.
\`scrollContainerRef\` scopes tracking to the pane.

\`offset\` is the height of the sticky header covering the top of that pane.
It moves the activation line *and* the scroll landing together, so clicking
an item parks its heading just below the header instead of hidden underneath
it — and the heading activates at the same line it lands on. The heading's
own \`scroll-margin-top\` adds the breathing room below the header (8px here),
so the two compose: 48 + 8 = 56px.`,...Z.parameters?.docs?.description}}},Q.parameters={...Q.parameters,docs:{...Q.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [status, setStatus] = useState('idle');
    const [flashId, setFlashId] = useState<string | null>(null);
    return <div style={{
      display: 'grid',
      gridTemplateColumns: 'minmax(0, 1fr) 220px',
      gap: 32,
      maxWidth: 960
    }}>
        <article>
          {outlineItems.map(item => <section key={item.id}>
              {/* scroll-margin-top belongs on the heading (it carries the id
                  the outline scrolls to), not on the section wrapper. */}
              <Heading id={item.id} level={item.level === 2 ? 2 : 3} style={{
            scrollMarginTop: 16,
            transition: 'background-color 600ms',
            backgroundColor: flashId === item.id ? 'var(--color-overlay-hover, rgba(128,128,128,0.2))' : 'transparent'
          }}>
                {item.label}
              </Heading>
              <div style={{
            height: 320
          }} />
            </section>)}
        </article>
        <aside style={{
        position: 'sticky',
        top: 24,
        alignSelf: 'start'
      }}>
          <Badge label={status} />
          <Outline items={outlineItems} onNavigateStart={id => {
          setFlashId(null);
          setStatus(\`scrolling to \${id}\`);
        }} onNavigateEnd={id => {
          setFlashId(id);
          setStatus(\`arrived at \${id}\`);
        }} />
        </aside>
      </div>;
  }
}`,...Q.parameters?.docs?.source},description:{story:"Navigate callbacks. `onNavigateStart` fires before the smooth scroll begins\nand `onNavigateEnd` once it settles — here it flashes the heading on arrival.\n\n`onNavigateEnd` fires exactly once for every `onNavigateStart`, including\nwhen the user scrolls away mid-jump, so the flash state can never get stuck.",...Q.parameters?.docs?.description}}},$.parameters={...$.parameters,docs:{...$.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
    width: 240
  }}>
      <button type="button">Focus me, then press Tab</button>
      <Outline items={outlineItems} />
      <button type="button">Tab again lands here</button>
    </div>
}`,...$.parameters?.docs?.source},description:{story:`Keyboard navigation. The outline is a single tab stop: Tab moves into it
once, then Arrow keys move between headings, Home/End jump to the ends, and
Enter or Space activates — a 40-heading TOC costs one Tab press, not 40.`,...$.parameters?.docs?.description}}},Se=[`Basic`,`Controlled`,`Compact`,`WithDocument`,`ExtractFromMarkdown`,`ExtractFromHTML`,`DeepNesting`,`ScrollSpy`,`NavigateCallbacks`,`KeyboardNavigation`]})))()}Ce();export{W as Basic,K as Compact,G as Controlled,X as DeepNesting,Y as ExtractFromHTML,J as ExtractFromMarkdown,$ as KeyboardNavigation,Q as NavigateCallbacks,Z as ScrollSpy,q as WithDocument,Se as __namedExportsOrder,xe as default};