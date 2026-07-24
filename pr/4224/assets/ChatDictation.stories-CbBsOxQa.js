import{a as e,n as t}from"./rolldown-runtime-DaJ6WEGw.js";import{t as n}from"./react-DvlgmmzG.js";import{t as r}from"./jsx-runtime-cM__dR4X.js";import{O as i,a,n as o,t as s,w as c}from"./Chat-DwOA8799.js";var l,u,d,f,p,m,h,g,_,v,y,b,x,S,C,w;t((()=>{s(),l=e(n()),u=r(),d={volume:0,rawBands:[0,0,0,0,0],bands:[0,0,0,0,0],isSupported:!0,isListening:!1,isSpeaking:!1,interimTranscript:``,start:()=>{},stop:()=>{},abort:()=>{},toggle:()=>{}},f={volume:.05,rawBands:[.08,.06,.04,.02,.01],bands:[.08,.06,.04,.02,.01],isSupported:!0,isListening:!0,isSpeaking:!1,interimTranscript:``,start:()=>{},stop:()=>{},abort:()=>{},toggle:()=>{}},p={volume:.12,rawBands:[.15,.12,.08,.05,.02],bands:[.15,.12,.08,.05,.02],isSupported:!0,isListening:!0,isSpeaking:!0,interimTranscript:`hello world`,start:()=>{},stop:()=>{},abort:()=>{},toggle:()=>{}},m={volume:0,rawBands:[0,0,0,0,0],bands:[0,0,0,0,0],isSupported:!1,isListening:!1,isSpeaking:!1,interimTranscript:``,start:()=>{},stop:()=>{},abort:()=>{},toggle:()=>{}},h={title:`Core/ChatDictation`,component:o,tags:[`autodocs`],parameters:{layout:`centered`},decorators:[e=>(0,u.jsx)(`div`,{style:{width:600,padding:40},children:(0,u.jsx)(e,{})})]},g={render:()=>(0,u.jsx)(o,{dictation:d})},_={render:()=>(0,u.jsx)(o,{dictation:f})},v={render:()=>(0,u.jsx)(o,{dictation:p})},y={render:()=>(0,u.jsxs)(`div`,{children:[(0,u.jsx)(`p`,{style:{marginBottom:8},children:`Button is hidden when unsupported (nothing below):`}),(0,u.jsx)(o,{dictation:m})]})},b={render:()=>(0,u.jsx)(o,{dictation:m,isHiddenWhenUnsupported:!1})},x={render:()=>(0,u.jsx)(c,{onSubmit:e=>console.log(`Submit:`,e),sendActions:(0,u.jsx)(o,{dictation:d})})},S={render:()=>(0,u.jsx)(c,{onSubmit:e=>console.log(`Submit:`,e),sendButton:(0,u.jsx)(o,{dictation:f})})},C={render:()=>{let e=(0,l.useRef)(null),t=a({inputRef:e,hasSounds:!0,onResult:e=>{console.log(`Final:`,e)}});return(0,u.jsxs)(`div`,{children:[(0,u.jsx)(c,{onSubmit:e=>{console.log(`Submit:`,e)},input:(0,u.jsx)(i,{handleRef:e}),sendActions:(0,u.jsx)(o,{dictation:t})}),t.isListening&&(0,u.jsxs)(`div`,{style:{marginTop:8,display:`flex`,alignItems:`center`,gap:8},children:[(0,u.jsx)(`span`,{style:{fontSize:12,opacity:.5},children:`Volume:`}),(0,u.jsx)(`div`,{style:{width:120,height:8,backgroundColor:`#eee`,borderRadius:4,overflow:`hidden`},children:(0,u.jsx)(`div`,{style:{height:`100%`,backgroundColor:t.volume>.3?`#ef4444`:`#22c55e`,borderRadius:4,transition:`width 0.08s ease-out`,width:`${Math.min(t.volume*100*2,100)}%`}})}),(0,u.jsx)(`span`,{style:{fontSize:12,fontFamily:`monospace`,opacity:.5},children:t.volume.toFixed(2)})]}),t.isListening&&(0,u.jsxs)(`div`,{style:{marginTop:12},children:[(0,u.jsx)(`div`,{style:{fontSize:12,fontWeight:600,marginBottom:4},children:`Band Debug (raw vs calibrated)`}),(0,u.jsx)(`div`,{style:{display:`flex`,gap:8,fontFamily:`monospace`,fontSize:11},children:[`170-340`,`340-860`,`860-1.7k`,`1.7-3k`,`3k+`].map((e,n)=>{let r=t.rawBands[n]??0,i=t.bands[n]??0;return(0,u.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,alignItems:`center`,gap:2,flex:1},children:[(0,u.jsxs)(`div`,{style:{display:`flex`,gap:2,alignItems:`flex-end`,height:40},children:[(0,u.jsx)(`div`,{style:{width:8,backgroundColor:`rgba(200,200,200,0.5)`,height:Math.min(r*40*5,40),borderRadius:2}}),(0,u.jsx)(`div`,{style:{width:8,backgroundColor:`#3b82f6`,height:Math.min(i*40*5,40),borderRadius:2}})]}),(0,u.jsx)(`span`,{style:{opacity:.5,fontSize:9},children:e}),(0,u.jsxs)(`span`,{style:{opacity:.4},children:[`r:`,r.toFixed(3)]}),(0,u.jsxs)(`span`,{style:{color:`#3b82f6`},children:[`c:`,i.toFixed(3)]})]},e)})}),(0,u.jsx)(`div`,{style:{fontSize:10,opacity:.4,marginTop:4},children:`Gray = raw mic, Blue = after noise floor`})]}),!t.isSupported&&(0,u.jsx)(`p`,{style:{marginTop:8,color:`red`},children:`SpeechRecognition is not supported in this browser.`})]})}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  render: () => <ChatDictationButton dictation={idleDictation} />
}`,...g.parameters?.docs?.source},description:{story:`Idle state — microphone icon, ready to start dictation`,...g.parameters?.docs?.description}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  render: () => <ChatDictationButton dictation={listeningDictation} />
}`,..._.parameters?.docs?.source},description:{story:`Listening state — pulsing red record indicator`,..._.parameters?.docs?.description}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  render: () => <ChatDictationButton dictation={speakingDictation} />
}`,...v.parameters?.docs?.source},description:{story:`Speaking state — more intense pulse while speech is detected`,...v.parameters?.docs?.description}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  render: () => <div>
      <p style={{
      marginBottom: 8
    }}>
        Button is hidden when unsupported (nothing below):
      </p>
      <ChatDictationButton dictation={unsupportedDictation} />
    </div>
}`,...y.parameters?.docs?.source},description:{story:`Unsupported browser — button hidden by default`,...y.parameters?.docs?.description}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  render: () => <ChatDictationButton dictation={unsupportedDictation} isHiddenWhenUnsupported={false} />
}`,...b.parameters?.docs?.source},description:{story:`Unsupported browser — button visible when isHiddenWhenUnsupported is false`,...b.parameters?.docs?.description}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  render: () => <ChatComposer onSubmit={value => console.log('Submit:', value)} sendActions={<ChatDictationButton dictation={idleDictation} />} />
}`,...x.parameters?.docs?.source},description:{story:`Dictation button in sendActions slot of ChatComposer`,...x.parameters?.docs?.description}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  render: () => <ChatComposer onSubmit={value => console.log('Submit:', value)} sendButton={<ChatDictationButton dictation={listeningDictation} />} />
}`,...S.parameters?.docs?.source},description:{story:`Dictation button replacing the send button`,...S.parameters?.docs?.description}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  render: () => {
    const inputRef = useRef<ChatComposerInputHandle>(null);
    const dictation = useChatDictation({
      inputRef,
      hasSounds: true,
      onResult: text => {
        console.log('Final:', text);
      }
    });
    return <div>
        <ChatComposer onSubmit={v => {
        console.log('Submit:', v);
      }} input={<ChatComposerInput handleRef={inputRef} />} sendActions={<ChatDictationButton dictation={dictation} />} />
        {dictation.isListening && <div style={{
        marginTop: 8,
        display: 'flex',
        alignItems: 'center',
        gap: 8
      }}>
            <span style={{
          fontSize: 12,
          opacity: 0.5
        }}>Volume:</span>
            <div style={{
          width: 120,
          height: 8,
          backgroundColor: '#eee',
          borderRadius: 4,
          overflow: 'hidden'
        }}>
              <div style={{
            height: '100%',
            backgroundColor: dictation.volume > 0.3 ? '#ef4444' : '#22c55e',
            borderRadius: 4,
            transition: 'width 0.08s ease-out',
            width: \`\${Math.min(dictation.volume * 100 * 2, 100)}%\`
          }} />
            </div>
            <span style={{
          fontSize: 12,
          fontFamily: 'monospace',
          opacity: 0.5
        }}>
              {dictation.volume.toFixed(2)}
            </span>
          </div>}

        {dictation.isListening && <div style={{
        marginTop: 12
      }}>
            <div style={{
          fontSize: 12,
          fontWeight: 600,
          marginBottom: 4
        }}>
              Band Debug (raw vs calibrated)
            </div>
            <div style={{
          display: 'flex',
          gap: 8,
          fontFamily: 'monospace',
          fontSize: 11
        }}>
              {['170-340', '340-860', '860-1.7k', '1.7-3k', '3k+'].map((label, i) => {
            const raw = dictation.rawBands[i] ?? 0;
            const clean = dictation.bands[i] ?? 0;
            const barH = 40;
            return <div key={label} style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
              flex: 1
            }}>
                      <div style={{
                display: 'flex',
                gap: 2,
                alignItems: 'flex-end',
                height: barH
              }}>
                        <div style={{
                  width: 8,
                  backgroundColor: 'rgba(200,200,200,0.5)',
                  height: Math.min(raw * barH * 5, barH),
                  borderRadius: 2
                }} />
                        <div style={{
                  width: 8,
                  backgroundColor: '#3b82f6',
                  height: Math.min(clean * barH * 5, barH),
                  borderRadius: 2
                }} />
                      </div>
                      <span style={{
                opacity: 0.5,
                fontSize: 9
              }}>{label}</span>
                      <span style={{
                opacity: 0.4
              }}>r:{raw.toFixed(3)}</span>
                      <span style={{
                color: '#3b82f6'
              }}>
                        c:{clean.toFixed(3)}
                      </span>
                    </div>;
          })}
            </div>
            <div style={{
          fontSize: 10,
          opacity: 0.4,
          marginTop: 4
        }}>
              Gray = raw mic, Blue = after noise floor
            </div>
          </div>}

        {!dictation.isSupported && <p style={{
        marginTop: 8,
        color: 'red'
      }}>
            SpeechRecognition is not supported in this browser.
          </p>}
      </div>;
  }
}`,...C.parameters?.docs?.source},description:{story:`Interactive demo with real SpeechRecognition.

Note: SpeechRecognition may not work in Storybook's iframe.
For full testing, open this story in a standalone browser tab.`,...C.parameters?.docs?.description}}},w=[`Idle`,`Listening`,`Speaking`,`Unsupported`,`UnsupportedVisible`,`InSendActions`,`AsSendButton`,`Interactive`]}))();export{S as AsSendButton,g as Idle,x as InSendActions,C as Interactive,_ as Listening,v as Speaking,y as Unsupported,b as UnsupportedVisible,w as __namedExportsOrder,h as default};