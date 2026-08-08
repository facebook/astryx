import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{t}from"./react-BZJXY1be.js";import{n,t as r}from"./stylex-Dft6gtPK.js";import{n as i}from"./mergeProps-JRyAvMxc.js";import{n as a}from"./mergeRefs-CPqjs56a.js";import{n as o,t as s}from"./themeProps-CREkzZh6.js";import{n as c,t as l}from"./Text-BfjtEFtP.js";import{t as u}from"./jsx-runtime-DeHZSEgm.js";import{n as d,t as f}from"./Button-BVMvoKVE.js";import{n as p,t as m}from"./useDevWarning-Cdyb6i-B.js";import{n as h,t as g}from"./Divider-D4km6nVj.js";import{n as _,t as v}from"./useScrollLock-DlXUsXsm.js";import{n as y,t as b}from"./CheckboxInput-DJd8Fdr_.js";import{n as x,t as S}from"./Heading-CaMVckJS.js";import{n as C,t as w}from"./VStack-C2SBQ4Fm.js";import{n as T,t as E}from"./Section-BQJsZyZZ.js";import{n as D,t as O}from"./TextInput-BwKW_f5i.js";import{n as k,t as A}from"./TextArea-D_j0AEIi.js";function ee(e,t,n=48){let r=[0,...t.filter(t=>t>0&&t<e).map(t=>e-t)].sort((e,t)=>e-t),i=[];for(let e of r){let t=i[i.length-1];(t===void 0||e-t>=n)&&i.push(e)}return i}function j(e,t){return t.reduce((t,n)=>Math.abs(n-e)<Math.abs(t-e)?n:t,t[0])}function te(e,t,n){let r=t[t.length-1],i=t.length>=2,a=i?t[t.length-2]:0,o=i?r:n,s=i?M:0;return e<=a?1:e>=o?s:1-(1-s)*((e-a)/(o-a))}function ne(e,t,n,r){let i=t;if(n>0){let e=t.filter(e=>e>=r);e.length>0&&(i=e)}else if(n<0){let e=t.filter(e=>e<=r);e.length>0&&(i=e)}return j(e,i)}var M;function N(){return(N=e((()=>{M=.3})))()}function P(){typeof navigator>`u`||typeof navigator.vibrate!=`function`||ie()||navigator.vibrate(8)}function re(e,t){let n=t[0],r=Math.abs(e-n);for(let i of t){let t=Math.abs(e-i);t<r&&(r=t,n=i)}if(r>=R)return e;let i=r/R,a=1-i*i;return e+(n-e)*a}function ie(){return typeof window>`u`||!window.matchMedia?!1:window.matchMedia(`(prefers-reduced-motion: reduce)`).matches}function F({isOpen:e,onDismiss:t,snapHeights:n,onSnap:r,onScrimOpacity:i}){let[a,o]=(0,I.useState)(0),[s,c]=(0,I.useState)(0),[l,u]=(0,I.useState)(!1),d=(0,I.useRef)(t),f=(0,I.useRef)(r),p=(0,I.useRef)(i),m=(0,I.useRef)(n);(0,I.useEffect)(()=>{d.current=t,f.current=r,p.current=i,m.current=n});let h=(0,I.useRef)(null),g=(0,I.useRef)(0),_=(0,I.useRef)(null),v=(0,I.useRef)(null),y=(0,I.useCallback)(e=>{if(v.current?.disconnect(),v.current=null,_.current=e,!e||typeof ResizeObserver>`u`){e&&(g.current=e.getBoundingClientRect().height);return}g.current=e.getBoundingClientRect().height;let t=new ResizeObserver(e=>{let t=e[0]?.contentRect;t&&t.height>0&&(g.current=t.height)});t.observe(e),v.current=t},[]);(0,I.useEffect)(()=>()=>v.current?.disconnect(),[]),(0,I.useEffect)(()=>{e&&(o(0),c(0),u(!1))},[e]);let b=(0,I.useCallback)(()=>g.current>0?g.current:_.current?.getBoundingClientRect().height??0,[]),x=(0,I.useCallback)(e=>ee(e,m.current?.()??[]),[]),S=(0,I.useCallback)((e,t,n,r,i,a)=>{let o=x(n),s=o[o.length-1],l=n-s,u=Math.abs(t)>ae&&i>oe;if(r>0&&u){d.current();return}if(r<0&&u){c(0),f.current?.(n),p.current?.(1),P();return}if(e>s+l*L){d.current();return}let m=ne(e,o,r,a);c(m),f.current?.(n-m);let h=s+l*L;p.current?.(te(m,o,h)),m!==a&&P()},[x]),C=(0,I.useCallback)((e,t,n)=>{e.currentTarget.setPointerCapture?.(e.pointerId);let r=n??e.clientY;h.current={pointerId:e.pointerId,startCoord:r,lastCoord:e.clientY,lastTime:e.timeStamp,velocity:0,height:t,baseOffset:s},o(s),u(!0)},[s]),w=(0,I.useCallback)(e=>{C(e,b())},[C,b]),T=(0,I.useCallback)(e=>{let t=h.current;if(!t||t.pointerId!==e.pointerId)return;let n=e.clientY-t.startCoord,r=e.timeStamp-t.lastTime;r>0&&(t.velocity=(e.clientY-t.lastCoord)/r,t.lastCoord=e.clientY,t.lastTime=e.timeStamp);let i=x(t.height),a=t.baseOffset+n,s=i[i.length-1],c;c=a<0?Math.max(-48,a*se):a>s?a:re(a,i),o(c);let l=i[i.length-1],u=l+(t.height-l)*L;p.current?.(te(c,i,u))},[x]),E=(0,I.useCallback)(e=>{let t=h.current;if(!t||t.pointerId!==e.pointerId)return;e.currentTarget.releasePointerCapture?.(e.pointerId);let n=e.clientY-t.startCoord,r=Math.max(0,t.baseOffset+n),i=n===0?0:n>0?1:-1;h.current=null,u(!1),S(r,t.velocity,t.height||1,i,Math.abs(n),t.baseOffset)},[S]),D=(0,I.useRef)(null),O=(0,I.useCallback)(e=>{let t=e.currentTarget;if(t.scrollTop>0){D.current=null;return}D.current={pointerId:e.pointerId,startCoord:e.clientY,scroller:t}},[]),k=(0,I.useCallback)(e=>{if(h.current){T(e);return}let t=D.current;if(!t||t.pointerId!==e.pointerId)return;let n=e.clientY-t.startCoord;n>0&&t.scroller.scrollTop<=0?(D.current=null,C(e,b(),t.startCoord),T(e)):n<0&&(D.current=null)},[C,T,b]),A=(0,I.useCallback)(e=>{D.current=null,h.current&&E(e)},[E]),j=(0,I.useRef)(null),M=(0,I.useRef)(null),N=(0,I.useRef)(null),F=(0,I.useRef)(C),R=(0,I.useRef)(T),z=(0,I.useRef)(E),B=(0,I.useRef)(b);(0,I.useEffect)(()=>{F.current=C,R.current=T,z.current=E,B.current=b});let V=(0,I.useCallback)(e=>{let t=(e,t)=>({pointerId:e.identifier,clientY:e.clientY,timeStamp:Date.now(),currentTarget:t,setPointerCapture:()=>{},releasePointerCapture:()=>{}}),n=e=>e.scrollTop<=0,r=e=>e.scrollTop+e.clientHeight>=e.scrollHeight-1,i=e=>{let t=e.currentTarget,i=e.changedTouches[0];if(!i){M.current=null;return}let a=n(t),o=r(t);if(!a&&!o){M.current=null;return}M.current={id:i.identifier,startY:i.clientY,top:a,bottom:o}},a=e=>{let i=e.currentTarget;if(h.current){let n=[...e.changedTouches].find(e=>e.identifier===h.current?.pointerId);n&&(e.preventDefault(),R.current(t(n,i)));return}let a=M.current;if(!a)return;let o=[...e.changedTouches].find(e=>e.identifier===a.id);if(!o)return;let s=o.clientY-a.startY,c=a.top&&s>0&&n(i),l=a.bottom&&s<0&&r(i);c||l?(e.preventDefault(),M.current=null,F.current(t(o,i),B.current(),a.startY),R.current(t(o,i))):(a.top&&s<0||a.bottom&&s>0)&&(M.current=null)},o=e=>{if(M.current=null,h.current){let n=e.changedTouches[0];n&&z.current(t(n,e.currentTarget))}},s=j.current;if(s&&N.current){let e=N.current;s.removeEventListener(`touchstart`,e.start),s.removeEventListener(`touchmove`,e.move),s.removeEventListener(`touchend`,e.end),s.removeEventListener(`touchcancel`,e.end)}j.current=e,e?(e.addEventListener(`touchstart`,i,{passive:!0}),e.addEventListener(`touchmove`,a,{passive:!1}),e.addEventListener(`touchend`,o,{passive:!0}),e.addEventListener(`touchcancel`,o,{passive:!0}),N.current={start:i,move:a,end:o}):N.current=null},[]),H=(0,I.useMemo)(ie,[e]),U=l?a:s;return{sheetRef:y,contentProps:(0,I.useMemo)(()=>({style:{transform:U===0?void 0:`translateY(${U}px)`,transition:l||H?`none`:void 0,touchAction:`none`,overscrollBehavior:`contain`}}),[U,l,H]),handleProps:(0,I.useMemo)(()=>({style:{touchAction:`none`,cursor:`grab`},onPointerDown:w,onPointerMove:T,onPointerUp:E,onPointerCancel:E}),[w,T,E]),bodyProps:(0,I.useMemo)(()=>({ref:V,onPointerDown:O,onPointerMove:k,onPointerUp:A,onPointerCancel:A}),[V,O,k,A]),dragOffset:a,settledOffset:s,isDragging:l}}var I,ae,oe,L,R,se;function z(){return(z=e((()=>{I=t(),N(),ae=1.2,oe=48,L=.4,R=40,se=.35})))()}function B(){if(typeof window>`u`)return[];let e=window.visualViewport?.height??window.innerHeight;return ce.map(t=>t*e)}function V({ref:e,isOpen:t,onOpenChange:r,label:s,children:c,height:l=`capped`,hasScrim:u=!0,xstyle:d,...f}){let m=(0,H.useRef)(null),h=(0,H.useRef)(null),g=(0,H.useRef)(null),v=(0,H.useCallback)(()=>r(!1),[r]),{contentProps:y,handleProps:b,bodyProps:x,sheetRef:S}=F({isOpen:t,onDismiss:v,snapHeights:B,onScrimOpacity:(0,H.useCallback)(e=>{m.current?.style.setProperty(`--_sheet-scrim-opacity`,String(e))},[])});(0,H.useEffect)(()=>{let e=m.current;if(e){if(t){if(e.style.setProperty(`--_sheet-scrim-opacity`,`1`),!e.open){u?(h.current=document.activeElement,e.showModal()):e.show();let t=e.querySelector(`[data-autofocus]`);t?t.focus():u&&g.current?.focus()}}else if(e.open){let t=g.current,n=!1,r=()=>{n||(n=!0,clearTimeout(a),t?.removeEventListener(`transitionend`,i),e.open&&e.close(),h.current?.focus(),h.current=null)},i=e=>{e.target===t&&e.propertyName===`transform`&&r()};t?.addEventListener(`transitionend`,i);let a=setTimeout(r,450);return()=>{clearTimeout(a),t?.removeEventListener(`transitionend`,i)}}}},[t,u]),_(t&&u),p(`BottomSheet`,"requires a non-empty `label` for an accessible name; the open sheet has no built-in heading to derive one from.",t&&!s);let C=(0,H.useCallback)(e=>{e.preventDefault(),v()},[v]),w=(0,H.useCallback)(e=>{e.key===`Escape`&&(e.preventDefault(),v())},[v]),T=(0,H.useCallback)(e=>{u&&e.target===e.currentTarget&&v()},[v,u]),E=typeof l==`string`&&l in W?W[l]:typeof l==`number`?`${l}px`:l,D=l===`hug`;return(0,U.jsx)(`dialog`,{...{0:{className:`astryxixxii4 astryx10a8y8t astryx1o6l61p astryxtdtrs8 astryx1x1rfll astryx7ab17h astryx1ghz6dp astryx1717udv astryx1gs6z28 astryxjbqb8w astryx1rea2x4 astryx1s85apg astryx1a2a7pz`},4:{className:`astryxixxii4 astryx10a8y8t astryx1o6l61p astryxtdtrs8 astryx1x1rfll astryx7ab17h astryx1ghz6dp astryx1717udv astryx1gs6z28 astryxjbqb8w astryx1rea2x4 astryx1a2a7pz astryx1lliihq`},2:{className:`astryxixxii4 astryx10a8y8t astryx1o6l61p astryxtdtrs8 astryx1x1rfll astryx7ab17h astryx1ghz6dp astryx1717udv astryx1gs6z28 astryxjbqb8w astryx1rea2x4 astryx1s85apg astryx1a2a7pz astryxnixb3f astryxni466t astryxxiuuzi astryxc0dz0a astryxft5bk6 astryx15h3t91 astryx142juwg astryx1viac0w`},6:{className:`astryxixxii4 astryx10a8y8t astryx1o6l61p astryxtdtrs8 astryx1x1rfll astryx7ab17h astryx1ghz6dp astryx1717udv astryx1gs6z28 astryxjbqb8w astryx1rea2x4 astryx1a2a7pz astryx1lliihq astryxnixb3f astryxni466t astryxxiuuzi astryxc0dz0a astryxft5bk6 astryx15h3t91 astryx142juwg astryx1viac0w`},1:{className:`astryxixxii4 astryx10a8y8t astryx1x1rfll astryx7ab17h astryx1ghz6dp astryx1717udv astryx1gs6z28 astryxjbqb8w astryx1rea2x4 astryx1s85apg astryx1a2a7pz astryx47corl astryxfo81ep astryxh8yej3 astryx5yr21d`},5:{className:`astryxixxii4 astryx10a8y8t astryx1x1rfll astryx7ab17h astryx1ghz6dp astryx1717udv astryx1gs6z28 astryxjbqb8w astryx1rea2x4 astryx1a2a7pz astryx1lliihq astryx47corl astryxfo81ep astryxh8yej3 astryx5yr21d`},3:{className:`astryxixxii4 astryx10a8y8t astryx1x1rfll astryx7ab17h astryx1ghz6dp astryx1717udv astryx1gs6z28 astryxjbqb8w astryx1rea2x4 astryx1s85apg astryx1a2a7pz astryxnixb3f astryxni466t astryxxiuuzi astryxc0dz0a astryxft5bk6 astryx15h3t91 astryx142juwg astryx1viac0w astryx47corl astryxfo81ep astryxh8yej3 astryx5yr21d`},7:{className:`astryxixxii4 astryx10a8y8t astryx1x1rfll astryx7ab17h astryx1ghz6dp astryx1717udv astryx1gs6z28 astryxjbqb8w astryx1rea2x4 astryx1a2a7pz astryx1lliihq astryxnixb3f astryxni466t astryxxiuuzi astryxc0dz0a astryxft5bk6 astryx15h3t91 astryx142juwg astryx1viac0w astryx47corl astryxfo81ep astryxh8yej3 astryx5yr21d`}}[!!t<<2|!!u<<1|!u<<0],ref:a(e,m),"aria-label":s,"aria-modal":u?`true`:void 0,onCancel:C,onClick:T,onKeyDown:w,...f,children:(0,U.jsx)(`div`,{className:`astryx10l6tqk astryx17y0mx6 astryx1ey2m1c astryx78zum5 astryxl56j7k astryx47corl`,children:(0,U.jsxs)(`div`,{ref:a(S,g),tabIndex:-1,...i(o(`bottom-sheet`),n(G.sheet,D?G.hugHeight:G.budget,!t&&G.sheetClosing,d),void 0,{"--_sheet-budget":E,...y.style}),children:[(0,U.jsx)(`div`,{className:`astryx2lah0s astryx78zum5 astryx6s0dn4 astryxl56j7k astryx1k15mir astryx5ve5x3 astryx1jm3nie`,...b,"aria-hidden":`true`,children:(0,U.jsx)(`div`,{className:`astryx1m747yf astryx11c6zpc astryxjspbzw astryx1m4xfpy`})}),(0,U.jsx)(`div`,{className:`astryx1iyjqo2 astryx2lwn1j astryx1odjw0f astryx8du1vd astryxx69xxh`,...x,children:c})]})})})}var H,U,ce,W,G;function K(){return(K=e((()=>{H=t(),r(),m(),v(),s(),z(),U=u(),ce=[.14,.5,.92],W={hug:`92dvh`,capped:`62dvh`,tall:`92dvh`},G={sheet:{kfzvcC:`astryx67bb7w`,kB7OPa:`astryx9f619`,k1xSpc:`astryx78zum5`,kXwgrk:`astryxdt5ytf`,kAzted:`astryx2lwn1j`,kzqmXN:`astryxh8yej3`,ks0D6T:`astryx11gisft`,kWkggS:`astryx10xzikg`,krdFHd:`astryx81l70g`,kfmiAY:`astryx7hs6f1`,kGVxlE:`astryx1kcpxr7`,kI3sdo:`astryx1a2a7pz`,kVQacm:`astryxb3r6kr`,kGO01o:`astryx1wkw6tp`,k1K539:`astryx1if0o47`,k3aq6I:`astryxnn1q72 astryxhbqy3z`,k1ekBW:`astryx11xpdln`,kIyJzY:`astryx80gvsz`,kAMwcw:`astryxlr8y92`,k6sLGO:`astryx1so62im`,k6CgDc:`astryxzg1mie`,$$css:!0},sheetClosing:{k3aq6I:`astryx1weeur4`,$$css:!0},budget:{kZKoxP:`astryx1tpcejd`,$$css:!0},hugHeight:{kZKoxP:`astryxg7h5cd`,kskxy:`astryx14bu9tk`,$$css:!0}},V.displayName=`BottomSheet`,V.__docgenInfo={description:`A mobile touch sheet that rises from the bottom edge, with a grab handle,
drag-to-resize snap points, and swipe-to-dismiss. It owns a native
\`<dialog>\` and, by default (\`hasScrim\`), enters the top layer with a focus
trap + \`::backdrop\` scrim and locks body scroll; a slow drag settles to the
nearest snap point, a flick down dismisses, and Escape closes — so the swipe
always has a keyboard equivalent.

With \`hasScrim={false}\` it opens non-modally (\`show()\`, no scrim), leaving
the page behind interactive and scrollable.

@example
\`\`\`
const [isOpen, setIsOpen] = useState(false);
<BottomSheet
  isOpen={isOpen}
  onOpenChange={setIsOpen}
  label="Filters">
  <FilterControls />
</BottomSheet>
\`\`\``,methods:[],displayName:`BottomSheet`,props:{xstyle:{required:!1,tsType:{name:`StyleXStyles`},description:"StyleX styles created via `stylex.create()`. Merged with the component's\nbase styles inside a single `stylex.props()` call for optimal deduplication.\n\n@example\n```\nconst overrides = stylex.create({ root: { marginBottom: 8 } });\n<Component xstyle={overrides.root} />\n```"},ref:{required:!1,tsType:{name:`ReactRef`,raw:`React.Ref<HTMLDialogElement>`,elements:[{name:`HTMLDialogElement`}]},description:`Ref forwarded to the underlying <dialog> element.`},isOpen:{required:!0,tsType:{name:`boolean`},description:"Whether the sheet is open. Fully controlled — pair with `onOpenChange`."},onOpenChange:{required:!0,tsType:{name:`signature`,type:`function`,raw:`(isOpen: boolean) => void`,signature:{arguments:[{type:{name:`boolean`},name:`isOpen`}],return:{name:`void`}}},description:`Called when the sheet opens or closes. The boolean is the requested next
state (\`false\` on Escape, scrim click, or a swipe past the dismiss
threshold). The caller owns the open state.`},label:{required:!0,tsType:{name:`string`},description:`Accessible label for the sheet (required — the sheet has no built-in
heading to derive a name from).`},children:{required:!0,tsType:{name:`ReactNode`},description:`Sheet content, rendered below the grab handle in a scrollable area.`},height:{required:!1,tsType:{name:`union`,raw:`BottomSheetHeight | number | string`,elements:[{name:`union`,raw:`keyof typeof HEIGHT_BUDGETS`,elements:[{name:`literal`,value:`hug`},{name:`literal`,value:`capped`},{name:`literal`,value:`tall`}]},{name:`number`},{name:`string`}]},description:"How tall the sheet is. A named budget, or any explicit height:\n- `'hug'` — fits its content, never taller than 92% of the viewport.\n- `'capped'` — a scrolling mid-height panel (~62%).\n- `'tall'` — a pinned near-full panel (~92%); use when content streams in\n  so the sheet doesn't resize under the user.\n- a `number` (px) or CSS length string (e.g. `'70dvh'`, `480`) for a\n  custom budget.\n\nThe user can still drag between snap points regardless of the starting\nheight. On viewports shorter than the budget the sheet fills the\navailable height.\n@default 'capped'",defaultValue:{value:`'capped'`,computed:!1}},hasScrim:{required:!1,tsType:{name:`boolean`},description:"Whether to render a modal scrim behind the sheet.\n- `true` (default) — `showModal()`: renders in the top layer with a focus\n  trap, a `::backdrop` scrim, body scroll lock, and tap-scrim-to-dismiss.\n  The background is inert. Use for focused tasks (filters, forms).\n- `false` — `show()`: a non-modal sheet with **no scrim**. The page behind\n  stays interactive and scrollable (like Material's *standard* bottom\n  sheet, or an iOS undimmed detent). Escape still closes while focus is\n  inside the sheet, and drag/flick-to-dismiss still work. Use for a peek\n  surface that coexists with the page (e.g. a panel over a live map).\n@default true",defaultValue:{value:`true`,computed:!1}},"data-testid":{required:!1,tsType:{name:`string`},description:`Test ID for the root element.`}},composes:[`Omit`]}})))()}var q,J,Y,X,Z,Q,$,le;function ue(){return(ue=e((()=>{q=t(),K(),d(),h(),x(),T(),C(),c(),D(),k(),y(),J=u(),Y={title:`Lab/BottomSheet`,component:V,tags:[`autodocs`],parameters:{layout:`fullscreen`,docs:{story:{inline:!1,height:`560px`}}},decorators:[e=>(0,J.jsx)(`div`,{style:{minHeight:480,padding:32},children:(0,J.jsx)(e,{})})]},X={render:()=>{let[e,t]=(0,q.useState)(!1);return(0,J.jsxs)(J.Fragment,{children:[(0,J.jsx)(f,{label:`Open sheet`,onClick:()=>t(!0)}),(0,J.jsx)(V,{isOpen:e,onOpenChange:t,label:`Filters`,children:(0,J.jsx)(E,{padding:4,children:(0,J.jsxs)(w,{gap:4,children:[(0,J.jsx)(S,{level:3,children:`Filters`}),(0,J.jsx)(g,{}),(0,J.jsxs)(w,{gap:2,children:[(0,J.jsx)(b,{label:`In stock`,value:!1}),(0,J.jsx)(b,{label:`On sale`,value:!1}),(0,J.jsx)(b,{label:`Free shipping`,value:!1})]}),(0,J.jsx)(f,{label:`Apply`,onClick:()=>t(!1)})]})})})]})}},Z={render:()=>{let[e,t]=(0,q.useState)(!1);return(0,J.jsxs)(J.Fragment,{children:[(0,J.jsx)(f,{label:`Open nearby places`,onClick:()=>t(!0)}),(0,J.jsx)(V,{isOpen:e,onOpenChange:t,label:`Nearby places`,height:`tall`,children:(0,J.jsx)(E,{padding:4,children:(0,J.jsxs)(w,{gap:3,children:[(0,J.jsx)(l,{type:`supporting`,color:`secondary`,children:`Drag the handle to resize between snap points; flick down to dismiss or up to expand. Escape also dismisses.`}),(0,J.jsx)(g,{}),Array.from({length:12},(e,t)=>(0,J.jsxs)(w,{gap:1,children:[(0,J.jsxs)(l,{type:`label`,children:[`Place `,t+1]}),(0,J.jsxs)(l,{type:`supporting`,color:`secondary`,children:[(.2+t*.3).toFixed(1),` mi away`]})]},t))]})})})]})}},Q={render:()=>{let[e,t]=(0,q.useState)(!1),[n,r]=(0,q.useState)(0);return(0,J.jsxs)(J.Fragment,{children:[(0,J.jsxs)(w,{gap:3,children:[(0,J.jsx)(S,{level:3,children:`Live page (background)`}),(0,J.jsxs)(l,{type:`supporting`,color:`secondary`,children:[`A non-modal sheet (hasScrim=`,`{false}`,`) leaves this content interactive. Open the sheet, then tap the counter below — it keeps working, and there is no dimming behind the sheet.`]}),(0,J.jsx)(f,{label:`Open sheet`,onClick:()=>t(!0)}),(0,J.jsx)(f,{label:`Background clicks: ${n}`,onClick:()=>r(e=>e+1)})]}),(0,J.jsx)(V,{isOpen:e,onOpenChange:t,label:`Nearby places`,hasScrim:!1,height:`capped`,children:(0,J.jsx)(E,{padding:4,children:(0,J.jsxs)(w,{gap:3,children:[(0,J.jsx)(S,{level:3,children:`Non-modal sheet`}),(0,J.jsx)(l,{type:`supporting`,color:`secondary`,children:`No scrim; the page behind stays live. Drag the handle to resize, flick down to dismiss, or press Escape while focus is here.`}),(0,J.jsx)(g,{}),Array.from({length:8},(e,t)=>(0,J.jsxs)(w,{gap:1,children:[(0,J.jsxs)(l,{type:`label`,children:[`Place `,t+1]}),(0,J.jsxs)(l,{type:`supporting`,color:`secondary`,children:[(.2+t*.3).toFixed(1),` mi away`]})]},t))]})})})]})}},$={render:()=>{let[e,t]=(0,q.useState)(!1);return(0,J.jsxs)(J.Fragment,{children:[(0,J.jsx)(f,{label:`Add a comment`,onClick:()=>t(!0)}),(0,J.jsx)(V,{isOpen:e,onOpenChange:t,label:`Add a comment`,height:`hug`,children:(0,J.jsx)(E,{padding:4,children:(0,J.jsxs)(w,{gap:4,children:[(0,J.jsx)(S,{level:3,children:`Add a comment`}),(0,J.jsx)(l,{type:`supporting`,color:`secondary`,children:`The sheet fits its content, up to 92% of the viewport.`}),(0,J.jsx)(g,{}),(0,J.jsx)(O,{label:`Title`,value:``}),(0,J.jsx)(A,{label:`Comment`,rows:4,value:``}),(0,J.jsx)(f,{label:`Post`,onClick:()=>t(!1)})]})})})]})}},X.parameters={...X.parameters,docs:{...X.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    return <>
        <Button label="Open sheet" onClick={() => setIsOpen(true)} />
        <BottomSheet isOpen={isOpen} onOpenChange={setIsOpen} label="Filters">
          <Section padding={4}>
            <VStack gap={4}>
              <Heading level={3}>Filters</Heading>
              <Divider />
              <VStack gap={2}>
                <CheckboxInput label="In stock" value={false} />
                <CheckboxInput label="On sale" value={false} />
                <CheckboxInput label="Free shipping" value={false} />
              </VStack>
              <Button label="Apply" onClick={() => setIsOpen(false)} />
            </VStack>
          </Section>
        </BottomSheet>
      </>;
  }
}`,...X.parameters?.docs?.source}}},Z.parameters={...Z.parameters,docs:{...Z.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    return <>
        <Button label="Open nearby places" onClick={() => setIsOpen(true)} />
        <BottomSheet isOpen={isOpen} onOpenChange={setIsOpen} label="Nearby places" height="tall">
          <Section padding={4}>
            <VStack gap={3}>
              <Text type="supporting" color="secondary">
                Drag the handle to resize between snap points; flick down to
                dismiss or up to expand. Escape also dismisses.
              </Text>
              <Divider />
              {Array.from({
              length: 12
            }, (_, i) => <VStack key={i} gap={1}>
                  <Text type="label">Place {i + 1}</Text>
                  <Text type="supporting" color="secondary">
                    {(0.2 + i * 0.3).toFixed(1)} mi away
                  </Text>
                </VStack>)}
            </VStack>
          </Section>
        </BottomSheet>
      </>;
  }
}`,...Z.parameters?.docs?.source}}},Q.parameters={...Q.parameters,docs:{...Q.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    const [count, setCount] = useState(0);
    return <>
        {/* With hasScrim={false} the sheet is non-modal: this background stays
            clickable while the sheet is open (no scrim, no scroll lock). Open
            the sheet, then tap the counter — it still responds. The story
            renders in its own iframe in Docs (see meta docs.story), so the
            sheet gets a real mini-viewport and behaves correctly. */}
        <VStack gap={3}>
          <Heading level={3}>Live page (background)</Heading>
          <Text type="supporting" color="secondary">
            A non-modal sheet (hasScrim={'{false}'}) leaves this content
            interactive. Open the sheet, then tap the counter below — it keeps
            working, and there is no dimming behind the sheet.
          </Text>
          <Button label="Open sheet" onClick={() => setIsOpen(true)} />
          <Button label={\`Background clicks: \${count}\`} onClick={() => setCount(c => c + 1)} />
        </VStack>
        <BottomSheet isOpen={isOpen} onOpenChange={setIsOpen} label="Nearby places" hasScrim={false} height="capped">
          <Section padding={4}>
            <VStack gap={3}>
              <Heading level={3}>Non-modal sheet</Heading>
              <Text type="supporting" color="secondary">
                No scrim; the page behind stays live. Drag the handle to resize,
                flick down to dismiss, or press Escape while focus is here.
              </Text>
              <Divider />
              {Array.from({
              length: 8
            }, (_, i) => <VStack key={i} gap={1}>
                  <Text type="label">Place {i + 1}</Text>
                  <Text type="supporting" color="secondary">
                    {(0.2 + i * 0.3).toFixed(1)} mi away
                  </Text>
                </VStack>)}
            </VStack>
          </Section>
        </BottomSheet>
      </>;
  }
}`,...Q.parameters?.docs?.source}}},$.parameters={...$.parameters,docs:{...$.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    return <>
        <Button label="Add a comment" onClick={() => setIsOpen(true)} />
        <BottomSheet isOpen={isOpen} onOpenChange={setIsOpen} label="Add a comment" height="hug">
          <Section padding={4}>
            <VStack gap={4}>
              <Heading level={3}>Add a comment</Heading>
              <Text type="supporting" color="secondary">
                The sheet fits its content, up to 92% of the viewport.
              </Text>
              <Divider />
              <TextInput label="Title" value="" />
              <TextArea label="Comment" rows={4} value="" />
              <Button label="Post" onClick={() => setIsOpen(false)} />
            </VStack>
          </Section>
        </BottomSheet>
      </>;
  }
}`,...$.parameters?.docs?.source}}},le=[`Showcase`,`TallSheet`,`NonModal`,`HugHeight`]})))()}ue();export{$ as HugHeight,Q as NonModal,X as Showcase,Z as TallSheet,le as __namedExportsOrder,Y as default};