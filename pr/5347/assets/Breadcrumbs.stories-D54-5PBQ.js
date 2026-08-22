import{i as e}from"./preload-helper-CT_b8DTk.js";import{c as t,t as n}from"./utils-BiEIGw-d.js";import{t as r}from"./jsx-runtime-DqZldVDK.js";import{t as i}from"./Icon-aeuwryOS.js";import{t as a}from"./Icon-DeqRYbQn.js";import{s as o}from"./renderDropdownItems-DvJk1tEW.js";import{Si as s,bi as c,yi as l}from"./iframe-4ScWx2hJ.js";import{Ht as u,it as d,t as f,vt as p}from"./esm-CL1f8dHF.js";var m,h,g,_,v,y,b,x,S,C,w,T,E,D,O,k,A,j,M,N,P;e((()=>{l(),a(),n(),f(),m=r(),h={title:`Core/Breadcrumbs`,component:s,tags:[`autodocs`],argTypes:{separator:{control:`text`,description:`Separator between items`},label:{control:`text`,description:`Accessible label for the nav landmark`},variant:{control:`select`,options:[`default`,`supporting`],description:`Visual variant controlling text size and color`}}},g={render:()=>(0,m.jsxs)(s,{children:[(0,m.jsx)(c,{href:`/`,children:`Home`}),(0,m.jsx)(c,{href:`/projects`,children:`Projects`}),(0,m.jsx)(c,{isCurrent:!0,children:`My Project`})]})},_={render:()=>(0,m.jsxs)(s,{children:[(0,m.jsx)(c,{href:`/`,children:`Home`}),(0,m.jsx)(c,{isCurrent:!0,children:`Settings`})]})},v={name:`Auto-detect Current`,render:()=>(0,m.jsxs)(s,{children:[(0,m.jsx)(c,{href:`/`,children:`Home`}),(0,m.jsx)(c,{href:`/projects`,children:`Projects`}),(0,m.jsx)(c,{children:`Auto Current`})]})},y={render:()=>(0,m.jsxs)(s,{separator:`›`,children:[(0,m.jsx)(c,{href:`/`,children:`Home`}),(0,m.jsx)(c,{href:`/docs`,children:`Docs`}),(0,m.jsx)(c,{isCurrent:!0,children:`API Reference`})]})},b={render:()=>(0,m.jsxs)(s,{children:[(0,m.jsx)(c,{href:`/`,startIcon:(0,m.jsx)(d,{width:16,height:16,"aria-hidden":`true`}),children:`Home`}),(0,m.jsx)(c,{href:`/settings`,startIcon:(0,m.jsx)(u,{width:16,height:16,"aria-hidden":`true`}),children:`Settings`}),(0,m.jsx)(c,{isCurrent:!0,children:`Profile`})]})},x={render:()=>(0,m.jsxs)(s,{children:[(0,m.jsx)(c,{href:`/`,onClick:e=>{e.preventDefault(),console.log(`Navigate to Home`)},children:`Home`}),(0,m.jsx)(c,{href:`/projects`,onClick:e=>{e.preventDefault(),console.log(`Navigate to Projects`)},children:`Projects`}),(0,m.jsx)(c,{isCurrent:!0,children:`Detail`})]})},S={render:()=>(0,m.jsxs)(s,{children:[(0,m.jsx)(c,{href:`/`,children:`Home`}),(0,m.jsx)(c,{href:`/products`,children:`Products`}),(0,m.jsx)(c,{href:`/products/electronics`,children:`Electronics`}),(0,m.jsx)(c,{href:`/products/electronics/phones`,children:`Phones`}),(0,m.jsx)(c,{isCurrent:!0,children:`iPhone 15 Pro`})]})},C={name:`Supporting Variant`,render:()=>(0,m.jsxs)(s,{variant:`supporting`,children:[(0,m.jsx)(c,{href:`/`,children:`Home`}),(0,m.jsx)(c,{href:`/projects`,children:`Projects`}),(0,m.jsx)(c,{isCurrent:!0,children:`My Project`})]})},w={name:`Supporting Variant with Icons`,render:()=>(0,m.jsxs)(s,{variant:`supporting`,children:[(0,m.jsx)(c,{href:`/`,startIcon:(0,m.jsx)(d,{width:14,height:14,"aria-hidden":`true`}),children:`Home`}),(0,m.jsx)(c,{href:`/projects`,startIcon:(0,m.jsx)(p,{width:14,height:14,"aria-hidden":`true`}),children:`Projects`}),(0,m.jsx)(c,{isCurrent:!0,children:`My Project`})]})},T={name:`Current on Middle Item`,render:()=>(0,m.jsxs)(s,{children:[(0,m.jsx)(c,{href:`/`,children:`Home`}),(0,m.jsx)(c,{isCurrent:!0,children:`Projects`}),(0,m.jsx)(c,{href:`/projects/my-project/settings`,children:`Settings`})]})},E=[{label:`Design`,onClick:()=>console.log(`go /team/design`)},{label:`Engineering`,onClick:()=>console.log(`go /team/eng`)},{type:`divider`},{label:`Data`,icon:`chart`,onClick:()=>console.log(`go /team/data`)}],D={name:`Menu Crumb (data array)`,render:()=>(0,m.jsxs)(s,{children:[(0,m.jsx)(c,{href:`/`,children:`Home`}),(0,m.jsx)(c,{menu:E,children:`Teams`}),(0,m.jsx)(c,{isCurrent:!0,children:`Overview`})]})},O={name:`Menu Crumb (composed children)`,render:()=>(0,m.jsxs)(s,{children:[(0,m.jsx)(c,{href:`/`,children:`Home`}),(0,m.jsx)(c,{menu:(0,m.jsxs)(m.Fragment,{children:[(0,m.jsx)(o,{label:`Overview`,onClick:()=>console.log(`overview`)}),(0,m.jsx)(o,{label:`Settings`,icon:`gear`,onClick:()=>console.log(`settings`)})]}),children:`Project`}),(0,m.jsx)(c,{isCurrent:!0,children:`Details`})]})},k={name:`Mirrored Icon Separator`,render:()=>(0,m.jsxs)(s,{separator:(0,m.jsx)(i,{icon:`chevronRight`,size:`xsm`,color:`secondary`,xstyle:t.mirror}),children:[(0,m.jsx)(c,{href:`/`,children:`Home`}),(0,m.jsx)(c,{href:`/docs`,children:`Docs`}),(0,m.jsx)(c,{isCurrent:!0,children:`API Reference`})]})},A={name:`Long Labels in a Narrow Container`,render:()=>(0,m.jsx)(`div`,{style:{width:320,outline:`1px dashed #ccc`},children:(0,m.jsxs)(s,{children:[(0,m.jsx)(c,{href:`/`,children:`Home`}),(0,m.jsx)(c,{href:`/reports`,children:`Quarterly Financial Reconciliation`}),(0,m.jsx)(c,{isCurrent:!0,children:`Consolidated Statement of Operations 2026 Q3`})]})})},j={render:()=>(0,m.jsx)(s,{children:(0,m.jsx)(c,{isCurrent:!0,children:`Only Page`})})},M=[{label:`Design`,onClick:()=>console.log(`go /team/design`)},{label:`Engineering`,isDisabled:!0},{type:`divider`},{label:`Data`,icon:`chart`,onClick:()=>console.log(`go /team/data`)}],N={name:`Menu Crumb (disabled item)`,render:()=>(0,m.jsxs)(s,{children:[(0,m.jsx)(c,{href:`/`,children:`Home`}),(0,m.jsx)(c,{menu:M,children:`Teams`}),(0,m.jsx)(c,{isCurrent:!0,children:`Overview`})]}),play:async({canvasElement:e})=>{let t=e.querySelector(`nav button`);t instanceof HTMLElement&&t.click()}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  render: () => <Breadcrumbs>
      <BreadcrumbItem href="/">Home</BreadcrumbItem>
      <BreadcrumbItem href="/projects">Projects</BreadcrumbItem>
      <BreadcrumbItem isCurrent>My Project</BreadcrumbItem>
    </Breadcrumbs>
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  render: () => <Breadcrumbs>
      <BreadcrumbItem href="/">Home</BreadcrumbItem>
      <BreadcrumbItem isCurrent>Settings</BreadcrumbItem>
    </Breadcrumbs>
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  name: 'Auto-detect Current',
  render: () => <Breadcrumbs>
      <BreadcrumbItem href="/">Home</BreadcrumbItem>
      <BreadcrumbItem href="/projects">Projects</BreadcrumbItem>
      <BreadcrumbItem>Auto Current</BreadcrumbItem>
    </Breadcrumbs>
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  render: () =>
  // No rtlStyles.mirror here: U+203A has Unicode Bidi_Mirrored=Yes, so the
  // browser flips it under RTL already and an explicit mirror would undo that.
  <Breadcrumbs separator={'›'}>
      <BreadcrumbItem href="/">Home</BreadcrumbItem>
      <BreadcrumbItem href="/docs">Docs</BreadcrumbItem>
      <BreadcrumbItem isCurrent>API Reference</BreadcrumbItem>
    </Breadcrumbs>
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  render: () => <Breadcrumbs>
      <BreadcrumbItem href="/" startIcon={<HomeIcon width={16} height={16} aria-hidden="true" />}>
        Home
      </BreadcrumbItem>
      <BreadcrumbItem href="/settings" startIcon={<Cog6ToothIcon width={16} height={16} aria-hidden="true" />}>
        Settings
      </BreadcrumbItem>
      <BreadcrumbItem isCurrent>Profile</BreadcrumbItem>
    </Breadcrumbs>
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
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
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  render: () => <Breadcrumbs>
      <BreadcrumbItem href="/">Home</BreadcrumbItem>
      <BreadcrumbItem href="/products">Products</BreadcrumbItem>
      <BreadcrumbItem href="/products/electronics">Electronics</BreadcrumbItem>
      <BreadcrumbItem href="/products/electronics/phones">
        Phones
      </BreadcrumbItem>
      <BreadcrumbItem isCurrent>iPhone 15 Pro</BreadcrumbItem>
    </Breadcrumbs>
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  name: 'Supporting Variant',
  render: () => <Breadcrumbs variant="supporting">
      <BreadcrumbItem href="/">Home</BreadcrumbItem>
      <BreadcrumbItem href="/projects">Projects</BreadcrumbItem>
      <BreadcrumbItem isCurrent>My Project</BreadcrumbItem>
    </Breadcrumbs>
}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
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
}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  name: 'Current on Middle Item',
  render: () => <Breadcrumbs>
      <BreadcrumbItem href="/">Home</BreadcrumbItem>
      <BreadcrumbItem isCurrent>Projects</BreadcrumbItem>
      <BreadcrumbItem href="/projects/my-project/settings">
        Settings
      </BreadcrumbItem>
    </Breadcrumbs>
}`,...T.parameters?.docs?.source},description:{story:`Shows \`isCurrent\` on a middle breadcrumb item rather than the last one.
This is useful when navigating to a child page that isn't represented
in the breadcrumb trail — the parent is still the "current" page in
the hierarchy.`,...T.parameters?.docs?.description}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  name: 'Menu Crumb (data array)',
  render: () => <Breadcrumbs>
      <BreadcrumbItem href="/">Home</BreadcrumbItem>
      <BreadcrumbItem menu={teamMenu}>Teams</BreadcrumbItem>
      <BreadcrumbItem isCurrent>Overview</BreadcrumbItem>
    </Breadcrumbs>
}`,...D.parameters?.docs?.source},description:{story:"A mid-trail crumb can open a menu of sibling destinations. The `menu` prop\naccepts the SAME item API as `DropdownMenu` / `MoreMenu` / `ContextMenu`, so\nan existing `DropdownMenuOption[]` drops in verbatim. The crumb renders a\nlink-styled trigger with a trailing chevron; separators before and after are\nunaffected.",...D.parameters?.docs?.description}}},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
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
}`,...O.parameters?.docs?.source},description:{story:"The `menu` prop also accepts composed `BreadcrumbMenuItem` children (an alias\nof `DropdownMenuItem`), for dynamic or stateful menus.",...O.parameters?.docs?.description}}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  name: 'Mirrored Icon Separator',
  render: () => <Breadcrumbs separator={<Icon icon="chevronRight" size="xsm" color="secondary" xstyle={rtlStyles.mirror} />}>
      <BreadcrumbItem href="/">Home</BreadcrumbItem>
      <BreadcrumbItem href="/docs">Docs</BreadcrumbItem>
      <BreadcrumbItem isCurrent>API Reference</BreadcrumbItem>
    </Breadcrumbs>
}`,...k.parameters?.docs?.source},description:{story:"An icon separator is an SVG, so the bidi algorithm never mirrors it the way it\nmirrors an angle-quote glyph such as `›`. A directional icon therefore needs\n`rtlStyles.mirror` through `xstyle`, or it points against the reading\ndirection in an RTL locale.",...k.parameters?.docs?.description}}},A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  name: 'Long Labels in a Narrow Container',
  render: () => <div style={{
    width: 320,
    outline: '1px dashed #ccc'
  }}>
      <Breadcrumbs>
        <BreadcrumbItem href="/">Home</BreadcrumbItem>
        <BreadcrumbItem href="/reports">
          Quarterly Financial Reconciliation
        </BreadcrumbItem>
        <BreadcrumbItem isCurrent>
          Consolidated Statement of Operations 2026 Q3
        </BreadcrumbItem>
      </Breadcrumbs>
    </div>
}`,...A.parameters?.docs?.source},description:{story:`The trail wraps rather than collapsing behind an overflow control, so a long
label and a narrow container both reflow instead of clipping. Rendered in a
320px box, the narrowest width the responsive bar covers.`,...A.parameters?.docs?.description}}},j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
  render: () => <Breadcrumbs>
      <BreadcrumbItem isCurrent>Only Page</BreadcrumbItem>
    </Breadcrumbs>
}`,...j.parameters?.docs?.source},description:{story:`A single crumb renders no separator, and an empty trail collapses to nothing
rather than leaving a blank row.`,...j.parameters?.docs?.description}}},N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
  name: 'Menu Crumb (disabled item)',
  render: () => <Breadcrumbs>
      <BreadcrumbItem href="/">Home</BreadcrumbItem>
      <BreadcrumbItem menu={teamMenuWithDisabled}>Teams</BreadcrumbItem>
      <BreadcrumbItem isCurrent>Overview</BreadcrumbItem>
    </Breadcrumbs>,
  play: async ({
    canvasElement
  }) => {
    const trigger = canvasElement.querySelector('nav button');
    if (trigger instanceof HTMLElement) {
      trigger.click();
    }
  }
}`,...N.parameters?.docs?.source},description:{story:`A menu item can be disabled. The disabled row is what the A20 hover sweep and
the A21 cursor sweep measure on this component; without a story rendering one
neither has anything to check here.`,...N.parameters?.docs?.description}}},P=[`Default`,`TwoLevels`,`AutoDetectCurrent`,`CustomSeparator`,`WithIcons`,`WithOnClick`,`DeepHierarchy`,`SupportingVariant`,`SupportingWithIcons`,`CurrentOnMiddleItem`,`MenuCrumb`,`MenuCrumbComposed`,`MirroredIconSeparator`,`LongLabelsNarrow`,`SingleItem`,`MenuCrumbDisabledItem`]}))();export{v as AutoDetectCurrent,T as CurrentOnMiddleItem,y as CustomSeparator,S as DeepHierarchy,g as Default,A as LongLabelsNarrow,D as MenuCrumb,O as MenuCrumbComposed,N as MenuCrumbDisabledItem,k as MirroredIconSeparator,j as SingleItem,C as SupportingVariant,w as SupportingWithIcons,_ as TwoLevels,b as WithIcons,x as WithOnClick,P as __namedExportsOrder,h as default};