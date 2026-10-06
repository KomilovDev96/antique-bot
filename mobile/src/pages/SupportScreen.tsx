import { useState } from 'react';
import { FlatList, Pressable, View } from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import { supportApi } from '../shared/api/services';
import { AuthGate } from '../widgets/AuthGate';
import { Button, Card, EmptyState, ErrorState, Field, InlineError, LoadingSkeleton, Screen, ScreenHeader, Text } from '../shared/ui/core';
import { useTheme } from '../shared/ui/theme';
import { translateStatic, useI18n } from '../shared/lib/i18n';

const statusLabel = { open: 'Открыто', waiting_admin: 'Ждём ответа поддержки', waiting_user: 'Нужна ваша информация', closed: 'Закрыто' };

export function SupportScreen() { return <AuthGate title="Служба поддержки"><SupportList /></AuthGate>; }
function SupportList() {
  const queryClient = useQueryClient(); const { language } = useI18n(); const [subject, setSubject] = useState(''); const [phone, setPhone] = useState(''); const [message, setMessage] = useState('');
  const query = useQuery({ queryKey: ['support'], queryFn: ({ signal }) => supportApi.list(signal) });
  const create = useMutation({ mutationFn: () => supportApi.create(subject.trim(), phone.trim(), message.trim()), onSuccess: result => { setSubject(''); setPhone(''); setMessage(''); void queryClient.invalidateQueries({ queryKey: ['support'] }); router.push({ pathname: '/support/[id]', params: { id: result.ticket.id } }); } });
  return <Screen><ScreenHeader title="Служба поддержки" back /><Card><Text variant="heading">Напишите нам</Text><Text color="#617783">Опишите вопрос — команда поддержки ответит в этом обращении.</Text><Field label="Тема" value={subject} onChangeText={setSubject} maxLength={160} placeholder="Например: не загружается каталог" /><Field label="Номер телефона" value={phone} onChangeText={setPhone} keyboardType="phone-pad" maxLength={30} placeholder="+998 90 123 45 67" /><Field label="Сообщение" value={message} onChangeText={setMessage} multiline maxLength={5000} placeholder="Что произошло?" /><InlineError error={create.error} /><Button title="Отправить обращение" loading={create.isPending} disabled={subject.trim().length < 3 || phone.trim().length < 7 || !message.trim()} onPress={() => create.mutate()} /></Card><Text variant="heading">Мои обращения</Text>{query.isPending ? <LoadingSkeleton /> : query.isError ? <ErrorState error={query.error} retry={() => void query.refetch()} /> : query.data.items.length ? query.data.items.map(ticket => <Pressable key={ticket.id} onPress={() => router.push({ pathname: '/support/[id]', params: { id: ticket.id } })}><Card><Text variant="heading">{ticket.subject}</Text><Text variant="caption">{translateStatic(language, statusLabel[ticket.status])} · {new Date(ticket.lastMessageAt).toLocaleString()}</Text><Text variant="caption">{ticket.phone}</Text><Text numberOfLines={2}>{ticket.lastMessage}</Text></Card></Pressable>) : <EmptyState icon="message-circle" title="Обращений пока нет" description="Создайте первое обращение, если нужна помощь." />}</Screen>;
}

export function SupportThreadScreen() { return <AuthGate><SupportThread /></AuthGate>; }
function SupportThread() {
  const { colors } = useTheme(); const { language } = useI18n(); const { id } = useLocalSearchParams<{ id: string }>(); const [text, setText] = useState(''); const queryClient = useQueryClient();
  const query = useQuery({ queryKey: ['support', id], queryFn: ({ signal }) => supportApi.messages(id, signal), enabled: Boolean(id) });
  const send = useMutation({ mutationFn: () => supportApi.reply(id, text.trim()), onSuccess: () => { setText(''); void queryClient.invalidateQueries({ queryKey: ['support', id] }); void queryClient.invalidateQueries({ queryKey: ['support'] }); } });
  if (query.isPending) return <Screen><LoadingSkeleton /></Screen>;
  if (query.isError || !query.data) return <Screen><ErrorState error={query.error} retry={() => void query.refetch()} /></Screen>;
  const { ticket, items } = query.data;
  return <Screen><ScreenHeader title={ticket.subject} eyebrow="СЛУЖБА ПОДДЕРЖКИ" back /><Text variant="caption" color={colors.muted}>{translateStatic(language, statusLabel[ticket.status])}</Text><FlatList data={items} keyExtractor={item => item.id} scrollEnabled={false} contentContainerStyle={{ gap: 10 }} renderItem={({ item }) => <Card style={{ backgroundColor: item.senderRole === 'admin' ? colors.soft : colors.surface, alignSelf: item.senderRole === 'admin' ? 'flex-start' : 'flex-end', width: '88%' }}><Text variant="caption" color={colors.muted}>{translateStatic(language, item.senderRole === 'admin' ? 'Поддержка' : 'Вы')} · {new Date(item.createdAt).toLocaleString()}</Text><Text>{item.text}</Text></Card>} /><View style={{ gap: 10 }}><Field label="Ваше сообщение" value={text} onChangeText={setText} multiline maxLength={5000} placeholder="Напишите ответ…" /><InlineError error={send.error} /><Button title="Отправить" loading={send.isPending} disabled={!text.trim() || ticket.status === 'closed'} onPress={() => send.mutate()} /></View></Screen>;
}
