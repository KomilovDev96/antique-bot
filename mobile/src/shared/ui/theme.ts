import { useColorScheme } from 'react-native';
import { usePreferences } from '../lib/preferences';
export const tokens = { space: { xs: 4, sm: 8, md: 12, lg: 20, xl: 28, xxl: 40 }, radius: { sm: 10, md: 18, lg: 28, pill: 999 }, font: { body: 'Manrope_400Regular', medium: 'Manrope_500Medium', bold: 'Manrope_600SemiBold', display: 'CormorantGaramond_500Medium' }, duration: { quick: 160, normal: 280 }, icon: { sm: 18, md: 24, lg: 32 } };
const light = { background: '#F2F6F7', surface: '#FFFFFF', text: '#142B3A', muted: '#617783', border: '#D5E3E8', accent: '#267A9A', tint: '#DCEFF3', inverse: '#F6FCFD', hero: '#14364B', green: '#3E8A71', danger: '#C4574D', soft: '#E8F1F4' };
const dark: typeof light = { background: '#101C24', surface: '#192A34', text: '#ECF6F8', muted: '#A9C0C8', border: '#36515D', accent: '#71C1D2', tint: '#254551', inverse: '#F6FCFD', hero: '#0D2D43', green: '#8FD0B9', danger: '#F4A999', soft: '#263D47' };
export function useTheme() { const preference = usePreferences(s => s.theme); const system = useColorScheme(); const isDark = (preference === 'system' ? system : preference) === 'dark'; return { colors: isDark ? dark : light, isDark, ...tokens }; }
