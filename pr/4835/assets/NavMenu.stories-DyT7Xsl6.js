import{a as e,n as t}from"./rolldown-runtime-DkW27tQK.js";import{t as n}from"./react-BZJXY1be.js";import{n as r,t as i}from"./stylex-Dft6gtPK.js";import{n as a}from"./mergeProps-JRyAvMxc.js";import{n as o}from"./mergeRefs-CPqjs56a.js";import{n as s,t as c}from"./themeProps-CREkzZh6.js";import{n as l,t as u}from"./Text-BfjtEFtP.js";import{t as d}from"./jsx-runtime-DeHZSEgm.js";import{n as f,t as p}from"./useLinkComponent-DvgS1IvL.js";import{n as m,r as h}from"./Icon-C24cO4CC.js";import{n as g,t as _}from"./useListFocus-C3PMl9Zf.js";import{n as v,t as y}from"./useTypeahead-kmZe0nBq.js";import{a as b,i as x,n as S,o as C,s as w,t as ee}from"./ChartBarIcon-mq7jPdFj.js";import{n as te,t as T}from"./Cog6ToothIcon-LKkqufPn.js";import{n as ne,t as re}from"./DocumentTextIcon-dAtzgXPS.js";import{n as ie,t as E}from"./ShieldCheckIcon-CbhrdRm2.js";import{n as D,t as O}from"./UserIcon-DxfptEP-.js";function k({ref:e,children:t,size:n=`md`,minWidth:i,xstyle:c,className:l,style:u,"data-testid":d}){let f=C()?.closeMenu,{listRef:p,handleKeyDown:m,focusItem:h}=g({itemSelector:`[role="menuitem"]:not([aria-disabled="true"])`,onEscape:f}),_=(0,A.useCallback)(()=>p.current?Array.from(p.current.querySelectorAll(`[role="menuitem"]:not([aria-disabled="true"])`)):[],[p]),y=v({getItemLabels:()=>_().map(e=>e.textContent),onMatch:h,getCurrentIndex:()=>_().findIndex(e=>e===document.activeElement||e.contains(document.activeElement))}),b=(0,A.useCallback)(e=>{if(e.key===`Enter`||e.key===` `){let t=document.activeElement;if(t?.getAttribute(`role`)===`menuitem`){e.preventDefault(),t.click();return}}if(y.onKeyDown(e)){e.preventDefault();return}m(e)},[m,y]),S=(0,A.useMemo)(()=>({closeMenu:f??(()=>{}),size:n}),[f,n]),w=i==null?u:{...u,minWidth:i};return(0,j.jsx)(x,{value:S,children:(0,j.jsx)(`div`,{ref:o(e,p),role:`menu`,onKeyDown:b,"data-testid":d,...a(s(`nav-heading-menu`,{size:n}),r(M.root,N[n],c),l,w),children:t})})}var A,j,M,N;function P(){return(P=t((()=>{A=e(n(),1),i(),_(),y(),c(),b(),j=d(),M={root:{k1xSpc:`astryx78zum5`,kXwgrk:`astryxdt5ytf`,kOIVth:`astryx1lsbc85`,$$css:!0}},N={sm:{k7Eaqz:`astryx5w4yej`,$$css:!0},md:{k7Eaqz:`astryx1jzhcrs`,$$css:!0},lg:{k7Eaqz:`astryxlm99nl`,$$css:!0}},k.displayName=`NavHeadingMenu`,k.__docgenInfo={description:`Accessible menu container for nav heading popovers.

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
\`\`\``,methods:[],displayName:`NavHeadingMenu`,props:{xstyle:{required:!1,tsType:{name:`StyleXStyles`},description:"StyleX styles created via `stylex.create()`. Merged with the component's\nbase styles inside a single `stylex.props()` call for optimal deduplication.\n\n@example\n```\nconst overrides = stylex.create({ root: { marginBottom: 8 } });\n<Component xstyle={overrides.root} />\n```"},ref:{required:!1,tsType:{name:`ReactRef`,raw:`React.Ref<HTMLDivElement>`,elements:[{name:`HTMLDivElement`}]},description:``},children:{required:!0,tsType:{name:`ReactNode`},description:`Menu items (NavHeadingMenuItem, dividers, custom content).`},size:{required:!1,tsType:{name:`union`,raw:`'sm' | 'md' | 'lg'`,elements:[{name:`literal`,value:`'sm'`},{name:`literal`,value:`'md'`},{name:`literal`,value:`'lg'`}]},description:`Size — controls min-width and flows to items for padding.
@default 'md'`,defaultValue:{value:`'md'`,computed:!1}},minWidth:{required:!1,tsType:{name:`union`,raw:`number | string`,elements:[{name:`number`},{name:`string`}]},description:`Minimum width override. Takes precedence over size-based defaults.`}},composes:[`Omit`]}})))()}function F({ref:e,icon:t,label:n,description:i,href:o,onClick:c,isDisabled:l=!1,xstyle:d,className:p,style:m,"data-testid":g}){let _=w(),v=_?.size??`md`,y=(0,I.useCallback)(()=>{l||(c?.(),_?.closeMenu())},[l,c,_]),b=f();return(0,L.jsxs)(o?b:`div`,{ref:e,role:`menuitem`,tabIndex:l?void 0:-1,"aria-disabled":l||void 0,href:o,onClick:y,"data-testid":g,...a(s(`nav-heading-menu-item`,{size:v}),r(R.root,z[v],l&&R.disabled,d),p,m),children:[t&&h(t,{size:`sm`,color:`secondary`}),(0,L.jsxs)(`span`,{className:`astryx78zum5 astryxdt5ytf astryx98rzlu astryxeuugli`,children:[typeof n==`string`?(0,L.jsx)(u,{type:`body`,maxLines:1,children:n}):n,i&&(0,L.jsx)(u,{type:`supporting`,maxLines:1,children:i})]})]})}var I,L,R,z;function B(){return(B=t((()=>{I=e(n(),1),i(),m(),l(),b(),p(),c(),L=d(),R={root:{kB7OPa:`astryx9f619`,k1xSpc:`astryx78zum5`,kGNEyG:`astryx6s0dn4`,kOIVth:`astryx1txdalj`,kzqmXN:`astryxh8yej3`,kaIpWk:`astryxh6dtrn`,kMv6JI:`astryx9ynric`,kGuDYH:`astryxcr08ib`,kMwMTN:`astryx1tgivj0`,kWkggS:`astryxjbqb8w astryx1c52tdz astryxe9uy6x`,kQgIW9:`astryx1gs6z28`,kkrTdU:`astryx1ypdohk`,k9WMMc:`astryx1yc453h`,kI3sdo:`astryx1a2a7pz`,kybGjl:`astryx1hl2dhg`,$$css:!0},disabled:{kSiTet:`astryxbyyjgo`,kkrTdU:`astryx1h6gzvc`,$$css:!0}},z={sm:{k8WAf4:`astryxu0wf1k`,kLKAdn:null,kGO01o:null,kg3NbH:`astryxf314gf`,kuDDbn:null,kE3dHu:null,kP0aTx:null,kpe85a:null,$$css:!0},md:{k8WAf4:`astryxce4md1`,kLKAdn:null,kGO01o:null,kg3NbH:`astryxf314gf`,kuDDbn:null,kE3dHu:null,kP0aTx:null,kpe85a:null,$$css:!0},lg:{k8WAf4:`astryx8o8v82`,kLKAdn:null,kGO01o:null,kg3NbH:`astryxrrkdod`,kuDDbn:null,kE3dHu:null,kP0aTx:null,kpe85a:null,$$css:!0}},F.displayName=`NavHeadingMenuItem`,F.__docgenInfo={description:`Menu item for nav heading popovers.

Reads size from the parent NavHeadingMenu for consistent padding.
Automatically dismisses the menu on click via context.
Renders as a link when \`href\` is provided.

@example
\`\`\`
<NavHeadingMenu>
  <NavHeadingMenuItem label="Dashboard" href="/dashboard" />
  <NavHeadingMenuItem label="Settings" icon={GearIcon} onClick={open} />
</NavHeadingMenu>
\`\`\``,methods:[],displayName:`NavHeadingMenuItem`,props:{ref:{required:!1,tsType:{name:`ReactRef`,raw:`React.Ref<HTMLElement>`,elements:[{name:`HTMLElement`}]},description:``},icon:{required:!1,tsType:{name:`union`,raw:`ReactNode | IconType`,elements:[{name:`ReactNode`},{name:`ComponentType`,elements:[{name:`SVGProps`,elements:[{name:`SVGSVGElement`}],raw:`SVGProps<SVGSVGElement>`}],raw:`ComponentType<SVGProps<SVGSVGElement>>`}]},description:`Icon to display before the label.`},label:{required:!0,tsType:{name:`ReactNode`},description:`Primary label text.`},description:{required:!1,tsType:{name:`ReactNode`},description:`Secondary description text displayed below the label.`},href:{required:!1,tsType:{name:`string`},description:`URL to navigate to. Renders as an anchor element when provided.`},onClick:{required:!1,tsType:{name:`signature`,type:`function`,raw:`() => void`,signature:{arguments:[],return:{name:`void`}}},description:`Callback when the item is selected.`},isDisabled:{required:!1,tsType:{name:`boolean`},description:`Whether the item is disabled. @default false`,defaultValue:{value:`false`,computed:!1}}},composes:[`Omit`]}})))()}function V({title:e,titleId:t,...n},r){return H.createElement(`svg`,Object.assign({xmlns:`http://www.w3.org/2000/svg`,fill:`none`,viewBox:`0 0 24 24`,strokeWidth:1.5,stroke:`currentColor`,"aria-hidden":`true`,"data-slot":`icon`,ref:r,"aria-labelledby":t},n),e?H.createElement(`title`,{id:t},e):null,H.createElement(`path`,{strokeLinecap:`round`,strokeLinejoin:`round`,d:`M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9`}))}var H,U;function W(){return(W=t((()=>{H=e(n()),U=H.forwardRef(V)})))()}var G,K,q,J,Y,X,Z,Q;function $(){return($=t((()=>{P(),B(),te(),D(),W(),ne(),S(),ie(),G=d(),K={title:`Core/NavMenu`,component:k,tags:[`autodocs`],argTypes:{size:{control:`select`,options:[`sm`,`md`,`lg`],description:`Size — controls min-width and flows to items for padding`},minWidth:{control:`number`,description:`Minimum width override`}},decorators:[e=>(0,G.jsx)(`div`,{style:{padding:24,maxWidth:300},children:(0,G.jsx)(e,{})})]},q={args:{size:`md`,children:(0,G.jsxs)(G.Fragment,{children:[(0,G.jsx)(F,{label:`Dashboard`,href:`#`}),(0,G.jsx)(F,{label:`Analytics`,href:`#`}),(0,G.jsx)(F,{label:`Settings`,href:`#`})]})}},J={args:{size:`md`,children:(0,G.jsxs)(G.Fragment,{children:[(0,G.jsx)(F,{label:`Profile`,icon:O,href:`#`}),(0,G.jsx)(F,{label:`Documents`,icon:re,href:`#`}),(0,G.jsx)(F,{label:`Analytics`,icon:ee,href:`#`}),(0,G.jsx)(F,{label:`Security`,icon:E,href:`#`}),(0,G.jsx)(F,{label:`Settings`,icon:T,href:`#`})]})}},Y={args:{size:`lg`,children:(0,G.jsxs)(G.Fragment,{children:[(0,G.jsx)(F,{label:`Profile`,description:`Manage your account settings`,icon:O,href:`#`}),(0,G.jsx)(F,{label:`Settings`,description:`Configure application preferences`,icon:T,href:`#`}),(0,G.jsx)(F,{label:`Sign out`,description:`End your current session`,icon:U})]})}},X={args:{size:`sm`,children:(0,G.jsxs)(G.Fragment,{children:[(0,G.jsx)(F,{label:`Edit`,href:`#`}),(0,G.jsx)(F,{label:`Duplicate`,href:`#`}),(0,G.jsx)(F,{label:`Delete`})]})}},Z={args:{size:`md`,children:(0,G.jsxs)(G.Fragment,{children:[(0,G.jsx)(F,{label:`Dashboard`,href:`#`}),(0,G.jsx)(F,{label:`Analytics`,href:`#`,isDisabled:!0}),(0,G.jsx)(F,{label:`Settings`,href:`#`}),(0,G.jsx)(F,{label:`Admin`,isDisabled:!0})]})}},q.parameters={...q.parameters,docs:{...q.parameters?.docs,source:{originalSource:`{
  args: {
    size: 'md',
    children: <>
        <NavHeadingMenuItem label="Dashboard" href="#" />
        <NavHeadingMenuItem label="Analytics" href="#" />
        <NavHeadingMenuItem label="Settings" href="#" />
      </>
  }
}`,...q.parameters?.docs?.source}}},J.parameters={...J.parameters,docs:{...J.parameters?.docs,source:{originalSource:`{
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
}`,...J.parameters?.docs?.source}}},Y.parameters={...Y.parameters,docs:{...Y.parameters?.docs,source:{originalSource:`{
  args: {
    size: 'lg',
    children: <>
        <NavHeadingMenuItem label="Profile" description="Manage your account settings" icon={UserIcon} href="#" />
        <NavHeadingMenuItem label="Settings" description="Configure application preferences" icon={Cog6ToothIcon} href="#" />
        <NavHeadingMenuItem label="Sign out" description="End your current session" icon={ArrowRightStartOnRectangleIcon} />
      </>
  }
}`,...Y.parameters?.docs?.source}}},X.parameters={...X.parameters,docs:{...X.parameters?.docs,source:{originalSource:`{
  args: {
    size: 'sm',
    children: <>
        <NavHeadingMenuItem label="Edit" href="#" />
        <NavHeadingMenuItem label="Duplicate" href="#" />
        <NavHeadingMenuItem label="Delete" />
      </>
  }
}`,...X.parameters?.docs?.source}}},Z.parameters={...Z.parameters,docs:{...Z.parameters?.docs,source:{originalSource:`{
  args: {
    size: 'md',
    children: <>
        <NavHeadingMenuItem label="Dashboard" href="#" />
        <NavHeadingMenuItem label="Analytics" href="#" isDisabled />
        <NavHeadingMenuItem label="Settings" href="#" />
        <NavHeadingMenuItem label="Admin" isDisabled />
      </>
  }
}`,...Z.parameters?.docs?.source}}},Q=[`Default`,`WithIcons`,`WithDescriptions`,`SmallSize`,`DisabledItems`]})))()}$();export{q as Default,Z as DisabledItems,X as SmallSize,Y as WithDescriptions,J as WithIcons,Q as __namedExportsOrder,K as default};