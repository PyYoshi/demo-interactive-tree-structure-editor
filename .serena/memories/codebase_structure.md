# コードベース構造

## ディレクトリ構成
```
src/
├── components/          # UIコンポーネント
│   ├── Tree.tsx        # ツリー全体のコンテナ
│   ├── TreeNode.tsx    # 個別のツリーノード
│   ├── ImportExportSection.tsx
│   ├── ExportModal.tsx
│   ├── EmptyTreeState.tsx
│   ├── FeedbackToast.tsx
│   └── icons.tsx
├── hooks/              # カスタムフック（ビジネスロジック + 状態管理）
│   ├── useTreeState.ts       # ツリー状態管理（useReducer）
│   ├── useTreeActions.ts     # ビジネスロジック層
│   ├── useDragAndDrop.ts     # D&D状態管理
│   ├── useExpandedNodes.ts   # ノード展開状態
│   ├── useFeedback.ts        # ユーザーフィードバック
│   └── useExportModal.ts     # エクスポート機能
├── utils/              # ユーティリティ関数（純粋関数）
│   ├── treeParser.ts   # データパース/エクスポート
│   └── treeOperations.ts # ツリー操作関数
├── types.ts            # 型定義
├── constants.ts        # 定数
├── App.tsx            # メインアプリケーション（86行）
└── index.tsx          # エントリーポイント
```

## テストファイル
```
src/
├── hooks/*.test.ts     # フックのユニットテスト
├── utils/*.test.ts     # ユーティリティ関数のユニットテスト
e2e/
├── basic.spec.ts       # 基本機能のE2Eテスト
└── drag-and-drop.spec.ts  # D&D機能のE2Eテスト
```

## 主要フック
| フック | 役割 |
|--------|------|
| `useTreeState` | useReducerベース状態管理 |
| `useTreeActions` | ビジネスロジック層 |
| `useDragAndDrop` | D&D状態管理 |
| `useFeedback` | ユーザー通知 |
| `useExpandedNodes` | ノード展開状態 |
| `useExportModal` | エクスポート機能 |

## 状態管理フロー
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

## 重要なパターン
- **同一階層重複チェック**: `hasDuplicateNameInSiblings(nodes, name, excludeId?)`
  - `excludeId`で自己除外し、同一階層内での位置変更を許可
- **ノード移動**: `getDestinationSiblings(nodes, targetId, position)`
  - `inside`, `before`, `after`全ての位置で重複チェック
- **デバッグログ**: `console.debug`を使用、絵文字で視認性向上
