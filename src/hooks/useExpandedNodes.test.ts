import { renderHook, act } from '@testing-library/react';
import { useExpandedNodes } from './useExpandedNodes';
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
            { id: '3', name: '日本文学科', children: [] },
            { id: '4', name: '外国語文学科', children: [] }
          ]
        },
        {
          id: '5',
          name: '理学部',
          children: [
            { id: '6', name: '数学科', children: [] }
          ]
        }
      ]
    }
  ];
};

describe('useExpandedNodes', () => {
  describe('初期化', () => {
    it('空のMapで初期化される', () => {
      const tree = createTestTree();
      const { result } = renderHook(() => useExpandedNodes(tree));

      expect(result.current.expandedNodes.size).toBe(0);
    });
  });

  describe('toggleExpand', () => {
    it('ノードを展開できる', () => {
      const tree = createTestTree();
      const { result } = renderHook(() => useExpandedNodes(tree));

      act(() => {
        result.current.toggleExpand('1', true);
      });

      expect(result.current.expandedNodes.get('1')).toBe(true);
    });

    it('複数のノードを展開できる', () => {
      const tree = createTestTree();
      const { result } = renderHook(() => useExpandedNodes(tree));

      act(() => {
        result.current.toggleExpand('1', true);
        result.current.toggleExpand('2', true);
        result.current.toggleExpand('5', true);
      });

      expect(result.current.expandedNodes.get('1')).toBe(true);
      expect(result.current.expandedNodes.get('2')).toBe(true);
      expect(result.current.expandedNodes.get('5')).toBe(true);
    });

    it('ノードを折りたたむことができる', () => {
      const tree = createTestTree();
      const { result } = renderHook(() => useExpandedNodes(tree));

      act(() => {
        result.current.toggleExpand('1', true);
      });

      act(() => {
        result.current.toggleExpand('1', false);
      });

      expect(result.current.expandedNodes.get('1')).toBe(false);
    });

    it('ノードを折りたたむと子孫ノードも折りたたまれる', () => {
      const tree = createTestTree();
      const { result } = renderHook(() => useExpandedNodes(tree));

      // すべてのノードを展開
      act(() => {
        result.current.toggleExpand('1', true);
        result.current.toggleExpand('2', true);
        result.current.toggleExpand('3', true);
        result.current.toggleExpand('5', true);
      });

      expect(result.current.expandedNodes.get('1')).toBe(true);
      expect(result.current.expandedNodes.get('2')).toBe(true);
      expect(result.current.expandedNodes.get('3')).toBe(true);
      expect(result.current.expandedNodes.get('5')).toBe(true);

      // ルートノードを折りたたむ
      act(() => {
        result.current.toggleExpand('1', false);
      });

      expect(result.current.expandedNodes.get('1')).toBe(false);
      expect(result.current.expandedNodes.get('2')).toBe(false);
      expect(result.current.expandedNodes.get('3')).toBe(false);
      expect(result.current.expandedNodes.get('5')).toBe(false);
    });

    it('中間ノードを折りたたむとその子孫のみが折りたたまれる', () => {
      const tree = createTestTree();
      const { result } = renderHook(() => useExpandedNodes(tree));

      // すべてのノードを展開
      act(() => {
        result.current.toggleExpand('1', true);
        result.current.toggleExpand('2', true);
        result.current.toggleExpand('3', true);
        result.current.toggleExpand('5', true);
        result.current.toggleExpand('6', true);
      });

      // 文学部を折りたたむ
      act(() => {
        result.current.toggleExpand('2', false);
      });

      // 文学部とその子孫は折りたたまれる
      expect(result.current.expandedNodes.get('2')).toBe(false);
      expect(result.current.expandedNodes.get('3')).toBe(false);
      expect(result.current.expandedNodes.get('4')).toBe(false);

      // 理学部とルートは展開されたまま
      expect(result.current.expandedNodes.get('1')).toBe(true);
      expect(result.current.expandedNodes.get('5')).toBe(true);
      expect(result.current.expandedNodes.get('6')).toBe(true);
    });

    it('葉ノードを折りたたんでも他のノードに影響しない', () => {
      const tree = createTestTree();
      const { result } = renderHook(() => useExpandedNodes(tree));

      act(() => {
        result.current.toggleExpand('1', true);
        result.current.toggleExpand('2', true);
        result.current.toggleExpand('3', true);
      });

      act(() => {
        result.current.toggleExpand('3', false);
      });

      expect(result.current.expandedNodes.get('3')).toBe(false);
      expect(result.current.expandedNodes.get('1')).toBe(true);
      expect(result.current.expandedNodes.get('2')).toBe(true);
    });

    it('同じノードを複数回トグルできる', () => {
      const tree = createTestTree();
      const { result } = renderHook(() => useExpandedNodes(tree));

      act(() => {
        result.current.toggleExpand('1', true);
      });
      expect(result.current.expandedNodes.get('1')).toBe(true);

      act(() => {
        result.current.toggleExpand('1', false);
      });
      expect(result.current.expandedNodes.get('1')).toBe(false);

      act(() => {
        result.current.toggleExpand('1', true);
      });
      expect(result.current.expandedNodes.get('1')).toBe(true);
    });
  });

  describe('ツリーデータの変更', () => {
    it('ツリーデータが変更されても展開状態は保持される', () => {
      const tree1 = createTestTree();
      const { result, rerender } = renderHook(
        ({ treeData }) => useExpandedNodes(treeData),
        { initialProps: { treeData: tree1 } }
      );

      act(() => {
        result.current.toggleExpand('1', true);
        result.current.toggleExpand('2', true);
      });

      const tree2 = createTestTree();
      rerender({ treeData: tree2 });

      // 展開状態は保持される
      expect(result.current.expandedNodes.get('1')).toBe(true);
      expect(result.current.expandedNodes.get('2')).toBe(true);
    });
  });

  describe('空のツリー', () => {
    it('空のツリーでも動作する', () => {
      const { result } = renderHook(() => useExpandedNodes([]));

      act(() => {
        result.current.toggleExpand('nonexistent', true);
      });

      expect(result.current.expandedNodes.get('nonexistent')).toBe(true);
    });
  });
});
