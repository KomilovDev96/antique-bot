import { useState } from 'react';
import type { CollectionItem, MarketplaceListing } from '../entities/types';
import { Share, ScrollView, View } from 'react-native';
import { useMutation, useQuery } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import { collectionApi, marketplaceApi } from '../shared/api/services';
import { useSession } from '../shared/api/session';
import { queryClient } from '../shared/api/query';
import { money, statusLabels } from '../shared/lib/format';
import { newRequestKey } from '../shared/lib/hooks';
import { AuthGate } from '../widgets/AuthGate';
import { Badge, BottomSheet, Button, Card, ErrorState, Field, Icon, IconButton, InlineError, LinkButton, LoadingSkeleton, Row, Screen, ScreenHeader, SectionHeader, Text } from '../shared/ui/core';
import { ImageGallery, SourceCard } from '../shared/ui/objects';
import { useTheme } from '../shared/ui/theme';

export function ItemDetailScreen({ market = false }: { market?: boolean }) { return market ? <ItemDetail market /> : <AuthGate><ItemDetail market={false} /></AuthGate>; }

function ItemDetail({ market }: { market: boolean }) {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const session = useSession(s => s.session);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [contact, setContact] = useState(false);
  const [text, setText] = useState('');
  const [key] = useState(newRequestKey);
  const query = useQuery<CollectionItem | MarketplaceListing>({ queryKey: [market ? 'listing' : 'collection-item', id, session?.user.id], queryFn: ({ signal }) => market ? marketplaceApi.get(id, signal) : collectionApi.get(id, signal) });
  const chat = useQuery({ queryKey: ['listing-messages', id], queryFn: ({ signal }) => marketplaceApi.messages(id, signal), enabled: market && contact && Boolean(session) });
  const favorite = useMutation({ mutationFn: () => collectionApi.update(id, { favorite: !query.data?.favorite }), onSuccess: () => { void queryClient.invalidateQueries({ queryKey: ['collection-item'] }); void queryClient.invalidateQueries({ queryKey: ['collection'] }); } });
  const remove = useMutation({ mutationFn: () => collectionApi.delete(id), onSuccess: () => { void queryClient.invalidateQueries(); router.replace('/collection'); } });
  const purchase = useMutation({ mutationFn: () => marketplaceApi.purchase(id, key), onSuccess: r => router.push({ pathname: '/requests/[id]', params: { id: r.id } }) });
  const send = useMutation({ mutationFn: () => marketplaceApi.contact(id, text.trim(), key), onSuccess: () => { setText(''); void queryClient.invalidateQueries({ queryKey: ['listing-messages', id] }); } });

  if (query.isPending) return <Screen><LoadingSkeleton /></Screen>;
  if (query.isError) return <Screen><ScreenHeader title="Предмет" back /><ErrorState error={query.error} retry={() => void query.refetch()} /></Screen>;

  const item = query.data;
  const listing = 'price' in item ? item : null;
  const act = (fn: () => void) => session?.user.emailVerified ? fn() : router.push('/auth/login');
  const details = [{ label: 'Категория', value: item.categoryName }, { label: 'Год', value: item.year }, { label: 'Страна', value: item.country }, { label: 'Материал', value: item.material }, { label: 'Состояние', value: item.condition }, { label: 'Редкость', value: item.rarity }, ...Object.entries(item.attributes).map(([label, value]) => ({ label, value: String(value) }))];
  const sections = [{ title: 'Описание', text: item.description }, { title: 'История', text: item.history }, { title: 'Происхождение', text: item.provenance }, ...(!market ? [{ title: 'Личные заметки', text: item.notes }, { title: 'Приобретение', text: item.purchaseInfo }] : [])].filter(section => section.text);

  return <Screen scroll={false}><View style={{ flex: 1 }}>
    <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingHorizontal: 22, paddingTop: 18, paddingBottom: market ? 28 : 36, gap: 18 }}>
      <ScreenHeader title={market ? 'Предмет' : item.collectionCode || 'В коллекции'} back action={!market ? <IconButton name="heart" active={item.favorite} label="Избранное" onPress={() => { if (!favorite.isPending) favorite.mutate(); }} /> : undefined} />
      <ImageGallery photos={item.photos} />
      <View style={{ gap: 8 }}><Badge label={item.categoryName} /><Text variant="title">{item.title}</Text>{listing ? <Text variant="heading">{money(listing.price)}</Text> : item.estimatedValue ? <Text variant="heading">Оценка: {money(item.estimatedValue)}</Text> : null}</View>
      {listing ? <Card style={{ backgroundColor: colors.soft, borderColor: listing.seller.verified ? colors.green : colors.border }}><Row style={{ alignItems: 'flex-start' }}><View style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: listing.seller.verified ? colors.green : colors.tint, alignItems: 'center', justifyContent: 'center' }}><Icon name={listing.seller.verified ? 'shield' : 'user'} color={listing.seller.verified ? colors.inverse : colors.accent} size={21} /></View><View style={{ flex: 1, gap: 3 }}><Text variant="heading" style={{ fontSize: 18 }}>{listing.seller.name}</Text><Text variant="caption" color={colors.muted}>{listing.location} · {statusLabels[listing.status] ?? listing.status}</Text></View>{listing.seller.verified ? <Badge label="ПРОВЕРЕН" /> : null}</Row><Text variant="caption" color={colors.muted}>{listing.seller.verified ? 'Личность продавца подтверждена. Перед покупкой можно запросить профессиональный осмотр.' : 'Продавец ещё не прошёл проверку. Будьте внимательны и запросите дополнительные сведения.'}</Text></Card> : null}
      {item.metalValue ? <Card><Text variant="heading" style={{ fontSize: 18 }}>Стоимость металла</Text><Text>{money(item.metalValue)}</Text><Text variant="caption" color={colors.muted}>Ориентир по металлу отличается от рыночной цены и коллекционной ценности предмета.</Text></Card> : null}
      <Card><Text variant="heading" style={{ fontSize: 18 }}>Характеристики</Text>{details.filter(detail => detail.value).map(detail => <Row key={detail.label} style={{ justifyContent: 'space-between', alignItems: 'flex-start', borderBottomWidth: 1, borderBottomColor: colors.border, paddingVertical: 7 }}><Text variant="caption" color={colors.muted} style={{ flex: 1 }}>{detail.label}</Text><Text style={{ flex: 1 }}>{detail.value}</Text></Row>)}</Card>
      {sections.map(section => <Card key={section.title}><Text variant="heading">{section.title}</Text><Text>{section.text}</Text></Card>)}
      {item.aiSummary ? <Card><Badge label="ПРЕДПОЛОЖЕНИЕ AI" /><Text>{item.aiSummary}</Text><Text variant="caption">Определение по фотографии не подтверждает подлинность или пробу.</Text></Card> : null}
      {item.sources.length ? <><SectionHeader title="Источники" />{item.sources.map(source => <SourceCard key={source.url} source={source} />)}</> : null}
      <InlineError error={favorite.error || purchase.error || send.error} />
      {!market ? <><LinkButton href={{ pathname: '/collection/[id]/edit', params: { id } }} title="Редактировать / добавить фото" icon="edit-2" /><LinkButton href={{ pathname: '/assistant', params: { itemId: id } }} title="Спросить AI об этом предмете" icon="message-circle" /><LinkButton href={{ pathname: '/marketplace/create-sale', params: { collectionId: id } }} title="Выставить на продажу" icon="shopping-bag" /><LinkButton href={{ pathname: '/requests/create-inspection', params: { itemId: id } }} title="Заказать осмотр" icon="shield" /></> : <LinkButton href={{ pathname: '/requests/create-inspection', params: { listingId: id } }} title="Заказать профессиональный осмотр" variant="outline" icon="shield" />}
      <Button title="Поделиться" variant="ghost" onPress={() => void Share.share({ message: market ? `${item.title} — antiqueai://marketplace/${encodeURIComponent(id)}` : `${item.title}\n${[item.year, item.country, item.categoryName].filter(Boolean).join(' · ')}` }).catch(() => {})} />
      {!market ? <Button title="Удалить из коллекции" variant="danger" onPress={() => setConfirmDelete(true)} /> : null}
    </ScrollView>
    {market && listing ? <View style={{ borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.surface, paddingHorizontal: 18, paddingTop: 12, paddingBottom: 12, gap: 9 }}><Row style={{ justifyContent: 'space-between', alignItems: 'center' }}><View><Text variant="caption" color={colors.muted}>Цена предмета</Text><Text variant="heading" style={{ fontSize: 19 }}>{money(listing.price)}</Text></View><Text variant="caption" color={colors.muted}>{listing.priceType === 'negotiable' ? 'Цена обсуждается' : 'Фиксированная цена'}</Text></Row><Row style={{ alignItems: 'stretch' }}><Button title={listing.status === 'approved' ? 'Оставить заявку' : 'Покупка недоступна'} loading={purchase.isPending} disabled={listing.status !== 'approved'} style={{ flex: 1 }} onPress={() => act(() => purchase.mutate())} /><Button title="Написать" variant="outline" icon="message-circle" style={{ flex: 0.7 }} onPress={() => act(() => setContact(true))} /></Row></View> : null}
    <BottomSheet open={confirmDelete} onClose={() => setConfirmDelete(false)} title="Удалить предмет?"><Text>Предмет и личные заметки будут удалены из вашей коллекции. Каталог останется без изменений.</Text><InlineError error={remove.error} /><Button title="Удалить" variant="danger" loading={remove.isPending} onPress={() => remove.mutate()} /><Button title="Оставить" onPress={() => setConfirmDelete(false)} /></BottomSheet>
    <BottomSheet open={contact} onClose={() => setContact(false)} title="Сообщение продавцу"><Text variant="caption" color={colors.muted}>Задайте вопрос продавцу и продолжайте переписку в этом окне.</Text>{chat.isPending ? <LoadingSkeleton /> : chat.data?.map(message => <Card key={message.id} style={{ backgroundColor: message.senderId === session?.user.id ? colors.tint : colors.soft }}><Text variant="caption" color={colors.muted}>{message.senderId === session?.user.id ? 'Вы' : listing?.seller.name}</Text><Text>{message.text}</Text></Card>)}<Field label="Ваше сообщение" value={text} onChangeText={setText} multiline maxLength={2000} /><InlineError error={send.error || chat.error} />{send.isSuccess ? <Text color={colors.green}>Сообщение отправлено.</Text> : null}<Button title="Отправить" loading={send.isPending} disabled={!text.trim()} onPress={() => send.mutate()} /></BottomSheet>
  </View></Screen>;
}
