import{i as e}from"./preload-helper-CT_b8DTk.js";import{t}from"./jsx-runtime-DqZldVDK.js";import{a as n}from"./renderDropdownItems-BGi_dvPV.js";import{Ei as r,Oi as i,Ti as a}from"./iframe-BlijhWea.js";import{Bt as o,gt as s,nt as c,t as l}from"./esm-DA7gAIBC.js";var u,d,f,p,m,h,g,_,v,y,b,x,S,C,w,T;e((()=>{a(),l(),u=t(),d={title:`Core/Breadcrumbs`,component:i,tags:[`autodocs`],argTypes:{separator:{control:`text`,description:`Separator between items`},label:{control:`text`,description:`Accessible label for the nav landmark`},variant:{control:`select`,options:[`default`,`supporting`],description:`Visual variant controlling text size and color`}}},f={render:()=>(0,u.jsxs)(i,{children:[(0,u.jsx)(r,{href:`/`,children:`Home`}),(0,u.jsx)(r,{href:`/projects`,children:`Projects`}),(0,u.jsx)(r,{isCurrent:!0,children:`My Project`})]})},p={render:()=>(0,u.jsxs)(i,{children:[(0,u.jsx)(r,{href:`/`,children:`Home`}),(0,u.jsx)(r,{isCurrent:!0,children:`Settings`})]})},m={name:`Auto-detect Current`,render:()=>(0,u.jsxs)(i,{children:[(0,u.jsx)(r,{href:`/`,children:`Home`}),(0,u.jsx)(r,{href:`/projects`,children:`Projects`}),(0,u.jsx)(r,{children:`Auto Current`})]})},h={render:()=>(0,u.jsxs)(i,{separator:`›`,children:[(0,u.jsx)(r,{href:`/`,children:`Home`}),(0,u.jsx)(r,{href:`/docs`,children:`Docs`}),(0,u.jsx)(r,{isCurrent:!0,children:`API Reference`})]})},g={render:()=>(0,u.jsxs)(i,{children:[(0,u.jsx)(r,{href:`/`,startIcon:(0,u.jsx)(c,{width:16,height:16,"aria-hidden":`true`}),children:`Home`}),(0,u.jsx)(r,{href:`/settings`,startIcon:(0,u.jsx)(o,{width:16,height:16,"aria-hidden":`true`}),children:`Settings`}),(0,u.jsx)(r,{isCurrent:!0,children:`Profile`})]})},_={render:()=>(0,u.jsxs)(i,{children:[(0,u.jsx)(r,{href:`/`,onClick:e=>{e.preventDefault(),console.log(`Navigate to Home`)},children:`Home`}),(0,u.jsx)(r,{href:`/projects`,onClick:e=>{e.preventDefault(),console.log(`Navigate to Projects`)},children:`Projects`}),(0,u.jsx)(r,{isCurrent:!0,children:`Detail`})]})},v={render:()=>(0,u.jsxs)(i,{children:[(0,u.jsx)(r,{href:`/`,children:`Home`}),(0,u.jsx)(r,{href:`/products`,children:`Products`}),(0,u.jsx)(r,{href:`/products/electronics`,children:`Electronics`}),(0,u.jsx)(r,{href:`/products/electronics/phones`,children:`Phones`}),(0,u.jsx)(r,{isCurrent:!0,children:`iPhone 15 Pro`})]})},y={name:`Supporting Variant`,render:()=>(0,u.jsxs)(i,{variant:`supporting`,children:[(0,u.jsx)(r,{href:`/`,children:`Home`}),(0,u.jsx)(r,{href:`/projects`,children:`Projects`}),(0,u.jsx)(r,{isCurrent:!0,children:`My Project`})]})},b={name:`Supporting Variant with Icons`,render:()=>(0,u.jsxs)(i,{variant:`supporting`,children:[(0,u.jsx)(r,{href:`/`,startIcon:(0,u.jsx)(c,{width:14,height:14,"aria-hidden":`true`}),children:`Home`}),(0,u.jsx)(r,{href:`/projects`,startIcon:(0,u.jsx)(s,{width:14,height:14,"aria-hidden":`true`}),children:`Projects`}),(0,u.jsx)(r,{isCurrent:!0,children:`My Project`})]})},x={name:`Current on Middle Item`,render:()=>(0,u.jsxs)(i,{children:[(0,u.jsx)(r,{href:`/`,children:`Home`}),(0,u.jsx)(r,{isCurrent:!0,children:`Projects`}),(0,u.jsx)(r,{href:`/projects/my-project/settings`,children:`Settings`})]})},S=[{label:`Design`,onClick:()=>console.log(`go /team/design`)},{label:`Engineering`,onClick:()=>console.log(`go /team/eng`)},{type:`divider`},{label:`Data`,icon:`chart`,onClick:()=>console.log(`go /team/data`)}],C={name:`Menu Crumb (data array)`,render:()=>(0,u.jsxs)(i,{children:[(0,u.jsx)(r,{href:`/`,children:`Home`}),(0,u.jsx)(r,{menu:S,children:`Teams`}),(0,u.jsx)(r,{isCurrent:!0,children:`Overview`})]})},w={name:`Menu Crumb (composed children)`,render:()=>(0,u.jsxs)(i,{children:[(0,u.jsx)(r,{href:`/`,children:`Home`}),(0,u.jsx)(r,{menu:(0,u.jsxs)(u.Fragment,{children:[(0,u.jsx)(n,{label:`Overview`,onClick:()=>console.log(`overview`)}),(0,u.jsx)(n,{label:`Settings`,icon:`gear`,onClick:()=>console.log(`settings`)})]}),children:`Project`}),(0,u.jsx)(r,{isCurrent:!0,children:`Details`})]})},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  render: () => <Breadcrumbs>
      <BreadcrumbItem href="/">Home</BreadcrumbItem>
      <BreadcrumbItem href="/projects">Projects</BreadcrumbItem>
      <BreadcrumbItem isCurrent>My Project</BreadcrumbItem>
    </Breadcrumbs>
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  render: () => <Breadcrumbs>
      <BreadcrumbItem href="/">Home</BreadcrumbItem>
      <BreadcrumbItem isCurrent>Settings</BreadcrumbItem>
    </Breadcrumbs>
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  name: 'Auto-detect Current',
  render: () => <Breadcrumbs>
      <BreadcrumbItem href="/">Home</BreadcrumbItem>
      <BreadcrumbItem href="/projects">Projects</BreadcrumbItem>
      <BreadcrumbItem>Auto Current</BreadcrumbItem>
    </Breadcrumbs>
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  render: () => <Breadcrumbs separator={'›'}>
      <BreadcrumbItem href="/">Home</BreadcrumbItem>
      <BreadcrumbItem href="/docs">Docs</BreadcrumbItem>
      <BreadcrumbItem isCurrent>API Reference</BreadcrumbItem>
    </Breadcrumbs>
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  render: () => <Breadcrumbs>
      <BreadcrumbItem href="/" startIcon={<HomeIcon width={16} height={16} aria-hidden="true" />}>
        Home
      </BreadcrumbItem>
      <BreadcrumbItem href="/settings" startIcon={<Cog6ToothIcon width={16} height={16} aria-hidden="true" />}>
        Settings
      </BreadcrumbItem>
      <BreadcrumbItem isCurrent>Profile</BreadcrumbItem>
    </Breadcrumbs>
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  render: () => <Breadcrumbs>
      <BreadcrumbItem href="/" onClick={e => {
      e.preventDefault();
      console.log('Navigate to Home');
    }}>
        Home
      </BreadcrumbItem>
      <BreadcrumbItem href="/projects" onClick={e => {
      e.preventDefault();
      console.log('Navigate to Projects');
    }}>
        Projects
      </BreadcrumbItem>
      <BreadcrumbItem isCurrent>Detail</BreadcrumbItem>
    </Breadcrumbs>
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  render: () => <Breadcrumbs>
      <BreadcrumbItem href="/">Home</BreadcrumbItem>
      <BreadcrumbItem href="/products">Products</BreadcrumbItem>
      <BreadcrumbItem href="/products/electronics">Electronics</BreadcrumbItem>
      <BreadcrumbItem href="/products/electronics/phones">
        Phones
      </BreadcrumbItem>
      <BreadcrumbItem isCurrent>iPhone 15 Pro</BreadcrumbItem>
    </Breadcrumbs>
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  name: 'Supporting Variant',
  render: () => <Breadcrumbs variant="supporting">
      <BreadcrumbItem href="/">Home</BreadcrumbItem>
      <BreadcrumbItem href="/projects">Projects</BreadcrumbItem>
      <BreadcrumbItem isCurrent>My Project</BreadcrumbItem>
    </Breadcrumbs>
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  name: 'Supporting Variant with Icons',
  render: () => <Breadcrumbs variant="supporting">
      <BreadcrumbItem href="/" startIcon={<HomeIcon width={14} height={14} aria-hidden="true" />}>
        Home
      </BreadcrumbItem>
      <BreadcrumbItem href="/projects" startIcon={<FolderIcon width={14} height={14} aria-hidden="true" />}>
        Projects
      </BreadcrumbItem>
      <BreadcrumbItem isCurrent>My Project</BreadcrumbItem>
    </Breadcrumbs>
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  name: 'Current on Middle Item',
  render: () => <Breadcrumbs>
      <BreadcrumbItem href="/">Home</BreadcrumbItem>
      <BreadcrumbItem isCurrent>Projects</BreadcrumbItem>
      <BreadcrumbItem href="/projects/my-project/settings">
        Settings
      </BreadcrumbItem>
    </Breadcrumbs>
}`,...x.parameters?.docs?.source},description:{story:`Shows \`isCurrent\` on a middle breadcrumb item rather than the last one.
This is useful when navigating to a child page that isn't represented
in the breadcrumb trail — the parent is still the "current" page in
the hierarchy.`,...x.parameters?.docs?.description}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  name: 'Menu Crumb (data array)',
  render: () => <Breadcrumbs>
      <BreadcrumbItem href="/">Home</BreadcrumbItem>
      <BreadcrumbItem menu={teamMenu}>Teams</BreadcrumbItem>
      <BreadcrumbItem isCurrent>Overview</BreadcrumbItem>
    </Breadcrumbs>
}`,...C.parameters?.docs?.source},description:{story:"A mid-trail crumb can open a menu of sibling destinations. The `menu` prop\naccepts the SAME item API as `DropdownMenu` / `MoreMenu` / `ContextMenu`, so\nan existing `DropdownMenuOption[]` drops in verbatim. The crumb renders a\nlink-styled trigger with a trailing chevron; separators before and after are\nunaffected.",...C.parameters?.docs?.description}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  name: 'Menu Crumb (composed children)',
  render: () => <Breadcrumbs>
      <BreadcrumbItem href="/">Home</BreadcrumbItem>
      <BreadcrumbItem menu={<>
            <BreadcrumbMenuItem label="Overview" onClick={() => console.log('overview')} />
            <BreadcrumbMenuItem label="Settings" icon="gear" onClick={() => console.log('settings')} />
          </>}>
        Project
      </BreadcrumbItem>
      <BreadcrumbItem isCurrent>Details</BreadcrumbItem>
    </Breadcrumbs>
}`,...w.parameters?.docs?.source},description:{story:"The `menu` prop also accepts composed `BreadcrumbMenuItem` children (an alias\nof `DropdownMenuItem`), for dynamic or stateful menus.",...w.parameters?.docs?.description}}},T=[`Default`,`TwoLevels`,`AutoDetectCurrent`,`CustomSeparator`,`WithIcons`,`WithOnClick`,`DeepHierarchy`,`SupportingVariant`,`SupportingWithIcons`,`CurrentOnMiddleItem`,`MenuCrumb`,`MenuCrumbComposed`]}))();export{m as AutoDetectCurrent,x as CurrentOnMiddleItem,h as CustomSeparator,v as DeepHierarchy,f as Default,C as MenuCrumb,w as MenuCrumbComposed,y as SupportingVariant,b as SupportingWithIcons,p as TwoLevels,g as WithIcons,_ as WithOnClick,T as __namedExportsOrder,d as default};