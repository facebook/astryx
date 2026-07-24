import{i as e}from"./preload-helper-CT_b8DTk.js";import{t}from"./jsx-runtime-DqZldVDK.js";import{r as n}from"./useTheme-Ci2Hmk2P.js";import{u as r}from"./iframe-1XPcLcD3.js";import{i,n as a,t as o}from"./src-BbBBLexp.js";function s(e){let{token:t}=n(),r=a(t);return(0,c.jsx)(i,{...e,compileOptions:{config:r}})}var c,l,u,d,f,p,m,h,g,_,v,y,b,x,S,C,w;e((()=>{o(),r(),c=t(),l=`https://cdn.jsdelivr.net/npm/vega-datasets@3.2.1/data`,u=`${l}/stocks.csv`,d=`${l}/seattle-weather.csv`,f=`${l}/movies.json`,p={$schema:`https://vega.github.io/schema/vega-lite/v5.json`,title:`Stocks price progression 2000-2010`,width:`container`,height:400,data:{url:u},encoding:{x:{field:`date`,type:`temporal`}},layer:[{mark:{type:`rule`,stroke:`#65676b`},encoding:{opacity:{condition:{param:`hoveredPoint`,value:1,empty:!1},value:0}}},{mark:`line`,encoding:{y:{field:`price`,type:`quantitative`,axis:{format:`$,d`}},color:{field:`symbol`,type:`nominal`}}},{mark:{type:`point`,size:64,fill:`white`,strokeWidth:2},encoding:{y:{field:`price`,type:`quantitative`},stroke:{field:`symbol`,legend:null},opacity:{condition:{param:`hoveredPoint`,value:1,empty:!1},value:0}}},{transform:[{pivot:`symbol`,value:`price`,groupby:[`date`]}],mark:{type:`rule`,opacity:0},encoding:{tooltip:[{field:`date`,type:`temporal`,format:`%B %Y`},{field:`AAPL`,type:`quantitative`},{field:`AMZN`,type:`quantitative`},{field:`GOOG`,type:`quantitative`},{field:`IBM`,type:`quantitative`},{field:`MSFT`,type:`quantitative`}]},params:[{name:`hoveredPoint`,select:{type:`point`,fields:[`date`],nearest:!0,on:`pointerover`,clear:`pointerout`}}]}]},m={$schema:`https://vega.github.io/schema/vega-lite/v5.json`,description:`Drag a rectangular brush to show (first 20) selected points in a table.`,data:{url:`${l}/cars.json`},transform:[{window:[{op:`row_number`,as:`row_number`}]}],hconcat:[{params:[{name:`brush`,select:`interval`}],mark:`point`,encoding:{x:{field:`Horsepower`,type:`quantitative`},y:{field:`Miles_per_Gallon`,type:`quantitative`},color:{condition:{param:`brush`,field:`Cylinders`,type:`ordinal`},value:`grey`}}},{transform:[{filter:{param:`brush`}},{window:[{op:`rank`,as:`rank`}]},{filter:{field:`rank`,lt:20}}],hconcat:[{width:50,title:`Horsepower`,mark:`text`,encoding:{text:{field:`Horsepower`,type:`nominal`},y:{field:`row_number`,type:`ordinal`,axis:null}}},{width:50,title:`MPG`,mark:`text`,encoding:{text:{field:`Miles_per_Gallon`,type:`nominal`},y:{field:`row_number`,type:`ordinal`,axis:null}}},{width:50,title:`Origin`,mark:`text`,encoding:{text:{field:`Origin`,type:`nominal`},y:{field:`row_number`,type:`ordinal`,axis:null}}}]}],resolve:{legend:{color:`independent`}}},h={$schema:`https://vega.github.io/schema/vega-lite/v5.json`,description:`Vega-Lite version of bar chart from https://observablehq.com/@d3/learn-d3-scales.`,width:400,data:{values:[{name:`🍊`,count:21},{name:`🍇`,count:13},{name:`🍏`,count:8},{name:`🍌`,count:5},{name:`🍐`,count:3},{name:`🍋`,count:2},{name:`🍎`,count:1},{name:`🍉`,count:1}]},encoding:{y:{field:`name`,type:`nominal`,sort:`-x`,title:null},x:{field:`count`,type:`quantitative`,title:null}},layer:[{mark:`bar`,encoding:{color:{field:`count`,type:`quantitative`,title:`Number of fruit`}}},{mark:{type:`text`,align:`right`,xOffset:-4,aria:!1},encoding:{text:{field:`count`,type:`quantitative`},color:{condition:{test:{field:`count`,gt:10},value:`white`},value:`black`}}}]},g={$schema:`https://vega.github.io/schema/vega-lite/v5.json`,description:`A dot plot showing each movie in the database, and the difference from the average movie rating. The display is sorted by year to visualize everything in sequential order. The graph is for all Movies before 2019.`,data:{url:f},transform:[{filter:`datum['IMDB Rating'] != null`},{filter:{timeUnit:`year`,field:`Release Date`,range:[null,2019]}},{joinaggregate:[{op:`mean`,field:`IMDB Rating`,as:`AverageRating`}]},{calculate:`datum['IMDB Rating'] - datum.AverageRating`,as:`RatingDelta`}],mark:`point`,encoding:{x:{field:`Release Date`,type:`temporal`},y:{field:`RatingDelta`,type:`quantitative`,title:`Rating Delta`},color:{field:`RatingDelta`,type:`quantitative`,scale:{domainMid:0},title:`Rating Delta`}}},_={$schema:`https://vega.github.io/schema/vega-lite/v5.json`,data:{url:d},title:`Daily Max Temperatures (C) in Seattle, WA`,config:{view:{strokeWidth:0,step:13},axis:{domain:!1}},mark:`rect`,encoding:{x:{field:`date`,timeUnit:`date`,type:`ordinal`,title:`Day`,axis:{labelAngle:0,format:`%e`}},y:{field:`date`,timeUnit:`month`,type:`ordinal`,title:`Month`},color:{field:`temp_max`,aggregate:`max`,type:`quantitative`,legend:{title:null}}}},v={title:`Vega/VegaChart`,component:i,tags:[`autodocs`],parameters:{layout:`padded`}},y={name:`Range: Category - Stocks Line Chart`,render:()=>(0,c.jsx)(`div`,{style:{width:`100%`,maxWidth:720},children:(0,c.jsx)(s,{spec:p})})},b={name:`Range: Ordinal - Brushing Scatter Plot to show data on a table`,render:()=>(0,c.jsx)(`div`,{style:{width:`100%`,maxWidth:720},children:(0,c.jsx)(s,{spec:m})})},x={name:`Range: Heatmap - Annual Weather Heatmap`,render:()=>(0,c.jsx)(`div`,{style:{width:`100%`,maxWidth:720},children:(0,c.jsx)(s,{spec:_})})},S={name:`Range: Diverging - Calculate Residuals`,render:()=>(0,c.jsx)(`div`,{style:{width:`100%`,maxWidth:720},children:(0,c.jsx)(s,{spec:g})})},C={name:`Range: Ramp - Simple Bar Chart with Labels and Emojis`,render:()=>(0,c.jsx)(`div`,{style:{width:`100%`,maxWidth:720},children:(0,c.jsx)(s,{spec:h})})},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  name: 'Range: Category - Stocks Line Chart',
  render: () => <div style={{
    width: '100%',
    maxWidth: 720
  }}>
      <ThemedVegaChart spec={stocksLineChartSpec} />
    </div>
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  name: 'Range: Ordinal - Brushing Scatter Plot to show data on a table',
  render: () => <div style={{
    width: '100%',
    maxWidth: 720
  }}>
      <ThemedVegaChart spec={brushTableSpec} />
    </div>
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  name: 'Range: Heatmap - Annual Weather Heatmap',
  render: () => <div style={{
    width: '100%',
    maxWidth: 720
  }}>
      <ThemedVegaChart spec={weatherHeatmapSpec} />
    </div>
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  name: 'Range: Diverging - Calculate Residuals',
  render: () => <div style={{
    width: '100%',
    maxWidth: 720
  }}>
      <ThemedVegaChart spec={residualGraphSpec} />
    </div>
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  name: 'Range: Ramp - Simple Bar Chart with Labels and Emojis',
  render: () => <div style={{
    width: '100%',
    maxWidth: 720
  }}>
      <ThemedVegaChart spec={fruitBarChartSpec} />
    </div>
}`,...C.parameters?.docs?.source}}},w=[`StocksLineChart`,`BrushTable`,`WeatherHeatmap`,`ResidualGraph`,`FruitBarChart`]}))();export{b as BrushTable,C as FruitBarChart,S as ResidualGraph,y as StocksLineChart,x as WeatherHeatmap,w as __namedExportsOrder,v as default};