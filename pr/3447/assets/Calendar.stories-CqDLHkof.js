import{ah as r,a1 as n}from"./iframe-j1EZkcGb.js";import{C as s}from"./Calendar-C9HGPNf-.js";import"./preload-helper-Ct5FWWRu.js";import"./plainDate-C-ANv9VG.js";const M={title:"Core/Calendar",component:s,tags:["autodocs"]},d={render:()=>{const[a,t]=r.useState(void 0);return n.jsx(s,{mode:"single",value:a,onChange:e=>t(e)})}},i={render:()=>{const[a,t]=r.useState("2026-01-15");return n.jsx(s,{mode:"single",value:a,onChange:e=>t(e),focusDate:"2026-01-01"})}},c={render:()=>{const[a,t]=r.useState(void 0);return n.jsx(s,{mode:"range",value:a,onChange:e=>t(e),focusDate:"2026-01-01"})}},g={render:()=>{const[a,t]=r.useState({start:"2026-01-10",end:"2026-01-20"});return n.jsx(s,{mode:"range",value:a,onChange:e=>t(e),focusDate:"2026-01-01"})}},m={render:()=>{const[a,t]=r.useState(void 0);return n.jsx(s,{mode:"single",numberOfMonths:2,value:a,onChange:e=>t(e),focusDate:"2026-01-01"})}},S={render:()=>{const[a,t]=r.useState(void 0);return n.jsx(s,{mode:"range",numberOfMonths:2,value:a,onChange:e=>t(e),focusDate:"2026-01-01"})}},p={render:()=>{const[a,t]=r.useState(void 0);return n.jsx(s,{mode:"single",min:"2026-01-10",max:"2026-03-20",value:a,onChange:e=>t(e),focusDate:"2026-01-01"})}},v={render:()=>{const[a,t]=r.useState(void 0);return n.jsx(s,{mode:"single",min:"2026-01-10",max:"2026-01-25",value:a,onChange:e=>t(e),focusDate:"2026-01-01"})}},h={render:()=>{const[a,t]=r.useState(void 0),e=u=>{const l=u.getDay();return l!==0&&l!==6};return n.jsx(s,{mode:"single",dateConstraints:[e],value:a,onChange:u=>t(u),focusDate:"2026-01-01"})}},f={render:()=>{const[a,t]=r.useState(void 0);return n.jsx(s,{mode:"single",hasWeekNumbers:!0,value:a,onChange:e=>t(e),focusDate:"2026-01-01"})}},D={render:()=>{const[a,t]=r.useState(void 0);return n.jsx(s,{mode:"single",weekStartsOn:1,value:a,onChange:e=>t(e),focusDate:"2026-01-01"})}},V={render:()=>{const[a,t]=r.useState(void 0),[e,u]=r.useState(void 0),[l,C]=r.useState(void 0),y=o=>{const x=o.getDay();return x!==0&&x!==6};return n.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"32px"},children:[n.jsxs("div",{children:[n.jsx("h3",{style:{marginBottom:"8px"},children:"Single Date Selection"}),n.jsx(s,{mode:"single",value:a,onChange:o=>t(o),focusDate:"2026-01-01"}),n.jsxs("p",{style:{marginTop:"8px",fontSize:"14px",color:"#666"},children:["Selected: ",a??"None"]})]}),n.jsxs("div",{children:[n.jsx("h3",{style:{marginBottom:"8px"},children:"Range Selection (Two Months)"}),n.jsx(s,{mode:"range",numberOfMonths:2,value:e,onChange:o=>u(o),focusDate:"2026-01-01"}),n.jsxs("p",{style:{marginTop:"8px",fontSize:"14px",color:"#666"},children:["Range:"," ",e?`${e.start} to ${e.end}`:"None selected"]})]}),n.jsxs("div",{children:[n.jsx("h3",{style:{marginBottom:"8px"},children:"Weekdays Only with Week Numbers"}),n.jsx(s,{mode:"single",hasWeekNumbers:!0,dateConstraints:[y],value:l,onChange:o=>C(o),focusDate:"2026-01-01"}),n.jsxs("p",{style:{marginTop:"8px",fontSize:"14px",color:"#666"},children:["Selected: ",l??"None"]})]})]})}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = useState<ISODateString | undefined>(undefined);
    return <Calendar mode="single" value={value} onChange={val => setValue(val)} />;
  }
}`,...d.parameters?.docs?.source}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = useState<ISODateString>('2026-01-15');
    return <Calendar mode="single" value={value} onChange={val => setValue(val)} focusDate="2026-01-01" />;
  }
}`,...i.parameters?.docs?.source}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = useState<DateRange | undefined>(undefined);
    return <Calendar mode="range" value={value} onChange={range => setValue(range)} focusDate="2026-01-01" />;
  }
}`,...c.parameters?.docs?.source}}};g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = useState<DateRange>({
      start: '2026-01-10',
      end: '2026-01-20'
    });
    return <Calendar mode="range" value={value} onChange={range => setValue(range)} focusDate="2026-01-01" />;
  }
}`,...g.parameters?.docs?.source}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = useState<ISODateString | undefined>(undefined);
    return <Calendar mode="single" numberOfMonths={2} value={value} onChange={val => setValue(val)} focusDate="2026-01-01" />;
  }
}`,...m.parameters?.docs?.source}}};S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = useState<DateRange | undefined>(undefined);
    return <Calendar mode="range" numberOfMonths={2} value={value} onChange={range => setValue(range)} focusDate="2026-01-01" />;
  }
}`,...S.parameters?.docs?.source}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = useState<ISODateString | undefined>(undefined);
    return <Calendar mode="single" min={'2026-01-10' as ISODateString} max={'2026-03-20' as ISODateString} value={value} onChange={val => setValue(val)} focusDate={'2026-01-01' as ISODateString} />;
  }
}`,...p.parameters?.docs?.source}}};v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = useState<ISODateString | undefined>(undefined);
    return <Calendar mode="single" min={'2026-01-10' as ISODateString} max={'2026-01-25' as ISODateString} value={value} onChange={val => setValue(val)} focusDate="2026-01-01" />;
  }
}`,...v.parameters?.docs?.source}}};h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = useState<ISODateString | undefined>(undefined);
    const isWeekday = (date: Date) => {
      const day = date.getDay();
      return day !== 0 && day !== 6;
    };
    return <Calendar mode="single" dateConstraints={[isWeekday]} value={value} onChange={val => setValue(val)} focusDate="2026-01-01" />;
  }
}`,...h.parameters?.docs?.source}}};f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = useState<ISODateString | undefined>(undefined);
    return <Calendar mode="single" hasWeekNumbers value={value} onChange={val => setValue(val)} focusDate="2026-01-01" />;
  }
}`,...f.parameters?.docs?.source}}};D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = useState<ISODateString | undefined>(undefined);
    return <Calendar mode="single" weekStartsOn={1} value={value} onChange={val => setValue(val)} focusDate="2026-01-01" />;
  }
}`,...D.parameters?.docs?.source}}};V.parameters={...V.parameters,docs:{...V.parameters?.docs,source:{originalSource:`{
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
}`,...V.parameters?.docs?.source}}};const R=["Default","WithSelectedDate","RangeSelection","RangeWithValue","TwoMonths","TwoMonthsRangeSelection","MinMaxBoundary","WithDateConstraints","WeekdaysOnly","WithWeekNumbers","MondayStart","AllVariations"];export{V as AllVariations,d as Default,p as MinMaxBoundary,D as MondayStart,c as RangeSelection,g as RangeWithValue,m as TwoMonths,S as TwoMonthsRangeSelection,h as WeekdaysOnly,v as WithDateConstraints,i as WithSelectedDate,f as WithWeekNumbers,R as __namedExportsOrder,M as default};
