import{a1 as e}from"./iframe-VDTgZ3S9.js";import{T as l}from"./Token-m8dAjM-U.js";import"./preload-helper-Ct5FWWRu.js";import"./useInteractiveRole-C00AO_ET.js";const h={title:"Core/Token",component:l,tags:["autodocs"],argTypes:{color:{control:"select",options:["default","red","orange","yellow","green","teal","cyan","blue","purple","pink","gray"],description:"Color variant"},size:{control:"radio",options:["sm","md","lg"],description:"Token size"},label:{control:"text",description:"Token label text"},isDisabled:{control:"boolean",description:"Whether the token is disabled"},isLabelHidden:{control:"boolean",description:"Visually hide the label"}}},s={args:{label:"Token"}},a=["default","red","orange","yellow","green","teal","cyan","blue","purple","pink","gray"],i={render:()=>e.jsx("div",{style:{display:"flex",gap:"8px",flexWrap:"wrap"},children:a.map(r=>e.jsx(l,{label:r,color:r},r))})},n={render:()=>e.jsxs("div",{style:{display:"flex",gap:"8px",alignItems:"center"},children:[e.jsx(l,{label:"Star",icon:e.jsx("svg",{width:"12",height:"12",viewBox:"0 0 12 12",fill:"currentColor",children:e.jsx("path",{d:"M6 0l1.8 3.6L12 4.2 8.9 7.1l.7 4.1L6 9.2 2.4 11.2l.7-4.1L0 4.2l4.2-.6z"})})}),e.jsx(l,{label:"Info",color:"blue",icon:e.jsxs("svg",{width:"12",height:"12",viewBox:"0 0 12 12",fill:"currentColor",children:[e.jsx("circle",{cx:"6",cy:"6",r:"5",fill:"none",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("text",{x:"6",y:"9",textAnchor:"middle",fontSize:"8",fill:"currentColor",children:"i"})]})})]})},o={render:()=>e.jsxs("div",{style:{display:"flex",gap:"8px",alignItems:"center"},children:[e.jsx(l,{label:"Removable",onRemove:()=>alert("Removed!")}),e.jsx(l,{label:"Red tag",color:"red",onRemove:()=>alert("Removed!")}),e.jsx(l,{label:"Blue tag",color:"blue",onRemove:()=>alert("Removed!")})]})},t={render:()=>e.jsxs("div",{style:{display:"flex",gap:"8px",alignItems:"center"},children:[e.jsx(l,{label:"Click me",onClick:()=>alert("Clicked!")}),e.jsx(l,{label:"Green action",color:"green",onClick:()=>alert("Clicked!")})]})},d={render:()=>e.jsxs("div",{style:{display:"flex",gap:"8px",alignItems:"center"},children:[e.jsx(l,{label:"Link token",href:"#"}),e.jsx(l,{label:"Purple link",color:"purple",href:"#"})]})},c={render:()=>e.jsxs("div",{style:{display:"flex",gap:"8px",alignItems:"center"},children:[e.jsx(l,{label:"Count",endContent:e.jsx("span",{style:{fontSize:"10px",opacity:.7,marginInlineStart:"2px"},children:"(3)"})}),e.jsx(l,{label:"Status",color:"green",endContent:e.jsx("span",{style:{width:"6px",height:"6px",borderRadius:"50%",backgroundColor:"currentColor",marginInlineStart:"2px"}})})]})},p={render:()=>e.jsxs("div",{style:{display:"flex",gap:"8px",alignItems:"center"},children:[e.jsx(l,{label:"Disabled",isDisabled:!0}),e.jsx(l,{label:"Disabled click",onClick:()=>alert("Should not fire"),isDisabled:!0}),e.jsx(l,{label:"Disabled remove",onRemove:()=>alert("Should not fire"),isDisabled:!0}),e.jsx(l,{label:"Disabled link",href:"#",isDisabled:!0})]})},x={render:()=>e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:16},children:[e.jsxs("div",{children:[e.jsx("h4",{style:{margin:"0 0 8px"},children:"Small (20px)"}),e.jsxs("div",{style:{display:"flex",gap:"8px",alignItems:"center"},children:[e.jsx(l,{label:"Small",size:"sm"}),e.jsx(l,{label:"Removable",size:"sm",onRemove:()=>{}}),e.jsx(l,{label:"Clickable",size:"sm",onClick:()=>{}})]})]}),e.jsxs("div",{children:[e.jsx("h4",{style:{margin:"0 0 8px"},children:"Medium (24px, default)"}),e.jsxs("div",{style:{display:"flex",gap:"8px",alignItems:"center"},children:[e.jsx(l,{label:"Medium",size:"md"}),e.jsx(l,{label:"Removable",size:"md",onRemove:()=>{}}),e.jsx(l,{label:"Clickable",size:"md",onClick:()=>{}})]})]}),e.jsxs("div",{children:[e.jsx("h4",{style:{margin:"0 0 8px"},children:"Large (28px)"}),e.jsxs("div",{style:{display:"flex",gap:"8px",alignItems:"center"},children:[e.jsx(l,{label:"Large",size:"lg"}),e.jsx(l,{label:"Removable",size:"lg",onRemove:()=>{}}),e.jsx(l,{label:"Clickable",size:"lg",onClick:()=>{}})]})]})]})},m={render:()=>e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"16px"},children:[e.jsxs("div",{children:[e.jsx("h4",{style:{margin:"0 0 8px"},children:"Display only"}),e.jsx("div",{style:{display:"flex",gap:"8px",flexWrap:"wrap"},children:a.map(r=>e.jsx(l,{label:r,color:r},r))})]}),e.jsxs("div",{children:[e.jsx("h4",{style:{margin:"0 0 8px"},children:"With remove"}),e.jsx("div",{style:{display:"flex",gap:"8px",flexWrap:"wrap"},children:a.map(r=>e.jsx(l,{label:r,color:r,onRemove:()=>{}},r))})]}),e.jsxs("div",{children:[e.jsx("h4",{style:{margin:"0 0 8px"},children:"Clickable"}),e.jsx("div",{style:{display:"flex",gap:"8px",flexWrap:"wrap"},children:a.map(r=>e.jsx(l,{label:r,color:r,onClick:()=>{}},r))})]}),e.jsxs("div",{children:[e.jsx("h4",{style:{margin:"0 0 8px"},children:"Disabled"}),e.jsx("div",{style:{display:"flex",gap:"8px",flexWrap:"wrap"},children:a.map(r=>e.jsx(l,{label:r,color:r,isDisabled:!0},r))})]})]})};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Token'
  }
}`,...s.parameters?.docs?.source}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap'
  }}>
      {allColors.map(color => <Token key={color} label={color} color={color} />)}
    </div>
}`,...i.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
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
}`,...n.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'flex',
    gap: '8px',
    alignItems: 'center'
  }}>
      <Token label="Removable" onRemove={() => alert('Removed!')} />
      <Token label="Red tag" color="red" onRemove={() => alert('Removed!')} />
      <Token label="Blue tag" color="blue" onRemove={() => alert('Removed!')} />
    </div>
}`,...o.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'flex',
    gap: '8px',
    alignItems: 'center'
  }}>
      <Token label="Click me" onClick={() => alert('Clicked!')} />
      <Token label="Green action" color="green" onClick={() => alert('Clicked!')} />
    </div>
}`,...t.parameters?.docs?.source}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'flex',
    gap: '8px',
    alignItems: 'center'
  }}>
      <Token label="Link token" href="#" />
      <Token label="Purple link" color="purple" href="#" />
    </div>
}`,...d.parameters?.docs?.source}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
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
}`,...c.parameters?.docs?.source}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
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
}`,...p.parameters?.docs?.source}}};x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
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
}`,...x.parameters?.docs?.source}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
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
}`,...m.parameters?.docs?.source}}};const k=["Default","Colors","WithIcon","WithRemove","Clickable","AsLink","WithEndContent","Disabled","SizeVariants","AllVariations"];export{m as AllVariations,d as AsLink,t as Clickable,i as Colors,s as Default,p as Disabled,x as SizeVariants,c as WithEndContent,n as WithIcon,o as WithRemove,k as __namedExportsOrder,h as default};
