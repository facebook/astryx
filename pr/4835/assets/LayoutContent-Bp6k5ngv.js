import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{t}from"./react-BZJXY1be.js";import{n,t as r}from"./stylex-Dft6gtPK.js";import{n as i,t as a}from"./stack.stylex-CAG894p6.js";import{n as o,t as s}from"./stackItem.stylex-j6rvxd1W.js";import{n as c}from"./mergeProps-JRyAvMxc.js";import{n as l,t as u}from"./themeProps-CREkzZh6.js";import{a as d,i as f,l as p,n as m,o as h,r as g,t as _}from"./padding.stylex-8xQ788av.js";import{t as v}from"./jsx-runtime-DeHZSEgm.js";var y,b;function x(){return(x=e((()=>{y=t(),b=(0,y.createContext)(null),b.displayName=`LayoutAreaContext`})))()}var S,C,w;function T(){return(T=e((()=>{S=t(),C={hasHeader:!1,hasFooter:!1,hasStart:!1,hasEnd:!1},w=(0,S.createContext)(C),w.displayName=`LayoutSlotsContext`})))()}var E,D;function O(){return(O=e((()=>{E=t(),D=(0,E.createContext)(null),D.displayName=`LayoutDividerContext`})))()}function k({area:e,children:t}){return t==null?null:(0,M.jsx)(b,{value:e,children:t})}function A({children:e,content:t,contentWidth:r,defaultHasDividers:a,end:s,footer:u,header:f,height:p=`fill`,padding:m,ref:g,start:_,xstyle:v,className:y,style:b}){let x=p===`fill`,S=t??e,C=(0,j.useMemo)(()=>a==null?null:{defaultHasDividers:a},[a]),T=f!=null,E=u!=null,O=_!=null,A=s!=null,P=(0,j.useMemo)(()=>({hasHeader:T,hasFooter:E,hasStart:O,hasEnd:A}),[T,E,O,A]),L=(0,M.jsx)(w,{value:P,children:(0,M.jsx)(`div`,{ref:g,...c(l(`layout`,{height:p}),n(N.layoutOuter,x?N.fill:N.auto,v),y,b),children:(0,M.jsxs)(`div`,{...n(I,N.layoutInner,...i({direction:`vertical`}),x?N.fill:N.auto,m===0&&N.fullBleed,m!=null&&d[m],m!=null&&h[m],r!=null&&F.contentWidthVar(r)),children:[(0,M.jsx)(k,{area:`header`,children:f}),(0,M.jsxs)(`div`,{...n(...i({direction:`horizontal`}),N.middle,r!=null&&F.contentWidth(r)),children:[(0,M.jsx)(k,{area:`start`,children:_}),(0,M.jsx)(`div`,{...n(...o({size:`fill`})),children:(0,M.jsx)(k,{area:`content`,children:S})}),(0,M.jsx)(k,{area:`end`,children:s})]}),(0,M.jsx)(k,{area:`footer`,children:u})]})})});return C==null?L:(0,M.jsx)(D,{value:C,children:L})}var j,M,N,P,F,I;function L(){return(L=e((()=>{j=t(),r(),x(),T(),O(),a(),s(),u(),f(),M=v(),N={layoutOuter:{keTefX:`astryxojxgvx`,k71WvV:`astryx1fcf3bl`,keoZOQ:`astryx1sa9bsh`,k1K539:`astryx6h7pi7`,$$css:!0},layoutInner:{"--container-padding-inline-start":`astryxrhngw9`,"--container-padding-inline-end":`astryxjsfl84`,"--container-padding-block-start":`astryx1047aw6`,"--container-padding-block-end":`astryxax9j7h`,$$css:!0},fill:{kZKoxP:`astryx12qplqi`,kskxy:`astryxenllk4`,$$css:!0},auto:{kAzted:`astryx1us19tq`,$$css:!0},middle:{kUk6DE:`astryx98rzlu`,kzQI83:null,kmuXW:null,kCS8Yb:null,kAzted:`astryx2lwn1j`,$$css:!0},fullBleed:{"--layout-padding-outer-x":`astryx1wbjvqu`,"--layout-padding-outer-y":`astryxzxxx64`,$$css:!0}},P={kzqmXN:`astryxh8yej3`,kUOVxO:`astryxvueqy4`,keTefX:``,koQZXg:``,k71WvV:``,km5ZXQ:``,$$css:!0},F={contentWidthVar:e=>[{"--layout-content-width":(typeof e==`number`?`${e}px`:e)==null?typeof e==`number`?`${e}px`:e:`astryx4906uf`,$$css:!0},{"--x---layout-content-width":(typeof e==`number`?`${e}px`:e)==null?void 0:typeof e==`number`?`${e}px`:e}],contentWidth:e=>[P,{ks0D6T:(typeof e==`number`?`${e}px`:e)==null?typeof e==`number`?`${e}px`:e:`astryxf68679`,$$css:!0},{"--x-maxWidth":(e=>typeof e==`number`?e+`px`:e??void 0)(typeof e==`number`?`${e}px`:e)}]},I={"astryx-default-marker":`astryx-default-marker`,$$css:!0},A.displayName=`Layout`,A.__docgenInfo={description:`Page shell with header, sidebar(s), content, and footer slots.
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
When not set, nested layouts inherit from their parent context.`},children:{required:!1,tsType:{name:`ReactNode`},description:"Children are a shorthand for the `content` slot:\n`<Layout>{main}</Layout>` is equivalent to `<Layout content={main} />`.\nThe surrounding zones (`header`/`start`/`end`/`footer`) stay explicit\nprops. If both `content` and `children` are provided, `content` wins.\nAccepting children keeps the natural `<Layout>…</Layout>` form from\nrendering a blank shell."}},composes:[`Omit`]}})))()}function R({children:e,isScrollable:t=!0,padding:r,label:i,role:a,xstyle:o,className:s,style:u,ref:d,...f}){let{hasHeader:h,hasFooter:v,hasStart:y,hasEnd:b}=(0,z.use)(w),x=r===0;return(0,B.jsx)(`div`,{ref:d,role:a,"aria-label":i,...c(l(`layout-content`),n(V.content,!y&&!x&&r==null&&V.noStart,!b&&!x&&r==null&&V.noEnd,!h&&!x&&r==null&&V.noHeader,!v&&!x&&r==null&&V.noFooter,t&&V.scrollable,x&&V.fullBleed,r!=null&&p[r],r!=null&&g[r],r!=null&&m[r],r!=null&&_[r],o),s,u),...f,children:e})}var z,B,V;function H(){return(H=e((()=>{z=t(),r(),T(),u(),f(),B=v(),V={content:{kB7OPa:`astryx9f619`,kZKoxP:`astryx5yr21d`,kUk6DE:`astryx98rzlu`,kAzted:`astryx2lwn1j`,kVQacm:`astryx7giv3`,kZCmMZ:`astryxwjyata`,kwRFfy:`astryx1peupej`,kLKAdn:`astryxqty4a astryx1u0vwcr`,kGO01o:`astryxg476vw astryx307h6p`,"--container-padding-inline-start":`astryx408pgh`,"--container-padding-inline-end":`astryxikqloz`,"--container-padding-block-start":`astryxjmgx01`,"--container-padding-block-end":`astryxi9ns85`,$$css:!0},noStart:{kZCmMZ:`astryx139j0dd`,"--container-padding-inline-start":`astryxdvaxxn`,"--container-padding-inline-end":`astryxqpvj4r`,$$css:!0},noEnd:{kwRFfy:`astryxpc6k2p`,$$css:!0},noHeader:{kLKAdn:`astryx81pis9`,"--container-padding-block-start":`astryxzz8v79`,$$css:!0},noFooter:{kGO01o:`astryxon7vh3`,"--container-padding-block-end":`astryx1xjq73n`,$$css:!0},scrollable:{kVQacm:`astryxysyzu8`,$$css:!0},fullBleed:{kZCmMZ:`astryx1c1uobl`,kwRFfy:`astryxyri2b`,kLKAdn:`astryxexx8yu`,kGO01o:`astryx18d9i69`,"--container-padding-inline-start":`astryxrhngw9`,"--container-padding-inline-end":`astryxjsfl84`,"--container-padding-block-start":`astryx1047aw6`,"--container-padding-block-end":`astryxax9j7h`,$$css:!0}},R.displayName=`LayoutContent`,R.__docgenInfo={description:`Scrollable main content area for Layout. Wraps the primary body content
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
Use 'main' only for the primary content area of the page (not in nested layouts).`}},composes:[`Omit`]}})))()}export{D as a,T as c,L as i,b as l,H as n,O as o,A as r,w as s,R as t,x as u};