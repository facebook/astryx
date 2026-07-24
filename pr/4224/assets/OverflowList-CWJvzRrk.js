import{a as e,n as t}from"./rolldown-runtime-DaJ6WEGw.js";import{t as n}from"./react-DvlgmmzG.js";import{l as r,n as i,t as a,u as o}from"./themeProps-DlHa58hS.js";import{_ as s,t as c,y as l}from"./utils-SBEvDdeo.js";import{b as u,v as d,y as f}from"./Text-Bs-khaxO.js";import{t as p}from"./jsx-runtime-cM__dR4X.js";import{n as m,t as h}from"./useIsomorphicLayoutEffect-sjqaHMjg.js";function g(e,t,n){return Math.max(Math.min(e,n),t)}function _(e,t,n){return{floor:Math.max(0,Math.min(t,e)),ceiling:Math.max(0,Math.min(n??e,e))}}function v(e,t,n,r,i,a){let o=0,s=0;for(let c=0;c<e.length&&!(s>=a);c++){let a=e[c],l=c>0?t:0,u=o+a+l;if(u+(c===e.length-1?0:r+(s>0||r>0?t:0))>n&&s>=i)break;o=u,s++}return s}function y(e,t,n,r,i){let a=0,o=1,s=0;for(let c=0;c<e.length;c++){let l=e[c],u=s===0,d=u?l:s+t+l,f=o===i,p=f&&r>0?r+t:0;if(d+p<=n){s=d,a++;continue}if(u){if(f&&p>0)break;s=d,a++;continue}if(o>=i)break;o++,s=0,c--}return{placed:a,rows:o}}function b(e,t,n){if(e.length===0)return 0;let r=1,i=0;for(let a=0;a<e.length;a++){let o=e[a],s=i===0,c=s?o:i+t+o;c<=n||s?i=c:(r++,i=o)}return r}function x(e,t,n,r,i){let a=e.length;if(a===0)return{count:0,rows:0};let o=y(e,t,n,0,i);if(o.placed===a)return{count:a,rows:o.rows};let s=y(e,t,n,r,i).placed,c=b(e.slice(0,s),t,n);return{count:s,rows:Math.max(+(s>0),c)}}function S(e){let{widths:t,gap:n,availableWidth:r,indicatorWidth:i,minVisibleItems:a,maxVisibleItems:o,maxRows:s,collapseFrom:c}=e,l=t.length;if(l===0)return{visibleCount:0,rows:0};let{floor:u,ceiling:d}=_(l,a,o),f=c===`end`?t:[...t].reverse();if(!(s!=null&&s>1)){let e=g(v(f,n,r,i,u,d),u,d);return{visibleCount:e,rows:+(e>0)}}let{count:p,rows:m}=x(f,n,r,i,s),h=g(p,u,d),y=h===p?m:b(f.slice(0,h),n,r);return{visibleCount:h,rows:h>0?Math.max(1,y):0}}var C=t((()=>{}));function w(e,t={}){let{gap:n=0,minVisibleItems:r=0,maxVisibleItems:i,maxRows:a,collapseFrom:o=`end`,behavior:s=`observeSelf`}=t,c=s===`observeParent`,[l,d]=(0,T.useState)(e),[p,h]=(0,T.useState)(1),[g,_]=(0,T.useState)(0),v=(0,T.useRef)(null),y=(0,T.useRef)(null),b=(0,T.useRef)(null),x=(0,T.useCallback)(()=>{let t=v.current,s=y.current;if(!t||!s)return;let l;if(c&&t.parentElement){let e=t.parentElement,n=getComputedStyle(e);l=e.clientWidth-parseFloat(n.paddingLeft)-parseFloat(n.paddingRight)}else l=t.offsetWidth;let u=Array.from(s.children),f=u.length>e,p=f?u.slice(0,e):u,m=f?u[u.length-1].offsetWidth:0;if(p.length===0){d(0),h(0);return}let g=p.map(e=>e.offsetWidth),b=p.reduce((e,t)=>Math.max(e,t.offsetHeight||0),0),{visibleCount:x,rows:C}=S({widths:g,gap:n,availableWidth:l,indicatorWidth:m,minVisibleItems:r,maxVisibleItems:i,maxRows:a,collapseFrom:o});d(x),h(e=>e===C?e:C),_(e=>e===b?e:b)},[e,n,r,i,a,o,c]),C=(0,T.useCallback)(e=>{if(v.current=e,b.current&&=(u(b.current),null),e){let t=c&&e.parentElement?e.parentElement:e;f(t,()=>{x()}),b.current=t}},[x,c]),w=(0,T.useCallback)(e=>{y.current=e,e&&x()},[x]);return m(()=>{x()},[x]),{containerRef:C,measureRef:w,visibleCount:l,hasOverflow:l<e,rows:p,rowHeight:g}}var T,E=t((()=>{T=e(n(),1),h(),d(),C()}));function D({children:e,gap:t=2,minVisibleItems:n=0,maxVisibleItems:r,maxRows:a,collapseFrom:c=`end`,behavior:u=`observeSelf`,overflowRenderer:d,xstyle:f,className:p,style:m,ref:h,...g}){let _=O.Children.toArray(e),v=_.length,y=P[t],b=u===`observeParent`,x=a!=null&&a>1,{containerRef:S,measureRef:C,visibleCount:T,hasOverflow:E,rowHeight:D}=w(v,{gap:y,minVisibleItems:n,maxVisibleItems:r,maxRows:a,collapseFrom:c,behavior:u}),j=_.map((e,t)=>({child:e,index:t})),F,I;c===`end`?(F=j.slice(0,T),I=j.slice(T)):(F=j.slice(v-T),I=j.slice(0,v-T));let L=d?.(j);return(0,k.jsxs)(k.Fragment,{children:[(0,k.jsxs)(`div`,{ref:C,"aria-hidden":`true`,inert:!0,...o(A.measureContainer,N[t]),children:[_,L!=null&&(0,k.jsx)(`div`,{className:`astryx3nfvp2`,children:L})]}),(0,k.jsxs)(`div`,{ref:s(h,S),...l(i(`overflow-list`),o(x?A.containerMultiRow:A.container,N[t],x&&D>0&&a!=null&&M.height(a,D,y),b&&E&&A.fillParent,f),p,m),...g,children:[c===`start`&&E&&d?.(I),F.map(({child:e})=>e),c===`end`&&E&&d?.(I)]})]})}var O,k,A,j,M,N,P,F=t((()=>{O=e(n(),1),r(),c(),E(),a(),k=p(),A={container:{k1xSpc:`astryx78zum5`,kGNEyG:`astryx6s0dn4`,kVQacm:`astryxb3r6kr`,khDVqt:`astryxuxw1ft`,k7Eaqz:`astryxeuugli`,$$css:!0},containerMultiRow:{k1xSpc:`astryx78zum5`,kwnvtZ:`astryx1a02dak`,kfiyM8:`astryx8gbvx8`,kVQacm:`astryxb3r6kr`,khDVqt:`astryxeaf4i8`,k7Eaqz:`astryxeuugli`,$$css:!0},fillParent:{kzqmXN:`astryxh8yej3`,$$css:!0},measureContainer:{kVAEAm:`astryx10l6tqk`,k33iCy:`astryxlshs6z`,kZKoxP:`astryxqtp20y`,kVQacm:`astryxb3r6kr`,k1xSpc:`astryx78zum5`,kGNEyG:`astryx6s0dn4`,khDVqt:`astryxuxw1ft`,kfzvcC:`astryx47corl`,$$css:!0}},j={kskxy:`astryx1jols5v`,$$css:!0},M={height:(e,t,n)=>[j,{"--x-maxHeight":(e=>typeof e==`number`?e+`px`:e??void 0)(`calc(${t}px * ${e} + ${n}px * ${e-1})`)}]},N={0:{kOIVth:`astryxsn7fz1`,khm7nJ:null,k1C7PZ:null,$$css:!0},1:{kOIVth:`astryxzye2dw`,khm7nJ:null,k1C7PZ:null,$$css:!0},2:{kOIVth:`astryx1txdalj`,khm7nJ:null,k1C7PZ:null,$$css:!0},3:{kOIVth:`astryxjcht0a`,khm7nJ:null,k1C7PZ:null,$$css:!0},4:{kOIVth:`astryx18g69wz`,khm7nJ:null,k1C7PZ:null,$$css:!0},5:{kOIVth:`astryx9mgr7n`,khm7nJ:null,k1C7PZ:null,$$css:!0},6:{kOIVth:`astryx1qh66ti`,khm7nJ:null,k1C7PZ:null,$$css:!0},8:{kOIVth:`astryx4t41sb`,khm7nJ:null,k1C7PZ:null,$$css:!0},10:{kOIVth:`astryx3hoi3v`,khm7nJ:null,k1C7PZ:null,$$css:!0},"0.5":{kOIVth:`astryx1lsbc85`,khm7nJ:null,k1C7PZ:null,$$css:!0},"1.5":{kOIVth:`astryx1s4dlld`,khm7nJ:null,k1C7PZ:null,$$css:!0}},P={0:0,.5:2,1:4,1.5:6,2:8,3:12,4:16,5:20,6:24,8:32,10:40},D.displayName=`OverflowList`,D.__docgenInfo={description:`A horizontal list that hides items that don't fit and shows an overflow indicator.

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
\`\`\``}},composes:[`Omit`]}})),I=t((()=>{F()}));export{D as n,F as r,I as t};