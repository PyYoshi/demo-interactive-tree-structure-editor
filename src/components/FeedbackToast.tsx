import type { FC } from 'react';
import type { FeedbackMessage } from '../hooks/useFeedback';

interface FeedbackToastProps {
    messages: FeedbackMessage[];
    onRemove: (id: string) => void;
}

export const FeedbackToast: FC<FeedbackToastProps> = ({ messages, onRemove }) => {
    if (messages.length === 0) return null;

    return (
        <div className="fixed bottom-4 right-4 z-50 space-y-2">
            {messages.map(msg => {
                const bgColor =
                    msg.type === 'success' ? 'bg-green-500' :
                    msg.type === 'error' ? 'bg-red-500' :
                    msg.type === 'warning' ? 'bg-yellow-500' :
                    'bg-blue-500';

                const icon =
                    msg.type === 'success' ? '✓' :
                    msg.type === 'error' ? '✕' :
                    msg.type === 'warning' ? '⚠' :
                    'ℹ';

                return (
                    <div
                        key={msg.id}
                        className={`${bgColor} text-white px-4 py-3 rounded-lg shadow-lg flex items-center space-x-2 min-w-[300px] animate-fade-in`}
                        onClick={() => onRemove(msg.id)}
                        role="alert"
                    >
                        <span className="text-xl font-bold">{icon}</span>
                        <span className="flex-grow">{msg.message}</span>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onRemove(msg.id);
                            }}
                            className="text-white hover:text-gray-200 font-bold"
                            aria-label="閉じる"
                        >
                            ×
                        </button>
                    </div>
                );
            })}
        </div>
    );
};
