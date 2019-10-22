const puppeteer = require('puppeteer');
const fs = require('fs');
const mongoose = require('mongoose');
const ilanSchema = require('./ilan.model');

mongoose.connect('mongodb+srv://admin:admin@carcheck-3fizi.mongodb.net/test?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});
mongoose.set('useCreateIndex', true);

(async () => {
    const browser = await puppeteer.launch({
        headless: false,
        slowMo: 50,

    });
    const page = await browser.newPage();
    await page.goto('');

    const ads = [];
    const ilanSayisi = await page.evaluate(() => {
        let sonuc = document.querySelector("#searchResultsSearchForm > div > div.searchResultsRight > div.relativeContainer > div.infoSearchResults > div > div.result-text > span").innerText;
        let sayi = sonuc.split(" ");
        sayi = sayi[0].replace(".", "");
        return sayi;
    });
    //console.log("ilanSayisi: ", ilanSayisi);

    let sayfaSayisi = 1;
    if (ilanSayisi > 20) {
        sayfaSayisi = await page.evaluate(() => {
            let sayfaSayisi = document.querySelector("#searchResultsSearchForm > div > div.searchResultsRight > div.mtmdef.pageNavigator.pvdef.phdef > p").innerText;
            sayfaSayisi = sayfaSayisi.split(" ");
            return sayfaSayisi[1];
        });
        //console.log("sayfaSayisi: ", sayfaSayisi);

    }

    for (let j = 0; j < sayfaSayisi; j++) {
        const sayfadakiIlanSayisi = await page.evaluate(() => {
            return document.querySelectorAll(`#searchResultsTable > tbody > tr`).length;
        });
        //console.log("sayfadakiIlanSayisi: ", sayfadakiIlanSayisi);

        for (let i = 1; i <= sayfadakiIlanSayisi; i++) {
            if (i == 4) {
                continue;
            } else if (i == 5) {
                continue;
            } else {
                const ad = await page.evaluate((i) => {
                    const ilanNo = document.querySelector(`#searchResultsTable > tbody > tr:nth-child(${i})`).attributes["data-id"].value;
                    const baslik = document.querySelector(`#searchResultsTable > tbody > tr:nth-child(${i}) > td:nth-child(3)`).innerText;
                    const model = document.querySelector(`#searchResultsTable > tbody > tr:nth-child(${i}) > td:nth-child(2)`).innerText;
                    const yil = document.querySelector(`#searchResultsTable > tbody > tr:nth-child(${i}) > td:nth-child(4)`).innerText;
                    const km = document.querySelector(`#searchResultsTable > tbody > tr:nth-child(${i}) > td:nth-child(5)`).innerText;
                    const renk = document.querySelector(`#searchResultsTable > tbody > tr:nth-child(${i}) > td:nth-child(6)`).innerText;
                    const fiyat = document.querySelector(`#searchResultsTable > tbody > tr:nth-child(${i}) > td:nth-child(7)`).innerText;
                    const tarih = document.querySelector(`#searchResultsTable > tbody > tr:nth-child(${i}) > td:nth-child(8)`).innerText;
                    const yer = document.querySelector(`#searchResultsTable > tbody > tr:nth-child(${i}) > td:nth-child(9)`).innerText;
                    const link = document.querySelector(`#searchResultsTable > tbody > tr:nth-child(${i}) > td.searchResultsTitleValue > a.classifiedTitle`).href;

                    //ilan no ve link ekle
                    const ad = {
                        "ilanNo": ilanNo,
                        "baslik": baslik,
                        "model": model,
                        "yil": yil,
                        "km": km,
                        "renk": renk,
                        "fiyat": fiyat,
                        "tarih": tarih,
                        "yer": yer,
                        "link": link
                    };
                    return ad;
                }, i);
                //console.log("ad: ", ad);

                ads.push(ad);
            }
        }
        if (sayfaSayisi > 1) {
            await page.evaluate(() => {
                let a = document.querySelectorAll("#searchResultsSearchForm > div > div.searchResultsRight > div.mtmdef.pageNavigator.pvdef.phdef > div.pageNavTable > ul > li > a.prevNextBut").length
                document.querySelectorAll("#searchResultsSearchForm > div > div.searchResultsRight > div.mtmdef.pageNavigator.pvdef.phdef > div.pageNavTable > ul > li > a.prevNextBut")[a - 1].click();
            });
            await page.waitForNavigation();
        }

    }
    //console.log(ads);

    await ilanSchema.create(ads, (err, res) => {
        if (err) throw err
        console.log(res);
    });

    browser.close();
})()