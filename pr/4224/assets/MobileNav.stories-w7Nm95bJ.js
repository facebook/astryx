import{a as e,n as t}from"./rolldown-runtime-DaJ6WEGw.js";import{t as n}from"./react-DvlgmmzG.js";import{a as r}from"./useTheme-CQdBTfQJ.js";import{t as i}from"./jsx-runtime-cM__dR4X.js";import{t as a}from"./Button-Cx-mMzJ7.js";import{t as o}from"./Button-D1MmXezA.js";import{n as s,t as c}from"./Icon-CX7HEytI.js";import{a as l}from"./navItemStyles.stylex-DdUP0lHl.js";import{c as u,i as d,n as f,o as p,t as m}from"./SideNav-E_Q5rTeO.js";import{t as h}from"./hooks-B6Vhwbg_.js";import{n as g,t as _}from"./NavIcon-DjIvkdnl.js";import{k as v}from"./iframe-CorsBOL8.js";import{Bt as y,It as b,c as x,gt as S,nt as C,on as w,t as T}from"./esm-DeXniK4O.js";import{b as E,g as D,t as O}from"./esm-DSYddTLN.js";var k,A,j,M,N,P,F,I,L,R;t((()=>{k=e(n()),v(),m(),o(),c(),_(),h(),T(),O(),A=i(),j={title:`Core/MobileNav`,component:l,tags:[`autodocs`],parameters:{layout:`centered`}},M={render:()=>{let[e,t]=(0,k.useState)(!1);return(0,A.jsxs)(A.Fragment,{children:[(0,A.jsx)(a,{label:`Open Navigation`,icon:(0,A.jsx)(s,{icon:`menu`,color:`inherit`}),variant:`ghost`,onClick:()=>t(!0),isIconOnly:!0}),(0,A.jsxs)(l,{isOpen:e,onOpenChange:e=>t(e),header:`Navigation`,children:[(0,A.jsxs)(f,{title:`Main`,children:[(0,A.jsx)(d,{label:`Dashboard`,icon:C,selectedIcon:D,isSelected:!0,href:`/dashboard`}),(0,A.jsx)(d,{label:`Projects`,icon:S,selectedIcon:E,href:`/projects`}),(0,A.jsx)(d,{label:`Analytics`,icon:w,href:`/analytics`})]}),(0,A.jsxs)(f,{title:`Settings`,children:[(0,A.jsx)(d,{label:`General`,icon:y,href:`/settings`}),(0,A.jsx)(d,{label:`Team`,icon:x,href:`/team`})]})]})]})}},N={name:`With SideNav Children`,render:()=>{let[e,t]=(0,k.useState)(!1);return(0,A.jsxs)(A.Fragment,{children:[(0,A.jsx)(a,{label:`Open Drawer`,onClick:()=>t(!0)}),(0,A.jsx)(l,{isOpen:e,onOpenChange:e=>t(e),header:`My App`,children:(0,A.jsxs)(A.Fragment,{children:[(0,A.jsxs)(f,{title:`Main`,children:[(0,A.jsx)(d,{label:`Dashboard`,icon:C,selectedIcon:D,isSelected:!0,href:`/dashboard`}),(0,A.jsx)(d,{label:`Projects`,icon:S,selectedIcon:E,href:`/projects`}),(0,A.jsx)(d,{label:`Analytics`,icon:w,href:`/analytics`})]}),(0,A.jsx)(f,{title:`Settings`,children:(0,A.jsx)(d,{label:`General`,icon:y,href:`/settings`})})]})})]})}},P={name:`Responsive Pattern`,render:()=>{let e=r(`(max-width: 768px)`),[t,n]=(0,k.useState)(!1),i=(0,A.jsxs)(A.Fragment,{children:[(0,A.jsxs)(f,{title:`Main`,children:[(0,A.jsx)(d,{label:`Dashboard`,icon:C,selectedIcon:D,isSelected:!0,href:`/`}),(0,A.jsx)(d,{label:`Projects`,icon:S,selectedIcon:E,href:`/projects`}),(0,A.jsx)(d,{label:`Analytics`,icon:w,href:`/analytics`})]}),(0,A.jsxs)(f,{title:`Settings`,children:[(0,A.jsx)(d,{label:`General`,icon:y,href:`/settings`}),(0,A.jsx)(d,{label:`Team`,icon:x,href:`/team`})]})]});return e?(0,A.jsxs)(A.Fragment,{children:[(0,A.jsx)(a,{label:`Menu`,icon:(0,A.jsx)(s,{icon:`menu`,color:`inherit`}),variant:`ghost`,onClick:()=>n(!0),isIconOnly:!0}),(0,A.jsx)(l,{isOpen:t,onOpenChange:e=>n(e),header:`My App`,children:i})]}):(0,A.jsx)(`div`,{style:{width:280,height:600,border:`1px solid #e5e7eb`},children:(0,A.jsx)(u,{header:(0,A.jsx)(p,{icon:(0,A.jsx)(g,{icon:(0,A.jsx)(b,{style:{width:16,height:16}})}),heading:`My App`,headingHref:`/`}),children:i})})}},F={name:`End Side`,render:()=>{let[e,t]=(0,k.useState)(!1);return(0,A.jsxs)(A.Fragment,{children:[(0,A.jsx)(a,{label:`Open from Right`,onClick:()=>t(!0)}),(0,A.jsx)(l,{isOpen:e,onOpenChange:e=>t(e),header:`Settings`,side:`end`,children:(0,A.jsxs)(f,{title:`Settings`,children:[(0,A.jsx)(d,{label:`General`,icon:y,href:`/settings`}),(0,A.jsx)(d,{label:`Team`,icon:x,href:`/team`})]})})]})}},I={name:`Custom Width`,render:()=>{let[e,t]=(0,k.useState)(!1);return(0,A.jsxs)(A.Fragment,{children:[(0,A.jsx)(a,{label:`Open Wide Drawer`,onClick:()=>t(!0)}),(0,A.jsx)(l,{isOpen:e,onOpenChange:e=>t(e),header:`Wide Navigation`,width:360,children:(0,A.jsxs)(f,{title:`Main`,children:[(0,A.jsx)(d,{label:`Dashboard`,icon:C,selectedIcon:D,isSelected:!0,href:`/dashboard`}),(0,A.jsx)(d,{label:`Projects`,icon:S,href:`/projects`})]})})]})}},L={name:`Without Title`,render:()=>{let[e,t]=(0,k.useState)(!1);return(0,A.jsxs)(A.Fragment,{children:[(0,A.jsx)(a,{label:`Open Navigation`,icon:(0,A.jsx)(s,{icon:`menu`,color:`inherit`}),variant:`ghost`,onClick:()=>t(!0),isIconOnly:!0}),(0,A.jsx)(l,{isOpen:e,onOpenChange:e=>t(e),children:(0,A.jsxs)(f,{title:`Main`,children:[(0,A.jsx)(d,{label:`Dashboard`,icon:C,isSelected:!0,href:`/dashboard`}),(0,A.jsx)(d,{label:`Projects`,icon:S,href:`/projects`})]})})]})}},M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
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
}`,...M.parameters?.docs?.source}}},N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
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
}`,...N.parameters?.docs?.source}}},P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
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
}`,...P.parameters?.docs?.source}}},F.parameters={...F.parameters,docs:{...F.parameters?.docs,source:{originalSource:`{
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
}`,...F.parameters?.docs?.source}}},I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{
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
}`,...I.parameters?.docs?.source}}},L.parameters={...L.parameters,docs:{...L.parameters?.docs,source:{originalSource:`{
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
}`,...L.parameters?.docs?.source}}},R=[`Default`,`WithSideNavChildren`,`ResponsivePattern`,`EndSide`,`CustomWidth`,`WithoutTitle`]}))();export{I as CustomWidth,M as Default,F as EndSide,P as ResponsivePattern,N as WithSideNavChildren,L as WithoutTitle,R as __namedExportsOrder,j as default};