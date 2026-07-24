import{i as e}from"./preload-helper-CT_b8DTk.js";import{t}from"./jsx-runtime-DqZldVDK.js";import{t as n}from"./Text-Iat6xWeA.js";import{t as r}from"./Heading-D-Ri_Mjs.js";import{c as i}from"./Stack-C7dTtCDZ.js";import{t as a}from"./Text-BUJwo4gL.js";import{u as o}from"./iframe-rS7i1xed.js";import{c as s,f as c,g as l,m as u,t as d,u as f}from"./src-Cfj0DB1w.js";function p(e){return e>=1e9?`$`+(e/1e9).toFixed(1)+`T`:e>=1e6?`$`+Math.round(e/1e6)+`B`:e>=1e3?`$`+Math.round(e/1e3)+`M`:`$`+e.toLocaleString()}var m,h,g,_,v,y,b,x,S,C,w,T,E,D,O,k,A,j,M,N,P,F,I,L,R,z,B,V,H,U;e((()=>{d(),o(),a(),m=t(),h={title:`Lab/SankeyChart`,tags:[`autodocs`]},g=[{id:`visitors`,label:`Visitors`,value:52e3,color:[.65,.2,270]},{id:`signups`,label:`Sign Ups`,value:28e3,color:[.6,.17,235]},{id:`bounced`,label:`Bounced`,value:24e3,color:[.55,.14,350]},{id:`activated`,label:`Activated`,value:19500,color:[.62,.16,190]},{id:`dormant`,label:`Dormant`,value:8500,color:[.55,.13,50]},{id:`subscribed`,label:`Subscribed`,value:12400,color:[.64,.18,155]},{id:`churned`,label:`Churned`,value:7100,color:[.54,.15,20]}],_=[{source:`visitors`,target:`signups`,value:28e3},{source:`visitors`,target:`bounced`,value:24e3},{source:`signups`,target:`activated`,value:19500},{source:`signups`,target:`dormant`,value:8500},{source:`activated`,target:`subscribed`,value:12400},{source:`activated`,target:`churned`,value:7100}],v=[[`visitors`],[`signups`,`bounced`],[`activated`,`dormant`],[`subscribed`,`churned`]],y={render:()=>(0,m.jsxs)(i,{direction:`vertical`,gap:4,children:[(0,m.jsx)(r,{level:3,children:`Conversion Funnel`}),(0,m.jsx)(n,{type:`body`,color:`secondary`,children:`User journey · Last 30 days`}),(0,m.jsxs)(l,{nodes:g,links:_,columns:v,height:360,children:[(0,m.jsx)(s,{}),(0,m.jsx)(u,{}),(0,m.jsx)(c,{}),(0,m.jsx)(f,{})]})]})},b=[{id:`organic`,label:`Organic`,value:18e3,color:[.62,.17,155]},{id:`paid`,label:`Paid Ads`,value:22e3,color:[.6,.18,240]},{id:`referral`,label:`Referral`,value:12e3,color:[.58,.15,40]},{id:`direct`,label:`Direct`,value:8e3,color:[.55,.14,300]},{id:`web`,label:`Web`,value:32e3,color:[.61,.16,210]},{id:`mobile`,label:`Mobile`,value:2e4,color:[.59,.16,170]},{id:`other`,label:`Other`,value:8e3,color:[.5,.11,320]},{id:`sub`,label:`Subscription`,value:38e3,color:[.64,.19,260]},{id:`onetime`,label:`One-time`,value:14e3,color:[.58,.15,50]},{id:`enterprise`,label:`Enterprise`,value:8e3,color:[.56,.13,190]}],x=[{source:`organic`,target:`web`,value:12e3},{source:`organic`,target:`mobile`,value:6e3},{source:`paid`,target:`web`,value:14e3},{source:`paid`,target:`mobile`,value:8e3},{source:`referral`,target:`web`,value:4e3},{source:`referral`,target:`mobile`,value:6e3},{source:`referral`,target:`other`,value:2e3},{source:`direct`,target:`web`,value:2e3},{source:`direct`,target:`other`,value:6e3},{source:`web`,target:`sub`,value:22e3},{source:`web`,target:`onetime`,value:6e3},{source:`web`,target:`enterprise`,value:4e3},{source:`mobile`,target:`sub`,value:14e3},{source:`mobile`,target:`onetime`,value:4e3},{source:`mobile`,target:`enterprise`,value:2e3},{source:`other`,target:`sub`,value:2e3},{source:`other`,target:`onetime`,value:4e3},{source:`other`,target:`enterprise`,value:2e3}],S=[[`organic`,`paid`,`referral`,`direct`],[`web`,`mobile`,`other`],[`sub`,`onetime`,`enterprise`]],C={render:()=>(0,m.jsxs)(i,{direction:`vertical`,gap:4,children:[(0,m.jsx)(r,{level:3,children:`Revenue Sources`}),(0,m.jsx)(n,{type:`body`,color:`secondary`,children:`Channel attribution · March 2026`}),(0,m.jsxs)(l,{nodes:b,links:x,columns:S,height:420,children:[(0,m.jsx)(s,{}),(0,m.jsx)(u,{opacity:.65,tension:.55}),(0,m.jsx)(c,{}),(0,m.jsx)(f,{})]})]})},w={render:()=>(0,m.jsxs)(i,{direction:`vertical`,gap:4,children:[(0,m.jsx)(r,{level:3,children:`Auto Column Detection`}),(0,m.jsx)(n,{type:`body`,color:`secondary`,children:`No explicit columns — topologically sorted`}),(0,m.jsxs)(l,{nodes:[{id:`a`,label:`Source A`,value:100},{id:`b`,label:`Source B`,value:80},{id:`mid`,label:`Middle`,value:180},{id:`out1`,label:`Output 1`,value:120},{id:`out2`,label:`Output 2`,value:60}],links:[{source:`a`,target:`mid`,value:100},{source:`b`,target:`mid`,value:80},{source:`mid`,target:`out1`,value:120},{source:`mid`,target:`out2`,value:60}],height:280,children:[(0,m.jsx)(u,{tension:.6}),(0,m.jsx)(c,{}),(0,m.jsx)(f,{showPercent:!1})]})]})},T={render:()=>(0,m.jsxs)(i,{direction:`vertical`,gap:4,children:[(0,m.jsx)(r,{level:3,children:`Deep Funnel (6 stages)`}),(0,m.jsx)(n,{type:`body`,color:`secondary`,children:`Scrolls horizontally when columns exceed container width`}),(0,m.jsx)(`div`,{style:{maxWidth:600,border:`1px solid var(--color-border, #ddd)`,borderRadius:12,overflow:`hidden`},children:(0,m.jsxs)(l,{nodes:[{id:`awareness`,label:`Awareness`,value:1e5},{id:`interest`,label:`Interest`,value:68e3},{id:`dropped1`,label:`Dropped`,value:32e3,color:[.5,.12,350]},{id:`consideration`,label:`Consideration`,value:45e3},{id:`dropped2`,label:`Distracted`,value:23e3,color:[.5,.12,350]},{id:`intent`,label:`Intent`,value:32e3},{id:`dropped3`,label:`Abandoned`,value:13e3,color:[.5,.12,350]},{id:`evaluation`,label:`Evaluation`,value:24e3},{id:`dropped4`,label:`Lost`,value:8e3,color:[.5,.12,350]},{id:`purchase`,label:`Purchase`,value:18e3,color:[.64,.18,155]},{id:`dropped5`,label:`Rejected`,value:6e3,color:[.5,.12,350]}],links:[{source:`awareness`,target:`interest`,value:68e3},{source:`awareness`,target:`dropped1`,value:32e3},{source:`interest`,target:`consideration`,value:45e3},{source:`interest`,target:`dropped2`,value:23e3},{source:`consideration`,target:`intent`,value:32e3},{source:`consideration`,target:`dropped3`,value:13e3},{source:`intent`,target:`evaluation`,value:24e3},{source:`intent`,target:`dropped4`,value:8e3},{source:`evaluation`,target:`purchase`,value:18e3},{source:`evaluation`,target:`dropped5`,value:6e3}],columns:[[`awareness`],[`interest`,`dropped1`],[`consideration`,`dropped2`],[`intent`,`dropped3`],[`evaluation`,`dropped4`],[`purchase`,`dropped5`]],height:360,minColumnWidth:160,children:[(0,m.jsx)(s,{}),(0,m.jsx)(u,{}),(0,m.jsx)(c,{}),(0,m.jsx)(f,{})]})})]})},E=[{id:`visitors`,label:`Visitors`,value:84200,color:[.55,.19,255]},{id:`signups`,label:`Signed Up`,value:42100,color:[.58,.18,255]},{id:`bounce`,label:`Bounced`,value:42100,color:[.5,.02,240]},{id:`onboarded`,label:`Onboarded`,value:28700,color:[.61,.17,252]},{id:`stalled`,label:`Stalled`,value:13400,color:[.5,.02,240]},{id:`active`,label:`Active Users`,value:21500,color:[.64,.16,250]},{id:`inactive`,label:`Inactive`,value:7200,color:[.5,.02,240]},{id:`paying`,label:`Paying`,value:15200,color:[.67,.15,248]},{id:`free`,label:`Free Tier`,value:6300,color:[.5,.02,240]}],D=[{source:`visitors`,target:`signups`,value:42100},{source:`visitors`,target:`bounce`,value:42100},{source:`signups`,target:`onboarded`,value:28700},{source:`signups`,target:`stalled`,value:13400},{source:`onboarded`,target:`active`,value:21500},{source:`onboarded`,target:`inactive`,value:7200},{source:`active`,target:`paying`,value:15200},{source:`active`,target:`free`,value:6300}],O=[[`visitors`],[`signups`,`bounce`],[`onboarded`,`stalled`],[`active`,`inactive`],[`paying`,`free`]],k={render:()=>(0,m.jsxs)(i,{direction:`vertical`,gap:4,children:[(0,m.jsx)(r,{level:3,children:`Acquisition Funnel`}),(0,m.jsx)(n,{type:`body`,color:`secondary`,children:`Blue = progression · Gray = drop-off`}),(0,m.jsxs)(l,{nodes:E,links:D,columns:O,height:380,children:[(0,m.jsx)(s,{}),(0,m.jsx)(u,{opacity:.6}),(0,m.jsx)(c,{}),(0,m.jsx)(f,{})]})]})},A=[{id:`single`,label:`Single`,value:48,color:[.62,.16,30]},{id:`married`,label:`Married`,value:35,color:[.58,.14,180]},{id:`divorced`,label:`Divorced`,value:17,color:[.55,.12,300]},{id:`male`,label:`Male`,value:55,color:[.57,.15,240]},{id:`female`,label:`Female`,value:45,color:[.6,.16,340]},{id:`happy`,label:`Happy`,value:62,color:[.64,.18,150]},{id:`unhappy`,label:`Unhappy`,value:38,color:[.52,.14,25]}],j=[{source:`single`,target:`male`,value:26},{source:`single`,target:`female`,value:22},{source:`married`,target:`male`,value:20},{source:`married`,target:`female`,value:15},{source:`divorced`,target:`male`,value:9},{source:`divorced`,target:`female`,value:8},{source:`male`,target:`happy`,value:34},{source:`male`,target:`unhappy`,value:21},{source:`female`,target:`happy`,value:28},{source:`female`,target:`unhappy`,value:17}],M=[{ids:[`single`,`married`,`divorced`],label:`Relationship`},{ids:[`male`,`female`],label:`Gender`},{ids:[`happy`,`unhappy`],label:`Outcome`}],N={render:()=>(0,m.jsxs)(i,{direction:`vertical`,gap:4,children:[(0,m.jsx)(r,{level:3,children:`Survey Flow`}),(0,m.jsx)(n,{type:`body`,color:`secondary`,children:`Wider node bars with rotated text labels`}),(0,m.jsxs)(l,{nodes:A,links:j,columns:M,height:380,nodeGap:8,children:[(0,m.jsx)(s,{}),(0,m.jsx)(u,{opacity:.5,tension:.5}),(0,m.jsx)(c,{}),(0,m.jsx)(f,{})]})]})},P=[{id:`income_tax`,label:`Income Tax`,value:2118406e3,color:[.55,.19,255]},{id:`payroll_tax`,label:`Payroll Tax`,value:1336808e3,color:[.58,.17,240]},{id:`corp_tax`,label:`Corp Tax`,value:51122e4,color:[.6,.16,220]},{id:`excise_tax`,label:`Excise Tax`,value:119883e3,color:[.56,.14,200]},{id:`misc_revenue`,label:`Misc Revenue`,value:96615e3,color:[.54,.12,280]},{id:`customs`,label:`Customs`,value:47878e3,color:[.52,.11,180]},{id:`proposals`,label:`Proposals`,value:45e6,color:[.5,.1,300]},{id:`estate_tax`,label:`Estate Tax`,value:38543e3,color:[.48,.09,160]},{id:`general_fund`,label:`General Fund`,value:2812308e3,color:[.62,.17,150]},{id:`social_security`,label:`Social Security`,value:968357e3,color:[.6,.16,170]},{id:`hhs`,label:`HHS`,value:309881e3,color:[.58,.15,130]},{id:`treasury`,label:`Treasury`,value:75173e3,color:[.56,.13,190]},{id:`labor`,label:`Labor`,value:57839e3,color:[.54,.12,40]},{id:`transport`,label:`Transport`,value:57056e3,color:[.52,.11,60]},{id:`agriculture`,label:`Agriculture`,value:11566e3,color:[.5,.1,100]},{id:`fcc`,label:`FCC`,value:10049e3,color:[.48,.09,260]},{id:`rail_retire`,label:`Rail Retire`,value:7098e3,color:[.5,.08,320]},{id:`opm`,label:`OPM`,value:5026e3,color:[.48,.08,340]}],F=[{source:`income_tax`,target:`general_fund`,value:2118406e3},{source:`payroll_tax`,target:`social_security`,value:968357e3},{source:`corp_tax`,target:`general_fund`,value:51122e4},{source:`payroll_tax`,target:`hhs`,value:298488e3},{source:`misc_revenue`,target:`treasury`,value:75173e3},{source:`excise_tax`,target:`general_fund`,value:62827e3},{source:`payroll_tax`,target:`labor`,value:57839e3},{source:`excise_tax`,target:`transport`,value:57056e3},{source:`proposals`,target:`general_fund`,value:45e6},{source:`estate_tax`,target:`general_fund`,value:38543e3},{source:`customs`,target:`general_fund`,value:36312e3},{source:`customs`,target:`agriculture`,value:11566e3},{source:`misc_revenue`,target:`hhs`,value:11393e3},{source:`misc_revenue`,target:`fcc`,value:10049e3},{source:`payroll_tax`,target:`rail_retire`,value:7098e3},{source:`payroll_tax`,target:`opm`,value:5026e3}],I=[{ids:[`income_tax`,`payroll_tax`,`corp_tax`,`excise_tax`,`misc_revenue`,`customs`,`proposals`,`estate_tax`],label:`Revenue Source`},{ids:[`general_fund`,`social_security`,`hhs`,`treasury`,`labor`,`transport`,`agriculture`,`fcc`,`rail_retire`,`opm`],label:`Receiving Agency`}],L={render:()=>(0,m.jsxs)(i,{direction:`vertical`,gap:4,children:[(0,m.jsx)(r,{level:3,children:`US Federal Budget FY2020`}),(0,m.jsx)(n,{type:`body`,color:`secondary`,children:`Revenue sources → receiving agencies (vega-datasets/budget.json)`}),(0,m.jsxs)(l,{nodes:P,links:F,columns:I,height:480,children:[(0,m.jsx)(s,{}),(0,m.jsx)(u,{opacity:.6,tension:.5}),(0,m.jsx)(c,{}),(0,m.jsx)(f,{formatValue:p})]})]})},R={render:()=>(0,m.jsxs)(i,{direction:`vertical`,gap:4,children:[(0,m.jsx)(r,{level:3,children:`Petroleum Flow`}),(0,m.jsx)(n,{type:`body`,color:`secondary`,children:`Monochrome — flat color, no gradients`}),(0,m.jsxs)(l,{nodes:g,links:_,columns:v,height:340,nodeColor:`#1a1a1e`,children:[(0,m.jsx)(u,{color:`#1a1a1e`,opacity:.75}),(0,m.jsx)(c,{glow:!1}),(0,m.jsx)(f,{})]})]})},z={render:()=>(0,m.jsxs)(i,{direction:`vertical`,gap:4,children:[(0,m.jsx)(r,{level:3,children:`Source-Colored Links`}),(0,m.jsx)(n,{type:`body`,color:`secondary`,children:`Each ribbon matches its source node`}),(0,m.jsxs)(l,{nodes:g,links:_,columns:v,height:340,children:[(0,m.jsx)(s,{}),(0,m.jsx)(u,{color:`source`}),(0,m.jsx)(c,{}),(0,m.jsx)(f,{})]})]})},B={render:()=>(0,m.jsxs)(i,{direction:`vertical`,gap:4,children:[(0,m.jsx)(r,{level:3,children:`Target-Colored Links`}),(0,m.jsx)(n,{type:`body`,color:`secondary`,children:`Each ribbon matches its destination node`}),(0,m.jsxs)(l,{nodes:g,links:_,columns:v,height:340,children:[(0,m.jsx)(s,{}),(0,m.jsx)(u,{color:`target`}),(0,m.jsx)(c,{}),(0,m.jsx)(f,{})]})]})},V={render:()=>(0,m.jsxs)(i,{direction:`vertical`,gap:4,children:[(0,m.jsx)(r,{level:3,children:`Source-Leaned Gradient`}),(0,m.jsx)(n,{type:`body`,color:`secondary`,children:`bias=0.2 — holds source color, transitions near target`}),(0,m.jsxs)(l,{nodes:g,links:_,columns:v,height:340,children:[(0,m.jsx)(s,{}),(0,m.jsx)(u,{color:{gradient:.2}}),(0,m.jsx)(c,{}),(0,m.jsx)(f,{})]})]})},H={render:()=>(0,m.jsxs)(i,{direction:`vertical`,gap:4,children:[(0,m.jsx)(r,{level:3,children:`Target-Leaned Gradient`}),(0,m.jsx)(n,{type:`body`,color:`secondary`,children:`bias=0.8 — transitions early, holds target color`}),(0,m.jsxs)(l,{nodes:g,links:_,columns:v,height:340,children:[(0,m.jsx)(s,{}),(0,m.jsx)(u,{color:{gradient:.8}}),(0,m.jsx)(c,{}),(0,m.jsx)(f,{})]})]})},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  render: () => <Stack direction="vertical" gap={4}>
      <Heading level={3}>Conversion Funnel</Heading>
      <Text type="body" color="secondary">
        User journey · Last 30 days
      </Text>
      <SankeyChart nodes={funnelNodes} links={funnelLinks} columns={funnelColumns} height={360}>
        <SankeyGrid />
        <SankeyLink />
        <SankeyNode />
        <SankeyLabel />
      </SankeyChart>
    </Stack>
}`,...y.parameters?.docs?.source},description:{story:`Classic diverging funnel with grid lines`,...y.parameters?.docs?.description}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  render: () => <Stack direction="vertical" gap={4}>
      <Heading level={3}>Revenue Sources</Heading>
      <Text type="body" color="secondary">
        Channel attribution · March 2026
      </Text>
      <SankeyChart nodes={revenueNodes} links={revenueLinks} columns={revenueColumns} height={420}>
        <SankeyGrid />
        <SankeyLink opacity={0.65} tension={0.55} />
        <SankeyNode />
        <SankeyLabel />
      </SankeyChart>
    </Stack>
}`,...C.parameters?.docs?.source},description:{story:`Converging Sankey — multiple sources flowing to fewer destinations`,...C.parameters?.docs?.description}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  render: () => {
    const nodes: SankeyNodeDatum[] = [{
      id: 'a',
      label: 'Source A',
      value: 100
    }, {
      id: 'b',
      label: 'Source B',
      value: 80
    }, {
      id: 'mid',
      label: 'Middle',
      value: 180
    }, {
      id: 'out1',
      label: 'Output 1',
      value: 120
    }, {
      id: 'out2',
      label: 'Output 2',
      value: 60
    }];
    const links: SankeyLinkDatum[] = [{
      source: 'a',
      target: 'mid',
      value: 100
    }, {
      source: 'b',
      target: 'mid',
      value: 80
    }, {
      source: 'mid',
      target: 'out1',
      value: 120
    }, {
      source: 'mid',
      target: 'out2',
      value: 60
    }];
    return <Stack direction="vertical" gap={4}>
        <Heading level={3}>Auto Column Detection</Heading>
        <Text type="body" color="secondary">
          No explicit columns — topologically sorted
        </Text>
        <SankeyChart nodes={nodes} links={links} height={280}>
          <SankeyLink tension={0.6} />
          <SankeyNode />
          <SankeyLabel showPercent={false} />
        </SankeyChart>
      </Stack>;
  }
}`,...w.parameters?.docs?.source},description:{story:`Minimal — auto-detected columns, no grid`,...w.parameters?.docs?.description}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  render: () => {
    const nodes: SankeyNodeDatum[] = [{
      id: 'awareness',
      label: 'Awareness',
      value: 100000
    }, {
      id: 'interest',
      label: 'Interest',
      value: 68000
    }, {
      id: 'dropped1',
      label: 'Dropped',
      value: 32000,
      color: [0.5, 0.12, 350]
    }, {
      id: 'consideration',
      label: 'Consideration',
      value: 45000
    }, {
      id: 'dropped2',
      label: 'Distracted',
      value: 23000,
      color: [0.5, 0.12, 350]
    }, {
      id: 'intent',
      label: 'Intent',
      value: 32000
    }, {
      id: 'dropped3',
      label: 'Abandoned',
      value: 13000,
      color: [0.5, 0.12, 350]
    }, {
      id: 'evaluation',
      label: 'Evaluation',
      value: 24000
    }, {
      id: 'dropped4',
      label: 'Lost',
      value: 8000,
      color: [0.5, 0.12, 350]
    }, {
      id: 'purchase',
      label: 'Purchase',
      value: 18000,
      color: [0.64, 0.18, 155]
    }, {
      id: 'dropped5',
      label: 'Rejected',
      value: 6000,
      color: [0.5, 0.12, 350]
    }];
    const links: SankeyLinkDatum[] = [{
      source: 'awareness',
      target: 'interest',
      value: 68000
    }, {
      source: 'awareness',
      target: 'dropped1',
      value: 32000
    }, {
      source: 'interest',
      target: 'consideration',
      value: 45000
    }, {
      source: 'interest',
      target: 'dropped2',
      value: 23000
    }, {
      source: 'consideration',
      target: 'intent',
      value: 32000
    }, {
      source: 'consideration',
      target: 'dropped3',
      value: 13000
    }, {
      source: 'intent',
      target: 'evaluation',
      value: 24000
    }, {
      source: 'intent',
      target: 'dropped4',
      value: 8000
    }, {
      source: 'evaluation',
      target: 'purchase',
      value: 18000
    }, {
      source: 'evaluation',
      target: 'dropped5',
      value: 6000
    }];
    const columns = [['awareness'], ['interest', 'dropped1'], ['consideration', 'dropped2'], ['intent', 'dropped3'], ['evaluation', 'dropped4'], ['purchase', 'dropped5']];
    return <Stack direction="vertical" gap={4}>
        <Heading level={3}>Deep Funnel (6 stages)</Heading>
        <Text type="body" color="secondary">
          Scrolls horizontally when columns exceed container width
        </Text>
        <div style={{
        maxWidth: 600,
        border: '1px solid var(--color-border, #ddd)',
        borderRadius: 12,
        overflow: 'hidden'
      }}>
          <SankeyChart nodes={nodes} links={links} columns={columns} height={360} minColumnWidth={160}>
            <SankeyGrid />
            <SankeyLink />
            <SankeyNode />
            <SankeyLabel />
          </SankeyChart>
        </div>
      </Stack>;
  }
}`,...T.parameters?.docs?.source},description:{story:`Many columns — demonstrates horizontal scroll with minColumnWidth`,...T.parameters?.docs?.description}}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  render: () => <Stack direction="vertical" gap={4}>
      <Heading level={3}>Acquisition Funnel</Heading>
      <Text type="body" color="secondary">
        Blue = progression · Gray = drop-off
      </Text>
      <SankeyChart nodes={bizNodes} links={bizLinks} columns={bizColumns} height={380}>
        <SankeyGrid />
        <SankeyLink opacity={0.6} />
        <SankeyNode />
        <SankeyLabel />
      </SankeyChart>
    </Stack>
}`,...k.parameters?.docs?.source},description:{story:`Business funnel with blue main flow and gray exit paths.
Uses background labels for readability over the ribbons.`,...k.parameters?.docs?.description}}},N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
  render: () => <Stack direction="vertical" gap={4}>
      <Heading level={3}>Survey Flow</Heading>
      <Text type="body" color="secondary">
        Wider node bars with rotated text labels
      </Text>
      <SankeyChart nodes={demoNodes} links={demoLinks} columns={demoColumns} height={380} nodeGap={8}>
        <SankeyGrid />
        <SankeyLink opacity={0.5} tension={0.5} />
        <SankeyNode />
        <SankeyLabel />
      </SankeyChart>
    </Stack>
}`,...N.parameters?.docs?.source},description:{story:`Wide bars with rotated labels and column headers — art deco style`,...N.parameters?.docs?.description}}},L.parameters={...L.parameters,docs:{...L.parameters?.docs,source:{originalSource:`{
  render: () => <Stack direction="vertical" gap={4}>
      <Heading level={3}>US Federal Budget FY2020</Heading>
      <Text type="body" color="secondary">
        Revenue sources → receiving agencies (vega-datasets/budget.json)
      </Text>
      <SankeyChart nodes={budgetNodes} links={budgetLinks} columns={budgetColumns} height={480}>
        <SankeyGrid />
        <SankeyLink opacity={0.6} tension={0.5} />
        <SankeyNode />
        <SankeyLabel formatValue={formatBudget} />
      </SankeyChart>
    </Stack>
}`,...L.parameters?.docs?.source},description:{story:`Real data: US Federal Budget FY2020 from vega-datasets.
Tax revenue sources flowing to receiving government agencies.`,...L.parameters?.docs?.description}}},R.parameters={...R.parameters,docs:{...R.parameters?.docs,source:{originalSource:`{
  render: () => <Stack direction="vertical" gap={4}>
      <Heading level={3}>Petroleum Flow</Heading>
      <Text type="body" color="secondary">
        Monochrome — flat color, no gradients
      </Text>
      <SankeyChart nodes={funnelNodes} links={funnelLinks} columns={funnelColumns} height={340} nodeColor="#1a1a1e">
        <SankeyLink color="#1a1a1e" opacity={0.75} />
        <SankeyNode glow={false} />
        <SankeyLabel />
      </SankeyChart>
    </Stack>
}`,...R.parameters?.docs?.source},description:{story:`Monochrome — flat black ribbons on white, editorial style`,...R.parameters?.docs?.description}}},z.parameters={...z.parameters,docs:{...z.parameters?.docs,source:{originalSource:`{
  render: () => <Stack direction="vertical" gap={4}>
      <Heading level={3}>Source-Colored Links</Heading>
      <Text type="body" color="secondary">
        Each ribbon matches its source node
      </Text>
      <SankeyChart nodes={funnelNodes} links={funnelLinks} columns={funnelColumns} height={340}>
        <SankeyGrid />
        <SankeyLink color="source" />
        <SankeyNode />
        <SankeyLabel />
      </SankeyChart>
    </Stack>
}`,...z.parameters?.docs?.source},description:{story:`Source-colored — each link takes its source node's color`,...z.parameters?.docs?.description}}},B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
  render: () => <Stack direction="vertical" gap={4}>
      <Heading level={3}>Target-Colored Links</Heading>
      <Text type="body" color="secondary">
        Each ribbon matches its destination node
      </Text>
      <SankeyChart nodes={funnelNodes} links={funnelLinks} columns={funnelColumns} height={340}>
        <SankeyGrid />
        <SankeyLink color="target" />
        <SankeyNode />
        <SankeyLabel />
      </SankeyChart>
    </Stack>
}`,...B.parameters?.docs?.source},description:{story:`Target-colored — each link takes its target node's color`,...B.parameters?.docs?.description}}},V.parameters={...V.parameters,docs:{...V.parameters?.docs,source:{originalSource:`{
  render: () => <Stack direction="vertical" gap={4}>
      <Heading level={3}>Source-Leaned Gradient</Heading>
      <Text type="body" color="secondary">
        bias=0.2 — holds source color, transitions near target
      </Text>
      <SankeyChart nodes={funnelNodes} links={funnelLinks} columns={funnelColumns} height={340}>
        <SankeyGrid />
        <SankeyLink color={{
        gradient: 0.2
      }} />
        <SankeyNode />
        <SankeyLabel />
      </SankeyChart>
    </Stack>
}`,...V.parameters?.docs?.source},description:{story:`Leaned gradient — source-biased, transitions late`,...V.parameters?.docs?.description}}},H.parameters={...H.parameters,docs:{...H.parameters?.docs,source:{originalSource:`{
  render: () => <Stack direction="vertical" gap={4}>
      <Heading level={3}>Target-Leaned Gradient</Heading>
      <Text type="body" color="secondary">
        bias=0.8 — transitions early, holds target color
      </Text>
      <SankeyChart nodes={funnelNodes} links={funnelLinks} columns={funnelColumns} height={340}>
        <SankeyGrid />
        <SankeyLink color={{
        gradient: 0.8
      }} />
        <SankeyNode />
        <SankeyLabel />
      </SankeyChart>
    </Stack>
}`,...H.parameters?.docs?.source},description:{story:`Leaned gradient — target-biased, transitions early`,...H.parameters?.docs?.description}}},U=[`ConversionFunnel`,`RevenueFlow`,`AutoColumns`,`ManyColumns`,`BusinessFunnel`,`WideBarStyle`,`USFederalBudget`,`Monochrome`,`SourceColored`,`TargetColored`,`LeanedSourceGradient`,`LeanedTargetGradient`]}))();export{w as AutoColumns,k as BusinessFunnel,y as ConversionFunnel,V as LeanedSourceGradient,H as LeanedTargetGradient,T as ManyColumns,R as Monochrome,C as RevenueFlow,z as SourceColored,B as TargetColored,L as USFederalBudget,N as WideBarStyle,U as __namedExportsOrder,h as default};