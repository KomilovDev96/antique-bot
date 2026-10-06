import { useEffect, useState } from 'react';
import { AppState, Platform } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { CormorantGaramond_500Medium } from '@expo-google-fonts/cormorant-garamond';
import { Manrope_400Regular, Manrope_500Medium, Manrope_600SemiBold } from '@expo-google-fonts/manrope';
import { QueryClientProvider, focusManager, onlineManager } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as Network from 'expo-network';
import { queryClient } from '../shared/api/query';
import { useSession } from '../shared/api/session';
import { usePreferences } from '../shared/lib/preferences';
import { useTheme } from '../shared/ui/theme';
import { LoadingSkeleton, Screen } from '../shared/ui/core';
export { ErrorBoundary } from 'expo-router';
export default function RootLayout() {
  const { colors, isDark } = useTheme(); const hydrated = useSession(s => s.hydrated); const [preferencesReady, setPreferencesReady] = useState(usePreferences.persist.hasHydrated());
  const [fontsLoaded, fontError] = useFonts({ CormorantGaramond_500Medium, Manrope_400Regular, Manrope_500Medium, Manrope_600SemiBold });
  useEffect(() => { void useSession.getState().hydrate(); return usePreferences.persist.onFinishHydration(() => setPreferencesReady(true)); }, []);
  useEffect(() => {
    const app = AppState.addEventListener('change', state => { if (Platform.OS !== 'web') focusManager.setFocused(state === 'active'); });
    const network = Network.addNetworkStateListener(state => onlineManager.setOnline(state.isConnected !== false && state.isInternetReachable !== false));
    return () => { app.remove(); network.remove(); };
  }, []);
  return <GestureHandlerRootView style={{ flex: 1 }}><SafeAreaProvider><QueryClientProvider client={queryClient}><StatusBar style={isDark ? 'light' : 'dark'} />{!hydrated || !preferencesReady || !fontsLoaded && !fontError ? <Screen><LoadingSkeleton /></Screen> : <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background }, animation: 'fade' }} />}</QueryClientProvider></SafeAreaProvider></GestureHandlerRootView>;
}
