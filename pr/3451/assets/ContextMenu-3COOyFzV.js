import{ah as t,aJ as W,a1 as c,a6 as X,af as $,ay as O,a3 as T}from"./iframe-VDTgZ3S9.js";import{r as _,D as B}from"./renderDropdownItems-d2B6rIIF.js";import{u as J}from"./useListFocus-CiUDjfGu.js";import{u as N}from"./useTypeahead-UBgAXXVu.js";const p={menu:{kB7OPa:"astryx9f619",k1xSpc:"astryx78zum5",kXwgrk:"astryxdt5ytf",kOIVth:"astryx1lsbc85",kskxy:"astryxuyqlj2",kORKVm:"astryx1odjw0f","--_dropdown-menu-radius":"astryx1fcsqxe","--_dropdown-menu-padding":"astryxgory14",kmVPX3:"astryx9epnlk",kaIpWk:"astryx1n97fys",kWkggS:"astryx1prclbq",kGVxlE:"astryx1i5ehqx",kSiTet:"astryx1hc1fzr",k1ekBW:"astryx19991ni",kIyJzY:"astryxuedmi6",kAMwcw:"astryxlr8y92",$$css:!0},popover:{k7Eaqz:"astryx5w4yej",$$css:!0},popoverCustomWidth:n=>[{k7Eaqz:(typeof n=="number"?`${n}px`:n)!=null?"astryxkj4a21":typeof n=="number"?`${n}px`:n,$$css:!0},{"--x-minWidth":(o=>typeof o=="number"?o+"px":o??void 0)(typeof n=="number"?`${n}px`:n)}]};function M({children:n,menuWidth:o,size:y="md",hasAutoFocus:x=!0,isDisabled:k=!1,onOpenChange:l,ref:w,className:D,style:I,xstyle:q,"data-testid":S,...u}){const j=("items"in u?u.items:void 0)??[],L="menuContent"in u?u.menuContent:void 0,R=t.useId(),d=t.useRef({x:0,y:0}),f=t.useRef(null),[m,v]=t.useState(!1),i=W({mode:"fixed",onHide:t.useCallback(()=>{v(!1),l?.(!1);const e=f.current;f.current=null,e&&document.contains(e)&&e.focus()},[l]),onShow:t.useCallback(()=>{v(!0),l?.(!0)},[l]),lightDismiss:!1}),r=t.useCallback(()=>{i.hide()},[i]),{listRef:a,handleKeyDown:C,focusFirst:b,focusItem:V}=J({itemSelector:'[role="menuitem"]:not([aria-disabled="true"])',wrap:!1,onEscape:r}),h=t.useCallback(()=>a.current?Array.from(a.current.querySelectorAll('[role="menuitem"]:not([aria-disabled="true"])')):[],[a]),E=N({getItemLabels:()=>h().map(e=>e.textContent),onMatch:V,getCurrentIndex:()=>h().findIndex(e=>e===document.activeElement||e.contains(document.activeElement))});t.useEffect(()=>{if(!m)return;const e=s=>{const g=a.current;g&&!g.contains(s.target)&&r()};return document.addEventListener("mousedown",e),()=>{document.removeEventListener("mousedown",e)}},[m,r,a]),t.useEffect(()=>{if(!m)return;const e=s=>{s.key==="Escape"&&(s.isComposing||s.keyCode===229||(s.preventDefault(),r()))};return document.addEventListener("keydown",e),()=>{document.removeEventListener("keydown",e)}},[m,r]);const A=t.useCallback(e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();const s=document.activeElement;s?.getAttribute("role")==="menuitem"&&s.click();return}if(E.onKeyDown(e)){e.preventDefault();return}C(e)},[C,E]),z=t.useCallback(e=>{k||(e.preventDefault(),d.current={x:e.clientX,y:e.clientY},f.current=document.activeElement instanceof HTMLElement?document.activeElement:e.currentTarget,i.show(),x&&requestAnimationFrame(()=>b()))},[k,i,x,b]),F=o?p.popoverCustomWidth(o):p.popover,K=t.useMemo(()=>({closeMenu:r,menuSize:y}),[r,y]),P=u.items!==void 0?_(j):L;return c.jsxs(c.Fragment,{children:[c.jsx("div",{ref:w,onContextMenu:z,"aria-haspopup":"menu","data-testid":S,children:n}),i.render(c.jsx("div",{ref:a,id:R,role:"menu",onKeyDown:A,...X(O("context-menu"),$(p.menu,q),D,I),children:c.jsx(B,{value:K,children:P})}),{x:d.current.x,y:d.current.y,xstyle:[F,T.below]})]})}M.displayName="ContextMenu";M.__docgenInfo={description:`A context menu component that appears on right-click at cursor position.

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
\`\`\``,methods:[],displayName:"ContextMenu",props:{size:{defaultValue:{value:"'md'",computed:!1},required:!1},hasAutoFocus:{defaultValue:{value:"true",computed:!1},required:!1},isDisabled:{defaultValue:{value:"false",computed:!1},required:!1}}};export{M as C};
