import {main} from './RealMain'
import {CountyCode2CountyInfo} from './county/CountyInfo'
import {SettingManager} from './setting/SettingManager'

(async () => {
    // 目标国家代码，可在此处替换
    const countyCode = SettingManager.instance.setting.countyCode
    const county = CountyCode2CountyInfo.get(countyCode)
    if (!county) {
        throw Error('获取转换后的国家信息失败，国家代码：' + countyCode)
    }
    await main(county)
})()
