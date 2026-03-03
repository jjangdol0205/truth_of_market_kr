const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');
const xmlJs = require('xml-js');
require('dotenv').config({ path: '.env.local' });

const API_KEY = process.env.DART_API_KEY;

if (!API_KEY) {
    console.error("Error: DART_API_KEY is not defined in .env.local");
    process.exit(1);
}

const url = `https://opendart.fss.or.kr/api/corpCode.xml?crtfc_key=${API_KEY}`;
const jsonDest = path.join(__dirname, '..', 'utils', 'dart_codes.json');

async function downloadAndExtract() {
    console.log("Fetching DART CorpCodes...");
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
        }

        // Check if the response is JSON (meaning it's an API error)
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
            const errorJson = await response.json();
            console.error("DART API Error returned:", errorJson);
            if (errorJson.message) {
                console.log("Error Message:", errorJson.message);
            }
            process.exit(1);
        }

        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        console.log("Extracting Zip in memory...");
        const zip = new AdmZip(buffer);
        const zipEntries = zip.getEntries();
        const xmlEntry = zipEntries.find(entry => entry.entryName.toUpperCase() === 'CORPCODE.XML');

        if (!xmlEntry) {
            throw new Error("CORPCODE.xml not found in the downloaded zip.");
        }

        const xmlData = xmlEntry.getData().toString('utf8');
        console.log("Parsing XML to JSON...");

        const result = xmlJs.xml2js(xmlData, { compact: true, spaces: 0 });
        const list = result.result.list;
        const output = {};

        let stockCounter = 0;

        list.forEach(item => {
            if (!item.corp_code || !item.corp_code._text) return;
            const corpCode = item.corp_code._text;
            const corpName = item.corp_name && item.corp_name._text ? item.corp_name._text : null;
            const stockCode = item.stock_code && item.stock_code._text ? item.stock_code._text.trim() : null;

            if (corpName) {
                output[corpName] = corpCode;
            }

            if (stockCode && stockCode.length >= 6) {
                output[stockCode] = corpCode;
                stockCounter++;
            }
        });

        fs.writeFileSync(jsonDest, JSON.stringify(output), 'utf8');
        console.log(`Saved ${Object.keys(output).length} total mappings to dart_codes.json!`);
        console.log(`Included ${stockCounter} listed stock tickers.`);

    } catch (err) {
        console.error("Error during process:", err);
    }
}

downloadAndExtract();
