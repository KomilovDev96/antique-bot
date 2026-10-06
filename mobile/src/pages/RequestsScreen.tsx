import { useState } from 'react';
import { FlatList, Pressable } from 'react-native';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import { requestsApi } from '../shared/api/services';
import { useSession } from '../shared/api/session';
import { date, statusLabels } from '../shared/lib/format';
import { AuthGate } from '../widgets/AuthGate';
import { Badge, Card, EmptyState, ErrorState, LoadingSkeleton, Screen, ScreenHeader, SegmentedControl, Text } from '../shared/ui/core';
import { ImageGallery } from '../shared/ui/objects';
import { useTheme } from '../shared/ui/theme';
export function RequestsScreen() { return <AuthGate title="Мои заявки"><RequestsContent /></AuthGate>; }
function RequestsContent() {
  const user = useSession(s => s.session?.user.id); const [kind, setKind] = useState('all');
  const query = useInfiniteQuery({ queryKey: ['requests', user, kind], queryFn: ({ pageParam, signal }) => requestsApi.list(kind === 'all' ? undefined : kind, pageParam, signal), initialPageParam: undefined as string | undefined, getNextPageParam: page => page.nextCursor ?? undefined });
  return <Screen scroll={false}><ScreenHeader title="Мои заявки" back /><SegmentedControl value={kind} onChange={setKind} options={[{ id: 'all', label: 'Все' }, { id: 'purchase', label: 'Покупки' }, { id: 'sale', label: 'Продажи' }, { id: 'inspection', label: 'Проверки' }, { id: 'buy', label: 'Ищу предмет' }]} /><FlatList data={query.data?.pages.flatMap(p => p.items) ?? []} keyExtractor={r => r.id} contentContainerStyle={{ gap: 12, paddingBottom: 30 }} renderItem={({ item }) => <Pressable accessibilityRole="button" onPress={() => router.push({ pathname: '/requests/[id]', params: { id: item.id } })}><Card><Badge label={statusLabels[item.status]} /><Text variant="heading">{item.title}</Text><Text variant="caption">{date(item.createdAt)}</Text></Card></Pressable>} onRefresh={() => void query.refetch()} refreshing={query.isRefetching} onEndReached={() => { if (query.hasNextPage && !query.isFetching) void query.fetchNextPage(); }} ListEmptyComponent={query.isPending ? <LoadingSkeleton /> : query.isError ? <ErrorState error={query.error} retry={() => void query.refetch()} /> : <EmptyState title="Здесь будет история заявок" description="Покупки, продажи и осмотры — в одном месте." action="Открыть Marketplace" onPress={() => router.push('/marketplace')} />} ListFooterComponent={query.isFetchingNextPage ? <LoadingSkeleton /> : query.isFetchNextPageError ? <ErrorState error={query.error} retry={() => void query.fetchNextPage()} /> : null} /></Screen>;
}
export function RequestDetailScreen() { return <AuthGate><RequestDetail /></AuthGate>; }
function RequestDetail() {
  const { id } = useLocalSearchParams<{ id: string }>(); const { colors } = useTheme();
  const query = useQuery({ queryKey: ['request', id], queryFn: ({ signal }) => requestsApi.get(id, signal) });
  if (query.isPending) return <Screen><LoadingSkeleton /></Screen>;
  if (query.isError) return <Screen><ErrorState error={query.error} retry={() => void query.refetch()} /></Screen>;
  const request = query.data;
  const attributeLabels: Record<string, string> = { purpose: 'Цель оценки', metal: 'Металл', weight: 'Вес', diameter: 'Диаметр', mint: 'Монетный двор', year: 'Год / период', country: 'Страна', condition: 'Состояние' };
  const attributes = Object.entries(request.attributes || {}).filter(([, value]) => value);
  return <Screen><ScreenHeader title={request.title} eyebrow="ЗАЯВКА" back /><Badge label={statusLabels[request.status]} /><Text>{request.description}</Text>{attributes.length ? <Card><Text variant="heading">Данные для специалиста</Text>{attributes.map(([key, value]) => <Text key={key}><Text color={colors.muted}>{attributeLabels[key] || key}: </Text>{String(value)}</Text>)}</Card> : null}<Text variant="caption" color={colors.muted}>Создана {date(request.createdAt)} · {request.id}</Text><Text variant="heading">История статусов</Text>{request.history.length ? request.history.map((h, i) => <Card key={`${h.at}-${i}`}><Text>{statusLabels[h.status] ?? h.status}</Text><Text variant="caption" color={colors.muted}>{date(h.at)}</Text>{h.note ? <Text>{h.note}</Text> : null}</Card>) : <Text color={colors.muted}>Обновления статуса появятся здесь.</Text>}{request.inspectionResult ? <Card><Badge label="ЗАКЛЮЧЕНИЕ СПЕЦИАЛИСТА" /><Text>{request.inspectionResult.conclusion}</Text><Text>{request.inspectionResult.examiner} · {date(request.inspectionResult.issuedAt)}</Text><ImageGallery photos={request.inspectionResult.documents} /></Card> : null}</Screen>;
}
