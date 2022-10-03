import {AbstractExchanger} from './AbstractExchanger'
import {DefaultExchanger} from './DefaultExchanger'
import {ExchangeRateManager} from '../remote/ExchangeRateManager'
import {SearchPageExchanger} from './SearchPageExchanger'

const currencies = new Map([
    // 香港
    ['HK', 'HKD'],
    // 台湾
    ['NT','TWD'],
    // 美国
    ['$','USD'],
    // 新加坡
    ['S','SGD'],
    //
])
export const exchangedClassName = 'spe-exchanged'

export type ElementSnap = {
    element: Element,
    readonly textContext: string | null,
    readonly classList: DOMTokenList,
    readonly attributes: NamedNodeMap
}

export class ExchangerManager {

    static instance: ExchangerManager = new ExchangerManager()

    private exchangers: AbstractExchanger[]

    private constructor() {
        this.exchangers = [
            new DefaultExchanger(),
            new SearchPageExchanger()
        ]
    }

    getSelector(): string {
        return this.exchangers
            .map(exchanger => exchanger.getCssSelectors())
            .flat(1)
            .map(selector => `${selector}:not(.${exchangedClassName})`)
            .join(', ')
    }

    async doExchange(elements: NodeListOf<Element>) {
        if (!elements) {
            return
        }
        elements.forEach(element => {
            const elementSnap: ElementSnap = {
                element,
                textContext: element.textContent,
                classList: element.classList,
                attributes: element.attributes
            }
            this.exchangers
                .filter(exchanger => exchanger.match(elementSnap))
                .forEach(exchanger => {

                    ExchangeRateManager.instance
                        .refreshRate()
                        .then(async rateRes => {
                            try {

                                const exchanged = exchanger.doExchange(elementSnap, (currency: string): number => {
                                    // 转换操作
                                    const finalCurrency = currencies.get(currency) || currency
                                    const rate = rateRes.rates.get(finalCurrency)
                                    if (!rate) {
                                        console.log(elementSnap.element)
                                        throw Error(`获取汇率失败：${currency}`)
                                    }
                                    return rate
                                })

                                // 转换后续操作
                                if (exchanged) {
                                    exchanger.afterExchange(elementSnap)
                                }
                            } catch (error: any) {
                                console.log(error)
                            }
                        })
                })
        })
    }
}
