import { useCallback } from 'react';
import type { Dispatch } from 'react';
import type { TreeAction, ActionResult } from './useTreeState';

export interface TreeActions {
    setInputText: (text: string) => void;
    importData: (text: string) => ActionResult;
    addRootNode: (name: string) => ActionResult;
    addNode: (parentId: string, name: string) => ActionResult;
    deleteNode: (nodeId: string) => ActionResult;
    moveNode: (sourceId: string, targetId: string, position: 'before' | 'after' | 'inside') => ActionResult;
    highlightNode: (nodeId: string | null) => void;
    clearTree: () => void;
}

/**
 * ツリー操作のビジネスロジック層
 * バリデーション、エラーハンドリング、成功/失敗の結果を返す
 */
export const useTreeActions = (
    dispatch: Dispatch<TreeAction>,
    treeData: any[],
    onFeedback?: (type: 'success' | 'error' | 'warning', message: string) => void
): TreeActions => {
    const setInputText = useCallback((text: string) => {
        dispatch({ type: 'SET_INPUT_TEXT', payload: text });
    }, [dispatch]);

    const importData = useCallback((text: string): ActionResult => {
        if (!text.trim()) {
            const message = 'インポートするデータがありません';
            onFeedback?.('warning', message);
            return { success: false, error: message };
        }

        dispatch({ type: 'IMPORT_DATA', payload: text });
        onFeedback?.('success', 'データをインポートしました');
        return { success: true, message: 'データをインポートしました' };
    }, [dispatch, onFeedback]);

    const addRootNode = useCallback((name: string): ActionResult => {
        if (!name.trim()) {
            const message = 'ノード名を入力してください';
            onFeedback?.('error', message);
            return { success: false, error: message };
        }

        if (treeData.length > 0) {
            const message = 'ルートノードは1つまでです';
            onFeedback?.('error', message);
            return { success: false, error: message };
        }

        dispatch({ type: 'ADD_ROOT_NODE', payload: { name: name.trim() } });
        onFeedback?.('success', `ルートノード「${name.trim()}」を追加しました`);
        return { success: true, message: 'ルートノードを追加しました' };
    }, [dispatch, treeData, onFeedback]);

    const addNode = useCallback((parentId: string, name: string): ActionResult => {
        if (!name.trim()) {
            const message = 'ノード名を入力してください';
            onFeedback?.('error', message);
            return { success: false, error: message };
        }

        dispatch({ type: 'ADD_NODE', payload: { parentId, name: name.trim() } });
        onFeedback?.('success', `ノード「${name.trim()}」を追加しました`);
        return { success: true, message: 'ノードを追加しました' };
    }, [dispatch, onFeedback]);

    const deleteNode = useCallback((nodeId: string): ActionResult => {
        dispatch({ type: 'DELETE_NODE', payload: { nodeId } });
        onFeedback?.('success', 'ノードを削除しました');
        return { success: true, message: 'ノードを削除しました' };
    }, [dispatch, onFeedback]);

    const moveNode = useCallback((
        sourceId: string,
        targetId: string,
        position: 'before' | 'after' | 'inside'
    ): ActionResult => {
        if (sourceId === targetId) {
            const message = '同じノードに移動することはできません';
            onFeedback?.('error', message);
            return { success: false, error: message };
        }

        dispatch({ type: 'MOVE_NODE', payload: { sourceId, targetId, position } });

        // 成功時にハイライト
        dispatch({ type: 'HIGHLIGHT_NODE', payload: { nodeId: sourceId } });
        setTimeout(() => {
            dispatch({ type: 'HIGHLIGHT_NODE', payload: { nodeId: null } });
        }, 1500);

        onFeedback?.('success', 'ノードを移動しました');
        return { success: true, message: 'ノードを移動しました' };
    }, [dispatch, onFeedback]);

    const highlightNode = useCallback((nodeId: string | null) => {
        dispatch({ type: 'HIGHLIGHT_NODE', payload: { nodeId } });
    }, [dispatch]);

    const clearTree = useCallback(() => {
        dispatch({ type: 'CLEAR_TREE' });
        onFeedback?.('success', 'ツリーをクリアしました');
    }, [dispatch, onFeedback]);

    return {
        setInputText,
        importData,
        addRootNode,
        addNode,
        deleteNode,
        moveNode,
        highlightNode,
        clearTree,
    };
};
