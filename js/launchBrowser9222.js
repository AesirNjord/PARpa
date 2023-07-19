
// 获取案件信息
(async () => {
    const puppeteer = require("puppeteer");
    //const settings = require("./settings")
    const carlo = require('carlo');
    const findChrome = require('carlo/lib/find_chrome')
    const findChromePath = await findChrome({});
    console.log('findChromePath:', findChromePath);
    const executablePath = findChromePath.executablePath;

    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
        args: ['--start-maximized', '--remote-debugging-port=9222', '--disable-web-security'],
        ignoreDefaultArgs: ['--enable-automation'],
        executablePath: executablePath,
        userDataDir: './user_data',
        devtools: false
    });
    const page = await browser.newPage();    //跳转到我们想要的地址去


    // 登录成功后跳转理赔页面
    await page.goto("https://pacas-login.pingan.com.cn/cas/PA003/ICORE_PTS/login", {
        timeout: 30 * 1000,
        waitUntil: "networkidle0"
    });




})()