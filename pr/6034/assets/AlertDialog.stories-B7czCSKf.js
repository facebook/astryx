import{i as e,s as t}from"./preload-helper-CT_b8DTk.js";import{t as n}from"./react-B7Te67-h.js";import{t as r}from"./jsx-runtime-DqZldVDK.js";import{t as i}from"./Button-CJ0yeiFV.js";import{t as a}from"./Button-DBQO7xlr.js";import{K as o,W as s,q as c}from"./iframe-C9K_Xcjh.js";var l,u,d,f,p,m,h,g,_,v,y,b,x;e((()=>{l=t(n()),s(),a(),u=r(),d={title:`Core/AlertDialog`,component:c,tags:[`autodocs`],argTypes:{isOpen:{control:`boolean`},width:{control:`number`},actionVariant:{control:`select`,options:[`destructive`,`primary`,`secondary`,`ghost`]}}},f={render:()=>{let[e,t]=(0,l.useState)(!1);return(0,u.jsxs)(u.Fragment,{children:[(0,u.jsx)(i,{label:`Delete item`,variant:`destructive`,onClick:()=>t(!0)}),(0,u.jsx)(c,{isOpen:e,onOpenChange:t,title:`Delete item?`,description:`This action cannot be undone. The item and all its data will be permanently removed.`,actionLabel:`Delete`,onAction:()=>t(!1)})]})}},p={render:()=>{let[e,t]=(0,l.useState)(!1),[n,r]=(0,l.useState)(!1);return(0,u.jsxs)(u.Fragment,{children:[(0,u.jsx)(i,{label:`Revoke access`,variant:`destructive`,onClick:()=>t(!0)}),(0,u.jsx)(c,{isOpen:e,onOpenChange:t,title:`Revoke access?`,description:`This user will immediately lose access to all shared resources.`,actionLabel:`Revoke`,isActionLoading:n,onAction:async()=>{r(!0),await new Promise(e=>setTimeout(e,2e3)),r(!1),t(!1)}})]})}},m={args:{isOpen:!0,isInline:!0,title:`Delete item?`,description:`This action cannot be undone. The item and all its data will be permanently removed.`,actionLabel:`Delete`,onOpenChange:()=>{},onAction:()=>{}}},h={args:{isOpen:!0,isInline:!0,title:`Permanently delete this workspace?`,description:`Everyone will lose access to its dashboards, saved queries, and sharing links. This cannot be undone.`,cancelLabel:`Keep this workspace`,actionLabel:`Permanently delete workspace`,onOpenChange:()=>{},onAction:()=>{}}},g={args:h.args},_={render:()=>{let e=o();return(0,u.jsxs)(u.Fragment,{children:[(0,u.jsx)(i,{label:`Delete item`,variant:`destructive`,onClick:()=>e.show({title:`Delete item?`,description:`This action cannot be undone.`,actionLabel:`Delete`,onAction:()=>e.hide()})}),e.element]})}},v={render:()=>{let[e,t]=(0,l.useState)(!1);return(0,u.jsxs)(u.Fragment,{children:[(0,u.jsx)(i,{label:`Discard draft`,variant:`secondary`,onClick:()=>t(!0)}),(0,u.jsx)(c,{isOpen:e,onOpenChange:t,title:`Discard this draft?`,description:`Your unsaved edits will be lost.`,cancelLabel:`Keep editing`,actionLabel:`Discard`,onAction:()=>t(!1)})]})}},y={render:()=>{let[e,t]=(0,l.useState)(!1);return(0,u.jsxs)(u.Fragment,{children:[(0,u.jsx)(i,{label:`Delete workspace`,variant:`destructive`,onClick:()=>t(!0)}),(0,u.jsx)(c,{isOpen:e,onOpenChange:t,title:`Delete the entire Marketing Analytics workspace and everything inside it?`,description:`This removes 1,284 documents, 37 dashboards, every saved query, and all sharing links, for all 62 members of the workspace. Exports already scheduled will stop running. Anyone holding a link will get a 404 instead of the content. This cannot be undone, and support cannot restore it for you afterwards.`,actionLabel:`Delete workspace`,onAction:()=>t(!1)})]})}},b={args:{isOpen:!0,isInline:!0,title:`Delete item?`,description:`This action cannot be undone.`,actionLabel:`Delete`,onOpenChange:()=>{},onAction:()=>{}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    return <>
        <Button label="Delete item" variant="destructive" onClick={() => setIsOpen(true)} />
        <AlertDialog isOpen={isOpen} onOpenChange={setIsOpen} title="Delete item?" description="This action cannot be undone. The item and all its data will be permanently removed." actionLabel="Delete" onAction={() => setIsOpen(false)} />
      </>;
  }
}`,...f.parameters?.docs?.source},description:{story:`Delete confirmation — the most common alert dialog pattern.`,...f.parameters?.docs?.description}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    return <>
        <Button label="Revoke access" variant="destructive" onClick={() => setIsOpen(true)} />
        <AlertDialog isOpen={isOpen} onOpenChange={setIsOpen} title="Revoke access?" description="This user will immediately lose access to all shared resources." actionLabel="Revoke" isActionLoading={isLoading} onAction={async () => {
        setIsLoading(true);
        await new Promise(r => setTimeout(r, 2000));
        setIsLoading(false);
        setIsOpen(false);
      }} />
      </>;
  }
}`,...p.parameters?.docs?.source},description:{story:`Async action with loading state.`,...p.parameters?.docs?.description}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    isOpen: true,
    isInline: true,
    title: 'Delete item?',
    description: 'This action cannot be undone. The item and all its data will be permanently removed.',
    actionLabel: 'Delete',
    onOpenChange: () => {},
    onAction: () => {}
  }
}`,...m.parameters?.docs?.source},description:{story:`Wide reference state. In a wide viewport, Dialog preserves AlertDialog's
preferred 400px surface and AlertDialog renders a horizontal action row.`,...m.parameters?.docs?.description}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    isOpen: true,
    isInline: true,
    title: 'Permanently delete this workspace?',
    description: 'Everyone will lose access to its dashboards, saved queries, and sharing links. This cannot be undone.',
    cancelLabel: 'Keep this workspace',
    actionLabel: 'Permanently delete workspace',
    onOpenChange: () => {},
    onAction: () => {}
  }
}`,...h.parameters?.docs?.source},description:{story:`Narrow reference state. Use a <=640px viewport to see Dialog's width clamp
with AlertDialog's destructive-above-Cancel stacked action order.`,...h.parameters?.docs?.description}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: NarrowFinePointer.args
}`,...g.parameters?.docs?.source},description:{story:`Mobile reference state. Use a <=640px mobile viewport to verify the same
stacked action order; this story does not emulate pointer or hover capability.`,...g.parameters?.docs?.description}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  render: () => {
    const alert = useImperativeAlertDialog();
    return <>
        <Button label="Delete item" variant="destructive" onClick={() => alert.show({
        title: 'Delete item?',
        description: 'This action cannot be undone.',
        actionLabel: 'Delete',
        onAction: () => alert.hide()
      })} />
        {alert.element}
      </>;
  }
}`,..._.parameters?.docs?.source},description:{story:`Imperative API — no state management needed.`,..._.parameters?.docs?.description}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    return <>
        <Button label="Discard draft" variant="secondary" onClick={() => setIsOpen(true)} />
        <AlertDialog isOpen={isOpen} onOpenChange={setIsOpen} title="Discard this draft?" description="Your unsaved edits will be lost." cancelLabel="Keep editing" actionLabel="Discard" onAction={() => setIsOpen(false)} />
      </>;
  }
}`,...v.parameters?.docs?.source},description:{story:'A task-specific cancel label. Override `cancelLabel` when "Cancel" reads as\nambiguous next to the action, for example when both choices are verbs.',...v.parameters?.docs?.description}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    return <>
        <Button label="Delete workspace" variant="destructive" onClick={() => setIsOpen(true)} />
        <AlertDialog isOpen={isOpen} onOpenChange={setIsOpen} title="Delete the entire Marketing Analytics workspace and everything inside it?" description="This removes 1,284 documents, 37 dashboards, every saved query, and all sharing links, for all 62 members of the workspace. Exports already scheduled will stop running. Anyone holding a link will get a 404 instead of the content. This cannot be undone, and support cannot restore it for you afterwards." actionLabel="Delete workspace" onAction={() => setIsOpen(false)} />
      </>;
  }
}`,...y.parameters?.docs?.source},description:{story:`Long title and description. The dialog wraps rather than clipping, and the
footer buttons stay on screen; the body scrolls when the viewport is short.`,...y.parameters?.docs?.description}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  args: {
    isOpen: true,
    isInline: true,
    title: 'Delete item?',
    description: 'This action cannot be undone.',
    actionLabel: 'Delete',
    onOpenChange: () => {},
    onAction: () => {}
  }
}`,...b.parameters?.docs?.source},description:{story:'The inline preview path (`isInline`). Renders the content in place without\n`showModal()`, for documentation previews and showcases. It is not a modal:\nit does not trap focus, block the page, or respond to Escape — so it exposes\n`role="group"` rather than `role="alertdialog"`.',...b.parameters?.docs?.description}}},x=[`Delete`,`Async`,`DesktopFinePointer`,`NarrowFinePointer`,`MobileTouch`,`Imperative`,`CustomCancelLabel`,`LongContent`,`Inline`]}))();export{p as Async,v as CustomCancelLabel,f as Delete,m as DesktopFinePointer,_ as Imperative,b as Inline,y as LongContent,g as MobileTouch,h as NarrowFinePointer,x as __namedExportsOrder,d as default};