import { describe, test } from 'vitest';
import { measurePerformance } from 'reassure';
import { Tree } from '../../src/components/Tree';
import type { TreeNodeData } from '../../src/types';

describe('Tree Performance', () => {
  test('renders efficiently with empty tree', async () => {
    const data: TreeNodeData[] = [];

    await measurePerformance(
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

    await measurePerformance(
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

    await measurePerformance(
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

    await measurePerformance(
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

    await measurePerformance(
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
});
