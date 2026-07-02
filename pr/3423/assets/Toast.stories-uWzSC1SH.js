import{ah as d,g as x,a1 as t,h as D,B as s}from"./iframe-FpdBIrKz.js";import{c as A}from"./client-lVrwuNYr.js";import{L as P}from"./Link-_aC6lmCb.js";import{C as B}from"./Card-NJOPrOtR.js";import{S as u}from"./Stack-DEYywiUi.js";import{D as R}from"./Dialog-CK4cXIAP.js";import"./preload-helper-Ct5FWWRu.js";import"./index-Bu7kn85p.js";import"./computeTargetAndRel-BlG0ENK0.js";import"./useInteractiveRole-zGikYmYy.js";import"./container.stylex-uilBL6DE.js";import"./padding.stylex-ENVgbwco.js";import"./stack.stylex-BlarxY2N.js";import"./useScrollLock-BcNYfqTl.js";let i=null,C=null,w=!1;function I(){if(i)return i;if(typeof document>"u")throw new Error("useToast: Cannot create fallback viewport during SSR. Wrap your app with <LayerProvider> or <AppShell>.");w||(w=!0,console.warn("useToast: No LayerProvider found. Using fallback viewport. Wrap your app with <LayerProvider> or <AppShell> for full control."));const o=document.createElement("div");o.setAttribute("data-astryx-toast-fallback",""),document.body.appendChild(o);let e;const r=new Promise(a=>{e=a}),n=()=>{const a=d.use(x),f=d.useRef(!1);return d.useEffect(()=>{a&&!f.current&&(f.current=!0,i=a,e?.(a))},[a]),null};C=A.createRoot(o),C.render(t.jsx(D,{children:t.jsx(n,{})}));const c=[],p={addToast:a=>{i&&i!==p?i.addToast(a):(c.push(a),r.then(f=>{for(const j of c)f.addToast(j);c.length=0}))},removeToast:(a,f)=>{i&&i!==p&&i.removeToast(a,f)},findByUniqueID:a=>{if(i&&i!==p)return i.findByUniqueID(a)}};return i=p,p}let O=0;function E(){return`astryx-toast-${++O}`}function l(){const o=d.use(x);return d.useCallback(r=>{const n=o??I(),c=E(),p={id:c,options:r,createdAt:Date.now()};return n.addToast(p),()=>n.removeToast(c,"manual")},[o])}const K={title:"Core/Toast",tags:["autodocs"],parameters:{docs:{description:{component:"Imperative toast notification system. Use `useToast()` to show transient feedback messages. Works with or without `LayerProvider`."}}}},m={render:function(){const e=l();return t.jsx(s,{label:"Show toast",onClick:()=>e({body:"This is an info toast"})})}},y={render:function(){const e=l(),r=["info","error"];return t.jsx(u,{direction:"horizontal",gap:2,children:r.map(n=>t.jsx(s,{label:n,variant:n==="error"?"destructive":"secondary",onClick:()=>e({body:`This is a ${n} notification.`,type:n})},n))})},parameters:{docs:{description:{story:"Two toast types: info (default) and error. Error toasts persist until dismissed."}}}},h={render:function(){const e=l();return t.jsxs(u,{direction:"horizontal",gap:2,children:[t.jsx(s,{label:"With button",onClick:()=>e({body:"Item deleted",isAutoHide:!1,endContent:t.jsx(s,{label:"Undo",variant:"secondary",size:"sm",onClick:()=>console.log("Undo!")})})}),t.jsx(s,{label:"With link",variant:"secondary",onClick:()=>e({body:"Your report is ready.",isAutoHide:!1,endContent:t.jsx(P,{href:"#",hasUnderline:!0,children:"View report"})})})]})},parameters:{docs:{description:{story:"Use `endContent` for trailing actions: buttons, links, or any content."}}}},g={render:function(){const e=l();return t.jsx(s,{label:"Trigger error",variant:"destructive",onClick:()=>e({body:"Check your network connection and try again.",type:"error"})})},parameters:{docs:{description:{story:"Error toasts default to `isAutoHide: false`; they persist until the user dismisses them."}}}},k={render:function(){const e=l(),r=d.useRef(null);return t.jsxs(u,{direction:"horizontal",gap:2,children:[t.jsx(s,{label:"Show persistent toast",onClick:()=>{r.current=e({body:"Uploading...",isAutoHide:!1})}}),t.jsx(s,{label:"Dismiss",variant:"secondary",onClick:()=>{r.current?.(),r.current=null}})]})},parameters:{docs:{description:{story:"`useToast()` returns a dismiss function. Call it to remove the toast programmatically."}}}},b={render:function(){const e=l();return t.jsxs(u,{direction:"horizontal",gap:2,children:[t.jsx(s,{label:"Offline (ignore)",onClick:()=>e({body:"You are offline",uniqueID:"offline",collisionBehavior:"ignore",isAutoHide:!1})}),t.jsx(s,{label:"Progress (overwrite)",variant:"secondary",onClick:()=>e({body:`Uploading... ${Math.floor(Math.random()*100)}%`,uniqueID:"upload-progress",collisionBehavior:"overwrite",isAutoHide:!1})})]})},parameters:{docs:{description:{story:"`uniqueID` prevents duplicate toasts. `ignore` keeps the existing; `overwrite` replaces it."}}}},v={render:function(){const e=l(),r=d.useRef(0);return t.jsx(s,{label:"Add toast",onClick:()=>{r.current++;const n=["info","error"],c=n[r.current%n.length];e({body:`Toast #${r.current} — ${c} notification.`,type:c})}})},parameters:{docs:{description:{story:"Multiple toasts stack vertically. Default max visible is 5."}}}},T={render:function(){const e=l();return t.jsx(B,{padding:4,children:t.jsxs(u,{gap:2,children:[t.jsx("p",{style:{margin:0,fontSize:14},children:"No LayerProvider: the hook creates a fallback viewport on document.body automatically."}),t.jsx(s,{label:"Show toast",onClick:()=>e({body:"Works without a provider!"})})]})})},parameters:{docs:{description:{story:"`useToast()` works without a provider. It lazily mounts a fallback viewport on first call."}}}},S={render:function(){const[e,r]=d.useState(!1);return t.jsxs(u,{gap:2,children:[t.jsx(s,{label:"Open dialog",onClick:()=>r(!0)}),t.jsx(R,{isOpen:e,onOpenChange:()=>r(!1),children:t.jsx(D,{isTopLayer:!1,children:t.jsx(U,{onClose:()=>r(!1)})})})]})},parameters:{docs:{description:{story:"Dialog with its own `ToastViewport`: toasts render inside the dialog's top layer context and appear above the dialog overlay."}}}};function U({onClose:o}){const e=l();return t.jsxs(u,{gap:3,children:[t.jsx("p",{children:"This dialog has its own toast viewport. Toasts fired here render inside the dialog, above its overlay."}),t.jsxs(u,{direction:"horizontal",gap:2,wrap:"wrap",children:[t.jsx(s,{label:"Close",variant:"secondary",onClick:o}),t.jsx(s,{label:"Show toast",onClick:()=>{e({body:"Toast from inside the dialog!"})}}),t.jsx(s,{label:"Error toast",variant:"destructive",onClick:()=>{e({body:"Something went wrong.",type:"error"})}})]})]})}m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  render: function DefaultStory() {
    const toast = useToast();
    return <Button label="Show toast" onClick={() => toast({
      body: 'This is an info toast'
    })} />;
  }
}`,...m.parameters?.docs?.source}}};y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
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
}`,...y.parameters?.docs?.source}}};h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
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
}`,...h.parameters?.docs?.source}}};g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
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
}`,...g.parameters?.docs?.source}}};k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
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
}`,...k.parameters?.docs?.source}}};b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
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
}`,...b.parameters?.docs?.source}}};v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
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
}`,...v.parameters?.docs?.source}}};T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
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
}`,...T.parameters?.docs?.source}}};S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
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
}`,...S.parameters?.docs?.source}}};const Q=["Default","Types","WithAction","ErrorPersists","ProgrammaticDismiss","Deduplication","Stacking","NoProvider","ToastOverDialog"];export{b as Deduplication,m as Default,g as ErrorPersists,T as NoProvider,k as ProgrammaticDismiss,v as Stacking,S as ToastOverDialog,y as Types,h as WithAction,Q as __namedExportsOrder,K as default};
