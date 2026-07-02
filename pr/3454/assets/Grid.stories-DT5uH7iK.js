import{a1 as e,T as s}from"./iframe-DVtWfngO.js";import{G as i}from"./Grid-pQbt4AHV.js";import{G as l}from"./GridSpan-CrcCvc6O.js";import{C as n}from"./Card-D9sgUp9L.js";import{S as b}from"./Section-Dd4bpkHJ.js";import{V as v}from"./VStack-CGn3zjL6.js";import"./preload-helper-Ct5FWWRu.js";import"./container.stylex-uilBL6DE.js";import"./padding.stylex-Dl2_Pyt1.js";import"./Stack-BrtSPKVR.js";import"./stack.stylex-BlarxY2N.js";const r={sectionLabel:{k1K539:"x1p37lm5",$$css:!0}},R={title:"Core/Grid",component:i,tags:["autodocs"],argTypes:{columns:{control:"object",description:"Column configuration: number for fixed columns, or {minWidth, max?, repeat?} for responsive"},gap:{control:"select",options:[0,.5,1,1.5,2,3,4,5,6,8,10],description:"Spacing between all grid items"},rowGap:{control:"select",options:[0,.5,1,1.5,2,3,4,5,6,8,10],description:"Spacing between rows (overrides gap)"},columnGap:{control:"select",options:[0,.5,1,1.5,2,3,4,5,6,8,10],description:"Spacing between columns (overrides gap)"},align:{control:"select",options:["start","center","end","stretch"],description:"Vertical alignment of grid items"},justify:{control:"select",options:["start","center","end","stretch"],description:"Horizontal alignment of grid items"}}},t=({children:d})=>e.jsx("div",{className:"x1shk3sm x1eiddq6 xh6dtrn x2b8uid",children:e.jsx(s,{type:"body",children:d})}),j=({children:d})=>e.jsx("div",{className:"x1gt495 xgcxg3y xh6dtrn x2b8uid x5yr21d x9f619",children:e.jsx(s,{type:"body",children:d})}),c={args:{columns:3,gap:4},render:d=>e.jsx("div",{className:"x1shk3sm x10xzikg",children:e.jsxs(i,{...d,children:[e.jsx(t,{children:"Item 1"}),e.jsx(t,{children:"Item 2"}),e.jsx(t,{children:"Item 3"}),e.jsx(t,{children:"Item 4"}),e.jsx(t,{children:"Item 5"}),e.jsx(t,{children:"Item 6"})]})})},p={render:()=>e.jsxs("div",{className:"x78zum5 xdt5ytf x1qh66ti",children:[e.jsxs("div",{className:"x1shk3sm x10xzikg",children:[e.jsx(s,{type:"supporting",xstyle:r.sectionLabel,children:"2 Columns"}),e.jsxs(i,{columns:2,gap:4,children:[e.jsx(t,{children:"Item 1"}),e.jsx(t,{children:"Item 2"}),e.jsx(t,{children:"Item 3"}),e.jsx(t,{children:"Item 4"})]})]}),e.jsxs("div",{className:"x1shk3sm x10xzikg",children:[e.jsx(s,{type:"supporting",xstyle:r.sectionLabel,children:"4 Columns"}),e.jsxs(i,{columns:4,gap:4,children:[e.jsx(t,{children:"Item 1"}),e.jsx(t,{children:"Item 2"}),e.jsx(t,{children:"Item 3"}),e.jsx(t,{children:"Item 4"}),e.jsx(t,{children:"Item 5"}),e.jsx(t,{children:"Item 6"}),e.jsx(t,{children:"Item 7"}),e.jsx(t,{children:"Item 8"})]})]})]})},a={render:()=>e.jsxs(v,{gap:6,children:[e.jsxs("div",{className:"x1shk3sm x10xzikg",children:[e.jsx(s,{type:"supporting",xstyle:r.sectionLabel,children:"columns={{minWidth: 200}} with 2 items — cards stretch to fill (auto-fit)"}),e.jsxs(i,{columns:{minWidth:200},gap:4,children:[e.jsx(t,{children:"Item 1"}),e.jsx(t,{children:"Item 2"})]})]}),e.jsxs("div",{className:"x1shk3sm x10xzikg",children:[e.jsx(s,{type:"supporting",xstyle:r.sectionLabel,children:"Same grid with 6 items; looks fine because items fill the tracks"}),e.jsxs(i,{columns:{minWidth:200},gap:4,children:[e.jsx(t,{children:"Item 1"}),e.jsx(t,{children:"Item 2"}),e.jsx(t,{children:"Item 3"}),e.jsx(t,{children:"Item 4"}),e.jsx(t,{children:"Item 5"}),e.jsx(t,{children:"Item 6"})]})]})]})},m={render:()=>e.jsxs("div",{className:"x1shk3sm x10xzikg",children:[e.jsx(s,{type:"supporting",xstyle:r.sectionLabel,children:"Resize the viewport — columns auto-fill, empty tracks preserved (min 200px per item)"}),e.jsxs(i,{columns:{minWidth:200},gap:4,children:[e.jsx(t,{children:"Item 1"}),e.jsx(t,{children:"Item 2"}),e.jsx(t,{children:"Item 3"})]})]})},o={render:()=>e.jsxs(v,{gap:6,children:[e.jsxs("div",{className:"x1shk3sm x10xzikg",children:[e.jsx(s,{type:"supporting",xstyle:r.sectionLabel,children:"auto-fill (default) — items stay consistent width, empty tracks preserved"}),e.jsxs(i,{columns:{minWidth:250},gap:4,children:[e.jsx(t,{children:"Item 1"}),e.jsx(t,{children:"Item 2"})]})]}),e.jsxs("div",{className:"x1shk3sm x10xzikg",children:[e.jsx(s,{type:"supporting",xstyle:r.sectionLabel,children:"auto-fit — items stretch to fill all available space"}),e.jsxs(i,{columns:{minWidth:250,repeat:"fit"},gap:4,children:[e.jsx(t,{children:"Item 1"}),e.jsx(t,{children:"Item 2"})]})]})]})},x={render:()=>e.jsxs("div",{className:"x1shk3sm x10xzikg",children:[e.jsx(s,{type:"supporting",xstyle:r.sectionLabel,children:"Responsive with max 3 columns (min 250px per item, capped via track-max)"}),e.jsxs(i,{columns:{minWidth:250,max:3},gap:4,children:[e.jsx(t,{children:"Item 1"}),e.jsx(t,{children:"Item 2"}),e.jsx(t,{children:"Item 3"}),e.jsx(t,{children:"Item 4"}),e.jsx(t,{children:"Item 5"}),e.jsx(t,{children:"Item 6"})]})]})},I={render:()=>e.jsxs("div",{className:"x1shk3sm x10xzikg",children:[e.jsx(s,{type:"supporting",xstyle:r.sectionLabel,children:"Using GridSpan to span multiple columns/rows"}),e.jsxs(i,{columns:4,gap:4,children:[e.jsx(l,{columns:2,children:e.jsx(j,{children:"Spans 2 columns"})}),e.jsx(t,{children:"Normal"}),e.jsx(t,{children:"Normal"}),e.jsx(t,{children:"Normal"}),e.jsx(l,{columns:3,children:e.jsx(j,{children:"Spans 3 columns"})}),e.jsx(l,{columns:"full",children:e.jsx(j,{children:"Full width (spans all columns)"})})]})]})},h={render:()=>e.jsxs("div",{className:"x1shk3sm x10xzikg",children:[e.jsx(s,{type:"supporting",xstyle:r.sectionLabel,children:"Grid items spanning both columns and rows"}),e.jsxs(i,{columns:4,gap:4,children:[e.jsx(l,{columns:2,rows:2,children:e.jsx(j,{children:"2x2 Featured"})}),e.jsx(t,{children:"Item 1"}),e.jsx(t,{children:"Item 2"}),e.jsx(t,{children:"Item 3"}),e.jsx(t,{children:"Item 4"}),e.jsx(t,{children:"Item 5"}),e.jsx(t,{children:"Item 6"})]})]})},u={render:()=>e.jsxs(b,{variant:"muted",children:[e.jsx(s,{type:"supporting",xstyle:r.sectionLabel,children:"Gallery/Card Grid — Responsive with min 280px cards (auto-fill)"}),e.jsx(i,{columns:{minWidth:280},gap:5,children:Array.from({length:8},(d,g)=>e.jsxs(n,{children:[e.jsx("div",{className:"x1wkxgih x1eiddq6 xh6dtrn xep27e5"}),e.jsxs(s,{type:"label",display:"block",children:["Card Title ",g+1]}),e.jsx(s,{type:"supporting",display:"block",children:"A brief description of the card content goes here."})]},g))})]})},y={render:()=>e.jsxs("div",{className:"x78zum5 xdt5ytf x1qh66ti",children:[e.jsxs("div",{className:"x1shk3sm x10xzikg",children:[e.jsx(s,{type:"supporting",xstyle:r.sectionLabel,children:"Same gap for rows and columns (gap=4)"}),e.jsxs(i,{columns:3,gap:4,children:[e.jsx(t,{children:"Item 1"}),e.jsx(t,{children:"Item 2"}),e.jsx(t,{children:"Item 3"}),e.jsx(t,{children:"Item 4"}),e.jsx(t,{children:"Item 5"}),e.jsx(t,{children:"Item 6"})]})]}),e.jsxs("div",{className:"x1shk3sm x10xzikg",children:[e.jsx(s,{type:"supporting",xstyle:r.sectionLabel,children:"Different gaps: rowGap=2, columnGap=6"}),e.jsxs(i,{columns:3,rowGap:2,columnGap:6,children:[e.jsx(t,{children:"Item 1"}),e.jsx(t,{children:"Item 2"}),e.jsx(t,{children:"Item 3"}),e.jsx(t,{children:"Item 4"}),e.jsx(t,{children:"Item 5"}),e.jsx(t,{children:"Item 6"})]})]})]})},G={render:()=>e.jsxs(b,{variant:"muted",children:[e.jsx(s,{type:"supporting",xstyle:r.sectionLabel,children:"Dashboard-style layout with different sized widgets"}),e.jsxs(i,{columns:4,gap:4,children:[e.jsx(l,{columns:2,rows:2,children:e.jsxs(n,{children:[e.jsx(s,{type:"label",display:"block",children:"Main Chart"}),e.jsx(s,{type:"supporting",display:"block",children:"Large visualization widget"})]})}),e.jsxs(n,{children:[e.jsx(s,{type:"label",display:"block",children:"Metric 1"}),e.jsx(s,{type:"supporting",display:"block",children:"Quick stat"})]}),e.jsxs(n,{children:[e.jsx(s,{type:"label",display:"block",children:"Metric 2"}),e.jsx(s,{type:"supporting",display:"block",children:"Quick stat"})]}),e.jsxs(n,{children:[e.jsx(s,{type:"label",display:"block",children:"Metric 3"}),e.jsx(s,{type:"supporting",display:"block",children:"Quick stat"})]}),e.jsxs(n,{children:[e.jsx(s,{type:"label",display:"block",children:"Metric 4"}),e.jsx(s,{type:"supporting",display:"block",children:"Quick stat"})]}),e.jsx(l,{columns:"full",children:e.jsxs(n,{children:[e.jsx(s,{type:"label",display:"block",children:"Full-width Section"}),e.jsx(s,{type:"supporting",display:"block",children:"This section spans the entire width of the grid"})]})})]})]})};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
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
}`,...c.parameters?.docs?.source}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
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
}`,...p.parameters?.docs?.source}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
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
}`,...a.parameters?.docs?.source},description:{story:`auto-fit (repeat: 'fit') stretches items to fill when there are fewer
items than available columns. Compare with auto-fill (default) which
preserves consistent widths.`,...a.parameters?.docs?.description}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
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
}`,...m.parameters?.docs?.source},description:{story:"New API: responsive columns with auto-fill (consistent widths)",...m.parameters?.docs?.description}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
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
}`,...o.parameters?.docs?.source},description:{story:"Side-by-side comparison: auto-fill vs auto-fit with few items",...o.parameters?.docs?.description}}};x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  render: () => <div {...stylex.props(styles.container)}>
      <Text type="supporting" xstyle={styles.sectionLabel}>
        Responsive with max 3 columns (min 250px per item, capped via track-max)
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
}`,...x.parameters?.docs?.source}}};I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{
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
}`,...I.parameters?.docs?.source}}};h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
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
}`,...h.parameters?.docs?.source}}};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
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
}`,...u.parameters?.docs?.source}}};y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
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
}`,...y.parameters?.docs?.source}}};G.parameters={...G.parameters,docs:{...G.parameters?.docs,source:{originalSource:`{
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
}`,...G.parameters?.docs?.source}}};const D=["Default","FixedColumns","ResponsiveAutoFit","ResponsiveAutoFill","FillVsFitComparison","CappedResponsive","WithGridSpan","GridSpanWithRows","GalleryExample","DifferentGaps","DashboardLayout"];export{x as CappedResponsive,G as DashboardLayout,c as Default,y as DifferentGaps,o as FillVsFitComparison,p as FixedColumns,u as GalleryExample,h as GridSpanWithRows,m as ResponsiveAutoFill,a as ResponsiveAutoFit,I as WithGridSpan,D as __namedExportsOrder,R as default};
