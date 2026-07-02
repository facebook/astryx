import{ah as n,aM as F,aI as Y,a1 as e,a6 as L,af as M,ay as E,a7 as B,I as f}from"./iframe-VDTgZ3S9.js";import{F as G}from"./Squares2X2Icon-HPMjiDMj.js";import{F as A}from"./ListBulletIcon-DCyTCeV5.js";import"./preload-helper-Ct5FWWRu.js";const $=n.createContext(null);$.displayName="SegmentedControlContext";function P(){const t=n.use($);if(t==null)throw new Error("useSegmentedControlContext must be used within SegmentedControl. Wrap your SegmentedControlItem in <SegmentedControl>.");return t}const D={container:{k1xSpc:"astryx3nfvp2",kGNEyG:"astryx6s0dn4",kOIVth:"astryx1lsbc85","--_segmented-control-padding":"astryx18jk3ff",kmVPX3:"astryxpoxszi",kWkggS:"astryx17x4s8c",$$css:!0},fill:{k1xSpc:"astryx78zum5",kzqmXN:"astryxh8yej3",$$css:!0},disabled:{kSiTet:"astryxbyyjgo",kfzvcC:"astryx47corl",$$css:!0}},X={sm:{"--_segmented-control-radius":"astryx9icjy1",kaIpWk:"astryx1hapoqb",krdFHd:null,kfmiAY:null,kVL7Gh:null,kT0f0o:null,kIxVMA:null,ksF3WI:null,kqGeR4:null,kYm2EN:null,$$css:!0},md:{"--_segmented-control-radius":"astryx9icjy1",kaIpWk:"astryx1hapoqb",krdFHd:null,kfmiAY:null,kVL7Gh:null,kT0f0o:null,kIxVMA:null,ksF3WI:null,kqGeR4:null,kYm2EN:null,$$css:!0},lg:{"--_segmented-control-radius":"astryx9icjy1",kaIpWk:"astryx1hapoqb",krdFHd:null,kfmiAY:null,kVL7Gh:null,kT0f0o:null,kIxVMA:null,ksF3WI:null,kqGeR4:null,kYm2EN:null,$$css:!0}};function o({ref:t,value:a,onChange:s,label:c,size:S,layout:k="hug",isDisabled:r=!1,children:i,xstyle:d,className:b,style:T}){const m=F(S,"md"),v=n.useRef(null),H=n.useCallback(p=>{if(r)return;const g=v.current;if(!g)return;const u=Array.from(g.querySelectorAll('[role="radio"]:not([aria-disabled="true"])'));if(u.length===0)return;const x=u.findIndex(R=>R===document.activeElement);let h;switch(p.key){case"ArrowRight":h=x===-1?0:(x+1)%u.length;break;case"ArrowLeft":h=x===-1?u.length-1:(x-1+u.length)%u.length;break;case"Home":h=0;break;case"End":h=u.length-1;break;default:return}p.preventDefault();const q=u[h];q.focus();const W=q.dataset.value;W!=null&&s(W)},[r,s]),N=n.useMemo(()=>({value:a,onChange:s,size:m,layout:k,isDisabled:r}),[a,s,m,k,r]);return Y(()=>{const p=v.current;if(!p)return;const g=Array.from(p.querySelectorAll('[role="radio"]:not([aria-disabled="true"])'));if(g.length===0)return;g.some(x=>x.tabIndex===0)||(g[0].tabIndex=0)}),e.jsx($,{value:N,children:e.jsx("div",{ref:B(t,v),role:"radiogroup","aria-label":c,"aria-disabled":r||void 0,onKeyDown:H,...L(E("segmented-control",{size:m}),M(D.container,X[m],k==="fill"&&D.fill,r&&D.disabled,d),b,T),children:i})})}o.displayName="SegmentedControl";o.__docgenInfo={description:`Segmented button group for single selection (radio group semantics).
Visually resembles a tab bar but controls a value, not a view.

@example
\`\`\`
<SegmentedControl value={view} onChange={setView} label="View mode">
  <SegmentedControlItem value="grid" label="Grid" />
  <SegmentedControlItem value="list" label="List" />
  <SegmentedControlItem value="table" label="Table" />
</SegmentedControl>
\`\`\``,methods:[],displayName:"SegmentedControl",props:{ref:{required:!1,tsType:{name:"ReactRef",raw:"React.Ref<HTMLDivElement>",elements:[{name:"HTMLDivElement"}]},description:""},value:{required:!0,tsType:{name:"string"},description:"The currently selected value (controlled)."},onChange:{required:!0,tsType:{name:"signature",type:"function",raw:"(value: string) => void",signature:{arguments:[{type:{name:"string"},name:"value"}],return:{name:"void"}}},description:"Callback fired when a segment is selected."},label:{required:!0,tsType:{name:"string"},description:"Accessible label for the radio group (used as aria-label, never rendered visually)."},size:{required:!1,tsType:{name:"union",raw:"'sm' | 'md' | 'lg'",elements:[{name:"literal",value:"'sm'"},{name:"literal",value:"'md'"},{name:"literal",value:"'lg'"}]},description:`Size variant for the control.
@default 'md'`},layout:{required:!1,tsType:{name:"union",raw:"'hug' | 'fill'",elements:[{name:"literal",value:"'hug'"},{name:"literal",value:"'fill'"}]},description:"Layout mode for segment sizing.\n- `'hug'` (default): each segment hugs its content width.\n- `'fill'`: segments stretch equally to fill the container width.\n@default 'hug'",defaultValue:{value:"'hug'",computed:!1}},isDisabled:{required:!1,tsType:{name:"boolean"},description:`Whether the entire control is disabled.
@default false`,defaultValue:{value:"false",computed:!1}},children:{required:!0,tsType:{name:"ReactNode"},description:"SegmentedControlItem children."}},composes:["Omit"]};const y={base:{kVAEAm:"astryx1n2onr6",k1xSpc:"astryx3nfvp2",kGNEyG:"astryx6s0dn4",kjj79g:"astryxl56j7k",kOIVth:"astryxzye2dw",kg3NbH:"astryxrrkdod",kWkggS:"astryxjbqb8w",kMzoRj:"astryxc342km",ksu8eU:"astryxng3xce",kMv6JI:"astryxjb2p0i",kGuDYH:"astryxcr08ib",kLWn49:"astryx1kq96og",k63SB2:"astryx1e4wzip",kMwMTN:"astryxv1l7n4",kkrTdU:"astryx1ypdohk",k1ekBW:"astryx1vix5yk",kIyJzY:"astryxuedmi6",kAMwcw:"astryxlr8y92",kI3sdo:"astryx17nn4n9",kInvED:"astryx1wfwxd8 astryx7s97pk",$$css:!0},hover:{kWkggS:"astryxe9uy6x",$$css:!0},selected:{kMwMTN:"astryx1tgivj0",k63SB2:"astryx2mo6ok",kWkggS:"astryx10xzikg",kGVxlE:"astryx1i5ehqx",$$css:!0},disabled:{kkrTdU:"astryxt0e3qv",kMwMTN:"astryxnbbluu",$$css:!0},fill:{kUk6DE:"astryx98rzlu",kzQI83:null,kmuXW:null,kCS8Yb:null,kjj79g:"astryxl56j7k",$$css:!0},icon:{k1xSpc:"astryx3nfvp2",kGNEyG:"astryx6s0dn4",kjj79g:"astryxl56j7k",kmuXW:"astryx2lah0s",$$css:!0}},_={sm:{kZKoxP:"astryxzj98nu",kaIpWk:"astryxc910v0",krdFHd:null,kfmiAY:null,kVL7Gh:null,kT0f0o:null,kIxVMA:null,ksF3WI:null,kqGeR4:null,kYm2EN:null,kg3NbH:"astryxf314gf",kuDDbn:null,kE3dHu:null,kP0aTx:null,kpe85a:null,kGuDYH:"astryx141an7d",$$css:!0},md:{kZKoxP:"astryx184gfjb",kaIpWk:"astryxc910v0",krdFHd:null,kfmiAY:null,kVL7Gh:null,kT0f0o:null,kIxVMA:null,ksF3WI:null,kqGeR4:null,kYm2EN:null,kg3NbH:"astryxrrkdod",kuDDbn:null,kE3dHu:null,kP0aTx:null,kpe85a:null,$$css:!0},lg:{kZKoxP:"astryx1uiybsj",kaIpWk:"astryxc910v0",krdFHd:null,kfmiAY:null,kVL7Gh:null,kT0f0o:null,kIxVMA:null,ksF3WI:null,kqGeR4:null,kYm2EN:null,kg3NbH:"astryxrrkdod",kuDDbn:null,kE3dHu:null,kP0aTx:null,kpe85a:null,$$css:!0}},K={sm:{kzqmXN:"astryx6jxa94",kZKoxP:"astryx1v9usgg",$$css:!0},md:{kzqmXN:"astryx1kky2od",kZKoxP:"astryxlup9mm",$$css:!0},lg:{kzqmXN:"astryx1xp8n7a",kZKoxP:"astryxmix8c7",$$css:!0}};function l({ref:t,value:a,label:s,isLabelHidden:c=!1,icon:S,isDisabled:k=!1}){const r=P(),i=r.value===a,d=k||r.isDisabled,b=r.size,T=r.layout==="fill",m=n.useCallback(()=>{!d&&!i&&r.onChange(a)},[r,a,d,i]),v=S?e.jsx("span",{...M(y.icon,K[b]),children:S}):null;return e.jsxs("button",{ref:t,type:"button",role:"radio","aria-checked":i,"aria-disabled":d||void 0,"aria-label":c?s:void 0,"data-value":a,tabIndex:i&&!d?0:-1,onClick:m,...L(E("segmented-control-item",{size:b,selected:i?"selected":null,disabled:d?"disabled":null}),M(y.base,_[b],T&&y.fill,i&&y.selected,!i&&!d&&y.hover,d&&y.disabled)),children:[v,!c&&e.jsx("span",{children:s})]})}l.displayName="SegmentedControlItem";l.__docgenInfo={description:'Individual segment item within an SegmentedControl.\nRenders as a radio button with visual segment styling.\n\n@example\n```\n<SegmentedControlItem value="grid" label="Grid" icon={<GridIcon />} />\n```',methods:[],displayName:"SegmentedControlItem",props:{xstyle:{required:!1,tsType:{name:"StyleXStyles"},description:"StyleX styles created via `stylex.create()`. Merged with the component's\nbase styles inside a single `stylex.props()` call for optimal deduplication.\n\n@example\n```\nconst overrides = stylex.create({ root: { marginBottom: 8 } });\n<Component xstyle={overrides.root} />\n```"},ref:{required:!1,tsType:{name:"ReactRef",raw:"React.Ref<HTMLButtonElement>",elements:[{name:"HTMLButtonElement"}]},description:""},value:{required:!0,tsType:{name:"string"},description:"Unique value for this segment. Matched against the parent's value."},label:{required:!0,tsType:{name:"string"},description:`Accessible label for this segment (required for accessibility).
Used as visible text, or as aria-label when isLabelHidden is true.`},isLabelHidden:{required:!1,tsType:{name:"boolean"},description:`Whether the label is visually hidden. When true, only the icon is
displayed and the label is used as aria-label for accessibility.
@default false`,defaultValue:{value:"false",computed:!1}},icon:{required:!1,tsType:{name:"ReactNode"},description:"Icon element displayed before the label."},isDisabled:{required:!1,tsType:{name:"boolean"},description:`Whether this individual item is disabled.
@default false`,defaultValue:{value:"false",computed:!1}}},composes:["Omit"]};function O({title:t,titleId:a,...s},c){return n.createElement("svg",Object.assign({xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24",strokeWidth:1.5,stroke:"currentColor","aria-hidden":"true","data-slot":"icon",ref:c,"aria-labelledby":a},s),t?n.createElement("title",{id:a},t):null,n.createElement("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 0 1-1.125-1.125M3.375 19.5h7.5c.621 0 1.125-.504 1.125-1.125m-9.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-7.5A1.125 1.125 0 0 1 12 18.375m9.75-12.75c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125m19.5 0v1.5c0 .621-.504 1.125-1.125 1.125M2.25 5.625v1.5c0 .621.504 1.125 1.125 1.125m0 0h17.25m-17.25 0h7.5c.621 0 1.125.504 1.125 1.125M3.375 8.25c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m17.25-3.75h-7.5c-.621 0-1.125.504-1.125 1.125m8.625-1.125c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125M12 10.875v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 10.875c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125M13.125 12h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125M20.625 12c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5M12 14.625v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 14.625c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125m0 1.5v-1.5m0 0c0-.621.504-1.125 1.125-1.125m0 0h7.5"}))}const U=n.forwardRef(O),le={title:"Core/SegmentedControl",component:o,tags:["autodocs"],argTypes:{size:{control:"select",options:["sm","md","lg"],description:"Size variant for the control"},isDisabled:{control:"boolean",description:"Whether the entire control is disabled"}}},C={args:{size:"md",isDisabled:!1},render:t=>{const[a,s]=n.useState("grid");return e.jsxs(o,{value:a,onChange:s,label:"View mode",size:t.size,isDisabled:t.isDisabled,children:[e.jsx(l,{value:"grid",label:"Grid"}),e.jsx(l,{value:"list",label:"List"}),e.jsx(l,{value:"table",label:"Table"})]})}},I={args:{size:"md"},render:t=>{const[a,s]=n.useState("grid");return e.jsxs(o,{value:a,onChange:s,label:"View mode",size:t.size,children:[e.jsx(l,{value:"grid",label:"Grid",icon:e.jsx(f,{icon:G,color:"inherit"})}),e.jsx(l,{value:"list",label:"List",icon:e.jsx(f,{icon:A,color:"inherit"})}),e.jsx(l,{value:"table",label:"Table",icon:e.jsx(f,{icon:U,color:"inherit"})})]})}},j={args:{size:"sm"},render:t=>{const[a,s]=n.useState("grid");return e.jsxs(o,{value:a,onChange:s,label:"View mode",size:t.size,children:[e.jsx(l,{value:"grid",label:"Grid",isLabelHidden:!0,icon:e.jsx(f,{icon:G,color:"inherit"})}),e.jsx(l,{value:"list",label:"List",isLabelHidden:!0,icon:e.jsx(f,{icon:A,color:"inherit"})})]})}},z={render:()=>{const[t,a]=n.useState("day");return e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"24px"},children:[e.jsxs("div",{children:[e.jsx("div",{style:{marginBottom:"8px",fontSize:"12px",color:"#666"},children:"Small"}),e.jsxs(o,{value:t,onChange:a,label:"Time period",size:"sm",children:[e.jsx(l,{value:"day",label:"Day"}),e.jsx(l,{value:"week",label:"Week"}),e.jsx(l,{value:"month",label:"Month"})]})]}),e.jsxs("div",{children:[e.jsx("div",{style:{marginBottom:"8px",fontSize:"12px",color:"#666"},children:"Medium (default)"}),e.jsxs(o,{value:t,onChange:a,label:"Time period",size:"md",children:[e.jsx(l,{value:"day",label:"Day"}),e.jsx(l,{value:"week",label:"Week"}),e.jsx(l,{value:"month",label:"Month"})]})]}),e.jsxs("div",{children:[e.jsx("div",{style:{marginBottom:"8px",fontSize:"12px",color:"#666"},children:"Large"}),e.jsxs(o,{value:t,onChange:a,label:"Time period",size:"lg",children:[e.jsx(l,{value:"day",label:"Day"}),e.jsx(l,{value:"week",label:"Week"}),e.jsx(l,{value:"month",label:"Month"})]})]})]})}},w={render:()=>{const[t,a]=n.useState("all");return e.jsxs(o,{value:t,onChange:a,label:"Filter",isDisabled:!0,children:[e.jsx(l,{value:"all",label:"All"}),e.jsx(l,{value:"active",label:"Active"}),e.jsx(l,{value:"completed",label:"Completed"})]})}},V={render:()=>{const[t,a]=n.useState("hourly");return e.jsxs(o,{value:t,onChange:a,label:"Data granularity",children:[e.jsx(l,{value:"hourly",label:"Hourly"}),e.jsx(l,{value:"daily",label:"Daily"}),e.jsx(l,{value:"weekly",label:"Weekly",isDisabled:!0})]})}};C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
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
}`,...C.parameters?.docs?.source}}};I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{
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
}`,...I.parameters?.docs?.source}}};j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
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
}`,...j.parameters?.docs?.source}}};z.parameters={...z.parameters,docs:{...z.parameters?.docs,source:{originalSource:`{
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
}`,...z.parameters?.docs?.source}}};w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = useState('all');
    return <SegmentedControl value={value} onChange={setValue} label="Filter" isDisabled>
        <SegmentedControlItem value="all" label="All" />
        <SegmentedControlItem value="active" label="Active" />
        <SegmentedControlItem value="completed" label="Completed" />
      </SegmentedControl>;
  }
}`,...w.parameters?.docs?.source}}};V.parameters={...V.parameters,docs:{...V.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = useState('hourly');
    return <SegmentedControl value={value} onChange={setValue} label="Data granularity">
        <SegmentedControlItem value="hourly" label="Hourly" />
        <SegmentedControlItem value="daily" label="Daily" />
        <SegmentedControlItem value="weekly" label="Weekly" isDisabled />
      </SegmentedControl>;
  }
}`,...V.parameters?.docs?.source}}};const te=["Default","WithIcons","IconOnly","SizeVariants","Disabled","DisabledItem"];export{C as Default,w as Disabled,V as DisabledItem,j as IconOnly,z as SizeVariants,I as WithIcons,te as __namedExportsOrder,le as default};
