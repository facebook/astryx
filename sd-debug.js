const{chromium}=require("playwright");
(async()=>{
  const b=await chromium.launch();
  const p=await b.newPage({viewport:{width:1280,height:900}});
  await p.goto("http://localhost:3000/templates/settings-dialog/",{waitUntil:"networkidle",timeout:60000});
  await p.waitForTimeout(3000);
  const btns=await p.locator("button").all();
  console.log("buttons:",btns.length);
  for(const btn of btns){console.log("text:",await btn.textContent())}
  await p.screenshot({path:"/tmp/sd-debug.png"});
  await b.close();
  console.log("done");
})()
