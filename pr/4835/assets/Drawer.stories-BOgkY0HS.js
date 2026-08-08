import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{t}from"./react-BZJXY1be.js";import{n,t as r}from"./stylex-Dft6gtPK.js";import{n as ee}from"./mergeProps-JRyAvMxc.js";import{n as i}from"./mergeRefs-CPqjs56a.js";import{n as a,t as o}from"./themeProps-CREkzZh6.js";import{n as s,t as c}from"./Text-BfjtEFtP.js";import{t as l}from"./jsx-runtime-DeHZSEgm.js";import{n as u,t as d}from"./Button-BVMvoKVE.js";import{n as f,t as p}from"./Icon-C24cO4CC.js";import{n as m,t as h}from"./useDevWarning-Cdyb6i-B.js";import{n as g,t as _}from"./Divider-D4km6nVj.js";import{n as v,t as y}from"./useScrollLock-DlXUsXsm.js";import{n as b,t as x}from"./CheckboxInput-DJd8Fdr_.js";import{n as S,t as C}from"./IconButton-CAN7iEx1.js";import{n as w,t as T}from"./Heading-CaMVckJS.js";import{n as E,t as D}from"./VStack-C2SBQ4Fm.js";import{n as O,t as k}from"./Section-BQJsZyZZ.js";function A(e,t){return L.push({id:e,close:t}),R+=1,I+R-1}function j(e){let t=L.findIndex(t=>t.id===e);t!==-1&&L.splice(t,1),L.length===0&&(R=0)}function M(e){return L[L.length-1]?.id===e}function N({isOpen:e,onClose:t,side:r=`end`,size:o=400,label:s,hasScrim:c=!0,hasCloseButton:l,isCollapsed:u,onCollapsedChange:d,children:f,xstyle:h,className:g,style:_,ref:y,...b}){let x=(0,P.useRef)(null),S=(0,P.useRef)(null),w=(0,P.useRef)(null),T=(0,P.useId)(),E=(0,P.useRef)(t);(0,P.useEffect)(()=>{E.current=t},[t]);let[D,O]=(0,P.useState)(I),k=r===`top`||r===`bottom`,N=!c&&!k,L=N&&u===!0,R=l??c;m(`Drawer`,'`isCollapsed` is only supported for non-modal drawers (hasScrim={false}) with side="start" or side="end". The prop is ignored.',u!=null&&!N),(0,P.useEffect)(()=>{let t=x.current;if(t){if(S.current&&=(clearTimeout(S.current),null),e){if(!t.open){w.current=document.activeElement,c?t.showModal():t.show();let e=t.querySelector(`[data-autofocus]`);e&&e.focus()}}else if(t.open){let e=window.matchMedia(`(prefers-reduced-motion: reduce)`).matches?10:250;S.current=setTimeout(()=>{t.close(),w.current?.focus(),w.current=null},e)}return()=>{S.current&&=(clearTimeout(S.current),null)}}},[e,c]),(0,P.useEffect)(()=>{let e=x.current;return()=>{e?.open&&e.close()}},[]),(0,P.useEffect)(()=>{if(!e)return;let t=A(T,()=>E.current());return O(t),()=>j(T)},[e,T]),v(e&&c),(0,P.useEffect)(()=>{let n=x.current;if(!n||!e)return;let r=e=>{e.key===`Escape`&&(e.preventDefault(),M(T)&&t())};return n.addEventListener(`keydown`,r),()=>n.removeEventListener(`keydown`,r)},[e,t,T]);let B=(0,P.useCallback)(e=>{e.preventDefault(),M(T)&&t()},[t,T]),V=(0,P.useCallback)(e=>{e.target===e.currentTarget&&c&&t()},[c,t]),U=typeof o==`number`?`${o}px`:o,W={start:z.start,end:z.end,top:z.top,bottom:z.bottom}[r],G={start:z.startOpen,end:z.endOpen,top:z.topOpen,bottom:z.bottomOpen}[r],{open:K,...q}=b;return(0,F.jsxs)(`dialog`,{ref:i(y,x),"aria-label":s,"aria-modal":c?`true`:void 0,onClick:V,onCancel:B,...ee(a(`drawer`,{side:r}),n(z.dialog,W,k?H.blockSize(U):H.inlineSize(U),e&&z.open,e&&G,c?z.scrim:H.stackZ(D),c&&e&&z.scrimOpen,L&&z.collapsedRail,h),g,_),...q,children:[(0,F.jsx)(`div`,{tabIndex:-1,...{0:{className:`astryx1iyjqo2 astryx2lwn1j astryxh8yej3 astryx1odjw0f astryx6ikm8r astryxish69e astryxx69xxh astryx1a2a7pz`},1:{className:`astryx1iyjqo2 astryx2lwn1j astryxh8yej3 astryx1odjw0f astryx6ikm8r astryxish69e astryxx69xxh astryx1a2a7pz astryx1s85apg`}}[!!L<<0],children:f}),L?(0,F.jsx)(`button`,{type:`button`,"aria-label":`Expand ${s}`,onClick:()=>d?.(!1),...{0:{className:`astryxjyslct astryxng3xce astryx1ghz6dp astryx8o8v82 astryx7a5moj astryx1iyjqo2 astryxh8yej3 astryx2lwn1j astryx78zum5 astryx6s0dn4 astryxl56j7k astryx1ypdohk astryxjbqb8w astryxtao9ic astryxv1l7n4 astryxjb2p0i astryxcr08ib astryxmhvcl5 astryx1kq96og astryxuxw1ft astryxb3r6kr astryxlyipyv astryx98t3bc astryx1a2a7pz`},1:{className:`astryxjyslct astryxng3xce astryx1ghz6dp astryx8o8v82 astryx7a5moj astryx1iyjqo2 astryxh8yej3 astryx2lwn1j astryx78zum5 astryx6s0dn4 astryxl56j7k astryx1ypdohk astryxjbqb8w astryxtao9ic astryxv1l7n4 astryxjb2p0i astryxcr08ib astryxmhvcl5 astryx1kq96og astryxuxw1ft astryxb3r6kr astryxlyipyv astryx98t3bc astryx1a2a7pz astryx19jd1h0`}}[(r===`start`)<<0],children:s}):(R||N&&d!=null)&&(0,F.jsxs)(`div`,{className:`astryx10l6tqk astryxctzyg astryx72tfeb astryx78zum5 astryxzye2dw astryx1vjfegm`,children:[N&&d!=null&&(0,F.jsx)(C,{icon:(0,F.jsx)(p,{icon:r===`start`?`chevronLeft`:`chevronRight`,size:`sm`,color:`inherit`}),label:`Collapse ${s}`,variant:`ghost`,onClick:()=>d(!0)}),R&&(0,F.jsx)(C,{icon:(0,F.jsx)(p,{icon:`close`,size:`sm`,color:`inherit`}),label:`Close`,variant:`ghost`,onClick:t})]})]})}var P,F,I,L,R,z,B,V,H;function U(){return(U=e((()=>{P=t(),r(),f(),S(),y(),h(),o(),F=l(),I=1e3,L=[],R=0,z={dialog:{kVAEAm:`astryxixxii4`,kogj98:`astryx1ghz6dp`,kmVPX3:`astryx1717udv`,kQgIW9:`astryx1gs6z28`,ks0D6T:`astryx1x1rfll`,kskxy:`astryx7ab17h`,kB7OPa:`astryx9f619`,kXwgrk:`astryxdt5ytf`,kWkggS:`astryx10xzikg`,kGVxlE:`astryx1kcpxr7`,kVQacm:`astryxb3r6kr`,kZeWKH:`astryxish69e`,kI3sdo:`astryx1a2a7pz`,k1xSpc:`astryx1s85apg`,k1ekBW:`astryx1yw18vd`,kIyJzY:`astryx80gvsz`,kAMwcw:`astryxlr8y92`,kzIqYQ:`astryxd00j3c`,k6CgDc:`astryxzg1mie`,$$css:!0},open:{k1xSpc:`astryx78zum5`,$$css:!0},end:{k87sOh:`astryx13vifvy`,krVfgx:`astryx1ey2m1c`,kt4wiu:`astryxtijo5x`,kLqNvP:`astryxhi6v0a`,kbCHJM:null,kCIrl2:null,kZKoxP:`astryxtdtrs8`,k2ei4v:`astryxgbv0en`,kZ1KPB:null,kWqL5O:null,kVhnKS:`astryx1t7ytsu`,k4WBpm:null,kSWEuD:null,kGJrpR:`astryx1j92z86`,kaZRDh:null,k26BEO:null,k3aq6I:`astryxumwmo6 astryx1df3fe5`,$$css:!0},endOpen:{k3aq6I:`astryxbryuvx astryx1yqmsfc astryx1lymnkk`,$$css:!0},start:{k87sOh:`astryx13vifvy`,krVfgx:`astryx1ey2m1c`,kLqNvP:`astryx1o0tod`,kt4wiu:`astryx1woyocn`,kbCHJM:null,kCIrl2:null,kZKoxP:`astryxtdtrs8`,ke9TFa:`astryxw8tdv1`,kZ1KPB:null,kWqL5O:null,k8ry5P:`astryx18b5jzi`,k4WBpm:null,kSWEuD:null,kBCPoo:`astryx1gejf6u`,kaZRDh:null,k26BEO:null,k3aq6I:`astryx5i6ehr astryxttggg`,$$css:!0},startOpen:{k3aq6I:`astryxbryuvx astryx6mt36l astryx14gflnl`,$$css:!0},top:{kzqmXN:`astryx1o6l61p`,kLqNvP:`astryx1o0tod`,kt4wiu:`astryxtijo5x`,kbCHJM:null,kCIrl2:null,k87sOh:`astryx13vifvy`,krVfgx:`astryxdd4er5`,kt9PQ7:`astryx92x3c3`,kfdmCh:`astryx1q0q8m5`,kL6WhQ:`astryxw8gpjh`,k3aq6I:`astryx105ttfm`,$$css:!0},topOpen:{k3aq6I:`astryxnn1q72 astryxub2912`,$$css:!0},bottom:{kzqmXN:`astryx1o6l61p`,kLqNvP:`astryx1o0tod`,kt4wiu:`astryxtijo5x`,kbCHJM:null,kCIrl2:null,krVfgx:`astryx1ey2m1c`,k87sOh:`astryx80663w`,kEafiO:`astryx11xkdxz`,kPef9Z:`astryx13fuv20`,kLZC3w:`astryx1pc3f07`,k3aq6I:`astryx1weeur4`,$$css:!0},bottomOpen:{k3aq6I:`astryxnn1q72 astryxhbqy3z`,$$css:!0},scrim:{kGyWv1:`astryxnixb3f`,kba3nw:`astryx1abwkk1`,k5sjJv:`astryxph5o2a`,kND0Po:`astryx167zut7`,k9an0g:`astryxft5bk6`,kb4ib:`astryx15h3t91`,kA5Tbj:`astryx1viac0w`,$$css:!0},scrimOpen:{k5sjJv:`astryxb3n6bw astryxxiuuzi`,$$css:!0},collapsedRail:{ks0D6T:`astryx1k2d6hx`,$$css:!0}},B={kzqmXN:`astryx1o6l61p`,$$css:!0},V={kZKoxP:`astryxtdtrs8`,$$css:!0},H={inlineSize:e=>[B,{ks0D6T:e==null?e:`astryxf68679`,$$css:!0},{"--x-maxWidth":(e=>typeof e==`number`?e+`px`:e??void 0)(e)}],blockSize:e=>[V,{kskxy:e==null?e:`astryx1jols5v`,$$css:!0},{"--x-maxHeight":(e=>typeof e==`number`?e+`px`:e??void 0)(e)}],stackZ:e=>[{kY2c9j:e==null?e:`astryxr3buco`,$$css:!0},{"--x-zIndex":e??void 0}]},N.displayName=`Drawer`,N.__docgenInfo={description:`An edge-anchored overlay panel for inspectors, detail views, and sheets.

Slides in from the logical start/end edge (side panel) or the top/bottom
edge (full-width sheet) using the native \`<dialog>\` element: modal with a
scrim by default, or a non-modal inline overlay with \`hasScrim={false}\`.
Escape closes the top-most open drawer; focus returns to the element that
opened the drawer. Non-modal side drawers can collapse to a rail via
\`isCollapsed\`/\`onCollapsedChange\`.

@example
\`\`\`
const [selected, setSelected] = useState(null);
<Drawer
  isOpen={selected != null}
  onClose={() => setSelected(null)}
  label={\`Details: \${selected?.name}\`}>
  <HostDetails host={selected} />
</Drawer>
\`\`\``,methods:[],displayName:`Drawer`,props:{xstyle:{required:!1,tsType:{name:`StyleXStyles`},description:"StyleX styles created via `stylex.create()`. Merged with the component's\nbase styles inside a single `stylex.props()` call for optimal deduplication.\n\n@example\n```\nconst overrides = stylex.create({ root: { marginBottom: 8 } });\n<Component xstyle={overrides.root} />\n```"},ref:{required:!1,tsType:{name:`ReactRef`,raw:`React.Ref<HTMLDialogElement>`,elements:[{name:`HTMLDialogElement`}]},description:`Ref forwarded to the root <dialog> element`},isOpen:{required:!0,tsType:{name:`boolean`},description:"Whether the drawer is open. Fully controlled — pair with `onClose`."},onClose:{required:!0,tsType:{name:`signature`,type:`function`,raw:`() => void`,signature:{arguments:[],return:{name:`void`}}},description:`Called when the drawer requests to be closed
(Escape key, scrim click, built-in close button). The caller owns the
open state. When sibling drawers are open, Escape only closes the
top (last-opened) drawer.`},side:{required:!1,tsType:{name:`union`,raw:`'start' | 'end' | 'top' | 'bottom'`,elements:[{name:`literal`,value:`'start'`},{name:`literal`,value:`'end'`},{name:`literal`,value:`'top'`},{name:`literal`,value:`'bottom'`}]},description:"Which edge the drawer slides from.\n- `'end'` — inline-end edge (right in LTR) — the inspector convention\n- `'start'` — inline-start edge (left in LTR)\n- `'top'` / `'bottom'` — full-width sheets on the block axis\n@default 'end'",defaultValue:{value:`'end'`,computed:!1}},size:{required:!1,tsType:{name:`union`,raw:`number | string`,elements:[{name:`number`},{name:`string`}]},description:`Size budget of the panel along its slide axis: width for
\`side="start"/"end"\`, height for \`side="top"/"bottom"\`. A number is
pixels; a string is any CSS length (\`'50%'\`, \`'40dvh'\`). On viewports
smaller than the budget the drawer fills the axis.
@default 400`,defaultValue:{value:`400`,computed:!1}},label:{required:!0,tsType:{name:`string`},description:`Accessible label for the drawer (required — the drawer has no
built-in heading to derive a name from). Also names the built-in
collapse/expand affordances.`},hasScrim:{required:!1,tsType:{name:`boolean`},description:"Whether to render a modal scrim behind the drawer.\n- `true` (default) — `showModal()`: top layer, focus trap, body scroll\n  lock, click-outside-to-close.\n- `false` — `show()`: non-modal overlay; the page behind stays\n  interactive. Escape still closes while focus is inside the drawer.\n@default true",defaultValue:{value:`true`,computed:!1}},hasCloseButton:{required:!1,tsType:{name:`boolean`},description:`Whether to render the built-in close button in the top-trailing
corner. Defaults to the \`hasScrim\` value: modal drawers get a close
button, non-modal drawers don't.
@default hasScrim`},isCollapsed:{required:!1,tsType:{name:`boolean`},description:'Collapse the drawer to a narrow click-to-expand rail. Only supported\nfor non-modal (`hasScrim={false}`) drawers with `side="start"/"end"`;\nignored (with a dev warning) otherwise. Controlled — pair with\n`onCollapsedChange`.'},onCollapsedChange:{required:!1,tsType:{name:`signature`,type:`function`,raw:`(collapsed: boolean) => void`,signature:{arguments:[{type:{name:`boolean`},name:`collapsed`}],return:{name:`void`}}},description:`Called when the built-in collapse/expand affordances are used.
Providing it renders a collapse toggle next to the close button while
expanded; the collapsed rail always expands on click.`},children:{required:!0,tsType:{name:`ReactNode`},description:"Drawer content. Rendered inside a full-height scrollable area.\nFocus the element with `data-autofocus` on open, if present."},"data-testid":{required:!1,tsType:{name:`string`},description:`Test ID for the root element.`}},composes:[`Omit`]}})))()}var W,G,K,q,J,Y,X,Z,Q;function $(){return($=e((()=>{W=t(),U(),u(),b(),g(),w(),O(),E(),s(),G=l(),K={title:`Lab/Drawer`,component:N,tags:[`autodocs`],parameters:{layout:`centered`},decorators:[e=>(0,G.jsx)(`div`,{style:{width:560,minHeight:360,padding:32},children:(0,G.jsx)(e,{})})]},q=[{id:`web-01`,region:`us-east-1`,status:`Healthy`,cpu:`32%`},{id:`web-02`,region:`us-east-1`,status:`Healthy`,cpu:`41%`},{id:`worker-01`,region:`eu-west-1`,status:`Degraded`,cpu:`87%`}],J=[`us-east-1`,`eu-west-1`,`ap-south-1`],Y={render:()=>{let[e,t]=(0,W.useState)(!1);return(0,G.jsxs)(G.Fragment,{children:[(0,G.jsx)(d,{label:`Open inspector`,onClick:()=>t(!0)}),(0,G.jsx)(N,{isOpen:e,onClose:()=>t(!1),label:`Deployment details`,size:400,children:(0,G.jsx)(k,{padding:4,children:(0,G.jsxs)(D,{gap:4,children:[(0,G.jsxs)(D,{gap:1,children:[(0,G.jsx)(T,{level:3,children:`web-prod-04`}),(0,G.jsx)(c,{type:`supporting`,color:`secondary`,children:`us-east-1, deployed 12 min ago`})]}),(0,G.jsx)(_,{}),(0,G.jsxs)(D,{gap:2,children:[(0,G.jsx)(c,{type:`label`,children:`Status`}),(0,G.jsx)(c,{type:`body`,children:`Healthy - all 6 instances passing readiness checks.`})]}),(0,G.jsxs)(D,{gap:2,children:[(0,G.jsx)(c,{type:`label`,children:`Build`}),(0,G.jsx)(c,{type:`body`,children:`#4821 - main @ 03536f1`})]})]})})})]})}},X={render:()=>{let[e,t]=(0,W.useState)(null),n=q.find(t=>t.id===e);return(0,G.jsxs)(G.Fragment,{children:[(0,G.jsx)(D,{gap:1,children:q.map(e=>(0,G.jsx)(d,{variant:`ghost`,label:`${e.id} / ${e.region}`,onClick:()=>t(e.id)},e.id))}),(0,G.jsx)(N,{isOpen:n!=null,onClose:()=>t(null),label:n?`Host details: ${n.id}`:`Host details`,hasScrim:!1,size:360,children:n!=null&&(0,G.jsx)(k,{padding:4,children:(0,G.jsxs)(D,{gap:4,children:[(0,G.jsxs)(D,{gap:1,children:[(0,G.jsx)(T,{level:3,children:n.id}),(0,G.jsx)(c,{type:`supporting`,color:`secondary`,children:n.region})]}),(0,G.jsx)(_,{}),(0,G.jsxs)(D,{gap:2,children:[(0,G.jsx)(c,{type:`label`,children:`Status`}),(0,G.jsx)(c,{type:`body`,children:n.status}),(0,G.jsx)(c,{type:`label`,children:`CPU`}),(0,G.jsx)(c,{type:`body`,children:n.cpu})]}),(0,G.jsx)(d,{label:`Close inspector`,variant:`secondary`,onClick:()=>t(null)})]})})})]})}},Z={render:()=>{let[e,t]=(0,W.useState)(!1),[n,r]=(0,W.useState)(J.slice(0,1));return(0,G.jsxs)(G.Fragment,{children:[(0,G.jsx)(d,{label:`Filter regions`,onClick:()=>t(!0)}),(0,G.jsx)(N,{isOpen:e,onClose:()=>t(!1),label:`Region filters`,side:`bottom`,size:`40dvh`,children:(0,G.jsx)(k,{padding:4,children:(0,G.jsxs)(D,{gap:4,children:[(0,G.jsxs)(D,{gap:1,children:[(0,G.jsx)(T,{level:3,children:`Filter by region`}),(0,G.jsxs)(c,{type:`supporting`,color:`secondary`,children:[`Showing hosts in `,n.length,` of `,J.length,` regions`]})]}),(0,G.jsx)(D,{gap:2,children:J.map(e=>(0,G.jsx)(x,{label:e,value:n.includes(e),onChange:t=>r(n=>t?[...n,e]:n.filter(t=>t!==e))},e))}),(0,G.jsx)(d,{label:`Apply filters`,onClick:()=>t(!1),"data-autofocus":!0})]})})})]})}},Y.parameters={...Y.parameters,docs:{...Y.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    return <>
        <Button label="Open inspector" onClick={() => setIsOpen(true)} />
        <Drawer isOpen={isOpen} onClose={() => setIsOpen(false)} label="Deployment details" size={400}>
          <Section padding={4}>
            <VStack gap={4}>
              <VStack gap={1}>
                <Heading level={3}>web-prod-04</Heading>
                <Text type="supporting" color="secondary">
                  us-east-1, deployed 12 min ago
                </Text>
              </VStack>
              <Divider />
              <VStack gap={2}>
                <Text type="label">Status</Text>
                <Text type="body">
                  Healthy - all 6 instances passing readiness checks.
                </Text>
              </VStack>
              <VStack gap={2}>
                <Text type="label">Build</Text>
                <Text type="body">#4821 - main @ 03536f1</Text>
              </VStack>
            </VStack>
          </Section>
        </Drawer>
      </>;
  }
}`,...Y.parameters?.docs?.source}}},X.parameters={...X.parameters,docs:{...X.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const selected = HOSTS.find(host => host.id === selectedId);
    return <>
        <VStack gap={1}>
          {HOSTS.map(host => <Button key={host.id} variant="ghost" label={\`\${host.id} / \${host.region}\`} onClick={() => setSelectedId(host.id)} />)}
        </VStack>
        <Drawer isOpen={selected != null} onClose={() => setSelectedId(null)} label={selected ? \`Host details: \${selected.id}\` : 'Host details'} hasScrim={false} size={360}>
          {selected != null && <Section padding={4}>
              <VStack gap={4}>
                <VStack gap={1}>
                  <Heading level={3}>{selected.id}</Heading>
                  <Text type="supporting" color="secondary">
                    {selected.region}
                  </Text>
                </VStack>
                <Divider />
                <VStack gap={2}>
                  <Text type="label">Status</Text>
                  <Text type="body">{selected.status}</Text>
                  <Text type="label">CPU</Text>
                  <Text type="body">{selected.cpu}</Text>
                </VStack>
                <Button label="Close inspector" variant="secondary" onClick={() => setSelectedId(null)} />
              </VStack>
            </Section>}
        </Drawer>
      </>;
  }
}`,...X.parameters?.docs?.source}}},Z.parameters={...Z.parameters,docs:{...Z.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    const [selected, setSelected] = useState<string[]>(REGIONS.slice(0, 1));
    return <>
        <Button label="Filter regions" onClick={() => setIsOpen(true)} />
        <Drawer isOpen={isOpen} onClose={() => setIsOpen(false)} label="Region filters" side="bottom" size="40dvh">
          <Section padding={4}>
            <VStack gap={4}>
              <VStack gap={1}>
                <Heading level={3}>Filter by region</Heading>
                <Text type="supporting" color="secondary">
                  Showing hosts in {selected.length} of {REGIONS.length} regions
                </Text>
              </VStack>
              <VStack gap={2}>
                {REGIONS.map(region => <CheckboxInput key={region} label={region} value={selected.includes(region)} onChange={checked => setSelected(current => checked ? [...current, region] : current.filter(r => r !== region))} />)}
              </VStack>
              <Button label="Apply filters" onClick={() => setIsOpen(false)} data-autofocus />
            </VStack>
          </Section>
        </Drawer>
      </>;
  }
}`,...Z.parameters?.docs?.source}}},Q=[`Showcase`,`RowInspector`,`BottomSheet`]})))()}$();export{Z as BottomSheet,X as RowInspector,Y as Showcase,Q as __namedExportsOrder,K as default};