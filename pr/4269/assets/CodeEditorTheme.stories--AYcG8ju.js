import{i as e,s as t}from"./preload-helper-CT_b8DTk.js";import{t as n}from"./react-B7Te67-h.js";import{t as r}from"./jsx-runtime-DqZldVDK.js";import{_ as i,a,c as o,d as s,f as c,g as l,h as u,i as d,m as f,n as p,o as m,p as h,r as g,s as _,u as v,y}from"./theme-BbPe9nGA.js";import{jn as b,t as x}from"./src-CfNCRERC.js";function S({theme:e,_title:t,initialCode:n=E}){let[r,a]=(0,w.useState)(n);return(0,T.jsx)(i,{theme:e,children:(0,T.jsx)(b,{label:`Code editor`,value:r,onChange:a,language:`typescript`,hasLineNumbers:!0})})}function C({theme:e}){let[t,n]=(0,w.useState)(B);return(0,T.jsx)(i,{theme:e,children:(0,T.jsxs)(`div`,{children:[(0,T.jsx)(`div`,{style:{fontSize:11,fontWeight:600,color:`#888`,marginBottom:4,fontFamily:`monospace`},children:e.name}),(0,T.jsx)(b,{value:t,onChange:n,language:`typescript`,label:`Code editor`,hasLineNumbers:!0})]})})}var w,T,E,D,O,k,A,j,M,N,P,F,I,L,R,z,B,V,H,U,W;e((()=>{w=t(n()),x(),p(),T=r(),E=[`import {useState, useEffect} from 'react';`,``,`interface User {`,`  id: string;`,`  name: string;`,`  roles: string[];`,`}`,``,`const API_URL = "https://api.example.com";`,`const MAX_RETRIES = 3;`,``,`// Fetch user data with retry logic`,`async function fetchUser(id: string): Promise<User> {`,"  const response = await fetch(`${API_URL}/users/${id}`);",`  if (!response.ok) {`,"    throw new Error(`HTTP ${response.status}`);",`  }`,`  return response.json();`,`}`,``,`export function UserCard({id}: {id: string}) {`,`  const [user, setUser] = useState<User | null>(null);`,``,`  useEffect(() => {`,`    fetchUser(id).then(setUser);`,`  }, [id]);`,``,`  if (!user) return <div>Loading...</div>;`,``,`  return (`,`    <div className="card">`,`      <h2>{user.name}</h2>`,`      <span>{user.roles.length} roles</span>`,`    </div>`,`  );`,`}`].join(`
`),D={title:`Lab/CodeEditorTheme`,parameters:{docs:{description:{component:`Syntax theme showcase for CodeEditor. All themes from SyntaxTheme work identically on both CodeBlock and CodeEditor.`}}}},O={render:()=>(0,T.jsx)(S,{theme:c})},k={render:()=>(0,T.jsx)(S,{theme:m})},A={render:()=>(0,T.jsx)(S,{theme:v})},j={render:()=>(0,T.jsx)(S,{theme:s})},M={render:()=>(0,T.jsx)(S,{theme:u})},N={render:()=>(0,T.jsx)(S,{theme:a})},P={render:()=>(0,T.jsx)(S,{theme:o})},F={render:()=>(0,T.jsx)(S,{theme:_})},I={render:()=>(0,T.jsx)(S,{theme:f})},L={render:()=>(0,T.jsx)(S,{theme:h})},R={render:()=>(0,T.jsx)(S,{theme:d})},z={render:()=>(0,T.jsx)(S,{theme:l})},B=[`const greet = (name: string) => {`,`  // Say hello`,"  return `Hello, ${name}!`;",`};`,``,`const result = greet("World");`,`console.log(result); // Hello, World!`].join(`
`),V={render:()=>(0,T.jsx)(`div`,{style:{display:`grid`,gridTemplateColumns:`1fr 1fr`,gap:16,padding:16},children:g.map(e=>(0,T.jsx)(C,{theme:e},e.name))}),parameters:{layout:`fullscreen`}},H=y({name:`cyberpunk`,tokens:{keyword:`#ff2a6d`,string:`#05d9e8`,comment:`#4a5568`,number:`#d1f7ff`,function:`#ff6ac1`,type:`#7efff5`,variable:`#e2e8f0`,operator:`#ff9e64`,constant:`#d1f7ff`,tag:`#ff2a6d`,attribute:`#7efff5`,property:`#05d9e8`,punctuation:`#718096`,background:`#0d0221`}}),U={render:()=>(0,T.jsx)(S,{theme:H})},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
  render: () => <ThemedEditor theme={oneDarkPro} />
}`,...O.parameters?.docs?.source}}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  render: () => <ThemedEditor theme={dracula} />
}`,...k.parameters?.docs?.source}}},A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  render: () => <ThemedEditor theme={monokai} />
}`,...A.parameters?.docs?.source}}},j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
  render: () => <ThemedEditor theme={nord} />
}`,...j.parameters?.docs?.source}}},M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
  render: () => <ThemedEditor theme={tokyoNight} />
}`,...M.parameters?.docs?.source}}},N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
  render: () => <ThemedEditor theme={catppuccinMocha} />
}`,...N.parameters?.docs?.source}}},P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
  render: () => <ThemedEditor theme={githubLight} />
}`,...P.parameters?.docs?.source}}},F.parameters={...F.parameters,docs:{...F.parameters?.docs,source:{originalSource:`{
  render: () => <ThemedEditor theme={githubDark} />
}`,...F.parameters?.docs?.source}}},I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{
  render: () => <ThemedEditor theme={solarizedLight} />
}`,...I.parameters?.docs?.source}}},L.parameters={...L.parameters,docs:{...L.parameters?.docs,source:{originalSource:`{
  render: () => <ThemedEditor theme={oneLight} />
}`,...L.parameters?.docs?.source}}},R.parameters={...R.parameters,docs:{...R.parameters?.docs,source:{originalSource:`{
  render: () => <ThemedEditor theme={catppuccinLatte} />
}`,...R.parameters?.docs?.source}}},z.parameters={...z.parameters,docs:{...z.parameters?.docs,source:{originalSource:`{
  render: () => <ThemedEditor theme={tokyoNightLight} />
}`,...z.parameters?.docs?.source}}},V.parameters={...V.parameters,docs:{...V.parameters?.docs,source:{originalSource:`{
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
}`,...V.parameters?.docs?.source}}},U.parameters={...U.parameters,docs:{...U.parameters?.docs,source:{originalSource:`{
  render: () => <ThemedEditor theme={cyberpunk} />
}`,...U.parameters?.docs?.source}}},W=[`OneDarkPro`,`Dracula`,`Monokai`,`Nord`,`TokyoNight`,`CatppuccinMocha`,`GitHubLight`,`GitHubDark`,`SolarizedLight`,`OneLight`,`CatppuccinLatte`,`TokyoNightLight`,`AllThemesGallery`,`CustomTheme`]}))();export{V as AllThemesGallery,R as CatppuccinLatte,N as CatppuccinMocha,U as CustomTheme,k as Dracula,F as GitHubDark,P as GitHubLight,A as Monokai,j as Nord,O as OneDarkPro,L as OneLight,I as SolarizedLight,M as TokyoNight,z as TokyoNightLight,W as __namedExportsOrder,D as default};