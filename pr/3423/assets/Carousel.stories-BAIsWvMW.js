import{a1 as e,ah as g}from"./iframe-FpdBIrKz.js";import{C as l}from"./Carousel-MPtj5moz.js";import{T as t}from"./Thumbnail-zIgYl7cX.js";import{C as v}from"./Card-NJOPrOtR.js";import"./preload-helper-Ct5FWWRu.js";import"./Skeleton-TM66N19L.js";import"./useImageMode-DnhL0mpv.js";import"./container.stylex-uilBL6DE.js";import"./padding.stylex-ENVgbwco.js";const f={card:{kzqmXN:"xq1dxzn",kmuXW:"x2lah0s",$$css:!0}},r=[{id:1,src:"https://picsum.photos/id/1042/200/200",label:"dark.jpg"},{id:2,src:"https://picsum.photos/id/1043/200/200",label:"light.jpg"},{id:3,src:"https://picsum.photos/id/1044/200/200",label:"warm.jpg"},{id:4,src:"https://picsum.photos/id/1047/200/200",label:"mixed.jpg"},{id:5,src:"https://picsum.photos/id/1050/200/200",label:"nature.jpg"},{id:6,src:"https://picsum.photos/id/1055/200/200",label:"city.jpg"},{id:7,src:"https://picsum.photos/id/1060/200/200",label:"ocean.jpg"},{id:8,src:"https://picsum.photos/id/1069/200/200",label:"forest.jpg"}],T={title:"Core/Carousel",component:l,tags:["autodocs"],argTypes:{gap:{control:{type:"select"},options:[0,.5,1,1.5,2,3,4],description:"Gap between items"},hasButtons:{control:"boolean",description:"Show navigation buttons on hover"},hasSnap:{control:"boolean",description:"Enable scroll-snap"}},decorators:[s=>e.jsx("div",{className:"x1eiddq6 x1gt495 x9ynric",children:e.jsx(s,{})})]},i={render:()=>e.jsxs("div",{className:"x1j9u4d2",children:[e.jsx("p",{className:"xfifm61 xv1l7n4 x1p37lm5 x9ynric",children:"Scroll or hover for arrows →"}),e.jsx(l,{gap:1,"aria-label":"Photo thumbnails",children:r.map(s=>e.jsx(t,{src:s.src,alt:s.label,label:s.label},s.id))})]})},c={name:"Thumbnails with Remove",render:function(){const[a,u]=g.useState(r);return e.jsxs("div",{className:"x1j9u4d2",children:[e.jsxs("p",{className:"xfifm61 xv1l7n4 x1p37lm5 x9ynric",children:[a.length," attachments"]}),e.jsx(l,{gap:1,"aria-label":"Attached files",children:a.map(o=>e.jsx(t,{src:o.src,alt:o.label,label:o.label,onRemove:()=>u(b=>b.filter(y=>y.id!==o.id))},o.id))}),a.length===0&&e.jsxs("p",{className:"xfifm61 xv1l7n4 x1p37lm5 x9ynric",children:["All removed. ",e.jsx("button",{onClick:()=>u(r),children:"Reset"})]})]})}},n={name:"Few Items (No Overflow)",render:()=>e.jsxs("div",{className:"x1j9u4d2",children:[e.jsx("p",{className:"xfifm61 xv1l7n4 x1p37lm5 x9ynric",children:"No overflow — no fade, no buttons"}),e.jsx(l,{gap:1,"aria-label":"Small gallery",children:r.slice(0,3).map(s=>e.jsx(t,{src:s.src,alt:s.label,label:s.label},s.id))})]})},d={name:"Card Content",render:()=>{const s=[{id:1,title:"Design System",desc:"Component library"},{id:2,title:"Documentation",desc:"API reference"},{id:3,title:"Storybook",desc:"Visual testing"},{id:4,title:"Theme Config",desc:"Token overrides"},{id:5,title:"CLI Tools",desc:"Code generation"},{id:6,title:"Accessibility",desc:"ARIA patterns"}];return e.jsxs("div",{style:{maxWidth:500},children:[e.jsx("p",{className:"xfifm61 xv1l7n4 x1p37lm5 x9ynric",children:"Cards in a carousel"}),e.jsx(l,{gap:2,hasSnap:!0,"aria-label":"Feature cards",children:s.map(a=>e.jsx(v,{xstyle:f.card,children:e.jsxs("div",{className:"x1b2ylru",children:[e.jsx("p",{className:"x1ghz6dp xif65rj x1s688f x1tgivj0 x9ynric",children:a.title}),e.jsx("p",{className:"x1ghz6dp xfifm61 xv1l7n4 x9ynric",children:a.desc})]})},a.id))})]})}},p={name:"Without Buttons",render:()=>e.jsxs("div",{className:"x1j9u4d2",children:[e.jsx("p",{className:"xfifm61 xv1l7n4 x1p37lm5 x9ynric",children:"Scroll only — no arrow buttons"}),e.jsx(l,{gap:1,hasButtons:!1,"aria-label":"Scroll-only gallery",children:r.map(s=>e.jsx(t,{src:s.src,alt:s.label,label:s.label},s.id))})]})},m={name:"Scroll Snap",render:()=>e.jsxs("div",{className:"x1j9u4d2",children:[e.jsx("p",{className:"xfifm61 xv1l7n4 x1p37lm5 x9ynric",children:"Snaps to items on scroll"}),e.jsx(l,{gap:2,hasSnap:!0,"aria-label":"Snapping gallery",children:r.map(s=>e.jsx(t,{src:s.src,alt:s.label,label:s.label},s.id))})]})},x={name:"Large Gap",render:()=>e.jsxs("div",{className:"x1j9u4d2",children:[e.jsx("p",{className:"xfifm61 xv1l7n4 x1p37lm5 x9ynric",children:"gap=4 (16px)"}),e.jsx(l,{gap:4,"aria-label":"Spaced gallery",children:r.map(s=>e.jsx(t,{src:s.src,alt:s.label,label:s.label},s.id))})]})},h={name:"Custom Content (Swatches)",render:()=>{const s=["#e74c3c","#e67e22","#f1c40f","#2ecc71","#1abc9c","#3498db","#9b59b6","#34495e","#e84393","#00cec9","#6c5ce7","#fdcb6e"];return e.jsxs("div",{style:{maxWidth:360},children:[e.jsx("p",{className:"xfifm61 xv1l7n4 x1p37lm5 x9ynric",children:"Any content works as children"}),e.jsx(l,{gap:1.5,"aria-label":"Color swatches",children:s.map(a=>e.jsx("div",{className:"x1dmp6jm xwzfr38 xh6dtrn x2lah0s",style:{backgroundColor:a},title:a},a))})]})}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  render: () => <div {...stylex.props(styles.constrainedWidth)}>
      <p {...stylex.props(styles.label)}>Scroll or hover for arrows →</p>
      <Carousel gap={1} aria-label="Photo thumbnails">
        {IMAGES.map(img => <Thumbnail key={img.id} src={img.src} alt={img.label} label={img.label} />)}
      </Carousel>
    </div>
}`,...i.parameters?.docs?.source}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
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
}`,...c.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  name: 'Few Items (No Overflow)',
  render: () => <div {...stylex.props(styles.constrainedWidth)}>
      <p {...stylex.props(styles.label)}>No overflow — no fade, no buttons</p>
      <Carousel gap={1} aria-label="Small gallery">
        {IMAGES.slice(0, 3).map(img => <Thumbnail key={img.id} src={img.src} alt={img.label} label={img.label} />)}
      </Carousel>
    </div>
}`,...n.parameters?.docs?.source}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
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
}`,...d.parameters?.docs?.source}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  name: 'Without Buttons',
  render: () => <div {...stylex.props(styles.constrainedWidth)}>
      <p {...stylex.props(styles.label)}>Scroll only — no arrow buttons</p>
      <Carousel gap={1} hasButtons={false} aria-label="Scroll-only gallery">
        {IMAGES.map(img => <Thumbnail key={img.id} src={img.src} alt={img.label} label={img.label} />)}
      </Carousel>
    </div>
}`,...p.parameters?.docs?.source}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  name: 'Scroll Snap',
  render: () => <div {...stylex.props(styles.constrainedWidth)}>
      <p {...stylex.props(styles.label)}>Snaps to items on scroll</p>
      <Carousel gap={2} hasSnap aria-label="Snapping gallery">
        {IMAGES.map(img => <Thumbnail key={img.id} src={img.src} alt={img.label} label={img.label} />)}
      </Carousel>
    </div>
}`,...m.parameters?.docs?.source}}};x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  name: 'Large Gap',
  render: () => <div {...stylex.props(styles.constrainedWidth)}>
      <p {...stylex.props(styles.label)}>gap=4 (16px)</p>
      <Carousel gap={4} aria-label="Spaced gallery">
        {IMAGES.map(img => <Thumbnail key={img.id} src={img.src} alt={img.label} label={img.label} />)}
      </Carousel>
    </div>
}`,...x.parameters?.docs?.source}}};h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
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
}`,...h.parameters?.docs?.source}}};const G=["Default","WithRemove","FewItems","Cards","NoButtons","WithSnap","LargeGap","ColorSwatches"];export{d as Cards,h as ColorSwatches,i as Default,n as FewItems,x as LargeGap,p as NoButtons,c as WithRemove,m as WithSnap,G as __namedExportsOrder,T as default};
