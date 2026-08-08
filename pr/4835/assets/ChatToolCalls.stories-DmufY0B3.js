import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{t}from"./react-BZJXY1be.js";import{t as n}from"./jsx-runtime-DeHZSEgm.js";import{n as r,t as i}from"./CodeBlock-Bm_rE_Eg.js";import{n as a,t as o}from"./ChatToolCalls-B3nkIUf8.js";var s,c,l,u,d,f,p,m,h,g,_,v,y,b,x;function S(){return(S=e((()=>{a(),s=t(),r(),c=n(),l={title:`Core/ChatToolCalls`,component:o,tags:[`autodocs`],parameters:{layout:`centered`},decorators:[e=>(0,c.jsx)(`div`,{style:{width:500,padding:40},children:(0,c.jsx)(e,{})})]},u={render:()=>(0,c.jsx)(o,{calls:[{name:`bash`,target:`git status`,status:`complete`,duration:`1.2s`}]})},d={render:()=>(0,c.jsx)(o,{calls:[{name:`bash`,target:`git diff --stat`,status:`complete`,duration:`340ms`},{name:`read`,target:`src/Button.tsx`,status:`complete`,duration:`45ms`},{name:`edit`,target:`src/Button.tsx`,status:`complete`,duration:`120ms`,additions:12,deletions:3}]})},f={render:()=>(0,c.jsx)(o,{calls:[{name:`bash`,target:`yarn test`,status:`complete`,duration:`4.2s`,node:`cli:remote-server`},{name:`bash`,target:`yarn build`,status:`complete`,duration:`12s`,node:`cli:remote-server`},{name:`read`,target:`README.md`,status:`complete`,duration:`30ms`,node:`workspace`},{name:`web_search`,target:`CSS anchor positioning`,status:`complete`,duration:`1.8s`}]})},p={render:()=>(0,c.jsx)(o,{calls:[{name:`edit`,target:`Button.tsx`,status:`complete`,duration:`85ms`,node:`cli:remote-server`,additions:24,deletions:8},{name:`edit`,target:`Button.test.tsx`,status:`complete`,duration:`60ms`,node:`cli:remote-server`,additions:45},{name:`bash`,target:`grep -r "radius"`,status:`complete`,duration:`200ms`,node:`cli:remote-server`,stats:`6 files · 14 matches`}]})},m={render:()=>(0,c.jsx)(o,{calls:[{name:`bash`,target:`yarn build`,status:`complete`,duration:`8s`,node:`cli:remote-server`},{name:`read`,target:`test-output.log`,status:`complete`,duration:`15ms`,node:`cli:remote-server`},{name:`bash`,target:`yarn test`,status:`error`,duration:`2.1s`,node:`cli:remote-server`,errorMessage:`Process exited with code 1: FAIL src/Button.test.tsx`}]})},h={render:()=>(0,c.jsx)(o,{calls:[{name:`bash`,target:`yarn test --watch`,status:`running`,node:`cli:remote-server`},{name:`read`,target:`vitest.config.ts`,status:`complete`,duration:`20ms`,node:`cli:remote-server`}]})},g={render:()=>{let e=[{key:`1`,name:`web_search`,target:`CSS anchor positioning support`,status:`complete`,duration:`1.8s`},{key:`2`,name:`read`,target:`packages/core/src/Layer/useLayer.tsx`,status:`complete`,duration:`45ms`,node:`cli:remote-server`},{key:`3`,name:`bash`,target:`npx tsc --noEmit`,status:`complete`,duration:`4.2s`,node:`cli:remote-server`},{key:`4`,name:`edit`,target:`ChatComposer.tsx`,status:`complete`,duration:`120ms`,node:`cli:remote-server`,additions:8,deletions:2},{key:`5`,name:`bash`,target:`yarn test`,status:`complete`,duration:`6.1s`,node:`cli:remote-server`}],[t,n]=(0,s.useState)([]),[r,i]=(0,s.useState)(!1),a=(0,s.useCallback)(()=>{n([]),i(!0);let t=0,r=()=>{if(t>=e.length){i(!1);return}let a=e[t];if(a==null)return;n(e=>[...e,{...a,status:`running`,duration:void 0}]);let o=t;setTimeout(()=>{n(t=>t.map((t,n)=>n===o?{...e[o]??t}:t)),setTimeout(r,200)},800+Math.random()*1200),t++};r()},[]);return(0,c.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:16},children:[(0,c.jsx)(`button`,{onClick:a,disabled:r,style:{padding:`8px 16px`,borderRadius:8,border:`1px solid #ccc`,cursor:r?`not-allowed`:`pointer`,opacity:r?.5:1},children:r?`Running...`:`Start streaming`}),t.length>0&&(0,c.jsx)(o,{calls:t})]})}},_={render:()=>(0,c.jsx)(o,{calls:[{name:`bash`,target:`git fetch origin`,status:`complete`,duration:`1.2s`},{name:`bash`,target:`git log --oneline -5`,status:`complete`,duration:`80ms`},{name:`read`,target:`CHANGELOG.md`,status:`complete`,duration:`30ms`},{name:`read`,target:`package.json`,status:`complete`,duration:`15ms`},{name:`edit`,target:`package.json`,status:`complete`,duration:`50ms`,additions:1,deletions:1},{name:`bash`,target:`yarn install`,status:`complete`,duration:`8.5s`},{name:`bash`,target:`yarn build`,status:`complete`,duration:`12s`},{name:`bash`,target:`yarn test`,status:`complete`,duration:`6.2s`}]})},v={render:()=>(0,c.jsx)(o,{calls:[{name:`edit`,target:`Button.tsx`,status:`complete`,duration:`85ms`,node:`cli:remote-server`,additions:12,deletions:3,resultDetail:(0,c.jsx)(i,{code:`--- a/packages/core/src/Button/Button.tsx
+++ b/packages/core/src/Button/Button.tsx
@@ -55,7 +55,7 @@ const styles = stylex.create({
     gap: spacingVars['--spacing-2'],
     paddingBlock: spacingVars['--spacing-2'],
     paddingInline: spacingVars['--spacing-3'],
-    '--button-radius': radiusVars['--radius-element'],
-    borderRadius: 'var(--button-radius)',
+    borderRadius: 'var(--button-radius, var(--radius-element))',
     fontFamily: 'inherit',
     fontSize: typeScaleVars['--text-label-size'],
     lineHeight: typeScaleVars['--text-label-leading'],
@@ -93,6 +93,10 @@ const styles = stylex.create({
     '--button-icon-only-aspect': '1 / 1',
     aspectRatio: 'var(--button-icon-only-aspect)',
   },
+  // Focus ring offset for accessibility
+  focusVisible: {
+    outline: '2px solid var(--color-ring-focus)',
+    outlineOffset: '2px',
+  },
 });`,language:`typescript`,maxHeight:`50vh`})},{name:`bash`,target:`yarn test`,status:`complete`,duration:`6.1s`,node:`cli:remote-server`,resultDetail:(0,c.jsx)(i,{code:`$ yarn test
 PASS  packages/core/src/Button/Button.test.tsx
 PASS  packages/core/src/Chat/ChatToolCalls.test.tsx
 PASS  packages/core/src/Chat/ChatComposerInput.test.tsx

Test Suites: 7 passed, 7 total
Tests:       67 passed, 67 total
Time:        6.1s`,language:`bash`,maxHeight:`50vh`})},{name:`web_search`,target:`CSS anchor positioning`,status:`complete`,duration:`1.8s`}]})},y={render:()=>(0,c.jsx)(o,{calls:[{name:`bash`,target:`yarn build`,status:`complete`,duration:`8s`,node:`cli:remote-server`},{name:`read`,target:`ChatToolCalls.tsx`,status:`complete`,duration:`15ms`,node:`cli:remote-server`},{name:`bash`,target:`yarn test`,status:`error`,duration:`6.8s`,node:`cli:remote-server`,errorMessage:`4 tests failed`,resultDetail:(0,c.jsx)(i,{code:`$ yarn test
 PASS  packages/core/src/Chat/ChatReasoning.test.tsx (7 tests)
 FAIL  packages/core/src/Chat/ChatToolCalls.test.tsx

  ● ChatToolCalls > renders group header for multiple calls

    ReferenceError: hasError is not defined

Test Suites: 1 failed, 6 passed, 7 total
Tests:       4 failed, 63 passed, 67 total
Time:        6.84s`,language:`bash`,maxHeight:`50vh`})}]})},b={render:()=>(0,c.jsx)(o,{calls:[{key:`pending`,name:`bash`,target:`yarn build`,status:`pending`},{key:`running`,name:`bash`,target:`yarn test`,status:`running`},{key:`complete`,name:`edit`,target:`Button.tsx`,status:`complete`,duration:`120ms`,additions:8,deletions:2},{key:`error`,name:`bash`,target:`yarn lint`,status:`error`,duration:`0.8s`,errorMessage:`3 lint errors found`}]})},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  render: () => <ChatToolCalls calls={[{
    name: 'bash',
    target: 'git status',
    status: 'complete',
    duration: '1.2s'
  }]} />
}`,...u.parameters?.docs?.source},description:{story:`Single tool call — renders inline, no group chrome`,...u.parameters?.docs?.description}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  render: () => <ChatToolCalls calls={[{
    name: 'bash',
    target: 'git diff --stat',
    status: 'complete',
    duration: '340ms'
  }, {
    name: 'read',
    target: 'src/Button.tsx',
    status: 'complete',
    duration: '45ms'
  }, {
    name: 'edit',
    target: 'src/Button.tsx',
    status: 'complete',
    duration: '120ms',
    additions: 12,
    deletions: 3
  }]} />
}`,...d.parameters?.docs?.source},description:{story:`Multiple calls — pile visual with collapsible group`,...d.parameters?.docs?.description}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  render: () => <ChatToolCalls calls={[{
    name: 'bash',
    target: 'yarn test',
    status: 'complete',
    duration: '4.2s',
    node: 'cli:remote-server'
  }, {
    name: 'bash',
    target: 'yarn build',
    status: 'complete',
    duration: '12s',
    node: 'cli:remote-server'
  }, {
    name: 'read',
    target: 'README.md',
    status: 'complete',
    duration: '30ms',
    node: 'workspace'
  }, {
    name: 'web_search',
    target: 'CSS anchor positioning',
    status: 'complete',
    duration: '1.8s'
  }]} />
}`,...f.parameters?.docs?.source},description:{story:`With node badges — shows which sandbox ran each tool`,...f.parameters?.docs?.description}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  render: () => <ChatToolCalls calls={[{
    name: 'edit',
    target: 'Button.tsx',
    status: 'complete',
    duration: '85ms',
    node: 'cli:remote-server',
    additions: 24,
    deletions: 8
  }, {
    name: 'edit',
    target: 'Button.test.tsx',
    status: 'complete',
    duration: '60ms',
    node: 'cli:remote-server',
    additions: 45
  }, {
    name: 'bash',
    target: 'grep -r "radius"',
    status: 'complete',
    duration: '200ms',
    node: 'cli:remote-server',
    stats: '6 files · 14 matches'
  }]} />
}`,...p.parameters?.docs?.source},description:{story:`With stats — additions, deletions, file counts`,...p.parameters?.docs?.description}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  render: () => <ChatToolCalls calls={[{
    name: 'bash',
    target: 'yarn build',
    status: 'complete',
    duration: '8s',
    node: 'cli:remote-server'
  }, {
    name: 'read',
    target: 'test-output.log',
    status: 'complete',
    duration: '15ms',
    node: 'cli:remote-server'
  }, {
    name: 'bash',
    target: 'yarn test',
    status: 'error',
    duration: '2.1s',
    node: 'cli:remote-server',
    errorMessage: 'Process exited with code 1: FAIL src/Button.test.tsx'
  }]} />
}`,...m.parameters?.docs?.source},description:{story:`Error state — shows error indicator on group and individual calls`,...m.parameters?.docs?.description}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  render: () => <ChatToolCalls calls={[{
    name: 'bash',
    target: 'yarn test --watch',
    status: 'running',
    node: 'cli:remote-server'
  }, {
    name: 'read',
    target: 'vitest.config.ts',
    status: 'complete',
    duration: '20ms',
    node: 'cli:remote-server'
  }]} />
}`,...h.parameters?.docs?.source},description:{story:`Running state — spinner on active calls`,...h.parameters?.docs?.description}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  render: () => {
    const allCalls: ChatToolCallItem[] = [{
      key: '1',
      name: 'web_search',
      target: 'CSS anchor positioning support',
      status: 'complete',
      duration: '1.8s'
    }, {
      key: '2',
      name: 'read',
      target: 'packages/core/src/Layer/useLayer.tsx',
      status: 'complete',
      duration: '45ms',
      node: 'cli:remote-server'
    }, {
      key: '3',
      name: 'bash',
      target: 'npx tsc --noEmit',
      status: 'complete',
      duration: '4.2s',
      node: 'cli:remote-server'
    }, {
      key: '4',
      name: 'edit',
      target: 'ChatComposer.tsx',
      status: 'complete',
      duration: '120ms',
      node: 'cli:remote-server',
      additions: 8,
      deletions: 2
    }, {
      key: '5',
      name: 'bash',
      target: 'yarn test',
      status: 'complete',
      duration: '6.1s',
      node: 'cli:remote-server'
    }];
    const [calls, setCalls] = useState<ChatToolCallItem[]>([]);
    const [isRunning, setIsRunning] = useState(false);
    const start = useCallback(() => {
      setCalls([]);
      setIsRunning(true);
      let i = 0;
      const addNext = () => {
        if (i >= allCalls.length) {
          setIsRunning(false);
          return;
        }
        // Add as running
        const call = allCalls[i];
        if (call == null) {
          return;
        }
        setCalls(prev => [...prev, {
          ...call,
          status: 'running',
          duration: undefined
        }]);

        // Complete after a delay
        const idx = i;
        setTimeout(() => {
          setCalls(prev => prev.map((c, j) => j === idx ? {
            ...(allCalls[idx] ?? c)
          } : c));
          // Add next after completion
          setTimeout(addNext, 200);
        }, 800 + Math.random() * 1200);
        i++;
      };
      addNext();
    }, []);
    return <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 16
    }}>
        <button onClick={start} disabled={isRunning} style={{
        padding: '8px 16px',
        borderRadius: 8,
        border: '1px solid #ccc',
        cursor: isRunning ? 'not-allowed' : 'pointer',
        opacity: isRunning ? 0.5 : 1
      }}>
          {isRunning ? 'Running...' : 'Start streaming'}
        </button>
        {calls.length > 0 && <ChatToolCalls calls={calls} />}
      </div>;
  }
}`,...g.parameters?.docs?.source},description:{story:`Streaming — tool calls arrive one by one with status transitions`,...g.parameters?.docs?.description}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  render: () => <ChatToolCalls calls={[{
    name: 'bash',
    target: 'git fetch origin',
    status: 'complete',
    duration: '1.2s'
  }, {
    name: 'bash',
    target: 'git log --oneline -5',
    status: 'complete',
    duration: '80ms'
  }, {
    name: 'read',
    target: 'CHANGELOG.md',
    status: 'complete',
    duration: '30ms'
  }, {
    name: 'read',
    target: 'package.json',
    status: 'complete',
    duration: '15ms'
  }, {
    name: 'edit',
    target: 'package.json',
    status: 'complete',
    duration: '50ms',
    additions: 1,
    deletions: 1
  }, {
    name: 'bash',
    target: 'yarn install',
    status: 'complete',
    duration: '8.5s'
  }, {
    name: 'bash',
    target: 'yarn build',
    status: 'complete',
    duration: '12s'
  }, {
    name: 'bash',
    target: 'yarn test',
    status: 'complete',
    duration: '6.2s'
  }]} />
}`,..._.parameters?.docs?.source},description:{story:`Many calls — auto-collapses when >3`,..._.parameters?.docs?.description}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  render: () => {
    const editDiff = \`--- a/packages/core/src/Button/Button.tsx
+++ b/packages/core/src/Button/Button.tsx
@@ -55,7 +55,7 @@ const styles = stylex.create({
     gap: spacingVars['--spacing-2'],
     paddingBlock: spacingVars['--spacing-2'],
     paddingInline: spacingVars['--spacing-3'],
-    '--button-radius': radiusVars['--radius-element'],
-    borderRadius: 'var(--button-radius)',
+    borderRadius: 'var(--button-radius, var(--radius-element))',
     fontFamily: 'inherit',
     fontSize: typeScaleVars['--text-label-size'],
     lineHeight: typeScaleVars['--text-label-leading'],
@@ -93,6 +93,10 @@ const styles = stylex.create({
     '--button-icon-only-aspect': '1 / 1',
     aspectRatio: 'var(--button-icon-only-aspect)',
   },
+  // Focus ring offset for accessibility
+  focusVisible: {
+    outline: '2px solid var(--color-ring-focus)',
+    outlineOffset: '2px',
+  },
 });\`;
    const testOutput = \`$ yarn test
 PASS  packages/core/src/Button/Button.test.tsx
 PASS  packages/core/src/Chat/ChatToolCalls.test.tsx
 PASS  packages/core/src/Chat/ChatComposerInput.test.tsx

Test Suites: 7 passed, 7 total
Tests:       67 passed, 67 total
Time:        6.1s\`;
    return <ChatToolCalls calls={[{
      name: 'edit',
      target: 'Button.tsx',
      status: 'complete',
      duration: '85ms',
      node: 'cli:remote-server',
      additions: 12,
      deletions: 3,
      resultDetail: <CodeBlock code={editDiff} language="typescript" maxHeight="50vh" />
    }, {
      name: 'bash',
      target: 'yarn test',
      status: 'complete',
      duration: '6.1s',
      node: 'cli:remote-server',
      resultDetail: <CodeBlock code={testOutput} language="bash" maxHeight="50vh" />
    }, {
      name: 'web_search',
      target: 'CSS anchor positioning',
      status: 'complete',
      duration: '1.8s'
    }]} />;
  }
}`,...v.parameters?.docs?.source},description:{story:`Interactive calls — edit opens a diff modal, bash opens output`,...v.parameters?.docs?.description}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  render: () => {
    const errorOutput = \`$ yarn test
 PASS  packages/core/src/Chat/ChatReasoning.test.tsx (7 tests)
 FAIL  packages/core/src/Chat/ChatToolCalls.test.tsx

  ● ChatToolCalls > renders group header for multiple calls

    ReferenceError: hasError is not defined

Test Suites: 1 failed, 6 passed, 7 total
Tests:       4 failed, 63 passed, 67 total
Time:        6.84s\`;
    return <ChatToolCalls calls={[{
      name: 'bash',
      target: 'yarn build',
      status: 'complete',
      duration: '8s',
      node: 'cli:remote-server'
    }, {
      name: 'read',
      target: 'ChatToolCalls.tsx',
      status: 'complete',
      duration: '15ms',
      node: 'cli:remote-server'
    }, {
      name: 'bash',
      target: 'yarn test',
      status: 'error',
      duration: '6.8s',
      node: 'cli:remote-server',
      errorMessage: '4 tests failed',
      resultDetail: <CodeBlock code={errorOutput} language="bash" maxHeight="50vh" />
    }]} />;
  }
}`,...y.parameters?.docs?.source},description:{story:`Error with modal — clicking a failed call shows error detail with banner`,...y.parameters?.docs?.description}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  render: () => <ChatToolCalls calls={[{
    key: 'pending',
    name: 'bash',
    target: 'yarn build',
    status: 'pending'
  }, {
    key: 'running',
    name: 'bash',
    target: 'yarn test',
    status: 'running'
  }, {
    key: 'complete',
    name: 'edit',
    target: 'Button.tsx',
    status: 'complete',
    duration: '120ms',
    additions: 8,
    deletions: 2
  }, {
    key: 'error',
    name: 'bash',
    target: 'yarn lint',
    status: 'error',
    duration: '0.8s',
    errorMessage: '3 lint errors found'
  }]} />
}`,...b.parameters?.docs?.source},description:{story:`All statuses — shows every status icon treatment side by side`,...b.parameters?.docs?.description}}},x=[`SingleCall`,`MultipleCalls`,`WithNodes`,`WithStats`,`WithErrors`,`Running`,`Streaming`,`ManyCalls`,`Interactive`,`ErrorWithDetail`,`AllStatuses`]})))()}S();export{b as AllStatuses,y as ErrorWithDetail,v as Interactive,_ as ManyCalls,d as MultipleCalls,h as Running,u as SingleCall,g as Streaming,m as WithErrors,f as WithNodes,p as WithStats,x as __namedExportsOrder,l as default};