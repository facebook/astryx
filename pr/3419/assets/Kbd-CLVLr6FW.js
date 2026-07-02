import{ah as d,a1 as a,a6 as y,af as m,ay as u}from"./iframe-JfpySt6L.js";const f={wrapper:{k1xSpc:"astryx3nfvp2",kGNEyG:"astryx6s0dn4",kOIVth:"astryxzye2dw",kmuXW:"astryx2lah0s",$$css:!0}},x={ctrl:"⌃",alt:"⌥",shift:"⇧",enter:"↵",backspace:"⌫",escape:"Esc",tab:"⇥",up:"↑",down:"↓",left:"←",right:"→",plus:"+"};function h(e,s){return e==="mod"?s?"⌘":"Ctrl":x[e]??e.toUpperCase()}function g(){return()=>{}}function b(){return!1}function k(){if(typeof navigator>"u")return!1;const e="userAgentData"in navigator?navigator.userAgentData:null;return e&&typeof e=="object"&&"platform"in e?/mac/i.test(e.platform??""):/Mac|iPhone|iPad|iPod/.test(navigator.platform??"")}function r({keys:e,ref:s,xstyle:n,className:o,style:i,...p}){const l=d.useSyncExternalStore(g,k,b),c=e.split("+").map(t=>t.trim().toLowerCase());return a.jsx("span",{ref:s,...p,...y(u("kbd"),m(f.wrapper,n),o,i),"aria-hidden":"true",children:c.map(t=>a.jsx("kbd",{className:"astryx3nfvp2 astryx6s0dn4 astryxl56j7k astryx16asifk astryx1grt7ep astryx7a5moj astryxx3sua9 astryx17x4s8c astryxlxy82 astryx1q0q8m5 astryxib2hle astryxv1l7n4 astryx9ynric astryx141an7d astryx1e4wzip astryx1ltkj2j astryx87ps6o",children:h(t,l)},t))})}r.displayName="Kbd";r.__docgenInfo={description:`Displays a keyboard shortcut as styled <kbd> elements.

A general-purpose component for rendering keyboard shortcuts
anywhere in the system — tooltips, menus, documentation, etc.

Platform-aware: \`mod\` renders as ⌘ on macOS and Ctrl elsewhere.
SSR-safe — defers platform detection through useSyncExternalStore to avoid
hydration mismatches.

@example
\`\`\`
<Kbd keys="mod+k" />
\`\`\``,methods:[],displayName:"Kbd",props:{xstyle:{required:!1,tsType:{name:"StyleXStyles"},description:"StyleX styles created via `stylex.create()`. Merged with the component's\nbase styles inside a single `stylex.props()` call for optimal deduplication.\n\n@example\n```\nconst overrides = stylex.create({ root: { marginBottom: 8 } });\n<Component xstyle={overrides.root} />\n```"},ref:{required:!1,tsType:{name:"ReactRef",raw:"React.Ref<HTMLSpanElement>",elements:[{name:"HTMLSpanElement"}]},description:""},keys:{required:!0,tsType:{name:"string"},description:`Keyboard shortcut string. Use "+" to separate keys.
Special keys: mod (Cmd on Mac), ctrl, alt, shift, enter, backspace, escape.
Use "plus" to render a literal "+" key (e.g. "shift+plus").

@example
\`\`\`
"mod+k"
"mod+shift+p"
"shift+plus"
"enter"
\`\`\``}},composes:["Omit"]};export{r as K};
