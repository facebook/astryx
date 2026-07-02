import{a1 as e,ah as x}from"./iframe-Z8EfSKmM.js";import{C as t}from"./ChatToolCalls-CsVz_q3H.js";import{C as f}from"./CodeBlock-IWiWPiPb.js";import"./preload-helper-Ct5FWWRu.js";import"./Badge-md6xy498.js";import"./getKey-DyRdrWhf.js";import"./highlightRanges-B4jhAgDe.js";const O={title:"Core/ChatToolCalls",component:t,tags:["autodocs"],parameters:{layout:"centered"},decorators:[s=>e.jsx("div",{style:{width:500,padding:40},children:e.jsx(s,{})})]},a={render:()=>e.jsx(t,{calls:[{name:"bash",target:"git status",status:"complete",duration:"1.2s"}]})},n={render:()=>e.jsx(t,{calls:[{name:"bash",target:"git diff --stat",status:"complete",duration:"340ms"},{name:"read",target:"src/Button.tsx",status:"complete",duration:"45ms"},{name:"edit",target:"src/Button.tsx",status:"complete",duration:"120ms",additions:12,deletions:3}]})},r={render:()=>e.jsx(t,{calls:[{name:"bash",target:"yarn test",status:"complete",duration:"4.2s",node:"cli:remote-server"},{name:"bash",target:"yarn build",status:"complete",duration:"12s",node:"cli:remote-server"},{name:"read",target:"README.md",status:"complete",duration:"30ms",node:"workspace"},{name:"web_search",target:"CSS anchor positioning",status:"complete",duration:"1.8s"}]})},o={render:()=>e.jsx(t,{calls:[{name:"edit",target:"Button.tsx",status:"complete",duration:"85ms",node:"cli:remote-server",additions:24,deletions:8},{name:"edit",target:"Button.test.tsx",status:"complete",duration:"60ms",node:"cli:remote-server",additions:45},{name:"bash",target:'grep -r "radius"',status:"complete",duration:"200ms",node:"cli:remote-server",stats:"6 files · 14 matches"}]})},i={render:()=>e.jsx(t,{calls:[{name:"bash",target:"yarn build",status:"complete",duration:"8s",node:"cli:remote-server"},{name:"read",target:"test-output.log",status:"complete",duration:"15ms",node:"cli:remote-server"},{name:"bash",target:"yarn test",status:"error",duration:"2.1s",node:"cli:remote-server",errorMessage:"Process exited with code 1: FAIL src/Button.test.tsx"}]})},l={render:()=>e.jsx(t,{calls:[{name:"bash",target:"yarn test --watch",status:"running",node:"cli:remote-server"},{name:"read",target:"vitest.config.ts",status:"complete",duration:"20ms",node:"cli:remote-server"}]})},c={render:()=>{const s=[{key:"1",name:"web_search",target:"CSS anchor positioning support",status:"complete",duration:"1.8s"},{key:"2",name:"read",target:"packages/core/src/Layer/useLayer.tsx",status:"complete",duration:"45ms",node:"cli:remote-server"},{key:"3",name:"bash",target:"npx tsc --noEmit",status:"complete",duration:"4.2s",node:"cli:remote-server"},{key:"4",name:"edit",target:"ChatComposer.tsx",status:"complete",duration:"120ms",node:"cli:remote-server",additions:8,deletions:2},{key:"5",name:"bash",target:"yarn test",status:"complete",duration:"6.1s",node:"cli:remote-server"}],[y,b]=x.useState([]),[g,v]=x.useState(!1),R=x.useCallback(()=>{b([]),v(!0);let h=0;const S=()=>{if(h>=s.length){v(!1);return}const k=s[h];if(k==null)return;b(C=>[...C,{...k,status:"running",duration:void 0}]);const T=h;setTimeout(()=>{b(C=>C.map((B,j)=>j===T?{...s[T]??B}:B)),setTimeout(S,200)},800+Math.random()*1200),h++};S()},[]);return e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:16},children:[e.jsx("button",{onClick:R,disabled:g,style:{padding:"8px 16px",borderRadius:8,border:"1px solid #ccc",cursor:g?"not-allowed":"pointer",opacity:g?.5:1},children:g?"Running...":"Start streaming"}),y.length>0&&e.jsx(t,{calls:y})]})}},d={render:()=>e.jsx(t,{calls:[{name:"bash",target:"git fetch origin",status:"complete",duration:"1.2s"},{name:"bash",target:"git log --oneline -5",status:"complete",duration:"80ms"},{name:"read",target:"CHANGELOG.md",status:"complete",duration:"30ms"},{name:"read",target:"package.json",status:"complete",duration:"15ms"},{name:"edit",target:"package.json",status:"complete",duration:"50ms",additions:1,deletions:1},{name:"bash",target:"yarn install",status:"complete",duration:"8.5s"},{name:"bash",target:"yarn build",status:"complete",duration:"12s"},{name:"bash",target:"yarn test",status:"complete",duration:"6.2s"}]})},u={render:()=>e.jsx(t,{calls:[{name:"edit",target:"Button.tsx",status:"complete",duration:"85ms",node:"cli:remote-server",additions:12,deletions:3,resultDetail:e.jsx(f,{code:`--- a/packages/core/src/Button/Button.tsx
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
 });`,language:"typescript",maxHeight:"50vh"})},{name:"bash",target:"yarn test",status:"complete",duration:"6.1s",node:"cli:remote-server",resultDetail:e.jsx(f,{code:`$ yarn test
 PASS  packages/core/src/Button/Button.test.tsx
 PASS  packages/core/src/Chat/ChatToolCalls.test.tsx
 PASS  packages/core/src/Chat/ChatComposerInput.test.tsx

Test Suites: 7 passed, 7 total
Tests:       67 passed, 67 total
Time:        6.1s`,language:"bash",maxHeight:"50vh"})},{name:"web_search",target:"CSS anchor positioning",status:"complete",duration:"1.8s"}]})},m={render:()=>e.jsx(t,{calls:[{name:"bash",target:"yarn build",status:"complete",duration:"8s",node:"cli:remote-server"},{name:"read",target:"ChatToolCalls.tsx",status:"complete",duration:"15ms",node:"cli:remote-server"},{name:"bash",target:"yarn test",status:"error",duration:"6.8s",node:"cli:remote-server",errorMessage:"4 tests failed",resultDetail:e.jsx(f,{code:`$ yarn test
 PASS  packages/core/src/Chat/ChatReasoning.test.tsx (7 tests)
 FAIL  packages/core/src/Chat/ChatToolCalls.test.tsx

  ● ChatToolCalls > renders group header for multiple calls

    ReferenceError: hasError is not defined

Test Suites: 1 failed, 6 passed, 7 total
Tests:       4 failed, 63 passed, 67 total
Time:        6.84s`,language:"bash",maxHeight:"50vh"})}]})},p={render:()=>e.jsx(t,{calls:[{key:"pending",name:"bash",target:"yarn build",status:"pending"},{key:"running",name:"bash",target:"yarn test",status:"running"},{key:"complete",name:"edit",target:"Button.tsx",status:"complete",duration:"120ms",additions:8,deletions:2},{key:"error",name:"bash",target:"yarn lint",status:"error",duration:"0.8s",errorMessage:"3 lint errors found"}]})};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  render: () => <ChatToolCalls calls={[{
    name: 'bash',
    target: 'git status',
    status: 'complete',
    duration: '1.2s'
  }]} />
}`,...a.parameters?.docs?.source},description:{story:"Single tool call — renders inline, no group chrome",...a.parameters?.docs?.description}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
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
}`,...n.parameters?.docs?.source},description:{story:"Multiple calls — pile visual with collapsible group",...n.parameters?.docs?.description}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
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
}`,...r.parameters?.docs?.source},description:{story:"With node badges — shows which sandbox ran each tool",...r.parameters?.docs?.description}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
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
}`,...o.parameters?.docs?.source},description:{story:"With stats — additions, deletions, file counts",...o.parameters?.docs?.description}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
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
}`,...i.parameters?.docs?.source},description:{story:"Error state — shows error indicator on group and individual calls",...i.parameters?.docs?.description}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
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
}`,...l.parameters?.docs?.source},description:{story:"Running state — spinner on active calls",...l.parameters?.docs?.description}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
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
}`,...c.parameters?.docs?.source},description:{story:"Streaming — tool calls arrive one by one with status transitions",...c.parameters?.docs?.description}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
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
}`,...d.parameters?.docs?.source},description:{story:"Many calls — auto-collapses when >3",...d.parameters?.docs?.description}}};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
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
}`,...u.parameters?.docs?.source},description:{story:"Interactive calls — edit opens a diff modal, bash opens output",...u.parameters?.docs?.description}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
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
}`,...m.parameters?.docs?.source},description:{story:"Error with modal — clicking a failed call shows error detail with banner",...m.parameters?.docs?.description}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
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
}`,...p.parameters?.docs?.source},description:{story:"All statuses — shows every status icon treatment side by side",...p.parameters?.docs?.description}}};const H=["SingleCall","MultipleCalls","WithNodes","WithStats","WithErrors","Running","Streaming","ManyCalls","Interactive","ErrorWithDetail","AllStatuses"];export{p as AllStatuses,m as ErrorWithDetail,u as Interactive,d as ManyCalls,n as MultipleCalls,l as Running,a as SingleCall,c as Streaming,i as WithErrors,r as WithNodes,o as WithStats,H as __namedExportsOrder,O as default};
