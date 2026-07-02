import{a1 as e,T as t}from"./iframe-CF49Wwf0.js";import{K as s}from"./Kbd-MC95_za9.js";import"./preload-helper-Ct5FWWRu.js";const m={title:"Core/Kbd",component:s,tags:["autodocs"],argTypes:{keys:{control:"text",description:'Keyboard shortcut string. Use "+" to separate keys. Special keys: mod, ctrl, alt, shift, enter, backspace, escape, tab, up, down, left, right.'}}},d={args:{keys:"k"}},l={render:()=>e.jsxs("div",{style:{display:"flex",gap:"16px",alignItems:"center"},children:[e.jsx(s,{keys:"mod+k"}),e.jsx(s,{keys:"shift+enter"}),e.jsx(s,{keys:"ctrl+c"}),e.jsx(s,{keys:"alt+tab"})]})},i={render:()=>e.jsxs("div",{style:{display:"flex",gap:"16px",alignItems:"center"},children:[e.jsx(s,{keys:"mod+shift+z"}),e.jsx(s,{keys:"ctrl+alt+delete"}),e.jsx(s,{keys:"mod+shift+p"})]})},p={render:()=>e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"12px"},children:[e.jsxs("div",{style:{display:"flex",gap:"16px",alignItems:"center"},children:[e.jsx(t,{type:"label",style:{width:"100px"},children:"Escape:"}),e.jsx(s,{keys:"escape"})]}),e.jsxs("div",{style:{display:"flex",gap:"16px",alignItems:"center"},children:[e.jsx(t,{type:"label",style:{width:"100px"},children:"Enter:"}),e.jsx(s,{keys:"enter"})]}),e.jsxs("div",{style:{display:"flex",gap:"16px",alignItems:"center"},children:[e.jsx(t,{type:"label",style:{width:"100px"},children:"Backspace:"}),e.jsx(s,{keys:"backspace"})]}),e.jsxs("div",{style:{display:"flex",gap:"16px",alignItems:"center"},children:[e.jsx(t,{type:"label",style:{width:"100px"},children:"Tab:"}),e.jsx(s,{keys:"tab"})]}),e.jsxs("div",{style:{display:"flex",gap:"16px",alignItems:"center"},children:[e.jsx(t,{type:"label",style:{width:"100px"},children:"Space:"}),e.jsx(s,{keys:"space"})]}),e.jsxs("div",{style:{display:"flex",gap:"16px",alignItems:"center"},children:[e.jsx(t,{type:"label",style:{width:"100px"},children:"Arrow Keys:"}),e.jsx(s,{keys:"up"}),e.jsx(s,{keys:"down"}),e.jsx(s,{keys:"left"}),e.jsx(s,{keys:"right"})]})]})},a={render:()=>e.jsxs("div",{style:{display:"flex",gap:"8px",alignItems:"center"},children:[e.jsx(s,{keys:"a"}),e.jsx(s,{keys:"b"}),e.jsx(s,{keys:"c"}),e.jsx(s,{keys:"x"}),e.jsx(s,{keys:"y"}),e.jsx(s,{keys:"z"})]})},r={render:()=>e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"12px"},children:[e.jsxs("div",{style:{display:"flex",gap:"16px",alignItems:"center"},children:[e.jsx(t,{type:"label",style:{width:"120px"},children:"Cmd (mod):"}),e.jsx(s,{keys:"mod"}),e.jsx(t,{type:"supporting",children:"⌘"})]}),e.jsxs("div",{style:{display:"flex",gap:"16px",alignItems:"center"},children:[e.jsx(t,{type:"label",style:{width:"120px"},children:"Ctrl:"}),e.jsx(s,{keys:"ctrl"}),e.jsx(t,{type:"supporting",children:"⌃"})]}),e.jsxs("div",{style:{display:"flex",gap:"16px",alignItems:"center"},children:[e.jsx(t,{type:"label",style:{width:"120px"},children:"Alt/Option:"}),e.jsx(s,{keys:"alt"}),e.jsx(t,{type:"supporting",children:"⌥"})]}),e.jsxs("div",{style:{display:"flex",gap:"16px",alignItems:"center"},children:[e.jsx(t,{type:"label",style:{width:"120px"},children:"Shift:"}),e.jsx(s,{keys:"shift"}),e.jsx(t,{type:"supporting",children:"⇧"})]})]})},y={render:()=>e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"12px"},children:[e.jsxs(t,{type:"body",children:["Press ",e.jsx(s,{keys:"mod+k"})," to open the command palette."]}),e.jsxs(t,{type:"body",children:["Use ",e.jsx(s,{keys:"mod+shift+p"})," to access all commands."]}),e.jsxs(t,{type:"body",children:["Press ",e.jsx(s,{keys:"escape"})," to close the dialog."]}),e.jsxs(t,{type:"body",children:["Navigate with ",e.jsx(s,{keys:"up"})," and ",e.jsx(s,{keys:"down"})," arrow keys, then press ",e.jsx(s,{keys:"enter"})," to select."]})]})},n={render:()=>e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"4px",padding:"8px",border:"1px solid #e0e0e0",borderRadius:"8px",width:"250px"},children:[e.jsxs("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px"},children:[e.jsx(t,{type:"body",children:"Cut"}),e.jsx(s,{keys:"mod+x"})]}),e.jsxs("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px"},children:[e.jsx(t,{type:"body",children:"Copy"}),e.jsx(s,{keys:"mod+c"})]}),e.jsxs("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px"},children:[e.jsx(t,{type:"body",children:"Paste"}),e.jsx(s,{keys:"mod+v"})]}),e.jsxs("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px"},children:[e.jsx(t,{type:"body",children:"Undo"}),e.jsx(s,{keys:"mod+z"})]}),e.jsxs("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px"},children:[e.jsx(t,{type:"body",children:"Redo"}),e.jsx(s,{keys:"mod+shift+z"})]})]})};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    keys: 'k'
  }
}`,...d.parameters?.docs?.source}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'flex',
    gap: '16px',
    alignItems: 'center'
  }}>
      <Kbd keys="mod+k" />
      <Kbd keys="shift+enter" />
      <Kbd keys="ctrl+c" />
      <Kbd keys="alt+tab" />
    </div>
}`,...l.parameters?.docs?.source}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'flex',
    gap: '16px',
    alignItems: 'center'
  }}>
      <Kbd keys="mod+shift+z" />
      <Kbd keys="ctrl+alt+delete" />
      <Kbd keys="mod+shift+p" />
    </div>
}`,...i.parameters?.docs?.source}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  }}>
      <div style={{
      display: 'flex',
      gap: '16px',
      alignItems: 'center'
    }}>
        <Text type="label" style={{
        width: '100px'
      }}>
          Escape:
        </Text>
        <Kbd keys="escape" />
      </div>
      <div style={{
      display: 'flex',
      gap: '16px',
      alignItems: 'center'
    }}>
        <Text type="label" style={{
        width: '100px'
      }}>
          Enter:
        </Text>
        <Kbd keys="enter" />
      </div>
      <div style={{
      display: 'flex',
      gap: '16px',
      alignItems: 'center'
    }}>
        <Text type="label" style={{
        width: '100px'
      }}>
          Backspace:
        </Text>
        <Kbd keys="backspace" />
      </div>
      <div style={{
      display: 'flex',
      gap: '16px',
      alignItems: 'center'
    }}>
        <Text type="label" style={{
        width: '100px'
      }}>
          Tab:
        </Text>
        <Kbd keys="tab" />
      </div>
      <div style={{
      display: 'flex',
      gap: '16px',
      alignItems: 'center'
    }}>
        <Text type="label" style={{
        width: '100px'
      }}>
          Space:
        </Text>
        <Kbd keys="space" />
      </div>
      <div style={{
      display: 'flex',
      gap: '16px',
      alignItems: 'center'
    }}>
        <Text type="label" style={{
        width: '100px'
      }}>
          Arrow Keys:
        </Text>
        <Kbd keys="up" />
        <Kbd keys="down" />
        <Kbd keys="left" />
        <Kbd keys="right" />
      </div>
    </div>
}`,...p.parameters?.docs?.source}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'flex',
    gap: '8px',
    alignItems: 'center'
  }}>
      <Kbd keys="a" />
      <Kbd keys="b" />
      <Kbd keys="c" />
      <Kbd keys="x" />
      <Kbd keys="y" />
      <Kbd keys="z" />
    </div>
}`,...a.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  }}>
      <div style={{
      display: 'flex',
      gap: '16px',
      alignItems: 'center'
    }}>
        <Text type="label" style={{
        width: '120px'
      }}>
          Cmd (mod):
        </Text>
        <Kbd keys="mod" />
        <Text type="supporting">⌘</Text>
      </div>
      <div style={{
      display: 'flex',
      gap: '16px',
      alignItems: 'center'
    }}>
        <Text type="label" style={{
        width: '120px'
      }}>
          Ctrl:
        </Text>
        <Kbd keys="ctrl" />
        <Text type="supporting">⌃</Text>
      </div>
      <div style={{
      display: 'flex',
      gap: '16px',
      alignItems: 'center'
    }}>
        <Text type="label" style={{
        width: '120px'
      }}>
          Alt/Option:
        </Text>
        <Kbd keys="alt" />
        <Text type="supporting">⌥</Text>
      </div>
      <div style={{
      display: 'flex',
      gap: '16px',
      alignItems: 'center'
    }}>
        <Text type="label" style={{
        width: '120px'
      }}>
          Shift:
        </Text>
        <Kbd keys="shift" />
        <Text type="supporting">⇧</Text>
      </div>
    </div>
}`,...r.parameters?.docs?.source}}};y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  }}>
      <Text type="body">
        Press <Kbd keys="mod+k" /> to open the command palette.
      </Text>
      <Text type="body">
        Use <Kbd keys="mod+shift+p" /> to access all commands.
      </Text>
      <Text type="body">
        Press <Kbd keys="escape" /> to close the dialog.
      </Text>
      <Text type="body">
        Navigate with <Kbd keys="up" /> and <Kbd keys="down" /> arrow
        keys, then press <Kbd keys="enter" /> to select.
      </Text>
    </div>
}`,...y.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    padding: '8px',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    width: '250px'
  }}>
      <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '8px'
    }}>
        <Text type="body">Cut</Text>
        <Kbd keys="mod+x" />
      </div>
      <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '8px'
    }}>
        <Text type="body">Copy</Text>
        <Kbd keys="mod+c" />
      </div>
      <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '8px'
    }}>
        <Text type="body">Paste</Text>
        <Kbd keys="mod+v" />
      </div>
      <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '8px'
    }}>
        <Text type="body">Undo</Text>
        <Kbd keys="mod+z" />
      </div>
      <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '8px'
    }}>
        <Text type="body">Redo</Text>
        <Kbd keys="mod+shift+z" />
      </div>
    </div>
}`,...n.parameters?.docs?.source}}};const g=["Default","ModifierCombinations","MultipleModifiers","SpecialKeys","SingleLetterKeys","AllModifierSymbols","InlineWithText","MenuShortcuts"];export{r as AllModifierSymbols,d as Default,y as InlineWithText,n as MenuShortcuts,l as ModifierCombinations,i as MultipleModifiers,a as SingleLetterKeys,p as SpecialKeys,g as __namedExportsOrder,m as default};
