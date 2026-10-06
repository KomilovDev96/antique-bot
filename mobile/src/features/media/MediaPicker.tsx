import { Image } from 'expo-image';
import { ScrollView, View } from 'react-native';
import { Button, IconButton, InlineError, Text } from '../../shared/ui/core';
import { useI18n } from '../../shared/lib/i18n';
import { useMedia } from './useMedia';
export function MediaPicker({ media, attachments = false }: { media: ReturnType<typeof useMedia>; attachments?: boolean }) {
  const { t } = useI18n();
  return <View style={{ gap: 12 }}><Text variant="label">{attachments ? 'Фото, видео и документы' : t('uploadPhotos')} · {media.count}/8</Text><ScrollView horizontal contentContainerStyle={{ gap: 10 }}>{media.existing.map(f => <View key={f.id} style={{ gap: 5 }}><Image source={f.url} style={{ width: 90, height: 90, borderRadius: 10 }} /><IconButton name="x" label="Удалить фотографию" onPress={() => media.removeExisting(f.id)} /></View>)}{media.files.map((f, index) => <View key={`${f.uri}-${index}`} style={{ gap: 5 }}>{f.mimeType.startsWith('image/') ? <Image source={f.uri} style={{ width: 90, height: 90, borderRadius: 10 }} /> : <Text style={{ width: 130 }}>{f.name}</Text>}<IconButton name="x" label="Убрать файл" onPress={() => media.remove(f.uri)} /></View>)}</ScrollView><Button title={attachments ? 'Добавить файлы' : t('uploadPhotos')} icon="image" variant="secondary" onPress={() => void media.pick(attachments)} disabled={media.count >= 8} /><InlineError error={media.error} /></View>;
}
