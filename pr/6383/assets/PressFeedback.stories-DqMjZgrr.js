import{i as e,s as t}from"./preload-helper-CT_b8DTk.js";import{t as n}from"./react-B7Te67-h.js";import{t as r}from"./jsx-runtime-DqZldVDK.js";import{t as i}from"./Text-DTzAYTJM.js";import{t as a}from"./Button-C7uYWPLx.js";import{t as o}from"./Button-8X1GX2ZA.js";import{t as s}from"./Icon-LMTcUKwK.js";import{t as c}from"./Icon-Dzf1rqTo.js";import{n as l,t as u}from"./Item-DhWw9222.js";import{d}from"./renderDropdownItems-C0vFSnOH.js";import{t as f}from"./ClickableCard-B8tBoxrC.js";import{i as p}from"./Stack-Dfp1-rvr.js";import{t as m}from"./Layout-B5lPnZ6c.js";import{t as h}from"./Text-CYSpiVrf.js";import{t as g}from"./CheckboxInput-BGxLG9OB.js";import{t as _}from"./CheckboxInput-CLTQsB70.js";import{i as v,t as y}from"./Link-Bd-o8Yc_.js";import{t as b}from"./DropdownMenu-C0Agk5Cv.js";import{Bn as x,Cr as S,Er as C,Hn as w,Ln as T,Ni as E,Or as D,Rn as O,Un as k,bn as A,hn as j,jr as M,rt as N,vn as P,wr as F}from"./iframe-CldOTL2c.js";var I,L,R,z,B,V,H,U,W;e((()=>{I=t(n()),o(),_(),E(),D(),N(),c(),u(),y(),S(),T(),w(),j(),h(),m(),L=r(),R={title:`Core/Press feedback (touch)`,parameters:{layout:`padded`,docs:{description:{component:'The touch press model on every pressable surface. View with a coarse pointer (DevTools device toolbar, or a phone). Under a finger the bare `:active` arm is dropped and one document-level controller writes `data-pressed="on"` once a press is believed (150 ms, no travel, no scroll) and `data-pressed="fading"` for the 200 ms release; a scroll or 10 px of travel cancels with no fade, and nothing repaints until a new touch. A mouse keeps `:active`. Scroll the list stories with a finger: no row paints while the list moves.'}}}},z=e=>`${e} Hold: paints after 150 ms. Tap: paints at the lift. Drag or scroll: never paints, and stays dark until the finger lifts and lands again.`,B={parameters:{docs:{description:{story:z(`Buttons under a finger.`)}}},render:()=>(0,L.jsxs)(p,{gap:3,children:[(0,L.jsx)(a,{label:`Primary`,variant:`primary`}),(0,L.jsx)(a,{label:`Secondary`,variant:`secondary`}),(0,L.jsx)(a,{label:`Ghost`,variant:`ghost`}),(0,L.jsx)(a,{label:`Destructive`,variant:`destructive`}),(0,L.jsx)(a,{label:`Disabled — never presses`,isDisabled:!0})]})},V={parameters:{docs:{description:{story:z(`Item rows, a menu, and a clickable card. The list scrolls: flick it and no row paints; stop it with a finger and that touch is a brake, not a press.`)}}},render:()=>(0,L.jsxs)(p,{gap:4,children:[(0,L.jsx)(`div`,{style:{height:220,overflowY:`auto`,border:`1px solid transparent`},children:Array.from({length:24},(e,t)=>(0,L.jsx)(l,{label:`Conversation ${t+1}`,description:`Press and hold, or scroll past`,isUnread:t%3==0,onClick:()=>{}},t))}),(0,L.jsxs)(b,{button:{label:`Menu`},children:[(0,L.jsx)(d,{label:`Rename`,onClick:()=>{}}),(0,L.jsx)(d,{label:`Settings — a navigation row`,href:`#settings`}),(0,L.jsx)(d,{label:`Delete`,variant:`destructive`,onClick:()=>{}})]}),(0,L.jsx)(f,{label:`A clickable card`,onClick:()=>{},children:(0,L.jsx)(i,{children:`A clickable card: press and hold`})})]})},H={parameters:{docs:{description:{story:z(`The eight components that gained a pressed state, under a finger.`)}}},render:()=>{let[e,t]=(0,I.useState)(!1),[n,r]=(0,I.useState)(!1),[a,o]=(0,I.useState)(`email`),[s,c]=(0,I.useState)(`grid`),[l,u]=(0,I.useState)(`home`);return(0,L.jsxs)(p,{gap:4,children:[(0,L.jsx)(k,{label:`Notifications`,value:e,onChange:t}),(0,L.jsx)(g,{label:`Accept terms`,value:n,onChange:r}),(0,L.jsxs)(C,{label:`Channel`,value:a,onChange:o,children:[(0,L.jsx)(F,{label:`Email`,value:`email`}),(0,L.jsx)(F,{label:`SMS`,value:`sms`})]}),(0,L.jsxs)(x,{value:s,onChange:c,label:`View`,children:[(0,L.jsx)(O,{value:`grid`,label:`Grid`}),(0,L.jsx)(O,{value:`list`,label:`List`})]}),(0,L.jsxs)(A,{value:l,onChange:u,children:[(0,L.jsx)(P,{value:`home`,label:`Home`}),(0,L.jsx)(P,{value:`settings`,label:`Settings`})]}),(0,L.jsxs)(i,{children:[`Read the`,` `,(0,L.jsx)(v,{href:`#docs`,onClick:e=>e.preventDefault(),children:`documentation`}),`.`]}),(0,L.jsx)(M,{trigger:`Details`,children:(0,L.jsx)(i,{children:`The trigger row presses.`})})]})}},U={parameters:{docs:{description:{story:"Item `swipeActions`, touch only. Drag a row to the right to reveal Archive, to the left to reveal Delete; release past a third of the row (or fling) to fire it, short of it to spring back. A vertical drag scrolls the list as usual. Unread rows carry the semibold label."}}},render:()=>{let[e,t]=(0,I.useState)(()=>Array.from({length:8},(e,t)=>({id:t,label:`Message ${t+1}`,isUnread:t%2==0}))),n=e=>t(t=>t.filter(t=>t.id!==e));return(0,L.jsxs)(p,{gap:0,children:[e.map(e=>(0,L.jsx)(l,{label:e.label,description:`Swipe right to archive, left to delete`,isUnread:e.isUnread,onClick:()=>{},swipeActions:{leading:{label:`Archive`,icon:(0,L.jsx)(s,{icon:`check`,size:`sm`,color:`inherit`}),onAction:()=>n(e.id),tone:`success`},trailing:{label:`Delete`,onAction:()=>n(e.id),tone:`error`}}},e.id)),e.length===0&&(0,L.jsx)(i,{children:`All done.`})]})}},B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: touchNote('Buttons under a finger.')
      }
    }
  },
  render: () => <VStack gap={3}>
      <Button label="Primary" variant="primary" />
      <Button label="Secondary" variant="secondary" />
      <Button label="Ghost" variant="ghost" />
      <Button label="Destructive" variant="destructive" />
      <Button label="Disabled — never presses" isDisabled />
    </VStack>
}`,...B.parameters?.docs?.source}}},V.parameters={...V.parameters,docs:{...V.parameters?.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: touchNote('Item rows, a menu, and a clickable card. The list scrolls: flick it and no row paints; stop it with a finger and that touch is a brake, not a press.')
      }
    }
  },
  render: () => <VStack gap={4}>
      <div style={{
      height: 220,
      overflowY: 'auto',
      border: '1px solid transparent'
    }}>
        {Array.from({
        length: 24
      }, (_, index) => <Item key={index} label={\`Conversation \${index + 1}\`} description="Press and hold, or scroll past" isUnread={index % 3 === 0} onClick={() => {}} />)}
      </div>
      <DropdownMenu button={{
      label: 'Menu'
    }}>
        <DropdownMenuItem label="Rename" onClick={() => {}} />
        <DropdownMenuItem label="Settings — a navigation row" href="#settings" />
        <DropdownMenuItem label="Delete" variant="destructive" onClick={() => {}} />
      </DropdownMenu>
      <ClickableCard label="A clickable card" onClick={() => {}}>
        <Text>A clickable card: press and hold</Text>
      </ClickableCard>
    </VStack>
}`,...V.parameters?.docs?.source}}},H.parameters={...H.parameters,docs:{...H.parameters?.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: touchNote('The eight components that gained a pressed state, under a finger.')
      }
    }
  },
  render: () => {
    const [on, setOn] = useState(false);
    const [checked, setChecked] = useState<boolean | 'indeterminate'>(false);
    const [radio, setRadio] = useState('email');
    const [segment, setSegment] = useState('grid');
    const [tab, setTab] = useState('home');
    return <VStack gap={4}>
        <Switch label="Notifications" value={on} onChange={setOn} />
        <CheckboxInput label="Accept terms" value={checked} onChange={setChecked} />
        <RadioList label="Channel" value={radio} onChange={setRadio}>
          <RadioListItem label="Email" value="email" />
          <RadioListItem label="SMS" value="sms" />
        </RadioList>
        <SegmentedControl value={segment} onChange={setSegment} label="View">
          <SegmentedControlItem value="grid" label="Grid" />
          <SegmentedControlItem value="list" label="List" />
        </SegmentedControl>
        <TabList value={tab} onChange={setTab}>
          <Tab value="home" label="Home" />
          <Tab value="settings" label="Settings" />
        </TabList>
        <Text>
          Read the{' '}
          <Link href="#docs" onClick={e => e.preventDefault()}>
            documentation
          </Link>
          .
        </Text>
        <Collapsible trigger="Details">
          <Text>The trigger row presses.</Text>
        </Collapsible>
      </VStack>;
  }
}`,...H.parameters?.docs?.source}}},U.parameters={...U.parameters,docs:{...U.parameters?.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'Item \`swipeActions\`, touch only. Drag a row to the right to reveal Archive, to the left to reveal Delete; release past a third of the row (or fling) to fire it, short of it to spring back. A vertical drag scrolls the list as usual. Unread rows carry the semibold label.'
      }
    }
  },
  render: () => {
    const [rows, setRows] = useState(() => Array.from({
      length: 8
    }, (_, index) => ({
      id: index,
      label: \`Message \${index + 1}\`,
      isUnread: index % 2 === 0
    })));
    const remove = (id: number) => setRows(current => current.filter(row => row.id !== id));
    return <VStack gap={0}>
        {rows.map(row => <Item key={row.id} label={row.label} description="Swipe right to archive, left to delete" isUnread={row.isUnread} onClick={() => {}} swipeActions={{
        leading: {
          label: 'Archive',
          icon: <Icon icon="check" size="sm" color="inherit" />,
          onAction: () => remove(row.id),
          tone: 'success'
        },
        trailing: {
          label: 'Delete',
          onAction: () => remove(row.id),
          tone: 'error'
        }
      }} />)}
        {rows.length === 0 && <Text>All done.</Text>}
      </VStack>;
  }
}`,...U.parameters?.docs?.source}}},W=[`Buttons`,`Rows`,`Controls`,`SwipeActions`]}))();export{B as Buttons,H as Controls,V as Rows,U as SwipeActions,W as __namedExportsOrder,R as default};