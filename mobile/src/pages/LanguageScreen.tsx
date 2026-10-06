import { router } from 'expo-router';
import { usePreferences } from '../shared/lib/preferences';
import { languageOptions, useI18n } from '../shared/lib/i18n';
import { Chip, IconButton, Row, Screen, ScreenHeader, Text } from '../shared/ui/core';
import { useTheme } from '../shared/ui/theme';

export function LanguageScreen() {
  const { colors } = useTheme();
  const language = usePreferences(state => state.language);
  const { t } = useI18n();
  return <Screen><ScreenHeader title={t('language')} back action={<IconButton name="settings" label={t('settings')} onPress={() => router.push('/settings')} />} /><Text color={colors.muted}>{t('languageDescription')}</Text><Text variant="label" color={colors.accent}>Выберите язык приложения</Text><Row style={{ flexWrap: 'wrap', gap: 10 }}>{languageOptions.map(option => <Chip key={option.id} label={option.label} selected={language === option.id} onPress={() => usePreferences.getState().setLanguage(option.id)} />)}</Row><Text variant="caption" color={colors.muted}>Язык применяется сразу ко всем разделам приложения.</Text></Screen>;
}
