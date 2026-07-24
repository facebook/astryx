import{i as e,s as t}from"./preload-helper-CT_b8DTk.js";import{t as n}from"./react-B7Te67-h.js";import{t as r}from"./jsx-runtime-DqZldVDK.js";import{t as i}from"./Button-DlxrQzaK.js";import{t as a}from"./Button-PY4-RRjU.js";import{Cr as o,Sr as s}from"./iframe-DRSfIdhd.js";var c,l,u,d,f,p,m,h,g,_,v,y;e((()=>{c=t(n()),s(),a(),l=r(),u={title:`Core/MarkdownCitations`,component:o,tags:[`autodocs`]},d={abc1:{title:`Tokyo - Wikipedia`,url:`https://en.wikipedia.org/wiki/Tokyo`,icon:`https://en.wikipedia.org/favicon.ico`},def2:{title:`Japan Statistics Bureau - Population`,url:`https://www.stat.go.jp/english/`},ghi3:{title:`World Population Review`,url:`https://worldpopulationreview.com/world-cities/tokyo-population`},jkl4:{title:`Reuters — Tokyo GDP`,url:`https://www.reuters.com/markets/`,icon:`https://www.reuters.com/favicon.ico`},mno5:{title:`UN Urbanization Prospects`,url:`https://population.un.org/wup/`}},f=[`## Tokyo Overview`,``,`Tokyo is the capital of Japan with a population of over 14 million[abc1].`,`It's the most populous metropolitan area in the world[def2][ghi3].`,``,`### Economy`,``,`Tokyo's GDP exceeds $1.9 trillion, making it the largest city economy globally[jkl4].`,`The metropolitan area is expected to remain the most populous urban agglomeration through 2035[mno5].`,``,`### Key Facts`,``,`- Population: 13.96 million (city proper)[abc1]`,`- Metro area: 37.4 million[def2]`,`- GDP: $1.93 trillion[jkl4]`,``,`For more details, see the [full Wikipedia article](https://en.wikipedia.org/wiki/Tokyo).`].join(`
`),p={name:`Bracket [id]`,args:{children:f,sources:d,density:`compact`,headingLevelStart:3}},m=[`## Search Results`,``,`Tokyo has a population of over 14 million【abc1】.`,`The greater Tokyo area houses 37 million people【def2】【ghi3】.`,``,`The city's economy is the largest in the world【jkl4】,`,`and urbanization trends suggest continued growth【mno5】.`].join(`
`),h={name:`Fullwidth 【id】`,args:{children:m,sources:d,density:`compact`,headingLevelStart:3}},g={name:`No Sources (passthrough)`,args:{children:`Text with [abc1] bracket markers but no sources prop.

They render as plain text.`}},_=[`## AI Research Summary`,``,`Large language models have shown remarkable capabilities in recent years[abc1].`,`Scaling laws suggest continued improvement with more compute[def2].`,``,`### Key Findings`,``,`- Models above 100B parameters show emergent abilities[ghi3]`,`- Fine-tuning remains critical for task-specific performance[jkl4]`,`- Safety alignment is an active area of research[mno5]`,``,`These results have broad implications for the field.`].join(`
`),v={name:`Streaming`,render:()=>{let e=_,[t,n]=(0,c.useState)(0),[r,a]=(0,c.useState)(!0),[s,u]=(0,c.useState)(0);return(0,c.useEffect)(()=>{if(!r)return;if(t>=e.length){a(!1);return}let i=Math.floor(Math.random()*8)+2,o=30+Math.random()*60,s=setTimeout(()=>{n(t=>Math.min(t+i,e.length))},o);return()=>clearTimeout(s)},[t,r,e]),(0,l.jsxs)(`div`,{children:[(0,l.jsxs)(`div`,{style:{marginBlockEnd:12,display:`flex`,gap:8,alignItems:`center`},children:[(0,l.jsx)(i,{label:`Replay`,variant:`secondary`,size:`sm`,onClick:(0,c.useCallback)(()=>{n(0),a(!0),u(e=>e+1)},[]),isDisabled:r}),(0,l.jsx)(`span`,{style:{fontSize:12,color:`#666`},children:r?`Streaming... ${t}/${e.length}`:`Complete`})]}),(0,l.jsx)(o,{isStreaming:r,density:`compact`,headingLevelStart:3,sources:d,children:e.slice(0,t)},s)]})}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  name: 'Bracket [id]',
  args: {
    children: BRACKET_MD,
    sources: SEARCH_SOURCES,
    density: 'compact',
    headingLevelStart: 3
  }
}`,...p.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  name: 'Fullwidth \\u3010id\\u3011',
  args: {
    children: FULLWIDTH_MD,
    sources: SEARCH_SOURCES,
    density: 'compact',
    headingLevelStart: 3
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  name: 'No Sources (passthrough)',
  args: {
    children: 'Text with [abc1] bracket markers but no sources prop.\\n\\nThey render as plain text.'
  }
}`,...g.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  name: 'Streaming',
  render: () => {
    const text = STREAMING_CITATION_MD;
    const [charIndex, setCharIndex] = useState(0);
    const [isStreaming, setIsStreaming] = useState(true);
    const [key, setKey] = useState(0);
    useEffect(() => {
      if (!isStreaming) {
        return;
      }
      if (charIndex >= text.length) {
        setIsStreaming(false);
        return;
      }
      const chunkSize = Math.floor(Math.random() * 8) + 2;
      const delay = 30 + Math.random() * 60;
      const timer = setTimeout(() => {
        setCharIndex(prev => Math.min(prev + chunkSize, text.length));
      }, delay);
      return () => clearTimeout(timer);
    }, [charIndex, isStreaming, text]);
    const replay = useCallback(() => {
      setCharIndex(0);
      setIsStreaming(true);
      setKey(k => k + 1);
    }, []);
    return <div>
        <div style={{
        marginBlockEnd: 12,
        display: 'flex',
        gap: 8,
        alignItems: 'center'
      }}>
          <Button label="Replay" variant="secondary" size="sm" onClick={replay} isDisabled={isStreaming} />
          <span style={{
          fontSize: 12,
          color: '#666'
        }}>
            {isStreaming ? \`Streaming... \${charIndex}/\${text.length}\` : 'Complete'}
          </span>
        </div>
        <Markdown key={key} isStreaming={isStreaming} density="compact" headingLevelStart={3} sources={SEARCH_SOURCES}>
          {text.slice(0, charIndex)}
        </Markdown>
      </div>;
  }
}`,...v.parameters?.docs?.source}}},y=[`BracketNotation`,`FullwidthNotation`,`NoCitations`,`StreamingWithCitations`]}))();export{p as BracketNotation,h as FullwidthNotation,g as NoCitations,v as StreamingWithCitations,y as __namedExportsOrder,u as default};