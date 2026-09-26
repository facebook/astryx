import{i as e,s as t}from"./preload-helper-CT_b8DTk.js";import{t as n}from"./react-B7Te67-h.js";import{t as r}from"./jsx-runtime-DqZldVDK.js";import{n as i,t as a}from"./Badge-CGsBkr0T.js";import{r as o}from"./BaseTypeahead-4Z2IdheC.js";import{i as s,t as c}from"./Typeahead-B5KvhFuW.js";import{Ci as l,Di as u,ei as d}from"./iframe-BTYmqHH9.js";var f,p,m,h,g,_,v,y,b,x,S,C,w,T,E,D,O,k,A,j,M,N,P,F,I,L,R,z,B,V,H;e((()=>{d(),c(),a(),f=t(n()),p=r(),{expect:m,fireEvent:h,userEvent:g,within:_}=__STORYBOOK_MODULE_TEST__,v={title:`Core/ChatComposerInput`,component:u,tags:[`autodocs`],parameters:{layout:`centered`},decorators:[e=>(0,p.jsx)(`div`,{style:{width:600,padding:40},children:(0,p.jsx)(e,{})})]},y=[{id:`cindy`,label:`Cindy Zhang`,auxiliaryData:{role:`Design Systems`}},{id:`alex`,label:`Alex Johnson`,auxiliaryData:{role:`Frontend`}},{id:`sam`,label:`Sam Rivera`,auxiliaryData:{role:`Backend`}},{id:`jordan`,label:`Jordan Lee`,auxiliaryData:{role:`Product`}},{id:`taylor`,label:`Taylor Kim`,auxiliaryData:{role:`Design`}},{id:`morgan`,label:`Morgan Chen`,auxiliaryData:{role:`Infrastructure`}}],b=[{id:`summarize`,label:`summarize`,auxiliaryData:{description:`Summarize the conversation`}},{id:`translate`,label:`translate`,auxiliaryData:{description:`Translate text to another language`}},{id:`search`,label:`search`,auxiliaryData:{description:`Search the web or documents`}},{id:`code`,label:`code`,auxiliaryData:{description:`Generate or explain code`}},{id:`help`,label:`help`,auxiliaryData:{description:`Show available commands`}}],x=s(y),S=s(b),C=s([{id:`smile`,label:`smile (😄)`},{id:`heart`,label:`heart (❤️)`},{id:`thumbsup`,label:`thumbsup (👍)`},{id:`fire`,label:`fire (🔥)`},{id:`rocket`,label:`rocket (🚀)`},{id:`sparkles`,label:`sparkles (✨)`}]),w={search(e){return new Promise(t=>{setTimeout(()=>{let n=e.toLowerCase();t(y.filter(e=>e.label.toLowerCase().includes(n)))},300)})},bootstrap(){return y}},T={render:()=>{let[e,t]=(0,f.useState)(``);return(0,p.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:12},children:[(0,p.jsx)(l,{onSubmit:e=>{alert(`Submitted: ${e}`),t(``)},value:e,onChange:t,input:(0,p.jsx)(u,{value:e,onChange:t,placeholder:`Type a message...`})}),(0,p.jsxs)(`div`,{style:{fontSize:12,fontFamily:`monospace`,color:`var(--color-text-secondary)`},children:[`Value: `,JSON.stringify(e)]})]})}},E={render:()=>(0,p.jsx)(l,{onSubmit:e=>alert(e),input:(0,p.jsx)(u,{placeholder:`Ask me anything about Astryx...`})})},D={render:()=>(0,p.jsx)(l,{onSubmit:()=>{},isDisabled:!0,input:(0,p.jsx)(u,{isDisabled:!0,placeholder:`Input is disabled`})})},O={render:()=>(0,p.jsx)(l,{onSubmit:e=>alert(e),input:(0,p.jsx)(u,{maxRows:3,placeholder:`Type a long message — scrolls after 3 lines...`})})},k={render:()=>{let[e,t]=(0,f.useState)([]);return(0,p.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:12},children:[(0,p.jsx)(l,{onSubmit:e=>t(t=>[...t,e]),input:(0,p.jsx)(u,{placeholder:`Submit messages, then ArrowUp to recall...`})}),e.length>0&&(0,p.jsx)(`div`,{style:{fontSize:12,fontFamily:`monospace`,color:`var(--color-text-secondary)`},children:e.map((e,t)=>(0,p.jsxs)(`div`,{children:[`→ `,e]},t))})]})}},A={render:()=>{let[e,t]=(0,f.useState)([]);return(0,p.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:12},children:[(0,p.jsx)(l,{onSubmit:e=>alert(e),input:(0,p.jsx)(u,{onFiles:e=>t(t=>[...t,...e.map(e=>e.name)]),placeholder:`Paste files here (Ctrl+V)...`})}),e.length>0&&(0,p.jsxs)(`div`,{style:{fontSize:12,color:`var(--color-text-secondary)`},children:[`Files: `,e.join(`, `)]})]})}},j={render:()=>{let e=(0,f.useRef)(null),[t,n]=(0,f.useState)(``);return(0,p.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:12},children:[(0,p.jsx)(l,{value:t,onChange:n,onSubmit:()=>{},input:(0,p.jsx)(u,{handleRef:e,placeholder:`Waiting for dictated text`})}),(0,p.jsx)(`button`,{type:`button`,onClick:()=>{e.current?.focus(),e.current?.insertText(`Dictated text`)},children:`Insert dictated text`}),(0,p.jsx)(`output`,{"aria-label":`Serialized draft`,children:t||`Empty`})]})},play:async({canvasElement:e})=>{let t=_(e);await g.click(t.getByRole(`button`,{name:`Insert dictated text`})),await m(t.getByRole(`textbox`)).toHaveTextContent(`Dictated text`),await m(t.getByRole(`status`,{name:`Serialized draft`})).toHaveTextContent(`Dictated text`),await m(t.queryByText(`Waiting for dictated text`)).not.toBeInTheDocument()}},M={render:()=>{let[e,t]=(0,f.useState)([]);return(0,p.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:12},children:[(0,p.jsx)(l,{onSubmit:()=>{},input:(0,p.jsx)(u,{onFiles:e=>t(e.map(e=>e.name)),placeholder:`Drop a file here`})}),(0,p.jsx)(`output`,{"aria-label":`Received files`,children:e.length===0?`No files`:e.join(`, `)})]})},play:async({canvasElement:e})=>{let t=_(e),n=t.getByRole(`textbox`),r=new DataTransfer;r.items.add(new File([`audit`],`dropped.txt`,{type:`text/plain`})),h.dragOver(n,{dataTransfer:r}),h.drop(n,{dataTransfer:r}),await m(t.getByRole(`status`,{name:`Received files`})).toHaveTextContent(`dropped.txt`)}},N={render:()=>{let[e,t]=(0,f.useState)(``),[n,r]=(0,f.useState)([]);return(0,p.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:16},children:[(0,p.jsx)(l,{onSubmit:e=>{r(t=>[...t,e]),t(``)},input:(0,p.jsx)(u,{value:e,onChange:t,triggers:[{character:`@`,searchSource:x,allowSpaces:!0,renderItem:e=>(0,p.jsx)(o,{item:e,description:e.auxiliaryData?.role}),onSelect:e=>({value:`@${e.id}`,label:e.label,variant:`blue`})}],placeholder:`Type @ to mention someone...`})}),(0,p.jsxs)(`div`,{style:{fontSize:12,fontFamily:`monospace`,color:`var(--color-text-secondary)`},children:[`Value: `,JSON.stringify(e)]}),n.length>0&&(0,p.jsx)(`div`,{style:{fontSize:12,fontFamily:`monospace`,color:`var(--color-text-secondary)`},children:n.map((e,t)=>(0,p.jsxs)(`div`,{children:[`→ `,e]},t))})]})}},P={render:()=>(0,p.jsx)(l,{onSubmit:e=>alert(`Sent: ${e}`),input:(0,p.jsx)(u,{triggers:[{character:`/`,searchSource:S,renderItem:e=>(0,p.jsx)(o,{item:e,description:e.auxiliaryData?.description}),onSelect:e=>({value:`/${e.label}`,label:`/${e.label}`,variant:`yellow`})}],placeholder:`Type / for commands...`})})},F={render:()=>(0,p.jsx)(l,{onSubmit:e=>alert(`Sent: ${e}`),input:(0,p.jsx)(u,{triggers:[{character:`@`,searchSource:w,onSelect:e=>({value:`@${e.id}`,label:e.label,variant:`blue`}),loadingText:`Searching users…`,emptySearchResultsText:`No users found`}],placeholder:`Type @ for async user search (300ms delay)...`})})},I={render:()=>{let[e,t]=(0,f.useState)(``);return(0,p.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:12},children:[(0,p.jsx)(l,{onSubmit:e=>{alert(`Sent: ${e}`),t(``)},input:(0,p.jsx)(u,{value:e,onChange:t,triggers:[{character:`@`,searchSource:x,allowSpaces:!0,onSelect:e=>({value:`@${e.id}`,label:e.label,variant:`blue`})},{character:`/`,searchSource:S,onSelect:e=>({value:`/${e.label}`,label:`/${e.label}`,variant:`yellow`})}],placeholder:`Type @ or / ...`})}),(0,p.jsxs)(`div`,{style:{fontSize:12,fontFamily:`monospace`,color:`var(--color-text-secondary)`},children:[`Value: `,JSON.stringify(e)]})]})}},L={render:()=>(0,p.jsx)(l,{onSubmit:e=>alert(`Sent: ${e}`),input:(0,p.jsx)(u,{triggers:[{character:`@`,searchSource:x,renderItem:e=>(0,p.jsx)(o,{item:e,description:e.auxiliaryData?.role,icon:(0,p.jsx)(`div`,{style:{width:24,height:24,borderRadius:`50%`,backgroundColor:`#e8d5f5`,display:`flex`,alignItems:`center`,justifyContent:`center`,fontSize:11,fontWeight:600,color:`#7c3aed`},children:e.label.charAt(0)})}),onSelect:e=>({value:`@${e.id}`,label:e.label,variant:`purple`,icon:(0,p.jsx)(`span`,{style:{width:14,height:14,borderRadius:`50%`,backgroundColor:`#e8d5f5`,display:`inline-flex`,alignItems:`center`,justifyContent:`center`,fontSize:8,fontWeight:700,color:`#7c3aed`},children:e.label.charAt(0)})})}],placeholder:`Type @ — tokens have icons via badge config...`})})},R={render:()=>(0,p.jsx)(l,{onSubmit:e=>alert(`Sent: ${e}`),input:(0,p.jsx)(u,{triggers:[{character:`@`,searchSource:x,onSelect:e=>({value:`@${e.id}`,label:e.label,variant:`blue`})},{character:`/`,searchSource:S,onSelect:e=>({value:`/${e.label}`,label:`/${e.label}`,variant:`purple`})}],placeholder:`@ for blue mentions, / for purple commands...`})})},z={render:()=>(0,p.jsx)(l,{onSubmit:e=>alert(`Sent: ${e}`),input:(0,p.jsx)(u,{triggers:[{character:`@`,searchSource:x,renderItem:e=>(0,p.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,gap:8},children:[(0,p.jsx)(`div`,{style:{width:24,height:24,borderRadius:`50%`,backgroundColor:`#e0e0e0`,display:`flex`,alignItems:`center`,justifyContent:`center`,fontSize:11,fontWeight:600},children:e.label.charAt(0)}),(0,p.jsx)(`span`,{children:e.label})]}),onSelect:e=>({value:`@${e.id}`,render:()=>(0,p.jsx)(`span`,{title:`Click to view ${e.label}'s profile`,style:{cursor:`pointer`},onClick:()=>alert(`Profile: ${e.label}`),children:(0,p.jsx)(i,{variant:`blue`,label:e.label,icon:(0,p.jsx)(`span`,{style:{width:14,height:14,borderRadius:`50%`,backgroundColor:`#c4d4f0`,display:`inline-flex`,alignItems:`center`,justifyContent:`center`,fontSize:8,fontWeight:700},children:e.label.charAt(0)})})})})}],placeholder:`Type @ — tokens are clickable with avatars...`})})},B={render:()=>(0,p.jsx)(l,{onSubmit:e=>alert(`Sent: ${e}`),input:(0,p.jsx)(u,{triggers:[{character:`@`,searchSource:s([{id:`cindy`,label:`Cindy Zhang`,auxiliaryData:{group:`Design`,role:`Design Systems`}},{id:`taylor`,label:`Taylor Kim`,auxiliaryData:{group:`Design`,role:`Product Design`}},{id:`alex`,label:`Alex Johnson`,auxiliaryData:{group:`Engineering`,role:`Frontend`}},{id:`sam`,label:`Sam Rivera`,auxiliaryData:{group:`Engineering`,role:`Backend`}},{id:`morgan`,label:`Morgan Chen`,auxiliaryData:{group:`Engineering`,role:`Infrastructure`}},{id:`jordan`,label:`Jordan Lee`,auxiliaryData:{group:`Product`,role:`Product Manager`}}]),renderItem:e=>(0,p.jsx)(o,{item:e,description:e.auxiliaryData?.role}),onSelect:e=>({value:`@${e.id}`,label:e.label,variant:`blue`})}],placeholder:`Type @ to see grouped mentions...`})})},V={render:()=>(0,p.jsx)(l,{onSubmit:e=>alert(`Sent: ${e}`),input:(0,p.jsx)(u,{triggers:[{character:`:`,searchSource:C,allowSpaces:!1,renderItem:e=>(0,p.jsx)(o,{item:e}),onSelect:e=>`:${e.id}: `}],placeholder:`Type : to see emoji suggestions...`})})},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
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
        color: 'var(--color-text-secondary)'
      }}>
          Value: {JSON.stringify(value)}
        </div>
      </div>;
  }
}`,...T.parameters?.docs?.source},description:{story:`Controlled value — shows the serialized value below`,...T.parameters?.docs?.description}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  render: () => <ChatComposer onSubmit={v => alert(v)} input={<ChatComposerInput placeholder="Ask me anything about Astryx..." />} />
}`,...E.parameters?.docs?.source},description:{story:`Custom placeholder`,...E.parameters?.docs?.description}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  render: () => <ChatComposer onSubmit={() => {}} isDisabled input={<ChatComposerInput isDisabled placeholder="Input is disabled" />} />
}`,...D.parameters?.docs?.source},description:{story:`Disabled state`,...D.parameters?.docs?.description}}},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
  render: () => <ChatComposer onSubmit={v => alert(v)} input={<ChatComposerInput maxRows={3} placeholder="Type a long message — scrolls after 3 lines..." />} />
}`,...O.parameters?.docs?.source},description:{story:`Max rows — scrolls after 3 lines`,...O.parameters?.docs?.description}}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
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
        color: 'var(--color-text-secondary)'
      }}>
            {log.map((msg, i) => <div key={i}>→ {msg}</div>)}
          </div>}
      </div>;
  }
}`,...k.parameters?.docs?.source},description:{story:`Message history — submit a few messages, then ArrowUp/Down to recall`,...k.parameters?.docs?.description}}},A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
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
        color: 'var(--color-text-secondary)'
      }}>
            Files: {files.join(', ')}
          </div>}
      </div>;
  }
}`,...A.parameters?.docs?.source},description:{story:`File paste handler`,...A.parameters?.docs?.description}}},j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
  render: () => {
    const inputRef = useRef<ChatComposerInputHandle>(null);
    const [value, setValue] = useState('');
    return <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 12
    }}>
        <ChatComposer value={value} onChange={setValue} onSubmit={() => {}} input={<ChatComposerInput handleRef={inputRef} placeholder="Waiting for dictated text" />} />
        <button type="button" onClick={() => {
        inputRef.current?.focus();
        inputRef.current?.insertText('Dictated text');
      }}>
          Insert dictated text
        </button>
        <output aria-label="Serialized draft">{value || 'Empty'}</output>
      </div>;
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', {
      name: 'Insert dictated text'
    }));
    await expect(canvas.getByRole('textbox')).toHaveTextContent('Dictated text');
    await expect(canvas.getByRole('status', {
      name: 'Serialized draft'
    })).toHaveTextContent('Dictated text');
    await expect(canvas.queryByText('Waiting for dictated text')).not.toBeInTheDocument();
  }
}`,...j.parameters?.docs?.source},description:{story:`Programmatic text follows the same observable draft path as typing.`,...j.parameters?.docs?.description}}},M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [files, setFiles] = useState<string[]>([]);
    return <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 12
    }}>
        <ChatComposer onSubmit={() => {}} input={<ChatComposerInput onFiles={next => setFiles(next.map(file => file.name))} placeholder="Drop a file here" />} />
        <output aria-label="Received files">
          {files.length === 0 ? 'No files' : files.join(', ')}
        </output>
      </div>;
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const textbox = canvas.getByRole('textbox');
    const transfer = new DataTransfer();
    transfer.items.add(new File(['audit'], 'dropped.txt', {
      type: 'text/plain'
    }));
    fireEvent.dragOver(textbox, {
      dataTransfer: transfer
    });
    fireEvent.drop(textbox, {
      dataTransfer: transfer
    });
    await expect(canvas.getByRole('status', {
      name: 'Received files'
    })).toHaveTextContent('dropped.txt');
  }
}`,...M.parameters?.docs?.source},description:{story:`Dropped files reach the same attachment callback as pasted files.`,...M.parameters?.docs?.description}}},N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = useState('');
    const [log, setLog] = useState<string[]>([]);
    const mentionTrigger: ChatComposerTrigger = {
      character: '@',
      searchSource: userSource,
      allowSpaces: true,
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
        color: 'var(--color-text-secondary)'
      }}>
          Value: {JSON.stringify(value)}
        </div>
        {log.length > 0 && <div style={{
        fontSize: 12,
        fontFamily: 'monospace',
        color: 'var(--color-text-secondary)'
      }}>
            {log.map((msg, i) => <div key={i}>→ {msg}</div>)}
          </div>}
      </div>;
  }
}`,...N.parameters?.docs?.source},description:{story:`Static @ mentions — type @ to see the menu`,...N.parameters?.docs?.description}}},P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
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
}`,...P.parameters?.docs?.source},description:{story:`Static / commands — type / to see commands`,...P.parameters?.docs?.description}}},F.parameters={...F.parameters,docs:{...F.parameters?.docs,source:{originalSource:`{
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
}`,...F.parameters?.docs?.source},description:{story:`Async search source — type @ to trigger a simulated API search`,...F.parameters?.docs?.description}}},I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = useState('');
    const mentionTrigger: ChatComposerTrigger = {
      character: '@',
      searchSource: userSource,
      allowSpaces: true,
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
        color: 'var(--color-text-secondary)'
      }}>
          Value: {JSON.stringify(value)}
        </div>
      </div>;
  }
}`,...I.parameters?.docs?.source},description:{story:`Multiple triggers — @ for mentions, / for commands`,...I.parameters?.docs?.description}}},L.parameters={...L.parameters,docs:{...L.parameters?.docs,source:{originalSource:`{
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
}`,...L.parameters?.docs?.source},description:{story:`Custom item rendering in the trigger menu`,...L.parameters?.docs?.description}}},R.parameters={...R.parameters,docs:{...R.parameters?.docs,source:{originalSource:`{
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
}`,...R.parameters?.docs?.source},description:{story:`Token color variants — different badge colors per trigger`,...R.parameters?.docs?.description}}},z.parameters={...z.parameters,docs:{...z.parameters?.docs,source:{originalSource:`{
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
}`,...z.parameters?.docs?.source},description:{story:`Custom render — full control via render() for rich token content`,...z.parameters?.docs?.description}}},B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
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
}`,...B.parameters?.docs?.source},description:{story:`Grouped menu items — items with auxiliaryData.group render under headings`,...B.parameters?.docs?.description}}},V.parameters={...V.parameters,docs:{...V.parameters?.docs,source:{originalSource:`{
  render: () => {
    const emojiTrigger: ChatComposerTrigger = {
      character: ':',
      searchSource: emojiSource,
      allowSpaces: false,
      renderItem: item => <TypeaheadItem item={item} />,
      onSelect: item => \`:\${item.id}: \`
    };
    return <ChatComposer onSubmit={value => alert(\`Sent: \${value}\`)} input={<ChatComposerInput triggers={[emojiTrigger]} placeholder="Type : to see emoji suggestions..." />} />;
  }
}`,...V.parameters?.docs?.source},description:{story:`Punctuation trigger (e.g. emoji picker) — type : to see the menu`,...V.parameters?.docs?.description}}},H=[`Controlled`,`CustomPlaceholder`,`Disabled`,`MaxRows`,`MessageHistory`,`FilePaste`,`ImperativeInsertion`,`FileDrop`,`MentionTrigger`,`SlashCommands`,`AsyncSearch`,`MultipleTriggers`,`CustomRenderItem`,`TokenVariants`,`CustomRender`,`GroupedItems`,`PunctuationTrigger`]}))();export{F as AsyncSearch,T as Controlled,E as CustomPlaceholder,z as CustomRender,L as CustomRenderItem,D as Disabled,M as FileDrop,A as FilePaste,B as GroupedItems,j as ImperativeInsertion,O as MaxRows,N as MentionTrigger,k as MessageHistory,I as MultipleTriggers,V as PunctuationTrigger,P as SlashCommands,R as TokenVariants,H as __namedExportsOrder,v as default};