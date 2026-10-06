import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Linking, Pressable, ScrollView, useWindowDimensions, View } from 'react-native';
import type { CollectionItem, MarketplaceListing, Media, Source, AssistantMessage } from '../../entities/types';
import { money, safeExternalUrl, statusLabels } from '../lib/format';
import { Badge, Button, Card, Icon, Row, Text } from './core';
import { useTheme } from './theme';
export function ImageGallery({ photos }: { photos: Media[] }) { const { colors } = useTheme(); const { width } = useWindowDimensions(); const imageSize = Math.max(180, Math.min(width - 48, 320)); return photos.length ? <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>{photos.filter(p => p.kind === 'image').map(photo => <Image key={photo.id} source={photo.url} style={{ width: imageSize, height: imageSize, borderRadius: 20, backgroundColor: colors.soft }} contentFit="contain" accessibilityLabel="Фотография предмета" cachePolicy="memory-disk" />)}</ScrollView> : <View style={{ height: Math.min(230, Math.max(170, width - 80)), borderRadius: 20, backgroundColor: colors.soft, alignItems: 'center', justifyContent: 'center', gap: 14 }}><Icon name="image" size={36} color={colors.muted} /><Text color={colors.muted}>Фотографии не добавлены</Text></View>; }
export function ObjectCard({ item, market = false, compact = false }: { item: CollectionItem | MarketplaceListing; market?: boolean; compact?: boolean }) {
  const { colors } = useTheme();
  const listing = market && 'price' in item ? item : null;
  return <Pressable accessibilityRole="button" accessibilityLabel={`Открыть ${item.title}`} onPress={() => router.push({ pathname: market ? '/marketplace/[id]' : '/collection/[id]', params: { id: item.id } })} style={{ flex: 1, minWidth: 0 }}>
    <Card style={{ padding: compact ? 10 : 12, gap: 10, ...(compact ? { flexDirection: 'row', alignItems: 'center' } : {}) }}>
      {item.photos[0] ? <Image source={item.photos[0].url} contentFit="cover" cachePolicy="memory-disk" style={{ height: compact ? 76 : 165, width: compact ? 76 : '100%', borderRadius: 12, backgroundColor: colors.soft }} accessibilityLabel={item.title} /> : <View style={{ height: compact ? 76 : 165, width: compact ? 76 : '100%', backgroundColor: colors.soft, borderRadius: 12, alignItems: 'center', justifyContent: 'center' }}><Icon name="image" color={colors.muted} size={28} /></View>}
      <View style={{ flex: 1, gap: 5, padding: 3 }}>
        <Row style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}><Text variant="caption" color={colors.accent} style={{ flex: 1 }}>{item.categoryName}</Text>{listing?.seller.verified ? <Badge label="ПРОВЕРЕН" /> : null}</Row>
        <Text style={{ fontFamily: 'Manrope_600SemiBold' }} numberOfLines={2}>{item.title}</Text>
        <Text variant="caption" color={colors.muted} numberOfLines={2}>{[item.year, item.country, item.material].filter(Boolean).join(' · ') || 'Характеристики не указаны'}</Text>
        {listing ? <><Text variant="heading" style={{ fontSize: 18, lineHeight: 23 }}>{money(listing.price)}</Text><Text variant="caption" color={colors.muted} numberOfLines={1}>{listing.location} · {statusLabels[listing.status] ?? listing.status}</Text></> : <Text variant="caption" color={colors.muted}>{item.collectionCode}</Text>}
      </View>
    </Card>
  </Pressable>;
}
export function MarketplaceCard({ item }: { item: MarketplaceListing }) { return <ObjectCard item={item} market />; }
export function SourceCard({ source }: { source: Source }) { const { colors } = useTheme(); const url = safeExternalUrl(source.url); return <Card><Row><Icon name="external-link" size={18} color={colors.accent} /><Text variant="caption" color={colors.accent}>{source.domain}</Text></Row><Text>{source.title}</Text>{source.description ? <Text variant="caption" color={colors.muted}>{source.description}</Text> : null}{source.publishedAt ? <Text variant="caption">{source.publishedAt}</Text> : null}<Button title="Открыть источник" variant="ghost" disabled={!url} onPress={() => { if (url) void Linking.openURL(url); }} /></Card>; }
export function AIMessage({ message }: { message: AssistantMessage }) { return <Card><Badge label="Antique AI" /><Text>{message.text}</Text>{message.itemIds.map(id => <Button key={id} title="Открыть предмет коллекции" variant="secondary" icon="arrow-up-right" onPress={() => router.push({ pathname: '/collection/[id]', params: { id } })} />)}{message.sources.map(source => <SourceCard key={source.url} source={source} />)}</Card>; }
export function UserMessage({ message }: { message: AssistantMessage }) { const { colors } = useTheme(); return <Card style={{ backgroundColor: colors.tint, marginLeft: 32 }}><Text>{message.text}</Text></Card>; }
