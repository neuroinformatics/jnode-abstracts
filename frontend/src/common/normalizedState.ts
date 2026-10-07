export interface NormalizedState<T, K extends string | number | symbol> {
  byId: Record<K, T>;
  allIds: K[];
}
