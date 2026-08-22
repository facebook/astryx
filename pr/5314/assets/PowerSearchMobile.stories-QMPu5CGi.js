import{i as e,s as t}from"./preload-helper-CT_b8DTk.js";import{t as n}from"./react-B7Te67-h.js";import{t as r}from"./jsx-runtime-DqZldVDK.js";import{o as i}from"./useTheme-CGU0S16R.js";import{t as a}from"./Text-UAS9zcOf.js";import{t as o}from"./hooks-oGR3Y7SS.js";import{i as s,t as c}from"./Stack-0ny5TcvU.js";import{t as l}from"./Text-udrQkxTB.js";import{$ as u,X as d,tt as f}from"./iframe-Ypud2X3u.js";var p,m,h,g,_,v,y,b,x,S,C,w,T,E;e((()=>{p=t(n()),d(),o(),l(),c(),m=r(),h=[{value:`open`,label:`Open`},{value:`in_progress`,label:`In Progress`},{value:`review`,label:`In Review`},{value:`closed`,label:`Closed`}],g={name:`IssueSearch`,fields:[{key:`status`,label:`Status`,description:`Where the issue sits in the workflow`,operators:[{key:`is`,i18nKey:`@astryx.powersearch.operator.is`,value:{type:`enum`,values:h}},{key:`isNot`,i18nKey:`@astryx.powersearch.operator.isNot`,value:{type:`enum`,values:h}}]},{key:`title`,label:`Title`,description:`Free text anywhere in the issue title`,operators:[{key:`contains`,i18nKey:`@astryx.powersearch.operator.contains`,value:{type:`string`}}]},{key:`tags`,label:`Tags`,group:`Metadata`,operators:[{key:`isAnyOf`,i18nKey:`@astryx.powersearch.operator.isAnyOf`,value:{type:`enum_list`,values:[{value:`bug`,label:`Bug`},{value:`feature`,label:`Feature`},{value:`docs`,label:`Documentation`},{value:`perf`,label:`Performance`},{value:`security`,label:`Security`}]}}]},{key:`points`,label:`Story points`,group:`Metadata`,operators:[{key:`greaterThan`,i18nKey:`@astryx.powersearch.operator.greaterThan`,value:{type:`integer`,minValue:0,maxValue:21}}]},{key:`created`,label:`Created`,group:`Dates`,operators:[{key:`before`,i18nKey:`@astryx.powersearch.operator.before`,value:{type:`date_absolute`,isDateOnly:!0}},{key:`after`,i18nKey:`@astryx.powersearch.operator.after`,value:{type:`date_absolute`,isDateOnly:!0}}]},{key:`unassigned`,label:`Unassigned`,description:`Nobody has picked it up yet`,group:`Metadata`,operators:[{key:`isTrue`,i18nKey:`@astryx.powersearch.operator.isTrue`,value:{type:`empty`}}]}]},_={name:`WideSearch`,fields:[...g.fields,...[`Assignee`,`Reporter`,`Component`,`Milestone`,`Sprint`,`Resolution`].map(e=>({key:e.toLowerCase(),label:e,group:`People and planning`,operators:[{key:`is`,i18nKey:`@astryx.powersearch.operator.is`,value:{type:`string`}}]}))]},v={title:`Core/PowerSearchMobile`,component:u,tags:[`autodocs`],decorators:[e=>(0,m.jsx)(`div`,{style:{width:390,maxWidth:`100%`},children:(0,m.jsx)(e,{})})],argTypes:{placeholder:{control:`text`},isDisabled:{control:`boolean`},isReadOnly:{control:`boolean`},hasClear:{control:`boolean`},maxTokenLength:{control:`number`},popoverSaveButtonLabel:{control:`text`},size:{control:`radio`,options:[`sm`,`md`,`lg`]}}},y={render:e=>{let[t,n]=(0,p.useState)([]);return(0,m.jsx)(u,{...e,config:g,filters:t,onChange:n})}},b={render:e=>{let[t,n]=(0,p.useState)([{field:`status`,operator:`is`,value:{type:`enum`,value:`open`}},{field:`tags`,operator:`isAnyOf`,value:{type:`enum_list`,value:[`bug`,`perf`]}}]);return(0,m.jsx)(u,{...e,config:g,filters:t,onChange:n,resultCount:t.length===0?248:31})}},x={render:e=>{let[t,n]=(0,p.useState)([]);return(0,m.jsx)(u,{...e,config:_,filters:t,onChange:n})}},S={args:{isReadOnly:!0,isLabelHidden:!1,label:`Applied filters`},render:e=>(0,m.jsx)(u,{...e,config:g,filters:[{field:`status`,operator:`is`,value:{type:`enum`,value:`open`}}],onChange:()=>{}})},C={args:{isDisabled:!0,isLabelHidden:!1,label:`Filters`,disabledMessage:`Pick a project before filtering`},render:e=>(0,m.jsx)(u,{...e,config:g,filters:[],onChange:()=>{}})},w={args:{isLabelHidden:!1,label:`Filters`,status:{type:`error`,message:`Add at least one filter`}},render:e=>{let[t,n]=(0,p.useState)([]);return(0,m.jsx)(u,{...e,config:g,filters:t,onChange:n})}},T={parameters:{controls:{disable:!0}},render:()=>{let e=i(`(max-width: 768px)`),t=e?u:f,[n,r]=(0,p.useState)([]);return(0,m.jsxs)(s,{gap:2,children:[(0,m.jsxs)(a,{type:`supporting`,color:`secondary`,children:[`Rendering `,e?`PowerSearchMobile`:`PowerSearch`]}),(0,m.jsx)(t,{config:g,filters:n,onChange:r,resultCount:n.length===0?248:31})]})}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [filters, setFilters] = useState<ReadonlyArray<PowerSearchFilter>>([]);
    return <PowerSearchMobile {...args} config={issueConfig} filters={filters} onChange={setFilters} />;
  }
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [filters, setFilters] = useState<ReadonlyArray<PowerSearchFilter>>([{
      field: 'status',
      operator: 'is',
      value: {
        type: 'enum',
        value: 'open'
      }
    }, {
      field: 'tags',
      operator: 'isAnyOf',
      value: {
        type: 'enum_list',
        value: ['bug', 'perf']
      }
    }]);
    return <PowerSearchMobile {...args} config={issueConfig} filters={filters} onChange={setFilters} resultCount={filters.length === 0 ? 248 : 31} />;
  }
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [filters, setFilters] = useState<ReadonlyArray<PowerSearchFilter>>([]);
    return <PowerSearchMobile {...args} config={wideConfig} filters={filters} onChange={setFilters} />;
  }
}`,...x.parameters?.docs?.source},description:{story:`Past seven or so fields the sheet adds a search box above the list, pinned
under the title while the list scrolls.`,...x.parameters?.docs?.description}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  args: {
    isReadOnly: true,
    isLabelHidden: false,
    label: 'Applied filters'
  },
  render: args => <PowerSearchMobile {...args} config={issueConfig} filters={[{
    field: 'status',
    operator: 'is',
    value: {
      type: 'enum',
      value: 'open'
    }
  }]} onChange={() => {}} />
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  args: {
    isDisabled: true,
    isLabelHidden: false,
    label: 'Filters',
    disabledMessage: 'Pick a project before filtering'
  },
  render: args => <PowerSearchMobile {...args} config={issueConfig} filters={[]} onChange={() => {}} />
}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  args: {
    isLabelHidden: false,
    label: 'Filters',
    status: {
      type: 'error',
      message: 'Add at least one filter'
    }
  },
  render: args => {
    const [filters, setFilters] = useState<ReadonlyArray<PowerSearchFilter>>([]);
    return <PowerSearchMobile {...args} config={issueConfig} filters={filters} onChange={setFilters} />;
  }
}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  parameters: {
    controls: {
      disable: true
    }
  },
  render: () => {
    const isTouch = useMediaQuery('(max-width: 768px)');
    const Search = isTouch ? PowerSearchMobile : PowerSearch;
    const [filters, setFilters] = useState<ReadonlyArray<PowerSearchFilter>>([]);
    return <VStack gap={2}>
        <Text type="supporting" color="secondary">
          Rendering {isTouch ? 'PowerSearchMobile' : 'PowerSearch'}
        </Text>
        <Search config={issueConfig} filters={filters} onChange={setFilters} resultCount={filters.length === 0 ? 248 : 31} />
      </VStack>;
  }
}`,...T.parameters?.docs?.source},description:{story:`The intended production shape: one call site, one viewport check, both
variants fed the same props. Resize the preview across 768px to swap.`,...T.parameters?.docs?.description}}},E=[`Default`,`WithFilters`,`SearchableFieldList`,`ReadOnly`,`Disabled`,`WithStatus`,`Responsive`]}))();export{y as Default,C as Disabled,S as ReadOnly,T as Responsive,x as SearchableFieldList,b as WithFilters,w as WithStatus,E as __namedExportsOrder,v as default};