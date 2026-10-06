import { useState } from 'react';
import { FlatList, View } from 'react-native';
import { useInfiniteQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { collectionApi } from '../shared/api/services';
import { useSession } from '../shared/api/session';
import { useDebounced } from '../shared/lib/hooks';
import type { ItemFilters } from '../entities/types';
import { AuthGate } from '../widgets/AuthGate';
import { FilterSheet } from '../features/catalog/FilterSheet';
import { Button, EmptyState, ErrorState, IconButton, LoadingSkeleton, Row, Screen, ScreenHeader, SearchInput, Text } from '../shared/ui/core';
import { ObjectCard } from '../shared/ui/objects';
export function CollectionScreen() { return <AuthGate title="Моя коллекция"><CollectionContent /></AuthGate>; }
function CollectionContent() {
  const userId = useSession(s => s.session?.user.id); const [search, setSearch] = useState(''); const [filters, setFilters] = useState<ItemFilters>({}); const [open, setOpen] = useState(false); const [grid, setGrid] = useState(true); const debounced = useDebounced(search);
  const query = useInfiniteQuery({ queryKey: ['collection', userId, filters, debounced], queryFn: ({ pageParam, signal }) => collectionApi.list({ ...filters, search: debounced }, pageParam, signal), initialPageParam: undefined as string | undefined, getNextPageParam: page => page.nextCursor ?? undefined });
  const items = query.data?.pages.flatMap(p => p.items) ?? [];
  return <Screen scroll={false}><ScreenHeader title="Моя коллекция" eyebrow="СОБРАНО ВАМИ" action={<IconButton name="plus" label="Добавить предмет" onPress={() => router.push('/collection/create')} />} /><SearchInput value={search} onChangeText={setSearch} /><Row><Button title="Фильтры" variant="secondary" icon="sliders" onPress={() => setOpen(true)} /><View style={{ flex: 1 }} /><IconButton name={grid ? 'list' : 'grid'} label={grid ? 'Показать списком' : 'Показать сеткой'} onPress={() => setGrid(!grid)} /></Row>
    <FlatList key={grid ? 'grid' : 'list'} data={items} numColumns={grid ? 2 : 1} keyExtractor={item => item.id} renderItem={({ item }) => <ObjectCard item={item} compact={!grid} />} columnWrapperStyle={grid ? { gap: 12 } : undefined} contentContainerStyle={{ gap: 12, paddingBottom: 30 }} onEndReached={() => { if (query.hasNextPage && !query.isFetching) void query.fetchNextPage(); }} onEndReachedThreshold={0.4} refreshing={query.isRefetching} onRefresh={() => void query.refetch()} ListEmptyComponent={query.isPending ? <LoadingSkeleton /> : query.isError ? <ErrorState error={query.error} retry={() => void query.refetch()} /> : <EmptyState title={search || Object.keys(filters).length ? 'Ничего не найдено' : 'Ваша первая история'} description="Добавьте предмет или измените условия поиска." action="Добавить предмет" onPress={() => router.push('/collection/create')} />} ListFooterComponent={query.isFetchingNextPage ? <LoadingSkeleton /> : query.isFetchNextPageError ? <ErrorState error={query.error} retry={() => void query.fetchNextPage()} /> : items.length ? <Text variant="caption">{items.length} предметов загружено</Text> : null} />
    {open ? <FilterSheet open onClose={() => setOpen(false)} value={filters} onApply={setFilters} /> : null}</Screen>;
}
