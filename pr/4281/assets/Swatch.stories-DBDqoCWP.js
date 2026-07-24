import{i as e}from"./preload-helper-CT_b8DTk.js";import{t}from"./jsx-runtime-DqZldVDK.js";import{I as n,t as r}from"./src-hqqa6y1Z.js";var i,a,o,s,c,l;e((()=>{r(),i=t(),a={title:`Charts/Chrome/Swatch`,component:n,argTypes:{color:{control:`color`},variant:{control:`inline-radio`,options:[`square`,`line`]}},args:{color:`#3b82f6`,variant:`square`}},o=[`#3b82f6`,`#eb6e00`,`#6b1efd`,`#0b991f`,`#f351c0`,`#f5394f`],s={render:()=>(0,i.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:12},children:[(0,i.jsx)(`div`,{style:{display:`flex`,gap:12,alignItems:`center`},children:o.map(e=>(0,i.jsx)(n,{color:e,variant:`square`},`sq-${e}`))}),(0,i.jsx)(`div`,{style:{display:`flex`,gap:12,alignItems:`center`},children:o.map(e=>(0,i.jsx)(n,{color:e,variant:`line`},`ln-${e}`))})]})},c={},s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'flex',
    flexDirection: 'column',
    gap: 12
  }}>
      <div style={{
      display: 'flex',
      gap: 12,
      alignItems: 'center'
    }}>
        {COLORS.map(c => <ChartSwatch key={\`sq-\${c}\`} color={c} variant="square" />)}
      </div>
      <div style={{
      display: 'flex',
      gap: 12,
      alignItems: 'center'
    }}>
        {COLORS.map(c => <ChartSwatch key={\`ln-\${c}\`} color={c} variant="line" />)}
      </div>
    </div>
}`,...s.parameters?.docs?.source},description:{story:"The color swatch primitive — `square` for bar series, `line` for others.",...s.parameters?.docs?.description}}},c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{}`,...c.parameters?.docs?.source},description:{story:`Interactive single swatch.`,...c.parameters?.docs?.description}}},l=[`Gallery`,`Playground`]}))();export{s as Gallery,c as Playground,l as __namedExportsOrder,a as default};