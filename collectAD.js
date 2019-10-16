const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
    const browser = await puppeteer.launch({
        headless: false,
        slowMo: 50,

    });
    const page = await browser.newPage();
    await page.goto('https://');

    const ads = [];
    const sayfaSayisi = await page.evaluate(() => {
        let sayfaSayisi = document.querySelector("#searchResultsSearchForm > div > div.searchResultsRight > div.mtmdef.pageNavigator.pvdef.phdef > p").innerText;
        sayfaSayisi = sayfaSayisi.split(" ");
        return sayfaSayisi[1];
    });

    for (let j = 0; j < sayfaSayisi; j++) {
        const sayfadakiIlanSayisi = await page.evaluate(() => {
            return document.querySelectorAll(`#searchResultsTable > tbody > tr`).length;
        });
        for (let i = 1; i <= sayfadakiIlanSayisi; i++) {
            if (i == 4) {
                continue;
            } else if (i == 5) {
                continue;
            } else {
                const ad = await page.evaluate((i) => {
                    const baslik = document.querySelector(`#searchResultsTable > tbody > tr:nth-child(${i}) > td:nth-child(3)`).innerText;
                    const model = document.querySelector(`#searchResultsTable > tbody > tr:nth-child(${i}) > td:nth-child(2)`).innerText;
                    const yil = document.querySelector(`#searchResultsTable > tbody > tr:nth-child(${i}) > td:nth-child(4)`).innerText;
                    const km = document.querySelector(`#searchResultsTable > tbody > tr:nth-child(${i}) > td:nth-child(5)`).innerText;
                    const renk = document.querySelector(`#searchResultsTable > tbody > tr:nth-child(${i}) > td:nth-child(6)`).innerText;
                    const fiyat = document.querySelector(`#searchResultsTable > tbody > tr:nth-child(${i}) > td:nth-child(7)`).innerText;
                    const tarih = document.querySelector(`#searchResultsTable > tbody > tr:nth-child(${i}) > td:nth-child(8)`).innerText;
                    const yer = document.querySelector(`#searchResultsTable > tbody > tr:nth-child(${i}) > td:nth-child(9)`).innerText;

                    const ad = {
                        "baslik": baslik,
                        "model": model,
                        "yil": yil,
                        "km": km,
                        "renk": renk,
                        "fiyat": fiyat,
                        "tarih": tarih,
                        "yer": yer
                    };
                    return ad;
                }, i);
                ads.push(ad);
            }
        }
        await page.evaluate(() => {
            let a = document.querySelectorAll("#searchResultsSearchForm > div > div.searchResultsRight > div.mtmdef.pageNavigator.pvdef.phdef > div.pageNavTable > ul > li > a.prevNextBut").length
            document.querySelectorAll("#searchResultsSearchForm > div > div.searchResultsRight > div.mtmdef.pageNavigator.pvdef.phdef > div.pageNavTable > ul > li > a.prevNextBut")[a - 1].click();
        });
        await page.waitForNavigation();
    }

    const wAds = JSON.stringify(ads);

    fs.writeFile("./ilanlar.json", wAds, (err) => {
        if (err) {
            console.log(err);
        } else {
            console.log("File writing done!");
        }
    });
    browser.close();
})()