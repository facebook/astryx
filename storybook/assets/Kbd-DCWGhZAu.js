import{i as e,s as t}from"./preload-helper-CT_b8DTk.js";import{t as n}from"./react-B7Te67-h.js";import{l as r,n as i,t as a,u as o}from"./themeProps-_oSbOSxB.js";import{S as s,t as c}from"./utils-CD2ovDaz.js";import{t as l}from"./jsx-runtime-DqZldVDK.js";function u(e,t){return e===`mod`?t?`⌘`:`Ctrl`:y[e]??e.toUpperCase()}function d(e,t){return e===`mod`?t?`Command`:`Control`:b[e]??e.toUpperCase()}function f(){return()=>{}}function p(){return!1}function m(){if(typeof navigator>`u`)return!1;let e=`userAgentData`in navigator?navigator.userAgentData:null;return e&&typeof e==`object`&&`platform`in e?/mac/i.test(e.platform??``):/Mac|iPhone|iPad|iPod/.test(navigator.platform??``)}function h({keys:e,ref:t,xstyle:n,className:r,style:a,...c}){let l=(0,g.useSyncExternalStore)(f,m,p),h=e.split(`+`).map(e=>e.trim().toLowerCase()),y=h.map(e=>d(e,l)).join(` + `);return(0,_.jsx)(`span`,{...c,ref:t,role:`img`,"aria-label":y,...s(i(`kbd`),o(v.wrapper,n),r,a),children:h.map(e=>(0,_.jsx)(`kbd`,{"aria-hidden":`true`,className:`astryx3nfvp2 astryx6s0dn4 astryxl56j7k astryx16asifk astryx1grt7ep astryx7a5moj astryxx3sua9 astryx17x4s8c astryxlxy82 astryx1q0q8m5 astryxib2hle astryxv1l7n4 astryx9ynric astryx141an7d astryx1e4wzip astryx1ltkj2j astryx87ps6o`,children:u(e,l)},e))})}var g,_,v,y,b,x=e((()=>{g=t(n(),1),r(),c(),a(),_=l(),v={wrapper:{k1xSpc:`astryx3nfvp2`,kGNEyG:`astryx6s0dn4`,kOIVth:`astryxzye2dw`,kmuXW:`astryx2lah0s`,$$css:!0}},y={ctrl:`⌃`,alt:`⌥`,shift:`⇧`,enter:`↵`,backspace:`⌫`,escape:`Esc`,tab:`⇥`,up:`↑`,down:`↓`,left:`←`,right:`→`,plus:`+`},b={ctrl:`Control`,alt:`Alt`,shift:`Shift`,enter:`Enter`,backspace:`Backspace`,escape:`Escape`,tab:`Tab`,up:`Up arrow`,down:`Down arrow`,left:`Left arrow`,right:`Right arrow`,plus:`Plus`},h.displayName=`Kbd`,h.__docgenInfo={description:`Displays a keyboard shortcut as styled <kbd> elements.

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
\`\`\``}},composes:[`Omit`]}})),S=e((()=>{x()}));export{h as n,x as r,S as t};