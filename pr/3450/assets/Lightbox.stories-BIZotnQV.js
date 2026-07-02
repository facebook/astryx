import{ah as t,aI as xe,a1 as e,I as B,af as te,a6 as ue,ay as ye,a7 as me}from"./iframe-Cw8JXX6x.js";import{I as V}from"./IconButton-7QLz3YeV.js";import{u as he}from"./useScrollLock-B4fJMUIp.js";import"./preload-helper-Ct5FWWRu.js";const f={dialog:{kVAEAm:"astryxixxii4",kpwlN0:"astryx10a8y8t",kzqmXN:"astryxn9wirt",kZKoxP:"astryx1dr59a3",ks0D6T:"astryx1x1rfll",kskxy:"astryx7ab17h",kogj98:"astryx1ghz6dp",kmVPX3:"astryx1717udv",kQgIW9:"astryx1gs6z28",kWkggS:"astryxjbqb8w",kVQacm:"astryxb3r6kr",kI3sdo:"astryx1a2a7pz",kGyWv1:"astryxnixb3f",kba3nw:"astryx1abwkk1",$$css:!0},image:{ks0D6T:"astryx193iq5w",kskxy:"astryxmz0i5r",kVIFPx:"astryx19kjcj4",kfzvcC:"astryx47corl",k1ekBW:"astryx11xpdln",kIyJzY:"astryx13dflua astryx12w9bfk",kAMwcw:"astryx9lcvmn",$$css:!0},imageDragging:{k1ekBW:"astryx13b0p5u",$$css:!0},controlButton:{kMwMTN:"astryx9e3rv5",$$css:!0}},ge={imageTransform:s=>[{k3aq6I:s!=null?"astryxsqj5wx":s,$$css:!0},{"--x-transform":s??void 0}]};function u({isOpen:s,onOpenChange:a,media:o,index:l,defaultIndex:c=0,onIndexChange:y,hasZoom:m=!1,hasAutoPlay:p=!1,xstyle:T,className:R,style:P,ref:N,onClick:r,onKeyDown:b,...ne}){const K=t.useRef(null),se=t.useRef(null),q=t.useRef(null),F=l!==void 0,[ae,H]=t.useState(c),d=F?l:ae,O=t.useCallback(n=>{F||H(n),y?.(n)},[F,y,H]),[x,W]=t.useState(1),[k,C]=t.useState({x:0,y:0}),[I,Z]=t.useState(!1),v=t.useRef({x:0,y:0,panX:0,panY:0}),h=Array.isArray(o)?o:[o],w=h.length>1,i=h.length>0?h[Math.min(d,h.length-1)]:null,g=(i?.type??"image")==="video",G=w&&d>0,_=w&&d<h.length-1;he(s),t.useEffect(()=>{W(1),C({x:0,y:0})},[d,i?.src]),xe(()=>{const n=K.current;n&&(s&&!n.open?(q.current=document.activeElement,n.showModal()):!s&&n.open&&(n.close(),q.current instanceof HTMLElement&&q.current.focus()))},[s]);const j=t.useCallback(()=>{a(!1)},[a]),re=t.useCallback(n=>{n.preventDefault(),j()},[j]),oe=t.useCallback(n=>{n.target===n.currentTarget&&j()},[j]),$=t.useCallback(()=>{G&&O(d-1)},[G,d,O]),Y=t.useCallback(()=>{_&&O(d+1)},[_,d,O]),ie=t.useCallback(n=>{n.key==="ArrowLeft"?(n.preventDefault(),$()):n.key==="ArrowRight"&&(n.preventDefault(),Y())},[$,Y]),le=t.useCallback(()=>{m&&(x===1?(W(2),C({x:0,y:0})):(W(1),C({x:0,y:0})))},[m,x]),ce=t.useCallback(n=>{x<=1||!m||(Z(!0),v.current={x:n.clientX,y:n.clientY,panX:k.x,panY:k.y})},[x,m,k]);t.useEffect(()=>{if(!I)return;const n=ee=>{const pe=ee.clientX-v.current.x,de=ee.clientY-v.current.y;C({x:v.current.panX+pe,y:v.current.panY+de})},J=()=>{Z(!1)};return window.addEventListener("pointermove",n),window.addEventListener("pointerup",J),()=>{window.removeEventListener("pointermove",n),window.removeEventListener("pointerup",J)}},[I]);const U=x>1,Q=x===1?null:`scale(${x}) translate(${k.x/x}px, ${k.y/x}px)`;return i?e.jsx("dialog",{ref:me(N,K),onCancel:re,onClick:n=>{oe(n),r?.(n)},onKeyDown:n=>{ie(n),b?.(n)},"aria-label":i.alt||"Media viewer",...ue(ye("lightbox"),te(f.dialog,T),R,P),...ne,children:e.jsxs("div",{className:"astryx78zum5 astryxdt5ytf astryx6s0dn4 astryxl56j7k astryxh8yej3 astryx5yr21d astryx1n2onr6",children:[e.jsx("div",{className:"astryx10l6tqk astryxyx6v2t astryxmz3bnw astryx1vjfegm",children:e.jsx(V,{icon:e.jsx(B,{icon:"close",size:"sm",color:"inherit"}),label:"Close",variant:"ghost",onClick:j,xstyle:f.controlButton})}),w&&e.jsx("div",{className:"astryx10l6tqk astryxwa60dl astryx1cb1t30 astryx1vjfegm astryxnp31yv",children:e.jsx(V,{icon:e.jsx(B,{icon:"chevronLeft",size:"sm",color:"inherit"}),label:"Previous",variant:"ghost",isDisabled:!G,onClick:$,xstyle:f.controlButton})}),e.jsxs("div",{className:"astryx78zum5 astryxdt5ytf astryx6s0dn4 astryx193iq5w astryxmz0i5r astryxb3r6kr",children:[e.jsx("div",{ref:se,...{0:{className:"astryx78zum5 astryx6s0dn4 astryxl56j7k astryxb3r6kr astryxt0e3qv astryx87ps6o astryx2lwn1j"},4:{className:"astryx78zum5 astryx6s0dn4 astryxl56j7k astryxb3r6kr astryx87ps6o astryx2lwn1j astryx1huxd7x astryx2dt3px"},2:{className:"astryx78zum5 astryx6s0dn4 astryxl56j7k astryxb3r6kr astryx87ps6o astryx2lwn1j astryx1jm3nie"},6:{className:"astryx78zum5 astryx6s0dn4 astryxl56j7k astryxb3r6kr astryx87ps6o astryx2lwn1j astryx1jm3nie"},1:{className:"astryx78zum5 astryx6s0dn4 astryxl56j7k astryxb3r6kr astryx87ps6o astryx2lwn1j astryxi9pz9s"},5:{className:"astryx78zum5 astryx6s0dn4 astryxl56j7k astryxb3r6kr astryx87ps6o astryx2lwn1j astryxi9pz9s"},3:{className:"astryx78zum5 astryx6s0dn4 astryxl56j7k astryxb3r6kr astryx87ps6o astryx2lwn1j astryxi9pz9s"},7:{className:"astryx78zum5 astryx6s0dn4 astryxl56j7k astryxb3r6kr astryx87ps6o astryx2lwn1j astryxi9pz9s"}}[!!(!g&&m&&!U)<<2|!!(!g&&U)<<1|!!(!g&&I)<<0],onDoubleClick:g?void 0:le,onPointerDown:g?void 0:ce,children:g?e.jsx("video",{src:i.src,"aria-label":i.alt,controls:!0,autoPlay:p,className:"astryx193iq5w astryxmz0i5r astryx19kjcj4 astryx1a2a7pz"}):e.jsx("img",{src:i.src,alt:i.alt,draggable:!1,...te(f.image,I&&f.imageDragging,Q!=null&&ge.imageTransform(Q))})}),i.caption&&e.jsx("div",{className:"astryx9e3rv5 astryx18juvz8 astryxf74fhv astryx2b8uid astryx1xye8es astryx18d9i69 astryxrrkdod astryxrlsmeg astryx2lah0s",children:i.caption})]}),w&&e.jsx("div",{className:"astryx10l6tqk astryxwa60dl astryx1cb1t30 astryx1vjfegm astryxmz3bnw",children:e.jsx(V,{icon:e.jsx(B,{icon:"chevronRight",size:"sm",color:"inherit"}),label:"Next",variant:"ghost",isDisabled:!_,onClick:Y,xstyle:f.controlButton})}),w&&h.length>1&&e.jsxs("div",{className:"astryx10l6tqk astryxyx6v2t astryxnp31yv astryx9e3rv5 astryxjm74w1 astryxw6l6zx astryx1vjfegm",children:[d+1," / ",h.length]})]})}):null}u.displayName="Lightbox";u.__docgenInfo={description:`A fullscreen overlay for viewing images at full resolution.

Supports single image and gallery modes. In gallery mode, provides
prev/next navigation via buttons and arrow keys. Optionally supports
zoom (double-click to toggle 2x) and pan (drag when zoomed).

Uses the native \`<dialog>\` element with \`showModal()\` for focus
trapping and top-layer placement. Dismiss via Escape, close button,
or backdrop click.

@example
\`\`\`
<Lightbox
  isOpen={isOpen}
  onOpenChange={setIsOpen}
  media={{src: "/photo.jpg", alt: "A photo"}}
/>
<Lightbox
  isOpen={isOpen}
  onOpenChange={setIsOpen}
  media={photos}
/>
<Lightbox
  isOpen={isOpen}
  onOpenChange={setIsOpen}
  media={photos}
  index={currentIndex}
  onIndexChange={setCurrentIndex}
/>
\`\`\``,methods:[],displayName:"Lightbox",props:{xstyle:{required:!1,tsType:{name:"StyleXStyles"},description:"StyleX styles created via `stylex.create()`. Merged with the component's\nbase styles inside a single `stylex.props()` call for optimal deduplication.\n\n@example\n```\nconst overrides = stylex.create({ root: { marginBottom: 8 } });\n<Component xstyle={overrides.root} />\n```"},ref:{required:!1,tsType:{name:"ReactRef",raw:"React.Ref<HTMLDialogElement>",elements:[{name:"HTMLDialogElement"}]},description:"Ref forwarded to the root dialog element"},isOpen:{required:!0,tsType:{name:"boolean"},description:"Whether the lightbox is open."},onOpenChange:{required:!0,tsType:{name:"signature",type:"function",raw:"(isOpen: boolean) => void",signature:{arguments:[{type:{name:"boolean"},name:"isOpen"}],return:{name:"void"}}},description:"Callback when the lightbox open state changes.\nCalled with `false` on Escape, backdrop click, or close button."},media:{required:!0,tsType:{name:"union",raw:"LightboxMedia | LightboxMedia[]",elements:[{name:"LightboxMedia"},{name:"Array",elements:[{name:"LightboxMedia"}],raw:"LightboxMedia[]"}]},description:`Media to display. Pass a single object for one item, or an array
for gallery mode with prev/next navigation.`},index:{required:!1,tsType:{name:"number"},description:"Current index in gallery mode (when `media` is an array).\nWhen provided, puts the component in controlled mode."},defaultIndex:{required:!1,tsType:{name:"number"},description:`Initial index in gallery mode for uncontrolled usage.
@default 0`,defaultValue:{value:"0",computed:!1}},onIndexChange:{required:!1,tsType:{name:"signature",type:"function",raw:"(index: number) => void",signature:{arguments:[{type:{name:"number"},name:"index"}],return:{name:"void"}}},description:"Callback when the gallery index changes via prev/next navigation."},hasZoom:{required:!1,tsType:{name:"boolean"},description:`Enable zoom on double-click (images only).
When zoomed, drag to pan.
@default false`,defaultValue:{value:"false",computed:!1}},hasAutoPlay:{required:!1,tsType:{name:"boolean"},description:`Whether video should autoplay when the lightbox opens.
@default false`,defaultValue:{value:"false",computed:!1}}},composes:["Omit"]};function fe(s){const{media:a,...o}=s,[l,c]=t.useState(!1),[y,m]=t.useState(0),p=t.useCallback((r=0)=>{m(r),c(!0)},[]),T=t.useCallback(()=>{c(!1)},[]),R=t.useMemo(()=>({role:"button",tabIndex:0,"aria-haspopup":"dialog",onClick:()=>p(),onKeyDown:r=>{(r.key==="Enter"||r.key===" ")&&(r.preventDefault(),p())}}),[p]),P=t.useCallback(r=>({role:"button",tabIndex:0,"aria-haspopup":"dialog",onClick:()=>p(r),onKeyDown:b=>{(b.key==="Enter"||b.key===" ")&&(b.preventDefault(),p(r))}}),[p]),N=t.useMemo(()=>e.jsx(u,{isOpen:l,onOpenChange:r=>{r||c(!1)},media:a,index:y,onIndexChange:m,...o}),[l,a,y,o]);return{open:p,close:T,isOpen:l,index:y,element:N,triggerProps:R,getTriggerProps:P}}const Oe={title:"Core/Lightbox",component:u,tags:["autodocs"]},X="https://picsum.photos/id/10/1200/800",D=[{src:"https://picsum.photos/id/10/1200/800",alt:"Forest path",caption:"A winding path through the forest"},{src:"https://picsum.photos/id/15/1200/800",alt:"Mountain lake"},{src:"https://picsum.photos/id/20/1200/800",alt:"Beach sunset",caption:"Golden hour at the beach"},{src:"https://picsum.photos/id/25/1200/800",alt:"City skyline"}],L={render:()=>{const[s,a]=t.useState(!1);return e.jsxs(e.Fragment,{children:[e.jsx("button",{onClick:()=>a(!0),children:"Open lightbox"}),e.jsx(u,{isOpen:s,onOpenChange:a,media:{src:X,alt:"Forest path",caption:"A winding path through the forest"}})]})}},z={render:()=>{const[s,a]=t.useState(!1),[o,l]=t.useState(0);return e.jsxs(e.Fragment,{children:[e.jsx("div",{style:{display:"flex",gap:"8px"},children:D.map((c,y)=>e.jsx("img",{src:c.src,alt:c.alt,style:{width:120,height:80,objectFit:"cover",cursor:"pointer",borderRadius:4},onClick:()=>{l(y),a(!0)}},c.src))}),e.jsx(u,{isOpen:s,onOpenChange:a,media:D,index:o,onIndexChange:l})]})}},E={render:()=>{const[s,a]=t.useState(!1);return e.jsxs(e.Fragment,{children:[e.jsx("button",{onClick:()=>a(!0),children:"Open with zoom"}),e.jsx(u,{isOpen:s,onOpenChange:a,media:{src:X,alt:"Forest path"},hasZoom:!0})]})}},A={render:()=>{const[s,a]=t.useState(!1);return e.jsxs(e.Fragment,{children:[e.jsx("button",{onClick:()=>a(!0),children:"Open with caption"}),e.jsx(u,{isOpen:s,onOpenChange:a,media:{src:X,alt:"Forest path",caption:"A beautiful forest path winding through tall trees on a misty morning"}})]})}},S={render:()=>{const[s,a]=t.useState(!1);return e.jsxs(e.Fragment,{children:[e.jsx("button",{onClick:()=>a(!0),children:"Open video"}),e.jsx(u,{isOpen:s,onOpenChange:a,media:{src:"https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.webm",alt:"Flower blooming",type:"video",caption:"A flower blooming in time-lapse"}})]})}},M={render:()=>{const s=fe({media:D});return e.jsxs(e.Fragment,{children:[e.jsx("div",{style:{display:"flex",gap:"8px"},children:D.map((a,o)=>e.jsx("img",{src:a.src,alt:a.alt,style:{width:120,height:80,objectFit:"cover",cursor:"pointer",borderRadius:4},...s.getTriggerProps(o)},a.src))}),s.element]})}};L.parameters={...L.parameters,docs:{...L.parameters?.docs,source:{originalSource:`{
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
}`,...L.parameters?.docs?.source}}};z.parameters={...z.parameters,docs:{...z.parameters?.docs,source:{originalSource:`{
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
}`,...z.parameters?.docs?.source}}};E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
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
}`,...E.parameters?.docs?.source}}};A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
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
}`,...A.parameters?.docs?.source}}};S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
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
}`,...S.parameters?.docs?.source}}};M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
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
}`,...M.parameters?.docs?.source}}};const Ce=["Default","Gallery","WithZoom","WithCaption","Video","WithHook"];export{L as Default,z as Gallery,S as Video,A as WithCaption,M as WithHook,E as WithZoom,Ce as __namedExportsOrder,Oe as default};
