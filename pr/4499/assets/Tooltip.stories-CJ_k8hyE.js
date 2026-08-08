import{i as e}from"./preload-helper-CT_b8DTk.js";import{t}from"./jsx-runtime-DqZldVDK.js";import{n}from"./useTooltip-CuYgRONG.js";import{o as r}from"./useTheme-DZGE0wSZ.js";import{t as i}from"./Button-7X082der.js";import{t as a}from"./Button-9LqxE_eI.js";import{a as o}from"./ToastViewport-uD_s-Fef.js";import{t as s}from"./Tooltip-ChRSV1lz.js";import{t as c}from"./Tooltip-BVuNYEJ9.js";import{t as l,x as u}from"./theme-CliCdRh7.js";import{c as d,o as f,t as p}from"./Stack-BKfTR9z7.js";import{t as m}from"./Layout-CiV2S52P.js";import{k as h,l as g,s as _}from"./iframe-Cahu_dTc.js";var v,y,b,x,S,C,w,T,E,D,O,k,A,j,M,N,P,F;e((()=>{c(),a(),m(),p(),h(),l(),_(),v=t(),y={title:`Core/Tooltip`,component:s,tags:[`autodocs`],argTypes:{placement:{control:`select`,options:[`above`,`below`,`start`,`end`],description:`Position relative to trigger`},alignment:{control:`select`,options:[`start`,`center`,`end`],description:`Alignment on placement axis`},delay:{control:`number`,description:`Show delay in ms`},hideDelay:{control:`number`,description:`Hide delay in ms`},isEnabled:{control:`boolean`,description:`Enable/disable the tooltip`}}},b={args:{placement:`above`,content:`This is a helpful tooltip`,children:(0,v.jsx)(i,{label:`Hover me`,children:`Hover me`})}},x={args:{placement:`below`,content:`Tooltip appears below`,children:(0,v.jsx)(i,{label:`Hover me`,children:`Hover me`})}},S={args:{placement:`start`,content:`Tooltip on start`,children:(0,v.jsx)(i,{label:`Hover me`,children:`Hover me`})}},C={args:{placement:`end`,content:`Tooltip on end`,children:(0,v.jsx)(i,{label:`Hover me`,children:`Hover me`})}},w={args:{placement:`above`,delay:500,content:`Slower tooltip (500ms delay)`,children:(0,v.jsx)(i,{label:`Slow tooltip`,children:`Slow tooltip`})}},T={name:`Disabled Tooltip`,args:{placement:`above`,isEnabled:!1,content:`You should not see this`,children:(0,v.jsx)(i,{label:`Hover me`,children:`Hover me`})},parameters:{docs:{description:{story:"Demonstrates disabling the tooltip via the `isEnabled` prop. When `isEnabled` is `false`, the tooltip will not appear on hover or focus, even though the trigger element remains fully interactive. This is useful for conditionally showing tooltips based on application state."}}}},E={render:()=>(0,v.jsxs)(`div`,{style:{padding:100,display:`flex`,gap:24,flexWrap:`wrap`},children:[(0,v.jsx)(s,{content:`Above`,placement:`above`,children:(0,v.jsx)(i,{label:`Above`,children:`Above`})}),(0,v.jsx)(s,{content:`Below`,placement:`below`,children:(0,v.jsx)(i,{label:`Below`,children:`Below`})}),(0,v.jsx)(s,{content:`Start`,placement:`start`,children:(0,v.jsx)(i,{label:`Start`,children:`Start`})}),(0,v.jsx)(s,{content:`End`,placement:`end`,children:(0,v.jsx)(i,{label:`End`,children:`End`})})]})},D={render:function(){let e=n({placement:`above`,delay:100});return(0,v.jsxs)(`div`,{style:{padding:100},children:[(0,v.jsx)(i,{label:`Using hook directly`,ref:e.ref,"aria-describedby":e.describedBy,children:`Using hook directly`}),e.renderTooltip(`Tooltip via hook`)]})}},O={args:{placement:`above`,content:`This is a longer tooltip that contains more detailed information about the element.`,children:(0,v.jsx)(i,{label:`Hover for more info`,children:`Hover for more info`})}},k={render:()=>(0,v.jsx)(`div`,{style:{padding:100},children:(0,v.jsxs)(f,{gap:4,children:[(0,v.jsx)(s,{content:`Save your changes`,placement:`above`,children:(0,v.jsx)(i,{label:`Save`,children:`Save`})}),(0,v.jsx)(s,{content:`Discard changes`,placement:`above`,children:(0,v.jsx)(i,{label:`Cancel`,children:`Cancel`})}),(0,v.jsx)(s,{content:`Delete permanently`,placement:`above`,children:(0,v.jsx)(i,{label:`Delete`,variant:`destructive`,children:`Delete`})})]})})},A={render:()=>(0,v.jsx)(`div`,{style:{padding:100},children:(0,v.jsxs)(`p`,{children:[`This paragraph contains a`,` `,(0,v.jsx)(s,{content:`Tooltip on inline text!`,placement:`above`,children:`hover-able term`}),` `,`that explains what something means.`]})})},j={render:()=>(0,v.jsx)(`div`,{style:{padding:100},children:(0,v.jsxs)(`p`,{children:[`Learn more about our`,` `,(0,v.jsx)(s,{content:`Your data is encrypted and never shared`,placement:`above`,children:`privacy policy`}),` `,`and`,` `,(0,v.jsx)(s,{content:`Standard 30-day agreement`,placement:`above`,children:`terms of service`}),`.`]})})},M=r({name:`tooltip-normal-surface`,extends:g,surfaces:{tooltip:`normal`}}),N={render:()=>(0,v.jsxs)(d,{gap:4,children:[(0,v.jsxs)(`p`,{children:[`Tooltip renders on an inverted media surface by default (dark panel in a light app, light panel in a dark app). A theme can opt out with`,` `,(0,v.jsxs)(`code`,{children:[`surfaces: `,`{`,` tooltip: 'normal' `,`}`]}),`, so tooltips use the app's ordinary popover surface tokens instead. Each column pins an explicit mode so the light/dark inversion is visible; both tooltips are pinned open for comparison.`]}),[`light`,`dark`].map(e=>(0,v.jsxs)(d,{gap:2,children:[(0,v.jsxs)(`strong`,{children:[`Mode: `,e]}),(0,v.jsxs)(f,{gap:8,style:{padding:`72px 40px`},children:[(0,v.jsx)(u,{theme:g,mode:e,children:(0,v.jsxs)(d,{gap:2,hAlign:`center`,style:{backgroundColor:`var(--color-background-body)`,padding:16,borderRadius:12},children:[(0,v.jsx)(`strong`,{children:`Default (inverted)`}),(0,v.jsx)(s,{content:`Inverted surface tooltip`,isOpen:!0,placement:`below`,children:(0,v.jsx)(i,{label:`Default`,variant:`secondary`})})]})}),(0,v.jsx)(u,{theme:M,mode:e,children:(0,v.jsxs)(d,{gap:2,hAlign:`center`,style:{backgroundColor:`var(--color-background-body)`,padding:16,borderRadius:12},children:[(0,v.jsx)(`strong`,{children:`surfaces.tooltip = 'normal'`}),(0,v.jsx)(s,{content:`Normal surface tooltip`,isOpen:!0,placement:`below`,children:(0,v.jsx)(i,{label:`Opted out`,variant:`secondary`})})]})})]})]},e))]}),parameters:{docs:{description:{story:"Themes control whether Tooltip renders on the inverted media surface via `defineTheme({ surfaces: { tooltip: 'normal' } })`."}}}},P={render:()=>(0,v.jsxs)(d,{gap:4,children:[(0,v.jsxs)(`p`,{children:[`A tooltip rendered from a Toast's `,(0,v.jsx)(`code`,{children:`endContent`}),` now re-establishes its own inverted surface, so it stays legible instead of rendering dark-on-dark when nested inside the toast's already inverted surface.`]}),(0,v.jsx)(`div`,{style:{padding:`60px 40px`},children:(0,v.jsx)(u,{theme:g,mode:`light`,children:(0,v.jsx)(o,{type:`info`,body:`Workspace restored.`,isAutoHide:!1,autoHideDuration:0,onDismiss:()=>{},endContent:(0,v.jsx)(s,{content:`This tooltip is nested in the toast`,isOpen:!0,placement:`above`,children:(0,v.jsx)(i,{label:`Details`,variant:`ghost`,size:`sm`})})})})})]}),parameters:{docs:{description:{story:`Regression demo: because Tooltip and Toast share one media-surface mechanism, a tooltip nested inside an inverted toast re-establishes its own surface tokens and remains legible.`}}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  args: {
    placement: 'above',
    content: 'This is a helpful tooltip',
    children: <Button label="Hover me">Hover me</Button>
  }
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  args: {
    placement: 'below',
    content: 'Tooltip appears below',
    children: <Button label="Hover me">Hover me</Button>
  }
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  args: {
    placement: 'start',
    content: 'Tooltip on start',
    children: <Button label="Hover me">Hover me</Button>
  }
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  args: {
    placement: 'end',
    content: 'Tooltip on end',
    children: <Button label="Hover me">Hover me</Button>
  }
}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  args: {
    placement: 'above',
    delay: 500,
    content: 'Slower tooltip (500ms delay)',
    children: <Button label="Slow tooltip">Slow tooltip</Button>
  }
}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  name: 'Disabled Tooltip',
  args: {
    placement: 'above',
    isEnabled: false,
    content: 'You should not see this',
    children: <Button label="Hover me">Hover me</Button>
  },
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates disabling the tooltip via the \`isEnabled\` prop. When \`isEnabled\` is \`false\`, the tooltip will not appear on hover or focus, even though the trigger element remains fully interactive. This is useful for conditionally showing tooltips based on application state.'
      }
    }
  }
}`,...T.parameters?.docs?.source}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    padding: 100,
    display: 'flex',
    gap: 24,
    flexWrap: 'wrap'
  }}>
      <Tooltip content="Above" placement="above">
        <Button label="Above">Above</Button>
      </Tooltip>
      <Tooltip content="Below" placement="below">
        <Button label="Below">Below</Button>
      </Tooltip>
      <Tooltip content="Start" placement="start">
        <Button label="Start">Start</Button>
      </Tooltip>
      <Tooltip content="End" placement="end">
        <Button label="End">End</Button>
      </Tooltip>
    </div>
}`,...E.parameters?.docs?.source}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  render: function HookExample() {
    const tooltip = useTooltip({
      placement: 'above',
      delay: 100
    });
    return <div style={{
      padding: 100
    }}>
        <Button label="Using hook directly" ref={tooltip.ref} aria-describedby={tooltip.describedBy}>
          Using hook directly
        </Button>
        {tooltip.renderTooltip('Tooltip via hook')}
      </div>;
  }
}`,...D.parameters?.docs?.source}}},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
  args: {
    placement: 'above',
    content: 'This is a longer tooltip that contains more detailed information about the element.',
    children: <Button label="Hover for more info">Hover for more info</Button>
  }
}`,...O.parameters?.docs?.source}}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    padding: 100
  }}>
      <HStack gap={4}>
        <Tooltip content="Save your changes" placement="above">
          <Button label="Save">Save</Button>
        </Tooltip>
        <Tooltip content="Discard changes" placement="above">
          <Button label="Cancel">Cancel</Button>
        </Tooltip>
        <Tooltip content="Delete permanently" placement="above">
          <Button label="Delete" variant="destructive">
            Delete
          </Button>
        </Tooltip>
      </HStack>
    </div>
}`,...k.parameters?.docs?.source}}},A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    padding: 100
  }}>
      <p>
        This paragraph contains a{' '}
        <Tooltip content="Tooltip on inline text!" placement="above">
          hover-able term
        </Tooltip>{' '}
        that explains what something means.
      </p>
    </div>
}`,...A.parameters?.docs?.source}}},j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    padding: 100
  }}>
      <p>
        Learn more about our{' '}
        <Tooltip content="Your data is encrypted and never shared" placement="above">
          privacy policy
        </Tooltip>{' '}
        and{' '}
        <Tooltip content="Standard 30-day agreement" placement="above">
          terms of service
        </Tooltip>
        .
      </p>
    </div>
}`,...j.parameters?.docs?.source}}},N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
  render: () => <Stack gap={4}>
      <p>
        Tooltip renders on an inverted media surface by default (dark panel in a
        light app, light panel in a dark app). A theme can opt out with{' '}
        <code>
          surfaces: {'{'} tooltip: 'normal' {'}'}
        </code>
        , so tooltips use the app&apos;s ordinary popover surface tokens
        instead. Each column pins an explicit mode so the light/dark inversion
        is visible; both tooltips are pinned open for comparison.
      </p>
      {(['light', 'dark'] as const).map(mode => <Stack key={mode} gap={2}>
          <strong>Mode: {mode}</strong>
          <HStack gap={8} style={{
        padding: '72px 40px'
      }}>
            <Theme theme={neutralTheme} mode={mode}>
              <Stack gap={2} hAlign="center" style={{
            backgroundColor: 'var(--color-background-body)',
            padding: 16,
            borderRadius: 12
          }}>
                <strong>Default (inverted)</strong>
                <Tooltip content="Inverted surface tooltip" isOpen placement="below">
                  <Button label="Default" variant="secondary" />
                </Tooltip>
              </Stack>
            </Theme>
            <Theme theme={normalTooltipTheme} mode={mode}>
              <Stack gap={2} hAlign="center" style={{
            backgroundColor: 'var(--color-background-body)',
            padding: 16,
            borderRadius: 12
          }}>
                <strong>surfaces.tooltip = &apos;normal&apos;</strong>
                <Tooltip content="Normal surface tooltip" isOpen placement="below">
                  <Button label="Opted out" variant="secondary" />
                </Tooltip>
              </Stack>
            </Theme>
          </HStack>
        </Stack>)}
    </Stack>,
  parameters: {
    docs: {
      description: {
        story: "Themes control whether Tooltip renders on the inverted media surface via \`defineTheme({ surfaces: { tooltip: 'normal' } })\`."
      }
    }
  }
}`,...N.parameters?.docs?.source}}},P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
  render: () => {
    const noop = () => {};
    return <Stack gap={4}>
        <p>
          A tooltip rendered from a Toast&apos;s <code>endContent</code> now
          re-establishes its own inverted surface, so it stays legible instead
          of rendering dark-on-dark when nested inside the toast&apos;s already
          inverted surface.
        </p>
        <div style={{
        padding: '60px 40px'
      }}>
          <Theme theme={neutralTheme} mode="light">
            <Toast type="info" body="Workspace restored." isAutoHide={false} autoHideDuration={0} onDismiss={noop} endContent={<Tooltip content="This tooltip is nested in the toast" isOpen placement="above">
                  <Button label="Details" variant="ghost" size="sm" />
                </Tooltip>} />
          </Theme>
        </div>
      </Stack>;
  },
  parameters: {
    docs: {
      description: {
        story: 'Regression demo: because Tooltip and Toast share one media-surface mechanism, a tooltip nested inside an inverted toast re-establishes its own surface tokens and remains legible.'
      }
    }
  }
}`,...P.parameters?.docs?.source}}},F=[`Default`,`Below`,`Start`,`End`,`CustomDelay`,`Disabled`,`AllPlacements`,`WithHook`,`LongContent`,`MultipleTooltips`,`TextNode`,`TextNodeInline`,`ThemedSurfaceOptOut`,`InsideInvertedToast`]}))();export{E as AllPlacements,x as Below,w as CustomDelay,b as Default,T as Disabled,C as End,P as InsideInvertedToast,O as LongContent,k as MultipleTooltips,S as Start,A as TextNode,j as TextNodeInline,N as ThemedSurfaceOptOut,D as WithHook,F as __namedExportsOrder,y as default};