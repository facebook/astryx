import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{n as t,t as n}from"./stylex-Dft6gtPK.js";import{n as r}from"./mergeProps-JRyAvMxc.js";import{n as i,t as a}from"./themeProps-CREkzZh6.js";import{t as o}from"./jsx-runtime-DeHZSEgm.js";import{n as s,t as c}from"./Card-270yxekz.js";import{n as l,t as u}from"./HStack-DtZv8gmp.js";import{n as d,t as f}from"./VStack-C2SBQ4Fm.js";import{n as p,t as m}from"./Grid-DS-HeJ6q.js";function h({label:e,value:n,delta:a,description:o,media:s,size:c=`md`,xstyle:l,className:u,style:d,ref:f,...p}){let m=a==null?null:a.sentiment??b[a.direction];return(0,g.jsxs)(`div`,{ref:f,...r(i(`stat`,{size:c}),t(_.base,l),u,d),...p,children:[(0,g.jsx)(`span`,{className:`astryx141an7d astryx1ltkj2j astryx1e4wzip astryxv1l7n4`,children:e}),(0,g.jsxs)(`span`,{className:`astryx78zum5 astryx1pha0wt astryx1txdalj astryxeuugli`,children:[(0,g.jsx)(`span`,{...t(_.value,v[c]),children:n}),a!=null&&m!=null?(0,g.jsxs)(`span`,{"data-sentiment":m,...t(_.delta,y[m]),children:[(0,g.jsx)(`svg`,{"aria-hidden":`true`,viewBox:`0 0 12 12`,width:12,height:12,fill:`none`,stroke:`currentColor`,strokeWidth:1.5,strokeLinecap:`round`,strokeLinejoin:`round`,className:`astryx2lah0s`,children:(0,g.jsx)(`path`,{d:S[a.direction]})}),a.value,(0,g.jsxs)(`span`,{className:`astryx10l6tqk astryx1i1rx1s astryxjm9jq1 astryx1717udv astryxkdpibf astryxb3r6kr astryxeh89do astryxuxw1ft astryxc342km`,children:[`(`,x[a.direction],`)`]})]}):null]}),o==null?null:(0,g.jsx)(`span`,{className:`astryx141an7d astryx1ltkj2j astryxv1l7n4`,children:o}),s==null?null:(0,g.jsx)(`div`,{className:`astryxcsaf9d astryxkh2ocl astryxeuugli`,children:s})]})}var g,_,v,y,b,x,S;function C(){return(C=e((()=>{n(),a(),g=o(),_={base:{k1xSpc:`astryx78zum5`,kXwgrk:`astryxdt5ytf`,kGNEyG:`astryx1cy8zhl`,kOIVth:`astryxzye2dw`,k7Eaqz:`astryxeuugli`,$$css:!0},value:{kMv6JI:`astryx1g81bgm`,k63SB2:`astryx2mo6ok`,kLWn49:`astryx1cpk1wn`,kMwMTN:`astryx1tgivj0`,kcqcaj:`astryxss6m8b`,$$css:!0},delta:{k1xSpc:`astryx3nfvp2`,kGNEyG:`astryx6s0dn4`,kOIVth:`astryxzye2dw`,kGuDYH:`astryx141an7d`,kLWn49:`astryx1ltkj2j`,k63SB2:`astryx1e4wzip`,kcqcaj:`astryxss6m8b`,khDVqt:`astryxuxw1ft`,$$css:!0}},v={sm:{kGuDYH:`astryx1wqms48`,$$css:!0},md:{kGuDYH:`astryxhs0kqb`,$$css:!0},lg:{kGuDYH:`astryx10srzze`,$$css:!0}},y={positive:{kMwMTN:`astryxtjic6`,$$css:!0},negative:{kMwMTN:`astryxjt36v0`,$$css:!0},neutral:{kMwMTN:`astryxv1l7n4`,$$css:!0}},b={up:`positive`,down:`negative`,flat:`neutral`},x={up:`trending up`,down:`trending down`,flat:`flat`},S={up:`M3.5 8.5L8.5 3.5M8.5 3.5H4.75M8.5 3.5V7.25`,down:`M3.5 3.5L8.5 8.5M8.5 8.5H4.75M8.5 8.5V4.75`,flat:`M2.5 6H9.5`},h.displayName=`Stat`,h.__docgenInfo={description:`A KPI/metric display: label, large tabular-nums value, optional
sentiment-aware delta, supporting description, and a trend media slot.

The delta's color follows its direction (up=success, down=error,
flat=secondary) unless \`sentiment\` overrides it — use that for inverted
metrics where a drop is good (error rate, latency, churn).

Styles use Astryx theme tokens via StyleX.
Wrap your app in \`<Theme>\` to apply a theme.

@example
\`\`\`
<Stat label="Total requests" value="2.4M" delta={{value: '+12.4%', direction: 'up'}} />
<Stat
  label="Error rate"
  value="0.42%"
  delta={{value: '-0.08%', direction: 'down', sentiment: 'positive'}}
  description="vs. previous 30 days"
/>
<Stat label="Active users" value="18,204" size="lg" media={<Sparkline />} />
\`\`\``,methods:[],displayName:`Stat`,props:{xstyle:{required:!1,tsType:{name:`StyleXStyles`},description:"StyleX styles created via `stylex.create()`. Merged with the component's\nbase styles inside a single `stylex.props()` call for optimal deduplication.\n\n@example\n```\nconst overrides = stylex.create({ root: { marginBottom: 8 } });\n<Component xstyle={overrides.root} />\n```"},ref:{required:!1,tsType:{name:`ReactRef`,raw:`React.Ref<HTMLDivElement>`,elements:[{name:`HTMLDivElement`}]},description:`Ref forwarded to the root element`},label:{required:!0,tsType:{name:`string`},description:`Metric name shown above the value, e.g. "Total requests".`},value:{required:!0,tsType:{name:`ReactNode`},description:`The headline metric. Rendered large with tabular numerals so digits
keep a fixed width. Pass a pre-formatted string like "1.2M".`},delta:{required:!1,tsType:{name:`StatDelta`},description:`Change indicator rendered next to the value: an up/down/flat glyph
plus colored text. \`sentiment\` overrides the direction color mapping
for inverted metrics like error rate.`},description:{required:!1,tsType:{name:`string`},description:`Muted supporting line under the value, e.g. "vs. previous 30 days".`},media:{required:!1,tsType:{name:`ReactNode`},description:`Trend slot rendered below the text content, e.g. a sparkline or mini
chart. Stat does not render a chart itself.`},size:{required:!1,tsType:{name:`union`,raw:`'sm' | 'md' | 'lg'`,elements:[{name:`literal`,value:`'sm'`},{name:`literal`,value:`'md'`},{name:`literal`,value:`'lg'`}]},description:`Size variant controlling the value's font size.
@default 'md'`,defaultValue:{value:`'md'`,computed:!1}}},composes:[`Omit`]}})))()}var w,T,E,D,O,k;function A(){return(A=e((()=>{C(),s(),p(),l(),d(),w=o(),T={title:`Lab/Stat`,component:h,tags:[`autodocs`],parameters:{layout:`centered`},decorators:[e=>(0,w.jsx)(`div`,{style:{width:760,maxWidth:`100%`},children:(0,w.jsx)(e,{})})]},E={render:()=>(0,w.jsxs)(m,{columns:{minWidth:160,repeat:`fit`},gap:6,children:[(0,w.jsx)(c,{children:(0,w.jsx)(h,{label:`Total revenue`,value:`$1.28M`,delta:{value:`+12.4%`,direction:`up`},description:`vs. previous 30 days`})}),(0,w.jsx)(c,{children:(0,w.jsx)(h,{label:`Error rate`,value:`0.42%`,delta:{value:`-0.08%`,direction:`down`,sentiment:`positive`},description:`vs. previous 30 days`})}),(0,w.jsx)(c,{children:(0,w.jsx)(h,{label:`Active users`,value:`18,204`,delta:{value:`0.0%`,direction:`flat`},description:`vs. previous 30 days`})})]})},D={render:()=>(0,w.jsxs)(u,{gap:8,vAlign:`end`,children:[(0,w.jsx)(h,{label:`Deploys`,value:`128`,size:`sm`,delta:{value:`+6`,direction:`up`}}),(0,w.jsx)(h,{label:`Deploys`,value:`128`,size:`md`,delta:{value:`+6`,direction:`up`}}),(0,w.jsx)(h,{label:`Deploys`,value:`128`,size:`lg`,delta:{value:`+6`,direction:`up`}})]})},O={render:()=>(0,w.jsx)(c,{children:(0,w.jsx)(f,{gap:4,children:(0,w.jsx)(h,{label:`Conversion`,value:`7.8%`,delta:{value:`+0.9%`,direction:`up`},description:`checkout completion`,media:(0,w.jsx)(`svg`,{viewBox:`0 0 160 36`,role:`img`,"aria-label":`Rising trend`,children:(0,w.jsx)(`polyline`,{points:`0,28 24,26 48,30 72,18 96,20 120,10 160,8`,fill:`none`,stroke:`var(--color-accent)`,strokeWidth:`3`,strokeLinecap:`round`,strokeLinejoin:`round`})})})})})},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  render: () => <Grid columns={{
    minWidth: 160,
    repeat: 'fit'
  }} gap={6}>
      <Card>
        <Stat label="Total revenue" value="$1.28M" delta={{
        value: '+12.4%',
        direction: 'up'
      }} description="vs. previous 30 days" />
      </Card>
      <Card>
        <Stat label="Error rate" value="0.42%" delta={{
        value: '-0.08%',
        direction: 'down',
        sentiment: 'positive'
      }} description="vs. previous 30 days" />
      </Card>
      <Card>
        <Stat label="Active users" value="18,204" delta={{
        value: '0.0%',
        direction: 'flat'
      }} description="vs. previous 30 days" />
      </Card>
    </Grid>
}`,...E.parameters?.docs?.source}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  render: () => <HStack gap={8} vAlign="end">
      <Stat label="Deploys" value="128" size="sm" delta={{
      value: '+6',
      direction: 'up'
    }} />
      <Stat label="Deploys" value="128" size="md" delta={{
      value: '+6',
      direction: 'up'
    }} />
      <Stat label="Deploys" value="128" size="lg" delta={{
      value: '+6',
      direction: 'up'
    }} />
    </HStack>
}`,...D.parameters?.docs?.source}}},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
  render: () => <Card>
      <VStack gap={4}>
        <Stat label="Conversion" value="7.8%" delta={{
        value: '+0.9%',
        direction: 'up'
      }} description="checkout completion" media={<svg viewBox="0 0 160 36" role="img" aria-label="Rising trend">
              <polyline points="0,28 24,26 48,30 72,18 96,20 120,10 160,8" fill="none" stroke="var(--color-accent)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>} />
      </VStack>
    </Card>
}`,...O.parameters?.docs?.source}}},k=[`Showcase`,`Sizes`,`WithMedia`]})))()}A();export{E as Showcase,D as Sizes,O as WithMedia,k as __namedExportsOrder,T as default};