import { useQuery } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import { Image, Pressable, View } from 'react-native';
import { catalogApi } from '../shared/api/services';
import { Breadcrumbs, Card, EmptyState, Icon, LoadingSkeleton, Screen, ScreenHeader, Text } from '../shared/ui/core';
import { useTheme } from '../shared/ui/theme';

export function CatalogDenominationsScreen() {
  const { colors } = useTheme(); const { slug, ruler } = useLocalSearchParams<{ slug: string; ruler: string }>();
  const yearFirst = slug === 'russia-ussr';
  const isSilver = (metal?: string) => String(metal || '').toLowerCase().includes('серебро') || String(metal || '').toLowerCase() === 'silver';
  const metalLabel = (metal?: string) => ({ gold: 'Золото', silver: 'Серебро', copper: 'Медь и медные сплавы', other: 'Другие металлы' }[String(metal || '').toLowerCase()] || metal || 'Металл не указан');
  const rulers = useQuery({ queryKey: ['coin-rulers', slug], queryFn: ({ signal }) => catalogApi.rulers(slug, signal), enabled: !!slug });
  const denominations = useQuery({ queryKey: ['coin-denominations', slug, ruler], queryFn: ({ signal }) => catalogApi.denominations(slug, ruler, signal), enabled: !!slug });
  const selected = rulers.data?.find(item => item.slug === ruler);
  return <Screen><ScreenHeader title={selected?.name || (yearFirst ? 'Год' : 'Правитель')} eyebrow={yearFirst ? 'ВЫБЕРИТЕ МЕТАЛЛ' : 'ВЫБЕРИТЕ НОМИНАЛ'} back /><Breadcrumbs items={[{ label: 'Каталоги', onPress: () => router.push('/catalog') }, { label: selected?.name || (yearFirst ? 'Год' : 'Правитель') }]} /><Text color={colors.muted}>{yearFirst ? 'Сначала выбран год, теперь выберите металл.' : 'Выберите номинал монеты, чтобы открыть годы и изображения.'}</Text>
    {denominations.isPending ? <LoadingSkeleton /> : denominations.isError ? <EmptyState title="Не удалось загрузить монеты" description="Попробуйте обновить каталог позже." action="Повторить" onPress={() => void denominations.refetch()} /> : denominations.data?.length ? <View style={{ gap: 12 }}>{denominations.data.map(item => <Pressable key={item.slug} onPress={() => router.push(`/catalog/${slug}/ruler/${ruler}/${item.slug}`)}><Card style={{ flexDirection: 'row', alignItems: 'center', padding: 16 }}><View style={{ width: 116, flexDirection: 'row', gap: 5, alignItems: 'center', justifyContent: 'center' }}>{item.imageUrls?.length ? item.imageUrls.map((url, index) => <Image key={`${url}-${index}`} source={{ uri: url }} style={{ width: 52, height: 52, borderRadius: 26 }} resizeMode="contain" />) : <View style={{ width: 58, height: 58, borderRadius: 29, backgroundColor: isSilver(item.metal) ? '#C9D4D9' : '#B8793E', alignItems: 'center', justifyContent: 'center', borderWidth: 4, borderColor: isSilver(item.metal) ? '#EEF4F5' : '#E5B36B' }}><Icon name="circle" color={isSilver(item.metal) ? '#6D838A' : '#71421F'} size={26} /></View>}</View><View style={{ flex: 1, marginLeft: 13 }}><Text variant="heading" style={{ fontSize: 20 }}>{item.label}</Text><Text variant="caption" color={colors.muted}>{metalLabel(item.metal)}</Text><Text variant="caption" color={colors.accent}>Лицевая и оборотная стороны</Text></View><Icon name="chevron-right" color={colors.accent} /></Card></Pressable>)}</View> : <EmptyState title="Монеты этой династии ещё собираются" description="Мы добавим подтверждённые выпуски, изображения и ориентиры цены. Если у вас есть монета, отправьте её специалисту на оценку с фотографиями." action="Заказать оценку" onPress={() => router.push('/requests/create-inspection')} />}
  </Screen>;
}
