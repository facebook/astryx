import{ah as r,a1 as s,a6 as nt,B as dt,I as pt,af as mt,y as gt}from"./iframe-DVtWfngO.js";import{C as ot,a as ft}from"./ChatComposer-CjJzqmY8.js";import"./preload-helper-Ct5FWWRu.js";import"./index-BkVtLrZ4.js";import"./index-DpWozXzv.js";import"./usePopover-BxBI8mnS.js";import"./useFocusTrap-B1aMnadM.js";import"./Badge-CTYoJcGN.js";import"./HoverCard-CeOt_jGb.js";import"./ChatContext-CNxxfxnI.js";function rt(){return typeof window>"u"?null:window.SpeechRecognition??window.webkitSpeechRecognition??null}async function ht(c){try{let i=function(){n.getByteFrequencyData(e),R++;for(let t=0;t<e.length;t++){const o=e[t]/255;o>p[t]&&(p[t]=o)}},g=function(t){const o=e[t]/255;return R<w?0:Math.max(0,o-p[t]*1.1)};const v=await navigator.mediaDevices.getUserMedia({audio:!0}),h=c(),d=h.createMediaStreamSource(v),n=h.createAnalyser();n.fftSize=256,n.smoothingTimeConstant=.5,d.connect(n);const e=new Uint8Array(n.frequencyBinCount),p=new Float32Array(n.frequencyBinCount);let R=0;const w=60;return{calibrate:i,getVolume:()=>{n.getByteFrequencyData(e),R<w&&i();let t=0;for(let o=0;o<e.length;o++)t+=g(o);return t/e.length},getBands:t=>{n.getByteFrequencyData(e),R<w&&i();const o=[],b=[3,6,11,18,e.length],C=t<=b.length?b.slice(0,t):b;let f=1;for(let y=0;y<C.length;y++){const S=C[y];let x=0;for(let m=f;m<S;m++)x+=g(m);o.push(x/(S-f)),f=S}return o},getRawBands:t=>{n.getByteFrequencyData(e);const o=[],b=[3,6,11,18,e.length],C=t<=b.length?b.slice(0,t):b;let f=1;for(let y=0;y<C.length;y++){const S=C[y];let x=0;for(let m=f;m<S;m++)x+=e[m]/255;o.push(x/(S-f)),f=S}return o},cleanup:()=>{d.disconnect();for(const t of v.getTracks())t.stop()}}}catch{return null}}let U=null;function bt(){return(!U||U.state==="closed")&&(U=new AudioContext),U.state==="suspended"&&U.resume(),U}function yt(c={}){const{lang:i,continuous:g=!0,interimResults:v=!0,onTranscript:h,onResult:d,onError:n,onStart:e,onEnd:p,audioContext:R,transformTranscript:w}=c,t=r.useCallback(()=>R??bt(),[R]),o=r.useMemo(()=>rt()!=null,[]),[k,b]=r.useState(!1),[C,f]=r.useState(!1),[y,S]=r.useState(0),[x,m]=r.useState([0,0,0,0,0]),[V,E]=r.useState([0,0,0,0,0]),[M,F]=r.useState(""),T=r.useRef(null),Q=r.useRef(t);Q.current=t;const I=r.useRef(null),q=r.useRef(0),B=r.useRef({onTranscript:h,onResult:d,onError:n,onStart:e,onEnd:p,transformTranscript:w});B.current={onTranscript:h,onResult:d,onError:n,onStart:e,onEnd:p,transformTranscript:w},r.useEffect(()=>()=>{T.current?.abort(),T.current=null,I.current?.cleanup(),I.current=null,cancelAnimationFrame(q.current)},[]);const N=r.useCallback(()=>{const u=()=>{const a=I.current;a&&(S(a.getVolume()),m(a.getBands(5)),E(a.getRawBands(5))),q.current=requestAnimationFrame(u)};q.current=requestAnimationFrame(u)},[]),L=r.useCallback(()=>{cancelAnimationFrame(q.current),S(0),m([0,0,0,0,0]),E([0,0,0,0,0]),I.current?.cleanup(),I.current=null},[]),j=r.useCallback(()=>{const u=rt();if(!u)return;T.current?.abort();const a=new u;a.lang=i??navigator.language,a.continuous=g,a.interimResults=v,a.onstart=()=>{b(!0),B.current.onStart?.(),ht(Q.current).then(A=>{A&&(I.current=A,N())})},a.onend=()=>{b(!1),f(!1),F(""),L(),B.current.onEnd?.()},a.onspeechstart=()=>{f(!0)},a.onspeechend=()=>{f(!1)},a.onresult=A=>{let P="";for(let _=A.resultIndex;_<A.results.length;_++){const st=A.results[_];let $=st[0].transcript;B.current.transformTranscript&&($=B.current.transformTranscript($)),st.isFinal?(B.current.onResult?.($),B.current.onTranscript?.($,!0),F("")):P+=$}P&&(F(P),B.current.onTranscript?.(P,!1))},a.onerror=A=>{B.current.onError?.({error:A.error,message:A.message})},a.onnomatch=()=>{B.current.onError?.({error:"no-speech",message:"No speech was detected."})},T.current=a,a.start()},[i,g,v,N,L]),H=r.useCallback(()=>{T.current?.stop()},[]),et=r.useCallback(()=>{T.current?.abort(),L()},[L]),l=r.useCallback(()=>{k?H():j()},[k,j,H]);return{isSupported:o,isListening:k,isSpeaking:C,volume:y,bands:x,rawBands:V,interimTranscript:M,start:j,stop:H,abort:et,toggle:l}}async function St(c){try{let i=function(){n.getByteFrequencyData(e),R++;for(let t=0;t<e.length;t++){const o=e[t]/255;o>p[t]&&(p[t]=o)}},g=function(t){const o=e[t]/255;return R<w?0:Math.max(0,o-p[t]*1.1)};const v=await navigator.mediaDevices.getUserMedia({audio:!0}),h=c(),d=h.createMediaStreamSource(v),n=h.createAnalyser();n.fftSize=256,n.smoothingTimeConstant=.5,d.connect(n);const e=new Uint8Array(n.frequencyBinCount),p=new Float32Array(n.frequencyBinCount);let R=0;const w=60;return{calibrate:i,getVolume:()=>{n.getByteFrequencyData(e),R<w&&i();let t=0;for(let o=0;o<e.length;o++)t+=g(o);return t/e.length},getBands:t=>{n.getByteFrequencyData(e),R<w&&i();const o=[],b=[3,6,11,18,e.length],C=t<=b.length?b.slice(0,t):b;let f=1;for(let y=0;y<C.length;y++){const S=C[y];let x=0;for(let m=f;m<S;m++)x+=g(m);o.push(x/(S-f)),f=S}return o},getRawBands:t=>{n.getByteFrequencyData(e);const o=[],b=[3,6,11,18,e.length],C=t<=b.length?b.slice(0,t):b;let f=1;for(let y=0;y<C.length;y++){const S=C[y];let x=0;for(let m=f;m<S;m++)x+=e[m]/255;o.push(x/(S-f)),f=S}return o},cleanup:()=>{d.disconnect();for(const t of v.getTracks())t.stop()}}}catch{return null}}let z=null;function xt(){return(!z||z.state==="closed")&&(z=new AudioContext),z.state==="suspended"&&z.resume(),z}const at=typeof navigator<"u"&&/iPad|iPhone|iPod/.test(navigator.userAgent);function tt(c,i,g,v=.25){try{const h=g(),d=h.currentTime,n=c<200?.18:.06,e=h.createOscillator(),p=h.createGain();e.type="sine",e.frequency.setValueAtTime(c*1.3,d+i),e.frequency.exponentialRampToValueAtTime(c,d+i+.01),e.frequency.exponentialRampToValueAtTime(c*.93,d+i+n),p.gain.setValueAtTime(.001,d),p.gain.setValueAtTime(v,d+i),p.gain.exponentialRampToValueAtTime(v*.2,d+i+n*.12),p.gain.exponentialRampToValueAtTime(.001,d+i+n),e.connect(p),p.connect(h.destination),e.start(d+i),e.stop(d+i+n)}catch{}}function vt(c){at||(tt(392,0,c),tt(523,.07,c))}function Ct(c){at||(tt(523,0,c),tt(392,.07,c))}function Rt(c={}){const{lang:i,continuous:g,interimResults:v,transformTranscript:h,onTranscript:d,onResult:n,onError:e,onStart:p,onEnd:R,hasSounds:w=!1,audioContext:t,inputRef:o}=c,k=r.useCallback(()=>t??xt(),[t]),[b,C]=r.useState(0),[f,y]=r.useState([0,0,0,0,0]),[S,x]=r.useState([0,0,0,0,0]),m=r.useRef([]),V=r.useRef(k);V.current=k;const E=r.useRef(null),M=r.useRef(0),F=r.useRef(null),T=r.useRef({onTranscriptProp:d,onResultProp:n,onStartProp:p,onEndProp:R});T.current={onTranscriptProp:d,onResultProp:n,onStartProp:p,onEndProp:R};const Q=r.useCallback(()=>{const l=()=>{const u=E.current;if(u){const a=u.getVolume();C(a);const A=m.current;A.push(a),A.length>30&&A.shift(),y(u.getBands(5)),x(u.getRawBands(5))}M.current=requestAnimationFrame(l)};M.current=requestAnimationFrame(l)},[]),I=r.useCallback(()=>{cancelAnimationFrame(M.current),C(0),y([0,0,0,0,0]),x([0,0,0,0,0]),m.current=[],E.current?.cleanup(),E.current=null},[]),q=r.useCallback(()=>{const l=document.activeElement;return l?.getAttribute("contenteditable")==="true"?l:document.querySelector('.astryx-chat-composer-input [contenteditable="true"], [role="textbox"][contenteditable="true"]')},[]),B=r.useCallback(()=>{const l=q();if(!l)return;const u=document.createElement("span");u.setAttribute("data-astryx-dictation-interim",""),u.contentEditable="false",u.style.color="var(--color-text-disabled, #999)",u.style.fontStyle="italic",u.style.opacity="0.7",u.style.pointerEvents="none",l.appendChild(u),F.current=u,l.dispatchEvent(new Event("input",{bubbles:!0}))},[q]),N=r.useCallback(()=>{const l=F.current;if(l?.isConnected)try{l.remove()}catch{}F.current=null},[]),L=r.useCallback(l=>{let u=l;h&&(u=h(u));const a=m.current;return(a.length>0?a.reduce((P,_)=>P+_,0)/a.length:0)>=.15&&a.length>=10&&(u=u.toUpperCase()),u},[h]);r.useEffect(()=>()=>{E.current?.cleanup(),E.current=null,cancelAnimationFrame(M.current)},[]);const j=yt({lang:i,continuous:g,interimResults:v,transformTranscript:L,onTranscript:(l,u)=>{if(o)if(u){N();const a=o.current;a&&(a.focus(),a.insertText(l+" ")),T.current.onResultProp?.(l),B()}else{const a=F.current;a?a.textContent=l:(B(),F.current&&(F.current.textContent=l))}T.current.onTranscriptProp?.(l,u)},onResult:o?void 0:n,onError:e,onStart:()=>{w&&vt(V.current),St(V.current).then(l=>{l&&(E.current=l,Q())}),o&&B(),T.current.onStartProp?.()},onEnd:()=>{if(I(),w&&Ct(V.current),o){N();const l=q();l&&l.dispatchEvent(new Event("input",{bubbles:!0}))}T.current.onEndProp?.()}}),H=j.abort,et=r.useCallback(()=>{H(),I()},[H,I]);return{isSupported:j.isSupported,isListening:j.isListening,isSpeaking:j.isSpeaking,interimTranscript:j.interimTranscript,volume:b,bands:f,rawBands:S,start:j.start,stop:j.stop,abort:et,toggle:j.toggle}}const wt={wrapper:{kVAEAm:"astryx1n2onr6",k1xSpc:"astryx3nfvp2",kGNEyG:"astryx6s0dn4",kjj79g:"astryxl56j7k",$$css:!0}},Bt=5,it=.08,At={sm:{barWidth:2,barGap:1.5,barMaxHeight:14},md:{barWidth:2.5,barGap:2,barMaxHeight:18}};function D({ref:c,dictation:i,size:g="md",isHiddenWhenUnsupported:v=!0,label:h,xstyle:d,className:n,style:e}){if(v&&!i.isSupported)return null;const{isListening:p,bands:R,volume:w}=i,t=h??(p?"Stop dictation":"Start dictation"),o=R.map(x=>Math.min(Math.pow(x/.2,.5),1)),k=w>=.2,b=k?Math.min((w-.2)/.1,1)*60:0,C=k?`hsl(calc(var(--accent-hue, 210) + ${b}), 80%, 50%)`:`var(--color-accent, ${gt["--color-accent"]})`,{barWidth:f,barGap:y,barMaxHeight:S}=At[g];return s.jsxs("span",{ref:c,...nt(mt(wt.wrapper,d),n,e),children:[p&&s.jsx("span",{"aria-hidden":!0,...nt({className:"astryx10l6tqk astryx78zum5 astryx6s0dn4 astryxl56j7k astryx47corl astryx1vjfegm"},{style:{gap:y,height:S}}),children:o.slice(0,Bt).map((x,m)=>{const V=it+x*(1-it);return s.jsx("span",{...nt({className:"astryxjspbzw astryx1g0ag68 astryx18dpk69 astryx11bq7d0 astryx9lcvmn"},{style:{width:f,height:"100%",backgroundColor:C,transform:`scaleY(${V})`}})},m)})}),s.jsx(dt,{label:t,"aria-label":t,variant:"ghost",size:g,icon:p?void 0:s.jsx(pt,{icon:"microphone",size:g}),isIconOnly:!0,onClick:i.toggle})]})}D.displayName="ChatDictationButton";D.__docgenInfo={description:"Microphone button for voice input in a chat composer.\nRequires the return value of useChatDictation.\n\n@example\n```\n<ChatDictationButton dictation={dictation} />\n```",methods:[],displayName:"ChatDictationButton",props:{xstyle:{required:!1,tsType:{name:"StyleXStyles"},description:"StyleX styles created via `stylex.create()`. Merged with the component's\nbase styles inside a single `stylex.props()` call for optimal deduplication.\n\n@example\n```\nconst overrides = stylex.create({ root: { marginBottom: 8 } });\n<Component xstyle={overrides.root} />\n```"},ref:{required:!1,tsType:{name:"ReactRef",raw:"React.Ref<HTMLSpanElement>",elements:[{name:"HTMLSpanElement"}]},description:""},dictation:{required:!0,tsType:{name:"UseSpeechRecognitionReturn"},description:"The return value from useChatDictation or useSpeechRecognition."},size:{required:!1,tsType:{name:"union",raw:"'sm' | 'md'",elements:[{name:"literal",value:"'sm'"},{name:"literal",value:"'md'"}]},description:'Button size. @default "md"',defaultValue:{value:"'md'",computed:!1}},isHiddenWhenUnsupported:{required:!1,tsType:{name:"boolean"},description:"Hide the button when SpeechRecognition is not supported. @default true",defaultValue:{value:"true",computed:!1}},label:{required:!1,tsType:{name:"string"},description:"Accessible label override."}},composes:["Omit"]};const ct={volume:0,rawBands:[0,0,0,0,0],bands:[0,0,0,0,0],isSupported:!0,isListening:!1,isSpeaking:!1,interimTranscript:"",start:()=>{},stop:()=>{},abort:()=>{},toggle:()=>{}},lt={volume:.05,rawBands:[.08,.06,.04,.02,.01],bands:[.08,.06,.04,.02,.01],isSupported:!0,isListening:!0,isSpeaking:!1,interimTranscript:"",start:()=>{},stop:()=>{},abort:()=>{},toggle:()=>{}},kt={volume:.12,rawBands:[.15,.12,.08,.05,.02],bands:[.15,.12,.08,.05,.02],isSupported:!0,isListening:!0,isSpeaking:!0,interimTranscript:"hello world",start:()=>{},stop:()=>{},abort:()=>{},toggle:()=>{}},ut={volume:0,rawBands:[0,0,0,0,0],bands:[0,0,0,0,0],isSupported:!1,isListening:!1,isSpeaking:!1,interimTranscript:"",start:()=>{},stop:()=>{},abort:()=>{},toggle:()=>{}},Ht={title:"Core/ChatDictation",component:D,tags:["autodocs"],parameters:{layout:"centered"},decorators:[c=>s.jsx("div",{style:{width:600,padding:40},children:s.jsx(c,{})})]},G={render:()=>s.jsx(D,{dictation:ct})},O={render:()=>s.jsx(D,{dictation:lt})},W={render:()=>s.jsx(D,{dictation:kt})},X={render:()=>s.jsxs("div",{children:[s.jsx("p",{style:{marginBottom:8},children:"Button is hidden when unsupported (nothing below):"}),s.jsx(D,{dictation:ut})]})},Y={render:()=>s.jsx(D,{dictation:ut,isHiddenWhenUnsupported:!1})},Z={render:()=>s.jsx(ot,{onSubmit:c=>console.log("Submit:",c),sendActions:s.jsx(D,{dictation:ct})})},J={render:()=>s.jsx(ot,{onSubmit:c=>console.log("Submit:",c),sendButton:s.jsx(D,{dictation:lt})})},K={render:()=>{const c=r.useRef(null),i=Rt({inputRef:c,hasSounds:!0,onResult:g=>{console.log("Final:",g)}});return s.jsxs("div",{children:[s.jsx(ot,{onSubmit:g=>{console.log("Submit:",g)},input:s.jsx(ft,{handleRef:c}),sendActions:s.jsx(D,{dictation:i})}),i.isListening&&s.jsxs("div",{style:{marginTop:8,display:"flex",alignItems:"center",gap:8},children:[s.jsx("span",{style:{fontSize:12,opacity:.5},children:"Volume:"}),s.jsx("div",{style:{width:120,height:8,backgroundColor:"#eee",borderRadius:4,overflow:"hidden"},children:s.jsx("div",{style:{height:"100%",backgroundColor:i.volume>.3?"#ef4444":"#22c55e",borderRadius:4,transition:"width 0.08s ease-out",width:`${Math.min(i.volume*100*2,100)}%`}})}),s.jsx("span",{style:{fontSize:12,fontFamily:"monospace",opacity:.5},children:i.volume.toFixed(2)})]}),i.isListening&&s.jsxs("div",{style:{marginTop:12},children:[s.jsx("div",{style:{fontSize:12,fontWeight:600,marginBottom:4},children:"Band Debug (raw vs calibrated)"}),s.jsx("div",{style:{display:"flex",gap:8,fontFamily:"monospace",fontSize:11},children:["170-340","340-860","860-1.7k","1.7-3k","3k+"].map((g,v)=>{const h=i.rawBands[v]??0,d=i.bands[v]??0,n=40;return s.jsxs("div",{style:{display:"flex",flexDirection:"column",alignItems:"center",gap:2,flex:1},children:[s.jsxs("div",{style:{display:"flex",gap:2,alignItems:"flex-end",height:n},children:[s.jsx("div",{style:{width:8,backgroundColor:"rgba(200,200,200,0.5)",height:Math.min(h*n*5,n),borderRadius:2}}),s.jsx("div",{style:{width:8,backgroundColor:"#3b82f6",height:Math.min(d*n*5,n),borderRadius:2}})]}),s.jsx("span",{style:{opacity:.5,fontSize:9},children:g}),s.jsxs("span",{style:{opacity:.4},children:["r:",h.toFixed(3)]}),s.jsxs("span",{style:{color:"#3b82f6"},children:["c:",d.toFixed(3)]})]},g)})}),s.jsx("div",{style:{fontSize:10,opacity:.4,marginTop:4},children:"Gray = raw mic, Blue = after noise floor"})]}),!i.isSupported&&s.jsx("p",{style:{marginTop:8,color:"red"},children:"SpeechRecognition is not supported in this browser."})]})}};G.parameters={...G.parameters,docs:{...G.parameters?.docs,source:{originalSource:`{
  render: () => <ChatDictationButton dictation={idleDictation} />
}`,...G.parameters?.docs?.source},description:{story:"Idle state — microphone icon, ready to start dictation",...G.parameters?.docs?.description}}};O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
  render: () => <ChatDictationButton dictation={listeningDictation} />
}`,...O.parameters?.docs?.source},description:{story:"Listening state — pulsing red record indicator",...O.parameters?.docs?.description}}};W.parameters={...W.parameters,docs:{...W.parameters?.docs,source:{originalSource:`{
  render: () => <ChatDictationButton dictation={speakingDictation} />
}`,...W.parameters?.docs?.source},description:{story:"Speaking state — more intense pulse while speech is detected",...W.parameters?.docs?.description}}};X.parameters={...X.parameters,docs:{...X.parameters?.docs,source:{originalSource:`{
  render: () => <div>
      <p style={{
      marginBottom: 8
    }}>
        Button is hidden when unsupported (nothing below):
      </p>
      <ChatDictationButton dictation={unsupportedDictation} />
    </div>
}`,...X.parameters?.docs?.source},description:{story:"Unsupported browser — button hidden by default",...X.parameters?.docs?.description}}};Y.parameters={...Y.parameters,docs:{...Y.parameters?.docs,source:{originalSource:`{
  render: () => <ChatDictationButton dictation={unsupportedDictation} isHiddenWhenUnsupported={false} />
}`,...Y.parameters?.docs?.source},description:{story:"Unsupported browser — button visible when isHiddenWhenUnsupported is false",...Y.parameters?.docs?.description}}};Z.parameters={...Z.parameters,docs:{...Z.parameters?.docs,source:{originalSource:`{
  render: () => <ChatComposer onSubmit={value => console.log('Submit:', value)} sendActions={<ChatDictationButton dictation={idleDictation} />} />
}`,...Z.parameters?.docs?.source},description:{story:"Dictation button in sendActions slot of ChatComposer",...Z.parameters?.docs?.description}}};J.parameters={...J.parameters,docs:{...J.parameters?.docs,source:{originalSource:`{
  render: () => <ChatComposer onSubmit={value => console.log('Submit:', value)} sendButton={<ChatDictationButton dictation={listeningDictation} />} />
}`,...J.parameters?.docs?.source},description:{story:"Dictation button replacing the send button",...J.parameters?.docs?.description}}};K.parameters={...K.parameters,docs:{...K.parameters?.docs,source:{originalSource:`{
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
}`,...K.parameters?.docs?.source},description:{story:`Interactive demo with real SpeechRecognition.

Note: SpeechRecognition may not work in Storybook's iframe.
For full testing, open this story in a standalone browser tab.`,...K.parameters?.docs?.description}}};const Pt=["Idle","Listening","Speaking","Unsupported","UnsupportedVisible","InSendActions","AsSendButton","Interactive"];export{J as AsSendButton,G as Idle,Z as InSendActions,K as Interactive,O as Listening,W as Speaking,X as Unsupported,Y as UnsupportedVisible,Pt as __namedExportsOrder,Ht as default};
