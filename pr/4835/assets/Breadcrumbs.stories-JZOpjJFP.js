import{a as e,n as t}from"./rolldown-runtime-DkW27tQK.js";import{t as n}from"./react-BZJXY1be.js";import{n as r,t as i}from"./stylex-Dft6gtPK.js";import{n as a}from"./mergeProps-JRyAvMxc.js";import{n as o}from"./mergeRefs-CPqjs56a.js";import{n as s,t as c}from"./themeProps-CREkzZh6.js";import{t as l}from"./jsx-runtime-DeHZSEgm.js";import{n as u,t as d}from"./layerAnimations.stylex-18OH5AHk.js";import{n as f,t as p}from"./useLinkComponent-DvgS1IvL.js";import{n as m,t as h}from"./useTranslator-BMnme3me.js";import{n as g,t as _}from"./useIcon-Dlr4L4I4.js";import{n as v,t as y}from"./useListFocus-C3PMl9Zf.js";import{n as ee,t as b}from"./usePopover-DPO-mU50.js";import{n as x,t as S}from"./useTypeahead-kmZe0nBq.js";import{a as C,d as w,l as T,n as E,o as D,t as te}from"./renderDropdownItems-BttNFrw6.js";import{i as O,n as ne,r as re,t as ie}from"./menuItemRoles-CfMdmT_-.js";import{n as k,t as ae}from"./Cog6ToothIcon-LKkqufPn.js";import{n as oe,t as se}from"./FolderIcon-BgIzlbYN.js";import{n as ce,t as A}from"./HomeIcon-QfiwBcAz.js";function j({children:e,separator:t=`/`,variant:n=`default`,xstyle:i,className:o,style:c,label:l,ref:u,...d}){let f=m(),p=l??f(`@astryx.breadcrumbs.label`),h=(0,M.useMemo)(()=>({variant:n,separator:t}),[n,t]);return(0,N.jsx)(P,{value:h,children:(0,N.jsx)(`nav`,{ref:u,"aria-label":p,...a(s(`breadcrumbs`,{variant:n}),r(le.root,i),o,c),...d,children:(0,N.jsx)(`ol`,{className:`astryx78zum5 astryx6s0dn4 astryx1a02dak astryxe8uvvx astryx1ghz6dp astryx1717udv astryxzye2dw`,children:e})})})}var M,N,P,le;function F(){return(F=t((()=>{M=n(),i(),c(),h(),N=l(),P=(0,M.createContext)({variant:`default`,separator:`/`}),P.displayName=`BreadcrumbContext`,le={root:{k1xSpc:`astryx1lliihq`,$$css:!0}},j.displayName=`Breadcrumbs`,j.__docgenInfo={description:`A navigation breadcrumb trail. Wraps BreadcrumbItem children in
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
\`\`\``,methods:[],displayName:`Breadcrumbs`,props:{xstyle:{required:!1,tsType:{name:`StyleXStyles`},description:"StyleX styles created via `stylex.create()`. Merged with the component's\nbase styles inside a single `stylex.props()` call for optimal deduplication.\n\n@example\n```\nconst overrides = stylex.create({ root: { marginBottom: 8 } });\n<Component xstyle={overrides.root} />\n```"},ref:{required:!1,tsType:{name:`ReactRef`,raw:`React.Ref<HTMLElement>`,elements:[{name:`HTMLElement`}]},description:`Ref forwarded to the root element`},children:{required:!0,tsType:{name:`ReactNode`},description:`BreadcrumbItem elements to render as breadcrumb trail.`},separator:{required:!1,tsType:{name:`ReactNode`},description:`Separator rendered between items. Decorative only (aria-hidden).
@default '/'`,defaultValue:{value:`'/'`,computed:!1}},variant:{required:!1,tsType:{name:`BreadcrumbsVariantMap`},description:"Visual variant for the breadcrumb trail.\n- `'default'`: Standard text styling\n- `'supporting'`: Smaller, secondary text for supporting context\n@default 'default'",defaultValue:{value:`'default'`,computed:!1}},label:{required:!1,tsType:{name:`string`},description:`Accessible label for the nav landmark.
@default 'Breadcrumb'`}},composes:[`Omit`]}})))()}function I({ref:e,as:t,children:n,href:i,onClick:c,isCurrent:l,startIcon:u,menu:d,menuSize:p,xstyle:m,className:h,style:g,"data-testid":_,...v}){let y=(0,R.use)(P),ee=f(t),b=y.variant===`supporting`,x=(0,R.useRef)(null),S=(0,R.useRef)(null),C=l===!0,w=l==null,T=d!=null,E=p??(b?`sm`:`md`);(0,R.useEffect)(()=>{},[T,i,c]),(0,R.useEffect)(()=>{if(!w)return;let e=x.current;if(!e)return;let t=e.parentElement;if(!t)return;let n=Array.from(t.children),r=n.length>0&&n[n.length-1]===e,i=t.querySelector(`[aria-current="page"]`);if(r&&!i){let t=S.current??e;return t.setAttribute(`aria-current`,`page`),()=>{t.removeAttribute(`aria-current`)}}});let D=(0,z.jsxs)(z.Fragment,{children:[u&&(0,z.jsx)(`span`,{className:`astryx78zum5 astryx6s0dn4 astryx2lah0s`,children:u}),n]});return C?(0,z.jsxs)(`li`,{ref:o(e,x),...a(s(`breadcrumb-item`),r(B.root,b?B.supportingSize:B.defaultSize,m),h,g),"data-testid":_,...v,children:[(0,z.jsx)(`span`,{"aria-hidden":`true`,className:`astryx11ke7fs astryx6s0dn4 astryxv1l7n4 astryxu0wf1k astryx87ps6o`,children:y.separator}),T?(0,z.jsx)(L,{ref:S,menu:d,menuSize:E,isSupporting:b,isCurrent:!0,label:n,children:D}):(0,z.jsx)(`span`,{...{0:{className:`astryx78zum5 astryx6s0dn4 astryxzye2dw astryx1pd3egz astryx1tgivj0`},1:{className:`astryx78zum5 astryx6s0dn4 astryxzye2dw astryx1pd3egz astryxv1l7n4`}}[!!b<<0],"aria-current":`page`,children:D})]}):(0,z.jsxs)(`li`,{ref:o(e,x),...a(s(`breadcrumb-item`),r(B.root,b?B.supportingSize:B.defaultSize,m),h,g),"data-testid":_,...v,children:[(0,z.jsx)(`span`,{"aria-hidden":`true`,className:`astryx11ke7fs astryx6s0dn4 astryxv1l7n4 astryxu0wf1k astryx87ps6o`,children:y.separator}),T?(0,z.jsx)(L,{ref:S,menu:d,menuSize:E,isSupporting:b,label:n,children:D}):i==null?c==null?(0,z.jsx)(`span`,{ref:S,...{0:{className:`astryx78zum5 astryx6s0dn4 astryxzye2dw astryx1pd3egz astryx1tgivj0`},1:{className:`astryx78zum5 astryx6s0dn4 astryxzye2dw astryx1pd3egz astryxv1l7n4`}}[!!b<<0],children:D}):(0,z.jsx)(`button`,{ref:S,type:`button`,onClick:c,...{0:{className:`astryx78zum5 astryx6s0dn4 astryxzye2dw astryx1hl2dhg astryx4ohgrr astryx1ypdohk astryx11g6tue astryx1gs6z28 astryx1717udv astryx1ghz6dp astryxln7xf2 astryxv1l7n4`},1:{className:`astryx78zum5 astryx6s0dn4 astryxzye2dw astryx1hl2dhg astryx4ohgrr astryx1ypdohk astryx11g6tue astryx1gs6z28 astryx1717udv astryx1ghz6dp astryxln7xf2 astryxv1l7n4`}}[!!b<<0],children:D}):(0,z.jsx)(ee,{ref:S,href:i,onClick:c,...{0:{className:`astryx78zum5 astryx6s0dn4 astryxzye2dw astryxu0wf1k astryx1hl2dhg astryx4ohgrr astryx1ypdohk astryxv1l7n4`},1:{className:`astryx78zum5 astryx6s0dn4 astryxzye2dw astryxu0wf1k astryx1hl2dhg astryx4ohgrr astryx1ypdohk astryxv1l7n4`}}[!!b<<0],children:D})]})}function L({ref:e,children:t,label:n,menu:r,menuSize:i,isSupporting:c,isCurrent:l=!1}){let d=(0,R.useId)(),f=(0,R.useRef)(null),p=ee({onHide:(0,R.useCallback)(()=>{f.current?.focus()},[]),hasLightDismiss:!0,hasCloseButton:!1,hasAutoFocus:!1,role:`none`}),m=g(`chevronDown`),h=(0,R.useCallback)(()=>{p.hide()},[p]),{listRef:_,handleKeyDown:y,focusFirst:b,focusItem:S,ownsEvent:C,getItems:w}=v({itemSelector:re,boundarySelector:ie,wrap:!1,onEscape:h}),D=x({getItemLabels:()=>w().map(e=>e.textContent),onMatch:S,getCurrentIndex:()=>w().findIndex(e=>e===document.activeElement||e.contains(document.activeElement))}),te=(0,R.useCallback)(e=>{if(C(e)){if(e.key===`Enter`||e.key===` `){e.preventDefault();let t=document.activeElement;t&&ne.has(t.getAttribute(`role`)??``)&&t.click();return}if(e.key===`Tab`){h();return}if(D.onKeyDown(e)){e.preventDefault();return}y(e)}},[y,h,D,C]),O=(0,R.useCallback)(()=>{p.show(),requestAnimationFrame(()=>b())},[p,b]),k=(0,R.useCallback)(()=>{p.isOpen?p.hide():O()},[p,O]),ae=(0,R.useCallback)(e=>{p.isOpen||(e.key===`ArrowDown`||e.key===`Enter`||e.key===` `)&&(e.preventDefault(),O())},[p.isOpen,O]),oe=(0,R.useMemo)(()=>({closeMenu:h,menuSize:i}),[h,i]),se=Array.isArray(r)?E(r):r;return(0,z.jsxs)(z.Fragment,{children:[(0,z.jsxs)(`button`,{ref:o(e,f,p.triggerRef),type:`button`,onClick:k,onKeyDown:ae,...a(s(`breadcrumb-item-menu-trigger`),{...p.triggerProps,"aria-haspopup":`menu`,"aria-controls":d,"aria-current":l?`page`:void 0}),...{0:{className:`astryx78zum5 astryx6s0dn4 astryxzye2dw astryx1hl2dhg astryx4ohgrr astryx1ypdohk astryx11g6tue astryx1gs6z28 astryx1717udv astryx1ghz6dp astryxln7xf2 astryxv1l7n4`},1:{className:`astryx78zum5 astryx6s0dn4 astryxzye2dw astryx1hl2dhg astryx4ohgrr astryx1ypdohk astryx11g6tue astryx1gs6z28 astryx1717udv astryx1ghz6dp astryxln7xf2 astryxv1l7n4`}}[!!c<<0],children:[t,(0,z.jsx)(`span`,{"aria-hidden":`true`,className:`astryx78zum5 astryx6s0dn4 astryx2lah0s astryx141an7d`,children:m})]}),p.render((0,z.jsx)(`div`,{ref:_,id:d,role:`menu`,"aria-label":typeof n==`string`?n:void 0,onKeyDown:te,...a(s(`breadcrumb-menu`),{className:`astryx9f619 astryx78zum5 astryxdt5ytf astryx1lsbc85 astryxuyqlj2 astryx1odjw0f astryx1fcsqxe astryxgory14 astryx9epnlk astryx1n97fys astryx87ps6o`}),children:(0,z.jsx)(T,{value:oe,children:se})}),{placement:`below`,alignment:`start`,xstyle:[ue.popover,u.below]})]})}var R,z,B,ue;function de(){return(de=t((()=>{R=e(n(),1),i(),F(),p(),c(),_(),b(),y(),S(),d(),te(),w(),O(),z=l(),B={root:{k1xSpc:`astryx78zum5`,kGNEyG:`astryx6s0dn4`,kOIVth:`astryxzye2dw`,kogj98:`astryx1ghz6dp`,"--separator-display":`astryxkce8z9 astryx1ibt0lz`,$$css:!0},defaultSize:{kGuDYH:`astryxjm74w1`,kLWn49:`astryxw6l6zx`,$$css:!0},supportingSize:{kGuDYH:`astryx141an7d`,kLWn49:`astryx1ltkj2j`,$$css:!0}},ue={popover:{k7Eaqz:`astryx5w4yej`,kqGvvJ:`astryxsq74q5`,keoZOQ:null,k1K539:null,$$css:!0}},I.displayName=`BreadcrumbItem`,L.displayName=`BreadcrumbMenuTrigger`,I.__docgenInfo={description:`An individual breadcrumb item. Renders as a link (\`<a>\`) or a span
depending on whether it represents the current page.

Each item renders its own leading separator, hidden on :first-child via
CSS. Auto-current detection uses a post-render effect that checks the
DOM — no React child introspection.

@example
\`\`\`
<BreadcrumbItem href="/projects">Projects</BreadcrumbItem>
<BreadcrumbItem isCurrent>My Project</BreadcrumbItem>
\`\`\``,methods:[],displayName:`BreadcrumbItem`,props:{ref:{required:!1,tsType:{name:`ReactRef`,raw:`React.Ref<HTMLLIElement>`,elements:[{name:`HTMLLIElement`}]},description:``},as:{required:!1,tsType:{name:`ElementType`},description:`Custom component to render instead of \`<a>\` for breadcrumb links.
Overrides the provider-level default set by LinkProvider.
Only applies for non-current items. Must accept href, className, style, and children props.`},children:{required:!0,tsType:{name:`ReactNode`},description:`Label content of the breadcrumb item.`},href:{required:!1,tsType:{name:`string`},description:`URL for the breadcrumb link. Omit for the current page.`},onClick:{required:!1,tsType:{name:`signature`,type:`function`,raw:`(e: MouseEvent<HTMLElement>) => void`,signature:{arguments:[{type:{name:`MouseEvent`,elements:[{name:`HTMLElement`}],raw:`MouseEvent<HTMLElement>`},name:`e`}],return:{name:`void`}}},description:`Click handler. Works with or without href.`},isCurrent:{required:!1,tsType:{name:`boolean`},description:`Marks this item as the current page. Renders as a span with aria-current="page".
If not set on any item, the last item is auto-detected as current.
@default false`},startIcon:{required:!1,tsType:{name:`ReactNode`},description:`Optional icon rendered before the label.`},menu:{required:!1,tsType:{name:`union`,raw:`DropdownMenuOption[] | ReactNode`,elements:[{name:`Array`,elements:[{name:`union`,raw:`DropdownMenuItemData | DropdownMenuDivider | DropdownMenuSection`,elements:[{name:`DropdownMenuItemData`},{name:`DropdownMenuDivider`},{name:`DropdownMenuSection`}]}],raw:`DropdownMenuOption[]`},{name:`ReactNode`}]},description:'Menu opened when the item is activated. Accepts the SAME item API as\nDropdownMenu / MoreMenu / ContextMenu, so a consumer\'s existing menu-item\ndefinitions are portable into a breadcrumb with no rewrite:\n- a `DropdownMenuOption[]` data array (items, sections, dividers), or\n- composed `DropdownMenuItem` / `DropdownMenuCheckboxItem` /\n  `DropdownMenuRadioGroup` children.\n\nWhen set, the item renders as a link-styled menu trigger (button + a\ntrailing chevron, `aria-haspopup="menu"` / `aria-expanded`) whose popover\nis a `role="menu"` container that provides `DropdownMenuContext` and runs\n`useListFocus`. Takes precedence over `href` / `onClick` (which are\nignored when `menu` is set — a dev-time warning is logged).'},menuSize:{required:!1,tsType:{name:`union`,raw:`'sm' | 'md' | 'lg'`,elements:[{name:`literal`,value:`'sm'`},{name:`literal`,value:`'md'`},{name:`literal`,value:`'lg'`}]},description:"Size passed to the menu items via `DropdownMenuContext` (item\npadding/typography). Defaults from the breadcrumb variant:\n`'supporting'` → `'sm'`, otherwise `'md'`."}},composes:[`Omit`]}})))()}var V,fe,H,U,W,G,K,q,J,Y,X,Z,pe,Q,$,me;function he(){return(he=t((()=>{F(),de(),D(),ce(),k(),oe(),V=l(),fe={title:`Core/Breadcrumbs`,component:j,tags:[`autodocs`],argTypes:{separator:{control:`text`,description:`Separator between items`},label:{control:`text`,description:`Accessible label for the nav landmark`},variant:{control:`select`,options:[`default`,`supporting`],description:`Visual variant controlling text size and color`}}},H={render:()=>(0,V.jsxs)(j,{children:[(0,V.jsx)(I,{href:`/`,children:`Home`}),(0,V.jsx)(I,{href:`/projects`,children:`Projects`}),(0,V.jsx)(I,{isCurrent:!0,children:`My Project`})]})},U={render:()=>(0,V.jsxs)(j,{children:[(0,V.jsx)(I,{href:`/`,children:`Home`}),(0,V.jsx)(I,{isCurrent:!0,children:`Settings`})]})},W={name:`Auto-detect Current`,render:()=>(0,V.jsxs)(j,{children:[(0,V.jsx)(I,{href:`/`,children:`Home`}),(0,V.jsx)(I,{href:`/projects`,children:`Projects`}),(0,V.jsx)(I,{children:`Auto Current`})]})},G={render:()=>(0,V.jsxs)(j,{separator:`›`,children:[(0,V.jsx)(I,{href:`/`,children:`Home`}),(0,V.jsx)(I,{href:`/docs`,children:`Docs`}),(0,V.jsx)(I,{isCurrent:!0,children:`API Reference`})]})},K={render:()=>(0,V.jsxs)(j,{children:[(0,V.jsx)(I,{href:`/`,startIcon:(0,V.jsx)(A,{width:16,height:16,"aria-hidden":`true`}),children:`Home`}),(0,V.jsx)(I,{href:`/settings`,startIcon:(0,V.jsx)(ae,{width:16,height:16,"aria-hidden":`true`}),children:`Settings`}),(0,V.jsx)(I,{isCurrent:!0,children:`Profile`})]})},q={render:()=>(0,V.jsxs)(j,{children:[(0,V.jsx)(I,{href:`/`,onClick:e=>{e.preventDefault(),console.log(`Navigate to Home`)},children:`Home`}),(0,V.jsx)(I,{href:`/projects`,onClick:e=>{e.preventDefault(),console.log(`Navigate to Projects`)},children:`Projects`}),(0,V.jsx)(I,{isCurrent:!0,children:`Detail`})]})},J={render:()=>(0,V.jsxs)(j,{children:[(0,V.jsx)(I,{href:`/`,children:`Home`}),(0,V.jsx)(I,{href:`/products`,children:`Products`}),(0,V.jsx)(I,{href:`/products/electronics`,children:`Electronics`}),(0,V.jsx)(I,{href:`/products/electronics/phones`,children:`Phones`}),(0,V.jsx)(I,{isCurrent:!0,children:`iPhone 15 Pro`})]})},Y={name:`Supporting Variant`,render:()=>(0,V.jsxs)(j,{variant:`supporting`,children:[(0,V.jsx)(I,{href:`/`,children:`Home`}),(0,V.jsx)(I,{href:`/projects`,children:`Projects`}),(0,V.jsx)(I,{isCurrent:!0,children:`My Project`})]})},X={name:`Supporting Variant with Icons`,render:()=>(0,V.jsxs)(j,{variant:`supporting`,children:[(0,V.jsx)(I,{href:`/`,startIcon:(0,V.jsx)(A,{width:14,height:14,"aria-hidden":`true`}),children:`Home`}),(0,V.jsx)(I,{href:`/projects`,startIcon:(0,V.jsx)(se,{width:14,height:14,"aria-hidden":`true`}),children:`Projects`}),(0,V.jsx)(I,{isCurrent:!0,children:`My Project`})]})},Z={name:`Current on Middle Item`,render:()=>(0,V.jsxs)(j,{children:[(0,V.jsx)(I,{href:`/`,children:`Home`}),(0,V.jsx)(I,{isCurrent:!0,children:`Projects`}),(0,V.jsx)(I,{href:`/projects/my-project/settings`,children:`Settings`})]})},pe=[{label:`Design`,onClick:()=>console.log(`go /team/design`)},{label:`Engineering`,onClick:()=>console.log(`go /team/eng`)},{type:`divider`},{label:`Data`,icon:`chart`,onClick:()=>console.log(`go /team/data`)}],Q={name:`Menu Crumb (data array)`,render:()=>(0,V.jsxs)(j,{children:[(0,V.jsx)(I,{href:`/`,children:`Home`}),(0,V.jsx)(I,{menu:pe,children:`Teams`}),(0,V.jsx)(I,{isCurrent:!0,children:`Overview`})]})},$={name:`Menu Crumb (composed children)`,render:()=>(0,V.jsxs)(j,{children:[(0,V.jsx)(I,{href:`/`,children:`Home`}),(0,V.jsx)(I,{menu:(0,V.jsxs)(V.Fragment,{children:[(0,V.jsx)(C,{label:`Overview`,onClick:()=>console.log(`overview`)}),(0,V.jsx)(C,{label:`Settings`,icon:`gear`,onClick:()=>console.log(`settings`)})]}),children:`Project`}),(0,V.jsx)(I,{isCurrent:!0,children:`Details`})]})},H.parameters={...H.parameters,docs:{...H.parameters?.docs,source:{originalSource:`{
  render: () => <Breadcrumbs>
      <BreadcrumbItem href="/">Home</BreadcrumbItem>
      <BreadcrumbItem href="/projects">Projects</BreadcrumbItem>
      <BreadcrumbItem isCurrent>My Project</BreadcrumbItem>
    </Breadcrumbs>
}`,...H.parameters?.docs?.source}}},U.parameters={...U.parameters,docs:{...U.parameters?.docs,source:{originalSource:`{
  render: () => <Breadcrumbs>
      <BreadcrumbItem href="/">Home</BreadcrumbItem>
      <BreadcrumbItem isCurrent>Settings</BreadcrumbItem>
    </Breadcrumbs>
}`,...U.parameters?.docs?.source}}},W.parameters={...W.parameters,docs:{...W.parameters?.docs,source:{originalSource:`{
  name: 'Auto-detect Current',
  render: () => <Breadcrumbs>
      <BreadcrumbItem href="/">Home</BreadcrumbItem>
      <BreadcrumbItem href="/projects">Projects</BreadcrumbItem>
      <BreadcrumbItem>Auto Current</BreadcrumbItem>
    </Breadcrumbs>
}`,...W.parameters?.docs?.source}}},G.parameters={...G.parameters,docs:{...G.parameters?.docs,source:{originalSource:`{
  render: () => <Breadcrumbs separator={'›'}>
      <BreadcrumbItem href="/">Home</BreadcrumbItem>
      <BreadcrumbItem href="/docs">Docs</BreadcrumbItem>
      <BreadcrumbItem isCurrent>API Reference</BreadcrumbItem>
    </Breadcrumbs>
}`,...G.parameters?.docs?.source}}},K.parameters={...K.parameters,docs:{...K.parameters?.docs,source:{originalSource:`{
  render: () => <Breadcrumbs>
      <BreadcrumbItem href="/" startIcon={<HomeIcon width={16} height={16} aria-hidden="true" />}>
        Home
      </BreadcrumbItem>
      <BreadcrumbItem href="/settings" startIcon={<Cog6ToothIcon width={16} height={16} aria-hidden="true" />}>
        Settings
      </BreadcrumbItem>
      <BreadcrumbItem isCurrent>Profile</BreadcrumbItem>
    </Breadcrumbs>
}`,...K.parameters?.docs?.source}}},q.parameters={...q.parameters,docs:{...q.parameters?.docs,source:{originalSource:`{
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
}`,...q.parameters?.docs?.source}}},J.parameters={...J.parameters,docs:{...J.parameters?.docs,source:{originalSource:`{
  render: () => <Breadcrumbs>
      <BreadcrumbItem href="/">Home</BreadcrumbItem>
      <BreadcrumbItem href="/products">Products</BreadcrumbItem>
      <BreadcrumbItem href="/products/electronics">Electronics</BreadcrumbItem>
      <BreadcrumbItem href="/products/electronics/phones">
        Phones
      </BreadcrumbItem>
      <BreadcrumbItem isCurrent>iPhone 15 Pro</BreadcrumbItem>
    </Breadcrumbs>
}`,...J.parameters?.docs?.source}}},Y.parameters={...Y.parameters,docs:{...Y.parameters?.docs,source:{originalSource:`{
  name: 'Supporting Variant',
  render: () => <Breadcrumbs variant="supporting">
      <BreadcrumbItem href="/">Home</BreadcrumbItem>
      <BreadcrumbItem href="/projects">Projects</BreadcrumbItem>
      <BreadcrumbItem isCurrent>My Project</BreadcrumbItem>
    </Breadcrumbs>
}`,...Y.parameters?.docs?.source}}},X.parameters={...X.parameters,docs:{...X.parameters?.docs,source:{originalSource:`{
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
}`,...X.parameters?.docs?.source}}},Z.parameters={...Z.parameters,docs:{...Z.parameters?.docs,source:{originalSource:`{
  name: 'Current on Middle Item',
  render: () => <Breadcrumbs>
      <BreadcrumbItem href="/">Home</BreadcrumbItem>
      <BreadcrumbItem isCurrent>Projects</BreadcrumbItem>
      <BreadcrumbItem href="/projects/my-project/settings">
        Settings
      </BreadcrumbItem>
    </Breadcrumbs>
}`,...Z.parameters?.docs?.source},description:{story:`Shows \`isCurrent\` on a middle breadcrumb item rather than the last one.
This is useful when navigating to a child page that isn't represented
in the breadcrumb trail — the parent is still the "current" page in
the hierarchy.`,...Z.parameters?.docs?.description}}},Q.parameters={...Q.parameters,docs:{...Q.parameters?.docs,source:{originalSource:`{
  name: 'Menu Crumb (data array)',
  render: () => <Breadcrumbs>
      <BreadcrumbItem href="/">Home</BreadcrumbItem>
      <BreadcrumbItem menu={teamMenu}>Teams</BreadcrumbItem>
      <BreadcrumbItem isCurrent>Overview</BreadcrumbItem>
    </Breadcrumbs>
}`,...Q.parameters?.docs?.source},description:{story:"A mid-trail crumb can open a menu of sibling destinations. The `menu` prop\naccepts the SAME item API as `DropdownMenu` / `MoreMenu` / `ContextMenu`, so\nan existing `DropdownMenuOption[]` drops in verbatim. The crumb renders a\nlink-styled trigger with a trailing chevron; separators before and after are\nunaffected.",...Q.parameters?.docs?.description}}},$.parameters={...$.parameters,docs:{...$.parameters?.docs,source:{originalSource:`{
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
}`,...$.parameters?.docs?.source},description:{story:"The `menu` prop also accepts composed `BreadcrumbMenuItem` children (an alias\nof `DropdownMenuItem`), for dynamic or stateful menus.",...$.parameters?.docs?.description}}},me=[`Default`,`TwoLevels`,`AutoDetectCurrent`,`CustomSeparator`,`WithIcons`,`WithOnClick`,`DeepHierarchy`,`SupportingVariant`,`SupportingWithIcons`,`CurrentOnMiddleItem`,`MenuCrumb`,`MenuCrumbComposed`]})))()}he();export{W as AutoDetectCurrent,Z as CurrentOnMiddleItem,G as CustomSeparator,J as DeepHierarchy,H as Default,Q as MenuCrumb,$ as MenuCrumbComposed,Y as SupportingVariant,X as SupportingWithIcons,U as TwoLevels,K as WithIcons,q as WithOnClick,me as __namedExportsOrder,fe as default};