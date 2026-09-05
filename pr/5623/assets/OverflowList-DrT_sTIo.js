import{i as e,s as t}from"./preload-helper-CT_b8DTk.js";import{t as n}from"./react-B7Te67-h.js";import{D as r,E as i,F as a,P as o}from"./ime-Dy4QRKoo.js";import{P as s,t as c}from"./utils-eYNPhPe_.js";import{t as l}from"./jsx-runtime-DqZldVDK.js";import{n as u,t as d}from"./useMergedRefs-BMVAJ2uJ.js";import{n as f,t as p}from"./useIsomorphicLayoutEffect-AEBSTB0m.js";import{h as m,m as h}from"./hooks-D_Q3JwTM.js";function g({children:e,gap:t=2,minVisibleItems:n=0,maxVisibleItems:i,maxRows:o,collapseFrom:c=`end`,behavior:l=`observeSelf`,overflowRenderer:d,onOverflowChange:p,xstyle:h,className:g,style:b,ref:w,...T}){let E=_.Children.toArray(e),D=E.length,O=C[t],k=l===`observeParent`,A=o!=null&&o>1,{containerRef:j,measureRef:M,visibleCount:N,hasOverflow:P,rowHeight:F}=m(D,{gap:O,minVisibleItems:n,maxVisibleItems:i,maxRows:o,collapseFrom:c,behavior:l}),I=E.map((e,t)=>({child:e,index:t})),L,R;c===`end`?(L=I.slice(0,N),R=I.slice(N)):(L=I.slice(D-N),R=I.slice(0,D-N));let z=d?.(I),B=p?JSON.stringify({children:E.map((e,t)=>[t,e.key]),gap:t,minVisibleItems:n,maxVisibleItems:i,maxRows:o,collapseFrom:c,behavior:l}):``,[V,H]=(0,_.useState)(B),U=(0,_.useCallback)(e=>{M(e),e&&H(B)},[M,B]),W=p?JSON.stringify(R.map(({child:e,index:t})=>[t,e.key])):`[]`,G=(0,_.useRef)(`[]`),K=(0,_.useRef)(R);return K.current=R,f(()=>{!p||V!==B||G.current===W||(G.current=W,p(K.current))},[V,B,W,p]),(0,v.jsxs)(v.Fragment,{children:[(0,v.jsxs)(`div`,{ref:U,"aria-hidden":`true`,inert:!0,...a(y.measureContainer,S[t]),children:[E,z!=null&&(0,v.jsx)(`div`,{className:`astryx3nfvp2`,children:z})]}),(0,v.jsxs)(`div`,{ref:u(w,j),...s(r(`overflow-list`),a(A?y.containerMultiRow:y.container,S[t],A&&F>0&&o!=null&&x.height(o,F,O),k&&P&&y.fillParent,h),g,b),...T,children:[c===`start`&&P&&d?.(R),L.map(({child:e})=>e),c===`end`&&P&&d?.(R)]})]})}var _,v,y,b,x,S,C,w=e((()=>{_=t(n(),1),o(),c(),h(),p(),i(),d(),v=l(),y={container:{k1xSpc:`astryx78zum5`,kGNEyG:`astryx6s0dn4`,kVQacm:`astryxb3r6kr`,khDVqt:`astryxuxw1ft`,k7Eaqz:`astryxeuugli`,$$css:!0},containerMultiRow:{k1xSpc:`astryx78zum5`,kwnvtZ:`astryx1a02dak`,kfiyM8:`astryx8gbvx8`,kVQacm:`astryxb3r6kr`,khDVqt:`astryxeaf4i8`,k7Eaqz:`astryxeuugli`,$$css:!0},fillParent:{kzqmXN:`astryxh8yej3`,$$css:!0},measureContainer:{kVAEAm:`astryx10l6tqk`,k33iCy:`astryxlshs6z`,kZKoxP:`astryxqtp20y`,kVQacm:`astryxb3r6kr`,k1xSpc:`astryx78zum5`,kGNEyG:`astryx6s0dn4`,khDVqt:`astryxuxw1ft`,kfzvcC:`astryx47corl`,$$css:!0}},b={kskxy:`astryx1jols5v`,$$css:!0},x={height:(e,t,n)=>[b,{"--x-maxHeight":(e=>typeof e==`number`?e+`px`:e??void 0)(`calc(${t}px * ${e} + ${n}px * ${e-1})`)}]},S={0:{kOIVth:`astryxsn7fz1`,khm7nJ:null,k1C7PZ:null,$$css:!0},1:{kOIVth:`astryxzye2dw`,khm7nJ:null,k1C7PZ:null,$$css:!0},2:{kOIVth:`astryx1txdalj`,khm7nJ:null,k1C7PZ:null,$$css:!0},3:{kOIVth:`astryxjcht0a`,khm7nJ:null,k1C7PZ:null,$$css:!0},4:{kOIVth:`astryx18g69wz`,khm7nJ:null,k1C7PZ:null,$$css:!0},5:{kOIVth:`astryx9mgr7n`,khm7nJ:null,k1C7PZ:null,$$css:!0},6:{kOIVth:`astryx1qh66ti`,khm7nJ:null,k1C7PZ:null,$$css:!0},8:{kOIVth:`astryx4t41sb`,khm7nJ:null,k1C7PZ:null,$$css:!0},10:{kOIVth:`astryx3hoi3v`,khm7nJ:null,k1C7PZ:null,$$css:!0},"0.5":{kOIVth:`astryx1lsbc85`,khm7nJ:null,k1C7PZ:null,$$css:!0},"1.5":{kOIVth:`astryx1s4dlld`,khm7nJ:null,k1C7PZ:null,$$css:!0}},C={0:0,.5:2,1:4,1.5:6,2:8,3:12,4:16,5:20,6:24,8:32,10:40},g.displayName=`OverflowList`,g.__docgenInfo={description:`A horizontal list that hides items that don't fit and shows an overflow indicator.

Uses a hidden measurement container to determine which items fit without
causing visual flickering. The overflow indicator is also measured
automatically so no manual width value is needed.

@example
\`\`\`
<OverflowList
  gap={2}
  overflowRenderer={(items) => (
    <Button label={\`+\${items.length} more\`} variant="ghost" />
  )}>
  <Button label="Action 1" />
  <Button label="Action 2" />
  <Button label="Action 3" />
  <Button label="Action 4" />
</OverflowList>
\`\`\``,methods:[],displayName:`OverflowList`,props:{xstyle:{required:!1,tsType:{name:`StyleXStyles`},description:"StyleX styles created via `stylex.create()`. Merged with the component's\nbase styles inside a single `stylex.props()` call for optimal deduplication.\n\n@example\n```\nconst overrides = stylex.create({ root: { marginBottom: 8 } });\n<Component xstyle={overrides.root} />\n```"},ref:{required:!1,tsType:{name:`ReactRef`,raw:`React.Ref<HTMLDivElement>`,elements:[{name:`HTMLDivElement`}]},description:`Ref forwarded to the visible container element`},children:{required:!0,tsType:{name:`ReactNode`},description:`The items to render. Each child should be a single element.`},gap:{required:!1,tsType:{name:`union`,raw:`0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10`,elements:[{name:`literal`,value:`0`},{name:`literal`,value:`0.5`},{name:`literal`,value:`1`},{name:`literal`,value:`1.5`},{name:`literal`,value:`2`},{name:`literal`,value:`3`},{name:`literal`,value:`4`},{name:`literal`,value:`5`},{name:`literal`,value:`6`},{name:`literal`,value:`8`},{name:`literal`,value:`10`}]},description:`Gap between items as a spacing token step.
Accepts: 0, 0.5, 1, 1.5, 2, 3, 4, 5, 6, 8, 10
@default 2`,defaultValue:{value:`2`,computed:!1}},minVisibleItems:{required:!1,tsType:{name:`number`},description:`Minimum number of items to always show.
@default 0`,defaultValue:{value:`0`,computed:!1}},maxVisibleItems:{required:!1,tsType:{name:`number`},description:`Maximum number of items to ever show, even when they all fit. The ceiling
partner to \`minVisibleItems\`; extra items collapse into the overflow
indicator. Leave undefined for no cap. If it is less than
\`minVisibleItems\`, the floor wins (and a dev-only warning is logged).
@default undefined`},maxRows:{required:!1,tsType:{name:`number`},description:`Wrap items across up to this many rows before collapsing the remainder
into the overflow indicator. Leave undefined (or set \`1\`) for the default
single-line behavior. A number, not a boolean — unbounded wrapping is a
plain flex-wrap layout, not overflow collapse. Assumes uniform row height.
@default undefined`},collapseFrom:{required:!1,tsType:{name:`union`,raw:`'start' | 'end'`,elements:[{name:`literal`,value:`'start'`},{name:`literal`,value:`'end'`}]},description:`Which end to collapse items from.
@default 'end'`,defaultValue:{value:`'end'`,computed:!1}},behavior:{required:!1,tsType:{name:`union`,raw:`'observeParent' | 'observeSelf'`,elements:[{name:`literal`,value:`'observeParent'`},{name:`literal`,value:`'observeSelf'`}]},description:`Which element to observe for overflow calculations.
- \`'observeSelf'\`: uses the container's own width (default)
- \`'observeParent'\`: observes the parent element's content width
  for overflow calculations. This keeps the overflow list
  content-sized while still detecting available space for
  grow-back. Siblings that don't fit can wrap and be clipped by
  the parent's overflow.
@default 'observeSelf'`,defaultValue:{value:`'observeSelf'`,computed:!1}},overflowRenderer:{required:!1,tsType:{name:`signature`,type:`function`,raw:`(overflowItems: OverflowItem[]) => ReactNode`,signature:{arguments:[{type:{name:`Array`,elements:[{name:`OverflowItem`}],raw:`OverflowItem[]`},name:`overflowItems`}],return:{name:`ReactNode`}}},description:`Render function for the overflow indicator. Receives the list of
items that are not visible, each with its original index. Only called
when there are overflowing items.

The indicator is automatically measured in a hidden container to
reserve the correct amount of space.

@example
\`\`\`
const labels = ['Save', 'Edit', 'Share'];
<OverflowList
  overflowRenderer={(overflowItems) => (
    <DropdownMenu
      button={{label: \`+\${overflowItems.length}\`, variant: 'ghost'}}
      items={overflowItems.map(({index}) => ({ label: labels[index] }))}
    />
  )}>
  {labels.map(l => <Button key={l} label={l} />)}
</OverflowList>
\`\`\``},onOverflowChange:{required:!1,tsType:{name:`signature`,type:`function`,raw:`(overflowItems: OverflowItem[]) => void`,signature:{arguments:[{type:{name:`Array`,elements:[{name:`OverflowItem`}],raw:`OverflowItem[]`},name:`overflowItems`}],return:{name:`void`}}},description:`Called with the items that are currently collapsed, whenever that set
changes.

Use it when the collapsed items belong in a menu the surrounding UI
already renders (a row that already has its own "…" button), so the list
does not grow a second anchor beside it. \`overflowRenderer\` cannot serve
that case: it is only rendered while items overflow, and its measurement
copy always receives every item.

The contract:
- It fires once measurement has collapsed something, and again with an
  empty array once the row widens back out and everything fits.
- It is **silent while nothing overflows** — including on mount, so a list
  that fits from the start never calls it. There is no report of the
  pre-measurement state, which would always be an empty set whether or not
  the row actually overflows. Hold the collapsed set in state initialised
  to \`[]\` and it is correct at every moment; if you remount the list while
  keeping that state, reset it yourself.
- Reports are keyed on the collapsed items' original indices and React
  keys. Membership and order changes report even when the count stays the
  same; unrelated re-renders and callback identity changes do not.

Give dynamic children stable React keys. Items include their current
original \`index\`; use it to look up your own data rather than storing
\`child\`.

@example
\`\`\`
const [hidden, setHidden] = useState<OverflowItem[]>([]);
<>
  <OverflowList onOverflowChange={setHidden}>{items}</OverflowList>
  <DropdownMenu
    button={{label: 'More', variant: 'ghost'}}
    items={[...alwaysThere, ...hidden.map(({index}) => actions[index])]}
  />
</>
\`\`\``}},composes:[`Omit`]}})),T=e((()=>{w()}));export{g as n,w as r,T as t};