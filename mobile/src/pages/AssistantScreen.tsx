import { useState } from 'react';
import { FlatList, View } from 'react-native';
import { useInfiniteQuery, useMutation } from '@tanstack/react-query';
import { useLocalSearchParams } from 'expo-router';
import { assistantApi } from '../shared/api/services';
import { useSession } from '../shared/api/session';
import { newRequestKey } from '../shared/lib/hooks';
import type { AssistantMessage } from '../entities/types';
import { AuthGate } from '../widgets/AuthGate';
import { Button, Card, Chip, ErrorState, Field, InlineError, LoadingSkeleton, Row, Screen, ScreenHeader, Text } from '../shared/ui/core';
import { AIMessage, UserMessage } from '../shared/ui/objects';
import { useTheme } from '../shared/ui/theme';
export function AssistantScreen() { return <AuthGate title="Ваш AI-помощник"><AssistantContent /></AuthGate>; }
function AssistantContent() {
  const { colors } = useTheme(); const { itemId } = useLocalSearchParams<{ itemId?: string }>(); const user = useSession(s => s.session?.user.id); const [text, setText] = useState(''); const [sent, setSent] = useState<AssistantMessage[]>([]); const [requestKey, setRequestKey] = useState(newRequestKey);
  const history = useInfiniteQuery({ queryKey: ['assistant', user], queryFn: ({ pageParam, signal }) => assistantApi.history(pageParam, signal), initialPageParam: undefined as string | undefined, getNextPageParam: page => page.nextCursor ?? undefined });
  const send = useMutation({ mutationFn: ({ text: question, key }: { text: string; key: string }) => assistantApi.send(question, key, itemId), onSuccess: (answer, input) => { setSent(prev => [...prev, { id: input.key, role: 'user', text: input.text, sources: [], itemIds: [], createdAt: new Date().toISOString() }, answer]); setText(''); setRequestKey(newRequestKey()); } });
  const messages = [...new Map([...(history.data?.pages.flatMap(p => p.items) ?? []), ...sent].map(m => [m.id, m])).values()].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  return <Screen scroll={false}><ScreenHeader title="Диалог с коллекцией" eyebrow="ANTIQUE AI" />{itemId ? <Text variant="caption" color={colors.accent}>Обсуждаем выбранный предмет</Text> : null}<FlatList data={messages} keyExtractor={m => m.id} contentContainerStyle={{ gap: 12, paddingBottom: 12 }} renderItem={({ item }) => item.role === 'assistant' ? <AIMessage message={item} /> : <UserMessage message={item} />} ListHeaderComponent={history.hasNextPage ? <Button title="Загрузить предыдущие" loading={history.isFetchingNextPage} variant="ghost" onPress={() => void history.fetchNextPage()} /> : null} ListEmptyComponent={history.isPending ? <LoadingSkeleton /> : history.isError ? <ErrorState error={history.error} retry={() => void history.refetch()} /> : <Card><Text variant="title">С чего начнём?</Text><Text color={colors.muted}>Я помогу найти предметы и изучить их историю. Ответы о вашей коллекции опираются на сохранённые данные.</Text>{['Что есть в моей коллекции?', 'Покажи серебряные предметы', 'Какие предметы требуют осмотра?'].map(prompt => <Chip key={prompt} label={prompt} onPress={() => setText(prompt)} />)}</Card>} ListFooterComponent={send.isPending ? <Row><Text color={colors.muted}>Ищем сведения для ответа…</Text></Row> : null} /><InlineError error={send.error} /><View style={{ gap: 10, paddingBottom: 12 }}><Field label="Спросите о коллекции" placeholder="Есть ли у меня монета 1921 года?" value={text} onChangeText={v => { setText(v); setRequestKey(newRequestKey()); }} multiline maxLength={3000} editable={!send.isPending} /><Button title="Отправить" icon="arrow-up" loading={send.isPending} disabled={!text.trim()} onPress={() => send.mutate({ text: text.trim(), key: requestKey })} /></View></Screen>;
}
