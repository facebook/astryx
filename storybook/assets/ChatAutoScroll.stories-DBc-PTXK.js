import{i as e,s as t}from"./preload-helper-CT_b8DTk.js";import{t as n}from"./react-B7Te67-h.js";import{t as r}from"./jsx-runtime-DqZldVDK.js";import{t as i}from"./Text-Iat6xWeA.js";import{t as a}from"./Button-BBk5Kqd0.js";import{t as o}from"./Button-CRpvXAU4.js";import{n as s,t as c}from"./Badge-x089lqwb.js";import{i as l,t as u}from"./CodeBlock-P_m4K-1N.js";import{t as d}from"./Text-BUJwo4gL.js";import{Ar as f,Br as p,Cr as m,Hr as h,Jr as g,Mr as _,Sr as v,Tr as y}from"./iframe-rS7i1xed.js";var b,x,S,C,w,T,E,D,O;e((()=>{y(),v(),o(),d(),u(),c(),b=t(n()),x=r(),S={title:`Core/ChatAutoScroll`,tags:[`autodocs`],parameters:{layout:`fullscreen`}},C=`Let me analyze this codebase for you. I'll start by looking at the project structure and understanding the architecture.

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

The key question is: **does the ResizeObserver fire reliably for all types of content additions?**`,w=[[{key:`1`,name:`read`,target:`packages/core/src/Chat/useChatStreamScroll.ts`,status:`complete`,duration:`42ms`,node:`astryx`}],[{key:`2`,name:`bash`,target:`yarn test --filter Chat`,status:`complete`,duration:`4.2s`,node:`astryx`}],[{key:`3`,name:`edit`,target:`ChatLayout.tsx`,status:`complete`,duration:`95ms`,node:`astryx`,additions:12,deletions:3,resultDetail:(0,x.jsx)(l,{code:`// Added MutationObserver supplement
const observer = new MutationObserver(() => {
  scrollIfLocked();
});
observer.observe(contentEl, { childList: true, subtree: true });`,language:`typescript`})}],[{key:`4`,name:`bash`,target:`yarn test`,status:`complete`,duration:`8.1s`,node:`astryx`,resultDetail:(0,x.jsx)(l,{code:`$ yarn test
✓ 142 tests passed (18 suites)

Test Suites: 18 passed, 18 total
Tests:       142 passed, 142 total
Time:        8.1s`,language:`bash`})}],[{key:`5`,name:`read`,target:`packages/core/src/Chat/useChatNewMessages.ts`,status:`complete`,duration:`38ms`,node:`astryx`}]],T={name:`Scroll Behavior Comparison`,render:()=>{let[e,t]=(0,b.useState)([{id:1,role:`user`,text:`Can you analyze the auto-scroll system and fix the issue with tool calls?`},{id:2,role:`assistant`,text:"Sure, I'll look into the auto-scroll behavior. Let me start by reading the relevant files.\n\nThe scroll system uses `useChatStreamScroll` for spring-based scroll tracking and `useChatNewMessages` for content observation."},{id:3,role:`user`,text:`Great, show me what you find.`}]),[n,r]=(0,b.useState)(!1),o=(0,b.useRef)(void 0),c=(0,b.useRef)(0),u=(0,b.useCallback)(()=>{let e=Date.now();r(!0),t(t=>[...t,{id:e,role:`assistant`,text:``,isStreaming:!0}]);let n=0;o.current=setInterval(()=>{if(n+=2+Math.floor(Math.random()*4),n>=C.length){clearInterval(o.current),t(t=>t.map(t=>t.id===e?{...t,text:C,isStreaming:!1}:t)),r(!1);return}t(t=>t.map(t=>t.id===e?{...t,text:C.slice(0,n)}:t))},25)},[]),d=(0,b.useCallback)(()=>{let e=w[c.current%w.length];c.current++;let n=Date.now();t(t=>[...t,{id:n,role:`assistant`,text:``,toolCalls:e?.map(e=>({...e,status:`running`,duration:void 0}))}]),setTimeout(()=>{t(t=>t.map(t=>t.id===n?{...t,toolCalls:e}:t))},1200)},[]),v=(0,b.useCallback)(()=>{let e=Date.now(),n=w.flat().map((e,t)=>({...e,key:`batch-${t}`}));t(t=>[...t,{id:e,role:`assistant`,text:`Here are the results from my investigation:`,toolCalls:n}])},[]),y=(0,b.useCallback)(()=>{let e=Date.now();t(t=>[...t,{id:e,role:`assistant`,text:``,customElement:(0,x.jsxs)(`div`,{className:`x1tamke2 x4pepcl x1991y5z x8ot6hp`,children:[(0,x.jsx)(i,{type:`label`,weight:`bold`,children:`Architecture Diagram`}),(0,x.jsx)(`div`,{className:`x78zum5 x6s0dn4 xl56j7k x1m3v4wt xur7f20 xjjgpb2`,children:(0,x.jsx)(i,{type:`body`,color:`secondary`,children:`📊 Embedded visualization (200px tall custom element)`})}),(0,x.jsx)(l,{code:`┌─────────────────────┐
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
└─────────────────────┘`,language:`text`})]})}])},[]),S=(0,b.useCallback)(()=>{clearInterval(o.current),r(!1),c.current=0,t([{id:1,role:`user`,text:`Can you analyze the auto-scroll system and fix the issue with tool calls?`},{id:2,role:`assistant`,text:"Sure, I'll look into the auto-scroll behavior. Let me start by reading the relevant files.\n\nThe scroll system uses `useChatStreamScroll` for spring-based scroll tracking and `useChatNewMessages` for content observation."},{id:3,role:`user`,text:`Great, show me what you find.`}])},[]);return(0,x.jsxs)(`div`,{className:`x1dr59a3 x78zum5 xdt5ytf`,children:[(0,x.jsxs)(`div`,{className:`x78zum5 x167g77z xc7ga6q x4befzd x1a02dak x6s0dn4`,children:[(0,x.jsx)(a,{label:`Stream Text (works ✓)`,variant:`primary`,size:`sm`,onClick:u,isDisabled:n}),(0,x.jsx)(a,{label:`Add Tool Call (may fail ✗)`,variant:`secondary`,size:`sm`,onClick:d}),(0,x.jsx)(a,{label:`Batch Tool Calls (likely fails ✗)`,variant:`secondary`,size:`sm`,onClick:v}),(0,x.jsx)(a,{label:`Add Custom Element (may fail ✗)`,variant:`secondary`,size:`sm`,onClick:y}),(0,x.jsx)(a,{label:`Reset`,variant:`ghost`,size:`sm`,onClick:S}),(0,x.jsx)(`div`,{className:`xvc5jky x78zum5 x6s0dn4 x17d4w8g`,children:(0,x.jsx)(s,{variant:n?`green`:`neutral`,label:n?`Streaming`:`Idle`})})]}),(0,x.jsx)(f,{composer:(0,x.jsx)(g,{onSubmit:()=>{},placeholder:`Observe auto-scroll behavior above...`,isStopShown:n}),children:(0,x.jsx)(h,{children:e.map(e=>(0,x.jsxs)(p,{sender:e.role,children:[e.text&&(0,x.jsx)(m,{density:`compact`,children:e.text}),e.toolCalls&&e.toolCalls.length>0&&(0,x.jsx)(_,{calls:e.toolCalls}),e.customElement]},e.id))})})]})}},E={name:`Rapid Tool Calls`,render:()=>{let[e,t]=(0,b.useState)([{id:1,role:`user`,text:`Run the full test suite across all packages.`}]),[n,r]=(0,b.useState)(!1),i=(0,b.useRef)(void 0),o=(0,b.useRef)(0),c=(0,b.useCallback)(()=>{r(!0),o.current=0,i.current=setInterval(()=>{if(o.current++,o.current>10){clearInterval(i.current),r(!1);return}let e=Date.now()+o.current,n=[`read`,`bash`,`edit`,`ipython`,`show`],a=[`Button.test.tsx`,`yarn test --filter=Button`,`Button.tsx +8 -2`,`analyze_coverage()`,`coverage-report.html`],s=(o.current-1)%n.length;t(t=>[...t,{id:e,role:`assistant`,text:``,toolCalls:[{key:String(e),name:n[s]??`read`,target:a[s],status:`running`,node:`astryx`}]}]),setTimeout(()=>{t(t=>t.map(t=>t.id===e?{...t,toolCalls:[{key:String(e),name:n[s]??`read`,target:a[s],status:`complete`,duration:`${(Math.random()*3+.1).toFixed(1)}s`,node:`astryx`}]}:t))},300)},500)},[]),l=(0,b.useCallback)(()=>{clearInterval(i.current),r(!1)},[]),u=(0,b.useCallback)(()=>{clearInterval(i.current),r(!1),o.current=0,t([{id:1,role:`user`,text:`Run the full test suite across all packages.`}])},[]);return(0,x.jsxs)(`div`,{className:`x1dr59a3 x78zum5 xdt5ytf`,children:[(0,x.jsxs)(`div`,{className:`x78zum5 x167g77z xc7ga6q x4befzd x1a02dak x6s0dn4`,children:[(0,x.jsx)(a,{label:n?`Running...`:`Start Rapid Tool Calls`,variant:`primary`,size:`sm`,onClick:c,isDisabled:n}),(0,x.jsx)(a,{label:`Stop`,variant:`destructive`,size:`sm`,onClick:l,isDisabled:!n}),(0,x.jsx)(a,{label:`Reset`,variant:`ghost`,size:`sm`,onClick:u}),(0,x.jsx)(`div`,{className:`xvc5jky x78zum5 x6s0dn4 x17d4w8g`,children:(0,x.jsx)(s,{variant:n?`yellow`:`neutral`,label:n?`Tool call ${o.current}/10`:`${e.length-1} messages`})})]}),(0,x.jsx)(f,{composer:(0,x.jsx)(g,{onSubmit:()=>{},placeholder:`Watch scroll behavior...`}),children:(0,x.jsx)(h,{children:e.map(e=>(0,x.jsxs)(p,{sender:e.role,children:[e.text&&(0,x.jsx)(m,{density:`compact`,children:e.text}),e.toolCalls&&e.toolCalls.length>0&&(0,x.jsx)(_,{calls:e.toolCalls})]},e.id))})})]})}},D={name:`Mixed Stream + Tools`,render:()=>{let[e,t]=(0,b.useState)([{id:1,role:`user`,text:`Fix the focus ring and run the tests.`}]),[n,r]=(0,b.useState)(`idle`),i=(0,b.useRef)(void 0),o=(0,b.useCallback)(()=>{r(`streaming`);let e=Date.now(),n=`Let me look at the Button component's focus styles and fix the ring.

I can see the issue — the focus ring uses a hardcoded color instead of the theme token. Let me fix that and run the tests.`;t(t=>[...t,{id:e,role:`assistant`,text:``,isStreaming:!0}]);let a=0;i.current=setInterval(()=>{if(a+=3+Math.floor(Math.random()*4),a>=192){clearInterval(i.current),t(t=>t.map(t=>t.id===e?{...t,text:n,isStreaming:!1}:t)),r(`tools`),setTimeout(()=>{let e=Date.now();t(t=>[...t,{id:e,role:`assistant`,text:``,toolCalls:[{key:`1`,name:`edit`,target:`Button.tsx`,status:`running`,node:`astryx`}]}]),setTimeout(()=>{t(t=>t.map(t=>t.id===e?{...t,toolCalls:[{key:`1`,name:`edit`,target:`Button.tsx`,status:`complete`,duration:`92ms`,node:`astryx`,additions:4,deletions:2,resultDetail:(0,x.jsx)(l,{code:`- outline: 2px solid blue;
+ outline: 2px solid var(--color-ring-focus);
+ outline-offset: 2px;`,language:`diff`})}]}:t)),setTimeout(()=>{let e=Date.now();t(t=>[...t,{id:e,role:`assistant`,text:``,toolCalls:[{key:`2`,name:`bash`,target:`yarn test --filter Button`,status:`running`,node:`astryx`}]}]),setTimeout(()=>{t(t=>t.map(t=>t.id===e?{...t,toolCalls:[{key:`2`,name:`bash`,target:`yarn test --filter Button`,status:`complete`,duration:`3.8s`,node:`astryx`,resultDetail:(0,x.jsx)(l,{code:`✓ 24 tests passed

Test Suites: 3 passed, 3 total
Tests:       24 passed, 24 total`,language:`bash`})}]}:t)),setTimeout(()=>{let e=Date.now(),n=`Done! The focus ring now uses the theme token \`var(--color-ring-focus)\` with a 2px offset. All 24 tests pass.

The fix ensures the ring adapts to different themes automatically — no more hardcoded blue.`;t(t=>[...t,{id:e,role:`assistant`,text:``,isStreaming:!0}]);let a=0;i.current=setInterval(()=>{if(a+=3+Math.floor(Math.random()*4),a>=202){clearInterval(i.current),t(t=>t.map(t=>t.id===e?{...t,text:n,isStreaming:!1}:t)),r(`done`);return}t(t=>t.map(t=>t.id===e?{...t,text:n.slice(0,a)}:t))},25)},600)},2e3)},800)},1500)},500);return}t(t=>t.map(t=>t.id===e?{...t,text:n.slice(0,a)}:t))},25)},[]),c=(0,b.useCallback)(()=>{clearInterval(i.current),r(`idle`),t([{id:1,role:`user`,text:`Fix the focus ring and run the tests.`}])},[]);return(0,x.jsxs)(`div`,{className:`x1dr59a3 x78zum5 xdt5ytf`,children:[(0,x.jsxs)(`div`,{className:`x78zum5 x167g77z xc7ga6q x4befzd x1a02dak x6s0dn4`,children:[(0,x.jsx)(a,{label:`Run Full Sequence`,variant:`primary`,size:`sm`,onClick:o,isDisabled:n!==`idle`&&n!==`done`}),(0,x.jsx)(a,{label:`Reset`,variant:`ghost`,size:`sm`,onClick:c}),(0,x.jsx)(`div`,{className:`xvc5jky x78zum5 x6s0dn4 x17d4w8g`,children:(0,x.jsx)(s,{variant:n===`streaming`?`green`:n===`tools`?`yellow`:`neutral`,label:n===`idle`?`Ready`:n===`streaming`?`Streaming text...`:n===`tools`?`Adding tool calls...`:`Complete`})})]}),(0,x.jsx)(f,{composer:(0,x.jsx)(g,{onSubmit:()=>{},placeholder:`Watch the transition from streaming → tool calls...`}),children:(0,x.jsx)(h,{children:e.map(e=>(0,x.jsxs)(p,{sender:e.role,children:[e.text&&(0,x.jsx)(m,{density:`compact`,children:e.text}),e.toolCalls&&e.toolCalls.length>0&&(0,x.jsx)(_,{calls:e.toolCalls})]},e.id))})})]})}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
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
}`,...T.parameters?.docs?.source},description:{story:`Demonstrates the auto-scroll issue: streaming text scrolls correctly,
but tool calls and custom elements may not trigger auto-scroll.

Use the control buttons to add different content types and observe
whether the chat auto-scrolls to keep new content visible.`,...T.parameters?.docs?.description}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
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
}`,...E.parameters?.docs?.source},description:{story:`Rapid tool call additions — fires 5 tool calls every 500ms to stress-test
the ResizeObserver + scrollIfLocked pathway.`,...E.parameters?.docs?.description}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
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
}`,...D.parameters?.docs?.source},description:{story:`Mixed content — alternates between streaming text and tool call blocks,
showing the transition points where scroll may break.`,...D.parameters?.docs?.description}}},O=[`ScrollBehaviorComparison`,`RapidToolCalls`,`MixedStreamAndTools`]}))();export{D as MixedStreamAndTools,E as RapidToolCalls,T as ScrollBehaviorComparison,O as __namedExportsOrder,S as default};