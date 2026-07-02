import{ah as C,aK as I,aH as R,a1 as e,a6 as $,ay as B,a7 as U,T as t,B as W}from"./iframe-BzSUXdLu.js";import{C as D}from"./Card-C7aSz7BJ.js";import{H as P}from"./HStack-BldzXftl.js";import{V as u}from"./VStack-CRMVQTDp.js";import"./preload-helper-Ct5FWWRu.js";import"./container.stylex-uilBL6DE.js";import"./padding.stylex-Dl2_Pyt1.js";import"./Stack-Tj4_Mi0e.js";import"./stack.stylex-BlarxY2N.js";const s={interactive:{kVAEAm:"astryx1n2onr6",kkrTdU:"astryx1ypdohk",kybGjl:"astryx1hl2dhg",k1TLXF:null,kMnn75:null,kmVMDM:null,kNySMw:null,kMwMTN:"astryx1heor9g",kInvED:"astryx1hl8ikr",$$css:!0},focusWithin:{kRYL1X:"astryx1irc7jg",kry4t4:null,kf5QHk:null,kuo1qL:null,koJ47v:"astryxdjuwb3",$$css:!0},tint:{k1ekBW:"astryx15406qy",kIyJzY:"astryxuedmi6",kAMwcw:"astryxlr8y92",kWkggS:"astryxtop9rt astryxs215fl",$$css:!0},tintHoverOnPointer:{kpDt1e:"astryx1a38maj",$$css:!0},disabled:{kkrTdU:"astryx1h6gzvc",kSiTet:"astryxbyyjgo",$$css:!0}};function n({label:i,onClick:r,onMouseUp:h,href:m,target:k,isDisabled:a=!1,children:f,padding:w,variant:g="default",width:T,height:j,maxWidth:S,ref:N,xstyle:M,className:q,style:A,...V}){const b=C.useRef(null),y=C.useRef(null),O=I(),{onClick:E,onMouseUp:x}=R({containerRef:b,interactiveRef:y,onClick:r,href:m,target:k,disabled:a}),H=h?v=>{x(v),h(v)}:x,L=m!=null;return e.jsxs(D,{ref:U(N,b),width:T,height:j,maxWidth:S,padding:w,variant:g,...$(B("clickable-card",{variant:g}),{className:q,style:A}),xstyle:[s.interactive,s.focusWithin,!a&&s.tint,!a&&s.tintHoverOnPointer,a&&s.disabled,M],onClick:a?void 0:E,onMouseUp:a?void 0:H,...V,children:[L?e.jsx(O,{ref:y,href:m,target:k,"aria-label":i,"aria-disabled":a||void 0,tabIndex:a?-1:0,className:"astryx10l6tqk astryx1i1rx1s astryxjm9jq1 astryx1717udv astryxkdpibf astryxb3r6kr astryxzpqnlu astryxuxw1ft astryxc342km"}):e.jsx("button",{ref:y,type:"button","aria-label":i,disabled:a,onClick:r,className:"astryx10l6tqk astryx1i1rx1s astryxjm9jq1 astryx1717udv astryxkdpibf astryxb3r6kr astryxzpqnlu astryxuxw1ft astryxc342km"}),f]})}n.displayName="ClickableCard";n.__docgenInfo={description:`An interactive card that acts as a single navigation or action target.

Composes Card for visual styling and adds an interactive layer
with useClickableContainer. Nested interactive elements (buttons,
links, inputs) work independently — clicking them does NOT trigger
the card's onClick or navigation.

A visually-hidden <button> or <a> inside the card provides the
accessible role and label. The card surface is a plain <div> —
no role or tabIndex on the container.

@compositionHint Use for cards that navigate to a detail page or trigger an action.
For toggle selection cards, use SelectableCard instead.
Nest Button or other interactive elements freely inside — they won't conflict.

@example
\`\`\`
<ClickableCard label="Settings" href="/settings">
  <Text type="body" weight="bold">Settings</Text>
  <Text type="supporting" color="secondary">Manage your preferences</Text>
</ClickableCard>
\`\`\`

@example
\`\`\`
<ClickableCard label="Open modal" onClick={() => setShowModal(true)}>
  <Text type="body">Click anywhere to open</Text>
  <Button label="Other action" onClick={handleOther} />
</ClickableCard>
\`\`\``,methods:[],displayName:"ClickableCard",props:{xstyle:{required:!1,tsType:{name:"StyleXStyles"},description:"StyleX styles created via `stylex.create()`. Merged with the component's\nbase styles inside a single `stylex.props()` call for optimal deduplication.\n\n@example\n```\nconst overrides = stylex.create({ root: { marginBottom: 8 } });\n<Component xstyle={overrides.root} />\n```"},ref:{required:!1,tsType:{name:"Ref",elements:[{name:"HTMLDivElement"}],raw:"Ref<HTMLDivElement>"},description:"Ref forwarded to the root element."},label:{required:!0,tsType:{name:"string"},description:`Accessibility label for the card.
Used as \`aria-label\` — provides the accessible name for screen readers.
When the card has visible text that serves as its label, prefer
passing that text here so the screen reader announcement matches.`},onClick:{required:!1,tsType:{name:"signature",type:"function",raw:"(event: MouseEvent<HTMLElement>) => void",signature:{arguments:[{type:{name:"MouseEvent",elements:[{name:"HTMLElement"}],raw:"MouseEvent<HTMLElement>"},name:"event"}],return:{name:"void"}}},description:`Click handler. Fires when the card surface is clicked
(not when nested interactive elements are clicked).`},href:{required:!1,tsType:{name:"string"},description:`Navigation URL. When provided, clicking the card navigates to this URL.
Ctrl/Cmd+click opens in a new tab.`},target:{required:!1,tsType:{name:"string"},description:`Link target for href navigation.
@default '_self'`},isDisabled:{required:!1,tsType:{name:"boolean"},description:`Set to true to disable the card.
Disabled cards remain focusable (tabIndex 0) with aria-disabled
so screen reader users can discover them.`,defaultValue:{value:"false",computed:!1}},children:{required:!1,tsType:{name:"ReactNode"},description:`Content to render inside the card.
Can include nested interactive elements (buttons, links) — they will
work independently from the card's click/navigation behavior.`},padding:{required:!1,tsType:{name:"union",raw:"0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10",elements:[{name:"literal",value:"0"},{name:"literal",value:"0.5"},{name:"literal",value:"1"},{name:"literal",value:"1.5"},{name:"literal",value:"2"},{name:"literal",value:"3"},{name:"literal",value:"4"},{name:"literal",value:"5"},{name:"literal",value:"6"},{name:"literal",value:"8"},{name:"literal",value:"10"}]},description:`Internal padding of the card using the spacing scale.
@default 4 (16px)`},variant:{required:!1,tsType:{name:"union",raw:`| 'default'
| 'transparent'
| 'muted'
| 'blue'
| 'cyan'
| 'gray'
| 'green'
| 'orange'
| 'pink'
| 'purple'
| 'red'
| 'teal'
| 'yellow'`,elements:[{name:"literal",value:"'default'"},{name:"literal",value:"'transparent'"},{name:"literal",value:"'muted'"},{name:"literal",value:"'blue'"},{name:"literal",value:"'cyan'"},{name:"literal",value:"'gray'"},{name:"literal",value:"'green'"},{name:"literal",value:"'orange'"},{name:"literal",value:"'pink'"},{name:"literal",value:"'purple'"},{name:"literal",value:"'red'"},{name:"literal",value:"'teal'"},{name:"literal",value:"'yellow'"}]},description:`Background color variant.
@default 'default'`,defaultValue:{value:"'default'",computed:!1}},width:{required:!1,tsType:{name:"union",raw:"number | string",elements:[{name:"number"},{name:"string"}]},description:"Width of the card."},height:{required:!1,tsType:{name:"union",raw:"number | string",elements:[{name:"number"},{name:"string"}]},description:"Height of the card."},maxWidth:{required:!1,tsType:{name:"union",raw:"number | string",elements:[{name:"number"},{name:"string"}]},description:"Maximum width of the card."}},composes:["Omit"]};const Z={title:"Core/ClickableCard",component:n,tags:["autodocs"],argTypes:{variant:{control:"select",options:["default","transparent","muted","blue","cyan","gray","green","orange","pink","purple","red","teal","yellow"]}},parameters:{docs:{description:{component:"An interactive card for navigation or action targets. Nested interactive elements (buttons, links) work independently; clicking them does NOT trigger the card's onClick or navigation. Uses `useClickableContainer` internally."}}}},l={name:"Navigation (href)",render:()=>e.jsx(n,{label:"Settings",href:"/settings",width:300,children:e.jsxs(u,{gap:1,children:[e.jsx(t,{type:"body",weight:"bold",children:"Settings"}),e.jsx(t,{type:"supporting",color:"secondary",children:"Manage your preferences"})]})}),parameters:{docs:{description:{story:"Card with `href`: clicking navigates. Ctrl/Cmd+click opens new tab. Middle-click opens new tab."}}}},o={name:"Action (onClick)",render:()=>e.jsx(n,{label:"Open modal",onClick:()=>alert("Card clicked!"),width:300,children:e.jsxs(u,{gap:1,children:[e.jsx(t,{type:"body",weight:"bold",children:"Click me"}),e.jsx(t,{type:"supporting",color:"secondary",children:"Opens a modal"})]})}),parameters:{docs:{description:{story:"Card with `onClick`: fires the handler when the card surface is clicked."}}}},d={name:"Nested Interactive Elements",render:()=>e.jsx(n,{label:"Product card",href:"/product/123",width:300,children:e.jsxs(u,{gap:2,children:[e.jsx(t,{type:"body",weight:"bold",children:"Product Name"}),e.jsx(t,{type:"supporting",color:"secondary",children:"$29.99"}),e.jsx(W,{label:"Add to cart",onClick:()=>alert("Added to cart! (card did NOT navigate)"),variant:"primary"})]})}),parameters:{docs:{description:{story:'The key feature: nested buttons/links work independently. Clicking "Add to cart" fires its own handler without triggering card navigation. This is handled by `useClickableContainer` which checks `hasInteractiveAncestor` on each click.'}}}},c={render:()=>e.jsx(n,{label:"Disabled card",onClick:()=>{},isDisabled:!0,width:300,children:e.jsxs(u,{gap:1,children:[e.jsx(t,{type:"body",weight:"bold",children:"Disabled"}),e.jsx(t,{type:"supporting",color:"secondary",children:"This card cannot be clicked"})]})}),parameters:{docs:{description:{story:"`isDisabled` suppresses click, hover, focus, and sets `aria-disabled`. `tabIndex` becomes -1."}}}},p={name:"Color Variants",render:()=>{const i=["default","muted","transparent","blue","cyan","gray","green","orange","pink","purple","red","teal","yellow"];return e.jsx(P,{gap:3,wrap:"wrap",children:i.map(r=>e.jsx(n,{label:r,onClick:()=>alert(r),variant:r,width:140,children:e.jsx(t,{type:"body",weight:"bold",children:r})},r))})},parameters:{docs:{description:{story:"All color variants: same palette as Card. Color cards have transparent borders."}}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  name: 'Navigation (href)',
  render: () => <ClickableCard label="Settings" href="/settings" width={300}>
      <VStack gap={1}>
        <Text type="body" weight="bold">
          Settings
        </Text>
        <Text type="supporting" color="secondary">
          Manage your preferences
        </Text>
      </VStack>
    </ClickableCard>,
  parameters: {
    docs: {
      description: {
        story: 'Card with \`href\`: clicking navigates. Ctrl/Cmd+click opens new tab. Middle-click opens new tab.'
      }
    }
  }
}`,...l.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  name: 'Action (onClick)',
  render: () => <ClickableCard label="Open modal" onClick={() => alert('Card clicked!')} width={300}>
      <VStack gap={1}>
        <Text type="body" weight="bold">
          Click me
        </Text>
        <Text type="supporting" color="secondary">
          Opens a modal
        </Text>
      </VStack>
    </ClickableCard>,
  parameters: {
    docs: {
      description: {
        story: 'Card with \`onClick\`: fires the handler when the card surface is clicked.'
      }
    }
  }
}`,...o.parameters?.docs?.source}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  name: 'Nested Interactive Elements',
  render: () => <ClickableCard label="Product card" href="/product/123" width={300}>
      <VStack gap={2}>
        <Text type="body" weight="bold">
          Product Name
        </Text>
        <Text type="supporting" color="secondary">
          $29.99
        </Text>
        <Button label="Add to cart" onClick={() => alert('Added to cart! (card did NOT navigate)')} variant="primary" />
      </VStack>
    </ClickableCard>,
  parameters: {
    docs: {
      description: {
        story: 'The key feature: nested buttons/links work independently. ' + 'Clicking "Add to cart" fires its own handler without triggering card navigation. ' + 'This is handled by \`useClickableContainer\` which checks \`hasInteractiveAncestor\` on each click.'
      }
    }
  }
}`,...d.parameters?.docs?.source}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  render: () => <ClickableCard label="Disabled card" onClick={() => {}} isDisabled width={300}>
      <VStack gap={1}>
        <Text type="body" weight="bold">
          Disabled
        </Text>
        <Text type="supporting" color="secondary">
          This card cannot be clicked
        </Text>
      </VStack>
    </ClickableCard>,
  parameters: {
    docs: {
      description: {
        story: '\`isDisabled\` suppresses click, hover, focus, and sets \`aria-disabled\`. \`tabIndex\` becomes -1.'
      }
    }
  }
}`,...c.parameters?.docs?.source}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  name: 'Color Variants',
  render: () => {
    const variants = ['default', 'muted', 'transparent', 'blue', 'cyan', 'gray', 'green', 'orange', 'pink', 'purple', 'red', 'teal', 'yellow'] as const;
    return <HStack gap={3} wrap="wrap">
        {variants.map(v => <ClickableCard key={v} label={v} onClick={() => alert(v)} variant={v} width={140}>
            <Text type="body" weight="bold">
              {v}
            </Text>
          </ClickableCard>)}
      </HStack>;
  },
  parameters: {
    docs: {
      description: {
        story: 'All color variants: same palette as Card. Color cards have transparent borders.'
      }
    }
  }
}`,...p.parameters?.docs?.source}}};const ee=["Navigation","WithOnClick","NestedButton","Disabled","ColorVariants"];export{p as ColorVariants,c as Disabled,l as Navigation,d as NestedButton,o as WithOnClick,ee as __namedExportsOrder,Z as default};
