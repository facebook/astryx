import{i as e,s as t}from"./preload-helper-CT_b8DTk.js";import{t as n}from"./react-B7Te67-h.js";import{t as r}from"./jsx-runtime-DqZldVDK.js";import{n as i,t as a}from"./Card-B6hq5pd9.js";import{at as o,di as s,it as c,ui as l}from"./iframe-CER2Y08S.js";var u,d,f,p,m,h,g,_,v,y,b,x,S,C;e((()=>{u=t(n()),l(),c(),a(),d=r(),f={card:{kzqmXN:`xq1dxzn`,kmuXW:`x2lah0s`,$$css:!0}},p=[{id:1,src:`https://picsum.photos/id/1042/200/200`,label:`dark.jpg`},{id:2,src:`https://picsum.photos/id/1043/200/200`,label:`light.jpg`},{id:3,src:`https://picsum.photos/id/1044/200/200`,label:`warm.jpg`},{id:4,src:`https://picsum.photos/id/1047/200/200`,label:`mixed.jpg`},{id:5,src:`https://picsum.photos/id/1050/200/200`,label:`nature.jpg`},{id:6,src:`https://picsum.photos/id/1055/200/200`,label:`city.jpg`},{id:7,src:`https://picsum.photos/id/1060/200/200`,label:`ocean.jpg`},{id:8,src:`https://picsum.photos/id/1069/200/200`,label:`forest.jpg`}],m={title:`Core/Carousel`,component:s,tags:[`autodocs`],argTypes:{gap:{control:{type:`select`},options:[0,.5,1,1.5,2,3,4],description:`Gap between items`},hasButtons:{control:`boolean`,description:`Show navigation buttons on hover`},hasSnap:{control:`boolean`,description:`Enable scroll-snap`}},decorators:[e=>(0,d.jsx)(`div`,{className:`x1eiddq6 x1gt495 x9ynric`,children:(0,d.jsx)(e,{})})]},h={render:()=>(0,d.jsxs)(`div`,{className:`x1j9u4d2`,children:[(0,d.jsx)(`p`,{className:`xfifm61 xv1l7n4 x1p37lm5 x9ynric`,children:`Scroll or hover for arrows →`}),(0,d.jsx)(s,{gap:1,"aria-label":`Photo thumbnails`,children:p.map(e=>(0,d.jsx)(o,{src:e.src,alt:e.label,label:e.label},e.id))})]})},g={name:`Thumbnails with Remove`,render:function(){let[e,t]=(0,u.useState)(p);return(0,d.jsxs)(`div`,{className:`x1j9u4d2`,children:[(0,d.jsxs)(`p`,{className:`xfifm61 xv1l7n4 x1p37lm5 x9ynric`,children:[e.length,` attachments`]}),(0,d.jsx)(s,{gap:1,"aria-label":`Attached files`,children:e.map(e=>(0,d.jsx)(o,{src:e.src,alt:e.label,label:e.label,onRemove:()=>t(t=>t.filter(t=>t.id!==e.id))},e.id))}),e.length===0&&(0,d.jsxs)(`p`,{className:`xfifm61 xv1l7n4 x1p37lm5 x9ynric`,children:[`All removed. `,(0,d.jsx)(`button`,{onClick:()=>t(p),children:`Reset`})]})]})}},_={name:`Few Items (No Overflow)`,render:()=>(0,d.jsxs)(`div`,{className:`x1j9u4d2`,children:[(0,d.jsx)(`p`,{className:`xfifm61 xv1l7n4 x1p37lm5 x9ynric`,children:`No overflow — no fade, no buttons`}),(0,d.jsx)(s,{gap:1,"aria-label":`Small gallery`,children:p.slice(0,3).map(e=>(0,d.jsx)(o,{src:e.src,alt:e.label,label:e.label},e.id))})]})},v={name:`Card Content`,render:()=>(0,d.jsxs)(`div`,{style:{maxWidth:500},children:[(0,d.jsx)(`p`,{className:`xfifm61 xv1l7n4 x1p37lm5 x9ynric`,children:`Cards in a carousel`}),(0,d.jsx)(s,{gap:2,hasSnap:!0,"aria-label":`Feature cards`,children:[{id:1,title:`Design System`,desc:`Component library`},{id:2,title:`Documentation`,desc:`API reference`},{id:3,title:`Storybook`,desc:`Visual testing`},{id:4,title:`Theme Config`,desc:`Token overrides`},{id:5,title:`CLI Tools`,desc:`Code generation`},{id:6,title:`Accessibility`,desc:`ARIA patterns`}].map(e=>(0,d.jsx)(i,{xstyle:f.card,children:(0,d.jsxs)(`div`,{className:`x1b2ylru`,children:[(0,d.jsx)(`p`,{className:`x1ghz6dp xif65rj x1s688f x1tgivj0 x9ynric`,children:e.title}),(0,d.jsx)(`p`,{className:`x1ghz6dp xfifm61 xv1l7n4 x9ynric`,children:e.desc})]})},e.id))})]})},y={name:`Without Buttons`,render:()=>(0,d.jsxs)(`div`,{className:`x1j9u4d2`,children:[(0,d.jsx)(`p`,{className:`xfifm61 xv1l7n4 x1p37lm5 x9ynric`,children:`Scroll only — no arrow buttons`}),(0,d.jsx)(s,{gap:1,hasButtons:!1,"aria-label":`Scroll-only gallery`,children:p.map(e=>(0,d.jsx)(o,{src:e.src,alt:e.label,label:e.label},e.id))})]})},b={name:`Scroll Snap`,render:()=>(0,d.jsxs)(`div`,{className:`x1j9u4d2`,children:[(0,d.jsx)(`p`,{className:`xfifm61 xv1l7n4 x1p37lm5 x9ynric`,children:`Snaps to items on scroll`}),(0,d.jsx)(s,{gap:2,hasSnap:!0,"aria-label":`Snapping gallery`,children:p.map(e=>(0,d.jsx)(o,{src:e.src,alt:e.label,label:e.label},e.id))})]})},x={name:`Large Gap`,render:()=>(0,d.jsxs)(`div`,{className:`x1j9u4d2`,children:[(0,d.jsx)(`p`,{className:`xfifm61 xv1l7n4 x1p37lm5 x9ynric`,children:`gap=4 (16px)`}),(0,d.jsx)(s,{gap:4,"aria-label":`Spaced gallery`,children:p.map(e=>(0,d.jsx)(o,{src:e.src,alt:e.label,label:e.label},e.id))})]})},S={name:`Custom Content (Swatches)`,render:()=>(0,d.jsxs)(`div`,{style:{maxWidth:360},children:[(0,d.jsx)(`p`,{className:`xfifm61 xv1l7n4 x1p37lm5 x9ynric`,children:`Any content works as children`}),(0,d.jsx)(s,{gap:1.5,"aria-label":`Color swatches`,children:[`#e74c3c`,`#e67e22`,`#f1c40f`,`#2ecc71`,`#1abc9c`,`#3498db`,`#9b59b6`,`#34495e`,`#e84393`,`#00cec9`,`#6c5ce7`,`#fdcb6e`].map(e=>(0,d.jsx)(`div`,{className:`x1dmp6jm xwzfr38 xh6dtrn x2lah0s`,style:{backgroundColor:e},title:e},e))})]})},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  render: () => <div {...stylex.props(styles.constrainedWidth)}>
      <p {...stylex.props(styles.label)}>Scroll or hover for arrows →</p>
      <Carousel gap={1} aria-label="Photo thumbnails">
        {IMAGES.map(img => <Thumbnail key={img.id} src={img.src} alt={img.label} label={img.label} />)}
      </Carousel>
    </div>
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  name: 'Thumbnails with Remove',
  render: function WithRemoveStory() {
    const [items, setItems] = useState(IMAGES);
    return <div {...stylex.props(styles.constrainedWidth)}>
        <p {...stylex.props(styles.label)}>{items.length} attachments</p>
        <Carousel gap={1} aria-label="Attached files">
          {items.map(img => <Thumbnail key={img.id} src={img.src} alt={img.label} label={img.label} onRemove={() => setItems(prev => prev.filter(i => i.id !== img.id))} />)}
        </Carousel>
        {items.length === 0 && <p {...stylex.props(styles.label)}>
            All removed. <button onClick={() => setItems(IMAGES)}>Reset</button>
          </p>}
      </div>;
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  name: 'Few Items (No Overflow)',
  render: () => <div {...stylex.props(styles.constrainedWidth)}>
      <p {...stylex.props(styles.label)}>No overflow — no fade, no buttons</p>
      <Carousel gap={1} aria-label="Small gallery">
        {IMAGES.slice(0, 3).map(img => <Thumbnail key={img.id} src={img.src} alt={img.label} label={img.label} />)}
      </Carousel>
    </div>
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  name: 'Card Content',
  render: () => {
    const cards = [{
      id: 1,
      title: 'Design System',
      desc: 'Component library'
    }, {
      id: 2,
      title: 'Documentation',
      desc: 'API reference'
    }, {
      id: 3,
      title: 'Storybook',
      desc: 'Visual testing'
    }, {
      id: 4,
      title: 'Theme Config',
      desc: 'Token overrides'
    }, {
      id: 5,
      title: 'CLI Tools',
      desc: 'Code generation'
    }, {
      id: 6,
      title: 'Accessibility',
      desc: 'ARIA patterns'
    }];
    return <div style={{
      maxWidth: 500
    }}>
        <p {...stylex.props(styles.label)}>Cards in a carousel</p>
        <Carousel gap={2} hasSnap aria-label="Feature cards">
          {cards.map(card => <Card key={card.id} xstyle={styles.card}>
              <div {...stylex.props(styles.cardInner)}>
                <p {...stylex.props(styles.cardTitle)}>{card.title}</p>
                <p {...stylex.props(styles.cardDesc)}>{card.desc}</p>
              </div>
            </Card>)}
        </Carousel>
      </div>;
  }
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  name: 'Without Buttons',
  render: () => <div {...stylex.props(styles.constrainedWidth)}>
      <p {...stylex.props(styles.label)}>Scroll only — no arrow buttons</p>
      <Carousel gap={1} hasButtons={false} aria-label="Scroll-only gallery">
        {IMAGES.map(img => <Thumbnail key={img.id} src={img.src} alt={img.label} label={img.label} />)}
      </Carousel>
    </div>
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  name: 'Scroll Snap',
  render: () => <div {...stylex.props(styles.constrainedWidth)}>
      <p {...stylex.props(styles.label)}>Snaps to items on scroll</p>
      <Carousel gap={2} hasSnap aria-label="Snapping gallery">
        {IMAGES.map(img => <Thumbnail key={img.id} src={img.src} alt={img.label} label={img.label} />)}
      </Carousel>
    </div>
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  name: 'Large Gap',
  render: () => <div {...stylex.props(styles.constrainedWidth)}>
      <p {...stylex.props(styles.label)}>gap=4 (16px)</p>
      <Carousel gap={4} aria-label="Spaced gallery">
        {IMAGES.map(img => <Thumbnail key={img.id} src={img.src} alt={img.label} label={img.label} />)}
      </Carousel>
    </div>
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  name: 'Custom Content (Swatches)',
  render: () => {
    const colors = ['#e74c3c', '#e67e22', '#f1c40f', '#2ecc71', '#1abc9c', '#3498db', '#9b59b6', '#34495e', '#e84393', '#00cec9', '#6c5ce7', '#fdcb6e'];
    return <div style={{
      maxWidth: 360
    }}>
        <p {...stylex.props(styles.label)}>Any content works as children</p>
        <Carousel gap={1.5} aria-label="Color swatches">
          {colors.map(color => <div key={color} {...stylex.props(styles.colorSwatch)} style={{
          backgroundColor: color
        }} title={color} />)}
        </Carousel>
      </div>;
  }
}`,...S.parameters?.docs?.source}}},C=[`Default`,`WithRemove`,`FewItems`,`Cards`,`NoButtons`,`WithSnap`,`LargeGap`,`ColorSwatches`]}))();export{v as Cards,S as ColorSwatches,h as Default,_ as FewItems,x as LargeGap,y as NoButtons,g as WithRemove,b as WithSnap,C as __namedExportsOrder,m as default};