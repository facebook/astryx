import{a as e,n as t}from"./rolldown-runtime-DkW27tQK.js";import{t as n}from"./react-BZJXY1be.js";import{n as r,t as i}from"./stylex-Dft6gtPK.js";import{n as a}from"./mergeProps-JRyAvMxc.js";import{n as o,t as s}from"./themeProps-CREkzZh6.js";import{t as c}from"./jsx-runtime-DeHZSEgm.js";function l(e,t){return e===`mod`?t?`⌘`:`Ctrl`:v[e]??e.toUpperCase()}function u(e,t){return e===`mod`?t?`Command`:`Control`:y[e]??e.toUpperCase()}function d(){return()=>{}}function f(){return!1}function p(){if(typeof navigator>`u`)return!1;let e=`userAgentData`in navigator?navigator.userAgentData:null;return e&&typeof e==`object`&&`platform`in e?/mac/i.test(e.platform??``):/Mac|iPhone|iPad|iPod/.test(navigator.platform??``)}function m({keys:e,ref:t,xstyle:n,className:i,style:s,...c}){let m=(0,h.useSyncExternalStore)(d,p,f),v=e.split(`+`).map(e=>e.trim().toLowerCase()),y=v.map(e=>u(e,m)).join(` + `);return(0,g.jsx)(`span`,{...c,ref:t,role:`img`,"aria-label":y,...a(o(`kbd`),r(_.wrapper,n),i,s),children:v.map(e=>(0,g.jsx)(`kbd`,{"aria-hidden":`true`,className:`astryx3nfvp2 astryx6s0dn4 astryxl56j7k astryx16asifk astryx1grt7ep astryx7a5moj astryxx3sua9 astryx17x4s8c astryxlxy82 astryx1q0q8m5 astryxib2hle astryxv1l7n4 astryx9ynric astryx141an7d astryx1e4wzip astryx1ltkj2j astryx87ps6o`,children:l(e,m)},e))})}var h,g,_,v,y;function b(){return(b=t((()=>{h=e(n(),1),i(),s(),g=c(),_={wrapper:{k1xSpc:`astryx3nfvp2`,kGNEyG:`astryx6s0dn4`,kOIVth:`astryxzye2dw`,kmuXW:`astryx2lah0s`,$$css:!0}},v={ctrl:`⌃`,alt:`⌥`,shift:`⇧`,enter:`↵`,backspace:`⌫`,escape:`Esc`,tab:`⇥`,up:`↑`,down:`↓`,left:`←`,right:`→`,plus:`+`},y={ctrl:`Control`,alt:`Alt`,shift:`Shift`,enter:`Enter`,backspace:`Backspace`,escape:`Escape`,tab:`Tab`,up:`Up arrow`,down:`Down arrow`,left:`Left arrow`,right:`Right arrow`,plus:`Plus`},m.displayName=`Kbd`,m.__docgenInfo={description:`Displays a keyboard shortcut as styled <kbd> elements.

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
\`\`\``}},composes:[`Omit`]}})))()}export{b as n,m as t};