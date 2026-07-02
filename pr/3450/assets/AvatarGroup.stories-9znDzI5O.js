import{ah as D,a1 as r,a6 as C,af as N,ay as T}from"./iframe-Cw8JXX6x.js";import{a as M,r as _,u as I,A as t}from"./Avatar-Clar-4Nk.js";import{S as $}from"./StatusDot-BvTpeUek.js";import"./preload-helper-Ct5FWWRu.js";const q=.25,W={root:{k1xSpc:"astryx3nfvp2",kGNEyG:"astryx6s0dn4",$$css:!0}};function s({children:e,size:a="small","data-testid":i,"aria-label":E="Avatars",xstyle:G,className:b,style:j,ref:z,...O}){const c=_(a),m=Math.round(c*q),R=D.useMemo(()=>({size:a,overlap:m,numericSize:c}),[a,m,c]);return r.jsx(M,{value:R,children:r.jsx("div",{ref:z,role:"group","aria-label":E,"data-testid":i,...C(T("avatar-group",{size:a}),N(W.root,G),b,j),...O,children:e})})}s.displayName="AvatarGroup";s.__docgenInfo={description:`Stacked avatar display showing multiple avatars overlapping with an
optional overflow indicator. Uses a compositional children-based API
so each avatar can carry its own props (status dots, click handlers, etc.).

Consumers handle slicing — pass only the avatars you want visible,
then add an AvatarGroupOverflow for the "+N" indicator.

@example
\`\`\`
<AvatarGroup size="medium">
  {users.slice(0, 3).map(u => (
    <Avatar key={u.id} src={u.src} name={u.name} />
  ))}
  <AvatarGroupOverflow count={users.length - 3} />
</AvatarGroup>
\`\`\``,methods:[],displayName:"AvatarGroup",props:{xstyle:{required:!1,tsType:{name:"StyleXStyles"},description:"StyleX styles created via `stylex.create()`. Merged with the component's\nbase styles inside a single `stylex.props()` call for optimal deduplication.\n\n@example\n```\nconst overrides = stylex.create({ root: { marginBottom: 8 } });\n<Component xstyle={overrides.root} />\n```"},ref:{required:!1,tsType:{name:"ReactRef",raw:"React.Ref<HTMLDivElement>",elements:[{name:"HTMLDivElement"}]},description:"Ref forwarded to the root element."},children:{required:!0,tsType:{name:"ReactNode"},description:`Avatar children, optionally followed by one AvatarGroupOverflow.
Consumers are responsible for slicing to the desired visible count.`},size:{required:!1,tsType:{name:"union",raw:"AvatarNamedSize | AvatarNumericSize",elements:[{name:"union",raw:"'tiny' | 'xsmall' | 'small' | 'medium' | 'large'",elements:[{name:"literal",value:"'tiny'"},{name:"literal",value:"'xsmall'"},{name:"literal",value:"'small'"},{name:"literal",value:"'medium'"},{name:"literal",value:"'large'"}]},{name:"union",raw:`| 16
| 20
| 24
| 32
| 36
| 40
| 48
| 60
| 64
| 72
| 96
| 128
| 144
| 180`,elements:[{name:"literal",value:"16"},{name:"literal",value:"20"},{name:"literal",value:"24"},{name:"literal",value:"32"},{name:"literal",value:"36"},{name:"literal",value:"40"},{name:"literal",value:"48"},{name:"literal",value:"60"},{name:"literal",value:"64"},{name:"literal",value:"72"},{name:"literal",value:"96"},{name:"literal",value:"128"},{name:"literal",value:"144"},{name:"literal",value:"180"}]}]},description:`Size applied to all avatars via context.
@default 'small'`,defaultValue:{value:"'small'",computed:!1}},"data-testid":{required:!1,tsType:{name:"string"},description:"Test ID for integration testing."},"aria-label":{defaultValue:{value:"'Avatars'",computed:!1},required:!1}},composes:["Omit"]};const L=.35,p={base:{kVAEAm:"astryx1n2onr6",k1xSpc:"astryx78zum5",kGNEyG:"astryx6s0dn4",kjj79g:"astryxl56j7k",kaIpWk:"astryxjspbzw",kWkggS:"astryx10xzikg",kMwMTN:"astryxv1l7n4",kMv6JI:"astryx9ynric",k63SB2:"astryx1e4wzip",kfSwDN:"astryx87ps6o",kMzoRj:"astryxdh2fpr",ksu8eU:"astryx1y0btm7",kVAM5u:"astryx1touxvs",kB7OPa:"astryx1afcbsf",kKwaWg:"astryx14bno8m",$$css:!0},button:{kkrTdU:"astryx1ypdohk",kmVPX3:"astryx1717udv",kKwaWg:"astryx14bno8m astryxbfmc0r astryx1nocapi",kI3sdo:"astryx1a2a7pz astryx17nn4n9",kInvED:"astryx7s97pk",$$css:!0},overlap:{keTefX:"astryx13hpdyo",$$css:!0}},P={kGuDYH:"astryxdmh292",$$css:!0},V={"--_avatar-group-overlap":"astryxlz5hwt",$$css:!0},l={size:e=>[{kzqmXN:e!=null?"astryx5lhr3w":e,kZKoxP:e!=null?"astryx16ye13r":e,$$css:!0},{"--x-width":(a=>typeof a=="number"?a+"px":a??void 0)(e),"--x-height":(a=>typeof a=="number"?a+"px":a??void 0)(e)}],fontSize:e=>[P,{"--x-fontSize":(a=>typeof a=="number"?a+"px":a??void 0)(e*L)}],overlap:e=>[V,{"--x---_avatar-group-overlap":`${e}px`!=null?`${e}px`:void 0}]};function o({ref:e,count:a,onClick:i,children:E,xstyle:G,className:b,style:j,...z}){const O=I(),c=O?.numericSize??36,m=O?.overlap??0,R=`${a} more`,U=E??`+${a}`;return i?r.jsx("button",{ref:e,type:"button",onClick:i,"aria-label":R,...z,...C(T("avatar-group-overflow"),N(p.base,p.button,p.overlap,l.size(c),l.fontSize(c),l.overlap(-m),G),b,j),children:U}):r.jsx("span",{ref:e,"aria-label":R,...z,...C(T("avatar-group-overflow"),N(p.base,p.overlap,l.size(c),l.fontSize(c),l.overlap(-m),G),b,j),children:U})}o.displayName="AvatarGroupOverflow";o.__docgenInfo={description:`Overflow indicator for AvatarGroup. Shows a "+N" count and
optionally handles clicks.

@example
\`\`\`
<AvatarGroup size="medium">
  {users.slice(0, 3).map(u => (
    <Avatar key={u.id} src={u.src} name={u.name} />
  ))}
  <AvatarGroupOverflow count={users.length - 3} onClick={showAll} />
</AvatarGroup>
\`\`\``,methods:[],displayName:"AvatarGroupOverflow",props:{ref:{required:!1,tsType:{name:"ReactRef",raw:"React.Ref<HTMLElement>",elements:[{name:"HTMLElement"}]},description:""},count:{required:!0,tsType:{name:"number"},description:"The overflow count to display."},onClick:{required:!1,tsType:{name:"signature",type:"function",raw:"() => void",signature:{arguments:[],return:{name:"void"}}},description:`Callback fired when the overflow indicator is clicked.
When provided, the indicator renders as a focusable button.`},children:{required:!1,tsType:{name:"ReactNode"},description:'Custom content to render instead of the default "+N" label.'}},composes:["Omit"]};const n=[{name:"Alice Johnson",src:"https://i.pravatar.cc/150?img=1",key:"alice"},{name:"Bob Smith",src:"https://i.pravatar.cc/150?img=2",key:"bob"},{name:"Charlie Davis",src:"https://i.pravatar.cc/150?img=3",key:"charlie"},{name:"Diana Lee",src:"https://i.pravatar.cc/150?img=4",key:"diana"},{name:"Eve Park",src:"https://i.pravatar.cc/150?img=5",key:"eve"}],J={title:"Core/AvatarGroup",component:s,tags:["autodocs"],argTypes:{size:{control:"select",options:["tiny","xsmall","small","medium","large"],description:"Size applied to all child avatars"}}},u={render:()=>r.jsx(s,{size:"medium",children:n.slice(0,3).map(e=>r.jsx(t,{src:e.src,name:e.name},e.key))})},d={render:()=>r.jsxs(s,{size:"medium",children:[n.slice(0,3).map(e=>r.jsx(t,{src:e.src,name:e.name},e.key)),r.jsx(o,{count:n.length-3})]})},v={render:()=>r.jsxs(s,{size:"medium",children:[n.slice(0,3).map(e=>r.jsx(t,{src:e.src,name:e.name},e.key)),r.jsx(o,{count:n.length-3,onClick:()=>alert("Show all participants")})]})},y={render:()=>r.jsxs(s,{size:"medium",children:[n.slice(0,3).map(e=>r.jsx(t,{src:e.src,name:e.name},e.key)),r.jsx(o,{count:44})]})},x={render:()=>r.jsxs(s,{size:"medium",children:[r.jsx(t,{src:"https://i.pravatar.cc/150?img=1",name:"Alice",status:r.jsx($,{variant:"success",label:"Online"})}),r.jsx(t,{src:"https://i.pravatar.cc/150?img=2",name:"Bob",status:r.jsx($,{variant:"warning",label:"Away"})}),r.jsx(t,{src:"https://i.pravatar.cc/150?img=3",name:"Charlie",status:r.jsx($,{variant:"error",label:"Offline"})})]})},h={render:()=>r.jsx("div",{className:"x78zum5 xdt5ytf x1qh66ti",children:["tiny","xsmall","small","medium","large"].map(e=>r.jsxs("div",{children:[r.jsx("h4",{className:"xrcdmg7 x9ynric",children:e}),r.jsxs(s,{size:e,children:[n.slice(0,3).map(a=>r.jsx(t,{src:a.src,name:a.name},a.key)),r.jsx(o,{count:n.length-3})]})]},e))})},f={render:()=>r.jsxs(s,{size:"medium",children:[n.slice(0,4).map(e=>r.jsx(t,{name:e.name},e.key)),r.jsx(o,{count:1})]})},A={render:()=>r.jsx(s,{size:"medium",children:r.jsx(t,{src:"https://i.pravatar.cc/150?img=1",name:"Alice Johnson"})})},g={render:()=>r.jsxs(s,{size:"medium",children:[n.slice(0,3).map(e=>r.jsx(t,{src:e.src,name:e.name},e.key)),r.jsx(o,{count:999})]})},k={render:()=>r.jsxs(s,{size:"medium",children:[n.slice(0,3).map(e=>r.jsx(t,{src:e.src,name:e.name},e.key)),r.jsx(o,{count:0})]})},S={render:()=>r.jsx("div",{style:{width:120,border:"1px dashed grey",padding:8},children:r.jsxs(s,{size:"medium",children:[n.slice(0,5).map(e=>r.jsx(t,{src:e.src,name:e.name},e.key)),r.jsx(o,{count:10})]})})},w={render:()=>{const e=Array.from({length:10},(a,i)=>({key:`user-${i}`,name:`User ${i+1}`,src:`https://i.pravatar.cc/150?img=${i%70+1}`}));return r.jsxs(s,{size:"small",children:[e.map(a=>r.jsx(t,{src:a.src,name:a.name},a.key)),r.jsx(o,{count:37})]})}};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  render: () => <AvatarGroup size="medium">
      {USERS.slice(0, 3).map(u => <Avatar key={u.key} src={u.src} name={u.name} />)}
    </AvatarGroup>
}`,...u.parameters?.docs?.source},description:{story:"Basic avatar group showing all members.",...u.parameters?.docs?.description}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  render: () => <AvatarGroup size="medium">
      {USERS.slice(0, 3).map(u => <Avatar key={u.key} src={u.src} name={u.name} />)}
      <AvatarGroupOverflow count={USERS.length - 3} />
    </AvatarGroup>
}`,...d.parameters?.docs?.source},description:{story:'Sliced to 3 with "+N" overflow indicator.',...d.parameters?.docs?.description}}};v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  render: () => <AvatarGroup size="medium">
      {USERS.slice(0, 3).map(u => <Avatar key={u.key} src={u.src} name={u.name} />)}
      <AvatarGroupOverflow count={USERS.length - 3} onClick={() => alert('Show all participants')} />
    </AvatarGroup>
}`,...v.parameters?.docs?.source},description:{story:"Clickable overflow indicator.",...v.parameters?.docs?.description}}};y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  render: () => <AvatarGroup size="medium">
      {USERS.slice(0, 3).map(u => <Avatar key={u.key} src={u.src} name={u.name} />)}
      <AvatarGroupOverflow count={44} />
    </AvatarGroup>
}`,...y.parameters?.docs?.source},description:{story:"Server-side total count (47 participants, only 3 rendered).",...y.parameters?.docs?.description}}};x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  render: () => <AvatarGroup size="medium">
      <Avatar src="https://i.pravatar.cc/150?img=1" name="Alice" status={<StatusDot variant="success" label="Online" />} />
      <Avatar src="https://i.pravatar.cc/150?img=2" name="Bob" status={<StatusDot variant="warning" label="Away" />} />
      <Avatar src="https://i.pravatar.cc/150?img=3" name="Charlie" status={<StatusDot variant="error" label="Offline" />} />
    </AvatarGroup>
}`,...x.parameters?.docs?.source},description:{story:"Per-avatar status dots — just works with compositional API.",...x.parameters?.docs?.description}}};h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  render: () => <div {...stylex.props(storyStyles.storyWrapper)}>
      {(['tiny', 'xsmall', 'small', 'medium', 'large'] as const).map(size => <div key={size}>
          <h4 {...stylex.props(storyStyles.heading)}>{size}</h4>
          <AvatarGroup size={size}>
            {USERS.slice(0, 3).map(u => <Avatar key={u.key} src={u.src} name={u.name} />)}
            <AvatarGroupOverflow count={USERS.length - 3} />
          </AvatarGroup>
        </div>)}
    </div>
}`,...h.parameters?.docs?.source},description:{story:"All sizes side by side.",...h.parameters?.docs?.description}}};f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  render: () => <AvatarGroup size="medium">
      {USERS.slice(0, 4).map(u => <Avatar key={u.key} name={u.name} />)}
      <AvatarGroupOverflow count={1} />
    </AvatarGroup>
}`,...f.parameters?.docs?.source},description:{story:"Initials fallback when no images provided.",...f.parameters?.docs?.description}}};A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  render: () => <AvatarGroup size="medium">
      <Avatar src="https://i.pravatar.cc/150?img=1" name="Alice Johnson" />
    </AvatarGroup>
}`,...A.parameters?.docs?.source},description:{story:"Single avatar — no overlap applied.",...A.parameters?.docs?.description}}};g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  render: () => <AvatarGroup size="medium">
      {USERS.slice(0, 3).map(u => <Avatar key={u.key} src={u.src} name={u.name} />)}
      <AvatarGroupOverflow count={999} />
    </AvatarGroup>
}`,...g.parameters?.docs?.source},description:{story:"Large overflow count (99+).",...g.parameters?.docs?.description}}};k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  render: () => <AvatarGroup size="medium">
      {USERS.slice(0, 3).map(u => <Avatar key={u.key} src={u.src} name={u.name} />)}
      <AvatarGroupOverflow count={0} />
    </AvatarGroup>
}`,...k.parameters?.docs?.source},description:{story:"Zero overflow count edge case.",...k.parameters?.docs?.description}}};S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    width: 120,
    border: '1px dashed grey',
    padding: 8
  }}>
      <AvatarGroup size="medium">
        {USERS.slice(0, 5).map(u => <Avatar key={u.key} src={u.src} name={u.name} />)}
        <AvatarGroupOverflow count={10} />
      </AvatarGroup>
    </div>
}`,...S.parameters?.docs?.source},description:{story:"Narrow container — tests overflow behavior in constrained width.",...S.parameters?.docs?.description}}};w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  render: () => {
    const manyUsers = Array.from({
      length: 10
    }, (_, i) => ({
      key: \`user-\${i}\`,
      name: \`User \${i + 1}\`,
      src: \`https://i.pravatar.cc/150?img=\${i % 70 + 1}\`
    }));
    return <AvatarGroup size="small">
        {manyUsers.map(u => <Avatar key={u.key} src={u.src} name={u.name} />)}
        <AvatarGroupOverflow count={37} />
      </AvatarGroup>;
  }
}`,...w.parameters?.docs?.source},description:{story:"Many avatars — 10+ items to verify overlap stacking.",...w.parameters?.docs?.description}}};const Z=["Default","WithOverflow","ClickableOverflow","ServerSideCount","WithStatusDots","AllSizes","InitialsFallback","SingleAvatar","LargeOverflowCount","ZeroOverflow","NarrowContainer","ManyAvatars"];export{h as AllSizes,v as ClickableOverflow,u as Default,f as InitialsFallback,g as LargeOverflowCount,w as ManyAvatars,S as NarrowContainer,y as ServerSideCount,A as SingleAvatar,d as WithOverflow,x as WithStatusDots,k as ZeroOverflow,Z as __namedExportsOrder,J as default};
