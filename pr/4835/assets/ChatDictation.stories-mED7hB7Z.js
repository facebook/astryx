import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{t}from"./react-BZJXY1be.js";import{n,t as r}from"./stylex-Dft6gtPK.js";import{n as i}from"./mergeProps-JRyAvMxc.js";import{a,n as o,o as s,t as c}from"./ChatComposer-Dto0vwmR.js";import{t as l}from"./jsx-runtime-DeHZSEgm.js";import{c as u,n as d}from"./tokens.stylex-C15xwlpu.js";import{n as f,t as p}from"./Button-BVMvoKVE.js";import{n as m,t as h}from"./useTranslator-BMnme3me.js";import{n as g,t as _}from"./Icon-C24cO4CC.js";function v(){return typeof window>`u`?null:window.SpeechRecognition??window.webkitSpeechRecognition??null}async function y(e){try{let t=await navigator.mediaDevices.getUserMedia({audio:!0}),n=e(),r=n.createMediaStreamSource(t),i=n.createAnalyser();i.fftSize=256,i.smoothingTimeConstant=.5,r.connect(i);let a=new Uint8Array(i.frequencyBinCount),o=new Float32Array(i.frequencyBinCount),s=0;function c(){i.getByteFrequencyData(a),s++;for(let e=0;e<a.length;e++){let t=a[e]/255;t>o[e]&&(o[e]=t)}}function l(e){let t=a[e]/255;return s<60?0:Math.max(0,t-o[e]*1.1)}return{calibrate:c,getVolume:()=>{i.getByteFrequencyData(a),s<60&&c();let e=0;for(let t=0;t<a.length;t++)e+=l(t);return e/a.length},getBands:e=>{i.getByteFrequencyData(a),s<60&&c();let t=[],n=[3,6,11,18,a.length],r=e<=n.length?n.slice(0,e):n,o=1;for(let e=0;e<r.length;e++){let n=r[e],i=0;for(let e=o;e<n;e++)i+=l(e);t.push(i/(n-o)),o=n}return t},getRawBands:e=>{i.getByteFrequencyData(a);let t=[],n=[3,6,11,18,a.length],r=e<=n.length?n.slice(0,e):n,o=1;for(let e=0;e<r.length;e++){let n=r[e],i=0;for(let e=o;e<n;e++)i+=a[e]/255;t.push(i/(n-o)),o=n}return t},cleanup:()=>{r.disconnect();for(let e of t.getTracks())e.stop()}}}catch{return null}}function b(){return(!C||C.state===`closed`)&&(C=new AudioContext),C.state===`suspended`&&C.resume(),C}function x(e={}){let t=m(),{lang:n,continuous:r=!0,interimResults:i=!0,onTranscript:a,onResult:o,onError:s,onStart:c,onEnd:l,audioContext:u,transformTranscript:d}=e,f=(0,S.useCallback)(()=>u??b(),[u]),p=(0,S.useMemo)(()=>v()!=null,[]),[h,g]=(0,S.useState)(!1),[_,x]=(0,S.useState)(!1),[C,w]=(0,S.useState)(0),[T,E]=(0,S.useState)([0,0,0,0,0]),[D,O]=(0,S.useState)([0,0,0,0,0]),[ee,k]=(0,S.useState)(``),A=(0,S.useRef)(null),j=(0,S.useRef)(f);j.current=f;let M=(0,S.useRef)(null),N=(0,S.useRef)(0),P=(0,S.useRef)({onTranscript:a,onResult:o,onError:s,onStart:c,onEnd:l,transformTranscript:d});P.current={onTranscript:a,onResult:o,onError:s,onStart:c,onEnd:l,transformTranscript:d},(0,S.useEffect)(()=>()=>{A.current?.abort(),A.current=null,M.current?.cleanup(),M.current=null,cancelAnimationFrame(N.current)},[]);let F=(0,S.useCallback)(()=>{let e=()=>{let t=M.current;t&&(w(t.getVolume()),E(t.getBands(5)),O(t.getRawBands(5))),N.current=requestAnimationFrame(e)};N.current=requestAnimationFrame(e)},[]),I=(0,S.useCallback)(()=>{cancelAnimationFrame(N.current),w(0),E([0,0,0,0,0]),O([0,0,0,0,0]),M.current?.cleanup(),M.current=null},[]),L=(0,S.useCallback)(()=>{let e=v();if(!e)return;A.current?.abort();let a=new e;a.lang=n??navigator.language,a.continuous=r,a.interimResults=i,a.onstart=()=>{g(!0),P.current.onStart?.(),y(j.current).then(e=>{e&&(M.current=e,F())})},a.onend=()=>{g(!1),x(!1),k(``),I(),P.current.onEnd?.()},a.onspeechstart=()=>{x(!0)},a.onspeechend=()=>{x(!1)},a.onresult=e=>{let t=``;for(let n=e.resultIndex;n<e.results.length;n++){let r=e.results[n],i=r[0].transcript;P.current.transformTranscript&&(i=P.current.transformTranscript(i)),r.isFinal?(P.current.onResult?.(i),P.current.onTranscript?.(i,!0),k(``)):t+=i}t&&(k(t),P.current.onTranscript?.(t,!1))},a.onerror=e=>{P.current.onError?.({error:e.error,message:e.message})},a.onnomatch=()=>{P.current.onError?.({error:`no-speech`,message:t(`@astryx.chat.speechRecognition.noSpeechDetected`)})},A.current=a,a.start()},[n,r,i,F,I,t]),R=(0,S.useCallback)(()=>{A.current?.stop()},[]);return{isSupported:p,isListening:h,isSpeaking:_,volume:C,bands:T,rawBands:D,interimTranscript:ee,start:L,stop:R,abort:(0,S.useCallback)(()=>{A.current?.abort(),I()},[I]),toggle:(0,S.useCallback)(()=>{h?R():L()},[h,L,R])}}var S,C;function w(){return(w=e((()=>{S=t(),h(),C=null})))()}async function T(e){try{let t=await navigator.mediaDevices.getUserMedia({audio:!0}),n=e(),r=n.createMediaStreamSource(t),i=n.createAnalyser();i.fftSize=256,i.smoothingTimeConstant=.5,r.connect(i);let a=new Uint8Array(i.frequencyBinCount),o=new Float32Array(i.frequencyBinCount),s=0;function c(){i.getByteFrequencyData(a),s++;for(let e=0;e<a.length;e++){let t=a[e]/255;t>o[e]&&(o[e]=t)}}function l(e){let t=a[e]/255;return s<60?0:Math.max(0,t-o[e]*1.1)}return{calibrate:c,getVolume:()=>{i.getByteFrequencyData(a),s<60&&c();let e=0;for(let t=0;t<a.length;t++)e+=l(t);return e/a.length},getBands:e=>{i.getByteFrequencyData(a),s<60&&c();let t=[],n=[3,6,11,18,a.length],r=e<=n.length?n.slice(0,e):n,o=1;for(let e=0;e<r.length;e++){let n=r[e],i=0;for(let e=o;e<n;e++)i+=l(e);t.push(i/(n-o)),o=n}return t},getRawBands:e=>{i.getByteFrequencyData(a);let t=[],n=[3,6,11,18,a.length],r=e<=n.length?n.slice(0,e):n,o=1;for(let e=0;e<r.length;e++){let n=r[e],i=0;for(let e=o;e<n;e++)i+=a[e]/255;t.push(i/(n-o)),o=n}return t},cleanup:()=>{r.disconnect();for(let e of t.getTracks())e.stop()}}}catch{return null}}function E(){return(!j||j.state===`closed`)&&(j=new AudioContext),j.state===`suspended`&&j.resume(),j}function D(e,t,n,r=.25){try{let i=n(),a=i.currentTime,o=e<200?.18:.06,s=i.createOscillator(),c=i.createGain();s.type=`sine`,s.frequency.setValueAtTime(e*1.3,a+t),s.frequency.exponentialRampToValueAtTime(e,a+t+.01),s.frequency.exponentialRampToValueAtTime(e*.93,a+t+o),c.gain.setValueAtTime(.001,a),c.gain.setValueAtTime(r,a+t),c.gain.exponentialRampToValueAtTime(r*.2,a+t+o*.12),c.gain.exponentialRampToValueAtTime(.001,a+t+o),s.connect(c),c.connect(i.destination),s.start(a+t),s.stop(a+t+o)}catch{}}function O(e){M||(D(392,0,e),D(523,.07,e))}function ee(e){M||(D(523,0,e),D(392,.07,e))}function k(e={}){let{lang:t,continuous:n,interimResults:r,transformTranscript:i,onTranscript:a,onResult:o,onError:s,onStart:c,onEnd:l,hasSounds:u=!1,audioContext:d,inputRef:f}=e,p=(0,A.useCallback)(()=>d??E(),[d]),[m,h]=(0,A.useState)(0),[g,_]=(0,A.useState)([0,0,0,0,0]),[v,y]=(0,A.useState)([0,0,0,0,0]),b=(0,A.useRef)([]),S=(0,A.useRef)(p);S.current=p;let C=(0,A.useRef)(null),w=(0,A.useRef)(0),D=(0,A.useRef)(null),k=(0,A.useRef)({onTranscriptProp:a,onResultProp:o,onStartProp:c,onEndProp:l});k.current={onTranscriptProp:a,onResultProp:o,onStartProp:c,onEndProp:l};let j=(0,A.useCallback)(()=>{let e=()=>{let t=C.current;if(t){let e=t.getVolume();h(e);let n=b.current;n.push(e),n.length>30&&n.shift(),_(t.getBands(5)),y(t.getRawBands(5))}w.current=requestAnimationFrame(e)};w.current=requestAnimationFrame(e)},[]),M=(0,A.useCallback)(()=>{cancelAnimationFrame(w.current),h(0),_([0,0,0,0,0]),y([0,0,0,0,0]),b.current=[],C.current?.cleanup(),C.current=null},[]),N=(0,A.useCallback)(()=>{let e=document.activeElement;return e?.getAttribute(`contenteditable`)===`true`?e:document.querySelector(`.astryx-chat-composer-input [contenteditable="true"], [role="textbox"][contenteditable="true"]`)},[]),P=(0,A.useCallback)(()=>{let e=N();if(!e)return;let t=document.createElement(`span`);t.setAttribute(`data-astryx-dictation-interim`,``),t.contentEditable=`false`,t.style.color=`var(--color-text-disabled, #999)`,t.style.fontStyle=`italic`,t.style.opacity=`0.7`,t.style.pointerEvents=`none`,e.appendChild(t),D.current=t,e.dispatchEvent(new Event(`input`,{bubbles:!0}))},[N]),F=(0,A.useCallback)(()=>{let e=D.current;if(e?.isConnected)try{e.remove()}catch{}D.current=null},[]),I=(0,A.useCallback)(e=>{let t=e;i&&(t=i(t));let n=b.current;return(n.length>0?n.reduce((e,t)=>e+t,0)/n.length:0)>=.15&&n.length>=10&&(t=t.toUpperCase()),t},[i]);(0,A.useEffect)(()=>()=>{C.current?.cleanup(),C.current=null,cancelAnimationFrame(w.current)},[]);let L=x({lang:t,continuous:n,interimResults:r,transformTranscript:I,onTranscript:(e,t)=>{if(f)if(t){F();let t=f.current;t&&(t.focus(),t.insertText(e+` `)),k.current.onResultProp?.(e),P()}else{let t=D.current;t?t.textContent=e:(P(),D.current&&(D.current.textContent=e))}k.current.onTranscriptProp?.(e,t)},onResult:f?void 0:o,onError:s,onStart:()=>{u&&O(S.current),T(S.current).then(e=>{e&&(C.current=e,j())}),f&&P(),k.current.onStartProp?.()},onEnd:()=>{if(M(),u&&ee(S.current),f){F();let e=N();e&&e.dispatchEvent(new Event(`input`,{bubbles:!0}))}k.current.onEndProp?.()}}),R=L.abort,z=(0,A.useCallback)(()=>{R(),M()},[R,M]);return{isSupported:L.isSupported,isListening:L.isListening,isSpeaking:L.isSpeaking,interimTranscript:L.interimTranscript,volume:m,bands:g,rawBands:v,start:L.start,stop:L.stop,abort:z,toggle:L.toggle}}var A,j,M;function N(){return(N=e((()=>{A=t(),w(),j=null,M=typeof navigator<`u`&&/iPad|iPhone|iPod/.test(navigator.userAgent)})))()}function P({ref:e,dictation:t,size:r=`md`,isHiddenWhenUnsupported:a=!0,label:o,xstyle:s,className:c,style:l,...u}){let f=m();if(a&&!t.isSupported)return null;let{isListening:h,bands:g,volume:v}=t,y=o??f(h?`@astryx.chatDictationButton.stopDictation`:`@astryx.chatDictationButton.startDictation`),b=g.map(e=>Math.min((e/.2)**.5,1)),x=v>=.2,S=x?Math.min((v-.2)/.1,1)*60:0,C=x?`hsl(calc(var(--accent-hue, 210) + ${S}), 80%, 50%)`:`var(--color-accent, ${d[`--color-accent`]})`,{barWidth:w,barGap:T,barMaxHeight:E}=z[r];return(0,F.jsxs)(`span`,{ref:e,...i(n(I.wrapper,s),c,l),...u,children:[h&&(0,F.jsx)(`span`,{"aria-hidden":!0,...i({className:`astryx10l6tqk astryx78zum5 astryx6s0dn4 astryxl56j7k astryx47corl astryx1vjfegm`},{style:{gap:T,height:E}}),children:b.slice(0,L).map((e,t)=>{let n=R+e*.92;return(0,F.jsx)(`span`,{...i({className:`astryxjspbzw astryx1g0ag68 astryx18dpk69 astryx11bq7d0 astryx12w9bfk astryx9lcvmn`},{style:{width:w,height:`100%`,backgroundColor:C,transform:`scaleY(${n})`}})},t)})}),(0,F.jsx)(p,{label:y,"aria-label":y,variant:`ghost`,size:r,icon:h?void 0:(0,F.jsx)(_,{icon:`microphone`,size:r}),isIconOnly:!0,onClick:t.toggle})]})}var F,I,L,R,z;function te(){return(te=e((()=>{t(),r(),u(),f(),g(),h(),F=l(),I={wrapper:{kVAEAm:`astryx1n2onr6`,k1xSpc:`astryx3nfvp2`,kGNEyG:`astryx6s0dn4`,kjj79g:`astryxl56j7k`,$$css:!0}},L=5,R=.08,z={sm:{barWidth:2,barGap:1.5,barMaxHeight:14},md:{barWidth:2.5,barGap:2,barMaxHeight:18}},P.displayName=`ChatDictationButton`,P.__docgenInfo={description:`Microphone button for voice input in a chat composer.
Requires the return value of useChatDictation.

@example
\`\`\`
<ChatDictationButton dictation={dictation} />
\`\`\``,methods:[],displayName:`ChatDictationButton`,props:{xstyle:{required:!1,tsType:{name:`StyleXStyles`},description:"StyleX styles created via `stylex.create()`. Merged with the component's\nbase styles inside a single `stylex.props()` call for optimal deduplication.\n\n@example\n```\nconst overrides = stylex.create({ root: { marginBottom: 8 } });\n<Component xstyle={overrides.root} />\n```"},ref:{required:!1,tsType:{name:`ReactRef`,raw:`React.Ref<HTMLSpanElement>`,elements:[{name:`HTMLSpanElement`}]},description:``},dictation:{required:!0,tsType:{name:`UseSpeechRecognitionReturn`},description:`The return value from useChatDictation or useSpeechRecognition.`},size:{required:!1,tsType:{name:`union`,raw:`'sm' | 'md'`,elements:[{name:`literal`,value:`'sm'`},{name:`literal`,value:`'md'`}]},description:`Button size. @default "md"`,defaultValue:{value:`'md'`,computed:!1}},isHiddenWhenUnsupported:{required:!1,tsType:{name:`boolean`},description:`Hide the button when SpeechRecognition is not supported. @default true`,defaultValue:{value:`true`,computed:!1}},label:{required:!1,tsType:{name:`string`},description:`Accessible label override.`}},composes:[`Omit`]}})))()}var ne,B,V,H,U,W,G,K,q,J,Y,X,Z,Q,$,re;function ie(){return(ie=e((()=>{te(),o(),N(),s(),ne=t(),B=l(),V={volume:0,rawBands:[0,0,0,0,0],bands:[0,0,0,0,0],isSupported:!0,isListening:!1,isSpeaking:!1,interimTranscript:``,start:()=>{},stop:()=>{},abort:()=>{},toggle:()=>{}},H={volume:.05,rawBands:[.08,.06,.04,.02,.01],bands:[.08,.06,.04,.02,.01],isSupported:!0,isListening:!0,isSpeaking:!1,interimTranscript:``,start:()=>{},stop:()=>{},abort:()=>{},toggle:()=>{}},U={volume:.12,rawBands:[.15,.12,.08,.05,.02],bands:[.15,.12,.08,.05,.02],isSupported:!0,isListening:!0,isSpeaking:!0,interimTranscript:`hello world`,start:()=>{},stop:()=>{},abort:()=>{},toggle:()=>{}},W={volume:0,rawBands:[0,0,0,0,0],bands:[0,0,0,0,0],isSupported:!1,isListening:!1,isSpeaking:!1,interimTranscript:``,start:()=>{},stop:()=>{},abort:()=>{},toggle:()=>{}},G={title:`Core/ChatDictation`,component:P,tags:[`autodocs`],parameters:{layout:`centered`},decorators:[e=>(0,B.jsx)(`div`,{style:{width:600,padding:40},children:(0,B.jsx)(e,{})})]},K={render:()=>(0,B.jsx)(P,{dictation:V})},q={render:()=>(0,B.jsx)(P,{dictation:H})},J={render:()=>(0,B.jsx)(P,{dictation:U})},Y={render:()=>(0,B.jsxs)(`div`,{children:[(0,B.jsx)(`p`,{style:{marginBottom:8},children:`Button is hidden when unsupported (nothing below):`}),(0,B.jsx)(P,{dictation:W})]})},X={render:()=>(0,B.jsx)(P,{dictation:W,isHiddenWhenUnsupported:!1})},Z={render:()=>(0,B.jsx)(c,{onSubmit:e=>console.log(`Submit:`,e),sendActions:(0,B.jsx)(P,{dictation:V})})},Q={render:()=>(0,B.jsx)(c,{onSubmit:e=>console.log(`Submit:`,e),sendButton:(0,B.jsx)(P,{dictation:H})})},$={render:()=>{let e=(0,ne.useRef)(null),t=k({inputRef:e,hasSounds:!0,onResult:e=>{console.log(`Final:`,e)}});return(0,B.jsxs)(`div`,{children:[(0,B.jsx)(c,{onSubmit:e=>{console.log(`Submit:`,e)},input:(0,B.jsx)(a,{handleRef:e}),sendActions:(0,B.jsx)(P,{dictation:t})}),t.isListening&&(0,B.jsxs)(`div`,{style:{marginTop:8,display:`flex`,alignItems:`center`,gap:8},children:[(0,B.jsx)(`span`,{style:{fontSize:12,opacity:.5},children:`Volume:`}),(0,B.jsx)(`div`,{style:{width:120,height:8,backgroundColor:`#eee`,borderRadius:4,overflow:`hidden`},children:(0,B.jsx)(`div`,{style:{height:`100%`,backgroundColor:t.volume>.3?`#ef4444`:`#22c55e`,borderRadius:4,transition:`width 0.08s ease-out`,width:`${Math.min(t.volume*100*2,100)}%`}})}),(0,B.jsx)(`span`,{style:{fontSize:12,fontFamily:`monospace`,opacity:.5},children:t.volume.toFixed(2)})]}),t.isListening&&(0,B.jsxs)(`div`,{style:{marginTop:12},children:[(0,B.jsx)(`div`,{style:{fontSize:12,fontWeight:600,marginBottom:4},children:`Band Debug (raw vs calibrated)`}),(0,B.jsx)(`div`,{style:{display:`flex`,gap:8,fontFamily:`monospace`,fontSize:11},children:[`170-340`,`340-860`,`860-1.7k`,`1.7-3k`,`3k+`].map((e,n)=>{let r=t.rawBands[n]??0,i=t.bands[n]??0;return(0,B.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,alignItems:`center`,gap:2,flex:1},children:[(0,B.jsxs)(`div`,{style:{display:`flex`,gap:2,alignItems:`flex-end`,height:40},children:[(0,B.jsx)(`div`,{style:{width:8,backgroundColor:`rgba(200,200,200,0.5)`,height:Math.min(r*40*5,40),borderRadius:2}}),(0,B.jsx)(`div`,{style:{width:8,backgroundColor:`#3b82f6`,height:Math.min(i*40*5,40),borderRadius:2}})]}),(0,B.jsx)(`span`,{style:{opacity:.5,fontSize:9},children:e}),(0,B.jsxs)(`span`,{style:{opacity:.4},children:[`r:`,r.toFixed(3)]}),(0,B.jsxs)(`span`,{style:{color:`#3b82f6`},children:[`c:`,i.toFixed(3)]})]},e)})}),(0,B.jsx)(`div`,{style:{fontSize:10,opacity:.4,marginTop:4},children:`Gray = raw mic, Blue = after noise floor`})]}),!t.isSupported&&(0,B.jsx)(`p`,{style:{marginTop:8,color:`red`},children:`SpeechRecognition is not supported in this browser.`})]})}},K.parameters={...K.parameters,docs:{...K.parameters?.docs,source:{originalSource:`{
  render: () => <ChatDictationButton dictation={idleDictation} />
}`,...K.parameters?.docs?.source},description:{story:`Idle state — microphone icon, ready to start dictation`,...K.parameters?.docs?.description}}},q.parameters={...q.parameters,docs:{...q.parameters?.docs,source:{originalSource:`{
  render: () => <ChatDictationButton dictation={listeningDictation} />
}`,...q.parameters?.docs?.source},description:{story:`Listening state — pulsing red record indicator`,...q.parameters?.docs?.description}}},J.parameters={...J.parameters,docs:{...J.parameters?.docs,source:{originalSource:`{
  render: () => <ChatDictationButton dictation={speakingDictation} />
}`,...J.parameters?.docs?.source},description:{story:`Speaking state — more intense pulse while speech is detected`,...J.parameters?.docs?.description}}},Y.parameters={...Y.parameters,docs:{...Y.parameters?.docs,source:{originalSource:`{
  render: () => <div>
      <p style={{
      marginBottom: 8
    }}>
        Button is hidden when unsupported (nothing below):
      </p>
      <ChatDictationButton dictation={unsupportedDictation} />
    </div>
}`,...Y.parameters?.docs?.source},description:{story:`Unsupported browser — button hidden by default`,...Y.parameters?.docs?.description}}},X.parameters={...X.parameters,docs:{...X.parameters?.docs,source:{originalSource:`{
  render: () => <ChatDictationButton dictation={unsupportedDictation} isHiddenWhenUnsupported={false} />
}`,...X.parameters?.docs?.source},description:{story:`Unsupported browser — button visible when isHiddenWhenUnsupported is false`,...X.parameters?.docs?.description}}},Z.parameters={...Z.parameters,docs:{...Z.parameters?.docs,source:{originalSource:`{
  render: () => <ChatComposer onSubmit={value => console.log('Submit:', value)} sendActions={<ChatDictationButton dictation={idleDictation} />} />
}`,...Z.parameters?.docs?.source},description:{story:`Dictation button in sendActions slot of ChatComposer`,...Z.parameters?.docs?.description}}},Q.parameters={...Q.parameters,docs:{...Q.parameters?.docs,source:{originalSource:`{
  render: () => <ChatComposer onSubmit={value => console.log('Submit:', value)} sendButton={<ChatDictationButton dictation={listeningDictation} />} />
}`,...Q.parameters?.docs?.source},description:{story:`Dictation button replacing the send button`,...Q.parameters?.docs?.description}}},$.parameters={...$.parameters,docs:{...$.parameters?.docs,source:{originalSource:`{
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
}`,...$.parameters?.docs?.source},description:{story:`Interactive demo with real SpeechRecognition.

Note: SpeechRecognition may not work in Storybook's iframe.
For full testing, open this story in a standalone browser tab.`,...$.parameters?.docs?.description}}},re=[`Idle`,`Listening`,`Speaking`,`Unsupported`,`UnsupportedVisible`,`InSendActions`,`AsSendButton`,`Interactive`]})))()}ie();export{Q as AsSendButton,K as Idle,Z as InSendActions,$ as Interactive,q as Listening,J as Speaking,Y as Unsupported,X as UnsupportedVisible,re as __namedExportsOrder,G as default};