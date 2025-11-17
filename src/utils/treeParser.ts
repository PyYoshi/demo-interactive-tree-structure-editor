import type { TreeNodeData, ChangeHistoryEntry, ExportData } from '../types';

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

/**
 * ツリーデータと変更履歴をJSON形式にエクスポート
 * @param data ツリーデータ
 * @param changeHistory 変更履歴
 * @returns JSON文字列
 */
export const convertToJSON = (data: TreeNodeData[], changeHistory: ChangeHistoryEntry[]): string => {
    const exportData: ExportData = {
        tree: data,
        changeHistory,
        exportedAt: new Date().toISOString(),
    };
    return JSON.stringify(exportData, null, 2);
};

/**
 * ツリーデータと変更履歴をYAML形式にエクスポート
 * @param data ツリーデータ
 * @param changeHistory 変更履歴
 * @returns YAML文字列
 */
export const convertToYAML = (data: TreeNodeData[], changeHistory: ChangeHistoryEntry[]): string => {
    const exportData: ExportData = {
        tree: data,
        changeHistory,
        exportedAt: new Date().toISOString(),
    };

    // シンプルなYAML変換（深いネストには対応）
    const yamlify = (obj: any, indent = 0): string => {
        const spaces = '  '.repeat(indent);
        let result = '';

        if (Array.isArray(obj)) {
            if (obj.length === 0) {
                return '[]';
            }
            obj.forEach((item, index) => {
                if (typeof item === 'object' && item !== null) {
                    result += `\n${spaces}- ${yamlify(item, indent + 1).trim()}`;
                } else {
                    result += `\n${spaces}- ${item}`;
                }
            });
            return result;
        }

        if (typeof obj === 'object' && obj !== null) {
            Object.entries(obj).forEach(([key, value]) => {
                if (value === undefined || value === null) {
                    result += `\n${spaces}${key}: null`;
                } else if (Array.isArray(value)) {
                    if (value.length === 0) {
                        result += `\n${spaces}${key}: []`;
                    } else {
                        result += `\n${spaces}${key}:${yamlify(value, indent + 1)}`;
                    }
                } else if (typeof value === 'object') {
                    result += `\n${spaces}${key}:${yamlify(value, indent + 1)}`;
                } else if (typeof value === 'string') {
                    // 特殊文字を含む場合はクォートで囲む
                    const needsQuotes = /[:\[\]{}>"'|&*#?]/.test(value) || value.includes('\n');
                    result += `\n${spaces}${key}: ${needsQuotes ? `"${value.replace(/"/g, '\\"')}"` : value}`;
                } else {
                    result += `\n${spaces}${key}: ${value}`;
                }
            });
            return result;
        }

        return String(obj);
    };

    return yamlify(exportData).trim();
};
