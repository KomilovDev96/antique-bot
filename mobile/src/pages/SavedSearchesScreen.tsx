import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { savedSearchApi } from '../shared/api/services';
import { AuthGate } from '../widgets/AuthGate';
import { Button, Card, EmptyState, ErrorState, LoadingSkeleton, Screen, ScreenHeader, Text } from '../shared/ui/core';
export function SavedSearchesScreen() { return <AuthGate><SavedSearches /></AuthGate>; }
function SavedSearches() {
  const client = useQueryClient(); const query = useQuery({ queryKey: ['saved-searches'], queryFn: ({ signal }) => savedSearchApi.list(signal) });
  const remove = useMutation({ mutationFn: savedSearchApi.remove, onSuccess: () => { void client.invalidateQueries({ queryKey: ['saved-searches'] }); } });
  return <Screen><ScreenHeader title="Сохранённые поиски" back />{query.isPending ? <LoadingSkeleton /> : query.isError ? <ErrorState error={query.error} retry={() => void query.refetch()} /> : query.data.length ? query.data.map(search => <Card key={search.id}><Text variant="heading">{search.name}</Text><Text variant="caption">{search.alertsEnabled ? 'Уведомления включены' : 'Уведомления отключены'}</Text><Text variant="caption" color="#617783">{Object.entries(search.filters).filter(([, value]) => value).map(([key, value]) => `${key}: ${String(value)}`).join(' · ')}</Text><Button title="Удалить поиск" variant="danger" loading={remove.isPending} onPress={() => remove.mutate(search.id)} /></Card>) : <EmptyState icon="bookmark" title="Сохранённых поисков пока нет" description="Сохраните фильтр marketplace, чтобы быстро вернуться к нему и получать уведомления." />}</Screen>;
}
