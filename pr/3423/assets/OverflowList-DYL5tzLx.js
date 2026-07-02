import{ah as o,aG as Z,ac as J,aH as N,a1 as k,af as T,a6 as j,ay as B,a7 as M}from"./iframe-FpdBIrKz.js";function G(l,h={}){const{gap:v=0,minVisibleItems:r=0,collapseFrom:p="end",behavior:y="observeSelf"}=h,m=y==="observeParent",[w,x]=o.useState(l),g=o.useRef(null),I=o.useRef(null),i=o.useRef(null),n=o.useCallback(()=>{const e=g.current,s=I.current;if(!e||!s)return;let c;if(m&&e.parentElement){const a=e.parentElement,R=getComputedStyle(a);c=a.clientWidth-parseFloat(R.paddingLeft)-parseFloat(R.paddingRight)}else c=e.offsetWidth;const t=Array.from(s.children),d=t.length>l,u=d?t.slice(0,l):t,b=d?t[t.length-1].offsetWidth:0;if(u.length===0){x(0);return}const f=u.map(a=>a.offsetWidth);let $=0,O=0;const S=p==="end"?f:[...f].reverse();for(let a=0;a<S.length;a++){const R=S[a],L=a>0?v:0,q=$+R+L,A=a===S.length-1?0:b+(O>0||b>0?v:0);if(q+A>c&&O>=r)break;$=q,O++}x(Math.max(Math.min(O,l),r))},[l,v,r,p,m]),P=o.useCallback(e=>{if(g.current=e,i.current&&(Z(i.current),i.current=null),e){const s=m&&e.parentElement?e.parentElement:e;J(s,()=>{n()}),i.current=s}},[n,m]),V=o.useCallback(e=>{I.current=e,e&&n()},[n]);N(()=>{n()},[n]);const C=w<l;return{containerRef:P,measureRef:V,visibleCount:w,hasOverflow:C}}const E={container:{k1xSpc:"astryx78zum5",kGNEyG:"astryx6s0dn4",kVQacm:"astryxb3r6kr",khDVqt:"astryxuxw1ft",k7Eaqz:"astryxeuugli",$$css:!0},fillParent:{kzqmXN:"astryxh8yej3",$$css:!0},measureContainer:{kVAEAm:"astryx10l6tqk",k33iCy:"astryxlshs6z",kZKoxP:"astryxqtp20y",kVQacm:"astryxb3r6kr",k1xSpc:"astryx78zum5",kGNEyG:"astryx6s0dn4",khDVqt:"astryxuxw1ft",kfzvcC:"astryx47corl",$$css:!0}},W={0:{kOIVth:"astryxsn7fz1",khm7nJ:null,k1C7PZ:null,$$css:!0},1:{kOIVth:"astryxzye2dw",khm7nJ:null,k1C7PZ:null,$$css:!0},2:{kOIVth:"astryx1txdalj",khm7nJ:null,k1C7PZ:null,$$css:!0},3:{kOIVth:"astryxjcht0a",khm7nJ:null,k1C7PZ:null,$$css:!0},4:{kOIVth:"astryx18g69wz",khm7nJ:null,k1C7PZ:null,$$css:!0},5:{kOIVth:"astryx9mgr7n",khm7nJ:null,k1C7PZ:null,$$css:!0},6:{kOIVth:"astryx1qh66ti",khm7nJ:null,k1C7PZ:null,$$css:!0},8:{kOIVth:"astryx4t41sb",khm7nJ:null,k1C7PZ:null,$$css:!0},10:{kOIVth:"astryx3hoi3v",khm7nJ:null,k1C7PZ:null,$$css:!0},"0.5":{kOIVth:"astryx1lsbc85",khm7nJ:null,k1C7PZ:null,$$css:!0},"1.5":{kOIVth:"astryx1s4dlld",khm7nJ:null,k1C7PZ:null,$$css:!0}},D={0:0,.5:2,1:4,1.5:6,2:8,3:12,4:16,5:20,6:24,8:32,10:40};function z({children:l,gap:h=2,minVisibleItems:v=0,collapseFrom:r="end",behavior:p="observeSelf",overflowRenderer:y,xstyle:m,className:w,style:x,ref:g,...I}){const i=o.Children.toArray(l),n=i.length,P=D[h],V=p==="observeParent",{containerRef:C,measureRef:e,visibleCount:s,hasOverflow:c}=G(n,{gap:P,minVisibleItems:v,collapseFrom:r,behavior:p}),t=i.map((f,$)=>({child:f,index:$}));let d,u;r==="end"?(d=t.slice(0,s),u=t.slice(s)):(d=t.slice(n-s),u=t.slice(0,n-s));const b=y?.(t);return k.jsxs(k.Fragment,{children:[k.jsxs("div",{ref:e,"aria-hidden":"true",inert:!0,...T(E.measureContainer,W[h]),children:[i,b!=null&&k.jsx("div",{className:"astryx3nfvp2",children:b})]}),k.jsxs("div",{ref:M(g,C),...j(B("overflow-list"),T(E.container,W[h],V&&c&&E.fillParent,m),w,x),...I,children:[r==="start"&&c&&y?.(u),d.map(({child:f})=>f),r==="end"&&c&&y?.(u)]})]})}z.displayName="OverflowList";z.__docgenInfo={description:`A horizontal list that hides items that don't fit and shows an overflow indicator.

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
\`\`\``,methods:[],displayName:"OverflowList",props:{xstyle:{required:!1,tsType:{name:"StyleXStyles"},description:"StyleX styles created via `stylex.create()`. Merged with the component's\nbase styles inside a single `stylex.props()` call for optimal deduplication.\n\n@example\n```\nconst overrides = stylex.create({ root: { marginBottom: 8 } });\n<Component xstyle={overrides.root} />\n```"},ref:{required:!1,tsType:{name:"ReactRef",raw:"React.Ref<HTMLDivElement>",elements:[{name:"HTMLDivElement"}]},description:"Ref forwarded to the visible container element"},children:{required:!0,tsType:{name:"ReactNode"},description:"The items to render. Each child should be a single element."},gap:{required:!1,tsType:{name:"union",raw:"0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10",elements:[{name:"literal",value:"0"},{name:"literal",value:"0.5"},{name:"literal",value:"1"},{name:"literal",value:"1.5"},{name:"literal",value:"2"},{name:"literal",value:"3"},{name:"literal",value:"4"},{name:"literal",value:"5"},{name:"literal",value:"6"},{name:"literal",value:"8"},{name:"literal",value:"10"}]},description:`Gap between items as a spacing token step.
Accepts: 0, 0.5, 1, 1.5, 2, 3, 4, 5, 6, 8, 10
@default 2`,defaultValue:{value:"2",computed:!1}},minVisibleItems:{required:!1,tsType:{name:"number"},description:`Minimum number of items to always show.
@default 0`,defaultValue:{value:"0",computed:!1}},collapseFrom:{required:!1,tsType:{name:"union",raw:"'start' | 'end'",elements:[{name:"literal",value:"'start'"},{name:"literal",value:"'end'"}]},description:`Which end to collapse items from.
@default 'end'`,defaultValue:{value:"'end'",computed:!1}},behavior:{required:!1,tsType:{name:"union",raw:"'observeParent' | 'observeSelf'",elements:[{name:"literal",value:"'observeParent'"},{name:"literal",value:"'observeSelf'"}]},description:`Which element to observe for overflow calculations.
- \`'observeSelf'\`: uses the container's own width (default)
- \`'observeParent'\`: observes the parent element's content width
  for overflow calculations. This keeps the overflow list
  content-sized while still detecting available space for
  grow-back. Siblings that don't fit can wrap and be clipped by
  the parent's overflow.
@default 'observeSelf'`,defaultValue:{value:"'observeSelf'",computed:!1}},overflowRenderer:{required:!1,tsType:{name:"signature",type:"function",raw:"(overflowItems: OverflowItem[]) => ReactNode",signature:{arguments:[{type:{name:"Array",elements:[{name:"OverflowItem"}],raw:"OverflowItem[]"},name:"overflowItems"}],return:{name:"ReactNode"}}},description:`Render function for the overflow indicator. Receives the list of
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
\`\`\``}},composes:["Omit"]};export{z as O};
