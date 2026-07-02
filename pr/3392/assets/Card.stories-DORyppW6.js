import{a1 as e,B as j}from"./iframe-BAsU9Dt9.js";import{C as a}from"./Card-CXFY5Npx.js";import{S as t}from"./Section-Cvqg1BuI.js";import{L as S,b as C}from"./LayoutContent-ChJ31-Gp.js";import{L as w}from"./LayoutHeader-DmVBw398.js";import{L as f}from"./LayoutFooter-DIfPB8Wy.js";import{V as s}from"./VStack-DJ3kH3RZ.js";import{H as r}from"./Heading-aDohXlb0.js";import{H as k}from"./HStack-DcM5fpvG.js";import"./preload-helper-Ct5FWWRu.js";import"./container.stylex-uilBL6DE.js";import"./padding.stylex-Dl2_Pyt1.js";import"./stack.stylex-BlarxY2N.js";import"./stackItem.stylex-CgqrJM4N.js";import"./Stack-CKRWU4oS.js";const R={title:"Core/Card",component:a,tags:["autodocs"],decorators:[n=>e.jsx("div",{className:"x1eiddq6 x1gt495",children:e.jsx(n,{})})],argTypes:{width:{control:{type:"range",min:100,max:800,step:10},description:"Width in pixels"},height:{control:{type:"range",min:100,max:600,step:10},description:"Height in pixels"},maxWidth:{control:{type:"range",min:100,max:800,step:10},description:"Maximum width in pixels"},minHeight:{control:{type:"range",min:100,max:600,step:10},description:"Minimum height in pixels"}}},c={args:{width:300},render:n=>e.jsx(a,{...n,children:e.jsx("p",{className:"x9ynric x1tgivj0 x1ghz6dp",children:"Simple content inside a card. The card provides default padding via the --container-padding CSS variable."})})},o={render:()=>e.jsx(a,{width:320,children:e.jsxs(s,{gap:2,children:[e.jsx(r,{level:3,children:"Card Title"}),e.jsx("p",{className:"x9ynric x1ghz6dp xv1l7n4 xif65rj",children:"This card contains simple content without Layout. The container padding is applied automatically."})]})})},p={render:()=>e.jsx(a,{width:350,children:e.jsx(S,{header:e.jsx(w,{hasDivider:!0,children:e.jsx(r,{level:3,children:"Card with Layout"})}),content:e.jsx(C,{children:e.jsx("p",{className:"x9ynric x1ghz6dp xv1l7n4 xif65rj",children:"When using Layout, the layout uses negative margin to escape the container padding, then manages its own padding."})}),footer:e.jsx(f,{hasDivider:!0,children:e.jsxs(k,{gap:2,hAlign:"end",children:[e.jsx(j,{label:"Cancel",variant:"secondary",children:"Cancel"}),e.jsx(j,{label:"Save",variant:"primary",children:"Save"})]})})})})},h={render:()=>e.jsxs("div",{className:"x78zum5 x1qh66ti x1a02dak",children:[e.jsxs("div",{children:[e.jsx("h4",{className:"xrcdmg7 x9ynric xif65rj xv1l7n4",children:"Small (200px)"}),e.jsx(a,{width:200,children:e.jsx("p",{className:"x9ynric x1tgivj0 x1ghz6dp",children:"Small card"})})]}),e.jsxs("div",{children:[e.jsx("h4",{className:"xrcdmg7 x9ynric xif65rj xv1l7n4",children:"Medium (300px)"}),e.jsx(a,{width:300,children:e.jsx("p",{className:"x9ynric x1tgivj0 x1ghz6dp",children:"Medium card"})})]}),e.jsxs("div",{children:[e.jsx("h4",{className:"xrcdmg7 x9ynric xif65rj xv1l7n4",children:"Large (400px)"}),e.jsx(a,{width:400,children:e.jsx("p",{className:"x9ynric x1tgivj0 x1ghz6dp",children:"Large card"})})]})]})},x={render:()=>e.jsx(a,{width:300,height:200,children:e.jsx(S,{header:e.jsx(w,{hasDivider:!0,children:e.jsx(r,{level:3,children:"Fixed Height Card"})}),content:e.jsx(C,{children:e.jsx("p",{className:"x9ynric x1ghz6dp xv1l7n4 xif65rj",children:"This card has a fixed height. Content area will scroll if needed."})})})})},g={render:()=>e.jsx(a,{width:400,children:e.jsxs(s,{gap:3,children:[e.jsx(r,{level:3,children:"Parent Card"}),e.jsx(a,{width:"100%",children:e.jsx("p",{className:"x9ynric x1ghz6dp xv1l7n4 xif65rj",children:"Nested card resets --container-padding and gets its own padding."})}),e.jsx(a,{width:"100%",children:e.jsx("p",{className:"x9ynric x1ghz6dp xv1l7n4 xif65rj",children:"Another nested card with independent padding."})})]})})},y={render:()=>e.jsxs(a,{width:400,children:[e.jsx(t,{variant:"transparent",dividers:["bottom"],children:e.jsxs(s,{gap:2,children:[e.jsx(r,{level:3,children:"First Section"}),e.jsx("p",{className:"x9ynric x1ghz6dp xv1l7n4 xif65rj",children:"This section escapes the card padding on top and sides because it's the first child."})]})}),e.jsx(t,{variant:"transparent",dividers:["bottom"],children:e.jsxs(s,{gap:2,children:[e.jsx(r,{level:3,children:"Middle Section"}),e.jsx("p",{className:"x9ynric x1ghz6dp xv1l7n4 xif65rj",children:"Middle sections only escape horizontal padding, maintaining visual separation from adjacent sections."})]})}),e.jsx(t,{variant:"transparent",children:e.jsxs(s,{gap:2,children:[e.jsx(r,{level:3,children:"Last Section"}),e.jsx("p",{className:"x9ynric x1ghz6dp xv1l7n4 xif65rj",children:"This section escapes the card padding on bottom and sides because it's the last child."})]})})]})},m={render:()=>e.jsx(a,{width:350,children:e.jsx(t,{variant:"muted",children:e.jsxs(s,{gap:2,children:[e.jsx(r,{level:3,children:"Only Section (Full Bleed All Sides)"}),e.jsx("p",{className:"x9ynric x1ghz6dp xv1l7n4 xif65rj",children:"When a section is both first and last child, it gets full bleed on all four sides, completely filling the card."})]})})})},u={render:()=>e.jsxs("div",{className:"x78zum5 x1qh66ti x1a02dak",children:[e.jsxs("div",{children:[e.jsx("h4",{className:"xrcdmg7 x9ynric xif65rj xv1l7n4",children:"Simple Content"}),e.jsx(a,{width:250,children:e.jsxs(s,{gap:2,children:[e.jsx(r,{level:3,children:"Card Title"}),e.jsx("p",{className:"x9ynric x1ghz6dp xv1l7n4 xif65rj",children:"Regular content uses the card's container padding."})]})})]}),e.jsxs("div",{children:[e.jsx("h4",{className:"xrcdmg7 x9ynric xif65rj xv1l7n4",children:"With Section"}),e.jsx(a,{width:250,children:e.jsx(t,{variant:"muted",children:e.jsxs(s,{gap:2,children:[e.jsx(r,{level:3,children:"Card Title"}),e.jsx("p",{className:"x9ynric x1ghz6dp xv1l7n4 xif65rj",children:"Section content bleeds to the card edges."})]})})})]})]})},v={render:()=>e.jsxs("div",{className:"x78zum5 x1qh66ti x1a02dak",children:[e.jsxs("div",{children:[e.jsx("h4",{className:"xrcdmg7 x9ynric xif65rj xv1l7n4",children:"Default (with padding)"}),e.jsx(a,{width:250,children:e.jsx("div",{style:{backgroundColor:"rgba(0,100,200,0.2)",padding:8},children:e.jsx("p",{className:"x9ynric x1tgivj0 x1ghz6dp",children:"Content with card padding"})})})]}),e.jsxs("div",{children:[e.jsx("h4",{className:"xrcdmg7 x9ynric xif65rj xv1l7n4",children:"Full Bleed (no padding)"}),e.jsx(a,{width:250,padding:0,children:e.jsx("div",{style:{backgroundColor:"rgba(0,100,200,0.2)",padding:8},children:e.jsx("p",{className:"x9ynric x1tgivj0 x1ghz6dp",children:"Content touches card edges"})})})]})]})},d={decorators:[n=>e.jsx(n,{})],render:()=>e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:0},children:[e.jsxs("div",{className:"x1eiddq6 x1gt495",children:[e.jsx("h4",{className:"xrcdmg7 x9ynric xif65rj xv1l7n4",children:"Cards on wash background"}),e.jsxs("div",{className:"x78zum5 x1qh66ti x1a02dak",children:[e.jsx(a,{width:250,children:e.jsxs(s,{gap:2,children:[e.jsx(r,{level:3,children:"Card on Wash"}),e.jsx("p",{className:"x9ynric x1ghz6dp xv1l7n4 xif65rj",children:"Cards stand out clearly against the wash background, creating a layered visual hierarchy."})]})}),e.jsx(a,{width:250,children:e.jsxs(s,{gap:2,children:[e.jsx(r,{level:3,children:"Another Card"}),e.jsx("p",{className:"x9ynric x1ghz6dp xv1l7n4 xif65rj",children:"Multiple cards on wash create a dashboard-like layout."})]})})]})]}),e.jsxs(t,{variant:"section",width:"100%",children:[e.jsx("h4",{className:"xrcdmg7 x9ynric xif65rj xv1l7n4",children:"Cards on surface section"}),e.jsxs("div",{className:"x78zum5 x1qh66ti x1a02dak",children:[e.jsx(a,{width:250,children:e.jsxs(s,{gap:2,children:[e.jsx(r,{level:3,children:"Card on Surface"}),e.jsx("p",{className:"x9ynric x1ghz6dp xv1l7n4 xif65rj",children:"On a surface background, cards are more subtle since both share the same base color."})]})}),e.jsx(a,{width:250,children:e.jsxs(s,{gap:2,children:[e.jsx(r,{level:3,children:"Another Card"}),e.jsx("p",{className:"x9ynric x1ghz6dp xv1l7n4 xif65rj",children:"The card border provides separation from the surface."})]})})]})]})]})},i={render:()=>e.jsxs("div",{className:"x78zum5 x1qh66ti x1a02dak",children:[e.jsx(a,{width:350,variant:"muted",children:e.jsxs(s,{gap:2,children:[e.jsx(r,{level:3,children:"💡 Tip"}),e.jsxs("p",{className:"x9ynric x1ghz6dp xv1l7n4 xif65rj",children:["Use ",e.jsx("code",{children:'variant="muted"'})," for callouts, tips, or highlighted information. The muted background provides visual contrast without needing a nested section."]})]})}),e.jsx(a,{width:350,variant:"muted",children:e.jsxs(s,{gap:2,children:[e.jsx(r,{level:3,children:"⚠️ Warning"}),e.jsx("p",{className:"x9ynric x1ghz6dp xv1l7n4 xif65rj",children:"Muted cards work well for alerts and warnings too."})]})})]})},l={render:()=>e.jsx("div",{className:"x78zum5 x1qh66ti x1a02dak",children:["default","muted","blue","cyan","gray","green","orange","pink","purple","red","teal","yellow"].map(n=>e.jsxs("div",{children:[e.jsx("h4",{className:"xrcdmg7 x9ynric xif65rj xv1l7n4",children:n}),e.jsx(a,{width:160,variant:n,children:e.jsx("p",{className:"x9ynric x1tgivj0 x1ghz6dp",children:n})})]},n))})};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    width: 300
  },
  render: args => <Card {...args}>
      <p {...stylex.props(styles.text)}>
        Simple content inside a card. The card provides default padding via the
        --container-padding CSS variable.
      </p>
    </Card>
}`,...c.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  render: () => <Card width={320}>
      <VStack gap={2}>
        <Heading level={3}>Card Title</Heading>
        <p {...stylex.props(styles.text, styles.textSecondary)}>
          This card contains simple content without Layout. The container
          padding is applied automatically.
        </p>
      </VStack>
    </Card>
}`,...o.parameters?.docs?.source}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  render: () => <Card width={350}>
      <Layout header={<LayoutHeader hasDivider>
            <Heading level={3}>Card with Layout</Heading>
          </LayoutHeader>} content={<LayoutContent>
            <p {...stylex.props(styles.text, styles.textSecondary)}>
              When using Layout, the layout uses negative margin to escape
              the container padding, then manages its own padding.
            </p>
          </LayoutContent>} footer={<LayoutFooter hasDivider>
            <HStack gap={2} hAlign="end">
              <Button label="Cancel" variant="secondary">
                Cancel
              </Button>
              <Button label="Save" variant="primary">
                Save
              </Button>
            </HStack>
          </LayoutFooter>} />
    </Card>
}`,...p.parameters?.docs?.source}}};h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  render: () => <div {...stylex.props(styles.storyWrapper)}>
      <div>
        <h4 {...stylex.props(styles.heading)}>Small (200px)</h4>
        <Card width={200}>
          <p {...stylex.props(styles.text)}>Small card</p>
        </Card>
      </div>
      <div>
        <h4 {...stylex.props(styles.heading)}>Medium (300px)</h4>
        <Card width={300}>
          <p {...stylex.props(styles.text)}>Medium card</p>
        </Card>
      </div>
      <div>
        <h4 {...stylex.props(styles.heading)}>Large (400px)</h4>
        <Card width={400}>
          <p {...stylex.props(styles.text)}>Large card</p>
        </Card>
      </div>
    </div>
}`,...h.parameters?.docs?.source}}};x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  render: () => <Card width={300} height={200}>
      <Layout header={<LayoutHeader hasDivider>
            <Heading level={3}>Fixed Height Card</Heading>
          </LayoutHeader>} content={<LayoutContent>
            <p {...stylex.props(styles.text, styles.textSecondary)}>
              This card has a fixed height. Content area will scroll if needed.
            </p>
          </LayoutContent>} />
    </Card>
}`,...x.parameters?.docs?.source}}};g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  render: () => <Card width={400}>
      <VStack gap={3}>
        <Heading level={3}>Parent Card</Heading>
        <Card width="100%">
          <p {...stylex.props(styles.text, styles.textSecondary)}>
            Nested card resets --container-padding and gets its own padding.
          </p>
        </Card>
        <Card width="100%">
          <p {...stylex.props(styles.text, styles.textSecondary)}>
            Another nested card with independent padding.
          </p>
        </Card>
      </VStack>
    </Card>
}`,...g.parameters?.docs?.source}}};y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  render: () => <Card width={400}>
      <Section variant="transparent" dividers={['bottom']}>
        <VStack gap={2}>
          <Heading level={3}>First Section</Heading>
          <p {...stylex.props(styles.text, styles.textSecondary)}>
            This section escapes the card padding on top and sides because it's
            the first child.
          </p>
        </VStack>
      </Section>
      <Section variant="transparent" dividers={['bottom']}>
        <VStack gap={2}>
          <Heading level={3}>Middle Section</Heading>
          <p {...stylex.props(styles.text, styles.textSecondary)}>
            Middle sections only escape horizontal padding, maintaining visual
            separation from adjacent sections.
          </p>
        </VStack>
      </Section>
      <Section variant="transparent">
        <VStack gap={2}>
          <Heading level={3}>Last Section</Heading>
          <p {...stylex.props(styles.text, styles.textSecondary)}>
            This section escapes the card padding on bottom and sides because
            it's the last child.
          </p>
        </VStack>
      </Section>
    </Card>
}`,...y.parameters?.docs?.source}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  render: () => <Card width={350}>
      <Section variant="muted">
        <VStack gap={2}>
          <Heading level={3}>Only Section (Full Bleed All Sides)</Heading>
          <p {...stylex.props(styles.text, styles.textSecondary)}>
            When a section is both first and last child, it gets full bleed on
            all four sides, completely filling the card.
          </p>
        </VStack>
      </Section>
    </Card>
}`,...m.parameters?.docs?.source}}};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  render: () => <div {...stylex.props(styles.storyWrapper)}>
      <div>
        <h4 {...stylex.props(styles.heading)}>Simple Content</h4>
        <Card width={250}>
          <VStack gap={2}>
            <Heading level={3}>Card Title</Heading>
            <p {...stylex.props(styles.text, styles.textSecondary)}>
              Regular content uses the card's container padding.
            </p>
          </VStack>
        </Card>
      </div>
      <div>
        <h4 {...stylex.props(styles.heading)}>With Section</h4>
        <Card width={250}>
          <Section variant="muted">
            <VStack gap={2}>
              <Heading level={3}>Card Title</Heading>
              <p {...stylex.props(styles.text, styles.textSecondary)}>
                Section content bleeds to the card edges.
              </p>
            </VStack>
          </Section>
        </Card>
      </div>
    </div>
}`,...u.parameters?.docs?.source}}};v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  render: () => <div {...stylex.props(styles.storyWrapper)}>
      <div>
        <h4 {...stylex.props(styles.heading)}>Default (with padding)</h4>
        <Card width={250}>
          <div style={{
          backgroundColor: 'rgba(0,100,200,0.2)',
          padding: 8
        }}>
            <p {...stylex.props(styles.text)}>Content with card padding</p>
          </div>
        </Card>
      </div>
      <div>
        <h4 {...stylex.props(styles.heading)}>Full Bleed (no padding)</h4>
        <Card width={250} padding={0}>
          <div style={{
          backgroundColor: 'rgba(0,100,200,0.2)',
          padding: 8
        }}>
            <p {...stylex.props(styles.text)}>Content touches card edges</p>
          </div>
        </Card>
      </div>
    </div>
}`,...v.parameters?.docs?.source}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  decorators: [Story => <Story />],
  render: () => <div style={{
    display: 'flex',
    flexDirection: 'column',
    gap: 0
  }}>
      <div {...stylex.props(styles.pageWrapper)}>
        <h4 {...stylex.props(styles.heading)}>Cards on wash background</h4>
        <div {...stylex.props(styles.storyWrapper)}>
          <Card width={250}>
            <VStack gap={2}>
              <Heading level={3}>Card on Wash</Heading>
              <p {...stylex.props(styles.text, styles.textSecondary)}>
                Cards stand out clearly against the wash background, creating a
                layered visual hierarchy.
              </p>
            </VStack>
          </Card>
          <Card width={250}>
            <VStack gap={2}>
              <Heading level={3}>Another Card</Heading>
              <p {...stylex.props(styles.text, styles.textSecondary)}>
                Multiple cards on wash create a dashboard-like layout.
              </p>
            </VStack>
          </Card>
        </div>
      </div>
      <Section variant="section" width="100%">
        <h4 {...stylex.props(styles.heading)}>Cards on surface section</h4>
        <div {...stylex.props(styles.storyWrapper)}>
          <Card width={250}>
            <VStack gap={2}>
              <Heading level={3}>Card on Surface</Heading>
              <p {...stylex.props(styles.text, styles.textSecondary)}>
                On a surface background, cards are more subtle since both share
                the same base color.
              </p>
            </VStack>
          </Card>
          <Card width={250}>
            <VStack gap={2}>
              <Heading level={3}>Another Card</Heading>
              <p {...stylex.props(styles.text, styles.textSecondary)}>
                The card border provides separation from the surface.
              </p>
            </VStack>
          </Card>
        </div>
      </Section>
    </div>
}`,...d.parameters?.docs?.source},description:{story:`Cards shown on top of different background treatments.
Demonstrates the visual contrast between cards on wash (gray)
backgrounds vs surface (white) backgrounds.`,...d.parameters?.docs?.description}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  render: () => <div {...stylex.props(styles.storyWrapper)}>
      <Card width={350} variant="muted">
        <VStack gap={2}>
          <Heading level={3}>💡 Tip</Heading>
          <p {...stylex.props(styles.text, styles.textSecondary)}>
            Use <code>variant="muted"</code> for callouts, tips, or highlighted
            information. The muted background provides visual contrast without
            needing a nested section.
          </p>
        </VStack>
      </Card>
      <Card width={350} variant="muted">
        <VStack gap={2}>
          <Heading level={3}>⚠️ Warning</Heading>
          <p {...stylex.props(styles.text, styles.textSecondary)}>
            Muted cards work well for alerts and warnings too.
          </p>
        </VStack>
      </Card>
    </div>
}`,...i.parameters?.docs?.source},description:{story:'Callout card: a muted card used as a callout/highlight area.\nUses `variant="muted"` directly on Card instead of wrapping content\nin a wash section — simpler and semantically cleaner.',...i.parameters?.docs?.description}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  render: () => <div {...stylex.props(styles.storyWrapper)}>
      {(['default', 'muted', 'blue', 'cyan', 'gray', 'green', 'orange', 'pink', 'purple', 'red', 'teal', 'yellow'] as const).map(variant => <div key={variant}>
          <h4 {...stylex.props(styles.heading)}>{variant}</h4>
          <Card width={160} variant={variant}>
            <p {...stylex.props(styles.text)}>{variant}</p>
          </Card>
        </div>)}
    </div>
}`,...l.parameters?.docs?.source},description:{story:"All background color variants in one view.\n`muted` uses the wash background for de-emphasised cards;\nthe non-semantic variants use the `--color-<name>-background` token.",...l.parameters?.docs?.description}}};const U=["Default","WithSimpleContent","WithInnerLayout","Sizes","FixedHeight","NestedCards","NestedSections","SingleSection","MixedContent","FullBleed","OnBackgrounds","Callout","ColorVariants"];export{i as Callout,l as ColorVariants,c as Default,x as FixedHeight,v as FullBleed,u as MixedContent,g as NestedCards,y as NestedSections,d as OnBackgrounds,m as SingleSection,h as Sizes,p as WithInnerLayout,o as WithSimpleContent,U as __namedExportsOrder,R as default};
