const puppeteer = require('puppeteer-core');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: String.raw`C:\Program Files\Google\Chrome\Application\chrome.exe`,
    headless: 'new',
  });
  const page = await browser.newPage();
  const htmlPath = path.resolve('C:/Users/window10/AppData/Local/Temp/claude/C--xampp-htdocs-Project-Saas-Dashboard/05368e4f-9015-4ef4-8f00-331ff0b7c171/scratchpad/google-ads-api-design-doc.html');
  await page.goto('file:///' + htmlPath.replace(/\\/g, '/'), { waitUntil: 'networkidle0' });
  await page.pdf({
    path: path.resolve('C:/Users/window10/Downloads/account creation/LaunchiGo_Google_Ads_API_Design_Document.pdf'),
    format: 'A4',
    printBackground: true,
    margin: { top: '20px', bottom: '20px', left: '20px', right: '20px' },
  });
  console.log('PDF saved!');
  await browser.close();
})();
