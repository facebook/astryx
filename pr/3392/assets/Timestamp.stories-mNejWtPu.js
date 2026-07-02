import{a1 as e,T as a}from"./iframe-BAsU9Dt9.js";import{T as t}from"./Timestamp-DmPgZOW9.js";import"./preload-helper-Ct5FWWRu.js";const j={title:"Core/Timestamp",component:t,tags:["autodocs"],argTypes:{format:{control:"select",options:["relative","auto","date","date_time","time","system_date","system_date_time","system_time"],description:"Display format"},type:{control:"select",options:["body","large","label","supporting","code","display-1","display-2","display-3"],description:"Semantic text type (from Text)"},size:{control:"select",options:["4xs","3xs","2xs","xsm","sm","base","lg","xl","2xl","3xl","4xl"],description:"Font size override"},color:{control:"select",options:["primary","secondary","disabled","placeholder","accent","inherit"],description:"Text color"},weight:{control:"select",options:["normal","medium","semibold","bold"],description:"Font weight"},isLive:{control:"boolean",description:"Live-update relative time"},hasTooltip:{control:"boolean",description:"Show tooltip on hover"},isTimezoneShown:{control:"boolean",description:"Append timezone abbreviation"}}},s={args:{value:"2026-03-25T12:00:00Z"}},o={render:()=>e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"8px",alignItems:"flex-start"},children:[e.jsx(t,{value:Date.now()/1e3-5,format:"relative"}),e.jsx(t,{value:Date.now()/1e3-120,format:"relative"}),e.jsx(t,{value:Date.now()/1e3-3600,format:"relative"}),e.jsx(t,{value:Date.now()/1e3-86400,format:"relative"}),e.jsx(t,{value:Date.now()/1e3-259200,format:"relative"}),e.jsx(t,{value:Date.now()/1e3-90*86400,format:"relative"}),e.jsx(t,{value:Date.now()/1e3-730*86400,format:"relative"})]})},l={args:{value:"2026-02-19T17:00:00Z",format:"date"}},i={args:{value:"2026-02-19T17:00:00Z",format:"date_time"}},m={args:{value:"2026-02-19T17:00:00Z",format:"date_time",isTimezoneShown:!0}},d={args:{value:"2026-02-19T17:00:00Z",format:"time"}},c={render:()=>e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"8px"},children:[e.jsxs("div",{children:[e.jsxs(a,{type:"label",color:"secondary",children:["system_date:"," "]}),e.jsx(t,{value:"2026-02-19T17:00:00Z",format:"system_date",type:"code"})]}),e.jsxs("div",{children:[e.jsxs(a,{type:"label",color:"secondary",children:["system_date_time:"," "]}),e.jsx(t,{value:"2026-02-19T17:00:00Z",format:"system_date_time",type:"code"})]}),e.jsxs("div",{children:[e.jsxs(a,{type:"label",color:"secondary",children:["system_time:"," "]}),e.jsx(t,{value:"2026-02-19T17:00:00Z",format:"system_time",type:"code"})]})]})},n={render:()=>{const r="2026-02-19T17:00:00Z";return e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"8px"},children:[e.jsxs("div",{children:[e.jsxs(a,{type:"label",color:"secondary",children:["relative:"," "]}),e.jsx(t,{value:Date.now()/1e3-3600,format:"relative"})]}),e.jsxs("div",{children:[e.jsxs(a,{type:"label",color:"secondary",children:["date:"," "]}),e.jsx(t,{value:r,format:"date"})]}),e.jsxs("div",{children:[e.jsxs(a,{type:"label",color:"secondary",children:["date_time:"," "]}),e.jsx(t,{value:r,format:"date_time"})]}),e.jsxs("div",{children:[e.jsxs(a,{type:"label",color:"secondary",children:["time:"," "]}),e.jsx(t,{value:r,format:"time"})]}),e.jsxs("div",{children:[e.jsxs(a,{type:"label",color:"secondary",children:["system_date:"," "]}),e.jsx(t,{value:r,format:"system_date",type:"code"})]}),e.jsxs("div",{children:[e.jsxs(a,{type:"label",color:"secondary",children:["system_date_time:"," "]}),e.jsx(t,{value:r,format:"system_date_time",type:"code"})]}),e.jsxs("div",{children:[e.jsxs(a,{type:"label",color:"secondary",children:["system_time:"," "]}),e.jsx(t,{value:r,format:"system_time",type:"code"})]})]})}},p={args:{value:Date.now()/1e3-5,format:"relative",isLive:!0}},v={render:()=>e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"8px"},children:[e.jsx(t,{value:"2026-02-19T17:00:00Z",format:"date_time",type:"supporting"}),e.jsx(t,{value:"2026-02-19T17:00:00Z",format:"date_time",type:"body"}),e.jsx(t,{value:"2026-02-19T17:00:00Z",format:"date_time",type:"large"}),e.jsx(t,{value:"2026-02-19T17:00:00Z",format:"date_time",type:"label",weight:"semibold"})]})},u={render:()=>e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"8px"},children:[e.jsx(t,{value:"2026-02-19T17:00:00Z",format:"date_time",color:"primary"}),e.jsx(t,{value:"2026-02-19T17:00:00Z",format:"date_time",color:"secondary"}),e.jsx(t,{value:"2026-02-19T17:00:00Z",format:"date_time",color:"disabled"}),e.jsx(t,{value:"2026-02-19T17:00:00Z",format:"date_time",color:"accent"})]})},x={render:()=>e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"8px"},children:[e.jsxs("div",{children:[e.jsxs(a,{type:"label",color:"secondary",children:["Recent (relative):"," "]}),e.jsx(t,{value:Date.now()/1e3-3600,format:"auto"})]}),e.jsxs("div",{children:[e.jsxs(a,{type:"label",color:"secondary",children:["Old (date_time):"," "]}),e.jsx(t,{value:"2025-01-01T12:00:00Z",format:"auto"})]})]})},y={render:()=>e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"8px",alignItems:"flex-start"},children:[e.jsx(t,{value:Date.now()/1e3+60,format:"relative"}),e.jsx(t,{value:Date.now()/1e3+3600,format:"relative"}),e.jsx(t,{value:Date.now()/1e3+86400,format:"relative"})]})};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    value: '2026-03-25T12:00:00Z'
  }
}`,...s.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    alignItems: 'flex-start'
  }}>
      <Timestamp value={Date.now() / 1000 - 5} format="relative" />
      <Timestamp value={Date.now() / 1000 - 120} format="relative" />
      <Timestamp value={Date.now() / 1000 - 3600} format="relative" />
      <Timestamp value={Date.now() / 1000 - 86400} format="relative" />
      <Timestamp value={Date.now() / 1000 - 259200} format="relative" />
      <Timestamp value={Date.now() / 1000 - 90 * 86400} format="relative" />
      <Timestamp value={Date.now() / 1000 - 730 * 86400} format="relative" />
    </div>
}`,...o.parameters?.docs?.source}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    value: '2026-02-19T17:00:00Z',
    format: 'date'
  }
}`,...l.parameters?.docs?.source}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  args: {
    value: '2026-02-19T17:00:00Z',
    format: 'date_time'
  }
}`,...i.parameters?.docs?.source}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    value: '2026-02-19T17:00:00Z',
    format: 'date_time',
    isTimezoneShown: true
  }
}`,...m.parameters?.docs?.source}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    value: '2026-02-19T17:00:00Z',
    format: 'time'
  }
}`,...d.parameters?.docs?.source}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  }}>
      <div>
        <Text type="label" color="secondary">
          system_date:{' '}
        </Text>
        <Timestamp value="2026-02-19T17:00:00Z" format="system_date" type="code" />
      </div>
      <div>
        <Text type="label" color="secondary">
          system_date_time:{' '}
        </Text>
        <Timestamp value="2026-02-19T17:00:00Z" format="system_date_time" type="code" />
      </div>
      <div>
        <Text type="label" color="secondary">
          system_time:{' '}
        </Text>
        <Timestamp value="2026-02-19T17:00:00Z" format="system_time" type="code" />
      </div>
    </div>
}`,...c.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  render: () => {
    const date = '2026-02-19T17:00:00Z';
    return <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '8px'
    }}>
        <div>
          <Text type="label" color="secondary">
            relative:{' '}
          </Text>
          <Timestamp value={Date.now() / 1000 - 3600} format="relative" />
        </div>
        <div>
          <Text type="label" color="secondary">
            date:{' '}
          </Text>
          <Timestamp value={date} format="date" />
        </div>
        <div>
          <Text type="label" color="secondary">
            date_time:{' '}
          </Text>
          <Timestamp value={date} format="date_time" />
        </div>
        <div>
          <Text type="label" color="secondary">
            time:{' '}
          </Text>
          <Timestamp value={date} format="time" />
        </div>
        <div>
          <Text type="label" color="secondary">
            system_date:{' '}
          </Text>
          <Timestamp value={date} format="system_date" type="code" />
        </div>
        <div>
          <Text type="label" color="secondary">
            system_date_time:{' '}
          </Text>
          <Timestamp value={date} format="system_date_time" type="code" />
        </div>
        <div>
          <Text type="label" color="secondary">
            system_time:{' '}
          </Text>
          <Timestamp value={date} format="system_time" type="code" />
        </div>
      </div>;
  }
}`,...n.parameters?.docs?.source}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    value: Date.now() / 1000 - 5,
    format: 'relative',
    isLive: true
  }
}`,...p.parameters?.docs?.source}}};v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  }}>
      <Timestamp value="2026-02-19T17:00:00Z" format="date_time" type="supporting" />
      <Timestamp value="2026-02-19T17:00:00Z" format="date_time" type="body" />
      <Timestamp value="2026-02-19T17:00:00Z" format="date_time" type="large" />
      <Timestamp value="2026-02-19T17:00:00Z" format="date_time" type="label" weight="semibold" />
    </div>
}`,...v.parameters?.docs?.source}}};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  }}>
      <Timestamp value="2026-02-19T17:00:00Z" format="date_time" color="primary" />
      <Timestamp value="2026-02-19T17:00:00Z" format="date_time" color="secondary" />
      <Timestamp value="2026-02-19T17:00:00Z" format="date_time" color="disabled" />
      <Timestamp value="2026-02-19T17:00:00Z" format="date_time" color="accent" />
    </div>
}`,...u.parameters?.docs?.source}}};x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  }}>
      <div>
        <Text type="label" color="secondary">
          Recent (relative):{' '}
        </Text>
        <Timestamp value={Date.now() / 1000 - 3600} format="auto" />
      </div>
      <div>
        <Text type="label" color="secondary">
          Old (date_time):{' '}
        </Text>
        <Timestamp value="2025-01-01T12:00:00Z" format="auto" />
      </div>
    </div>
}`,...x.parameters?.docs?.source}}};y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    alignItems: 'flex-start'
  }}>
      <Timestamp value={Date.now() / 1000 + 60} format="relative" />
      <Timestamp value={Date.now() / 1000 + 3600} format="relative" />
      <Timestamp value={Date.now() / 1000 + 86400} format="relative" />
    </div>
}`,...y.parameters?.docs?.source}}};const g=["Default","RelativeFormat","DateFormat","DateTimeFormat","DateTimeWithTimezone","TimeFormat","SystemFormats","AllFormats","LiveUpdating","TextTypes","Colors","AutoFormat","FutureDates"];export{n as AllFormats,x as AutoFormat,u as Colors,l as DateFormat,i as DateTimeFormat,m as DateTimeWithTimezone,s as Default,y as FutureDates,p as LiveUpdating,o as RelativeFormat,c as SystemFormats,v as TextTypes,d as TimeFormat,g as __namedExportsOrder,j as default};
