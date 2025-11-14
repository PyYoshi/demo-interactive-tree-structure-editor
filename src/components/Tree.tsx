import type { FC } from 'react';
import type { TreeNodeData } from '../types';
import { TreeNode } from './TreeNode';

interface TreeProps {
  data: TreeNodeData[];
  onAddNode: (parentId: string, name: string) => void;
  onDeleteNode: (nodeId: string) => void;
  onMoveNode: (sourceId: string, targetId: string, position: 'before' | 'after' | 'inside') => void;
  expandedNodes: Map<string, boolean>;
  onToggleExpand: (nodeId: string, newExpandedState: boolean) => void;
  highlightedNodeId: string | null;
  draggingNodeId: string | null;
  draggingNode: TreeNodeData | null;
  previewTarget: { targetId: string, position: 'before' | 'after' | 'inside' } | null;
  onDragStateChange: (nodeId: string | null) => void;
  onPreviewChange: (target: { targetId: string, position: 'before' | 'after' | 'inside' } | null) => void;
}

export const Tree: FC<TreeProps> = ({
  data,
  onAddNode,
  onDeleteNode,
  onMoveNode,
  expandedNodes,
  onToggleExpand,
  highlightedNodeId,
  draggingNodeId,
  draggingNode,
  previewTarget,
  onDragStateChange,
  onPreviewChange
}) => {
  return (
    <div>
      {data.map((node) => (
        <TreeNode
          key={node.id}
          node={node}
          level={0}
          onAddNode={onAddNode}
          onDeleteNode={onDeleteNode}
          onMoveNode={onMoveNode}
          expandedNodes={expandedNodes}
          onToggleExpand={onToggleExpand}
          highlightedNodeId={highlightedNodeId}
          draggingNodeId={draggingNodeId}
          draggingNode={draggingNode}
          previewTarget={previewTarget}
          onDragStateChange={onDragStateChange}
          onPreviewChange={onPreviewChange}
        />
      ))}
    </div>
  );
};