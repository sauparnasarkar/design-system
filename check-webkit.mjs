import { webkit } from 'playwright';
const browser = await webkit.launch();
const page = await browser.newPage({ viewport: { width: 1400, height: 1400 } });
const errors = [];
page.on('console', (msg) => { if (msg.type() === 'error') errors.push(msg.text()); });
page.on('pageerror', (err) => errors.push('pageerror: ' + err.message));

await page.goto('http://localhost:5173/country-profile', { waitUntil: 'load' });
await page.waitForTimeout(2000);
const rowCount = await page.evaluate(() => document.querySelectorAll('.ag-row').length);
console.log('WebKit rowCount:', rowCount);
await page.screenshot({ path: '/private/tmp/claude-501/-Users-sauparnasarkar-ClaudeWorkspace-climate-emissions-analysis-project/abfdca4f-c1cc-42ac-a28d-73ad9149da98/scratchpad/shots/webkit-keystats.png', fullPage: true });
console.log('ERRORS', JSON.stringify(errors, null, 2));
await browser.close();
