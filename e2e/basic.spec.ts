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
    await expect(page.getByRole('tree').getByText('大学')).toBeVisible();
    await expect(page.getByRole('tree').getByText('文学部')).toBeVisible();

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
    await expect(page.getByRole('tree').getByText('企業')).toBeVisible();

    // 成功メッセージの確認
    await expect(page.getByText('ルートノード「企業」を追加しました')).toBeVisible();
  });

  test('子ノードを追加できる', async ({ page }) => {
    // まずルートノードを追加
    await page.getByRole('button', { name: 'ルートノードを追加' }).click();
    await page.getByPlaceholder('ルートノード名...').fill('大学');
    await page.getByRole('button', { name: '保存' }).click();

    // ルートノードが表示されるまで待つ
    await expect(page.getByRole('tree').getByText('大学')).toBeVisible();

    // 大学ノードをホバーして追加ボタンを表示
    await page.getByRole('tree').getByText('大学').hover();

    // 追加ボタンをクリック
    await page.locator('[aria-label="子ノードを追加"]').first().click();

    // 子ノード名を入力
    await page.getByPlaceholder('新しいノード名...').fill('文学部');

    // 保存ボタンをクリック
    await page.getByRole('button', { name: '保存' }).click();

    // 子ノードが表示されることを確認
    await expect(page.getByRole('tree').getByText('文学部')).toBeVisible();

    // 成功メッセージの確認
    await expect(page.getByText('ノード「文学部」を追加しました')).toBeVisible();
  });

  test('ノードを削除できる', async ({ page }) => {
    // データをインポート
    const importData = '大学 > 文学部';
    await page.locator('textarea').fill(importData);
    await page.getByRole('button', { name: 'ツリーを生成' }).click();

    // ノードが表示されるまで待つ
    await expect(page.getByRole('tree').getByText('文学部')).toBeVisible();

    // 文学部ノードをホバーして削除ボタンを表示
    await page.getByRole('tree').getByText('文学部').hover();

    // 削除ボタンをクリック
    await page.locator('[aria-label="削除"]').first().click();

    // 文学部ノードが削除されることを確認
    await expect(page.getByRole('tree').getByText('文学部')).not.toBeVisible();

    // 成功メッセージの確認
    await expect(page.getByText('ノードを削除しました')).toBeVisible();
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
    await expect(page.getByRole('tree').getByText('大学')).toBeVisible();

    // 2つ目のルートノードを追加しようとする（ボタンが表示されないはず）
    // EmptyTreeStateは表示されないので、ルートノード追加ボタンが無いことを確認
    await expect(page.getByRole('button', { name: 'ルートノードを追加' })).not.toBeVisible();
  });

  test('同一階層に同じ名前のノードを追加できない（子ノード）', async ({ page }) => {
    // まずルートノードを追加
    await page.getByRole('button', { name: 'ルートノードを追加' }).click();
    await page.getByPlaceholder('ルートノード名...').fill('大学');
    await page.getByRole('button', { name: '保存' }).click();

    // ルートノードが表示されるまで待つ
    await expect(page.getByRole('tree').getByText('大学')).toBeVisible();

    // 1つ目の子ノード（文学部）を追加
    await page.getByRole('tree').getByText('大学').hover();
    await page.locator('[aria-label="子ノードを追加"]').first().click();
    await page.getByPlaceholder('新しいノード名...').fill('文学部');
    await page.getByRole('button', { name: '保存' }).click();

    // 子ノードが表示されることを確認
    await expect(page.getByRole('tree').getByText('文学部')).toBeVisible();

    // 同じ階層に同じ名前（文学部）のノードを追加しようとする
    await page.getByRole('tree').getByText('大学').hover();
    await page.locator('[aria-label="子ノードを追加"]').first().click();
    await page.getByPlaceholder('新しいノード名...').fill('文学部');
    await page.getByRole('button', { name: '保存' }).click();

    // エラーメッセージが表示されることを確認
    await expect(page.getByText('同じ名前のノード「文学部」が既に存在します')).toBeVisible();

    // ツリーには1つの文学部しか存在しない
    const bungakubuNodes = page.getByRole('tree').getByText('文学部', { exact: true });
    await expect(bungakubuNodes).toHaveCount(1);
  });

  test('異なる階層であれば同じ名前のノードを追加できる', async ({ page }) => {
    // データをインポート（大学 > 文学部 > 理学部）
    const importData = '大学 > 文学部\n大学 > 理学部';
    await page.locator('textarea').fill(importData);
    await page.getByRole('button', { name: 'ツリーを生成' }).click();

    // ノードが表示されるまで待つ
    await expect(page.getByRole('tree').getByText('文学部')).toBeVisible();
    await expect(page.getByRole('tree').getByText('理学部')).toBeVisible();

    // 理学部のtreeitemを特定して、その中の「子ノードを追加」ボタンをクリック
    const rigakubuTreeitem = page.getByRole('treeitem').filter({ hasText: '理学部' }).filter({ hasNotText: '文学部' });
    await rigakubuTreeitem.hover();
    await rigakubuTreeitem.getByRole('button', { name: '子ノードを追加' }).click();

    // 入力フィールドに「文学部」を入力
    await page.getByPlaceholder('新しいノード名...').fill('文学部');
    await page.getByRole('button', { name: '保存' }).click();

    // 成功メッセージが表示される（異なる階層なので追加できる）
    await expect(page.getByText('ノード「文学部」を追加しました')).toBeVisible();

    // ツリーには2つの「文学部」が存在する（1つは大学の直下、1つは理学部の配下）
    const bungakubuNodes = page.getByRole('tree').getByText('文学部', { exact: true });
    await expect(bungakubuNodes).toHaveCount(2);
  });

  test('空白付きの名前でも重複チェックが機能する', async ({ page }) => {
    // まずルートノードを追加
    await page.getByRole('button', { name: 'ルートノードを追加' }).click();
    await page.getByPlaceholder('ルートノード名...').fill('大学');
    await page.getByRole('button', { name: '保存' }).click();

    // ルートノードが表示されるまで待つ
    await expect(page.getByRole('tree').getByText('大学')).toBeVisible();

    // 1つ目の子ノード（文学部）を追加
    await page.getByRole('tree').getByText('大学').hover();
    await page.locator('[aria-label="子ノードを追加"]').first().click();
    await page.getByPlaceholder('新しいノード名...').fill('文学部');
    await page.getByRole('button', { name: '保存' }).click();

    // 子ノードが表示されることを確認
    await expect(page.getByRole('tree').getByText('文学部')).toBeVisible();

    // 同じ階層に空白付きの「文学部」を追加しようとする
    await page.getByRole('tree').getByText('大学').hover();
    await page.locator('[aria-label="子ノードを追加"]').first().click();
    await page.getByPlaceholder('新しいノード名...').fill('  文学部  ');
    await page.getByRole('button', { name: '保存' }).click();

    // エラーメッセージが表示されることを確認（トリムされて重複判定される）
    await expect(page.getByText('同じ名前のノード「文学部」が既に存在します')).toBeVisible();
  });

  test('インポート時にも重複チェックが機能する', async ({ page }) => {
    // まず1つ目のノードをインポート
    const importData1 = '大学 > 文学部';
    await page.locator('textarea').fill(importData1);
    await page.getByRole('button', { name: 'ツリーを生成' }).click();

    // ノードが表示されるまで待つ
    await expect(page.getByRole('tree').getByText('文学部')).toBeVisible();

    // 同じ階層に理学部を追加
    await page.getByRole('tree').getByText('大学').hover();
    await page.locator('[aria-label="子ノードを追加"]').first().click();
    await page.getByPlaceholder('新しいノード名...').fill('理学部');
    await page.getByRole('button', { name: '保存' }).click();

    // 理学部が表示されることを確認
    await expect(page.getByRole('tree').getByText('理学部')).toBeVisible();

    // 重複する名前の文学部を追加しようとする
    await page.getByRole('tree').getByText('大学').hover();
    await page.locator('[aria-label="子ノードを追加"]').first().click();
    await page.getByPlaceholder('新しいノード名...').fill('文学部');
    await page.getByRole('button', { name: '保存' }).click();

    // エラーメッセージが表示されることを確認
    await expect(page.getByText('同じ名前のノード「文学部」が既に存在します')).toBeVisible();
  });
});
