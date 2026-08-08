import{i as e,s as t}from"./preload-helper-CT_b8DTk.js";import{t as n}from"./react-B7Te67-h.js";import{t as r}from"./jsx-runtime-DqZldVDK.js";import{d as i,f as a,i as o,l as s,m as c,n as l,o as u,p as d,s as f,t as p}from"./src-BsPy-WMF.js";import{Mn as m,or as h}from"./LexicalOnChangePlugin.prod-DymCbrzT.js";var g,_,v,y,b,x,S,C,w,T,E,D,O,k,A,j,M,N;e((()=>{g=t(n()),p(),a(),m(),_=r(),v={title:`Lab/RichTextEditor`,component:s,tags:[`autodocs`],argTypes:{label:{control:`text`,description:`Label text (required)`},isLabelHidden:{control:`boolean`},description:{control:`text`},placeholder:{control:`text`},isReadOnly:{control:`boolean`},isDisabled:{control:`boolean`},isRequired:{control:`boolean`},isOptional:{control:`boolean`},hasMarkdownShortcuts:{control:`boolean`},hasAutoFocus:{control:`boolean`},maxLength:{control:`number`},size:{control:`select`,options:[`sm`,`md`,`lg`]}}},y={args:{label:`Notes`,placeholder:`Write something…`}},b={args:{label:`Notes`,placeholder:`Format with the toolbar above…`,plugins:(0,_.jsx)(l,{})}},x={args:{label:`Release notes`,description:`Supports **bold**, _italic_, lists, quotes and links.`,placeholder:`Describe what changed…`}},S={args:{label:`Summary`,isRequired:!0,placeholder:`Required field`}},C={args:{label:`Bio`,maxLength:80,description:`A character counter appears below the editor when maxLength is set.`,placeholder:`Type past 80 characters to see the counter turn red…`}},w={args:{label:`Comment`,description:"Restricted markdown: only `*bold*`, `_italic_` and `- ` unordered lists (no headings, quotes or code).",placeholder:`Try typing "# " — it will not become a heading…`,transformers:[i,d,c]}},T={args:{label:`Notes`,placeholder:`Write something…`,status:{type:`error`,message:`This field is required.`}}},E={args:{label:`Notes`,isReadOnly:!0}},D=JSON.stringify({root:{children:[{children:[{detail:0,format:0,mode:`normal`,style:``,text:`The quick brown fox jumps over the lazy dog.`,type:`text`,version:1}],direction:`ltr`,format:``,indent:0,type:`paragraph`,version:1}],direction:`ltr`,format:``,indent:0,type:`root`,version:1}}),O={args:{label:`Notes`,defaultValue:D}},k={render:()=>{let[e,t]=(0,g.useState)(D);return(0,_.jsxs)(`div`,{style:{display:`grid`,gap:24,maxWidth:560},children:[(0,_.jsx)(s,{label:`Editor`,defaultValue:D,placeholder:`Type here…`,onChange:e=>t(JSON.stringify(e.toJSON()))}),(0,_.jsxs)(`div`,{children:[(0,_.jsx)(`div`,{style:{fontWeight:600,marginBottom:8},children:`RichTextView (read-only render of the same content)`}),(0,_.jsx)(f,{value:e})]})]})}},A={render:()=>{let e=(0,g.useRef)(null),[t,n]=(0,g.useState)(`(nothing read yet)`);return(0,_.jsxs)(`div`,{style:{display:`grid`,gap:16,maxWidth:560},children:[(0,_.jsx)(s,{ref:e,label:`Editor with imperative ref`,defaultValue:D,placeholder:`Type here, then use the buttons below…`}),(0,_.jsxs)(`div`,{style:{display:`flex`,gap:8,flexWrap:`wrap`},children:[(0,_.jsx)(`button`,{type:`button`,onClick:()=>e.current?.focus(),children:`focus()`}),(0,_.jsx)(`button`,{type:`button`,onClick:()=>e.current?.clear(),children:`clear()`}),(0,_.jsx)(`button`,{type:`button`,onClick:()=>{let t=(e.current?.getEditorState())?.read(()=>h().getTextContent());n(`getEditorState() text content: ${JSON.stringify(t)}`)},children:`getEditorState()`}),(0,_.jsx)(`button`,{type:`button`,onClick:()=>{let t=e.current?.getMarkdown();n(`getMarkdown():\n${t}`)},children:`getMarkdown()`}),(0,_.jsx)(`button`,{type:`button`,onClick:()=>{let t=e.current?.getHTML();n(`getHTML():\n${t}`)},children:`getHTML()`}),(0,_.jsx)(`button`,{type:`button`,onClick:()=>{let t=e.current?.getEditor();n(`getEditor() -> ${t?`LexicalEditor instance ✓`:`null`}`)},children:`getEditor()`})]}),(0,_.jsx)(`pre`,{style:{background:`#f5f5f5`,padding:12,borderRadius:6,fontSize:13,whiteSpace:`pre-wrap`},children:t})]})}},j=`# Release notes

Supports **bold**, _italic_, and lists:

- First item
- Second item

> A blockquote for good measure.`,M={render:()=>{let[e,t]=(0,g.useState)(j),n=u(e),r=o(n),i={background:`#f5f5f5`,padding:12,borderRadius:6,fontSize:13,whiteSpace:`pre-wrap`,wordBreak:`break-word`,margin:0};return(0,_.jsxs)(`div`,{style:{display:`grid`,gap:24,maxWidth:720},children:[(0,_.jsxs)(`div`,{children:[(0,_.jsx)(`div`,{style:{fontWeight:600,marginBottom:8},children:`1. Input Markdown (edit me)`}),(0,_.jsx)(`textarea`,{value:e,onChange:e=>t(e.target.value),rows:10,style:{width:`100%`,fontFamily:`monospace`,fontSize:13,padding:12,borderRadius:6,border:`1px solid #ccc`,boxSizing:`border-box`}})]}),(0,_.jsxs)(`div`,{children:[(0,_.jsx)(`div`,{style:{fontWeight:600,marginBottom:8},children:`2. markdownToEditorStateJSON(...) -> live RichTextEditor`}),(0,_.jsx)(s,{label:`Editor seeded from Markdown`,defaultValue:n,placeholder:`(serialized Markdown renders here)`},n)]}),(0,_.jsxs)(`div`,{children:[(0,_.jsx)(`div`,{style:{fontWeight:600,marginBottom:8},children:`3. Same JSON rendered read-only via RichTextView`}),(0,_.jsx)(f,{value:n})]}),(0,_.jsxs)(`div`,{children:[(0,_.jsx)(`div`,{style:{fontWeight:600,marginBottom:8},children:`4. editorStateJSONToMarkdown(json) -> round-tripped Markdown`}),(0,_.jsx)(`pre`,{style:i,children:r})]}),(0,_.jsxs)(`details`,{children:[(0,_.jsx)(`summary`,{style:{cursor:`pointer`,fontWeight:600},children:`Serialized EditorState JSON (markdownToEditorStateJSON output)`}),(0,_.jsx)(`pre`,{style:{...i,marginTop:8},children:n})]})]})}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Notes',
    placeholder: 'Write something…'
  }
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Notes',
    placeholder: 'Format with the toolbar above…',
    plugins: <RichTextEditorToolbar />
  }
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Release notes',
    description: 'Supports **bold**, _italic_, lists, quotes and links.',
    placeholder: 'Describe what changed…'
  }
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Summary',
    isRequired: true,
    placeholder: 'Required field'
  }
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Bio',
    maxLength: 80,
    description: 'A character counter appears below the editor when maxLength is set.',
    placeholder: 'Type past 80 characters to see the counter turn red…'
  }
}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Comment',
    description: 'Restricted markdown: only \`*bold*\`, \`_italic_\` and \`- \` unordered lists (no headings, quotes or code).',
    placeholder: 'Try typing "# " — it will not become a heading…',
    transformers: [BOLD_STAR, ITALIC_STAR, UNORDERED_LIST]
  }
}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Notes',
    placeholder: 'Write something…',
    status: {
      type: 'error',
      message: 'This field is required.'
    }
  }
}`,...T.parameters?.docs?.source}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Notes',
    isReadOnly: true
  }
}`,...E.parameters?.docs?.source}}},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Notes',
    defaultValue: SEED
  }
}`,...O.parameters?.docs?.source}}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
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
}`,...k.parameters?.docs?.source},description:{story:`Serialize on change and render the same content read-only with RichTextView.`,...k.parameters?.docs?.description}}},A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
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
}`,...A.parameters?.docs?.source}}},M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
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
}`,...M.parameters?.docs?.source},description:{story:`Playground for the standalone Markdown <-> EditorState serializer helpers
(markdownToEditorStateJSON / editorStateJSONToMarkdown) added in #4544.

These run headless — no mounted editor needed. Here we:
 1. Take Markdown text (left),
 2. Serialize it to an EditorState JSON string with \`markdownToEditorStateJSON\`,
 3. Feed that JSON straight into a live <RichTextEditor defaultValue={...} />
    AND a read-only <RichTextView />,
 4. Round-trip it back to Markdown with \`editorStateJSONToMarkdown\`
    so you can eyeball that Markdown -> JSON -> Markdown is stable.`,...M.parameters?.docs?.description}}},N=[`Default`,`WithToolbar`,`WithDescription`,`Required`,`WithCharacterLimit`,`CustomTransformers`,`ErrorStatus`,`ReadOnly`,`WithInitialValue`,`ControlledPersistence`,`ImperativeRef`,`MarkdownSerializers`]}))();export{k as ControlledPersistence,w as CustomTransformers,y as Default,T as ErrorStatus,A as ImperativeRef,M as MarkdownSerializers,E as ReadOnly,S as Required,C as WithCharacterLimit,x as WithDescription,O as WithInitialValue,b as WithToolbar,N as __namedExportsOrder,v as default};