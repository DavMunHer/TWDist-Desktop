export function toRecord<T extends { id: string }>(
  items: readonly T[]
): Record<string, T> {
  return items.reduce<Record<string, T>>((acc, item) => {
    acc[item.id] = item;
    return acc;
  }, {});
}
