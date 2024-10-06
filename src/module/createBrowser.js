const { connect } = require("puppeteer-real-browser")
const chromium = require('@sparticuz/chromium-min')
const puppeteer = require('puppeteer-core')
const path = require('path')

// async function createBrowser() {
//     try {
//         if (global.finished == true) return

//         global.browser = null

//         // console.log('Launching the browser...');

//         const { browser } = await connect({
//             headless: false,
//             turnstile: true,
//             connectOption: { defaultViewport: null },
//             disableXvfb: false,
//         })

//         // console.log('Browser launched');

//         global.browser = browser;

//         browser.on('disconnected', async () => {
//             if (global.finished == true) return
//             console.log('Browser disconnected');
//             await new Promise(resolve => setTimeout(resolve, 3000));
//             await createBrowser();
//         })

//     } catch (e) {
//         console.log(e.message);
//         if (global.finished == true) return
//         await new Promise(resolve => setTimeout(resolve, 3000));
//         await createBrowser();
//     }
// }
async function createBrowser() {
    try {
        if (global.finished === true) return;

        global.browser = null;

        console.log('Launching the browser...');

        // Launch Puppeteer with chromium-min
        global.browser = await puppeteer.launch({
            args: [...chromium.args, '--hide-scrollbars', '--disable-web-security'],
            defaultViewport: chromium.defaultViewport,
            executablePath: process.env.NODE_ENV === 'production'
                ? await chromium.executablePath(`https://github.com/Sparticuz/chromium/releases/download/v127.0.0/chromium-v127.0.0-pack.tar`)
                : path.resolve('C:/Program Files/Google/Chrome/Application/chrome.exe'), // Use local Chrome in dev
            headless: chromium.headless,  // Set headless to false to see the browser
            ignoreHTTPSErrors: true,  // Ignore HTTPS errors
            turnstile: true,
            disableXvfb: false
        });

        console.log('Browser launched');

        // Handle browser disconnection
        global.browser.on('disconnected', async () => {
            if (global.finished === true) return;
            console.log('Browser disconnected');
            await new Promise(resolve => setTimeout(resolve, 3000));
            await createBrowser();
        });

    } catch (e) {
        console.error('Error launching browser:', e.message);
        if (global.finished === true) return;
        await new Promise(resolve => setTimeout(resolve, 3000));
        await createBrowser();
    }
}
createBrowser()