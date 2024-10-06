function solveTurnstileMin({ url, proxy }) {
    return new Promise(async (resolve, reject) => {

        if (!url) return reject('Missing url parameter')

        const context = await global.browser.createBrowserContext().catch(() => null);

        if (!context) return reject('Failed to create browser context')

        let isResolved = false
        const { proxyRequest } = await import('puppeteer-proxy')
        const { RequestInterceptionManager } = await import('puppeteer-intercept-and-modify-requests')

        var cl = setTimeout(async () => {
            if (!isResolved) {
                await context.close()
                reject("Timeout Error")
            }
        }, (global.timeOut || 60000))

        try {
            const page = await context.newPage();

            const client = await page.target().createCDPSession()
            const interceptManager = new RequestInterceptionManager(client)

            await page.setRequestInterception(true);
            page.on('request', async (request) => {
                try {
                    if (proxy) {
                        await proxyRequest({
                            page,
                            proxyUrl: `http://${proxy.username ? `${proxy.username}:${proxy.password}@` : ""}${proxy.host}:${proxy.port}`,
                            request,
                        });
                    } else {
                        request.continue()
                    }
                } catch (e) { }
            });

            await interceptManager.intercept(
                {
                    urlPattern: url,
                    resourceType: 'Document',
                    modifyResponse({ body }) {
                        return {
                            body: String(body).replace('</body>', String(require('fs').readFileSync('./src/data/callback.html')) + '</body>')
                        }
                    },
                }
            )
            await page.goto(url, {
                waitUntil: 'domcontentloaded'
            })

            await page.waitForSelector('[name="cf-response"]', {
                timeout: 60000
            })
            const token = await page.evaluate(() => {
                try {
                    return document.querySelector('[name="cf-response"]').value
                } catch (e) {
                    return null
                }
            })
            isResolved = true
            clearInterval(cl)
            await context.close()
            if (!token || token.length < 10) return reject('Failed to get token')
            return resolve(token)
        } catch (e) {
            if (!isResolved) {
                await context.close()
                clearInterval(cl)
                reject(e.message)
            }
        }

    })
}
module.exports = solveTurnstileMin