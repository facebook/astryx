import{ah as o,a1 as e,a6 as ae,af as le,ay as $,B as ce,I as a}from"./iframe-DVtWfngO.js";import{b as H,F as G,a as de}from"./StarIcon-BhPVsIJ4.js";import{F as ue}from"./HeartIcon-qCho3x1G.js";import{F as M}from"./BellIcon-C2COqI1S.js";import{F as h,a as Z,b as _}from"./UnderlineIcon-xsFvQgHj.js";import{F as ge}from"./ListBulletIcon-Tt9CSlGB.js";import{F as pe}from"./Squares2X2Icon-DFO2rYy9.js";import"./preload-helper-Ct5FWWRu.js";const q=o.createContext(null);q.displayName="ToggleButtonGroupContext";function me(){return o.use(q)}const W={group:{k1xSpc:"astryx3nfvp2",kGNEyG:"astryx6s0dn4",kOIVth:"astryxzye2dw",$$css:!0},vertical:{kXwgrk:"astryxdt5ytf",kGNEyG:"astryx1qjc9v5",$$css:!0}};function O(n){const{children:s,label:t,orientation:r="horizontal",size:c,isDisabled:d=!1,xstyle:F,"data-testid":L}=n,y=n.type==="multiple",b=o.useMemo(()=>{if(y)return new Set(n.value);const g=n.value;return g!=null?new Set([g]):new Set},[y,n.value]),I=o.useCallback(g=>{if(y){const u=n.value,f=n.onChange;u.includes(g)?f(u.filter(A=>A!==g)):f([...u,g])}else{const u=n.value,f=n.onChange;f(u===g?null:g)}},[y,n.value,n.onChange]),v=o.useMemo(()=>({selectedValues:b,toggle:I,size:c,isDisabled:d}),[b,I,c,d]);return e.jsx(q,{value:v,children:e.jsx("div",{role:"group","aria-label":t,"data-testid":L,...ae($("toggle-button-group"),le(W.group,r==="vertical"&&W.vertical,F)),children:s})})}O.displayName="ToggleButtonGroup";O.__docgenInfo={description:`Groups toggle buttons for exclusive (single) or multi-select behavior.

Uses a discriminated union on \`type\` for type-safe value/onChange:
- \`'single'\` (default): \`value: string | null\`, click active deselects
- \`'multiple'\`: \`value: string[]\`, toggles individual items

@example
\`\`\`
const [view, setView] = useState<string | null>('grid');
<ToggleButtonGroup value={view} onChange={setView} label="View mode">
  <ToggleButton value="list" label="List" icon={<ListIcon />} />
  <ToggleButton value="grid" label="Grid" icon={<GridIcon />} />
</ToggleButtonGroup>
\`\`\``,methods:[],displayName:"ToggleButtonGroup"};const he={background:{kWkggS:"astryxi89dp7",$$css:!0}};function i({ref:n,label:s,isPressed:t,onPressedChange:r,pressedChangeAction:c,size:d,isDisabled:F=!1,isLoading:L=!1,icon:y,isIconOnly:b=!1,pressedIcon:I,children:v,tooltip:g,value:u,xstyle:f,className:A,style:K,...Q}){const p=me(),Y=p&&u!=null?p.selectedValues.has(u):t??!1,ee=d??p?.size??"md",N=p?.isDisabled??F,[se,oe]=o.useOptimistic(Y),m=se,E=!m,ne=m&&I?I:y,te=V=>{if(!N){if(p&&u!=null){p.toggle(u),V.preventDefault();return}r?.(E,V)}},re=p&&u!=null?void 0:async()=>{oe(E),await c?.(E)},ie=v!=null?e.jsxs("span",{className:"astryx3nfvp2 astryxdt5ytf astryx6s0dn4 astryxl56j7k",children:[e.jsx("span",{...{0:{},1:{className:"astryx2mo6ok"}}[!!m<<0],children:v}),e.jsx("span",{className:"astryx1lliihq astryx2mo6ok astryxqtp20y astryxb3r6kr astryxlshs6z astryx47corl","aria-hidden":"true",children:v})]}):b?void 0:e.jsxs("span",{className:"astryx3nfvp2 astryxdt5ytf astryx6s0dn4 astryxl56j7k",children:[e.jsx("span",{...{0:{},1:{className:"astryx2mo6ok"}}[!!m<<0],children:s}),e.jsx("span",{className:"astryx1lliihq astryx2mo6ok astryxqtp20y astryxb3r6kr astryxlshs6z astryx47corl","aria-hidden":"true",children:s})]});return e.jsx(ce,{ref:n,label:s,variant:"ghost",size:ee,isDisabled:N,isLoading:L,isInterruptible:!0,isIconOnly:b,"aria-pressed":m,icon:ne,tooltip:g,...$("toggle-button",{isPressed:m?"true":"false"}),xstyle:[m?he.background:void 0,f],style:K,onClick:te,clickAction:re,...Q,children:ie})}i.displayName="ToggleButton";i.__docgenInfo={description:`A button that toggles between pressed and unpressed states.
Thin wrapper over Button — adds controlled toggle pattern,
icon swap, and font weight emphasis.

Use for toolbar actions, view mode switches, and formatting controls.
For on/off settings, use Switch instead.

Works standalone (with \`isPressed\`/\`onPressedChange\`) or inside
ToggleButtonGroup (which controls selection via \`value\`).

@example
\`\`\`
const [isBold, setIsBold] = useState(false);
<ToggleButton
  label="Bold"
  icon={<BoldIcon />}
  isPressed={isBold}
  onPressedChange={setIsBold}
/>
\`\`\``,methods:[],displayName:"ToggleButton",props:{xstyle:{required:!1,tsType:{name:"StyleXStyles"},description:"StyleX styles created via `stylex.create()`. Merged with the component's\nbase styles inside a single `stylex.props()` call for optimal deduplication.\n\n@example\n```\nconst overrides = stylex.create({ root: { marginBottom: 8 } });\n<Component xstyle={overrides.root} />\n```"},ref:{required:!1,tsType:{name:"ReactRef",raw:"React.Ref<HTMLButtonElement>",elements:[{name:"HTMLButtonElement"}]},description:""},label:{required:!0,tsType:{name:"string"},description:`Accessible label for the button (required).
Used as visible text, or as aria-label for icon-only buttons.`},isPressed:{required:!1,tsType:{name:"boolean"},description:`Whether the button is currently pressed/active.
When used inside ToggleButtonGroup, this is controlled by the group
and this prop is ignored.`},onPressedChange:{required:!1,tsType:{name:"signature",type:"function",raw:`(
  isPressed: boolean,
  event: React.MouseEvent<HTMLButtonElement>,
) => void`,signature:{arguments:[{type:{name:"boolean"},name:"isPressed"},{type:{name:"ReactMouseEvent",raw:"React.MouseEvent<HTMLButtonElement>",elements:[{name:"HTMLButtonElement"}]},name:"event"}],return:{name:"void"}}},description:`Called when the pressed state should change. Receives the next pressed
state and the originating click event. Call \`event.preventDefault()\` to
opt out of running \`pressedChangeAction\` (e.g. to handle the toggle
entirely in this callback).
When used inside ToggleButtonGroup, this is handled by the group
and this prop is ignored.`},pressedChangeAction:{required:!1,tsType:{name:"signature",type:"function",raw:"(isPressed: boolean) => void | Promise<void>",signature:{arguments:[{type:{name:"boolean"},name:"isPressed"}],return:{name:"union",raw:"void | Promise<void>",elements:[{name:"void"},{name:"Promise",elements:[{name:"void"}],raw:"Promise<void>"}]}}},description:`Action handler for API- or navigation-backed toggles, run inside a
transition by Button. The button shows a loading spinner while the action
is pending — whether it returns a promise or synchronously triggers a
suspending update (e.g. a router navigation that suspends on data).

@example
\`\`\`
<ToggleButton
  label="Favorite"
  isPressed={isFavorited}
  onPressedChange={setIsFavorited}
  pressedChangeAction={async (newState) => {
    await api.setFavorite(itemId, newState);
  }}
/>
\`\`\``},size:{required:!1,tsType:{name:"unknown"},description:`The size of the toggle button.
When used inside ToggleButtonGroup, defaults to the group's size.
@default 'md'`},isDisabled:{required:!1,tsType:{name:"boolean"},description:`Whether the button is disabled.
When used inside ToggleButtonGroup, the group's isDisabled overrides this.
@default false`,defaultValue:{value:"false",computed:!1}},isLoading:{required:!1,tsType:{name:"boolean"},description:`Whether the button is in a loading state.
@default false`,defaultValue:{value:"false",computed:!1}},icon:{required:!1,tsType:{name:"ReactNode"},description:"Icon element rendered before the label text."},isIconOnly:{required:!1,tsType:{name:"boolean"},description:"When true, renders as a square icon-only button with `label` as aria-label\nand an automatic tooltip from the label.\n@default false",defaultValue:{value:"false",computed:!1}},pressedIcon:{required:!1,tsType:{name:"ReactNode"},description:"Icon element to render when the button is pressed.\nUse to swap between outline (unpressed) and filled (pressed) icon styles.\nFalls back to `icon` if not provided.\n\nTo color the pressed icon, pass an already-colored element:\n@example\n```\npressedIcon={<StarIconSolid style={{color: 'var(--color-icon-yellow)'}} />}\n```"},children:{required:!1,tsType:{name:"ReactNode"},description:"Optional visible content. When provided, rendered instead of `label`\nas the visible text."},tooltip:{required:!1,tsType:{name:"string"},description:`Tooltip text shown on hover.
Passed through to Button.`},value:{required:!1,tsType:{name:"string"},description:`Value identifier when used inside ToggleButtonGroup.
Required when used in a group.`}},composes:["Omit"]};function ye({title:n,titleId:s,...t},r){return o.createElement("svg",Object.assign({xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24",strokeWidth:1.5,stroke:"currentColor","aria-hidden":"true","data-slot":"icon",ref:r,"aria-labelledby":s},t),n?o.createElement("title",{id:s},n):null,o.createElement("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M9.143 17.082a24.248 24.248 0 0 0 3.844.148m-3.844-.148a23.856 23.856 0 0 1-5.455-1.31 8.964 8.964 0 0 0 2.3-5.542m3.155 6.852a3 3 0 0 0 5.667 1.97m1.965-2.277L21 21m-4.225-4.225a23.81 23.81 0 0 0 3.536-1.003A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6.53 6.53m10.245 10.245L6.53 6.53M3 3l3.53 3.53"}))}const fe=o.forwardRef(ye);function be({title:n,titleId:s,...t},r){return o.createElement("svg",Object.assign({xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24",strokeWidth:1.5,stroke:"currentColor","aria-hidden":"true","data-slot":"icon",ref:r,"aria-labelledby":s},t),n?o.createElement("title",{id:s},n):null,o.createElement("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z"}))}const X=o.forwardRef(be);function Ie({title:n,titleId:s,...t},r){return o.createElement("svg",Object.assign({xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24",strokeWidth:1.5,stroke:"currentColor","aria-hidden":"true","data-slot":"icon",ref:r,"aria-labelledby":s},t),n?o.createElement("title",{id:s},n):null,o.createElement("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244"}))}const D=o.forwardRef(Ie);function ve({title:n,titleId:s,...t},r){return o.createElement("svg",Object.assign({xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24",strokeWidth:1.5,stroke:"currentColor","aria-hidden":"true","data-slot":"icon",ref:r,"aria-labelledby":s},t),n?o.createElement("title",{id:s},n):null,o.createElement("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M12 12a8.912 8.912 0 0 1-.318-.079c-1.585-.424-2.904-1.247-3.76-2.236-.873-1.009-1.265-2.19-.968-3.301.59-2.2 3.663-3.29 6.863-2.432A8.186 8.186 0 0 1 16.5 5.21M6.42 17.81c.857.99 2.176 1.812 3.761 2.237 3.2.858 6.274-.23 6.863-2.431.233-.868.044-1.779-.465-2.617M3.75 12h16.5"}))}const U=o.forwardRef(ve);function xe({title:n,titleId:s,...t},r){return o.createElement("svg",Object.assign({xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"currentColor","aria-hidden":"true","data-slot":"icon",ref:r,"aria-labelledby":s},t),n?o.createElement("title",{id:s},n):null,o.createElement("path",{fillRule:"evenodd",d:"M5.246 3.744a.75.75 0 0 1 .75-.75h7.125a4.875 4.875 0 0 1 3.346 8.422 5.25 5.25 0 0 1-2.97 9.58h-7.5a.75.75 0 0 1-.75-.75V3.744Zm7.125 6.75a2.625 2.625 0 0 0 0-5.25H8.246v5.25h4.125Zm-4.125 2.251v6h4.5a3 3 0 0 0 0-6h-4.5Z",clipRule:"evenodd"}))}const we=o.forwardRef(xe);function ke({title:n,titleId:s,...t},r){return o.createElement("svg",Object.assign({xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"currentColor","aria-hidden":"true","data-slot":"icon",ref:r,"aria-labelledby":s},t),n?o.createElement("title",{id:s},n):null,o.createElement("path",{fillRule:"evenodd",d:"M6.32 2.577a49.255 49.255 0 0 1 11.36 0c1.497.174 2.57 1.46 2.57 2.93V21a.75.75 0 0 1-1.085.67L12 18.089l-7.165 3.583A.75.75 0 0 1 3.75 21V5.507c0-1.47 1.073-2.756 2.57-2.93Z",clipRule:"evenodd"}))}const J=o.forwardRef(ke);function Pe({title:n,titleId:s,...t},r){return o.createElement("svg",Object.assign({xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"currentColor","aria-hidden":"true","data-slot":"icon",ref:r,"aria-labelledby":s},t),n?o.createElement("title",{id:s},n):null,o.createElement("path",{fillRule:"evenodd",d:"M10.497 3.744a.75.75 0 0 1 .75-.75h7.5a.75.75 0 0 1 0 1.5h-3.275l-5.357 15.002h2.632a.75.75 0 1 1 0 1.5h-7.5a.75.75 0 1 1 0-1.5h3.275l5.357-15.002h-2.632a.75.75 0 0 1-.75-.75Z",clipRule:"evenodd"}))}const Be=o.forwardRef(Pe);function Se({title:n,titleId:s,...t},r){return o.createElement("svg",Object.assign({xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"currentColor","aria-hidden":"true","data-slot":"icon",ref:r,"aria-labelledby":s},t),n?o.createElement("title",{id:s},n):null,o.createElement("path",{fillRule:"evenodd",d:"M5.995 2.994a.75.75 0 0 1 .75.75v7.5a5.25 5.25 0 1 0 10.5 0v-7.5a.75.75 0 0 1 1.5 0v7.5a6.75 6.75 0 1 1-13.5 0v-7.5a.75.75 0 0 1 .75-.75Zm-3 17.252a.75.75 0 0 1 .75-.75h16.5a.75.75 0 0 1 0 1.5h-16.5a.75.75 0 0 1-.75-.75Z",clipRule:"evenodd"}))}const je=o.forwardRef(Se),l={width:16,height:16},Me={title:"Core/ToggleButton",component:i,tags:["autodocs"],argTypes:{label:{control:"text"},isPressed:{control:"boolean"},size:{control:"select",options:["sm","md","lg"]},isDisabled:{control:"boolean"},isLoading:{control:"boolean"}}},x={render:function(){const[s,t]=o.useState(!1);return e.jsx(i,{label:"Bold",icon:e.jsx(h,{style:l}),isPressed:s,onPressedChange:t,isIconOnly:!0})}},w={render:function(){const[s,t]=o.useState(!1),[r,c]=o.useState(!0);return e.jsxs("div",{style:{display:"flex",gap:8},children:[e.jsx(i,{label:"Favorite",icon:e.jsx(G,{style:l}),pressedIcon:e.jsx(H,{style:l}),isPressed:s,onPressedChange:t,isIconOnly:!0}),e.jsx(i,{label:"Bookmark",icon:e.jsx(X,{style:l}),pressedIcon:e.jsx(J,{style:l}),isPressed:r,onPressedChange:c,isIconOnly:!0})]})}},k={render:function(){const[s,t]=o.useState(!1);return e.jsx(i,{label:"Active",isPressed:s,onPressedChange:t,children:"Active"})}},P={args:{label:"Disabled toggle",isPressed:!1,isDisabled:!0,icon:e.jsx(h,{style:l})}},B={args:{label:"Loading toggle",isPressed:!0,isLoading:!0,icon:e.jsx(G,{style:l})}},S={render:function(){const[s,t]=o.useState({}),r=c=>t(d=>({...d,[c]:!d[c]}));return e.jsxs("div",{style:{display:"flex",gap:8,alignItems:"center"},children:[e.jsx(i,{label:"Small",size:"sm",icon:e.jsx(h,{style:l}),isPressed:!!s.sm,onPressedChange:()=>r("sm"),isIconOnly:!0}),e.jsx(i,{label:"Medium",size:"md",icon:e.jsx(h,{style:l}),isPressed:!!s.md,onPressedChange:()=>r("md"),isIconOnly:!0}),e.jsx(i,{label:"Large",size:"lg",icon:e.jsx(h,{style:{width:20,height:20}}),isPressed:!!s.lg,onPressedChange:()=>r("lg"),isIconOnly:!0})]})}},j={render:function(){const[s,t]=o.useState("list");return e.jsxs(O,{value:s,onChange:t,label:"View mode",children:[e.jsx(i,{value:"list",label:"List view",icon:e.jsx(ge,{style:l}),isIconOnly:!0}),e.jsx(i,{value:"grid",label:"Grid view",icon:e.jsx(pe,{style:l}),isIconOnly:!0})]})}},T={render:function(){const[s,t]=o.useState([]);return e.jsxs(O,{type:"multiple",value:s,onChange:t,label:"Text formatting",children:[e.jsx(i,{value:"bold",label:"Bold",icon:e.jsx(h,{style:l}),isIconOnly:!0}),e.jsx(i,{value:"italic",label:"Italic",icon:e.jsx(Z,{style:l}),isIconOnly:!0}),e.jsx(i,{value:"underline",label:"Underline",icon:e.jsx(_,{style:l}),isIconOnly:!0})]})}},C={render:function(){const[s,t]=o.useState(!1);return e.jsx(i,{label:s?"Unmute notifications":"Mute notifications",icon:e.jsx(M,{style:l}),pressedIcon:e.jsx(fe,{style:l}),isPressed:s,onPressedChange:t,isIconOnly:!0})}},z={render:function(){const[s,t]=o.useState({bold:!0,italic:!1,underline:!0,strikethrough:!1,link:!1}),r=c=>t(d=>({...d,[c]:!d[c]}));return e.jsxs("div",{style:{display:"flex",gap:4},children:[e.jsx(i,{label:"Bold",icon:e.jsx(a,{icon:h,size:"sm",color:"secondary"}),pressedIcon:e.jsx(a,{icon:we,size:"sm",color:"accent"}),isPressed:s.bold,onPressedChange:()=>r("bold"),isIconOnly:!0}),e.jsx(i,{label:"Italic",icon:e.jsx(a,{icon:Z,size:"sm",color:"secondary"}),pressedIcon:e.jsx(a,{icon:Be,size:"sm",color:"accent"}),isPressed:s.italic,onPressedChange:()=>r("italic"),isIconOnly:!0}),e.jsx(i,{label:"Underline",icon:e.jsx(a,{icon:_,size:"sm",color:"secondary"}),pressedIcon:e.jsx(a,{icon:je,size:"sm",color:"accent"}),isPressed:s.underline,onPressedChange:()=>r("underline"),isIconOnly:!0}),e.jsx(i,{label:"Strikethrough",icon:e.jsx(a,{icon:U,size:"sm",color:"secondary"}),pressedIcon:e.jsx(a,{icon:U,size:"sm",color:"accent"}),isPressed:s.strikethrough,onPressedChange:()=>r("strikethrough"),isIconOnly:!0}),e.jsx(i,{label:"Link",icon:e.jsx(a,{icon:D,size:"sm",color:"secondary"}),pressedIcon:e.jsx(a,{icon:D,size:"sm",color:"success"}),isPressed:s.link,onPressedChange:()=>r("link"),isIconOnly:!0})]})}},R={render:function(){const[s,t]=o.useState({star:!1,heart:!1,bookmark:!0,bell:!1}),r=c=>t(d=>({...d,[c]:!d[c]}));return e.jsxs("div",{style:{display:"flex",gap:8},children:[e.jsx(i,{label:"Star",icon:e.jsx(a,{icon:G,size:"sm",color:"secondary"}),pressedIcon:e.jsx(a,{icon:H,size:"sm",color:"yellow"}),isPressed:s.star,onPressedChange:()=>r("star"),isIconOnly:!0}),e.jsx(i,{label:"Like",icon:e.jsx(a,{icon:ue,size:"sm",color:"secondary"}),pressedIcon:e.jsx(a,{icon:de,size:"sm",color:"red"}),isPressed:s.heart,onPressedChange:()=>r("heart"),isIconOnly:!0}),e.jsx(i,{label:"Save",icon:e.jsx(a,{icon:X,size:"sm",color:"secondary"}),pressedIcon:e.jsx(a,{icon:J,size:"sm",color:"blue"}),isPressed:s.bookmark,onPressedChange:()=>r("bookmark"),isIconOnly:!0}),e.jsx(i,{label:"Follow",icon:e.jsx(a,{icon:M,size:"sm",color:"secondary"}),pressedIcon:e.jsx(a,{icon:M,size:"sm",color:"accent"}),isPressed:s.bell,onPressedChange:()=>r("bell"),isIconOnly:!0})]})}};x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  render: function Render() {
    const [isPressed, setIsPressed] = useState(false);
    return <ToggleButton label="Bold" icon={<BoldIcon style={iconSize} />} isPressed={isPressed} onPressedChange={setIsPressed} isIconOnly />;
  }
}`,...x.parameters?.docs?.source},description:{story:"Interactive standalone toggle — click to toggle.",...x.parameters?.docs?.description}}};w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  render: function Render() {
    const [isFavorited, setIsFavorited] = useState(false);
    const [isBookmarked, setIsBookmarked] = useState(true);
    return <div style={{
      display: 'flex',
      gap: 8
    }}>
        <ToggleButton label="Favorite" icon={<StarIcon style={iconSize} />} pressedIcon={<StarIconSolid style={iconSize} />} isPressed={isFavorited} onPressedChange={setIsFavorited} isIconOnly />
        <ToggleButton label="Bookmark" icon={<BookmarkIcon style={iconSize} />} pressedIcon={<BookmarkIconSolid style={iconSize} />} isPressed={isBookmarked} onPressedChange={setIsBookmarked} isIconOnly />
      </div>;
  }
}`,...w.parameters?.docs?.source},description:{story:"Icon-only toggles with icon swap.",...w.parameters?.docs?.description}}};k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  render: function Render() {
    const [isActive, setIsActive] = useState(false);
    return <ToggleButton label="Active" isPressed={isActive} onPressedChange={setIsActive}>
        Active
      </ToggleButton>;
  }
}`,...k.parameters?.docs?.source},description:{story:"Toggle with visible label text — shows font weight shift on press.",...k.parameters?.docs?.description}}};P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Disabled toggle',
    isPressed: false,
    isDisabled: true,
    icon: <BoldIcon style={iconSize} />
  }
}`,...P.parameters?.docs?.source},description:{story:"Disabled state.",...P.parameters?.docs?.description}}};B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Loading toggle',
    isPressed: true,
    isLoading: true,
    icon: <StarIcon style={iconSize} />
  }
}`,...B.parameters?.docs?.source},description:{story:"Loading state.",...B.parameters?.docs?.description}}};S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  render: function Render() {
    const [pressed, setPressed] = useState<Record<string, boolean>>({});
    const toggle = (key: string) => setPressed(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
    return <div style={{
      display: 'flex',
      gap: 8,
      alignItems: 'center'
    }}>
        <ToggleButton label="Small" size="sm" icon={<BoldIcon style={iconSize} />} isPressed={!!pressed.sm} onPressedChange={() => toggle('sm')} isIconOnly />
        <ToggleButton label="Medium" size="md" icon={<BoldIcon style={iconSize} />} isPressed={!!pressed.md} onPressedChange={() => toggle('md')} isIconOnly />
        <ToggleButton label="Large" size="lg" icon={<BoldIcon style={{
        width: 20,
        height: 20
      }} />} isPressed={!!pressed.lg} onPressedChange={() => toggle('lg')} isIconOnly />
      </div>;
  }
}`,...S.parameters?.docs?.source},description:{story:"All sizes side by side.",...S.parameters?.docs?.description}}};j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
  render: function Render() {
    const [view, setView] = useState<string | null>('list');
    return <ToggleButtonGroup value={view} onChange={setView} label="View mode">
        <ToggleButton value="list" label="List view" icon={<ListBulletIcon style={iconSize} />} isIconOnly />
        <ToggleButton value="grid" label="Grid view" icon={<Squares2X2Icon style={iconSize} />} isIconOnly />
      </ToggleButtonGroup>;
  }
}`,...j.parameters?.docs?.source},description:{story:"Single-select group — view mode switcher. Click active to deselect.",...j.parameters?.docs?.description}}};T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  render: function Render() {
    const [formats, setFormats] = useState<string[]>([]);
    return <ToggleButtonGroup type="multiple" value={formats} onChange={setFormats} label="Text formatting">
        <ToggleButton value="bold" label="Bold" icon={<BoldIcon style={iconSize} />} isIconOnly />
        <ToggleButton value="italic" label="Italic" icon={<ItalicIcon style={iconSize} />} isIconOnly />
        <ToggleButton value="underline" label="Underline" icon={<UnderlineIcon style={iconSize} />} isIconOnly />
      </ToggleButtonGroup>;
  }
}`,...T.parameters?.docs?.source},description:{story:"Multi-select group — text formatting toolbar.",...T.parameters?.docs?.description}}};C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  render: function Render() {
    const [isMuted, setIsMuted] = useState(false);
    return <ToggleButton label={isMuted ? 'Unmute notifications' : 'Mute notifications'} icon={<BellIcon style={iconSize} />} pressedIcon={<BellSlashIcon style={iconSize} />} isPressed={isMuted} onPressedChange={setIsMuted} isIconOnly />;
  }
}`,...C.parameters?.docs?.source},description:{story:"Notification toggle — icon swap between bell and bell-slash.",...C.parameters?.docs?.description}}};z.parameters={...z.parameters,docs:{...z.parameters?.docs,source:{originalSource:`{
  render: function Render() {
    const [pressed, setPressed] = useState<Record<string, boolean>>({
      bold: true,
      italic: false,
      underline: true,
      strikethrough: false,
      link: false
    });
    const toggle = (key: string) => setPressed(p => ({
      ...p,
      [key]: !p[key]
    }));
    return <div style={{
      display: 'flex',
      gap: 4
    }}>
        <ToggleButton label="Bold" icon={<Icon icon={BoldIcon} size="sm" color="secondary" />} pressedIcon={<Icon icon={BoldIconSolid} size="sm" color="accent" />} isPressed={pressed.bold} onPressedChange={() => toggle('bold')} isIconOnly />
        <ToggleButton label="Italic" icon={<Icon icon={ItalicIcon} size="sm" color="secondary" />} pressedIcon={<Icon icon={ItalicIconSolid} size="sm" color="accent" />} isPressed={pressed.italic} onPressedChange={() => toggle('italic')} isIconOnly />
        <ToggleButton label="Underline" icon={<Icon icon={UnderlineIcon} size="sm" color="secondary" />} pressedIcon={<Icon icon={UnderlineIconSolid} size="sm" color="accent" />} isPressed={pressed.underline} onPressedChange={() => toggle('underline')} isIconOnly />
        <ToggleButton label="Strikethrough" icon={<Icon icon={StrikethroughIcon} size="sm" color="secondary" />} pressedIcon={<Icon icon={StrikethroughIcon} size="sm" color="accent" />} isPressed={pressed.strikethrough} onPressedChange={() => toggle('strikethrough')} isIconOnly />
        <ToggleButton label="Link" icon={<Icon icon={LinkIcon} size="sm" color="secondary" />} pressedIcon={<Icon icon={LinkIcon} size="sm" color="success" />} isPressed={pressed.link} onPressedChange={() => toggle('link')} isIconOnly />
      </div>;
  }
}`,...z.parameters?.docs?.source},description:{story:`Formatting toolbar with colored icons — icon shifts to accent color when pressed.
Uses outline → solid icon swap + Icon color prop to reinforce state.`,...z.parameters?.docs?.description}}};R.parameters={...R.parameters,docs:{...R.parameters?.docs,source:{originalSource:`{
  render: function Render() {
    const [pressed, setPressed] = useState<Record<string, boolean>>({
      star: false,
      heart: false,
      bookmark: true,
      bell: false
    });
    const toggle = (key: string) => setPressed(p => ({
      ...p,
      [key]: !p[key]
    }));
    return <div style={{
      display: 'flex',
      gap: 8
    }}>
        <ToggleButton label="Star" icon={<Icon icon={StarIcon} size="sm" color="secondary" />} pressedIcon={<Icon icon={StarIconSolid} size="sm" color="yellow" />} isPressed={pressed.star} onPressedChange={() => toggle('star')} isIconOnly />
        <ToggleButton label="Like" icon={<Icon icon={HeartIcon} size="sm" color="secondary" />} pressedIcon={<Icon icon={HeartIconSolid} size="sm" color="red" />} isPressed={pressed.heart} onPressedChange={() => toggle('heart')} isIconOnly />
        <ToggleButton label="Save" icon={<Icon icon={BookmarkIcon} size="sm" color="secondary" />} pressedIcon={<Icon icon={BookmarkIconSolid} size="sm" color="blue" />} isPressed={pressed.bookmark} onPressedChange={() => toggle('bookmark')} isIconOnly />
        <ToggleButton label="Follow" icon={<Icon icon={BellIcon} size="sm" color="secondary" />} pressedIcon={<Icon icon={BellIcon} size="sm" color="accent" />} isPressed={pressed.bell} onPressedChange={() => toggle('bell')} isIconOnly />
      </div>;
  }
}`,...R.parameters?.docs?.source},description:{story:`Reaction buttons — semantic icon colors (yellow star, red heart, blue bookmark).
Shows icon swap (outline → solid) paired with color to reinforce the pressed state.`,...R.parameters?.docs?.description}}};const Ge=["Standalone","IconSwap","WithLabel","Disabled","Loading","Sizes","GroupSingle","GroupMultiple","NotificationToggle","ColoredIconToolbar","ColoredIconReactions"];export{R as ColoredIconReactions,z as ColoredIconToolbar,P as Disabled,T as GroupMultiple,j as GroupSingle,w as IconSwap,B as Loading,C as NotificationToggle,S as Sizes,x as Standalone,k as WithLabel,Ge as __namedExportsOrder,Me as default};
