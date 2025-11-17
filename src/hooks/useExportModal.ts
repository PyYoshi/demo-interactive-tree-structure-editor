import { useState, useCallback, useEffect } from 'react';
import { convertTreeToText, convertToJSON, convertToYAML } from '../utils/treeParser';
import type { TreeNodeData, ChangeHistoryEntry, ExportFormat } from '../types';

export const useExportModal = (treeData: TreeNodeData[], changeHistory: ChangeHistoryEntry[]) => {
    const [isOpen, setIsOpen] = useState(false);
    const [exportedText, setExportedText] = useState('');
    const [copyButtonText, setCopyButtonText] = useState('コピー');
    const [exportFormat, setExportFormat] = useState<ExportFormat>('text');

    // 形式やデータが変更されたときに、モーダルが開いている場合はテキストを再生成
    useEffect(() => {
        if (!isOpen) return;

        let text: string;
        switch (exportFormat) {
            case 'json':
                text = convertToJSON(treeData, changeHistory);
                break;
            case 'yaml':
                text = convertToYAML(treeData, changeHistory);
                break;
            case 'text':
            default:
                text = convertTreeToText(treeData);
                break;
        }
        setExportedText(text);
    }, [isOpen, exportFormat, treeData, changeHistory]);

    const openModal = useCallback(() => {
        setCopyButtonText('コピー');
        setIsOpen(true);
    }, []);

    const closeModal = useCallback(() => {
        setIsOpen(false);
    }, []);

    const copyToClipboard = useCallback(() => {
        navigator.clipboard.writeText(exportedText).then(() => {
            setCopyButtonText('コピーしました！');
            setTimeout(() => setCopyButtonText('コピー'), 2000);
        }).catch(err => {
            console.error('Failed to copy text: ', err);
            alert('クリップボードへのコピーに失敗しました。');
        });
    }, [exportedText]);

    return {
        isOpen,
        exportedText,
        copyButtonText,
        exportFormat,
        setExportFormat,
        openModal,
        closeModal,
        copyToClipboard,
    };
};
