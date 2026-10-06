import { ApiClient, ApiError } from './transport';
import { useSession } from './session';
import { sessionSchema } from '../../entities/types';
import { queryClient } from './query';
export const api: ApiClient = new ApiClient(process.env.EXPO_PUBLIC_API_URL ?? '', {
  token: () => useSession.getState().session?.accessToken ?? null,
  expired: async () => { await queryClient.cancelQueries(); queryClient.clear(); await useSession.getState().setSession(null); },
  refresh: async (): Promise<string> => {
    const { session, generation } = useSession.getState();
    if (!session) throw new ApiError(401, 'UNAUTHENTICATED', 'Войдите снова');
    const next = await api.request('/auth/refresh', sessionSchema, { method: 'POST', authenticated: false, body: { refreshToken: session.refreshToken } });
    if (useSession.getState().generation !== generation) throw new ApiError(401, 'SESSION_CHANGED', 'Сессия изменена');
    await useSession.getState().setSession(next); return next.accessToken;
  },
});
