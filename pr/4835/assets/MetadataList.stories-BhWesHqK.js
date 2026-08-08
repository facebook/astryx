import{a as e,n as t}from"./rolldown-runtime-DkW27tQK.js";import{t as n}from"./react-BZJXY1be.js";import{n as r,t as i}from"./stylex-Dft6gtPK.js";import{n as a}from"./mergeProps-JRyAvMxc.js";import{n as o,t as s}from"./themeProps-CREkzZh6.js";import{t as c}from"./jsx-runtime-DeHZSEgm.js";import{n as l,t as u}from"./useTranslator-BMnme3me.js";import{n as d,t as f}from"./Icon-C24cO4CC.js";import{n as p,t as m}from"./Token-Y_2gT4Oy.js";var h,g;function _(){return(_=t((()=>{h=n(),g=(0,h.createContext)(null),g.displayName=`MetadataListContext`})))()}function v({children:e,columns:t=`single`,label:n,maxNumOfItems:i,orientation:s=`vertical`,title:c,xstyle:u,className:d,style:f,"data-testid":p,ref:m}){let h=n??(t===`multi`||typeof t==`number`&&t>1?w:C),[_,v]=(0,y.useState)(!1),T=(0,y.useId)(),E=l(),D=(0,y.useMemo)(()=>({labelConfig:s===`horizontal`?w:h,orientation:s}),[h,s]),O=y.Children.toArray(e),k=s===`horizontal`,A=k?void 0:i,j=A!=null&&O.length>A,M=j&&!_?O.slice(0,A):O,N=c==null?null:(0,b.jsx)(`div`,{className:`astryxep27e5`,children:c}),P=()=>k?x.horizontal:h.position===`top`?t===`single`||t===1?x.gridStackedSingle:x.gridStackedMulti:t===`single`||t===1?x.gridSingle:x.gridMulti,F=(()=>{if(k)return null;let e=h.position===`top`;return typeof t==`number`&&t>1?e?`repeat(${t}, 1fr)`:`repeat(${t}, auto 1fr)`:!e&&h.width!=null?`${typeof h.width==`number`?`${h.width}px`:h.width} 1fr`:null})();return(0,b.jsx)(g,{value:D,children:(0,b.jsxs)(`div`,{ref:m,"data-testid":p,...a(o(`metadata-list`,{columns:String(t),orientation:s}),r(x.root,u),d,f),children:[N,(0,b.jsx)(`dl`,{id:T,...r(x.dl,P(),F!=null&&S.gridTemplate(F)),children:M}),j&&(0,b.jsx)(`button`,{type:`button`,"aria-controls":T,"aria-expanded":_,onClick:()=>v(e=>!e),className:`astryxjyslct astryx11g6tue astryx1gs6z28 astryx15nmkw0 astryx1ypdohk astryxqwr325 astryxjm74w1 astryxw6l6zx astryx1e4wzip astryxjb2p0i astryx1yc453h astryxqcrz7y`,children:E(_?`@astryx.metadataList.showLess`:`@astryx.metadataList.showMore`)})]})})}var y,b,x,S,C,w;function T(){return(T=t((()=>{y=n(),i(),_(),s(),u(),b=c(),x={root:{k1xSpc:`astryx78zum5`,kXwgrk:`astryxdt5ytf`,$$css:!0},dl:{kogj98:`astryx1ghz6dp`,kmVPX3:`astryx1717udv`,$$css:!0},gridSingle:{k1xSpc:`astryxrvj5dj`,kumcoG:`astryx1pmbctz`,kOIVth:`astryxpec5dj`,khm7nJ:null,k1C7PZ:null,kGNEyG:`astryx1pha0wt`,$$css:!0},gridMulti:{k1xSpc:`astryxrvj5dj`,kumcoG:`astryx189bvgu`,kOIVth:`astryx18g69wz`,khm7nJ:null,k1C7PZ:null,$$css:!0},gridStackedSingle:{k1xSpc:`astryxrvj5dj`,kumcoG:`astryx1y6fwsi`,kOIVth:`astryxjcht0a`,khm7nJ:null,k1C7PZ:null,$$css:!0},gridStackedMulti:{k1xSpc:`astryxrvj5dj`,kumcoG:`astryx189bvgu`,kOIVth:`astryx18g69wz`,khm7nJ:null,k1C7PZ:null,$$css:!0},horizontal:{k1xSpc:`astryx78zum5`,kXwgrk:`astryx1q0g3np`,kwnvtZ:`astryx1a02dak`,kOIVth:`astryx18g69wz`,khm7nJ:null,k1C7PZ:null,$$css:!0}},S={gridTemplate:e=>[{kumcoG:e==null?e:`astryxqketvx`,$$css:!0},{"--x-gridTemplateColumns":e??void 0}]},C={position:`start`},w={position:`top`},v.displayName=`MetadataList`,v.__docgenInfo={description:``,methods:[],displayName:`MetadataList`,props:{ref:{required:!1,tsType:{name:`ReactRef`,raw:`React.Ref<HTMLDivElement>`,elements:[{name:`HTMLDivElement`}]},description:`Ref forwarded to the root element`},children:{required:!0,tsType:{name:`ReactNode`},description:`Metadata list items. Should be MetadataListItem components.`},columns:{required:!1,tsType:{name:`union`,raw:`'multi' | 'single' | number`,elements:[{name:`literal`,value:`'multi'`},{name:`literal`,value:`'single'`},{name:`number`}]},description:`Column layout mode.
- 'single': Items in a single column
- 'multi': Auto-fill columns based on available width
- number: Fixed number of columns
@default 'single'`,defaultValue:{value:`'single'`,computed:!1}},label:{required:!1,tsType:{name:`MetadataListLabelConfig`},description:`Label display configuration.
- position: 'start' places labels to the left, 'top' stacks labels above content
- width: Custom label width (number in px or CSS string)

Defaults to \`{ position: 'top' }\` for multi-column layouts and
\`{ position: 'start' }\` for single-column layouts.`},maxNumOfItems:{required:!1,tsType:{name:`number`},description:`Maximum number of items to show before collapsing.
When set and items exceed this count, a "Show more" / "Show less"
toggle appears.`},orientation:{required:!1,tsType:{name:`union`,raw:`'vertical' | 'horizontal'`,elements:[{name:`literal`,value:`'vertical'`},{name:`literal`,value:`'horizontal'`}]},description:`Layout orientation for metadata items.
- 'vertical': Items stack vertically (default)
- 'horizontal': Items flow horizontally with flex-wrap

In horizontal mode, items display with labels stacked above content
and wrap to new lines as needed. The following props are ignored:
\`columns\`, \`label\`, \`maxNumOfItems\`.
@default 'vertical'`,defaultValue:{value:`'vertical'`,computed:!1}},title:{required:!1,tsType:{name:`ReactNode`},description:`Optional title or heading rendered above the list.`},"data-testid":{required:!1,tsType:{name:`string`},description:`Test ID for testing frameworks.`}},composes:[`Omit`]}})))()}function E({children:e,icon:t,label:n,xstyle:i,className:s,style:c,"data-testid":l,ref:u}){let d=(0,D.use)(g),f=(d?.labelConfig.position??`start`)===`top`||d?.orientation===`horizontal`,p=(0,O.jsxs)(O.Fragment,{children:[t!=null&&(0,O.jsx)(`span`,{className:`astryx3nfvp2 astryx6s0dn4 astryx2lah0s astryxv1l7n4`,children:t}),n]});return f?(0,O.jsxs)(`div`,{ref:u,"data-testid":l,...a(o(`metadata-list-item`),r(k.stackedWrapper,i),s,c),children:[(0,O.jsx)(`dt`,{className:`astryxv1l7n4 astryxjm74w1 astryxw6l6zx astryx1e4wzip astryx78zum5 astryx6s0dn4 astryx1txdalj astryx1ghz6dp astryx1717udv`,children:p}),(0,O.jsx)(`dd`,{className:`astryx1tgivj0 astryxjm74w1 astryxw6l6zx astryx1ghz6dp astryx1717udv astryx13faqbe`,children:e})]}):(0,O.jsxs)(O.Fragment,{children:[(0,O.jsx)(`dt`,{ref:u,"data-testid":l?`${l}-label`:void 0,...a(o(`metadata-list-item`),r(k.label,i),s,c),children:p}),(0,O.jsx)(`dd`,{"data-testid":l?`${l}-value`:void 0,className:`astryx1tgivj0 astryxjm74w1 astryxw6l6zx astryx1ghz6dp astryx1717udv astryxjwf9q1 astryx13faqbe`,children:e})]})}var D,O,k;function A(){return(A=t((()=>{D=n(),i(),_(),s(),O=c(),k={label:{kMwMTN:`astryxv1l7n4`,kGuDYH:`astryxjm74w1`,kLWn49:`astryxw6l6zx`,k63SB2:`astryx1e4wzip`,k1xSpc:`astryx78zum5`,kGNEyG:`astryx6s0dn4`,kOIVth:`astryx1txdalj`,kogj98:`astryx1ghz6dp`,kmVPX3:`astryx1717udv`,kAzted:`astryxjwf9q1`,kTgw9:`astryx13faqbe`,$$css:!0},stackedWrapper:{k1xSpc:`astryx78zum5`,kXwgrk:`astryxdt5ytf`,kOIVth:`astryx1lsbc85`,$$css:!0}},E.displayName=`MetadataListItem`,E.__docgenInfo={description:`A single labeled metadata value within an MetadataList.

Renders a \`<dt>\` / \`<dd>\` pair. Layout (side-by-side or stacked) is
determined by the parent MetadataList's label configuration.

@example
\`\`\`
<MetadataListItem label="Status">Active</MetadataListItem>
<MetadataListItem label="Created" icon={<CalendarIcon />}>
  January 1, 2023
</MetadataListItem>
\`\`\``,methods:[],displayName:`MetadataListItem`,props:{xstyle:{required:!1,tsType:{name:`StyleXStyles`},description:"StyleX styles created via `stylex.create()`. Merged with the component's\nbase styles inside a single `stylex.props()` call for optimal deduplication.\n\n@example\n```\nconst overrides = stylex.create({ root: { marginBottom: 8 } });\n<Component xstyle={overrides.root} />\n```"},ref:{required:!1,tsType:{name:`ReactRef`,raw:`React.Ref<HTMLDivElement>`,elements:[{name:`HTMLDivElement`}]},description:`Ref forwarded to the root element`},children:{required:!0,tsType:{name:`ReactNode`},description:`Content value for this metadata item.`},icon:{required:!1,tsType:{name:`ReactNode`},description:`Icon rendered before the label text.`},label:{required:!0,tsType:{name:`string`},description:`Label text for this metadata item.`},"data-testid":{required:!1,tsType:{name:`string`},description:`Test ID for testing frameworks.`}},composes:[`Omit`]}})))()}function j({title:e,titleId:t,...n},r){return M.createElement(`svg`,Object.assign({xmlns:`http://www.w3.org/2000/svg`,fill:`none`,viewBox:`0 0 24 24`,strokeWidth:1.5,stroke:`currentColor`,"aria-hidden":`true`,"data-slot":`icon`,ref:r,"aria-labelledby":t},n),e?M.createElement(`title`,{id:t},e):null,M.createElement(`path`,{strokeLinecap:`round`,strokeLinejoin:`round`,d:`M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5`}))}var M,N;function P(){return(P=t((()=>{M=e(n()),N=M.forwardRef(j)})))()}function F({title:e,titleId:t,...n},r){return I.createElement(`svg`,Object.assign({xmlns:`http://www.w3.org/2000/svg`,fill:`none`,viewBox:`0 0 24 24`,strokeWidth:1.5,stroke:`currentColor`,"aria-hidden":`true`,"data-slot":`icon`,ref:r,"aria-labelledby":t},n),e?I.createElement(`title`,{id:t},e):null,I.createElement(`path`,{strokeLinecap:`round`,strokeLinejoin:`round`,d:`m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z`}))}var I,L;function R(){return(R=t((()=>{I=e(n()),L=I.forwardRef(F)})))()}function ee({title:e,titleId:t,...n},r){return z.createElement(`svg`,Object.assign({xmlns:`http://www.w3.org/2000/svg`,fill:`none`,viewBox:`0 0 24 24`,strokeWidth:1.5,stroke:`currentColor`,"aria-hidden":`true`,"data-slot":`icon`,ref:r,"aria-labelledby":t},n),e?z.createElement(`title`,{id:t},e):null,z.createElement(`path`,{strokeLinecap:`round`,strokeLinejoin:`round`,d:`M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z`}),z.createElement(`path`,{strokeLinecap:`round`,strokeLinejoin:`round`,d:`M6 6h.008v.008H6V6Z`}))}var z,B;function V(){return(V=t((()=>{z=e(n()),B=z.forwardRef(ee)})))()}var H,U,W,G,K,q,J,Y,X,Z,Q,$,te;function ne(){return(ne=t((()=>{T(),A(),d(),p(),R(),P(),V(),H=c(),U={title:`Core/MetadataList`,component:v,tags:[`autodocs`],argTypes:{columns:{control:`select`,options:[`single`,`multi`,2,3],description:`Column layout mode`},orientation:{control:`select`,options:[`vertical`,`horizontal`],description:`Layout orientation`}}},W={render:e=>(0,H.jsxs)(v,{...e,children:[(0,H.jsx)(E,{label:`Name`,children:`MetadataList`}),(0,H.jsx)(E,{label:`Status`,children:`Active`}),(0,H.jsx)(E,{label:`Owner`,children:`Joey`})]})},G={render:e=>(0,H.jsxs)(v,{columns:`multi`,...e,children:[(0,H.jsx)(E,{label:`Name`,children:`MetadataList`}),(0,H.jsx)(E,{label:`Status`,children:`Active`}),(0,H.jsx)(E,{label:`Owner`,children:`Joey`}),(0,H.jsx)(E,{label:`Created`,children:`Jan 15, 2026`}),(0,H.jsx)(E,{label:`Tags`,children:(0,H.jsxs)(`span`,{style:{display:`flex`,gap:4},children:[(0,H.jsx)(m,{label:`component`}),(0,H.jsx)(m,{label:`astryx`})]})}),(0,H.jsx)(E,{label:`Priority`,children:`Tier 1`})]})},K={render:e=>(0,H.jsxs)(v,{title:(0,H.jsx)(`strong`,{children:`Component Details`}),columns:`multi`,...e,children:[(0,H.jsx)(E,{label:`Name`,children:`MetadataList`}),(0,H.jsx)(E,{label:`Status`,children:`Active`}),(0,H.jsx)(E,{label:`Owner`,children:`Joey`}),(0,H.jsx)(E,{label:`Created`,children:`Jan 15, 2026`})]})},q={render:e=>(0,H.jsxs)(v,{orientation:`horizontal`,...e,children:[(0,H.jsx)(E,{label:`Status`,children:`Active`}),(0,H.jsx)(E,{label:`Type`,children:`Premium`}),(0,H.jsx)(E,{label:`Owner`,children:`Joey`}),(0,H.jsx)(E,{label:`Created`,children:`Jan 15, 2026`})]})},J={render:e=>(0,H.jsxs)(v,{label:{position:`top`},...e,children:[(0,H.jsx)(E,{label:`Name`,children:`MetadataList`}),(0,H.jsx)(E,{label:`Status`,children:`Active`}),(0,H.jsx)(E,{label:`Owner`,children:`Joey`}),(0,H.jsx)(E,{label:`Tags`,children:(0,H.jsxs)(`span`,{style:{display:`flex`,gap:4},children:[(0,H.jsx)(m,{label:`component`}),(0,H.jsx)(m,{label:`astryx`})]})})]})},Y={render:e=>(0,H.jsxs)(v,{maxNumOfItems:3,...e,children:[(0,H.jsx)(E,{label:`Name`,children:`MetadataList`}),(0,H.jsx)(E,{label:`Status`,children:`Active`}),(0,H.jsx)(E,{label:`Owner`,children:`Joey`}),(0,H.jsx)(E,{label:`Created`,children:`Jan 15, 2026`}),(0,H.jsx)(E,{label:`Updated`,children:`Mar 26, 2026`}),(0,H.jsx)(E,{label:`Priority`,children:`Tier 1`})]})},X={render:e=>(0,H.jsxs)(v,{columns:2,...e,children:[(0,H.jsx)(E,{label:`Name`,children:`MetadataList`}),(0,H.jsx)(E,{label:`Status`,children:`Active`}),(0,H.jsx)(E,{label:`Owner`,children:`Joey`}),(0,H.jsx)(E,{label:`Priority`,children:`Tier 1`})]})},Z={render:e=>(0,H.jsxs)(v,{label:{position:`start`,width:200},...e,children:[(0,H.jsx)(E,{label:`Full Name`,children:`MetadataList Component`}),(0,H.jsx)(E,{label:`Current Status`,children:`Active`}),(0,H.jsx)(E,{label:`Primary Owner`,children:`Joey`})]})},Q={render:e=>(0,H.jsxs)(v,{columns:`multi`,label:{position:`start`},...e,children:[(0,H.jsx)(E,{label:`Name`,children:`MetadataList`}),(0,H.jsx)(E,{label:`Status`,children:`Active`}),(0,H.jsx)(E,{label:`Owner`,children:`Joey`}),(0,H.jsx)(E,{label:`Created`,children:`Jan 15, 2026`})]})},$={render:e=>(0,H.jsxs)(v,{columns:`multi`,...e,children:[(0,H.jsx)(E,{label:`Information`,icon:(0,H.jsx)(f,{icon:L,size:`sm`}),children:`Important details about this component`}),(0,H.jsx)(E,{label:`Created`,icon:(0,H.jsx)(f,{icon:N,size:`sm`}),children:`January 1, 2023`}),(0,H.jsx)(E,{label:`Tags`,icon:(0,H.jsx)(f,{icon:B,size:`sm`}),children:(0,H.jsxs)(`span`,{style:{display:`flex`,gap:4},children:[(0,H.jsx)(m,{label:`component`}),(0,H.jsx)(m,{label:`astryx`})]})})]})},W.parameters={...W.parameters,docs:{...W.parameters?.docs,source:{originalSource:`{
  render: args => <MetadataList {...args}>
      <MetadataListItem label="Name">MetadataList</MetadataListItem>
      <MetadataListItem label="Status">Active</MetadataListItem>
      <MetadataListItem label="Owner">Joey</MetadataListItem>
    </MetadataList>
}`,...W.parameters?.docs?.source}}},G.parameters={...G.parameters,docs:{...G.parameters?.docs,source:{originalSource:`{
  render: args => <MetadataList columns="multi" {...args}>
      <MetadataListItem label="Name">MetadataList</MetadataListItem>
      <MetadataListItem label="Status">Active</MetadataListItem>
      <MetadataListItem label="Owner">Joey</MetadataListItem>
      <MetadataListItem label="Created">Jan 15, 2026</MetadataListItem>
      <MetadataListItem label="Tags">
        <span style={{
        display: 'flex',
        gap: 4
      }}>
          <Token label="component" />
          <Token label="astryx" />
        </span>
      </MetadataListItem>
      <MetadataListItem label="Priority">Tier 1</MetadataListItem>
    </MetadataList>
}`,...G.parameters?.docs?.source}}},K.parameters={...K.parameters,docs:{...K.parameters?.docs,source:{originalSource:`{
  render: args => <MetadataList title={<strong>Component Details</strong>} columns="multi" {...args}>
      <MetadataListItem label="Name">MetadataList</MetadataListItem>
      <MetadataListItem label="Status">Active</MetadataListItem>
      <MetadataListItem label="Owner">Joey</MetadataListItem>
      <MetadataListItem label="Created">Jan 15, 2026</MetadataListItem>
    </MetadataList>
}`,...K.parameters?.docs?.source}}},q.parameters={...q.parameters,docs:{...q.parameters?.docs,source:{originalSource:`{
  render: args => <MetadataList orientation="horizontal" {...args}>
      <MetadataListItem label="Status">Active</MetadataListItem>
      <MetadataListItem label="Type">Premium</MetadataListItem>
      <MetadataListItem label="Owner">Joey</MetadataListItem>
      <MetadataListItem label="Created">Jan 15, 2026</MetadataListItem>
    </MetadataList>
}`,...q.parameters?.docs?.source}}},J.parameters={...J.parameters,docs:{...J.parameters?.docs,source:{originalSource:`{
  render: args => <MetadataList label={{
    position: 'top'
  }} {...args}>
      <MetadataListItem label="Name">MetadataList</MetadataListItem>
      <MetadataListItem label="Status">Active</MetadataListItem>
      <MetadataListItem label="Owner">Joey</MetadataListItem>
      <MetadataListItem label="Tags">
        <span style={{
        display: 'flex',
        gap: 4
      }}>
          <Token label="component" />
          <Token label="astryx" />
        </span>
      </MetadataListItem>
    </MetadataList>
}`,...J.parameters?.docs?.source}}},Y.parameters={...Y.parameters,docs:{...Y.parameters?.docs,source:{originalSource:`{
  render: args => <MetadataList maxNumOfItems={3} {...args}>
      <MetadataListItem label="Name">MetadataList</MetadataListItem>
      <MetadataListItem label="Status">Active</MetadataListItem>
      <MetadataListItem label="Owner">Joey</MetadataListItem>
      <MetadataListItem label="Created">Jan 15, 2026</MetadataListItem>
      <MetadataListItem label="Updated">Mar 26, 2026</MetadataListItem>
      <MetadataListItem label="Priority">Tier 1</MetadataListItem>
    </MetadataList>
}`,...Y.parameters?.docs?.source}}},X.parameters={...X.parameters,docs:{...X.parameters?.docs,source:{originalSource:`{
  render: args => <MetadataList columns={2} {...args}>
      <MetadataListItem label="Name">MetadataList</MetadataListItem>
      <MetadataListItem label="Status">Active</MetadataListItem>
      <MetadataListItem label="Owner">Joey</MetadataListItem>
      <MetadataListItem label="Priority">Tier 1</MetadataListItem>
    </MetadataList>
}`,...X.parameters?.docs?.source}}},Z.parameters={...Z.parameters,docs:{...Z.parameters?.docs,source:{originalSource:`{
  render: args => <MetadataList label={{
    position: 'start',
    width: 200
  }} {...args}>
      <MetadataListItem label="Full Name">
        MetadataList Component
      </MetadataListItem>
      <MetadataListItem label="Current Status">Active</MetadataListItem>
      <MetadataListItem label="Primary Owner">Joey</MetadataListItem>
    </MetadataList>
}`,...Z.parameters?.docs?.source}}},Q.parameters={...Q.parameters,docs:{...Q.parameters?.docs,source:{originalSource:`{
  render: args => <MetadataList columns="multi" label={{
    position: 'start'
  }} {...args}>
      <MetadataListItem label="Name">MetadataList</MetadataListItem>
      <MetadataListItem label="Status">Active</MetadataListItem>
      <MetadataListItem label="Owner">Joey</MetadataListItem>
      <MetadataListItem label="Created">Jan 15, 2026</MetadataListItem>
    </MetadataList>
}`,...Q.parameters?.docs?.source}}},$.parameters={...$.parameters,docs:{...$.parameters?.docs,source:{originalSource:`{
  render: args => <MetadataList columns="multi" {...args}>
      <MetadataListItem label="Information" icon={<Icon icon={InformationCircleIcon} size="sm" />}>
        Important details about this component
      </MetadataListItem>
      <MetadataListItem label="Created" icon={<Icon icon={CalendarIcon} size="sm" />}>
        January 1, 2023
      </MetadataListItem>
      <MetadataListItem label="Tags" icon={<Icon icon={TagIcon} size="sm" />}>
        <span style={{
        display: 'flex',
        gap: 4
      }}>
          <Token label="component" />
          <Token label="astryx" />
        </span>
      </MetadataListItem>
    </MetadataList>
}`,...$.parameters?.docs?.source}}},te=[`Basic`,`MultiColumn`,`WithTitle`,`Horizontal`,`StackedLabelsSingleColumn`,`ShowMore`,`TwoColumns`,`CustomLabelWidth`,`MultiColumnSideLabels`,`WithIcons`]})))()}ne();export{W as Basic,Z as CustomLabelWidth,q as Horizontal,G as MultiColumn,Q as MultiColumnSideLabels,Y as ShowMore,J as StackedLabelsSingleColumn,X as TwoColumns,$ as WithIcons,K as WithTitle,te as __namedExportsOrder,U as default};