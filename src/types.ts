
export interface TreeNodeData {
  id: string;
  name: string;
  children: TreeNodeData[];
}

/**
 * 変更履歴のアクションタイプ
 */
export type ChangeActionType = 'import' | 'add' | 'delete' | 'move';

/**
 * 変更履歴のエントリ
 */
export interface ChangeHistoryEntry {
  /** タイムスタンプ（ISO 8601形式） */
  timestamp: string;
  /** アクションタイプ */
  type: ChangeActionType;
  /** ノード名 */
  nodeName?: string;
  /** 親ノード名（追加時） */
  parentName?: string;
  /** 元のパス（削除・移動時） */
  fromPath?: string;
  /** 移動先のパス（移動時） */
  toPath?: string;
  /** 移動位置（移動時） */
  position?: 'before' | 'after' | 'inside';
  /** ターゲットノード名（移動時、before/after の場合） */
  targetNodeName?: string;
  /** 詳細情報 */
  details?: string;
}

/**
 * エクスポート形式
 */
export type ExportFormat = 'text' | 'json' | 'yaml';

/**
 * エクスポートデータ（JSON/YAML用）
 */
export interface ExportData {
  /** ツリー構造 */
  tree: TreeNodeData[];
  /** 変更履歴 */
  changeHistory: ChangeHistoryEntry[];
  /** エクスポート日時 */
  exportedAt: string;
}
