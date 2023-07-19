(async () => {
    const puppeteer = require('puppeteer')
    const findChrome = require('carlo/lib/find_chrome')
    const findChromePath = await findChrome({});
    console.log('findChromePath:', findChromePath);
    //const executablePath = findChromePath.executablePath;
    const log4js = require('log4js');
    const request = require('request')

    log4js.configure({
        appenders: {
            // 定义输出程序
            console: {
                type: "console",
            },
            logToFile: { type: "file", filename: "./logs/all-the-logs.log", maxLogSize: 1024 * 1024 * 10, backups: 10 },
        },
        categories: {
            // 定义日志类别及使用的输出程序
            default: { appenders: ["logToFile"], level: "all" },
            console: {
                appenders: ["console"],
                level: "error",
            },
        },
        pm2: true, // 使用 pm2 运行时需要开启此选项，否则日志不生效
        pm2InstanceVar: "NODE_APP_INSTANCE", // pm2 NODE_APP_INSTANCE 变量的默认名称。
    });
    const logger = log4js.getLogger();
    //通过 9222 端口的 http 接口获取对应的 websocketUrl
    // 本地浏览器配置启动参数  --remote-debugging-port=9222
    let version = await request({
        uri: "http://127.0.0.1:9222/json/version",
        json: true
    });
    console.log('version:', version);
    //直接连接已经存在的 Chrome
    let browser = await puppeteer.connect({
        browserWSEndpoint: 'ws://localhost:9222/devtools/browser/15161a4b-fda0-4344-82ea-497dfc84355b',
        //browserURL:"http://127.0.0.1:9222/json/version",
        defaultViewport: null
    });

    RenewalCheck(browser, logger)
    /*var pageList = await browser.pages();
    var page
    for(i=0;i<pageList.length;i++){
        let url = pageList[i].url()
        if(url.match('https://icorepnbs.pingan.com.cn/icore_pnbs/index.html')){
            console.log(url)
            page = pageList[i] //获取核心系统页面
        }
    }
    console.log(page)
    const mainFrame = page.frames().find(frame => frame.name() === 'main')
    const vehicleFrameNoInput =  await mainFrame.$('#auto0Div > div > div.widget-box.bgc_odd.ng-scope > div.widget-content > div > form > div:nth-child(2) > div > input')
    await vehicleFrameNoInput.type('LZWADAGA3JF26440') //输入车架号
    const TKBUTTON = await mainFrame.$('#auto0Div > div > div.widget-box.bgc_odd.ng-scope > div.widget-content > div > form > div.dib.vat > button')
    await TKBUTTON.click() //点击检索

    pageList = await browser.pages();

    const target = await browser.waitForTarget(t => t.url().match('https://icorepnbs.pingan.com.cn/icore_pnbs/templates/v2/quotationAndApply/templates/view/popup/quickSearch_result.html'))//获取续保查询结果
    var newPage = await target.page();
    await newPage.reload({ waitUntil: "networkidle0" })

    if(await newPage.$('body > div:nth-child(1) > table > tbody > tr:nth-child(2) > td.ui_c > div > table > tbody > tr:nth-child(2) > td:nth-child(2) > div > div')){
        let button = await newPage.$('body > div:nth-child(1) > table > tbody > tr:nth-child(2) > td.ui_c > div > table > tbody > tr:nth-child(3) > td > div > input')
        await button.click()
    }else if(await newPage.$('#quicksearch > fieldset > table > tbody > tr:nth-child(2) > td.w100.ng-binding')){

    }*/
    function RenewalCheck(browser){
        return new Promise(async (resolve,rejects)=>{
            try { 
                pageList = await browser.pages();
                var newPage
                for(i=0;i<pageList.length;i++){
                    let url = pageList[i].url()
                    if(url.match('https://icorepnbs.pingan.com.cn/icore_pnbs/templates/v2/quotationAndApply/templates/view/popup/quickSearch_result.html')){
                        console.log(url)
                        newPage = pageList[i] //获取核心系统页面
                    }
                }
                console.log(newPage)

                await newPage.reload({ waitUntil: "networkidle0" })

                let button = await newPage.$('#quicksearch > div > button')
                console.log(button)
                button.click()

                
            } catch (error) {
                rejects(error)
            }
        })
    }
})();