import axios, { AxiosError, InternalAxiosRequestConfig, AxiosResponse } from "axios"
import { env } from "@/lib/env"

const API_BASE_URL = `${env.apiUrl}/api`

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
})

// LLM API client for AI features
export const llmClient = axios.create({
  baseURL: env.llmApiUrl,
  timeout: 30000, // Longer timeout for LLM requests
  headers: {
    "Content-Type": "application/json",
  },
})

// Request interceptor to add auth token
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("access_token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
})

// LLM client interceptor
llmClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (env.openaiApiKey && config.url?.includes("openai")) {
    config.headers.Authorization = `Bearer ${env.openaiApiKey}`
  }
  return config
})

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token refresh logic
      if (typeof window !== "undefined") {
        const refreshToken = localStorage.getItem("refresh_token")
        if (refreshToken) {
          try {
            const { data } = await axios.post(`${API_BASE_URL}/users/refresh`, {
              refresh_token: refreshToken,
            })
            localStorage.setItem("access_token", data.access_token)
            if (error.config) {
              error.config.headers.Authorization = `Bearer ${data.access_token}`
              return apiClient.request(error.config)
            }
          } catch (refreshError) {
            localStorage.clear()
            window.location.href = "/login"
          }
        }
      }
    }
    return Promise.reject(error)
  },
)
