import{i as e}from"./preload-helper-CT_b8DTk.js";import{t}from"./jsx-runtime-DqZldVDK.js";import{Gn as n,Wn as r,qn as i}from"./iframe-iQ3nuRH_.js";import{Bt as a,E as o,En as s,Ot as c,o as l,on as u,t as d}from"./esm-DA7gAIBC.js";var f,p,m,h,g,_,v,y;e((()=>{r(),d(),f=t(),p={title:`Core/NavMenu`,component:i,tags:[`autodocs`],argTypes:{size:{control:`select`,options:[`sm`,`md`,`lg`],description:`Size — controls min-width and flows to items for padding`},minWidth:{control:`number`,description:`Minimum width override`}},decorators:[e=>(0,f.jsx)(`div`,{style:{padding:24,maxWidth:300},children:(0,f.jsx)(e,{})})]},m={args:{size:`md`,children:(0,f.jsxs)(f.Fragment,{children:[(0,f.jsx)(n,{label:`Dashboard`,href:`#`}),(0,f.jsx)(n,{label:`Analytics`,href:`#`}),(0,f.jsx)(n,{label:`Settings`,href:`#`})]})}},h={args:{size:`md`,children:(0,f.jsxs)(f.Fragment,{children:[(0,f.jsx)(n,{label:`Profile`,icon:l,href:`#`}),(0,f.jsx)(n,{label:`Documents`,icon:c,href:`#`}),(0,f.jsx)(n,{label:`Analytics`,icon:u,href:`#`}),(0,f.jsx)(n,{label:`Security`,icon:o,href:`#`}),(0,f.jsx)(n,{label:`Settings`,icon:a,href:`#`})]})}},g={args:{size:`lg`,children:(0,f.jsxs)(f.Fragment,{children:[(0,f.jsx)(n,{label:`Profile`,description:`Manage your account settings`,icon:l,href:`#`}),(0,f.jsx)(n,{label:`Settings`,description:`Configure application preferences`,icon:a,href:`#`}),(0,f.jsx)(n,{label:`Sign out`,description:`End your current session`,icon:s})]})}},_={args:{size:`sm`,children:(0,f.jsxs)(f.Fragment,{children:[(0,f.jsx)(n,{label:`Edit`,href:`#`}),(0,f.jsx)(n,{label:`Duplicate`,href:`#`}),(0,f.jsx)(n,{label:`Delete`})]})}},v={args:{size:`md`,children:(0,f.jsxs)(f.Fragment,{children:[(0,f.jsx)(n,{label:`Dashboard`,href:`#`}),(0,f.jsx)(n,{label:`Analytics`,href:`#`,isDisabled:!0}),(0,f.jsx)(n,{label:`Settings`,href:`#`}),(0,f.jsx)(n,{label:`Admin`,isDisabled:!0})]})}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    size: 'md',
    children: <>
        <NavHeadingMenuItem label="Dashboard" href="#" />
        <NavHeadingMenuItem label="Analytics" href="#" />
        <NavHeadingMenuItem label="Settings" href="#" />
      </>
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
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
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    size: 'lg',
    children: <>
        <NavHeadingMenuItem label="Profile" description="Manage your account settings" icon={UserIcon} href="#" />
        <NavHeadingMenuItem label="Settings" description="Configure application preferences" icon={Cog6ToothIcon} href="#" />
        <NavHeadingMenuItem label="Sign out" description="End your current session" icon={ArrowRightStartOnRectangleIcon} />
      </>
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: {
    size: 'sm',
    children: <>
        <NavHeadingMenuItem label="Edit" href="#" />
        <NavHeadingMenuItem label="Duplicate" href="#" />
        <NavHeadingMenuItem label="Delete" />
      </>
  }
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    size: 'md',
    children: <>
        <NavHeadingMenuItem label="Dashboard" href="#" />
        <NavHeadingMenuItem label="Analytics" href="#" isDisabled />
        <NavHeadingMenuItem label="Settings" href="#" />
        <NavHeadingMenuItem label="Admin" isDisabled />
      </>
  }
}`,...v.parameters?.docs?.source}}},y=[`Default`,`WithIcons`,`WithDescriptions`,`SmallSize`,`DisabledItems`]}))();export{m as Default,v as DisabledItems,_ as SmallSize,g as WithDescriptions,h as WithIcons,y as __namedExportsOrder,p as default};