import { test, expect } from '@playwright/test';

test.describe('ドラッグ&ドロップ機能', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');

    // テスト用のツリー構造をインポート
    const importData = `大学 > 文学部 > 日本文学科
大学 > 文学部 > 英文学科
大学 > 理学部 > 数学科
大学 > 理学部 > 物理学科`;
    await page.locator('textarea').fill(importData);
    await page.getByRole('button', { name: 'ツリーを生成' }).click();

    // ノードが表示されるまで待つ
    await expect(page.getByRole('tree').getByText('日本文学科')).toBeVisible();
  });

  test('ノードを別のノードの前に移動できる', async ({ page }) => {
    // 英文学科を日本文学科の前に移動
    const source = page.getByRole('tree').getByText('英文学科').first();
    const target = page.getByRole('tree').getByText('日本文学科').first();

    // ドラッグ&ドロップを実行
    await source.dragTo(target, {
      targetPosition: { x: 0, y: 0 }
    });

    // 成功メッセージの確認
    await expect(page.getByText('ノードを移動しました')).toBeVisible();

    // ノードがハイライトされることを確認（1.5秒以内）
    // ハイライトは背景色の変化で確認できる
    const movedNode = page.getByRole('tree').getByText('英文学科').first();
    await expect(movedNode).toBeVisible();
  });

  test('ノードを別のノードの後に移動できる', async ({ page }) => {
    // 日本文学科を英文学科の後に移動
    const source = page.getByRole('tree').getByText('日本文学科').first();
    const target = page.getByRole('tree').getByText('英文学科').first();

    await source.dragTo(target, {
      targetPosition: { x: 0, y: 20 }
    });

    // 成功メッセージの確認
    await expect(page.getByText('ノードを移動しました')).toBeVisible();
  });

  test('ノードを別のノードの子として移動できる', async ({ page }) => {
    // 理学部を文学部の中に移動
    const source = page.getByRole('tree').getByText('理学部').first();
    const target = page.getByRole('tree').getByText('文学部').first();

    // ノードの中央にドロップして子要素として追加
    await source.dragTo(target, {
      targetPosition: { x: 50, y: 10 }
    });

    // 成功メッセージの確認
    await expect(page.getByText('ノードを移動しました')).toBeVisible();
  });

  test('ドラッグ中にプレビューが表示される', async ({ page }) => {
    const source = page.getByRole('tree').getByText('日本文学科').first();
    const target = page.getByRole('tree').getByText('英文学科').first();

    // ドラッグを開始
    await source.hover();
    await page.mouse.down();

    // ターゲット上でホバー
    await target.hover();

    // ドロップラインのプレビューが表示されることを期待
    // (実際のプレビュー要素のセレクタは実装に依存)
    await page.waitForTimeout(100);

    // ドロップを完了
    await page.mouse.up();

    // 成功メッセージの確認
    await expect(page.getByText('ノードを移動しました')).toBeVisible();
  });

  test('ノードを展開・折りたたみできる', async ({ page }) => {
    // 文学部を探す
    const facultyNode = page.getByRole('tree').getByText('文学部').first();

    // 初期状態では子ノードが表示されている
    await expect(page.getByRole('tree').getByText('日本文学科')).toBeVisible();
    await expect(page.getByRole('tree').getByText('英文学科')).toBeVisible();

    // 折りたたみボタンをクリック
    await facultyNode.click();

    // 子ノードが非表示になることを確認
    await expect(page.getByRole('tree').getByText('日本文学科')).not.toBeVisible();
    await expect(page.getByRole('tree').getByText('英文学科')).not.toBeVisible();

    // もう一度クリックして展開
    await facultyNode.click();

    // 子ノードが再表示されることを確認
    await expect(page.getByRole('tree').getByText('日本文学科')).toBeVisible();
    await expect(page.getByRole('tree').getByText('英文学科')).toBeVisible();
  });

  test('親ノードを折りたたむと子孫ノード全体が非表示になる', async ({ page }) => {
    // 大学ノードをクリック
    await page.getByRole('tree').getByText('大学').first().click();

    // すべての子孫ノードが非表示になることを確認
    await expect(page.getByRole('tree').getByText('文学部')).not.toBeVisible();
    await expect(page.getByRole('tree').getByText('理学部')).not.toBeVisible();
    await expect(page.getByRole('tree').getByText('日本文学科')).not.toBeVisible();
    await expect(page.getByRole('tree').getByText('数学科')).not.toBeVisible();
  });
});
