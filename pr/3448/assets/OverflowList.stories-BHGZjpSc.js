import{a1 as e,B as s,ah as x}from"./iframe-Cm6U1NA5.js";import{O as a}from"./OverflowList-DlKbBuhW.js";import{B as l}from"./Badge-BLygNeqY.js";import{D as u}from"./DropdownMenu-FagTdkRK.js";import{T as g}from"./TextInput-LJBFlu-A.js";import"./preload-helper-Ct5FWWRu.js";import"./usePopover-cP9R4NJf.js";import"./useFocusTrap-D5IA7LFu.js";import"./renderDropdownItems-bQ0yesD3.js";import"./Divider-BVACQv4v.js";import"./Item-Cm2fUJ9g.js";import"./computeTargetAndRel-BlG0ENK0.js";import"./useListFocus-DgEo17xf.js";import"./useTypeahead-t21n__Fr.js";import"./Field-HQcFiKNA.js";import"./FieldStatus-Bm1uxwg9.js";import"./inputStyles.stylex-Bpqcd25J.js";import"./groupStyles-DFb0brv9.js";import"./useInputContainer-BRnIDCwP.js";const F={title:"Core/OverflowList",component:a,tags:["autodocs"],argTypes:{gap:{control:{type:"number",min:0,max:10},description:"Gap between items as a spacing token step (0, 0.5, 1, 1.5, 2, 3, 4, 5, 6, 8, 10)"},minVisibleItems:{control:{type:"number",min:0,max:10},description:"Minimum number of items to always show"},collapseFrom:{control:"select",options:["start","end"],description:"Which end to collapse items from"}}},o={render:()=>e.jsx("div",{style:{maxWidth:400,border:"1px dashed #ccc",padding:8},children:e.jsxs(a,{gap:2,overflowRenderer:t=>e.jsx(s,{label:`+${t.length} more`,variant:"ghost",size:"sm"}),children:[e.jsx(s,{label:"Edit",size:"sm"}),e.jsx(s,{label:"Duplicate",size:"sm"}),e.jsx(s,{label:"Share",size:"sm"}),e.jsx(s,{label:"Archive",size:"sm"}),e.jsx(s,{label:"Delete",size:"sm"})]})})},n={render:()=>e.jsx("div",{style:{resize:"horizontal",overflow:"hidden",border:"1px dashed #ccc",padding:8,width:500,minWidth:100,maxWidth:"100%"},children:e.jsxs(a,{gap:2,overflowRenderer:t=>e.jsx(s,{label:`+${t.length} more`,variant:"ghost",size:"sm"}),children:[e.jsx(s,{label:"Dashboard",size:"sm"}),e.jsx(s,{label:"Analytics",size:"sm"}),e.jsx(s,{label:"Reports",size:"sm"}),e.jsx(s,{label:"Settings",size:"sm"}),e.jsx(s,{label:"Users",size:"sm"}),e.jsx(s,{label:"Billing",size:"sm"}),e.jsx(s,{label:"Integrations",size:"sm"})]})})},d={render:()=>e.jsx("div",{style:{maxWidth:600,border:"1px dashed #ccc",padding:8},children:e.jsxs(a,{gap:2,overflowRenderer:t=>e.jsx(s,{label:`+${t.length} more`,variant:"ghost",size:"sm"}),children:[e.jsx(s,{label:"Edit",size:"sm"}),e.jsx(s,{label:"Save",size:"sm"})]})})},m={render:()=>e.jsx("div",{style:{resize:"horizontal",overflow:"hidden",border:"1px dashed #ccc",padding:8,width:300,minWidth:80},children:e.jsxs(a,{gap:1,overflowRenderer:t=>e.jsx(l,{variant:"neutral",label:`+${t.length}`}),children:[e.jsx(l,{variant:"info",label:"React"}),e.jsx(l,{variant:"success",label:"TypeScript"}),e.jsx(l,{variant:"warning",label:"StyleX"}),e.jsx(l,{variant:"neutral",label:"Storybook"}),e.jsx(l,{variant:"error",label:"Vitest"})]})})},c={render:()=>e.jsx("div",{style:{maxWidth:300,border:"1px dashed #ccc",padding:8},children:e.jsxs(a,{gap:2,collapseFrom:"start",overflowRenderer:t=>e.jsx(s,{label:`+${t.length} more`,variant:"ghost",size:"sm"}),children:[e.jsx(s,{label:"Step 1",size:"sm"}),e.jsx(s,{label:"Step 2",size:"sm"}),e.jsx(s,{label:"Step 3",size:"sm"}),e.jsx(s,{label:"Step 4",size:"sm"}),e.jsx(s,{label:"Step 5",size:"sm"})]})})},p={render:()=>{const t=["Save","Edit","Duplicate","Share","Archive","Delete"];return e.jsx("div",{style:{resize:"horizontal",overflow:"hidden",border:"1px dashed #ccc",padding:8,width:350,minWidth:100,maxWidth:"100%"},children:e.jsxs(a,{gap:2,overflowRenderer:i=>e.jsx(u,{button:{label:`+${i.length}`,variant:"ghost",size:"sm"},items:i.map(({index:r})=>({label:t[r],onClick:()=>console.log(t[r])}))}),children:[e.jsx(s,{label:"Save",size:"sm",variant:"primary"}),e.jsx(s,{label:"Edit",size:"sm"}),e.jsx(s,{label:"Duplicate",size:"sm"}),e.jsx(s,{label:"Share",size:"sm"}),e.jsx(s,{label:"Archive",size:"sm"}),e.jsx(s,{label:"Delete",size:"sm",variant:"destructive"})]})})}},h={render:()=>{const[t,i]=x.useState("");return e.jsx("div",{style:{resize:"horizontal",overflow:"hidden",border:"1px dashed #ccc",minWidth:100,width:600},children:e.jsxs("div",{style:{display:"flex",flexWrap:"wrap",alignItems:"center",gap:8,padding:8,height:44},children:[e.jsxs(a,{gap:2,behavior:"observeParent",overflowRenderer:r=>e.jsx(s,{label:`+${r.length} more`,variant:"ghost",size:"sm"}),children:[e.jsx(s,{label:"Dashboard",size:"sm"}),e.jsx(s,{label:"Analytics",size:"sm"}),e.jsx(s,{label:"Reports",size:"sm"}),e.jsx(s,{label:"Settings",size:"sm"}),e.jsx(s,{label:"Users",size:"sm"}),e.jsx(s,{label:"Billing",size:"sm"})]}),e.jsx("div",{style:{width:70,flexShrink:0},children:e.jsx(g,{label:"Search",isLabelHidden:!0,placeholder:"Search...",size:"sm",value:t,onChange:i})})]})})}},v={render:()=>{const[t,i]=x.useState(5);return e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:16},children:[e.jsxs("div",{style:{display:"flex",gap:8,alignItems:"center"},children:[e.jsx(s,{label:"Remove",size:"sm",onClick:()=>i(r=>Math.max(1,r-1))}),e.jsx(s,{label:"Add",size:"sm",onClick:()=>i(r=>r+1)}),e.jsxs("span",{children:[t," items"]})]}),e.jsx("div",{style:{resize:"horizontal",overflow:"hidden",border:"1px dashed #ccc",padding:8,width:400,minWidth:100,maxWidth:"100%"},children:e.jsx(a,{gap:2,overflowRenderer:r=>e.jsx(s,{label:`+${r.length} more`,variant:"ghost",size:"sm"}),children:Array.from({length:t},(r,b)=>e.jsx(s,{label:`Item ${b+1}`,size:"sm"},b))})})]})}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    maxWidth: 400,
    border: '1px dashed #ccc',
    padding: 8
  }}>
      <OverflowList gap={2} overflowRenderer={overflowItems => <Button label={\`+\${overflowItems.length} more\`} variant="ghost" size="sm" />}>
        <Button label="Edit" size="sm" />
        <Button label="Duplicate" size="sm" />
        <Button label="Share" size="sm" />
        <Button label="Archive" size="sm" />
        <Button label="Delete" size="sm" />
      </OverflowList>
    </div>
}`,...o.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    resize: 'horizontal',
    overflow: 'hidden',
    border: '1px dashed #ccc',
    padding: 8,
    width: 500,
    minWidth: 100,
    maxWidth: '100%'
  }}>
      <OverflowList gap={2} overflowRenderer={overflowItems => <Button label={\`+\${overflowItems.length} more\`} variant="ghost" size="sm" />}>
        <Button label="Dashboard" size="sm" />
        <Button label="Analytics" size="sm" />
        <Button label="Reports" size="sm" />
        <Button label="Settings" size="sm" />
        <Button label="Users" size="sm" />
        <Button label="Billing" size="sm" />
        <Button label="Integrations" size="sm" />
      </OverflowList>
    </div>
}`,...n.parameters?.docs?.source}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    maxWidth: 600,
    border: '1px dashed #ccc',
    padding: 8
  }}>
      <OverflowList gap={2} overflowRenderer={overflowItems => <Button label={\`+\${overflowItems.length} more\`} variant="ghost" size="sm" />}>
        <Button label="Edit" size="sm" />
        <Button label="Save" size="sm" />
      </OverflowList>
    </div>
}`,...d.parameters?.docs?.source}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    resize: 'horizontal',
    overflow: 'hidden',
    border: '1px dashed #ccc',
    padding: 8,
    width: 300,
    minWidth: 80
  }}>
      <OverflowList gap={1} overflowRenderer={overflowItems => <Badge variant="neutral" label={\`+\${overflowItems.length}\`} />}>
        <Badge variant="info" label="React" />
        <Badge variant="success" label="TypeScript" />
        <Badge variant="warning" label="StyleX" />
        <Badge variant="neutral" label="Storybook" />
        <Badge variant="error" label="Vitest" />
      </OverflowList>
    </div>
}`,...m.parameters?.docs?.source}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    maxWidth: 300,
    border: '1px dashed #ccc',
    padding: 8
  }}>
      <OverflowList gap={2} collapseFrom="start" overflowRenderer={overflowItems => <Button label={\`+\${overflowItems.length} more\`} variant="ghost" size="sm" />}>
        <Button label="Step 1" size="sm" />
        <Button label="Step 2" size="sm" />
        <Button label="Step 3" size="sm" />
        <Button label="Step 4" size="sm" />
        <Button label="Step 5" size="sm" />
      </OverflowList>
    </div>
}`,...c.parameters?.docs?.source}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  render: () => {
    const actions = ['Save', 'Edit', 'Duplicate', 'Share', 'Archive', 'Delete'];
    return <div style={{
      resize: 'horizontal',
      overflow: 'hidden',
      border: '1px dashed #ccc',
      padding: 8,
      width: 350,
      minWidth: 100,
      maxWidth: '100%'
    }}>
        <OverflowList gap={2} overflowRenderer={overflowItems => <DropdownMenu button={{
        label: \`+\${overflowItems.length}\`,
        variant: 'ghost',
        size: 'sm'
      }} items={overflowItems.map(({
        index
      }) => ({
        label: actions[index],
        onClick: () => console.log(actions[index])
      }))} />}>
          <Button label="Save" size="sm" variant="primary" />
          <Button label="Edit" size="sm" />
          <Button label="Duplicate" size="sm" />
          <Button label="Share" size="sm" />
          <Button label="Archive" size="sm" />
          <Button label="Delete" size="sm" variant="destructive" />
        </OverflowList>
      </div>;
  }
}`,...p.parameters?.docs?.source}}};h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [search, setSearch] = useState('');
    return <div style={{
      resize: 'horizontal',
      overflow: 'hidden',
      border: '1px dashed #ccc',
      minWidth: 100,
      width: 600
    }}>
        <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: 8,
        padding: 8,
        height: 44
      }}>
          <OverflowList gap={2} behavior="observeParent" overflowRenderer={overflowItems => <Button label={\`+\${overflowItems.length} more\`} variant="ghost" size="sm" />}>
            <Button label="Dashboard" size="sm" />
            <Button label="Analytics" size="sm" />
            <Button label="Reports" size="sm" />
            <Button label="Settings" size="sm" />
            <Button label="Users" size="sm" />
            <Button label="Billing" size="sm" />
          </OverflowList>
          <div style={{
          width: 70,
          flexShrink: 0
        }}>
            <TextInput label="Search" isLabelHidden placeholder="Search..." size="sm" value={search} onChange={setSearch} />
          </div>
        </div>
      </div>;
  }
}`,...h.parameters?.docs?.source}}};v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [count, setCount] = useState(5);
    return <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 16
    }}>
        <div style={{
        display: 'flex',
        gap: 8,
        alignItems: 'center'
      }}>
          <Button label="Remove" size="sm" onClick={() => setCount(c => Math.max(1, c - 1))} />
          <Button label="Add" size="sm" onClick={() => setCount(c => c + 1)} />
          <span>{count} items</span>
        </div>
        <div style={{
        resize: 'horizontal',
        overflow: 'hidden',
        border: '1px dashed #ccc',
        padding: 8,
        width: 400,
        minWidth: 100,
        maxWidth: '100%'
      }}>
          <OverflowList gap={2} overflowRenderer={items => <Button label={\`+\${items.length} more\`} variant="ghost" size="sm" />}>
            {Array.from({
            length: count
          }, (_, i) => <Button key={i} label={\`Item \${i + 1}\`} size="sm" />)}
          </OverflowList>
        </div>
      </div>;
  }
}`,...v.parameters?.docs?.source}}};const M=["Default","Resizable","NoOverflow","WithBadges","CollapseFromStart","WithDropdownOverflow","WithSiblingElement","DynamicItems"];export{c as CollapseFromStart,o as Default,v as DynamicItems,d as NoOverflow,n as Resizable,m as WithBadges,p as WithDropdownOverflow,h as WithSiblingElement,M as __namedExportsOrder,F as default};
