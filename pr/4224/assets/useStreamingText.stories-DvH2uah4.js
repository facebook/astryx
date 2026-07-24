import{a as e,n as t}from"./rolldown-runtime-DaJ6WEGw.js";import{t as n}from"./react-DvlgmmzG.js";import{t as r}from"./Text-Bs-khaxO.js";import{t as i}from"./jsx-runtime-cM__dR4X.js";import{t as a}from"./Button-Cx-mMzJ7.js";import{t as o}from"./Button-D1MmXezA.js";import{t as s}from"./hooks-B6Vhwbg_.js";import{n as c}from"./useStreamingText-DvEZ_3XR.js";import{i as l}from"./Stack-mterni5z.js";import{t as u}from"./Layout-BbT8IvUw.js";import{t as d}from"./Text-DRSNMNB3.js";function f({text:e,speed:t,chunkSize:n,chunkIntervalMs:i}){let[o,s]=(0,p.useState)(``),[u,d]=(0,p.useState)(!1),f=(0,p.useRef)(0),h=(0,p.useRef)(null),g=c(o,u,{speed:t}),_=(0,p.useCallback)(()=>{h.current&&clearInterval(h.current),f.current=0,s(``),d(!0),h.current=setInterval(()=>{f.current=Math.min(f.current+n,e.length),s(e.slice(0,f.current)),f.current>=e.length&&(h.current&&clearInterval(h.current),h.current=null,setTimeout(()=>d(!1),200))},i)},[e,n,i]);return(0,p.useEffect)(()=>()=>{h.current&&clearInterval(h.current)},[]),(0,m.jsxs)(l,{gap:4,children:[(0,m.jsxs)(`div`,{style:{display:`flex`,gap:8,alignItems:`center`},children:[(0,m.jsx)(a,{label:u?`Streaming...`:`Start`,onClick:_,variant:u?`secondary`:`primary`,isDisabled:u}),(0,m.jsxs)(r,{type:`supporting`,children:[`speed: `,t,` · chunk: `,n,` chars every `,i,`ms`]})]}),(0,m.jsx)(`div`,{style:{padding:16,borderRadius:8,background:`var(--color-background-muted)`,minHeight:80,whiteSpace:`pre-wrap`,fontFamily:`var(--font-family-body)`},children:(0,m.jsx)(r,{type:`body`,children:g||`\xA0`})}),(0,m.jsxs)(r,{type:`supporting`,children:[g.length,` / `,o.length,` chars displayed`,u?` · streaming`:o.length>0?` · done`:``]})]})}var p,m,h,g,_,v,y,b,x,S;t((()=>{p=e(n()),s(),d(),o(),u(),m=i(),h=`Here is how you fetch a user in TypeScript:

const response = await fetch("/api/users/" + id);
const user = await response.json();

Key points:
- Always check response.ok before parsing
- Use AbortController for cancellation
- Consider a useUser hook for React apps

This approach gives you type-safe API calls with proper error handling.`,g={title:`Core/useStreamingText`,component:f,tags:[`autodocs`],argTypes:{speed:{control:`select`,options:[`natural`,`fast`,`instant`]},chunkSize:{control:{type:`range`,min:1,max:100,step:1}},chunkIntervalMs:{control:{type:`range`,min:10,max:500,step:10}},text:{control:`text`}}},_={args:{text:h,speed:`natural`,chunkSize:20,chunkIntervalMs:50}},v={args:{text:h,speed:`fast`,chunkSize:20,chunkIntervalMs:50}},y={args:{text:h,speed:`instant`,chunkSize:20,chunkIntervalMs:50}},b={name:`Bursty chunks (large backlog)`,args:{text:h,speed:`natural`,chunkSize:80,chunkIntervalMs:200}},x={name:`Slow trickle`,args:{text:h,speed:`natural`,chunkSize:1,chunkIntervalMs:100}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: {
    text: SAMPLE_TEXT,
    speed: 'natural',
    chunkSize: 20,
    chunkIntervalMs: 50
  }
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    text: SAMPLE_TEXT,
    speed: 'fast',
    chunkSize: 20,
    chunkIntervalMs: 50
  }
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    text: SAMPLE_TEXT,
    speed: 'instant',
    chunkSize: 20,
    chunkIntervalMs: 50
  }
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  name: 'Bursty chunks (large backlog)',
  args: {
    text: SAMPLE_TEXT,
    speed: 'natural',
    chunkSize: 80,
    chunkIntervalMs: 200
  }
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  name: 'Slow trickle',
  args: {
    text: SAMPLE_TEXT,
    speed: 'natural',
    chunkSize: 1,
    chunkIntervalMs: 100
  }
}`,...x.parameters?.docs?.source}}},S=[`Natural`,`Fast`,`Instant`,`BurstyChunks`,`SlowTrickle`]}))();export{b as BurstyChunks,v as Fast,y as Instant,_ as Natural,x as SlowTrickle,S as __namedExportsOrder,g as default};