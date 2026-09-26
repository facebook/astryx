import{i as e}from"./preload-helper-CT_b8DTk.js";import{t}from"./jsx-runtime-DqZldVDK.js";import{t as n}from"./Text-Dfk4z49M.js";import{t as r}from"./Text-24uEXAax.js";import{C as i,w as a}from"./iframe-CKknsxLr.js";var o,s,c,l,u,d,f,p,m,h,g,_,v,y,b,x,S,C,w,T,E,D;e((()=>{i(),r(),o=t(),s={title:`Core/Timestamp`,component:a,tags:[`autodocs`],argTypes:{format:{control:`select`,options:[`relative`,`relative_short`,`auto`,`date`,`date_long`,`date_weekday`,`date_time`,`time`,`system_date`,`system_date_time`,`system_time`],description:`Display format`},type:{control:`select`,options:[`body`,`large`,`label`,`supporting`,`code`,`display-1`,`display-2`,`display-3`],description:`Semantic text type (from Text)`},size:{control:`select`,options:[`4xs`,`3xs`,`2xs`,`xsm`,`sm`,`base`,`lg`,`xl`,`2xl`,`3xl`,`4xl`],description:`Font size override`},color:{control:`select`,options:[`primary`,`secondary`,`disabled`,`placeholder`,`accent`,`inherit`],description:`Text color`},weight:{control:`select`,options:[`normal`,`medium`,`semibold`,`bold`],description:`Font weight`},isLive:{control:`boolean`,description:`Live-update relative time`},hasTooltip:{control:`boolean`,description:`Show copyable hover card on hover`},isTimezoneShown:{control:`boolean`,description:`Append timezone abbreviation`}}},c={args:{value:`2026-03-25T12:00:00Z`}},l={render:()=>(0,o.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`8px`,alignItems:`flex-start`},children:[(0,o.jsx)(a,{value:Date.now()/1e3-5,format:`relative`}),(0,o.jsx)(a,{value:Date.now()/1e3-120,format:`relative`}),(0,o.jsx)(a,{value:Date.now()/1e3-3600,format:`relative`}),(0,o.jsx)(a,{value:Date.now()/1e3-86400,format:`relative`}),(0,o.jsx)(a,{value:Date.now()/1e3-259200,format:`relative`}),(0,o.jsx)(a,{value:Date.now()/1e3-90*86400,format:`relative`}),(0,o.jsx)(a,{value:Date.now()/1e3-730*86400,format:`relative`})]})},u={render:()=>(0,o.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`8px`,alignItems:`flex-start`},children:[(0,o.jsx)(a,{value:Date.now()/1e3-5,format:`relative_short`}),(0,o.jsx)(a,{value:Date.now()/1e3-120,format:`relative_short`}),(0,o.jsx)(a,{value:Date.now()/1e3-3600,format:`relative_short`}),(0,o.jsx)(a,{value:Date.now()/1e3-86400,format:`relative_short`}),(0,o.jsx)(a,{value:Date.now()/1e3-259200,format:`relative_short`}),(0,o.jsx)(a,{value:Date.now()/1e3-90*86400,format:`relative_short`}),(0,o.jsx)(a,{value:Date.now()/1e3-730*86400,format:`relative_short`})]})},d={args:{value:`2026-02-19T17:00:00Z`,format:`date`}},f={args:{value:`2026-02-19T17:00:00Z`,format:`date_long`}},p={args:{value:`2026-02-19T17:00:00Z`,format:`date_weekday`}},m={args:{value:`2026-02-19T17:00:00Z`,format:`date_time`}},h={args:{value:`2026-02-19T17:00:00Z`,format:`date_time`,isTimezoneShown:!0}},g={args:{value:`2026-02-19T17:00:00Z`,format:`time`}},_={name:`Hover card — configuration examples`,render:()=>(0,o.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`32px`},children:[(0,o.jsxs)(`div`,{children:[(0,o.jsx)(n,{type:`supporting`,color:`secondary`,children:`Local + UTC, default format — hover or tab to the timestamp, then copy any row`}),(0,o.jsx)(`div`,{children:(0,o.jsx)(a,{value:`2026-02-19T17:00:00Z`,format:`relative`,tooltipEntries:[{label:`Local`},{timezoneID:`UTC`,label:`UTC`}]})})]}),(0,o.jsxs)(`div`,{children:[(0,o.jsx)(n,{type:`supporting`,color:`secondary`,children:`Three labelled zones — the widest case the card holds`}),(0,o.jsx)(`div`,{children:(0,o.jsx)(a,{value:`2026-02-19T17:00:00Z`,format:`date`,tooltipEntries:[{timezoneID:`America/New_York`,format:`date_time`,label:`New York`},{timezoneID:`Europe/London`,format:`date_time`,label:`London`},{timezoneID:`Asia/Tokyo`,format:`date_time`,label:`Tokyo`}]})})]}),(0,o.jsxs)(`div`,{children:[(0,o.jsx)(n,{type:`supporting`,color:`secondary`,children:`One zone, two formats — friendly line plus a machine-precise line`}),(0,o.jsx)(`div`,{children:(0,o.jsx)(a,{value:`2026-02-19T17:00:00Z`,format:`date_time`,tooltipEntries:[{format:`full`},{format:`system_date_time`,label:`ISO`}]})})]}),(0,o.jsxs)(`div`,{children:[(0,o.jsx)(n,{type:`supporting`,color:`secondary`,children:`UTC only — an audit log that never shows local time`}),(0,o.jsx)(`div`,{children:(0,o.jsx)(a,{value:`2026-02-19T17:00:00Z`,format:`date_time`,tooltipEntries:[{timezoneID:`UTC`,label:`UTC`}]})})]})]})},v={name:`Copyable hover card`,render:()=>(0,o.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`32px`},children:[(0,o.jsxs)(`div`,{children:[(0,o.jsx)(n,{type:`supporting`,color:`secondary`,children:`Local, UTC, another zone, and Unix seconds — hover or tab, then copy any row`}),(0,o.jsx)(`div`,{children:(0,o.jsx)(a,{value:`2026-02-19T17:00:00Z`,format:`relative`,tooltipEntries:[{label:`Local`},{timezoneID:`UTC`,label:`UTC`},{timezoneID:`Asia/Tokyo`,format:`date_time`,label:`Tokyo`},{timezoneID:`UTC`,format:`system_date_time`,label:`ISO (UTC)`}]})})]}),(0,o.jsxs)(`div`,{children:[(0,o.jsx)(n,{type:`supporting`,color:`secondary`,children:`A single UTC entry — one copyable row, on an absolute format that has no hover card of its own`}),(0,o.jsx)(`div`,{children:(0,o.jsx)(a,{value:`2026-02-19T17:00:00Z`,format:`date_time`,tooltipEntries:[{timezoneID:`UTC`,label:`UTC`}]})})]})]})},y={name:`Per-entry copyable`,render:()=>(0,o.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`32px`},children:[(0,o.jsxs)(`div`,{children:[(0,o.jsx)(n,{type:`supporting`,color:`secondary`,children:`Mixed: human-readable rows are read-only; only the machine value opts into a copy button`}),(0,o.jsx)(`div`,{children:(0,o.jsx)(a,{value:`2026-02-19T17:00:00Z`,format:`relative`,tooltipEntries:[{label:`Local`},{timezoneID:`UTC`,label:`UTC`},{timezoneID:`UTC`,format:`system_date_time`,label:`ISO (UTC)`,isCopyable:!0}]})})]}),(0,o.jsxs)(`div`,{children:[(0,o.jsx)(n,{type:`supporting`,color:`secondary`,children:`Fully read-only card — no row opts in, so there is no copy button and no trailing action column`}),(0,o.jsx)(`div`,{children:(0,o.jsx)(a,{value:`2026-02-19T17:00:00Z`,format:`relative`,tooltipEntries:[{label:`Local`},{timezoneID:`UTC`,label:`UTC`}]})})]}),(0,o.jsxs)(`div`,{children:[(0,o.jsx)(n,{type:`supporting`,color:`secondary`,children:`Single read-only row with no label — the value sits flush at the leading edge`}),(0,o.jsx)(`div`,{children:(0,o.jsx)(a,{value:`2026-02-19T17:00:00Z`,format:`relative`,tooltipEntries:[{}]})})]})]})},b={render:()=>(0,o.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`8px`},children:[(0,o.jsxs)(`div`,{children:[(0,o.jsxs)(n,{type:`label`,color:`secondary`,children:[`system_date:`,` `]}),(0,o.jsx)(a,{value:`2026-02-19T17:00:00Z`,format:`system_date`,type:`code`})]}),(0,o.jsxs)(`div`,{children:[(0,o.jsxs)(n,{type:`label`,color:`secondary`,children:[`system_date_time:`,` `]}),(0,o.jsx)(a,{value:`2026-02-19T17:00:00Z`,format:`system_date_time`,type:`code`})]}),(0,o.jsxs)(`div`,{children:[(0,o.jsxs)(n,{type:`label`,color:`secondary`,children:[`system_time:`,` `]}),(0,o.jsx)(a,{value:`2026-02-19T17:00:00Z`,format:`system_time`,type:`code`})]})]})},x={render:()=>{let e=`2026-02-19T17:00:00Z`;return(0,o.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`8px`},children:[(0,o.jsxs)(`div`,{children:[(0,o.jsxs)(n,{type:`label`,color:`secondary`,children:[`relative:`,` `]}),(0,o.jsx)(a,{value:Date.now()/1e3-3600,format:`relative`})]}),(0,o.jsxs)(`div`,{children:[(0,o.jsxs)(n,{type:`label`,color:`secondary`,children:[`date:`,` `]}),(0,o.jsx)(a,{value:e,format:`date`})]}),(0,o.jsxs)(`div`,{children:[(0,o.jsxs)(n,{type:`label`,color:`secondary`,children:[`date_long:`,` `]}),(0,o.jsx)(a,{value:e,format:`date_long`})]}),(0,o.jsxs)(`div`,{children:[(0,o.jsxs)(n,{type:`label`,color:`secondary`,children:[`date_weekday:`,` `]}),(0,o.jsx)(a,{value:e,format:`date_weekday`})]}),(0,o.jsxs)(`div`,{children:[(0,o.jsxs)(n,{type:`label`,color:`secondary`,children:[`date_time:`,` `]}),(0,o.jsx)(a,{value:e,format:`date_time`})]}),(0,o.jsxs)(`div`,{children:[(0,o.jsxs)(n,{type:`label`,color:`secondary`,children:[`time:`,` `]}),(0,o.jsx)(a,{value:e,format:`time`})]}),(0,o.jsxs)(`div`,{children:[(0,o.jsxs)(n,{type:`label`,color:`secondary`,children:[`system_date:`,` `]}),(0,o.jsx)(a,{value:e,format:`system_date`,type:`code`})]}),(0,o.jsxs)(`div`,{children:[(0,o.jsxs)(n,{type:`label`,color:`secondary`,children:[`system_date_time:`,` `]}),(0,o.jsx)(a,{value:e,format:`system_date_time`,type:`code`})]}),(0,o.jsxs)(`div`,{children:[(0,o.jsxs)(n,{type:`label`,color:`secondary`,children:[`system_time:`,` `]}),(0,o.jsx)(a,{value:e,format:`system_time`,type:`code`})]})]})}},S={args:{value:Date.now()/1e3-5,format:`relative`,isLive:!0}},C={render:()=>(0,o.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`8px`},children:[(0,o.jsx)(a,{value:`2026-02-19T17:00:00Z`,format:`date_time`,type:`supporting`}),(0,o.jsx)(a,{value:`2026-02-19T17:00:00Z`,format:`date_time`,type:`body`}),(0,o.jsx)(a,{value:`2026-02-19T17:00:00Z`,format:`date_time`,type:`large`}),(0,o.jsx)(a,{value:`2026-02-19T17:00:00Z`,format:`date_time`,type:`label`,weight:`semibold`})]})},w={render:()=>(0,o.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`8px`},children:[(0,o.jsx)(a,{value:`2026-02-19T17:00:00Z`,format:`date_time`,color:`primary`}),(0,o.jsx)(a,{value:`2026-02-19T17:00:00Z`,format:`date_time`,color:`secondary`}),(0,o.jsx)(a,{value:`2026-02-19T17:00:00Z`,format:`date_time`,color:`disabled`}),(0,o.jsx)(a,{value:`2026-02-19T17:00:00Z`,format:`date_time`,color:`accent`})]})},T={render:()=>(0,o.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`8px`},children:[(0,o.jsxs)(`div`,{children:[(0,o.jsxs)(n,{type:`label`,color:`secondary`,children:[`Recent (relative):`,` `]}),(0,o.jsx)(a,{value:Date.now()/1e3-3600,format:`auto`})]}),(0,o.jsxs)(`div`,{children:[(0,o.jsxs)(n,{type:`label`,color:`secondary`,children:[`Old (date_time):`,` `]}),(0,o.jsx)(a,{value:`2025-01-01T12:00:00Z`,format:`auto`})]})]})},E={render:()=>(0,o.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`8px`,alignItems:`flex-start`},children:[(0,o.jsx)(a,{value:Date.now()/1e3+60,format:`relative`}),(0,o.jsx)(a,{value:Date.now()/1e3+3600,format:`relative`}),(0,o.jsx)(a,{value:Date.now()/1e3+86400,format:`relative`})]})},c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    value: '2026-03-25T12:00:00Z'
  }
}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
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
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    alignItems: 'flex-start'
  }}>
      <Timestamp value={Date.now() / 1000 - 5} format="relative_short" />
      <Timestamp value={Date.now() / 1000 - 120} format="relative_short" />
      <Timestamp value={Date.now() / 1000 - 3600} format="relative_short" />
      <Timestamp value={Date.now() / 1000 - 86400} format="relative_short" />
      <Timestamp value={Date.now() / 1000 - 259200} format="relative_short" />
      <Timestamp value={Date.now() / 1000 - 90 * 86400} format="relative_short" />
      <Timestamp value={Date.now() / 1000 - 730 * 86400} format="relative_short" />
    </div>
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    value: '2026-02-19T17:00:00Z',
    format: 'date'
  }
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    value: '2026-02-19T17:00:00Z',
    format: 'date_long'
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    value: '2026-02-19T17:00:00Z',
    format: 'date_weekday'
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    value: '2026-02-19T17:00:00Z',
    format: 'date_time'
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    value: '2026-02-19T17:00:00Z',
    format: 'date_time',
    isTimezoneShown: true
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    value: '2026-02-19T17:00:00Z',
    format: 'time'
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  name: 'Hover card — configuration examples',
  render: () => <div style={{
    display: 'flex',
    flexDirection: 'column',
    gap: '32px'
  }}>
      <div>
        <Text type="supporting" color="secondary">
          Local + UTC, default format — hover or tab to the timestamp, then copy
          any row
        </Text>
        <div>
          <Timestamp value="2026-02-19T17:00:00Z" format="relative" tooltipEntries={[{
          label: 'Local'
        }, {
          timezoneID: 'UTC',
          label: 'UTC'
        }]} />
        </div>
      </div>
      <div>
        <Text type="supporting" color="secondary">
          Three labelled zones — the widest case the card holds
        </Text>
        <div>
          <Timestamp value="2026-02-19T17:00:00Z" format="date" tooltipEntries={[{
          timezoneID: 'America/New_York',
          format: 'date_time',
          label: 'New York'
        }, {
          timezoneID: 'Europe/London',
          format: 'date_time',
          label: 'London'
        }, {
          timezoneID: 'Asia/Tokyo',
          format: 'date_time',
          label: 'Tokyo'
        }]} />
        </div>
      </div>
      <div>
        <Text type="supporting" color="secondary">
          One zone, two formats — friendly line plus a machine-precise line
        </Text>
        <div>
          <Timestamp value="2026-02-19T17:00:00Z" format="date_time" tooltipEntries={[{
          format: 'full'
        }, {
          format: 'system_date_time',
          label: 'ISO'
        }]} />
        </div>
      </div>
      <div>
        <Text type="supporting" color="secondary">
          UTC only — an audit log that never shows local time
        </Text>
        <div>
          <Timestamp value="2026-02-19T17:00:00Z" format="date_time" tooltipEntries={[{
          timezoneID: 'UTC',
          label: 'UTC'
        }]} />
        </div>
      </div>
    </div>
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  name: 'Copyable hover card',
  render: () => <div style={{
    display: 'flex',
    flexDirection: 'column',
    gap: '32px'
  }}>
      <div>
        <Text type="supporting" color="secondary">
          Local, UTC, another zone, and Unix seconds — hover or tab, then copy
          any row
        </Text>
        <div>
          <Timestamp value="2026-02-19T17:00:00Z" format="relative" tooltipEntries={[{
          label: 'Local'
        }, {
          timezoneID: 'UTC',
          label: 'UTC'
        }, {
          timezoneID: 'Asia/Tokyo',
          format: 'date_time',
          label: 'Tokyo'
        }, {
          timezoneID: 'UTC',
          format: 'system_date_time',
          label: 'ISO (UTC)'
        }]} />
        </div>
      </div>
      <div>
        <Text type="supporting" color="secondary">
          A single UTC entry — one copyable row, on an absolute format that has
          no hover card of its own
        </Text>
        <div>
          <Timestamp value="2026-02-19T17:00:00Z" format="date_time" tooltipEntries={[{
          timezoneID: 'UTC',
          label: 'UTC'
        }]} />
        </div>
      </div>
    </div>
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  name: 'Per-entry copyable',
  render: () => <div style={{
    display: 'flex',
    flexDirection: 'column',
    gap: '32px'
  }}>
      <div>
        <Text type="supporting" color="secondary">
          Mixed: human-readable rows are read-only; only the machine value opts
          into a copy button
        </Text>
        <div>
          <Timestamp value="2026-02-19T17:00:00Z" format="relative" tooltipEntries={[{
          label: 'Local'
        }, {
          timezoneID: 'UTC',
          label: 'UTC'
        }, {
          timezoneID: 'UTC',
          format: 'system_date_time',
          label: 'ISO (UTC)',
          isCopyable: true
        }]} />
        </div>
      </div>
      <div>
        <Text type="supporting" color="secondary">
          Fully read-only card — no row opts in, so there is no copy button and
          no trailing action column
        </Text>
        <div>
          <Timestamp value="2026-02-19T17:00:00Z" format="relative" tooltipEntries={[{
          label: 'Local'
        }, {
          timezoneID: 'UTC',
          label: 'UTC'
        }]} />
        </div>
      </div>
      <div>
        <Text type="supporting" color="secondary">
          Single read-only row with no label — the value sits flush at the
          leading edge
        </Text>
        <div>
          <Timestamp value="2026-02-19T17:00:00Z" format="relative" tooltipEntries={[{}]} />
        </div>
      </div>
    </div>
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
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
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
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
            date_long:{' '}
          </Text>
          <Timestamp value={date} format="date_long" />
        </div>
        <div>
          <Text type="label" color="secondary">
            date_weekday:{' '}
          </Text>
          <Timestamp value={date} format="date_weekday" />
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
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  args: {
    value: Date.now() / 1000 - 5,
    format: 'relative',
    isLive: true
  }
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
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
}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
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
}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
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
}`,...T.parameters?.docs?.source}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
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
}`,...E.parameters?.docs?.source}}},D=[`Default`,`RelativeFormat`,`RelativeShortFormat`,`DateFormat`,`DateLongFormat`,`DateWeekdayFormat`,`DateTimeFormat`,`DateTimeWithTimezone`,`TimeFormat`,`TooltipTimezones`,`CopyableHoverCard`,`PerEntryCopyable`,`SystemFormats`,`AllFormats`,`LiveUpdating`,`TextTypes`,`Colors`,`AutoFormat`,`FutureDates`]}))();export{x as AllFormats,T as AutoFormat,w as Colors,v as CopyableHoverCard,d as DateFormat,f as DateLongFormat,m as DateTimeFormat,h as DateTimeWithTimezone,p as DateWeekdayFormat,c as Default,E as FutureDates,S as LiveUpdating,y as PerEntryCopyable,l as RelativeFormat,u as RelativeShortFormat,b as SystemFormats,C as TextTypes,g as TimeFormat,_ as TooltipTimezones,D as __namedExportsOrder,s as default};