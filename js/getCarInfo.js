(async () => {
    const puppeteer = require('puppeteer')
    const findChrome = require('carlo/lib/find_chrome')
    const findChromePath = await findChrome({});
    console.log('findChromePath:', findChromePath);
    const request = require('request')


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

    const vehicleFrameNo = 'LZWADAGA3JF264404';
    const brandNameS = ''
   

    RenewalCheck(browser, vehicleFrameNo, brandNameS)

    function RenewalCheck(browser,vehicleFrameNo, brandNameS) {
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

                const carInfoCheckButton = await mainFrame.$('#VehicleFrameNoID > div > button')

                var carInfoResponse
                var carInfo

                if(brandNameS!=''){
                    const brandNameInput = await mainFrame.$('#extBrand')
                    await brandNameInput.type(brandNameS)
                    await brandNameInput.press('Enter')
                    carInfoResponse = await page.waitForResponse(response => (response.url().includes('https://icorepnbs.pingan.com.cn/icore_pnbs/do/app/quotation/autoModelCodeQuery')));
                    carInfo = await carInfoResponse.json()

                    if(carInfo == '{"data":{"encodeDict":[]}}'){
                        let button = await mainFrame.$('body > div:nth-child(1) > table > tbody > tr:nth-child(2) > td.ui_c > div > table > tbody > tr:nth-child(3) > td > div > input')
                        await button.click()
                        var vehicleFrameNoInput = await mainFrame.$('#vehicleFrameNo')
                        await vehicleFrameNoInput.type(vehicleFrameNo) //车架号*/
                        await carInfoCheckButton.click()
                        carInfoResponse = await page.waitForResponse(response => (response.url().includes('https://icorepnbs.pingan.com.cn/icore_pnbs/do/app/quotation/autoModelCodeQuery')));
                        carInfo = await carInfoResponse.json()
                    }
                }else{
                    var vehicleFrameNoInput = await mainFrame.$('#vehicleFrameNo')
                    await vehicleFrameNoInput.type(vehicleFrameNo) //车架号*/
                    await carInfoCheckButton.click()
                    carInfoResponse = await page.waitForResponse(response => (response.url().includes('https://icorepnbs.pingan.com.cn/icore_pnbs/do/app/quotation/autoModelCodeQuery')));
                    carInfo = await carInfoResponse.json()
                }
                /*const vehicleLicenceCodeInput = await mainFrame.$('#vehicleLicenseCodeId')
                const engineNoInput = await mainFrame.$('#engineNo')
                const vehicleFrameNoInput = await mainFrame.$('#vehicleFrameNo')
                await vehicleLicenceCodeInput.type(vehicleLicenceCode) //车牌号
                await engineNoInput.type(engineNo) //发动机号
                await vehicleFrameNoInput.type(vehicleFrameNo) //车架号*/
                
                var list = []
                var energy = [{
                    101:'燃油'
                },{
                    102:'纯电动'
                },{
                    103:'燃料电池'
                },{
                    104:'插电式混合动力'
                },{
                    199:'其他混合动力'
                }]
                var modelCode;
                var jyModelCode;
                var displacement;
                var brandName;
                var purchasePrice;
                var issueYear;
                var seatCount;
            
                if(carInfo != '{"data":{"encodeDict":[]}}'){
                    for (i = 0; i < carInfo.encodeDict.length; i++) {
                        switch (carInfo.encodeDict[i].powerTypeCode) { //处理能源类型
                            case 'D1':
                                energyType = energy[0]
                                break;
    
                            case 'D2':
                                energyType = energy[0]
                                break;
                            case 'D6':
                                energyType = energy[1]
                                break;
    
                            case 'D8':
                                energyType = energy[2]
                                break;
    
                            case 'D12':
                                energyType = energy[3]
                                break;
    
                            case 'D5':
                                energyType = energy[4]
                                break;
                        }
    
                        modelCode = carInfo.encodeDict[i].autoModelCode;
                        jyModelCode = '';
                        displacement = carInfo.encodeDict[i].exhaustMeasure;
                        brandName = carInfo.encodeDict[i].brandName;
                        purchasePrice = carInfo.encodeDict[i].purchasePrice;
                        issueYear = carInfo.encodeDict[i].firstSaleDate;
                        seatCount = carInfo.encodeDict[i].seats;
    
                        list.push({
                            modelCode:modelCode,
                            jyModelCode :jyModelCode,
                            displacement:displacement,
                            brandName:brandName,
                            purchasePrice:purchasePrice,
                            issueYear:issueYear,
                            seatCount:seatCount,
                            energyType:energyType,
                        })
                    }
                    var response = {
                        serialNo:'',
                        status:200,
                        message:'成功查找到车型信息',
                        data:{
                            list:list
                        }
                    }
                    console.log(response.data.list[0])
                    resolve(response) //返回数据
                }else{
                    var response = {
                        serialNo:'',
                        status:400,
                        message:'未查找到车型信息',
                    }
                    resolve(response)
                }
            } catch (error) {
                console.log(error)
                rejects(error)
            }
        })
    }

    function sleep(timeout) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve()
            }, timeout);
        })
    }
})();