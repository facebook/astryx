import{i as e,s as t}from"./preload-helper-CT_b8DTk.js";import{t as n}from"./react-B7Te67-h.js";import{t as r}from"./jsx-runtime-DqZldVDK.js";import{o as i}from"./useTheme-DZGE0wSZ.js";import{t as a}from"./Button-7X082der.js";import{t as o}from"./Button-9LqxE_eI.js";import{n as s,t as c}from"./Card-DpSdLITS.js";import{a as l,t as u}from"./ToastViewport-uD_s-Fef.js";import{t as d,x as f}from"./theme-CliCdRh7.js";import{i as p,t as m}from"./Dialog-B-YejGvz.js";import{c as h,t as g}from"./Stack-BKfTR9z7.js";import{i as _,t as v}from"./Link-DsP5P32U.js";import{j as y,k as b,l as x,s as S}from"./iframe-Cahu_dTc.js";function C({onClose:e}){let t=y();return(0,E.jsxs)(h,{gap:3,children:[(0,E.jsx)(`p`,{children:`This dialog has its own toast viewport. Toasts fired here render inside the dialog, above its overlay.`}),(0,E.jsxs)(h,{direction:`horizontal`,gap:2,wrap:`wrap`,children:[(0,E.jsx)(a,{label:`Close`,variant:`secondary`,onClick:e}),(0,E.jsx)(a,{label:`Show toast`,onClick:()=>{t({body:`Toast from inside the dialog!`})}}),(0,E.jsx)(a,{label:`Error toast`,variant:`destructive`,onClick:()=>{t({body:`Something went wrong.`,type:`error`})}})]})]})}function w(){return(0,E.jsxs)(h,{gap:2,children:[(0,E.jsx)(l,{type:`info`,body:`Saved to your workspace.`,endContent:(0,E.jsx)(_,{href:`#`,children:`Undo`}),isAutoHide:!1,autoHideDuration:0,onDismiss:z}),(0,E.jsx)(l,{type:`error`,body:`Could not save changes.`,endContent:(0,E.jsx)(_,{href:`#`,children:`Retry`}),isAutoHide:!1,autoHideDuration:0,onDismiss:z})]})}var T,E,D,O,k,A,j,M,N,P,F,I,L,R,z,B,V;e((()=>{T=t(n()),b(),o(),v(),c(),g(),m(),d(),S(),E=r(),D={title:`Core/Toast`,tags:[`autodocs`],parameters:{docs:{description:{component:"Imperative toast notification system. Use `useToast()` to show transient feedback messages. Works with or without `LayerProvider`."}}}},O={render:function(){let e=y();return(0,E.jsx)(a,{label:`Show toast`,onClick:()=>e({body:`This is an info toast`})})}},k={render:function(){let e=y();return(0,E.jsx)(h,{direction:`horizontal`,gap:2,children:[`info`,`error`].map(t=>(0,E.jsx)(a,{label:t,variant:t===`error`?`destructive`:`secondary`,onClick:()=>e({body:`This is a ${t} notification.`,type:t})},t))})},parameters:{docs:{description:{story:`Two toast types: info (default) and error. Error toasts persist until dismissed.`}}}},A={render:function(){let e=y();return(0,E.jsxs)(h,{direction:`horizontal`,gap:2,children:[(0,E.jsx)(a,{label:`With button`,onClick:()=>e({body:`Item deleted`,isAutoHide:!1,endContent:(0,E.jsx)(a,{label:`Undo`,variant:`secondary`,size:`sm`,onClick:()=>console.log(`Undo!`)})})}),(0,E.jsx)(a,{label:`With link`,variant:`secondary`,onClick:()=>e({body:`Your report is ready.`,isAutoHide:!1,endContent:(0,E.jsx)(_,{href:`#`,hasUnderline:!0,children:`View report`})})})]})},parameters:{docs:{description:{story:"Use `endContent` for trailing actions: buttons, links, or any content."}}}},j={render:function(){let e=y();return(0,E.jsx)(a,{label:`Trigger error`,variant:`destructive`,onClick:()=>e({body:`Check your network connection and try again.`,type:`error`})})},parameters:{docs:{description:{story:"Error toasts default to `isAutoHide: false`; they persist until the user dismisses them."}}}},M={render:function(){let e=y(),t=(0,T.useRef)(null);return(0,E.jsxs)(h,{direction:`horizontal`,gap:2,children:[(0,E.jsx)(a,{label:`Show persistent toast`,onClick:()=>{t.current=e({body:`Uploading...`,isAutoHide:!1})}}),(0,E.jsx)(a,{label:`Dismiss`,variant:`secondary`,onClick:()=>{t.current?.(),t.current=null}})]})},parameters:{docs:{description:{story:"`useToast()` returns a dismiss function. Call it to remove the toast programmatically."}}}},N={render:function(){let e=y();return(0,E.jsxs)(h,{direction:`horizontal`,gap:2,children:[(0,E.jsx)(a,{label:`Offline (ignore)`,onClick:()=>e({body:`You are offline`,uniqueID:`offline`,collisionBehavior:`ignore`,isAutoHide:!1})}),(0,E.jsx)(a,{label:`Progress (overwrite)`,variant:`secondary`,onClick:()=>e({body:`Uploading... ${Math.floor(Math.random()*100)}%`,uniqueID:`upload-progress`,collisionBehavior:`overwrite`,isAutoHide:!1})})]})},parameters:{docs:{description:{story:"`uniqueID` prevents duplicate toasts. `ignore` keeps the existing; `overwrite` replaces it."}}}},P={render:function(){let e=y(),t=(0,T.useRef)(0);return(0,E.jsx)(a,{label:`Add toast`,onClick:()=>{t.current++;let n=[`info`,`error`],r=n[t.current%n.length];e({body:`Toast #${t.current} — ${r} notification.`,type:r})}})},parameters:{docs:{description:{story:`Multiple toasts stack vertically. Default max visible is 5.`}}}},F={render:function(){let e=y();return(0,E.jsx)(s,{padding:4,children:(0,E.jsxs)(h,{gap:2,children:[(0,E.jsx)(`p`,{style:{margin:0,fontSize:14},children:`No LayerProvider: the hook creates a fallback viewport on document.body automatically.`}),(0,E.jsx)(a,{label:`Show toast`,onClick:()=>e({body:`Works without a provider!`})})]})})},parameters:{docs:{description:{story:"`useToast()` works without a provider. It lazily mounts a fallback viewport on first call."}}}},I={render:function(){let[e,t]=(0,T.useState)(!1);return(0,E.jsxs)(h,{gap:2,children:[(0,E.jsx)(a,{label:`Open dialog`,onClick:()=>t(!0)}),(0,E.jsx)(p,{isOpen:e,onOpenChange:()=>t(!1),children:(0,E.jsx)(u,{isTopLayer:!1,children:(0,E.jsx)(C,{onClose:()=>t(!1)})})})]})},parameters:{docs:{description:{story:"Dialog with its own `ToastViewport`: toasts render inside the dialog's top layer context and appear above the dialog overlay."}}}},L=i({name:`toast-normal-surface`,extends:x,surfaces:{toast:`normal`}}),R=i({name:`toast-custom-error`,extends:x,onDark:{tokens:{"--color-accent":`#FFD166`}}}),z=()=>{},B={render:function(){return(0,E.jsxs)(h,{gap:4,children:[(0,E.jsxs)(`p`,{children:[`Toast renders on an inverted media surface by default (dark panel in a light app, light panel in a dark app). A theme opts out with`,` `,(0,E.jsxs)(`code`,{children:[`surfaces: `,`{`,` toast: 'normal' `,`}`]}),`, so the toast uses the app's ordinary surface tokens. The error variant always stays on its attention-grabbing dark surface in both. Each column pins an explicit mode so the light/dark inversion is visible side by side.`]}),[`light`,`dark`].map(e=>(0,E.jsxs)(h,{gap:2,children:[(0,E.jsxs)(`strong`,{children:[`Mode: `,e]}),(0,E.jsxs)(h,{direction:`horizontal`,gap:6,wrap:`wrap`,children:[(0,E.jsx)(f,{theme:x,mode:e,children:(0,E.jsxs)(h,{gap:2,style:{backgroundColor:`var(--color-background-body)`,padding:16,borderRadius:12},children:[(0,E.jsx)(`strong`,{children:`Default (inverted surface)`}),(0,E.jsx)(w,{})]})}),(0,E.jsx)(f,{theme:L,mode:e,children:(0,E.jsxs)(h,{gap:2,style:{backgroundColor:`var(--color-background-body)`,padding:16,borderRadius:12},children:[(0,E.jsx)(`strong`,{children:`surfaces.toast = 'normal'`}),(0,E.jsx)(w,{})]})})]})]},e)),(0,E.jsxs)(h,{gap:2,children:[(0,E.jsx)(`strong`,{children:`Custom error accent (onDark) — inverted surface`}),(0,E.jsx)(f,{theme:R,mode:`light`,children:(0,E.jsx)(h,{gap:2,style:{backgroundColor:`var(--color-background-body)`,padding:16,borderRadius:12},children:(0,E.jsx)(w,{})})})]})]})},parameters:{docs:{description:{story:"Themes control whether Toast renders on the inverted media surface. `defineTheme({ surfaces: { toast: 'normal' } })` opts out app-wide; the error variant remains on its dark surface regardless, and a theme's `onDark` tokens recolor that always-dark error content."}}}},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
  render: function DefaultStory() {
    const toast = useToast();
    return <Button label="Show toast" onClick={() => toast({
      body: 'This is an info toast'
    })} />;
  }
}`,...O.parameters?.docs?.source}}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
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
}`,...k.parameters?.docs?.source}}},A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
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
}`,...A.parameters?.docs?.source}}},j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
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
}`,...j.parameters?.docs?.source}}},M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
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
}`,...M.parameters?.docs?.source}}},N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
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
}`,...N.parameters?.docs?.source}}},P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
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
}`,...P.parameters?.docs?.source}}},F.parameters={...F.parameters,docs:{...F.parameters?.docs,source:{originalSource:`{
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
}`,...F.parameters?.docs?.source}}},I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{
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
}`,...I.parameters?.docs?.source}}},B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
  render: function ThemedSurfaceOptOutStory() {
    return <Stack gap={4}>
        <p>
          Toast renders on an inverted media surface by default (dark panel in a
          light app, light panel in a dark app). A theme opts out with{' '}
          <code>
            surfaces: {'{'} toast: 'normal' {'}'}
          </code>
          , so the toast uses the app&apos;s ordinary surface tokens. The error
          variant always stays on its attention-grabbing dark surface in both.
          Each column pins an explicit mode so the light/dark inversion is
          visible side by side.
        </p>
        {(['light', 'dark'] as const).map(mode => <Stack key={mode} gap={2}>
            <strong>Mode: {mode}</strong>
            <Stack direction="horizontal" gap={6} wrap="wrap">
              <Theme theme={neutralTheme} mode={mode}>
                <Stack gap={2} style={{
              backgroundColor: 'var(--color-background-body)',
              padding: 16,
              borderRadius: 12
            }}>
                  <strong>Default (inverted surface)</strong>
                  <ToastPair />
                </Stack>
              </Theme>
              <Theme theme={normalToastTheme} mode={mode}>
                <Stack gap={2} style={{
              backgroundColor: 'var(--color-background-body)',
              padding: 16,
              borderRadius: 12
            }}>
                  <strong>surfaces.toast = &apos;normal&apos;</strong>
                  <ToastPair />
                </Stack>
              </Theme>
            </Stack>
          </Stack>)}
        <Stack gap={2}>
          <strong>Custom error accent (onDark) — inverted surface</strong>
          <Theme theme={customErrorToastTheme} mode="light">
            <Stack gap={2} style={{
            backgroundColor: 'var(--color-background-body)',
            padding: 16,
            borderRadius: 12
          }}>
              <ToastPair />
            </Stack>
          </Theme>
        </Stack>
      </Stack>;
  },
  parameters: {
    docs: {
      description: {
        story: "Themes control whether Toast renders on the inverted media surface. \`defineTheme({ surfaces: { toast: 'normal' } })\` opts out app-wide; the error variant remains on its dark surface regardless, and a theme's \`onDark\` tokens recolor that always-dark error content."
      }
    }
  }
}`,...B.parameters?.docs?.source}}},V=[`Default`,`Types`,`WithAction`,`ErrorPersists`,`ProgrammaticDismiss`,`Deduplication`,`Stacking`,`NoProvider`,`ToastOverDialog`,`ThemedSurfaceOptOut`]}))();export{N as Deduplication,O as Default,j as ErrorPersists,F as NoProvider,M as ProgrammaticDismiss,P as Stacking,B as ThemedSurfaceOptOut,I as ToastOverDialog,k as Types,A as WithAction,V as __namedExportsOrder,D as default};