import{a as e,n as t}from"./rolldown-runtime-DaJ6WEGw.js";import{t as n}from"./react-DvlgmmzG.js";import{t as r}from"./Text-Bs-khaxO.js";import{t as i}from"./jsx-runtime-cM__dR4X.js";import{t as a}from"./Button-Cx-mMzJ7.js";import{t as o}from"./Button-D1MmXezA.js";import{t as s}from"./Card-CpjcShRF.js";import{t as c}from"./Card-BP3xkOim.js";import{t as l}from"./Heading-wwoO6PX8.js";import{i as u,n as d,o as f,t as p}from"./Stack-mterni5z.js";import{n as m,t as h}from"./Text-DRSNMNB3.js";import{C as g,w as _}from"./iframe-CorsBOL8.js";import{o as v,t as y}from"./src-BUw88aC7.js";var b,x,S,C,w,T,E,D,O,k,A;t((()=>{b=e(n()),y(),o(),c(),m(),p(),g(),h(),x=i(),S={title:`Lab/LogStream`,component:v,tags:[`autodocs`],parameters:{layout:`centered`},decorators:[e=>(0,x.jsx)(`div`,{style:{width:880,padding:32},children:(0,x.jsx)(e,{})})]},C={margin:0,fontFamily:`var(--font-family-code)`,fontSize:`var(--font-size-sm)`,lineHeight:1.7,whiteSpace:`pre-wrap`},w=[{id:`b-01`,timestamp:`12:04:16.002`,level:`info`,source:`build`,message:`Build machine: 4 cores, 8 GB RAM (iad1)`},{id:`b-02`,timestamp:`12:04:16.089`,level:`info`,source:`build`,message:`Cloning github.com/acme/astryx-console (branch: main)`},{id:`b-03`,timestamp:`12:04:18.021`,level:`info`,source:`stage`,message:`Install`},{id:`b-04`,timestamp:`12:04:18.144`,level:`info`,source:`install`,message:`$ pnpm install --frozen-lockfile`},{id:`b-05`,timestamp:`12:04:23.348`,level:`info`,source:`build`,message:`$ next build`},{id:`b-06`,timestamp:`12:04:38.207`,level:`warn`,source:`build`,message:`Compiled with warnings (1)`,detail:(0,x.jsx)(`pre`,{style:C,children:`./app/logs/page.tsx
42:9 Warning: "range" is assigned a value but never used.`})},{id:`b-07`,timestamp:`12:04:45.201`,level:`info`,source:`deploy`,message:`Uploading build outputs (23.4 MB)`},{id:`b-08`,timestamp:`12:04:50.004`,level:`info`,source:`deploy`,message:`Build completed in 34s`}],T=[{id:`l-01`,timestamp:`14:02:08.114`,level:`info`,source:`api-gateway`,message:`GET /v1/projects 200 in 42ms`},{id:`l-02`,timestamp:`14:02:08.371`,level:`debug`,source:`auth`,message:`token cache hit for key sess_7f31`},{id:`l-03`,timestamp:`14:02:09.243`,level:`warn`,source:`billing`,message:`upstream latency 1840ms exceeds 1500ms budget`,detail:(0,x.jsx)(`pre`,{style:C,children:`{
  "upstream": "payments.stripe",
  "latencyMs": 1840,
  "budgetMs": 1500,
  "traceId": "tr_9c41b2"
}`})},{id:`l-04`,timestamp:`14:02:10.037`,level:`error`,source:`billing`,message:`charge failed: upstream returned 502`,detail:(0,x.jsx)(`pre`,{style:C,children:`{
  "error": "UpstreamBadGateway",
  "attempt": 1,
  "retryInMs": 400,
  "invoice": "inv_20418"
}`})},{id:`l-05`,timestamp:`14:02:11.305`,level:`info`,source:`billing`,message:`charge succeeded for inv_20418 in 322ms`},{id:`l-06`,timestamp:`14:02:13.078`,level:`debug`,source:`api-gateway`,message:`route table reloaded (37 routes)`}],E=[{timestamp:`14:02:14.102`,level:`info`,source:`api-gateway`,message:`GET /v1/projects 200 in 38ms`},{timestamp:`14:02:15.310`,level:`debug`,source:`auth`,message:`token cache hit for key sess_9a02`},{timestamp:`14:02:17.708`,level:`warn`,source:`billing`,message:`webhook delivery slow: 2210ms to partner.acme`},{timestamp:`14:02:20.131`,level:`error`,source:`worker`,message:`job usage-rollup-0415 failed: table locked`}],D={render:()=>(0,x.jsxs)(u,{gap:2,children:[(0,x.jsxs)(f,{gap:2,vAlign:`center`,children:[(0,x.jsx)(_,{variant:`success`,label:`Ready`}),(0,x.jsx)(l,{level:3,children:`Build logs`})]}),(0,x.jsx)(v,{entries:w,variant:`terminal`,maxHeight:360,label:`Build logs`})]})},O={render:()=>(0,x.jsx)(s,{padding:4,children:(0,x.jsxs)(u,{gap:3,children:[(0,x.jsxs)(u,{gap:0,children:[(0,x.jsx)(l,{level:3,children:`Log results`}),(0,x.jsxs)(r,{type:`supporting`,color:`secondary`,children:[T.length,` events indexed / env:prod / UTC`]})]}),(0,x.jsx)(v,{entries:T,maxHeight:360,label:`Log results stream`})]})})},k={render:()=>{let[e,t]=(0,b.useState)(T),[n,i]=(0,b.useState)(!0),o=e.length-T.length,s=o<E.length;return(0,x.jsxs)(u,{gap:3,children:[(0,x.jsxs)(f,{gap:2,vAlign:`center`,children:[(0,x.jsx)(_,{variant:n?`success`:`neutral`,label:n?`Following latest`:`Not following`,isPulsing:n}),(0,x.jsx)(d,{size:`fill`,children:(0,x.jsxs)(r,{type:`supporting`,color:`secondary`,children:[e.length,` rows`]})}),(0,x.jsx)(a,{label:`Append line`,variant:`secondary`,onClick:()=>{s&&(t(e=>[...e,{...E[o],id:`live-${o}`}]),i(!0))},isDisabled:!s}),(0,x.jsx)(a,{label:`Reset`,variant:`ghost`,onClick:()=>{t(T),i(!0)}})]}),(0,x.jsx)(v,{entries:e,maxHeight:320,isFollowing:n,onFollowChange:i,label:`Live log stream`})]})}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  render: () => <VStack gap={2}>
      <HStack gap={2} vAlign="center">
        <StatusDot variant="success" label="Ready" />
        <Heading level={3}>Build logs</Heading>
      </HStack>
      <LogStream entries={buildEntries} variant="terminal" maxHeight={360} label="Build logs" />
    </VStack>
}`,...D.parameters?.docs?.source}}},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
  render: () => <Card padding={4}>
      <VStack gap={3}>
        <VStack gap={0}>
          <Heading level={3}>Log results</Heading>
          <Text type="supporting" color="secondary">
            {monitoringEntries.length} events indexed / env:prod / UTC
          </Text>
        </VStack>
        <LogStream entries={monitoringEntries} maxHeight={360} label="Log results stream" />
      </VStack>
    </Card>
}`,...O.parameters?.docs?.source}}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [entries, setEntries] = useState<LogEntry[]>(monitoringEntries);
    const [isFollowing, setIsFollowing] = useState(true);
    const nextIndex = entries.length - monitoringEntries.length;
    const canAppend = nextIndex < liveScript.length;
    const appendEntry = () => {
      if (!canAppend) {
        return;
      }
      setEntries(current => [...current, {
        ...liveScript[nextIndex],
        id: \`live-\${nextIndex}\`
      }]);
      setIsFollowing(true);
    };
    return <VStack gap={3}>
        <HStack gap={2} vAlign="center">
          <StatusDot variant={isFollowing ? 'success' : 'neutral'} label={isFollowing ? 'Following latest' : 'Not following'} isPulsing={isFollowing} />
          <StackItem size="fill">
            <Text type="supporting" color="secondary">
              {entries.length} rows
            </Text>
          </StackItem>
          <Button label="Append line" variant="secondary" onClick={appendEntry} isDisabled={!canAppend} />
          <Button label="Reset" variant="ghost" onClick={() => {
          setEntries(monitoringEntries);
          setIsFollowing(true);
        }} />
        </HStack>
        <LogStream entries={entries} maxHeight={320} isFollowing={isFollowing} onFollowChange={setIsFollowing} label="Live log stream" />
      </VStack>;
  }
}`,...k.parameters?.docs?.source}}},A=[`TerminalBuild`,`MonitoringRows`,`ControlledFollow`]}))();export{k as ControlledFollow,O as MonitoringRows,D as TerminalBuild,A as __namedExportsOrder,S as default};