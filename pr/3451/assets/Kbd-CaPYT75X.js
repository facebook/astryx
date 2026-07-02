import{ah as m,a1 as n,a6 as y,af as u,ay as f}from"./iframe-VDTgZ3S9.js";const x={wrapper:{k1xSpc:"astryx3nfvp2",kGNEyG:"astryx6s0dn4",kOIVth:"astryxzye2dw",kmuXW:"astryx2lah0s",$$css:!0}},h={ctrl:"⌃",alt:"⌥",shift:"⇧",enter:"↵",backspace:"⌫",escape:"Esc",tab:"⇥",up:"↑",down:"↓",left:"←",right:"→",plus:"+"};function g(e,a){return e==="mod"?a?"⌘":"Ctrl":h[e]??e.toUpperCase()}const b={ctrl:"Control",alt:"Alt",shift:"Shift",enter:"Enter",backspace:"Backspace",escape:"Escape",tab:"Tab",up:"Up arrow",down:"Down arrow",left:"Left arrow",right:"Right arrow",plus:"Plus"};function k(e,a){return e==="mod"?a?"Command":"Control":b[e]??e.toUpperCase()}function S(){return()=>{}}function w(){return!1}function E(){if(typeof navigator>"u")return!1;const e="userAgentData"in navigator?navigator.userAgentData:null;return e&&typeof e=="object"&&"platform"in e?/mac/i.test(e.platform??""):/Mac|iPhone|iPad|iPod/.test(navigator.platform??"")}function o({keys:e,ref:a,xstyle:i,className:l,style:p,...c}){const r=m.useSyncExternalStore(S,E,w),s=e.split("+").map(t=>t.trim().toLowerCase()),d=s.map(t=>k(t,r)).join(" + ");return n.jsx("span",{ref:a,role:"img","aria-label":d,...c,...y(f("kbd"),u(x.wrapper,i),l,p),children:s.map(t=>n.jsx("kbd",{"aria-hidden":"true",className:"astryx3nfvp2 astryx6s0dn4 astryxl56j7k astryx16asifk astryx1grt7ep astryx7a5moj astryxx3sua9 astryx17x4s8c astryxlxy82 astryx1q0q8m5 astryxib2hle astryxv1l7n4 astryx9ynric astryx141an7d astryx1e4wzip astryx1ltkj2j astryx87ps6o",children:g(t,r)},t))})}o.displayName="Kbd";o.__docgenInfo={description:`Displays a keyboard shortcut as styled <kbd> elements.

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
\`\`\``}},composes:["Omit"]};export{o as K};
