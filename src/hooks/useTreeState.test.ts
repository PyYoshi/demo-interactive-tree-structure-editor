import { renderHook, act } from '@testing-library/react';
import { useTreeState } from './useTreeState';
import type { TreeNodeData } from '../types';

// crypto.randomUUID()のモック
let idCounter = 0;

beforeEach(() => {
  idCounter = 0;
  jest.spyOn(global.crypto, 'randomUUID').mockImplementation(() => `test-id-${++idCounter}`);
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('useTreeState', () => {
  describe('初期化', () => {
    it('デフォルトの初期状態を持つ', () => {
      const { result } = renderHook(() => useTreeState());

      expect(result.current.state.treeData).toEqual([]);
      expect(result.current.state.inputText).toBe('');
      expect(result.current.state.highlightedNodeId).toBeNull();
    });

    it('初期入力テキストを設定できる', () => {
      const { result } = renderHook(() => useTreeState('初期テキスト'));

      expect(result.current.state.inputText).toBe('初期テキスト');
    });
  });

  describe('SET_INPUT_TEXT', () => {
    it('入力テキストを更新できる', () => {
      const { result } = renderHook(() => useTreeState());

      act(() => {
        result.current.dispatch({ type: 'SET_INPUT_TEXT', payload: '新しいテキスト' });
      });

      expect(result.current.state.inputText).toBe('新しいテキスト');
    });
  });

  describe('IMPORT_DATA', () => {
    it('有効なデータをインポートできる', () => {
      const { result } = renderHook(() => useTreeState());

      act(() => {
        result.current.dispatch({
          type: 'IMPORT_DATA',
          payload: '大学 > 文学部 > 日本文学科'
        });
      });

      expect(result.current.state.treeData).toHaveLength(1);
      expect(result.current.state.treeData[0].name).toBe('大学');
    });

    it('複数のルートノードがある場合は最初の1つだけを保持', () => {
      const { result } = renderHook(() => useTreeState());

      act(() => {
        result.current.dispatch({
          type: 'IMPORT_DATA',
          payload: '大学 > 文学部\n企業 > 開発部'
        });
      });

      expect(result.current.state.treeData).toHaveLength(1);
      expect(result.current.state.treeData[0].name).toBe('大学');
    });

    it('空のデータをインポートすると空の配列になる', () => {
      const { result } = renderHook(() => useTreeState());

      act(() => {
        result.current.dispatch({
          type: 'IMPORT_DATA',
          payload: ''
        });
      });

      expect(result.current.state.treeData).toEqual([]);
    });
  });

  describe('ADD_ROOT_NODE', () => {
    it('ルートノードを追加できる', () => {
      const { result } = renderHook(() => useTreeState());

      act(() => {
        result.current.dispatch({
          type: 'ADD_ROOT_NODE',
          payload: { name: '大学' }
        });
      });

      expect(result.current.state.treeData).toHaveLength(1);
      expect(result.current.state.treeData[0].name).toBe('大学');
      expect(result.current.state.treeData[0].id).toBe('test-id-1');
    });

    it('既にルートノードが存在する場合は追加できない', () => {
      const { result } = renderHook(() => useTreeState());

      act(() => {
        result.current.dispatch({
          type: 'ADD_ROOT_NODE',
          payload: { name: '大学' }
        });
      });

      act(() => {
        result.current.dispatch({
          type: 'ADD_ROOT_NODE',
          payload: { name: '企業' }
        });
      });

      expect(result.current.state.treeData).toHaveLength(1);
      expect(result.current.state.treeData[0].name).toBe('大学');
    });
  });

  describe('ADD_NODE', () => {
    it('親ノードに子ノードを追加できる', () => {
      const { result } = renderHook(() => useTreeState());

      act(() => {
        result.current.dispatch({
          type: 'ADD_ROOT_NODE',
          payload: { name: '大学' }
        });
      });

      const parentId = result.current.state.treeData[0].id;

      act(() => {
        result.current.dispatch({
          type: 'ADD_NODE',
          payload: { parentId, name: '文学部' }
        });
      });

      expect(result.current.state.treeData[0].children).toHaveLength(1);
      expect(result.current.state.treeData[0].children[0].name).toBe('文学部');
    });

    it('深い階層にもノードを追加できる', () => {
      const { result } = renderHook(() => useTreeState());

      act(() => {
        result.current.dispatch({
          type: 'IMPORT_DATA',
          payload: '大学 > 文学部'
        });
      });

      const bungakubuId = result.current.state.treeData[0].children[0].id;

      act(() => {
        result.current.dispatch({
          type: 'ADD_NODE',
          payload: { parentId: bungakubuId, name: '日本文学科' }
        });
      });

      const bungakubu = result.current.state.treeData[0].children[0];
      expect(bungakubu.children).toHaveLength(1);
      expect(bungakubu.children[0].name).toBe('日本文学科');
    });
  });

  describe('DELETE_NODE', () => {
    it('ノードを削除できる', () => {
      const { result } = renderHook(() => useTreeState());

      act(() => {
        result.current.dispatch({
          type: 'IMPORT_DATA',
          payload: '大学 > 文学部 > 日本文学科\n大学 > 理学部'
        });
      });

      const bungakubuId = result.current.state.treeData[0].children[0].id;

      act(() => {
        result.current.dispatch({
          type: 'DELETE_NODE',
          payload: { nodeId: bungakubuId }
        });
      });

      expect(result.current.state.treeData[0].children).toHaveLength(1);
      expect(result.current.state.treeData[0].children[0].name).toBe('理学部');
    });

    it('ルートノードを削除できる', () => {
      const { result } = renderHook(() => useTreeState());

      act(() => {
        result.current.dispatch({
          type: 'ADD_ROOT_NODE',
          payload: { name: '大学' }
        });
      });

      const rootId = result.current.state.treeData[0].id;

      act(() => {
        result.current.dispatch({
          type: 'DELETE_NODE',
          payload: { nodeId: rootId }
        });
      });

      expect(result.current.state.treeData).toEqual([]);
    });
  });

  describe('MOVE_NODE', () => {
    it('ノードを別の親の中に移動できる（inside）', () => {
      const { result } = renderHook(() => useTreeState());

      act(() => {
        result.current.dispatch({
          type: 'IMPORT_DATA',
          payload: '大学 > 文学部 > 日本文学科\n大学 > 理学部'
        });
      });

      const nihonbungakuId = result.current.state.treeData[0].children[0].children[0].id;
      const rigakubuId = result.current.state.treeData[0].children[1].id;

      act(() => {
        result.current.dispatch({
          type: 'MOVE_NODE',
          payload: {
            sourceId: nihonbungakuId,
            targetId: rigakubuId,
            position: 'inside'
          }
        });
      });

      const rigakubu = result.current.state.treeData[0].children[1];
      expect(rigakubu.children).toHaveLength(1);
      expect(rigakubu.children[0].name).toBe('日本文学科');

      const bungakubu = result.current.state.treeData[0].children[0];
      expect(bungakubu.children).toHaveLength(0);
    });

    it('ノードを前に移動できる（before）', () => {
      const { result } = renderHook(() => useTreeState());

      act(() => {
        result.current.dispatch({
          type: 'IMPORT_DATA',
          payload: '大学 > 文学部\n大学 > 理学部\n大学 > 工学部'
        });
      });

      const kouagakubuId = result.current.state.treeData[0].children[2].id;
      const bungakubuId = result.current.state.treeData[0].children[0].id;

      act(() => {
        result.current.dispatch({
          type: 'MOVE_NODE',
          payload: {
            sourceId: kouagakubuId,
            targetId: bungakubuId,
            position: 'before'
          }
        });
      });

      const children = result.current.state.treeData[0].children;
      expect(children).toHaveLength(3);
      expect(children[0].name).toBe('工学部');
      expect(children[1].name).toBe('文学部');
      expect(children[2].name).toBe('理学部');
    });

    it('ノードを後に移動できる（after）', () => {
      const { result } = renderHook(() => useTreeState());

      act(() => {
        result.current.dispatch({
          type: 'IMPORT_DATA',
          payload: '大学 > 文学部\n大学 > 理学部\n大学 > 工学部'
        });
      });

      const bungakubuId = result.current.state.treeData[0].children[0].id;
      const kouagakubuId = result.current.state.treeData[0].children[2].id;

      act(() => {
        result.current.dispatch({
          type: 'MOVE_NODE',
          payload: {
            sourceId: bungakubuId,
            targetId: kouagakubuId,
            position: 'after'
          }
        });
      });

      const children = result.current.state.treeData[0].children;
      expect(children).toHaveLength(3);
      expect(children[0].name).toBe('理学部');
      expect(children[1].name).toBe('工学部');
      expect(children[2].name).toBe('文学部');
    });

    it('同じノードへの移動は失敗する', () => {
      const { result } = renderHook(() => useTreeState());

      act(() => {
        result.current.dispatch({
          type: 'IMPORT_DATA',
          payload: '大学 > 文学部'
        });
      });

      const bungakubuId = result.current.state.treeData[0].children[0].id;
      const initialState = result.current.state.treeData;

      act(() => {
        result.current.dispatch({
          type: 'MOVE_NODE',
          payload: {
            sourceId: bungakubuId,
            targetId: bungakubuId,
            position: 'inside'
          }
        });
      });

      expect(result.current.state.treeData).toEqual(initialState);
    });

    it('親を子孫に移動することは失敗する', () => {
      const { result } = renderHook(() => useTreeState());

      act(() => {
        result.current.dispatch({
          type: 'IMPORT_DATA',
          payload: '大学 > 文学部 > 日本文学科'
        });
      });

      const daigakuId = result.current.state.treeData[0].id;
      const nihonbungakuId = result.current.state.treeData[0].children[0].children[0].id;
      const initialState = result.current.state.treeData;

      act(() => {
        result.current.dispatch({
          type: 'MOVE_NODE',
          payload: {
            sourceId: daigakuId,
            targetId: nihonbungakuId,
            position: 'inside'
          }
        });
      });

      expect(result.current.state.treeData).toEqual(initialState);
    });

    it('ルートレベルに新しいノードは追加できない（before/after）', () => {
      const { result } = renderHook(() => useTreeState());

      act(() => {
        result.current.dispatch({
          type: 'IMPORT_DATA',
          payload: '大学 > 文学部'
        });
      });

      const daigakuId = result.current.state.treeData[0].id;
      const bungakubuId = result.current.state.treeData[0].children[0].id;
      const initialState = result.current.state.treeData;

      act(() => {
        result.current.dispatch({
          type: 'MOVE_NODE',
          payload: {
            sourceId: bungakubuId,
            targetId: daigakuId,
            position: 'before'
          }
        });
      });

      expect(result.current.state.treeData).toEqual(initialState);
    });
  });

  describe('HIGHLIGHT_NODE', () => {
    it('ノードをハイライトできる', () => {
      const { result } = renderHook(() => useTreeState());

      act(() => {
        result.current.dispatch({
          type: 'HIGHLIGHT_NODE',
          payload: { nodeId: 'test-id' }
        });
      });

      expect(result.current.state.highlightedNodeId).toBe('test-id');
    });

    it('ハイライトをクリアできる', () => {
      const { result } = renderHook(() => useTreeState());

      act(() => {
        result.current.dispatch({
          type: 'HIGHLIGHT_NODE',
          payload: { nodeId: 'test-id' }
        });
      });

      act(() => {
        result.current.dispatch({
          type: 'HIGHLIGHT_NODE',
          payload: { nodeId: null }
        });
      });

      expect(result.current.state.highlightedNodeId).toBeNull();
    });
  });

  describe('CLEAR_TREE', () => {
    it('ツリーをクリアできる', () => {
      const { result } = renderHook(() => useTreeState());

      act(() => {
        result.current.dispatch({
          type: 'IMPORT_DATA',
          payload: '大学 > 文学部 > 日本文学科'
        });
      });

      act(() => {
        result.current.dispatch({
          type: 'HIGHLIGHT_NODE',
          payload: { nodeId: 'test-id' }
        });
      });

      act(() => {
        result.current.dispatch({ type: 'CLEAR_TREE' });
      });

      expect(result.current.state.treeData).toEqual([]);
      expect(result.current.state.highlightedNodeId).toBeNull();
    });
  });

  describe('RENAME_NODE', () => {
    it('ノード名を変更できる', () => {
      const { result } = renderHook(() => useTreeState());

      act(() => {
        result.current.dispatch({
          type: 'IMPORT_DATA',
          payload: '大学 > 文学部 > 日本文学科'
        });
      });

      const nihonbungakuId = result.current.state.treeData[0].children[0].children[0].id;

      act(() => {
        result.current.dispatch({
          type: 'RENAME_NODE',
          payload: { nodeId: nihonbungakuId, newName: '国文学科' }
        });
      });

      const renamed = result.current.state.treeData[0].children[0].children[0];
      expect(renamed.name).toBe('国文学科');
      expect(renamed.id).toBe(nihonbungakuId);
    });

    it('ルートノード名を変更できる', () => {
      const { result } = renderHook(() => useTreeState());

      act(() => {
        result.current.dispatch({
          type: 'ADD_ROOT_NODE',
          payload: { name: '大学' }
        });
      });

      const rootId = result.current.state.treeData[0].id;

      act(() => {
        result.current.dispatch({
          type: 'RENAME_NODE',
          payload: { nodeId: rootId, newName: '総合大学' }
        });
      });

      expect(result.current.state.treeData[0].name).toBe('総合大学');
    });

    it('同一階層に同じ名前が存在する場合は変更できない', () => {
      const { result } = renderHook(() => useTreeState());

      act(() => {
        result.current.dispatch({
          type: 'IMPORT_DATA',
          payload: '大学 > 文学部 > 日本文学科\n大学 > 文学部 > 英文学科'
        });
      });

      const nihonbungakuId = result.current.state.treeData[0].children[0].children[0].id;

      act(() => {
        result.current.dispatch({
          type: 'RENAME_NODE',
          payload: { nodeId: nihonbungakuId, newName: '英文学科' }
        });
      });

      // 変更されていないことを確認
      const node = result.current.state.treeData[0].children[0].children[0];
      expect(node.name).toBe('日本文学科');
    });

    it('異なる階層に同じ名前が存在する場合は変更できる', () => {
      const { result } = renderHook(() => useTreeState());

      act(() => {
        result.current.dispatch({
          type: 'IMPORT_DATA',
          payload: '大学 > 文学部 > 日本文学科\n大学 > 理学部 > 英文学科'
        });
      });

      const nihonbungakuId = result.current.state.treeData[0].children[0].children[0].id;

      act(() => {
        result.current.dispatch({
          type: 'RENAME_NODE',
          payload: { nodeId: nihonbungakuId, newName: '英文学科' }
        });
      });

      // 変更されていることを確認
      const node = result.current.state.treeData[0].children[0].children[0];
      expect(node.name).toBe('英文学科');
    });

    it('存在しないノードを変更しようとした場合は何も変更されない', () => {
      const { result } = renderHook(() => useTreeState());

      act(() => {
        result.current.dispatch({
          type: 'ADD_ROOT_NODE',
          payload: { name: '大学' }
        });
      });

      const beforeState = result.current.state.treeData;

      act(() => {
        result.current.dispatch({
          type: 'RENAME_NODE',
          payload: { nodeId: 'non-existent-id', newName: '新しい名前' }
        });
      });

      expect(result.current.state.treeData).toEqual(beforeState);
    });

    it('名前に前後の空白がある場合もトリムされた名前で重複チェックされる', () => {
      const { result } = renderHook(() => useTreeState());

      act(() => {
        result.current.dispatch({
          type: 'IMPORT_DATA',
          payload: '大学 > 文学部 > 日本文学科\n大学 > 文学部 > 英文学科'
        });
      });

      const nihonbungakuId = result.current.state.treeData[0].children[0].children[0].id;

      act(() => {
        result.current.dispatch({
          type: 'RENAME_NODE',
          payload: { nodeId: nihonbungakuId, newName: '  英文学科  ' }
        });
      });

      // 変更されていないことを確認（重複しているため）
      const node = result.current.state.treeData[0].children[0].children[0];
      expect(node.name).toBe('日本文学科');
    });

    it('自分自身は重複チェックから除外される', () => {
      const { result } = renderHook(() => useTreeState());

      act(() => {
        result.current.dispatch({
          type: 'IMPORT_DATA',
          payload: '大学 > 文学部 > 日本文学科'
        });
      });

      const nihonbungakuId = result.current.state.treeData[0].children[0].children[0].id;

      act(() => {
        result.current.dispatch({
          type: 'RENAME_NODE',
          payload: { nodeId: nihonbungakuId, newName: '日本文学科' }
        });
      });

      // 同じ名前でも変更可能（自分自身は除外されるため）
      const node = result.current.state.treeData[0].children[0].children[0];
      expect(node.name).toBe('日本文学科');
    });
  });
});
