import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{t}from"./react-BZJXY1be.js";import{n,t as r}from"./Theme-os0aoGDw.js";import{n as i,t as a}from"./Text-BfjtEFtP.js";import{t as o}from"./jsx-runtime-DeHZSEgm.js";import{a as s,o as c}from"./useTheme-CAaDofyu.js";import{n as l,t as u}from"./Button-BVMvoKVE.js";import{n as d,t as f}from"./Popover-Dzrapr1u.js";import{n as p,t as m}from"./Heading-CaMVckJS.js";import{n as h,t as g}from"./HStack-DtZv8gmp.js";import{n as _,t as v}from"./VStack-C2SBQ4Fm.js";var y,b;function x(){return(x=e((()=>{y=t(),b=(0,y.createContext)(null)})))()}function S({isActive:e,children:t,onDismiss:n,hasBackdrop:r=!1,isStepCountShown:i=!1}){let[a,o]=(0,C.useState)([]),[s,c]=(0,C.useState)(0),l=(0,C.useCallback)(e=>(o(t=>t.includes(e)?t:[...t,e]),()=>{o(t=>t.filter(t=>t!==e))}),[]);(0,C.useEffect)(()=>{e||c(0)},[e]);let u=a.length,d=(0,C.useCallback)(()=>{if(s<u-1){c(s+1);return}n(`complete`)},[s,u,n]),f=(0,C.useCallback)(()=>{c(e=>e>0?e-1:e)},[]),p=e?a[s]??null:null,m=(0,C.useMemo)(()=>({registerStep:l,activeStepId:p,activeStepIndex:s,stepCount:u,isStepCountShown:i,hasBackdrop:r,onNext:d,onPrevious:f,onDismiss:n}),[l,p,s,u,i,r,d,f,n]);return(0,w.jsx)(b.Provider,{value:m,children:t})}var C,w;function T(){return(T=e((()=>{C=t(),x(),w=o(),S.displayName=`Tour`,S.__docgenInfo={description:`Controller for a guided product tour. Renders no chrome; coordinates the
active step among its \`<TourStep>\` children.

@example
\`\`\`
const [isActive, setIsActive] = useState(true);
const saveRef = useRef(null);
const shareRef = useRef(null);
<Tour isActive={isActive} hasBackdrop isStepCountShown onDismiss={() => setIsActive(false)}>
  <TourStep targetRef={saveRef} heading="Save your work">
    Changes save automatically to the cloud.
  </TourStep>
  <TourStep targetRef={shareRef} heading="Share it">
    Invite teammates from here.
  </TourStep>
</Tour>
\`\`\``,methods:[],displayName:`Tour`,props:{isActive:{required:!0,tsType:{name:`boolean`},description:`Whether the tour is running. When false, nothing renders and step state
resets — the tour restarts from the first step next time it becomes active.
(Controlled: the consumer owns "has this user seen the tour?".)`},children:{required:!1,tsType:{name:`ReactNode`},description:"The tour's steps — `<TourStep>` elements. Step order is taken from their\norder here; only the active step renders its callout."},onDismiss:{required:!0,tsType:{name:`signature`,type:`function`,raw:`(source: TourDismissSource) => void`,signature:{arguments:[{type:{name:`union`,raw:`'backdrop' | 'escape' | 'close' | 'skip' | 'complete'`,elements:[{name:`literal`,value:`'backdrop'`},{name:`literal`,value:`'escape'`},{name:`literal`,value:`'close'`},{name:`literal`,value:`'skip'`},{name:`literal`,value:`'complete'`}]},name:`source`}],return:{name:`void`}}},description:"Called when the tour is dismissed, with the reason. Fires for every exit,\nincluding completing the last step (`source === 'complete'`). The consumer\nflips `isActive` to false in response, and can branch on the source to tell\na successful finish apart from an early skip/backdrop/escape."},hasBackdrop:{required:!1,tsType:{name:`boolean`},description:`Dim the page around the active step's target (a spotlight cutout — the
target stays lit, everything else darkens). Use for modal-style steps that
demand focus; leave off for a lightweight coachmark that only rings the
target.
@default false`,defaultValue:{value:`false`,computed:!1}},isStepCountShown:{required:!1,tsType:{name:`boolean`},description:`Show the step count ("2 of 5") in each step.
@default false`,defaultValue:{value:`false`,computed:!1}}}}})))()}function E({rect:e,hasBackdrop:t,onBackdropClick:n}){let r=(0,O.useRef)(null);return A(()=>{let e=r.current;if(e!=null&&typeof e.showPopover==`function`)return e.showPopover(),()=>{e.isConnected&&typeof e.hidePopover==`function`&&e.hidePopover()}},[]),(0,k.jsx)(`div`,{ref:r,popover:`manual`,"data-testid":t?`tour-backdrop`:void 0,"aria-hidden":`true`,onClick:t?n:void 0,...{0:{className:`astryxixxii4 astryx10a8y8t astryx1ghz6dp astryx1717udv astryxc342km astryxng3xce astryxjbqb8w astryx1rea2x4 astryx47corl`},1:{className:`astryxixxii4 astryx10a8y8t astryx1ghz6dp astryx1717udv astryxc342km astryxng3xce astryxjbqb8w astryx1rea2x4 astryx67bb7w`}}[!!t<<0],children:(0,k.jsx)(`div`,{"data-testid":`tour-highlight`,...{0:{className:`astryx10l6tqk astryx47corl astryxr5mita astryx1gfj591 astryxuedmi6 astryxlr8y92`},2:{className:`astryx10l6tqk astryx47corl astryx1gfj591 astryxuedmi6 astryxlr8y92 astryxefcaua`},1:{className:`astryx10l6tqk astryx47corl astryxr5mita astryx1gfj591 astryxuedmi6 astryxlr8y92 astryxg01cxk`},3:{className:`astryx10l6tqk astryx47corl astryx1gfj591 astryxuedmi6 astryxlr8y92 astryxefcaua astryxg01cxk`}}[!!t<<1|(e==null)<<0],style:e==null?void 0:{top:e.top-j,left:e.left-j,width:e.width+8,height:e.height+8,borderRadius:e.radius}})})}function D({targetRef:e,heading:t,children:n,placement:r=`below`,alignment:i=`start`,"data-testid":o}){let s=(0,O.useContext)(b),c=(0,O.useId)(),l=s!=null&&s.activeStepId===c,[d,p]=(0,O.useState)(null);if((0,O.useEffect)(()=>{if(s!=null)return s.registerStep(c)},[s,c]),(0,O.useEffect)(()=>{let t=e.current;if(t==null||!l){p(null);return}let n=()=>{let e=t.getBoundingClientRect();p({top:e.top,left:e.left,width:e.width,height:e.height,radius:getComputedStyle(t).borderRadius||`0px`})};return n(),window.addEventListener(`scroll`,n,!0),window.addEventListener(`resize`,n),()=>{window.removeEventListener(`scroll`,n,!0),window.removeEventListener(`resize`,n),p(null)}},[e,l]),s==null||!l)return null;let{activeStepIndex:h,stepCount:_,isStepCountShown:y,hasBackdrop:x,onNext:S,onPrevious:C,onDismiss:w}=s,T=h<=0,D=_>0&&h===_-1,A=(0,k.jsxs)(`div`,{className:`astryx78zum5 astryxdt5ytf astryxjcht0a astryx1va8c73`,"data-testid":o,children:[(0,k.jsxs)(v,{gap:1,children:[(0,k.jsx)(m,{level:4,children:t}),n!=null&&(0,k.jsx)(a,{type:`body`,children:n})]}),(0,k.jsxs)(g,{gap:2,xstyle:M.footer,children:[y&&_>0?(0,k.jsx)(a,{type:`supporting`,color:`secondary`,children:`${h+1} of ${_}`}):(0,k.jsx)(`span`,{}),(0,k.jsxs)(g,{gap:2,children:[!T&&(0,k.jsx)(u,{variant:`ghost`,size:`sm`,label:`Back`,onClick:C}),(0,k.jsx)(u,{variant:`primary`,size:`sm`,label:D?`Done`:`Next`,onClick:S})]})]})]});return(0,k.jsxs)(k.Fragment,{children:[(0,k.jsx)(E,{rect:d,hasBackdrop:x,onBackdropClick:()=>w(`backdrop`)}),(0,k.jsx)(f,{anchorRef:e,isOpen:!0,onOpenChange:e=>{e||w(`close`)},placement:r,alignment:i,width:`fit-content`,xstyle:N[r],label:typeof t==`string`?t:`Tour step`,hasCloseButton:!0,closeButtonLabel:`Close tour`,content:A})]})}var O,k,A,j,M,N;function P(){return(P=e((()=>{O=t(),d(),l(),i(),p(),_(),h(),x(),k=o(),A=typeof window<`u`?O.useLayoutEffect:O.useEffect,j=4,M={footer:{kGNEyG:`astryx6s0dn4`,kjj79g:`astryx1qughib`,$$css:!0},calloutGapBelow:{keoZOQ:`astryxtbrsbv`,$$css:!0},calloutGapAbove:{k1K539:`astryx1p37lm5`,$$css:!0},calloutGapStart:{k71WvV:`astryx1pezmd8`,koQZXg:null,km5ZXQ:null,$$css:!0},calloutGapEnd:{keTefX:`astryx1cmpsy9`,koQZXg:null,km5ZXQ:null,$$css:!0}},N={below:M.calloutGapBelow,above:M.calloutGapAbove,start:M.calloutGapStart,end:M.calloutGapEnd},D.displayName=`TourStep`,D.__docgenInfo={description:`A single spotlight step within a \`<Tour>\`. Renders its callout only while
active.

@example
\`\`\`
<TourStep targetRef={saveRef} heading="Save your work">
  Changes save automatically.
</TourStep>
\`\`\``,methods:[],displayName:`TourStep`,props:{targetRef:{required:!0,tsType:{name:`ReactRefObject`,raw:`React.RefObject<HTMLElement | null>`,elements:[{name:`union`,raw:`HTMLElement | null`,elements:[{name:`HTMLElement`},{name:`null`}]}]},description:'Ref to the element this step points at. The callout anchors to it (like a\nPopover trigger); it must be a `<button>` or `[role="button"]` element,\nmatching Popover\'s `anchorRef` contract. Accepts a ref to any HTMLElement\nsubtype (e.g. `useRef<HTMLButtonElement>(null)`).'},heading:{required:!0,tsType:{name:`ReactNode`},description:`Step heading.`},children:{required:!1,tsType:{name:`ReactNode`},description:`Step body content.`},placement:{required:!1,tsType:{name:`union`,raw:`'above' | 'below' | 'start' | 'end'`,elements:[{name:`literal`,value:`'above'`},{name:`literal`,value:`'below'`},{name:`literal`,value:`'start'`},{name:`literal`,value:`'end'`}]},description:`Which side of the target the callout sits on.
@default 'below'`,defaultValue:{value:`'below'`,computed:!1}},alignment:{required:!1,tsType:{name:`union`,raw:`'start' | 'center' | 'end'`,elements:[{name:`literal`,value:`'start'`},{name:`literal`,value:`'center'`},{name:`literal`,value:`'end'`}]},description:"How the callout aligns along the placement side — e.g. with `placement=\"below\"`,\n`start` left-aligns it under the target, `center` centers it, `end` right-aligns it.\n@default 'start'",defaultValue:{value:`'start'`,computed:!1}},"data-testid":{required:!1,tsType:{name:`string`},description:`Test id applied to the callout content.`}}}})))()}var F,I,L,R,z,B,V,H,U;function W(){return(W=e((()=>{F=t(),T(),P(),l(),p(),h(),_(),i(),n(),c(),I=o(),L={title:`Lab/Tour`,component:S,tags:[`autodocs`],parameters:{layout:`fullscreen`},decorators:[e=>(0,I.jsx)(`div`,{style:{minHeight:480,padding:32},children:(0,I.jsx)(e,{})})]},R={render:()=>{let[e,t]=(0,F.useState)(!1),n=(0,F.useRef)(null),r=(0,F.useRef)(null),i=(0,F.useRef)(null);return(0,I.jsxs)(v,{gap:4,children:[(0,I.jsxs)(g,{gap:2,children:[(0,I.jsx)(u,{ref:n,variant:`secondary`,label:`Save`}),(0,I.jsx)(u,{ref:r,variant:`secondary`,label:`Share`}),(0,I.jsx)(u,{ref:i,variant:`secondary`,label:`Settings`})]}),(0,I.jsx)(u,{label:`Start tour`,onClick:()=>t(!0)}),(0,I.jsxs)(S,{isActive:e,hasBackdrop:!0,isStepCountShown:!0,onDismiss:()=>t(!1),children:[(0,I.jsx)(D,{targetRef:n,heading:`Save your work`,children:`Changes save automatically to the cloud as you go.`}),(0,I.jsx)(D,{targetRef:r,heading:`Share with your team`,children:`Invite teammates and manage access from here.`}),(0,I.jsx)(D,{targetRef:i,heading:`Tune your setup`,children:`Adjust preferences and defaults in Settings.`})]})]})}},z={render:()=>{let[e,t]=(0,F.useState)(!1),n=(0,F.useRef)(null);return(0,I.jsxs)(v,{gap:4,children:[(0,I.jsx)(m,{level:3,children:`Feature callout`}),(0,I.jsx)(a,{type:`body`,children:`A single-step tour with no dimmed background — a lightweight coachmark.`}),(0,I.jsx)(u,{ref:n,variant:`secondary`,label:`New feature`}),(0,I.jsx)(u,{label:`Highlight it`,onClick:()=>t(!0)}),(0,I.jsx)(S,{isActive:e,onDismiss:()=>t(!1),children:(0,I.jsx)(D,{targetRef:n,heading:`Try the new feature`,placement:`below`,children:`We just shipped this — click to explore.`})})]})}},B=s({name:`tour-magenta-demo`,tokens:{"--color-accent":[`#D6006E`,`#FF4FA3`]}}),V={name:`Themed ring (scoped theme)`,render:()=>{let[e,t]=(0,F.useState)(!1),n=(0,F.useRef)(null);return(0,I.jsx)(r,{theme:B,mode:`light`,children:(0,I.jsxs)(v,{gap:4,children:[(0,I.jsx)(m,{level:3,children:`Scoped theme`}),(0,I.jsx)(a,{type:`body`,children:`This subtree uses a scoped theme with a magenta accent. The highlight ring picks it up because the overlay is promoted in place, inside the Theme — not portaled to the body.`}),(0,I.jsx)(u,{ref:n,variant:`secondary`,label:`New feature`}),(0,I.jsx)(u,{label:`Highlight it`,onClick:()=>t(!0)}),(0,I.jsx)(S,{isActive:e,hasBackdrop:!0,onDismiss:()=>t(!1),children:(0,I.jsx)(D,{targetRef:n,heading:`Themed highlight`,children:`The ring uses this theme's accent color.`})})]})})}},H={name:`Placement & alignment`,argTypes:{placement:{control:`select`,options:[`above`,`below`,`start`,`end`],description:`Which side of the target the callout sits on`},alignment:{control:`select`,options:[`start`,`center`,`end`],description:`How the callout aligns along the placement side`}},args:{placement:`below`,alignment:`center`},render:({placement:e,alignment:t})=>{let[n,r]=(0,F.useState)(!0),i=(0,F.useRef)(null);return(0,I.jsxs)(v,{gap:4,align:`center`,justify:`center`,style:{minHeight:460},children:[(0,I.jsx)(u,{ref:i,variant:`secondary`,label:`Target`}),!n&&(0,I.jsx)(u,{label:`Show step`,onClick:()=>r(!0)}),(0,I.jsx)(S,{isActive:n,onDismiss:()=>r(!1),children:(0,I.jsxs)(D,{targetRef:i,heading:`Positioned callout`,placement:e,alignment:t,children:[`placement="`,e,`" · alignment="`,t,`"`]})})]})}},R.parameters={...R.parameters,docs:{...R.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [isActive, setIsActive] = useState(false);
    const saveRef = useRef<HTMLButtonElement>(null);
    const shareRef = useRef<HTMLButtonElement>(null);
    const settingsRef = useRef<HTMLButtonElement>(null);
    return <VStack gap={4}>
        <HStack gap={2}>
          <Button ref={saveRef} variant="secondary" label="Save" />
          <Button ref={shareRef} variant="secondary" label="Share" />
          <Button ref={settingsRef} variant="secondary" label="Settings" />
        </HStack>

        <Button label="Start tour" onClick={() => setIsActive(true)} />

        <Tour isActive={isActive} hasBackdrop isStepCountShown onDismiss={() => setIsActive(false)}>
          <TourStep targetRef={saveRef} heading="Save your work">
            Changes save automatically to the cloud as you go.
          </TourStep>
          <TourStep targetRef={shareRef} heading="Share with your team">
            Invite teammates and manage access from here.
          </TourStep>
          <TourStep targetRef={settingsRef} heading="Tune your setup">
            Adjust preferences and defaults in Settings.
          </TourStep>
        </Tour>
      </VStack>;
  }
}`,...R.parameters?.docs?.source}}},z.parameters={...z.parameters,docs:{...z.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [isActive, setIsActive] = useState(false);
    const targetRef = useRef<HTMLButtonElement>(null);
    return <VStack gap={4}>
        <Heading level={3}>Feature callout</Heading>
        <Text type="body">
          A single-step tour with no dimmed background — a lightweight
          coachmark.
        </Text>
        <Button ref={targetRef} variant="secondary" label="New feature" />
        <Button label="Highlight it" onClick={() => setIsActive(true)} />

        <Tour isActive={isActive} onDismiss={() => setIsActive(false)}>
          <TourStep targetRef={targetRef} heading="Try the new feature" placement="below">
            We just shipped this — click to explore.
          </TourStep>
        </Tour>
      </VStack>;
  }
}`,...z.parameters?.docs?.source}}},V.parameters={...V.parameters,docs:{...V.parameters?.docs,source:{originalSource:`{
  name: 'Themed ring (scoped theme)',
  render: () => {
    const [isActive, setIsActive] = useState(false);
    const targetRef = useRef<HTMLButtonElement>(null);
    return <Theme theme={magentaTheme} mode="light">
        <VStack gap={4}>
          <Heading level={3}>Scoped theme</Heading>
          <Text type="body">
            This subtree uses a scoped theme with a magenta accent. The
            highlight ring picks it up because the overlay is promoted in place,
            inside the Theme — not portaled to the body.
          </Text>
          <Button ref={targetRef} variant="secondary" label="New feature" />
          <Button label="Highlight it" onClick={() => setIsActive(true)} />

          <Tour isActive={isActive} hasBackdrop onDismiss={() => setIsActive(false)}>
            <TourStep targetRef={targetRef} heading="Themed highlight">
              The ring uses this theme&apos;s accent color.
            </TourStep>
          </Tour>
        </VStack>
      </Theme>;
  }
}`,...V.parameters?.docs?.source}}},H.parameters={...H.parameters,docs:{...H.parameters?.docs,source:{originalSource:`{
  name: 'Placement & alignment',
  argTypes: {
    placement: {
      control: 'select',
      options: ['above', 'below', 'start', 'end'],
      description: 'Which side of the target the callout sits on'
    },
    alignment: {
      control: 'select',
      options: ['start', 'center', 'end'],
      description: 'How the callout aligns along the placement side'
    }
  },
  args: {
    placement: 'below',
    alignment: 'center'
  },
  render: ({
    placement,
    alignment
  }: PlacementArgs) => {
    const [isActive, setIsActive] = useState(true);
    const targetRef = useRef<HTMLButtonElement>(null);
    return <VStack gap={4} align="center" justify="center" style={{
      minHeight: 460
    }}>
        <Button ref={targetRef} variant="secondary" label="Target" />
        {!isActive && <Button label="Show step" onClick={() => setIsActive(true)} />}
        <Tour isActive={isActive} onDismiss={() => setIsActive(false)}>
          <TourStep targetRef={targetRef} heading="Positioned callout" placement={placement} alignment={alignment}>
            placement=&quot;{placement}&quot; · alignment=&quot;{alignment}
            &quot;
          </TourStep>
        </Tour>
      </VStack>;
  }
}`,...H.parameters?.docs?.source}}},U=[`Showcase`,`WithoutBackdrop`,`ScopedTheme`,`Placement`]})))()}W();export{H as Placement,V as ScopedTheme,R as Showcase,z as WithoutBackdrop,U as __namedExportsOrder,L as default};