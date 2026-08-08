import{i as e}from"./preload-helper-CT_b8DTk.js";import{O as t,t as n}from"./utils-BJaJxLWb.js";import{t as r}from"./jsx-runtime-DqZldVDK.js";import{t as i}from"./Button-BFD6GiYi.js";import{t as a}from"./Button-X6l2NvUd.js";import{t as o}from"./hooks-DaZeOXU6.js";import{n as s}from"./useContainerReveal-RcBXrxcH.js";import{I as c,m as l,t as u}from"./esm-DA7gAIBC.js";function d({label:e}){let{getContainerProps:n,getContentRevealProps:r}=s();return(0,f.jsxs)(`div`,{...t(n(),{className:`x78zum5 x6s0dn4 x1qughib x1v2ro7d x153ncpu xur7f20 xmkeg23 x1y0btm7 x16e1oh1 x1md70p1 x17n6gb2`}),children:[(0,f.jsx)(`span`,{className:`xif65rj`,children:e}),(0,f.jsxs)(`span`,{...t(r(),{className:`x78zum5 x1jnr06f`}),children:[(0,f.jsx)(i,{label:`Edit ${e}`,variant:`ghost`,isIconOnly:!0,icon:(0,f.jsx)(c,{style:{width:16,height:16}})}),(0,f.jsx)(i,{label:`Delete ${e}`,variant:`ghost`,isIconOnly:!0,icon:(0,f.jsx)(l,{style:{width:16,height:16}})})]})]})}var f,p,m,h,g,_,v;e((()=>{o(),a(),n(),u(),f=r(),p={title:`Hooks/useContainerReveal`},m={render:()=>(0,f.jsxs)(`div`,{className:`x78zum5 xdt5ytf x167g77z xxc7z9f`,children:[(0,f.jsx)(`p`,{className:`xfifm61 x1g3taxb x1e56ztr`,children:`Hover a row — or press Tab to focus into it — to reveal its actions. On touch devices the actions are always visible.`}),(0,f.jsx)(d,{label:`report.pdf`}),(0,f.jsx)(d,{label:`budget.xlsx`}),(0,f.jsx)(d,{label:`notes.txt`})]})},h={render:()=>{function e({label:e}){let{getContainerProps:n,getContentRevealProps:r}=s();return(0,f.jsxs)(`div`,{...t(n(),{className:`x78zum5 x6s0dn4 x1qughib x1v2ro7d x153ncpu xur7f20 xmkeg23 x1y0btm7 x16e1oh1 x1md70p1 x17n6gb2`}),children:[(0,f.jsx)(`span`,{className:`xif65rj`,children:e}),(0,f.jsx)(`span`,{...t(r({isRevealInverted:!0}),{className:`xif65rj`}),children:`edited 2h ago`})]})}return(0,f.jsxs)(`div`,{className:`x78zum5 xdt5ytf x167g77z xxc7z9f`,children:[(0,f.jsx)(`p`,{className:`xfifm61 x1g3taxb x1e56ztr`,children:`The timestamp shows at rest and fades out on mouse hover (a visual declutter). It stays put for keyboard and touch users.`}),(0,f.jsx)(e,{label:`report.pdf`}),(0,f.jsx)(e,{label:`budget.xlsx`})]})}},g={render:()=>{function e({label:e}){let{getContainerProps:n,getContentRevealProps:r}=s();return(0,f.jsxs)(`div`,{...t(n(),{className:`x78zum5 x6s0dn4 x1qughib x1v2ro7d x153ncpu xur7f20 xmkeg23 x1y0btm7 x16e1oh1 x1md70p1 x17n6gb2`}),children:[(0,f.jsx)(`span`,{className:`xif65rj`,children:e}),(0,f.jsx)(`span`,{...t(r({isLayoutPreserved:!0}),{className:`x78zum5 x1jnr06f`}),children:(0,f.jsx)(i,{label:`Delete ${e}`,variant:`ghost`,isIconOnly:!0,icon:(0,f.jsx)(l,{style:{width:16,height:16}})})})]})}return(0,f.jsxs)(`div`,{className:`x78zum5 xdt5ytf x167g77z xxc7z9f`,children:[(0,f.jsx)(`p`,{className:`xfifm61 x1g3taxb x1e56ztr`,children:`The action's space is reserved even while hidden — no reflow when it fades in.`}),(0,f.jsx)(e,{label:`report.pdf`}),(0,f.jsx)(e,{label:`budget.xlsx`})]})}},_={render:()=>(0,f.jsxs)(`div`,{className:`x78zum5 xdt5ytf x167g77z xxc7z9f`,children:[(0,f.jsx)(`p`,{className:`xfifm61 x1g3taxb x1e56ztr`,children:`Hover the outer row: only its own actions appear. The nested row keeps its actions hidden until you hover it directly — proof that the pool gives each container an isolated marker.`}),(0,f.jsxs)(`div`,{children:[(0,f.jsx)(d,{label:`Parent folder`}),(0,f.jsx)(`div`,{className:`x1xmf6yo xefazk8 xyumdvf x1t7ytsu xwq3efc xmzvs34`,children:(0,f.jsx)(d,{label:`Nested file`})})]})]})},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  render: () => <div {...stylex.props(styles.stack)}>
      <p {...stylex.props(styles.hint)}>
        Hover a row — or press Tab to focus into it — to reveal its actions.
        On touch devices the actions are always visible.
      </p>
      <RevealRow label="report.pdf" />
      <RevealRow label="budget.xlsx" />
      <RevealRow label="notes.txt" />
    </div>
}`,...m.parameters?.docs?.source},description:{story:`Hover or tab into a row to reveal its actions.`,...m.parameters?.docs?.description}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
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
}`,...h.parameters?.docs?.source},description:{story:`Inverted: content is visible at rest and fades OUT on hover. Mouse-only —
it never hides on keyboard focus and stays visible on touch.`,...h.parameters?.docs?.description}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
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
}`,...g.parameters?.docs?.source},description:{story:`Layout-preserved reveal reserves the action's box at rest, so surrounding
content does not shift when it appears.`,...g.parameters?.docs?.description}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
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
}`,..._.parameters?.docs?.source},description:{story:`Nested containers each get their own scoped marker from the pool, so
hovering the outer row does NOT reveal the inner row's actions.`,..._.parameters?.docs?.description}}},v=[`Reveal`,`InvertedConceal`,`PreserveLayout`,`NestedIsolation`]}))();export{h as InvertedConceal,_ as NestedIsolation,g as PreserveLayout,m as Reveal,v as __namedExportsOrder,p as default};