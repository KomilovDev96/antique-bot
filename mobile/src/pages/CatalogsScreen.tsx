import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { Image, Pressable, View } from 'react-native';
import { catalogApi } from '../shared/api/services';
import { Badge, Breadcrumbs, Card, EmptyState, ErrorState, Icon, LoadingSkeleton, Screen, ScreenHeader, Text } from '../shared/ui/core';
import { useTheme } from '../shared/ui/theme';

export function CatalogsScreen() {
  const { colors } = useTheme();
  const query = useQuery({ queryKey: ['coin-catalogs'], queryFn: ({ signal }) => catalogApi.coinCatalogs(signal) });
  return <Screen>
    <ScreenHeader title="Каталоги" eyebrow="ANTIQUE AI" back />
    <Breadcrumbs items={[{ label: 'Каталоги' }]} />
    <Card style={{ backgroundColor: colors.hero, borderColor: '#8BD2DE66', padding: 24 }}>
      <Badge label="КОЛЛЕКЦИОНЕРСКОЕ БЮРО" />
      <Text variant="title" color={colors.inverse} style={{ fontSize: 32, lineHeight: 36 }}>Выберите{ '\n' }свою эпоху</Text>
      <Text color="#D7EEF1">Справочники с историей, характеристиками и местом для вашей личной коллекции.</Text>
    </Card>
    {query.isPending ? <LoadingSkeleton /> : query.isError ? <ErrorState error={query.error} retry={() => void query.refetch()} /> : query.data.map(catalog => <Pressable key={catalog.slug} onPress={() => router.push(`/catalog/${catalog.slug}`)} accessibilityRole="button">
      <Card style={{ flexDirection: 'row', alignItems: 'center', padding: 16 }}>
        <View style={{ width: 86, height: 86, borderRadius: 43, backgroundColor: '#C9A86A', alignItems: 'center', justifyContent: 'center', borderWidth: 5, borderColor: '#EBD6A0', overflow: 'hidden' }}>{catalog.coverUrl ? <Image source={{ uri: catalog.coverUrl }} style={{ width: '100%', height: '100%' }} resizeMode="contain" /> : <Icon name="award" color="#684C28" size={32} />}</View>
        <View style={{ flex: 1, gap: 5 }}><Text variant="heading" style={{ fontSize: 19 }}>{catalog.title}</Text><Text color={colors.muted}>{catalog.subtitle || catalog.period}</Text><Text variant="caption" color={colors.accent}>{catalog.rulerCount} правителей · {catalog.coinCount} монет</Text></View>
        <Icon name="chevron-right" color={colors.accent} />
      </Card>
    </Pressable>)}
    {!query.isPending && !query.isError && !query.data.length ? <EmptyState title="Каталоги готовятся" description="Скоро здесь появятся новые эпохи и страны." /> : null}
  </Screen>;
}
