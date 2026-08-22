import{i as e,s as t}from"./preload-helper-CT_b8DTk.js";import{t as n}from"./react-B7Te67-h.js";import{t as r}from"./jsx-runtime-DqZldVDK.js";import{t as i}from"./Text-DtYqyGdI.js";import{n as a,t as o}from"./Badge-BVImEihU.js";import{t as s}from"./Heading-93KON7qD.js";import{i as c,o as l,t as u}from"./Stack-BNC3JVPO.js";import{t as d}from"./Text-ruMIfm9Y.js";import{_ as f,g as p,t as m}from"./Table-DZ0rb8lL.js";import{St as h,dt as g}from"./iframe-DKtKskG4.js";function _({order:e}){return(0,b.jsxs)(c,{gap:2,children:[(0,b.jsx)(s,{level:4,children:`Line items`}),e.items.map(e=>(0,b.jsxs)(l,{gap:3,children:[(0,b.jsx)(a,{label:`x${e.qty}`,variant:`info`}),(0,b.jsx)(i,{type:`body`,children:e.name}),(0,b.jsx)(i,{type:`body`,color:`secondary`,children:e.price})]},e.name))]})}function v(e,t){let n=new Set(e);return n.has(t)?n.delete(t):n.add(t),n}var y,b,x,S,C,w,T,E;e((()=>{y=t(n()),g(),u(),d(),o(),b=r(),x=[{id:`ord-1001`,customer:`Ada Lovelace`,status:`Shipped`,total:`$248.00`,placed:`2026-06-20`,items:[{name:`Mechanical keyboard`,qty:1,price:`$180.00`},{name:`Wrist rest`,qty:2,price:`$34.00`}]},{id:`ord-1002`,customer:`Alan Turing`,status:`Processing`,total:`$52.00`,placed:`2026-06-21`,items:[{name:`USB-C cable`,qty:4,price:`$13.00`}]},{id:`ord-1003`,customer:`Grace Hopper`,status:`Delivered`,total:`$1,200.00`,placed:`2026-06-18`,items:[{name:`Standing desk`,qty:1,price:`$1,200.00`}]}],S=[{key:`customer`,header:`Customer`,width:f(2)},{key:`status`,header:`Status`,width:p(130)},{key:`total`,header:`Total`,width:p(110)},{key:`placed`,header:`Placed`,width:p(120)}],C={title:`Core/TableRowExpansion`,tags:[`autodocs`]},w={render:()=>{let[e,t]=(0,y.useState)(new Set([`ord-1001`])),n=h({expandedKeys:e,onToggle:e=>t(t=>v(t,e)),getRowKey:e=>e.id,renderExpanded:e=>(0,b.jsx)(_,{order:e})});return(0,b.jsx)(m,{data:x,columns:S,idKey:`id`,hasHover:!0,plugins:{expansion:n}})}},T={render:()=>{let[e,t]=(0,y.useState)(new Set),n=h({expandedKeys:e,onToggle:e=>t(t=>v(t,e)),getRowKey:e=>e.id,getIsItemExpandable:e=>e.items.length>1,renderExpanded:e=>(0,b.jsx)(_,{order:e})});return(0,b.jsx)(m,{data:x,columns:S,idKey:`id`,hasHover:!0,plugins:{expansion:n}})}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set(['ord-1001']));
    const expansion = useTableRowExpansion<Order>({
      expandedKeys,
      onToggle: key => setExpandedKeys(prev => toggleKey(prev, key)),
      getRowKey: item => item.id,
      renderExpanded: item => <OrderItems order={item} />
    });
    return <Table data={orders} columns={columns} idKey="id" hasHover plugins={{
      expansion
    }} />;
  }
}`,...w.parameters?.docs?.source},description:{story:'Each row expands a full-width detail panel below it, rendered by\n`renderExpanded(item)`. Click the chevron (or right-click, then\n"Expand/Collapse row") to toggle the panel. The consumer owns the\n`expandedKeys` set.\n\nFor hierarchical data (child rows that reuse the parent columns), use\n`useTableTreeData` + `useTableTreeState` instead.',...w.parameters?.docs?.description}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set());
    const expansion = useTableRowExpansion<Order>({
      expandedKeys,
      onToggle: key => setExpandedKeys(prev => toggleKey(prev, key)),
      getRowKey: item => item.id,
      getIsItemExpandable: item => item.items.length > 1,
      renderExpanded: item => <OrderItems order={item} />
    });
    return <Table data={orders} columns={columns} idKey="id" hasHover plugins={{
      expansion
    }} />;
  }
}`,...T.parameters?.docs?.source},description:{story:`\`getIsItemExpandable\` restricts which rows can expand. Here only orders with
more than one line item are expandable; the rest show no chevron and no
context-menu action.`,...T.parameters?.docs?.description}}},E=[`DetailPanel`,`NotAllRowsExpandable`]}))();export{w as DetailPanel,T as NotAllRowsExpandable,E as __namedExportsOrder,C as default};