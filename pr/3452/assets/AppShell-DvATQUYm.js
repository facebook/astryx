import{ah as r,aL as ge,ac as fe,aG as be,a1 as e,af as S,a6 as $,ay as k,a7 as Se,R as H}from"./iframe-BzSUXdLu.js";import{L as ke,b as Ne}from"./LayoutContent-BP0Q4IuR.js";import{L as I}from"./LayoutHeader-DghAEdzN.js";import{L as we}from"./LayoutPanel-DLzHvFDC.js";import{M as Ae,T as V,a as L}from"./TopNavMobileContentContext-Cwqi1MOK.js";import{S as N}from"./SideNavRenderContext-BwDd2zme.js";import{A as je}from"./AppShellMobileContext-CN63m2rQ.js";function E(a){return a!=null&&typeof a!="boolean"&&a!==""}const Me=typeof H.Activity<"u",Te=Me?({mode:a,children:y})=>e.jsx(H.Activity,{mode:a,children:y}):({children:a})=>e.jsx(e.Fragment,{children:a}),Re={sm:640,md:768,lg:1024,none:0},P="astryx-app-shell-main",t={root:{k1xSpc:"astryx78zum5",kXwgrk:"astryxdt5ytf",kVAEAm:"astryx1n2onr6",$$css:!0},variantWash:{kWkggS:"astryx1eiddq6",$$css:!0},variantSurface:{kWkggS:"astryx10xzikg",$$css:!0},variantSection:{kWkggS:"astryx10xzikg",$$css:!0},variantElevated:{kWkggS:"astryx1eiddq6",$$css:!0},rootFill:{kZKoxP:"astryxtdtrs8",$$css:!0},rootAuto:{kAzted:"astryx1ov3xa9",$$css:!0},contentBgSurface:{kWkggS:"astryx10xzikg",$$css:!0},contentBgWash:{kWkggS:"astryx1eiddq6",$$css:!0},contentBgTransparent:{kWkggS:"astryxjbqb8w",kHBbk8:"astryxc8icb0",$$css:!0},navAreaWash:{kWkggS:"astryx1eiddq6",$$css:!0},navAreaSurface:{kWkggS:"astryx10xzikg",$$css:!0},banner:{kmuXW:"astryx2lah0s",$$css:!0},headerSticky:{kVAEAm:"astryx7wzq59",k87sOh:"astryx13vifvy",kY2c9j:"astryx1vjfegm",$$css:!0},panelAutoFill:{kUk6DE:"astryx98rzlu",kzQI83:null,kmuXW:null,kCS8Yb:null,kVQacm:"astryxysyzu8",kXHlph:null,kORKVm:null,$$css:!0}};function F({variant:a="elevated",banner:y,children:_,contentPadding:X,"data-testid":U,height:w="fill",mobileNav:n,sideNav:c,topNav:x,xstyle:Q,className:K,style:Y,ref:G}){const m=n===!1,l=n!=null&&n!==!1&&typeof n=="object"&&!r.isValidElement(n)?n:null,q=l?.breakpoint??"md",u=n!=null&&n!==!1&&(r.isValidElement(n)||typeof n=="string")?n:null,A=l?.content??null,g=l?.hasToggle!==!1,O=l?.isOpen!==void 0,Z=q==="none"?"(max-width: 0px)":`(max-width: ${Re[q]}px)`,o=ge(Z,l?.defaultIsMobile),[J,ee]=r.useState(!1),f=l?.isOpen??J,b=r.useCallback(p=>{O||ee(p),l?.onOpenChange?.(p)},[O,l]),j=w==="fill",i=w==="auto",z=E(y),s=E(x),d=E(c),h=!m&&(s||d)&&u==null,M=a==="section",ae=a==="elevated",v=a==="wash"||a==="elevated"?t.navAreaWash:a==="surface"?t.navAreaSurface:void 0,te=a==="wash"?t.contentBgWash:a==="elevated"&&s&&d&&!o?t.contentBgTransparent:a==="surface"||a==="elevated"?t.contentBgSurface:void 0,ne=v??t.navAreaSurface,T=r.useRef(null),R=r.useRef(null);r.useEffect(()=>{if(!i||!T.current||!R.current)return;const p=T.current,ye=R.current,xe=()=>{const me=p.getBoundingClientRect().height;ye.style.setProperty("--appshell-header-height",`${me}px`)};return fe(p,()=>xe()),()=>be(p)},[i]);const W=d&&!o,se=u!=null,le=h&&A!=null&&o,oe=r.useMemo(()=>({isMobile:o,isMobileNavOpen:f,toggleMobileNav:()=>h&&b(!f),openMobileNav:()=>h&&b(!0),closeMobileNav:()=>b(!1),isMobileNavEnabled:h,hasAutoToggle:g}),[o,f,b,h,g]),re=d&&g?e.jsx(N,{value:"drawer-content",children:c}):null,ie=d?e.jsx(N,{value:"drawer-content",children:c}):null,de=s?o&&!m&&u==null?e.jsx(V,{value:re,children:e.jsx(L,{value:"mobile-bar",children:x})}):x:null,B=s||z?e.jsxs(I,{padding:0,hasDivider:M&&s,children:[z&&e.jsx("div",{...S(t.banner,v),children:y}),s&&de]}):void 0,ce=B!=null?e.jsx("div",{ref:T,...$(k("app-shell-header",{variant:a}),S(v,i&&t.headerSticky)),children:B}):void 0,C=W?e.jsx(we,{padding:0,hasDivider:M,isScrollable:j,...k("app-shell-sidenav",{variant:a}),xstyle:[v,i&&ne,i&&t.panelAutoFill],children:c}):void 0,pe=C!=null&&i?e.jsx("div",{className:"astryx2lah0s astryx7giv3 astryx7wzq59 astryxepuwc7 astryx16zugyo astryx78zum5 astryxdt5ytf",children:C}):C,ue=ae&&s&&W,D=e.jsx(Ne,{padding:X??0,role:"main",id:P,isScrollable:j,xstyle:te,children:_}),he=ue?e.jsxs("div",{className:"astryx1n2onr6 astryx78zum5 astryx98rzlu astryx2lwn1j astryx5yr21d",children:[e.jsx("div",{className:"astryx10l6tqk astryx10a8y8t astryx10xzikg astryx183tx6i astryx47corl"}),D]}):D,ve=!m&&g&&o&&!s&&d?e.jsx("div",{...$(k("app-shell-header",{variant:a}),S(v,i&&t.headerSticky)),children:e.jsx(I,{padding:0,hasDivider:M,children:e.jsxs("div",{className:"astryx78zum5 astryx6s0dn4 astryx1k15mir astryxf314gf",role:"navigation","aria-label":"Mobile navigation",children:[e.jsx(N,{value:"topbar",children:c}),e.jsx(Ae,{})]})})}):void 0;return e.jsx(je,{value:oe,children:e.jsxs("div",{ref:Se(G,R),"data-testid":U,...$(k("app-shell",{variant:a}),S(t.root,a==="wash"?t.variantWash:a==="surface"?t.variantSurface:a==="section"?t.variantSection:t.variantElevated,j?t.rootFill:t.rootAuto,Q),K,Y),children:[e.jsx("a",{href:`#${P}`,className:"astryx10l6tqk astryx1xrnuwo astryx1i1rx1s astryx1jqxupm astryxjm9jq1 astryx15cytp8 astryxt970qd astryxh2mrf5 astryxnjsko4 astryx1cf3d6k astryxkdpibf astryx1y5lnwp astryxb3r6kr astryxomzh7y astryx1hyvwdk astryx1rsz1da astryxuxw1ft astryx1hbpcn8 astryxc342km astryx13vifvy astryx1rw3289 astryx1o0tod astryxodanix astryx10xzikg astryxjse4m1 astryx1q2oy4v astryx1hl2dhg astryx2mo6ok astryxjm74w1","data-testid":"skip-to-content",children:"Skip to content"}),e.jsx(ke,{height:w,padding:0,header:e.jsxs(e.Fragment,{children:[ce,ve]}),start:pe,content:he}),se&&u,le&&A,o&&!m&&u==null&&!A&&e.jsxs(Te,{mode:f?"visible":"hidden",children:[d&&!s&&e.jsx(N,{value:"drawer",children:c}),s&&e.jsx(V,{value:ie,children:e.jsx(L,{value:"drawer",children:x})})]})]})})}F.displayName="AppShell";F.__docgenInfo={description:`Application-level layout shell. Provides the structural frame for an app:
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
\`\`\``,methods:[],displayName:"AppShell",props:{xstyle:{required:!1,tsType:{name:"StyleXStyles"},description:"StyleX styles created via `stylex.create()`. Merged with the component's\nbase styles inside a single `stylex.props()` call for optimal deduplication.\n\n@example\n```\nconst overrides = stylex.create({ root: { marginBottom: 8 } });\n<Component xstyle={overrides.root} />\n```"},ref:{required:!1,tsType:{name:"ReactRef",raw:"React.Ref<HTMLDivElement>",elements:[{name:"HTMLDivElement"}]},description:"Ref forwarded to the root element"},variant:{required:!1,tsType:{name:"AppShellVariantMap"},description:"Navigation background style controlling how nav areas contrast with content.\n- `wash`: Nav uses wash background, no dividers\n- `surface`: Nav uses surface background, no dividers\n- `section`: Dividers between nav and content (classic look)\n- `elevated`: Wash nav with elevated surface content area + border radius\n@default 'elevated'",defaultValue:{value:"'elevated'",computed:!1}},banner:{required:!1,tsType:{name:"ReactNode"},description:`Optional banner slot for system-wide announcements.
Renders above the top nav and scrolls away with the page in auto mode.`},children:{required:!0,tsType:{name:"ReactNode"},description:"Main content area (rendered as `<main>`)."},contentPadding:{required:!1,tsType:{name:"union",raw:"0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10",elements:[{name:"literal",value:"0"},{name:"literal",value:"0.5"},{name:"literal",value:"1"},{name:"literal",value:"1.5"},{name:"literal",value:"2"},{name:"literal",value:"3"},{name:"literal",value:"4"},{name:"literal",value:"5"},{name:"literal",value:"6"},{name:"literal",value:"8"},{name:"literal",value:"10"}]},description:"Padding for the main content area using the spacing scale.\nSet based on the dominant content pattern for the page:\n- `4` (16px) — standard padding for forms, settings, text-heavy pages\n- `0` — no padding, for dashboards, maps, tables that need edge-to-edge\nOverride individual sections with `<Section padding={...}>`.\nAccepts numeric spacing steps: 0, 0.5, 1, 1.5, 2, 3, 4, 5, 6, 8, 10."},height:{required:!1,tsType:{name:"union",raw:"'fill' | 'auto'",elements:[{name:"literal",value:"'fill'"},{name:"literal",value:"'auto'"}]},description:"Height behavior:\n- `fill`: Shell fills viewport, content scrolls internally (default)\n- `auto`: Shell grows with content, page scrolls as a whole\n@default 'fill'",defaultValue:{value:"'fill'",computed:!1}},mobileNav:{required:!1,tsType:{name:"union",raw:"false | MobileNavConfig | ReactNode",elements:[{name:"literal",value:"false"},{name:"MobileNavConfig"},{name:"ReactNode"}]},description:`Mobile navigation configuration.

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
\`\`\``},sideNav:{required:!1,tsType:{name:"ReactNode"},description:`Side navigation — typically an SideNav.

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
\`\`\``},topNav:{required:!1,tsType:{name:"ReactNode"},description:"Top navigation — typically an TopNav.\nSame contract as `sideNav` — pass `undefined` when there's no top nav."}},composes:["Omit"]};export{F as A};
