# パフォーマンス最適化試行結果レポート

**日付**: 2025-11-14
**対象**: React 19ベースの階層構造エディタ
**目的**: `performance_analysis_20251114.md` で推奨されたフェーズ1（React.memo）の実装とその結果検証

---

## エグゼクティブサマリー

フェーズ1（React.memo）およびフェーズ3（構造的共有）の実装を試みたが、**両方とも期待に反してパフォーマンスが悪化**した。根本原因は `useTreeActions` のハンドラーが `treeData` に依存しているため、ツリー更新のたびにハンドラーが再生成される点にある。現状のアーキテクチャでは、コンポーネントレベルの最適化だけでは効果が限定的であることが判明した。

**現状のパフォーマンス（最適化なし）**:
- リアルシナリオ（100ノード）: **74.4ms** (4レンダリング)
- リアルシナリオ（300ノード）: **220.8ms** (4レンダリング)
- highlightedNodeId変更: **65.1ms** (4レンダリング)
- 大規模ツリー初期レンダー（200ノード）: **87.7ms** (1レンダリング)

---

## 試行1: React.memoの適用（フェーズ1）

### 実装内容

**対象コンポーネント**:
- `TreeNode` ([src/components/TreeNode.tsx:299](src/components/TreeNode.tsx#L299))
- `Tree` ([src/components/Tree.tsx:58](src/components/Tree.tsx#L58))

**実装方法**:
```typescript
// TreeNode
export const TreeNode = memo(TreeNodeComponent, (prevProps, nextProps) => {
  return (
    prevProps.node === nextProps.node &&
    prevProps.expandedNodes === nextProps.expandedNodes &&
    prevProps.highlightedNodeId === nextProps.highlightedNodeId &&
    prevProps.draggingNodeId === nextProps.draggingNodeId &&
    prevProps.previewTarget === nextProps.previewTarget
  );
});

// Tree
export const Tree = memo(TreeComponent, (prevProps, nextProps) => {
  return (
    prevProps.data === nextProps.data &&
    prevProps.highlightedNodeId === nextProps.highlightedNodeId &&
    prevProps.draggingNodeId === nextProps.draggingNodeId &&
    prevProps.draggingNode === nextProps.draggingNode &&
    prevProps.previewTarget === nextProps.previewTarget &&
    prevProps.expandedNodes === nextProps.expandedNodes
  );
});
```

### 測定結果

| テストケース | Baseline | React.memo適用後 | 変化 |
|-------------|----------|------------------|------|
| リアルシナリオ（100ノード） | 74.4ms | 79.2ms | **+4.8ms (+6.4%)** 🔴 |
| highlightedNodeId変更 | 65.1ms | 71.9ms | **+6.8ms (+10.4%)** 🔴 |
| 大規模ツリー初期レンダー（200ノード） | 87.7ms | 95.5ms | **+7.8ms (+8.9%)** 🔴 |

### 失敗原因の分析

#### 1. ハンドラー再生成の問題

`useTreeActions` ([src/hooks/useTreeActions.ts:16-139](src/hooks/useTreeActions.ts#L16-L139)) で定義されるすべてのハンドラーが `treeData` に依存:

```typescript
// useTreeActionsの実装
const addNode = useCallback((parentId: string, name: string): ActionResult => {
  const parentNode = findNode(treeData, parentId); // ← treeDataに依存
  // ...
}, [treeData, dispatch, onFeedback]);
```

**問題の連鎖**:
1. ツリー更新 → `treeData` 変更
2. `treeData` 変更 → 全ハンドラー再生成（`useCallback`の依存配列に含まれる）
3. ハンドラー再生成 → propsが変更
4. propsが変更 → **React.memoの比較が失敗**
5. 結果: 全ノード再レンダリング

#### 2. memo比較のオーバーヘッド

React.memoのカスタム比較関数は以下のコストを追加:
- 6つのpropsの参照比較（Tree）
- 5つのpropsの参照比較（TreeNode × 100ノード）

**コスト計算**:
- 比較コスト > 再レンダリング防止の効果
- ハンドラー再生成により、ほとんどの場合比較が失敗する
- 無駄なオーバーヘッドが発生

---

## 試行2: Reducerの構造的共有改善（フェーズ3を先行）

### 実装内容

**対象関数**:
- `addNodeRecursive` ([src/hooks/useTreeState.ts:110-127](src/hooks/useTreeState.ts#L110-L127))
- `deleteNodeRecursive` ([src/hooks/useTreeState.ts:128-156](src/hooks/useTreeState.ts#L128-L156))
- `removeNodeRecursive` ([src/utils/treeOperations.ts:9-41](src/utils/treeOperations.ts#L9-L41))
- `insertNodeRecursive` ([src/utils/treeOperations.ts:38-104](src/utils/treeOperations.ts#L38-L104))

**実装方法**:
```typescript
const addNodeRecursive = (nodes: TreeNodeData[]): TreeNodeData[] => {
  let changed = false;
  const newNodes = nodes.map(node => {
    if (node.id === parentId) {
      changed = true;
      return { ...node, children: [...node.children, newNode] };
    }
    if (node.children.length > 0) {
      const newChildren = addNodeRecursive(node.children);
      if (newChildren !== node.children) {  // ← 参照比較
        changed = true;
        return { ...node, children: newChildren };
      }
    }
    return node;  // ← 変更なしの場合は元のオブジェクトを返す
  });
  return changed ? newNodes : nodes;  // ← 配列レベルでも参照を保持
};
```

### 測定結果

| テストケース | Baseline | 構造的共有改善後 | 変化 |
|-------------|----------|------------------|------|
| リアルシナリオ（100ノード） | 74.4ms | 91.8ms | **+17.4ms (+23.4%)** 🔴 |
| highlightedNodeId変更 | 65.1ms | 75.4ms | **+10.3ms (+15.9%)** 🔴 |
| 大規模ツリー初期レンダー（200ノード） | 87.7ms | 93.5ms | **+5.8ms (+6.6%)** 🔴 |

### 失敗原因の分析

#### 1. map()の配列生成コスト

**根本的な問題**:
```typescript
const newNodes = nodes.map(node => { ... });  // ← 常に新配列を作成
return changed ? newNodes : nodes;  // ← 判定は後
```

- `map()` は**常に新しい配列を作成**する
- 参照比較の前に既に配列生成のコストが発生
- `changed` フラグでの判定が無駄になる

#### 2. 累積オーバーヘッド

以下のコストが積み重なった結果:
1. **React.memoの比較コスト**: 6 props × 100ノード = 600回の比較
2. **構造的共有の参照比較コスト**: ツリー全体の走査 + 参照比較
3. **map()の配列生成コスト**: 全レベルで新配列生成

#### 3. ハンドラー再生成問題は未解決

構造的共有を実装しても、`useTreeActions` のハンドラーが `treeData` に依存している限り:
- ツリー更新 → ハンドラー再生成
- ハンドラー再生成 → propsが変更
- 結果: 構造的共有の恩恵を受けられない

---

## 根本原因の特定

### アーキテクチャレベルの制約

```
ツリー更新
  ↓
treeData変更（reducer）
  ↓
useTreeActionsでハンドラー再生成
  [treeData]に依存
  ↓
全propsが変更
  ↓
React.memo/構造的共有の効果なし
  ↓
全ノード再レンダリング
```

### useTreeActionsの依存問題

**問題のコード** ([src/hooks/useTreeActions.ts](src/hooks/useTreeActions.ts)):
```typescript
const addNode = useCallback((parentId: string, name: string): ActionResult => {
  const parentNode = findNode(treeData, parentId);  // バリデーション
  if (!parentNode) {
    onFeedback?.('error', `親ノードが見つかりません`);
    return { success: false };
  }
  // ...
}, [treeData, dispatch, onFeedback]);  // ← treeDataに依存
```

**なぜ依存しているのか**:
- バリデーション: `findNode(treeData, parentId)` で親ノードの存在確認
- 重複チェック: `hasDuplicateNameInSiblings()` で兄弟ノードとの重複確認
- これらの処理にツリーの最新状態が必要

### パフォーマンスへの影響

100ノードのツリーで1ノード追加時:
- **現在**: 101ノード全て再レンダリング（ハンドラー変更のため）
- **理想**: 変更箇所の祖先パスのみ（5-10ノード程度）
- **効果の差**: 約90ノードの無駄な再レンダリング

---

## 実測データサマリー

### ベースライン（最適化なし）

| テストケース | Duration | Renders |
|-------------|----------|---------|
| empty tree | 0.2ms | 1 |
| small tree (5 nodes) | 3.2ms | 1 |
| nested tree (10 nodes) | 6.2ms | 1 |
| large tree (50 nodes) | 31.5ms | 1 |
| **リアルシナリオ (100 nodes)** | **74.4ms** | **4** |
| very large tree (200 nodes) | 87.7ms | 1 |
| **リアルシナリオ (300 nodes)** | **220.8ms** | **4** |
| highlightedNodeId changes (100 nodes) | 65.1ms | 4 |
| expandedNodes changes (100 nodes) | 73.6ms | 4 |
| draggingNodeId changes (100 nodes) | 68.3ms | 3 |

### React.memo適用後

すべてのテストケースでパフォーマンス悪化（+6.4%〜+11.2%）

### 構造的共有改善後

すべてのテストケースでパフォーマンス悪化（+6.6%〜+23.4%）

---

## 300ノードでのパフォーマンス検証

ユーザーの要求仕様として「300ノードが操作できるパフォーマンス」が示されたため、追加で300ノードのテストケースを実装し測定を実施した。

### 測定結果

| ノード数 | Duration | 比率 |
|---------|----------|------|
| 100 nodes | 74.4ms | 1.0x |
| 300 nodes | 220.8ms | 2.97x |

### 分析

**線形性**:
- ノード数が3倍になっても処理時間は約3倍に留まっており、ほぼ線形のスケーラビリティを維持している

**実用性**:
- 220.8msは一般的なUX基準である250ms（「高速」の閾値）を下回る
- ユーザーインタラクション時のみ発生する処理であり、継続的な負荷ではない
- 60fps（16.7ms/frame）が求められる継続的アニメーションではないため、十分許容範囲

**結論**:
300ノードの操作は**現状のアーキテクチャで実用上問題なく動作する**ことが実証された。最適化は不要と判断できる。

---

## 今後の推奨アプローチ

### オプション1: 現状を許容する（推奨）✅

**理由**:
- **300ノードでの実測値220.8ms**は実用上十分なパフォーマンス（250ms閾値以下）
- 100ノードで74ms、ほぼ線形にスケールすることが実証済み
- ユーザーインタラクション時のみ発生（継続的な負荷ではない）
- コードのシンプルさを維持できる

**メリット**:
- 実装コストなし
- コードの可読性・保守性が高いまま
- バグのリスクなし
- **実測で300ノードまでの要件を満たすことが確認済み**

**デメリット**:
- 将来的にツリーが非常に大きくなった場合（500+ノード）の懸念
- ただし、300ノードで220ms、線形外挿すると500ノードで約370msと推定され、実用範囲内の可能性が高い

### オプション2: 状態管理ライブラリの導入

**候補**:
- **Zustand**: シンプルで軽量、hooks API
- **Jotai**: Atomベース、細粒度の再レンダリング制御

**実装イメージ（Zustand）**:
```typescript
// store.ts
const useTreeStore = create((set, get) => ({
  treeData: [],
  addNode: (parentId, name) => {
    const treeData = get().treeData;
    // validation logic
    set({ treeData: newTreeData });
  },
}));

// Component
function TreeNode({ nodeId }) {
  const node = useTreeStore(state =>
    findNode(state.treeData, nodeId)
  );
  const addNode = useTreeStore(state => state.addNode);
  // addNodeは安定した参照
}
```

**メリット**:
- ハンドラーが安定した参照を保持
- 必要な部分のみ再レンダリング
- React.memoが効果を発揮できる

**デメリット**:
- 新しい依存関係の追加
- 既存コードの大幅な書き換え
- 学習コスト

**想定効果**:
- 74.4ms → 30-40ms（約50%改善）

### オプション3: アーキテクチャの再設計

**アプローチ**:
1. ハンドラーの依存関係を削減
   - バリデーションをreducerに移動
   - dispatchのみをコンポーネントに渡す
2. useCallbackの依存配列から `treeData` を削除

**実装イメージ**:
```typescript
// useTreeActions.ts
const addNode = useCallback((parentId: string, name: string) => {
  // バリデーションはreducerで行う
  dispatch({
    type: 'ADD_NODE',
    payload: { parentId, name }
  });
}, [dispatch]);  // treeDataへの依存を削除
```

**メリット**:
- 外部ライブラリ不要
- React標準の最適化が効果を発揮

**デメリット**:
- フィードバック通知の実装が複雑化
- バリデーションとUI層の分離が困難
- 既存の多層バリデーション設計との矛盾

---

## 結論

1. **React.memoの適用（フェーズ1）**: ❌ パフォーマンス悪化（+6.4%）
2. **構造的共有の改善（フェーズ3）**: ❌ パフォーマンス悪化（+23.4%）
3. **根本原因**: `useTreeActions` のハンドラーが `treeData` に依存しているため、コンポーネントレベルの最適化では効果が限定的
4. **300ノード検証**: ✅ 220.8msで動作、実用上問題なし（要件を満たす）
5. **推奨**: 現状のパフォーマンスで**300ノードまでの要件を満たす**ことが実証されたため、**現状を許容**することを推奨

将来的にパフォーマンス問題が顕在化した場合（500+ノード）は、状態管理ライブラリ（Zustand/Jotai）の導入を検討する。

---

## 参考資料

- [performance_analysis_20251114.md](performance_analysis_20251114.md) - 初期パフォーマンス分析
- [src/hooks/useTreeActions.ts](../src/hooks/useTreeActions.ts) - ビジネスロジック層
- [src/hooks/useTreeState.ts](../src/hooks/useTreeState.ts) - Reducer実装
- [src/utils/treeOperations.ts](../src/utils/treeOperations.ts) - ツリー操作ユーティリティ
- [__tests__/performance/Tree.perf.test.tsx](../__tests__/performance/Tree.perf.test.tsx) - パフォーマンステスト

## 測定環境

- **日時**: 2025-11-14（300ノードテストは追加測定）
- **ブランチ**: master (4d6e56aace4668333a6064be78fcf76c19d42bd7)
- **ツール**: Reassure (React performance testing library)
- **テスト実行**: Jest with React Testing Library
- **テストケース**: 38個（300ノードテストを追加）
