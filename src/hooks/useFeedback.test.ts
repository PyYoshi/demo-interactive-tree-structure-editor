import { renderHook, act } from '@testing-library/react';
import { useFeedback } from './useFeedback';

describe('useFeedback', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('初期化', () => {
    it('空のメッセージ配列で初期化される', () => {
      const { result } = renderHook(() => useFeedback());

      expect(result.current.messages).toEqual([]);
    });
  });

  describe('showFeedback', () => {
    it('successメッセージを追加できる', () => {
      const { result } = renderHook(() => useFeedback());

      act(() => {
        result.current.showFeedback('success', '成功しました');
      });

      expect(result.current.messages).toHaveLength(1);
      expect(result.current.messages[0].type).toBe('success');
      expect(result.current.messages[0].message).toBe('成功しました');
      expect(result.current.messages[0].id).toBeDefined();
    });

    it('errorメッセージを追加できる', () => {
      const { result } = renderHook(() => useFeedback());

      act(() => {
        result.current.showFeedback('error', 'エラーが発生しました');
      });

      expect(result.current.messages).toHaveLength(1);
      expect(result.current.messages[0].type).toBe('error');
      expect(result.current.messages[0].message).toBe('エラーが発生しました');
    });

    it('warningメッセージを追加できる', () => {
      const { result } = renderHook(() => useFeedback());

      act(() => {
        result.current.showFeedback('warning', '警告です');
      });

      expect(result.current.messages).toHaveLength(1);
      expect(result.current.messages[0].type).toBe('warning');
      expect(result.current.messages[0].message).toBe('警告です');
    });

    it('infoメッセージを追加できる', () => {
      const { result } = renderHook(() => useFeedback());

      act(() => {
        result.current.showFeedback('info', '情報です');
      });

      expect(result.current.messages).toHaveLength(1);
      expect(result.current.messages[0].type).toBe('info');
      expect(result.current.messages[0].message).toBe('情報です');
    });

    it('複数のメッセージを追加できる', () => {
      const { result } = renderHook(() => useFeedback());

      act(() => {
        result.current.showFeedback('success', 'メッセージ1');
        result.current.showFeedback('error', 'メッセージ2');
        result.current.showFeedback('warning', 'メッセージ3');
      });

      expect(result.current.messages).toHaveLength(3);
      expect(result.current.messages[0].message).toBe('メッセージ1');
      expect(result.current.messages[1].message).toBe('メッセージ2');
      expect(result.current.messages[2].message).toBe('メッセージ3');
    });

    it('各メッセージにユニークなIDが付与される', () => {
      const { result } = renderHook(() => useFeedback());

      act(() => {
        result.current.showFeedback('success', 'メッセージ1');
        result.current.showFeedback('success', 'メッセージ2');
      });

      const ids = result.current.messages.map(msg => msg.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(2);
    });

    it('3秒後にメッセージが自動削除される', () => {
      const { result } = renderHook(() => useFeedback());

      act(() => {
        result.current.showFeedback('success', 'メッセージ');
      });

      expect(result.current.messages).toHaveLength(1);

      // 3秒経過
      act(() => {
        jest.advanceTimersByTime(3000);
      });

      expect(result.current.messages).toHaveLength(0);
    });

    it('複数のメッセージがそれぞれ3秒後に削除される', () => {
      const { result } = renderHook(() => useFeedback());

      act(() => {
        result.current.showFeedback('success', 'メッセージ1');
      });

      // 1秒後に2つ目のメッセージ
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      act(() => {
        result.current.showFeedback('error', 'メッセージ2');
      });

      expect(result.current.messages).toHaveLength(2);

      // さらに2秒経過（最初のメッセージから3秒）
      act(() => {
        jest.advanceTimersByTime(2000);
      });

      // 最初のメッセージのみ削除される
      expect(result.current.messages).toHaveLength(1);
      expect(result.current.messages[0].message).toBe('メッセージ2');

      // さらに1秒経過（2つ目のメッセージから3秒）
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      // すべてのメッセージが削除される
      expect(result.current.messages).toHaveLength(0);
    });

    it('2秒経過しても削除されない', () => {
      const { result } = renderHook(() => useFeedback());

      act(() => {
        result.current.showFeedback('success', 'メッセージ');
      });

      // 2秒経過
      act(() => {
        jest.advanceTimersByTime(2000);
      });

      // まだ削除されていない
      expect(result.current.messages).toHaveLength(1);
    });
  });

  describe('removeFeedback', () => {
    it('指定したIDのメッセージを削除できる', () => {
      const { result } = renderHook(() => useFeedback());

      act(() => {
        result.current.showFeedback('success', 'メッセージ1');
        result.current.showFeedback('error', 'メッセージ2');
      });

      const messageId = result.current.messages[0].id;

      act(() => {
        result.current.removeFeedback(messageId);
      });

      expect(result.current.messages).toHaveLength(1);
      expect(result.current.messages[0].message).toBe('メッセージ2');
    });

    it('複数のメッセージを個別に削除できる', () => {
      const { result } = renderHook(() => useFeedback());

      act(() => {
        result.current.showFeedback('success', 'メッセージ1');
        result.current.showFeedback('error', 'メッセージ2');
        result.current.showFeedback('warning', 'メッセージ3');
      });

      const id1 = result.current.messages[0].id;
      const id2 = result.current.messages[1].id;

      act(() => {
        result.current.removeFeedback(id1);
      });

      expect(result.current.messages).toHaveLength(2);
      expect(result.current.messages[0].message).toBe('メッセージ2');

      act(() => {
        result.current.removeFeedback(id2);
      });

      expect(result.current.messages).toHaveLength(1);
      expect(result.current.messages[0].message).toBe('メッセージ3');
    });

    it('存在しないIDを指定してもエラーにならない', () => {
      const { result } = renderHook(() => useFeedback());

      act(() => {
        result.current.showFeedback('success', 'メッセージ');
      });

      act(() => {
        result.current.removeFeedback('nonexistent-id');
      });

      expect(result.current.messages).toHaveLength(1);
    });

    it('手動削除してもタイマーは影響しない', () => {
      const { result } = renderHook(() => useFeedback());

      act(() => {
        result.current.showFeedback('success', 'メッセージ1');
        result.current.showFeedback('error', 'メッセージ2');
      });

      const messageId = result.current.messages[0].id;

      // 手動で削除
      act(() => {
        result.current.removeFeedback(messageId);
      });

      // 3秒経過
      act(() => {
        jest.advanceTimersByTime(3000);
      });

      // メッセージ2も削除される
      expect(result.current.messages).toHaveLength(0);
    });
  });

  describe('エッジケース', () => {
    it('空のメッセージ文字列でも追加できる', () => {
      const { result } = renderHook(() => useFeedback());

      act(() => {
        result.current.showFeedback('success', '');
      });

      expect(result.current.messages).toHaveLength(1);
      expect(result.current.messages[0].message).toBe('');
    });

    it('長いメッセージも追加できる', () => {
      const { result } = renderHook(() => useFeedback());
      const longMessage = 'あ'.repeat(1000);

      act(() => {
        result.current.showFeedback('success', longMessage);
      });

      expect(result.current.messages).toHaveLength(1);
      expect(result.current.messages[0].message).toBe(longMessage);
    });
  });
});
