import{a as e,n as t}from"./rolldown-runtime-DaJ6WEGw.js";import{t as n}from"./react-DvlgmmzG.js";import{t as r}from"./jsx-runtime-cM__dR4X.js";import{n as i,t as a}from"./FileInput-DmYimqod.js";var o,s,c,l,u,d,f,p,m,h,g,_,v,y,b,x,S,C;t((()=>{o=e(n()),a(),s=r(),c={title:`Core/FileInput`,component:i,tags:[`autodocs`],argTypes:{label:{control:`text`,description:`Label text (required)`},isLabelHidden:{control:`boolean`,description:`Visually hide the label (still accessible to screen readers)`},placeholder:{control:`text`,description:`Placeholder text`},description:{control:`text`,description:`Description text displayed between the label and input`},accept:{control:`text`,description:`Accepted file types (e.g. "image/*", ".pdf,.doc")`},isMultiple:{control:`boolean`,description:`Whether multiple files can be selected`},isOptional:{control:`boolean`,description:`Whether the field is optional (mutually exclusive with isRequired)`},isRequired:{control:`boolean`,description:`Whether the field is required (mutually exclusive with isOptional)`},isDisabled:{control:`boolean`,description:`Whether the input is disabled`},disabledMessage:{control:`text`,description:`Explains why the input is disabled. With isDisabled, shows a tooltip on hover/keyboard focus and keeps the trigger focusable via aria-disabled (opening the file picker stays blocked). Use this instead of wrapping a disabled FileInput in Tooltip.`},isLoading:{control:`boolean`,description:`Whether the input is in a loading state`},mode:{control:`select`,options:[`input`,`dropzone`],description:`Visual mode: compact input or drag-and-drop dropzone`},status:{control:`object`,description:`Status indicator with type (warning/error/success) and optional message`},labelTooltip:{control:`text`,description:`Tooltip text to display in an info icon at the end of the label`}}},l={render:e=>{let[t,n]=(0,o.useState)(null);return(0,s.jsx)(i,{...e,value:t,onChange:n})},args:{label:`Upload file`,placeholder:`Drag files here or click to browse`}},u={render:e=>{let[t,n]=(0,o.useState)(null);return(0,s.jsx)(i,{...e,value:t,onChange:n})},args:{label:`Resume`,description:`Upload your resume in PDF or Word format. Max 5MB.`,accept:`.pdf,.doc,.docx`}},d={render:e=>{let[t,n]=(0,o.useState)(null);return(0,s.jsx)(i,{...e,value:t,onChange:n})},args:{label:`Attachments`,isMultiple:!0,description:`Upload up to 10 files. Max 5MB each.`,maxFiles:10,maxSize:5*1024*1024}},f={render:e=>{let[t,n]=(0,o.useState)(null);return(0,s.jsx)(i,{...e,value:t,onChange:n})},args:{label:`Profile photo`,accept:`image/png,image/jpeg`,description:`PNG or JPEG, max 2MB.`,maxSize:2*1024*1024}},p={render:e=>{let[t,n]=(0,o.useState)(null);return(0,s.jsx)(i,{...e,value:t,onChange:n})},args:{label:`Upload files`,mode:`dropzone`,placeholder:`Drag files here or click to browse`}},m={render:e=>{let[t,n]=(0,o.useState)(null);return(0,s.jsx)(i,{...e,value:t,onChange:n})},args:{label:`Supporting document`,isRequired:!0}},h={render:e=>{let[t,n]=(0,o.useState)(null);return(0,s.jsx)(i,{...e,value:t,onChange:n})},args:{label:`Cover letter`,isOptional:!0}},g={render:e=>{let[t,n]=(0,o.useState)(null);return(0,s.jsx)(i,{...e,value:t,onChange:n})},args:{label:`Upload locked`,isDisabled:!0,placeholder:`Upload is currently disabled`}},_={render:e=>{let[t,n]=(0,o.useState)(null);return(0,s.jsx)(i,{...e,value:t,onChange:n})},args:{label:`Resume`,isDisabled:!0,disabledMessage:`Uploads are locked until your profile is verified`,placeholder:`Upload is currently disabled`}},v={render:e=>{let[t,n]=(0,o.useState)(null);return(0,s.jsx)(i,{...e,value:t,onChange:n})},args:{label:`Uploading...`,isLoading:!0}},y={render:e=>{let[t,n]=(0,o.useState)(null);return(0,s.jsx)(i,{...e,value:t,onChange:n})},args:{label:`Upload document`,status:{type:`error`,message:`File must be under 10MB`}}},b={render:e=>{let[t,n]=(0,o.useState)(null);return(0,s.jsx)(i,{...e,value:t,onChange:n})},args:{label:`Upload document`,status:{type:`success`,message:`File uploaded successfully`}}},x={render:e=>{let[t,n]=(0,o.useState)(null);return(0,s.jsx)(i,{...e,value:t,onChange:n})},args:{label:`Tax documents`,labelTooltip:`Upload W-2 forms, 1099s, or other tax-related documents.`}},S={render:()=>{let[e,t]=(0,o.useState)(null),[n,r]=(0,o.useState)(null),[a,c]=(0,o.useState)(null),[l,u]=(0,o.useState)(null),[d,f]=(0,o.useState)(null);return(0,s.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`24px`,maxWidth:`400px`},children:[(0,s.jsx)(i,{label:`Default (input mode)`,value:e,onChange:t}),(0,s.jsx)(i,{label:`Dropzone with constraints`,value:n,onChange:r,mode:`dropzone`,isMultiple:!0,accept:`image/*`,maxSize:5*1024*1024,maxFiles:5,description:`Up to 5 images, max 5MB each`}),(0,s.jsx)(i,{label:`Dropzone mode`,value:a,onChange:c,mode:`dropzone`,placeholder:`Drag files here or click to browse`}),(0,s.jsx)(i,{label:`Disabled`,value:l,onChange:u,isDisabled:!0}),(0,s.jsx)(i,{label:`With error`,value:d,onChange:f,status:{type:`error`,message:`Please upload a valid file`}})]})}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<File | File[] | null>(null);
    return <FileInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Upload file',
    placeholder: 'Drag files here or click to browse'
  }
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<File | File[] | null>(null);
    return <FileInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Resume',
    description: 'Upload your resume in PDF or Word format. Max 5MB.',
    accept: '.pdf,.doc,.docx'
  }
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
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
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
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
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<File | File[] | null>(null);
    return <FileInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Upload files',
    mode: 'dropzone',
    placeholder: 'Drag files here or click to browse'
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<File | File[] | null>(null);
    return <FileInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Supporting document',
    isRequired: true
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<File | File[] | null>(null);
    return <FileInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Cover letter',
    isOptional: true
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<File | File[] | null>(null);
    return <FileInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Upload locked',
    isDisabled: true,
    placeholder: 'Upload is currently disabled'
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
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
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<File | File[] | null>(null);
    return <FileInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Uploading...',
    isLoading: true
  }
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
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
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
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
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<File | File[] | null>(null);
    return <FileInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Tax documents',
    labelTooltip: 'Upload W-2 forms, 1099s, or other tax-related documents.'
  }
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
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
}`,...S.parameters?.docs?.source}}},C=[`Default`,`WithDescription`,`MultipleFiles`,`ImagesOnly`,`DropzoneMode`,`Required`,`Optional`,`Disabled`,`DisabledWithMessage`,`Loading`,`WithErrorStatus`,`WithSuccessStatus`,`WithTooltip`,`AllVariations`]}))();export{S as AllVariations,l as Default,g as Disabled,_ as DisabledWithMessage,p as DropzoneMode,f as ImagesOnly,v as Loading,d as MultipleFiles,h as Optional,m as Required,u as WithDescription,y as WithErrorStatus,b as WithSuccessStatus,x as WithTooltip,C as __namedExportsOrder,c as default};