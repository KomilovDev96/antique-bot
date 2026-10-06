import { FlatList, Pressable } from 'react-native';
import { useInfiniteQuery, useMutation } from '@tanstack/react-query';
import { router } from 'expo-router';
import { notificationsApi } from '../shared/api/services';
import { queryClient } from '../shared/api/query';
import { useSession } from '../shared/api/session';
import type { Notification } from '../entities/types';
import { AuthGate } from '../widgets/AuthGate';
import { Badge, Card, EmptyState, ErrorState, InlineError, LoadingSkeleton, Screen, ScreenHeader, Text } from '../shared/ui/core';
export function openNotification(target: Notification['target']) {
  if (!target) return;
  const routes = { item: '/collection/[id]', request: '/requests/[id]', identification: '/scan/result/[id]', listing: '/marketplace/[id]', support: '/support/[id]' } as const;
  router.push({ pathname: routes[target.kind], params: { id: target.id } });
}
export function NotificationsScreen() { return <AuthGate><NotificationsContent /></AuthGate>; }
function NotificationsContent() {
  const userId = useSession(s => s.session?.user.id);
  const query = useInfiniteQuery({ queryKey: ['notifications', userId], queryFn: ({ pageParam, signal }) => notificationsApi.list(pageParam, signal), initialPageParam: undefined as string | undefined, getNextPageParam: page => page.nextCursor ?? undefined });
  const read = useMutation({ mutationFn: notificationsApi.read, onSuccess: () => { void queryClient.invalidateQueries({ queryKey: ['notifications'] }); } });
  return <Screen scroll={false}><ScreenHeader title="Уведомления" back /><InlineError error={read.error} /><FlatList data={query.data?.pages.flatMap(p => p.items) ?? []} keyExtractor={i => i.id} contentContainerStyle={{ gap: 12 }} renderItem={({ item }) => <Pressable accessibilityRole="button" onPress={() => { if (!item.read) read.mutate(item.id); openNotification(item.target); }}><Card>{!item.read ? <Badge label="НОВОЕ" /> : null}<Text variant="heading">{item.title}</Text><Text>{item.body}</Text></Card></Pressable>} onEndReached={() => { if (query.hasNextPage && !query.isFetching) void query.fetchNextPage(); }} ListEmptyComponent={query.isPending ? <LoadingSkeleton /> : query.isError ? <ErrorState error={query.error} retry={() => void query.refetch()} /> : <EmptyState icon="bell" title="Вы ничего не пропустили" description="Здесь появятся результаты анализа, ответы и обновления ваших заявок." />} /></Screen>;
}
