import{i as e}from"./preload-helper-CT_b8DTk.js";import{F as t,P as n}from"./ime-Dy4QRKoo.js";import{a as r,t as i}from"./utils-HJIp2CYO.js";import{t as a}from"./jsx-runtime-DqZldVDK.js";import{t as o}from"./Icon-CDNRBkXA.js";import{t as s}from"./Icon-B1Jcw32f.js";import{t as c}from"./Tooltip-Cc0qWDti.js";import{t as l}from"./Tooltip-DmPgQ55f.js";function u({content:e,label:n=`More information`,size:i=`sm`}){return(0,d.jsx)(c,{content:e,touchTrigger:`tap`,children:(0,d.jsx)(`button`,{type:`button`,"aria-label":n,...t(r.focusVisible,f.trigger),children:(0,d.jsx)(o,{icon:`info`,size:i})})})}var d,f,p=e((()=>{n(),s(),l(),i(),d=a(),f={trigger:{k1xSpc:`astryx3nfvp2`,kGNEyG:`astryx6s0dn4`,kjj79g:`astryxl56j7k`,kXLuUW:`astryxxymvpz`,kmVPX3:`astryx12nba7r`,kg3NbH:null,kuDDbn:null,kE3dHu:null,kP0aTx:null,kpe85a:null,k8WAf4:null,kLKAdn:null,kGO01o:null,kogj98:`astryx1ghz6dp`,kUOVxO:null,keTefX:null,koQZXg:null,k71WvV:null,km5ZXQ:null,kqGvvJ:null,keoZOQ:null,k1K539:null,ksu8eU:`astryxng3xce`,kJRH4f:null,kVhnKS:null,k4WBpm:null,k8ry5P:null,kSWEuD:null,kDUl1X:null,kPef9Z:null,kfdmCh:null,kWkggS:`astryxjbqb8w`,kaIpWk:`astryxjspbzw`,krdFHd:null,kfmiAY:null,kVL7Gh:null,kT0f0o:null,kIxVMA:null,ksF3WI:null,kqGeR4:null,kYm2EN:null,kkrTdU:`astryx1ypdohk astryx16khyan`,kMwMTN:`astryxv9yike astryx10ue8fs`,k1ekBW:`astryxt3l3uh`,kIyJzY:`astryxuedmi6`,kAMwcw:`astryxlr8y92`,$$css:!0}},u.displayName=`InfoTip`,u.__docgenInfo={description:`An inline info-icon help affordance: a small "i" button that reveals a
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
@default 'sm'`,defaultValue:{value:`'sm'`,computed:!1}}}}})),m=e((()=>{p()}));export{u as n,p as r,m as t};