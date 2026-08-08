import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{t}from"./react-BZJXY1be.js";import{t as n}from"./jsx-runtime-DeHZSEgm.js";import{n as r,t as i}from"./defineSyntaxTheme-BuHO9vdQ.js";import{n as a,t as o}from"./SyntaxTheme-BUEqiBCN.js";import{a as s,c,d as l,f as u,i as d,l as f,m as p,n as m,o as h,p as g,r as _,s as v,t as y,u as b}from"./presets-BFyOw76A.js";import{n as x,t as S}from"./CodeEditor-DBtJwI04.js";function C({theme:e,_title:t,initialCode:n=D}){let[r,i]=(0,T.useState)(n);return(0,E.jsx)(o,{theme:e,children:(0,E.jsx)(S,{label:`Code editor`,value:r,onChange:i,language:`typescript`,hasLineNumbers:!0})})}function w({theme:e}){let[t,n]=(0,T.useState)(V);return(0,E.jsx)(o,{theme:e,children:(0,E.jsxs)(`div`,{children:[(0,E.jsx)(`div`,{style:{fontSize:11,fontWeight:600,color:`#888`,marginBottom:4,fontFamily:`monospace`},children:e.name}),(0,E.jsx)(S,{value:t,onChange:n,language:`typescript`,label:`Code editor`,hasLineNumbers:!0})]})})}var T,E,D,O,k,A,j,M,N,P,F,I,L,R,z,B,V,H,U,W,G;function K(){return(K=e((()=>{T=t(),x(),a(),r(),v(),E=n(),D=[`import {useState, useEffect} from 'react';`,``,`interface User {`,`  id: string;`,`  name: string;`,`  roles: string[];`,`}`,``,`const API_URL = "https://api.example.com";`,`const MAX_RETRIES = 3;`,``,`// Fetch user data with retry logic`,`async function fetchUser(id: string): Promise<User> {`,"  const response = await fetch(`${API_URL}/users/${id}`);",`  if (!response.ok) {`,"    throw new Error(`HTTP ${response.status}`);",`  }`,`  return response.json();`,`}`,``,`export function UserCard({id}: {id: string}) {`,`  const [user, setUser] = useState<User | null>(null);`,``,`  useEffect(() => {`,`    fetchUser(id).then(setUser);`,`  }, [id]);`,``,`  if (!user) return <div>Loading...</div>;`,``,`  return (`,`    <div className="card">`,`      <h2>{user.name}</h2>`,`      <span>{user.roles.length} roles</span>`,`    </div>`,`  );`,`}`].join(`
`),O={title:`Lab/CodeEditorTheme`,parameters:{docs:{description:{component:`Syntax theme showcase for CodeEditor. All themes from SyntaxTheme work identically on both CodeBlock and CodeEditor.`}}}},k={render:()=>(0,E.jsx)(C,{theme:b})},A={render:()=>(0,E.jsx)(C,{theme:d})},j={render:()=>(0,E.jsx)(C,{theme:c})},M={render:()=>(0,E.jsx)(C,{theme:f})},N={render:()=>(0,E.jsx)(C,{theme:g})},P={render:()=>(0,E.jsx)(C,{theme:_})},F={render:()=>(0,E.jsx)(C,{theme:h})},I={render:()=>(0,E.jsx)(C,{theme:s})},L={render:()=>(0,E.jsx)(C,{theme:u})},R={render:()=>(0,E.jsx)(C,{theme:l})},z={render:()=>(0,E.jsx)(C,{theme:m})},B={render:()=>(0,E.jsx)(C,{theme:p})},V=[`const greet = (name: string) => {`,`  // Say hello`,"  return `Hello, ${name}!`;",`};`,``,`const result = greet("World");`,`console.log(result); // Hello, World!`].join(`
`),H={render:()=>(0,E.jsx)(`div`,{style:{display:`grid`,gridTemplateColumns:`1fr 1fr`,gap:16,padding:16},children:y.map(e=>(0,E.jsx)(w,{theme:e},e.name))}),parameters:{layout:`fullscreen`}},U=i({name:`cyberpunk`,tokens:{keyword:`#ff2a6d`,string:`#05d9e8`,comment:`#4a5568`,number:`#d1f7ff`,function:`#ff6ac1`,type:`#7efff5`,variable:`#e2e8f0`,operator:`#ff9e64`,constant:`#d1f7ff`,tag:`#ff2a6d`,attribute:`#7efff5`,property:`#05d9e8`,punctuation:`#718096`,background:`#0d0221`}}),W={render:()=>(0,E.jsx)(C,{theme:U})},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  render: () => <ThemedEditor theme={oneDarkPro} />
}`,...k.parameters?.docs?.source}}},A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  render: () => <ThemedEditor theme={dracula} />
}`,...A.parameters?.docs?.source}}},j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
  render: () => <ThemedEditor theme={monokai} />
}`,...j.parameters?.docs?.source}}},M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
  render: () => <ThemedEditor theme={nord} />
}`,...M.parameters?.docs?.source}}},N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
  render: () => <ThemedEditor theme={tokyoNight} />
}`,...N.parameters?.docs?.source}}},P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
  render: () => <ThemedEditor theme={catppuccinMocha} />
}`,...P.parameters?.docs?.source}}},F.parameters={...F.parameters,docs:{...F.parameters?.docs,source:{originalSource:`{
  render: () => <ThemedEditor theme={githubLight} />
}`,...F.parameters?.docs?.source}}},I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{
  render: () => <ThemedEditor theme={githubDark} />
}`,...I.parameters?.docs?.source}}},L.parameters={...L.parameters,docs:{...L.parameters?.docs,source:{originalSource:`{
  render: () => <ThemedEditor theme={solarizedLight} />
}`,...L.parameters?.docs?.source}}},R.parameters={...R.parameters,docs:{...R.parameters?.docs,source:{originalSource:`{
  render: () => <ThemedEditor theme={oneLight} />
}`,...R.parameters?.docs?.source}}},z.parameters={...z.parameters,docs:{...z.parameters?.docs,source:{originalSource:`{
  render: () => <ThemedEditor theme={catppuccinLatte} />
}`,...z.parameters?.docs?.source}}},B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
  render: () => <ThemedEditor theme={tokyoNightLight} />
}`,...B.parameters?.docs?.source}}},H.parameters={...H.parameters,docs:{...H.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 16,
    padding: 16
  }}>
      {allSyntaxPresets.map(theme => <GalleryEditor key={theme.name} theme={theme} />)}
    </div>,
  parameters: {
    layout: 'fullscreen'
  }
}`,...H.parameters?.docs?.source}}},W.parameters={...W.parameters,docs:{...W.parameters?.docs,source:{originalSource:`{
  render: () => <ThemedEditor theme={cyberpunk} />
}`,...W.parameters?.docs?.source}}},G=[`OneDarkPro`,`Dracula`,`Monokai`,`Nord`,`TokyoNight`,`CatppuccinMocha`,`GitHubLight`,`GitHubDark`,`SolarizedLight`,`OneLight`,`CatppuccinLatte`,`TokyoNightLight`,`AllThemesGallery`,`CustomTheme`]})))()}K();export{H as AllThemesGallery,z as CatppuccinLatte,P as CatppuccinMocha,W as CustomTheme,A as Dracula,I as GitHubDark,F as GitHubLight,j as Monokai,M as Nord,k as OneDarkPro,R as OneLight,L as SolarizedLight,N as TokyoNight,B as TokyoNightLight,G as __namedExportsOrder,O as default};