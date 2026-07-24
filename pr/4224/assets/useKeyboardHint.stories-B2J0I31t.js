import{a as e,n as t}from"./rolldown-runtime-DaJ6WEGw.js";import{t as n}from"./react-DvlgmmzG.js";import{t as r}from"./Text-Bs-khaxO.js";import{t as i}from"./jsx-runtime-cM__dR4X.js";import{t as a}from"./Button-Cx-mMzJ7.js";import{t as o}from"./Button-D1MmXezA.js";import{t as s}from"./Card-CpjcShRF.js";import{t as c}from"./Card-BP3xkOim.js";import{t as l}from"./hooks-B6Vhwbg_.js";import{n as u}from"./useKeyboardHint-BqaZjk6r.js";import{i as d}from"./Stack-mterni5z.js";import{t as f}from"./Section-CtTobO2J.js";import{t as p}from"./Section-C4_UWnoF.js";import{t as m}from"./Layout-BbT8IvUw.js";import{t as h}from"./Text-DRSNMNB3.js";import{A as g,j as _}from"./iframe-CorsBOL8.js";function v({label:e,orientation:t,items:n}){let r=(0,y.useRef)(null),i=u({orientation:t}),a=t===`vertical`?`ArrowDown`:`ArrowRight`,o=t===`vertical`?`ArrowUp`:`ArrowLeft`,s=(0,y.useCallback)(e=>{let t=r.current;if(!t)return;let n=Array.from(t.querySelectorAll(`button`)),i=n.findIndex(e=>e===document.activeElement);if(i===-1)return;let s;if(e.key===a)s=(i+1)%n.length;else if(e.key===o)s=(i-1+n.length)%n.length;else return;e.preventDefault(),n[i].tabIndex=-1,n[s].tabIndex=0,n[s].focus()},[a,o]);return(0,b.jsxs)(`div`,{ref:r,role:`toolbar`,"aria-label":e,"aria-orientation":t,onKeyDown:e=>{i.onKeyDown(e),s(e)},onFocus:i.onFocus,onBlur:i.onBlur,style:{display:`inline-flex`,flexDirection:t===`vertical`?`column`:`row`,alignItems:t===`vertical`?`stretch`:`center`,gap:4,padding:8,borderRadius:8,background:`var(--color-background-muted)`},children:[n.map((e,n)=>(0,b.jsx)(`button`,{type:`button`,tabIndex:n===0?0:-1,style:{appearance:`none`,border:`none`,borderRadius:6,padding:`6px 12px`,background:`var(--color-background-popover)`,color:`var(--color-text-primary)`,font:`inherit`,textAlign:t===`vertical`?`start`:`center`,cursor:`pointer`},children:e},e)),i.hintElement]})}var y,b,x,S,C,w,T;t((()=>{y=e(n()),l(),g(),o(),c(),p(),h(),m(),b=i(),x={title:`Hooks/useKeyboardHint`,parameters:{layout:`centered`}},S={render:()=>(0,b.jsx)(s,{padding:4,children:(0,b.jsxs)(d,{gap:3,children:[(0,b.jsx)(r,{type:`body`,weight:`bold`,children:`Formatting`}),(0,b.jsx)(r,{type:`supporting`,color:`secondary`,children:`Tab into the toolbar with your keyboard — the hint appears once.`}),(0,b.jsx)(v,{label:`Formatting`,orientation:`horizontal`,items:[`Bold`,`Italic`,`Underline`]})]})})},C={render:()=>(0,b.jsx)(s,{padding:4,children:(0,b.jsxs)(d,{gap:3,children:[(0,b.jsx)(r,{type:`body`,weight:`bold`,children:`Navigation`}),(0,b.jsx)(r,{type:`supporting`,color:`secondary`,children:`Tab into the list — the vertical hint teaches ↑ ↓ navigation.`}),(0,b.jsx)(v,{label:`Sidebar navigation`,orientation:`vertical`,items:[`Overview`,`Reports`,`Settings`]})]})})},w={render:()=>(0,b.jsxs)(s,{style:{width:420},children:[(0,b.jsx)(_,{label:`Document actions`,startContent:(0,b.jsxs)(b.Fragment,{children:[(0,b.jsx)(a,{label:`Cut`,variant:`ghost`}),(0,b.jsx)(a,{label:`Copy`,variant:`ghost`}),(0,b.jsx)(a,{label:`Paste`,variant:`ghost`})]}),endContent:(0,b.jsx)(a,{label:`Settings`,variant:`ghost`})}),(0,b.jsx)(f,{children:(0,b.jsx)(r,{type:`supporting`,color:`secondary`,children:`Tab into the toolbar above — the arrow-key hint appears on first keyboard focus.`})})]})},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  render: () => <Card padding={4}>
      <VStack gap={3}>
        <Text type="body" weight="bold">
          Formatting
        </Text>
        <Text type="supporting" color="secondary">
          Tab into the toolbar with your keyboard — the hint appears once.
        </Text>
        <HintToolbar label="Formatting" orientation="horizontal" items={['Bold', 'Italic', 'Underline']} />
      </VStack>
    </Card>
}`,...S.parameters?.docs?.source},description:{story:`Tab into the toolbar to reveal the horizontal "← → to navigate" hint.`,...S.parameters?.docs?.description}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  render: () => <Card padding={4}>
      <VStack gap={3}>
        <Text type="body" weight="bold">
          Navigation
        </Text>
        <Text type="supporting" color="secondary">
          Tab into the list — the vertical hint teaches ↑ ↓ navigation.
        </Text>
        <HintToolbar label="Sidebar navigation" orientation="vertical" items={['Overview', 'Reports', 'Settings']} />
      </VStack>
    </Card>
}`,...C.parameters?.docs?.source},description:{story:`A vertical list (e.g. a sidebar nav) shows the "↑ ↓ to navigate" hint.`,...C.parameters?.docs?.description}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  render: () => <Card style={{
    width: 420
  }}>
      <Toolbar label="Document actions" startContent={<>
            <Button label="Cut" variant="ghost" />
            <Button label="Copy" variant="ghost" />
            <Button label="Paste" variant="ghost" />
          </>} endContent={<Button label="Settings" variant="ghost" />} />
      <Section>
        <Text type="supporting" color="secondary">
          Tab into the toolbar above — the arrow-key hint appears on first
          keyboard focus.
        </Text>
      </Section>
    </Card>
}`,...w.parameters?.docs?.source},description:{story:"The real `<Toolbar>` component wires `useKeyboardHint` in automatically — no\nextra wiring required. Tab into it to see the integrated behavior.",...w.parameters?.docs?.description}}},T=[`Default`,`Vertical`,`WithToolbar`]}))();export{S as Default,C as Vertical,w as WithToolbar,T as __namedExportsOrder,x as default};