import type { TreeNodeData } from '../../src/types';

/**
 * 大規模なツリーデータを生成するヘルパー関数
 * @param totalNodes 生成するノードの総数（目標値）
 * @param depth ツリーの深さ
 * @returns 生成されたツリーデータ
 */
export const generateLargeTree = (totalNodes: number, depth: number): TreeNodeData[] => {
  let idCounter = 1;
  let nodesCreated = 0;

  const createNode = (level: number, parentIndex: number): TreeNodeData | null => {
    if (nodesCreated >= totalNodes || level > depth) {
      return null;
    }

    const id = String(idCounter++);
    nodesCreated++;

    const node: TreeNodeData = {
      id,
      name: level === 0 ? `ルート${parentIndex + 1}` : `ノード${id}`,
      children: []
    };

    // 子ノードを作成（深さが残っている場合）
    if (level < depth && nodesCreated < totalNodes) {
      const childrenCount = level === 0 ? 5 : 3; // ルートは5つ、それ以外は3つ
      for (let i = 0; i < childrenCount && nodesCreated < totalNodes; i++) {
        const child = createNode(level + 1, i);
        if (child) {
          node.children.push(child);
        }
      }
    }

    return node;
  };

  const root: TreeNodeData[] = [];
  const rootCount = Math.min(10, Math.ceil(totalNodes / 10)); // 最大10個のルートノード

  for (let i = 0; i < rootCount && nodesCreated < totalNodes; i++) {
    const rootNode = createNode(0, i);
    if (rootNode) {
      root.push(rootNode);
    }
  }

  return root;
};

/**
 * ツリー内のすべてのノードIDを収集する
 */
export const collectAllNodeIds = (nodes: TreeNodeData[]): string[] => {
  const ids: string[] = [];

  const traverse = (node: TreeNodeData) => {
    ids.push(node.id);
    node.children.forEach(traverse);
  };

  nodes.forEach(traverse);
  return ids;
};

/**
 * 全ノードを展開状態にするMapを作成
 */
export const createExpandedMap = (nodeIds: string[]): Map<string, boolean> => {
  const map = new Map<string, boolean>();
  nodeIds.forEach(id => map.set(id, true));
  return map;
};

/**
 * ツリー内のノード総数をカウント
 */
export const countNodes = (nodes: TreeNodeData[]): number => {
  let count = 0;

  const traverse = (node: TreeNodeData) => {
    count++;
    node.children.forEach(traverse);
  };

  nodes.forEach(traverse);
  return count;
};
