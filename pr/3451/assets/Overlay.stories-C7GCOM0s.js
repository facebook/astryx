import{a1 as e,a6 as P,af as D,ay as N,M as Y,ah as d,aH as K,aI as Z,a7 as ee,T as n,B as g,e as te}from"./iframe-VDTgZ3S9.js";import{A as u}from"./AspectRatio-BiFZUOTT.js";import{C as G}from"./Card-rxGhBGMB.js";import{L as re,b as se}from"./LayoutContent-BLolduJZ.js";import{G as ae}from"./Grid-ZksSr6ps.js";import{V as p}from"./VStack-DObtVm3i.js";import{H as I}from"./Heading-CUggt4vn.js";import"./preload-helper-Ct5FWWRu.js";import"./container.stylex-uilBL6DE.js";import"./padding.stylex-Dl2_Pyt1.js";import"./stack.stylex-BlarxY2N.js";import"./stackItem.stylex-CgqrJM4N.js";import"./Stack-YX98LP5s.js";const B={astryx84s7jz:"astryx84s7jz",$$css:!0},z={root:{kVAEAm:"astryx1n2onr6",kVQacm:"astryx7giv3",kXHlph:null,kORKVm:null,$$css:!0}},r={base:{kVAEAm:"astryx10l6tqk",k1xSpc:"astryx78zum5",kXwgrk:"astryxdt5ytf",kOIVth:"astryx1txdalj",kmVPX3:"astryx1b2ylru",kfzvcC:"astryx47corl",k1ekBW:"astryxxup5nn",kIyJzY:"astryxuedmi6 astryx12w9bfk",kAMwcw:"astryxlr8y92",$$css:!0},fill:{kpwlN0:"astryx10a8y8t",kkqhue:null,kLqNvP:null,kt4wiu:null,kbCHJM:null,kCIrl2:null,kYYq5F:null,k87sOh:null,krVfgx:null,$$css:!0},bottom:{kkqhue:"astryx17y0mx6",kLqNvP:null,kt4wiu:null,kbCHJM:null,kCIrl2:null,krVfgx:"astryx1ey2m1c",$$css:!0},top:{kkqhue:"astryx17y0mx6",kLqNvP:null,kt4wiu:null,kbCHJM:null,kCIrl2:null,k87sOh:"astryx13vifvy",$$css:!0},alignStart:{kGNEyG:"astryx1cy8zhl",kjj79g:"astryx1nhvcw1",$$css:!0},alignCenter:{kGNEyG:"astryx6s0dn4",kjj79g:"astryxl56j7k",$$css:!0},alignEnd:{kGNEyG:"astryxuk3077",kjj79g:"astryx1nhvcw1",$$css:!0},scrimDark:{kWkggS:"astryx1u4601x",$$css:!0},scrimLight:{kWkggS:"astryx1rkw3yq",$$css:!0},hidden:{kSiTet:"astryxg01cxk",k33iCy:"astryxlshs6z",$$css:!0},hiddenBottom:{k3aq6I:"astryx1weeur4",$$css:!0},hiddenTop:{k3aq6I:"astryx105ttfm",$$css:!0},visible:{kSiTet:"astryx1hc1fzr",k33iCy:"astryxnpuxes",kfzvcC:"astryx67bb7w",k3aq6I:"astryxnn1q72",kamtoy:"astryx4itv7f",$$css:!0},visibleFromBottom:{kamtoy:"astryx4itv7f",k1tdAh:"astryxhbqy3z",$$css:!0},visibleFromTop:{kamtoy:"astryx4itv7f",k1tdAh:"astryxub2912",$$css:!0},hoverReveal:{kSiTet:"astryxg01cxk astryx1134dr astryxmjy534",k33iCy:"astryxlshs6z astryxmroob4 astryx1pnqce0",kfzvcC:"astryx47corl astryx1bx8uv astryx1wxn7w2",$$css:!0},hoverRevealBottom:{k3aq6I:"astryx1weeur4 astryxz1nbhx astryx1fws1wb",$$css:!0},hoverRevealTop:{k3aq6I:"astryx105ttfm astryxz1nbhx astryx1fws1wb",$$css:!0},focusReveal:{kSiTet:"astryxg01cxk astryxmjy534",k33iCy:"astryxlshs6z astryx1pnqce0",kfzvcC:"astryx47corl astryx1wxn7w2",$$css:!0},focusRevealBottom:{k3aq6I:"astryx1weeur4 astryx1fws1wb",$$css:!0},focusRevealTop:{k3aq6I:"astryx105ttfm astryx1fws1wb",$$css:!0}},oe={start:r.alignStart,center:r.alignCenter,end:r.alignEnd},ne={fill:r.fill,bottom:r.bottom,top:r.top};function ie(s,t){return s?{base:r.visible,bottom:t==="bottom"&&r.visibleFromBottom,top:t==="top"&&r.visibleFromTop}:{base:r.hidden,bottom:t==="bottom"&&r.hiddenBottom,top:t==="top"&&r.hiddenTop}}function le(s,t){switch(s){case"always":return{base:r.visible,bottom:t==="bottom"&&r.visibleFromBottom,top:t==="top"&&r.visibleFromTop};case"hover":case"hover-or-focus":return{base:r.hoverReveal,bottom:t==="bottom"&&r.hoverRevealBottom,top:t==="top"&&r.hoverRevealTop};case"focus":return{base:r.focusReveal,bottom:t==="bottom"&&r.focusRevealBottom,top:t==="top"&&r.focusRevealTop}}}function _({scrim:s,position:t,align:i,showOn:l,isOpen:c,children:m}){const y=c!==void 0,v=s==="dark"?"dark":s==="light"?"light":null,k=v?e.jsx(Y,{mode:v,children:m}):m,h=y?ie(c,t):le(l,t);return e.jsx("div",{...P(N("overlay-scrim",{position:t}),D(r.base,ne[t],oe[i],s==="dark"&&r.scrimDark,s==="light"&&r.scrimLight,h.base,h.bottom,h.top)),inert:y&&!c?!0:void 0,children:k})}_.__docgenInfo={description:"",methods:[],displayName:"OverlayScrim",props:{scrim:{required:!0,tsType:{name:"union",raw:"'dark' | 'light' | false",elements:[{name:"literal",value:"'dark'"},{name:"literal",value:"'light'"},{name:"literal",value:"false"}]},description:""},position:{required:!0,tsType:{name:"union",raw:"'fill' | 'bottom' | 'top'",elements:[{name:"literal",value:"'fill'"},{name:"literal",value:"'bottom'"},{name:"literal",value:"'top'"}]},description:""},align:{required:!0,tsType:{name:"union",raw:"'start' | 'center' | 'end'",elements:[{name:"literal",value:"'start'"},{name:"literal",value:"'center'"},{name:"literal",value:"'end'"}]},description:""},showOn:{required:!0,tsType:{name:"union",raw:"'hover' | 'always' | 'focus' | 'hover-or-focus'",elements:[{name:"literal",value:"'hover'"},{name:"literal",value:"'always'"},{name:"literal",value:"'focus'"},{name:"literal",value:"'hover-or-focus'"}]},description:""},isOpen:{required:!0,tsType:{name:"union",raw:"boolean | undefined",elements:[{name:"boolean"},{name:"undefined"}]},description:""},children:{required:!0,tsType:{name:"ReactNode"},description:""}}};function ce(){return typeof window>"u"?!1:window.matchMedia("(hover: none)").matches}function de(s){if(typeof window>"u")return()=>{};const t=window.matchMedia("(hover: none)");return t.addEventListener("change",s),()=>t.removeEventListener("change",s)}function pe(){return!1}function U({content:s,showOn:t="always",isOpen:i,scrim:l="dark",position:c="fill",align:m="end"}={}){const y=d.useRef(null),v=d.useSyncExternalStore(de,ce,pe),[k,h]=d.useState(!1),a=v&&(t==="hover"||t==="hover-or-focus"),f=d.useCallback(()=>{h(M=>!M)},[]),{onClick:b,onMouseUp:x}=K({containerRef:y,onClick:a?f:void 0,disabled:!a}),L=i!==void 0?i:a?k:void 0,E=D(B,z.root),Q=d.useMemo(()=>({className:E.className??void 0,style:E.style??void 0,onClick:a?b:void 0,onMouseUp:a?x:void 0}),[E.className,E.style,a,b,x]),V=d.useCallback(M=>e.jsx(_,{scrim:l,position:c,align:m,showOn:t,isOpen:L,children:M}),[l,c,m,t,L]),X=s!=null?V(s):null;return{containerRef:y,containerProps:Q,element:X,renderOverlay:V}}function o({children:s,content:t,showOn:i,isOpen:l,scrim:c,position:m,align:y,xstyle:v,className:k,style:h,ref:H}){const a=U({content:t,showOn:i,isOpen:l,scrim:c,position:m,align:y});return Z(()=>{const f=a.containerRef.current;if(!f)return;const b=f.firstElementChild;if(!b)return;const x=getComputedStyle(b).borderRadius;x&&x!=="0px"&&(f.style.borderRadius=x)},[]),e.jsxs("div",{ref:ee(H,a.containerRef),...P(N("overlay"),D(B,z.root,v),k,h),onClick:a.containerProps.onClick,onMouseUp:a.containerProps.onMouseUp,children:[s,a.element]})}o.displayName="Overlay";o.__docgenInfo={description:`Overlay — renders content on top of media with a scrim background
and automatic theme inversion.

\`children\` = base content, \`content\` = what appears on top.

@compositionHint Wrap images, video, or media content.

@example
\`\`\`
<Overlay
  showOn="hover"
  content={<Button label="Quick view" variant="ghost" />}>
  <AspectRatio ratio={16/9}>
    <img src="hero.jpg" style={{objectFit: 'cover', width: '100%', height: '100%'}} />
  </AspectRatio>
</Overlay>
\`\`\``,methods:[],displayName:"Overlay",props:{ref:{required:!1,tsType:{name:"Ref",elements:[{name:"HTMLDivElement"}],raw:"Ref<HTMLDivElement>"},description:"Ref forwarded to the container element."},children:{required:!1,tsType:{name:"ReactNode"},description:"Base content (image, card, video, etc.)."},content:{required:!0,tsType:{name:"ReactNode"},description:"Content rendered inside the overlay scrim."},showOn:{required:!1,tsType:{name:"union",raw:"'hover' | 'always' | 'focus' | 'hover-or-focus'",elements:[{name:"literal",value:"'hover'"},{name:"literal",value:"'always'"},{name:"literal",value:"'focus'"},{name:"literal",value:"'hover-or-focus'"}]},description:'@default "always"'},isOpen:{required:!1,tsType:{name:"boolean"},description:"JS-controlled visibility override."},scrim:{required:!1,tsType:{name:"union",raw:"'dark' | 'light' | false",elements:[{name:"literal",value:"'dark'"},{name:"literal",value:"'light'"},{name:"literal",value:"false"}]},description:'@default "dark"'},position:{required:!1,tsType:{name:"union",raw:"'fill' | 'bottom' | 'top'",elements:[{name:"literal",value:"'fill'"},{name:"literal",value:"'bottom'"},{name:"literal",value:"'top'"}]},description:'@default "fill"'},align:{required:!1,tsType:{name:"union",raw:"'start' | 'center' | 'end'",elements:[{name:"literal",value:"'start'"},{name:"literal",value:"'center'"},{name:"literal",value:"'end'"}]},description:'@default "end"'}},composes:["Pick"]};const ue={metadata:{kmVPX3:"x1tamke2",kg3NbH:null,kuDDbn:null,kE3dHu:null,kP0aTx:null,kpe85a:null,k8WAf4:null,kLKAdn:null,kGO01o:null,$$css:!0}},F="https://picsum.photos/seed/xds-overlay/800/450",J="https://picsum.photos/seed/xds-overlay-2/800/450",W="https://picsum.photos/seed/xds-overlay-3/800/450",me="https://picsum.photos/seed/xds-hero/1200/600",Te={title:"Core/Overlay",component:o,tags:["autodocs"],decorators:[s=>e.jsx("div",{className:"x1eiddq6 x1gt495",children:e.jsx(s,{})})]},w={render:()=>e.jsx("div",{style:{width:400},children:e.jsx(o,{showOn:"hover",align:"center",content:e.jsx(g,{label:"Quick view",variant:"ghost"}),children:e.jsx(u,{ratio:16/9,children:e.jsx("img",{src:F,alt:"Product",className:"xl1xv1r xh8yej3 x5yr21d x1lliihq"})})})})},j={render:()=>e.jsx("div",{style:{width:600},children:e.jsx(o,{position:"bottom",align:"start",content:e.jsxs(p,{gap:1,children:[e.jsx(I,{level:3,children:"Gallery Collection"}),e.jsx(n,{type:"supporting",color:"secondary",children:"24 items · Updated today"})]}),children:e.jsx(u,{ratio:2,children:e.jsx("img",{src:me,alt:"Hero",className:"xl1xv1r xh8yej3 x5yr21d x1lliihq"})})})})},S={render:()=>e.jsx(o,{showOn:"hover",align:"center",content:e.jsx(g,{label:"View Details",variant:"ghost"}),children:e.jsx(G,{width:360,children:e.jsx(re,{content:e.jsx(se,{children:e.jsxs(p,{gap:2,children:[e.jsx(I,{level:3,children:"Project Alpha"}),e.jsx(n,{children:"A comprehensive design system for building internal tools with consistent, accessible interfaces."}),e.jsx(n,{type:"supporting",color:"secondary",children:"Updated 2 hours ago · 12 contributors"})]})})})})})},O={render:()=>e.jsx("div",{style:{width:400},children:e.jsx(o,{showOn:"hover-or-focus",align:"center",content:e.jsx(g,{label:"Edit",variant:"ghost"}),children:e.jsx(u,{ratio:16/9,children:e.jsx("img",{src:J,alt:"Photo",className:"xl1xv1r xh8yej3 x5yr21d x1lliihq"})})})})},A={render:function(){const[t,i]=d.useState(!1);return e.jsxs(p,{gap:4,style:{width:300},children:[e.jsx(g,{label:t?"Cancel upload":"Simulate upload",onClick:()=>i(l=>!l)}),e.jsx(o,{isOpen:t,scrim:"light",align:"center",content:e.jsxs(p,{gap:2,hAlign:"center",children:[e.jsx(te,{size:"md"}),e.jsx(n,{weight:"bold",children:"Uploading..."})]}),children:e.jsx(u,{ratio:1,children:e.jsx("img",{src:W,alt:"Upload",className:"xl1xv1r xh8yej3 x5yr21d x1lliihq"})})})]})}},T={render:()=>{const s=[{src:"https://picsum.photos/seed/g1/400/400",title:"Mountain Lake"},{src:"https://picsum.photos/seed/g2/400/400",title:"Forest Path"},{src:"https://picsum.photos/seed/g3/400/400",title:"Ocean Sunset"},{src:"https://picsum.photos/seed/g4/400/400",title:"City Skyline"},{src:"https://picsum.photos/seed/g5/400/400",title:"Desert Dunes"},{src:"https://picsum.photos/seed/g6/400/400",title:"Snowy Peaks"}];return e.jsx(ae,{columns:3,gap:4,children:s.map(t=>e.jsx(o,{showOn:"hover",position:"bottom",align:"start",content:e.jsx(n,{weight:"bold",children:t.title}),children:e.jsx(u,{ratio:1,children:e.jsx("img",{src:t.src,alt:t.title,className:"xl1xv1r xh8yej3 x5yr21d x1lliihq"})})},t.title))})}},C={render:()=>e.jsx("div",{style:{width:400},children:e.jsx(o,{showOn:"hover",align:"center",content:e.jsxs(p,{gap:2,hAlign:"center",children:[e.jsx(n,{weight:"bold",size:"lg",children:"▶"}),e.jsx(n,{weight:"bold",children:"Introduction to Astryx"})]}),children:e.jsx(u,{ratio:16/9,children:e.jsx("img",{src:F,alt:"Video",className:"xl1xv1r xh8yej3 x5yr21d x1lliihq"})})})})},R={render:function(){const t=U({showOn:"hover",position:"bottom",align:"start",content:e.jsx(I,{level:4,children:"Featured Article"})});return e.jsxs(G,{width:360,ref:t.containerRef,...t.containerProps,children:[e.jsxs("div",{className:"x1n2onr6",children:[e.jsx(u,{ratio:16/9,children:e.jsx("img",{src:J,alt:"Article",className:"xl1xv1r xh8yej3 x5yr21d x1lliihq"})}),t.element]}),e.jsxs(p,{gap:1,xstyle:ue.metadata,children:[e.jsx(n,{type:"supporting",color:"secondary",children:"Jan 15, 2026 · 5 min read"}),e.jsx(n,{type:"supporting",color:"secondary",children:"By Jane Author"})]})]})}},$={render:function(){const[t,i]=d.useState(!1);return e.jsxs(p,{gap:4,style:{width:400},children:[e.jsx(g,{label:t?"Simulate drag leave":"Simulate drag enter",variant:"secondary",onClick:()=>i(l=>!l)}),e.jsx(o,{isOpen:t,align:"center",content:e.jsxs(p,{gap:2,hAlign:"center",children:[e.jsx(n,{size:"lg",children:"📁"}),e.jsx(n,{weight:"bold",children:"Drop files here"})]}),children:e.jsx("div",{className:"xz65tgg x78zum5 x6s0dn4 xl56j7k xdh2fpr xbsl7fq x14i3s5s xur7f20 x1shk3sm",children:e.jsx("p",{className:"x9ynric xv1l7n4",children:"Drop files here or click to browse"})})})]})}},q={render:()=>e.jsx("div",{style:{width:300},children:e.jsx(o,{showOn:"hover",scrim:!1,align:"center",content:e.jsx(g,{label:"♡",variant:"ghost"}),children:e.jsx(u,{ratio:1,children:e.jsx("img",{src:W,alt:"Selected",className:"xl1xv1r xh8yej3 x5yr21d x1lliihq"})})})})};w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    width: 400
  }}>
      <Overlay showOn="hover" align="center" content={<Button label="Quick view" variant="ghost" />}>
        <AspectRatio ratio={16 / 9}>
          <img src={SAMPLE_IMAGE} alt="Product" {...stylex.props(styles.image)} />
        </AspectRatio>
      </Overlay>
    </div>
}`,...w.parameters?.docs?.source},description:{story:"Basic hover overlay on an image.",...w.parameters?.docs?.description}}};j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    width: 600
  }}>
      <Overlay position="bottom" align="start" content={<VStack gap={1}>
            <Heading level={3}>Gallery Collection</Heading>
            <Text type="supporting" color="secondary">
              24 items · Updated today
            </Text>
          </VStack>}>
        <AspectRatio ratio={2}>
          <img src={SAMPLE_HERO} alt="Hero" {...stylex.props(styles.image)} />
        </AspectRatio>
      </Overlay>
    </div>
}`,...j.parameters?.docs?.source},description:{story:"Always-visible bottom strip with title over a hero image.",...j.parameters?.docs?.description}}};S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  render: () => <Overlay showOn="hover" align="center" content={<Button label="View Details" variant="ghost" />}>
      <Card width={360}>
        <Layout content={<LayoutContent>
              <VStack gap={2}>
                <Heading level={3}>Project Alpha</Heading>
                <Text>
                  A comprehensive design system for building internal tools with
                  consistent, accessible interfaces.
                </Text>
                <Text type="supporting" color="secondary">
                  Updated 2 hours ago · 12 contributors
                </Text>
              </VStack>
            </LayoutContent>} />
      </Card>
    </Overlay>
}`,...S.parameters?.docs?.source},description:{story:"Full overlay wrapping a Card.",...S.parameters?.docs?.description}}};O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    width: 400
  }}>
      <Overlay showOn="hover-or-focus" align="center" content={<Button label="Edit" variant="ghost" />}>
        <AspectRatio ratio={16 / 9}>
          <img src={SAMPLE_IMAGE_2} alt="Photo" {...stylex.props(styles.image)} />
        </AspectRatio>
      </Overlay>
    </div>
}`,...O.parameters?.docs?.source},description:{story:"Hover + focus — also appears on keyboard focus.",...O.parameters?.docs?.description}}};A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  render: function LoadingOverlayStory() {
    const [isUploading, setIsUploading] = useState(false);
    return <VStack gap={4} style={{
      width: 300
    }}>
        <Button label={isUploading ? 'Cancel upload' : 'Simulate upload'} onClick={() => setIsUploading(v => !v)} />
        <Overlay isOpen={isUploading} scrim="light" align="center" content={<VStack gap={2} hAlign="center">
              <Spinner size="md" />
              <Text weight="bold">Uploading...</Text>
            </VStack>}>
          <AspectRatio ratio={1}>
            <img src={SAMPLE_IMAGE_3} alt="Upload" {...stylex.props(styles.image)} />
          </AspectRatio>
        </Overlay>
      </VStack>;
  }
}`,...A.parameters?.docs?.source},description:{story:"Light scrim for loading/upload states.",...A.parameters?.docs?.description}}};T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  render: () => {
    const images = [{
      src: 'https://picsum.photos/seed/g1/400/400',
      title: 'Mountain Lake'
    }, {
      src: 'https://picsum.photos/seed/g2/400/400',
      title: 'Forest Path'
    }, {
      src: 'https://picsum.photos/seed/g3/400/400',
      title: 'Ocean Sunset'
    }, {
      src: 'https://picsum.photos/seed/g4/400/400',
      title: 'City Skyline'
    }, {
      src: 'https://picsum.photos/seed/g5/400/400',
      title: 'Desert Dunes'
    }, {
      src: 'https://picsum.photos/seed/g6/400/400',
      title: 'Snowy Peaks'
    }];
    return <Grid columns={3} gap={4}>
        {images.map(img => <Overlay key={img.title} showOn="hover" position="bottom" align="start" content={<Text weight="bold">{img.title}</Text>}>
            <AspectRatio ratio={1}>
              <img src={img.src} alt={img.title} {...stylex.props(styles.image)} />
            </AspectRatio>
          </Overlay>)}
      </Grid>;
  }
}`,...T.parameters?.docs?.source},description:{story:"Gallery grid — each image has its own hover overlay.",...T.parameters?.docs?.description}}};C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    width: 400
  }}>
      <Overlay showOn="hover" align="center" content={<VStack gap={2} hAlign="center">
            <Text weight="bold" size="lg">
              ▶
            </Text>
            <Text weight="bold">Introduction to Astryx</Text>
          </VStack>}>
        <AspectRatio ratio={16 / 9}>
          <img src={SAMPLE_IMAGE} alt="Video" {...stylex.props(styles.image)} />
        </AspectRatio>
      </Overlay>
    </div>
}`,...C.parameters?.docs?.source},description:{story:"Video thumbnail with duration badge (always visible) + hover play overlay.",...C.parameters?.docs?.description}}};R.parameters={...R.parameters,docs:{...R.parameters?.docs,source:{originalSource:`{
  render: function DisconnectedHoverStory() {
    const overlay = useOverlay({
      showOn: 'hover',
      position: 'bottom',
      align: 'start',
      content: <Heading level={4}>Featured Article</Heading>
    });
    return <Card width={360} ref={overlay.containerRef as React.RefObject<HTMLDivElement>} {...overlay.containerProps}>
        <div {...stylex.props(styles.imageSection)}>
          <AspectRatio ratio={16 / 9}>
            <img src={SAMPLE_IMAGE_2} alt="Article" {...stylex.props(styles.image)} />
          </AspectRatio>
          {overlay.element}
        </div>
        <VStack gap={1} xstyle={styles.metadata}>
          <Text type="supporting" color="secondary">
            Jan 15, 2026 · 5 min read
          </Text>
          <Text type="supporting" color="secondary">
            By Jane Author
          </Text>
        </VStack>
      </Card>;
  }
}`,...R.parameters?.docs?.source},description:{story:"Disconnected hover — useOverlay hook on Card. Hover Card reveals overlay on image.",...R.parameters?.docs?.description}}};$.parameters={...$.parameters,docs:{...$.parameters?.docs,source:{originalSource:`{
  render: function DragAndDropStory() {
    const [isDragOver, setIsDragOver] = useState(false);
    return <VStack gap={4} style={{
      width: 400
    }}>
        <Button label={isDragOver ? 'Simulate drag leave' : 'Simulate drag enter'} variant="secondary" onClick={() => setIsDragOver(v => !v)} />
        <Overlay isOpen={isDragOver} align="center" content={<VStack gap={2} hAlign="center">
              <Text size="lg">📁</Text>
              <Text weight="bold">Drop files here</Text>
            </VStack>}>
          <div {...stylex.props(styles.dropZone)}>
            <p {...stylex.props(styles.dropZoneText)}>
              Drop files here or click to browse
            </p>
          </div>
        </Overlay>
      </VStack>;
  }
}`,...$.parameters?.docs?.source},description:{story:"Drag-and-drop overlay — simulated with a toggle button.",...$.parameters?.docs?.description}}};q.parameters={...q.parameters,docs:{...q.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    width: 300
  }}>
      <Overlay showOn="hover" scrim={false} align="center" content={<Button label="♡" variant="ghost" />}>
        <AspectRatio ratio={1}>
          <img src={SAMPLE_IMAGE_3} alt="Selected" {...stylex.props(styles.image)} />
        </AspectRatio>
      </Overlay>
    </div>
}`,...q.parameters?.docs?.source},description:{story:"No scrim — content-only overlay without a background.",...q.parameters?.docs?.description}}};const Ce=["HoverOnImage","BottomStrip","CardOverlay","HoverOrFocus","LoadingOverlay","GalleryGrid","VideoThumbnail","DisconnectedHover","DragAndDrop","NoScrim"];export{j as BottomStrip,S as CardOverlay,R as DisconnectedHover,$ as DragAndDrop,T as GalleryGrid,w as HoverOnImage,O as HoverOrFocus,A as LoadingOverlay,q as NoScrim,C as VideoThumbnail,Ce as __namedExportsOrder,Te as default};
