import { Redirect } from 'expo-router';
import { usePreferences } from '../shared/lib/preferences';
export default function Index() { const onboarded = usePreferences(s => s.onboarded); return <Redirect href={onboarded ? '/home' : '/onboarding'} />; }
