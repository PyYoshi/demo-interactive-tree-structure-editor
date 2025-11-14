import { measureRenders } from 'reassure';
import { ExportModal } from '../../src/components/ExportModal';

describe('ExportModal Performance', () => {
  test('renders efficiently when closed', async () => {
    await measureRenders(
      <ExportModal
        isOpen={false}
        exportedText=""
        copyButtonText="コピー"
        onCopy={() => {}}
        onClose={() => {}}
      />
    );
  });

  test('renders efficiently when open with short text', async () => {
    const shortText = '大学\n  学部\n    学科';

    await measureRenders(
      <ExportModal
        isOpen={true}
        exportedText={shortText}
        copyButtonText="コピー"
        onCopy={() => {}}
        onClose={() => {}}
      />
    );
  });

  test('renders efficiently when open with medium text', async () => {
    const mediumText = `大学
  理工学部
    情報工学科
    電気工学科
    機械工学科
  文学部
    国文学科
    英文学科
    歴史学科
企業
  営業部
    第一営業課
    第二営業課
  開発部
    フロントエンド
    バックエンド`;

    await measureRenders(
      <ExportModal
        isOpen={true}
        exportedText={mediumText}
        copyButtonText="コピー"
        onCopy={() => {}}
        onClose={() => {}}
      />
    );
  });

  test('renders efficiently when open with large text (1000 lines)', async () => {
    // 1000行のテキストを生成
    const lines: string[] = [];
    for (let i = 0; i < 1000; i++) {
      lines.push(`Line ${i + 1}: ノード名_${i + 1}`);
    }
    const largeText = lines.join('\n');

    await measureRenders(
      <ExportModal
        isOpen={true}
        exportedText={largeText}
        copyButtonText="コピー"
        onCopy={() => {}}
        onClose={() => {}}
      />
    );
  });

  test('renders efficiently with copy button state change', async () => {
    await measureRenders(
      <ExportModal
        isOpen={true}
        exportedText="テストデータ"
        copyButtonText="コピー完了！"
        onCopy={() => {}}
        onClose={() => {}}
      />
    );
  });
});
