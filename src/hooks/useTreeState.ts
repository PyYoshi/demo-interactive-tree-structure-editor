import { useReducer, Reducer } from 'react';
import type { TreeNodeData } from '../types';
import { parseData } from '../utils/treeParser';
import { removeNodeRecursive, insertNodeRecursive, isDescendant, hasDuplicateNameInSiblings, findNode, getDestinationSiblings } from '../utils/treeOperations';

// 状態の型定義
export interface TreeState {
    treeData: TreeNodeData[];
    inputText: string;
    highlightedNodeId: string | null;
}

// アクションの型定義
export type TreeAction =
    | { type: 'SET_INPUT_TEXT'; payload: string }
    | { type: 'IMPORT_DATA'; payload: string }
    | { type: 'ADD_NODE'; payload: { parentId: string; name: string } }
    | { type: 'ADD_ROOT_NODE'; payload: { name: string } }
    | { type: 'DELETE_NODE'; payload: { nodeId: string } }
    | { type: 'MOVE_NODE'; payload: { sourceId: string; targetId: string; position: 'before' | 'after' | 'inside' } }
    | { type: 'HIGHLIGHT_NODE'; payload: { nodeId: string | null } }
    | { type: 'CLEAR_TREE' };

// アクション結果の型定義
export interface ActionResult {
    success: boolean;
    message?: string;
    error?: string;
}

// 初期状態
const initialState: TreeState = {
    treeData: [],
    inputText: '',
    highlightedNodeId: null,
};

// デバッグログ用のヘルパー
const logAction = (action: TreeAction, result: 'success' | 'error', message?: string) => {
    const emoji = result === 'success' ? '✅' : '❌';
    console.debug(`${emoji} [TreeState] ${action.type}`, message || '', action);
};

// リデューサー関数
const treeReducer: Reducer<TreeState, TreeAction> = (state, action) => {
    switch (action.type) {
        case 'SET_INPUT_TEXT':
            return { ...state, inputText: action.payload };

        case 'IMPORT_DATA': {
            try {
                const newData = parseData(action.payload);
                if (newData.length === 0 && action.payload.trim() !== '') {
                    logAction(action, 'error', 'データの解析に失敗');
                    return state;
                }
                if (newData.length > 1) {
                    logAction(action, 'error', `複数のルートノード検出: ${newData.length}個`);
                    return { ...state, treeData: [newData[0]] };
                }
                logAction(action, 'success', `${newData.length}個のルートノードをインポート`);
                return { ...state, treeData: newData };
            } catch (error) {
                logAction(action, 'error', String(error));
                return state;
            }
        }

        case 'ADD_ROOT_NODE': {
            if (state.treeData.length > 0) {
                logAction(action, 'error', 'ルートノードは既に存在します');
                return state;
            }
            // 同一階層での重複チェック（防御的）
            if (hasDuplicateNameInSiblings(state.treeData, action.payload.name)) {
                logAction(action, 'error', `同じ名前のノードが既に存在します: ${action.payload.name}`);
                return state;
            }
            const newNode: TreeNodeData = {
                id: crypto.randomUUID(),
                name: action.payload.name,
                children: [],
            };
            logAction(action, 'success', `ルートノード追加: ${action.payload.name}`);
            return { ...state, treeData: [newNode] };
        }

        case 'ADD_NODE': {
            const { parentId, name } = action.payload;

            // 親ノードを検索（防御的）
            const parentNode = findNode(state.treeData, parentId);
            if (!parentNode) {
                logAction(action, 'error', `親ノードが見つかりません: ${parentId}`);
                return state;
            }

            // 同一階層での重複チェック（防御的）
            if (hasDuplicateNameInSiblings(parentNode.children, name)) {
                logAction(action, 'error', `同じ名前のノードが既に存在します: ${name}`);
                return state;
            }

            const newNode: TreeNodeData = {
                id: crypto.randomUUID(),
                name,
                children: [],
            };

            const addNodeRecursive = (nodes: TreeNodeData[]): TreeNodeData[] => {
                return nodes.map(node => {
                    if (node.id === parentId) {
                        return { ...node, children: [...node.children, newNode] };
                    }
                    if (node.children.length > 0) {
                        return { ...node, children: addNodeRecursive(node.children) };
                    }
                    return node;
                });
            };

            logAction(action, 'success', `ノード追加: ${name} (親: ${parentId})`);
            return { ...state, treeData: addNodeRecursive(state.treeData) };
        }

        case 'DELETE_NODE': {
            const { nodeId } = action.payload;
            const deleteNodeRecursive = (nodes: TreeNodeData[]): TreeNodeData[] => {
                return nodes.reduce((acc, node) => {
                    if (node.id === nodeId) {
                        return acc;
                    }
                    const newChildren = deleteNodeRecursive(node.children);
                    acc.push({ ...node, children: newChildren });
                    return acc;
                }, [] as TreeNodeData[]);
            };

            logAction(action, 'success', `ノード削除: ${nodeId}`);
            return { ...state, treeData: deleteNodeRecursive(state.treeData) };
        }

        case 'MOVE_NODE': {
            const { sourceId, targetId, position } = action.payload;

            if (sourceId === targetId) {
                logAction(action, 'error', '同じノードに移動はできません');
                return state;
            }

            // ルートレベルへの移動をチェック
            const isTargetRoot = state.treeData.length > 0 && state.treeData[0].id === targetId;
            if (isTargetRoot && (position === 'before' || position === 'after')) {
                logAction(action, 'error', 'ルートレベルに新しいノードは追加できません');
                return state;
            }

            // ソースノードを削除
            const { nodes: treeWithoutSource, foundNode: sourceNode } = removeNodeRecursive(state.treeData, sourceId);

            if (!sourceNode) {
                logAction(action, 'error', 'ソースノードが見つかりません');
                return state;
            }

            // 循環参照チェック
            if (isDescendant(sourceNode, targetId)) {
                logAction(action, 'error', '親ノードをその子孫に移動できません');
                return state;
            }

            // 移動先の兄弟ノードを取得して重複チェック（防御的）
            const destinationSiblings = getDestinationSiblings(state.treeData, targetId, position);
            if (destinationSiblings && hasDuplicateNameInSiblings(destinationSiblings, sourceNode.name, sourceId)) {
                logAction(action, 'error', `移動先に同じ名前のノードが既に存在します: ${sourceNode.name}`);
                return state;
            }

            // ターゲット位置に挿入
            const { nodes: newTree } = insertNodeRecursive(treeWithoutSource, targetId, sourceNode, position);

            logAction(action, 'success', `ノード移動: ${sourceId} → ${targetId} (${position})`);
            return { ...state, treeData: newTree };
        }

        case 'HIGHLIGHT_NODE':
            return { ...state, highlightedNodeId: action.payload.nodeId };

        case 'CLEAR_TREE':
            logAction(action, 'success', 'ツリーをクリア');
            return { ...state, treeData: [], highlightedNodeId: null };

        default:
            return state;
    }
};

// カスタムフック
export const useTreeState = (initialInputText: string = '') => {
    const [state, dispatch] = useReducer(treeReducer, {
        ...initialState,
        inputText: initialInputText,
    });

    return { state, dispatch };
};
