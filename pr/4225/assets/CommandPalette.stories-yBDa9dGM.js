import{i as e,s as t}from"./preload-helper-CT_b8DTk.js";import{t as n}from"./react-B7Te67-h.js";import{t as r}from"./jsx-runtime-DqZldVDK.js";import{t as i}from"./Button-BBk5Kqd0.js";import{t as a}from"./Button-CRpvXAU4.js";import{n as o,t as s}from"./Icon-Csbga5uN.js";import{i as c,t as l}from"./Typeahead-B6-yG42b.js";import{ai as u,ei as d,ri as f,ti as p}from"./iframe-CER2Y08S.js";var m,h,g,_,v,y,b,x,S,C,w,T;e((()=>{m=t(n()),d(),a(),s(),l(),h=r(),g={title:`Core/CommandPalette`,component:p,tags:[`autodocs`]},_={render:function(){let[e,t]=(0,m.useState)(!1),n=(0,m.useMemo)(()=>c([{id:`home`,label:`Home`},{id:`settings`,label:`Settings`},{id:`profile`,label:`Profile`},{id:`dashboard`,label:`Dashboard`},{id:`help`,label:`Help`}]),[]);return(0,h.jsxs)(h.Fragment,{children:[(0,h.jsx)(i,{label:`Open Command Palette`,onClick:()=>t(!0)}),(0,h.jsx)(p,{isOpen:e,onOpenChange:t,searchSource:n})]})}},v={render:function(){let[e,t]=(0,m.useState)(!1),n=(0,m.useMemo)(()=>c([{id:`home`,label:`Home`,auxiliaryData:{group:`Navigation`}},{id:`settings`,label:`Settings`,auxiliaryData:{group:`Navigation`}},{id:`profile`,label:`Profile`,auxiliaryData:{group:`Navigation`}},{id:`new-file`,label:`New File`,auxiliaryData:{group:`Actions`}},{id:`save`,label:`Save`,auxiliaryData:{group:`Actions`}},{id:`export`,label:`Export`,auxiliaryData:{group:`Actions`}}]),[]);return(0,h.jsxs)(h.Fragment,{children:[(0,h.jsx)(i,{label:`Open Grouped`,onClick:()=>t(!0)}),(0,h.jsx)(p,{isOpen:e,onOpenChange:t,searchSource:n})]})}},y={render:function(){let[e,t]=(0,m.useState)(!1),n=[{id:`dashboard`,label:`Go to Dashboard`,auxiliaryData:{icon:`menu`,group:`Navigation`}},{id:`settings`,label:`Open Settings`,auxiliaryData:{icon:`wrench`,group:`Navigation`,shortcut:`⌘,`}},{id:`profile`,label:`View Profile`,auxiliaryData:{icon:`info`,group:`Navigation`}},{id:`dark-mode`,label:`Toggle Dark Mode`,auxiliaryData:{group:`Actions`,keywords:[`theme`,`appearance`]}},{id:`new-file`,label:`Create New File`,auxiliaryData:{group:`Actions`,shortcut:`⌘N`}},{id:`search`,label:`Search Files`,auxiliaryData:{icon:`search`,group:`Actions`,shortcut:`⌘P`}}],r=(0,m.useMemo)(()=>c(n,{keywords:e=>e.auxiliaryData?.keywords??[]}),[]);return(0,h.jsxs)(h.Fragment,{children:[(0,h.jsx)(i,{label:`Open Rich Palette`,onClick:()=>t(!0)}),(0,h.jsx)(p,{isOpen:e,onOpenChange:t,searchSource:r,renderItem:e=>(0,h.jsxs)(`span`,{style:{display:`flex`,alignItems:`center`,gap:8,flex:1},children:[e.auxiliaryData?.icon&&(0,h.jsx)(o,{icon:e.auxiliaryData.icon,size:`sm`}),(0,h.jsx)(`span`,{style:{flex:1},children:e.label}),e.auxiliaryData?.shortcut&&(0,h.jsx)(`span`,{style:{fontSize:12,opacity:.5},children:e.auxiliaryData.shortcut})]})})]})}},b={render:function(){let[e,t]=(0,m.useState)(!1),[n,r]=(0,m.useState)(`light`),a=(0,m.useMemo)(()=>c([{id:`light`,label:`Light`},{id:`dark`,label:`Dark`},{id:`system`,label:`System`}]),[]);return(0,h.jsxs)(h.Fragment,{children:[(0,h.jsx)(i,{label:`Theme: ${n}`,onClick:()=>t(!0)}),(0,h.jsx)(p,{isOpen:e,onOpenChange:t,searchSource:a,value:n,onValueChange:e=>{r(e),t(!1)},renderItem:(e,t)=>(0,h.jsxs)(`span`,{style:{display:`flex`,alignItems:`center`,gap:8,flex:1},children:[(0,h.jsx)(`span`,{style:{flex:1},children:e.label}),t&&(0,h.jsx)(o,{icon:`check`,size:`sm`})]})})]})}},x={render:function(){let[e,t]=(0,m.useState)(!1),n=(0,m.useMemo)(()=>{let e=null;return{cancel(){e?.abort()},async search(t){return e?.abort(),e=new AbortController,await new Promise(e=>setTimeout(e,400)),[{id:`readme`,label:`README.md`},{id:`package`,label:`package.json`},{id:`tsconfig`,label:`tsconfig.json`},{id:`index`,label:`src/index.ts`},{id:`app`,label:`src/App.tsx`}].filter(e=>e.label.toLowerCase().includes(t.toLowerCase()))},bootstrap(){return[]}}},[]);return(0,h.jsxs)(h.Fragment,{children:[(0,h.jsx)(i,{label:`Open File Search`,onClick:()=>t(!0)}),(0,h.jsx)(p,{isOpen:e,onOpenChange:t,searchSource:n,input:(0,h.jsx)(u,{placeholder:`Search files...`}),emptyBootstrapText:`Type a filename to search`,emptySearchText:`No files found`})]})}},S={render:function(){let[e,t]=(0,m.useState)(!1),n=[{id:`home`,label:`Home`},{id:`dark-mode`,label:`Toggle Dark Mode`,auxiliaryData:{aliases:[`theme`,`appearance`]}},{id:`font-size`,label:`Change Font Size`,auxiliaryData:{aliases:[`text`,`zoom`]}}],r=(0,m.useMemo)(()=>c(n,{keywords:e=>e.auxiliaryData?.aliases??[]}),[]);return(0,h.jsxs)(h.Fragment,{children:[(0,h.jsx)(i,{label:`Open (try 'theme')`,onClick:()=>t(!0)}),(0,h.jsx)(p,{isOpen:e,onOpenChange:t,searchSource:r})]})}},C={render:function(){let[e,t]=(0,m.useState)(!1),n=[`Files`,`Actions`,`Navigation`,`Settings`,`Recent`],r=Array.from({length:50},(e,t)=>({id:`item-${t}`,label:`Item ${t+1}`,auxiliaryData:{group:n[t%n.length]}})),a=(0,m.useMemo)(()=>c(r),[]);return(0,h.jsxs)(h.Fragment,{children:[(0,h.jsx)(i,{label:`Open (50 items)`,onClick:()=>t(!0)}),(0,h.jsx)(p,{isOpen:e,onOpenChange:t,searchSource:a})]})}},w={render:function(){let[e,t]=(0,m.useState)(!1),n=(0,m.useMemo)(()=>c([{id:`home`,label:`Home`},{id:`settings`,label:`Settings`}]),[]);return(0,h.jsxs)(h.Fragment,{children:[(0,h.jsx)(i,{label:`Open`,onClick:()=>t(!0)}),(0,h.jsx)(p,{isOpen:e,onOpenChange:t,searchSource:n,footer:(0,h.jsx)(f,{children:(0,h.jsx)(`span`,{children:`Pro tip: use ⌘K to open anywhere`})})})]})}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
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
}`,..._.parameters?.docs?.source},description:{story:`Simplest case — no input/footer/renderItem needed.`,..._.parameters?.docs?.description}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
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
}`,...v.parameters?.docs?.source},description:{story:`Groups detected automatically from auxiliaryData.group. No custom rendering needed.`,...v.parameters?.docs?.description}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
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
}`,...y.parameters?.docs?.source},description:{story:`Custom item content via renderItem — icons and shortcuts.
Grouping remains automatic via auxiliaryData.group.`,...y.parameters?.docs?.description}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
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
}`,...b.parameters?.docs?.source},description:{story:`Selection persists across opens. isSelected passed to renderItem.`,...b.parameters?.docs?.description}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
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
}`,...x.parameters?.docs?.source},description:{story:`Server-side search. Spinner shown while pending. Empty state on no results.`,...x.parameters?.docs?.description}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
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
}`,...S.parameters?.docs?.source},description:{story:`Type "theme" or "appearance" to find "Toggle Dark Mode".`,...S.parameters?.docs?.description}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
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
}`,...C.parameters?.docs?.source},description:{story:`50 items across 5 groups. Verifies the list scrolls within the dialog
rather than expanding it past maxHeight.`,...C.parameters?.docs?.description}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
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
}`,...w.parameters?.docs?.source},description:{story:`Replacing the footer with custom content.`,...w.parameters?.docs?.description}}},T=[`Default`,`AutoGrouped`,`WithRenderItem`,`Picker`,`AsyncSearch`,`WithKeywords`,`ManyItems`,`CustomFooter`]}))();export{x as AsyncSearch,v as AutoGrouped,w as CustomFooter,_ as Default,C as ManyItems,b as Picker,S as WithKeywords,y as WithRenderItem,T as __namedExportsOrder,g as default};