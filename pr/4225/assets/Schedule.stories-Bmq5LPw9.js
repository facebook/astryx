import{i as e,s as t}from"./preload-helper-CT_b8DTk.js";import{t as n}from"./react-B7Te67-h.js";import{t as r}from"./jsx-runtime-DqZldVDK.js";import{an as i,dn as a,gn as o,ln as s,mn as c,rn as l,sn as u,t as d,tn as f}from"./src-BT5LaKNd.js";function p(e,t){let n=new Date(e);return n.setDate(n.getDate()+t),n}function m(e){let t=new Date(e);return t.setHours(12,0,0,0),t.setDate(t.getDate()-t.getDay()),t}function h(e){return`${e.getFullYear()}-${String(e.getMonth()+1).padStart(2,`0`)}-${String(e.getDate()).padStart(2,`0`)}`}function g(e,t,n=0){let r=new Date(e);return r.setHours(t,n,0,0),r.toISOString()}function _(e){let t=e;return()=>(t=(t*1664525+1013904223)%4294967296,t/4294967296)}function v(e,t){let n=_(Math.floor(e/864e5)),r=w.slice(0,6),i=[`Planning sync`,`Design critique`,`Customer review`,`Metrics readout`,`Launch check`,`Office hours`],a=[];for(let o=e;o<t;o+=1440*60*1e3){let e=1+Math.floor(n()*3),t=new Date(o);for(let c=0;c<e;c++){let e=8+Math.floor(n()*8),l=n()>.65?30:0,u=1+Math.floor(n()*2),d=i[Math.floor(n()*i.length)],f=r[Math.floor(n()*r.length)];a.push(s({id:`${o}:${c}`,title:d,category:f.label,start:g(t,e,l),end:g(t,e+u,l)}))}n()>.68&&a.push(s({id:`${o}:all-day`,title:`Focus day`,category:r[Math.floor(n()*r.length)].label,start:h(t),end:h(t)}))}return a}var y,b,x,S,C,w,T,E,D,O,k,A,j,M,N,P;e((()=>{y=t(n()),d(),b=r(),x=new Date,S=x.getTime(),C=m(x),w=[{label:`Company`,color:`blue`},{label:`Design`,color:`purple`},{label:`Launch`,color:`green`},{label:`Focus`,color:`teal`},{label:`Holiday`,color:`yellow`},{label:`Retro`,color:`orange`},{label:`Incident`,color:`red`},{label:`Migration`,color:`pink`}],T=[s({id:`all-hands`,title:`Company all hands`,category:`Company`,start:g(x,9),end:g(x,10)}),s({id:`all-hands-previous-day`,title:`Company all hands`,category:`Company`,start:g(p(x,-1),9),end:g(p(x,-1),10)}),s({id:`all-hands-next-day`,title:`Company all hands`,category:`Company`,start:g(p(x,1),9),end:g(p(x,1),10)}),s({id:`design-review`,title:`Design review`,category:`Design`,start:g(x,11),end:g(x,12,30)}),s({id:`launch`,title:`Launch window`,category:`Launch`,start:h(p(C,3)),end:h(p(C,4))}),s({id:`focus-day`,title:`Focus day`,category:`Focus`,start:h(x),end:h(x)}),s({id:`company-holiday`,title:`Company holiday`,category:`Holiday`,start:h(p(C,6)),end:h(p(C,6))}),s({id:`retro`,title:`Weekly retro`,category:`Retro`,start:g(p(C,5),14),end:g(p(C,5),15)}),s({id:`incident`,title:`Incident review`,category:`Incident`,start:g(p(C,1),10,30),end:g(p(C,1),11,30)}),s({id:`overnight-migration`,title:`Overnight migration`,category:`Migration`,start:g(p(C,5),23,30),end:g(p(C,6),2)})],E={title:`Lab/Schedule`,component:a,tags:[`autodocs`],parameters:{layout:`fullscreen`},decorators:[e=>(0,b.jsx)(`div`,{style:{padding:24,minHeight:`100vh`},children:(0,b.jsx)(e,{})})]},D={render:()=>{let[e,t]=(0,y.useState)(S);return(0,b.jsx)(a,{view:(0,y.useMemo)(()=>u(),[]),events:T,categories:w,date:e,focusDate:S,onChangeDate:t,timezoneID:`America/Los_Angeles`})}},O={render:()=>{let[e,t]=(0,y.useState)(S);return(0,b.jsx)(a,{view:(0,y.useMemo)(()=>i({minHour:7,maxHour:19}),[]),events:T,categories:w,date:e,onChangeDate:t,timezoneID:`America/Los_Angeles`})}},k={render:()=>{let[e,t]=(0,y.useState)(S);return(0,b.jsx)(`div`,{style:{height:520},children:(0,b.jsx)(a,{view:(0,y.useMemo)(()=>i({minHour:7,maxHour:19}),[]),events:T,categories:w,date:e,onChangeDate:t,timezoneID:`America/Los_Angeles`,style:{height:`100%`}})})}},A={render:()=>{let[e,t]=(0,y.useState)(S);return(0,b.jsx)(a,{view:(0,y.useMemo)(()=>l(),[]),events:T,categories:w,date:e,focusDate:S,onChangeDate:t,timezoneID:`America/Los_Angeles`})}},j={render:()=>{let[e,t]=(0,y.useState)(S);return(0,b.jsx)(a,{view:(0,y.useMemo)(()=>f(),[]),events:T,categories:w,date:e,focusDate:S,onChangeDate:t,timezoneID:`America/Los_Angeles`})}},M={render:()=>{let[e,t]=(0,y.useState)(S),n=(0,y.useMemo)(()=>i({minHour:7,maxHour:19}),[]);return(0,b.jsx)(a,{view:n,events:async(e,t)=>(await new Promise(e=>setTimeout(e,300)),v(e,t)),categories:w,date:e,focusDate:S,onChangeDate:t,timezoneID:`America/Los_Angeles`})}},N={render:()=>{let e=(0,y.useMemo)(()=>({month:u(),week:i({minHour:7,maxHour:19}),day:l({minHour:8,maxHour:18}),list:f()}),[]),[t,n]=(0,y.useState)(()=>e.week),[r,s]=(0,y.useState)(S),d=(0,y.useMemo)(()=>[{view:e.month,label:`Month`},{view:e.week,label:`Week`},{view:e.day,label:`Day`},{view:e.list,label:`List`}],[e]),p=o(),m=c(d,{onChangeView:n}),h=(0,y.useMemo)(()=>[p,m],[p,m]);return(0,b.jsx)(a,{view:t,events:T,categories:w,date:r,focusDate:S,onChangeDate:s,timezoneID:`America/Los_Angeles`,plugins:h})}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [date, setDate] = useState<Instant>(focusDate);
    const view = useMemo(() => createScheduleMonthlyView(), []);
    return <Schedule view={view} events={events} categories={categories} date={date} focusDate={focusDate} onChangeDate={setDate} timezoneID="America/Los_Angeles" />;
  }
}`,...D.parameters?.docs?.source}}},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [date, setDate] = useState<Instant>(focusDate);
    const view = useMemo(() => createScheduleWeeklyView({
      minHour: 7,
      maxHour: 19
    }), []);
    return <Schedule view={view} events={events} categories={categories} date={date} onChangeDate={setDate} timezoneID="America/Los_Angeles" />;
  }
}`,...O.parameters?.docs?.source}}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [date, setDate] = useState<Instant>(focusDate);
    const view = useMemo(() => createScheduleWeeklyView({
      minHour: 7,
      maxHour: 19
    }), []);
    return <div style={{
      height: 520
    }}>
        <Schedule view={view} events={events} categories={categories} date={date} onChangeDate={setDate} timezoneID="America/Los_Angeles" style={{
        height: '100%'
      }} />
      </div>;
  }
}`,...k.parameters?.docs?.source}}},A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [date, setDate] = useState<Instant>(focusDate);
    const view = useMemo(() => createScheduleDayView(), []);
    return <Schedule view={view} events={events} categories={categories} date={date} focusDate={focusDate} onChangeDate={setDate} timezoneID="America/Los_Angeles" />;
  }
}`,...A.parameters?.docs?.source}}},j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [date, setDate] = useState<Instant>(focusDate);
    const view = useMemo(() => createScheduleListView(), []);
    return <Schedule view={view} events={events} categories={categories} date={date} focusDate={focusDate} onChangeDate={setDate} timezoneID="America/Los_Angeles" />;
  }
}`,...j.parameters?.docs?.source}}},M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [date, setDate] = useState<Instant>(focusDate);
    const view = useMemo(() => createScheduleWeeklyView({
      minHour: 7,
      maxHour: 19
    }), []);
    const loadEvents = async (start: Instant, end: Instant): Promise<CalendarEvent[]> => {
      await new Promise(resolve => setTimeout(resolve, 300));
      return createAsyncEvents(start, end);
    };
    return <Schedule view={view} events={loadEvents} categories={categories} date={date} focusDate={focusDate} onChangeDate={setDate} timezoneID="America/Los_Angeles" />;
  }
}`,...M.parameters?.docs?.source}}},N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
  render: () => {
    const views = useMemo(() => ({
      month: createScheduleMonthlyView(),
      week: createScheduleWeeklyView({
        minHour: 7,
        maxHour: 19
      }),
      day: createScheduleDayView({
        minHour: 8,
        maxHour: 18
      }),
      list: createScheduleListView()
    }), []);
    type StoryScheduleView = (typeof views)[keyof typeof views];
    const [view, setView] = useState<StoryScheduleView>(() => views.week);
    const [date, setDate] = useState<Instant>(focusDate);
    const viewOptions = useMemo<ReadonlyArray<ScheduleViewSelectorOption<StoryScheduleView>>>(() => [{
      view: views.month,
      label: 'Month'
    }, {
      view: views.week,
      label: 'Week'
    }, {
      view: views.day,
      label: 'Day'
    }, {
      view: views.list,
      label: 'List'
    }], [views]);
    const paginationPlugin = useSchedulePaginationPlugin();
    const viewSelectorPlugin = useScheduleViewSelectorPlugin(viewOptions, {
      onChangeView: setView
    });
    const plugins = useMemo(() => [paginationPlugin, viewSelectorPlugin], [paginationPlugin, viewSelectorPlugin]);
    return <Schedule view={view} events={events} categories={categories} date={date} focusDate={focusDate} onChangeDate={setDate} timezoneID="America/Los_Angeles" plugins={plugins} />;
  }
}`,...N.parameters?.docs?.source}}},P=[`Monthly`,`Weekly`,`WeeklyFixedHeight`,`Day`,`List`,`AsyncLoader`,`ViewSelectorPlugin`]}))();export{M as AsyncLoader,A as Day,j as List,D as Monthly,N as ViewSelectorPlugin,O as Weekly,k as WeeklyFixedHeight,P as __namedExportsOrder,E as default};