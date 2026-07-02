import{ah as t,aI as P,a1 as i,a6 as A,af as K,ay as W,a3 as X}from"./iframe-FpdBIrKz.js";import{r as $,D as O}from"./renderDropdownItems-1NVNacfc.js";import{u as _}from"./useListFocus-DY855-du.js";const p={menu:{kB7OPa:"astryx9f619",k1xSpc:"astryx78zum5",kXwgrk:"astryxdt5ytf",kOIVth:"astryx1lsbc85",kskxy:"astryxuyqlj2",kORKVm:"astryx1odjw0f","--_dropdown-menu-radius":"astryx1fcsqxe","--_dropdown-menu-padding":"astryxgory14",kmVPX3:"astryx9epnlk",kaIpWk:"astryx1n97fys",kWkggS:"astryx1prclbq",kGVxlE:"astryx1i5ehqx",kSiTet:"astryx1hc1fzr",k1ekBW:"astryx19991ni",kIyJzY:"astryxuedmi6",kAMwcw:"astryxlr8y92",$$css:!0},popover:{k7Eaqz:"astryx5w4yej",$$css:!0},popoverCustomWidth:n=>[{k7Eaqz:(typeof n=="number"?`${n}px`:n)!=null?"astryxkj4a21":typeof n=="number"?`${n}px`:n,$$css:!0},{"--x-minWidth":(o=>typeof o=="number"?o+"px":o??void 0)(typeof n=="number"?`${n}px`:n)}]};function E({children:n,menuWidth:o,size:y="md",hasAutoFocus:x=!0,isDisabled:k=!1,onOpenChange:c,ref:g,className:w,style:M,xstyle:D,"data-testid":q,...a}){const j=("items"in a?a.items:void 0)??[],I="menuContent"in a?a.menuContent:void 0,R=t.useId(),m=t.useRef({x:0,y:0}),d=t.useRef(null),[l,v]=t.useState(!1),u=P({mode:"fixed",onHide:t.useCallback(()=>{v(!1),c?.(!1);const e=d.current;d.current=null,e&&document.contains(e)&&e.focus()},[c]),onShow:t.useCallback(()=>{v(!0),c?.(!0)},[c]),lightDismiss:!1}),r=t.useCallback(()=>{u.hide()},[u]),{listRef:f,handleKeyDown:C,focusFirst:b}=_({itemSelector:'[role="menuitem"]:not([aria-disabled="true"])',wrap:!1,onEscape:r});t.useEffect(()=>{if(!l)return;const e=s=>{const h=f.current;h&&!h.contains(s.target)&&r()};return document.addEventListener("mousedown",e),()=>{document.removeEventListener("mousedown",e)}},[l,r,f]),t.useEffect(()=>{if(!l)return;const e=s=>{s.key==="Escape"&&(s.isComposing||s.keyCode===229||(s.preventDefault(),r()))};return document.addEventListener("keydown",e),()=>{document.removeEventListener("keydown",e)}},[l,r]);const S=t.useCallback(e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();const s=document.activeElement;s?.getAttribute("role")==="menuitem"&&s.click();return}C(e)},[C]),L=t.useCallback(e=>{k||(e.preventDefault(),m.current={x:e.clientX,y:e.clientY},d.current=document.activeElement instanceof HTMLElement?document.activeElement:e.currentTarget,u.show(),x&&requestAnimationFrame(()=>b()))},[k,u,x,b]),V=o?p.popoverCustomWidth(o):p.popover,z=t.useMemo(()=>({closeMenu:r,menuSize:y}),[r,y]),F=a.items!==void 0?$(j):I;return i.jsxs(i.Fragment,{children:[i.jsx("div",{ref:g,onContextMenu:L,"aria-haspopup":"menu","data-testid":q,children:n}),u.render(i.jsx("div",{ref:f,id:R,role:"menu",onKeyDown:S,...A(W("context-menu"),K(p.menu,D),w,M),children:i.jsx(O,{value:z,children:F})}),{x:m.current.x,y:m.current.y,xstyle:[V,X.below]})]})}E.displayName="ContextMenu";E.__docgenInfo={description:`A context menu component that appears on right-click at cursor position.

Supports two modes:
- **Data-driven**: pass \`items\` for static menus
- **Compound-component**: pass \`menuContent\` JSX for dynamic menus

Both modes share the same DOM-based keyboard navigation via useListFocus.

@example
\`\`\`
<ContextMenu
  items={[
    { label: 'Cut', onClick: () => handleCut() },
    { label: 'Copy', onClick: () => handleCopy() },
    { type: 'divider' },
    { label: 'Paste', onClick: () => handlePaste() },
  ]}
>
  <div>Right-click this area</div>
</ContextMenu>
\`\`\``,methods:[],displayName:"ContextMenu",props:{size:{defaultValue:{value:"'md'",computed:!1},required:!1},hasAutoFocus:{defaultValue:{value:"true",computed:!1},required:!1},isDisabled:{defaultValue:{value:"false",computed:!1},required:!1}}};export{E as C};
