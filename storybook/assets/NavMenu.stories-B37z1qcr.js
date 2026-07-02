import{ah as i,a1 as e,a6 as D,af as T,ay as z,a7 as $,aK as q,aj as F,T as w}from"./iframe-DVtWfngO.js";import{u as G}from"./useListFocus-BuXVfFRP.js";import{u as L}from"./useTypeahead-sQ5Xj0Rn.js";import{u as P,a as V,b as W,F as O}from"./ChartBarIcon-CVPSCToH.js";import{F as E}from"./UserIcon-D5BK4GA8.js";import{F as R}from"./Cog6ToothIcon-1YhB9L8k.js";import{F as K}from"./DocumentTextIcon-C8EIFA1P.js";import{F as _}from"./ShieldCheckIcon-BHrNfDIZ.js";import"./preload-helper-Ct5FWWRu.js";const U={root:{k1xSpc:"astryx78zum5",kXwgrk:"astryxdt5ytf",kOIVth:"astryx1lsbc85",$$css:!0}},B={sm:{k7Eaqz:"astryx5w4yej",$$css:!0},md:{k7Eaqz:"astryx1jzhcrs",$$css:!0},lg:{k7Eaqz:"astryxlm99nl",$$css:!0}};function I({ref:s,children:o,size:t="md",minWidth:l,xstyle:p,className:g,style:r,"data-testid":M}){const m=P()?.closeMenu,{listRef:d,handleKeyDown:c,focusItem:f}=G({onEscape:m}),u=i.useCallback(()=>d.current?Array.from(d.current.querySelectorAll('[role="menuitem"]')):[],[d]),h=L({getItemLabels:()=>u().map(a=>a.textContent),onMatch:f,getCurrentIndex:()=>u().findIndex(a=>a===document.activeElement||a.contains(document.activeElement)),isDisabled:a=>u()[a]?.getAttribute("aria-disabled")==="true"}),N=i.useCallback(a=>{if(a.key==="Enter"||a.key===" "){const S=document.activeElement;if(S?.getAttribute("role")==="menuitem"){a.preventDefault(),S.click();return}}if(h.onKeyDown(a)){a.preventDefault();return}c(a)},[c,h]),C=i.useMemo(()=>({closeMenu:m??(()=>{}),size:t}),[m,t]),A=l!=null?{...r,minWidth:l}:r;return e.jsx(V,{value:C,children:e.jsx("div",{ref:$(s,d),role:"menu",onKeyDown:N,"data-testid":M,...D(z("nav-heading-menu",{size:t}),T(U.root,B[t],p),g,A),children:o})})}I.displayName="NavHeadingMenu";I.__docgenInfo={description:`Accessible menu container for nav heading popovers.

Provides \`role="menu"\` with arrow-key navigation (Home/End/Escape)
and a size context that flows to child items for consistent padding.
Pass as the \`menu\` prop of SideNavHeading or TopNavHeading.

The parent heading component injects the close callback via context,
so items automatically dismiss the popover on selection.

@example
\`\`\`
<SideNavHeading
  heading="Products"
  menu={
    <NavHeadingMenu size="lg">
      <NavHeadingMenuItem label="Dashboard" href="/dashboard" />
      <NavHeadingMenuItem label="Analytics" href="/analytics" />
    </NavHeadingMenu>
  }
/>
\`\`\``,methods:[],displayName:"NavHeadingMenu",props:{xstyle:{required:!1,tsType:{name:"StyleXStyles"},description:"StyleX styles created via `stylex.create()`. Merged with the component's\nbase styles inside a single `stylex.props()` call for optimal deduplication.\n\n@example\n```\nconst overrides = stylex.create({ root: { marginBottom: 8 } });\n<Component xstyle={overrides.root} />\n```"},ref:{required:!1,tsType:{name:"ReactRef",raw:"React.Ref<HTMLDivElement>",elements:[{name:"HTMLDivElement"}]},description:""},children:{required:!0,tsType:{name:"ReactNode"},description:"Menu items (NavHeadingMenuItem, dividers, custom content)."},size:{required:!1,tsType:{name:"union",raw:"'sm' | 'md' | 'lg'",elements:[{name:"literal",value:"'sm'"},{name:"literal",value:"'md'"},{name:"literal",value:"'lg'"}]},description:`Size — controls min-width and flows to items for padding.
@default 'md'`,defaultValue:{value:"'md'",computed:!1}},minWidth:{required:!1,tsType:{name:"union",raw:"number | string",elements:[{name:"number"},{name:"string"}]},description:"Minimum width override. Takes precedence over size-based defaults."}},composes:["Omit"]};const j={root:{kB7OPa:"astryx9f619",k1xSpc:"astryx78zum5",kGNEyG:"astryx6s0dn4",kOIVth:"astryx1txdalj",kzqmXN:"astryxh8yej3",kaIpWk:"astryxh6dtrn",kMv6JI:"astryx9ynric",kGuDYH:"astryxcr08ib",kMwMTN:"astryx1tgivj0",kWkggS:"astryxjbqb8w astryx1c52tdz astryxe9uy6x",kQgIW9:"astryx1gs6z28",kkrTdU:"astryx1ypdohk",k9WMMc:"astryxdpxx8g",kI3sdo:"astryx1a2a7pz",kybGjl:"astryx1hl2dhg",$$css:!0},disabled:{kSiTet:"astryxbyyjgo",kkrTdU:"astryx1h6gzvc",$$css:!0}},X={sm:{k8WAf4:"astryxu0wf1k",kLKAdn:null,kGO01o:null,kg3NbH:"astryxf314gf",kuDDbn:null,kE3dHu:null,kP0aTx:null,kpe85a:null,$$css:!0},md:{k8WAf4:"astryxce4md1",kLKAdn:null,kGO01o:null,kg3NbH:"astryxf314gf",kuDDbn:null,kE3dHu:null,kP0aTx:null,kpe85a:null,$$css:!0},lg:{k8WAf4:"astryx8o8v82",kLKAdn:null,kGO01o:null,kg3NbH:"astryxrrkdod",kuDDbn:null,kE3dHu:null,kP0aTx:null,kpe85a:null,$$css:!0}};function n({ref:s,icon:o,label:t,description:l,href:p,onClick:g,isDisabled:r=!1,xstyle:M,className:H,style:m,"data-testid":d}){const c=W(),f=c?.size??"md",u=i.useCallback(()=>{r||(g?.(),c?.closeMenu())},[r,g,c]),h=q(),N=p?h:"div";return e.jsxs(N,{ref:s,role:"menuitem",tabIndex:r?void 0:-1,"aria-disabled":r||void 0,href:p,onClick:u,"data-testid":d,...D(z("nav-heading-menu-item",{size:f}),T(j.root,X[f],r&&j.disabled,M),H,m),children:[o&&F(o,{size:"sm",color:"secondary"}),e.jsxs("span",{className:"astryx78zum5 astryxdt5ytf astryx98rzlu astryxeuugli",children:[typeof t=="string"?e.jsx(w,{type:"body",maxLines:1,children:t}):t,l&&e.jsx(w,{type:"supporting",maxLines:1,children:l})]})]})}n.displayName="NavHeadingMenuItem";n.__docgenInfo={description:`Menu item for nav heading popovers.

Reads size from the parent NavHeadingMenu for consistent padding.
Automatically dismisses the menu on click via context.
Renders as a link when \`href\` is provided.

@example
\`\`\`
<NavHeadingMenu>
  <NavHeadingMenuItem label="Dashboard" href="/dashboard" />
  <NavHeadingMenuItem label="Settings" icon={GearIcon} onClick={open} />
</NavHeadingMenu>
\`\`\``,methods:[],displayName:"NavHeadingMenuItem",props:{ref:{required:!1,tsType:{name:"ReactRef",raw:"React.Ref<HTMLElement>",elements:[{name:"HTMLElement"}]},description:""},icon:{required:!1,tsType:{name:"union",raw:"ReactNode | IconType",elements:[{name:"ReactNode"},{name:"ComponentType",elements:[{name:"SVGProps",elements:[{name:"SVGSVGElement"}],raw:"SVGProps<SVGSVGElement>"}],raw:"ComponentType<SVGProps<SVGSVGElement>>"}]},description:"Icon to display before the label."},label:{required:!0,tsType:{name:"ReactNode"},description:"Primary label text."},description:{required:!1,tsType:{name:"ReactNode"},description:"Secondary description text displayed below the label."},href:{required:!1,tsType:{name:"string"},description:"URL to navigate to. Renders as an anchor element when provided."},onClick:{required:!1,tsType:{name:"signature",type:"function",raw:"() => void",signature:{arguments:[],return:{name:"void"}}},description:"Callback when the item is selected."},isDisabled:{required:!1,tsType:{name:"boolean"},description:"Whether the item is disabled. @default false",defaultValue:{value:"false",computed:!1}}},composes:["Omit"]};function J({title:s,titleId:o,...t},l){return i.createElement("svg",Object.assign({xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24",strokeWidth:1.5,stroke:"currentColor","aria-hidden":"true","data-slot":"icon",ref:l,"aria-labelledby":o},t),s?i.createElement("title",{id:o},s):null,i.createElement("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9"}))}const Q=i.forwardRef(J),oe={title:"Core/NavMenu",component:I,tags:["autodocs"],argTypes:{size:{control:"select",options:["sm","md","lg"],description:"Size — controls min-width and flows to items for padding"},minWidth:{control:"number",description:"Minimum width override"}},decorators:[s=>e.jsx("div",{style:{padding:24,maxWidth:300},children:e.jsx(s,{})})]},y={args:{size:"md",children:e.jsxs(e.Fragment,{children:[e.jsx(n,{label:"Dashboard",href:"#"}),e.jsx(n,{label:"Analytics",href:"#"}),e.jsx(n,{label:"Settings",href:"#"})]})}},x={args:{size:"md",children:e.jsxs(e.Fragment,{children:[e.jsx(n,{label:"Profile",icon:E,href:"#"}),e.jsx(n,{label:"Documents",icon:K,href:"#"}),e.jsx(n,{label:"Analytics",icon:O,href:"#"}),e.jsx(n,{label:"Security",icon:_,href:"#"}),e.jsx(n,{label:"Settings",icon:R,href:"#"})]})}},b={args:{size:"lg",children:e.jsxs(e.Fragment,{children:[e.jsx(n,{label:"Profile",description:"Manage your account settings",icon:E,href:"#"}),e.jsx(n,{label:"Settings",description:"Configure application preferences",icon:R,href:"#"}),e.jsx(n,{label:"Sign out",description:"End your current session",icon:Q})]})}},v={args:{size:"sm",children:e.jsxs(e.Fragment,{children:[e.jsx(n,{label:"Edit",href:"#"}),e.jsx(n,{label:"Duplicate",href:"#"}),e.jsx(n,{label:"Delete"})]})}},k={args:{size:"md",children:e.jsxs(e.Fragment,{children:[e.jsx(n,{label:"Dashboard",href:"#"}),e.jsx(n,{label:"Analytics",href:"#",isDisabled:!0}),e.jsx(n,{label:"Settings",href:"#"}),e.jsx(n,{label:"Admin",isDisabled:!0})]})}};y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    size: 'md',
    children: <>
        <NavHeadingMenuItem label="Dashboard" href="#" />
        <NavHeadingMenuItem label="Analytics" href="#" />
        <NavHeadingMenuItem label="Settings" href="#" />
      </>
  }
}`,...y.parameters?.docs?.source}}};x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  args: {
    size: 'md',
    children: <>
        <NavHeadingMenuItem label="Profile" icon={UserIcon} href="#" />
        <NavHeadingMenuItem label="Documents" icon={DocumentTextIcon} href="#" />
        <NavHeadingMenuItem label="Analytics" icon={ChartBarIcon} href="#" />
        <NavHeadingMenuItem label="Security" icon={ShieldCheckIcon} href="#" />
        <NavHeadingMenuItem label="Settings" icon={Cog6ToothIcon} href="#" />
      </>
  }
}`,...x.parameters?.docs?.source}}};b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  args: {
    size: 'lg',
    children: <>
        <NavHeadingMenuItem label="Profile" description="Manage your account settings" icon={UserIcon} href="#" />
        <NavHeadingMenuItem label="Settings" description="Configure application preferences" icon={Cog6ToothIcon} href="#" />
        <NavHeadingMenuItem label="Sign out" description="End your current session" icon={ArrowRightStartOnRectangleIcon} />
      </>
  }
}`,...b.parameters?.docs?.source}}};v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    size: 'sm',
    children: <>
        <NavHeadingMenuItem label="Edit" href="#" />
        <NavHeadingMenuItem label="Duplicate" href="#" />
        <NavHeadingMenuItem label="Delete" />
      </>
  }
}`,...v.parameters?.docs?.source}}};k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  args: {
    size: 'md',
    children: <>
        <NavHeadingMenuItem label="Dashboard" href="#" />
        <NavHeadingMenuItem label="Analytics" href="#" isDisabled />
        <NavHeadingMenuItem label="Settings" href="#" />
        <NavHeadingMenuItem label="Admin" isDisabled />
      </>
  }
}`,...k.parameters?.docs?.source}}};const le=["Default","WithIcons","WithDescriptions","SmallSize","DisabledItems"];export{y as Default,k as DisabledItems,v as SmallSize,b as WithDescriptions,x as WithIcons,le as __namedExportsOrder,oe as default};
