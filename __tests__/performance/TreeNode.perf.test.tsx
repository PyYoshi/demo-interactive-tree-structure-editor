import { describe, test } from 'vitest';
import { measurePerformance } from 'reassure';
import { TreeNode } from '../../src/components/TreeNode';
import type { TreeNodeData } from '../../src/types';

describe('TreeNode Performance', () => {
  test('renders efficiently with small tree (single node)', async () => {
    const mockNode: TreeNodeData = {
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

    await measurePerformance(
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

    await measurePerformance(
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
        draggingNodeId="1"
        draggingNode={mockNode}
        previewTarget={null}
        onDragStateChange={() => {}}
        onPreviewChange={() => {}}
      />
    );
  });
});
