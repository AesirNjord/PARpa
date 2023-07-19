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

    UserInfoCheck(browser, logger)

    function UserInfoCheck(browser) {
        return new Promise(async (resolve, rejects) => {
            try {
                var pageList = await browser.pages();
                var page
                for (i = 0; i < pageList.length; i++) {
                    let url = pageList[i].url()
                    if (url.match('https://icorepnbs.pingan.com.cn/icore_pnbs/index.html')) {
                        console.log(url)
                        page = pageList[i] //获取核心系统页面
                    }
                }
                console.log(page)
                var mainFrame = await page.frames().find(frame => frame.name() === 'main')
                page.once('error', () => console.log('error!'))

                
                const username = await mainFrame.$('#ownerDriverInfoDiv > div:nth-child(2) > div:nth-child(1) > div > input.personnelNameCheck.ownerDriver.w180.TKINPUT.ng-pristine.ng-valid')
                const ID = await mainFrame.$('#ownerDriverInfoDiv > div:nth-child(2) > div:nth-child(2) > div > input', el => el.value = '420114199002112229')
                const carCheck = await mainFrame.$('#ownerDriverInfoDiv > div:nth-child(2) > div:nth-child(2) > div > button.btn.btn-mini.btn-primary.ml3.TKBUTTON')

                await username.type('朱小银')
                await ID.type('420114199002112229')
                await carCheck.click()
                console.log('click')
                const searchIndiCustomerInfoResponse = await page.waitForResponse(response => (response.url().includes('https://icorepnbs.pingan.com.cn/icore_pnbs/do/app/quotation/searchIndiCustomerInfo')));

                console.log('searchIndiCustomerInfoResponse:', await searchIndiCustomerInfoResponse.json());
                if (JSON.stringify(await searchIndiCustomerInfoResponse.json()) == '{}') { //未检索到该客户相关信息
                    await mainFrame.waitForSelector('body > div:nth-child(1) > table > tbody > tr:nth-child(2) > td.ui_c > div > table > tbody > tr:nth-child(3) > td > div > input', { timeout: 0, visible: true });
                    await mainFrame.click('body > div:nth-child(1) > table > tbody > tr:nth-child(2) > td.ui_c > div > table > tbody > tr:nth-child(3) > td > div > input');
                } else { //检索到该客户相关信息
                    await mainFrame.waitForSelector('#doalogBox', { timeout: 0, visible: true });
                    const doalogBox = (await mainFrame.childFrames())[0];
                    await doalogBox.waitForSelector('body > fieldset > div.tac.mt10 > button:nth-child(1)', { timeout: 0, visible: true });
                    await doalogBox.click('body > fieldset > div.tac.mt10 > button:nth-child(1)');
                    await mainFrame.waitForSelector('#doalogBox', { timeout: 0, hidden: true });
                }

            } catch (error) {
                console.log(error)
                resolve(error)
            }
        })
    }
})();