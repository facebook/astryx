import{a as e,n as t}from"./rolldown-runtime-DaJ6WEGw.js";import{t as n}from"./react-DvlgmmzG.js";import{l as r,n as i,t as a,u as o}from"./themeProps-DlHa58hS.js";import{r as s,t as c}from"./LayoutContent-lQi8c66T.js";import{t as l}from"./LayoutHeader-BJVK-iiV.js";import{_ as u,t as d,y as f}from"./utils-SBEvDdeo.js";import{t as p}from"./jsx-runtime-cM__dR4X.js";import{n as m,t as h}from"./Spinner-Di__O-J_.js";import{n as g,t as _}from"./Icon-CX7HEytI.js";import{r as v,t as y}from"./i18n-BRp86Ovh.js";import{n as b,t as x}from"./Kbd-9NBaAJhg.js";import{i as S,o as C,s as w,t as T}from"./Dialog-DwmjwKeu.js";import{t as E}from"./LayoutFooter-B26-U5J1.js";import{t as D}from"./Layout-BbT8IvUw.js";import{s as ee,t as te}from"./Selector-Bdd0TCi4.js";function O(){return(0,k.use)(A)}var k,A,j=t((()=>{k=e(n(),1),A=(0,k.createContext)(null),A.displayName=`CommandPaletteContext`}));function ne({children:e,label:t,ref:n,xstyle:r,className:a,style:s,...c}){let l=v(),u=t??l(`@astryx.commandPalette.list.label`);return(0,re.jsx)(`div`,{ref:n,id:O()?.listId,role:`listbox`,"aria-label":u,...f(i(`command-palette-list`),o(M.list,r),a,s),...c,children:e})}var re,M,N=t((()=>{r(),d(),j(),a(),y(),re=p(),M={list:{kORKVm:`astryx1odjw0f`,kskxy:`astryxmz0i5r`,kmVPX3:`astryx9epnlk`,kUk6DE:`astryx98rzlu`,k1xSpc:`astryx78zum5`,kXwgrk:`astryxdt5ytf`,kOIVth:`astryx1lsbc85`,$$css:!0}},ne.displayName=`CommandPaletteList`,ne.__docgenInfo={description:`Scrollable results container for the command palette.
Renders as a listbox for ARIA compliance.

When used inside CommandPalette, automatically gets the correct
ID for aria-controls linking with the input.

@compositionHint Place inside CommandPalette, after CommandPaletteInput.
  Contains CommandPaletteItem and CommandPaletteGroup children.

@example
\`\`\`
<CommandPaletteList>
  <CommandPaletteItem value="home" onSelect={goHome}>
    Go Home
  </CommandPaletteItem>
</CommandPaletteList>
\`\`\``,methods:[],displayName:`CommandPaletteList`,props:{xstyle:{required:!1,tsType:{name:`StyleXStyles`},description:"StyleX styles created via `stylex.create()`. Merged with the component's\nbase styles inside a single `stylex.props()` call for optimal deduplication.\n\n@example\n```\nconst overrides = stylex.create({ root: { marginBottom: 8 } });\n<Component xstyle={overrides.root} />\n```"},ref:{required:!1,tsType:{name:`ReactRef`,raw:`React.Ref<HTMLDivElement>`,elements:[{name:`HTMLDivElement`}]},description:`Ref forwarded to the root element.`},children:{required:!0,tsType:{name:`ReactNode`},description:`Command palette items, groups, empty states, etc.`},label:{required:!1,tsType:{name:`string`},description:`Accessible label for the listbox.
@default 'Commands'`}},composes:[`Omit`]}}));function P({value:e,onSelect:t,isHighlighted:n,isSelected:r,isDisabled:a=!1,children:s,ref:c,xstyle:l,className:d,style:p,...m}){let h=O(),g=w()?.isInline===!0,_=(0,F.useRef)(null),v=(0,F.useRef)(!1),y=(0,F.useMemo)(()=>h?.selectableItems.findIndex(t=>t.value===e)??-1,[h?.selectableItems,e]),b=n??(h?h.highlightedIndex===y&&y>=0:!1),x=r??(h?h.value===e:!1);(0,F.useEffect)(()=>{let e=g&&!v.current;v.current=!0,!e&&b&&_.current&&_.current.scrollIntoView?.({block:`nearest`})},[b,g]);let S=(0,F.useCallback)(()=>{a||(t?.(e),h&&(h.selectItem(e),h.onClose()))},[a,e,t,h]),C=(0,F.useCallback)(()=>{a||!h||y<0||h.setHighlightedIndex(y)},[a,y,h]);return(0,I.jsx)(`div`,{ref:u(c,_),id:h&&y>=0?h.getItemId(y):void 0,role:`option`,"aria-selected":x,"aria-disabled":a||void 0,"data-value":e,onClick:S,onMouseEnter:C,...f(i(`command-palette-item`),o(L.item,!a&&L.itemHover,b&&L.itemHighlighted,x&&L.itemSelected,a&&L.itemDisabled,l),d,p),...m,children:s})}var F,I,L,R=t((()=>{F=e(n(),1),r(),d(),j(),C(),a(),I=p(),L={item:{k1xSpc:`astryx78zum5`,kGNEyG:`astryx6s0dn4`,kOIVth:`astryx1txdalj`,kzqmXN:`astryxh8yej3`,kg3NbH:`astryxrrkdod`,k8WAf4:`astryxce4md1`,kaIpWk:`astryxx3sua9`,kMv6JI:`astryx9ynric`,kGuDYH:`astryxcr08ib`,kMwMTN:`astryx1tgivj0`,kWkggS:`astryxjbqb8w`,kQgIW9:`astryx1gs6z28`,kkrTdU:`astryx1ypdohk`,k9WMMc:`astryxdpxx8g`,kI3sdo:`astryx1a2a7pz`,kfSwDN:`astryx87ps6o`,$$css:!0},itemHover:{kHE3J0:`astryxe9uy6x`,kSReZ0:`astryxyxi2l3`,$$css:!0},itemHighlighted:{kWkggS:`astryx1lmrjuc`,$$css:!0},itemDisabled:{kSiTet:`astryxbyyjgo`,kkrTdU:`astryx1h6gzvc`,$$css:!0},itemSelected:{kWkggS:`astryxgcxg3y`,$$css:!0}},P.displayName=`CommandPaletteItem`,P.__docgenInfo={description:`A selectable item in the command palette.
Accepts arbitrary children for full rendering control.

When used inside CommandPalette, registers with context for
keyboard navigation and selection. Can also be used
standalone with explicit isHighlighted/isSelected props.

@compositionHint Place inside CommandPaletteList or CommandPaletteGroup.

@example
\`\`\`
<CommandPaletteItem value="settings" onSelect={() => navigate('/settings')}>
  Settings
</CommandPaletteItem>
\`\`\``,methods:[],displayName:`CommandPaletteItem`,props:{ref:{required:!1,tsType:{name:`ReactRef`,raw:`React.Ref<HTMLDivElement>`,elements:[{name:`HTMLDivElement`}]},description:`Ref forwarded to the root element.`},value:{required:!0,tsType:{name:`string`},description:`Unique value for identification and selection.`},onSelect:{required:!1,tsType:{name:`signature`,type:`function`,raw:`(value: string) => void`,signature:{arguments:[{type:{name:`string`},name:`value`}],return:{name:`void`}}},description:`Called when this item is selected (via click or Enter).`},isHighlighted:{required:!1,tsType:{name:`boolean`},description:`Whether this item is visually highlighted (keyboard focus).
When omitted inside CommandPalette, derived from context.
@default false`},isSelected:{required:!1,tsType:{name:`boolean`},description:`Whether this item is currently selected (picker mode).
@default false`},isDisabled:{required:!1,tsType:{name:`boolean`},description:`Whether the item is disabled.
@default false`,defaultValue:{value:`false`,computed:!1}},children:{required:!0,tsType:{name:`ReactNode`},description:`Item content. Fully custom — render icons, descriptions, shortcuts, etc.`}},composes:[`Omit`]}}));function z({heading:e,children:t,ref:n,xstyle:r,className:a,style:s,...c}){return(0,B.jsxs)(`div`,{ref:n,role:`group`,"aria-label":e,...f(i(`command-palette-group`),o(V.group,r),a,s),...c,children:[(0,B.jsx)(`div`,{"aria-hidden":`true`,className:`astryxrrkdod astryxu0wf1k astryx9ynric astryx141an7d astryx1ltkj2j astryxv1l7n4 astryx87ps6o`,children:e}),t]})}var B,V,H=t((()=>{r(),d(),a(),B=p(),V={group:{k1xSpc:`astryx78zum5`,kXwgrk:`astryxdt5ytf`,kOIVth:`astryx1lsbc85`,k8WAf4:`astryxu0wf1k`,$$css:!0}},z.displayName=`CommandPaletteGroup`,z.__docgenInfo={description:`Visual grouping for command palette items with a heading label.

Heading style matches DropdownMenu section headings:
supporting-size (12px), secondary color, no uppercase/letterSpacing.

@compositionHint Place inside CommandPaletteList.
  Contains CommandPaletteItem children.

@example
\`\`\`
<CommandPaletteGroup heading="Navigation">
  <CommandPaletteItem value="home" onSelect={goHome}>
    Home
  </CommandPaletteItem>
</CommandPaletteGroup>
\`\`\``,methods:[],displayName:`CommandPaletteGroup`,props:{xstyle:{required:!1,tsType:{name:`StyleXStyles`},description:"StyleX styles created via `stylex.create()`. Merged with the component's\nbase styles inside a single `stylex.props()` call for optimal deduplication.\n\n@example\n```\nconst overrides = stylex.create({ root: { marginBottom: 8 } });\n<Component xstyle={overrides.root} />\n```"},ref:{required:!1,tsType:{name:`ReactRef`,raw:`React.Ref<HTMLDivElement>`,elements:[{name:`HTMLDivElement`}]},description:`Ref forwarded to the root element.`},heading:{required:!0,tsType:{name:`string`},description:`Group heading text.`},children:{required:!0,tsType:{name:`ReactNode`},description:`Items within this group.`}},composes:[`Omit`]}}));function U({value:e,onValueChange:t,placeholder:n,label:r,hasAutoFocus:a=!0,endContent:s,onChange:c,onKeyDown:l,ref:d,xstyle:p,...h}){let _=v(),y=n??_(`@astryx.commandPalette.input.placeholder`),b=O(),x=w(),S=(0,W.useRef)(null),C=e??b?.search,T=t??b?.setSearch,E=a&&x?.isInline!==!0;(0,W.useEffect)(()=>{E&&S.current&&requestAnimationFrame(()=>{S.current?.focus()})},[E]);let D=(0,W.useCallback)(e=>{l?.(e),!e.defaultPrevented&&b?.onKeyDown(e)},[b,l]);return(0,G.jsxs)(`div`,{...f(i(`command-palette-input`),o(K.wrapper,p)),children:[(0,G.jsx)(`span`,{className:`astryx78zum5 astryx6s0dn4 astryx2lah0s astryxv1l7n4`,children:(0,G.jsx)(g,{icon:`search`,size:`sm`,color:`inherit`})}),(0,G.jsx)(`input`,{ref:u(d,S),type:`text`,role:`combobox`,"aria-expanded":b?.isOpen??!0,"aria-autocomplete":`list`,"aria-controls":b?.listId,"aria-activedescendant":b&&b.highlightedIndex>=0?b.getItemId(b.highlightedIndex):void 0,"aria-label":r??y,placeholder:y,value:C,"data-autofocus":E||void 0,onChange:e=>{T?.(e.target.value),c?.(e)},onKeyDown:D,className:`astryx98rzlu astryxeuugli astryx1gs6z28 astryx1a2a7pz astryxjbqb8w astryx1tgivj0 astryx9ynric astryxjm74w1 astryx6pjikd astryxw6l6zx astryx1717udv astryxeyghm5`,...h}),(b?.isBusy||s)&&(0,G.jsxs)(`span`,{className:`astryx78zum5 astryx6s0dn4 astryxzye2dw astryx2lah0s`,children:[b?.isBusy&&(0,G.jsx)(`span`,{className:`astryx78zum5 astryx6s0dn4 astryx2lah0s astryxv1l7n4 astryx1hc1fzr astryx19991ni astryxjd9b36 astryx5h36tt astryx4itv7f`,children:(0,G.jsx)(m,{size:`sm`})}),s]}),` `]})}var W,G,K,q=t((()=>{W=e(n(),1),r(),_(),h(),d(),j(),C(),a(),y(),G=p(),K={wrapper:{k1xSpc:`astryx78zum5`,kGNEyG:`astryx6s0dn4`,kOIVth:`astryx1txdalj`,kg3NbH:`astryx1pzlopt`,k8WAf4:`astryx8o8v82`,kmuXW:`astryx2lah0s`,$$css:!0}},U.displayName=`CommandPaletteInput`,U.__docgenInfo={description:`Search input for the command palette.

Renders a search icon and a text input. Auto-focuses when mounted
so users can start typing immediately.

When used inside CommandPalette, automatically wires to the
context for search state and keyboard navigation (via useCombobox).
Can also be used standalone with explicit value/onValueChange props.

@compositionHint Place as the first child of CommandPalette.

@example
\`\`\`
<CommandPalette isOpen={isOpen} onOpenChange={setIsOpen}>
  <CommandPaletteInput placeholder="Search commands..." />
</CommandPalette>
\`\`\``,methods:[],displayName:`CommandPaletteInput`,props:{ref:{required:!1,tsType:{name:`ReactRef`,raw:`React.Ref<HTMLInputElement>`,elements:[{name:`HTMLInputElement`}]},description:`Ref forwarded to the input element (for focus management).`},value:{required:!1,tsType:{name:`string`},description:`The current search value.
When omitted inside CommandPalette, reads from context.`},onValueChange:{required:!1,tsType:{name:`signature`,type:`function`,raw:`(value: string) => void`,signature:{arguments:[{type:{name:`string`},name:`value`}],return:{name:`void`}}},description:`Called when the search value changes.
When omitted inside CommandPalette, writes to context.`},placeholder:{required:!1,tsType:{name:`string`},description:`Placeholder text for the input.
@default 'Search...'`},label:{required:!1,tsType:{name:`string`},description:`Accessible label for the combobox input, announced by screen readers.
Falls back to the placeholder text (\`'Search…'\` by default), since a
placeholder alone is not a reliable accessible name.`},hasAutoFocus:{required:!1,tsType:{name:`boolean`},description:`Whether to auto-focus the input when mounted.
@default true`,defaultValue:{value:`true`,computed:!1}},endContent:{required:!1,tsType:{name:`ReactNode`},description:`Content rendered at the trailing end of the input, after the spinner.
Use for clear buttons, keyboard shortcuts, or other trailing actions.
The spinner (when busy) appears immediately before this content with a 4px gap.`},onChange:{required:!1,tsType:{name:`ReactChangeEventHandler`,raw:`React.ChangeEventHandler<HTMLInputElement>`,elements:[{name:`HTMLInputElement`}]},description:`Native onChange handler for the input element.`}},composes:[`Omit`]}}));function J({children:e,ref:t,xstyle:n,className:r,style:a,...s}){return(0,Y.jsx)(`div`,{ref:t,...f(i(`command-palette-footer`),o(ie.footer,n),r,a),...s,children:e??(0,Y.jsxs)(Y.Fragment,{children:[(0,Y.jsxs)(`span`,{className:`astryx78zum5 astryx6s0dn4 astryxzye2dw`,children:[(0,Y.jsx)(b,{keys:`up`}),(0,Y.jsx)(b,{keys:`down`}),`Navigate`]}),(0,Y.jsxs)(`span`,{className:`astryx78zum5 astryx6s0dn4 astryxzye2dw`,children:[(0,Y.jsx)(b,{keys:`enter`}),`Select`]}),(0,Y.jsxs)(`span`,{className:`astryx78zum5 astryx6s0dn4 astryxzye2dw`,children:[(0,Y.jsx)(b,{keys:`escape`}),`Close`]})]})})}var Y,ie,X=t((()=>{r(),d(),x(),a(),Y=p(),ie={footer:{k1xSpc:`astryx78zum5`,kGNEyG:`astryx6s0dn4`,kOIVth:`astryx18g69wz`,kg3NbH:`astryx1pzlopt`,k8WAf4:`astryxce4md1`,kmuXW:`astryx2lah0s`,kMv6JI:`astryx9ynric`,kGuDYH:`astryx141an7d`,kLWn49:`astryx1ltkj2j`,kMwMTN:`astryxv1l7n4`,$$css:!0}},J.displayName=`CommandPaletteFooter`,J.__docgenInfo={description:`Footer for the command palette showing keyboard navigation hints.

When no children are provided, renders default hints using Kbd
for arrow keys, Enter to select, and Escape to close.

@compositionHint Pass to CommandPalette's \`footer\` slot.

@example
\`\`\`
<CommandPalette
  isOpen={isOpen}
  onOpenChange={setIsOpen}
  input={<CommandPaletteInput />}
  footer={<CommandPaletteFooter />}>
  <CommandPaletteList>...</CommandPaletteList>
</CommandPalette>
\`\`\``,methods:[],displayName:`CommandPaletteFooter`,props:{xstyle:{required:!1,tsType:{name:`StyleXStyles`},description:"StyleX styles created via `stylex.create()`. Merged with the component's\nbase styles inside a single `stylex.props()` call for optimal deduplication.\n\n@example\n```\nconst overrides = stylex.create({ root: { marginBottom: 8 } });\n<Component xstyle={overrides.root} />\n```"},ref:{required:!1,tsType:{name:`ReactRef`,raw:`React.Ref<HTMLDivElement>`,elements:[{name:`HTMLDivElement`}]},description:`Ref forwarded to the footer element.`},children:{required:!1,tsType:{name:`ReactNode`},description:`Footer content. When provided, renders custom content instead of default hints.
Custom children inherit the footer font treatment (supporting/12px, secondary color).
When omitted, renders default keyboard navigation hints using Kbd.`}},composes:[`Omit`]}}));function Z({ref:e,children:t,xstyle:n,className:r,style:a,...s}){return(0,ae.jsx)(`div`,{ref:e,...f(i(`command-palette-empty`),o(oe.empty,n),r,a),...s,children:t})}var ae,oe,se=t((()=>{n(),r(),d(),a(),ae=p(),oe={empty:{k1xSpc:`astryx78zum5`,kGNEyG:`astryx6s0dn4`,kjj79g:`astryxl56j7k`,k8WAf4:`astryxmfvnks`,kg3NbH:`astryx1pzlopt`,kMv6JI:`astryx9ynric`,kGuDYH:`astryx141an7d`,kLWn49:`astryx1ltkj2j`,kMwMTN:`astryxv1l7n4`,k9WMMc:`astryx2b8uid`,$$css:!0}},Z.displayName=`CommandPaletteEmpty`,Z.__docgenInfo={description:`Empty state for the command palette list area.

Rendered automatically by CommandPalette in two situations:
- \`emptyBootstrapText\`: no search term and bootstrap() returns nothing
- \`emptySearchText\`: a search query returned no results

Can also be composed manually inside a custom render function.

@example
\`\`\`
<CommandPalette
  emptyBootstrapText={<CommandPaletteEmpty>Start typing to search</CommandPaletteEmpty>}
  emptySearchText={<CommandPaletteEmpty>No results found</CommandPaletteEmpty>}
  searchSource={source}
/>
\`\`\``,methods:[],displayName:`CommandPaletteEmpty`,props:{xstyle:{required:!1,tsType:{name:`StyleXStyles`},description:"StyleX styles created via `stylex.create()`. Merged with the component's\nbase styles inside a single `stylex.props()` call for optimal deduplication.\n\n@example\n```\nconst overrides = stylex.create({ root: { marginBottom: 8 } });\n<Component xstyle={overrides.root} />\n```"},ref:{required:!1,tsType:{name:`ReactRef`,raw:`React.Ref<HTMLDivElement>`,elements:[{name:`HTMLDivElement`}]},description:``},children:{required:!0,tsType:{name:`ReactNode`},description:`The message or content to display.`}},composes:[`Omit`]}}));function ce(e){let t=e.auxiliaryData;return typeof t?.group==`string`?t.group:void 0}function le(e){if(!e.some(e=>ce(e)!=null))return e.map(e=>({value:e.id,label:e.label}));let t=[],n=new Map,r=[];for(let i of e){let e=ce(i);e==null?r.push(i):(n.has(e)||(t.push(e),n.set(e,[])),n.get(e)?.push(i))}let i=[];for(let e of t)for(let t of n.get(e)??[])i.push({value:t.id,label:t.label});for(let e of r)i.push({value:e.id,label:e.label});return i}function ue({items:e,value:t,renderItem:n}){let r=e=>(0,$.jsx)(P,{value:e.id,children:n?n(e,e.id===t):e.label},e.id);if(!e.some(e=>ce(e)!=null))return(0,$.jsx)($.Fragment,{children:e.map(r)});let i=[],a=new Map,o=[];for(let t of e){let e=ce(t);e==null?o.push(t):(a.has(e)||(i.push(e),a.set(e,[])),a.get(e)?.push(t))}return(0,$.jsxs)($.Fragment,{children:[i.map(e=>(0,$.jsx)(z,{heading:e,children:(a.get(e)??[]).map(r)},e)),o.map(r)]})}function de({ref:e,isOpen:t,isInline:n,onOpenChange:r,searchSource:i,input:a,footer:o,renderItem:u,emptySearchText:d,emptyBootstrapText:f,value:p,onValueChange:m,label:h,width:g=640,maxHeight:_=480}){let y=v(),b=h??y(`@astryx.commandPalette.label`),x=d??y(`@astryx.commandPalette.emptySearch`),C=f??y(`@astryx.commandPalette.emptyBootstrap`),w=(0,Q.useId)(),[T,D]=(0,Q.useState)(``),[te,O]=(0,Q.useState)(``),[k,j]=(0,Q.useState)([]),[re,M]=(0,Q.useTransition)(),[N,P]=(0,Q.useOptimistic)(T),[F,I]=(0,Q.useOptimistic)(k),L=re,R=(0,Q.useRef)(0),z=p??te,B=(0,Q.useCallback)(e=>{p===void 0&&O(e),m?.(e)},[p,m]),V=(0,Q.useMemo)(()=>le(F),[F]),H=(0,Q.useCallback)(()=>{D(``),j([]),p===void 0&&O(``),i.cancel?.(),r(!1)},[r,i,p]),W=(0,Q.useCallback)(e=>{B(e)},[B]),G=ee({selectableItems:V,value:z,isOpen:!0,onOpen:()=>{},onClose:()=>{},onSelect:e=>{W(e),H()},listboxId:w}),K=(0,Q.useCallback)(e=>{i.cancel?.();let t=++R.current;M(async()=>{let n=e===``;if(!n&&k.length>0){let t=e.toLowerCase().trim();I(k.filter(e=>e.label.toLowerCase().includes(t)))}let r=n?i.bootstrap():i.search(e),a=await Promise.resolve(r);if(R.current===t&&(D(e),I(a),j(a),n&&z!=null&&z!==``)){let e=a.findIndex(e=>e.id===z);e>=0&&G.setHighlightedIndex(e)}})},[i,k,M,z,G,I]),q=(0,Q.useRef)(K);q.current=K,(0,Q.useEffect)(()=>{t&&q.current(``)},[t]);let Y=(0,Q.useCallback)(e=>{if(e.key===`Escape`){e.preventDefault(),H();return}if(e.key===`Enter`){if(e.preventDefault(),G.highlightedIndex>=0&&G.highlightedIndex<V.length){let e=V[G.highlightedIndex];e&&!e.disabled&&(W(e.value),H())}return}e.key!==` `&&G.onKeyDown(e)},[G,H,V,W]),ie=(0,Q.useMemo)(()=>({search:N,setSearch:e=>{M(()=>{P(e)}),K(e)},value:z,setValue:B,listId:w,highlightedIndex:G.highlightedIndex,setHighlightedIndex:G.setHighlightedIndex,getItemId:G.getItemId,selectableItems:V,searchResults:F,selectItem:W,onKeyDown:Y,onClose:H,isOpen:t,isBusy:L}),[N,P,K,z,B,w,G.highlightedIndex,G.setHighlightedIndex,G.getItemId,V,F,W,Y,H,t,L]),X=T===``&&F.length===0,ae=T!==``&&F.length===0,oe;return oe=X?(0,$.jsx)(Z,{children:C}):ae?(0,$.jsx)(Z,{children:x}):(0,$.jsx)(ue,{items:F,value:z,renderItem:u}),(0,$.jsx)(S,{ref:e,isOpen:t,isInline:n,onOpenChange:e=>{e?r(!0):H()},width:g,maxHeight:_,purpose:`info`,"aria-label":b,children:(0,$.jsx)(A,{value:ie,children:(0,$.jsx)(s,{defaultHasDividers:!0,header:(0,$.jsx)(l,{hasDivider:!0,padding:0,children:a??(0,$.jsx)(U,{})}),content:(0,$.jsx)(c,{padding:0,children:(0,$.jsx)(ne,{children:oe})}),footer:(0,$.jsx)(E,{hasDivider:!0,padding:0,children:o??(0,$.jsx)(J,{})})})})})}var Q,$,fe=t((()=>{Q=e(n(),1),T(),D(),te(),j(),N(),R(),H(),q(),X(),se(),y(),$=p(),de.displayName=`CommandPalette`,de.__docgenInfo={description:`Command palette root component.

Uses \`searchSource\` for all search logic — same interface as Typeahead.
For static lists, use \`createStaticSource\` from \`@astryxdesign/core/Typeahead\`.

Keyboard navigation is handled by \`useCombobox\` from Selector,
ensuring consistent arrow key, Home/End, Enter, and Escape behavior
across all combobox-pattern components.

Input and footer are rendered by default — only pass them to replace the defaults.

@compositionHint
  - \`input\` slot: CommandPaletteInput (default)
  - \`footer\` slot: CommandPaletteFooter (default)
  - \`renderItem(item, isSelected)\`: custom per-item content (grouping preserved)

@example
\`\`\`
<CommandPalette
  isOpen={isOpen}
  onOpenChange={setIsOpen}
  searchSource={createStaticSource(commands)}
/>
\`\`\``,methods:[],displayName:`CommandPalette`,props:{ref:{required:!1,tsType:{name:`ReactRef`,raw:`React.Ref<HTMLDialogElement>`,elements:[{name:`HTMLDialogElement`}]},description:``},isOpen:{required:!0,tsType:{name:`boolean`},description:`Whether the command palette is open.`},isInline:{required:!1,tsType:{name:`boolean`},description:`Renders command palette content inline without modal behavior.
Suppresses input auto-focus and initial highlighted-item auto-scroll.
For documentation previews and showcases only.
@default false`},onOpenChange:{required:!0,tsType:{name:`signature`,type:`function`,raw:`(isOpen: boolean) => void`,signature:{arguments:[{type:{name:`boolean`},name:`isOpen`}],return:{name:`void`}}},description:`Called when the command palette visibility changes.`},searchSource:{required:!0,tsType:{name:`SearchSource`,elements:[{name:`T`}],raw:`SearchSource<T>`},description:"Search source providing items. Implements `search(query)` and `bootstrap()`.\nSame interface as Typeahead's searchSource.\nUse `createStaticSource` for simple static lists."},input:{required:!1,tsType:{name:`ReactNode`},description:`The search input slot.
@default <CommandPaletteInput />`},footer:{required:!1,tsType:{name:`ReactNode`},description:`The footer slot.
@default <CommandPaletteFooter />`},renderItem:{required:!1,tsType:{name:`signature`,type:`function`,raw:`(item: T, isSelected: boolean) => ReactNode`,signature:{arguments:[{type:{name:`T`},name:`item`},{type:{name:`boolean`},name:`isSelected`}],return:{name:`ReactNode`}}},description:"Per-item render function. Receives the item and whether it is currently selected.\nAuto-grouping by `auxiliaryData.group` is preserved.\nWhen omitted, renders each item's `label` text."},emptySearchText:{required:!1,tsType:{name:`ReactNode`},description:`Content shown when a search query returns no results.
@default 'No results'`},emptyBootstrapText:{required:!1,tsType:{name:`ReactNode`},description:`Content shown when there is no search query and bootstrap() returns nothing.
@default 'Type to search'`},value:{required:!1,tsType:{name:`string`},description:`Controlled selected value (for picker mode).`},onValueChange:{required:!1,tsType:{name:`signature`,type:`function`,raw:`(value: string) => void`,signature:{arguments:[{type:{name:`string`},name:`value`}],return:{name:`void`}}},description:`Called when the selected value changes.`},label:{required:!1,tsType:{name:`string`},description:`Accessible label for the command palette dialog.
@default 'Command palette'`},width:{required:!1,tsType:{name:`union`,raw:`number | string`,elements:[{name:`number`},{name:`string`}]},description:`Width of the command palette dialog.
@default 640`,defaultValue:{value:`640`,computed:!1}},maxHeight:{required:!1,tsType:{name:`union`,raw:`number | string`,elements:[{name:`number`},{name:`string`}]},description:`Maximum height of the command palette dialog.
@default 480`,defaultValue:{value:`480`,computed:!1}}},composes:[`Omit`]}})),pe=t((()=>{fe(),q(),N(),R(),H(),X(),se(),j()}));export{X as a,J as i,de as n,U as o,fe as r,q as s,pe as t};