import { describe, it, expect } from 'vitest';
import {
  removeNodeRecursive,
  insertNodeRecursive,
  getAllDescendantIds,
  isDescendant,
  findNode,
  hasDuplicateNameInSiblings,
  findParentNode,
  getDestinationSiblings
} from './treeOperations';
import type { TreeNodeData } from '../types';

// テスト用のヘルパー関数：ツリー構造を作成
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

describe('removeNodeRecursive', () => {
  it('ルートノードを削除できる', () => {
    const tree = createTestTree();
    const { nodes, foundNode } = removeNodeRecursive(tree, '1');

    expect(nodes).toHaveLength(0);
    expect(foundNode).not.toBeNull();
    expect(foundNode?.id).toBe('1');
  });

  it('子ノードを削除できる', () => {
    const tree = createTestTree();
    const { nodes, foundNode } = removeNodeRecursive(tree, '2');

    expect(nodes).toHaveLength(1);
    expect(nodes[0].children).toHaveLength(1);
    expect(nodes[0].children[0].id).toBe('5');
    expect(foundNode).not.toBeNull();
    expect(foundNode?.id).toBe('2');
  });

  it('葉ノードを削除できる', () => {
    const tree = createTestTree();
    const { nodes, foundNode } = removeNodeRecursive(tree, '3');

    const bungakubu = nodes[0].children[0];
    expect(bungakubu.children).toHaveLength(1);
    expect(bungakubu.children[0].id).toBe('4');
    expect(foundNode).not.toBeNull();
    expect(foundNode?.id).toBe('3');
  });

  it('存在しないノードを削除しようとするとfoundNodeがnull', () => {
    const tree = createTestTree();
    const { nodes, foundNode } = removeNodeRecursive(tree, '999');

    expect(nodes).toHaveLength(1);
    expect(foundNode).toBeNull();
  });

  it('削除したノードの子も一緒に削除される', () => {
    const tree = createTestTree();
    const { nodes, foundNode } = removeNodeRecursive(tree, '2');

    expect(foundNode?.children).toHaveLength(2);
    expect(findNode(nodes, '3')).toBeNull();
    expect(findNode(nodes, '4')).toBeNull();
  });
});

describe('insertNodeRecursive', () => {
  const newNode: TreeNodeData = { id: '99', name: '新学部', children: [] };

  it('ノードの前に挿入できる（before）', () => {
    const tree = createTestTree();
    const { nodes, inserted } = insertNodeRecursive(tree, '2', newNode, 'before');

    expect(inserted).toBe(true);
    expect(nodes[0].children).toHaveLength(3);
    expect(nodes[0].children[0].id).toBe('99');
    expect(nodes[0].children[1].id).toBe('2');
    expect(nodes[0].children[2].id).toBe('5');
  });

  it('ノードの後に挿入できる（after）', () => {
    const tree = createTestTree();
    const { nodes, inserted } = insertNodeRecursive(tree, '2', newNode, 'after');

    expect(inserted).toBe(true);
    expect(nodes[0].children).toHaveLength(3);
    expect(nodes[0].children[0].id).toBe('2');
    expect(nodes[0].children[1].id).toBe('99');
    expect(nodes[0].children[2].id).toBe('5');
  });

  it('ノードの中に挿入できる（inside）', () => {
    const tree = createTestTree();
    const { nodes, inserted } = insertNodeRecursive(tree, '2', newNode, 'inside');

    expect(inserted).toBe(true);
    const bungakubu = nodes[0].children[0];
    expect(bungakubu.children).toHaveLength(3);
    expect(bungakubu.children[2].id).toBe('99');
  });

  it('ルートレベルに挿入できる', () => {
    const tree = createTestTree();
    const newRoot: TreeNodeData = { id: '100', name: '企業', children: [] };
    const { nodes, inserted } = insertNodeRecursive(tree, '1', newRoot, 'after');

    expect(inserted).toBe(true);
    expect(nodes).toHaveLength(2);
    expect(nodes[1].id).toBe('100');
  });

  it('存在しないノードへの挿入は失敗する', () => {
    const tree = createTestTree();
    const { nodes, inserted } = insertNodeRecursive(tree, '999', newNode, 'inside');

    expect(inserted).toBe(false);
    expect(nodes).toEqual(tree);
  });

  it('深い階層にも挿入できる', () => {
    const tree = createTestTree();
    const { nodes, inserted } = insertNodeRecursive(tree, '3', newNode, 'after');

    expect(inserted).toBe(true);
    const bungakubu = nodes[0].children[0];
    expect(bungakubu.children).toHaveLength(3);
    expect(bungakubu.children[1].id).toBe('99');
  });
});

describe('getAllDescendantIds', () => {
  it('子を持たないノードは自分のIDのみを返す', () => {
    const node: TreeNodeData = { id: '1', name: 'テスト', children: [] };
    const ids = getAllDescendantIds(node);

    expect(ids).toEqual(['1']);
  });

  it('子を持つノードは自分と子のIDを返す', () => {
    const node: TreeNodeData = {
      id: '1',
      name: '親',
      children: [
        { id: '2', name: '子1', children: [] },
        { id: '3', name: '子2', children: [] }
      ]
    };
    const ids = getAllDescendantIds(node);

    expect(ids).toEqual(['1', '2', '3']);
  });

  it('深い階層の子孫もすべて取得する', () => {
    const tree = createTestTree();
    const ids = getAllDescendantIds(tree[0]);

    expect(ids).toHaveLength(6);
    expect(ids).toContain('1');
    expect(ids).toContain('2');
    expect(ids).toContain('3');
    expect(ids).toContain('4');
    expect(ids).toContain('5');
    expect(ids).toContain('6');
  });

  it('部分ツリーの子孫も取得できる', () => {
    const tree = createTestTree();
    const bungakubu = tree[0].children[0];
    const ids = getAllDescendantIds(bungakubu);

    expect(ids).toEqual(['2', '3', '4']);
  });
});

describe('isDescendant', () => {
  it('ノード自身はtrueを返す', () => {
    const tree = createTestTree();
    const result = isDescendant(tree[0], '1');

    expect(result).toBe(true);
  });

  it('直接の子はtrueを返す', () => {
    const tree = createTestTree();
    const result = isDescendant(tree[0], '2');

    expect(result).toBe(true);
  });

  it('孫以降の子孫もtrueを返す', () => {
    const tree = createTestTree();
    const result = isDescendant(tree[0], '3');

    expect(result).toBe(true);
  });

  it('子孫でないノードはfalseを返す', () => {
    const tree = createTestTree();
    const bungakubu = tree[0].children[0];
    const result = isDescendant(bungakubu, '5');

    expect(result).toBe(false);
  });

  it('存在しないIDはfalseを返す', () => {
    const tree = createTestTree();
    const result = isDescendant(tree[0], '999');

    expect(result).toBe(false);
  });
});

describe('findNode', () => {
  it('ルートノードを見つけられる', () => {
    const tree = createTestTree();
    const node = findNode(tree, '1');

    expect(node).not.toBeNull();
    expect(node?.id).toBe('1');
    expect(node?.name).toBe('大学');
  });

  it('子ノードを見つけられる', () => {
    const tree = createTestTree();
    const node = findNode(tree, '2');

    expect(node).not.toBeNull();
    expect(node?.id).toBe('2');
    expect(node?.name).toBe('文学部');
  });

  it('深い階層のノードも見つけられる', () => {
    const tree = createTestTree();
    const node = findNode(tree, '3');

    expect(node).not.toBeNull();
    expect(node?.id).toBe('3');
    expect(node?.name).toBe('日本文学科');
  });

  it('存在しないノードはnullを返す', () => {
    const tree = createTestTree();
    const node = findNode(tree, '999');

    expect(node).toBeNull();
  });

  it('空の配列からの検索はnullを返す', () => {
    const node = findNode([], '1');

    expect(node).toBeNull();
  });

  it('複数のルートノードから検索できる', () => {
    const tree: TreeNodeData[] = [
      { id: '1', name: 'ルート1', children: [] },
      { id: '2', name: 'ルート2', children: [] },
      { id: '3', name: 'ルート3', children: [] }
    ];
    const node = findNode(tree, '2');

    expect(node).not.toBeNull();
    expect(node?.name).toBe('ルート2');
  });
});

describe('hasDuplicateNameInSiblings', () => {
  it('空の配列では重複なし', () => {
    const siblings: TreeNodeData[] = [];
    const result = hasDuplicateNameInSiblings(siblings, '文学部');

    expect(result).toBe(false);
  });

  it('同じ名前のノードが存在する場合はtrueを返す', () => {
    const siblings: TreeNodeData[] = [
      { id: '1', name: '文学部', children: [] },
      { id: '2', name: '理学部', children: [] }
    ];
    const result = hasDuplicateNameInSiblings(siblings, '文学部');

    expect(result).toBe(true);
  });

  it('同じ名前のノードが存在しない場合はfalseを返す', () => {
    const siblings: TreeNodeData[] = [
      { id: '1', name: '文学部', children: [] },
      { id: '2', name: '理学部', children: [] }
    ];
    const result = hasDuplicateNameInSiblings(siblings, '工学部');

    expect(result).toBe(false);
  });

  it('前後の空白を含む名前でも正しく重複を検出', () => {
    const siblings: TreeNodeData[] = [
      { id: '1', name: '文学部', children: [] },
      { id: '2', name: '理学部', children: [] }
    ];
    const result = hasDuplicateNameInSiblings(siblings, '  文学部  ');

    expect(result).toBe(true);
  });

  it('既存ノードに空白がある場合も正しく重複を検出', () => {
    const siblings: TreeNodeData[] = [
      { id: '1', name: '  文学部  ', children: [] },
      { id: '2', name: '理学部', children: [] }
    ];
    const result = hasDuplicateNameInSiblings(siblings, '文学部');

    expect(result).toBe(true);
  });

  it('大文字小文字は区別される', () => {
    const siblings: TreeNodeData[] = [
      { id: '1', name: 'abc', children: [] }
    ];
    const result = hasDuplicateNameInSiblings(siblings, 'ABC');

    expect(result).toBe(false);
  });

  it('複数の同名ノードが存在してもtrueを返す', () => {
    const siblings: TreeNodeData[] = [
      { id: '1', name: '文学部', children: [] },
      { id: '2', name: '文学部', children: [] },
      { id: '3', name: '理学部', children: [] }
    ];
    const result = hasDuplicateNameInSiblings(siblings, '文学部');

    expect(result).toBe(true);
  });

  it('excludeIdを指定すると、そのノードは除外される', () => {
    const siblings: TreeNodeData[] = [
      { id: '1', name: '文学部', children: [] },
      { id: '2', name: '理学部', children: [] }
    ];
    // ID='1'のノードを除外して「文学部」をチェック → 重複なし
    const result = hasDuplicateNameInSiblings(siblings, '文学部', '1');

    expect(result).toBe(false);
  });

  it('excludeIdを指定しても、他に同名ノードがあればtrueを返す', () => {
    const siblings: TreeNodeData[] = [
      { id: '1', name: '文学部', children: [] },
      { id: '2', name: '文学部', children: [] },
      { id: '3', name: '理学部', children: [] }
    ];
    // ID='1'を除外しても、ID='2'に「文学部」が存在
    const result = hasDuplicateNameInSiblings(siblings, '文学部', '1');

    expect(result).toBe(true);
  });
});

describe('findParentNode', () => {
  it('直接の親を見つけられる', () => {
    const tree = createTestTree();
    const parentNode = findParentNode(tree, '2'); // '2'は文学部

    expect(parentNode).not.toBeNull();
    expect(parentNode?.id).toBe('1'); // 大学
    expect(parentNode?.name).toBe('大学');
  });

  it('深い階層の親も見つけられる', () => {
    const tree = createTestTree();
    const parentNode = findParentNode(tree, '3'); // '3'は日本文学科

    expect(parentNode).not.toBeNull();
    expect(parentNode?.id).toBe('2'); // 文学部
    expect(parentNode?.name).toBe('文学部');
  });

  it('ルートノードの親はnullを返す', () => {
    const tree = createTestTree();
    const parentNode = findParentNode(tree, '1'); // '1'はルート

    expect(parentNode).toBeNull();
  });

  it('存在しないノードの親はnullを返す', () => {
    const tree = createTestTree();
    const parentNode = findParentNode(tree, '999');

    expect(parentNode).toBeNull();
  });

  it('空の配列からの検索はnullを返す', () => {
    const parentNode = findParentNode([], '1');

    expect(parentNode).toBeNull();
  });
});

describe('getDestinationSiblings', () => {
  it('inside位置では、targetノードの子配列を返す', () => {
    const tree = createTestTree();
    const siblings = getDestinationSiblings(tree, '1', 'inside'); // 大学の子

    expect(siblings).not.toBeNull();
    expect(siblings).toHaveLength(2);
    expect(siblings?.[0].id).toBe('2'); // 文学部
    expect(siblings?.[1].id).toBe('5'); // 理学部
  });

  it('before位置では、targetノードの親の子配列を返す', () => {
    const tree = createTestTree();
    const siblings = getDestinationSiblings(tree, '2', 'before'); // 文学部の兄弟

    expect(siblings).not.toBeNull();
    expect(siblings).toHaveLength(2);
    expect(siblings?.[0].id).toBe('2'); // 文学部
    expect(siblings?.[1].id).toBe('5'); // 理学部
  });

  it('after位置では、targetノードの親の子配列を返す', () => {
    const tree = createTestTree();
    const siblings = getDestinationSiblings(tree, '5', 'after'); // 理学部の兄弟

    expect(siblings).not.toBeNull();
    expect(siblings).toHaveLength(2);
    expect(siblings?.[0].id).toBe('2'); // 文学部
    expect(siblings?.[1].id).toBe('5'); // 理学部
  });

  it('ルートレベルのbefore/after位置では、ルート配列を返す', () => {
    const tree = createTestTree();
    const siblings = getDestinationSiblings(tree, '1', 'before');

    expect(siblings).not.toBeNull();
    expect(siblings).toHaveLength(1);
    expect(siblings?.[0].id).toBe('1'); // 大学
  });

  it('存在しないノードではnullを返す', () => {
    const tree = createTestTree();
    const siblings = getDestinationSiblings(tree, '999', 'inside');

    expect(siblings).toBeNull();
  });

  it('子を持たないノードのinside位置では空配列を返す', () => {
    const tree = createTestTree();
    const siblings = getDestinationSiblings(tree, '3', 'inside'); // 日本文学科（葉ノード）

    expect(siblings).not.toBeNull();
    expect(siblings).toHaveLength(0);
  });
});
