import{i as e,s as t}from"./preload-helper-CT_b8DTk.js";import{t as n}from"./react-B7Te67-h.js";import{t as r}from"./jsx-runtime-DqZldVDK.js";import{t as i}from"./Button-BBk5Kqd0.js";import{t as a}from"./Button-CRpvXAU4.js";import{G as o,J as s,q as c}from"./iframe-DDpBXOWV.js";var l,u,d,f,p,m,h,g;e((()=>{l=t(n()),o(),a(),u=r(),d={title:`Core/AlertDialog`,component:s,tags:[`autodocs`],argTypes:{isOpen:{control:`boolean`},width:{control:`number`},actionVariant:{control:`select`,options:[`destructive`,`primary`,`secondary`,`ghost`]}}},f={render:()=>{let[e,t]=(0,l.useState)(!1);return(0,u.jsxs)(u.Fragment,{children:[(0,u.jsx)(i,{label:`Delete item`,variant:`destructive`,onClick:()=>t(!0)}),(0,u.jsx)(s,{isOpen:e,onOpenChange:t,title:`Delete item?`,description:`This action cannot be undone. The item and all its data will be permanently removed.`,actionLabel:`Delete`,onAction:()=>t(!1)})]})}},p={render:()=>{let[e,t]=(0,l.useState)(!1),[n,r]=(0,l.useState)(!1);return(0,u.jsxs)(u.Fragment,{children:[(0,u.jsx)(i,{label:`Revoke access`,variant:`destructive`,onClick:()=>t(!0)}),(0,u.jsx)(s,{isOpen:e,onOpenChange:t,title:`Revoke access?`,description:`This user will immediately lose access to all shared resources.`,actionLabel:`Revoke`,isActionLoading:n,onAction:async()=>{r(!0),await new Promise(e=>setTimeout(e,2e3)),r(!1),t(!1)}})]})}},m={render:()=>{let[e,t]=(0,l.useState)(!1);return(0,u.jsxs)(u.Fragment,{children:[(0,u.jsx)(i,{label:`Show notice`,variant:`secondary`,onClick:()=>t(!0)}),(0,u.jsx)(s,{isOpen:e,onOpenChange:t,title:`Session expired`,description:`Your session has expired. You will be redirected to the login page.`,actionLabel:`Sign in`,actionVariant:`primary`,onAction:()=>t(!1)})]})}},h={render:()=>{let e=c();return(0,u.jsxs)(u.Fragment,{children:[(0,u.jsx)(i,{label:`Delete item`,variant:`destructive`,onClick:()=>e.show({title:`Delete item?`,description:`This action cannot be undone.`,actionLabel:`Delete`,onAction:()=>e.hide()})}),e.element]})}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
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
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    return <>
        <Button label="Show notice" variant="secondary" onClick={() => setIsOpen(true)} />
        <AlertDialog isOpen={isOpen} onOpenChange={setIsOpen} title="Session expired" description="Your session has expired. You will be redirected to the login page." actionLabel="Sign in" actionVariant="primary" onAction={() => setIsOpen(false)} />
      </>;
  }
}`,...m.parameters?.docs?.source},description:{story:`Non-destructive confirmation with a primary action button.`,...m.parameters?.docs?.description}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
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
}`,...h.parameters?.docs?.source},description:{story:`Imperative API — no state management needed.`,...h.parameters?.docs?.description}}},g=[`Delete`,`Async`,`Informational`,`Imperative`]}))();export{p as Async,f as Delete,h as Imperative,m as Informational,g as __namedExportsOrder,d as default};