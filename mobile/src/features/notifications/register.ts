import { Platform } from 'react-native';
import * as Device from 'expo-device';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { notificationsApi } from '../../shared/api/services';
import { ApiError } from '../../shared/api/transport';
const key = 'antiqueai.push-token';
export async function registerNotifications() {
  const projectId = process.env.EXPO_PUBLIC_EAS_PROJECT_ID;
  if (Platform.OS === 'web' || !Device.isDevice) throw new ApiError(400, 'PUSH_DEVICE', 'Push-уведомления доступны в установленном приложении на телефоне.');
  if (!projectId) throw new ApiError(501, 'NOT_CONFIGURED', 'Уведомления пока недоступны.');
  const Notifications = await import('expo-notifications');
  if (Platform.OS === 'android') await Notifications.setNotificationChannelAsync('default', { name: 'Antique AI', importance: Notifications.AndroidImportance.DEFAULT });
  const permission = await Notifications.requestPermissionsAsync();
  if (!permission.granted) throw new ApiError(400, 'PUSH_PERMISSION', 'Разрешите уведомления в настройках устройства.');
  const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
  await notificationsApi.register({ token, platform: Platform.OS }); await AsyncStorage.setItem(key, token);
}
export async function unregisterNotifications() { const token = await AsyncStorage.getItem(key); if (token) await notificationsApi.unregister(token); await AsyncStorage.removeItem(key); }
