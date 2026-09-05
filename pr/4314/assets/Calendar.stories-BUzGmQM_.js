import{i as e,s as t}from"./preload-helper-CT_b8DTk.js";import{t as n}from"./react-B7Te67-h.js";import{t as r}from"./jsx-runtime-DqZldVDK.js";import{s as i}from"./useTheme-BX5QgeVS.js";import{t as a,x as o}from"./theme-CCNdbTry.js";import{n as s,t as c}from"./Calendar-HVT_2LgM.js";var l,u,d,f,p,m,h,g,_,v,y,b,x,S,C,w,T,E,D,O,k,A,j,M,N,P;e((()=>{l=t(n()),c(),a(),u=r(),d={title:`Core/Calendar`,component:s,tags:[`autodocs`]},f={render:()=>{let[e,t]=(0,l.useState)(void 0);return(0,u.jsx)(s,{mode:`single`,value:e,onChange:e=>t(e)})}},p={render:()=>{let[e,t]=(0,l.useState)(`2026-01-15`);return(0,u.jsx)(s,{mode:`single`,value:e,onChange:e=>t(e),focusDate:`2026-01-01`})}},m={render:()=>{let[e,t]=(0,l.useState)(void 0);return(0,u.jsx)(s,{mode:`range`,value:e,onChange:e=>t(e),focusDate:`2026-01-01`})}},h={render:()=>{let[e,t]=(0,l.useState)({start:`2026-01-10`,end:`2026-01-20`});return(0,u.jsx)(s,{mode:`range`,value:e,onChange:e=>t(e),focusDate:`2026-01-01`})}},g={render:()=>{let[e,t]=(0,l.useState)(void 0);return(0,u.jsx)(s,{mode:`range`,value:e,onChange:e=>t(e),focusDate:`2026-01-01`,maxRangeSpan:7})}},_={render:()=>{let[e,t]=(0,l.useState)(void 0);return(0,u.jsx)(s,{mode:`range`,value:e,onChange:e=>t(e),focusDate:`2026-01-01`,minRangeSpan:2,maxRangeSpan:14})}},v={render:()=>{let[e,t]=(0,l.useState)(void 0);return(0,u.jsx)(s,{mode:`single`,numberOfMonths:2,value:e,onChange:e=>t(e),focusDate:`2026-01-01`})}},y={render:()=>{let[e,t]=(0,l.useState)(void 0);return(0,u.jsx)(s,{mode:`range`,numberOfMonths:2,value:e,onChange:e=>t(e),focusDate:`2026-01-01`})}},b={render:()=>{let[e,t]=(0,l.useState)(void 0);return(0,u.jsx)(`div`,{style:{width:320},children:(0,u.jsx)(s,{mode:`single`,numberOfMonths:2,value:e,onChange:e=>t(e),focusDate:`2026-01-01`})})}},x={render:()=>{let[e,t]=(0,l.useState)(void 0);return(0,u.jsx)(s,{mode:`single`,min:`2026-01-10`,max:`2026-03-20`,value:e,onChange:e=>t(e),focusDate:`2026-01-01`})}},S={name:`Min/max window away from today`,render:()=>{let[e,t]=(0,l.useState)(void 0),[n,r]=(0,l.useState)(void 0),i=new Date().getFullYear();return(0,u.jsxs)(`div`,{style:{display:`flex`,gap:24,flexWrap:`wrap`},children:[(0,u.jsx)(s,{mode:`single`,min:`${i-3}-02-03`,max:`${i-3}-05-19`,value:e,onChange:e=>t(e)}),(0,u.jsx)(s,{mode:`single`,min:`${i+3}-08-11`,max:`${i+3}-11-24`,value:n,onChange:e=>r(e)})]})}},C={render:()=>{let[e,t]=(0,l.useState)(void 0);return(0,u.jsx)(s,{mode:`single`,min:`2026-01-10`,max:`2026-01-25`,value:e,onChange:e=>t(e),focusDate:`2026-01-01`})}},w={render:()=>{let[e,t]=(0,l.useState)(void 0);return(0,u.jsx)(s,{mode:`single`,dateConstraints:[e=>{let t=e.getDay();return t!==0&&t!==6}],value:e,onChange:e=>t(e),focusDate:`2026-01-01`})}},T={render:()=>{let[e,t]=(0,l.useState)(void 0);return(0,u.jsx)(s,{mode:`single`,hasWeekNumbers:!0,value:e,onChange:e=>t(e),focusDate:`2026-01-01`})}},E={render:()=>{let[e,t]=(0,l.useState)(void 0);return(0,u.jsx)(s,{mode:`single`,weekStartsOn:1,value:e,onChange:e=>t(e),focusDate:`2026-01-01`})}},D={render:()=>{let[e,t]=(0,l.useState)(void 0);return(0,u.jsx)(`div`,{dir:`rtl`,children:(0,u.jsx)(s,{mode:`single`,value:e,onChange:e=>t(e),focusDate:`2026-01-01`})})},parameters:{docs:{description:{story:`Under dir="rtl" the header flips: "Previous month" sits on the visual right with its chevron mirrored to point right (outward), "Next month" on the visual left pointing left (#3388).`}}}},O={render:()=>{let[e,t]=(0,l.useState)({start:`2026-01-10`,end:`2026-01-20`});return(0,u.jsx)(`div`,{dir:`rtl`,children:(0,u.jsx)(s,{mode:`range`,value:e,onChange:e=>t(e),focusDate:`2026-01-01`})})},parameters:{docs:{description:{story:`A committed range under dir="rtl". The range-fill pill uses logical CSS, so its rounded caps follow the reading direction: the start of the range (earliest date) rounds on the inline-start edge and the end (latest date) on the inline-end edge, mirrored from LTR.`}}}},k={render:()=>{let[e,t]=(0,l.useState)(void 0),[n,r]=(0,l.useState)(void 0),[i,a]=(0,l.useState)(void 0);return(0,u.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`32px`},children:[(0,u.jsxs)(`div`,{children:[(0,u.jsx)(`h3`,{style:{marginBottom:`8px`},children:`Single Date Selection`}),(0,u.jsx)(s,{mode:`single`,value:e,onChange:e=>t(e),focusDate:`2026-01-01`}),(0,u.jsxs)(`p`,{style:{marginTop:`8px`,fontSize:`14px`,color:`var(--color-text-secondary)`},children:[`Selected: `,e??`None`]})]}),(0,u.jsxs)(`div`,{children:[(0,u.jsx)(`h3`,{style:{marginBottom:`8px`},children:`Range Selection (Two Months)`}),(0,u.jsx)(s,{mode:`range`,numberOfMonths:2,value:n,onChange:e=>r(e),focusDate:`2026-01-01`}),(0,u.jsxs)(`p`,{style:{marginTop:`8px`,fontSize:`14px`,color:`var(--color-text-secondary)`},children:[`Range:`,` `,n?`${n.start} to ${n.end}`:`None selected`]})]}),(0,u.jsxs)(`div`,{children:[(0,u.jsx)(`h3`,{style:{marginBottom:`8px`},children:`Weekdays Only with Week Numbers`}),(0,u.jsx)(s,{mode:`single`,hasWeekNumbers:!0,dateConstraints:[e=>{let t=e.getDay();return t!==0&&t!==6}],value:i,onChange:e=>a(e),focusDate:`2026-01-01`}),(0,u.jsxs)(`p`,{style:{marginTop:`8px`,fontSize:`14px`,color:`var(--color-text-secondary)`},children:[`Selected: `,i??`None`]})]})]})}},A=i({name:`calendar-marker-demo`,components:{"calendar-day":{selected:{backgroundColor:`var(--color-success)`},"marker:today-only":{boxShadow:`inset 0 0 0 2px var(--color-accent)`},"marker:today-in-range":{boxShadow:`inset 0 0 0 2px var(--color-warning)`}}}}),j={render:()=>{let[e,t]=(0,l.useState)(void 0);return(0,u.jsx)(o,{theme:A,mode:`light`,children:(0,u.jsx)(s,{mode:`range`,value:e,onChange:e=>t(e)})})}},M=i({name:`calendar-nav-ring`,components:{"calendar-nav":{base:{color:`var(--color-accent)`,borderRadius:`var(--radius-inner)`},"nav:next":{backgroundColor:`var(--color-accent-muted)`}},"calendar-day":{selected:{backgroundColor:`var(--color-success)`,boxShadow:`inset 0 0 0 2px var(--color-on-accent)`}}}}),N={render:()=>{let[e,t]=(0,l.useState)(`2026-01-15`);return(0,u.jsx)(o,{theme:M,mode:`light`,children:(0,u.jsx)(s,{mode:`single`,value:e,onChange:e=>t(e),focusDate:`2026-01-01`})})}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = useState<ISODateString | undefined>(undefined);
    return <Calendar mode="single" value={value} onChange={val => setValue(val)} />;
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = useState<ISODateString>('2026-01-15');
    return <Calendar mode="single" value={value} onChange={val => setValue(val)} focusDate="2026-01-01" />;
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = useState<DateRange | undefined>(undefined);
    return <Calendar mode="range" value={value} onChange={range => setValue(range)} focusDate="2026-01-01" />;
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = useState<DateRange>({
      start: '2026-01-10',
      end: '2026-01-20'
    });
    return <Calendar mode="range" value={value} onChange={range => setValue(range)} focusDate="2026-01-01" />;
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = useState<DateRange | undefined>(undefined);
    return <Calendar mode="range" value={value} onChange={range => setValue(range)} focusDate="2026-01-01" maxRangeSpan={7} />;
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = useState<DateRange | undefined>(undefined);
    return <Calendar mode="range" value={value} onChange={range => setValue(range)} focusDate="2026-01-01" minRangeSpan={2} maxRangeSpan={14} />;
  }
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = useState<ISODateString | undefined>(undefined);
    return <Calendar mode="single" numberOfMonths={2} value={value} onChange={val => setValue(val)} focusDate="2026-01-01" />;
  }
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = useState<DateRange | undefined>(undefined);
    return <Calendar mode="range" numberOfMonths={2} value={value} onChange={range => setValue(range)} focusDate="2026-01-01" />;
  }
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = useState<ISODateString | undefined>(undefined);
    return <div style={{
      width: 320
    }}>
        <Calendar mode="single" numberOfMonths={2} value={value} onChange={val => setValue(val)} focusDate="2026-01-01" />
      </div>;
  }
}`,...b.parameters?.docs?.source},description:{story:`The two-month layout inside a container narrower than the two months need.
The second month wraps below the first instead of overflowing, so a 320px
viewport does not scroll sideways and the next-month button stays on screen.`,...b.parameters?.docs?.description}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = useState<ISODateString | undefined>(undefined);
    return <Calendar mode="single" min={'2026-01-10' as ISODateString} max={'2026-03-20' as ISODateString} value={value} onChange={val => setValue(val)} focusDate={'2026-01-01' as ISODateString} />;
  }
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  name: 'Min/max window away from today',
  render: () => {
    const [past, setPast] = useState<ISODateString | undefined>(undefined);
    const [future, setFuture] = useState<ISODateString | undefined>(undefined);
    // Windows three years either side of today, so neither contains today.
    const year = new Date().getFullYear();
    return <div style={{
      display: 'flex',
      gap: 24,
      flexWrap: 'wrap'
    }}>
        <Calendar mode="single" min={\`\${year - 3}-02-03\` as ISODateString} max={\`\${year - 3}-05-19\` as ISODateString} value={past} onChange={val => setPast(val)} />
        <Calendar mode="single" min={\`\${year + 3}-08-11\` as ISODateString} max={\`\${year + 3}-11-24\` as ISODateString} value={future} onChange={val => setFuture(val)} />
      </div>;
  }
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = useState<ISODateString | undefined>(undefined);
    return <Calendar mode="single" min={'2026-01-10' as ISODateString} max={'2026-01-25' as ISODateString} value={value} onChange={val => setValue(val)} focusDate="2026-01-01" />;
  }
}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = useState<ISODateString | undefined>(undefined);
    const isWeekday = (date: Date) => {
      const day = date.getDay();
      return day !== 0 && day !== 6;
    };
    return <Calendar mode="single" dateConstraints={[isWeekday]} value={value} onChange={val => setValue(val)} focusDate="2026-01-01" />;
  }
}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = useState<ISODateString | undefined>(undefined);
    return <Calendar mode="single" hasWeekNumbers value={value} onChange={val => setValue(val)} focusDate="2026-01-01" />;
  }
}`,...T.parameters?.docs?.source}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = useState<ISODateString | undefined>(undefined);
    return <Calendar mode="single" weekStartsOn={1} value={value} onChange={val => setValue(val)} focusDate="2026-01-01" />;
  }
}`,...E.parameters?.docs?.source}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
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
}`,...D.parameters?.docs?.source}}},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = useState<DateRange>({
      start: '2026-01-10',
      end: '2026-01-20'
    });
    return <div dir="rtl">
        <Calendar mode="range" value={value} onChange={range => setValue(range)} focusDate="2026-01-01" />
      </div>;
  },
  parameters: {
    docs: {
      description: {
        story: 'A committed range under dir="rtl". The range-fill pill uses logical CSS, so its rounded caps follow the reading direction: the start of the range (earliest date) rounds on the inline-start edge and the end (latest date) on the inline-end edge, mirrored from LTR.'
      }
    }
  }
}`,...O.parameters?.docs?.source}}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
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
          color: 'var(--color-text-secondary)'
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
          color: 'var(--color-text-secondary)'
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
          color: 'var(--color-text-secondary)'
        }}>
            Selected: {constrainedValue ?? 'None'}
          </p>
        </div>
      </div>;
  }
}`,...k.parameters?.docs?.source}}},j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = useState<DateRange | undefined>(undefined);
    return <Theme theme={markerTheme} mode="light">
        <Calendar mode="range" value={value} onChange={range => setValue(range)} />
      </Theme>;
  }
}`,...j.parameters?.docs?.source}}},N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = useState<ISODateString>('2026-01-15');
    return <Theme theme={navRingTheme} mode="light">
        <Calendar mode="single" value={value} onChange={val => setValue(val)} focusDate="2026-01-01" />
      </Theme>;
  }
}`,...N.parameters?.docs?.source}}},P=[`Default`,`WithSelectedDate`,`RangeSelection`,`RangeWithValue`,`RangeWithMaxSpan`,`RangeWithSpanBounds`,`TwoMonths`,`TwoMonthsRangeSelection`,`TwoMonthsNarrowContainer`,`MinMaxBoundary`,`WindowAwayFromToday`,`WithDateConstraints`,`WeekdaysOnly`,`WithWeekNumbers`,`MondayStart`,`RTL`,`RTLRange`,`AllVariations`,`ThemedSelectedAndTodayRing`,`ThemedNavAndSelectedRing`]}))();export{k as AllVariations,f as Default,x as MinMaxBoundary,E as MondayStart,D as RTL,O as RTLRange,m as RangeSelection,g as RangeWithMaxSpan,_ as RangeWithSpanBounds,h as RangeWithValue,N as ThemedNavAndSelectedRing,j as ThemedSelectedAndTodayRing,v as TwoMonths,b as TwoMonthsNarrowContainer,y as TwoMonthsRangeSelection,w as WeekdaysOnly,S as WindowAwayFromToday,C as WithDateConstraints,p as WithSelectedDate,T as WithWeekNumbers,P as __namedExportsOrder,d as default};