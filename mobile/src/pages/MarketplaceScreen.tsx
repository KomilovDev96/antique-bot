import { useState } from 'react';
import { FlatList, ScrollView, View } from 'react-native';
import { useInfiniteQuery, useMutation, useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { marketplaceApi, savedSearchApi } from '../shared/api/services';
import { useSession } from '../shared/api/session';
import { useDebounced } from '../shared/lib/hooks';
import { date, money } from '../shared/lib/format';
import type { ItemFilters } from '../entities/types';
import { FilterSheet } from '../features/catalog/FilterSheet';
import { Badge, Button, Card, EmptyState, ErrorState, IconButton, LinkButton, LoadingSkeleton, Row, Screen, ScreenHeader, SearchInput, SegmentedControl, Text } from '../shared/ui/core';
import { ObjectCard } from '../shared/ui/objects';
import { useTheme } from '../shared/ui/theme';
import { translateStatic, useI18n } from '../shared/lib/i18n';

const sortLabels: Record<string, string> = { recent: 'Новые', oldest: 'Старые', price_asc: 'Дешевле', price_desc: 'Дороже' };
const sortOptions = ['recent', 'price_asc', 'price_desc', 'oldest'];

export function MarketplaceScreen() {
  const { colors } = useTheme();
  const { language, t } = useI18n();
  const session = useSession(s => s.session);
  const [tab, setTab] = useState('buy');
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<ItemFilters>({ sort: 'recent' });
  const [open, setOpen] = useState(false);
  const debounced = useDebounced(search);
  const query = useInfiniteQuery({ queryKey: ['marketplace', filters, debounced], queryFn: ({ pageParam, signal }) => marketplaceApi.list({ ...filters, search: debounced }, pageParam, signal), initialPageParam: undefined as string | undefined, getNextPageParam: page => page.nextCursor ?? undefined, enabled: tab === 'buy' });
  const saveSearch = useMutation({ mutationFn: () => savedSearchApi.create(debounced || 'Мой поиск', { ...filters, search: debounced || undefined }), onSuccess: () => undefined });
  const quotes = useQuery({ queryKey: ['metal-quotes'], queryFn: ({ signal }) => marketplaceApi.quotes(signal), staleTime: 60000 });
  const items = query.data?.pages.flatMap(p => p.items) ?? [];
  const total = query.data?.pages[0]?.total;
  const activeFilterCount = Object.entries(filters).filter(([key, value]) => key !== 'sort' && value !== undefined && value !== '').length;
  const nextSort = sortOptions[(sortOptions.indexOf(filters.sort || 'recent') + 1) % sortOptions.length];
  const setMetal = (metal: string) => setFilters(previous => ({ ...previous, metal: previous.metal === metal ? undefined : metal }));

  const header = <View style={{ gap: 16, marginBottom: 18 }}>
    <ScreenHeader title={t('marketplace')} eyebrow="ПОКУПКА И ПРОДАЖА" action={<Row><IconButton name="bookmark" label="Сохранённые поиски" onPress={() => router.push('/saved-searches')} /><IconButton name="clipboard" label={t('requests')} onPress={() => router.push('/requests')} /></Row>} />
    <Text color={colors.muted}>Находите предметы с историей, сравнивайте характеристики и обращайтесь к проверенным продавцам.</Text>
    <SegmentedControl value={tab} onChange={setTab} options={[{ id: 'buy', label: t('buy') }, { id: 'sell', label: t('sell') }, { id: 'requests', label: t('requests') }]} />
    {quotes.data?.length ? <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }} accessibilityLabel="Котировки металлов">{quotes.data.map(q => <Card key={q.metal} style={{ minWidth: 150, padding: 14, gap: 5 }}><Badge label={q.metal === 'gold' ? t('gold') : t('silver')} /><Text variant="heading" style={{ fontSize: 17 }}>{money(q.perGram)} / г</Text><Text variant="caption" color={colors.muted}>{q.changePercent > 0 ? '+' : ''}{q.changePercent}% · {date(q.asOf)}</Text></Card>)}</ScrollView> : null}
    {tab === 'buy' ? <><SearchInput value={search} onChangeText={setSearch} placeholder="Например: золото 999, часы…" /><Row style={{ alignItems: 'stretch' }}><Button title={t('gold')} variant={filters.metal === 'gold' ? 'primary' : 'secondary'} style={{ flex: 1, minWidth: 120 }} onPress={() => setMetal('gold')} /><Button title={t('silver')} variant={filters.metal === 'silver' ? 'primary' : 'secondary'} style={{ flex: 1, minWidth: 120 }} onPress={() => setMetal('silver')} /></Row><Row style={{ alignItems: 'stretch' }}><Button title={activeFilterCount ? `${t('filters')} · ${activeFilterCount}` : t('allFilters')} icon="sliders" variant="outline" style={{ flex: 1, minWidth: 140 }} onPress={() => setOpen(true)} /><Button title={`${t('sort')}: ${translateStatic(language, sortLabels[filters.sort || 'recent'])}`} icon="chevrons-down" variant="outline" style={{ flex: 1, minWidth: 140 }} onPress={() => setFilters(previous => ({ ...previous, sort: nextSort }))} /></Row><Row style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}><Text variant="caption" color={colors.muted} style={{ flex: 1 }}>{total !== undefined ? `${total} ${translateStatic(language, 'объявлений')}` : `${items.length} ${translateStatic(language, 'объявлений загружено')}`}</Text><Row style={{ justifyContent: 'flex-end', flex: 1 }}>{activeFilterCount ? <Button title={t('reset')} variant="ghost" style={{ minHeight: 34, paddingVertical: 5, paddingHorizontal: 4 }} onPress={() => setFilters({ sort: 'recent' })} /> : null}<Button title="Сохранить поиск" variant="ghost" loading={saveSearch.isPending} disabled={!session || (!debounced && !activeFilterCount)} onPress={() => saveSearch.mutate()} /></Row></Row></> : null}
    {tab === 'sell' ? <Card><Badge label="ПРОДАЖА" /><Text variant="heading">Найдите того, кто оценит.</Text><Text color={colors.muted}>Добавьте фотографии и характеристики — мы поможем подготовить понятное объявление.</Text><LinkButton href="/marketplace/create-sale" title="Создать объявление" variant="primary" icon="plus" /><Row style={{ alignItems: 'stretch' }}><LinkButton href={{ pathname: '/marketplace/create-sale', params: { metal: 'gold' } }} title="Золото" variant="outline" /><LinkButton href={{ pathname: '/marketplace/create-sale', params: { metal: 'silver' } }} title="Серебро" variant="outline" /></Row></Card> : null}
    {tab === 'requests' ? <Card><Badge label="ЗАПРОСЫ" /><Text variant="heading">Найти. Проверить. Приобрести.</Text><Text color={colors.muted}>Не нашли нужный предмет? Оставьте запрос или закажите профессиональный осмотр.</Text><LinkButton href="/marketplace/create-buy-request" title="Создать запрос на покупку" icon="search" /><LinkButton href="/requests/create-inspection" title="Заказать проверку" variant="outline" icon="shield" /><LinkButton href="/requests" title="Открыть мои заявки" variant="ghost" icon="clipboard" /></Card> : null}
  </View>;

  return <Screen scroll={false}><FlatList data={tab === 'buy' ? items : []} numColumns={2} keyExtractor={item => item.id} renderItem={({ item }) => <ObjectCard item={item} market />} columnWrapperStyle={{ gap: 12 }} contentContainerStyle={{ gap: 12, paddingBottom: 30 }} ListHeaderComponent={header} onEndReached={() => { if (query.hasNextPage && !query.isFetching) void query.fetchNextPage(); }} onEndReachedThreshold={0.5} ListEmptyComponent={tab !== 'buy' ? null : query.isPending ? <LoadingSkeleton /> : query.isError ? <ErrorState error={query.error} retry={() => void query.refetch()} /> : <EmptyState icon="search" title="Ничего не нашли" description="Попробуйте изменить запрос или сбросить часть фильтров." action="Сбросить фильтры" onPress={() => { setSearch(''); setFilters({ sort: 'recent' }); }} />} ListFooterComponent={query.isFetchingNextPage ? <LoadingSkeleton /> : query.isFetchNextPageError ? <ErrorState error={query.error} retry={() => void query.fetchNextPage()} /> : null} />{open ? <FilterSheet open onClose={() => setOpen(false)} value={filters} onApply={setFilters} marketplace /> : null}</Screen>;
}
