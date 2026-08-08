import{a as e,n as t}from"./rolldown-runtime-DkW27tQK.js";import{t as n}from"./react-BZJXY1be.js";import{n as r,t as i}from"./stylex-Dft6gtPK.js";import{n as a}from"./mergeProps-JRyAvMxc.js";import{n as o}from"./mergeRefs-CPqjs56a.js";import{t as s}from"./composeEventHandlers-DY4wem0S.js";import{n as c,t as l}from"./themeProps-CREkzZh6.js";import{t as u}from"./jsx-runtime-DeHZSEgm.js";import{n as d,t as f}from"./useTooltip-Cm0gpSWG.js";import{n as p,r as m}from"./SizeContext-Dp2usO2O.js";import{n as h,t as g}from"./Icon-C24cO4CC.js";import{n as _,t as v}from"./useListFocus-C3PMl9Zf.js";import{n as y,t as b}from"./useKeyboardHint-DTrDQ-vE.js";import{n as x,t as S}from"./ListBulletIcon-CBbSrtEW.js";import{n as C,t as w}from"./Squares2X2Icon-KnRrXJa4.js";function T(){let e=(0,E.use)(D);if(e==null)throw Error(`useSegmentedControlContext must be used within SegmentedControl. Wrap your SegmentedControlItem in <SegmentedControl>.`);return e}var E,D;function O(){return(O=t((()=>{E=n(),D=(0,E.createContext)(null),D.displayName=`SegmentedControlContext`})))()}function k({ref:e,value:t,onChange:n,label:i,size:l,layout:u=`hug`,isDisabled:f=!1,disabledMessage:p,children:h,xstyle:g,className:v,style:b,onKeyDown:x,onFocus:S,onBlur:C,...w}){let T=m(l,`md`),E=f&&!!p,O=d({placement:`above`,focusTrigger:`always`,isEnabled:E}),{listRef:k,handleKeyDown:P,handleFocus:F}=_({itemSelector:`[role="radio"]:not([aria-disabled="true"])`,hasRovingTabIndex:!0,wrap:!0,orientation:`horizontal`}),I=y({orientation:`horizontal`,isEnabled:!f}),L=(0,A.useCallback)(e=>{x?.(e),!e.defaultPrevented&&(I.onKeyDown(e),P(e))},[x,I,P]),R=(0,A.useCallback)(e=>{if(S?.(e),e.defaultPrevented||(I.onFocus(e),F(e),f)||!e.currentTarget.contains(e.relatedTarget))return;let r=e.target?.closest(`[role="radio"][data-value]`);if(!r||r.getAttribute(`aria-disabled`)===`true`)return;let i=r.dataset.value;i!=null&&i!==t&&n(i)},[S,I,F,f,n,t]),z=(0,A.useMemo)(()=>({value:t,onChange:n,size:T,layout:u,isDisabled:f,hasDisabledMessage:E}),[t,n,T,u,f,E]);return(0,j.jsxs)(D,{value:z,children:[(0,j.jsxs)(`div`,{ref:o(e,k,O.ref),...w,role:`radiogroup`,"aria-label":i,"aria-disabled":f||void 0,"aria-describedby":E?O.describedBy:void 0,onKeyDown:L,onFocus:R,onBlur:s(C,I.onBlur),...a(c(`segmented-control`,{size:T}),r(M.container,N[T],u===`fill`&&M.fill,f&&(E?M.disabledWithMessage:M.disabled),g),v,b),children:[h,I.hintElement]}),E&&O.renderTooltip(p)]})}var A,j,M,N;function P(){return(P=t((()=>{A=e(n(),1),i(),O(),v(),b(),f(),p(),l(),j=u(),M={container:{k1xSpc:`astryx3nfvp2`,kGNEyG:`astryx6s0dn4`,kOIVth:`astryx1lsbc85`,"--_segmented-control-padding":`astryx18jk3ff`,kmVPX3:`astryxpoxszi`,kWkggS:`astryx17x4s8c`,$$css:!0},fill:{k1xSpc:`astryx78zum5`,kzqmXN:`astryxh8yej3`,$$css:!0},disabled:{kSiTet:`astryxbyyjgo`,kfzvcC:`astryx47corl`,$$css:!0},disabledWithMessage:{kSiTet:`astryxbyyjgo`,$$css:!0}},N={sm:{"--_segmented-control-radius":`astryx9icjy1`,kaIpWk:`astryx1hapoqb`,krdFHd:null,kfmiAY:null,kVL7Gh:null,kT0f0o:null,kIxVMA:null,ksF3WI:null,kqGeR4:null,kYm2EN:null,$$css:!0},md:{"--_segmented-control-radius":`astryx9icjy1`,kaIpWk:`astryx1hapoqb`,krdFHd:null,kfmiAY:null,kVL7Gh:null,kT0f0o:null,kIxVMA:null,ksF3WI:null,kqGeR4:null,kYm2EN:null,$$css:!0},lg:{"--_segmented-control-radius":`astryx9icjy1`,kaIpWk:`astryx1hapoqb`,krdFHd:null,kfmiAY:null,kVL7Gh:null,kT0f0o:null,kIxVMA:null,ksF3WI:null,kqGeR4:null,kYm2EN:null,$$css:!0}},k.displayName=`SegmentedControl`,k.__docgenInfo={description:`Segmented button group for single selection (radio group semantics).
Visually resembles a tab bar but controls a value, not a view.

@example
\`\`\`
<SegmentedControl value={view} onChange={setView} label="View mode">
  <SegmentedControlItem value="grid" label="Grid" />
  <SegmentedControlItem value="list" label="List" />
  <SegmentedControlItem value="table" label="Table" />
</SegmentedControl>
\`\`\``,methods:[],displayName:`SegmentedControl`,props:{ref:{required:!1,tsType:{name:`ReactRef`,raw:`React.Ref<HTMLDivElement>`,elements:[{name:`HTMLDivElement`}]},description:``},value:{required:!0,tsType:{name:`string`},description:`The currently selected value (controlled).`},onChange:{required:!0,tsType:{name:`signature`,type:`function`,raw:`(value: string) => void`,signature:{arguments:[{type:{name:`string`},name:`value`}],return:{name:`void`}}},description:`Callback fired when a segment is selected.`},label:{required:!0,tsType:{name:`string`},description:`Accessible label for the radio group (used as aria-label, never rendered visually).`},size:{required:!1,tsType:{name:`union`,raw:`'sm' | 'md' | 'lg'`,elements:[{name:`literal`,value:`'sm'`},{name:`literal`,value:`'md'`},{name:`literal`,value:`'lg'`}]},description:`Size variant for the control.
@default 'md'`},layout:{required:!1,tsType:{name:`union`,raw:`'hug' | 'fill'`,elements:[{name:`literal`,value:`'hug'`},{name:`literal`,value:`'fill'`}]},description:"Layout mode for segment sizing.\n- `'hug'` (default): each segment hugs its content width.\n- `'fill'`: segments stretch equally to fill the container width.\n@default 'hug'",defaultValue:{value:`'hug'`,computed:!1}},isDisabled:{required:!1,tsType:{name:`boolean`},description:`Whether the entire control is disabled.
@default false`,defaultValue:{value:`false`,computed:!1}},disabledMessage:{required:!1,tsType:{name:`string`},description:"Explains why the control is disabled. Applies to the whole-group disabled\nstate (`isDisabled`), not individual segments. When set together with\n`isDisabled`, the control shows a tooltip with this text on hover and\nkeyboard focus, and stays focusable (via `aria-disabled`) so the reason is\ndiscoverable by keyboard and assistive technology. Selection stays blocked.\n\nUse this instead of wrapping a disabled control in `Tooltip` — disabled\ncontrols don't emit the pointer events an external tooltip needs."},children:{required:!0,tsType:{name:`ReactNode`},description:`SegmentedControlItem children.`}},composes:[`Omit`]}})))()}function F({ref:e,value:t,label:n,isLabelHidden:i=!1,icon:o,isDisabled:l=!1,onClick:u,xstyle:d,...f}){let p=T(),m=p.value===t,h=l||p.isDisabled,g=m&&(p.hasDisabledMessage??!1)&&!l,_=p.size,v=p.layout===`fill`,y=s(u,()=>{!h&&!m&&p.onChange(t)}),b=o?(0,I.jsx)(`span`,{...r(L.icon,z[_]),children:o}):null;return(0,I.jsxs)(`button`,{ref:e,...f,type:`button`,role:`radio`,"aria-checked":m,"aria-disabled":h||void 0,"aria-label":i?n:void 0,"data-value":t,tabIndex:m&&!h||g?0:-1,onClick:y,...a(c(`segmented-control-item`,{size:_,selected:m?`selected`:null,disabled:h?`disabled`:null}),r(L.base,R[_],v&&L.fill,m&&L.selected,!m&&!h&&L.hover,h&&L.disabled,d)),children:[b,!i&&(0,I.jsx)(`span`,{children:n})]})}var I,L,R,z;function B(){return(B=t((()=>{n(),i(),O(),l(),I=u(),L={base:{kVAEAm:`astryx1n2onr6`,k1xSpc:`astryx3nfvp2`,kGNEyG:`astryx6s0dn4`,kjj79g:`astryxl56j7k`,kOIVth:`astryxzye2dw`,kg3NbH:`astryxrrkdod`,kWkggS:`astryxjbqb8w`,kMzoRj:`astryxc342km`,ksu8eU:`astryxng3xce`,kMv6JI:`astryxjb2p0i`,kGuDYH:`astryxcr08ib`,kLWn49:`astryx1kq96og`,k63SB2:`astryx1e4wzip`,kMwMTN:`astryxv1l7n4`,kkrTdU:`astryx1ypdohk`,k1ekBW:`astryx1vix5yk`,kIyJzY:`astryxuedmi6`,kAMwcw:`astryxlr8y92`,kI3sdo:`astryx17nn4n9`,kInvED:`astryx1wfwxd8 astryx7s97pk`,$$css:!0},hover:{kWkggS:`astryxe9uy6x`,$$css:!0},selected:{kAXs8y:`astryx1kzknox`,kMwMTN:`astryx1tgivj0 astryx1k5gbb1`,k63SB2:`astryx2mo6ok`,kWkggS:`astryx10xzikg astryx1jzqe4`,kGVxlE:`astryx1i5ehqx`,$$css:!0},disabled:{kkrTdU:`astryxt0e3qv`,kMwMTN:`astryxnbbluu`,$$css:!0},fill:{kUk6DE:`astryx98rzlu`,kzQI83:null,kmuXW:null,kCS8Yb:null,kjj79g:`astryxl56j7k`,$$css:!0},icon:{k1xSpc:`astryx3nfvp2`,kGNEyG:`astryx6s0dn4`,kjj79g:`astryxl56j7k`,kmuXW:`astryx2lah0s`,$$css:!0}},R={sm:{kZKoxP:`astryxzj98nu`,kaIpWk:`astryxc910v0`,krdFHd:null,kfmiAY:null,kVL7Gh:null,kT0f0o:null,kIxVMA:null,ksF3WI:null,kqGeR4:null,kYm2EN:null,kg3NbH:`astryxf314gf`,kuDDbn:null,kE3dHu:null,kP0aTx:null,kpe85a:null,kGuDYH:`astryx141an7d`,$$css:!0},md:{kZKoxP:`astryx184gfjb`,kaIpWk:`astryxc910v0`,krdFHd:null,kfmiAY:null,kVL7Gh:null,kT0f0o:null,kIxVMA:null,ksF3WI:null,kqGeR4:null,kYm2EN:null,kg3NbH:`astryxrrkdod`,kuDDbn:null,kE3dHu:null,kP0aTx:null,kpe85a:null,$$css:!0},lg:{kZKoxP:`astryx1uiybsj`,kaIpWk:`astryxc910v0`,krdFHd:null,kfmiAY:null,kVL7Gh:null,kT0f0o:null,kIxVMA:null,ksF3WI:null,kqGeR4:null,kYm2EN:null,kg3NbH:`astryxrrkdod`,kuDDbn:null,kE3dHu:null,kP0aTx:null,kpe85a:null,$$css:!0}},z={sm:{kzqmXN:`astryx6jxa94`,kZKoxP:`astryx1v9usgg`,$$css:!0},md:{kzqmXN:`astryx1kky2od`,kZKoxP:`astryxlup9mm`,$$css:!0},lg:{kzqmXN:`astryx1xp8n7a`,kZKoxP:`astryxmix8c7`,$$css:!0}},F.displayName=`SegmentedControlItem`,F.__docgenInfo={description:`Individual segment item within an SegmentedControl.
Renders as a radio button with visual segment styling.

@example
\`\`\`
<SegmentedControlItem value="grid" label="Grid" icon={<GridIcon />} />
\`\`\``,methods:[],displayName:`SegmentedControlItem`,props:{xstyle:{required:!1,tsType:{name:`StyleXStyles`},description:"StyleX styles created via `stylex.create()`. Merged with the component's\nbase styles inside a single `stylex.props()` call for optimal deduplication.\n\n@example\n```\nconst overrides = stylex.create({ root: { marginBottom: 8 } });\n<Component xstyle={overrides.root} />\n```"},ref:{required:!1,tsType:{name:`ReactRef`,raw:`React.Ref<HTMLButtonElement>`,elements:[{name:`HTMLButtonElement`}]},description:``},value:{required:!0,tsType:{name:`string`},description:`Unique value for this segment. Matched against the parent's value.`},label:{required:!0,tsType:{name:`string`},description:`Accessible label for this segment (required for accessibility).
Used as visible text, or as aria-label when isLabelHidden is true.`},isLabelHidden:{required:!1,tsType:{name:`boolean`},description:`Whether the label is visually hidden. When true, only the icon is
displayed and the label is used as aria-label for accessibility.
@default false`,defaultValue:{value:`false`,computed:!1}},icon:{required:!1,tsType:{name:`ReactNode`},description:`Icon element displayed before the label.`},isDisabled:{required:!1,tsType:{name:`boolean`},description:`Whether this individual item is disabled.
@default false`,defaultValue:{value:`false`,computed:!1}}},composes:[`Omit`]}})))()}function ee({title:e,titleId:t,...n},r){return V.createElement(`svg`,Object.assign({xmlns:`http://www.w3.org/2000/svg`,fill:`none`,viewBox:`0 0 24 24`,strokeWidth:1.5,stroke:`currentColor`,"aria-hidden":`true`,"data-slot":`icon`,ref:r,"aria-labelledby":t},n),e?V.createElement(`title`,{id:t},e):null,V.createElement(`path`,{strokeLinecap:`round`,strokeLinejoin:`round`,d:`M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 0 1-1.125-1.125M3.375 19.5h7.5c.621 0 1.125-.504 1.125-1.125m-9.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-7.5A1.125 1.125 0 0 1 12 18.375m9.75-12.75c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125m19.5 0v1.5c0 .621-.504 1.125-1.125 1.125M2.25 5.625v1.5c0 .621.504 1.125 1.125 1.125m0 0h17.25m-17.25 0h7.5c.621 0 1.125.504 1.125 1.125M3.375 8.25c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m17.25-3.75h-7.5c-.621 0-1.125.504-1.125 1.125m8.625-1.125c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125M12 10.875v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 10.875c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125M13.125 12h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125M20.625 12c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5M12 14.625v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 14.625c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125m0 1.5v-1.5m0 0c0-.621.504-1.125 1.125-1.125m0 0h7.5`}))}var V,H;function U(){return(U=t((()=>{V=e(n()),H=V.forwardRef(ee)})))()}var W,G,K,q,J,Y,X,Z,Q,$,te;function ne(){return(ne=t((()=>{W=n(),P(),B(),h(),C(),x(),U(),G=u(),K={title:`Core/SegmentedControl`,component:k,tags:[`autodocs`],argTypes:{size:{control:`select`,options:[`sm`,`md`,`lg`],description:`Size variant for the control`},isDisabled:{control:`boolean`,description:`Whether the entire control is disabled`},disabledMessage:{control:`text`,description:`Explains why the control is disabled (whole-group state, not per segment). With isDisabled, shows a tooltip on hover/keyboard focus and keeps the control focusable via aria-disabled (selection stays blocked). Use this instead of wrapping a disabled SegmentedControl in Tooltip.`}}},q={args:{size:`md`,isDisabled:!1},render:e=>{let[t,n]=(0,W.useState)(`grid`);return(0,G.jsxs)(k,{value:t,onChange:n,label:`View mode`,size:e.size,isDisabled:e.isDisabled,children:[(0,G.jsx)(F,{value:`grid`,label:`Grid`}),(0,G.jsx)(F,{value:`list`,label:`List`}),(0,G.jsx)(F,{value:`table`,label:`Table`})]})}},J={args:{size:`md`},render:e=>{let[t,n]=(0,W.useState)(`grid`);return(0,G.jsxs)(k,{value:t,onChange:n,label:`View mode`,size:e.size,children:[(0,G.jsx)(F,{value:`grid`,label:`Grid`,icon:(0,G.jsx)(g,{icon:w,color:`inherit`})}),(0,G.jsx)(F,{value:`list`,label:`List`,icon:(0,G.jsx)(g,{icon:S,color:`inherit`})}),(0,G.jsx)(F,{value:`table`,label:`Table`,icon:(0,G.jsx)(g,{icon:H,color:`inherit`})})]})}},Y={args:{size:`sm`},render:e=>{let[t,n]=(0,W.useState)(`grid`);return(0,G.jsxs)(k,{value:t,onChange:n,label:`View mode`,size:e.size,children:[(0,G.jsx)(F,{value:`grid`,label:`Grid`,isLabelHidden:!0,icon:(0,G.jsx)(g,{icon:w,color:`inherit`})}),(0,G.jsx)(F,{value:`list`,label:`List`,isLabelHidden:!0,icon:(0,G.jsx)(g,{icon:S,color:`inherit`})})]})}},X={render:()=>{let[e,t]=(0,W.useState)(`day`);return(0,G.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`24px`},children:[(0,G.jsxs)(`div`,{children:[(0,G.jsx)(`div`,{style:{marginBottom:`8px`,fontSize:`12px`,color:`#666`},children:`Small`}),(0,G.jsxs)(k,{value:e,onChange:t,label:`Time period`,size:`sm`,children:[(0,G.jsx)(F,{value:`day`,label:`Day`}),(0,G.jsx)(F,{value:`week`,label:`Week`}),(0,G.jsx)(F,{value:`month`,label:`Month`})]})]}),(0,G.jsxs)(`div`,{children:[(0,G.jsx)(`div`,{style:{marginBottom:`8px`,fontSize:`12px`,color:`#666`},children:`Medium (default)`}),(0,G.jsxs)(k,{value:e,onChange:t,label:`Time period`,size:`md`,children:[(0,G.jsx)(F,{value:`day`,label:`Day`}),(0,G.jsx)(F,{value:`week`,label:`Week`}),(0,G.jsx)(F,{value:`month`,label:`Month`})]})]}),(0,G.jsxs)(`div`,{children:[(0,G.jsx)(`div`,{style:{marginBottom:`8px`,fontSize:`12px`,color:`#666`},children:`Large`}),(0,G.jsxs)(k,{value:e,onChange:t,label:`Time period`,size:`lg`,children:[(0,G.jsx)(F,{value:`day`,label:`Day`}),(0,G.jsx)(F,{value:`week`,label:`Week`}),(0,G.jsx)(F,{value:`month`,label:`Month`})]})]})]})}},Z={render:()=>{let[e,t]=(0,W.useState)(`all`);return(0,G.jsxs)(k,{value:e,onChange:t,label:`Filter`,isDisabled:!0,children:[(0,G.jsx)(F,{value:`all`,label:`All`}),(0,G.jsx)(F,{value:`active`,label:`Active`}),(0,G.jsx)(F,{value:`completed`,label:`Completed`})]})}},Q={render:()=>{let[e,t]=(0,W.useState)(`hourly`);return(0,G.jsxs)(k,{value:e,onChange:t,label:`Data granularity`,children:[(0,G.jsx)(F,{value:`hourly`,label:`Hourly`}),(0,G.jsx)(F,{value:`daily`,label:`Daily`}),(0,G.jsx)(F,{value:`weekly`,label:`Weekly`,isDisabled:!0})]})}},$={render:()=>{let[e,t]=(0,W.useState)(`all`);return(0,G.jsxs)(k,{value:e,onChange:t,label:`Filter`,isDisabled:!0,disabledMessage:`Choose a project to filter tasks`,children:[(0,G.jsx)(F,{value:`all`,label:`All`}),(0,G.jsx)(F,{value:`active`,label:`Active`}),(0,G.jsx)(F,{value:`completed`,label:`Completed`})]})}},q.parameters={...q.parameters,docs:{...q.parameters?.docs,source:{originalSource:`{
  args: {
    size: 'md',
    isDisabled: false
  },
  render: args => {
    const [value, setValue] = useState('grid');
    return <SegmentedControl value={value} onChange={setValue} label="View mode" size={args.size} isDisabled={args.isDisabled}>
        <SegmentedControlItem value="grid" label="Grid" />
        <SegmentedControlItem value="list" label="List" />
        <SegmentedControlItem value="table" label="Table" />
      </SegmentedControl>;
  }
}`,...q.parameters?.docs?.source}}},J.parameters={...J.parameters,docs:{...J.parameters?.docs,source:{originalSource:`{
  args: {
    size: 'md'
  },
  render: args => {
    const [value, setValue] = useState('grid');
    return <SegmentedControl value={value} onChange={setValue} label="View mode" size={args.size}>
        <SegmentedControlItem value="grid" label="Grid" icon={<Icon icon={Squares2X2Icon} color="inherit" />} />
        <SegmentedControlItem value="list" label="List" icon={<Icon icon={ListBulletIcon} color="inherit" />} />
        <SegmentedControlItem value="table" label="Table" icon={<Icon icon={TableCellsIcon} color="inherit" />} />
      </SegmentedControl>;
  }
}`,...J.parameters?.docs?.source}}},Y.parameters={...Y.parameters,docs:{...Y.parameters?.docs,source:{originalSource:`{
  args: {
    size: 'sm'
  },
  render: args => {
    const [value, setValue] = useState('grid');
    return <SegmentedControl value={value} onChange={setValue} label="View mode" size={args.size}>
        <SegmentedControlItem value="grid" label="Grid" isLabelHidden icon={<Icon icon={Squares2X2Icon} color="inherit" />} />
        <SegmentedControlItem value="list" label="List" isLabelHidden icon={<Icon icon={ListBulletIcon} color="inherit" />} />
      </SegmentedControl>;
  }
}`,...Y.parameters?.docs?.source}}},X.parameters={...X.parameters,docs:{...X.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = useState('day');
    return <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '24px'
    }}>
        <div>
          <div style={{
          marginBottom: '8px',
          fontSize: '12px',
          color: '#666'
        }}>
            Small
          </div>
          <SegmentedControl value={value} onChange={setValue} label="Time period" size="sm">
            <SegmentedControlItem value="day" label="Day" />
            <SegmentedControlItem value="week" label="Week" />
            <SegmentedControlItem value="month" label="Month" />
          </SegmentedControl>
        </div>
        <div>
          <div style={{
          marginBottom: '8px',
          fontSize: '12px',
          color: '#666'
        }}>
            Medium (default)
          </div>
          <SegmentedControl value={value} onChange={setValue} label="Time period" size="md">
            <SegmentedControlItem value="day" label="Day" />
            <SegmentedControlItem value="week" label="Week" />
            <SegmentedControlItem value="month" label="Month" />
          </SegmentedControl>
        </div>
        <div>
          <div style={{
          marginBottom: '8px',
          fontSize: '12px',
          color: '#666'
        }}>
            Large
          </div>
          <SegmentedControl value={value} onChange={setValue} label="Time period" size="lg">
            <SegmentedControlItem value="day" label="Day" />
            <SegmentedControlItem value="week" label="Week" />
            <SegmentedControlItem value="month" label="Month" />
          </SegmentedControl>
        </div>
      </div>;
  }
}`,...X.parameters?.docs?.source}}},Z.parameters={...Z.parameters,docs:{...Z.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = useState('all');
    return <SegmentedControl value={value} onChange={setValue} label="Filter" isDisabled>
        <SegmentedControlItem value="all" label="All" />
        <SegmentedControlItem value="active" label="Active" />
        <SegmentedControlItem value="completed" label="Completed" />
      </SegmentedControl>;
  }
}`,...Z.parameters?.docs?.source}}},Q.parameters={...Q.parameters,docs:{...Q.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = useState('hourly');
    return <SegmentedControl value={value} onChange={setValue} label="Data granularity">
        <SegmentedControlItem value="hourly" label="Hourly" />
        <SegmentedControlItem value="daily" label="Daily" />
        <SegmentedControlItem value="weekly" label="Weekly" isDisabled />
      </SegmentedControl>;
  }
}`,...Q.parameters?.docs?.source}}},$.parameters={...$.parameters,docs:{...$.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = useState('all');
    return <SegmentedControl value={value} onChange={setValue} label="Filter" isDisabled disabledMessage="Choose a project to filter tasks">
        <SegmentedControlItem value="all" label="All" />
        <SegmentedControlItem value="active" label="Active" />
        <SegmentedControlItem value="completed" label="Completed" />
      </SegmentedControl>;
  }
}`,...$.parameters?.docs?.source}}},te=[`Default`,`WithIcons`,`IconOnly`,`SizeVariants`,`Disabled`,`DisabledItem`,`DisabledWithMessage`]})))()}ne();export{q as Default,Z as Disabled,Q as DisabledItem,$ as DisabledWithMessage,Y as IconOnly,X as SizeVariants,J as WithIcons,te as __namedExportsOrder,K as default};