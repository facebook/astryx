import{i as e,s as t}from"./preload-helper-CT_b8DTk.js";import{t as n}from"./react-B7Te67-h.js";import{t as r}from"./jsx-runtime-DqZldVDK.js";import{n as i,t as a}from"./Calendar-Dt48JIeF.js";var o,s,c,l,u,d,f,p,m,h,g,_,v,y,b,x,S;e((()=>{o=t(n()),a(),s=r(),c={title:`Core/Calendar`,component:i,tags:[`autodocs`]},l={render:()=>{let[e,t]=(0,o.useState)(void 0);return(0,s.jsx)(i,{mode:`single`,value:e,onChange:e=>t(e)})}},u={render:()=>{let[e,t]=(0,o.useState)(`2026-01-15`);return(0,s.jsx)(i,{mode:`single`,value:e,onChange:e=>t(e),focusDate:`2026-01-01`})}},d={render:()=>{let[e,t]=(0,o.useState)(void 0);return(0,s.jsx)(i,{mode:`range`,value:e,onChange:e=>t(e),focusDate:`2026-01-01`})}},f={render:()=>{let[e,t]=(0,o.useState)({start:`2026-01-10`,end:`2026-01-20`});return(0,s.jsx)(i,{mode:`range`,value:e,onChange:e=>t(e),focusDate:`2026-01-01`})}},p={render:()=>{let[e,t]=(0,o.useState)(void 0);return(0,s.jsx)(i,{mode:`single`,numberOfMonths:2,value:e,onChange:e=>t(e),focusDate:`2026-01-01`})}},m={render:()=>{let[e,t]=(0,o.useState)(void 0);return(0,s.jsx)(i,{mode:`range`,numberOfMonths:2,value:e,onChange:e=>t(e),focusDate:`2026-01-01`})}},h={render:()=>{let[e,t]=(0,o.useState)(void 0);return(0,s.jsx)(i,{mode:`single`,min:`2026-01-10`,max:`2026-03-20`,value:e,onChange:e=>t(e),focusDate:`2026-01-01`})}},g={render:()=>{let[e,t]=(0,o.useState)(void 0);return(0,s.jsx)(i,{mode:`single`,min:`2026-01-10`,max:`2026-01-25`,value:e,onChange:e=>t(e),focusDate:`2026-01-01`})}},_={render:()=>{let[e,t]=(0,o.useState)(void 0);return(0,s.jsx)(i,{mode:`single`,dateConstraints:[e=>{let t=e.getDay();return t!==0&&t!==6}],value:e,onChange:e=>t(e),focusDate:`2026-01-01`})}},v={render:()=>{let[e,t]=(0,o.useState)(void 0);return(0,s.jsx)(i,{mode:`single`,hasWeekNumbers:!0,value:e,onChange:e=>t(e),focusDate:`2026-01-01`})}},y={render:()=>{let[e,t]=(0,o.useState)(void 0);return(0,s.jsx)(i,{mode:`single`,weekStartsOn:1,value:e,onChange:e=>t(e),focusDate:`2026-01-01`})}},b={render:()=>{let[e,t]=(0,o.useState)(void 0);return(0,s.jsx)(`div`,{dir:`rtl`,children:(0,s.jsx)(i,{mode:`single`,value:e,onChange:e=>t(e),focusDate:`2026-01-01`})})},parameters:{docs:{description:{story:`Under dir="rtl" the header flips: "Previous month" sits on the visual right with its chevron mirrored to point right (outward), "Next month" on the visual left pointing left (#3388).`}}}},x={render:()=>{let[e,t]=(0,o.useState)(void 0),[n,r]=(0,o.useState)(void 0),[a,c]=(0,o.useState)(void 0);return(0,s.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`32px`},children:[(0,s.jsxs)(`div`,{children:[(0,s.jsx)(`h3`,{style:{marginBottom:`8px`},children:`Single Date Selection`}),(0,s.jsx)(i,{mode:`single`,value:e,onChange:e=>t(e),focusDate:`2026-01-01`}),(0,s.jsxs)(`p`,{style:{marginTop:`8px`,fontSize:`14px`,color:`#666`},children:[`Selected: `,e??`None`]})]}),(0,s.jsxs)(`div`,{children:[(0,s.jsx)(`h3`,{style:{marginBottom:`8px`},children:`Range Selection (Two Months)`}),(0,s.jsx)(i,{mode:`range`,numberOfMonths:2,value:n,onChange:e=>r(e),focusDate:`2026-01-01`}),(0,s.jsxs)(`p`,{style:{marginTop:`8px`,fontSize:`14px`,color:`#666`},children:[`Range:`,` `,n?`${n.start} to ${n.end}`:`None selected`]})]}),(0,s.jsxs)(`div`,{children:[(0,s.jsx)(`h3`,{style:{marginBottom:`8px`},children:`Weekdays Only with Week Numbers`}),(0,s.jsx)(i,{mode:`single`,hasWeekNumbers:!0,dateConstraints:[e=>{let t=e.getDay();return t!==0&&t!==6}],value:a,onChange:e=>c(e),focusDate:`2026-01-01`}),(0,s.jsxs)(`p`,{style:{marginTop:`8px`,fontSize:`14px`,color:`#666`},children:[`Selected: `,a??`None`]})]})]})}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = useState<ISODateString | undefined>(undefined);
    return <Calendar mode="single" value={value} onChange={val => setValue(val)} />;
  }
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = useState<ISODateString>('2026-01-15');
    return <Calendar mode="single" value={value} onChange={val => setValue(val)} focusDate="2026-01-01" />;
  }
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = useState<DateRange | undefined>(undefined);
    return <Calendar mode="range" value={value} onChange={range => setValue(range)} focusDate="2026-01-01" />;
  }
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = useState<DateRange>({
      start: '2026-01-10',
      end: '2026-01-20'
    });
    return <Calendar mode="range" value={value} onChange={range => setValue(range)} focusDate="2026-01-01" />;
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = useState<ISODateString | undefined>(undefined);
    return <Calendar mode="single" numberOfMonths={2} value={value} onChange={val => setValue(val)} focusDate="2026-01-01" />;
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = useState<DateRange | undefined>(undefined);
    return <Calendar mode="range" numberOfMonths={2} value={value} onChange={range => setValue(range)} focusDate="2026-01-01" />;
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = useState<ISODateString | undefined>(undefined);
    return <Calendar mode="single" min={'2026-01-10' as ISODateString} max={'2026-03-20' as ISODateString} value={value} onChange={val => setValue(val)} focusDate={'2026-01-01' as ISODateString} />;
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = useState<ISODateString | undefined>(undefined);
    return <Calendar mode="single" min={'2026-01-10' as ISODateString} max={'2026-01-25' as ISODateString} value={value} onChange={val => setValue(val)} focusDate="2026-01-01" />;
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = useState<ISODateString | undefined>(undefined);
    const isWeekday = (date: Date) => {
      const day = date.getDay();
      return day !== 0 && day !== 6;
    };
    return <Calendar mode="single" dateConstraints={[isWeekday]} value={value} onChange={val => setValue(val)} focusDate="2026-01-01" />;
  }
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = useState<ISODateString | undefined>(undefined);
    return <Calendar mode="single" hasWeekNumbers value={value} onChange={val => setValue(val)} focusDate="2026-01-01" />;
  }
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = useState<ISODateString | undefined>(undefined);
    return <Calendar mode="single" weekStartsOn={1} value={value} onChange={val => setValue(val)} focusDate="2026-01-01" />;
  }
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = useState<ISODateString | undefined>(undefined);
    return <div dir="rtl">
        <Calendar mode="single" value={value} onChange={val => setValue(val)} focusDate="2026-01-01" />
      </div>;
  },
  parameters: {
    docs: {
      description: {
        story: 'Under dir="rtl" the header flips: "Previous month" sits on the visual right with its chevron mirrored to point right (outward), "Next month" on the visual left pointing left (#3388).'
      }
    }
  }
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [singleValue, setSingleValue] = useState<ISODateString | undefined>(undefined);
    const [rangeValue, setRangeValue] = useState<DateRange | undefined>(undefined);
    const [constrainedValue, setConstrainedValue] = useState<ISODateString | undefined>(undefined);
    const isWeekday = (date: Date) => {
      const day = date.getDay();
      return day !== 0 && day !== 6;
    };
    return <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '32px'
    }}>
        <div>
          <h3 style={{
          marginBottom: '8px'
        }}>Single Date Selection</h3>
          <Calendar mode="single" value={singleValue} onChange={val => setSingleValue(val)} focusDate="2026-01-01" />
          <p style={{
          marginTop: '8px',
          fontSize: '14px',
          color: '#666'
        }}>
            Selected: {singleValue ?? 'None'}
          </p>
        </div>

        <div>
          <h3 style={{
          marginBottom: '8px'
        }}>Range Selection (Two Months)</h3>
          <Calendar mode="range" numberOfMonths={2} value={rangeValue} onChange={range => setRangeValue(range)} focusDate="2026-01-01" />
          <p style={{
          marginTop: '8px',
          fontSize: '14px',
          color: '#666'
        }}>
            Range:{' '}
            {rangeValue ? \`\${rangeValue.start} to \${rangeValue.end}\` : 'None selected'}
          </p>
        </div>

        <div>
          <h3 style={{
          marginBottom: '8px'
        }}>Weekdays Only with Week Numbers</h3>
          <Calendar mode="single" hasWeekNumbers dateConstraints={[isWeekday]} value={constrainedValue} onChange={val => setConstrainedValue(val)} focusDate="2026-01-01" />
          <p style={{
          marginTop: '8px',
          fontSize: '14px',
          color: '#666'
        }}>
            Selected: {constrainedValue ?? 'None'}
          </p>
        </div>
      </div>;
  }
}`,...x.parameters?.docs?.source}}},S=[`Default`,`WithSelectedDate`,`RangeSelection`,`RangeWithValue`,`TwoMonths`,`TwoMonthsRangeSelection`,`MinMaxBoundary`,`WithDateConstraints`,`WeekdaysOnly`,`WithWeekNumbers`,`MondayStart`,`RTL`,`AllVariations`]}))();export{x as AllVariations,l as Default,h as MinMaxBoundary,y as MondayStart,b as RTL,d as RangeSelection,f as RangeWithValue,p as TwoMonths,m as TwoMonthsRangeSelection,_ as WeekdaysOnly,g as WithDateConstraints,u as WithSelectedDate,v as WithWeekNumbers,S as __namedExportsOrder,c as default};