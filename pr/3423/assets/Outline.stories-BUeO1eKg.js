import{ah as c,aJ as K,a1 as e,a6 as N,af as W,ay as z,a7 as G,T as w}from"./iframe-FpdBIrKz.js";import{p as V,M as Y}from"./Markdown-CwcryN3Z.js";import{B as D}from"./Badge-7Oj3Qh6I.js";import{H as j}from"./Heading-BWSbAVGy.js";import"./preload-helper-Ct5FWWRu.js";import"./CodeBlock-Jau-7_Yd.js";import"./highlightRanges-DBgSijyY.js";import"./CheckboxListItem-BQKj-VDc.js";import"./Field-aJnAslJ5.js";import"./FieldStatus-DWE8xW4u.js";import"./List-CnzJIwpK.js";import"./ListItem-CLB3FG1z.js";import"./Item-BJJK0iYd.js";import"./computeTargetAndRel-BlG0ENK0.js";import"./CheckboxInput-BOJ2WIrk.js";import"./Blockquote-D02XVCzM.js";import"./Table-DIM8B9xv.js";import"./ContextMenu-ROmzu716.js";import"./renderDropdownItems-1NVNacfc.js";import"./Divider-BLixqolk.js";import"./useListFocus-DY855-du.js";import"./EmptyState-CANFv2CH.js";import"./useStreamingText-Cz9Ttkvb.js";import"./Citation-CY10nsot.js";import"./Code-8z4gkKT4.js";const X=new Set(["ArrowUp","ArrowDown","PageUp","PageDown","Home","End"," ","Spacebar"]);function _(t){let n=t?.parentElement??null;for(;n!=null;){const r=window.getComputedStyle(n).overflowY;if((r==="auto"||r==="scroll"||r==="overlay")&&n.scrollHeight>n.clientHeight)return n;n=n.parentElement}return null}function J(t,n){if(t.length===0)return;const s=n!=null?n.getBoundingClientRect().top:0;if(n!=null?n.scrollTop+n.clientHeight>=n.scrollHeight-2:window.innerHeight+window.scrollY>=document.documentElement.scrollHeight-2)return t[t.length-1].id;let l=t[0].id;for(const v of t){const u=document.getElementById(v.id);if(u==null)continue;const p=u.getBoundingClientRect().top,y=Number.parseFloat(window.getComputedStyle(u).scrollMarginTop)||0;if(p<=s+y+1)l=v.id;else break}return l}function Q({activeId:t,items:n,onActiveIdChange:s,rootRef:r}){const l=t!==void 0,[v,u]=c.useState(n[0]?.id),p=c.useRef(t),y=c.useRef(!1),x=c.useRef(null),k=c.useRef(null),b=c.useRef(n);b.current=n;const g=c.useRef(s);g.current=s;const L=n.map(o=>o.id).join(`
`);p.current=l?t:v,c.useEffect(()=>{if(l||typeof window>"u")return;const o=_(r.current),m=o??window;let i=0;const a=()=>{if(i=0,y.current)return;const h=J(b.current,o);h!=null&&h!==p.current&&(p.current=h,u(h),g.current?.(h))},d=()=>{i===0&&(i=requestAnimationFrame(a))};return k.current=a,a(),m.addEventListener("scroll",d,{passive:!0}),window.addEventListener("resize",d,{passive:!0}),()=>{k.current=null,m.removeEventListener("scroll",d),window.removeEventListener("resize",d),i!==0&&cancelAnimationFrame(i)}},[l,L,r]),c.useEffect(()=>()=>{x.current?.()},[]);const $=o=>{l||u(o),s?.(o)},q=c.useCallback(o=>{if(typeof window>"u"){u(o),p.current=o,g.current?.(o);return}y.current=!0,x.current?.();let m=0;const i=()=>{window.removeEventListener("scrollend",a),window.removeEventListener("wheel",d),window.removeEventListener("touchmove",d),window.removeEventListener("keydown",h),m!==0&&(clearTimeout(m),m=0),x.current=null},a=()=>{i(),y.current=!1,u(o),p.current=o,g.current?.(o)},d=()=>{i(),y.current=!1,k.current?.()},h=Z=>{X.has(Z.key)&&d()};window.addEventListener("scrollend",a,{once:!0}),window.addEventListener("wheel",d,{passive:!0}),window.addEventListener("touchmove",d,{passive:!0}),window.addEventListener("keydown",h),m=window.setTimeout(a,1200),x.current=i},[]);return{activeId:l?t:v,setActiveId:$,lockActiveId:q}}const C={root:{k1xSpc:"astryx78zum5",kXwgrk:"astryx1q0g3np",kVAEAm:"astryx1n2onr6",kOIVth:"astryx1lsbc85",kzqmXN:"astryxh8yej3",$$css:!0},activeAnchor:{k48fcG:"astryx7dpabl",$$css:!0},link:{kGNEyG:"astryx6s0dn4",kaIpWk:"astryxh6dtrn",kB7OPa:"astryx9f619",kMwMTN:"astryxv1l7n4",kkrTdU:"astryx1ypdohk",k1xSpc:"astryx78zum5",k63SB2:"astryx1sodnla",kI3sdo:"astryx1a2a7pz",kVAEAm:"astryx1n2onr6",k9WMMc:"astryx1yc453h",kybGjl:"astryx1hl2dhg",kIyJzY:"astryxuedmi6",k1ekBW:"astryxs2xxs2",kAMwcw:"astryxlr8y92",kzqmXN:"astryxh8yej3",kGuDYH:"astryxjm74w1",kLWn49:"astryxw6l6zx",kHE3J0:"astryxe9uy6x",krNwJM:"astryx140uwzg",kSReZ0:"astryxyxi2l3",k3Woio:"astryx17nn4n9",kiEn40:"astryx7s97pk",$$css:!0},activeLink:{kMwMTN:"astryx1tgivj0",k63SB2:"astryx2mo6ok",$$css:!0}},ee={compact:{k8WAf4:"astryxu0wf1k",kLKAdn:null,kGO01o:null,kwRFfy:"astryx1djylfy",kE3dHu:null,kpe85a:null,$$css:!0},default:{k8WAf4:"astryxce4md1",kLKAdn:null,kGO01o:null,kwRFfy:"astryx1djylfy",kE3dHu:null,kpe85a:null,$$css:!0}},A={level1:{kZCmMZ:"astryx126nfab",kE3dHu:null,kpe85a:null,$$css:!0},level2:{kZCmMZ:"astryxchaq28",kE3dHu:null,kpe85a:null,$$css:!0},level3:{kZCmMZ:"astryxc8afjc",kE3dHu:null,kpe85a:null,$$css:!0},level4:{kZCmMZ:"astryx19b7t93",kE3dHu:null,kpe85a:null,$$css:!0}};function te(t){switch(Math.max(1,Math.min(4,t-1||1))){case 1:return A.level1;case 2:return A.level2;case 3:return A.level3;default:return A.level4}}function f({items:t,activeId:n,onActiveIdChange:s,label:r="Table of contents",density:l="default",xstyle:v,className:u,style:p,ref:y,"data-testid":x,...k}){const b=c.useRef(null),g=K(),L=n!==void 0,{activeId:$,setActiveId:q,lockActiveId:o}=Q({activeId:n,items:t,onActiveIdChange:s,rootRef:b}),m=i=>a=>{const d=document.getElementById(i);d==null||a.defaultPrevented||a.metaKey||a.altKey||a.ctrlKey||a.shiftKey||(a.preventDefault(),window.history.pushState(null,"",`#${i}`),L?q(i):o(i),d.scrollIntoView({behavior:"smooth",block:"start"}))};return e.jsxs("nav",{...k,ref:G(b,y),"aria-label":r,"data-testid":x,...N(z("outline",{density:l}),W(C.root,v),u,p),children:[e.jsx("ul",{className:"astryx78zum5 astryxdt5ytf astryx1lsbc85 astryx1ghz6dp astryx1717udv astryxe8uvvx astryx98rzlu astryxeuugli",role:"list",children:t.map(i=>{const a=i.id===$;return e.jsx("li",{className:"astryx3ct3a4 astryx1ghz6dp astryx1717udv",role:"listitem",children:e.jsx(g,{href:`#${i.id}`,"aria-current":a?"true":void 0,onClick:m(i.id),...N(z("outline-item",{active:a?"active":null,level:i.level}),W(C.link,ee[l],te(i.level),a&&C.activeLink,a&&C.activeAnchor)),children:e.jsx("span",{className:"astryxb3r6kr astryxlyipyv astryxuxw1ft",children:i.label})})},i.id)})}),e.jsx("div",{className:"astryx1n2onr6 astryxfo62xy astryx2lah0s astryx1clqncf","aria-hidden":"true",children:e.jsx("span",{className:"astryx10l6tqk astryx13vifvy astryx1ey2m1c astryx1o0tod astryxfo62xy astryx1m4xfpy astryxjspbzw astryx47corl"})}),e.jsx("span",{...N(z("outline-indicator"),{className:"astryx10l6tqk astryx1o0tod astryxfo62xy astryxowkcby astryxjspbzw astryx47corl astryx1vjfegm astryx1tsffl5 astryx1ltwjim astryx1qjb5ga astryx1xuz8iz astryxkvfbh3 astryxlr8y92"}),"aria-hidden":"true"})]})}f.displayName="Outline";f.__docgenInfo={description:`A table-of-contents navigation component for document headings.

Outline accepts a flat \`items\` array and renders anchor links with
indentation based on each heading level. Features a sliding indicator
track that animates to the active item.

When \`activeId\` is omitted, it tracks scroll position and marks the last
heading whose top has passed its activation line (its scroll-margin-top)
active — defaulting to the first item at the top and the last at the bottom.

@example
\`\`\`
<Outline
  items={[
    {id: 'intro', label: 'Introduction', level: 1},
    {id: 'features', label: 'Features', level: 2},
    {id: 'api', label: 'API Reference', level: 1},
  ]}
/>
\`\`\``,methods:[],displayName:"Outline",props:{xstyle:{required:!1,tsType:{name:"StyleXStyles"},description:"StyleX styles created via `stylex.create()`. Merged with the component's\nbase styles inside a single `stylex.props()` call for optimal deduplication.\n\n@example\n```\nconst overrides = stylex.create({ root: { marginBottom: 8 } });\n<Component xstyle={overrides.root} />\n```"},ref:{required:!1,tsType:{name:"ReactRef",raw:"React.Ref<HTMLElement>",elements:[{name:"HTMLElement"}]},description:"Ref forwarded to the root nav element."},items:{required:!0,tsType:{name:"Array",elements:[{name:"OutlineItem"}],raw:"OutlineItem[]"},description:"Ordered list of heading items to render."},activeId:{required:!1,tsType:{name:"string"},description:"ID of the currently active item. When provided, disables built-in scroll-spy."},onActiveIdChange:{required:!1,tsType:{name:"signature",type:"function",raw:"(id: string) => void",signature:{arguments:[{type:{name:"string"},name:"id"}],return:{name:"void"}}},description:"Called when the active item changes from scroll-spy or click."},label:{required:!1,tsType:{name:"string"},description:"Accessible label for the nav landmark. @default 'Table of contents'",defaultValue:{value:"'Table of contents'",computed:!1}},density:{required:!1,tsType:{name:"union",raw:"'default' | 'compact'",elements:[{name:"literal",value:"'default'"},{name:"literal",value:"'compact'"}]},description:`Density variant controlling item padding.
- 'default': Standard spacing (default)
- 'compact': Reduced spacing for dense UIs
@default 'default'`,defaultValue:{value:"'default'",computed:!1}},"data-testid":{required:!1,tsType:{name:"string"},description:"Test ID for testing frameworks."}},composes:["Omit"]};function U(t){return t.map(n=>{switch(n.type){case"text":case"code":return n.content;case"bold":case"italic":case"strikethrough":case"link":return U(n.children);case"image":return n.alt;case"citation":case"break":return""}}).join("")}function ne(t){return t.trim().toLowerCase().replace(/['"]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"")}function se(t,n){const s=t||"section",r=n.get(s)??0;return n.set(s,r+1),r===0?s:`${s}-${r}`}function re(t){const n=new Map;return V(t).filter(s=>s.type==="heading").map(s=>{const r=U(s.children).trim();return{id:se(ne(r),n),label:r,level:s.level}})}function ie(t){return c.useMemo(()=>re(t),[t])}function B(t){return t==null?[]:Array.from(t.querySelectorAll("h1,h2,h3,h4,h5,h6")).map(n=>{const s=Number(n.tagName.slice(1)),r=n.textContent?.trim()??"";return{id:n.id,label:r,level:s}}).filter(n=>n.id!==""&&n.label!=="")}function ae(t){const[n,s]=c.useState(()=>B(t.current));return c.useEffect(()=>{const r=t.current;if(s(B(r)),r==null||typeof MutationObserver>"u")return;const l=new MutationObserver(()=>{s(B(r))});return l.observe(r,{childList:!0,subtree:!0,characterData:!0,attributes:!0,attributeFilter:["id"]}),()=>{l.disconnect()}},[t]),n}const Re={title:"Core/Outline",component:f,tags:["autodocs"],argTypes:{label:{control:"text",description:"Accessible label for the nav landmark"},activeId:{control:"text",description:"Controlled active item id"},density:{control:"radio",options:["default","compact"],description:"Density variant"}}},R=[{id:"overview",label:"Overview",level:2},{id:"installation",label:"Installation",level:2},{id:"theming",label:"Theming",level:2},{id:"tokens",label:"Tokens",level:3},{id:"component-overrides",label:"Component overrides",level:3},{id:"accessibility",label:"Accessibility",level:2}],F=["## Overview","","Astryx gives teams a consistent foundation for internal product surfaces.","","## Installation","","Install the package and wrap the app in an Theme provider.","","### Package setup","","Import components from their component subpaths for clear ownership.","","### Theme setup","","Use a built theme in production so component overrides are present at first paint.","","## Accessibility","","Components include semantic roles, labels, and focus behavior where applicable."].join(`
`);function P(t){return typeof t=="string"||typeof t=="number"?String(t):Array.isArray(t)?t.map(P).join(""):""}function oe(t){return t.trim().toLowerCase().replace(/['\u201C\u201D"]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"")||"section"}const I={args:{items:R}},E={args:{items:R,activeId:"tokens"}},T={args:{items:R,activeId:"installation",density:"compact"}},M={render:()=>e.jsxs("div",{style:{display:"grid",gridTemplateColumns:"minmax(0, 1fr) 220px",gap:32,maxWidth:960},children:[e.jsxs("article",{style:{display:"grid",gap:24},children:[e.jsxs("section",{children:[e.jsx("h2",{id:"overview",children:"Overview"}),e.jsx("p",{children:"Astryx components provide consistent interaction, styling, and theme behavior for internal tools."})]}),e.jsxs("section",{children:[e.jsx("h2",{id:"installation",children:"Installation"}),e.jsx("p",{children:"Install the package, wrap the app with Theme, and import components from their subpaths."})]}),e.jsxs("section",{children:[e.jsx("h2",{id:"theming",children:"Theming"}),e.jsx("p",{children:"Themes define semantic tokens and component overrides without changing app code."}),e.jsx("h3",{id:"tokens",children:"Tokens"}),e.jsx("p",{children:"Use semantic color, spacing, typography, radius, elevation, and motion tokens."}),e.jsx("h3",{id:"component-overrides",children:"Component overrides"}),e.jsx("p",{children:"Component overrides target the stable Astryx selector surface emitted by each component: astryx-* classes plus data-* prop reflections."})]}),e.jsxs("section",{children:[e.jsx("h2",{id:"accessibility",children:"Accessibility"}),e.jsx("p",{children:"Components include landmark, keyboard, focus, and ARIA behavior where applicable."})]})]}),e.jsx("aside",{style:{position:"sticky",top:24,alignSelf:"start"},children:e.jsx(f,{items:R})})]})},O={render:()=>{const t=ie(F);return e.jsxs("div",{style:{display:"grid",gridTemplateColumns:"minmax(0, 1fr) 220px",gap:32,maxWidth:960},children:[e.jsx(Y,{components:{heading:({level:n,children:s})=>{const r=`h${n}`;return e.jsx(r,{id:oe(P(s)),children:s})}},children:F}),e.jsx("aside",{style:{position:"sticky",top:24,alignSelf:"start"},children:e.jsx(f,{items:t})})]})}},H={render:()=>{const t=c.useRef(null),n=ae(t);return e.jsxs("div",{style:{display:"grid",gridTemplateColumns:"minmax(0, 1fr) 220px",gap:32,maxWidth:960},children:[e.jsxs("article",{ref:t,style:{display:"grid",gap:24},children:[e.jsxs("section",{children:[e.jsx(j,{id:"account-settings",level:2,children:"Account settings"}),e.jsx(w,{type:"body",children:"Manage profile, authentication, and workspace preferences."}),e.jsxs("div",{style:{display:"flex",gap:8,marginTop:12},children:[e.jsx(D,{variant:"success",label:"Active"}),e.jsx(D,{variant:"neutral",label:"Workspace"})]})]}),e.jsxs("section",{children:[e.jsx(j,{id:"notifications",level:2,children:"Notifications"}),e.jsx(w,{type:"body",children:"Choose which product events should notify the team."}),e.jsx(j,{id:"email-alerts",level:3,children:"Email alerts"}),e.jsx(w,{type:"body",children:"Use email for low-frequency summaries and approvals."}),e.jsx(j,{id:"push-alerts",level:3,children:"Push alerts"}),e.jsx(w,{type:"body",children:"Use push for time-sensitive updates and incidents."})]}),e.jsxs("section",{children:[e.jsx(j,{id:"billing",level:2,children:"Billing"}),e.jsx(w,{type:"body",children:"Review invoices, payment methods, and usage limits."})]})]}),e.jsx("aside",{style:{position:"sticky",top:24,alignSelf:"start"},children:e.jsx(f,{items:n})})]})}},S={render:()=>{const t=[{id:"chapter-1",label:"Chapter 1",level:1},{id:"section-1-1",label:"Section 1.1",level:2},{id:"subsection-1-1-1",label:"Subsection 1.1.1",level:3},{id:"subsection-1-1-2",label:"Subsection 1.1.2",level:3},{id:"section-1-2",label:"Section 1.2",level:2},{id:"chapter-2",label:"Chapter 2",level:1},{id:"section-2-1",label:"Section 2.1",level:2}];return e.jsx("div",{style:{width:240},children:e.jsx(f,{items:t,activeId:"subsection-1-1-1"})})}};I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{
  args: {
    items: outlineItems
  }
}`,...I.parameters?.docs?.source}}};E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  args: {
    items: outlineItems,
    activeId: 'tokens'
  }
}`,...E.parameters?.docs?.source}}};T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  args: {
    items: outlineItems,
    activeId: 'installation',
    density: 'compact'
  }
}`,...T.parameters?.docs?.source},description:{story:"Compact density variant — reduced spacing for dense UIs",...T.parameters?.docs?.description}}};M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) 220px',
    gap: 32,
    maxWidth: 960
  }}>
      <article style={{
      display: 'grid',
      gap: 24
    }}>
        <section>
          <h2 id="overview">Overview</h2>
          <p>
            Astryx components provide consistent interaction, styling, and theme
            behavior for internal tools.
          </p>
        </section>
        <section>
          <h2 id="installation">Installation</h2>
          <p>
            Install the package, wrap the app with Theme, and import
            components from their subpaths.
          </p>
        </section>
        <section>
          <h2 id="theming">Theming</h2>
          <p>
            Themes define semantic tokens and component overrides without
            changing app code.
          </p>
          <h3 id="tokens">Tokens</h3>
          <p>
            Use semantic color, spacing, typography, radius, elevation, and
            motion tokens.
          </p>
          <h3 id="component-overrides">Component overrides</h3>
          <p>
            Component overrides target the stable Astryx selector surface emitted
            by each component: astryx-* classes plus data-* prop reflections.
          </p>
        </section>
        <section>
          <h2 id="accessibility">Accessibility</h2>
          <p>
            Components include landmark, keyboard, focus, and ARIA behavior
            where applicable.
          </p>
        </section>
      </article>
      <aside style={{
      position: 'sticky',
      top: 24,
      alignSelf: 'start'
    }}>
        <Outline items={outlineItems} />
      </aside>
    </div>
}`,...M.parameters?.docs?.source}}};O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
  render: () => {
    const items = useOutlineFromMarkdown(markdownContent);
    return <div style={{
      display: 'grid',
      gridTemplateColumns: 'minmax(0, 1fr) 220px',
      gap: 32,
      maxWidth: 960
    }}>
        <Markdown components={{
        heading: ({
          level,
          children
        }) => {
          const Tag = \`h\${level}\` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
          return <Tag id={storySlug(nodeText(children))}>{children}</Tag>;
        }
      }}>
          {markdownContent}
        </Markdown>
        <aside style={{
        position: 'sticky',
        top: 24,
        alignSelf: 'start'
      }}>
          <Outline items={items} />
        </aside>
      </div>;
  }
}`,...O.parameters?.docs?.source}}};H.parameters={...H.parameters,docs:{...H.parameters?.docs,source:{originalSource:`{
  render: () => {
    const contentRef = useRef<HTMLElement | null>(null);
    const items = useOutlineFromDOM(contentRef);
    return <div style={{
      display: 'grid',
      gridTemplateColumns: 'minmax(0, 1fr) 220px',
      gap: 32,
      maxWidth: 960
    }}>
        <article ref={contentRef} style={{
        display: 'grid',
        gap: 24
      }}>
          <section>
            <Heading id="account-settings" level={2}>
              Account settings
            </Heading>
            <Text type="body">
              Manage profile, authentication, and workspace preferences.
            </Text>
            <div style={{
            display: 'flex',
            gap: 8,
            marginTop: 12
          }}>
              <Badge variant="success" label="Active" />
              <Badge variant="neutral" label="Workspace" />
            </div>
          </section>
          <section>
            <Heading id="notifications" level={2}>
              Notifications
            </Heading>
            <Text type="body">
              Choose which product events should notify the team.
            </Text>
            <Heading id="email-alerts" level={3}>
              Email alerts
            </Heading>
            <Text type="body">
              Use email for low-frequency summaries and approvals.
            </Text>
            <Heading id="push-alerts" level={3}>
              Push alerts
            </Heading>
            <Text type="body">
              Use push for time-sensitive updates and incidents.
            </Text>
          </section>
          <section>
            <Heading id="billing" level={2}>
              Billing
            </Heading>
            <Text type="body">
              Review invoices, payment methods, and usage limits.
            </Text>
          </section>
        </article>
        <aside style={{
        position: 'sticky',
        top: 24,
        alignSelf: 'start'
      }}>
          <Outline items={items} />
        </aside>
      </div>;
  }
}`,...H.parameters?.docs?.source}}};S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  render: () => {
    const items: OutlineItem[] = [{
      id: 'chapter-1',
      label: 'Chapter 1',
      level: 1
    }, {
      id: 'section-1-1',
      label: 'Section 1.1',
      level: 2
    }, {
      id: 'subsection-1-1-1',
      label: 'Subsection 1.1.1',
      level: 3
    }, {
      id: 'subsection-1-1-2',
      label: 'Subsection 1.1.2',
      level: 3
    }, {
      id: 'section-1-2',
      label: 'Section 1.2',
      level: 2
    }, {
      id: 'chapter-2',
      label: 'Chapter 2',
      level: 1
    }, {
      id: 'section-2-1',
      label: 'Section 2.1',
      level: 2
    }];
    return <div style={{
      width: 240
    }}>
        <Outline items={items} activeId="subsection-1-1-1" />
      </div>;
  }
}`,...S.parameters?.docs?.source},description:{story:"Deep nesting with multiple indent levels",...S.parameters?.docs?.description}}};const Le=["Basic","Controlled","Compact","WithDocument","ExtractFromMarkdown","ExtractFromHTML","DeepNesting"];export{I as Basic,T as Compact,E as Controlled,S as DeepNesting,H as ExtractFromHTML,O as ExtractFromMarkdown,M as WithDocument,Le as __namedExportsOrder,Re as default};
