export const jsonParseFromCache = <T = Record<string, any>>(data: string) =>
  data == '' || data == null ? null : <T>JSON.parse(data);
