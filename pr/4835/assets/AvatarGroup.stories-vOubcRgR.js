import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{t}from"./react-BZJXY1be.js";import{n,t as r}from"./stylex-Dft6gtPK.js";import{n as i}from"./mergeProps-JRyAvMxc.js";import{n as a}from"./mergeRefs-CPqjs56a.js";import{t as o}from"./composeEventHandlers-DY4wem0S.js";import{n as s,t as c}from"./themeProps-CREkzZh6.js";import{t as l}from"./jsx-runtime-DeHZSEgm.js";import{n as u,t as ee}from"./VisuallyHidden-Z2NjNH-_.js";import{n as d,t as f}from"./useTranslator-BMnme3me.js";import{a as p,i as m,n as h,o as g,r as _,t as v}from"./Avatar-DiNe9zDi.js";import{n as te,t as ne}from"./useIsomorphicLayoutEffect-vnms8l8s.js";import{n as re,t as y}from"./useListFocus-C3PMl9Zf.js";import{n as ie,t as b}from"./StatusDot-B0nwQhc_.js";function x({children:e,size:t=`md`,"data-testid":r,"aria-label":c,"aria-describedby":l,onKeyDown:u,onFocus:f,xstyle:p,className:h,style:g,ref:v,...ne}){let y=d(),ie=c??y(`@astryx.avatarGroup.label`),b=_(t),x=Math.round(b*w),E=(0,S.useMemo)(()=>({size:t,overlap:x,numericSize:b}),[t,x,b]),[D,O]=(0,S.useState)(!1),{listRef:k,handleKeyDown:A,handleFocus:j}=re({itemSelector:`[data-avatar-item]`,orientation:`horizontal`,hasRovingTabIndex:!0});te(()=>{let e=k.current;e&&O(e.querySelector(`[data-avatar-item]`)!=null)});let M=(0,S.useId)(),N=[l,D?M:null].filter(Boolean).join(` `)||void 0;return(0,C.jsx)(m,{value:E,children:(0,C.jsxs)(`div`,{...ne,ref:a(v,k),role:`group`,"aria-label":ie,"aria-describedby":N,"data-testid":r,onKeyDown:o(u,A),onFocus:o(f,j),...i(s(`avatar-group`,{size:t}),n(T.root,p),h,g),children:[e,D&&(0,C.jsx)(ee,{id:M,children:y(`@astryx.avatarGroup.keyboardHint`)})]})})}var S,C,w,T;function E(){return(E=e((()=>{S=t(),h(),r(),p(),c(),f(),y(),ne(),u(),C=l(),w=.25,T={root:{k1xSpc:`astryx3nfvp2`,kGNEyG:`astryx6s0dn4`,$$css:!0}},x.displayName=`AvatarGroup`,x.__docgenInfo={description:`Stacked avatar display showing multiple avatars overlapping with an
optional overflow indicator. Uses a compositional children-based API
so each avatar can carry its own props (status dots, click handlers, etc.).

Consumers handle slicing — pass only the avatars you want visible,
then add an AvatarGroupOverflow for the "+N" indicator.

@example
\`\`\`
<AvatarGroup size="lg">
  {users.slice(0, 3).map(u => (
    <Avatar key={u.id} src={u.src} name={u.name} />
  ))}
  <AvatarGroupOverflow count={users.length - 3} />
</AvatarGroup>
\`\`\``,methods:[],displayName:`AvatarGroup`,props:{xstyle:{required:!1,tsType:{name:`StyleXStyles`},description:"StyleX styles created via `stylex.create()`. Merged with the component's\nbase styles inside a single `stylex.props()` call for optimal deduplication.\n\n@example\n```\nconst overrides = stylex.create({ root: { marginBottom: 8 } });\n<Component xstyle={overrides.root} />\n```"},ref:{required:!1,tsType:{name:`ReactRef`,raw:`React.Ref<HTMLDivElement>`,elements:[{name:`HTMLDivElement`}]},description:`Ref forwarded to the root element.`},children:{required:!0,tsType:{name:`ReactNode`},description:`Avatar children, optionally followed by one AvatarGroupOverflow.
Consumers are responsible for slicing to the desired visible count.`},size:{required:!1,tsType:{name:`union`,raw:`AvatarNamedSize | AvatarNumericSize`,elements:[{name:`union`,raw:`'xsm' | 'sm' | 'md' | 'lg' | 'xl'`,elements:[{name:`literal`,value:`'xsm'`},{name:`literal`,value:`'sm'`},{name:`literal`,value:`'md'`},{name:`literal`,value:`'lg'`},{name:`literal`,value:`'xl'`}]},{name:`union`,raw:`16 | 20 | 24 | 32 | 36 | 40 | 48 | 60 | 64 | 72 | 96 | 128 | 144 | 180`,elements:[{name:`literal`,value:`16`},{name:`literal`,value:`20`},{name:`literal`,value:`24`},{name:`literal`,value:`32`},{name:`literal`,value:`36`},{name:`literal`,value:`40`},{name:`literal`,value:`48`},{name:`literal`,value:`60`},{name:`literal`,value:`64`},{name:`literal`,value:`72`},{name:`literal`,value:`96`},{name:`literal`,value:`128`},{name:`literal`,value:`144`},{name:`literal`,value:`180`}]}]},description:`Size applied to all avatars via context.
@default 'md'`,defaultValue:{value:`'md'`,computed:!1}},"data-testid":{required:!1,tsType:{name:`string`},description:`Test ID for integration testing.`}},composes:[`Omit`]}})))()}function D({ref:e,count:t,onClick:r,children:a,xstyle:o,className:c,style:l,...u}){let ee=d(),f=g(),p=f?.numericSize??36,m=f?.overlap??0,h=ee(`@astryx.avatarGroup.overflow`,{count:t}),_=a??`+${t}`;return r?(0,O.jsx)(`button`,{ref:e,type:`button`,onClick:r,...u,"aria-label":h,"data-avatar-item":``,...i(s(`avatar-group-overflow`),n(A.base,A.button,A.overlap,P.size(p),P.fontSize(p),P.overlap(-m),o),c,l),children:_}):(0,O.jsx)(`span`,{ref:e,...u,"aria-label":h,...i(s(`avatar-group-overflow`),n(A.base,A.overlap,P.size(p),P.fontSize(p),P.overlap(-m),o),c,l),children:_})}var O,k,A,j,M,N,P;function F(){return(F=e((()=>{t(),r(),p(),c(),f(),O=l(),k=.35,A={base:{kVAEAm:`astryx1n2onr6`,k1xSpc:`astryx78zum5`,kGNEyG:`astryx6s0dn4`,kjj79g:`astryxl56j7k`,kaIpWk:`astryxjspbzw`,kWkggS:`astryx10xzikg`,kMwMTN:`astryxv1l7n4`,kMv6JI:`astryx9ynric`,k63SB2:`astryx1e4wzip`,kfSwDN:`astryx87ps6o`,kMzoRj:`astryxdh2fpr`,ksu8eU:`astryx1y0btm7`,kVAM5u:`astryx1touxvs`,kB7OPa:`astryx9f619`,kg3NbH:`astryxf314gf`,kKwaWg:`astryx14bno8m`,$$css:!0},button:{kkrTdU:`astryx1ypdohk`,k8WAf4:`astryxt970qd`,kKwaWg:`astryx14bno8m astryxbfmc0r astryx1nocapi`,kI3sdo:`astryx1a2a7pz astryx17nn4n9`,kInvED:`astryx7s97pk`,$$css:!0},overlap:{keTefX:`astryx13hpdyo`,$$css:!0}},j={k7Eaqz:`astryxkj4a21`,kZKoxP:`astryx16ye13r`,$$css:!0},M={kGuDYH:`astryxdmh292`,$$css:!0},N={"--_avatar-group-overlap":`astryxlz5hwt`,$$css:!0},P={size:e=>[j,{"--x-minWidth":(e=>typeof e==`number`?e+`px`:e??void 0)(e+4),"--x-height":(e=>typeof e==`number`?e+`px`:e??void 0)(e+4)}],fontSize:e=>[M,{"--x-fontSize":(e=>typeof e==`number`?e+`px`:e??void 0)(e*k)}],overlap:e=>[N,{"--x---_avatar-group-overlap":`${e}px`==null?void 0:`${e}px`}]},D.displayName=`AvatarGroupOverflow`,D.__docgenInfo={description:`Overflow indicator for AvatarGroup. Shows a "+N" count and
optionally handles clicks.

@example
\`\`\`
<AvatarGroup size="lg">
  {users.slice(0, 3).map(u => (
    <Avatar key={u.id} src={u.src} name={u.name} />
  ))}
  <AvatarGroupOverflow count={users.length - 3} onClick={showAll} />
</AvatarGroup>
\`\`\``,methods:[],displayName:`AvatarGroupOverflow`,props:{ref:{required:!1,tsType:{name:`ReactRef`,raw:`React.Ref<HTMLElement>`,elements:[{name:`HTMLElement`}]},description:``},count:{required:!0,tsType:{name:`number`},description:`The overflow count to display.`},onClick:{required:!1,tsType:{name:`signature`,type:`function`,raw:`() => void`,signature:{arguments:[],return:{name:`void`}}},description:`Callback fired when the overflow indicator is clicked.
When provided, the indicator renders as a focusable button.`},children:{required:!1,tsType:{name:`ReactNode`},description:`Custom content to render instead of the default "+N" label.`}},composes:[`Omit`]}})))()}var I,L,R,z,B,V,H,U,W,G,K,q,J,Y,X,Z,Q,$,ae;function oe(){return(oe=e((()=>{E(),F(),h(),ie(),I=l(),L=[{name:`Alice Johnson`,src:`https://i.pravatar.cc/150?img=1`,key:`alice`},{name:`Bob Smith`,src:`https://i.pravatar.cc/150?img=2`,key:`bob`},{name:`Charlie Davis`,src:`https://i.pravatar.cc/150?img=3`,key:`charlie`},{name:`Diana Lee`,src:`https://i.pravatar.cc/150?img=4`,key:`diana`},{name:`Eve Park`,src:`https://i.pravatar.cc/150?img=5`,key:`eve`}],R={title:`Core/AvatarGroup`,component:x,tags:[`autodocs`],argTypes:{size:{control:`select`,options:[`xsm`,`sm`,`md`,`lg`,`xl`],description:`Size applied to all child avatars`}}},z={render:()=>(0,I.jsx)(x,{size:`lg`,children:L.slice(0,3).map(e=>(0,I.jsx)(v,{src:e.src,name:e.name},e.key))})},B={render:()=>(0,I.jsxs)(x,{size:`lg`,children:[L.slice(0,3).map(e=>(0,I.jsx)(v,{src:e.src,name:e.name},e.key)),(0,I.jsx)(D,{count:L.length-3})]})},V={render:()=>(0,I.jsxs)(x,{size:`lg`,children:[L.slice(0,3).map(e=>(0,I.jsx)(v,{src:e.src,name:e.name},e.key)),(0,I.jsx)(D,{count:L.length-3,onClick:()=>alert(`Show all participants`)})]})},H={render:()=>(0,I.jsxs)(x,{size:`lg`,children:[L.slice(0,3).map(e=>(0,I.jsx)(v,{src:e.src,name:e.name},e.key)),(0,I.jsx)(D,{count:44})]})},U={render:()=>(0,I.jsxs)(x,{size:`lg`,children:[(0,I.jsx)(v,{src:`https://i.pravatar.cc/150?img=1`,name:`Alice`,status:(0,I.jsx)(b,{variant:`success`,label:`Online`})}),(0,I.jsx)(v,{src:`https://i.pravatar.cc/150?img=2`,name:`Bob`,status:(0,I.jsx)(b,{variant:`warning`,label:`Away`})}),(0,I.jsx)(v,{src:`https://i.pravatar.cc/150?img=3`,name:`Charlie`,status:(0,I.jsx)(b,{variant:`error`,label:`Offline`})})]})},W={render:()=>(0,I.jsx)(`div`,{className:`x78zum5 xdt5ytf x1qh66ti`,children:[`xsm`,`sm`,`md`,`lg`,`xl`].map(e=>(0,I.jsxs)(`div`,{children:[(0,I.jsx)(`h4`,{className:`xrcdmg7 x9ynric`,children:e}),(0,I.jsxs)(x,{size:e,children:[L.slice(0,3).map(e=>(0,I.jsx)(v,{src:e.src,name:e.name},e.key)),(0,I.jsx)(D,{count:L.length-3})]})]},e))})},G={render:()=>(0,I.jsxs)(x,{size:`lg`,children:[L.slice(0,4).map(e=>(0,I.jsx)(v,{name:e.name},e.key)),(0,I.jsx)(D,{count:1})]})},K={render:()=>(0,I.jsx)(x,{size:`lg`,children:(0,I.jsx)(v,{src:`https://i.pravatar.cc/150?img=1`,name:`Alice Johnson`})})},q={render:()=>(0,I.jsxs)(x,{size:`lg`,children:[L.slice(0,3).map(e=>(0,I.jsx)(v,{src:e.src,name:e.name},e.key)),(0,I.jsx)(D,{count:999})]})},J={render:()=>(0,I.jsxs)(`div`,{className:`x78zum5 xdt5ytf x1qh66ti`,children:[(0,I.jsxs)(`div`,{children:[(0,I.jsx)(`h4`,{className:`xrcdmg7 x9ynric`,children:`Short count (circle)`}),(0,I.jsxs)(x,{size:`md`,children:[L.slice(0,3).map(e=>(0,I.jsx)(v,{src:e.src,name:e.name},e.key)),(0,I.jsx)(D,{count:5})]})]}),(0,I.jsxs)(`div`,{children:[(0,I.jsx)(`h4`,{className:`xrcdmg7 x9ynric`,children:`Long count (pill)`}),(0,I.jsxs)(x,{size:`md`,children:[L.slice(0,3).map(e=>(0,I.jsx)(v,{src:e.src,name:e.name},e.key)),(0,I.jsx)(D,{count:4912})]})]})]})},Y={render:()=>(0,I.jsxs)(x,{size:`lg`,children:[L.slice(0,3).map(e=>(0,I.jsx)(v,{src:e.src,name:e.name},e.key)),(0,I.jsx)(D,{count:0})]})},X={render:()=>(0,I.jsx)(`div`,{style:{width:120,border:`1px dashed grey`,padding:8},children:(0,I.jsxs)(x,{size:`lg`,children:[L.slice(0,5).map(e=>(0,I.jsx)(v,{src:e.src,name:e.name},e.key)),(0,I.jsx)(D,{count:10})]})})},Z={render:()=>{let e=Array.from({length:10},(e,t)=>({key:`user-${t}`,name:`User ${t+1}`,src:`https://i.pravatar.cc/150?img=${t%70+1}`}));return(0,I.jsxs)(x,{size:`md`,children:[e.map(e=>(0,I.jsx)(v,{src:e.src,name:e.name},e.key)),(0,I.jsx)(D,{count:37})]})}},Q={render:()=>(0,I.jsxs)(x,{size:`lg`,"aria-label":`Project team`,children:[(0,I.jsx)(v,{src:L[0].src,name:L[0].name,href:`https://example.com/users/alice`}),(0,I.jsx)(v,{src:L[1].src,name:L[1].name,href:`https://example.com/users/bob`}),(0,I.jsx)(v,{src:L[2].src,name:L[2].name,onClick:()=>alert(`Open ${L[2].name}`)}),(0,I.jsx)(D,{count:L.length-3,onClick:()=>alert(`Show all members`)})]})},$={render:()=>(0,I.jsxs)(x,{size:`lg`,children:[L.slice(0,4).map(e=>(0,I.jsx)(v,{src:e.src,name:e.name},e.key)),(0,I.jsx)(D,{count:L.length-4})]})},z.parameters={...z.parameters,docs:{...z.parameters?.docs,source:{originalSource:`{
  render: () => <AvatarGroup size="lg">
      {USERS.slice(0, 3).map(u => <Avatar key={u.key} src={u.src} name={u.name} />)}
    </AvatarGroup>
}`,...z.parameters?.docs?.source},description:{story:`Basic avatar group showing all members.`,...z.parameters?.docs?.description}}},B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
  render: () => <AvatarGroup size="lg">
      {USERS.slice(0, 3).map(u => <Avatar key={u.key} src={u.src} name={u.name} />)}
      <AvatarGroupOverflow count={USERS.length - 3} />
    </AvatarGroup>
}`,...B.parameters?.docs?.source},description:{story:`Sliced to 3 with "+N" overflow indicator.`,...B.parameters?.docs?.description}}},V.parameters={...V.parameters,docs:{...V.parameters?.docs,source:{originalSource:`{
  render: () => <AvatarGroup size="lg">
      {USERS.slice(0, 3).map(u => <Avatar key={u.key} src={u.src} name={u.name} />)}
      <AvatarGroupOverflow count={USERS.length - 3} onClick={() => alert('Show all participants')} />
    </AvatarGroup>
}`,...V.parameters?.docs?.source},description:{story:`Clickable overflow indicator.`,...V.parameters?.docs?.description}}},H.parameters={...H.parameters,docs:{...H.parameters?.docs,source:{originalSource:`{
  render: () => <AvatarGroup size="lg">
      {USERS.slice(0, 3).map(u => <Avatar key={u.key} src={u.src} name={u.name} />)}
      <AvatarGroupOverflow count={44} />
    </AvatarGroup>
}`,...H.parameters?.docs?.source},description:{story:`Server-side total count (47 participants, only 3 rendered).`,...H.parameters?.docs?.description}}},U.parameters={...U.parameters,docs:{...U.parameters?.docs,source:{originalSource:`{
  render: () => <AvatarGroup size="lg">
      <Avatar src="https://i.pravatar.cc/150?img=1" name="Alice" status={<StatusDot variant="success" label="Online" />} />
      <Avatar src="https://i.pravatar.cc/150?img=2" name="Bob" status={<StatusDot variant="warning" label="Away" />} />
      <Avatar src="https://i.pravatar.cc/150?img=3" name="Charlie" status={<StatusDot variant="error" label="Offline" />} />
    </AvatarGroup>
}`,...U.parameters?.docs?.source},description:{story:`Per-avatar status dots — just works with compositional API.`,...U.parameters?.docs?.description}}},W.parameters={...W.parameters,docs:{...W.parameters?.docs,source:{originalSource:`{
  render: () => <div {...stylex.props(storyStyles.storyWrapper)}>
      {(['xsm', 'sm', 'md', 'lg', 'xl'] as const).map(size => <div key={size}>
          <h4 {...stylex.props(storyStyles.heading)}>{size}</h4>
          <AvatarGroup size={size}>
            {USERS.slice(0, 3).map(u => <Avatar key={u.key} src={u.src} name={u.name} />)}
            <AvatarGroupOverflow count={USERS.length - 3} />
          </AvatarGroup>
        </div>)}
    </div>
}`,...W.parameters?.docs?.source},description:{story:`All sizes side by side.`,...W.parameters?.docs?.description}}},G.parameters={...G.parameters,docs:{...G.parameters?.docs,source:{originalSource:`{
  render: () => <AvatarGroup size="lg">
      {USERS.slice(0, 4).map(u => <Avatar key={u.key} name={u.name} />)}
      <AvatarGroupOverflow count={1} />
    </AvatarGroup>
}`,...G.parameters?.docs?.source},description:{story:`Initials fallback when no images provided.`,...G.parameters?.docs?.description}}},K.parameters={...K.parameters,docs:{...K.parameters?.docs,source:{originalSource:`{
  render: () => <AvatarGroup size="lg">
      <Avatar src="https://i.pravatar.cc/150?img=1" name="Alice Johnson" />
    </AvatarGroup>
}`,...K.parameters?.docs?.source},description:{story:`Single avatar — no overlap applied.`,...K.parameters?.docs?.description}}},q.parameters={...q.parameters,docs:{...q.parameters?.docs,source:{originalSource:`{
  render: () => <AvatarGroup size="lg">
      {USERS.slice(0, 3).map(u => <Avatar key={u.key} src={u.src} name={u.name} />)}
      <AvatarGroupOverflow count={999} />
    </AvatarGroup>
}`,...q.parameters?.docs?.source},description:{story:`Large overflow count (99+).`,...q.parameters?.docs?.description}}},J.parameters={...J.parameters,docs:{...J.parameters?.docs,source:{originalSource:`{
  render: () => <div {...stylex.props(storyStyles.storyWrapper)}>
      <div>
        <h4 {...stylex.props(storyStyles.heading)}>Short count (circle)</h4>
        <AvatarGroup size="md">
          {USERS.slice(0, 3).map(u => <Avatar key={u.key} src={u.src} name={u.name} />)}
          <AvatarGroupOverflow count={5} />
        </AvatarGroup>
      </div>
      <div>
        <h4 {...stylex.props(storyStyles.heading)}>Long count (pill)</h4>
        <AvatarGroup size="md">
          {USERS.slice(0, 3).map(u => <Avatar key={u.key} src={u.src} name={u.name} />)}
          <AvatarGroupOverflow count={4912} />
        </AvatarGroup>
      </div>
    </div>
}`,...J.parameters?.docs?.source},description:{story:`Short counts stay a circle; long counts grow into a pill.

The indicator uses a minimum width equal to the avatar size, so a small
\`+5\` renders as a circle, while a wide \`+4912\` grows horizontally into a
stadium/pill so the number always fits with comfortable padding.`,...J.parameters?.docs?.description}}},Y.parameters={...Y.parameters,docs:{...Y.parameters?.docs,source:{originalSource:`{
  render: () => <AvatarGroup size="lg">
      {USERS.slice(0, 3).map(u => <Avatar key={u.key} src={u.src} name={u.name} />)}
      <AvatarGroupOverflow count={0} />
    </AvatarGroup>
}`,...Y.parameters?.docs?.source},description:{story:`Zero overflow count edge case.`,...Y.parameters?.docs?.description}}},X.parameters={...X.parameters,docs:{...X.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    width: 120,
    border: '1px dashed grey',
    padding: 8
  }}>
      <AvatarGroup size="lg">
        {USERS.slice(0, 5).map(u => <Avatar key={u.key} src={u.src} name={u.name} />)}
        <AvatarGroupOverflow count={10} />
      </AvatarGroup>
    </div>
}`,...X.parameters?.docs?.source},description:{story:`Narrow container — tests overflow behavior in constrained width.`,...X.parameters?.docs?.description}}},Z.parameters={...Z.parameters,docs:{...Z.parameters?.docs,source:{originalSource:`{
  render: () => {
    const manyUsers = Array.from({
      length: 10
    }, (_, i) => ({
      key: \`user-\${i}\`,
      name: \`User \${i + 1}\`,
      src: \`https://i.pravatar.cc/150?img=\${i % 70 + 1}\`
    }));
    return <AvatarGroup size="md">
        {manyUsers.map(u => <Avatar key={u.key} src={u.src} name={u.name} />)}
        <AvatarGroupOverflow count={37} />
      </AvatarGroup>;
  }
}`,...Z.parameters?.docs?.source},description:{story:`Many avatars — 10+ items to verify overlap stacking.`,...Z.parameters?.docs?.description}}},Q.parameters={...Q.parameters,docs:{...Q.parameters?.docs,source:{originalSource:`{
  render: () => <AvatarGroup size="lg" aria-label="Project team">
      <Avatar src={USERS[0].src} name={USERS[0].name} href="https://example.com/users/alice" />
      <Avatar src={USERS[1].src} name={USERS[1].name} href="https://example.com/users/bob" />
      <Avatar src={USERS[2].src} name={USERS[2].name} onClick={() => alert(\`Open \${USERS[2].name}\`)} />
      <AvatarGroupOverflow count={USERS.length - 3} onClick={() => alert('Show all members')} />
    </AvatarGroup>
}`,...Q.parameters?.docs?.source},description:{story:"Interactive avatars — a mix of links (`href`) and buttons (`onClick`) plus an\ninteractive overflow. The whole group is a single Tab stop: Tab into it once,\nthen use ArrowLeft/ArrowRight to move focus between avatars and the overflow\nbutton. Screen readers hear a keyboard hint from the group.",...Q.parameters?.docs?.description}}},$.parameters={...$.parameters,docs:{...$.parameters?.docs,source:{originalSource:`{
  render: () => <AvatarGroup size="lg">
      {USERS.slice(0, 4).map(u => <Avatar key={u.key} src={u.src} name={u.name} />)}
      <AvatarGroupOverflow count={USERS.length - 4} />
    </AvatarGroup>
}`,...$.parameters?.docs?.source},description:{story:`Static facepile (no href/onClick) — unchanged behavior. Not focusable, no Tab
stop, no keyboard hint. Shown here alongside the interactive variant for
contrast.`,...$.parameters?.docs?.description}}},ae=[`Default`,`WithOverflow`,`ClickableOverflow`,`ServerSideCount`,`WithStatusDots`,`AllSizes`,`InitialsFallback`,`SingleAvatar`,`LargeOverflowCount`,`CircleToPill`,`ZeroOverflow`,`NarrowContainer`,`ManyAvatars`,`Interactive`,`StaticFacepile`]})))()}oe();export{W as AllSizes,J as CircleToPill,V as ClickableOverflow,z as Default,G as InitialsFallback,Q as Interactive,q as LargeOverflowCount,Z as ManyAvatars,X as NarrowContainer,H as ServerSideCount,K as SingleAvatar,$ as StaticFacepile,B as WithOverflow,U as WithStatusDots,Y as ZeroOverflow,ae as __namedExportsOrder,R as default};