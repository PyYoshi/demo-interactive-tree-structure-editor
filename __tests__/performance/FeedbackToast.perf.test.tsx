import { measureRenders } from 'reassure';
import { FeedbackToast } from '../../src/components/FeedbackToast';
import type { FeedbackMessage } from '../../src/hooks/useFeedback';

describe('FeedbackToast Performance', () => {
  test('renders efficiently with no messages', async () => {
    await measureRenders(
      <FeedbackToast messages={[]} onRemove={() => {}} />
    );
  });

  test('renders efficiently with single success message', async () => {
    const messages: FeedbackMessage[] = [
      {
        id: '1',
        type: 'success',
        message: 'ノードを追加しました',
      },
    ];

    await measureRenders(
      <FeedbackToast messages={messages} onRemove={() => {}} />
    );
  });

  test('renders efficiently with single error message', async () => {
    const messages: FeedbackMessage[] = [
      {
        id: '1',
        type: 'error',
        message: '同じ名前のノードが既に存在します',
      },
    ];

    await measureRenders(
      <FeedbackToast messages={messages} onRemove={() => {}} />
    );
  });

  test('renders efficiently with multiple messages (3)', async () => {
    const messages: FeedbackMessage[] = [
      {
        id: '1',
        type: 'success',
        message: 'ノードを追加しました',
      },
      {
        id: '2',
        type: 'warning',
        message: 'データのインポート中に警告が発生しました',
      },
      {
        id: '3',
        type: 'info',
        message: '変更が保存されました',
      },
    ];

    await measureRenders(
      <FeedbackToast messages={messages} onRemove={() => {}} />
    );
  });

  test('renders efficiently with many messages (10)', async () => {
    const messages: FeedbackMessage[] = [];
    const types: Array<'success' | 'error' | 'warning' | 'info'> = ['success', 'error', 'warning', 'info'];

    for (let i = 0; i < 10; i++) {
      messages.push({
        id: String(i + 1),
        type: types[i % types.length],
        message: `メッセージ ${i + 1}: テスト用のフィードバックメッセージです`,
      });
    }

    await measureRenders(
      <FeedbackToast messages={messages} onRemove={() => {}} />
    );
  });

  test('renders efficiently with all message types', async () => {
    const messages: FeedbackMessage[] = [
      {
        id: '1',
        type: 'success',
        message: '成功メッセージ',
      },
      {
        id: '2',
        type: 'error',
        message: 'エラーメッセージ',
      },
      {
        id: '3',
        type: 'warning',
        message: '警告メッセージ',
      },
      {
        id: '4',
        type: 'info',
        message: '情報メッセージ',
      },
    ];

    await measureRenders(
      <FeedbackToast messages={messages} onRemove={() => {}} />
    );
  });

  test('renders efficiently with long message text', async () => {
    const messages: FeedbackMessage[] = [
      {
        id: '1',
        type: 'error',
        message: 'これは非常に長いエラーメッセージです。ノードの移動操作中に予期しないエラーが発生しました。移動先に同じ名前のノードが既に存在するため、この操作を完了できません。別の名前を使用するか、移動先を変更してください。',
      },
    ];

    await measureRenders(
      <FeedbackToast messages={messages} onRemove={() => {}} />
    );
  });
});
