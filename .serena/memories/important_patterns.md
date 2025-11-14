# 重要な実装パターン

## 1. 同一階層重複チェック

### ルール
- 同じ階層に同じ名前のノードは1つまで
- 異なる階層では同名OK

### 実装
```typescript
// utils/treeOperations.ts
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

### excludeIdパターン
移動時に自分自身を除外して、同一階層内での位置変更を許可：

```typescript
// 移動先の兄弟ノードを取得
const destinationSiblings = getDestinationSiblings(treeData, targetId, position);

// 自分自身は除外してチェック
if (hasDuplicateNameInSiblings(destinationSiblings, sourceNode.name, sourceId)) {
    // エラー
}
```

## 2. ノード移動の位置

| 位置 | 説明 | 移動先兄弟ノード |
|------|------|------------------|
| `inside` | 子として配置 | targetノードの`children` |
| `before` | 前に配置 | targetノードの親の`children` |
| `after` | 後に配置 | targetノードの親の`children` |

**重要**: 全ての位置で重複チェックが必要

## 3. 多層バリデーション

### ビジネスロジック層（useTreeActions）
- ユーザー向けのエラーメッセージ
- フィードバック通知の表示
- `ActionResult`を返す

### Reducer層（useTreeState）
- 防御的プログラミング
- デバッグログ出力
- 状態の不変性を保証

**理由**: ビジネスロジックでユーザー向けエラー、Reducerで防御的チェックを行うことで、堅牢性と保守性を両立

## 4. デバッグログのプレフィックス

| プレフィックス | 意味 | 使用箇所 |
|---------------|------|----------|
| `✅ [TreeState]` | 状態変更成功 | useTreeState |
| `❌ [TreeState]` | 状態変更エラー | useTreeState |
| `🎬 [DragAndDrop]` | ドラッグ開始 | useDragAndDrop |
| `🏁 [DragAndDrop]` | ドラッグ終了 | useDragAndDrop |
| `✅/❌/⚠️/ℹ️ [Feedback]` | 通知 | useFeedback |

## よくある間違い

| 間違い | 正しい方法 | 理由 |
|--------|-----------|-----|
| Reducerでフィードバック表示 | useTreeActionsで表示 | Reducerは純粋関数、副作用は外で |
| 1箇所だけでバリデーション | 多層バリデーション | 防御的プログラミング |
| 移動時に重複チェックなし | 全ての位置で重複チェック | inside/before/after全てで必要 |
| excludeIdなしでチェック | 自己除外を実装 | 同一階層内の位置変更を許可 |
