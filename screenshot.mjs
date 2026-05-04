import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const url = process.argv[2] || 'http://localhost:3000';
const label = process.argv[3] || '';

const screenshotsDir = path.join(process.cwd(), 'temporary screenshots');

// Create directory if it doesn't exist
if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
}

// Find the next available screenshot number
let screenshotNum = 1;
while (fs.existsSync(path.join(screenshotsDir, `screenshot-${screenshotNum}${label ? '-' + label : ''}.png`))) {
    screenshotNum++;
}

const filename = `screenshot-${screenshotNum}${label ? '-' + label : ''}.png`;
const filepath = path.join(screenshotsDir, filename);

(async () => {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    // Set viewport size
    await page.setViewport({ width: 1920, height: 1080 });

    await page.goto(url, { waitUntil: 'networkidle0' });

    await page.screenshot({ path: filepath, fullPage: false });

    await browser.close();

    console.log(`Screenshot saved: ${filepath}`);
})();
