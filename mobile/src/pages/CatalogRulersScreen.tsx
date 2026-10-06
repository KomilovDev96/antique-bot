import { useQuery } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import { Image, Pressable, View } from 'react-native';
import { catalogApi } from '../shared/api/services';
import { Breadcrumbs, Card, ErrorState, Icon, LoadingSkeleton, Screen, ScreenHeader, Text } from '../shared/ui/core';
import { useTheme } from '../shared/ui/theme';

export function CatalogRulersScreen() {
  const { colors } = useTheme(); const { slug } = useLocalSearchParams<{ slug: string }>();
  const catalog = useQuery({ queryKey: ['coin-catalog', slug], queryFn: ({ signal }) => catalogApi.coinCatalog(slug, signal), enabled: !!slug });
  const rulers = useQuery({ queryKey: ['coin-rulers', slug], queryFn: ({ signal }) => catalogApi.rulers(slug, signal), enabled: !!slug });
  if (slug === 'russia-ussr') {
    return <Screen><ScreenHeader title="Монеты России и СССР" eyebrow="ВЫБЕРИТЕ РАЗДЕЛ" back /><Breadcrumbs items={[{ label: 'Каталоги', onPress: () => router.push('/catalog') }, { label: 'Монеты России и СССР' }]} />
      <Text color={colors.muted}>Сначала выберите страну и эпоху, затем откройте каталог по годам.</Text>
      <View style={{ gap: 14, marginTop: 18 }}>
        {[['ussr', 'Монеты СССР', '1921–1991', 'История советских выпусков по годам'], ['russia', 'Монеты России', '1992–2026', 'Современные российские выпуски по годам']].map(([section, title, years, description]) => <Pressable key={section} onPress={() => router.push(`/catalog/${slug}/section/${section}`)}><Card style={{ padding: 20 }}><Text variant="heading" style={{ fontSize: 22 }}>{title}</Text><Text color={colors.accent}>{years}</Text><Text color={colors.muted}>{description}</Text></Card></Pressable>)}
      </View>
    </Screen>;
  }
  const dynastyCatalog = slug === 'muslim-world';
  return <Screen><ScreenHeader title={catalog.data?.title || 'Каталог'} eyebrow={dynastyCatalog ? 'ВЫБЕРИТЕ ДИНАСТИЮ' : 'ВЫБЕРИТЕ ПРАВИТЕЛЯ'} back /><Breadcrumbs items={[{ label: 'Каталоги', onPress: () => router.push('/catalog') }, { label: catalog.data?.title || 'Каталог' }]} />
    <Text color={colors.muted}>{dynastyCatalog ? 'Выберите династию, чтобы открыть её периоды, золото и серебро.' : 'Выберите период, чтобы открыть номиналы и годы выпуска монет.'}</Text>
    {rulers.isPending ? <LoadingSkeleton /> : rulers.isError ? <ErrorState error={rulers.error} retry={() => void rulers.refetch()} /> : <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>{rulers.data.map(ruler => <Pressable key={ruler.slug} onPress={() => router.push(`/catalog/${slug}/ruler/${ruler.slug}`)} style={{ width: '48%' }}><Card style={{ minHeight: 176, alignItems: 'center', justifyContent: 'center', padding: 14 }}><View style={{ width: 76, height: 76, borderRadius: 38, overflow: 'hidden', backgroundColor: colors.hero, alignItems: 'center', justifyContent: 'center', marginBottom: 3 }}>{ruler.portraitUrl ? <Image source={{ uri: ruler.portraitUrl }} style={{ width: '100%', height: '100%' }} resizeMode="cover" /> : <Icon name="user" color="#DDBB75" size={34} />}</View><Text variant="heading" style={{ fontSize: 17, textAlign: 'center' }}>{ruler.name}</Text><Text variant="caption" color={colors.muted}>{ruler.years || 'Период правления'}</Text>{dynastyCatalog && !ruler.portraitUrl ? <Text variant="caption" color={colors.muted} style={{ textAlign: 'center' }}>Изображение пока не найдено</Text> : null}</Card></Pressable>)}</View>}
  </Screen>;
}
