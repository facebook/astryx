const{chromium}=require("playwright");
(async()=>{
  const b=await chromium.launch();
  const p=await b.newPage({viewport:{width:1280,height:900}});
  await p.goto("http://localhost:3000/templates/settings-dialog/",{waitUntil:"networkidle",timeout:60000});
  await p.waitForTimeout(2000);
  await p.getByRole("button",{name:"Open settings"}).click();
  await p.waitForTimeout(800);
  await p.screenshot({path:"/tmp/sd-login.png"});
  await p.getByText("Personal information").click();
  await p.waitForTimeout(500);
  await p.screenshot({path:"/tmp/sd-personal.png"});
  await p.getByText("Privacy").first().click();
  await p.waitForTimeout(500);
  await p.screenshot({path:"/tmp/sd-privacy.png"});
  await b.close();
  console.log("done");
})()
