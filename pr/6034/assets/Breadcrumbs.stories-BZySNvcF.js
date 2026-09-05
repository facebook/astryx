import{i as e}from"./preload-helper-CT_b8DTk.js";import{F as t,P as n}from"./ime-Dy4QRKoo.js";import{c as r,t as i}from"./utils-eYNPhPe_.js";import{t as a}from"./jsx-runtime-DqZldVDK.js";import{t as o}from"./Icon-nqzzJpQf.js";import{t as s}from"./Icon-Dn-zG4Ea.js";import{d as c}from"./renderDropdownItems--jDYTiUI.js";import{i as l}from"./Stack-Dntpv-r2.js";import{t as u}from"./Layout-DNDXKYig.js";import{Ci as d,Si as f,Ti as p}from"./iframe-C9K_Xcjh.js";import{Wt as m,bt as h,ot as g,t as _}from"./esm-BNuSW8ar.js";var v,y,b,x,S,C,w,T,E,D,O,k,A,j,M,N,P,F,I,L,R;e((()=>{n(),f(),s(),u(),i(),_(),v=a(),y={title:`Core/Breadcrumbs`,component:p,tags:[`autodocs`],argTypes:{separator:{control:`text`,description:`Separator between items`},label:{control:`text`,description:`Accessible label for the nav landmark`},variant:{control:`select`,options:[`default`,`supporting`],description:`Visual variant controlling text size and color`}}},b={render:()=>(0,v.jsxs)(p,{children:[(0,v.jsx)(d,{href:`/`,children:`Home`}),(0,v.jsx)(d,{href:`/projects`,children:`Projects`}),(0,v.jsx)(d,{isCurrent:!0,children:`My Project`})]})},x={render:()=>(0,v.jsxs)(p,{children:[(0,v.jsx)(d,{href:`/`,children:`Home`}),(0,v.jsx)(d,{isCurrent:!0,children:`Settings`})]})},S={name:`Auto-detect Current`,render:()=>(0,v.jsxs)(p,{children:[(0,v.jsx)(d,{href:`/`,children:`Home`}),(0,v.jsx)(d,{href:`/projects`,children:`Projects`}),(0,v.jsx)(d,{children:`Auto Current`})]})},C={tags:[`visual-baseline`],render:()=>(0,v.jsxs)(l,{gap:3,children:[(0,v.jsxs)(p,{label:`Automatic bidi separator`,separator:`›`,children:[(0,v.jsx)(d,{href:`/`,children:`Home`}),(0,v.jsx)(d,{href:`/docs`,children:`Docs`}),(0,v.jsx)(d,{isCurrent:!0,children:`API Reference`})]}),(0,v.jsxs)(p,{label:`Explicitly mirrored separator`,separator:(0,v.jsx)(`span`,{...t(r.mirror),children:`→`}),children:[(0,v.jsx)(d,{href:`/`,children:`Home`}),(0,v.jsx)(d,{href:`/docs`,children:`Docs`}),(0,v.jsx)(d,{isCurrent:!0,children:`API Reference`})]})]})},w={render:()=>(0,v.jsxs)(p,{children:[(0,v.jsx)(d,{href:`/`,startIcon:(0,v.jsx)(g,{width:16,height:16,"aria-hidden":`true`}),children:`Home`}),(0,v.jsx)(d,{href:`/settings`,startIcon:(0,v.jsx)(m,{width:16,height:16,"aria-hidden":`true`}),children:`Settings`}),(0,v.jsx)(d,{isCurrent:!0,children:`Profile`})]})},T={render:()=>(0,v.jsxs)(p,{children:[(0,v.jsx)(d,{href:`/`,onClick:e=>{e.preventDefault(),console.log(`Navigate to Home`)},children:`Home`}),(0,v.jsx)(d,{href:`/projects`,onClick:e=>{e.preventDefault(),console.log(`Navigate to Projects`)},children:`Projects`}),(0,v.jsx)(d,{isCurrent:!0,children:`Detail`})]})},E={render:()=>(0,v.jsxs)(p,{children:[(0,v.jsx)(d,{href:`/`,children:`Home`}),(0,v.jsx)(d,{href:`/products`,children:`Products`}),(0,v.jsx)(d,{href:`/products/electronics`,children:`Electronics`}),(0,v.jsx)(d,{href:`/products/electronics/phones`,children:`Phones`}),(0,v.jsx)(d,{isCurrent:!0,children:`iPhone 15 Pro`})]})},D={name:`Supporting Variant`,render:()=>(0,v.jsxs)(p,{variant:`supporting`,children:[(0,v.jsx)(d,{href:`/`,children:`Home`}),(0,v.jsx)(d,{href:`/projects`,children:`Projects`}),(0,v.jsx)(d,{isCurrent:!0,children:`My Project`})]})},O={name:`Supporting Variant with Icons`,render:()=>(0,v.jsxs)(p,{variant:`supporting`,children:[(0,v.jsx)(d,{href:`/`,startIcon:(0,v.jsx)(g,{width:14,height:14,"aria-hidden":`true`}),children:`Home`}),(0,v.jsx)(d,{href:`/projects`,startIcon:(0,v.jsx)(h,{width:14,height:14,"aria-hidden":`true`}),children:`Projects`}),(0,v.jsx)(d,{isCurrent:!0,children:`My Project`})]})},k={name:`Current on Middle Item`,render:()=>(0,v.jsxs)(p,{children:[(0,v.jsx)(d,{href:`/`,children:`Home`}),(0,v.jsx)(d,{isCurrent:!0,children:`Projects`}),(0,v.jsx)(d,{href:`/projects/my-project/settings`,children:`Settings`})]})},A=[{label:`Design`,onClick:()=>console.log(`go /team/design`)},{label:`Engineering`,onClick:()=>console.log(`go /team/eng`)},{type:`divider`},{label:`Data`,icon:`chart`,onClick:()=>console.log(`go /team/data`)}],j={name:`Menu Crumb (data array)`,render:()=>(0,v.jsxs)(p,{children:[(0,v.jsx)(d,{href:`/`,children:`Home`}),(0,v.jsx)(d,{menu:A,children:`Teams`}),(0,v.jsx)(d,{isCurrent:!0,children:`Overview`})]})},M={name:`Menu Crumb (composed children)`,render:()=>(0,v.jsxs)(p,{children:[(0,v.jsx)(d,{href:`/`,children:`Home`}),(0,v.jsx)(d,{menu:(0,v.jsxs)(v.Fragment,{children:[(0,v.jsx)(c,{label:`Overview`,onClick:()=>console.log(`overview`)}),(0,v.jsx)(c,{label:`Settings`,icon:`gear`,onClick:()=>console.log(`settings`)})]}),children:`Project`}),(0,v.jsx)(d,{isCurrent:!0,children:`Details`})]})},N={name:`Mirrored Icon Separator`,render:()=>(0,v.jsxs)(p,{separator:(0,v.jsx)(o,{icon:`chevronRight`,size:`xsm`,color:`secondary`,xstyle:r.mirror}),children:[(0,v.jsx)(d,{href:`/`,children:`Home`}),(0,v.jsx)(d,{href:`/docs`,children:`Docs`}),(0,v.jsx)(d,{isCurrent:!0,children:`API Reference`})]})},P={name:`Long Labels in a Narrow Container`,render:()=>(0,v.jsx)(`div`,{style:{width:320,outline:`1px dashed #ccc`},children:(0,v.jsxs)(p,{children:[(0,v.jsx)(d,{href:`/`,children:`Home`}),(0,v.jsx)(d,{href:`/reports`,children:`Quarterly Financial Reconciliation`}),(0,v.jsx)(d,{isCurrent:!0,children:`Consolidated Statement of Operations 2026 Q3`})]})})},F={render:()=>(0,v.jsx)(p,{children:(0,v.jsx)(d,{isCurrent:!0,children:`Only Page`})})},I=[{label:`Design`,onClick:()=>console.log(`go /team/design`)},{label:`Engineering`,isDisabled:!0},{type:`divider`},{label:`Data`,icon:`chart`,onClick:()=>console.log(`go /team/data`)}],L={name:`Menu Crumb (disabled item)`,render:()=>(0,v.jsxs)(p,{children:[(0,v.jsx)(d,{href:`/`,children:`Home`}),(0,v.jsx)(d,{menu:I,children:`Teams`}),(0,v.jsx)(d,{isCurrent:!0,children:`Overview`})]}),play:async({canvasElement:e})=>{let t=e.querySelector(`nav button`);t instanceof HTMLElement&&t.click()}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  render: () => <Breadcrumbs>
      <BreadcrumbItem href="/">Home</BreadcrumbItem>
      <BreadcrumbItem href="/projects">Projects</BreadcrumbItem>
      <BreadcrumbItem isCurrent>My Project</BreadcrumbItem>
    </Breadcrumbs>
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  render: () => <Breadcrumbs>
      <BreadcrumbItem href="/">Home</BreadcrumbItem>
      <BreadcrumbItem isCurrent>Settings</BreadcrumbItem>
    </Breadcrumbs>
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  name: 'Auto-detect Current',
  render: () => <Breadcrumbs>
      <BreadcrumbItem href="/">Home</BreadcrumbItem>
      <BreadcrumbItem href="/projects">Projects</BreadcrumbItem>
      <BreadcrumbItem>Auto Current</BreadcrumbItem>
    </Breadcrumbs>
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  tags: ['visual-baseline'],
  render: () => <VStack gap={3}>
      <Breadcrumbs label="Automatic bidi separator" separator={'›'}>
        <BreadcrumbItem href="/">Home</BreadcrumbItem>
        <BreadcrumbItem href="/docs">Docs</BreadcrumbItem>
        <BreadcrumbItem isCurrent>API Reference</BreadcrumbItem>
      </Breadcrumbs>
      <Breadcrumbs label="Explicitly mirrored separator" separator={<span {...stylex.props(rtlStyles.mirror)}>→</span>}>
        <BreadcrumbItem href="/">Home</BreadcrumbItem>
        <BreadcrumbItem href="/docs">Docs</BreadcrumbItem>
        <BreadcrumbItem isCurrent>API Reference</BreadcrumbItem>
      </Breadcrumbs>
    </VStack>
}`,...C.parameters?.docs?.source},description:{story:`Covers both separator strategies D6 distinguishes: automatic Unicode bidi
mirroring and one explicit mirror for a directional glyph.`,...C.parameters?.docs?.description}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  render: () => <Breadcrumbs>
      <BreadcrumbItem href="/" startIcon={<HomeIcon width={16} height={16} aria-hidden="true" />}>
        Home
      </BreadcrumbItem>
      <BreadcrumbItem href="/settings" startIcon={<Cog6ToothIcon width={16} height={16} aria-hidden="true" />}>
        Settings
      </BreadcrumbItem>
      <BreadcrumbItem isCurrent>Profile</BreadcrumbItem>
    </Breadcrumbs>
}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
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
}`,...T.parameters?.docs?.source}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  render: () => <Breadcrumbs>
      <BreadcrumbItem href="/">Home</BreadcrumbItem>
      <BreadcrumbItem href="/products">Products</BreadcrumbItem>
      <BreadcrumbItem href="/products/electronics">Electronics</BreadcrumbItem>
      <BreadcrumbItem href="/products/electronics/phones">
        Phones
      </BreadcrumbItem>
      <BreadcrumbItem isCurrent>iPhone 15 Pro</BreadcrumbItem>
    </Breadcrumbs>
}`,...E.parameters?.docs?.source}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  name: 'Supporting Variant',
  render: () => <Breadcrumbs variant="supporting">
      <BreadcrumbItem href="/">Home</BreadcrumbItem>
      <BreadcrumbItem href="/projects">Projects</BreadcrumbItem>
      <BreadcrumbItem isCurrent>My Project</BreadcrumbItem>
    </Breadcrumbs>
}`,...D.parameters?.docs?.source}}},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
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
}`,...O.parameters?.docs?.source}}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  name: 'Current on Middle Item',
  render: () => <Breadcrumbs>
      <BreadcrumbItem href="/">Home</BreadcrumbItem>
      <BreadcrumbItem isCurrent>Projects</BreadcrumbItem>
      <BreadcrumbItem href="/projects/my-project/settings">
        Settings
      </BreadcrumbItem>
    </Breadcrumbs>
}`,...k.parameters?.docs?.source},description:{story:`Shows \`isCurrent\` on a middle breadcrumb item rather than the last one.
This is useful when navigating to a child page that isn't represented
in the breadcrumb trail — the parent is still the "current" page in
the hierarchy.`,...k.parameters?.docs?.description}}},j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
  name: 'Menu Crumb (data array)',
  render: () => <Breadcrumbs>
      <BreadcrumbItem href="/">Home</BreadcrumbItem>
      <BreadcrumbItem menu={teamMenu}>Teams</BreadcrumbItem>
      <BreadcrumbItem isCurrent>Overview</BreadcrumbItem>
    </Breadcrumbs>
}`,...j.parameters?.docs?.source},description:{story:"A mid-trail crumb can open a menu of sibling destinations. The `menu` prop\naccepts the SAME item API as `DropdownMenu` / `MoreMenu` / `ContextMenu`, so\nan existing `DropdownMenuOption[]` drops in verbatim. The crumb renders a\nlink-styled trigger with a trailing chevron; separators before and after are\nunaffected.",...j.parameters?.docs?.description}}},M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
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
}`,...M.parameters?.docs?.source},description:{story:"The `menu` prop also accepts composed `BreadcrumbMenuItem` children (an alias\nof `DropdownMenuItem`), for dynamic or stateful menus.",...M.parameters?.docs?.description}}},N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
  name: 'Mirrored Icon Separator',
  render: () => <Breadcrumbs separator={<Icon icon="chevronRight" size="xsm" color="secondary" xstyle={rtlStyles.mirror} />}>
      <BreadcrumbItem href="/">Home</BreadcrumbItem>
      <BreadcrumbItem href="/docs">Docs</BreadcrumbItem>
      <BreadcrumbItem isCurrent>API Reference</BreadcrumbItem>
    </Breadcrumbs>
}`,...N.parameters?.docs?.source},description:{story:"An icon separator is an SVG, so the bidi algorithm never mirrors it the way it\nmirrors an angle-quote glyph such as `›`. A directional icon therefore needs\n`rtlStyles.mirror` through `xstyle`, or it points against the reading\ndirection in an RTL locale.",...N.parameters?.docs?.description}}},P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
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
}`,...P.parameters?.docs?.source},description:{story:`The trail wraps rather than collapsing behind an overflow control, so a long
label and a narrow container both reflow instead of clipping. Rendered in a
320px box, the narrowest width the responsive bar covers.`,...P.parameters?.docs?.description}}},F.parameters={...F.parameters,docs:{...F.parameters?.docs,source:{originalSource:`{
  render: () => <Breadcrumbs>
      <BreadcrumbItem isCurrent>Only Page</BreadcrumbItem>
    </Breadcrumbs>
}`,...F.parameters?.docs?.source},description:{story:`A single crumb renders no separator, and an empty trail collapses to nothing
rather than leaving a blank row.`,...F.parameters?.docs?.description}}},L.parameters={...L.parameters,docs:{...L.parameters?.docs,source:{originalSource:`{
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
}`,...L.parameters?.docs?.source},description:{story:`A menu item can be disabled. The disabled row is what the A20 hover sweep and
the A21 cursor sweep measure on this component; without a story rendering one
neither has anything to check here.`,...L.parameters?.docs?.description}}},R=[`Default`,`TwoLevels`,`AutoDetectCurrent`,`CustomSeparator`,`WithIcons`,`WithOnClick`,`DeepHierarchy`,`SupportingVariant`,`SupportingWithIcons`,`CurrentOnMiddleItem`,`MenuCrumb`,`MenuCrumbComposed`,`MirroredIconSeparator`,`LongLabelsNarrow`,`SingleItem`,`MenuCrumbDisabledItem`]}))();export{S as AutoDetectCurrent,k as CurrentOnMiddleItem,C as CustomSeparator,E as DeepHierarchy,b as Default,P as LongLabelsNarrow,j as MenuCrumb,M as MenuCrumbComposed,L as MenuCrumbDisabledItem,N as MirroredIconSeparator,F as SingleItem,D as SupportingVariant,O as SupportingWithIcons,x as TwoLevels,w as WithIcons,T as WithOnClick,R as __namedExportsOrder,y as default};