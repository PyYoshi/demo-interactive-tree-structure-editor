import type { FC } from 'react';

interface ExportModalProps {
    isOpen: boolean;
    exportedText: string;
    copyButtonText: string;
    onCopy: () => void;
    onClose: () => void;
}

export const ExportModal: FC<ExportModalProps> = ({
    isOpen,
    exportedText,
    copyButtonText,
    onCopy,
    onClose,
}) => {
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-gray-600/75 flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                <header className="p-4 border-b">
                    <h2 className="text-xl font-semibold">エクスポートされたデータ</h2>
                </header>
                <main className="p-4 flex-grow overflow-y-auto">
                    <textarea
                        readOnly
                        className="w-full h-full p-3 font-mono text-sm bg-gray-50 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition min-h-[200px]"
                        value={exportedText}
                    />
                </main>
                <footer className="p-4 border-t flex justify-end items-center space-x-2">
                    <button
                        onClick={onCopy}
                        className="px-4 py-2 font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors w-40 text-center"
                    >
                        {copyButtonText}
                    </button>
                    <button
                        onClick={onClose}
                        className="px-4 py-2 font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                    >
                        閉じる
                    </button>
                </footer>
            </div>
        </div>
    );
};
