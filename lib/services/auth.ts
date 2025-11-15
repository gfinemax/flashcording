/**
 * Authentication API Service
 * Handles user authentication with Django backend
 */

import { apiClient } from "@/lib/api/client"

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  username: string
  password: string
}

export interface AuthResponse {
  access_token: string
  refresh_token: string
  user: {
    id: string
    email: string
    username: string
    level: number
    exp: number
    avatar?: string
  }
}

export interface RefreshTokenRequest {
  refresh_token: string
}

export interface RefreshTokenResponse {
  access_token: string
}

/**
 * Login with email and password
 */
export async function login(data: LoginRequest): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>("/api/users/login", data)
  return response.data
}

/**
 * Register a new user
 */
export async function register(data: RegisterRequest): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>("/api/users/register", data)
  return response.data
}

/**
 * Refresh access token
 */
export async function refreshToken(data: RefreshTokenRequest): Promise<RefreshTokenResponse> {
  const response = await apiClient.post<RefreshTokenResponse>("/api/users/refresh", data)
  return response.data
}

/**
 * Logout user (clear tokens)
 */
export async function logout(): Promise<void> {
  // Call backend logout endpoint if needed
  await apiClient.post("/api/users/logout")
}

/**
 * Get current user profile
 */
export async function getCurrentUser(): Promise<AuthResponse["user"]> {
  const response = await apiClient.get<AuthResponse["user"]>("/api/users/me")
  return response.data
}
