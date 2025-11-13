import { useState, useCallback } from 'react';
import type { TreeNodeData } from '../types';
import { getAllDescendantIds } from '../utils/treeOperations';

export const useExpandedNodes = (treeData: TreeNodeData[]) => {
    const [expandedNodes, setExpandedNodes] = useState<Map<string, boolean>>(new Map());

    const toggleExpand = useCallback((nodeId: string, newExpandedState: boolean) => {
        setExpandedNodes(prev => {
            const newMap = new Map(prev);
            newMap.set(nodeId, newExpandedState);

            // 閉じる操作の場合、子孫ノードもすべて閉じる
            if (!newExpandedState) {
                const findAndCloseDescendants = (nodes: TreeNodeData[]): void => {
                    nodes.forEach(node => {
                        if (node.id === nodeId) {
                            // このノードの子孫をすべて閉じる
                            const descendantIds = getAllDescendantIds(node);
                            descendantIds.forEach(id => {
                                if (id !== nodeId) {
                                    newMap.set(id, false);
                                }
                            });
                        } else if (node.children && node.children.length > 0) {
                            findAndCloseDescendants(node.children);
                        }
                    });
                };
                findAndCloseDescendants(treeData);
            }

            // デバッグログ
            console.debug(`🔽 [ExpandedNodes] ノード${newExpandedState ? '展開' : '折りたたみ'}:`, nodeId);

            return newMap;
        });
    }, [treeData]);

    return { expandedNodes, toggleExpand };
};
