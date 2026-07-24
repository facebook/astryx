import{i as e}from"./preload-helper-CT_b8DTk.js";import{t}from"./jsx-runtime-DqZldVDK.js";import{t as n}from"./Text-Iat6xWeA.js";import{n as r,t as i}from"./Card-B6hq5pd9.js";import{i as a,t as o}from"./Stack-C7dTtCDZ.js";import{t as s}from"./Section-uPZCRnkC.js";import{t as c}from"./Section-C4pDrmx1.js";import{t as l}from"./Text-BUJwo4gL.js";import{t as u}from"./Grid-D30rfaCh.js";import{Cn as d,wn as f}from"./iframe-CER2Y08S.js";var p,m,h,g,_,v,y,b,x,S,C,w,T,E,D,O,k,A;e((()=>{d(),i(),c(),l(),o(),p=t(),m={sectionLabel:{k1K539:`x1p37lm5`,$$css:!0}},h={title:`Core/Grid`,component:u,tags:[`autodocs`],argTypes:{columns:{control:`object`,description:`Column configuration: number for fixed columns, or {minWidth, max?, repeat?} for responsive`},gap:{control:`select`,options:[0,.5,1,1.5,2,3,4,5,6,8,10],description:`Spacing between all grid items`},rowGap:{control:`select`,options:[0,.5,1,1.5,2,3,4,5,6,8,10],description:`Spacing between rows (overrides gap)`},columnGap:{control:`select`,options:[0,.5,1,1.5,2,3,4,5,6,8,10],description:`Spacing between columns (overrides gap)`},align:{control:`select`,options:[`start`,`center`,`end`,`stretch`],description:`Vertical alignment of grid items`},justify:{control:`select`,options:[`start`,`center`,`end`,`stretch`],description:`Horizontal alignment of grid items`}}},g=({children:e})=>(0,p.jsx)(`div`,{className:`x1shk3sm x1eiddq6 xh6dtrn x2b8uid`,children:(0,p.jsx)(n,{type:`body`,children:e})}),_=({children:e})=>(0,p.jsx)(`div`,{className:`x1gt495 xgcxg3y xh6dtrn x2b8uid x5yr21d x9f619`,children:(0,p.jsx)(n,{type:`body`,children:e})}),v={args:{columns:3,gap:4},render:e=>(0,p.jsx)(`div`,{className:`x1shk3sm x10xzikg`,children:(0,p.jsxs)(u,{...e,children:[(0,p.jsx)(g,{children:`Item 1`}),(0,p.jsx)(g,{children:`Item 2`}),(0,p.jsx)(g,{children:`Item 3`}),(0,p.jsx)(g,{children:`Item 4`}),(0,p.jsx)(g,{children:`Item 5`}),(0,p.jsx)(g,{children:`Item 6`})]})})},y={render:()=>(0,p.jsxs)(`div`,{className:`x78zum5 xdt5ytf x1qh66ti`,children:[(0,p.jsxs)(`div`,{className:`x1shk3sm x10xzikg`,children:[(0,p.jsx)(n,{type:`supporting`,xstyle:m.sectionLabel,children:`2 Columns`}),(0,p.jsxs)(u,{columns:2,gap:4,children:[(0,p.jsx)(g,{children:`Item 1`}),(0,p.jsx)(g,{children:`Item 2`}),(0,p.jsx)(g,{children:`Item 3`}),(0,p.jsx)(g,{children:`Item 4`})]})]}),(0,p.jsxs)(`div`,{className:`x1shk3sm x10xzikg`,children:[(0,p.jsx)(n,{type:`supporting`,xstyle:m.sectionLabel,children:`4 Columns`}),(0,p.jsxs)(u,{columns:4,gap:4,children:[(0,p.jsx)(g,{children:`Item 1`}),(0,p.jsx)(g,{children:`Item 2`}),(0,p.jsx)(g,{children:`Item 3`}),(0,p.jsx)(g,{children:`Item 4`}),(0,p.jsx)(g,{children:`Item 5`}),(0,p.jsx)(g,{children:`Item 6`}),(0,p.jsx)(g,{children:`Item 7`}),(0,p.jsx)(g,{children:`Item 8`})]})]})]})},b={render:()=>(0,p.jsxs)(a,{gap:6,children:[(0,p.jsxs)(`div`,{className:`x1shk3sm x10xzikg`,children:[(0,p.jsx)(n,{type:`supporting`,xstyle:m.sectionLabel,children:`columns={{minWidth: 200}} with 2 items — cards stretch to fill (auto-fit)`}),(0,p.jsxs)(u,{columns:{minWidth:200},gap:4,children:[(0,p.jsx)(g,{children:`Item 1`}),(0,p.jsx)(g,{children:`Item 2`})]})]}),(0,p.jsxs)(`div`,{className:`x1shk3sm x10xzikg`,children:[(0,p.jsx)(n,{type:`supporting`,xstyle:m.sectionLabel,children:`Same grid with 6 items; looks fine because items fill the tracks`}),(0,p.jsxs)(u,{columns:{minWidth:200},gap:4,children:[(0,p.jsx)(g,{children:`Item 1`}),(0,p.jsx)(g,{children:`Item 2`}),(0,p.jsx)(g,{children:`Item 3`}),(0,p.jsx)(g,{children:`Item 4`}),(0,p.jsx)(g,{children:`Item 5`}),(0,p.jsx)(g,{children:`Item 6`})]})]})]})},x={render:()=>(0,p.jsxs)(`div`,{className:`x1shk3sm x10xzikg`,children:[(0,p.jsx)(n,{type:`supporting`,xstyle:m.sectionLabel,children:`Resize the viewport — columns auto-fill, empty tracks preserved (min 200px per item)`}),(0,p.jsxs)(u,{columns:{minWidth:200},gap:4,children:[(0,p.jsx)(g,{children:`Item 1`}),(0,p.jsx)(g,{children:`Item 2`}),(0,p.jsx)(g,{children:`Item 3`})]})]})},S={render:()=>(0,p.jsxs)(a,{gap:6,children:[(0,p.jsxs)(`div`,{className:`x1shk3sm x10xzikg`,children:[(0,p.jsx)(n,{type:`supporting`,xstyle:m.sectionLabel,children:`auto-fill (default) — items stay consistent width, empty tracks preserved`}),(0,p.jsxs)(u,{columns:{minWidth:250},gap:4,children:[(0,p.jsx)(g,{children:`Item 1`}),(0,p.jsx)(g,{children:`Item 2`})]})]}),(0,p.jsxs)(`div`,{className:`x1shk3sm x10xzikg`,children:[(0,p.jsx)(n,{type:`supporting`,xstyle:m.sectionLabel,children:`auto-fit — items stretch to fill all available space`}),(0,p.jsxs)(u,{columns:{minWidth:250,repeat:`fit`},gap:4,children:[(0,p.jsx)(g,{children:`Item 1`}),(0,p.jsx)(g,{children:`Item 2`})]})]})]})},C={render:()=>(0,p.jsxs)(`div`,{className:`x1shk3sm x10xzikg`,children:[(0,p.jsx)(n,{type:`supporting`,xstyle:m.sectionLabel,children:`Responsive with max 3 columns (min 250px per item; column count is capped but present columns always fill)`}),(0,p.jsxs)(u,{columns:{minWidth:250,max:3},gap:4,children:[(0,p.jsx)(g,{children:`Item 1`}),(0,p.jsx)(g,{children:`Item 2`}),(0,p.jsx)(g,{children:`Item 3`}),(0,p.jsx)(g,{children:`Item 4`}),(0,p.jsx)(g,{children:`Item 5`}),(0,p.jsx)(g,{children:`Item 6`})]})]})},w={name:`Capped — fills when collapsed (#3391)`,render:()=>(0,p.jsxs)(`div`,{className:`x1shk3sm x10xzikg`,children:[(0,p.jsxs)(n,{type:`supporting`,xstyle:m.sectionLabel,children:[`columns=`,`{{minWidth: 360, max: 2}}`,` — resize the viewport narrow enough that only one column fits. The lone column stretches to full width (no dead space on the right); on wider viewports it caps at 2.`]}),(0,p.jsx)(`div`,{style:{maxWidth:520,resize:`horizontal`,overflow:`auto`},children:(0,p.jsxs)(u,{columns:{minWidth:360,max:2},gap:4,children:[(0,p.jsx)(g,{children:`Left block`}),(0,p.jsx)(g,{children:`Right block`})]})})]})},T={render:()=>(0,p.jsxs)(`div`,{className:`x1shk3sm x10xzikg`,children:[(0,p.jsx)(n,{type:`supporting`,xstyle:m.sectionLabel,children:`Using GridSpan to span multiple columns/rows`}),(0,p.jsxs)(u,{columns:4,gap:4,children:[(0,p.jsx)(f,{columns:2,children:(0,p.jsx)(_,{children:`Spans 2 columns`})}),(0,p.jsx)(g,{children:`Normal`}),(0,p.jsx)(g,{children:`Normal`}),(0,p.jsx)(g,{children:`Normal`}),(0,p.jsx)(f,{columns:3,children:(0,p.jsx)(_,{children:`Spans 3 columns`})}),(0,p.jsx)(f,{columns:`full`,children:(0,p.jsx)(_,{children:`Full width (spans all columns)`})})]})]})},E={render:()=>(0,p.jsxs)(`div`,{className:`x1shk3sm x10xzikg`,children:[(0,p.jsx)(n,{type:`supporting`,xstyle:m.sectionLabel,children:`Grid items spanning both columns and rows`}),(0,p.jsxs)(u,{columns:4,gap:4,children:[(0,p.jsx)(f,{columns:2,rows:2,children:(0,p.jsx)(_,{children:`2x2 Featured`})}),(0,p.jsx)(g,{children:`Item 1`}),(0,p.jsx)(g,{children:`Item 2`}),(0,p.jsx)(g,{children:`Item 3`}),(0,p.jsx)(g,{children:`Item 4`}),(0,p.jsx)(g,{children:`Item 5`}),(0,p.jsx)(g,{children:`Item 6`})]})]})},D={render:()=>(0,p.jsxs)(s,{variant:`muted`,children:[(0,p.jsx)(n,{type:`supporting`,xstyle:m.sectionLabel,children:`Gallery/Card Grid — Responsive with min 280px cards (auto-fill)`}),(0,p.jsx)(u,{columns:{minWidth:280},gap:5,children:Array.from({length:8},(e,t)=>(0,p.jsxs)(r,{children:[(0,p.jsx)(`div`,{className:`x1wkxgih x1eiddq6 xh6dtrn xep27e5`}),(0,p.jsxs)(n,{type:`label`,display:`block`,children:[`Card Title `,t+1]}),(0,p.jsx)(n,{type:`supporting`,display:`block`,children:`A brief description of the card content goes here.`})]},t))})]})},O={render:()=>(0,p.jsxs)(`div`,{className:`x78zum5 xdt5ytf x1qh66ti`,children:[(0,p.jsxs)(`div`,{className:`x1shk3sm x10xzikg`,children:[(0,p.jsx)(n,{type:`supporting`,xstyle:m.sectionLabel,children:`Same gap for rows and columns (gap=4)`}),(0,p.jsxs)(u,{columns:3,gap:4,children:[(0,p.jsx)(g,{children:`Item 1`}),(0,p.jsx)(g,{children:`Item 2`}),(0,p.jsx)(g,{children:`Item 3`}),(0,p.jsx)(g,{children:`Item 4`}),(0,p.jsx)(g,{children:`Item 5`}),(0,p.jsx)(g,{children:`Item 6`})]})]}),(0,p.jsxs)(`div`,{className:`x1shk3sm x10xzikg`,children:[(0,p.jsx)(n,{type:`supporting`,xstyle:m.sectionLabel,children:`Different gaps: rowGap=2, columnGap=6`}),(0,p.jsxs)(u,{columns:3,rowGap:2,columnGap:6,children:[(0,p.jsx)(g,{children:`Item 1`}),(0,p.jsx)(g,{children:`Item 2`}),(0,p.jsx)(g,{children:`Item 3`}),(0,p.jsx)(g,{children:`Item 4`}),(0,p.jsx)(g,{children:`Item 5`}),(0,p.jsx)(g,{children:`Item 6`})]})]})]})},k={render:()=>(0,p.jsxs)(s,{variant:`muted`,children:[(0,p.jsx)(n,{type:`supporting`,xstyle:m.sectionLabel,children:`Dashboard-style layout with different sized widgets`}),(0,p.jsxs)(u,{columns:4,gap:4,children:[(0,p.jsx)(f,{columns:2,rows:2,children:(0,p.jsxs)(r,{children:[(0,p.jsx)(n,{type:`label`,display:`block`,children:`Main Chart`}),(0,p.jsx)(n,{type:`supporting`,display:`block`,children:`Large visualization widget`})]})}),(0,p.jsxs)(r,{children:[(0,p.jsx)(n,{type:`label`,display:`block`,children:`Metric 1`}),(0,p.jsx)(n,{type:`supporting`,display:`block`,children:`Quick stat`})]}),(0,p.jsxs)(r,{children:[(0,p.jsx)(n,{type:`label`,display:`block`,children:`Metric 2`}),(0,p.jsx)(n,{type:`supporting`,display:`block`,children:`Quick stat`})]}),(0,p.jsxs)(r,{children:[(0,p.jsx)(n,{type:`label`,display:`block`,children:`Metric 3`}),(0,p.jsx)(n,{type:`supporting`,display:`block`,children:`Quick stat`})]}),(0,p.jsxs)(r,{children:[(0,p.jsx)(n,{type:`label`,display:`block`,children:`Metric 4`}),(0,p.jsx)(n,{type:`supporting`,display:`block`,children:`Quick stat`})]}),(0,p.jsx)(f,{columns:`full`,children:(0,p.jsxs)(r,{children:[(0,p.jsx)(n,{type:`label`,display:`block`,children:`Full-width Section`}),(0,p.jsx)(n,{type:`supporting`,display:`block`,children:`This section spans the entire width of the grid`})]})})]})]})},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
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
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
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
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
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
}`,...b.parameters?.docs?.source},description:{story:`auto-fit (repeat: 'fit') stretches items to fill when there are fewer
items than available columns. Compare with auto-fill (default) which
preserves consistent widths.`,...b.parameters?.docs?.description}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
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
}`,...x.parameters?.docs?.source},description:{story:`New API: responsive columns with auto-fill (consistent widths)`,...x.parameters?.docs?.description}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
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
}`,...S.parameters?.docs?.source},description:{story:`Side-by-side comparison: auto-fill vs auto-fit with few items`,...S.parameters?.docs?.description}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
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
}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
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
}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
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
}`,...T.parameters?.docs?.source}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
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
}`,...E.parameters?.docs?.source}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
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
}`,...D.parameters?.docs?.source}}},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
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
}`,...O.parameters?.docs?.source}}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
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
}`,...k.parameters?.docs?.source}}},A=[`Default`,`FixedColumns`,`ResponsiveAutoFit`,`ResponsiveAutoFill`,`FillVsFitComparison`,`CappedResponsive`,`CappedCollapsesToFullWidth`,`WithGridSpan`,`GridSpanWithRows`,`GalleryExample`,`DifferentGaps`,`DashboardLayout`]}))();export{w as CappedCollapsesToFullWidth,C as CappedResponsive,k as DashboardLayout,v as Default,O as DifferentGaps,S as FillVsFitComparison,y as FixedColumns,D as GalleryExample,E as GridSpanWithRows,x as ResponsiveAutoFill,b as ResponsiveAutoFit,T as WithGridSpan,A as __namedExportsOrder,h as default};