import{i as e,s as t}from"./preload-helper-CT_b8DTk.js";import{t as n}from"./react-B7Te67-h.js";import{t as r}from"./jsx-runtime-DqZldVDK.js";import{t as i}from"./Text-DgptUEJl.js";import{t as a}from"./Button-DFuojCWT.js";import{t as o}from"./Button-sRYvbYs2.js";import{t as s}from"./Text-B20s2a5b.js";import{i as c,t as l}from"./Link-DbtQ4S6o.js";import{Sr as u,xr as d}from"./iframe-1DZCYtus.js";function f(e,t){let n=e.split(`
`),r=t.split(`
`),i=Array.from({length:n.length+1},()=>Array(r.length+1).fill(0));for(let e=n.length-1;e>=0;e--)for(let t=r.length-1;t>=0;t--)i[e][t]=n[e]===r[t]?i[e+1][t+1]+1:Math.max(i[e+1][t],i[e][t+1]);let a=new Set,o=0,s=0;for(;o<n.length&&s<r.length;)n[o]===r[s]?(o++,s++):i[o+1][s]>=i[o][s+1]?o++:(a.add(s+1),s++);for(;s<r.length;)a.add(++s);return a}var p,m,h,g,_,v,y,b,x,S,C,w,T,E,D,O,k,A,j,M,N;e((()=>{p=t(n()),d(),o(),l(),s(),m=r(),h={title:`Core/Markdown`,component:u,tags:[`autodocs`],argTypes:{density:{control:`select`,options:[`default`,`compact`]},headingLevelStart:{control:`select`,options:[1,2,3,4,5,6]},isStreaming:{control:`boolean`},display:{control:`select`,options:[`block`,`inline`]}}},g=[`# Markdown Demo`,``,`Renders **markdown** with *design-system-consistent* styling.`,``,`## Features`,``,`- Headings mapped to Astryx type scale`,`- **Bold**, *italic*, and ~~strikethrough~~ text`,`- [Links](https://example.com) with external detection`,"- Inline `code` and fenced code blocks",``,`### Code Block`,``,"```typescript",`interface User {`,`  id: string;`,`  name: string;`,`}`,``,`function greet(user: User) {`,"  return `Hello, ${user.name}!`;",`}`,"```",``,`### Blockquote`,``,`> Design systems free teams to focus on problems that matter.`,``,`### Table`,``,`| Component | Status | Tests |`,`|:----------|:------:|------:|`,`| Markdown | Active | 73 |`,`| CodeBlock | Active | 44 |`,``,`### Task List`,``,`- [x] Parser`,`- [x] Renderer`,`- [ ] Storybook stories`,``,`---`,``,`1. First ordered item`,`2. Second ordered item`].join(`
`),_=[`## Setting Up a Design System`,``,`A design system is more than a component library — it's a **shared language** between design and engineering. Here's how to build one that scales.`,``,`### 1. Start with Tokens`,``,`Design tokens are the atomic values that define your visual language:`,``,"```typescript",`const tokens = {`,`  color: {`,`    primary: '#0066FF',`,`    secondary: '#6B7280',`,`    success: '#10B981',`,`    danger: '#EF4444',`,`  },`,`  spacing: {`,`    xs: '4px',`,`    sm: '8px',`,`    md: '16px',`,`    lg: '24px',`,`    xl: '32px',`,`  },`,`  radius: {`,`    sm: '4px',`,`    md: '8px',`,`    lg: '16px',`,`    full: '9999px',`,`  },`,`};`,"```",``,`These tokens should be the *single source of truth* for every component.`,``,`### 2. Component Architecture`,``,`Good components follow these principles:`,``,`- **Composable** — small pieces that combine into complex UIs`,`- **Accessible** — keyboard navigation and screen reader support built-in`,`- **Themeable** — visual customization without forking`,`- **Documented** — usage examples, props tables, and do/don't guidelines`,``,`> The best design systems are *opinionated enough* to ensure consistency, but *flexible enough* to handle edge cases gracefully.`,``,`### 3. Adoption Strategy`,``,`Rolling out a design system requires planning:`,``,`| Phase | Duration | Goal |`,`|:------|:--------:|:-----|`,`| Alpha | 4 weeks | Core components, internal dogfooding |`,`| Beta | 8 weeks | Expanded component set, 2-3 pilot teams |`,`| GA | Ongoing | Full adoption, migration support |`,``,`Key metrics to track:`,``,`1. **Component coverage** — what percentage of UI patterns are served`,`2. **Adoption rate** — teams actively using the system`,`3. **Contribution rate** — external PRs and feature requests`,`4. **Consistency score** — visual audits across products`,``,`### 4. Maintenance`,``,`A design system is a *living product*. Plan for:`,``,`- [x] Automated visual regression testing`,`- [x] Semantic versioning with changelogs`,`- [ ] Breaking change codemods`,`- [ ] Cross-platform support (web, mobile, native)`,``,`---`,``,`The most important thing? **Ship early, iterate often.** A design system that exists and is used beats a perfect one that's still in planning.`].join(`
`),v={args:{children:g}},y={args:{children:g,density:`compact`}},b={name:`AI Response`,args:{children:_,density:`compact`,headingLevelStart:3}},x={name:`Shifted Headings (start at h3)`,args:{children:g,headingLevelStart:3}},S={name:`Inline Display`,render:()=>(0,m.jsxs)(`div`,{style:{maxWidth:680,display:`grid`,gap:16},children:[(0,m.jsx)(i,{type:`large`,display:`block`,children:(0,m.jsx)(u,{display:`inline`,children:"Use `value` with **controlled state** and [read the docs](https://example.com) without creating block wrappers."})}),(0,m.jsxs)(`div`,{style:{border:`1px solid #ddd`,borderRadius:8,padding:12,display:`grid`,gap:6},children:[(0,m.jsx)(i,{type:`body`,weight:`bold`,display:`block`,children:`Prop description`}),(0,m.jsx)(i,{type:`body`,color:`secondary`,display:`block`,children:(0,m.jsx)(u,{display:`inline`,children:'Accepts an action item `{label, onClick?, icon?}`, a divider `{type: "divider"}`, or a section `{type: "section", items: [...]}`.'})})]})]})},C={name:`Table`,args:{children:[`## Comparison Table`,``,`| Feature | React | Vue | Svelte |`,`|:--------|:-----:|:---:|-------:|`,`| Virtual DOM | Yes | Yes | No |`,`| Bundle Size | ~40KB | ~30KB | ~2KB |`,`| TypeScript | Native | Plugin | Native |`,`| Learning Curve | Medium | Easy | Easy |`].join(`
`)}},w={render:()=>{let e=_,[t,n]=(0,p.useState)(0),[r,i]=(0,p.useState)(!0),[o,s]=(0,p.useState)(0);return(0,p.useEffect)(()=>{if(!r)return;if(t>=e.length){i(!1);return}let a=Math.floor(Math.random()*8)+2,o=30+Math.random()*60,s=setTimeout(()=>{n(t=>Math.min(t+a,e.length))},o);return()=>clearTimeout(s)},[t,r,e]),(0,m.jsxs)(`div`,{children:[(0,m.jsxs)(`div`,{style:{marginBlockEnd:12,display:`flex`,gap:8,alignItems:`center`},children:[(0,m.jsx)(a,{label:`Replay`,variant:`secondary`,size:`sm`,onClick:(0,p.useCallback)(()=>{n(0),i(!0),s(e=>e+1)},[]),isDisabled:r}),(0,m.jsx)(`span`,{style:{fontSize:12,color:`#666`},children:r?`Streaming... ${t}/${e.length}`:`Complete`})]}),(0,m.jsx)(u,{isStreaming:r,density:`compact`,headingLevelStart:3,children:e.slice(0,t)},o)]})}},T={name:`With Images`,render:()=>(0,m.jsx)(`div`,{style:{maxWidth:800},children:(0,m.jsx)(u,{children:`
Here is some text before the image.

![A landscape photo](https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=680&h=400&fit=crop&auto=format)

Text between two images.

![A tall portrait photo](https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=400&h=600&fit=crop&auto=format)

And here's a really wide one:

![Wide panoramic shot](https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=1200&h=300&fit=crop&auto=format)

Final paragraph after all images.
`})})},E=`
# Content Alignment

This paragraph is constrained by \`contentWidth\`. Notice how it's narrower than the code block and table below. The alignment prop controls where this narrow prose sits within the wider container.

Here's a bullet list that also respects prose width:
- First item with some explanation text
- Second item that wraps to show the width constraint
- Third item for good measure

\`\`\`typescript
// Code blocks break out to full container width regardless of contentAlign
export function calculateLayout(items: Item[], containerWidth: number): Layout {
  const columns = Math.floor(containerWidth / COLUMN_MIN_WIDTH);
  return { columns, gap: GRID_GAP, items: distributeItems(items, columns) };
}
\`\`\`

Back to prose — this paragraph is aligned according to the \`contentAlign\` prop while the code block above spans the full width.

| Component | Status | Notes |
|-----------|--------|-------|
| Button | Stable | Full API |
| CodeBlock | Stable | With collapsible |
| Markdown | In progress | Adding alignment |

Final paragraph after the table.
`,D={name:`Content Align: Start`,render:()=>(0,m.jsx)(`div`,{style:{maxWidth:900,border:`1px dashed #ccc`,padding:16},children:(0,m.jsx)(u,{contentWidth:580,contentAlign:`start`,children:E})})},O={name:`Content Align: Center`,render:()=>(0,m.jsx)(`div`,{style:{maxWidth:900,border:`1px dashed #ccc`,padding:16},children:(0,m.jsx)(u,{contentWidth:580,contentAlign:`center`,children:E})})},k={name:`Inline Plugins`,render:()=>(0,m.jsx)(`div`,{style:{maxWidth:680},children:(0,m.jsx)(u,{inlinePlugins:[{pattern:/\b([A-Z][A-Z0-9]+-\d+)\b/g,render:(e,t)=>(0,m.jsx)(c,{href:`https://issues.example.com/browse/${e[1]}`,isExternalLink:!0,weight:`semibold`,children:e[0]},t)},{pattern:/#(\d+)/g,render:(e,t)=>(0,m.jsx)(c,{href:`https://github.com/org/repo/issues/${e[1]}`,isExternalLink:!0,weight:`semibold`,children:e[0]},t)}],density:`compact`,headingLevelStart:2,children:[`## Release Notes — v2.1.0`,``,`This release fixes several issues reported in PROJ-42 and introduces`,`the inline plugins feature requested in #1873.`,``,`### Bug Fixes`,``,`- Fixed crash in streaming mode (BUG-789)`,`- Resolved memory leak in chat components (PROJ-101)`,`- **Bold context**: Plugin works inside **PROJ-55 formatting**`,``,`### Code Example (not linkified)`,``,"```typescript",`// PROJ-999 and BUG-888 should NOT become links inside code blocks`,`const ticketId = "PROJ-999";`,"```",``,"Inline code is also safe: `PROJ-999` stays as plain text.",``,`### Migration Guide`,``,`See PROJ-200 for the full pattern. Also check [the docs](/docs/markdown)`,`for usage alongside regular markdown links.`].join(`
`)})})},A=[`# Session file viewer`,``,`Renders a file an agent wrote during the session.`,``,`## Supported types`,``,`- Plain text`,`- Source code, syntax highlighted`,`- Images`,``,`## Open questions`,``,`> How do we show a file that changed twice in one session?`,``,"```ts",`type FileView = {path: string; body: string};`,"```"].join(`
`),j=[`# Session file viewer`,``,`Renders a file an agent wrote during the session.`,``,`## Supported types`,``,`- Plain text`,`- Source code, syntax highlighted`,"- **Markdown**, rendered as prose (`.md`)",`- Images`,``,`## Open questions`,``,`> How do we show a file that changed twice in one session?`,`> Mark the second change only, or both?`,``,"```ts",`type FileView = {path: string; body: string; language?: string};`,"```"].join(`
`),M={name:`Diff Indicators`,render:()=>{let e=f(A,j);return(0,m.jsxs)(`div`,{style:{maxWidth:680,display:`grid`,gap:16},children:[(0,m.jsx)(i,{type:`supporting`,children:`The same document, rendered as prose, with the lines a diff reports as added or rewritten marked in place.`}),(0,m.jsx)(u,{renderBlock:(t,n)=>!Array.from({length:t.position.endLine-t.position.startLine+1},(e,n)=>t.position.startLine+n).some(t=>e.has(t))||t.type===`list`||t.type===`blockquote`?n:(0,m.jsx)(`div`,{"data-changed":t.type,style:{background:`var(--color-success-muted)`,borderInlineStart:`2px solid var(--color-success)`,paddingInlineStart:8},children:n}),children:j})]})}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    children: SAMPLE_MD
  }
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    children: SAMPLE_MD,
    density: 'compact'
  }
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  name: 'AI Response',
  args: {
    children: STREAMING_RESPONSE,
    density: 'compact',
    headingLevelStart: 3
  }
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  name: 'Shifted Headings (start at h3)',
  args: {
    children: SAMPLE_MD,
    headingLevelStart: 3
  }
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  name: 'Inline Display',
  render: () => <div style={{
    maxWidth: 680,
    display: 'grid',
    gap: 16
  }}>
      <Text type="large" display="block">
        <Markdown display="inline">
          {'Use \`value\` with **controlled state** and [read the docs](https://example.com) without creating block wrappers.'}
        </Markdown>
      </Text>

      <div style={{
      border: '1px solid #ddd',
      borderRadius: 8,
      padding: 12,
      display: 'grid',
      gap: 6
    }}>
        <Text type="body" weight="bold" display="block">
          Prop description
        </Text>
        <Text type="body" color="secondary" display="block">
          <Markdown display="inline">
            {'Accepts an action item \`{label, onClick?, icon?}\`, a divider \`{type: "divider"}\`, or a section \`{type: "section", items: [...]}\`.'}
          </Markdown>
        </Text>
      </div>
    </div>
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  name: 'Table',
  args: {
    children: ['## Comparison Table', '', '| Feature | React | Vue | Svelte |', '|:--------|:-----:|:---:|-------:|', '| Virtual DOM | Yes | Yes | No |', '| Bundle Size | ~40KB | ~30KB | ~2KB |', '| TypeScript | Native | Plugin | Native |', '| Learning Curve | Medium | Easy | Easy |'].join('\\n')
  }
}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  render: () => {
    const text = STREAMING_RESPONSE;
    const [charIndex, setCharIndex] = useState(0);
    const [isStreaming, setIsStreaming] = useState(true);
    const [key, setKey] = useState(0);
    useEffect(() => {
      if (!isStreaming) {
        return;
      }
      if (charIndex >= text.length) {
        setIsStreaming(false);
        return;
      }
      const chunkSize = Math.floor(Math.random() * 8) + 2;
      const delay = 30 + Math.random() * 60;
      const timer = setTimeout(() => {
        setCharIndex(prev => Math.min(prev + chunkSize, text.length));
      }, delay);
      return () => clearTimeout(timer);
    }, [charIndex, isStreaming, text]);
    const replay = useCallback(() => {
      setCharIndex(0);
      setIsStreaming(true);
      setKey(k => k + 1);
    }, []);
    return <div>
        <div style={{
        marginBlockEnd: 12,
        display: 'flex',
        gap: 8,
        alignItems: 'center'
      }}>
          <Button label="Replay" variant="secondary" size="sm" onClick={replay} isDisabled={isStreaming} />
          <span style={{
          fontSize: 12,
          color: '#666'
        }}>
            {isStreaming ? \`Streaming... \${charIndex}/\${text.length}\` : 'Complete'}
          </span>
        </div>
        <Markdown key={key} isStreaming={isStreaming} density="compact" headingLevelStart={3}>
          {text.slice(0, charIndex)}
        </Markdown>
      </div>;
  }
}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  name: 'With Images',
  render: () => <div style={{
    maxWidth: 800
  }}>
      <Markdown>{\`
Here is some text before the image.

![A landscape photo](https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=680&h=400&fit=crop&auto=format)

Text between two images.

![A tall portrait photo](https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=400&h=600&fit=crop&auto=format)

And here's a really wide one:

![Wide panoramic shot](https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=1200&h=300&fit=crop&auto=format)

Final paragraph after all images.
\`}</Markdown>
    </div>
}`,...T.parameters?.docs?.source}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  name: 'Content Align: Start',
  render: () => <div style={{
    maxWidth: 900,
    border: '1px dashed #ccc',
    padding: 16
  }}>
      <Markdown contentWidth={580} contentAlign="start">
        {CONTENT_ALIGN_TEXT}
      </Markdown>
    </div>
}`,...D.parameters?.docs?.source}}},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
  name: 'Content Align: Center',
  render: () => <div style={{
    maxWidth: 900,
    border: '1px dashed #ccc',
    padding: 16
  }}>
      <Markdown contentWidth={580} contentAlign="center">
        {CONTENT_ALIGN_TEXT}
      </Markdown>
    </div>
}`,...O.parameters?.docs?.source}}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  name: 'Inline Plugins',
  render: () => {
    const inlinePlugins = [{
      // JIRA-style ticket references: PROJ-123, BUG-456, etc.
      pattern: /\\b([A-Z][A-Z0-9]+-\\d+)\\b/g,
      render: (match: RegExpMatchArray, key: string) => <Link key={key} href={\`https://issues.example.com/browse/\${match[1]}\`} isExternalLink weight="semibold">
            {match[0]}
          </Link>
    }, {
      // GitHub-style issue references: #123, #456, etc.
      pattern: /#(\\d+)/g,
      render: (match: RegExpMatchArray, key: string) => <Link key={key} href={\`https://github.com/org/repo/issues/\${match[1]}\`} isExternalLink weight="semibold">
            {match[0]}
          </Link>
    }];
    const markdown = ['## Release Notes — v2.1.0', '', 'This release fixes several issues reported in PROJ-42 and introduces', 'the inline plugins feature requested in #1873.', '', '### Bug Fixes', '', '- Fixed crash in streaming mode (BUG-789)', '- Resolved memory leak in chat components (PROJ-101)', '- **Bold context**: Plugin works inside **PROJ-55 formatting**', '', '### Code Example (not linkified)', '', '\`\`\`typescript', '// PROJ-999 and BUG-888 should NOT become links inside code blocks', 'const ticketId = "PROJ-999";', '\`\`\`', '', 'Inline code is also safe: \`PROJ-999\` stays as plain text.', '', '### Migration Guide', '', 'See PROJ-200 for the full pattern. Also check [the docs](/docs/markdown)', 'for usage alongside regular markdown links.'].join('\\n');
    return <div style={{
      maxWidth: 680
    }}>
        <Markdown inlinePlugins={inlinePlugins} density="compact" headingLevelStart={2}>
          {markdown}
        </Markdown>
      </div>;
  }
}`,...k.parameters?.docs?.source}}},M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
  name: 'Diff Indicators',
  render: () => {
    const changed = changedLines(SPEC_BEFORE, SPEC_AFTER);
    return <div style={{
      maxWidth: 680,
      display: 'grid',
      gap: 16
    }}>
        <Text type="supporting">
          The same document, rendered as prose, with the lines a diff reports as
          added or rewritten marked in place.
        </Text>
        <Markdown renderBlock={(block, children) => {
        const isChanged = Array.from({
          length: block.position.endLine - block.position.startLine + 1
        }, (_unused, offset) => block.position.startLine + offset).some(line => changed.has(line));
        // A container's range covers its children, so tinting it would
        // paint bullets that did not change; let the children carry it.
        if (!isChanged || block.type === 'list' || block.type === 'blockquote') {
          return children;
        }
        return <div data-changed={block.type} style={{
          background: 'var(--color-success-muted)',
          borderInlineStart: '2px solid var(--color-success)',
          paddingInlineStart: 8
        }}>
                {children}
              </div>;
      }}>
          {SPEC_AFTER}
        </Markdown>
      </div>;
  }
}`,...M.parameters?.docs?.source}}},N=[`Default`,`Compact`,`AIResponse`,`ShiftedHeadings`,`InlineDisplay`,`TableFocused`,`Streaming`,`WithImages`,`ContentAlignStart`,`ContentAlignCenter`,`InlinePlugins`,`DiffIndicators`]}))();export{b as AIResponse,y as Compact,O as ContentAlignCenter,D as ContentAlignStart,v as Default,M as DiffIndicators,S as InlineDisplay,k as InlinePlugins,x as ShiftedHeadings,w as Streaming,C as TableFocused,T as WithImages,N as __namedExportsOrder,h as default};