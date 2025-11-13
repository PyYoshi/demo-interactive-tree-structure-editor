import type { TreeNodeData } from '../types';

/**
 * ツリーからノードを再帰的に削除
 * @param nodes - ツリーノードの配列
 * @param nodeId - 削除するノードのID
 * @returns 削除後のツリーと削除されたノード
 */
export const removeNodeRecursive = (
    nodes: TreeNodeData[],
    nodeId: string
): { nodes: TreeNodeData[]; foundNode: TreeNodeData | null } => {
    let foundNode: TreeNodeData | null = null;
    const filteredNodes = nodes.filter(node => {
        if (node.id === nodeId) {
            foundNode = node;
            return false;
        }
        return true;
    });

    if (foundNode) {
        return { nodes: filteredNodes, foundNode };
    }

    const newNodes = nodes.map(node => {
        if (!node.children || node.children.length === 0) return node;
        const result = removeNodeRecursive(node.children, nodeId);
        if (result.foundNode) {
            foundNode = result.foundNode;
        }
        return { ...node, children: result.nodes };
    });

    return { nodes: newNodes, foundNode };
};

/**
 * ツリーにノードを再帰的に挿入
 * @param nodes - ツリーノードの配列
 * @param targetId - 挿入先のノードID
 * @param nodeToInsert - 挿入するノード
 * @param position - 挿入位置（before/after/inside）
 * @returns 挿入後のツリーと挿入成功フラグ
 */
export const insertNodeRecursive = (
    nodes: TreeNodeData[],
    targetId: string,
    nodeToInsert: TreeNodeData,
    position: 'before' | 'after' | 'inside'
): { nodes: TreeNodeData[]; inserted: boolean } => {
    let inserted = false;

    if (position === 'inside') {
        const newNodes = nodes.map(node => {
            if (node.id === targetId) {
                inserted = true;
                return { ...node, children: [...node.children, nodeToInsert] };
            }
            if (node.children && !inserted) {
                const result = insertNodeRecursive(node.children, targetId, nodeToInsert, position);
                if (result.inserted) inserted = true;
                return { ...node, children: result.nodes };
            }
            return node;
        });
        return { nodes: newNodes, inserted };
    }

    const targetIndex = nodes.findIndex(node => node.id === targetId);
    if (targetIndex > -1) {
        const newNodes = [...nodes];
        newNodes.splice(position === 'before' ? targetIndex : targetIndex + 1, 0, nodeToInsert);
        return { nodes: newNodes, inserted: true };
    }

    const newNodes = nodes.map(node => {
        if (node.children && !inserted) {
            const result = insertNodeRecursive(node.children, targetId, nodeToInsert, position);
            if (result.inserted) inserted = true;
            return { ...node, children: result.nodes };
        }
        return node;
    });

    return { nodes: newNodes, inserted };
};

/**
 * ノードとその子孫のIDをすべて取得
 * @param node - ツリーノード
 * @returns ノードとその子孫のIDの配列
 */
export const getAllDescendantIds = (node: TreeNodeData): string[] => {
    const ids: string[] = [node.id];
    if (node.children && node.children.length > 0) {
        node.children.forEach(child => {
            ids.push(...getAllDescendantIds(child));
        });
    }
    return ids;
};

/**
 * 親ノードが子孫ノードに含まれているかチェック
 * @param node - チェック対象のノード
 * @param targetId - 検索するノードのID
 * @returns 子孫に含まれている場合true
 */
export const isDescendant = (node: TreeNodeData, targetId: string): boolean => {
    if (node.id === targetId) return true;
    return node.children.some(child => isDescendant(child, targetId));
};

/**
 * ツリーからノードを検索
 * @param nodes - ツリーノードの配列
 * @param nodeId - 検索するノードのID
 * @returns 見つかったノード（見つからない場合null）
 */
export const findNode = (nodes: TreeNodeData[], nodeId: string): TreeNodeData | null => {
    for (const node of nodes) {
        if (node.id === nodeId) return node;
        if (node.children && node.children.length > 0) {
            const found = findNode(node.children, nodeId);
            if (found) return found;
        }
    }
    return null;
};
