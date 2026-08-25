import { useQuery } from '@tanstack/react-query';
import api from '../api/client';
import { Analytics } from '../types';

export function useAnalytics() {
  return useQuery<Analytics>({
    queryKey: ['analytics'],
    queryFn: async () => {
      const { data } = await api.get('/analytics');
      return data as Analytics;
    },
  });
}
