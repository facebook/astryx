import{i as e,s as t}from"./preload-helper-CT_b8DTk.js";import{t as n}from"./react-B7Te67-h.js";import{t as r}from"./jsx-runtime-DqZldVDK.js";import{t as i}from"./Button-DG6DIOMV.js";import{t as a}from"./Button-CgPYqh3a.js";import{c as o,d as s,g as c,h as l,i as u,l as d,m as f,n as p,o as m,p as h,t as g}from"./src-D1UyeA7x.js";import{Ln as _,dr as v}from"./LexicalOnChangePlugin.prod-ea98Pmnh.js";var y,b,x,S,C,w,T,E,D,O,k,A,j,M,N,P,F,I,L,R,z,B,V,H;e((()=>{y=t(n()),a(),g(),f(),_(),b=r(),x={title:`Lab/RichTextEditor`,component:s,tags:[`autodocs`],argTypes:{label:{control:`text`,description:`Label text (required)`},isLabelHidden:{control:`boolean`},description:{control:`text`},placeholder:{control:`text`},isReadOnly:{control:`boolean`},isDisabled:{control:`boolean`},isRequired:{control:`boolean`},isOptional:{control:`boolean`},hasMarkdownShortcuts:{control:`boolean`},hasAutoFocus:{control:`boolean`},maxLength:{control:`number`},minHeight:{control:`text`,description:`Minimum height of the editable surface (number in pixels or CSS length).`},size:{control:`select`,options:[`sm`,`md`,`lg`]},statusVariant:{control:`select`,options:[`attached`,`detached`,`tooltip`]}}},S={args:{label:`Notes`,placeholder:`Write something…`}},C={args:{label:`Notes`,placeholder:`Format with the toolbar above…`,toolbar:(0,b.jsx)(u,{})}},w={name:`Responsive toolbar`,render:e=>(0,b.jsx)(`div`,{style:{width:420,minWidth:280,maxWidth:`100%`,resize:`horizontal`,overflow:`hidden`},children:(0,b.jsx)(s,{...e})}),args:{label:`Notes`,description:`Resize the editor to move inline formats into More.`,placeholder:`The Link action remains visible as formats collapse…`,toolbar:(0,b.jsx)(u,{})}},T={name:`Responsive toolbar — stress test`,render:e=>{let[t,n]=(0,y.useState)(420);return(0,b.jsxs)(`div`,{style:{display:`grid`,gap:16},children:[(0,b.jsxs)(`label`,{style:{display:`grid`,gap:8,maxWidth:560,font:`inherit`},children:[(0,b.jsxs)(`span`,{children:[`Editor width: `,t,`px`]}),(0,b.jsx)(`input`,{type:`range`,min:240,max:900,step:10,value:t,"aria-label":`Editor width`,onChange:e=>n(e.currentTarget.valueAsNumber)})]}),(0,b.jsx)(`div`,{style:{width:t,maxWidth:`100%`},children:(0,b.jsx)(s,{...e})})]})},args:{label:`Responsive toolbar stress test`,description:`Sweep from 240px to 900px to exercise every inline-format collapse point.`,placeholder:`Select text, open More, and toggle several formats…`,toolbar:(0,b.jsx)(u,{endContent:(0,b.jsx)(i,{label:`AI`,variant:`ghost`,size:`sm`})})}},E={args:{label:`Notes`,placeholder:`Select text and press the Link button (or Cmd/Ctrl+K) to add a link…`,toolbar:(0,b.jsx)(u,{})}},D={args:{label:`Notes`,placeholder:`Type a URL like https://astryx.dev and it auto-links…`,toolbar:(0,b.jsx)(u,{}),plugins:(0,b.jsx)(p,{})}},O={args:{label:`Release notes`,description:`Supports **bold**, _italic_, lists, quotes and links.`,placeholder:`Describe what changed…`}},k={args:{label:`Summary`,isRequired:!0,placeholder:`Required field`}},A={args:{label:`Bio`,maxLength:80,description:`A character counter appears below the editor when maxLength is set.`,placeholder:`Type past 80 characters to see the counter turn red…`}},j={args:{label:`Comment`,description:"Restricted markdown: only `*bold*`, `_italic_` and `- ` unordered lists (no headings, quotes or code).",placeholder:`Try typing "# " — it will not become a heading…`,transformers:[h,l,c]}},M={args:{label:`Notes`,placeholder:`Write something…`,status:{type:`error`,message:`This field is required.`},statusVariant:`attached`}},N={args:{label:`Notes`,placeholder:`Write something…`,status:{type:`warning`,message:`Review this content before saving.`},statusVariant:`detached`}},P={args:{label:`Notes`,placeholder:`Write something…`,status:{type:`error`,message:`This field is required.`},statusVariant:`tooltip`}},F={args:{label:`Notes`,isReadOnly:!0}},I=JSON.stringify({root:{children:[{children:[{detail:0,format:0,mode:`normal`,style:``,text:`The quick brown fox jumps over the lazy dog.`,type:`text`,version:1}],direction:`ltr`,format:``,indent:0,type:`paragraph`,version:1}],direction:`ltr`,format:``,indent:0,type:`root`,version:1}}),L={args:{label:`Notes`,defaultValue:I}},R={render:()=>{let[e,t]=(0,y.useState)(I);return(0,b.jsxs)(`div`,{style:{display:`grid`,gap:24,maxWidth:560},children:[(0,b.jsx)(s,{label:`Editor`,defaultValue:I,placeholder:`Type here…`,onChange:e=>t(JSON.stringify(e.toJSON()))}),(0,b.jsxs)(`div`,{children:[(0,b.jsx)(`div`,{style:{fontWeight:600,marginBottom:8},children:`RichTextView (read-only render of the same content)`}),(0,b.jsx)(d,{value:e})]})]})}},z={render:()=>{let e=(0,y.useRef)(null),[t,n]=(0,y.useState)(`(nothing read yet)`);return(0,b.jsxs)(`div`,{style:{display:`grid`,gap:16,maxWidth:560},children:[(0,b.jsx)(s,{ref:e,label:`Editor with imperative ref`,defaultValue:I,placeholder:`Type here, then use the buttons below…`}),(0,b.jsxs)(`div`,{style:{display:`flex`,gap:8,flexWrap:`wrap`},children:[(0,b.jsx)(`button`,{type:`button`,onClick:()=>e.current?.focus(),children:`focus()`}),(0,b.jsx)(`button`,{type:`button`,onClick:()=>e.current?.clear(),children:`clear()`}),(0,b.jsx)(`button`,{type:`button`,onClick:()=>{let t=(e.current?.getEditorState())?.read(()=>v().getTextContent());n(`getEditorState() text content: ${JSON.stringify(t)}`)},children:`getEditorState()`}),(0,b.jsx)(`button`,{type:`button`,onClick:()=>{let t=e.current?.getMarkdown();n(`getMarkdown():\n${t}`)},children:`getMarkdown()`}),(0,b.jsx)(`button`,{type:`button`,onClick:()=>{let t=e.current?.getHTML();n(`getHTML():\n${t}`)},children:`getHTML()`}),(0,b.jsx)(`button`,{type:`button`,onClick:()=>{let t=e.current?.getEditor();n(`getEditor() -> ${t?`LexicalEditor instance ✓`:`null`}`)},children:`getEditor()`})]}),(0,b.jsx)(`pre`,{style:{background:`#f5f5f5`,padding:12,borderRadius:6,fontSize:13,whiteSpace:`pre-wrap`},children:t})]})}},B=`# Release notes

Supports **bold**, _italic_, and lists:

- First item
- Second item

> A blockquote for good measure.`,V={render:()=>{let[e,t]=(0,y.useState)(B),n=o(e),r=m(n),i={background:`#f5f5f5`,padding:12,borderRadius:6,fontSize:13,whiteSpace:`pre-wrap`,wordBreak:`break-word`,margin:0};return(0,b.jsxs)(`div`,{style:{display:`grid`,gap:24,maxWidth:720},children:[(0,b.jsxs)(`div`,{children:[(0,b.jsx)(`div`,{style:{fontWeight:600,marginBottom:8},children:`1. Input Markdown (edit me)`}),(0,b.jsx)(`textarea`,{value:e,onChange:e=>t(e.target.value),rows:10,style:{width:`100%`,fontFamily:`monospace`,fontSize:13,padding:12,borderRadius:6,border:`1px solid #ccc`,boxSizing:`border-box`}})]}),(0,b.jsxs)(`div`,{children:[(0,b.jsx)(`div`,{style:{fontWeight:600,marginBottom:8},children:`2. markdownToEditorStateJSON(...) -> live RichTextEditor`}),(0,b.jsx)(s,{label:`Editor seeded from Markdown`,defaultValue:n,placeholder:`(serialized Markdown renders here)`},n)]}),(0,b.jsxs)(`div`,{children:[(0,b.jsx)(`div`,{style:{fontWeight:600,marginBottom:8},children:`3. Same JSON rendered read-only via RichTextView`}),(0,b.jsx)(d,{value:n})]}),(0,b.jsxs)(`div`,{children:[(0,b.jsx)(`div`,{style:{fontWeight:600,marginBottom:8},children:`4. editorStateJSONToMarkdown(json) -> round-tripped Markdown`}),(0,b.jsx)(`pre`,{style:i,children:r})]}),(0,b.jsxs)(`details`,{children:[(0,b.jsx)(`summary`,{style:{cursor:`pointer`,fontWeight:600},children:`Serialized EditorState JSON (markdownToEditorStateJSON output)`}),(0,b.jsx)(`pre`,{style:{...i,marginTop:8},children:n})]})]})}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Notes',
    placeholder: 'Write something…'
  }
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Notes',
    placeholder: 'Format with the toolbar above…',
    toolbar: <RichTextEditorToolbar />
  }
}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  name: 'Responsive toolbar',
  render: args => <div style={{
    width: 420,
    minWidth: 280,
    maxWidth: '100%',
    resize: 'horizontal',
    overflow: 'hidden'
  }}>
      <RichTextEditor {...args} />
    </div>,
  args: {
    label: 'Notes',
    description: 'Resize the editor to move inline formats into More.',
    placeholder: 'The Link action remains visible as formats collapse…',
    toolbar: <RichTextEditorToolbar />
  }
}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  name: 'Responsive toolbar — stress test',
  render: args => {
    const [width, setWidth] = useState(420);
    return <div style={{
      display: 'grid',
      gap: 16
    }}>
        <label style={{
        display: 'grid',
        gap: 8,
        maxWidth: 560,
        font: 'inherit'
      }}>
          <span>Editor width: {width}px</span>
          <input type="range" min={240} max={900} step={10} value={width} aria-label="Editor width" onChange={event => setWidth(event.currentTarget.valueAsNumber)} />
        </label>
        <div style={{
        width,
        maxWidth: '100%'
      }}>
          <RichTextEditor {...args} />
        </div>
      </div>;
  },
  args: {
    label: 'Responsive toolbar stress test',
    description: 'Sweep from 240px to 900px to exercise every inline-format collapse point.',
    placeholder: 'Select text, open More, and toggle several formats…',
    toolbar: <RichTextEditorToolbar endContent={<Button label="AI" variant="ghost" size="sm" />} />
  }
}`,...T.parameters?.docs?.source}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Notes',
    placeholder: 'Select text and press the Link button (or Cmd/Ctrl+K) to add a link…',
    // The toolbar's Link button creates new-tab links by default (target/rel
    // baked into the node). No extra plugin needed.
    toolbar: <RichTextEditorToolbar />
  }
}`,...E.parameters?.docs?.source}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Notes',
    placeholder: 'Type a URL like https://astryx.dev and it auto-links…',
    toolbar: <RichTextEditorToolbar />,
    // Auto-linkify typed/pasted URLs + emails (open in a new tab).
    plugins: <RichTextEditorAutoLinkPlugin />
  }
}`,...D.parameters?.docs?.source}}},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Release notes',
    description: 'Supports **bold**, _italic_, lists, quotes and links.',
    placeholder: 'Describe what changed…'
  }
}`,...O.parameters?.docs?.source}}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Summary',
    isRequired: true,
    placeholder: 'Required field'
  }
}`,...k.parameters?.docs?.source}}},A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Bio',
    maxLength: 80,
    description: 'A character counter appears below the editor when maxLength is set.',
    placeholder: 'Type past 80 characters to see the counter turn red…'
  }
}`,...A.parameters?.docs?.source}}},j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Comment',
    description: 'Restricted markdown: only \`*bold*\`, \`_italic_\` and \`- \` unordered lists (no headings, quotes or code).',
    placeholder: 'Try typing "# " — it will not become a heading…',
    transformers: [BOLD_STAR, ITALIC_STAR, UNORDERED_LIST]
  }
}`,...j.parameters?.docs?.source}}},M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Notes',
    placeholder: 'Write something…',
    status: {
      type: 'error',
      message: 'This field is required.'
    },
    statusVariant: 'attached'
  }
}`,...M.parameters?.docs?.source}}},N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Notes',
    placeholder: 'Write something…',
    status: {
      type: 'warning',
      message: 'Review this content before saving.'
    },
    statusVariant: 'detached'
  }
}`,...N.parameters?.docs?.source}}},P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Notes',
    placeholder: 'Write something…',
    status: {
      type: 'error',
      message: 'This field is required.'
    },
    statusVariant: 'tooltip'
  }
}`,...P.parameters?.docs?.source}}},F.parameters={...F.parameters,docs:{...F.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Notes',
    isReadOnly: true
  }
}`,...F.parameters?.docs?.source}}},L.parameters={...L.parameters,docs:{...L.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Notes',
    defaultValue: SEED
  }
}`,...L.parameters?.docs?.source}}},R.parameters={...R.parameters,docs:{...R.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [json, setJson] = useState<string>(SEED);
    return <div style={{
      display: 'grid',
      gap: 24,
      maxWidth: 560
    }}>
        <RichTextEditor label="Editor" defaultValue={SEED} placeholder="Type here…" onChange={(state: EditorState) => setJson(JSON.stringify(state.toJSON()))} />
        <div>
          <div style={{
          fontWeight: 600,
          marginBottom: 8
        }}>
            RichTextView (read-only render of the same content)
          </div>
          <RichTextView value={json} />
        </div>
      </div>;
  }
}`,...R.parameters?.docs?.source},description:{story:`Serialize on change and render the same content read-only with RichTextView.`,...R.parameters?.docs?.description}}},z.parameters={...z.parameters,docs:{...z.parameters?.docs,source:{originalSource:`{
  render: () => {
    const ref = useRef<RichTextEditorRef>(null);
    const [readout, setReadout] = useState<string>('(nothing read yet)');
    return <div style={{
      display: 'grid',
      gap: 16,
      maxWidth: 560
    }}>
        <RichTextEditor ref={ref} label="Editor with imperative ref" defaultValue={SEED} placeholder="Type here, then use the buttons below…" />
        <div style={{
        display: 'flex',
        gap: 8,
        flexWrap: 'wrap'
      }}>
          <button type="button" onClick={() => ref.current?.focus()}>
            focus()
          </button>
          <button type="button" onClick={() => ref.current?.clear()}>
            clear()
          </button>
          <button type="button" onClick={() => {
          const state = ref.current?.getEditorState();
          const text = state?.read(() => $getRoot().getTextContent());
          setReadout(\`getEditorState() text content: \${JSON.stringify(text)}\`);
        }}>
            getEditorState()
          </button>
          <button type="button" onClick={() => {
          const md = ref.current?.getMarkdown();
          setReadout(\`getMarkdown():\\n\${md}\`);
        }}>
            getMarkdown()
          </button>
          <button type="button" onClick={() => {
          const html = ref.current?.getHTML();
          setReadout(\`getHTML():\\n\${html}\`);
        }}>
            getHTML()
          </button>
          <button type="button" onClick={() => {
          const editor = ref.current?.getEditor();
          setReadout(\`getEditor() -> \${editor ? 'LexicalEditor instance ✓' : 'null'}\`);
        }}>
            getEditor()
          </button>
        </div>
        <pre style={{
        background: '#f5f5f5',
        padding: 12,
        borderRadius: 6,
        fontSize: 13,
        whiteSpace: 'pre-wrap'
      }}>
          {readout}
        </pre>
      </div>;
  }
}`,...z.parameters?.docs?.source}}},V.parameters={...V.parameters,docs:{...V.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [markdown, setMarkdown] = useState<string>(SAMPLE_MARKDOWN);
    const json = markdownToEditorStateJSON(markdown);
    const roundTripped = editorStateJSONToMarkdown(json);
    const boxStyle = {
      background: '#f5f5f5',
      padding: 12,
      borderRadius: 6,
      fontSize: 13,
      whiteSpace: 'pre-wrap' as const,
      wordBreak: 'break-word' as const,
      margin: 0
    };
    return <div style={{
      display: 'grid',
      gap: 24,
      maxWidth: 720
    }}>
        <div>
          <div style={{
          fontWeight: 600,
          marginBottom: 8
        }}>
            1. Input Markdown (edit me)
          </div>
          <textarea value={markdown} onChange={e => setMarkdown(e.target.value)} rows={10} style={{
          width: '100%',
          fontFamily: 'monospace',
          fontSize: 13,
          padding: 12,
          borderRadius: 6,
          border: '1px solid #ccc',
          boxSizing: 'border-box'
        }} />
        </div>

        <div>
          <div style={{
          fontWeight: 600,
          marginBottom: 8
        }}>
            2. markdownToEditorStateJSON(...) -&gt; live RichTextEditor
          </div>
          {/* key forces a remount when the serialized JSON changes, since
              defaultValue is only read on mount. */}
          <RichTextEditor key={json} label="Editor seeded from Markdown" defaultValue={json} placeholder="(serialized Markdown renders here)" />
        </div>

        <div>
          <div style={{
          fontWeight: 600,
          marginBottom: 8
        }}>
            3. Same JSON rendered read-only via RichTextView
          </div>
          <RichTextView value={json} />
        </div>

        <div>
          <div style={{
          fontWeight: 600,
          marginBottom: 8
        }}>
            4. editorStateJSONToMarkdown(json) -&gt; round-tripped Markdown
          </div>
          <pre style={boxStyle}>{roundTripped}</pre>
        </div>

        <details>
          <summary style={{
          cursor: 'pointer',
          fontWeight: 600
        }}>
            Serialized EditorState JSON (markdownToEditorStateJSON output)
          </summary>
          <pre style={{
          ...boxStyle,
          marginTop: 8
        }}>{json}</pre>
        </details>
      </div>;
  }
}`,...V.parameters?.docs?.source},description:{story:`Playground for the standalone Markdown <-> EditorState serializer helpers
(markdownToEditorStateJSON / editorStateJSONToMarkdown) added in #4544.

These run headless — no mounted editor needed. Here we:
 1. Take Markdown text (left),
 2. Serialize it to an EditorState JSON string with \`markdownToEditorStateJSON\`,
 3. Feed that JSON straight into a live <RichTextEditor defaultValue={...} />
    AND a read-only <RichTextView />,
 4. Round-trip it back to Markdown with \`editorStateJSONToMarkdown\`
    so you can eyeball that Markdown -> JSON -> Markdown is stable.`,...V.parameters?.docs?.description}}},H=[`Default`,`WithToolbar`,`ResponsiveToolbar`,`ResponsiveToolbarStressTest`,`WithLinks`,`WithAutoLink`,`WithDescription`,`Required`,`WithCharacterLimit`,`CustomTransformers`,`ErrorStatus`,`DetachedStatus`,`TooltipStatus`,`ReadOnly`,`WithInitialValue`,`ControlledPersistence`,`ImperativeRef`,`MarkdownSerializers`]}))();export{R as ControlledPersistence,j as CustomTransformers,S as Default,N as DetachedStatus,M as ErrorStatus,z as ImperativeRef,V as MarkdownSerializers,F as ReadOnly,k as Required,w as ResponsiveToolbar,T as ResponsiveToolbarStressTest,P as TooltipStatus,D as WithAutoLink,A as WithCharacterLimit,O as WithDescription,L as WithInitialValue,E as WithLinks,C as WithToolbar,H as __namedExportsOrder,x as default};