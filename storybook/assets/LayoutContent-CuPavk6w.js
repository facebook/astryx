import{i as e,s as t}from"./preload-helper-CT_b8DTk.js";import{t as n}from"./react-B7Te67-h.js";import{l as r,n as i,t as a,u as o}from"./themeProps-_oSbOSxB.js";import{i as s,r as c}from"./LayoutHeader-By1G-oXd.js";import{i as l,n as u,r as d,t as f}from"./stackItem.stylex-GHZ4wVym.js";import{S as p,t as m}from"./utils-CD2ovDaz.js";import{a as h,i as g,l as _,n as v,o as y,r as b,t as x}from"./padding.stylex-DjsS098v.js";import{t as S}from"./jsx-runtime-DqZldVDK.js";var C,w,T=e((()=>{C=t(n(),1),w=(0,C.createContext)(null),w.displayName=`LayoutAreaContext`})),E,D,O,k=e((()=>{E=t(n(),1),D={hasHeader:!1,hasFooter:!1,hasStart:!1,hasEnd:!1},O=(0,E.createContext)(D),O.displayName=`LayoutSlotsContext`}));function A({area:e,children:t}){return t==null?null:(0,N.jsx)(w,{value:e,children:t})}function j({children:e,content:t,contentWidth:n,defaultHasDividers:r,end:a,footer:s,header:d,height:f=`fill`,padding:m,ref:g,start:_,xstyle:v,className:b,style:x}){let S=f===`fill`,C=t??e,w=(0,M.useMemo)(()=>r==null?null:{defaultHasDividers:r},[r]),T=d!=null,E=s!=null,D=_!=null,k=a!=null,j=(0,N.jsx)(O,{value:(0,M.useMemo)(()=>({hasHeader:T,hasFooter:E,hasStart:D,hasEnd:k}),[T,E,D,k]),children:(0,N.jsx)(`div`,{ref:g,...p(i(`layout`,{height:f}),o(P.layoutOuter,S?P.fill:P.auto,v),b,x),children:(0,N.jsxs)(`div`,{...o(L,P.layoutInner,...l({direction:`vertical`}),S?P.fill:P.auto,m===0&&P.fullBleed,m!=null&&h[m],m!=null&&y[m],n!=null&&I.contentWidthVar(n)),children:[(0,N.jsx)(A,{area:`header`,children:d}),(0,N.jsxs)(`div`,{...o(...l({direction:`horizontal`}),P.middle,n!=null&&I.contentWidth(n)),children:[(0,N.jsx)(A,{area:`start`,children:_}),(0,N.jsx)(`div`,{...o(...u({size:`fill`})),children:(0,N.jsx)(A,{area:`content`,children:C})}),(0,N.jsx)(A,{area:`end`,children:a})]}),(0,N.jsx)(A,{area:`footer`,children:s})]})})});return w==null?j:(0,N.jsx)(c,{value:w,children:j})}var M,N,P,F,I,L,R=e((()=>{M=t(n(),1),r(),T(),k(),s(),d(),f(),m(),a(),g(),N=S(),P={layoutOuter:{keTefX:`astryxojxgvx`,k71WvV:`astryx1fcf3bl`,keoZOQ:`astryx1sa9bsh`,k1K539:`astryx6h7pi7`,$$css:!0},layoutInner:{"--container-padding-inline-start":`astryxrhngw9`,"--container-padding-inline-end":`astryxjsfl84`,"--container-padding-block-start":`astryx1047aw6`,"--container-padding-block-end":`astryxax9j7h`,$$css:!0},fill:{kZKoxP:`astryx12qplqi`,kskxy:`astryxenllk4`,$$css:!0},auto:{kAzted:`astryx1us19tq`,$$css:!0},middle:{kUk6DE:`astryx98rzlu`,kzQI83:null,kmuXW:null,kCS8Yb:null,kAzted:`astryx2lwn1j`,$$css:!0},fullBleed:{"--layout-padding-outer-x":`astryx1wbjvqu`,"--layout-padding-outer-y":`astryxzxxx64`,$$css:!0}},F={kzqmXN:`astryxh8yej3`,kUOVxO:`astryxvueqy4`,keTefX:``,koQZXg:``,k71WvV:``,km5ZXQ:``,$$css:!0},I={contentWidthVar:e=>[{"--layout-content-width":(typeof e==`number`?`${e}px`:e)==null?typeof e==`number`?`${e}px`:e:`astryx4906uf`,$$css:!0},{"--x---layout-content-width":(typeof e==`number`?`${e}px`:e)==null?void 0:typeof e==`number`?`${e}px`:e}],contentWidth:e=>[F,{ks0D6T:(typeof e==`number`?`${e}px`:e)==null?typeof e==`number`?`${e}px`:e:`astryxf68679`,$$css:!0},{"--x-maxWidth":(e=>typeof e==`number`?e+`px`:e??void 0)(typeof e==`number`?`${e}px`:e)}]},L={"astryx-default-marker":`astryx-default-marker`,$$css:!0},j.displayName=`Layout`,j.__docgenInfo={description:`Page shell with header, sidebar(s), content, and footer slots.
Use this for full-page layouts, app shells, dashboard layouts, or any UI
that needs a header bar, side navigation, scrollable content area, or action footer.
Can be used standalone for page-level layouts, or inside a container
(Card, Section) for content-level layouts.

Handles padding collapse between adjacent slots, scroll containment in the
content area, and automatic RTL support via CSS logical properties.

Structure:
\`\`\`
┌─────────────────────────────────────────┐
│                 header                  │
├──────┬─────────────────────────┬────────┤
│      │                         │        │
│start │        content          │  end   │
│      │                         │        │
├──────┴─────────────────────────┴────────┤
│                 footer                  │
└─────────────────────────────────────────┘
\`\`\`

When to use Layout vs raw flexbox:
- Page with a sidebar → Layout with \`start\` slot
- Dashboard with header + scrollable body → Layout with \`header\` + \`content\`
- Settings page with nav panel → Layout with \`start\` + \`content\`
- Simple vertical stack of items → use VStack instead

@example
\`\`\`
<Layout
  header={<LayoutHeader hasDivider>App Name</LayoutHeader>}
  start={
    <LayoutPanel hasDivider width={240} role="navigation">
      <Navigation />
    </LayoutPanel>
  }
  content={
    <LayoutContent role="main">
      <MainContent />
    </LayoutContent>
  }
/>
\`\`\``,methods:[],displayName:`Layout`,props:{ref:{required:!1,tsType:{name:`ReactRef`,raw:`React.Ref<HTMLDivElement>`,elements:[{name:`HTMLDivElement`}]},description:`Ref forwarded to the root DOM element.`},content:{required:!1,tsType:{name:`ReactNode`},description:`Main content area (center).`},contentWidth:{required:!1,tsType:{name:`union`,raw:`number | string`,elements:[{name:`number`},{name:`string`}]},description:`Maximum width of the content within each slot (header, content, footer,
panels). Dividers remain full-bleed. Content is centered with
\`margin-inline: auto\` when narrower than the available space.

Numbers are treated as pixels, strings are used as-is (e.g., '60ch').
Common page widths:
- \`640\` — forms, settings, text-focused pages
- \`960\` — content pages, component demos, wider layouts`},end:{required:!1,tsType:{name:`ReactNode`},description:`End panel slot (right in LTR, left in RTL).`},footer:{required:!1,tsType:{name:`ReactNode`},description:`Footer slot.`},header:{required:!1,tsType:{name:`ReactNode`},description:`Header slot.`},height:{required:!1,tsType:{name:`union`,raw:`'fill' | 'auto'`,elements:[{name:`literal`,value:`'fill'`},{name:`literal`,value:`'auto'`}]},description:"Controls the height behavior:\n- `fill`: Layout fills container height, content scrolls internally (default)\n- `auto`: Layout grows with content, container/page scrolls\n@default 'fill'",defaultValue:{value:`'fill'`,computed:!1}},padding:{required:!1,tsType:{name:`union`,raw:`0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10`,elements:[{name:`literal`,value:`0`},{name:`literal`,value:`0.5`},{name:`literal`,value:`1`},{name:`literal`,value:`1.5`},{name:`literal`,value:`2`},{name:`literal`,value:`3`},{name:`literal`,value:`4`},{name:`literal`,value:`5`},{name:`literal`,value:`6`},{name:`literal`,value:`8`},{name:`literal`,value:`10`}]},description:"Padding at the layout's outer edges using the spacing scale.\nControls both `--layout-padding-outer-x` and `--layout-padding-outer-y`.\nAccepts numeric spacing steps: 0, 0.5, 1, 1.5, 2, 3, 4, 5, 6, 8, 10."},start:{required:!1,tsType:{name:`ReactNode`},description:`Start panel slot (left in LTR, right in RTL).`},defaultHasDividers:{required:!1,tsType:{name:`boolean`},description:`Default divider visibility for LayoutHeader and LayoutFooter children.
When set, headers/footers that don't explicitly pass \`hasDivider\` will use this value.
When not set, nested layouts inherit from their parent context.`},children:{required:!1,tsType:{name:`ReactNode`},description:"Children are a shorthand for the `content` slot:\n`<Layout>{main}</Layout>` is equivalent to `<Layout content={main} />`.\nThe surrounding zones (`header`/`start`/`end`/`footer`) stay explicit\nprops. If both `content` and `children` are provided, `content` wins.\nAccepting children keeps the natural `<Layout>…</Layout>` form from\nrendering a blank shell."}},composes:[`Omit`]}}));function z({children:e,isScrollable:t=!0,padding:n,label:r,role:a,xstyle:s,className:c,style:l,ref:u,...d}){let{hasHeader:f,hasFooter:m,hasStart:h,hasEnd:g}=(0,B.use)(O),y=n===0;return(0,V.jsx)(`div`,{ref:u,role:a,"aria-label":r,...p(i(`layout-content`),o(H.content,!h&&!y&&n==null&&H.noStart,!g&&!y&&n==null&&H.noEnd,!f&&!y&&n==null&&H.noHeader,!m&&!y&&n==null&&H.noFooter,t&&H.scrollable,y&&H.fullBleed,n!=null&&_[n],n!=null&&b[n],n!=null&&v[n],n!=null&&x[n],s),c,l),...d,children:e})}var B,V,H,U=e((()=>{B=t(n(),1),r(),k(),m(),a(),g(),V=S(),H={content:{kB7OPa:`astryx9f619`,kZKoxP:`astryx5yr21d`,kUk6DE:`astryx98rzlu`,kAzted:`astryx2lwn1j`,kVQacm:`astryx7giv3`,kZCmMZ:`astryxwjyata`,kwRFfy:`astryx1peupej`,kLKAdn:`astryxqty4a astryx1u0vwcr`,kGO01o:`astryxg476vw astryx307h6p`,"--container-padding-inline-start":`astryx408pgh`,"--container-padding-inline-end":`astryxikqloz`,"--container-padding-block-start":`astryxjmgx01`,"--container-padding-block-end":`astryxi9ns85`,$$css:!0},noStart:{kZCmMZ:`astryx139j0dd`,"--container-padding-inline-start":`astryxdvaxxn`,"--container-padding-inline-end":`astryxqpvj4r`,$$css:!0},noEnd:{kwRFfy:`astryxpc6k2p`,$$css:!0},noHeader:{kLKAdn:`astryx81pis9`,"--container-padding-block-start":`astryxzz8v79`,$$css:!0},noFooter:{kGO01o:`astryxon7vh3`,"--container-padding-block-end":`astryx1xjq73n`,$$css:!0},scrollable:{kVQacm:`astryxysyzu8`,$$css:!0},fullBleed:{kZCmMZ:`astryx1c1uobl`,kwRFfy:`astryxyri2b`,kLKAdn:`astryxexx8yu`,kGO01o:`astryx18d9i69`,"--container-padding-inline-start":`astryxrhngw9`,"--container-padding-inline-end":`astryxjsfl84`,"--container-padding-block-start":`astryx1047aw6`,"--container-padding-block-end":`astryxax9j7h`,$$css:!0}},z.displayName=`LayoutContent`,z.__docgenInfo={description:`Scrollable main content area for Layout. Wraps the primary body content
with automatic scroll containment and context-aware padding.

Already provides its own padding and scroll — don't add padding or
overflow to children. Use \`padding={0}\` if you need edge-to-edge content.

@example
\`\`\`
<LayoutContainer variant="card">
  <Layout
    header={<LayoutHeader>Title</LayoutHeader>}
    content={<LayoutContent>Main body content</LayoutContent>}
  />
</LayoutContainer>
<LayoutContainer variant="card">
  <Layout
    content={
      <LayoutContent padding={0}>
        <Table />
      </LayoutContent>
    }
  />
</LayoutContainer>
<LayoutContainer variant="card">
  <Layout
    content={
      <LayoutContent isScrollable={false}>
        <StickyElement />
      </LayoutContent>
    }
  />
</LayoutContainer>
\`\`\``,methods:[],displayName:`LayoutContent`,props:{xstyle:{required:!1,tsType:{name:`StyleXStyles`},description:"StyleX styles created via `stylex.create()`. Merged with the component's\nbase styles inside a single `stylex.props()` call for optimal deduplication.\n\n@example\n```\nconst overrides = stylex.create({ root: { marginBottom: 8 } });\n<Component xstyle={overrides.root} />\n```"},ref:{required:!1,tsType:{name:`ReactRef`,raw:`React.Ref<HTMLDivElement>`,elements:[{name:`HTMLDivElement`}]},description:``},children:{required:!1,tsType:{name:`ReactNode`},description:`Content to render inside the content area.`},padding:{required:!1,tsType:{name:`union`,raw:`0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10`,elements:[{name:`literal`,value:`0`},{name:`literal`,value:`0.5`},{name:`literal`,value:`1`},{name:`literal`,value:`1.5`},{name:`literal`,value:`2`},{name:`literal`,value:`3`},{name:`literal`,value:`4`},{name:`literal`,value:`5`},{name:`literal`,value:`6`},{name:`literal`,value:`8`},{name:`literal`,value:`10`}]},description:`Internal padding of the content area using the spacing scale.
Accepts numeric spacing steps: 0, 0.5, 1, 1.5, 2, 3, 4, 5, 6, 8, 10.
Overrides the default padding from the layout container.`},isScrollable:{required:!1,tsType:{name:`boolean`},description:`Enables scrollable overflow for the content area.
Set to false for auto-height layouts where sticky positioning
needs to work with parent containers.
@default true`,defaultValue:{value:`true`,computed:!1}},label:{required:!1,tsType:{name:`string`},description:`Accessible label for the landmark.
Required when role is set and multiple landmarks of the same type exist.`},role:{required:!1,tsType:{name:`AriaRole`},description:`ARIA landmark role for accessibility.
Use 'main' only for the primary content area of the page (not in nested layouts).`}},composes:[`Omit`]}}));export{O as a,T as c,R as i,U as n,k as o,j as r,w as s,z as t};