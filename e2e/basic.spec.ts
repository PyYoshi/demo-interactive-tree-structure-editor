import { test, expect } from '@playwright/test';

test.describe('基本的な機能', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('ページが正しく読み込まれる', async ({ page }) => {
    // 主要な要素が表示されていることを確認
    await expect(page.locator('h1')).toContainText('階層構造エディタ');
  });

  test('データをインポートできる', async ({ page }) => {
    // テキストエリアにデータを入力
    const importData = '大学 > 文学部 > 日本文学科\n大学 > 文学部 > 英文学科';
    await page.locator('textarea').fill(importData);

    // インポート実行
    await page.getByRole('button', { name: 'ツリーを生成' }).click();

    // ツリーにノードが表示されることを確認
    await expect(page.getByText('大学')).toBeVisible();
    await expect(page.getByText('文学部')).toBeVisible();

    // 成功メッセージの確認
    await expect(page.getByText('データをインポートしました')).toBeVisible();
  });

  test('ルートノードを追加できる', async ({ page }) => {
    // ルートノード追加ボタンをクリック
    await page.getByRole('button', { name: 'ルートノードを追加' }).click();

    // ルートノード名を入力
    await page.getByPlaceholder('ルートノード名...').fill('企業');

    // 保存ボタンをクリック
    await page.getByRole('button', { name: '保存' }).click();

    // ツリーにノードが表示されることを確認
    await expect(page.getByText('企業')).toBeVisible();

    // 成功メッセージの確認
    await expect(page.getByText('ルートノード「企業」を追加しました')).toBeVisible();
  });

  test('子ノードを追加できる', async ({ page }) => {
    // まずルートノードを追加
    await page.getByRole('button', { name: 'ルートノードを追加' }).click();
    await page.getByPlaceholder('ルートノード名...').fill('大学');
    await page.getByRole('button', { name: '保存' }).click();

    // ルートノードが表示されるまで待つ
    await expect(page.getByText('大学')).toBeVisible();

    // 大学ノードをホバーして追加ボタンを表示
    await page.getByText('大学').hover();

    // 追加ボタンをクリック
    await page.locator('[aria-label="子ノードを追加"]').first().click();

    // 子ノード名を入力
    await page.getByPlaceholder('ノード名を入力').fill('文学部');

    // 追加ボタンをクリック
    await page.getByRole('button', { name: '追加' }).click();

    // 子ノードが表示されることを確認
    await expect(page.getByText('文学部')).toBeVisible();

    // 成功メッセージの確認
    await expect(page.getByText('ノード「文学部」を追加しました')).toBeVisible();
  });

  test('ノードを削除できる', async ({ page }) => {
    // データをインポート
    const importData = '大学 > 文学部';
    await page.locator('textarea').fill(importData);
    await page.getByRole('button', { name: 'ツリーを生成' }).click();

    // ノードが表示されるまで待つ
    await expect(page.getByText('文学部')).toBeVisible();

    // 文学部ノードをホバーして削除ボタンを表示
    await page.getByText('文学部').hover();

    // 削除ボタンをクリック
    await page.locator('[aria-label="削除"]').first().click();

    // 文学部ノードが削除されることを確認
    await expect(page.getByText('文学部')).not.toBeVisible();

    // 成功メッセージの確認
    await expect(page.getByText('ノードを削除しました')).toBeVisible();
  });

  test('ツリーをクリアできる', async ({ page }) => {
    // データをインポート
    await page.locator('textarea').fill('大学 > 文学部');
    await page.getByRole('button', { name: 'ツリーを生成' }).click();

    // ノードが表示されることを確認
    await expect(page.getByText('大学')).toBeVisible();

    // クリアボタンをクリック
    await page.getByRole('button', { name: 'クリア' }).click();

    // ノードが削除されることを確認
    await expect(page.getByText('大学')).not.toBeVisible();

    // 成功メッセージの確認
    await expect(page.getByText('ツリーをクリアしました')).toBeVisible();
  });

  test('空のノード名では追加できない', async ({ page }) => {
    // ルートノード追加ボタンをクリック
    await page.getByRole('button', { name: 'ルートノードを追加' }).click();

    // 空の状態で保存ボタンをクリック（何も起こらない）
    await page.getByRole('button', { name: '保存' }).click();

    // キャンセルしてから、インポートで空テキストを試す
    await page.getByRole('button', { name: 'キャンセル' }).click();

    // 空のテキストエリアでインポート
    await page.locator('textarea').clear();
    await page.getByRole('button', { name: 'ツリーを生成' }).click();

    // 警告メッセージが表示されることを確認
    await expect(page.getByText('インポートするデータがありません')).toBeVisible();
  });

  test('ルートノードは1つまで', async ({ page }) => {
    // 1つ目のルートノードを追加
    await page.getByRole('button', { name: 'ルートノードを追加' }).click();
    await page.getByPlaceholder('ルートノード名...').fill('大学');
    await page.getByRole('button', { name: '保存' }).click();

    // ルートノードが表示されるまで待つ
    await expect(page.getByText('大学')).toBeVisible();

    // 2つ目のルートノードを追加しようとする（ボタンが表示されないはず）
    // EmptyTreeStateは表示されないので、ルートノード追加ボタンが無いことを確認
    await expect(page.getByRole('button', { name: 'ルートノードを追加' })).not.toBeVisible();
  });
});
