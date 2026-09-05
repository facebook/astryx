import{i as e}from"./preload-helper-CT_b8DTk.js";import{t}from"./jsx-runtime-DqZldVDK.js";import{N as n,P as r}from"./iframe-C4ugOAI1.js";var i,a,o,s,c,l,u,d,f,p,m,h,g,_,v,y,b,x,S,C,w;e((()=>{n(),i=t(),a={title:`Core/ProgressBar`,component:r,tags:[`autodocs`],argTypes:{value:{control:{type:`range`,min:0,max:100,step:1},description:`Current value`},max:{control:`number`,description:`Maximum value`},label:{control:`text`,description:`Accessible label`},variant:{control:`select`,options:[`accent`,`success`,`warning`,`error`,`neutral`],description:`Semantic color variant`},isLabelHidden:{control:`boolean`,description:`Visually hide the label`},hasValueLabel:{control:`boolean`,description:`Show formatted value`},isDisabled:{control:`boolean`,description:`Disabled state (grayed out)`}}},o={args:{value:60,label:`Progress`}},s={args:{value:75,label:`Storage used`,hasValueLabel:!0}},c={args:{value:3.2,max:5,label:`Disk usage`,hasValueLabel:!0,formatValueLabel:(e,t)=>`${e} GB / ${t} GB`}},l={render:()=>(0,i.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`16px`,width:`300px`},children:[(0,i.jsx)(r,{value:60,label:`Accent`,variant:`accent`,hasValueLabel:!0}),(0,i.jsx)(r,{value:80,label:`Success`,variant:`success`,hasValueLabel:!0}),(0,i.jsx)(r,{value:50,label:`Warning`,variant:`warning`,hasValueLabel:!0}),(0,i.jsx)(r,{value:92,label:`Error`,variant:`error`,hasValueLabel:!0}),(0,i.jsx)(r,{value:35,label:`Neutral`,variant:`neutral`,hasValueLabel:!0})]})},u={render:()=>(0,i.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`16px`,width:`300px`},children:[(0,i.jsx)(r,{value:30,label:`Upload canceled`,isDisabled:!0,hasValueLabel:!0}),(0,i.jsx)(r,{isIndeterminate:!0,label:`Processing disabled`,isDisabled:!0})]})},d={name:`Composed: with description`,render:()=>(0,i.jsxs)(`div`,{style:{width:`300px`},children:[(0,i.jsx)(r,{value:40,max:100,label:`Download progress`,hasValueLabel:!0}),(0,i.jsx)(`div`,{style:{fontSize:`12px`,color:`var(--color-text-secondary)`,marginTop:`4px`},children:`40 MB / 100 MB downloaded`})]})},f={args:{value:50,label:`Loading progress`,isLabelHidden:!0}},p={args:{value:75,label:`Upload`,isLabelHidden:!0,hasValueLabel:!0}},m={args:{value:0,label:`Not started`,hasValueLabel:!0}},h={args:{value:100,label:`Complete`,hasValueLabel:!0,variant:`success`}},g={args:{isIndeterminate:!0,label:`Loading...`}},_={args:{isIndeterminate:!0,label:`Loading`,isLabelHidden:!0}},v={render:()=>(0,i.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`16px`,width:`300px`},children:[(0,i.jsx)(r,{isIndeterminate:!0,label:`Accent`,variant:`accent`}),(0,i.jsx)(r,{isIndeterminate:!0,label:`Success`,variant:`success`}),(0,i.jsx)(r,{isIndeterminate:!0,label:`Warning`,variant:`warning`}),(0,i.jsx)(r,{isIndeterminate:!0,label:`Error`,variant:`error`}),(0,i.jsx)(r,{isIndeterminate:!0,label:`Neutral`,variant:`neutral`})]})},y={args:{value:45,label:`Fundraiser`,hasValueLabel:!0,marks:[{value:80,label:`Goal`}]}},b={args:{value:55,label:`Quarterly milestones`,hasValueLabel:!0,marks:[{value:25,label:`Q1 target`},{value:50,label:`Q2 target`},{value:80,label:`Stretch goal`}]}},x={args:{value:92,label:`Budget used`,hasValueLabel:!0,variant:`warning`,marks:[{value:75,label:`Budget cap`}]}},S={render:()=>{let e=[{value:30,label:`Mark at 30`},{value:85,label:`Mark at 85`}],t={display:`flex`,flexDirection:`column`,gap:`16px`,width:`320px`},n={font:`600 12px/1.4 system-ui, sans-serif`,textTransform:`uppercase`,letterSpacing:`0.06em`,opacity:.6,marginBlockEnd:`-4px`};return(0,i.jsxs)(`div`,{style:{...t,gap:`28px`},children:[(0,i.jsxs)(`div`,{style:t,children:[(0,i.jsx)(`div`,{style:n,children:`Semantic variants — 60% filled`}),[`accent`,`success`,`warning`,`error`,`neutral`].map(t=>(0,i.jsx)(r,{value:60,variant:t,label:t,hasValueLabel:!0,marks:e},t)),(0,i.jsx)(r,{value:60,isDisabled:!0,label:`disabled`,hasValueLabel:!0,marks:e})]}),(0,i.jsxs)(`div`,{style:t,children:[(0,i.jsx)(`div`,{style:n,children:`Fill extremes`}),(0,i.jsx)(r,{value:0,label:`0% — every mark on the track`,hasValueLabel:!0,marks:e}),(0,i.jsx)(r,{value:100,label:`100% — every mark on the fill`,hasValueLabel:!0,marks:e}),(0,i.jsx)(r,{value:30,label:`30% — a mark exactly at the fill edge`,hasValueLabel:!0,marks:e})]}),(0,i.jsxs)(`div`,{style:t,children:[(0,i.jsx)(`div`,{style:n,children:`Indeterminate — marks are ignored`}),(0,i.jsx)(r,{isIndeterminate:!0,label:`indeterminate`,marks:e})]})]})}},C={render:()=>(0,i.jsxs)(`div`,{style:{width:`320px`},children:[(0,i.jsx)(`style`,{children:`
        @layer astryx-theme {
          .themed-marks-demo .astryx-progress-bar-mark {
            background-color: red;
            --_progressbar-mark-width: 3px;
            --_progressbar-mark-height: 14px;
          }
        }
      `}),(0,i.jsx)(`div`,{className:`themed-marks-demo`,children:(0,i.jsx)(r,{value:55,label:`Themed target marks`,hasValueLabel:!0,marks:[{value:25,label:`Lower bound`},{value:80,label:`Upper bound`}]})})]})},o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    value: 60,
    label: 'Progress'
  }
}`,...o.parameters?.docs?.source}}},s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    value: 75,
    label: 'Storage used',
    hasValueLabel: true
  }
}`,...s.parameters?.docs?.source}}},c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    value: 3.2,
    max: 5,
    label: 'Disk usage',
    hasValueLabel: true,
    formatValueLabel: (value: number, max: number) => \`\${value} GB / \${max} GB\`
  }
}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    width: '300px'
  }}>
      <ProgressBar value={60} label="Accent" variant="accent" hasValueLabel />
      <ProgressBar value={80} label="Success" variant="success" hasValueLabel />
      <ProgressBar value={50} label="Warning" variant="warning" hasValueLabel />
      <ProgressBar value={92} label="Error" variant="error" hasValueLabel />
      <ProgressBar value={35} label="Neutral" variant="neutral" hasValueLabel />
    </div>
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    width: '300px'
  }}>
      <ProgressBar value={30} label="Upload canceled" isDisabled hasValueLabel />
      <ProgressBar isIndeterminate label="Processing disabled" isDisabled />
    </div>
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  name: 'Composed: with description',
  render: () => <div style={{
    width: '300px'
  }}>
      <ProgressBar value={40} max={100} label="Download progress" hasValueLabel />
      <div style={{
      fontSize: '12px',
      color: 'var(--color-text-secondary)',
      marginTop: '4px'
    }}>
        40 MB / 100 MB downloaded
      </div>
    </div>
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    value: 50,
    label: 'Loading progress',
    isLabelHidden: true
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    value: 75,
    label: 'Upload',
    isLabelHidden: true,
    hasValueLabel: true
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    value: 0,
    label: 'Not started',
    hasValueLabel: true
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    value: 100,
    label: 'Complete',
    hasValueLabel: true,
    variant: 'success'
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    isIndeterminate: true,
    label: 'Loading...'
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: {
    isIndeterminate: true,
    label: 'Loading',
    isLabelHidden: true
  }
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    width: '300px'
  }}>
      <ProgressBar isIndeterminate label="Accent" variant="accent" />
      <ProgressBar isIndeterminate label="Success" variant="success" />
      <ProgressBar isIndeterminate label="Warning" variant="warning" />
      <ProgressBar isIndeterminate label="Error" variant="error" />
      <ProgressBar isIndeterminate label="Neutral" variant="neutral" />
    </div>
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    value: 45,
    label: 'Fundraiser',
    hasValueLabel: true,
    marks: [{
      value: 80,
      label: 'Goal'
    }]
  }
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  args: {
    value: 55,
    label: 'Quarterly milestones',
    hasValueLabel: true,
    marks: [{
      value: 25,
      label: 'Q1 target'
    }, {
      value: 50,
      label: 'Q2 target'
    }, {
      value: 80,
      label: 'Stretch goal'
    }]
  }
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  args: {
    value: 92,
    label: 'Budget used',
    hasValueLabel: true,
    variant: 'warning',
    marks: [{
      value: 75,
      label: 'Budget cap'
    }]
  }
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  // A mark takes its color from what it sits on: inside the filled area it
  // uses the fill variant's on-color (on-accent / on-success / on-warning /
  // on-error), out on the bare track it uses the primary text color.
  // Neutral and disabled fill with the muted gray, which has no on-token, so
  // their marks keep one plain foreground on both sides — the primary text
  // color for a live neutral bar, the secondary one for a disabled bar, which
  // dims everything it draws.
  //
  // Every fill style is covered here: each semantic variant, the disabled
  // fill, both fill extremes (nothing filled / fully filled), and the
  // indeterminate fill, which ignores marks entirely.
  render: () => {
    const MARKS = [{
      value: 30,
      label: 'Mark at 30'
    }, {
      value: 85,
      label: 'Mark at 85'
    }];
    const section: React.CSSProperties = {
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      width: '320px'
    };
    const heading: React.CSSProperties = {
      font: '600 12px/1.4 system-ui, sans-serif',
      textTransform: 'uppercase',
      letterSpacing: '0.06em',
      opacity: 0.6,
      marginBlockEnd: '-4px'
    };
    return <div style={{
      ...section,
      gap: '28px'
    }}>
        <div style={section}>
          <div style={heading}>Semantic variants — 60% filled</div>
          {(['accent', 'success', 'warning', 'error', 'neutral'] as const).map(variant => <ProgressBar key={variant} value={60} variant={variant} label={variant} hasValueLabel marks={MARKS} />)}
          <ProgressBar value={60} isDisabled label="disabled" hasValueLabel marks={MARKS} />
        </div>

        <div style={section}>
          <div style={heading}>Fill extremes</div>
          <ProgressBar value={0} label="0% — every mark on the track" hasValueLabel marks={MARKS} />
          <ProgressBar value={100} label="100% — every mark on the fill" hasValueLabel marks={MARKS} />
          <ProgressBar value={30} label="30% — a mark exactly at the fill edge" hasValueLabel marks={MARKS} />
        </div>

        <div style={section}>
          <div style={heading}>Indeterminate — marks are ignored</div>
          <ProgressBar isIndeterminate label="indeterminate" marks={MARKS} />
        </div>
      </div>;
  }
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  // Marks are themeable directly via the \`progressbar-mark\` target: a theme sets
  // \`backgroundColor\`, \`width\`, and \`height\` on it with \`defineTheme\`. A taller
  // height overhangs the bar symmetrically above and below. The style block below
  // stands in for a full theme, in the shape \`astryx theme build\` emits — the
  // layer, and the size arriving as the derived vars rather than as \`width\` /
  // \`height\` — so the demo exercises the real theming path.
  render: () => <div style={{
    width: '320px'
  }}>
      <style>{\`
        @layer astryx-theme {
          .themed-marks-demo .astryx-progress-bar-mark {
            background-color: red;
            --_progressbar-mark-width: 3px;
            --_progressbar-mark-height: 14px;
          }
        }
      \`}</style>
      <div className="themed-marks-demo">
        <ProgressBar value={55} label="Themed target marks" hasValueLabel marks={[{
        value: 25,
        label: 'Lower bound'
      }, {
        value: 80,
        label: 'Upper bound'
      }]} />
      </div>
    </div>
}`,...C.parameters?.docs?.source}}},w=[`Default`,`WithValueLabel`,`CustomFormat`,`Variants`,`Disabled`,`ComposedWithDescription`,`HiddenLabel`,`HiddenLabelWithValue`,`Empty`,`Full`,`Indeterminate`,`IndeterminateHiddenLabel`,`IndeterminateVariants`,`WithTargetMark`,`WithMultipleMarks`,`ProgressPastMark`,`MarksAcrossVariants`,`ThemedMarks`]}))();export{d as ComposedWithDescription,c as CustomFormat,o as Default,u as Disabled,m as Empty,h as Full,f as HiddenLabel,p as HiddenLabelWithValue,g as Indeterminate,_ as IndeterminateHiddenLabel,v as IndeterminateVariants,S as MarksAcrossVariants,x as ProgressPastMark,C as ThemedMarks,l as Variants,b as WithMultipleMarks,y as WithTargetMark,s as WithValueLabel,w as __namedExportsOrder,a as default};