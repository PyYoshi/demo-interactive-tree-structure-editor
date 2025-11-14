import { measureRenders } from 'reassure';
import { ImportExportSection } from '../../src/components/ImportExportSection';

describe('ImportExportSection Performance', () => {
  test('renders efficiently with empty input', async () => {
    await measureRenders(
      <ImportExportSection
        inputText=""
        onInputChange={() => {}}
        onImport={() => {}}
        onExport={() => {}}
      />
    );
  });

  test('renders efficiently with short input text', async () => {
    const shortText = '大学 > 学部 > 学科';

    await measureRenders(
      <ImportExportSection
        inputText={shortText}
        onInputChange={() => {}}
        onImport={() => {}}
        onExport={() => {}}
      />
    );
  });

  test('renders efficiently with medium input text', async () => {
    const mediumText = `大学 > 理工学部 > 情報工学科
大学 > 理工学部 > 電気工学科
大学 > 理工学部 > 機械工学科
大学 > 文学部 > 国文学科
大学 > 文学部 > 英文学科
大学 > 文学部 > 歴史学科
企業 > 営業部 > 第一営業課
企業 > 営業部 > 第二営業課
企業 > 開発部 > フロントエンド
企業 > 開発部 > バックエンド`;

    await measureRenders(
      <ImportExportSection
        inputText={mediumText}
        onInputChange={() => {}}
        onImport={() => {}}
        onExport={() => {}}
      />
    );
  });

  test('renders efficiently with large input text (100 lines)', async () => {
    const lines: string[] = [];
    for (let i = 0; i < 100; i++) {
      lines.push(`ルート${Math.floor(i / 10)} > 親${i} > 子${i}`);
    }
    const largeText = lines.join('\n');

    await measureRenders(
      <ImportExportSection
        inputText={largeText}
        onInputChange={() => {}}
        onImport={() => {}}
        onExport={() => {}}
      />
    );
  });

  test('renders efficiently with very large input text (500 lines)', async () => {
    const lines: string[] = [];
    for (let i = 0; i < 500; i++) {
      lines.push(`組織${Math.floor(i / 50)} > 部門${Math.floor(i / 10)} > チーム${i} > メンバー${i}`);
    }
    const veryLargeText = lines.join('\n');

    await measureRenders(
      <ImportExportSection
        inputText={veryLargeText}
        onInputChange={() => {}}
        onImport={() => {}}
        onExport={() => {}}
      />
    );
  });
});
