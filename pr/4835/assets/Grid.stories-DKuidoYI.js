import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{n as t,t as n}from"./Text-BfjtEFtP.js";import{t as r}from"./jsx-runtime-DeHZSEgm.js";import{n as i,t as a}from"./Card-270yxekz.js";import{n as o,t as s}from"./VStack-C2SBQ4Fm.js";import{n as c,t as l}from"./Section-BQJsZyZZ.js";import{n as u,t as d}from"./Grid-DS-HeJ6q.js";import{n as f,t as p}from"./GridSpan-CCMDVUT3.js";var m,h,g,_,v,y,b,x,S,C,w,T,E,D,O,k,A,j;function M(){return(M=e((()=>{u(),f(),i(),c(),t(),o(),m=r(),h={sectionLabel:{k1K539:`x1p37lm5`,$$css:!0}},g={title:`Core/Grid`,component:d,tags:[`autodocs`],argTypes:{columns:{control:`object`,description:`Column configuration: number for fixed columns, or {minWidth, max?, repeat?} for responsive`},gap:{control:`select`,options:[0,.5,1,1.5,2,3,4,5,6,8,10],description:`Spacing between all grid items`},rowGap:{control:`select`,options:[0,.5,1,1.5,2,3,4,5,6,8,10],description:`Spacing between rows (overrides gap)`},columnGap:{control:`select`,options:[0,.5,1,1.5,2,3,4,5,6,8,10],description:`Spacing between columns (overrides gap)`},align:{control:`select`,options:[`start`,`center`,`end`,`stretch`],description:`Vertical alignment of grid items`},justify:{control:`select`,options:[`start`,`center`,`end`,`stretch`],description:`Horizontal alignment of grid items`}}},_=({children:e})=>(0,m.jsx)(`div`,{className:`x1shk3sm x1eiddq6 xh6dtrn x2b8uid`,children:(0,m.jsx)(n,{type:`body`,children:e})}),v=({children:e})=>(0,m.jsx)(`div`,{className:`x1gt495 xgcxg3y xh6dtrn x2b8uid x5yr21d x9f619`,children:(0,m.jsx)(n,{type:`body`,children:e})}),y={args:{columns:3,gap:4},render:e=>(0,m.jsx)(`div`,{className:`x1shk3sm x10xzikg`,children:(0,m.jsxs)(d,{...e,children:[(0,m.jsx)(_,{children:`Item 1`}),(0,m.jsx)(_,{children:`Item 2`}),(0,m.jsx)(_,{children:`Item 3`}),(0,m.jsx)(_,{children:`Item 4`}),(0,m.jsx)(_,{children:`Item 5`}),(0,m.jsx)(_,{children:`Item 6`})]})})},b={render:()=>(0,m.jsxs)(`div`,{className:`x78zum5 xdt5ytf x1qh66ti`,children:[(0,m.jsxs)(`div`,{className:`x1shk3sm x10xzikg`,children:[(0,m.jsx)(n,{type:`supporting`,xstyle:h.sectionLabel,children:`2 Columns`}),(0,m.jsxs)(d,{columns:2,gap:4,children:[(0,m.jsx)(_,{children:`Item 1`}),(0,m.jsx)(_,{children:`Item 2`}),(0,m.jsx)(_,{children:`Item 3`}),(0,m.jsx)(_,{children:`Item 4`})]})]}),(0,m.jsxs)(`div`,{className:`x1shk3sm x10xzikg`,children:[(0,m.jsx)(n,{type:`supporting`,xstyle:h.sectionLabel,children:`4 Columns`}),(0,m.jsxs)(d,{columns:4,gap:4,children:[(0,m.jsx)(_,{children:`Item 1`}),(0,m.jsx)(_,{children:`Item 2`}),(0,m.jsx)(_,{children:`Item 3`}),(0,m.jsx)(_,{children:`Item 4`}),(0,m.jsx)(_,{children:`Item 5`}),(0,m.jsx)(_,{children:`Item 6`}),(0,m.jsx)(_,{children:`Item 7`}),(0,m.jsx)(_,{children:`Item 8`})]})]})]})},x={render:()=>(0,m.jsxs)(s,{gap:6,children:[(0,m.jsxs)(`div`,{className:`x1shk3sm x10xzikg`,children:[(0,m.jsx)(n,{type:`supporting`,xstyle:h.sectionLabel,children:`columns={{minWidth: 200}} with 2 items — cards stretch to fill (auto-fit)`}),(0,m.jsxs)(d,{columns:{minWidth:200},gap:4,children:[(0,m.jsx)(_,{children:`Item 1`}),(0,m.jsx)(_,{children:`Item 2`})]})]}),(0,m.jsxs)(`div`,{className:`x1shk3sm x10xzikg`,children:[(0,m.jsx)(n,{type:`supporting`,xstyle:h.sectionLabel,children:`Same grid with 6 items; looks fine because items fill the tracks`}),(0,m.jsxs)(d,{columns:{minWidth:200},gap:4,children:[(0,m.jsx)(_,{children:`Item 1`}),(0,m.jsx)(_,{children:`Item 2`}),(0,m.jsx)(_,{children:`Item 3`}),(0,m.jsx)(_,{children:`Item 4`}),(0,m.jsx)(_,{children:`Item 5`}),(0,m.jsx)(_,{children:`Item 6`})]})]})]})},S={render:()=>(0,m.jsxs)(`div`,{className:`x1shk3sm x10xzikg`,children:[(0,m.jsx)(n,{type:`supporting`,xstyle:h.sectionLabel,children:`Resize the viewport — columns auto-fill, empty tracks preserved (min 200px per item)`}),(0,m.jsxs)(d,{columns:{minWidth:200},gap:4,children:[(0,m.jsx)(_,{children:`Item 1`}),(0,m.jsx)(_,{children:`Item 2`}),(0,m.jsx)(_,{children:`Item 3`})]})]})},C={render:()=>(0,m.jsxs)(s,{gap:6,children:[(0,m.jsxs)(`div`,{className:`x1shk3sm x10xzikg`,children:[(0,m.jsx)(n,{type:`supporting`,xstyle:h.sectionLabel,children:`auto-fill (default) — items stay consistent width, empty tracks preserved`}),(0,m.jsxs)(d,{columns:{minWidth:250},gap:4,children:[(0,m.jsx)(_,{children:`Item 1`}),(0,m.jsx)(_,{children:`Item 2`})]})]}),(0,m.jsxs)(`div`,{className:`x1shk3sm x10xzikg`,children:[(0,m.jsx)(n,{type:`supporting`,xstyle:h.sectionLabel,children:`auto-fit — items stretch to fill all available space`}),(0,m.jsxs)(d,{columns:{minWidth:250,repeat:`fit`},gap:4,children:[(0,m.jsx)(_,{children:`Item 1`}),(0,m.jsx)(_,{children:`Item 2`})]})]})]})},w={render:()=>(0,m.jsxs)(`div`,{className:`x1shk3sm x10xzikg`,children:[(0,m.jsx)(n,{type:`supporting`,xstyle:h.sectionLabel,children:`Responsive with max 3 columns (min 250px per item; column count is capped but present columns always fill)`}),(0,m.jsxs)(d,{columns:{minWidth:250,max:3},gap:4,children:[(0,m.jsx)(_,{children:`Item 1`}),(0,m.jsx)(_,{children:`Item 2`}),(0,m.jsx)(_,{children:`Item 3`}),(0,m.jsx)(_,{children:`Item 4`}),(0,m.jsx)(_,{children:`Item 5`}),(0,m.jsx)(_,{children:`Item 6`})]})]})},T={name:`Capped — fills when collapsed (#3391)`,render:()=>(0,m.jsxs)(`div`,{className:`x1shk3sm x10xzikg`,children:[(0,m.jsxs)(n,{type:`supporting`,xstyle:h.sectionLabel,children:[`columns=`,`{{minWidth: 360, max: 2}}`,` — resize the viewport narrow enough that only one column fits. The lone column stretches to full width (no dead space on the right); on wider viewports it caps at 2.`]}),(0,m.jsx)(`div`,{style:{maxWidth:520,resize:`horizontal`,overflow:`auto`},children:(0,m.jsxs)(d,{columns:{minWidth:360,max:2},gap:4,children:[(0,m.jsx)(_,{children:`Left block`}),(0,m.jsx)(_,{children:`Right block`})]})})]})},E={render:()=>(0,m.jsxs)(`div`,{className:`x1shk3sm x10xzikg`,children:[(0,m.jsx)(n,{type:`supporting`,xstyle:h.sectionLabel,children:`Using GridSpan to span multiple columns/rows`}),(0,m.jsxs)(d,{columns:4,gap:4,children:[(0,m.jsx)(p,{columns:2,children:(0,m.jsx)(v,{children:`Spans 2 columns`})}),(0,m.jsx)(_,{children:`Normal`}),(0,m.jsx)(_,{children:`Normal`}),(0,m.jsx)(_,{children:`Normal`}),(0,m.jsx)(p,{columns:3,children:(0,m.jsx)(v,{children:`Spans 3 columns`})}),(0,m.jsx)(p,{columns:`full`,children:(0,m.jsx)(v,{children:`Full width (spans all columns)`})})]})]})},D={render:()=>(0,m.jsxs)(`div`,{className:`x1shk3sm x10xzikg`,children:[(0,m.jsx)(n,{type:`supporting`,xstyle:h.sectionLabel,children:`Grid items spanning both columns and rows`}),(0,m.jsxs)(d,{columns:4,gap:4,children:[(0,m.jsx)(p,{columns:2,rows:2,children:(0,m.jsx)(v,{children:`2x2 Featured`})}),(0,m.jsx)(_,{children:`Item 1`}),(0,m.jsx)(_,{children:`Item 2`}),(0,m.jsx)(_,{children:`Item 3`}),(0,m.jsx)(_,{children:`Item 4`}),(0,m.jsx)(_,{children:`Item 5`}),(0,m.jsx)(_,{children:`Item 6`})]})]})},O={render:()=>(0,m.jsxs)(l,{variant:`muted`,children:[(0,m.jsx)(n,{type:`supporting`,xstyle:h.sectionLabel,children:`Gallery/Card Grid — Responsive with min 280px cards (auto-fill)`}),(0,m.jsx)(d,{columns:{minWidth:280},gap:5,children:Array.from({length:8},(e,t)=>(0,m.jsxs)(a,{children:[(0,m.jsx)(`div`,{className:`x1wkxgih x1eiddq6 xh6dtrn xep27e5`}),(0,m.jsxs)(n,{type:`label`,display:`block`,children:[`Card Title `,t+1]}),(0,m.jsx)(n,{type:`supporting`,display:`block`,children:`A brief description of the card content goes here.`})]},t))})]})},k={render:()=>(0,m.jsxs)(`div`,{className:`x78zum5 xdt5ytf x1qh66ti`,children:[(0,m.jsxs)(`div`,{className:`x1shk3sm x10xzikg`,children:[(0,m.jsx)(n,{type:`supporting`,xstyle:h.sectionLabel,children:`Same gap for rows and columns (gap=4)`}),(0,m.jsxs)(d,{columns:3,gap:4,children:[(0,m.jsx)(_,{children:`Item 1`}),(0,m.jsx)(_,{children:`Item 2`}),(0,m.jsx)(_,{children:`Item 3`}),(0,m.jsx)(_,{children:`Item 4`}),(0,m.jsx)(_,{children:`Item 5`}),(0,m.jsx)(_,{children:`Item 6`})]})]}),(0,m.jsxs)(`div`,{className:`x1shk3sm x10xzikg`,children:[(0,m.jsx)(n,{type:`supporting`,xstyle:h.sectionLabel,children:`Different gaps: rowGap=2, columnGap=6`}),(0,m.jsxs)(d,{columns:3,rowGap:2,columnGap:6,children:[(0,m.jsx)(_,{children:`Item 1`}),(0,m.jsx)(_,{children:`Item 2`}),(0,m.jsx)(_,{children:`Item 3`}),(0,m.jsx)(_,{children:`Item 4`}),(0,m.jsx)(_,{children:`Item 5`}),(0,m.jsx)(_,{children:`Item 6`})]})]})]})},A={render:()=>(0,m.jsxs)(l,{variant:`muted`,children:[(0,m.jsx)(n,{type:`supporting`,xstyle:h.sectionLabel,children:`Dashboard-style layout with different sized widgets`}),(0,m.jsxs)(d,{columns:4,gap:4,children:[(0,m.jsx)(p,{columns:2,rows:2,children:(0,m.jsxs)(a,{children:[(0,m.jsx)(n,{type:`label`,display:`block`,children:`Main Chart`}),(0,m.jsx)(n,{type:`supporting`,display:`block`,children:`Large visualization widget`})]})}),(0,m.jsxs)(a,{children:[(0,m.jsx)(n,{type:`label`,display:`block`,children:`Metric 1`}),(0,m.jsx)(n,{type:`supporting`,display:`block`,children:`Quick stat`})]}),(0,m.jsxs)(a,{children:[(0,m.jsx)(n,{type:`label`,display:`block`,children:`Metric 2`}),(0,m.jsx)(n,{type:`supporting`,display:`block`,children:`Quick stat`})]}),(0,m.jsxs)(a,{children:[(0,m.jsx)(n,{type:`label`,display:`block`,children:`Metric 3`}),(0,m.jsx)(n,{type:`supporting`,display:`block`,children:`Quick stat`})]}),(0,m.jsxs)(a,{children:[(0,m.jsx)(n,{type:`label`,display:`block`,children:`Metric 4`}),(0,m.jsx)(n,{type:`supporting`,display:`block`,children:`Quick stat`})]}),(0,m.jsx)(p,{columns:`full`,children:(0,m.jsxs)(a,{children:[(0,m.jsx)(n,{type:`label`,display:`block`,children:`Full-width Section`}),(0,m.jsx)(n,{type:`supporting`,display:`block`,children:`This section spans the entire width of the grid`})]})})]})]})},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    columns: 3,
    gap: 4
  },
  render: args => <div {...stylex.props(styles.container)}>
      <Grid {...args}>
        <GridItem>Item 1</GridItem>
        <GridItem>Item 2</GridItem>
        <GridItem>Item 3</GridItem>
        <GridItem>Item 4</GridItem>
        <GridItem>Item 5</GridItem>
        <GridItem>Item 6</GridItem>
      </Grid>
    </div>
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  render: () => <div {...stylex.props(styles.storyWrapper)}>
      <div {...stylex.props(styles.container)}>
        <Text type="supporting" xstyle={styles.sectionLabel}>
          2 Columns
        </Text>
        <Grid columns={2} gap={4}>
          <GridItem>Item 1</GridItem>
          <GridItem>Item 2</GridItem>
          <GridItem>Item 3</GridItem>
          <GridItem>Item 4</GridItem>
        </Grid>
      </div>
      <div {...stylex.props(styles.container)}>
        <Text type="supporting" xstyle={styles.sectionLabel}>
          4 Columns
        </Text>
        <Grid columns={4} gap={4}>
          <GridItem>Item 1</GridItem>
          <GridItem>Item 2</GridItem>
          <GridItem>Item 3</GridItem>
          <GridItem>Item 4</GridItem>
          <GridItem>Item 5</GridItem>
          <GridItem>Item 6</GridItem>
          <GridItem>Item 7</GridItem>
          <GridItem>Item 8</GridItem>
        </Grid>
      </div>
    </div>
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  render: () => <VStack gap={6}>
      <div {...stylex.props(styles.container)}>
        <Text type="supporting" xstyle={styles.sectionLabel}>
          {'columns={{minWidth: 200}} with 2 items — cards stretch to fill (auto-fit)'}
        </Text>
        <Grid columns={{
        minWidth: 200
      }} gap={4}>
          <GridItem>Item 1</GridItem>
          <GridItem>Item 2</GridItem>
        </Grid>
      </div>
      <div {...stylex.props(styles.container)}>
        <Text type="supporting" xstyle={styles.sectionLabel}>
          
          Same grid with 6 items; looks fine because items fill the tracks
        </Text>
        <Grid columns={{
        minWidth: 200
      }} gap={4}>
          <GridItem>Item 1</GridItem>
          <GridItem>Item 2</GridItem>
          <GridItem>Item 3</GridItem>
          <GridItem>Item 4</GridItem>
          <GridItem>Item 5</GridItem>
          <GridItem>Item 6</GridItem>
        </Grid>
      </div>
    </VStack>
}`,...x.parameters?.docs?.source},description:{story:`auto-fit (repeat: 'fit') stretches items to fill when there are fewer
items than available columns. Compare with auto-fill (default) which
preserves consistent widths.`,...x.parameters?.docs?.description}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  render: () => <div {...stylex.props(styles.container)}>
      <Text type="supporting" xstyle={styles.sectionLabel}>
        Resize the viewport — columns auto-fill, empty tracks preserved (min
        200px per item)
      </Text>
      <Grid columns={{
      minWidth: 200
    }} gap={4}>
        <GridItem>Item 1</GridItem>
        <GridItem>Item 2</GridItem>
        <GridItem>Item 3</GridItem>
      </Grid>
    </div>
}`,...S.parameters?.docs?.source},description:{story:`New API: responsive columns with auto-fill (consistent widths)`,...S.parameters?.docs?.description}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  render: () => <VStack gap={6}>
      <div {...stylex.props(styles.container)}>
        <Text type="supporting" xstyle={styles.sectionLabel}>
          auto-fill (default) — items stay consistent width, empty tracks
          preserved
        </Text>
        <Grid columns={{
        minWidth: 250
      }} gap={4}>
          <GridItem>Item 1</GridItem>
          <GridItem>Item 2</GridItem>
        </Grid>
      </div>
      <div {...stylex.props(styles.container)}>
        <Text type="supporting" xstyle={styles.sectionLabel}>
          auto-fit — items stretch to fill all available space
        </Text>
        <Grid columns={{
        minWidth: 250,
        repeat: 'fit'
      }} gap={4}>
          <GridItem>Item 1</GridItem>
          <GridItem>Item 2</GridItem>
        </Grid>
      </div>
    </VStack>
}`,...C.parameters?.docs?.source},description:{story:`Side-by-side comparison: auto-fill vs auto-fit with few items`,...C.parameters?.docs?.description}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  render: () => <div {...stylex.props(styles.container)}>
      <Text type="supporting" xstyle={styles.sectionLabel}>
        Responsive with max 3 columns (min 250px per item; column count is
        capped but present columns always fill)
      </Text>
      <Grid columns={{
      minWidth: 250,
      max: 3
    }} gap={4}>
        <GridItem>Item 1</GridItem>
        <GridItem>Item 2</GridItem>
        <GridItem>Item 3</GridItem>
        <GridItem>Item 4</GridItem>
        <GridItem>Item 5</GridItem>
        <GridItem>Item 6</GridItem>
      </Grid>
    </div>
}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  name: 'Capped — fills when collapsed (#3391)',
  render: () => <div {...stylex.props(styles.container)}>
      <Text type="supporting" xstyle={styles.sectionLabel}>
        columns={'{{minWidth: 360, max: 2}}'} — resize the viewport narrow
        enough that only one column fits. The lone column stretches to full
        width (no dead space on the right); on wider viewports it caps at 2.
      </Text>
      <div style={{
      maxWidth: 520,
      resize: 'horizontal',
      overflow: 'auto'
    }}>
        <Grid columns={{
        minWidth: 360,
        max: 2
      }} gap={4}>
          <GridItem>Left block</GridItem>
          <GridItem>Right block</GridItem>
        </Grid>
      </div>
    </div>
}`,...T.parameters?.docs?.source}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  render: () => <div {...stylex.props(styles.container)}>
      <Text type="supporting" xstyle={styles.sectionLabel}>
        Using GridSpan to span multiple columns/rows
      </Text>
      <Grid columns={4} gap={4}>
        <GridSpan columns={2}>
          <FeaturedItem>Spans 2 columns</FeaturedItem>
        </GridSpan>
        <GridItem>Normal</GridItem>
        <GridItem>Normal</GridItem>
        <GridItem>Normal</GridItem>
        <GridSpan columns={3}>
          <FeaturedItem>Spans 3 columns</FeaturedItem>
        </GridSpan>
        <GridSpan columns="full">
          <FeaturedItem>Full width (spans all columns)</FeaturedItem>
        </GridSpan>
      </Grid>
    </div>
}`,...E.parameters?.docs?.source}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  render: () => <div {...stylex.props(styles.container)}>
      <Text type="supporting" xstyle={styles.sectionLabel}>
        Grid items spanning both columns and rows
      </Text>
      <Grid columns={4} gap={4}>
        <GridSpan columns={2} rows={2}>
          <FeaturedItem>2x2 Featured</FeaturedItem>
        </GridSpan>
        <GridItem>Item 1</GridItem>
        <GridItem>Item 2</GridItem>
        <GridItem>Item 3</GridItem>
        <GridItem>Item 4</GridItem>
        <GridItem>Item 5</GridItem>
        <GridItem>Item 6</GridItem>
      </Grid>
    </div>
}`,...D.parameters?.docs?.source}}},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
  render: () => <Section variant="muted">
      <Text type="supporting" xstyle={styles.sectionLabel}>
        Gallery/Card Grid — Responsive with min 280px cards (auto-fill)
      </Text>
      <Grid columns={{
      minWidth: 280
    }} gap={5}>
        {Array.from({
        length: 8
      }, (_, i) => <Card key={i}>
            <div {...stylex.props(styles.cardImage)} />
            <Text type="label" display="block">
              Card Title {i + 1}
            </Text>
            <Text type="supporting" display="block">
              A brief description of the card content goes here.
            </Text>
          </Card>)}
      </Grid>
    </Section>
}`,...O.parameters?.docs?.source}}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  render: () => <div {...stylex.props(styles.storyWrapper)}>
      <div {...stylex.props(styles.container)}>
        <Text type="supporting" xstyle={styles.sectionLabel}>
          Same gap for rows and columns (gap=4)
        </Text>
        <Grid columns={3} gap={4}>
          <GridItem>Item 1</GridItem>
          <GridItem>Item 2</GridItem>
          <GridItem>Item 3</GridItem>
          <GridItem>Item 4</GridItem>
          <GridItem>Item 5</GridItem>
          <GridItem>Item 6</GridItem>
        </Grid>
      </div>
      <div {...stylex.props(styles.container)}>
        <Text type="supporting" xstyle={styles.sectionLabel}>
          Different gaps: rowGap=2, columnGap=6
        </Text>
        <Grid columns={3} rowGap={2} columnGap={6}>
          <GridItem>Item 1</GridItem>
          <GridItem>Item 2</GridItem>
          <GridItem>Item 3</GridItem>
          <GridItem>Item 4</GridItem>
          <GridItem>Item 5</GridItem>
          <GridItem>Item 6</GridItem>
        </Grid>
      </div>
    </div>
}`,...k.parameters?.docs?.source}}},A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  render: () => <Section variant="muted">
      <Text type="supporting" xstyle={styles.sectionLabel}>
        Dashboard-style layout with different sized widgets
      </Text>
      <Grid columns={4} gap={4}>
        <GridSpan columns={2} rows={2}>
          <Card>
            <Text type="label" display="block">
              Main Chart
            </Text>
            <Text type="supporting" display="block">
              Large visualization widget
            </Text>
          </Card>
        </GridSpan>
        <Card>
          <Text type="label" display="block">
            Metric 1
          </Text>
          <Text type="supporting" display="block">
            Quick stat
          </Text>
        </Card>
        <Card>
          <Text type="label" display="block">
            Metric 2
          </Text>
          <Text type="supporting" display="block">
            Quick stat
          </Text>
        </Card>
        <Card>
          <Text type="label" display="block">
            Metric 3
          </Text>
          <Text type="supporting" display="block">
            Quick stat
          </Text>
        </Card>
        <Card>
          <Text type="label" display="block">
            Metric 4
          </Text>
          <Text type="supporting" display="block">
            Quick stat
          </Text>
        </Card>
        <GridSpan columns="full">
          <Card>
            <Text type="label" display="block">
              Full-width Section
            </Text>
            <Text type="supporting" display="block">
              This section spans the entire width of the grid
            </Text>
          </Card>
        </GridSpan>
      </Grid>
    </Section>
}`,...A.parameters?.docs?.source}}},j=[`Default`,`FixedColumns`,`ResponsiveAutoFit`,`ResponsiveAutoFill`,`FillVsFitComparison`,`CappedResponsive`,`CappedCollapsesToFullWidth`,`WithGridSpan`,`GridSpanWithRows`,`GalleryExample`,`DifferentGaps`,`DashboardLayout`]})))()}M();export{T as CappedCollapsesToFullWidth,w as CappedResponsive,A as DashboardLayout,y as Default,k as DifferentGaps,C as FillVsFitComparison,b as FixedColumns,O as GalleryExample,D as GridSpanWithRows,S as ResponsiveAutoFill,x as ResponsiveAutoFit,E as WithGridSpan,j as __namedExportsOrder,g as default};