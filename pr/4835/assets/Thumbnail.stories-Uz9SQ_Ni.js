import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{t}from"./react-BZJXY1be.js";import{t as n}from"./jsx-runtime-DeHZSEgm.js";import{n as r,t as i}from"./Thumbnail-CvgVUpwg.js";var a,o,s,c,l,u,d,f,p,m,h,g,_,v,y,b,x,S,C,w;function T(){return(T=e((()=>{a=t(),r(),o=n(),s={title:`Core/Thumbnail`,component:i,tags:[`autodocs`],argTypes:{src:{control:`text`,description:`Image source URL`},alt:{control:`text`,description:`Alt text for the image`},label:{control:`text`,description:`Label below the thumbnail`},isDisabled:{control:`boolean`,description:`Whether the thumbnail is disabled`},showRemoveOn:{control:`inline-radio`,options:[`always`,`hover`],description:`When the remove button is visible`}}},c=`https://picsum.photos/id/1042/200/200`,l=`https://picsum.photos/id/1043/200/200`,u=`https://picsum.photos/id/1044/200/200`,d=`https://picsum.photos/id/1047/200/200`,f={args:{src:l,alt:`Sample image`}},p={args:{src:u,alt:`Vacation photo`,label:`vacation.jpg`}},m={render:()=>{let[e,t]=(0,a.useState)(!0);return e?(0,o.jsx)(i,{src:l,alt:`Removable thumbnail`,label:`photo.png`,showRemoveOn:`always`,onRemove:()=>t(!1)}):(0,o.jsxs)(`p`,{style:{color:`#888`,fontSize:12},children:[`Removed. `,(0,o.jsx)(`button`,{onClick:()=>t(!0),children:`Undo`})]})}},h={name:`Remove on hover`,render:()=>{let e=[{id:1,src:l,label:`light.jpg`,alt:`Light image`},{id:2,src:u,label:`warm.jpg`,alt:`Warm tones`},{id:3,src:d,label:`mixed.jpg`,alt:`Mixed tones`}],[t,n]=(0,a.useState)(e);return(0,o.jsxs)(`div`,{children:[(0,o.jsx)(`p`,{style:{fontSize:12,color:`#888`,marginBottom:8},children:`Remove button is hidden until you hover the thumbnail (or focus it with the keyboard).`}),(0,o.jsxs)(`div`,{style:{display:`flex`,gap:8,alignItems:`flex-start`},children:[t.map(e=>(0,o.jsx)(i,{src:e.src,alt:e.alt,label:e.label,showRemoveOn:`hover`,onRemove:()=>n(t=>t.filter(t=>t.id!==e.id))},e.id)),t.length===0&&(0,o.jsxs)(`p`,{style:{color:`#888`,fontSize:12},children:[`All removed.`,` `,(0,o.jsx)(`button`,{onClick:()=>n(e),children:`Reset`})]})]})]})}},g={render:()=>{let[e,t]=(0,a.useState)(!0);return e?(0,o.jsx)(i,{src:u,alt:`Photo with metadata`,label:`screenshot.png`,showRemoveOn:`always`,onRemove:()=>t(!1)}):(0,o.jsxs)(`p`,{style:{color:`#888`,fontSize:12},children:[`Removed. `,(0,o.jsx)(`button`,{onClick:()=>t(!0),children:`Undo`})]})}},_={args:{src:d,alt:`Clickable thumbnail`,onClick:()=>alert(`Clicked!`),label:`preview.jpg`}},v={name:`Loading (no preview)`,args:{isLoading:!0,label:`uploading.jpg`}},y={name:`Uploading (with preview)`,args:{src:u,alt:`Uploading preview`,isLoading:!0,label:`vacation.jpg`}},b={name:`No Image (Placeholder)`,render:()=>{let[e,t]=(0,a.useState)(!0);return e?(0,o.jsx)(i,{label:`report.pdf`,showRemoveOn:`always`,onRemove:()=>t(!1)}):(0,o.jsxs)(`p`,{style:{color:`#888`,fontSize:12},children:[`Removed. `,(0,o.jsx)(`button`,{onClick:()=>t(!0),children:`Undo`})]})}},x={args:{src:l,alt:`Disabled thumbnail`,label:`locked.jpg`,onRemove:()=>{},isDisabled:!0}},S={name:`Media Mode (dark vs light images)`,render:function(){let e=[{src:c,label:`dark.jpg`,alt:`Dark image`},{src:l,label:`light.jpg`,alt:`Light image`},{src:d,label:`mixed.jpg`,alt:`Mixed tones`},{src:u,label:`warm.jpg`,alt:`Warm tones`}],[t,n]=(0,a.useState)(e);return(0,o.jsxs)(`div`,{children:[(0,o.jsx)(`p`,{style:{fontSize:12,color:`#888`,marginBottom:8},children:`Remove buttons should adapt: light icon on dark images, dark icon on light images.`}),(0,o.jsxs)(`div`,{style:{display:`flex`,gap:8,alignItems:`flex-start`},children:[t.map(e=>(0,o.jsx)(i,{src:e.src,alt:e.alt,label:e.label,showRemoveOn:`always`,onRemove:()=>n(t=>t.filter(t=>t.label!==e.label))},e.label)),t.length===0&&(0,o.jsxs)(`p`,{style:{color:`#888`,fontSize:12},children:[`All removed.`,` `,(0,o.jsx)(`button`,{onClick:()=>n(e),children:`Reset`})]})]})]})}},C={render:function(){let e=[{id:1,src:c,label:`dark.jpg`},{id:2,src:l,label:`light.jpg`},{id:4,src:u,label:`warm.jpg`}],[t,n]=(0,a.useState)(e);return(0,o.jsxs)(`div`,{style:{display:`flex`,gap:8,alignItems:`flex-start`},children:[t.map(e=>(0,o.jsx)(i,{src:e.src,alt:e.label,label:e.label,showRemoveOn:`always`,onRemove:()=>n(t=>t.filter(t=>t.id!==e.id))},e.id)),t.length===0&&(0,o.jsxs)(`p`,{style:{color:`#888`,fontSize:12},children:[`All removed.`,` `,(0,o.jsx)(`button`,{onClick:()=>n(e),children:`Reset`})]})]})}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    src: LIGHT_IMAGE,
    alt: 'Sample image'
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    src: WARM_IMAGE,
    alt: 'Vacation photo',
    label: 'vacation.jpg'
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [visible, setVisible] = useState(true);
    if (!visible) {
      return <p style={{
        color: '#888',
        fontSize: 12
      }}>
          Removed. <button onClick={() => setVisible(true)}>Undo</button>
        </p>;
    }
    return <Thumbnail src={LIGHT_IMAGE} alt="Removable thumbnail" label="photo.png" showRemoveOn="always" onRemove={() => setVisible(false)} />;
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  name: 'Remove on hover',
  render: () => {
    const initial = [{
      id: 1,
      src: LIGHT_IMAGE,
      label: 'light.jpg',
      alt: 'Light image'
    }, {
      id: 2,
      src: WARM_IMAGE,
      label: 'warm.jpg',
      alt: 'Warm tones'
    }, {
      id: 3,
      src: MIXED_IMAGE,
      label: 'mixed.jpg',
      alt: 'Mixed tones'
    }];
    const [items, setItems] = useState(initial);
    return <div>
        <p style={{
        fontSize: 12,
        color: '#888',
        marginBottom: 8
      }}>
          Remove button is hidden until you hover the thumbnail (or focus it
          with the keyboard).
        </p>
        <div style={{
        display: 'flex',
        gap: 8,
        alignItems: 'flex-start'
      }}>
          {items.map(item => <Thumbnail key={item.id} src={item.src} alt={item.alt} label={item.label} showRemoveOn="hover" onRemove={() => setItems(prev => prev.filter(i => i.id !== item.id))} />)}
          {items.length === 0 && <p style={{
          color: '#888',
          fontSize: 12
        }}>
              All removed.{' '}
              <button onClick={() => setItems(initial)}>Reset</button>
            </p>}
        </div>
      </div>;
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [visible, setVisible] = useState(true);
    if (!visible) {
      return <p style={{
        color: '#888',
        fontSize: 12
      }}>
          Removed. <button onClick={() => setVisible(true)}>Undo</button>
        </p>;
    }
    return <Thumbnail src={WARM_IMAGE} alt="Photo with metadata" label="screenshot.png" showRemoveOn="always" onRemove={() => setVisible(false)} />;
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: {
    src: MIXED_IMAGE,
    alt: 'Clickable thumbnail',
    onClick: () => alert('Clicked!'),
    label: 'preview.jpg'
  }
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  name: 'Loading (no preview)',
  args: {
    isLoading: true,
    label: 'uploading.jpg'
  }
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  name: 'Uploading (with preview)',
  args: {
    src: WARM_IMAGE,
    alt: 'Uploading preview',
    isLoading: true,
    label: 'vacation.jpg'
  }
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  name: 'No Image (Placeholder)',
  render: () => {
    const [visible, setVisible] = useState(true);
    if (!visible) {
      return <p style={{
        color: '#888',
        fontSize: 12
      }}>
          Removed. <button onClick={() => setVisible(true)}>Undo</button>
        </p>;
    }
    return <Thumbnail label="report.pdf" showRemoveOn="always" onRemove={() => setVisible(false)} />;
  }
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  args: {
    src: LIGHT_IMAGE,
    alt: 'Disabled thumbnail',
    label: 'locked.jpg',
    onRemove: () => {},
    isDisabled: true
  }
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  name: 'Media Mode (dark vs light images)',
  render: function MediaModeStory() {
    const images = [{
      src: DARK_IMAGE,
      label: 'dark.jpg',
      alt: 'Dark image'
    }, {
      src: LIGHT_IMAGE,
      label: 'light.jpg',
      alt: 'Light image'
    }, {
      src: MIXED_IMAGE,
      label: 'mixed.jpg',
      alt: 'Mixed tones'
    }, {
      src: WARM_IMAGE,
      label: 'warm.jpg',
      alt: 'Warm tones'
    }];
    const [items, setItems] = useState(images);
    return <div>
        <p style={{
        fontSize: 12,
        color: '#888',
        marginBottom: 8
      }}>
          Remove buttons should adapt: light icon on dark images, dark icon on
          light images.
        </p>
        <div style={{
        display: 'flex',
        gap: 8,
        alignItems: 'flex-start'
      }}>
          {items.map(item => <Thumbnail key={item.label} src={item.src} alt={item.alt} label={item.label} showRemoveOn="always" onRemove={() => setItems(prev => prev.filter(i => i.label !== item.label))} />)}
          {items.length === 0 && <p style={{
          color: '#888',
          fontSize: 12
        }}>
              All removed.{' '}
              <button onClick={() => setItems(images)}>Reset</button>
            </p>}
        </div>
      </div>;
  }
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  render: function GalleryStory() {
    const initial = [{
      id: 1,
      src: DARK_IMAGE,
      label: 'dark.jpg'
    }, {
      id: 2,
      src: LIGHT_IMAGE,
      label: 'light.jpg'
    }, {
      id: 4,
      src: WARM_IMAGE,
      label: 'warm.jpg'
    }];
    const [items, setItems] = useState(initial);
    return <div style={{
      display: 'flex',
      gap: 8,
      alignItems: 'flex-start'
    }}>
        {items.map(item => <Thumbnail key={item.id} src={item.src} alt={item.label} label={item.label} showRemoveOn="always" onRemove={() => setItems(prev => prev.filter(i => i.id !== item.id))} />)}
        {items.length === 0 && <p style={{
        color: '#888',
        fontSize: 12
      }}>
            All removed.{' '}
            <button onClick={() => setItems(initial)}>Reset</button>
          </p>}
      </div>;
  }
}`,...C.parameters?.docs?.source}}},w=[`Default`,`WithLabel`,`WithRemove`,`RemoveOnHover`,`WithCaption`,`Clickable`,`Loading`,`Uploading`,`Placeholder`,`Disabled`,`MediaModeTest`,`Gallery`]})))()}T();export{_ as Clickable,f as Default,x as Disabled,C as Gallery,v as Loading,S as MediaModeTest,b as Placeholder,h as RemoveOnHover,y as Uploading,g as WithCaption,p as WithLabel,m as WithRemove,w as __namedExportsOrder,s as default};