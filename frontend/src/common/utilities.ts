export const arrayIncludes = <T extends ReadonlyArray<unknown>>(array: T, input: unknown): input is T[number] => {
  return array.includes(input);
};
