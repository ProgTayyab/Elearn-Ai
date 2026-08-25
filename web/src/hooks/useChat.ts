import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api, { aiApi } from '../api/client';
import { ChatMessage } from '../types';

function getErrorMessage(err: unknown): string {
  const axiosErr = err as { response?: { data?: { message?: string; code?: string } } };
  const code = axiosErr.response?.data?.code;
  const msg = axiosErr.response?.data?.message;

  if (code === 'RATE_LIMIT') return 'AI is busy (rate limit). Please wait a moment and try again.';
  if (code === 'INVALID_KEY') return 'AI service is misconfigured. Contact support.';
  if (code === 'NETWORK' || code === 'API_DOWN') return 'AI service is temporarily unavailable. Try again shortly.';
  if (code === 'EMPTY') return 'AI returned an empty response. Please rephrase your question.';

  return msg || 'Failed to send message. Please try again.';
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
      const { data } = await aiApi.post(`/courses/${courseId}/chat`, { content });
      return data as { userMessage: ChatMessage; aiMessage: ChatMessage };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['chat', courseId] });
    },
    meta: { getErrorMessage },
  });
}

export { getErrorMessage as getChatErrorMessage };
