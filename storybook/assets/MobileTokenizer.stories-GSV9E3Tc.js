import{i as e,s as t}from"./preload-helper-CT_b8DTk.js";import{t as n}from"./react-B7Te67-h.js";import{t as r}from"./jsx-runtime-DqZldVDK.js";import{n as i,t as a}from"./src-CQKpLOJb.js";var o,s,c,l,u,d,f;e((()=>{o=t(n()),a(),s=r(),c=[{id:`design`,label:`Design`},{id:`eng`,label:`Eng`},{id:`engineer`,label:`Engineer`},{id:`energizer`,label:`Energizer`}],l={search:e=>c.filter(t=>t.label.toLowerCase().includes(e.toLowerCase())),bootstrap:()=>c},u={title:`Lab/MobileTokenizer`,component:i},d={render:()=>{let[e,t]=(0,o.useState)([c[0],c[1]]);return(0,s.jsx)(`div`,{style:{width:350},children:(0,s.jsx)(i,{label:`Tags`,searchSource:l,value:e,onChange:e=>t(e),placeholder:`Add tags`,debounceMs:0})})},name:`Touch flow (sketch: manage + stacked add, bottom filter)`},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = useState<SearchableItem[]>([tags[0], tags[1]]);
    return <div style={{
      width: 350
    }}>
        <MobileTokenizer label="Tags" searchSource={source} value={value} onChange={items => setValue(items)} placeholder="Add tags" debounceMs={0} />
      </div>;
  },
  name: 'Touch flow (sketch: manage + stacked add, bottom filter)'
}`,...d.parameters?.docs?.source}}},f=[`TouchFlow`]}))();export{d as TouchFlow,f as __namedExportsOrder,u as default};