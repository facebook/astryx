import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{t}from"./react-BZJXY1be.js";import{t as n}from"./jsx-runtime-DeHZSEgm.js";import{n as r,t as i}from"./Pagination-DYmzISkd.js";import{f as a,p as o}from"./iframe-kzHiZVHn.js";function s(e){let[t,n]=(0,c.useState)(e.page??1),[r,a]=(0,c.useState)(e.pageSize??10);return(0,l.jsx)(i,{...e,page:t,onChange:n,pageSize:r,onPageSizeChange:e.pageSizeOptions?a:void 0})}var c,l,u,d,f,p,m,h,g,_,v,y,b,x,S,C,w,T,E,D,O,k,A;function j(){return(j=e((()=>{c=t(),r(),o(),l=n(),u={title:`Core/Pagination`,component:i,tags:[`autodocs`],argTypes:{page:{control:`number`,description:`Current page (1-based)`},variant:{control:`select`,options:[`pages`,`count`,`compact`,`dots`,`input`,`none`],description:`Visual variant`},pageLabel:{control:`text`,description:`input variant: noun before the editable box (e.g. 'Page' or 'Row')`},hasFirstLast:{control:`boolean`,description:`input variant: show first/last («/») buttons`},step:{control:`number`,description:`pages the prev/next buttons advance per click`},size:{control:`select`,options:[`sm`,`md`],description:`Size variant`},siblingCount:{control:`number`,description:`Pages shown around current page`},isDisabled:{control:`boolean`,description:`Disabled state`}}},d={render:()=>(0,l.jsx)(s,{page:1,totalItems:100,pageSize:10})},f={name:`Right to Left (RTL)`,render:()=>(0,l.jsx)(a,{locale:`en`,dir:`rtl`,children:(0,l.jsx)(`div`,{dir:`rtl`,children:(0,l.jsx)(s,{page:1,totalItems:100,pageSize:10})})})},p={name:`Variant: Pages`,render:()=>(0,l.jsx)(s,{page:1,totalItems:200,pageSize:10,variant:`pages`})},m={name:`Variant: Count`,render:()=>(0,l.jsx)(s,{page:1,totalItems:200,pageSize:20,variant:`count`})},h={name:`Variant: Compact`,render:()=>(0,l.jsx)(s,{page:1,totalPages:10,variant:`compact`})},g={name:`Variant: Dots`,render:()=>(0,l.jsx)(s,{page:1,totalPages:8,variant:`dots`})},_={name:`Variant: None`,render:()=>(0,l.jsx)(s,{page:1,totalPages:5,variant:`none`})},v={name:`Variant: Input`,render:()=>(0,l.jsx)(s,{page:3,totalItems:200,pageSize:20,variant:`input`})},y={name:`Variant: Input (custom pageLabel)`,render:()=>(0,l.jsx)(s,{page:3,totalItems:200,pageSize:10,variant:`input`,pageLabel:`Row`})},b={name:`Variant: Input (no first/last)`,render:()=>(0,l.jsx)(s,{page:3,totalItems:200,pageSize:10,variant:`input`,hasFirstLast:!1})},x={name:`Variant: Input (step by 5)`,render:()=>(0,l.jsx)(s,{page:6,totalItems:500,pageSize:25,variant:`input`,step:5})},S={name:`With Page Size Selector`,render:()=>(0,l.jsx)(s,{page:1,totalItems:200,pageSize:10,pageSizeOptions:[10,20,50],variant:`count`})},C={name:`Cursor-Based (hasMore)`,render:()=>(0,l.jsx)(s,{page:1,hasMore:!0})},w={name:`Small Size`,render:()=>(0,l.jsx)(s,{page:1,totalItems:100,pageSize:10,size:`sm`})},T={name:`Many Pages (Ellipsis)`,render:()=>(0,l.jsx)(s,{page:5,totalItems:500,pageSize:10})},E={name:`Many Pages (siblingCount=2)`,render:()=>(0,l.jsx)(s,{page:10,totalItems:500,pageSize:10,siblingCount:2})},D={name:`Single Page`,render:()=>(0,l.jsx)(s,{page:1,totalPages:1})},O={render:()=>(0,l.jsx)(s,{page:3,totalPages:10,isDisabled:!0})},k={name:`All Variants`,render:()=>(0,l.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:24},children:[(0,l.jsxs)(`div`,{children:[(0,l.jsx)(`p`,{style:{marginBottom:8,fontWeight:500},children:`pages (default)`}),(0,l.jsx)(s,{page:3,totalItems:100,pageSize:10,variant:`pages`,label:`Pages variant`})]}),(0,l.jsxs)(`div`,{children:[(0,l.jsx)(`p`,{style:{marginBottom:8,fontWeight:500},children:`count`}),(0,l.jsx)(s,{page:3,totalItems:100,pageSize:10,variant:`count`,label:`Count variant`})]}),(0,l.jsxs)(`div`,{children:[(0,l.jsx)(`p`,{style:{marginBottom:8,fontWeight:500},children:`compact`}),(0,l.jsx)(s,{page:3,totalPages:10,variant:`compact`,label:`Compact variant`})]}),(0,l.jsxs)(`div`,{children:[(0,l.jsx)(`p`,{style:{marginBottom:8,fontWeight:500},children:`dots`}),(0,l.jsx)(s,{page:3,totalPages:8,variant:`dots`,label:`Dots variant`})]}),(0,l.jsxs)(`div`,{children:[(0,l.jsx)(`p`,{style:{marginBottom:8,fontWeight:500},children:`input`}),(0,l.jsx)(s,{page:3,totalItems:100,pageSize:10,variant:`input`,label:`Input variant`})]}),(0,l.jsxs)(`div`,{children:[(0,l.jsx)(`p`,{style:{marginBottom:8,fontWeight:500},children:`none`}),(0,l.jsx)(s,{page:3,totalPages:10,variant:`none`,label:`None variant`})]})]})},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  render: () => <PaginationDemo page={1} totalItems={100} pageSize={10} />
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  name: 'Right to Left (RTL)',
  render: () => <InternationalizationProvider locale="en" dir="rtl">
      <div dir="rtl">
        <PaginationDemo page={1} totalItems={100} pageSize={10} />
      </div>
    </InternationalizationProvider>
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  name: 'Variant: Pages',
  render: () => <PaginationDemo page={1} totalItems={200} pageSize={10} variant="pages" />
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  name: 'Variant: Count',
  render: () => <PaginationDemo page={1} totalItems={200} pageSize={20} variant="count" />
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  name: 'Variant: Compact',
  render: () => <PaginationDemo page={1} totalPages={10} variant="compact" />
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  name: 'Variant: Dots',
  render: () => <PaginationDemo page={1} totalPages={8} variant="dots" />
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  name: 'Variant: None',
  render: () => <PaginationDemo page={1} totalPages={5} variant="none" />
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  name: 'Variant: Input',
  render: () =>
  // The editable box: « ‹ Page [ n ] / N › »
  <PaginationDemo page={3} totalItems={200} pageSize={20} variant="input" />
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  name: 'Variant: Input (custom pageLabel)',
  render: () =>
  // A "Row" label relabels the same page-navigated box: « ‹ Row [ n ] / N › »
  <PaginationDemo page={3} totalItems={200} pageSize={10} variant="input" pageLabel="Row" />
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  name: 'Variant: Input (no first/last)',
  render: () =>
  // Just ‹ Page [ n ] / N › — first/last buttons hidden.
  <PaginationDemo page={3} totalItems={200} pageSize={10} variant="input" hasFirstLast={false} />
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  name: 'Variant: Input (step by 5)',
  render: () =>
  // ‹/› advance 5 pages per click (clamped to 1..N). 500 items at 25/page =
  // 20 pages, so from page 6 next jumps to 11, prev back to 1.
  <PaginationDemo page={6} totalItems={500} pageSize={25} variant="input" step={5} />
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  name: 'With Page Size Selector',
  render: () => <PaginationDemo page={1} totalItems={200} pageSize={10} pageSizeOptions={[10, 20, 50]} variant="count" />
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  name: 'Cursor-Based (hasMore)',
  render: () => <PaginationDemo page={1} hasMore={true} />
}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  name: 'Small Size',
  render: () => <PaginationDemo page={1} totalItems={100} pageSize={10} size="sm" />
}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  name: 'Many Pages (Ellipsis)',
  render: () => <PaginationDemo page={5} totalItems={500} pageSize={10} />
}`,...T.parameters?.docs?.source}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  name: 'Many Pages (siblingCount=2)',
  render: () => <PaginationDemo page={10} totalItems={500} pageSize={10} siblingCount={2} />
}`,...E.parameters?.docs?.source}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  name: 'Single Page',
  render: () => <PaginationDemo page={1} totalPages={1} />
}`,...D.parameters?.docs?.source}}},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
  render: () => <PaginationDemo page={3} totalPages={10} isDisabled />
}`,...O.parameters?.docs?.source}}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  name: 'All Variants',
  render: () => <div style={{
    display: 'flex',
    flexDirection: 'column',
    gap: 24
  }}>
      <div>
        <p style={{
        marginBottom: 8,
        fontWeight: 500
      }}>pages (default)</p>
        <PaginationDemo page={3} totalItems={100} pageSize={10} variant="pages" label="Pages variant" />
      </div>
      <div>
        <p style={{
        marginBottom: 8,
        fontWeight: 500
      }}>count</p>
        <PaginationDemo page={3} totalItems={100} pageSize={10} variant="count" label="Count variant" />
      </div>
      <div>
        <p style={{
        marginBottom: 8,
        fontWeight: 500
      }}>compact</p>
        <PaginationDemo page={3} totalPages={10} variant="compact" label="Compact variant" />
      </div>
      <div>
        <p style={{
        marginBottom: 8,
        fontWeight: 500
      }}>dots</p>
        <PaginationDemo page={3} totalPages={8} variant="dots" label="Dots variant" />
      </div>
      <div>
        <p style={{
        marginBottom: 8,
        fontWeight: 500
      }}>input</p>
        <PaginationDemo page={3} totalItems={100} pageSize={10} variant="input" label="Input variant" />
      </div>
      <div>
        <p style={{
        marginBottom: 8,
        fontWeight: 500
      }}>none</p>
        <PaginationDemo page={3} totalPages={10} variant="none" label="None variant" />
      </div>
    </div>
}`,...k.parameters?.docs?.source}}},A=[`Default`,`RightToLeft`,`PagesVariant`,`CountVariant`,`CompactVariant`,`DotsVariant`,`NoneVariant`,`InputVariant`,`InputVariantCustomLabel`,`InputVariantNoFirstLast`,`InputVariantStep`,`WithPageSizeSelector`,`CursorBased`,`SmallSize`,`ManyPages`,`ManyPagesLargeSiblings`,`SinglePage`,`Disabled`,`AllVariants`]})))()}j();export{k as AllVariants,h as CompactVariant,m as CountVariant,C as CursorBased,d as Default,O as Disabled,g as DotsVariant,v as InputVariant,y as InputVariantCustomLabel,b as InputVariantNoFirstLast,x as InputVariantStep,T as ManyPages,E as ManyPagesLargeSiblings,_ as NoneVariant,p as PagesVariant,f as RightToLeft,D as SinglePage,w as SmallSize,S as WithPageSizeSelector,A as __namedExportsOrder,u as default};