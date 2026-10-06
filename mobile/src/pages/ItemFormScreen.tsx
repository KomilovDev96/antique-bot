import { useState } from 'react';
import { View } from 'react-native';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import { router, useLocalSearchParams } from 'expo-router';
import { collectionApi, catalogApi, marketplaceApi } from '../shared/api/services';
import { queryClient } from '../shared/api/query';
import { ApiError } from '../shared/api/transport';
import { itemInputSchema, listingInputSchema } from '../shared/lib/validation';
import { newRequestKey } from '../shared/lib/hooks';
import type { CollectionItem } from '../entities/types';
import { useMedia } from '../features/media/useMedia';
import { MediaPicker } from '../features/media/MediaPicker';
import { CategoryFields } from '../features/catalog/CategoryFields';
import { AuthGate } from '../widgets/AuthGate';
import { Badge, BottomSheet, Button, Card, ErrorState, Field, InlineError, LoadingSkeleton, Row, Screen, ScreenHeader, SegmentedControl, Text } from '../shared/ui/core';

const formSchema = itemInputSchema.extend({ price: z.string(), currency: z.enum(['USD', 'UZS', 'EUR']), location: z.string(), priceType: z.enum(['fixed', 'negotiable']), contactPreference: z.enum(['in_app', 'request']) });
type Values = z.infer<typeof formSchema>;
type FieldConfig = { name: keyof Values; label: string; multiline?: boolean };

export function ItemFormScreen({ sale = false, edit = false }: { sale?: boolean; edit?: boolean }) { return <AuthGate><ItemLoader sale={sale} edit={edit} /></AuthGate>; }

function ItemLoader({ sale, edit }: { sale: boolean; edit: boolean }) {
  const { id, collectionId } = useLocalSearchParams<{ id?: string; collectionId?: string }>();
  const sourceId = edit ? id : collectionId;
  const query = useQuery({ queryKey: ['collection-item', sourceId], queryFn: ({ signal }) => collectionApi.get(sourceId!, signal), enabled: !!sourceId });
  if (sourceId && query.isPending) return <Screen><LoadingSkeleton /></Screen>;
  if (sourceId && query.isError) return <Screen><ErrorState error={query.error} retry={() => void query.refetch()} /></Screen>;
  return <ItemForm key={sourceId ?? 'new'} sale={sale} edit={edit} item={query.data} />;
}

function StepHeader({ step }: { step: number }) {
  const labels = ['Фото и категория', 'О предмете', 'Цена и условия'];
  return <View style={{ gap: 10 }}><Row style={{ justifyContent: 'space-between' }}><Text variant="label">ШАГ {step + 1} ИЗ 3</Text><Text variant="caption" color="#617783">{labels[step]}</Text></Row><Row style={{ gap: 6 }}>{labels.map((label, index) => <View key={label} accessibilityLabel={label} style={{ height: 5, flex: 1, borderRadius: 4, backgroundColor: index <= step ? '#267A9A' : '#D5E3E8' }} />)}</Row></View>;
}

function ItemForm({ sale, edit, item }: { sale: boolean; edit: boolean; item?: CollectionItem }) {
  const { metal } = useLocalSearchParams<{ metal?: string }>();
  const media = useMedia(item?.photos);
  const [attributes, setAttributes] = useState<Record<string, string>>(Object.fromEntries(Object.entries(item?.attributes ?? {}).map(([key, value]) => [key, String(value)])));
  const [preview, setPreview] = useState<Values | null>(null);
  const [step, setStep] = useState(0);
  const [photoError, setPhotoError] = useState('');
  const [requestKey] = useState(newRequestKey);
  const categories = useQuery({ queryKey: ['categories'], queryFn: ({ signal }) => catalogApi.categories(signal) });
  const defaults: Values = { title: item?.title ?? '', categoryId: item?.categoryId ?? '', description: item?.description ?? '', year: item?.year ?? '', country: item?.country ?? '', condition: item?.condition ?? '', notes: item?.notes ?? '', material: item?.material ?? (metal === 'gold' ? 'Золото' : metal === 'silver' ? 'Серебро' : ''), price: '', currency: 'USD', location: '', priceType: 'fixed', contactPreference: 'in_app' };
  const { control, handleSubmit, setValue, trigger, formState } = useForm<Values>({ resolver: zodResolver(sale ? listingInputSchema : formSchema), defaultValues: defaults });
  const watched = useWatch({ control });
  const save = useMutation({ mutationFn: async (values: Values) => {
    const category = categories.data?.find(c => c.id === values.categoryId);
    if (!category) throw new ApiError(400, 'CATEGORY', 'Выберите доступную категорию');
    for (const field of category.attributes) {
      const value = attributes[field.key]?.trim();
      if (field.required && !value) throw new ApiError(400, 'ATTRIBUTE', `Заполните поле: ${field.label}`);
      if (value && field.type === 'number' && !Number.isFinite(Number(value.replace(',', '.')))) throw new ApiError(400, 'ATTRIBUTE', `Введите число: ${field.label}`);
    }
    if (sale && !media.count) throw new ApiError(400, 'PHOTOS', 'Добавьте хотя бы одну фотографию');
    const photos = await media.uploadAll();
    const normalized = Object.fromEntries(category.attributes.filter(attribute => attributes[attribute.key]?.trim()).map(attribute => [attribute.key, attribute.type === 'number' ? Number(attributes[attribute.key].replace(',', '.')) : attributes[attribute.key]]));
    const { price, currency, location, priceType, contactPreference, notes, ...common } = values;
    const body = { ...common, attributes: normalized, mediaIds: photos.map(photo => photo.id) };
    if (sale) return marketplaceApi.create({ ...body, collectionId: item?.id, price: { amount: price, currency }, priceType, location, contactPreference }, requestKey);
    if (edit && item) return collectionApi.update(item.id, { ...body, notes });
    return collectionApi.create({ ...body, notes }, requestKey);
  }, onSuccess: result => { void queryClient.invalidateQueries(); router.replace({ pathname: sale ? '/marketplace/[id]' : '/collection/[id]', params: { id: result.id } }); } });

  const detailFields: FieldConfig[] = [{ name: 'title', label: 'Название' }, { name: 'description', label: 'Описание', multiline: true }, { name: 'year', label: 'Год или период' }, { name: 'country', label: 'Страна' }, { name: 'material', label: 'Материал' }, { name: 'condition', label: 'Состояние' }];
  const priceFields: FieldConfig[] = [{ name: 'price', label: 'Желаемая цена' }, { name: 'location', label: 'Город' }];
  const collectionFields: FieldConfig[] = [...detailFields, { name: 'notes', label: 'Личные заметки', multiline: true }];
  const renderFields = (fields: FieldConfig[]) => fields.map(field => <Controller key={field.name} control={control} name={field.name} render={({ field: input, fieldState }) => <Field label={field.label} value={input.value} onChangeText={input.onChange} onBlur={input.onBlur} multiline={field.multiline} keyboardType={field.name === 'price' ? 'decimal-pad' : 'default'} error={fieldState.error?.message} />} />);
  const categoryFields = <><CategoryFields categoryId={watched.categoryId ?? defaults.categoryId} setCategoryId={id => setValue('categoryId', id, { shouldValidate: true })} attributes={attributes} setAttributes={setAttributes} />{formState.errors.categoryId ? <Text color="#C4574D">{formState.errors.categoryId.message}</Text> : null}</>;

  const goNext = async () => {
    if (step === 0) {
      if (!media.count) { setPhotoError('Добавьте хотя бы одну фотографию предмета.'); return; }
      setPhotoError('');
      if (await trigger('categoryId')) setStep(1);
      return;
    }
    if (step === 1) {
      if (await trigger(detailFields.map(field => field.name))) setStep(2);
    }
  };
  const goBack = () => setStep(current => Math.max(0, current - 1));

  if (!sale) return <Screen><ScreenHeader title={edit ? 'Редактировать' : 'Новый предмет'} eyebrow="КОЛЛЕКЦИЯ" back />{renderFields(collectionFields)}{categoryFields}<MediaPicker media={media} /><InlineError error={save.error} /><Button title="Сохранить предмет" loading={save.isPending} onPress={handleSubmit(values => save.mutate(values))} /></Screen>;

  return <Screen><ScreenHeader title="Продать предмет" eyebrow="БОЗОР" back /><StepHeader step={step} />{step === 0 ? <><Card><Badge label="ШАГ 1" /><Text variant="heading">Покажите предмет</Text><Text color="#617783">Добавьте хорошие фотографии лицевой стороны, оборота и важных деталей.</Text></Card><MediaPicker media={media} />{photoError ? <Text color="#C4574D">{photoError}</Text> : null}{categoryFields}</> : null}{step === 1 ? <><Card><Badge label="ШАГ 2" /><Text variant="heading">Расскажите о предмете</Text><Text color="#617783">Чем точнее описание, тем легче покупателю принять решение.</Text></Card>{renderFields(detailFields)}</> : null}{step === 2 ? <><Card><Badge label="ШАГ 3" /><Text variant="heading">Цена и условия</Text><Text color="#617783">Укажите понятную цену и город, чтобы покупатель сразу видел условия сделки.</Text></Card>{renderFields(priceFields)}<Text variant="label">Валюта</Text><SegmentedControl value={watched.currency ?? defaults.currency} onChange={value => setValue('currency', value as Values['currency'])} options={['USD', 'UZS', 'EUR'].map(id => ({ id, label: id }))} /><Text variant="label">Тип цены</Text><SegmentedControl value={watched.priceType ?? defaults.priceType} onChange={value => setValue('priceType', value as Values['priceType'])} options={[{ id: 'fixed', label: 'Фиксированная цена' }, { id: 'negotiable', label: 'Возможен торг' }]} /><Text variant="label">Связь с покупателем</Text><SegmentedControl value={watched.contactPreference ?? defaults.contactPreference} onChange={value => setValue('contactPreference', value as Values['contactPreference'])} options={[{ id: 'in_app', label: 'В приложении' }, { id: 'request', label: 'Через заявку' }]} /></> : null}<InlineError error={save.error} /><Row style={{ alignItems: 'stretch' }}>{step > 0 ? <Button title="Назад" variant="outline" onPress={goBack} style={{ flex: 0.7 }} /> : null}<Button title={step === 2 ? 'Проверить объявление' : 'Продолжить'} onPress={step === 2 ? handleSubmit(values => setPreview(values)) : goNext} style={{ flex: 1 }} /></Row><BottomSheet open={!!preview} onClose={() => setPreview(null)} title="Проверьте объявление перед публикацией">{preview ? <Card><Text variant="title" style={{ fontSize: 30, lineHeight: 34 }}>{preview.title}</Text><Text variant="heading">{preview.price} {preview.currency}</Text><Text>{preview.description || 'Описание не заполнено'}</Text><Text variant="caption" color="#617783">{preview.location} · {preview.priceType === 'negotiable' ? 'Возможен торг' : 'Фиксированная цена'}</Text><Text>После отправки объявление пройдёт модерацию.</Text><InlineError error={save.error} /><Button title="Отправить на модерацию" loading={save.isPending} onPress={() => save.mutate(preview)} /></Card> : null}</BottomSheet></Screen>;
}
