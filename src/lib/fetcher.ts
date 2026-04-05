const defaultHeaders = {
  'content-type': 'application/json;charset-UTF-8',
  accept: 'application/json,',
  authorization: import.meta.env.VITE_LOA_API_KEY,
};

const defaultOptions: RequestInit = {
  headers: defaultHeaders,
};
const defaultURL = '/api';
export const fetcher = async (input: URL | RequestInfo, init?: RequestInit) => {
  return fetch(defaultURL + input, { ...defaultOptions, ...init });
};
