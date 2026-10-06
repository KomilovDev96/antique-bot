import { describe, expect, it } from 'vitest';
import { translateStatic } from '../src/shared/lib/i18n';

describe('home localization', () => {
  it.each([
    ['uz-latn', 'Начните с первого предмета', 'Birinchi buyumdan boshlang'],
    ['uz-cyrl', 'Начните с первого предмета', 'Биринчи буюмдан бошланг'],
    ['uz-latn', 'Добро пожаловать, коллекционер.', 'Xush kelibsiz, kolleksioner.'],
    ['uz-cyrl', 'Добро пожаловать, коллекционер.', 'Хуш келибсиз, коллекционер.'],
    ['uz-latn', 'Предметов: 3', 'Buyumlar: 3'],
    ['uz-cyrl', 'Категорий: 2 · Стран: 1', 'Тоифалар: 2 · Мамлакатлар: 1'],
  ] as const)('%s translates %s', (language, source, expected) => {
    expect(translateStatic(language, source)).toBe(expected);
  });
});

describe('cross-screen localization', () => {
  it.each([
    ['uz-latn', 'Стоимость металла', 'Metall qiymati'],
    ['uz-cyrl', 'Стоимость металла', 'Металл қиймати'],
    ['uz-latn', 'Личность продавца подтверждена. Перед покупкой можно запросить профессиональный осмотр.', 'Sotuvchining shaxsi tasdiqlangan. Xariddan oldin professional ekspertiza so‘rashingiz mumkin.'],
    ['uz-cyrl', 'Цена должна быть больше нуля', 'Нарх нолдан катта бўлиши керак'],
    ['uz-latn', 'Создана 5 октября · #123', 'Yaratilgan 5 октября · #123'],
    ['uz-cyrl', '3 изображения', '3 та расм'],
    ['uz-latn', '12 предметов загружено', '12 ta buyum yuklandi'],
    ['uz-cyrl', '2 правителей · 8 монет', '2 ҳукмдор · 8 танга'],
    ['uz-latn', 'Toshkent · Ожидает', 'Toshkent · Kutilmoqda'],
    ['uz-cyrl', 'Ориентир: 100 USD', 'Мўлжал: 100 USD'],
  ] as const)('%s translates shared UI copy %s', (language, source, expected) => {
    expect(translateStatic(language, source)).toBe(expected);
  });
});
