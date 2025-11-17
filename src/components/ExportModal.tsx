import type { FC } from 'react';
import type { ExportFormat } from '../types';

interface ExportModalProps {
    isOpen: boolean;
    exportedText: string;
    copyButtonText: string;
    exportFormat: ExportFormat;
    onFormatChange: (format: ExportFormat) => void;
    onCopy: () => void;
    onClose: () => void;
}

export const ExportModal: FC<ExportModalProps> = ({
    isOpen,
    exportedText,
    copyButtonText,
    exportFormat,
    onFormatChange,
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
                role="dialog"
                aria-labelledby="export-modal-title"
                aria-modal="true"
                className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                <header className="p-4 border-b">
                    <h2 id="export-modal-title" className="text-xl font-semibold mb-3">エクスポートされたデータ</h2>
                    <div className="flex items-center space-x-4">
                        <span className="text-sm font-medium text-gray-700">形式:</span>
                        <div className="flex space-x-3">
                            <label className="flex items-center cursor-pointer">
                                <input
                                    type="radio"
                                    name="export-format"
                                    value="text"
                                    checked={exportFormat === 'text'}
                                    onChange={() => onFormatChange('text')}
                                    className="mr-1.5"
                                />
                                <span className="text-sm">Text</span>
                            </label>
                            <label className="flex items-center cursor-pointer">
                                <input
                                    type="radio"
                                    name="export-format"
                                    value="json"
                                    checked={exportFormat === 'json'}
                                    onChange={() => onFormatChange('json')}
                                    className="mr-1.5"
                                />
                                <span className="text-sm">JSON</span>
                            </label>
                            <label className="flex items-center cursor-pointer">
                                <input
                                    type="radio"
                                    name="export-format"
                                    value="yaml"
                                    checked={exportFormat === 'yaml'}
                                    onChange={() => onFormatChange('yaml')}
                                    className="mr-1.5"
                                />
                                <span className="text-sm">YAML</span>
                            </label>
                        </div>
                    </div>
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
