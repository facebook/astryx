import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{t}from"./react-BZJXY1be.js";import{n,t as r}from"./stylex-Dft6gtPK.js";import{n as i}from"./mergeProps-JRyAvMxc.js";import{n as a}from"./mergeRefs-CPqjs56a.js";import{n as o,t as s}from"./themeProps-CREkzZh6.js";import{n as c,t as l}from"./rtlStyles-Dba7YIbF.js";import{t as u}from"./jsx-runtime-DeHZSEgm.js";import{n as ee,t as d}from"./useTranslator-BMnme3me.js";import{n as f,t as p}from"./Icon-C24cO4CC.js";import{n as te,t as ne}from"./useIsomorphicLayoutEffect-vnms8l8s.js";import{n as re,t as ie}from"./useAnnounce-DW4eqOGv.js";import{n as ae,t as oe}from"./useScrollLock-DlXUsXsm.js";import{n as se,t as m}from"./IconButton-CAN7iEx1.js";function h({isOpen:e,onOpenChange:t,media:r,index:s,defaultIndex:l=0,onIndexChange:u,hasZoom:d=!1,hasAutoPlay:f=!1,xstyle:ne,className:ie,style:oe,ref:se,onClick:h,onKeyDown:y,...x}){let S=ee(),C=(0,g.useRef)(null),w=(0,g.useRef)(null),T=(0,g.useRef)(null),E=(0,g.useRef)(null),D=s!==void 0,[O,k]=(0,g.useState)(l),A=D?s:O,j=(0,g.useCallback)(e=>{D||k(e),u?.(e)},[D,u,k]),[M,N]=(0,g.useState)(1),[P,F]=(0,g.useState)({x:0,y:0}),[I,L]=(0,g.useState)(!1),R=(0,g.useRef)({x:0,y:0,panX:0,panY:0}),z=(0,g.useMemo)(()=>Array.isArray(r)?r:[r],[r]),B=z.length>1,V=z.length>0?z[Math.min(A,z.length-1)]:null,H=(V?.type??`image`)===`video`,U=B&&A>0,W=B&&A<z.length-1;ae(e),(0,g.useEffect)(()=>{N(1),F({x:0,y:0})},[A,V?.src]);let G=re(),le=(0,g.useRef)(A),ue=(0,g.useRef)(e);(0,g.useEffect)(()=>{let t=le.current!==A,n=ue.current;if(le.current=A,ue.current=e,!t||!e||!n)return;let r=z[Math.min(A,z.length-1)],i=`${A+1} of ${z.length}`;G(r?.alt?`${r.alt}, ${i}`:`Image ${i}`)},[A,e,G,z]),te(()=>{let t=C.current;t&&(e&&!t.open?(E.current=document.activeElement,t.showModal()):!e&&t.open&&(t.close(),E.current instanceof HTMLElement&&E.current.focus()))},[e]);let K=(0,g.useCallback)(()=>{t(!1)},[t]),de=(0,g.useCallback)(e=>{e.preventDefault(),K()},[K]),q=(0,g.useRef)(!1),fe=(0,g.useCallback)(e=>{if(q.current){q.current=!1;return}(e.target===e.currentTarget||e.target===w.current)&&K()},[K]),J=(0,g.useCallback)(()=>{U&&j(A-1)},[U,A,j]),Y=(0,g.useCallback)(()=>{W&&j(A+1)},[W,A,j]),X=(0,g.useCallback)(e=>{!d||H||e===M||(N(e),F({x:0,y:0}),G(S(e>1?`@astryx.lightbox.zoomedIn`:`@astryx.lightbox.zoomedOut`)))},[d,H,M,G,S]),Z=(0,g.useCallback)(()=>{X(M===1?2:1)},[X,M]),pe=(0,g.useCallback)(e=>{if(d&&!H){if(e.key===`+`||e.key===`=`){e.preventDefault(),X(2);return}if(e.key===`-`){e.preventDefault(),X(1);return}if(M>1&&b[e.key]!==void 0){e.preventDefault();let[t,n]=b[e.key];F(e=>({x:e.x+t,y:e.y+n}));return}}e.key===`ArrowLeft`?(e.preventDefault(),J()):e.key===`ArrowRight`&&(e.preventDefault(),Y())},[d,H,M,X,J,Y]),me=(0,g.useCallback)(e=>{(e.key===`Enter`||e.key===` `)&&(e.preventDefault(),Z())},[Z]),he=(0,g.useCallback)(e=>{M<=1||!d||(L(!0),q.current=!1,R.current={x:e.clientX,y:e.clientY,panX:P.x,panY:P.y})},[M,d,P]);(0,g.useEffect)(()=>{if(!I)return;let e=e=>{q.current=!0;let t=e.clientX-R.current.x,n=e.clientY-R.current.y;F({x:R.current.panX+t,y:R.current.panY+n})},t=()=>{L(!1)};return window.addEventListener(`pointermove`,e),window.addEventListener(`pointerup`,t),()=>{window.removeEventListener(`pointermove`,e),window.removeEventListener(`pointerup`,t)}},[I]);let Q=M>1,$=d&&!H,ge=M===1?null:`scale(${M}) translate(${P.x/M}px, ${P.y/M}px)`;return V?(0,_.jsx)(`dialog`,{ref:a(se,C),onCancel:de,onClick:e=>{fe(e),h?.(e)},onKeyDown:e=>{pe(e),y?.(e)},"aria-label":V.alt||S(`@astryx.lightbox.mediaViewer`),...i(o(`lightbox`),n(v.dialog,ne),ie,oe),...x,children:(0,_.jsxs)(`div`,{ref:w,className:`astryx78zum5 astryxdt5ytf astryx6s0dn4 astryxl56j7k astryxh8yej3 astryx5yr21d astryx1n2onr6`,children:[(0,_.jsx)(m,{icon:(0,_.jsx)(p,{icon:`close`,size:`sm`,color:`inherit`}),label:S(`@astryx.lightbox.close`),variant:`ghost`,onClick:K,xstyle:[v.closeButton,v.controlButton]}),B&&(0,_.jsx)(m,{icon:(0,_.jsx)(p,{icon:`chevronLeft`,size:`sm`,color:`inherit`,xstyle:c.mirror}),label:S(`@astryx.lightbox.previous`),variant:`ghost`,isDisabled:!U,onClick:J,xstyle:[v.navButton,v.navPrev,v.controlButton]}),(0,_.jsxs)(`div`,{className:`astryx78zum5 astryxdt5ytf astryx6s0dn4 astryx193iq5w astryxmz0i5r astryxb3r6kr`,children:[(0,_.jsx)(`div`,{ref:T,role:$?`button`:void 0,tabIndex:$?0:void 0,"aria-pressed":$?Q:void 0,"aria-label":$?S(`@astryx.lightbox.zoom`):void 0,...{0:{className:`astryx78zum5 astryx6s0dn4 astryxl56j7k astryxb3r6kr astryxt0e3qv astryx87ps6o astryx2lwn1j`},8:{className:`astryx78zum5 astryx6s0dn4 astryxl56j7k astryxb3r6kr astryxt0e3qv astryx87ps6o astryx2lwn1j astryx1a2a7pz astryx17nn4n9 astryx1wfwxd8 astryx7s97pk`},4:{className:`astryx78zum5 astryx6s0dn4 astryxl56j7k astryxb3r6kr astryx87ps6o astryx2lwn1j astryx1huxd7x astryx2dt3px`},12:{className:`astryx78zum5 astryx6s0dn4 astryxl56j7k astryxb3r6kr astryx87ps6o astryx2lwn1j astryx1a2a7pz astryx17nn4n9 astryx1wfwxd8 astryx7s97pk astryx1huxd7x astryx2dt3px`},2:{className:`astryx78zum5 astryx6s0dn4 astryxl56j7k astryxb3r6kr astryx87ps6o astryx2lwn1j astryx1jm3nie`},10:{className:`astryx78zum5 astryx6s0dn4 astryxl56j7k astryxb3r6kr astryx87ps6o astryx2lwn1j astryx1a2a7pz astryx17nn4n9 astryx1wfwxd8 astryx7s97pk astryx1jm3nie`},6:{className:`astryx78zum5 astryx6s0dn4 astryxl56j7k astryxb3r6kr astryx87ps6o astryx2lwn1j astryx1jm3nie`},14:{className:`astryx78zum5 astryx6s0dn4 astryxl56j7k astryxb3r6kr astryx87ps6o astryx2lwn1j astryx1a2a7pz astryx17nn4n9 astryx1wfwxd8 astryx7s97pk astryx1jm3nie`},1:{className:`astryx78zum5 astryx6s0dn4 astryxl56j7k astryxb3r6kr astryx87ps6o astryx2lwn1j astryxi9pz9s`},9:{className:`astryx78zum5 astryx6s0dn4 astryxl56j7k astryxb3r6kr astryx87ps6o astryx2lwn1j astryx1a2a7pz astryx17nn4n9 astryx1wfwxd8 astryx7s97pk astryxi9pz9s`},5:{className:`astryx78zum5 astryx6s0dn4 astryxl56j7k astryxb3r6kr astryx87ps6o astryx2lwn1j astryxi9pz9s`},13:{className:`astryx78zum5 astryx6s0dn4 astryxl56j7k astryxb3r6kr astryx87ps6o astryx2lwn1j astryx1a2a7pz astryx17nn4n9 astryx1wfwxd8 astryx7s97pk astryxi9pz9s`},3:{className:`astryx78zum5 astryx6s0dn4 astryxl56j7k astryxb3r6kr astryx87ps6o astryx2lwn1j astryxi9pz9s`},11:{className:`astryx78zum5 astryx6s0dn4 astryxl56j7k astryxb3r6kr astryx87ps6o astryx2lwn1j astryx1a2a7pz astryx17nn4n9 astryx1wfwxd8 astryx7s97pk astryxi9pz9s`},7:{className:`astryx78zum5 astryx6s0dn4 astryxl56j7k astryxb3r6kr astryx87ps6o astryx2lwn1j astryxi9pz9s`},15:{className:`astryx78zum5 astryx6s0dn4 astryxl56j7k astryxb3r6kr astryx87ps6o astryx2lwn1j astryx1a2a7pz astryx17nn4n9 astryx1wfwxd8 astryx7s97pk astryxi9pz9s`}}[!!$<<3|!!(!H&&d&&!Q)<<2|!!(!H&&Q)<<1|!!(!H&&I)<<0],onDoubleClick:H?void 0:Z,onKeyDown:$?me:void 0,onPointerDown:H?void 0:he,children:H?(0,_.jsx)(`video`,{src:V.src,"aria-label":V.alt,controls:!0,autoPlay:f,className:`astryx193iq5w astryxmz0i5r astryx19kjcj4 astryx1a2a7pz`}):(0,_.jsx)(`img`,{src:V.src,alt:V.alt,draggable:!1,...n(v.image,I&&v.imageDragging,ge!=null&&ce.imageTransform(ge))})}),V.caption&&(0,_.jsx)(`div`,{className:`astryx9e3rv5 astryx18juvz8 astryxf74fhv astryx2b8uid astryx1xye8es astryx18d9i69 astryxrrkdod astryxrlsmeg astryx2lah0s`,children:V.caption})]}),B&&(0,_.jsx)(m,{icon:(0,_.jsx)(p,{icon:`chevronRight`,size:`sm`,color:`inherit`,xstyle:c.mirror}),label:S(`@astryx.lightbox.next`),variant:`ghost`,isDisabled:!W,onClick:Y,xstyle:[v.navButton,v.navNext,v.controlButton]}),B&&z.length>1&&(0,_.jsxs)(`div`,{className:`astryx10l6tqk astryxyx6v2t astryx1ybfrjj astryx9e3rv5 astryxjm74w1 astryxw6l6zx astryx1vjfegm`,children:[A+1,` / `,z.length]})]})}):null}var g,_,v,ce,y,b;function x(){return(x=e((()=>{g=t(),r(),f(),se(),ie(),oe(),ne(),l(),s(),d(),_=u(),v={dialog:{kVAEAm:`astryxixxii4`,kpwlN0:`astryx10a8y8t`,kzqmXN:`astryxn9wirt`,kZKoxP:`astryx1dr59a3`,ks0D6T:`astryx1x1rfll`,kskxy:`astryx7ab17h`,kogj98:`astryx1ghz6dp`,kmVPX3:`astryx1717udv`,kQgIW9:`astryx1gs6z28`,kWkggS:`astryxjbqb8w`,kVQacm:`astryxb3r6kr`,kI3sdo:`astryx1a2a7pz`,kGyWv1:`astryxnixb3f`,kba3nw:`astryx1abwkk1`,$$css:!0},image:{ks0D6T:`astryx193iq5w`,kskxy:`astryxmz0i5r`,kVIFPx:`astryx19kjcj4`,kfzvcC:`astryx47corl`,k1ekBW:`astryx11xpdln`,kIyJzY:`astryx13dflua astryx12w9bfk`,kAMwcw:`astryx9lcvmn`,$$css:!0},imageDragging:{k1ekBW:`astryx13b0p5u`,$$css:!0},closeButton:{kVAEAm:`astryx10l6tqk`,k87sOh:`astryxyx6v2t`,kt4wiu:`astryx1mcfs9z`,kbCHJM:null,kCIrl2:null,kY2c9j:`astryx1vjfegm`,$$css:!0},navButton:{kVAEAm:`astryx10l6tqk`,k87sOh:`astryxwa60dl`,kIY38u:`astryx3sa99s`,kY2c9j:`astryx1vjfegm`,$$css:!0},navPrev:{kLqNvP:`astryx1ybfrjj`,kbCHJM:null,kCIrl2:null,$$css:!0},navNext:{kt4wiu:`astryx1mcfs9z`,kbCHJM:null,kCIrl2:null,$$css:!0},controlButton:{kMwMTN:`astryx9e3rv5`,$$css:!0}},ce={imageTransform:e=>[{k3aq6I:e==null?e:`astryxsqj5wx`,$$css:!0},{"--x-transform":e??void 0}]},y=50,b={ArrowLeft:[y,0],ArrowRight:[-50,0],ArrowUp:[0,y],ArrowDown:[0,-50]},h.displayName=`Lightbox`,h.__docgenInfo={description:`A fullscreen overlay for viewing images at full resolution.

Supports single image and gallery modes. In gallery mode, provides
prev/next navigation via buttons and arrow keys. Optionally supports
zoom (double-click, Enter/Space on the image, or \`+\`/\`-\` to toggle 2x)
and pan (drag or arrow keys when zoomed; arrows navigate the gallery
when not zoomed).

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
\`\`\``,methods:[],displayName:`Lightbox`,props:{xstyle:{required:!1,tsType:{name:`StyleXStyles`},description:"StyleX styles created via `stylex.create()`. Merged with the component's\nbase styles inside a single `stylex.props()` call for optimal deduplication.\n\n@example\n```\nconst overrides = stylex.create({ root: { marginBottom: 8 } });\n<Component xstyle={overrides.root} />\n```"},ref:{required:!1,tsType:{name:`ReactRef`,raw:`React.Ref<HTMLDialogElement>`,elements:[{name:`HTMLDialogElement`}]},description:`Ref forwarded to the root dialog element`},isOpen:{required:!0,tsType:{name:`boolean`},description:`Whether the lightbox is open.`},onOpenChange:{required:!0,tsType:{name:`signature`,type:`function`,raw:`(isOpen: boolean) => void`,signature:{arguments:[{type:{name:`boolean`},name:`isOpen`}],return:{name:`void`}}},description:"Callback when the lightbox open state changes.\nCalled with `false` on Escape, backdrop click, or close button."},media:{required:!0,tsType:{name:`union`,raw:`LightboxMedia | LightboxMedia[]`,elements:[{name:`LightboxMedia`},{name:`Array`,elements:[{name:`LightboxMedia`}],raw:`LightboxMedia[]`}]},description:`Media to display. Pass a single object for one item, or an array
for gallery mode with prev/next navigation.`},index:{required:!1,tsType:{name:`number`},description:"Current index in gallery mode (when `media` is an array).\nWhen provided, puts the component in controlled mode."},defaultIndex:{required:!1,tsType:{name:`number`},description:`Initial index in gallery mode for uncontrolled usage.
@default 0`,defaultValue:{value:`0`,computed:!1}},onIndexChange:{required:!1,tsType:{name:`signature`,type:`function`,raw:`(index: number) => void`,signature:{arguments:[{type:{name:`number`},name:`index`}],return:{name:`void`}}},description:`Callback when the gallery index changes via prev/next navigation.`},hasZoom:{required:!1,tsType:{name:`boolean`},description:"Enable zoom on double-click, or Enter/Space/`+`/`-` via keyboard\n(images only). When zoomed, drag or use arrow keys to pan.\n@default false",defaultValue:{value:`false`,computed:!1}},hasAutoPlay:{required:!1,tsType:{name:`boolean`},description:`Whether video should autoplay when the lightbox opens.
@default false`,defaultValue:{value:`false`,computed:!1}}},composes:[`Omit`]}})))()}function S(e){let{media:t,...n}=e,[r,i]=(0,C.useState)(!1),[a,o]=(0,C.useState)(0),s=(0,C.useCallback)((e=0)=>{o(e),i(!0)},[]),c=(0,C.useCallback)(()=>{i(!1)},[]),l=(0,C.useMemo)(()=>({role:`button`,tabIndex:0,"aria-haspopup":`dialog`,onClick:()=>s(),onKeyDown:e=>{(e.key===`Enter`||e.key===` `)&&(e.preventDefault(),s())}}),[s]),u=(0,C.useCallback)(e=>({role:`button`,tabIndex:0,"aria-haspopup":`dialog`,onClick:()=>s(e),onKeyDown:t=>{(t.key===`Enter`||t.key===` `)&&(t.preventDefault(),s(e))}}),[s]);return{open:s,close:c,isOpen:r,index:a,element:(0,C.useMemo)(()=>(0,w.jsx)(h,{isOpen:r,onOpenChange:e=>{e||i(!1)},media:t,index:a,onIndexChange:o,...n}),[r,t,a,n]),triggerProps:l,getTriggerProps:u}}var C,w;function T(){return(T=e((()=>{C=t(),x(),w=u()})))()}var E,D,O,k,A,j,M,N,P,F,I,L;function R(){return(R=e((()=>{E=t(),x(),T(),D=u(),O={title:`Core/Lightbox`,component:h,tags:[`autodocs`]},k=`https://picsum.photos/id/10/1200/800`,A=[{src:`https://picsum.photos/id/10/1200/800`,alt:`Forest path`,caption:`A winding path through the forest`},{src:`https://picsum.photos/id/15/1200/800`,alt:`Mountain lake`},{src:`https://picsum.photos/id/20/1200/800`,alt:`Beach sunset`,caption:`Golden hour at the beach`},{src:`https://picsum.photos/id/25/1200/800`,alt:`City skyline`}],j={render:()=>{let[e,t]=(0,E.useState)(!1);return(0,D.jsxs)(D.Fragment,{children:[(0,D.jsx)(`button`,{onClick:()=>t(!0),children:`Open lightbox`}),(0,D.jsx)(h,{isOpen:e,onOpenChange:t,media:{src:k,alt:`Forest path`,caption:`A winding path through the forest`}})]})}},M={render:()=>{let[e,t]=(0,E.useState)(!1),[n,r]=(0,E.useState)(0);return(0,D.jsxs)(D.Fragment,{children:[(0,D.jsx)(`div`,{style:{display:`flex`,gap:`8px`},children:A.map((e,n)=>(0,D.jsx)(`img`,{src:e.src,alt:e.alt,style:{width:120,height:80,objectFit:`cover`,cursor:`pointer`,borderRadius:4},onClick:()=>{r(n),t(!0)}},e.src))}),(0,D.jsx)(h,{isOpen:e,onOpenChange:t,media:A,index:n,onIndexChange:r})]})}},N={render:()=>{let[e,t]=(0,E.useState)(!1);return(0,D.jsxs)(D.Fragment,{children:[(0,D.jsx)(`button`,{onClick:()=>t(!0),children:`Open with zoom`}),(0,D.jsx)(h,{isOpen:e,onOpenChange:t,media:{src:k,alt:`Forest path`},hasZoom:!0})]})}},P={render:()=>{let[e,t]=(0,E.useState)(!1);return(0,D.jsxs)(D.Fragment,{children:[(0,D.jsx)(`button`,{onClick:()=>t(!0),children:`Open with caption`}),(0,D.jsx)(h,{isOpen:e,onOpenChange:t,media:{src:k,alt:`Forest path`,caption:`A beautiful forest path winding through tall trees on a misty morning`}})]})}},F={render:()=>{let[e,t]=(0,E.useState)(!1);return(0,D.jsxs)(D.Fragment,{children:[(0,D.jsx)(`button`,{onClick:()=>t(!0),children:`Open video`}),(0,D.jsx)(h,{isOpen:e,onOpenChange:t,media:{src:`https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.webm`,alt:`Flower blooming`,type:`video`,caption:`A flower blooming in time-lapse`}})]})}},I={render:()=>{let e=S({media:A});return(0,D.jsxs)(D.Fragment,{children:[(0,D.jsx)(`div`,{style:{display:`flex`,gap:`8px`},children:A.map((t,n)=>(0,D.jsx)(`img`,{src:t.src,alt:t.alt,style:{width:120,height:80,objectFit:`cover`,cursor:`pointer`,borderRadius:4},...e.getTriggerProps(n)},t.src))}),e.element]})}},j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
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
}`,...j.parameters?.docs?.source}}},M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
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
}`,...M.parameters?.docs?.source}}},N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
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
}`,...N.parameters?.docs?.source}}},P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
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
}`,...P.parameters?.docs?.source}}},F.parameters={...F.parameters,docs:{...F.parameters?.docs,source:{originalSource:`{
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
}`,...F.parameters?.docs?.source}}},I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{
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
}`,...I.parameters?.docs?.source}}},L=[`Default`,`Gallery`,`WithZoom`,`WithCaption`,`Video`,`WithHook`]})))()}R();export{j as Default,M as Gallery,F as Video,P as WithCaption,I as WithHook,N as WithZoom,L as __namedExportsOrder,O as default};