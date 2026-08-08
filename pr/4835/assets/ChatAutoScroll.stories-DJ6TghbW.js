import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{t}from"./react-BZJXY1be.js";import{n,t as r}from"./ChatComposer-Dto0vwmR.js";import{n as i,t as a}from"./Text-BfjtEFtP.js";import{t as o}from"./jsx-runtime-DeHZSEgm.js";import{n as s,t as c}from"./Button-BVMvoKVE.js";import{n as l,t as u}from"./Badge-QS1Y3zur.js";import{n as d,t as f}from"./CodeBlock-Bm_rE_Eg.js";import{n as p,t as m}from"./ChatMessageList-DlT3EcUX.js";import{n as h,t as g}from"./ChatMessage-CIX1HzVk.js";import{n as _,t as v}from"./ChatLayout-B0z9_q7Y.js";import{n as y,t as b}from"./ChatToolCalls-B3nkIUf8.js";import{n as x,t as S}from"./Markdown-DFqNxorh.js";var C,w,T,E,D,O,k,A,j;function M(){return(M=e((()=>{_(),p(),h(),y(),n(),x(),s(),i(),d(),l(),C=t(),w=o(),T={title:`Core/ChatAutoScroll`,tags:[`autodocs`],parameters:{layout:`fullscreen`}},E=`Let me analyze this codebase for you. I'll start by looking at the project structure and understanding the architecture.

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

The key question is: **does the ResizeObserver fire reliably for all types of content additions?**`,D=[[{key:`1`,name:`read`,target:`packages/core/src/Chat/useChatStreamScroll.ts`,status:`complete`,duration:`42ms`,node:`astryx`}],[{key:`2`,name:`bash`,target:`yarn test --filter Chat`,status:`complete`,duration:`4.2s`,node:`astryx`}],[{key:`3`,name:`edit`,target:`ChatLayout.tsx`,status:`complete`,duration:`95ms`,node:`astryx`,additions:12,deletions:3,resultDetail:(0,w.jsx)(f,{code:`// Added MutationObserver supplement
const observer = new MutationObserver(() => {
  scrollIfLocked();
});
observer.observe(contentEl, { childList: true, subtree: true });`,language:`typescript`})}],[{key:`4`,name:`bash`,target:`yarn test`,status:`complete`,duration:`8.1s`,node:`astryx`,resultDetail:(0,w.jsx)(f,{code:`$ yarn test
✓ 142 tests passed (18 suites)

Test Suites: 18 passed, 18 total
Tests:       142 passed, 142 total
Time:        8.1s`,language:`bash`})}],[{key:`5`,name:`read`,target:`packages/core/src/Chat/useChatNewMessages.ts`,status:`complete`,duration:`38ms`,node:`astryx`}]],O={name:`Scroll Behavior Comparison`,render:()=>{let[e,t]=(0,C.useState)([{id:1,role:`user`,text:`Can you analyze the auto-scroll system and fix the issue with tool calls?`},{id:2,role:`assistant`,text:"Sure, I'll look into the auto-scroll behavior. Let me start by reading the relevant files.\n\nThe scroll system uses `useChatStreamScroll` for spring-based scroll tracking and `useChatNewMessages` for content observation."},{id:3,role:`user`,text:`Great, show me what you find.`}]),[n,i]=(0,C.useState)(!1),o=(0,C.useRef)(void 0),s=(0,C.useRef)(0),l=(0,C.useCallback)(()=>{let e=Date.now();i(!0),t(t=>[...t,{id:e,role:`assistant`,text:``,isStreaming:!0}]);let n=0;o.current=setInterval(()=>{if(n+=2+Math.floor(Math.random()*4),n>=E.length){clearInterval(o.current),t(t=>t.map(t=>t.id===e?{...t,text:E,isStreaming:!1}:t)),i(!1);return}t(t=>t.map(t=>t.id===e?{...t,text:E.slice(0,n)}:t))},25)},[]),d=(0,C.useCallback)(()=>{let e=D[s.current%D.length];s.current++;let n=Date.now();t(t=>[...t,{id:n,role:`assistant`,text:``,toolCalls:e?.map(e=>({...e,status:`running`,duration:void 0}))}]),setTimeout(()=>{t(t=>t.map(t=>t.id===n?{...t,toolCalls:e}:t))},1200)},[]),p=(0,C.useCallback)(()=>{let e=Date.now(),n=D.flat().map((e,t)=>({...e,key:`batch-${t}`}));t(t=>[...t,{id:e,role:`assistant`,text:`Here are the results from my investigation:`,toolCalls:n}])},[]),h=(0,C.useCallback)(()=>{let e=Date.now();t(t=>[...t,{id:e,role:`assistant`,text:``,customElement:(0,w.jsxs)(`div`,{className:`x1tamke2 x4pepcl x1991y5z x8ot6hp`,children:[(0,w.jsx)(a,{type:`label`,weight:`bold`,children:`Architecture Diagram`}),(0,w.jsx)(`div`,{className:`x78zum5 x6s0dn4 xl56j7k x1m3v4wt xur7f20 xjjgpb2`,children:(0,w.jsx)(a,{type:`body`,color:`secondary`,children:`📊 Embedded visualization (200px tall custom element)`})}),(0,w.jsx)(f,{code:`┌─────────────────────┐
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
└─────────────────────┘`,language:`text`})]})}])},[]),_=(0,C.useCallback)(()=>{clearInterval(o.current),i(!1),s.current=0,t([{id:1,role:`user`,text:`Can you analyze the auto-scroll system and fix the issue with tool calls?`},{id:2,role:`assistant`,text:"Sure, I'll look into the auto-scroll behavior. Let me start by reading the relevant files.\n\nThe scroll system uses `useChatStreamScroll` for spring-based scroll tracking and `useChatNewMessages` for content observation."},{id:3,role:`user`,text:`Great, show me what you find.`}])},[]);return(0,w.jsxs)(`div`,{className:`x1dr59a3 x78zum5 xdt5ytf`,children:[(0,w.jsxs)(`div`,{className:`x78zum5 x167g77z xc7ga6q x4befzd x1a02dak x6s0dn4`,children:[(0,w.jsx)(c,{label:`Stream Text (works ✓)`,variant:`primary`,size:`sm`,onClick:l,isDisabled:n}),(0,w.jsx)(c,{label:`Add Tool Call (may fail ✗)`,variant:`secondary`,size:`sm`,onClick:d}),(0,w.jsx)(c,{label:`Batch Tool Calls (likely fails ✗)`,variant:`secondary`,size:`sm`,onClick:p}),(0,w.jsx)(c,{label:`Add Custom Element (may fail ✗)`,variant:`secondary`,size:`sm`,onClick:h}),(0,w.jsx)(c,{label:`Reset`,variant:`ghost`,size:`sm`,onClick:_}),(0,w.jsx)(`div`,{className:`xvc5jky x78zum5 x6s0dn4 x17d4w8g`,children:(0,w.jsx)(u,{variant:n?`green`:`neutral`,label:n?`Streaming`:`Idle`})})]}),(0,w.jsx)(v,{composer:(0,w.jsx)(r,{onSubmit:()=>{},placeholder:`Observe auto-scroll behavior above...`,isStopShown:n}),children:(0,w.jsx)(m,{children:e.map(e=>(0,w.jsxs)(g,{sender:e.role,children:[e.text&&(0,w.jsx)(S,{density:`compact`,children:e.text}),e.toolCalls&&e.toolCalls.length>0&&(0,w.jsx)(b,{calls:e.toolCalls}),e.customElement]},e.id))})})]})}},k={name:`Rapid Tool Calls`,render:()=>{let[e,t]=(0,C.useState)([{id:1,role:`user`,text:`Run the full test suite across all packages.`}]),[n,i]=(0,C.useState)(!1),a=(0,C.useRef)(void 0),o=(0,C.useRef)(0),s=(0,C.useCallback)(()=>{i(!0),o.current=0,a.current=setInterval(()=>{if(o.current++,o.current>10){clearInterval(a.current),i(!1);return}let e=Date.now()+o.current,n=[`read`,`bash`,`edit`,`ipython`,`show`],r=[`Button.test.tsx`,`yarn test --filter=Button`,`Button.tsx +8 -2`,`analyze_coverage()`,`coverage-report.html`],s=(o.current-1)%n.length;t(t=>[...t,{id:e,role:`assistant`,text:``,toolCalls:[{key:String(e),name:n[s]??`read`,target:r[s],status:`running`,node:`astryx`}]}]),setTimeout(()=>{t(t=>t.map(t=>t.id===e?{...t,toolCalls:[{key:String(e),name:n[s]??`read`,target:r[s],status:`complete`,duration:`${(Math.random()*3+.1).toFixed(1)}s`,node:`astryx`}]}:t))},300)},500)},[]),l=(0,C.useCallback)(()=>{clearInterval(a.current),i(!1)},[]),d=(0,C.useCallback)(()=>{clearInterval(a.current),i(!1),o.current=0,t([{id:1,role:`user`,text:`Run the full test suite across all packages.`}])},[]);return(0,w.jsxs)(`div`,{className:`x1dr59a3 x78zum5 xdt5ytf`,children:[(0,w.jsxs)(`div`,{className:`x78zum5 x167g77z xc7ga6q x4befzd x1a02dak x6s0dn4`,children:[(0,w.jsx)(c,{label:n?`Running...`:`Start Rapid Tool Calls`,variant:`primary`,size:`sm`,onClick:s,isDisabled:n}),(0,w.jsx)(c,{label:`Stop`,variant:`destructive`,size:`sm`,onClick:l,isDisabled:!n}),(0,w.jsx)(c,{label:`Reset`,variant:`ghost`,size:`sm`,onClick:d}),(0,w.jsx)(`div`,{className:`xvc5jky x78zum5 x6s0dn4 x17d4w8g`,children:(0,w.jsx)(u,{variant:n?`yellow`:`neutral`,label:n?`Tool call ${o.current}/10`:`${e.length-1} messages`})})]}),(0,w.jsx)(v,{composer:(0,w.jsx)(r,{onSubmit:()=>{},placeholder:`Watch scroll behavior...`}),children:(0,w.jsx)(m,{children:e.map(e=>(0,w.jsxs)(g,{sender:e.role,children:[e.text&&(0,w.jsx)(S,{density:`compact`,children:e.text}),e.toolCalls&&e.toolCalls.length>0&&(0,w.jsx)(b,{calls:e.toolCalls})]},e.id))})})]})}},A={name:`Mixed Stream + Tools`,render:()=>{let[e,t]=(0,C.useState)([{id:1,role:`user`,text:`Fix the focus ring and run the tests.`}]),[n,i]=(0,C.useState)(`idle`),a=(0,C.useRef)(void 0),o=(0,C.useCallback)(()=>{i(`streaming`);let e=Date.now(),n=`Let me look at the Button component's focus styles and fix the ring.

I can see the issue — the focus ring uses a hardcoded color instead of the theme token. Let me fix that and run the tests.`;t(t=>[...t,{id:e,role:`assistant`,text:``,isStreaming:!0}]);let r=0;a.current=setInterval(()=>{if(r+=3+Math.floor(Math.random()*4),r>=192){clearInterval(a.current),t(t=>t.map(t=>t.id===e?{...t,text:n,isStreaming:!1}:t)),i(`tools`),setTimeout(()=>{let e=Date.now();t(t=>[...t,{id:e,role:`assistant`,text:``,toolCalls:[{key:`1`,name:`edit`,target:`Button.tsx`,status:`running`,node:`astryx`}]}]),setTimeout(()=>{t(t=>t.map(t=>t.id===e?{...t,toolCalls:[{key:`1`,name:`edit`,target:`Button.tsx`,status:`complete`,duration:`92ms`,node:`astryx`,additions:4,deletions:2,resultDetail:(0,w.jsx)(f,{code:`- outline: 2px solid blue;
+ outline: 2px solid var(--color-ring-focus);
+ outline-offset: 2px;`,language:`diff`})}]}:t)),setTimeout(()=>{let e=Date.now();t(t=>[...t,{id:e,role:`assistant`,text:``,toolCalls:[{key:`2`,name:`bash`,target:`yarn test --filter Button`,status:`running`,node:`astryx`}]}]),setTimeout(()=>{t(t=>t.map(t=>t.id===e?{...t,toolCalls:[{key:`2`,name:`bash`,target:`yarn test --filter Button`,status:`complete`,duration:`3.8s`,node:`astryx`,resultDetail:(0,w.jsx)(f,{code:`✓ 24 tests passed

Test Suites: 3 passed, 3 total
Tests:       24 passed, 24 total`,language:`bash`})}]}:t)),setTimeout(()=>{let e=Date.now(),n=`Done! The focus ring now uses the theme token \`var(--color-ring-focus)\` with a 2px offset. All 24 tests pass.

The fix ensures the ring adapts to different themes automatically — no more hardcoded blue.`;t(t=>[...t,{id:e,role:`assistant`,text:``,isStreaming:!0}]);let r=0;a.current=setInterval(()=>{if(r+=3+Math.floor(Math.random()*4),r>=202){clearInterval(a.current),t(t=>t.map(t=>t.id===e?{...t,text:n,isStreaming:!1}:t)),i(`done`);return}t(t=>t.map(t=>t.id===e?{...t,text:n.slice(0,r)}:t))},25)},600)},2e3)},800)},1500)},500);return}t(t=>t.map(t=>t.id===e?{...t,text:n.slice(0,r)}:t))},25)},[]),s=(0,C.useCallback)(()=>{clearInterval(a.current),i(`idle`),t([{id:1,role:`user`,text:`Fix the focus ring and run the tests.`}])},[]);return(0,w.jsxs)(`div`,{className:`x1dr59a3 x78zum5 xdt5ytf`,children:[(0,w.jsxs)(`div`,{className:`x78zum5 x167g77z xc7ga6q x4befzd x1a02dak x6s0dn4`,children:[(0,w.jsx)(c,{label:`Run Full Sequence`,variant:`primary`,size:`sm`,onClick:o,isDisabled:n!==`idle`&&n!==`done`}),(0,w.jsx)(c,{label:`Reset`,variant:`ghost`,size:`sm`,onClick:s}),(0,w.jsx)(`div`,{className:`xvc5jky x78zum5 x6s0dn4 x17d4w8g`,children:(0,w.jsx)(u,{variant:n===`streaming`?`green`:n===`tools`?`yellow`:`neutral`,label:n===`idle`?`Ready`:n===`streaming`?`Streaming text...`:n===`tools`?`Adding tool calls...`:`Complete`})})]}),(0,w.jsx)(v,{composer:(0,w.jsx)(r,{onSubmit:()=>{},placeholder:`Watch the transition from streaming → tool calls...`}),children:(0,w.jsx)(m,{children:e.map(e=>(0,w.jsxs)(g,{sender:e.role,children:[e.text&&(0,w.jsx)(S,{density:`compact`,children:e.text}),e.toolCalls&&e.toolCalls.length>0&&(0,w.jsx)(b,{calls:e.toolCalls})]},e.id))})})]})}},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
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
}`,...O.parameters?.docs?.source},description:{story:`Demonstrates the auto-scroll issue: streaming text scrolls correctly,
but tool calls and custom elements may not trigger auto-scroll.

Use the control buttons to add different content types and observe
whether the chat auto-scrolls to keep new content visible.`,...O.parameters?.docs?.description}}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
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
}`,...k.parameters?.docs?.source},description:{story:`Rapid tool call additions — fires 5 tool calls every 500ms to stress-test
the ResizeObserver + scrollIfLocked pathway.`,...k.parameters?.docs?.description}}},A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
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
}`,...A.parameters?.docs?.source},description:{story:`Mixed content — alternates between streaming text and tool call blocks,
showing the transition points where scroll may break.`,...A.parameters?.docs?.description}}},j=[`ScrollBehaviorComparison`,`RapidToolCalls`,`MixedStreamAndTools`]})))()}M();export{A as MixedStreamAndTools,k as RapidToolCalls,O as ScrollBehaviorComparison,j as __namedExportsOrder,T as default};