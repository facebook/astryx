import{i as e}from"./preload-helper-CT_b8DTk.js";import{t}from"./jsx-runtime-DqZldVDK.js";import{_i as n,bi as r,vi as i}from"./iframe-4XAMyx57.js";import{Bt as a,gt as o,nt as s,t as c}from"./esm-DA7gAIBC.js";var l,u,d,f,p,m,h,g,_,v,y,b,x;e((()=>{n(),c(),l=t(),u={title:`Core/Breadcrumbs`,component:r,tags:[`autodocs`],argTypes:{separator:{control:`text`,description:`Separator between items`},label:{control:`text`,description:`Accessible label for the nav landmark`},variant:{control:`select`,options:[`default`,`supporting`],description:`Visual variant controlling text size and color`}}},d={render:()=>(0,l.jsxs)(r,{children:[(0,l.jsx)(i,{href:`/`,children:`Home`}),(0,l.jsx)(i,{href:`/projects`,children:`Projects`}),(0,l.jsx)(i,{isCurrent:!0,children:`My Project`})]})},f={render:()=>(0,l.jsxs)(r,{children:[(0,l.jsx)(i,{href:`/`,children:`Home`}),(0,l.jsx)(i,{isCurrent:!0,children:`Settings`})]})},p={name:`Auto-detect Current`,render:()=>(0,l.jsxs)(r,{children:[(0,l.jsx)(i,{href:`/`,children:`Home`}),(0,l.jsx)(i,{href:`/projects`,children:`Projects`}),(0,l.jsx)(i,{children:`Auto Current`})]})},m={render:()=>(0,l.jsxs)(r,{separator:`›`,children:[(0,l.jsx)(i,{href:`/`,children:`Home`}),(0,l.jsx)(i,{href:`/docs`,children:`Docs`}),(0,l.jsx)(i,{isCurrent:!0,children:`API Reference`})]})},h={render:()=>(0,l.jsxs)(r,{children:[(0,l.jsx)(i,{href:`/`,startIcon:(0,l.jsx)(s,{width:16,height:16,"aria-hidden":`true`}),children:`Home`}),(0,l.jsx)(i,{href:`/settings`,startIcon:(0,l.jsx)(a,{width:16,height:16,"aria-hidden":`true`}),children:`Settings`}),(0,l.jsx)(i,{isCurrent:!0,children:`Profile`})]})},g={render:()=>(0,l.jsxs)(r,{children:[(0,l.jsx)(i,{href:`/`,onClick:e=>{e.preventDefault(),console.log(`Navigate to Home`)},children:`Home`}),(0,l.jsx)(i,{href:`/projects`,onClick:e=>{e.preventDefault(),console.log(`Navigate to Projects`)},children:`Projects`}),(0,l.jsx)(i,{isCurrent:!0,children:`Detail`})]})},_={render:()=>(0,l.jsxs)(r,{children:[(0,l.jsx)(i,{href:`/`,children:`Home`}),(0,l.jsx)(i,{href:`/products`,children:`Products`}),(0,l.jsx)(i,{href:`/products/electronics`,children:`Electronics`}),(0,l.jsx)(i,{href:`/products/electronics/phones`,children:`Phones`}),(0,l.jsx)(i,{isCurrent:!0,children:`iPhone 15 Pro`})]})},v={name:`Supporting Variant`,render:()=>(0,l.jsxs)(r,{variant:`supporting`,children:[(0,l.jsx)(i,{href:`/`,children:`Home`}),(0,l.jsx)(i,{href:`/projects`,children:`Projects`}),(0,l.jsx)(i,{isCurrent:!0,children:`My Project`})]})},y={name:`Supporting Variant with Icons`,render:()=>(0,l.jsxs)(r,{variant:`supporting`,children:[(0,l.jsx)(i,{href:`/`,startIcon:(0,l.jsx)(s,{width:14,height:14,"aria-hidden":`true`}),children:`Home`}),(0,l.jsx)(i,{href:`/projects`,startIcon:(0,l.jsx)(o,{width:14,height:14,"aria-hidden":`true`}),children:`Projects`}),(0,l.jsx)(i,{isCurrent:!0,children:`My Project`})]})},b={name:`Current on Middle Item`,render:()=>(0,l.jsxs)(r,{children:[(0,l.jsx)(i,{href:`/`,children:`Home`}),(0,l.jsx)(i,{isCurrent:!0,children:`Projects`}),(0,l.jsx)(i,{href:`/projects/my-project/settings`,children:`Settings`})]})},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  render: () => <Breadcrumbs>
      <BreadcrumbItem href="/">Home</BreadcrumbItem>
      <BreadcrumbItem href="/projects">Projects</BreadcrumbItem>
      <BreadcrumbItem isCurrent>My Project</BreadcrumbItem>
    </Breadcrumbs>
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  render: () => <Breadcrumbs>
      <BreadcrumbItem href="/">Home</BreadcrumbItem>
      <BreadcrumbItem isCurrent>Settings</BreadcrumbItem>
    </Breadcrumbs>
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  name: 'Auto-detect Current',
  render: () => <Breadcrumbs>
      <BreadcrumbItem href="/">Home</BreadcrumbItem>
      <BreadcrumbItem href="/projects">Projects</BreadcrumbItem>
      <BreadcrumbItem>Auto Current</BreadcrumbItem>
    </Breadcrumbs>
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  render: () => <Breadcrumbs separator={'›'}>
      <BreadcrumbItem href="/">Home</BreadcrumbItem>
      <BreadcrumbItem href="/docs">Docs</BreadcrumbItem>
      <BreadcrumbItem isCurrent>API Reference</BreadcrumbItem>
    </Breadcrumbs>
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  render: () => <Breadcrumbs>
      <BreadcrumbItem href="/" startIcon={<HomeIcon width={16} height={16} aria-hidden="true" />}>
        Home
      </BreadcrumbItem>
      <BreadcrumbItem href="/settings" startIcon={<Cog6ToothIcon width={16} height={16} aria-hidden="true" />}>
        Settings
      </BreadcrumbItem>
      <BreadcrumbItem isCurrent>Profile</BreadcrumbItem>
    </Breadcrumbs>
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
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
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  render: () => <Breadcrumbs>
      <BreadcrumbItem href="/">Home</BreadcrumbItem>
      <BreadcrumbItem href="/products">Products</BreadcrumbItem>
      <BreadcrumbItem href="/products/electronics">
        Electronics
      </BreadcrumbItem>
      <BreadcrumbItem href="/products/electronics/phones">
        Phones
      </BreadcrumbItem>
      <BreadcrumbItem isCurrent>iPhone 15 Pro</BreadcrumbItem>
    </Breadcrumbs>
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  name: 'Supporting Variant',
  render: () => <Breadcrumbs variant="supporting">
      <BreadcrumbItem href="/">Home</BreadcrumbItem>
      <BreadcrumbItem href="/projects">Projects</BreadcrumbItem>
      <BreadcrumbItem isCurrent>My Project</BreadcrumbItem>
    </Breadcrumbs>
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
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
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  name: 'Current on Middle Item',
  render: () => <Breadcrumbs>
      <BreadcrumbItem href="/">Home</BreadcrumbItem>
      <BreadcrumbItem isCurrent>Projects</BreadcrumbItem>
      <BreadcrumbItem href="/projects/my-project/settings">
        Settings
      </BreadcrumbItem>
    </Breadcrumbs>
}`,...b.parameters?.docs?.source},description:{story:`Shows \`isCurrent\` on a middle breadcrumb item rather than the last one.
This is useful when navigating to a child page that isn't represented
in the breadcrumb trail — the parent is still the "current" page in
the hierarchy.`,...b.parameters?.docs?.description}}},x=[`Default`,`TwoLevels`,`AutoDetectCurrent`,`CustomSeparator`,`WithIcons`,`WithOnClick`,`DeepHierarchy`,`SupportingVariant`,`SupportingWithIcons`,`CurrentOnMiddleItem`]}))();export{p as AutoDetectCurrent,b as CurrentOnMiddleItem,m as CustomSeparator,_ as DeepHierarchy,d as Default,v as SupportingVariant,y as SupportingWithIcons,f as TwoLevels,h as WithIcons,g as WithOnClick,x as __namedExportsOrder,u as default};