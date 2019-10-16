const puppeteer = require('puppeteer');
const mailer = require('nodemailer');
const fs = require('fs');

(async () => {
    setInterval(async () => {
        let eskiSayi = fs.readFileSync("./output.txt");

        const browser = await puppeteer.launch({
            headless: false
        });
        const page = await browser.newPage();
        await page.setRequestInterception(true);
        page.on('request', (request) => {
            if (['image', 'stylesheet', 'font', 'script'].indexOf(request.resourceType()) !== -1) {
                request.abort();
            } else {
                request.continue();
            }
        });

        await page.goto('https://');

        await page.waitForSelector("#searchResultsSearchForm > div > div.searchResultsRight > div.relativeContainer > div.infoSearchResults > div > div.result-text > span");
        let sayi = await page.evaluate(() => {
            let sonuc = document.querySelector("#searchResultsSearchForm > div > div.searchResultsRight > div.relativeContainer > div.infoSearchResults > div > div.result-text > span").innerText;
            let sayi = sonuc.split(" ");
            return sayi[0];
        });
        await browser.close();

        if (eskiSayi < sayi) {
            console.log("İlan sayısı değişti: " + sayi + " /" + eskiSayi);
            //yeni ilanın bilgileri alınacak ve mail atılacak
        } else {
            console.log("İlan sayısı aynı: " + sayi + " /" + eskiSayi);
        }
        fs.writeFile("./output.txt", sayi, err => {});

    }, 10 * 1000);
})();