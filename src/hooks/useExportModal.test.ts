import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useExportModal } from './useExportModal';
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
        }
      ]
    }
  ];
};

describe('useExportModal', () => {
  let clipboardWriteTextMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.useFakeTimers();
    clipboardWriteTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: clipboardWriteTextMock,
      },
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('初期化', () => {
    it('初期状態が正しい', () => {
      const tree = createTestTree();
      const { result } = renderHook(() => useExportModal(tree));

      expect(result.current.isOpen).toBe(false);
      expect(result.current.exportedText).toBe('');
      expect(result.current.copyButtonText).toBe('コピー');
    });
  });

  describe('openModal', () => {
    it('モーダルを開くことができる', () => {
      const tree = createTestTree();
      const { result } = renderHook(() => useExportModal(tree));

      act(() => {
        result.current.openModal();
      });

      expect(result.current.isOpen).toBe(true);
    });

    it('モーダルを開くとツリーデータがエクスポートされる', () => {
      const tree = createTestTree();
      const { result } = renderHook(() => useExportModal(tree));

      act(() => {
        result.current.openModal();
      });

      expect(result.current.exportedText).toContain('大学 > 文学部 > 日本文学科');
      expect(result.current.exportedText).toContain('大学 > 文学部 > 外国語文学科');
    });

    it('モーダルを開くとコピーボタンのテキストがリセットされる', async () => {
      const tree = createTestTree();
      const { result } = renderHook(() => useExportModal(tree));

      act(() => {
        result.current.openModal();
      });

      // コピーする
      await act(async () => {
        result.current.copyToClipboard();
      });

      expect(result.current.copyButtonText).toBe('コピーしました！');

      // モーダルを閉じて再度開く
      act(() => {
        result.current.closeModal();
      });

      act(() => {
        result.current.openModal();
      });

      expect(result.current.copyButtonText).toBe('コピー');
    });

    it('空のツリーでもモーダルを開ける', () => {
      const { result } = renderHook(() => useExportModal([]));

      act(() => {
        result.current.openModal();
      });

      expect(result.current.isOpen).toBe(true);
      expect(result.current.exportedText).toBe('');
    });
  });

  describe('closeModal', () => {
    it('モーダルを閉じることができる', () => {
      const tree = createTestTree();
      const { result } = renderHook(() => useExportModal(tree));

      act(() => {
        result.current.openModal();
      });

      act(() => {
        result.current.closeModal();
      });

      expect(result.current.isOpen).toBe(false);
    });

    it('モーダルを閉じてもエクスポートされたテキストは保持される', () => {
      const tree = createTestTree();
      const { result } = renderHook(() => useExportModal(tree));

      act(() => {
        result.current.openModal();
      });

      const exportedText = result.current.exportedText;

      act(() => {
        result.current.closeModal();
      });

      expect(result.current.exportedText).toBe(exportedText);
    });
  });

  describe('copyToClipboard', () => {
    it('クリップボードにテキストをコピーできる', async () => {
      const tree = createTestTree();
      const { result } = renderHook(() => useExportModal(tree));

      act(() => {
        result.current.openModal();
      });

      await act(async () => {
        result.current.copyToClipboard();
      });

      expect(clipboardWriteTextMock).toHaveBeenCalledTimes(1);
      expect(clipboardWriteTextMock).toHaveBeenCalledWith(result.current.exportedText);
    });

    it('コピー成功後、ボタンテキストが変更される', async () => {
      const tree = createTestTree();
      const { result } = renderHook(() => useExportModal(tree));

      act(() => {
        result.current.openModal();
      });

      await act(async () => {
        result.current.copyToClipboard();
      });

      expect(result.current.copyButtonText).toBe('コピーしました！');
    });

    it('2秒後にボタンテキストが元に戻る', async () => {
      const tree = createTestTree();
      const { result } = renderHook(() => useExportModal(tree));

      act(() => {
        result.current.openModal();
      });

      await act(async () => {
        result.current.copyToClipboard();
      });

      expect(result.current.copyButtonText).toBe('コピーしました！');

      act(() => {
        vi.advanceTimersByTime(2000);
      });

      expect(result.current.copyButtonText).toBe('コピー');
    });

    it('1秒後ではまだボタンテキストは戻らない', async () => {
      const tree = createTestTree();
      const { result } = renderHook(() => useExportModal(tree));

      act(() => {
        result.current.openModal();
      });

      await act(async () => {
        result.current.copyToClipboard();
      });

      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(result.current.copyButtonText).toBe('コピーしました！');
    });

    it('コピーに失敗した場合、エラーログが出力される', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

      const error = new Error('Copy failed');
      clipboardWriteTextMock.mockRejectedValueOnce(error);

      const tree = createTestTree();
      const { result } = renderHook(() => useExportModal(tree));

      act(() => {
        result.current.openModal();
      });

      await act(async () => {
        result.current.copyToClipboard();
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to copy text: ', error);
      expect(alertSpy).toHaveBeenCalledWith('クリップボードへのコピーに失敗しました。');

      consoleErrorSpy.mockRestore();
      alertSpy.mockRestore();
    });
  });

  describe('ツリーデータの変更', () => {
    it('ツリーデータが変更されると、次回オープン時に新しいデータがエクスポートされる', () => {
      const tree1 = createTestTree();
      const { result, rerender } = renderHook(
        ({ treeData }) => useExportModal(treeData),
        { initialProps: { treeData: tree1 } }
      );

      act(() => {
        result.current.openModal();
      });

      const firstExportedText = result.current.exportedText;

      act(() => {
        result.current.closeModal();
      });

      // 新しいツリーデータ
      const tree2: TreeNodeData[] = [
        {
          id: '10',
          name: '企業',
          children: [
            { id: '11', name: '開発部', children: [] }
          ]
        }
      ];

      rerender({ treeData: tree2 });

      act(() => {
        result.current.openModal();
      });

      expect(result.current.exportedText).not.toBe(firstExportedText);
      expect(result.current.exportedText).toContain('企業 > 開発部');
    });
  });

  describe('エッジケース', () => {
    it('空のテキストでもコピーできる', async () => {
      const { result } = renderHook(() => useExportModal([]));

      act(() => {
        result.current.openModal();
      });

      await act(async () => {
        result.current.copyToClipboard();
      });

      expect(clipboardWriteTextMock).toHaveBeenCalledWith('');
    });

    it('モーダルを開かずにコピーしようとしても動作する', async () => {
      const tree = createTestTree();
      const { result } = renderHook(() => useExportModal(tree));

      await act(async () => {
        result.current.copyToClipboard();
      });

      expect(clipboardWriteTextMock).toHaveBeenCalledWith('');
    });
  });
});
