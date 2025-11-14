# コーディングスタイルと規約

## TypeScript規約
- **Strict型チェック**: 型安全性を重視
- **関数コンポーネント**: FC型を使用
- **インターフェース**: 型定義は`types.ts`に集約
- **命名規則**:
  - コンポーネント: PascalCase（例: `TreeNode`, `ImportExportSection`）
  - フック: camelCase、`use`プレフィックス（例: `useTreeState`, `useDragAndDrop`）
  - ユーティリティ関数: camelCase（例: `parseData`, `findNode`）
  - 定数: camelCase（例: `initialRawData`）

## ファイル配置
- **ビジネスロジック** → `hooks/`（バリデーション、状態更新）
- **純粋関数** → `utils/`（ツリー操作、データパース）
- **UI専用ロジック** → `components/`（イベントハンドラー）

**理由**: 関心の分離により、テスト容易性と再利用性を向上

## 状態管理パターン
- **useReducer**ベース（`useTreeState`）
- **多層バリデーション**:
  - ビジネスロジック層（`useTreeActions`）: ユーザー向けエラー、フィードバック通知
  - Reducer層（`useTreeState`）: 防御的チェック、デバッグログ

## デバッグログ
- すべての状態遷移で`console.debug`を使用
- 絵文字プレフィックス: `✅` 成功、`❌` エラー
- フォーマット: `[ModuleName] Action: detail`

## コンポーネント設計
- 小さく、単一責任に
- propsは明示的に型定義
- 副作用は適切なフックで管理

## テストパターン
- `describe`でグループ化
- `it`で具体的なシナリオ記述
- E2Eは`getByRole`, `getByText`でアクセシビリティ重視
- エッジケースを網羅（空文字、重複、境界値）
