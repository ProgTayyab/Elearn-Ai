import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from './useApi';

export interface ChatMessage {
    id: number;
    role: 'user' | 'ai';
    content: string;
    createdAt: string;
}

export function useChatHistory(courseId: number | undefined) {
    return useQuery<ChatMessage[]>({
        queryKey: ['chat', courseId],
        queryFn: async () => {
            const { data } = await api.get(`/courses/${courseId}/chat`);
            return data.messages;
        },
        enabled: !!courseId,
    });
}

export function useSendMessage(courseId: number | undefined) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (content: string) => {
            const { data } = await api.post(`/courses/${courseId}/chat`, { content });
            return data as { userMessage: ChatMessage; aiMessage: ChatMessage };
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['chat', courseId] });
        },
    });
}
