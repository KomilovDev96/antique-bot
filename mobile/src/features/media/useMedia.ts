import { useRef, useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { Platform } from 'react-native';
import type { Media } from '../../entities/types';
import { mediaApi } from '../../shared/api/services';
import { ApiError } from '../../shared/api/transport';
export type LocalMedia = { uri: string; name: string; mimeType: string; size?: number };
export function useMedia(initial: Media[] = []) {
  const [files, setFiles] = useState<LocalMedia[]>([]); const [existing, setExisting] = useState(initial); const [error, setError] = useState<unknown>(null); const uploaded = useRef(new Map<string, Media>());
  const add = (next: LocalMedia[]) => {
    if (next.some(f => f.size && f.size > 20 * 1024 * 1024)) { setError(new ApiError(400, 'FILE_SIZE', 'Размер файла не должен превышать 20 МБ.')); return; }
    setFiles(previous => [...previous, ...next].slice(0, Math.max(0, 8 - existing.length))); setError(null);
  };
  async function pick(attachments = false) {
    try {
      if (attachments) { const result = await DocumentPicker.getDocumentAsync({ type: ['image/*', 'video/*', 'application/pdf'], multiple: true, copyToCacheDirectory: true }); if (!result.canceled) add(result.assets.map(f => ({ uri: f.uri, name: f.name, mimeType: f.mimeType ?? 'application/octet-stream', size: f.size }))); return; }
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) { setError(new ApiError(400, 'PERMISSION', 'Разрешите доступ к фотографиям в настройках устройства.')); return; }
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsMultipleSelection: true, selectionLimit: Math.max(1, 8 - files.length - existing.length), quality: 0.85 });
      if (!result.canceled) add(result.assets.map(f => ({ uri: f.uri, name: f.fileName ?? `photo-${Date.now()}.jpg`, mimeType: f.mimeType ?? 'image/jpeg', size: f.fileSize })));
    } catch (e) { setError(e); }
  }
  async function uploadAll() {
    const results = [...existing];
    for (const file of files) {
      const cached = uploaded.current.get(file.uri);
      if (cached) { results.push(cached); continue; }
      const form = new FormData();
      if (Platform.OS === 'web') { const response = await fetch(file.uri); form.append('file', await response.blob(), file.name); }
      else form.append('file', { uri: file.uri, name: file.name, type: file.mimeType } as unknown as Blob);
      const media = await mediaApi.upload(form); uploaded.current.set(file.uri, media); results.push(media);
    }
    return results;
  }
  return { files, existing, error, add, pick, uploadAll, remove: (uri: string) => setFiles(prev => prev.filter(f => f.uri !== uri)), removeExisting: (id: string) => setExisting(prev => prev.filter(f => f.id !== id)), count: files.length + existing.length };
}
