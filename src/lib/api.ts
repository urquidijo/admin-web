import axios from "axios";

// Lee la env pública de Next
const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

if (!BASE_URL) {
  console.warn("⚠️ NEXT_PUBLIC_API_URL no está definida");
}

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000, // 15 segundos
});

// --- Interceptor: agrega token si existe ---
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token"); // guarda el token del login
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// --- Interceptor: manejo global de errores (opcional) ---
api.interceptors.response.use(
  (res) => res,
  (err) => {
    console.error("❌ API Error:", err.response?.data || err.message);
    return Promise.reject(err);
  }
);
