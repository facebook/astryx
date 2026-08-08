import{a as e,n as t}from"./rolldown-runtime-DkW27tQK.js";import{t as n}from"./react-BZJXY1be.js";import{n as r,t as i}from"./stylex-Dft6gtPK.js";import{i as a,n as o,r as ee,t as te}from"./LayoutContent-Bp6k5ngv.js";import{n as s}from"./mergeProps-JRyAvMxc.js";import{n as ne}from"./mergeRefs-CPqjs56a.js";import{n as c,t as l}from"./themeProps-CREkzZh6.js";import{b as re,x as ie,y as u}from"./Text-BfjtEFtP.js";import{n as d}from"./isRenderable-Cp8ef9AQ.js";import{t as f}from"./jsx-runtime-DeHZSEgm.js";import{n as p,t as m}from"./LayoutHeader-DrI9WNU1.js";import{n as h,t as ae}from"./LayoutPanel-CI37B9wA.js";import{n as oe,t as g}from"./useMediaQuery-CwCr2urF.js";import{n as se,t as _}from"./useTranslator-BMnme3me.js";import{n as v,t as ce}from"./AppShellMobileContext-BSIiXD93.js";import{a as y,c as b,i as x,n as S,s as le,t as C}from"./TopNavMobileContentContext-QrWiuemV.js";import{n as w,t as T}from"./SideNavRenderContext-BNrC8qiQ.js";function E({variant:e=`elevated`,banner:t,children:n,contentPadding:i,"data-testid":a,height:o=`fill`,mobileNav:l,sideNav:u,topNav:f,xstyle:p,className:h,style:g,ref:_,...v}){let y=se(),b=l===!1,S=l!=null&&l!==!1&&typeof l==`object`&&!(0,O.isValidElement)(l)?l:null,w=S?.breakpoint??`md`,E=l!=null&&l!==!1&&((0,O.isValidElement)(l)||typeof l==`string`)?l:null,D=S?.content??null,P=S?.hasToggle!==!1,F=S?.isOpen!==void 0,ue=w===`none`?`(max-width: 0px)`:`(max-width: ${j[w]}px)`,I=oe(ue,S?.defaultIsMobile),[de,fe]=(0,O.useState)(!1),L=S?.isOpen??de,R=(0,O.useCallback)(e=>{F||fe(e),S?.onOpenChange?.(e)},[F,S]),pe=(0,O.useCallback)(()=>{document.getElementById(M)?.focus()},[]),z=o===`fill`,B=o===`auto`,V=d(t),H=d(f),U=d(u),W=!b&&(H||U)&&E==null,G=e===`section`,me=e===`elevated`,K=e===`wash`||e===`elevated`?N.navAreaWash:e===`surface`?N.navAreaSurface:void 0,he=e===`wash`?N.contentBgWash:e===`elevated`&&H&&U&&!I?N.contentBgTransparent:e===`surface`||e===`elevated`?N.contentBgSurface:void 0,ge=K??N.navAreaSurface,q=(0,O.useRef)(null),J=(0,O.useRef)(null);(0,O.useEffect)(()=>{if(!B||!q.current||!J.current)return;let e=q.current,t=J.current,n=()=>{let n=e.getBoundingClientRect().height;t.style.setProperty(`--appshell-header-height`,`${n}px`)};return re(e,()=>n()),()=>ie(e)},[B]);let Y=U&&!I,_e=E!=null,ve=W&&D!=null&&I,X=(0,O.useId)(),ye=(0,O.useMemo)(()=>({isMobile:I,isMobileNavOpen:L,mobileNavId:X,toggleMobileNav:()=>W&&R(!L),openMobileNav:()=>W&&R(!0),closeMobileNav:()=>R(!1),isMobileNavEnabled:W,hasAutoToggle:P}),[I,L,X,R,W,P]),be=U&&P?(0,k.jsx)(T,{value:`drawer-content`,children:u}):null,xe=U?(0,k.jsx)(T,{value:`drawer-content`,children:u}):null,Se=H?I&&!b&&E==null?(0,k.jsx)(C,{value:be,children:(0,k.jsx)(x,{value:`mobile-bar`,children:f})}):f:null,Z=H||V?(0,k.jsxs)(m,{padding:0,hasDivider:G&&H,children:[V&&(0,k.jsx)(`div`,{...r(N.banner,K),children:t}),H&&Se]}):void 0,Ce=Z==null?void 0:(0,k.jsx)(`div`,{ref:q,role:`banner`,...s(c(`app-shell-header`,{variant:e}),r(K,B&&N.headerSticky)),children:Z}),Q=Y?(0,k.jsx)(ae,{padding:0,hasDivider:G,isScrollable:z,...c(`app-shell-sidenav`,{variant:e}),xstyle:[K,B&&ge,B&&N.panelAutoFill],children:u}):void 0,we=Q!=null&&B?(0,k.jsx)(`div`,{className:`astryx2lah0s astryx7giv3 astryx7wzq59 astryxepuwc7 astryx16zugyo astryx78zum5 astryxdt5ytf`,children:Q}):Q,Te=me&&H&&Y,$=(0,k.jsx)(te,{padding:i??0,role:`main`,id:M,tabIndex:-1,isScrollable:z,xstyle:[he,N.mainFocusTarget],children:n}),Ee=Te?(0,k.jsxs)(`div`,{className:`astryx1n2onr6 astryx78zum5 astryx98rzlu astryx2lwn1j astryx5yr21d`,children:[(0,k.jsx)(`div`,{className:`astryx10l6tqk astryx10a8y8t astryx10xzikg astryx183tx6i astryx47corl`}),$]}):$,De=!b&&P&&I&&!H&&U?(0,k.jsx)(`div`,{...s(c(`app-shell-header`,{variant:e}),r(K,B&&N.headerSticky)),children:(0,k.jsx)(m,{padding:0,hasDivider:G,children:(0,k.jsxs)(`div`,{className:`astryx78zum5 astryx6s0dn4 astryx1k15mir astryxf314gf`,role:`navigation`,"aria-label":y(`@astryx.appShell.mobileNavigation`),children:[(0,k.jsx)(T,{value:`topbar`,children:u}),(0,k.jsx)(le,{})]})})}):void 0;return(0,k.jsx)(ce,{value:ye,children:(0,k.jsxs)(`div`,{...v,ref:ne(_,J),"data-testid":a,...s(c(`app-shell`,{variant:e}),r(N.root,e===`wash`?N.variantWash:e===`surface`?N.variantSurface:e===`section`?N.variantSection:N.variantElevated,z?N.rootFill:N.rootAuto,p),h,g),children:[(0,k.jsx)(`a`,{href:`#${M}`,onClick:pe,className:`astryx10l6tqk astryx1xrnuwo astryx1i1rx1s astryx1jqxupm astryxjm9jq1 astryx15cytp8 astryxt970qd astryxh2mrf5 astryxnjsko4 astryx1cf3d6k astryxkdpibf astryx1y5lnwp astryxb3r6kr astryxomzh7y astryx1hyvwdk astryx1rsz1da astryxuxw1ft astryx1hbpcn8 astryxc342km astryx13vifvy astryx1rw3289 astryx1o0tod astryxodanix astryx10xzikg astryxjse4m1 astryx1q2oy4v astryx1hl2dhg astryx2mo6ok astryxjm74w1`,"data-testid":`skip-to-content`,children:y(`@astryx.appShell.skipToContent`)}),(0,k.jsx)(ee,{height:o,padding:0,header:(0,k.jsxs)(k.Fragment,{children:[Ce,De]}),start:we,content:Ee}),_e&&E,ve&&D,I&&!b&&E==null&&!D&&(0,k.jsxs)(A,{mode:L?`visible`:`hidden`,children:[U&&!H&&(0,k.jsx)(T,{value:`drawer`,children:u}),H&&(0,k.jsx)(C,{value:xe,children:(0,k.jsx)(x,{value:`drawer`,children:f})})]})]})})}var D,O,k,A,j,M,N;function P(){return(P=t((()=>{D=e(n(),1),O=n(),i(),a(),p(),h(),o(),b(),w(),y(),S(),v(),g(),u(),l(),_(),k=f(),A=D.Activity===void 0?({children:e})=>(0,k.jsx)(k.Fragment,{children:e}):({mode:e,children:t})=>(0,k.jsx)(D.Activity,{mode:e,children:t}),j={sm:640,md:768,lg:1024,none:0},M=`astryx-app-shell-main`,N={root:{k1xSpc:`astryx78zum5`,kXwgrk:`astryxdt5ytf`,kVAEAm:`astryx1n2onr6`,$$css:!0},variantWash:{kWkggS:`astryx1eiddq6`,$$css:!0},variantSurface:{kWkggS:`astryx10xzikg`,$$css:!0},variantSection:{kWkggS:`astryx10xzikg`,$$css:!0},variantElevated:{kWkggS:`astryx1eiddq6`,$$css:!0},rootFill:{kZKoxP:`astryxtdtrs8`,$$css:!0},rootAuto:{kAzted:`astryx1ov3xa9`,$$css:!0},mainFocusTarget:{kI3sdo:`astryx1uvtmcs`,kjBf7l:null,kInvED:null,k3XXqK:null,kMeerF:null,$$css:!0},contentBgSurface:{kWkggS:`astryx10xzikg`,$$css:!0},contentBgWash:{kWkggS:`astryx1eiddq6`,$$css:!0},contentBgTransparent:{kWkggS:`astryxjbqb8w`,kHBbk8:`astryxc8icb0`,$$css:!0},navAreaWash:{kWkggS:`astryx1eiddq6`,$$css:!0},navAreaSurface:{kWkggS:`astryx10xzikg`,$$css:!0},banner:{kmuXW:`astryx2lah0s`,$$css:!0},headerSticky:{kVAEAm:`astryx7wzq59`,k87sOh:`astryx13vifvy`,kY2c9j:`astryx1vjfegm`,$$css:!0},panelAutoFill:{kUk6DE:`astryx98rzlu`,kzQI83:null,kmuXW:null,kCS8Yb:null,kVQacm:`astryxysyzu8`,kXHlph:null,kORKVm:null,$$css:!0}},E.displayName=`AppShell`,E.__docgenInfo={description:`Application-level layout shell. Provides the structural frame for an app:
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
\`\`\``},topNav:{required:!1,tsType:{name:`ReactNode`},description:"Top navigation — typically an TopNav.\nSame contract as `sideNav` — pass `undefined` when there's no top nav."}},composes:[`Omit`]}})))()}export{P as n,E as t};