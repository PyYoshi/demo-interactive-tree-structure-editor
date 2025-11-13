import { useState, useCallback } from 'react';

export interface FeedbackMessage {
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
}

export const useFeedback = () => {
    const [messages, setMessages] = useState<FeedbackMessage[]>([]);

    const showFeedback = useCallback((type: 'success' | 'error' | 'warning' | 'info', message: string) => {
        const id = `${Date.now()}-${Math.random()}`;
        const newMessage: FeedbackMessage = { id, type, message };

        setMessages(prev => [...prev, newMessage]);

        // 3秒後に自動削除
        setTimeout(() => {
            setMessages(prev => prev.filter(msg => msg.id !== id));
        }, 3000);

        // デバッグログ
        const emoji = type === 'success' ? '✅' : type === 'error' ? '❌' : type === 'warning' ? '⚠️' : 'ℹ️';
        console.debug(`${emoji} [Feedback] ${message}`);
    }, []);

    const removeFeedback = useCallback((id: string) => {
        setMessages(prev => prev.filter(msg => msg.id !== id));
    }, []);

    return { messages, showFeedback, removeFeedback };
};
