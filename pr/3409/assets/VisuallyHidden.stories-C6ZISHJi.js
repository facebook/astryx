import{ah as u,a1 as e,T as s,B as h}from"./iframe-Z8EfSKmM.js";import{C as c}from"./Card-37yLdr68.js";import{S as l}from"./Section-BDcsQa2U.js";import{V as p}from"./VStack-Y5owLsEt.js";import"./preload-helper-Ct5FWWRu.js";import"./container.stylex-uilBL6DE.js";import"./padding.stylex-Dl2_Pyt1.js";import"./Stack-zPlvthC6.js";import"./stack.stylex-BlarxY2N.js";function n({children:t,as:o="span",ref:d,...m}){return u.createElement(o,{ref:d,...m,className:"astryx10l6tqk astryx1i1rx1s astryxjm9jq1 astryxkdpibf astryx1717udv astryxb3r6kr astryxzpqnlu astryxuxw1ft astryxng3xce astryx13vifvy astryx1o0tod astryx47corl astryx87ps6o"},t)}n.displayName="VisuallyHidden";n.__docgenInfo={description:`Renders its children in the accessibility tree while hiding them visually.

Use for content that assistive technology must perceive but sighted users
should not see: accessible names for icon-only controls, \`aria-live\`
announcement regions, and supplementary screen-reader context.

@example
\`\`\`
// Accessible name for an icon-only button
<IconButton icon="trash" label="">
  <VisuallyHidden>Delete incident</VisuallyHidden>
</IconButton>

// Live region for announcements
<VisuallyHidden as="div" aria-live="polite">
  {\`Moved \${task} to \${column}\`}
</VisuallyHidden>
\`\`\``,methods:[],displayName:"VisuallyHidden",props:{ref:{required:!1,tsType:{name:"ReactRef",raw:"React.Ref<HTMLElement>",elements:[{name:"HTMLElement"}]},description:"Ref forwarded to the rendered element."},children:{required:!0,tsType:{name:"ReactNode"},description:"Content to expose to assistive technology while hidden from sight."},as:{required:!1,tsType:{name:"ElementType"},description:"HTML tag to render as. Defaults to `'span'` (inline) for the common\nicon-label case; pass a block element such as `'div'` when wrapping block\ncontent or hosting an `aria-live` region. This is a structural choice, not\na visual one.\n\n@default 'span'",defaultValue:{value:"'span'",computed:!1}}},composes:["Omit"]};const H={title:"Core/VisuallyHidden",component:n,tags:["autodocs"],argTypes:{children:{control:"text",description:"Content exposed to assistive technology while hidden"},as:{control:"text",description:"HTML tag to render as (default 'span')"}}},r={args:{children:"This text is only announced to screen readers"},render:t=>e.jsx(l,{variant:"muted",children:e.jsx(c,{children:e.jsxs(p,{gap:3,children:[e.jsx(s,{type:"body",children:"There is visually-hidden text below this line. Inspect the DOM or use a screen reader to perceive it."}),e.jsx(n,{...t}),e.jsx(s,{type:"body",color:"secondary",children:"(nothing visible renders between the two paragraphs)"})]})})})},a={render:()=>e.jsx(l,{variant:"muted",children:e.jsx(c,{children:e.jsxs(p,{gap:2,align:"start",children:[e.jsxs(s,{type:"body",children:["Read more"," ",e.jsxs("a",{href:"https://example.com",children:["here",e.jsx(n,{children:" about accessibility primitives"})]})]}),e.jsx(s,{type:"body",color:"secondary",children:"The link is announced as “here about accessibility primitives”, so it is not an ambiguous “here” out of context."})]})})})},i={render:()=>e.jsx(y,{})};function y(){const[t,o]=u.useState(0);return e.jsx(l,{variant:"muted",children:e.jsx(c,{children:e.jsxs(p,{gap:3,align:"start",children:[e.jsx(s,{type:"body",children:"Activating the button updates a polite live region that a screen reader announces."}),e.jsx(h,{label:"Add item",onClick:()=>o(d=>d+1)}),e.jsxs(s,{type:"body",color:"secondary",children:["Items added: ",t]}),e.jsx(n,{as:"div",role:"status","aria-live":"polite",children:t>0?`${t} item${t===1?"":"s"} added`:""})]})})})}r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    children: 'This text is only announced to screen readers'
  },
  render: args => <Section variant="muted">
      <Card>
        <VStack gap={3}>
          <Text type="body">
            There is visually-hidden text below this line. Inspect the DOM or
            use a screen reader to perceive it.
          </Text>
          <VisuallyHidden {...args} />
          <Text type="body" color="secondary">
            (nothing visible renders between the two paragraphs)
          </Text>
        </VStack>
      </Card>
    </Section>
}`,...r.parameters?.docs?.source}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  render: () => <Section variant="muted">
      <Card>
        <VStack gap={2} align="start">
          <Text type="body">
            Read more{' '}
            <a href="https://example.com">
              here
              <VisuallyHidden> about accessibility primitives</VisuallyHidden>
            </a>
          </Text>
          <Text type="body" color="secondary">
            The link is announced as “here about accessibility primitives”, so
            it is not an ambiguous “here” out of context.
          </Text>
        </VStack>
      </Card>
    </Section>
}`,...a.parameters?.docs?.source}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  render: () => <LiveRegionDemo />
}`,...i.parameters?.docs?.source}}};const k=["Default","SupplementaryContext","LiveRegion"];export{r as Default,i as LiveRegion,a as SupplementaryContext,k as __namedExportsOrder,H as default};
