import axios, { AxiosResponse } from "axios";
export interface responsePayload {
  success: boolean;
  result: any;
  message: string;
}
const responseBody = (response: AxiosResponse) => response.data;
const request = {
  get: (url: string) =>
    axios.get(process.env.NEXT_PUBLIC_BASE_API_PREFIX + url).then(responseBody),

  post: (url: string, body: {}) =>
    axios
      .post(process.env.NEXT_PUBLIC_BASE_API_PREFIX + url, body)
      .then(responseBody),

  put: (url: string, body: {}) =>
    axios
      .put(process.env.NEXT_PUBLIC_BASE_API_PREFIX + url, body)
      .then(responseBody),

  del: (url: string) =>
    axios
      .delete(process.env.NEXT_PUBLIC_BASE_API_PREFIX + url)
      .then(responseBody),

  patch: (url: string, body: {}) =>
    axios
      .patch(process.env.NEXT_PUBLIC_BASE_API_PREFIX + url, body)
      .then(responseBody),
};
const Api = {
  get: async (url: string) => {
    try {
      return await request.get(url);
    } catch (error) {
      throw error;
    }
  },
  post: async (url: string, body: {}) => {
    try {
      return await request.post(url, body);
    } catch (error) {
      throw error;
    }
  },
  put: async (url: string, body: {}) => {
    try {
      return await request.put(url, body);
    } catch (error) {
      throw error;
    }
  },

  del: async (url: string) => {
    try {
      return await request.del(url);
    } catch (error) {
      throw error;
    }
  },
  patch: async (url: string, body: {}) => {
    try {
      return await request.patch(url, body);
    } catch (error) {
      throw error;
    }
  },
};
export default Api;
