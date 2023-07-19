function UploadPic(browser, images) {
    return new Promise(async (resolve, rejects) => {
        try {
            var pageList = await browser.pages();
            var page
            for (i = 0; i < pageList.length; i++) {
                let url = pageList[i].url()
                if (url.match('https://icorepnbs.pingan.com.cn/icore_pnbs/templates/uploadMaterial.html')) {
                    console.log(url)
                    page = pageList[i] //获取上传页面
                }
            }
            var uploadInput = await page.$('#filePicker >div:nth-child(2) >input');
            //await uploadInput.uploadFile(“path / to / file”);
            var imagesType = []
            for (i = 0; i < images.length; i++) {
                console.log(images[i])
                if (imagesType.includes(images[i].type)) {

                } else {
                    imagesType.push(images[i].type)
                }
            }

            for (i = 0; i < imagesType.length; i++) {
                console.log(imagesType[i])
                let type = imagesType[i].split("-")
                console.log(typeof (type[0]))
                console.log(typeof (type[1]))
                let type1 = setType1(type[0])
                let type2 = setType2(type[0], type[1])

                //console.log(type2)
                await sleep(100)
                await page.select('#tabContent >div>div>form>div:nth-child(2)>div>select:nth-child(1)', type1)
                await page.waitForResponse(response => (response.url().includes('https://icorepnbs.pingan.com.cn/icore_pnbs/do/app/attachment/getSecondLevelAttachmentType')))
                await sleep(100)
                await page.select('#tabContent >div>div>form>div:nth-child(2)>div>select:nth-child(2)', type2)
            }

            var uploadList = []
            for (i = 0; i < images.length; i++) {
                /*console.log(images[i])
                try {
                    await uploadInput.uploadFile(images[i].link)
                    var uploadInput = await page.$('#filePicker >div:nth-child(2) >input')
                    let up = 'await uploadInput.uploadFile(' + images[i].link + ')'
                    uploadList.push(up)
                } catch (error) {
                    console.log(error)
                }
                console.log('upload!')*/
                let up = 'uploadInput.uploadFile(' + images[i].link + ')'
                    uploadList.push(up)
                
            }

            console.log(uploadList)
            Promise.all(uploadList)
            await page.waitForResponse(response => (response.url().includes('https://icorepnbs.pingan.com.cn/icore_pnbs/do/app/attachment/uploadAndQueryAttachment')))
            //let span = await page.$('#tabContent>div>div>form>div:nth-child(2)>div:nth-child(2)>fieldset:nth-child(1)>legend>span')

            //console.log(span)

            for (i = 0; i < images.length; i++) {
                for (j = 0; j < imagesType.length; j++) {
                    let pic = await page.$('#tabContent> div > div > fieldset > div > div:nth-child(1) > a:nth-child(1) > img')
                    let picTitle = await page.$eval('#tabContent> div > div > fieldset > div > div:nth-child(1) > a:nth-child(1) > img', e => e.title)
                    
                    let picBox = await pic.boundingBox()

                    let inputArea = await page.$('#tabContent>div>div>form>div>div:nth-child(2)>fieldset:nth-child(' + (j + 1) + ')')
                    let inputAreaTitle = await page.$eval('#tabContent>div>div>form>div:nth-child(2)>div:nth-child(2)>fieldset:nth-child(' + (j + 1) + ')>legend>span', e => e.innerText)
                    
                    let inputAreaBox = await inputArea.boundingBox()
                    if (picTitle.match(inputAreaTitle)) {
                        console.log(picTitle)
                        console.log(inputAreaTitle)
                        await page.mouse.move(picBox.x + (picBox.width / 2), picBox.y + (picBox.height / 2))
                        await sleep(100)
                        await page.mouse.down()
                        await sleep(100)
                        await page.mouse.move(inputAreaBox.x + (inputAreaBox.width / 2), inputAreaBox.y + (inputAreaBox.height / 2))
                        await sleep(100)
                        await page.mouse.up()
                        break;
                    }
                }
            }

            /*await page.mouse.move(picBox.x + (picBox.width / 2), picBox.y - (picBox.height / 2))
            await page.mouse.down()
            await page.mouse.move(inputAreaBox.x + (inputAreaBox.width / 2), inputAreaBox.y - (inputAreaBox.height / 2))*/
            //console.log(paths)
            //await uploadInput.uploadFile(paths)


            /*for(i=0;i<images.length;i++){
                for(j=0;j<imagesType.length;j++){
                    if(images[i].type == imagesType[j]){

                    }
                }
            }*/
            resolve()
        } catch (error) {
            console.log(error)
            rejects(error)
        }
    })
}


function setType1(type) {
    var type1
    switch (type) {
        case "投保人身份证明":
            type1 = '0';
            break;

        case "批改资料":
            type1 = '1';
            break;

        case "双录证明":
            type1 = '2';
            break;

        case "被保险人身份证明":
            type1 = '3';
            break;

        case "电子单证PDF":
            type1 = '4';
            break;

        case "保单遗失证明书PDF":
            type1 = '5';
            break;

        case "本地使用证明":
            type1 = '6';
            break;

        case "投车关系证明":
            type1 = '7';
            break;

        case "车主身份证明":
            type1 = '8';
            break;

        case "标的证明":
            type1 = '9';
            break;

        case "驾驶证明":
            type1 = '10';
            break;

        case "投保申请书":
            type1 = '11';
            break;

        case "车船税证明":
            type1 = '12';
            break;

        case "费率因子证明":
            type1 = '13';
            break;

        case "其他证明":
            type1 = '14';
            break;
    }

    return type1
}

function setType2(type1, type2) {
    var type
    switch (type1) {
        case '投保人身份证明':
            switch (type2) {
                case '驾驶证':
                    type = '0'
                    break;

                case '身份证':
                    type = '1'
                    break;

                case '组织机构代码证':
                    type = '2'
                    break;

                case '税务登记证':
                    type = '3'
                    break;

                case '统一社会信用代码':
                    type = '4'
                    break;

                case '港澳台居民居住证':
                    type = '5'
                    break;

                case '营业执照':
                    type = '6'
                    break;

                case '居民户口簿':
                    type = '7'
                    break;

                case '港澳居民来往内地通行证':
                    type = '8'
                    break;

                case '护照':
                    type = '9'
                    break;

                case '暂住证/居住证':
                    type = '10'
                    break;

                case '军官证':
                    type = '11'
                    break;

                case '其它':
                    type = '12'
                    break;

                case '港澳通行证':
                    type = '13'
                    break;

                case '台湾居民来往大陆通行证':
                    type = '14'
                    break;

                case '外国人永久居留身份证':
                    type = '15'
                    break;

                case '临时身份证':
                    type = '16'
                    break;
            }
            break;

        case '批改资料':
            switch (type2) {
                case '批改申请书':
                    type = '0';
                    break;

                case '批单':
                    type = '1';
                    break;

                case '保单正本':
                    type = '2';
                    break;

                case '保险发票':
                    type = '3';
                    break;

                case '保卡':
                    type = '4';
                    break;

                case '标志':
                    type = '5';
                    break;

                case '报废声明':
                    type = '6';
                    break;
                case '放弃权益声明':
                    type = '7';
                    break;

                case '投保人备案书':
                    type = '8';
                    break;

                case '遗失声明':
                    type = '9';
                    break;
            }
            break;

        case '双录证明':
            switch (type2) {
                case '代办人身份证明原件正、反面照片':
                    type = '0'
                    break;

                case '保险公司或中介机构销售人员执业证件':
                    type = '1'
                    break;

                case '投保人签署相关文件时的照片':
                    type = '2'
                    break;

                case '代办人签署相关文件时的照片':
                    type = '3'
                    break;

                case '销售人员手持执业证与代办人的正面合影':
                    type = '4'
                    break;

                case '加盖公章的单位委托书与投保人证件原件（或复印件加盖公章）的合影':
                    type = '5'
                    break;

                case '其它':
                    type = '6'
                    break;
            }
            break;

        case '被保险人身份证明':
            switch (type2) {
                case '驾驶证':
                    type = '0'
                    break;

                case '身份证':
                    type = '1'
                    break;

                case '组织机构代码证':
                    type = '2'
                    break;

                case '税务登记证':
                    type = '3'
                    break;

                case '统一社会信用代码':
                    type = '4'
                    break;

                case '港澳台居民居住证':
                    type = '5'
                    break;

                case '营业执照':
                    type = '6'
                    break;

                case '居民户口簿':
                    type = '7'
                    break;

                case '港澳居民来往内地通行证':
                    type = '8'
                    break;

                case '护照':
                    type = '9'
                    break;

                case '暂住证/居住证':
                    type = '10'
                    break;

                case '军官证':
                    type = '11'
                    break;

                case '其它':
                    type = '12'
                    break;

                case '港澳通行证':
                    type = '13'
                    break;

                case '台湾居民来往大陆通行证':
                    type = '14'
                    break;

                case '外国人永久居留身份证':
                    type = '15'
                    break;

                case '临时身份证':
                    type = '16'
                    break;
            }
            break;


        case '电子单证PDF':
            switch (type2) {
                case '投保单PDF':
                    type = '0'
                    break;

                case '浮动告知单PDF':
                    type = '1'
                    break;

                case '投保单PDF(含签章)':
                    type = '2'
                    break;

                case '浮动告知单PDF(含签章)':
                    type = '3'
                    break;

                case '免责声明书PDF(含签章)':
                    type = '4'
                    break;

                case '客户实时照片':
                    type = '5'
                    break;

                case '投保提示书PDF（含签章）':
                    type = '6'
                    break;

                case 'IMCS专用电子投保单告知单合并版':
                    type = '7'
                    break;

            }
            break;

        case '保单遗失证明书PDF':
            switch (type2) {
                case '保单遗失证明书PDF':
                    type = '0'
                    break;

                case '保单遗失证明书PDF(含签章)':
                    type = '1'
                    break;
            }
            break;

        case '本地使用证明':
            switch (type2) {
                case '新车购车发票':
                    type = '0'
                    break;

                case '消费发票':
                    type = '1'
                    break;

                case '标的行驶证':
                    type = '2'
                    break;

                case '车主港澳台居民居住证':
                    type = '3'
                    break;

                case '被保人港澳台居民居住证':
                    type = '4'
                    break;

                case '机动车辆登记证书':
                    type = '5'
                    break;

                case '车主营业执照':
                    type = '6'
                    break;

                case '车主统一社会信用代码证':
                    type = '7'
                    break;

                case '车主居住证':
                    type = '8'
                    break;

                case '车主身份证':
                    type = '9'
                    break;

                case '车主社保卡':
                    type = '10'
                    break;

                case '车主房产证':
                    type = '11'
                    break;

                case '被保险人居住证':
                    type = '12'
                    break;

                case '其它':
                    type = '13'
                    break;

                case '被保险人身份证':
                    type = '14'
                    break;

                case '被保险人房产证':
                    type = '15'
                    break;

                case '被保险人社保卡':
                    type = '16'
                    break;
            }
            break;

        case '投车关系证明':
            switch (type2) {
                case '户口本':
                    type = '1'
                    break;

                case '结婚证':
                    type = '2'
                    break;

                case '营业执照':
                    type = '3'
                    break;

                case '其他':
                    type = '4'
                    break;

            }
            break;

        case '车主身份证明':
            switch (type2) {
                case '驾驶证':
                    type = '0'
                    break;

                case '身份证':
                    type = '1'
                    break;

                case '组织机构代码证':
                    type = '2'
                    break;

                case '税务登记证':
                    type = '3'
                    break;

                case '统一社会信用代码':
                    type = '4'
                    break;

                case '港澳台居民居住证':
                    type = '5'
                    break;

                case '营业执照':
                    type = '6'
                    break;

                case '居民户口簿':
                    type = '7'
                    break;

                case '港澳居民来往内地通行证':
                    type = '8'
                    break;

                case '护照':
                    type = '9'
                    break;

                case '暂住证/居住证':
                    type = '10'
                    break;

                case '军官证':
                    type = '11'
                    break;

                case '其它':
                    type = '12'
                    break;

                case '港澳通行证':
                    type = '13'
                    break;

                case '台湾居民来往大陆通行证':
                    type = '14'
                    break;

                case '外国人永久居留身份证':
                    type = '15'
                    break;

                case '临时身份证':
                    type = '16'
                    break;
            }
            break;

        case '标的证明':
            switch (type2) {
                case '机动车销售统一发票':
                    type = '0'
                    break;

                case '机动车辆登记证书':
                    type = '1'
                    break;

                case '机动车整车出厂合格证':
                    type = '2'
                    break;

                case '行驶证':
                    type = '3'
                    break;

                case '关单（货物进口证明书）':
                    type = '4'
                    break;

                case '二手车交易发票':
                    type = '5'
                    break;

                case '其它':
                    type = '6'
                    break;

                case '新增设备清单或发票':
                    type = '7'
                    break;

            }
            break;

        case '驾驶证明':
            switch (type2) {
                case '驾驶证':
                    type = '0'
                    break;

                case '其它':
                    type = '1'
                    break;
            }
            break;

        case '投保申请书':
            switch (type2) {
                case '投保单':
                    type = '0'
                    break;

                case '投保确认书（广东、佛山、东莞独有）':
                    type = '1'
                    break;

                case '销售事项确认书（广东、佛山、东莞独有)':
                    type = '2'
                    break;

                case '车辆损失险保险金额确认书（北京独有）':
                    type = '3'
                    break;

                case '其它':
                    type = '4'
                    break;

            }
            break;

        case '车船税证明':
            switch (type2) {
                case '完税凭证':
                    type = '0'
                    break;

                case '减免税证明':
                    type = '1'
                    break;

                case '其它':
                    type = '2'
                    break;
            }
            break;

        case '费率因子证明':
            switch (type2) {
                case '无赔款证明':
                    type = '0'
                    break;

                case '无违章证明':
                    type = '1'
                    break;

                case '其它':
                    type = '2'
                    break;

            }
            break;

        case '其他证明':
            switch (type2) {
                case '上年商业险保单':
                    type = '0'
                    break;

                case '跨省投保系数使用证明':
                    type = '1'
                    break;

                case '挂靠证明':
                    type = '2'
                    break;

                case '车辆租赁合同':
                    type = '3'
                    break;

                case '原投保人人证合影':
                    type = '4'
                    break;

                case '车主人证合影':
                    type = '5'
                    break;

                case '其它':
                    type = '6'
                    break;
            }
            break;
    }
    return type
}

function sleep(timeout) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve()
        }, timeout);
    })
}
exports.UploadPic = UploadPic