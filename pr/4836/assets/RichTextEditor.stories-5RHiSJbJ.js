import{i as e,s as t}from"./preload-helper-CT_b8DTk.js";import{t as n}from"./react-B7Te67-h.js";import{t as r}from"./jsx-runtime-DqZldVDK.js";import{c as i,d as a,g as o,h as s,i as c,l,m as u,n as d,o as f,p,t as m}from"./src-BNrnnFds.js";import{In as h,ur as g}from"./LexicalOnChangePlugin.prod-QfSuqycK.js";var _,v,y,b,x,S,C,w,T,E,D,O,k,A,j,M,N,P,F,I;e((()=>{_=t(n()),m(),u(),h(),v=r(),y={title:`Lab/RichTextEditor`,component:a,tags:[`autodocs`],argTypes:{label:{control:`text`,description:`Label text (required)`},isLabelHidden:{control:`boolean`},description:{control:`text`},placeholder:{control:`text`},isReadOnly:{control:`boolean`},isDisabled:{control:`boolean`},isRequired:{control:`boolean`},isOptional:{control:`boolean`},hasMarkdownShortcuts:{control:`boolean`},hasAutoFocus:{control:`boolean`},maxLength:{control:`number`},size:{control:`select`,options:[`sm`,`md`,`lg`]}}},b={args:{label:`Notes`,placeholder:`Write something…`}},x={args:{label:`Notes`,placeholder:`Format with the toolbar above…`,plugins:(0,v.jsx)(c,{})}},S={args:{label:`Notes`,placeholder:`Select text and press the Link button (or Cmd/Ctrl+K) to add a link…`,plugins:(0,v.jsx)(c,{})}},C={args:{label:`Notes`,placeholder:`Type a URL like https://astryx.dev and it auto-links…`,plugins:(0,v.jsxs)(v.Fragment,{children:[(0,v.jsx)(c,{}),(0,v.jsx)(d,{})]})}},w={args:{label:`Release notes`,description:`Supports **bold**, _italic_, lists, quotes and links.`,placeholder:`Describe what changed…`}},T={args:{label:`Summary`,isRequired:!0,placeholder:`Required field`}},E={args:{label:`Bio`,maxLength:80,description:`A character counter appears below the editor when maxLength is set.`,placeholder:`Type past 80 characters to see the counter turn red…`}},D={args:{label:`Comment`,description:"Restricted markdown: only `*bold*`, `_italic_` and `- ` unordered lists (no headings, quotes or code).",placeholder:`Try typing "# " — it will not become a heading…`,transformers:[p,s,o]}},O={args:{label:`Notes`,placeholder:`Write something…`,status:{type:`error`,message:`This field is required.`}}},k={args:{label:`Notes`,isReadOnly:!0}},A=JSON.stringify({root:{children:[{children:[{detail:0,format:0,mode:`normal`,style:``,text:`The quick brown fox jumps over the lazy dog.`,type:`text`,version:1}],direction:`ltr`,format:``,indent:0,type:`paragraph`,version:1}],direction:`ltr`,format:``,indent:0,type:`root`,version:1}}),j={args:{label:`Notes`,defaultValue:A}},M={render:()=>{let[e,t]=(0,_.useState)(A);return(0,v.jsxs)(`div`,{style:{display:`grid`,gap:24,maxWidth:560},children:[(0,v.jsx)(a,{label:`Editor`,defaultValue:A,placeholder:`Type here…`,onChange:e=>t(JSON.stringify(e.toJSON()))}),(0,v.jsxs)(`div`,{children:[(0,v.jsx)(`div`,{style:{fontWeight:600,marginBottom:8},children:`RichTextView (read-only render of the same content)`}),(0,v.jsx)(l,{value:e})]})]})}},N={render:()=>{let e=(0,_.useRef)(null),[t,n]=(0,_.useState)(`(nothing read yet)`);return(0,v.jsxs)(`div`,{style:{display:`grid`,gap:16,maxWidth:560},children:[(0,v.jsx)(a,{ref:e,label:`Editor with imperative ref`,defaultValue:A,placeholder:`Type here, then use the buttons below…`}),(0,v.jsxs)(`div`,{style:{display:`flex`,gap:8,flexWrap:`wrap`},children:[(0,v.jsx)(`button`,{type:`button`,onClick:()=>e.current?.focus(),children:`focus()`}),(0,v.jsx)(`button`,{type:`button`,onClick:()=>e.current?.clear(),children:`clear()`}),(0,v.jsx)(`button`,{type:`button`,onClick:()=>{let t=(e.current?.getEditorState())?.read(()=>g().getTextContent());n(`getEditorState() text content: ${JSON.stringify(t)}`)},children:`getEditorState()`}),(0,v.jsx)(`button`,{type:`button`,onClick:()=>{let t=e.current?.getMarkdown();n(`getMarkdown():\n${t}`)},children:`getMarkdown()`}),(0,v.jsx)(`button`,{type:`button`,onClick:()=>{let t=e.current?.getHTML();n(`getHTML():\n${t}`)},children:`getHTML()`}),(0,v.jsx)(`button`,{type:`button`,onClick:()=>{let t=e.current?.getEditor();n(`getEditor() -> ${t?`LexicalEditor instance ✓`:`null`}`)},children:`getEditor()`})]}),(0,v.jsx)(`pre`,{style:{background:`#f5f5f5`,padding:12,borderRadius:6,fontSize:13,whiteSpace:`pre-wrap`},children:t})]})}},P=`# Release notes

Supports **bold**, _italic_, and lists:

- First item
- Second item

> A blockquote for good measure.`,F={render:()=>{let[e,t]=(0,_.useState)(P),n=i(e),r=f(n),o={background:`#f5f5f5`,padding:12,borderRadius:6,fontSize:13,whiteSpace:`pre-wrap`,wordBreak:`break-word`,margin:0};return(0,v.jsxs)(`div`,{style:{display:`grid`,gap:24,maxWidth:720},children:[(0,v.jsxs)(`div`,{children:[(0,v.jsx)(`div`,{style:{fontWeight:600,marginBottom:8},children:`1. Input Markdown (edit me)`}),(0,v.jsx)(`textarea`,{value:e,onChange:e=>t(e.target.value),rows:10,style:{width:`100%`,fontFamily:`monospace`,fontSize:13,padding:12,borderRadius:6,border:`1px solid #ccc`,boxSizing:`border-box`}})]}),(0,v.jsxs)(`div`,{children:[(0,v.jsx)(`div`,{style:{fontWeight:600,marginBottom:8},children:`2. markdownToEditorStateJSON(...) -> live RichTextEditor`}),(0,v.jsx)(a,{label:`Editor seeded from Markdown`,defaultValue:n,placeholder:`(serialized Markdown renders here)`},n)]}),(0,v.jsxs)(`div`,{children:[(0,v.jsx)(`div`,{style:{fontWeight:600,marginBottom:8},children:`3. Same JSON rendered read-only via RichTextView`}),(0,v.jsx)(l,{value:n})]}),(0,v.jsxs)(`div`,{children:[(0,v.jsx)(`div`,{style:{fontWeight:600,marginBottom:8},children:`4. editorStateJSONToMarkdown(json) -> round-tripped Markdown`}),(0,v.jsx)(`pre`,{style:o,children:r})]}),(0,v.jsxs)(`details`,{children:[(0,v.jsx)(`summary`,{style:{cursor:`pointer`,fontWeight:600},children:`Serialized EditorState JSON (markdownToEditorStateJSON output)`}),(0,v.jsx)(`pre`,{style:{...o,marginTop:8},children:n})]})]})}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Notes',
    placeholder: 'Write something…'
  }
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Notes',
    placeholder: 'Format with the toolbar above…',
    plugins: <RichTextEditorToolbar />
  }
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Notes',
    placeholder: 'Select text and press the Link button (or Cmd/Ctrl+K) to add a link…',
    // The toolbar's Link button creates new-tab links by default (target/rel
    // baked into the node). No extra plugin needed.
    plugins: <RichTextEditorToolbar />
  }
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Notes',
    placeholder: 'Type a URL like https://astryx.dev and it auto-links…',
    plugins: <>
        <RichTextEditorToolbar />
        {/* Auto-linkify typed/pasted URLs + emails (open in a new tab). */}
        <RichTextEditorAutoLinkPlugin />
      </>
  }
}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Release notes',
    description: 'Supports **bold**, _italic_, lists, quotes and links.',
    placeholder: 'Describe what changed…'
  }
}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Summary',
    isRequired: true,
    placeholder: 'Required field'
  }
}`,...T.parameters?.docs?.source}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Bio',
    maxLength: 80,
    description: 'A character counter appears below the editor when maxLength is set.',
    placeholder: 'Type past 80 characters to see the counter turn red…'
  }
}`,...E.parameters?.docs?.source}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Comment',
    description: 'Restricted markdown: only \`*bold*\`, \`_italic_\` and \`- \` unordered lists (no headings, quotes or code).',
    placeholder: 'Try typing "# " — it will not become a heading…',
    transformers: [BOLD_STAR, ITALIC_STAR, UNORDERED_LIST]
  }
}`,...D.parameters?.docs?.source}}},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Notes',
    placeholder: 'Write something…',
    status: {
      type: 'error',
      message: 'This field is required.'
    }
  }
}`,...O.parameters?.docs?.source}}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Notes',
    isReadOnly: true
  }
}`,...k.parameters?.docs?.source}}},j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Notes',
    defaultValue: SEED
  }
}`,...j.parameters?.docs?.source}}},M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
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
}`,...M.parameters?.docs?.source},description:{story:`Serialize on change and render the same content read-only with RichTextView.`,...M.parameters?.docs?.description}}},N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
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
}`,...N.parameters?.docs?.source}}},F.parameters={...F.parameters,docs:{...F.parameters?.docs,source:{originalSource:`{
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
}`,...F.parameters?.docs?.source},description:{story:`Playground for the standalone Markdown <-> EditorState serializer helpers
(markdownToEditorStateJSON / editorStateJSONToMarkdown) added in #4544.

These run headless — no mounted editor needed. Here we:
 1. Take Markdown text (left),
 2. Serialize it to an EditorState JSON string with \`markdownToEditorStateJSON\`,
 3. Feed that JSON straight into a live <RichTextEditor defaultValue={...} />
    AND a read-only <RichTextView />,
 4. Round-trip it back to Markdown with \`editorStateJSONToMarkdown\`
    so you can eyeball that Markdown -> JSON -> Markdown is stable.`,...F.parameters?.docs?.description}}},I=[`Default`,`WithToolbar`,`WithLinks`,`WithAutoLink`,`WithDescription`,`Required`,`WithCharacterLimit`,`CustomTransformers`,`ErrorStatus`,`ReadOnly`,`WithInitialValue`,`ControlledPersistence`,`ImperativeRef`,`MarkdownSerializers`]}))();export{M as ControlledPersistence,D as CustomTransformers,b as Default,O as ErrorStatus,N as ImperativeRef,F as MarkdownSerializers,k as ReadOnly,T as Required,C as WithAutoLink,E as WithCharacterLimit,w as WithDescription,j as WithInitialValue,S as WithLinks,x as WithToolbar,I as __namedExportsOrder,y as default};