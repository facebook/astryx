import{i as e,s as t}from"./preload-helper-CT_b8DTk.js";import{t as n}from"./react-B7Te67-h.js";import{t as r}from"./jsx-runtime-DqZldVDK.js";import{at as i,it as a}from"./iframe-iQ3nuRH_.js";var o,s,c,l,u,d,f,p,m,h,g,_,v,y,b,x,S,C,w;e((()=>{o=t(n()),a(),s=r(),c={title:`Core/Thumbnail`,component:i,tags:[`autodocs`],argTypes:{src:{control:`text`,description:`Image source URL`},alt:{control:`text`,description:`Alt text for the image`},label:{control:`text`,description:`Label below the thumbnail`},isDisabled:{control:`boolean`,description:`Whether the thumbnail is disabled`},elevation:{control:`inline-radio`,options:[`none`,`low`,`med`,`high`],description:`Resting shadow depth`}}},l=`https://picsum.photos/id/1042/200/200`,u=`https://picsum.photos/id/1043/200/200`,d=`https://picsum.photos/id/1044/200/200`,f=`https://picsum.photos/id/1047/200/200`,p={args:{src:u,alt:`Sample image`}},m={args:{src:d,alt:`Vacation photo`,label:`vacation.jpg`}},h={render:()=>{let[e,t]=(0,o.useState)(!0);return e?(0,s.jsx)(i,{src:u,alt:`Removable thumbnail`,label:`photo.png`,onRemove:()=>t(!1)}):(0,s.jsxs)(`p`,{style:{color:`#888`,fontSize:12},children:[`Removed. `,(0,s.jsx)(`button`,{onClick:()=>t(!0),children:`Undo`})]})}},g={render:()=>{let[e,t]=(0,o.useState)(!0);return e?(0,s.jsx)(i,{src:d,alt:`Photo with metadata`,label:`screenshot.png`,onRemove:()=>t(!1)}):(0,s.jsxs)(`p`,{style:{color:`#888`,fontSize:12},children:[`Removed. `,(0,s.jsx)(`button`,{onClick:()=>t(!0),children:`Undo`})]})}},_={args:{src:f,alt:`Clickable thumbnail`,onClick:()=>alert(`Clicked!`),label:`preview.jpg`}},v={name:`Loading (no preview)`,args:{isLoading:!0,label:`uploading.jpg`}},y={name:`Uploading (with preview)`,args:{src:d,alt:`Uploading preview`,isLoading:!0,label:`vacation.jpg`}},b={name:`No Image (Placeholder)`,render:()=>{let[e,t]=(0,o.useState)(!0);return e?(0,s.jsx)(i,{label:`report.pdf`,onRemove:()=>t(!1)}):(0,s.jsxs)(`p`,{style:{color:`#888`,fontSize:12},children:[`Removed. `,(0,s.jsx)(`button`,{onClick:()=>t(!0),children:`Undo`})]})}},x={args:{src:u,alt:`Disabled thumbnail`,label:`locked.jpg`,onRemove:()=>{},isDisabled:!0}},S={name:`Media Mode (dark vs light images)`,render:function(){let e=[{src:l,label:`dark.jpg`,alt:`Dark image`},{src:u,label:`light.jpg`,alt:`Light image`},{src:f,label:`mixed.jpg`,alt:`Mixed tones`},{src:d,label:`warm.jpg`,alt:`Warm tones`}],[t,n]=(0,o.useState)(e);return(0,s.jsxs)(`div`,{children:[(0,s.jsx)(`p`,{style:{fontSize:12,color:`#888`,marginBottom:8},children:`Remove buttons should adapt: light icon on dark images, dark icon on light images.`}),(0,s.jsxs)(`div`,{style:{display:`flex`,gap:8,alignItems:`flex-start`},children:[t.map(e=>(0,s.jsx)(i,{src:e.src,alt:e.alt,label:e.label,onRemove:()=>n(t=>t.filter(t=>t.label!==e.label))},e.label)),t.length===0&&(0,s.jsxs)(`p`,{style:{color:`#888`,fontSize:12},children:[`All removed.`,` `,(0,s.jsx)(`button`,{onClick:()=>n(e),children:`Reset`})]})]})]})}},C={render:function(){let e=[{id:1,src:l,label:`dark.jpg`},{id:2,src:u,label:`light.jpg`},{id:4,src:d,label:`warm.jpg`}],[t,n]=(0,o.useState)(e);return(0,s.jsxs)(`div`,{style:{display:`flex`,gap:8,alignItems:`flex-start`},children:[t.map(e=>(0,s.jsx)(i,{src:e.src,alt:e.label,label:e.label,onRemove:()=>n(t=>t.filter(t=>t.id!==e.id))},e.id)),t.length===0&&(0,s.jsxs)(`p`,{style:{color:`#888`,fontSize:12},children:[`All removed.`,` `,(0,s.jsx)(`button`,{onClick:()=>n(e),children:`Reset`})]})]})}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    src: LIGHT_IMAGE,
    alt: 'Sample image'
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    src: WARM_IMAGE,
    alt: 'Vacation photo',
    label: 'vacation.jpg'
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
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
    return <Thumbnail src={LIGHT_IMAGE} alt="Removable thumbnail" label="photo.png" onRemove={() => setVisible(false)} />;
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
    return <Thumbnail src={WARM_IMAGE} alt="Photo with metadata" label="screenshot.png" onRemove={() => setVisible(false)} />;
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
    return <Thumbnail label="report.pdf" onRemove={() => setVisible(false)} />;
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
          {items.map(item => <Thumbnail key={item.label} src={item.src} alt={item.alt} label={item.label} onRemove={() => setItems(prev => prev.filter(i => i.label !== item.label))} />)}
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
        {items.map(item => <Thumbnail key={item.id} src={item.src} alt={item.label} label={item.label} onRemove={() => setItems(prev => prev.filter(i => i.id !== item.id))} />)}
        {items.length === 0 && <p style={{
        color: '#888',
        fontSize: 12
      }}>
            All removed.{' '}
            <button onClick={() => setItems(initial)}>Reset</button>
          </p>}
      </div>;
  }
}`,...C.parameters?.docs?.source}}},w=[`Default`,`WithLabel`,`WithRemove`,`WithCaption`,`Clickable`,`Loading`,`Uploading`,`Placeholder`,`Disabled`,`MediaModeTest`,`Gallery`]}))();export{_ as Clickable,p as Default,x as Disabled,C as Gallery,v as Loading,S as MediaModeTest,b as Placeholder,y as Uploading,g as WithCaption,m as WithLabel,h as WithRemove,w as __namedExportsOrder,c as default};