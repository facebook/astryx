import{i as e,s as t}from"./preload-helper-CT_b8DTk.js";import{t as n}from"./react-B7Te67-h.js";import{t as r}from"./jsx-runtime-DqZldVDK.js";import{n as i}from"./useTooltip-yc2D-N9u.js";import{t as a}from"./Button-BPD_GmpK.js";import{t as o}from"./Button-CIR94wUk.js";import{t as s}from"./Tooltip-fmzsZ8AL.js";import{n as c,t as l}from"./CodeBlock-JBnUnIX3.js";import{n as u,t as d}from"./EmptyState-D8u4zVkw.js";import{n as f,t as p}from"./Token-M4ExxfLV.js";import{i as m,t as h}from"./Typeahead-D10eZiaJ.js";import{Ci as g,D as _,Di as v,E as y,F as b,I as x,Rr as ee,_i as S,ai as C,di as w,ei as T,hi as E,li as D,pi as O,si as k,xi as A,yi as j,zr as M}from"./iframe-D02JPsSO.js";import{Qt as N,ft as P,mt as F,t as I}from"./esm-BNuSW8ar.js";var L,R,z,B,V,H,U,W,G,K,q,J,Y,X,Z,Q,$;e((()=>{T(),ee(),p(),o(),y(),I(),l(),b(),s(),h(),d(),L=t(n()),R=r(),z={title:`Core/ChatLayout`,component:C,tags:[`autodocs`],parameters:{layout:`fullscreen`}},B=(0,R.jsx)(`svg`,{width:`1em`,height:`1em`,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:`1.5`,strokeLinecap:`round`,strokeLinejoin:`round`,children:(0,R.jsx)(`path`,{d:`m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48`})}),V=(0,R.jsxs)(`svg`,{width:`1em`,height:`1em`,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:`1.5`,strokeLinecap:`round`,strokeLinejoin:`round`,children:[(0,R.jsx)(`circle`,{cx:`12`,cy:`12`,r:`4`}),(0,R.jsx)(`path`,{d:`M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8`})]}),H=(0,R.jsxs)(`svg`,{width:`1em`,height:`1em`,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:`1.5`,strokeLinecap:`round`,strokeLinejoin:`round`,children:[(0,R.jsx)(`path`,{d:`M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z`}),(0,R.jsx)(`path`,{d:`M19 10v2a7 7 0 0 1-14 0v-2`}),(0,R.jsx)(`line`,{x1:`12`,x2:`12`,y1:`19`,y2:`22`})]}),U=[{id:`cindy`,label:`Cindy Zhang`},{id:`alex`,label:`Alex Rivera`},{id:`sam`,label:`Sam Chen`},{id:`navi`,label:`Navi`}],W=[{id:`summarize`,label:`summarize`},{id:`search`,label:`search`},{id:`explain`,label:`explain`}],G=[{id:1,role:`system`,text:`Today`},{id:2,role:`user`,text:`Can you review the Button component and fix the focus ring?`,sentAt:new Date(`2026-03-15T14:30:00`)},{id:3,role:`assistant`,introText:`I'll read the Button component and check the focus styles.`,text:`I'll read the Button component and check the focus styles.

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

The focus ring meets **WCAG 2.4.7** requirements and uses the theme's focus color token.`,toolCalls:[{key:`1`,name:`read`,target:`Button.tsx`,status:`complete`,duration:`45ms`,node:`astryx`},{key:`2`,name:`edit`,target:`Button.tsx`,status:`complete`,duration:`120ms`,node:`astryx`,additions:8,deletions:2,resultDetail:(0,R.jsx)(c,{code:`:focus-visible {
  outline: 2px solid var(--color-ring-focus);
  outline-offset: 2px;
}`,language:`css`})},{key:`3`,name:`bash`,target:`yarn test`,status:`complete`,duration:`6.1s`,node:`astryx`,resultDetail:(0,R.jsx)(c,{code:`$ yarn test
✓ 24 tests passed (3 suites)`,language:`bash`})}]},{id:4,role:`user`,text:`Nice, can you also check the Card component?`,sentAt:new Date(`2026-03-15T14:35:00`)}],K={name:`Full AI Chat`,render:()=>{let[e,t]=(0,L.useState)(G),[n,r]=(0,L.useState)([]),[o,s]=(0,L.useState)(!1),c=(0,L.useRef)(void 0),l=(0,L.useRef)(null),u=i({placement:`above`}),d=U.map(e=>({value:`@${e.id}`,label:`@${e.label}`,variant:`blue`})),p=[{character:`@`,searchSource:m(U),onSelect:e=>({value:`@${e.id}`,label:`@${e.label}`,variant:`blue`})},{character:`/`,searchSource:m(W),onSelect:e=>`/${e.label} `}],h=(0,L.useCallback)((e,n,r)=>{let i=Date.now();s(!0),t(t=>[...t,{id:i,role:`assistant`,text:``,introText:e,isStreaming:!0}]);let a=0;c.current=setInterval(()=>{if(a+=2+Math.floor(Math.random()*4),a>=e.length){clearInterval(c.current),t(t=>t.map(t=>t.id===i?{...t,text:e}:t)),r?setTimeout(()=>{t(e=>e.map(e=>e.id===i&&e.role===`assistant`?{...e,toolCalls:r.map(e=>({...e,status:`running`,duration:void 0}))}:e)),setTimeout(()=>{t(e=>e.map(e=>e.id===i&&e.role===`assistant`?{...e,toolCalls:r}:e)),setTimeout(()=>{let r=0,a=e+`

`+n;c.current=setInterval(()=>{r+=3+Math.floor(Math.random()*5);let n=e.length+2+r;if(n>=a.length){clearInterval(c.current),t(e=>e.map(e=>e.id===i?{...e,text:a,isStreaming:!1}:e)),s(!1);return}t(e=>e.map(e=>e.id===i?{...e,text:a.slice(0,n)}:e))},30)},300)},1800)},400):(t(e=>e.map(e=>e.id===i?{...e,isStreaming:!1}:e)),s(!1));return}t(t=>t.map(t=>t.id===i?{...t,text:e.slice(0,a)}:t))},30)},[]),y=e=>U.filter(t=>e.includes(`@${t.id}`)).map(e=>({value:`@${e.id}`,label:`@${e.label}`,variant:`blue`}));return(0,R.jsx)(`div`,{style:{height:`100vh`,display:`flex`,flexDirection:`column`},children:(0,R.jsx)(C,{composer:(0,R.jsx)(g,{onSubmit:(0,L.useCallback)(e=>{let i=Date.now();t(t=>[...t,{id:i,role:`user`,text:e,files:n.length?[...n]:void 0,tokens:y(e),isSending:!0}]),r([]),setTimeout(()=>{t(e=>e.map(e=>e.id===i&&e.role===`user`?{...e,isSending:!1,sentAt:new Date}:e)),h(`I'll check the Card component for the same issue.`,`The border radius was hardcoded. I replaced it with the theme token:

\`\`\`css
/* before */
border-radius: 12px;

/* after */
border-radius: var(--radius-element);
\`\`\`

Cards now adapt across themes. All tests pass.`,[{key:`r1`,name:`read`,target:`Card.tsx`,status:`complete`,duration:`35ms`,node:`astryx`},{key:`e1`,name:`edit`,target:`Card.tsx`,status:`complete`,duration:`90ms`,node:`astryx`,additions:1,deletions:1},{key:`t1`,name:`bash`,target:`yarn test --filter Card`,status:`complete`,duration:`3.2s`,node:`astryx`}])},2e3)},[n,h]),onStop:(0,L.useCallback)(()=>{clearInterval(c.current),s(!1),t(e=>e.map(e=>e.role===`assistant`&&e.isStreaming?{...e,isStreaming:!1}:e))},[]),isStopShown:o,drawer:n.length>0?(0,R.jsx)(A,{children:n.map(e=>(0,R.jsx)(f,{label:e,onRemove:()=>r(t=>t.filter(t=>t!==e))},e))}):void 0,headerActions:(0,R.jsxs)(R.Fragment,{children:[(0,R.jsx)(a,{label:`Mention`,variant:`ghost`,size:`sm`,icon:V,isIconOnly:!0,onClick:()=>{l.current?.focus(),l.current?.insertText(`@`)}}),(0,R.jsx)(a,{label:`Attach`,variant:`ghost`,size:`sm`,icon:B,isIconOnly:!0,onClick:()=>r(e=>[...e,`file-${e.length+1}.tsx`])})]}),headerContext:(0,R.jsxs)(R.Fragment,{children:[(0,R.jsx)(x,{ref:u.ref,"aria-describedby":u.describedBy,label:`Context`,value:12,variant:`neutral`,isLabelHidden:!0,style:{marginInlineEnd:8}}),u.renderTooltip(`3k / 100k tokens used`)]}),input:(0,R.jsx)(v,{handleRef:l,triggers:p,placeholder:`Ask about the codebase...`}),footerActions:(0,R.jsx)(a,{label:`Claude Opus`,variant:`ghost`,size:`md`}),sendActions:(0,R.jsx)(a,{label:`Microphone`,variant:`ghost`,size:`md`,icon:H,isIconOnly:!0})}),children:(0,R.jsx)(S,{children:e.map(e=>{if(e.role===`system`)return(0,R.jsx)(D,{variant:`divider`,children:e.text},e.id);if(e.role===`user`)return(0,R.jsxs)(E,{sender:`user`,children:[e.files&&(0,R.jsx)(A,{children:e.files.map(e=>(0,R.jsx)(f,{label:e},e))}),(0,R.jsx)(O,{metadata:(0,R.jsx)(w,{timestamp:(0,R.jsx)(_,{value:e.sentAt?.toISOString()??new Date(e.id).toISOString(),format:`time`}),status:e.isSending?`sending`:void 0}),children:(0,R.jsx)(j,{tokens:d,children:e.text})})]},e.id);let t=e.introText?.length??0,n=e.toolCalls&&e.toolCalls.length>0,r=t>0?e.text.slice(0,t):null,i=t>0&&e.text.length>t?e.text.slice(t).replace(/^\n+/,``):t?null:e.text;return(0,R.jsxs)(E,{sender:`assistant`,children:[r&&(0,R.jsx)(M,{density:`compact`,children:r}),n&&(0,R.jsx)(k,{calls:e.toolCalls??[]}),i&&(0,R.jsx)(M,{density:`compact`,children:i}),!e.isStreaming&&e.text&&(0,R.jsx)(w,{timestamp:(0,R.jsx)(_,{value:new Date(e.id).toISOString(),format:`time`}),footer:(0,R.jsxs)(R.Fragment,{children:[(0,R.jsx)(`span`,{children:`Claude Opus 4.6`}),(0,R.jsx)(`span`,{children:`·`}),(0,R.jsx)(a,{label:`Thumbs up`,icon:(0,R.jsx)(P,{style:{width:14,height:14}}),variant:`ghost`,size:`sm`,isIconOnly:!0}),(0,R.jsx)(a,{label:`Thumbs down`,icon:(0,R.jsx)(F,{style:{width:14,height:14}}),variant:`ghost`,size:`sm`,isIconOnly:!0}),(0,R.jsx)(a,{label:`Copy`,icon:(0,R.jsx)(N,{style:{width:14,height:14}}),variant:`ghost`,size:`sm`,isIconOnly:!0})]})})]},e.id)})})})})}},q={name:`Panel View`,render:()=>{let[e,t]=(0,L.useState)(G),[n,r]=(0,L.useState)([]),[i,o]=(0,L.useState)(!1),s=(0,L.useRef)(void 0),c=(0,L.useRef)(null),l=U.map(e=>({value:`@${e.id}`,label:`@${e.label}`,variant:`blue`})),u=[{character:`@`,searchSource:m(U),onSelect:e=>({value:`@${e.id}`,label:`@${e.label}`,variant:`blue`})},{character:`/`,searchSource:m(W),onSelect:e=>`/${e.label} `}],d=(0,L.useCallback)((e,n)=>{let r=Date.now();o(!0),t(e=>[...e,{id:r,role:`assistant`,text:``,isStreaming:!0}]);let i=0,a=e+`

`+n;s.current=setInterval(()=>{if(i+=3+Math.floor(Math.random()*5),i>=a.length){clearInterval(s.current),t(e=>e.map(e=>e.id===r?{...e,text:a,isStreaming:!1}:e)),o(!1);return}t(e=>e.map(e=>e.id===r?{...e,text:a.slice(0,i)}:e))},30)},[]);return(0,R.jsx)(`div`,{style:{width:400,height:600,border:`1px solid #ccc`,borderRadius:8,overflow:`hidden`},children:(0,R.jsx)(C,{composer:(0,R.jsx)(g,{onSubmit:(0,L.useCallback)(e=>{t(t=>[...t,{id:Date.now(),role:`user`,text:e,files:n.length?[...n]:void 0}]),r([]),setTimeout(()=>{d(`Checking the component now.`,`Found the issue — the border radius was hardcoded. Replaced with the theme token.`)},800)},[n,d]),onStop:(0,L.useCallback)(()=>{clearInterval(s.current),o(!1),t(e=>e.map(e=>e.role===`assistant`&&e.isStreaming?{...e,isStreaming:!1}:e))},[]),isStopShown:i,drawer:n.length>0?(0,R.jsx)(A,{children:n.map(e=>(0,R.jsx)(f,{label:e,onRemove:()=>r(t=>t.filter(t=>t!==e))},e))}):void 0,headerActions:(0,R.jsxs)(R.Fragment,{children:[(0,R.jsx)(a,{label:`Mention`,variant:`ghost`,size:`sm`,icon:V,isIconOnly:!0,onClick:()=>{c.current?.focus(),c.current?.insertText(`@`)}}),(0,R.jsx)(a,{label:`Attach`,variant:`ghost`,size:`sm`,icon:B,isIconOnly:!0,onClick:()=>r(e=>[...e,`file-${e.length+1}.tsx`])})]}),input:(0,R.jsx)(v,{handleRef:c,triggers:u,placeholder:`Ask something...`})}),children:(0,R.jsx)(S,{children:e.map(e=>e.role===`system`?(0,R.jsx)(D,{variant:`divider`,children:e.text},e.id):e.role===`user`?(0,R.jsxs)(E,{sender:`user`,children:[e.files&&(0,R.jsx)(A,{children:e.files.map(e=>(0,R.jsx)(f,{label:e},e))}),(0,R.jsx)(O,{children:(0,R.jsx)(j,{tokens:l,children:e.text})})]},e.id):(0,R.jsxs)(E,{sender:`assistant`,children:[e.text&&(0,R.jsx)(M,{density:`compact`,children:e.text}),e.toolCalls&&e.toolCalls.length>0&&(0,R.jsx)(k,{calls:e.toolCalls??[]})]},e.id))})})})}},J={name:`Empty State`,render:()=>(0,R.jsx)(`div`,{style:{height:`100vh`,display:`flex`,flexDirection:`column`},children:(0,R.jsx)(C,{composer:(0,R.jsx)(g,{onSubmit:()=>{},placeholder:`Start a conversation…`}),emptyState:(0,R.jsx)(u,{title:`No messages yet`,description:`Start a conversation by typing below.`}),children:[]})})},Y=[`compact`,`balanced`,`spacious`],X={name:`Densities`,render:()=>(0,R.jsx)(`div`,{style:{display:`flex`,gap:16,height:`100vh`,padding:16,boxSizing:`border-box`},children:Y.map(e=>(0,R.jsxs)(`div`,{style:{flex:1,minWidth:0,display:`flex`,flexDirection:`column`,overflow:`hidden`},children:[(0,R.jsx)(`strong`,{style:{paddingBlockEnd:8},children:e}),(0,R.jsx)(C,{density:e,composer:(0,R.jsx)(g,{onSubmit:()=>{},placeholder:`Reply…`}),children:(0,R.jsxs)(S,{density:e,children:[(0,R.jsx)(D,{variant:`divider`,children:`Today`}),(0,R.jsx)(E,{sender:`user`,children:(0,R.jsx)(O,{children:`How does density change the layout?`})}),(0,R.jsx)(E,{sender:`assistant`,children:(0,R.jsx)(O,{children:`It sets the dock padding, the message column width, and the height of the blur behind the composer.`})})]})})]},e))})},Z=[`What does the scroll-to-bottom button do?`,`It appears once you scroll away from the newest message.`,`And when I am already at the bottom?`,`Then it is hidden, and it must not take keyboard focus.`,`Why does that matter?`,`Focus landing on something invisible has no visible focus indicator.`,`So the hidden state has to leave the tab order.`,`Exactly — opacity alone does not do that.`,`What removes it?`,`visibility: hidden, carried on the same transition so the fade still plays.`,`Does the visible button stay reachable?`,`Yes. Hiding it from the keyboard only applies while it paints nothing.`],Q={name:`Scroll Affordance States`,render:()=>(0,R.jsxs)(`div`,{style:{padding:16},children:[(0,R.jsx)(`button`,{type:`button`,children:`Before chat`}),(0,R.jsx)(`div`,{style:{height:420,marginBlockStart:12,display:`flex`,flexDirection:`column`,overflow:`hidden`},children:(0,R.jsx)(C,{composer:(0,R.jsx)(g,{onSubmit:()=>{},placeholder:`Reply…`}),children:(0,R.jsx)(S,{children:Z.map((e,t)=>(0,R.jsx)(E,{sender:t%2==0?`user`:`assistant`,children:(0,R.jsx)(O,{children:e})},e))})})})]})},K.parameters={...K.parameters,docs:{...K.parameters?.docs,source:{originalSource:`{
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
}`,...K.parameters?.docs?.source},description:{story:`Full AI chat with streaming, tool calls, triggers, attachments, and frosted glass composer dock`,...K.parameters?.docs?.description}}},q.parameters={...q.parameters,docs:{...q.parameters?.docs,source:{originalSource:`{
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
}`,...q.parameters?.docs?.source},description:{story:`Panel view — same full features in a narrow sidebar container`,...q.parameters?.docs?.description}}},J.parameters={...J.parameters,docs:{...J.parameters?.docs,source:{originalSource:`{
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
}`,...J.parameters?.docs?.source},description:{story:`Empty state using EmptyState`,...J.parameters?.docs?.description}}},X.parameters={...X.parameters,docs:{...X.parameters?.docs,source:{originalSource:`{
  name: 'Densities',
  render: () => <div style={{
    display: 'flex',
    gap: 16,
    height: '100vh',
    padding: 16,
    boxSizing: 'border-box'
  }}>
      {DENSITIES.map(density => <div key={density} style={{
      flex: 1,
      minWidth: 0,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
          <strong style={{
        paddingBlockEnd: 8
      }}>{density}</strong>
          <ChatLayout density={density} composer={<ChatComposer onSubmit={() => {}} placeholder="Reply…" />}>
            <ChatMessageList density={density}>
              <ChatSystemMessage variant="divider">Today</ChatSystemMessage>
              <ChatMessage sender="user">
                <ChatMessageBubble>
                  How does density change the layout?
                </ChatMessageBubble>
              </ChatMessage>
              <ChatMessage sender="assistant">
                <ChatMessageBubble>
                  It sets the dock padding, the message column width, and the
                  height of the blur behind the composer.
                </ChatMessageBubble>
              </ChatMessage>
            </ChatMessageList>
          </ChatLayout>
        </div>)}
    </div>
}`,...X.parameters?.docs?.source},description:{story:`The three densities side by side. Density is a prop, not an automatic
container-width adaptation: it selects the dock's inline and block-end
padding, the message area's max-width and inline padding, and the height and
mask of the frosted glass blur layer.`,...X.parameters?.docs?.description}}},Q.parameters={...Q.parameters,docs:{...Q.parameters?.docs,source:{originalSource:`{
  name: 'Scroll Affordance States',
  render: () => <div style={{
    padding: 16
  }}>
      <button type="button">Before chat</button>
      <div style={{
      height: 420,
      marginBlockStart: 12,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
        <ChatLayout composer={<ChatComposer onSubmit={() => {}} placeholder="Reply…" />}>
          <ChatMessageList>
            {AFFORDANCE_TURNS.map((text, index) => <ChatMessage key={text} sender={index % 2 === 0 ? 'user' : 'assistant'}>
                <ChatMessageBubble>{text}</ChatMessageBubble>
              </ChatMessage>)}
          </ChatMessageList>
        </ChatLayout>
      </div>
    </div>
}`,...Q.parameters?.docs?.source},description:{story:`Deterministic fixture for the scroll-to-bottom affordance: a bounded,
self-scrolling ChatLayout with static content and a sentinel control in
front of it. Scrolling away from the bottom reveals the affordance and
scrolling back hides it, so one story reaches the hidden, visible, and
re-hidden states without timers, streaming, or \`new Date()\`.

Drives the exact-head keyboard and theme-size evidence in
\`ChatLayoutScrollButton.a11y.chromium.spec.ts\`.`,...Q.parameters?.docs?.description}}},$=[`FullAIChat`,`PanelView`,`WithEmptyState`,`Densities`,`ScrollAffordanceStates`]}))();export{X as Densities,K as FullAIChat,q as PanelView,Q as ScrollAffordanceStates,J as WithEmptyState,$ as __namedExportsOrder,z as default};