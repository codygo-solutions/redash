import { Auth } from "@/services/auth"
import { restoreSession } from "@/services/restoreSession"
import axiosLib from "axios"
import createAuthRefreshInterceptor from "axios-auth-refresh"
import { get, includes } from "lodash"
import qs from "query-string"

export const axios = axiosLib.create({
  paramsSerializer: params => qs.stringify(params),
  xsrfCookieName: "csrf_token",
  xsrfHeaderName: "X-CSRF-TOKEN",
});

axios.interceptors.response.use(response => response.data);

export const csrfRefreshInterceptor = createAuthRefreshInterceptor(
  axios,
  error => {
    const message = get(error, "response.data.message");
    if (error.isAxiosError && includes(message, "CSRF")) {
      return axios.get("/ping");
    } else {
      return Promise.reject(error);
    }
  },
  { statusCodes: [400] }
);

export const sessionRefreshInterceptor = createAuthRefreshInterceptor(
  axios,
  error => {
    const status = parseInt(get(error, "response.status"));
    const message = get(error, "response.data.message");
    // TODO: In axios@0.9.1 this check could be replaced with { skipAuthRefresh: true } flag. See axios-auth-refresh docs
    const requestUrl = get(error, "config.url");
    if (error.isAxiosError && (status === 401 || includes(message, "Please login")) && requestUrl !== "api/session") {
      return restoreSession();
    }
    return Promise.reject(error);
  },
  {
    statusCodes: [401, 404],
    pauseInstanceWhileRefreshing: false, // According to docs, `false` is default value, but in fact it's not :-)
  }
);

axios.interceptors.request.use(config => {
  const apiKey = Auth.getApiKey();
  const cognitoToken = 'eyJraWQiOiI2VzN4TmRWQ0p1N29qajAyUzQ4RDNXd2xoZ01OS0Y0aUo1aU45OStVT0RzPSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiI5YzdhYzMzOC0xZmE1LTQzYmYtYmM2My0wYjJhZjFiMjdjOTAiLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiaXNzIjoiaHR0cHM6XC9cL2NvZ25pdG8taWRwLnVzLWVhc3QtMS5hbWF6b25hd3MuY29tXC91cy1lYXN0LTFfcWFyT04zSXZQIiwiY29nbml0bzp1c2VybmFtZSI6IjljN2FjMzM4LTFmYTUtNDNiZi1iYzYzLTBiMmFmMWIyN2M5MCIsIm9yaWdpbl9qdGkiOiJlMDI4NDdjNi1lMGZmLTQ3ZWItOTIyYS02OTUxYzQ0N2ZmZTMiLCJhdWQiOiI2c2M5ZzEzamRzMWQ5YmswY2JvMHUwZWMyMSIsImV2ZW50X2lkIjoiMTFjNDc0OGItMzRmMy00NjZiLWI2ODEtZjY3NGM5ZThmZjViIiwidG9rZW5fdXNlIjoiaWQiLCJhdXRoX3RpbWUiOjE2ODkwMDIzNDEsIm5hbWUiOiJMYXdyZW5jZSBOd29rbyIsImN1c3RvbTp0ZW5hbnQiOiJjb2R5Z28iLCJleHAiOjE2ODkwMDU5NDEsImlhdCI6MTY4OTAwMjM0MSwianRpIjoiYzZmOGM2MmQtNTJlYi00ZWJhLTk3MjItNDZhZThjNTNkY2YyIiwiZW1haWwiOiJsYXdyZW5jZS5ud29rb0Bjb2R5Z28uY29tIn0.lBVp3XxQ_BtS-X7e_wylSGHzGxBZeIBbNUk8LZaMAu3dUlqe9glnJWnSptzYDSHZsPDtjSCgz34qzlg7PYCFxZrm4GN-ZgPVV6WSNINelPXOZEEx6i_gO3Pbq_EeMRONg-_CNGE-wEDbGd7XM9HGzEhXykGVW8XxkVgT_sgp8prkeHDFhHun--OULx3afeVljP_dzJiojkuuzFogC61WOQKKqwTHsCysb5p7E6wrnfldmWOTYSsBvSyu357YGjmRvrmBHGKmnXEKTX7atg7-42vSbLEfbNMlD81imQLHvK3AlBzbrVPdo33OesjWhIJK-aZXZtyS0Kjz4aocJaSHog';
  if (apiKey) {
    config.headers.Authorization = `Key ${cognitoToken}__${apiKey}`;
  }

  return config;
});
