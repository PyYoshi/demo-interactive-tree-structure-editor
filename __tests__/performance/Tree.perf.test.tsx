import { measureRenders } from 'reassure';
import { useState } from 'react';
import { Tree } from '../../src/components/Tree';
import type { TreeNodeData } from '../../src/types';
import { generateLargeTree, collectAllNodeIds, createExpandedMap, countNodes } from './helpers';

describe('Tree Performance', () => {
  test('renders efficiently with empty tree', async () => {
    const data: TreeNodeData[] = [];

    await measureRenders(
      <Tree
        data={data}
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

  test('renders efficiently with small tree (5 nodes)', async () => {
    const data: TreeNodeData[] = [
      { id: '1', name: 'ノード1', children: [] },
      { id: '2', name: 'ノード2', children: [] },
      { id: '3', name: 'ノード3', children: [] },
      { id: '4', name: 'ノード4', children: [] },
      { id: '5', name: 'ノード5', children: [] },
    ];

    await measureRenders(
      <Tree
        data={data}
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

  test('renders efficiently with nested tree (10 nodes)', async () => {
    const data: TreeNodeData[] = [
      {
        id: '1',
        name: '大学',
        children: [
          {
            id: '2',
            name: '理工学部',
            children: [
              { id: '3', name: '情報工学科', children: [] },
              { id: '4', name: '電気工学科', children: [] },
            ]
          },
          {
            id: '5',
            name: '文学部',
            children: [
              { id: '6', name: '国文学科', children: [] },
              { id: '7', name: '英文学科', children: [] },
            ]
          },
        ]
      },
      {
        id: '8',
        name: '企業',
        children: [
          { id: '9', name: '営業部', children: [] },
          { id: '10', name: '開発部', children: [] },
        ]
      },
    ];

    await measureRenders(
      <Tree
        data={data}
        onAddNode={() => {}}
        onDeleteNode={() => {}}
        onMoveNode={() => {}}
        expandedNodes={new Map([
          ['1', true],
          ['2', true],
          ['5', true],
          ['8', true]
        ])}
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

  test('renders efficiently with large tree (50 nodes)', async () => {
    // 50個のノードを持つツリーを生成
    const generateLargeTree = (): TreeNodeData[] => {
      const root: TreeNodeData[] = [];
      let idCounter = 1;

      // 5つのルートノードを作成
      for (let i = 0; i < 5; i++) {
        const rootNode: TreeNodeData = {
          id: String(idCounter++),
          name: `ルート${i + 1}`,
          children: []
        };

        // 各ルートノードに3つの子ノードを作成
        for (let j = 0; j < 3; j++) {
          const childNode: TreeNodeData = {
            id: String(idCounter++),
            name: `子${i + 1}-${j + 1}`,
            children: []
          };

          // 各子ノードに3つの孫ノードを作成
          for (let k = 0; k < 3; k++) {
            childNode.children.push({
              id: String(idCounter++),
              name: `孫${i + 1}-${j + 1}-${k + 1}`,
              children: []
            });
          }

          rootNode.children.push(childNode);
        }

        root.push(rootNode);
      }

      return root;
    };

    const data = generateLargeTree();

    // 全てのノードを展開
    const expandedNodes = new Map<string, boolean>();
    for (let i = 1; i <= 50; i++) {
      expandedNodes.set(String(i), true);
    }

    await measureRenders(
      <Tree
        data={data}
        onAddNode={() => {}}
        onDeleteNode={() => {}}
        onMoveNode={() => {}}
        expandedNodes={expandedNodes}
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

  test('renders efficiently with highlighted node in nested tree', async () => {
    const data: TreeNodeData[] = [
      {
        id: '1',
        name: 'ルート',
        children: [
          { id: '2', name: '子1', children: [] },
          { id: '3', name: '子2（ハイライト）', children: [] },
          { id: '4', name: '子3', children: [] },
        ]
      },
    ];

    await measureRenders(
      <Tree
        data={data}
        onAddNode={() => {}}
        onDeleteNode={() => {}}
        onMoveNode={() => {}}
        expandedNodes={new Map([['1', true]])}
        onToggleExpand={() => {}}
        highlightedNodeId="3"
        draggingNodeId={null}
        draggingNode={null}
        previewTarget={null}
        onDragStateChange={() => {}}
        onPreviewChange={() => {}}
      />
    );
  });

  // ===== 大規模ツリーでの再レンダリングテスト =====

  test('re-renders efficiently when highlightedNodeId changes (100 nodes)', async () => {
    const data = generateLargeTree(100, 4);
    const allNodeIds = collectAllNodeIds(data);
    const expandedNodes = createExpandedMap(allNodeIds);

    // コンソールにノード数を出力（デバッグ用）
    const nodeCount = countNodes(data);
    console.log(`Generated tree with ${nodeCount} nodes for highlightedNodeId test`);

    const TestComponent = () => {
      const [highlightedNodeId, setHighlightedNodeId] = useState<string | null>(null);

      // scenario関数内で呼び出される関数を公開
      if (typeof window !== 'undefined') {
        (window as any).__testSetHighlightedNodeId = setHighlightedNodeId;
      }

      return (
        <Tree
          data={data}
          onAddNode={() => {}}
          onDeleteNode={() => {}}
          onMoveNode={() => {}}
          expandedNodes={expandedNodes}
          onToggleExpand={() => {}}
          highlightedNodeId={highlightedNodeId}
          draggingNodeId={null}
          draggingNode={null}
          previewTarget={null}
          onDragStateChange={() => {}}
          onPreviewChange={() => {}}
        />
      );
    };

    await measureRenders(<TestComponent />, {
      scenario: async () => {
        // 最初のノードをハイライト
        (window as any).__testSetHighlightedNodeId(allNodeIds[0]);
        await new Promise(resolve => setTimeout(resolve, 50));

        // 別のノードをハイライト
        (window as any).__testSetHighlightedNodeId(allNodeIds[Math.floor(allNodeIds.length / 2)]);
        await new Promise(resolve => setTimeout(resolve, 50));

        // ハイライト解除
        (window as any).__testSetHighlightedNodeId(null);
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    });
  });

  test('re-renders efficiently when expandedNodes changes (100 nodes)', async () => {
    const data = generateLargeTree(100, 4);
    const allNodeIds = collectAllNodeIds(data);

    const nodeCount = countNodes(data);
    console.log(`Generated tree with ${nodeCount} nodes for expandedNodes test`);

    const TestComponent = () => {
      const [expandedNodes, setExpandedNodes] = useState<Map<string, boolean>>(new Map());

      if (typeof window !== 'undefined') {
        (window as any).__testSetExpandedNodes = setExpandedNodes;
      }

      return (
        <Tree
          data={data}
          onAddNode={() => {}}
          onDeleteNode={() => {}}
          onMoveNode={() => {}}
          expandedNodes={expandedNodes}
          onToggleExpand={() => {}}
          highlightedNodeId={null}
          draggingNodeId={null}
          draggingNode={null}
          previewTarget={null}
          onDragStateChange={() => {}}
          onPreviewChange={() => {}}
        />
      );
    };

    await measureRenders(<TestComponent />, {
      scenario: async () => {
        // 全ノードを展開
        (window as any).__testSetExpandedNodes(createExpandedMap(allNodeIds));
        await new Promise(resolve => setTimeout(resolve, 50));

        // 全ノードを折りたたみ
        (window as any).__testSetExpandedNodes(new Map());
        await new Promise(resolve => setTimeout(resolve, 50));

        // 半分のノードを展開
        const halfExpanded = createExpandedMap(allNodeIds.slice(0, Math.floor(allNodeIds.length / 2)));
        (window as any).__testSetExpandedNodes(halfExpanded);
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    });
  });

  test('re-renders efficiently when draggingNodeId changes (100 nodes)', async () => {
    const data = generateLargeTree(100, 4);
    const allNodeIds = collectAllNodeIds(data);
    const expandedNodes = createExpandedMap(allNodeIds);

    const nodeCount = countNodes(data);
    console.log(`Generated tree with ${nodeCount} nodes for draggingNodeId test`);

    const TestComponent = () => {
      const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);

      if (typeof window !== 'undefined') {
        (window as any).__testSetDraggingNodeId = setDraggingNodeId;
      }

      return (
        <Tree
          data={data}
          onAddNode={() => {}}
          onDeleteNode={() => {}}
          onMoveNode={() => {}}
          expandedNodes={expandedNodes}
          onToggleExpand={() => {}}
          highlightedNodeId={null}
          draggingNodeId={draggingNodeId}
          draggingNode={null}
          previewTarget={null}
          onDragStateChange={() => {}}
          onPreviewChange={() => {}}
        />
      );
    };

    await measureRenders(<TestComponent />, {
      scenario: async () => {
        // ドラッグ開始
        (window as any).__testSetDraggingNodeId(allNodeIds[0]);
        await new Promise(resolve => setTimeout(resolve, 50));

        // ドラッグ終了
        (window as any).__testSetDraggingNodeId(null);
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    });
  });

  test('renders efficiently with very large tree - initial render only (200 nodes)', async () => {
    const data = generateLargeTree(200, 5);
    const allNodeIds = collectAllNodeIds(data);
    const expandedNodes = createExpandedMap(allNodeIds);

    const nodeCount = countNodes(data);
    console.log(`Generated tree with ${nodeCount} nodes for initial render test`);

    await measureRenders(
      <Tree
        data={data}
        onAddNode={() => {}}
        onDeleteNode={() => {}}
        onMoveNode={() => {}}
        expandedNodes={expandedNodes}
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
