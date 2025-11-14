import type { FC } from 'react';
import { Tree } from './components/Tree';
import { ImportExportSection } from './components/ImportExportSection';
import { ExportModal } from './components/ExportModal';
import { EmptyTreeState } from './components/EmptyTreeState';
import { FeedbackToast } from './components/FeedbackToast';
import { initialRawData } from './constants';
import { useTreeState } from './hooks/useTreeState';
import { useTreeActions } from './hooks/useTreeActions';
import { useFeedback } from './hooks/useFeedback';
import { useDragAndDrop } from './hooks/useDragAndDrop';
import { useExpandedNodes } from './hooks/useExpandedNodes';
import { useExportModal } from './hooks/useExportModal';

const App: FC = () => {
    // 状態管理
    const { state, dispatch } = useTreeState(initialRawData.trim());
    const { treeData, inputText, highlightedNodeId } = state;

    // フィードバック
    const { messages, showFeedback, removeFeedback } = useFeedback();

    // ツリー操作アクション
    const actions = useTreeActions(dispatch, treeData, showFeedback);

    // ドラッグ&ドロップ
    const { dragState, startDrag, updatePreview } = useDragAndDrop(treeData);

    // ノード展開状態
    const { expandedNodes, toggleExpand } = useExpandedNodes(treeData);

    // エクスポートモーダル
    const exportModal = useExportModal(treeData);

    return (
        <div className="min-h-screen bg-gray-100 font-sans p-4 sm:p-6 lg:p-8">
            <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-6">
                <header className="mb-6 border-b pb-4">
                    <h1 className="text-3xl font-bold text-gray-800">階層構造エディタ</h1>
                    <p className="text-gray-500 mt-1">組織図などの階層データを視覚的に編集します。</p>
                </header>

                <ImportExportSection
                    inputText={inputText}
                    onInputChange={actions.setInputText}
                    onImport={() => actions.importData(inputText)}
                    onExport={exportModal.openModal}
                />

                <main>
                    {treeData.length > 0 ? (
                        <Tree
                            data={treeData}
                            onAddNode={actions.addNode}
                            onDeleteNode={actions.deleteNode}
                            onMoveNode={actions.moveNode}
                            onRenameNode={actions.renameNode}
                            expandedNodes={expandedNodes}
                            onToggleExpand={toggleExpand}
                            highlightedNodeId={highlightedNodeId}
                            draggingNodeId={dragState.draggingNodeId}
                            draggingNode={dragState.draggingNode}
                            previewTarget={dragState.previewTarget}
                            onDragStateChange={startDrag}
                            onPreviewChange={updatePreview}
                        />
                    ) : (
                        <EmptyTreeState onAddRootNode={actions.addRootNode} />
                    )}
                </main>
            </div>

            <ExportModal
                isOpen={exportModal.isOpen}
                exportedText={exportModal.exportedText}
                copyButtonText={exportModal.copyButtonText}
                onCopy={exportModal.copyToClipboard}
                onClose={exportModal.closeModal}
            />

            <FeedbackToast messages={messages} onRemove={removeFeedback} />
        </div>
    );
};

export default App;
