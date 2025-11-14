import { renderHook, act, waitFor } from '@testing-library/react';
import { useDragAndDrop } from './useDragAndDrop';
import type { TreeNodeData } from '../types';

// テスト用のツリー構造
const createTestTree = (): TreeNodeData[] => {
  return [
    {
      id: '1',
      name: '大学',
      children: [
        {
          id: '2',
          name: '文学部',
          children: [
            { id: '3', name: '日本文学科', children: [] }
          ]
        }
      ]
    }
  ];
};

describe('useDragAndDrop', () => {
  describe('初期化', () => {
    it('初期状態が正しい', () => {
      const tree = createTestTree();
      const { result } = renderHook(() => useDragAndDrop(tree));

      expect(result.current.dragState.draggingNodeId).toBeNull();
      expect(result.current.dragState.draggingNode).toBeNull();
      expect(result.current.dragState.previewTarget).toBeNull();
      expect(result.current.dragState.phase).toBe('idle');
    });
  });

  describe('startDrag', () => {
    it('ドラッグを開始できる', async () => {
      const tree = createTestTree();
      const { result } = renderHook(() => useDragAndDrop(tree));

      act(() => {
        result.current.startDrag('1');
      });

      expect(result.current.dragState.draggingNodeId).toBe('1');
      expect(result.current.dragState.phase).toBe('dragging');

      // useEffect が実行されるのを待つ
      await waitFor(() => {
        expect(result.current.dragState.draggingNode).not.toBeNull();
      });

      expect(result.current.dragState.draggingNode?.name).toBe('大学');
    });

    it('ドラッグ開始するとドラッグ中のノードが検索される', async () => {
      const tree = createTestTree();
      const { result } = renderHook(() => useDragAndDrop(tree));

      act(() => {
        result.current.startDrag('3');
      });

      await waitFor(() => {
        expect(result.current.dragState.draggingNode).not.toBeNull();
      });

      expect(result.current.dragState.draggingNode?.name).toBe('日本文学科');
    });

    it('存在しないノードをドラッグ開始した場合、draggingNodeはnull', async () => {
      const tree = createTestTree();
      const { result } = renderHook(() => useDragAndDrop(tree));

      act(() => {
        result.current.startDrag('nonexistent');
      });

      await waitFor(() => {
        expect(result.current.dragState.draggingNodeId).toBe('nonexistent');
      });

      expect(result.current.dragState.draggingNode).toBeNull();
    });
  });

  describe('updatePreview', () => {
    it('プレビュー対象を更新できる', () => {
      const tree = createTestTree();
      const { result } = renderHook(() => useDragAndDrop(tree));

      act(() => {
        result.current.updatePreview({ targetId: '2', position: 'before' });
      });

      expect(result.current.dragState.previewTarget).toEqual({
        targetId: '2',
        position: 'before'
      });
    });

    it('プレビュー対象をnullにできる', () => {
      const tree = createTestTree();
      const { result } = renderHook(() => useDragAndDrop(tree));

      act(() => {
        result.current.updatePreview({ targetId: '2', position: 'inside' });
      });

      act(() => {
        result.current.updatePreview(null);
      });

      expect(result.current.dragState.previewTarget).toBeNull();
    });

    it('異なる位置に更新できる', () => {
      const tree = createTestTree();
      const { result } = renderHook(() => useDragAndDrop(tree));

      act(() => {
        result.current.updatePreview({ targetId: '1', position: 'before' });
      });

      expect(result.current.dragState.previewTarget?.position).toBe('before');

      act(() => {
        result.current.updatePreview({ targetId: '1', position: 'after' });
      });

      expect(result.current.dragState.previewTarget?.position).toBe('after');

      act(() => {
        result.current.updatePreview({ targetId: '1', position: 'inside' });
      });

      expect(result.current.dragState.previewTarget?.position).toBe('inside');
    });
  });

  describe('startDrop', () => {
    it('ドロップ処理を開始できる', () => {
      const tree = createTestTree();
      const { result } = renderHook(() => useDragAndDrop(tree));

      act(() => {
        result.current.startDrag('1');
      });

      act(() => {
        result.current.startDrop();
      });

      expect(result.current.dragState.phase).toBe('dropping');
      expect(result.current.dragState.draggingNodeId).toBe('1');
    });

    it('ドロップ中でもdraggingNodeIdは保持される', async () => {
      const tree = createTestTree();
      const { result } = renderHook(() => useDragAndDrop(tree));

      act(() => {
        result.current.startDrag('2');
      });

      await waitFor(() => {
        expect(result.current.dragState.draggingNode).not.toBeNull();
      });

      act(() => {
        result.current.startDrop();
      });

      expect(result.current.dragState.draggingNodeId).toBe('2');
      expect(result.current.dragState.draggingNode?.name).toBe('文学部');
    });
  });

  describe('endDrag', () => {
    it('ドラッグを終了できる', async () => {
      const tree = createTestTree();
      const { result } = renderHook(() => useDragAndDrop(tree));

      act(() => {
        result.current.startDrag('1');
      });

      await waitFor(() => {
        expect(result.current.dragState.draggingNode).not.toBeNull();
      });

      act(() => {
        result.current.endDrag();
      });

      expect(result.current.dragState.draggingNodeId).toBeNull();
      expect(result.current.dragState.draggingNode).toBeNull();
      expect(result.current.dragState.previewTarget).toBeNull();
      expect(result.current.dragState.phase).toBe('idle');
    });

    it('endDragでプレビューもクリアされる', () => {
      const tree = createTestTree();
      const { result } = renderHook(() => useDragAndDrop(tree));

      act(() => {
        result.current.startDrag('1');
        result.current.updatePreview({ targetId: '2', position: 'before' });
      });

      act(() => {
        result.current.endDrag();
      });

      expect(result.current.dragState.previewTarget).toBeNull();
    });
  });

  describe('フローのテスト', () => {
    it('完全なドラッグ&ドロップのフロー', async () => {
      const tree = createTestTree();
      const { result } = renderHook(() => useDragAndDrop(tree));

      // 初期状態
      expect(result.current.dragState.phase).toBe('idle');

      // ドラッグ開始
      act(() => {
        result.current.startDrag('1');
      });

      expect(result.current.dragState.phase).toBe('dragging');

      await waitFor(() => {
        expect(result.current.dragState.draggingNode).not.toBeNull();
      });

      // プレビュー更新
      act(() => {
        result.current.updatePreview({ targetId: '2', position: 'inside' });
      });

      expect(result.current.dragState.previewTarget).not.toBeNull();

      // ドロップ開始
      act(() => {
        result.current.startDrop();
      });

      expect(result.current.dragState.phase).toBe('dropping');

      // ドラッグ終了
      act(() => {
        result.current.endDrag();
      });

      expect(result.current.dragState.phase).toBe('idle');
      expect(result.current.dragState.draggingNodeId).toBeNull();
      expect(result.current.dragState.previewTarget).toBeNull();
    });
  });

  describe('ツリーデータの変更', () => {
    it('ドラッグ開始後にツリーが変更されてもdraggingNodeは変わらない', async () => {
      const tree1 = createTestTree();
      const { result, rerender } = renderHook(
        ({ treeData }) => useDragAndDrop(treeData),
        { initialProps: { treeData: tree1 } }
      );

      act(() => {
        result.current.startDrag('1');
      });

      await waitFor(() => {
        expect(result.current.dragState.draggingNode).not.toBeNull();
      });

      const originalNode = result.current.dragState.draggingNode;

      // ツリーデータ変更
      const tree2: TreeNodeData[] = [
        { id: '10', name: '企業', children: [] }
      ];

      rerender({ treeData: tree2 });

      // draggingNodeは変わらない（意図的な設計）
      expect(result.current.dragState.draggingNode).toBe(originalNode);
    });
  });

  describe('グローバルdragendイベント', () => {
    it('dragendイベントで状態がリセットされる', async () => {
      const tree = createTestTree();
      const { result } = renderHook(() => useDragAndDrop(tree));

      act(() => {
        result.current.startDrag('1');
      });

      await waitFor(() => {
        expect(result.current.dragState.draggingNode).not.toBeNull();
      });

      act(() => {
        result.current.updatePreview({ targetId: '2', position: 'inside' });
      });

      // dragendイベントを発火
      act(() => {
        document.dispatchEvent(new Event('dragend'));
      });

      expect(result.current.dragState.draggingNodeId).toBeNull();
      expect(result.current.dragState.draggingNode).toBeNull();
      expect(result.current.dragState.previewTarget).toBeNull();
      expect(result.current.dragState.phase).toBe('idle');
    });
  });
});
