import{i as e}from"./preload-helper-CT_b8DTk.js";import{t}from"./jsx-runtime-DqZldVDK.js";import{n,t as r}from"./Token-BXBfAklS.js";var i,a,o,s,c,l,u,d,f,p,m,h,g,_;e((()=>{r(),i=t(),a={title:`Core/Token`,component:n,tags:[`autodocs`],argTypes:{color:{control:`select`,options:[`default`,`red`,`orange`,`yellow`,`green`,`teal`,`cyan`,`blue`,`purple`,`pink`,`gray`],description:`Color variant`},size:{control:`radio`,options:[`sm`,`md`,`lg`],description:`Token size`},label:{control:`text`,description:`Token label text`},isDisabled:{control:`boolean`,description:`Whether the token is disabled`},isLabelHidden:{control:`boolean`,description:`Visually hide the label`}}},o={args:{label:`Token`}},s=[`default`,`red`,`orange`,`yellow`,`green`,`teal`,`cyan`,`blue`,`purple`,`pink`,`gray`],c={render:()=>(0,i.jsx)(`div`,{style:{display:`flex`,gap:`8px`,flexWrap:`wrap`},children:s.map(e=>(0,i.jsx)(n,{label:e,color:e},e))})},l={render:()=>(0,i.jsxs)(`div`,{style:{display:`flex`,gap:`8px`,alignItems:`center`},children:[(0,i.jsx)(n,{label:`Star`,icon:(0,i.jsx)(`svg`,{width:`12`,height:`12`,viewBox:`0 0 12 12`,fill:`currentColor`,children:(0,i.jsx)(`path`,{d:`M6 0l1.8 3.6L12 4.2 8.9 7.1l.7 4.1L6 9.2 2.4 11.2l.7-4.1L0 4.2l4.2-.6z`})})}),(0,i.jsx)(n,{label:`Info`,color:`blue`,icon:(0,i.jsxs)(`svg`,{width:`12`,height:`12`,viewBox:`0 0 12 12`,fill:`currentColor`,children:[(0,i.jsx)(`circle`,{cx:`6`,cy:`6`,r:`5`,fill:`none`,stroke:`currentColor`,strokeWidth:`1.5`}),(0,i.jsx)(`text`,{x:`6`,y:`9`,textAnchor:`middle`,fontSize:`8`,fill:`currentColor`,children:`i`})]})})]})},u={render:()=>(0,i.jsxs)(`div`,{style:{display:`flex`,gap:`8px`,alignItems:`center`},children:[(0,i.jsx)(n,{label:`Removable`,onRemove:()=>alert(`Removed!`)}),(0,i.jsx)(n,{label:`Red tag`,color:`red`,onRemove:()=>alert(`Removed!`)}),(0,i.jsx)(n,{label:`Blue tag`,color:`blue`,onRemove:()=>alert(`Removed!`)})]})},d={render:()=>(0,i.jsxs)(`div`,{style:{display:`flex`,gap:`8px`,alignItems:`center`},children:[(0,i.jsx)(n,{label:`Click me`,onClick:()=>alert(`Clicked!`)}),(0,i.jsx)(n,{label:`Green action`,color:`green`,onClick:()=>alert(`Clicked!`)})]})},f={render:()=>(0,i.jsxs)(`div`,{style:{display:`flex`,gap:`8px`,alignItems:`center`},children:[(0,i.jsx)(n,{label:`Link token`,href:`#`}),(0,i.jsx)(n,{label:`Purple link`,color:`purple`,href:`#`})]})},p={render:()=>(0,i.jsxs)(`div`,{style:{display:`flex`,gap:`8px`,alignItems:`center`},children:[(0,i.jsx)(n,{label:`Count`,endContent:(0,i.jsx)(`span`,{style:{fontSize:`10px`,opacity:.7,marginInlineStart:`2px`},children:`(3)`})}),(0,i.jsx)(n,{label:`Status`,color:`green`,endContent:(0,i.jsx)(`span`,{style:{width:`6px`,height:`6px`,borderRadius:`50%`,backgroundColor:`currentColor`,marginInlineStart:`2px`}})})]})},m={render:()=>(0,i.jsxs)(`div`,{style:{display:`flex`,gap:`8px`,alignItems:`center`},children:[(0,i.jsx)(n,{label:`Disabled`,isDisabled:!0}),(0,i.jsx)(n,{label:`Disabled click`,onClick:()=>alert(`Should not fire`),isDisabled:!0}),(0,i.jsx)(n,{label:`Disabled remove`,onRemove:()=>alert(`Should not fire`),isDisabled:!0}),(0,i.jsx)(n,{label:`Disabled link`,href:`#`,isDisabled:!0})]})},h={render:()=>(0,i.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:16},children:[(0,i.jsxs)(`div`,{children:[(0,i.jsx)(`h4`,{style:{margin:`0 0 8px`},children:`Small (20px)`}),(0,i.jsxs)(`div`,{style:{display:`flex`,gap:`8px`,alignItems:`center`},children:[(0,i.jsx)(n,{label:`Small`,size:`sm`}),(0,i.jsx)(n,{label:`Removable`,size:`sm`,onRemove:()=>{}}),(0,i.jsx)(n,{label:`Clickable`,size:`sm`,onClick:()=>{}})]})]}),(0,i.jsxs)(`div`,{children:[(0,i.jsx)(`h4`,{style:{margin:`0 0 8px`},children:`Medium (24px, default)`}),(0,i.jsxs)(`div`,{style:{display:`flex`,gap:`8px`,alignItems:`center`},children:[(0,i.jsx)(n,{label:`Medium`,size:`md`}),(0,i.jsx)(n,{label:`Removable`,size:`md`,onRemove:()=>{}}),(0,i.jsx)(n,{label:`Clickable`,size:`md`,onClick:()=>{}})]})]}),(0,i.jsxs)(`div`,{children:[(0,i.jsx)(`h4`,{style:{margin:`0 0 8px`},children:`Large (28px)`}),(0,i.jsxs)(`div`,{style:{display:`flex`,gap:`8px`,alignItems:`center`},children:[(0,i.jsx)(n,{label:`Large`,size:`lg`}),(0,i.jsx)(n,{label:`Removable`,size:`lg`,onRemove:()=>{}}),(0,i.jsx)(n,{label:`Clickable`,size:`lg`,onClick:()=>{}})]})]})]})},g={render:()=>(0,i.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`16px`},children:[(0,i.jsxs)(`div`,{children:[(0,i.jsx)(`h4`,{style:{margin:`0 0 8px`},children:`Display only`}),(0,i.jsx)(`div`,{style:{display:`flex`,gap:`8px`,flexWrap:`wrap`},children:s.map(e=>(0,i.jsx)(n,{label:e,color:e},e))})]}),(0,i.jsxs)(`div`,{children:[(0,i.jsx)(`h4`,{style:{margin:`0 0 8px`},children:`With remove`}),(0,i.jsx)(`div`,{style:{display:`flex`,gap:`8px`,flexWrap:`wrap`},children:s.map(e=>(0,i.jsx)(n,{label:e,color:e,onRemove:()=>{}},e))})]}),(0,i.jsxs)(`div`,{children:[(0,i.jsx)(`h4`,{style:{margin:`0 0 8px`},children:`Clickable`}),(0,i.jsx)(`div`,{style:{display:`flex`,gap:`8px`,flexWrap:`wrap`},children:s.map(e=>(0,i.jsx)(n,{label:e,color:e,onClick:()=>{}},e))})]}),(0,i.jsxs)(`div`,{children:[(0,i.jsx)(`h4`,{style:{margin:`0 0 8px`},children:`Disabled`}),(0,i.jsx)(`div`,{style:{display:`flex`,gap:`8px`,flexWrap:`wrap`},children:s.map(e=>(0,i.jsx)(n,{label:e,color:e,isDisabled:!0},e))})]})]})},o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Token'
  }
}`,...o.parameters?.docs?.source}}},c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap'
  }}>
      {allColors.map(color => <Token key={color} label={color} color={color} />)}
    </div>
}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'flex',
    gap: '8px',
    alignItems: 'center'
  }}>
      <Token label="Star" icon={<svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
            <path d="M6 0l1.8 3.6L12 4.2 8.9 7.1l.7 4.1L6 9.2 2.4 11.2l.7-4.1L0 4.2l4.2-.6z" />
          </svg>} />
      <Token label="Info" color="blue" icon={<svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
            <circle cx="6" cy="6" r="5" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <text x="6" y="9" textAnchor="middle" fontSize="8" fill="currentColor">
              i
            </text>
          </svg>} />
    </div>
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'flex',
    gap: '8px',
    alignItems: 'center'
  }}>
      <Token label="Removable" onRemove={() => alert('Removed!')} />
      <Token label="Red tag" color="red" onRemove={() => alert('Removed!')} />
      <Token label="Blue tag" color="blue" onRemove={() => alert('Removed!')} />
    </div>
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'flex',
    gap: '8px',
    alignItems: 'center'
  }}>
      <Token label="Click me" onClick={() => alert('Clicked!')} />
      <Token label="Green action" color="green" onClick={() => alert('Clicked!')} />
    </div>
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'flex',
    gap: '8px',
    alignItems: 'center'
  }}>
      <Token label="Link token" href="#" />
      <Token label="Purple link" color="purple" href="#" />
    </div>
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'flex',
    gap: '8px',
    alignItems: 'center'
  }}>
      <Token label="Count" endContent={<span style={{
      fontSize: '10px',
      opacity: 0.7,
      marginInlineStart: '2px'
    }}>
            (3)
          </span>} />
      <Token label="Status" color="green" endContent={<span style={{
      width: '6px',
      height: '6px',
      borderRadius: '50%',
      backgroundColor: 'currentColor',
      marginInlineStart: '2px'
    }} />} />
    </div>
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'flex',
    gap: '8px',
    alignItems: 'center'
  }}>
      <Token label="Disabled" isDisabled />
      <Token label="Disabled click" onClick={() => alert('Should not fire')} isDisabled />
      <Token label="Disabled remove" onRemove={() => alert('Should not fire')} isDisabled />
      <Token label="Disabled link" href="#" isDisabled />
    </div>
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'flex',
    flexDirection: 'column',
    gap: 16
  }}>
      <div>
        <h4 style={{
        margin: '0 0 8px'
      }}>Small (20px)</h4>
        <div style={{
        display: 'flex',
        gap: '8px',
        alignItems: 'center'
      }}>
          <Token label="Small" size="sm" />
          <Token label="Removable" size="sm" onRemove={() => {}} />
          <Token label="Clickable" size="sm" onClick={() => {}} />
        </div>
      </div>
      <div>
        <h4 style={{
        margin: '0 0 8px'
      }}>Medium (24px, default)</h4>
        <div style={{
        display: 'flex',
        gap: '8px',
        alignItems: 'center'
      }}>
          <Token label="Medium" size="md" />
          <Token label="Removable" size="md" onRemove={() => {}} />
          <Token label="Clickable" size="md" onClick={() => {}} />
        </div>
      </div>
      <div>
        <h4 style={{
        margin: '0 0 8px'
      }}>Large (28px)</h4>
        <div style={{
        display: 'flex',
        gap: '8px',
        alignItems: 'center'
      }}>
          <Token label="Large" size="lg" />
          <Token label="Removable" size="lg" onRemove={() => {}} />
          <Token label="Clickable" size="lg" onClick={() => {}} />
        </div>
      </div>
    </div>
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  }}>
      <div>
        <h4 style={{
        margin: '0 0 8px'
      }}>Display only</h4>
        <div style={{
        display: 'flex',
        gap: '8px',
        flexWrap: 'wrap'
      }}>
          {allColors.map(color => <Token key={color} label={color} color={color} />)}
        </div>
      </div>
      <div>
        <h4 style={{
        margin: '0 0 8px'
      }}>With remove</h4>
        <div style={{
        display: 'flex',
        gap: '8px',
        flexWrap: 'wrap'
      }}>
          {allColors.map(color => <Token key={color} label={color} color={color} onRemove={() => {}} />)}
        </div>
      </div>
      <div>
        <h4 style={{
        margin: '0 0 8px'
      }}>Clickable</h4>
        <div style={{
        display: 'flex',
        gap: '8px',
        flexWrap: 'wrap'
      }}>
          {allColors.map(color => <Token key={color} label={color} color={color} onClick={() => {}} />)}
        </div>
      </div>
      <div>
        <h4 style={{
        margin: '0 0 8px'
      }}>Disabled</h4>
        <div style={{
        display: 'flex',
        gap: '8px',
        flexWrap: 'wrap'
      }}>
          {allColors.map(color => <Token key={color} label={color} color={color} isDisabled />)}
        </div>
      </div>
    </div>
}`,...g.parameters?.docs?.source}}},_=[`Default`,`Colors`,`WithIcon`,`WithRemove`,`Clickable`,`AsLink`,`WithEndContent`,`Disabled`,`SizeVariants`,`AllVariations`]}))();export{g as AllVariations,f as AsLink,d as Clickable,c as Colors,o as Default,m as Disabled,h as SizeVariants,p as WithEndContent,l as WithIcon,u as WithRemove,_ as __namedExportsOrder,a as default};