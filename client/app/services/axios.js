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
  const cognitoToken = 'eyJraWQiOiJaYWFLNjlsZlQ2WTJCTEFpV0FFUXh2akErZnJacEdkT1ppbVdYMTF5bENvPSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiI1ZjFiZWQwNy05YzY3LTQ0YzEtYTU2Ny1kZmMwNmQwNzRlNTYiLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiaHR0cHM6XC9cL2hhc3VyYS5pb1wvand0XC9jbGFpbXMiOiJ7XCJ4LWhhc3VyYS1hbGxvd2VkLXJvbGVzXCI6W1wiYWRtaW5cIixcInN0b3JlXCIsXCJ1c2VyXCJdLFwieC1oYXN1cmEtZGVmYXVsdC1yb2xlXCI6XCJhZG1pblwiLFwieC1oYXN1cmEtdXNlci1pZFwiOlwiNWYxYmVkMDctOWM2Ny00NGMxLWE1NjctZGZjMDZkMDc0ZTU2XCIsXCJ4LWhhc3VyYS11c2VyLWVtYWlsXCI6XCJrZXZpbi5pZmVzaW5hY2hpLWFkbWluQGNvZHlnby5jb21cIixcIngtaGFzdXJhLWFsbG93ZWQtc3RvcmVzXCI6XCJ7XFxcImtldmluc3RvcmVcXFwifVwifSIsImN1c3RvbTphZG1pbiI6IlRydWUiLCJpc3MiOiJodHRwczpcL1wvY29nbml0by1pZHAuZXUtY2VudHJhbC0xLmFtYXpvbmF3cy5jb21cL2V1LWNlbnRyYWwtMV9UTUNxZjUzYjYiLCJjb2duaXRvOnVzZXJuYW1lIjoiNWYxYmVkMDctOWM2Ny00NGMxLWE1NjctZGZjMDZkMDc0ZTU2Iiwib3JpZ2luX2p0aSI6ImI5MjM5NWU0LWQ2MWEtNDYwYi1hYzgzLWNmMmU3YTFmNzcyMCIsImF1ZCI6IjVqcjVxZnFraDc3b3QxcDdlNWYxczQ2ZDlzIiwiY3VzdG9tOnN0b3JlcyI6Imtldmluc3RvcmUiLCJldmVudF9pZCI6IjM3NzBkODI3LTIzZDQtNDAxOS1hNTk4LWIzYzBmZTNkMmViZiIsInRva2VuX3VzZSI6ImlkIiwiYXV0aF90aW1lIjoxNjg5MDAwMzc4LCJuYW1lIjoiS2V2aW4gQWRtaW4iLCJleHAiOjE2ODkwMDM5NzgsImlhdCI6MTY4OTAwMDM3OCwianRpIjoiMDliYTE4OTQtNDA2MC00MjNiLWE4YTgtZDVmMTZlOGYyZmVkIiwiZW1haWwiOiJrZXZpbi5pZmVzaW5hY2hpLWFkbWluQGNvZHlnby5jb20ifQ.KL6KddnhUpNYhrjL_dlnup-4LXzWjEil_oZI9mPw-_S8wbrUSwonmLHqALeb0OqiJDqoyZ6izDPaH4_Ffuu35qmddxYr4xDOJ6Qi-2U0HQp2_v0MUl_TlbvKFWDyyVjsseGQ_t7QmaBTPyXHtkIlW8YaMbCPgXki6MdNeQ0BqxN9kxDm3Ag9H9_0HA6wkrxUkXW0Nrdn-MBbiuy7Eq_pmFDKc4Gs145-FEUbbLqFNnDkhO0zY5oIFIaoJTeSICRXd2YRVH_76j-s7im_azQHAO89hSHMXG4vvULWCZu6e4VCURbAllX3vh4XQl76IP-Pe2TFebzN0hZ5XFfNri5t9w';
  if (apiKey) {
    config.headers.Authorization = `Key ${cognitoToken}__${apiKey}`;
  }

  return config;
});
