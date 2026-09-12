import{i as e,s as t}from"./preload-helper-CT_b8DTk.js";import{t as n}from"./react-B7Te67-h.js";import{E as r,F as i,I as a,O as o}from"./ime-B2gVvZm0.js";import{i as s,r as c}from"./LayoutHeader-DGsqMvP_.js";import{i as l,n as u,r as d,t as f}from"./stackItem.stylex-GHZ4wVym.js";import{P as p,t as m}from"./utils-CuDRdYlB.js";import{a as h,c as g,g as _,n as v,o as y,s as b,t as x}from"./padding.stylex-Hr1weLfK.js";import{t as S}from"./jsx-runtime-DqZldVDK.js";var C,w,T=e((()=>{C=t(n(),1),w=(0,C.createContext)(null),w.displayName=`LayoutAreaContext`})),E,D,O,k=e((()=>{E=t(n(),1),D={hasHeader:!1,hasFooter:!1,hasStart:!1,hasEnd:!1},O=(0,E.createContext)(D),O.displayName=`LayoutSlotsContext`}));function A(e){if(e==null||typeof e==`number`)return!0;let t=e.trim().toLowerCase();return t.includes(`%`)?!1:t===`0`||/^-?(?:\d+(?:\.\d+)?|\.\d+)[a-z]+$/.test(t)||/^(?:calc|min|max|clamp)\(/.test(t)}function j({area:e,children:t}){return t==null?null:(0,P.jsx)(w,{value:e,children:t})}function M({children:e,content:t,contentWidth:n,defaultHasDividers:r,end:i,footer:s,header:d,height:f=`fill`,padding:m,ref:h,start:_,xstyle:v,className:y,style:x}){let S=f===`fill`,C=t??e,w=(0,N.useMemo)(()=>r==null?null:{defaultHasDividers:r},[r]),T=d!=null,E=s!=null,D=_!=null,k=i!=null,M=D&&k,I=D!==k,z=n!=null&&A(n),B=(0,P.jsx)(O,{value:(0,N.useMemo)(()=>({hasHeader:T,hasFooter:E,hasStart:D,hasEnd:k}),[T,E,D,k]),children:(0,P.jsx)(`div`,{ref:h,...p(o(`layout`,{height:f}),a(F.layoutOuter,S?F.fill:F.auto,v),y,x),children:(0,P.jsxs)(`div`,{...a(R,F.layoutInner,...l({direction:`vertical`}),S?F.fill:F.auto,m===0&&F.fullBleed,m!=null&&b[m],m!=null&&g[m],n!=null&&L.contentWidthVar(n),z&&L.contentAlignmentWidthVar(n)),children:[(0,P.jsx)(j,{area:`header`,children:d}),(0,P.jsxs)(`div`,{...a(...l({direction:`horizontal`}),F.middle,n!=null&&(!z||M)&&L.contentWidth(n),z&&!M&&F.middleQuery,z&&I&&F.singlePanelMiddle,z&&D&&!k&&F.singleStartPanel,z&&!D&&k&&F.singleEndPanel),children:[(0,P.jsx)(j,{area:`start`,children:_}),(0,P.jsx)(`div`,{...a(...u({size:`fill`}),z&&!D&&!k&&F.singleColumnContent),children:(0,P.jsx)(j,{area:`content`,children:C})}),(0,P.jsx)(j,{area:`end`,children:i})]}),(0,P.jsx)(j,{area:`footer`,children:s})]})})});return w==null?B:(0,P.jsx)(c,{value:w,children:B})}var N,P,F,I,L,R,z=e((()=>{N=t(n(),1),i(),T(),k(),s(),d(),f(),m(),r(),y(),P=S(),F={layoutOuter:{keTefX:`astryxojxgvx`,k71WvV:`astryx1fcf3bl`,keoZOQ:`astryx1sa9bsh`,k1K539:`astryx6h7pi7`,$$css:!0},layoutInner:{"--container-padding-inline-start":`astryxrhngw9`,"--container-padding-inline-end":`astryxjsfl84`,"--container-padding-block-start":`astryx1047aw6`,"--container-padding-block-end":`astryxax9j7h`,"--layout-content-width":`astryx15lplax`,"--layout-alignment-width":`astryx19kr0ht`,$$css:!0},fill:{kZKoxP:`astryx12qplqi`,kskxy:`astryxenllk4`,$$css:!0},auto:{kAzted:`astryx1us19tq`,$$css:!0},middle:{kUk6DE:`astryx98rzlu`,kzQI83:null,kmuXW:null,kCS8Yb:null,kAzted:`astryx2lwn1j`,$$css:!0},middleQuery:{k9g6sI:`astryxsw3flo`,$$css:!0},singleColumnContent:{kzqmXN:`astryxh8yej3`,ks0D6T:`astryxjl2t3p astryxpgkkid`,kUOVxO:`astryxvueqy4`,keTefX:null,koQZXg:null,k71WvV:null,km5ZXQ:null,$$css:!0},singlePanelMiddle:{kB7OPa:`astryx9f619`,kzqmXN:`astryxh8yej3`,ks0D6T:`astryxjl2t3p astryxnpzo02`,kUOVxO:`astryxvueqy4 astryxb0m1lw`,keTefX:null,koQZXg:null,k71WvV:null,km5ZXQ:null,$$css:!0},singleStartPanel:{kZCmMZ:`astryx1vvd0s7`,kE3dHu:null,kpe85a:null,$$css:!0},singleEndPanel:{kwRFfy:`astryxxdn8bs`,kE3dHu:null,kpe85a:null,$$css:!0},fullBleed:{"--layout-padding-outer-x":`astryx1wbjvqu`,"--layout-padding-outer-y":`astryxzxxx64`,$$css:!0}},I={kzqmXN:`astryxh8yej3`,kUOVxO:`astryxvueqy4`,keTefX:``,koQZXg:``,k71WvV:``,km5ZXQ:``,$$css:!0},L={contentWidthVar:e=>[{"--layout-content-width":(typeof e==`number`?`${e}px`:e)==null?typeof e==`number`?`${e}px`:e:`astryx4906uf`,$$css:!0},{"--x---layout-content-width":(typeof e==`number`?`${e}px`:e)==null?void 0:typeof e==`number`?`${e}px`:e}],contentAlignmentWidthVar:e=>[{"--layout-alignment-width":(typeof e==`number`?`${e}px`:e)==null?typeof e==`number`?`${e}px`:e:`astryx1b1nz06`,$$css:!0},{"--x---layout-alignment-width":(typeof e==`number`?`${e}px`:e)==null?void 0:typeof e==`number`?`${e}px`:e}],contentWidth:e=>[I,{ks0D6T:(typeof e==`number`?`${e}px`:e)==null?typeof e==`number`?`${e}px`:e:`astryxf68679`,$$css:!0},{"--x-maxWidth":(e=>typeof e==`number`?e+`px`:e??void 0)(typeof e==`number`?`${e}px`:e)}]},R={"astryx-default-marker":`astryx-default-marker`,$$css:!0},M.displayName=`Layout`,M.__docgenInfo={description:`General layout primitive with header, start, content, end, and footer slots.
Use it to arrange regions within a page or bounded container. AppShell owns
the page shell, app-wide navigation, responsive shell behavior, skip link,
and main landmark.

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
\`\`\``,methods:[],displayName:`Layout`,props:{ref:{required:!1,tsType:{name:`ReactRef`,raw:`React.Ref<HTMLDivElement>`,elements:[{name:`HTMLDivElement`}]},description:`Ref forwarded to the root DOM element.`},content:{required:!1,tsType:{name:`ReactNode`},description:`Main content area (center).`},contentWidth:{required:!1,tsType:{name:`union`,raw:`number | string`,elements:[{name:`number`},{name:`string`}]},description:"Maximum width of the aligned content within each slot (header, content,\nfooter, panels). Dividers remain full-bleed. Content is centered with\n`margin-inline: auto` when narrower than the available space.\n\nIn a layout without start or end panels, LayoutContent spans the available\nwidth so its scrollbar stays at the outer edge, while its children align\ninternally to `contentWidth`. With exactly one panel, that panel remains\naligned to the `contentWidth` frame while LayoutContent extends to the\nopposite open edge. With both panels, `contentWidth` includes the complete\nstart + content + end composition. Intrinsic widths such as `fit-content`\nretain the constrained composition because they cannot participate in the\ninternal alignment arithmetic. Percentage widths, including\npercentage-bearing `calc()`, `min()`, `max()`, and `clamp()` values, use the\nconstrained fallback because they cannot share one arithmetic basis. Bare\n`var(...)` values also use that fallback because their resolved value may be\nintrinsic; wrap a variable guaranteed to resolve to a length in `calc(...)`\nto opt into edge scrolling.\n\nNumbers are treated as pixels, strings are used as-is (e.g., '60ch').\nCommon page widths:\n- `640` — forms, settings, text-focused pages\n- `960` — content pages, component demos, wider layouts"},end:{required:!1,tsType:{name:`ReactNode`},description:`End panel slot (right in LTR, left in RTL).`},footer:{required:!1,tsType:{name:`ReactNode`},description:`Footer slot.`},header:{required:!1,tsType:{name:`ReactNode`},description:`Header slot.`},height:{required:!1,tsType:{name:`union`,raw:`'fill' | 'auto'`,elements:[{name:`literal`,value:`'fill'`},{name:`literal`,value:`'auto'`}]},description:"Controls the height behavior:\n- `fill`: Layout fills container height, content scrolls internally (default)\n- `auto`: Layout grows with content, container/page scrolls\n@default 'fill'",defaultValue:{value:`'fill'`,computed:!1}},padding:{required:!1,tsType:{name:`union`,raw:`0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10`,elements:[{name:`literal`,value:`0`},{name:`literal`,value:`0.5`},{name:`literal`,value:`1`},{name:`literal`,value:`1.5`},{name:`literal`,value:`2`},{name:`literal`,value:`3`},{name:`literal`,value:`4`},{name:`literal`,value:`5`},{name:`literal`,value:`6`},{name:`literal`,value:`8`},{name:`literal`,value:`10`}]},description:"Padding at the layout's outer edges using the spacing scale.\nControls both `--layout-padding-outer-x` and `--layout-padding-outer-y`.\nAccepts numeric spacing steps: 0, 0.5, 1, 1.5, 2, 3, 4, 5, 6, 8, 10."},start:{required:!1,tsType:{name:`ReactNode`},description:`Start panel slot (left in LTR, right in RTL).`},defaultHasDividers:{required:!1,tsType:{name:`boolean`},description:`Default divider visibility for LayoutHeader and LayoutFooter children.
When set, headers/footers that don't explicitly pass \`hasDivider\` will use this value.
When not set, nested layouts inherit from their parent context.`},children:{required:!1,tsType:{name:`ReactNode`},description:"Children are a shorthand for the `content` slot:\n`<Layout>{main}</Layout>` is equivalent to `<Layout content={main} />`.\nThe surrounding zones (`header`/`start`/`end`/`footer`) stay explicit\nprops. If both `content` and `children` are provided, `content` wins.\nAccepting children keeps the natural `<Layout>…</Layout>` form from\nrendering a blank shell."}},composes:[`Omit`]}}));function B({children:e,isScrollable:t=!0,padding:n,label:r,role:i,xstyle:s,className:c,style:l,ref:u,...d}){let{hasHeader:f,hasFooter:m,hasStart:g,hasEnd:y}=(0,V.use)(O),b=n===0;return(0,H.jsx)(`div`,{ref:u,role:i,"aria-label":r,...p(o(`layout-content`),a(U.content,!g&&!b&&n==null&&U.noStart,!y&&!b&&n==null&&U.noEnd,!f&&!b&&n==null&&U.noHeader,!m&&!b&&n==null&&U.noFooter,t&&U.scrollable,b&&U.fullBleed,n!=null&&_[n],n!=null&&h[n],n!=null&&v[n],n!=null&&x[n],!g&&!y&&!b&&U.constrainedNoPanelsStart,!g&&!y&&!b&&U.constrainedNoPanelsEnd,g&&!y&&!b&&U.constrainedSingleStartPanel,!g&&y&&!b&&U.constrainedSingleEndPanel,s),c,l),...d,children:e})}var V,H,U,W=e((()=>{V=t(n(),1),i(),k(),m(),r(),y(),H=S(),U={content:{kB7OPa:`astryx9f619`,kZKoxP:`astryx5yr21d`,kUk6DE:`astryx98rzlu`,kAzted:`astryx2lwn1j`,kVQacm:`astryx7giv3`,kZCmMZ:`astryxwjyata`,kwRFfy:`astryx1peupej`,kLKAdn:`astryxqty4a astryx1u0vwcr`,kGO01o:`astryxg476vw astryx307h6p`,"--container-padding-inline-start":`astryx408pgh`,"--container-padding-inline-end":`astryxikqloz`,"--container-padding-block-start":`astryxjmgx01`,"--container-padding-block-end":`astryxi9ns85`,$$css:!0},noStart:{kZCmMZ:`astryx139j0dd`,"--container-padding-inline-start":`astryxdvaxxn`,"--container-padding-inline-end":`astryxqpvj4r`,$$css:!0},noEnd:{kwRFfy:`astryxpc6k2p`,$$css:!0},noHeader:{kLKAdn:`astryx81pis9`,"--container-padding-block-start":`astryxzz8v79`,$$css:!0},noFooter:{kGO01o:`astryxon7vh3`,"--container-padding-block-end":`astryx1xjq73n`,$$css:!0},scrollable:{kVQacm:`astryxysyzu8`,$$css:!0},constrainedNoPanelsStart:{kZCmMZ:`astryxhlv5e7`,kE3dHu:null,kpe85a:null,$$css:!0},constrainedNoPanelsEnd:{kwRFfy:`astryx1ahicqp`,kE3dHu:null,kpe85a:null,$$css:!0},constrainedSingleStartPanel:{kwRFfy:`astryxy07wb4`,kE3dHu:null,kpe85a:null,$$css:!0},constrainedSingleEndPanel:{kZCmMZ:`astryxxjme2g`,kE3dHu:null,kpe85a:null,$$css:!0},fullBleed:{kZCmMZ:`astryx1c1uobl`,kwRFfy:`astryxyri2b`,kLKAdn:`astryxexx8yu`,kGO01o:`astryx18d9i69`,"--container-padding-inline-start":`astryxrhngw9`,"--container-padding-inline-end":`astryxjsfl84`,"--container-padding-block-start":`astryx1047aw6`,"--container-padding-block-end":`astryxax9j7h`,$$css:!0}},B.displayName=`LayoutContent`,B.__docgenInfo={description:`Scrollable main content area for Layout. Wraps the primary body content
with automatic scroll containment and context-aware padding.

Already provides its own padding and scroll — don't add padding or overflow
to children. Use \`padding={0}\` if you need edge-to-edge content.

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
Use 'main' only for the primary content area of the page (not in nested layouts).`}},composes:[`Omit`]}}));export{O as a,T as c,z as i,W as n,k as o,M as r,w as s,B as t};