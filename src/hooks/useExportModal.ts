import { useState, useCallback } from 'react';
import { convertTreeToText } from '../utils/treeParser';
import type { TreeNodeData } from '../types';

export const useExportModal = (treeData: TreeNodeData[]) => {
    const [isOpen, setIsOpen] = useState(false);
    const [exportedText, setExportedText] = useState('');
    const [copyButtonText, setCopyButtonText] = useState('コピー');

    const openModal = useCallback(() => {
        const text = convertTreeToText(treeData);
        setExportedText(text);
        setCopyButtonText('コピー');
        setIsOpen(true);
    }, [treeData]);

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
        openModal,
        closeModal,
        copyToClipboard,
    };
};
