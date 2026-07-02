import{ah as t,a1 as r,B as T,T as h}from"./iframe-BAsU9Dt9.js";import{u as v}from"./useStreamingText-CcrGW2FR.js";import{V as I}from"./VStack-DJ3kH3RZ.js";import"./preload-helper-Ct5FWWRu.js";import"./Stack-CKRWU4oS.js";import"./stack.stylex-BlarxY2N.js";import"./padding.stylex-Dl2_Pyt1.js";function E({text:c,speed:k,chunkSize:m,chunkIntervalMs:d}){const[g,S]=t.useState(""),[n,f]=t.useState(!1),s=t.useRef(0),e=t.useRef(null),x=v(g,n,{speed:k}),y=t.useCallback(()=>{e.current&&clearInterval(e.current),s.current=0,S(""),f(!0),e.current=setInterval(()=>{s.current=Math.min(s.current+m,c.length),S(c.slice(0,s.current)),s.current>=c.length&&(e.current&&clearInterval(e.current),e.current=null,setTimeout(()=>f(!1),200))},d)},[c,m,d]);return t.useEffect(()=>()=>{e.current&&clearInterval(e.current)},[]),r.jsxs(I,{gap:4,children:[r.jsxs("div",{style:{display:"flex",gap:8,alignItems:"center"},children:[r.jsx(T,{label:n?"Streaming...":"Start",onClick:y,variant:n?"secondary":"primary",isDisabled:n}),r.jsxs(h,{type:"supporting",children:["speed: ",k," · chunk: ",m," chars every ",d,"ms"]})]}),r.jsx("div",{style:{padding:16,borderRadius:8,background:"var(--color-background-muted)",minHeight:80,whiteSpace:"pre-wrap",fontFamily:"var(--font-family-body)"},children:r.jsx(h,{type:"body",children:x||" "})}),r.jsxs(h,{type:"supporting",children:[x.length," / ",g.length," chars displayed",n?" · streaming":g.length>0?" · done":""]})]})}const a=`Here is how you fetch a user in TypeScript:

const response = await fetch("/api/users/" + id);
const user = await response.json();

Key points:
- Always check response.ok before parsing
- Use AbortController for cancellation
- Consider a useUser hook for React apps

This approach gives you type-safe API calls with proper error handling.`,C={title:"Core/useStreamingText",component:E,tags:["autodocs"],argTypes:{speed:{control:"select",options:["natural","fast","instant"]},chunkSize:{control:{type:"range",min:1,max:100,step:1}},chunkIntervalMs:{control:{type:"range",min:10,max:500,step:10}},text:{control:"text"}}},o={args:{text:a,speed:"natural",chunkSize:20,chunkIntervalMs:50}},i={args:{text:a,speed:"fast",chunkSize:20,chunkIntervalMs:50}},u={args:{text:a,speed:"instant",chunkSize:20,chunkIntervalMs:50}},l={name:"Bursty chunks (large backlog)",args:{text:a,speed:"natural",chunkSize:80,chunkIntervalMs:200}},p={name:"Slow trickle",args:{text:a,speed:"natural",chunkSize:1,chunkIntervalMs:100}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    text: SAMPLE_TEXT,
    speed: 'natural',
    chunkSize: 20,
    chunkIntervalMs: 50
  }
}`,...o.parameters?.docs?.source}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  args: {
    text: SAMPLE_TEXT,
    speed: 'fast',
    chunkSize: 20,
    chunkIntervalMs: 50
  }
}`,...i.parameters?.docs?.source}}};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    text: SAMPLE_TEXT,
    speed: 'instant',
    chunkSize: 20,
    chunkIntervalMs: 50
  }
}`,...u.parameters?.docs?.source}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  name: 'Bursty chunks (large backlog)',
  args: {
    text: SAMPLE_TEXT,
    speed: 'natural',
    chunkSize: 80,
    chunkIntervalMs: 200
  }
}`,...l.parameters?.docs?.source}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  name: 'Slow trickle',
  args: {
    text: SAMPLE_TEXT,
    speed: 'natural',
    chunkSize: 1,
    chunkIntervalMs: 100
  }
}`,...p.parameters?.docs?.source}}};const P=["Natural","Fast","Instant","BurstyChunks","SlowTrickle"];export{l as BurstyChunks,i as Fast,u as Instant,o as Natural,p as SlowTrickle,P as __namedExportsOrder,C as default};
