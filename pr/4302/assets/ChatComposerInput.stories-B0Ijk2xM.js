import{i as e,s as t}from"./preload-helper-CT_b8DTk.js";import{t as n}from"./react-B7Te67-h.js";import{t as r}from"./jsx-runtime-DqZldVDK.js";import{n as i,t as a}from"./Badge-x089lqwb.js";import{r as o}from"./BaseTypeahead-CPzka6G7.js";import{i as s,t as c}from"./Typeahead-D3yBPj-0.js";import{Jr as l,Qr as u,Tr as d}from"./iframe-rS7i1xed.js";var f,p,m,h,g,_,v,y,b,x,S,C,w,T,E,D,O,k,A,j,M,N,P;e((()=>{d(),c(),a(),f=t(n()),p=r(),m={title:`Core/ChatComposerInput`,component:u,tags:[`autodocs`],parameters:{layout:`centered`},decorators:[e=>(0,p.jsx)(`div`,{style:{width:600,padding:40},children:(0,p.jsx)(e,{})})]},h=[{id:`cindy`,label:`Cindy Zhang`,auxiliaryData:{role:`Design Systems`}},{id:`alex`,label:`Alex Johnson`,auxiliaryData:{role:`Frontend`}},{id:`sam`,label:`Sam Rivera`,auxiliaryData:{role:`Backend`}},{id:`jordan`,label:`Jordan Lee`,auxiliaryData:{role:`Product`}},{id:`taylor`,label:`Taylor Kim`,auxiliaryData:{role:`Design`}},{id:`morgan`,label:`Morgan Chen`,auxiliaryData:{role:`Infrastructure`}}],g=[{id:`summarize`,label:`summarize`,auxiliaryData:{description:`Summarize the conversation`}},{id:`translate`,label:`translate`,auxiliaryData:{description:`Translate text to another language`}},{id:`search`,label:`search`,auxiliaryData:{description:`Search the web or documents`}},{id:`code`,label:`code`,auxiliaryData:{description:`Generate or explain code`}},{id:`help`,label:`help`,auxiliaryData:{description:`Show available commands`}}],_=s(h),v=s(g),y={search(e){return new Promise(t=>{setTimeout(()=>{let n=e.toLowerCase();t(h.filter(e=>e.label.toLowerCase().includes(n)))},300)})},bootstrap(){return h}},b={render:()=>{let[e,t]=(0,f.useState)(``);return(0,p.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:12},children:[(0,p.jsx)(l,{onSubmit:e=>{alert(`Submitted: ${e}`),t(``)},value:e,onChange:t,input:(0,p.jsx)(u,{value:e,onChange:t,placeholder:`Type a message...`})}),(0,p.jsxs)(`div`,{style:{fontSize:12,fontFamily:`monospace`,color:`#888`},children:[`Value: `,JSON.stringify(e)]})]})}},x={render:()=>(0,p.jsx)(l,{onSubmit:e=>alert(e),input:(0,p.jsx)(u,{placeholder:`Ask me anything about Astryx...`})})},S={render:()=>(0,p.jsx)(l,{onSubmit:()=>{},isDisabled:!0,input:(0,p.jsx)(u,{isDisabled:!0,placeholder:`Input is disabled`})})},C={render:()=>(0,p.jsx)(l,{onSubmit:e=>alert(e),input:(0,p.jsx)(u,{maxRows:3,placeholder:`Type a long message — scrolls after 3 lines...`})})},w={render:()=>{let[e,t]=(0,f.useState)([]);return(0,p.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:12},children:[(0,p.jsx)(l,{onSubmit:e=>t(t=>[...t,e]),input:(0,p.jsx)(u,{placeholder:`Submit messages, then ArrowUp to recall...`})}),e.length>0&&(0,p.jsx)(`div`,{style:{fontSize:12,fontFamily:`monospace`,color:`#666`},children:e.map((e,t)=>(0,p.jsxs)(`div`,{children:[`→ `,e]},t))})]})}},T={render:()=>{let[e,t]=(0,f.useState)([]);return(0,p.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:12},children:[(0,p.jsx)(l,{onSubmit:e=>alert(e),input:(0,p.jsx)(u,{onFiles:e=>t(t=>[...t,...e.map(e=>e.name)]),placeholder:`Paste files here (Ctrl+V)...`})}),e.length>0&&(0,p.jsxs)(`div`,{style:{fontSize:12,color:`#666`},children:[`Files: `,e.join(`, `)]})]})}},E={render:()=>{let[e,t]=(0,f.useState)(``),[n,r]=(0,f.useState)([]);return(0,p.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:16},children:[(0,p.jsx)(l,{onSubmit:e=>{r(t=>[...t,e]),t(``)},input:(0,p.jsx)(u,{value:e,onChange:t,triggers:[{character:`@`,searchSource:_,renderItem:e=>(0,p.jsx)(o,{item:e,description:e.auxiliaryData?.role}),onSelect:e=>({value:`@${e.id}`,label:e.label,variant:`blue`})}],placeholder:`Type @ to mention someone...`})}),(0,p.jsxs)(`div`,{style:{fontSize:12,fontFamily:`monospace`,color:`#888`},children:[`Value: `,JSON.stringify(e)]}),n.length>0&&(0,p.jsx)(`div`,{style:{fontSize:12,fontFamily:`monospace`,color:`#666`},children:n.map((e,t)=>(0,p.jsxs)(`div`,{children:[`→ `,e]},t))})]})}},D={render:()=>(0,p.jsx)(l,{onSubmit:e=>alert(`Sent: ${e}`),input:(0,p.jsx)(u,{triggers:[{character:`/`,searchSource:v,renderItem:e=>(0,p.jsx)(o,{item:e,description:e.auxiliaryData?.description}),onSelect:e=>({value:`/${e.label}`,label:`/${e.label}`,variant:`yellow`})}],placeholder:`Type / for commands...`})})},O={render:()=>(0,p.jsx)(l,{onSubmit:e=>alert(`Sent: ${e}`),input:(0,p.jsx)(u,{triggers:[{character:`@`,searchSource:y,onSelect:e=>({value:`@${e.id}`,label:e.label,variant:`blue`}),loadingText:`Searching users…`,emptySearchResultsText:`No users found`}],placeholder:`Type @ for async user search (300ms delay)...`})})},k={render:()=>{let[e,t]=(0,f.useState)(``);return(0,p.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:12},children:[(0,p.jsx)(l,{onSubmit:e=>{alert(`Sent: ${e}`),t(``)},input:(0,p.jsx)(u,{value:e,onChange:t,triggers:[{character:`@`,searchSource:_,onSelect:e=>({value:`@${e.id}`,label:e.label,variant:`blue`})},{character:`/`,searchSource:v,onSelect:e=>({value:`/${e.label}`,label:`/${e.label}`,variant:`yellow`})}],placeholder:`Type @ or / ...`})}),(0,p.jsxs)(`div`,{style:{fontSize:12,fontFamily:`monospace`,color:`#888`},children:[`Value: `,JSON.stringify(e)]})]})}},A={render:()=>(0,p.jsx)(l,{onSubmit:e=>alert(`Sent: ${e}`),input:(0,p.jsx)(u,{triggers:[{character:`@`,searchSource:_,renderItem:e=>(0,p.jsx)(o,{item:e,description:e.auxiliaryData?.role,icon:(0,p.jsx)(`div`,{style:{width:24,height:24,borderRadius:`50%`,backgroundColor:`#e8d5f5`,display:`flex`,alignItems:`center`,justifyContent:`center`,fontSize:11,fontWeight:600,color:`#7c3aed`},children:e.label.charAt(0)})}),onSelect:e=>({value:`@${e.id}`,label:e.label,variant:`purple`,icon:(0,p.jsx)(`span`,{style:{width:14,height:14,borderRadius:`50%`,backgroundColor:`#e8d5f5`,display:`inline-flex`,alignItems:`center`,justifyContent:`center`,fontSize:8,fontWeight:700,color:`#7c3aed`},children:e.label.charAt(0)})})}],placeholder:`Type @ — tokens have icons via badge config...`})})},j={render:()=>(0,p.jsx)(l,{onSubmit:e=>alert(`Sent: ${e}`),input:(0,p.jsx)(u,{triggers:[{character:`@`,searchSource:_,onSelect:e=>({value:`@${e.id}`,label:e.label,variant:`blue`})},{character:`/`,searchSource:v,onSelect:e=>({value:`/${e.label}`,label:`/${e.label}`,variant:`purple`})}],placeholder:`@ for blue mentions, / for purple commands...`})})},M={render:()=>(0,p.jsx)(l,{onSubmit:e=>alert(`Sent: ${e}`),input:(0,p.jsx)(u,{triggers:[{character:`@`,searchSource:_,renderItem:e=>(0,p.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,gap:8},children:[(0,p.jsx)(`div`,{style:{width:24,height:24,borderRadius:`50%`,backgroundColor:`#e0e0e0`,display:`flex`,alignItems:`center`,justifyContent:`center`,fontSize:11,fontWeight:600},children:e.label.charAt(0)}),(0,p.jsx)(`span`,{children:e.label})]}),onSelect:e=>({value:`@${e.id}`,render:()=>(0,p.jsx)(`span`,{title:`Click to view ${e.label}'s profile`,style:{cursor:`pointer`},onClick:()=>alert(`Profile: ${e.label}`),children:(0,p.jsx)(i,{variant:`blue`,label:e.label,icon:(0,p.jsx)(`span`,{style:{width:14,height:14,borderRadius:`50%`,backgroundColor:`#c4d4f0`,display:`inline-flex`,alignItems:`center`,justifyContent:`center`,fontSize:8,fontWeight:700},children:e.label.charAt(0)})})})})}],placeholder:`Type @ — tokens are clickable with avatars...`})})},N={render:()=>(0,p.jsx)(l,{onSubmit:e=>alert(`Sent: ${e}`),input:(0,p.jsx)(u,{triggers:[{character:`@`,searchSource:s([{id:`cindy`,label:`Cindy Zhang`,auxiliaryData:{group:`Design`,role:`Design Systems`}},{id:`taylor`,label:`Taylor Kim`,auxiliaryData:{group:`Design`,role:`Product Design`}},{id:`alex`,label:`Alex Johnson`,auxiliaryData:{group:`Engineering`,role:`Frontend`}},{id:`sam`,label:`Sam Rivera`,auxiliaryData:{group:`Engineering`,role:`Backend`}},{id:`morgan`,label:`Morgan Chen`,auxiliaryData:{group:`Engineering`,role:`Infrastructure`}},{id:`jordan`,label:`Jordan Lee`,auxiliaryData:{group:`Product`,role:`Product Manager`}}]),renderItem:e=>(0,p.jsx)(o,{item:e,description:e.auxiliaryData?.role}),onSelect:e=>({value:`@${e.id}`,label:e.label,variant:`blue`})}],placeholder:`Type @ to see grouped mentions...`})})},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = useState('');
    return <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 12
    }}>
        <ChatComposer onSubmit={v => {
        alert(\`Submitted: \${v}\`);
        setValue('');
      }} value={value} onChange={setValue} input={<ChatComposerInput value={value} onChange={setValue} placeholder="Type a message..." />} />
        <div style={{
        fontSize: 12,
        fontFamily: 'monospace',
        color: '#888'
      }}>
          Value: {JSON.stringify(value)}
        </div>
      </div>;
  }
}`,...b.parameters?.docs?.source},description:{story:`Controlled value — shows the serialized value below`,...b.parameters?.docs?.description}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  render: () => <ChatComposer onSubmit={v => alert(v)} input={<ChatComposerInput placeholder="Ask me anything about Astryx..." />} />
}`,...x.parameters?.docs?.source},description:{story:`Custom placeholder`,...x.parameters?.docs?.description}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  render: () => <ChatComposer onSubmit={() => {}} isDisabled input={<ChatComposerInput isDisabled placeholder="Input is disabled" />} />
}`,...S.parameters?.docs?.source},description:{story:`Disabled state`,...S.parameters?.docs?.description}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  render: () => <ChatComposer onSubmit={v => alert(v)} input={<ChatComposerInput maxRows={3} placeholder="Type a long message — scrolls after 3 lines..." />} />
}`,...C.parameters?.docs?.source},description:{story:`Max rows — scrolls after 3 lines`,...C.parameters?.docs?.description}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [log, setLog] = useState<string[]>([]);
    return <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 12
    }}>
        <ChatComposer onSubmit={v => setLog(prev => [...prev, v])} input={<ChatComposerInput placeholder="Submit messages, then ArrowUp to recall..." />} />
        {log.length > 0 && <div style={{
        fontSize: 12,
        fontFamily: 'monospace',
        color: '#666'
      }}>
            {log.map((msg, i) => <div key={i}>→ {msg}</div>)}
          </div>}
      </div>;
  }
}`,...w.parameters?.docs?.source},description:{story:`Message history — submit a few messages, then ArrowUp/Down to recall`,...w.parameters?.docs?.description}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [files, setFiles] = useState<string[]>([]);
    return <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 12
    }}>
        <ChatComposer onSubmit={v => alert(v)} input={<ChatComposerInput onFiles={f => setFiles(prev => [...prev, ...f.map(x => x.name)])} placeholder="Paste files here (Ctrl+V)..." />} />
        {files.length > 0 && <div style={{
        fontSize: 12,
        color: '#666'
      }}>
            Files: {files.join(', ')}
          </div>}
      </div>;
  }
}`,...T.parameters?.docs?.source},description:{story:`File paste handler`,...T.parameters?.docs?.description}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = useState('');
    const [log, setLog] = useState<string[]>([]);
    const mentionTrigger: ChatComposerTrigger = {
      character: '@',
      searchSource: userSource,
      renderItem: item => <TypeaheadItem item={item} description={(item.auxiliaryData as {
        role: string;
      })?.role} />,
      onSelect: item => ({
        value: \`@\${item.id}\`,
        label: item.label,
        variant: 'blue' as const
      })
    };
    return <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 16
    }}>
        <ChatComposer onSubmit={v => {
        setLog(prev => [...prev, v]);
        setValue('');
      }} input={<ChatComposerInput value={value} onChange={setValue} triggers={[mentionTrigger]} placeholder="Type @ to mention someone..." />} />
        <div style={{
        fontSize: 12,
        fontFamily: 'monospace',
        color: '#888'
      }}>
          Value: {JSON.stringify(value)}
        </div>
        {log.length > 0 && <div style={{
        fontSize: 12,
        fontFamily: 'monospace',
        color: '#666'
      }}>
            {log.map((msg, i) => <div key={i}>→ {msg}</div>)}
          </div>}
      </div>;
  }
}`,...E.parameters?.docs?.source},description:{story:`Static @ mentions — type @ to see the menu`,...E.parameters?.docs?.description}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  render: () => {
    const commandTrigger: ChatComposerTrigger = {
      character: '/',
      searchSource: commandSource,
      renderItem: item => <TypeaheadItem item={item} description={(item.auxiliaryData as {
        description: string;
      })?.description} />,
      onSelect: item => ({
        value: \`/\${item.label}\`,
        label: \`/\${item.label}\`,
        variant: 'yellow' as const
      })
    };
    return <ChatComposer onSubmit={value => alert(\`Sent: \${value}\`)} input={<ChatComposerInput triggers={[commandTrigger]} placeholder="Type / for commands..." />} />;
  }
}`,...D.parameters?.docs?.source},description:{story:`Static / commands — type / to see commands`,...D.parameters?.docs?.description}}},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
  render: () => {
    const asyncTrigger: ChatComposerTrigger = {
      character: '@',
      searchSource: asyncUserSource,
      onSelect: item => ({
        value: \`@\${item.id}\`,
        label: item.label,
        variant: 'blue' as const
      }),
      loadingText: 'Searching users…',
      emptySearchResultsText: 'No users found'
    };
    return <ChatComposer onSubmit={value => alert(\`Sent: \${value}\`)} input={<ChatComposerInput triggers={[asyncTrigger]} placeholder="Type @ for async user search (300ms delay)..." />} />;
  }
}`,...O.parameters?.docs?.source},description:{story:`Async search source — type @ to trigger a simulated API search`,...O.parameters?.docs?.description}}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = useState('');
    const mentionTrigger: ChatComposerTrigger = {
      character: '@',
      searchSource: userSource,
      onSelect: item => ({
        value: \`@\${item.id}\`,
        label: item.label,
        variant: 'blue' as const
      })
    };
    const commandTrigger: ChatComposerTrigger = {
      character: '/',
      searchSource: commandSource,
      onSelect: item => ({
        value: \`/\${item.label}\`,
        label: \`/\${item.label}\`,
        variant: 'yellow' as const
      })
    };
    return <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 12
    }}>
        <ChatComposer onSubmit={v => {
        alert(\`Sent: \${v}\`);
        setValue('');
      }} input={<ChatComposerInput value={value} onChange={setValue} triggers={[mentionTrigger, commandTrigger]} placeholder="Type @ or / ..." />} />
        <div style={{
        fontSize: 12,
        fontFamily: 'monospace',
        color: '#888'
      }}>
          Value: {JSON.stringify(value)}
        </div>
      </div>;
  }
}`,...k.parameters?.docs?.source},description:{story:`Multiple triggers — @ for mentions, / for commands`,...k.parameters?.docs?.description}}},A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  render: () => {
    const mentionTrigger: ChatComposerTrigger = {
      character: '@',
      searchSource: userSource,
      renderItem: item => <TypeaheadItem item={item} description={(item.auxiliaryData as {
        role: string;
      })?.role} icon={<div style={{
        width: 24,
        height: 24,
        borderRadius: '50%',
        backgroundColor: '#e8d5f5',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 11,
        fontWeight: 600,
        color: '#7c3aed'
      }}>
              {item.label.charAt(0)}
            </div>} />,
      onSelect: item => ({
        value: \`@\${item.id}\`,
        label: item.label,
        variant: 'purple' as const,
        icon: <span style={{
          width: 14,
          height: 14,
          borderRadius: '50%',
          backgroundColor: '#e8d5f5',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 8,
          fontWeight: 700,
          color: '#7c3aed'
        }}>
            {item.label.charAt(0)}
          </span>
      })
    };
    return <ChatComposer onSubmit={value => alert(\`Sent: \${value}\`)} input={<ChatComposerInput triggers={[mentionTrigger]} placeholder="Type @ — tokens have icons via badge config..." />} />;
  }
}`,...A.parameters?.docs?.source},description:{story:`Custom item rendering in the trigger menu`,...A.parameters?.docs?.description}}},j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
  render: () => {
    const mentionTrigger: ChatComposerTrigger = {
      character: '@',
      searchSource: userSource,
      onSelect: item => ({
        value: \`@\${item.id}\`,
        label: item.label,
        variant: 'blue' as const
      })
    };
    const commandTrigger: ChatComposerTrigger = {
      character: '/',
      searchSource: commandSource,
      onSelect: item => ({
        value: \`/\${item.label}\`,
        label: \`/\${item.label}\`,
        variant: 'purple' as const
      })
    };
    return <ChatComposer onSubmit={value => alert(\`Sent: \${value}\`)} input={<ChatComposerInput triggers={[mentionTrigger, commandTrigger]} placeholder="@ for blue mentions, / for purple commands..." />} />;
  }
}`,...j.parameters?.docs?.source},description:{story:`Token color variants — different badge colors per trigger`,...j.parameters?.docs?.description}}},M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
  render: () => {
    const mentionTrigger: ChatComposerTrigger = {
      character: '@',
      searchSource: userSource,
      renderItem: item => <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8
      }}>
          <div style={{
          width: 24,
          height: 24,
          borderRadius: '50%',
          backgroundColor: '#e0e0e0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 11,
          fontWeight: 600
        }}>
            {item.label.charAt(0)}
          </div>
          <span>{item.label}</span>
        </div>,
      onSelect: item => ({
        value: \`@\${item.id}\`,
        render: () => <span title={\`Click to view \${item.label}'s profile\`} style={{
          cursor: 'pointer'
        }} onClick={() => alert(\`Profile: \${item.label}\`)}>
            <Badge variant="blue" label={item.label} icon={<span style={{
            width: 14,
            height: 14,
            borderRadius: '50%',
            backgroundColor: '#c4d4f0',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 8,
            fontWeight: 700
          }}>
                  {item.label.charAt(0)}
                </span>} />
          </span>
      })
    };
    return <ChatComposer onSubmit={value => alert(\`Sent: \${value}\`)} input={<ChatComposerInput triggers={[mentionTrigger]} placeholder="Type @ — tokens are clickable with avatars..." />} />;
  }
}`,...M.parameters?.docs?.source},description:{story:`Custom render — full control via render() for rich token content`,...M.parameters?.docs?.description}}},N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
  render: () => {
    const groupedUsers = createStaticSource([{
      id: 'cindy',
      label: 'Cindy Zhang',
      auxiliaryData: {
        group: 'Design',
        role: 'Design Systems'
      }
    }, {
      id: 'taylor',
      label: 'Taylor Kim',
      auxiliaryData: {
        group: 'Design',
        role: 'Product Design'
      }
    }, {
      id: 'alex',
      label: 'Alex Johnson',
      auxiliaryData: {
        group: 'Engineering',
        role: 'Frontend'
      }
    }, {
      id: 'sam',
      label: 'Sam Rivera',
      auxiliaryData: {
        group: 'Engineering',
        role: 'Backend'
      }
    }, {
      id: 'morgan',
      label: 'Morgan Chen',
      auxiliaryData: {
        group: 'Engineering',
        role: 'Infrastructure'
      }
    }, {
      id: 'jordan',
      label: 'Jordan Lee',
      auxiliaryData: {
        group: 'Product',
        role: 'Product Manager'
      }
    }] as SearchableItem[]);
    const mentionTrigger: ChatComposerTrigger = {
      character: '@',
      searchSource: groupedUsers,
      renderItem: item => <TypeaheadItem item={item} description={(item.auxiliaryData as {
        role?: string;
      })?.role} />,
      onSelect: item => ({
        value: \`@\${item.id}\`,
        label: item.label,
        variant: 'blue' as const
      })
    };
    return <ChatComposer onSubmit={value => alert(\`Sent: \${value}\`)} input={<ChatComposerInput triggers={[mentionTrigger]} placeholder="Type @ to see grouped mentions..." />} />;
  }
}`,...N.parameters?.docs?.source},description:{story:`Grouped menu items — items with auxiliaryData.group render under headings`,...N.parameters?.docs?.description}}},P=[`Controlled`,`CustomPlaceholder`,`Disabled`,`MaxRows`,`MessageHistory`,`FilePaste`,`MentionTrigger`,`SlashCommands`,`AsyncSearch`,`MultipleTriggers`,`CustomRenderItem`,`TokenVariants`,`CustomRender`,`GroupedItems`]}))();export{O as AsyncSearch,b as Controlled,x as CustomPlaceholder,M as CustomRender,A as CustomRenderItem,S as Disabled,T as FilePaste,N as GroupedItems,C as MaxRows,E as MentionTrigger,w as MessageHistory,k as MultipleTriggers,D as SlashCommands,j as TokenVariants,P as __namedExportsOrder,m as default};