import{a1 as e,ah as T,G as j}from"./iframe-CF49Wwf0.js";import{a as b,c as C,b as N,d as v,g as D,e as P,m as U,n as G,o as w,f as H,s as M,t as A,h as _,S as k}from"./presets-DPU8B5WR.js";import{C as S}from"./CodeEditor-BlWrrnfL.js";import"./preload-helper-Ct5FWWRu.js";import"./highlightRanges-mQha3A3A.js";const z=["import {useState, useEffect} from 'react';","","interface User {","  id: string;","  name: string;","  roles: string[];","}","",'const API_URL = "https://api.example.com";',"const MAX_RETRIES = 3;","","// Fetch user data with retry logic","async function fetchUser(id: string): Promise<User> {","  const response = await fetch(`${API_URL}/users/${id}`);","  if (!response.ok) {","    throw new Error(`HTTP ${response.status}`);","  }","  return response.json();","}","","export function UserCard({id}: {id: string}) {","  const [user, setUser] = useState<User | null>(null);","","  useEffect(() => {","    fetchUser(id).then(setUser);","  }, [id]);","","  if (!user) return <div>Loading...</div>;","","  return (",'    <div className="card">',"      <h2>{user.name}</h2>","      <span>{user.roles.length} roles</span>","    </div>","  );","}"].join(`
`);function r({theme:t,_title:x,initialCode:y=z}){const[E,L]=T.useState(y);return e.jsx(k,{theme:t,children:e.jsx(S,{value:E,onChange:L,language:"typescript",hasLineNumbers:!0})})}const X={title:"Lab/CodeEditorTheme",parameters:{docs:{description:{component:"Syntax theme showcase for CodeEditor. All themes from SyntaxTheme work identically on both CodeBlock and CodeEditor."}}}},s={render:()=>e.jsx(r,{theme:w})},a={render:()=>e.jsx(r,{theme:v})},o={render:()=>e.jsx(r,{theme:U})},n={render:()=>e.jsx(r,{theme:G})},c={render:()=>e.jsx(r,{theme:A})},d={render:()=>e.jsx(r,{theme:N})},i={render:()=>e.jsx(r,{theme:P})},m={render:()=>e.jsx(r,{theme:D})},p={render:()=>e.jsx(r,{theme:M})},u={render:()=>e.jsx(r,{theme:H})},h={render:()=>e.jsx(r,{theme:C})},l={render:()=>e.jsx(r,{theme:_})},O=["const greet = (name: string) => {","  // Say hello","  return `Hello, ${name}!`;","};","",'const result = greet("World");',"console.log(result); // Hello, World!"].join(`
`);function R({theme:t}){const[x,y]=T.useState(O);return e.jsx(k,{theme:t,children:e.jsxs("div",{children:[e.jsx("div",{style:{fontSize:11,fontWeight:600,color:"#888",marginBottom:4,fontFamily:"monospace"},children:t.name}),e.jsx(S,{value:x,onChange:y,language:"typescript",hasLineNumbers:!0})]})})}const g={render:()=>e.jsx("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,padding:16},children:b.map(t=>e.jsx(R,{theme:t},t.name))}),parameters:{layout:"fullscreen"}},$=j({name:"cyberpunk",tokens:{keyword:"#ff2a6d",string:"#05d9e8",comment:"#4a5568",number:"#d1f7ff",function:"#ff6ac1",type:"#7efff5",variable:"#e2e8f0",operator:"#ff9e64",constant:"#d1f7ff",tag:"#ff2a6d",attribute:"#7efff5",property:"#05d9e8",punctuation:"#718096",background:"#0d0221"}}),f={render:()=>e.jsx(r,{theme:$})};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  render: () => <ThemedEditor theme={oneDarkPro} />
}`,...s.parameters?.docs?.source}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  render: () => <ThemedEditor theme={dracula} />
}`,...a.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  render: () => <ThemedEditor theme={monokai} />
}`,...o.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  render: () => <ThemedEditor theme={nord} />
}`,...n.parameters?.docs?.source}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  render: () => <ThemedEditor theme={tokyoNight} />
}`,...c.parameters?.docs?.source}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  render: () => <ThemedEditor theme={catppuccinMocha} />
}`,...d.parameters?.docs?.source}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  render: () => <ThemedEditor theme={githubLight} />
}`,...i.parameters?.docs?.source}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  render: () => <ThemedEditor theme={githubDark} />
}`,...m.parameters?.docs?.source}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  render: () => <ThemedEditor theme={solarizedLight} />
}`,...p.parameters?.docs?.source}}};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  render: () => <ThemedEditor theme={oneLight} />
}`,...u.parameters?.docs?.source}}};h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  render: () => <ThemedEditor theme={catppuccinLatte} />
}`,...h.parameters?.docs?.source}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  render: () => <ThemedEditor theme={tokyoNightLight} />
}`,...l.parameters?.docs?.source}}};g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
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
}`,...g.parameters?.docs?.source}}};f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  render: () => <ThemedEditor theme={cyberpunk} />
}`,...f.parameters?.docs?.source}}};const q=["OneDarkPro","Dracula","Monokai","Nord","TokyoNight","CatppuccinMocha","GitHubLight","GitHubDark","SolarizedLight","OneLight","CatppuccinLatte","TokyoNightLight","AllThemesGallery","CustomTheme"];export{g as AllThemesGallery,h as CatppuccinLatte,d as CatppuccinMocha,f as CustomTheme,a as Dracula,m as GitHubDark,i as GitHubLight,o as Monokai,n as Nord,s as OneDarkPro,u as OneLight,p as SolarizedLight,c as TokyoNight,l as TokyoNightLight,q as __namedExportsOrder,X as default};
