import type { PropsWithChildren } from 'react';
import { useSession } from '../shared/api/session';
import { EmptyState, Screen, ScreenHeader } from '../shared/ui/core';
import { router } from 'expo-router';
export function AuthGate({ children, title = 'Личное пространство' }: PropsWithChildren<{ title?: string }>) { const session = useSession(s => s.session); if (!session) return <Screen><ScreenHeader title={title} eyebrow="ANTIQUE AI" /><EmptyState icon="lock" title="Ваша коллекция — только ваша" description="Войдите, чтобы сохранять предметы, отправлять заявки и обсуждать коллекцию с AI." action="Войти или создать аккаунт" onPress={() => router.push('/auth/login')} /></Screen>; if (!session.user.emailVerified) return <Screen><EmptyState icon="mail" title="Подтвердите почту" description="Для доступа к коллекции необходимо подтвердить адрес электронной почты." action="Подтвердить" onPress={() => router.push('/auth/verify-email')} /></Screen>; return children; }
