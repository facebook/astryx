import{i as e,s as t}from"./preload-helper-CT_b8DTk.js";import{t as n}from"./react-B7Te67-h.js";import{t as r}from"./jsx-runtime-DqZldVDK.js";import{t as i}from"./Text-Dfk4z49M.js";import{t as a}from"./Button-BnrGcZLf.js";import{t as o}from"./Button-BBOpb_lq.js";import{r as s,s as ee}from"./useTheme-CJYItYzy.js";import{t as c}from"./Card-CvOBk-et.js";import{t as te}from"./Card-HAg_V-nm.js";import{t as l,x as u}from"./theme-Cev_i3Y3.js";import{a as d,t as f}from"./ToastViewport-B1qGfbd4.js";import{i as p,t as ne}from"./Dialog-qKu0Gez9.js";import{t as m}from"./Heading-DEftOGEN.js";import{c as h,t as g}from"./Stack-BPa9qrGQ.js";import{t as _}from"./Text-24uEXAax.js";import{i as v,t as y}from"./Link-C_kDV0G9.js";import{j as b,k as re}from"./iframe-DGBBZYB-.js";function x({title:e,description:t,isRtl:n=!1,children:r}){return(0,M.jsxs)(`div`,{dir:n?`rtl`:void 0,...{0:{className:`x1n2onr6 x9f619 x1cvmir6 x193iq5w x1v2kdr2 xb3r6kr xmkeg23 x1y0btm7 x14i3s5s x1hviunn x1eiddq6 x1i5ehqx x17dzmu4`},1:{className:`x1n2onr6 x9f619 x1cvmir6 x193iq5w x1v2kdr2 xb3r6kr xmkeg23 x1y0btm7 x14i3s5s x1hviunn x1eiddq6 x1i5ehqx x17dzmu4 xzyj77d`}}[!!n<<0],children:[(0,M.jsxs)(`div`,{className:`x1na6nto x1pzlopt x10xzikg xso031l x1q0q8m5 xw8gpjh`,children:[(0,M.jsx)(i,{type:`label`,children:e}),(0,M.jsx)(i,{type:`supporting`,color:`secondary`,children:t})]}),(0,M.jsx)(`div`,{className:`x78zum5 xdt5ytf xjcht0a x1shk3sm`,children:r})]})}function S({children:e}){return(0,M.jsx)(`div`,{className:`x78zum5 xdt5ytf x1txdalj x1b2ylru xmkeg23 x1y0btm7 x14i3s5s x1hviunn x10xzikg`,children:e})}function C({items:e,label:t=`Show toast`}){let n=b(),r=(0,j.useRef)([]),i=()=>{for(let e of r.current)e();r.current=[]};return(0,M.jsxs)(`div`,{className:`x78zum5 x1a02dak x1txdalj`,children:[(0,M.jsx)(a,{label:t,onClick:()=>{i();for(let t of e){let{key:e,...i}=t;r.current.push(n({uniqueID:e,...i}))}}}),(0,M.jsx)(a,{label:`Reset`,variant:`secondary`,onClick:i})]})}function w({onClose:e}){let t=b();return(0,M.jsxs)(h,{gap:3,children:[(0,M.jsx)(`p`,{children:`This dialog has its own toast viewport. Toasts fired here render inside the dialog, above its overlay.`}),(0,M.jsxs)(h,{direction:`horizontal`,gap:2,wrap:`wrap`,children:[(0,M.jsx)(a,{label:`Close`,variant:`secondary`,onClick:e}),(0,M.jsx)(a,{label:`Show toast`,onClick:()=>{t({body:`Toast from inside the dialog!`})}}),(0,M.jsx)(a,{label:`Error toast`,variant:`destructive`,onClick:()=>{t({body:`Something went wrong.`,type:`error`})}})]})]})}function T({children:e}){let{mode:t}=s();return(0,M.jsx)(u,{theme:J,mode:t,children:e})}function E({label:e}){return(0,M.jsxs)(h,{direction:`vertical`,gap:2,children:[(0,M.jsx)(m,{level:4,children:e}),(0,M.jsx)(d,{type:`info`,body:`Your changes have been saved.`,isAutoHide:!1,autoHideDuration:5e3,onDismiss:O}),(0,M.jsx)(d,{type:`error`,body:`Could not reach the server.`,isAutoHide:!1,autoHideDuration:5e3,onDismiss:O})]})}function D(){let e=b();return(0,M.jsxs)(h,{direction:`horizontal`,gap:2,children:[(0,M.jsx)(a,{label:`Themed info toast`,onClick:()=>e({body:`Your changes have been saved.`})}),(0,M.jsx)(a,{label:`Themed error toast`,variant:`destructive`,onClick:()=>e({body:`Could not reach the server.`,type:`error`})})]})}function O(){}function k({type:e,body:t,endContent:n,DismissButton:r}){return(0,M.jsxs)(`div`,{className:`x78zum5 x1cy8zhl xjcht0a xh8yej3`,children:[(0,M.jsx)(`div`,{...{0:{className:`xkh2ocl x51ohtg xjspbzw x2lah0s x1ewilqj`},1:{className:`xkh2ocl x51ohtg xjspbzw x2lah0s x1ob8fc3`}}[(e===`error`)<<0]}),(0,M.jsx)(`div`,{className:`x98rzlu xeuugli`,children:t}),n,(0,M.jsx)(r,{})]})}function A({type:e,body:t}){return(0,M.jsxs)(`div`,{className:`x78zum5 x1cy8zhl xjcht0a xh8yej3`,children:[(0,M.jsx)(`div`,{...{0:{className:`xkh2ocl x51ohtg xjspbzw x2lah0s x1ewilqj`},1:{className:`xkh2ocl x51ohtg xjspbzw x2lah0s x1ob8fc3`}}[(e===`error`)<<0]}),(0,M.jsx)(`div`,{className:`x98rzlu xeuugli`,children:t})]})}var j,M,N,P,F,I,L,R,z,B,V,H,U,W,G,K,q,J,Y,X,Z,Q,$;e((()=>{j=t(n()),re(),l(),o(),y(),te(),g(),_(),ne(),M=r(),N={docs:{story:{inline:!1,height:`720px`}}},P={title:`Core/Toast`,tags:[`autodocs`],parameters:{docs:{description:{component:"Imperative toast notification system. Use `useToast()` for brief, non-critical feedback. Works with or without `LayerProvider`."}}}},F={render:function(){let e=b();return(0,M.jsx)(a,{label:`Show toast`,onClick:()=>e({body:`This is an info toast`})})},parameters:{docs:{description:{story:`Plain info toasts are transient by default. Use them for brief, non-critical feedback that is also reflected elsewhere in the UI.`}}}},I={render:function(){let e=b();return(0,M.jsx)(h,{direction:`horizontal`,gap:2,children:[`info`,`error`].map(t=>(0,M.jsx)(a,{label:t,variant:t===`error`?`destructive`:`secondary`,onClick:()=>e({body:`This is a ${t} notification.`,type:t})},t))})},parameters:{docs:{description:{story:`Two toast types: info (default) and error. Plain info toasts are transient by default; error toasts persist until dismissed.`}}}},L={render:function(){let e=b();return(0,M.jsxs)(h,{direction:`horizontal`,gap:2,children:[(0,M.jsx)(a,{label:`With button`,onClick:()=>e({body:`Item deleted`,isAutoHide:!1,endContent:(0,M.jsx)(a,{label:`Undo`,variant:`secondary`,size:`sm`,onClick:()=>console.log(`Undo!`)})})}),(0,M.jsx)(a,{label:`With link`,variant:`secondary`,onClick:()=>e({body:`Your report is ready.`,isAutoHide:!1,endContent:(0,M.jsx)(v,{href:`#`,hasUnderline:!0,children:`View report`})})})]})},parameters:{docs:{description:{story:"Use `endContent` for short trailing actions. Set `isAutoHide: false` when the action must remain available; timed content still needs to satisfy WCAG 2.2.1."}}}},R={render:function(){let e=b();return(0,M.jsx)(a,{label:`Trigger error`,variant:`destructive`,onClick:()=>e({body:`Check your network connection and try again.`,type:`error`})})},parameters:{docs:{description:{story:"Error toasts default to `isAutoHide: false`; they persist until the user dismisses them."}}}},z={render:function(){let e=b(),t=(0,j.useRef)(null);return(0,M.jsxs)(h,{direction:`horizontal`,gap:2,children:[(0,M.jsx)(a,{label:`Show persistent toast`,onClick:()=>{t.current=e({body:`Uploading...`,isAutoHide:!1})}}),(0,M.jsx)(a,{label:`Dismiss`,variant:`secondary`,onClick:()=>{t.current?.(),t.current=null}})]})},parameters:{docs:{description:{story:"`useToast()` returns a dismiss function. Call it to remove the toast programmatically."}}}},B={render:function(){let e=b();return(0,M.jsxs)(h,{direction:`horizontal`,gap:2,children:[(0,M.jsx)(a,{label:`Offline (ignore)`,onClick:()=>e({body:`You are offline`,uniqueID:`offline`,collisionBehavior:`ignore`,isAutoHide:!1})}),(0,M.jsx)(a,{label:`Progress (overwrite)`,variant:`secondary`,onClick:()=>e({body:`Uploading... ${Math.floor(Math.random()*100)}%`,uniqueID:`upload-progress`,collisionBehavior:`overwrite`,isAutoHide:!1})})]})},parameters:{docs:{description:{story:"`uniqueID` prevents duplicate toasts. `ignore` keeps the existing; `overwrite` replaces it."}}}},V={render:function(){let e=b(),t=(0,j.useRef)(0);return(0,M.jsx)(a,{label:`Add toast`,onClick:()=>{t.current++;let n=[`info`,`error`],r=n[t.current%n.length];e({body:`Toast #${t.current} — ${r} notification.`,type:r})}})},parameters:{docs:{description:{story:`Multiple toasts stack vertically. Default max visible is 5.`}}}},H={name:`Narrow layout reference`,render:()=>(0,M.jsx)(`div`,{className:`x1dz1jew x193iq5w`,children:(0,M.jsx)(d,{type:`info`,body:`Arbeitsbereichsbenachrichtigungseinstellungen gespeichert`,isAutoHide:!1,autoHideDuration:5e3,endContent:(0,M.jsx)(a,{label:`Undo`,variant:`secondary`,size:`sm`}),onDismiss:()=>{}})}),parameters:{docs:{description:{story:`Static visual reference for narrow viewport/content-fit behavior: realistic translated copy wraps while Undo and dismiss stay aligned with its first line. This example opts out of auto-hide and does not emulate touch, pointer, or hover capabilities.`}}}},U={name:`Mobile situations / RTL logical placement`,render:()=>(0,M.jsx)(x,{title:`إعدادات الفريق`,description:`bottomStart follows the document direction; safe-area insets are device behavior and are not pixel-emulated here.`,isRtl:!0,children:(0,M.jsx)(f,{position:`bottomStart`,isTopLayer:!1,maxVisible:2,children:(0,M.jsxs)(S,{children:[(0,M.jsx)(i,{type:`supporting`,color:`secondary`,children:`The toast uses a logical start placement. On an RTL page, start is the right edge; device safe-area padding is handled by the viewport styles.`}),(0,M.jsx)(C,{label:`إظهار التنبيه`,items:[{key:`mobile-rtl-safe-area`,body:`تم حفظ إعدادات الفريق`}]})]})})}),parameters:{...N,docs:{story:{...N.docs.story,description:`RTL story for logical start/end placement. Safe-area behavior depends on real device insets; this story does not fake pixel evidence.`}}}},W={name:`Mobile situations / Motion edge-aware entrance`,render:()=>(0,M.jsx)(x,{title:`Motion replay`,description:`Replay top and bottom stacks to compare the 8px edge-directed slide, fade, and tighter stack spacing.`,children:(0,M.jsxs)(h,{gap:3,children:[(0,M.jsx)(f,{position:`topEnd`,isTopLayer:!1,maxVisible:3,children:(0,M.jsxs)(S,{children:[(0,M.jsx)(i,{type:`supporting`,color:`secondary`,children:`Top placement travels 8px down from the top edge; exits return upward. Existing toasts make room through the wrapper grid-row transition.`}),(0,M.jsx)(C,{label:`Replay top stack`,items:[{key:`motion-top-1`,body:`Top first`,isAutoHide:!1},{key:`motion-top-2`,body:`Top second`,isAutoHide:!1},{key:`motion-top-3`,body:`Top third`,isAutoHide:!1}]})]})}),(0,M.jsx)(f,{position:`bottomEnd`,isTopLayer:!1,maxVisible:3,children:(0,M.jsxs)(S,{children:[(0,M.jsx)(i,{type:`supporting`,color:`secondary`,children:`Bottom placement travels 8px up from the bottom edge and returns downward on exit, with the same transform/opacity contract and tighter stack spacing.`}),(0,M.jsx)(C,{label:`Replay bottom stack`,items:[{key:`motion-bottom-1`,body:`Bottom first`,isAutoHide:!1},{key:`motion-bottom-2`,body:`Bottom second`,isAutoHide:!1},{key:`motion-bottom-3`,body:`Bottom third`,isAutoHide:!1}]})]})})]})}),parameters:{...N,docs:{story:{...N.docs.story,description:`Replayable visual check for the focused motion change: an 8px top/bottom translate with the existing opacity and timing, plus the wrapper grid-row spacing transition.`}}}},G={name:`Accessibility / Nested viewport landmark`,render:()=>(0,M.jsx)(x,{title:`Nested providers`,description:`Only the viewport that receives a toast becomes a Notifications landmark.`,children:(0,M.jsx)(f,{isTopLayer:!1,children:(0,M.jsx)(f,{isTopLayer:!1,children:(0,M.jsxs)(S,{children:[(0,M.jsx)(i,{type:`supporting`,color:`secondary`,children:`Show a toast, then inspect the accessibility tree: the empty outer viewport remains unnamed and only the inner viewport is a region.`}),(0,M.jsx)(C,{items:[{key:`nested-viewport-landmark`,body:`Notification settings saved`,isAutoHide:!1}]})]})})})}),parameters:{...N,docs:{story:{...N.docs.story,description:`Accessibility check for nested ToastViewport composition. With a toast visible, exactly one named Notifications region should appear; with none visible, there should be zero.`}}}},K={render:function(){let e=b();return(0,M.jsx)(c,{padding:4,children:(0,M.jsxs)(h,{gap:2,children:[(0,M.jsx)(`p`,{style:{margin:0,fontSize:14},children:`No LayerProvider: the hook creates a fallback viewport on document.body automatically.`}),(0,M.jsx)(a,{label:`Show toast`,onClick:()=>e({body:`Works without a provider!`})})]})})},parameters:{docs:{description:{story:"`useToast()` works without a provider. It lazily mounts a fallback viewport on first call."}}}},q={render:function(){let[e,t]=(0,j.useState)(!1);return(0,M.jsxs)(h,{gap:2,children:[(0,M.jsx)(a,{label:`Open dialog`,onClick:()=>t(!0)}),(0,M.jsx)(p,{isOpen:e,onOpenChange:()=>t(!1),children:(0,M.jsx)(f,{isTopLayer:!1,children:(0,M.jsx)(w,{onClose:()=>t(!1)})})})]})},parameters:{docs:{description:{story:"Dialog with its own `ToastViewport`: toasts render inside the dialog's top layer context and appear above the dialog overlay."}}}},J=ee({name:`toast-brand-demo`,components:{toast:{base:{backgroundColor:`#FFF4D6`,borderRadius:`var(--radius-full)`,paddingInline:`var(--spacing-6)`,boxShadow:`var(--shadow-high)`,fontFamily:`var(--font-family-code)`},"type:error":{backgroundColor:`#5C0A18`}}}}),Y={render:function(){return(0,M.jsxs)(h,{direction:`horizontal`,gap:4,wrap:`wrap`,children:[(0,M.jsx)(E,{label:`Default`}),(0,M.jsx)(T,{children:(0,M.jsx)(E,{label:`brandToastTheme`})})]})},parameters:{docs:{description:{story:"Pill radius, wider inline padding, the cream surface and the monospace body all come from `components.toast.base`; the deep red is `type:error`. Neither rule sets a text colour."}}}},X={render:function(){return(0,M.jsx)(T,{children:(0,M.jsx)(f,{children:(0,M.jsx)(D,{})})})},parameters:{docs:{description:{story:"Same theme, real toasts. The viewport is inside `Theme`, so the scoped theme CSS reaches the toasts it renders."}}}},Z=e=>(0,M.jsx)(k,{...e}),Q={name:`Custom content (renderContent)`,render:function(){let e=b();return(0,M.jsxs)(h,{direction:`horizontal`,gap:2,wrap:`wrap`,children:[(0,M.jsx)(a,{label:`Show`,onClick:()=>{e({body:`Your changes have been saved.`,renderContent:Z})}}),(0,M.jsx)(a,{label:`With an action`,variant:`secondary`,onClick:()=>{e({body:`Row deleted.`,endContent:(0,M.jsx)(a,{variant:`ghost`,size:`sm`,label:`Undo`}),renderContent:Z})}}),(0,M.jsx)(a,{label:`Error`,variant:`destructive`,onClick:()=>{e({body:`Could not reach the server.`,type:`error`,renderContent:Z})}}),(0,M.jsx)(a,{label:`Layout without the close`,variant:`ghost`,onClick:()=>{e({body:`This layout never renders DismissButton.`,type:`error`,renderContent:e=>(0,M.jsx)(A,{...e})})}}),(0,M.jsx)(a,{label:`Without renderContent`,variant:`ghost`,onClick:()=>{e({body:`A toast from code that knows nothing about it.`})}})]})},parameters:{docs:{description:{story:"`renderContent` replaces the content of one toast's card. Astryx keeps the transport and hands over the message, `endContent` and a `DismissButton` to place. If a nested layout removes that button later, Astryx immediately restores its corner close. The last button omits `renderContent`, showing that a library-raised toast keeps the ordinary Astryx layout."}}}},F.parameters={...F.parameters,docs:{...F.parameters?.docs,source:{originalSource:`{
  render: function DefaultStory() {
    const toast = useToast();
    return <Button label="Show toast" onClick={() => toast({
      body: 'This is an info toast'
    })} />;
  },
  parameters: {
    docs: {
      description: {
        story: 'Plain info toasts are transient by default. Use them for brief, non-critical feedback that is also reflected elsewhere in the UI.'
      }
    }
  }
}`,...F.parameters?.docs?.source}}},I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{
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
        story: 'Two toast types: info (default) and error. Plain info toasts are transient by default; error toasts persist until dismissed.'
      }
    }
  }
}`,...I.parameters?.docs?.source}}},L.parameters={...L.parameters,docs:{...L.parameters?.docs,source:{originalSource:`{
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
        story: 'Use \`endContent\` for short trailing actions. Set \`isAutoHide: false\` when the action must remain available; timed content still needs to satisfy WCAG 2.2.1.'
      }
    }
  }
}`,...L.parameters?.docs?.source}}},R.parameters={...R.parameters,docs:{...R.parameters?.docs,source:{originalSource:`{
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
}`,...R.parameters?.docs?.source}}},z.parameters={...z.parameters,docs:{...z.parameters?.docs,source:{originalSource:`{
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
}`,...z.parameters?.docs?.source}}},B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
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
}`,...B.parameters?.docs?.source}}},V.parameters={...V.parameters,docs:{...V.parameters?.docs,source:{originalSource:`{
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
}`,...V.parameters?.docs?.source}}},H.parameters={...H.parameters,docs:{...H.parameters?.docs,source:{originalSource:`{
  name: 'Narrow layout reference',
  render: () => <div {...stylex.props(styles.narrowLayoutReference)}>
      <Toast type="info" body="Arbeitsbereichsbenachrichtigungseinstellungen gespeichert" isAutoHide={false} autoHideDuration={5000} endContent={<Button label="Undo" variant="secondary" size="sm" />} onDismiss={() => {}} />
    </div>,
  parameters: {
    docs: {
      description: {
        story: 'Static visual reference for narrow viewport/content-fit behavior: realistic translated copy wraps while Undo and dismiss stay aligned with its first line. This example opts out of auto-hide and does not emulate touch, pointer, or hover capabilities.'
      }
    }
  }
}`,...H.parameters?.docs?.source}}},U.parameters={...U.parameters,docs:{...U.parameters?.docs,source:{originalSource:`{
  name: 'Mobile situations / RTL logical placement',
  render: () => <MobileCanvas title="إعدادات الفريق" description="bottomStart follows the document direction; safe-area insets are device behavior and are not pixel-emulated here." isRtl>
      <ToastViewport position="bottomStart" isTopLayer={false} maxVisible={2}>
        <MockCard>
          <Text type="supporting" color="secondary">
            The toast uses a logical start placement. On an RTL page, start is
            the right edge; device safe-area padding is handled by the viewport
            styles.
          </Text>
          <ToastReplayControls label="إظهار التنبيه" items={[{
          key: 'mobile-rtl-safe-area',
          body: 'تم حفظ إعدادات الفريق'
        }]} />
        </MockCard>
      </ToastViewport>
    </MobileCanvas>,
  parameters: {
    ...mobileStoryParameters,
    docs: {
      story: {
        ...mobileStoryParameters.docs.story,
        description: 'RTL story for logical start/end placement. Safe-area behavior depends on real device insets; this story does not fake pixel evidence.'
      }
    }
  }
}`,...U.parameters?.docs?.source}}},W.parameters={...W.parameters,docs:{...W.parameters?.docs,source:{originalSource:`{
  name: 'Mobile situations / Motion edge-aware entrance',
  render: () => <MobileCanvas title="Motion replay" description="Replay top and bottom stacks to compare the 8px edge-directed slide, fade, and tighter stack spacing.">
      <Stack gap={3}>
        <ToastViewport position="topEnd" isTopLayer={false} maxVisible={3}>
          <MockCard>
            <Text type="supporting" color="secondary">
              Top placement travels 8px down from the top edge; exits return
              upward. Existing toasts make room through the wrapper grid-row
              transition.
            </Text>
            <ToastReplayControls label="Replay top stack" items={[{
            key: 'motion-top-1',
            body: 'Top first',
            isAutoHide: false
          }, {
            key: 'motion-top-2',
            body: 'Top second',
            isAutoHide: false
          }, {
            key: 'motion-top-3',
            body: 'Top third',
            isAutoHide: false
          }]} />
          </MockCard>
        </ToastViewport>
        <ToastViewport position="bottomEnd" isTopLayer={false} maxVisible={3}>
          <MockCard>
            <Text type="supporting" color="secondary">
              Bottom placement travels 8px up from the bottom edge and returns
              downward on exit, with the same transform/opacity contract and
              tighter stack spacing.
            </Text>
            <ToastReplayControls label="Replay bottom stack" items={[{
            key: 'motion-bottom-1',
            body: 'Bottom first',
            isAutoHide: false
          }, {
            key: 'motion-bottom-2',
            body: 'Bottom second',
            isAutoHide: false
          }, {
            key: 'motion-bottom-3',
            body: 'Bottom third',
            isAutoHide: false
          }]} />
          </MockCard>
        </ToastViewport>
      </Stack>
    </MobileCanvas>,
  parameters: {
    ...mobileStoryParameters,
    docs: {
      story: {
        ...mobileStoryParameters.docs.story,
        description: 'Replayable visual check for the focused motion change: an 8px top/bottom translate with the existing opacity and timing, plus the wrapper grid-row spacing transition.'
      }
    }
  }
}`,...W.parameters?.docs?.source}}},G.parameters={...G.parameters,docs:{...G.parameters?.docs,source:{originalSource:`{
  name: 'Accessibility / Nested viewport landmark',
  render: () => <MobileCanvas title="Nested providers" description="Only the viewport that receives a toast becomes a Notifications landmark.">
      <ToastViewport isTopLayer={false}>
        <ToastViewport isTopLayer={false}>
          <MockCard>
            <Text type="supporting" color="secondary">
              Show a toast, then inspect the accessibility tree: the empty outer
              viewport remains unnamed and only the inner viewport is a region.
            </Text>
            <ToastReplayControls items={[{
            key: 'nested-viewport-landmark',
            body: 'Notification settings saved',
            isAutoHide: false
          }]} />
          </MockCard>
        </ToastViewport>
      </ToastViewport>
    </MobileCanvas>,
  parameters: {
    ...mobileStoryParameters,
    docs: {
      story: {
        ...mobileStoryParameters.docs.story,
        description: 'Accessibility check for nested ToastViewport composition. With a toast visible, exactly one named Notifications region should appear; with none visible, there should be zero.'
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
}`,...q.parameters?.docs?.source}}},Y.parameters={...Y.parameters,docs:{...Y.parameters?.docs,source:{originalSource:`{
  render: function ThemedToastStory() {
    return <Stack direction="horizontal" gap={4} wrap="wrap">
        <ToastSpecimens label="Default" />
        <BrandToastScope>
          <ToastSpecimens label="brandToastTheme" />
        </BrandToastScope>
      </Stack>;
  },
  parameters: {
    docs: {
      description: {
        story: 'Pill radius, wider inline padding, the cream surface and the ' + 'monospace body all come from \`components.toast.base\`; the deep red ' + 'is \`type:error\`. Neither rule sets a text colour.'
      }
    }
  }
}`,...Y.parameters?.docs?.source},description:{story:"Default and themed, side by side, in both types. These are inline `Toast`\nelements rather than fired ones so both states stay on screen together;\n`ThemedToastLive` shows the same theme driving real `useToast()` calls.",...Y.parameters?.docs?.description}}},X.parameters={...X.parameters,docs:{...X.parameters?.docs,source:{originalSource:`{
  render: function ThemedToastLiveStory() {
    return <BrandToastScope>
        <ToastViewport>
          <ThemedToastTriggers />
        </ToastViewport>
      </BrandToastScope>;
  },
  parameters: {
    docs: {
      description: {
        story: 'Same theme, real toasts. The viewport is inside \`Theme\`, so the ' + 'scoped theme CSS reaches the toasts it renders.'
      }
    }
  }
}`,...X.parameters?.docs?.source},description:{story:`The copyable shape: wrap the viewport in the theme and fire toasts normally.`,...X.parameters?.docs?.description}}},Q.parameters={...Q.parameters,docs:{...Q.parameters?.docs,source:{originalSource:`{
  name: 'Custom content (renderContent)',
  render: function CustomContentStory() {
    const toast = useToast();
    return <Stack direction="horizontal" gap={2} wrap="wrap">
        <Button label="Show" onClick={() => {
        toast({
          body: 'Your changes have been saved.',
          renderContent: renderProductContent
        });
      }} />
        <Button label="With an action" variant="secondary" onClick={() => {
        toast({
          body: 'Row deleted.',
          endContent: <Button variant="ghost" size="sm" label="Undo" />,
          renderContent: renderProductContent
        });
      }} />
        <Button label="Error" variant="destructive" onClick={() => {
        toast({
          body: 'Could not reach the server.',
          type: 'error',
          renderContent: renderProductContent
        });
      }} />
        <Button label="Layout without the close" variant="ghost" onClick={() => {
        toast({
          body: 'This layout never renders DismissButton.',
          type: 'error',
          renderContent: toastProps => <ForgetfulToastContent {...toastProps} />
        });
      }} />
        <Button label="Without renderContent" variant="ghost" onClick={() => {
        toast({
          body: 'A toast from code that knows nothing about it.'
        });
      }} />
      </Stack>;
  },
  parameters: {
    docs: {
      description: {
        story: "\`renderContent\` replaces the content of one toast's card. Astryx keeps the transport and hands over the message, \`endContent\` and a \`DismissButton\` to place. If a nested layout removes that button later, Astryx immediately restores its corner close. The last button omits \`renderContent\`, showing that a library-raised toast keeps the ordinary Astryx layout."
      }
    }
  }
}`,...Q.parameters?.docs?.source}}},$=[`Default`,`Types`,`WithAction`,`ErrorPersists`,`ProgrammaticDismiss`,`Deduplication`,`Stacking`,`NarrowLayoutReference`,`MobileRtlSafeAreaPlacement`,`MobileMotionEdgeAwareEntrance`,`NestedViewportLandmark`,`NoProvider`,`ToastOverDialog`,`ThemedToast`,`ThemedToastLive`,`CustomContent`]}))();export{Q as CustomContent,B as Deduplication,F as Default,R as ErrorPersists,W as MobileMotionEdgeAwareEntrance,U as MobileRtlSafeAreaPlacement,H as NarrowLayoutReference,G as NestedViewportLandmark,K as NoProvider,z as ProgrammaticDismiss,V as Stacking,Y as ThemedToast,X as ThemedToastLive,q as ToastOverDialog,I as Types,L as WithAction,$ as __namedExportsOrder,P as default};