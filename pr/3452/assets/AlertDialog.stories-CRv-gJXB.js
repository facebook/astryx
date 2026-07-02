import{ah as s,a1 as e,B as r,T as D,a6 as T,ay as A}from"./iframe-BzSUXdLu.js";import{D as S}from"./Dialog-XI_8AaO8.js";import{L as j,b as q}from"./LayoutContent-BP0Q4IuR.js";import{L as R}from"./LayoutFooter-CCRJP4LB.js";import{H as B}from"./Heading-n1R3kTsq.js";import{H as V}from"./HStack-BldzXftl.js";import"./preload-helper-Ct5FWWRu.js";import"./useScrollLock-CR1JgpGp.js";import"./useFocusTrap-BLybHx1Z.js";import"./container.stylex-uilBL6DE.js";import"./padding.stylex-Dl2_Pyt1.js";import"./stack.stylex-BlarxY2N.js";import"./stackItem.stylex-CgqrJM4N.js";import"./Stack-Tj4_Mi0e.js";function o({ref:n,isOpen:t,isInline:i,onOpenChange:a,title:l,description:g,cancelLabel:h="Cancel",actionLabel:c,actionVariant:y="destructive",isActionLoading:O,onAction:v,width:x=400,xstyle:w,className:I,style:C,"data-testid":k}){const f=s.useId(),b=s.useId(),L=s.useCallback(()=>{a(!1)},[a]);return e.jsx(S,{ref:n,isOpen:t,isInline:i,onOpenChange:a,width:x,purpose:"form",role:"alertdialog","aria-labelledby":f,"aria-describedby":b,...T(A("alert-dialog"),{className:I,style:C}),xstyle:w,"data-testid":k,children:e.jsx(j,{content:e.jsxs(q,{children:[e.jsx(B,{level:2,id:f,children:l}),e.jsx(D,{type:"body",color:"secondary",id:b,children:g})]}),footer:e.jsx(R,{children:e.jsxs(V,{gap:2,hAlign:"end",children:[e.jsx(r,{variant:"ghost",label:h,onClick:L}),e.jsx(r,{variant:y,label:c,onClick:v,isLoading:O})]})})})})}o.displayName="AlertDialog";o.__docgenInfo={description:`A confirmation dialog for destructive or irreversible actions.

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
\`\`\``,methods:[],displayName:"AlertDialog",props:{xstyle:{required:!1,tsType:{name:"StyleXStyles"},description:"StyleX styles created via `stylex.create()`. Merged with the component's\nbase styles inside a single `stylex.props()` call for optimal deduplication.\n\n@example\n```\nconst overrides = stylex.create({ root: { marginBottom: 8 } });\n<Component xstyle={overrides.root} />\n```"},ref:{required:!1,tsType:{name:"ReactRef",raw:"React.Ref<HTMLDialogElement>",elements:[{name:"HTMLDialogElement"}]},description:""},isOpen:{required:!0,tsType:{name:"boolean"},description:"Whether the dialog is open."},isInline:{required:!1,tsType:{name:"boolean"},description:`Renders alert dialog content inline without modal behavior.
For documentation previews and showcases only.
@default false`},onOpenChange:{required:!0,tsType:{name:"signature",type:"function",raw:"(isOpen: boolean) => unknown",signature:{arguments:[{type:{name:"boolean"},name:"isOpen"}],return:{name:"unknown"}}},description:"Callback fired when the dialog visibility changes.\nCalled with `false` when cancel is clicked or Escape is pressed."},title:{required:!0,tsType:{name:"string"},description:"Dialog title. Linked to the dialog via `aria-labelledby`."},description:{required:!0,tsType:{name:"string"},description:"Consequence description. Linked to the dialog via `aria-describedby`."},cancelLabel:{required:!1,tsType:{name:"string"},description:"Label for the cancel button. Rendered as a ghost Button.\nClicking cancel calls `onOpenChange(false)`.\n@default 'Cancel'",defaultValue:{value:"'Cancel'",computed:!1}},actionLabel:{required:!0,tsType:{name:"string"},description:"Label for the action button."},actionVariant:{required:!1,tsType:{name:"ButtonVariantMap"},description:`Variant for the action button.
@default 'destructive'`,defaultValue:{value:"'destructive'",computed:!1}},isActionLoading:{required:!1,tsType:{name:"boolean"},description:"Whether the action button shows a loading spinner."},onAction:{required:!0,tsType:{name:"signature",type:"function",raw:"() => unknown",signature:{arguments:[],return:{name:"unknown"}}},description:"Callback fired when the action button is clicked.\nThe dialog does NOT auto-close — call `onOpenChange(false)` when done."},width:{required:!1,tsType:{name:"union",raw:"number | string",elements:[{name:"number"},{name:"string"}]},description:`The width of the dialog.
Numbers are treated as pixels, strings are used as-is.
@default 400`,defaultValue:{value:"400",computed:!1}}},composes:["Omit"]};function E(){const[n,t]=s.useState(!1),[i,a]=s.useState(null),l=s.useCallback(c=>{a(c),t(!0)},[]),g=s.useCallback(()=>{t(!1)},[]),h=s.useMemo(()=>i?e.jsx(o,{...i,isOpen:n,onOpenChange:c=>{c||t(!1)}}):null,[n,i]);return{show:l,hide:g,isOpen:n,element:h}}const Q={title:"Core/AlertDialog",component:o,tags:["autodocs"],argTypes:{isOpen:{control:"boolean"},width:{control:"number"},actionVariant:{control:"select",options:["destructive","primary","secondary","ghost"]}}},d={render:()=>{const[n,t]=s.useState(!1);return e.jsxs(e.Fragment,{children:[e.jsx(r,{label:"Delete item",variant:"destructive",onClick:()=>t(!0)}),e.jsx(o,{isOpen:n,onOpenChange:t,title:"Delete item?",description:"This action cannot be undone. The item and all its data will be permanently removed.",actionLabel:"Delete",onAction:()=>t(!1)})]})}},p={render:()=>{const[n,t]=s.useState(!1),[i,a]=s.useState(!1);return e.jsxs(e.Fragment,{children:[e.jsx(r,{label:"Revoke access",variant:"destructive",onClick:()=>t(!0)}),e.jsx(o,{isOpen:n,onOpenChange:t,title:"Revoke access?",description:"This user will immediately lose access to all shared resources.",actionLabel:"Revoke",isActionLoading:i,onAction:async()=>{a(!0),await new Promise(l=>setTimeout(l,2e3)),a(!1),t(!1)}})]})}},u={render:()=>{const[n,t]=s.useState(!1);return e.jsxs(e.Fragment,{children:[e.jsx(r,{label:"Show notice",variant:"secondary",onClick:()=>t(!0)}),e.jsx(o,{isOpen:n,onOpenChange:t,title:"Session expired",description:"Your session has expired. You will be redirected to the login page.",actionLabel:"Sign in",actionVariant:"primary",onAction:()=>t(!1)})]})}},m={render:()=>{const n=E();return e.jsxs(e.Fragment,{children:[e.jsx(r,{label:"Delete item",variant:"destructive",onClick:()=>n.show({title:"Delete item?",description:"This action cannot be undone.",actionLabel:"Delete",onAction:()=>n.hide()})}),n.element]})}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    return <>
        <Button label="Delete item" variant="destructive" onClick={() => setIsOpen(true)} />
        <AlertDialog isOpen={isOpen} onOpenChange={setIsOpen} title="Delete item?" description="This action cannot be undone. The item and all its data will be permanently removed." actionLabel="Delete" onAction={() => setIsOpen(false)} />
      </>;
  }
}`,...d.parameters?.docs?.source},description:{story:"Delete confirmation — the most common alert dialog pattern.",...d.parameters?.docs?.description}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
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
}`,...p.parameters?.docs?.source},description:{story:"Async action with loading state.",...p.parameters?.docs?.description}}};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    return <>
        <Button label="Show notice" variant="secondary" onClick={() => setIsOpen(true)} />
        <AlertDialog isOpen={isOpen} onOpenChange={setIsOpen} title="Session expired" description="Your session has expired. You will be redirected to the login page." actionLabel="Sign in" actionVariant="primary" onAction={() => setIsOpen(false)} />
      </>;
  }
}`,...u.parameters?.docs?.source},description:{story:"Non-destructive confirmation with a primary action button.",...u.parameters?.docs?.description}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
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
}`,...m.parameters?.docs?.source},description:{story:"Imperative API — no state management needed.",...m.parameters?.docs?.description}}};const Z=["Delete","Async","Informational","Imperative"];export{p as Async,d as Delete,m as Imperative,u as Informational,Z as __namedExportsOrder,Q as default};
