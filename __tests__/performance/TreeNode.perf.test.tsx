import { measureRenders } from 'reassure';
import { useState } from 'react';
import { TreeNode } from '../../src/components/TreeNode';
import type { TreeNodeData } from '../../src/types';
import { generateLargeTree, collectAllNodeIds, createExpandedMap, countNodes } from './helpers';

describe('TreeNode Performance', () => {
  test('renders efficiently with small tree (single node)', async () => {
    const mockNode: TreeNodeData = {
      id: '1',
      name: 'テストノード',
      children: []
    };

    await measureRenders(
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

  test('renders efficiently with nested tree (3 children)', async () => {
    const mockNode: TreeNodeData = {
      id: '1',
      name: 'ルート',
      children: [
        { id: '2', name: '子1', children: [] },
        { id: '3', name: '子2', children: [] },
        { id: '4', name: '子3', children: [] },
      ]
    };

    await measureRenders(
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

  test('renders efficiently with deep nesting (2 levels)', async () => {
    const mockNode: TreeNodeData = {
      id: '1',
      name: 'ルート',
      children: [
        {
          id: '2',
          name: '親1',
          children: [
            { id: '3', name: '子1-1', children: [] },
            { id: '4', name: '子1-2', children: [] },
          ]
        },
        {
          id: '5',
          name: '親2',
          children: [
            { id: '6', name: '子2-1', children: [] },
            { id: '7', name: '子2-2', children: [] },
          ]
        },
      ]
    };

    await measureRenders(
      <TreeNode
        node={mockNode}
        level={0}
        onAddNode={() => {}}
        onDeleteNode={() => {}}
        onMoveNode={() => {}}
        expandedNodes={new Map([
          ['1', true],
          ['2', true],
          ['5', true]
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

  test('renders efficiently with highlighted node', async () => {
    const mockNode: TreeNodeData = {
      id: '1',
      name: 'ハイライトされたノード',
      children: []
    };

    await measureRenders(
      <TreeNode
        node={mockNode}
        level={0}
        onAddNode={() => {}}
        onDeleteNode={() => {}}
        onMoveNode={() => {}}
        expandedNodes={new Map()}
        onToggleExpand={() => {}}
        highlightedNodeId="1"
        draggingNodeId={null}
        draggingNode={null}
        previewTarget={null}
        onDragStateChange={() => {}}
        onPreviewChange={() => {}}
      />
    );
  });

  test('renders efficiently while dragging', async () => {
    const mockNode: TreeNodeData = {
      id: '1',
      name: 'ドラッグ中のノード',
      children: []
    };

    await measureRenders(
      <TreeNode
        node={mockNode}
        level={0}
        onAddNode={() => {}}
        onDeleteNode={() => {}}
        onMoveNode={() => {}}
        expandedNodes={new Map()}
        onToggleExpand={() => {}}
        highlightedNodeId={null}
        draggingNodeId="1"
        draggingNode={mockNode}
        previewTarget={null}
        onDragStateChange={() => {}}
        onPreviewChange={() => {}}
      />
    );
  });

  // ===== 大規模ツリーでの再レンダリングテスト =====

  test('re-renders efficiently when highlightedNodeId changes (large tree with 50 descendants)', async () => {
    // 50個の子孫を持つ大規模なノードを生成
    const largeTree = generateLargeTree(50, 4);
    const mockNode = largeTree[0]; // 最初のルートノードを使用
    const allNodeIds = collectAllNodeIds([mockNode]);
    const expandedNodes = createExpandedMap(allNodeIds);

    const nodeCount = countNodes([mockNode]);
    console.log(`Generated TreeNode with ${nodeCount} descendants for highlightedNodeId test`);

    const TestComponent = () => {
      const [highlightedNodeId, setHighlightedNodeId] = useState<string | null>(null);

      if (typeof window !== 'undefined') {
        (window as any).__testSetHighlightedNodeId = setHighlightedNodeId;
      }

      return (
        <TreeNode
          node={mockNode}
          level={0}
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
        // ルートをハイライト
        (window as any).__testSetHighlightedNodeId(mockNode.id);
        await new Promise(resolve => setTimeout(resolve, 50));

        // 子ノードをハイライト
        if (mockNode.children.length > 0) {
          (window as any).__testSetHighlightedNodeId(mockNode.children[0].id);
          await new Promise(resolve => setTimeout(resolve, 50));
        }

        // ハイライト解除
        (window as any).__testSetHighlightedNodeId(null);
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    });
  });

  test('re-renders efficiently when expandedNodes changes (large tree with 50 descendants)', async () => {
    const largeTree = generateLargeTree(50, 4);
    const mockNode = largeTree[0];
    const allNodeIds = collectAllNodeIds([mockNode]);

    const nodeCount = countNodes([mockNode]);
    console.log(`Generated TreeNode with ${nodeCount} descendants for expandedNodes test`);

    const TestComponent = () => {
      const [expandedNodes, setExpandedNodes] = useState<Map<string, boolean>>(new Map());

      if (typeof window !== 'undefined') {
        (window as any).__testSetExpandedNodes = setExpandedNodes;
      }

      return (
        <TreeNode
          node={mockNode}
          level={0}
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

        // ルートだけ展開
        const rootOnly = new Map([[mockNode.id, true]]);
        (window as any).__testSetExpandedNodes(rootOnly);
        await new Promise(resolve => setTimeout(resolve, 50));

        // 全て折りたたみ
        (window as any).__testSetExpandedNodes(new Map());
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    });
  });

  test('renders efficiently with large nested tree - initial render only (100 descendants)', async () => {
    const largeTree = generateLargeTree(100, 5);
    const mockNode = largeTree[0];
    const allNodeIds = collectAllNodeIds([mockNode]);
    const expandedNodes = createExpandedMap(allNodeIds);

    const nodeCount = countNodes([mockNode]);
    console.log(`Generated TreeNode with ${nodeCount} descendants for initial render test`);

    await measureRenders(
      <TreeNode
        node={mockNode}
        level={0}
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
