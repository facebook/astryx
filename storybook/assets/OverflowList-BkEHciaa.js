import{i as e,s as t}from"./preload-helper-CT_b8DTk.js";import{t as n}from"./react-B7Te67-h.js";import{l as r,n as i,t as a,u as o}from"./themeProps-_oSbOSxB.js";import{S as s,b as c,t as l}from"./utils-CD2ovDaz.js";import{t as u}from"./jsx-runtime-DqZldVDK.js";import{n as d,t as f}from"./useOverflow-BK7rNEF-.js";function p({children:e,gap:t=2,minVisibleItems:n=0,maxVisibleItems:r,maxRows:a,collapseFrom:l=`end`,behavior:u=`observeSelf`,overflowRenderer:f,xstyle:p,className:_,style:x,ref:S,...C}){let w=m.Children.toArray(e),T=w.length,E=b[t],D=u===`observeParent`,O=a!=null&&a>1,{containerRef:k,measureRef:A,visibleCount:j,hasOverflow:M,rowHeight:N}=d(T,{gap:E,minVisibleItems:n,maxVisibleItems:r,maxRows:a,collapseFrom:l,behavior:u}),P=w.map((e,t)=>({child:e,index:t})),F,I;l===`end`?(F=P.slice(0,j),I=P.slice(j)):(F=P.slice(T-j),I=P.slice(0,T-j));let L=f?.(P);return(0,h.jsxs)(h.Fragment,{children:[(0,h.jsxs)(`div`,{ref:A,"aria-hidden":`true`,inert:!0,...o(g.measureContainer,y[t]),children:[w,L!=null&&(0,h.jsx)(`div`,{className:`astryx3nfvp2`,children:L})]}),(0,h.jsxs)(`div`,{ref:c(S,k),...s(i(`overflow-list`),o(O?g.containerMultiRow:g.container,y[t],O&&N>0&&a!=null&&v.height(a,N,E),D&&M&&g.fillParent,p),_,x),...C,children:[l===`start`&&M&&f?.(I),F.map(({child:e})=>e),l===`end`&&M&&f?.(I)]})]})}var m,h,g,_,v,y,b,x=e((()=>{m=t(n(),1),r(),l(),f(),a(),h=u(),g={container:{k1xSpc:`astryx78zum5`,kGNEyG:`astryx6s0dn4`,kVQacm:`astryxb3r6kr`,khDVqt:`astryxuxw1ft`,k7Eaqz:`astryxeuugli`,$$css:!0},containerMultiRow:{k1xSpc:`astryx78zum5`,kwnvtZ:`astryx1a02dak`,kfiyM8:`astryx8gbvx8`,kVQacm:`astryxb3r6kr`,khDVqt:`astryxeaf4i8`,k7Eaqz:`astryxeuugli`,$$css:!0},fillParent:{kzqmXN:`astryxh8yej3`,$$css:!0},measureContainer:{kVAEAm:`astryx10l6tqk`,k33iCy:`astryxlshs6z`,kZKoxP:`astryxqtp20y`,kVQacm:`astryxb3r6kr`,k1xSpc:`astryx78zum5`,kGNEyG:`astryx6s0dn4`,khDVqt:`astryxuxw1ft`,kfzvcC:`astryx47corl`,$$css:!0}},_={kskxy:`astryx1jols5v`,$$css:!0},v={height:(e,t,n)=>[_,{"--x-maxHeight":(e=>typeof e==`number`?e+`px`:e??void 0)(`calc(${t}px * ${e} + ${n}px * ${e-1})`)}]},y={0:{kOIVth:`astryxsn7fz1`,khm7nJ:null,k1C7PZ:null,$$css:!0},1:{kOIVth:`astryxzye2dw`,khm7nJ:null,k1C7PZ:null,$$css:!0},2:{kOIVth:`astryx1txdalj`,khm7nJ:null,k1C7PZ:null,$$css:!0},3:{kOIVth:`astryxjcht0a`,khm7nJ:null,k1C7PZ:null,$$css:!0},4:{kOIVth:`astryx18g69wz`,khm7nJ:null,k1C7PZ:null,$$css:!0},5:{kOIVth:`astryx9mgr7n`,khm7nJ:null,k1C7PZ:null,$$css:!0},6:{kOIVth:`astryx1qh66ti`,khm7nJ:null,k1C7PZ:null,$$css:!0},8:{kOIVth:`astryx4t41sb`,khm7nJ:null,k1C7PZ:null,$$css:!0},10:{kOIVth:`astryx3hoi3v`,khm7nJ:null,k1C7PZ:null,$$css:!0},"0.5":{kOIVth:`astryx1lsbc85`,khm7nJ:null,k1C7PZ:null,$$css:!0},"1.5":{kOIVth:`astryx1s4dlld`,khm7nJ:null,k1C7PZ:null,$$css:!0}},b={0:0,.5:2,1:4,1.5:6,2:8,3:12,4:16,5:20,6:24,8:32,10:40},p.displayName=`OverflowList`,p.__docgenInfo={description:`A horizontal list that hides items that don't fit and shows an overflow indicator.

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
\`\`\``}},composes:[`Omit`]}})),S=e((()=>{x()}));export{p as n,x as r,S as t};