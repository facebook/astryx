import{a1 as e,ah as v}from"./iframe-FpdBIrKz.js";import{P as x}from"./Pagination-DsZvq4jW.js";import"./preload-helper-Ct5FWWRu.js";import"./Selector-CtLoab6j.js";import"./usePopover-OuSvDNa7.js";import"./Field-aJnAslJ5.js";import"./FieldStatus-DWE8xW4u.js";import"./inputStyles.stylex-Bpqcd25J.js";import"./Divider-BLixqolk.js";import"./utils-_uNaBhDK.js";import"./hooks-DIm7lmwJ.js";import"./Item-BJJK0iYd.js";import"./computeTargetAndRel-BlG0ENK0.js";const L={title:"Core/Pagination",component:x,tags:["autodocs"],argTypes:{page:{control:"number",description:"Current page (1-based)"},variant:{control:"select",options:["pages","count","compact","dots","none"],description:"Visual variant"},size:{control:"select",options:["sm","md"],description:"Size variant"},siblingCount:{control:"number",description:"Pages shown around current page"},isDisabled:{control:"boolean",description:"Disabled state"}}};function a(t){const[z,h]=v.useState(t.page??1),[D,j]=v.useState(t.pageSize??10);return e.jsx(x,{...t,page:z,onChange:h,pageSize:D,onPageSizeChange:t.pageSizeOptions?j:void 0})}const r={render:()=>e.jsx(a,{page:1,totalItems:100,pageSize:10})},o={name:"Variant: Pages",render:()=>e.jsx(a,{page:1,totalItems:200,pageSize:10,variant:"pages"})},s={name:"Variant: Count",render:()=>e.jsx(a,{page:1,totalItems:200,pageSize:20,variant:"count"})},n={name:"Variant: Compact",render:()=>e.jsx(a,{page:1,totalPages:10,variant:"compact"})},i={name:"Variant: Dots",render:()=>e.jsx(a,{page:1,totalPages:8,variant:"dots"})},g={name:"Variant: None",render:()=>e.jsx(a,{page:1,totalPages:5,variant:"none"})},p={name:"With Page Size Selector",render:()=>e.jsx(a,{page:1,totalItems:200,pageSize:10,pageSizeOptions:[10,20,50],variant:"count"})},m={name:"Cursor-Based (hasMore)",render:()=>e.jsx(a,{page:1,hasMore:!0})},c={name:"Small Size",render:()=>e.jsx(a,{page:1,totalItems:100,pageSize:10,size:"sm"})},l={name:"Many Pages (Ellipsis)",render:()=>e.jsx(a,{page:5,totalItems:500,pageSize:10})},d={name:"Many Pages (siblingCount=2)",render:()=>e.jsx(a,{page:10,totalItems:500,pageSize:10,siblingCount:2})},u={name:"Single Page",render:()=>e.jsx(a,{page:1,totalPages:1})},S={render:()=>e.jsx(a,{page:3,totalPages:10,isDisabled:!0})},P={name:"All Variants",render:()=>e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:24},children:[e.jsxs("div",{children:[e.jsx("p",{style:{marginBottom:8,fontWeight:500},children:"pages (default)"}),e.jsx(a,{page:3,totalItems:100,pageSize:10,variant:"pages"})]}),e.jsxs("div",{children:[e.jsx("p",{style:{marginBottom:8,fontWeight:500},children:"count"}),e.jsx(a,{page:3,totalItems:100,pageSize:10,variant:"count"})]}),e.jsxs("div",{children:[e.jsx("p",{style:{marginBottom:8,fontWeight:500},children:"compact"}),e.jsx(a,{page:3,totalPages:10,variant:"compact"})]}),e.jsxs("div",{children:[e.jsx("p",{style:{marginBottom:8,fontWeight:500},children:"dots"}),e.jsx(a,{page:3,totalPages:8,variant:"dots"})]}),e.jsxs("div",{children:[e.jsx("p",{style:{marginBottom:8,fontWeight:500},children:"none"}),e.jsx(a,{page:3,totalPages:10,variant:"none"})]})]})};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  render: () => <PaginationDemo page={1} totalItems={100} pageSize={10} />
}`,...r.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  name: 'Variant: Pages',
  render: () => <PaginationDemo page={1} totalItems={200} pageSize={10} variant="pages" />
}`,...o.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  name: 'Variant: Count',
  render: () => <PaginationDemo page={1} totalItems={200} pageSize={20} variant="count" />
}`,...s.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  name: 'Variant: Compact',
  render: () => <PaginationDemo page={1} totalPages={10} variant="compact" />
}`,...n.parameters?.docs?.source}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  name: 'Variant: Dots',
  render: () => <PaginationDemo page={1} totalPages={8} variant="dots" />
}`,...i.parameters?.docs?.source}}};g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  name: 'Variant: None',
  render: () => <PaginationDemo page={1} totalPages={5} variant="none" />
}`,...g.parameters?.docs?.source}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  name: 'With Page Size Selector',
  render: () => <PaginationDemo page={1} totalItems={200} pageSize={10} pageSizeOptions={[10, 20, 50]} variant="count" />
}`,...p.parameters?.docs?.source}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  name: 'Cursor-Based (hasMore)',
  render: () => <PaginationDemo page={1} hasMore={true} />
}`,...m.parameters?.docs?.source}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  name: 'Small Size',
  render: () => <PaginationDemo page={1} totalItems={100} pageSize={10} size="sm" />
}`,...c.parameters?.docs?.source}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  name: 'Many Pages (Ellipsis)',
  render: () => <PaginationDemo page={5} totalItems={500} pageSize={10} />
}`,...l.parameters?.docs?.source}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  name: 'Many Pages (siblingCount=2)',
  render: () => <PaginationDemo page={10} totalItems={500} pageSize={10} siblingCount={2} />
}`,...d.parameters?.docs?.source}}};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  name: 'Single Page',
  render: () => <PaginationDemo page={1} totalPages={1} />
}`,...u.parameters?.docs?.source}}};S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  render: () => <PaginationDemo page={3} totalPages={10} isDisabled />
}`,...S.parameters?.docs?.source}}};P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
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
}`,...P.parameters?.docs?.source}}};const _=["Default","PagesVariant","CountVariant","CompactVariant","DotsVariant","NoneVariant","WithPageSizeSelector","CursorBased","SmallSize","ManyPages","ManyPagesLargeSiblings","SinglePage","Disabled","AllVariants"];export{P as AllVariants,n as CompactVariant,s as CountVariant,m as CursorBased,r as Default,S as Disabled,i as DotsVariant,l as ManyPages,d as ManyPagesLargeSiblings,g as NoneVariant,o as PagesVariant,u as SinglePage,c as SmallSize,p as WithPageSizeSelector,_ as __namedExportsOrder,L as default};
