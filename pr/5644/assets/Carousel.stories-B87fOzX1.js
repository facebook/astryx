import{i as e,s as t}from"./preload-helper-CT_b8DTk.js";import{t as n}from"./react-B7Te67-h.js";import{t as r}from"./jsx-runtime-DqZldVDK.js";import{t as i}from"./Button-BnrGcZLf.js";import{t as a}from"./Button-BBOpb_lq.js";import{t as o}from"./Card-CvOBk-et.js";import{t as s}from"./Card-HAg_V-nm.js";import{gi as c,hi as l,it as u,rt as d}from"./iframe-VP77SNfM.js";var f,p,m,h,g,_,v,y,b,x,S,C,w,T,E,D,O,k,A,j;e((()=>{f=t(n()),l(),d(),s(),a(),p=r(),m={card:{kzqmXN:`xq1dxzn`,kmuXW:`x2lah0s`,$$css:!0}},h=[{id:1,src:`https://picsum.photos/id/1042/200/200`,label:`dark.jpg`},{id:2,src:`https://picsum.photos/id/1043/200/200`,label:`light.jpg`},{id:3,src:`https://picsum.photos/id/1044/200/200`,label:`warm.jpg`},{id:4,src:`https://picsum.photos/id/1047/200/200`,label:`mixed.jpg`},{id:5,src:`https://picsum.photos/id/1050/200/200`,label:`nature.jpg`},{id:6,src:`https://picsum.photos/id/1055/200/200`,label:`city.jpg`},{id:7,src:`https://picsum.photos/id/1060/200/200`,label:`ocean.jpg`},{id:8,src:`https://picsum.photos/id/1069/200/200`,label:`forest.jpg`}],g={title:`Core/Carousel`,component:c,tags:[`autodocs`],argTypes:{gap:{control:{type:`select`},options:[0,.5,1,1.5,2,3,4],description:`Gap between items`},hasButtons:{control:`boolean`,description:`Show navigation buttons when the content can scroll`},padding:{control:{type:`select`},options:[0,.5,1,1.5,2,3,4,5,6,8,10],description:`Inline padding inside the scroll container`},hasEdgeFade:{control:`boolean`,description:`Show gradient edge-fade mask on overflow`},hasLoop:{control:`boolean`,description:`Wrap-around scrolling (next at end → start)`},hasSnap:{control:`boolean`,description:`Enable scroll-snap`}},decorators:[e=>(0,p.jsx)(`div`,{className:`x1eiddq6 x1gt495 x9ynric`,children:(0,p.jsx)(e,{})})]},_={render:()=>(0,p.jsxs)(`div`,{className:`x1j9u4d2`,children:[(0,p.jsx)(`p`,{className:`xfifm61 xv1l7n4 x1p37lm5 x9ynric`,children:`Scroll or hover for arrows →`}),(0,p.jsx)(c,{gap:1,"aria-label":`Photo thumbnails`,children:h.map(e=>(0,p.jsx)(u,{src:e.src,alt:e.label,label:e.label},e.id))})]})},v={name:`Thumbnails with Remove`,render:function(){let[e,t]=(0,f.useState)(h);return(0,p.jsxs)(`div`,{className:`x1j9u4d2`,children:[(0,p.jsxs)(`p`,{className:`xfifm61 xv1l7n4 x1p37lm5 x9ynric`,children:[e.length,` attachments`]}),(0,p.jsx)(c,{gap:1,"aria-label":`Attached files`,children:e.map(e=>(0,p.jsx)(u,{src:e.src,alt:e.label,label:e.label,onRemove:()=>t(t=>t.filter(t=>t.id!==e.id))},e.id))}),e.length===0&&(0,p.jsxs)(`p`,{className:`xfifm61 xv1l7n4 x1p37lm5 x9ynric`,children:[`All removed. `,(0,p.jsx)(`button`,{onClick:()=>t(h),children:`Reset`})]})]})}},y={name:`Few Items (No Overflow)`,render:()=>(0,p.jsxs)(`div`,{className:`x1j9u4d2`,children:[(0,p.jsx)(`p`,{className:`xfifm61 xv1l7n4 x1p37lm5 x9ynric`,children:`No overflow — no fade, no buttons`}),(0,p.jsx)(c,{gap:1,"aria-label":`Small gallery`,children:h.slice(0,3).map(e=>(0,p.jsx)(u,{src:e.src,alt:e.label,label:e.label},e.id))})]})},b={name:`Card Content`,render:()=>(0,p.jsxs)(`div`,{style:{maxWidth:500},children:[(0,p.jsx)(`p`,{className:`xfifm61 xv1l7n4 x1p37lm5 x9ynric`,children:`Cards in a carousel`}),(0,p.jsx)(c,{gap:2,hasSnap:!0,"aria-label":`Feature cards`,children:[{id:1,title:`Design System`,desc:`Component library`},{id:2,title:`Documentation`,desc:`API reference`},{id:3,title:`Storybook`,desc:`Visual testing`},{id:4,title:`Theme Config`,desc:`Token overrides`},{id:5,title:`CLI Tools`,desc:`Code generation`},{id:6,title:`Accessibility`,desc:`ARIA patterns`}].map(e=>(0,p.jsx)(o,{xstyle:m.card,children:(0,p.jsxs)(`div`,{className:`x1b2ylru`,children:[(0,p.jsx)(`p`,{className:`x1ghz6dp xif65rj x1s688f x1tgivj0 x9ynric`,children:e.title}),(0,p.jsx)(`p`,{className:`x1ghz6dp xfifm61 xv1l7n4 x9ynric`,children:e.desc})]})},e.id))})]})},x={name:`Without Buttons`,render:()=>(0,p.jsxs)(`div`,{className:`x1j9u4d2`,children:[(0,p.jsx)(`p`,{className:`xfifm61 xv1l7n4 x1p37lm5 x9ynric`,children:`Scroll only — no arrow buttons`}),(0,p.jsx)(c,{gap:1,hasButtons:!1,"aria-label":`Scroll-only gallery`,children:h.map(e=>(0,p.jsx)(u,{src:e.src,alt:e.label,label:e.label},e.id))})]})},S={name:`Scroll Snap`,render:()=>(0,p.jsxs)(`div`,{className:`x1j9u4d2`,children:[(0,p.jsx)(`p`,{className:`xfifm61 xv1l7n4 x1p37lm5 x9ynric`,children:`Snaps to items on scroll`}),(0,p.jsx)(c,{gap:2,hasSnap:!0,"aria-label":`Snapping gallery`,children:h.map(e=>(0,p.jsx)(u,{src:e.src,alt:e.label,label:e.label},e.id))})]})},C={name:`Large Gap`,render:()=>(0,p.jsxs)(`div`,{className:`x1j9u4d2`,children:[(0,p.jsx)(`p`,{className:`xfifm61 xv1l7n4 x1p37lm5 x9ynric`,children:`gap=4 (16px)`}),(0,p.jsx)(c,{gap:4,"aria-label":`Spaced gallery`,children:h.map(e=>(0,p.jsx)(u,{src:e.src,alt:e.label,label:e.label},e.id))})]})},w={name:`Custom Content (Swatches)`,render:()=>(0,p.jsxs)(`div`,{style:{maxWidth:360},children:[(0,p.jsx)(`p`,{className:`xfifm61 xv1l7n4 x1p37lm5 x9ynric`,children:`Any content works as children`}),(0,p.jsx)(c,{gap:1.5,"aria-label":`Color swatches`,children:[`#e74c3c`,`#e67e22`,`#f1c40f`,`#2ecc71`,`#1abc9c`,`#3498db`,`#9b59b6`,`#34495e`,`#e84393`,`#00cec9`,`#6c5ce7`,`#fdcb6e`].map(e=>(0,p.jsx)(`div`,{className:`x1dmp6jm xwzfr38 xh6dtrn x2lah0s`,style:{backgroundColor:e},title:e},e))})]})},T={name:`Loop (Wrap-Around)`,render:()=>(0,p.jsxs)(`div`,{className:`x1j9u4d2`,children:[(0,p.jsx)(`p`,{className:`xfifm61 xv1l7n4 x1p37lm5 x9ynric`,children:`Next at the end wraps to the start — buttons stay active at both edges`}),(0,p.jsx)(c,{gap:1,hasLoop:!0,hasSnap:!0,"aria-label":`Looping gallery`,children:h.map(e=>(0,p.jsx)(u,{src:e.src,alt:e.label,label:e.label},e.id))})]})},E={name:`Imperative Control (handleRef)`,render:function(){let e=(0,f.useRef)(null);return(0,p.jsxs)(`div`,{className:`x1j9u4d2`,children:[(0,p.jsx)(`p`,{className:`xfifm61 xv1l7n4 x1p37lm5 x9ynric`,children:`External buttons driving the carousel through handleRef`}),(0,p.jsx)(c,{handleRef:e,gap:1,hasSnap:!0,hasButtons:!1,"aria-label":`Externally controlled gallery`,children:h.map(e=>(0,p.jsx)(u,{src:e.src,alt:e.label,label:e.label},e.id))}),(0,p.jsxs)(`div`,{style:{display:`flex`,gap:8,marginTop:12},children:[(0,p.jsx)(i,{label:`Previous`,variant:`secondary`,size:`sm`,onClick:()=>e.current?.scrollPrev()}),(0,p.jsx)(i,{label:`Next`,variant:`secondary`,size:`sm`,onClick:()=>e.current?.scrollNext()}),(0,p.jsx)(i,{label:`Jump to first`,variant:`ghost`,size:`sm`,onClick:()=>e.current?.scrollTo(0)})]})]})}},D={name:`Inline Padding`,render:()=>(0,p.jsxs)(`div`,{className:`x1j9u4d2`,children:[(0,p.jsx)(`p`,{className:`xfifm61 xv1l7n4 x1p37lm5 x9ynric`,children:`padding=3 puts the gutter inside the scroll area, and scroll-padding keeps snap points on the content edge`}),(0,p.jsx)(c,{gap:1,padding:3,hasSnap:!0,"aria-label":`Padded gallery`,children:h.map(e=>(0,p.jsx)(u,{src:e.src,alt:e.label,label:e.label},e.id))})]})},O={name:`Narrow Container`,render:()=>(0,p.jsxs)(`div`,{className:`x16em4ew`,children:[(0,p.jsx)(`p`,{className:`xfifm61 xv1l7n4 x1p37lm5 x9ynric`,children:`240px container`}),(0,p.jsx)(c,{gap:1,"aria-label":`Narrow gallery`,children:h.map(e=>(0,p.jsx)(u,{src:e.src,alt:e.label,label:e.label},e.id))})]})},k={name:`Long Text Items`,render:()=>(0,p.jsxs)(`div`,{className:`x1j9u4d2`,children:[(0,p.jsx)(`p`,{className:`xfifm61 xv1l7n4 x1p37lm5 x9ynric`,children:`One very long item among short ones, and a word with no break opportunity`}),(0,p.jsxs)(c,{gap:2,"aria-label":`Text items`,children:[(0,p.jsx)(o,{xstyle:m.card,children:(0,p.jsx)(`div`,{className:`x1b2ylru`,children:(0,p.jsx)(`p`,{className:`x1ghz6dp xfifm61 xv1l7n4 x9ynric`,children:`Short`})})}),(0,p.jsx)(o,{xstyle:m.card,children:(0,p.jsx)(`div`,{className:`x1b2ylru`,children:(0,p.jsx)(`p`,{className:`x1ghz6dp xfifm61 xv1l7n4 x9ynric`,children:`A much longer description that runs well past the width of its neighbours and has to wrap inside a fixed-width card without pushing the row out of shape.`})})}),(0,p.jsx)(o,{xstyle:m.card,children:(0,p.jsx)(`div`,{className:`x1b2ylru`,children:(0,p.jsx)(`p`,{className:`x1ghz6dp xfifm61 xv1l7n4 x9ynric`,children:`Unbreakable: Donaudampfschiffahrtselektrizitaetenhauptbetriebswerkbauunterbeamtengesellschaft`})})})]})]})},A={name:`Single Item`,render:()=>(0,p.jsxs)(`div`,{className:`x1j9u4d2`,children:[(0,p.jsx)(`p`,{className:`xfifm61 xv1l7n4 x1p37lm5 x9ynric`,children:`One child: no overflow, no fade, no buttons`}),(0,p.jsx)(c,{gap:1,"aria-label":`Single item`,children:(0,p.jsx)(u,{src:h[0].src,alt:h[0].label,label:h[0].label})})]})},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  render: () => <div {...stylex.props(styles.constrainedWidth)}>
      <p {...stylex.props(styles.label)}>Scroll or hover for arrows →</p>
      <Carousel gap={1} aria-label="Photo thumbnails">
        {IMAGES.map(img => <Thumbnail key={img.id} src={img.src} alt={img.label} label={img.label} />)}
      </Carousel>
    </div>
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
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
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  name: 'Few Items (No Overflow)',
  render: () => <div {...stylex.props(styles.constrainedWidth)}>
      <p {...stylex.props(styles.label)}>No overflow — no fade, no buttons</p>
      <Carousel gap={1} aria-label="Small gallery">
        {IMAGES.slice(0, 3).map(img => <Thumbnail key={img.id} src={img.src} alt={img.label} label={img.label} />)}
      </Carousel>
    </div>
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
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
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  name: 'Without Buttons',
  render: () => <div {...stylex.props(styles.constrainedWidth)}>
      <p {...stylex.props(styles.label)}>Scroll only — no arrow buttons</p>
      <Carousel gap={1} hasButtons={false} aria-label="Scroll-only gallery">
        {IMAGES.map(img => <Thumbnail key={img.id} src={img.src} alt={img.label} label={img.label} />)}
      </Carousel>
    </div>
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  name: 'Scroll Snap',
  render: () => <div {...stylex.props(styles.constrainedWidth)}>
      <p {...stylex.props(styles.label)}>Snaps to items on scroll</p>
      <Carousel gap={2} hasSnap aria-label="Snapping gallery">
        {IMAGES.map(img => <Thumbnail key={img.id} src={img.src} alt={img.label} label={img.label} />)}
      </Carousel>
    </div>
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  name: 'Large Gap',
  render: () => <div {...stylex.props(styles.constrainedWidth)}>
      <p {...stylex.props(styles.label)}>gap=4 (16px)</p>
      <Carousel gap={4} aria-label="Spaced gallery">
        {IMAGES.map(img => <Thumbnail key={img.id} src={img.src} alt={img.label} label={img.label} />)}
      </Carousel>
    </div>
}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
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
}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  name: 'Loop (Wrap-Around)',
  render: () => <div {...stylex.props(styles.constrainedWidth)}>
      <p {...stylex.props(styles.label)}>
        Next at the end wraps to the start — buttons stay active at both edges
      </p>
      <Carousel gap={1} hasLoop hasSnap aria-label="Looping gallery">
        {IMAGES.map(img => <Thumbnail key={img.id} src={img.src} alt={img.label} label={img.label} />)}
      </Carousel>
    </div>
}`,...T.parameters?.docs?.source}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  name: 'Imperative Control (handleRef)',
  render: function ImperativeControlStory() {
    const carouselRef = useRef<CarouselHandle>(null);
    return <div {...stylex.props(styles.constrainedWidth)}>
        <p {...stylex.props(styles.label)}>
          External buttons driving the carousel through handleRef
        </p>
        <Carousel handleRef={carouselRef} gap={1} hasSnap hasButtons={false} aria-label="Externally controlled gallery">
          {IMAGES.map(img => <Thumbnail key={img.id} src={img.src} alt={img.label} label={img.label} />)}
        </Carousel>
        <div style={{
        display: 'flex',
        gap: 8,
        marginTop: 12
      }}>
          <Button label="Previous" variant="secondary" size="sm" onClick={() => carouselRef.current?.scrollPrev()} />
          <Button label="Next" variant="secondary" size="sm" onClick={() => carouselRef.current?.scrollNext()} />
          <Button label="Jump to first" variant="ghost" size="sm" onClick={() => carouselRef.current?.scrollTo(0)} />
        </div>
      </div>;
  }
}`,...E.parameters?.docs?.source}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  name: 'Inline Padding',
  render: () => <div {...stylex.props(styles.constrainedWidth)}>
      <p {...stylex.props(styles.label)}>
        padding=3 puts the gutter inside the scroll area, and scroll-padding
        keeps snap points on the content edge
      </p>
      <Carousel gap={1} padding={3} hasSnap aria-label="Padded gallery">
        {IMAGES.map(img => <Thumbnail key={img.id} src={img.src} alt={img.label} label={img.label} />)}
      </Carousel>
    </div>
}`,...D.parameters?.docs?.source}}},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
  name: 'Narrow Container',
  render: () => <div {...stylex.props(styles.narrowWidth)}>
      <p {...stylex.props(styles.label)}>240px container</p>
      <Carousel gap={1} aria-label="Narrow gallery">
        {IMAGES.map(img => <Thumbnail key={img.id} src={img.src} alt={img.label} label={img.label} />)}
      </Carousel>
    </div>
}`,...O.parameters?.docs?.source}}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  name: 'Long Text Items',
  render: () => <div {...stylex.props(styles.constrainedWidth)}>
      <p {...stylex.props(styles.label)}>
        One very long item among short ones, and a word with no break
        opportunity
      </p>
      <Carousel gap={2} aria-label="Text items">
        <Card xstyle={styles.card}>
          <div {...stylex.props(styles.cardInner)}>
            <p {...stylex.props(styles.cardDesc)}>Short</p>
          </div>
        </Card>
        <Card xstyle={styles.card}>
          <div {...stylex.props(styles.cardInner)}>
            <p {...stylex.props(styles.cardDesc)}>
              A much longer description that runs well past the width of its
              neighbours and has to wrap inside a fixed-width card without
              pushing the row out of shape.
            </p>
          </div>
        </Card>
        <Card xstyle={styles.card}>
          <div {...stylex.props(styles.cardInner)}>
            <p {...stylex.props(styles.cardDesc)}>
              Unbreakable:
              Donaudampfschiffahrtselektrizitaetenhauptbetriebswerkbauunterbeamtengesellschaft
            </p>
          </div>
        </Card>
      </Carousel>
    </div>
}`,...k.parameters?.docs?.source}}},A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  name: 'Single Item',
  render: () => <div {...stylex.props(styles.constrainedWidth)}>
      <p {...stylex.props(styles.label)}>
        One child: no overflow, no fade, no buttons
      </p>
      <Carousel gap={1} aria-label="Single item">
        <Thumbnail src={IMAGES[0].src} alt={IMAGES[0].label} label={IMAGES[0].label} />
      </Carousel>
    </div>
}`,...A.parameters?.docs?.source}}},j=[`Default`,`WithRemove`,`FewItems`,`Cards`,`NoButtons`,`WithSnap`,`LargeGap`,`ColorSwatches`,`Loop`,`ImperativeControl`,`WithPadding`,`NarrowContainer`,`LongTextItems`,`SingleItem`]}))();export{b as Cards,w as ColorSwatches,_ as Default,y as FewItems,E as ImperativeControl,C as LargeGap,k as LongTextItems,T as Loop,O as NarrowContainer,x as NoButtons,A as SingleItem,D as WithPadding,v as WithRemove,S as WithSnap,j as __namedExportsOrder,g as default};