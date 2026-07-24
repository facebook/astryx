import{i as e}from"./preload-helper-CT_b8DTk.js";import{r as t,t as n}from"./LayoutContent-CuPavk6w.js";import{t as r}from"./LayoutHeader-By1G-oXd.js";import{t as i}from"./jsx-runtime-DqZldVDK.js";import{t as a}from"./Button-BBk5Kqd0.js";import{t as o}from"./Button-CRpvXAU4.js";import{n as s,t as c}from"./Card-B6hq5pd9.js";import{t as l}from"./Heading-D-Ri_Mjs.js";import{i as u,o as d}from"./Stack-C7dTtCDZ.js";import{t as f}from"./Section-uPZCRnkC.js";import{t as p}from"./Section-C4pDrmx1.js";import{t as m}from"./LayoutFooter-B6HT_w7L.js";import{t as h}from"./Layout-BvMyrLFX.js";import{t as g}from"./Text-BUJwo4gL.js";var _,v,y,b,x,S,C,w,T,E,D,O,k,A,j,M,N;e((()=>{c(),p(),h(),o(),g(),_=i(),v={title:`Core/Card`,component:s,tags:[`autodocs`],decorators:[e=>(0,_.jsx)(`div`,{className:`x1eiddq6 x1gt495`,children:(0,_.jsx)(e,{})})],argTypes:{width:{control:{type:`range`,min:100,max:800,step:10},description:`Width in pixels`},height:{control:{type:`range`,min:100,max:600,step:10},description:`Height in pixels`},maxWidth:{control:{type:`range`,min:100,max:800,step:10},description:`Maximum width in pixels`},minHeight:{control:{type:`range`,min:100,max:600,step:10},description:`Minimum height in pixels`},elevation:{control:{type:`inline-radio`},options:[`none`,`low`,`med`,`high`],description:`Resting shadow depth`}}},y={args:{width:300},render:e=>(0,_.jsx)(s,{...e,children:(0,_.jsx)(`p`,{className:`x9ynric x1tgivj0 x1ghz6dp`,children:`Simple content inside a card. The card provides default padding via the --container-padding CSS variable.`})})},b={render:()=>(0,_.jsx)(s,{width:320,children:(0,_.jsxs)(u,{gap:2,children:[(0,_.jsx)(l,{level:3,children:`Card Title`}),(0,_.jsx)(`p`,{className:`x9ynric x1ghz6dp xv1l7n4 xif65rj`,children:`This card contains simple content without Layout. The container padding is applied automatically.`})]})})},x={render:()=>(0,_.jsx)(`div`,{className:`x78zum5 x1qh66ti x1a02dak`,children:[`none`,`low`,`med`,`high`].map(e=>(0,_.jsxs)(u,{gap:2,children:[(0,_.jsxs)(`p`,{className:`xrcdmg7 x9ynric xif65rj xv1l7n4`,children:[`elevation="`,e,`"`]}),(0,_.jsx)(s,{width:220,elevation:e,children:(0,_.jsxs)(u,{gap:1,children:[(0,_.jsx)(l,{level:3,children:e}),(0,_.jsxs)(`p`,{className:`x9ynric x1ghz6dp xv1l7n4 xif65rj`,children:[`Resting at the `,e,` shadow level.`]})]})})]},e))})},S={render:()=>(0,_.jsx)(s,{width:350,children:(0,_.jsx)(t,{header:(0,_.jsx)(r,{hasDivider:!0,children:(0,_.jsx)(l,{level:3,children:`Card with Layout`})}),content:(0,_.jsx)(n,{children:(0,_.jsx)(`p`,{className:`x9ynric x1ghz6dp xv1l7n4 xif65rj`,children:`When using Layout, the layout uses negative margin to escape the container padding, then manages its own padding.`})}),footer:(0,_.jsx)(m,{hasDivider:!0,children:(0,_.jsxs)(d,{gap:2,hAlign:`end`,children:[(0,_.jsx)(a,{label:`Cancel`,variant:`secondary`,children:`Cancel`}),(0,_.jsx)(a,{label:`Save`,variant:`primary`,children:`Save`})]})})})})},C={render:()=>(0,_.jsxs)(`div`,{className:`x78zum5 x1qh66ti x1a02dak`,children:[(0,_.jsxs)(`div`,{children:[(0,_.jsx)(`h4`,{className:`xrcdmg7 x9ynric xif65rj xv1l7n4`,children:`Small (200px)`}),(0,_.jsx)(s,{width:200,children:(0,_.jsx)(`p`,{className:`x9ynric x1tgivj0 x1ghz6dp`,children:`Small card`})})]}),(0,_.jsxs)(`div`,{children:[(0,_.jsx)(`h4`,{className:`xrcdmg7 x9ynric xif65rj xv1l7n4`,children:`Medium (300px)`}),(0,_.jsx)(s,{width:300,children:(0,_.jsx)(`p`,{className:`x9ynric x1tgivj0 x1ghz6dp`,children:`Medium card`})})]}),(0,_.jsxs)(`div`,{children:[(0,_.jsx)(`h4`,{className:`xrcdmg7 x9ynric xif65rj xv1l7n4`,children:`Large (400px)`}),(0,_.jsx)(s,{width:400,children:(0,_.jsx)(`p`,{className:`x9ynric x1tgivj0 x1ghz6dp`,children:`Large card`})})]})]})},w={render:()=>(0,_.jsx)(s,{width:300,height:200,children:(0,_.jsx)(t,{header:(0,_.jsx)(r,{hasDivider:!0,children:(0,_.jsx)(l,{level:3,children:`Fixed Height Card`})}),content:(0,_.jsx)(n,{children:(0,_.jsx)(`p`,{className:`x9ynric x1ghz6dp xv1l7n4 xif65rj`,children:`This card has a fixed height. Content area will scroll if needed.`})})})})},T={render:()=>(0,_.jsx)(s,{width:400,children:(0,_.jsxs)(u,{gap:3,children:[(0,_.jsx)(l,{level:3,children:`Parent Card`}),(0,_.jsx)(s,{width:`100%`,children:(0,_.jsx)(`p`,{className:`x9ynric x1ghz6dp xv1l7n4 xif65rj`,children:`Nested card resets --container-padding and gets its own padding.`})}),(0,_.jsx)(s,{width:`100%`,children:(0,_.jsx)(`p`,{className:`x9ynric x1ghz6dp xv1l7n4 xif65rj`,children:`Another nested card with independent padding.`})})]})})},E={render:()=>(0,_.jsxs)(s,{width:400,children:[(0,_.jsx)(f,{variant:`transparent`,dividers:[`bottom`],children:(0,_.jsxs)(u,{gap:2,children:[(0,_.jsx)(l,{level:3,children:`First Section`}),(0,_.jsx)(`p`,{className:`x9ynric x1ghz6dp xv1l7n4 xif65rj`,children:`This section escapes the card padding on top and sides because it's the first child.`})]})}),(0,_.jsx)(f,{variant:`transparent`,dividers:[`bottom`],children:(0,_.jsxs)(u,{gap:2,children:[(0,_.jsx)(l,{level:3,children:`Middle Section`}),(0,_.jsx)(`p`,{className:`x9ynric x1ghz6dp xv1l7n4 xif65rj`,children:`Middle sections only escape horizontal padding, maintaining visual separation from adjacent sections.`})]})}),(0,_.jsx)(f,{variant:`transparent`,children:(0,_.jsxs)(u,{gap:2,children:[(0,_.jsx)(l,{level:3,children:`Last Section`}),(0,_.jsx)(`p`,{className:`x9ynric x1ghz6dp xv1l7n4 xif65rj`,children:`This section escapes the card padding on bottom and sides because it's the last child.`})]})})]})},D={render:()=>(0,_.jsx)(s,{width:350,children:(0,_.jsx)(f,{variant:`muted`,children:(0,_.jsxs)(u,{gap:2,children:[(0,_.jsx)(l,{level:3,children:`Only Section (Full Bleed All Sides)`}),(0,_.jsx)(`p`,{className:`x9ynric x1ghz6dp xv1l7n4 xif65rj`,children:`When a section is both first and last child, it gets full bleed on all four sides, completely filling the card.`})]})})})},O={render:()=>(0,_.jsxs)(`div`,{className:`x78zum5 x1qh66ti x1a02dak`,children:[(0,_.jsxs)(`div`,{children:[(0,_.jsx)(`h4`,{className:`xrcdmg7 x9ynric xif65rj xv1l7n4`,children:`Simple Content`}),(0,_.jsx)(s,{width:250,children:(0,_.jsxs)(u,{gap:2,children:[(0,_.jsx)(l,{level:3,children:`Card Title`}),(0,_.jsx)(`p`,{className:`x9ynric x1ghz6dp xv1l7n4 xif65rj`,children:`Regular content uses the card's container padding.`})]})})]}),(0,_.jsxs)(`div`,{children:[(0,_.jsx)(`h4`,{className:`xrcdmg7 x9ynric xif65rj xv1l7n4`,children:`With Section`}),(0,_.jsx)(s,{width:250,children:(0,_.jsx)(f,{variant:`muted`,children:(0,_.jsxs)(u,{gap:2,children:[(0,_.jsx)(l,{level:3,children:`Card Title`}),(0,_.jsx)(`p`,{className:`x9ynric x1ghz6dp xv1l7n4 xif65rj`,children:`Section content bleeds to the card edges.`})]})})})]})]})},k={render:()=>(0,_.jsxs)(`div`,{className:`x78zum5 x1qh66ti x1a02dak`,children:[(0,_.jsxs)(`div`,{children:[(0,_.jsx)(`h4`,{className:`xrcdmg7 x9ynric xif65rj xv1l7n4`,children:`Default (with padding)`}),(0,_.jsx)(s,{width:250,children:(0,_.jsx)(`div`,{style:{backgroundColor:`rgba(0,100,200,0.2)`,padding:8},children:(0,_.jsx)(`p`,{className:`x9ynric x1tgivj0 x1ghz6dp`,children:`Content with card padding`})})})]}),(0,_.jsxs)(`div`,{children:[(0,_.jsx)(`h4`,{className:`xrcdmg7 x9ynric xif65rj xv1l7n4`,children:`Full Bleed (no padding)`}),(0,_.jsx)(s,{width:250,padding:0,children:(0,_.jsx)(`div`,{style:{backgroundColor:`rgba(0,100,200,0.2)`,padding:8},children:(0,_.jsx)(`p`,{className:`x9ynric x1tgivj0 x1ghz6dp`,children:`Content touches card edges`})})})]})]})},A={decorators:[e=>(0,_.jsx)(e,{})],render:()=>(0,_.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:0},children:[(0,_.jsxs)(`div`,{className:`x1eiddq6 x1gt495`,children:[(0,_.jsx)(`h4`,{className:`xrcdmg7 x9ynric xif65rj xv1l7n4`,children:`Cards on wash background`}),(0,_.jsxs)(`div`,{className:`x78zum5 x1qh66ti x1a02dak`,children:[(0,_.jsx)(s,{width:250,children:(0,_.jsxs)(u,{gap:2,children:[(0,_.jsx)(l,{level:3,children:`Card on Wash`}),(0,_.jsx)(`p`,{className:`x9ynric x1ghz6dp xv1l7n4 xif65rj`,children:`Cards stand out clearly against the wash background, creating a layered visual hierarchy.`})]})}),(0,_.jsx)(s,{width:250,children:(0,_.jsxs)(u,{gap:2,children:[(0,_.jsx)(l,{level:3,children:`Another Card`}),(0,_.jsx)(`p`,{className:`x9ynric x1ghz6dp xv1l7n4 xif65rj`,children:`Multiple cards on wash create a dashboard-like layout.`})]})})]})]}),(0,_.jsxs)(f,{variant:`section`,width:`100%`,children:[(0,_.jsx)(`h4`,{className:`xrcdmg7 x9ynric xif65rj xv1l7n4`,children:`Cards on surface section`}),(0,_.jsxs)(`div`,{className:`x78zum5 x1qh66ti x1a02dak`,children:[(0,_.jsx)(s,{width:250,children:(0,_.jsxs)(u,{gap:2,children:[(0,_.jsx)(l,{level:3,children:`Card on Surface`}),(0,_.jsx)(`p`,{className:`x9ynric x1ghz6dp xv1l7n4 xif65rj`,children:`On a surface background, cards are more subtle since both share the same base color.`})]})}),(0,_.jsx)(s,{width:250,children:(0,_.jsxs)(u,{gap:2,children:[(0,_.jsx)(l,{level:3,children:`Another Card`}),(0,_.jsx)(`p`,{className:`x9ynric x1ghz6dp xv1l7n4 xif65rj`,children:`The card border provides separation from the surface.`})]})})]})]})]})},j={render:()=>(0,_.jsxs)(`div`,{className:`x78zum5 x1qh66ti x1a02dak`,children:[(0,_.jsx)(s,{width:350,variant:`muted`,children:(0,_.jsxs)(u,{gap:2,children:[(0,_.jsx)(l,{level:3,children:`💡 Tip`}),(0,_.jsxs)(`p`,{className:`x9ynric x1ghz6dp xv1l7n4 xif65rj`,children:[`Use `,(0,_.jsx)(`code`,{children:`variant="muted"`}),` for callouts, tips, or highlighted information. The muted background provides visual contrast without needing a nested section.`]})]})}),(0,_.jsx)(s,{width:350,variant:`muted`,children:(0,_.jsxs)(u,{gap:2,children:[(0,_.jsx)(l,{level:3,children:`⚠️ Warning`}),(0,_.jsx)(`p`,{className:`x9ynric x1ghz6dp xv1l7n4 xif65rj`,children:`Muted cards work well for alerts and warnings too.`})]})})]})},M={render:()=>(0,_.jsx)(`div`,{className:`x78zum5 x1qh66ti x1a02dak`,children:[`default`,`muted`,`blue`,`cyan`,`gray`,`green`,`orange`,`pink`,`purple`,`red`,`teal`,`yellow`].map(e=>(0,_.jsxs)(`div`,{children:[(0,_.jsx)(`h4`,{className:`xrcdmg7 x9ynric xif65rj xv1l7n4`,children:e}),(0,_.jsx)(s,{width:160,variant:e,children:(0,_.jsx)(`p`,{className:`x9ynric x1tgivj0 x1ghz6dp`,children:e})})]},e))})},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    width: 300
  },
  render: args => <Card {...args}>
      <p {...stylex.props(styles.text)}>
        Simple content inside a card. The card provides default padding via the
        --container-padding CSS variable.
      </p>
    </Card>
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  render: () => <Card width={320}>
      <VStack gap={2}>
        <Heading level={3}>Card Title</Heading>
        <p {...stylex.props(styles.text, styles.textSecondary)}>
          This card contains simple content without Layout. The container
          padding is applied automatically.
        </p>
      </VStack>
    </Card>
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  render: () => <div {...stylex.props(styles.storyWrapper)}>
      {(['none', 'low', 'med', 'high'] as const).map(elevation => <VStack key={elevation} gap={2}>
          <p {...stylex.props(styles.heading)}>
            elevation=&quot;{elevation}&quot;
          </p>
          <Card width={220} elevation={elevation}>
            <VStack gap={1}>
              <Heading level={3}>{elevation}</Heading>
              <p {...stylex.props(styles.text, styles.textSecondary)}>
                Resting at the {elevation} shadow level.
              </p>
            </VStack>
          </Card>
        </VStack>)}
    </div>
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  render: () => <Card width={350}>
      <Layout header={<LayoutHeader hasDivider>
            <Heading level={3}>Card with Layout</Heading>
          </LayoutHeader>} content={<LayoutContent>
            <p {...stylex.props(styles.text, styles.textSecondary)}>
              When using Layout, the layout uses negative margin to escape the
              container padding, then manages its own padding.
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
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
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
}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  render: () => <Card width={300} height={200}>
      <Layout header={<LayoutHeader hasDivider>
            <Heading level={3}>Fixed Height Card</Heading>
          </LayoutHeader>} content={<LayoutContent>
            <p {...stylex.props(styles.text, styles.textSecondary)}>
              This card has a fixed height. Content area will scroll if needed.
            </p>
          </LayoutContent>} />
    </Card>
}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
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
}`,...T.parameters?.docs?.source}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
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
}`,...E.parameters?.docs?.source}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
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
}`,...D.parameters?.docs?.source}}},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
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
}`,...O.parameters?.docs?.source}}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
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
}`,...k.parameters?.docs?.source}}},A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
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
}`,...A.parameters?.docs?.source},description:{story:`Cards shown on top of different background treatments.
Demonstrates the visual contrast between cards on wash (gray)
backgrounds vs surface (white) backgrounds.`,...A.parameters?.docs?.description}}},j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
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
}`,...j.parameters?.docs?.source},description:{story:`Callout card: a muted card used as a callout/highlight area.
Uses \`variant="muted"\` directly on Card instead of wrapping content
in a wash section — simpler and semantically cleaner.`,...j.parameters?.docs?.description}}},M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
  render: () => <div {...stylex.props(styles.storyWrapper)}>
      {(['default', 'muted', 'blue', 'cyan', 'gray', 'green', 'orange', 'pink', 'purple', 'red', 'teal', 'yellow'] as const).map(variant => <div key={variant}>
          <h4 {...stylex.props(styles.heading)}>{variant}</h4>
          <Card width={160} variant={variant}>
            <p {...stylex.props(styles.text)}>{variant}</p>
          </Card>
        </div>)}
    </div>
}`,...M.parameters?.docs?.source},description:{story:"All background color variants in one view.\n`muted` uses the wash background for de-emphasised cards;\nthe non-semantic variants use the `--color-<name>-background` token.",...M.parameters?.docs?.description}}},N=[`Default`,`WithSimpleContent`,`Elevations`,`WithInnerLayout`,`Sizes`,`FixedHeight`,`NestedCards`,`NestedSections`,`SingleSection`,`MixedContent`,`FullBleed`,`OnBackgrounds`,`Callout`,`ColorVariants`]}))();export{j as Callout,M as ColorVariants,y as Default,x as Elevations,w as FixedHeight,k as FullBleed,O as MixedContent,T as NestedCards,E as NestedSections,A as OnBackgrounds,D as SingleSection,C as Sizes,S as WithInnerLayout,b as WithSimpleContent,N as __namedExportsOrder,v as default};