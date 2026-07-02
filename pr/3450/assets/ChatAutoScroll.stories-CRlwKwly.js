import{ah as r,a1 as e,B as g,T as D}from"./iframe-Cw8JXX6x.js";import{C as T}from"./ChatComposer-XWuWg-6b.js";import{C as M}from"./ChatMessageList-DTOOassd.js";import{C as w}from"./ChatMessage-DTxCQA2o.js";import{C as j}from"./ChatToolCalls-KaJL8zOJ.js";import{C as z}from"./ChatLayout-Btz-8Pm9.js";import{M as B}from"./Markdown-M3XPVGxh.js";import{C as S}from"./CodeBlock-RIpx8Lgg.js";import{B as L}from"./Badge-CxIcCzHK.js";import"./preload-helper-Ct5FWWRu.js";import"./index-BX4H8YQT.js";import"./index-Dm1IjduH.js";import"./usePopover-DBfyiMp1.js";import"./useFocusTrap-RYvdVaLT.js";import"./HoverCard-CI1gzm4W.js";import"./ChatContext-C4CoBSsA.js";import"./getKey-DyRdrWhf.js";import"./CheckboxListItem-BxTPGcvF.js";import"./Field-DzUQIr9Z.js";import"./FieldStatus-C1k4mIkj.js";import"./List-B_76dGfD.js";import"./ListItem-BGUteHmb.js";import"./Item-CXatCzfh.js";import"./computeTargetAndRel-BlG0ENK0.js";import"./CheckboxInput-7ijgnJ1p.js";import"./Blockquote-BBkiC-hG.js";import"./Table-Beogfujq.js";import"./ContextMenu-Cje6WKDr.js";import"./renderDropdownItems-Dejv9C11.js";import"./Divider-CXkzIgPQ.js";import"./useListFocus-D1vlaBt6.js";import"./useTypeahead-B3b6_BOq.js";import"./EmptyState-DYORGikM.js";import"./useStreamingText-D-n1qWiM.js";import"./Citation-BGom681Z.js";import"./Code-BtKazpm5.js";import"./highlightRanges-DOIM2Tp5.js";const fe={title:"Core/ChatAutoScroll",tags:["autodocs"],parameters:{layout:"fullscreen"}},I=`Let me analyze this codebase for you. I'll start by looking at the project structure and understanding the architecture.

The project uses a **monorepo** structure with the following key directories:

- \`packages/core/\` — Published core components and utilities
- \`packages/cli/\` — CLI tooling for scaffolding
- \`apps/storybook/\` — Storybook for component development
- \`apps/sandbox/\` — Sandbox testing app

Looking at the architecture more closely, the system follows a **plugin-based pattern** where components are composed through a unified swizzle system. This means any internal primitive can be overridden at any level.

The auto-scroll system uses \`useChatStreamScroll\` which provides spring-based scroll-to-bottom with lock/unlock behavior:

\`\`\`tsx
const scroll = useChatStreamScroll({scrollRef});
// scroll.isLocked — auto-following content
// scroll.scrollIfLocked() — call on resize
\`\`\`

This is paired with \`useChatNewMessages\` which observes the content element via ResizeObserver and calls \`scrollIfLocked()\` on every height change.

The key question is: **does the ResizeObserver fire reliably for all types of content additions?**`,R=[[{key:"1",name:"read",target:"packages/core/src/Chat/useChatStreamScroll.ts",status:"complete",duration:"42ms",node:"astryx"}],[{key:"2",name:"bash",target:"yarn test --filter Chat",status:"complete",duration:"4.2s",node:"astryx"}],[{key:"3",name:"edit",target:"ChatLayout.tsx",status:"complete",duration:"95ms",node:"astryx",additions:12,deletions:3,resultDetail:e.jsx(S,{code:`// Added MutationObserver supplement
const observer = new MutationObserver(() => {
  scrollIfLocked();
});
observer.observe(contentEl, { childList: true, subtree: true });`,language:"typescript"})}],[{key:"4",name:"bash",target:"yarn test",status:"complete",duration:"8.1s",node:"astryx",resultDetail:e.jsx(S,{code:`$ yarn test
✓ 142 tests passed (18 suites)

Test Suites: 18 passed, 18 total
Tests:       142 passed, 142 total
Time:        8.1s`,language:"bash"})}],[{key:"5",name:"read",target:"packages/core/src/Chat/useChatNewMessages.ts",status:"complete",duration:"38ms",node:"astryx"}]],C={name:"Scroll Behavior Comparison",render:()=>{const[f,o]=r.useState([{id:1,role:"user",text:"Can you analyze the auto-scroll system and fix the issue with tool calls?"},{id:2,role:"assistant",text:"Sure, I'll look into the auto-scroll behavior. Let me start by reading the relevant files.\n\nThe scroll system uses `useChatStreamScroll` for spring-based scroll tracking and `useChatNewMessages` for content observation."},{id:3,role:"user",text:"Great, show me what you find."}]),[n,u]=r.useState(!1),c=r.useRef(void 0),h=r.useRef(0),y=r.useCallback(()=>{const t=Date.now();u(!0),o(a=>[...a,{id:t,role:"assistant",text:"",isStreaming:!0}]);let s=0;c.current=setInterval(()=>{if(s+=2+Math.floor(Math.random()*4),s>=I.length){clearInterval(c.current),o(a=>a.map(l=>l.id===t?{...l,text:I,isStreaming:!1}:l)),u(!1);return}o(a=>a.map(l=>l.id===t?{...l,text:I.slice(0,s)}:l))},25)},[]),d=r.useCallback(()=>{const t=R[h.current%R.length];h.current++;const s=Date.now();o(a=>[...a,{id:s,role:"assistant",text:"",toolCalls:t?.map(l=>({...l,status:"running",duration:void 0}))}]),setTimeout(()=>{o(a=>a.map(l=>l.id===s?{...l,toolCalls:t}:l))},1200)},[]),p=r.useCallback(()=>{const t=Date.now(),s=R.flat().map((a,l)=>({...a,key:`batch-${l}`}));o(a=>[...a,{id:t,role:"assistant",text:"Here are the results from my investigation:",toolCalls:s}])},[]),i=r.useCallback(()=>{const t=Date.now();o(s=>[...s,{id:t,role:"assistant",text:"",customElement:e.jsxs("div",{className:"x1tamke2 x4pepcl x1991y5z x8ot6hp",children:[e.jsx(D,{type:"label",weight:"bold",children:"Architecture Diagram"}),e.jsx("div",{className:"x78zum5 x6s0dn4 xl56j7k x1m3v4wt xur7f20 xjjgpb2",children:e.jsx(D,{type:"body",color:"secondary",children:"📊 Embedded visualization (200px tall custom element)"})}),e.jsx(S,{code:`┌─────────────────────┐
│  useChatStream   │
│      Scroll         │
├─────────────────────┤
│ ResizeObserver ──►  │──► scrollIfLocked()
│ (content height)    │
└─────────────────────┘
         ▲
         │ fires on height change
         │
┌─────────────────────┐
│ useChatNew       │
│     Messages        │
├─────────────────────┤
│ observeResize() ──► │──► onResize callback
│ (shared observer)   │
└─────────────────────┘`,language:"text"})]})}])},[]),m=r.useCallback(()=>{clearInterval(c.current),u(!1),h.current=0,o([{id:1,role:"user",text:"Can you analyze the auto-scroll system and fix the issue with tool calls?"},{id:2,role:"assistant",text:"Sure, I'll look into the auto-scroll behavior. Let me start by reading the relevant files.\n\nThe scroll system uses `useChatStreamScroll` for spring-based scroll tracking and `useChatNewMessages` for content observation."},{id:3,role:"user",text:"Great, show me what you find."}])},[]);return e.jsxs("div",{className:"x1dr59a3 x78zum5 xdt5ytf",children:[e.jsxs("div",{className:"x78zum5 x167g77z xc7ga6q x4befzd x1a02dak x6s0dn4",children:[e.jsx(g,{label:"Stream Text (works ✓)",variant:"primary",size:"sm",onClick:y,isDisabled:n}),e.jsx(g,{label:"Add Tool Call (may fail ✗)",variant:"secondary",size:"sm",onClick:d}),e.jsx(g,{label:"Batch Tool Calls (likely fails ✗)",variant:"secondary",size:"sm",onClick:p}),e.jsx(g,{label:"Add Custom Element (may fail ✗)",variant:"secondary",size:"sm",onClick:i}),e.jsx(g,{label:"Reset",variant:"ghost",size:"sm",onClick:m}),e.jsx("div",{className:"xvc5jky x78zum5 x6s0dn4 x17d4w8g",children:e.jsx(L,{variant:n?"green":"neutral",label:n?"Streaming":"Idle"})})]}),e.jsx(z,{composer:e.jsx(T,{onSubmit:()=>{},placeholder:"Observe auto-scroll behavior above...",isStopShown:n}),children:e.jsx(M,{children:f.map(t=>e.jsxs(w,{sender:t.role,children:[t.text&&e.jsx(B,{density:"compact",children:t.text}),t.toolCalls&&t.toolCalls.length>0&&e.jsx(j,{calls:t.toolCalls}),t.customElement]},t.id))})})]})}},b={name:"Rapid Tool Calls",render:()=>{const[f,o]=r.useState([{id:1,role:"user",text:"Run the full test suite across all packages."}]),[n,u]=r.useState(!1),c=r.useRef(void 0),h=r.useRef(0),y=r.useCallback(()=>{u(!0),h.current=0,c.current=setInterval(()=>{if(h.current++,h.current>10){clearInterval(c.current),u(!1);return}const i=Date.now()+h.current,m=["read","bash","edit","ipython","show"],t=["Button.test.tsx","yarn test --filter=Button","Button.tsx +8 -2","analyze_coverage()","coverage-report.html"],s=(h.current-1)%m.length;o(a=>[...a,{id:i,role:"assistant",text:"",toolCalls:[{key:String(i),name:m[s]??"read",target:t[s],status:"running",node:"astryx"}]}]),setTimeout(()=>{o(a=>a.map(l=>l.id===i?{...l,toolCalls:[{key:String(i),name:m[s]??"read",target:t[s],status:"complete",duration:`${(Math.random()*3+.1).toFixed(1)}s`,node:"astryx"}]}:l))},300)},500)},[]),d=r.useCallback(()=>{clearInterval(c.current),u(!1)},[]),p=r.useCallback(()=>{clearInterval(c.current),u(!1),h.current=0,o([{id:1,role:"user",text:"Run the full test suite across all packages."}])},[]);return e.jsxs("div",{className:"x1dr59a3 x78zum5 xdt5ytf",children:[e.jsxs("div",{className:"x78zum5 x167g77z xc7ga6q x4befzd x1a02dak x6s0dn4",children:[e.jsx(g,{label:n?"Running...":"Start Rapid Tool Calls",variant:"primary",size:"sm",onClick:y,isDisabled:n}),e.jsx(g,{label:"Stop",variant:"destructive",size:"sm",onClick:d,isDisabled:!n}),e.jsx(g,{label:"Reset",variant:"ghost",size:"sm",onClick:p}),e.jsx("div",{className:"xvc5jky x78zum5 x6s0dn4 x17d4w8g",children:e.jsx(L,{variant:n?"yellow":"neutral",label:n?`Tool call ${h.current}/10`:`${f.length-1} messages`})})]}),e.jsx(z,{composer:e.jsx(T,{onSubmit:()=>{},placeholder:"Watch scroll behavior..."}),children:e.jsx(M,{children:f.map(i=>e.jsxs(w,{sender:i.role,children:[i.text&&e.jsx(B,{density:"compact",children:i.text}),i.toolCalls&&i.toolCalls.length>0&&e.jsx(j,{calls:i.toolCalls})]},i.id))})})]})}},k={name:"Mixed Stream + Tools",render:()=>{const[f,o]=r.useState([{id:1,role:"user",text:"Fix the focus ring and run the tests."}]),[n,u]=r.useState("idle"),c=r.useRef(void 0),h=r.useCallback(()=>{u("streaming");const d=Date.now(),p=`Let me look at the Button component's focus styles and fix the ring.

I can see the issue — the focus ring uses a hardcoded color instead of the theme token. Let me fix that and run the tests.`;o(m=>[...m,{id:d,role:"assistant",text:"",isStreaming:!0}]);let i=0;c.current=setInterval(()=>{if(i+=3+Math.floor(Math.random()*4),i>=p.length){clearInterval(c.current),o(m=>m.map(t=>t.id===d?{...t,text:p,isStreaming:!1}:t)),u("tools"),setTimeout(()=>{const m=Date.now();o(t=>[...t,{id:m,role:"assistant",text:"",toolCalls:[{key:"1",name:"edit",target:"Button.tsx",status:"running",node:"astryx"}]}]),setTimeout(()=>{o(t=>t.map(s=>s.id===m?{...s,toolCalls:[{key:"1",name:"edit",target:"Button.tsx",status:"complete",duration:"92ms",node:"astryx",additions:4,deletions:2,resultDetail:e.jsx(S,{code:`- outline: 2px solid blue;
+ outline: 2px solid var(--color-ring-focus);
+ outline-offset: 2px;`,language:"diff"})}]}:s)),setTimeout(()=>{const t=Date.now();o(s=>[...s,{id:t,role:"assistant",text:"",toolCalls:[{key:"2",name:"bash",target:"yarn test --filter Button",status:"running",node:"astryx"}]}]),setTimeout(()=>{o(s=>s.map(a=>a.id===t?{...a,toolCalls:[{key:"2",name:"bash",target:"yarn test --filter Button",status:"complete",duration:"3.8s",node:"astryx",resultDetail:e.jsx(S,{code:`✓ 24 tests passed

Test Suites: 3 passed, 3 total
Tests:       24 passed, 24 total`,language:"bash"})}]}:a)),setTimeout(()=>{const s=Date.now(),a="Done! The focus ring now uses the theme token `var(--color-ring-focus)` with a 2px offset. All 24 tests pass.\n\nThe fix ensures the ring adapts to different themes automatically — no more hardcoded blue.";o(v=>[...v,{id:s,role:"assistant",text:"",isStreaming:!0}]);let l=0;c.current=setInterval(()=>{if(l+=3+Math.floor(Math.random()*4),l>=a.length){clearInterval(c.current),o(v=>v.map(x=>x.id===s?{...x,text:a,isStreaming:!1}:x)),u("done");return}o(v=>v.map(x=>x.id===s?{...x,text:a.slice(0,l)}:x))},25)},600)},2e3)},800)},1500)},500);return}o(m=>m.map(t=>t.id===d?{...t,text:p.slice(0,i)}:t))},25)},[]),y=r.useCallback(()=>{clearInterval(c.current),u("idle"),o([{id:1,role:"user",text:"Fix the focus ring and run the tests."}])},[]);return e.jsxs("div",{className:"x1dr59a3 x78zum5 xdt5ytf",children:[e.jsxs("div",{className:"x78zum5 x167g77z xc7ga6q x4befzd x1a02dak x6s0dn4",children:[e.jsx(g,{label:"Run Full Sequence",variant:"primary",size:"sm",onClick:h,isDisabled:n!=="idle"&&n!=="done"}),e.jsx(g,{label:"Reset",variant:"ghost",size:"sm",onClick:y}),e.jsx("div",{className:"xvc5jky x78zum5 x6s0dn4 x17d4w8g",children:e.jsx(L,{variant:n==="streaming"?"green":n==="tools"?"yellow":"neutral",label:n==="idle"?"Ready":n==="streaming"?"Streaming text...":n==="tools"?"Adding tool calls...":"Complete"})})]}),e.jsx(z,{composer:e.jsx(T,{onSubmit:()=>{},placeholder:"Watch the transition from streaming → tool calls..."}),children:e.jsx(M,{children:f.map(d=>e.jsxs(w,{sender:d.role,children:[d.text&&e.jsx(B,{density:"compact",children:d.text}),d.toolCalls&&d.toolCalls.length>0&&e.jsx(j,{calls:d.toolCalls})]},d.id))})})]})}};C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  name: 'Scroll Behavior Comparison',
  render: () => {
    const [messages, setMessages] = useState<DemoMessage[]>([{
      id: 1,
      role: 'user',
      text: 'Can you analyze the auto-scroll system and fix the issue with tool calls?'
    }, {
      id: 2,
      role: 'assistant',
      text: "Sure, I'll look into the auto-scroll behavior. Let me start by reading the relevant files.\\n\\nThe scroll system uses \`useChatStreamScroll\` for spring-based scroll tracking and \`useChatNewMessages\` for content observation."
    }, {
      id: 3,
      role: 'user',
      text: 'Great, show me what you find.'
    }]);
    const [isStreaming, setIsStreaming] = useState(false);
    const streamRef = useRef<ReturnType<typeof setInterval>>(undefined);
    const toolCallIndex = useRef(0);

    // --- Stream text (should auto-scroll) ---
    const handleStreamText = useCallback(() => {
      const msgId = Date.now();
      setIsStreaming(true);
      setMessages(prev => [...prev, {
        id: msgId,
        role: 'assistant',
        text: '',
        isStreaming: true
      }]);
      let charIdx = 0;
      streamRef.current = setInterval(() => {
        charIdx += 2 + Math.floor(Math.random() * 4);
        if (charIdx >= STREAMING_TEXT.length) {
          clearInterval(streamRef.current);
          setMessages(prev => prev.map(m => m.id === msgId ? {
            ...m,
            text: STREAMING_TEXT,
            isStreaming: false
          } : m));
          setIsStreaming(false);
          return;
        }
        setMessages(prev => prev.map(m => m.id === msgId ? {
          ...m,
          text: STREAMING_TEXT.slice(0, charIdx)
        } : m));
      }, 25);
    }, []);

    // --- Add tool calls one at a time (may fail to auto-scroll) ---
    const handleAddToolCall = useCallback(() => {
      const tools = TOOL_CALLS_SEQUENCE[toolCallIndex.current % TOOL_CALLS_SEQUENCE.length];
      toolCallIndex.current++;
      const msgId = Date.now();
      // First add with 'running' status
      setMessages(prev => [...prev, {
        id: msgId,
        role: 'assistant',
        text: '',
        toolCalls: tools?.map(tc => ({
          ...tc,
          status: 'running' as const,
          duration: undefined
        }))
      }]);

      // After a delay, mark as complete
      setTimeout(() => {
        setMessages(prev => prev.map(m => m.id === msgId ? {
          ...m,
          toolCalls: tools
        } : m));
      }, 1200);
    }, []);

    // --- Add batch of tool calls at once (most likely to miss scroll) ---
    const handleBatchToolCalls = useCallback(() => {
      const msgId = Date.now();
      const allCalls = TOOL_CALLS_SEQUENCE.flat().map((tc, i) => ({
        ...tc,
        key: \`batch-\${i}\`
      }));
      setMessages(prev => [...prev, {
        id: msgId,
        role: 'assistant',
        text: 'Here are the results from my investigation:',
        toolCalls: allCalls
      }]);
    }, []);

    // --- Add a large custom element (simulates embedded widget) ---
    const handleAddCustomElement = useCallback(() => {
      const msgId = Date.now();
      setMessages(prev => [...prev, {
        id: msgId,
        role: 'assistant',
        text: '',
        customElement: <div {...stylex.props(styles.customElement)}>
              <Text type="label" weight="bold">
                Architecture Diagram
              </Text>
              <div {...stylex.props(styles.customElementInner)}>
                <Text type="body" color="secondary">
                  📊 Embedded visualization (200px tall custom element)
                </Text>
              </div>
              <CodeBlock code={\`┌─────────────────────┐\\n│  useChatStream   │\\n│      Scroll         │\\n├─────────────────────┤\\n│ ResizeObserver ──►  │──► scrollIfLocked()\\n│ (content height)    │\\n└─────────────────────┘\\n         ▲\\n         │ fires on height change\\n         │\\n┌─────────────────────┐\\n│ useChatNew       │\\n│     Messages        │\\n├─────────────────────┤\\n│ observeResize() ──► │──► onResize callback\\n│ (shared observer)   │\\n└─────────────────────┘\`} language="text" />
            </div>
      }]);
    }, []);

    // --- Reset ---
    const handleReset = useCallback(() => {
      clearInterval(streamRef.current);
      setIsStreaming(false);
      toolCallIndex.current = 0;
      setMessages([{
        id: 1,
        role: 'user',
        text: 'Can you analyze the auto-scroll system and fix the issue with tool calls?'
      }, {
        id: 2,
        role: 'assistant',
        text: "Sure, I'll look into the auto-scroll behavior. Let me start by reading the relevant files.\\n\\nThe scroll system uses \`useChatStreamScroll\` for spring-based scroll tracking and \`useChatNewMessages\` for content observation."
      }, {
        id: 3,
        role: 'user',
        text: 'Great, show me what you find.'
      }]);
    }, []);
    return <div {...stylex.props(styles.wrapper)}>
        {/* Control bar */}
        <div {...stylex.props(styles.controls)}>
          <Button label="Stream Text (works ✓)" variant="primary" size="sm" onClick={handleStreamText} isDisabled={isStreaming} />
          <Button label="Add Tool Call (may fail ✗)" variant="secondary" size="sm" onClick={handleAddToolCall} />
          <Button label="Batch Tool Calls (likely fails ✗)" variant="secondary" size="sm" onClick={handleBatchToolCalls} />
          <Button label="Add Custom Element (may fail ✗)" variant="secondary" size="sm" onClick={handleAddCustomElement} />
          <Button label="Reset" variant="ghost" size="sm" onClick={handleReset} />
          <div {...stylex.props(styles.statusPill)}>
            <Badge variant={isStreaming ? 'green' : 'neutral'} label={isStreaming ? 'Streaming' : 'Idle'} />
          </div>
        </div>
        {/* Chat area */}
        <ChatLayout composer={<ChatComposer onSubmit={() => {}} placeholder="Observe auto-scroll behavior above..." isStopShown={isStreaming} />}>
          <ChatMessageList>
            {messages.map(msg => <ChatMessage key={msg.id} sender={msg.role}>
                {msg.text && <Markdown density="compact">{msg.text}</Markdown>}
                {msg.toolCalls && msg.toolCalls.length > 0 && <ChatToolCalls calls={msg.toolCalls} />}
                {msg.customElement}
              </ChatMessage>)}
          </ChatMessageList>
        </ChatLayout>
      </div>;
  }
}`,...C.parameters?.docs?.source},description:{story:`Demonstrates the auto-scroll issue: streaming text scrolls correctly,
but tool calls and custom elements may not trigger auto-scroll.

Use the control buttons to add different content types and observe
whether the chat auto-scrolls to keep new content visible.`,...C.parameters?.docs?.description}}};b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  name: 'Rapid Tool Calls',
  render: () => {
    const [messages, setMessages] = useState<DemoMessage[]>([{
      id: 1,
      role: 'user',
      text: 'Run the full test suite across all packages.'
    }]);
    const [isRunning, setIsRunning] = useState(false);
    const intervalRef = useRef<ReturnType<typeof setInterval>>(undefined);
    const counterRef = useRef(0);
    const handleStart = useCallback(() => {
      setIsRunning(true);
      counterRef.current = 0;
      intervalRef.current = setInterval(() => {
        counterRef.current++;
        if (counterRef.current > 10) {
          clearInterval(intervalRef.current);
          setIsRunning(false);
          return;
        }
        const msgId = Date.now() + counterRef.current;
        const toolNames = ['read', 'bash', 'edit', 'ipython', 'show'];
        const targets = ['Button.test.tsx', 'yarn test --filter=Button', 'Button.tsx +8 -2', 'analyze_coverage()', 'coverage-report.html'];
        const idx = (counterRef.current - 1) % toolNames.length;
        setMessages(prev => [...prev, {
          id: msgId,
          role: 'assistant',
          text: '',
          toolCalls: [{
            key: String(msgId),
            name: toolNames[idx] ?? 'read',
            target: targets[idx],
            status: 'running',
            node: 'astryx'
          }]
        }]);

        // Mark complete after 300ms
        setTimeout(() => {
          setMessages(prev => prev.map(m => m.id === msgId ? {
            ...m,
            toolCalls: [{
              key: String(msgId),
              name: toolNames[idx] ?? 'read',
              target: targets[idx],
              status: 'complete' as const,
              duration: \`\${(Math.random() * 3 + 0.1).toFixed(1)}s\`,
              node: 'astryx'
            }]
          } : m));
        }, 300);
      }, 500);
    }, []);
    const handleStop = useCallback(() => {
      clearInterval(intervalRef.current);
      setIsRunning(false);
    }, []);
    const handleReset = useCallback(() => {
      clearInterval(intervalRef.current);
      setIsRunning(false);
      counterRef.current = 0;
      setMessages([{
        id: 1,
        role: 'user',
        text: 'Run the full test suite across all packages.'
      }]);
    }, []);
    return <div {...stylex.props(styles.wrapper)}>
        <div {...stylex.props(styles.controls)}>
          <Button label={isRunning ? 'Running...' : 'Start Rapid Tool Calls'} variant="primary" size="sm" onClick={handleStart} isDisabled={isRunning} />
          <Button label="Stop" variant="destructive" size="sm" onClick={handleStop} isDisabled={!isRunning} />
          <Button label="Reset" variant="ghost" size="sm" onClick={handleReset} />
          <div {...stylex.props(styles.statusPill)}>
            <Badge variant={isRunning ? 'yellow' : 'neutral'} label={isRunning ? \`Tool call \${counterRef.current}/10\` : \`\${messages.length - 1} messages\`} />
          </div>
        </div>

        <ChatLayout composer={<ChatComposer onSubmit={() => {}} placeholder="Watch scroll behavior..." />}>
          <ChatMessageList>
            {messages.map(msg => <ChatMessage key={msg.id} sender={msg.role}>
                {msg.text && <Markdown density="compact">{msg.text}</Markdown>}
                {msg.toolCalls && msg.toolCalls.length > 0 && <ChatToolCalls calls={msg.toolCalls} />}
              </ChatMessage>)}
          </ChatMessageList>
        </ChatLayout>
      </div>;
  }
}`,...b.parameters?.docs?.source},description:{story:`Rapid tool call additions — fires 5 tool calls every 500ms to stress-test
the ResizeObserver + scrollIfLocked pathway.`,...b.parameters?.docs?.description}}};k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  name: 'Mixed Stream + Tools',
  render: () => {
    const [messages, setMessages] = useState<DemoMessage[]>([{
      id: 1,
      role: 'user',
      text: 'Fix the focus ring and run the tests.'
    }]);
    const [phase, setPhase] = useState<'idle' | 'streaming' | 'tools' | 'done'>('idle');
    const streamRef = useRef<ReturnType<typeof setInterval>>(undefined);
    const handleRun = useCallback(() => {
      setPhase('streaming');
      const msgId = Date.now();
      const introText = "Let me look at the Button component's focus styles and fix the ring.\\n\\nI can see the issue — the focus ring uses a hardcoded color instead of the theme token. Let me fix that and run the tests.";
      setMessages(prev => [...prev, {
        id: msgId,
        role: 'assistant',
        text: '',
        isStreaming: true
      }]);
      let i = 0;
      streamRef.current = setInterval(() => {
        i += 3 + Math.floor(Math.random() * 4);
        if (i >= introText.length) {
          clearInterval(streamRef.current);
          setMessages(prev => prev.map(m => m.id === msgId ? {
            ...m,
            text: introText,
            isStreaming: false
          } : m));

          // Transition to tool calls
          setPhase('tools');
          setTimeout(() => {
            const toolMsgId = Date.now();
            setMessages(prev => [...prev, {
              id: toolMsgId,
              role: 'assistant',
              text: '',
              toolCalls: [{
                key: '1',
                name: 'edit',
                target: 'Button.tsx',
                status: 'running',
                node: 'astryx'
              }]
            }]);
            setTimeout(() => {
              setMessages(prev => prev.map(m => m.id === toolMsgId ? {
                ...m,
                toolCalls: [{
                  key: '1',
                  name: 'edit',
                  target: 'Button.tsx',
                  status: 'complete',
                  duration: '92ms',
                  node: 'astryx',
                  additions: 4,
                  deletions: 2,
                  resultDetail: <CodeBlock code={\`- outline: 2px solid blue;\\n+ outline: 2px solid var(--color-ring-focus);\\n+ outline-offset: 2px;\`} language="diff" />
                }]
              } : m));

              // Second tool call
              setTimeout(() => {
                const testMsgId = Date.now();
                setMessages(prev => [...prev, {
                  id: testMsgId,
                  role: 'assistant',
                  text: '',
                  toolCalls: [{
                    key: '2',
                    name: 'bash',
                    target: 'yarn test --filter Button',
                    status: 'running',
                    node: 'astryx'
                  }]
                }]);
                setTimeout(() => {
                  setMessages(prev => prev.map(m => m.id === testMsgId ? {
                    ...m,
                    toolCalls: [{
                      key: '2',
                      name: 'bash',
                      target: 'yarn test --filter Button',
                      status: 'complete',
                      duration: '3.8s',
                      node: 'astryx',
                      resultDetail: <CodeBlock code={\`✓ 24 tests passed\\n\\nTest Suites: 3 passed, 3 total\\nTests:       24 passed, 24 total\`} language="bash" />
                    }]
                  } : m));

                  // Final streaming summary
                  setTimeout(() => {
                    const summaryId = Date.now();
                    const summaryText = 'Done! The focus ring now uses the theme token \`var(--color-ring-focus)\` with a 2px offset. All 24 tests pass.\\n\\nThe fix ensures the ring adapts to different themes automatically — no more hardcoded blue.';
                    setMessages(prev => [...prev, {
                      id: summaryId,
                      role: 'assistant',
                      text: '',
                      isStreaming: true
                    }]);
                    let j = 0;
                    streamRef.current = setInterval(() => {
                      j += 3 + Math.floor(Math.random() * 4);
                      if (j >= summaryText.length) {
                        clearInterval(streamRef.current);
                        setMessages(prev => prev.map(m => m.id === summaryId ? {
                          ...m,
                          text: summaryText,
                          isStreaming: false
                        } : m));
                        setPhase('done');
                        return;
                      }
                      setMessages(prev => prev.map(m => m.id === summaryId ? {
                        ...m,
                        text: summaryText.slice(0, j)
                      } : m));
                    }, 25);
                  }, 600);
                }, 2000);
              }, 800);
            }, 1500);
          }, 500);
          return;
        }
        setMessages(prev => prev.map(m => m.id === msgId ? {
          ...m,
          text: introText.slice(0, i)
        } : m));
      }, 25);
    }, []);
    const handleReset = useCallback(() => {
      clearInterval(streamRef.current);
      setPhase('idle');
      setMessages([{
        id: 1,
        role: 'user',
        text: 'Fix the focus ring and run the tests.'
      }]);
    }, []);
    return <div {...stylex.props(styles.wrapper)}>
        <div {...stylex.props(styles.controls)}>
          <Button label="Run Full Sequence" variant="primary" size="sm" onClick={handleRun} isDisabled={phase !== 'idle' && phase !== 'done'} />
          <Button label="Reset" variant="ghost" size="sm" onClick={handleReset} />
          <div {...stylex.props(styles.statusPill)}>
            <Badge variant={phase === 'streaming' ? 'green' : phase === 'tools' ? 'yellow' : 'neutral'} label={phase === 'idle' ? 'Ready' : phase === 'streaming' ? 'Streaming text...' : phase === 'tools' ? 'Adding tool calls...' : 'Complete'} />
          </div>
        </div>

        <ChatLayout composer={<ChatComposer onSubmit={() => {}} placeholder="Watch the transition from streaming → tool calls..." />}>
          <ChatMessageList>
            {messages.map(msg => <ChatMessage key={msg.id} sender={msg.role}>
                {msg.text && <Markdown density="compact">{msg.text}</Markdown>}
                {msg.toolCalls && msg.toolCalls.length > 0 && <ChatToolCalls calls={msg.toolCalls} />}
              </ChatMessage>)}
          </ChatMessageList>
        </ChatLayout>
      </div>;
  }
}`,...k.parameters?.docs?.source},description:{story:`Mixed content — alternates between streaming text and tool call blocks,
showing the transition points where scroll may break.`,...k.parameters?.docs?.description}}};const ye=["ScrollBehaviorComparison","RapidToolCalls","MixedStreamAndTools"];export{k as MixedStreamAndTools,b as RapidToolCalls,C as ScrollBehaviorComparison,ye as __namedExportsOrder,fe as default};
