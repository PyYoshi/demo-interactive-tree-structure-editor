# Reactパフォーマンス計測ガイド

**作成日**: 2025-11-14
**対象**: 階層構造エディタのパフォーマンス改善計測

---

## 📋 概要

このドキュメントは、Reactアプリケーションのレンダリングパフォーマンスを計測するための業界標準のベストプラクティスと、このプロジェクトでの具体的な実施方法をまとめています。

---

## 🌍 業界のベストプラクティス（2025年）

### 基本原則

> **"Measure before you optimize"**
> 最適化する前に必ず計測する

### 計測の3つのフェーズ

1. **開発時**: React DevTools Profilerで手動計測
2. **テスト時**: 自動化されたパフォーマンステスト
3. **本番時**: リアルユーザーモニタリング（RUM）

---

## 🛠️ 計測ツールの分類

### A. 手動計測ツール（開発環境）

| ツール | 計測対象 | メリット | デメリット |
|--------|---------|---------|-----------|
| **React DevTools Profiler** | 再レンダリング回数・時間 | 視覚的で分かりやすい、詳細な情報 | 手動、記録が必要 |
| **Chrome DevTools Performance** | スクリプト・レンダリング・ペイント | タイムライン表示、詳細な分析 | 複雑、学習コストが高い |
| **Lighthouse** | FCP, LCP, TTI, TBT | 総合的な監査、スコア表示 | ページ全体の計測のみ |

#### Web Vitals 主要指標

- **FCP (First Contentful Paint)**: 最初のコンテンツが表示されるまでの時間（目標: <1秒）
- **LCP (Largest Contentful Paint)**: 最大のコンテンツが表示されるまでの時間（目標: <2.5秒）
- **TTI (Time to Interactive)**: ユーザーが操作可能になるまでの時間（目標: <5秒）
- **TBT (Total Blocking Time)**: メインスレッドがブロックされた合計時間

---

### B. 自動計測ツール（テスト・CI環境）

#### 🏆 **Reassure** （最も推奨）

**概要**: React Testing Libraryベースの性能回帰テストライブラリ

**公式リポジトリ**: https://github.com/callstack/reassure

**インストール**:
```bash
npm install --save-dev reassure
```

**特徴**:
- ✅ 再レンダリング回数を自動計測
- ✅ レンダリング時間も計測
- ✅ 性能回帰を検出（ベースラインとの比較）
- ✅ 既存のReact Testing Libraryと統合
- ✅ CIで自動実行可能
- ✅ 開発元: Callstack（React Native Paperなどを開発）

**基本的な使い方**:

1. **セットアップ**:
```typescript
// reassure.config.js
module.exports = {
  testMatch: '**/*.perf.test.{js,jsx,ts,tsx}',
  outputFile: '.reassure/results.json',
};
```

2. **パフォーマンステストを作成**:
```typescript
// __tests__/performance/TreeNode.perf.test.tsx
import { measurePerformance } from 'reassure';
import { TreeNode } from '../../src/components/TreeNode';

test('TreeNode renders efficiently', async () => {
  const mockNode = {
    id: '1',
    name: 'テストノード',
    children: []
  };

  await measurePerformance(
    <TreeNode
      node={mockNode}
      level={0}
      onAddNode={() => {}}
      onDeleteNode={() => {}}
      onMoveNode={() => {}}
      expandedNodes={new Map()}
      onToggleExpand={() => {}}
      highlightedNodeId={null}
      draggingNodeId={null}
      draggingNode={null}
      previewTarget={null}
      onDragStateChange={() => {}}
      onPreviewChange={() => {}}
    />
  );
});
```

3. **ベースラインを作成**（改善前）:
```bash
npm run test:performance -- --update-baseline
```

4. **React.memo実装後に計測**:
```bash
npm run test:performance
```

5. **結果の確認**:
```json
// .reassure/results.json
{
  "TreeNode renders efficiently": {
    "meanCount": 1.0,      // 平均レンダリング回数
    "meanDuration": 5.2,   // 平均レンダリング時間（ms）
    "stdev": 0.1
  }
}
```

**比較レポートの生成**:
```bash
reassure compare
```

出力例:
```
Performance comparison results:
┌────────────────────────────────┬───────────┬───────────┬─────────┐
│ Test                           │ Baseline  │ Current   │ Change  │
├────────────────────────────────┼───────────┼───────────┼─────────┤
│ TreeNode renders efficiently   │ 10 renders│ 1 render  │ -90% ⬇️ │
│   Duration                     │ 15.2 ms   │ 5.1 ms    │ -66% ⬇️ │
└────────────────────────────────┴───────────┴───────────┴─────────┘
```

**メリット**:
- 数値で改善効果を示せる
- CI/CDに組み込んで継続的に計測できる
- 性能劣化を自動検出

**デメリット**:
- セットアップに時間がかかる（2-3時間）
- ユニットテスト的な計測（E2Eではない）

---

#### **playwright-performance**

**概要**: PlaywrightでWeb Vitalsを計測

**インストール**:
```bash
npm install --save-dev playwright-performance
```

**使い方**:
```typescript
import { test } from '@playwright/test';
import { measurePerformance } from 'playwright-performance';

test('ページのパフォーマンス計測', async ({ page }) => {
  await page.goto('http://localhost:3000');

  const metrics = await measurePerformance(page);

  console.log('FCP:', metrics.fcp);
  console.log('LCP:', metrics.lcp);
  console.log('TBT:', metrics.tbt);
});
```

**特徴**:
- ✅ E2Eテストに統合
- ✅ Web Vitalsを計測
- ✅ ページ全体のパフォーマンス

**制約**:
- ❌ React固有の再レンダリング回数は計測できない
- ❌ コンポーネント単位の計測は不可

**用途**: ページ全体のパフォーマンス監視に有効

---

#### **react-performance-testing**

**インストール**:
```bash
npm install --save-dev react-performance-testing
```

**特徴**:
- Reactをモンキーパッチして計測
- レンダリング回数とレンダリング時間を計測

**デメリット**:
- メンテナンスが不安定
- Reassureの方が推奨される

---

#### **その他のツール**

| ツール | 用途 | 推奨度 |
|--------|------|--------|
| react-render-measurement-tool | レンダリング計測 | △（ベータ版） |
| react-native-test-render-counter | React Native向け | - |
| useRenderCount hook | 開発用カウンター | ○（シンプル） |

---

### C. 本番環境モニタリング

| サービス | 特徴 | 料金 |
|---------|------|------|
| **Sentry Performance** | エラー監視と性能監視を統合 | 有料 |
| **New Relic** | 詳細なAPM、RUM | 有料 |
| **Datadog RUM** | リアルユーザーモニタリング | 有料 |

**このプロジェクトでの必要性**: 現時点では不要（小規模アプリ）

---

## ❌ Playwrightで直接React再レンダリングを計測できない理由

### 調査結果

1. **React DevTools Profilerの制約**:
   - Chrome拡張機能として動作
   - Playwrightから拡張のデータにアクセスするのは複雑
   - 公式APIが提供されていない

2. **React Profiler APIの制約**:
   - production buildで無効化される
   - Playwright Component Testingでも利用不可（GitHub Issue #14380）

3. **結論**:
   - PlaywrightでWeb Vitalsは計測できる
   - **React固有の再レンダリング回数はReassureを使う**

---

## 🎯 このプロジェクトでの推奨アプローチ

### **推奨: 2段階計測**

#### **フェーズ1: 手動計測（今すぐ実施）**

**目的**: 改善効果を視覚的に確認

**手順**:

1. **改善前の計測**
   ```bash
   npm run dev
   ```

2. **React DevTools Profilerで記録**
   - Chrome拡張「React Developer Tools」をインストール
   - DevToolsを開く（F12）
   - 「Profiler」タブを選択
   - 🔴「Record」ボタンをクリック

3. **テストシナリオを実行**
   - ノード追加（既存ノードに子を追加）
   - ノード削除
   - ノード移動（ドラッグ&ドロップ）
   - ノード展開/折りたたみ

4. **記録を停止**
   - ⏹️「Stop」ボタンをクリック

5. **結果を確認**
   - Flamegraphで各コンポーネントのレンダリング時間を確認
   - Ranked chartで再レンダリング回数を確認
   - スクリーンショットを保存

6. **React.memo実装**

7. **改善後の計測**
   - 同じ手順で再計測
   - 結果を比較

**期待される結果**:
- 再レンダリング数: 90%以上削減
- レンダリング時間: 50%以上削減

**工数**: 30分

**メリット**:
- ✅ 視覚的で分かりやすい
- ✅ すぐに始められる
- ✅ 追加のライブラリ不要

**デメリット**:
- ❌ 手動作業
- ❌ 自動化できない

---

#### **フェーズ2: 自動計測（オプション）**

**目的**: 継続的なパフォーマンス監視

**推奨ツール**: **Reassure**

**実装手順**:

1. **インストール**
   ```bash
   npm install --save-dev reassure
   ```

2. **設定ファイル作成**
   ```javascript
   // reassure.config.js
   module.exports = {
     testMatch: '**/*.perf.test.{ts,tsx}',
     outputFile: '.reassure/results.json',
   };
   ```

3. **package.jsonにスクリプト追加**
   ```json
   {
     "scripts": {
       "test:performance": "reassure",
       "test:performance:baseline": "reassure --update-baseline"
     }
   }
   ```

4. **パフォーマンステスト作成**
   ```typescript
   // __tests__/performance/TreeNode.perf.test.tsx
   import { measurePerformance } from 'reassure';
   import { TreeNode } from '../../src/components/TreeNode';

   describe('TreeNode Performance', () => {
     test('renders efficiently with small tree', async () => {
       const mockNode = {
         id: '1',
         name: 'テストノード',
         children: []
       };

       await measurePerformance(
         <TreeNode
           node={mockNode}
           level={0}
           onAddNode={() => {}}
           onDeleteNode={() => {}}
           onMoveNode={() => {}}
           expandedNodes={new Map()}
           onToggleExpand={() => {}}
           highlightedNodeId={null}
           draggingNodeId={null}
           draggingNode={null}
           previewTarget={null}
           onDragStateChange={() => {}}
           onPreviewChange={() => {}}
         />
       );
     });

     test('renders efficiently with nested tree', async () => {
       const mockNode = {
         id: '1',
         name: 'ルート',
         children: [
           { id: '2', name: '子1', children: [] },
           { id: '3', name: '子2', children: [] },
         ]
       };

       await measurePerformance(
         <TreeNode
           node={mockNode}
           level={0}
           onAddNode={() => {}}
           onDeleteNode={() => {}}
           onMoveNode={() => {}}
           expandedNodes={new Map([['1', true]])}
           onToggleExpand={() => {}}
           highlightedNodeId={null}
           draggingNodeId={null}
           draggingNode={null}
           previewTarget={null}
           onDragStateChange={() => {}}
           onPreviewChange={() => {}}
         />
       );
     });
   });
   ```

5. **ベースライン作成（改善前）**
   ```bash
   npm run test:performance:baseline
   ```

6. **React.memo実装**

7. **改善後の計測**
   ```bash
   npm run test:performance
   ```

8. **比較レポート生成**
   ```bash
   reassure compare
   ```

**工数**: 2-3時間

**メリット**:
- ✅ 自動化できる
- ✅ CI/CDに組み込める
- ✅ 性能劣化を自動検出
- ✅ 数値で効果を示せる

**デメリット**:
- ❌ セットアップに時間がかかる

---

## 📊 計測すべき操作

### 基本操作

1. **ノード追加**
   - 既存ノードに子を追加
   - 期待: 追加されたノードと親ノードのみ再レンダリング

2. **ノード削除**
   - ノードを削除
   - 期待: 削除されたノードの親のみ再レンダリング

3. **ノード移動**
   - ドラッグ&ドロップでノードを移動
   - 期待: 移動元・移動先の親ノードのみ再レンダリング

4. **ノード展開/折りたたみ**
   - ノードを展開・折りたたみ
   - 期待: 対象ノードのみ再レンダリング

### ストレステスト

5. **大規模ツリー（100ノード）での操作**
   - 各操作での再レンダリング数を確認
   - レンダリング時間を計測

---

## 📈 改善目標

### React.memo実装後の期待値

| 項目 | 改善前 | 改善後 | 削減率 |
|------|--------|--------|--------|
| 再レンダリング数（ノード追加） | 全ノード | 2-3ノードのみ | 95%以上 |
| レンダリング時間 | - | - | 50%以上 |

### 計測結果の記録方法

#### 改善前

**日付**: YYYY-MM-DD
**操作**: ノード追加（100ノードのツリーに1ノード追加）
**再レンダリング数**: 101コンポーネント
**レンダリング時間**: XX ms
**スクリーンショット**: `docs/screenshots/before-optimization.png`

#### 改善後

**日付**: YYYY-MM-DD
**操作**: ノード追加（100ノードのツリーに1ノード追加）
**再レンダリング数**: 3コンポーネント（新規ノード + 親 + Tree）
**レンダリング時間**: XX ms
**削減率**: 97%
**スクリーンショット**: `docs/screenshots/after-optimization.png`

---

## 🔧 React DevTools Profilerの詳しい使い方

### インストール

Chrome Web Store: https://chrome.google.com/webstore/detail/react-developer-tools/

### 基本操作

1. **Profilerタブを開く**
   - DevTools（F12） > Components / Profiler タブ

2. **記録開始**
   - 🔴「Record」ボタンをクリック
   - または、⚙️「Settings」で「Record why each component rendered」を有効化（推奨）

3. **操作を実行**
   - テストしたい操作を実行

4. **記録停止**
   - ⏹️「Stop」ボタンをクリック

5. **結果の確認**

   **Flamegraph（火炎グラフ）**:
   - 横軸: レンダリングフェーズ
   - 縦軸: コンポーネントの階層
   - 色: レンダリング時間（黄色→赤: 遅い）

   **Ranked chart（ランキングチャート）**:
   - レンダリング時間順にソート
   - どのコンポーネントが遅いか一目瞭然

6. **詳細情報の確認**
   - コンポーネントをクリック
   - 右サイドバーに詳細情報が表示:
     - レンダリング回数
     - レンダリング時間
     - なぜ再レンダリングされたか（propsの変更など）

### 便利な機能

- **なぜレンダリングされたか**を確認:
  - Settings > General > 「Record why each component rendered while profiling」をON
  - 再レンダリングの理由が表示される（propsの変更、stateの変更など）

- **コミット間の比較**:
  - 複数のレンダリングフェーズを比較できる

- **コンポーネントのフィルタリング**:
  - 特定のコンポーネントのみを表示

---

## 🚀 次のステップ

### 最小限の工数で効果を確認

1. **今日**: React DevTools Profilerで改善前を計測（30分）
2. **明日**: React.memo実装（1時間）
3. **明後日**: React DevTools Profilerで改善後を計測（30分）
4. **結果をドキュメント化**

### 継続的な監視が必要な場合

5. **来週**: Reassure導入（2-3時間）
6. **CI/CDに組み込み**: GitHub Actionsで自動実行

---

## 📝 まとめ

| 方法 | 工数 | 自動化 | 推奨度 |
|------|------|--------|--------|
| React DevTools Profiler（手動） | 30分 | ❌ | ⭐⭐⭐⭐⭐ 必須 |
| Reassure（自動） | 2-3時間 | ✅ | ⭐⭐⭐⭐ 推奨 |
| playwright-performance | 1時間 | ✅ | ⭐⭐⭐ オプション |

**最終推奨**:
1. **React DevTools Profilerで手動計測** → すぐに効果を確認
2. **時間があればReassureを導入** → 継続的な監視

---

## 📚 参考リンク

- [React DevTools Profiler 公式ドキュメント](https://react.dev/learn/react-developer-tools)
- [Reassure GitHub](https://github.com/callstack/reassure)
- [Web Vitals](https://web.dev/vitals/)
- [Playwright Performance Testing](https://playwright.dev/docs/test-advanced#performance-testing)
- [React Performance Optimization (2025)](https://react.dev/learn/render-and-commit)
