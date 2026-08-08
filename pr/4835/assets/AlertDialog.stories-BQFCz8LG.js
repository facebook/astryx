import{a as e,n as t}from"./rolldown-runtime-DkW27tQK.js";import{t as n}from"./react-BZJXY1be.js";import{i as r,n as i,r as a,t as o}from"./LayoutContent-Bp6k5ngv.js";import{n as s}from"./mergeProps-JRyAvMxc.js";import{n as c,t as l}from"./themeProps-CREkzZh6.js";import{n as u,t as d}from"./Text-BfjtEFtP.js";import{t as f}from"./jsx-runtime-DeHZSEgm.js";import{n as p,t as m}from"./Button-BVMvoKVE.js";import{n as h,t as g}from"./useTranslator-BMnme3me.js";import{n as _,t as v}from"./Dialog-kqrFWV1N.js";import{n as y,t as b}from"./Heading-CaMVckJS.js";import{n as x,t as S}from"./HStack-DtZv8gmp.js";import{n as C,t as w}from"./LayoutFooter-BqlHgkBi.js";function T({ref:e,isOpen:t,isInline:n,onOpenChange:r,title:i,description:l,cancelLabel:u,actionLabel:f,actionVariant:p=`destructive`,isActionLoading:g,onAction:_,width:y=400,xstyle:x,className:C,style:T,"data-testid":O,...k}){let A=h(),j=u??A(`@astryx.alertDialog.cancel`),M=(0,E.useId)(),N=(0,E.useId)(),P=(0,E.useCallback)(()=>{r(!1)},[r]);return(0,D.jsx)(v,{...k,ref:e,isOpen:t,isInline:n,onOpenChange:r,width:y,purpose:`form`,role:`alertdialog`,"aria-labelledby":M,"aria-describedby":N,...s(c(`alert-dialog`),{className:C,style:T}),xstyle:x,"data-testid":O,children:(0,D.jsx)(a,{content:(0,D.jsxs)(o,{children:[(0,D.jsx)(b,{level:2,id:M,children:i}),(0,D.jsx)(d,{type:`body`,color:`secondary`,id:N,children:l})]}),footer:(0,D.jsx)(w,{children:(0,D.jsxs)(S,{gap:2,hAlign:`end`,children:[(0,D.jsx)(m,{variant:`ghost`,label:j,onClick:P}),(0,D.jsx)(m,{variant:p,label:f,onClick:_,isLoading:g})]})})})})}var E,D;function O(){return(O=t((()=>{E=e(n(),1),_(),r(),i(),C(),x(),y(),u(),p(),l(),g(),D=f(),T.displayName=`AlertDialog`,T.__docgenInfo={description:`A confirmation dialog for destructive or irreversible actions.

Uses \`role="alertdialog"\` and requires explicit user action to dismiss.
Cannot be dismissed by clicking outside. Escape key triggers cancel.
Initial focus goes to the cancel button (least destructive action).

@example
\`\`\`
<AlertDialog
  isOpen={isOpen}
  onOpenChange={setIsOpen}
  title="Delete item?"
  description="This action cannot be undone."
  actionLabel="Delete"
  onAction={async () => { await deleteItem(); setIsOpen(false); }}
/>
\`\`\``,methods:[],displayName:`AlertDialog`,props:{xstyle:{required:!1,tsType:{name:`StyleXStyles`},description:"StyleX styles created via `stylex.create()`. Merged with the component's\nbase styles inside a single `stylex.props()` call for optimal deduplication.\n\n@example\n```\nconst overrides = stylex.create({ root: { marginBottom: 8 } });\n<Component xstyle={overrides.root} />\n```"},ref:{required:!1,tsType:{name:`ReactRef`,raw:`React.Ref<HTMLDialogElement>`,elements:[{name:`HTMLDialogElement`}]},description:``},isOpen:{required:!0,tsType:{name:`boolean`},description:`Whether the dialog is open.`},isInline:{required:!1,tsType:{name:`boolean`},description:`Renders alert dialog content inline without modal behavior.
For documentation previews and showcases only.
@default false`},onOpenChange:{required:!0,tsType:{name:`signature`,type:`function`,raw:`(isOpen: boolean) => unknown`,signature:{arguments:[{type:{name:`boolean`},name:`isOpen`}],return:{name:`unknown`}}},description:"Callback fired when the dialog visibility changes.\nCalled with `false` when cancel is clicked or Escape is pressed."},title:{required:!0,tsType:{name:`string`},description:"Dialog title. Linked to the dialog via `aria-labelledby`."},description:{required:!0,tsType:{name:`string`},description:"Consequence description. Linked to the dialog via `aria-describedby`."},cancelLabel:{required:!1,tsType:{name:`string`},description:`Label for the cancel button. Rendered as a ghost Button.
Clicking cancel calls \`onOpenChange(false)\`.
@default 'Cancel'`},actionLabel:{required:!0,tsType:{name:`string`},description:`Label for the action button.`},actionVariant:{required:!1,tsType:{name:`ButtonVariantMap`},description:`Variant for the action button.
@default 'destructive'`,defaultValue:{value:`'destructive'`,computed:!1}},isActionLoading:{required:!1,tsType:{name:`boolean`},description:`Whether the action button shows a loading spinner.`},onAction:{required:!0,tsType:{name:`signature`,type:`function`,raw:`() => unknown`,signature:{arguments:[],return:{name:`unknown`}}},description:"Callback fired when the action button is clicked.\nThe dialog does NOT auto-close — call `onOpenChange(false)` when done."},width:{required:!1,tsType:{name:`union`,raw:`number | string`,elements:[{name:`number`},{name:`string`}]},description:`The width of the dialog.
Numbers are treated as pixels, strings are used as-is.
@default 400`,defaultValue:{value:`400`,computed:!1}}},composes:[`Omit`]}})))()}function k(){let[e,t]=(0,A.useState)(!1),[n,r]=(0,A.useState)(null);return{show:(0,A.useCallback)(e=>{r(e),t(!0)},[]),hide:(0,A.useCallback)(()=>{t(!1)},[]),isOpen:e,element:(0,A.useMemo)(()=>n?(0,j.jsx)(T,{...n,isOpen:e,onOpenChange:e=>{e||t(!1)}}):null,[e,n])}}var A,j;function M(){return(M=t((()=>{A=n(),O(),j=f()})))()}var N,P,F,I,L,R,z,B;function V(){return(V=t((()=>{N=n(),O(),M(),p(),P=f(),F={title:`Core/AlertDialog`,component:T,tags:[`autodocs`],argTypes:{isOpen:{control:`boolean`},width:{control:`number`},actionVariant:{control:`select`,options:[`destructive`,`primary`,`secondary`,`ghost`]}}},I={render:()=>{let[e,t]=(0,N.useState)(!1);return(0,P.jsxs)(P.Fragment,{children:[(0,P.jsx)(m,{label:`Delete item`,variant:`destructive`,onClick:()=>t(!0)}),(0,P.jsx)(T,{isOpen:e,onOpenChange:t,title:`Delete item?`,description:`This action cannot be undone. The item and all its data will be permanently removed.`,actionLabel:`Delete`,onAction:()=>t(!1)})]})}},L={render:()=>{let[e,t]=(0,N.useState)(!1),[n,r]=(0,N.useState)(!1);return(0,P.jsxs)(P.Fragment,{children:[(0,P.jsx)(m,{label:`Revoke access`,variant:`destructive`,onClick:()=>t(!0)}),(0,P.jsx)(T,{isOpen:e,onOpenChange:t,title:`Revoke access?`,description:`This user will immediately lose access to all shared resources.`,actionLabel:`Revoke`,isActionLoading:n,onAction:async()=>{r(!0),await new Promise(e=>setTimeout(e,2e3)),r(!1),t(!1)}})]})}},R={render:()=>{let[e,t]=(0,N.useState)(!1);return(0,P.jsxs)(P.Fragment,{children:[(0,P.jsx)(m,{label:`Show notice`,variant:`secondary`,onClick:()=>t(!0)}),(0,P.jsx)(T,{isOpen:e,onOpenChange:t,title:`Session expired`,description:`Your session has expired. You will be redirected to the login page.`,actionLabel:`Sign in`,actionVariant:`primary`,onAction:()=>t(!1)})]})}},z={render:()=>{let e=k();return(0,P.jsxs)(P.Fragment,{children:[(0,P.jsx)(m,{label:`Delete item`,variant:`destructive`,onClick:()=>e.show({title:`Delete item?`,description:`This action cannot be undone.`,actionLabel:`Delete`,onAction:()=>e.hide()})}),e.element]})}},I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    return <>
        <Button label="Delete item" variant="destructive" onClick={() => setIsOpen(true)} />
        <AlertDialog isOpen={isOpen} onOpenChange={setIsOpen} title="Delete item?" description="This action cannot be undone. The item and all its data will be permanently removed." actionLabel="Delete" onAction={() => setIsOpen(false)} />
      </>;
  }
}`,...I.parameters?.docs?.source},description:{story:`Delete confirmation — the most common alert dialog pattern.`,...I.parameters?.docs?.description}}},L.parameters={...L.parameters,docs:{...L.parameters?.docs,source:{originalSource:`{
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
}`,...L.parameters?.docs?.source},description:{story:`Async action with loading state.`,...L.parameters?.docs?.description}}},R.parameters={...R.parameters,docs:{...R.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    return <>
        <Button label="Show notice" variant="secondary" onClick={() => setIsOpen(true)} />
        <AlertDialog isOpen={isOpen} onOpenChange={setIsOpen} title="Session expired" description="Your session has expired. You will be redirected to the login page." actionLabel="Sign in" actionVariant="primary" onAction={() => setIsOpen(false)} />
      </>;
  }
}`,...R.parameters?.docs?.source},description:{story:`Non-destructive confirmation with a primary action button.`,...R.parameters?.docs?.description}}},z.parameters={...z.parameters,docs:{...z.parameters?.docs,source:{originalSource:`{
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
}`,...z.parameters?.docs?.source},description:{story:`Imperative API — no state management needed.`,...z.parameters?.docs?.description}}},B=[`Delete`,`Async`,`Informational`,`Imperative`]})))()}V();export{L as Async,I as Delete,z as Imperative,R as Informational,B as __namedExportsOrder,F as default};