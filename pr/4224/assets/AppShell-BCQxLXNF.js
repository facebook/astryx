import{a as e,n as t}from"./rolldown-runtime-DaJ6WEGw.js";import{t as n}from"./react-DvlgmmzG.js";import{l as r,n as i,t as a,u as o}from"./themeProps-DlHa58hS.js";import{i as s,n as c,r as ee,t as te}from"./LayoutContent-lQi8c66T.js";import{n as l,t as u}from"./LayoutHeader-BJVK-iiV.js";import{_ as ne,d,t as f,y as p}from"./utils-SBEvDdeo.js";import{a as re,i as m}from"./useTheme-CQdBTfQJ.js";import{b as ie,v as h,y as ae}from"./Text-Bs-khaxO.js";import{t as g}from"./jsx-runtime-cM__dR4X.js";import{n as _,t as oe}from"./LayoutPanel-BaNLkBGf.js";import{c as v,s as se}from"./navItemStyles.stylex-DdUP0lHl.js";import{r as ce,t as y}from"./i18n-BRp86Ovh.js";import{_ as b,b as le,g as x,v as S,x as C,y as w}from"./TopNav-DrDa5-GJ.js";import{d as T,u as E}from"./SideNav-E_Q5rTeO.js";function D({variant:e=`elevated`,banner:t,children:n,contentPadding:r,"data-testid":a,height:s=`fill`,mobileNav:c,sideNav:l,topNav:f,xstyle:m,className:h,style:g,ref:_,...v}){let y=ce(),b=c===!1,C=c!=null&&c!==!1&&typeof c==`object`&&!(0,k.isValidElement)(c)?c:null,w=C?.breakpoint??`md`,T=c!=null&&c!==!1&&((0,k.isValidElement)(c)||typeof c==`string`)?c:null,D=C?.content??null,O=C?.hasToggle!==!1,F=C?.isOpen!==void 0,I=re(w===`none`?`(max-width: 0px)`:`(max-width: ${M[w]}px)`,C?.defaultIsMobile),[ue,de]=(0,k.useState)(!1),L=C?.isOpen??ue,R=(0,k.useCallback)(e=>{F||de(e),C?.onOpenChange?.(e)},[F,C]),z=s===`fill`,B=s===`auto`,V=d(t),H=d(f),U=d(l),W=!b&&(H||U)&&T==null,G=e===`section`,fe=e===`elevated`,K=e===`wash`||e===`elevated`?P.navAreaWash:e===`surface`?P.navAreaSurface:void 0,pe=e===`wash`?P.contentBgWash:e===`elevated`&&H&&U&&!I?P.contentBgTransparent:e===`surface`||e===`elevated`?P.contentBgSurface:void 0,me=K??P.navAreaSurface,q=(0,k.useRef)(null),J=(0,k.useRef)(null);(0,k.useEffect)(()=>{if(!B||!q.current||!J.current)return;let e=q.current,t=J.current,n=()=>{let n=e.getBoundingClientRect().height;t.style.setProperty(`--appshell-header-height`,`${n}px`)};return ae(e,()=>n()),()=>ie(e)},[B]);let Y=U&&!I,he=T!=null,ge=W&&D!=null&&I,X=(0,k.useId)(),_e=(0,k.useMemo)(()=>({isMobile:I,isMobileNavOpen:L,mobileNavId:X,toggleMobileNav:()=>W&&R(!L),openMobileNav:()=>W&&R(!0),closeMobileNav:()=>R(!1),isMobileNavEnabled:W,hasAutoToggle:O}),[I,L,X,R,W,O]),ve=U&&O?(0,A.jsx)(E,{value:`drawer-content`,children:l}):null,ye=U?(0,A.jsx)(E,{value:`drawer-content`,children:l}):null,be=H?I&&!b&&T==null?(0,A.jsx)(x,{value:ve,children:(0,A.jsx)(S,{value:`mobile-bar`,children:f})}):f:null,Z=H||V?(0,A.jsxs)(u,{padding:0,hasDivider:G&&H,children:[V&&(0,A.jsx)(`div`,{...o(P.banner,K),children:t}),H&&be]}):void 0,xe=Z==null?void 0:(0,A.jsx)(`div`,{ref:q,...p(i(`app-shell-header`,{variant:e}),o(K,B&&P.headerSticky)),children:Z}),Q=Y?(0,A.jsx)(oe,{padding:0,hasDivider:G,isScrollable:z,...i(`app-shell-sidenav`,{variant:e}),xstyle:[K,B&&me,B&&P.panelAutoFill],children:l}):void 0,Se=Q!=null&&B?(0,A.jsx)(`div`,{className:`astryx2lah0s astryx7giv3 astryx7wzq59 astryxepuwc7 astryx16zugyo astryx78zum5 astryxdt5ytf`,children:Q}):Q,Ce=fe&&H&&Y,$=(0,A.jsx)(te,{padding:r??0,role:`main`,id:N,isScrollable:z,xstyle:pe,children:n}),we=Ce?(0,A.jsxs)(`div`,{className:`astryx1n2onr6 astryx78zum5 astryx98rzlu astryx2lwn1j astryx5yr21d`,children:[(0,A.jsx)(`div`,{className:`astryx10l6tqk astryx10a8y8t astryx10xzikg astryx183tx6i astryx47corl`}),$]}):$,Te=!b&&O&&I&&!H&&U?(0,A.jsx)(`div`,{...p(i(`app-shell-header`,{variant:e}),o(K,B&&P.headerSticky)),children:(0,A.jsx)(u,{padding:0,hasDivider:G,children:(0,A.jsxs)(`div`,{className:`astryx78zum5 astryx6s0dn4 astryx1k15mir astryxf314gf`,role:`navigation`,"aria-label":y(`@astryx.appShell.mobileNavigation`),children:[(0,A.jsx)(E,{value:`topbar`,children:l}),(0,A.jsx)(le,{})]})})}):void 0;return(0,A.jsx)(se,{value:_e,children:(0,A.jsxs)(`div`,{...v,ref:ne(_,J),"data-testid":a,...p(i(`app-shell`,{variant:e}),o(P.root,e===`wash`?P.variantWash:e===`surface`?P.variantSurface:e===`section`?P.variantSection:P.variantElevated,z?P.rootFill:P.rootAuto,m),h,g),children:[(0,A.jsx)(`a`,{href:`#${N}`,className:`astryx10l6tqk astryx1xrnuwo astryx1i1rx1s astryx1jqxupm astryxjm9jq1 astryx15cytp8 astryxt970qd astryxh2mrf5 astryxnjsko4 astryx1cf3d6k astryxkdpibf astryx1y5lnwp astryxb3r6kr astryxomzh7y astryx1hyvwdk astryx1rsz1da astryxuxw1ft astryx1hbpcn8 astryxc342km astryx13vifvy astryx1rw3289 astryx1o0tod astryxodanix astryx10xzikg astryxjse4m1 astryx1q2oy4v astryx1hl2dhg astryx2mo6ok astryxjm74w1`,"data-testid":`skip-to-content`,children:`Skip to content`}),(0,A.jsx)(ee,{height:s,padding:0,header:(0,A.jsxs)(A.Fragment,{children:[xe,Te]}),start:Se,content:we}),he&&T,ge&&D,I&&!b&&T==null&&!D&&(0,A.jsxs)(j,{mode:L?`visible`:`hidden`,children:[U&&!H&&(0,A.jsx)(E,{value:`drawer`,children:l}),H&&(0,A.jsx)(x,{value:ye,children:(0,A.jsx)(S,{value:`drawer`,children:f})})]})]})})}var O,k,A,j,M,N,P,F=t((()=>{O=e(n(),1),k=e(n(),1),r(),s(),l(),_(),c(),C(),T(),w(),b(),v(),f(),m(),h(),a(),y(),A=g(),j=O.Activity===void 0?({children:e})=>(0,A.jsx)(A.Fragment,{children:e}):({mode:e,children:t})=>(0,A.jsx)(O.Activity,{mode:e,children:t}),M={sm:640,md:768,lg:1024,none:0},N=`astryx-app-shell-main`,P={root:{k1xSpc:`astryx78zum5`,kXwgrk:`astryxdt5ytf`,kVAEAm:`astryx1n2onr6`,$$css:!0},variantWash:{kWkggS:`astryx1eiddq6`,$$css:!0},variantSurface:{kWkggS:`astryx10xzikg`,$$css:!0},variantSection:{kWkggS:`astryx10xzikg`,$$css:!0},variantElevated:{kWkggS:`astryx1eiddq6`,$$css:!0},rootFill:{kZKoxP:`astryxtdtrs8`,$$css:!0},rootAuto:{kAzted:`astryx1ov3xa9`,$$css:!0},contentBgSurface:{kWkggS:`astryx10xzikg`,$$css:!0},contentBgWash:{kWkggS:`astryx1eiddq6`,$$css:!0},contentBgTransparent:{kWkggS:`astryxjbqb8w`,kHBbk8:`astryxc8icb0`,$$css:!0},navAreaWash:{kWkggS:`astryx1eiddq6`,$$css:!0},navAreaSurface:{kWkggS:`astryx10xzikg`,$$css:!0},banner:{kmuXW:`astryx2lah0s`,$$css:!0},headerSticky:{kVAEAm:`astryx7wzq59`,k87sOh:`astryx13vifvy`,kY2c9j:`astryx1vjfegm`,$$css:!0},panelAutoFill:{kUk6DE:`astryx98rzlu`,kzQI83:null,kmuXW:null,kCS8Yb:null,kVQacm:`astryxysyzu8`,kXHlph:null,kORKVm:null,$$css:!0}},D.displayName=`AppShell`,D.__docgenInfo={description:`Application-level layout shell. Provides the structural frame for an app:
top navigation, side navigation, and main content area.

Slot-based API with \`topNav\`, \`sideNav\`, \`banner\`, and \`children\`.
Supports two height modes (\`fill\` and \`auto\`), responsive side nav
collapse, and mobile overlay with backdrop.

@example
\`\`\`
<AppShell
  topNav={<TopNav label="Navigation" heading={<TopNavHeading heading="My App" />} />}
  sideNav={<SideNav>{navSections}</SideNav>}
  mobileNav={
    <MobileNav isOpen={mobileOpen} onOpenChange={(open) => setMobileOpen(open)} title="My App">
      {navSections}
    </MobileNav>
  }>
  <Content />
</AppShell>
\`\`\``,methods:[],displayName:`AppShell`,props:{xstyle:{required:!1,tsType:{name:`StyleXStyles`},description:"StyleX styles created via `stylex.create()`. Merged with the component's\nbase styles inside a single `stylex.props()` call for optimal deduplication.\n\n@example\n```\nconst overrides = stylex.create({ root: { marginBottom: 8 } });\n<Component xstyle={overrides.root} />\n```"},ref:{required:!1,tsType:{name:`ReactRef`,raw:`React.Ref<HTMLDivElement>`,elements:[{name:`HTMLDivElement`}]},description:`Ref forwarded to the root element`},variant:{required:!1,tsType:{name:`AppShellVariantMap`},description:"Navigation background style controlling how nav areas contrast with content.\n- `wash`: Nav uses wash background, no dividers\n- `surface`: Nav uses surface background, no dividers\n- `section`: Dividers between nav and content (classic look)\n- `elevated`: Wash nav with elevated surface content area + border radius\n@default 'elevated'",defaultValue:{value:`'elevated'`,computed:!1}},banner:{required:!1,tsType:{name:`ReactNode`},description:`Optional banner slot for system-wide announcements.
Renders above the top nav and scrolls away with the page in auto mode.`},children:{required:!0,tsType:{name:`ReactNode`},description:"Main content area (rendered as `<main>`)."},contentPadding:{required:!1,tsType:{name:`union`,raw:`0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10`,elements:[{name:`literal`,value:`0`},{name:`literal`,value:`0.5`},{name:`literal`,value:`1`},{name:`literal`,value:`1.5`},{name:`literal`,value:`2`},{name:`literal`,value:`3`},{name:`literal`,value:`4`},{name:`literal`,value:`5`},{name:`literal`,value:`6`},{name:`literal`,value:`8`},{name:`literal`,value:`10`}]},description:"Padding for the main content area using the spacing scale.\nSet based on the dominant content pattern for the page:\n- `4` (16px) — standard padding for forms, settings, text-heavy pages\n- `0` — no padding, for dashboards, maps, tables that need edge-to-edge\nOverride individual sections with `<Section padding={...}>`.\nAccepts numeric spacing steps: 0, 0.5, 1, 1.5, 2, 3, 4, 5, 6, 8, 10."},height:{required:!1,tsType:{name:`union`,raw:`'fill' | 'auto'`,elements:[{name:`literal`,value:`'fill'`},{name:`literal`,value:`'auto'`}]},description:"Height behavior:\n- `fill`: Shell fills viewport, content scrolls internally (default)\n- `auto`: Shell grows with content, page scrolls as a whole\n@default 'fill'",defaultValue:{value:`'fill'`,computed:!1}},mobileNav:{required:!1,tsType:{name:`union`,raw:`false | MobileNavConfig | ReactNode`,elements:[{name:`literal`,value:`false`},{name:`MobileNavConfig`},{name:`ReactNode`}]},description:`Mobile navigation configuration.

Accepts three shapes:
- **\`false\`** — Disable mobile nav entirely.
- **\`MobileNavConfig\` object** — Configure auto behavior (toggle, controlled state, custom content).
- **\`ReactNode\`** — Full escape hatch: provide your own \`<MobileNav>\` (you own everything).

When omitted, AppShell automatically generates a mobile drawer with
sideNav content (and TopNav items in the future) below the breakpoint.

@example
\`\`\`
<AppShell topNav={...} sideNav={...} />
<AppShell mobileNav={{ isOpen, onOpenChange }} />
<AppShell mobileNav={{ hasToggle: false }}>
  <MobileNavToggle />
</AppShell>
<AppShell mobileNav={<MobileNav title="Menu">...</MobileNav>} />
<AppShell mobileNav={false} />
\`\`\``},sideNav:{required:!1,tsType:{name:`ReactNode`},description:`Side navigation — typically an SideNav.

Pass \`undefined\` (or omit) when a page has no side navigation.
Do NOT pass a component that renders \`null\` — AppShell treats any
renderable value as "sidenav exists".

**Next.js parallel routes:** Conditionally pass the slot based on
the current route rather than relying on a \`default.tsx\` that
returns \`null\`:

@example
\`\`\`
const SIDEBAR_ROUTES = ['/dashboard', '/settings'];
function Layout({ children, sidebar }) {
  const hasSidebar = SIDEBAR_ROUTES.some(r => pathname.startsWith(r));
  return (
    <AppShell
      sideNav={hasSidebar ? sidebar : undefined}
      mobileNav={hasSidebar ? { breakpoint: 'md' } : false}>
      {children}
    </AppShell>
  );
}
\`\`\``},topNav:{required:!1,tsType:{name:`ReactNode`},description:"Top navigation — typically an TopNav.\nSame contract as `sideNav` — pass `undefined` when there's no top nav."}},composes:[`Omit`]}})),I=t((()=>{F()}));export{D as n,F as r,I as t};