import{ah as r,a1 as e,a7 as we,a6 as ze,af as Ve,ay as je,e as Y,I as N}from"./iframe-DVtWfngO.js";import{F as Se}from"./Field-ClHo92iR.js";import{I as Ce}from"./InputClearButton-DF4RvQOv.js";import"./preload-helper-Ct5FWWRu.js";import"./FieldStatus-D14qdZVC.js";function Ie(a){return a<1024?`${a} B`:a<1024*1024?`${(a/1024).toFixed(1)} KB`:`${(a/(1024*1024)).toFixed(1)} MB`}function De(a,s,t,u,h){const p=[];let i=a;if(s){const m=s.split(",").map(d=>d.trim().toLowerCase());i=i.filter(d=>{const l=m.some(y=>y.startsWith(".")?d.name.toLowerCase().endsWith(y):y.endsWith("/*")?d.type.startsWith(y.slice(0,-1)):d.type.toLowerCase()===y);return l||p.push(`"${d.name}" is not an accepted file type`),l})}return t!=null&&(i=i.filter(m=>m.size>t?(p.push(`"${m.name}" exceeds ${Ie(t)} limit`),!1):!0)),h&&u!=null&&i.length>u&&(p.push(`Maximum ${u} files allowed`),i=i.slice(0,u)),{valid:i,errors:p}}const k={dropzone:{kB7OPa:"astryx9f619",kVAEAm:"astryx1n2onr6",kY2c9j:"astryx1vjfegm",k1xSpc:"astryx78zum5",kXwgrk:"astryxdt5ytf",kGNEyG:"astryx6s0dn4",kjj79g:"astryxl56j7k",kOIVth:"astryx1txdalj",k8WAf4:"astryxq6koh6",kg3NbH:"astryx1pzlopt",kMzoRj:"astryx1litavf",ksu8eU:"astryxbsl7fq",kVAM5u:"astryxvy26l8 astryx6q1khz",kaIpWk:"astryxh6dtrn",kWkggS:"astryx10xzikg",k1ekBW:"astryx1tv3a4w",kIyJzY:"astryxuedmi6 astryx12w9bfk",kAMwcw:"astryxlr8y92",kkrTdU:"astryx1ypdohk",kI3sdo:"astryx1a2a7pz",$$css:!0},dropzoneHover:{kGVxlE:"astryxw6ruzt",$$css:!0},dropzoneActive:{kVAM5u:"astryxad5do",kWkggS:"astryxgcxg3y",$$css:!0},dropzoneDisabled:{kkrTdU:"astryx1h6gzvc",kSiTet:"astryxbyyjgo",kVAM5u:"astryxvy26l8",$$css:!0},compact:{kB7OPa:"astryx9f619",kVAEAm:"astryx1n2onr6",kY2c9j:"astryx1vjfegm",k1xSpc:"astryx78zum5",kGNEyG:"astryx6s0dn4",kOIVth:"astryx1txdalj",k8WAf4:"astryxu0wf1k",kg3NbH:"astryxf314gf",kMzoRj:"astryx1litavf",ksu8eU:"astryx1y0btm7",kVAM5u:"astryxvy26l8 astryx6q1khz",kaIpWk:"astryxh6dtrn",kWkggS:"astryx10xzikg",k1ekBW:"astryx12zzom9",kIyJzY:"astryxuedmi6 astryx12w9bfk",kAMwcw:"astryxlr8y92",kGVxlE:"astryx1gnnqk1 astryx70dsy8",kkrTdU:"astryx1ypdohk",kZKoxP:"astryx1ueg155",kI3sdo:"astryx1a2a7pz",$$css:!0},compactDisabled:{kkrTdU:"astryx1h6gzvc",kSiTet:"astryxbyyjgo",kVAM5u:"astryxvy26l8",$$css:!0}},We={warning:{kVAM5u:"astryx8wg1ba",kzOINU:null,kGJrpR:null,kaZRDh:null,kBCPoo:null,k26BEO:null,k5QoK5:null,kLZC3w:null,kL6WhQ:null,$$css:!0},error:{kVAM5u:"astryx1ofxpqo",kzOINU:null,kGJrpR:null,kaZRDh:null,kBCPoo:null,k26BEO:null,k5QoK5:null,kLZC3w:null,kL6WhQ:null,$$css:!0},success:{kVAM5u:"astryx16m2moy",kzOINU:null,kGJrpR:null,kaZRDh:null,kBCPoo:null,k26BEO:null,k5QoK5:null,kLZC3w:null,kL6WhQ:null,$$css:!0}};function o({label:a,isLabelHidden:s=!1,value:t,onChange:u,changeAction:h,accept:p,isMultiple:i=!1,maxSize:m,maxFiles:d,isDisabled:l=!1,isRequired:y=!1,isLoading:F=!1,status:_,description:R,placeholder:X,mode:x="input",isOptional:ee=!1,labelTooltip:ae,width:te,xstyle:re,className:se,style:le,ref:ne,...oe}){const L=r.useId(),G=r.useId(),H=r.useId(),ie=r.useId(),g=r.useRef(null),[J,w]=r.useState(!1),[B,$]=r.useState(null),[,K]=r.useTransition(),c=_??(B?{type:"error",message:B}:void 0),ue={warning:"warning",error:"error",success:"success"},ce={warning:"warning",error:"error",success:"success"},de=[R?G:null,c?.message?H:null].filter(Boolean).join(" ")||void 0,O=X??(i?"Choose files":"Choose file"),z=r.useCallback(n=>{if(l)return;const{valid:f,errors:Z}=De(n,p,m,d,i);if(Z.length>0?$(Z[0]):$(null),f.length===0){u(null);return}const Q=i?f:f[0];u(Q),h&&K(async()=>{await h(Q)})},[p,l,i,d,m,u,h,K]),pe=r.useCallback(n=>{const f=Array.from(n.target.files??[]);z(f),g.current&&(g.current.value="")},[z]),me=r.useCallback(n=>{n.stopPropagation(),$(null),u(null),g.current&&(g.current.value="",g.current.focus())},[u]),ye=r.useCallback(()=>{l||g.current?.click()},[l]),xe=r.useCallback(n=>{(n.key==="Enter"||n.key===" ")&&!l&&(n.preventDefault(),g.current?.click())},[l]),ge=r.useCallback(n=>{n.preventDefault(),n.stopPropagation(),!l&&x==="dropzone"&&w(!0)},[l,x]),fe=r.useCallback(n=>{n.preventDefault(),n.stopPropagation(),!l&&x==="dropzone"&&w(!0)},[l,x]),he=r.useCallback(n=>{n.preventDefault(),n.stopPropagation(),w(!1)},[]),ve=r.useCallback(n=>{if(n.preventDefault(),n.stopPropagation(),w(!1),l||x!=="dropzone")return;const f=Array.from(n.dataTransfer.files);f.length>0&&z(f)},[l,x,z]),b=t!=null&&(Array.isArray(t)?t.length>0:!0),E=b?Array.isArray(t)?t.map(n=>n.name).join(", "):t?.name??"":null,ke=()=>F?e.jsx(Y,{size:"md"}):b?e.jsx("div",{className:"astryx9ynric astryxjm74w1 astryx6pjikd astryxw6l6zx astryx1tgivj0 astryxb3r6kr astryxlyipyv astryx98rzlu astryxeuugli astryx2b8uid astryxeaf4i8",children:E}):e.jsxs(e.Fragment,{children:[e.jsx(N,{icon:"arrowUp",size:"md",color:"secondary"}),e.jsx("span",{className:"astryx9ynric astryxjm74w1 astryx6pjikd astryxw6l6zx astryxv1l7n4 astryx2b8uid astryx87ps6o",children:J?"Drop files here":O})]}),be=()=>F?e.jsxs(e.Fragment,{children:[e.jsx("span",{className:"astryx9ynric astryxjm74w1 astryx6pjikd astryxw6l6zx astryx1tgivj0 astryxb3r6kr astryxlyipyv astryxuxw1ft astryx98rzlu astryxeuugli",children:E??O}),e.jsx(Y,{size:"sm"})]}):e.jsxs(e.Fragment,{children:[e.jsx(N,{icon:"arrowUp",size:"sm",color:"secondary"}),e.jsx("span",{...{0:{className:"astryx9ynric astryxjm74w1 astryx6pjikd astryxw6l6zx astryxv1l7n4 astryx87ps6o astryx1yc453h astryx98rzlu astryxeuugli"},2:{className:"astryx9ynric astryxjm74w1 astryx6pjikd astryxw6l6zx astryx1tgivj0 astryxb3r6kr astryxlyipyv astryxuxw1ft astryx1yc453h astryx98rzlu astryxeuugli"},1:{className:"astryx9ynric astryxjm74w1 astryx6pjikd astryxw6l6zx astryxv1l7n4 astryx87ps6o astryx1yc453h"},3:{className:"astryx9ynric astryxjm74w1 astryx6pjikd astryxw6l6zx astryx1tgivj0 astryxb3r6kr astryxlyipyv astryxuxw1ft astryx98rzlu astryxeuugli astryx1yc453h"}}[!!b<<1|!!b<<0],children:E??O}),c&&e.jsx(N,{icon:ue[c.type],size:"md",color:ce[c.type]})]}),v=x==="dropzone",Fe=v?{onDragEnter:ge,onDragOver:fe,onDragLeave:he,onDrop:ve}:{};return e.jsxs(Se,{label:a,isLabelHidden:s,description:R,inputID:L,descriptionID:R?G:void 0,isOptional:ee,isRequired:y,isDisabled:l,status:c?{type:c.type,message:c.message,messageID:c.message?H:void 0}:void 0,labelTooltip:ae,width:te,children:[e.jsxs("div",{role:"button",tabIndex:l?-1:0,onClick:ye,onKeyDown:xe,"aria-label":a,"aria-busy":F||void 0,"aria-describedby":de,"aria-required":y?"true":void 0,"aria-invalid":c?.type==="error"?"true":void 0,...Fe,...ze(je("file-input",{mode:x,status:c?.type??null}),Ve(v?k.dropzone:k.compact,v&&!l&&k.dropzoneHover,v&&J&&k.dropzoneActive,v&&l&&k.dropzoneDisabled,!v&&l&&k.compactDisabled,c&&We[c.type],re),se,le),children:[e.jsx("input",{...oe,ref:we(ne,g),id:L,type:"file",accept:p,multiple:i,disabled:l,onChange:pe,"aria-hidden":"true",tabIndex:-1,className:"astryx10l6tqk astryx1i1rx1s astryxjm9jq1 astryx1717udv astryxkdpibf astryxb3r6kr astryxzpqnlu astryxuxw1ft astryxc342km"}),v?ke():be(),b&&!l&&!F&&e.jsx(Ce,{label:`Clear ${a}`,onClick:me})]}),e.jsx("div",{id:ie,role:"status","aria-live":"polite",className:"astryx10l6tqk astryx1i1rx1s astryxjm9jq1 astryx1717udv astryxkdpibf astryxb3r6kr astryxzpqnlu astryxuxw1ft astryxc342km",children:B})]})}o.displayName="FileInput";o.__docgenInfo={description:'A file input component with optional drag-and-drop support.\n\n@example\n```\n<FileInput label="Resume" value={file} onChange={setFile} accept=".pdf" />\n```',methods:[],displayName:"FileInput",props:{ref:{required:!1,tsType:{name:"ReactRef",raw:"React.Ref<HTMLInputElement>",elements:[{name:"HTMLInputElement"}]},description:""},label:{required:!0,tsType:{name:"string"},description:"Accessible label for the file input."},isLabelHidden:{required:!1,tsType:{name:"boolean"},description:`Whether to visually hide the label (still accessible to screen readers).
@default false`,defaultValue:{value:"false",computed:!1}},value:{required:!0,tsType:{name:"union",raw:"File | File[] | null",elements:[{name:"File"},{name:"Array",elements:[{name:"File"}],raw:"File[]"},{name:"null"}]},description:"Currently selected file(s). Controlled component."},onChange:{required:!0,tsType:{name:"signature",type:"function",raw:"(files: File | File[] | null) => void",signature:{arguments:[{type:{name:"union",raw:"File | File[] | null",elements:[{name:"File"},{name:"Array",elements:[{name:"File"}],raw:"File[]"},{name:"null"}]},name:"files"}],return:{name:"void"}}},description:"Callback fired when files are selected or removed."},changeAction:{required:!1,tsType:{name:"signature",type:"function",raw:"(files: File | File[] | null) => Promise<void>",signature:{arguments:[{type:{name:"union",raw:"File | File[] | null",elements:[{name:"File"},{name:"Array",elements:[{name:"File"}],raw:"File[]"},{name:"null"}]},name:"files"}],return:{name:"Promise",elements:[{name:"void"}],raw:"Promise<void>"}}},description:`Async change action (React 19 transitions pattern).
Use for immediate upload on file selection.`},accept:{required:!1,tsType:{name:"string"},description:`Accepted file types. Uses the HTML accept attribute format.
Examples: "image/*", ".pdf,.doc,.docx", "image/png,image/jpeg"`},isMultiple:{required:!1,tsType:{name:"boolean"},description:"Whether multiple files can be selected.\nWhen true, `value` and `onChange` use `File[]` instead of `File`.\n@default false",defaultValue:{value:"false",computed:!1}},maxSize:{required:!1,tsType:{name:"number"},description:`Maximum file size in bytes. Files exceeding this are rejected
with an error status.`},maxFiles:{required:!1,tsType:{name:"number"},description:"Maximum number of files (only applies when `isMultiple` is true)."},isDisabled:{required:!1,tsType:{name:"boolean"},description:`Whether the input is disabled.
@default false`,defaultValue:{value:"false",computed:!1}},isRequired:{required:!1,tsType:{name:"boolean"},description:`Whether the input is required.
@default false`,defaultValue:{value:"false",computed:!1}},isLoading:{required:!1,tsType:{name:"boolean"},description:`Whether the input is in a loading state (e.g. uploading).
@default false`,defaultValue:{value:"false",computed:!1}},status:{required:!1,tsType:{name:"InputStatus"},description:"Validation status for the input."},description:{required:!1,tsType:{name:"string"},description:"Description text displayed below the label."},placeholder:{required:!1,tsType:{name:"string"},description:`Placeholder text shown when no file is selected.
@default "Choose file" or "Choose files"`},mode:{required:!1,tsType:{name:"union",raw:"'dropzone' | 'input'",elements:[{name:"literal",value:"'dropzone'"},{name:"literal",value:"'input'"}]},description:`Visual mode for the file input.
- 'input': compact inline style, similar to a text input
- 'dropzone': larger area with dashed border and drag-and-drop support
@default 'input'`,defaultValue:{value:"'input'",computed:!1}},isOptional:{required:!1,tsType:{name:"boolean"},description:`Whether the field is optional. Mutually exclusive with isRequired.
@default false`,defaultValue:{value:"false",computed:!1}},width:{required:!1,tsType:{name:"union",raw:"number | string",elements:[{name:"number"},{name:"string"}]},description:"Width of the field. Numbers are treated as pixels, strings are used as-is\n(e.g. `'100%'`). Sizes the whole field (label, control, and status) so they\nstay aligned, unlike setting width via `xstyle`/`className`/`style`."},labelTooltip:{required:!1,tsType:{name:"string"},description:"Tooltip text to display in an info icon at the end of the label."}},composes:["Omit"]};const Re={title:"Core/FileInput",component:o,tags:["autodocs"],argTypes:{label:{control:"text",description:"Label text (required)"},isLabelHidden:{control:"boolean",description:"Visually hide the label (still accessible to screen readers)"},placeholder:{control:"text",description:"Placeholder text"},description:{control:"text",description:"Description text displayed between the label and input"},accept:{control:"text",description:'Accepted file types (e.g. "image/*", ".pdf,.doc")'},isMultiple:{control:"boolean",description:"Whether multiple files can be selected"},isOptional:{control:"boolean",description:"Whether the field is optional (mutually exclusive with isRequired)"},isRequired:{control:"boolean",description:"Whether the field is required (mutually exclusive with isOptional)"},isDisabled:{control:"boolean",description:"Whether the input is disabled"},isLoading:{control:"boolean",description:"Whether the input is in a loading state"},mode:{control:"select",options:["input","dropzone"],description:"Visual mode: compact input or drag-and-drop dropzone"},status:{control:"object",description:"Status indicator with type (warning/error/success) and optional message"},labelTooltip:{control:"text",description:"Tooltip text to display in an info icon at the end of the label"}}},V={render:a=>{const[s,t]=r.useState(null);return e.jsx(o,{...a,value:s,onChange:t})},args:{label:"Upload file",placeholder:"Drag files here or click to browse"}},j={render:a=>{const[s,t]=r.useState(null);return e.jsx(o,{...a,value:s,onChange:t})},args:{label:"Resume",description:"Upload your resume in PDF or Word format. Max 5MB.",accept:".pdf,.doc,.docx"}},S={render:a=>{const[s,t]=r.useState(null);return e.jsx(o,{...a,value:s,onChange:t})},args:{label:"Attachments",isMultiple:!0,description:"Upload up to 10 files. Max 5MB each.",maxFiles:10,maxSize:5*1024*1024}},C={render:a=>{const[s,t]=r.useState(null);return e.jsx(o,{...a,value:s,onChange:t})},args:{label:"Profile photo",accept:"image/png,image/jpeg",description:"PNG or JPEG, max 2MB.",maxSize:2*1024*1024}},I={render:a=>{const[s,t]=r.useState(null);return e.jsx(o,{...a,value:s,onChange:t})},args:{label:"Upload files",mode:"dropzone",placeholder:"Drag files here or click to browse"}},D={render:a=>{const[s,t]=r.useState(null);return e.jsx(o,{...a,value:s,onChange:t})},args:{label:"Supporting document",isRequired:!0}},W={render:a=>{const[s,t]=r.useState(null);return e.jsx(o,{...a,value:s,onChange:t})},args:{label:"Cover letter",isOptional:!0}},M={render:a=>{const[s,t]=r.useState(null);return e.jsx(o,{...a,value:s,onChange:t})},args:{label:"Upload locked",isDisabled:!0,placeholder:"Upload is currently disabled"}},T={render:a=>{const[s,t]=r.useState(null);return e.jsx(o,{...a,value:s,onChange:t})},args:{label:"Uploading...",isLoading:!0}},q={render:a=>{const[s,t]=r.useState(null);return e.jsx(o,{...a,value:s,onChange:t})},args:{label:"Upload document",status:{type:"error",message:"File must be under 10MB"}}},A={render:a=>{const[s,t]=r.useState(null);return e.jsx(o,{...a,value:s,onChange:t})},args:{label:"Upload document",status:{type:"success",message:"File uploaded successfully"}}},U={render:a=>{const[s,t]=r.useState(null);return e.jsx(o,{...a,value:s,onChange:t})},args:{label:"Tax documents",labelTooltip:"Upload W-2 forms, 1099s, or other tax-related documents."}},P={render:()=>{const[a,s]=r.useState(null),[t,u]=r.useState(null),[h,p]=r.useState(null),[i,m]=r.useState(null),[d,l]=r.useState(null);return e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"24px",maxWidth:"400px"},children:[e.jsx(o,{label:"Default (input mode)",value:a,onChange:s}),e.jsx(o,{label:"Dropzone with constraints",value:t,onChange:u,mode:"dropzone",isMultiple:!0,accept:"image/*",maxSize:5*1024*1024,maxFiles:5,description:"Up to 5 images, max 5MB each"}),e.jsx(o,{label:"Dropzone mode",value:h,onChange:p,mode:"dropzone",placeholder:"Drag files here or click to browse"}),e.jsx(o,{label:"Disabled",value:i,onChange:m,isDisabled:!0}),e.jsx(o,{label:"With error",value:d,onChange:l,status:{type:"error",message:"Please upload a valid file"}})]})}};V.parameters={...V.parameters,docs:{...V.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<File | File[] | null>(null);
    return <FileInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Upload file',
    placeholder: 'Drag files here or click to browse'
  }
}`,...V.parameters?.docs?.source}}};j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<File | File[] | null>(null);
    return <FileInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Resume',
    description: 'Upload your resume in PDF or Word format. Max 5MB.',
    accept: '.pdf,.doc,.docx'
  }
}`,...j.parameters?.docs?.source}}};S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
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
}`,...S.parameters?.docs?.source}}};C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
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
}`,...C.parameters?.docs?.source}}};I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<File | File[] | null>(null);
    return <FileInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Upload files',
    mode: 'dropzone',
    placeholder: 'Drag files here or click to browse'
  }
}`,...I.parameters?.docs?.source}}};D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<File | File[] | null>(null);
    return <FileInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Supporting document',
    isRequired: true
  }
}`,...D.parameters?.docs?.source}}};W.parameters={...W.parameters,docs:{...W.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<File | File[] | null>(null);
    return <FileInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Cover letter',
    isOptional: true
  }
}`,...W.parameters?.docs?.source}}};M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<File | File[] | null>(null);
    return <FileInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Upload locked',
    isDisabled: true,
    placeholder: 'Upload is currently disabled'
  }
}`,...M.parameters?.docs?.source}}};T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<File | File[] | null>(null);
    return <FileInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Uploading...',
    isLoading: true
  }
}`,...T.parameters?.docs?.source}}};q.parameters={...q.parameters,docs:{...q.parameters?.docs,source:{originalSource:`{
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
}`,...q.parameters?.docs?.source}}};A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
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
}`,...A.parameters?.docs?.source}}};U.parameters={...U.parameters,docs:{...U.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<File | File[] | null>(null);
    return <FileInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Tax documents',
    labelTooltip: 'Upload W-2 forms, 1099s, or other tax-related documents.'
  }
}`,...U.parameters?.docs?.source}}};P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
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
}`,...P.parameters?.docs?.source}}};const Be=["Default","WithDescription","MultipleFiles","ImagesOnly","DropzoneMode","Required","Optional","Disabled","Loading","WithErrorStatus","WithSuccessStatus","WithTooltip","AllVariations"];export{P as AllVariations,V as Default,M as Disabled,I as DropzoneMode,C as ImagesOnly,T as Loading,S as MultipleFiles,W as Optional,D as Required,j as WithDescription,q as WithErrorStatus,A as WithSuccessStatus,U as WithTooltip,Be as __namedExportsOrder,Re as default};
