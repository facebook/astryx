import{i as e,s as t}from"./preload-helper-CT_b8DTk.js";import{t as n}from"./react-B7Te67-h.js";import{N as r,P as i}from"./ime-cU6wEDvZ.js";import{a,t as o}from"./utils-D5DpoGFT.js";import{t as s}from"./jsx-runtime-DqZldVDK.js";import{t as c}from"./Icon-BF66ESdm.js";import{t as l}from"./Icon-C3SsLzuI.js";import{t as u}from"./Tooltip-DrD5DpJJ.js";import{t as d}from"./Tooltip-DXjC-yM9.js";function f({content:e,label:t=`More information`,size:n=`sm`}){let[r,o]=(0,p.useState)(!1),s=(0,p.useRef)(!1),l=(0,p.useCallback)(e=>{s.current=e},[]),d=(0,p.useCallback)(e=>{e.key===`Escape`&&s.current&&(e.stopPropagation(),o(!0))},[]),f=(0,p.useCallback)(()=>{o(!1)},[]);return(0,m.jsx)(u,{content:e,touchTrigger:`tap`,isOpen:r?!1:void 0,onOpenChange:l,children:(0,m.jsx)(`button`,{type:`button`,"aria-label":t,onKeyDown:d,onBlur:f,onMouseLeave:f,...i(a.focusVisible,h.trigger),children:(0,m.jsx)(c,{icon:`info`,size:n})})})}var p,m,h,g=e((()=>{p=t(n()),r(),l(),d(),o(),m=s(),h={trigger:{k1xSpc:`astryx3nfvp2`,kGNEyG:`astryx6s0dn4`,kjj79g:`astryxl56j7k`,kXLuUW:`astryxxymvpz`,kmVPX3:`astryx12nba7r`,kg3NbH:null,kuDDbn:null,kE3dHu:null,kP0aTx:null,kpe85a:null,k8WAf4:null,kLKAdn:null,kGO01o:null,kogj98:`astryx1ghz6dp`,kUOVxO:null,keTefX:null,koQZXg:null,k71WvV:null,km5ZXQ:null,kqGvvJ:null,keoZOQ:null,k1K539:null,ksu8eU:`astryxng3xce`,kJRH4f:null,kVhnKS:null,k4WBpm:null,k8ry5P:null,kSWEuD:null,kDUl1X:null,kPef9Z:null,kfdmCh:null,kWkggS:`astryxjbqb8w`,kaIpWk:`astryxjspbzw`,krdFHd:null,kfmiAY:null,kVL7Gh:null,kT0f0o:null,kIxVMA:null,ksF3WI:null,kqGeR4:null,kYm2EN:null,kkrTdU:`astryx1ypdohk`,kMwMTN:`astryxv9yike astryx10ue8fs`,k1ekBW:`astryxt3l3uh`,kIyJzY:`astryxuedmi6`,kAMwcw:`astryxlr8y92`,$$css:!0}},f.displayName=`InfoTip`,f.__docgenInfo={description:`An inline info-icon help affordance: a small "i" button that reveals a
tooltip on hover, keyboard focus, and tap. Use it next to labels, values,
and metrics for permission notes, metric definitions, and field help.

The value over hand-composing Icon inside Tooltip is the pre-wired
accessible trigger: a real button with an aria-label, Tab-reachable,
tooltip on hover AND focus, and Escape dismissal.

Composed entirely from core primitives (Tooltip + Icon); the info icon
resolves from the global icon registry, so themes can override it.

@example
\`\`\`
<InfoTip content="Editors can change this field; viewers cannot." />
<InfoTip content="30-day rolling average." label="About this metric" />
\`\`\``,methods:[],displayName:`InfoTip`,props:{content:{required:!0,tsType:{name:`ReactNode`},description:"Content to display in the tooltip.\nTypically short, non-interactive text. Mirrors Tooltip's `content` prop."},label:{required:!1,tsType:{name:`string`},description:`Accessible name for the trigger button.
@default 'More information'`,defaultValue:{value:`'More information'`,computed:!1}},size:{required:!1,tsType:{name:`unknown`},description:`Size of the info icon.
@default 'sm'`,defaultValue:{value:`'sm'`,computed:!1}}}}})),_=e((()=>{g()}));export{f as n,g as r,_ as t};