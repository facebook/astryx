import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{t}from"./react-BZJXY1be.js";import{t as n}from"./jsx-runtime-DeHZSEgm.js";import{n as r,t as i}from"./useMediaQuery-CwCr2urF.js";import{n as a,t as o}from"./Button-BVMvoKVE.js";import{n as s,t as c}from"./Icon-C24cO4CC.js";import{n as l,t as u}from"./NavIcon-oDQitls3.js";import{n as d,t as f}from"./ChartBarIcon-mq7jPdFj.js";import{i as p,r as m}from"./navItemStyles.stylex-B-vWs4Jb.js";import{i as h,n as g,r as _,t as v}from"./SideNavItem-8yGqs6FV.js";import{a as y,c as b,i as x,n as S,o as C,r as w,s as T,t as E}from"./FolderIcon-D9ozEePX.js";import{n as D,t as O}from"./Cog6ToothIcon-LKkqufPn.js";import{n as k,t as A}from"./CubeIcon-CNZB-VPW.js";import{n as j,t as M}from"./FolderIcon-BgIzlbYN.js";import{n as N,t as P}from"./HomeIcon-QfiwBcAz.js";import{n as F,t as I}from"./HomeIcon-DrTDsM2a.js";var L,R,z,B,V,H,U,W,G,K;function q(){return(q=e((()=>{L=t(),p(),h(),b(),g(),C(),a(),s(),l(),i(),N(),j(),D(),d(),x(),k(),F(),S(),R=n(),z={title:`Core/MobileNav`,component:m,tags:[`autodocs`],parameters:{layout:`centered`}},B={render:()=>{let[e,t]=(0,L.useState)(!1);return(0,R.jsxs)(R.Fragment,{children:[(0,R.jsx)(o,{label:`Open Navigation`,icon:(0,R.jsx)(c,{icon:`menu`,color:`inherit`}),variant:`ghost`,onClick:()=>t(!0),isIconOnly:!0}),(0,R.jsxs)(m,{isOpen:e,onOpenChange:e=>t(e),header:`Navigation`,children:[(0,R.jsxs)(y,{title:`Main`,children:[(0,R.jsx)(v,{label:`Dashboard`,icon:P,selectedIcon:I,isSelected:!0,href:`/dashboard`}),(0,R.jsx)(v,{label:`Projects`,icon:M,selectedIcon:E,href:`/projects`}),(0,R.jsx)(v,{label:`Analytics`,icon:f,href:`/analytics`})]}),(0,R.jsxs)(y,{title:`Settings`,children:[(0,R.jsx)(v,{label:`General`,icon:O,href:`/settings`}),(0,R.jsx)(v,{label:`Team`,icon:w,href:`/team`})]})]})]})}},V={name:`With SideNav Children`,render:()=>{let[e,t]=(0,L.useState)(!1);return(0,R.jsxs)(R.Fragment,{children:[(0,R.jsx)(o,{label:`Open Drawer`,onClick:()=>t(!0)}),(0,R.jsx)(m,{isOpen:e,onOpenChange:e=>t(e),header:`My App`,children:(0,R.jsxs)(R.Fragment,{children:[(0,R.jsxs)(y,{title:`Main`,children:[(0,R.jsx)(v,{label:`Dashboard`,icon:P,selectedIcon:I,isSelected:!0,href:`/dashboard`}),(0,R.jsx)(v,{label:`Projects`,icon:M,selectedIcon:E,href:`/projects`}),(0,R.jsx)(v,{label:`Analytics`,icon:f,href:`/analytics`})]}),(0,R.jsx)(y,{title:`Settings`,children:(0,R.jsx)(v,{label:`General`,icon:O,href:`/settings`})})]})})]})}},H={name:`Responsive Pattern`,render:()=>{let e=r(`(max-width: 768px)`),[t,n]=(0,L.useState)(!1),i=(0,R.jsxs)(R.Fragment,{children:[(0,R.jsxs)(y,{title:`Main`,children:[(0,R.jsx)(v,{label:`Dashboard`,icon:P,selectedIcon:I,isSelected:!0,href:`/`}),(0,R.jsx)(v,{label:`Projects`,icon:M,selectedIcon:E,href:`/projects`}),(0,R.jsx)(v,{label:`Analytics`,icon:f,href:`/analytics`})]}),(0,R.jsxs)(y,{title:`Settings`,children:[(0,R.jsx)(v,{label:`General`,icon:O,href:`/settings`}),(0,R.jsx)(v,{label:`Team`,icon:w,href:`/team`})]})]});return e?(0,R.jsxs)(R.Fragment,{children:[(0,R.jsx)(o,{label:`Menu`,icon:(0,R.jsx)(c,{icon:`menu`,color:`inherit`}),variant:`ghost`,onClick:()=>n(!0),isIconOnly:!0}),(0,R.jsx)(m,{isOpen:t,onOpenChange:e=>n(e),header:`My App`,children:i})]}):(0,R.jsx)(`div`,{style:{width:280,height:600,border:`1px solid #e5e7eb`},children:(0,R.jsx)(_,{header:(0,R.jsx)(T,{icon:(0,R.jsx)(u,{icon:(0,R.jsx)(A,{style:{width:16,height:16}})}),heading:`My App`,headingHref:`/`}),children:i})})}},U={name:`End Side`,render:()=>{let[e,t]=(0,L.useState)(!1);return(0,R.jsxs)(R.Fragment,{children:[(0,R.jsx)(o,{label:`Open from Right`,onClick:()=>t(!0)}),(0,R.jsx)(m,{isOpen:e,onOpenChange:e=>t(e),header:`Settings`,side:`end`,children:(0,R.jsxs)(y,{title:`Settings`,children:[(0,R.jsx)(v,{label:`General`,icon:O,href:`/settings`}),(0,R.jsx)(v,{label:`Team`,icon:w,href:`/team`})]})})]})}},W={name:`Custom Width`,render:()=>{let[e,t]=(0,L.useState)(!1);return(0,R.jsxs)(R.Fragment,{children:[(0,R.jsx)(o,{label:`Open Wide Drawer`,onClick:()=>t(!0)}),(0,R.jsx)(m,{isOpen:e,onOpenChange:e=>t(e),header:`Wide Navigation`,width:360,children:(0,R.jsxs)(y,{title:`Main`,children:[(0,R.jsx)(v,{label:`Dashboard`,icon:P,selectedIcon:I,isSelected:!0,href:`/dashboard`}),(0,R.jsx)(v,{label:`Projects`,icon:M,href:`/projects`})]})})]})}},G={name:`Without Title`,render:()=>{let[e,t]=(0,L.useState)(!1);return(0,R.jsxs)(R.Fragment,{children:[(0,R.jsx)(o,{label:`Open Navigation`,icon:(0,R.jsx)(c,{icon:`menu`,color:`inherit`}),variant:`ghost`,onClick:()=>t(!0),isIconOnly:!0}),(0,R.jsx)(m,{isOpen:e,onOpenChange:e=>t(e),children:(0,R.jsxs)(y,{title:`Main`,children:[(0,R.jsx)(v,{label:`Dashboard`,icon:P,isSelected:!0,href:`/dashboard`}),(0,R.jsx)(v,{label:`Projects`,icon:M,href:`/projects`})]})})]})}},B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    return <>
        <Button label="Open Navigation" icon={<Icon icon="menu" color="inherit" />} variant="ghost" onClick={() => setIsOpen(true)} isIconOnly />
        <MobileNav isOpen={isOpen} onOpenChange={open => setIsOpen(open)} header="Navigation">
          <SideNavSection title="Main">
            <SideNavItem label="Dashboard" icon={HomeIcon} selectedIcon={HomeIconSolid} isSelected href="/dashboard" />
            <SideNavItem label="Projects" icon={FolderIcon} selectedIcon={FolderIconSolid} href="/projects" />
            <SideNavItem label="Analytics" icon={ChartBarIcon} href="/analytics" />
          </SideNavSection>
          <SideNavSection title="Settings">
            <SideNavItem label="General" icon={Cog6ToothIcon} href="/settings" />
            <SideNavItem label="Team" icon={UserGroupIcon} href="/team" />
          </SideNavSection>
        </MobileNav>
      </>;
  }
}`,...B.parameters?.docs?.source}}},V.parameters={...V.parameters,docs:{...V.parameters?.docs,source:{originalSource:`{
  name: 'With SideNav Children',
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    const navSections = <>
        <SideNavSection title="Main">
          <SideNavItem label="Dashboard" icon={HomeIcon} selectedIcon={HomeIconSolid} isSelected href="/dashboard" />
          <SideNavItem label="Projects" icon={FolderIcon} selectedIcon={FolderIconSolid} href="/projects" />
          <SideNavItem label="Analytics" icon={ChartBarIcon} href="/analytics" />
        </SideNavSection>
        <SideNavSection title="Settings">
          <SideNavItem label="General" icon={Cog6ToothIcon} href="/settings" />
        </SideNavSection>
      </>;
    return <>
        <Button label="Open Drawer" onClick={() => setIsOpen(true)} />
        <MobileNav isOpen={isOpen} onOpenChange={open => setIsOpen(open)} header="My App">
          {navSections}
        </MobileNav>
      </>;
  }
}`,...V.parameters?.docs?.source}}},H.parameters={...H.parameters,docs:{...H.parameters?.docs,source:{originalSource:`{
  name: 'Responsive Pattern',
  render: () => {
    const isMobile = useMediaQuery('(max-width: 768px)');
    const [drawerOpen, setDrawerOpen] = useState(false);
    const navSections = <>
        <SideNavSection title="Main">
          <SideNavItem label="Dashboard" icon={HomeIcon} selectedIcon={HomeIconSolid} isSelected href="/" />
          <SideNavItem label="Projects" icon={FolderIcon} selectedIcon={FolderIconSolid} href="/projects" />
          <SideNavItem label="Analytics" icon={ChartBarIcon} href="/analytics" />
        </SideNavSection>
        <SideNavSection title="Settings">
          <SideNavItem label="General" icon={Cog6ToothIcon} href="/settings" />
          <SideNavItem label="Team" icon={UserGroupIcon} href="/team" />
        </SideNavSection>
      </>;
    if (isMobile) {
      return <>
          <Button label="Menu" icon={<Icon icon="menu" color="inherit" />} variant="ghost" onClick={() => setDrawerOpen(true)} isIconOnly />
          <MobileNav isOpen={drawerOpen} onOpenChange={open => setDrawerOpen(open)} header="My App">
            {navSections}
          </MobileNav>
        </>;
    }
    return <div style={{
      width: 280,
      height: 600,
      border: '1px solid #e5e7eb'
    }}>
        <SideNav header={<SideNavHeading icon={<NavIcon icon={<CubeIcon style={{
        width: 16,
        height: 16
      }} />} />} heading="My App" headingHref="/" />}>
          {navSections}
        </SideNav>
      </div>;
  }
}`,...H.parameters?.docs?.source}}},U.parameters={...U.parameters,docs:{...U.parameters?.docs,source:{originalSource:`{
  name: 'End Side',
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    return <>
        <Button label="Open from Right" onClick={() => setIsOpen(true)} />
        <MobileNav isOpen={isOpen} onOpenChange={open => setIsOpen(open)} header="Settings" side="end">
          <SideNavSection title="Settings">
            <SideNavItem label="General" icon={Cog6ToothIcon} href="/settings" />
            <SideNavItem label="Team" icon={UserGroupIcon} href="/team" />
          </SideNavSection>
        </MobileNav>
      </>;
  }
}`,...U.parameters?.docs?.source}}},W.parameters={...W.parameters,docs:{...W.parameters?.docs,source:{originalSource:`{
  name: 'Custom Width',
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    return <>
        <Button label="Open Wide Drawer" onClick={() => setIsOpen(true)} />
        <MobileNav isOpen={isOpen} onOpenChange={open => setIsOpen(open)} header="Wide Navigation" width={360}>
          <SideNavSection title="Main">
            <SideNavItem label="Dashboard" icon={HomeIcon} selectedIcon={HomeIconSolid} isSelected href="/dashboard" />
            <SideNavItem label="Projects" icon={FolderIcon} href="/projects" />
          </SideNavSection>
        </MobileNav>
      </>;
  }
}`,...W.parameters?.docs?.source}}},G.parameters={...G.parameters,docs:{...G.parameters?.docs,source:{originalSource:`{
  name: 'Without Title',
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    return <>
        <Button label="Open Navigation" icon={<Icon icon="menu" color="inherit" />} variant="ghost" onClick={() => setIsOpen(true)} isIconOnly />
        <MobileNav isOpen={isOpen} onOpenChange={open => setIsOpen(open)}>
          <SideNavSection title="Main">
            <SideNavItem label="Dashboard" icon={HomeIcon} isSelected href="/dashboard" />
            <SideNavItem label="Projects" icon={FolderIcon} href="/projects" />
          </SideNavSection>
        </MobileNav>
      </>;
  }
}`,...G.parameters?.docs?.source}}},K=[`Default`,`WithSideNavChildren`,`ResponsivePattern`,`EndSide`,`CustomWidth`,`WithoutTitle`]})))()}q();export{W as CustomWidth,B as Default,U as EndSide,H as ResponsivePattern,V as WithSideNavChildren,G as WithoutTitle,K as __namedExportsOrder,z as default};