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
    await expect(page.getByText('データをエクスポート')).toBeVisible();

    // エクスポートされたテキストが表示されることを確認
    await expect(page.getByText('大学 > 文学部 > 日本文学科')).toBeVisible();
  });

  test('エクスポートモーダルを閉じられる', async ({ page }) => {
    // モーダルを開く
    await page.getByRole('button', { name: 'ツリーをエクスポート' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();

    // 閉じるボタンをクリック
    await page.getByRole('button', { name: '閉じる' }).click();

    // モーダルが閉じることを確認
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });

  test('階層形式でエクスポートできる', async ({ page }) => {
    // モーダルを開く
    await page.getByRole('button', { name: 'ツリーをエクスポート' }).click();

    // 階層形式を選択
    await page.getByRole('radio', { name: '階層形式' }).click();

    // 階層形式のテキストが表示されることを確認
    const textarea = page.locator('textarea[readonly]');
    const content = await textarea.inputValue();

    // インデントされた階層構造であることを確認
    expect(content).toContain('大学');
    expect(content).toContain('  文学部');
    expect(content).toContain('    日本文学科');
    expect(content).toContain('    英文学科');
    expect(content).toContain('  理学部');
    expect(content).toContain('    数学科');
  });

  test('パス形式でエクスポートできる', async ({ page }) => {
    // モーダルを開く
    await page.getByRole('button', { name: 'ツリーをエクスポート' }).click();

    // パス形式を選択（デフォルト）
    await page.getByRole('radio', { name: 'パス形式' }).click();

    // パス形式のテキストが表示されることを確認
    const textarea = page.locator('textarea[readonly]');
    const content = await textarea.inputValue();

    // パス形式（> で区切られた）であることを確認
    expect(content).toContain('大学 > 文学部 > 日本文学科');
    expect(content).toContain('大学 > 文学部 > 英文学科');
    expect(content).toContain('大学 > 理学部 > 数学科');
  });

  test('JSON形式でエクスポートできる', async ({ page }) => {
    // モーダルを開く
    await page.getByRole('button', { name: 'ツリーをエクスポート' }).click();

    // JSON形式を選択
    await page.getByRole('radio', { name: 'JSON形式' }).click();

    // JSON形式のテキストが表示されることを確認
    const textarea = page.locator('textarea[readonly]');
    const content = await textarea.inputValue();

    // 有効なJSONであることを確認
    expect(() => JSON.parse(content)).not.toThrow();

    // JSON構造の確認
    const json = JSON.parse(content);
    expect(json).toHaveLength(1);
    expect(json[0].name).toBe('大学');
    expect(json[0].children).toHaveLength(2);
  });

  test('クリップボードにコピーできる', async ({ page }) => {
    // クリップボードへの書き込み権限を付与
    await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);

    // モーダルを開く
    await page.getByRole('button', { name: 'ツリーをエクスポート' }).click();

    // コピーボタンをクリック
    await page.getByRole('button', { name: 'クリップボードにコピー' }).click();

    // コピー成功メッセージが表示されることを確認
    await expect(page.getByText('コピーしました！')).toBeVisible();

    // クリップボードの内容を確認
    const clipboardContent = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboardContent).toContain('大学 > 文学部 > 日本文学科');
  });

  test('空のツリーではエクスポートボタンが無効', async ({ page }) => {
    // ツリーをクリア
    await page.getByRole('button', { name: 'クリア' }).click();

    // エクスポートボタンが無効であることを確認
    const exportButton = page.getByRole('button', { name: 'ツリーをエクスポート' });
    await expect(exportButton).toBeDisabled();
  });

  test('フォーマットを切り替えるとテキストが更新される', async ({ page }) => {
    // モーダルを開く
    await page.getByRole('button', { name: 'ツリーをエクスポート' }).click();

    const textarea = page.locator('textarea[readonly]');

    // パス形式のテキストを取得
    await page.getByRole('radio', { name: 'パス形式' }).click();
    const pathContent = await textarea.inputValue();

    // 階層形式に切り替え
    await page.getByRole('radio', { name: '階層形式' }).click();
    const hierarchyContent = await textarea.inputValue();

    // JSON形式に切り替え
    await page.getByRole('radio', { name: 'JSON形式' }).click();
    const jsonContent = await textarea.inputValue();

    // それぞれ異なる内容であることを確認
    expect(pathContent).not.toBe(hierarchyContent);
    expect(hierarchyContent).not.toBe(jsonContent);
    expect(pathContent).not.toBe(jsonContent);
  });
});
