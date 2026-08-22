import{i as e,s as t}from"./preload-helper-CT_b8DTk.js";import{t as n}from"./react-B7Te67-h.js";import{t as r}from"./jsx-runtime-DqZldVDK.js";import{t as i}from"./Text-DgptUEJl.js";import{n as a,t as o}from"./Spinner-X-Ouy7_-.js";import{c as s,o as c,t as l,u}from"./Indicator-BFlk8urq.js";import{i as d,o as f,t as p}from"./Stack-lUuMxHZ4.js";import{t as m}from"./Text-B20s2a5b.js";function h({label:e,children:t}){return(0,_.jsxs)(f,{gap:4,vAlign:`center`,children:[(0,_.jsx)(`span`,{style:{minWidth:260},children:(0,_.jsx)(i,{type:`supporting`,color:`secondary`,children:e})}),t]})}var g,_,v,y,b,x,S,C,w,T;e((()=>{g=t(n()),l(),o(),m(),p(),_=r(),v={title:`Core/Indicator`,component:s,parameters:{layout:`padded`,docs:{description:{component:`Indicators are the componentized selection visuals shared by CheckboxInput,
RadioList, Selector and menu selection rows. They are decorative: the owning
component keeps the input, role, accessible name, focus and keyboard
behavior, while the indicator turns \`state\` into a picture.

These stories render them directly, which no other story file does — every
other one reaches an indicator through a host. That matters for the
\`children\` slot in particular: it is the path a host uses to show a pending
Spinner, and it had no rendered coverage anywhere until this file existed.`}}},tags:[`autodocs`]},y={display:`inline-flex`,alignItems:`center`,justifyContent:`center`,minWidth:40,minHeight:32},b={render:()=>(0,_.jsxs)(d,{gap:4,children:[(0,_.jsxs)(h,{label:`CheckIndicator — unchecked, checked`,children:[(0,_.jsx)(`span`,{style:y,children:(0,_.jsx)(s,{state:`unchecked`})}),(0,_.jsx)(`span`,{style:y,children:(0,_.jsx)(s,{state:`checked`})})]}),(0,_.jsxs)(h,{label:`CheckboxIndicator — unchecked, checked, indeterminate`,children:[(0,_.jsx)(`span`,{style:y,children:(0,_.jsx)(u,{state:`unchecked`})}),(0,_.jsx)(`span`,{style:y,children:(0,_.jsx)(u,{state:`checked`})}),(0,_.jsx)(`span`,{style:y,children:(0,_.jsx)(u,{state:`indeterminate`})})]}),(0,_.jsxs)(h,{label:`RadioIndicator — unchecked, checked`,children:[(0,_.jsx)(`span`,{style:y,children:(0,_.jsx)(c,{state:`unchecked`})}),(0,_.jsx)(`span`,{style:y,children:(0,_.jsx)(c,{state:`checked`})})]})]})},x={render:()=>(0,_.jsxs)(d,{gap:4,children:[(0,_.jsxs)(h,{label:`sm`,children:[(0,_.jsx)(`span`,{style:y,children:(0,_.jsx)(s,{state:`checked`,size:`sm`})}),(0,_.jsx)(`span`,{style:y,children:(0,_.jsx)(u,{state:`checked`,size:`sm`})}),(0,_.jsx)(`span`,{style:y,children:(0,_.jsx)(c,{state:`checked`,size:`sm`})})]}),(0,_.jsxs)(h,{label:`md (default)`,children:[(0,_.jsx)(`span`,{style:y,children:(0,_.jsx)(s,{state:`checked`,size:`md`})}),(0,_.jsx)(`span`,{style:y,children:(0,_.jsx)(u,{state:`checked`,size:`md`})}),(0,_.jsx)(`span`,{style:y,children:(0,_.jsx)(c,{state:`checked`,size:`md`})})]})]})},S={render:()=>(0,_.jsxs)(d,{gap:4,children:[(0,_.jsxs)(h,{label:`disabled — unchecked`,children:[(0,_.jsx)(`span`,{style:y,children:(0,_.jsx)(s,{state:`unchecked`,isDisabled:!0})}),(0,_.jsx)(`span`,{style:y,children:(0,_.jsx)(u,{state:`unchecked`,isDisabled:!0})}),(0,_.jsx)(`span`,{style:y,children:(0,_.jsx)(c,{state:`unchecked`,isDisabled:!0})})]}),(0,_.jsxs)(h,{label:`disabled — checked`,children:[(0,_.jsx)(`span`,{style:y,children:(0,_.jsx)(s,{state:`checked`,isDisabled:!0})}),(0,_.jsx)(`span`,{style:y,children:(0,_.jsx)(u,{state:`checked`,isDisabled:!0})}),(0,_.jsx)(`span`,{style:y,children:(0,_.jsx)(c,{state:`checked`,isDisabled:!0})})]})]})},C={render:()=>{let e=e=>e&&(0,_.jsx)(a,{size:`sm`,shade:`inherit`});return(0,_.jsxs)(d,{gap:4,children:[(0,_.jsx)(i,{type:`supporting`,color:`secondary`,children:`Column 1 keeps its mark (children renders nothing). Column 2 shows the spinner instead of the mark.`}),(0,_.jsxs)(h,{label:`CheckIndicator — checked`,children:[(0,_.jsx)(`span`,{style:y,children:(0,_.jsx)(s,{state:`checked`,children:e(!1)})}),(0,_.jsx)(`span`,{style:y,children:(0,_.jsx)(s,{state:`checked`,children:e(!0)})})]}),(0,_.jsxs)(h,{label:`CheckboxIndicator — checked`,children:[(0,_.jsx)(`span`,{style:y,children:(0,_.jsx)(u,{state:`checked`,children:e(!1)})}),(0,_.jsx)(`span`,{style:y,children:(0,_.jsx)(u,{state:`checked`,children:e(!0)})})]}),(0,_.jsxs)(h,{label:`CheckboxIndicator — indeterminate`,children:[(0,_.jsx)(`span`,{style:y,children:(0,_.jsx)(u,{state:`indeterminate`,children:e(!1)})}),(0,_.jsx)(`span`,{style:y,children:(0,_.jsx)(u,{state:`indeterminate`,children:e(!0)})})]}),(0,_.jsxs)(h,{label:`RadioIndicator — checked`,children:[(0,_.jsx)(`span`,{style:y,children:(0,_.jsx)(c,{state:`checked`,children:e(!1)})}),(0,_.jsx)(`span`,{style:y,children:(0,_.jsx)(c,{state:`checked`,children:e(!0)})})]})]})}},w={render:function(){let[e,t]=(0,g.useState)(!1),n=e&&(0,_.jsx)(a,{size:`sm`,shade:`inherit`});return(0,_.jsxs)(d,{gap:4,children:[(0,_.jsxs)(`label`,{children:[(0,_.jsx)(`input`,{type:`checkbox`,checked:e,onChange:e=>t(e.target.checked)}),` `,(0,_.jsx)(i,{type:`supporting`,children:`isBusy`})]}),(0,_.jsxs)(f,{gap:4,vAlign:`center`,children:[(0,_.jsx)(`span`,{style:y,children:(0,_.jsx)(s,{state:`checked`,children:n})}),(0,_.jsx)(`span`,{style:y,children:(0,_.jsx)(u,{state:`checked`,children:n})}),(0,_.jsx)(`span`,{style:y,children:(0,_.jsx)(c,{state:`checked`,children:n})})]})]})}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  render: () => <VStack gap={4}>
      <Row label="CheckIndicator — unchecked, checked">
        <span style={cellStyle}>
          <CheckIndicator state="unchecked" />
        </span>
        <span style={cellStyle}>
          <CheckIndicator state="checked" />
        </span>
      </Row>
      <Row label="CheckboxIndicator — unchecked, checked, indeterminate">
        <span style={cellStyle}>
          <CheckboxIndicator state="unchecked" />
        </span>
        <span style={cellStyle}>
          <CheckboxIndicator state="checked" />
        </span>
        <span style={cellStyle}>
          <CheckboxIndicator state="indeterminate" />
        </span>
      </Row>
      <Row label="RadioIndicator — unchecked, checked">
        <span style={cellStyle}>
          <RadioIndicator state="unchecked" />
        </span>
        <span style={cellStyle}>
          <RadioIndicator state="checked" />
        </span>
      </Row>
    </VStack>
}`,...b.parameters?.docs?.source},description:{story:`Every indicator, in every state its family defines.`,...b.parameters?.docs?.description}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  render: () => <VStack gap={4}>
      <Row label="sm">
        <span style={cellStyle}>
          <CheckIndicator state="checked" size="sm" />
        </span>
        <span style={cellStyle}>
          <CheckboxIndicator state="checked" size="sm" />
        </span>
        <span style={cellStyle}>
          <RadioIndicator state="checked" size="sm" />
        </span>
      </Row>
      <Row label="md (default)">
        <span style={cellStyle}>
          <CheckIndicator state="checked" size="md" />
        </span>
        <span style={cellStyle}>
          <CheckboxIndicator state="checked" size="md" />
        </span>
        <span style={cellStyle}>
          <RadioIndicator state="checked" size="md" />
        </span>
      </Row>
    </VStack>
}`,...x.parameters?.docs?.source},description:{story:`Both control sizes, side by side.`,...x.parameters?.docs?.description}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  render: () => <VStack gap={4}>
      <Row label="disabled — unchecked">
        <span style={cellStyle}>
          <CheckIndicator state="unchecked" isDisabled />
        </span>
        <span style={cellStyle}>
          <CheckboxIndicator state="unchecked" isDisabled />
        </span>
        <span style={cellStyle}>
          <RadioIndicator state="unchecked" isDisabled />
        </span>
      </Row>
      <Row label="disabled — checked">
        <span style={cellStyle}>
          <CheckIndicator state="checked" isDisabled />
        </span>
        <span style={cellStyle}>
          <CheckboxIndicator state="checked" isDisabled />
        </span>
        <span style={cellStyle}>
          <RadioIndicator state="checked" isDisabled />
        </span>
      </Row>
    </VStack>
}`,...S.parameters?.docs?.source},description:{story:`Disabled is purely visual — the owner keeps the real disabled semantics.`,...S.parameters?.docs?.description}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  render: () => {
    const idiom = (isBusy: boolean) => isBusy && <Spinner size="sm" shade="inherit" />;
    return <VStack gap={4}>
        <Text type="supporting" color="secondary">
          Column 1 keeps its mark (children renders nothing). Column 2 shows the
          spinner instead of the mark.
        </Text>
        <Row label="CheckIndicator — checked">
          <span style={cellStyle}>
            <CheckIndicator state="checked">{idiom(false)}</CheckIndicator>
          </span>
          <span style={cellStyle}>
            <CheckIndicator state="checked">{idiom(true)}</CheckIndicator>
          </span>
        </Row>
        <Row label="CheckboxIndicator — checked">
          <span style={cellStyle}>
            <CheckboxIndicator state="checked">
              {idiom(false)}
            </CheckboxIndicator>
          </span>
          <span style={cellStyle}>
            <CheckboxIndicator state="checked">{idiom(true)}</CheckboxIndicator>
          </span>
        </Row>
        <Row label="CheckboxIndicator — indeterminate">
          <span style={cellStyle}>
            <CheckboxIndicator state="indeterminate">
              {idiom(false)}
            </CheckboxIndicator>
          </span>
          <span style={cellStyle}>
            <CheckboxIndicator state="indeterminate">
              {idiom(true)}
            </CheckboxIndicator>
          </span>
        </Row>
        <Row label="RadioIndicator — checked">
          <span style={cellStyle}>
            <RadioIndicator state="checked">{idiom(false)}</RadioIndicator>
          </span>
          <span style={cellStyle}>
            <RadioIndicator state="checked">{idiom(true)}</RadioIndicator>
          </span>
        </Row>
      </VStack>;
  }
}`,...C.parameters?.docs?.source},description:{story:"The `children` slot, and the reason it needs a story.\n\nA host shows a pending change by passing a Spinner through `children`, and\nthe idiom it writes is `children={isBusy && <Spinner/>}`. When `isBusy` is\nfalse that passes `false` — which is neither `null` nor caught by `??`. Every\nindicator used to take the children path on it, render nothing there, and\nDELETE its state mark (#4893).\n\nRead the first column: each cell must still show its mark. Only the second\ncolumn should show a spinner in place of one.",...C.parameters?.docs?.description}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  render: function BusyToggleStory() {
    const [isBusy, setIsBusy] = useState(false);
    const busy = isBusy && <Spinner size="sm" shade="inherit" />;
    return <VStack gap={4}>
        <label>
          <input type="checkbox" checked={isBusy} onChange={e => setIsBusy(e.target.checked)} />{' '}
          <Text type="supporting">isBusy</Text>
        </label>
        <HStack gap={4} vAlign="center">
          <span style={cellStyle}>
            <CheckIndicator state="checked">{busy}</CheckIndicator>
          </span>
          <span style={cellStyle}>
            <CheckboxIndicator state="checked">{busy}</CheckboxIndicator>
          </span>
          <span style={cellStyle}>
            <RadioIndicator state="checked">{busy}</RadioIndicator>
          </span>
        </HStack>
      </VStack>;
  }
}`,...w.parameters?.docs?.source},description:{story:`A live toggle of the same idiom: flip busy and the spinner replaces the mark,
flip it back and the mark returns. Before #4893 the mark did not come back —
it never rendered in the first place.`,...w.parameters?.docs?.description}}},T=[`AllStates`,`Sizes`,`Disabled`,`BusyChildren`,`BusyToggle`]}))();export{b as AllStates,C as BusyChildren,w as BusyToggle,S as Disabled,x as Sizes,T as __namedExportsOrder,v as default};