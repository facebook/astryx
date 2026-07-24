import{a as e,n as t}from"./rolldown-runtime-DaJ6WEGw.js";import{t as n}from"./react-DvlgmmzG.js";import{l as r,n as i,t as a,u as o}from"./themeProps-DlHa58hS.js";import{t as s,y as c}from"./utils-SBEvDdeo.js";import{t as l}from"./jsx-runtime-cM__dR4X.js";import{t as u}from"./Button-Cx-mMzJ7.js";import{t as d}from"./Button-D1MmXezA.js";function f(){return(0,m.use)(g)}function p(e){let{children:t,label:n,orientation:r=`horizontal`,size:a,isDisabled:s=!1,xstyle:l,"data-testid":u}=e,d=e.type===`multiple`,f=(0,m.useMemo)(()=>{if(d)return new Set(e.value);let t=e.value;return t==null?new Set:new Set([t])},[d,e.value]),p=(0,m.useCallback)(t=>{if(d){let n=e.value,r=e.onChange;n.includes(t)?r(n.filter(e=>e!==t)):r([...n,t])}else{let n=e.value,r=e.onChange;r(n===t?null:t)}},[d,e.value,e.onChange]),v=(0,m.useMemo)(()=>({selectedValues:f,toggle:p,size:a,isDisabled:s}),[f,p,a,s]);return(0,h.jsx)(g,{value:v,children:(0,h.jsx)(`div`,{role:`group`,"aria-label":n,"data-testid":u,...c(i(`toggle-button-group`),o(_.group,r===`vertical`&&_.vertical,l)),children:t})})}var m,h,g,_,v=t((()=>{m=e(n(),1),r(),s(),a(),h=l(),g=(0,m.createContext)(null),g.displayName=`ToggleButtonGroupContext`,_={group:{k1xSpc:`astryx3nfvp2`,kGNEyG:`astryx6s0dn4`,kOIVth:`astryxzye2dw`,$$css:!0},vertical:{kXwgrk:`astryxdt5ytf`,kGNEyG:`astryx1qjc9v5`,$$css:!0}},p.displayName=`ToggleButtonGroup`,p.__docgenInfo={description:`Groups toggle buttons for exclusive (single) or multi-select behavior.

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
\`\`\``,methods:[],displayName:`ToggleButtonGroup`}}));function y({ref:e,label:t,isPressed:n,onPressedChange:r,pressedChangeAction:a,size:o,isDisabled:s=!1,isLoading:c=!1,icon:l,isIconOnly:d=!1,pressedIcon:p,children:m,tooltip:h,value:g,xstyle:_,className:v,style:y,...C}){let w=f(),T=w&&g!=null?w.selectedValues.has(g):n??!1,E=o??w?.size??`md`,D=w?.isDisabled??s,[O,k]=(0,b.useOptimistic)(T),A=O,j=!A,M=A&&p?p:l,N=e=>{if(!D){if(w&&g!=null){w.toggle(g),e.preventDefault();return}r?.(j,e)}},P=w&&g!=null?void 0:async()=>{k(j),await a?.(j)},F=m==null?d?void 0:(0,x.jsxs)(`span`,{className:`astryx3nfvp2 astryxdt5ytf astryx6s0dn4 astryxl56j7k`,children:[(0,x.jsx)(`span`,{...{0:{},1:{className:`astryx2mo6ok`}}[!!A<<0],children:t}),(0,x.jsx)(`span`,{className:`astryx1lliihq astryx2mo6ok astryxqtp20y astryxb3r6kr astryxlshs6z astryx47corl`,"aria-hidden":`true`,children:t})]}):(0,x.jsxs)(`span`,{className:`astryx3nfvp2 astryxdt5ytf astryx6s0dn4 astryxl56j7k`,children:[(0,x.jsx)(`span`,{...{0:{},1:{className:`astryx2mo6ok`}}[!!A<<0],children:m}),(0,x.jsx)(`span`,{className:`astryx1lliihq astryx2mo6ok astryxqtp20y astryxb3r6kr astryxlshs6z astryx47corl`,"aria-hidden":`true`,children:m})]});return(0,x.jsx)(u,{ref:e,label:t,variant:`ghost`,size:E,isDisabled:D,isLoading:c,isInterruptible:!0,isIconOnly:d,"aria-pressed":A,icon:M,tooltip:h,...i(`toggle-button`,{isPressed:A?`true`:`false`}),xstyle:[A?S.background:void 0,_],style:y,onClick:N,clickAction:P,...C,children:F})}var b,x,S,C=t((()=>{b=e(n(),1),d(),v(),a(),x=l(),S={background:{kWkggS:`astryxi89dp7`,$$css:!0}},y.displayName=`ToggleButton`,y.__docgenInfo={description:`A button that toggles between pressed and unpressed states.
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
\`\`\``,methods:[],displayName:`ToggleButton`,props:{xstyle:{required:!1,tsType:{name:`StyleXStyles`},description:"StyleX styles created via `stylex.create()`. Merged with the component's\nbase styles inside a single `stylex.props()` call for optimal deduplication.\n\n@example\n```\nconst overrides = stylex.create({ root: { marginBottom: 8 } });\n<Component xstyle={overrides.root} />\n```"},ref:{required:!1,tsType:{name:`ReactRef`,raw:`React.Ref<HTMLButtonElement>`,elements:[{name:`HTMLButtonElement`}]},description:``},label:{required:!0,tsType:{name:`string`},description:`Accessible label for the button (required).
Used as visible text, or as aria-label for icon-only buttons.`},isPressed:{required:!1,tsType:{name:`boolean`},description:`Whether the button is currently pressed/active.
When used inside ToggleButtonGroup, this is controlled by the group
and this prop is ignored.`},onPressedChange:{required:!1,tsType:{name:`signature`,type:`function`,raw:`(
  isPressed: boolean,
  event: React.MouseEvent<HTMLButtonElement>,
) => void`,signature:{arguments:[{type:{name:`boolean`},name:`isPressed`},{type:{name:`ReactMouseEvent`,raw:`React.MouseEvent<HTMLButtonElement>`,elements:[{name:`HTMLButtonElement`}]},name:`event`}],return:{name:`void`}}},description:`Called when the pressed state should change. Receives the next pressed
state and the originating click event. Call \`event.preventDefault()\` to
opt out of running \`pressedChangeAction\` (e.g. to handle the toggle
entirely in this callback).
When used inside ToggleButtonGroup, this is handled by the group
and this prop is ignored.`},pressedChangeAction:{required:!1,tsType:{name:`signature`,type:`function`,raw:`(isPressed: boolean) => void | Promise<void>`,signature:{arguments:[{type:{name:`boolean`},name:`isPressed`}],return:{name:`union`,raw:`void | Promise<void>`,elements:[{name:`void`},{name:`Promise`,elements:[{name:`void`}],raw:`Promise<void>`}]}}},description:`Action handler for API- or navigation-backed toggles, run inside a
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
\`\`\``},size:{required:!1,tsType:{name:`unknown`},description:`The size of the toggle button.
When used inside ToggleButtonGroup, defaults to the group's size.
@default 'md'`},isDisabled:{required:!1,tsType:{name:`boolean`},description:`Whether the button is disabled.
When used inside ToggleButtonGroup, the group's isDisabled overrides this.
@default false`,defaultValue:{value:`false`,computed:!1}},isLoading:{required:!1,tsType:{name:`boolean`},description:`Whether the button is in a loading state.
@default false`,defaultValue:{value:`false`,computed:!1}},icon:{required:!1,tsType:{name:`ReactNode`},description:`Icon element rendered before the label text.`},isIconOnly:{required:!1,tsType:{name:`boolean`},description:`When true, renders as a square icon-only button with \`label\` as aria-label
and an automatic tooltip from the label.
@default false`,defaultValue:{value:`false`,computed:!1}},pressedIcon:{required:!1,tsType:{name:`ReactNode`},description:`Icon element to render when the button is pressed.
Use to swap between outline (unpressed) and filled (pressed) icon styles.
Falls back to \`icon\` if not provided.

To color the pressed icon, pass an already-colored element:
@example
\`\`\`
pressedIcon={<StarIconSolid style={{color: 'var(--color-icon-yellow)'}} />}
\`\`\``},children:{required:!1,tsType:{name:`ReactNode`},description:"Optional visible content. When provided, rendered instead of `label`\nas the visible text."},tooltip:{required:!1,tsType:{name:`string`},description:`Tooltip text shown on hover.
Passed through to Button.`},value:{required:!1,tsType:{name:`string`},description:`Value identifier when used inside ToggleButtonGroup.
Required when used in a group.`}},composes:[`Omit`]}})),w=t((()=>{C(),v()}));export{v as a,p as i,y as n,C as r,w as t};