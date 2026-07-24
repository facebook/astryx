import{i as e,s as t}from"./preload-helper-CT_b8DTk.js";import{t as n}from"./react-B7Te67-h.js";import{t as r}from"./jsx-runtime-DqZldVDK.js";import{t as i}from"./Text-Iat6xWeA.js";import{n as a,t as o}from"./Badge-x089lqwb.js";import{t as s}from"./Heading-D-Ri_Mjs.js";import{t as c}from"./Text-BUJwo4gL.js";import{Cr as l,Sr as u,d,g as f,h as p,p as m}from"./iframe-BPhJd9TG.js";function h(e){return typeof e==`string`||typeof e==`number`?String(e):Array.isArray(e)?e.map(h).join(``):``}function g(e){return e.trim().toLowerCase().replace(/['\u201C\u201D"]/g,``).replace(/[^a-z0-9]+/g,`-`).replace(/^-+|-+$/g,``)||`section`}var _,v,y,b,x,S,C,w,T,E,D,O,k,A,j,M,N;e((()=>{_=t(n()),d(),o(),u(),c(),v=r(),y={title:`Core/Outline`,component:f,tags:[`autodocs`],argTypes:{label:{control:`text`,description:`Accessible label for the nav landmark`},activeId:{control:`text`,description:`Controlled active item id`},density:{control:`radio`,options:[`default`,`compact`],description:`Density variant`}}},b=[{id:`overview`,label:`Overview`,level:2},{id:`installation`,label:`Installation`,level:2},{id:`theming`,label:`Theming`,level:2},{id:`tokens`,label:`Tokens`,level:3},{id:`component-overrides`,label:`Component overrides`,level:3},{id:`accessibility`,label:`Accessibility`,level:2}],x=48,S=[`## Overview`,``,`Astryx gives teams a consistent foundation for internal product surfaces.`,``,`## Installation`,``,`Install the package and wrap the app in an Theme provider.`,``,`### Package setup`,``,`Import components from their component subpaths for clear ownership.`,``,`### Theme setup`,``,`Use a built theme in production so component overrides are present at first paint.`,``,`## Accessibility`,``,`Components include semantic roles, labels, and focus behavior where applicable.`].join(`
`),C={args:{items:b}},w={args:{items:b,activeId:`tokens`}},T={args:{items:b,activeId:`installation`,density:`compact`}},E={render:()=>(0,v.jsxs)(`div`,{style:{display:`grid`,gridTemplateColumns:`minmax(0, 1fr) 220px`,gap:32,maxWidth:960},children:[(0,v.jsxs)(`article`,{style:{display:`grid`,gap:24},children:[(0,v.jsxs)(`section`,{children:[(0,v.jsx)(`h2`,{id:`overview`,children:`Overview`}),(0,v.jsx)(`p`,{children:`Astryx components provide consistent interaction, styling, and theme behavior for internal tools.`})]}),(0,v.jsxs)(`section`,{children:[(0,v.jsx)(`h2`,{id:`installation`,children:`Installation`}),(0,v.jsx)(`p`,{children:`Install the package, wrap the app with Theme, and import components from their subpaths.`})]}),(0,v.jsxs)(`section`,{children:[(0,v.jsx)(`h2`,{id:`theming`,children:`Theming`}),(0,v.jsx)(`p`,{children:`Themes define semantic tokens and component overrides without changing app code.`}),(0,v.jsx)(`h3`,{id:`tokens`,children:`Tokens`}),(0,v.jsx)(`p`,{children:`Use semantic color, spacing, typography, radius, elevation, and motion tokens.`}),(0,v.jsx)(`h3`,{id:`component-overrides`,children:`Component overrides`}),(0,v.jsx)(`p`,{children:`Component overrides target the stable Astryx selector surface emitted by each component: astryx-* classes plus data-* prop reflections.`})]}),(0,v.jsxs)(`section`,{children:[(0,v.jsx)(`h2`,{id:`accessibility`,children:`Accessibility`}),(0,v.jsx)(`p`,{children:`Components include landmark, keyboard, focus, and ARIA behavior where applicable.`})]})]}),(0,v.jsx)(`aside`,{style:{position:`sticky`,top:24,alignSelf:`start`},children:(0,v.jsx)(f,{items:b})})]})},D={render:()=>{let e=p(S);return(0,v.jsxs)(`div`,{style:{display:`grid`,gridTemplateColumns:`minmax(0, 1fr) 220px`,gap:32,maxWidth:960},children:[(0,v.jsx)(l,{components:{heading:({level:e,children:t})=>(0,v.jsx)(`h${e}`,{id:g(h(t)),children:t})},children:S}),(0,v.jsx)(`aside`,{style:{position:`sticky`,top:24,alignSelf:`start`},children:(0,v.jsx)(f,{items:e})})]})}},O={render:()=>{let e=(0,_.useRef)(null),t=m(e);return(0,v.jsxs)(`div`,{style:{display:`grid`,gridTemplateColumns:`minmax(0, 1fr) 220px`,gap:32,maxWidth:960},children:[(0,v.jsxs)(`article`,{ref:e,style:{display:`grid`,gap:24},children:[(0,v.jsxs)(`section`,{children:[(0,v.jsx)(s,{id:`account-settings`,level:2,children:`Account settings`}),(0,v.jsx)(i,{type:`body`,children:`Manage profile, authentication, and workspace preferences.`}),(0,v.jsxs)(`div`,{style:{display:`flex`,gap:8,marginTop:12},children:[(0,v.jsx)(a,{variant:`success`,label:`Active`}),(0,v.jsx)(a,{variant:`neutral`,label:`Workspace`})]})]}),(0,v.jsxs)(`section`,{children:[(0,v.jsx)(s,{id:`notifications`,level:2,children:`Notifications`}),(0,v.jsx)(i,{type:`body`,children:`Choose which product events should notify the team.`}),(0,v.jsx)(s,{id:`email-alerts`,level:3,children:`Email alerts`}),(0,v.jsx)(i,{type:`body`,children:`Use email for low-frequency summaries and approvals.`}),(0,v.jsx)(s,{id:`push-alerts`,level:3,children:`Push alerts`}),(0,v.jsx)(i,{type:`body`,children:`Use push for time-sensitive updates and incidents.`})]}),(0,v.jsxs)(`section`,{children:[(0,v.jsx)(s,{id:`billing`,level:2,children:`Billing`}),(0,v.jsx)(i,{type:`body`,children:`Review invoices, payment methods, and usage limits.`})]})]}),(0,v.jsx)(`aside`,{style:{position:`sticky`,top:24,alignSelf:`start`},children:(0,v.jsx)(f,{items:t})})]})}},k={render:()=>(0,v.jsx)(`div`,{style:{width:240},children:(0,v.jsx)(f,{items:[{id:`chapter-1`,label:`Chapter 1`,level:1},{id:`section-1-1`,label:`Section 1.1`,level:2},{id:`subsection-1-1-1`,label:`Subsection 1.1.1`,level:3},{id:`subsection-1-1-2`,label:`Subsection 1.1.2`,level:3},{id:`section-1-2`,label:`Section 1.2`,level:2},{id:`chapter-2`,label:`Chapter 2`,level:1},{id:`section-2-1`,label:`Section 2.1`,level:2}],activeId:`subsection-1-1-1`})})},A={render:()=>{let e=(0,_.useRef)(null);return(0,v.jsxs)(`div`,{style:{display:`grid`,gridTemplateColumns:`minmax(0, 1fr) 220px`,gap:32,maxWidth:960},children:[(0,v.jsxs)(`div`,{ref:e,style:{overflowY:`auto`,height:360,border:`1px solid rgba(128,128,128,0.3)`,borderRadius:8,position:`relative`},children:[(0,v.jsx)(`div`,{style:{position:`sticky`,top:0,height:x,boxSizing:`border-box`,padding:`0 16px`,display:`flex`,alignItems:`center`,background:`var(--color-surface, #fff)`,borderBottom:`1px solid rgba(128,128,128,0.3)`,zIndex:1},children:(0,v.jsx)(a,{label:`Sticky header (${x}px)`})}),(0,v.jsx)(`div`,{style:{padding:`0 16px 16px`},children:b.map(e=>(0,v.jsxs)(`section`,{children:[(0,v.jsx)(s,{id:e.id,level:e.level===2?2:3,style:{scrollMarginTop:8},children:e.label}),(0,v.jsx)(i,{children:`Scroll the pane. The outline tracks the pane's scroll position, not the window's.`}),(0,v.jsx)(`div`,{style:{height:160}})]},e.id))})]}),(0,v.jsx)(`aside`,{style:{alignSelf:`start`},children:(0,v.jsx)(f,{items:b,scrollContainerRef:e,offset:x})})]})}},j={render:()=>{let[e,t]=(0,_.useState)(`idle`),[n,r]=(0,_.useState)(null);return(0,v.jsxs)(`div`,{style:{display:`grid`,gridTemplateColumns:`minmax(0, 1fr) 220px`,gap:32,maxWidth:960},children:[(0,v.jsx)(`article`,{children:b.map(e=>(0,v.jsxs)(`section`,{children:[(0,v.jsx)(s,{id:e.id,level:e.level===2?2:3,style:{scrollMarginTop:16,transition:`background-color 600ms`,backgroundColor:n===e.id?`var(--color-overlay-hover, rgba(128,128,128,0.2))`:`transparent`},children:e.label}),(0,v.jsx)(`div`,{style:{height:320}})]},e.id))}),(0,v.jsxs)(`aside`,{style:{position:`sticky`,top:24,alignSelf:`start`},children:[(0,v.jsx)(a,{label:e}),(0,v.jsx)(f,{items:b,onNavigateStart:e=>{r(null),t(`scrolling to ${e}`)},onNavigateEnd:e=>{r(e),t(`arrived at ${e}`)}})]})]})}},M={render:()=>(0,v.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:16,width:240},children:[(0,v.jsx)(`button`,{type:`button`,children:`Focus me, then press Tab`}),(0,v.jsx)(f,{items:b}),(0,v.jsx)(`button`,{type:`button`,children:`Tab again lands here`})]})},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  args: {
    items: outlineItems
  }
}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  args: {
    items: outlineItems,
    activeId: 'tokens'
  }
}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  args: {
    items: outlineItems,
    activeId: 'installation',
    density: 'compact'
  }
}`,...T.parameters?.docs?.source},description:{story:`Compact density variant — reduced spacing for dense UIs`,...T.parameters?.docs?.description}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
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
            Install the package, wrap the app with Theme, and import components
            from their subpaths.
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
            Component overrides target the stable Astryx selector surface
            emitted by each component: astryx-* classes plus data-* prop
            reflections.
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
}`,...E.parameters?.docs?.source}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
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
}`,...D.parameters?.docs?.source}}},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
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
}`,...O.parameters?.docs?.source}}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
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
}`,...k.parameters?.docs?.source},description:{story:`Deep nesting with multiple indent levels`,...k.parameters?.docs?.description}}},A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  render: () => {
    const scrollContainerRef = useRef<HTMLDivElement | null>(null);
    return <div style={{
      display: 'grid',
      gridTemplateColumns: 'minmax(0, 1fr) 220px',
      gap: 32,
      maxWidth: 960
    }}>
        <div ref={scrollContainerRef} style={{
        overflowY: 'auto',
        height: 360,
        border: '1px solid rgba(128,128,128,0.3)',
        borderRadius: 8,
        position: 'relative'
      }}>
          <div style={{
          position: 'sticky',
          top: 0,
          height: STICKY_HEADER_HEIGHT,
          boxSizing: 'border-box',
          padding: '0 16px',
          display: 'flex',
          alignItems: 'center',
          background: 'var(--color-surface, #fff)',
          borderBottom: '1px solid rgba(128,128,128,0.3)',
          zIndex: 1
        }}>
            <Badge label={\`Sticky header (\${STICKY_HEADER_HEIGHT}px)\`} />
          </div>
          <div style={{
          padding: '0 16px 16px'
        }}>
            {outlineItems.map(item => <section key={item.id}>
                {/* scroll-margin-top must sit on the element the outline
                    targets — the heading carries the id, so the browser reads
                    it from there, not from a wrapper. */}
                <Heading id={item.id} level={item.level === 2 ? 2 : 3} style={{
              scrollMarginTop: 8
            }}>
                  {item.label}
                </Heading>
                <Text>
                  Scroll the pane. The outline tracks the pane&apos;s scroll
                  position, not the window&apos;s.
                </Text>
                <div style={{
              height: 160
            }} />
              </section>)}
          </div>
        </div>
        <aside style={{
        alignSelf: 'start'
      }}>
          <Outline items={outlineItems} scrollContainerRef={scrollContainerRef} offset={STICKY_HEADER_HEIGHT} />
        </aside>
      </div>;
  }
}`,...A.parameters?.docs?.source},description:{story:`Scroll-spy scoped to a custom scroll container, under a sticky header.

The content scrolls inside the pane, not the viewport — so the outline would
auto-detect the wrong scroll root and its highlight would never move.
\`scrollContainerRef\` scopes tracking to the pane.

\`offset\` is the height of the sticky header covering the top of that pane.
It moves the activation line *and* the scroll landing together, so clicking
an item parks its heading just below the header instead of hidden underneath
it — and the heading activates at the same line it lands on. The heading's
own \`scroll-margin-top\` adds the breathing room below the header (8px here),
so the two compose: 48 + 8 = 56px.`,...A.parameters?.docs?.description}}},j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [status, setStatus] = useState('idle');
    const [flashId, setFlashId] = useState<string | null>(null);
    return <div style={{
      display: 'grid',
      gridTemplateColumns: 'minmax(0, 1fr) 220px',
      gap: 32,
      maxWidth: 960
    }}>
        <article>
          {outlineItems.map(item => <section key={item.id}>
              {/* scroll-margin-top belongs on the heading (it carries the id
                  the outline scrolls to), not on the section wrapper. */}
              <Heading id={item.id} level={item.level === 2 ? 2 : 3} style={{
            scrollMarginTop: 16,
            transition: 'background-color 600ms',
            backgroundColor: flashId === item.id ? 'var(--color-overlay-hover, rgba(128,128,128,0.2))' : 'transparent'
          }}>
                {item.label}
              </Heading>
              <div style={{
            height: 320
          }} />
            </section>)}
        </article>
        <aside style={{
        position: 'sticky',
        top: 24,
        alignSelf: 'start'
      }}>
          <Badge label={status} />
          <Outline items={outlineItems} onNavigateStart={id => {
          setFlashId(null);
          setStatus(\`scrolling to \${id}\`);
        }} onNavigateEnd={id => {
          setFlashId(id);
          setStatus(\`arrived at \${id}\`);
        }} />
        </aside>
      </div>;
  }
}`,...j.parameters?.docs?.source},description:{story:"Navigate callbacks. `onNavigateStart` fires before the smooth scroll begins\nand `onNavigateEnd` once it settles — here it flashes the heading on arrival.\n\n`onNavigateEnd` fires exactly once for every `onNavigateStart`, including\nwhen the user scrolls away mid-jump, so the flash state can never get stuck.",...j.parameters?.docs?.description}}},M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
    width: 240
  }}>
      <button type="button">Focus me, then press Tab</button>
      <Outline items={outlineItems} />
      <button type="button">Tab again lands here</button>
    </div>
}`,...M.parameters?.docs?.source},description:{story:`Keyboard navigation. The outline is a single tab stop: Tab moves into it
once, then Arrow keys move between headings, Home/End jump to the ends, and
Enter or Space activates — a 40-heading TOC costs one Tab press, not 40.`,...M.parameters?.docs?.description}}},N=[`Basic`,`Controlled`,`Compact`,`WithDocument`,`ExtractFromMarkdown`,`ExtractFromHTML`,`DeepNesting`,`ScrollSpy`,`NavigateCallbacks`,`KeyboardNavigation`]}))();export{C as Basic,T as Compact,w as Controlled,k as DeepNesting,O as ExtractFromHTML,D as ExtractFromMarkdown,M as KeyboardNavigation,j as NavigateCallbacks,A as ScrollSpy,E as WithDocument,N as __namedExportsOrder,y as default};