import{i as e,s as t}from"./preload-helper-CT_b8DTk.js";import{t as n}from"./react-B7Te67-h.js";import{t as r}from"./jsx-runtime-DqZldVDK.js";import{t as i}from"./Text-DcvqruHA.js";import{t as a}from"./Button-DRsuCbq9.js";import{t as o}from"./Button-Cobaio5t.js";import{o as s,t as c}from"./BottomSheet-CEMh9aZV.js";import{n as l,t as u}from"./Item-inW3F_S_.js";import{t as d}from"./Heading-D4JL0yi2.js";import{i as f,t as p}from"./Stack-z0XX29Dq.js";import{t as m}from"./Section-D85u4pDY.js";import{t as h}from"./Section-DShsgwUR.js";import{n as g,t as _}from"./Text-BpOx_eh7.js";import{r as v,t as y}from"./src-e4bV1OzQ.js";function b(){return(0,S.jsxs)(f,{padding:4,gap:2,children:[(0,S.jsx)(d,{level:2,children:`Nearby places`}),w.map(e=>(0,S.jsx)(l,{label:e,description:`Open until 8pm`},e))]})}var x,S,C,w,T,E,D;e((()=>{x=t(n()),c(),o(),g(),u(),h(),p(),_(),y(),S=r(),C={title:`Lab/SheetOpenGesture`,tags:[`autodocs`],parameters:{layout:`fullscreen`,docs:{description:{component:`EXPLORATION. Opening a BottomSheet by dragging up from the page, rather than from the sheet (which is not on screen yet) or a button (which is a tap, not a drag).

**Touch only** — try it in a device viewport, or with touch emulation on. There is nothing to see with a mouse, by design: a sheet reachable only by dragging is unreachable by keyboard, by screen reader, and under WCAG 2.5.7. The button in each story is not a fallback, it is the primary way in; the gesture is the accelerator.`},story:{inline:!1,height:`620px`}}}},w=[`Blue Bottle Coffee`,`Dolores Park`,`Tartine Bakery`,`Bi-Rite Market`,`Zuni Café`,`The Castro Theatre`,`Alamo Square`,`Ferry Building`],T={render:function(){let[e,t]=(0,x.useState)(!1),{source:n}=v({enabled:!e});return(0,S.jsxs)(m,{padding:4,children:[(0,S.jsxs)(f,{gap:3,children:[(0,S.jsx)(d,{level:1,children:`Mission District`}),(0,S.jsx)(a,{label:`Nearby places`,onClick:()=>t(!0)}),(0,S.jsx)(i,{type:`supporting`,children:`Scroll to the bottom, then keep pulling up.`}),Array.from({length:24},(e,t)=>(0,S.jsxs)(i,{children:[`Paragraph `,t+1,` — filler so the page has an end to pull past.`]},t))]}),(0,S.jsx)(s,{label:`Nearby places`,isOpen:e,onOpenChange:t,dragSource:n,children:(0,S.jsx)(b,{})})]})}},E={render:function(){let[e,t]=(0,x.useState)(!1),{source:n,regionProps:r}=v({from:`element`,enabled:!e});return(0,S.jsxs)(m,{padding:4,children:[(0,S.jsxs)(f,{gap:3,children:[(0,S.jsx)(d,{level:1,children:`Mission District`}),(0,S.jsx)(i,{type:`supporting`,children:`Pull up from the bar at the bottom — anywhere else scrolls.`}),Array.from({length:24},(e,t)=>(0,S.jsxs)(i,{children:[`Paragraph `,t+1,` — an endless feed.`]},t))]}),(0,S.jsx)(`div`,{...r,style:{position:`fixed`,insetInline:0,insetBlockEnd:0,padding:12,background:`var(--color-background-surface)`,borderBlockStart:`1px solid var(--color-border-subtle)`},children:(0,S.jsx)(a,{label:`Nearby places`,width:`100%`,onClick:()=>t(!0)})}),(0,S.jsx)(s,{label:`Nearby places`,isOpen:e,onOpenChange:t,dragSource:n,children:(0,S.jsx)(b,{})})]})}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  render: function Render() {
    const [isOpen, setIsOpen] = useState(false);
    // Disabled while the sheet is up: from then on, a drag belongs to the
    // sheet's own gestures.
    const {
      source
    } = useSheetOpenGesture({
      enabled: !isOpen
    });
    return <Section padding={4}>
        <VStack gap={3}>
          <Heading level={1}>Mission District</Heading>
          <Button label="Nearby places" onClick={() => setIsOpen(true)} />
          <Text type="supporting">
            Scroll to the bottom, then keep pulling up.
          </Text>
          {Array.from({
          length: 24
        }, (_, index) => <Text key={index}>
              Paragraph {index + 1} — filler so the page has an end to pull
              past.
            </Text>)}
        </VStack>
        <BottomSheet label="Nearby places" isOpen={isOpen} onOpenChange={setIsOpen} dragSource={source}>
          <PlaceList />
        </BottomSheet>
      </Section>;
  }
}`,...T.parameters?.docs?.source},description:{story:`Scroll to the bottom of the page, then keep pulling up: the sheet comes with
the finger. Release near the top and it opens; let go early and it falls
back where it came from.

The end of the page is the one place an upward pull cannot be mistaken for
scrolling — there is no scroll left in that direction — so the gesture needs
no threshold beyond a few pixels of intent.`,...T.parameters?.docs?.description}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  render: function Render() {
    const [isOpen, setIsOpen] = useState(false);
    const {
      source,
      regionProps
    } = useSheetOpenGesture({
      from: 'element',
      enabled: !isOpen
    });
    return <Section padding={4}>
        <VStack gap={3}>
          <Heading level={1}>Mission District</Heading>
          <Text type="supporting">
            Pull up from the bar at the bottom — anywhere else scrolls.
          </Text>
          {Array.from({
          length: 24
        }, (_, index) => <Text key={index}>Paragraph {index + 1} — an endless feed.</Text>)}
        </VStack>

        <div {...regionProps} style={{
        position: 'fixed',
        insetInline: 0,
        insetBlockEnd: 0,
        padding: 12,
        background: 'var(--color-background-surface)',
        borderBlockStart: '1px solid var(--color-border-subtle)'
      }}>
          <Button label="Nearby places" width="100%" onClick={() => setIsOpen(true)} />
        </div>

        <BottomSheet label="Nearby places" isOpen={isOpen} onOpenChange={setIsOpen} dragSource={source}>
          <PlaceList />
        </BottomSheet>
      </Section>;
  }
}`,...E.parameters?.docs?.source},description:{story:`The same gesture, armed only inside a region the app marks — here a dock
pinned to the bottom of the screen. Use this shape when the page has no
natural end to pull past: a long feed, an infinite scroller, a map.

The dock is a button as well as a drag target, which is what keeps the
pattern reachable without the gesture.`,...E.parameters?.docs?.description}}},D=[`PullUpFromPageEnd`,`PullUpFromADock`]}))();export{E as PullUpFromADock,T as PullUpFromPageEnd,D as __namedExportsOrder,C as default};