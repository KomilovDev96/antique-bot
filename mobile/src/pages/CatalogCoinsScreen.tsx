import { useQuery } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import { Image, Pressable, View } from 'react-native';
import { catalogApi } from '../shared/api/services';
import { Breadcrumbs, Card, ErrorState, Field, Icon, LoadingSkeleton, Screen, ScreenHeader, Text } from '../shared/ui/core';
import { useTheme } from '../shared/ui/theme';
import { useState } from 'react';

export function CatalogCoinsScreen() {
  const { colors } = useTheme(); const { slug, ruler, denomination } = useLocalSearchParams<{ slug: string; ruler: string; denomination: string }>(); const [search, setSearch] = useState('');
  const isSilver = (metal?: string) => String(metal || '').toLowerCase().includes('серебро') || String(metal || '').toLowerCase() === 'silver';
  const isGold = (metal?: string) => String(metal || '').toLowerCase().includes('золот') || String(metal || '').toLowerCase() === 'gold';
  const metalLabel = (metal?: string) => ({ gold: 'Золото', silver: 'Серебро', copper: 'Медь', bronze: 'Бронза' }[String(metal || '').toLowerCase()] || metal || 'Металл не указан');
  const coinColor = (metal?: string) => isSilver(metal) ? { fill: '#C6D2D6', border: '#EEF4F5', text: '#4D6972' } : isGold(metal) ? { fill: '#D7A928', border: '#F6E19A', text: '#76530A' } : { fill: '#B8763B', border: '#E2B06B', text: '#693C1B' };
  const denominations = useQuery({ queryKey: ['coin-denominations', slug, ruler], queryFn: ({ signal }) => catalogApi.denominations(slug, ruler, signal), enabled: !!slug });
  const coins = useQuery({ queryKey: ['coins', slug, ruler, denomination, search], queryFn: ({ signal }) => catalogApi.coins(slug, { ruler, denomination, search: search || undefined }, signal), enabled: !!slug && !!ruler && !!denomination });
  const label = denominations.data?.find(item => item.slug === denomination)?.label || 'Монеты';
  return <Screen><ScreenHeader title={label} eyebrow="КАТАЛОГ · МОНЕТЫ" back /><Breadcrumbs items={[{ label: 'Каталоги', onPress: () => router.push('/catalog') }, { label: ruler }, { label }]} /><Field label="Поиск" placeholder="Год, монетный двор…" value={search} onChangeText={setSearch} autoCapitalize="none" />
    {coins.isPending ? <LoadingSkeleton /> : coins.isError ? <ErrorState error={coins.error} retry={() => void coins.refetch()} /> : coins.data.map(coin => { const tone = coinColor(coin.metal); return <Pressable key={coin.slug} onPress={() => router.push(`/catalog/${slug}/coin/${coin.slug}`)}><Card style={{ flexDirection: 'row', alignItems: 'center', padding: 14 }}><View style={{ width: 82, height: 82, borderRadius: 41, overflow: 'hidden', backgroundColor: tone.fill, borderWidth: 6, borderColor: tone.border, alignItems: 'center', justifyContent: 'center' }}>{coin.imageUrl ? <Image source={{ uri: coin.imageUrl }} style={{ width: '100%', height: '100%' }} resizeMode="cover" /> : <Text variant="caption" color={tone.text} style={{ textAlign: 'center', fontSize: 10 }}>{coin.year || '—'}{ '\n' }{coin.mint || ''}</Text>}</View><View style={{ flex: 1, gap: 4, marginLeft: 14 }}><Text variant="heading" style={{ fontSize: 19 }}>{coin.title}</Text><Text color={colors.muted}>{coin.mint || 'Монетный двор не указан'} · {metalLabel(coin.metal)}</Text>{coin.price ? <Text color={colors.accent}>от {coin.price.amount} {coin.price.currency}</Text> : null}</View><Icon name="chevron-right" color={colors.accent} /></Card></Pressable>; })}
    {!coins.isPending && !coins.isError && !coins.data?.length ? <Text color={colors.muted}>В этом разделе пока нет монет.</Text> : null}
  </Screen>;
}
