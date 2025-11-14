# 階層構造エディタ

組織図などの階層データを視覚的に編集できるインタラクティブなツリー構造エディタです。

## ✨ 機能

### 基本機能
- **階層データのインポート/エクスポート**
  - `親 > 子 > 孫` 形式のテキストデータをツリー構造に変換
  - ツリー構造をテキスト形式でエクスポート
  - クリップボードへのコピー

- **ノード操作**
  - ノードの追加・削除
  - ドラッグ&ドロップによる移動
  - ノードの展開/折りたたみ

### ドラッグ&ドロップ
- **3つの配置位置**
  - `before`: ノードの前に配置
  - `after`: ノードの後に配置
  - `inside`: ノードの子として配置

- **ビジュアルフィードバック**
  - ドロップ位置の青いインジケーター表示
  - ドラッグ中のノードは半透明に
  - 無効なドロップ先は赤く表示

- **バリデーション**
  - ルートノードは1つまで
  - 親ノードをその子孫に移動不可
  - 同じノードへの移動不可

### ユーザーフィードバック
- 操作結果のトースト通知（成功/エラー/警告）
- ノード移動時のハイライトアニメーション
- デバッグログ（`console.debug`）

## 🏗️ アーキテクチャ

### 設計思想
- **関心の分離**: ビジネスロジック、状態管理、UIを分離
- **状態の可視化**: すべての状態遷移をデバッグログで追跡可能
- **テスト可能性**: 各フックとコンポーネントが独立してテスト可能

### ディレクトリ構造

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
├── hooks/              # カスタムフック
│   ├── useTreeState.ts       # ツリー状態管理（useReducer）
│   ├── useTreeActions.ts     # ビジネスロジック層
│   ├── useDragAndDrop.ts     # D&D状態管理
│   ├── useExpandedNodes.ts   # ノード展開状態
│   ├── useFeedback.ts        # ユーザーフィードバック
│   └── useExportModal.ts     # エクスポート機能
├── utils/              # ユーティリティ関数
│   ├── treeParser.ts   # データパース/エクスポート
│   └── treeOperations.ts # ツリー操作関数
├── types.ts            # 型定義
├── constants.ts        # 定数
├── App.tsx            # メインアプリケーション（86行）
└── index.tsx          # エントリーポイント
```

### 状態管理フロー

```
User Action
    ↓
useTreeActions (ビジネスロジック層)
    ├─ バリデーション
    ├─ エラーハンドリング
    └─ dispatch(action)
        ↓
useTreeState (useReducer)
    ├─ 状態遷移の実行
    ├─ デバッグログ出力
    └─ 新しい状態を返す
        ↓
UI更新 + フィードバック
```

## 🚀 開発

### セットアップ

```bash
# 依存関係のインストール
npm install

# 開発サーバー起動
npm run dev

# ビルド
npm run build
```

### 開発サーバー
http://localhost:3000 でアプリケーションが起動します。

## 🧪 テスト

### テストの実行

```bash
# テストを実行（watchモード）
npm test

# CI用テスト（1回だけ実行）
npm run test:ci

# UIモードでテストを実行
npm run test:ui

# カバレッジレポートを生成
npm run test:coverage
```

### テストスイート

#### ユニットテスト

- **ユーティリティ関数**: treeParser, treeOperations
- **カスタムフック**: useTreeState, useExpandedNodes, useFeedback, useExportModal, useDragAndDrop, useTreeActions
- **合計**: 140テスト

すべてのユニットテストは[Vitest](https://vitest.dev/)と[React Testing Library](https://testing-library.com/react)で実装されています。

#### E2Eテスト

実際のユーザー操作をシミュレートするE2Eテストを[Playwright](https://playwright.dev/)で実装しています。

```bash
# E2Eテストを実行
npm run test:e2e

# CI用E2Eテスト（listレポーター使用）
npm run test:e2e:ci

# UIモードで実行
npm run test:e2e:ui

# ブラウザを表示して実行
npm run test:e2e:headed

# デバッグモードで実行
npm run test:e2e:debug
```

**テストシナリオ（16テスト）:**
- **基本的な機能**
  - ページ表示、データインポート
  - ルートノード・子ノードの追加
  - ノードの削除
  - バリデーション（空のノード名、ルートノード制限）
- **ドラッグ&ドロップ機能**
  - ノード移動（前/後/子として配置）
  - ドラッグ中のプレビュー表示
  - ノードの展開・折りたたみ
- **エクスポート機能**
  - モーダル表示・クローズ
  - クリップボードへのコピー

## 📦 デプロイ

### GitHub Pages

このプロジェクトは GitHub Pages に自動デプロイされます。

**公開URL**: https://pyyoshi.github.io/demo-interactive-tree-structure-editor/

#### 自動デプロイ設定

`master` ブランチへのpush時に、GitHub Actionsが自動的にテスト→ビルド→デプロイを実行します。

**デプロイフロー:**
1. 依存関係のインストール
2. **テストの実行** - すべてのテストが通過する必要があります
3. プロダクションビルド
4. GitHub Pagesへのデプロイ

テストが失敗した場合、デプロイは中止されます。

#### 初回セットアップ（リポジトリ管理者向け）

1. GitHubリポジトリの **Settings** > **Pages** に移動
2. **Source** を `GitHub Actions` に変更
3. `master` ブランチにpushすると自動デプロイが開始されます

#### ワークフロー

デプロイワークフローは `.github/workflows/deploy.yml` で管理されています。

```yaml
on:
  push:
    branches:
      - master
  workflow_dispatch:  # 手動実行も可能
```

#### base pathの設定

ローカル開発とGitHub Pagesデプロイの両方で正しく動作するよう、環境変数でbase pathを制御しています。

- **ローカル開発/ビルド**: base pathは `/`（ルートパス）
- **GitHub Pagesデプロイ**: base pathは `/demo-interactive-tree-structure-editor/`

`vite.config.ts` で環境変数 `VITE_BASE_PATH` を使用：
```typescript
base: env.VITE_BASE_PATH || '/',
```

GitHub Actionsでは、ビルド時に環境変数を設定してサブパスを有効化します。

## 🐛 デバッグ

### デバッグログの表示

すべての状態遷移とイベントは `console.debug` でログ出力されます。

**Chrome DevToolsで表示:**
1. DevToolsを開く（F12）
2. Console タブを選択
3. ログレベルで「Verbose」を有効化

### ログの種類

- `✅ [TreeState]` - ツリー状態の変更
- `🔍 [DragAndDrop]` - ドラッグ中のノード検索
- `🎬 [DragAndDrop]` - ドラッグ開始
- `🏁 [DragAndDrop]` - ドラッグ終了
- `📦 [DragAndDrop]` - ドロップ処理
- `🧹 [DragAndDrop]` - クリーンアップ
- `🔽 [ExpandedNodes]` - ノード展開/折りたたみ
- `✅/❌/⚠️/ℹ️ [Feedback]` - ユーザーフィードバック

### ログを非表示にする
Console タブで「Verbose」を無効化するだけです。

## 🛠️ 技術スタック

- **React 19** - UIフレームワーク
- **TypeScript** - 型安全性
- **Vite** - 高速ビルドツール
- **Tailwind CSS v4** - スタイリング
- **Vitest** - ユニットテストフレームワーク
- **React Testing Library** - Reactコンポーネント/フックのテスト
- **Playwright** - E2Eテストフレームワーク
- **HTML5 Drag and Drop API** - ドラッグ&ドロップ

## 📦 主要なフック

### useTreeState
- useReducerベースの状態管理
- すべての状態遷移を1箇所で管理
- アクション: `ADD_NODE`, `DELETE_NODE`, `MOVE_NODE`, `IMPORT_DATA`など

### useTreeActions
- ビジネスロジック層
- バリデーションとエラーハンドリング
- 操作結果のフィードバック

### useDragAndDrop
- ドラッグ&ドロップの状態管理
- フェーズ追跡: `idle` → `dragging` → `dropping` → `idle`
- グローバルdragendイベントでクリーンアップ

### useFeedback
- トースト通知の管理
- 3秒後に自動削除
- デバッグログ出力

## 🎨 カスタマイズ

### ドロップゾーンのサイズ調整
`components/TreeNode.tsx` の `calculateDropPosition` 関数で調整可能：

```typescript
const beforeAfterZoneSize = hasChildren ? height * 0.3 : height * 0.35;
```

### トースト表示時間の変更
`hooks/useFeedback.ts` で調整可能：

```typescript
setTimeout(() => {
    setMessages(prev => prev.filter(msg => msg.id !== id));
}, 3000); // ← ここを変更（ミリ秒）
```

## 📝 データフォーマット

### インポート形式
```
大学 > 文学部 > 日本文学科
大学 > 文学部 > 外国語文学科
大学 > 理学部 > 数学科
大学 > 理学部 > 物理学科
```

### エクスポート形式
同じ形式でエクスポートされます。葉ノードのみがテキストに含まれます。

## 🤝 コントリビューション

1. このリポジトリをフォーク
2. フィーチャーブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

## 📄 ライセンス

MIT License

## 🙏 謝辞

このプロジェクトは以下の技術とライブラリを使用しています：
- React
- TypeScript
- Vite
- Tailwind CSS
