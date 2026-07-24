import{a as e,n as t}from"./rolldown-runtime-DaJ6WEGw.js";import{t as n}from"./react-DvlgmmzG.js";import{a as r,s as i}from"./themeProps-DlHa58hS.js";import{t as a}from"./jsx-runtime-cM__dR4X.js";import{t as o}from"./Button-Cx-mMzJ7.js";import{t as s}from"./Button-D1MmXezA.js";import{t as c}from"./Card-CpjcShRF.js";import{t as l}from"./Card-BP3xkOim.js";import{i as u,n as d,r as f,t as p}from"./ToastViewport-ClClb2ze.js";import{i as m,t as h}from"./Dialog-DwmjwKeu.js";import{c as g,t as _}from"./Stack-mterni5z.js";import{i as v,t as y}from"./Link-RhmeoqiG.js";import{t as b}from"./client-BvQ8Gpf5.js";function x(e){let t=()=>{let t=null;for(let n of j){let r=document.documentElement.getAttribute(n);r==null?e.removeAttribute(n):(e.setAttribute(n,r),n===`data-theme`&&(t=r))}t===`light`||t===`dark`?e.style.colorScheme=t:e.style.removeProperty(`color-scheme`)};t(),new MutationObserver(t).observe(document.documentElement,{attributes:!0,attributeFilter:[...j]})}function S(){if(O)return O;if(typeof document>`u`)throw Error(`useToast: Cannot create fallback viewport during SSR. Wrap your app with <LayerProvider> or <AppShell>.`);A||(A=!0,console.warn(`useToast: No LayerProvider found. Using fallback viewport. Wrap your app with <LayerProvider> or <AppShell> for full control.`));let e=document.createElement(`div`);e.setAttribute(`data-astryx-toast-fallback`,``),document.body.appendChild(e),x(e);let t,n=new Promise(e=>{t=e});k=(0,E.createRoot)(e),k.render((0,D.jsx)(p,{children:(0,D.jsx)(()=>{let e=(0,T.use)(f),n=(0,T.useRef)(!1);return(0,T.useEffect)(()=>{e&&!n.current&&(n.current=!0,O=e,t?.(e))},[e]),null},{})}));let r=[],i={addToast:e=>{O&&O!==i?O.addToast(e):(r.push(e),n.then(e=>{for(let t of r)e.addToast(t);r.length=0}))},removeToast:(e,t)=>{O&&O!==i&&O.removeToast(e,t)},findByUniqueID:e=>{if(O&&O!==i)return O.findByUniqueID(e)}};return O=i,i}function C(){return`astryx-toast-${++M}`}function w(){let e=(0,T.use)(f);return(0,T.useCallback)(t=>{let n=e??S(),r=C(),i={id:r,options:t,createdAt:Date.now()};return n.addToast(i),()=>n.removeToast(r,`manual`)},[e])}var T,E,D,O,k,A,j,M,N=t((()=>{T=e(n(),1),E=e(b(),1),i(),u(),d(),D=a(),O=null,k=null,A=!1,j=[`data-theme`,r(`theme`)],M=0})),P=t((()=>{N(),d()}));function F({onClose:e}){let t=w();return(0,L.jsxs)(g,{gap:3,children:[(0,L.jsx)(`p`,{children:`This dialog has its own toast viewport. Toasts fired here render inside the dialog, above its overlay.`}),(0,L.jsxs)(g,{direction:`horizontal`,gap:2,wrap:`wrap`,children:[(0,L.jsx)(o,{label:`Close`,variant:`secondary`,onClick:e}),(0,L.jsx)(o,{label:`Show toast`,onClick:()=>{t({body:`Toast from inside the dialog!`})}}),(0,L.jsx)(o,{label:`Error toast`,variant:`destructive`,onClick:()=>{t({body:`Something went wrong.`,type:`error`})}})]})]})}var I,L,R,z,B,V,H,U,W,G,K,q,J;t((()=>{I=e(n()),P(),s(),y(),l(),_(),h(),L=a(),R={title:`Core/Toast`,tags:[`autodocs`],parameters:{docs:{description:{component:"Imperative toast notification system. Use `useToast()` to show transient feedback messages. Works with or without `LayerProvider`."}}}},z={render:function(){let e=w();return(0,L.jsx)(o,{label:`Show toast`,onClick:()=>e({body:`This is an info toast`})})}},B={render:function(){let e=w();return(0,L.jsx)(g,{direction:`horizontal`,gap:2,children:[`info`,`error`].map(t=>(0,L.jsx)(o,{label:t,variant:t===`error`?`destructive`:`secondary`,onClick:()=>e({body:`This is a ${t} notification.`,type:t})},t))})},parameters:{docs:{description:{story:`Two toast types: info (default) and error. Error toasts persist until dismissed.`}}}},V={render:function(){let e=w();return(0,L.jsxs)(g,{direction:`horizontal`,gap:2,children:[(0,L.jsx)(o,{label:`With button`,onClick:()=>e({body:`Item deleted`,isAutoHide:!1,endContent:(0,L.jsx)(o,{label:`Undo`,variant:`secondary`,size:`sm`,onClick:()=>console.log(`Undo!`)})})}),(0,L.jsx)(o,{label:`With link`,variant:`secondary`,onClick:()=>e({body:`Your report is ready.`,isAutoHide:!1,endContent:(0,L.jsx)(v,{href:`#`,hasUnderline:!0,children:`View report`})})})]})},parameters:{docs:{description:{story:"Use `endContent` for trailing actions: buttons, links, or any content."}}}},H={render:function(){let e=w();return(0,L.jsx)(o,{label:`Trigger error`,variant:`destructive`,onClick:()=>e({body:`Check your network connection and try again.`,type:`error`})})},parameters:{docs:{description:{story:"Error toasts default to `isAutoHide: false`; they persist until the user dismisses them."}}}},U={render:function(){let e=w(),t=(0,I.useRef)(null);return(0,L.jsxs)(g,{direction:`horizontal`,gap:2,children:[(0,L.jsx)(o,{label:`Show persistent toast`,onClick:()=>{t.current=e({body:`Uploading...`,isAutoHide:!1})}}),(0,L.jsx)(o,{label:`Dismiss`,variant:`secondary`,onClick:()=>{t.current?.(),t.current=null}})]})},parameters:{docs:{description:{story:"`useToast()` returns a dismiss function. Call it to remove the toast programmatically."}}}},W={render:function(){let e=w();return(0,L.jsxs)(g,{direction:`horizontal`,gap:2,children:[(0,L.jsx)(o,{label:`Offline (ignore)`,onClick:()=>e({body:`You are offline`,uniqueID:`offline`,collisionBehavior:`ignore`,isAutoHide:!1})}),(0,L.jsx)(o,{label:`Progress (overwrite)`,variant:`secondary`,onClick:()=>e({body:`Uploading... ${Math.floor(Math.random()*100)}%`,uniqueID:`upload-progress`,collisionBehavior:`overwrite`,isAutoHide:!1})})]})},parameters:{docs:{description:{story:"`uniqueID` prevents duplicate toasts. `ignore` keeps the existing; `overwrite` replaces it."}}}},G={render:function(){let e=w(),t=(0,I.useRef)(0);return(0,L.jsx)(o,{label:`Add toast`,onClick:()=>{t.current++;let n=[`info`,`error`],r=n[t.current%n.length];e({body:`Toast #${t.current} — ${r} notification.`,type:r})}})},parameters:{docs:{description:{story:`Multiple toasts stack vertically. Default max visible is 5.`}}}},K={render:function(){let e=w();return(0,L.jsx)(c,{padding:4,children:(0,L.jsxs)(g,{gap:2,children:[(0,L.jsx)(`p`,{style:{margin:0,fontSize:14},children:`No LayerProvider: the hook creates a fallback viewport on document.body automatically.`}),(0,L.jsx)(o,{label:`Show toast`,onClick:()=>e({body:`Works without a provider!`})})]})})},parameters:{docs:{description:{story:"`useToast()` works without a provider. It lazily mounts a fallback viewport on first call."}}}},q={render:function(){let[e,t]=(0,I.useState)(!1);return(0,L.jsxs)(g,{gap:2,children:[(0,L.jsx)(o,{label:`Open dialog`,onClick:()=>t(!0)}),(0,L.jsx)(m,{isOpen:e,onOpenChange:()=>t(!1),children:(0,L.jsx)(p,{isTopLayer:!1,children:(0,L.jsx)(F,{onClose:()=>t(!1)})})})]})},parameters:{docs:{description:{story:"Dialog with its own `ToastViewport`: toasts render inside the dialog's top layer context and appear above the dialog overlay."}}}},z.parameters={...z.parameters,docs:{...z.parameters?.docs,source:{originalSource:`{
  render: function DefaultStory() {
    const toast = useToast();
    return <Button label="Show toast" onClick={() => toast({
      body: 'This is an info toast'
    })} />;
  }
}`,...z.parameters?.docs?.source}}},B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
  render: function TypesStory() {
    const toast = useToast();
    const types: ToastType[] = ['info', 'error'];
    return <Stack direction="horizontal" gap={2}>
        {types.map(type => <Button key={type} label={type} variant={type === 'error' ? 'destructive' : 'secondary'} onClick={() => toast({
        body: \`This is a \${type} notification.\`,
        type
      })} />)}
      </Stack>;
  },
  parameters: {
    docs: {
      description: {
        story: 'Two toast types: info (default) and error. Error toasts persist until dismissed.'
      }
    }
  }
}`,...B.parameters?.docs?.source}}},V.parameters={...V.parameters,docs:{...V.parameters?.docs,source:{originalSource:`{
  render: function WithActionStory() {
    const toast = useToast();
    return <Stack direction="horizontal" gap={2}>
        <Button label="With button" onClick={() => toast({
        body: 'Item deleted',
        isAutoHide: false,
        endContent: <Button label="Undo" variant="secondary" size="sm" onClick={() => console.log('Undo!')} />
      })} />
        <Button label="With link" variant="secondary" onClick={() => toast({
        body: 'Your report is ready.',
        isAutoHide: false,
        endContent: <Link href="#" hasUnderline>
                  View report
                </Link>
      })} />
      </Stack>;
  },
  parameters: {
    docs: {
      description: {
        story: 'Use \`endContent\` for trailing actions: buttons, links, or any content.'
      }
    }
  }
}`,...V.parameters?.docs?.source}}},H.parameters={...H.parameters,docs:{...H.parameters?.docs,source:{originalSource:`{
  render: function ErrorPersistsStory() {
    const toast = useToast();
    return <Button label="Trigger error" variant="destructive" onClick={() => toast({
      body: 'Check your network connection and try again.',
      type: 'error'
    })} />;
  },
  parameters: {
    docs: {
      description: {
        story: 'Error toasts default to \`isAutoHide: false\`; they persist until the user dismisses them.'
      }
    }
  }
}`,...H.parameters?.docs?.source}}},U.parameters={...U.parameters,docs:{...U.parameters?.docs,source:{originalSource:`{
  render: function ProgrammaticDismissStory() {
    const toast = useToast();
    const dismissRef = useRef<(() => void) | null>(null);
    return <Stack direction="horizontal" gap={2}>
        <Button label="Show persistent toast" onClick={() => {
        dismissRef.current = toast({
          body: 'Uploading...',
          isAutoHide: false
        });
      }} />
        <Button label="Dismiss" variant="secondary" onClick={() => {
        dismissRef.current?.();
        dismissRef.current = null;
      }} />
      </Stack>;
  },
  parameters: {
    docs: {
      description: {
        story: '\`useToast()\` returns a dismiss function. Call it to remove the toast programmatically.'
      }
    }
  }
}`,...U.parameters?.docs?.source}}},W.parameters={...W.parameters,docs:{...W.parameters?.docs,source:{originalSource:`{
  render: function DeduplicationStory() {
    const toast = useToast();
    return <Stack direction="horizontal" gap={2}>
        <Button label="Offline (ignore)" onClick={() => toast({
        body: 'You are offline',
        uniqueID: 'offline',
        collisionBehavior: 'ignore',
        isAutoHide: false
      })} />
        <Button label="Progress (overwrite)" variant="secondary" onClick={() => toast({
        body: \`Uploading... \${Math.floor(Math.random() * 100)}%\`,
        uniqueID: 'upload-progress',
        collisionBehavior: 'overwrite',
        isAutoHide: false
      })} />
      </Stack>;
  },
  parameters: {
    docs: {
      description: {
        story: '\`uniqueID\` prevents duplicate toasts. \`ignore\` keeps the existing; \`overwrite\` replaces it.'
      }
    }
  }
}`,...W.parameters?.docs?.source}}},G.parameters={...G.parameters,docs:{...G.parameters?.docs,source:{originalSource:`{
  render: function StackingStory() {
    const toast = useToast();
    const countRef = useRef(0);
    return <Button label="Add toast" onClick={() => {
      countRef.current++;
      const types: ToastType[] = ['info', 'error'];
      const type = types[countRef.current % types.length];
      toast({
        body: \`Toast #\${countRef.current} — \${type} notification.\`,
        type
      });
    }} />;
  },
  parameters: {
    docs: {
      description: {
        story: 'Multiple toasts stack vertically. Default max visible is 5.'
      }
    }
  }
}`,...G.parameters?.docs?.source}}},K.parameters={...K.parameters,docs:{...K.parameters?.docs,source:{originalSource:`{
  render: function NoProviderStory() {
    const toast = useToast();
    return <Card padding={4}>
        <Stack gap={2}>
          <p style={{
          margin: 0,
          fontSize: 14
        }}>
            No LayerProvider: the hook creates a fallback viewport on
            document.body automatically.
          </p>
          <Button label="Show toast" onClick={() => toast({
          body: 'Works without a provider!'
        })} />
        </Stack>
      </Card>;
  },
  parameters: {
    docs: {
      description: {
        story: '\`useToast()\` works without a provider. It lazily mounts a fallback viewport on first call.'
      }
    }
  }
}`,...K.parameters?.docs?.source}}},q.parameters={...q.parameters,docs:{...q.parameters?.docs,source:{originalSource:`{
  render: function ToastOverDialogStory() {
    const [isOpen, setIsOpen] = useState(false);
    return <Stack gap={2}>
        <Button label="Open dialog" onClick={() => setIsOpen(true)} />
        <Dialog isOpen={isOpen} onOpenChange={() => setIsOpen(false)}>
          <ToastViewport isTopLayer={false}>
            <DialogToastContent onClose={() => setIsOpen(false)} />
          </ToastViewport>
        </Dialog>
      </Stack>;
  },
  parameters: {
    docs: {
      description: {
        story: "Dialog with its own \`ToastViewport\`: toasts render inside the dialog's top layer context and appear above the dialog overlay."
      }
    }
  }
}`,...q.parameters?.docs?.source}}},J=[`Default`,`Types`,`WithAction`,`ErrorPersists`,`ProgrammaticDismiss`,`Deduplication`,`Stacking`,`NoProvider`,`ToastOverDialog`]}))();export{W as Deduplication,z as Default,H as ErrorPersists,K as NoProvider,U as ProgrammaticDismiss,G as Stacking,q as ToastOverDialog,B as Types,V as WithAction,J as __namedExportsOrder,R as default};