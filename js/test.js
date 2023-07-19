(async () => {
    const puppeteer = require('puppeteer')
    const findChrome = require('carlo/lib/find_chrome')
    const findChromePath = await findChrome({});
    console.log('findChromePath:', findChromePath);
    const request = require('request')
    const uploadPic = require('./uploadPic')


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

    const images = [{
        type: '投保人身份证明-身份证',
        link: 'C:\\Users\\hcxw\\Pictures\\测试图片\\投保人身份证明-身份证1.jpg',
    },{
        type: '投保人身份证明-身份证',
        link: 'C:\\Users\\hcxw\\Pictures\\测试图片\\投保人身份证明-身份证2.jpg',
    },{
        type:'批改资料-批改申请书',
        link:'C:\\Users\\hcxw\\Pictures\\测试图片\\批改资料-批改申请书1.jpg'
    },{
        type:'批改资料-批改申请书',
        link:'C:\\Users\\hcxw\\Pictures\\测试图片\\批改资料-批改申请书2.jpg'
    },{
        type:'双录证明-代办人身份证明原件正、反面照片',
        link:'C:\\Users\\hcxw\\Pictures\\测试图片\\双录证明-代办人身份证明原件正、反面照片1.jpg'
    },{
        type:'双录证明-代办人身份证明原件正、反面照片',
        link:'C:\\Users\\hcxw\\Pictures\\测试图片\\双录证明-代办人身份证明原件正、反面照片2.jpg'
    }]



    await uploadPic.UploadPic(browser,images)
})();