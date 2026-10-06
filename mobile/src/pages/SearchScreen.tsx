import { useState } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { FlatList } from 'react-native';
import { catalogApi } from '../shared/api/services';
import { useDebounced } from '../shared/lib/hooks';
import { Card, EmptyState, ErrorState, LoadingSkeleton, Screen, ScreenHeader, SearchInput, Text } from '../shared/ui/core';
import { ImageGallery, SourceCard } from '../shared/ui/objects';
export function SearchScreen() {
  const [search, setSearch] = useState(''); const debounced = useDebounced(search);
  const query = useInfiniteQuery({ queryKey: ['catalog', debounced], queryFn: ({ pageParam, signal }) => catalogApi.search(debounced, pageParam, signal), initialPageParam: undefined as string | undefined, getNextPageParam: page => page.nextCursor ?? undefined, enabled: debounced.trim().length >= 2 });
  return <Screen scroll={false}><ScreenHeader title="Поиск в каталоге" back /><SearchInput value={search} onChangeText={setSearch} placeholder="Монеты до 1900 года, фарфор…" /><FlatList data={query.data?.pages.flatMap(p => p.items) ?? []} keyExtractor={i => i.id} contentContainerStyle={{ gap: 12 }} renderItem={({ item }) => <Card><Text variant="heading">{item.title}</Text><ImageGallery photos={item.photos} /><Text>{item.description}</Text>{item.sources.map(s => <SourceCard key={s.url} source={s} />)}</Card>} onEndReached={() => { if (query.hasNextPage && !query.isFetching) void query.fetchNextPage(); }} ListEmptyComponent={debounced.length < 2 ? <EmptyState icon="search" title="Найдите новую историю" description="Введите название, период, страну или материал." /> : query.isPending ? <LoadingSkeleton /> : query.isError ? <ErrorState error={query.error} retry={() => void query.refetch()} /> : <EmptyState title="Ничего не найдено" description="Попробуйте изменить запрос." />} /></Screen>;
}
