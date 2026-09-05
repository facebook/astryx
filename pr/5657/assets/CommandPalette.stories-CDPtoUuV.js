import{i as e,s as t}from"./preload-helper-CT_b8DTk.js";import{t as n}from"./react-B7Te67-h.js";import{t as r}from"./jsx-runtime-DqZldVDK.js";import{t as i}from"./Button-BnrGcZLf.js";import{t as a}from"./Button-BBOpb_lq.js";import{s as o}from"./useTheme-CJYItYzy.js";import{t as s}from"./Icon-CDNRBkXA.js";import{t as c}from"./Icon-B1Jcw32f.js";import{t as l,x as u}from"./theme-Cev_i3Y3.js";import{i as d,t as f}from"./Typeahead-Do5-PRKv.js";import{ci as p,ii as m,oi as h,ri as g,ui as _}from"./iframe-DGBBZYB-.js";var v,y,b,x,S,C,w,T,E,D,O,k,A,j;e((()=>{v=t(n()),g(),a(),c(),l(),f(),y=r(),b={title:`Core/CommandPalette`,component:m,tags:[`autodocs`]},x={render:function(){let[e,t]=(0,v.useState)(!1),n=(0,v.useMemo)(()=>d([{id:`home`,label:`Home`},{id:`settings`,label:`Settings`},{id:`profile`,label:`Profile`},{id:`dashboard`,label:`Dashboard`},{id:`help`,label:`Help`}]),[]);return(0,y.jsxs)(y.Fragment,{children:[(0,y.jsx)(i,{label:`Open Command Palette`,onClick:()=>t(!0)}),(0,y.jsx)(m,{isOpen:e,onOpenChange:t,searchSource:n})]})}},S={render:function(){let[e,t]=(0,v.useState)(!1),n=(0,v.useMemo)(()=>d([{id:`home`,label:`Home`,auxiliaryData:{group:`Navigation`}},{id:`settings`,label:`Settings`,auxiliaryData:{group:`Navigation`}},{id:`profile`,label:`Profile`,auxiliaryData:{group:`Navigation`}},{id:`new-file`,label:`New File`,auxiliaryData:{group:`Actions`}},{id:`save`,label:`Save`,auxiliaryData:{group:`Actions`}},{id:`export`,label:`Export`,auxiliaryData:{group:`Actions`}}]),[]);return(0,y.jsxs)(y.Fragment,{children:[(0,y.jsx)(i,{label:`Open Grouped`,onClick:()=>t(!0)}),(0,y.jsx)(m,{isOpen:e,onOpenChange:t,searchSource:n})]})}},C={render:function(){let[e,t]=(0,v.useState)(!1),n=[{id:`dashboard`,label:`Go to Dashboard`,auxiliaryData:{icon:`menu`,group:`Navigation`}},{id:`settings`,label:`Open Settings`,auxiliaryData:{icon:`wrench`,group:`Navigation`,shortcut:`⌘,`}},{id:`profile`,label:`View Profile`,auxiliaryData:{icon:`info`,group:`Navigation`}},{id:`dark-mode`,label:`Toggle Dark Mode`,auxiliaryData:{group:`Actions`,keywords:[`theme`,`appearance`]}},{id:`new-file`,label:`Create New File`,auxiliaryData:{group:`Actions`,shortcut:`⌘N`}},{id:`search`,label:`Search Files`,auxiliaryData:{icon:`search`,group:`Actions`,shortcut:`⌘P`}}],r=(0,v.useMemo)(()=>d(n,{keywords:e=>e.auxiliaryData?.keywords??[]}),[]);return(0,y.jsxs)(y.Fragment,{children:[(0,y.jsx)(i,{label:`Open Rich Palette`,onClick:()=>t(!0)}),(0,y.jsx)(m,{isOpen:e,onOpenChange:t,searchSource:r,renderItem:e=>(0,y.jsxs)(`span`,{style:{display:`flex`,alignItems:`center`,gap:8,flex:1},children:[e.auxiliaryData?.icon&&(0,y.jsx)(s,{icon:e.auxiliaryData.icon,size:`sm`}),(0,y.jsx)(`span`,{style:{flex:1},children:e.label}),e.auxiliaryData?.shortcut&&(0,y.jsx)(`span`,{style:{fontSize:12,opacity:.5},children:e.auxiliaryData.shortcut})]})})]})}},w={render:function(){let[e,t]=(0,v.useState)(!1),[n,r]=(0,v.useState)(`light`),a=(0,v.useMemo)(()=>d([{id:`light`,label:`Light`},{id:`dark`,label:`Dark`},{id:`system`,label:`System`}]),[]);return(0,y.jsxs)(y.Fragment,{children:[(0,y.jsx)(i,{label:`Theme: ${n}`,onClick:()=>t(!0)}),(0,y.jsx)(m,{isOpen:e,onOpenChange:t,searchSource:a,value:n,onValueChange:e=>{r(e),t(!1)},renderItem:(e,t)=>(0,y.jsxs)(`span`,{style:{display:`flex`,alignItems:`center`,gap:8,flex:1},children:[(0,y.jsx)(`span`,{style:{flex:1},children:e.label}),t&&(0,y.jsx)(s,{icon:`check`,size:`sm`})]})})]})}},T={render:function(){let[e,t]=(0,v.useState)(!1),n=(0,v.useMemo)(()=>{let e=null;return{cancel(){e?.abort()},async search(t){return e?.abort(),e=new AbortController,await new Promise(e=>setTimeout(e,400)),[{id:`readme`,label:`README.md`},{id:`package`,label:`package.json`},{id:`tsconfig`,label:`tsconfig.json`},{id:`index`,label:`src/index.ts`},{id:`app`,label:`src/App.tsx`}].filter(e=>e.label.toLowerCase().includes(t.toLowerCase()))},bootstrap(){return[]}}},[]);return(0,y.jsxs)(y.Fragment,{children:[(0,y.jsx)(i,{label:`Open File Search`,onClick:()=>t(!0)}),(0,y.jsx)(m,{isOpen:e,onOpenChange:t,searchSource:n,input:(0,y.jsx)(p,{placeholder:`Search files...`}),emptyBootstrapText:`Type a filename to search`,emptySearchText:`No files found`})]})}},E={render:function(){let[e,t]=(0,v.useState)(!1),n=[{id:`home`,label:`Home`},{id:`dark-mode`,label:`Toggle Dark Mode`,auxiliaryData:{aliases:[`theme`,`appearance`]}},{id:`font-size`,label:`Change Font Size`,auxiliaryData:{aliases:[`text`,`zoom`]}}],r=(0,v.useMemo)(()=>d(n,{keywords:e=>e.auxiliaryData?.aliases??[]}),[]);return(0,y.jsxs)(y.Fragment,{children:[(0,y.jsx)(i,{label:`Open (try 'theme')`,onClick:()=>t(!0)}),(0,y.jsx)(m,{isOpen:e,onOpenChange:t,searchSource:r})]})}},D={render:function(){let[e,t]=(0,v.useState)(!1),n=[`Files`,`Actions`,`Navigation`,`Settings`,`Recent`],r=Array.from({length:50},(e,t)=>({id:`item-${t}`,label:`Item ${t+1}`,auxiliaryData:{group:n[t%n.length]}})),a=(0,v.useMemo)(()=>d(r),[]);return(0,y.jsxs)(y.Fragment,{children:[(0,y.jsx)(i,{label:`Open (50 items)`,onClick:()=>t(!0)}),(0,y.jsx)(m,{isOpen:e,onOpenChange:t,searchSource:a})]})}},O={render:function(){let[e,t]=(0,v.useState)(!1),n=(0,v.useMemo)(()=>d([{id:`home`,label:`Home`},{id:`settings`,label:`Settings`}]),[]);return(0,y.jsxs)(y.Fragment,{children:[(0,y.jsx)(i,{label:`Open`,onClick:()=>t(!0)}),(0,y.jsx)(m,{isOpen:e,onOpenChange:t,searchSource:n,footer:(0,y.jsx)(h,{children:(0,y.jsx)(`span`,{children:`Pro tip: use ⌘K to open anywhere`})})})]})}},k=o({name:`command-palette-group-heading-demo`,components:{"command-palette-group-heading":{base:{fontWeight:`var(--font-weight-bold)`,color:`var(--color-accent)`,textTransform:`uppercase`}}}}),A={render:()=>(0,y.jsx)(u,{theme:k,mode:`light`,children:(0,y.jsxs)(_,{heading:`Suggestions`,children:[(0,y.jsx)(`div`,{children:`Home`}),(0,y.jsx)(`div`,{children:`Settings`}),(0,y.jsx)(`div`,{children:`Profile`})]})})},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  render: function Render() {
    const [isOpen, setIsOpen] = useState(false);
    const source = useMemo(() => createStaticSource([{
      id: 'home',
      label: 'Home'
    }, {
      id: 'settings',
      label: 'Settings'
    }, {
      id: 'profile',
      label: 'Profile'
    }, {
      id: 'dashboard',
      label: 'Dashboard'
    }, {
      id: 'help',
      label: 'Help'
    }]), []);
    return <>
        <Button label="Open Command Palette" onClick={() => setIsOpen(true)} />
        <CommandPalette isOpen={isOpen} onOpenChange={setIsOpen} searchSource={source} />
      </>;
  }
}`,...x.parameters?.docs?.source},description:{story:`Simplest case — no input/footer/renderItem needed.`,...x.parameters?.docs?.description}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  render: function Render() {
    const [isOpen, setIsOpen] = useState(false);
    const source = useMemo(() => createStaticSource([{
      id: 'home',
      label: 'Home',
      auxiliaryData: {
        group: 'Navigation'
      }
    }, {
      id: 'settings',
      label: 'Settings',
      auxiliaryData: {
        group: 'Navigation'
      }
    }, {
      id: 'profile',
      label: 'Profile',
      auxiliaryData: {
        group: 'Navigation'
      }
    }, {
      id: 'new-file',
      label: 'New File',
      auxiliaryData: {
        group: 'Actions'
      }
    }, {
      id: 'save',
      label: 'Save',
      auxiliaryData: {
        group: 'Actions'
      }
    }, {
      id: 'export',
      label: 'Export',
      auxiliaryData: {
        group: 'Actions'
      }
    }]), []);
    return <>
        <Button label="Open Grouped" onClick={() => setIsOpen(true)} />
        <CommandPalette isOpen={isOpen} onOpenChange={setIsOpen} searchSource={source} />
      </>;
  }
}`,...S.parameters?.docs?.source},description:{story:`Groups detected automatically from auxiliaryData.group. No custom rendering needed.`,...S.parameters?.docs?.description}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  render: function Render() {
    const [isOpen, setIsOpen] = useState(false);
    const commands: RichCommand[] = [{
      id: 'dashboard',
      label: 'Go to Dashboard',
      auxiliaryData: {
        icon: 'menu',
        group: 'Navigation'
      }
    }, {
      id: 'settings',
      label: 'Open Settings',
      auxiliaryData: {
        icon: 'wrench',
        group: 'Navigation',
        shortcut: '⌘,'
      }
    }, {
      id: 'profile',
      label: 'View Profile',
      auxiliaryData: {
        icon: 'info',
        group: 'Navigation'
      }
    }, {
      id: 'dark-mode',
      label: 'Toggle Dark Mode',
      auxiliaryData: {
        group: 'Actions',
        keywords: ['theme', 'appearance']
      }
    }, {
      id: 'new-file',
      label: 'Create New File',
      auxiliaryData: {
        group: 'Actions',
        shortcut: '⌘N'
      }
    }, {
      id: 'search',
      label: 'Search Files',
      auxiliaryData: {
        icon: 'search',
        group: 'Actions',
        shortcut: '⌘P'
      }
    }];
    const source = useMemo(() => createStaticSource(commands, {
      keywords: item => item.auxiliaryData?.keywords ?? []
    }), []);
    return <>
        <Button label="Open Rich Palette" onClick={() => setIsOpen(true)} />
        <CommandPalette isOpen={isOpen} onOpenChange={setIsOpen} searchSource={source} renderItem={(item: RichCommand) => <span style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        flex: 1
      }}>
              {item.auxiliaryData?.icon && <Icon icon={item.auxiliaryData.icon} size="sm" />}
              <span style={{
          flex: 1
        }}>{item.label}</span>
              {item.auxiliaryData?.shortcut && <span style={{
          fontSize: 12,
          opacity: 0.5
        }}>
                  {item.auxiliaryData.shortcut}
                </span>}
            </span>} />
      </>;
  }
}`,...C.parameters?.docs?.source},description:{story:`Custom item content via renderItem — icons and shortcuts.
Grouping remains automatic via auxiliaryData.group.`,...C.parameters?.docs?.description}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  render: function Render() {
    const [isOpen, setIsOpen] = useState(false);
    const [theme, setTheme] = useState('light');
    const source = useMemo(() => createStaticSource([{
      id: 'light',
      label: 'Light'
    }, {
      id: 'dark',
      label: 'Dark'
    }, {
      id: 'system',
      label: 'System'
    }]), []);
    return <>
        <Button label={\`Theme: \${theme}\`} onClick={() => setIsOpen(true)} />
        <CommandPalette isOpen={isOpen} onOpenChange={setIsOpen} searchSource={source} value={theme} onValueChange={v => {
        setTheme(v);
        setIsOpen(false);
      }} renderItem={(item, isSelected) => <span style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        flex: 1
      }}>
              <span style={{
          flex: 1
        }}>{item.label}</span>
              {isSelected && <Icon icon="check" size="sm" />}
            </span>} />
      </>;
  }
}`,...w.parameters?.docs?.source},description:{story:`Selection persists across opens. isSelected passed to renderItem.`,...w.parameters?.docs?.description}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  render: function Render() {
    const [isOpen, setIsOpen] = useState(false);
    const source = useMemo<SearchSource>(() => {
      let controller: AbortController | null = null;
      return {
        cancel() {
          controller?.abort();
        },
        async search(query: string) {
          controller?.abort();
          controller = new AbortController();
          await new Promise(r => setTimeout(r, 400));
          const all = [{
            id: 'readme',
            label: 'README.md'
          }, {
            id: 'package',
            label: 'package.json'
          }, {
            id: 'tsconfig',
            label: 'tsconfig.json'
          }, {
            id: 'index',
            label: 'src/index.ts'
          }, {
            id: 'app',
            label: 'src/App.tsx'
          }];
          return all.filter(f => f.label.toLowerCase().includes(query.toLowerCase()));
        },
        bootstrap() {
          return [];
        }
      };
    }, []);
    return <>
        <Button label="Open File Search" onClick={() => setIsOpen(true)} />
        <CommandPalette isOpen={isOpen} onOpenChange={setIsOpen} searchSource={source} input={<CommandPaletteInput placeholder="Search files..." />} emptyBootstrapText="Type a filename to search" emptySearchText="No files found" />
      </>;
  }
}`,...T.parameters?.docs?.source},description:{story:`Server-side search. Spinner shown while pending. Empty state on no results.`,...T.parameters?.docs?.description}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  render: function Render() {
    const [isOpen, setIsOpen] = useState(false);
    const commands: SearchableItem<{
      aliases?: string[];
    }>[] = [{
      id: 'home',
      label: 'Home'
    }, {
      id: 'dark-mode',
      label: 'Toggle Dark Mode',
      auxiliaryData: {
        aliases: ['theme', 'appearance']
      }
    }, {
      id: 'font-size',
      label: 'Change Font Size',
      auxiliaryData: {
        aliases: ['text', 'zoom']
      }
    }];
    const source = useMemo(() => createStaticSource(commands, {
      keywords: item => item.auxiliaryData?.aliases ?? []
    }), []);
    return <>
        <Button label="Open (try 'theme')" onClick={() => setIsOpen(true)} />
        <CommandPalette isOpen={isOpen} onOpenChange={setIsOpen} searchSource={source} />
      </>;
  }
}`,...E.parameters?.docs?.source},description:{story:`Type "theme" or "appearance" to find "Toggle Dark Mode".`,...E.parameters?.docs?.description}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  render: function Render() {
    const [isOpen, setIsOpen] = useState(false);
    const groups = ['Files', 'Actions', 'Navigation', 'Settings', 'Recent'];
    const items = Array.from({
      length: 50
    }, (_, i) => ({
      id: \`item-\${i}\`,
      label: \`Item \${i + 1}\`,
      auxiliaryData: {
        group: groups[i % groups.length]
      }
    }));
    const source = useMemo(() => createStaticSource(items), []);
    return <>
        <Button label="Open (50 items)" onClick={() => setIsOpen(true)} />
        <CommandPalette isOpen={isOpen} onOpenChange={setIsOpen} searchSource={source} />
      </>;
  }
}`,...D.parameters?.docs?.source},description:{story:`50 items across 5 groups. Verifies the list scrolls within the dialog
rather than expanding it past maxHeight.`,...D.parameters?.docs?.description}}},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
  render: function Render() {
    const [isOpen, setIsOpen] = useState(false);
    const source = useMemo(() => createStaticSource([{
      id: 'home',
      label: 'Home'
    }, {
      id: 'settings',
      label: 'Settings'
    }]), []);
    return <>
        <Button label="Open" onClick={() => setIsOpen(true)} />
        <CommandPalette isOpen={isOpen} onOpenChange={setIsOpen} searchSource={source} footer={<CommandPaletteFooter>
              <span>Pro tip: use ⌘K to open anywhere</span>
            </CommandPaletteFooter>} />
      </>;
  }
}`,...O.parameters?.docs?.source},description:{story:`Replacing the footer with custom content.`,...O.parameters?.docs?.description}}},A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  render: () => <Theme theme={groupHeadingTheme} mode="light">
      <CommandPaletteGroup heading="Suggestions">
        <div>Home</div>
        <div>Settings</div>
        <div>Profile</div>
      </CommandPaletteGroup>
    </Theme>
}`,...A.parameters?.docs?.source}}},j=[`Default`,`AutoGrouped`,`WithRenderItem`,`Picker`,`AsyncSearch`,`WithKeywords`,`ManyItems`,`CustomFooter`,`ThemedGroupHeading`]}))();export{T as AsyncSearch,S as AutoGrouped,O as CustomFooter,x as Default,D as ManyItems,w as Picker,A as ThemedGroupHeading,E as WithKeywords,C as WithRenderItem,j as __namedExportsOrder,b as default};