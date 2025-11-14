import { test, expect } from '@playwright/test';

test.describe('エクスポート機能', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');

    // テスト用のツリー構造をインポート
    const importData = `大学 > 文学部 > 日本文学科
大学 > 文学部 > 英文学科
大学 > 理学部 > 数学科`;
    await page.locator('textarea').fill(importData);
    await page.getByRole('button', { name: 'ツリーを生成' }).click();

    // ノードが表示されるまで待つ
    await expect(page.getByRole('tree').getByText('日本文学科')).toBeVisible();
  });

  test('エクスポートモーダルを開ける', async ({ page }) => {
    // エクスポートボタンをクリック
    await page.getByRole('button', { name: 'ツリーをエクスポート' }).click();

    // モーダルが表示されることを確認
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByText('エクスポートされたデータ')).toBeVisible();

    // エクスポートされたテキストが表示されることを確認（パス形式）
    const textarea = page.locator('textarea[readonly]');
    const content = await textarea.inputValue();
    expect(content).toContain('大学 > 文学部 > 日本文学科');
  });

  test('エクスポートモーダルを閉じられる', async ({ page }) => {
    // モーダルを開く
    await page.getByRole('button', { name: 'ツリーをエクスポート' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();

    // 閉じるボタンをクリック（「閉じる」テキストのボタンのみ）
    await page.getByRole('button', { name: '閉じる' }).first().click();

    // モーダルが閉じることを確認
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });

  test('クリップボードにコピーできる', async ({ page }) => {
    // クリップボードへの書き込み権限を付与
    await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);

    // モーダルを開く
    await page.getByRole('button', { name: 'ツリーをエクスポート' }).click();

    // コピーボタンをクリック
    await page.getByRole('button', { name: 'コピー' }).click();

    // コピー成功メッセージが表示されることを確認
    await expect(page.getByRole('button', { name: 'コピーしました！' })).toBeVisible();

    // クリップボードの内容を確認
    const clipboardContent = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboardContent).toContain('大学 > 文学部 > 日本文学科');
  });
});
