// @ts-check
const { chromium } = require('playwright-chromium')

const shops = [
    {
        vendor: 'Microsoft',
        url: 'https://www.xbox.com/es-es/configure/8WJ714N3RBTL',
        checkStock: async ({page}) =>
        {
            const content = await page.textContent('[aria-label="Finalizar la compra del pack"]')
            return content.includes('Sin existencias') === false
        }
    },
    {
        vendor: 'FNAC',
        url: 'https://www.fnac.es/Consola-Xbox-Series-X-1TB-Negro-Videoconsola-Consola/a7732201',
        checkStock: async ({page}) =>
        {
            const content = await page.$$('.f-buyBox__availabilityStatus--unavailable')
            return content.length !== 0
        }
    },
    ]


module.exports = async function (context, myTimer) {

    const browser = await chromium.launch({ headless: true })
    const available = []

    for (const shop of shops){
        const {checkStock,vendor,url} = shop
        const page = await browser.newPage()
        await page.goto(url)
        const hasStock = await checkStock({page})
        if (hasStock) available.push(vendor)


        const log = `${vendor}: ${hasStock ? 'HAS STOCK!!!! 🤩' : 'Out of Stock 🥲'}`
        context.log(log)

        
        //await page.screenshot({path: `screenshots/${vendor}.png`})
        await page.close()
    }

    const availableOn = available.length > 0
    ? `Disponible en: ${available.join(', ')}`
    : 'No hay stock 😢'

    context.res = {
        body:{
            availableOn
        },
        Headers:{
            'Content-Type': 'application/json'
        }
    }

    await browser.close()
}