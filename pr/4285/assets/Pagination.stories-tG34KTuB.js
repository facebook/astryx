import{i as e,s as t}from"./preload-helper-CT_b8DTk.js";import{t as n}from"./react-B7Te67-h.js";import{t as r}from"./jsx-runtime-DqZldVDK.js";import{Ut as i,Wt as a}from"./iframe-BPhJd9TG.js";function o(e){let[t,n]=(0,s.useState)(e.page??1),[r,i]=(0,s.useState)(e.pageSize??10);return(0,c.jsx)(a,{...e,page:t,onChange:n,pageSize:r,onPageSizeChange:e.pageSizeOptions?i:void 0})}var s,c,l,u,d,f,p,m,h,g,_,v,y,b,x,S,C,w;e((()=>{s=t(n()),i(),c=r(),l={title:`Core/Pagination`,component:a,tags:[`autodocs`],argTypes:{page:{control:`number`,description:`Current page (1-based)`},variant:{control:`select`,options:[`pages`,`count`,`compact`,`dots`,`none`],description:`Visual variant`},size:{control:`select`,options:[`sm`,`md`],description:`Size variant`},siblingCount:{control:`number`,description:`Pages shown around current page`},isDisabled:{control:`boolean`,description:`Disabled state`}}},u={render:()=>(0,c.jsx)(o,{page:1,totalItems:100,pageSize:10})},d={name:`Variant: Pages`,render:()=>(0,c.jsx)(o,{page:1,totalItems:200,pageSize:10,variant:`pages`})},f={name:`Variant: Count`,render:()=>(0,c.jsx)(o,{page:1,totalItems:200,pageSize:20,variant:`count`})},p={name:`Variant: Compact`,render:()=>(0,c.jsx)(o,{page:1,totalPages:10,variant:`compact`})},m={name:`Variant: Dots`,render:()=>(0,c.jsx)(o,{page:1,totalPages:8,variant:`dots`})},h={name:`Variant: None`,render:()=>(0,c.jsx)(o,{page:1,totalPages:5,variant:`none`})},g={name:`With Page Size Selector`,render:()=>(0,c.jsx)(o,{page:1,totalItems:200,pageSize:10,pageSizeOptions:[10,20,50],variant:`count`})},_={name:`Cursor-Based (hasMore)`,render:()=>(0,c.jsx)(o,{page:1,hasMore:!0})},v={name:`Small Size`,render:()=>(0,c.jsx)(o,{page:1,totalItems:100,pageSize:10,size:`sm`})},y={name:`Many Pages (Ellipsis)`,render:()=>(0,c.jsx)(o,{page:5,totalItems:500,pageSize:10})},b={name:`Many Pages (siblingCount=2)`,render:()=>(0,c.jsx)(o,{page:10,totalItems:500,pageSize:10,siblingCount:2})},x={name:`Single Page`,render:()=>(0,c.jsx)(o,{page:1,totalPages:1})},S={render:()=>(0,c.jsx)(o,{page:3,totalPages:10,isDisabled:!0})},C={name:`All Variants`,render:()=>(0,c.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:24},children:[(0,c.jsxs)(`div`,{children:[(0,c.jsx)(`p`,{style:{marginBottom:8,fontWeight:500},children:`pages (default)`}),(0,c.jsx)(o,{page:3,totalItems:100,pageSize:10,variant:`pages`})]}),(0,c.jsxs)(`div`,{children:[(0,c.jsx)(`p`,{style:{marginBottom:8,fontWeight:500},children:`count`}),(0,c.jsx)(o,{page:3,totalItems:100,pageSize:10,variant:`count`})]}),(0,c.jsxs)(`div`,{children:[(0,c.jsx)(`p`,{style:{marginBottom:8,fontWeight:500},children:`compact`}),(0,c.jsx)(o,{page:3,totalPages:10,variant:`compact`})]}),(0,c.jsxs)(`div`,{children:[(0,c.jsx)(`p`,{style:{marginBottom:8,fontWeight:500},children:`dots`}),(0,c.jsx)(o,{page:3,totalPages:8,variant:`dots`})]}),(0,c.jsxs)(`div`,{children:[(0,c.jsx)(`p`,{style:{marginBottom:8,fontWeight:500},children:`none`}),(0,c.jsx)(o,{page:3,totalPages:10,variant:`none`})]})]})},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  render: () => <PaginationDemo page={1} totalItems={100} pageSize={10} />
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  name: 'Variant: Pages',
  render: () => <PaginationDemo page={1} totalItems={200} pageSize={10} variant="pages" />
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  name: 'Variant: Count',
  render: () => <PaginationDemo page={1} totalItems={200} pageSize={20} variant="count" />
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  name: 'Variant: Compact',
  render: () => <PaginationDemo page={1} totalPages={10} variant="compact" />
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  name: 'Variant: Dots',
  render: () => <PaginationDemo page={1} totalPages={8} variant="dots" />
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  name: 'Variant: None',
  render: () => <PaginationDemo page={1} totalPages={5} variant="none" />
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  name: 'With Page Size Selector',
  render: () => <PaginationDemo page={1} totalItems={200} pageSize={10} pageSizeOptions={[10, 20, 50]} variant="count" />
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  name: 'Cursor-Based (hasMore)',
  render: () => <PaginationDemo page={1} hasMore={true} />
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  name: 'Small Size',
  render: () => <PaginationDemo page={1} totalItems={100} pageSize={10} size="sm" />
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  name: 'Many Pages (Ellipsis)',
  render: () => <PaginationDemo page={5} totalItems={500} pageSize={10} />
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  name: 'Many Pages (siblingCount=2)',
  render: () => <PaginationDemo page={10} totalItems={500} pageSize={10} siblingCount={2} />
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  name: 'Single Page',
  render: () => <PaginationDemo page={1} totalPages={1} />
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  render: () => <PaginationDemo page={3} totalPages={10} isDisabled />
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
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
}`,...C.parameters?.docs?.source}}},w=[`Default`,`PagesVariant`,`CountVariant`,`CompactVariant`,`DotsVariant`,`NoneVariant`,`WithPageSizeSelector`,`CursorBased`,`SmallSize`,`ManyPages`,`ManyPagesLargeSiblings`,`SinglePage`,`Disabled`,`AllVariants`]}))();export{C as AllVariants,p as CompactVariant,f as CountVariant,_ as CursorBased,u as Default,S as Disabled,m as DotsVariant,y as ManyPages,b as ManyPagesLargeSiblings,h as NoneVariant,d as PagesVariant,x as SinglePage,v as SmallSize,g as WithPageSizeSelector,w as __namedExportsOrder,l as default};