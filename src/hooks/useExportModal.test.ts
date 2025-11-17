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
  let clipboardWriteTextMock: ReturnType<typeof jest.fn>;

  beforeEach(() => {
    jest.useFakeTimers();
    clipboardWriteTextMock = jest.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: clipboardWriteTextMock,
      },
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('初期化', () => {
    it('初期状態が正しい', () => {
      const tree = createTestTree();
      const { result } = renderHook(() => useExportModal(tree, []));

      expect(result.current.isOpen).toBe(false);
      expect(result.current.exportedText).toBe('');
      expect(result.current.copyButtonText).toBe('コピー');
      expect(result.current.exportFormat).toBe('text');
    });
  });

  describe('openModal', () => {
    it('モーダルを開くことができる', () => {
      const tree = createTestTree();
      const { result } = renderHook(() => useExportModal(tree, []));

      act(() => {
        result.current.openModal();
      });

      expect(result.current.isOpen).toBe(true);
    });

    it('モーダルを開くとツリーデータがエクスポートされる', () => {
      const tree = createTestTree();
      const { result } = renderHook(() => useExportModal(tree, []));

      act(() => {
        result.current.openModal();
      });

      expect(result.current.exportedText).toContain('大学 > 文学部 > 日本文学科');
      expect(result.current.exportedText).toContain('大学 > 文学部 > 外国語文学科');
    });

    it('モーダルを開くとコピーボタンのテキストがリセットされる', async () => {
      const tree = createTestTree();
      const { result } = renderHook(() => useExportModal(tree, []));

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
      const { result } = renderHook(() => useExportModal([], []));

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
      const { result } = renderHook(() => useExportModal(tree, []));

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
      const { result } = renderHook(() => useExportModal(tree, []));

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
      const { result } = renderHook(() => useExportModal(tree, []));

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
      const { result } = renderHook(() => useExportModal(tree, []));

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
      const { result } = renderHook(() => useExportModal(tree, []));

      act(() => {
        result.current.openModal();
      });

      await act(async () => {
        result.current.copyToClipboard();
      });

      expect(result.current.copyButtonText).toBe('コピーしました！');

      act(() => {
        jest.advanceTimersByTime(2000);
      });

      expect(result.current.copyButtonText).toBe('コピー');
    });

    it('1秒後ではまだボタンテキストは戻らない', async () => {
      const tree = createTestTree();
      const { result } = renderHook(() => useExportModal(tree, []));

      act(() => {
        result.current.openModal();
      });

      await act(async () => {
        result.current.copyToClipboard();
      });

      act(() => {
        jest.advanceTimersByTime(1000);
      });

      expect(result.current.copyButtonText).toBe('コピーしました！');
    });

    it('コピーに失敗した場合、エラーログが出力される', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});

      const error = new Error('Copy failed');
      clipboardWriteTextMock.mockRejectedValueOnce(error);

      const tree = createTestTree();
      const { result } = renderHook(() => useExportModal(tree, []));

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
        ({ treeData }) => useExportModal(treeData, []),
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
      const { result } = renderHook(() => useExportModal([], []));

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
      const { result } = renderHook(() => useExportModal(tree, []));

      await act(async () => {
        result.current.copyToClipboard();
      });

      expect(clipboardWriteTextMock).toHaveBeenCalledWith('');
    });
  });

  describe('エクスポート形式の切り替え', () => {
    it('デフォルトはtext形式', () => {
      const tree = createTestTree();
      const { result } = renderHook(() => useExportModal(tree, []));

      expect(result.current.exportFormat).toBe('text');
    });

    it('JSON形式に切り替えができる', () => {
      const tree = createTestTree();
      const { result } = renderHook(() => useExportModal(tree, []));

      act(() => {
        result.current.setExportFormat('json');
      });

      expect(result.current.exportFormat).toBe('json');
    });

    it('YAML形式に切り替えができる', () => {
      const tree = createTestTree();
      const { result } = renderHook(() => useExportModal(tree, []));

      act(() => {
        result.current.setExportFormat('yaml');
      });

      expect(result.current.exportFormat).toBe('yaml');
    });

    it('text形式でエクスポートするとツリー構造のみ', () => {
      const tree = createTestTree();
      const { result } = renderHook(() => useExportModal(tree, []));

      act(() => {
        result.current.setExportFormat('text');
        result.current.openModal();
      });

      expect(result.current.exportedText).toBe('大学 > 文学部 > 日本文学科\n大学 > 文学部 > 外国語文学科');
      expect(result.current.exportedText).not.toContain('changeHistory');
    });

    it('JSON形式でエクスポートするとツリーと変更履歴を含む', () => {
      const tree = createTestTree();
      const changeHistory = [
        {
          timestamp: '2025-01-01T00:00:00.000Z',
          type: 'import' as const,
          details: 'テストインポート',
        }
      ];
      const { result } = renderHook(() => useExportModal(tree, changeHistory));

      act(() => {
        result.current.setExportFormat('json');
      });

      act(() => {
        result.current.openModal();
      });

      const exported = JSON.parse(result.current.exportedText);
      expect(exported).toHaveProperty('tree');
      expect(exported).toHaveProperty('changeHistory');
      expect(exported).toHaveProperty('exportedAt');
      expect(exported.changeHistory).toHaveLength(1);
      expect(exported.changeHistory[0].type).toBe('import');
    });

    it('YAML形式でエクスポートするとツリーと変更履歴を含む', () => {
      const tree = createTestTree();
      const changeHistory = [
        {
          timestamp: '2025-01-01T00:00:00.000Z',
          type: 'add' as const,
          nodeName: 'テストノード',
          details: 'テスト追加',
        }
      ];
      const { result } = renderHook(() => useExportModal(tree, changeHistory));

      act(() => {
        result.current.setExportFormat('yaml');
      });

      act(() => {
        result.current.openModal();
      });

      expect(result.current.exportedText).toContain('tree:');
      expect(result.current.exportedText).toContain('changeHistory:');
      expect(result.current.exportedText).toContain('exportedAt:');
      expect(result.current.exportedText).toContain('type: add');
      expect(result.current.exportedText).toContain('nodeName: テストノード');
    });

    it('形式を変更すると即座に内容が更新される', () => {
      const tree = createTestTree();
      const { result } = renderHook(() => useExportModal(tree, []));

      act(() => {
        result.current.setExportFormat('text');
        result.current.openModal();
      });

      const textExport = result.current.exportedText;
      expect(textExport).toBe('大学 > 文学部 > 日本文学科\n大学 > 文学部 > 外国語文学科');

      act(() => {
        result.current.setExportFormat('json');
      });

      // 即座にJSON形式に変更される
      expect(result.current.exportedText).not.toBe(textExport);
      expect(result.current.exportedText).toContain('"tree"');
      expect(result.current.exportedText).toContain('"changeHistory"');

      act(() => {
        result.current.setExportFormat('yaml');
      });

      // YAML形式に変更される
      expect(result.current.exportedText).toContain('tree:');
      expect(result.current.exportedText).toContain('changeHistory:');
    });
  });
});
