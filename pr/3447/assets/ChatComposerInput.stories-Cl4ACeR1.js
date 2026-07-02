import{a1 as e,ah as c}from"./iframe-j1EZkcGb.js";import{a as t,C as o}from"./ChatComposer-BcJUmh-4.js";import{c as w}from"./createStaticSource-6dLwtoO2.js";import{T as D}from"./TypeaheadItem-DWF7LU8l.js";import{B as z}from"./Badge-CLWbkuoK.js";import"./preload-helper-Ct5FWWRu.js";import"./index-Rkmojgu0.js";import"./index-MFVQKO2W.js";import"./usePopover-Db3MCAxh.js";import"./HoverCard-BIppx27a.js";import"./ChatContext-D8Fdf9U-.js";const B={title:"Core/ChatComposerInput",component:t,tags:["autodocs"],parameters:{layout:"centered"},decorators:[n=>e.jsx("div",{style:{width:600,padding:40},children:e.jsx(n,{})})]},$=[{id:"cindy",label:"Cindy Zhang",auxiliaryData:{role:"Design Systems"}},{id:"alex",label:"Alex Johnson",auxiliaryData:{role:"Frontend"}},{id:"sam",label:"Sam Rivera",auxiliaryData:{role:"Backend"}},{id:"jordan",label:"Jordan Lee",auxiliaryData:{role:"Product"}},{id:"taylor",label:"Taylor Kim",auxiliaryData:{role:"Design"}},{id:"morgan",label:"Morgan Chen",auxiliaryData:{role:"Infrastructure"}}],A=[{id:"summarize",label:"summarize",auxiliaryData:{description:"Summarize the conversation"}},{id:"translate",label:"translate",auxiliaryData:{description:"Translate text to another language"}},{id:"search",label:"search",auxiliaryData:{description:"Search the web or documents"}},{id:"code",label:"code",auxiliaryData:{description:"Generate or explain code"}},{id:"help",label:"help",auxiliaryData:{description:"Show available commands"}}],j=w($),k=w(A),F={search(n){return new Promise(r=>{setTimeout(()=>{const a=n.toLowerCase();r($.filter(s=>s.label.toLowerCase().includes(a)))},300)})},bootstrap(){return $}},d={render:()=>{const[n,r]=c.useState("");return e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:12},children:[e.jsx(o,{onSubmit:a=>{alert(`Submitted: ${a}`),r("")},value:n,onChange:r,input:e.jsx(t,{value:n,onChange:r,placeholder:"Type a message..."})}),e.jsxs("div",{style:{fontSize:12,fontFamily:"monospace",color:"#888"},children:["Value: ",JSON.stringify(n)]})]})}},u={render:()=>e.jsx(o,{onSubmit:n=>alert(n),input:e.jsx(t,{placeholder:"Ask me anything about Astryx..."})})},m={render:()=>e.jsx(o,{onSubmit:()=>{},isDisabled:!0,input:e.jsx(t,{isDisabled:!0,placeholder:"Input is disabled"})})},p={render:()=>e.jsx(o,{onSubmit:n=>alert(n),input:e.jsx(t,{maxRows:3,placeholder:"Type a long message — scrolls after 3 lines..."})})},g={render:()=>{const[n,r]=c.useState([]);return e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:12},children:[e.jsx(o,{onSubmit:a=>r(s=>[...s,a]),input:e.jsx(t,{placeholder:"Submit messages, then ArrowUp to recall..."})}),n.length>0&&e.jsx("div",{style:{fontSize:12,fontFamily:"monospace",color:"#666"},children:n.map((a,s)=>e.jsxs("div",{children:["→ ",a]},s))})]})}},h={render:()=>{const[n,r]=c.useState([]);return e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:12},children:[e.jsx(o,{onSubmit:a=>alert(a),input:e.jsx(t,{onFiles:a=>r(s=>[...s,...a.map(i=>i.name)]),placeholder:"Paste files here (Ctrl+V)..."})}),n.length>0&&e.jsxs("div",{style:{fontSize:12,color:"#666"},children:["Files: ",n.join(", ")]})]})}},y={render:()=>{const[n,r]=c.useState(""),[a,s]=c.useState([]),i={character:"@",searchSource:j,renderItem:l=>e.jsx(D,{item:l,description:l.auxiliaryData?.role}),onSelect:l=>({value:`@${l.id}`,label:l.label,variant:"blue"})};return e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:16},children:[e.jsx(o,{onSubmit:l=>{s(I=>[...I,l]),r("")},input:e.jsx(t,{value:n,onChange:r,triggers:[i],placeholder:"Type @ to mention someone..."})}),e.jsxs("div",{style:{fontSize:12,fontFamily:"monospace",color:"#888"},children:["Value: ",JSON.stringify(n)]}),a.length>0&&e.jsx("div",{style:{fontSize:12,fontFamily:"monospace",color:"#666"},children:a.map((l,I)=>e.jsxs("div",{children:["→ ",l]},I))})]})}},S={render:()=>{const n={character:"/",searchSource:k,renderItem:r=>e.jsx(D,{item:r,description:r.auxiliaryData?.description}),onSelect:r=>({value:`/${r.label}`,label:`/${r.label}`,variant:"yellow"})};return e.jsx(o,{onSubmit:r=>alert(`Sent: ${r}`),input:e.jsx(t,{triggers:[n],placeholder:"Type / for commands..."})})}},b={render:()=>{const n={character:"@",searchSource:F,onSelect:r=>({value:`@${r.id}`,label:r.label,variant:"blue"}),loadingText:"Searching users…",emptySearchResultsText:"No users found"};return e.jsx(o,{onSubmit:r=>alert(`Sent: ${r}`),input:e.jsx(t,{triggers:[n],placeholder:"Type @ for async user search (300ms delay)..."})})}},v={render:()=>{const[n,r]=c.useState(""),a={character:"@",searchSource:j,onSelect:i=>({value:`@${i.id}`,label:i.label,variant:"blue"})},s={character:"/",searchSource:k,onSelect:i=>({value:`/${i.label}`,label:`/${i.label}`,variant:"yellow"})};return e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:12},children:[e.jsx(o,{onSubmit:i=>{alert(`Sent: ${i}`),r("")},input:e.jsx(t,{value:n,onChange:r,triggers:[a,s],placeholder:"Type @ or / ..."})}),e.jsxs("div",{style:{fontSize:12,fontFamily:"monospace",color:"#888"},children:["Value: ",JSON.stringify(n)]})]})}},x={render:()=>{const n={character:"@",searchSource:j,renderItem:r=>e.jsx(D,{item:r,description:r.auxiliaryData?.role,icon:e.jsx("div",{style:{width:24,height:24,borderRadius:"50%",backgroundColor:"#e8d5f5",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:600,color:"#7c3aed"},children:r.label.charAt(0)})}),onSelect:r=>({value:`@${r.id}`,label:r.label,variant:"purple",icon:e.jsx("span",{style:{width:14,height:14,borderRadius:"50%",backgroundColor:"#e8d5f5",display:"inline-flex",alignItems:"center",justifyContent:"center",fontSize:8,fontWeight:700,color:"#7c3aed"},children:r.label.charAt(0)})})};return e.jsx(o,{onSubmit:r=>alert(`Sent: ${r}`),input:e.jsx(t,{triggers:[n],placeholder:"Type @ — tokens have icons via badge config..."})})}},C={render:()=>{const n={character:"@",searchSource:j,onSelect:a=>({value:`@${a.id}`,label:a.label,variant:"blue"})},r={character:"/",searchSource:k,onSelect:a=>({value:`/${a.label}`,label:`/${a.label}`,variant:"purple"})};return e.jsx(o,{onSubmit:a=>alert(`Sent: ${a}`),input:e.jsx(t,{triggers:[n,r],placeholder:"@ for blue mentions, / for purple commands..."})})}},f={render:()=>{const n={character:"@",searchSource:j,renderItem:r=>e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:8},children:[e.jsx("div",{style:{width:24,height:24,borderRadius:"50%",backgroundColor:"#e0e0e0",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:600},children:r.label.charAt(0)}),e.jsx("span",{children:r.label})]}),onSelect:r=>({value:`@${r.id}`,render:()=>e.jsx("span",{title:`Click to view ${r.label}'s profile`,style:{cursor:"pointer"},onClick:()=>alert(`Profile: ${r.label}`),children:e.jsx(z,{variant:"blue",label:r.label,icon:e.jsx("span",{style:{width:14,height:14,borderRadius:"50%",backgroundColor:"#c4d4f0",display:"inline-flex",alignItems:"center",justifyContent:"center",fontSize:8,fontWeight:700},children:r.label.charAt(0)})})})})};return e.jsx(o,{onSubmit:r=>alert(`Sent: ${r}`),input:e.jsx(t,{triggers:[n],placeholder:"Type @ — tokens are clickable with avatars..."})})}},T={render:()=>{const r={character:"@",searchSource:w([{id:"cindy",label:"Cindy Zhang",auxiliaryData:{group:"Design",role:"Design Systems"}},{id:"taylor",label:"Taylor Kim",auxiliaryData:{group:"Design",role:"Product Design"}},{id:"alex",label:"Alex Johnson",auxiliaryData:{group:"Engineering",role:"Frontend"}},{id:"sam",label:"Sam Rivera",auxiliaryData:{group:"Engineering",role:"Backend"}},{id:"morgan",label:"Morgan Chen",auxiliaryData:{group:"Engineering",role:"Infrastructure"}},{id:"jordan",label:"Jordan Lee",auxiliaryData:{group:"Product",role:"Product Manager"}}]),renderItem:a=>e.jsx(D,{item:a,description:a.auxiliaryData?.role}),onSelect:a=>({value:`@${a.id}`,label:a.label,variant:"blue"})};return e.jsx(o,{onSubmit:a=>alert(`Sent: ${a}`),input:e.jsx(t,{triggers:[r],placeholder:"Type @ to see grouped mentions..."})})}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
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
}`,...d.parameters?.docs?.source},description:{story:"Controlled value — shows the serialized value below",...d.parameters?.docs?.description}}};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  render: () => <ChatComposer onSubmit={v => alert(v)} input={<ChatComposerInput placeholder="Ask me anything about Astryx..." />} />
}`,...u.parameters?.docs?.source},description:{story:"Custom placeholder",...u.parameters?.docs?.description}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  render: () => <ChatComposer onSubmit={() => {}} isDisabled input={<ChatComposerInput isDisabled placeholder="Input is disabled" />} />
}`,...m.parameters?.docs?.source},description:{story:"Disabled state",...m.parameters?.docs?.description}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  render: () => <ChatComposer onSubmit={v => alert(v)} input={<ChatComposerInput maxRows={3} placeholder="Type a long message — scrolls after 3 lines..." />} />
}`,...p.parameters?.docs?.source},description:{story:"Max rows — scrolls after 3 lines",...p.parameters?.docs?.description}}};g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
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
}`,...g.parameters?.docs?.source},description:{story:"Message history — submit a few messages, then ArrowUp/Down to recall",...g.parameters?.docs?.description}}};h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
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
}`,...h.parameters?.docs?.source},description:{story:"File paste handler",...h.parameters?.docs?.description}}};y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
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
}`,...y.parameters?.docs?.source},description:{story:"Static @ mentions — type @ to see the menu",...y.parameters?.docs?.description}}};S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
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
}`,...S.parameters?.docs?.source},description:{story:"Static / commands — type / to see commands",...S.parameters?.docs?.description}}};b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
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
}`,...b.parameters?.docs?.source},description:{story:"Async search source — type @ to trigger a simulated API search",...b.parameters?.docs?.description}}};v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
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
}`,...v.parameters?.docs?.source},description:{story:"Multiple triggers — @ for mentions, / for commands",...v.parameters?.docs?.description}}};x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
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
}`,...x.parameters?.docs?.source},description:{story:"Custom item rendering in the trigger menu",...x.parameters?.docs?.description}}};C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
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
}`,...C.parameters?.docs?.source},description:{story:"Token color variants — different badge colors per trigger",...C.parameters?.docs?.description}}};f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
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
}`,...f.parameters?.docs?.source},description:{story:"Custom render — full control via render() for rich token content",...f.parameters?.docs?.description}}};T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
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
}`,...T.parameters?.docs?.source},description:{story:"Grouped menu items — items with auxiliaryData.group render under headings",...T.parameters?.docs?.description}}};const G=["Controlled","CustomPlaceholder","Disabled","MaxRows","MessageHistory","FilePaste","MentionTrigger","SlashCommands","AsyncSearch","MultipleTriggers","CustomRenderItem","TokenVariants","CustomRender","GroupedItems"];export{b as AsyncSearch,d as Controlled,u as CustomPlaceholder,f as CustomRender,x as CustomRenderItem,m as Disabled,h as FilePaste,T as GroupedItems,p as MaxRows,y as MentionTrigger,g as MessageHistory,v as MultipleTriggers,S as SlashCommands,C as TokenVariants,G as __namedExportsOrder,B as default};
