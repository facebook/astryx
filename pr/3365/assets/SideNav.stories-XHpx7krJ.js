import{a1 as e,B as I,I as u,T as F}from"./iframe-CF49Wwf0.js";import{S as a,a as i}from"./SideNavItem-Bd6LJ7Mx.js";import{b as t,S as n,F as T,a as B}from"./FolderIcon-FwNDTPkh.js";import{B as m}from"./Badge-B7t8Dbk0.js";import{a as c}from"./ListItem-CI6lV8VK.js";import{M as k}from"./MoreMenu-dlIleilC.js";import{N as o}from"./NavIcon-6QQ3sEUl.js";import{F as d}from"./Cog6ToothIcon-BK_KWOrO.js";import{F as b}from"./DocumentTextIcon-RYxqX_uR.js";import{F as s}from"./CubeIcon-xpgzDSIi.js";import{F as l}from"./HomeIcon-1gCnkQ7y.js";import{F as r}from"./HomeIcon-C-sYLH1E.js";import{F as h}from"./FolderIcon-t1sC0XYb.js";import{F as S}from"./ChartBarIcon-B412lPyL.js";import{F as z}from"./QuestionMarkCircleIcon-BuI3khrf.js";import{F as P}from"./BellIcon-BmpMfxB6.js";import"./preload-helper-Ct5FWWRu.js";import"./AppShellMobileContext-C1HKKix0.js";import"./SideNavRenderContext-CFxv38t1.js";import"./navItemStyles.stylex-B-1DzRU2.js";import"./Heading-bcQlIHnJ.js";import"./ResizeHandle-BqniK4VN.js";import"./usePopover-dK0N4tGE.js";import"./useFocusTrap-CTs8glkB.js";import"./Link-BNryDFS4.js";import"./computeTargetAndRel-BlG0ENK0.js";import"./useInteractiveRole-CtOhBWp3.js";import"./Item-D1VdvwZp.js";import"./DropdownMenu-DWwupCpR.js";import"./renderDropdownItems-BK_aigRT.js";import"./Divider-B8NVXNDK.js";import"./useListFocus-BOVcRWcC.js";import"./useTypeahead-CaUdhu09.js";const ge={title:"Core/SideNav",component:a,tags:["autodocs"],parameters:{layout:"centered"},decorators:[E=>e.jsx("div",{style:{height:480},children:e.jsx(E,{})})]},g={render:()=>e.jsxs(a,{header:e.jsx(n,{icon:e.jsx(o,{icon:e.jsx(s,{style:{width:16,height:16}})}),heading:"My App",headingHref:"/"}),children:[e.jsxs(t,{title:"Main",children:[e.jsx(i,{label:"Dashboard",icon:r,selectedIcon:l,isSelected:!0,href:"/dashboard"}),e.jsx(i,{label:"Projects",icon:h,selectedIcon:T,href:"/projects",endContent:e.jsx(m,{label:"3"})}),e.jsx(i,{label:"Analytics",icon:S,href:"/analytics"}),e.jsx(i,{label:"Team",icon:B,href:"/team"})]}),e.jsx(t,{title:"Documents",children:e.jsx(i,{label:"All Documents",icon:b,href:"/documents"})})]})},p={name:"Title Without Icon",render:()=>e.jsx(a,{header:e.jsx(n,{heading:"My App",headingHref:"/"}),children:e.jsxs(t,{title:"Main",children:[e.jsx(i,{label:"Dashboard",icon:r,selectedIcon:l,isSelected:!0,href:"/dashboard"}),e.jsx(i,{label:"Projects",icon:h,selectedIcon:T,href:"/projects"}),e.jsx(i,{label:"Analytics",icon:S,href:"/analytics"})]})})},N={name:"Header with Menu",render:()=>e.jsx(a,{header:e.jsx(n,{icon:e.jsx(o,{icon:e.jsx(s,{style:{width:16,height:16}})}),heading:"Product Name",subheading:"Business Account",menu:e.jsxs(e.Fragment,{children:[e.jsx(c,{label:"Personal Account",href:"#"}),e.jsx(c,{label:"Acme Corp",href:"#"}),e.jsx(c,{label:"Add account",href:"#"}),e.jsx(c,{label:"Sign out",href:"#"})]})}),children:e.jsxs(t,{title:"Navigation",children:[e.jsx(i,{label:"Dashboard",icon:r,selectedIcon:l,isSelected:!0}),e.jsx(i,{label:"Settings",icon:d})]})})},f={name:"Suite with Independent Links",render:()=>e.jsx(a,{header:e.jsx(n,{icon:e.jsx(o,{icon:e.jsx(s,{style:{width:16,height:16}})}),superheading:"Suite Name",superheadingHref:"/suite",heading:"Product Name",headingHref:"/product",menu:e.jsxs(e.Fragment,{children:[e.jsx(c,{label:"Analytics",href:"#"}),e.jsx(c,{label:"Commerce",href:"#"}),e.jsx(c,{label:"Team Hub",href:"#"})]})}),children:e.jsxs(t,{title:"Main",children:[e.jsx(i,{label:"Dashboard",icon:r,selectedIcon:l,isSelected:!0}),e.jsx(i,{label:"Projects",icon:h})]})})},j={name:"Nested Items",render:()=>e.jsx(a,{header:e.jsx(n,{icon:e.jsx(o,{icon:e.jsx(s,{style:{width:16,height:16}})}),heading:"My App"}),children:e.jsxs(t,{title:"Main",children:[e.jsx(i,{label:"Dashboard",icon:r,selectedIcon:l,isSelected:!0}),e.jsxs(i,{label:"Settings",icon:d,children:[e.jsx(i,{label:"General",href:"/settings/general"}),e.jsx(i,{label:"Security",href:"/settings/security"}),e.jsx(i,{label:"Notifications",href:"/settings/notifications"})]})]})})},v={name:"With Footer Icons",render:()=>e.jsx(a,{header:e.jsx(n,{icon:e.jsx(o,{icon:e.jsx(s,{style:{width:16,height:16}})}),heading:"My App"}),footerIcons:e.jsxs(e.Fragment,{children:[e.jsx(I,{label:"Help",icon:e.jsx(u,{icon:z,size:"md"}),variant:"ghost",size:"sm",isIconOnly:!0}),e.jsx(I,{label:"Notifications",icon:e.jsx(u,{icon:P,size:"md"}),variant:"ghost",size:"sm",isIconOnly:!0})]}),children:e.jsxs(t,{title:"Main",children:[e.jsx(i,{label:"Dashboard",icon:r,selectedIcon:l,isSelected:!0}),e.jsx(i,{label:"Projects",icon:h})]})})},x={name:"Disabled Items",render:()=>e.jsx(a,{header:e.jsx(n,{icon:e.jsx(o,{icon:e.jsx(s,{style:{width:16,height:16}})}),heading:"My App"}),children:e.jsxs(t,{title:"Main",children:[e.jsx(i,{label:"Dashboard",icon:r,selectedIcon:l,isSelected:!0}),e.jsx(i,{label:"Projects",icon:h}),e.jsx(i,{label:"Analytics (Coming Soon)",icon:S,isDisabled:!0})]})})},y={name:"Hidden Section Header",render:()=>e.jsx(a,{header:e.jsx(n,{icon:e.jsx(o,{icon:e.jsx(s,{style:{width:16,height:16}})}),heading:"My App"}),children:e.jsxs(t,{title:"Main navigation",isHeaderHidden:!0,children:[e.jsx(i,{label:"Dashboard",icon:r,selectedIcon:l,isSelected:!0}),e.jsx(i,{label:"Projects",icon:h}),e.jsx(i,{label:"Analytics",icon:S})]})})},C={name:"End Content (Badges & Menus)",render:()=>e.jsx(a,{header:e.jsx(n,{icon:e.jsx(o,{icon:e.jsx(s,{style:{width:16,height:16}})}),heading:"My App",headingHref:"/"}),children:e.jsxs(t,{title:"Navigation",isHeaderHidden:!0,children:[e.jsx(i,{label:"Dashboard",icon:r,selectedIcon:l,isSelected:!0,href:"/dashboard",endContent:e.jsx(k,{size:"sm",items:[{label:"Pin to top",onClick:()=>{}},{label:"Rename",onClick:()=>{}},{label:"Hide from sidebar",onClick:()=>{}}]})}),e.jsx(i,{label:"Projects",icon:h,href:"/projects",endContent:e.jsx(m,{label:12})}),e.jsx(i,{label:"Analytics",icon:S,href:"/analytics",endContent:e.jsx(m,{label:"New"})}),e.jsx(i,{label:"Team",icon:B,href:"/team",endContent:e.jsx(F,{type:"supporting",color:"secondary",children:"8 members"})}),e.jsx(i,{label:"Notifications",icon:P,href:"/notifications",endContent:e.jsx(I,{label:"Settings",icon:e.jsx(u,{icon:d,size:"sm",color:"secondary"}),variant:"ghost",size:"sm",isIconOnly:!0})}),e.jsx(i,{label:"Documents",icon:b,href:"/documents",endContent:e.jsx(F,{type:"supporting",color:"secondary",children:"⌘D"})}),e.jsx(i,{label:"Settings",icon:d,href:"/settings",endContent:e.jsx(F,{type:"supporting",color:"secondary",children:"3 pending"})}),e.jsx(i,{label:"A very long navigation label that should truncate with ellipsis",icon:b,href:"/long",endContent:e.jsx(m,{label:99})})]})})},H={name:"Header End Content",render:()=>e.jsx(a,{header:e.jsx(n,{icon:e.jsx(o,{icon:e.jsx(s,{style:{width:16,height:16}})}),heading:"My App",headingHref:"/",headerEndContent:e.jsx(m,{label:"3",variant:"error"})}),children:e.jsxs(t,{title:"Main",children:[e.jsx(i,{label:"Dashboard",icon:r,selectedIcon:l,isSelected:!0}),e.jsx(i,{label:"Projects",icon:h})]})})},M={name:"Header End Content + Menu",render:()=>e.jsx(a,{header:e.jsx(n,{icon:e.jsx(o,{icon:e.jsx(s,{style:{width:16,height:16}})}),heading:"Product Name",subheading:"Business Account",headerEndContent:e.jsx(m,{label:"New",variant:"info"}),menu:e.jsxs(e.Fragment,{children:[e.jsx(c,{label:"Switch Account",href:"#"}),e.jsx(c,{label:"Sign Out",href:"#"})]})}),children:e.jsx(t,{title:"Main",children:e.jsx(i,{label:"Dashboard",icon:r,selectedIcon:l,isSelected:!0})})})},D={name:"Collapsible Items",render:()=>e.jsxs(a,{header:e.jsx(n,{icon:e.jsx(o,{icon:e.jsx(s,{style:{width:16,height:16}})}),heading:"My App"}),children:[e.jsxs(t,{title:"Collapsible (no href)",children:[e.jsxs(i,{label:"Settings",icon:d,collapsible:!0,children:[e.jsx(i,{label:"General",href:"/settings/general"}),e.jsx(i,{label:"Security",href:"/settings/security"}),e.jsx(i,{label:"Notifications",href:"/settings/notifications"})]}),e.jsxs(i,{label:"Documents",icon:b,collapsible:{defaultIsCollapsed:!0},children:[e.jsx(i,{label:"Drafts",href:"/documents/drafts"}),e.jsx(i,{label:"Published",href:"/documents/published"})]})]}),e.jsxs(t,{title:"Collapsible + href",children:[e.jsxs(i,{label:"Settings",icon:d,href:"/settings",collapsible:!0,children:[e.jsx(i,{label:"General",href:"/settings/general"}),e.jsx(i,{label:"Security",href:"/settings/security"}),e.jsx(i,{label:"Notifications",href:"/settings/notifications"})]}),e.jsxs(i,{label:"Documents",icon:b,href:"/documents",collapsible:{defaultIsCollapsed:!0},children:[e.jsx(i,{label:"Drafts",href:"/documents/drafts"}),e.jsx(i,{label:"Published",href:"/documents/published"})]})]}),e.jsx(t,{title:"Collapsible + onClick",children:e.jsxs(i,{label:"Settings",icon:d,onClick:()=>alert("Settings clicked"),collapsible:!0,children:[e.jsx(i,{label:"General",href:"/settings/general"}),e.jsx(i,{label:"Security",href:"/settings/security"}),e.jsx(i,{label:"Notifications",href:"/settings/notifications"})]})})]})},A={name:"Collapsible Sidebar",render:()=>e.jsxs(a,{collapsible:!0,header:e.jsx(n,{icon:e.jsx(o,{icon:e.jsx(s,{style:{width:16,height:16}})}),heading:"My App",headingHref:"/"}),footerIcons:e.jsxs(e.Fragment,{children:[e.jsx(I,{label:"Help",icon:e.jsx(u,{icon:z,size:"md"}),variant:"ghost",size:"sm",isIconOnly:!0}),e.jsx(I,{label:"Notifications",icon:e.jsx(u,{icon:P,size:"md"}),variant:"ghost",size:"sm",isIconOnly:!0})]}),children:[e.jsxs(t,{title:"Main",children:[e.jsx(i,{label:"Dashboard",icon:r,selectedIcon:l,isSelected:!0,href:"/dashboard"}),e.jsx(i,{label:"Projects",icon:h,selectedIcon:T,href:"/projects",endContent:e.jsx(m,{label:"3"})}),e.jsx(i,{label:"Analytics",icon:S,href:"/analytics"}),e.jsx(i,{label:"Team",icon:B,href:"/team"})]}),e.jsxs(t,{title:"Settings",children:[e.jsxs(i,{label:"Settings",icon:d,collapsible:!0,children:[e.jsx(i,{label:"General",href:"/settings/general"}),e.jsx(i,{label:"Security",href:"/settings/security"}),e.jsx(i,{label:"Notifications",href:"/settings/notifications"})]}),e.jsx(i,{label:"Documents",icon:b,href:"/documents"})]})]})},w={name:"Iconless Nested Items",render:()=>e.jsx(a,{header:e.jsx(n,{icon:e.jsx(o,{icon:e.jsx(s,{style:{width:16,height:16}})}),heading:"My App"}),children:e.jsxs(t,{title:"Main",children:[e.jsx(i,{label:"Dashboard",icon:r,selectedIcon:l,isSelected:!0,href:"/dashboard"}),e.jsxs(i,{label:"Settings",icon:d,collapsible:!0,children:[e.jsx(i,{label:"General",href:"/settings/general"}),e.jsx(i,{label:"Security",href:"/settings/security"}),e.jsx(i,{label:"Notifications",href:"/settings/notifications"})]}),e.jsxs(i,{label:"Reports",collapsible:!0,children:[e.jsx(i,{label:"Monthly",href:"/reports/monthly"}),e.jsx(i,{label:"Quarterly",href:"/reports/quarterly"}),e.jsx(i,{label:"Annual",href:"/reports/annual"})]}),e.jsx(i,{label:"Analytics",icon:S,href:"/analytics"})]})})};g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  render: () => <SideNav header={<SideNavHeading icon={<NavIcon icon={<CubeIcon style={{
    width: 16,
    height: 16
  }} />} />} heading="My App" headingHref="/" />}>
      <SideNavSection title="Main">
        <SideNavItem label="Dashboard" icon={HomeIcon} selectedIcon={HomeIconSolid} isSelected href="/dashboard" />
        <SideNavItem label="Projects" icon={FolderIcon} selectedIcon={FolderIconSolid} href="/projects" endContent={<Badge label="3" />} />
        <SideNavItem label="Analytics" icon={ChartBarIcon} href="/analytics" />
        <SideNavItem label="Team" icon={UserGroupIcon} href="/team" />
      </SideNavSection>
      <SideNavSection title="Documents">
        <SideNavItem label="All Documents" icon={DocumentTextIcon} href="/documents" />
      </SideNavSection>
    </SideNav>
}`,...g.parameters?.docs?.source}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  name: 'Title Without Icon',
  render: () => <SideNav header={<SideNavHeading heading="My App" headingHref="/" />}>
      <SideNavSection title="Main">
        <SideNavItem label="Dashboard" icon={HomeIcon} selectedIcon={HomeIconSolid} isSelected href="/dashboard" />
        <SideNavItem label="Projects" icon={FolderIcon} selectedIcon={FolderIconSolid} href="/projects" />
        <SideNavItem label="Analytics" icon={ChartBarIcon} href="/analytics" />
      </SideNavSection>
    </SideNav>
}`,...p.parameters?.docs?.source}}};N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
  name: 'Header with Menu',
  render: () => <SideNav header={<SideNavHeading icon={<NavIcon icon={<CubeIcon style={{
    width: 16,
    height: 16
  }} />} />} heading="Product Name" subheading="Business Account" menu={<>
              <ListItem label="Personal Account" href="#" />
              <ListItem label="Acme Corp" href="#" />
              <ListItem label="Add account" href="#" />
              <ListItem label="Sign out" href="#" />
            </>} />}>
      <SideNavSection title="Navigation">
        <SideNavItem label="Dashboard" icon={HomeIcon} selectedIcon={HomeIconSolid} isSelected />
        <SideNavItem label="Settings" icon={Cog6ToothIcon} />
      </SideNavSection>
    </SideNav>
}`,...N.parameters?.docs?.source}}};f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  name: 'Suite with Independent Links',
  render: () => <SideNav header={<SideNavHeading icon={<NavIcon icon={<CubeIcon style={{
    width: 16,
    height: 16
  }} />} />} superheading="Suite Name" superheadingHref="/suite" heading="Product Name" headingHref="/product" menu={<>
              <ListItem label="Analytics" href="#" />
              <ListItem label="Commerce" href="#" />
              <ListItem label="Team Hub" href="#" />
            </>} />}>
      <SideNavSection title="Main">
        <SideNavItem label="Dashboard" icon={HomeIcon} selectedIcon={HomeIconSolid} isSelected />
        <SideNavItem label="Projects" icon={FolderIcon} />
      </SideNavSection>
    </SideNav>
}`,...f.parameters?.docs?.source}}};j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
  name: 'Nested Items',
  render: () => <SideNav header={<SideNavHeading icon={<NavIcon icon={<CubeIcon style={{
    width: 16,
    height: 16
  }} />} />} heading="My App" />}>
      <SideNavSection title="Main">
        <SideNavItem label="Dashboard" icon={HomeIcon} selectedIcon={HomeIconSolid} isSelected />
        <SideNavItem label="Settings" icon={Cog6ToothIcon}>
          <SideNavItem label="General" href="/settings/general" />
          <SideNavItem label="Security" href="/settings/security" />
          <SideNavItem label="Notifications" href="/settings/notifications" />
        </SideNavItem>
      </SideNavSection>
    </SideNav>
}`,...j.parameters?.docs?.source}}};v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  name: 'With Footer Icons',
  render: () => <SideNav header={<SideNavHeading icon={<NavIcon icon={<CubeIcon style={{
    width: 16,
    height: 16
  }} />} />} heading="My App" />} footerIcons={<>
          <Button label="Help" icon={<Icon icon={QuestionMarkCircleIcon} size="md" />} variant="ghost" size="sm" isIconOnly />
          <Button label="Notifications" icon={<Icon icon={BellIcon} size="md" />} variant="ghost" size="sm" isIconOnly />
        </>}>
      <SideNavSection title="Main">
        <SideNavItem label="Dashboard" icon={HomeIcon} selectedIcon={HomeIconSolid} isSelected />
        <SideNavItem label="Projects" icon={FolderIcon} />
      </SideNavSection>
    </SideNav>
}`,...v.parameters?.docs?.source}}};x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  name: 'Disabled Items',
  render: () => <SideNav header={<SideNavHeading icon={<NavIcon icon={<CubeIcon style={{
    width: 16,
    height: 16
  }} />} />} heading="My App" />}>
      <SideNavSection title="Main">
        <SideNavItem label="Dashboard" icon={HomeIcon} selectedIcon={HomeIconSolid} isSelected />
        <SideNavItem label="Projects" icon={FolderIcon} />
        <SideNavItem label="Analytics (Coming Soon)" icon={ChartBarIcon} isDisabled />
      </SideNavSection>
    </SideNav>
}`,...x.parameters?.docs?.source}}};y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  name: 'Hidden Section Header',
  render: () => <SideNav header={<SideNavHeading icon={<NavIcon icon={<CubeIcon style={{
    width: 16,
    height: 16
  }} />} />} heading="My App" />}>
      <SideNavSection title="Main navigation" isHeaderHidden>
        <SideNavItem label="Dashboard" icon={HomeIcon} selectedIcon={HomeIconSolid} isSelected />
        <SideNavItem label="Projects" icon={FolderIcon} />
        <SideNavItem label="Analytics" icon={ChartBarIcon} />
      </SideNavSection>
    </SideNav>
}`,...y.parameters?.docs?.source}}};C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  name: 'End Content (Badges & Menus)',
  render: () => <SideNav header={<SideNavHeading icon={<NavIcon icon={<CubeIcon style={{
    width: 16,
    height: 16
  }} />} />} heading="My App" headingHref="/" />}>
      <SideNavSection title="Navigation" isHeaderHidden>
        <SideNavItem label="Dashboard" icon={HomeIcon} selectedIcon={HomeIconSolid} isSelected href="/dashboard" endContent={<MoreMenu size="sm" items={[{
        label: 'Pin to top',
        onClick: () => {}
      }, {
        label: 'Rename',
        onClick: () => {}
      }, {
        label: 'Hide from sidebar',
        onClick: () => {}
      }]} />} />
        <SideNavItem label="Projects" icon={FolderIcon} href="/projects" endContent={<Badge label={12} />} />
        <SideNavItem label="Analytics" icon={ChartBarIcon} href="/analytics" endContent={<Badge label="New" />} />
        <SideNavItem label="Team" icon={UserGroupIcon} href="/team" endContent={<Text type="supporting" color="secondary">
              8 members
            </Text>} />
        <SideNavItem label="Notifications" icon={BellIcon} href="/notifications" endContent={<Button label="Settings" icon={<Icon icon={Cog6ToothIcon} size="sm" color="secondary" />} variant="ghost" size="sm" isIconOnly />} />
        <SideNavItem label="Documents" icon={DocumentTextIcon} href="/documents" endContent={<Text type="supporting" color="secondary">
              ⌘D
            </Text>} />
        <SideNavItem label="Settings" icon={Cog6ToothIcon} href="/settings" endContent={<Text type="supporting" color="secondary">
              3 pending
            </Text>} />
        <SideNavItem label="A very long navigation label that should truncate with ellipsis" icon={DocumentTextIcon} href="/long" endContent={<Badge label={99} />} />
      </SideNavSection>
    </SideNav>
}`,...C.parameters?.docs?.source}}};H.parameters={...H.parameters,docs:{...H.parameters?.docs,source:{originalSource:`{
  name: 'Header End Content',
  render: () => <SideNav header={<SideNavHeading icon={<NavIcon icon={<CubeIcon style={{
    width: 16,
    height: 16
  }} />} />} heading="My App" headingHref="/" headerEndContent={<Badge label="3" variant="error" />} />}>
      <SideNavSection title="Main">
        <SideNavItem label="Dashboard" icon={HomeIcon} selectedIcon={HomeIconSolid} isSelected />
        <SideNavItem label="Projects" icon={FolderIcon} />
      </SideNavSection>
    </SideNav>
}`,...H.parameters?.docs?.source}}};M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
  name: 'Header End Content + Menu',
  render: () => <SideNav header={<SideNavHeading icon={<NavIcon icon={<CubeIcon style={{
    width: 16,
    height: 16
  }} />} />} heading="Product Name" subheading="Business Account" headerEndContent={<Badge label="New" variant="info" />} menu={<>
              <ListItem label="Switch Account" href="#" />
              <ListItem label="Sign Out" href="#" />
            </>} />}>
      <SideNavSection title="Main">
        <SideNavItem label="Dashboard" icon={HomeIcon} selectedIcon={HomeIconSolid} isSelected />
      </SideNavSection>
    </SideNav>
}`,...M.parameters?.docs?.source}}};D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  name: 'Collapsible Items',
  render: () => <SideNav header={<SideNavHeading icon={<NavIcon icon={<CubeIcon style={{
    width: 16,
    height: 16
  }} />} />} heading="My App" />}>
      <SideNavSection title="Collapsible (no href)">
        <SideNavItem label="Settings" icon={Cog6ToothIcon} collapsible>
          <SideNavItem label="General" href="/settings/general" />
          <SideNavItem label="Security" href="/settings/security" />
          <SideNavItem label="Notifications" href="/settings/notifications" />
        </SideNavItem>
        <SideNavItem label="Documents" icon={DocumentTextIcon} collapsible={{
        defaultIsCollapsed: true
      }}>
          <SideNavItem label="Drafts" href="/documents/drafts" />
          <SideNavItem label="Published" href="/documents/published" />
        </SideNavItem>
      </SideNavSection>
      <SideNavSection title="Collapsible + href">
        <SideNavItem label="Settings" icon={Cog6ToothIcon} href="/settings" collapsible>
          <SideNavItem label="General" href="/settings/general" />
          <SideNavItem label="Security" href="/settings/security" />
          <SideNavItem label="Notifications" href="/settings/notifications" />
        </SideNavItem>
        <SideNavItem label="Documents" icon={DocumentTextIcon} href="/documents" collapsible={{
        defaultIsCollapsed: true
      }}>
          <SideNavItem label="Drafts" href="/documents/drafts" />
          <SideNavItem label="Published" href="/documents/published" />
        </SideNavItem>
      </SideNavSection>
      <SideNavSection title="Collapsible + onClick">
        <SideNavItem label="Settings" icon={Cog6ToothIcon} onClick={() => alert('Settings clicked')} collapsible>
          <SideNavItem label="General" href="/settings/general" />
          <SideNavItem label="Security" href="/settings/security" />
          <SideNavItem label="Notifications" href="/settings/notifications" />
        </SideNavItem>
      </SideNavSection>
    </SideNav>
}`,...D.parameters?.docs?.source}}};A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  name: 'Collapsible Sidebar',
  render: () => <SideNav collapsible header={<SideNavHeading icon={<NavIcon icon={<CubeIcon style={{
    width: 16,
    height: 16
  }} />} />} heading="My App" headingHref="/" />} footerIcons={<>
          <Button label="Help" icon={<Icon icon={QuestionMarkCircleIcon} size="md" />} variant="ghost" size="sm" isIconOnly />
          <Button label="Notifications" icon={<Icon icon={BellIcon} size="md" />} variant="ghost" size="sm" isIconOnly />
        </>}>
      <SideNavSection title="Main">
        <SideNavItem label="Dashboard" icon={HomeIcon} selectedIcon={HomeIconSolid} isSelected href="/dashboard" />
        <SideNavItem label="Projects" icon={FolderIcon} selectedIcon={FolderIconSolid} href="/projects" endContent={<Badge label="3" />} />
        <SideNavItem label="Analytics" icon={ChartBarIcon} href="/analytics" />
        <SideNavItem label="Team" icon={UserGroupIcon} href="/team" />
      </SideNavSection>
      <SideNavSection title="Settings">
        <SideNavItem label="Settings" icon={Cog6ToothIcon} collapsible>
          <SideNavItem label="General" href="/settings/general" />
          <SideNavItem label="Security" href="/settings/security" />
          <SideNavItem label="Notifications" href="/settings/notifications" />
        </SideNavItem>
        <SideNavItem label="Documents" icon={DocumentTextIcon} href="/documents" />
      </SideNavSection>
    </SideNav>
}`,...A.parameters?.docs?.source}}};w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  name: 'Iconless Nested Items',
  render: () => <SideNav header={<SideNavHeading icon={<NavIcon icon={<CubeIcon style={{
    width: 16,
    height: 16
  }} />} />} heading="My App" />}>
      <SideNavSection title="Main">
        <SideNavItem label="Dashboard" icon={HomeIcon} selectedIcon={HomeIconSolid} isSelected href="/dashboard" />
        <SideNavItem label="Settings" icon={Cog6ToothIcon} collapsible>
          <SideNavItem label="General" href="/settings/general" />
          <SideNavItem label="Security" href="/settings/security" />
          <SideNavItem label="Notifications" href="/settings/notifications" />
        </SideNavItem>
        <SideNavItem label="Reports" collapsible>
          <SideNavItem label="Monthly" href="/reports/monthly" />
          <SideNavItem label="Quarterly" href="/reports/quarterly" />
          <SideNavItem label="Annual" href="/reports/annual" />
        </SideNavItem>
        <SideNavItem label="Analytics" icon={ChartBarIcon} href="/analytics" />
      </SideNavSection>
    </SideNav>
}`,...w.parameters?.docs?.source}}};const pe=["Default","TitleWithoutIcon","WithHeaderMenu","SuiteHeader","NestedItems","WithFooter","DisabledItem","HiddenSectionHeader","EndContent","HeaderEndContent","HeaderEndContentWithMenu","CollapsibleItems","CollapsibleSidebar","IconlessNestedItems"];export{D as CollapsibleItems,A as CollapsibleSidebar,g as Default,x as DisabledItem,C as EndContent,H as HeaderEndContent,M as HeaderEndContentWithMenu,y as HiddenSectionHeader,w as IconlessNestedItems,j as NestedItems,f as SuiteHeader,p as TitleWithoutIcon,v as WithFooter,N as WithHeaderMenu,pe as __namedExportsOrder,ge as default};
