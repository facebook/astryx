import{i as e,s as t}from"./preload-helper-CT_b8DTk.js";import{t as n}from"./react-B7Te67-h.js";import{D as r,E as i,F as a,P as o}from"./ime-Dy4QRKoo.js";import{F as s,t as c}from"./utils-DFvHPb-W.js";import{t as l}from"./jsx-runtime-DqZldVDK.js";function u(){if(typeof navigator>`u`)return!1;let e=`userAgentData`in navigator?navigator.userAgentData:null;if(e&&typeof e==`object`&&`platform`in e){let t=e.platform,n=typeof t==`string`?t.trim():``;if(n!==``&&n.toLowerCase()!==`unknown`)return/mac/i.test(n)}return/Mac|iPhone|iPad|iPod/.test(navigator.platform??``)}var d=e((()=>{}));function f(e,t){return e===`mod`?t?`⌘`:`Ctrl`:b[e]??e.toUpperCase()}function p(e,t){return e===`mod`?t?`Command`:`Control`:x[e]??e.toUpperCase()}function m(){return()=>{}}function h(){return!1}function g({keys:e,ref:t,xstyle:n,className:i,style:o,...c}){let l=(0,_.useSyncExternalStore)(m,u,h),d=e.split(`+`).map(e=>e.trim().toLowerCase()),g=d.map(e=>p(e,l)).join(` + `);return(0,v.jsx)(`span`,{...c,ref:t,role:`img`,"aria-label":g,...s(r(`kbd`),a(y.wrapper,n),i,o),children:d.map(e=>(0,v.jsx)(`kbd`,{"aria-hidden":`true`,className:`astryx3nfvp2 astryx6s0dn4 astryxl56j7k astryx16asifk astryx1grt7ep astryx7a5moj astryxx3sua9 astryx17x4s8c astryxlxy82 astryx1q0q8m5 astryxib2hle astryxv1l7n4 astryx9ynric astryx141an7d astryx1e4wzip astryx1ltkj2j astryx87ps6o`,children:f(e,l)},e))})}var _,v,y,b,x,S=e((()=>{_=t(n(),1),o(),c(),d(),i(),v=l(),y={wrapper:{k1xSpc:`astryx3nfvp2`,kGNEyG:`astryx6s0dn4`,kOIVth:`astryxzye2dw`,kmuXW:`astryx2lah0s`,$$css:!0}},b={ctrl:`⌃`,alt:`⌥`,shift:`⇧`,enter:`↵`,backspace:`⌫`,escape:`Esc`,tab:`⇥`,up:`↑`,down:`↓`,left:`←`,right:`→`,plus:`+`},x={ctrl:`Control`,alt:`Alt`,shift:`Shift`,enter:`Enter`,backspace:`Backspace`,escape:`Escape`,tab:`Tab`,up:`Up arrow`,down:`Down arrow`,left:`Left arrow`,right:`Right arrow`,plus:`Plus`},g.displayName=`Kbd`,g.__docgenInfo={description:`Displays a keyboard shortcut as styled <kbd> elements.

A general-purpose component for rendering keyboard shortcuts
anywhere in the system — tooltips, menus, documentation, etc.

Platform-aware: \`mod\` renders as ⌘ on macOS and Ctrl elsewhere.
SSR-safe — defers platform detection through useSyncExternalStore to avoid
hydration mismatches.

@example
\`\`\`
<Kbd keys="mod+k" />
\`\`\``,methods:[],displayName:`Kbd`,props:{xstyle:{required:!1,tsType:{name:`StyleXStyles`},description:"StyleX styles created via `stylex.create()`. Merged with the component's\nbase styles inside a single `stylex.props()` call for optimal deduplication.\n\n@example\n```\nconst overrides = stylex.create({ root: { marginBottom: 8 } });\n<Component xstyle={overrides.root} />\n```"},ref:{required:!1,tsType:{name:`ReactRef`,raw:`React.Ref<HTMLSpanElement>`,elements:[{name:`HTMLSpanElement`}]},description:``},keys:{required:!0,tsType:{name:`string`},description:`Keyboard shortcut string. Use "+" to separate keys.
Special keys: mod (Cmd on Mac), ctrl, alt, shift, enter, backspace, escape.
Use "plus" to render a literal "+" key (e.g. "shift+plus").

@example
\`\`\`
"mod+k"
"mod+shift+p"
"shift+plus"
"enter"
\`\`\``}},composes:[`Omit`]}})),C=e((()=>{S()}));export{g as n,S as r,C as t};