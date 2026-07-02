import{aL as we,ah as t,a1 as a,aj as Ve,a7 as Ae,e as je,I as Ie,a6 as De,af as Ee,ay as Me}from"./iframe-FpdBIrKz.js";import{F as We}from"./Field-aJnAslJ5.js";import{a as qe,b as Le,i as ke,c as ne}from"./inputStyles.stylex-Bpqcd25J.js";import{u as Ne}from"./useInputContainer-BioBew49.js";import{T as ze}from"./TextInput-9l97PzER.js";import{F as Q}from"./DocumentTextIcon-BuypfCix.js";import{a as Re,F as He}from"./PencilSquareIcon-D3oWUE2B.js";import"./preload-helper-Ct5FWWRu.js";import"./FieldStatus-DWE8xW4u.js";import"./useClickableContainer-k5V8_ZgW.js";import"./groupStyles-C176OdEO.js";const Oe=.8,Fe={wrapper:{kY2c9j:"astryx1vjfegm",kGNEyG:"astryx1cy8zhl",k8WAf4:"astryxu0wf1k",kLKAdn:null,kGO01o:null,$$css:!0}},Pe={sm:{$$css:!0},md:{$$css:!0},lg:{k8WAf4:"astryxce4md1",kLKAdn:null,kGO01o:null,$$css:!0}};function n({label:e,isLabelHidden:s=!1,description:r,isOptional:i=!1,isRequired:u=!1,onChange:c,changeAction:p,isLoading:m=!1,value:x,placeholder:y,rows:b=3,isDisabled:h=!1,status:l,labelTooltip:v,startIcon:g,hasSpellCheck:f=!0,onPaste:S,maxLength:o,hasAutoFocus:T=!1,size:le,htmlName:oe,onFocus:ie,onBlur:ue,width:ce,xstyle:de,className:pe,style:me,ref:he,...ge}){const X=we(le,"md"),Z=t.useId(),ee=t.useId(),ae=t.useId(),te=t.useId(),se=t.useRef(null),re=t.useRef(null),[,xe]=t.useTransition(),[d,ve]=t.useOptimistic(x),Y=m||d!==x,ye={warning:"warning",error:"error",success:"success"},be={warning:"warning",error:"error",success:"success"},fe=[r?ee:null,l?.message?ae:null,o!=null?te:null].filter(Boolean).join(" ")||void 0,Se=C=>{const J=C.target.value;c?.(J,C),p&&!C.defaultPrevented&&xe(async()=>{ve(J),await p(J,C)})},K=h||Y,{onClick:Te,onMouseUp:Ce}=Ne({containerRef:re,inputRef:se,disabled:K});return a.jsxs(We,{label:e,isLabelHidden:s,description:r,inputID:Z,descriptionID:r?ee:void 0,isOptional:i,isRequired:u,isDisabled:h,status:l?{type:l.type,message:l.message,messageID:l.message?ae:void 0}:void 0,labelTooltip:v,width:ce,children:[a.jsxs("div",{ref:re,onClick:Te,onMouseUp:Ce,...De(Me("textarea",{size:X,status:l?.type??null}),Ee(ne.base,Fe.wrapper,Pe[X],K&&ne.disabled,l&&ke[l.type],l&&Le[l.type],l&&qe[l.type],de),pe,me),children:[g&&Ve(g,{size:"sm",color:"secondary"}),a.jsx("textarea",{...ge,ref:Ae(he,se),id:Z,name:oe,value:d,onChange:Se,onPaste:S,onFocus:ie,onBlur:ue,placeholder:y,rows:b,disabled:h,spellCheck:f,autoFocus:T,"data-autofocus":T||void 0,"aria-describedby":fe,"aria-required":u&&!i?"true":void 0,"aria-invalid":l?.type==="error"||o!=null&&d.length>o?"true":void 0,"aria-busy":Y||void 0,...{0:{className:"astryx1lliihq astryx98rzlu astryxeuugli astryxc342km astryxng3xce astryx1717udv astryx9ynric astryxjm74w1 astryx6pjikd astryxw6l6zx astryx1tgivj0 astryxjbqb8w astryx1a2a7pz astryxeyghm5 astryx288g5"},2:{className:"astryx1lliihq astryx98rzlu astryxeuugli astryxc342km astryxng3xce astryx1717udv astryx9ynric astryxjm74w1 astryx6pjikd astryxw6l6zx astryx1tgivj0 astryxjbqb8w astryx1a2a7pz astryxeyghm5 astryx288g5 astryx1h6gzvc"},1:{className:"astryx1lliihq astryx98rzlu astryxeuugli astryxc342km astryxng3xce astryx1717udv astryx9ynric astryxjm74w1 astryx6pjikd astryxw6l6zx astryx1tgivj0 astryxjbqb8w astryx1a2a7pz astryxeyghm5 astryx288g5 astryx1we12cn"},3:{className:"astryx1lliihq astryx98rzlu astryxeuugli astryxc342km astryxng3xce astryx1717udv astryx9ynric astryxjm74w1 astryx6pjikd astryxw6l6zx astryx1tgivj0 astryxjbqb8w astryx1a2a7pz astryxeyghm5 astryx288g5 astryx1h6gzvc astryx1we12cn"}}[!!K<<1|!!l<<0]}),Y&&a.jsx(je,{size:"sm"}),l&&a.jsx("span",{className:"astryx10l6tqk astryxctzyg astryx72tfeb astryx47corl astryx78zum5",children:a.jsx(Ie,{icon:ye[l.type],size:"md",color:be[l.type]})})]}),o!=null&&a.jsxs("div",{id:te,...{0:{className:"astryx78zum5 astryx13a6bvl astryxcsaf9d astryx9ynric astryx141an7d astryxv1l7n4"},1:{className:"astryx78zum5 astryx13a6bvl astryxcsaf9d astryx9ynric astryx141an7d astryxjt36v0"}}[(d.length>o)<<0],children:[d.length,"/",o,a.jsx("span",{"aria-live":"polite",className:"astryx10l6tqk astryx1i1rx1s astryxjm9jq1 astryx1717udv astryxkdpibf astryxb3r6kr astryxzpqnlu astryxuxw1ft astryxc342km",children:d.length>=o*Oe?d.length>o?`${d.length-o} characters over limit`:`${o-d.length} characters remaining`:""})]})]})}n.displayName="TextArea";n.__docgenInfo={description:'A multi-line text input component for collecting longer user input.\n\n@example\n```\n<TextArea label="Description" value={description} onChange={setDescription} />\n<TextArea label="Notes" rows={5} value={notes} onChange={setNotes} />\n```',methods:[],displayName:"TextArea",props:{ref:{required:!1,tsType:{name:"ReactRef",raw:"React.Ref<HTMLTextAreaElement>",elements:[{name:"HTMLTextAreaElement"}]},description:"Ref forwarded to the root element"},label:{required:!0,tsType:{name:"string"},description:"Label text for the textarea (always rendered for accessibility)."},isLabelHidden:{required:!1,tsType:{name:"boolean"},description:`Whether to visually hide the label (still accessible to screen readers).
@default false`,defaultValue:{value:"false",computed:!1}},description:{required:!1,tsType:{name:"string"},description:"Description text displayed between the label and textarea."},isOptional:{required:!1,tsType:{name:"boolean"},description:`Whether the field is optional. Mutually exclusive with isRequired.
@default false`,defaultValue:{value:"false",computed:!1}},isRequired:{required:!1,tsType:{name:"boolean"},description:`Whether the field is required. Mutually exclusive with isOptional.
@default false`,defaultValue:{value:"false",computed:!1}},onChange:{required:!1,tsType:{name:"signature",type:"function",raw:"(value: string, e: ChangeEvent<HTMLTextAreaElement>) => void",signature:{arguments:[{type:{name:"string"},name:"value"},{type:{name:"ChangeEvent",elements:[{name:"HTMLTextAreaElement"}],raw:"ChangeEvent<HTMLTextAreaElement>"},name:"e"}],return:{name:"void"}}},description:"Callback fired when the textarea value changes."},changeAction:{required:!1,tsType:{name:"signature",type:"function",raw:`(
  value: string,
  e: ChangeEvent<HTMLTextAreaElement>,
) => void | Promise<void>`,signature:{arguments:[{type:{name:"string"},name:"value"},{type:{name:"ChangeEvent",elements:[{name:"HTMLTextAreaElement"}],raw:"ChangeEvent<HTMLTextAreaElement>"},name:"e"}],return:{name:"union",raw:"void | Promise<void>",elements:[{name:"void"},{name:"Promise",elements:[{name:"void"}],raw:"Promise<void>"}]}}},description:"Async action on change. Fires after onChange if not prevented."},isLoading:{required:!1,tsType:{name:"boolean"},description:"Whether the input is in a loading state. @default false",defaultValue:{value:"false",computed:!1}},value:{required:!0,tsType:{name:"string"},description:"The current value of the textarea."},placeholder:{required:!1,tsType:{name:"string"},description:"Placeholder text shown when the textarea is empty."},rows:{required:!1,tsType:{name:"number"},description:`The number of visible text rows.
@default 3`,defaultValue:{value:"3",computed:!1}},isDisabled:{required:!1,tsType:{name:"boolean"},description:`Whether the textarea is disabled.
@default false`,defaultValue:{value:"false",computed:!1}},status:{required:!1,tsType:{name:"TextAreaStatus"},description:`Status indicator for the textarea.
When set, displays a colored border and status icon.
If message is provided, displays a floating message box below the textarea.`},width:{required:!1,tsType:{name:"union",raw:"number | string",elements:[{name:"number"},{name:"string"}]},description:"Width of the field. Numbers are treated as pixels, strings are used as-is\n(e.g. `'100%'`). Sizes the whole field (label, control, and status) so they\nstay aligned, unlike setting width via `xstyle`/`className`/`style`."},labelTooltip:{required:!1,tsType:{name:"string"},description:"Tooltip text to display in an info icon at the end of the label."},startIcon:{required:!1,tsType:{name:"union",raw:"ReactNode | IconType",elements:[{name:"ReactNode"},{name:"ComponentType",elements:[{name:"SVGProps",elements:[{name:"SVGSVGElement"}],raw:"SVGProps<SVGSVGElement>"}],raw:"ComponentType<SVGProps<SVGSVGElement>>"}]},description:"Icon to display at the start of the textarea.\nAccepts a ReactNode (e.g. `<Icon icon={SearchIcon} />`) or an SVG icon component directly."},hasSpellCheck:{required:!1,tsType:{name:"boolean"},description:`Whether to enable browser spell checking.
@default true`,defaultValue:{value:"true",computed:!1}},onPaste:{required:!1,tsType:{name:"signature",type:"function",raw:"(e: ClipboardEvent<HTMLTextAreaElement>) => void",signature:{arguments:[{type:{name:"ClipboardEvent",elements:[{name:"HTMLTextAreaElement"}],raw:"ClipboardEvent<HTMLTextAreaElement>"},name:"e"}],return:{name:"void"}}},description:"Callback fired when content is pasted into the textarea."},maxLength:{required:!1,tsType:{name:"number"},description:`Maximum number of characters allowed.
When set, displays a character counter below the textarea.
Does not enforce the limit natively — the counter shows error styling
when exceeded, and the consumer can validate via onChange.`},hasAutoFocus:{required:!1,tsType:{name:"boolean"},description:`Whether to automatically focus the textarea on mount.
@default false`,defaultValue:{value:"false",computed:!1}},size:{required:!1,tsType:{name:"union",raw:"'sm' | 'md' | 'lg'",elements:[{name:"literal",value:"'sm'"},{name:"literal",value:"'md'"},{name:"literal",value:"'lg'"}]},description:"The size of the textarea, affecting internal padding.\nHeight is controlled by `rows`, not size.\n@default 'md'"},htmlName:{required:!1,tsType:{name:"string"},description:`The HTML name attribute for the textarea.
Useful for form submissions.`},onFocus:{required:!1,tsType:{name:"signature",type:"function",raw:"(e: FocusEvent<HTMLTextAreaElement>) => void",signature:{arguments:[{type:{name:"FocusEvent",elements:[{name:"HTMLTextAreaElement"}],raw:"FocusEvent<HTMLTextAreaElement>"},name:"e"}],return:{name:"void"}}},description:"Callback fired when the textarea receives focus."},onBlur:{required:!1,tsType:{name:"signature",type:"function",raw:"(e: FocusEvent<HTMLTextAreaElement>) => void",signature:{arguments:[{type:{name:"FocusEvent",elements:[{name:"HTMLTextAreaElement"}],raw:"FocusEvent<HTMLTextAreaElement>"},name:"e"}],return:{name:"void"}}},description:"Callback fired when the textarea loses focus."}},composes:["Omit"]};const ea={title:"Core/TextArea",component:n,tags:["autodocs"],argTypes:{label:{control:"text",description:"Label text (required)"},isLabelHidden:{control:"boolean",description:"Visually hide the label (still accessible to screen readers)"},placeholder:{control:"text",description:"Placeholder text"},description:{control:"text",description:"Description text displayed between the label and textarea"},value:{control:"text",description:"Current textarea value (required)"},isOptional:{control:"boolean",description:"Whether the field is optional (mutually exclusive with isRequired)"},isRequired:{control:"boolean",description:"Whether the field is required (mutually exclusive with isOptional)"},rows:{control:"number",description:"Number of visible text rows (default: 3)"},isDisabled:{control:"boolean",description:"Whether the textarea is disabled"},status:{control:"object",description:"Status indicator with type (warning/error/success) and optional message"},labelTooltip:{control:"text",description:"Tooltip text to display in an info icon at the end of the label"},hasSpellCheck:{control:"boolean",description:"Whether to enable browser spell checking (default: true)"},maxLength:{control:"number",description:"Maximum number of characters allowed. Displays a counter when set."},size:{control:"radio",options:["sm","md","lg"],description:"Textarea size (affects padding, not height)"}}},w={render:e=>{const[s,r]=t.useState(e.value??"");return a.jsx(n,{...e,value:s,onChange:r})},args:{label:"Description",placeholder:"Enter a description..."}},V={render:e=>{const[s,r]=t.useState(e.value??"");return a.jsx(n,{...e,value:s,onChange:r})},args:{label:"Bio",description:"Tell us about yourself in a few sentences.",placeholder:"Write your bio here..."}},A={render:e=>{const[s,r]=t.useState(e.value??"");return a.jsx(n,{...e,value:s,onChange:r})},args:{label:"Comments",isLabelHidden:!0,placeholder:"Add a comment..."}},j={render:e=>{const[s,r]=t.useState(e.value??"This is a pre-filled textarea with some content that demonstrates how the component handles existing text.");return a.jsx(n,{...e,value:s,onChange:r})},args:{label:"Notes",value:"This is a pre-filled textarea with some content that demonstrates how the component handles existing text."}},I={render:e=>{const[s,r]=t.useState(e.value??"");return a.jsx(n,{...e,value:s,onChange:r})},args:{label:"Message",rows:6,placeholder:"Write a longer message..."}},D={render:()=>{const[e,s]=t.useState(""),[r,i]=t.useState(""),[u,c]=t.useState("Pre-filled content in the textarea."),[p,m]=t.useState(""),[x,y]=t.useState(""),[b,h]=t.useState(""),[l,v]=t.useState(""),[g,f]=t.useState(""),[S,o]=t.useState("This field is disabled");return a.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"16px",maxWidth:"400px"},children:[a.jsx(n,{label:"Visible label",value:e,onChange:s,placeholder:"Enter text..."}),a.jsx(n,{label:"With description",description:"Helpful description text",value:p,onChange:m,placeholder:"Enter text..."}),a.jsx(n,{label:"Hidden label",isLabelHidden:!0,value:r,onChange:i,placeholder:"Hidden label textarea"}),a.jsx(n,{label:"With value",value:u,onChange:c}),a.jsx(n,{label:"Optional field",isOptional:!0,value:x,onChange:y,placeholder:"Optional..."}),a.jsx(n,{label:"Required field",isRequired:!0,value:b,onChange:h,placeholder:"Required..."}),a.jsx(n,{label:"Description with optional",description:"Additional notes",isOptional:!0,value:l,onChange:v,placeholder:"Notes..."}),a.jsx(n,{label:"Custom rows (6)",rows:6,value:g,onChange:f,placeholder:"Larger textarea..."}),a.jsx(n,{label:"Disabled field",isDisabled:!0,value:S,onChange:o})]})}},E={render:e=>{const[s,r]=t.useState(e.value??"");return a.jsx(n,{...e,value:s,onChange:r})},args:{label:"Additional Notes",isOptional:!0,placeholder:"Any additional notes..."}},M={render:e=>{const[s,r]=t.useState(e.value??"");return a.jsx(n,{...e,value:s,onChange:r})},args:{label:"Feedback",isRequired:!0,placeholder:"Please provide your feedback..."}},W={render:e=>{const[s,r]=t.useState(e.value??"");return a.jsx(n,{...e,value:s,onChange:r})},args:{label:"Comments",description:"Share any additional thoughts or comments",isOptional:!0,placeholder:"Your comments here..."}},q={render:e=>{const[s,r]=t.useState(e.value??"This textarea is disabled and cannot be edited.");return a.jsx(n,{...e,value:s,onChange:r})},args:{label:"Disabled Field",isDisabled:!0,value:"This textarea is disabled and cannot be edited."}},L={render:e=>{const[s,r]=t.useState(e.value??"");return a.jsx(n,{...e,value:s,onChange:r})},args:{label:"Notes",placeholder:"Enter your notes...",startIcon:Q}},k={render:()=>{const[e,s]=t.useState(""),[r,i]=t.useState(""),[u,c]=t.useState("");return a.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"16px",maxWidth:"400px"},children:[a.jsx(n,{label:"Notes",value:e,onChange:s,placeholder:"Enter your notes...",startIcon:Q}),a.jsx(n,{label:"Message",value:r,onChange:i,placeholder:"Type your message...",startIcon:Re}),a.jsx(n,{label:"Draft",value:u,onChange:c,placeholder:"Write your draft...",startIcon:He})]})}},N={render:e=>{const[s,r]=t.useState(e.value??"Too short");return a.jsx(n,{...e,value:s,onChange:r})},args:{label:"Description",placeholder:"Enter a description...",status:{type:"error",message:"Description must be at least 50 characters"}}},z={render:e=>{const[s,r]=t.useState(e.value??"This content may contain issues");return a.jsx(n,{...e,value:s,onChange:r})},args:{label:"Content",placeholder:"Enter content...",status:{type:"warning",message:"Content may need review before publishing"}}},R={render:e=>{const[s,r]=t.useState(e.value??"This is a valid description that meets all requirements.");return a.jsx(n,{...e,value:s,onChange:r})},args:{label:"Description",placeholder:"Enter a description...",status:{type:"success",message:"Description looks good!"}}},H={render:e=>{const[s,r]=t.useState(e.value??"Invalid content");return a.jsx(n,{...e,value:s,onChange:r})},args:{label:"Field",placeholder:"Enter value",status:{type:"error"}}},O={render:()=>{const[e,s]=t.useState("Too short"),[r,i]=t.useState("This may need review"),[u,c]=t.useState("This description meets all the requirements perfectly."),[p,m]=t.useState("Invalid");return a.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"16px",maxWidth:"400px"},children:[a.jsx(n,{label:"Error with message",value:e,onChange:s,status:{type:"error",message:"Must be at least 50 characters"}}),a.jsx(n,{label:"Warning with message",value:r,onChange:i,status:{type:"warning",message:"Content may need review"}}),a.jsx(n,{label:"Success with message",value:u,onChange:c,status:{type:"success",message:"Description is valid"}}),a.jsx(n,{label:"Error without message",value:p,onChange:m,status:{type:"error"}})]})}},F={render:e=>{const[s,r]=t.useState(e.value??"");return a.jsx(n,{...e,value:s,onChange:r})},args:{label:"API Documentation",placeholder:"Describe your API endpoint...",labelTooltip:"Provide a detailed description of what this API endpoint does, including expected inputs and outputs."}},P={render:e=>{const[s,r]=t.useState(e.value??"");return a.jsx(n,{...e,value:s,onChange:r})},args:{label:"Additional Notes",placeholder:"Any additional information...",labelTooltip:"Include any extra details that might be helpful for reviewers.",isOptional:!0}},G={render:()=>{const[e,s]=t.useState("");return a.jsx("div",{style:{maxWidth:"400px"},children:a.jsx(n,{label:"Detailed Description",description:"Provide a comprehensive description of your project",value:e,onChange:s,placeholder:"Enter description...",startIcon:Q,labelTooltip:"This description will be visible to all team members",isRequired:!0,status:e.length>0&&e.length<20?{type:"warning",message:"Consider adding more detail"}:e.length>=20?{type:"success",message:"Description looks good!"}:void 0})})}},B={render:()=>{const[e,s]=t.useState(""),[r,i]=t.useState(""),[u,c]=t.useState(""),[p,m]=t.useState(""),[x,y]=t.useState(""),[b,h]=t.useState("");return a.jsx("div",{style:{display:"flex",flexDirection:"column",gap:"16px"},children:["sm","md","lg"].map((l,v)=>{const g={sm:"Small (28px)",md:"Medium (32px)",lg:"Large (36px)"}[l],[f,S]=[[e,s],[r,i],[u,c]][v],[o,T]=[[p,m],[x,y],[b,h]][v];return a.jsxs("div",{style:{display:"flex",gap:"16px"},children:[a.jsx("div",{style:{flex:1},children:a.jsx(n,{label:g,value:f,onChange:S,placeholder:"TextArea",size:l})}),a.jsx("div",{style:{flex:1},children:a.jsx(ze,{label:g,value:o,onChange:T,placeholder:"TextInput",size:l})})]},l)})})}},$={render:e=>{const[s,r]=t.useState(e.value??"");return a.jsx(n,{...e,value:s,onChange:r})},args:{label:"Bio",placeholder:"Tell us about yourself...",maxLength:150}},_={render:e=>{const[s,r]=t.useState(e.value??"This is a pre-filled bio that demonstrates the character counter.");return a.jsx(n,{...e,value:s,onChange:r})},args:{label:"Bio",maxLength:100}},U={render:()=>{const[e,s]=t.useState(""),[r,i]=t.useState("Some text here"),[u,c]=t.useState("This is a longer text that approaches the maximum length limit.");return a.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"16px",maxWidth:"400px"},children:[a.jsx(n,{label:"Short limit",value:e,onChange:s,placeholder:"Max 50 characters",maxLength:50}),a.jsx(n,{label:"Medium limit",value:r,onChange:i,placeholder:"Max 100 characters",maxLength:100}),a.jsx(n,{label:"Long limit",value:u,onChange:c,placeholder:"Max 200 characters",maxLength:200})]})}};w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState(args.value ?? '');
    return <TextArea {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Description',
    placeholder: 'Enter a description...'
  }
}`,...w.parameters?.docs?.source}}};V.parameters={...V.parameters,docs:{...V.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState(args.value ?? '');
    return <TextArea {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Bio',
    description: 'Tell us about yourself in a few sentences.',
    placeholder: 'Write your bio here...'
  }
}`,...V.parameters?.docs?.source}}};A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState(args.value ?? '');
    return <TextArea {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Comments',
    isLabelHidden: true,
    placeholder: 'Add a comment...'
  }
}`,...A.parameters?.docs?.source}}};j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState(args.value ?? 'This is a pre-filled textarea with some content that demonstrates how the component handles existing text.');
    return <TextArea {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Notes',
    value: 'This is a pre-filled textarea with some content that demonstrates how the component handles existing text.'
  }
}`,...j.parameters?.docs?.source}}};I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState(args.value ?? '');
    return <TextArea {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Message',
    rows: 6,
    placeholder: 'Write a longer message...'
  }
}`,...I.parameters?.docs?.source}}};D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [value1, setValue1] = useState('');
    const [value2, setValue2] = useState('');
    const [value3, setValue3] = useState('Pre-filled content in the textarea.');
    const [value4, setValue4] = useState('');
    const [value5, setValue5] = useState('');
    const [value6, setValue6] = useState('');
    const [value7, setValue7] = useState('');
    const [value8, setValue8] = useState('');
    const [value9, setValue9] = useState('This field is disabled');
    return <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      maxWidth: '400px'
    }}>
        <TextArea label="Visible label" value={value1} onChange={setValue1} placeholder="Enter text..." />
        <TextArea label="With description" description="Helpful description text" value={value4} onChange={setValue4} placeholder="Enter text..." />
        <TextArea label="Hidden label" isLabelHidden value={value2} onChange={setValue2} placeholder="Hidden label textarea" />
        <TextArea label="With value" value={value3} onChange={setValue3} />
        <TextArea label="Optional field" isOptional value={value5} onChange={setValue5} placeholder="Optional..." />
        <TextArea label="Required field" isRequired value={value6} onChange={setValue6} placeholder="Required..." />
        <TextArea label="Description with optional" description="Additional notes" isOptional value={value7} onChange={setValue7} placeholder="Notes..." />
        <TextArea label="Custom rows (6)" rows={6} value={value8} onChange={setValue8} placeholder="Larger textarea..." />
        <TextArea label="Disabled field" isDisabled value={value9} onChange={setValue9} />
      </div>;
  }
}`,...D.parameters?.docs?.source}}};E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState(args.value ?? '');
    return <TextArea {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Additional Notes',
    isOptional: true,
    placeholder: 'Any additional notes...'
  }
}`,...E.parameters?.docs?.source}}};M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState(args.value ?? '');
    return <TextArea {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Feedback',
    isRequired: true,
    placeholder: 'Please provide your feedback...'
  }
}`,...M.parameters?.docs?.source}}};W.parameters={...W.parameters,docs:{...W.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState(args.value ?? '');
    return <TextArea {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Comments',
    description: 'Share any additional thoughts or comments',
    isOptional: true,
    placeholder: 'Your comments here...'
  }
}`,...W.parameters?.docs?.source}}};q.parameters={...q.parameters,docs:{...q.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState(args.value ?? 'This textarea is disabled and cannot be edited.');
    return <TextArea {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Disabled Field',
    isDisabled: true,
    value: 'This textarea is disabled and cannot be edited.'
  }
}`,...q.parameters?.docs?.source}}};L.parameters={...L.parameters,docs:{...L.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState(args.value ?? '');
    return <TextArea {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Notes',
    placeholder: 'Enter your notes...',
    startIcon: DocumentTextIcon
  }
}`,...L.parameters?.docs?.source}}};k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [notes, setNotes] = useState('');
    const [message, setMessage] = useState('');
    const [draft, setDraft] = useState('');
    return <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      maxWidth: '400px'
    }}>
        <TextArea label="Notes" value={notes} onChange={setNotes} placeholder="Enter your notes..." startIcon={DocumentTextIcon} />
        <TextArea label="Message" value={message} onChange={setMessage} placeholder="Type your message..." startIcon={ChatBubbleLeftIcon} />
        <TextArea label="Draft" value={draft} onChange={setDraft} placeholder="Write your draft..." startIcon={PencilSquareIcon} />
      </div>;
  }
}`,...k.parameters?.docs?.source}}};N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState(args.value ?? 'Too short');
    return <TextArea {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Description',
    placeholder: 'Enter a description...',
    status: {
      type: 'error',
      message: 'Description must be at least 50 characters'
    }
  }
}`,...N.parameters?.docs?.source}}};z.parameters={...z.parameters,docs:{...z.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState(args.value ?? 'This content may contain issues');
    return <TextArea {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Content',
    placeholder: 'Enter content...',
    status: {
      type: 'warning',
      message: 'Content may need review before publishing'
    }
  }
}`,...z.parameters?.docs?.source}}};R.parameters={...R.parameters,docs:{...R.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState(args.value ?? 'This is a valid description that meets all requirements.');
    return <TextArea {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Description',
    placeholder: 'Enter a description...',
    status: {
      type: 'success',
      message: 'Description looks good!'
    }
  }
}`,...R.parameters?.docs?.source}}};H.parameters={...H.parameters,docs:{...H.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState(args.value ?? 'Invalid content');
    return <TextArea {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Field',
    placeholder: 'Enter value',
    status: {
      type: 'error'
    }
  }
}`,...H.parameters?.docs?.source}}};O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [error, setError] = useState('Too short');
    const [warning, setWarning] = useState('This may need review');
    const [success, setSuccess] = useState('This description meets all the requirements perfectly.');
    const [errorNoMsg, setErrorNoMsg] = useState('Invalid');
    return <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      maxWidth: '400px'
    }}>
        <TextArea label="Error with message" value={error} onChange={setError} status={{
        type: 'error',
        message: 'Must be at least 50 characters'
      }} />
        <TextArea label="Warning with message" value={warning} onChange={setWarning} status={{
        type: 'warning',
        message: 'Content may need review'
      }} />
        <TextArea label="Success with message" value={success} onChange={setSuccess} status={{
        type: 'success',
        message: 'Description is valid'
      }} />
        <TextArea label="Error without message" value={errorNoMsg} onChange={setErrorNoMsg} status={{
        type: 'error'
      }} />
      </div>;
  }
}`,...O.parameters?.docs?.source}}};F.parameters={...F.parameters,docs:{...F.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState(args.value ?? '');
    return <TextArea {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'API Documentation',
    placeholder: 'Describe your API endpoint...',
    labelTooltip: 'Provide a detailed description of what this API endpoint does, including expected inputs and outputs.'
  }
}`,...F.parameters?.docs?.source}}};P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState(args.value ?? '');
    return <TextArea {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Additional Notes',
    placeholder: 'Any additional information...',
    labelTooltip: 'Include any extra details that might be helpful for reviewers.',
    isOptional: true
  }
}`,...P.parameters?.docs?.source}}};G.parameters={...G.parameters,docs:{...G.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = useState('');
    return <div style={{
      maxWidth: '400px'
    }}>
        <TextArea label="Detailed Description" description="Provide a comprehensive description of your project" value={value} onChange={setValue} placeholder="Enter description..." startIcon={DocumentTextIcon} labelTooltip="This description will be visible to all team members" isRequired status={value.length > 0 && value.length < 20 ? {
        type: 'warning',
        message: 'Consider adding more detail'
      } : value.length >= 20 ? {
        type: 'success',
        message: 'Description looks good!'
      } : undefined} />
      </div>;
  }
}`,...G.parameters?.docs?.source}}};B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [smArea, setSmArea] = useState('');
    const [mdArea, setMdArea] = useState('');
    const [lgArea, setLgArea] = useState('');
    const [smInput, setSmInput] = useState('');
    const [mdInput, setMdInput] = useState('');
    const [lgInput, setLgInput] = useState('');
    return <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '16px'
    }}>
        {(['sm', 'md', 'lg'] as const).map((sz, i) => {
        const label = {
          sm: 'Small (28px)',
          md: 'Medium (32px)',
          lg: 'Large (36px)'
        }[sz];
        const [area, setArea] = [[smArea, setSmArea], [mdArea, setMdArea], [lgArea, setLgArea]][i] as [string, (v: string) => void];
        const [input, setInput] = [[smInput, setSmInput], [mdInput, setMdInput], [lgInput, setLgInput]][i] as [string, (v: string) => void];
        return <div key={sz} style={{
          display: 'flex',
          gap: '16px'
        }}>
              <div style={{
            flex: 1
          }}>
                <TextArea label={label} value={area} onChange={setArea} placeholder="TextArea" size={sz} />
              </div>
              <div style={{
            flex: 1
          }}>
                <TextInput label={label} value={input} onChange={setInput} placeholder="TextInput" size={sz} />
              </div>
            </div>;
      })}
      </div>;
  }
}`,...B.parameters?.docs?.source}}};$.parameters={...$.parameters,docs:{...$.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState(args.value ?? '');
    return <TextArea {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Bio',
    placeholder: 'Tell us about yourself...',
    maxLength: 150
  }
}`,...$.parameters?.docs?.source}}};_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState(args.value ?? 'This is a pre-filled bio that demonstrates the character counter.');
    return <TextArea {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Bio',
    maxLength: 100
  }
}`,..._.parameters?.docs?.source}}};U.parameters={...U.parameters,docs:{...U.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [short, setShort] = useState('');
    const [medium, setMedium] = useState('Some text here');
    const [long, setLong] = useState('This is a longer text that approaches the maximum length limit.');
    return <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      maxWidth: '400px'
    }}>
        <TextArea label="Short limit" value={short} onChange={setShort} placeholder="Max 50 characters" maxLength={50} />
        <TextArea label="Medium limit" value={medium} onChange={setMedium} placeholder="Max 100 characters" maxLength={100} />
        <TextArea label="Long limit" value={long} onChange={setLong} placeholder="Max 200 characters" maxLength={200} />
      </div>;
  }
}`,...U.parameters?.docs?.source}}};const aa=["Default","WithDescription","WithHiddenLabel","WithValue","CustomRows","AllVariations","OptionalField","RequiredField","DescriptionWithOptional","Disabled","WithStartIcon","StartIconVariations","ErrorStatus","WarningStatus","SuccessStatus","StatusWithoutMessage","StatusVariations","WithTooltip","TooltipWithOptional","CombinedFeatures","SizeVariants","WithMaxLength","MaxLengthWithValue","MaxLengthVariations"];export{D as AllVariations,G as CombinedFeatures,I as CustomRows,w as Default,W as DescriptionWithOptional,q as Disabled,N as ErrorStatus,U as MaxLengthVariations,_ as MaxLengthWithValue,E as OptionalField,M as RequiredField,B as SizeVariants,k as StartIconVariations,O as StatusVariations,H as StatusWithoutMessage,R as SuccessStatus,P as TooltipWithOptional,z as WarningStatus,V as WithDescription,A as WithHiddenLabel,$ as WithMaxLength,L as WithStartIcon,F as WithTooltip,j as WithValue,aa as __namedExportsOrder,ea as default};
