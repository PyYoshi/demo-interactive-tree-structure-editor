import { parseData, convertTreeToText, convertToJSON, convertToYAML } from './treeParser';
import type { TreeNodeData, ChangeHistoryEntry } from '../types';

describe('parseData', () => {
  it('空の文字列をパースすると空の配列を返す', () => {
    const result = parseData('');
    expect(result).toEqual([]);
  });

  it('空行のみの文字列をパースすると空の配列を返す', () => {
    const result = parseData('\n\n\n');
    expect(result).toEqual([]);
  });

  it('単一のルートノードをパースできる', () => {
    const result = parseData('大学');
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('大学');
    expect(result[0].children).toEqual([]);
  });

  it('単純な階層構造をパースできる', () => {
    const result = parseData('大学 > 文学部 > 日本文学科');
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('大学');
    expect(result[0].children).toHaveLength(1);
    expect(result[0].children[0].name).toBe('文学部');
    expect(result[0].children[0].children).toHaveLength(1);
    expect(result[0].children[0].children[0].name).toBe('日本文学科');
    expect(result[0].children[0].children[0].children).toEqual([]);
  });

  it('同じ親を持つ複数の子をパースできる', () => {
    const input = `大学 > 文学部 > 日本文学科
大学 > 文学部 > 外国語文学科`;
    const result = parseData(input);

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('大学');
    expect(result[0].children).toHaveLength(1);
    expect(result[0].children[0].name).toBe('文学部');
    expect(result[0].children[0].children).toHaveLength(2);
    expect(result[0].children[0].children[0].name).toBe('日本文学科');
    expect(result[0].children[0].children[1].name).toBe('外国語文学科');
  });

  it('複数のルートノードをパースできる', () => {
    const input = `大学 > 文学部
企業 > 開発部`;
    const result = parseData(input);

    expect(result).toHaveLength(2);
    expect(result[0].name).toBe('大学');
    expect(result[1].name).toBe('企業');
  });

  it('複雑な階層構造をパースできる', () => {
    const input = `大学 > 文学部 > 日本文学科
大学 > 文学部 > 外国語文学科
大学 > 理学部 > 数学科
大学 > 理学部 > 物理学科`;
    const result = parseData(input);

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('大学');
    expect(result[0].children).toHaveLength(2);

    const bungakubu = result[0].children[0];
    expect(bungakubu.name).toBe('文学部');
    expect(bungakubu.children).toHaveLength(2);

    const rigakubu = result[0].children[1];
    expect(rigakubu.name).toBe('理学部');
    expect(rigakubu.children).toHaveLength(2);
  });

  it('空行を含む入力を正しく処理する', () => {
    const input = `大学 > 文学部

大学 > 理学部`;
    const result = parseData(input);

    expect(result).toHaveLength(1);
    expect(result[0].children).toHaveLength(2);
  });

  it('各ノードにユニークなIDが付与される', () => {
    const result = parseData('大学 > 文学部 > 日本文学科');
    const ids = new Set<string>();

    const collectIds = (node: TreeNodeData) => {
      ids.add(node.id);
      node.children.forEach(collectIds);
    };

    result.forEach(collectIds);
    expect(ids.size).toBe(3); // 3つのノードすべてがユニークなID
  });
});

describe('convertTreeToText', () => {
  it('空の配列を変換すると空の文字列を返す', () => {
    const result = convertTreeToText([]);
    expect(result).toBe('');
  });

  it('子を持たない単一のノードを変換できる', () => {
    const data: TreeNodeData[] = [
      { id: '1', name: '大学', children: [] }
    ];
    const result = convertTreeToText(data);
    expect(result).toBe('大学');
  });

  it('単純な階層構造を変換できる', () => {
    const data: TreeNodeData[] = [
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
    const result = convertTreeToText(data);
    expect(result).toBe('大学 > 文学部 > 日本文学科');
  });

  it('葉ノードのみをエクスポートする', () => {
    const data: TreeNodeData[] = [
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
    const result = convertTreeToText(data);
    const lines = result.split('\n');
    expect(lines).toHaveLength(2);
    expect(lines[0]).toBe('大学 > 文学部 > 日本文学科');
    expect(lines[1]).toBe('大学 > 文学部 > 外国語文学科');
  });

  it('複数のルートノードを変換できる', () => {
    const data: TreeNodeData[] = [
      {
        id: '1',
        name: '大学',
        children: [
          { id: '2', name: '文学部', children: [] }
        ]
      },
      {
        id: '3',
        name: '企業',
        children: [
          { id: '4', name: '開発部', children: [] }
        ]
      }
    ];
    const result = convertTreeToText(data);
    const lines = result.split('\n');
    expect(lines).toHaveLength(2);
    expect(lines[0]).toBe('大学 > 文学部');
    expect(lines[1]).toBe('企業 > 開発部');
  });

  it('複雑な階層構造を変換できる', () => {
    const data: TreeNodeData[] = [
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
              { id: '6', name: '数学科', children: [] },
              { id: '7', name: '物理学科', children: [] }
            ]
          }
        ]
      }
    ];
    const result = convertTreeToText(data);
    const lines = result.split('\n');
    expect(lines).toHaveLength(4);
    expect(lines).toContain('大学 > 文学部 > 日本文学科');
    expect(lines).toContain('大学 > 文学部 > 外国語文学科');
    expect(lines).toContain('大学 > 理学部 > 数学科');
    expect(lines).toContain('大学 > 理学部 > 物理学科');
  });
});

describe('parseData と convertTreeToText の相互変換', () => {
  it('パース後に再変換すると元のデータと一致する（単純な場合）', () => {
    const original = '大学 > 文学部 > 日本文学科';
    const parsed = parseData(original);
    const converted = convertTreeToText(parsed);
    expect(converted).toBe(original);
  });

  it('パース後に再変換すると元のデータと一致する（複雑な場合）', () => {
    const original = `大学 > 文学部 > 日本文学科
大学 > 文学部 > 外国語文学科
大学 > 理学部 > 数学科
大学 > 理学部 > 物理学科`;
    const parsed = parseData(original);
    const converted = convertTreeToText(parsed);
    expect(converted).toBe(original);
  });
});

describe('convertToJSON', () => {
  it('ツリーと変更履歴をJSON形式に変換できる', () => {
    const data: TreeNodeData[] = [
      { id: '1', name: '大学', children: [] }
    ];
    const changeHistory: ChangeHistoryEntry[] = [
      {
        timestamp: '2025-01-01T00:00:00.000Z',
        type: 'import',
        details: 'テストインポート',
      }
    ];

    const result = convertToJSON(data, changeHistory);
    const parsed = JSON.parse(result);

    expect(parsed).toHaveProperty('tree');
    expect(parsed).toHaveProperty('changeHistory');
    expect(parsed).toHaveProperty('exportedAt');
    expect(parsed.tree).toEqual(data);
    expect(parsed.changeHistory).toEqual(changeHistory);
  });

  it('空のツリーと空の変更履歴をJSON形式に変換できる', () => {
    const result = convertToJSON([], []);
    const parsed = JSON.parse(result);

    expect(parsed.tree).toEqual([]);
    expect(parsed.changeHistory).toEqual([]);
    expect(parsed).toHaveProperty('exportedAt');
  });

  it('JSONは整形されている（インデント付き）', () => {
    const data: TreeNodeData[] = [
      { id: '1', name: '大学', children: [] }
    ];
    const result = convertToJSON(data, []);

    expect(result).toContain('\n');
    expect(result).toContain('  ');
  });
});

describe('convertToYAML', () => {
  it('ツリーと変更履歴をYAML形式に変換できる', () => {
    const data: TreeNodeData[] = [
      { id: '1', name: '大学', children: [] }
    ];
    const changeHistory: ChangeHistoryEntry[] = [
      {
        timestamp: '2025-01-01T00:00:00.000Z',
        type: 'add',
        nodeName: 'テストノード',
      }
    ];

    const result = convertToYAML(data, changeHistory);

    expect(result).toContain('tree:');
    expect(result).toContain('changeHistory:');
    expect(result).toContain('exportedAt:');
    expect(result).toContain('id: 1');
    expect(result).toContain('name: 大学');
    expect(result).toContain('type: add');
    expect(result).toContain('nodeName: テストノード');
  });

  it('空のツリーと空の変更履歴をYAML形式に変換できる', () => {
    const result = convertToYAML([], []);

    expect(result).toContain('tree: []');
    expect(result).toContain('changeHistory: []');
    expect(result).toContain('exportedAt:');
  });

  it('複雑なツリー構造をYAML形式に変換できる', () => {
    const data: TreeNodeData[] = [
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

    const result = convertToYAML(data, []);

    expect(result).toContain('id: 1');
    expect(result).toContain('name: 大学');
    expect(result).toContain('id: 2');
    expect(result).toContain('name: 文学部');
    expect(result).toContain('id: 3');
    expect(result).toContain('name: 日本文学科');
  });
});
