// import axios from "axios";

// function buildDefaultApiBaseUrl() {
//   if (typeof window === "undefined") {
//     return "/api/";
//   }

//   return new URL("/api/", window.location.origin).toString();
// }

// function normalizeApiBaseUrl(value) {
//   if (!value) {
//     return buildDefaultApiBaseUrl();
//   }

//   const normalizedValue = value.endsWith("/") ? value : `${value}/`;

//   if (typeof window === "undefined") {
//     return normalizedValue;
//   }

//   return new URL(normalizedValue, window.location.origin).toString();
// }

// export const API_BASE_URL = normalizeApiBaseUrl(
//   import.meta.env.VITE_API_BASE_URL || buildDefaultApiBaseUrl()
// );
// export const APP_BASE_PATH = import.meta.env.BASE_URL || "/";
// export const ACCESS_TOKEN_KEY = "petty-cash-access";
// export const REFRESH_TOKEN_KEY = "petty-cash-refresh";
// export const AUTH_LOGOUT_EVENT = "petty-cash-auth-logout";
// const authStorage = window.sessionStorage;
// const legacySharedStorage = window.localStorage;

// export function buildAbsoluteUrl(path = "") {
//   if (!path) {
//     return "";
//   }

//   return new URL(String(path), API_BASE_URL).toString();
// }

// export function getAccessToken() {
//   return authStorage.getItem(ACCESS_TOKEN_KEY);
// }

// export function getRefreshToken() {
//   return authStorage.getItem(REFRESH_TOKEN_KEY);
// }

// export function setAuthTokens({ access, refresh }) {
//   if (access) {
//     authStorage.setItem(ACCESS_TOKEN_KEY, access);
//     legacySharedStorage.removeItem(ACCESS_TOKEN_KEY);
//   }

//   if (refresh) {
//     authStorage.setItem(REFRESH_TOKEN_KEY, refresh);
//     legacySharedStorage.removeItem(REFRESH_TOKEN_KEY);
//   }
// }

// export function clearAuthTokens() {
//   authStorage.removeItem(ACCESS_TOKEN_KEY);
//   authStorage.removeItem(REFRESH_TOKEN_KEY);
//   legacySharedStorage.removeItem(ACCESS_TOKEN_KEY);
//   legacySharedStorage.removeItem(REFRESH_TOKEN_KEY);
// }

// export function getListData(data) {
//   if (Array.isArray(data)) {
//     return data;
//   }

//   return data?.results || [];
// }

// function shouldSkipAuthRedirect(url = "") {
//   const path = String(url);
//   return (
//     path.includes("/auth/login/") ||
//     path.includes("/auth/refresh/") ||
//     path.includes("/auth/me/")
//   );
// }

// const axiosInstance = axios.create({
//   baseURL: API_BASE_URL,
// });

// axiosInstance.interceptors.request.use((config) => {
//   const token = getAccessToken();

//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }

//   return config;
// });

// axiosInstance.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     const originalRequest = error.config;
//     const refresh = getRefreshToken();
//     const requestUrl = String(originalRequest?.url || "");

//     if (
//       error.response?.status === 401 &&
//       refresh &&
//       !originalRequest?._retry &&
//       !requestUrl.includes("/auth/refresh/") &&
//       !requestUrl.includes("/auth/login/")
//     ) {
//       originalRequest._retry = true;

//       try {
//         const refreshResponse = await axios.post(`${API_BASE_URL}auth/refresh/`, {
//           refresh,
//         });

//         setAuthTokens({
//           access: refreshResponse.data.access,
//           refresh: refreshResponse.data.refresh || refresh,
//         });

//         originalRequest.headers = originalRequest.headers || {};
//         originalRequest.headers.Authorization = `Bearer ${refreshResponse.data.access}`;
//         return axiosInstance(originalRequest);
//       } catch (refreshError) {
//         clearAuthTokens();
//         window.dispatchEvent(new CustomEvent(AUTH_LOGOUT_EVENT));
//         if (!shouldSkipAuthRedirect(requestUrl)) {
//           window.location.href = "/login";
//         }
//         return Promise.reject(refreshError);
//       }
//     }

//     if (error.response?.status === 401 && !shouldSkipAuthRedirect(requestUrl)) {
//       clearAuthTokens();
//       window.dispatchEvent(new CustomEvent(AUTH_LOGOUT_EVENT));
//       window.location.href = "/login";
//     }

//     return Promise.reject(error);
//   }
// );

// export default axiosInstance;






// import axios from "axios";

// function buildDefaultApiBaseUrl() {
//   if (typeof window === "undefined") {
//     return "/api/";
//   }

//   return new URL("/api/", window.location.origin).toString();
// }

// function normalizeApiBaseUrl(value) {
//   if (!value) {
//     return buildDefaultApiBaseUrl();
//   }

//   const normalizedValue = value.endsWith("/") ? value : `${value}/`;

//   if (typeof window === "undefined") {
//     return normalizedValue;
//   }

//   return new URL(normalizedValue, window.location.origin).toString();
// }

// export const API_BASE_URL = "http://127.0.0.1:8000/api/";
// export const APP_BASE_PATH = import.meta.env.BASE_URL || "/";
// export const ACCESS_TOKEN_KEY = "petty-cash-access";
// export const REFRESH_TOKEN_KEY = "petty-cash-refresh";
// export const AUTH_LOGOUT_EVENT = "petty-cash-auth-logout";
// const authStorage = window.sessionStorage;
// const legacySharedStorage = window.localStorage;

// export function buildAbsoluteUrl(path = "") {
//   if (!path) {
//     return "";
//   }

//   return new URL(String(path), API_BASE_URL).toString();
// }

// export function getAccessToken() {
//   return authStorage.getItem(ACCESS_TOKEN_KEY);
// }

// export function getRefreshToken() {
//   return authStorage.getItem(REFRESH_TOKEN_KEY);
// }

// export function setAuthTokens({ access, refresh }) {
//   if (access) {
//     authStorage.setItem(ACCESS_TOKEN_KEY, access);
//     legacySharedStorage.removeItem(ACCESS_TOKEN_KEY);
//   }

//   if (refresh) {
//     authStorage.setItem(REFRESH_TOKEN_KEY, refresh);
//     legacySharedStorage.removeItem(REFRESH_TOKEN_KEY);
//   }
// }

// export function clearAuthTokens() {
//   authStorage.removeItem(ACCESS_TOKEN_KEY);
//   authStorage.removeItem(REFRESH_TOKEN_KEY);
//   legacySharedStorage.removeItem(ACCESS_TOKEN_KEY);
//   legacySharedStorage.removeItem(REFRESH_TOKEN_KEY);
// }

// export function getListData(data) {
//   if (Array.isArray(data)) {
//     return data;
//   }

//   return data?.results || [];
// }

// function shouldSkipAuthRedirect(url = "") {
//   const path = String(url);
//   return (
//     path.includes("/auth/login/") ||
//     path.includes("/auth/refresh/") ||
//     path.includes("/auth/me/")
//   );
// }

// const axiosInstance = axios.create({
//   baseURL: API_BASE_URL,
// });

// axiosInstance.interceptors.request.use((config) => {
//   const token = getAccessToken();

//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }

//   return config;
// });

// axiosInstance.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     const originalRequest = error.config;
//     const refresh = getRefreshToken();
//     const requestUrl = String(originalRequest?.url || "");

//     if (
//       error.response?.status === 401 &&
//       refresh &&
//       !originalRequest?._retry &&
//       !requestUrl.includes("/auth/refresh/") &&
//       !requestUrl.includes("/auth/login/")
//     ) {
//       originalRequest._retry = true;

//       try {
//         const refreshResponse = await axios.post(`${API_BASE_URL}auth/refresh/`, {
//           refresh,
//         });

//         setAuthTokens({
//           access: refreshResponse.data.access,
//           refresh: refreshResponse.data.refresh || refresh,
//         });

//         originalRequest.headers = originalRequest.headers || {};
//         originalRequest.headers.Authorization = `Bearer ${refreshResponse.data.access}`;
//         return axiosInstance(originalRequest);
//       } catch (refreshError) {
//         clearAuthTokens();
//         window.dispatchEvent(new CustomEvent(AUTH_LOGOUT_EVENT));
//         if (!shouldSkipAuthRedirect(requestUrl)) {
//           window.location.href = "/login";
//         }
//         return Promise.reject(refreshError);
//       }
//     }

//     if (error.response?.status === 401 && !shouldSkipAuthRedirect(requestUrl)) {
//       clearAuthTokens();
//       window.dispatchEvent(new CustomEvent(AUTH_LOGOUT_EVENT));
//       window.location.href = "/login";
//     }

//     return Promise.reject(error);
//   }
// );

// export default axiosInstance;









// import axios from "axios";

// function buildDefaultApiBaseUrl() {
//   if (typeof window === "undefined") {
//     return "/api/";
//   }

//   return new URL("/api/", window.location.origin).toString();
// }

// function normalizeApiBaseUrl(value) {
//   if (!value) {
//     return buildDefaultApiBaseUrl();
//   }

//   const normalizedValue = value.endsWith("/") ? value : `${value}/`;

//   if (typeof window === "undefined") {
//     return normalizedValue;
//   }

//   return new URL(normalizedValue, window.location.origin).toString();
// }

// export const API_BASE_URL = "http://127.0.0.1:8000/api/";
// export const APP_BASE_PATH = "/";
// export const ACCESS_TOKEN_KEY = "petty-cash-access";
// export const REFRESH_TOKEN_KEY = "petty-cash-refresh";
// export const AUTH_LOGOUT_EVENT = "petty-cash-auth-logout";
// const authStorage = window.sessionStorage;
// const legacySharedStorage = window.localStorage;

// export function buildAbsoluteUrl(path = "") {
//   if (!path) {
//     return "";
//   }

//   return new URL(String(path), API_BASE_URL).toString();
// }

// export function getAccessToken() {
//   return authStorage.getItem(ACCESS_TOKEN_KEY);
// }

// export function getRefreshToken() {
//   return authStorage.getItem(REFRESH_TOKEN_KEY);
// }

// export function setAuthTokens({ access, refresh }) {
//   if (access) {
//     authStorage.setItem(ACCESS_TOKEN_KEY, access);
//     legacySharedStorage.removeItem(ACCESS_TOKEN_KEY);
//   }

//   if (refresh) {
//     authStorage.setItem(REFRESH_TOKEN_KEY, refresh);
//     legacySharedStorage.removeItem(REFRESH_TOKEN_KEY);
//   }
// }

// export function clearAuthTokens() {
//   authStorage.removeItem(ACCESS_TOKEN_KEY);
//   authStorage.removeItem(REFRESH_TOKEN_KEY);
//   legacySharedStorage.removeItem(ACCESS_TOKEN_KEY);
//   legacySharedStorage.removeItem(REFRESH_TOKEN_KEY);
// }

// export function getListData(data) {
//   if (Array.isArray(data)) {
//     return data;
//   }

//   return data?.results || [];
// }

// function shouldSkipAuthRedirect(url = "") {
//   const path = String(url);
//   return (
//     path.includes("/auth/login/") ||
//     path.includes("/auth/refresh/") ||
//     path.includes("/auth/me/")
//   );
// }

// const axiosInstance = axios.create({
//   baseURL: API_BASE_URL,
// });

// axiosInstance.interceptors.request.use((config) => {
//   const token = getAccessToken();

//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }

//   return config;
// });

// axiosInstance.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     const originalRequest = error.config;
//     const refresh = getRefreshToken();
//     const requestUrl = String(originalRequest?.url || "");

//     if (
//       error.response?.status === 401 &&
//       refresh &&
//       !originalRequest?._retry &&
//       !requestUrl.includes("/auth/refresh/") &&
//       !requestUrl.includes("/auth/login/")
//     ) {
//       originalRequest._retry = true;

//       try {
//         const refreshResponse = await axios.post(`${API_BASE_URL}auth/refresh/`, {
//           refresh,
//         });

//         setAuthTokens({
//           access: refreshResponse.data.access,
//           refresh: refreshResponse.data.refresh || refresh,
//         });

//         originalRequest.headers = originalRequest.headers || {};
//         originalRequest.headers.Authorization = `Bearer ${refreshResponse.data.access}`;
//         return axiosInstance(originalRequest);
//       } catch (refreshError) {
//         clearAuthTokens();
//         window.dispatchEvent(new CustomEvent(AUTH_LOGOUT_EVENT));
//         if (!shouldSkipAuthRedirect(requestUrl)) {
//           window.location.href = "/login";
//         }
//         return Promise.reject(refreshError);
//       }
//     }

//     if (error.response?.status === 401 && !shouldSkipAuthRedirect(requestUrl)) {
//       clearAuthTokens();
//       window.dispatchEvent(new CustomEvent(AUTH_LOGOUT_EVENT));
//       window.location.href = "/login";
//     }

//     return Promise.reject(error);
//   }
// );

// export default axiosInstance;








// import axios from "axios";

// function buildDefaultApiBaseUrl() {
//   if (typeof window === "undefined") {
//     return "/api/";
//   }

//   return new URL("/api/", window.location.origin).toString();
// }

// function normalizeApiBaseUrl(value) {
//   if (!value) {
//     return buildDefaultApiBaseUrl();
//   }

//   const normalizedValue = value.endsWith("/") ? value : `${value}/`;

//   if (typeof window === "undefined") {
//     return normalizedValue;
//   }

//   return new URL(normalizedValue, window.location.origin).toString();
// }

// export const API_BASE_URL = "http://127.0.0.1:8000/api/";
// export const APP_BASE_PATH = "/";
// export const ACCESS_TOKEN_KEY = "petty-cash-access";
// export const REFRESH_TOKEN_KEY = "petty-cash-refresh";
// export const AUTH_LOGOUT_EVENT = "petty-cash-auth-logout";
// const authStorage = window.sessionStorage;
// const legacySharedStorage = window.localStorage;

// export function buildAbsoluteUrl(path = "") {
//   if (!path) {
//     return "";
//   }

//   return new URL(String(path), API_BASE_URL).toString();
// }

// export function getAccessToken() {
//   return authStorage.getItem(ACCESS_TOKEN_KEY);
// }

// export function getRefreshToken() {
//   return authStorage.getItem(REFRESH_TOKEN_KEY);
// }

// export function setAuthTokens({ access, refresh }) {
//   if (access) {
//     authStorage.setItem(ACCESS_TOKEN_KEY, access);
//     legacySharedStorage.removeItem(ACCESS_TOKEN_KEY);
//   }

//   if (refresh) {
//     authStorage.setItem(REFRESH_TOKEN_KEY, refresh);
//     legacySharedStorage.removeItem(REFRESH_TOKEN_KEY);
//   }
// }

// export function clearAuthTokens() {
//   authStorage.removeItem(ACCESS_TOKEN_KEY);
//   authStorage.removeItem(REFRESH_TOKEN_KEY);
//   legacySharedStorage.removeItem(ACCESS_TOKEN_KEY);
//   legacySharedStorage.removeItem(REFRESH_TOKEN_KEY);
// }

// export function getListData(data) {
//   if (Array.isArray(data)) {
//     return data;
//   }

//   return data?.results || [];
// }

// function shouldSkipAuthRedirect(url = "") {
//   const path = String(url);
//   return (
//     path.includes("/auth/login/") ||
//     path.includes("/auth/refresh/") ||
//     path.includes("/auth/me/")
//   );
// }

// const axiosInstance = axios.create({
//   baseURL: API_BASE_URL,
// });

// axiosInstance.interceptors.request.use((config) => {
//   const token = getAccessToken();

//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }

//   return config;
// });

// axiosInstance.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     const originalRequest = error.config;
//     const refresh = getRefreshToken();
//     const requestUrl = String(originalRequest?.url || "");

//     if (
//       error.response?.status === 401 &&
//       refresh &&
//       !originalRequest?._retry &&
//       !requestUrl.includes("/auth/refresh/") &&
//       !requestUrl.includes("/auth/login/")
//     ) {
//       originalRequest._retry = true;

//       try {
//         const refreshResponse = await axios.post(`${API_BASE_URL}auth/refresh/`, {
//           refresh,
//         });

//         setAuthTokens({
//           access: refreshResponse.data.access,
//           refresh: refreshResponse.data.refresh || refresh,
//         });

//         originalRequest.headers = originalRequest.headers || {};
//         originalRequest.headers.Authorization = `Bearer ${refreshResponse.data.access}`;
//         return axiosInstance(originalRequest);
//       } catch (refreshError) {
//         clearAuthTokens();
//         window.dispatchEvent(new CustomEvent(AUTH_LOGOUT_EVENT));
//         if (!shouldSkipAuthRedirect(requestUrl)) {
//   console.log("401 error - staying on dashboard");
// }
//         return Promise.reject(refreshError);
//       }
//     }

//     if (error.response?.status === 401 && !shouldSkipAuthRedirect(requestUrl)) {
//       clearAuthTokens();
//       window.dispatchEvent(new CustomEvent(AUTH_LOGOUT_EVENT));
//       window.location.href = "/login";
//     }

//     return Promise.reject(error);
//   }
// );

// export default axiosInstance;









import axios from "axios";

function buildDefaultApiBaseUrl() {
  if (typeof window === "undefined") {
    return "/api/";
  }

  return new URL("/api/", window.location.origin).toString();
}

function normalizeApiBaseUrl(value) {
  if (!value) {
    return buildDefaultApiBaseUrl();
  }

  const normalizedValue = value.endsWith("/") ? value : `${value}/`;

  if (typeof window === "undefined") {
    return normalizedValue;
  }

  return new URL(normalizedValue, window.location.origin).toString();
}

export const API_BASE_URL = "http://127.0.0.1:8000/api/";
export const APP_BASE_PATH = "/";
export const ACCESS_TOKEN_KEY = "petty-cash-access";
export const REFRESH_TOKEN_KEY = "petty-cash-refresh";
export const AUTH_LOGOUT_EVENT = "petty-cash-auth-logout";
const authStorage = window.sessionStorage;
const legacySharedStorage = window.localStorage;

export function buildAbsoluteUrl(path = "") {
  if (!path) {
    return "";
  }

  return new URL(String(path), API_BASE_URL).toString();
}

export function getAccessToken() {
  return authStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken() {
  return authStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setAuthTokens({ access, refresh }) {
  if (access) {
    authStorage.setItem(ACCESS_TOKEN_KEY, access);
    legacySharedStorage.removeItem(ACCESS_TOKEN_KEY);
  }

  if (refresh) {
    authStorage.setItem(REFRESH_TOKEN_KEY, refresh);
    legacySharedStorage.removeItem(REFRESH_TOKEN_KEY);
  }
}

export function clearAuthTokens() {
  authStorage.removeItem(ACCESS_TOKEN_KEY);
  authStorage.removeItem(REFRESH_TOKEN_KEY);
  legacySharedStorage.removeItem(ACCESS_TOKEN_KEY);
  legacySharedStorage.removeItem(REFRESH_TOKEN_KEY);
}

export function getListData(data) {
  if (Array.isArray(data)) {
    return data;
  }

  return data?.results || [];
}

function shouldSkipAuthRedirect(url = "") {
  const path = String(url);
  return (
    path.includes("/auth/login/") ||
    path.includes("/auth/refresh/") ||
    path.includes("/auth/me/")
  );
}

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
});

axiosInstance.interceptors.request.use((config) => {
  const token = getAccessToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const refresh = getRefreshToken();
    const requestUrl = String(originalRequest?.url || "");

    if (
      error.response?.status === 401 &&
      refresh &&
      !originalRequest?._retry &&
      !requestUrl.includes("/auth/refresh/") &&
      !requestUrl.includes("/auth/login/")
    ) {
      originalRequest._retry = true;

      try {
        const refreshResponse = await axios.post(`${API_BASE_URL}auth/refresh/`, {
          refresh,
        });

        setAuthTokens({
          access: refreshResponse.data.access,
          refresh: refreshResponse.data.refresh || refresh,
        });

        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${refreshResponse.data.access}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        clearAuthTokens();
        window.dispatchEvent(new CustomEvent(AUTH_LOGOUT_EVENT));
        if (!shouldSkipAuthRedirect(requestUrl)) {
  console.log("401 error - staying on dashboard");
}
        return Promise.reject(refreshError);
      }
    }

    // if (error.response?.status === 401 && !shouldSkipAuthRedirect(requestUrl)) {
    //   clearAuthTokens();
    //   window.dispatchEvent(new CustomEvent(AUTH_LOGOUT_EVENT));
    //   window.location.href = "/login";
    // }
    if (error.response?.status === 401 && !shouldSkipAuthRedirect(requestUrl)) {
  console.log("401 ignored (no redirect)");
  return Promise.reject(error);
}

    return Promise.reject(error);
  }
);

export default axiosInstance;





