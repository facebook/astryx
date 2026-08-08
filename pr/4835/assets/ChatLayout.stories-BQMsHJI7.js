import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{t}from"./react-BZJXY1be.js";import{a as n,n as r,o as i,t as a}from"./ChatComposer-Dto0vwmR.js";import{t as o}from"./jsx-runtime-DeHZSEgm.js";import{n as s,t as c}from"./useTooltip-Cm0gpSWG.js";import{n as l,t as u}from"./Button-BVMvoKVE.js";import{n as d,t as f}from"./CodeBlock-Bm_rE_Eg.js";import{n as p,t as m}from"./ChatComposerDrawer-iOQ_tx6C.js";import{n as h,t as g}from"./ChatTokenizedText-DXBhpWZ0.js";import{n as _,t as v}from"./ChatMessageList-DlT3EcUX.js";import{n as y,t as b}from"./ChatMessage-CIX1HzVk.js";import{n as x,t as S}from"./ChatMessageBubble-Crrsl6XG.js";import{a as C,c as w,i as T,n as ee,o as E,r as D,s as O,t as te}from"./HandThumbUpIcon-CCGAstwo.js";import{n as k,t as A}from"./ChatLayout-B0z9_q7Y.js";import{n as ne,t as j}from"./ChatToolCalls-B3nkIUf8.js";import{n as re,t as M}from"./EmptyState-BhVkQYUa.js";import{n as N,t as P}from"./Markdown-DFqNxorh.js";import{n as F,t as I}from"./Token-Y_2gT4Oy.js";import{t as L}from"./createStaticSource-Cfz9LMai.js";import{n as R,t as ie}from"./ProgressBar-piumk1uG.js";import{n as ae,t as z}from"./Timestamp-nHMSTS1A.js";import{n as oe,t as se}from"./ClipboardDocumentIcon-CYJylhoT.js";var B,V,H,U,W,G,K,q,J,Y,X,Z,Q;function $(){return($=e((()=>{k(),_(),y(),x(),w(),E(),r(),p(),i(),h(),ne(),N(),F(),l(),ae(),ee(),T(),oe(),d(),R(),c(),re(),B=t(),V=o(),H={title:`Core/ChatLayout`,component:A,tags:[`autodocs`],parameters:{layout:`fullscreen`}},U=(0,V.jsx)(`svg`,{width:`1em`,height:`1em`,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:`1.5`,strokeLinecap:`round`,strokeLinejoin:`round`,children:(0,V.jsx)(`path`,{d:`m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48`})}),W=(0,V.jsxs)(`svg`,{width:`1em`,height:`1em`,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:`1.5`,strokeLinecap:`round`,strokeLinejoin:`round`,children:[(0,V.jsx)(`circle`,{cx:`12`,cy:`12`,r:`4`}),(0,V.jsx)(`path`,{d:`M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8`})]}),G=(0,V.jsxs)(`svg`,{width:`1em`,height:`1em`,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:`1.5`,strokeLinecap:`round`,strokeLinejoin:`round`,children:[(0,V.jsx)(`path`,{d:`M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z`}),(0,V.jsx)(`path`,{d:`M19 10v2a7 7 0 0 1-14 0v-2`}),(0,V.jsx)(`line`,{x1:`12`,x2:`12`,y1:`19`,y2:`22`})]}),K=[{id:`cindy`,label:`Cindy Zhang`},{id:`alex`,label:`Alex Rivera`},{id:`sam`,label:`Sam Chen`},{id:`navi`,label:`Navi`}],q=[{id:`summarize`,label:`summarize`},{id:`search`,label:`search`},{id:`explain`,label:`explain`}],J=[{id:1,role:`system`,text:`Today`},{id:2,role:`user`,text:`Can you review the Button component and fix the focus ring?`,sentAt:new Date(`2026-03-15T14:30:00`)},{id:3,role:`assistant`,introText:`I'll read the Button component and check the focus styles.`,text:`I'll read the Button component and check the focus styles.

Added a \`:focus-visible\` style with a 2px solid outline and 2px offset. All 24 Button tests pass.

\`\`\`css
:focus-visible {
  outline: 2px solid var(--color-ring-focus);
  outline-offset: 2px;
}
\`\`\`

Here's the test breakdown:

| Suite | Tests | Duration | Status |
|-------|-------|----------|--------|
| Button.test.tsx | 18 | 1.2s | ✓ Pass |
| Button.a11y.test.tsx | 4 | 0.8s | ✓ Pass |
| Button.snapshot.test.tsx | 2 | 0.3s | ✓ Pass |

The focus ring meets **WCAG 2.4.7** requirements and uses the theme's focus color token.`,toolCalls:[{key:`1`,name:`read`,target:`Button.tsx`,status:`complete`,duration:`45ms`,node:`astryx`},{key:`2`,name:`edit`,target:`Button.tsx`,status:`complete`,duration:`120ms`,node:`astryx`,additions:8,deletions:2,resultDetail:(0,V.jsx)(f,{code:`:focus-visible {
  outline: 2px solid var(--color-ring-focus);
  outline-offset: 2px;
}`,language:`css`})},{key:`3`,name:`bash`,target:`yarn test`,status:`complete`,duration:`6.1s`,node:`astryx`,resultDetail:(0,V.jsx)(f,{code:`$ yarn test
✓ 24 tests passed (3 suites)`,language:`bash`})}]},{id:4,role:`user`,text:`Nice, can you also check the Card component?`,sentAt:new Date(`2026-03-15T14:35:00`)}],Y={name:`Full AI Chat`,render:()=>{let[e,t]=(0,B.useState)(J),[r,i]=(0,B.useState)([]),[o,c]=(0,B.useState)(!1),l=(0,B.useRef)(void 0),d=(0,B.useRef)(null),f=s({placement:`above`}),p=K.map(e=>({value:`@${e.id}`,label:`@${e.label}`,variant:`blue`})),h=[{character:`@`,searchSource:L(K),onSelect:e=>({value:`@${e.id}`,label:`@${e.label}`,variant:`blue`})},{character:`/`,searchSource:L(q),onSelect:e=>`/${e.label} `}],_=(0,B.useCallback)((e,n,r)=>{let i=Date.now();c(!0),t(t=>[...t,{id:i,role:`assistant`,text:``,introText:e,isStreaming:!0}]);let a=0;l.current=setInterval(()=>{if(a+=2+Math.floor(Math.random()*4),a>=e.length){clearInterval(l.current),t(t=>t.map(t=>t.id===i?{...t,text:e}:t)),r?setTimeout(()=>{t(e=>e.map(e=>e.id===i&&e.role===`assistant`?{...e,toolCalls:r.map(e=>({...e,status:`running`,duration:void 0}))}:e)),setTimeout(()=>{t(e=>e.map(e=>e.id===i&&e.role===`assistant`?{...e,toolCalls:r}:e)),setTimeout(()=>{let r=0,a=e+`

`+n;l.current=setInterval(()=>{r+=3+Math.floor(Math.random()*5);let n=e.length+2+r;if(n>=a.length){clearInterval(l.current),t(e=>e.map(e=>e.id===i?{...e,text:a,isStreaming:!1}:e)),c(!1);return}t(e=>e.map(e=>e.id===i?{...e,text:a.slice(0,n)}:e))},30)},300)},1800)},400):(t(e=>e.map(e=>e.id===i?{...e,isStreaming:!1}:e)),c(!1));return}t(t=>t.map(t=>t.id===i?{...t,text:e.slice(0,a)}:t))},30)},[]),y=e=>K.filter(t=>e.includes(`@${t.id}`)).map(e=>({value:`@${e.id}`,label:`@${e.label}`,variant:`blue`})),x=(0,B.useCallback)(e=>{let n=Date.now();t(t=>[...t,{id:n,role:`user`,text:e,files:r.length?[...r]:void 0,tokens:y(e),isSending:!0}]),i([]),setTimeout(()=>{t(e=>e.map(e=>e.id===n&&e.role===`user`?{...e,isSending:!1,sentAt:new Date}:e)),_(`I'll check the Card component for the same issue.`,`The border radius was hardcoded. I replaced it with the theme token:

\`\`\`css
/* before */
border-radius: 12px;

/* after */
border-radius: var(--radius-element);
\`\`\`

Cards now adapt across themes. All tests pass.`,[{key:`r1`,name:`read`,target:`Card.tsx`,status:`complete`,duration:`35ms`,node:`astryx`},{key:`e1`,name:`edit`,target:`Card.tsx`,status:`complete`,duration:`90ms`,node:`astryx`,additions:1,deletions:1},{key:`t1`,name:`bash`,target:`yarn test --filter Card`,status:`complete`,duration:`3.2s`,node:`astryx`}])},2e3)},[r,_]),w=(0,B.useCallback)(()=>{clearInterval(l.current),c(!1),t(e=>e.map(e=>e.role===`assistant`&&e.isStreaming?{...e,isStreaming:!1}:e))},[]),T=(0,V.jsx)(a,{onSubmit:x,onStop:w,isStopShown:o,drawer:r.length>0?(0,V.jsx)(m,{children:r.map(e=>(0,V.jsx)(I,{label:e,onRemove:()=>i(t=>t.filter(t=>t!==e))},e))}):void 0,headerActions:(0,V.jsxs)(V.Fragment,{children:[(0,V.jsx)(u,{label:`Mention`,variant:`ghost`,size:`sm`,icon:W,isIconOnly:!0,onClick:()=>{d.current?.focus(),d.current?.insertText(`@`)}}),(0,V.jsx)(u,{label:`Attach`,variant:`ghost`,size:`sm`,icon:U,isIconOnly:!0,onClick:()=>i(e=>[...e,`file-${e.length+1}.tsx`])})]}),headerContext:(0,V.jsxs)(V.Fragment,{children:[(0,V.jsx)(ie,{ref:f.ref,"aria-describedby":f.describedBy,label:`Context`,value:12,variant:`neutral`,isLabelHidden:!0,style:{marginInlineEnd:8}}),f.renderTooltip(`3k / 100k tokens used`)]}),input:(0,V.jsx)(n,{handleRef:d,triggers:h,placeholder:`Ask about the codebase...`}),footerActions:(0,V.jsx)(u,{label:`Claude Opus`,variant:`ghost`,size:`md`}),sendActions:(0,V.jsx)(u,{label:`Microphone`,variant:`ghost`,size:`md`,icon:G,isIconOnly:!0})});return(0,V.jsx)(`div`,{style:{height:`100vh`,display:`flex`,flexDirection:`column`},children:(0,V.jsx)(A,{composer:T,children:(0,V.jsx)(v,{children:e.map(e=>{if(e.role===`system`)return(0,V.jsx)(C,{variant:`divider`,children:e.text},e.id);if(e.role===`user`)return(0,V.jsxs)(b,{sender:`user`,children:[e.files&&(0,V.jsx)(m,{children:e.files.map(e=>(0,V.jsx)(I,{label:e},e))}),(0,V.jsx)(S,{metadata:(0,V.jsx)(O,{timestamp:(0,V.jsx)(z,{value:e.sentAt?.toISOString()??new Date(e.id).toISOString(),format:`time`}),status:e.isSending?`sending`:void 0}),children:(0,V.jsx)(g,{tokens:p,children:e.text})})]},e.id);let t=e.introText?.length??0,n=e.toolCalls&&e.toolCalls.length>0,r=t>0?e.text.slice(0,t):null,i=t>0&&e.text.length>t?e.text.slice(t).replace(/^\n+/,``):t?null:e.text;return(0,V.jsxs)(b,{sender:`assistant`,children:[r&&(0,V.jsx)(P,{density:`compact`,children:r}),n&&(0,V.jsx)(j,{calls:e.toolCalls??[]}),i&&(0,V.jsx)(P,{density:`compact`,children:i}),!e.isStreaming&&e.text&&(0,V.jsx)(O,{timestamp:(0,V.jsx)(z,{value:new Date(e.id).toISOString(),format:`time`}),footer:(0,V.jsxs)(V.Fragment,{children:[(0,V.jsx)(`span`,{children:`Claude Opus 4.6`}),(0,V.jsx)(`span`,{children:`·`}),(0,V.jsx)(u,{label:`Thumbs up`,icon:(0,V.jsx)(te,{style:{width:14,height:14}}),variant:`ghost`,size:`sm`,isIconOnly:!0}),(0,V.jsx)(u,{label:`Thumbs down`,icon:(0,V.jsx)(D,{style:{width:14,height:14}}),variant:`ghost`,size:`sm`,isIconOnly:!0}),(0,V.jsx)(u,{label:`Copy`,icon:(0,V.jsx)(se,{style:{width:14,height:14}}),variant:`ghost`,size:`sm`,isIconOnly:!0})]})})]},e.id)})})})})}},X={name:`Panel View`,render:()=>{let[e,t]=(0,B.useState)(J),[r,i]=(0,B.useState)([]),[o,s]=(0,B.useState)(!1),c=(0,B.useRef)(void 0),l=(0,B.useRef)(null),d=K.map(e=>({value:`@${e.id}`,label:`@${e.label}`,variant:`blue`})),f=[{character:`@`,searchSource:L(K),onSelect:e=>({value:`@${e.id}`,label:`@${e.label}`,variant:`blue`})},{character:`/`,searchSource:L(q),onSelect:e=>`/${e.label} `}],p=(0,B.useCallback)((e,n)=>{let r=Date.now();s(!0),t(e=>[...e,{id:r,role:`assistant`,text:``,isStreaming:!0}]);let i=0,a=e+`

`+n;c.current=setInterval(()=>{if(i+=3+Math.floor(Math.random()*5),i>=a.length){clearInterval(c.current),t(e=>e.map(e=>e.id===r?{...e,text:a,isStreaming:!1}:e)),s(!1);return}t(e=>e.map(e=>e.id===r?{...e,text:a.slice(0,i)}:e))},30)},[]),h=(0,B.useCallback)(e=>{t(t=>[...t,{id:Date.now(),role:`user`,text:e,files:r.length?[...r]:void 0}]),i([]),setTimeout(()=>{p(`Checking the component now.`,`Found the issue — the border radius was hardcoded. Replaced with the theme token.`)},800)},[r,p]),_=(0,B.useCallback)(()=>{clearInterval(c.current),s(!1),t(e=>e.map(e=>e.role===`assistant`&&e.isStreaming?{...e,isStreaming:!1}:e))},[]),y=(0,V.jsx)(a,{onSubmit:h,onStop:_,isStopShown:o,drawer:r.length>0?(0,V.jsx)(m,{children:r.map(e=>(0,V.jsx)(I,{label:e,onRemove:()=>i(t=>t.filter(t=>t!==e))},e))}):void 0,headerActions:(0,V.jsxs)(V.Fragment,{children:[(0,V.jsx)(u,{label:`Mention`,variant:`ghost`,size:`sm`,icon:W,isIconOnly:!0,onClick:()=>{l.current?.focus(),l.current?.insertText(`@`)}}),(0,V.jsx)(u,{label:`Attach`,variant:`ghost`,size:`sm`,icon:U,isIconOnly:!0,onClick:()=>i(e=>[...e,`file-${e.length+1}.tsx`])})]}),input:(0,V.jsx)(n,{handleRef:l,triggers:f,placeholder:`Ask something...`})});return(0,V.jsx)(`div`,{style:{width:400,height:600,border:`1px solid #ccc`,borderRadius:8,overflow:`hidden`},children:(0,V.jsx)(A,{composer:y,children:(0,V.jsx)(v,{children:e.map(e=>e.role===`system`?(0,V.jsx)(C,{variant:`divider`,children:e.text},e.id):e.role===`user`?(0,V.jsxs)(b,{sender:`user`,children:[e.files&&(0,V.jsx)(m,{children:e.files.map(e=>(0,V.jsx)(I,{label:e},e))}),(0,V.jsx)(S,{children:(0,V.jsx)(g,{tokens:d,children:e.text})})]},e.id):(0,V.jsxs)(b,{sender:`assistant`,children:[e.text&&(0,V.jsx)(P,{density:`compact`,children:e.text}),e.toolCalls&&e.toolCalls.length>0&&(0,V.jsx)(j,{calls:e.toolCalls??[]})]},e.id))})})})}},Z={name:`Empty State`,render:()=>(0,V.jsx)(`div`,{style:{height:`100vh`,display:`flex`,flexDirection:`column`},children:(0,V.jsx)(A,{composer:(0,V.jsx)(a,{onSubmit:()=>{},placeholder:`Start a conversation…`}),emptyState:(0,V.jsx)(M,{title:`No messages yet`,description:`Start a conversation by typing below.`}),children:[]})})},Y.parameters={...Y.parameters,docs:{...Y.parameters?.docs,source:{originalSource:`{
  name: 'Full AI Chat',
  render: () => {
    const [messages, setMessages] = useState<Message[]>(SEED_MESSAGES);
    const [files, setFiles] = useState<string[]>([]);
    const [isStreaming, setIsStreaming] = useState(false);
    const streamRef = useRef<ReturnType<typeof setInterval>>(undefined);
    const inputRef = useRef<ChatComposerInputHandle>(null);
    const contextTooltip = useTooltip({
      placement: 'above'
    });
    const mentionTokens = CONTACTS.map(c => ({
      value: \`@\${c.id}\`,
      label: \`@\${c.label}\`,
      variant: 'blue' as const
    }));
    const triggers: ChatComposerTrigger[] = [{
      character: '@',
      searchSource: createStaticSource(CONTACTS),
      onSelect: item => ({
        value: \`@\${item.id}\`,
        label: \`@\${item.label}\`,
        variant: 'blue' as const
      })
    }, {
      character: '/',
      searchSource: createStaticSource(COMMANDS),
      onSelect: item => \`/\${item.label} \`
    }];
    const streamResponse = useCallback((introText: string, resultText: string, toolCalls?: ChatToolCallItem[]) => {
      const msgId = Date.now();
      setIsStreaming(true);
      setMessages(prev => [...prev, {
        id: msgId,
        role: 'assistant',
        text: '',
        introText,
        isStreaming: true
      }]);
      let i = 0;
      streamRef.current = setInterval(() => {
        i += 2 + Math.floor(Math.random() * 4);
        if (i >= introText.length) {
          clearInterval(streamRef.current);
          setMessages(prev => prev.map(m => m.id === msgId ? {
            ...m,
            text: introText
          } : m));
          if (toolCalls) {
            setTimeout(() => {
              setMessages(prev => prev.map(m => m.id === msgId && m.role === 'assistant' ? {
                ...m,
                toolCalls: toolCalls.map(tc => ({
                  ...tc,
                  status: 'running' as const,
                  duration: undefined
                }))
              } : m));
              setTimeout(() => {
                setMessages(prev => prev.map(m => m.id === msgId && m.role === 'assistant' ? {
                  ...m,
                  toolCalls
                } : m));
                setTimeout(() => {
                  let j = 0;
                  const fullText = introText + '\\n\\n' + resultText;
                  streamRef.current = setInterval(() => {
                    j += 3 + Math.floor(Math.random() * 5);
                    const end = introText.length + 2 + j;
                    if (end >= fullText.length) {
                      clearInterval(streamRef.current);
                      setMessages(prev => prev.map(m => m.id === msgId ? {
                        ...m,
                        text: fullText,
                        isStreaming: false
                      } : m));
                      setIsStreaming(false);
                      return;
                    }
                    setMessages(prev => prev.map(m => m.id === msgId ? {
                      ...m,
                      text: fullText.slice(0, end)
                    } : m));
                  }, 30);
                }, 300);
              }, 1800);
            }, 400);
          } else {
            setMessages(prev => prev.map(m => m.id === msgId ? {
              ...m,
              isStreaming: false
            } : m));
            setIsStreaming(false);
          }
          return;
        }
        setMessages(prev => prev.map(m => m.id === msgId ? {
          ...m,
          text: introText.slice(0, i)
        } : m));
      }, 30);
    }, []);

    // Simulate backend token resolution — extract @mentions from text
    const resolveTokens = (text: string): ChatComposerToken[] => CONTACTS.filter(c => text.includes(\`@\${c.id}\`)).map(c => ({
      value: \`@\${c.id}\`,
      label: \`@\${c.label}\`,
      variant: 'blue' as const
    }));
    const handleSubmit = useCallback((value: string) => {
      const userMsgId = Date.now();
      setMessages(prev => [...prev, {
        id: userMsgId,
        role: 'user',
        text: value,
        files: files.length ? [...files] : undefined,
        tokens: resolveTokens(value),
        isSending: true
      }]);
      setFiles([]);

      // After 2s, mark as sent and start streaming
      setTimeout(() => {
        setMessages(prev => prev.map(m => m.id === userMsgId && m.role === 'user' ? {
          ...m,
          isSending: false,
          sentAt: new Date()
        } : m));
        streamResponse("I'll check the Card component for the same issue.", 'The border radius was hardcoded. I replaced it with the theme token:\\n\\n\`\`\`css\\n/* before */\\nborder-radius: 12px;\\n\\n/* after */\\nborder-radius: var(--radius-element);\\n\`\`\`\\n\\nCards now adapt across themes. All tests pass.', [{
          key: 'r1',
          name: 'read',
          target: 'Card.tsx',
          status: 'complete',
          duration: '35ms',
          node: 'astryx'
        }, {
          key: 'e1',
          name: 'edit',
          target: 'Card.tsx',
          status: 'complete',
          duration: '90ms',
          node: 'astryx',
          additions: 1,
          deletions: 1
        }, {
          key: 't1',
          name: 'bash',
          target: 'yarn test --filter Card',
          status: 'complete',
          duration: '3.2s',
          node: 'astryx'
        }]);
      }, 2000);
    }, [files, streamResponse]);
    const handleStop = useCallback(() => {
      clearInterval(streamRef.current);
      setIsStreaming(false);
      setMessages(prev => prev.map(m => m.role === 'assistant' && m.isStreaming ? {
        ...m,
        isStreaming: false
      } : m));
    }, []);
    const composerEl = <ChatComposer onSubmit={handleSubmit} onStop={handleStop} isStopShown={isStreaming} drawer={files.length > 0 ? <ChatComposerDrawer>
              {files.map(f => <Token key={f} label={f} onRemove={() => setFiles(prev => prev.filter(x => x !== f))} />)}
            </ChatComposerDrawer> : undefined} headerActions={<>
            <Button label="Mention" variant="ghost" size="sm" icon={AtSignIcon} isIconOnly onClick={() => {
        inputRef.current?.focus();
        inputRef.current?.insertText('@');
      }} />
            <Button label="Attach" variant="ghost" size="sm" icon={PaperclipIcon} isIconOnly onClick={() => setFiles(prev => [...prev, \`file-\${prev.length + 1}.tsx\`])} />
          </>} headerContext={<>
            <ProgressBar ref={contextTooltip.ref} aria-describedby={contextTooltip.describedBy} label="Context" value={12} variant="neutral" isLabelHidden style={{
        marginInlineEnd: 8
      }} />
            {contextTooltip.renderTooltip('3k / 100k tokens used')}
          </>} input={<ChatComposerInput handleRef={inputRef} triggers={triggers} placeholder="Ask about the codebase..." />} footerActions={<Button label="Claude Opus" variant="ghost" size="md" />} sendActions={<Button label="Microphone" variant="ghost" size="md" icon={MicIcon} isIconOnly />} />;
    return <div style={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column'
    }}>
        <ChatLayout composer={composerEl}>
          <ChatMessageList>
            {messages.map(msg => {
            if (msg.role === 'system') {
              return <ChatSystemMessage key={msg.id} variant="divider">
                    {msg.text}
                  </ChatSystemMessage>;
            }
            if (msg.role === 'user') {
              return <ChatMessage key={msg.id} sender="user">
                    {msg.files && <ChatComposerDrawer>
                        {msg.files.map(f => <Token key={f} label={f} />)}
                      </ChatComposerDrawer>}
                    <ChatMessageBubble metadata={<ChatMessageMetadata timestamp={<Timestamp value={msg.sentAt?.toISOString() ?? new Date(msg.id).toISOString()} format="time" />} status={msg.isSending ? 'sending' : undefined} />}>
                      <ChatTokenizedText tokens={mentionTokens}>
                        {msg.text}
                      </ChatTokenizedText>
                    </ChatMessageBubble>
                  </ChatMessage>;
            }
            {
              /* Assistant: intro text → tool calls → rest of text */
            }
            const introEnd = msg.introText?.length ?? 0;
            const hasToolCalls = msg.toolCalls && msg.toolCalls.length > 0;
            const introContent = introEnd > 0 ? msg.text.slice(0, introEnd) : null;
            const restContent = introEnd > 0 && msg.text.length > introEnd ? msg.text.slice(introEnd).replace(/^\\n+/, '') : !introEnd ? msg.text : null;
            return <ChatMessage key={msg.id} sender="assistant">
                  {introContent && <Markdown density="compact">{introContent}</Markdown>}
                  {hasToolCalls && <ChatToolCalls calls={msg.toolCalls ?? []} />}
                  {restContent && <Markdown density="compact">{restContent}</Markdown>}
                  {!msg.isStreaming && msg.text && <ChatMessageMetadata timestamp={<Timestamp value={new Date(msg.id).toISOString()} format="time" />} footer={<>
                          <span>Claude Opus 4.6</span>
                          <span>·</span>
                          <Button label="Thumbs up" icon={<HandThumbUpIcon style={{
                  width: 14,
                  height: 14
                }} />} variant="ghost" size="sm" isIconOnly />
                          <Button label="Thumbs down" icon={<HandThumbDownIcon style={{
                  width: 14,
                  height: 14
                }} />} variant="ghost" size="sm" isIconOnly />
                          <Button label="Copy" icon={<ClipboardDocumentIcon style={{
                  width: 14,
                  height: 14
                }} />} variant="ghost" size="sm" isIconOnly />
                        </>} />}
                </ChatMessage>;
          })}
          </ChatMessageList>
        </ChatLayout>
      </div>;
  }
}`,...Y.parameters?.docs?.source},description:{story:`Full AI chat with streaming, tool calls, triggers, attachments, and frosted glass composer dock`,...Y.parameters?.docs?.description}}},X.parameters={...X.parameters,docs:{...X.parameters?.docs,source:{originalSource:`{
  name: 'Panel View',
  render: () => {
    const [messages, setMessages] = useState<Message[]>(SEED_MESSAGES);
    const [files, setFiles] = useState<string[]>([]);
    const [isStreaming, setIsStreaming] = useState(false);
    const streamRef = useRef<ReturnType<typeof setInterval>>(undefined);
    const inputRef = useRef<ChatComposerInputHandle>(null);
    const mentionTokens = CONTACTS.map(c => ({
      value: \`@\${c.id}\`,
      label: \`@\${c.label}\`,
      variant: 'blue' as const
    }));
    const triggers: ChatComposerTrigger[] = [{
      character: '@',
      searchSource: createStaticSource(CONTACTS),
      onSelect: item => ({
        value: \`@\${item.id}\`,
        label: \`@\${item.label}\`,
        variant: 'blue' as const
      })
    }, {
      character: '/',
      searchSource: createStaticSource(COMMANDS),
      onSelect: item => \`/\${item.label} \`
    }];
    const streamResponse = useCallback((introText: string, resultText: string) => {
      const msgId = Date.now();
      setIsStreaming(true);
      setMessages(prev => [...prev, {
        id: msgId,
        role: 'assistant',
        text: '',
        isStreaming: true
      }]);
      let i = 0;
      const fullText = introText + '\\n\\n' + resultText;
      streamRef.current = setInterval(() => {
        i += 3 + Math.floor(Math.random() * 5);
        if (i >= fullText.length) {
          clearInterval(streamRef.current);
          setMessages(prev => prev.map(m => m.id === msgId ? {
            ...m,
            text: fullText,
            isStreaming: false
          } : m));
          setIsStreaming(false);
          return;
        }
        setMessages(prev => prev.map(m => m.id === msgId ? {
          ...m,
          text: fullText.slice(0, i)
        } : m));
      }, 30);
    }, []);
    const handleSubmit = useCallback((value: string) => {
      setMessages(prev => [...prev, {
        id: Date.now(),
        role: 'user',
        text: value,
        files: files.length ? [...files] : undefined
      }]);
      setFiles([]);
      setTimeout(() => {
        streamResponse('Checking the component now.', 'Found the issue — the border radius was hardcoded. Replaced with the theme token.');
      }, 800);
    }, [files, streamResponse]);
    const handleStop = useCallback(() => {
      clearInterval(streamRef.current);
      setIsStreaming(false);
      setMessages(prev => prev.map(m => m.role === 'assistant' && m.isStreaming ? {
        ...m,
        isStreaming: false
      } : m));
    }, []);
    const composerEl = <ChatComposer onSubmit={handleSubmit} onStop={handleStop} isStopShown={isStreaming} drawer={files.length > 0 ? <ChatComposerDrawer>
              {files.map(f => <Token key={f} label={f} onRemove={() => setFiles(prev => prev.filter(x => x !== f))} />)}
            </ChatComposerDrawer> : undefined} headerActions={<>
            <Button label="Mention" variant="ghost" size="sm" icon={AtSignIcon} isIconOnly onClick={() => {
        inputRef.current?.focus();
        inputRef.current?.insertText('@');
      }} />
            <Button label="Attach" variant="ghost" size="sm" icon={PaperclipIcon} isIconOnly onClick={() => setFiles(prev => [...prev, \`file-\${prev.length + 1}.tsx\`])} />
          </>} input={<ChatComposerInput handleRef={inputRef} triggers={triggers} placeholder="Ask something..." />} />;
    return <div style={{
      width: 400,
      height: 600,
      border: '1px solid #ccc',
      borderRadius: 8,
      overflow: 'hidden'
    }}>
        <ChatLayout composer={composerEl}>
          <ChatMessageList>
            {messages.map(msg => {
            if (msg.role === 'system') {
              return <ChatSystemMessage key={msg.id} variant="divider">
                    {msg.text}
                  </ChatSystemMessage>;
            }
            if (msg.role === 'user') {
              return <ChatMessage key={msg.id} sender="user">
                    {msg.files && <ChatComposerDrawer>
                        {msg.files.map(f => <Token key={f} label={f} />)}
                      </ChatComposerDrawer>}
                    <ChatMessageBubble>
                      <ChatTokenizedText tokens={mentionTokens}>
                        {msg.text}
                      </ChatTokenizedText>
                    </ChatMessageBubble>
                  </ChatMessage>;
            }
            return <ChatMessage key={msg.id} sender="assistant">
                  {msg.text && <Markdown density="compact">{msg.text}</Markdown>}
                  {msg.toolCalls && msg.toolCalls.length > 0 && <ChatToolCalls calls={msg.toolCalls ?? []} />}
                </ChatMessage>;
          })}
          </ChatMessageList>
        </ChatLayout>
      </div>;
  }
}`,...X.parameters?.docs?.source},description:{story:`Panel view — same full features in a narrow sidebar container`,...X.parameters?.docs?.description}}},Z.parameters={...Z.parameters,docs:{...Z.parameters?.docs,source:{originalSource:`{
  name: 'Empty State',
  render: () => <div style={{
    height: '100vh',
    display: 'flex',
    flexDirection: 'column'
  }}>
      <ChatLayout composer={<ChatComposer onSubmit={() => {}} placeholder="Start a conversation…" />} emptyState={<EmptyState title="No messages yet" description="Start a conversation by typing below." />}>
        {[]}
      </ChatLayout>
    </div>
}`,...Z.parameters?.docs?.source},description:{story:`Empty state using EmptyState`,...Z.parameters?.docs?.description}}},Q=[`FullAIChat`,`PanelView`,`WithEmptyState`]})))()}$();export{Y as FullAIChat,X as PanelView,Z as WithEmptyState,Q as __namedExportsOrder,H as default};