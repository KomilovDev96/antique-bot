import { LinkButton, Screen, ScreenHeader, Text } from '../shared/ui/core';
export default function NotFound() { return <Screen><ScreenHeader title="Страница не найдена" /><Text>Возможно, ссылка устарела.</Text><LinkButton href="/home" title="Вернуться на главную" /></Screen>; }
