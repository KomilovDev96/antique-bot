import { useQuery } from '@tanstack/react-query';
import { catalogApi } from '../../shared/api/services';
import { Chip, Field, InlineError, Row, Text } from '../../shared/ui/core';
export function CategoryFields({ categoryId, setCategoryId, attributes, setAttributes }: { categoryId: string; setCategoryId: (id: string) => void; attributes: Record<string, string>; setAttributes: (v: Record<string, string>) => void }) {
  const categories = useQuery({ queryKey: ['categories'], queryFn: ({ signal }) => catalogApi.categories(signal) });
  const category = categories.data?.find(c => c.id === categoryId);
  return <><Text variant="label">Категория</Text><InlineError error={categories.error} /><Row style={{ flexWrap: 'wrap' }}>{categories.data?.map(c => <Chip key={c.id} label={c.name} selected={categoryId === c.id} onPress={() => { setCategoryId(c.id); setAttributes({}); }} />)}</Row>{category?.attributes.map(a => a.type === 'select' ? <Row key={a.key} style={{ flexWrap: 'wrap' }}><Text>{a.label}{a.required ? ' *' : ''}</Text>{a.options?.map(o => <Chip key={o} label={o} selected={attributes[a.key] === o} onPress={() => setAttributes({ ...attributes, [a.key]: o })} />)}</Row> : <Field key={a.key} label={`${a.label}${a.unit ? `, ${a.unit}` : ''}${a.required ? ' *' : ''}`} value={attributes[a.key] ?? ''} keyboardType={a.type === 'number' ? 'decimal-pad' : 'default'} onChangeText={v => setAttributes({ ...attributes, [a.key]: v })} />)}</>;
}
