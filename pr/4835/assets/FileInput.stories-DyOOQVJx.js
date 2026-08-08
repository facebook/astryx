import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{t}from"./react-BZJXY1be.js";import{n,t as r}from"./stylex-Dft6gtPK.js";import{n as i}from"./mergeProps-JRyAvMxc.js";import{n as a}from"./mergeRefs-CPqjs56a.js";import{n as o,t as s}from"./themeProps-CREkzZh6.js";import{t as c}from"./jsx-runtime-DeHZSEgm.js";import{n as ee,t as l}from"./useTooltip-Cm0gpSWG.js";import{n as u,t as te}from"./Spinner-CzifdOpC.js";import{n as d,t as ne}from"./VisuallyHidden-Z2NjNH-_.js";import{n as re,t as f}from"./useTranslator-BMnme3me.js";import{n as p,t as m}from"./Icon-C24cO4CC.js";import{n as h,r as ie}from"./useClickableContainer-BfRKnQlP.js";import{n as ae,t as g}from"./useAnnounce-DW4eqOGv.js";import{n as oe,t as _}from"./useInputStatusIcon-B91OOy9G.js";import{n as se,t as ce}from"./Field-DZ-q02Vq.js";import{n as v,t as le}from"./InputClearButton-JjQh5BeG.js";function y(e){return e<1024?`${e} B`:e<1048576?`${(e/1024).toFixed(1)} KB`:`${(e/1048576).toFixed(1)} MB`}function ue(e,t,n,r,i){let a=[],o=e;if(t){let e=t.split(`,`).map(e=>e.trim().toLowerCase());o=o.filter(t=>{let n=e.some(e=>e.startsWith(`.`)?t.name.toLowerCase().endsWith(e):e.endsWith(`/*`)?t.type.startsWith(e.slice(0,-1)):t.type.toLowerCase()===e);return n||a.push(`"${t.name}" is not an accepted file type`),n})}return n!=null&&(o=o.filter(e=>e.size>n?(a.push(`"${e.name}" exceeds ${y(n)} limit`),!1):!0)),i&&r!=null&&o.length>r&&(a.push(`Maximum ${r} files allowed`),o=o.slice(0,r)),{valid:o,errors:a}}function b({label:e,isLabelHidden:t=!1,value:r,onChange:s,changeAction:c,accept:l,isMultiple:u=!1,maxSize:d,maxFiles:f,isDisabled:p=!1,disabledMessage:h,isRequired:g=!1,isLoading:_=!1,status:se,statusVariant:v=`attached`,description:y,placeholder:b,mode:T=`input`,isOptional:E=!1,labelTooltip:D,width:O,xstyle:k,className:A,style:j,ref:M,...N}){let P=re(),F=(0,x.useId)(),I=(0,x.useId)(),L=(0,x.useId)(),R=(0,x.useId)(),z=(0,x.useRef)(null),B=(0,x.useRef)(null),[V,H]=(0,x.useState)(!1),[U,W]=(0,x.useState)(null),[,G]=(0,x.useTransition)(),de=ae(),K=p&&!!h,q=ee({placement:`above`,focusTrigger:`always`,isEnabled:K}),J=se??(U?{type:`error`,message:U}:void 0),{statusIcon:fe,describedBy:pe}=oe({status:J,statusVariant:v}),me=g&&!E,he=[y?I:null,v!==`tooltip`&&J?.message?L:null,pe,me?R:null,K?q.describedBy:null].filter(Boolean).join(` `)||void 0,Y=b??(u?`Choose files`:`Choose file`),X=(0,x.useCallback)(e=>{if(p)return;let{valid:t,errors:n}=ue(e,l,d,f,u);if(n.length>0?W(n[0]):W(null),t.length===0){s(null);return}let r=u?t:t[0];s(r),n.length===0&&de(t.length===1?`1 file selected: ${t[0].name}`:`${t.length} files selected`),c&&G(async()=>{await c(r)})},[l,p,u,f,d,s,c,G,de]),ge=(0,x.useCallback)(e=>{let t=Array.from(e.target.files??[]);X(t),z.current&&(z.current.value=``)},[X]),_e=(0,x.useCallback)(e=>{e.stopPropagation(),W(null),s(null),z.current&&(z.current.value=``,z.current.focus())},[s]),ve=(0,x.useCallback)(()=>{p||z.current?.click()},[p]),ye=(0,x.useCallback)(e=>{(e.key===`Enter`||e.key===` `)&&!p&&(e.preventDefault(),z.current?.click())},[p]),{onClick:be,onMouseUp:xe}=ie({containerRef:B,onClick:ve,disabled:p}),Se=(0,x.useCallback)(e=>{e.preventDefault(),e.stopPropagation(),!p&&T===`dropzone`&&H(!0)},[p,T]),Ce=(0,x.useCallback)(e=>{e.preventDefault(),e.stopPropagation(),!p&&T===`dropzone`&&H(!0)},[p,T]),we=(0,x.useCallback)(e=>{e.preventDefault(),e.stopPropagation(),!(e.relatedTarget instanceof Node&&e.currentTarget.contains(e.relatedTarget))&&H(!1)},[]),Te=(0,x.useCallback)(e=>{if(e.preventDefault(),e.stopPropagation(),H(!1),p||T!==`dropzone`)return;let t=Array.from(e.dataTransfer.files);t.length>0&&X(t)},[p,T,X]),Z=r!=null&&(!Array.isArray(r)||r.length>0),Q=Z?Array.isArray(r)?r.map(e=>e.name).join(`, `):r?.name??``:null,Ee=()=>_?(0,S.jsx)(te,{size:`md`}):Z?(0,S.jsx)(`div`,{className:`astryx9ynric astryxjm74w1 astryx6pjikd astryxw6l6zx astryx1tgivj0 astryxb3r6kr astryxlyipyv astryx98rzlu astryxeuugli astryx2b8uid astryxeaf4i8`,children:Q}):(0,S.jsxs)(S.Fragment,{children:[(0,S.jsx)(m,{icon:`arrowUp`,size:`md`,color:`secondary`}),(0,S.jsx)(`span`,{className:`astryx9ynric astryxjm74w1 astryx6pjikd astryxw6l6zx astryxv1l7n4 astryx2b8uid astryx87ps6o`,children:V?`Drop files here`:Y})]}),De=()=>_?(0,S.jsxs)(S.Fragment,{children:[(0,S.jsx)(`span`,{className:`astryx9ynric astryxjm74w1 astryx6pjikd astryxw6l6zx astryx1tgivj0 astryxb3r6kr astryxlyipyv astryxuxw1ft astryx98rzlu astryxeuugli`,children:Q??Y}),(0,S.jsx)(te,{size:`sm`})]}):(0,S.jsxs)(S.Fragment,{children:[(0,S.jsx)(m,{icon:`arrowUp`,size:`sm`,color:`secondary`}),(0,S.jsx)(`span`,{...{0:{className:`astryx9ynric astryxjm74w1 astryx6pjikd astryxw6l6zx astryxv1l7n4 astryx87ps6o astryx1yc453h astryx98rzlu astryxeuugli`},2:{className:`astryx9ynric astryxjm74w1 astryx6pjikd astryxw6l6zx astryx1tgivj0 astryxb3r6kr astryxlyipyv astryxuxw1ft astryx1yc453h astryx98rzlu astryxeuugli`},1:{className:`astryx9ynric astryxjm74w1 astryx6pjikd astryxw6l6zx astryxv1l7n4 astryx87ps6o astryx1yc453h`},3:{className:`astryx9ynric astryxjm74w1 astryx6pjikd astryxw6l6zx astryx1tgivj0 astryxb3r6kr astryxlyipyv astryxuxw1ft astryx98rzlu astryxeuugli astryx1yc453h`}}[!!Z<<1|!!Z<<0],children:Q??Y}),fe]}),$=T===`dropzone`,Oe=$?{onDragEnter:Se,onDragOver:Ce,onDragLeave:we,onDrop:Te}:{};return(0,S.jsxs)(ce,{label:e,isLabelHidden:t,description:y,inputID:F,descriptionID:y?I:void 0,isOptional:E,isRequired:g,isDisabled:p,status:J?{type:J.type,message:J.message,messageID:J.message?L:void 0}:void 0,statusVariant:v,labelTooltip:D,width:O,children:[(0,S.jsxs)(`div`,{ref:e=>{B.current=e,q.ref(e)},onClick:p?void 0:be,onMouseUp:p?void 0:xe,...Oe,...i(o(`file-input`,{mode:T,status:J?.type??null}),n($?C.dropzone:C.compact,$&&!p&&C.dropzoneHover,$&&V&&C.dropzoneActive,$&&p&&C.dropzoneDisabled,!$&&p&&C.compactDisabled,J&&w[J.type],k),A,j),children:[(0,S.jsx)(ne,{children:(0,S.jsx)(`button`,{type:`button`,disabled:p&&!K,tabIndex:p&&!K?-1:0,"aria-disabled":K?`true`:void 0,onClick:ve,onKeyDown:ye,"aria-label":Z&&Q?P(`@astryx.fileInput.triggerWithFiles`,{label:e,fileNames:Q}):e,"aria-busy":_||void 0,"aria-describedby":he,"aria-invalid":J?.type===`error`?`true`:void 0})}),(0,S.jsx)(`input`,{...N,ref:a(M,z),id:F,type:`file`,accept:l,multiple:u,disabled:p,onChange:ge,"aria-hidden":`true`,tabIndex:-1,className:`astryx10l6tqk astryx1i1rx1s astryxjm9jq1 astryx1717udv astryxkdpibf astryxb3r6kr astryxzpqnlu astryxuxw1ft astryxc342km`}),$?Ee():De(),Z&&!p&&!_&&(0,S.jsx)(le,{label:P(`@astryx.fileInput.clearLabel`,{label:e}),onClick:_e})]}),me&&(0,S.jsx)(ne,{id:R,children:P(`@astryx.fileInput.required`)}),K&&q.renderTooltip(h)]})}var x,S,C,w;function T(){return(T=e((()=>{x=t(),r(),se(),v(),p(),u(),d(),g(),_(),h(),l(),s(),f(),S=c(),C={dropzone:{kB7OPa:`astryx9f619`,kVAEAm:`astryx1n2onr6`,kY2c9j:`astryx1vjfegm`,k1xSpc:`astryx78zum5`,kXwgrk:`astryxdt5ytf`,kGNEyG:`astryx6s0dn4`,kjj79g:`astryxl56j7k`,kOIVth:`astryx1txdalj`,k8WAf4:`astryxq6koh6`,kg3NbH:`astryx1pzlopt`,kMzoRj:`astryx1litavf`,ksu8eU:`astryxbsl7fq`,kVAM5u:`astryxvy26l8 astryx6q1khz`,kaIpWk:`astryxh6dtrn`,kWkggS:`astryx10xzikg`,k1ekBW:`astryx1tv3a4w`,kIyJzY:`astryxuedmi6 astryx12w9bfk`,kAMwcw:`astryxlr8y92`,kkrTdU:`astryx1ypdohk`,kI3sdo:`astryx1a2a7pz`,$$css:!0},dropzoneHover:{kGVxlE:`astryxw6ruzt`,$$css:!0},dropzoneActive:{kVAM5u:`astryxad5do`,kWkggS:`astryxgcxg3y`,$$css:!0},dropzoneDisabled:{kkrTdU:`astryx1h6gzvc`,kSiTet:`astryxbyyjgo`,kVAM5u:`astryxvy26l8`,$$css:!0},compact:{kB7OPa:`astryx9f619`,kVAEAm:`astryx1n2onr6`,kY2c9j:`astryx1vjfegm`,k1xSpc:`astryx78zum5`,kGNEyG:`astryx6s0dn4`,kOIVth:`astryx1txdalj`,k8WAf4:`astryxu0wf1k`,kg3NbH:`astryxf314gf`,kMzoRj:`astryx1litavf`,ksu8eU:`astryx1y0btm7`,kVAM5u:`astryxvy26l8 astryx6q1khz`,kaIpWk:`astryxh6dtrn`,kWkggS:`astryx10xzikg`,k1ekBW:`astryx12zzom9`,kIyJzY:`astryxuedmi6 astryx12w9bfk`,kAMwcw:`astryxlr8y92`,kGVxlE:`astryx1gnnqk1 astryx70dsy8`,kkrTdU:`astryx1ypdohk`,kZKoxP:`astryx1ueg155`,kI3sdo:`astryx1a2a7pz`,$$css:!0},compactDisabled:{kkrTdU:`astryx1h6gzvc`,kSiTet:`astryxbyyjgo`,kVAM5u:`astryxvy26l8`,$$css:!0}},w={warning:{kVAM5u:`astryx8wg1ba`,kzOINU:null,kGJrpR:null,kaZRDh:null,kBCPoo:null,k26BEO:null,k5QoK5:null,kLZC3w:null,kL6WhQ:null,$$css:!0},error:{kVAM5u:`astryx1ofxpqo`,kzOINU:null,kGJrpR:null,kaZRDh:null,kBCPoo:null,k26BEO:null,k5QoK5:null,kLZC3w:null,kL6WhQ:null,$$css:!0},success:{kVAM5u:`astryx16m2moy`,kzOINU:null,kGJrpR:null,kaZRDh:null,kBCPoo:null,k26BEO:null,k5QoK5:null,kLZC3w:null,kL6WhQ:null,$$css:!0}},b.displayName=`FileInput`,b.__docgenInfo={description:'A file input component with optional drag-and-drop support.\n\n@example\n```\n<FileInput label="Resume" value={file} onChange={setFile} accept=".pdf" />\n```',methods:[],displayName:`FileInput`,props:{ref:{required:!1,tsType:{name:`ReactRef`,raw:`React.Ref<HTMLInputElement>`,elements:[{name:`HTMLInputElement`}]},description:``},label:{required:!0,tsType:{name:`string`},description:`Accessible label for the file input.`},isLabelHidden:{required:!1,tsType:{name:`boolean`},description:`Whether to visually hide the label (still accessible to screen readers).
@default false`,defaultValue:{value:`false`,computed:!1}},value:{required:!0,tsType:{name:`union`,raw:`File | File[] | null`,elements:[{name:`File`},{name:`Array`,elements:[{name:`File`}],raw:`File[]`},{name:`null`}]},description:`Currently selected file(s). Controlled component.`},onChange:{required:!0,tsType:{name:`signature`,type:`function`,raw:`(files: File | File[] | null) => void`,signature:{arguments:[{type:{name:`union`,raw:`File | File[] | null`,elements:[{name:`File`},{name:`Array`,elements:[{name:`File`}],raw:`File[]`},{name:`null`}]},name:`files`}],return:{name:`void`}}},description:`Callback fired when files are selected or removed.`},changeAction:{required:!1,tsType:{name:`signature`,type:`function`,raw:`(files: File | File[] | null) => Promise<void>`,signature:{arguments:[{type:{name:`union`,raw:`File | File[] | null`,elements:[{name:`File`},{name:`Array`,elements:[{name:`File`}],raw:`File[]`},{name:`null`}]},name:`files`}],return:{name:`Promise`,elements:[{name:`void`}],raw:`Promise<void>`}}},description:`Async change action (React 19 transitions pattern).
Use for immediate upload on file selection.`},accept:{required:!1,tsType:{name:`string`},description:`Accepted file types. Uses the HTML accept attribute format.
Examples: "image/*", ".pdf,.doc,.docx", "image/png,image/jpeg"`},isMultiple:{required:!1,tsType:{name:`boolean`},description:"Whether multiple files can be selected.\nWhen true, `value` and `onChange` use `File[]` instead of `File`.\n@default false",defaultValue:{value:`false`,computed:!1}},maxSize:{required:!1,tsType:{name:`number`},description:`Maximum file size in bytes. Files exceeding this are rejected
with an error status.`},maxFiles:{required:!1,tsType:{name:`number`},description:"Maximum number of files (only applies when `isMultiple` is true)."},isDisabled:{required:!1,tsType:{name:`boolean`},description:`Whether the input is disabled.
@default false`,defaultValue:{value:`false`,computed:!1}},disabledMessage:{required:!1,tsType:{name:`string`},description:`Explains why the input is disabled. When set together with \`isDisabled\`,
the file input shows a tooltip with this text on hover and keyboard focus,
and its trigger stays focusable (via \`aria-disabled\`) so the reason is
discoverable by keyboard and assistive technology. Opening the file picker
stays blocked.

Use this instead of wrapping a disabled input in \`Tooltip\` — disabled
controls don't emit the pointer events an external tooltip needs.

@example
\`\`\`
<FileInput
  label="Resume"
  value={file}
  isDisabled
  disabledMessage="Uploads are locked until your profile is verified"
/>
\`\`\``},isRequired:{required:!1,tsType:{name:`boolean`},description:`Whether the input is required.
@default false`,defaultValue:{value:`false`,computed:!1}},isLoading:{required:!1,tsType:{name:`boolean`},description:`Whether the input is in a loading state (e.g. uploading).
@default false`,defaultValue:{value:`false`,computed:!1}},status:{required:!1,tsType:{name:`InputStatus`},description:`Validation status for the input.`},statusVariant:{required:!1,tsType:{name:`FieldStatusVariantMap`},description:`How the status message is placed relative to the input.
- 'attached': message overlaps directly below the input (bordered treatment)
- 'detached': message floats below as a separate element with spacing
- 'tooltip': no message box; the status icon becomes a focusable info-tip button that reveals the message on hover, keyboard focus, or tap
@default 'attached'`,defaultValue:{value:`'attached'`,computed:!1}},description:{required:!1,tsType:{name:`string`},description:`Description text displayed below the label.`},placeholder:{required:!1,tsType:{name:`string`},description:`Placeholder text shown when no file is selected.
@default "Choose file" or "Choose files"`},mode:{required:!1,tsType:{name:`union`,raw:`'dropzone' | 'input'`,elements:[{name:`literal`,value:`'dropzone'`},{name:`literal`,value:`'input'`}]},description:`Visual mode for the file input.
- 'input': compact inline style, similar to a text input
- 'dropzone': larger area with dashed border and drag-and-drop support
@default 'input'`,defaultValue:{value:`'input'`,computed:!1}},isOptional:{required:!1,tsType:{name:`boolean`},description:`Whether the field is optional. Mutually exclusive with isRequired.
@default false`,defaultValue:{value:`false`,computed:!1}},width:{required:!1,tsType:{name:`union`,raw:`number | string`,elements:[{name:`number`},{name:`string`}]},description:"Width of the field. Numbers are treated as pixels, strings are used as-is\n(e.g. `'100%'`). Sizes the whole field (label, control, and status) so they\nstay aligned, unlike setting width via `xstyle`/`className`/`style`."},labelTooltip:{required:!1,tsType:{name:`string`},description:`Tooltip text to display in an info icon at the end of the label.`}},composes:[`Omit`]}})))()}var E,D,O,k,A,j,M,N,P,F,I,L,R,z,B,V,H,U,W;function G(){return(G=e((()=>{E=t(),T(),D=c(),O={title:`Core/FileInput`,component:b,tags:[`autodocs`],argTypes:{label:{control:`text`,description:`Label text (required)`},isLabelHidden:{control:`boolean`,description:`Visually hide the label (still accessible to screen readers)`},placeholder:{control:`text`,description:`Placeholder text`},description:{control:`text`,description:`Description text displayed between the label and input`},accept:{control:`text`,description:`Accepted file types (e.g. "image/*", ".pdf,.doc")`},isMultiple:{control:`boolean`,description:`Whether multiple files can be selected`},isOptional:{control:`boolean`,description:`Whether the field is optional (mutually exclusive with isRequired)`},isRequired:{control:`boolean`,description:`Whether the field is required (mutually exclusive with isOptional)`},isDisabled:{control:`boolean`,description:`Whether the input is disabled`},disabledMessage:{control:`text`,description:`Explains why the input is disabled. With isDisabled, shows a tooltip on hover/keyboard focus and keeps the trigger focusable via aria-disabled (opening the file picker stays blocked). Use this instead of wrapping a disabled FileInput in Tooltip.`},isLoading:{control:`boolean`,description:`Whether the input is in a loading state`},mode:{control:`select`,options:[`input`,`dropzone`],description:`Visual mode: compact input or drag-and-drop dropzone`},status:{control:`object`,description:`Status indicator with type (warning/error/success) and optional message`},labelTooltip:{control:`text`,description:`Tooltip text to display in an info icon at the end of the label`}}},k={render:e=>{let[t,n]=(0,E.useState)(null);return(0,D.jsx)(b,{...e,value:t,onChange:n})},args:{label:`Upload file`,placeholder:`Drag files here or click to browse`}},A={render:e=>{let[t,n]=(0,E.useState)(null);return(0,D.jsx)(b,{...e,value:t,onChange:n})},args:{label:`Resume`,description:`Upload your resume in PDF or Word format. Max 5MB.`,accept:`.pdf,.doc,.docx`}},j={render:e=>{let[t,n]=(0,E.useState)(null);return(0,D.jsx)(b,{...e,value:t,onChange:n})},args:{label:`Attachments`,isMultiple:!0,description:`Upload up to 10 files. Max 5MB each.`,maxFiles:10,maxSize:5242880}},M={render:e=>{let[t,n]=(0,E.useState)(null);return(0,D.jsx)(b,{...e,value:t,onChange:n})},args:{label:`Profile photo`,accept:`image/png,image/jpeg`,description:`PNG or JPEG, max 2MB.`,maxSize:2097152}},N={render:e=>{let[t,n]=(0,E.useState)(null);return(0,D.jsx)(b,{...e,value:t,onChange:n})},args:{label:`Upload files`,mode:`dropzone`,placeholder:`Drag files here or click to browse`}},P={render:e=>{let[t,n]=(0,E.useState)(null);return(0,D.jsx)(b,{...e,value:t,onChange:n})},args:{label:`Supporting document`,isRequired:!0}},F={render:e=>{let[t,n]=(0,E.useState)(null);return(0,D.jsx)(b,{...e,value:t,onChange:n})},args:{label:`Cover letter`,isOptional:!0}},I={render:e=>{let[t,n]=(0,E.useState)(null);return(0,D.jsx)(b,{...e,value:t,onChange:n})},args:{label:`Upload locked`,isDisabled:!0,placeholder:`Upload is currently disabled`}},L={render:e=>{let[t,n]=(0,E.useState)(null);return(0,D.jsx)(b,{...e,value:t,onChange:n})},args:{label:`Resume`,isDisabled:!0,disabledMessage:`Uploads are locked until your profile is verified`,placeholder:`Upload is currently disabled`}},R={render:e=>{let[t,n]=(0,E.useState)(null);return(0,D.jsx)(b,{...e,value:t,onChange:n})},args:{label:`Uploading...`,isLoading:!0}},z={render:e=>{let[t,n]=(0,E.useState)(null);return(0,D.jsx)(b,{...e,value:t,onChange:n})},args:{label:`Upload document`,status:{type:`error`,message:`File must be under 10MB`}}},B={render:e=>{let[t,n]=(0,E.useState)(null);return(0,D.jsx)(b,{...e,value:t,onChange:n})},args:{label:`Upload document`,status:{type:`success`,message:`File uploaded successfully`}}},V={render:e=>{let[t,n]=(0,E.useState)(null);return(0,D.jsx)(b,{...e,value:t,onChange:n})},args:{label:`Tax documents`,labelTooltip:`Upload W-2 forms, 1099s, or other tax-related documents.`}},H={render:()=>{let[e,t]=(0,E.useState)(null),[n,r]=(0,E.useState)(null),[i,a]=(0,E.useState)(null),[o,s]=(0,E.useState)(null),[c,ee]=(0,E.useState)(null);return(0,D.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`24px`,maxWidth:`400px`},children:[(0,D.jsx)(b,{label:`Default (input mode)`,value:e,onChange:t}),(0,D.jsx)(b,{label:`Dropzone with constraints`,value:n,onChange:r,mode:`dropzone`,isMultiple:!0,accept:`image/*`,maxSize:5242880,maxFiles:5,description:`Up to 5 images, max 5MB each`}),(0,D.jsx)(b,{label:`Dropzone mode`,value:i,onChange:a,mode:`dropzone`,placeholder:`Drag files here or click to browse`}),(0,D.jsx)(b,{label:`Disabled`,value:o,onChange:s,isDisabled:!0}),(0,D.jsx)(b,{label:`With error`,value:c,onChange:ee,status:{type:`error`,message:`Please upload a valid file`}})]})}},U={render:()=>{let[e,t]=(0,E.useState)(null),[n,r]=(0,E.useState)(null);return(0,D.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:24,width:320},children:[(0,D.jsx)(b,{label:`Attached (default)`,value:e,onChange:t,status:{type:`error`,message:`File must be under 10MB`}}),(0,D.jsx)(b,{label:`Detached`,value:n,onChange:r,status:{type:`error`,message:`File must be under 10MB`},statusVariant:`detached`})]})}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<File | File[] | null>(null);
    return <FileInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Upload file',
    placeholder: 'Drag files here or click to browse'
  }
}`,...k.parameters?.docs?.source}}},A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<File | File[] | null>(null);
    return <FileInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Resume',
    description: 'Upload your resume in PDF or Word format. Max 5MB.',
    accept: '.pdf,.doc,.docx'
  }
}`,...A.parameters?.docs?.source}}},j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<File | File[] | null>(null);
    return <FileInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Attachments',
    isMultiple: true,
    description: 'Upload up to 10 files. Max 5MB each.',
    maxFiles: 10,
    maxSize: 5 * 1024 * 1024
  }
}`,...j.parameters?.docs?.source}}},M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<File | File[] | null>(null);
    return <FileInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Profile photo',
    accept: 'image/png,image/jpeg',
    description: 'PNG or JPEG, max 2MB.',
    maxSize: 2 * 1024 * 1024
  }
}`,...M.parameters?.docs?.source}}},N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<File | File[] | null>(null);
    return <FileInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Upload files',
    mode: 'dropzone',
    placeholder: 'Drag files here or click to browse'
  }
}`,...N.parameters?.docs?.source}}},P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<File | File[] | null>(null);
    return <FileInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Supporting document',
    isRequired: true
  }
}`,...P.parameters?.docs?.source}}},F.parameters={...F.parameters,docs:{...F.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<File | File[] | null>(null);
    return <FileInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Cover letter',
    isOptional: true
  }
}`,...F.parameters?.docs?.source}}},I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<File | File[] | null>(null);
    return <FileInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Upload locked',
    isDisabled: true,
    placeholder: 'Upload is currently disabled'
  }
}`,...I.parameters?.docs?.source}}},L.parameters={...L.parameters,docs:{...L.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<File | File[] | null>(null);
    return <FileInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Resume',
    isDisabled: true,
    disabledMessage: 'Uploads are locked until your profile is verified',
    placeholder: 'Upload is currently disabled'
  }
}`,...L.parameters?.docs?.source}}},R.parameters={...R.parameters,docs:{...R.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<File | File[] | null>(null);
    return <FileInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Uploading...',
    isLoading: true
  }
}`,...R.parameters?.docs?.source}}},z.parameters={...z.parameters,docs:{...z.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<File | File[] | null>(null);
    return <FileInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Upload document',
    status: {
      type: 'error',
      message: 'File must be under 10MB'
    }
  }
}`,...z.parameters?.docs?.source}}},B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<File | File[] | null>(null);
    return <FileInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Upload document',
    status: {
      type: 'success',
      message: 'File uploaded successfully'
    }
  }
}`,...B.parameters?.docs?.source}}},V.parameters={...V.parameters,docs:{...V.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<File | File[] | null>(null);
    return <FileInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Tax documents',
    labelTooltip: 'Upload W-2 forms, 1099s, or other tax-related documents.'
  }
}`,...V.parameters?.docs?.source}}},H.parameters={...H.parameters,docs:{...H.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [v1, setV1] = useState<File | File[] | null>(null);
    const [v2, setV2] = useState<File | File[] | null>(null);
    const [v3, setV3] = useState<File | File[] | null>(null);
    const [v4, setV4] = useState<File | File[] | null>(null);
    const [v5, setV5] = useState<File | File[] | null>(null);
    return <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
      maxWidth: '400px'
    }}>
        <FileInput label="Default (input mode)" value={v1} onChange={setV1} />
        <FileInput label="Dropzone with constraints" value={v2} onChange={setV2} mode="dropzone" isMultiple accept="image/*" maxSize={5 * 1024 * 1024} maxFiles={5} description="Up to 5 images, max 5MB each" />
        <FileInput label="Dropzone mode" value={v3} onChange={setV3} mode="dropzone" placeholder="Drag files here or click to browse" />
        <FileInput label="Disabled" value={v4} onChange={setV4} isDisabled />
        <FileInput label="With error" value={v5} onChange={setV5} status={{
        type: 'error',
        message: 'Please upload a valid file'
      }} />
      </div>;
  }
}`,...H.parameters?.docs?.source}}},U.parameters={...U.parameters,docs:{...U.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [a, setA] = useState<File | File[] | null>(null);
    const [b, setB] = useState<File | File[] | null>(null);
    return <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 24,
      width: 320
    }}>
        <FileInput label="Attached (default)" value={a} onChange={setA} status={{
        type: 'error',
        message: 'File must be under 10MB'
      }} />
        <FileInput label="Detached" value={b} onChange={setB} status={{
        type: 'error',
        message: 'File must be under 10MB'
      }} statusVariant="detached" />
      </div>;
  }
}`,...U.parameters?.docs?.source}}},W=[`Default`,`WithDescription`,`MultipleFiles`,`ImagesOnly`,`DropzoneMode`,`Required`,`Optional`,`Disabled`,`DisabledWithMessage`,`Loading`,`WithErrorStatus`,`WithSuccessStatus`,`WithTooltip`,`AllVariations`,`StatusVariantComparison`]})))()}G();export{H as AllVariations,k as Default,I as Disabled,L as DisabledWithMessage,N as DropzoneMode,M as ImagesOnly,R as Loading,j as MultipleFiles,F as Optional,P as Required,U as StatusVariantComparison,A as WithDescription,z as WithErrorStatus,B as WithSuccessStatus,V as WithTooltip,W as __namedExportsOrder,O as default};