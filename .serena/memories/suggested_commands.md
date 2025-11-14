# 推奨コマンド

## 開発
```bash
npm run dev              # 開発サーバー起動（localhost:3000）
npm run build            # プロダクションビルド
npm run preview          # ビルド後のプレビュー
```

## ユニットテスト
```bash
npm test                 # ウォッチモード（開発中）
npm run test:ci          # 1回のみ実行（CI用）
npm run test:ui          # Vitest UIモード
npm run test:coverage    # カバレッジレポート生成
```

## E2Eテスト
```bash
npm run test:e2e         # E2Eテスト実行
npm run test:e2e:ci      # CI用（listレポーター）
npm run test:e2e:ui      # Playwright UIモード
npm run test:e2e:headed  # ブラウザ表示
npm run test:e2e:debug   # デバッグモード
```

## 全テスト実行
```bash
npm run test:all         # ユニット+E2E全実行
```

## システムコマンド（Linux）
- `git` - バージョン管理
- `ls` - ファイル一覧
- `cd` - ディレクトリ移動
- `grep` - テキスト検索
- `find` - ファイル検索

## デバッグ
Chrome DevToolsでConsoleタブを開き、「Verbose」を有効化すると、すべての状態遷移ログが表示されます。
