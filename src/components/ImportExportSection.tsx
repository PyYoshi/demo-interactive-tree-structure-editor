import React from 'react';

interface ImportExportSectionProps {
    inputText: string;
    onInputChange: (text: string) => void;
    onImport: () => void;
    onExport: () => void;
}

export const ImportExportSection: React.FC<ImportExportSectionProps> = ({
    inputText,
    onInputChange,
    onImport,
    onExport,
}) => {
    return (
        <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-700 mb-2">階層データのインポート・エクスポート</h2>
            <p className="text-gray-600 mb-4 text-sm">
                以下のテキストエリアに階層構造データを貼り付け、「ツリーを生成」ボタンをクリックしてインポートします。<br />
                現在のツリー構造をテキストデータとして書き出すには、「ツリーをエクスポート」ボタンをクリックしてください。
            </p>
            <textarea
                className="w-full h-48 p-3 font-mono text-sm bg-gray-50 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                value={inputText}
                onChange={(e) => onInputChange(e.target.value)}
                placeholder="例:&#10;大学 > 学部 > 学科&#10;大学 > 学部 > 別の学科"
            />
            <div className="mt-4 flex justify-end space-x-2">
                <button
                    onClick={onExport}
                    className="px-6 py-2 font-semibold text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                >
                    ツリーをエクスポート
                </button>
                <button
                    onClick={onImport}
                    className="px-6 py-2 font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                >
                    ツリーを生成
                </button>
            </div>
        </section>
    );
};
