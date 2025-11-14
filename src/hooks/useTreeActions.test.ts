import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTreeActions } from './useTreeActions';
import type { TreeAction } from './useTreeState';
import type { TreeNodeData } from '../types';

describe('useTreeActions', () => {
  let dispatchMock: ReturnType<typeof vi.fn<[TreeAction], void>>;
  let onFeedbackMock: ReturnType<typeof vi.fn<[type: 'success' | 'error' | 'warning', message: string], void>>;
  let treeData: TreeNodeData[];

  beforeEach(() => {
    vi.useFakeTimers();
    dispatchMock = vi.fn();
    onFeedbackMock = vi.fn();
    treeData = [];
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('setInputText', () => {
    it('SET_INPUT_TEXTアクションをdispatchする', () => {
      const { result } = renderHook(() =>
        useTreeActions(dispatchMock, treeData, onFeedbackMock)
      );

      act(() => {
        result.current.setInputText('テストテキスト');
      });

      expect(dispatchMock).toHaveBeenCalledWith({
        type: 'SET_INPUT_TEXT',
        payload: 'テストテキスト'
      });
    });
  });

  describe('importData', () => {
    it('有効なデータをインポートできる', () => {
      const { result } = renderHook(() =>
        useTreeActions(dispatchMock, treeData, onFeedbackMock)
      );

      const actionResult = result.current.importData('大学 > 文学部');

      expect(actionResult.success).toBe(true);
      expect(dispatchMock).toHaveBeenCalledWith({
        type: 'IMPORT_DATA',
        payload: '大学 > 文学部'
      });
      expect(onFeedbackMock).toHaveBeenCalledWith('success', 'データをインポートしました');
    });

    it('空のテキストをインポートしようとすると失敗する', () => {
      const { result } = renderHook(() =>
        useTreeActions(dispatchMock, treeData, onFeedbackMock)
      );

      const actionResult = result.current.importData('');

      expect(actionResult.success).toBe(false);
      expect(actionResult.error).toBe('インポートするデータがありません');
      expect(dispatchMock).not.toHaveBeenCalled();
      expect(onFeedbackMock).toHaveBeenCalledWith('warning', 'インポートするデータがありません');
    });

    it('空白のみのテキストをインポートしようとすると失敗する', () => {
      const { result } = renderHook(() =>
        useTreeActions(dispatchMock, treeData, onFeedbackMock)
      );

      const actionResult = result.current.importData('   \n  ');

      expect(actionResult.success).toBe(false);
      expect(dispatchMock).not.toHaveBeenCalled();
    });
  });

  describe('addRootNode', () => {
    it('ルートノードを追加できる', () => {
      const { result } = renderHook(() =>
        useTreeActions(dispatchMock, treeData, onFeedbackMock)
      );

      const actionResult = result.current.addRootNode('大学');

      expect(actionResult.success).toBe(true);
      expect(dispatchMock).toHaveBeenCalledWith({
        type: 'ADD_ROOT_NODE',
        payload: { name: '大学' }
      });
      expect(onFeedbackMock).toHaveBeenCalledWith('success', 'ルートノード「大学」を追加しました');
    });

    it('空のノード名では追加できない', () => {
      const { result } = renderHook(() =>
        useTreeActions(dispatchMock, treeData, onFeedbackMock)
      );

      const actionResult = result.current.addRootNode('');

      expect(actionResult.success).toBe(false);
      expect(actionResult.error).toBe('ノード名を入力してください');
      expect(dispatchMock).not.toHaveBeenCalled();
      expect(onFeedbackMock).toHaveBeenCalledWith('error', 'ノード名を入力してください');
    });

    it('既にルートノードが存在する場合は追加できない', () => {
      const existingTreeData: TreeNodeData[] = [
        { id: '1', name: '大学', children: [] }
      ];

      const { result } = renderHook(() =>
        useTreeActions(dispatchMock, existingTreeData, onFeedbackMock)
      );

      const actionResult = result.current.addRootNode('企業');

      expect(actionResult.success).toBe(false);
      expect(actionResult.error).toBe('ルートノードは1つまでです');
      expect(dispatchMock).not.toHaveBeenCalled();
      expect(onFeedbackMock).toHaveBeenCalledWith('error', 'ルートノードは1つまでです');
    });

    it('前後の空白をトリムしてルートノードを追加する', () => {
      const { result } = renderHook(() =>
        useTreeActions(dispatchMock, treeData, onFeedbackMock)
      );

      result.current.addRootNode('  大学  ');

      expect(dispatchMock).toHaveBeenCalledWith({
        type: 'ADD_ROOT_NODE',
        payload: { name: '大学' }
      });
    });

    it('同じ名前のルートノードが既に存在する場合は追加できない', () => {
      const existingTreeData: TreeNodeData[] = [
        { id: '1', name: '大学', children: [] }
      ];

      const { result } = renderHook(() =>
        useTreeActions(dispatchMock, existingTreeData, onFeedbackMock)
      );

      const actionResult = result.current.addRootNode('大学');

      expect(actionResult.success).toBe(false);
      // ルートノードは1つまでなので、先にこのチェックが実行される
      expect(actionResult.error).toBe('ルートノードは1つまでです');
      expect(dispatchMock).not.toHaveBeenCalled();
      expect(onFeedbackMock).toHaveBeenCalledWith('error', 'ルートノードは1つまでです');
    });
  });

  describe('addNode', () => {
    it('子ノードを追加できる', () => {
      const existingTreeData: TreeNodeData[] = [
        { id: 'parent-id', name: '大学', children: [] }
      ];

      const { result } = renderHook(() =>
        useTreeActions(dispatchMock, existingTreeData, onFeedbackMock)
      );

      const actionResult = result.current.addNode('parent-id', '文学部');

      expect(actionResult.success).toBe(true);
      expect(dispatchMock).toHaveBeenCalledWith({
        type: 'ADD_NODE',
        payload: { parentId: 'parent-id', name: '文学部' }
      });
      expect(onFeedbackMock).toHaveBeenCalledWith('success', 'ノード「文学部」を追加しました');
    });

    it('空のノード名では追加できない', () => {
      const { result } = renderHook(() =>
        useTreeActions(dispatchMock, treeData, onFeedbackMock)
      );

      const actionResult = result.current.addNode('parent-id', '');

      expect(actionResult.success).toBe(false);
      expect(actionResult.error).toBe('ノード名を入力してください');
      expect(dispatchMock).not.toHaveBeenCalled();
    });

    it('前後の空白をトリムして子ノードを追加する', () => {
      const existingTreeData: TreeNodeData[] = [
        { id: 'parent-id', name: '大学', children: [] }
      ];

      const { result } = renderHook(() =>
        useTreeActions(dispatchMock, existingTreeData, onFeedbackMock)
      );

      result.current.addNode('parent-id', '  文学部  ');

      expect(dispatchMock).toHaveBeenCalledWith({
        type: 'ADD_NODE',
        payload: { parentId: 'parent-id', name: '文学部' }
      });
    });

    it('親ノードが存在しない場合は追加できない', () => {
      const existingTreeData: TreeNodeData[] = [
        { id: 'root-id', name: '大学', children: [] }
      ];

      const { result } = renderHook(() =>
        useTreeActions(dispatchMock, existingTreeData, onFeedbackMock)
      );

      const actionResult = result.current.addNode('non-existent-id', '文学部');

      expect(actionResult.success).toBe(false);
      expect(actionResult.error).toBe('親ノードが見つかりません');
      expect(dispatchMock).not.toHaveBeenCalled();
      expect(onFeedbackMock).toHaveBeenCalledWith('error', '親ノードが見つかりません');
    });

    it('同一階層に同じ名前のノードが既に存在する場合は追加できない', () => {
      const existingTreeData: TreeNodeData[] = [
        {
          id: 'root-id',
          name: '大学',
          children: [
            { id: 'child-1', name: '文学部', children: [] },
            { id: 'child-2', name: '理学部', children: [] }
          ]
        }
      ];

      const { result } = renderHook(() =>
        useTreeActions(dispatchMock, existingTreeData, onFeedbackMock)
      );

      const actionResult = result.current.addNode('root-id', '文学部');

      expect(actionResult.success).toBe(false);
      expect(actionResult.error).toBe('同じ名前のノード「文学部」が既に存在します');
      expect(dispatchMock).not.toHaveBeenCalled();
      expect(onFeedbackMock).toHaveBeenCalledWith('error', '同じ名前のノード「文学部」が既に存在します');
    });

    it('同一階層に同じ名前のノードが既に存在する場合は追加できない（孫ノード）', () => {
      const existingTreeData: TreeNodeData[] = [
        {
          id: 'root-id',
          name: '大学',
          children: [
            {
              id: 'child-1',
              name: '文学部',
              children: [
                { id: 'grandchild-1', name: '哲学科', children: [] }
              ]
            }
          ]
        }
      ];

      const { result } = renderHook(() =>
        useTreeActions(dispatchMock, existingTreeData, onFeedbackMock)
      );

      // child-1（文学部）の配下に「哲学科」を追加しようとする（既に存在）
      const actionResult = result.current.addNode('child-1', '哲学科');

      expect(actionResult.success).toBe(false);
      expect(actionResult.error).toBe('同じ名前のノード「哲学科」が既に存在します');
      expect(dispatchMock).not.toHaveBeenCalled();
    });

    it('空白を含む名前でも重複チェックが正しく機能する', () => {
      const existingTreeData: TreeNodeData[] = [
        {
          id: 'root-id',
          name: '大学',
          children: [
            { id: 'child-1', name: '文学部', children: [] }
          ]
        }
      ];

      const { result } = renderHook(() =>
        useTreeActions(dispatchMock, existingTreeData, onFeedbackMock)
      );

      // 空白付きの「文学部」を追加しようとする
      const actionResult = result.current.addNode('root-id', '  文学部  ');

      expect(actionResult.success).toBe(false);
      expect(actionResult.error).toBe('同じ名前のノード「文学部」が既に存在します');
      expect(dispatchMock).not.toHaveBeenCalled();
    });
  });

  describe('deleteNode', () => {
    it('ノードを削除できる', () => {
      const { result } = renderHook(() =>
        useTreeActions(dispatchMock, treeData, onFeedbackMock)
      );

      const actionResult = result.current.deleteNode('node-id');

      expect(actionResult.success).toBe(true);
      expect(dispatchMock).toHaveBeenCalledWith({
        type: 'DELETE_NODE',
        payload: { nodeId: 'node-id' }
      });
      expect(onFeedbackMock).toHaveBeenCalledWith('success', 'ノードを削除しました');
    });
  });

  describe('moveNode', () => {
    it('ノードを移動できる', () => {
      const existingTreeData: TreeNodeData[] = [
        {
          id: 'target-id',
          name: '大学',
          children: [
            { id: 'source-id', name: '文学部', children: [] }
          ]
        }
      ];

      const { result } = renderHook(() =>
        useTreeActions(dispatchMock, existingTreeData, onFeedbackMock)
      );

      const actionResult = result.current.moveNode('source-id', 'target-id', 'inside');

      expect(actionResult.success).toBe(true);
      expect(dispatchMock).toHaveBeenCalledWith({
        type: 'MOVE_NODE',
        payload: { sourceId: 'source-id', targetId: 'target-id', position: 'inside' }
      });
      expect(onFeedbackMock).toHaveBeenCalledWith('success', 'ノードを移動しました');
    });

    it('移動後にノードがハイライトされる', () => {
      const existingTreeData: TreeNodeData[] = [
        {
          id: 'target-id',
          name: '大学',
          children: [
            { id: 'source-id', name: '文学部', children: [] }
          ]
        }
      ];

      const { result } = renderHook(() =>
        useTreeActions(dispatchMock, existingTreeData, onFeedbackMock)
      );

      act(() => {
        result.current.moveNode('source-id', 'target-id', 'before');
      });

      // MOVE_NODEとHIGHLIGHT_NODEがdispatchされる
      expect(dispatchMock).toHaveBeenCalledWith({
        type: 'MOVE_NODE',
        payload: { sourceId: 'source-id', targetId: 'target-id', position: 'before' }
      });

      expect(dispatchMock).toHaveBeenCalledWith({
        type: 'HIGHLIGHT_NODE',
        payload: { nodeId: 'source-id' }
      });
    });

    it('1.5秒後にハイライトが解除される', () => {
      const existingTreeData: TreeNodeData[] = [
        {
          id: 'target-id',
          name: '大学',
          children: [
            { id: 'source-id', name: '文学部', children: [] }
          ]
        }
      ];

      const { result } = renderHook(() =>
        useTreeActions(dispatchMock, existingTreeData, onFeedbackMock)
      );

      act(() => {
        result.current.moveNode('source-id', 'target-id', 'after');
      });

      expect(dispatchMock).toHaveBeenCalledTimes(2);

      act(() => {
        vi.advanceTimersByTime(1500);
      });

      expect(dispatchMock).toHaveBeenCalledTimes(3);
      expect(dispatchMock).toHaveBeenLastCalledWith({
        type: 'HIGHLIGHT_NODE',
        payload: { nodeId: null }
      });
    });

    it('同じノードへの移動は失敗する', () => {
      const { result } = renderHook(() =>
        useTreeActions(dispatchMock, treeData, onFeedbackMock)
      );

      const actionResult = result.current.moveNode('same-id', 'same-id', 'inside');

      expect(actionResult.success).toBe(false);
      expect(actionResult.error).toBe('同じノードに移動することはできません');
      expect(dispatchMock).not.toHaveBeenCalled();
      expect(onFeedbackMock).toHaveBeenCalledWith('error', '同じノードに移動することはできません');
    });

    it('移動先に同じ名前のノードが既に存在する場合は移動できない（inside）', () => {
      const existingTreeData: TreeNodeData[] = [
        {
          id: 'root-id',
          name: '大学',
          children: [
            { id: 'child-1', name: '文学部', children: [] },
            {
              id: 'child-2',
              name: '理学部',
              children: [
                { id: 'grandchild-1', name: '文学部', children: [] }
              ]
            }
          ]
        }
      ];

      const { result } = renderHook(() =>
        useTreeActions(dispatchMock, existingTreeData, onFeedbackMock)
      );

      // 理学部配下の「文学部」を大学の直下に移動しようとする（既に「文学部」が存在）
      const actionResult = result.current.moveNode('grandchild-1', 'root-id', 'inside');

      expect(actionResult.success).toBe(false);
      expect(actionResult.error).toBe('移動先に同じ名前のノード「文学部」が既に存在します');
      expect(dispatchMock).not.toHaveBeenCalled();
      expect(onFeedbackMock).toHaveBeenCalledWith('error', '移動先に同じ名前のノード「文学部」が既に存在します');
    });

    it('移動先に同じ名前のノードが既に存在する場合は移動できない（before）', () => {
      const existingTreeData: TreeNodeData[] = [
        {
          id: 'root-id',
          name: '大学',
          children: [
            { id: 'child-1', name: '文学部', children: [] },
            {
              id: 'child-2',
              name: '理学部',
              children: [
                { id: 'grandchild-1', name: '文学部', children: [] }
              ]
            }
          ]
        }
      ];

      const { result } = renderHook(() =>
        useTreeActions(dispatchMock, existingTreeData, onFeedbackMock)
      );

      // 理学部配下の「文学部」を、大学配下の文学部の前に移動しようとする
      const actionResult = result.current.moveNode('grandchild-1', 'child-1', 'before');

      expect(actionResult.success).toBe(false);
      expect(actionResult.error).toBe('移動先に同じ名前のノード「文学部」が既に存在します');
      expect(dispatchMock).not.toHaveBeenCalled();
    });

    it('移動先に同じ名前のノードが既に存在する場合は移動できない（after）', () => {
      const existingTreeData: TreeNodeData[] = [
        {
          id: 'root-id',
          name: '大学',
          children: [
            { id: 'child-1', name: '文学部', children: [] },
            {
              id: 'child-2',
              name: '理学部',
              children: [
                { id: 'grandchild-1', name: '文学部', children: [] }
              ]
            }
          ]
        }
      ];

      const { result } = renderHook(() =>
        useTreeActions(dispatchMock, existingTreeData, onFeedbackMock)
      );

      // 理学部配下の「文学部」を、理学部の後に移動しようとする
      const actionResult = result.current.moveNode('grandchild-1', 'child-2', 'after');

      expect(actionResult.success).toBe(false);
      expect(actionResult.error).toBe('移動先に同じ名前のノード「文学部」が既に存在します');
      expect(dispatchMock).not.toHaveBeenCalled();
    });

    it('同じ階層内で自分自身の位置を変える場合は移動できる', () => {
      const existingTreeData: TreeNodeData[] = [
        {
          id: 'root-id',
          name: '大学',
          children: [
            { id: 'child-1', name: '文学部', children: [] },
            { id: 'child-2', name: '理学部', children: [] },
            { id: 'child-3', name: '工学部', children: [] }
          ]
        }
      ];

      const { result } = renderHook(() =>
        useTreeActions(dispatchMock, existingTreeData, onFeedbackMock)
      );

      // 文学部を理学部の後に移動（同じ階層内での位置変更）
      const actionResult = result.current.moveNode('child-1', 'child-2', 'after');

      expect(actionResult.success).toBe(true);
      expect(dispatchMock).toHaveBeenCalledWith({
        type: 'MOVE_NODE',
        payload: { sourceId: 'child-1', targetId: 'child-2', position: 'after' }
      });
    });
  });

  describe('highlightNode', () => {
    it('ノードをハイライトできる', () => {
      const { result } = renderHook(() =>
        useTreeActions(dispatchMock, treeData, onFeedbackMock)
      );

      act(() => {
        result.current.highlightNode('node-id');
      });

      expect(dispatchMock).toHaveBeenCalledWith({
        type: 'HIGHLIGHT_NODE',
        payload: { nodeId: 'node-id' }
      });
    });

    it('ハイライトをクリアできる', () => {
      const { result } = renderHook(() =>
        useTreeActions(dispatchMock, treeData, onFeedbackMock)
      );

      act(() => {
        result.current.highlightNode(null);
      });

      expect(dispatchMock).toHaveBeenCalledWith({
        type: 'HIGHLIGHT_NODE',
        payload: { nodeId: null }
      });
    });
  });

  describe('clearTree', () => {
    it('ツリーをクリアできる', () => {
      const { result } = renderHook(() =>
        useTreeActions(dispatchMock, treeData, onFeedbackMock)
      );

      act(() => {
        result.current.clearTree();
      });

      expect(dispatchMock).toHaveBeenCalledWith({ type: 'CLEAR_TREE' });
      expect(onFeedbackMock).toHaveBeenCalledWith('success', 'ツリーをクリアしました');
    });
  });

  describe('onFeedbackがオプショナル', () => {
    it('onFeedbackなしでも動作する', () => {
      const { result } = renderHook(() =>
        useTreeActions(dispatchMock, treeData, undefined)
      );

      const actionResult = result.current.addRootNode('大学');

      expect(actionResult.success).toBe(true);
      expect(dispatchMock).toHaveBeenCalled();
    });

    it('onFeedbackなしでエラーケースも動作する', () => {
      const { result } = renderHook(() =>
        useTreeActions(dispatchMock, treeData, undefined)
      );

      const actionResult = result.current.addRootNode('');

      expect(actionResult.success).toBe(false);
      expect(dispatchMock).not.toHaveBeenCalled();
    });
  });
});
