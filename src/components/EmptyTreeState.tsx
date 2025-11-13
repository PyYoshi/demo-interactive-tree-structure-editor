import React, { useState } from 'react';

interface EmptyTreeStateProps {
    onAddRootNode: (name: string) => void;
}

export const EmptyTreeState: React.FC<EmptyTreeStateProps> = ({ onAddRootNode }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [newRootNodeName, setNewRootNodeName] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newRootNodeName.trim()) {
            onAddRootNode(newRootNodeName.trim());
            setNewRootNodeName('');
            setIsAdding(false);
        }
    };

    return (
        <div className="text-center py-10 px-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            {isAdding ? (
                <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center justify-center gap-2">
                    <input
                        type="text"
                        value={newRootNodeName}
                        onChange={(e) => setNewRootNodeName(e.target.value)}
                        placeholder="ルートノード名..."
                        autoFocus
                        className="w-full sm:w-auto flex-grow px-3 py-2 text-base bg-white border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <div className="flex items-center space-x-2">
                        <button
                            type="submit"
                            className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            保存
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsAdding(false)}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none"
                        >
                            キャンセル
                        </button>
                    </div>
                </form>
            ) : (
                <>
                    <h3 className="text-lg font-medium text-gray-700">ツリーがありません</h3>
                    <p className="text-gray-500 mt-1 mb-4">データをインポートするか、最初のノードを追加してください。</p>
                    <button
                        onClick={() => setIsAdding(true)}
                        className="px-5 py-2.5 font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                    >
                        ルートノードを追加
                    </button>
                </>
            )}
        </div>
    );
};
