import{i as e,s as t}from"./preload-helper-CT_b8DTk.js";import{t as n}from"./react-B7Te67-h.js";import{t as r}from"./jsx-runtime-DqZldVDK.js";import{t as i}from"./Text-Dfk4z49M.js";import{t as a}from"./Button-BnrGcZLf.js";import{t as o}from"./Button-BBOpb_lq.js";import{s}from"./useTheme-CJYItYzy.js";import{t as c,x as l}from"./theme-Cev_i3Y3.js";import{t as u}from"./Heading-DEftOGEN.js";import{i as d,o as f,t as p}from"./Stack-BPa9qrGQ.js";import{n as m,t as h}from"./Text-24uEXAax.js";import{_n as g,t as _,yn as v}from"./src-B0DLI3mt.js";var y,b,x,S,C,w,T,E,D;e((()=>{y=t(n()),_(),o(),m(),p(),h(),c(),b=r(),x={title:`Lab/Tour`,component:v,tags:[`autodocs`],parameters:{layout:`fullscreen`},decorators:[e=>(0,b.jsx)(`div`,{style:{minHeight:480,padding:32},children:(0,b.jsx)(e,{})})]},S={render:()=>{let[e,t]=(0,y.useState)(!1),n=(0,y.useRef)(null),r=(0,y.useRef)(null),i=(0,y.useRef)(null);return(0,b.jsxs)(d,{gap:4,children:[(0,b.jsxs)(f,{gap:2,children:[(0,b.jsx)(a,{ref:n,variant:`secondary`,label:`Save`}),(0,b.jsx)(a,{ref:r,variant:`secondary`,label:`Share`}),(0,b.jsx)(a,{ref:i,variant:`secondary`,label:`Settings`})]}),(0,b.jsx)(a,{label:`Start tour`,onClick:()=>t(!0)}),(0,b.jsxs)(v,{isActive:e,hasBackdrop:!0,isStepCountShown:!0,onDismiss:()=>t(!1),children:[(0,b.jsx)(g,{targetRef:n,heading:`Save your work`,children:`Changes save automatically to the cloud as you go.`}),(0,b.jsx)(g,{targetRef:r,heading:`Share with your team`,children:`Invite teammates and manage access from here.`}),(0,b.jsx)(g,{targetRef:i,heading:`Tune your setup`,children:`Adjust preferences and defaults in Settings.`})]})]})}},C={render:()=>{let[e,t]=(0,y.useState)(!1),n=(0,y.useRef)(null);return(0,b.jsxs)(d,{gap:4,children:[(0,b.jsx)(u,{level:3,children:`Feature callout`}),(0,b.jsx)(i,{type:`body`,children:`A single-step tour with no dimmed background — a lightweight coachmark.`}),(0,b.jsx)(a,{ref:n,variant:`secondary`,label:`New feature`}),(0,b.jsx)(a,{label:`Highlight it`,onClick:()=>t(!0)}),(0,b.jsx)(v,{isActive:e,onDismiss:()=>t(!1),children:(0,b.jsx)(g,{targetRef:n,heading:`Try the new feature`,placement:`below`,children:`We just shipped this — click to explore.`})})]})}},w=s({name:`tour-magenta-demo`,tokens:{"--color-accent":[`#D6006E`,`#FF4FA3`]}}),T={name:`Themed ring (scoped theme)`,render:()=>{let[e,t]=(0,y.useState)(!1),n=(0,y.useRef)(null);return(0,b.jsx)(l,{theme:w,mode:`light`,children:(0,b.jsxs)(d,{gap:4,children:[(0,b.jsx)(u,{level:3,children:`Scoped theme`}),(0,b.jsx)(i,{type:`body`,children:`This subtree uses a scoped theme with a magenta accent. The highlight ring picks it up because the overlay is promoted in place, inside the Theme — not portaled to the body.`}),(0,b.jsx)(a,{ref:n,variant:`secondary`,label:`New feature`}),(0,b.jsx)(a,{label:`Highlight it`,onClick:()=>t(!0)}),(0,b.jsx)(v,{isActive:e,hasBackdrop:!0,onDismiss:()=>t(!1),children:(0,b.jsx)(g,{targetRef:n,heading:`Themed highlight`,children:`The ring uses this theme's accent color.`})})]})})}},E={name:`Placement & alignment`,argTypes:{placement:{control:`select`,options:[`above`,`below`,`start`,`end`],description:`Which side of the target the callout sits on`},alignment:{control:`select`,options:[`start`,`center`,`end`],description:`How the callout aligns along the placement side`}},args:{placement:`below`,alignment:`center`},render:({placement:e,alignment:t})=>{let[n,r]=(0,y.useState)(!0),i=(0,y.useRef)(null);return(0,b.jsxs)(d,{gap:4,align:`center`,justify:`center`,style:{minHeight:460},children:[(0,b.jsx)(a,{ref:i,variant:`secondary`,label:`Target`}),!n&&(0,b.jsx)(a,{label:`Show step`,onClick:()=>r(!0)}),(0,b.jsx)(v,{isActive:n,onDismiss:()=>r(!1),children:(0,b.jsxs)(g,{targetRef:i,heading:`Positioned callout`,placement:e,alignment:t,children:[`placement="`,e,`" · alignment="`,t,`"`]})})]})}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
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
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
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
}`,...C.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
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
}`,...T.parameters?.docs?.source}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
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
}`,...E.parameters?.docs?.source}}},D=[`Showcase`,`WithoutBackdrop`,`ScopedTheme`,`Placement`]}))();export{E as Placement,T as ScopedTheme,S as Showcase,C as WithoutBackdrop,D as __namedExportsOrder,x as default};