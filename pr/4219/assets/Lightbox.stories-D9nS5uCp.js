import{i as e,s as t}from"./preload-helper-CT_b8DTk.js";import{t as n}from"./react-B7Te67-h.js";import{t as r}from"./jsx-runtime-DqZldVDK.js";import{ir as i,or as a,sr as o}from"./iframe-B2M4pHB5.js";var s,c,l,u,d,f,p,m,h,g,_,v;e((()=>{s=t(n()),i(),c=r(),l={title:`Core/Lightbox`,component:o,tags:[`autodocs`]},u=`https://picsum.photos/id/10/1200/800`,d=[{src:`https://picsum.photos/id/10/1200/800`,alt:`Forest path`,caption:`A winding path through the forest`},{src:`https://picsum.photos/id/15/1200/800`,alt:`Mountain lake`},{src:`https://picsum.photos/id/20/1200/800`,alt:`Beach sunset`,caption:`Golden hour at the beach`},{src:`https://picsum.photos/id/25/1200/800`,alt:`City skyline`}],f={render:()=>{let[e,t]=(0,s.useState)(!1);return(0,c.jsxs)(c.Fragment,{children:[(0,c.jsx)(`button`,{onClick:()=>t(!0),children:`Open lightbox`}),(0,c.jsx)(o,{isOpen:e,onOpenChange:t,media:{src:u,alt:`Forest path`,caption:`A winding path through the forest`}})]})}},p={render:()=>{let[e,t]=(0,s.useState)(!1),[n,r]=(0,s.useState)(0);return(0,c.jsxs)(c.Fragment,{children:[(0,c.jsx)(`div`,{style:{display:`flex`,gap:`8px`},children:d.map((e,n)=>(0,c.jsx)(`img`,{src:e.src,alt:e.alt,style:{width:120,height:80,objectFit:`cover`,cursor:`pointer`,borderRadius:4},onClick:()=>{r(n),t(!0)}},e.src))}),(0,c.jsx)(o,{isOpen:e,onOpenChange:t,media:d,index:n,onIndexChange:r})]})}},m={render:()=>{let[e,t]=(0,s.useState)(!1);return(0,c.jsxs)(c.Fragment,{children:[(0,c.jsx)(`button`,{onClick:()=>t(!0),children:`Open with zoom`}),(0,c.jsx)(o,{isOpen:e,onOpenChange:t,media:{src:u,alt:`Forest path`},hasZoom:!0})]})}},h={render:()=>{let[e,t]=(0,s.useState)(!1);return(0,c.jsxs)(c.Fragment,{children:[(0,c.jsx)(`button`,{onClick:()=>t(!0),children:`Open with caption`}),(0,c.jsx)(o,{isOpen:e,onOpenChange:t,media:{src:u,alt:`Forest path`,caption:`A beautiful forest path winding through tall trees on a misty morning`}})]})}},g={render:()=>{let[e,t]=(0,s.useState)(!1);return(0,c.jsxs)(c.Fragment,{children:[(0,c.jsx)(`button`,{onClick:()=>t(!0),children:`Open video`}),(0,c.jsx)(o,{isOpen:e,onOpenChange:t,media:{src:`https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.webm`,alt:`Flower blooming`,type:`video`,caption:`A flower blooming in time-lapse`}})]})}},_={render:()=>{let e=a({media:d});return(0,c.jsxs)(c.Fragment,{children:[(0,c.jsx)(`div`,{style:{display:`flex`,gap:`8px`},children:d.map((t,n)=>(0,c.jsx)(`img`,{src:t.src,alt:t.alt,style:{width:120,height:80,objectFit:`cover`,cursor:`pointer`,borderRadius:4},...e.getTriggerProps(n)},t.src))}),e.element]})}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    return <>
        <button onClick={() => setIsOpen(true)}>Open lightbox</button>
        <Lightbox isOpen={isOpen} onOpenChange={setIsOpen} media={{
        src: SAMPLE_IMAGE,
        alt: 'Forest path',
        caption: 'A winding path through the forest'
      }} />
      </>;
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    const [index, setIndex] = useState(0);
    return <>
        <div style={{
        display: 'flex',
        gap: '8px'
      }}>
          {GALLERY_MEDIA.map((item, i) => <img key={item.src} src={item.src} alt={item.alt} style={{
          width: 120,
          height: 80,
          objectFit: 'cover',
          cursor: 'pointer',
          borderRadius: 4
        }} onClick={() => {
          setIndex(i);
          setIsOpen(true);
        }} />)}
        </div>
        <Lightbox isOpen={isOpen} onOpenChange={setIsOpen} media={GALLERY_MEDIA} index={index} onIndexChange={setIndex} />
      </>;
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    return <>
        <button onClick={() => setIsOpen(true)}>Open with zoom</button>
        <Lightbox isOpen={isOpen} onOpenChange={setIsOpen} media={{
        src: SAMPLE_IMAGE,
        alt: 'Forest path'
      }} hasZoom />
      </>;
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    return <>
        <button onClick={() => setIsOpen(true)}>Open with caption</button>
        <Lightbox isOpen={isOpen} onOpenChange={setIsOpen} media={{
        src: SAMPLE_IMAGE,
        alt: 'Forest path',
        caption: 'A beautiful forest path winding through tall trees on a misty morning'
      }} />
      </>;
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    return <>
        <button onClick={() => setIsOpen(true)}>Open video</button>
        <Lightbox isOpen={isOpen} onOpenChange={setIsOpen} media={{
        src: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.webm',
        alt: 'Flower blooming',
        type: 'video',
        caption: 'A flower blooming in time-lapse'
      }} />
      </>;
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  render: () => {
    const lightbox = useLightbox({
      media: GALLERY_MEDIA
    });
    return <>
        <div style={{
        display: 'flex',
        gap: '8px'
      }}>
          {GALLERY_MEDIA.map((item, i) => <img key={item.src} src={item.src} alt={item.alt} style={{
          width: 120,
          height: 80,
          objectFit: 'cover',
          cursor: 'pointer',
          borderRadius: 4
        }} {...lightbox.getTriggerProps(i)} />)}
        </div>
        {lightbox.element}
      </>;
  }
}`,..._.parameters?.docs?.source}}},v=[`Default`,`Gallery`,`WithZoom`,`WithCaption`,`Video`,`WithHook`]}))();export{f as Default,p as Gallery,g as Video,h as WithCaption,_ as WithHook,m as WithZoom,v as __namedExportsOrder,l as default};