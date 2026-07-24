import{i as e,s as t}from"./preload-helper-CT_b8DTk.js";import{t as n}from"./react-B7Te67-h.js";import{t as r}from"./jsx-runtime-DqZldVDK.js";import{t as i}from"./Text-Bt7jq58k.js";import{t as a}from"./Button-DlxrQzaK.js";import{t as o}from"./Button-PY4-RRjU.js";import{t as s}from"./Heading-DaPZub_W.js";import{i as c,t as l}from"./Stack-C7dTtCDZ.js";import{t as u}from"./Section-uPZCRnkC.js";import{t as d}from"./Section-C4pDrmx1.js";import{n as f,t as p}from"./Text-BYms8e3u.js";import{t as m}from"./Divider-CyxlzlSx.js";import{t as h}from"./Divider-keWi-KmE.js";import{t as g}from"./CheckboxInput-BeTqxUJx.js";import{t as _}from"./CheckboxInput-X_dmfMb8.js";import{t as v,yn as y}from"./src-DWfAlzfh.js";var b,x,S,C,w,T,E,D,O;e((()=>{b=t(n()),v(),o(),_(),h(),f(),d(),l(),p(),x=r(),S={title:`Lab/Drawer`,component:y,tags:[`autodocs`],parameters:{layout:`centered`},decorators:[e=>(0,x.jsx)(`div`,{style:{width:560,minHeight:360,padding:32},children:(0,x.jsx)(e,{})})]},C=[{id:`web-01`,region:`us-east-1`,status:`Healthy`,cpu:`32%`},{id:`web-02`,region:`us-east-1`,status:`Healthy`,cpu:`41%`},{id:`worker-01`,region:`eu-west-1`,status:`Degraded`,cpu:`87%`}],w=[`us-east-1`,`eu-west-1`,`ap-south-1`],T={render:()=>{let[e,t]=(0,b.useState)(!1);return(0,x.jsxs)(x.Fragment,{children:[(0,x.jsx)(a,{label:`Open inspector`,onClick:()=>t(!0)}),(0,x.jsx)(y,{isOpen:e,onClose:()=>t(!1),label:`Deployment details`,size:400,children:(0,x.jsx)(u,{padding:4,children:(0,x.jsxs)(c,{gap:4,children:[(0,x.jsxs)(c,{gap:1,children:[(0,x.jsx)(s,{level:3,children:`web-prod-04`}),(0,x.jsx)(i,{type:`supporting`,color:`secondary`,children:`us-east-1, deployed 12 min ago`})]}),(0,x.jsx)(m,{}),(0,x.jsxs)(c,{gap:2,children:[(0,x.jsx)(i,{type:`label`,children:`Status`}),(0,x.jsx)(i,{type:`body`,children:`Healthy - all 6 instances passing readiness checks.`})]}),(0,x.jsxs)(c,{gap:2,children:[(0,x.jsx)(i,{type:`label`,children:`Build`}),(0,x.jsx)(i,{type:`body`,children:`#4821 - main @ 03536f1`})]})]})})})]})}},E={render:()=>{let[e,t]=(0,b.useState)(null),n=C.find(t=>t.id===e);return(0,x.jsxs)(x.Fragment,{children:[(0,x.jsx)(c,{gap:1,children:C.map(e=>(0,x.jsx)(a,{variant:`ghost`,label:`${e.id} / ${e.region}`,onClick:()=>t(e.id)},e.id))}),(0,x.jsx)(y,{isOpen:n!=null,onClose:()=>t(null),label:n?`Host details: ${n.id}`:`Host details`,hasScrim:!1,size:360,children:n!=null&&(0,x.jsx)(u,{padding:4,children:(0,x.jsxs)(c,{gap:4,children:[(0,x.jsxs)(c,{gap:1,children:[(0,x.jsx)(s,{level:3,children:n.id}),(0,x.jsx)(i,{type:`supporting`,color:`secondary`,children:n.region})]}),(0,x.jsx)(m,{}),(0,x.jsxs)(c,{gap:2,children:[(0,x.jsx)(i,{type:`label`,children:`Status`}),(0,x.jsx)(i,{type:`body`,children:n.status}),(0,x.jsx)(i,{type:`label`,children:`CPU`}),(0,x.jsx)(i,{type:`body`,children:n.cpu})]}),(0,x.jsx)(a,{label:`Close inspector`,variant:`secondary`,onClick:()=>t(null)})]})})})]})}},D={render:()=>{let[e,t]=(0,b.useState)(!1),[n,r]=(0,b.useState)(w.slice(0,1));return(0,x.jsxs)(x.Fragment,{children:[(0,x.jsx)(a,{label:`Filter regions`,onClick:()=>t(!0)}),(0,x.jsx)(y,{isOpen:e,onClose:()=>t(!1),label:`Region filters`,side:`bottom`,size:`40dvh`,children:(0,x.jsx)(u,{padding:4,children:(0,x.jsxs)(c,{gap:4,children:[(0,x.jsxs)(c,{gap:1,children:[(0,x.jsx)(s,{level:3,children:`Filter by region`}),(0,x.jsxs)(i,{type:`supporting`,color:`secondary`,children:[`Showing hosts in `,n.length,` of `,w.length,` regions`]})]}),(0,x.jsx)(c,{gap:2,children:w.map(e=>(0,x.jsx)(g,{label:e,value:n.includes(e),onChange:t=>r(n=>t?[...n,e]:n.filter(t=>t!==e))},e))}),(0,x.jsx)(a,{label:`Apply filters`,onClick:()=>t(!1),"data-autofocus":!0})]})})})]})}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    return <>
        <Button label="Open inspector" onClick={() => setIsOpen(true)} />
        <Drawer isOpen={isOpen} onClose={() => setIsOpen(false)} label="Deployment details" size={400}>
          <Section padding={4}>
            <VStack gap={4}>
              <VStack gap={1}>
                <Heading level={3}>web-prod-04</Heading>
                <Text type="supporting" color="secondary">
                  us-east-1, deployed 12 min ago
                </Text>
              </VStack>
              <Divider />
              <VStack gap={2}>
                <Text type="label">Status</Text>
                <Text type="body">
                  Healthy - all 6 instances passing readiness checks.
                </Text>
              </VStack>
              <VStack gap={2}>
                <Text type="label">Build</Text>
                <Text type="body">#4821 - main @ 03536f1</Text>
              </VStack>
            </VStack>
          </Section>
        </Drawer>
      </>;
  }
}`,...T.parameters?.docs?.source}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const selected = HOSTS.find(host => host.id === selectedId);
    return <>
        <VStack gap={1}>
          {HOSTS.map(host => <Button key={host.id} variant="ghost" label={\`\${host.id} / \${host.region}\`} onClick={() => setSelectedId(host.id)} />)}
        </VStack>
        <Drawer isOpen={selected != null} onClose={() => setSelectedId(null)} label={selected ? \`Host details: \${selected.id}\` : 'Host details'} hasScrim={false} size={360}>
          {selected != null && <Section padding={4}>
              <VStack gap={4}>
                <VStack gap={1}>
                  <Heading level={3}>{selected.id}</Heading>
                  <Text type="supporting" color="secondary">
                    {selected.region}
                  </Text>
                </VStack>
                <Divider />
                <VStack gap={2}>
                  <Text type="label">Status</Text>
                  <Text type="body">{selected.status}</Text>
                  <Text type="label">CPU</Text>
                  <Text type="body">{selected.cpu}</Text>
                </VStack>
                <Button label="Close inspector" variant="secondary" onClick={() => setSelectedId(null)} />
              </VStack>
            </Section>}
        </Drawer>
      </>;
  }
}`,...E.parameters?.docs?.source}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    const [selected, setSelected] = useState<string[]>(REGIONS.slice(0, 1));
    return <>
        <Button label="Filter regions" onClick={() => setIsOpen(true)} />
        <Drawer isOpen={isOpen} onClose={() => setIsOpen(false)} label="Region filters" side="bottom" size="40dvh">
          <Section padding={4}>
            <VStack gap={4}>
              <VStack gap={1}>
                <Heading level={3}>Filter by region</Heading>
                <Text type="supporting" color="secondary">
                  Showing hosts in {selected.length} of {REGIONS.length} regions
                </Text>
              </VStack>
              <VStack gap={2}>
                {REGIONS.map(region => <CheckboxInput key={region} label={region} value={selected.includes(region)} onChange={checked => setSelected(current => checked ? [...current, region] : current.filter(r => r !== region))} />)}
              </VStack>
              <Button label="Apply filters" onClick={() => setIsOpen(false)} data-autofocus />
            </VStack>
          </Section>
        </Drawer>
      </>;
  }
}`,...D.parameters?.docs?.source}}},O=[`Showcase`,`RowInspector`,`BottomSheet`]}))();export{D as BottomSheet,E as RowInspector,T as Showcase,O as __namedExportsOrder,S as default};