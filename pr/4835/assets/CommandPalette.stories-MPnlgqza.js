import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{t}from"./react-BZJXY1be.js";import{n,t as r}from"./stylex-Dft6gtPK.js";import{i,n as a,r as o,t as s}from"./LayoutContent-Bp6k5ngv.js";import{n as c,t as l}from"./Theme-os0aoGDw.js";import{n as u}from"./mergeProps-JRyAvMxc.js";import{n as ee}from"./mergeRefs-CPqjs56a.js";import{n as d,t as f}from"./themeProps-CREkzZh6.js";import{t as p}from"./jsx-runtime-DeHZSEgm.js";import{n as m,t as te}from"./LayoutHeader-DrI9WNU1.js";import{a as h,o as g}from"./useTheme-CAaDofyu.js";import{n as _,t as v}from"./Spinner-CzifdOpC.js";import{n as y,t as b}from"./Button-BVMvoKVE.js";import{n as ne,t as x}from"./useTranslator-BMnme3me.js";import{n as S,t as C}from"./Icon-C24cO4CC.js";import{n as re,t as ie}from"./useAnnounce-DW4eqOGv.js";import{n as ae,t as w}from"./Kbd-juLTAo5-.js";import{i as oe,n as se,r as T,t as ce}from"./Dialog-kqrFWV1N.js";import{n as le,t as ue}from"./LayoutFooter-BqlHgkBi.js";import{n as de,t as fe}from"./hooks-D-Fzeoaq.js";import{t as E}from"./createStaticSource-Cfz9LMai.js";function D(){return(0,pe.use)(me)}var pe,me;function O(){return(O=e((()=>{pe=t(),me=(0,pe.createContext)(null),me.displayName=`CommandPaletteContext`})))()}function he({children:e,label:t,ref:r,xstyle:i,className:a,style:o,...s}){let c=ne(),l=t??c(`@astryx.commandPalette.list.label`),ee=D();return(0,k.jsx)(`div`,{ref:r,id:ee?.listId,role:`listbox`,"aria-label":l,...u(d(`command-palette-list`),n(A.list,i),a,o),...s,children:e})}var k,A;function j(){return(j=e((()=>{r(),O(),f(),x(),k=p(),A={list:{kORKVm:`astryx1odjw0f`,kskxy:`astryxmz0i5r`,kmVPX3:`astryx9epnlk`,kUk6DE:`astryx98rzlu`,k1xSpc:`astryx78zum5`,kXwgrk:`astryxdt5ytf`,kOIVth:`astryx1lsbc85`,$$css:!0}},he.displayName=`CommandPaletteList`,he.__docgenInfo={description:`Scrollable results container for the command palette.
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
@default 'Commands'`}},composes:[`Omit`]}})))()}function M({value:e,onSelect:t,isHighlighted:r,isSelected:i,isDisabled:a=!1,children:o,ref:s,xstyle:c,className:l,style:f,...p}){let m=D(),te=oe()?.isInline===!0,h=(0,N.useRef)(null),g=(0,N.useRef)(!1),_=(0,N.useMemo)(()=>m?.selectableItems.findIndex(t=>t.value===e)??-1,[m?.selectableItems,e]),v=r??(m?m.highlightedIndex===_&&_>=0:!1),y=i??(m?m.value===e:!1);(0,N.useEffect)(()=>{let e=te&&!g.current;g.current=!0,!e&&v&&h.current&&h.current.scrollIntoView?.({block:`nearest`})},[v,te]);let b=(0,N.useCallback)(()=>{a||(t?.(e),m&&(m.selectItem(e),m.onClose()))},[a,e,t,m]),ne=(0,N.useCallback)(()=>{a||!m||_<0||m.setHighlightedIndex(_)},[a,_,m]);return(0,P.jsx)(`div`,{ref:ee(s,h),id:m&&_>=0?m.getItemId(_):void 0,role:`option`,"aria-selected":y,"aria-disabled":a||void 0,"data-value":e,onClick:b,onMouseEnter:ne,...u(d(`command-palette-item`),n(F.item,!a&&F.itemHover,v&&F.itemHighlighted,y&&F.itemSelected,a&&F.itemDisabled,c),l,f),...p,children:o})}var N,P,F;function I(){return(I=e((()=>{N=t(),r(),O(),T(),f(),P=p(),F={item:{k1xSpc:`astryx78zum5`,kGNEyG:`astryx6s0dn4`,kOIVth:`astryx1txdalj`,kzqmXN:`astryxh8yej3`,kg3NbH:`astryxrrkdod`,k8WAf4:`astryxce4md1`,kaIpWk:`astryxx3sua9`,kMv6JI:`astryx9ynric`,kGuDYH:`astryxcr08ib`,kMwMTN:`astryx1tgivj0`,kWkggS:`astryxjbqb8w`,kQgIW9:`astryx1gs6z28`,kkrTdU:`astryx1ypdohk`,k9WMMc:`astryx1yc453h`,kI3sdo:`astryx1a2a7pz`,kfSwDN:`astryx87ps6o`,$$css:!0},itemHover:{kHE3J0:`astryxe9uy6x`,kSReZ0:`astryxyxi2l3`,$$css:!0},itemHighlighted:{kWkggS:`astryx1lmrjuc`,$$css:!0},itemDisabled:{kSiTet:`astryxbyyjgo`,kkrTdU:`astryx1h6gzvc`,$$css:!0},itemSelected:{kWkggS:`astryxgcxg3y`,$$css:!0}},M.displayName=`CommandPaletteItem`,M.__docgenInfo={description:`A selectable item in the command palette.
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
@default false`,defaultValue:{value:`false`,computed:!1}},children:{required:!0,tsType:{name:`ReactNode`},description:`Item content. Fully custom — render icons, descriptions, shortcuts, etc.`}},composes:[`Omit`]}})))()}function L({heading:e,children:t,ref:r,xstyle:i,className:a,style:o,...s}){return(0,ge.jsxs)(`div`,{ref:r,role:`group`,"aria-label":e,...u(d(`command-palette-group`),n(_e.group,i),a,o),...s,children:[(0,ge.jsx)(`div`,{"aria-hidden":`true`,...u(d(`command-palette-group-heading`),{className:`astryxrrkdod astryxu0wf1k astryx9ynric astryx141an7d astryx1ltkj2j astryxv1l7n4 astryx87ps6o`}),children:e}),t]})}var ge,_e;function ve(){return(ve=e((()=>{r(),f(),ge=p(),_e={group:{k1xSpc:`astryx78zum5`,kXwgrk:`astryxdt5ytf`,kOIVth:`astryx1lsbc85`,k8WAf4:`astryxu0wf1k`,$$css:!0}},L.displayName=`CommandPaletteGroup`,L.__docgenInfo={description:`Visual grouping for command palette items with a heading label.

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
\`\`\``,methods:[],displayName:`CommandPaletteGroup`,props:{xstyle:{required:!1,tsType:{name:`StyleXStyles`},description:"StyleX styles created via `stylex.create()`. Merged with the component's\nbase styles inside a single `stylex.props()` call for optimal deduplication.\n\n@example\n```\nconst overrides = stylex.create({ root: { marginBottom: 8 } });\n<Component xstyle={overrides.root} />\n```"},ref:{required:!1,tsType:{name:`ReactRef`,raw:`React.Ref<HTMLDivElement>`,elements:[{name:`HTMLDivElement`}]},description:`Ref forwarded to the root element.`},heading:{required:!0,tsType:{name:`string`},description:`Group heading text.`},children:{required:!0,tsType:{name:`ReactNode`},description:`Items within this group.`}},composes:[`Omit`]}})))()}function ye({value:e,onValueChange:t,placeholder:r,label:i,hasAutoFocus:a=!0,endContent:o,onChange:s,onKeyDown:c,ref:l,xstyle:f,className:p,style:m,...te}){let h=ne(),g=r??h(`@astryx.commandPalette.input.placeholder`),_=D(),y=oe(),b=(0,be.useRef)(null),x=e??_?.search,S=t??_?.setSearch,re=a&&y?.isInline!==!0;(0,be.useEffect)(()=>{re&&b.current&&requestAnimationFrame(()=>{b.current?.focus()})},[re]);let ie=(0,be.useCallback)(e=>{c?.(e),!e.defaultPrevented&&_?.onKeyDown(e)},[_,c]);return(0,R.jsxs)(`div`,{...u(d(`command-palette-input`),n(xe.wrapper,f),p,m),children:[(0,R.jsx)(`span`,{className:`astryx78zum5 astryx6s0dn4 astryx2lah0s astryxv1l7n4`,children:(0,R.jsx)(C,{icon:`search`,size:`sm`,color:`inherit`})}),(0,R.jsx)(`input`,{ref:ee(l,b),type:`text`,role:`combobox`,"aria-expanded":_?.isOpen??!0,"aria-autocomplete":`list`,"aria-controls":_?.listId,"aria-activedescendant":_&&_.highlightedIndex>=0?_.getItemId(_.highlightedIndex):void 0,"aria-label":i??g,placeholder:g,value:x,"data-autofocus":re||void 0,onChange:e=>{S?.(e.target.value),s?.(e)},onKeyDown:ie,className:`astryx98rzlu astryxeuugli astryx1gs6z28 astryx1a2a7pz astryxjbqb8w astryx1tgivj0 astryx9ynric astryxjm74w1 astryx6pjikd astryxw6l6zx astryx1717udv astryxeyghm5`,...te}),(_?.isBusy||o)&&(0,R.jsxs)(`span`,{className:`astryx78zum5 astryx6s0dn4 astryxzye2dw astryx2lah0s`,children:[_?.isBusy&&(0,R.jsx)(`span`,{className:`astryx78zum5 astryx6s0dn4 astryx2lah0s astryxv1l7n4 astryx1hc1fzr astryx19991ni astryxjd9b36 astryx5h36tt astryx4itv7f`,children:(0,R.jsx)(v,{size:`sm`})}),o]}),` `]})}var be,R,xe;function Se(){return(Se=e((()=>{be=t(),r(),S(),_(),O(),T(),f(),x(),R=p(),xe={wrapper:{k1xSpc:`astryx78zum5`,kGNEyG:`astryx6s0dn4`,kOIVth:`astryx1txdalj`,kg3NbH:`astryx1pzlopt`,k8WAf4:`astryx8o8v82`,kmuXW:`astryx2lah0s`,$$css:!0}},ye.displayName=`CommandPaletteInput`,ye.__docgenInfo={description:`Search input for the command palette.

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
The spinner (when busy) appears immediately before this content with a 4px gap.`},onChange:{required:!1,tsType:{name:`ReactChangeEventHandler`,raw:`React.ChangeEventHandler<HTMLInputElement>`,elements:[{name:`HTMLInputElement`}]},description:`Native onChange handler for the input element.`}},composes:[`Omit`]}})))()}function Ce({children:e,ref:t,xstyle:r,className:i,style:a,...o}){return(0,z.jsx)(`div`,{ref:t,...u(d(`command-palette-footer`),n(we.footer,r),i,a),...o,children:e??(0,z.jsxs)(z.Fragment,{children:[(0,z.jsxs)(`span`,{className:`astryx78zum5 astryx6s0dn4 astryxzye2dw`,children:[(0,z.jsx)(w,{keys:`up`}),(0,z.jsx)(w,{keys:`down`}),`Navigate`]}),(0,z.jsxs)(`span`,{className:`astryx78zum5 astryx6s0dn4 astryxzye2dw`,children:[(0,z.jsx)(w,{keys:`enter`}),`Select`]}),(0,z.jsxs)(`span`,{className:`astryx78zum5 astryx6s0dn4 astryxzye2dw`,children:[(0,z.jsx)(w,{keys:`escape`}),`Close`]})]})})}var z,we;function Te(){return(Te=e((()=>{r(),ae(),f(),z=p(),we={footer:{k1xSpc:`astryx78zum5`,kGNEyG:`astryx6s0dn4`,kOIVth:`astryx18g69wz`,kg3NbH:`astryx1pzlopt`,k8WAf4:`astryxce4md1`,kmuXW:`astryx2lah0s`,kMv6JI:`astryx9ynric`,kGuDYH:`astryx141an7d`,kLWn49:`astryx1ltkj2j`,kMwMTN:`astryxv1l7n4`,$$css:!0}},Ce.displayName=`CommandPaletteFooter`,Ce.__docgenInfo={description:`Footer for the command palette showing keyboard navigation hints.

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
When omitted, renders default keyboard navigation hints using Kbd.`}},composes:[`Omit`]}})))()}function Ee({ref:e,children:t,xstyle:r,className:i,style:a,...o}){return(0,De.jsx)(`div`,{ref:e,...u(d(`command-palette-empty`),n(Oe.empty,r),i,a),...o,children:t})}var De,Oe;function ke(){return(ke=e((()=>{t(),r(),f(),De=p(),Oe={empty:{k1xSpc:`astryx78zum5`,kGNEyG:`astryx6s0dn4`,kjj79g:`astryxl56j7k`,k8WAf4:`astryxmfvnks`,kg3NbH:`astryx1pzlopt`,kMv6JI:`astryx9ynric`,kGuDYH:`astryx141an7d`,kLWn49:`astryx1ltkj2j`,kMwMTN:`astryxv1l7n4`,k9WMMc:`astryx2b8uid`,$$css:!0}},Ee.displayName=`CommandPaletteEmpty`,Ee.__docgenInfo={description:`Empty state for the command palette list area.

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
\`\`\``,methods:[],displayName:`CommandPaletteEmpty`,props:{xstyle:{required:!1,tsType:{name:`StyleXStyles`},description:"StyleX styles created via `stylex.create()`. Merged with the component's\nbase styles inside a single `stylex.props()` call for optimal deduplication.\n\n@example\n```\nconst overrides = stylex.create({ root: { marginBottom: 8 } });\n<Component xstyle={overrides.root} />\n```"},ref:{required:!1,tsType:{name:`ReactRef`,raw:`React.Ref<HTMLDivElement>`,elements:[{name:`HTMLDivElement`}]},description:``},children:{required:!0,tsType:{name:`ReactNode`},description:`The message or content to display.`}},composes:[`Omit`]}})))()}function Ae(e){let t=e.auxiliaryData;return typeof t?.group==`string`?t.group:void 0}function je(e){if(!e.some(e=>Ae(e)!=null))return e.map(e=>({value:e.id,label:e.label}));let t=[],n=new Map,r=[];for(let i of e){let e=Ae(i);e==null?r.push(i):(n.has(e)||(t.push(e),n.set(e,[])),n.get(e)?.push(i))}let i=[];for(let e of t)for(let t of n.get(e)??[])i.push({value:t.id,label:t.label});for(let e of r)i.push({value:e.id,label:e.label});return i}function Me({items:e,value:t,renderItem:n}){let r=e=>(0,H.jsx)(M,{value:e.id,children:n?n(e,e.id===t):e.label},e.id);if(!e.some(e=>Ae(e)!=null))return(0,H.jsx)(H.Fragment,{children:e.map(r)});let i=[],a=new Map,o=[];for(let t of e){let e=Ae(t);e==null?o.push(t):(a.has(e)||(i.push(e),a.set(e,[])),a.get(e)?.push(t))}return(0,H.jsxs)(H.Fragment,{children:[i.map(e=>(0,H.jsx)(L,{heading:e,children:(a.get(e)??[]).map(r)},e)),o.map(r)]})}function B({ref:e,isOpen:t,isInline:n,onOpenChange:r,searchSource:i,input:a,footer:c,renderItem:l,emptySearchText:u,emptyBootstrapText:ee,value:d,onValueChange:f,label:p,width:m=640,maxHeight:h=480,...g}){let _=ne(),v=p??_(`@astryx.commandPalette.label`),y=u??_(`@astryx.commandPalette.emptySearch`),b=ee??_(`@astryx.commandPalette.emptyBootstrap`),x=(0,V.useId)(),[S,C]=(0,V.useState)(``),[ie,ae]=(0,V.useState)(``),[w,oe]=(0,V.useState)([]),[se,T]=(0,V.useTransition)(),[le,fe]=(0,V.useOptimistic)(S),[E,D]=(0,V.useOptimistic)(w),pe=se,O=(0,V.useRef)(0),k=re(),A=d??ie,j=(0,V.useCallback)(e=>{d===void 0&&ae(e),f?.(e)},[d,f]),M=(0,V.useMemo)(()=>je(E),[E]),N=(0,V.useCallback)(()=>{C(``),oe([]),d===void 0&&ae(``),i.cancel?.(),k(``),r(!1)},[r,i,d,k]),P=(0,V.useCallback)(e=>{j(e)},[j]),F=de({selectableItems:M,value:A,isOpen:!0,onOpen:()=>{},onClose:()=>{},onSelect:e=>{P(e),N()},listboxId:x}),I=(0,V.useCallback)(e=>{i.cancel?.();let t=++O.current;T(async()=>{let n=e===``;if(n||k(_(`@astryx.commandPalette.loading`)),!n&&w.length>0){let t=e.toLowerCase().trim();D(w.filter(e=>e.label.toLowerCase().includes(t)))}let r=n?i.bootstrap():i.search(e),a=await Promise.resolve(r);if(O.current===t&&(C(e),D(a),oe(a),n?k(``):a.length===0?k(_(`@astryx.commandPalette.noResultsFor`,{query:e})):k(_(`@astryx.commandPalette.resultCount`,{count:a.length})),n&&A!=null&&A!==``)){let e=a.findIndex(e=>e.id===A);e>=0&&F.setHighlightedIndex(e)}})},[i,w,T,A,F,D,k,_]),L=(0,V.useRef)(I);L.current=I,(0,V.useEffect)(()=>{t&&L.current(``)},[t]);let ge=(0,V.useCallback)(e=>{if(e.key===`Escape`){e.preventDefault(),N();return}if(e.key===`Enter`){if(e.preventDefault(),F.highlightedIndex>=0&&F.highlightedIndex<M.length){let e=M[F.highlightedIndex];e&&!e.disabled&&(P(e.value),N())}return}e.key!==` `&&F.onKeyDown(e)},[F,N,M,P]),_e=(0,V.useMemo)(()=>({search:le,setSearch:e=>{T(()=>{fe(e)}),I(e)},value:A,setValue:j,listId:x,highlightedIndex:F.highlightedIndex,setHighlightedIndex:F.setHighlightedIndex,getItemId:F.getItemId,selectableItems:M,searchResults:E,selectItem:P,onKeyDown:ge,onClose:N,isOpen:t,isBusy:pe}),[le,fe,I,A,j,x,F.highlightedIndex,F.setHighlightedIndex,F.getItemId,M,E,P,ge,N,t,pe]),ve=S===``&&E.length===0,be=S!==``&&E.length===0,R;return R=ve?(0,H.jsx)(Ee,{children:b}):be?(0,H.jsx)(Ee,{children:y}):(0,H.jsx)(Me,{items:E,value:A,renderItem:l}),(0,H.jsx)(ce,{ref:e,isOpen:t,isInline:n,onOpenChange:e=>{e?r(!0):N()},width:m,maxHeight:h,purpose:`info`,"aria-label":v,...g,children:(0,H.jsx)(me,{value:_e,children:(0,H.jsx)(o,{defaultHasDividers:!0,header:(0,H.jsx)(te,{hasDivider:!0,padding:0,children:a??(0,H.jsx)(ye,{})}),content:(0,H.jsx)(s,{padding:0,children:(0,H.jsx)(he,{children:R})}),footer:(0,H.jsx)(ue,{hasDivider:!0,padding:0,children:c??(0,H.jsx)(Ce,{})})})})})}var V,H;function Ne(){return(Ne=e((()=>{V=t(),se(),i(),m(),a(),le(),fe(),O(),j(),I(),ve(),Se(),Te(),ke(),ie(),x(),H=p(),B.displayName=`CommandPalette`,B.__docgenInfo={description:`Command palette root component.

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
@default 480`,defaultValue:{value:`480`,computed:!1}}},composes:[`Omit`]}})))()}var U,W,Pe,G,K,q,J,Y,X,Z,Q,Fe,$,Ie;function Le(){return(Le=e((()=>{U=t(),Ne(),Se(),Te(),ve(),y(),S(),c(),g(),W=p(),Pe={title:`Core/CommandPalette`,component:B,tags:[`autodocs`]},G={render:function(){let[e,t]=(0,U.useState)(!1),n=(0,U.useMemo)(()=>E([{id:`home`,label:`Home`},{id:`settings`,label:`Settings`},{id:`profile`,label:`Profile`},{id:`dashboard`,label:`Dashboard`},{id:`help`,label:`Help`}]),[]);return(0,W.jsxs)(W.Fragment,{children:[(0,W.jsx)(b,{label:`Open Command Palette`,onClick:()=>t(!0)}),(0,W.jsx)(B,{isOpen:e,onOpenChange:t,searchSource:n})]})}},K={render:function(){let[e,t]=(0,U.useState)(!1),n=(0,U.useMemo)(()=>E([{id:`home`,label:`Home`,auxiliaryData:{group:`Navigation`}},{id:`settings`,label:`Settings`,auxiliaryData:{group:`Navigation`}},{id:`profile`,label:`Profile`,auxiliaryData:{group:`Navigation`}},{id:`new-file`,label:`New File`,auxiliaryData:{group:`Actions`}},{id:`save`,label:`Save`,auxiliaryData:{group:`Actions`}},{id:`export`,label:`Export`,auxiliaryData:{group:`Actions`}}]),[]);return(0,W.jsxs)(W.Fragment,{children:[(0,W.jsx)(b,{label:`Open Grouped`,onClick:()=>t(!0)}),(0,W.jsx)(B,{isOpen:e,onOpenChange:t,searchSource:n})]})}},q={render:function(){let[e,t]=(0,U.useState)(!1),n=[{id:`dashboard`,label:`Go to Dashboard`,auxiliaryData:{icon:`menu`,group:`Navigation`}},{id:`settings`,label:`Open Settings`,auxiliaryData:{icon:`wrench`,group:`Navigation`,shortcut:`⌘,`}},{id:`profile`,label:`View Profile`,auxiliaryData:{icon:`info`,group:`Navigation`}},{id:`dark-mode`,label:`Toggle Dark Mode`,auxiliaryData:{group:`Actions`,keywords:[`theme`,`appearance`]}},{id:`new-file`,label:`Create New File`,auxiliaryData:{group:`Actions`,shortcut:`⌘N`}},{id:`search`,label:`Search Files`,auxiliaryData:{icon:`search`,group:`Actions`,shortcut:`⌘P`}}],r=(0,U.useMemo)(()=>E(n,{keywords:e=>e.auxiliaryData?.keywords??[]}),[]);return(0,W.jsxs)(W.Fragment,{children:[(0,W.jsx)(b,{label:`Open Rich Palette`,onClick:()=>t(!0)}),(0,W.jsx)(B,{isOpen:e,onOpenChange:t,searchSource:r,renderItem:e=>(0,W.jsxs)(`span`,{style:{display:`flex`,alignItems:`center`,gap:8,flex:1},children:[e.auxiliaryData?.icon&&(0,W.jsx)(C,{icon:e.auxiliaryData.icon,size:`sm`}),(0,W.jsx)(`span`,{style:{flex:1},children:e.label}),e.auxiliaryData?.shortcut&&(0,W.jsx)(`span`,{style:{fontSize:12,opacity:.5},children:e.auxiliaryData.shortcut})]})})]})}},J={render:function(){let[e,t]=(0,U.useState)(!1),[n,r]=(0,U.useState)(`light`),i=(0,U.useMemo)(()=>E([{id:`light`,label:`Light`},{id:`dark`,label:`Dark`},{id:`system`,label:`System`}]),[]);return(0,W.jsxs)(W.Fragment,{children:[(0,W.jsx)(b,{label:`Theme: ${n}`,onClick:()=>t(!0)}),(0,W.jsx)(B,{isOpen:e,onOpenChange:t,searchSource:i,value:n,onValueChange:e=>{r(e),t(!1)},renderItem:(e,t)=>(0,W.jsxs)(`span`,{style:{display:`flex`,alignItems:`center`,gap:8,flex:1},children:[(0,W.jsx)(`span`,{style:{flex:1},children:e.label}),t&&(0,W.jsx)(C,{icon:`check`,size:`sm`})]})})]})}},Y={render:function(){let[e,t]=(0,U.useState)(!1),n=(0,U.useMemo)(()=>{let e=null;return{cancel(){e?.abort()},async search(t){return e?.abort(),e=new AbortController,await new Promise(e=>setTimeout(e,400)),[{id:`readme`,label:`README.md`},{id:`package`,label:`package.json`},{id:`tsconfig`,label:`tsconfig.json`},{id:`index`,label:`src/index.ts`},{id:`app`,label:`src/App.tsx`}].filter(e=>e.label.toLowerCase().includes(t.toLowerCase()))},bootstrap(){return[]}}},[]);return(0,W.jsxs)(W.Fragment,{children:[(0,W.jsx)(b,{label:`Open File Search`,onClick:()=>t(!0)}),(0,W.jsx)(B,{isOpen:e,onOpenChange:t,searchSource:n,input:(0,W.jsx)(ye,{placeholder:`Search files...`}),emptyBootstrapText:`Type a filename to search`,emptySearchText:`No files found`})]})}},X={render:function(){let[e,t]=(0,U.useState)(!1),n=[{id:`home`,label:`Home`},{id:`dark-mode`,label:`Toggle Dark Mode`,auxiliaryData:{aliases:[`theme`,`appearance`]}},{id:`font-size`,label:`Change Font Size`,auxiliaryData:{aliases:[`text`,`zoom`]}}],r=(0,U.useMemo)(()=>E(n,{keywords:e=>e.auxiliaryData?.aliases??[]}),[]);return(0,W.jsxs)(W.Fragment,{children:[(0,W.jsx)(b,{label:`Open (try 'theme')`,onClick:()=>t(!0)}),(0,W.jsx)(B,{isOpen:e,onOpenChange:t,searchSource:r})]})}},Z={render:function(){let[e,t]=(0,U.useState)(!1),n=[`Files`,`Actions`,`Navigation`,`Settings`,`Recent`],r=Array.from({length:50},(e,t)=>({id:`item-${t}`,label:`Item ${t+1}`,auxiliaryData:{group:n[t%n.length]}})),i=(0,U.useMemo)(()=>E(r),[]);return(0,W.jsxs)(W.Fragment,{children:[(0,W.jsx)(b,{label:`Open (50 items)`,onClick:()=>t(!0)}),(0,W.jsx)(B,{isOpen:e,onOpenChange:t,searchSource:i})]})}},Q={render:function(){let[e,t]=(0,U.useState)(!1),n=(0,U.useMemo)(()=>E([{id:`home`,label:`Home`},{id:`settings`,label:`Settings`}]),[]);return(0,W.jsxs)(W.Fragment,{children:[(0,W.jsx)(b,{label:`Open`,onClick:()=>t(!0)}),(0,W.jsx)(B,{isOpen:e,onOpenChange:t,searchSource:n,footer:(0,W.jsx)(Ce,{children:(0,W.jsx)(`span`,{children:`Pro tip: use ⌘K to open anywhere`})})})]})}},Fe=h({name:`command-palette-group-heading-demo`,components:{"command-palette-group-heading":{base:{fontWeight:`var(--font-weight-bold)`,color:`var(--color-accent)`,textTransform:`uppercase`}}}}),$={render:()=>(0,W.jsx)(l,{theme:Fe,mode:`light`,children:(0,W.jsxs)(L,{heading:`Suggestions`,children:[(0,W.jsx)(`div`,{children:`Home`}),(0,W.jsx)(`div`,{children:`Settings`}),(0,W.jsx)(`div`,{children:`Profile`})]})})},G.parameters={...G.parameters,docs:{...G.parameters?.docs,source:{originalSource:`{
  render: function Render() {
    const [isOpen, setIsOpen] = useState(false);
    const source = useMemo(() => createStaticSource([{
      id: 'home',
      label: 'Home'
    }, {
      id: 'settings',
      label: 'Settings'
    }, {
      id: 'profile',
      label: 'Profile'
    }, {
      id: 'dashboard',
      label: 'Dashboard'
    }, {
      id: 'help',
      label: 'Help'
    }]), []);
    return <>
        <Button label="Open Command Palette" onClick={() => setIsOpen(true)} />
        <CommandPalette isOpen={isOpen} onOpenChange={setIsOpen} searchSource={source} />
      </>;
  }
}`,...G.parameters?.docs?.source},description:{story:`Simplest case — no input/footer/renderItem needed.`,...G.parameters?.docs?.description}}},K.parameters={...K.parameters,docs:{...K.parameters?.docs,source:{originalSource:`{
  render: function Render() {
    const [isOpen, setIsOpen] = useState(false);
    const source = useMemo(() => createStaticSource([{
      id: 'home',
      label: 'Home',
      auxiliaryData: {
        group: 'Navigation'
      }
    }, {
      id: 'settings',
      label: 'Settings',
      auxiliaryData: {
        group: 'Navigation'
      }
    }, {
      id: 'profile',
      label: 'Profile',
      auxiliaryData: {
        group: 'Navigation'
      }
    }, {
      id: 'new-file',
      label: 'New File',
      auxiliaryData: {
        group: 'Actions'
      }
    }, {
      id: 'save',
      label: 'Save',
      auxiliaryData: {
        group: 'Actions'
      }
    }, {
      id: 'export',
      label: 'Export',
      auxiliaryData: {
        group: 'Actions'
      }
    }]), []);
    return <>
        <Button label="Open Grouped" onClick={() => setIsOpen(true)} />
        <CommandPalette isOpen={isOpen} onOpenChange={setIsOpen} searchSource={source} />
      </>;
  }
}`,...K.parameters?.docs?.source},description:{story:`Groups detected automatically from auxiliaryData.group. No custom rendering needed.`,...K.parameters?.docs?.description}}},q.parameters={...q.parameters,docs:{...q.parameters?.docs,source:{originalSource:`{
  render: function Render() {
    const [isOpen, setIsOpen] = useState(false);
    const commands: RichCommand[] = [{
      id: 'dashboard',
      label: 'Go to Dashboard',
      auxiliaryData: {
        icon: 'menu',
        group: 'Navigation'
      }
    }, {
      id: 'settings',
      label: 'Open Settings',
      auxiliaryData: {
        icon: 'wrench',
        group: 'Navigation',
        shortcut: '⌘,'
      }
    }, {
      id: 'profile',
      label: 'View Profile',
      auxiliaryData: {
        icon: 'info',
        group: 'Navigation'
      }
    }, {
      id: 'dark-mode',
      label: 'Toggle Dark Mode',
      auxiliaryData: {
        group: 'Actions',
        keywords: ['theme', 'appearance']
      }
    }, {
      id: 'new-file',
      label: 'Create New File',
      auxiliaryData: {
        group: 'Actions',
        shortcut: '⌘N'
      }
    }, {
      id: 'search',
      label: 'Search Files',
      auxiliaryData: {
        icon: 'search',
        group: 'Actions',
        shortcut: '⌘P'
      }
    }];
    const source = useMemo(() => createStaticSource(commands, {
      keywords: item => item.auxiliaryData?.keywords ?? []
    }), []);
    return <>
        <Button label="Open Rich Palette" onClick={() => setIsOpen(true)} />
        <CommandPalette isOpen={isOpen} onOpenChange={setIsOpen} searchSource={source} renderItem={(item: RichCommand) => <span style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        flex: 1
      }}>
              {item.auxiliaryData?.icon && <Icon icon={item.auxiliaryData.icon} size="sm" />}
              <span style={{
          flex: 1
        }}>{item.label}</span>
              {item.auxiliaryData?.shortcut && <span style={{
          fontSize: 12,
          opacity: 0.5
        }}>
                  {item.auxiliaryData.shortcut}
                </span>}
            </span>} />
      </>;
  }
}`,...q.parameters?.docs?.source},description:{story:`Custom item content via renderItem — icons and shortcuts.
Grouping remains automatic via auxiliaryData.group.`,...q.parameters?.docs?.description}}},J.parameters={...J.parameters,docs:{...J.parameters?.docs,source:{originalSource:`{
  render: function Render() {
    const [isOpen, setIsOpen] = useState(false);
    const [theme, setTheme] = useState('light');
    const source = useMemo(() => createStaticSource([{
      id: 'light',
      label: 'Light'
    }, {
      id: 'dark',
      label: 'Dark'
    }, {
      id: 'system',
      label: 'System'
    }]), []);
    return <>
        <Button label={\`Theme: \${theme}\`} onClick={() => setIsOpen(true)} />
        <CommandPalette isOpen={isOpen} onOpenChange={setIsOpen} searchSource={source} value={theme} onValueChange={v => {
        setTheme(v);
        setIsOpen(false);
      }} renderItem={(item, isSelected) => <span style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        flex: 1
      }}>
              <span style={{
          flex: 1
        }}>{item.label}</span>
              {isSelected && <Icon icon="check" size="sm" />}
            </span>} />
      </>;
  }
}`,...J.parameters?.docs?.source},description:{story:`Selection persists across opens. isSelected passed to renderItem.`,...J.parameters?.docs?.description}}},Y.parameters={...Y.parameters,docs:{...Y.parameters?.docs,source:{originalSource:`{
  render: function Render() {
    const [isOpen, setIsOpen] = useState(false);
    const source = useMemo<SearchSource>(() => {
      let controller: AbortController | null = null;
      return {
        cancel() {
          controller?.abort();
        },
        async search(query: string) {
          controller?.abort();
          controller = new AbortController();
          await new Promise(r => setTimeout(r, 400));
          const all = [{
            id: 'readme',
            label: 'README.md'
          }, {
            id: 'package',
            label: 'package.json'
          }, {
            id: 'tsconfig',
            label: 'tsconfig.json'
          }, {
            id: 'index',
            label: 'src/index.ts'
          }, {
            id: 'app',
            label: 'src/App.tsx'
          }];
          return all.filter(f => f.label.toLowerCase().includes(query.toLowerCase()));
        },
        bootstrap() {
          return [];
        }
      };
    }, []);
    return <>
        <Button label="Open File Search" onClick={() => setIsOpen(true)} />
        <CommandPalette isOpen={isOpen} onOpenChange={setIsOpen} searchSource={source} input={<CommandPaletteInput placeholder="Search files..." />} emptyBootstrapText="Type a filename to search" emptySearchText="No files found" />
      </>;
  }
}`,...Y.parameters?.docs?.source},description:{story:`Server-side search. Spinner shown while pending. Empty state on no results.`,...Y.parameters?.docs?.description}}},X.parameters={...X.parameters,docs:{...X.parameters?.docs,source:{originalSource:`{
  render: function Render() {
    const [isOpen, setIsOpen] = useState(false);
    const commands: SearchableItem<{
      aliases?: string[];
    }>[] = [{
      id: 'home',
      label: 'Home'
    }, {
      id: 'dark-mode',
      label: 'Toggle Dark Mode',
      auxiliaryData: {
        aliases: ['theme', 'appearance']
      }
    }, {
      id: 'font-size',
      label: 'Change Font Size',
      auxiliaryData: {
        aliases: ['text', 'zoom']
      }
    }];
    const source = useMemo(() => createStaticSource(commands, {
      keywords: item => item.auxiliaryData?.aliases ?? []
    }), []);
    return <>
        <Button label="Open (try 'theme')" onClick={() => setIsOpen(true)} />
        <CommandPalette isOpen={isOpen} onOpenChange={setIsOpen} searchSource={source} />
      </>;
  }
}`,...X.parameters?.docs?.source},description:{story:`Type "theme" or "appearance" to find "Toggle Dark Mode".`,...X.parameters?.docs?.description}}},Z.parameters={...Z.parameters,docs:{...Z.parameters?.docs,source:{originalSource:`{
  render: function Render() {
    const [isOpen, setIsOpen] = useState(false);
    const groups = ['Files', 'Actions', 'Navigation', 'Settings', 'Recent'];
    const items = Array.from({
      length: 50
    }, (_, i) => ({
      id: \`item-\${i}\`,
      label: \`Item \${i + 1}\`,
      auxiliaryData: {
        group: groups[i % groups.length]
      }
    }));
    const source = useMemo(() => createStaticSource(items), []);
    return <>
        <Button label="Open (50 items)" onClick={() => setIsOpen(true)} />
        <CommandPalette isOpen={isOpen} onOpenChange={setIsOpen} searchSource={source} />
      </>;
  }
}`,...Z.parameters?.docs?.source},description:{story:`50 items across 5 groups. Verifies the list scrolls within the dialog
rather than expanding it past maxHeight.`,...Z.parameters?.docs?.description}}},Q.parameters={...Q.parameters,docs:{...Q.parameters?.docs,source:{originalSource:`{
  render: function Render() {
    const [isOpen, setIsOpen] = useState(false);
    const source = useMemo(() => createStaticSource([{
      id: 'home',
      label: 'Home'
    }, {
      id: 'settings',
      label: 'Settings'
    }]), []);
    return <>
        <Button label="Open" onClick={() => setIsOpen(true)} />
        <CommandPalette isOpen={isOpen} onOpenChange={setIsOpen} searchSource={source} footer={<CommandPaletteFooter>
              <span>Pro tip: use ⌘K to open anywhere</span>
            </CommandPaletteFooter>} />
      </>;
  }
}`,...Q.parameters?.docs?.source},description:{story:`Replacing the footer with custom content.`,...Q.parameters?.docs?.description}}},$.parameters={...$.parameters,docs:{...$.parameters?.docs,source:{originalSource:`{
  render: () => <Theme theme={groupHeadingTheme} mode="light">
      <CommandPaletteGroup heading="Suggestions">
        <div>Home</div>
        <div>Settings</div>
        <div>Profile</div>
      </CommandPaletteGroup>
    </Theme>
}`,...$.parameters?.docs?.source}}},Ie=[`Default`,`AutoGrouped`,`WithRenderItem`,`Picker`,`AsyncSearch`,`WithKeywords`,`ManyItems`,`CustomFooter`,`ThemedGroupHeading`]})))()}Le();export{Y as AsyncSearch,K as AutoGrouped,Q as CustomFooter,G as Default,Z as ManyItems,J as Picker,$ as ThemedGroupHeading,X as WithKeywords,q as WithRenderItem,Ie as __namedExportsOrder,Pe as default};