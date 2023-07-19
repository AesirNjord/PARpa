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

    var vehicleFrameNo = 'LZWADAGA3JF264404'
    var licenseNo = ''
    var cardListNo = ''
    await RenewalCheck(browser, licenseNo, cardListNo, vehicleFrameNo)

    function RenewalCheck(browser, licenseNo, cardListNo, vehicleFrameNo) {
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
                var mainFrame = page.frames().find(frame => frame.name() === 'main')
                if (licenseNo != '') { //有无车牌号
                    if (cardListNo != '') { //有无身份证号
                        let licenseNoInput = await mainFrame.$('#auto0Div > div > div.widget-box.bgc_odd.ng-scope > div.widget-content > div > form > div:nth-child(1) > div > input');
                        licenseNoInput.type(licenseNo)
                        let IdInput = await mainFrame.$('#auto0Div > div > div.widget-box.bgc_odd.ng-scope > div.widget-content > div > form > div.control-group.ng-scope > div > input')
                        IdInput.type(cardListNo)
                    } else {
                        let licenseNoInput = await mainFrame.$('#auto0Div > div > div.widget-box.bgc_odd.ng-scope > div.widget-content > div > form > div:nth-child(1) > div > input');
                        licenseNoInput.type(licenseNo)
                    }
                } else { //使用车架号
                    const vehicleFrameNoInput = await mainFrame.$('#auto0Div > div > div.widget-box.bgc_odd.ng-scope > div.widget-content > div > form > div:nth-child(2) > div > input')
                    await vehicleFrameNoInput.type(vehicleFrameNo) //输入车架号
                }

                const TKBUTTON = await mainFrame.$('#auto0Div > div > div.widget-box.bgc_odd.ng-scope > div.widget-content > div > form > div.dib.vat > button')
                await TKBUTTON.click() //点击检索

                pageList = await browser.pages();

                const target = await browser.waitForTarget(t => t.url().match('https://icorepnbs.pingan.com.cn/icore_pnbs/templates/v2/quotationAndApply/templates/view/popup/quickSearch_result.html'))//获取续保查询结果
                var newPage = await target.page();
                const vehicleFrameNoResponse = await newPage.waitForResponse(response => (response.url().includes('https://icorepnbs.pingan.com.cn/icore_pnbs/do/quote/quickSearchx9m24g')));
                let RenewalPersonInfo = await vehicleFrameNoResponse.json()
                console.log('vehicleFrameNoResponse', RenewalPersonInfo)
                await newPage.reload({ waitUntil: "networkidle0" })

                var renewalStatus = [{
                    0:'默认'
                },{
                    1:'保单'
                }]

                var policy = {
                    companyId: 0,
                    companyName: '',
                    tciPremium: 0,
                    vciPremium: 0,
                    vehicleTax: 0,
                    tciPolicyNo: '',
                    vciPolicyNo: '',
                    tciPolicyEndDate: '',
                    vciPolicyEndDate: '',
                    tciPolicyEndDateTime: '',
                    vciPolicyEndDateTime: '',
                }

                var vehicle = {
                    licenseNo: '',
                    brandName: '',
                    jyModelCode: '',
                    modelCode: '',
                    frameNo: '',
                    engineNo: '',
                    enrollDate: '',
                    issueYear: '',
                    purchasePrice: 0,
                    seatCount: 0,
                    transferDate: '',
                    displacement: 0,
                    curbWeight: 0,
                    tonnage: 0,
                    vehicleType: '',
                    vehicleCategory: '',
                    useNature: '',
                    attachNature: '',
                    plateType: '',
                    plateColor: '',
                    energyType: '',
                }

                var applicant = {
                    ownerName: '',
                    ownerPhone: '',
                    ownerIdType: '',
                    ownerIdNo: '',
                    ownerAddr: '',
                    ownerBirthday: '',
                    ownerSex: 0,
                    ownerEmail: '',
                    holderName: '',
                    holderPhone: '',
                    holderIdType: '',
                    holderIdNo: '',
                    holderAddr: '',
                    holderBirthday: '',
                    holderSex: 1,
                    insuredName: '',
                    insuredPhone: '',
                    insuredIdType: '',
                    insuredIdNo: '',
                    insuredAddr: '',
                    insuredBirthday: '',
                    insuredSex: 0,
                }

                var risks = []

                var platform = []


                if (RenewalPersonInfo == '{}') {
                    let button = await newPage.$('body > div:nth-child(1) > table > tbody > tr:nth-child(2) > td.ui_c > div > table > tbody > tr:nth-child(3) > td > div > input')
                    await button.click()
                    var response = {
                        status:400,
                        message:'未查询到续保信息',
                        data
                    }
                    resolve(response)
                } else {
                    let confirmButton = await newPage.$('#quicksearch > div > button')
                    //await sleep(100)
                    console.log(confirmButton)
                    confirmButton.click()
                    const RenewalInfoResponse = await page.waitForResponse(response => (response.url().includes('https://icorepnbs.pingan.com.cn/icore_pnbs/do/app/quotation/quickSearchVoucher')));
                    let RenewalInfo = await RenewalInfoResponse.json()
                    console.log('RenewalInfoResponse', RenewalInfo)

                    //保单信息 缺失保费和车船税
                    policy.companyId = RenewalInfo.voucher.c01BaseInfo.agentAgreementNo;
                    policy.companyId = Number(policy.companyId);
                    policy.companyName = RenewalInfo.voucher.c01BaseInfo.agentAgreementName;

                    policy.tciPolicyNo = RenewalInfo.voucher.c01BaseInfo.policyNo;
                    policy.vciPolicyNo = RenewalInfo.voucher.c51BaseInfo.policyNo;
                    policy.tciPolicyEndDate = RenewalInfo.voucher.c01BaseInfo.insuranceEndTime.slice(0, 9)
                    policy.vciPolicyEndDate = RenewalInfo.voucher.c51BaseInfo.insuranceEndTime.slice(0, 9)
                    policy.tciPolicyEndDateTime = RenewalInfo.voucher.c01BaseInfo.insuranceEndTime
                    policy.vciPolicyEndDateTime = RenewalInfo.voucher.c51BaseInfo.insuranceEndTime

                    //车辆信息  缺失过户日期,交管车辆类型，号牌种类，号牌底色
                    vehicle.licenseNo = RenewalInfo.voucher.vehicleTarget.vehicleLicenceCode;
                    vehicle.brandName = RenewalInfo.voucher.vehicleTarget.brandName;
                    vehicle.modelCode = RenewalInfo.autoModelType.autoModeCode;
                    vehicle.frameNo = vehicleFrameNo;
                    vehicle.enrollDate = RenewalInfo.voucher.vehicleTarget.firstRegisterDate.slice(0, 9);
                    vehicle.issueYear = RenewalInfo.autoModelType.firstSaleDate
                    vehicle.purchasePrice = RenewalInfo.autoModelType.purchasePrice;
                    vehicle.seatCount = RenewalInfo.autoModelType.seat;
                    vehicle.displacement = RenewalInfo.voucher.vehicleTarget.exhaustCapability;
                    vehicle.curbWeight = RenewalInfo.voucher.vehicleTarget.wholeWeight;
                    vehicle.tonnage = RenewalInfo.voucher.vehicleTarget.vehicleTonnages;
                    vehicle.vehicleCategory = RenewalInfo.voucher.vehicleTarget.licenceTypeName;
                    vehicle.useNature = RenewalInfo.voucher.vehicleTarget.ownershipAttributeName;
                    vehicle.attachNature = RenewalInfo.voucher.vehicleTarget.usageAttributeName;
                    switch (RenewalInfo.autoModelType.powerTypeCode) { //处理能源类型
                        case 'D1': {
                            vehicle.energyType = '101：燃油'
                            break;
                        }

                        case 'D2':
                            vehicle.energyType = '101：燃油'
                            break;
                        case 'D6':
                            vehicle.energyType = '102：纯电动'
                            break;

                        case 'D8':
                            vehicle.energyType = '103：燃料电池'
                            break;

                        case 'D12':
                            vehicle.energyType = '104：插电式混合动力'
                            break;

                        case 'D5':
                            vehicle.energyType = '199：其他混合动力'
                            break;
                    }

                    //关系人信息 缺失车主联系方式,车主联系地址，车主邮箱，全部投保人信息，被保人联系方式，被保人联系地址
                    applicant.ownerName = RenewalInfo.voucher.ownerDriver.personnelName;
                    applicant.ownerIdType = RenewalInfo.voucher.ownerDriver.certificateTypeName;
                    applicant.ownerIdNo = RenewalInfo.voucher.ownerDriver.certificateTypeNo;
                    applicant.ownerBirthday = RenewalInfo.voucher.ownerDriver.birthday;
                    if (RenewalInfo.voucher.ownerDriver.sexName == '男') {
                        applicant.ownerSex = 1
                    } else {
                        applicant.ownerSex = 2
                    }
                    applicant.insuredName = RenewalInfo.voucher.insurantInfo.personnelName;
                    applicant.insuredIdType = RenewalInfo.voucher.insurantInfo.certificateTypeName;
                    applicant.insuredIdNo = RenewalInfo.voucher.insurantInfo.certificateTypeNo;
                    applicant.insuredBirthday = RenewalInfo.voucher.insurantInfo.birthday.slice(0, 9);
                    if (RenewalInfo.voucher.insurantInfo.sexName == '男') {
                        applicant.insuredSex = 1
                    } else {
                        applicant.insuredSex = 2
                    }

                    //商业险险别信息

                    for (i = 0; i < RenewalInfo.voucher.c01DutyList.length; i++) {
                        riskCode = RenewalInfo.voucher.c01DutyList[i].dutyCode
                        riskName = RenewalInfo.voucher.c01DutyList[i].dutyName
                        amount = RenewalInfo.voucher.c01DutyList[i].insuredAmount
                        premium = 0
                        quantity = 0
                        unitAmount = 0
                        glassType = 0
                        isDeductible = 0
                        deductPremium = 0
                        deductibleRate = 0
                        detail = {}
                        detailList = []
                        serviceName = ''
                        serviceItem = ''
                        serviceTimes = 0

                        risks.push({
                            riskCode: riskCode,
                            riskName: riskName,
                            amount: amount,
                            premium: premium,
                            quantity: quantity,
                            unitAmount: unitAmount,
                            glassType: glassType,
                            isDeductible: isDeductible,
                            deductPremium: deductPremium,
                            deductibleRate: deductibleRate,
                            detail: detail,
                            detailList: detailList,
                            serviceName: serviceName,
                            serviceItem: serviceItem,
                            serviceTimes: serviceTimes,
                        })
                    }

                    //平台信息 缺失无赔款优待系数，交通违法系数，渠道系数，自主核保系数
                    ncd = '';
                    trafficTransgressRate = '';
                    channelRate = '';
                    underwritingRate = '';
                    belongerName = RenewalInfo.voucher.saleInfo.saleAgentName
                    belongerCode = RenewalInfo.voucher.saleInfo.saleAgentCode
                    belongerDepartment = RenewalInfo.voucher.saleInfo.departmentName
                    belongerDepartmentCode = RenewalInfo.voucher.saleInfo.departmentCode

                    platform.push({
                        ncd,
                        trafficTransgressRate,
                        channelRate,
                        underwritingRate,
                        belongerName,
                        belongerCode,
                        belongerDepartment,
                        belongerDepartmentCode,
                    })
                    const data = {
                        renewalStatus:renewalStatus[0],
                        policy,
                        vehicle,
                        applicant,
                        risks,
                        platform,
                    }

                    var response = {
                        status:200,
                        message:'成功查询到续保信息',
                        data
                    }
                    console.log('response', response)
                    resolve(response) //返回数据


                    await page.reload({ waitUntil: "networkidle0" })
                    pageList = await browser.pages();
                    page
                    for (i = 0; i < pageList.length; i++) {
                        let url = pageList[i].url()
                        if (url.match('https://icorepnbs.pingan.com.cn/icore_pnbs/index.html')) {
                            console.log(url)
                            page = pageList[i] //获取核心系统页面
                        }
                    }
                    mainFrame = page.frames().find(frame => frame.name() === 'main')
                    confirmButton = await mainFrame.$('#mainContent > div.widget-box.bgc_odd > div.widget-content.form-horizontal > form > div.mt10 > div > div > button.btn.btn-primary.w80')
                    await sleep(100)
                    confirmButton.click()
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