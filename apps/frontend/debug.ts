import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
  page.on('pageerror', error => console.log('BROWSER ERROR:', error.message));
  
  await page.goto('http://localhost:3001');
  console.log('Page loaded');
  
  const loginBtn = page.getByRole('button', { name: /Googleでログイン/ });
  const isVisible = await loginBtn.isVisible();
  console.log('Button visible?', isVisible);
  
  if (isVisible) {
    console.log('Clicking button...');
    await loginBtn.click();
    console.log('Click executed');
  }
  
  await new Promise(resolve => setTimeout(resolve, 2000));
  await browser.close();
})();
