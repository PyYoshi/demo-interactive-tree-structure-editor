# 階層構造エディタ - AI開発ガイド

## 概要

**技術スタック**: React 19 + TypeScript + Vite + Tailwind CSS v4 + Vitest + Playwright

**コア機能**:
- ツリー構造データの編集（追加・削除・移動）
- ドラッグ&ドロップ操作
- 同一階層での重複名検証
- インポート/エクスポート

**テストカバレッジ**: 169ユニットテスト、24 E2Eテスト

## 開発コマンド

```bash
npm run dev              # 開発サーバー (localhost:3000)
npm run build            # プロダクションビルド
npm test                 # ユニットテスト (watchモード)
npm run test:ci          # ユニットテスト (1回のみ)
npm run test:e2e         # E2Eテスト
npm run test:e2e:ui      # E2EテストUIモード
```

## アーキテクチャ

### 状態管理フロー

```
User Action
↓
useTreeActions (ビジネスロジック層)
├─ バリデーション
├─ エラーハンドリング
├─ フィードバック通知
└─ dispatch(action)
    ↓
useTreeState (useReducer)
├─ 状態遷移の実行
├─ 防御的バリデーション
├─ デバッグログ出力
└─ 新しい状態を返す
    ↓
UI更新 + フィードバック表示
```

**WHY**: 多層バリデーション（ビジネスロジック + Reducer）により、予期しないバグを防ぎ、デバッグログで状態遷移を追跡可能にする

### フック構成

| フック | 役割 | ファイル |
|--------|------|----------|
| `useTreeState` | useReducerベース状態管理 | `hooks/useTreeState.ts` |
| `useTreeActions` | ビジネスロジック層 | `hooks/useTreeActions.ts` |
| `useDragAndDrop` | D&D状態管理 | `hooks/useDragAndDrop.ts` |
| `useFeedback` | ユーザー通知 | `hooks/useFeedback.ts` |
| `useExpandedNodes` | ノード展開状態 | `hooks/useExpandedNodes.ts` |
| `useExportModal` | エクスポート機能 | `hooks/useExportModal.ts` |

### ディレクトリ構造

```
src/
├── components/          # UIコンポーネント
├── hooks/              # カスタムフック（ビジネスロジック + 状態管理）
├── utils/              # ユーティリティ関数（純粋関数）
├── types.ts            # 型定義
└── constants.ts        # 定数
```

## 実装ルール

### 1. 事前確認（必須）

⚠️ **憶測禁止**: 必ず実装を確認してから作業

```
既存の関連コードを読む
↓
型定義・ユーティリティ関数を確認
↓
既存のテストを確認（パターン理解）
↓
実装開始
```

**WHY**: 憶測で実装すると、既存パターンと異なるコードになり、手戻りが発生する

### 2. ファイル配置

#### DO
- **ビジネスロジック** → `hooks/`（例: バリデーション、状態更新）
- **純粋関数** → `utils/`（例: ツリー操作、データパース）
- **UI専用ロジック** → `components/`（例: イベントハンドラー）

#### DON'T
- UIコンポーネント内にビジネスロジックを書く
- ユーティリティ関数内でReactフックを使う

**WHY**: 関心の分離により、テスト容易性と再利用性を向上させる

### 3. バリデーション

#### 多層バリデーションパターン

**ビジネスロジック層** (`useTreeActions`):
- ユーザーに分かりやすいエラーメッセージ
- フィードバック通知の表示

**Reducer層** (`useTreeState`):
- 防御的プログラミング
- デバッグログ出力

```typescript
// ✅ GOOD: 多層バリデーション
// useTreeActions (ビジネスロジック層)
if (hasDuplicateNameInSiblings(siblings, name)) {
    onFeedback?.('error', `同じ名前のノード「${name}」が既に存在します`);
    return { success: false };
}
dispatch({ type: 'ADD_NODE', payload: { parentId, name } });

// useTreeState (防御的チェック)
case 'ADD_NODE': {
    if (hasDuplicateNameInSiblings(parentNode.children, name)) {
        logAction(action, 'error', '同じ名前のノードが既に存在します');
        return state;
    }
    // ...
}
```

**WHY**: ビジネスロジックでユーザー向けエラー、Reducerで防御的チェックを行うことで、堅牢性と保守性を両立

### 4. デバッグログ

#### DO
- すべての状態遷移で `console.debug` を使用
- 絵文字で視認性向上（`✅` 成功、`❌` エラー）
- アクション詳細を含める

```typescript
const logAction = (action: TreeAction, result: 'success' | 'error', message?: string) => {
    const emoji = result === 'success' ? '✅' : '❌';
    console.debug(`${emoji} [TreeState] ${action.type}`, message || '', action);
};
```

#### DON'T
- `console.log` や `console.error` を使用
- 本番環境用のログライブラリを導入（過剰）

**WHY**: Chrome DevToolsの「Verbose」フィルタで簡単にON/OFF可能。シンプルで効果的

## テスト実装

### ユニットテスト (Vitest)

**対象**: hooks, utils

```
ユーティリティ関数のテストを確認
↓
既存のテストパターンを理解
↓
同じパターンで新規テストを作成
```

#### DO
- `describe` でグループ化
- `it` で具体的なシナリオ記述
- `renderHook` でカスタムフックテスト
- エッジケースを網羅（空文字、重複、境界値）

```typescript
// ✅ GOOD
describe('hasDuplicateNameInSiblings', () => {
    it('同じ名前のノードが存在する場合trueを返す', () => {
        const siblings = [
            { id: '1', name: '営業部', children: [] },
            { id: '2', name: '総務部', children: [] }
        ];
        expect(hasDuplicateNameInSiblings(siblings, '営業部')).toBe(true);
    });
});
```

#### DON'T
- 既存のテストパターンを無視
- 実装詳細をテスト（内部関数の呼び出しなど）

### E2Eテスト (Playwright)

**対象**: 実際のユーザー操作フロー

#### DO
- `beforeEach` でデータセットアップ
- `getByRole`, `getByText` でアクセシビリティ重視
- 成功・エラーメッセージの確認

```typescript
// ✅ GOOD
test('重複する名前のノードを同一階層内に移動できない', async ({ page }) => {
    const source = nodes.nth(1);
    const target = page.getByRole('tree').getByText('文学部').first();
    await source.dragTo(target, { targetPosition: { x: 50, y: 10 } });
    await expect(page.getByText('移動先に同じ名前のノード「国文学科」が既に存在します')).toBeVisible();
});
```

#### DON'T
- IDやクラス名で要素を取得（実装詳細に依存）
- `page.waitForTimeout()` の多用（不安定）

**WHY**: セマンティックなセレクタはアクセシビリティとテストの堅牢性を両立

## 重要なパターン

### 1. 同一階層重複チェック

**ルール**: 同じ階層に同じ名前のノードは1つまで。異なる階層では同名OK

```typescript
export const hasDuplicateNameInSiblings = (
    nodes: TreeNodeData[],
    name: string,
    excludeId?: string  // 自己除外用
): boolean => {
    const trimmedName = name.trim();
    return nodes.some(node =>
        node.id !== excludeId && node.name.trim() === trimmedName
    );
};
```

**excludeIdパターン**: 移動時に自分自身を除外

```typescript
// 移動先の兄弟ノードを取得
const destinationSiblings = getDestinationSiblings(treeData, targetId, position);

// 自分自身は除外してチェック
if (hasDuplicateNameInSiblings(destinationSiblings, sourceNode.name, sourceId)) {
    // エラー
}
```

**WHY**: 同一階層内での位置変更（before/after）を許可するため

### 2. ノード移動の位置

| 位置 | 説明 | 移動先兄弟ノード |
|------|------|------------------|
| `inside` | 子として配置 | targetノードの`children` |
| `before` | 前に配置 | targetノードの親の`children` |
| `after` | 後に配置 | targetノードの親の`children` |

**全ての位置で重複チェックが必要**

### 3. デバッグログのプレフィックス

| プレフィックス | 意味 | 使用箇所 |
|---------------|------|----------|
| `✅ [TreeState]` | 状態変更成功 | useTreeState |
| `❌ [TreeState]` | 状態変更エラー | useTreeState |
| `🎬 [DragAndDrop]` | ドラッグ開始 | useDragAndDrop |
| `🏁 [DragAndDrop]` | ドラッグ終了 | useDragAndDrop |
| `✅/❌/⚠️/ℹ️ [Feedback]` | 通知 | useFeedback |

## よくある間違い

| 間違い | 正しい方法 | WHY |
|--------|-----------|-----|
| Reducerでフィードバック表示 | useTreeActionsで表示 | Reducerは純粋関数、副作用は外で |
| 1箇所だけでバリデーション | 多層バリデーション | 防御的プログラミング |
| 移動時に重複チェックなし | 全ての位置で重複チェック | inside/before/after全てで必要 |
| excludeIdなしでチェック | 自己除外を実装 | 同一階層内の位置変更を許可 |
| テスト実装前にコード変更 | テスト→実装の順 | リグレッション防止 |

## Git操作

### コミットメッセージ

```
実装した機能の概要（日本語）

- 変更の詳細1
- 変更の詳細2
- テスト: XX個追加（合計YY個）
```

### デプロイ

- `master`ブランチへのpushで自動デプロイ（GitHub Actions）
- テスト失敗時はデプロイ中止
- 公開URL: https://pyyoshi.github.io/demo-interactive-tree-structure-editor/
