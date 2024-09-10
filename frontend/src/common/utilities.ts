export const arrayIncludes = <T extends ReadonlyArray<unknown>>(array: T, input: unknown): input is T[number] => {
  return array.includes(input);
};

export const base64encode = (data: Uint8Array) => {
  return btoa(String.fromCharCode(...data));
};

export const base64decode = (data: string) => {
  return Uint8Array.from(atob(data), (s) => s.charCodeAt(0));
};
