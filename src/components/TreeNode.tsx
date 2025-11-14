import { useState, useRef } from 'react';
import type { FC, ReactNode, FormEvent, DragEvent } from 'react';
import type { TreeNodeData } from '../types';
import { AddIcon, DeleteIcon, ChevronDownIcon, ChevronRightIcon } from './icons';

type DropPosition = 'before' | 'after' | 'inside';

interface TreeNodeProps {
  node: TreeNodeData;
  level: number;
  onAddNode: (parentId: string, name: string) => void;
  onDeleteNode: (nodeId:string) => void;
  onMoveNode: (sourceId: string, targetId: string, position: DropPosition) => void;
  expandedNodes: Map<string, boolean>;
  onToggleExpand: (nodeId: string, newExpandedState: boolean) => void;
  highlightedNodeId: string | null;
  draggingNodeId: string | null;
  draggingNode: TreeNodeData | null;
  previewTarget: { targetId: string, position: 'before' | 'after' | 'inside' } | null;
  onDragStateChange: (nodeId: string | null) => void;
  onPreviewChange: (target: { targetId: string, position: 'before' | 'after' | 'inside' } | null) => void;
}

const ActionButton: FC<{ onClick?: () => void; children: ReactNode; disabled?: boolean; title: string }> = ({ onClick, children, disabled = false, title }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        title={title}
        aria-label={title}
        className={`p-1 rounded-md transition-colors ${
            disabled
                ? 'text-gray-300 cursor-not-allowed'
                : 'text-gray-500 hover:bg-gray-200 hover:text-gray-800'
        }`}
    >
        {children}
    </button>
);

export const TreeNode: FC<TreeNodeProps> = ({
  node,
  level,
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
  const [isAdding, setIsAdding] = useState(false);
  const [newNodeName, setNewNodeName] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [dropPosition, setDropPosition] = useState<DropPosition | null>(null);
  const [isInvalidDrop, setIsInvalidDrop] = useState(false);

  const nodeRef = useRef<HTMLDivElement>(null);

  const hasChildren = node.children && node.children.length > 0;

  // デフォルトで level < 2 のノードは展開状態
  const isExpanded = expandedNodes.has(node.id) ? expandedNodes.get(node.id)! : level < 2;

  // このノードがハイライトされるべきか
  const isHighlighted = highlightedNodeId === node.id;

  // ドロップ位置を計算する共通関数
  const calculateDropPosition = (clientY: number): DropPosition => {
    if (!nodeRef.current) return 'inside';

    const rect = nodeRef.current.getBoundingClientRect();
    const y = clientY - rect.top;
    const height = rect.height;

    const beforeAfterZoneSize = hasChildren ? height * 0.3 : height * 0.35;
    const insideZoneStart = beforeAfterZoneSize;
    const insideZoneEnd = height - beforeAfterZoneSize;

    if (y < insideZoneStart) {
      return 'before';
    } else if (y > insideZoneEnd) {
      return 'after';
    } else {
      return 'inside';
    }
  };

  const handleAddSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (newNodeName.trim()) {
      onAddNode(node.id, newNodeName.trim());
      setNewNodeName('');
      setIsAdding(false);
      onToggleExpand(node.id, true);
    }
  };
  
  const handleDragStart = (e: DragEvent<HTMLDivElement>) => {
    e.stopPropagation(); // イベント伝搬を防いで親ノードのドラッグを防止
    e.dataTransfer.setData('application/json', JSON.stringify({ sourceId: node.id }));
    e.dataTransfer.effectAllowed = 'move';
    onDragStateChange(node.id);
    setTimeout(() => setIsDragging(true), 0);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    onDragStateChange(null);
    onPreviewChange(null);
    setIsInvalidDrop(false);
    setDropPosition(null);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (!nodeRef.current) return;

    // 自分自身にドロップしようとしている場合は禁止
    if (draggingNodeId === node.id) {
      e.dataTransfer.dropEffect = 'none';
      setIsInvalidDrop(true);
      setDropPosition(null);
      onPreviewChange(null);
      return;
    }

    // 有効なドロップの場合
    setIsInvalidDrop(false);

    // 共通関数でドロップ位置を計算
    const position = calculateDropPosition(e.clientY);
    setDropPosition(position);

    // プレビュー情報を通知
    onPreviewChange({ targetId: node.id, position });

    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.stopPropagation(); // イベント伝搬を防いで親ノードの状態更新を防止
    // より確実な離脱判定: relatedTargetがnullまたはこのノードの外の場合のみクリア
    const relatedTarget = e.relatedTarget as HTMLElement | null;

    // relatedTargetがnullの場合、または明らかに外に出た場合
    if (!relatedTarget || !nodeRef.current?.contains(relatedTarget)) {
      setDropPosition(null);
      setIsInvalidDrop(false);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (!nodeRef.current) return;

    // ドロップ時点での正確な位置を共通関数で計算
    const finalPosition = calculateDropPosition(e.clientY);

    try {
        const data = e.dataTransfer.getData('application/json');
        if (data) {
            const { sourceId } = JSON.parse(data);
            if(sourceId !== node.id) {
                onMoveNode(sourceId, node.id, finalPosition);
            }
        }
    } catch (err) {
        console.error("Failed to parse drag data", err);
    } finally {
        setDropPosition(null);
        setIsDragging(false);
        onPreviewChange(null);
    }
  };

  return (
    <>
      <div style={{ paddingLeft: `${level * 1.5}rem` }} className={`my-1 transition-all duration-200 ${isDragging ? 'opacity-50 scale-95 pointer-events-none' : 'opacity-100 scale-100'}`}>
        <div
        ref={nodeRef}
        role="treeitem"
        aria-expanded={hasChildren ? isExpanded : undefined}
        className={`group relative flex items-center justify-between rounded-lg p-2 transition-all duration-150 cursor-grab active:cursor-grabbing hover:shadow-md ${
          isHighlighted
            ? 'bg-green-100 border-2 border-green-500 shadow-lg'
            : 'bg-white hover:bg-gray-100'
        }`}
        draggable="true"
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex items-center flex-grow truncate">
          {hasChildren ? (
            <button
              onClick={() => onToggleExpand(node.id, !isExpanded)}
              className="p-1 mr-1 text-gray-500"
              aria-label={isExpanded ? "折りたたむ" : "展開する"}
            >
                {isExpanded ? <ChevronDownIcon /> : <ChevronRightIcon />}
            </button>
          ) : (
            <span className="w-6 mr-1"></span>
          )}
          <span className="text-gray-800 select-none truncate">{node.name}</span>
        </div>
        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <ActionButton onClick={() => setIsAdding(true)} title="子ノードを追加">
                <AddIcon />
            </ActionButton>
            <ActionButton onClick={() => onDeleteNode(node.id)} title="削除">
                <DeleteIcon />
            </ActionButton>
        </div>

        {isInvalidDrop && (
          <div className="absolute inset-0 bg-red-100 bg-opacity-60 rounded-lg border-2 border-red-500 border-solid">
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-red-700 font-bold text-sm bg-white px-3 py-1 rounded-full shadow-md">✕ ドロップ不可</span>
            </div>
          </div>
        )}

        {dropPosition && !isInvalidDrop && (
          <>
            {dropPosition === 'before' && (
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 via-blue-600 to-blue-500 animate-pulse shadow-lg pointer-events-none" style={{boxShadow: '0 0 10px rgba(59, 130, 246, 0.8)'}} />
            )}
            {dropPosition === 'after' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 via-blue-600 to-blue-500 animate-pulse shadow-lg pointer-events-none" style={{boxShadow: '0 0 10px rgba(59, 130, 246, 0.8)'}} />
            )}
            {dropPosition === 'inside' && (
              <div className="absolute inset-0 bg-blue-100 bg-opacity-50 rounded-lg border-2 border-blue-500 border-dashed animate-pulse pointer-events-none">
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-blue-700 font-semibold text-sm bg-white px-3 py-1 rounded-full shadow-md">子として追加</span>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {isAdding && (
        <form onSubmit={handleAddSubmit} className="ml-8 mt-2 flex items-center space-x-2">
            <input
                type="text"
                value={newNodeName}
                onChange={(e) => setNewNodeName(e.target.value)}
                placeholder="新しいノード名..."
                autoFocus
                className="flex-grow px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
            <button type="submit" className="px-3 py-1.5 text-sm font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                保存
            </button>
            <button type="button" onClick={() => setIsAdding(false)} className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none">
                キャンセル
            </button>
        </form>
      )}

      {isExpanded && hasChildren && (
        <div className="mt-1 border-l-2 border-gray-200 ml-3">
          {node.children.map((childNode) => (
            <TreeNode
              key={childNode.id}
              node={childNode}
              level={level + 1}
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
      )}
    </div>
    </>
  );
};