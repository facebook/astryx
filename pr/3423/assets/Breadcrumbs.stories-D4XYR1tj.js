import{ah as m,a1 as e,a6 as R,af as N,ay as T,aJ as F,a7 as L}from"./iframe-FpdBIrKz.js";import{F as A}from"./HomeIcon-kCLW_zIU.js";import{F as _}from"./FolderIcon-G86JWtPK.js";import{F as G}from"./Cog6ToothIcon-aWw6l_cf.js";import"./preload-helper-Ct5FWWRu.js";const E=m.createContext({variant:"default",separator:"/"});E.displayName="BreadcrumbContext";const X={root:{k1xSpc:"astryx1lliihq",$$css:!0}};function t({children:s,separator:u="/",variant:c="default",xstyle:l,className:o,style:p,label:h="Breadcrumb",ref:x,...y}){const b=m.useMemo(()=>({variant:c,separator:u}),[c,u]);return e.jsx(E,{value:b,children:e.jsx("nav",{ref:x,"aria-label":h,...R(T("breadcrumbs",{variant:c}),N(X.root,l),o,p),...y,children:e.jsx("ol",{className:"astryx78zum5 astryx6s0dn4 astryx1a02dak astryxe8uvvx astryx1ghz6dp astryx1717udv astryxzye2dw",children:s})})})}t.displayName="Breadcrumbs";t.__docgenInfo={description:`A navigation breadcrumb trail. Wraps BreadcrumbItem children in
semantic \`<nav>\` + \`<ol>\` markup with separators between items.

Auto-detects the last child as the current page if no item has
\`isCurrent\` explicitly set — handled by each item via DOM inspection,
no React child introspection needed.

@example
\`\`\`
<Breadcrumbs>
  <BreadcrumbItem href="/">Home</BreadcrumbItem>
  <BreadcrumbItem href="/projects">Projects</BreadcrumbItem>
  <BreadcrumbItem isCurrent>My Project</BreadcrumbItem>
</Breadcrumbs>
\`\`\``,methods:[],displayName:"Breadcrumbs",props:{xstyle:{required:!1,tsType:{name:"StyleXStyles"},description:"StyleX styles created via `stylex.create()`. Merged with the component's\nbase styles inside a single `stylex.props()` call for optimal deduplication.\n\n@example\n```\nconst overrides = stylex.create({ root: { marginBottom: 8 } });\n<Component xstyle={overrides.root} />\n```"},ref:{required:!1,tsType:{name:"ReactRef",raw:"React.Ref<HTMLElement>",elements:[{name:"HTMLElement"}]},description:"Ref forwarded to the root element"},children:{required:!0,tsType:{name:"ReactNode"},description:"BreadcrumbItem elements to render as breadcrumb trail."},separator:{required:!1,tsType:{name:"ReactNode"},description:`Separator rendered between items. Decorative only (aria-hidden).
@default '/'`,defaultValue:{value:"'/'",computed:!1}},variant:{required:!1,tsType:{name:"BreadcrumbsVariantMap"},description:"Visual variant for the breadcrumb trail.\n- `'default'`: Standard text styling\n- `'supporting'`: Smaller, secondary text for supporting context\n@default 'default'",defaultValue:{value:"'default'",computed:!1}},label:{required:!1,tsType:{name:"string"},description:`Accessible label for the nav landmark.
@default 'Breadcrumb'`,defaultValue:{value:"'Breadcrumb'",computed:!1}}},composes:["Omit"]};const n={root:{k1xSpc:"astryx78zum5",kGNEyG:"astryx6s0dn4",kOIVth:"astryxzye2dw",kogj98:"astryx1ghz6dp","--separator-display":"astryxkce8z9 astryx1ibt0lz",$$css:!0},defaultSize:{kGuDYH:"astryxjm74w1",kLWn49:"astryxw6l6zx",$$css:!0},supportingSize:{kGuDYH:"astryx141an7d",kLWn49:"astryx1ltkj2j",$$css:!0}};function r({ref:s,as:u,children:c,href:l,onClick:o,isCurrent:p,startIcon:h,xstyle:x,className:y,style:b,"data-testid":D}){const k=m.use(E),q=F(u),a=k.variant==="supporting",P=m.useRef(null),O=p===!0,V=p==null;m.useEffect(()=>{if(!V)return;const d=P.current;if(!d)return;const H=d.parentElement;if(!H)return;const M=Array.from(H.children),W=M.length>0&&M[M.length-1]===d,$=H.querySelector('[aria-current="page"]');return W&&!$&&d.setAttribute("aria-current","page"),()=>{d.removeAttribute("aria-current")}});const f=e.jsxs(e.Fragment,{children:[h&&e.jsx("span",{className:"astryx78zum5 astryx6s0dn4 astryx2lah0s",children:h}),c]});return O?e.jsxs("li",{ref:L(s,P),...R(T("breadcrumb-item"),N(n.root,a?n.supportingSize:n.defaultSize,x),y,b),"data-testid":D,children:[e.jsx("span",{"aria-hidden":"true",className:"astryx11ke7fs astryx6s0dn4 astryxv1l7n4 astryxu0wf1k astryx87ps6o",children:k.separator}),e.jsx("span",{...{0:{className:"astryx78zum5 astryx6s0dn4 astryxzye2dw astryx1pd3egz astryx1tgivj0"},1:{className:"astryx78zum5 astryx6s0dn4 astryxzye2dw astryx1pd3egz astryxv1l7n4"}}[!!a<<0],"aria-current":"page",children:f})]}):e.jsxs("li",{ref:L(s,P),...R(T("breadcrumb-item"),N(n.root,a?n.supportingSize:n.defaultSize,x),y,b),"data-testid":D,children:[e.jsx("span",{"aria-hidden":"true",className:"astryx11ke7fs astryx6s0dn4 astryxv1l7n4 astryxu0wf1k astryx87ps6o",children:k.separator}),l!=null?e.jsx(q,{href:l,onClick:o,...{0:{className:"astryx78zum5 astryx6s0dn4 astryxzye2dw astryxu0wf1k astryx1hl2dhg astryx4ohgrr astryx1ypdohk astryxv1l7n4"},1:{className:"astryx78zum5 astryx6s0dn4 astryxzye2dw astryxu0wf1k astryx1hl2dhg astryx4ohgrr astryx1ypdohk astryxv1l7n4"}}[!!a<<0],children:f}):o!=null?e.jsx("button",{type:"button",onClick:o,...{0:{className:"astryx78zum5 astryx6s0dn4 astryxzye2dw astryx1hl2dhg astryx4ohgrr astryx1ypdohk astryx11g6tue astryx1gs6z28 astryx1717udv astryx1ghz6dp astryxln7xf2 astryxv1l7n4"},1:{className:"astryx78zum5 astryx6s0dn4 astryxzye2dw astryx1hl2dhg astryx4ohgrr astryx1ypdohk astryx11g6tue astryx1gs6z28 astryx1717udv astryx1ghz6dp astryxln7xf2 astryxv1l7n4"}}[!!a<<0],children:f}):e.jsx("span",{...{0:{className:"astryx78zum5 astryx6s0dn4 astryxzye2dw astryx1pd3egz astryx1tgivj0"},1:{className:"astryx78zum5 astryx6s0dn4 astryxzye2dw astryx1pd3egz astryxv1l7n4"}}[!!a<<0],children:f})]})}r.displayName="BreadcrumbItem";r.__docgenInfo={description:`An individual breadcrumb item. Renders as a link (\`<a>\`) or a span
depending on whether it represents the current page.

Each item renders its own leading separator, hidden on :first-child via
CSS. Auto-current detection uses a post-render effect that checks the
DOM — no React child introspection.

@example
\`\`\`
<BreadcrumbItem href="/projects">Projects</BreadcrumbItem>
<BreadcrumbItem isCurrent>My Project</BreadcrumbItem>
\`\`\``,methods:[],displayName:"BreadcrumbItem",props:{ref:{required:!1,tsType:{name:"ReactRef",raw:"React.Ref<HTMLLIElement>",elements:[{name:"HTMLLIElement"}]},description:""},as:{required:!1,tsType:{name:"ElementType"},description:"Custom component to render instead of `<a>` for breadcrumb links.\nOverrides the provider-level default set by LinkProvider.\nOnly applies for non-current items. Must accept href, className, style, and children props."},children:{required:!0,tsType:{name:"ReactNode"},description:"Label content of the breadcrumb item."},href:{required:!1,tsType:{name:"string"},description:"URL for the breadcrumb link. Omit for the current page."},onClick:{required:!1,tsType:{name:"signature",type:"function",raw:"(e: MouseEvent<HTMLElement>) => void",signature:{arguments:[{type:{name:"MouseEvent",elements:[{name:"HTMLElement"}],raw:"MouseEvent<HTMLElement>"},name:"e"}],return:{name:"void"}}},description:"Click handler. Works with or without href."},isCurrent:{required:!1,tsType:{name:"boolean"},description:`Marks this item as the current page. Renders as a span with aria-current="page".
If not set on any item, the last item is auto-detected as current.
@default false`},startIcon:{required:!1,tsType:{name:"ReactNode"},description:"Optional icon rendered before the label."}},composes:["Omit"]};const Z={title:"Core/Breadcrumbs",component:t,tags:["autodocs"],argTypes:{separator:{control:"text",description:"Separator between items"},label:{control:"text",description:"Accessible label for the nav landmark"},variant:{control:"select",options:["default","supporting"],description:"Visual variant controlling text size and color"}}},g={render:()=>e.jsxs(t,{children:[e.jsx(r,{href:"/",children:"Home"}),e.jsx(r,{href:"/projects",children:"Projects"}),e.jsx(r,{isCurrent:!0,children:"My Project"})]})},B={render:()=>e.jsxs(t,{children:[e.jsx(r,{href:"/",children:"Home"}),e.jsx(r,{isCurrent:!0,children:"Settings"})]})},I={name:"Auto-detect Current",render:()=>e.jsxs(t,{children:[e.jsx(r,{href:"/",children:"Home"}),e.jsx(r,{href:"/projects",children:"Projects"}),e.jsx(r,{children:"Auto Current"})]})},j={render:()=>e.jsxs(t,{separator:"›",children:[e.jsx(r,{href:"/",children:"Home"}),e.jsx(r,{href:"/docs",children:"Docs"}),e.jsx(r,{isCurrent:!0,children:"API Reference"})]})},v={render:()=>e.jsxs(t,{children:[e.jsx(r,{href:"/",startIcon:e.jsx(A,{width:16,height:16,"aria-hidden":"true"}),children:"Home"}),e.jsx(r,{href:"/settings",startIcon:e.jsx(G,{width:16,height:16,"aria-hidden":"true"}),children:"Settings"}),e.jsx(r,{isCurrent:!0,children:"Profile"})]})},C={render:()=>e.jsxs(t,{children:[e.jsx(r,{href:"/",onClick:s=>{s.preventDefault(),console.log("Navigate to Home")},children:"Home"}),e.jsx(r,{href:"/projects",onClick:s=>{s.preventDefault(),console.log("Navigate to Projects")},children:"Projects"}),e.jsx(r,{isCurrent:!0,children:"Detail"})]})},w={render:()=>e.jsxs(t,{children:[e.jsx(r,{href:"/",children:"Home"}),e.jsx(r,{href:"/products",children:"Products"}),e.jsx(r,{href:"/products/electronics",children:"Electronics"}),e.jsx(r,{href:"/products/electronics/phones",children:"Phones"}),e.jsx(r,{isCurrent:!0,children:"iPhone 15 Pro"})]})},S={name:"Supporting Variant",render:()=>e.jsxs(t,{variant:"supporting",children:[e.jsx(r,{href:"/",children:"Home"}),e.jsx(r,{href:"/projects",children:"Projects"}),e.jsx(r,{isCurrent:!0,children:"My Project"})]})},z={name:"Supporting Variant with Icons",render:()=>e.jsxs(t,{variant:"supporting",children:[e.jsx(r,{href:"/",startIcon:e.jsx(A,{width:14,height:14,"aria-hidden":"true"}),children:"Home"}),e.jsx(r,{href:"/projects",startIcon:e.jsx(_,{width:14,height:14,"aria-hidden":"true"}),children:"Projects"}),e.jsx(r,{isCurrent:!0,children:"My Project"})]})},i={name:"Current on Middle Item",render:()=>e.jsxs(t,{children:[e.jsx(r,{href:"/",children:"Home"}),e.jsx(r,{isCurrent:!0,children:"Projects"}),e.jsx(r,{href:"/projects/my-project/settings",children:"Settings"})]})};g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  render: () => <Breadcrumbs>
      <BreadcrumbItem href="/">Home</BreadcrumbItem>
      <BreadcrumbItem href="/projects">Projects</BreadcrumbItem>
      <BreadcrumbItem isCurrent>My Project</BreadcrumbItem>
    </Breadcrumbs>
}`,...g.parameters?.docs?.source}}};B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
  render: () => <Breadcrumbs>
      <BreadcrumbItem href="/">Home</BreadcrumbItem>
      <BreadcrumbItem isCurrent>Settings</BreadcrumbItem>
    </Breadcrumbs>
}`,...B.parameters?.docs?.source}}};I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{
  name: 'Auto-detect Current',
  render: () => <Breadcrumbs>
      <BreadcrumbItem href="/">Home</BreadcrumbItem>
      <BreadcrumbItem href="/projects">Projects</BreadcrumbItem>
      <BreadcrumbItem>Auto Current</BreadcrumbItem>
    </Breadcrumbs>
}`,...I.parameters?.docs?.source}}};j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
  render: () => <Breadcrumbs separator={'›'}>
      <BreadcrumbItem href="/">Home</BreadcrumbItem>
      <BreadcrumbItem href="/docs">Docs</BreadcrumbItem>
      <BreadcrumbItem isCurrent>API Reference</BreadcrumbItem>
    </Breadcrumbs>
}`,...j.parameters?.docs?.source}}};v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  render: () => <Breadcrumbs>
      <BreadcrumbItem href="/" startIcon={<HomeIcon width={16} height={16} aria-hidden="true" />}>
        Home
      </BreadcrumbItem>
      <BreadcrumbItem href="/settings" startIcon={<Cog6ToothIcon width={16} height={16} aria-hidden="true" />}>
        Settings
      </BreadcrumbItem>
      <BreadcrumbItem isCurrent>Profile</BreadcrumbItem>
    </Breadcrumbs>
}`,...v.parameters?.docs?.source}}};C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
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
}`,...C.parameters?.docs?.source}}};w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
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
}`,...w.parameters?.docs?.source}}};S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  name: 'Supporting Variant',
  render: () => <Breadcrumbs variant="supporting">
      <BreadcrumbItem href="/">Home</BreadcrumbItem>
      <BreadcrumbItem href="/projects">Projects</BreadcrumbItem>
      <BreadcrumbItem isCurrent>My Project</BreadcrumbItem>
    </Breadcrumbs>
}`,...S.parameters?.docs?.source}}};z.parameters={...z.parameters,docs:{...z.parameters?.docs,source:{originalSource:`{
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
}`,...z.parameters?.docs?.source}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  name: 'Current on Middle Item',
  render: () => <Breadcrumbs>
      <BreadcrumbItem href="/">Home</BreadcrumbItem>
      <BreadcrumbItem isCurrent>Projects</BreadcrumbItem>
      <BreadcrumbItem href="/projects/my-project/settings">
        Settings
      </BreadcrumbItem>
    </Breadcrumbs>
}`,...i.parameters?.docs?.source},description:{story:`Shows \`isCurrent\` on a middle breadcrumb item rather than the last one.
This is useful when navigating to a child page that isn't represented
in the breadcrumb trail — the parent is still the "current" page in
the hierarchy.`,...i.parameters?.docs?.description}}};const ee=["Default","TwoLevels","AutoDetectCurrent","CustomSeparator","WithIcons","WithOnClick","DeepHierarchy","SupportingVariant","SupportingWithIcons","CurrentOnMiddleItem"];export{I as AutoDetectCurrent,i as CurrentOnMiddleItem,j as CustomSeparator,w as DeepHierarchy,g as Default,S as SupportingVariant,z as SupportingWithIcons,B as TwoLevels,v as WithIcons,C as WithOnClick,ee as __namedExportsOrder,Z as default};
