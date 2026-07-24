import{i as e,s as t}from"./preload-helper-CT_b8DTk.js";import{t as n}from"./react-B7Te67-h.js";import{t as r}from"./jsx-runtime-DqZldVDK.js";import{o as i}from"./i18n-J-bZCj-Q.js";import{Ut as a,Wt as o,u as s}from"./iframe-DRSfIdhd.js";function c(e){let[t,n]=(0,l.useState)(e.page??1),[r,i]=(0,l.useState)(e.pageSize??10);return(0,u.jsx)(o,{...e,page:t,onChange:n,pageSize:r,onPageSizeChange:e.pageSizeOptions?i:void 0})}var l,u,d,f,p,m,h,g,_,v,y,b,x,S,C,w,T,E,D;e((()=>{l=t(n()),a(),s(),u=r(),d={title:`Core/Pagination`,component:o,tags:[`autodocs`],argTypes:{page:{control:`number`,description:`Current page (1-based)`},variant:{control:`select`,options:[`pages`,`count`,`compact`,`dots`,`none`],description:`Visual variant`},size:{control:`select`,options:[`sm`,`md`],description:`Size variant`},siblingCount:{control:`number`,description:`Pages shown around current page`},isDisabled:{control:`boolean`,description:`Disabled state`}}},f={render:()=>(0,u.jsx)(c,{page:1,totalItems:100,pageSize:10})},p={name:`Right to Left (RTL)`,render:()=>(0,u.jsx)(i,{locale:`en`,dir:`rtl`,children:(0,u.jsx)(`div`,{dir:`rtl`,children:(0,u.jsx)(c,{page:1,totalItems:100,pageSize:10})})})},m={name:`Variant: Pages`,render:()=>(0,u.jsx)(c,{page:1,totalItems:200,pageSize:10,variant:`pages`})},h={name:`Variant: Count`,render:()=>(0,u.jsx)(c,{page:1,totalItems:200,pageSize:20,variant:`count`})},g={name:`Variant: Compact`,render:()=>(0,u.jsx)(c,{page:1,totalPages:10,variant:`compact`})},_={name:`Variant: Dots`,render:()=>(0,u.jsx)(c,{page:1,totalPages:8,variant:`dots`})},v={name:`Variant: None`,render:()=>(0,u.jsx)(c,{page:1,totalPages:5,variant:`none`})},y={name:`With Page Size Selector`,render:()=>(0,u.jsx)(c,{page:1,totalItems:200,pageSize:10,pageSizeOptions:[10,20,50],variant:`count`})},b={name:`Cursor-Based (hasMore)`,render:()=>(0,u.jsx)(c,{page:1,hasMore:!0})},x={name:`Small Size`,render:()=>(0,u.jsx)(c,{page:1,totalItems:100,pageSize:10,size:`sm`})},S={name:`Many Pages (Ellipsis)`,render:()=>(0,u.jsx)(c,{page:5,totalItems:500,pageSize:10})},C={name:`Many Pages (siblingCount=2)`,render:()=>(0,u.jsx)(c,{page:10,totalItems:500,pageSize:10,siblingCount:2})},w={name:`Single Page`,render:()=>(0,u.jsx)(c,{page:1,totalPages:1})},T={render:()=>(0,u.jsx)(c,{page:3,totalPages:10,isDisabled:!0})},E={name:`All Variants`,render:()=>(0,u.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:24},children:[(0,u.jsxs)(`div`,{children:[(0,u.jsx)(`p`,{style:{marginBottom:8,fontWeight:500},children:`pages (default)`}),(0,u.jsx)(c,{page:3,totalItems:100,pageSize:10,variant:`pages`})]}),(0,u.jsxs)(`div`,{children:[(0,u.jsx)(`p`,{style:{marginBottom:8,fontWeight:500},children:`count`}),(0,u.jsx)(c,{page:3,totalItems:100,pageSize:10,variant:`count`})]}),(0,u.jsxs)(`div`,{children:[(0,u.jsx)(`p`,{style:{marginBottom:8,fontWeight:500},children:`compact`}),(0,u.jsx)(c,{page:3,totalPages:10,variant:`compact`})]}),(0,u.jsxs)(`div`,{children:[(0,u.jsx)(`p`,{style:{marginBottom:8,fontWeight:500},children:`dots`}),(0,u.jsx)(c,{page:3,totalPages:8,variant:`dots`})]}),(0,u.jsxs)(`div`,{children:[(0,u.jsx)(`p`,{style:{marginBottom:8,fontWeight:500},children:`none`}),(0,u.jsx)(c,{page:3,totalPages:10,variant:`none`})]})]})},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  render: () => <PaginationDemo page={1} totalItems={100} pageSize={10} />
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  name: 'Right to Left (RTL)',
  render: () => <InternationalizationProvider locale="en" dir="rtl">
      <div dir="rtl">
        <PaginationDemo page={1} totalItems={100} pageSize={10} />
      </div>
    </InternationalizationProvider>
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  name: 'Variant: Pages',
  render: () => <PaginationDemo page={1} totalItems={200} pageSize={10} variant="pages" />
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  name: 'Variant: Count',
  render: () => <PaginationDemo page={1} totalItems={200} pageSize={20} variant="count" />
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  name: 'Variant: Compact',
  render: () => <PaginationDemo page={1} totalPages={10} variant="compact" />
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  name: 'Variant: Dots',
  render: () => <PaginationDemo page={1} totalPages={8} variant="dots" />
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  name: 'Variant: None',
  render: () => <PaginationDemo page={1} totalPages={5} variant="none" />
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  name: 'With Page Size Selector',
  render: () => <PaginationDemo page={1} totalItems={200} pageSize={10} pageSizeOptions={[10, 20, 50]} variant="count" />
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  name: 'Cursor-Based (hasMore)',
  render: () => <PaginationDemo page={1} hasMore={true} />
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  name: 'Small Size',
  render: () => <PaginationDemo page={1} totalItems={100} pageSize={10} size="sm" />
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  name: 'Many Pages (Ellipsis)',
  render: () => <PaginationDemo page={5} totalItems={500} pageSize={10} />
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  name: 'Many Pages (siblingCount=2)',
  render: () => <PaginationDemo page={10} totalItems={500} pageSize={10} siblingCount={2} />
}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  name: 'Single Page',
  render: () => <PaginationDemo page={1} totalPages={1} />
}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  render: () => <PaginationDemo page={3} totalPages={10} isDisabled />
}`,...T.parameters?.docs?.source}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
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
        <PaginationDemo page={3} totalItems={100} pageSize={10} variant="pages" />
      </div>
      <div>
        <p style={{
        marginBottom: 8,
        fontWeight: 500
      }}>count</p>
        <PaginationDemo page={3} totalItems={100} pageSize={10} variant="count" />
      </div>
      <div>
        <p style={{
        marginBottom: 8,
        fontWeight: 500
      }}>compact</p>
        <PaginationDemo page={3} totalPages={10} variant="compact" />
      </div>
      <div>
        <p style={{
        marginBottom: 8,
        fontWeight: 500
      }}>dots</p>
        <PaginationDemo page={3} totalPages={8} variant="dots" />
      </div>
      <div>
        <p style={{
        marginBottom: 8,
        fontWeight: 500
      }}>none</p>
        <PaginationDemo page={3} totalPages={10} variant="none" />
      </div>
    </div>
}`,...E.parameters?.docs?.source}}},D=[`Default`,`RightToLeft`,`PagesVariant`,`CountVariant`,`CompactVariant`,`DotsVariant`,`NoneVariant`,`WithPageSizeSelector`,`CursorBased`,`SmallSize`,`ManyPages`,`ManyPagesLargeSiblings`,`SinglePage`,`Disabled`,`AllVariants`]}))();export{E as AllVariants,g as CompactVariant,h as CountVariant,b as CursorBased,f as Default,T as Disabled,_ as DotsVariant,S as ManyPages,C as ManyPagesLargeSiblings,v as NoneVariant,m as PagesVariant,p as RightToLeft,w as SinglePage,x as SmallSize,y as WithPageSizeSelector,D as __namedExportsOrder,d as default};