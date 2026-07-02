import{ah as o,a1 as e,a6 as w,af as z,ay as T,a7 as E,aK as C,aj as $,T as S}from"./iframe-Z8EfSKmM.js";import{u as A}from"./useListFocus-DAccC0t0.js";import{u as q,a as F,b as G,F as P}from"./ChartBarIcon-aL7TynCs.js";import{F as D}from"./UserIcon-ZiouLd6s.js";import{F as R}from"./Cog6ToothIcon-BKKRwYuw.js";import{F as L}from"./DocumentTextIcon-B7RPEv9x.js";import{F as V}from"./ShieldCheckIcon-wZQ5d0BI.js";import"./preload-helper-Ct5FWWRu.js";const W={root:{k1xSpc:"astryx78zum5",kXwgrk:"astryxdt5ytf",kOIVth:"astryx1lsbc85",$$css:!0}},O={sm:{k7Eaqz:"astryx5w4yej",$$css:!0},md:{k7Eaqz:"astryx1jzhcrs",$$css:!0},lg:{k7Eaqz:"astryxlm99nl",$$css:!0}};function N({ref:t,children:r,size:n="md",minWidth:i,xstyle:m,className:u,style:s,"data-testid":b}){const c=q()?.closeMenu,{listRef:v,handleKeyDown:l}=A({onEscape:c}),p=o.useCallback(d=>{if(d.key==="Enter"||d.key===" "){const I=document.activeElement;if(I?.getAttribute("role")==="menuitem"){d.preventDefault(),I.click();return}}l(d)},[l]),k=o.useMemo(()=>({closeMenu:c??(()=>{}),size:n}),[c,n]),M=i!=null?{...s,minWidth:i}:s;return e.jsx(F,{value:k,children:e.jsx("div",{ref:E(t,v),role:"menu",onKeyDown:p,"data-testid":b,...w(T("nav-heading-menu",{size:n}),z(W.root,O[n],m),u,M),children:r})})}N.displayName="NavHeadingMenu";N.__docgenInfo={description:`Accessible menu container for nav heading popovers.

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
@default 'md'`,defaultValue:{value:"'md'",computed:!1}},minWidth:{required:!1,tsType:{name:"union",raw:"number | string",elements:[{name:"number"},{name:"string"}]},description:"Minimum width override. Takes precedence over size-based defaults."}},composes:["Omit"]};const j={root:{kB7OPa:"astryx9f619",k1xSpc:"astryx78zum5",kGNEyG:"astryx6s0dn4",kOIVth:"astryx1txdalj",kzqmXN:"astryxh8yej3",kaIpWk:"astryxh6dtrn",kMv6JI:"astryx9ynric",kGuDYH:"astryxcr08ib",kMwMTN:"astryx1tgivj0",kWkggS:"astryxjbqb8w astryx1c52tdz astryxe9uy6x",kQgIW9:"astryx1gs6z28",kkrTdU:"astryx1ypdohk",k9WMMc:"astryxdpxx8g",kI3sdo:"astryx1a2a7pz",kybGjl:"astryx1hl2dhg",$$css:!0},disabled:{kSiTet:"astryxbyyjgo",kkrTdU:"astryx1h6gzvc",$$css:!0}},K={sm:{k8WAf4:"astryxu0wf1k",kLKAdn:null,kGO01o:null,kg3NbH:"astryxf314gf",kuDDbn:null,kE3dHu:null,kP0aTx:null,kpe85a:null,$$css:!0},md:{k8WAf4:"astryxce4md1",kLKAdn:null,kGO01o:null,kg3NbH:"astryxf314gf",kuDDbn:null,kE3dHu:null,kP0aTx:null,kpe85a:null,$$css:!0},lg:{k8WAf4:"astryx8o8v82",kLKAdn:null,kGO01o:null,kg3NbH:"astryxrrkdod",kuDDbn:null,kE3dHu:null,kP0aTx:null,kpe85a:null,$$css:!0}};function a({ref:t,icon:r,label:n,description:i,href:m,onClick:u,isDisabled:s=!1,xstyle:b,className:H,style:c,"data-testid":v}){const l=G(),p=l?.size??"md",k=o.useCallback(()=>{s||(u?.(),l?.closeMenu())},[s,u,l]),M=C(),d=m?M:"div";return e.jsxs(d,{ref:t,role:"menuitem",tabIndex:s?void 0:-1,"aria-disabled":s||void 0,href:m,onClick:k,"data-testid":v,...w(T("nav-heading-menu-item",{size:p}),z(j.root,K[p],s&&j.disabled,b),H,c),children:[r&&$(r,{size:"sm",color:"secondary"}),e.jsxs("span",{className:"astryx78zum5 astryxdt5ytf astryx98rzlu astryxeuugli",children:[typeof n=="string"?e.jsx(S,{type:"body",maxLines:1,children:n}):n,i&&e.jsx(S,{type:"supporting",maxLines:1,children:i})]})]})}a.displayName="NavHeadingMenuItem";a.__docgenInfo={description:`Menu item for nav heading popovers.

Reads size from the parent NavHeadingMenu for consistent padding.
Automatically dismisses the menu on click via context.
Renders as a link when \`href\` is provided.

@example
\`\`\`
<NavHeadingMenu>
  <NavHeadingMenuItem label="Dashboard" href="/dashboard" />
  <NavHeadingMenuItem label="Settings" icon={GearIcon} onClick={open} />
</NavHeadingMenu>
\`\`\``,methods:[],displayName:"NavHeadingMenuItem",props:{ref:{required:!1,tsType:{name:"ReactRef",raw:"React.Ref<HTMLElement>",elements:[{name:"HTMLElement"}]},description:""},icon:{required:!1,tsType:{name:"union",raw:"ReactNode | IconType",elements:[{name:"ReactNode"},{name:"ComponentType",elements:[{name:"SVGProps",elements:[{name:"SVGSVGElement"}],raw:"SVGProps<SVGSVGElement>"}],raw:"ComponentType<SVGProps<SVGSVGElement>>"}]},description:"Icon to display before the label."},label:{required:!0,tsType:{name:"ReactNode"},description:"Primary label text."},description:{required:!1,tsType:{name:"ReactNode"},description:"Secondary description text displayed below the label."},href:{required:!1,tsType:{name:"string"},description:"URL to navigate to. Renders as an anchor element when provided."},onClick:{required:!1,tsType:{name:"signature",type:"function",raw:"() => void",signature:{arguments:[],return:{name:"void"}}},description:"Callback when the item is selected."},isDisabled:{required:!1,tsType:{name:"boolean"},description:"Whether the item is disabled. @default false",defaultValue:{value:"false",computed:!1}}},composes:["Omit"]};function _({title:t,titleId:r,...n},i){return o.createElement("svg",Object.assign({xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24",strokeWidth:1.5,stroke:"currentColor","aria-hidden":"true","data-slot":"icon",ref:i,"aria-labelledby":r},n),t?o.createElement("title",{id:r},t):null,o.createElement("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9"}))}const U=o.forwardRef(_),ne={title:"Core/NavMenu",component:N,tags:["autodocs"],argTypes:{size:{control:"select",options:["sm","md","lg"],description:"Size — controls min-width and flows to items for padding"},minWidth:{control:"number",description:"Minimum width override"}},decorators:[t=>e.jsx("div",{style:{padding:24,maxWidth:300},children:e.jsx(t,{})})]},g={args:{size:"md",children:e.jsxs(e.Fragment,{children:[e.jsx(a,{label:"Dashboard",href:"#"}),e.jsx(a,{label:"Analytics",href:"#"}),e.jsx(a,{label:"Settings",href:"#"})]})}},h={args:{size:"md",children:e.jsxs(e.Fragment,{children:[e.jsx(a,{label:"Profile",icon:D,href:"#"}),e.jsx(a,{label:"Documents",icon:L,href:"#"}),e.jsx(a,{label:"Analytics",icon:P,href:"#"}),e.jsx(a,{label:"Security",icon:V,href:"#"}),e.jsx(a,{label:"Settings",icon:R,href:"#"})]})}},f={args:{size:"lg",children:e.jsxs(e.Fragment,{children:[e.jsx(a,{label:"Profile",description:"Manage your account settings",icon:D,href:"#"}),e.jsx(a,{label:"Settings",description:"Configure application preferences",icon:R,href:"#"}),e.jsx(a,{label:"Sign out",description:"End your current session",icon:U})]})}},y={args:{size:"sm",children:e.jsxs(e.Fragment,{children:[e.jsx(a,{label:"Edit",href:"#"}),e.jsx(a,{label:"Duplicate",href:"#"}),e.jsx(a,{label:"Delete"})]})}},x={args:{size:"md",children:e.jsxs(e.Fragment,{children:[e.jsx(a,{label:"Dashboard",href:"#"}),e.jsx(a,{label:"Analytics",href:"#",isDisabled:!0}),e.jsx(a,{label:"Settings",href:"#"}),e.jsx(a,{label:"Admin",isDisabled:!0})]})}};g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    size: 'md',
    children: <>
        <NavHeadingMenuItem label="Dashboard" href="#" />
        <NavHeadingMenuItem label="Analytics" href="#" />
        <NavHeadingMenuItem label="Settings" href="#" />
      </>
  }
}`,...g.parameters?.docs?.source}}};h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
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
}`,...h.parameters?.docs?.source}}};f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    size: 'lg',
    children: <>
        <NavHeadingMenuItem label="Profile" description="Manage your account settings" icon={UserIcon} href="#" />
        <NavHeadingMenuItem label="Settings" description="Configure application preferences" icon={Cog6ToothIcon} href="#" />
        <NavHeadingMenuItem label="Sign out" description="End your current session" icon={ArrowRightStartOnRectangleIcon} />
      </>
  }
}`,...f.parameters?.docs?.source}}};y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    size: 'sm',
    children: <>
        <NavHeadingMenuItem label="Edit" href="#" />
        <NavHeadingMenuItem label="Duplicate" href="#" />
        <NavHeadingMenuItem label="Delete" />
      </>
  }
}`,...y.parameters?.docs?.source}}};x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  args: {
    size: 'md',
    children: <>
        <NavHeadingMenuItem label="Dashboard" href="#" />
        <NavHeadingMenuItem label="Analytics" href="#" isDisabled />
        <NavHeadingMenuItem label="Settings" href="#" />
        <NavHeadingMenuItem label="Admin" isDisabled />
      </>
  }
}`,...x.parameters?.docs?.source}}};const te=["Default","WithIcons","WithDescriptions","SmallSize","DisabledItems"];export{g as Default,x as DisabledItems,y as SmallSize,f as WithDescriptions,h as WithIcons,te as __namedExportsOrder,ne as default};
