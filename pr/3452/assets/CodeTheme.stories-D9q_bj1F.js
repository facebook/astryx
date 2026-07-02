import{a1 as e,f as k,G as L,H as b}from"./iframe-BzSUXdLu.js";import{C as r}from"./CodeBlock-E41fH2JK.js";import{a as N,S as t,c as P,b as j,d as v,g as U,e as B,m as D,n as T,o as E,f as H,s as w,t as G,h as I}from"./presets-CUEZkmzk.js";import"./preload-helper-Ct5FWWRu.js";import"./highlightRanges-CHeDcUzc.js";const s=["import {useState, useEffect} from 'react';","","interface User {","  id: string;","  name: string;","  roles: string[];","}","",'const API_URL = "https://api.example.com";',"const MAX_RETRIES = 3;","","// Fetch user data with retry logic","async function fetchUser(id: string): Promise<User> {","  const response = await fetch(`${API_URL}/users/${id}`);","  if (!response.ok) {","    throw new Error(`HTTP ${response.status}`);","  }","  return response.json();","}","","export function UserCard({id}: {id: string}) {","  const [user, setUser] = useState<User | null>(null);","","  useEffect(() => {","    fetchUser(id).then(setUser);","  }, [id]);","","  if (!user) return <div>Loading...</div>;","","  return (",'    <div className="card">',"      <h2>{user.name}</h2>","      <span>{user.roles.length} roles</span>","    </div>","  );","}"].join(`
`),F={title:"Core/CodeTheme",tags:["autodocs"],parameters:{docs:{description:{component:"Syntax theme provider for code components. Wraps CodeBlock and CodeEditor to apply community syntax color themes. 12 presets ship in @astryxdesign/core/theme/syntax."}}}},a={render:()=>e.jsx(t,{theme:E,children:e.jsx(r,{code:s,language:"typescript",title:"UserCard.tsx",hasLineNumbers:!0})})},o={render:()=>e.jsx(t,{theme:v,children:e.jsx(r,{code:s,language:"typescript",title:"UserCard.tsx",hasLineNumbers:!0})})},n={render:()=>e.jsx(t,{theme:D,children:e.jsx(r,{code:s,language:"typescript",title:"UserCard.tsx",hasLineNumbers:!0})})},d={render:()=>e.jsx(t,{theme:T,children:e.jsx(r,{code:s,language:"typescript",title:"UserCard.tsx",hasLineNumbers:!0})})},i={render:()=>e.jsx(t,{theme:G,children:e.jsx(r,{code:s,language:"typescript",title:"UserCard.tsx",hasLineNumbers:!0})})},c={render:()=>e.jsx(t,{theme:j,children:e.jsx(r,{code:s,language:"typescript",title:"UserCard.tsx",hasLineNumbers:!0})})},m={render:()=>e.jsx(t,{theme:B,children:e.jsx(r,{code:s,language:"typescript",title:"UserCard.tsx",hasLineNumbers:!0})})},p={render:()=>e.jsx(t,{theme:U,children:e.jsx(r,{code:s,language:"typescript",title:"UserCard.tsx",hasLineNumbers:!0})})},l={render:()=>e.jsx(t,{theme:w,children:e.jsx(r,{code:s,language:"typescript",title:"UserCard.tsx",hasLineNumbers:!0})})},u={render:()=>e.jsx(t,{theme:H,children:e.jsx(r,{code:s,language:"typescript",title:"UserCard.tsx",hasLineNumbers:!0})})},h={render:()=>e.jsx(t,{theme:P,children:e.jsx(r,{code:s,language:"typescript",title:"UserCard.tsx",hasLineNumbers:!0})})},g={render:()=>e.jsx(t,{theme:I,children:e.jsx(r,{code:s,language:"typescript",title:"UserCard.tsx",hasLineNumbers:!0})})},M=["const greet = (name: string) => {","  // Say hello","  return `Hello, ${name}!`;","};","",'const result = greet("World");',"console.log(result); // Hello, World!"].join(`
`),x={render:()=>e.jsx("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16},children:N.map(S=>e.jsx(t,{theme:S,children:e.jsx(r,{code:M,language:"typescript",title:S.name,hasLineNumbers:!0})},S.name))}),parameters:{layout:"padded"}},y={render:()=>e.jsx(t,{theme:T,children:e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:16},children:[e.jsx(r,{code:"// Inherits Nord from provider",language:"typescript",title:"nord (from provider)"}),e.jsx(t,{theme:v,children:e.jsx(r,{code:"// Inner provider overrides to Dracula",language:"typescript",title:"dracula (inner override)"})})]})})},O=L({name:"cyberpunk",tokens:{keyword:"#ff2a6d",string:"#05d9e8",comment:"#4a5568",number:"#d1f7ff",function:"#ff6ac1",type:"#7efff5",variable:"#e2e8f0",operator:"#ff9e64",constant:"#d1f7ff",tag:"#ff2a6d",attribute:"#7efff5",property:"#05d9e8",punctuation:"#718096",background:"#0d0221"}}),C={render:()=>e.jsx(t,{theme:O,children:e.jsx(r,{code:s,language:"typescript",title:"Custom: Cyberpunk",hasLineNumbers:!0})})},A=b({name:"dark-dev",syntax:v,tokens:{"--color-background-surface":"#282a36","--color-text-primary":"#f8f8f2"}}),f={render:()=>e.jsx(k,{theme:A,mode:"dark",children:e.jsx(r,{code:s,language:"typescript",title:"defineTheme with syntax: dracula",hasLineNumbers:!0})})};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  render: () => <SyntaxThemeProvider theme={oneDarkPro}>
      <CodeBlock code={sampleCode} language="typescript" title="UserCard.tsx" hasLineNumbers />
    </SyntaxThemeProvider>
}`,...a.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  render: () => <SyntaxThemeProvider theme={dracula}>
      <CodeBlock code={sampleCode} language="typescript" title="UserCard.tsx" hasLineNumbers />
    </SyntaxThemeProvider>
}`,...o.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  render: () => <SyntaxThemeProvider theme={monokai}>
      <CodeBlock code={sampleCode} language="typescript" title="UserCard.tsx" hasLineNumbers />
    </SyntaxThemeProvider>
}`,...n.parameters?.docs?.source}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  render: () => <SyntaxThemeProvider theme={nord}>
      <CodeBlock code={sampleCode} language="typescript" title="UserCard.tsx" hasLineNumbers />
    </SyntaxThemeProvider>
}`,...d.parameters?.docs?.source}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  render: () => <SyntaxThemeProvider theme={tokyoNight}>
      <CodeBlock code={sampleCode} language="typescript" title="UserCard.tsx" hasLineNumbers />
    </SyntaxThemeProvider>
}`,...i.parameters?.docs?.source}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  render: () => <SyntaxThemeProvider theme={catppuccinMocha}>
      <CodeBlock code={sampleCode} language="typescript" title="UserCard.tsx" hasLineNumbers />
    </SyntaxThemeProvider>
}`,...c.parameters?.docs?.source}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  render: () => <SyntaxThemeProvider theme={githubLight}>
      <CodeBlock code={sampleCode} language="typescript" title="UserCard.tsx" hasLineNumbers />
    </SyntaxThemeProvider>
}`,...m.parameters?.docs?.source}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  render: () => <SyntaxThemeProvider theme={githubDark}>
      <CodeBlock code={sampleCode} language="typescript" title="UserCard.tsx" hasLineNumbers />
    </SyntaxThemeProvider>
}`,...p.parameters?.docs?.source}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  render: () => <SyntaxThemeProvider theme={solarizedLight}>
      <CodeBlock code={sampleCode} language="typescript" title="UserCard.tsx" hasLineNumbers />
    </SyntaxThemeProvider>
}`,...l.parameters?.docs?.source}}};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  render: () => <SyntaxThemeProvider theme={oneLight}>
      <CodeBlock code={sampleCode} language="typescript" title="UserCard.tsx" hasLineNumbers />
    </SyntaxThemeProvider>
}`,...u.parameters?.docs?.source}}};h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  render: () => <SyntaxThemeProvider theme={catppuccinLatte}>
      <CodeBlock code={sampleCode} language="typescript" title="UserCard.tsx" hasLineNumbers />
    </SyntaxThemeProvider>
}`,...h.parameters?.docs?.source}}};g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  render: () => <SyntaxThemeProvider theme={tokyoNightLight}>
      <CodeBlock code={sampleCode} language="typescript" title="UserCard.tsx" hasLineNumbers />
    </SyntaxThemeProvider>
}`,...g.parameters?.docs?.source}}};x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 16
  }}>
      {allSyntaxPresets.map(theme => <SyntaxThemeProvider key={theme.name} theme={theme}>
          <CodeBlock code={shortCode} language="typescript" title={theme.name} hasLineNumbers />
        </SyntaxThemeProvider>)}
    </div>,
  parameters: {
    layout: 'padded'
  }
}`,...x.parameters?.docs?.source}}};y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  render: () => <SyntaxThemeProvider theme={nord}>
      <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 16
    }}>
        <CodeBlock code="// Inherits Nord from provider" language="typescript" title="nord (from provider)" />
        <SyntaxThemeProvider theme={dracula}>
          <CodeBlock code="// Inner provider overrides to Dracula" language="typescript" title="dracula (inner override)" />
        </SyntaxThemeProvider>
      </div>
    </SyntaxThemeProvider>
}`,...y.parameters?.docs?.source}}};C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  render: () => <SyntaxThemeProvider theme={cyberpunk}>
      <CodeBlock code={sampleCode} language="typescript" title="Custom: Cyberpunk" hasLineNumbers />
    </SyntaxThemeProvider>
}`,...C.parameters?.docs?.source}}};f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  render: () => <Theme theme={darkDevTheme} mode="dark">
      <CodeBlock code={sampleCode} language="typescript" title="defineTheme with syntax: dracula" hasLineNumbers />
    </Theme>
}`,...f.parameters?.docs?.source}}};const X=["OneDarkPro","Dracula","Monokai","Nord","TokyoNight","CatppuccinMocha","GitHubLight","GitHubDark","SolarizedLight","OneLight","CatppuccinLatte","TokyoNightLight","AllThemesGallery","NestedOverride","CustomTheme","ThemeWithSyntaxDefaults"];export{x as AllThemesGallery,h as CatppuccinLatte,c as CatppuccinMocha,C as CustomTheme,o as Dracula,p as GitHubDark,m as GitHubLight,n as Monokai,y as NestedOverride,d as Nord,a as OneDarkPro,u as OneLight,l as SolarizedLight,f as ThemeWithSyntaxDefaults,i as TokyoNight,g as TokyoNightLight,X as __namedExportsOrder,F as default};
