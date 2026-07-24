import{i as e}from"./preload-helper-CT_b8DTk.js";import{t}from"./react-B7Te67-h.js";import{t as n}from"./jsx-runtime-DqZldVDK.js";import{o as r}from"./useTheme-CKat3NNu.js";import{_ as i,a,c as o,d as s,f as c,g as l,h as u,i as d,m as f,n as p,o as m,p as h,r as g,s as _,t as v,u as y,x as b,y as x}from"./theme-BwMR6G18.js";import{i as S,t as C}from"./CodeBlock-IQAiM3j8.js";var w,T,E,D,O,k,A,j,M,N,P,F,I,L,R,z,B,V,H,U,W,G,K;e((()=>{t(),C(),p(),v(),w=n(),T=[`import {useState, useEffect} from 'react';`,``,`interface User {`,`  id: string;`,`  name: string;`,`  roles: string[];`,`}`,``,`const API_URL = "https://api.example.com";`,`const MAX_RETRIES = 3;`,``,`// Fetch user data with retry logic`,`async function fetchUser(id: string): Promise<User> {`,"  const response = await fetch(`${API_URL}/users/${id}`);",`  if (!response.ok) {`,"    throw new Error(`HTTP ${response.status}`);",`  }`,`  return response.json();`,`}`,``,`export function UserCard({id}: {id: string}) {`,`  const [user, setUser] = useState<User | null>(null);`,``,`  useEffect(() => {`,`    fetchUser(id).then(setUser);`,`  }, [id]);`,``,`  if (!user) return <div>Loading...</div>;`,``,`  return (`,`    <div className="card">`,`      <h2>{user.name}</h2>`,`      <span>{user.roles.length} roles</span>`,`    </div>`,`  );`,`}`].join(`
`),E={title:`Core/CodeTheme`,tags:[`autodocs`],parameters:{docs:{description:{component:`Syntax theme provider for code components. Wraps CodeBlock and CodeEditor to apply community syntax color themes. 12 presets ship in @astryxdesign/core/theme/syntax.`}}}},D={render:()=>(0,w.jsx)(i,{theme:c,children:(0,w.jsx)(S,{code:T,language:`typescript`,title:`UserCard.tsx`,hasLineNumbers:!0})})},O={render:()=>(0,w.jsx)(i,{theme:m,children:(0,w.jsx)(S,{code:T,language:`typescript`,title:`UserCard.tsx`,hasLineNumbers:!0})})},k={render:()=>(0,w.jsx)(i,{theme:y,children:(0,w.jsx)(S,{code:T,language:`typescript`,title:`UserCard.tsx`,hasLineNumbers:!0})})},A={render:()=>(0,w.jsx)(i,{theme:s,children:(0,w.jsx)(S,{code:T,language:`typescript`,title:`UserCard.tsx`,hasLineNumbers:!0})})},j={render:()=>(0,w.jsx)(i,{theme:u,children:(0,w.jsx)(S,{code:T,language:`typescript`,title:`UserCard.tsx`,hasLineNumbers:!0})})},M={render:()=>(0,w.jsx)(i,{theme:a,children:(0,w.jsx)(S,{code:T,language:`typescript`,title:`UserCard.tsx`,hasLineNumbers:!0})})},N={render:()=>(0,w.jsx)(i,{theme:o,children:(0,w.jsx)(S,{code:T,language:`typescript`,title:`UserCard.tsx`,hasLineNumbers:!0})})},P={render:()=>(0,w.jsx)(i,{theme:_,children:(0,w.jsx)(S,{code:T,language:`typescript`,title:`UserCard.tsx`,hasLineNumbers:!0})})},F={render:()=>(0,w.jsx)(i,{theme:f,children:(0,w.jsx)(S,{code:T,language:`typescript`,title:`UserCard.tsx`,hasLineNumbers:!0})})},I={render:()=>(0,w.jsx)(i,{theme:h,children:(0,w.jsx)(S,{code:T,language:`typescript`,title:`UserCard.tsx`,hasLineNumbers:!0})})},L={render:()=>(0,w.jsx)(i,{theme:d,children:(0,w.jsx)(S,{code:T,language:`typescript`,title:`UserCard.tsx`,hasLineNumbers:!0})})},R={render:()=>(0,w.jsx)(i,{theme:l,children:(0,w.jsx)(S,{code:T,language:`typescript`,title:`UserCard.tsx`,hasLineNumbers:!0})})},z=[`const greet = (name: string) => {`,`  // Say hello`,"  return `Hello, ${name}!`;",`};`,``,`const result = greet("World");`,`console.log(result); // Hello, World!`].join(`
`),B={render:()=>(0,w.jsx)(`div`,{style:{display:`grid`,gridTemplateColumns:`1fr 1fr`,gap:16},children:g.map(e=>(0,w.jsx)(i,{theme:e,children:(0,w.jsx)(S,{code:z,language:`typescript`,title:e.name,hasLineNumbers:!0})},e.name))}),parameters:{layout:`padded`}},V={render:()=>(0,w.jsx)(i,{theme:s,children:(0,w.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:16},children:[(0,w.jsx)(S,{code:`// Inherits Nord from provider`,language:`typescript`,title:`nord (from provider)`}),(0,w.jsx)(i,{theme:m,children:(0,w.jsx)(S,{code:`// Inner provider overrides to Dracula`,language:`typescript`,title:`dracula (inner override)`})})]})})},H=x({name:`cyberpunk`,tokens:{keyword:`#ff2a6d`,string:`#05d9e8`,comment:`#4a5568`,number:`#d1f7ff`,function:`#ff6ac1`,type:`#7efff5`,variable:`#e2e8f0`,operator:`#ff9e64`,constant:`#d1f7ff`,tag:`#ff2a6d`,attribute:`#7efff5`,property:`#05d9e8`,punctuation:`#718096`,background:`#0d0221`}}),U={render:()=>(0,w.jsx)(i,{theme:H,children:(0,w.jsx)(S,{code:T,language:`typescript`,title:`Custom: Cyberpunk`,hasLineNumbers:!0})})},W=r({name:`dark-dev`,syntax:m,tokens:{"--color-background-surface":`#282a36`,"--color-text-primary":`#f8f8f2`}}),G={render:()=>(0,w.jsx)(b,{theme:W,mode:`dark`,children:(0,w.jsx)(S,{code:T,language:`typescript`,title:`defineTheme with syntax: dracula`,hasLineNumbers:!0})})},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  render: () => <SyntaxThemeProvider theme={oneDarkPro}>
      <CodeBlock code={sampleCode} language="typescript" title="UserCard.tsx" hasLineNumbers />
    </SyntaxThemeProvider>
}`,...D.parameters?.docs?.source}}},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
  render: () => <SyntaxThemeProvider theme={dracula}>
      <CodeBlock code={sampleCode} language="typescript" title="UserCard.tsx" hasLineNumbers />
    </SyntaxThemeProvider>
}`,...O.parameters?.docs?.source}}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  render: () => <SyntaxThemeProvider theme={monokai}>
      <CodeBlock code={sampleCode} language="typescript" title="UserCard.tsx" hasLineNumbers />
    </SyntaxThemeProvider>
}`,...k.parameters?.docs?.source}}},A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  render: () => <SyntaxThemeProvider theme={nord}>
      <CodeBlock code={sampleCode} language="typescript" title="UserCard.tsx" hasLineNumbers />
    </SyntaxThemeProvider>
}`,...A.parameters?.docs?.source}}},j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
  render: () => <SyntaxThemeProvider theme={tokyoNight}>
      <CodeBlock code={sampleCode} language="typescript" title="UserCard.tsx" hasLineNumbers />
    </SyntaxThemeProvider>
}`,...j.parameters?.docs?.source}}},M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
  render: () => <SyntaxThemeProvider theme={catppuccinMocha}>
      <CodeBlock code={sampleCode} language="typescript" title="UserCard.tsx" hasLineNumbers />
    </SyntaxThemeProvider>
}`,...M.parameters?.docs?.source}}},N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
  render: () => <SyntaxThemeProvider theme={githubLight}>
      <CodeBlock code={sampleCode} language="typescript" title="UserCard.tsx" hasLineNumbers />
    </SyntaxThemeProvider>
}`,...N.parameters?.docs?.source}}},P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
  render: () => <SyntaxThemeProvider theme={githubDark}>
      <CodeBlock code={sampleCode} language="typescript" title="UserCard.tsx" hasLineNumbers />
    </SyntaxThemeProvider>
}`,...P.parameters?.docs?.source}}},F.parameters={...F.parameters,docs:{...F.parameters?.docs,source:{originalSource:`{
  render: () => <SyntaxThemeProvider theme={solarizedLight}>
      <CodeBlock code={sampleCode} language="typescript" title="UserCard.tsx" hasLineNumbers />
    </SyntaxThemeProvider>
}`,...F.parameters?.docs?.source}}},I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{
  render: () => <SyntaxThemeProvider theme={oneLight}>
      <CodeBlock code={sampleCode} language="typescript" title="UserCard.tsx" hasLineNumbers />
    </SyntaxThemeProvider>
}`,...I.parameters?.docs?.source}}},L.parameters={...L.parameters,docs:{...L.parameters?.docs,source:{originalSource:`{
  render: () => <SyntaxThemeProvider theme={catppuccinLatte}>
      <CodeBlock code={sampleCode} language="typescript" title="UserCard.tsx" hasLineNumbers />
    </SyntaxThemeProvider>
}`,...L.parameters?.docs?.source}}},R.parameters={...R.parameters,docs:{...R.parameters?.docs,source:{originalSource:`{
  render: () => <SyntaxThemeProvider theme={tokyoNightLight}>
      <CodeBlock code={sampleCode} language="typescript" title="UserCard.tsx" hasLineNumbers />
    </SyntaxThemeProvider>
}`,...R.parameters?.docs?.source}}},B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
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
}`,...B.parameters?.docs?.source}}},V.parameters={...V.parameters,docs:{...V.parameters?.docs,source:{originalSource:`{
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
}`,...V.parameters?.docs?.source}}},U.parameters={...U.parameters,docs:{...U.parameters?.docs,source:{originalSource:`{
  render: () => <SyntaxThemeProvider theme={cyberpunk}>
      <CodeBlock code={sampleCode} language="typescript" title="Custom: Cyberpunk" hasLineNumbers />
    </SyntaxThemeProvider>
}`,...U.parameters?.docs?.source}}},G.parameters={...G.parameters,docs:{...G.parameters?.docs,source:{originalSource:`{
  render: () => <Theme theme={darkDevTheme} mode="dark">
      <CodeBlock code={sampleCode} language="typescript" title="defineTheme with syntax: dracula" hasLineNumbers />
    </Theme>
}`,...G.parameters?.docs?.source}}},K=[`OneDarkPro`,`Dracula`,`Monokai`,`Nord`,`TokyoNight`,`CatppuccinMocha`,`GitHubLight`,`GitHubDark`,`SolarizedLight`,`OneLight`,`CatppuccinLatte`,`TokyoNightLight`,`AllThemesGallery`,`NestedOverride`,`CustomTheme`,`ThemeWithSyntaxDefaults`]}))();export{B as AllThemesGallery,L as CatppuccinLatte,M as CatppuccinMocha,U as CustomTheme,O as Dracula,P as GitHubDark,N as GitHubLight,k as Monokai,V as NestedOverride,A as Nord,D as OneDarkPro,I as OneLight,F as SolarizedLight,G as ThemeWithSyntaxDefaults,j as TokyoNight,R as TokyoNightLight,K as __namedExportsOrder,E as default};