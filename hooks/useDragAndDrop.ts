import { useState, useEffect, useCallback } from 'react';
import type { TreeNodeData } from '../types';
import { findNode } from '../utils/treeOperations';

export interface DragState {
    draggingNodeId: string | null;
    draggingNode: TreeNodeData | null;
    previewTarget: { targetId: string; position: 'before' | 'after' | 'inside' } | null;
    phase: 'idle' | 'dragging' | 'dropping';
}

export const useDragAndDrop = (treeData: TreeNodeData[]) => {
    const [dragState, setDragState] = useState<DragState>({
        draggingNodeId: null,
        draggingNode: null,
        previewTarget: null,
        phase: 'idle',
    });

    // ドラッグ中のノードを検索
    useEffect(() => {
        if (!dragState.draggingNodeId) {
            setDragState(prev => ({ ...prev, draggingNode: null }));
            return;
        }

        const found = findNode(treeData, dragState.draggingNodeId);
        setDragState(prev => ({ ...prev, draggingNode: found }));

        // デバッグログ
        console.debug('🔍 [DragAndDrop] ドラッグ中のノードを検索:', found?.name || 'not found');
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dragState.draggingNodeId]); // ドラッグ開始時のtreeDataを使用するため、意図的にtreeDataを依存配列から除外

    // グローバルなdragendイベントでクリーンアップ
    useEffect(() => {
        const handleGlobalDragEnd = () => {
            console.debug('🧹 [DragAndDrop] グローバルdragendイベント - クリーンアップ');
            setDragState({
                draggingNodeId: null,
                draggingNode: null,
                previewTarget: null,
                phase: 'idle',
            });
        };

        document.addEventListener('dragend', handleGlobalDragEnd);
        return () => {
            document.removeEventListener('dragend', handleGlobalDragEnd);
        };
    }, []);

    const startDrag = useCallback((nodeId: string) => {
        console.debug('🎬 [DragAndDrop] ドラッグ開始:', nodeId);
        setDragState(prev => ({
            ...prev,
            draggingNodeId: nodeId,
            phase: 'dragging',
        }));
    }, []);

    const updatePreview = useCallback((target: { targetId: string; position: 'before' | 'after' | 'inside' } | null) => {
        setDragState(prev => ({ ...prev, previewTarget: target }));
    }, []);

    const endDrag = useCallback(() => {
        console.debug('🏁 [DragAndDrop] ドラッグ終了');
        setDragState({
            draggingNodeId: null,
            draggingNode: null,
            previewTarget: null,
            phase: 'idle',
        });
    }, []);

    const startDrop = useCallback(() => {
        console.debug('📦 [DragAndDrop] ドロップ処理開始');
        setDragState(prev => ({ ...prev, phase: 'dropping' }));
    }, []);

    return {
        dragState,
        startDrag,
        updatePreview,
        endDrag,
        startDrop,
    };
};
