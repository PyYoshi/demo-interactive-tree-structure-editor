import type { TreeNodeData } from '../types';

/**
 * テキスト形式のデータをツリー構造に変換
 * @param text - "親 > 子 > 孫" 形式のテキスト（改行区切り）
 * @returns ツリーノードの配列
 */
export const parseData = (text: string): TreeNodeData[] => {
    const lines = text.split('\n').filter(line => line.trim() !== '');
    if (lines.length === 0) return [];

    const roots: TreeNodeData[] = [];
    const nodes = new Map<string, TreeNodeData>(); // path -> node

    for (const line of lines) {
        const parts = line.split(' > ').map(p => p.trim());
        let parentChildren: TreeNodeData[] = roots;

        for (let i = 0; i < parts.length; i++) {
            const currentPath = parts.slice(0, i + 1).join(' > ');
            const currentName = parts[i];

            let currentNode = nodes.get(currentPath);

            if (!currentNode) {
                const existingNode = parentChildren.find(n => n.name === currentName);
                if (existingNode) {
                    currentNode = existingNode;
                } else {
                    currentNode = {
                        id: crypto.randomUUID(),
                        name: currentName,
                        children: [],
                    };
                    parentChildren.push(currentNode);
                    nodes.set(currentPath, currentNode);
                }
            }

            parentChildren = currentNode.children;
        }
    }
    return roots;
};

/**
 * ツリー構造をテキスト形式に変換
 * @param data - ツリーノードの配列
 * @returns "親 > 子 > 孫" 形式のテキスト（改行区切り）
 */
export const convertTreeToText = (data: TreeNodeData[]): string => {
    const lines: string[] = [];

    const traverse = (node: TreeNodeData, path: string[]) => {
        const newPath = [...path, node.name];
        if (node.children.length === 0) {
            lines.push(newPath.join(' > '));
        } else {
            node.children.forEach(child => traverse(child, newPath));
        }
    };

    data.forEach(rootNode => traverse(rootNode, []));

    return lines.join('\n');
};
