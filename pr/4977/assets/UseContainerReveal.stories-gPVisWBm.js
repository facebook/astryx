import{i as e,s as t}from"./preload-helper-CT_b8DTk.js";import{t as n}from"./react-B7Te67-h.js";import{F as r,t as i}from"./utils-CS5QvixW.js";import{t as a}from"./jsx-runtime-DqZldVDK.js";import{t as o}from"./Button-BEzcgIb8.js";import{t as s}from"./Button-C1Gx4n65.js";import{t as c}from"./hooks-CYpYUT8_.js";import{n as l}from"./useContainerReveal-Diba5MtF.js";import{I as u,m as d,t as f}from"./esm-DA7gAIBC.js";function p({label:e}){let{getContainerProps:t,getContentRevealProps:n}=l();return(0,h.jsxs)(`div`,{...r(t(),{className:`x78zum5 x6s0dn4 x1qughib x1v2ro7d x153ncpu xur7f20 xmkeg23 x1y0btm7 x16e1oh1 x1md70p1 x17n6gb2`}),children:[(0,h.jsx)(`span`,{className:`xif65rj`,children:e}),(0,h.jsxs)(`span`,{...r(n(),{className:`x78zum5 x1jnr06f`}),children:[(0,h.jsx)(o,{label:`Edit ${e}`,variant:`ghost`,isIconOnly:!0,icon:(0,h.jsx)(u,{style:{width:16,height:16}})}),(0,h.jsx)(o,{label:`Delete ${e}`,variant:`ghost`,isIconOnly:!0,icon:(0,h.jsx)(d,{style:{width:16,height:16}})})]})]})}var m,h,g,_,v,y,b,x,S,C;e((()=>{m=t(n()),c(),s(),i(),f(),h=a(),g={title:`Hooks/useContainerReveal`},_={render:()=>(0,h.jsxs)(`div`,{className:`x78zum5 xdt5ytf x167g77z xxc7z9f`,children:[(0,h.jsx)(`p`,{className:`xfifm61 x1g3taxb x1e56ztr`,children:`Hover a row — or press Tab to focus into it — to reveal its actions. On touch devices the actions are always visible.`}),(0,h.jsx)(p,{label:`report.pdf`}),(0,h.jsx)(p,{label:`budget.xlsx`}),(0,h.jsx)(p,{label:`notes.txt`})]})},v={render:()=>{function e({label:e}){let{getContainerProps:t,getContentRevealProps:n}=l();return(0,h.jsxs)(`div`,{...r(t(),{className:`x78zum5 x6s0dn4 x1qughib x1v2ro7d x153ncpu xur7f20 xmkeg23 x1y0btm7 x16e1oh1 x1md70p1 x17n6gb2`}),children:[(0,h.jsx)(`span`,{className:`xif65rj`,children:e}),(0,h.jsx)(`span`,{...r(n({isRevealInverted:!0}),{className:`xif65rj`}),children:`edited 2h ago`})]})}return(0,h.jsxs)(`div`,{className:`x78zum5 xdt5ytf x167g77z xxc7z9f`,children:[(0,h.jsx)(`p`,{className:`xfifm61 x1g3taxb x1e56ztr`,children:`The timestamp shows at rest and fades out on mouse hover (a visual declutter). It stays put for keyboard and touch users.`}),(0,h.jsx)(e,{label:`report.pdf`}),(0,h.jsx)(e,{label:`budget.xlsx`})]})}},y={render:()=>{function e({label:e}){let{getContainerProps:t,getContentRevealProps:n}=l();return(0,h.jsxs)(`div`,{...r(t(),{className:`x78zum5 x6s0dn4 x1qughib x1v2ro7d x153ncpu xur7f20 xmkeg23 x1y0btm7 x16e1oh1 x1md70p1 x17n6gb2`}),children:[(0,h.jsx)(`span`,{className:`xif65rj`,children:e}),(0,h.jsx)(`span`,{...r(n({isLayoutPreserved:!0}),{className:`x78zum5 x1jnr06f`}),children:(0,h.jsx)(o,{label:`Delete ${e}`,variant:`ghost`,isIconOnly:!0,icon:(0,h.jsx)(d,{style:{width:16,height:16}})})})]})}return(0,h.jsxs)(`div`,{className:`x78zum5 xdt5ytf x167g77z xxc7z9f`,children:[(0,h.jsx)(`p`,{className:`xfifm61 x1g3taxb x1e56ztr`,children:`The action's space is reserved even while hidden — no reflow when it fades in.`}),(0,h.jsx)(e,{label:`report.pdf`}),(0,h.jsx)(e,{label:`budget.xlsx`})]})}},b={render:()=>(0,h.jsxs)(`div`,{className:`x78zum5 xdt5ytf x167g77z xxc7z9f`,children:[(0,h.jsx)(`p`,{className:`xfifm61 x1g3taxb x1e56ztr`,children:`Hover the outer row: only its own actions appear. The nested row keeps its actions hidden until you hover it directly — proof that the pool gives each container an isolated marker.`}),(0,h.jsxs)(`div`,{children:[(0,h.jsx)(p,{label:`Parent folder`}),(0,h.jsx)(`div`,{className:`x1xmf6yo xefazk8 xyumdvf x1t7ytsu xwq3efc xmzvs34`,children:(0,h.jsx)(p,{label:`Nested file`})})]})]})},x={render:()=>(0,h.jsxs)(`div`,{className:`x78zum5 xdt5ytf x167g77z xxc7z9f`,children:[(0,h.jsx)(`p`,{className:`xfifm61 x1g3taxb x1e56ztr`,children:`Twenty rows on one page. Hover any row — including the last — to reveal its actions.`}),Array.from({length:20},(e,t)=>(0,h.jsx)(p,{label:`file-${String(t+1).padStart(2,`0`)}.txt`},t))]})},S={render:()=>{function e(){let[e,t]=(0,m.useState)(!0),{getContainerProps:n,getContentRevealProps:i}=l({isEnabled:e});return(0,h.jsxs)(`div`,{className:`x78zum5 xdt5ytf x167g77z xxc7z9f`,children:[(0,h.jsx)(`div`,{className:`x1e56ztr`,children:(0,h.jsx)(o,{label:e?`Reveal on hover`:`Always visible`,variant:`secondary`,onClick:()=>t(e=>!e)})}),(0,h.jsxs)(`div`,{...r(n(),{className:`x78zum5 x6s0dn4 x1qughib x1v2ro7d x153ncpu xur7f20 xmkeg23 x1y0btm7 x16e1oh1 x1md70p1 x17n6gb2`}),children:[(0,h.jsx)(`span`,{className:`xif65rj`,children:`report.pdf`}),(0,h.jsx)(`span`,{...r(i(),{className:`x78zum5 x1jnr06f`}),children:(0,h.jsx)(o,{label:`Delete report.pdf`,variant:`ghost`,isIconOnly:!0,icon:(0,h.jsx)(d,{style:{width:16,height:16}})})})]})]})}return(0,h.jsx)(e,{})}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  render: () => <div {...stylex.props(styles.stack)}>
      <p {...stylex.props(styles.hint)}>
        Hover a row — or press Tab to focus into it — to reveal its actions. On
        touch devices the actions are always visible.
      </p>
      <RevealRow label="report.pdf" />
      <RevealRow label="budget.xlsx" />
      <RevealRow label="notes.txt" />
    </div>
}`,..._.parameters?.docs?.source},description:{story:`Hover or tab into a row to reveal its actions.`,..._.parameters?.docs?.description}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  render: () => {
    function ConcealRow({
      label
    }: {
      label: string;
    }) {
      const {
        getContainerProps,
        getContentRevealProps
      } = useContainerReveal();
      return <div {...mergeProps(getContainerProps(), stylex.props(styles.row))}>
          <span {...stylex.props(styles.label)}>{label}</span>
          <span {...mergeProps(getContentRevealProps({
          isRevealInverted: true
        }), stylex.props(styles.label))}>
            edited 2h ago
          </span>
        </div>;
    }
    return <div {...stylex.props(styles.stack)}>
        <p {...stylex.props(styles.hint)}>
          The timestamp shows at rest and fades out on mouse hover (a visual
          declutter). It stays put for keyboard and touch users.
        </p>
        <ConcealRow label="report.pdf" />
        <ConcealRow label="budget.xlsx" />
      </div>;
  }
}`,...v.parameters?.docs?.source},description:{story:`Inverted: content is visible at rest and fades OUT on hover. Mouse-only —
it never hides on keyboard focus and stays visible on touch.`,...v.parameters?.docs?.description}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  render: () => {
    function PreserveRow({
      label
    }: {
      label: string;
    }) {
      const {
        getContainerProps,
        getContentRevealProps
      } = useContainerReveal();
      return <div {...mergeProps(getContainerProps(), stylex.props(styles.row))}>
          <span {...stylex.props(styles.label)}>{label}</span>
          <span {...mergeProps(getContentRevealProps({
          isLayoutPreserved: true
        }), stylex.props(styles.actions))}>
            <Button label={\`Delete \${label}\`} variant="ghost" isIconOnly icon={<TrashIcon style={{
            width: 16,
            height: 16
          }} />} />
          </span>
        </div>;
    }
    return <div {...stylex.props(styles.stack)}>
        <p {...stylex.props(styles.hint)}>
          The action's space is reserved even while hidden — no reflow when it
          fades in.
        </p>
        <PreserveRow label="report.pdf" />
        <PreserveRow label="budget.xlsx" />
      </div>;
  }
}`,...y.parameters?.docs?.source},description:{story:`Layout-preserved reveal reserves the action's box at rest, so surrounding
content does not shift when it appears.`,...y.parameters?.docs?.description}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  render: () => <div {...stylex.props(styles.stack)}>
      <p {...stylex.props(styles.hint)}>
        Hover the outer row: only its own actions appear. The nested row keeps
        its actions hidden until you hover it directly — proof that the pool
        gives each container an isolated marker.
      </p>
      <div>
        <RevealRow label="Parent folder" />
        <div {...stylex.props(styles.nested)}>
          <RevealRow label="Nested file" />
        </div>
      </div>
    </div>
}`,...b.parameters?.docs?.source},description:{story:`Nested containers each get their own scoped marker from the pool, so
hovering the outer row does NOT reveal the inner row's actions.`,...b.parameters?.docs?.description}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  render: () => <div {...stylex.props(styles.stack)}>
      <p {...stylex.props(styles.hint)}>
        Twenty rows on one page. Hover any row — including the last — to reveal
        its actions.
      </p>
      {Array.from({
      length: 20
    }, (_, i) => <RevealRow key={i} label={\`file-\${String(i + 1).padStart(2, '0')}.txt\`} />)}
    </div>
}`,...x.parameters?.docs?.source},description:{story:`A flat list of 20 rows. Sibling containers never nest, so every row can share
the same reveal scope: hovering one row reveals only that row's actions, and
mounting the list produces no console warnings.`,...x.parameters?.docs?.description}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  render: () => {
    function ToggleRow() {
      const [isEnabled, setIsEnabled] = useState(true);
      const {
        getContainerProps,
        getContentRevealProps
      } = useContainerReveal({
        isEnabled
      });
      return <div {...stylex.props(styles.stack)}>
          <div {...stylex.props(styles.toggle)}>
            <Button label={isEnabled ? 'Reveal on hover' : 'Always visible'} variant="secondary" onClick={() => setIsEnabled(v => !v)} />
          </div>
          <div {...mergeProps(getContainerProps(), stylex.props(styles.row))}>
            <span {...stylex.props(styles.label)}>report.pdf</span>
            <span {...mergeProps(getContentRevealProps(), stylex.props(styles.actions))}>
              <Button label="Delete report.pdf" variant="ghost" isIconOnly icon={<TrashIcon style={{
              width: 16,
              height: 16
            }} />} />
            </span>
          </div>
        </div>;
    }
    return <ToggleRow />;
  }
}`,...S.parameters?.docs?.source},description:{story:"`isEnabled` is read on every render: flipping it off removes the reveal\nstyles and leaves the content permanently visible.",...S.parameters?.docs?.description}}},C=[`Reveal`,`InvertedConceal`,`PreserveLayout`,`NestedIsolation`,`ManyRows`,`ToggleEnabled`]}))();export{v as InvertedConceal,x as ManyRows,b as NestedIsolation,y as PreserveLayout,_ as Reveal,S as ToggleEnabled,C as __namedExportsOrder,g as default};