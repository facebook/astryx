import{ah as c,a1 as e,a6 as N,af as T,ay as E,aK as G,a7 as q}from"./iframe-BzSUXdLu.js";import{F as O}from"./HomeIcon-DJwYpHUJ.js";import{F as X}from"./FolderIcon-DzvxGbUa.js";import{F as Y}from"./Cog6ToothIcon-Bg68Beez.js";import"./preload-helper-Ct5FWWRu.js";const D=c.createContext({variant:"default",separator:"/"});D.displayName="BreadcrumbContext";const K={root:{k1xSpc:"astryx1lliihq",$$css:!0}};function t({children:s,separator:m="/",variant:o="default",xstyle:u,className:d,style:l,label:p="Breadcrumb",ref:h,...x}){const y=c.useMemo(()=>({variant:o,separator:m}),[o,m]);return e.jsx(D,{value:y,children:e.jsx("nav",{ref:h,"aria-label":p,...N(E("breadcrumbs",{variant:o}),T(K.root,u),d,l),...x,children:e.jsx("ol",{className:"astryx78zum5 astryx6s0dn4 astryx1a02dak astryxe8uvvx astryx1ghz6dp astryx1717udv astryxzye2dw",children:s})})})}t.displayName="Breadcrumbs";t.__docgenInfo={description:`A navigation breadcrumb trail. Wraps BreadcrumbItem children in
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
@default 'Breadcrumb'`,defaultValue:{value:"'Breadcrumb'",computed:!1}}},composes:["Omit"]};const n={root:{k1xSpc:"astryx78zum5",kGNEyG:"astryx6s0dn4",kOIVth:"astryxzye2dw",kogj98:"astryx1ghz6dp","--separator-display":"astryxkce8z9 astryx1ibt0lz",$$css:!0},defaultSize:{kGuDYH:"astryxjm74w1",kLWn49:"astryxw6l6zx",$$css:!0},supportingSize:{kGuDYH:"astryx141an7d",kLWn49:"astryx1ltkj2j",$$css:!0}};function r({ref:s,as:m,children:o,href:u,onClick:d,isCurrent:l,startIcon:p,xstyle:h,className:x,style:y,"data-testid":L}){const P=c.use(D),V=G(m),a=P.variant==="supporting",H=c.useRef(null),b=c.useRef(null),W=l===!0,$=l==null;c.useEffect(()=>{if(!$)return;const g=H.current;if(!g)return;const M=g.parentElement;if(!M)return;const R=Array.from(M.children),F=R.length>0&&R[R.length-1]===g,_=M.querySelector('[aria-current="page"]');if(F&&!_){const A=b.current??g;return A.setAttribute("aria-current","page"),()=>{A.removeAttribute("aria-current")}}});const f=e.jsxs(e.Fragment,{children:[p&&e.jsx("span",{className:"astryx78zum5 astryx6s0dn4 astryx2lah0s",children:p}),o]});return W?e.jsxs("li",{ref:q(s,H),...N(E("breadcrumb-item"),T(n.root,a?n.supportingSize:n.defaultSize,h),x,y),"data-testid":L,children:[e.jsx("span",{"aria-hidden":"true",className:"astryx11ke7fs astryx6s0dn4 astryxv1l7n4 astryxu0wf1k astryx87ps6o",children:P.separator}),e.jsx("span",{...{0:{className:"astryx78zum5 astryx6s0dn4 astryxzye2dw astryx1pd3egz astryx1tgivj0"},1:{className:"astryx78zum5 astryx6s0dn4 astryxzye2dw astryx1pd3egz astryxv1l7n4"}}[!!a<<0],"aria-current":"page",children:f})]}):e.jsxs("li",{ref:q(s,H),...N(E("breadcrumb-item"),T(n.root,a?n.supportingSize:n.defaultSize,h),x,y),"data-testid":L,children:[e.jsx("span",{"aria-hidden":"true",className:"astryx11ke7fs astryx6s0dn4 astryxv1l7n4 astryxu0wf1k astryx87ps6o",children:P.separator}),u!=null?e.jsx(V,{ref:b,href:u,onClick:d,...{0:{className:"astryx78zum5 astryx6s0dn4 astryxzye2dw astryxu0wf1k astryx1hl2dhg astryx4ohgrr astryx1ypdohk astryxv1l7n4"},1:{className:"astryx78zum5 astryx6s0dn4 astryxzye2dw astryxu0wf1k astryx1hl2dhg astryx4ohgrr astryx1ypdohk astryxv1l7n4"}}[!!a<<0],children:f}):d!=null?e.jsx("button",{ref:b,type:"button",onClick:d,...{0:{className:"astryx78zum5 astryx6s0dn4 astryxzye2dw astryx1hl2dhg astryx4ohgrr astryx1ypdohk astryx11g6tue astryx1gs6z28 astryx1717udv astryx1ghz6dp astryxln7xf2 astryxv1l7n4"},1:{className:"astryx78zum5 astryx6s0dn4 astryxzye2dw astryx1hl2dhg astryx4ohgrr astryx1ypdohk astryx11g6tue astryx1gs6z28 astryx1717udv astryx1ghz6dp astryxln7xf2 astryxv1l7n4"}}[!!a<<0],children:f}):e.jsx("span",{ref:b,...{0:{className:"astryx78zum5 astryx6s0dn4 astryxzye2dw astryx1pd3egz astryx1tgivj0"},1:{className:"astryx78zum5 astryx6s0dn4 astryxzye2dw astryx1pd3egz astryxv1l7n4"}}[!!a<<0],children:f})]})}r.displayName="BreadcrumbItem";r.__docgenInfo={description:`An individual breadcrumb item. Renders as a link (\`<a>\`) or a span
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
@default false`},startIcon:{required:!1,tsType:{name:"ReactNode"},description:"Optional icon rendered before the label."}},composes:["Omit"]};const re={title:"Core/Breadcrumbs",component:t,tags:["autodocs"],argTypes:{separator:{control:"text",description:"Separator between items"},label:{control:"text",description:"Accessible label for the nav landmark"},variant:{control:"select",options:["default","supporting"],description:"Visual variant controlling text size and color"}}},B={render:()=>e.jsxs(t,{children:[e.jsx(r,{href:"/",children:"Home"}),e.jsx(r,{href:"/projects",children:"Projects"}),e.jsx(r,{isCurrent:!0,children:"My Project"})]})},I={render:()=>e.jsxs(t,{children:[e.jsx(r,{href:"/",children:"Home"}),e.jsx(r,{isCurrent:!0,children:"Settings"})]})},j={name:"Auto-detect Current",render:()=>e.jsxs(t,{children:[e.jsx(r,{href:"/",children:"Home"}),e.jsx(r,{href:"/projects",children:"Projects"}),e.jsx(r,{children:"Auto Current"})]})},v={render:()=>e.jsxs(t,{separator:"›",children:[e.jsx(r,{href:"/",children:"Home"}),e.jsx(r,{href:"/docs",children:"Docs"}),e.jsx(r,{isCurrent:!0,children:"API Reference"})]})},C={render:()=>e.jsxs(t,{children:[e.jsx(r,{href:"/",startIcon:e.jsx(O,{width:16,height:16,"aria-hidden":"true"}),children:"Home"}),e.jsx(r,{href:"/settings",startIcon:e.jsx(Y,{width:16,height:16,"aria-hidden":"true"}),children:"Settings"}),e.jsx(r,{isCurrent:!0,children:"Profile"})]})},w={render:()=>e.jsxs(t,{children:[e.jsx(r,{href:"/",onClick:s=>{s.preventDefault(),console.log("Navigate to Home")},children:"Home"}),e.jsx(r,{href:"/projects",onClick:s=>{s.preventDefault(),console.log("Navigate to Projects")},children:"Projects"}),e.jsx(r,{isCurrent:!0,children:"Detail"})]})},S={render:()=>e.jsxs(t,{children:[e.jsx(r,{href:"/",children:"Home"}),e.jsx(r,{href:"/products",children:"Products"}),e.jsx(r,{href:"/products/electronics",children:"Electronics"}),e.jsx(r,{href:"/products/electronics/phones",children:"Phones"}),e.jsx(r,{isCurrent:!0,children:"iPhone 15 Pro"})]})},z={name:"Supporting Variant",render:()=>e.jsxs(t,{variant:"supporting",children:[e.jsx(r,{href:"/",children:"Home"}),e.jsx(r,{href:"/projects",children:"Projects"}),e.jsx(r,{isCurrent:!0,children:"My Project"})]})},k={name:"Supporting Variant with Icons",render:()=>e.jsxs(t,{variant:"supporting",children:[e.jsx(r,{href:"/",startIcon:e.jsx(O,{width:14,height:14,"aria-hidden":"true"}),children:"Home"}),e.jsx(r,{href:"/projects",startIcon:e.jsx(X,{width:14,height:14,"aria-hidden":"true"}),children:"Projects"}),e.jsx(r,{isCurrent:!0,children:"My Project"})]})},i={name:"Current on Middle Item",render:()=>e.jsxs(t,{children:[e.jsx(r,{href:"/",children:"Home"}),e.jsx(r,{isCurrent:!0,children:"Projects"}),e.jsx(r,{href:"/projects/my-project/settings",children:"Settings"})]})};B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
  render: () => <Breadcrumbs>
      <BreadcrumbItem href="/">Home</BreadcrumbItem>
      <BreadcrumbItem href="/projects">Projects</BreadcrumbItem>
      <BreadcrumbItem isCurrent>My Project</BreadcrumbItem>
    </Breadcrumbs>
}`,...B.parameters?.docs?.source}}};I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{
  render: () => <Breadcrumbs>
      <BreadcrumbItem href="/">Home</BreadcrumbItem>
      <BreadcrumbItem isCurrent>Settings</BreadcrumbItem>
    </Breadcrumbs>
}`,...I.parameters?.docs?.source}}};j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
  name: 'Auto-detect Current',
  render: () => <Breadcrumbs>
      <BreadcrumbItem href="/">Home</BreadcrumbItem>
      <BreadcrumbItem href="/projects">Projects</BreadcrumbItem>
      <BreadcrumbItem>Auto Current</BreadcrumbItem>
    </Breadcrumbs>
}`,...j.parameters?.docs?.source}}};v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  render: () => <Breadcrumbs separator={'›'}>
      <BreadcrumbItem href="/">Home</BreadcrumbItem>
      <BreadcrumbItem href="/docs">Docs</BreadcrumbItem>
      <BreadcrumbItem isCurrent>API Reference</BreadcrumbItem>
    </Breadcrumbs>
}`,...v.parameters?.docs?.source}}};C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  render: () => <Breadcrumbs>
      <BreadcrumbItem href="/" startIcon={<HomeIcon width={16} height={16} aria-hidden="true" />}>
        Home
      </BreadcrumbItem>
      <BreadcrumbItem href="/settings" startIcon={<Cog6ToothIcon width={16} height={16} aria-hidden="true" />}>
        Settings
      </BreadcrumbItem>
      <BreadcrumbItem isCurrent>Profile</BreadcrumbItem>
    </Breadcrumbs>
}`,...C.parameters?.docs?.source}}};w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
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
}`,...w.parameters?.docs?.source}}};S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
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
}`,...S.parameters?.docs?.source}}};z.parameters={...z.parameters,docs:{...z.parameters?.docs,source:{originalSource:`{
  name: 'Supporting Variant',
  render: () => <Breadcrumbs variant="supporting">
      <BreadcrumbItem href="/">Home</BreadcrumbItem>
      <BreadcrumbItem href="/projects">Projects</BreadcrumbItem>
      <BreadcrumbItem isCurrent>My Project</BreadcrumbItem>
    </Breadcrumbs>
}`,...z.parameters?.docs?.source}}};k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
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
}`,...k.parameters?.docs?.source}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
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
the hierarchy.`,...i.parameters?.docs?.description}}};const te=["Default","TwoLevels","AutoDetectCurrent","CustomSeparator","WithIcons","WithOnClick","DeepHierarchy","SupportingVariant","SupportingWithIcons","CurrentOnMiddleItem"];export{j as AutoDetectCurrent,i as CurrentOnMiddleItem,v as CustomSeparator,S as DeepHierarchy,B as Default,z as SupportingVariant,k as SupportingWithIcons,I as TwoLevels,C as WithIcons,w as WithOnClick,te as __namedExportsOrder,re as default};
