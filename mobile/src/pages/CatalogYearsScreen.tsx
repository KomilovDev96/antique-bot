import { useQuery } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, View } from 'react-native';
import { catalogApi } from '../shared/api/services';
import { Breadcrumbs, Card, ErrorState, LoadingSkeleton, Screen, ScreenHeader, Text } from '../shared/ui/core';
import { useTheme } from '../shared/ui/theme';

export function CatalogYearsScreen() {
  const { colors } = useTheme();
  const { slug, section } = useLocalSearchParams<{ slug: string; section: 'ussr' | 'russia' }>();
  const query = useQuery({ queryKey: ['coin-years', slug], queryFn: ({ signal }) => catalogApi.rulers(slug, signal), enabled: !!slug });
  const years = (query.data || []).filter(item => {
    const year = Number(item.years || item.name.match(/\d{4}/)?.[0]);
    return section === 'ussr' ? year >= 1921 && year <= 1991 : year >= 1992;
  });
  const title = section === 'ussr' ? 'Монеты СССР' : 'Монеты России';
  return <Screen><ScreenHeader title={title} eyebrow="ВЫБЕРИТЕ ГОД" back /><Breadcrumbs items={[{ label: 'Каталоги', onPress: () => router.push('/catalog') }, { label: title }]} />
    <Text color={colors.muted}>Сначала год, затем номинал и металл монеты.</Text>
    {query.isPending ? <LoadingSkeleton /> : query.isError ? <ErrorState error={query.error} retry={() => void query.refetch()} /> : <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 18 }}>{years.map(year => <Pressable key={year.slug} onPress={() => router.push(`/catalog/${slug}/ruler/${year.slug}`)} style={{ width: '30%' }}><Card style={{ alignItems: 'center', padding: 16 }}><Text variant="heading" style={{ fontSize: 19 }}>{year.years || year.name}</Text><Text variant="caption" color={colors.muted}>год</Text></Card></Pressable>)}</View>}
  </Screen>;
}
