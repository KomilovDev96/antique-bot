import { QueryClient } from '@tanstack/react-query';
import { ApiError } from './transport';
export const queryClient = new QueryClient({ defaultOptions: {
  queries: { staleTime: 60000, gcTime: 30 * 60000, retry: (count, error) => count < 2 && (!(error instanceof ApiError) || error.code === 'NETWORK' || error.status >= 500 && error.status !== 501), refetchOnWindowFocus: true },
  mutations: { retry: false },
} });
