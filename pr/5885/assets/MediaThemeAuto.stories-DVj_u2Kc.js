import{i as e,s as t}from"./preload-helper-CT_b8DTk.js";import{t as n}from"./react-B7Te67-h.js";import{t as r}from"./jsx-runtime-DqZldVDK.js";import{t as i}from"./Text-BaZ3HAO5.js";import{t as a}from"./Button-CfW3rq_M.js";import{t as o}from"./Button-DewtwCMv.js";import{r as s,s as c}from"./useTheme-BjGFIaE4.js";import{t as l,x as u}from"./theme-DnizdbAi.js";import{t as d}from"./MediaTheme-CHjiJUP3.js";import{a as f}from"./ToastViewport-jkJHE-JK.js";import{c as p,t as m}from"./Stack-Dntpv-r2.js";import{t as h}from"./Text-BEcxgFn1.js";import{k as g}from"./iframe-CLaZ5kqw.js";function _({label:e,children:t}){return(0,C.jsxs)(p,{gap:2,children:[(0,C.jsx)(i,{type:`supporting`,color:`secondary`,children:e}),t]})}function v(){return(0,C.jsxs)(p,{direction:`horizontal`,gap:3,align:`center`,children:[(0,C.jsx)(i,{children:`Your changes were saved`}),(0,C.jsx)(a,{label:`Undo`,variant:`ghost`,size:`sm`})]})}function y(){let{mode:e}=s();return(0,C.jsx)(`div`,{style:D,children:(0,C.jsx)(d,{mode:e===`light`?`dark`:`light`,children:(0,C.jsx)(v,{})})})}function b(){return(0,C.jsx)(`div`,{style:D,children:(0,C.jsx)(d,{mode:`auto`,children:(0,C.jsx)(v,{})})})}var x,S,C,w,T,E,D,O,k,A,j,M,N,P;e((()=>{x=t(n()),S=t(n()),g(),l(),o(),h(),m(),C=r(),w={title:`Core/Themes/MediaTheme Auto`,parameters:{docs:{description:{component:'`MediaTheme mode="auto"` measures the surface the browser actually painted and decides from it: no media context when the surface\'s own text already reads on it (3:1, WCAG\'s non-text line), otherwise whichever side reads better. A theme is free to define `--color-background-inverted` as something that is not inverted, and a hardcoded `mode="dark"` then paints white text on pale grey — the surface color is a runtime value, so no compile-time guess can be right for every theme.'}}}},T=c({name:`flat-surface`,tokens:{"--color-background-inverted":[`#E4E6EB`,`#1C1F24`]}}),E=()=>{},D={backgroundColor:`var(--color-background-inverted)`,borderRadius:`var(--radius-container)`,padding:16,width:400,maxWidth:`100%`,boxShadow:`var(--shadow-med)`},O={render:function(){let{mode:e}=s();return(0,C.jsx)(u,{theme:T,mode:e,children:(0,C.jsxs)(p,{gap:5,children:[(0,C.jsxs)(i,{children:[`This theme sets `,(0,C.jsx)(`code`,{children:`--color-background-inverted`}),` to a pale grey in light mode and a near-black in dark mode — so the hardcoded rule is wrong in `,(0,C.jsx)(`em`,{children:`both`}),`. Toggle the color mode.`]}),(0,C.jsx)(_,{label:`Hardcoded — inverts because the page is light`,children:(0,C.jsx)(y,{})}),(0,C.jsx)(_,{label:`Auto — the surface reads fine already, so no media context`,children:(0,C.jsx)(b,{})})]})})},parameters:{docs:{description:{story:`Light mode: the hardcoded rule paints white on pale grey at 1.25:1; auto measures the theme's own text at 14.36:1, concludes the surface is not really inverted, and applies nothing (14.36:1). Dark mode is the mirror image — 1.08:1 becomes 15.83:1.`}}}},k={render:function(){return(0,C.jsxs)(p,{gap:5,children:[(0,C.jsx)(i,{children:`When the inverted surface really is inverted, auto agrees with the hardcoded rule — this is the no-change case.`}),(0,C.jsx)(_,{label:`Hardcoded`,children:(0,C.jsx)(y,{})}),(0,C.jsx)(_,{label:`Auto`,children:(0,C.jsx)(b,{})})]})}},A={render:function(){return(0,C.jsxs)(p,{gap:5,children:[(0,C.jsx)(_,{label:`Default`,children:(0,C.jsx)(f,{type:`info`,body:`Your changes were saved`,endContent:(0,C.jsx)(a,{label:`Undo`,variant:`ghost`,size:`sm`}),isAutoHide:!1,autoHideDuration:0,onDismiss:E})}),(0,C.jsx)(_,{label:`Error — a saturated surface, dark in both modes`,children:(0,C.jsx)(f,{type:`error`,body:`Could not reach the server`,isAutoHide:!1,autoHideDuration:0,onDismiss:E})})]})},parameters:{docs:{description:{story:'Toast passes `mode="auto"`, with its old rule kept only as the pre-measurement fallback. In light mode both surfaces invert. In dark mode the error surface resolves to `off`: its ambient text already reads at 4.50:1, and the rendering is pixel-identical to the media context, because a dark page already resolves those tokens to the same values.'}}}},j=`https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=600&h=200&fit=crop`,M={render:function(){return(0,C.jsxs)(p,{gap:4,style:{maxWidth:440},children:[(0,C.jsxs)(i,{children:[`A `,(0,C.jsx)(`code`,{children:`background-image`}),` has no color a stylesheet can report, and reading its pixels needs canvas sampling and CORS access — so auto declines to guess and uses `,(0,C.jsx)(`code`,{children:`fallback`}),`. For real image surfaces, sample with `,(0,C.jsx)(`code`,{children:`useImageMode`}),` and pass the result as an explicit mode.`]}),[`dark`,`light`].map(e=>(0,C.jsx)(`div`,{style:{backgroundImage:`url(${j})`,backgroundSize:`cover`,borderRadius:`var(--radius-container)`,padding:16},children:(0,C.jsx)(d,{mode:`auto`,fallback:e,children:(0,C.jsxs)(i,{children:[`fallback="`,e,`"`]})})},e))]})}},N={render:function(){let[e,t]=(0,S.useState)(`#E4E6EB`),[n,r]=(0,S.useState)(`auto`),i=(0,S.useRef)(null),[a,o]=(0,S.useState)(`—`);return x.useEffect(()=>{let e=i.current?.querySelector(`:scope > div`);o(e?.getAttribute(`data-astryx-media`)??`off`)}),(0,C.jsxs)(p,{gap:4,children:[(0,C.jsxs)(p,{direction:`horizontal`,gap:4,align:`center`,wrap:`wrap`,children:[(0,C.jsxs)(`label`,{style:{fontSize:13},children:[`Surface`,` `,(0,C.jsx)(`input`,{type:`color`,value:e,onChange:e=>t(e.target.value)})]}),(0,C.jsxs)(`label`,{style:{fontSize:13},children:[`mode`,` `,(0,C.jsxs)(`select`,{value:n,onChange:e=>r(e.target.value),children:[(0,C.jsx)(`option`,{value:`auto`,children:`auto`}),(0,C.jsx)(`option`,{value:`dark`,children:`dark`}),(0,C.jsx)(`option`,{value:`light`,children:`light`}),(0,C.jsx)(`option`,{value:`off`,children:`off`})]})]}),(0,C.jsxs)(`span`,{style:{fontFamily:`var(--font-family-mono, monospace)`,fontSize:12},children:[`resolved: `,(0,C.jsx)(`strong`,{children:a})]})]}),(0,C.jsx)(`div`,{ref:i,style:{backgroundColor:e,borderRadius:`var(--radius-container)`,padding:16,width:400,maxWidth:`100%`},children:(0,C.jsx)(d,{mode:n,children:(0,C.jsx)(v,{})})})]})},parameters:{docs:{description:{story:"Drag the surface through the greys on `auto`. Near the page's own text color it inverts; once the ambient pairing clears 3:1 it resolves to `off` and leaves the theme alone. Switch to `dark` or `light` to see what a hardcoded mode does on the same surface. The element stays put in every case, so children never remount."}}}},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
  render: function FlatSurfaceStory() {
    const {
      mode
    } = useTheme();
    return <Theme theme={flatSurfaceTheme} mode={mode}>
        <Stack gap={5}>
          <Text>
            This theme sets <code>--color-background-inverted</code> to a pale
            grey in light mode and a near-black in dark mode — so the hardcoded
            rule is wrong in <em>both</em>. Toggle the color mode.
          </Text>
          <SurfacePanel label="Hardcoded — inverts because the page is light">
            <HardcodedToast />
          </SurfacePanel>
          <SurfacePanel label="Auto — the surface reads fine already, so no media context">
            <AutoToast />
          </SurfacePanel>
        </Stack>
      </Theme>;
  },
  parameters: {
    docs: {
      description: {
        story: "Light mode: the hardcoded rule paints white on pale grey at 1.25:1; auto measures the theme's own text at 14.36:1, concludes the surface is not really inverted, and applies nothing (14.36:1). Dark mode is the mirror image — 1.08:1 becomes 15.83:1."
      }
    }
  }
}`,...O.parameters?.docs?.source}}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  render: function StockThemeStory() {
    return <Stack gap={5}>
        <Text>
          When the inverted surface really is inverted, auto agrees with the
          hardcoded rule — this is the no-change case.
        </Text>
        <SurfacePanel label="Hardcoded">
          <HardcodedToast />
        </SurfacePanel>
        <SurfacePanel label="Auto">
          <AutoToast />
        </SurfacePanel>
      </Stack>;
  }
}`,...k.parameters?.docs?.source}}},A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  render: function ToastVariantsStory() {
    return <Stack gap={5}>
        <SurfacePanel label="Default">
          <Toast type="info" body="Your changes were saved" endContent={<Button label="Undo" variant="ghost" size="sm" />} isAutoHide={false} autoHideDuration={0} onDismiss={noop} />
        </SurfacePanel>
        <SurfacePanel label="Error — a saturated surface, dark in both modes">
          <Toast type="error" body="Could not reach the server" isAutoHide={false} autoHideDuration={0} onDismiss={noop} />
        </SurfacePanel>
      </Stack>;
  },
  parameters: {
    docs: {
      description: {
        story: 'Toast passes \`mode="auto"\`, with its old rule kept only as the pre-measurement fallback. In light mode both surfaces invert. In dark mode the error surface resolves to \`off\`: its ambient text already reads at 4.50:1, and the rendering is pixel-identical to the media context, because a dark page already resolves those tokens to the same values.'
      }
    }
  }
}`,...A.parameters?.docs?.source}}},M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
  render: function UnmeasurableSurfaceStory() {
    return <Stack gap={4} style={{
      maxWidth: 440
    }}>
        <Text>
          A <code>background-image</code> has no color a stylesheet can report,
          and reading its pixels needs canvas sampling and CORS access — so auto
          declines to guess and uses <code>fallback</code>. For real image
          surfaces, sample with <code>useImageMode</code> and pass the result as
          an explicit mode.
        </Text>
        {(['dark', 'light'] as const).map(fallback => <div key={fallback} style={{
        backgroundImage: \`url(\${PHOTO})\`,
        backgroundSize: 'cover',
        borderRadius: 'var(--radius-container)',
        padding: 16
      }}>
            <MediaTheme mode="auto" fallback={fallback}>
              <Text>fallback="{fallback}"</Text>
            </MediaTheme>
          </div>)}
      </Stack>;
  }
}`,...M.parameters?.docs?.source}}},N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
  render: function PlaygroundStory() {
    const [surface, setSurface] = useState('#E4E6EB');
    const [mode, setMode] = useState<'auto' | 'dark' | 'light' | 'off'>('auto');
    const ref = useRef<HTMLDivElement>(null);
    const [applied, setApplied] = useState('—');

    // Read back what MediaTheme resolved to, so the probe reports the real
    // DOM rather than re-deriving the decision alongside it.
    React.useEffect(() => {
      const wrapper = ref.current?.querySelector(':scope > div');
      setApplied(wrapper?.getAttribute('data-astryx-media') ?? 'off');
    });
    return <Stack gap={4}>
        <Stack direction="horizontal" gap={4} align="center" wrap="wrap">
          <label style={{
          fontSize: 13
        }}>
            Surface{' '}
            <input type="color" value={surface} onChange={e => setSurface(e.target.value)} />
          </label>
          <label style={{
          fontSize: 13
        }}>
            mode{' '}
            <select value={mode} onChange={e => setMode(e.target.value as 'auto' | 'dark' | 'light' | 'off')}>
              <option value="auto">auto</option>
              <option value="dark">dark</option>
              <option value="light">light</option>
              <option value="off">off</option>
            </select>
          </label>
          <span style={{
          fontFamily: 'var(--font-family-mono, monospace)',
          fontSize: 12
        }}>
            resolved: <strong>{applied}</strong>
          </span>
        </Stack>

        <div ref={ref} style={{
        backgroundColor: surface,
        borderRadius: 'var(--radius-container)',
        padding: 16,
        width: 400,
        maxWidth: '100%'
      }}>
          <MediaTheme mode={mode}>
            <SurfaceBody />
          </MediaTheme>
        </div>
      </Stack>;
  },
  parameters: {
    docs: {
      description: {
        story: "Drag the surface through the greys on \`auto\`. Near the page's own text color it inverts; once the ambient pairing clears 3:1 it resolves to \`off\` and leaves the theme alone. Switch to \`dark\` or \`light\` to see what a hardcoded mode does on the same surface. The element stays put in every case, so children never remount."
      }
    }
  }
}`,...N.parameters?.docs?.source}}},P=[`FlatSurfaceTheme`,`StockTheme`,`ToastVariants`,`UnmeasurableSurface`,`Playground`]}))();export{O as FlatSurfaceTheme,N as Playground,k as StockTheme,A as ToastVariants,M as UnmeasurableSurface,P as __namedExportsOrder,w as default};