import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { router, useLocalSearchParams } from 'expo-router';
import { useMutation } from '@tanstack/react-query';
import { useChallenge } from '../features/auth/challenge';
import { authApi, profileApi } from '../shared/api/services';
import { useSession } from '../shared/api/session';
import { queryClient } from '../shared/api/query';
import { usePreferences } from '../shared/lib/preferences';
import { email, password } from '../shared/lib/validation';
import { Button, Card, Field, Icon, InlineError, LinkButton, Screen, ScreenHeader, Text } from '../shared/ui/core';
import { useTheme } from '../shared/ui/theme';
import { useI18n } from '../shared/lib/i18n';
import type { Session } from '../entities/types';

export type AuthMode = 'login' | 'register' | 'verify-email' | 'forgot-password' | 'reset-password';
type Values = { email: string; password: string; confirmPassword: string; code: string };
const titles: Record<AuthMode, string> = { login: 'С возвращением', register: 'Ваша история\nначинается здесь', 'verify-email': 'Проверьте почту', 'forgot-password': 'Восстановить доступ', 'reset-password': 'Новый пароль' };
export function AuthScreen({ mode }: { mode: AuthMode }) {
  const { colors } = useTheme(); const { t } = useI18n(); const params = useLocalSearchParams<{ token?: string }>(); const challenge = useChallenge();
  const [notice, setNotice] = useState(''); const [changeEmail, setChangeEmail] = useState(false);
  const schema = z.object({ email: z.string(), password: z.string(), confirmPassword: z.string(), code: z.string() }).superRefine((values, ctx) => {
    const add = (path: keyof Values, message: string) => ctx.addIssue({ code: 'custom', path: [path], message });
    if (['login', 'register', 'forgot-password'].includes(mode) || changeEmail) { const valid = email.safeParse(values.email).success && /@(gmail\.com|googlemail\.com)$/i.test(values.email.trim()); if (!valid) add('email', 'Используйте адрес Gmail'); }
    if (mode === 'login' && !values.password) add('password', 'Введите пароль');
    if (mode === 'register' || mode === 'reset-password') {
      if (!password.safeParse(values.password).success) add('password', 'Пароль должен содержать от 12 до 128 символов');
      if (values.password !== values.confirmPassword) add('confirmPassword', 'Пароли не совпадают');
    }
    if (mode === 'verify-email' && !changeEmail && !/^\d{6}$/.test(values.code)) add('code', 'Введите 6 цифр из письма');
  });
  const { control, handleSubmit } = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { email: challenge.email, password: '', confirmPassword: '', code: '' } });
  async function signedIn(session: Session) {
    await queryClient.cancelQueries(); queryClient.clear(); await useSession.getState().setSession(session);
    if (!session.user.emailVerified) { challenge.set(session.verificationChallengeId ?? '', session.user.email); router.replace('/auth/verify-email'); return; }
    const categoryIds = usePreferences.getState().categoryIds;
    if (categoryIds.length && !session.user.categoryIds.length) await profileApi.update({ categoryIds }).catch(() => {});
    router.replace('/home');
  }
  const submit = useMutation({ mutationFn: async (values: Values) => {
    setNotice('');
    if (mode === 'login') return signedIn(await authApi.login({ email: values.email.trim(), password: values.password }));
    if (mode === 'register') await signedIn(await authApi.register({ email: values.email.trim(), password: values.password }));
    if (mode === 'verify-email') {
      if (changeEmail) { const result = await authApi.changeEmail(challenge.id, values.email); challenge.set(result.challengeId, result.email); setChangeEmail(false); setNotice('Новое письмо отправлено.'); }
      else await signedIn(await authApi.verify({ challengeId: challenge.id, code: values.code }));
    }
    if (mode === 'forgot-password') { await authApi.forgot(values.email); setNotice('Если такой аккаунт существует, мы отправили письмо со ссылкой для восстановления.'); }
    if (mode === 'reset-password') { if (!params.token) throw new Error('Missing token'); await authApi.reset(params.token, values.password); setNotice('Пароль обновлён. Теперь можно войти.'); }
  } });
  const resend = useMutation({ mutationFn: () => authApi.resend(challenge.id), onSuccess: () => setNotice('Письмо отправлено повторно. Проверьте входящие и спам.') });
  const fields: { name: keyof Values; label: string; secure?: boolean }[] = [];
  if (['login', 'register', 'forgot-password'].includes(mode) || changeEmail) fields.push({ name: 'email', label: t('email') });
  if (['login', 'register', 'reset-password'].includes(mode)) fields.push({ name: 'password', label: t('password'), secure: true });
  if (['register', 'reset-password'].includes(mode)) fields.push({ name: 'confirmPassword', label: t('confirmPassword'), secure: true });
  if (mode === 'verify-email' && !changeEmail) fields.push({ name: 'code', label: t('code') });
  const cannotVerify = mode === 'verify-email' && !challenge.id;
  return <Screen><ScreenHeader title={titles[mode]} eyebrow="ANTIQUE AI · ЛИЧНОЕ ПРОСТРАНСТВО" back /><Card><Icon name={mode === 'verify-email' ? 'mail' : 'key'} color={colors.accent} size={30} /><Text color={colors.muted}>{mode === 'verify-email' ? `Введите код, отправленный на ${challenge.email || 'вашу почту'}.` : 'Сохраните предметы, их историю и открытия в одном личном пространстве.'}</Text>{fields.map(field => <Controller key={field.name} control={control} name={field.name} render={({ field: input, fieldState }) => <Field label={field.label} value={input.value} onChangeText={input.onChange} onBlur={input.onBlur} error={fieldState.error?.message} secureTextEntry={field.secure} autoCapitalize="none" autoCorrect={false} keyboardType={field.name === 'email' ? 'email-address' : field.name === 'code' ? 'number-pad' : 'default'} textContentType={field.name === 'code' ? 'oneTimeCode' : field.name === 'email' ? 'emailAddress' : field.secure ? mode === 'login' ? 'password' : 'newPassword' : 'none'} /> } />)}
    {mode === 'reset-password' && !params.token ? <Text color={colors.danger}>Откройте ссылку восстановления из письма.</Text> : null}
    {cannotVerify ? <Text color={colors.muted}>Начните с регистрации или повторного входа, чтобы получить код подтверждения.</Text> : null}
    <InlineError error={submit.error || resend.error} />{notice ? <Text accessibilityLiveRegion="polite" color={colors.green}>{notice}</Text> : null}
    <Button title={mode === 'login' ? t('signIn') : mode === 'register' ? t('signUp') : mode === 'forgot-password' ? t('sendEmail') : mode === 'reset-password' ? t('savePassword') : changeEmail ? t('changeEmail') : t('confirmEmail')} onPress={handleSubmit(v => submit.mutate(v))} loading={submit.isPending} disabled={cannotVerify || mode === 'reset-password' && !params.token} />
    {mode === 'verify-email' ? <><Button variant="ghost" title={t('resendCode')} disabled={!challenge.id} loading={resend.isPending} onPress={() => resend.mutate()} /><Button variant="ghost" title={changeEmail ? t('code') : t('changeEmail')} disabled={!challenge.id} onPress={() => setChangeEmail(!changeEmail)} /></> : null}
  </Card>{mode === 'login' ? <><LinkButton href="/auth/forgot-password" title={t('forgotPassword')} variant="ghost" /><LinkButton href="/auth/register" title={t('signUp')} /></> : <LinkButton href="/auth/login" title={t('alreadyAccount')} variant="ghost" />}<LinkButton href="/home" title={t('viewApp')} variant="ghost" /></Screen>;
}
