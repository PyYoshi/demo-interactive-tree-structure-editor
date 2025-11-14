import { test, expect } from '@playwright/test';

test('デバッグ: ページロードとコンソールエラーを確認', async ({ page }) => {
  const consoleMessages: string[] = [];
  const pageErrors: string[] = [];

  // コンソールメッセージをキャプチャ
  page.on('console', msg => {
    consoleMessages.push(`[${msg.type()}] ${msg.text()}`);
  });

  // ページエラーをキャプチャ
  page.on('pageerror', error => {
    pageErrors.push(error.message);
  });

  // ページを開く
  await page.goto('/');

  // 少し待つ
  await page.waitForTimeout(3000);

  // ページのHTMLを取得
  const html = await page.content();
  console.log('=== PAGE HTML (first 1000 chars) ===');
  console.log(html.substring(0, 1000));

  // h1要素を確認
  const h1 = await page.locator('h1').textContent().catch(() => null);
  console.log('\n=== H1 CONTENT ===');
  console.log(h1);

  // コンソールメッセージを出力
  console.log('\n=== CONSOLE MESSAGES ===');
  consoleMessages.forEach(msg => console.log(msg));

  // ページエラーを出力
  console.log('\n=== PAGE ERRORS ===');
  pageErrors.forEach(err => console.log(err));

  // rootエレメントの内容を確認
  const rootContent = await page.locator('#root').innerHTML().catch(() => null);
  console.log('\n=== ROOT ELEMENT CONTENT ===');
  console.log(rootContent);
});
