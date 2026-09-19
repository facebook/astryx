import{i as e,s as t}from"./preload-helper-CT_b8DTk.js";import{t as n}from"./react-B7Te67-h.js";import{t as r}from"./jsx-runtime-DqZldVDK.js";import{t as i}from"./Text-CUw_qAJO.js";import{t as a}from"./Button-CJ0yeiFV.js";import{t as ee}from"./Button-DBQO7xlr.js";import{r as te,s as o}from"./useTheme-BjGFIaE4.js";import{t as s}from"./Card-D5cVf6xt.js";import{t as ne}from"./Card-BJMAQDhX.js";import{t as c,x as re}from"./theme-DnizdbAi.js";import{a as l,t as u}from"./ToastViewport-BMKbILaE.js";import{i as d,t as f}from"./Dialog-BQTnoVPV.js";import{t as ie}from"./Heading-MtotQutU.js";import{c as p,t as ae}from"./Stack-Dntpv-r2.js";import{t as m}from"./Text-B194cPHg.js";import{i as h,t as g}from"./Link-BpwNxEwl.js";import{j as _,k as oe}from"./iframe-Cno088-j.js";function v({title:e,description:t,isRtl:n=!1,children:r}){return(0,A.jsxs)(`div`,{dir:n?`rtl`:void 0,...{0:{className:`x1n2onr6 x9f619 x1cvmir6 x193iq5w x1v2kdr2 xb3r6kr xmkeg23 x1y0btm7 x14i3s5s x1hviunn x1eiddq6 x1i5ehqx x17dzmu4`},1:{className:`x1n2onr6 x9f619 x1cvmir6 x193iq5w x1v2kdr2 xb3r6kr xmkeg23 x1y0btm7 x14i3s5s x1hviunn x1eiddq6 x1i5ehqx x17dzmu4 xzyj77d`}}[!!n<<0],children:[(0,A.jsxs)(`div`,{className:`x1na6nto x1pzlopt x10xzikg xso031l x1q0q8m5 xw8gpjh`,children:[(0,A.jsx)(i,{type:`label`,children:e}),(0,A.jsx)(i,{type:`supporting`,color:`secondary`,children:t})]}),(0,A.jsx)(`div`,{className:`x78zum5 xdt5ytf xjcht0a x1shk3sm`,children:r})]})}function y({children:e}){return(0,A.jsx)(`div`,{className:`x78zum5 xdt5ytf x1txdalj x1b2ylru xmkeg23 x1y0btm7 x14i3s5s x1hviunn x10xzikg`,children:e})}function b({items:e,label:t=`Show toast`}){let n=_(),r=(0,k.useRef)([]),i=()=>{for(let e of r.current)e();r.current=[]};return(0,A.jsxs)(`div`,{className:`x78zum5 x1a02dak x1txdalj`,children:[(0,A.jsx)(a,{label:t,onClick:()=>{i();for(let t of e){let{key:e,...i}=t;r.current.push(n({uniqueID:e,...i}))}}}),(0,A.jsx)(a,{label:`Reset`,variant:`secondary`,onClick:i})]})}function x({onClose:e}){let t=_();return(0,A.jsxs)(p,{gap:3,children:[(0,A.jsx)(`p`,{children:`This dialog has its own toast viewport. Toasts fired here render inside the dialog, above its overlay.`}),(0,A.jsxs)(p,{direction:`horizontal`,gap:2,wrap:`wrap`,children:[(0,A.jsx)(a,{label:`Close`,variant:`secondary`,onClick:e}),(0,A.jsx)(a,{label:`Show toast`,onClick:()=>{t({body:`Toast from inside the dialog!`})}}),(0,A.jsx)(a,{label:`Error toast`,variant:`destructive`,onClick:()=>{t({body:`Something went wrong.`,type:`error`})}})]})]})}function S({children:e}){let{mode:t}=te();return(0,A.jsx)(re,{theme:q,mode:t,children:e})}function C({label:e}){return(0,A.jsxs)(p,{direction:`vertical`,gap:2,children:[(0,A.jsx)(ie,{level:4,children:e}),(0,A.jsx)(l,{type:`info`,body:`Your changes have been saved.`,isAutoHide:!1,autoHideDuration:5e3,onDismiss:T}),(0,A.jsx)(l,{type:`error`,body:`Could not reach the server.`,isAutoHide:!1,autoHideDuration:5e3,onDismiss:T})]})}function w(){let e=_();return(0,A.jsxs)(p,{direction:`horizontal`,gap:2,children:[(0,A.jsx)(a,{label:`Themed info toast`,onClick:()=>e({body:`Your changes have been saved.`})}),(0,A.jsx)(a,{label:`Themed error toast`,variant:`destructive`,onClick:()=>e({body:`Could not reach the server.`,type:`error`})})]})}function T(){}function E({type:e,body:t,endContent:n,dismiss:r}){return(0,A.jsxs)(`div`,{className:`x78zum5 x1cy8zhl xjcht0a xh8yej3`,children:[(0,A.jsx)(`div`,{...{0:{className:`xkh2ocl x51ohtg xjspbzw x2lah0s x1ewilqj`},1:{className:`xkh2ocl x51ohtg xjspbzw x2lah0s x1ob8fc3`}}[(e===`error`)<<0]}),(0,A.jsx)(`div`,{className:`x98rzlu xeuugli`,children:t}),n,(0,A.jsx)(a,{label:`Dismiss custom toast`,variant:`ghost`,size:`sm`,onClick:r})]})}function D({type:e,body:t}){return(0,A.jsxs)(`div`,{className:`x78zum5 x1cy8zhl xjcht0a xh8yej3`,children:[(0,A.jsx)(`div`,{...{0:{className:`xkh2ocl x51ohtg xjspbzw x2lah0s x1ewilqj`},1:{className:`xkh2ocl x51ohtg xjspbzw x2lah0s x1ob8fc3`}}[(e===`error`)<<0]}),(0,A.jsx)(`div`,{className:`x98rzlu xeuugli`,children:t})]})}function O(){let e=_();return(0,A.jsx)(a,{label:`Show toast`,onClick:()=>e({body:`Placement follows the document direction.`})})}var k,A,j,M,N,P,F,I,L,R,z,B,V,H,U,W,G,K,q,J,Y,X,Z,Q,$;e((()=>{k=t(n()),oe(),c(),ee(),g(),ne(),ae(),m(),f(),A=r(),j={docs:{story:{inline:!1,height:`720px`}}},M={title:`Core/Toast`,tags:[`autodocs`],parameters:{docs:{description:{component:"Imperative toast notification system. Use `useToast()` for brief, non-critical feedback. Works with or without `LayerProvider`."}}}},N={render:function(){let e=_();return(0,A.jsx)(a,{label:`Show toast`,onClick:()=>e({body:`This is an info toast`})})},parameters:{docs:{description:{story:`Plain info toasts are transient by default. Use them for brief, non-critical feedback that is also reflected elsewhere in the UI.`}}}},P={render:function(){let e=_();return(0,A.jsx)(p,{direction:`horizontal`,gap:2,children:[`info`,`error`].map(t=>(0,A.jsx)(a,{label:t,variant:t===`error`?`destructive`:`secondary`,onClick:()=>e({body:`This is a ${t} notification.`,type:t})},t))})},parameters:{docs:{description:{story:`Two toast types: info (default) and error. Plain info toasts are transient by default; error toasts persist until dismissed.`}}}},F={render:function(){let e=_();return(0,A.jsxs)(p,{direction:`horizontal`,gap:2,children:[(0,A.jsx)(a,{label:`With button`,onClick:()=>e({body:`Item deleted`,isAutoHide:!1,endContent:(0,A.jsx)(a,{label:`Undo`,variant:`secondary`,size:`sm`,onClick:()=>console.log(`Undo!`)})})}),(0,A.jsx)(a,{label:`With link`,variant:`secondary`,onClick:()=>e({body:`Your report is ready.`,isAutoHide:!1,endContent:(0,A.jsx)(h,{href:`#`,hasUnderline:!0,children:`View report`})})})]})},parameters:{docs:{description:{story:"Use `endContent` for short trailing actions. Set `isAutoHide: false` when the action must remain available; timed content still needs to satisfy WCAG 2.2.1."}}}},I={render:function(){let e=_();return(0,A.jsx)(a,{label:`Trigger error`,variant:`destructive`,onClick:()=>e({body:`Check your network connection and try again.`,type:`error`})})},parameters:{docs:{description:{story:"Error toasts default to `isAutoHide: false`; they persist until the user dismisses them."}}}},L={render:function(){let e=_(),t=(0,k.useRef)(null);return(0,A.jsxs)(p,{direction:`horizontal`,gap:2,children:[(0,A.jsx)(a,{label:`Show persistent toast`,onClick:()=>{t.current=e({body:`Uploading...`,isAutoHide:!1})}}),(0,A.jsx)(a,{label:`Dismiss`,variant:`secondary`,onClick:()=>{t.current?.(),t.current=null}})]})},parameters:{docs:{description:{story:"`useToast()` returns a dismiss function. Call it to remove the toast programmatically."}}}},R={render:function(){let e=_();return(0,A.jsxs)(p,{direction:`horizontal`,gap:2,children:[(0,A.jsx)(a,{label:`Offline (ignore)`,onClick:()=>e({body:`You are offline`,uniqueID:`offline`,collisionBehavior:`ignore`,isAutoHide:!1})}),(0,A.jsx)(a,{label:`Progress (overwrite)`,variant:`secondary`,onClick:()=>e({body:`Uploading... ${Math.floor(Math.random()*100)}%`,uniqueID:`upload-progress`,collisionBehavior:`overwrite`,isAutoHide:!1})})]})},parameters:{docs:{description:{story:"`uniqueID` prevents duplicate toasts. `ignore` keeps the existing; `overwrite` replaces it."}}}},z={render:function(){let e=_(),t=(0,k.useRef)(0);return(0,A.jsx)(a,{label:`Add toast`,onClick:()=>{t.current++;let n=[`info`,`error`],r=n[t.current%n.length];e({body:`Toast #${t.current} — ${r} notification.`,type:r})}})},parameters:{docs:{description:{story:`Multiple toasts stack vertically. Default max visible is 5.`}}}},B={name:`Narrow layout reference`,render:()=>(0,A.jsx)(`div`,{className:`x1dz1jew x193iq5w`,children:(0,A.jsx)(l,{type:`info`,body:`Arbeitsbereichsbenachrichtigungseinstellungen gespeichert`,isAutoHide:!1,autoHideDuration:5e3,endContent:(0,A.jsx)(a,{label:`Undo`,variant:`secondary`,size:`sm`}),onDismiss:()=>{}})}),parameters:{docs:{description:{story:`Static visual reference for narrow viewport/content-fit behavior: realistic translated copy wraps while Undo and dismiss stay aligned with its first line. This example opts out of auto-hide and does not emulate touch, pointer, or hover capabilities.`}}}},V={name:`Mobile situations / RTL logical placement`,render:()=>(0,A.jsx)(v,{title:`إعدادات الفريق`,description:`bottomStart follows the document direction; safe-area insets are device behavior and are not pixel-emulated here.`,isRtl:!0,children:(0,A.jsx)(u,{position:`bottomStart`,isTopLayer:!1,maxVisible:2,children:(0,A.jsxs)(y,{children:[(0,A.jsx)(i,{type:`supporting`,color:`secondary`,children:`The toast uses a logical start placement. On an RTL page, start is the right edge; device safe-area padding is handled by the viewport styles.`}),(0,A.jsx)(b,{label:`إظهار التنبيه`,items:[{key:`mobile-rtl-safe-area`,body:`تم حفظ إعدادات الفريق`}]})]})})}),parameters:{...j,docs:{story:{...j.docs.story,description:`RTL story for logical start/end placement. Safe-area behavior depends on real device insets; this story does not fake pixel evidence.`}}}},H={name:`Mobile situations / Swipe to dismiss`,render:()=>(0,A.jsx)(v,{title:`Swipe dismissal`,description:`Swipe is an enhancement only; the surface fades as it approaches the edge, and the visible close button remains the simple alternative.`,children:(0,A.jsx)(u,{position:`topEnd`,isTopLayer:!1,maxVisible:2,children:(0,A.jsxs)(y,{children:[(0,A.jsx)(i,{type:`supporting`,color:`secondary`,children:`Use touch or pen input, or browser touch emulation, to swipe the toast toward its configured block edge: up for top placement, down for bottom placement. This matches the direction each Toast enters and exits, keeping one spatial model for the whole interaction. The gesture claims the touch only after dominant travel matches the dismiss edge, so opposite-direction and horizontal page scrolling remain available. Pen is supported as direct-contact input; mouse dragging is ignored to avoid conflicting with desktop text selection, where the close button remains available.`}),(0,A.jsx)(b,{items:[{key:`mobile-swipe-dismiss`,body:`Swipe or close me`,isAutoHide:!1}]})]})})}),parameters:{...j,docs:{story:{...j.docs.story,description:`Interactive vertical edge swipe-to-dismiss example using real ToastViewport behavior. The vertical axis intentionally matches the Toast placement and motion model: top Toasts leave upward and bottom Toasts leave downward. A non-passive touchmove handoff claims only dominant travel toward that edge; opposite-direction and horizontal page scrolling remain available. Pen is supported as direct-contact input, while mouse drag is excluded to avoid conflicting with desktop selection; the close button and F6 keyboard access remain available.`}}}},U={name:`Mobile situations / Motion edge-aware entrance`,render:()=>(0,A.jsx)(v,{title:`Motion replay`,description:`Replay top and bottom stacks to compare the 8px edge-directed slide, fade, and tighter stack spacing.`,children:(0,A.jsxs)(p,{gap:3,children:[(0,A.jsx)(u,{position:`topEnd`,isTopLayer:!1,maxVisible:3,children:(0,A.jsxs)(y,{children:[(0,A.jsx)(i,{type:`supporting`,color:`secondary`,children:`Top placement travels 8px down from the top edge; exits return upward. Existing toasts make room through the wrapper grid-row transition.`}),(0,A.jsx)(b,{label:`Replay top stack`,items:[{key:`motion-top-1`,body:`Top first`,isAutoHide:!1},{key:`motion-top-2`,body:`Top second`,isAutoHide:!1},{key:`motion-top-3`,body:`Top third`,isAutoHide:!1}]})]})}),(0,A.jsx)(u,{position:`bottomEnd`,isTopLayer:!1,maxVisible:3,children:(0,A.jsxs)(y,{children:[(0,A.jsx)(i,{type:`supporting`,color:`secondary`,children:`Bottom placement travels 8px up from the bottom edge and returns downward on exit, with the same transform/opacity contract and tighter stack spacing.`}),(0,A.jsx)(b,{label:`Replay bottom stack`,items:[{key:`motion-bottom-1`,body:`Bottom first`,isAutoHide:!1},{key:`motion-bottom-2`,body:`Bottom second`,isAutoHide:!1},{key:`motion-bottom-3`,body:`Bottom third`,isAutoHide:!1}]})]})})]})}),parameters:{...j,docs:{story:{...j.docs.story,description:`Replayable visual check for the focused motion change: an 8px top/bottom translate with the existing opacity and timing, plus the wrapper grid-row spacing transition.`}}}},W={name:`Accessibility / Nested viewport landmark`,render:()=>(0,A.jsx)(v,{title:`Nested providers`,description:`Only the viewport that receives a toast becomes a Notifications landmark.`,children:(0,A.jsx)(u,{isTopLayer:!1,children:(0,A.jsx)(u,{isTopLayer:!1,children:(0,A.jsxs)(y,{children:[(0,A.jsx)(i,{type:`supporting`,color:`secondary`,children:`Show a toast, then inspect the accessibility tree: the empty outer viewport remains unnamed and only the inner viewport is a region.`}),(0,A.jsx)(b,{items:[{key:`nested-viewport-landmark`,body:`Notification settings saved`,isAutoHide:!1}]})]})})})}),parameters:{...j,docs:{story:{...j.docs.story,description:`Accessibility check for nested ToastViewport composition. With a toast visible, exactly one named Notifications region should appear; with none visible, there should be zero.`}}}},G={render:function(){let e=_();return(0,A.jsx)(s,{padding:4,children:(0,A.jsxs)(p,{gap:2,children:[(0,A.jsx)(`p`,{style:{margin:0,fontSize:14},children:`No LayerProvider: the hook creates a fallback viewport on document.body automatically.`}),(0,A.jsx)(a,{label:`Show toast`,onClick:()=>e({body:`Works without a provider!`})})]})})},parameters:{docs:{description:{story:"`useToast()` works without a provider. It lazily mounts a fallback viewport on first call."}}}},K={render:function(){let[e,t]=(0,k.useState)(!1);return(0,A.jsxs)(p,{gap:2,children:[(0,A.jsx)(a,{label:`Open dialog`,onClick:()=>t(!0)}),(0,A.jsx)(d,{isOpen:e,onOpenChange:()=>t(!1),children:(0,A.jsx)(u,{isTopLayer:!1,children:(0,A.jsx)(x,{onClose:()=>t(!1)})})})]})},parameters:{docs:{description:{story:"Dialog with its own `ToastViewport`: toasts render inside the dialog's top layer context and appear above the dialog overlay."}}}},q=o({name:`toast-brand-demo`,components:{toast:{base:{backgroundColor:`#FFF4D6`,borderRadius:`var(--radius-full)`,paddingInline:`var(--spacing-6)`,boxShadow:`var(--shadow-high)`,fontFamily:`var(--font-family-code)`},"type:error":{backgroundColor:`#5C0A18`}}}}),J={render:function(){return(0,A.jsxs)(p,{direction:`horizontal`,gap:4,wrap:`wrap`,children:[(0,A.jsx)(C,{label:`Default`}),(0,A.jsx)(S,{children:(0,A.jsx)(C,{label:`brandToastTheme`})})]})},parameters:{docs:{description:{story:"Pill radius, wider inline padding, the cream surface and the monospace body all come from `components.toast.base`; the deep red is `type:error`. Neither rule sets a text colour."}}}},Y={render:function(){return(0,A.jsx)(S,{children:(0,A.jsx)(u,{children:(0,A.jsx)(w,{})})})},parameters:{docs:{description:{story:"Same theme, real toasts. The viewport is inside `Theme`, so the scoped theme CSS reaches the toasts it renders."}}}},X=e=>(0,A.jsx)(E,{...e}),Z={name:`Custom content (renderContent)`,render:function(){let e=_();return(0,A.jsxs)(p,{direction:`horizontal`,gap:2,wrap:`wrap`,children:[(0,A.jsx)(a,{label:`Show`,onClick:()=>{e({body:`Your changes have been saved.`,renderContent:X})}}),(0,A.jsx)(a,{label:`With an action`,variant:`secondary`,onClick:()=>{e({body:`Row deleted.`,endContent:(0,A.jsx)(a,{variant:`ghost`,size:`sm`,label:`Undo`}),renderContent:X})}}),(0,A.jsx)(a,{label:`Error`,variant:`destructive`,onClick:()=>{e({body:`Could not reach the server.`,type:`error`,renderContent:X})}}),(0,A.jsx)(a,{label:`Layout without a close`,variant:`ghost`,onClick:()=>{e({body:`This layout relies on auto-hide.`,renderContent:e=>(0,A.jsx)(D,{...e})})}}),(0,A.jsx)(a,{label:`Without renderContent`,variant:`ghost`,onClick:()=>{e({body:`A toast from code that knows nothing about it.`})}})]})},parameters:{docs:{description:{story:"`renderContent` replaces the content of one toast's card and receives a `dismiss` callback. The custom layout composes its own Astryx `Button`; a layout without a close is left as-is and can rely on auto-hide. The last button omits `renderContent`, showing the ordinary Astryx layout and dismiss control."}}}},Q={name:`Logical placement follows direction`,render:function(){return(0,A.jsx)(u,{position:`bottomEnd`,maxVisible:1,children:(0,A.jsx)(O,{})})},parameters:{docs:{description:{story:"`bottomEnd` is a logical placement: the toast sits on the inline END edge, which is the right in LTR and the left in RTL. The viewport spans the inline axis and aligns the card within itself, so the card follows the document direction with no per-direction styling."}}}},N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
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
}`,...N.parameters?.docs?.source}}},P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
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
}`,...P.parameters?.docs?.source}}},F.parameters={...F.parameters,docs:{...F.parameters?.docs,source:{originalSource:`{
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
}`,...F.parameters?.docs?.source}}},I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{
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
}`,...I.parameters?.docs?.source}}},L.parameters={...L.parameters,docs:{...L.parameters?.docs,source:{originalSource:`{
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
}`,...L.parameters?.docs?.source}}},R.parameters={...R.parameters,docs:{...R.parameters?.docs,source:{originalSource:`{
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
}`,...R.parameters?.docs?.source}}},z.parameters={...z.parameters,docs:{...z.parameters?.docs,source:{originalSource:`{
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
}`,...z.parameters?.docs?.source}}},B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
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
}`,...B.parameters?.docs?.source}}},V.parameters={...V.parameters,docs:{...V.parameters?.docs,source:{originalSource:`{
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
}`,...V.parameters?.docs?.source}}},H.parameters={...H.parameters,docs:{...H.parameters?.docs,source:{originalSource:`{
  name: 'Mobile situations / Swipe to dismiss',
  render: () => <MobileCanvas title="Swipe dismissal" description="Swipe is an enhancement only; the surface fades as it approaches the edge, and the visible close button remains the simple alternative.">
      <ToastViewport position="topEnd" isTopLayer={false} maxVisible={2}>
        <MockCard>
          <Text type="supporting" color="secondary">
            Use touch or pen input, or browser touch emulation, to swipe the
            toast toward its configured block edge: up for top placement, down
            for bottom placement. This matches the direction each Toast enters
            and exits, keeping one spatial model for the whole interaction. The
            gesture claims the touch only after dominant travel matches the
            dismiss edge, so opposite-direction and horizontal page scrolling
            remain available. Pen is supported as direct-contact input; mouse
            dragging is ignored to avoid conflicting with desktop text
            selection, where the close button remains available.
          </Text>
          <ToastReplayControls items={[{
          key: 'mobile-swipe-dismiss',
          body: 'Swipe or close me',
          isAutoHide: false
        }]} />
        </MockCard>
      </ToastViewport>
    </MobileCanvas>,
  parameters: {
    ...mobileStoryParameters,
    docs: {
      story: {
        ...mobileStoryParameters.docs.story,
        description: 'Interactive vertical edge swipe-to-dismiss example using real ToastViewport behavior. The vertical axis intentionally matches the Toast placement and motion model: top Toasts leave upward and bottom Toasts leave downward. A non-passive touchmove handoff claims only dominant travel toward that edge; opposite-direction and horizontal page scrolling remain available. Pen is supported as direct-contact input, while mouse drag is excluded to avoid conflicting with desktop selection; the close button and F6 keyboard access remain available.'
      }
    }
  }
}`,...H.parameters?.docs?.source}}},U.parameters={...U.parameters,docs:{...U.parameters?.docs,source:{originalSource:`{
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
}`,...U.parameters?.docs?.source}}},W.parameters={...W.parameters,docs:{...W.parameters?.docs,source:{originalSource:`{
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
}`,...W.parameters?.docs?.source}}},G.parameters={...G.parameters,docs:{...G.parameters?.docs,source:{originalSource:`{
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
}`,...G.parameters?.docs?.source}}},K.parameters={...K.parameters,docs:{...K.parameters?.docs,source:{originalSource:`{
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
}`,...K.parameters?.docs?.source}}},J.parameters={...J.parameters,docs:{...J.parameters?.docs,source:{originalSource:`{
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
}`,...J.parameters?.docs?.source},description:{story:"Default and themed, side by side, in both types. These are inline `Toast`\nelements rather than fired ones so both states stay on screen together;\n`ThemedToastLive` shows the same theme driving real `useToast()` calls.",...J.parameters?.docs?.description}}},Y.parameters={...Y.parameters,docs:{...Y.parameters?.docs,source:{originalSource:`{
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
}`,...Y.parameters?.docs?.source},description:{story:`The copyable shape: wrap the viewport in the theme and fire toasts normally.`,...Y.parameters?.docs?.description}}},Z.parameters={...Z.parameters,docs:{...Z.parameters?.docs,source:{originalSource:`{
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
        <Button label="Layout without a close" variant="ghost" onClick={() => {
        toast({
          body: 'This layout relies on auto-hide.',
          renderContent: toastProps => <ContentWithoutDismiss {...toastProps} />
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
        story: "\`renderContent\` replaces the content of one toast's card and receives a \`dismiss\` callback. The custom layout composes its own Astryx \`Button\`; a layout without a close is left as-is and can rely on auto-hide. The last button omits \`renderContent\`, showing the ordinary Astryx layout and dismiss control."
      }
    }
  }
}`,...Z.parameters?.docs?.source}}},Q.parameters={...Q.parameters,docs:{...Q.parameters?.docs,source:{originalSource:`{
  name: 'Logical placement follows direction',
  render: function LogicalPlacementStory() {
    return <ToastViewport position="bottomEnd" maxVisible={1}>
        <LogicalPlacementTrigger />
      </ToastViewport>;
  },
  parameters: {
    docs: {
      description: {
        story: '\`bottomEnd\` is a logical placement: the toast sits on the inline END edge, which is the right in LTR and the left in RTL. The viewport spans the inline axis and aligns the card within itself, so the card follows the document direction with no per-direction styling.'
      }
    }
  }
}`,...Q.parameters?.docs?.source},description:{story:"The viewport is rendered IN THE STORY TREE, not through the provider-less\nfallback the other stories use, and `isTopLayer` keeps its default.\n\nBoth details are load-bearing for the RTL audit:\n\n- the fallback container is appended to `<body>`, outside the decorator that\n  sets `dir`, so a toast raised there can never flip and reads as a false\n  not-RTL;\n- `isTopLayer={false}` drops the `popover` attribute, and with it the UA\n  `width: fit-content` this placement has to survive — a story without the\n  popover would pass whether or not the viewport can span the inline axis.",...Q.parameters?.docs?.description}}},$=[`Default`,`Types`,`WithAction`,`ErrorPersists`,`ProgrammaticDismiss`,`Deduplication`,`Stacking`,`NarrowLayoutReference`,`MobileRtlSafeAreaPlacement`,`MobileSwipeToDismiss`,`MobileMotionEdgeAwareEntrance`,`NestedViewportLandmark`,`NoProvider`,`ToastOverDialog`,`ThemedToast`,`ThemedToastLive`,`CustomContent`,`LogicalPlacement`]}))();export{Z as CustomContent,R as Deduplication,N as Default,I as ErrorPersists,Q as LogicalPlacement,U as MobileMotionEdgeAwareEntrance,V as MobileRtlSafeAreaPlacement,H as MobileSwipeToDismiss,B as NarrowLayoutReference,W as NestedViewportLandmark,G as NoProvider,L as ProgrammaticDismiss,z as Stacking,J as ThemedToast,Y as ThemedToastLive,K as ToastOverDialog,P as Types,F as WithAction,$ as __namedExportsOrder,M as default};