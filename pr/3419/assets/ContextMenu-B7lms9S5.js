import{ah as n,aI as A,a1 as u,a6 as F,af as K,ay as W,a3 as X}from"./iframe-JfpySt6L.js";import{r as $,D as O}from"./renderDropdownItems-Dh7vtcw0.js";import{u as _}from"./useListFocus-BWq12HVg.js";const d={menu:{kB7OPa:"astryx9f619",k1xSpc:"astryx78zum5",kXwgrk:"astryxdt5ytf",kOIVth:"astryx1lsbc85",kskxy:"astryxuyqlj2",kORKVm:"astryx1odjw0f","--_dropdown-menu-radius":"astryx1fcsqxe","--_dropdown-menu-padding":"astryxgory14",kmVPX3:"astryx9epnlk",kaIpWk:"astryx1n97fys",kWkggS:"astryx1prclbq",kGVxlE:"astryx1i5ehqx",kSiTet:"astryx1hc1fzr",k1ekBW:"astryx19991ni",kIyJzY:"astryxuedmi6",kAMwcw:"astryxlr8y92",$$css:!0},popover:{k7Eaqz:"astryx5w4yej",$$css:!0},popoverCustomWidth:e=>[{k7Eaqz:(typeof e=="number"?`${e}px`:e)!=null?"astryxkj4a21":typeof e=="number"?`${e}px`:e,$$css:!0},{"--x-minWidth":(s=>typeof s=="number"?s+"px":s??void 0)(typeof e=="number"?`${e}px`:e)}]};function h({children:e,menuWidth:s,size:p="md",menuLabel:M="Context menu",hasAutoFocus:x=!0,isDisabled:f=!1,onOpenChange:i,ref:w,className:D,style:g,xstyle:q,"data-testid":E,...o}){const j=("items"in o?o.items:void 0)??[],I="menuContent"in o?o.menuContent:void 0,S=n.useId(),m=n.useRef({x:0,y:0}),[y,k]=n.useState(!1),a=A({mode:"fixed",onHide:n.useCallback(()=>{k(!1),i?.(!1)},[i]),onShow:n.useCallback(()=>{k(!0),i?.(!0)},[i]),lightDismiss:!1}),r=n.useCallback(()=>{a.hide()},[a]),{listRef:c,handleKeyDown:C,focusFirst:v}=_({itemSelector:'[role="menuitem"]:not([aria-disabled="true"])',wrap:!1,onEscape:r});n.useEffect(()=>{if(!y)return;const t=l=>{const b=c.current;b&&!b.contains(l.target)&&r()};return document.addEventListener("mousedown",t),()=>{document.removeEventListener("mousedown",t)}},[y,r,c]);const V=n.useCallback(t=>{if(t.key==="Enter"||t.key===" "){t.preventDefault();const l=document.activeElement;l?.getAttribute("role")==="menuitem"&&l.click();return}C(t)},[C]),z=n.useCallback(t=>{f||(t.preventDefault(),m.current={x:t.clientX,y:t.clientY},a.show(),x&&requestAnimationFrame(()=>v()))},[f,a,x,v]),L=s?d.popoverCustomWidth(s):d.popover,P=n.useMemo(()=>({closeMenu:r,menuSize:p}),[r,p]),R=o.items!==void 0?$(j):I;return u.jsxs(u.Fragment,{children:[u.jsx("div",{ref:w,onContextMenu:z,"data-testid":E,children:e}),a.render(u.jsx("div",{ref:c,id:S,role:"menu","aria-label":M,onKeyDown:V,...F(W("context-menu"),K(d.menu,q),D,g),children:u.jsx(O,{value:P,children:R})}),{x:m.current.x,y:m.current.y,xstyle:[L,X.below]})]})}h.displayName="ContextMenu";h.__docgenInfo={description:`A context menu component that appears on right-click at cursor position.

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
\`\`\``,methods:[],displayName:"ContextMenu",props:{size:{defaultValue:{value:"'md'",computed:!1},required:!1},menuLabel:{defaultValue:{value:"'Context menu'",computed:!1},required:!1},hasAutoFocus:{defaultValue:{value:"true",computed:!1},required:!1},isDisabled:{defaultValue:{value:"false",computed:!1},required:!1}}};export{h as C};
