import{i as e}from"./preload-helper-CT_b8DTk.js";import{r as t,t as n}from"./LayoutContent-BLntysZ1.js";import{t as r}from"./LayoutHeader-CrNZvjG9.js";import{t as i}from"./jsx-runtime-DqZldVDK.js";import{t as a}from"./Button-BnrGcZLf.js";import{t as o}from"./Button-BBOpb_lq.js";import{s}from"./useTheme-CJYItYzy.js";import{t as c}from"./Card-CvOBk-et.js";import{t as l}from"./Card-HAg_V-nm.js";import{t as u,x as d}from"./theme-Cev_i3Y3.js";import{t as f}from"./Heading-DEftOGEN.js";import{i as p,o as m}from"./Stack-BPa9qrGQ.js";import{t as h}from"./Section-yuRJTZmM.js";import{t as g}from"./Section-Coj2vLWe.js";import{t as _}from"./LayoutFooter-Cain74u3.js";import{t as v}from"./Layout-0OukcJ33.js";import{t as y}from"./Text-24uEXAax.js";import{cn as b,ln as x}from"./iframe-D0p2l9JB.js";var S,C,w,T,E,D,O,k,A,j,M,N,P,F,I,L,R,z,B,V,H,U;e((()=>{l(),g(),b(),v(),o(),y(),u(),S=i(),C={title:`Core/Card`,component:c,tags:[`autodocs`],decorators:[e=>(0,S.jsx)(`div`,{className:`x1eiddq6 x1gt495`,children:(0,S.jsx)(e,{})})],argTypes:{width:{control:{type:`range`,min:100,max:800,step:10},description:`Width in pixels`},height:{control:{type:`range`,min:100,max:600,step:10},description:`Height in pixels`},maxWidth:{control:{type:`range`,min:100,max:800,step:10},description:`Maximum width in pixels`},minHeight:{control:{type:`range`,min:100,max:600,step:10},description:`Minimum height in pixels`},elevation:{control:{type:`inline-radio`},options:[`none`,`low`,`med`,`high`],description:`Resting shadow depth`}}},w={args:{width:300},render:e=>(0,S.jsx)(c,{...e,children:(0,S.jsx)(`p`,{className:`x9ynric x1tgivj0 x1ghz6dp`,children:`Simple content inside a card. The card provides default padding via the --container-padding CSS variable.`})})},T={render:()=>(0,S.jsx)(c,{width:320,children:(0,S.jsxs)(p,{gap:2,children:[(0,S.jsx)(f,{level:3,children:`Card Title`}),(0,S.jsx)(`p`,{className:`x9ynric x1ghz6dp xv1l7n4 xif65rj`,children:`This card contains simple content without Layout. The container padding is applied automatically.`})]})})},E={render:()=>(0,S.jsx)(`div`,{className:`x78zum5 x1qh66ti x1a02dak`,children:[`none`,`low`,`med`,`high`].map(e=>(0,S.jsxs)(p,{gap:2,children:[(0,S.jsxs)(`p`,{className:`xrcdmg7 x9ynric xif65rj xv1l7n4`,children:[`elevation="`,e,`"`]}),(0,S.jsx)(c,{width:220,elevation:e,children:(0,S.jsxs)(p,{gap:1,children:[(0,S.jsx)(f,{level:3,children:e}),(0,S.jsxs)(`p`,{className:`x9ynric x1ghz6dp xv1l7n4 xif65rj`,children:[`Resting at the `,e,` shadow level.`]})]})})]},e))})},D={render:()=>(0,S.jsx)(c,{width:350,children:(0,S.jsx)(t,{header:(0,S.jsx)(r,{hasDivider:!0,children:(0,S.jsx)(f,{level:3,children:`Card with Layout`})}),content:(0,S.jsx)(n,{children:(0,S.jsx)(`p`,{className:`x9ynric x1ghz6dp xv1l7n4 xif65rj`,children:`When using Layout, the layout uses negative margin to escape the container padding, then manages its own padding.`})}),footer:(0,S.jsx)(_,{hasDivider:!0,children:(0,S.jsxs)(m,{gap:2,hAlign:`end`,children:[(0,S.jsx)(a,{label:`Cancel`,variant:`secondary`,children:`Cancel`}),(0,S.jsx)(a,{label:`Save`,variant:`primary`,children:`Save`})]})})})})},O={render:()=>(0,S.jsxs)(`div`,{className:`x78zum5 x1qh66ti x1a02dak`,children:[(0,S.jsxs)(`div`,{children:[(0,S.jsx)(`h4`,{className:`xrcdmg7 x9ynric xif65rj xv1l7n4`,children:`Small (200px)`}),(0,S.jsx)(c,{width:200,children:(0,S.jsx)(`p`,{className:`x9ynric x1tgivj0 x1ghz6dp`,children:`Small card`})})]}),(0,S.jsxs)(`div`,{children:[(0,S.jsx)(`h4`,{className:`xrcdmg7 x9ynric xif65rj xv1l7n4`,children:`Medium (300px)`}),(0,S.jsx)(c,{width:300,children:(0,S.jsx)(`p`,{className:`x9ynric x1tgivj0 x1ghz6dp`,children:`Medium card`})})]}),(0,S.jsxs)(`div`,{children:[(0,S.jsx)(`h4`,{className:`xrcdmg7 x9ynric xif65rj xv1l7n4`,children:`Large (400px)`}),(0,S.jsx)(c,{width:400,children:(0,S.jsx)(`p`,{className:`x9ynric x1tgivj0 x1ghz6dp`,children:`Large card`})})]})]})},k={render:()=>(0,S.jsx)(c,{width:300,height:200,children:(0,S.jsx)(t,{header:(0,S.jsx)(r,{hasDivider:!0,children:(0,S.jsx)(f,{level:3,children:`Fixed Height Card`})}),content:(0,S.jsx)(n,{children:(0,S.jsx)(`p`,{className:`x9ynric x1ghz6dp xv1l7n4 xif65rj`,children:`This card has a fixed height. Content area will scroll if needed.`})})})})},A={render:()=>(0,S.jsx)(c,{width:400,children:(0,S.jsxs)(p,{gap:3,children:[(0,S.jsx)(f,{level:3,children:`Parent Card`}),(0,S.jsx)(c,{width:`100%`,children:(0,S.jsx)(`p`,{className:`x9ynric x1ghz6dp xv1l7n4 xif65rj`,children:`Nested card resets --container-padding and gets its own padding.`})}),(0,S.jsx)(c,{width:`100%`,children:(0,S.jsx)(`p`,{className:`x9ynric x1ghz6dp xv1l7n4 xif65rj`,children:`Another nested card with independent padding.`})})]})})},j={render:()=>(0,S.jsxs)(c,{width:400,children:[(0,S.jsx)(h,{variant:`transparent`,dividers:[`bottom`],children:(0,S.jsxs)(p,{gap:2,children:[(0,S.jsx)(f,{level:3,children:`First Section`}),(0,S.jsx)(`p`,{className:`x9ynric x1ghz6dp xv1l7n4 xif65rj`,children:`This section escapes the card padding on top and sides because it's the first child.`})]})}),(0,S.jsx)(h,{variant:`transparent`,dividers:[`bottom`],children:(0,S.jsxs)(p,{gap:2,children:[(0,S.jsx)(f,{level:3,children:`Middle Section`}),(0,S.jsx)(`p`,{className:`x9ynric x1ghz6dp xv1l7n4 xif65rj`,children:`Middle sections only escape horizontal padding, maintaining visual separation from adjacent sections.`})]})}),(0,S.jsx)(h,{variant:`transparent`,children:(0,S.jsxs)(p,{gap:2,children:[(0,S.jsx)(f,{level:3,children:`Last Section`}),(0,S.jsx)(`p`,{className:`x9ynric x1ghz6dp xv1l7n4 xif65rj`,children:`This section escapes the card padding on bottom and sides because it's the last child.`})]})})]})},M={render:()=>(0,S.jsx)(c,{width:350,children:(0,S.jsx)(h,{variant:`muted`,children:(0,S.jsxs)(p,{gap:2,children:[(0,S.jsx)(f,{level:3,children:`Only Section (Full Bleed All Sides)`}),(0,S.jsx)(`p`,{className:`x9ynric x1ghz6dp xv1l7n4 xif65rj`,children:`When a section is both first and last child, it gets full bleed on all four sides, completely filling the card.`})]})})})},N={render:()=>(0,S.jsxs)(`div`,{className:`x78zum5 x1qh66ti x1a02dak`,children:[(0,S.jsxs)(`div`,{children:[(0,S.jsx)(`h4`,{className:`xrcdmg7 x9ynric xif65rj xv1l7n4`,children:`Simple Content`}),(0,S.jsx)(c,{width:250,children:(0,S.jsxs)(p,{gap:2,children:[(0,S.jsx)(f,{level:3,children:`Card Title`}),(0,S.jsx)(`p`,{className:`x9ynric x1ghz6dp xv1l7n4 xif65rj`,children:`Regular content uses the card's container padding.`})]})})]}),(0,S.jsxs)(`div`,{children:[(0,S.jsx)(`h4`,{className:`xrcdmg7 x9ynric xif65rj xv1l7n4`,children:`With Section`}),(0,S.jsx)(c,{width:250,children:(0,S.jsx)(h,{variant:`muted`,children:(0,S.jsxs)(p,{gap:2,children:[(0,S.jsx)(f,{level:3,children:`Card Title`}),(0,S.jsx)(`p`,{className:`x9ynric x1ghz6dp xv1l7n4 xif65rj`,children:`Section content bleeds to the card edges.`})]})})})]})]})},P={render:()=>(0,S.jsxs)(`div`,{className:`x78zum5 x1qh66ti x1a02dak`,children:[(0,S.jsxs)(`div`,{children:[(0,S.jsx)(`h4`,{className:`xrcdmg7 x9ynric xif65rj xv1l7n4`,children:`Default (with padding)`}),(0,S.jsx)(c,{width:250,children:(0,S.jsx)(`div`,{style:{backgroundColor:`rgba(0,100,200,0.2)`,padding:8},children:(0,S.jsx)(`p`,{className:`x9ynric x1tgivj0 x1ghz6dp`,children:`Content with card padding`})})})]}),(0,S.jsxs)(`div`,{children:[(0,S.jsx)(`h4`,{className:`xrcdmg7 x9ynric xif65rj xv1l7n4`,children:`Full Bleed (no padding)`}),(0,S.jsx)(c,{width:250,padding:0,children:(0,S.jsx)(`div`,{style:{backgroundColor:`rgba(0,100,200,0.2)`,padding:8},children:(0,S.jsx)(`p`,{className:`x9ynric x1tgivj0 x1ghz6dp`,children:`Content touches card edges`})})})]})]})},F={decorators:[e=>(0,S.jsx)(e,{})],render:()=>(0,S.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:0},children:[(0,S.jsxs)(`div`,{className:`x1eiddq6 x1gt495`,children:[(0,S.jsx)(`h4`,{className:`xrcdmg7 x9ynric xif65rj xv1l7n4`,children:`Cards on wash background`}),(0,S.jsxs)(`div`,{className:`x78zum5 x1qh66ti x1a02dak`,children:[(0,S.jsx)(c,{width:250,children:(0,S.jsxs)(p,{gap:2,children:[(0,S.jsx)(f,{level:3,children:`Card on Wash`}),(0,S.jsx)(`p`,{className:`x9ynric x1ghz6dp xv1l7n4 xif65rj`,children:`Cards stand out clearly against the wash background, creating a layered visual hierarchy.`})]})}),(0,S.jsx)(c,{width:250,children:(0,S.jsxs)(p,{gap:2,children:[(0,S.jsx)(f,{level:3,children:`Another Card`}),(0,S.jsx)(`p`,{className:`x9ynric x1ghz6dp xv1l7n4 xif65rj`,children:`Multiple cards on wash create a dashboard-like layout.`})]})})]})]}),(0,S.jsxs)(h,{variant:`section`,width:`100%`,children:[(0,S.jsx)(`h4`,{className:`xrcdmg7 x9ynric xif65rj xv1l7n4`,children:`Cards on surface section`}),(0,S.jsxs)(`div`,{className:`x78zum5 x1qh66ti x1a02dak`,children:[(0,S.jsx)(c,{width:250,children:(0,S.jsxs)(p,{gap:2,children:[(0,S.jsx)(f,{level:3,children:`Card on Surface`}),(0,S.jsx)(`p`,{className:`x9ynric x1ghz6dp xv1l7n4 xif65rj`,children:`On a surface background, cards are more subtle since both share the same base color.`})]})}),(0,S.jsx)(c,{width:250,children:(0,S.jsxs)(p,{gap:2,children:[(0,S.jsx)(f,{level:3,children:`Another Card`}),(0,S.jsx)(`p`,{className:`x9ynric x1ghz6dp xv1l7n4 xif65rj`,children:`The card border provides separation from the surface.`})]})})]})]})]})},I={render:()=>(0,S.jsxs)(`div`,{className:`x78zum5 x1qh66ti x1a02dak`,children:[(0,S.jsx)(c,{width:350,variant:`muted`,children:(0,S.jsxs)(p,{gap:2,children:[(0,S.jsx)(f,{level:3,children:`💡 Tip`}),(0,S.jsxs)(`p`,{className:`x9ynric x1ghz6dp xv1l7n4 xif65rj`,children:[`Use `,(0,S.jsx)(`code`,{children:`variant="muted"`}),` for callouts, tips, or highlighted information. The muted background provides visual contrast without needing a nested section.`]})]})}),(0,S.jsx)(c,{width:350,variant:`muted`,children:(0,S.jsxs)(p,{gap:2,children:[(0,S.jsx)(f,{level:3,children:`⚠️ Warning`}),(0,S.jsx)(`p`,{className:`x9ynric x1ghz6dp xv1l7n4 xif65rj`,children:`Muted cards work well for alerts and warnings too.`})]})})]})},L={render:()=>(0,S.jsx)(`div`,{className:`x78zum5 x1qh66ti x1a02dak`,children:[`default`,`muted`,`blue`,`cyan`,`gray`,`green`,`orange`,`pink`,`purple`,`red`,`teal`,`yellow`].map(e=>(0,S.jsxs)(`div`,{children:[(0,S.jsx)(`h4`,{className:`xrcdmg7 x9ynric xif65rj xv1l7n4`,children:e}),(0,S.jsx)(c,{width:160,variant:e,children:(0,S.jsx)(`p`,{className:`x9ynric x1tgivj0 x1ghz6dp`,children:e})})]},e))})},R=s({name:`card-brand-variant-demo`,components:{card:{"variant:brand":{backgroundColor:`var(--color-accent)`,color:`var(--color-on-accent)`,"--selectable-card-ring-color":`var(--color-on-accent)`}}}}),z={render:()=>(0,S.jsx)(d,{theme:R,mode:`light`,children:(0,S.jsxs)(`div`,{className:`x78zum5 x1qh66ti x1a02dak`,children:[(0,S.jsxs)(`div`,{children:[(0,S.jsx)(`h4`,{className:`xrcdmg7 x9ynric xif65rj xv1l7n4`,children:`brand (added by the theme)`}),(0,S.jsx)(c,{width:200,variant:`brand`,children:(0,S.jsx)(`p`,{className:`x9ynric x1ghz6dp x1heor9g`,children:`brand`})})]}),(0,S.jsxs)(`div`,{children:[(0,S.jsx)(`h4`,{className:`xrcdmg7 x9ynric xif65rj xv1l7n4`,children:`default (built in)`}),(0,S.jsx)(c,{width:200,children:(0,S.jsx)(`p`,{className:`x9ynric x1tgivj0 x1ghz6dp`,children:`default`})})]}),(0,S.jsxs)(`div`,{children:[(0,S.jsx)(`h4`,{className:`xrcdmg7 x9ynric xif65rj xv1l7n4`,children:`brand, selected`}),(0,S.jsx)(x,{label:`brand, selected`,isSelected:!0,onChange:()=>{},variant:`brand`,width:200,children:(0,S.jsx)(`p`,{className:`x9ynric x1ghz6dp x1heor9g`,children:`selected`})})]}),(0,S.jsxs)(`div`,{children:[(0,S.jsx)(`h4`,{className:`xrcdmg7 x9ynric xif65rj xv1l7n4`,children:`brand, unselected`}),(0,S.jsx)(x,{label:`brand, unselected`,isSelected:!1,onChange:()=>{},variant:`brand`,width:200,children:(0,S.jsx)(`p`,{className:`x9ynric x1ghz6dp x1heor9g`,children:`unselected`})})]})]})})},B={render:()=>(0,S.jsxs)(`div`,{className:`x78zum5 x1qh66ti x1a02dak`,children:[(0,S.jsxs)(`div`,{children:[(0,S.jsx)(`h4`,{className:`xrcdmg7 x9ynric xif65rj xv1l7n4`,children:`No children`}),(0,S.jsx)(c,{width:250})]}),(0,S.jsxs)(`div`,{children:[(0,S.jsx)(`h4`,{className:`xrcdmg7 x9ynric xif65rj xv1l7n4`,children:`No children, minHeight 120`}),(0,S.jsx)(c,{width:250,minHeight:120})]})]})},V={render:()=>(0,S.jsx)(`div`,{className:`x78zum5 x1qh66ti x1a02dak`,children:(0,S.jsx)(c,{width:280,children:(0,S.jsxs)(p,{gap:2,children:[(0,S.jsx)(f,{level:3,children:`A card title long enough to wrap onto several lines`}),(0,S.jsx)(`p`,{className:`x9ynric x1tgivj0 x1ghz6dp`,children:`Cards grow to fit their content, so a long description keeps wrapping rather than being cut off. Sibling cards in a grid stay aligned on their top edge and the tallest one sets the row height.`})]})})})},H={render:()=>(0,S.jsx)(`div`,{className:`x1m258z3`,children:(0,S.jsx)(c,{children:(0,S.jsxs)(p,{gap:2,children:[(0,S.jsx)(f,{level:3,children:`Narrow container`}),(0,S.jsx)(`p`,{className:`x9ynric x1tgivj0 x1ghz6dp`,children:`The card fills the container it is given.`})]})})})},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  args: {
    width: 300
  },
  render: args => <Card {...args}>
      <p {...stylex.props(styles.text)}>
        Simple content inside a card. The card provides default padding via the
        --container-padding CSS variable.
      </p>
    </Card>
}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  render: () => <Card width={320}>
      <VStack gap={2}>
        <Heading level={3}>Card Title</Heading>
        <p {...stylex.props(styles.text, styles.textSecondary)}>
          This card contains simple content without Layout. The container
          padding is applied automatically.
        </p>
      </VStack>
    </Card>
}`,...T.parameters?.docs?.source}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
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
}`,...E.parameters?.docs?.source}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
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
}`,...D.parameters?.docs?.source}}},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
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
}`,...O.parameters?.docs?.source}}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  render: () => <Card width={300} height={200}>
      <Layout header={<LayoutHeader hasDivider>
            <Heading level={3}>Fixed Height Card</Heading>
          </LayoutHeader>} content={<LayoutContent>
            <p {...stylex.props(styles.text, styles.textSecondary)}>
              This card has a fixed height. Content area will scroll if needed.
            </p>
          </LayoutContent>} />
    </Card>
}`,...k.parameters?.docs?.source}}},A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
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
}`,...A.parameters?.docs?.source}}},j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
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
}`,...j.parameters?.docs?.source}}},M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
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
}`,...M.parameters?.docs?.source}}},N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
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
}`,...N.parameters?.docs?.source}}},P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
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
}`,...P.parameters?.docs?.source}}},F.parameters={...F.parameters,docs:{...F.parameters?.docs,source:{originalSource:`{
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
}`,...F.parameters?.docs?.source},description:{story:`Cards shown on top of different background treatments.
Demonstrates the visual contrast between cards on wash (gray)
backgrounds vs surface (white) backgrounds.`,...F.parameters?.docs?.description}}},I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{
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
}`,...I.parameters?.docs?.source},description:{story:`Callout card: a muted card used as a callout/highlight area.
Uses \`variant="muted"\` directly on Card instead of wrapping content
in a wash section — simpler and semantically cleaner.`,...I.parameters?.docs?.description}}},L.parameters={...L.parameters,docs:{...L.parameters?.docs,source:{originalSource:`{
  render: () => <div {...stylex.props(styles.storyWrapper)}>
      {(['default', 'muted', 'blue', 'cyan', 'gray', 'green', 'orange', 'pink', 'purple', 'red', 'teal', 'yellow'] as const).map(variant => <div key={variant}>
          <h4 {...stylex.props(styles.heading)}>{variant}</h4>
          <Card width={160} variant={variant}>
            <p {...stylex.props(styles.text)}>{variant}</p>
          </Card>
        </div>)}
    </div>
}`,...L.parameters?.docs?.source},description:{story:"All background color variants in one view.\n`muted` uses the wash background for de-emphasised cards;\nthe non-semantic variants use the `--color-<name>-background` token.",...L.parameters?.docs?.description}}},z.parameters={...z.parameters,docs:{...z.parameters?.docs,source:{originalSource:`{
  render: () => <Theme theme={brandVariantTheme} mode="light">
      <div {...stylex.props(styles.storyWrapper)}>
        <div>
          <h4 {...stylex.props(styles.heading)}>brand (added by the theme)</h4>
          <Card width={200} variant="brand">
            <p {...stylex.props(styles.text, styles.textInherit)}>brand</p>
          </Card>
        </div>
        <div>
          <h4 {...stylex.props(styles.heading)}>default (built in)</h4>
          <Card width={200}>
            <p {...stylex.props(styles.text)}>default</p>
          </Card>
        </div>
        <div>
          <h4 {...stylex.props(styles.heading)}>brand, selected</h4>
          <SelectableCard label="brand, selected" isSelected onChange={() => {}} variant="brand" width={200}>
            <p {...stylex.props(styles.text, styles.textInherit)}>selected</p>
          </SelectableCard>
        </div>
        <div>
          <h4 {...stylex.props(styles.heading)}>brand, unselected</h4>
          <SelectableCard label="brand, unselected" isSelected={false} onChange={() => {}} variant="brand" width={200}>
            <p {...stylex.props(styles.text, styles.textInherit)}>unselected</p>
          </SelectableCard>
        </div>
      </div>
    </Theme>
}`,...z.parameters?.docs?.source}}},B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
  render: () => <div {...stylex.props(styles.storyWrapper)}>
      <div>
        <h4 {...stylex.props(styles.heading)}>No children</h4>
        <Card width={250} />
      </div>
      <div>
        <h4 {...stylex.props(styles.heading)}>No children, minHeight 120</h4>
        <Card width={250} minHeight={120} />
      </div>
    </div>
}`,...B.parameters?.docs?.source},description:{story:`A card with no children, and one with a minimum height. An empty card holds
its padding and radius rather than collapsing, so a placeholder or a loading
shell keeps the surrounding layout stable.`,...B.parameters?.docs?.description}}},V.parameters={...V.parameters,docs:{...V.parameters?.docs,source:{originalSource:`{
  render: () => <div {...stylex.props(styles.storyWrapper)}>
      <Card width={280}>
        <VStack gap={2}>
          <Heading level={3}>
            A card title long enough to wrap onto several lines
          </Heading>
          <p {...stylex.props(styles.text)}>
            Cards grow to fit their content, so a long description keeps
            wrapping rather than being cut off. Sibling cards in a grid stay
            aligned on their top edge and the tallest one sets the row height.
          </p>
        </VStack>
      </Card>
    </div>
}`,...V.parameters?.docs?.source},description:{story:`Long prose and a title long enough to wrap, in a fixed-width card. Text wraps
and the card grows to fit. Most languages run longer than English, so this is
the state translated copy lands in.`,...V.parameters?.docs?.description}}},H.parameters={...H.parameters,docs:{...H.parameters?.docs,source:{originalSource:`{
  render: () => <div {...stylex.props(styles.narrowContainer)}>
      <Card>
        <VStack gap={2}>
          <Heading level={3}>Narrow container</Heading>
          <p {...stylex.props(styles.text)}>
            The card fills the container it is given.
          </p>
        </VStack>
      </Card>
    </div>
}`,...H.parameters?.docs?.source},description:{story:`A card with no width prop inside a 320px container: the width comes from the
parent, so the card reflows to the container instead of forcing horizontal
scroll on a narrow screen.`,...H.parameters?.docs?.description}}},U=[`Default`,`WithSimpleContent`,`Elevations`,`WithInnerLayout`,`Sizes`,`FixedHeight`,`NestedCards`,`NestedSections`,`SingleSection`,`MixedContent`,`FullBleed`,`OnBackgrounds`,`Callout`,`ColorVariants`,`ThemeAddedVariant`,`Empty`,`LongContent`,`NarrowContainer`]}))();export{I as Callout,L as ColorVariants,w as Default,E as Elevations,B as Empty,k as FixedHeight,P as FullBleed,V as LongContent,N as MixedContent,H as NarrowContainer,A as NestedCards,j as NestedSections,F as OnBackgrounds,M as SingleSection,O as Sizes,z as ThemeAddedVariant,D as WithInnerLayout,T as WithSimpleContent,U as __namedExportsOrder,C as default};