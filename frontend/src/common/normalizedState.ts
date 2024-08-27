export interface NormalizedState<T, K extends string | number | symbol> {
  byId: Record<K, T>;
  allIds: K[];
}

export const getNormalizedState = <T, K extends string | number | symbol, P = T>(
  items: T[],
  key: keyof T,
  transform: (i: T) => P = (i) => i as unknown as P,
): NormalizedState<P, K> => {
  const ret: NormalizedState<P, K> = { byId: {} as Record<K, P>, allIds: [] };
  items.forEach((item) => {
    const id = item[key] as K;
    ret.byId[id] = transform(item);
    ret.allIds.push(id);
  });
  return ret;
};
