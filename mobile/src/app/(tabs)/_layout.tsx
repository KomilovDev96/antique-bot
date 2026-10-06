import { Tabs } from 'expo-router';
import { Icon, type IconName } from '../../shared/ui/core';
import { useTheme } from '../../shared/ui/theme';
import { translateStatic, useI18n } from '../../shared/lib/i18n';
export default function TabLayout() {
  const { colors, font } = useTheme(); const { language, t } = useI18n();
  const tabs: { name: string; title: string; icon: IconName }[] = [{ name: 'home', title: t('home'), icon: 'home' }, { name: 'collection', title: t('collection'), icon: 'grid' }, { name: 'scan', title: t('scanner'), icon: 'aperture' }, { name: 'marketplace', title: t('marketplace'), icon: 'shopping-bag' }, { name: 'assistant', title: t('assistant'), icon: 'message-circle' }, { name: 'support', title: translateStatic(language, 'Служба поддержки'), icon: 'help-circle' }];
  return <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: colors.accent, tabBarInactiveTintColor: colors.muted, tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border, paddingTop: 8 }, tabBarLabelStyle: { fontFamily: font.medium, fontSize: 10, marginTop: 3 }, sceneStyle: { backgroundColor: colors.background } }}>{tabs.map(tab => <Tabs.Screen key={tab.name} name={tab.name} options={{ title: tab.title, tabBarIcon: ({ color }) => <Icon name={tab.icon} color={color} size={22} /> }} />)}</Tabs>;
}
